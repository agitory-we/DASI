'use client';

import React from 'react';
import Link from 'next/link';
import {
  Film,
  Sparkles,
  CheckCircle2,
  Calendar,
  Truck,
  TrendingDown,
  QrCode,
  ChevronRight,
  ShieldCheck,
  Camera
} from 'lucide-react';

export const PassportSubscriptionCard: React.FC = () => {
  const isSubscribed = true;
  const currentPlan = 'master'; // 'master' | 'classic'
  const subscribedMonths = 4;
  const cameraValuation = 450000; // Nikon FM2
  const monthlySavings = currentPlan === 'master' ? 40000 : 20000;
  const totalAccumulatedSavings = subscribedMonths * monthlySavings;
  const remainingBuyout = Math.max(0, cameraValuation - totalAccumulatedSavings);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-vintage-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-700 font-bold mb-1">
            <Film className="w-3.5 h-3.5 text-amber-600" />
            <span>ANNUAL MEMBERSHIP & EQUITY</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-vintage-900">
            필름 패스포트 구독 & 렌탈 소장 상환액
          </h2>
          <p className="text-xs text-vintage-600 mt-0.5">
            매월 계절 맞춤 롤 배송 현황과 누적된 Rent-to-Own 인수 상환액을 확인합니다.
          </p>
        </div>

        <Link
          href="/passport"
          className="px-4 py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs shrink-0 transition-colors"
        >
          <span>패스포트 스탬프 북 보기</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Subscription Card */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-[#faf6ed] border border-amber-900/20 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-amber-500 text-stone-950 font-mono font-bold text-xs">
              {currentPlan === 'master' ? '마스터 패스 (Master) 구독 중' : '클래식 패스 (Classic) 구독 중'}
            </span>
            <span className="text-xs font-mono text-amber-900 font-bold">
              구독 {subscribedMonths}개월 차
            </span>
          </div>

          <div>
            <div className="text-xs text-stone-600">이번 달(10월) 큐레이션 필름</div>
            <h3 className="font-serif text-xl font-bold text-stone-950 mt-0.5">
              Kodak Portra 400 + Ilford HP5 Plus (2롤)
            </h3>
            <div className="text-xs text-amber-800 mt-1 flex items-center gap-1 font-mono">
              <Truck className="w-3.5 h-3.5" />
              <span>배송 상태: 오늘 자택 문 앞 배송 완료 (우체국택배 7491-0021)</span>
            </div>
          </div>

          <div className="p-4 bg-white/80 rounded-2xl border border-stone-300 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-900 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-terracotta" />
                <span>충무로 16-bit TIFF 무압축 스캔 바우처</span>
              </span>
              <span className="font-mono text-amber-700 font-bold">2매 보유 중</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-tight">
              충무로 및 을지로 DASI 제휴 현상소에 방문하여 이 모바일 화면을 보여주시면 즉시 무료 스캔이 적용됩니다.
            </p>
          </div>
        </div>

        {/* Right: Rent-to-Own Buyout Equity Card */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-vintage-200/90 shadow-2xs space-y-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-700 font-bold">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              <span>RENT-TO-OWN ACQUIRE SIMULATOR</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-vintage-900">
              구독 누적으로 차감된 카메라 소장 인수금
            </h3>
            <p className="text-xs text-vintage-600 leading-relaxed">
              구독을 유지할수록 매월 {monthlySavings.toLocaleString()}원씩 대여 중인 카메라(Nikon FM2)의 인수 잔존가액이 0원에 수렴합니다.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 p-3 bg-vintage-50 rounded-2xl border border-vintage-200 text-center">
            <div>
              <div className="text-[10px] text-vintage-500">기기 정상가</div>
              <div className="font-mono font-bold text-xs text-vintage-700 mt-0.5">
                {cameraValuation.toLocaleString()}원
              </div>
            </div>
            <div>
              <div className="text-[10px] text-amber-700 font-semibold">구독 누적 차감액</div>
              <div className="font-mono font-bold text-xs text-amber-700 mt-0.5">
                - {totalAccumulatedSavings.toLocaleString()}원
              </div>
            </div>
            <div>
              <div className="text-[10px] text-emerald-700 font-semibold">현재 최종 인수금</div>
              <div className="font-mono font-bold text-sm text-emerald-700 mt-0.5">
                {remainingBuyout.toLocaleString()}원
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="w-full bg-vintage-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all"
                style={{ width: `${Math.round((totalAccumulatedSavings / cameraValuation) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-vintage-500 mt-1">
              <span>누적 상환 달성률 {Math.round((totalAccumulatedSavings / cameraValuation) * 100)}%</span>
              <span>12개월 유지 시 0원 완전 소장</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
