'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Film,
  Truck,
  Sparkles,
  ShieldCheck,
  MapPin,
  Clock,
  PackageCheck,
  Check,
  Coins,
  ChevronRight,
  Info,
  X,
  CreditCard,
} from 'lucide-react';
import { useDasi } from '@/context/DasiContext';
import { useAuth } from '@/context/AuthContext';
import { playShutterSound } from '@/utils/shutterAudio';

interface FilmProduct {
  id: string;
  name: string;
  brand: string;
  iso: number;
  rolls: number;
  price: number;
  originalPrice: number;
  discountRate: string;
  toneDesc: string;
  bestFor: string;
  imageUrl: string;
  badge?: string;
  leadTime: string;
}

const FILM_PRODUCTS: FilmProduct[] = [
  {
    id: 'film-1',
    name: '코닥 컬러플러스 200 (1롤 단품)',
    brand: 'Kodak',
    iso: 200,
    rolls: 1,
    price: 14000,
    originalPrice: 16000,
    discountRate: '12% OFF',
    toneDesc: '따스하고 빈티지한 황금빛 톤, 일상 스냅용 표준 필름',
    bestFor: '을지로·종로 골목길, 따스한 오후 햇살 스냅',
    imageUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&auto=format&fit=crop&q=80',
    leadTime: '서울 3시간 당일 퀵 가능',
  },
  {
    id: 'film-3',
    name: '주말 3롤 출사 스타터팩',
    brand: 'Kodak',
    iso: 200,
    rolls: 3,
    price: 39900,
    originalPrice: 48000,
    discountRate: '17% OFF',
    toneDesc: '골든아워 출사를 위한 알찬 3롤 번들 세트',
    bestFor: '반나절 또는 주말 서울 도심 골목 탐방',
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
    badge: '인기 1위',
    leadTime: '서울 3시간 당일 퀵 가능',
  },
  {
    id: 'film-5',
    name: '골목출사 5롤 대용량 패키지',
    brand: 'Kodak / Fuji',
    iso: 400,
    rolls: 5,
    price: 65000,
    originalPrice: 80000,
    discountRate: '19% OFF',
    toneDesc: '다양한 조도 환경을 위한 감도 400 고감도 조합',
    bestFor: '일몰 골든아워 ~ 실내 및 흐린 날 전천후 촬영',
    imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&auto=format&fit=crop&q=80',
    badge: '추천',
    leadTime: '서울 3시간 당일 퀵 무료',
  },
  {
    id: 'film-10',
    name: '동호회 10롤 벌크 메가팩',
    brand: 'Kodak',
    iso: 200,
    rolls: 10,
    price: 125000,
    originalPrice: 160000,
    discountRate: '22% OFF',
    toneDesc: '대량 출사 & 동호회 정기 출사를 위한 특별 할인팩',
    bestFor: '장기 여행, 동호회 단체 출사, 스튜디오 작업',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
    badge: '최대할인',
    leadTime: '서울 전역 3시간 무료 퀵 배송',
  },
];

export default function FilmsPage() {
  const { showToast } = useDasi();
  const { profile } = useAuth();
  const [selectedFilm, setSelectedFilm] = useState<FilmProduct | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<'quick' | 'pickup' | 'parcel'>('quick');
  const [address, setAddress] = useState('서울특별시 중구 을지로 100');
  const [usePoints, setUsePoints] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);

  const points = profile?.total_points || 0;
  const pointDiscount = usePoints ? Math.min(points, 5000) : 0;

  const handleOrder = () => {
    if (!selectedFilm) return;
    setIsOrdering(true);
    playShutterSound();

    setTimeout(() => {
      setIsOrdering(false);
      showToast(
        `🎉 ${selectedFilm.name} (${deliveryMethod === 'quick' ? '당일 3시간 퀵' : deliveryMethod === 'pickup' ? '현장 픽업' : '일반 택배'}) 주문이 정상 접수되었습니다!`,
        'success'
      );
      setSelectedFilm(null);
    }, 700);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
          <Film className="w-3.5 h-3.5" />
          <span>신선 냉장 보관 100% 정품 필름 당일 긴급 공급</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-vintage-900 tracking-tight">
          필름 주문 &amp; 대량 벌크샵
        </h1>
        <p className="text-sm sm:text-base text-vintage-700 max-w-3xl leading-relaxed">
          출사 현장에서 필름이 떨어졌을 때도 당황하지 마세요. 서울 전역 <strong>3시간 당일 퀵 배송</strong>과 
          을지로/충무로 현장 픽업, 그리고 최대 22% 대량 벌크 할인 혜택을 제공합니다. 
          DASI 활동으로 모은 포인트를 최대 5,000P까지 현금처럼 결제에 적용할 수 있습니다.
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-3xl bg-gradient-to-br from-vintage-100/70 to-vintage-50 border border-vintage-200/80 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-800 flex items-center justify-center font-bold">
            ⚡
          </div>
          <div>
            <div className="font-bold text-vintage-900">서울 전역 3시간 당일 퀵</div>
            <div className="text-[11px] text-vintage-600">출사지 벤치나 카페로 즉시 배달</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-800 flex items-center justify-center font-bold">
            ❄️
          </div>
          <div>
            <div className="font-bold text-emerald-950">전량 10℃ 항온 항습 냉장 보관</div>
            <div className="text-[11px] text-emerald-700">충무로 전문 창고 신선 필름 직배송</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-800 flex items-center justify-center font-bold">
            🎟️
          </div>
          <div>
            <div className="font-bold text-purple-950">DASI 기여 포인트 결제 가능</div>
            <div className="text-[11px] text-purple-700">보유 포인트 최대 5,000P 즉시 차감</div>
          </div>
        </div>
      </div>

      {/* Film Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {FILM_PRODUCTS.map((prod) => (
          <div
            key={prod.id}
            className="rounded-3xl bg-white border border-vintage-200 hover:border-amber-400 hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden group"
          >
            <div>
              <div className="relative aspect-[4/3] bg-vintage-100 overflow-hidden">
                <img
                  src={prod.imageUrl}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono font-bold">
                    ISO {prod.iso}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-terracotta text-white text-[10px] font-bold">
                    {prod.discountRate}
                  </span>
                </div>
                {prod.badge && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-400 text-stone-900 text-[10px] font-extrabold shadow-xs">
                    {prod.badge}
                  </span>
                )}
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-vintage-500">
                  <span className="font-semibold text-vintage-700">{prod.brand}</span>
                  <span className="font-bold text-amber-700">{prod.rolls}롤 세트</span>
                </div>

                <h3 className="font-serif text-lg font-bold text-vintage-900 group-hover:text-terracotta transition-colors leading-tight">
                  {prod.name}
                </h3>

                <p className="text-xs text-vintage-600 line-clamp-2 leading-relaxed">
                  {prod.toneDesc}
                </p>

                <div className="pt-2 border-t border-vintage-100 text-[11px] text-vintage-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-terracotta shrink-0" />
                  <span className="truncate">{prod.leadTime}</span>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-vintage-400 line-through">
                  {prod.originalPrice.toLocaleString()}원
                </span>
                <span className="text-lg font-serif font-bold text-vintage-900">
                  {prod.price.toLocaleString()}원
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFilm(prod)}
                className="w-full py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>신청 &amp; 당일 수령하기</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Modal */}
      {selectedFilm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-vintage-200 shadow-2xl p-6 sm:p-7 space-y-5 my-auto max-h-[92vh] overflow-y-auto animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-vintage-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-800">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-vintage-900">
                    필름 주문 &amp; 배송 신청
                  </h3>
                  <p className="text-xs text-vintage-500">신선 냉장 필름 즉시 출고</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFilm(null)}
                className="p-1.5 rounded-full hover:bg-vintage-100 text-vintage-500 transition-colors"
                aria-label="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Item Summary */}
            <div className="p-4 rounded-2xl bg-vintage-50 border border-vintage-200 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-serif font-bold text-vintage-900 text-sm">
                    {selectedFilm.name}
                  </div>
                  <div className="text-xs text-vintage-500 mt-0.5">
                    ISO {selectedFilm.iso} · {selectedFilm.rolls}롤 세트 · {selectedFilm.discountRate}
                  </div>
                </div>
                <div className="text-sm font-bold text-vintage-900">
                  {selectedFilm.price.toLocaleString()}원
                </div>
              </div>
            </div>

            {/* Delivery Method Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-vintage-800">수령 방식 선택</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'quick', title: '3시간 당일 퀵', fee: '무료 / 3,000원' },
                  { id: 'pickup', title: '충무로 현장 픽업', fee: '무료 (즉시)' },
                  { id: 'parcel', title: '일반 택배 배송', fee: '전국 익일' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setDeliveryMethod(m.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      deliveryMethod === m.id
                        ? 'bg-amber-50/80 border-amber-500 text-amber-950 font-bold ring-2 ring-amber-400/30'
                        : 'bg-white border-vintage-200 text-vintage-700 hover:bg-vintage-50'
                    }`}
                  >
                    <div className="text-xs">{m.title}</div>
                    <div className="text-[10px] text-vintage-500 mt-0.5">{m.fee}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Address Input (if quick or parcel) */}
            {deliveryMethod !== 'pickup' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-vintage-800">배송 주소</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-vintage-300 text-xs text-vintage-800 focus:outline-none focus:border-terracotta"
                    placeholder="수령하실 주소나 출사 장소를 입력하세요"
                  />
                </div>
                <p className="text-[11px] text-vintage-500">
                  * 공원 벤치나 카페인 경우 매장명과 자리 번호를 상세 기재해주세요.
                </p>
              </div>
            )}

            {/* Points Discount Check */}
            {points > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="text-xs font-bold text-vintage-900">
                      보유 포인트 사용 ({points.toLocaleString()}P 중 최대 5,000P)
                    </div>
                    <div className="text-[10px] text-vintage-600">
                      체크 시 {pointDiscount.toLocaleString()}원 결제 차감
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={usePoints}
                  onChange={(e) => setUsePoints(e.target.checked)}
                  className="w-4 h-4 text-terracotta rounded border-vintage-300 focus:ring-terracotta"
                />
              </div>
            )}

            {/* Final Price Breakdown */}
            <div className="pt-3 border-t border-vintage-200 space-y-1.5 text-xs text-vintage-700">
              <div className="flex justify-between">
                <span>상품 금액</span>
                <span>{selectedFilm.price.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span>배송비</span>
                <span className="text-emerald-700 font-medium">
                  {deliveryMethod === 'quick' && selectedFilm.rolls >= 5 ? '무료 (5롤 이상)' : '무료 프로모션'}
                </span>
              </div>
              {usePoints && pointDiscount > 0 && (
                <div className="flex justify-between text-rose-700 font-medium">
                  <span>포인트 할인</span>
                  <span>-{pointDiscount.toLocaleString()}원</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t border-vintage-200 text-sm font-bold text-vintage-950">
                <span>최종 결제 금액</span>
                <span className="font-serif text-xl text-terracotta">
                  {Math.max(0, selectedFilm.price - pointDiscount).toLocaleString()}원
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              disabled={isOrdering}
              onClick={handleOrder}
              className="w-full py-3.5 rounded-2xl bg-stone-900 hover:bg-terracotta text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isOrdering ? '주문 처리 중...' : '신선 필름 즉시 주문하기'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
