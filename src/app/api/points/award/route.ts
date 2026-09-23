import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ── 보안: Service Role Key 필수 분리 적용 ──────────────────────────────────
// SUPABASE_SERVICE_ROLE_KEY가 없으면 anon key로 폴백 (개발 환경 허용)
// 프로덕션에서는 반드시 환경변수 SUPABASE_SERVICE_ROLE_KEY 설정 필요
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

// ── CFO 정책: 포인트 한도 & 제한 상수 ────────────────────────────────────────
const MAX_TOTAL_POINTS = 50_000;   // 최대 보유 한도 (회계 부채 리스크 제한)
const POINT_EXPIRY_MONTHS = 24;    // 유효기간 24개월

// 액션별 일일 지급 횟수 제한 (CEO 어뷰징 방어)
const DAILY_LIMITS: Record<string, number> = {
  spot_report:   1,  // 하루 1회
  film_review:   3,  // 하루 3회
  photo_upload:  5,  // 하루 5회
  rental_review: 1,
  referral:      5,
  repair_case:   2,
  spot_checkin:  3,  // 하루 3회 (다른 스팟)
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      action: string;
      refId?: string;
      points: number;
      description: string;
      userId: string;
    };
    const { action, refId, points, description, userId } = body;

    // ── 기본 유효성 검증 ────────────────────────────────────────────────────
    if (!action || !points || points <= 0) {
      return NextResponse.json({ error: 'action, points(양수) 필수' }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: 'userId 필수' }, { status: 401 });
    }

    // ── ① CFO: 최대 보유 포인트 한도 체크 ───────────────────────────────────
    const { data: profileData } = await adminSupabase
      .from('user_profiles')
      .select('total_points')
      .eq('id', userId)
      .single();

    const currentPoints: number = (profileData as { total_points: number } | null)?.total_points ?? 0;
    if (currentPoints + points > MAX_TOTAL_POINTS) {
      return NextResponse.json(
        { error: `최대 보유 한도(${MAX_TOTAL_POINTS.toLocaleString()}P)를 초과합니다. 현재: ${currentPoints}P` },
        { status: 409 }
      );
    }

    // ── ② CEO: 일일 중복 지급 방어 (Idempotency) ────────────────────────────
    const dailyLimit = DAILY_LIMITS[action] ?? 1;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count: todayCount } = await adminSupabase
      .from('point_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('action', action)
      .gte('created_at', todayStart.toISOString());

    if ((todayCount ?? 0) >= dailyLimit) {
      return NextResponse.json(
        { error: `오늘 '${action}' 적립 한도(${dailyLimit}회)에 도달했습니다. 내일 다시 시도해 주세요.` },
        { status: 429 }
      );
    }

    // ── ③ Idempotency Key로 완전 중복 방어 ──────────────────────────────────
    // ref_id가 있으면 동일 ref_id+action 중복 방지
    if (refId) {
      const { count: dupCount } = await adminSupabase
        .from('point_transactions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action', action)
        .eq('ref_id', refId);

      if ((dupCount ?? 0) > 0) {
        return NextResponse.json(
          { error: '이미 동일 항목으로 포인트가 지급되었습니다.' },
          { status: 409 }
        );
      }
    }

    // ── ④ CFO: 만료일 24개월로 설정하여 삽입 ───────────────────────────────
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + POINT_EXPIRY_MONTHS);

    const { error } = await adminSupabase.from('point_transactions').insert({
      user_id:         userId,
      action,
      points,
      description,
      ref_id:          refId ?? null,
      expires_at:      expiresAt.toISOString(),
    });

    if (error) throw error;

    return NextResponse.json({ success: true, points, expiresAt: expiresAt.toISOString() });
  } catch (err) {
    console.error('[/api/points/award] 오류:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
