'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Camera, CameraCategory } from '@/types';
import {
  Sparkles,
  Calendar,
  MapPin,
  ShieldCheck,
  Flame,
  Check,
  ChevronRight,
  Info,
  X,
  HeartHandshake,
  Volume2,
  QrCode,
  Receipt,
  Clock,
  CreditCard,
  Camera as CameraIcon
} from 'lucide-react';
import { playShutterSound } from '@/utils/shutterAudio';
import { useDasi } from '@/context/DasiContext';

export default function RentPage() {
  const { cameras, pickupShops, isLoadingData, bookCameraRental, showToast } = useDasi();
  const [selectedCategory, setSelectedCategory] = useState<CameraCategory | 'all'>('all');
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  // Date picker state
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const defaultEndStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  }, []);

  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(defaultEndStr);
  const [pickupTime, setPickupTime] = useState<string>('14:00');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'toss' | 'kakao'>('card');
  const [selectedShopId, setSelectedShopId] = useState<string>('shop-1');
  const [includeFilm, setIncludeFilm] = useState<boolean>(false);
  const [includeCleaningKit, setIncludeCleaningKit] = useState<boolean>(false);
  const [includeDamageCare, setIncludeDamageCare] = useState<boolean>(true);
  const [isBooked, setIsBooked] = useState<boolean>(false);
  const [bookedTicketCode, setBookedTicketCode] = useState<string>('');

  const rentalDays = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 1;
  }, [startDate, endDate]);

  const filteredCameras = useMemo(() => {
    return selectedCategory === 'all'
      ? cameras
      : cameras.filter((c) => c.category === selectedCategory);
  }, [cameras, selectedCategory]);

  const handleOpenBooking = (camera: Camera) => {
    setSelectedCamera(camera);
    setSelectedShopId(camera.shopId || pickupShops[0]?.id || 'shop-1');
    setIncludeFilm(false);
    setIncludeCleaningKit(false);
    setIncludeDamageCare(true);
    setIsBooked(false);
    setBookedTicketCode('');
  };

  const currentShop = pickupShops.find((s) => s.id === selectedShopId) || pickupShops[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Rent-to-Own 체험 후 소장 시스템</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-vintage-900">
          카메라 주말 렌탈 &amp; 소장 전환
        </h1>
        <p className="text-sm sm:text-base text-vintage-700 max-w-3xl leading-relaxed">
          고가의 클래식 필름카메라와 하이엔드 디카를 부담 없이 주말 동안 대여해 보세요.
          충무로·을지로 장인 매장에서 직접 픽업하고 <strong>10분 온보딩 강습</strong>을 받을 수 있으며, 
          써보고 마음에 들면 <strong>이미 결제한 대여료를 전액 공제하고 잔금만으로 소장</strong>할 수 있습니다.
        </p>
      </div>

      {/* FRIDAY LIMITED RENTAL DROP BANNER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-vintage-900 via-vintage-800 to-terracotta text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-terracotta/30">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-terracotta text-white text-[10px] font-extrabold uppercase tracking-widest animate-pulse">
              LIMITED DROP
            </span>
            <span className="text-xs text-vintage-300 font-mono">매주 금요일 20:00 한정 수량 오픈</span>
          </div>
          <h2 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            후지필름 X100VI &amp; 리코 GR IIIx 한정 렌탈 드롭
          </h2>
          <p className="text-xs text-vintage-200">
            품절 대란 하이엔드 기종을 주말 3일간 특별가에 대여할 수 있는 기회 (기종별 선착순 2대)
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          <div className="px-4 py-2 rounded-2xl bg-black/40 border border-white/10 text-center font-mono">
            <div className="text-[9px] text-vintage-300 uppercase tracking-wider">NEXT DROP IN</div>
            <div className="text-sm sm:text-base font-bold text-amber-400">D-2 11:42:09</div>
          </div>
          <button
            onClick={() => showToast('금요일 20:00 한정 기종 렌탈 드롭 알림 예약이 완료되었습니다!', 'success')}
            className="px-4 py-2.5 rounded-2xl bg-white text-vintage-900 text-xs font-bold hover:bg-vintage-100 transition-all shadow-md active:scale-95 flex items-center gap-1.5"
          >
            <span>🔔 오픈 알림 받기</span>
          </button>
        </div>
      </div>

      {/* Value Assurance Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-white border border-vintage-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-vintage-900">40년 명장 전수 검수</div>
            <div className="text-[11px] text-vintage-500">셔터막·렌즈 곰팡이 0건 보증</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-vintage-900">1:1 장인 10분 강습</div>
            <div className="text-[11px] text-vintage-500">현장 픽업 시 필름 장착 &amp; 조작법 전수</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-vintage-900">Rent-to-Own 100% 공제</div>
            <div className="text-[11px] text-vintage-500">대여료 차감 후 잔금만 결제 소장</div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-vintage-200 pb-4">
        {[
          { id: 'all', label: '전체 기종' },
          { id: 'film', label: '🎞️ 아날로그 필름카메라' },
          { id: 'digital_compact', label: '✨ 감성 하이엔드 디카 (후지·리코)' },
          { id: 'vintage_ccd', label: '🕹️ Y2K 빈티지 CCD 디카' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id as CameraCategory | 'all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedCategory === tab.id
                ? 'bg-vintage-900 text-white shadow-xs'
                : 'bg-white text-vintage-700 hover:bg-vintage-100 border border-vintage-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Camera Grid or Skeleton Loading */}
      {isLoadingData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="rounded-3xl bg-white border border-vintage-200 p-5 space-y-4 animate-pulse">
              <div className="aspect-4/3 bg-vintage-100 rounded-2xl" />
              <div className="h-5 bg-vintage-200 rounded-md w-3/4" />
              <div className="h-4 bg-vintage-100 rounded-md w-1/2" />
              <div className="h-10 bg-vintage-100 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCameras.map((camera) => (
            <div
              key={camera.id}
              className="group rounded-3xl bg-white border border-vintage-200 overflow-hidden hover:shadow-lg hover:border-vintage-300 transition-all flex flex-col"
            >
              {/* Thumbnail Image */}
              <div className="relative aspect-4/3 bg-vintage-100 overflow-hidden">
                <img
                  src={camera.imageUrl}
                  alt={camera.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-vintage-950/80 text-white text-[11px] font-medium backdrop-blur-xs">
                    {camera.era}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-terracotta text-white text-[11px] font-bold">
                    {camera.conditionGrade} 등급
                  </span>
                </div>

                <button
                  onClick={() => playShutterSound(camera.category === 'film' ? 'slr' : 'compact')}
                  className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 text-vintage-800 hover:bg-white shadow-md transition-all active:scale-90"
                  title="실제 셔터 소리 미리듣기"
                >
                  <Volume2 className="w-4 h-4 text-terracotta" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-vintage-500">
                    <span>{camera.brand}</span>
                    <span className="flex items-center gap-1 text-amber-600 font-bold">
                      ★ {camera.rating.toFixed(1)} ({camera.reviewsCount})
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-vintage-900 group-hover:text-terracotta transition-colors">
                    {camera.name}
                  </h3>

                  <p className="text-xs text-vintage-600 line-clamp-2 leading-relaxed">
                    {camera.description}
                  </p>
                </div>

                {/* Specs Pill */}
                <div className="p-3 rounded-2xl bg-vintage-50 border border-vintage-100 text-[11px] text-vintage-700 grid grid-cols-2 gap-1.5">
                  <div>렌즈: <span className="font-semibold text-vintage-900">{camera.specs.lens}</span></div>
                  <div>셔터: <span className="font-semibold text-vintage-900">{camera.specs.shutterSpeed}</span></div>
                  <div>난이도: <span className="font-semibold text-terracotta">{camera.specs.difficulty}</span></div>
                  <div>배터리: <span className="font-semibold text-vintage-900">{camera.specs.battery}</span></div>
                </div>

                {/* Pricing & CTA */}
                <div className="pt-2 border-t border-vintage-100 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-vintage-500">1일 대여료</div>
                    <div className="text-base sm:text-lg font-bold text-terracotta">
                      {camera.rentalPricePerDay.toLocaleString()}원
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] text-vintage-400 line-through">
                      소장가 {camera.purchasePrice.toLocaleString()}원
                    </div>
                    <button
                      onClick={() => handleOpenBooking(camera)}
                      className="mt-1 px-4 py-2 rounded-xl bg-vintage-900 text-white text-xs font-bold hover:bg-terracotta transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>날짜 예약하기</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* BOOKING MODAL (캘린더 & Rent-to-Own 실시간 시뮬레이션)     */}
      {/* ======================================================== */}
      {selectedCamera && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-vintage-200 overflow-hidden animate-scaleUp my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-vintage-200 flex items-center justify-between bg-vintage-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-vintage-900">
                    {selectedCamera.name} 주말 렌탈 예약
                  </h2>
                  <p className="text-xs text-vintage-500">
                    {selectedCamera.brand} · {selectedCamera.era} · {selectedCamera.conditionGrade} 등급
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCamera(null)}
                className="p-2 rounded-full text-vintage-400 hover:text-vintage-700 hover:bg-vintage-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {isBooked ? (
                /* 예약 완료 화면 */
                <div className="text-center py-6 space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-vintage-900">
                    대여 예약이 정상 완료되었습니다!
                  </h3>
                  <p className="text-xs sm:text-sm text-vintage-600 max-w-md mx-auto leading-relaxed">
                    선택하신 매장에 예약 정보가 실시간 접수되었습니다.
                    방문 시 매장 장인에게 예약 확인증(모바일 티켓)을 보여주시면 1:1 강습과 함께 기기를 전달해 드립니다.
                  </p>

                  <div className="p-4 rounded-2xl bg-vintage-50 border border-vintage-200 max-w-md mx-auto text-left space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-vintage-200">
                      <span className="text-vintage-500">예약 번호</span>
                      <span className="font-mono font-bold text-vintage-900">{bookedTicketCode}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-vintage-200">
                      <span className="text-vintage-500">대여 기간</span>
                      <span className="font-bold text-vintage-900">{startDate} ~ {endDate} ({rentalDays}일간)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-vintage-200">
                      <span className="text-vintage-500">픽업 장소 &amp; 시간</span>
                      <span className="font-bold text-terracotta">{currentShop?.name} ({pickupTime})</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-vintage-500">결제 금액</span>
                      <span className="font-bold text-vintage-900">
                        {(
                          selectedCamera.rentalPricePerDay * rentalDays +
                          (includeFilm ? 14000 : 0) +
                          (includeCleaningKit ? 3000 : 0)
                        ).toLocaleString()}원 (대여료 100% 소장 공제 보장)
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3 pt-4">
                    <Link
                      href="/cabinet"
                      className="px-6 py-2.5 rounded-xl bg-terracotta text-white text-xs sm:text-sm font-bold hover:bg-terracotta-light transition-colors shadow-xs"
                    >
                      마이 캐비닛에서 예약 확인하기 →
                    </Link>
                    <button
                      onClick={() => setSelectedCamera(null)}
                      className="px-5 py-2.5 rounded-xl border border-vintage-300 text-xs sm:text-sm font-semibold text-vintage-700 hover:bg-vintage-100"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Step 1: 날짜 피커 캘린더 엔진 */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-vintage-800 uppercase tracking-wider flex items-center justify-between">
                      <span>1. 대여 일정 선택 (캘린더)</span>
                      <span className="text-terracotta font-bold">총 {rentalDays}일간 대여</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-2xl bg-vintage-50 border border-vintage-200 space-y-1">
                        <span className="text-[11px] text-vintage-500 font-medium">대여 시작일 (방문 픽업)</span>
                        <input
                          type="date"
                          value={startDate}
                          min={todayStr}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full bg-white border border-vintage-200 rounded-xl px-3 py-2 text-xs font-semibold text-vintage-900 focus:outline-hidden focus:border-terracotta"
                        />
                      </div>

                      <div className="p-3 rounded-2xl bg-vintage-50 border border-vintage-200 space-y-1">
                        <span className="text-[11px] text-vintage-500 font-medium">반납 예정일 (매장 반납)</span>
                        <input
                          type="date"
                          value={endDate}
                          min={startDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full bg-white border border-vintage-200 rounded-xl px-3 py-2 text-xs font-semibold text-vintage-900 focus:outline-hidden focus:border-terracotta"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Clock className="w-3.5 h-3.5 text-vintage-400" />
                      <span className="text-[11px] text-vintage-600">픽업 희망 시간:</span>
                      {['11:00', '14:00', '17:00'].map((time) => (
                        <button
                          key={time}
                          onClick={() => setPickupTime(time)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            pickupTime === time
                              ? 'bg-vintage-900 text-white'
                              : 'bg-vintage-100 text-vintage-700 hover:bg-vintage-200'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: 픽업 거점 선택 */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-vintage-800 uppercase tracking-wider">
                      2. 방문 픽업 &amp; 10분 강습 매장 선택
                    </label>
                    <div className="space-y-2">
                      {pickupShops.map((shop) => (
                        <div
                          key={shop.id}
                          onClick={() => setSelectedShopId(shop.id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                            selectedShopId === shop.id
                              ? 'border-terracotta bg-terracotta/5 shadow-2xs'
                              : 'border-vintage-200 hover:bg-vintage-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <MapPin className={`w-4 h-4 ${selectedShopId === shop.id ? 'text-terracotta' : 'text-vintage-400'}`} />
                            <div>
                              <div className="text-xs font-bold text-vintage-900">{shop.name}</div>
                              <div className="text-[11px] text-vintage-500">{shop.address} · {shop.masterName} ({shop.masterExperienceYears}년)</div>
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold text-terracotta">
                            강습 포함
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step 3: 부가 케어 옵션 선택 */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-vintage-800 uppercase tracking-wider">
                      3. 패키지 &amp; 케어 부가 옵션 선택
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <label
                        onClick={() => setIncludeFilm(!includeFilm)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          includeFilm
                            ? 'border-terracotta bg-terracotta/5 font-semibold text-vintage-900'
                            : 'border-vintage-200 hover:bg-vintage-50 text-vintage-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={includeFilm}
                            onChange={() => {}}
                            className="rounded text-terracotta focus:ring-terracotta"
                          />
                          <span>코닥 컬러플러스 200 (1롤)</span>
                        </div>
                        <span className="text-terracotta font-bold">+14,000원</span>
                      </label>

                      <label
                        onClick={() => setIncludeCleaningKit(!includeCleaningKit)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          includeCleaningKit
                            ? 'border-terracotta bg-terracotta/5 font-semibold text-vintage-900'
                            : 'border-vintage-200 hover:bg-vintage-50 text-vintage-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={includeCleaningKit}
                            onChange={() => {}}
                            className="rounded text-terracotta focus:ring-terracotta"
                          />
                          <span>독일제 렌즈 클리닝 키트</span>
                        </div>
                        <span className="text-terracotta font-bold">+3,000원</span>
                      </label>

                      <label
                        onClick={() => setIncludeDamageCare(!includeDamageCare)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all sm:col-span-2 flex items-center justify-between ${
                          includeDamageCare
                            ? 'border-emerald-600 bg-emerald-50/60 font-semibold text-vintage-900'
                            : 'border-vintage-200 hover:bg-vintage-50 text-vintage-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={includeDamageCare}
                            onChange={() => {}}
                            className="rounded text-emerald-600 focus:ring-emerald-600"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-vintage-900">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              <span>DASI 안심 케어 (마이크로 파손 보험)</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold">강력 추천</span>
                            </div>
                            <div className="text-[11px] text-vintage-500 font-normal">
                              자기부담금 3만 원으로 최대 30만 원까지 수리비 전액 지원 (낙하·침수 안심)
                            </div>
                          </div>
                        </div>
                        <span className="text-emerald-700 font-bold text-sm shrink-0">+3,000원</span>
                      </label>
                    </div>
                  </div>

                  {/* Step 4: Rent-to-Own 실시간 시뮬레이션 계산기 */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-vintage-100 to-vintage-50 border border-vintage-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-vintage-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        Rent-to-Own 소장 전환 혜택
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-600 text-white font-bold">
                        순수 대여료 100% 환급 공제
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-vintage-200">
                        <div className="text-[10px] text-vintage-400">정상 소장가</div>
                        <div className="font-semibold text-vintage-800">
                          {selectedCamera.purchasePrice.toLocaleString()}원
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-vintage-200">
                        <div className="text-[10px] text-vintage-400">대여료 공제</div>
                        <div className="font-semibold text-terracotta">
                          - {(selectedCamera.rentalPricePerDay * rentalDays).toLocaleString()}원
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-vintage-200">
                        <div className="text-[10px] text-vintage-400">최종 인수 잔금</div>
                        <div className="font-bold text-emerald-800">
                          {Math.max(
                            0,
                            selectedCamera.purchasePrice -
                            selectedCamera.rentalPricePerDay * rentalDays
                          ).toLocaleString()}원
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 5: 결제 수단 선택 및 안심 가승인 안내 */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-vintage-800 uppercase tracking-wider">
                      4. 결제 수단 선택
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'card', label: '신용/체크카드' },
                        { id: 'toss', label: '토스페이' },
                        { id: 'kakao', label: '카카오페이' }
                      ].map((pay) => (
                        <button
                          key={pay.id}
                          onClick={() => setPaymentMethod(pay.id as any)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                            paymentMethod === pay.id
                              ? 'border-vintage-900 bg-vintage-900 text-white shadow-2xs'
                              : 'border-vintage-200 bg-white text-vintage-700 hover:bg-vintage-50'
                          }`}
                        >
                          {pay.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-vintage-50 border border-vintage-200 text-[11px] text-vintage-600 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>신용카드 가승인(Hold) 방식</strong>으로 현금 보증금이 필요 없습니다.
                      기기 반납 및 장인 검수 완료 즉시 가승인은 자동 해제됩니다.
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            {!isBooked && (
              <div className="p-6 border-t border-vintage-200 bg-vintage-50 flex items-center justify-between">
                <div>
                  <span className="text-xs text-vintage-500">결제 예정 총액 ({rentalDays}일간)</span>
                  <div className="text-lg font-bold text-terracotta">
                    {(
                      selectedCamera.rentalPricePerDay * rentalDays +
                      (includeFilm ? 14000 : 0) +
                      (includeCleaningKit ? 3000 : 0) +
                      (includeDamageCare ? 3000 : 0)
                    ).toLocaleString()}원
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCamera(null)}
                    className="px-4 py-2.5 rounded-xl border border-vintage-300 text-xs font-semibold text-vintage-700 hover:bg-vintage-100"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      playShutterSound(selectedCamera.category === 'film' ? 'slr' : 'compact');
                      const totalPaid =
                        selectedCamera.rentalPricePerDay * rentalDays +
                        (includeFilm ? 14000 : 0) +
                        (includeCleaningKit ? 3000 : 0) +
                        (includeDamageCare ? 3000 : 0);
                      const bookingId = `rent-${Date.now()}`;
                      const code = `DASI-${Math.floor(100000 + Math.random() * 900000)}`;
                      setBookedTicketCode(code);

                      bookCameraRental({
                        id: bookingId,
                        name: selectedCamera.name,
                        brand: selectedCamera.brand,
                        rentalPaid: totalPaid,
                        purchaseTotal: selectedCamera.purchasePrice,
                        rentalDays: rentalDays,
                        shopName: currentShop?.name || '을지로 신성카메라',
                        imageUrl: selectedCamera.imageUrl,
                      });

                      showToast(`${selectedCamera.name} ${rentalDays}일 대여 예약 완료! (픽업: ${currentShop?.name})`, 'success');
                      setIsBooked(true);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-terracotta text-white text-xs sm:text-sm font-bold hover:bg-terracotta-light transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>대여 결제 예약하기</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}