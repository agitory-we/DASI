'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PhotoGig, GigCategory } from '@/types';
import {
  Users,
  Sparkles,
  Camera,
  MapPin,
  HeartHandshake,
  ShieldCheck,
  Star,
  CheckCircle2,
  Calendar,
  X,
  Send,
  Globe,
  Plus,
  QrCode,
  Check,
  Coins
} from 'lucide-react';
import { playShutterSound } from '@/utils/shutterAudio';
import { useDasi } from '@/context/DasiContext';
import { useAuth } from '@/context/AuthContext';

export default function GigsPage() {
  const { photoGigs, isLoadingData, bookGig, showToast } = useDasi();
  const { user, profile, openLoginModal, awardPoints } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<GigCategory | 'all'>('all');
  const [selectedGig, setSelectedGig] = useState<PhotoGig | null>(null);
  const [activePortfolioImg, setActivePortfolioImg] = useState<string | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [isBooked, setIsBooked] = useState<boolean>(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [scheduledAtInput, setScheduledAtInput] = useState<string>('2026-09-27 14:00');
  const [usedGigPoints, setUsedGigPoints] = useState<number>(0);
  const [customGigs, setCustomGigs] = useState<PhotoGig[]>([]);
  const [gigForm, setGigForm] = useState({
    nickname: '',
    camera: '',
    location: '',
    price: 45000,
    portfolioUrl: ''
  });

  const allDisplayGigs = [...customGigs, ...photoGigs];

  const filteredGigs = selectedCategory === 'all'
    ? allDisplayGigs
    : allDisplayGigs.filter((g) => g.category === selectedCategory);


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>취향 기반 C2C 생활형 스냅 마켓</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-vintage-900">
            DASI 로컬 포토 긱 (Photo Gig)
          </h1>
          <p className="text-xs sm:text-sm text-vintage-600 mt-1 max-w-2xl leading-relaxed">
            비싸고 부담스러운 상업 스튜디오 대신, 감성 카메라를 가진 로컬 작가에게 소소한 일상 스냅을 의뢰하세요.
            성수동 외국인 투어 스냅부터 결혼식 하객 시선의 가성비 서브 웨딩까지 합리적인 가격에 매칭됩니다.
          </p>
        </div>

        {/* Register Button */}
        <button
          onClick={() => setIsRegisterOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-terracotta text-white text-xs sm:text-sm font-bold hover:bg-terracotta-light transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>내 카메라로 스냅 알바 등록하기</span>
        </button>
      </div>

      {/* Safety & Escrow Guarantee Bar */}
      <div className="p-4 rounded-2xl bg-white border border-vintage-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <div className="font-bold text-vintage-900">100% 안심 에스크로 정산</div>
            <div className="text-[11px] text-vintage-500">사진 수령 확인 후 작가에게 정산 완료</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Camera className="w-5 h-5 text-terracotta shrink-0" />
          <div>
            <div className="font-bold text-vintage-900">실제 촬영 장비 투명 공개</div>
            <div className="text-[11px] text-vintage-500">라이카, 후지필름, 콘탁스 기종 표기</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <HeartHandshake className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <div className="font-bold text-vintage-900">부담 없는 3~7만 원대 단가</div>
            <div className="text-[11px] text-vintage-500">불필요한 거품 없는 1시간 단위 소소한 스냅</div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-vintage-200 pb-4">
        {[
          { id: 'all', label: '전체 스냅 긱' },
          { id: 'foreigner_tour', label: '🌏 성수·북촌 외국인/여행 스냅' },
          { id: 'sub_wedding', label: '💍 가성비 서브 웨딩 & 하객 필름' },
          { id: 'daily_snap', label: '☕ 을지로·골목 카페 일상 스냅' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id as GigCategory | 'all')}
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

      {/* Gigs Grid or Skeleton */}
      {isLoadingData ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="rounded-3xl bg-white border border-vintage-200 p-5 space-y-4 animate-pulse">
              <div className="aspect-[16/10] bg-vintage-100 rounded-2xl" />
              <div className="h-5 bg-vintage-200 rounded w-2/3" />
              <div className="h-4 bg-vintage-100 rounded w-full" />
              <div className="h-8 bg-vintage-100 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredGigs.map((gig) => (
          <div
            key={gig.id}
            className="rounded-3xl bg-white border border-vintage-200 overflow-hidden shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Portfolio Main Image Preview */}
              <div
                onClick={() => setActivePortfolioImg(gig.portfolioImages[0])}
                className="relative aspect-[16/10] bg-vintage-100 overflow-hidden cursor-pointer"
              >
                <img
                  src={gig.portfolioImages[0]}
                  alt={gig.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{gig.location}</span>
                </div>
                <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-white/90 text-vintage-900 text-[10px] font-bold shadow-xs">
                  포트폴리오 {gig.portfolioImages.length}장 보기 🔍
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3">
                {/* Creator Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={gig.creatorAvatar}
                      alt={gig.creatorName}
                      className="w-8 h-8 rounded-full object-cover border border-vintage-200"
                    />
                    <div>
                      <div className="text-xs font-bold text-vintage-900 flex items-center gap-1">
                        <span>{gig.creatorName}</span>
                        {gig.isVerified && (
                          <CheckCircle2 className="w-3 h-3 text-terracotta" />
                        )}
                      </div>
                      <div className="text-[10px] text-vintage-500">
                        {gig.languages ? `🌐 ${gig.languages.join(' · ')}` : '한국어'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{gig.rating}</span>
                    <span className="text-[10px] text-vintage-400">({gig.reviewsCount})</span>
                  </div>
                </div>

                <h3 className="font-serif text-base font-bold text-vintage-900 leading-snug group-hover:text-terracotta transition-colors">
                  {gig.title}
                </h3>

                <p className="text-xs text-vintage-600 line-clamp-2 leading-relaxed">
                  {gig.description}
                </p>

                {/* Gear Tag */}
                <div className="p-2.5 rounded-xl bg-vintage-50 border border-vintage-100 text-[11px] text-vintage-700 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-terracotta shrink-0" />
                  <span className="font-medium truncate">{gig.gearUsed.join(' + ')}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {gig.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-vintage-100 text-vintage-600 text-[10px]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Price & Booking Footer */}
            <div className="p-5 pt-0 border-t border-vintage-100 flex items-center justify-between mt-2">
              <div>
                <span className="text-[10px] text-vintage-400 font-medium">1시간(60분) 기준</span>
                <div className="text-base font-bold text-terracotta">
                  {gig.pricePerHour.toLocaleString()}원
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedGig(gig);
                  setIsBooked(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-bold transition-colors shadow-xs"
              >
                촬영 문의 &amp; 예약
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* PORTFOLIO VIEWER MODAL */}
      {activePortfolioImg && (
        <div
          onClick={() => setActivePortfolioImg(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-pointer animate-fadeIn"
        >
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl">
            <img
              src={activePortfolioImg}
              alt="Portfolio detail"
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setActivePortfolioImg(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {selectedGig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-vintage-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-vintage-100">
              <div className="flex items-center gap-3">
                <img
                  src={selectedGig.creatorAvatar}
                  alt={selectedGig.creatorName}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <div>
                  <h3 className="font-serif text-lg font-bold text-vintage-900">
                    {selectedGig.creatorName} 작가 스냅 예약
                  </h3>
                  <div className="text-xs text-vintage-500">{selectedGig.location}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedGig(null)}
                className="p-1.5 text-vintage-400 hover:text-vintage-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isBooked ? (
              <div className="text-center py-6 space-y-5 animate-fade-in">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                
                <div className="space-y-1">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    에스크로 안전 대금 보관 완료
                  </span>
                  <h4 className="font-serif text-2xl font-bold text-vintage-900">
                    촬영 예약 신청 완료
                  </h4>
                  <p className="text-xs text-vintage-600 leading-relaxed max-w-sm mx-auto">
                    <strong>{selectedGig.creatorName}</strong> 작가님께 예약 알림이 전달되었습니다.<br />
                    24시간 내 작가 승인 시 확정 카카오톡이 발송됩니다.
                  </p>
                </div>

                {/* Digital Escrow Voucher Card */}
                <div className="p-5 rounded-3xl bg-vintage-50 border border-vintage-200 text-left max-w-sm mx-auto space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-vintage-200/60 pb-2.5">
                    <span className="text-xs font-bold text-vintage-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      DASI 안심 에스크로 보증서
                    </span>
                    <span className="text-[10px] font-mono text-terracotta bg-terracotta/10 px-2 py-0.5 rounded-full font-bold">
                      GIG-{Math.floor(100000 + Math.random() * 900000)}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-vintage-700">
                    <div className="flex justify-between">
                      <span className="text-vintage-500">배정 작가</span>
                      <span className="font-bold text-vintage-900">{selectedGig.creatorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-vintage-500">촬영 위치</span>
                      <span className="font-semibold text-vintage-800">{selectedGig.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-vintage-500">에스크로 예치금</span>
                      <span className="font-bold text-terracotta">{selectedGig.pricePerHour.toLocaleString()}원</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-900">
                    💡 <strong>대금 지급 원칙:</strong> 촬영 완료 후 원본 30장 이상 및 보정본 5장을 수령하고 고객님이 [수령 확정]을 누를 때까지 결제 대금은 안전하게 에스크로에 묶여 있습니다.
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <button
                    onClick={() => setSelectedGig(null)}
                    className="flex-1 px-5 py-3 rounded-xl border border-vintage-200 text-vintage-700 text-xs font-semibold transition-colors hover:bg-vintage-100"
                  >
                    닫기
                  </button>
                  <Link
                    href="/cabinet"
                    onClick={() => setSelectedGig(null)}
                    className="flex-1 px-5 py-3 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-semibold transition-colors shadow-xs text-center"
                  >
                    🎟️ 마이 캐비닛에서 에스크로 확인
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-vintage-800">희망 촬영 일시</label>
                  <input
                    type="text"
                    value={scheduledAtInput}
                    onChange={(e) => setScheduledAtInput(e.target.value)}
                    placeholder="예: 2026-09-27 15:00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-vintage-300 focus:outline-none focus:border-terracotta text-vintage-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-vintage-800">원하는 촬영 분위기 / 장소 세부사항</label>
                  <textarea
                    rows={3}
                    defaultValue="성수동 골목길 & 카페 위주로 자연스러운 필름 스냅 촬영을 희망합니다."
                    placeholder="예: 성수동 카페골목 위주로 자연스러운 웃음 샷 원합니다. 외국인 친구와 동행 예정입니다."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-vintage-300 focus:outline-none focus:border-terracotta resize-none text-vintage-900"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>DASI 안심 에스크로 보호</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-tight">
                    촬영 완료 후 원본/보정본 사진을 수령하고 [최종 확인]을 누르기 전까지 결제 대금은 안전하게 보관됩니다.
                  </p>
                </div>

                {/* DASI 포인트 할인 적용 */}
                {user && profile && profile.total_points >= 1000 && (
                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-amber-900 flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-amber-600" />
                        DASI 기여 포인트 할인
                      </span>
                      <span className="text-[10px] text-amber-700">보유: {profile.total_points.toLocaleString()}P</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const available = Math.min(profile.total_points, selectedGig.pricePerHour);
                          setUsedGigPoints(usedGigPoints > 0 ? 0 : Math.floor(available / 1000) * 1000);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          usedGigPoints > 0 ? 'bg-vintage-900 text-white' : 'bg-white border border-amber-300 text-amber-900'
                        }`}
                      >
                        {usedGigPoints > 0 ? `-${usedGigPoints.toLocaleString()}P 취소` : '포인트 즉시 할인'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between border-t border-vintage-100">
                  <div>
                    <span className="text-vintage-500">결제 예상 금액 (1시간)</span>
                    <div className="flex items-baseline gap-2">
                      <div className="text-base font-bold text-terracotta">
                        {Math.max(0, selectedGig.pricePerHour - usedGigPoints).toLocaleString()}원
                      </div>
                      {usedGigPoints > 0 && (
                        <span className="text-xs text-vintage-400 line-through">
                          {selectedGig.pricePerHour.toLocaleString()}원
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedGig(null)}
                      className="px-4 py-2.5 rounded-xl border border-vintage-300 text-vintage-700 font-semibold"
                    >
                      취소
                    </button>
                    <button
                      onClick={async () => {
                        playShutterSound('compact');
                        const finalPrice = Math.max(0, selectedGig.pricePerHour - usedGigPoints);
                        bookGig({
                          gigId: selectedGig.id,
                          title: selectedGig.title,
                          creatorName: selectedGig.creatorName,
                          location: selectedGig.location,
                          price: finalPrice,
                          scheduledAt: scheduledAtInput,
                        });

                        if (usedGigPoints > 0) {
                          try {
                            await awardPoints('redeem', selectedGig.id);
                          } catch (e) {
                            console.error(e);
                          }
                        }

                        showToast(
                          usedGigPoints > 0
                            ? `${selectedGig.creatorName} 작가님 예약 접수! (포인트 ${usedGigPoints.toLocaleString()}원 할인)`
                            : `${selectedGig.creatorName} 작가님 예약이 에스크로 보호 하에 접수되었습니다!`,
                          'success'
                        );
                        setIsBooked(true);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-terracotta text-white font-bold hover:bg-terracotta-light transition-colors shadow-xs"
                    >
                      안심 에스크로 예약하기
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* REGISTER AS CREATOR MODAL */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-vintage-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-vintage-100">
              <div className="flex items-center gap-2">
                <Camera className="w-6 h-6 text-terracotta" />
                <h3 className="font-serif text-xl font-bold text-vintage-900">
                  스냅 작가 알바 등록
                </h3>
              </div>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="p-1.5 text-vintage-400 hover:text-vintage-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isRegistered ? (
              <div className="text-center py-6 space-y-4 animate-fade-in">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <Check className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    작가 파트너 심사 접수 완료
                  </span>
                  <h4 className="font-serif text-2xl font-bold text-vintage-900">
                    스냅 알바 등록 완료
                  </h4>
                  <p className="text-xs text-vintage-600 max-w-sm mx-auto leading-relaxed">
                    등록해 주신 보유 카메라 정보와 포트폴리오를 담당 큐레이터가 확인 중입니다. <strong>24시간 내 승인 완료 알림톡</strong>과 함께 마켓에 정식 노출됩니다!
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-vintage-50 border border-vintage-200 text-xs text-left max-w-sm mx-auto space-y-1.5">
                  <div className="font-bold text-vintage-900 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-terracotta" />
                    <span>파트너 심사 번호: GIG-REG-2026-P88</span>
                  </div>
                  <div className="text-[11px] text-vintage-500">
                    수수료 혜택: 신규 등록 작가 첫 3회 매칭 수수료 0% 지원
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsRegisterOpen(false);
                    setIsRegistered(false);
                  }}
                  className="px-8 py-3 rounded-xl bg-vintage-900 text-white text-xs font-semibold hover:bg-terracotta transition-colors shadow-xs"
                >
                  확인 및 닫기
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4 text-xs text-vintage-700">
                  <p className="leading-relaxed">
                    내가 가진 카메라(라이카, 후지필름, 필카 등)로 주말에 용돈도 벌고,
                    국내외 여행자들에게 멋진 시선을 선물해 보세요!
                  </p>

                  <div className="space-y-1.5">
                    <label className="font-bold text-vintage-800">작가 닉네임</label>
                    <input
                      type="text"
                      value={gigForm.nickname}
                      onChange={(e) => setGigForm(f => ({ ...f, nickname: e.target.value }))}
                      placeholder={profile?.nickname || "예: 필름무드 / 준서"}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-vintage-300 focus:outline-none focus:border-terracotta"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-vintage-800">주 보유 카메라 &amp; 렌즈 기종</label>
                    <input
                      type="text"
                      value={gigForm.camera}
                      onChange={(e) => setGigForm(f => ({ ...f, camera: e.target.value }))}
                      placeholder="예: Fujifilm X100VI / Nikon FM2 (50mm F1.4)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-vintage-300 focus:outline-none focus:border-terracotta"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-bold text-vintage-800">활동 희망 지역</label>
                      <input
                        type="text"
                        value={gigForm.location}
                        onChange={(e) => setGigForm(f => ({ ...f, location: e.target.value }))}
                        placeholder="예: 성수동 / 을지로 / 북촌"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-vintage-300 focus:outline-none focus:border-terracotta"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-vintage-800">1시간당 희망 단가</label>
                      <input
                        type="number"
                        step="5000"
                        value={gigForm.price}
                        onChange={(e) => setGigForm(f => ({ ...f, price: Number(e.target.value) || 0 }))}
                        placeholder="예: 45000"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-vintage-300 focus:outline-none focus:border-terracotta font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-vintage-800">인스타그램 또는 포트폴리오 링크</label>
                    <input
                      type="text"
                      value={gigForm.portfolioUrl}
                      onChange={(e) => setGigForm(f => ({ ...f, portfolioUrl: e.target.value }))}
                      placeholder="https://instagram.com/your_id"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-vintage-300 focus:outline-none focus:border-terracotta"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setIsRegisterOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-vintage-300 text-xs font-semibold text-vintage-700 hover:bg-vintage-50"
                  >
                    닫기
                  </button>
                  <button
                    onClick={async () => {
                      if (!user) {
                        setIsRegisterOpen(false);
                        openLoginModal();
                        return;
                      }
                      const nick = gigForm.nickname.trim() || profile?.nickname || '신규 작가';
                      const cam = gigForm.camera.trim() || 'Nikon FM2 (50mm F1.4)';

                      playShutterSound('leaf');

                      const newGig: PhotoGig = {
                        id: `gig-custom-${Date.now()}`,
                        creatorName: nick,
                        creatorAvatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                        title: `${gigForm.location || '성수·을지로'} 감성 ${cam.split('/')[0].trim()} 로컬 스냅`,
                        category: 'daily_snap',
                        location: gigForm.location || '서울 성수동',
                        gearUsed: [cam],
                        pricePerHour: Number(gigForm.price) || 45000,
                        durationMinutes: 60,
                        rating: 5.0,
                        reviewsCount: 1,
                        isVerified: true,
                        tags: ['DASI인증', '로컬스냅', '필름감성'],
                        description: `DASI 인증 파트너 작가 ${nick}님의 감성 스냅입니다. ${cam} 장비로 따뜻한 시선을 선물해 드립니다.`,
                        portfolioImages: [
                          'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'
                        ],
                        languages: ['한국어']
                      };


                      setCustomGigs(prev => [newGig, ...prev]);
                      try {
                        await awardPoints('repair_case'); // 파트너 등록 기여 보너스
                      } catch (err) {
                        console.error(err);
                      }
                      setIsRegistered(true);
                      showToast('파트너 작가 등록이 완료되었습니다! (+300P 보너스 적립)', 'success');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-terracotta text-white text-xs font-bold hover:bg-terracotta-light transition-colors shadow-xs"
                  >
                    작가 등록 완료하기 (+300P)
                  </button>
                </div>

              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
