import { NextResponse } from 'next/server';
import { EventOrHotSpot } from '@/types';

interface TourApiItem {
  contentid: string;
  title: string;
  addr1: string;
  addr2?: string;
  firstimage?: string;
  firstimage2?: string;
  eventstartdate: string;
  eventenddate: string;
  mapy?: string;
  mapx?: string;
}

export const revalidate = 3600;

export async function GET() {
  try {
    const apiKey = process.env.TOUR_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ events: [], source: 'no_api_key' });
    }

    const today = new Date();
    const future = new Date();
    future.setMonth(future.getMonth() + 3);
    const toYMD = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');
    const startDate = toYMD(today);
    const endDate = toYMD(future);

    const baseUrl = 'https://apis.data.go.kr/B551011/KorService1/searchFestival1';
    const params = new URLSearchParams({
      serviceKey: apiKey,
      MobileOS: 'ETC',
      MobileApp: 'DASI',
      _type: 'json',
      areaCode: '1',
      eventStartDate: startDate,
      eventEndDate: endDate,
      numOfRows: '30',
      pageNo: '1',
      arrange: 'A',
    });

    const res = await fetch(`${baseUrl}?${params.toString()}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`TourAPI HTTP ${res.status}`);

    const json = await res.json();
    const rawItems: TourApiItem[] = json?.response?.body?.items?.item ?? [];

    const events: EventOrHotSpot[] = rawItems
      .filter((item) => item.eventenddate >= startDate)
      .map((item) => ({
        id: `tourapi-${item.contentid}`,
        type: 'festival' as const,
        title: item.title,
        location: item.addr1 + (item.addr2 ? ` ${item.addr2}` : ''),
        periodOrTime: `${formatDate(item.eventstartdate)} ~ ${formatDate(item.eventenddate)}`,
        startDate: item.eventstartdate,
        endDate: item.eventenddate,
        goldenHour: '일출·일몰 전후 1시간 (당일 골든아워 위젯 확인)',
        recommendedLenses: '35mm 또는 50mm 표준 단렌즈',
        tips: `${item.title} 현장 출사 팁: 골든아워 시간대에 방문하시면 드라마틱한 빛을 담을 수 있습니다.`,
        imageUrl: item.firstimage || item.firstimage2 || 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&auto=format&fit=crop&q=80',
        tags: ['축제', '공식행사'],
        source: 'tourapi' as const,
        sourceId: item.contentid,
        lat: item.mapy ? parseFloat(item.mapy) : undefined,
        lng: item.mapx ? parseFloat(item.mapx) : undefined,
      }));

    return NextResponse.json({ events, source: 'tourapi' });
  } catch (err) {
    console.error('[/api/explore] TourAPI 오류:', err);
    return NextResponse.json({ events: [], source: 'error' });
  }
}

function formatDate(yyyymmdd: string): string {
  if (!yyyymmdd || yyyymmdd.length !== 8) return yyyymmdd;
  return `${yyyymmdd.slice(0, 4)}.${yyyymmdd.slice(4, 6)}.${yyyymmdd.slice(6, 8)}`;
}
