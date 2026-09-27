'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Camera, MapPin, Sun, ChevronRight, Gift, CheckCircle2 } from 'lucide-react';
import { useDasi } from '@/context/DasiContext';
import { useAuth } from '@/context/AuthContext';

const GENRES = [
  { id: 'landscape', emoji: '🏔️', label: '풍경 & 자연', desc: '골든아워 노을, 산과 바다' },
  { id: 'portrait',  emoji: '👤', label: '인물 & 스냅',  desc: '길거리 스냅, 일상 포트레이트' },
  { id: 'street',    emoji: '🏙️', label: '거리 & 도시',  desc: '을지로 골목, 레트로 간판' },
  { id: 'architecture', emoji: '🏛️', label: '건축 & 공간', desc: '카페, 독립서점, 오래된 집' },
  { id: 'film_grain', emoji: '🎞️', label: '필름 감성',   desc: '빈티지 색감, 그레인 텍스처' },
  { id: 'festival',  emoji: '🎪', label: '축제 & 이벤트', desc: '시즌 행사, 야외 공연' },
];

const SPOT_RECOMMENDATIONS: Record<string, { title: string; location: string; tip: string; camera: string }[]> = {
  landscape:   [{ title: '하늘공원 억새 일몰', location: '마포구 하늘공원', tip: '10~11월 억새, 일몰 30분 전 도착 필수', camera: 'Nikon FM2 (기계식 SLR)' }],
  portrait:    [{ title: '익선동 한옥 골목', location: '종로구 익선동', tip: '오전 9시 인파 적을 때 골든 라이팅', camera: 'Contax T2 (칼자이스 T*)' }],
  street:      [{ title: '을지로 3가 인쇄골목', location: '중구 을지로3가', tip: '야간 네온 사인, ISO 800 추천', camera: 'Olympus PEN EE-3 (72컷 하프)' }],
  architecture:[{ title: '문화역서울 284', location: '중구 봉래동2가', tip: '구 서울역, 건축 외관 광각 필수', camera: 'Fujifilm X100VI (디지털 컴팩트)' }],
  film_grain:  [{ title: '성수 독립서점 거리', location: '성동구 성수동1가', tip: 'Kodak Gold 200 + 자연광 필수', camera: 'Ricoh GR IIIx (어반 스냅)' }],
  festival:    [{ title: '광화문 광장 시즌 행사', location: '종로구 세종대로', tip: '야간 조명 이벤트, 삼각대 필수', camera: 'Nikon Coolpix 4500 (스위블 Y2K)' }],
};

export default function OnboardingPage() {
  const router = useRouter();
  const { showToast } = useDasi();
  const { user, openLoginModal, awardPoints } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [couponIssued, setCouponIssued] = useState(false);

  const toggleGenre = (id: string) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const recommendedSpots = selectedGenres.flatMap((g) => SPOT_RECOMMENDATIONS[g] ?? []).slice(0, 3);

  const handleIssueCoupon = async () => {
    if (!user) { openLoginModal(); return; }
    try {
      await awardPoints('spot_report', 'onboarding_welcome');
    } catch (e) {
      console.error(e);
    }
    setCouponIssued(true);
    showToast('🎁 첫 렌탈 500P 웰컴 쿠폰이 발급되었습니다! 마이 캐비닛에서 확인하세요.', 'success');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0]">
      {/* Progress Bar & Step Badge */}
      <div className="w-full bg-vintage-100 h-1.5 relative">
        <div
          className="h-1.5 bg-terracotta transition-all duration-500 rounded-r-full"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>STEP {step} OF 3 · DASI 웰컴 온보딩</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-vintage-900 break-keep keep-all">
            {step === 1 && '어떤 사진을 좋아하세요?'}
            {step === 2 && '취향 맞춤 출사지와 어울리는 카메라'}
            {step === 3 && '웰컴 쿠폰을 받으세요!'}
          </h1>
          <p className="text-xs text-vintage-600 break-keep keep-all leading-relaxed">
            {step === 1 && '관심 있는 장르를 최대 3개 선택하시면 맞춤 출사지와 추천 카메라를 매칭해 드립니다.'}
            {step === 2 && `${selectedGenres.length}개 관심 장르 기반으로 선별한 서울 도심 출사지와 찰떡 기종입니다.`}
            {step === 3 && '가입 기념으로 첫 렌탈에 즉시 사용 가능한 500P 쿠폰을 드립니다.'}
          </p>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {GENRES.map((genre) => {
                const isSelected = selectedGenres.includes(genre.id);
                return (
                  <button
                    key={genre.id}
                    onClick={() => toggleGenre(genre.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${
                      isSelected
                        ? 'border-terracotta bg-terracotta/5 shadow-sm ring-1 ring-terracotta/30'
                        : 'border-vintage-200 bg-white hover:border-vintage-400'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-2xl mb-2">{genre.emoji}</div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-terracotta text-white flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-sm text-vintage-900">{genre.label}</div>
                    <div className="text-xs text-vintage-500 mt-0.5">{genre.desc}</div>
                  </button>
                );
              })}
            </div>
            <div className="text-center">
              <span className="text-xs text-vintage-500 font-mono">선택 장르: {selectedGenres.length} / 3</span>
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={selectedGenres.length === 0}
              className="w-full py-3.5 rounded-2xl bg-terracotta hover:bg-terracotta-light text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-terracotta/20"
            >
              <span>추천 출사지 & 추천 기종 확인하기</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4">
            {recommendedSpots.length > 0 ? (
              recommendedSpots.map((spot, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white border border-vintage-200 shadow-xs space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-vintage-900 text-sm">{spot.title}</h3>
                      <p className="text-xs text-vintage-500">{spot.location}</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-vintage-700 flex items-start gap-2">
                    <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{spot.tip}</span>
                  </div>

                  <div className="pt-2 border-t border-vintage-100 flex items-center justify-between text-xs">
                    <span className="text-vintage-500 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-terracotta" />
                      <span>추천 기종: <strong className="text-vintage-800">{spot.camera}</strong></span>
                    </span>
                    <button
                      onClick={() => router.push('/rent')}
                      className="text-terracotta hover:underline font-bold text-[11px]"
                    >
                      기기 보기 →
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-vintage-500 text-sm">
                관심 장르에 맞는 스팟을 계속 업데이트 중입니다. 탐색 페이지에서 전체 명소를 확인해 보세요!
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button onClick={() => setStep(1)} className="py-3 rounded-2xl bg-vintage-100 text-vintage-800 text-sm font-bold hover:bg-vintage-200 transition-colors">
                다시 선택
              </button>
              <button
                onClick={() => setStep(3)}
                className="py-3 rounded-2xl bg-terracotta hover:bg-terracotta-light text-white text-sm font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md shadow-terracotta/20"
              >
                <span>웰컴 쿠폰 받기</span>
                <Gift className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-vintage-900 to-[#2d1a10] text-white text-center space-y-3 shadow-xl">
              <div className="text-4xl">🎁</div>
              <div>
                <div className="text-xs font-bold text-amber-300 mb-1">DASI 웰컴 쿠폰</div>
                <div className="font-serif text-3xl font-bold">500P</div>
                <div className="text-sm text-vintage-300 mt-1">첫 렌탈 즉시 차감 혜택</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-xs text-vintage-200 space-y-0.5">
                <div>• 카메라 렌탈 결제 시 500P 즉시 차감</div>
                <div>• 유효기간: 발급일로부터 30일</div>
                <div>• 1회 사용 후 소멸</div>
              </div>
              {!couponIssued ? (
                <button
                  onClick={handleIssueCoupon}
                  className="w-full py-3 rounded-xl bg-terracotta hover:bg-terracotta/80 text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Gift className="w-4 h-4" />
                  500P 웰컴 쿠폰 받기
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  쿠폰 발급 완료!
                </div>
              )}
            </div>
            <div className="space-y-2 text-xs text-vintage-500 text-center">
              <p>관심 장르 필터가 탐색 페이지에 저장됩니다.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => router.push('/explore')}
                className="py-3 rounded-2xl bg-vintage-100 text-vintage-800 text-sm font-bold hover:bg-vintage-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-4 h-4" />
                출사지 탐색
              </button>
              <button
                onClick={() => router.push('/rent')}
                className="py-3 rounded-2xl bg-vintage-900 hover:bg-terracotta text-white text-sm font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Camera className="w-4 h-4" />
                카메라 렌탈
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}