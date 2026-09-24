import { NextResponse } from 'next/server';
import { EventOrHotSpot } from '@/types';
import { fetchFestivals, TourApiItem } from '@/lib/tourApi';

export const revalidate = 3600;

export async function GET() {
  try {
    const rawItems: TourApiItem[] = await fetchFestivals({
      areaCode: '1', // 서울 기본
      numOfRows: 30,
      arrange: 'A',
    });

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    const events: EventOrHotSpot[] = rawItems
      .filter((item) => (item.eventenddate ? item.eventenddate >= todayStr : true))
      .map((item) => ({
        id: `tourapi-${item.contentid}`,
        type: 'festival' as const,
        title: item.title,
        location: item.addr1 + (item.addr2 ? ` ${item.addr2}` : ''),
        periodOrTime: item.eventstartdate && item.eventenddate
          ? `${formatDate(item.eventstartdate)} ~ ${formatDate(item.eventenddate)}`
          : '상시 진행',
        startDate: item.eventstartdate || todayStr,
        endDate: item.eventenddate || todayStr,
        goldenHour: '일출·일몰 전후 1시간 (당일 골든아워 위젯 확인)',
        recommendedLenses: '35mm 또는 50mm 표준 단렌즈',
        tips: `${item.title} 공식 행사 출사: 자연광이 부드러운 골든아워 시간대에 아날로그 필름으로 담으시면 최상의 색감을 얻으실 수 있습니다.`,
        imageUrl:
          item.firstimage ||
          item.firstimage2 ||
          'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&auto=format&fit=crop&q=80',
        tags: ['축제', '한국관광공사공인', '포토스팟'],
        source: 'tourapi' as const,
        sourceId: item.contentid,
        lat: item.mapy ? parseFloat(item.mapy) : undefined,
        lng: item.mapx ? parseFloat(item.mapx) : undefined,
      }));

    return NextResponse.json({ events, source: 'tourapi_v2' });
  } catch (err) {
    console.error('[/api/explore] TourAPI KorService2 오류:', err);
    return NextResponse.json({ events: [], source: 'error' });
  }
}

function formatDate(yyyymmdd: string): string {
  if (!yyyymmdd || yyyymmdd.length !== 8) return yyyymmdd;
  return `${yyyymmdd.slice(0, 4)}.${yyyymmdd.slice(4, 6)}.${yyyymmdd.slice(6, 8)}`;
}
