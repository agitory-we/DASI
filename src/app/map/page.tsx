'use client';

import React, { useState, useMemo } from 'react';
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
  Compass
} from 'lucide-react';
import { useDasi } from '@/context/DasiContext';
import { ReviewModal } from '@/components/common/ReviewModal';

export default function MapPage() {
  const { analogSpots, isLoadingData, showToast, savedSpotIds, toggleSaveSpot } = useDasi();
  const [selectedCategory, setSelectedCategory] = useState<SpotCategory | 'all'>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [activeSpotId, setActiveSpotId] = useState<string>('');
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState<boolean>(false);
  const [isSpotReviewModalOpen, setIsSpotReviewModalOpen] = useState<boolean>(false);
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

  const sortedSpots = useMemo(() => {
    return [...analogSpots].filter((spot) => {
      const matchCategory = selectedCategory === 'all' || spot.category === selectedCategory;
      const matchArea = selectedArea === 'all' || spot.area === selectedArea;
      return matchCategory && matchArea;
    }).sort((a, b) => {
      if (!sortByNearest || !userLocation) return 0;
      const distA = getDistanceKm(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distB = getDistanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return distA - distB;
    });
  }, [analogSpots, selectedCategory, selectedArea, sortByNearest, userLocation]);

  const activeSpot = useMemo(() => {
    return sortedSpots.find((s) => s.id === activeSpotId) || sortedSpots[0] || analogSpots[0];
  }, [sortedSpots, activeSpotId, analogSpots]);

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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>실시간 아날로그 스팟 &amp; 당일 스캔 맵</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-vintage-900">
            전국 현상소 · 필름 자판기 지도
          </h1>
          <p className="text-xs sm:text-sm text-vintage-600 mt-1 max-w-2xl leading-relaxed">
            을지로, 충무로, 성수동 등 당일 스캔이 가능한 현상소와 24시 필름 자판기, 40년 명장 수리실의 위치와 색감 갤러리를 확인하세요.
          </p>
        </div>

        {/* Micro-Ads & GPS Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="px-4 py-2.5 rounded-xl border border-vintage-300 bg-white hover:bg-vintage-50 text-xs font-semibold text-vintage-800 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Compass className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-terracotta' : 'text-emerald-700'}`} />
            <span>{isLocating ? '위치 찾는 중...' : '내 주변 500m 스팟 찾기'}</span>
          </button>

          <button
            onClick={() => setIsPartnerModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
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

                  {spot.promoNotice && (
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
    </div>
  );
}