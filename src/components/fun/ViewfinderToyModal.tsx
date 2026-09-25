'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, RotateCw, Sparkles, Check, Sliders, Volume2, VolumeX, Award, ArrowRight } from 'lucide-react';
import { playShutterSound, playWindingAdvanceSound, playFocusBeepSound, isAudioMuted, toggleAudioMute } from '@/utils/shutterAudio';
import { useDasi } from '@/context/DasiContext';

interface ViewfinderToyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 뷰파인더를 통해 들여다보는 레트로 출사 씬 목록
const VIEWFINDER_SCENES = [
  {
    id: 'euljiro',
    title: '을지로 세운상가 옥상 & 남산타워',
    imageUrl: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1200&auto=format&fit=crop&q=80',
    shutterSpeed: '1/500s',
    aperture: 'f/4.0',
    iso: 'ISO 400',
  },
  {
    id: 'bukchon',
    title: '북촌 한옥마을 돌담길의 햇살',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    shutterSpeed: '1/250s',
    aperture: 'f/2.8',
    iso: 'ISO 200',
  },
  {
    id: 'seongsu',
    title: '성수동 붉은 벽돌 카페 골목',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
    shutterSpeed: '1/1000s',
    aperture: 'f/1.8',
    iso: 'ISO 100',
  },
];

export const ViewfinderToyModal: React.FC<ViewfinderToyModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useDasi();

  const [sceneIndex, setSceneIndex] = useState<number>(0);
  const [focusSlider, setFocusSlider] = useState<number>(15); // 0 ~ 100 (50이 정초점)
  const [isCranked, setIsCranked] = useState<boolean>(false); // 레버 와인딩 장전 여부
  const [crankDegree, setCrankDegree] = useState<number>(0); // 0 ~ 120도
  const [frameCounter, setFrameCounter] = useState<number>(1);
  const [isBlackout, setIsBlackout] = useState<boolean>(false); // 미러업 블랙아웃
  const [capturedPhotos, setCapturedPhotos] = useState<Array<{ sceneTitle: string; frameNum: number; timestamp: string }>>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDraggingLever, setIsDraggingLever] = useState<boolean>(false);

  useEffect(() => {
    setIsMuted(isAudioMuted());
  }, []);

  if (!isOpen) return null;

  const currentScene = VIEWFINDER_SCENES[sceneIndex];

  // 초점 오차 계산 (50이 정초점, 47~53 사이면 퍼펙트 포커스)
  const focusDiff = Math.abs(focusSlider - 50);
  const isPerfectFocus = focusDiff <= 3;
  const isGoodFocus = focusDiff <= 8;

  // 슬라이더 변경 시 초점 일치 비프음
  const handleFocusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setFocusSlider(val);
    if (Math.abs(val - 50) <= 2) {
      playFocusBeepSound();
    }
  };

  // 와인딩 레버 감기 인터랙션
  const handleWindLever = () => {
    if (isCranked) {
      showToast('이미 필름이 장전되어 있습니다! 셔터를 눌러 촬영하세요.', 'info');
      return;
    }

    setIsDraggingLever(true);
    setCrankDegree(120);
    playWindingAdvanceSound();

    setTimeout(() => {
      setCrankDegree(0);
      setIsDraggingLever(false);
      setIsCranked(true);
      showToast('치이익-착! 35mm 필름이 장전되었습니다. 셔터 락 해제!', 'success');
    }, 450);
  };

  // 셔터 누르기
  const handlePressShutter = () => {
    if (!isCranked) {
      showToast('⚠️ 찰칵하기 전, 우측 와인딩 레버를 먼저 감아주세요!', 'warning');
      return;
    }

    // 미러업 블랙아웃 & 셔터음 발생
    setIsBlackout(true);
    playShutterSound('slr');

    setTimeout(() => {
      setIsBlackout(false);
      setIsCranked(false);

      const newFrame = frameCounter + 1;
      setFrameCounter(newFrame > 36 ? 1 : newFrame);

      const newRecord = {
        sceneTitle: currentScene.title,
        frameNum: frameCounter,
        timestamp: new Date().toLocaleTimeString(),
      };
      setCapturedPhotos((prev) => [newRecord, ...prev.slice(0, 4)]);

      if (isPerfectFocus) {
        showToast(`🎯 퍼펙트 포커스 샷! [EXP #${frameCounter}] +50P 보너스 획득!`, 'success');
      } else if (isGoodFocus) {
        showToast(`📸 깔끔한 샷! [EXP #${frameCounter}] 촬영 완료!`, 'info');
      } else {
        showToast(`🎞️ 몽환적인 소프트 포커스 샷! [EXP #${frameCounter}] 감성 컷 완성!`, 'info');
      }
    }, 120);
  };

  const handleToggleMute = () => {
    const next = toggleAudioMute();
    setIsMuted(next);
  };

  const nextScene = () => {
    setSceneIndex((prev) => (prev + 1) % VIEWFINDER_SCENES.length);
    setFocusSlider(15);
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-3 sm:p-5 bg-stone-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-stone-900 rounded-3xl border border-stone-700 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* 상단 툴바 */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-900/95 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif text-base sm:text-lg font-bold text-stone-100 flex items-center gap-2">
              가상 뷰파인더 & 와인딩 레버
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                SLR 기계식 손맛
              </span>
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
              title={isMuted ? '음소거 해제' : '음소거'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 카메라 메인 바디 */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* 카메라 탑 플레이트 (와인딩 레버, 셔터 버튼, 프레임 카운터) */}
          <div className="bg-stone-950 rounded-2xl border-2 border-stone-700 p-4 shadow-xl flex items-center justify-between gap-4">
            {/* 1. 필름 카운터 창 */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-stone-400 font-mono">FRAME</span>
              <div className="w-12 h-12 rounded-full bg-stone-900 border-2 border-amber-500/60 flex items-center justify-center font-mono font-bold text-amber-400 text-sm shadow-inner">
                {frameCounter.toString().padStart(2, '0')}/36
              </div>
            </div>

            {/* 2. 셔터 릴리즈 버튼 */}
            <div className="flex flex-col items-center flex-1 max-w-[140px]">
              <span className="text-[10px] text-stone-400 font-mono mb-1">SHUTTER</span>
              <button
                onClick={handlePressShutter}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-1.5 ${
                  isCranked
                    ? 'bg-gradient-to-b from-rose-500 to-rose-700 text-white hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                    : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                }`}
              >
                {isCranked ? '● 찰칵! (RELEASE)' : '🔒 장전 필요'}
              </button>
            </div>

            {/* 3. 기계식 와인딩 레버 */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-stone-400 font-mono mb-1">ADVANCE LEVER</span>
              <button
                onClick={handleWindLever}
                disabled={isCranked || isDraggingLever}
                className={`relative w-16 h-12 rounded-xl border-2 border-stone-600 flex items-center justify-center transition-all ${
                  isCranked
                    ? 'bg-stone-850 opacity-40 cursor-default'
                    : 'bg-gradient-to-r from-stone-700 via-stone-500 to-stone-800 text-stone-200 hover:scale-105 active:scale-95 cursor-pointer shadow-md'
                }`}
                title="레버를 당겨 35mm 필름을 장전하세요"
              >
                <div
                  className="w-10 h-3 bg-amber-400 rounded-full shadow transition-transform origin-left"
                  style={{
                    transform: `rotate(${crankDegree}deg)`,
                    transition: isDraggingLever ? 'transform 0.45s ease-out' : 'transform 0.15s ease',
                  }}
                />
              </button>
            </div>
          </div>

          {/* 뷰파인더 윈도우 (아이피스 뷰) */}
          <div className="relative rounded-2xl bg-black border-4 border-stone-800 p-2 sm:p-4 shadow-2xl overflow-hidden">
            {/* 미러업 블랙아웃 효과 오버레이 */}
            {isBlackout && (
              <div className="absolute inset-0 bg-black z-30 flex items-center justify-center" />
            )}

            {/* 뷰파인더 HUD 오버레이 헤더 */}
            <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-mono text-stone-400 bg-stone-900/80 rounded-t-lg border-b border-stone-800">
              <div className="flex items-center gap-3">
                <span className="text-amber-400 font-bold">{currentScene.shutterSpeed}</span>
                <span>{currentScene.aperture}</span>
                <span className="text-stone-400">{currentScene.iso}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-stone-400">EXP METER:</span>
                <span className={`font-bold ${isPerfectFocus ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isPerfectFocus ? '+  [●]  -' : '+  o  -'}
                </span>
              </div>
            </div>

            {/* 실제 들여다보는 피사체 이미지 뷰 */}
            <div className="relative h-64 sm:h-72 w-full rounded-b-lg overflow-hidden bg-stone-950 flex items-center justify-center">
              <img
                src={currentScene.imageUrl}
                alt={currentScene.title}
                className="w-full h-full object-cover transition-all duration-200"
                style={{
                  filter: `blur(${Math.min(focusDiff * 0.25, 6)}px) contrast(${100 - focusDiff * 0.5}%)`,
                }}
              />

              {/* 뷰파인더 중앙 35mm 이중합치 스플릿 스크린 (Split-image Rangefinder) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* 뷰파인더 십자 마이크로 프리즘 원형 링 */}
                <div className="relative w-28 h-28 rounded-full border-2 border-stone-300/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden">
                  {/* 상단 반원 프리즘 */}
                  <div
                    className="w-full h-1/2 overflow-hidden border-b border-stone-400/80 transition-transform duration-75"
                    style={{
                      transform: `translateX(${(focusSlider - 50) * 0.8}px)`,
                    }}
                  >
                    <img
                      src={currentScene.imageUrl}
                      alt="top split"
                      className="w-full h-[200%] object-cover -translate-y-1/4"
                      style={{
                        filter: `blur(${Math.min(focusDiff * 0.15, 4)}px)`,
                      }}
                    />
                  </div>

                  {/* 하단 반원 프리즘 */}
                  <div
                    className="w-full h-1/2 overflow-hidden transition-transform duration-75"
                    style={{
                      transform: `translateX(${(50 - focusSlider) * 0.8}px)`,
                    }}
                  >
                    <img
                      src={currentScene.imageUrl}
                      alt="bottom split"
                      className="w-full h-[200%] object-cover -translate-y-3/4"
                      style={{
                        filter: `blur(${Math.min(focusDiff * 0.15, 4)}px)`,
                      }}
                    />
                  </div>

                  {/* 중앙 원형 미세 가이드 */}
                  <div className="absolute inset-0 rounded-full border border-amber-400/50 pointer-events-none" />
                </div>
              </div>

              {/* 포커스 상태 뱃지 */}
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-stone-950/80 backdrop-blur-md border border-stone-800 text-[11px] font-mono flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isPerfectFocus ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className={isPerfectFocus ? 'text-emerald-300 font-bold' : 'text-stone-300'}>
                  {isPerfectFocus ? '● FOCUS LOCKED' : isGoodFocus ? 'NEAR FOCUS' : 'OUT OF FOCUS'}
                </span>
              </div>

              {/* 씬 전환 버튼 */}
              <button
                onClick={nextScene}
                className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-stone-900/80 hover:bg-stone-800 text-stone-200 text-xs font-mono border border-stone-700 flex items-center gap-1 transition"
              >
                <RotateCw className="w-3 h-3 text-amber-400" />
                씬 변경
              </button>
            </div>
          </div>

          {/* 렌즈 포커스 링 슬라이더 컨트롤 */}
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-stone-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" /> LENS FOCUS RING (초점 링 맞추기)
              </span>
              <span className="font-mono text-amber-400 font-bold">
                {focusSlider}m {isPerfectFocus && '🎯 PERFECT!'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={focusSlider}
              onChange={handleFocusChange}
              className="w-full h-2.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-stone-500">
              <span>0.5m (근접)</span>
              <span className="text-amber-400/80">정초점 (50m)</span>
              <span>∞ 무한대</span>
            </div>
          </div>

          {/* 최근 촬영 롤 프리뷰 (Contact Strip) */}
          {capturedPhotos.length > 0 && (
            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-mono text-stone-400 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" /> 최근 촬영한 컷 리스트
                </p>
                <span className="text-[11px] text-amber-400 font-mono">총 {capturedPhotos.length}컷 현상됨</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {capturedPhotos.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-left font-mono"
                  >
                    <span className="text-[10px] text-amber-400 font-bold">EXP #{item.frameNum}</span>
                    <p className="text-[11px] text-stone-200 truncate mt-0.5">{item.sceneTitle}</p>
                    <span className="text-[9px] text-stone-500 block">{item.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
