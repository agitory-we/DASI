'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Camera, CameraCategory, ConditionGrade } from '@/types';
import { mockCameras, mockPickupShops } from '@/data/mockData';
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
  Receipt
} from 'lucide-react';
import { playShutterSound } from '@/utils/shutterAudio';
import { useDasi } from '@/context/DasiContext';

export default function RentPage() {
  const { bookCameraRental } = useDasi();
  const [selectedCategory, setSelectedCategory] = useState<CameraCategory | 'all'>('all');
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [rentalDays, setRentalDays] = useState<number>(2);
  const [selectedShopId, setSelectedShopId] = useState<string>('shop-1');
  const [isBooked, setIsBooked] = useState<boolean>(false);

  const filteredCameras = selectedCategory === 'all'
    ? mockCameras
    : mockCameras.filter((c) => c.category === selectedCategory);

  const handleOpenBooking = (camera: Camera) => {
    setSelectedCamera(camera);
    setSelectedShopId(camera.shopId);
    setIsBooked(false);
  };

  const currentShop = mockPickupShops.find((s) => s.id === selectedShopId) || mockPickupShops[0];

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

      {/* Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCameras.map((camera) => {
          const rentTotal = camera.rentalPricePerDay * 2;
          const remainingToBuy = camera.purchasePrice - rentTotal;

          return (
            <div
              key={camera.id}
              className="rounded-3xl bg-white border border-vintage-200 overflow-hidden shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-[16/10] bg-vintage-100 overflow-hidden">
                  <img
                    src={camera.imageUrl}
                    alt={camera.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium">
                      {camera.era}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-700/80 text-white text-[10px] font-semibold">
                      {camera.conditionGrade} 등급
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playShutterSound(
                          camera.name.includes('FM2')
                            ? 'slr'
                            : camera.category === 'digital_compact'
                            ? 'leaf'
                            : 'compact'
                        );
                      }}
                      className="px-2 py-0.5 rounded-md bg-black/75 hover:bg-terracotta text-white text-[10px] font-semibold flex items-center gap-1 backdrop-blur-xs transition-colors shadow-xs"
                      title="실제 기계식 셔터 소리 들어보기"
                    >
                      <Volume2 className="w-3 h-3 text-amber-300" />
                      <span>셔터음</span>
                    </button>
                    <span className="px-2 py-0.5 rounded-md bg-white/95 text-vintage-900 text-[11px] font-bold shadow-xs">
                      {camera.specs.difficulty}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <div className="text-[11px] text-vintage-500 font-medium">{camera.brand}</div>
                    <h3 className="font-serif text-xl font-bold text-vintage-900 group-hover:text-terracotta transition-colors">
                      {camera.name}
                    </h3>
                    <p className="text-xs text-vintage-600 line-clamp-2 mt-1.5 leading-relaxed">
                      {camera.description}
                    </p>
                  </div>

                  {/* Specs Pill */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-vintage-50 p-3 rounded-xl border border-vintage-100">
                    <div>
                      <span className="text-vintage-400">렌즈:</span>{' '}
                      <span className="font-medium text-vintage-800">{camera.specs.lens}</span>
                    </div>
                    <div>
                      <span className="text-vintage-400">무게:</span>{' '}
                      <span className="font-medium text-vintage-800">{camera.specs.weight}</span>
                    </div>
                  </div>

                  {/* Rent-to-Own Highlight Box */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-amber-900 font-semibold">주말(2일) 대여료</span>
                      <span className="font-bold text-terracotta text-sm">
                        {rentTotal.toLocaleString()}원
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-amber-800">
                      <span>소장 시 잔금 (대여료 차감)</span>
                      <span className="font-bold text-vintage-900">
                        {remainingToBuy.toLocaleString()}원
                      </span>
                    </div>
                    <div className="text-[10px] text-vintage-500 pt-0.5">
                      📍 픽업: {camera.shopName}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => handleOpenBooking(camera)}
                  className="w-full py-3 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Calendar className="w-4 h-4" />
                  <span>대여 일정 선택 &amp; 픽업 예약</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOOKING & RENT-TO-OWN MODAL */}
      {selectedCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-vintage-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-vintage-200 bg-vintage-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-terracotta text-white flex items-center justify-center font-bold">
                  📷
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-vintage-900">
                    {selectedCamera.name} 주말 대여 예약
                  </h3>
                  <span className="text-xs text-vintage-500">{selectedCamera.era} · {selectedCamera.conditionGrade} 등급</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCamera(null)}
                className="p-2 text-vintage-400 hover:text-vintage-800 rounded-full hover:bg-vintage-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {isBooked ? (
                <div className="text-center py-6 space-y-5 animate-fade-in">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/20">
                    <Check className="w-7 h-7" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      픽업 예약 확정 · 가승인 완료
                    </span>
                    <h4 className="font-serif text-2xl font-bold text-vintage-900">
                      {selectedCamera.name} 대여 완료
                    </h4>
                    <p className="text-xs text-vintage-600 max-w-md mx-auto leading-relaxed">
                      선택하신 <strong>{currentShop.name}</strong> 장인님께 예약 정보가 전달되었습니다.<br />
                      현장 픽업 시 <strong>10분 온보딩 강습</strong> 및 필름 장착이 무료 지원됩니다.
                    </p>
                  </div>

                  {/* Digital Mobile Voucher Card */}
                  <div className="p-5 rounded-3xl bg-vintage-50 border border-vintage-200/80 text-left max-w-md mx-auto space-y-4 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-vintage-200/60 pb-3">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-terracotta" />
                        <span className="text-xs font-bold text-vintage-900">DASI 모바일 픽업 바우처</span>
                      </div>
                      <span className="text-[10px] font-mono text-terracotta bg-terracotta/10 px-2 py-0.5 rounded-full font-bold">
                        RTO-{Math.floor(100000 + Math.random() * 900000)}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-vintage-700">
                      <div className="flex justify-between">
                        <span className="text-vintage-500">대여 기종</span>
                        <span className="font-bold text-vintage-900">{selectedCamera.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-vintage-500">대여 일정</span>
                        <span className="font-semibold text-vintage-800">{rentalDays}일 대여</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-vintage-500">픽업 장소</span>
                        <span className="font-semibold text-vintage-900 text-right">{currentShop.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-vintage-500">담당 명장</span>
                        <span className="font-semibold text-vintage-800">{currentShop.masterName} ({currentShop.contact})</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 space-y-0.5">
                      <div className="font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                        <span>Rent-to-Own 소장 전환 혜택 유지</span>
                      </div>
                      <p className="text-[10px] text-amber-800">
                        대여 기간 종료 전 언제든지 이미 결제한 {(selectedCamera.rentalPricePerDay * rentalDays).toLocaleString()}원을 100% 공제하고 영구 소장하실 수 있습니다.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto pt-2">
                    <Link
                      href="/cabinet"
                      onClick={() => setSelectedCamera(null)}
                      className="flex-1 py-3 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>내 캐비닛에서 예약 확인하기</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => setSelectedCamera(null)}
                      className="px-5 py-3 rounded-xl border border-vintage-300 text-vintage-700 hover:bg-vintage-100 text-xs font-semibold"
                    >
                      계속 둘러보기
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Step 1: 대여 일수 선택 */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-vintage-800 uppercase tracking-wider">
                      1. 대여 기간 선택 (일자)
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { days: 2, label: '주말 1박 2일 (토~일)' },
                        { days: 3, label: '연휴 2박 3일 (금~일)' },
                        { days: 7, label: '일주일 여행 (7일)' },
                      ].map((item) => (
                        <button
                          key={item.days}
                          onClick={() => setRentalDays(item.days)}
                          className={`p-3 rounded-2xl border text-center transition-all ${
                            rentalDays === item.days
                              ? 'border-terracotta bg-terracotta/5 text-terracotta font-bold shadow-2xs'
                              : 'border-vintage-200 hover:bg-vintage-50 text-vintage-700'
                          }`}
                        >
                          <div className="text-sm font-semibold">{item.label}</div>
                          <div className="text-xs mt-0.5 opacity-80">
                            {(selectedCamera.rentalPricePerDay * item.days).toLocaleString()}원
                          </div>
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
                      {mockPickupShops.map((shop) => (
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
                              <div className="text-[11px] text-vintage-500">{shop.address} · {shop.masterName}</div>
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold text-terracotta">
                            강습 포함
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step 3: Rent-to-Own 실시간 시뮬레이션 계산기 */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-vintage-100 to-vintage-50 border border-vintage-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-vintage-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        Rent-to-Own 소장 전환 혜택
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-600 text-white font-bold">
                        대여료 100% 환급 공제
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
                          {(
                            selectedCamera.purchasePrice -
                            selectedCamera.rentalPricePerDay * rentalDays
                          ).toLocaleString()}원
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: 안심 결제 보증금 안내 */}
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
                  <span className="text-xs text-vintage-500">결제 예정 대여료</span>
                  <div className="text-lg font-bold text-terracotta">
                    {(selectedCamera.rentalPricePerDay * rentalDays).toLocaleString()}원
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
                      bookCameraRental({
                        id: `rent-${Date.now()}`,
                        name: selectedCamera.name,
                        brand: selectedCamera.brand,
                        rentalPaid: selectedCamera.rentalPricePerDay * rentalDays,
                        purchaseTotal: selectedCamera.purchasePrice,
                        rentalDays: rentalDays,
                        shopName: currentShop.name,
                        imageUrl: selectedCamera.imageUrl,
                      });
                      setIsBooked(true);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-terracotta text-white text-xs sm:text-sm font-bold hover:bg-terracotta-light transition-colors shadow-xs"
                  >
                    대여 예약 완료하기
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
