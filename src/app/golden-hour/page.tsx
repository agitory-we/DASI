'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sun,
  Moon,
  Clock,
  MapPin,
  Camera,
  Compass,
  Sliders,
  Sparkles,
  Share2,
  Calendar,
  AlertCircle,
  ChevronRight,
  Users,
} from 'lucide-react';
import * as SunCalc from 'suncalc';
import { shareViaKakaoTalk } from '@/utils/kakaoShare';

interface SunsetSpot {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  bestAngle: string;
  recommendedFilm: string;
  recommendedLens: string;
  exposureTip: string;
  description: string;
  imageUrl: string;
}

const SUNSET_SPOTS: SunsetSpot[] = [
  {
    id: 'sunset-spot-1',
    name: '응봉산 팔각정',
    district: '성동구 응봉동',
    lat: 37.5489,
    lng: 127.0325,
    bestAngle: '동호대교 & 성수대교 S자 한강 물결 뷰',
    recommendedFilm: '후지 벨비아 50 / 코닥 엑타 100',
    recommendedLens: '85mm ~ 135mm 망원계열',
    exposureTip: 'F8, 1/60s (삼각대 지참 권장, 일몰 15분 전 하이라이트 중점 측광)',
    description: '서울 한강과 도심 도로의 차량 궤적 및 골든아워 반사를 담기에 가장 이상적인 성지입니다.',
    imageUrl: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'sunset-spot-2',
    name: '낙산공원 한양도성 성곽길',
    district: '종로구 이화동',
    lat: 37.5815,
    lng: 127.0076,
    bestAngle: '도성 성곽 능선 너머 동대문 & 남산타워 실루엣',
    recommendedFilm: '코닥 포트라 400 / 컬러플러스 200',
    recommendedLens: '35mm ~ 50mm 표준 렌즈',
    exposureTip: 'F4.0 ~ F5.6, 1/125s (일몰 직후 블루아워 시 성곽 은은한 조명 점등)',
    description: '고즈넉한 조선의 돌담 성곽과 현대적인 남산타워 야경이 조화를 이루는 대표 출사지입니다.',
    imageUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'sunset-spot-3',
    name: '선유도공원 선유교',
    district: '영등포구 양평동',
    lat: 37.5425,
    lng: 126.9015,
    bestAngle: '선유교 아치형 다리 위 양화대교 & 국회의사당 일몰',
    recommendedFilm: '코닥 골드 200 / 일포드 HP5+ (흑백)',
    recommendedLens: '28mm ~ 35mm 광각 렌즈',
    exposureTip: 'F8, 1/250s (태양 직접 프레임 인 시 역광 렌즈 플레어 연출)',
    description: '탁 트인 한강 서쪽 지평선으로 떨어지는 붉은 노을과 다리의 기하학적 곡선이 일품입니다.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'sunset-spot-4',
    name: '노들섬 달빛광장 & 서쪽 잔디밭',
    district: '용산구 이촌동',
    lat: 37.5175,
    lng: 126.9580,
    bestAngle: '한강철교 위로 지나가는 1호선 전철과 여의도 63빌딩',
    recommendedFilm: '시네스틸 800T (블루아워/야경 특화)',
    recommendedLens: '50mm F1.4 단렌즈',
    exposureTip: 'F2.8, 1/60s (네온사인과 차량 전조등의 붉은 할레이션 극대화)',
    description: '철교를 건너는 기차의 아날로그 감성과 여의도의 현대적 스카이라인이 드라마틱하게 대비됩니다.',
    imageUrl: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&auto=format&fit=crop&q=80',
  },
];

export default function GoldenHourPage() {
  const [times, setTimes] = useState<{
    sunset: string;
    goldenStart: string;
    goldenEnd: string;
    blueStart: string;
    blueEnd: string;
    countdownMinutes: number;
    phase: string;
  } | null>(null);

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const calc = () => {
      const current = new Date();
      setNow(current);
      try {
        const scTimes = SunCalc.getTimes(current, 37.5665, 126.978);
        if (scTimes.sunset && !isNaN(scTimes.sunset.getTime())) {
          const sunsetDate = scTimes.sunset;
          const goldenStartDate = new Date(sunsetDate.getTime() - 60 * 60 * 1000);
          const blueEndDate = new Date(sunsetDate.getTime() + 30 * 60 * 1000);

          const fmt = (d: Date) => {
            const h = String(d.getHours()).padStart(2, '0');
            const m = String(d.getMinutes()).padStart(2, '0');
            return `${h}:${m}`;
          };

          const diffMins = Math.round((sunsetDate.getTime() - current.getTime()) / (1000 * 60));

          let currentPhase = '낮 (Daylight)';
          if (diffMins > 0 && diffMins <= 60) {
            currentPhase = '✨ 매직 골든아워 진행 중';
          } else if (diffMins <= 0 && diffMins >= -30) {
            currentPhase = '🌌 딥 블루아워 진행 중';
          } else if (diffMins < -30) {
            currentPhase = '🌙 야경 (Night)';
          }

          setTimes({
            sunset: fmt(sunsetDate),
            goldenStart: fmt(goldenStartDate),
            goldenEnd: fmt(sunsetDate),
            blueStart: fmt(sunsetDate),
            blueEnd: fmt(blueEndDate),
            countdownMinutes: diffMins,
            phase: currentPhase,
          });
        }
      } catch (e) {
        console.error(e);
      }
    };

    calc();
    const timer = setInterval(calc, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200">
          <Sun className="w-3.5 h-3.5 text-amber-600 animate-spin" />
          <span>실시간 천문 기상 알고리즘 (SunCalc 서울 천구 기준)</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-vintage-900 tracking-tight">
          서울 실시간 골든아워 &amp; 매직아워 출사 예보
        </h1>
        <p className="text-sm sm:text-base text-vintage-700 max-w-3xl leading-relaxed">
          필름카메라 사진이 가장 아름답게 물드는 하루 1시간, 태양의 고도가 6도 이하로 내려앉는 
          <strong>골든아워(Golden Hour)</strong>와 일몰 직후 30분의 <strong>블루아워(Blue Hour)</strong>를 실시간으로 예보합니다.
        </p>
      </div>

      {/* Real-time Sun Timeline Dashboard */}
      {times && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#2D241E] to-[#1F1813] text-white shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs">
                현재 상태: {times.phase}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold mt-2">
                오늘의 서울 일몰: <span className="text-amber-400">{times.sunset}</span>
              </h2>
            </div>

            <div className="text-right sm:text-right">
              <div className="text-xs text-stone-400">일몰까지 남은 시간</div>
              <div className="font-serif text-3xl sm:text-4xl font-bold text-amber-300 tracking-tight">
                {times.countdownMinutes > 0 ? `${times.countdownMinutes}분 전` : '일몰 완료'}
              </div>
            </div>
          </div>

          {/* Timeline Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="text-xs text-amber-400 font-bold flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5" />
                <span>골든아워 (Golden Hour)</span>
              </div>
              <div className="text-lg font-bold font-mono">
                {times.goldenStart} ~ {times.goldenEnd}
              </div>
              <div className="text-[11px] text-stone-400 leading-snug">
                따뜻한 황금빛 사광선, 인물 윤곽광 및 긴 그림자 연출
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="text-xs text-rose-400 font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>일몰 정점 (Sunset Peak)</span>
              </div>
              <div className="text-lg font-bold font-mono text-rose-300">
                {times.sunset}
              </div>
              <div className="text-[11px] text-stone-400 leading-snug">
                태양이 지평선에 걸치는 3분, 드라마틱한 실루엣 노출
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="text-xs text-indigo-400 font-bold flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5" />
                <span>블루아워 (Blue Hour)</span>
              </div>
              <div className="text-lg font-bold font-mono text-indigo-300">
                {times.blueStart} ~ {times.blueEnd}
              </div>
              <div className="text-[11px] text-stone-400 leading-snug">
                하늘의 짙은 코발트 블루와 도심 네온사인의 조화
              </div>
            </div>
          </div>

          {/* Quick Meter Link */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs">
            <span className="text-stone-300">
              💡 현장에서 조도가 급격히 변할 때는 DASI 실시간 필름 노출계를 활용하세요.
            </span>
            <Link
              href="/meter"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>실시간 필름 노출계 열기</span>
            </Link>
          </div>
        </div>
      )}

      {/* 4 Sunset Spots Grid */}
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-vintage-900">
            서울 4대 골든아워 일몰 출사 명소 &amp; 추천 세팅
          </h2>
          <p className="text-xs sm:text-sm text-vintage-600 mt-1">
            아날로그 필름의 입자와 색감을 가장 드라마틱하게 담을 수 있는 서울의 검증된 포인트입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SUNSET_SPOTS.map((spot) => (
            <div
              key={spot.id}
              className="rounded-3xl bg-white border border-vintage-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-[16/9] bg-stone-900 overflow-hidden">
                  <img
                    src={spot.imageUrl}
                    alt={spot.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-xs font-bold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-terracotta" />
                    <span>{spot.district}</span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-vintage-900 group-hover:text-terracotta transition-colors">
                      {spot.name}
                    </h3>
                    <p className="text-xs text-vintage-600 mt-1.5 leading-relaxed">
                      {spot.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-vintage-100 text-xs">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-vintage-800 shrink-0">추천 앵글:</span>
                      <span className="text-vintage-600">{spot.bestAngle}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-vintage-800 shrink-0">추천 필름:</span>
                        <span className="text-amber-800 font-semibold">{spot.recommendedFilm}</span>
                      </div>
                      <Link
                        href="/films"
                        className="px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold shrink-0 transition-colors"
                      >
                        당일 퀵 주문 →
                      </Link>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-vintage-800 shrink-0">추천 렌즈:</span>
                        <span className="text-vintage-600">{spot.recommendedLens}</span>
                      </div>
                      <Link
                        href={`/rent?spotTitle=${encodeURIComponent(spot.name)}&recommendedLens=${encodeURIComponent(spot.recommendedLens)}`}
                        className="px-2 py-0.5 rounded-md bg-vintage-100 hover:bg-vintage-200 text-vintage-800 text-[10px] font-bold shrink-0 transition-colors"
                      >
                        체험 장비 보기 →
                      </Link>
                    </div>

                    <div className="flex items-start gap-2 p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 font-medium">
                      <Camera className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">권장 노출값:</span>
                        <span className="text-[11px] leading-tight">{spot.exposureTip}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 space-y-2">
                <div className="flex gap-2">
                  <Link
                    href={`/map?spotId=${spot.id}`}
                    className="flex-1 py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white font-bold text-xs text-center transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>스팟 지도에서 확인</span>
                  </Link>

                  <Link
                    href="/explore"
                    className="px-3.5 py-2.5 rounded-xl border border-vintage-200 hover:bg-vintage-50 text-vintage-800 font-bold text-xs text-center transition-all flex items-center justify-center gap-1"
                    title="52주 출사 코스 전체 가이드"
                  >
                    <Compass className="w-3.5 h-3.5 text-terracotta" />
                    <span>52주 가이드</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      shareViaKakaoTalk({
                        title: `${spot.name} - 골든아워 일몰 출사 가이드`,
                        description: `추천 필름: ${spot.recommendedFilm} · 권장 세팅: ${spot.exposureTip}`,
                        imageUrl: spot.imageUrl,
                        buttonTitle: '일몰 예보 & 출사 팁 보기',
                      })
                    }
                    className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-950 transition-colors font-bold"
                    title="카카오톡 공유"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  href={`/experiences?action=create&spotTitle=${encodeURIComponent(spot.name)}&type=golden_hour`}
                  className="w-full py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300/80 font-bold text-xs text-center transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Users className="w-3.5 h-3.5 text-amber-700" />
                  <span>이 스팟으로 노을 번개 모임 만들기 (+300P)</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 52-Week Hobby Flow Bridge Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-vintage-900 to-[#2D241E] text-white space-y-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DASI 아날로그 52주 취미 여정 완주 가이드</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold">
              일몰 감상에서 사진 현상까지, 자연스러운 아날로그 루틴
            </h3>
          </div>
          <Link
            href="/explore"
            className="px-4 py-2 rounded-xl bg-terracotta hover:bg-terracotta-light text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <span>52주 출사지 전체 보기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <Link
            href="/meter"
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all space-y-1 group"
          >
            <div className="text-amber-400 font-bold flex items-center gap-1.5">
              <Sliders className="w-4 h-4 group-hover:rotate-45 transition-transform" />
              <span>Step 1. 실시간 노출계</span>
            </div>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              조도가 급변하는 골든아워, 셔터속도와 조리개를 즉시 측광합니다.
            </p>
          </Link>

          <Link
            href="/films"
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all space-y-1 group"
          >
            <div className="text-amber-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Step 2. 신선 필름 당일 퀵</span>
            </div>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              일몰 출사용 포트라 400, 시네스틸 800T를 서울 3시간 퀵으로 수령하세요.
            </p>
          </Link>

          <Link
            href="/studios"
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all space-y-1 group"
          >
            <div className="text-amber-400 font-bold flex items-center gap-1.5">
              <MapPin className="w-4 h-4 group-hover:bounce transition-transform" />
              <span>Step 3. 20% 제휴 현상소</span>
            </div>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              촬영 후 가까운 을지로/충무로 현상소에서 당일 고화질 스캔을 완성하세요.
            </p>
          </Link>

          <Link
            href="/rent"
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all space-y-1 group"
          >
            <div className="text-amber-400 font-bold flex items-center gap-1.5">
              <Camera className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>Step 4. 장비 부담 없는 체험</span>
            </div>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              사기 전에 먼저 써보고 대여료 100% 공제받는 Rent-to-Own을 경험하세요.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
