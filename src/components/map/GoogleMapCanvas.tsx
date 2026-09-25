'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnalogSpot, SpotCategory } from '@/types';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Maximize2,
  Minimize2,
  Compass,
  Layers,
  Sparkles
} from 'lucide-react';

interface GoogleMapCanvasProps {
  activeSpot: AnalogSpot;
  spots?: AnalogSpot[];
  onSelectSpot?: (spot: AnalogSpot) => void;
  onOpenNavigation?: (spot: AnalogSpot, service: 'google' | 'kakao' | 'naver') => void;
}

// 카테고리별 마커 스타일 및 배지 아이콘
const CATEGORY_STYLES: Record<string, { bg: string; border: string; icon: string; label: string }> = {
  lab: { bg: 'bg-purple-600', border: 'border-purple-300', icon: '🧪', label: '당일현상소' },
  film_shop: { bg: 'bg-amber-600', border: 'border-amber-300', icon: '🎞️', label: '필름샵' },
  vending_machine: { bg: 'bg-emerald-600', border: 'border-emerald-300', icon: '⚡', label: '24시 자판기' },
  repair: { bg: 'bg-blue-600', border: 'border-blue-300', icon: '🔧', label: '명장수리실' },
  pickup: { bg: 'bg-stone-700', border: 'border-stone-400', icon: '📷', label: '대여/픽업' },
  default: { bg: 'bg-terracotta', border: 'border-orange-300', icon: '📍', label: '출사지' }
};

export const GoogleMapCanvas: React.FC<GoogleMapCanvasProps> = ({
  activeSpot,
  spots = [],
  onSelectSpot,
  onOpenNavigation,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(15);
  const [mapEngine, setMapEngine] = useState<'multi' | 'single_embed'>('multi');
  const [isLoading, setIsLoading] = useState(true);

  // Leaflet 인스턴스 보관
  const leafletMapRef = useRef<any>(null);
  const leafletMarkersRef = useRef<any[]>([]);

  // 표시할 스팟 리스트 (activeSpot 포함 보장)
  const displaySpots = React.useMemo(() => {
    if (spots.length === 0) return [activeSpot];
    const exists = spots.some((s) => s.id === activeSpot.id);
    return exists ? spots : [activeSpot, ...spots];
  }, [spots, activeSpot]);

  const handleOpenNav = useCallback((spot: AnalogSpot, service: 'google' | 'kakao' | 'naver') => {
    if (onOpenNavigation) {
      onOpenNavigation(spot, service);
      return;
    }

    if (service === 'google') {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}&destination_place_id=${encodeURIComponent(
          spot.name
        )}`,
        '_blank'
      );
    } else if (service === 'kakao') {
      window.open(
        `https://map.kakao.com/link/to/${encodeURIComponent(spot.name)},${spot.lat},${spot.lng}`,
        '_blank'
      );
    } else {
      window.open(
        `https://map.naver.com/v5/search/${encodeURIComponent(spot.address || spot.name)}`,
        '_blank'
      );
    }
  }, [onOpenNavigation]);

  // 마커 렌더링 함수
  const renderMarkers = useCallback((map: any, L: any) => {
    if (!map || !L) return;

    // 기존 마커 정리
    leafletMarkersRef.current.forEach((m) => map.removeLayer(m));
    leafletMarkersRef.current = [];

    displaySpots.forEach((spot) => {
      const isSelected = spot.id === activeSpot.id;
      const catStyle = CATEGORY_STYLES[spot.category] || CATEGORY_STYLES.default;

      // 커스텀 HTML 마커
      const customIcon = L.divIcon({
        className: 'custom-spot-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200 ${
            isSelected ? 'scale-125 z-50' : 'hover:scale-115 z-10'
          }">
            ${
              isSelected
                ? '<div class="absolute -inset-2 rounded-full bg-terracotta/40 animate-ping"></div>'
                : ''
            }
            <div class="w-8 h-8 rounded-full ${catStyle.bg} border-2 ${
          isSelected ? 'border-white ring-4 ring-terracotta shadow-xl' : `${catStyle.border} shadow-md`
        } flex items-center justify-center text-white text-xs font-bold">
              <span>${catStyle.icon}</span>
            </div>
            ${
              isSelected
                ? `<div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-stone-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md border border-white/20">
                     ${spot.name}
                   </div>`
                : ''
            }
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -20],
      });

      const marker = L.marker([spot.lat, spot.lng], { icon: customIcon }).addTo(map);

      // 마커 팝업 (인포윈도우)
      const popupHtml = `
        <div style="font-family: sans-serif; padding: 4px; min-width: 190px; color: #1c1917;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="font-size: 13px;">${catStyle.icon}</span>
            <strong style="font-size: 13px;">${spot.name}</strong>
            ${spot.isPartner || spot.isMicroAdPartner || spot.hasQrDiscount ? '<span style="font-size: 9px; padding: 2px 4px; border-radius: 4px; background: #fef3c7; color: #92400e; font-weight: bold;">제휴</span>' : ''}
          </div>
          <div style="font-size: 11px; color: #78716c; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${spot.address || spot.area}
          </div>
          <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; color: #44403c; margin-bottom: 8px;">
            <span>★ ${spot.rating ? spot.rating.toFixed(1) : '4.8'}</span>
            ${spot.sameDayAvailable ? '<span style="color: #059669; font-weight: bold;">● 당일현상</span>' : ''}
          </div>
          <div style="display: flex; gap: 4px;">
            <button id="nav-btn-g-${spot.id}" style="flex: 1; padding: 4px 6px; border-radius: 8px; background: #2563eb; color: white; font-size: 10px; font-weight: bold; border: none; cursor: pointer;">
              Google 길찾기
            </button>
            <button id="nav-btn-k-${spot.id}" style="flex: 1; padding: 4px 6px; border-radius: 8px; background: #fee500; color: #3b1e08; font-size: 10px; font-weight: bold; border: none; cursor: pointer;">
              카카오맵
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      // 마커 클릭 시 스팟 선택
      marker.on('click', () => {
        if (onSelectSpot) {
          onSelectSpot(spot);
        }
      });

      // 팝업 길찾기 버튼 바인딩
      marker.on('popupopen', () => {
        const gBtn = document.getElementById(`nav-btn-g-${spot.id}`);
        const kBtn = document.getElementById(`nav-btn-k-${spot.id}`);
        if (gBtn) gBtn.onclick = () => handleOpenNav(spot, 'google');
        if (kBtn) kBtn.onclick = () => handleOpenNav(spot, 'kakao');
      });

      leafletMarkersRef.current.push(marker);
    });
  }, [displaySpots, activeSpot.id, onSelectSpot, handleOpenNav]);

  // Leaflet 라이브러리 동적 로드 및 맵 초기화
  useEffect(() => {
    if (mapEngine !== 'multi') return;

    let isMounted = true;

    const loadLeaflet = async () => {
      // Leaflet CSS 주입
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Leaflet JS 주입
      if (!(window as any).L) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.async = true;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        }).catch((err) => {
          console.warn('[GoogleMapCanvas] Leaflet load failed, falling back:', err);
          if (isMounted) setMapEngine('single_embed');
        });
      }

      if (!isMounted || !containerRef.current || !(window as any).L) return;

      const L = (window as any).L;

      // 기존 맵 인스턴스 정리
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }

      try {
        const map = L.map(containerRef.current, {
          center: [activeSpot.lat, activeSpot.lng],
          zoom: zoomLevel,
          zoomControl: false,
        });

        // 타일 레이어 추가
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        leafletMapRef.current = map;
        setIsLoading(false);

        // 마커 렌더링
        renderMarkers(map, L);
      } catch (err) {
        console.error('[GoogleMapCanvas] Map init error:', err);
        setIsLoading(false);
      }
    };

    loadLeaflet();

    return () => {
      isMounted = false;
    };
  }, [mapEngine]);

  // activeSpot 변경 시 마커 갱신 및 부드러운 카메라 이동
  useEffect(() => {
    if (!leafletMapRef.current || !(window as any).L) return;
    const map = leafletMapRef.current;
    const L = (window as any).L;

    renderMarkers(map, L);

    map.flyTo([activeSpot.lat, activeSpot.lng], Math.max(map.getZoom(), 15), {
      duration: 0.8,
    });
  }, [activeSpot, renderMarkers]);

  // displaySpots 변경 시 마커 재렌더링
  useEffect(() => {
    if (!leafletMapRef.current || !(window as any).L) return;
    const map = leafletMapRef.current;
    const L = (window as any).L;
    renderMarkers(map, L);
  }, [displaySpots, renderMarkers]);

  // 전체 스팟 한눈에 맞추기 (Fit Bounds)
  const handleFitAllSpots = () => {
    if (!leafletMapRef.current || !(window as any).L || displaySpots.length === 0) return;
    const L = (window as any).L;
    const bounds = L.latLngBounds(displaySpots.map((s) => [s.lat, s.lng]));
    leafletMapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
  };

  // Google Maps 단일 임베드 URL
  const singleEmbedUrl = `https://maps.google.com/maps?q=${activeSpot.lat},${activeSpot.lng}&hl=ko&z=${zoomLevel}&output=embed`;

  return (
    <div
      className={`relative w-full overflow-hidden bg-stone-900 border-b border-vintage-200 transition-all duration-300 ${
        isExpanded ? 'h-[540px]' : 'aspect-16/9 sm:aspect-21/9 min-h-[320px]'
      }`}
    >
      {/* 1. Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-stone-900/90 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-terracotta/20 border border-terracotta/40 flex items-center justify-center animate-pulse">
            <Compass className="w-5 h-5 text-terracotta animate-spin" />
          </div>
          <div className="text-xs font-medium text-vintage-300">
            실시간 다중 장소 핀 로딩 중... ({displaySpots.length}곳)
          </div>
        </div>
      )}

      {/* 2. Map Canvas Viewport */}
      {mapEngine === 'multi' ? (
        <div
          ref={containerRef}
          className="w-full h-full z-0 cursor-grab active:cursor-grabbing"
          style={{ minHeight: '300px' }}
        />
      ) : (
        <iframe
          key={`${activeSpot.id}-${zoomLevel}`}
          src={singleEmbedUrl}
          title={`Google Map - ${activeSpot.name}`}
          onLoad={() => setIsLoading(false)}
          className="w-full h-full border-0 filter contrast-[1.02] saturate-[1.05]"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}

      {/* 3. Top Floating Glassmorphism Badge & Controls */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between pointer-events-none gap-2">
        <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-stone-950/85 backdrop-blur-md border border-white/15 text-white shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-[11px] font-bold tracking-tight shrink-0">
            {mapEngine === 'multi' ? `다중 장소 뷰 (${displaySpots.length}곳)` : '단일 상세 뷰'}
          </span>
          <span className="text-white/30 shrink-0">|</span>
          <span className="text-[11px] text-amber-300 font-medium truncate max-w-[130px] sm:max-w-[200px]">
            {activeSpot.name}
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5 ml-auto">
          {/* 전체 스팟 한눈에 맞추기 버튼 */}
          {mapEngine === 'multi' && displaySpots.length > 1 && (
            <button
              onClick={handleFitAllSpots}
              className="px-2.5 py-1.5 rounded-xl bg-stone-950/85 hover:bg-stone-900 border border-white/15 text-amber-300 text-[10px] font-bold backdrop-blur-md transition shadow-lg flex items-center gap-1 active:scale-95"
              title="지도에 있는 모든 스팟을 한눈에 볼 수 있도록 지도 범위를 맞춥니다"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>전체 {displaySpots.length}곳 보기</span>
            </button>
          )}

          {/* 엔진 토글 */}
          <button
            onClick={() => setMapEngine((prev) => (prev === 'multi' ? 'single_embed' : 'multi'))}
            className="px-2.5 py-1.5 rounded-xl bg-stone-950/85 hover:bg-stone-900 border border-white/15 text-white/80 hover:text-white text-[10px] font-semibold backdrop-blur-md transition shadow-lg flex items-center gap-1"
            title="다중 장소 핀 뷰와 구글 단일 뷰를 전환합니다"
          >
            <Layers className="w-3 h-3 text-terracotta" />
            <span>{mapEngine === 'multi' ? '단일 Google 맵' : '다중 핀 맵'}</span>
          </button>

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

      {/* 4. Bottom Floating Action Pill (Google / Kakao / Naver Navigation) */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md text-[10px] text-white/90 border border-white/15">
          <div className="flex items-center gap-1 text-terracotta font-bold">
            <MapPin className="w-3.5 h-3.5" />
            <span>선택: {activeSpot.name}</span>
          </div>
          <span className="text-white/30">·</span>
          <span className="font-mono text-white/70">
            {activeSpot.lat.toFixed(4)}, {activeSpot.lng.toFixed(4)}
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5 ml-auto">
          {/* Google Maps Direct Navigation Button */}
          <button
            onClick={() => handleOpenNav(activeSpot, 'google')}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1 border border-blue-400/40"
            title="Google 지도에서 크게보기 및 길찾기"
          >
            <span>Google 지도 길찾기</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          {/* Kakao Map */}
          <button
            onClick={() => handleOpenNav(activeSpot, 'kakao')}
            className="px-2.5 py-1.5 rounded-xl bg-[#FEE500] hover:bg-[#F0D700] text-[#3B1E08] font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1"
            title="카카오맵으로 길찾기"
          >
            <span>카카오맵</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          {/* Naver Map */}
          <button
            onClick={() => handleOpenNav(activeSpot, 'naver')}
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
