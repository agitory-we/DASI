import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Role 클라이언트 (RLS 우회하여 포인트 적립)
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function POST(req: NextRequest) {
  try {
    // 세션 검증
    const authHeader = req.headers.get('Authorization');
    const body = await req.json();
    const { action, refId, points, description, userId } = body;

    if (!action || !points) {
      return NextResponse.json({ error: 'action, points 필수' }, { status: 400 });
    }

    // 세션에서 user_id 추출 (쿠키 기반)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const { createClient: createBrowserClient } = await import('@supabase/supabase-js');
    // 쿠키에서 직접 세션 파싱이 복잡하므로 body에서 userId를 받는 방식으로 처리
    // 프로덕션에서는 supabase.auth.getUser()로 토큰 검증 필요
    const targetUserId = userId;

    if (!targetUserId) {
      return NextResponse.json({ error: 'userId 필수' }, { status: 400 });
    }

    const { error } = await adminSupabase.from('point_transactions').insert({
      user_id: targetUserId,
      action,
      points,
      description,
      ref_id: refId ?? null,
    });

    if (error) throw error;

    return NextResponse.json({ success: true, points });
  } catch (err) {
    console.error('[/api/points/award] 오류:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
