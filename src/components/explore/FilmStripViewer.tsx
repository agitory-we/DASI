'use client';

import React, { useState } from 'react';
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
  ChevronRight
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

              {/* 프레임 생성기로 이동 버튼 */}
              <a
                href="/frame"
                className="px-4 py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs shrink-0"
              >
                <span>이 사진에 프레임 입히기 →</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
