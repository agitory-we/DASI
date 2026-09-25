import { NextRequest, NextResponse } from 'next/server';
import { fetchNearbySpots } from '@/lib/tourApi';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '37.5665'); // 서울 기본
    const lng = parseFloat(searchParams.get('lng') || '126.9780');
    const radius = parseInt(searchParams.get('radius') || '3000', 10);
    // 출사 목적에 부합하도록 관광지(12)와 문화시설(14)을 우선 기본값으로 적용
    const requestedContentType = searchParams.get('contentTypeId');
    const contentTypeId = requestedContentType || '12'; // 기본 12: 관광지
    const numOfRows = parseInt(searchParams.get('numOfRows') || '20', 10);

    let items = await fetchNearbySpots({
      mapX: lng,
      mapY: lat,
      radius,
      contentTypeId,
      numOfRows,
      arrange: 'E', // 거리순
    });

    // 만약 결과가 적으면 문화시설(14)도 추가 조회하여 풍부하게 결합
    if (!requestedContentType && items.length < 5) {
      const cultureItems = await fetchNearbySpots({
        mapX: lng,
        mapY: lat,
        radius,
        contentTypeId: '14', // 문화시설
        numOfRows: 10,
        arrange: 'E',
      });
      const existingIds = new Set(items.map((i) => i.contentid));
      cultureItems.forEach((c) => {
        if (!existingIds.has(c.contentid)) {
          items.push(c);
          existingIds.add(c.contentid);
        }
      });
    }

    // 출사 팁 및 이미지 보강
    const enrichedSpots = items.map((spot) => ({
      ...spot,
      firstimage: spot.firstimage || spot.firstimage2 || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
      categoryLabel: spot.contenttypeid === '14' ? '문화시설' : spot.contenttypeid === '15' ? '축제행사' : '관광명소',
    }));

    return NextResponse.json({
      spots: enrichedSpots,
      count: enrichedSpots.length,
      center: { lat, lng },
      radius,
      source: 'tourapi_location_based',
    });
  } catch (err) {
    console.error('[/api/spots/nearby] 에러:', err);
    return NextResponse.json({ spots: [], error: String(err) }, { status: 500 });
  }
}
