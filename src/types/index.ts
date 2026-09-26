export type CameraCategory = 'film' | 'digital_compact' | 'vintage_ccd';
export type ConditionGrade = 'Mint' | 'Excellent' | 'Good';

export interface Camera {
  id: string;
  name: string;
  brand: string;
  era: string; // 예: "1982년 출시"
  category: CameraCategory;
  conditionGrade: ConditionGrade;
  rentalPricePerDay: number; // 1일 대여료 (원)
  purchasePrice: number; // 소장 전환 가격 (원)
  shopId: string;
  shopName: string;
  pickupLocation: string; // 예: "을지로3가역 3번 출구 도보 2분"
  imageUrl: string;
  sampleImages: string[]; // 해당 카메라로 찍은 샘플 사진
  description: string;
  story: string; // 장인/큐레이터 코멘트
  specs: {
    lens: string;
    shutterSpeed: string;
    weight: string;
    battery: string;
    difficulty: '입문자 추천' | '중급' | '완전 수동';
  };
  isAvailable: boolean;
  rating: number;
  reviewsCount: number;
}

export interface PickupShop {
  id: string;
  name: string;
  area: string; // 예: "을지로", "충무로", "남대문"
  address: string;
  masterName: string;
  masterExperienceYears: number;
  masterQuote: string;
  contact: string;
  openHours: string;
  lat: number;
  lng: number;
  imageUrl: string;
}

export type SpotCategory = 'lab' | 'film_shop' | 'vending_machine' | 'repair' | 'pickup' | 'spot' | 'festival';

export interface SpotPhotoItem {
  id?: string;
  imageUrl: string;
  caption?: string;
  cameraModel?: string;
  filmType?: string;
  photographer?: string;
  likesCount?: number;
  labName?: string;
}

export interface AnalogSpot {
  id: string;
  name: string;
  category: SpotCategory;
  isMicroAdPartner: boolean; // 소액 홍보 파트너 여부
  isPartner?: boolean; // 공식 제휴 여부
  partnerBadgeText?: string;
  address: string;
  area: string;
  lat: number;
  lng: number;
  contact: string;
  openHours: string;
  todayScanCutoff?: string; // 예: "오늘 17:30 마감 시 당일 21:00 전송"
  filmStockStatus?: string; // 예: "코닥 울트라맥스400 재고 여유"
  scannerTypes?: string[]; // 예: ["Fuji Frontier SP3000", "Noritsu HS-1800"]
  sampleColorToneImages?: {
    scannerName: string;
    imageUrl: string;
    toneDescription: string;
  }[];
  promoNotice?: string; // 프로모션 문구
  isGovVerified?: boolean; // 서울시 공공데이터 인허가 인증 매장 여부
  subTags?: string[]; // 서브 필터 태그 (예: '당일스캔', '노리츠', '후지', '24시자판기', '오버홀')
  rating: number;
  reviewsCount: number;
  // ── 가동성 및 소요시간 정보 ──
  sameDayAvailable?: boolean; // 당일 즉시 가능 여부
  availabilityStatus?: 'immediate' | 'within_hours' | 'next_day'; // 즉시 / 수시간 내 / 익일
  filmDevelopLeadTime?: string; // 예: "당일 3시간 (17시 이전 접수)" 또는 "익일 24시간"
  repairLeadTime?: string; // 예: "현장 30분 기본점검 / 정밀 오버홀 3영업일"
  quickDeliveryAvailable?: boolean; // 서울 시내 3시간 당일 퀵 배송 지원
  hasQrDiscount?: boolean; // DASI 제휴 QR 10% 현장 할인 가능
  qrDiscountRate?: string; // 예: "현장 전 품목 10% 즉시 할인"
  // ── 핫스팟 및 축제 메타데이터 & 실촬영 사진 (Shot at this Spot) ──
  imageUrl?: string;
  photosTakenHere?: SpotPhotoItem[];
  goldenHourTip?: string;
  eventPeriod?: string;
  recommendedLenses?: string;
  tips?: string;
  source?: 'tourapi' | 'korea100' | 'manual';
  sourceId?: string;
  dropBox?: boolean;
  services?: string[];
  scanners?: string[];
  description?: string;
}

export type GigCategory = 'foreigner_tour' | 'sub_wedding' | 'daily_snap' | 'pet_walk';

export interface PhotoGig {
  id: string;
  title: string;
  category: GigCategory;
  creatorName: string;
  creatorAvatar: string;
  location: string;
  gearUsed: string[];
  pricePerHour: number;
  durationMinutes: number;
  rating: number;
  reviewsCount: number;
  portfolioImages: string[];
  tags: string[];
  description: string;
  isVerified: boolean;
  languages?: string[]; // 예: ["한국어", "English", "日本語"]
}

export interface RepairMaster {
  id: string;
  name: string;
  shopName: string;
  specialty: string;
  experienceYears: number;
  location: string;
  address: string;
  profileImage: string;
  quote: string;
  availableServices: {
    name: string;
    estimatedCost: string;
    duration: string;
  }[];
}

export interface UserCoupon {
  id: string;
  title: string;
  issuerName: string;
  discountText: string;
  validUntil: string;
  category: 'lab' | 'repair' | 'film' | 'rental';
  barcode?: string;
  code?: string;
  isUsed: boolean;
}

export interface EventOrHotSpot {
  id: string;
  type: 'festival' | 'hotspot' | 'seasonal' | 'golden_hour_alert' | 'film_pairing' | 'photo_walk';
  title: string;
  location: string;
  area?: string;                 // 지역 (을지로/홍대/성수/한강 등)
  periodOrTime: string;
  startDate?: string;            // YYYYMMDD (TourAPI 형식)
  endDate?: string;              // YYYYMMDD
  goldenHour: string;
  recommendedLenses: string;
  tips: string;
  imageUrl: string;
  tags: string[];
  season?: '봄' | '여름' | '가을' | '겨울';  // 계절 자동 분류
  sourceId?: string;             // TourAPI contentid
  source?: 'manual' | 'tourapi' | 'seoul_api'; // 데이터 출처
  lat?: number;
  lng?: number;
}

export interface Experience {
  id: string;
  type: 'photo_walk' | 'master_class';
  title: string;
  hostName: string;
  hostRole: string;
  hostAvatar: string;
  location: string;
  dateTime: string;
  duration: string;
  price: number;
  rentalPackageDiscount: string;
  capacity: string;
  description: string;
  imageUrl: string;
  included: string[];
}

export interface ProConsultationItem {
  id: string;
  vipCode: string;
  studioName: string;
  artistName: string;
  category: string;
  pricing: string;
  targetDate: string;
  location: string;
  contact: string;
  requestedAt: string;
  status: 'manager_contacting' | 'confirmed';
}

export interface CommunityPhoto {
  id: string;
  imageUrl: string;
  caption: string;
  cameraModel: string;
  filmType: string;
  labName: string;
  photographerName: string;
  photographerTier: 'filmmer' | 'photowalker' | 'legend';
  likesCount: number;
  location?: string;
  createdAt: string;
}

export interface PhotoStudio {
  id: string;
  name: string;
  category: 'lab' | 'heritage' | 'studio' | 'darkroom';
  address: string;
  jibunAddress?: string;
  lat: number;
  lng: number;
  tel?: string;
  openYear?: number;
  yearsInBusiness?: number;
  isHeritage: boolean;
  heritageTier?: 'master' | 'veteran';
  status: 'active' | 'closed';
  isPartner: boolean;
  partnerBenefit?: {
    discountText: string;
    perk: string;
    couponCode: string;
  };
  specialties: string[];
  commercialDistrict?: string;     // 국토부/V-World 주요상권 (예: '충무로 상권', '을지로 골목')
  dropoffAvailable?: boolean;      // 24시 편의점 무인 드롭오프 연계 가능 여부
  dropoffStoreName?: string;       // 인근 편의점 거점명 (예: 'GS25 충무로역점')
}

