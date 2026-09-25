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
  CreditCard
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
    badge: '인기 실속',
    toneDesc: '가장 많이 찾는 코닥 컬러플러스 200 3롤 번들 세트',
    bestFor: '1박 2일 근교 출사, 주말 3롤 마스터 챌린지',
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
    leadTime: '서울 전역 당일 3시간 퀵',
  },
  {
    id: 'film-5',
    name: '성지순례 5롤 하이브리드 로드팩',
    brand: 'Kodak + Fuji',
    iso: 400,
    rolls: 5,
    price: 64400,
    originalPrice: 80000,
    discountRate: '20% OFF',
    badge: '강력 추천',
    toneDesc: '코닥 200(3롤) + 울트라맥스 400(2롤) 주야간 혼합 구성',
    bestFor: '실내 카페부터 일몰·야경까지 전천후 커버',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
    leadTime: '퀵비 3,000원 지원',
  },
  {
    id: 'film-10',
    name: '마스터 10롤 대량 벌크팩 + 방습 틴케이스',
    brand: 'Full Multi-Pack',
    iso: 200,
    rolls: 10,
    price: 123200,
    originalPrice: 160000,
    discountRate: '23% OFF',
    badge: '최대 혜택',
    toneDesc: '동호회·출사 크루용 10롤 대용량 패키지 + 전용 메탈 방습캔 증정',
    bestFor: '장기 여행, 필름 가격 폭등 대비 쟁여두기',
    imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&auto=format&fit=crop&q=80',
    leadTime: '서울 전역 당일 무료 퀵 전액 지원',
  },
];

export default function FilmsPage() {
  const { showToast } = useDasi();
  const { user, profile, openLoginModal } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<FilmProduct | null>(null);
  const [deliveryType, setDeliveryType] = useState<'quick' | 'pickup'>('quick');
  const [address, setAddress] = useState<string>('서울 중구 세종대로 110 (서울시청)');
  const [pickupShop, setPickupShop] = useState<string>('을지로 신성카메라');
  const [isOrdered, setIsOrdered] = useState<boolean>(false);
  const [ticketCode, setTicketCode] = useState<string>('');

  const handleOrder = () => {
    if (!selectedProduct) return;
    playShutterSound('compact');
    const code = 'DASI-FLM-' + Math.floor(100000 + Math.random() * 900000);
    setTicketCode(code);
    setIsOrdered(true);
    showToast(${selectedProduct.name} 주문이 정상 완료되었습니다!, 'success');
  };

  return (
    <div className=max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10>
      {/* Header Banner */}
      <div className=space-y-3>
        <div className=inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200>
          <Truck className=w-3.5 h-3.5 />
          <span>서울 전역 3시간 당일 퀵 &amp; 30년 노포 매장 즉시 픽업</span>
        </div>
        <h1 className=font-serif text-3xl sm:text-4xl font-bold text-vintage-900 tracking-tight>
          출사용 필름 전문 스토어 &amp; 대량 벌크샵
        </h1>
        <p className=text-sm sm:text-base text-vintage-700 max-w-3xl leading-relaxed>
          필름 가격 폭등과 품절 걱정 없이, 당일 출사에 필요한 정품 35mm 필름을 최저가에 공급받으세요.
          3롤 이상 묶음 구매 시 최대 <strong>23% 대량 할인</strong>과 함께 서울 시내 <strong>당일 3시간 무료 퀵 배송</strong>을 제공합니다.
        </p>
      </div>

      {/* Quick Status Bar */}
      <div className=grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200 text-xs>
        <div className=flex items-center gap-3>
          <div className=w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold>
            ⚡
          </div>
          <div>
            <div className=font-bold text-amber-950>오늘 주문 당일 수령 마감</div>
            <div className=text-[11px] text-amber-700 font-mono>16:30 주문 건까지 오늘 19:30 도착</div>
          </div>
        </div>

        <div className=flex items-center gap-3>
          <div className=w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-800 flex items-center justify-center font-bold>
            ❄️
          </div>
          <div>
            <div className=font-bold text-emerald-950>전량 10℃ 항온 항습 냉장 보관</div>
            <div className=text-[11px] text-emerald-700>충무로 전문 창고 신선 필름 직배송</div>
          </div>
        </div>

        <div className=flex items-center gap-3>
          <div className=w-9 h-9 rounded-xl bg-purple-500/20 text-purple-800 flex items-center justify-center font-bold>
            🎟️
          </div>
          <div>
            <div className=font-bold text-purple-950>DASI 기여 포인트 결제 가능</div>
            <div className=text-[11px] text-purple-700>보유 포인트 최대 10,000P 즉시 차감</div>
          </div>
        </div>
      </div>

      {/* Film Catalog Grid */}
      <div className=grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6>
        {FILM_PRODUCTS.map((prod) => (
          <div
            key={prod.id}
            className=rounded-3xl bg-white border border-vintage-200 hover:border-amber-400 hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden group
          >
            <div>
              <div className=relative aspect-[4/3] bg-vintage-100 overflow-hidden>
                <img
                  src={prod.imageUrl}
                  alt={prod.name}
                  className=w-full h-full object-cover group-hover:scale-105 transition-transform duration-500
                />
                <div className=absolute top-3 left-3 flex gap-1.5>
                  <span className=px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono font-bold>
                    ISO {prod.iso}
                  </span>
                  <span className=px-2 py-0.5 rounded-full bg-terracotta text-white text-[10px] font-bold>
                    {prod.discountRate}
                  </span>
                </div>
                {prod.badge && (
                  <span className=absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-400 text-stone-900 text-[10px] font-extrabold shadow-xs>
                    {prod.badge}
                  </span>
                )}
              </div>

              <div className=p-5 space-y-3>
                <div>
                  <span className=text-[11px] font-bold text-vintage-400>{prod.brand} · {prod.rolls}롤</span>
                  <h3 className=font-serif text-lg font-bold text-vintage-900 leading-snug group-hover:text-terracotta transition-colors>
                    {prod.name}
                  </h3>
                </div>

                <p className=text-xs text-vintage-600 leading-relaxed>
                  {prod.toneDesc}
                </p>

                <div className=p-2.5 rounded-xl bg-vintage-50 border border-vintage-150 text-[11px] text-vintage-700 space-y-1>
                  <div className=text-[10px] text-vintage-500 font-bold>추천 출사 환경:</div>
                  <div>{prod.bestFor}</div>
                </div>

                <div className=text-[11px] text-emerald-700 font-semibold flex items-center gap-1>
                  <PackageCheck className=w-3.5 h-3.5 text-emerald-600 shrink-0 />
                  <span>{prod.leadTime}</span>
                </div>
              </div>
            </div>

            <div className=p-5 pt-0 space-y-3>
              <div className=border-t border-vintage-100 pt-3 flex items-baseline justify-between>
                <span className=text-xs text-vintage-400 line-through>
                  {prod.originalPrice.toLocaleString()}원
                </span>
                <div className=text-right>
                  <div className=font-serif text-2xl font-bold text-terracotta>
                    {prod.price.toLocaleString()}원
                  </div>
                  <div className=text-[10px] text-vintage-500>
                    (롤당 {Math.round(prod.price / prod.rolls).toLocaleString()}원)
                  </div>
                </div>
              </div>

              <button
                type=button
                onClick={() => {
                  setSelectedProduct(prod);
                  setIsOrdered(false);
                }}
                className=w-full py-3 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95
              >
                <Film className=w-3.5 h-3.5 />
                <span>{prod.rolls === 1 ? '즉시 주문하기' : ${prod.rolls}롤 벌크 주문}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ORDER MODAL */}
      {selectedProduct && (
        <div className=fixed inset-0 z-[70] overflow-y-auto p-4 sm:p-6 flex min-h-screen items-center justify-center bg-black/65 backdrop-blur-xs animate-fadeIn>
          <div className=relative w-full max-w-lg my-auto max-h-[92vh] overflow-y-auto bg-white rounded-3xl border border-vintage-200 shadow-2xl p-6 sm:p-8 space-y-6>
            <div className=flex items-center justify-between border-b border-vintage-100 pb-4>
              <div className=flex items-center gap-2>
                <div className=w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold>
                  <Film className=w-5 h-5 />
                </div>
                <div>
                  <h3 className=font-serif text-lg font-bold text-vintage-900>
                    필름 결제 및 수령 방식
                  </h3>
                  <p className=text-xs text-vintage-500>
                    {selectedProduct.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className=w-8 h-8 rounded-full bg-vintage-100 hover:bg-vintage-200 flex items-center justify-center text-vintage-600 transition-colors
              >
                <X className=w-4 h-4 />
              </button>
            </div>

            {isOrdered ? (
              <div className=text-center py-6 space-y-5>
                <div className=w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold>
                  ✓
                </div>
                <div className=space-y-1>
                  <h4 className=font-serif text-xl font-bold text-vintage-900>
                    필름 주문이 완료되었습니다!
                  </h4>
                  <p className=text-xs text-vintage-600>
                    {deliveryType === 'quick'
                      ? '서울 3시간 당일 퀵 라이더 배차가 시작되었습니다. 기사님 출발 시 안심 알림톡이 전송됩니다.'
                      : '선택하신 매장 카운터에 아래 주문 코드를 제시하고 즉시 수령하세요.'}
                  </p>
                </div>

                <div className=p-4 rounded-2xl bg-vintage-50 border border-vintage-200 max-w-sm mx-auto space-y-2 text-xs text-left>
                  <div className=flex justify-between py-1 border-b border-vintage-200>
                    <span className=text-vintage-500>주문 번호</span>
                    <span className=font-mono font-bold text-vintage-900>{ticketCode}</span>
                  </div>
                  <div className=flex justify-between py-1 border-b border-vintage-200>
                    <span className=text-vintage-500>주문 품목</span>
                    <span className=font-bold text-vintage-900>{selectedProduct.name}</span>
                  </div>
                  <div className=flex justify-between py-1 border-b border-vintage-200>
                    <span className=text-vintage-500>수령 방식</span>
                    <span className=font-bold text-terracotta>
                      {deliveryType === 'quick' ? '서울 당일 3시간 퀵' : ${pickupShop} 매장 픽업}
                    </span>
                  </div>
                  <div className=flex justify-between py-1>
                    <span className=text-vintage-500>결제 금액</span>
                    <span className=font-bold text-vintage-900>{selectedProduct.price.toLocaleString()}원</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedProduct(null)}
                  className=w-full py-3 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-bold transition-colors
                >
                  확인 및 닫기
                </button>
              </div>
            ) : (
              <div className=space-y-5>
                {/* Method selector */}
                <div className=space-y-2>
                  <label className=text-xs font-bold text-vintage-900 block>수령 방식 선택</label>
                  <div className=grid grid-cols-2 gap-2>
                    <button
                      type=button
                      onClick={() => setDeliveryType('quick')}
                      className={p-3 rounded-2xl border text-left transition-all }
                    >
                      <div className=flex items-center gap-1.5 text-xs>
                        <Truck className=w-4 h-4 text-terracotta />
                        <span>당일 3시간 퀵</span>
                      </div>
                      <div className=text-[10px] text-vintage-500 mt-1>
                        {selectedProduct.rolls === 10 ? '무료 퀵 전액 지원' : '서울 시내 3,000원'}
                      </div>
                    </button>

                    <button
                      type=button
                      onClick={() => setDeliveryType('pickup')}
                      className={p-3 rounded-2xl border text-left transition-all }
                    >
                      <div className=flex items-center gap-1.5 text-xs>
                        <MapPin className=w-4 h-4 text-terracotta />
                        <span>장인 매장 픽업</span>
                      </div>
                      <div className=text-[10px] text-vintage-500 mt-1>
                        을지로·충무로 즉시 수령
                      </div>
                    </button>
                  </div>
                </div>

                {deliveryType === 'quick' ? (
                  <div className=space-y-1.5>
                    <label className=text-xs font-bold text-vintage-900 block>
                      배송받으실 주소 (서울 시내 한정)
                    </label>
                    <input
                      type=text
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className=w-full px-3 py-2 text-xs rounded-xl border border-vintage-300 focus:outline-none focus:border-terracotta
                    />
                  </div>
                ) : (
                  <div className=space-y-1.5>
                    <label className=text-xs font-bold text-vintage-900 block>
                      방문 희망 장인 매장
                    </label>
                    <select
                      value={pickupShop}
                      onChange={(e) => setPickupShop(e.target.value)}
                      className=w-full px-3 py-2 text-xs rounded-xl border border-vintage-300 focus:outline-none focus:border-terracotta bg-white
                    >
                      <option>을지로 신성카메라 (대림상가 3층)</option>
                      <option>충무로 보성광학 (충무로 인쇄골목)</option>
                      <option>을지로 망우삼림 (을지로3가 108)</option>
                    </select>
                  </div>
                )}

                <div className=p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between text-xs>
                  <div className=space-y-0.5>
                    <span className=font-bold text-amber-950>최종 결제 금액</span>
                    <span className=text-[11px] text-amber-800 block>{selectedProduct.name}</span>
                  </div>
                  <div className=text-right>
                    <span className=text-lg font-serif font-bold text-terracotta>
                      {selectedProduct.price.toLocaleString()}원
                    </span>
                  </div>
                </div>

                <button
                  type=button
                  onClick={handleOrder}
                  className=w-full py-3.5 rounded-xl bg-terracotta hover:bg-terracotta-light text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2
                >
                  <CreditCard className=w-4 h-4 />
                  <span>{selectedProduct.price.toLocaleString()}원 결제 주문 완료하기</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}