import { NextResponse } from 'next/server';
import { EventOrHotSpot } from '@/types';
import { fetchFestivals, TourApiItem } from '@/lib/tourApi';
import { mockEventsAndHotSpots } from '@/data/mockData';

export const revalidate = 1800; // 30분 캐시

export async function GET() {
  try {
    // 1. 전국 축제 데이터 조회 (공공데이터 TourAPI의 areacode 필드 공백 버그 방지 위해 전국 호출 후 주소 기반 필터링)
    const rawItems: TourApiItem[] = await fetchFestivals({
      numOfRows: 100,
      arrange: 'C', // 최근 수정/등록순
    });

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    // 2. 종료일이 오늘 이후이거나 종료일 정보가 없는 축제 필터링
    const activeItems = rawItems.filter((item) =>
      item.eventenddate ? item.eventenddate >= todayStr : true
    );

    // 3. 서울/수도권 축제를 우선 정렬, 그 다음 전국 축제 정렬
    const sortedItems = [...activeItems].sort((a, b) => {
      const aIsSeoul = a.addr1?.includes('서울') || false;
      const bIsSeoul = b.addr1?.includes('서울') || false;
      if (aIsSeoul && !bIsSeoul) return -1;
      if (!aIsSeoul && bIsSeoul) return 1;
      return (a.eventstartdate || '').localeCompare(b.eventstartdate || '');
    });

    const fallbackFestivals = mockEventsAndHotSpots.filter((i) => i.type === 'festival');

    const mappedEvents: EventOrHotSpot[] = sortedItems.map((item) => {
      const isSeoul = item.addr1?.includes('서울');
      const regionBadge = isSeoul ? '서울' : extractRegion(item.addr1);
      const curatedImage =
        item.firstimage ||
        item.firstimage2 ||
        getThematicFallbackImage(item.title, item.addr1);

      return {
        id: `tourapi-${item.contentid}`,
        type: 'festival' as const,
        title: item.title,
        location: item.addr1 + (item.addr2 ? ` ${item.addr2}` : ''),
        periodOrTime:
          item.eventstartdate && item.eventenddate
            ? `${formatDate(item.eventstartdate)} ~ ${formatDate(item.eventenddate)}`
            : '상시 진행',
        startDate: item.eventstartdate || todayStr,
        endDate: item.eventenddate || todayStr,
        goldenHour: '일몰 1시간 전 ~ 매직아워 (야간 조명 연출 시 골든아워 이후 권장)',
        recommendedLenses: isSeoul ? '35mm F1.4 또는 50mm 표준 단렌즈' : '28mm 광각 또는 50mm 표준 렌즈',
        tips: `${item.title} 공식 축제 현장: ${
          isSeoul
            ? '도심의 밤 풍경과 축제의 활기찬 조명을 포착하기 위해 감도 높은 필름(Portra 400 또는 800)을 추천합니다.'
            : '주변 풍경과 어우러지는 피사체를 깊이 있게 담아보세요. 자연광이 살아있는 골든아워 출사가 가장 이상적입니다.'
        }`,
        imageUrl: curatedImage,
        tags: [regionBadge, '공식축제', 'TourAPI공인', '포토스팟'],
        source: 'tourapi' as const,
        sourceId: item.contentid,
        lat: item.mapy ? parseFloat(item.mapy) : undefined,
        lng: item.mapx ? parseFloat(item.mapx) : undefined,
      };
    });

    // 만약 TourAPI 데이터가 없으면 fallback 축제 반환
    const finalEvents = mappedEvents.length > 0 ? mappedEvents : fallbackFestivals;

    return NextResponse.json({
      events: finalEvents,
      totalCount: finalEvents.length,
      source: mappedEvents.length > 0 ? 'tourapi_v2_live' : 'mock_fallback',
    });
  } catch (err) {
    console.error('[/api/explore] TourAPI KorService2 오류 발생, Fallback 반환:', err);
    const fallbackFestivals = mockEventsAndHotSpots.filter((i) => i.type === 'festival');
    return NextResponse.json({
      events: fallbackFestivals,
      totalCount: fallbackFestivals.length,
      source: 'mock_fallback_on_error',
    });
  }
}

function formatDate(yyyymmdd: string): string {
  if (!yyyymmdd || yyyymmdd.length !== 8) return yyyymmdd;
  return `${yyyymmdd.slice(0, 4)}.${yyyymmdd.slice(4, 6)}.${yyyymmdd.slice(6, 8)}`;
}

function extractRegion(addr: string = ''): string {
  const parts = addr.trim().split(' ');
  return parts[0] || '전국';
}

function getThematicFallbackImage(title: string = '', addr: string = ''): string {
  const text = (title + ' ' + addr).toLowerCase();
  if (text.includes('궁') || text.includes('문화재') || text.includes('역사') || text.includes('종묘')) {
    return 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&auto=format&fit=crop&q=80';
  }
  if (text.includes('불꽃') || text.includes('빛') || text.includes('야경') || text.includes('달빛') || text.includes('나이트')) {
    return 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80';
  }
  if (text.includes('맥주') || text.includes('푸드') || text.includes('음식') || text.includes('마켓')) {
    return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80';
  }
  if (text.includes('단풍') || text.includes('가을') || text.includes('숲') || text.includes('산') || text.includes('공원')) {
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80';
}
