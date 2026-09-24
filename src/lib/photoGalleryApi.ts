/**
 * 한국관광공사 관광사진 정보_GW (PhotoGalleryService1) 클라이언트
 * 
 * 구글 수석 아키텍트 원칙: 팩트 기반 데이터 무결성
 * 엔드포인트: https://apis.data.go.kr/B551011/PhotoGalleryService1
 */

export const PHOTO_GALLERY_API_BASE_URL =
  process.env.PHOTO_GALLERY_API_BASE_URL || 'https://apis.data.go.kr/B551011/PhotoGalleryService1';

export const TOUR_API_KEY =
  process.env.TOUR_API_KEY || 'c24e4727eeb8249ea0731b9884b337cd3bfe3d9488ece5a8cc3a7ac418ce8569';

export interface PhotoGalleryItem {
  galContentId: string;
  galContentTypeId: string;
  galTitle: string;
  galWebImageUrl: string;
  galCreatedtime: string;
  galModifiedtime: string;
  galPhotographyMonth: string; // 예: "202509" (촬영월)
  galPhotographyLocation: string; // 예: "제주특별자치도 제주시 한경면"
  galPhotographer: string; // 실제 촬영 전문 작가명
  galSearchKeyword: string; // 연관 태그
}

export interface PhotoGalleryResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body?: {
      items?: {
        item?: PhotoGalleryItem[];
      };
      numOfRows?: number;
      pageNo?: number;
      totalCount?: number;
    };
  };
}

function createBaseParams(additionalParams: Record<string, string>): URLSearchParams {
  return new URLSearchParams({
    serviceKey: TOUR_API_KEY,
    MobileOS: 'ETC',
    MobileApp: 'DASI',
    _type: 'json',
    ...additionalParams,
  });
}

/**
 * 1. 사진갤러리 목록 조회 (galleryList1)
 */
export async function fetchPhotoGalleryList(options?: {
  numOfRows?: number;
  pageNo?: number;
  arrange?: 'A' | 'B' | 'C'; // A:촬영월순, B:제목순, C:수정일순
}): Promise<PhotoGalleryItem[]> {
  try {
    const params = createBaseParams({
      numOfRows: String(options?.numOfRows || 24),
      pageNo: String(options?.pageNo || 1),
      arrange: options?.arrange || 'B',
    });

    const url = `${PHOTO_GALLERY_API_BASE_URL}/galleryList1?${params.toString()}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`PhotoGalleryService1 galleryList1 status: ${res.status}`);

    const json: PhotoGalleryResponse = await res.json();
    const items = json?.response?.body?.items?.item;
    if (!items) return [];
    return Array.isArray(items) ? items : [items];
  } catch (err) {
    console.error('[PhotoGallery] fetchPhotoGalleryList 에러:', err);
    return [];
  }
}

/**
 * 2. 사진갤러리 키워드 검색 (gallerySearchList1)
 * 예: "서울", "을지로", "경복궁", "가을", "바다"
 */
export async function searchPhotoGallery(options: {
  keyword: string;
  numOfRows?: number;
  pageNo?: number;
  arrange?: 'A' | 'B' | 'C';
}): Promise<PhotoGalleryItem[]> {
  try {
    if (!options.keyword.trim()) return [];

    const params = createBaseParams({
      keyword: options.keyword.trim(),
      numOfRows: String(options.numOfRows || 24),
      pageNo: String(options.pageNo || 1),
      arrange: options.arrange || 'B',
    });

    const url = `${PHOTO_GALLERY_API_BASE_URL}/gallerySearchList1?${params.toString()}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`PhotoGalleryService1 gallerySearchList1 status: ${res.status}`);

    const json: PhotoGalleryResponse = await res.json();
    const items = json?.response?.body?.items?.item;
    if (!items) return [];
    return Array.isArray(items) ? items : [items];
  } catch (err) {
    console.error('[PhotoGallery] searchPhotoGallery 에러:', err);
    return [];
  }
}
