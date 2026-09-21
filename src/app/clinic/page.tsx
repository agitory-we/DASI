'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  Check,
  ChevronRight
} from 'lucide-react';
import { playShutterSound } from '@/utils/shutterAudio';

export default function ClinicPage() {
  const { repairMasters, isLoadingData, coupons, useCoupon, submitRepairEstimate, showToast } = useDasi();
  const [selectedMaster, setSelectedMaster] = useState<RepairMaster | null>(null);
  const [isEstimateModalOpen, setIsEstimateModalOpen] = useState<boolean>(false);
  const [activeCoupon, setActiveCoupon] = useState<UserCoupon | null>(null);
  const [estimateSubmitted, setEstimateSubmitted] = useState<boolean>(false);
  const [submittedEstimateCode, setSubmittedEstimateCode] = useState<string>('');
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
    showToast('쿠폰이 성공적으로 사용되었습니다. 혜택이 즉시 적용됩니다.', 'success');
    setActiveCoupon(null);
  };

  const handleOpenEstimate = (master: RepairMaster) => {
    setSelectedMaster(master);
    setEstimateSubmitted(false);
    setSubmittedEstimateCode('');
    setIsEstimateModalOpen(true);
  };

  const handleSubmitEstimateForm = () => {
    playShutterSound('slr');
    const code = submitRepairEstimate({
      cameraModel: cameraModelInput,
      symptoms: selectedSymptoms,
      details: detailsInput,
      masterName: selectedMaster?.name || '명장 종합 진단팀',
    });
    setSubmittedEstimateCode(code);
    setEstimateSubmitted(true);
    showToast('수리 견적 접수가 완료되었습니다. 마이 캐비닛에서 확인하실 수 있습니다.', 'success');
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

      {/* 2. REPAIR MASTERS DIRECTORY */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-serif text-2xl font-bold text-vintage-900">
              DASI 인증 수리 명장 네트워크
            </h2>
            <p className="text-xs text-vintage-600 mt-0.5">
              35년 이상 외길을 걸어온 장인들이 직접 분해소제(오버홀) 및 광학 렌즈를 복원합니다.
            </p>
          </div>
          <span className="text-xs font-semibold text-vintage-500">
            총 {repairMasters.length}명의 공식 인증 명장 활동 중
          </span>
        </div>

        {isLoadingData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-white border border-vintage-200 animate-pulse space-y-4">
                <div className="h-6 bg-vintage-200 rounded w-1/3" />
                <div className="h-4 bg-vintage-100 rounded w-2/3" />
                <div className="h-24 bg-vintage-100 rounded-2xl w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {repairMasters.map((master) => (
              <div
                key={master.id}
                className="rounded-3xl bg-white border border-vintage-200 p-6 sm:p-8 shadow-xs space-y-6 flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div className="space-y-4">
                  {/* Profile Header */}
                  <div className="flex items-start gap-4">
                    <img
                      src={master.profileImage}
                      alt={master.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-vintage-200 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-xl font-bold text-vintage-900">
                          {master.name}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                          경력 {master.experienceYears}년
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-terracotta">
                        {master.shopName}
                      </div>
                      <div className="text-xs text-vintage-600 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-vintage-400 shrink-0" />
                        <span>{master.location} ({master.address})</span>
                      </div>
                    </div>
                  </div>

                  {/* Master Quote */}
                  <div className="p-3.5 rounded-2xl bg-vintage-50 border border-vintage-100 text-xs text-vintage-700 italic leading-relaxed">
                    "{master.quote}"
                  </div>

                  {/* Specialty Tag */}
                  <div className="text-xs">
                    <span className="text-vintage-500 font-medium">주력 전문 분야: </span>
                    <span className="font-semibold text-vintage-900">{master.specialty}</span>
                  </div>

                  {/* Available Services Table */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-vintage-800 block">
                      표준 정찰제 수리/클리닝 항목
                    </span>
                    <div className="rounded-2xl border border-vintage-200 overflow-hidden divide-y divide-vintage-100 text-xs">
                      {master.availableServices.map((srv, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between bg-white hover:bg-vintage-50/50">
                          <span className="font-medium text-vintage-900">{srv.name}</span>
                          <div className="text-right">
                            <span className="font-bold text-terracotta">{srv.estimatedCost}</span>
                            <span className="text-[10px] text-vintage-400 block">{srv.duration}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <button
                  onClick={() => handleOpenEstimate(master)}
                  className="w-full py-3 rounded-2xl bg-vintage-900 hover:bg-terracotta text-white text-xs sm:text-sm font-bold transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <Wrench className="w-4 h-4" />
                  <span>{master.name}에게 비대면 무료 견적 문의하기</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ESTIMATE MODAL */}
      {isEstimateModalOpen && selectedMaster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-vintage-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-vintage-100 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-terracotta" />
                <h3 className="font-serif text-xl font-bold text-vintage-900">
                  {selectedMaster.name} 비대면 견적 접수
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
              <div className="text-center py-6 space-y-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-xl font-bold text-vintage-900">
                  수리 견적이 정상 접수되었습니다!
                </h4>
                <p className="text-xs text-vintage-600 max-w-sm mx-auto leading-relaxed">
                  <strong>{selectedMaster.shopName}</strong> {selectedMaster.name}님에게 진단 의뢰서가 전달되었습니다. 24시간 내 예상 수리비와 입고 안내가 카카오톡/문자로 발송됩니다.
                </p>

                <div className="p-4 rounded-2xl bg-vintage-50 border border-vintage-200 text-left text-xs space-y-2">
                  <div className="flex justify-between py-1 border-b border-vintage-200">
                    <span className="text-vintage-500">접수 코드</span>
                    <span className="font-mono font-bold text-vintage-900">{submittedEstimateCode}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-vintage-200">
                    <span className="text-vintage-500">기종명</span>
                    <span className="font-bold text-vintage-900">{cameraModelInput}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-vintage-500">담당 명장</span>
                    <span className="font-bold text-terracotta">{selectedMaster.name} ({selectedMaster.shopName})</span>
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <Link
                    href="/cabinet"
                    className="px-5 py-2.5 rounded-xl bg-terracotta text-white text-xs font-bold hover:bg-terracotta-light transition-colors shadow-xs"
                  >
                    마이 캐비닛에서 확인하기 →
                  </Link>
                  <button
                    onClick={() => setIsEstimateModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-vintage-300 text-xs font-semibold text-vintage-700 hover:bg-vintage-100"
                  >
                    닫기
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-vintage-800 block mb-1">카메라 기종명</label>
                  <input
                    type="text"
                    value={cameraModelInput}
                    onChange={(e) => setCameraModelInput(e.target.value)}
                    placeholder="예: Nikon FM2, Olympus OM-1, Rollei 35"
                    className="w-full bg-vintage-50 border border-vintage-200 rounded-xl px-3 py-2 text-xs text-vintage-900 focus:outline-hidden focus:border-terracotta font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-vintage-800 block mb-1.5">발생 중인 증상 (복수 선택 가능)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      '셔터가 안 눌리거나 멈춤',
                      '차광 스펀지(빛샘 현상)',
                      '렌즈 내부 곰팡이/먼지',
                      '노출계 배터리실 부식',
                      '뷰파인더 이중상 핀 어긋남',
                      '필름 와인딩 레버 헛돔'
                    ].map((symptom) => (
                      <button
                        key={symptom}
                        type="button"
                        onClick={() => handleToggleSymptom(symptom)}
                        className={`p-2.5 rounded-xl border text-left text-[11px] transition-all flex items-center justify-between ${
                          selectedSymptoms.includes(symptom)
                            ? 'border-terracotta bg-terracotta/5 font-semibold text-vintage-900'
                            : 'border-vintage-200 bg-white text-vintage-600 hover:bg-vintage-50'
                        }`}
                      >
                        <span>{symptom}</span>
                        {selectedSymptoms.includes(symptom) && <Check className="w-3.5 h-3.5 text-terracotta shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-vintage-800 block mb-1">상세 증상 설명</label>
                  <textarea
                    rows={3}
                    value={detailsInput}
                    onChange={(e) => setDetailsInput(e.target.value)}
                    className="w-full bg-vintage-50 border border-vintage-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-terracotta"
                  />
                </div>

                <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-[11px] leading-relaxed">
                  ✓ 무료 택배 픽업 발송 또는 을지로/충무로 매장 직접 방문 접수 모두 가능합니다.
                </div>

                <button
                  type="button"
                  onClick={handleSubmitEstimateForm}
                  className="w-full py-3 rounded-xl bg-terracotta text-white text-xs sm:text-sm font-bold hover:bg-terracotta-light transition-colors shadow-xs"
                >
                  비대면 무료 견적 접수하기
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BARCODE COUPON MODAL */}
      {activeCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-vintage-200 p-6 text-center space-y-5">
            <div className="flex justify-between items-center border-b border-vintage-100 pb-2">
              <span className="text-xs font-bold text-terracotta">DASI 공식 모바일 바코드</span>
              <button
                onClick={() => setActiveCoupon(null)}
                className="p-1 text-vintage-400 hover:text-vintage-800 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="font-serif text-lg font-bold text-vintage-900">
                {activeCoupon.title}
              </h4>
              <div className="text-base font-bold text-terracotta font-serif">
                {activeCoupon.discountText}
              </div>
              <p className="text-xs text-vintage-500">발행처: {activeCoupon.issuerName}</p>
            </div>

            {/* Barcode Mock */}
            <div className="p-4 rounded-2xl bg-vintage-50 border border-vintage-200 space-y-2">
              <div className="h-16 flex items-center justify-center gap-1">
                {[4, 2, 6, 1, 3, 5, 2, 7, 3, 2, 6, 1, 4, 3, 5, 2, 8, 3, 2, 5, 1, 4].map((h, idx) => (
                  <div
                    key={idx}
                    className="w-1 bg-stone-900 rounded-full"
                    style={{ height: `${h * 7}px` }}
                  />
                ))}
              </div>
              <div className="font-mono text-xs text-vintage-600 tracking-widest">
                DASI-{activeCoupon.id.toUpperCase()}-2026
              </div>
            </div>

            <p className="text-[11px] text-vintage-500 leading-snug">
              매장 결제 시 사장님에게 이 화면을 보여주시면 즉시 혜택이 적용됩니다.
            </p>

            <button
              onClick={() => handleUseCoupon(activeCoupon.id)}
              className="w-full py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-bold transition-colors shadow-xs"
            >
              사용 완료 처리하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}