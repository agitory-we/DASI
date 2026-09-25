'use client';

import React, { useState, useEffect } from 'react';
import { AnalogSpot } from '@/types';
import { MapPin, Navigation, ExternalLink, Maximize2, Minimize2, Sparkles, Compass } from 'lucide-react';

interface GoogleMapCanvasProps {
  activeSpot: AnalogSpot;
  onOpenNavigation?: (spot: AnalogSpot, service: 'google' | 'kakao' | 'naver') => void;
}

export const GoogleMapCanvas: React.FC<GoogleMapCanvasProps> = ({
  activeSpot,
  onOpenNavigation,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(16);

  // activeSpot 변경 시 로딩 상태 리셋
  useEffect(() => {
    setIsLoading(true);
  }, [activeSpot.id]);

  const handleOpenNav = (service: 'google' | 'kakao' | 'naver') => {
    if (onOpenNavigation) {
      onOpenNavigation(activeSpot, service);
      return;
    }

    if (service === 'google') {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${activeSpot.lat},${activeSpot.lng}&destination_place_id=${encodeURIComponent(
          activeSpot.name
        )}`,
        '_blank'
      );
    } else if (service === 'kakao') {
      window.open(
        `https://map.kakao.com/link/to/${encodeURIComponent(activeSpot.name)},${activeSpot.lat},${activeSpot.lng}`,
        '_blank'
      );
    } else {
      window.open(
        `https://map.naver.com/v5/search/${encodeURIComponent(activeSpot.address || activeSpot.name)}`,
        '_blank'
      );
    }
  };

  // Google Maps Embed URL (좌표 기반 실시간 인터랙티브 맵)
  const embedUrl = `https://maps.google.com/maps?q=${activeSpot.lat},${activeSpot.lng}&hl=ko&z=${zoomLevel}&output=embed`;

  return (
    <div
      className={`relative w-full overflow-hidden bg-stone-900 border-b border-vintage-200 transition-all duration-300 ${
        isExpanded ? 'h-[500px]' : 'aspect-16/9 sm:aspect-21/9 min-h-[300px]'
      }`}
    >
      {/* 1. Loading Skeleton Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-stone-900/90 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-terracotta/20 border border-terracotta/40 flex items-center justify-center animate-pulse">
            <Compass className="w-5 h-5 text-terracotta animate-spin" />
          </div>
          <div className="text-xs font-medium text-vintage-300">
            구글 맵 실시간 로딩 중... ({activeSpot.name})
          </div>
        </div>
      )}

      {/* 2. Interactive Google Maps Iframe Viewport */}
      <iframe
        key={`${activeSpot.id}-${zoomLevel}`}
        src={embedUrl}
        title={`Google Map - ${activeSpot.name}`}
        onLoad={() => setIsLoading(false)}
        className="w-full h-full border-0 filter contrast-[1.02] saturate-[1.05]"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* 3. Top Floating Glassmorphism Badge */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-stone-950/80 backdrop-blur-md border border-white/15 text-white shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold tracking-tight">Google Maps 실시간 뷰</span>
          <span className="text-white/30">|</span>
          <span className="text-[11px] text-amber-300 font-medium truncate max-w-[140px] sm:max-w-xs">
            {activeSpot.name}
          </span>
        </div>

        {/* Viewport Resize Toggle Button */}
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="pointer-events-auto p-2 rounded-xl bg-stone-950/80 hover:bg-stone-900 backdrop-blur-md border border-white/15 text-white/80 hover:text-white transition shadow-lg"
          title={isExpanded ? '지도 축소' : '지도 넓게 보기'}
        >
          {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* 4. Bottom Floating Action Pill (Google / Kakao / Naver Navigation) */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-[10px] text-white/90 font-mono border border-white/10">
          <MapPin className="w-3 h-3 text-terracotta" />
          <span>
            {activeSpot.lat.toFixed(4)}, {activeSpot.lng.toFixed(4)}
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5 ml-auto">
          {/* Google Maps Direct Navigation Button */}
          <button
            onClick={() => handleOpenNav('google')}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1 border border-blue-400/40"
            title="Google 지도에서 크게보기 및 길찾기"
          >
            <span>Google 지도 길찾기</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          {/* Kakao Map */}
          <button
            onClick={() => handleOpenNav('kakao')}
            className="px-2.5 py-1.5 rounded-xl bg-[#FEE500] hover:bg-[#F0D700] text-[#3B1E08] font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1"
            title="카카오맵으로 길찾기"
          >
            <span>카카오맵</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          {/* Naver Map */}
          <button
            onClick={() => handleOpenNav('naver')}
            className="px-2.5 py-1.5 rounded-xl bg-[#03C75A] hover:bg-[#02B150] text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1"
            title="네이버 지도로 길찾기"
          >
            <span>네이버 지도</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
