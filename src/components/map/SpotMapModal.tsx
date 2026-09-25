'use client';

import React, { useEffect } from 'react';
import { X, ArrowLeft, MapPin } from 'lucide-react';
import { useDasi } from '@/context/DasiContext';
import MapPage from '@/app/map/page';

interface SpotMapModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const SpotMapModal: React.FC<SpotMapModalProps> = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  const { isMapModalOpen, closeMapModal } = useDasi();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isMapModalOpen;
  const handleClose = propOnClose || closeMapModal;

  // ESC 키 닫기 이벤트 핸들링
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-stone-950/85 backdrop-blur-md animate-fadeIn">
      {/* Modal Container: 거의 전체화면에 가까운 몰입형 대형 팝업 */}
      <div className="relative w-full h-full max-w-7xl max-h-[96vh] m-2 sm:m-4 bg-[#FAF8F5] rounded-3xl border border-vintage-300 shadow-2xl flex flex-col overflow-hidden">
        {/* 상단 모달 팝업 컨트롤 바 */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-3.5 bg-vintage-900 text-white border-b border-vintage-800 shrink-0 sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-xl bg-terracotta text-white flex items-center justify-center shadow-xs">
              <MapPin className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm sm:text-base text-white tracking-tight">
                  전국 아날로그 스팟 &amp; 당일 현상소 팝업 지도
                </span>
                <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                  웹 내 실시간 팝업 뷰
                </span>
              </div>
              <p className="text-[11px] text-vintage-300 hidden sm:block">
                창을 닫아도 보시던 페이지(홈/렌탈/캐비닛)의 상태와 스크롤이 그대로 유지됩니다.
              </p>
            </div>
          </div>

          {/* 오른쪽 닫기 버튼: X를 누르면 다시 웹으로 복귀 */}
          <button
            onClick={handleClose}
            className="group px-3 sm:px-4 py-2 rounded-xl bg-white/10 hover:bg-rose-600/90 text-white border border-white/20 hover:border-rose-500 text-xs font-bold flex items-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer"
            title="지도를 닫고 웹으로 돌아가기 (ESC)"
          >
            <span>웹으로 돌아가기</span>
            <div className="w-5 h-5 rounded-full bg-white/20 group-hover:bg-white text-white group-hover:text-rose-600 flex items-center justify-center transition-colors">
              <X className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>

        {/* 모달 내부: 스크롤 가능한 지도 페이지 콘텐츠 */}
        <div className="flex-1 overflow-y-auto">
          <MapPage />
        </div>
      </div>
    </div>
  );
};
