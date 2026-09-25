/**
 * 카카오 로컬 REST API 클라이언트
 * 
 * 구글 수석 아키텍트 원칙: 팩트 기반 데이터 무결성 (카카오맵 공식 POI 실데이터 연동)
 * 키: KAKAO_REST_API_KEY
 */

export interface KakaoPlaceItem {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string; // 경도 (lng)
  y: string; // 위도 (lat)
  place_url: string;
  distance: string; // 중심좌표 지정 시 거리 (m)
}

export interface KakaoSearchResponse {
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
  documents: KakaoPlaceItem[];
}

export async function searchKakaoPlaces(options: {
  query: string;
  x?: number; // 경도 (lng)
  y?: number; // 위도 (lat)
  radius?: number; // m 단위 (0 ~ 20000)
  size?: number; // 1 ~ 15
  page?: number; // 1 ~ 45
}): Promise<KakaoPlaceItem[]> {
  const apiKey = process.env.KAKAO_REST_API_KEY || '93f192ce433cf3348092a88d967609af';
  if (!apiKey || !options.query.trim()) return [];

  try {
    const params = new URLSearchParams({
      query: options.query.trim(),
      size: String(options.size || 15),
      page: String(options.page || 1),
      ...(options.x && options.y ? { x: String(options.x), y: String(options.y) } : {}),
      ...(options.radius ? { radius: String(options.radius) } : {}),
    });

    const res = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?${params.toString()}`, {
      headers: {
        Authorization: `KakaoAK ${apiKey}`,
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.warn(`[Kakao Local API] Status ${res.status}: ${await res.text()}`);
      return [];
    }

    const json: KakaoSearchResponse = await res.json();
    return json.documents || [];
  } catch (err) {
    console.error('[Kakao Local API] 오류:', err);
    return [];
  }
}
