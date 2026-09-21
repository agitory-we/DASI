'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  FileCheck,
  ShieldCheck,
  RotateCcw,
  Printer,
  QrCode,
  Check,
  X,
  Share2,
  ExternalLink,
  Award
} from 'lucide-react';
import { playShutterSound } from '@/utils/shutterAudio';
import { useDasi } from '@/context/DasiContext';
import type { AppraisalResponse } from '@/app/api/ai-appraisal/route';

export default function AIAppraisalPage() {
  const { addOwnedCamera, showToast } = useDasi();
  const [step, setStep] = useState<'upload' | 'analyzing' | 'result'>('upload');
  const [analyzingProgress, setAnalyzingProgress] = useState(0);
  const [analyzingText, setAnalyzingText] = useState('시리얼 넘버 데이터베이스 대조 중...');
  const [isConsignmentModalOpen, setIsConsignmentModalOpen] = useState(false);
  const [isCabinetRegistered, setIsCabinetRegistered] = useState(false);

  // Uploaded photo state (Data URLs)
  const [photoData, setPhotoData] = useState<{
    front: string | null;
    back: string | null;
    serial: string | null;
  }>({
    front: null,
    back: null,
    serial: null,
  });

  const [appraisalResult, setAppraisalResult] = useState<AppraisalResponse | null>(null);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const serialInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, slot: 'front' | 'back' | 'serial') => {
    const file = e.target.files?.[0];
    if (!file) return;

    playShutterSound('compact');
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoData((prev) => ({ ...prev, [slot]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleMockSample = (slot: 'front' | 'back' | 'serial', sampleUrl: string) => {
    playShutterSound('compact');
    setPhotoData((prev) => ({ ...prev, [slot]: sampleUrl }));
  };

  const isAllUploaded = Boolean(photoData.front && photoData.back && photoData.serial);

  const handleStartAnalysis = async () => {
    if (!isAllUploaded) return;

    setStep('analyzing');
    setAnalyzingProgress(15);
    setAnalyzingText('외관 스크래치 및 황동 에이징 딥러닝 스캔 중...');

    const timer1 = setTimeout(() => {
      setAnalyzingProgress(45);
      setAnalyzingText('셔터막 구동계 마모도 및 렌즈부 곰팡이 패턴 대조 중...');
    }, 900);

    const timer2 = setTimeout(() => {
      setAnalyzingProgress(75);
      setAnalyzingText('국내외 10만 건 실거래가 및 매입 시세 밴드 연산 중...');
    }, 1800);

    try {
      const res = await fetch('/api/ai-appraisal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frontImage: photoData.front,
          backImage: photoData.back,
          serialImage: photoData.serial
        })
      });

      const data: AppraisalResponse = await res.json();
      clearTimeout(timer1);
      clearTimeout(timer2);

      setAnalyzingProgress(100);
      playShutterSound('slr');
      setAppraisalResult(data);
      setStep('result');
    } catch (err) {
      console.error('Analysis error:', err);
      showToast('AI 감정 처리 중 일시적 지연이 발생하여 표준 모델로 전환합니다.', 'info');
      setStep('result');
    }
  };

  const handleRegisterToCabinet = () => {
    if (!appraisalResult || isCabinetRegistered) return;

    addOwnedCamera({
      name: appraisalResult.modelName,
      serial: appraisalResult.serialNumber,
      acquiredDate: `${new Date().toISOString().slice(0, 10)} (AI 감정 정품 등록)`,
      condition: appraisalResult.conditionGrade,
      masterInspection: `DASI AI Vision 검증 완료 (${appraisalResult.confidenceScore}%)`,
      imageUrl: photoData.front || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
    });

    setIsCabinetRegistered(true);
    showToast(`${appraisalResult.modelName}이 마이 캐비닛에 성공적으로 등록되었습니다!`, 'success');
  };

  const handleReset = () => {
    setPhotoData({ front: null, back: null, serial: null });
    setAppraisalResult(null);
    setIsCabinetRegistered(false);
    setStep('upload');
    setAnalyzingProgress(0);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hidden file inputs */}
      <input
        ref={frontInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'front')}
      />
      <input
        ref={backInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'back')}
      />
      <input
        ref={serialInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'serial')}
      />

      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>DASI Vision AI 감정 엔진</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-vintage-900">
          사진 3장으로 끝내는 카메라 AI 감정
        </h1>
        <p className="text-xs sm:text-sm text-vintage-600 leading-relaxed">
          외관 정면, 조작부(상단/후면), 시리얼 넘버 사진 3장만 올리시면
          국내외 10만 건의 실거래가 DB와 대조하여 모델명, 연식, 외관 등급, 예상 시세를 즉시 산출합니다.
        </p>
      </div>

      {/* STEP 1: UPLOAD */}
      {step === 'upload' && (
        <div className="rounded-3xl bg-white border border-vintage-200 p-6 sm:p-10 shadow-xs space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Slot 1: 전면 */}
            <div
              onClick={() => frontInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all aspect-square relative overflow-hidden group ${
                photoData.front
                  ? 'border-emerald-500 bg-emerald-50/20'
                  : 'border-vintage-300 hover:border-terracotta bg-vintage-50'
              }`}
            >
              {photoData.front ? (
                <div className="w-full h-full relative">
                  <img src={photoData.front} alt="전면" className="w-full h-full object-cover rounded-xl" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl text-white text-xs font-bold">
                    사진 변경하기
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                    ✓ 전면 완료
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-white text-vintage-400 flex items-center justify-center mx-auto shadow-2xs">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-vintage-800">1. 바디 전면 사진</div>
                  <p className="text-[10px] text-vintage-500">렌즈와 로고가 보이게 촬영</p>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-terracotta/10 text-terracotta font-bold inline-block">
                    파일 선택 / 촬영
                  </span>
                </div>
              )}
            </div>

            {/* Slot 2: 상단/후면 */}
            <div
              onClick={() => backInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all aspect-square relative overflow-hidden group ${
                photoData.back
                  ? 'border-emerald-500 bg-emerald-50/20'
                  : 'border-vintage-300 hover:border-terracotta bg-vintage-50'
              }`}
            >
              {photoData.back ? (
                <div className="w-full h-full relative">
                  <img src={photoData.back} alt="상단/후면" className="w-full h-full object-cover rounded-xl" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl text-white text-xs font-bold">
                    사진 변경하기
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                    ✓ 상단/후면 완료
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-white text-vintage-400 flex items-center justify-center mx-auto shadow-2xs">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-vintage-800">2. 조작부 (상단/후면)</div>
                  <p className="text-[10px] text-vintage-500">셔터 다이얼 및 뷰파인더 앵글</p>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-terracotta/10 text-terracotta font-bold inline-block">
                    파일 선택 / 촬영
                  </span>
                </div>
              )}
            </div>

            {/* Slot 3: 시리얼넘버 */}
            <div
              onClick={() => serialInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all aspect-square relative overflow-hidden group ${
                photoData.serial
                  ? 'border-emerald-500 bg-emerald-50/20'
                  : 'border-vintage-300 hover:border-terracotta bg-vintage-50'
              }`}
            >
              {photoData.serial ? (
                <div className="w-full h-full relative">
                  <img src={photoData.serial} alt="시리얼 넘버" className="w-full h-full object-cover rounded-xl" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl text-white text-xs font-bold">
                    사진 변경하기
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                    ✓ 시리얼 완료
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-white text-vintage-400 flex items-center justify-center mx-auto shadow-2xs">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-vintage-800">3. 하판 시리얼 넘버</div>
                  <p className="text-[10px] text-vintage-500">바닥면 음각 일련번호 근접 샷</p>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-terracotta/10 text-terracotta font-bold inline-block">
                    파일 선택 / 촬영
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sample quick loader for testing convenience */}
          <div className="p-3.5 rounded-2xl bg-vintage-50 border border-vintage-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-vintage-600 font-medium">📷 사진 파일이 없으신가요?</span>
            <button
              onClick={() => {
                handleMockSample('front', 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80');
                handleMockSample('back', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80');
                handleMockSample('serial', 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=800&auto=format&fit=crop&q=80');
              }}
              className="text-terracotta hover:underline font-bold"
            >
              샘플 카메라 3장 자동 채우기 →
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={handleStartAnalysis}
              disabled={!isAllUploaded}
              className={`px-8 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-md flex items-center gap-2 mx-auto ${
                isAllUploaded
                  ? 'bg-terracotta hover:bg-terracotta-light text-white'
                  : 'bg-vintage-200 text-vintage-400 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>DASI Vision AI 정밀 감정 시작하기</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ANALYZING ANIMATION */}
      {step === 'analyzing' && (
        <div className="rounded-3xl bg-white border border-vintage-200 p-12 text-center space-y-6 shadow-xs animate-fadeIn max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center mx-auto animate-spin">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-bold text-vintage-900">
              AI가 기기를 정밀 분석 중입니다
            </h3>
            <p className="text-xs sm:text-sm text-vintage-600 font-medium h-6">
              {analyzingText}
            </p>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <div className="w-full h-3 bg-vintage-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-terracotta transition-all duration-500 rounded-full"
                style={{ width: `${analyzingProgress}%` }}
              />
            </div>
            <div className="text-right text-[11px] font-mono text-vintage-500">
              {analyzingProgress}% 완료
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: RESULT CERTIFICATE */}
      {step === 'result' && appraisalResult && (
        <div className="space-y-8 animate-fadeIn">
          {/* Certificate Card */}
          <div className="rounded-3xl bg-gradient-to-br from-vintage-900 via-vintage-950 to-stone-900 text-white p-6 sm:p-10 shadow-2xl border border-vintage-700/60 relative overflow-hidden space-y-8">
            <div className="absolute top-0 right-0 w-96 h-96 bg-terracotta/10 rounded-full blur-3xl pointer-events-none" />

            {/* Certificate Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-vintage-800 pb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-terracotta/20 text-terracotta border border-terracotta/30 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-terracotta tracking-widest uppercase flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>DASI OFFICIAL DIGITAL APPRAISAL</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold mt-0.5">
                    공인 디지털 감정 증서
                  </h2>
                </div>
              </div>

              <div className="text-right font-mono text-xs text-vintage-400">
                <div>증서 번호: <span className="text-white font-bold">{appraisalResult.appraisalCode}</span></div>
                <div>감정 일자: {appraisalResult.appraisedAt}</div>
              </div>
            </div>

            {/* Certificate Core Info */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
              <div className="md:col-span-4 aspect-4/3 rounded-2xl overflow-hidden bg-vintage-800 border border-vintage-700 relative">
                <img
                  src={photoData.front || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'}
                  alt={appraisalResult.modelName}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-md">
                  {appraisalResult.conditionGrade} 등급
                </span>
                <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/70 text-white text-[10px] font-mono">
                  정합도 {appraisalResult.confidenceScore}%
                </span>
              </div>

              <div className="md:col-span-8 space-y-4">
                <div>
                  <span className="text-xs text-vintage-400">{appraisalResult.brand} · {appraisalResult.era}</span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                    {appraisalResult.modelName}
                  </h3>
                  <div className="text-xs text-vintage-300 font-mono mt-1">
                    시리얼 번호: {appraisalResult.serialNumber}
                  </div>
                </div>

                {/* Price Band Visualization */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-vintage-300 font-bold flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      실거래 기반 AI 적정 시세 밴드
                    </span>
                    <span className="text-emerald-400 font-bold">평균 시세 {appraisalResult.estimatedPriceAvg.toLocaleString()}원</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                    <div className="p-2.5 rounded-xl bg-white/5">
                      <span className="text-[10px] text-vintage-400">최저가</span>
                      <div className="font-semibold text-vintage-200 mt-0.5">
                        {appraisalResult.estimatedPriceMin.toLocaleString()}원
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-terracotta/20 border border-terracotta/40">
                      <span className="text-[10px] text-terracotta font-bold">적정 시세</span>
                      <div className="font-bold text-white mt-0.5 text-sm">
                        {appraisalResult.estimatedPriceAvg.toLocaleString()}원
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5">
                      <span className="text-[10px] text-vintage-400">최고가</span>
                      <div className="font-semibold text-vintage-200 mt-0.5">
                        {appraisalResult.estimatedPriceMax.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Inspection Items */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2 text-vintage-200">
                  <div>🔍 <strong>광학계 소견:</strong> {appraisalResult.opticalCondition}</div>
                  <div>⚙️ <strong>구동계 소견:</strong> {appraisalResult.mechanicalCondition}</div>
                  <div>✨ <strong>외관 소견:</strong> {appraisalResult.cosmeticCondition}</div>
                  <div className="pt-2 border-t border-white/10 text-amber-300 italic">
                    "{appraisalResult.expertComment}"
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-vintage-800 relative z-10">
              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl border border-vintage-700 text-vintage-300 hover:text-white hover:bg-white/5 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>다른 기기 감정하기</span>
              </button>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => setIsConsignmentModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-vintage-800 hover:bg-vintage-700 text-white text-xs font-bold transition-colors"
                >
                  위탁 판매 신청 ({appraisalResult.recommendedConsignmentPrice.toLocaleString()}원 추천)
                </button>

                <button
                  onClick={handleRegisterToCabinet}
                  disabled={isCabinetRegistered}
                  className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2 ${
                    isCabinetRegistered
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-terracotta hover:bg-terracotta-light text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isCabinetRegistered ? '캐비닛 등록 완료' : '내 캐비닛에 보증서 등록하기'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONSIGNMENT MODAL */}
      {isConsignmentModalOpen && appraisalResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-vintage-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-vintage-100 pb-3">
              <h3 className="font-serif text-xl font-bold text-vintage-900">
                DASI 공식 위탁 판매 접수
              </h3>
              <button
                onClick={() => setIsConsignmentModalOpen(false)}
                className="p-1.5 text-vintage-400 hover:text-vintage-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-vintage-700">
              <div className="p-4 rounded-2xl bg-vintage-50 border border-vintage-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-vintage-500">감정 기종</span>
                  <span className="font-bold text-vintage-900">{appraisalResult.modelName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-vintage-500">추천 판매가</span>
                  <span className="font-bold text-terracotta">{appraisalResult.recommendedConsignmentPrice.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-vintage-500">위탁 수수료 (판매 완료 시)</span>
                  <span className="text-vintage-800">10% (촬영, 보증서 발급, CS 대행)</span>
                </div>
                <div className="pt-2 border-t border-vintage-200 flex justify-between font-bold text-vintage-900">
                  <span>예상 정산 수령액</span>
                  <span className="text-emerald-800">
                    {(appraisalResult.recommendedConsignmentPrice * 0.9).toLocaleString()}원
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-[11px] leading-relaxed">
                ✓ 을지로 신성카메라 / 충무로 보성광학 중 원하시는 거점으로 무료 택배 발송 또는 직접 방문 접수하실 수 있습니다.
              </div>
            </div>

            <button
              onClick={() => {
                setIsConsignmentModalOpen(false);
                showToast('위탁 판매 접수가 완료되었습니다. 담당 매니저가 유선 안내드립니다.', 'success');
              }}
              className="w-full py-3 rounded-xl bg-terracotta text-white text-xs sm:text-sm font-bold hover:bg-terracotta-light transition-colors shadow-xs"
            >
              위탁 판매 신청 완료하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}