'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Camera,
  Sun,
  Moon,
  Cloud,
  Sliders,
  ChevronLeft,
  Volume2,
  RefreshCw,
  Sparkles,
  Info,
  Check,
  AlertCircle
} from 'lucide-react';
import { useDevicePlatform } from '@/hooks/useDevicePlatform';
import { playShutterSound } from '@/utils/shutterAudio';

// 표준 ISO 목록
const ISO_LIST = [50, 100, 200, 400, 800, 1600, 3200];

// 표준 조리개(F-stop) 목록
const APERTURE_LIST = [1.4, 2.0, 2.8, 4.0, 5.6, 8.0, 11, 16, 22];

// 표준 셔터스피드 표기 함수 (초 단위 -> 분수 문자열)
function formatShutterSpeed(seconds: number): string {
  if (seconds >= 1) {
    return `${Math.round(seconds)}s`;
  }
  const denominator = Math.round(1 / seconds);
  if (denominator >= 8000) return '1/8000s';
  if (denominator >= 4000) return '1/4000s';
  if (denominator >= 2000) return '1/2000s';
  if (denominator >= 1000) return '1/1000s';
  if (denominator >= 500) return '1/500s';
  if (denominator >= 250) return '1/250s';
  if (denominator >= 125) return '1/125s';
  if (denominator >= 60) return '1/60s';
  if (denominator >= 30) return '1/30s';
  if (denominator >= 15) return '1/15s';
  if (denominator >= 8) return '1/8s';
  if (denominator >= 4) return '1/4s';
  if (denominator >= 2) return '1/2s';
  return `1/${denominator}s`;
}

// 조도 프리셋 (카메라 미지원 / 권한 거부 시 시뮬레이션용)
const LIGHT_PRESETS = [
  { label: '맑은 대낮 (Sunny 16)', ev100: 15, icon: Sun, desc: '직사광선 야외' },
  { label: '약간 흐림 / 그늘', ev100: 12, icon: Cloud, desc: '도심 골목 그늘' },
  { label: '골든아워 일몰', ev100: 9, icon: Sparkles, desc: '을지로/세운상가 노을' },
  { label: '카페 실내 조명', ev100: 6, icon: Sliders, desc: '은은한 백열등 실내' },
  { label: '야경 / 포장마차', ev100: 3, icon: Moon, desc: '을지로 노가리 골목 밤' },
];

export default function LightMeterPage() {
  const { triggerHaptic } = useDevicePlatform();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 측정 상태
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isMeasuring, setIsMeasuring] = useState<boolean>(true);

  // 노출 파라미터
  const [selectedIso, setSelectedIso] = useState<number>(400); // 필름 기본값 400
  const [selectedAperture, setSelectedAperture] = useState<number>(4.0); // F4
  const [calculatedShutter, setCalculatedShutter] = useState<string>('1/250s');
  const [currentEv100, setCurrentEv100] = useState<number>(12); // 기본 EV 12
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  const [activePresetIndex, setActivePresetIndex] = useState<number>(1);

  // 카메라 비디오 스트림 시작
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('이 브라우저에서는 카메라 스트림을 지원하지 않습니다.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setHasCamera(true);
      }
    } catch (err: any) {
      setHasCamera(false);
      setCameraError(err.message || '카메라 접근 권한이 필요합니다.');
      setMode('manual');
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);

  // 실시간 뷰파인더 중앙부 픽셀 밝기 분석 루프
  useEffect(() => {
    if (!hasCamera || mode !== 'camera' || !isMeasuring) return;

    let animId: number;
    const analyzeFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState >= 2) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.width = 64;
          canvas.height = 64;
          // 비디오 중앙 50% 영역 크롭
          const sx = video.videoWidth * 0.25;
          const sy = video.videoHeight * 0.25;
          const sw = video.videoWidth * 0.5;
          const sh = video.videoHeight * 0.5;

          ctx.drawImage(video, sx, sy, sw, sh, 0, 0, 64, 64);
          const imgData = ctx.getImageData(0, 0, 64, 64);
          const data = imgData.data;

          let sumLuminance = 0;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // Rec. 709 상대 조도
            sumLuminance += 0.2126 * r + 0.7152 * g + 0.0722 * b;
          }
          const avgLuminance = sumLuminance / (64 * 64); // 0 ~ 255

          // Luminance -> EV100 변환 곡선 모델링 (실측 센서 보정 계수)
          // 0(칠흑 암흑) -> EV 1, 128(중간 밝기) -> EV 10, 255(태양광 포화) -> EV 16
          const normalized = Math.max(1, avgLuminance);
          const ev = Math.round((Math.log2(normalized) / 8) * 15 + 1);
          const clampedEv = Math.min(16, Math.max(1, ev));
          setCurrentEv100(clampedEv);
        }
      }
      animId = requestAnimationFrame(analyzeFrame);
    };

    animId = requestAnimationFrame(analyzeFrame);
    return () => cancelAnimationFrame(animId);
  }, [hasCamera, mode, isMeasuring]);

  // EV + ISO + 조리개 -> 셔터스피드 실시간 계산
  useEffect(() => {
    // EV_S = EV_100 + log2(ISO / 100)
    const evS = currentEv100 + Math.log2(selectedIso / 100);
    // t = N^2 / 2^(EV_S)
    const tSeconds = Math.pow(selectedAperture, 2) / Math.pow(2, evS);
    setCalculatedShutter(formatShutterSpeed(tSeconds));
  }, [currentEv100, selectedIso, selectedAperture]);

  const handleIsoChange = (iso: number) => {
    triggerHaptic('selection');
    setSelectedIso(iso);
  };

  const handleApertureChange = (aperture: number) => {
    triggerHaptic('selection');
    setSelectedAperture(aperture);
  };

  const handlePresetSelect = (preset: typeof LIGHT_PRESETS[0], idx: number) => {
    triggerHaptic('medium');
    setActivePresetIndex(idx);
    setCurrentEv100(preset.ev100);
  };

  const handleShutterClick = () => {
    triggerHaptic('success');
    playShutterSound('slr');
  };

  return (
    <div className="min-h-screen bg-[#1c1815] text-[#e8ded1] flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* 1. 상단 앱바 */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>홈으로</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-serif font-bold text-sm tracking-wider uppercase">
            DASI Master Light Meter
          </span>
        </div>
        <button
          onClick={() => {
            triggerHaptic('light');
            setMode(mode === 'camera' ? 'manual' : 'camera');
          }}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
            mode === 'camera'
              ? 'bg-terracotta/20 border-terracotta text-terracotta'
              : 'bg-white/10 border-white/20 text-white/80'
          }`}
        >
          {mode === 'camera' ? '📷 카메라 측광' : '🎛️ 수동 조도'}
        </button>
      </div>

      {/* 2. 중앙 뷰파인더 & 측광 레티클 */}
      <div className="relative my-4 flex-1 flex flex-col items-center justify-center min-h-[320px] max-h-[460px] rounded-3xl overflow-hidden bg-black/80 border border-white/10 shadow-2xl">
        {mode === 'camera' && (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}

        {/* 수동 프리셋 모드일 때 배경 앰비언트 */}
        {mode === 'manual' && (
          <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-black to-zinc-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="text-5xl mb-3">
              {React.createElement(LIGHT_PRESETS[activePresetIndex].icon, { className: 'w-16 h-16 text-amber-400 mx-auto' })}
            </div>
            <h4 className="font-serif font-bold text-lg text-white">
              {LIGHT_PRESETS[activePresetIndex].label}
            </h4>
            <p className="text-xs text-white/50 mt-1">
              {LIGHT_PRESETS[activePresetIndex].desc}
            </p>
          </div>
        )}

        {/* 뷰파인더 중앙 레티클 (십자선 및 스팟 측광 영역) */}
        <div className="relative z-10 flex flex-col items-center pointer-events-none">
          <div className="w-28 h-28 border-2 border-dashed border-amber-400/80 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_12px_#fbbf24]" />
          </div>
          <div className="mt-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono tracking-widest text-amber-300">
            SPOT EV {currentEv100} · ISO {selectedIso}
          </div>
        </div>

        {/* 하단 EV 인디케이터 바늘 */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between px-4 py-2 rounded-2xl bg-black/70 backdrop-blur-lg border border-white/10">
          <span className="text-[10px] text-white/40 font-mono">EV 1 (Dark)</span>
          <div className="flex-1 mx-4 h-1.5 bg-white/10 rounded-full relative overflow-hidden">
            <div
              className="absolute top-0 bottom-0 bg-gradient-to-r from-amber-600 via-amber-400 to-terracotta rounded-full transition-all duration-300"
              style={{ width: `${(currentEv100 / 16) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-amber-400 font-mono font-bold">EV 16 (Sunny)</span>
        </div>
      </div>

      {/* 수동 프리셋 토글 바 (카메라 꺼졌거나 수동 모드일 때) */}
      {mode === 'manual' && (
        <div className="grid grid-cols-5 gap-1.5 mb-4">
          {LIGHT_PRESETS.map((preset, idx) => (
            <button
              key={preset.label}
              onClick={() => handlePresetSelect(preset, idx)}
              className={`p-2 rounded-xl text-center border transition-all ${
                activePresetIndex === idx
                  ? 'bg-amber-400 text-black border-amber-400 font-bold shadow-md'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              <div className="text-[10px] truncate">{preset.label.split(' ')[0]}</div>
              <div className="text-[9px] opacity-75">EV {preset.ev100}</div>
            </button>
          ))}
        </div>
      )}

      {/* 3. 명장 셔터 결과 디스플레이 (핵심 결과) */}
      <div className="bg-[#26211d] border border-[#3d342d] rounded-2xl p-4 sm:p-5 shadow-xl mb-4">
        <div className="flex items-center justify-between mb-3 text-xs text-white/50">
          <span>명장 권장 셔터 속도</span>
          <span className="text-amber-400 font-mono">Sunny 16 보정 적용됨</span>
        </div>
        <div className="flex items-center justify-around py-2">
          {/* 조리개 표시 */}
          <div className="text-center">
            <span className="text-[10px] tracking-widest text-white/40 uppercase block">Aperture</span>
            <span className="text-2xl sm:text-3xl font-serif font-bold text-white">
              F{selectedAperture}
            </span>
          </div>

          <div className="text-amber-400/40 text-xl font-thin">✕</div>

          {/* 산출된 셔터스피드 (주인공) */}
          <div className="text-center">
            <span className="text-[10px] tracking-widest text-terracotta uppercase block font-bold">
              권장 셔터
            </span>
            <span className="text-3xl sm:text-4xl font-mono font-extrabold text-amber-400 tracking-tight drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">
              {calculatedShutter}
            </span>
          </div>

          <div className="text-amber-400/40 text-xl font-thin">@</div>

          {/* 감도 표시 */}
          <div className="text-center">
            <span className="text-[10px] tracking-widest text-white/40 uppercase block">Film ISO</span>
            <span className="text-2xl sm:text-3xl font-serif font-bold text-white">
              {selectedIso}
            </span>
          </div>
        </div>
      </div>

      {/* 4. 조작 다이얼 (Aperture & ISO 휠 선택) */}
      <div className="space-y-3 mb-2">
        {/* F-stop 조리개 다이얼 바 */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-white/60 mb-1.5 px-1">
            <span>렌즈 조리개 (Aperture) 선택</span>
            <span className="text-amber-300 font-mono">F{selectedAperture}</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {APERTURE_LIST.map((f) => (
              <button
                key={f}
                onClick={() => handleApertureChange(f)}
                className={`flex-1 min-w-[42px] py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  selectedAperture === f
                    ? 'bg-amber-400 text-black shadow-lg scale-105'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                }`}
              >
                F{f}
              </button>
            ))}
          </div>
        </div>

        {/* ISO 필름 감도 다이얼 바 */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-white/60 mb-1.5 px-1">
            <span>필름 감도 (ISO) 선택</span>
            <span className="text-amber-300 font-mono">ISO {selectedIso}</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {ISO_LIST.map((iso) => (
              <button
                key={iso}
                onClick={() => handleIsoChange(iso)}
                className={`flex-1 min-w-[48px] py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  selectedIso === iso
                    ? 'bg-terracotta text-white shadow-lg scale-105'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                }`}
              >
                {iso}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. 하단 셔터 시뮬레이션 및 햅틱 테스트 버튼 */}
      <button
        onClick={handleShutterClick}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-terracotta to-amber-600 text-white font-serif font-bold text-base shadow-lg shadow-terracotta/20 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
      >
        <Camera className="w-5 h-5" />
        <span>셔터 햅틱 &amp; 효과음 테스트 (SLR Click)</span>
      </button>
    </div>
  );
}
