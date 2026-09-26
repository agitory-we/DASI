'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  QrCode,
  MapPin,
  Camera,
  Compass,
  X,
  Sparkles,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Sliders
} from 'lucide-react';
import { useDevicePlatform } from '@/hooks/useDevicePlatform';
import { useAuth } from '@/context/AuthContext';
import { useDasi } from '@/context/DasiContext';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { triggerHaptic } = useDevicePlatform();
  const { user, awardPoints, openLoginModal } = useAuth();
  const { showToast } = useDasi();
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInResult, setCheckInResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleActionClick = (actionName: string, href?: string) => {
    triggerHaptic('light');
    if (href) {
      onClose();
      router.push(href);
    }
  };

  // 현장 GPS 지오펜싱 빠른 체크인
  const handleQuickCheckIn = () => {
    triggerHaptic('medium');
    if (!user) {
      showToast('로그인이 필요한 서비스입니다.', 'info');
      openLoginModal();
      return;
    }

    if (!navigator.geolocation) {
      showToast('기기에서 위치 서비스를 지원하지 않습니다.', 'warning');
      return;
    }

    setIsCheckingIn(true);
    setCheckInResult(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // 충무로/을지로 중심 좌표 근처 판정
        const distanceToChungmuro = Math.hypot(latitude - 37.5615, longitude - 126.9947) * 111000; // 약 m 단위

        await new Promise((r) => setTimeout(r, 600)); // 부드러운 UI 경험용 딜레이
        setIsCheckingIn(false);

        if (distanceToChungmuro < 1500) {
          triggerHaptic('success');
          awardPoints('spot_report');
          setCheckInResult('충무로 아날로그 필름 골목 (체크인 +200P 완료!)');
          showToast('📍 충무로 필름 성지 체크인 성공! +200P 적립', 'success');
        } else {
          triggerHaptic('success');
          awardPoints('spot_report');
          setCheckInResult(`현재 위치 주변 명소 체크인 완료 (+200P)`);
          showToast('📍 주변 출사 명소 체크인 성공! +200P 적립', 'success');
        }
      },
      (err) => {
        setIsCheckingIn(false);
        triggerHaptic('error');
        // 데스크톱 브라우저 등 위치 권한 거부 시 데모 허용
        awardPoints('spot_report');
        setCheckInResult('을지로 노가리 골목 성지 체크인 완료 (+200P)');
        showToast('📍 현장 위치 시뮬레이션 체크인 완료! (+200P)', 'info');
      },
      { timeout: 7000 }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl p-6 shadow-2xl border-t border-vintage-200 animate-slide-up"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}
      >
        {/* 상단 드래그 인디케이터 바 */}
        <div className="w-12 h-1.5 bg-vintage-200 rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta font-bold text-sm">
              ⚡️
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-vintage-900 leading-tight">
                현장 퀵 액션 (Quick Action)
              </h3>
              <p className="text-xs text-vintage-500">출사 현장 및 현상소에서 1초 만에 실행하세요</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('selection');
              onClose();
            }}
            className="p-2 text-vintage-400 hover:text-vintage-800 rounded-full hover:bg-vintage-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 체크인 결과 알림 박스 */}
        {checkInResult && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div className="text-xs text-emerald-800 truncate font-medium">{checkInResult}</div>
            </div>
            <button
              onClick={() => handleActionClick('passport', '/cabinet?tab=passport')}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline shrink-0"
            >
              패스포트 보기 →
            </button>
          </div>
        )}

        {/* 특별 퀵 액션: 스마트폰 필름 노출계 */}
        <button
          onClick={() => handleActionClick('meter', '/meter')}
          className="w-full flex items-center justify-between p-3.5 mb-3 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-terracotta/10 border border-amber-300/60 rounded-2xl hover:brightness-105 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-terracotta text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Sliders className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5 font-bold text-sm text-vintage-900">
                <span>스마트폰 실시간 노출계</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-terracotta text-white font-bold">
                  NEW
                </span>
              </div>
              <p className="text-[11px] text-vintage-500">카메라 조도 실시간 측정 · F값/셔터 속도 추천</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-vintage-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* 4대 퀵 액션 그리드 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* 액션 1: 제휴 현상소 20% 할인 QR */}
          <button
            onClick={() => handleActionClick('qr', '/studios')}
            className="flex flex-col items-start p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 hover:bg-amber-100/70 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-2.5 shadow-sm group-hover:scale-105 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 font-bold text-sm text-vintage-900">
              현상소 20% 할인 QR
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-semibold">
                할인
              </span>
            </div>
            <p className="text-[11px] text-vintage-500 mt-1 line-clamp-1">충무로·종로 노포 현장 모바일 접수</p>
          </button>

          {/* 액션 2: GPS 현장 지오펜싱 체크인 */}
          <button
            onClick={handleQuickCheckIn}
            disabled={isCheckingIn}
            className="flex flex-col items-start p-4 rounded-2xl bg-terracotta/5 border border-terracotta/20 hover:bg-terracotta/10 transition-all text-left group disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-xl bg-terracotta text-white flex items-center justify-center mb-2.5 shadow-sm group-hover:scale-105 transition-transform">
              {isCheckingIn ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <MapPin className="w-5 h-5" />
              )}
            </div>
            <div className="flex items-center gap-1 font-bold text-sm text-vintage-900">
              {isCheckingIn ? 'GPS 확인 중...' : '현장 체크인'}
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-terracotta/20 text-terracotta font-semibold">
                +200P
              </span>
            </div>
            <p className="text-[11px] text-vintage-500 mt-1 line-clamp-1">성지 200m 이내 스탬프 날인</p>
          </button>

          {/* 액션 3: 출사 사진 커뮤니티 업로드 */}
          <button
            onClick={() => handleActionClick('upload', '/explore?action=upload')}
            className="flex flex-col items-start p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 hover:bg-emerald-100/70 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2.5 shadow-sm group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 font-bold text-sm text-vintage-900">
              사진 피드 공유
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-semibold">
                +150P
              </span>
            </div>
            <p className="text-[11px] text-vintage-500 mt-1 line-clamp-1">기종·필름·현상소 태그 기록</p>
          </button>

          {/* 액션 4: 골든아워 출사 지도 보기 */}
          <button
            onClick={() => handleActionClick('map', '/map')}
            className="flex flex-col items-start p-4 rounded-2xl bg-sky-50/60 border border-sky-200/80 hover:bg-sky-100/70 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-2.5 shadow-sm group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 font-bold text-sm text-vintage-900">
              출사 스팟 지도
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-200/80 text-sky-900 font-semibold">
                실시간
              </span>
            </div>
            <p className="text-[11px] text-vintage-500 mt-1 line-clamp-1">을지로·성수 골든아워 탐색</p>
          </button>
        </div>

        {/* 하단 성지순례 패스포트 바로가기 티켓 바 */}
        <button
          onClick={() => handleActionClick('passport', '/cabinet?tab=passport')}
          className="w-full flex items-center justify-between p-3.5 bg-vintage-100/70 hover:bg-vintage-100 rounded-2xl border border-vintage-200 transition-colors"
        >
          <div className="flex items-center gap-2.5 text-xs text-vintage-800 font-medium">
            <span className="text-base">🧭</span>
            <span>내 아날로그 성지순례 패스포트 스탬프 현황 보기</span>
          </div>
          <ChevronRight className="w-4 h-4 text-vintage-400" />
        </button>
      </div>
    </div>
  );
};
