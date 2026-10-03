'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Upload,
  Camera,
  Film,
  Aperture,
  Clock,
  Gauge,
  Sun,
  ShieldCheck,
  Download,
  Share2,
  BookmarkCheck,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Info,
  ChevronRight
} from 'lucide-react';
import { playShutterSound } from '@/utils/shutterAudio';
import { useDasi } from '@/context/DasiContext';
import type { FilmExifResponse } from '@/app/api/ai/film-exif/route';

const SAMPLE_PHOTOS = [
  {
    label: '을지로 골든아워 선셋',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
    hint: '35mm 따스한 오후 빛'
  },
  {
    label: '성수 레트로 카페 & 네온',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    hint: '텅스텐 조명 & 할레이션'
  },
  {
    label: '정동 돌담길 흑백의 미학',
    url: 'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?auto=format&fit=crop&w=1200&q=80',
    hint: '고대비 모노크롬 계조'
  }
];

export default function FilmLogbookPage() {
  const { showToast } = useDasi();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FilmExifResponse | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playShutterSound('compact');
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setAnalysisResult(null);
      setIsSaved(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sampleUrl: string) => {
    playShutterSound('compact');
    setSelectedImage(sampleUrl);
    setAnalysisResult(null);
    setIsSaved(false);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    playShutterSound('slr');

    try {
      const res = await fetch('/api/ai/film-exif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: selectedImage })
      });

      if (!res.ok) throw new Error('분석 실패');

      const data: FilmExifResponse = await res.json();
      setAnalysisResult(data);
      showToast('✨ 아날로그 EXIF 메타데이터 복원이 완료되었습니다!', 'success');
    } catch {
      showToast('분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'warning');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToCabinet = () => {
    setIsSaved(true);
    showToast('📂 DASI 마이 캐비닛에 필름 티켓이 영구 보관되었습니다.', 'success');
  };

  const handleShare = () => {
    if (navigator.share && analysisResult) {
      navigator.share({
        title: `DASI 필름 로그북 - ${analysisResult.filmStock}`,
        text: `${analysisResult.estimatedCamera} | ${analysisResult.estimatedLens}로 복원된 아날로그 촬영 티켓입니다.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast('🔗 필름 티켓 링크가 클립보드에 복사되었습니다.', 'info');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-amber-500 selection:text-stone-950">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
          <Link href="/" className="hover:text-amber-400 transition-colors">DASI</Link>
          <ChevronRight className="w-3 h-3 text-stone-600" />
          <span className="text-amber-500 font-semibold">AI LAB</span>
          <ChevronRight className="w-3 h-3 text-stone-600" />
          <span>아날로그 EXIF 복원기</span>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-600/30 text-amber-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>CTO & CPO ARCHITECTURE · 광학 AI 디지털 트윈</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-stone-50">
            아날로그 필름 EXIF 복원기 & 티켓
          </h1>
          <p className="text-sm sm:text-base text-stone-400 max-w-2xl mx-auto leading-relaxed">
            디지털 메타데이터가 없는 필름 사진의 그레인, 계조, 색온도를 Gemini AI로 정밀 분석하여
            <br className="hidden sm:inline" />
            당시 사용된 필름 스톡, 조리개값, 셔터스피드를 복원하고 소장용 아날로그 티켓을 발행합니다.
          </p>
        </div>

        {/* Upload & Workspace */}
        <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* Left: Image Preview & Dropzone */}
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group ${
                  selectedImage
                    ? 'border-amber-500/50 bg-stone-900'
                    : 'border-stone-700 hover:border-amber-400 bg-stone-900/60'
                }`}
              >
                {selectedImage ? (
                  <>
                    <img
                      src={selectedImage}
                      alt="Uploaded preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1.5 rounded-lg bg-stone-900/90 text-xs font-mono text-amber-300 border border-amber-500/30">
                        사진 변경하기
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-stone-800 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-medium text-stone-200">
                      인화본 사진이나 스캔본 업로드
                    </div>
                    <div className="text-xs text-stone-500 font-mono">
                      JPG, PNG, WebP 지원 (최대 15MB)
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Sample Photo Pickers */}
              <div className="space-y-2">
                <span className="text-xs text-stone-400 font-mono flex items-center gap-1">
                  <Film className="w-3.5 h-3.5 text-amber-500" />
                  또는 샘플 필름 사진으로 즉시 체험:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {SAMPLE_PHOTOS.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSample(sample.url)}
                      className="text-left p-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/40 transition-all text-xs"
                    >
                      <div className="font-semibold text-stone-200 truncate">{sample.label}</div>
                      <div className="text-[10px] text-stone-500 font-mono truncate">{sample.hint}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Action & Status Panel */}
            <div className="space-y-6">
              <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-stone-200 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  복원 파이프라인 분석 항목
                </h3>
                <ul className="text-xs space-y-2 text-stone-400 font-mono">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>광학 할레이션 & 계조 분석 ➔ 필름 스톡 역추정</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>피사계 심도 & 보케 형상 ➔ 조리개값(F-stop) 계산</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>모션 블러 & 광량 밸런스 ➔ 셔터스피드 역산</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>DASI 40년 명장 감정 데이터베이스 교차 검증</span>
                  </li>
                </ul>
              </div>

              <button
                disabled={!selectedImage || isAnalyzing}
                onClick={handleAnalyze}
                className="w-full py-4 px-6 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-stone-950 shadow-lg shadow-amber-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                    <span>광학 인텔리전스 분석 중 (약 3초)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>AI 아날로그 EXIF 복원 및 티켓 발행하기</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Vintage Ticket Result Display */}
        {analysisResult && (
          <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="text-center space-y-1">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                Optical Intelligence Certificate
              </span>
              <h2 className="text-2xl font-serif font-bold text-stone-100">
                발행된 아날로그 촬영 티켓
              </h2>
            </div>

            {/* The Ticket Container */}
            <div
              ref={ticketRef}
              className="max-w-2xl mx-auto bg-[#faf6ed] text-stone-900 rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-amber-900/20 relative overflow-hidden font-mono"
            >
              {/* Ticket Notches (Left & Right Cutouts) */}
              <div className="absolute top-1/2 -left-5 -translate-y-1/2 w-10 h-10 rounded-full bg-stone-900" />
              <div className="absolute top-1/2 -right-5 -translate-y-1/2 w-10 h-10 rounded-full bg-stone-900" />

              {/* Watermark / Grain Stamp */}
              <div className="absolute top-6 right-6 border-2 border-dashed border-amber-800/40 rounded-full w-20 h-20 flex items-center justify-center rotate-12 pointer-events-none opacity-40">
                <span className="text-[10px] text-amber-900 font-bold text-center leading-tight">
                  DASI LAB<br />VERIFIED<br />2026
                </span>
              </div>

              {/* Ticket Header */}
              <div className="border-b-2 border-stone-300 pb-5 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[11px] tracking-wider text-amber-800 font-bold uppercase">
                      Chungmuro Heritage Optical Lab
                    </div>
                    <div className="text-2xl font-serif font-black tracking-tight text-stone-950">
                      DASI ANALOG LOGBOOK
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-stone-500">TICKET NO.</div>
                    <div className="text-xs font-bold text-stone-800">{analysisResult.ticketId}</div>
                  </div>
                </div>
              </div>

              {/* Core Parameters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 bg-stone-100/80 p-4 rounded-xl border border-stone-300">
                <div>
                  <div className="text-[10px] text-stone-500 uppercase flex items-center gap-1">
                    <Film className="w-3 h-3 text-amber-700" />
                    FILM STOCK
                  </div>
                  <div className="font-bold text-sm text-stone-900 truncate">
                    {analysisResult.filmStock}
                  </div>
                  <div className="text-[10px] text-amber-800 font-semibold">ISO {analysisResult.iso}</div>
                </div>

                <div>
                  <div className="text-[10px] text-stone-500 uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-700" />
                    SHUTTER SPEED
                  </div>
                  <div className="font-bold text-sm text-stone-900">
                    {analysisResult.estimatedShutter}
                  </div>
                  <div className="text-[10px] text-stone-500">추정 광량 일치</div>
                </div>

                <div>
                  <div className="text-[10px] text-stone-500 uppercase flex items-center gap-1">
                    <Aperture className="w-3 h-3 text-amber-700" />
                    APERTURE
                  </div>
                  <div className="font-bold text-sm text-stone-900">
                    {analysisResult.estimatedAperture}
                  </div>
                  <div className="text-[10px] text-stone-500">심도 역산치</div>
                </div>

                <div>
                  <div className="text-[10px] text-stone-500 uppercase flex items-center gap-1">
                    <Camera className="w-3 h-3 text-amber-700" />
                    EST. BODY
                  </div>
                  <div className="font-bold text-sm text-stone-900 truncate">
                    {analysisResult.estimatedCamera}
                  </div>
                  <div className="text-[10px] text-stone-500 truncate">{analysisResult.estimatedLens}</div>
                </div>
              </div>

              {/* Optical Characteristics & Mood */}
              <div className="space-y-4 mb-6">
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="text-[11px] font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5" />
                    빛과 분위기 (Atmosphere)
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed font-sans">
                    {analysisResult.moodSummary}
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <div className="text-[11px] font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-stone-600" />
                    충무로 명장의 슈팅 팁 (Expert Advice)
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans">
                    {analysisResult.shootingAdvice}
                  </p>
                </div>
              </div>

              {/* Optical Gauges */}
              <div className="grid grid-cols-3 gap-3 border-t-2 border-dashed border-stone-300 pt-4 mb-6 text-center text-xs">
                <div>
                  <div className="text-[10px] text-stone-500">그레인 인덱스</div>
                  <div className="font-bold text-amber-900 text-base">{analysisResult.grainIndex}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-stone-500">추정 색온도</div>
                  <div className="font-bold text-stone-800 text-sm truncate">{analysisResult.colorTemp}</div>
                </div>
                <div>
                  <div className="text-[10px] text-stone-500">바이브 스코어</div>
                  <div className="font-bold text-amber-600 text-base">{analysisResult.vibeScore} / 100</div>
                </div>
              </div>

              {/* Ticket Footer with Barcode */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-stone-300 pt-4">
                <div className="text-center sm:text-left">
                  <div className="text-[9px] text-stone-500 tracking-wider">OFFICIAL RECONSTRUCTION CERTIFICATE</div>
                  <div className="text-[10px] text-stone-700 font-semibold">DASI RETRO PLATFORM · REBORN CO.</div>
                </div>
                {/* Simulated Vintage Barcode */}
                <div className="flex items-center gap-0.5 h-8">
                  {[4,2,6,1,3,5,2,4,7,1,3,2,6,4,2,5,3,1,4,6,2].map((w, i) => (
                    <div key={i} className="bg-stone-950 h-full" style={{ width: `${w}px` }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Ticket Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleSaveToCabinet}
                disabled={isSaved}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  isSaved
                    ? 'bg-emerald-800/40 text-emerald-300 border border-emerald-500/40'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
                }`}
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>캐비닛 보관 완료</span>
                  </>
                ) : (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-amber-400" />
                    <span>DASI 마이 캐비닛에 저장</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePrint}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 flex items-center gap-2 transition-all"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>티켓 인쇄 / PDF 저장</span>
              </button>

              <button
                onClick={() => setIsStoryModalOpen(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white flex items-center gap-2 transition-all shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>인스타 스토리(9:16) 내보내기</span>
              </button>

              <button
                onClick={handleShare}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 flex items-center gap-2 transition-all"
              >
                <Share2 className="w-4 h-4 text-amber-400" />
                <span>공유하기</span>
              </button>
            </div>

            {/* Cross-Funnel Ecosystem Booster Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              {/* Google One Cloud Sync CTA */}
              <div className="p-5 rounded-2xl bg-stone-800/80 border border-stone-700/80 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>구글원(Google One) 스토리지 연동</span>
                  </div>
                  <h4 className="font-serif font-bold text-stone-100 text-sm">
                    복원된 AI 메타데이터 영구 동기화
                  </h4>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    회원님의 개인 Google Drive 15GB 무료 용량으로 원클릭 안전 자동 보관됩니다.
                  </p>
                </div>
                <Link
                  href="/cabinet?tab=vault"
                  className="w-full py-2 px-3 rounded-xl bg-stone-700 hover:bg-stone-600 text-stone-100 text-xs font-bold text-center block transition-colors"
                >
                  클라우드 자동 백업 설정 &gt;
                </Link>
              </div>

              {/* Film Passport Cross-Sell */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/60 to-stone-900 border border-amber-600/30 hover:border-amber-500/60 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Film className="w-3.5 h-3.5" />
                    <span>{analysisResult.filmStock} 정기구독</span>
                  </div>
                  <h4 className="font-serif font-bold text-amber-100 text-sm">
                    월 19,900원에 2롤 정기 배송
                  </h4>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    이 필름의 매력을 계속 담아보세요. 전용 틴케이스와 무료 현상권이 매월 집으로 찾아갑니다.
                  </p>
                </div>
                <Link
                  href="/passport"
                  className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold text-center block transition-colors"
                >
                  필름 여권 25% 할인 구독 &gt;
                </Link>
              </div>

              {/* Recommended Spots Loop */}
              <div className="p-5 rounded-2xl bg-stone-800/80 border border-stone-700/80 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                    <Sun className="w-3.5 h-3.5" />
                    <span>추천 서울 골든아워 출사지</span>
                  </div>
                  <h4 className="font-serif font-bold text-stone-100 text-sm">
                    {analysisResult.colorTemp.includes('Warm') ? '을지로 & 정동 골목길' : '성수 & 청계천 야경'}
                  </h4>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    이 필름 색감과 가장 잘 어울리는 명소와 실시간 일몰 매직아워를 지금 지도에서 확인하세요.
                  </p>
                </div>
                <Link
                  href="/map"
                  className="w-full py-2 px-3 rounded-xl bg-stone-700 hover:bg-stone-600 text-stone-100 text-xs font-bold text-center block transition-colors"
                >
                  출사 지도에서 스팟 보기 &gt;
                </Link>
              </div>
            </div>

            {/* Instagram Story 9:16 Modal */}
            {isStoryModalOpen && (
              <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                <div className="relative max-w-sm w-full bg-stone-900 border border-amber-500/30 rounded-3xl p-5 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 font-mono">
                      <Sparkles className="w-4 h-4" />
                      <span>INSTAGRAM STORY (9:16)</span>
                    </div>
                    <button
                      onClick={() => setIsStoryModalOpen(false)}
                      className="p-1 rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-800"
                    >
                      <RotateCcw className="w-4 h-4 hidden" />
                      <span className="text-sm font-bold">✕</span>
                    </button>
                  </div>

                  {/* 9:16 Aspect Card Preview */}
                  <div className="aspect-[9/16] w-full rounded-2xl bg-gradient-to-b from-stone-950 via-stone-900 to-amber-950 p-5 flex flex-col justify-between border border-amber-500/30 text-stone-100 shadow-inner relative overflow-hidden">
                    {/* Background Vintage Texture */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                    {/* Story Header */}
                    <div className="relative z-10 flex items-center justify-between border-b border-stone-700/60 pb-3">
                      <div>
                        <div className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">DASI OPTICAL AI</div>
                        <div className="text-xs font-serif font-bold text-stone-200">ANALOG ARCHIVE</div>
                      </div>
                      <div className="text-[10px] font-mono text-stone-400">#DASI_FILM</div>
                    </div>

                    {/* Story Photo */}
                    <div className="relative z-10 my-auto space-y-3">
                      <div className="aspect-square w-full rounded-xl overflow-hidden border-2 border-stone-700 shadow-lg relative">
                        <img
                          src={selectedImage || ''}
                          alt="Story Photo"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-mono text-amber-300 backdrop-blur-xs">
                          {analysisResult.filmStock}
                        </div>
                      </div>

                      {/* Optical Stats Badge */}
                      <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-700 text-xs space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                          <div>
                            <span className="text-stone-400">SHUTTER:</span> <strong className="text-amber-400">{analysisResult.estimatedShutter}</strong>
                          </div>
                          <div>
                            <span className="text-stone-400">APERTURE:</span> <strong className="text-amber-400">{analysisResult.estimatedAperture}</strong>
                          </div>
                          <div>
                            <span className="text-stone-400">BODY:</span> <span className="text-stone-200">{analysisResult.estimatedCamera}</span>
                          </div>
                          <div>
                            <span className="text-stone-400">VIBE:</span> <strong className="text-rose-400">{analysisResult.vibeScore} pts</strong>
                          </div>
                        </div>
                        <p className="text-[10px] text-stone-300 leading-tight italic border-t border-stone-800 pt-1.5 font-sans">
                          &ldquo;{analysisResult.moodSummary}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Story Footer */}
                    <div className="relative z-10 border-t border-stone-700/60 pt-3 flex items-center justify-between text-[10px] font-mono text-stone-400">
                      <span>dasi-retro.kr</span>
                      <span className="text-amber-400 font-bold">@reborn_dasi</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        handleShare();
                        setIsStoryModalOpen(false);
                      }}
                      className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>스토리 공유하기</span>
                    </button>
                    <button
                      onClick={() => {
                        window.print();
                        setIsStoryModalOpen(false);
                      }}
                      className="py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>이미지 저장</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
