'use client';

import React, { useState } from 'react';
import { mockMasters } from '@/data/mockData';
import { RepairMaster, UserCoupon } from '@/types';
import { useDasi } from '@/context/DasiContext';
import {
  Wrench,
  ShieldCheck,
  Ticket,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
  X,
  Phone,
  AlertCircle,
  HelpCircle,
  QrCode,
  Truck,
  Check
} from 'lucide-react';
import { playShutterSound } from '@/utils/shutterAudio';

export default function ClinicPage() {
  const { coupons, useCoupon, submitRepairEstimate } = useDasi();
  const [selectedMaster, setSelectedMaster] = useState<RepairMaster | null>(null);
  const [isEstimateModalOpen, setIsEstimateModalOpen] = useState<boolean>(false);
  const [activeCoupon, setActiveCoupon] = useState<UserCoupon | null>(null);
  const [estimateSubmitted, setEstimateSubmitted] = useState<boolean>(false);
  const [cameraModelInput, setCameraModelInput] = useState<string>('Nikon FM2');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['셔터가 안 눌리거나 멈춤', '차광 스펀지(빛샘 현상)']);
  const [detailsInput, setDetailsInput] = useState<string>('셔터막 끈적임 및 1/1000초 셔터 랙 증상 수리 및 전체 오버홀 희망합니다.');

  const handleToggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleUseCoupon = (couponId: string) => {
    playShutterSound('slr');
    useCoupon(couponId);
    setActiveCoupon(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Top Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold">
          <Wrench className="w-3.5 h-3.5" />
          <span>닥터 DASI · 장인 클리닉 &amp; 제휴 케어</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-vintage-900">
          대한민국 40년 명장 수리실 &amp; 웰컴 쿠폰북
        </h1>
        <p className="text-xs sm:text-sm text-vintage-600 max-w-3xl leading-relaxed">
          어디서 고쳐야 할지 몰라 장롱 속에 방치했던 아날로그 카메라를 다시 깨워보세요.
          증상 사진만으로 예상 수리비를 무료로 진단받고, 제휴 현상소 1롤 무료 스캔 쿠폰을 바로 사용할 수 있습니다.
        </p>
      </div>

      {/* 1. COUPON POCKET (내 웰컴 혜택 지갑) */}
      <div className="rounded-3xl bg-white border border-vintage-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-vintage-100 pb-4">
          <div className="flex items-center gap-2.5">
            <Ticket className="w-5 h-5 text-terracotta" />
            <h2 className="font-serif text-xl font-bold text-vintage-900">
              DASI 웰컴 케어 쿠폰 지갑
            </h2>
          </div>
          <span className="text-xs text-vintage-500 font-medium">
            사용 가능 쿠폰: <strong className="text-terracotta">{coupons.filter((c) => !c.isUsed).length}</strong>장
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                coupon.isUsed
                  ? 'bg-vintage-100/50 border-vintage-200 opacity-60'
                  : 'bg-vintage-50 border-terracotta/30 hover:border-terracotta shadow-2xs'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-terracotta/10 text-terracotta">
                    {coupon.category === 'lab' ? '현상소' : coupon.category === 'repair' ? '수리점' : '필름'}
                  </span>
                  <span className="text-[10px] text-vintage-500">{coupon.validUntil}</span>
                </div>
                <h3 className="font-bold text-sm text-vintage-900 leading-snug">
                  {coupon.title}
                </h3>
                <div className="text-base font-serif font-bold text-terracotta">
                  {coupon.discountText}
                </div>
                <div className="text-[11px] text-vintage-500">
                  발행처: {coupon.issuerName}
                </div>
              </div>

              <div className="pt-4 border-t border-vintage-200/60 mt-3">
                {coupon.isUsed ? (
                  <span className="text-xs text-vintage-400 font-medium block text-center">
                    사용 완료된 쿠폰입니다
                  </span>
                ) : (
                  <button
                    onClick={() => setActiveCoupon(coupon)}
                    className="w-full py-2 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-semibold transition-colors"
                  >
                    매장에서 사용하기 (바코드)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. REPAIR MASTERS SHOWCASE */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="text-terracotta text-xs font-bold uppercase tracking-wider">
              DASI Verified Master
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-vintage-900">
              을지로·충무로 40년 공식 수리 명장
            </h2>
          </div>
          <button
            onClick={() => {
              setIsEstimateModalOpen(true);
              setEstimateSubmitted(false);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-terracotta text-white text-xs sm:text-sm font-bold hover:bg-terracotta-light transition-colors shadow-xs shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>온라인 수리 간편 견적 신청</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {mockMasters.map((master) => (
            <div
              key={master.id}
              className="rounded-3xl bg-white border border-vintage-200 overflow-hidden shadow-xs p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-start gap-4">
                <img
                  src={master.profileImage}
                  alt={master.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-vintage-200 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-xl font-bold text-vintage-900">
                      {master.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                      경력 {master.experienceYears}년
                    </span>
                  </div>
                  <div className="text-xs text-vintage-500 font-medium">{master.shopName} · {master.location}</div>
                  <p className="text-xs text-vintage-700 italic pt-1">
                    &ldquo;{master.quote}&rdquo;
                  </p>
                </div>
              </div>

              {/* Specialty */}
              <div className="p-3 rounded-xl bg-vintage-50 border border-vintage-100 text-xs text-vintage-800">
                <strong>전문 분야:</strong> {master.specialty}
              </div>

              {/* Standard Price List */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-vintage-900">대표 정비 항목 및 표준 공임표</div>
                <div className="divide-y divide-vintage-100 border border-vintage-100 rounded-xl overflow-hidden text-xs">
                  {master.availableServices.map((service, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white flex items-center justify-between hover:bg-vintage-50 transition-colors"
                    >
                      <div>
                        <div className="font-medium text-vintage-900">{service.name}</div>
                        <div className="text-[10px] text-vintage-400">예상 소요: {service.duration}</div>
                      </div>
                      <div className="font-bold text-terracotta text-right">
                        {service.estimatedCost}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedMaster(master);
                    setIsEstimateModalOpen(true);
                    setEstimateSubmitted(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-semibold transition-colors"
                >
                  {master.name} 명장에게 견적 문의하기
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ESTIMATE MODAL */}
      {isEstimateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-vintage-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-vintage-100">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-terracotta" />
                <h3 className="font-serif text-lg font-bold text-vintage-900">
                  온라인 간편 수리 견적 신청
                </h3>
              </div>
              <button
                onClick={() => setIsEstimateModalOpen(false)}
                className="p-1.5 text-vintage-400 hover:text-vintage-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {estimateSubmitted ? (
              <div className="text-center py-6 space-y-5 animate-fade-in">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <Check className="w-7 h-7" />
                </div>
                
                <div className="space-y-1">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    장인 1:1 수리 진단 접수 완료
                  </span>
                  <h4 className="font-serif text-2xl font-bold text-vintage-900">
                    견적 요청 접수 완료
                  </h4>
                  <p className="text-xs text-vintage-600 leading-relaxed max-w-sm mx-auto">
                    <strong>{selectedMaster ? `${selectedMaster.name} 명장님` : '충무로·을지로 명장 협회'}</strong>께 증상 데이터가 전달되었습니다.<br />
                    당일 내 예상 견적 및 정비 일정이 알림톡으로 전송됩니다.
                  </p>
                </div>

                {/* Repair Voucher Card */}
                <div className="p-5 rounded-3xl bg-vintage-50 border border-vintage-200 text-left max-w-sm mx-auto space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-vintage-200/60 pb-2.5">
                    <span className="text-xs font-bold text-vintage-900 flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-terracotta" />
                      닥터 DASI 사전 진단 접수증
                    </span>
                    <span className="text-[10px] font-mono text-terracotta bg-terracotta/10 px-2 py-0.5 rounded-full font-bold">
                      EST-{Math.floor(100000 + Math.random() * 900000)}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-vintage-700">
                    <div className="flex justify-between">
                      <span className="text-vintage-500">담당 명장</span>
                      <span className="font-bold text-vintage-900">
                        {selectedMaster ? `${selectedMaster.name} (${selectedMaster.shopName})` : '장인 협회 최적 공방 매칭'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-vintage-500">진단 방식</span>
                      <span className="font-semibold text-emerald-800">무료 온라인 사전 견적</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-vintage-500">안심 수거</span>
                      <span className="text-[11px] font-bold text-terracotta flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        <span>우체국 안심 픽업 박스 지원</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-900">
                    🔒 <strong>DASI 무상 재수리 보증:</strong> 공식 명장 수리실에서 정비된 기기는 6개월간 동일 증상 발생 시 100% 무상 재정비가 보증됩니다.
                  </div>
                </div>

                <button
                  onClick={() => setIsEstimateModalOpen(false)}
                  className="px-8 py-3 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  확인 및 닫기
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-vintage-800">카메라 모델명</label>
                  <input
                    type="text"
                    value={cameraModelInput}
                    onChange={(e) => setCameraModelInput(e.target.value)}
                    placeholder="예: Nikon FM2, Canon AE-1, Olympus Mju-II 등"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-vintage-300 focus:outline-none focus:border-terracotta text-vintage-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-vintage-800">고장 증상 선택</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      '셔터가 안 눌리거나 멈춤',
                      '렌즈에 곰팡이/먼지',
                      '노출계 배터리 누액/미작동',
                      '필름 레버가 헛돔',
                      '차광 스펀지(빛샘 현상)',
                      '단순 종합 점검 (오버홀)',
                    ].map((symptom) => (
                      <label
                        key={symptom}
                        onClick={() => handleToggleSymptom(symptom)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-[11px] transition-colors ${
                          selectedSymptoms.includes(symptom)
                            ? 'bg-vintage-100 border-terracotta text-vintage-900 font-semibold'
                            : 'border-vintage-200 hover:bg-vintage-50 text-vintage-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSymptoms.includes(symptom)}
                          readOnly
                          className="text-terracotta rounded"
                        />
                        <span>{symptom}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-vintage-800">세부 증상 설명 (선택)</label>
                  <textarea
                    rows={2}
                    value={detailsInput}
                    onChange={(e) => setDetailsInput(e.target.value)}
                    placeholder="언제부터 고장이 났는지, 셔터 소리가 어떻게 나는지 적어주시면 정확한 견적에 도움이 됩니다."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-vintage-300 focus:outline-none focus:border-terracotta resize-none text-vintage-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-vintage-800">연락처 (알림톡 수신용)</label>
                  <input
                    type="tel"
                    defaultValue="010-8291-7721"
                    placeholder="010-0000-0000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-vintage-300 focus:outline-none focus:border-terracotta text-vintage-900"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => setIsEstimateModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-vintage-300 text-vintage-700 font-semibold"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      playShutterSound('slr');
                      submitRepairEstimate({
                        cameraModel: cameraModelInput || 'Nikon FM2',
                        symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : ['전체 종합 점검 (오버홀)'],
                        details: detailsInput || '종합 기능 점검 희망',
                        masterName: selectedMaster ? `${selectedMaster.name} (${selectedMaster.shopName})` : '충무로·을지로 명장 협회 공방',
                      });
                      setEstimateSubmitted(true);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-terracotta text-white font-bold hover:bg-terracotta-light transition-colors shadow-xs"
                  >
                    견적 요청 접수하기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COUPON USE BARCODE MODAL */}
      {activeCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-vintage-200 p-6 space-y-5 text-center">
            <div className="space-y-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-terracotta/10 text-terracotta">
                {activeCoupon.issuerName} 공식 쿠폰
              </span>
              <h3 className="font-serif text-lg font-bold text-vintage-900">
                {activeCoupon.title}
              </h3>
              <div className="text-terracotta font-bold text-sm">
                {activeCoupon.discountText}
              </div>
            </div>

            {/* Simulated Barcode */}
            <div className="p-4 bg-white rounded-xl border-2 border-dashed border-vintage-300 space-y-2">
              <div className="h-16 bg-[repeating-linear-gradient(90deg,#2d241e,#2d241e_3px,transparent_3px,transparent_6px,#2d241e_6px,#2d241e_10px,transparent_10px,transparent_12px)] w-48 mx-auto" />
              <div className="font-mono text-xs text-vintage-600 tracking-widest">
                DASI-2026-9812-7712
              </div>
            </div>

            <p className="text-[11px] text-vintage-500">
              결제 시 매장 사장님께 위 바코드를 보여주세요.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setActiveCoupon(null)}
                className="flex-1 py-2 rounded-xl border border-vintage-300 text-xs font-semibold text-vintage-700 hover:bg-vintage-50"
              >
                닫기
              </button>
              <button
                onClick={() => handleUseCoupon(activeCoupon.id)}
                className="flex-1 py-2 rounded-xl bg-terracotta text-white text-xs font-bold hover:bg-terracotta-light"
              >
                사용 완료 처리
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
