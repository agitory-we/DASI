import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

// 한국천문연구원 API 연동: 오늘의 서울 일출/일몰 시각 동기화
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const apiKey = process.env.ASTRO_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ skipped: true, reason: 'ASTRO_API_KEY not set' });
    }

    const today = new Date();
    const locdate = today.toISOString().slice(0, 10).replace(/-/g, '');

    const url = new URL('https://apis.data.go.kr/B090041/openapi/service/RiseSetInfoService/getLCRiseSetInfo');
    url.searchParams.set('serviceKey', apiKey);
    url.searchParams.set('locdate', locdate);
    url.searchParams.set('location', '서울');

    const res = await fetch(url.toString());
    const text = await res.text();

    // XML 파싱 (정규식 기반 단순 파싱)
    const extract = (tag: string) => {
      const match = text.match(new RegExp(`<${tag}>([^<]+)</${tag}>`));
      return match ? match[1] : null;
    };

    const sunrise = extract('sunrise');   // HHMM 형식
    const sunset = extract('sunset');

    const toTime = (hhmm: string | null) => {
      if (!hhmm || hhmm.length !== 4) return null;
      return `${hhmm.slice(0, 2)}:${hhmm.slice(2, 4)}`;
    };

    const sunriseTime = toTime(sunrise);
    const sunsetTime = toTime(sunset);

    if (!sunriseTime || !sunsetTime) {
      throw new Error(`천문연 파싱 실패: sunrise=${sunrise}, sunset=${sunset}`);
    }

    // 골든아워: 일출 직후 1시간, 일몰 전 1시간
    const addMinutes = (hhmm: string, minutes: number) => {
      const [h, m] = hhmm.split(':').map(Number);
      const total = h * 60 + m + minutes;
      const nh = Math.floor(total / 60) % 24;
      const nm = total % 60;
      return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
    };

    const morningGoldenStart = sunriseTime;
    const morningGoldenEnd = addMinutes(sunriseTime, 60);
    const eveningGoldenStart = addMinutes(sunsetTime, -60);
    const eveningGoldenEnd = sunsetTime;

    const { error } = await supabase.from('daily_golden_hour').upsert({
      date: locdate,
      location: '서울',
      sunrise: sunriseTime,
      sunset: sunsetTime,
      morning_golden_start: morningGoldenStart,
      morning_golden_end: morningGoldenEnd,
      evening_golden_start: eveningGoldenStart,
      evening_golden_end: eveningGoldenEnd,
    }, { onConflict: 'date' });

    if (error) throw error;

    return NextResponse.json({
      date: locdate,
      sunrise: sunriseTime,
      sunset: sunsetTime,
      eveningGolden: `${eveningGoldenStart} ~ ${eveningGoldenEnd}`,
    });
  } catch (err) {
    console.error('[cron/fetch-sunrise] 오류:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
