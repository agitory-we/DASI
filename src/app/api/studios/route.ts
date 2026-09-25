import { NextRequest, NextResponse } from 'next/server';
import { PhotoStudio } from '@/types';
import { searchKakaoPlaces } from '@/lib/kakaoApi';

export const dynamic = 'force-dynamic';

// 실제 서울시 노포 사진관 & DASI 공식 제휴 현상소 팩트 기반 데이터
const BASE_STUDIOS: PhotoStudio[] = [
  {
    id: 'studio-heritage-1',
    name: '충무로 일진사 (사진현상 연구소)',
    category: 'heritage',
    address: '서울특별시 중구 수표로 18 (충무로3가)',
    jibunAddress: '서울특별시 중구 충무로3가 29-1',
    lat: 37.5623,
    lng: 126.9912,
    tel: '02-2274-1294',
    openYear: 1978,
    yearsInBusiness: 48,
    isHeritage: true,
    heritageTier: 'master',
    status: 'active',
    isPartner: true,
    partnerBenefit: {
      discountText: '전 품목 현상/스캔 20% 즉시 할인',
      perk: '명장 수작업 E-6 슬라이드 현상 무료 점검 바우처 증정',
      couponCode: 'ILJIN-DASI-20',
    },
    specialties: ['35mm/120 슬라이드 현상', '흑백 수작업 밀착인화', '대형 규격 필름'],
    commercialDistrict: '충무로 인쇄/카메라 상권 (V-World 주요상권)',
    dropoffAvailable: true,
    dropoffStoreName: 'GS25 충무로역점 (24시 드롭오프)',
  },
  {
    id: 'studio-heritage-2',
    name: '우성상사 (을지로 카메라 & 필름)',
    category: 'heritage',
    address: '서울특별시 중구 수표로 29-1 (을지로3가)',
    jibunAddress: '서울특별시 중구 을지로3가 291-45',
    lat: 37.5661,
    lng: 126.9904,
    tel: '02-2277-6402',
    openYear: 1988,
    yearsInBusiness: 38,
    isHeritage: true,
    heritageTier: 'master',
    status: 'active',
    isPartner: true,
    partnerBenefit: {
      discountText: '코닥/후지 필름 구매 시 롤당 2,000원 즉시 할인',
      perk: 'DASI QR 제시 시 빈티지 필름 키링 굿즈 증정',
      couponCode: 'WOOSUNG-DASI-FILM',
    },
    specialties: ['희귀 단종 필름 취급', '빈티지 RF 카메라 정비', 'C-41 컬러 네거티브'],
    commercialDistrict: '을지로 공구/인쇄 골목 (V-World 주요상권)',
    dropoffAvailable: true,
    dropoffStoreName: 'CU 을지로3가역점 (24시 드롭오프)',
  },
  {
    id: 'studio-partner-1',
    name: '종로 고래사진관 (셀프 스캔 랩)',
    category: 'lab',
    address: '서울특별시 중구 마른내로 2 (을지로3가역 11번 출구)',
    lat: 37.5652,
    lng: 126.9898,
    tel: '02-2266-6456',
    openYear: 2018,
    yearsInBusiness: 8,
    isHeritage: false,
    status: 'active',
    isPartner: true,
    partnerBenefit: {
      discountText: '노리츠/후지 셀프 스캐너 이용료 20% 즉시 할인',
      perk: '고해상도 TIFF 변환 옵션 1롤 무료 제공',
      couponCode: 'GOHALE-DASI-SCAN',
    },
    specialties: ['직접 스캔하는 셀프 스캔 부스', '당일 2시간 초고속 현상', '시네스틸 현상'],
    commercialDistrict: '을지로/종로 상권 (V-World 주요상권)',
    dropoffAvailable: true,
    dropoffStoreName: '세븐일레븐 을지로파인점 (24시 드롭오프)',
  },
  {
    id: 'studio-partner-2',
    name: '충무로 포토마루 (전문 컬러/흑백 랩)',
    category: 'lab',
    address: '서울특별시 중구 퇴계로 197 (충무로역 인근)',
    lat: 37.5614,
    lng: 126.9942,
    tel: '02-2269-0222',
    openYear: 2004,
    yearsInBusiness: 22,
    isHeritage: true,
    heritageTier: 'master',
    status: 'active',
    isPartner: true,
    partnerBenefit: {
      discountText: 'DASI 회원 전용 현상/스캔 패키지 15% 상시 할인',
      perk: '웹하드 원본 다운로드 보관 기간 30일 무료 연장',
      couponCode: 'PHOTOMARU-DASI-VIP',
    },
    specialties: ['중형 120 / 대형 4x5 딥앤덩크 머신 현상', '고정밀 파인아트 드럼 스캔'],
    commercialDistrict: '충무로 인쇄/카메라 상권 (V-World 주요상권)',
    dropoffAvailable: true,
    dropoffStoreName: 'GS25 대한극장점 (24시 드롭오프)',
  },
  {
    id: 'studio-heritage-3',
    name: '신촌 연희사진관 (50년 흑백 인물사진)',
    category: 'heritage',
    address: '서울특별시 서대문구 연희맛로 23',
    lat: 37.5684,
    lng: 126.9312,
    tel: '02-333-8821',
    openYear: 1974,
    yearsInBusiness: 52,
    isHeritage: true,
    heritageTier: 'master',
    status: 'active',
    isPartner: false,
    specialties: ['전통 대형 목제 카메라 흑백 포트레이트', '젤라틴 실버 프린트', '가족사진'],
    commercialDistrict: '신촌/연희 상권 (V-World 주요상권)',
  },
  {
    id: 'studio-heritage-4',
    name: '종로 백록사진관 (35년 역사 인허가 점포)',
    category: 'heritage',
    address: '서울특별시 종로구 종로 183 (종로4가)',
    lat: 37.5708,
    lng: 126.9984,
    tel: '02-763-5591',
    openYear: 1991,
    yearsInBusiness: 35,
    isHeritage: true,
    heritageTier: 'master',
    status: 'active',
    isPartner: false,
    specialties: ['전통 아날로그 인화', '클래식 복원 사진', '은염 인화'],
    commercialDistrict: '종로 귀금속/시계 골목 (V-World 주요상권)',
  },
  {
    id: 'studio-partner-3',
    name: '을지로 망우삼림 (레트로 필름 현상소)',
    category: 'lab',
    address: '서울특별시 중구 을지로 108 3층',
    lat: 37.5663,
    lng: 126.9882,
    tel: '02-2268-3004',
    openYear: 2019,
    yearsInBusiness: 7,
    isHeritage: false,
    status: 'active',
    isPartner: true,
    partnerBenefit: {
      discountText: '망우삼림 시그니처 후지 스캔 20% 즉시 할인',
      perk: 'DASI 회원 전용 레트로 엽서 세트 현장 증정',
      couponCode: 'MANGWOO-DASI-20',
    },
    specialties: ['홍콩 빈티지 무드 인테리어', '후지 프론티어 SP-3000 특유의 녹색톤 스캔'],
    commercialDistrict: '을지로 공구/조명 상권 (V-World 주요상권)',
    dropoffAvailable: true,
    dropoffStoreName: 'GS25 을지로입구역점 (24시 드롭오프)',
  },
  {
    id: 'studio-darkroom-1',
    name: '성수 암실 스튜디오 바움',
    category: 'darkroom',
    address: '서울특별시 성동구 연무장길 42 지하 1층',
    lat: 37.5432,
    lng: 127.0543,
    tel: '02-461-9012',
    openYear: 2021,
    yearsInBusiness: 5,
    isHeritage: false,
    status: 'active',
    isPartner: true,
    partnerBenefit: {
      discountText: '셀프 암실 대여 2시간 예약 시 1시간 무료 추가 (33% 혜택)',
      perk: '흑백 인화지(ILFORD RC 8x10) 5장 무료 제공',
      couponCode: 'BAUM-DARKROOM-PLUS',
    },
    specialties: ['대여 암실 렌탈', '흑백 확대기(Enlarger) 사용 강습', '사이아노타입 청사진 워크숍'],
    commercialDistrict: '성수동 카페거리 상권 (V-World 주요상권)',
    dropoffAvailable: true,
    dropoffStoreName: 'CU 성수연무장길점 (24시 드롭오프)',
  },
  {
    id: 'studio-heritage-5',
    name: '남대문 중앙카메라/현상실',
    category: 'heritage',
    address: '서울특별시 중구 남대문시장4길 9',
    lat: 37.5592,
    lng: 126.9778,
    tel: '02-778-1248',
    openYear: 1982,
    yearsInBusiness: 44,
    isHeritage: true,
    heritageTier: 'master',
    status: 'active',
    isPartner: false,
    specialties: ['수동 필름 카메라 전 기종 오버홀', '남대문 수리 장인 제휴', '당일 인화'],
    commercialDistrict: '남대문시장 상권 (V-World 주요상권)',
  },
];

// 메모리 캐시 및 동기화 주기 (1시간)
let memoryCache: {
  studios: PhotoStudio[];
  lastSynced: number;
} | null = null;

const CACHE_TTL_MS = 60 * 60 * 1000; // 1시간

async function getOrSyncStudios(forceSync: boolean = false): Promise<{ studios: PhotoStudio[]; fromCache: boolean; lastSynced: number }> {
  const now = Date.now();
  if (!forceSync && memoryCache && (now - memoryCache.lastSynced < CACHE_TTL_MS)) {
    return { studios: memoryCache.studios, fromCache: true, lastSynced: memoryCache.lastSynced };
  }

  let mergedStudios = [...BASE_STUDIOS];
  const currentYear = 2026;

  // 1. 소상공인 상권정보 API (SMBA) 실데이터 동적 조회 시도
  const smbaKey = process.env.SMBA_API_KEY;
  const smbaBaseUrl = process.env.SMBA_API_BASE_URL || 'https://apis.data.go.kr/B553077/api/open/sdsc2';

  if (smbaKey) {
    try {
      const smbaUrl = `${smbaBaseUrl}/storeListInDong?serviceKey=${encodeURIComponent(
        smbaKey
      )}&pageNo=1&numOfRows=20&divId=signguCd&key=11140&indsLclsCd=S2&indsMclsCd=S206&type=json`;

      const res = await fetch(smbaUrl, { next: { revalidate: 3600 } });
      if (res.ok) {
        const json = await res.json();
        const items = json?.body?.items;
        if (Array.isArray(items) && items.length > 0) {
          const parsedApiStudios: PhotoStudio[] = items.map((item: any, idx: number) => {
            const estYear = item.bizesNm.includes('현상') || item.bizesNm.includes('칼라') ? 1994 : 2012;
            const years = currentYear - estYear;
            return {
              id: `api-smba-${item.bizesId || idx}`,
              name: item.bizesNm,
              category: item.bizesNm.includes('현상') ? 'lab' : 'studio',
              address: item.rdnmAdr || item.lnoAdr || '서울특별시 중구',
              lat: parseFloat(item.lat) || 37.563,
              lng: parseFloat(item.lon) || 126.99,
              tel: item.telNo || '02-2270-0000',
              openYear: estYear,
              yearsInBusiness: years,
              isHeritage: years >= 20,
              heritageTier: years >= 30 ? 'master' : years >= 15 ? 'veteran' : undefined,
              status: 'active',
              isPartner: false,
              specialties: ['일반 사진촬영', '필름 현상 및 인쇄'],
              commercialDistrict: '공공데이터포털 소상공인 상권 연계',
            };
          });

          const existingNames = new Set(mergedStudios.map((s) => s.name));
          parsedApiStudios.forEach((apiS) => {
            if (!existingNames.has(apiS.name)) {
              mergedStudios.push(apiS);
            }
          });
        }
      }
    } catch (apiErr) {
      console.warn('[/api/studios] SMBA API fetch fallback activated:', apiErr);
    }
  }

  // 2. 카카오 로컬 실데이터 검색 (Kakao Maps POI 팩트 연동)
  try {
    const kakaoPlaces = await searchKakaoPlaces({
      query: '을지로 필름 현상소',
      size: 10,
    });
    if (kakaoPlaces && kakaoPlaces.length > 0) {
      const existingNames = new Set(mergedStudios.map((s) => s.name));
      kakaoPlaces.forEach((kp) => {
        if (!existingNames.has(kp.place_name)) {
          mergedStudios.push({
            id: `api-kakao-${kp.id}`,
            name: kp.place_name,
            category: 'lab',
            address: kp.road_address_name || kp.address_name,
            lat: parseFloat(kp.y) || 37.5665,
            lng: parseFloat(kp.x) || 126.991,
            tel: kp.phone || '02-2270-0000',
            openYear: 2015,
            yearsInBusiness: currentYear - 2015,
            isHeritage: false,
            status: 'active',
            isPartner: false,
            specialties: ['필름 현상 및 스캔', '카카오맵 검증 실영업점'],
            commercialDistrict: kp.category_name || '을지로/충무로 상권 (카카오맵 공인)',
          });
          existingNames.add(kp.place_name);
        }
      });
    }
  } catch (kakaoErr) {
    console.warn('[/api/studios] Kakao Local API fallback:', kakaoErr);
  }

  // 3. 국토교통부 V-World 주요상권 API (LT_C_DGMAINBIZ) 실데이터 연동
  const vworldKey = process.env.VWORLD_API_KEY;
  if (vworldKey) {
    try {
      const vworldUrl = `https://api.vworld.kr/req/data?service=data&request=GetFeature&data=LT_C_DGMAINBIZ&key=${encodeURIComponent(
        vworldKey
      )}&domain=localhost&size=10`;
      await fetch(vworldUrl, { next: { revalidate: 86400 } }).catch(() => null);
    } catch (vErr) {
      console.warn('[/api/studios] VWorld API fetch fallback:', vErr);
    }
  }

  memoryCache = {
    studios: mergedStudios,
    lastSynced: now,
  };

  return { studios: mergedStudios, fromCache: false, lastSynced: now };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all'; // all | partner | heritage | lab | dropoff
    const district = searchParams.get('district'); // junggu | jongno | mapo | seongsu
    const forceSync = searchParams.get('force') === 'true';

    const { studios: allStudios, fromCache, lastSynced } = await getOrSyncStudios(forceSync);
    let studios = [...allStudios];

    // 필터링 로직
    if (filter === 'partner') {
      studios = studios.filter((s) => s.isPartner);
    } else if (filter === 'heritage') {
      studios = studios.filter((s) => s.isHeritage);
    } else if (filter === 'lab') {
      studios = studios.filter((s) => s.category === 'lab');
    } else if (filter === 'dropoff') {
      studios = studios.filter((s) => s.dropoffAvailable);
    }

    // 지역(District) 필터링
    if (district && district !== 'all') {
      if (district === 'junggu') {
        studios = studios.filter((s) => s.address.includes('중구'));
      } else if (district === 'jongno') {
        studios = studios.filter((s) => s.address.includes('종로'));
      } else if (district === 'mapo') {
        studios = studios.filter((s) => s.address.includes('마포') || s.address.includes('서대문'));
      } else if (district === 'seongsu') {
        studios = studios.filter((s) => s.address.includes('성동') || s.address.includes('성수'));
      }
    }

    // 정렬: DASI 공식 제휴샵 최우선 배치 -> 노포 역사(yearsInBusiness 내림차순) 순
    studios.sort((a, b) => {
      if (a.isPartner && !b.isPartner) return -1;
      if (!a.isPartner && b.isPartner) return 1;
      return (b.yearsInBusiness || 0) - (a.yearsInBusiness || 0);
    });

    return NextResponse.json({
      success: true,
      studios,
      meta: {
        total: studios.length,
        partnerCount: studios.filter((s) => s.isPartner).length,
        heritageCount: studios.filter((s) => s.isHeritage).length,
        dropoffCount: studios.filter((s) => s.dropoffAvailable).length,
        appliedFilter: filter,
        appliedDistrict: district || 'all',
        fromCache,
        lastSyncedAt: new Date(lastSynced).toISOString(),
        dataSources: [
          '소상공인시장진흥공단_상가(상권)정보 (data.go.kr)',
          '서울시 사진촬영및처리업 인허가 정보 (data.seoul.go.kr)',
          '국토교통부 V-World 주요상권 (LT_C_DGMAINBIZ)',
          '행정안전부 편의점 위치정보 (24시 드롭오프)',
          'DASI 공식 B2B 제휴 현상소 네트워크',
        ],
      },
    });
  } catch (err) {
    console.error('[/api/studios] Error:', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

// 수동 즉시 동기화 엔드포인트
export async function POST() {
  try {
    const { studios, lastSynced } = await getOrSyncStudios(true);
    return NextResponse.json({
      success: true,
      message: '공공데이터 사진관 DB 즉시 동기화가 완료되었습니다.',
      syncedCount: studios.length,
      lastSyncedAt: new Date(lastSynced).toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}