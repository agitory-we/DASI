'use client';

import React, { useState } from 'react';
import { X, QrCode, MapPin, Sparkles, Sun, CheckCircle2, Award, Camera } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { playShutterSound } from '@/utils/shutterAudio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  spotTitle: string;
  spotLocation: string;
  goldenHourTip?: string;
  recommendedLens?: string;
  onSuccess?: () => void;
}

export function SpotCheckInModal({
  isOpen,
  onClose,
  spotTitle,
  spotLocation,
  goldenHourTip = '일몰 1시간 전 노을빛 역광 촬영 추천',
  recommendedLens = '50mm F1.4 / 35mm F2.0',
  onSuccess
}: Props) {
  const { user, openLoginModal, awardPoints } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleCheckIn = async () => {
    if (!user) {
      onClose();
      openLoginModal();
      return;
    }
    setIsProcessing(true);
    playShutterSound('slr');

    try {
      await awardPoints('spot_report', spotTitle);
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => {
      setIsProcessing(false);
      setIsCheckedIn(true);
      onSuccess?.();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn" onClick={onClose}>
      <div
        className="relative w-full max-w-sm bg-[#FAF8F5] rounded-3xl shadow-2xl border-4 border-vintage-300 p-6 sm:p-8 space-y-5 text-center cursor-default max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-vintage-400 hover:text-vintage-800 rounded-full hover:bg-vintage-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {isCheckedIn ? (
          <div className="space-y-4 py-2 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-3xl">
              📍
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                골든아워 스탬프 랠리 인증 완료
              </span>
              <h3 className="font-serif text-xl font-bold text-vintage-900">
                [{spotTitle}] 체크인 성공!
              </h3>
              <p className="text-xs text-vintage-600 leading-relaxed">
                현장 방문이 성공적으로 확인되어 <strong className="text-terracotta font-bold">+200P</strong>가 적립되었습니다!
              </p>
            </div>

            {/* 현장 화각 & 세팅 팁 */}
            <div className="p-4 rounded-2xl bg-white border border-vintage-200 text-left space-y-2 text-xs">
              <div className="font-bold text-vintage-900 flex items-center gap-1.5 pb-1 border-b border-vintage-100">
                <Sun className="w-4 h-4 text-amber-600" />
                <span>현장 실시간 추천 세팅</span>
              </div>
              <div className="space-y-1 text-vintage-700 text-[11px]">
                <div>• <strong>골든아워 포인트:</strong> {goldenHourTip}</div>
                <div>• <strong>추천 화각:</strong> {recommendedLens}</div>
                <div>• <strong>스탬프 랠리:</strong> 서울 명소 성지순례 1/5 달성</div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-vintage-900 text-white text-xs font-bold hover:bg-terracotta transition-colors shadow-xs"
            >
              확인
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-1.5 border-b-2 border-vintage-200 pb-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center mx-auto mb-1">
                <QrCode className="w-6 h-6" />
              </div>
              <span className="text-[10px] tracking-widest uppercase font-mono text-terracotta font-bold">
                DASI SPOT PROOF-OF-VISIT
              </span>
              <h3 className="font-serif text-xl font-bold text-vintage-900">
                출사 명소 현장 체크인 QR
              </h3>
              <p className="text-xs text-vintage-600">
                현장 브라스 핀 스캔 또는 GPS 위치로 출사를 인증하고 +200P를 적립하세요.
              </p>
            </div>

            {/* 현장 스캔 그래픽 */}
            <div className="bg-white p-5 rounded-2xl border border-vintage-200 shadow-inner space-y-3">
              <div className="p-3 bg-vintage-50 rounded-xl border border-vintage-200 inline-block">
                <QrCode className="w-24 h-24 text-vintage-900 mx-auto" />
              </div>
              <div className="space-y-0.5">
                <div className="font-serif text-sm font-bold text-vintage-900">{spotTitle}</div>
                <div className="text-[11px] text-vintage-500 flex items-center justify-center gap-1">
                  <MapPin className="w-3 h-3 text-terracotta" />
                  <span>{spotLocation}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-vintage-200 space-y-2">
              <button
                type="button"
                onClick={handleCheckIn}
                disabled={isProcessing}
                className="w-full py-3 rounded-xl bg-terracotta hover:bg-terracotta-light text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isProcessing ? '체크인 검증 중...' : '현장 체크인 및 200P 받기'}</span>
              </button>
              <div className="text-[10px] text-vintage-500">
                인증 시 실시간 화각 팁 해금 및 서울 성지순례 뱃지가 누적됩니다.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
