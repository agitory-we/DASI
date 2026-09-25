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

  // Google Maps API Key (옵션: .env.local의 NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  // 기본 모드는 오류 없이 100% 렌더링되는 'standard' (무료 표준 임베드)
  // 사용자가 API 키를 등록하고 Cloud v1 모드로 시험해보고 싶다면 토글 가능
  const [useCloudApi, setUseCloudApi] = useState(false);
  const [showKeyGuide, setShowKeyGuide] = useState(false);

  // Google Maps Embed URL
  // standard: API 키 및 과금 제한 없이 언제나 100% 작동하는 Google 공식 쿼리 임베드
  // cloud: Google Cloud Console에서 Maps Embed API가 활성화되었을 때 작동하는 v1 place API
  const embedUrl = useCloudApi && apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${activeSpot.lat},${activeSpot.lng}&zoom=${zoomLevel}&language=ko`
    : `https://maps.google.com/maps?q=${activeSpot.lat},${activeSpot.lng}&hl=ko&z=${zoomLevel}&output=embed`;

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
        key={`${activeSpot.id}-${zoomLevel}-${useCloudApi ? 'cloud' : 'std'}`}
        src={embedUrl}
        title={`Google Map - ${activeSpot.name}`}
        onLoad={() => setIsLoading(false)}
        className="w-full h-full border-0 filter contrast-[1.02] saturate-[1.05]"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* 3. Top Floating Glassmorphism Badge & Mode Selector */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none gap-2">
        <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-stone-950/85 backdrop-blur-md border border-white/15 text-white shadow-lg max-w-[75%] truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-[11px] font-bold tracking-tight shrink-0">Google Maps</span>
          <span className="text-white/30 shrink-0">|</span>
          <span className="text-[11px] text-amber-300 font-medium truncate">
            {activeSpot.name}
          </span>
          {apiKey && (
            <button
              onClick={() => setUseCloudApi((prev) => !prev)}
              className={`ml-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold transition border ${
                useCloudApi
                  ? 'bg-blue-600/80 border-blue-400 text-white'
                  : 'bg-white/10 hover:bg-white/20 border-white/20 text-white/80'
              }`}
              title={useCloudApi ? 'Cloud v1 API 모드 사용 중' : '표준 Google 맵 모드 (클릭하여 Cloud API 전환)'}
            >
              {useCloudApi ? 'v1 API' : '표준 모드'}
            </button>
          )}
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5 shrink-0">
          {apiKey && useCloudApi && (
            <button
              onClick={() => setShowKeyGuide(true)}
              className="px-2 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-[10px] font-medium transition"
              title="403 오류 해결 방법 보기"
            >
              403 도움말
            </button>
          )}
          {/* Viewport Resize Toggle Button */}
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-2 rounded-xl bg-stone-950/80 hover:bg-stone-900 backdrop-blur-md border border-white/15 text-white/80 hover:text-white transition shadow-lg"
            title={isExpanded ? '지도 축소' : '지도 넓게 보기'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 403 API Key Guide Modal */}
      {showKeyGuide && (
        <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-vintage-700/60 rounded-2xl p-5 max-w-md w-full shadow-2xl text-left space-y-3 text-white text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <span className="font-bold text-amber-400 text-sm">💡 구글 맵 403 오류 해결 방법</span>
              <button
                onClick={() => setShowKeyGuide(false)}
                className="text-stone-400 hover:text-white text-base leading-none p-1"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-stone-300 leading-relaxed">
              <p>
                Google Cloud 콘솔에서 발급한 API 키로 Embed API 호출 시 <strong>403 Forbidden</strong>이 발생하는 경우:
              </p>
              <ol className="list-decimal list-inside space-y-1 bg-stone-950/50 p-2.5 rounded-xl border border-stone-800">
                <li><a href="https://console.cloud.google.com/apis/library/maps-embed-backend.googleapis.com" target="_blank" rel="noreferrer" className="text-blue-400 underline">Google Cloud Console</a> 접속</li>
                <li><strong>&apos;Maps Embed API&apos;</strong> 검색 후 <strong>[사용 설정(Enable)]</strong> 클릭</li>
                <li>API 키 제한사항(HTTP 리퍼러)에 <code>http://localhost:*/*</code> 허용 추가</li>
              </ol>
              <p className="text-vintage-400 text-[11px]">
                설정 전까지는 상단의 <strong>[표준 모드]</strong> 버튼을 누르면 API 키/과금 제한 없이 구글 지도를 100% 정상 이용할 수 있습니다.
              </p>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  setUseCloudApi(false);
                  setShowKeyGuide(false);
                }}
                className="px-3 py-1.5 bg-terracotta text-white rounded-xl font-bold hover:bg-terracotta-dark transition"
              >
                표준 지도로 즉시 보기
              </button>
              <button
                onClick={() => setShowKeyGuide(false)}
                className="px-3 py-1.5 bg-stone-800 text-stone-300 rounded-xl hover:bg-stone-700 transition"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

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
