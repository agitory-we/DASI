'use client';

import React, { useState } from 'react';
import {
  Film,
  Sun,
  Truck,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Sliders,
  Sparkles,
  Maximize2,
  RotateCcw
} from 'lucide-react';
import { playShutterSound } from '@/utils/shutterAudio';

interface FilmOrder {
  id: string;
  rollName: string;
  filmType: string;
  labName: string;
  dropStation: string;
  status: 'developing' | 'scanned';
  currentStage: number; // 1 to 5
  estimatedCompletion: string;
  scannedPhotos: string[];
}

const DEFAULT_ORDERS: FilmOrder[] = [
  {
    id: 'ROLL-202610-0914',
    rollName: '을지로 골든아워 선셋 & 철공소 골목 36컷',
    filmType: 'Kodak Portra 400 (C-41 컬러)',
    labName: '고래사진관 충무로점 (Noritsu HS-1800)',
    dropStation: '을지로3가역 4번출구 명장 수선대 자판기 드롭박스',
    status: 'scanned',
    currentStage: 5,
    estimatedCompletion: '오늘 21:00 완료',
    scannedPhotos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80',
    ]
  },
  {
    id: 'ROLL-202610-1002',
    rollName: '성수 붉은벽돌 아틀리에 스냅 24컷',
    filmType: 'Fuji Color C200 (C-41 컬러)',
    labName: '망우삼림 을지로점 (Fuji Frontier SP-3000)',
    dropStation: '성수 연무장길 아틀리에 무인 큐브 드롭박스',
    status: 'developing',
    currentStage: 3,
    estimatedCompletion: '내일 14:00 완료 예정',
    scannedPhotos: []
  }
];

export const DarkroomLiveViewer: React.FC = () => {
  const [orders] = useState<FilmOrder[]>(DEFAULT_ORDERS);
  const [isLightTableOn, setIsLightTableOn] = useState<boolean>(true);
  const [activeFrameIndex, setActiveFrameIndex] = useState<number>(0);
  const [isLoupeInverted, setIsLoupeInverted] = useState<boolean>(true);

  const stages = [
    { num: 1, label: '드롭박스 수거', desc: '14:00/19:00 특급 수거' },
    { num: 2, label: '충무로 랩 도착', desc: '바코드 등록 및 세척' },
    { num: 3, label: 'C-41 화학 현상', desc: '정밀 온도 암실 침지' },
    { num: 4, label: 'Noritsu 고속 스캔', desc: '16-bit 무압축 스캔' },
    { num: 5, label: '스캔 완료 / 다운로드', desc: '고해상도 원본 패키징' }
  ];

  const currentOrder = orders[0];

  const handleToggleLight = () => {
    playShutterSound('compact');
    setIsLightTableOn(!isLightTableOn);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-vintage-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-terracotta font-bold mb-1">
            <Film className="w-3.5 h-3.5 text-terracotta" />
            <span>DARKROOM LIVE & LIGHTBOX PIPELINE</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-vintage-900">
            충무로 암실 라이브 트래커 & 네거티브 뷰어
          </h2>
          <p className="text-xs text-vintage-600 mt-0.5">
            자판기 드롭박스 및 제휴 현상소에 맡긴 필름의 화학 공정 현황과 35mm 스트립을 확인합니다.
          </p>
        </div>

        {/* Light Table Switch */}
        <button
          onClick={handleToggleLight}
          className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 shadow-2xs ${
            isLightTableOn
              ? 'bg-amber-100 border-amber-300 text-amber-950'
              : 'bg-stone-800 border-stone-700 text-stone-300'
          }`}
        >
          <Sun className={`w-4 h-4 ${isLightTableOn ? 'text-amber-600' : 'text-stone-500'}`} />
          <span>라이트박스 조명: {isLightTableOn ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Active Order Stage Visualizer */}
      <div className="p-6 rounded-3xl bg-white border border-vintage-200/90 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-vintage-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                주문번호: {currentOrder.id}
              </span>
              <span className="text-xs text-vintage-500 font-mono">{currentOrder.filmType}</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-vintage-900 mt-1">
              {currentOrder.rollName}
            </h3>
            <div className="text-xs text-vintage-500 mt-0.5">
              접수처: {currentOrder.dropStation} · {currentOrder.labName}
            </div>
          </div>

          <div className="text-right">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{currentOrder.status === 'scanned' ? '스캔 완료 (전 컷 다운로드 가능)' : '현상 진행 중'}</span>
            </span>
          </div>
        </div>

        {/* 5-Stage Step Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {stages.map((st) => {
            const isCompleted = currentOrder.currentStage >= st.num;
            const isCurrent = currentOrder.currentStage === st.num;
            return (
              <div
                key={st.num}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'border-terracotta bg-terracotta/5 shadow-2xs'
                    : isCompleted
                    ? 'border-vintage-200 bg-vintage-50 text-vintage-800'
                    : 'border-vintage-100 bg-white text-vintage-400 opacity-50'
                }`}
              >
                <div
                  className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                    isCurrent
                      ? 'bg-terracotta text-white animate-pulse'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-vintage-100 text-vintage-400'
                  }`}
                >
                  {st.num}
                </div>
                <div className="text-xs font-bold">{st.label}</div>
                <div className="text-[10px] text-vintage-500 mt-0.5">{st.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox 35mm Negative Film Strip Simulation */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border transition-all duration-500 relative overflow-hidden ${
          isLightTableOn
            ? 'bg-[#ffffff] border-amber-300 shadow-2xl ring-4 ring-amber-100'
            : 'bg-stone-950 border-stone-800 shadow-inner'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-stone-500">
              5000K Daylight Light Table
            </span>
            <span className="text-[11px] text-amber-700 font-mono">
              [35mm Negative Film Strip #01-04]
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLoupeInverted(!isLoupeInverted)}
              className="px-3 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-mono font-bold flex items-center gap-1"
            >
              <Eye className="w-3 h-3 text-terracotta" />
              <span>{isLoupeInverted ? '포지티브(컬러) 반전 보기' : '네거티브(원형) 보기'}</span>
            </button>
          </div>
        </div>

        {/* The 35mm Film Strip */}
        <div className="bg-[#1f1915] p-3 rounded-2xl border-4 border-stone-900 shadow-2xl overflow-x-auto">
          {/* Top Sprocket Holes */}
          <div className="flex gap-2 mb-2 px-2">
            {Array.from({ length: 28 }).map((_, i) => (
              <div key={i} className="w-3.5 h-2.5 rounded-sm bg-stone-950 shrink-0 border border-stone-800" />
            ))}
          </div>

          {/* Film Frames Grid */}
          <div className="flex gap-4 px-2">
            {currentOrder.scannedPhotos.map((photo, idx) => (
              <div
                key={idx}
                onClick={() => setActiveFrameIndex(idx)}
                className={`relative aspect-[3/2] w-48 sm:w-64 rounded-lg overflow-hidden shrink-0 cursor-pointer border-2 transition-all group ${
                  activeFrameIndex === idx ? 'border-amber-400 scale-105' : 'border-stone-800'
                }`}
              >
                <img
                  src={photo}
                  alt={`Frame ${idx + 1}`}
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    isLoupeInverted && activeFrameIndex === idx
                      ? 'filter-none scale-100'
                      : 'invert hue-rotate-180 sepia-[.6] brightness-90 contrast-125'
                  }`}
                />
                <div className="absolute top-1 left-2 font-mono text-[9px] text-amber-400 font-bold">
                  {idx + 1}A · KODAK 400
                </div>
                {activeFrameIndex === idx && (
                  <div className="absolute bottom-1 right-2 px-2 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white">
                    LOUPE ACTIVE
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Sprocket Holes */}
          <div className="flex gap-2 mt-2 px-2">
            {Array.from({ length: 28 }).map((_, i) => (
              <div key={i} className="w-3.5 h-2.5 rounded-sm bg-stone-950 shrink-0 border border-stone-800" />
            ))}
          </div>
        </div>

        {/* Selected Frame Action Bar */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-stone-200">
          <div className="text-xs text-stone-600 font-sans">
            선택된 컷: <strong>#{activeFrameIndex + 1} 프레임</strong> (Noritsu 4000x2667px 고해상도 스캔)
          </div>

          <div className="flex items-center gap-2">
            <a
              href={currentOrder.scannedPhotos[activeFrameIndex]}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>현재 컷 고화질 다운로드</span>
            </a>
            <button
              onClick={() => playShutterSound('slr')}
              className="px-4 py-2 rounded-xl bg-terracotta hover:bg-terracotta-light text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>전 컷 압축 ZIP 다운로드 (36장)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
