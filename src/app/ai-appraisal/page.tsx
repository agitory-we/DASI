'use client';

import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { playShutterSound } from '@/utils/shutterAudio';

export default function AIAppraisalPage() {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'result'>('upload');
  const [analyzingProgress, setAnalyzingProgress] = useState(0);
  const [analyzingText, setAnalyzingText] = useState('시리얼 넘버 데이터베이스 대조 중...');
  const [isConsignmentModalOpen, setIsConsignmentModalOpen] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<{ [key: string]: boolean }>({
    front: false,
    back: false,
    serial: false,
  });

  const handleUploadSimulate = (key: string) => {
    playShutterSound('compact');
    setUploadedPhotos((prev) => ({ ...prev, [key]: true }));
  };

  const isAllUploaded = uploadedPhotos.front && uploadedPhotos.back && uploadedPhotos.serial;

  const handleStartAnalysis = () => {
    setStep('analyzing');
    setAnalyzingProgress(15);
    setAnalyzingText('외관 스크래치 및 황동 에이징 딥러닝 스캔 중...');

    setTimeout(() => {
      setAnalyzingProgress(45);
      setAnalyzingText('셔터막 구동계 마모도 및 렌즈부 곰팡이 패턴 대조 중...');
    }, 900);

    setTimeout(() => {
      setAnalyzingProgress(75);
      setAnalyzingText('국내외 10만 건 실거래가 및 매입 시세 밴드 연산 중...');
    }, 1800);

    setTimeout(() => {
      setAnalyzingProgress(100);
      playShutterSound('slr');
      setStep('result');
    }, 2800);
  };

  const handleReset = () => {
    setUploadedPhotos({ front: false, back: false, serial: false });
    setStep('upload');
    setAnalyzingProgress(0);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>DASI Vision AI 감정 엔진 (Beta)</span>
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
              onClick={() => handleUploadSimulate('front')}
              className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all aspect-square ${
                uploadedPhotos.front
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-vintage-300 hover:border-terracotta bg-vintage-50'
              }`}
            >
              {uploadedPhotos.front ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-vintage-900">1. 바디 전면 사진</div>
                  <span className="text-[10px] text-emerald-700 font-semibold">업로드 완료 (정합률 96%)</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-white text-vintage-400 flex items-center justify-center mx-auto shadow-2xs">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-vintage-800">1. 바디 전면 사진</div>
                  <p className="text-[10px] text-vintage-500">렌즈와 로고가 보이게 촬영</p>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-terracotta/10 text-terracotta font-bold">
                    클릭하여 업로드
                  </span>
                </div>
              )}
            </div>

            {/* Slot 2: 상단/후면 */}
            <div
              onClick={() => handleUploadSimulate('back')}
              className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all aspect-square ${
                uploadedPhotos.back
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-vintage-300 hover:border-terracotta bg-vintage-50'
              }`}
            >
              {uploadedPhotos.back ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-vintage-900">2. 상단 셔터 다이얼</div>
                  <span className="text-[10px] text-emerald-700 font-semibold">업로드 완료 (스크래치 분석)</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-white text-vintage-400 flex items-center justify-center mx-auto shadow-2xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-vintage-800">2. 상단 셔터 다이얼</div>
                  <p className="text-[10px] text-vintage-500">조작부 마모 상태 확인</p>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-terracotta/10 text-terracotta font-bold">
                    클릭하여 업로드
                  </span>
                </div>
              )}
            </div>

            {/* Slot 3: 시리얼넘버 */}
            <div
              onClick={() => handleUploadSimulate('serial')}
              className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all aspect-square ${
                uploadedPhotos.serial
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-vintage-300 hover:border-terracotta bg-vintage-50'
              }`}
            >
              {uploadedPhotos.serial ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-vintage-900">3. 시리얼 넘버 각인</div>
                  <span className="text-[10px] text-emerald-700 font-semibold">업로드 완료 (연식 식별)</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-white text-vintage-400 flex items-center justify-center mx-auto shadow-2xs">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-vintage-800">3. 시리얼 넘버 각인</div>
                  <p className="text-[10px] text-vintage-500">바닥 또는 상단 번호 확대</p>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-terracotta/10 text-terracotta font-bold">
                    클릭하여 업로드
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>DASI 하이브리드 검수 원칙:</strong> AI는 외관 등급 및 실거래 시세 범위를 추정합니다.
              셔터막 속도, 렌즈 곰팡이 등 기능 검수는 제휴 오프라인 장인 매장 방문 시 무료로 진행됩니다.
            </div>
          </div>

          <button
            onClick={handleStartAnalysis}
            disabled={!isAllUploaded}
            className={`w-full py-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              isAllUploaded
                ? 'bg-terracotta text-white hover:bg-terracotta-light shadow-md active:scale-98'
                : 'bg-vintage-200 text-vintage-400 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAllUploaded ? 'AI 감정 및 시세 리포트 산출하기' : '사진 3장을 모두 등록해 주세요'}</span>
          </button>
        </div>
      )}

      {/* STEP 2: ANALYZING ANIMATION */}
      {step === 'analyzing' && (
        <div className="rounded-3xl bg-white border border-vintage-200 p-10 sm:p-14 text-center shadow-xs space-y-6 animate-fade-in max-w-xl mx-auto">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border-4 border-vintage-100 border-t-terracotta animate-spin" />
            <Sparkles className="w-7 h-7 text-terracotta absolute" />
          </div>

          <div className="space-y-3">
            <h3 className="font-serif text-2xl font-bold text-vintage-900">
              AI 비전 정밀 감정 중
            </h3>
            <p className="text-xs text-vintage-600 min-h-[1.5rem] font-medium transition-all">
              {analyzingText}
            </p>

            {/* Visual Progress Bar */}
            <div className="w-full bg-vintage-100 rounded-full h-2.5 overflow-hidden mt-4">
              <div
                className="bg-terracotta h-full transition-all duration-500 ease-out rounded-full"
                style={{ width: `${analyzingProgress}%` }}
              />
            </div>
            <div className="text-[11px] font-mono text-vintage-400">
              분석 완료도: {analyzingProgress}%
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: RESULT REPORT */}
      {step === 'result' && (
        <div className="rounded-3xl bg-white border border-vintage-200 overflow-hidden shadow-lg space-y-6 animate-fade-in">
          {/* Certificate Header */}
          <div className="bg-gradient-to-r from-vintage-900 to-vintage-800 text-white p-6 sm:p-8 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-amber-300 uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                DASI AI CERTIFICATE #2026-N8921
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-cream">
                Nikon FM2 (전기형 허니컴 셔터)
              </h2>
              <div className="text-xs text-vintage-300">
                1983년산 생산 모델 · 시리얼 N724981 대조 완료 (신뢰도 96.4%)
              </div>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-terracotta text-white flex flex-col items-center justify-center shadow-md">
              <span className="text-[10px] font-bold">외관 등급</span>
              <span className="font-serif text-2xl font-bold">B+</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Price Estimate Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-vintage-50 border border-vintage-200 text-center">
                <span className="text-[11px] text-vintage-500">최근 6개월 중고 평균 거래가</span>
                <div className="text-xl font-bold text-vintage-800 mt-1">360,000원</div>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-[11px] text-amber-800 font-semibold">AI 추천 적정 시세 밴드</span>
                <div className="text-xl font-bold text-terracotta mt-1">350,000 ~ 410,000원</div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-[11px] text-emerald-800 font-semibold">DASI 제휴 입점사 즉시 매입가</span>
                <div className="text-xl font-bold text-emerald-900 mt-1">320,000원</div>
              </div>
            </div>

            {/* AI Exterior Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-vintage-900 uppercase tracking-wider">
                AI 외관 세부 판정 소견
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-vintage-50 border border-vintage-100 flex items-center justify-between">
                  <span>바디 펜타프리즘 모서리 황동 까짐</span>
                  <span className="text-amber-700 font-bold">미세 스크래치 감지 (자연스러운 에이징)</span>
                </div>
                <div className="p-3 rounded-xl bg-vintage-50 border border-vintage-100 flex items-center justify-between">
                  <span>하단 배터리실 캡 크랙 여부</span>
                  <span className="text-emerald-700 font-bold">크랙 없음 (양호)</span>
                </div>
              </div>
            </div>

            {/* Next Steps Buttons */}
            <div className="pt-4 border-t border-vintage-200 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleReset}
                className="py-3 px-4 rounded-xl border border-vintage-300 text-xs font-semibold text-vintage-700 hover:bg-vintage-100 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>다른 기기 감정하기</span>
              </button>

              <button
                onClick={() => typeof window !== 'undefined' && window.print()}
                className="py-3 px-4 rounded-xl border border-vintage-300 text-xs font-semibold text-vintage-700 hover:bg-vintage-100 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>감정서 인쇄 / PDF 저장</span>
              </button>

              <button
                onClick={() => setIsConsignmentModalOpen(true)}
                className="flex-1 py-3 px-6 rounded-xl bg-terracotta hover:bg-terracotta-light text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <span>이 감정가로 DASI 마켓 판매 위탁 신청</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONSIGNMENT APPLICATION MODAL */}
      {isConsignmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-vintage-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-vintage-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Check className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-vintage-900">
                  판매 위탁 &amp; 무료 장인 검수 접수
                </h3>
              </div>
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
                  <span className="font-bold text-vintage-900">Nikon FM2 (B+)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-vintage-500">희망 판매가</span>
                  <span className="font-bold text-terracotta">380,000원 (권장 범위 내)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-vintage-500">지정 검수처</span>
                  <span className="font-semibold text-vintage-800">충무로 보성광학 (김상철 장인)</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>DASI 위탁 판매 안심 보증</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  매장 방문 또는 택배 발송 시 명장님이 셔터 속도 측정기와 콜리메이터로 <strong>무료 기능 검수</strong>를 진행하며, 통과 시 DASI 마켓에 <strong>&apos;장인 인증 마크&apos;</strong>와 함께 등록됩니다.
                </p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-[11px] font-medium">
                <QrCode className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>접수 번호: DASI-APP-2026-N89 (카카오 알림톡 발송 완료)</span>
              </div>
            </div>

            <button
              onClick={() => setIsConsignmentModalOpen(false)}
              className="w-full py-3 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-semibold transition-colors"
            >
              확인 및 접수 완료
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
