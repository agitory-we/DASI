'use client';

import React, { useState, useRef } from 'react';
import {
  Film,
  Moon,
  Sun,
  Eye,
  Sparkles,
  Maximize2,
  X,
  Camera,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Check
} from 'lucide-react';
import { CommunityPhoto } from '@/types';
import { useDevicePlatform } from '@/hooks/useDevicePlatform';
import { playShutterSound } from '@/utils/shutterAudio';

interface FilmStripViewerProps {
  photos: CommunityPhoto[];
}

export const FilmStripViewer: React.FC<FilmStripViewerProps> = ({ photos }) => {
  const { triggerHaptic } = useDevicePlatform();
  const [isSafelightMode, setIsSafelightMode] = useState(false); // 암실 붉은 조명 모드
  const [isNegativeInvert, setIsNegativeInvert] = useState(false); // 네거티브 필름 반전
  const [selectedPhoto, setSelectedPhoto] = useState<CommunityPhoto | null>(null);

  // 35mm 밀착인화지 (Contact Sheet) 인스타 스토리 캔버스 상태
  const contactCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isContactSheetOpen, setIsContactSheetOpen] = useState(false);
  const [isGeneratingSheet, setIsGeneratingSheet] = useState(false);
  const [sheetDownloadDone, setSheetDownloadDone] = useState(false);

  const handleToggleSafelight = () => {
    triggerHaptic('light');
    setIsSafelightMode(!isSafelightMode);
  };

  const handleToggleNegative = () => {
    triggerHaptic('light');
    setIsNegativeInvert(!isNegativeInvert);
  };

  const handleSelectPhoto = (photo: CommunityPhoto) => {
    triggerHaptic('selection');
    playShutterSound('compact');
    setSelectedPhoto(photo);
  };

  // 35mm 밀착인화지 캔버스 생성기 (1080 x 1920 Instagram Story 규격)
  const drawContactSheet = async () => {
    const canvas = contactCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsGeneratingSheet(true);

    canvas.width = 1080;
    canvas.height = 1920;

    // 빈티지 암실 인화지 다크 베이스
    ctx.fillStyle = '#0e0b09';
    ctx.fillRect(0, 0, 1080, 1920);

    // 상단 아카이브 타이포그래피
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 26px monospace';
    ctx.fillText('DASI DARKROOM CONTACT SHEET', 70, 110);

    ctx.fillStyle = '#8c827a';
    ctx.font = '18px monospace';
    ctx.fillText('PROOF NO. 35-KR · 400 ISO · PROCESS C-41 · MASTER ARCHIVE', 70, 145);

    ctx.strokeStyle = '#2b231f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(70, 170);
    ctx.lineTo(1010, 170);
    ctx.stroke();

    // 3개 프레임 순차 렌더링
    const samplePhotos = photos.slice(0, 3);
    const startY = 210;
    const frameHeight = 440;
    const gap = 55;

    for (let i = 0; i < samplePhotos.length; i++) {
      const p = samplePhotos[i];
      const y = startY + i * (frameHeight + gap);

      // 필름 테두리 (슬리브)
      ctx.fillStyle = '#060403';
      ctx.fillRect(50, y, 980, frameHeight);

      // 상/하단 스프로킷 구멍 (13개씩)
      ctx.fillStyle = '#1c1511';
      for (let s = 0; s < 13; s++) {
        const sx = 80 + s * 68;
        ctx.fillRect(sx, y + 10, 34, 22);
        ctx.fillRect(sx, y + frameHeight - 32, 34, 22);
      }

      // 프레임 인덱스 및 필름 각인
      ctx.fillStyle = '#d4af37';
      ctx.font = 'bold 17px monospace';
      ctx.fillText(`▶ 0${i + 1}A`, 75, y + frameHeight - 14);
      ctx.fillText('KODAK SAFETY FILM 400', 380, y + 26);
      ctx.fillText(`EXP 36`, 880, y + frameHeight - 14);

      // 실제 이미지 로드 & 렌더링
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
          img.src = p.imageUrl;
        });

        if (img.width > 0) {
          const px = 160;
          const py = y + 42;
          const pw = 760;
          const ph = 356;
          ctx.drawImage(img, px, py, pw, ph);

          // 하단 메타 반투명 바
          ctx.fillStyle = 'rgba(0,0,0,0.65)';
          ctx.fillRect(px, py + ph - 42, pw, 42);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 18px sans-serif';
          ctx.fillText(`📷 ${p.cameraModel} · 🎞️ ${p.filmType} · 🧪 ${p.labName}`, px + 18, py + ph - 14);
        }
      } catch (err) {
        console.error(err);
      }
    }

    // 하단 인증 푸터
    const footerY = 1730;
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 3;
    ctx.strokeRect(70, footerY, 940, 120);

    ctx.fillStyle = '#ea580c';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('DASI CERTIFIED ANALOG CONTACT PROOF', 110, footerY + 50);

    ctx.fillStyle = '#a8a29e';
    ctx.font = '20px sans-serif';
    ctx.fillText('그때 그 취미, 다시 · 아날로그 필름 플랫폼 https://dasi.market', 110, footerY + 85);

    // 우측 원형 레드 인화 도장
    ctx.save();
    ctx.translate(920, footerY + 60);
    ctx.rotate(-0.12);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 44, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DARKROOM', 0, -6);
    ctx.fillText('PASSED', 0, 14);
    ctx.restore();

    setIsGeneratingSheet(false);
  };

  const handleOpenContactSheet = () => {
    triggerHaptic('medium');
    playShutterSound('slr');
    setIsContactSheetOpen(true);
    setSheetDownloadDone(false);
    setTimeout(() => {
      drawContactSheet();
    }, 150);
  };

  const handleDownloadSheet = () => {
    const canvas = contactCanvasRef.current;
    if (!canvas) return;
    playShutterSound('slr');
    triggerHaptic('selection');
    const link = document.createElement('a');
    link.download = `DASI_ContactSheet_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setSheetDownloadDone(true);
  };

  const handleShareSheet = async () => {
    const canvas = contactCanvasRef.current;
    if (!canvas) return;
    triggerHaptic('medium');
    playShutterSound('compact');

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'dasi-contact-sheet.png', { type: 'image/png' });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'DASI 아날로그 밀착인화지 (Contact Sheet)',
            text: 'DASI 암실에서 가상 인화한 35mm 필름 스트립 밀착인화지입니다. #DASI #필름카메라',
            files: [file],
          });
        } else {
          handleDownloadSheet();
        }
      });
    } catch {
      handleDownloadSheet();
    }
  };

  return (
    <div
      className={`rounded-3xl p-5 sm:p-7 border transition-colors duration-500 overflow-hidden shadow-xl ${
        isSafelightMode
          ? 'bg-[#1a0505] border-red-900/60 text-red-100'
          : 'bg-[#15110e] border-amber-900/40 text-amber-100'
      }`}
    >
      {/* 1. 상단 툴바 컨트롤러 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold transition-colors ${
              isSafelightMode
                ? 'bg-red-600/20 text-red-400'
                : 'bg-amber-400/20 text-amber-300'
            }`}
          >
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base sm:text-lg tracking-tight">
              35mm 암실 필름 스트립 뷰어 (Darkroom Strip)
            </h3>
            <p className="text-[11px] opacity-70">
              실제 35mm 필름 롤 형태로 현상된 컷들을 가로로 감상하세요
            </p>
          </div>
        </div>

        {/* 모드 전환 버튼들 */}
        <div className="flex items-center gap-2">
          {/* 암실 붉은 조명(Safelight) 토글 */}
          <button
            onClick={handleToggleSafelight}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              isSafelightMode
                ? 'bg-red-600 border-red-500 text-white shadow-[0_0_12px_rgba(220,38,38,0.5)]'
                : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>암실 조명 {isSafelightMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* 네거티브 반전 토글 */}
          <button
            onClick={handleToggleNegative}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              isNegativeInvert
                ? 'bg-amber-400 border-amber-300 text-black font-bold shadow-md'
                : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>네거티브 반전</span>
          </button>

          {/* 35mm 밀착인화지(Contact Sheet) 인스타 스토리 생성 */}
          <button
            type="button"
            onClick={handleOpenContactSheet}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-terracotta text-white flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>밀착인화지 스토리 생성</span>
          </button>
        </div>
      </div>

      {/* 2. 35mm 필름 스트립 컨테이너 (가로 롤 스크롤) */}
      <div className="py-6 overflow-x-auto no-scrollbar">
        <div
          className={`inline-flex items-center gap-4 px-2 py-4 rounded-2xl border transition-all ${
            isSafelightMode
              ? 'bg-[#120000] border-red-950 shadow-[inset_0_0_20px_rgba(255,0,0,0.1)]'
              : 'bg-[#0d0a08] border-stone-900 shadow-2xl'
          }`}
        >
          {photos.map((photo, idx) => {
            const frameNum = String(idx + 1).padStart(2, '0');
            return (
              <div
                key={photo.id}
                onClick={() => handleSelectPhoto(photo)}
                className="group relative cursor-pointer flex-shrink-0 select-none transition-transform hover:scale-[1.02] active:scale-98"
              >
                {/* 35mm 필름 프레임 쉘 */}
                <div className="w-64 sm:w-72 bg-[#1b1511] rounded-lg border-2 border-stone-800 p-2 shadow-xl flex flex-col justify-between">
                  {/* 상단 퍼포레이션 스프로킷 구멍 & 브랜드 인쇄 */}
                  <div className="flex items-center justify-between px-1 pb-1.5 text-[9px] font-mono font-bold tracking-widest text-amber-500/70 border-b border-stone-800/80">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-3.5 bg-black rounded-xs border border-white/10" />
                      <span className="w-2.5 h-3.5 bg-black rounded-xs border border-white/10" />
                      <span className="w-2.5 h-3.5 bg-black rounded-xs border border-white/10" />
                    </div>
                    <span className="uppercase">{photo.filmType || 'KODAK 400'}</span>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-3.5 bg-black rounded-xs border border-white/10" />
                      <span className="w-2.5 h-3.5 bg-black rounded-xs border border-white/10" />
                      <span className="w-2.5 h-3.5 bg-black rounded-xs border border-white/10" />
                    </div>
                  </div>

                  {/* 중앙 사진 이미지 (3:2 클래식 비율) */}
                  <div className="relative aspect-[3/2] my-2 bg-black rounded-xs overflow-hidden border border-black shadow-inner">
                    <img
                      src={photo.imageUrl}
                      alt={photo.caption}
                      className={`w-full h-full object-cover transition-all duration-300 group-hover:contrast-110 ${
                        isNegativeInvert ? 'filter invert hue-rotate-180' : ''
                      } ${isSafelightMode ? 'filter sepia contrast-125 brightness-90' : ''}`}
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

                    {/* 확대 아이콘 호버 오버레이 */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-2xs">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-lg">
                        <Maximize2 className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* 하단 퍼포레이션 스프로킷 & 프레임 번호 */}
                  <div className="flex items-center justify-between px-1 pt-1.5 text-[9px] font-mono font-bold tracking-widest text-amber-500/70 border-t border-stone-800/80">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-3.5 bg-black rounded-xs border border-white/10" />
                      <span className="w-2.5 h-3.5 bg-black rounded-xs border border-white/10" />
                      <span className="w-2.5 h-3.5 bg-black rounded-xs border border-white/10" />
                    </div>
                    <span className="text-amber-400">▶ {frameNum}A</span>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-3.5 bg-black rounded-xs border border-white/10" />
                      <span className="w-2.5 h-3.5 bg-black rounded-xs border border-white/10" />
                      <span className="w-2.5 h-3.5 bg-black rounded-xs border border-white/10" />
                    </div>
                  </div>
                </div>

                {/* 하단 메타 태그 */}
                <div className="mt-2 px-1 text-left">
                  <div className="text-xs font-bold text-white/90 truncate">{photo.caption}</div>
                  <div className="flex items-center gap-1.5 text-[10px] text-white/50 mt-0.5">
                    <span>{photo.cameraModel}</span>
                    <span>·</span>
                    <span className="text-terracotta">{photo.labName}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 인화지 라이트박스 팝업 (사진 클릭 시 확대) */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-[#faf7f2] rounded-3xl p-6 sm:p-8 shadow-2xl text-vintage-900 border-8 border-white animate-slide-up"
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 text-vintage-400 hover:text-vintage-800 rounded-full hover:bg-vintage-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 인화지 느낌 사진 캔버스 */}
            <div className="relative aspect-[3/2] w-full rounded-xl overflow-hidden bg-black shadow-md border-4 border-white mb-4">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.caption}
                className="w-full h-full object-contain"
              />
            </div>

            {/* 메타데이터 & 인화 정보 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-vintage-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-vintage-200 text-vintage-800 text-[10px] font-bold font-mono">
                    DARKROOM PRINT
                  </span>
                  <span className="text-xs font-bold text-terracotta">
                    {selectedPhoto.filmType}
                  </span>
                </div>
                <h4 className="font-serif font-bold text-lg text-vintage-900">
                  {selectedPhoto.caption}
                </h4>
                <div className="text-xs text-vintage-600 flex items-center gap-2">
                  <span>📷 {selectedPhoto.cameraModel}</span>
                  <span>·</span>
                  <span>🧪 {selectedPhoto.labName}</span>
                  <span>·</span>
                  <span>by {selectedPhoto.photographerName}</span>
                </div>
              </div>

              {/* 액션 버튼 그룹 */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="/rent"
                  className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>이 카메라 대여하기</span>
                </a>
                <a
                  href="/frame"
                  className="px-3.5 py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>프레임 입히기 →</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. 🎞️ 35mm 밀착인화지 (Contact Sheet) 9:16 인스타 스토리 모달 */}
      {isContactSheetOpen && (
        <div
          onClick={() => setIsContactSheetOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm sm:max-w-md bg-vintage-900 rounded-3xl p-5 sm:p-6 shadow-2xl text-white border border-amber-500/30 space-y-4 animate-slide-up cursor-default"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-400" />
                <h3 className="font-serif font-bold text-sm text-amber-200">
                  35mm 밀착인화지 인스타 스토리 (9:16)
                </h3>
              </div>
              <button
                onClick={() => setIsContactSheetOpen(false)}
                className="p-1 rounded-full text-vintage-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 캔버스 프리뷰 영역 */}
            <div className="relative aspect-[9/16] w-full max-h-[58vh] rounded-2xl overflow-hidden bg-black border-2 border-stone-800 shadow-2xl flex items-center justify-center">
              <canvas
                ref={contactCanvasRef}
                className="w-full h-full object-contain"
              />
              {isGeneratingSheet && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 text-xs text-amber-300">
                  <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span>암실 인화 렌더링 중...</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-vintage-300 text-center">
              실제 35mm 암실 감성의 스프로킷 타공과 마스터 아카이브 스탬프가 합성되었습니다.
            </p>

            {/* 다운로드 및 공유 액션 버튼 */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleDownloadSheet}
                className="py-3 rounded-xl bg-white text-vintage-900 hover:bg-vintage-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                {sheetDownloadDone ? <Check className="w-4 h-4 text-emerald-600" /> : <Download className="w-4 h-4" />}
                <span>{sheetDownloadDone ? '다운로드 완료!' : '9:16 이미지 저장'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareSheet}
                className="py-3 rounded-xl bg-gradient-to-r from-amber-500 to-terracotta text-white hover:brightness-110 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>인스타/카카오 공유</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
