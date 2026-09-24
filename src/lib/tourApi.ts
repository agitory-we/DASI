/**
 * 한국관광공사 TourAPI 4.0 (KorService2) 연동 클라이언트
 * 
 * 구글 수석 아키텍트 원칙: 팩트 기반 데이터 무결성 (공공데이터 실데이터 연동)
 * 엔드포인트: https://apis.data.go.kr/B551011/KorService2
 */

export const TOUR_API_BASE_URL =
  process.env.TOUR_API_BASE_URL || 'https://apis.data.go.kr/B551011/KorService2';

export const TOUR_API_KEY =
  process.env.TOUR_API_KEY || 'c24e4727eeb8249ea0731b9884b337cd3bfe3d9488ece5a8cc3a7ac418ce8569';

// 한국관광공사 공통 응답 아이템 인터페이스
export interface TourApiItem {
  contentid: string;
  contenttypeid: string; // 12:관광지, 14:문화시설, 15:축제공연행사, 25:여행코스, 28:레포츠, 32:숙박, 38:쇼핑, 39:음식점
  title: string;
  addr1: string;
  addr2?: string;
  zipcode?: string;
  areacode?: string;
  sigungucode?: string;
  firstimage?: string;
  firstimage2?: string;
  mapx?: string; // 경도 (lng)
  mapy?: string; // 위도 (lat)
  mlevel?: string;
  tel?: string;
  createdtime?: string;
  modifiedtime?: string;
  // 행사(15) 전용 필드
  eventstartdate?: string;
  eventenddate?: string;
  // 위치기반 거리(m)
  dist?: string;
}

export interface TourApiResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body?: {
      items?: {
        item?: TourApiItem[];
      };
      numOfRows?: number;
      pageNo?: number;
      totalCount?: number;
    };
  };
}

/**
 * 기본 공통 파라미터 생성
 */
function createBaseParams(additionalParams: Record<string, string>): URLSearchParams {
  const params = new URLSearchParams({
    serviceKey: TOUR_API_KEY,
    MobileOS: 'ETC',
    MobileApp: 'DASI',
    _type: 'json',
    ...additionalParams,
  });
  return params;
}

/**
 * 1. 행사/축제 정보 조회 (searchFestival2)
 * 필름 카메라 출사 및 로컬 축제 이벤트 연동
 */
export async function fetchFestivals(options?: {
  areaCode?: string;       // 1: 서울, 2: 인천, 6: 부산 등
  eventStartDate?: string;  // YYYYMMDD
  eventEndDate?: string;    // YYYYMMDD
  numOfRows?: number;
  pageNo?: number;
  arrange?: 'A' | 'C' | 'D' | 'O' | 'Q' | 'R'; // A:제목순, C:수정일순, D:생성일순, O:사진있는목록
}): Promise<TourApiItem[]> {
  try {
    const today = new Date();
    const toYMD = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');
    const defaultStart = toYMD(today);

    const params = createBaseParams({
      eventStartDate: options?.eventStartDate || defaultStart,
      numOfRows: String(options?.numOfRows || 30),
      pageNo: String(options?.pageNo || 1),
      arrange: options?.arrange || 'A',
      ...(options?.areaCode ? { areaCode: options.areaCode } : {}),
      ...(options?.eventEndDate ? { eventEndDate: options.eventEndDate } : {}),
    });

    const url = `${TOUR_API_BASE_URL}/searchFestival2?${params.toString()}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`TourAPI searchFestival2 status: ${res.status}`);

    const json: TourApiResponse = await res.json();
    const items = json?.response?.body?.items?.item;
    if (!items) return [];
    return Array.isArray(items) ? items : [items];
  } catch (err) {
    console.error('[TourAPI] fetchFestivals 에러:', err);
    return [];
  }
}

/**
 * 2. 위치 기반 관광/출사 정보 조회 (locationBasedList2)
 * 사용자 GPS 또는 지도 중심 좌표 기준 반경 내 관광지/문화시설 조회
 */
export async function fetchNearbySpots(options: {
  mapX: number;            // 경도 (예: 126.9780)
  mapY: number;            // 위도 (예: 37.5665)
  radius?: number;         // 반경 (m단위, 최대 20,000m, 기본 3,000m)
  contentTypeId?: string;  // 12:관광지, 14:문화시설, 15:축제
  numOfRows?: number;
  pageNo?: number;
  arrange?: 'A' | 'C' | 'D' | 'E' | 'S'; // E:거리순
}): Promise<TourApiItem[]> {
  try {
    const params = createBaseParams({
      mapX: String(options.mapX),
      mapY: String(options.mapY),
      radius: String(options.radius || 3000),
      numOfRows: String(options.numOfRows || 20),
      pageNo: String(options.pageNo || 1),
      arrange: options.arrange || 'E', // 거리순 기본
      ...(options.contentTypeId ? { contentTypeId: options.contentTypeId } : {}),
    });

    const url = `${TOUR_API_BASE_URL}/locationBasedList2?${params.toString()}`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) throw new Error(`TourAPI locationBasedList2 status: ${res.status}`);

    const json: TourApiResponse = await res.json();
    const items = json?.response?.body?.items?.item;
    if (!items) return [];
    return Array.isArray(items) ? items : [items];
  } catch (err) {
    console.error('[TourAPI] fetchNearbySpots 에러:', err);
    return [];
  }
}

/**
 * 3. 키워드 검색 조회 (searchKeyword2)
 * "을지로", "덕수궁", "성수동" 등 특정 출사 명소 검색
 */
export async function searchSpotsByKeyword(options: {
  keyword: string;
  areaCode?: string;
  contentTypeId?: string;
  numOfRows?: number;
  pageNo?: number;
}): Promise<TourApiItem[]> {
  try {
    if (!options.keyword.trim()) return [];

    const params = createBaseParams({
      keyword: options.keyword.trim(),
      numOfRows: String(options.numOfRows || 20),
      pageNo: String(options.pageNo || 1),
      arrange: 'A',
      ...(options.areaCode ? { areaCode: options.areaCode } : {}),
      ...(options.contentTypeId ? { contentTypeId: options.contentTypeId } : {}),
    });

    const url = `${TOUR_API_BASE_URL}/searchKeyword2?${params.toString()}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`TourAPI searchKeyword2 status: ${res.status}`);

    const json: TourApiResponse = await res.json();
    const items = json?.response?.body?.items?.item;
    if (!items) return [];
    return Array.isArray(items) ? items : [items];
  } catch (err) {
    console.error('[TourAPI] searchSpotsByKeyword 에러:', err);
    return [];
  }
}

/**
 * 4. 공통 정보 상세 조회 (detailCommon2)
 * 특정 관광지/행사의 상세 개요, 홈페이지, 대표 이미지 등 조회
 */
export async function fetchSpotCommonDetail(contentId: string): Promise<TourApiItem | null> {
  try {
    const params = createBaseParams({
      contentId,
      defaultYN: 'Y',
      firstImageYN: 'Y',
      areacodeYN: 'Y',
      catcodeYN: 'Y',
      addrinfoYN: 'Y',
      mapinfoYN: 'Y',
      overviewYN: 'Y',
    });

    const url = `${TOUR_API_BASE_URL}/detailCommon2?${params.toString()}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`TourAPI detailCommon2 status: ${res.status}`);

    const json: TourApiResponse = await res.json();
    const items = json?.response?.body?.items?.item;
    if (!items) return null;
    return Array.isArray(items) ? items[0] : items;
  } catch (err) {
    console.error('[TourAPI] fetchSpotCommonDetail 에러:', err);
    return null;
  }
}
