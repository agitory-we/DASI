'use client';

import React, { useState } from 'react';
import { AnalogSpot, SpotCategory } from '@/types';
import { mockAnalogSpots } from '@/data/mockData';
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
  Heart
} from 'lucide-react';
import { useDasi } from '@/context/DasiContext';

export default function MapPage() {
  const { showToast, savedSpotIds, toggleSaveSpot } = useDasi();
  const [selectedCategory, setSelectedCategory] = useState<SpotCategory | 'all'>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [activeSpot, setActiveSpot] = useState<AnalogSpot>(mockAnalogSpots[0]);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const [sortByNearest, setSortByNearest] = useState<boolean>(false);

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
      },
      () => {
        // Fallback to Jongno / Euljiro central coordinates if denied
        setUserLocation({ lat: 37.5665, lng: 126.9910 });
        setSortByNearest(true);
        setIsLocating(false);
      },
      { timeout: 5000 }
    );
  };

  const sortedSpots = [...mockAnalogSpots].filter((spot) => {
    const matchCategory = selectedCategory === 'all' || spot.category === selectedCategory;
    const matchArea = selectedArea === 'all' || spot.area === selectedArea;
    return matchCategory && matchArea;
  }).sort((a, b) => {
    if (!sortByNearest || !userLocation) return 0;
    const distA = getDistanceKm(userLocation.lat, userLocation.lng, a.lat, a.lng);
    const distB = getDistanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
    return distA - distB;
  });

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
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-2xs ${
              sortByNearest
                ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-200'
                : 'bg-white hover:bg-vintage-50 border-vintage-300 text-vintage-800'
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? '위치 측정 중...' : sortByNearest ? '📍 내 주변순 정렬됨' : '내 위치 주변 찾기'}</span>
          </button>

          <button
            onClick={() => setIsPartnerModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all shadow-2xs shrink-0"
          >
            <Store className="w-4 h-4 text-amber-700" />
            <span>사장님 파트너 핀 등록 (월 1.4만)</span>
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-vintage-200 shadow-2xs">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: '전체 스팟', icon: '📍' },
            { id: 'lab', label: '현상·스캔소', icon: '🧪' },
            { id: 'vending_machine', label: '24시 필름 자판기', icon: '⚡' },
            { id: 'repair', label: '수리 명장실', icon: '🔧' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as SpotCategory | 'all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                selectedCategory === cat.id
                  ? 'bg-vintage-900 text-white shadow-xs'
                  : 'bg-vintage-50 text-vintage-700 hover:bg-vintage-100 border border-vintage-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Area Filters */}
        <div className="flex items-center gap-1.5 text-xs text-vintage-500">
          <span className="font-semibold text-vintage-700">지역:</span>
          {['all', '을지로', '충무로', '성수', '남대문'].map((area) => (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedArea === area
                  ? 'bg-terracotta text-white font-bold'
                  : 'hover:bg-vintage-100 text-vintage-700'
              }`}
            >
              {area === 'all' ? '전체 서울' : area}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Map Layout (Map Canvas + Detail Sheet) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[560px]">
        {/* Left Simulated Interactive Map Canvas */}
        <div className="lg:col-span-7 relative rounded-3xl bg-vintage-200/60 border border-vintage-300 overflow-hidden shadow-inner flex flex-col justify-between p-6">
          {/* Simulated Map Grid / Roads */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#80543f_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {/* Top Floating Legend */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-vintage-300 text-xs font-bold text-vintage-800 shadow-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{userLocation ? '현재 내 GPS 위치 기반 반경' : '서울 중구 을지로·충무로 중심'}</span>
            </div>
            <span className="text-[11px] text-vintage-600 bg-white/80 px-2.5 py-1 rounded-lg border border-vintage-200">
              검색된 장소: {sortedSpots.length}곳
            </span>
          </div>

          {/* Interactive Spot Pins on Canvas */}
          <div className="relative z-10 my-auto py-12 flex flex-wrap justify-around items-center gap-6">
            {sortedSpots.map((spot) => {
              const isSelected = activeSpot.id === spot.id;
              const dist = userLocation
                ? getDistanceKm(userLocation.lat, userLocation.lng, spot.lat, spot.lng)
                : null;

              return (
                <div
                  key={spot.id}
                  onClick={() => setActiveSpot(spot)}
                  className={`cursor-pointer transition-all duration-300 transform flex flex-col items-center group ${
                    isSelected ? 'scale-110 z-20' : 'hover:scale-105 z-10'
                  }`}
                >
                  {/* Pin Bubble */}
                  <div
                    className={`px-3 py-1.5 rounded-2xl border flex items-center gap-1.5 shadow-md transition-colors ${
                      isSelected
                        ? 'bg-vintage-900 text-white border-vintage-900 ring-4 ring-terracotta/20'
                        : spot.isMicroAdPartner
                        ? 'bg-amber-50 text-amber-900 border-amber-400 font-bold'
                        : 'bg-white text-vintage-800 border-vintage-300'
                    }`}
                  >
                    <span>{getCategoryIcon(spot.category)}</span>
                    <span className="text-xs font-bold whitespace-nowrap">{spot.name}</span>
                    {dist !== null && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-vintage-100 text-vintage-600 font-mono">
                        {dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`}
                      </span>
                    )}
                    {spot.isMicroAdPartner && (
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </div>
                  {/* Pin Point Needle */}
                  <div
                    className={`w-2 h-2 rotate-45 -mt-1 ${
                      isSelected ? 'bg-vintage-900' : spot.isMicroAdPartner ? 'bg-amber-400' : 'bg-white'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Bottom Map Info Footer */}
          <div className="relative z-10 flex items-center justify-between text-[11px] text-vintage-600 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-vintage-200">
            <div>💡 핀을 클릭하면 <strong>현상소별 스캐너 색감 비교 및 당일 스캔 마감 시간</strong>을 볼 수 있습니다.</div>
            <div className="font-semibold text-terracotta">네이버/카카오 길찾기 연동</div>
          </div>
        </div>

        {/* Right Active Spot Detail Panel (Apple-style Refined Card) */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl bg-white border border-vintage-200 p-6 shadow-md space-y-6">
          <div className="space-y-4">
            {/* Header / Badges */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-vintage-100 text-vintage-700">
                    {getCategoryIcon(activeSpot.category)} {activeSpot.area}
                  </span>
                  {activeSpot.isMicroAdPartner && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      ★ {activeSpot.partnerBadgeText}
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-2xl font-bold text-vintage-900">
                  {activeSpot.name}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-amber-600 font-bold">★ {activeSpot.rating}</span>
                <div className="text-[10px] text-vintage-400">리뷰 {activeSpot.reviewsCount}개</div>
              </div>
            </div>

            {/* Address & Hours */}
            <div className="text-xs text-vintage-700 space-y-1.5 p-3.5 rounded-2xl bg-vintage-50 border border-vintage-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0" />
                <span>{activeSpot.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-vintage-500 shrink-0" />
                <span>{activeSpot.openHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-vintage-500 shrink-0" />
                <span>{activeSpot.contact}</span>
              </div>
            </div>

            {/* Realtime Scan Cutoff Alert */}
            {activeSpot.todayScanCutoff && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-emerald-900">실시간 당일 스캔 알림</div>
                  <div className="text-[11px] text-emerald-800 leading-snug">
                    {activeSpot.todayScanCutoff}
                  </div>
                </div>
              </div>
            )}

            {/* Film Stock Status */}
            {activeSpot.filmStockStatus && (
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-amber-900">현장 필름 재고 현황</div>
                  <div className="text-[11px] text-amber-800 leading-snug">
                    {activeSpot.filmStockStatus}
                  </div>
                </div>
              </div>
            )}

            {/* Color Tone Comparison Gallery (킬러 피처: 노리츠 vs 후지) */}
            {activeSpot.sampleColorToneImages && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-vintage-900">
                  <span>📸 보유 스캐너별 색감 비교</span>
                  <span className="text-[10px] text-vintage-500 font-normal">직접 선택 가능</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {activeSpot.sampleColorToneImages.map((tone, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-vintage-200 overflow-hidden bg-vintage-50 flex flex-col"
                    >
                      <div className="relative aspect-[4/3] bg-vintage-200">
                        <img
                          src={tone.imageUrl}
                          alt={tone.scannerName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2.5 space-y-1">
                        <div className="text-[11px] font-bold text-vintage-900 leading-tight">
                          {tone.scannerName}
                        </div>
                        <p className="text-[10px] text-vintage-600 leading-tight">
                          {tone.toneDescription}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Promo Notice */}
            {activeSpot.promoNotice && (
              <div className="p-3 rounded-xl bg-vintage-100 text-[11px] text-vintage-800 font-medium border border-vintage-200">
                🎁 <strong>DASI 회원 혜택:</strong> {activeSpot.promoNotice}
              </div>
            )}
          </div>

          {/* Action Buttons: Dual Naver Map & KakaoMap Route Deep Links */}
          <div className="pt-3 border-t border-vintage-200 space-y-2.5">
            {/* Wishlist toggle */}
            <button
              onClick={() => toggleSaveSpot(activeSpot.id)}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                savedSpotIds.includes(activeSpot.id)
                  ? 'bg-rose-50 border-rose-300 text-rose-600 hover:bg-rose-100'
                  : 'bg-white border-vintage-200 text-vintage-700 hover:border-terracotta/50 hover:text-terracotta'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-all ${savedSpotIds.includes(activeSpot.id) ? 'fill-rose-500 text-rose-500' : ''}`}
              />
              <span>{savedSpotIds.includes(activeSpot.id) ? '❤️ 위시리스트에 저장됨' : '이 스팟 위시리스트에 담기'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2.5">
            <a
              href={`https://map.naver.com/v5/search/${encodeURIComponent(activeSpot.name)}`}
              target="_blank"
              rel="noreferrer"
              className="py-3 px-3 rounded-xl bg-[#03C75A] hover:bg-[#02b350] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>네이버 지도 길찾기</span>
            </a>
            <a
              href={`https://map.kakao.com/link/to/${encodeURIComponent(activeSpot.name)},${activeSpot.lat},${activeSpot.lng}`}
              target="_blank"
              rel="noreferrer"
              className="py-3 px-3 rounded-xl bg-[#FEE500] hover:bg-[#ebd300] text-[#191919] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5 text-[#191919]" />
              <span>카카오맵 길찾기</span>
            </a>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: MICRO-ADS PARTNER REGISTRATION */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-vintage-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-6 h-6 text-terracotta" />
                <h3 className="font-serif text-xl font-bold text-vintage-900">
                  DASI 아날로그 파트너 핀 등록
                </h3>
              </div>
              <button
                onClick={() => setIsPartnerModalOpen(false)}
                className="p-1.5 text-vintage-400 hover:text-vintage-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-vintage-700 leading-relaxed">
              <p>
                수십만 원짜리 비싼 키워드 광고는 이제 그만!
                DASI를 이용하는 <strong>100% 진성 필름 &amp; 아날로그 애호가</strong>에게 우리 가게를 알리세요.
              </p>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="text-sm font-bold text-amber-900">DASI 공식 파트너 (월 14,900원)</div>
                <ul className="space-y-1.5 text-xs text-amber-800 list-disc list-inside">
                  <li>지도 내 <strong>골드 테두리 강조 핀 &amp; 인증 파트너 뱃지</strong> 부여</li>
                  <li>상점 상세에 <strong>[실시간 필름 재고]</strong> 및 <strong>[당일 스캔 마감]</strong> 노출</li>
                  <li>DASI 렌탈 고객 대상 <strong>자체 할인 쿠폰 자동 발행 권한</strong></li>
                  <li>반경 3km 내 유저에게 상단 추천 리스트 우선 배치</li>
                </ul>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-vintage-900">가게 상호명 및 연락처</label>
                <input
                  type="text"
                  placeholder="예: 을지로 00현상소 / 010-1234-5678"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-vintage-300 text-xs focus:outline-none focus:border-terracotta"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsPartnerModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-vintage-300 text-xs font-semibold text-vintage-700 hover:bg-vintage-50"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  showToast('상점 파트너 입점 신청이 접수되었습니다. DASI 팀이 24시간 내 연락드립니다!', 'success');
                  setIsPartnerModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-terracotta text-white text-xs font-bold hover:bg-terracotta-light transition-colors"
              >
                소액 파트너 신청하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
