import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { searchSpotsByKeyword } from '@/lib/tourApi';

export const dynamic = 'force-dynamic';

// Vercel Cron 또는 수동 호출: 매주 월요일 새벽 전국 공공 출사지 무인 동기화
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const secret = process.env.CRON_SECRET;

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 주요 사진 출사 키워드로 공공데이터 4.0 조회 (관광지/문화시설)
    const keywords = ['고궁', '출사', '한옥', '전망대', '골목길', '공원'];
    let totalSynced = 0;

    for (const keyword of keywords) {
      const items = await searchSpotsByKeyword({
        keyword,
        numOfRows: 20,
        contentTypeId: '12', // 관광지
      });

      if (!items || items.length === 0) continue;

      const validRows = items
        .filter((item) => item.mapx && item.mapy && (item.firstimage || item.firstimage2))
        .map((item) => {
          const isSeoul = item.addr1?.includes('서울');
          const area = isSeoul ? '서울' : (item.addr1?.split(' ')[0] || '수도권');

          return {
            name: item.title,
            address: item.addr1 + (item.addr2 ? ` ${item.addr2}` : ''),
            area,
            lat: parseFloat(item.mapy!),
            lng: parseFloat(item.mapx!),
            image_url: item.firstimage || item.firstimage2 || null,
            golden_hour_tips: '일몰 1시간 전 매직아워 추천',
            recommended_lenses: '35mm 또는 50mm 단렌즈',
            description: `TourAPI 공공인증 출사지 (${keyword}). 자연광과 감성 필름 톤 촬영에 최적화된 명소입니다.`,
            is_verified: true,
          };
        });

      if (validRows.length > 0) {
        // photo_spots 테이블에 일괄 적재
        const { error } = await supabase
          .from('photo_spots')
          .upsert(validRows, { onConflict: 'name' });

        if (!error) {
          totalSynced += validRows.length;
        } else {
          console.warn(`[cron/sync-spots] keyword "${keyword}" upsert 경고:`, error.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      syncedCount: totalSynced,
      timestamp: new Date().toISOString(),
      source: 'TourAPI 4.0 KorService2',
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[cron/sync-spots] 오류:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET도 허용 (Vercel Cron 및 개발자 수동 테스트)
export async function GET(req: NextRequest) {
  return POST(req);
}
