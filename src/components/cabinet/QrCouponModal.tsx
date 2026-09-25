'use client';

import React, { useState } from 'react';
import { X, QrCode, CheckCircle2, Copy, Sparkles, Store, ShieldCheck, Clock } from 'lucide-react';
import { showToast } from '@/utils/toast';

interface QrCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopName: string;
  discountText: string;
  categoryName?: string;
  leadTime?: string;
  couponCode?: string;
}

export const QrCouponModal: React.FC<QrCouponModalProps> = ({
  isOpen,
  onClose,
  shopName,
  discountText,
  categoryName = '현상 & 점검 제휴처',
  leadTime = '당일 즉시 사용 가능',
  couponCode = 'DASI-VIP-' + Math.floor(100000 + Math.random() * 900000),
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isUsed, setIsUsed] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode);
    setIsCopied(true);
    showToast('쿠폰 번호가 복사되었습니다.', 'info');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleUseNow = () => {
    setIsUsed(true);
    showToast(`${shopName} 현장 할인 적용이 확인되었습니다!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#FAF8F5] border border-vintage-200 shadow-2xl overflow-hidden animate-scale-up">
        {/* Top Header */}
        <div className="bg-[#2D241E] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-terracotta flex items-center justify-center text-xs font-serif font-bold">
              다
            </div>
            <div>
              <div className="text-xs font-bold tracking-tight">DASI 공식 제휴 현장 할인권</div>
              <div className="text-[10px] text-vintage-300">{categoryName}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ticket Body */}
        <div className="p-6 space-y-5">
          {/* Shop & Benefit Badge */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold">
              <Store className="w-3.5 h-3.5" />
              <span>{shopName}</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-vintage-900 tracking-tight">
              {discountText}
            </h3>
            <p className="text-xs text-vintage-600 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{leadTime}</span>
            </p>
          </div>

          {/* QR Code Presentation Box */}
          <div className="p-5 rounded-2xl bg-white border border-vintage-200/80 shadow-xs text-center space-y-4">
            <div className="relative inline-block p-4 rounded-xl bg-[#FAF8F5] border border-vintage-100">
              {/* Stylized QR Vector */}
              <div className="w-44 h-44 mx-auto flex flex-col items-center justify-center relative">
                <svg viewBox="0 0 100 100" className="w-full h-full text-vintage-900">
                  {/* Outer Frame */}
                  <rect x="5" y="5" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="6" rx="4" />
                  <rect x="13" y="13" width="10" height="10" fill="currentColor" rx="2" />

                  <rect x="69" y="5" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="6" rx="4" />
                  <rect x="77" y="13" width="10" height="10" fill="currentColor" rx="2" />

                  <rect x="5" y="69" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="6" rx="4" />
                  <rect x="13" y="77" width="10" height="10" fill="currentColor" rx="2" />

                  {/* Dynamic Pattern Pixels */}
                  <rect x="40" y="8" width="8" height="8" fill="currentColor" rx="1" />
                  <rect x="52" y="16" width="8" height="8" fill="currentColor" rx="1" />
                  <rect x="40" y="24" width="8" height="8" fill="currentColor" rx="1" />

                  <rect x="8" y="40" width="8" height="8" fill="currentColor" rx="1" />
                  <rect x="20" y="48" width="8" height="8" fill="currentColor" rx="1" />

                  <rect x="42" y="42" width="16" height="16" fill="#C85A32" rx="4" />

                  <rect x="68" y="40" width="8" height="8" fill="currentColor" rx="1" />
                  <rect x="80" y="48" width="8" height="8" fill="currentColor" rx="1" />
                  <rect x="68" y="60" width="8" height="8" fill="currentColor" rx="1" />

                  <rect x="40" y="68" width="8" height="8" fill="currentColor" rx="1" />
                  <rect x="52" y="76" width="8" height="8" fill="currentColor" rx="1" />
                  <rect x="40" y="84" width="8" height="8" fill="currentColor" rx="1" />

                  <rect x="68" y="76" width="8" height="8" fill="currentColor" rx="1" />
                  <rect x="80" y="84" width="8" height="8" fill="currentColor" rx="1" />
                </svg>

                {/* Central Brand Badge */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-lg bg-terracotta text-white flex items-center justify-center font-serif text-xs font-bold shadow-md">
                    다
                  </div>
                </div>
              </div>
            </div>

            {/* Barcode Mock */}
            <div className="space-y-1">
              <div className="flex justify-center items-center gap-[3px] h-9 px-4">
                {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3].map((w, idx) => (
                  <div key={idx} className="h-full bg-vintage-900 rounded-2xs" style={{ width: `${w * 1.5}px` }} />
                ))}
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-xs font-bold text-vintage-800 tracking-widest">{couponCode}</span>
                <button
                  onClick={handleCopy}
                  className="p-1 rounded-md hover:bg-vintage-100 text-vintage-500 hover:text-vintage-800 transition-colors"
                  title="코드 복사"
                >
                  {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Guide Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-vintage-700 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <ShieldCheck className="w-4 h-4 text-terracotta" />
              <span>현장 사용 방법</span>
            </div>
            <p className="text-[11px] leading-relaxed text-vintage-600">
              매장 결제 시 직원분께 위 QR 코드를 보여주시면 즉시 할인이 적용됩니다. (당일 1회 유효)
            </p>
          </div>

          {/* Action Button */}
          <div>
            {!isUsed ? (
              <button
                onClick={handleUseNow}
                className="w-full py-3 rounded-2xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-terracotta-light" />
                <span>현장에서 할인 적용 완료하기</span>
              </button>
            ) : (
              <div className="w-full py-3 rounded-2xl bg-emerald-100 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>할인 적용 완료됨 · 즐거운 출사 되세요!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};