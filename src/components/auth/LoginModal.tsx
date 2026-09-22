'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useAuth, TIER_INFO } from '@/context/AuthContext';

const KakaoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3C6.477 3 2 6.477 2 10.778c0 2.618 1.562 4.926 3.926 6.27l-.86 3.199a.4.4 0 0 0 .581.456l3.496-2.086c.585.089 1.186.139 1.857.139 5.523 0 10-3.477 10-7.778C22 6.477 17.523 3 12 3z" />
  </svg>
);

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, signInWithKakao, signInWithGoogle } = useAuth();
  if (!isLoginModalOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={closeLoginModal}>
      <div className="relative w-full max-w-sm bg-[#FAF8F5] rounded-3xl overflow-hidden shadow-2xl border border-vintage-200" onClick={e => e.stopPropagation()}>
        <button onClick={closeLoginModal} className="absolute top-4 right-4 p-1.5 text-vintage-400 hover:text-vintage-800 rounded-full hover:bg-vintage-100 transition-colors">
          <X className="w-4 h-4" />
        </button>
        <div className="pt-10 pb-6 px-8 text-center space-y-3 border-b border-vintage-100">
          <div className="w-14 h-14 rounded-2xl bg-terracotta text-white flex items-center justify-center mx-auto font-serif text-2xl font-bold shadow-sm">다</div>
          <div>
            <h2 className="font-serif text-xl font-bold text-vintage-900">DASI에 오신 걸 환영해요</h2>
            <p className="text-xs text-vintage-500 mt-1">로그인하면 찜 스팟랷쿠폰DASI 포인트가 영구 보관됩니다.</p>
          </div>
        </div>
        <div className="p-8 space-y-3">
          <button onClick={signInWithKakao} className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-3 bg-[#FEE500] hover:bg-[#F0D700] text-[#3B1E08] transition-all active:scale-95 shadow-xs">
            <KakaoIcon />카카오로 1초 시작하기
          </button>
          <button onClick={signInWithGoogle} className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-3 bg-white hover:bg-vintage-50 text-vintage-900 border border-vintage-200 transition-all active:scale-95 shadow-xs">
            구글로 로그인하기
          </button>
        </div>
        <div className="px-8 pb-8">
          <div className="p-4 rounded-2xl bg-vintage-50 border border-vintage-100 space-y-2">
            <div className="text-[10px] font-bold text-vintage-400 uppercase tracking-wider">멤버십 티어 혁택</div>
            {(Object.entries(TIER_INFO) as [string, { label: string; bg: string; color: string }][]).map(([key, info]) => (
              <div key={key} className="flex items-center gap-2 text-xs">
                <span className={['px-1.5 py-0.5 rounded text-[10px] font-bold', info.bg, info.color].join(' ')}>{info.label}</span>
                <span className="text-vintage-600">{key === 'filmmer' ? '가입 즉시' : key === 'photowalker' ? '500P 달성' : '3,000P 달성'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}