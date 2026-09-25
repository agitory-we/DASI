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
  Camera as CameraIcon,
  Coins,
  Star,
  Film,
  Truck,
  PackageCheck
} from 'lucide-react';
import { playShutterSound } from '@/utils/shutterAudio';
import { useDasi } from '@/context/DasiContext';
import { useAuth } from '@/context/AuthContext';
import { ReviewModal } from '@/components/common/ReviewModal';
import { sendLocalNotification, requestNotificationPermission, PUSH_SCENARIOS } from '@/utils/webPush';

interface BulkFilmPack {
  id: string;
  title: string;
  rolls: number;
  originalPrice: number;
  price: number;
  discountRate: string;
  filmType: string;
  desc: string;
  deliveryBenefit: string;
  badge: string;
}

const BULK_FILM_PACKS: BulkFilmPack[] = [
  {
    id: 'pack-3',
    title: '주말 3롤 출사 스타터팩',
    rolls: 3,
    originalPrice: 42000,
    price: 39900,
    discountRate: '5% OFF',
    filmType: '코닥 컬러플러스 200 (3롤)',
    desc: '1박 2일 근교 출사나 주말 출사에 가장 부담 없는 실속 패키지',
    deliveryBenefit: '을지로/충무로 당일 매장 즉시 수령',
    badge: '실속'
  },
  {
    id: 'pack-5',
    title: '성지순례 5롤 로드트립팩',
    rolls: 5,
    originalPrice: 70000,
    price: 64400,
    discountRate: '8% OFF',
    filmType: '코닥 200 (3롤) + 울트라맥스 400 (2롤)',
    desc: '낮과 밤, 실내와 야외를 모두 커버하는 감도별 하이브리드 구성',
    deliveryBenefit: '서울 전역 3시간 당일 퀵 3,000원 지원',
    badge: '강력 추천'
  },
  {
    id: 'pack-10',
    title: '마스터 10롤 대량 벌크팩',
    rolls: 10,
    originalPrice: 140000,
    price: 123200,
    discountRate: '12% OFF',
    filmType: '코닥/후지 10롤 풀패키지 + 전용 방습 틴케이스',
    desc: '대규모 출사 크루 및 장기 여행용 최저가 벌크 구성',
    deliveryBenefit: '서울 전역 당일 3시간 무료 퀵 배송 전액 지원',
    badge: '최대 혜택'
  }
];

export default function RentPage() {
  const { cameras, pickupShops, isLoadingData, bookCameraRental, showToast, communityPhotos } = useDasi();
  const { user, profile, openLoginModal, awardPoints } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<CameraCategory | 'all'>('all');
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [reviewTargetCamera, setReviewTargetCamera] = useState<Camera | null>(null);


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
  const [filmRollCount, setFilmRollCount] = useState<number>(1);
  const [includeCleaningKit, setIncludeCleaningKit] = useState<boolean>(false);
  const [includeDamageCare, setIncludeDamageCare] = useState<boolean>(true);
  const [isBundleSelected, setIsBundleSelected] = useState<boolean>(false);
  const [usedPoints, setUsedPoints] = useState<number>(0);
  const [isBooked, setIsBooked] = useState<boolean>(false);
  const [bookedTicketCode, setBookedTicketCode] = useState<string>('');

  // 대량 구매(벌크) 필름 전용 주문 모달 상태
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [selectedBulkPack, setSelectedBulkPack] = useState<any | null>(null);
  const [bulkDeliveryMethod, setBulkDeliveryMethod] = useState<'quick' | 'pickup'>('quick');
  const [bulkAddress, setBulkAddress] = useState<string>('서울 중구 세종대로 110 (서울시청)');
  const [isBulkOrdered, setIsBulkOrdered] = useState<boolean>(false);
  const [bulkTicketCode, setBulkTicketCode] = useState<string>('');

  // 벌크 필름 가격 계산 헬퍼 (수량별 대량 할인율 적용)
  const getFilmCost = (count: number) => {
    switch (count) {
      case 3:
        return 39900; // 5% 할인
      case 5:
        return 64400; // 8% 할인
      case 10:
        return 123200; // 12% 대량 할인 + 무료 퀵배송
      default:
        return 14000; // 1롤 정가
    }
  };

  const handleToggleBundle = () => {
    const next = !isBundleSelected;
    setIsBundleSelected(next);
    if (next) {
      setIncludeFilm(true);
      setFilmRollCount(1);
      setIncludeCleaningKit(true);
      setIncludeDamageCare(true);
      showToast('✨ 올인원 스타터 번들 혜택 적용! (필름+클리닝+보험 패키지 6,000원 할인)', 'success');
    } else {
      setIncludeFilm(false);
      setIncludeCleaningKit(false);
    }
  };


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
    setFilmRollCount(1);
    setIncludeCleaningKit(false);
    setIncludeDamageCare(true);
    setIsBundleSelected(false);
    setUsedPoints(0);
    setIsBooked(false);
    setBookedTicketCode('');
  };


  const currentShop = pickupShops.find((s) => s.id === selectedShopId) || pickupShops[0];

  const handleFridayDropPush = async () => {
    playShutterSound('slr');
    const perm = await requestNotificationPermission();
    if (perm === 'granted') {
      const dropScenario = PUSH_SCENARIOS.find((s) => s.id === 'friday_drop');
      if (dropScenario) {
        sendLocalNotification(dropScenario.title, dropScenario.body, dropScenario.url);
      }
      showToast('🔔 Friday DROP 실시간 브라우저 푸시 알림이 예약 및 전송되었습니다!', 'success');
    } else {
      showToast('금요일 20:00 한정 기종 렌탈 드롭 알림 예약이 완료되었습니다!', 'info');
    }
  };

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
            onClick={handleFridayDropPush}
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

      {/* BULK FILM PACKAGES SECTION (대량 구매 할인 & 당일 퀵 배송) */}
      <div className="rounded-3xl bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white border border-amber-200/90 p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider">
                BULK SAVINGS
              </span>
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-amber-700" />
                서울 전역 3시간 당일 퀵 &amp; 명장 매장 즉시 픽업
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-vintage-900 flex items-center gap-2">
              <Film className="w-5 h-5 text-terracotta" />
              <span>출사용 필름 대량 구매(벌크) 할인 &amp; 즉시 공급</span>
            </h2>
            <p className="text-xs text-vintage-600">
              카메라 대여 없이 필름만 필요하신가요? 3롤 이상 묶음 구매 시 최대 12% 할인 및 서울 시내 당일 퀵 배송 혜택을 드립니다.
            </p>
          </div>

          <div className="shrink-0 text-right">
            <span className="text-[11px] text-vintage-500">당일 배송 마감</span>
            <div className="text-xs font-mono font-bold text-terracotta">오늘 16:30 주문 건까지</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {BULK_FILM_PACKS.map((pack) => (
            <div
              key={pack.id}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-vintage-200 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                    {pack.badge}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-terracotta text-white text-[10px] font-extrabold">
                    {pack.discountRate}
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-vintage-900 group-hover:text-terracotta transition-colors">
                  {pack.title}
                </h3>
                <div className="text-xs font-semibold text-vintage-700">
                  {pack.filmType}
                </div>
                <p className="text-[11px] text-vintage-500 leading-relaxed">
                  {pack.desc}
                </p>

                <div className="p-2.5 rounded-xl bg-vintage-50 border border-vintage-150 text-[11px] text-emerald-800 font-medium flex items-center gap-1.5">
                  <PackageCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{pack.deliveryBenefit}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-vintage-100">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] text-vintage-400 line-through">
                    {pack.originalPrice.toLocaleString()}원
                  </span>
                  <div className="text-right">
                    <span className="font-serif text-xl font-bold text-terracotta">
                      {pack.price.toLocaleString()}원
                    </span>
                    <span className="text-[10px] text-vintage-500 block">
                      (롤당 {Math.round(pack.price / pack.rolls).toLocaleString()}원)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedBulkPack(pack);
                    setIsBulkModalOpen(true);
                    setIsBulkOrdered(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>{pack.rolls}롤 벌크 즉시 신청</span>
                </button>
              </div>
            </div>
          ))}
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

                  <div className="flex items-center gap-1.5 justify-end">
                    <button
                      onClick={() => setReviewTargetCamera(camera)}
                      className="mt-1 px-2.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold transition-colors"
                      title="실제 사용 후기 및 사진 등록하고 +100P 받기"
                    >
                      <span>✍️ 리뷰 (+100P)</span>
                    </button>
                    <button
                      onClick={() => handleOpenBooking(camera)}
                      className="mt-1 px-3.5 py-2 rounded-xl bg-vintage-900 text-white text-xs font-bold hover:bg-terracotta transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>대여 예약</span>
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
                      <div className="text-right">
                        <span className="font-bold text-vintage-900">
                          {Math.max(
                            0,
                            selectedCamera.rentalPricePerDay * rentalDays +
                            (includeFilm ? getFilmCost(filmRollCount) : 0) +
                            (includeCleaningKit ? 3000 : 0) +
                            (includeDamageCare ? 3000 : 0) -
                            (isBundleSelected ? 6000 : 0) -
                            usedPoints
                          ).toLocaleString()}원
                        </span>
                        {usedPoints > 0 && (
                          <div className="text-[10px] text-emerald-700 font-bold">
                            (DASI 기여 포인트 -{usedPoints.toLocaleString()}P 차감 적용)
                          </div>
                        )}
                      </div>
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
                  {/* 실사용 유저 출사 사진 갤러리 크로스 피딩 (Sprint 3-C) */}
                  {(() => {
                    const matchedPhotos = communityPhotos.filter(p => p.cameraModel === selectedCamera.name);
                    if (matchedPhotos.length === 0) return null;
                    return (
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF8F5] to-vintage-100/70 border border-vintage-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-vintage-900">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            <span>이 카메라로 찍은 실사용 커뮤니티 갤러리 ({matchedPhotos.length}장)</span>
                          </div>
                          <span className="text-[10px] text-vintage-500 font-medium">유저 무보정 컷</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {matchedPhotos.slice(0, 3).map((photo) => (
                            <div key={photo.id} className="relative aspect-[4/3] rounded-xl overflow-hidden group bg-vintage-900 shadow-2xs">
                              <img src={photo.imageUrl} alt={photo.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 text-white">
                                <span className="text-[9px] font-bold truncate">🎞️ {photo.filmType}</span>
                                <span className="text-[8px] text-vintage-300 truncate">by {photo.photographerName}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

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

                    {/* B2B 파트너 실시간 필름 재고 연동 배너 */}
                    <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-vintage-800 space-y-1.5 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1 text-amber-900 text-[11px]">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>선택 매장 실시간 필름 재고 (현장 즉시 수령)</span>
                        </span>
                        <span className="text-[10px] text-emerald-700 font-mono font-bold">1초 QR 수령 지원</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-[11px]">
                        <span className="px-2 py-0.5 rounded-md bg-white border border-amber-200 font-mono text-vintage-800">
                          Kodak Gold 200 (잔여 14롤)
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-amber-200 font-mono text-vintage-800">
                          UltraMax 400 (잔여 8롤)
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-amber-200 font-mono text-vintage-800">
                          Fujifilm 200 (잔여 5롤)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: 부가 케어 옵션 선택 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-vintage-800 uppercase tracking-wider">
                        3. 패키지 &amp; 케어 부가 옵션 선택
                      </label>
                      {isBundleSelected && (
                        <span className="text-[10px] font-bold text-terracotta bg-terracotta/10 px-2 py-0.5 rounded-full">
                          번들 특가 -6,000원 할인 적용 중
                        </span>
                      )}
                    </div>

                    {/* 올인원 스타터 번들 원클릭 카드 */}
                    <div
                      onClick={handleToggleBundle}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        isBundleSelected
                          ? 'border-terracotta bg-terracotta/5 shadow-xs'
                          : 'border-amber-200 bg-amber-50/50 hover:bg-amber-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-terracotta text-white flex items-center justify-center font-bold text-lg shadow-xs">
                          🎁
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-vintage-900">아날로그 올인원 스타터 번들</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-terracotta text-white font-bold">
                              25% OFF
                            </span>
                          </div>
                          <p className="text-[11px] text-vintage-600 mt-0.5">
                            필름 1롤 + 클리닝 키트 + 안심 케어 보험 통합 패키지 (20,000원 → 14,000원)
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-terracotta">+14,000원</div>
                        <div className="text-[10px] text-vintage-400 line-through">20,000원</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div
                        className={`p-3 rounded-2xl border transition-all sm:col-span-2 ${
                          includeFilm
                            ? 'border-terracotta bg-terracotta/5 font-semibold text-vintage-900'
                            : 'border-vintage-200 hover:bg-vintage-50 text-vintage-700'
                        }`}
                      >
                        <div
                          onClick={() => setIncludeFilm(!includeFilm)}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={includeFilm}
                              onChange={() => {}}
                              className="rounded text-terracotta focus:ring-terracotta"
                            />
                            <span>코닥 컬러플러스 200 필름 추가</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                              대량 구매 시 최대 12% 할인
                            </span>
                          </div>
                          <span className="text-terracotta font-bold">
                            +{getFilmCost(filmRollCount).toLocaleString()}원
                          </span>
                        </div>

                        {includeFilm && (
                          <div className="mt-3 pt-3 border-t border-terracotta/20 grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              { count: 1, label: '1롤 (단품)', discount: null, price: 14000 },
                              { count: 3, label: '3롤 (스타터)', discount: '5% OFF', price: 39900 },
                              { count: 5, label: '5롤 (출사팩)', discount: '8% OFF', price: 64400 },
                              { count: 10, label: '10롤 (마스터)', discount: '12% OFF+무료퀵', price: 123200 },
                            ].map((tier) => (
                              <button
                                key={tier.count}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFilmRollCount(tier.count);
                                }}
                                className={`px-2.5 py-2 rounded-xl text-left border transition-all flex flex-col justify-between ${
                                  filmRollCount === tier.count
                                    ? 'border-terracotta bg-white shadow-xs text-vintage-900 font-bold ring-2 ring-terracotta/30'
                                    : 'border-vintage-200 bg-white/70 hover:bg-white text-vintage-600'
                                }`}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-[11px]">{tier.label}</span>
                                  {tier.discount && (
                                    <span className="text-[9px] px-1 py-0.2 rounded bg-terracotta text-white font-bold">
                                      {tier.discount}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs font-mono font-bold text-terracotta mt-1">
                                  {tier.price.toLocaleString()}원
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

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

                  {/* Step 3.5: DASI 기여 포인트 즉시 할인 적용 */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-amber-600" />
                        DASI 기여 포인트 할인 적용
                      </span>
                      {user && profile ? (
                        <span className="text-xs font-bold text-amber-900">
                          보유: <strong className="text-terracotta">{profile.total_points.toLocaleString()}P</strong>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={openLoginModal}
                          className="text-[11px] font-bold text-terracotta hover:underline"
                        >
                          로그인하고 포인트 쓰기 →
                        </button>
                      )}
                    </div>

                    {user && profile && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max={Math.min(profile.total_points, (selectedCamera.rentalPricePerDay * rentalDays + (includeFilm ? getFilmCost(filmRollCount) : 0) + (includeCleaningKit ? 3000 : 0) + (includeDamageCare ? 3000 : 0)))}
                            step="1000"
                            value={usedPoints}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
                              const maxAffordable = selectedCamera.rentalPricePerDay * rentalDays + (includeFilm ? getFilmCost(filmRollCount) : 0) + (includeCleaningKit ? 3000 : 0) + (includeDamageCare ? 3000 : 0);
                              setUsedPoints(Math.min(val, profile.total_points, maxAffordable));
                            }}
                            className="w-28 px-3 py-1.5 text-xs rounded-xl border border-amber-300 bg-white font-mono font-bold text-amber-900 focus:outline-none focus:border-terracotta"
                            placeholder="0"
                          />
                          <span className="text-xs text-amber-800 font-semibold">P</span>

                          <button
                            type="button"
                            onClick={() => {
                              const maxAffordable = selectedCamera.rentalPricePerDay * rentalDays + (includeFilm ? getFilmCost(filmRollCount) : 0) + (includeCleaningKit ? 3000 : 0) + (includeDamageCare ? 3000 : 0);
                              const available = Math.floor(Math.min(profile.total_points, maxAffordable) / 1000) * 1000;
                              setUsedPoints(available);
                            }}
                            className="px-2.5 py-1.5 text-[10px] rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-900 font-bold transition-colors"
                          >
                            전액 사용
                          </button>
                          {usedPoints > 0 && (
                            <button
                              type="button"
                              onClick={() => setUsedPoints(0)}
                              className="px-2 py-1.5 text-[10px] text-vintage-500 hover:text-vintage-800"
                            >
                              취소
                            </button>
                          )}
                        </div>
                        {usedPoints > 0 && (
                          <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                            <span>✓</span>
                            <span>기여 포인트로 <strong>{usedPoints.toLocaleString()}원</strong> 즉시 할인이 적용되었습니다!</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Step 4: Rent-to-Own 실시간 시뮬레이션 계산기 */}
                  {(() => {
                    const baseRentalFee = selectedCamera.rentalPricePerDay * rentalDays;
                    const deductionAmount = baseRentalFee + usedPoints;
                    const remainingPurchasePrice = Math.max(0, selectedCamera.purchasePrice - deductionAmount);
                    const discountPercent = Math.min(100, Math.round((deductionAmount / selectedCamera.purchasePrice) * 100));

                    return (
                      <div className="p-4.5 rounded-2xl bg-gradient-to-br from-vintage-100/90 via-vintage-50 to-white border border-vintage-200 space-y-3.5 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-vintage-900 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            Rent-to-Own 실시간 소장 시뮬레이터
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold">
                            순수 대여료 100% 공제 적용
                          </span>
                        </div>

                        {/* 실시간 프로그레스 바 */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-vintage-600">소장 전환 달성율</span>
                            <span className="font-bold text-terracotta">{discountPercent}% 공제 혜택</span>
                          </div>
                          <div className="w-full h-2.5 bg-vintage-200 rounded-full overflow-hidden relative">
                            <div
                              className="h-full bg-gradient-to-r from-terracotta to-amber-500 rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(5, discountPercent)}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="p-2.5 rounded-xl bg-white border border-vintage-200 shadow-2xs">
                            <div className="text-[10px] text-vintage-400">정상 소장가</div>
                            <div className="font-semibold text-vintage-800">
                              {selectedCamera.purchasePrice.toLocaleString()}원
                            </div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white border border-vintage-200 shadow-2xs">
                            <div className="text-[10px] text-vintage-400">대여료+포인트 공제</div>
                            <div className="font-bold text-terracotta">
                              - {deductionAmount.toLocaleString()}원
                            </div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 shadow-2xs">
                            <div className="text-[10px] text-amber-700 font-semibold">소장 전환 잔금</div>
                            <div className="font-extrabold text-emerald-800">
                              {remainingPurchasePrice.toLocaleString()}원
                            </div>
                          </div>
                        </div>

                        <p className="text-[11px] text-vintage-600 leading-snug">
                          💡 <strong>{rentalDays}일</strong>간 마음껏 출사해 보신 후, 대여료 전액({baseRentalFee.toLocaleString()}원)을 공제받고 <strong>{remainingPurchasePrice.toLocaleString()}원</strong>에 평생 소장하실 수 있습니다.
                        </p>
                      </div>
                    );
                  })()}

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
              <div className="p-6 border-t border-vintage-200 bg-vintage-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-vintage-500">최종 결제 예정 총액 ({rentalDays}일간)</span>
                    {usedPoints > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        포인트 -{usedPoints.toLocaleString()}원 할인
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-xl font-bold text-terracotta">
                      {Math.max(
                        0,
                        selectedCamera.rentalPricePerDay * rentalDays +
                        (includeFilm ? getFilmCost(filmRollCount) : 0) +
                        (includeCleaningKit ? 3000 : 0) +
                        (includeDamageCare ? 3000 : 0) -
                        (isBundleSelected ? 6000 : 0) -
                        usedPoints
                      ).toLocaleString()}원
                    </div>
                    {usedPoints > 0 && (
                      <span className="text-xs text-vintage-400 line-through">
                        {(
                          selectedCamera.rentalPricePerDay * rentalDays +
                          (includeFilm ? getFilmCost(filmRollCount) : 0) +
                          (includeCleaningKit ? 3000 : 0) +
                          (includeDamageCare ? 3000 : 0) -
                          (isBundleSelected ? 6000 : 0)
                        ).toLocaleString()}원
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedCamera(null)}
                    className="px-4 py-2.5 rounded-xl border border-vintage-300 text-xs font-semibold text-vintage-700 hover:bg-vintage-100"
                  >
                    취소
                  </button>
                  <button
                    onClick={async () => {
                      playShutterSound(selectedCamera.category === 'film' ? 'slr' : 'compact');
                      const rawTotal =
                        selectedCamera.rentalPricePerDay * rentalDays +
                        (includeFilm ? getFilmCost(filmRollCount) : 0) +
                        (includeCleaningKit ? 3000 : 0) +
                        (includeDamageCare ? 3000 : 0) -
                        (isBundleSelected ? 6000 : 0);
                      const totalPaid = Math.max(0, rawTotal - usedPoints);
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

                      if (usedPoints > 0) {
                        try {
                          await awardPoints('redeem', bookingId);
                        } catch (e) {
                          console.error(e);
                        }
                      }

                      showToast(
                        usedPoints > 0
                          ? `${selectedCamera.name} 대여 완료! (포인트 ${usedPoints.toLocaleString()}원 할인 적용)`
                          : `${selectedCamera.name} ${rentalDays}일 대여 예약 완료! (픽업: ${currentShop?.name})`,
                        'success'
                      );
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

      {/* 카메라 실사용 리뷰 등록 모달 */}
      {reviewTargetCamera && (
        <ReviewModal
          isOpen={!!reviewTargetCamera}
          onClose={() => setReviewTargetCamera(null)}
          targetType="camera"
          targetId={reviewTargetCamera.id}
          targetName={reviewTargetCamera.name}
          onSuccess={() => {
            showToast(`${reviewTargetCamera.name} 리뷰가 정상 등록되었습니다! (+100P 적립)`, 'success');
          }}
        />
      )}

      {/* 필름 대량(벌크) 주문 모달 */}
      {isBulkModalOpen && selectedBulkPack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-vintage-200 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-vintage-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-vintage-900">
                    필름 대량(벌크) 즉시 주문
                  </h3>
                  <p className="text-xs text-vintage-500">
                    {selectedBulkPack.title} ({selectedBulkPack.discountRate})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsBulkModalOpen(false);
                  setIsBulkOrdered(false);
                }}
                className="w-8 h-8 rounded-full bg-vintage-100 hover:bg-vintage-200 flex items-center justify-center text-vintage-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isBulkOrdered ? (
              <div className="text-center py-6 space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-xl font-bold text-vintage-900">
                    필름 벌크 패키지 주문이 완료되었습니다!
                  </h4>
                  <p className="text-xs text-vintage-600">
                    {bulkDeliveryMethod === 'quick'
                      ? '서울 3시간 당일 퀵 배차가 시작되었습니다. 기사님 출발 시 안심 알림톡이 전송됩니다.'
                      : '선택하신 매장 카운터에 아래 수령 바코드를 제시하고 즉시 픽업하세요.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-vintage-50 border border-vintage-200 max-w-sm mx-auto space-y-2 text-xs text-left">
                  <div className="flex justify-between py-1 border-b border-vintage-200">
                    <span className="text-vintage-500">주문 번호</span>
                    <span className="font-mono font-bold text-vintage-900">{bulkTicketCode}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-vintage-200">
                    <span className="text-vintage-500">주문 상품</span>
                    <span className="font-bold text-vintage-900">{selectedBulkPack.title} ({selectedBulkPack.rolls}롤)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-vintage-200">
                    <span className="text-vintage-500">수령 방식</span>
                    <span className="font-bold text-terracotta">
                      {bulkDeliveryMethod === 'quick' ? '서울 당일 3시간 퀵 배송' : '을지로/충무로 현장 픽업'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-vintage-500">최종 결제액</span>
                    <span className="font-bold text-vintage-900">{selectedBulkPack.price.toLocaleString()}원</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsBulkModalOpen(false);
                      setIsBulkOrdered(false);
                    }}
                    className="w-full py-3 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-bold transition-colors"
                  >
                    확인 및 닫기
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Pack Detail */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-amber-950">{selectedBulkPack.title}</div>
                    <div className="text-[11px] text-amber-800">{selectedBulkPack.filmType}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-vintage-400 line-through">
                      {selectedBulkPack.originalPrice.toLocaleString()}원
                    </div>
                    <div className="font-serif text-lg font-bold text-terracotta">
                      {selectedBulkPack.price.toLocaleString()}원
                    </div>
                  </div>
                </div>

                {/* Delivery Options */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-vintage-900 block">수령 방식 선택</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBulkDeliveryMethod('quick')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        bulkDeliveryMethod === 'quick'
                          ? 'border-terracotta bg-terracotta/5 ring-2 ring-terracotta/20 text-vintage-900 font-bold'
                          : 'border-vintage-200 hover:bg-vintage-50 text-vintage-600'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs">
                        <Truck className="w-4 h-4 text-terracotta" />
                        <span>당일 3시간 퀵</span>
                      </div>
                      <div className="text-[10px] text-vintage-500 mt-1">
                        {selectedBulkPack.rolls === 10 ? '무료 퀵 지원' : '서울 시내 3,000원'}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBulkDeliveryMethod('pickup')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        bulkDeliveryMethod === 'pickup'
                          ? 'border-terracotta bg-terracotta/5 ring-2 ring-terracotta/20 text-vintage-900 font-bold'
                          : 'border-vintage-200 hover:bg-vintage-50 text-vintage-600'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs">
                        <MapPin className="w-4 h-4 text-terracotta" />
                        <span>장인 매장 픽업</span>
                      </div>
                      <div className="text-[10px] text-vintage-500 mt-1">
                        을지로·충무로 즉시 수령
                      </div>
                    </button>
                  </div>
                </div>

                {/* Address or Shop Select */}
                {bulkDeliveryMethod === 'quick' ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-vintage-900 block">
                      배송받으실 주소 (서울 시내 한정)
                    </label>
                    <input
                      type="text"
                      value={bulkAddress}
                      onChange={(e) => setBulkAddress(e.target.value)}
                      placeholder="도로명 주소와 상세주소를 입력하세요"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-vintage-300 focus:outline-none focus:border-terracotta"
                    />
                    <p className="text-[10px] text-vintage-500">
                      * 접수 후 3시간 내 라이더 배차가 완료됩니다.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-vintage-900 block">
                      픽업 희망 장인 매장
                    </label>
                    <select
                      className="w-full px-3 py-2 text-xs rounded-xl border border-vintage-300 focus:outline-none focus:border-terracotta bg-white"
                    >
                      <option>을지로 신성카메라 (을지로3가역 4번출구 앞)</option>
                      <option>충무로 보성광학 (충무로역 인쇄골목)</option>
                      <option>을지로 망우삼림 (을지로3가 현상소)</option>
                    </select>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      playShutterSound('compact');
                      const code = `DASI-BULK-${Math.floor(100000 + Math.random() * 900000)}`;
                      setBulkTicketCode(code);
                      setIsBulkOrdered(true);
                      showToast(`${selectedBulkPack.title} 주문이 정상 완료되었습니다!`, 'success');
                    }}
                    className="w-full py-3 rounded-xl bg-terracotta hover:bg-terracotta-light text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>{selectedBulkPack.price.toLocaleString()}원 벌크 결제 주문하기</span>
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