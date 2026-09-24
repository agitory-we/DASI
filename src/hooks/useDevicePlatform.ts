'use client';

import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export type DevicePlatform = 'ios' | 'android' | 'web';
export type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

export function useDevicePlatform() {
  const [platform, setPlatform] = useState<DevicePlatform>('web');
  const [isNativeApp, setIsNativeApp] = useState<boolean>(false);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    const native = Capacitor.isNativePlatform();
    setIsNativeApp(native);

    const detectedPlatform = Capacitor.getPlatform() as DevicePlatform;
    setPlatform(detectedPlatform || 'web');

    const checkMobile = () => {
      const widthMobile = typeof window !== 'undefined' ? window.innerWidth < 1024 : false;
      setIsMobileView(native || widthMobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const triggerHaptic = useCallback(async (type: HapticFeedbackType = 'light') => {
    try {
      if (Capacitor.isNativePlatform()) {
        switch (type) {
          case 'light':
            await Haptics.impact({ style: ImpactStyle.Light });
            break;
          case 'medium':
            await Haptics.impact({ style: ImpactStyle.Medium });
            break;
          case 'heavy':
            await Haptics.impact({ style: ImpactStyle.Heavy });
            break;
          case 'success':
            await Haptics.notification({ type: NotificationType.Success });
            break;
          case 'warning':
            await Haptics.notification({ type: NotificationType.Warning });
            break;
          case 'error':
            await Haptics.notification({ type: NotificationType.Error });
            break;
          case 'selection':
            await Haptics.selectionStart();
            break;
        }
      } else if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        // 모바일 웹 햅틱 Fallback
        switch (type) {
          case 'light':
          case 'selection':
            navigator.vibrate(10);
            break;
          case 'medium':
            navigator.vibrate(20);
            break;
          case 'heavy':
            navigator.vibrate([30, 20, 30]);
            break;
          case 'success':
            navigator.vibrate([15, 50, 25]);
            break;
          case 'warning':
          case 'error':
            navigator.vibrate([40, 40, 40]);
            break;
        }
      }
    } catch {
      // 햅틱 미지원 기기 무시
    }
  }, []);

  return {
    platform,
    isNativeApp,
    isMobileView,
    isMounted,
    triggerHaptic,
  };
}
