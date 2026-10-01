import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import * as SunCalc from 'suncalc';

export const dynamic = 'force-dynamic';

const SEOUL_LAT = 37.5665;
const SEOUL_LNG = 126.9780;

function toHHMM(date: Date | null | undefined): string {
  if (!date || isNaN(date.getTime())) return '06:00';
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function addMinutes(date: Date | null | undefined, mins: number): Date {
  const base = date && !isNaN(date.getTime()) ? date.getTime() : Date.now();
  return new Date(base + mins * 60 * 1000);
}

// 한국천문연구원 API 연동 및 SunCalc 하이브리드 천문 계산 모델
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date();
    const locdate = today.toISOString().slice(0, 10).replace(/-/g, '');

    let sunriseTime: string | null = null;
    let sunsetTime: string | null = null;
    let source = 'suncalc_astronomy_model';

    // 1. ASTRO_API_KEY가 있으면 천문연구원 OpenAPI 우선 호출
    const apiKey = process.env.ASTRO_API_KEY;
    if (apiKey) {
      try {
        const url = new URL('https://apis.data.go.kr/B090041/openapi/service/RiseSetInfoService/getLCRiseSetInfo');
        url.searchParams.set('serviceKey', apiKey);
        url.searchParams.set('locdate', locdate);
        url.searchParams.set('location', '서울');

        const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
        if (res.ok) {
          const text = await res.text();
          const extract = (tag: string) => {
            const match = text.match(new RegExp(`<${tag}>([^<]+)</${tag}>`));
            return match ? match[1] : null;
          };
          const rawSunrise = extract('sunrise');
          const rawSunset = extract('sunset');
          if (rawSunrise?.length === 4 && rawSunset?.length === 4) {
            sunriseTime = `${rawSunrise.slice(0, 2)}:${rawSunrise.slice(2, 4)}`;
            sunsetTime = `${rawSunset.slice(0, 2)}:${rawSunset.slice(2, 4)}`;
            source = 'kasi_open_api';
          }
        }
      } catch (e) {
        console.warn('[fetch-sunrise] 천문연 API 실패, SunCalc 모델로 전환:', e);
      }
    }

    // 2. 키가 없거나 실패 시 SunCalc 수학적 천문 모델로 100% 산출
    if (!sunriseTime || !sunsetTime) {
      const times = SunCalc.getTimes(today, SEOUL_LAT, SEOUL_LNG);
      sunriseTime = toHHMM(times.sunrise);
      sunsetTime = toHHMM(times.sunset);
    }

    // 골든아워 계산: 일출 직후 1시간, 일몰 전 1시간
    const [sH, sM] = sunriseTime.split(':').map(Number);
    const [eH, eM] = sunsetTime.split(':').map(Number);

    const sunriseDate = new Date(today);
    sunriseDate.setHours(sH, sM, 0, 0);

    const sunsetDate = new Date(today);
    sunsetDate.setHours(eH, eM, 0, 0);

    const morningGoldenStart = sunriseTime;
    const morningGoldenEnd = toHHMM(addMinutes(sunriseDate, 60));
    const eveningGoldenStart = toHHMM(addMinutes(sunsetDate, -60));
    const eveningGoldenEnd = sunsetTime;

    // Supabase daily_golden_hour upsert 시도 (실패해도 응답은 정상 반환)
    try {
      await supabase.from('daily_golden_hour').upsert({
        date: locdate,
        location: '서울',
        sunrise: sunriseTime,
        sunset: sunsetTime,
        morning_golden_start: morningGoldenStart,
        morning_golden_end: morningGoldenEnd,
        evening_golden_start: eveningGoldenStart,
        evening_golden_end: eveningGoldenEnd,
      }, { onConflict: 'date' });
    } catch (dbErr) {
      console.warn('[fetch-sunrise] DB 캐싱 건너뜀:', dbErr);
    }

    return NextResponse.json({
      success: true,
      date: locdate,
      location: '서울 (종로/을지로 기준)',
      sunrise: sunriseTime,
      sunset: sunsetTime,
      morningGolden: `${morningGoldenStart} ~ ${morningGoldenEnd}`,
      eveningGolden: `${eveningGoldenStart} ~ ${eveningGoldenEnd}`,
      source,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[cron/fetch-sunrise] 오류:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
