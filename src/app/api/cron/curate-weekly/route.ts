import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { WeeklyPlaygroundPlan } from '@/types';

export const dynamic = 'force-dynamic';

function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return weekNo;
}

function getSeason(month: number): 'spring' | 'summer' | 'autumn' | 'winter' {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const secret = process.env.CRON_SECRET;

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentWeek = getWeekNumber(now);
    const season = getSeason(currentMonth);

    // 1. 현재 진행 중인 축제 데이터 수집 (TourAPI 기반 Supabase events)
    const { data: festivals } = await supabase
      .from('events')
      .select('title, location, area')
      .limit(5);

    const activeFestivalNames = festivals?.map((f) => f.title).join(', ') || '전국 가을 로컬 문화제';

    // 2. 대여 가능한 카메라 목록 수집
    const { data: availableCameras } = await supabase
      .from('cameras')
      .select('name, brand')
      .eq('is_available', true)
      .limit(6);

    const cameraNames = availableCameras?.map((c) => c.name).join(', ') || 'Nikon FM2, Olympus PEN EE-3, Canon QL17';

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    let curatedPlan: WeeklyPlaygroundPlan | null = null;

    // 3. Gemini AI 주간 큐레이터 호출
    if (apiKey) {
      try {
        const prompt = `당신은 대한민국 아날로그 필름 사진 문화와 로컬 출사지를 가장 깊이 이해하는 DASI의 수석 큐레이터입니다.
현재 정보:
- 계절: ${season} (${currentMonth}월 ${currentWeek}주차)
- 진행 중인 축제/행사: ${activeFestivalNames}
- DASI 대여 가능 카메라: ${cameraNames}

위 정보를 분석하여 이번 주말 출사에 가장 완벽한 테마 코스를 추천하는 JSON만 출력하세요. 마크다운이나 백틱 없이 순수 JSON만 출력해야 합니다.
JSON 규격:
{
  "theme": "이번 주말 감성 출사 테마 제목",
  "spotName": "추천 출사 명소 (예: 창경궁 대온실 & 북촌 한옥마을)",
  "region": "서울/수도권 구체적 지역명",
  "recommendedFilm": "추천 필름 모델 (예: Kodak Portra 400)",
  "recommendedCamera": "추천 카메라 기종 (예: Nikon FM2)",
  "highlight": "해당 코스의 사진 촬영 핵심 포인트 및 골든아워 공략 팁",
  "festivalName": "연계된 축제 또는 로컬 이벤트명"
}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
          const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJson);

          curatedPlan = {
            weekNumber: currentWeek,
            month: currentMonth,
            season,
            theme: parsed.theme,
            spotName: parsed.spotName,
            region: parsed.region,
            recommendedFilm: parsed.recommendedFilm,
            recommendedCamera: parsed.recommendedCamera,
            highlight: parsed.highlight,
            meetupCount: 15,
            festivalName: parsed.festivalName || festivals?.[0]?.title,
          };
        }
      } catch (geminiErr) {
        console.warn('[curate-weekly] Gemini AI 호출 실패, 팩트 기반 큐레이션 모델로 전환:', geminiErr);
      }
    }

    // 4. Fallback: 팩트 기반 시즌별 지능형 큐레이션 모델
    if (!curatedPlan) {
      const seasonalDefaults: Record<typeof season, Partial<WeeklyPlaygroundPlan>> = {
        spring: {
          theme: '봄꽃의 은은한 파스텔톤과 한옥 돌담 스냅',
          spotName: '덕수궁 석조전 & 정동 전망대',
          region: '서울 중구',
          recommendedFilm: 'Fuji Pro 400H / Kodak Gold 200',
          recommendedCamera: 'Olympus PEN EE-3',
          highlight: '15:30~17:00 궁궐 창살로 스며드는 부드러운 자연광 활용',
        },
        summer: {
          theme: '녹음 짙은 고궁 연못과 빈티지 온실의 빛',
          spotName: '창경궁 대온실 & 춘당지',
          region: '서울 종로구',
          recommendedFilm: 'Fujicolor C200',
          recommendedCamera: 'Canon Canonet QL17 G-III',
          highlight: '유리온실 격자 프레임을 통한 보케 효과와 물결 윤슬 포착',
        },
        autumn: {
          theme: '붉게 물든 단풍과 노을빛이 깃든 고궁 가을 출사',
          spotName: '경복궁 향원정 & 삼청동 은행나무길',
          region: '서울 종로구',
          recommendedFilm: 'Kodak Portra 400',
          recommendedCamera: 'Nikon FM2 (실버)',
          highlight: '일몰 40분 전 황금빛 사광으로 은행잎 웜톤 극대화',
        },
        winter: {
          theme: '눈 내린 고요한 궁궐과 충무로 인쇄골목의 온기',
          spotName: '북촌 한옥마을 & 충무로 필름로드',
          region: '서울 중구/종로구',
          recommendedFilm: 'Ilford HP5 Plus (흑백) 또는 Kodak UltraMax 400',
          recommendedCamera: 'Rollei 35',
          highlight: '흑백 필름 특유의 짙은 콘트라스트와 질감 표현',
        },
      };

      const matched = seasonalDefaults[season];
      curatedPlan = {
        weekNumber: currentWeek,
        month: currentMonth,
        season,
        theme: matched.theme || '주말 필름 출사',
        spotName: matched.spotName || '서울 고궁',
        region: matched.region || '서울',
        recommendedFilm: matched.recommendedFilm || 'Kodak Portra 400',
        recommendedCamera: matched.recommendedCamera || 'Nikon FM2',
        highlight: matched.highlight || '골든아워 사광 촬영',
        meetupCount: 18,
        festivalName: festivals?.[0]?.title || '전국 가을 로컬 문화제',
      };
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      plan: curatedPlan,
      source: apiKey ? 'Gemini 1.5 Flash + DASI Intelligence' : 'DASI Seasonal Knowledge Base',
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[curate-weekly] 오류:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET 요청 허용: 프론트엔드 실시간 조회 및 Vercel Cron 테스트
export async function GET(req: NextRequest) {
  return POST(req);
}
