'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Camera,
  MapPin,
  Sparkles,
  Wrench,
  Search,
  FolderLock,
  Menu,
  X,
  ChevronDown,
  Award,
  Share2,
  Compass,
  Calendar,
  Volume2,
  VolumeX,
  Bell,
  Star,
  Store,
  Sliders
} from 'lucide-react';
import { GlobalSearchModal } from '@/components/common/GlobalSearchModal';
import { useDasi } from '@/context/DasiContext';
import { isAudioMuted, toggleAudioMute } from '@/utils/shutterAudio';
import { UserAvatar } from '@/components/auth/UserAvatar';
import { useAuth, TIER_INFO } from '@/context/AuthContext';
import { useDevicePlatform } from '@/hooks/useDevicePlatform';
import {
  registerServiceWorker,
  sendLocalNotification,
  PUSH_SCENARIOS,
  requestNotificationPermission,
  checkNotificationPermission,
} from '@/utils/webPush';
import { FilmVendingMachineModal } from '@/components/fun/FilmVendingMachineModal';
import { ViewfinderToyModal } from '@/components/fun/ViewfinderToyModal';
import { StudioDirectoryModal } from '@/components/studio/StudioDirectoryModal';
import { Gift } from 'lucide-react';

export interface HeaderProps {
  onOpenMobileSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  isSidebarCollapsed,
  onToggleSidebarCollapse,
}) => {
  const pathname = usePathname();
  const { triggerHaptic } = useDevicePlatform();
  const { rentingItems, ownedItems, bookedGigs, bookedExperiences, repairEstimates, proConsultations, showToast, openMapModal } = useDasi();
  const { user, profile } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isVendingOpen, setIsVendingOpen] = useState(false);
  const [isViewfinderOpen, setIsViewfinderOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [pushPerm, setPushPerm] = useState<string>('default');

  // Service Worker 등록 및 푸시 권한 확인
  useEffect(() => {
    registerServiceWorker();
    setPushPerm(checkNotificationPermission());
  }, []);

  const handleTogglePush = async () => {
    const res = await requestNotificationPermission();
    setPushPerm(res);
    if (res === 'granted') {
      showToast('🔔 브라우저 푸시 알림이 활성화되었습니다!', 'success');
      sendLocalNotification('DASI 알림 설정 완료', '이제 골든아워와 현상 완료 소식을 가장 먼저 받아보실 수 있습니다.', '/explore');
    } else {
      showToast('브라우저 알림 권한이 허용되지 않았습니다.', 'warning');
    }
  };

  const handleTestPush = (scenario: typeof PUSH_SCENARIOS[0]) => {
    sendLocalNotification(scenario.title, scenario.body, scenario.url);
    showToast(`🔔 [${scenario.label}] 푸시 알림을 전송했습니다.`, 'info');
  };

  // 미읽음 알림 (UI 레벨 stub — 포인트 적립·체크인·수리 완료 시뮬레이션)
  const notifications = profile ? [
    { id: 'n1', icon: '⭐', text: `${profile.total_points.toLocaleString()}P 누적 달성!`, sub: '계속 기여하면 다음 티어가 가까워집니다', read: false },
    { id: 'n2', icon: '📍', text: '출사 명소 체크인 완료', sub: '골든아워 스탬프 1개 획득', read: true },
    { id: 'n3', icon: '🧪', text: '현상소 스캔 접수 완료', sub: '노리츠 스캐너 · 3~5 영업일 내 완료 예정', read: true },
  ] : [];
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    setMuted(isAudioMuted());
  }, []);

  const handleToggleSound = () => {
    const next = toggleAudioMute();
    setMuted(next);
    showToast(next ? '셔터 효과음이 음소거되었습니다.' : '셔터 효과음이 켜졌습니다.', 'info');
  };

  const totalCabinetCount =
    rentingItems.filter((r) => !r.isConvertedToOwn).length +
    ownedItems.length +
    bookedGigs.length +
    bookedExperiences.length +
    repairEstimates.length +
    proConsultations.length;

  // Bind Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const coreNavItems = [
    { href: '/rent', label: '카메라 렌탈' },
    { href: '/map', label: '스팟 지도', isModal: true },
    { href: '/gigs', label: '로컬 포토긱' },
    { href: '/clinic', label: '명장 케어' },
  ];

  const moreNavItems = [
    { href: '/meter', label: '실시간 필름 노출계', desc: '카메라 조도 측정 및 명장 추천 F값/셔터 산출', icon: Sliders },
    { href: '/experiences', label: '출사 & 클래스', desc: '작가 출사 워크숍 및 장인 정비 강습', icon: Compass },
    { href: '/explore', label: '서울 축제 & 출사지', desc: '시즌별 축제 및 골든아워 촬영 팁', icon: Calendar },
    { href: '/ai-appraisal', label: 'AI 카메라 감정', desc: '사진 3장 기반 외관 등급 및 시세 산출', icon: Sparkles },
    { href: '/frame', label: '필름 프레임 생성기', desc: '인스타 4:5 감성 워터마크 프레임 다운로드', icon: Share2 },
    { href: '/pro', label: 'DASI Pro 스튜디오', desc: '본식 웨딩 & 브랜드 룩북 전문 작가관', icon: Award },
    { href: '/partner', label: 'B2B 파트너 콘솔', desc: '현상소 1초 접수 QR 검증 & 실시간 재고 관리', icon: Store },
  ];

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-vintage-200/80 bg-[#FAF8F5]/95 backdrop-blur-md pt-safe"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* Micro Top Announcement */}
      <div className="bg-[#2D241E] text-white px-4 py-1 text-center text-[11px] font-medium tracking-tight">
        <span>전 기기 40년 명장 정밀 오버홀 완료 · <strong>Rent-to-Own</strong> 대여료 100% 공제 후 소장</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Mobile Drawer Trigger + Desktop Quick Path */}
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Trigger */}
            <button
              onClick={() => {
                if (onOpenMobileSidebar) {
                  onOpenMobileSidebar();
                } else {
                  setIsMobileMenuOpen((prev) => !prev);
                }
              }}
              className="lg:hidden p-2 rounded-xl bg-vintage-100 hover:bg-vintage-200 text-vintage-800 transition-colors shadow-2xs"
              aria-label="메뉴 열기"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Brand Logo */}
            <Link href="/" className="lg:hidden flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-terracotta text-white flex items-center justify-center font-serif text-sm font-bold shadow-xs">
                다
              </div>
              <span className="font-serif font-bold text-base text-vintage-900 tracking-tight">
                DASI
              </span>
            </Link>

            {/* Desktop Section Indicator & Quick Shortcut */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-vintage-600">
              <span className="font-semibold text-vintage-900">DASI 아날로그 허브</span>
              <span className="text-vintage-300">/</span>
              <span className="px-2 py-0.5 rounded-full bg-vintage-100 font-medium text-vintage-700">
                {pathname === '/' ? '홈 피드' : pathname.replace('/', '').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 실시간 포인트 배지 (로그인 시) */}
            {user && profile && (
              <Link
                href="/cabinet?tab=points"
                className={[
                  'hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all hover:scale-105 shadow-xs',
                  TIER_INFO[profile.tier].bg,
                  TIER_INFO[profile.tier].color,
                  'border-transparent'
                ].join(' ')}
                title="포인트 잔액 및 티어 확인"
              >
                <Star className="w-3 h-3 fill-current" />
                <span>{profile.total_points.toLocaleString()}P</span>
                <span className="opacity-50">·</span>
                <span>{TIER_INFO[profile.tier].label}</span>
              </Link>
            )}

            {/* 알림 벨 (로그인 시) */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsNotifOpen(v => !v)}
                  className="relative p-2 rounded-xl bg-white hover:bg-vintage-100/80 text-vintage-700 border border-vintage-200 transition-all shadow-xs"
                  title="알림"
                >
                  <Bell className="w-3.5 h-3.5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-terracotta text-white text-[9px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {isNotifOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white border border-vintage-200 shadow-xl p-3 z-50 animate-fadeIn space-y-2.5"
                    onMouseLeave={() => setIsNotifOpen(false)}
                  >
                    {/* Web Push Toggle Header (Sprint 5) */}
                    <div className="p-2.5 rounded-xl bg-vintage-50 border border-vintage-200/80 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-bold text-vintage-900 flex items-center gap-1">
                          <span>🔔 브라우저 푸시 알림</span>
                          {pushPerm === 'granted' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">ON</span>
                          )}
                        </div>
                        <div className="text-[9px] text-vintage-500">골든아워·현상완료 실시간 알림</div>
                      </div>
                      <button
                        onClick={handleTogglePush}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          pushPerm === 'granted'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-vintage-900 hover:bg-terracotta text-white'
                        }`}
                      >
                        {pushPerm === 'granted' ? '활성화됨' : '알림 켜기'}
                      </button>
                    </div>

                    {/* Quick Push Test Scenarios */}
                    {pushPerm === 'granted' && (
                      <div className="px-1 space-y-1">
                        <div className="text-[9px] text-vintage-400 font-bold uppercase tracking-wider">푸시 알림 테스트 시뮬레이션</div>
                        <div className="grid grid-cols-3 gap-1 text-[10px]">
                          {PUSH_SCENARIOS.map((sc) => (
                            <button
                              key={sc.id}
                              onClick={() => handleTestPush(sc)}
                              className="p-1 rounded-lg bg-vintage-100 hover:bg-vintage-200 text-vintage-800 font-medium truncate text-center transition-colors"
                              title={sc.title}
                            >
                              {sc.label.split(' ')[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-[10px] font-bold text-vintage-400 uppercase tracking-wider px-1 pt-1">최근 알림</div>
                    <div className="space-y-0.5 max-h-48 overflow-y-auto">
                      {notifications.map(n => (
                        <div
                          key={n.id}
                          className={['flex items-start gap-2.5 p-2 rounded-xl text-xs transition-colors', n.read ? 'text-vintage-500' : 'bg-amber-50 text-vintage-900'].join(' ')}
                        >
                          <span className="text-base shrink-0 mt-0.5">{n.icon}</span>
                          <div>
                            <div className="font-semibold leading-tight text-xs">{n.text}</div>
                            <div className="text-vintage-400 text-[10px] mt-0.5">{n.sub}</div>
                          </div>
                          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-terracotta shrink-0 mt-1.5 ml-auto" />}
                        </div>
                      ))}
                    </div>
                    <Link
                      href="/cabinet"
                      className="block text-center text-[10px] font-bold text-terracotta hover:text-terracotta/80 py-1.5 border-t border-vintage-100"
                      onClick={() => setIsNotifOpen(false)}
                    >
                      전체 내역 &amp; 성지순례 패스포트 보기 →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* 전국 아날로그 스팟 & 당일 현상소 팝업 지도 런처 */}
            <button
              onClick={() => openMapModal()}
              className="px-2.5 py-1.5 rounded-xl bg-terracotta/10 hover:bg-terracotta/20 text-terracotta border border-terracotta/30 flex items-center gap-1.5 transition-all shadow-2xs hover:scale-105 active:scale-95 text-xs font-bold"
              title="전국 아날로그 스팟 & 당일 현상소 팝업 지도 (X 누르면 웹으로 복귀)"
            >
              <MapPin className="w-3.5 h-3.5 text-terracotta" />
              <span className="hidden xl:inline-block">스팟 맵</span>
              <span className="text-[9px] px-1 py-0.2 bg-terracotta text-white rounded font-mono">POPUP</span>
            </button>

            {/* 서울 사진관 & 제휴 현상소 디렉토리 런처 */}
            <button
              onClick={() => setIsStudioOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1.5 transition-all shadow-2xs hover:scale-105 active:scale-95 text-xs font-bold"
              title="서울시 사진관 & DASI 제휴 현상소 (20% 할인 QR & 노포 헤리티지)"
            >
              <Store className="w-3.5 h-3.5 text-terracotta" />
              <span className="hidden xl:inline-block">사진관·현상소</span>
            </button>

            {/* 을지로 24시 필름 자판기 가챠 런처 */}
            <button
              onClick={() => setIsVendingOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-amber-600/25 hover:from-amber-500/25 hover:to-amber-600/35 text-amber-900 border border-amber-300/80 flex items-center gap-1.5 transition-all shadow-2xs hover:scale-105 active:scale-95 text-xs font-bold"
              title="을지로 24시 필름 가챠 자판기 (쿠폰 & 한정판 스티커)"
            >
              <Gift className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span className="hidden lg:inline-block">필름 자판기</span>
            </button>

            {/* 찰칵-치익 가상 뷰파인더 토이 런처 */}
            <button
              onClick={() => setIsViewfinderOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 flex items-center gap-1.5 transition-all shadow-2xs hover:scale-105 active:scale-95 text-xs font-bold"
              title="가상 뷰파인더 & 와인딩 레버 (기계식 손맛)"
            >
              <Camera className="w-3.5 h-3.5 text-stone-700" />
              <span className="hidden lg:inline-block">뷰파인더</span>
            </button>

            {/* Shutter Sound Mute Toggle */}
            <button
              onClick={handleToggleSound}
              className={`p-2 rounded-xl border transition-all shadow-2xs ${
                muted
                  ? 'bg-vintage-100 text-vintage-400 border-vintage-300'
                  : 'bg-white hover:bg-vintage-100 text-terracotta border-vintage-200'
              }`}
              title={muted ? '셔터 효과음 켜기' : '셔터 효과음 끄기 (음소거)'}
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="px-3 py-2 rounded-xl bg-white hover:bg-vintage-100/80 text-vintage-700 border border-vintage-200 flex items-center gap-2 transition-all shadow-2xs"
              title="전역 검색 (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-terracotta" />
              <span className="hidden sm:inline-block text-xs font-medium text-vintage-500">통합 검색</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] font-mono text-vintage-400 bg-vintage-50 rounded border border-vintage-200">
                ⌘K
              </kbd>
            </button>

            {/* My Cabinet */}
            <Link
              href="/cabinet"
              className="relative p-2 sm:px-3 sm:py-2 rounded-xl bg-white hover:bg-vintage-100/80 text-vintage-700 border border-vintage-200 flex items-center gap-1.5 transition-all shadow-2xs text-xs font-semibold"
              title="마이 캐비닛"
            >
              <FolderLock className="w-4 h-4 text-terracotta" />
              <span className="hidden sm:inline-block">캐비닛</span>
              {totalCabinetCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 min-w-[18px] h-[18px] rounded-full bg-terracotta text-white text-[10px] font-bold">
                  {totalCabinetCount}
                </span>
              )}
            </Link>

            {/* 사용자 아바타 (로그인 시) / 로그인 버튼 (비로그인 시) */}
            <UserAvatar />

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-xl text-vintage-700 hover:bg-vintage-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-vintage-200 bg-white p-4 space-y-3 animate-fadeIn">
          {/* Quick Cabinet Access in Mobile Menu */}
          <Link
            href="/cabinet"
            className="p-3 rounded-2xl bg-gradient-to-r from-vintage-900 to-vintage-800 text-white flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-2">
              <FolderLock className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold">마이 디지털 캐비닛</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-mono font-bold">
              {totalCabinetCount}건 보관 중
            </span>
          </Link>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {coreNavItems.map((item) => {
              if (item.isModal) {
                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openMapModal();
                    }}
                    className="p-3 rounded-xl font-bold flex items-center justify-between bg-amber-500/10 text-amber-900 border border-amber-200/80 text-left transition-all hover:bg-amber-500/20 shadow-2xs"
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-terracotta text-white font-mono">POPUP</span>
                  </button>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`p-3 rounded-xl font-bold flex items-center justify-between ${
                    pathname === item.href ? 'bg-vintage-900 text-white' : 'bg-vintage-50 text-vintage-800'
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-vintage-100 space-y-1">
            <div className="text-[10px] font-bold text-vintage-400 uppercase tracking-wider px-1">
              부가 서비스 &amp; 도구
            </div>
            {moreNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-vintage-50 text-xs text-vintage-800 font-medium"
                >
                  <Icon className="w-4 h-4 text-terracotta" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            {/* 모바일 전용 인터랙티브 토이 바로가기 */}
            {/* 모바일 전용 인터랙티브 토이 & 사진관 바로가기 */}
            <div className="pt-2 border-t border-vintage-100 space-y-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsStudioOpen(true);
                }}
                className="w-full p-2.5 rounded-xl bg-gradient-to-r from-amber-100 to-amber-200 text-amber-900 text-xs font-bold flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-terracotta" />
                  <span>서울 사진관 &amp; DASI 제휴 현상소</span>
                </div>
                <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">
                  20% 할인 QR
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsVendingOpen(true);
                  }}
                  className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Gift className="w-4 h-4 text-amber-600" />
                  <span>🎰 필름 자판기</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsViewfinderOpen(true);
                  }}
                  className="p-2.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Camera className="w-4 h-4 text-stone-700" />
                  <span>📸 뷰파인더 토이</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Film Vending Machine Modal */}
      <FilmVendingMachineModal isOpen={isVendingOpen} onClose={() => setIsVendingOpen(false)} />

      {/* Viewfinder Toy Modal */}
      <ViewfinderToyModal isOpen={isViewfinderOpen} onClose={() => setIsViewfinderOpen(false)} />

      {/* Seoul Photo Studio & Partner Lab Directory Modal */}
      <StudioDirectoryModal isOpen={isStudioOpen} onClose={() => setIsStudioOpen(false)} />
    </header>
  );
};
