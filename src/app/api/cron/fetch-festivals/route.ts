import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { fetchFestivals } from '@/lib/tourApi';

export const dynamic = 'force-dynamic';

// Vercel Cron 또는 Supabase pg_cron에서 호출되는 서버 핸들러
// 보안: CRON_SECRET 환경변수로 인증
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const secret = process.env.CRON_SECRET;

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 팩트 기반 수정: KorService2 areacode 공백 결함 방지 (전국 조회 후 주소 기반 서울/수도권 필터링)
    const items = await fetchFestivals({
      numOfRows: 100,
      arrange: 'C',
    });

    if (items.length === 0) {
      return NextResponse.json({ synced: 0 });
    }

    const rows = items.map((item) => {
      const isSeoul = item.addr1?.includes('서울');
      const area = isSeoul ? '서울' : (item.addr1?.split(' ')[0] || '전국');
      return {
        source_id: item.contentid,
        title: item.title,
        location: item.addr1 + (item.addr2 ? ` ${item.addr2}` : ''),
        start_date: item.eventstartdate || '',
        end_date: item.eventenddate || '',
        image_url: item.firstimage || item.firstimage2 || null,
        lat: item.mapy ? parseFloat(item.mapy) : null,
        lng: item.mapx ? parseFloat(item.mapx) : null,
        source: 'tourapi_v2',
        area,
      };
    });

    const { error } = await supabase
      .from('events')
      .upsert(rows, { onConflict: 'source_id' });

    if (error) throw error;

    return NextResponse.json({ synced: rows.length, source: 'tourapi_v2' });
  } catch (err) {
    console.error('[cron/fetch-festivals] 오류:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// GET도 허용: 수동 테스트용
export async function GET(req: NextRequest) {
  return POST(req);
}
