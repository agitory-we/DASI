'use client';

import React from 'react';
import Link from 'next/link';
import {
  Coins,
  Package,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Check,
  Plus
} from 'lucide-react';

export interface TradeInCase {
  id: string;
  cameraName: string;
  brand: string;
  appliedDate: string;
  currentStep: 1 | 2 | 3 | 4;
  conditionGrade: 'A' | 'B' | 'C';
  rewardType: 'credit' | 'cash' | 'dividend';
  rewardAmount: number;
  trackingNumber: string;
  masterNotes: string;
}

const DEFAULT_TRADE_IN_CASES: TradeInCase[] = [
  {
    id: 'TRD-2026-92810',
    cameraName: 'Nikon FM2 (Silver Body)',
    brand: 'Nikon',
    appliedDate: '2026.10.01',
    currentStep: 3,
    conditionGrade: 'A',
    rewardType: 'credit',
    rewardAmount: 456000,
    trackingNumber: 'CJ대한통운 6891-2304-9912',
    masterNotes: '강태훈 명장 소견: 1/4000초 셔터막 텐션 완벽 복원, 뷰파인더 펜타프리즘 클리닝 완료, 차광 스폰지(모ルト) 전면 신품 교체.'
  }
];

export const TradeInTracker: React.FC = () => {
  const cases = DEFAULT_TRADE_IN_CASES;

  const steps = [
    { num: 1, label: '안심 키트 발송', icon: Package },
    { num: 2, label: '을지로 명장실 입고', icon: Wrench },
    { num: 3, label: '오버홀 & 등급 판정', icon: ShieldCheck },
    { num: 4, label: '3대 보상 지급 완료', icon: Coins }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-vintage-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-700 font-bold mb-1">
            <Coins className="w-3.5 h-3.5 text-emerald-600" />
            <span>TRADE-IN ASSET TRACKER</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-vintage-900">
            장롱 카메라 트레이드인 진행 현황
          </h2>
          <p className="text-xs text-vintage-600 mt-0.5">
            40년 을지로 명장실의 정밀 입고, 무상 오버홀, 보상금 정산 단계를 실시간 추적합니다.
          </p>
        </div>

        <Link
          href="/trade-in"
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs shrink-0 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>추가 기종 감정 신청</span>
        </Link>
      </div>

      <div className="space-y-6">
        {cases.map((c) => (
          <div
            key={c.id}
            className="p-6 rounded-3xl bg-white border border-vintage-200/90 shadow-2xs space-y-6"
          >
            {/* Case Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-vintage-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    접수번호: {c.id}
                  </span>
                  <span className="text-xs text-vintage-500 font-mono">신청일: {c.appliedDate}</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-vintage-900 mt-1">
                  {c.cameraName}
                </h3>
              </div>

              <div className="text-right">
                <div className="text-xs text-vintage-500">예정 보상 혜택</div>
                <div className="font-mono text-xl font-black text-emerald-700">
                  {c.rewardType === 'credit'
                    ? `${c.rewardAmount.toLocaleString()} P (120% 적립)`
                    : `${c.rewardAmount.toLocaleString()} 원`}
                </div>
              </div>
            </div>

            {/* 4-Step Progress Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
              {steps.map((s) => {
                const isPassed = c.currentStep >= s.num;
                const isCurrent = c.currentStep === s.num;
                const Icon = s.icon;
                return (
                  <div
                    key={s.num}
                    className={`p-3.5 rounded-2xl border transition-all text-center space-y-2 relative ${
                      isCurrent
                        ? 'border-emerald-500 bg-emerald-50/70 shadow-2xs'
                        : isPassed
                        ? 'border-vintage-200 bg-vintage-50 text-vintage-800'
                        : 'border-vintage-100 bg-white text-vintage-400 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                        isCurrent
                          ? 'bg-emerald-600 text-white animate-pulse'
                          : isPassed
                          ? 'bg-emerald-200 text-emerald-800'
                          : 'bg-vintage-100 text-vintage-400'
                      }`}
                    >
                      {isPassed && !isCurrent ? <Check className="w-4 h-4" /> : s.num}
                    </div>
                    <div className="text-xs font-bold leading-tight">{s.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Master Overhaul Diagnosis Report */}
            <div className="bg-vintage-50 rounded-2xl p-4 border border-vintage-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-vintage-900 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>을지로 40년 명장 감정 및 무상 오버홀 리포트</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                  판정 등급: {c.conditionGrade}급 (정상 작동)
                </span>
              </div>
              <p className="text-xs text-vintage-700 leading-relaxed font-sans">
                {c.masterNotes}
              </p>
              <div className="text-[11px] font-mono text-vintage-500 pt-1">
                왕복 안심 배송 운송장: {c.trackingNumber}
              </div>
            </div>

            {/* Fast Credit Redemption Action */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-vintage-800 font-medium">
                  지급 예정 크레딧 <strong>{c.rewardAmount.toLocaleString()} P</strong>는 렌탈 및 정기구독 시 100% 현금처럼 자동 적용됩니다.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/rent"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-colors shadow-2xs"
                >
                  카메라 렌탈하기 &gt;
                </Link>
                <Link
                  href="/passport"
                  className="px-3.5 py-1.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white font-bold text-xs transition-colors shadow-2xs"
                >
                  필름 구독 전환 &gt;
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
