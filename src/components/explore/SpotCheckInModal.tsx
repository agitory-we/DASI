'use client';

import React, { useState, useRef } from 'react';
import { X, QrCode, MapPin, Sun, Camera, Navigation, Share2, Download, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { playShutterSound } from '@/utils/shutterAudio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  spotTitle: string;
  spotLocation: string;
  spotLat?: number;
  spotLng?: number;
  goldenHourTip?: string;
  recommendedLens?: string;
  onSuccess?: () => void;
}

/** Haversine distance in metres */
function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const GEOFENCE_RADIUS_M = 200;

export function SpotCheckInModal({
  isOpen,
  onClose,
  spotTitle,
  spotLocation,
  spotLat,
  spotLng,
  goldenHourTip = '일몰 1시간 전 노을빛 역광 촬영 추천',
  recommendedLens = '50mm F1.4 / 35mm F2.0',
  onSuccess,
}: Props) {
  const { user, openLoginModal, awardPoints } = useAuth();
  const [step, setStep] = useState<'idle' | 'locating' | 'fallback' | 'done' | 'error'>('idle');
  const [gpsError, setGpsError] = useState('');
  const [fallbackText, setFallbackText] = useState('');
  const [distanceM, setDistanceM] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (!isOpen) return null;

  // ── GPS 기반 체크인 ──────────────────────────────────────────────────────
  const handleGpsCheckIn = () => {
    if (!user) { onClose(); openLoginModal(); return; }
    if (!navigator.geolocation) { setStep('fallback'); return; }
    setStep('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (!spotLat || !spotLng) { completeCheckIn(null); return; }
        const dist = haversineMeters(latitude, longitude, spotLat, spotLng);
        const distInt = Math.round(dist);
        setDistanceM(distInt);
        if (dist <= GEOFENCE_RADIUS_M) {
          completeCheckIn(distInt);
        } else {
          setGpsError(
            `현재 위치가 스팟에서 ${distInt}m 떨어져 있습니다. (허용 반경: ${GEOFENCE_RADIUS_M}m)\n현장에 가까이 이동 후 다시 시도하거나 자가 인증을 선택하세요.`
          );
          setStep('error');
        }
      },
      (err) => {
        console.warn('GPS 오류:', err.message);
        setStep('fallback');
      },
      { timeout: 8000, maximumAge: 0, enableHighAccuracy: true }
    );
  };

  // ── 자가 인증 폴백 ────────────────────────────────────────────────────────
  const handleFallbackCheckIn = () => {
    if (fallbackText.trim().length < 5) return;
    completeCheckIn(null);
  };

  // ── 공통 완료 처리 ────────────────────────────────────────────────────────
  const completeCheckIn = async (dist: number | null) => {
    playShutterSound('slr');
    try { await awardPoints('spot_report', spotTitle); } catch (e) { console.error(e); }
    setStep('done');
    onSuccess?.();
    setTimeout(() => drawShareCard(dist), 400);
  };

  // ── Canvas 인스타 스토리 카드 생성 (CMO 요청) ────────────────────────────
  const drawShareCard = (dist: number | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 1080;
    canvas.height = 1920;
    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, 1920);
    grad.addColorStop(0, '#1a0f08');
    grad.addColorStop(0.5, '#2d1a10');
    grad.addColorStop(1, '#0f0804');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);
    // Grain texture overlay
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 1080;
      const y = Math.random() * 1920;
      const a = Math.random() * 0.04;
      ctx.fillStyle = `rgba(255,220,180,${a})`;
      ctx.fillRect(x, y, 1, 1);
    }
    // Decorative circles
    ctx.beginPath();
    ctx.arc(540, 820, 440, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(180,100,56,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(540, 820, 380, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(180,100,56,0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // DASI brand
    ctx.font = 'bold 80px serif';
    ctx.fillStyle = '#e88a5a';
    ctx.textAlign = 'center';
    ctx.fillText('DASI', 540, 200);
    ctx.font = '28px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('필름 사진 생태계', 540, 250);
    // Pin emoji large
    ctx.font = '220px serif';
    ctx.fillText('\uD83D\uDCCD', 540, 820);
    // Spot name
    ctx.font = 'bold 66px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(spotTitle, 540, 1020);
    // Location
    ctx.font = '36px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText(spotLocation, 540, 1080);
    // Point reward
    ctx.font = 'bold 54px sans-serif';
    ctx.fillStyle = '#fcd34d';
    ctx.fillText('+200P 골든아워 체크인 완료 \uD83C\uDFC5', 540, 1200);
    // GPS verified
    if (dist !== null) {
      ctx.font = '32px sans-serif';
      ctx.fillStyle = 'rgba(52,211,153,0.9)';
      ctx.fillText(`\u2713 GPS 인증 완료 (${dist}m 이내)`, 540, 1270);
    }
    // Hashtags
    ctx.font = '34px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillText('#DASI #필름카메라 #골든아워 #필름감성', 540, 1420);
    // Date
    ctx.font = '28px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillText(new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }), 540, 1480);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `DASI_checkin_${spotTitle}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleWebShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) { handleDownload(); return; }
      const file = new File([blob], `DASI_checkin_${spotTitle}.png`, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `[DASI] ${spotTitle} 골든아워 체크인!`,
          text: '#DASI #필름카메라 #골든아워',
        }).catch(() => handleDownload());
      } else {
        handleDownload();
      }
    }, 'image/png');
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-[#FAF8F5] rounded-3xl shadow-2xl border-4 border-vintage-300 p-6 space-y-5 text-center cursor-default max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-vintage-400 hover:text-vintage-800 rounded-full hover:bg-vintage-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── IDLE ── */}
        {step === 'idle' && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <QrCode className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">골든아워 스탬프 랠리</span>
              <h3 className="font-serif text-xl font-bold text-vintage-900 mt-2">
                [{spotTitle}]<br />현장 체크인
              </h3>
              <p className="text-xs text-vintage-600 mt-2 leading-relaxed">
                현재 위치를 확인하여 스팟 <strong>반경 200m</strong> 이내 방문을 인증하면{' '}
                <strong className="text-terracotta">+200P</strong>가 즉시 적립됩니다.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-vintage-50 border border-vintage-200 text-xs text-vintage-700 text-left space-y-1.5">
              <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-terracotta shrink-0" /><span>{spotLocation}</span></div>
              <div className="flex items-center gap-1.5"><Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" /><span>{goldenHourTip}</span></div>
              <div className="flex items-center gap-1.5"><Camera className="w-3.5 h-3.5 text-vintage-500 shrink-0" /><span>추천 화각: {recommendedLens}</span></div>
            </div>
            <button
              onClick={handleGpsCheckIn}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
            >
              <Navigation className="w-4 h-4" />
              GPS로 현장 방문 인증 (+200P)
            </button>
            <p className="text-[10px] text-vintage-400">위치 권한이 없는 경우 자가 인증 방식으로 전환됩니다</p>
          </div>
        )}

        {/* ── LOCATING ── */}
        {step === 'locating' && (
          <div className="space-y-4 py-8">
            <div className="w-16 h-16 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mx-auto" />
            <h3 className="font-serif text-lg font-bold text-vintage-900">GPS 위치 확인 중...</h3>
            <p className="text-xs text-vintage-600">현재 위치와 스팟 거리를 측정하고 있습니다.</p>
          </div>
        )}

        {/* ── ERROR: 거리 초과 ── */}
        {step === 'error' && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-lg font-bold text-vintage-900">현장 거리 초과</h3>
            <p className="text-xs text-vintage-600 leading-relaxed whitespace-pre-line">{gpsError}</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setStep('fallback')}
                className="py-2.5 rounded-xl bg-vintage-100 text-vintage-800 text-xs font-bold hover:bg-vintage-200 transition-colors"
              >
                자가 인증으로 전환
              </button>
              <button
                onClick={() => { setStep('idle'); setGpsError(''); }}
                className="py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* ── FALLBACK: 자가 인증 ── */}
        {step === 'fallback' && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto">
              <QrCode className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">현장 자가 인증 모드</span>
              <h3 className="font-serif text-lg font-bold text-vintage-900 mt-2">현장 방문 자가 인증</h3>
              <p className="text-xs text-vintage-600 mt-1 leading-relaxed">
                GPS를 사용할 수 없습니다. 현장에서 보이는 특징(간판, 건물명 등)을 입력하여 방문을 자가 인증해 주세요.
              </p>
            </div>
            <textarea
              value={fallbackText}
              onChange={(e) => setFallbackText(e.target.value)}
              placeholder={`예: "${spotTitle} 앞에 서 있습니다. 오른쪽에 빨간 간판 카페가 보입니다."`}
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-vintage-200 bg-vintage-50 focus:outline-none focus:border-terracotta resize-none"
            />
            <p className="text-[10px] text-vintage-400 -mt-2">5자 이상 입력해 주세요 ({fallbackText.length}자)</p>
            <button
              onClick={handleFallbackCheckIn}
              disabled={fallbackText.trim().length < 5}
              className="w-full py-3 rounded-xl bg-vintage-900 text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              자가 인증으로 체크인 (+200P)
            </button>
          </div>
        )}

        {/* ── DONE: 완료 + 공유 카드 ── */}
        {step === 'done' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-3xl">📍</div>
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">골든아워 스탬프 랠리 인증 완료</span>
              <h3 className="font-serif text-xl font-bold text-vintage-900 mt-2">[{spotTitle}] 체크인 성공!</h3>
              <p className="text-xs text-vintage-600 mt-1">
                <strong className="text-terracotta font-bold">+200P</strong>가 적립되었습니다!
                {distanceM !== null && (
                  <span className="ml-1 text-emerald-600 font-semibold">✓ GPS 인증 ({distanceM}m)</span>
                )}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-vintage-200 text-left space-y-1.5 text-xs">
              <div className="font-bold text-vintage-900 flex items-center gap-1.5 pb-1 border-b border-vintage-100">
                <Sun className="w-4 h-4 text-amber-600" /><span>현장 실시간 추천 세팅</span>
              </div>
              <div className="text-vintage-700 space-y-0.5">
                <div>• <strong>골든아워:</strong> {goldenHourTip}</div>
                <div>• <strong>추천 화각:</strong> {recommendedLens}</div>
                <div>• <strong>스탬프 랠리:</strong> 서울 성지순례 1/5 달성</div>
              </div>
            </div>

            {/* 인스타 스토리 공유 카드 */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-vintage-800 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-terracotta" />
                인스타 스토리 공유 카드 자동 생성
              </p>
              <canvas
                ref={canvasRef}
                className="w-full rounded-2xl border border-vintage-200 shadow-sm bg-[#1a0f08]"
                style={{ aspectRatio: '9/16' }}
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleWebShare}
                  className="py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  인스타에 공유
                </button>
                <button
                  onClick={handleDownload}
                  className="py-2.5 rounded-xl bg-vintage-100 text-vintage-800 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-vintage-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  이미지 저장
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-vintage-900 text-white text-xs font-bold hover:bg-terracotta transition-colors"
            >
              확인
            </button>
          </div>
        )}
      </div>
    </div>
  );
}