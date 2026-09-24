'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share, PlusSquare } from 'lucide-react';
import { useDevicePlatform } from '@/hooks/useDevicePlatform';

export const PwaInstallBanner: React.FC = () => {
  const { platform, isMobileView, triggerHaptic } = useDevicePlatform();
  const isIOS = platform === 'ios';
  const isMobile = isMobileView;
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // 이미 닫은 경우 확인
    const dismissed = sessionStorage.getItem('dasi_pwa_banner_dismissed');
    if (dismissed) return;

    // 이미 PWA 단독(standalone) 모드로 실행 중이면 숨김
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Android/Chrome beforeinstallprompt 감지
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS 모바일 Safari인 경우 일정 시간 후 노출
    if (isIOS && isMobile) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isIOS, isMobile]);

  const handleInstallClick = async () => {
    triggerHaptic('selection');
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    triggerHaptic('light');
    setIsVisible(false);
    sessionStorage.setItem('dasi_pwa_banner_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <aside aria-label="앱 설치 안내" className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-slideUp">
      <div className="p-4 rounded-2xl bg-vintage-950/95 backdrop-blur-md text-white border border-amber-500/30 shadow-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-terracotta text-white flex items-center justify-center shrink-0 shadow-sm">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <span>DASI 공식 모바일 앱</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-200">PWA</span>
            </div>
            <p className="text-[11px] text-vintage-300">
              홈 화면에 추가하고 앱처럼 더 빠르고 부드럽게 출사하세요
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-xl bg-terracotta hover:bg-terracotta-light text-white text-xs font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>앱 설치</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-vintage-400 hover:text-white rounded-lg transition-colors"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari '홈 화면에 추가' 툴팁 가이드 */}
      {showIOSGuide && (
        <div className="mt-2 p-3 rounded-xl bg-white text-vintage-900 border border-vintage-200 shadow-xl text-xs space-y-1.5 animate-fadeIn">
          <div className="font-bold flex items-center gap-1 text-terracotta">
            <Share className="w-3.5 h-3.5" />
            <span>아이폰(iOS) 홈 화면 추가 방법</span>
          </div>
          <p className="text-[11px] text-vintage-600 leading-snug">
            사파리 하단 바의 <strong>[공유]</strong> 아이콘을 누른 후, <strong>[홈 화면에 추가]</strong>를 탭하시면 네이티브 앱처럼 설치됩니다.
          </p>
          <button
            onClick={() => setShowIOSGuide(false)}
            className="w-full py-1 text-center text-[10px] text-vintage-500 hover:text-vintage-800 font-bold"
          >
            확인했습니다
          </button>
        </div>
      )}
    </aside>
  );
};

export default PwaInstallBanner;
