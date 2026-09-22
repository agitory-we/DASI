import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Vercel Cron 또는 Supabase pg_cron에서 호출되는 서버 핸들러
// 보안: CRON_SECRET 환경변수로 인증
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const secret = process.env.CRON_SECRET;

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const apiKey = process.env.TOUR_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ skipped: true, reason: 'TOUR_API_KEY not set' });
    }

    const today = new Date();
    const future = new Date();
    future.setMonth(future.getMonth() + 3);
    const toYMD = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');

    const baseUrl = 'https://apis.data.go.kr/B551011/KorService1/searchFestival1';
    const params = new URLSearchParams({
      serviceKey: apiKey,
      MobileOS: 'ETC',
      MobileApp: 'DASI',
      _type: 'json',
      areaCode: '1',
      eventStartDate: toYMD(today),
      eventEndDate: toYMD(future),
      numOfRows: '50',
      pageNo: '1',
      arrange: 'A',
    });

    const res = await fetch(`${baseUrl}?${params.toString()}`);
    if (!res.ok) throw new Error(`TourAPI HTTP ${res.status}`);

    const json = await res.json();
    const items = json?.response?.body?.items?.item ?? [];

    if (items.length === 0) {
      return NextResponse.json({ synced: 0 });
    }

    const rows = items.map((item: { contentid: string; title: string; addr1: string; addr2?: string; firstimage?: string; firstimage2?: string; eventstartdate: string; eventenddate: string; mapy?: string; mapx?: string }) => ({
      source_id: item.contentid,
      title: item.title,
      location: item.addr1 + (item.addr2 ? ` ${item.addr2}` : ''),
      start_date: item.eventstartdate,
      end_date: item.eventenddate,
      image_url: item.firstimage || item.firstimage2 || null,
      lat: item.mapy ? parseFloat(item.mapy) : null,
      lng: item.mapx ? parseFloat(item.mapx) : null,
      source: 'tourapi',
      area: '서울',
    }));

    const { error } = await supabase
      .from('events')
      .upsert(rows, { onConflict: 'source_id' });

    if (error) throw error;

    return NextResponse.json({ synced: rows.length, source: 'tourapi' });
  } catch (err) {
    console.error('[cron/fetch-festivals] 오류:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// GET도 허용: 수동 테스트용
export async function GET(req: NextRequest) {
  return POST(req);
}
