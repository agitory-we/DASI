import { NextRequest, NextResponse } from 'next/server';
import { fetchNearbySpots } from '@/lib/tourApi';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '37.5665'); // 서울 기본
    const lng = parseFloat(searchParams.get('lng') || '126.9780');
    const radius = parseInt(searchParams.get('radius') || '3000', 10);
    const contentTypeId = searchParams.get('contentTypeId') || undefined; // 12:관광지, 14:문화시설, 15:축제
    const numOfRows = parseInt(searchParams.get('numOfRows') || '20', 10);

    const items = await fetchNearbySpots({
      mapX: lng,
      mapY: lat,
      radius,
      contentTypeId,
      numOfRows,
      arrange: 'E', // 거리순
    });

    return NextResponse.json({
      spots: items,
      count: items.length,
      center: { lat, lng },
      radius,
      source: 'tourapi_location_based',
    });
  } catch (err) {
    console.error('[/api/spots/nearby] 에러:', err);
    return NextResponse.json({ spots: [], error: String(err) }, { status: 500 });
  }
}
