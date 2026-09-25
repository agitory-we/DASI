'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { AnalogSpot, SpotCategory } from '@/types';
import {
  MapPin,
  Clock,
  Sparkles,
  Phone,
  Navigation,
  CheckCircle2,
  Filter,
  Flame,
  Layers,
  Store,
  ChevronRight,
  Info,
  X,
  Heart,
  ExternalLink,
  Compass,
  QrCode,
  Award,
  Zap,
  Ticket,
  Wrench
} from 'lucide-react';
import { useDasi } from '@/context/DasiContext';
import { ReviewModal } from '@/components/common/ReviewModal';
import { LabQrDropModal } from '@/components/common/LabQrDropModal';
import { SpotCheckInModal } from '@/components/explore/SpotCheckInModal';
import { QrCouponModal } from '@/components/cabinet/QrCouponModal';
import { StudioDirectoryModal } from '@/components/studio/StudioDirectoryModal';
import { KOREA_TOP_100_SPOTS } from '@/data/koreaTop100Spots';

export interface MapContentProps {
  defaultSpotId?: string;
}

export default function MapContent({ defaultSpotId }: MapContentProps = {}) {
  const { analogSpots, isLoadingData, showToast, savedSpotIds, toggleSaveSpot, communityPhotos } = useDasi();
  const [selectedCategory, setSelectedCategory] = useState<SpotCategory | 'all'>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [activeSpotId, setActiveSpotId] = useState<string>(defaultSpotId || '');
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState<boolean>(false);
  const [isSpotReviewModalOpen, setIsSpotReviewModalOpen] = useState<boolean>(false);
  const [isLabQrModalOpen, setIsLabQrModalOpen] = useState<boolean>(false);
  const [isSpotCheckInOpen, setIsSpotCheckInOpen] = useState<boolean>(false);
  const [isStudioModalOpen, setIsStudioModalOpen] = useState<boolean>(false);
  const [selectedCouponSpot, setSelectedCouponSpot] = useState<AnalogSpot | null>(null);
  const [filterSameDayOnly, setFilterSameDayOnly] = useState<boolean>(false);
  const [filterQrDiscountOnly, setFilterQrDiscountOnly] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [sortByNearest, setSortByNearest] = useState<boolean>(false);
  const [selectedToneScanner, setSelectedToneScanner] = useState<string>('');


  // Haversine Distance formula in meters/km
  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      showToast('브라우저에서 위치 서비스를 지원하지 않습니다.', 'warning');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setSortByNearest(true);
        setIsLocating(false);
        showToast('현재 내 위치를 기준으로 가장 가까운 스팟을 정렬합니다.', 'success');
      },
      () => {
        // Fallback to Jongno / Euljiro central coordinates if denied
        setUserLocation({ lat: 37.5665, lng: 126.9910 });
        setSortByNearest(true);
        setIsLocating(false);
        showToast('을지로 중심 좌표를 기준으로 거리순 정렬합니다.', 'info');
      },
      { timeout: 5000 }
    );
  };

  const [tourApiNearbySpots, setTourApiNearbySpots] = useState<AnalogSpot[]>([]);
  const [studiosList, setStudiosList] = useState<AnalogSpot[]>([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);

  // defaultSpotId 전달 시 자동 활성화 및 카드 포커스 스크롤
  useEffect(() => {
    if (defaultSpotId) {
      setActiveSpotId(defaultSpotId);
      const timer = setTimeout(() => {
        const el = document.getElementById(`spot-card-${defaultSpotId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [defaultSpotId]);

  // 서울시 사진관/노포 현상소 공공 융합 데이터 동적 로드
  useEffect(() => {
    fetch('/api/studios')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.studios)) {
          const mapped: AnalogSpot[] = data.studios.map((st: any) => ({
            id: st.id,
            name: st.name,
            category: (st.category === 'lab' || st.category === 'darkroom' ? 'lab' : 'film_shop') as SpotCategory,
            isPartner: st.isPartner,
            partnerBadgeText: st.isPartner ? '⭐ DASI 제휴 20% 할인' : st.isHeritage ? `🏛️ ${st.yearsInBusiness}년 노포` : undefined,
            address: st.address,
            area: st.address.includes('중구') ? '을지로/충무로' : st.address.includes('종로') ? '종로' : st.address.includes('성동') ? '성수' : '홍대/연남',
            lat: st.lat,
            lng: st.lng,
            contact: st.tel || '02-2270-0000',
            openHours: st.isHeritage ? '10:00 - 19:00 (일요일 휴무)' : '11:00 - 20:00 (연중무휴)',
            rating: st.isHeritage ? 4.9 : 4.8,
            reviewsCount: st.isHeritage ? 89 : 45,
            services: st.specialties || ['필름 현상', '스캔'],
            scanners: ['노리츠/후지 고정밀'],
            description: st.isPartner && st.partnerBenefit ? `${st.partnerBenefit.discountText} — ${st.partnerBenefit.perk}` : `${st.yearsInBusiness ? `${st.yearsInBusiness}년 전통 ` : ''}${st.commercialDistrict || '서울 사진관'}`,
            imageUrl: st.isPartner
              ? 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
            sameDayAvailable: true,
            hasQrDiscount: st.isPartner,
            qrDiscountRate: st.isPartner ? '20%' : undefined,
            dropBox: st.dropoffAvailable,
          }));
          setStudiosList(mapped);
        }
      })
      .catch((err) => console.error('Failed to load studios on map:', err));
  }, []);

  // 한국관광 100선 및 공식 캐치프레이즈를 AnalogSpot 형태로 매핑
  const top100AnalogSpots: AnalogSpot[] = useMemo(() => {
    return KOREA_TOP_100_SPOTS.map((s) => ({
      id: s.id,
      name: s.name,
      category: 'pickup' as SpotCategory, // 출사 포인트/인증 거점
      isMicroAdPartner: false,
      partnerBadgeText: '한국관광 100선',
      address: s.address,
      area: s.region,
      lat: s.lat,
      lng: s.lng,
      contact: '한국관광공사 1330',
      openHours: '연중무휴 (일출~일몰 권장)',
      rating: 4.9,
      reviewsCount: 38,
      services: ['한국관광100선', '공식캐치프레이즈', '출사인증', s.recommendedLens],
      scanners: [s.filmRecommendation],
      description: `"${s.catchphrase}" — ${s.goldenHour}`,
      imageUrl: s.imageUrl,
      isPartner: true,
      dropBox: false,
    }));
  }, []);

  const handleFetchTourApiNearby = async () => {
    setIsLoadingNearby(true);
    const targetLat = userLocation?.lat || 37.5665;
    const targetLng = userLocation?.lng || 126.9780;
    try {
      const res = await fetch(`/api/spots/nearby?lat=${targetLat}&lng=${targetLng}&radius=3000&numOfRows=15`);
      if (res.ok) {
        const json = await res.json();
        if (json.spots && json.spots.length > 0) {
          const mapped: AnalogSpot[] = json.spots.map((item: any) => ({
            id: `tourapi-nearby-${item.contentid}`,
            name: item.title,
            category: 'pickup' as SpotCategory,
            isMicroAdPartner: false,
            address: item.addr1 + (item.addr2 ? ` ${item.addr2}` : ''),
            area: '서울',
            lat: parseFloat(item.mapy) || targetLat,
            lng: parseFloat(item.mapx) || targetLng,
            contact: item.tel || '1330',
            openHours: '상시 관람',
            rating: 4.8,
            reviewsCount: 15,
            services: ['한국관광공사공인', '실시간위치기반'],
            scanners: ['자연광 표준 렌즈 권장'],
            description: `한국관광공사 실시간 위치기반 공공데이터 (현재 위치 기준 약 ${Math.round(parseFloat(item.dist || '0'))}m 거리)`,
            imageUrl: item.firstimage || 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=800&auto=format&fit=crop&q=80',
            isPartner: false,
            dropBox: false,
          }));
          setTourApiNearbySpots(mapped);
          showToast(`내 주변 3km 내 한국관광공사 출사지 ${mapped.length}곳을 실시간 불러왔습니다!`, 'success');
        } else {
          showToast('주변 3km 내 관광공사 등록 스팟이 없습니다.', 'info');
        }
      }
    } catch {
      showToast('주변 스팟 로딩에 실패했습니다.', 'warning');
    } finally {
      setIsLoadingNearby(false);
    }
  };

  const combinedSpots = useMemo(() => {
    return [...analogSpots, ...top100AnalogSpots, ...tourApiNearbySpots, ...studiosList];
  }, [analogSpots, top100AnalogSpots, tourApiNearbySpots, studiosList]);

  const sortedSpots = useMemo(() => {
    return [...combinedSpots].filter((spot) => {
      const matchCategory = selectedCategory === 'all' || spot.category === selectedCategory;
      const matchArea = selectedArea === 'all' || spot.area === selectedArea;
      const matchSameDay = !filterSameDayOnly || spot.sameDayAvailable;
      const matchQrDiscount = !filterQrDiscountOnly || spot.hasQrDiscount;
      return matchCategory && matchArea && matchSameDay && matchQrDiscount;
    }).sort((a, b) => {
      if (!sortByNearest || !userLocation) return 0;
      const distA = getDistanceKm(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distB = getDistanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return distA - distB;
    });
  }, [combinedSpots, selectedCategory, selectedArea, filterSameDayOnly, filterQrDiscountOnly, sortByNearest, userLocation]);

  const activeSpot = useMemo(() => {
    return sortedSpots.find((s) => s.id === activeSpotId) || sortedSpots[0] || combinedSpots[0];
  }, [sortedSpots, activeSpotId, combinedSpots]);

  const getCategoryIcon = (category: SpotCategory) => {
    switch (category) {
      case 'lab':
        return '🧪';
      case 'film_shop':
        return '🎞️';
      case 'vending_machine':
        return '⚡';
      case 'repair':
        return '🔧';
      case 'pickup':
        return '📷';
      default:
        return '📍';
    }
  };

  const openNavigation = (spot: AnalogSpot, service: 'kakao' | 'naver') => {
    if (service === 'kakao') {
      window.open(`https://map.kakao.com/link/to/${encodeURIComponent(spot.name)},${spot.lat},${spot.lng}`, '_blank');
    } else {
      window.open(`https://map.naver.com/v5/search/${encodeURIComponent(spot.address)}`, '_blank');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vintage-200/80 hover:bg-vintage-300 text-vintage-800 text-xs font-bold transition-all shadow-2xs group"
              title="메인 웹(홈) 화면으로 돌아가기"
            >
              <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
              <span>웹으로 돌아가기</span>
            </Link>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <MapPin className="w-3.5 h-3.5" />
              <span>실시간 아날로그 스팟 &amp; 당일 스캔 맵</span>
            </div>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-vintage-900">
            전국 현상소 · 필름 자판기 지도
          </h1>
          <p className="text-xs sm:text-sm text-vintage-600 mt-1 max-w-2xl leading-relaxed">
            을지로, 충무로, 성수동 등 당일 스캔이 가능한 현상소와 24시 필름 자판기, 40년 명장 수리실의 위치와 색감 갤러리를 확인하세요.
          </p>
        </div>

        {/* Micro-Ads & GPS Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="px-3.5 py-2.5 rounded-xl border border-vintage-300 bg-white hover:bg-vintage-50 text-xs font-semibold text-vintage-800 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Compass className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-terracotta' : 'text-emerald-700'}`} />
            <span>{isLocating ? '위치 찾는 중...' : '내 주변 거리순 정렬'}</span>
          </button>

          <button
            onClick={handleFetchTourApiNearby}
            disabled={isLoadingNearby}
            className="px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-900 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isLoadingNearby ? 'animate-spin text-amber-600' : 'text-amber-600'}`} />
            <span>{isLoadingNearby ? '공공데이터 스캔 중...' : '📍 주변 3km 공공데이터 출사지 로딩'}</span>
          </button>

          <button
            onClick={() => setIsStudioModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-500/15 hover:bg-amber-500/25 text-xs font-bold text-amber-900 transition-colors flex items-center gap-1.5 shadow-2xs"
            title="서울시 사진관 & 노포 현상소 (20% 할인 QR & 업력)"
          >
            <Store className="w-3.5 h-3.5 text-terracotta" />
            <span>🏛️ 서울 사진관·현상소 (제휴 QR)</span>
          </button>

          <button
            onClick={() => setIsPartnerModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Store className="w-3.5 h-3.5" />
            <span>상점 입점 제휴 신청</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-vintage-200 pb-4">
        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: '전체 스팟' },
            { id: 'lab', label: '🧪 당일 현상소' },
            { id: 'vending_machine', label: '⚡ 24시 필름자판기' },
            { id: 'film_shop', label: '🎞️ 필름 판매점' },
            { id: 'repair', label: '🔧 명장 수리실' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === tab.id
                  ? 'bg-vintage-900 text-white shadow-xs'
                  : 'bg-white text-vintage-700 hover:bg-vintage-100 border border-vintage-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Region Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-vintage-500 font-medium">지역 필터:</span>
          {['all', '을지로', '충무로', '성수', '남대문'].map((area) => (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedArea === area
                  ? 'bg-terracotta text-white font-bold'
                  : 'bg-vintage-100 text-vintage-700 hover:bg-vintage-200'
              }`}
            >
              {area === 'all' ? '전체' : area}
            </button>
          ))}
        </div>

        {/* Instant & QR Benefit Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-vintage-200/60 w-full">
          <span className="text-vintage-500 text-xs font-semibold">조건별 모아보기:</span>
          <button
            onClick={() => setFilterSameDayOnly((prev) => !prev)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterSameDayOnly
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span>⚡ 당일 즉시 가능 매장만</span>
            {filterSameDayOnly && <CheckCircle2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setFilterQrDiscountOnly((prev) => !prev)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterQrDiscountOnly
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <span>🎟️ DASI 제휴 QR 할인 매장만</span>
            {filterQrDiscountOnly && <CheckCircle2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Map & List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Spot Cards List */}
        <div className="lg:col-span-5 space-y-4 max-h-[750px] overflow-y-auto pr-2">
          {isLoadingData ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-5 rounded-2xl bg-white border border-vintage-200 animate-pulse space-y-3">
                  <div className="h-4 bg-vintage-200 rounded w-1/3" />
                  <div className="h-5 bg-vintage-100 rounded w-2/3" />
                  <div className="h-3 bg-vintage-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : sortedSpots.length === 0 ? (
            <div className="text-center py-12 p-6 rounded-2xl bg-vintage-50 border border-vintage-200 text-xs text-vintage-500">
              선택하신 조건에 해당하는 스팟이 없습니다.
            </div>
          ) : (
            sortedSpots.map((spot) => {
              const isSaved = savedSpotIds.includes(spot.id);
              const isSelected = activeSpot?.id === spot.id;
              const distanceKm = userLocation
                ? getDistanceKm(userLocation.lat, userLocation.lng, spot.lat, spot.lng).toFixed(1)
                : null;

              return (
                <div
                  key={spot.id}
                  id={`spot-card-${spot.id}`}
                  onClick={() => setActiveSpotId(spot.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 relative ${
                    isSelected
                      ? 'bg-terracotta/5 border-terracotta shadow-xs'
                      : 'bg-white border-vintage-200 hover:border-vintage-300 hover:bg-vintage-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{getCategoryIcon(spot.category)}</span>
                      <h3 className="font-serif text-base font-bold text-vintage-900">
                        {spot.name}
                      </h3>
                      {spot.isMicroAdPartner && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 font-bold border border-amber-300/40">
                          {spot.partnerBadgeText || '공식 제휴점'}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveSpot(spot.id);
                      }}
                      className="p-1 text-vintage-400 hover:text-terracotta transition-colors"
                      title={isSaved ? '저장됨' : '출사 위시리스트 저장'}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-terracotta text-terracotta' : ''}`} />
                    </button>
                  </div>

                  <p className="text-xs text-vintage-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-vintage-400 shrink-0" />
                    <span className="truncate">{spot.address}</span>
                    {distanceKm && (
                      <span className="ml-auto font-mono text-terracotta font-bold shrink-0">
                        {distanceKm}km
                      </span>
                    )}
                  </p>

                  {/* Availability & Lead Time Specs */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {spot.sameDayAvailable && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        당일 즉시 가능
                      </span>
                    )}
                    {spot.filmDevelopLeadTime && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-medium border border-purple-200/50">
                        <Clock className="w-3 h-3 text-purple-500" />
                        현상: {spot.filmDevelopLeadTime}
                      </span>
                    )}
                    {spot.repairLeadTime && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-medium border border-amber-200/50">
                        <Wrench className="w-3 h-3 text-amber-600" />
                        점검: {spot.repairLeadTime}
                      </span>
                    )}
                    {spot.quickDeliveryAvailable && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-200/50">
                        <Zap className="w-3 h-3 text-blue-500" />
                        3시간 퀵 가능
                      </span>
                    )}
                  </div>

                  {/* Highlights (당일 스캔 or 필름 재고) */}
                  {spot.todayScanCutoff && (
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-900 text-[11px] font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{spot.todayScanCutoff}</span>
                    </div>
                  )}

                  {spot.filmStockStatus && (
                    <div className="text-[11px] text-vintage-600">
                      🎞️ <strong>필름 현황:</strong> {spot.filmStockStatus}
                    </div>
                  )}

                  {/* QR Discount Badge & Quick Action */}
                  {spot.hasQrDiscount && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-rose-800 text-[11px] font-bold">
                        <QrCode className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>{spot.qrDiscountRate || 'DASI 제휴 10% 즉시 할인'}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCouponSpot(spot);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold transition-colors shadow-2xs shrink-0"
                      >
                        QR 발급
                      </button>
                    </div>
                  )}

                  {spot.promoNotice && !spot.hasQrDiscount && (
                    <div className="text-[11px] text-terracotta font-semibold">
                      🎁 {spot.promoNotice}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT: Active Spot Detail & Interactive Viewport */}
        <div className="lg:col-span-7 space-y-6">
          {activeSpot && (
            <div className="rounded-3xl bg-white border border-vintage-200 overflow-hidden shadow-xs space-y-6">
              {/* Map Canvas Mock with Real Coordinates & Pins */}
              <div className="relative aspect-16/9 bg-stone-900 rounded-t-3xl overflow-hidden flex items-center justify-center p-6 text-center text-white">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-40 filter grayscale contrast-125"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&auto=format&fit=crop&q=80')`,
                  }}
                />
                <div className="absolute inset-0 bg-radial from-transparent to-black/80" />

                <div className="relative z-10 space-y-2 max-w-md">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta text-white text-xs font-bold animate-bounce">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{activeSpot.name}</span>
                  </div>
                  <div className="font-mono text-xs text-vintage-300">
                    좌표: {activeSpot.lat.toFixed(4)}, {activeSpot.lng.toFixed(4)}
                  </div>
                  <p className="text-xs text-vintage-300">
                    {activeSpot.address}
                  </p>

                  <div className="flex justify-center gap-2 pt-2">
                    <button
                      onClick={() => openNavigation(activeSpot, 'kakao')}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-stone-950 text-xs font-bold hover:bg-amber-300 transition-colors flex items-center gap-1"
                    >
                      <span>카카오맵 길찾기</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => openNavigation(activeSpot, 'naver')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors flex items-center gap-1"
                    >
                      <span>네이버 지도 길찾기</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Spot Body Details */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-vintage-100 pb-4">
                  <div>
                    <span className="text-xs text-vintage-500">{activeSpot.area} 권역</span>
                    <h2 className="font-serif text-2xl font-bold text-vintage-900 mt-0.5">
                      {activeSpot.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 text-xs text-vintage-600">
                      <span>★ {activeSpot.rating.toFixed(2)} ({activeSpot.reviewsCount}개의 방문 리뷰)</span>
                      <span>·</span>
                      <span>{activeSpot.openHours}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeSpot.category === 'lab' ? (
                      <button
                        onClick={() => setIsLabQrModalOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                        title="현상소 카운터 방문 1초 QR 접수 (+150P)"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>🧪 1초 스캔 접수 QR (+150P)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsSpotCheckInOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                        title="현장 방문 브라스 핀 체크인 (+200P)"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>📍 현장 체크인 QR (+200P)</span>
                      </button>
                    )}
                    <button
                      onClick={() => setIsSpotReviewModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                      title="방문 후기 작성하고 +100P 받기"
                    >
                      <span>✍️ 리뷰 (+100P)</span>
                    </button>
                    <a
                      href={`tel:${activeSpot.contact}`}
                      className="px-4 py-2 rounded-xl bg-vintage-100 hover:bg-vintage-200 text-vintage-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-vintage-600" />
                      <span>{activeSpot.contact}</span>
                    </a>
                  </div>

                </div>

                {/* 실시간 가동성 & 소요 시간 스펙 박스 */}
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-vintage-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-vintage-900 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      실시간 가동 현황 &amp; 작업 소요 시간
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {activeSpot.sameDayAvailable ? '🟢 당일 작업 즉시 가능' : '🟡 순차 처리 중'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-vintage-100 space-y-1">
                      <div className="text-[11px] text-vintage-500 font-medium">현상·스캔 소요 시간</div>
                      <div className="font-bold text-vintage-900">{activeSpot.filmDevelopLeadTime || '당일 3~4시간 (17시 이전 접수 시)'}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-vintage-100 space-y-1">
                      <div className="text-[11px] text-vintage-500 font-medium">카메라 점검·수리 소요</div>
                      <div className="font-bold text-vintage-900">{activeSpot.repairLeadTime || '현장 30분 기본점검 (정밀 3일)'}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-vintage-100 space-y-1">
                      <div className="text-[11px] text-vintage-500 font-medium">배송 / 퀵 서비스</div>
                      <div className="font-bold text-emerald-700">{activeSpot.quickDeliveryAvailable ? '서울 전역 3시간 퀵 가능' : '현장 방문 수령 전용'}</div>
                    </div>
                  </div>

                  {/* DASI 제휴 현장 할인 QR 발급 배너 */}
                  {activeSpot.hasQrDiscount && (
                    <div className="mt-2 p-3.5 rounded-xl bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                          <Ticket className="w-4 h-4 text-rose-600" />
                          <span>DASI 회원 현장 즉시 할인 제휴처</span>
                        </div>
                        <p className="text-[11px] text-rose-700 mt-0.5">
                          {activeSpot.qrDiscountRate || '방문 시 현장 전 품목 10% 즉시 할인 혜택 제공'}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedCouponSpot(activeSpot)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>현장 제시용 할인 QR 발급</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Scanner Color Tone Showcase (현상소일 경우) */}
                {activeSpot.sampleColorToneImages && activeSpot.sampleColorToneImages.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-vintage-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-terracotta" />
                        보유 스캐너별 색감 갤러리 (노리츠 vs 후지)
                      </span>
                      <span className="text-[11px] text-vintage-500">실제 현상 스캔본 샘플</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeSpot.sampleColorToneImages.map((tone, idx) => (
                        <div key={idx} className="rounded-2xl border border-vintage-200 overflow-hidden bg-vintage-50">
                          <div className="aspect-4/3 relative">
                            <img src={tone.imageUrl} alt={tone.scannerName} className="w-full h-full object-cover" />
                            <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/75 text-white text-[10px] font-bold backdrop-blur-xs">
                              {tone.scannerName}
                            </span>
                          </div>
                          <div className="p-3 text-xs text-vintage-700 leading-snug">
                            {tone.toneDescription}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 실제 유저 스캔 출사 사진 크로스 피딩 (Sprint 3-C) */}
                {(() => {
                  const matchedLabPhotos = communityPhotos.filter(p => p.labName === activeSpot.name);
                  if (matchedLabPhotos.length === 0) return null;
                  return (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-vintage-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          이 현상소에서 스캔된 실제 유저 출사 사진 ({matchedLabPhotos.length}장)
                        </span>
                        <span className="text-[10px] text-vintage-500">실시간 피드 연동</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {matchedLabPhotos.map((photo) => (
                          <div key={photo.id} className="rounded-2xl border border-vintage-200 overflow-hidden bg-vintage-900 group relative aspect-[4/3]">
                            <img src={photo.imageUrl} alt={photo.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-2.5 text-white">
                              <span className="text-[10px] font-bold truncate">📷 {photo.cameraModel}</span>
                              <span className="text-[9px] text-amber-300 truncate">🎞️ {photo.filmType}</span>
                              <span className="text-[8px] text-vintage-300 truncate mt-0.5">&ldquo;{photo.caption}&rdquo;</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Micro-Ad Promotion Box */}
                {activeSpot.promoNotice && (
                  <div className="p-4 rounded-2xl bg-terracotta/5 border border-terracotta/20 flex items-start gap-3">
                    <Flame className="w-5 h-5 text-terracotta shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-vintage-900">DASI 회원 단독 제휴 혜택</div>
                      <p className="text-xs text-vintage-700 mt-0.5 leading-relaxed">
                        {activeSpot.promoNotice} (방문 시 DASI 웹 화면을 보여주시면 즉시 적용됩니다)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* B2B MICRO-ADS PROMOTION BANNER (Turn 5 Charter) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-vintage-900 to-vintage-800 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-vintage-700">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
            <Flame className="w-3 h-3" />
            <span>월 14,900원 로컬 상점 소액 홍보 (Micro-Ads)</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-white">
            현상소·필름샵·수리실 사장님이신가요? DASI 지도에 황금 핀을 꽂으세요
          </h2>
          <p className="text-xs text-vintage-300 leading-relaxed">
            비싼 인스타 광고 대신, 주말마다 출사 나가는 100% 진성 필름 유저들에게 '오늘 당일 스캔 가능', '실시간 필름 재고 현황', '색감 갤러리'를 직접 알릴 수 있습니다.
          </p>
        </div>

        <button
          onClick={() => setIsPartnerModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-terracotta hover:bg-terracotta-light text-white text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 shrink-0 flex items-center gap-2"
        >
          <Store className="w-4 h-4" />
          <span>월 14,900원 파트너 핀 신청 →</span>
        </button>
      </div>

      {/* PARTNER REGISTRATION MODAL */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-vintage-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-vintage-100 pb-3">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-terracotta" />
                <h3 className="font-serif text-xl font-bold text-vintage-900">
                  아날로그 스팟 입점 &amp; 소액 홍보
                </h3>
              </div>
              <button
                onClick={() => setIsPartnerModalOpen(false)}
                className="p-1.5 text-vintage-400 hover:text-vintage-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-vintage-600 leading-relaxed">
              현상소, 필름 자판기, 빈티지 샵을 운영 중이신가요?
              DASI 지도 상단 노출 및 '오늘 당일 스캔' 실시간 마감 알림을 통해 주말 출사객을 직접 매장으로 유치하세요.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-vintage-800 block mb-1">상점/현상소 명칭</label>
                <input
                  type="text"
                  placeholder="예: 을지로 망우삼림"
                  className="w-full bg-vintage-50 border border-vintage-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-terracotta"
                />
              </div>

              <div>
                <label className="font-bold text-vintage-800 block mb-1">매장 주소 및 연락처</label>
                <input
                  type="text"
                  placeholder="서울 중구 을지로 108 / 02-1234-5678"
                  className="w-full bg-vintage-50 border border-vintage-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-terracotta"
                />
              </div>

              <div>
                <label className="font-bold text-vintage-800 block mb-1">보유 스캐너 및 특장점</label>
                <textarea
                  rows={2}
                  placeholder="예: 노리츠 HS-1800 보유, 당일 스캔 3시간 내 완료"
                  className="w-full bg-vintage-50 border border-vintage-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-terracotta"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setIsPartnerModalOpen(false);
                showToast('입점 제휴 신청이 접수되었습니다. 담당자가 24시간 내 연락드립니다.', 'success');
              }}
              className="w-full py-3 rounded-xl bg-terracotta hover:bg-terracotta-light text-white text-xs sm:text-sm font-bold transition-colors shadow-xs"
            >
              제휴 입점 신청서 제출하기
            </button>
          </div>
        </div>
      )}

      {/* 아날로그 스팟 방문 리뷰 모달 */}
      {isSpotReviewModalOpen && activeSpot && (
        <ReviewModal
          isOpen={isSpotReviewModalOpen}
          onClose={() => setIsSpotReviewModalOpen(false)}
          targetType={activeSpot.category === 'lab' ? 'lab' : 'spot'}
          targetId={activeSpot.id}
          targetName={activeSpot.name}
          onSuccess={() => {
            showToast(`${activeSpot.name} 방문 리뷰가 등록되었습니다! (+100P 적립)`, 'success');
          }}
        />
      )}

      {/* 현상소 1초 스마트 스캔 접수 QR 모달 */}
      {isLabQrModalOpen && activeSpot && (
        <LabQrDropModal
          isOpen={isLabQrModalOpen}
          onClose={() => setIsLabQrModalOpen(false)}
          defaultLabName={activeSpot.name}
          onSuccess={() => {
            showToast(`${activeSpot.name} 1초 스캔 접수가 완료되었습니다! (+150P 적립)`, 'success');
          }}
        />
      )}

      {/* 스팟 현장 브라스 핀 체크인 QR 모달 */}
      {isSpotCheckInOpen && activeSpot && (
        <SpotCheckInModal
          isOpen={isSpotCheckInOpen}
          onClose={() => setIsSpotCheckInOpen(false)}
          spotTitle={activeSpot.name}
          spotLocation={activeSpot.address}
          onSuccess={() => {
            showToast(`${activeSpot.name} 현장 체크인이 완료되었습니다! (+200P 적립)`, 'success');
          }}
        />
      )}

      {/* DASI 공식 제휴 현장 즉시 할인 QR 쿠폰 모달 */}
      {selectedCouponSpot && (
        <QrCouponModal
          isOpen={!!selectedCouponSpot}
          onClose={() => setSelectedCouponSpot(null)}
          shopName={selectedCouponSpot.name}
          discountText={selectedCouponSpot.qrDiscountRate || 'DASI 공식 제휴 10% 현장 즉시 할인'}
          categoryName={selectedCouponSpot.category === 'lab' ? '당일 현상·스캔 제휴처' : selectedCouponSpot.category === 'repair' ? '명장 정밀 수리실' : '필름 & 카메라 전문점'}
          leadTime={selectedCouponSpot.filmDevelopLeadTime || selectedCouponSpot.repairLeadTime || '당일 현장 즉시 적용'}
        />
      )}

      {/* 서울시 사진관 & 노포 현상소 공공 융합 디렉토리 모달 */}
      <StudioDirectoryModal
        isOpen={isStudioModalOpen}
        onClose={() => setIsStudioModalOpen(false)}
      />
    </div>
  );
}