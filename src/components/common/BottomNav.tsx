'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Camera, MapPin, FolderLock, Zap } from 'lucide-react';
import { useDasi } from '@/context/DasiContext';
import { useDevicePlatform } from '@/hooks/useDevicePlatform';
import { QuickActionModal } from '@/components/common/QuickActionModal';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { rentingItems, ownedItems, bookedGigs, bookedExperiences, repairEstimates, proConsultations } = useDasi();
  const { triggerHaptic } = useDevicePlatform();
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  const totalCabinetCount =
    rentingItems.filter((r) => !r.isConvertedToOwn).length +
    ownedItems.length +
    bookedGigs.length +
    bookedExperiences.length +
    repairEstimates.length +
    proConsultations.length;

  const handleNavClick = () => {
    triggerHaptic('selection');
  };

  const handleQuickActionOpen = () => {
    triggerHaptic('medium');
    setIsQuickActionOpen(true);
  };

  return (
    <>
      <nav
        className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-vintage-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.35rem)' }}
      >
        <div className="flex items-center justify-around px-2 pt-1.5">
          {/* 1. 홈 */}
          <Link
            href="/"
            onClick={handleNavClick}
            className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              pathname === '/'
                ? 'text-terracotta font-bold'
                : 'text-vintage-500 hover:text-vintage-800'
            }`}
          >
            <Home className={`w-5 h-5 ${pathname === '/' ? 'scale-110 text-terracotta' : ''} transition-transform`} />
            <span className="text-[11px] mt-0.5 tracking-tight">홈</span>
          </Link>

          {/* 2. 렌탈·소장 */}
          <Link
            href="/rent"
            onClick={handleNavClick}
            className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              pathname.startsWith('/rent')
                ? 'text-terracotta font-bold'
                : 'text-vintage-500 hover:text-vintage-800'
            }`}
          >
            <Camera className={`w-5 h-5 ${pathname.startsWith('/rent') ? 'scale-110 text-terracotta' : ''} transition-transform`} />
            <span className="text-[11px] mt-0.5 tracking-tight">렌탈·소장</span>
          </Link>

          {/* 3. 중앙 현장 퀵 액션 (Floating Button) */}
          <div className="relative -top-3.5 flex flex-col items-center">
            <button
              onClick={handleQuickActionOpen}
              className="w-13 h-13 rounded-full bg-gradient-to-tr from-terracotta to-terracotta/90 text-white flex items-center justify-center shadow-lg shadow-terracotta/30 border-4 border-white hover:scale-105 active:scale-95 transition-transform"
              aria-label="현장 퀵 액션"
            >
              <Zap className="w-6 h-6 fill-current text-white animate-pulse" />
            </button>
            <span className="text-[10px] font-bold text-terracotta -mt-1 tracking-tight">퀵액션</span>
          </div>

          {/* 4. 스팟지도 */}
          <Link
            href="/map"
            onClick={handleNavClick}
            className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              pathname.startsWith('/map')
                ? 'text-terracotta font-bold'
                : 'text-vintage-500 hover:text-vintage-800'
            }`}
          >
            <MapPin className={`w-5 h-5 ${pathname.startsWith('/map') ? 'scale-110 text-terracotta' : ''} transition-transform`} />
            <span className="text-[11px] mt-0.5 tracking-tight">스팟지도</span>
          </Link>

          {/* 5. 마이캐비닛 */}
          <Link
            href="/cabinet"
            onClick={handleNavClick}
            className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              pathname.startsWith('/cabinet')
                ? 'text-terracotta font-bold'
                : 'text-vintage-500 hover:text-vintage-800'
            }`}
          >
            <div className="relative">
              <FolderLock className={`w-5 h-5 ${pathname.startsWith('/cabinet') ? 'scale-110 text-terracotta' : ''} transition-transform`} />
              {totalCabinetCount > 0 ? (
                <span className="absolute -top-1.5 -right-2.5 px-1 min-w-[15px] h-[15px] rounded-full bg-terracotta text-white text-[9px] font-bold flex items-center justify-center">
                  {totalCabinetCount}
                </span>
              ) : null}
            </div>
            <span className="text-[11px] mt-0.5 tracking-tight">캐비닛</span>
          </Link>
        </div>
      </nav>

      {/* 중앙 퀵 액션 바텀 시트 */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
      />
    </>
  );
};
