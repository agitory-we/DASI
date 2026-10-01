import { NextRequest, NextResponse } from 'next/server';
import { searchSpotsByKeyword, TourApiItem } from '@/lib/tourApi';
import { mockCameras, mockAnalogSpots, mockPhotoGigs, mockMasters, mockEventsAndHotSpots } from '@/data/mockData';
import { RepairMaster } from '@/types';

export const dynamic = 'force-dynamic';

export interface OmniSpotResult {
  id: string;
  title: string;
  address: string;
  category: 'spot' | 'festival';
  imageUrl: string;
  lat: number;
  lng: number;
  source: 'tourapi' | 'dasi';
  contentTypeId?: string;
  link: string;
  badge?: string;
}

export interface OmniCameraResult {
  id: string;
  name: string;
  brand: string;
  rentalPricePerDay: number;
  purchasePrice: number;
  imageUrl: string;
  pickupLocation: string;
  era?: string;
  link: string;
}

export interface OmniStudioResult {
  id: string;
  name: string;
  category: 'lab' | 'vending' | 'heritage';
  address: string;
  isPartner: boolean;
  partnerBenefit?: string;
  link: string;
}

export interface OmniCommunityResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'gig' | 'master' | 'event';
  location: string;
  link: string;
}

export interface OmniSearchPayload {
  query: string;
  totalCount: number;
  results: {
    spots: OmniSpotResult[];
    cameras: OmniCameraResult[];
    studios: OmniStudioResult[];
    community: OmniCommunityResult[];
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';

    if (!q || q.length < 1) {
      return NextResponse.json({
        query: q,
        totalCount: 0,
        results: {
          spots: [],
          cameras: [],
          studios: [],
          community: [],
        },
      });
    }

    const lowerQ = q.toLowerCase();

    // 1. TourAPI 실시간 공공데이터 검색 (비동기 병렬)
    const tourApiPromise: Promise<TourApiItem[]> = searchSpotsByKeyword({
      keyword: q,
      numOfRows: 25,
    }).catch((err) => {
      console.warn('[OmniSearch] TourAPI 검색 실패 (Fallback 처리):', err);
      return [];
    });

    // 2. 내부 카메라 DB 필터링
    const matchedCameras: OmniCameraResult[] = mockCameras
      .filter(
        (c) =>
          c.name.toLowerCase().includes(lowerQ) ||
          c.brand.toLowerCase().includes(lowerQ) ||
          c.era?.toLowerCase().includes(lowerQ) ||
          c.shopName.toLowerCase().includes(lowerQ)
      )
      .slice(0, 5)
      .map((c) => ({
        id: c.id,
        name: c.name,
        brand: c.brand,
        rentalPricePerDay: c.rentalPricePerDay,
        purchasePrice: c.purchasePrice,
        imageUrl: c.imageUrl,
        pickupLocation: c.pickupLocation,
        era: c.era,
        link: `/rent`,
      }));

    // 3. 현상소 및 자판기 DB 필터링
    const matchedStudios: OmniStudioResult[] = mockAnalogSpots
      .filter(
        (s) =>
          s.name.toLowerCase().includes(lowerQ) ||
          s.area.toLowerCase().includes(lowerQ) ||
          s.address.toLowerCase().includes(lowerQ) ||
          s.category.toLowerCase().includes(lowerQ) ||
          s.subTags?.some((t) => t.toLowerCase().includes(lowerQ))
      )
      .slice(0, 5)
      .map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category === 'vending_machine' || s.subTags?.includes('24시자판기') ? 'vending' : 'lab',
        address: s.address,
        isPartner: !!s.isPartner,
        partnerBenefit: s.filmStockStatus || s.todayScanCutoff || s.subTags?.[0],
        link: `/map?defaultSpotId=${encodeURIComponent(s.id)}`,
      }));

    // 4. 커뮤니티 (포토긱, 수리명장, 클래스/축제)
    const matchedGigs: OmniCommunityResult[] = mockPhotoGigs
      .filter(
        (g) =>
          g.title.toLowerCase().includes(lowerQ) ||
          g.creatorName.toLowerCase().includes(lowerQ) ||
          g.location.toLowerCase().includes(lowerQ)
      )
      .slice(0, 3)
      .map((g) => ({
        id: g.id,
        title: g.title,
        subtitle: `${g.creatorName} 작가 · 시간당 ₩${g.pricePerHour.toLocaleString()}`,
        type: 'gig' as const,
        location: g.location,
        link: `/gigs`,
      }));

    const matchedMasters: OmniCommunityResult[] = (mockMasters as RepairMaster[])
      .filter(
        (m) =>
          m.name.toLowerCase().includes(lowerQ) ||
          m.shopName.toLowerCase().includes(lowerQ) ||
          m.specialty.toLowerCase().includes(lowerQ)
      )
      .slice(0, 2)
      .map((m) => ({
        id: m.id,
        title: `${m.name} 명장 (${m.shopName})`,
        subtitle: m.specialty,
        type: 'master' as const,
        location: m.location,
        link: `/clinic`,
      }));

    const matchedEvents: OmniCommunityResult[] = mockEventsAndHotSpots
      .filter(
        (e) =>
          e.title.toLowerCase().includes(lowerQ) ||
          e.location.toLowerCase().includes(lowerQ) ||
          e.type.toLowerCase().includes(lowerQ)
      )
      .slice(0, 3)
      .map((e) => ({
        id: e.id,
        title: e.title,
        subtitle: `${e.periodOrTime} · 추천렌즈 ${e.recommendedLenses}`,
        type: 'event' as const,
        location: e.location,
        link: `/map?lat=${e.lat ?? 37.5665}&lng=${e.lng ?? 126.978}&title=${encodeURIComponent(e.title)}`,
      }));

    // TourAPI 결과 수신 및 매핑
    const tourApiItems = await tourApiPromise;

    // 12(관광지), 14(문화시설), 15(행사축제), 25(코스), 28(레포츠) 우선
    const validTourItems = tourApiItems.filter((item) => {
      const type = item.contenttypeid;
      return type === '12' || type === '14' || type === '15' || type === '25' || type === '28';
    });

    // 사진이 있는 항목 우선 정렬
    const sortedTourItems = validTourItems.sort((a, b) => {
      const aHasImg = a.firstimage || a.firstimage2 ? 1 : 0;
      const bHasImg = b.firstimage || b.firstimage2 ? 1 : 0;
      return bHasImg - aHasImg;
    });

    const matchedSpots: OmniSpotResult[] = sortedTourItems.slice(0, 8).map((item) => {
      const isFestival = item.contenttypeid === '15';
      const lat = item.mapy ? parseFloat(item.mapy) : 37.5665;
      const lng = item.mapx ? parseFloat(item.mapx) : 126.978;
      const img =
        item.firstimage ||
        item.firstimage2 ||
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80';

      return {
        id: `tourapi-${item.contentid}`,
        title: item.title,
        address: item.addr1 || '상세 주소 정보 없음',
        category: isFestival ? 'festival' : 'spot',
        imageUrl: img,
        lat,
        lng,
        source: 'tourapi',
        contentTypeId: item.contenttypeid,
        link: isFestival
          ? `/festivals?contentId=${item.contentid}`
          : `/map?lat=${lat}&lng=${lng}&title=${encodeURIComponent(item.title)}&defaultSpotId=tourapi-${item.contentid}`,
        badge: isFestival ? '실시간 축제' : '공공인증 출사지',
      };
    });

    // 만약 TourAPI 검색 결과가 없거나 부족한 경우, 로컬 핫스팟으로 보완
    if (matchedSpots.length === 0) {
      mockEventsAndHotSpots
        .filter(
          (e) =>
            e.title.toLowerCase().includes(lowerQ) ||
            e.location.toLowerCase().includes(lowerQ)
        )
        .slice(0, 5)
        .forEach((e) => {
          matchedSpots.push({
            id: e.id,
            title: e.title,
            address: e.location,
            category: e.type === 'festival' ? 'festival' : 'spot',
            imageUrl: e.imageUrl,
            lat: e.lat ?? 37.5665,
            lng: e.lng ?? 126.978,
            source: 'dasi',
            link: `/map?lat=${e.lat ?? 37.5665}&lng=${e.lng ?? 126.978}&title=${encodeURIComponent(e.title)}`,
            badge: 'DASI 추천 출사지',
          });
        });
    }

    const totalCount =
      matchedSpots.length +
      matchedCameras.length +
      matchedStudios.length +
      matchedGigs.length +
      matchedMasters.length +
      matchedEvents.length;

    const payload: OmniSearchPayload = {
      query: q,
      totalCount,
      results: {
        spots: matchedSpots,
        cameras: matchedCameras,
        studios: matchedStudios,
        community: [...matchedGigs, ...matchedMasters, ...matchedEvents],
      },
    };

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[OmniSearch] GET API 라우트 에러:', error);
    return NextResponse.json(
      { error: '검색 처리 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}
