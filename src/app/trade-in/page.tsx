'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Package,
  Wrench,
  Coins,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Camera,
  Truck,
  RotateCcw,
  Check,
  ChevronRight,
  TrendingUp,
  Percent,
  Calculator,
  UserCheck
} from 'lucide-react';
import { playShutterSound } from '@/utils/shutterAudio';
import { useDasi } from '@/context/DasiContext';

interface CameraValuationPreset {
  id: string;
  name: string;
  brand: string;
  marketPrice: number;
  cashRate: number; // 75%
  creditBonusRate: number; // 120%
  monthlyDividendEst: number; // monthly expected dividend
  recommended: boolean;
}

const PRESET_CAMERAS: CameraValuationPreset[] = [
  {
    id: 'nikon-fm2',
    name: 'Nikon FM2 (Silver/Black)',
    brand: 'Nikon',
    marketPrice: 380000,
    cashRate: 0.75,
    creditBonusRate: 1.20,
    monthlyDividendEst: 28000,
    recommended: true
  },
  {
    id: 'canon-ae1',
    name: 'Canon AE-1 Program',
    brand: 'Canon',
    marketPrice: 280000,
    cashRate: 0.75,
    creditBonusRate: 1.20,
    monthlyDividendEst: 21000,
    recommended: false
  },
  {
    id: 'olympus-om1',
    name: 'Olympus OM-1 (MD)',
    brand: 'Olympus',
    marketPrice: 320000,
    cashRate: 0.75,
    creditBonusRate: 1.20,
    monthlyDividendEst: 24000,
    recommended: false
  },
  {
    id: 'minolta-x300',
    name: 'Minolta X-300 / X-700',
    brand: 'Minolta',
    marketPrice: 220000,
    cashRate: 0.75,
    creditBonusRate: 1.20,
    monthlyDividendEst: 16000,
    recommended: false
  },
  {
    id: 'leica-m3',
    name: 'Leica M3 Single Stroke',
    brand: 'Leica',
    marketPrice: 2400000,
    cashRate: 0.80,
    creditBonusRate: 1.25,
    monthlyDividendEst: 180000,
    recommended: false
  },
  {
    id: 'pentax-mx',
    name: 'Pentax MX / ME Super',
    brand: 'Pentax',
    marketPrice: 200000,
    cashRate: 0.75,
    creditBonusRate: 1.20,
    monthlyDividendEst: 15000,
    recommended: false
  }
];

export default function TradeInPage() {
  const { showToast } = useDasi();

  const [selectedCameraId, setSelectedCameraId] = useState<string>('nikon-fm2');
  const [conditionGrade, setConditionGrade] = useState<'A' | 'B' | 'C'>('A');
  const [selectedReward, setSelectedReward] = useState<'credit' | 'cash' | 'dividend'>('credit');

  // Form State
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [tradeInId, setTradeInId] = useState('');

  const currentCamera = PRESET_CAMERAS.find((c) => c.id === selectedCameraId) || PRESET_CAMERAS[0];

  const gradeMultiplier = conditionGrade === 'A' ? 1.0 : conditionGrade === 'B' ? 0.85 : 0.70;
  const adjustedMarketPrice = Math.round(currentCamera.marketPrice * gradeMultiplier);

  const cashValue = Math.round(adjustedMarketPrice * currentCamera.cashRate);
  const creditValue = Math.round(adjustedMarketPrice * currentCamera.creditBonusRate);
  const estimatedDividend = Math.round(currentCamera.monthlyDividendEst * gradeMultiplier);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userPhone || !userAddress) {
      showToast('성함, 연락처, 주소를 모두 입력해주세요.', 'warning');
      return;
    }

    setIsSubmitting(true);
    playShutterSound('slr');

    setTimeout(() => {
      const generatedId = `TRD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      setTradeInId(generatedId);
      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast('📦 안심 택배 키트 신청이 정상 접수되었습니다!', 'success');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-amber-500 selection:text-stone-950">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
          <Link href="/" className="hover:text-amber-400 transition-colors">DASI</Link>
          <ChevronRight className="w-3 h-3 text-stone-600" />
          <span className="text-amber-500 font-semibold">FINANCE & ASSET</span>
          <ChevronRight className="w-3 h-3 text-stone-600" />
          <span>장롱 카메라 안심 감정 & 트레이드인</span>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-600/30 text-emerald-400 text-xs font-mono">
            <Coins className="w-3.5 h-3.5" />
            <span>CFO & 명장 파트너십 · 장롱 유휴 자산 유동화</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-stone-50">
            잠자는 장롱 카메라의 새로운 가치
          </h1>
          <p className="text-sm sm:text-base text-stone-400 max-w-2xl mx-auto leading-relaxed">
            집에서 방치되던 부모님의 필름 카메라를 40년 을지로 명장이 무상 오버홀하고,
            <br className="hidden sm:inline" />
            현금 매입부터 DASI 120% 포인트, 월 배당 위탁 렌탈까지 최적의 보상을 약속합니다.
          </p>
        </div>

        {/* 4-Step Process Visualizer */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            {
              step: '01',
              title: '무료 안심 키트 신청',
              desc: '자택으로 완충 안심 박스를 무상 배송해 드립니다.',
              icon: Package
            },
            {
              step: '02',
              title: '을지로 명장 입고',
              desc: '40년 경력의 명장실에서 정밀 분해 검진을 진행합니다.',
              icon: Wrench
            },
            {
              step: '03',
              title: '무상 클리닝 & 오버홀',
              desc: '셔터막, 차광 스폰지(모ルト), 렌즈 곰팡이를 케어합니다.',
              icon: ShieldCheck
            },
            {
              step: '04',
              title: '3대 보상 즉시 수령',
              desc: '현금 입금, 120% 렌탈 포인트, 또는 매월 렌탈 배당을 선택합니다.',
              icon: Coins
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-stone-950/60 border border-stone-800 rounded-xl p-5 space-y-3 relative overflow-hidden"
            >
              <div className="text-xs font-mono font-bold text-amber-500">{item.step}</div>
              <div className="w-10 h-10 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-amber-400">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-200 text-sm">{item.title}</h3>
              <p className="text-xs text-stone-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Interactive Calculator Section */}
        <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 mb-1">
                <Calculator className="w-3.5 h-3.5" />
                <span>REAL-TIME VALUATION CALCULATOR</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-100 font-serif">
                내 카메라 예상 보상액 계산기
              </h2>
            </div>
            <div className="text-xs text-stone-500 font-mono">
              * 을지로/충무로 최근 3개월 실거래 데이터 기준
            </div>
          </div>

          {/* Model Selector & Condition Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left: Camera Model & Condition */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-mono text-stone-400">보유 기종 선택</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESET_CAMERAS.map((cam) => (
                    <button
                      key={cam.id}
                      onClick={() => {
                        setSelectedCameraId(cam.id);
                        playShutterSound('compact');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedCameraId === cam.id
                          ? 'border-amber-500 bg-amber-950/20 text-stone-100'
                          : 'border-stone-800 bg-stone-900/60 hover:bg-stone-800 text-stone-400'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{cam.name}</div>
                      <div className="text-[11px] text-stone-500 font-mono">
                        기준 시세 약 {cam.marketPrice.toLocaleString()}원
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition Grade */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-stone-400">외관 및 작동 상태</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { grade: 'A' as const, label: 'A급 (정상 작동)', sub: '외관 깨끗, 셔터/노출계 양호' },
                    { grade: 'B' as const, label: 'B급 (사용감 있음)', sub: '생활 기스, 점검 요망' },
                    { grade: 'C' as const, label: 'C급 (고장/방치)', sub: '셔터 걸림, 부품용' }
                  ].map((g) => (
                    <button
                      key={g.grade}
                      onClick={() => {
                        setConditionGrade(g.grade);
                        playShutterSound('compact');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        conditionGrade === g.grade
                          ? 'border-amber-500 bg-amber-950/20 text-stone-100'
                          : 'border-stone-800 bg-stone-900/60 hover:bg-stone-800 text-stone-400'
                      }`}
                    >
                      <div className="text-xs font-bold">{g.label}</div>
                      <div className="text-[10px] text-stone-500 mt-0.5 leading-tight">{g.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: 3 Reward Options Breakdown */}
            <div className="space-y-3">
              <label className="text-xs font-mono text-stone-400">3대 보상 방식 비교</label>
              
              {/* Option B: DASI Credit 120% */}
              <div
                onClick={() => setSelectedReward('credit')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative ${
                  selectedReward === 'credit'
                    ? 'border-amber-500 bg-amber-950/20 shadow-lg shadow-amber-950/40'
                    : 'border-stone-800 bg-stone-900/40 hover:border-stone-700'
                }`}
              >
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold">
                  인기 1위 (+20% 혜택)
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-sm text-stone-200">DASI 렌탈 & 필름 크레딧</span>
                </div>
                <div className="text-2xl font-black font-mono text-amber-400">
                  {creditValue.toLocaleString()} P
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  시세의 120% 보너스 지급 · 전 기종 대여 및 필름 구매 시 현금과 동일하게 사용 가능
                </p>
              </div>

              {/* Option A: Cash */}
              <div
                onClick={() => setSelectedReward('cash')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedReward === 'cash'
                    ? 'border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-950/40'
                    : 'border-stone-800 bg-stone-900/40 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-sm text-stone-200">즉시 현금 매입</span>
                </div>
                <div className="text-2xl font-black font-mono text-emerald-400">
                  {cashValue.toLocaleString()} 원
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  명장 검수 완료 즉시 고객 지정 계좌로 당일 입금 처리
                </p>
              </div>

              {/* Option C: Rent-to-Own Consignment Dividend */}
              <div
                onClick={() => setSelectedReward('dividend')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedReward === 'dividend'
                    ? 'border-indigo-500 bg-indigo-950/20 shadow-lg shadow-indigo-950/40'
                    : 'border-stone-800 bg-stone-900/40 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-sm text-stone-200">위탁 렌탈 지분 투자 (월 배당)</span>
                </div>
                <div className="text-2xl font-black font-mono text-indigo-400">
                  월 예상 약 {estimatedDividend.toLocaleString()} 원
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  DASI 렌탈 풀에 등록되어 대여 발생 시마다 수익의 50%를 매달 정기 배당금으로 지급
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 sm:p-10 shadow-2xl">
          <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-950/50 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-serif text-stone-100">
                무료 안심 택배 키트 신청
              </h3>
              <p className="text-xs text-stone-400">
                신청하시면 충격 방지 에어캡과 왕복 무료 택배 송장이 동봉된 DASI 전용 키트를 보내드립니다.
              </p>
            </div>

            {isSubmitted ? (
              <div className="bg-stone-900 border border-emerald-500/40 rounded-xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-500">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-stone-100">안심 택배 키트 신청 완료!</h4>
                  <div className="text-xs font-mono text-amber-400 mt-1">접수번호: {tradeInId}</div>
                  <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                    <strong>{userName}</strong> 님, 1~2영업일 내로 <strong>{userAddress}</strong>(으)로 안심 박스가 발송됩니다.
                    <br />카메라를 담아 문 앞에 두시면 택배 기사님이 무상 수거합니다.
                  </p>
                </div>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-mono text-stone-300"
                >
                  새로운 기종 추가 신청하기
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-stone-400 mb-1">신청자 성함</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 focus:border-amber-500 focus:outline-none text-sm text-stone-100 placeholder-stone-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-stone-400 mb-1">연락처</label>
                  <input
                    type="tel"
                    required
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="010-1234-5678"
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 focus:border-amber-500 focus:outline-none text-sm text-stone-100 placeholder-stone-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-stone-400 mb-1">안심 키트 수령 주소</label>
                  <input
                    type="text"
                    required
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                    placeholder="서울특별시 중구 을지로 123, 401호"
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 focus:border-amber-500 focus:outline-none text-sm text-stone-100 placeholder-stone-600"
                  />
                </div>

                <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800 text-[11px] text-stone-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-stone-300 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>DASI 100% 무상 반송 안심 보증</span>
                  </div>
                  <div>
                    을지로 명장 감정 후 제시된 최종 보상 금액이 마음에 들지 않으실 경우, 아무런 비용 없이 안전하게 고객님 댁으로 무료 반송해 드립니다.
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-lg shadow-amber-950/40 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Package className="w-4 h-4" />
                      <span>무료 안심 택배 키트 신청하기</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
