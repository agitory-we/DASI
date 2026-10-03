'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Film,
  CheckCircle2,
  Calendar,
  Gift,
  Award,
  ChevronRight,
  ShieldCheck,
  Check,
  Zap,
  MapPin,
  TrendingDown,
  Layers
} from 'lucide-react';
import { playShutterSound } from '@/utils/shutterAudio';
import { useDasi } from '@/context/DasiContext';

interface StampItem {
  id: string;
  theme: string;
  location: string;
  season: string;
  color: string;
  stamped: boolean;
}

export default function FilmPassportPage() {
  const { showToast } = useDasi();
  const [selectedPlan, setSelectedPlan] = useState<'classic' | 'master'>('classic');
  const [subscriptionMonths, setSubscriptionMonths] = useState<number>(6);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Digital Passport Stamps State
  const [stamps, setStamps] = useState<StampItem[]>([
    {
      id: 'stamp-1',
      theme: '을지로 1980s 인쇄골목',
      location: '서울 중구 을지로3가',
      season: 'Autumn Sunset',
      color: 'border-amber-700 text-amber-800 bg-amber-50',
      stamped: true,
    },
    {
      id: 'stamp-2',
      theme: '성수 붉은벽돌 아틀리에',
      location: '서울 성동구 연무장길',
      season: 'Summer Afternoon',
      color: 'border-rose-700 text-rose-800 bg-rose-50',
      stamped: false,
    },
    {
      id: 'stamp-3',
      theme: '제주 금오름 억새 능선',
      location: '제주 한림읍 금악리',
      season: 'Golden Hour Peak',
      color: 'border-emerald-700 text-emerald-800 bg-emerald-50',
      stamped: false,
    },
    {
      id: 'stamp-4',
      theme: '동해 정동진 여명 실루엣',
      location: '강원 강릉시 강동면',
      season: 'Winter Sunrise',
      color: 'border-indigo-700 text-indigo-800 bg-indigo-50',
      stamped: false,
    },
  ]);

  const handleToggleStamp = (id: string) => {
    playShutterSound('slr');
    setStamps((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const next = !s.stamped;
          showToast(
            next
              ? `🎯 [${s.theme}] 디지털 스탬프가 여권에 각인되었습니다!`
              : `스탬프 각인이 해제되었습니다.`,
            'info'
          );
          return { ...s, stamped: next };
        }
        return s;
      })
    );
  };

  // Rent-to-Own simulation calculation
  const cameraPrice = 450000; // Nikon FM2 standard valuation
  const monthlySavings = selectedPlan === 'classic' ? 20000 : 40000;
  const accumulatedCredit = Math.min(cameraPrice, subscriptionMonths * monthlySavings);
  const remainingBuyoutPrice = Math.max(0, cameraPrice - accumulatedCredit);

  const handleSubscribe = () => {
    setIsSubscribing(true);
    playShutterSound('slr');
    setTimeout(() => {
      setIsSubscribing(false);
      setIsSubscribed(true);
      showToast('🎉 DASI 필름 패스포트 멤버십 가입이 완료되었습니다!', 'success');
    }, 700);
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-amber-500 selection:text-stone-950">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
          <Link href="/" className="hover:text-amber-400 transition-colors">DASI</Link>
          <ChevronRight className="w-3 h-3 text-stone-600" />
          <span className="text-amber-500 font-semibold">MEMBERSHIP</span>
          <ChevronRight className="w-3 h-3 text-stone-600" />
          <span>필름 패스포트 & 정기 구독</span>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-600/30 text-amber-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CEO ARCHITECTURE · 1년 52주 아날로그 구독 경제</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-stone-50">
            DASI 필름 패스포트
          </h1>
          <p className="text-sm sm:text-base text-stone-400 max-w-2xl mx-auto leading-relaxed">
            매월 계절의 빛에 맞춘 큐레이션 필름과 현상소 스캔권이 집앞으로 배송됩니다.
            <br className="hidden sm:inline" />
            전국 4만 건 골든아워 명소를 탐험하고 나만의 디지털 여권에 빛의 여정을 기록하세요.
          </p>
        </div>

        {/* Digital Passport Notebook Interaction */}
        <div className="bg-[#f7f2e7] text-stone-900 rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-amber-900/30 relative overflow-hidden font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-stone-300 pb-5 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-900 text-amber-100 flex items-center justify-center font-serif font-bold text-lg">
                D
              </div>
              <div>
                <div className="text-[10px] text-amber-900 font-bold uppercase tracking-widest">
                  Republic of Analog
                </div>
                <div className="text-xl font-serif font-black tracking-tight">
                  OFFICIAL FILM PASSPORT
                </div>
              </div>
            </div>
            <div className="text-xs text-stone-600 font-sans">
              각인된 스탬프: <strong>{stamps.filter((s) => s.stamped).length} / 4개</strong>
            </div>
          </div>

          <div className="space-y-4 mb-4">
            <div className="text-xs text-stone-600 font-sans flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-800" />
              <span>스탬프를 탭하여 출사지 방문 인증 및 도장 각인을 시뮬레이션해 보세요:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stamps.map((stamp) => (
                <div
                  key={stamp.id}
                  onClick={() => handleToggleStamp(stamp.id)}
                  className={`border-2 border-dashed rounded-2xl p-4 cursor-pointer transition-all duration-300 flex flex-col items-center text-center justify-between relative group select-none min-h-[160px] ${
                    stamp.stamped
                      ? `${stamp.color} shadow-md scale-100`
                      : 'border-stone-300 bg-white/40 hover:bg-white text-stone-400 opacity-60'
                  }`}
                >
                  <div className="text-[9px] uppercase tracking-wider font-bold">
                    {stamp.season}
                  </div>

                  {stamp.stamped ? (
                    <div className="my-2 border-4 border-current rounded-full w-20 h-20 flex flex-col items-center justify-center rotate-[-8deg] animate-in zoom-in-50 duration-300">
                      <span className="text-[10px] font-black uppercase leading-tight">DASI</span>
                      <span className="text-[8px] font-bold">PASSED</span>
                      <span className="text-[8px] font-mono">2026</span>
                    </div>
                  ) : (
                    <div className="my-2 border-2 border-dashed border-stone-300 rounded-full w-20 h-20 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <span className="text-[10px] text-stone-400">도장 찍기</span>
                    </div>
                  )}

                  <div>
                    <div className="font-bold text-xs text-stone-900">{stamp.theme}</div>
                    <div className="text-[10px] text-stone-500 font-sans">{stamp.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subscription Plans Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Plan 1: Classic Pass */}
          <div
            onClick={() => setSelectedPlan('classic')}
            className={`rounded-2xl p-6 sm:p-8 border-2 transition-all cursor-pointer relative bg-stone-950 flex flex-col justify-between ${
              selectedPlan === 'classic'
                ? 'border-amber-500 shadow-2xl shadow-amber-950/40'
                : 'border-stone-800 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono text-amber-500 font-bold uppercase tracking-wider">
                    DAILY ANALOG
                  </span>
                  <h3 className="text-2xl font-bold font-serif text-stone-100 mt-1">
                    클래식 패스 (Classic)
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black font-mono text-stone-100">19,900</span>
                  <span className="text-xs text-stone-400"> 원/월</span>
                </div>
              </div>

              <p className="text-xs text-stone-400 leading-relaxed">
                필름 사진을 매월 꾸준히 즐기고 싶은 입문자 및 일상 포토그래퍼를 위한 기본 구독제.
              </p>

              <div className="border-t border-stone-800 pt-4 space-y-2.5">
                {[
                  '매월 계절 맞춤 큐레이션 필름 1롤 무료 배송',
                  '충무로 제휴 현상소 고해상도 Noritsu 스캔권 1매',
                  '전국 4만 건 골든아워 히든 스팟 좌표 매월 언락',
                  'Rent-to-Own 인수금 월 20,000원 자동 누적 적립'
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-stone-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <button
                className={`w-full py-3 rounded-xl font-bold text-xs transition-all ${
                  selectedPlan === 'classic'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-900 text-stone-400 border border-stone-800'
                }`}
              >
                클래식 패스 선택됨
              </button>
            </div>
          </div>

          {/* Plan 2: Master Pass */}
          <div
            onClick={() => setSelectedPlan('master')}
            className={`rounded-2xl p-6 sm:p-8 border-2 transition-all cursor-pointer relative bg-stone-950 flex flex-col justify-between ${
              selectedPlan === 'master'
                ? 'border-amber-400 shadow-2xl shadow-amber-950/60 ring-2 ring-amber-400/20'
                : 'border-stone-800 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 text-[10px] font-black uppercase tracking-wider">
              PRO & COLLECTOR
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                    PREMIUM HERITAGE
                  </span>
                  <h3 className="text-2xl font-bold font-serif text-stone-100 mt-1">
                    마스터 패스 (Master)
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black font-mono text-amber-400">34,900</span>
                  <span className="text-xs text-stone-400"> 원/월</span>
                </div>
              </div>

              <p className="text-xs text-stone-400 leading-relaxed">
                포트라·시네스틸 등 프리미엄 필름과 무압축 TIFF 스캔, 명장 케어를 누리는 컬렉터스 플랜.
              </p>

              <div className="border-t border-stone-800 pt-4 space-y-2.5">
                {[
                  '매월 프리미엄/시네마 필름 2롤 (Portra/Cinestill 등)',
                  '충무로 무압축 16-bit TIFF 스캔권 2매 동봉',
                  '40년 을지로 명장 연 1회 카메라 무료 종합 오버홀',
                  'Rent-to-Own 인수금 월 40,000원 자동 누적 적립'
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-stone-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <button
                className={`w-full py-3 rounded-xl font-bold text-xs transition-all ${
                  selectedPlan === 'master'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 font-bold'
                    : 'bg-stone-900 text-stone-400 border border-stone-800'
                }`}
              >
                마스터 패스 선택됨
              </button>
            </div>
          </div>
        </div>

        {/* Rent-to-Own Equity Buyout Simulator */}
        <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 mb-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>RENT-TO-OWN EQUITY SIMULATOR</span>
              </div>
              <h3 className="text-xl font-bold font-serif text-stone-100">
                구독으로 카메라 내 것 만들기 시뮬레이터
              </h3>
            </div>
            <div className="text-xs text-stone-400 font-mono">
              예시 기준 기종: <strong>Nikon FM2 (450,000원 상당)</strong>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs font-mono text-stone-400">
              <span>구독 유지 기간: <strong className="text-amber-400 text-sm">{subscriptionMonths}개월</strong></span>
              <span>월 적립: {monthlySavings.toLocaleString()}원</span>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              value={subscriptionMonths}
              onChange={(e) => setSubscriptionMonths(Number(e.target.value))}
              className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[11px] font-mono text-stone-600">
              <span>1개월</span>
              <span>3개월</span>
              <span>6개월</span>
              <span>9개월</span>
              <span>12개월 (완전 소장)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-stone-900/80 p-4 rounded-xl border border-stone-800">
              <div className="text-[11px] text-stone-500">정상 인수 가격</div>
              <div className="text-xl font-bold font-mono text-stone-300">
                {cameraPrice.toLocaleString()} 원
              </div>
            </div>

            <div className="bg-stone-900/80 p-4 rounded-xl border border-amber-900/30">
              <div className="text-[11px] text-amber-400">구독 누적 상환액</div>
              <div className="text-xl font-bold font-mono text-amber-400">
                - {accumulatedCredit.toLocaleString()} 원
              </div>
            </div>

            <div className="bg-stone-900/80 p-4 rounded-xl border border-emerald-900/30">
              <div className="text-[11px] text-emerald-400">최종 남은 인수 금액</div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {remainingBuyoutPrice.toLocaleString()} 원
              </div>
            </div>
          </div>

          <p className="text-xs text-stone-500 leading-relaxed">
            * DASI 구독자는 필름을 받아 쓰면서도, 그 비용의 상당 부분을 렌탈 중인 카메라의 최종 소장 비용으로 공제받을 수 있습니다.
          </p>
        </div>

        {/* Subscribe CTA */}
        <div className="text-center pt-4">
          {isSubscribed ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-sm font-semibold">
              <Check className="w-5 h-5" />
              <span>DASI 필름 패스포트 멤버십이 활성화되었습니다. 첫 번째 필름이 곧 발송됩니다!</span>
            </div>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={isSubscribing}
              className="py-4 px-10 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 shadow-xl shadow-amber-950/40 transition-all flex items-center justify-center gap-2 mx-auto active:scale-[0.98]"
            >
              {isSubscribing ? (
                <div className="w-5 h-5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Film className="w-4 h-4" />
                  <span>
                    {selectedPlan === 'classic' ? '월 19,900원' : '월 34,900원'}으로 패스포트 시작하기
                  </span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
