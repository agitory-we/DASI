'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import * as SunCalc from 'suncalc';
import {
  Sun,
  Sunset,
  Sunrise,
  Sparkles,
  Camera,
  MapPin,
  Clock,
  Compass,
  Sliders,
  ChevronRight,
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import { useDasi } from '@/context/DasiContext';

interface SunsetSpot {
  name: string;
  area: string;
  vibe: string;
  bestAngle: string;
  lensRecommendation: string;
  recommendedFilm: string;
  exposureTip: string;
  imageUrl: string;
}

const SUNSET_SPOTS: SunsetSpot[] = [
  {
    name: '세운상가 옥상 (서울옥상)',
    area: '종로·을지로',
    vibe: '종묘와 북악산, 남산타워를 360도로 조망하는 레트로 스카이라인',
    bestAngle: '일몰 20분 전 종묘 방향 붉은 노을 + 종로 귀금속 골목 네온',
    lensRecommendation: '35mm 단렌즈 (도심 원경) 또는 50mm F1.4',
    recommendedFilm: '코닥 포트라 400 또는 울트라맥스 400',
    exposureTip: 'F2.8 ~ F4, 셔터 1/60s (노을 하이라이트 측광)',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: '노들섬 일몰 잔디마당 & 한강철교',
    area: '용산·동작',
    vibe: '한강 위로 달리는 1호선 전동차와 63빌딩 실루엣의 물빛 반영',
    bestAngle: '일몰 직후 블루아워 15분간 한강철교 교각 실루엣',
    lensRecommendation: '85mm ~ 135mm 망원렌즈 (열차 압축 구도)',
    recommendedFilm: '시네스틸 800T 또는 후지 C200',
    exposureTip: 'F5.6, 셔터 1/125s (열차 움직임 고정 시 삼각대 권장)',
    imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: '남산 백범광장 한양도성 성곽길',
    area: '중구·용산',
    vibe: '고색창연한 조선 성곽과 현대적인 힐튼·도심 빌딩의 절묘한 공존',
    bestAngle: '성곽 조명이 켜지는 일몰 후 10분, 성곽 곡선 라인',
    lensRecommendation: '28mm 광각렌즈 또는 40mm 팬케이크 렌즈',
    recommendedFilm: '코닥 컬러플러스 200',
    exposureTip: 'F4, 셔터 1/30s (성곽 돌담 텍스처 살리기)',
    imageUrl: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: '응봉산 팔각정 일몰 & 동호대교 야경',
    area: '성동구 응봉동',
    vibe: '한강, 중랑천, 강변북로의 끝없는 차량 궤적과 황금빛 일몰',
    bestAngle: '동호대교 남단 오렌지색 조명과 한강 수면 반사',
    lensRecommendation: '50mm 표준 또는 24-70mm 줌렌즈',
    recommendedFilm: '코닥 골드 200 또는 일포드 HP5+ 흑백',
    exposureTip: 'F8 조리개 조임 (가로등 빛갈라짐 연출)',
    imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=800&auto=format&fit=crop&q=80',
  },
];

export default function GoldenHourPage() {
  const [now, setNow] = useState<Date>(new Date());
  const [times, setTimes] = useState<{
    sunset: string;
    goldenStart: string;
    goldenEnd: string;
    blueStart: string;
    blueEnd: string;
    countdownMinutes: number;
    phase: string;
  }>({
    sunset: '18:24',
    goldenStart: '17:24',
    goldenEnd: '18:24',
    blueStart: '18:24',
    blueEnd: '18:54',
    countdownMinutes: 45,
    phase: 'golden_approaching',
  });

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
            return ${h}:;
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
    <div className=max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10>
      {/* Header Banner */}
      <div className=space-y-3>
        <div className=inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200>
          <Sun className=w-3.5 h-3.5 text-amber-600 animate-spin />
          <span>실시간 천문 기상 알고리즘 (SunCalc 서울 천구 기준)</span>
        </div>
        <h1 className=font-serif text-3xl sm:text-4xl font-bold text-vintage-900 tracking-tight>
          서울 실시간 골든아워 &amp; 매직아워 출사 예보
        </h1>
        <p className=text-sm sm:text-base text-vintage-700 max-w-3xl leading-relaxed>
          필름카메라 사진이 가장 아름답게 물드는 하루 1시간, 태양의 고도가 6도 이하로 내려앉는 
          <strong>골든아워(Golden Hour)</strong>와 일몰 직후 30분의 <strong>블루아워(Blue Hour)</strong>를 실시간으로 예보합니다.
        </p>
      </div>

      {/* Realtime Golden Hour Timeline Monitor */}
      <div className=rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-6>
        <div className=flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 pb-6 relative z-10>
          <div className=space-y-1>
            <span className=px-2.5 py-0.5 rounded-full bg-black/40 text-amber-200 text-xs font-mono font-bold>
              {times.phase}
            </span>
            <h2 className=text-2xl sm:text-3xl font-serif font-bold>
              오늘 서울 일몰 시각은 <span className=underline decoration-amber-300 font-mono>{times.sunset}</span> 입니다
            </h2>
          </div>

          <div className=p-4 rounded-2xl bg-black/30 backdrop-blur-md border border-white/20 text-center font-mono shrink-0>
            <div className=text-[10px] text-amber-200 uppercase tracking-widest>일몰까지 카운트다운</div>
            <div className=text-2xl sm:text-3xl font-extrabold text-amber-300>
              {times.countdownMinutes > 0 ? D-분 : '일몰 완료'}
            </div>
          </div>
        </div>

        {/* 3-Step Timeline */}
        <div className=grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 text-xs>
          <div className=p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 space-y-1.5>
            <div className=flex items-center justify-between font-bold text-amber-200>
              <span>1. 골든아워 (Golden Hour)</span>
              <span className=font-mono>{times.goldenStart} ~ {times.goldenEnd}</span>
            </div>
            <p className=text-amber-100/90 text-[11px] leading-relaxed>
              사광이 길게 늘어지며 도시 전체가 따스한 오렌지빛으로 물듭니다. 감도 ISO 200 추천.
            </p>
          </div>

          <div className=p-4 rounded-2xl bg-white/20 backdrop-blur-xs border-2 border-white/40 space-y-1.5 shadow-md>
            <div className=flex items-center justify-between font-bold text-white>
              <span>2. 공식 일몰 (Sunset Moment)</span>
              <span className=font-mono text-amber-300 font-extrabold text-sm>{times.sunset}</span>
            </div>
            <p className=text-amber-100 text-[11px] leading-relaxed>
              태양이 지평선 아래로 사라지는 10분. 노출계는 하늘의 하이라이트에 맞추세요.
            </p>
          </div>

          <div className=p-4 rounded-2xl bg-indigo-950/40 backdrop-blur-xs border border-white/15 space-y-1.5>
            <div className=flex items-center justify-between font-bold text-indigo-200>
              <span>3. 딥 블루아워 (Blue Hour)</span>
              <span className=font-mono>{times.blueStart} ~ {times.blueEnd}</span>
            </div>
            <p className=text-indigo-100/90 text-[11px] leading-relaxed>
              가로등이 켜지며 감청색 하늘과 도심 불빛이 극적 대비를 이룹니다. 감도 ISO 400~800 추천.
            </p>
          </div>
        </div>
      </div>

      {/* Film & Exposure Guide Bar */}
      <div className=grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-white border border-vintage-200 text-xs shadow-2xs>
        <div className=space-y-1>
          <span className=font-bold text-vintage-900 flex items-center gap-1.5>
            <Camera className=w-4 h-4 text-terracotta />
            <span>오늘의 추천 필름</span>
          </span>
          <p className=text-vintage-600 text-[11px]>
            코닥 컬러플러스 200 (낮~노을) / 시네스틸 800T (블루아워 야경)
          </p>
        </div>

        <div className=space-y-1>
          <span className=font-bold text-vintage-900 flex items-center gap-1.5>
            <Sliders className=w-4 h-4 text-amber-600 />
            <span>표준 측광 팁</span>
          </span>
          <p className=text-vintage-600 text-[11px]>
            노을 하늘 측광 시 +1스탑 오버 권장 (역광 피사체 실루엣 방지)
          </p>
        </div>

        <div className=space-y-1>
          <span className=font-bold text-vintage-900 flex items-center gap-1.5>
            <Clock className=w-4 h-4 text-emerald-600 />
            <span>필름 당일 퀵 수령</span>
          </span>
          <p className=text-vintage-600 text-[11px]>
            출사지 출발 전 <Link href=/films className=text-terracotta font-bold underline>필름 3롤 퀵 주문</Link> 시 3시간 내 현장 도착
          </p>
        </div>
      </div>

      {/* 4 Sunset Spots Showcase */}
      <div className=space-y-4>
        <h3 className=font-serif text-2xl font-bold text-vintage-900>
          서울 4대 일몰 &amp; 매직아워 추천 출사 스팟
        </h3>
        <p className=text-xs text-vintage-500>
          오늘 골든아워에 맞춰 방문하기 좋은 검증된 스팟과 최적의 촬영 세팅입니다.
        </p>

        <div className=grid grid-cols-1 md:grid-cols-2 gap-6 pt-2>
          {SUNSET_SPOTS.map((spot, idx) => (
            <div
              key={idx}
              className=rounded-3xl bg-white border border-vintage-200 overflow-hidden shadow-xs hover:border-amber-400 hover:shadow-xl transition-all flex flex-col justify-between group
            >
              <div>
                <div className=relative aspect-[16/9] bg-vintage-100 overflow-hidden>
                  <img
                    src={spot.imageUrl}
                    alt={spot.name}
                    className=w-full h-full object-cover group-hover:scale-105 transition-transform duration-700
                  />
                  <div className=absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-xs font-bold flex items-center gap-1>
                    <MapPin className=w-3.5 h-3.5 text-amber-400 />
                    <span>{spot.area}</span>
                  </div>
                </div>

                <div className=p-6 space-y-4>
                  <div>
                    <h4 className=font-serif text-xl font-bold text-vintage-900 group-hover:text-terracotta transition-colors>
                      {spot.name}
                    </h4>
                    <p className=text-xs text-vintage-600 mt-1 leading-relaxed>
                      {spot.vibe}
                    </p>
                  </div>

                  <div className=space-y-2 text-xs>
                    <div className=p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1>
                      <span className=font-bold text-amber-950 block>📸 최적의 앵글 타이밍:</span>
                      <span className=text-amber-900 text-[11px] block>{spot.bestAngle}</span>
                    </div>

                    <div className=grid grid-cols-2 gap-2 text-[11px]>
                      <div className=p-2.5 rounded-xl bg-vintage-50 border border-vintage-150>
                        <span className=text-vintage-500 font-bold block>추천 화각:</span>
                        <span className=text-vintage-800 font-medium>{spot.lensRecommendation}</span>
                      </div>
                      <div className=p-2.5 rounded-xl bg-vintage-50 border border-vintage-150>
                        <span className=text-vintage-500 font-bold block>노출 가이드:</span>
                        <span className=text-vintage-800 font-mono font-medium>{spot.exposureTip}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className=p-6 pt-0>
                <Link
                  href=/map
                  className=w-full py-2.5 rounded-xl border border-vintage-300 hover:bg-vintage-100 text-vintage-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5
                >
                  <MapPin className=w-3.5 h-3.5 />
                  <span>스팟 지도에서 근처 현상소 찾기</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}