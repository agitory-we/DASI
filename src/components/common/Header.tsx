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
  Sliders,
  Film,
  Sun,
  Gift,
  Users,
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
  const { rentingItems, ownedItems, bookedGigs, bookedExperiences, repairEstimates, proConsultations, showToast, openMapModal, isAccessibilityMode, toggleAccessibilityMode } = useDasi();
  const { user, profile } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
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
    setIsMoreMenuOpen(false);
  }, [pathname]);

  // 1년 52주 취미 생태계의 7대 메인 GNB 라우트
  const mainGnbLinks = [
    { href: '/explore', label: '52주 출사지' },
    { href: '/golden-hour', label: '골든아워' },
    { href: '/map', label: '스팟 맵' },
    { href: '/films', label: '필름샵' },
    { href: '/rent', label: '장비 체험' },
    { href: '/studios', label: '제휴 현상소' },
    { href: '/clinic', label: '명장 케어' },
  ];

  // 더보기 드롭다운 라우트
  const moreNavItems = [
    { href: '/experiences', label: '출사 & 장인 클래스', desc: '작가 골목 출사 및 렌즈 분해 세척 원데이', icon: Compass },
    { href: '/gigs', label: '로컬 포토긱 동행', desc: '동네 사진가와 함께하는 1:1 스냅 & 출사 매칭', icon: Users },
    { href: '/meter', label: '스마트폰 실시간 노출계', desc: '스마트폰 조도 센서 측정 · 적정 F값/셔터 산출', icon: Sliders },
    { href: '/ai-appraisal', label: 'AI 카메라 감정', desc: '사진 3장 기반 외관 등급 및 실거래 시세 산출', icon: Sparkles },
    { href: '/frame', label: '인스타 필름프레임', desc: '내 사진에 기종·현상소 워터마크 입히기', icon: Share2 },
    { href: '/partner', label: 'B2B 파트너 제휴', desc: '현상소·수리실 모바일 1초 접수 QR 및 정산', icon: Store },
    { href: '/pro', label: 'DASI Pro 스튜디오', desc: '본식 웨딩 & 브랜드 룩북 전문 작가관', icon: Award },
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
        <div className="flex items-center justify-between h-14 gap-2">
          {/* Left: Mobile Drawer Trigger + Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
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

            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-2xs border border-vintage-300/80 bg-stone-900 shrink-0 group-hover:scale-105 transition-transform">
                <img
                  src="/icons/dasi_camera_icon.png"
                  alt="DASI 사진기 아이콘"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-serif font-bold text-base text-vintage-900 tracking-tight group-hover:text-terracotta transition-colors">
                DASI
              </span>
            </Link>
          </div>

          {/* Center: Desktop Global Navigation Bar (Direct Route Links) */}
          <nav className="hidden lg:flex items-center gap-1">
            {mainGnbLinks.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-vintage-900 text-white shadow-2xs font-bold'
                      : 'text-vintage-700 hover:text-vintage-950 hover:bg-vintage-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

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

            {/* 더보기 드롭다운 (클래스, 긱, 노출계, AI감정, 프레임, 토이 도구) */}
            <div className="relative">
              <button
                onClick={() => setIsMoreMenuOpen((v) => !v)}
                className={`hidden md:flex px-2.5 py-1.5 rounded-xl border items-center gap-1 transition-all text-xs font-semibold shadow-2xs ${
                  isMoreMenuOpen
                    ? 'bg-vintage-900 text-white border-vintage-900'
                    : 'bg-white hover:bg-vintage-100 text-vintage-700 border-vintage-200'
                }`}
                title="더보기 도구 및 커뮤니티"
              >
                <span>더보기</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMoreMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white border border-vintage-200 shadow-2xl p-2 z-50 animate-fadeIn space-y-1"
                  onMouseLeave={() => setIsMoreMenuOpen(false)}
                >
                  <div className="text-[10px] font-bold text-vintage-400 uppercase tracking-wider px-2 py-1">
                    취미 클래스 &amp; 스마트 도구
                  </div>
                  {moreNavItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMoreMenuOpen(false)}
                        className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-vintage-50 transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-vintage-100 group-hover:bg-terracotta/10 group-hover:text-terracotta text-vintage-700 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-vintage-900 group-hover:text-terracotta transition-colors">
                            {item.label}
                          </div>
                          <div className="text-[10px] text-vintage-500 truncate leading-snug">
                            {item.desc}
                          </div>
                        </div>
                      </Link>
                    );
                  })}

                  <div className="border-t border-vintage-100 my-1 pt-1">
                    <div className="text-[10px] font-bold text-vintage-400 uppercase tracking-wider px-2 py-1">
                      손맛 체험 &amp; 접근성
                    </div>
                    <div className="grid grid-cols-2 gap-1 px-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMoreMenuOpen(false);
                          setIsVendingOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Gift className="w-3 h-3 text-amber-600" />
                        <span>필름 자판기</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMoreMenuOpen(false);
                          setIsViewfinderOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Camera className="w-3 h-3 text-stone-700" />
                        <span>가상 뷰파인더</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-vintage-600">
                      <button
                        type="button"
                        onClick={toggleAccessibilityMode}
                        className="flex items-center gap-1 hover:text-vintage-900 font-medium"
                      >
                        <span>👓 큰글씨 모드:</span>
                        <span className="font-bold text-terracotta">{isAccessibilityMode ? 'ON' : 'OFF'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleToggleSound}
                        className="flex items-center gap-1 hover:text-vintage-900 font-medium"
                      >
                        {muted ? <VolumeX className="w-3 h-3 text-vintage-400" /> : <Volume2 className="w-3 h-3 text-terracotta" />}
                        <span>{muted ? '음소거' : '셔터음 ON'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

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
            {mainGnbLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`p-3 rounded-xl font-bold flex items-center justify-between transition-colors ${
                  pathname === item.href ? 'bg-vintage-900 text-white' : 'bg-vintage-50 text-vintage-800 hover:bg-vintage-100'
                }`}
              >
                <span>{item.label}</span>
              </Link>
            ))}
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
              <Link
                href="/studios"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full p-2.5 rounded-xl bg-gradient-to-r from-amber-100 to-amber-200 text-amber-900 text-xs font-bold flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-terracotta" />
                  <span>서울 사진관 &amp; DASI 제휴 현상소</span>
                </div>
                <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">
                  20% 할인 QR
                </span>
              </Link>

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
