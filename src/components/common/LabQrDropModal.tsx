'use client';

import React, { useState } from 'react';
import { X, QrCode, Sparkles, Check, Clock, ShieldCheck, Film, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { playShutterSound } from '@/utils/shutterAudio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultLabName?: string;
  onSuccess?: () => void;
}

export function LabQrDropModal({ isOpen, onClose, defaultLabName = '망우삼림 을지로', onSuccess }: Props) {
  const { user, profile, openLoginModal, awardPoints } = useAuth();
  const [labName, setLabName] = useState(defaultLabName);
  const [scannerType, setScannerType] = useState<'noritsu' | 'fuji'>('noritsu');
  const [rollCount, setRollCount] = useState(1);
  const [resolution, setResolution] = useState<'3000' | '6000'>('3000');
  const [isScannedByShop, setIsScannedByShop] = useState(false);
  const [receiptCode] = useState(() => 'DASI-SCAN-' + Math.floor(100000 + Math.random() * 900000));

  if (!isOpen) return null;

  const handleSimulateShopScan = async () => {
    if (!user) {
      onClose();
      openLoginModal();
      return;
    }
    playShutterSound('slr');
    try {
      await awardPoints('photo_upload', receiptCode);
    } catch (e) {
      console.error(e);
    }
    setIsScannedByShop(true);
    onSuccess?.();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn" onClick={onClose}>
      <div
        className="relative w-full max-w-md bg-[#FAF7F0] rounded-3xl shadow-2xl border-4 border-vintage-300 p-6 sm:p-8 space-y-5 text-center cursor-default max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-vintage-400 hover:text-vintage-800 rounded-full hover:bg-vintage-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {isScannedByShop ? (
          <div className="space-y-4 py-4 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
              ✓
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                현상소 접수 및 스캔 대기 시작
              </span>
              <h3 className="font-serif text-xl font-bold text-vintage-900">
                스마트 스캔 접수 완료!
              </h3>
              <p className="text-xs text-vintage-600 leading-relaxed">
                <strong>{labName}</strong> 카운터에서 접수되었습니다. 스캔 작업이 완료되면 알림톡과 함께 마이 캐비닛의 <strong>[36컷 웹 갤러리]</strong>로 고화질 스캔본이 자동 전송됩니다.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-vintage-200 text-left space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-vintage-500">접수 번호</span>
                <span className="font-mono font-bold text-vintage-900">{receiptCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-vintage-500">선택 스캐너</span>
                <span className="font-semibold text-vintage-800">
                  {scannerType === 'noritsu' ? '노리츠 HS-1800 (따뜻한 인물 톤)' : '후지 SP-3000 (차분한 녹색빛 톤)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-vintage-500">기여 리워드</span>
                <span className="font-bold text-terracotta">+150P 즉시 적립 완료</span>
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
            <div className="space-y-1.5 border-b-2 border-vintage-200 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center mx-auto mb-1">
                <Film className="w-6 h-6" />
              </div>
              <span className="text-[10px] tracking-widest uppercase font-mono text-terracotta font-bold">
                DASI LAB QUICK-DROP PASS
              </span>
              <h3 className="font-serif text-xl font-bold text-vintage-900">
                현상소 1초 스마트 접수 QR
              </h3>
              <p className="text-xs text-vintage-600">
                종이 장부 수기 작성 없이, 카운터 사장님께 아래 화면을 보여주시면 즉시 1초 접수됩니다.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-vintage-200 shadow-inner space-y-3">
              <div className="p-3 bg-vintage-50 rounded-xl border border-vintage-200 inline-block">
                <QrCode className="w-28 h-28 text-vintage-900 mx-auto" />
              </div>
              <div className="font-mono text-xs font-bold tracking-widest text-vintage-900">
                {receiptCode}
              </div>
              <div className="text-[10px] text-vintage-400 font-mono">
                CUSTOMER: {profile?.nickname || user?.email?.split('@')[0] || 'GUEST-FILMMER'}
              </div>
            </div>

            <div className="text-left space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-vintage-800">방문 현상소</label>
                <input
                  type="text"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-vintage-300 bg-white font-semibold text-vintage-900 focus:outline-none focus:border-terracotta"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-vintage-800">희망 스캐너 색감 (노리츠 vs 후지)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScannerType('noritsu')}
                    className={'py-2 px-3 rounded-xl border text-xs font-semibold transition-all ' + (
                      scannerType === 'noritsu'
                        ? 'bg-vintage-900 text-white border-vintage-900 shadow-xs'
                        : 'bg-white border-vintage-200 text-vintage-700 hover:bg-vintage-50'
                    )}
                  >
                    노리츠 HS-1800 (따뜻한 인물톤)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScannerType('fuji')}
                    className={'py-2 px-3 rounded-xl border text-xs font-semibold transition-all ' + (
                      scannerType === 'fuji'
                        ? 'bg-vintage-900 text-white border-vintage-900 shadow-xs'
                        : 'bg-white border-vintage-200 text-vintage-700 hover:bg-vintage-50'
                    )}
                  >
                    후지 SP-3000 (차분한 풍경톤)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-vintage-800">스캔 롤 수</label>
                  <select
                    value={rollCount}
                    onChange={(e) => setRollCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-vintage-300 bg-white font-semibold text-vintage-900"
                  >
                    <option value={1}>1롤 (36컷)</option>
                    <option value={2}>2롤 (72컷)</option>
                    <option value={3}>3롤 (108컷)</option>
                    <option value={4}>4롤 이상 (대량)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-vintage-800">해상도 옵션</label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-vintage-300 bg-white font-semibold text-vintage-900"
                  >
                    <option value="3000">3000dpi (표준 고화질)</option>
                    <option value="6000">6000dpi (초고화질 RAW)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-vintage-200 space-y-2">
              <button
                type="button"
                onClick={handleSimulateShopScan}
                className="w-full py-3 rounded-xl bg-terracotta hover:bg-terracotta-light text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <QrCode className="w-4 h-4" />
                <span>현상소 사장님 스캔 확인 (시뮬레이션 접수)</span>
              </button>
              <div className="text-[10px] text-vintage-500">
                접수 시 36컷 디지털 웹 갤러리가 활성화되며 <strong>+150P</strong>가 적립됩니다.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
