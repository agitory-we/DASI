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
  Store
} from 'lucide-react';
import { GlobalSearchModal } from '@/components/common/GlobalSearchModal';
import { useDasi } from '@/context/DasiContext';
import { isAudioMuted, toggleAudioMute } from '@/utils/shutterAudio';
import { UserAvatar } from '@/components/auth/UserAvatar';
import { useAuth, TIER_INFO } from '@/context/AuthContext';


export const Header: React.FC = () => {
  const pathname = usePathname();
  const { rentingItems, ownedItems, bookedGigs, bookedExperiences, repairEstimates, proConsultations, showToast } = useDasi();
  const { user, profile } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [muted, setMuted] = useState(false);

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
    setIsMoreDropdownOpen(false);
  }, [pathname]);

  const coreNavItems = [
    { href: '/rent', label: '카메라 렌탈' },
    { href: '/map', label: '스팟 지도' },
    { href: '/gigs', label: '로컬 포토긱' },
    { href: '/clinic', label: '명장 케어' },
  ];

  const moreNavItems = [
    { href: '/experiences', label: '출사 & 클래스', desc: '작가 출사 워크숍 및 장인 정비 강습', icon: Compass },
    { href: '/explore', label: '서울 축제 & 출사지', desc: '시즌별 축제 및 골든아워 촬영 팁', icon: Calendar },
    { href: '/ai-appraisal', label: 'AI 카메라 감정', desc: '사진 3장 기반 외관 등급 및 시세 산출', icon: Sparkles },
    { href: '/frame', label: '필름 프레임 생성기', desc: '인스타 4:5 감성 워터마크 프레임 다운로드', icon: Share2 },
    { href: '/pro', label: 'DASI Pro 스튜디오', desc: '본식 웨딩 & 브랜드 룩북 전문 작가관', icon: Award },
    { href: '/partner', label: 'B2B 파트너 콘솔', desc: '현상소 1초 접수 QR 검증 & 실시간 재고 관리', icon: Store },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-vintage-200/80 bg-[#FAF8F5]/95 backdrop-blur-md">
      {/* Micro Top Announcement */}
      <div className="bg-[#2D241E] text-white px-4 py-1 text-center text-[11px] font-medium tracking-tight">
        <span>전 기기 40년 명장 정밀 오버홀 완료 · <strong>Rent-to-Own</strong> 대여료 100% 공제 후 소장</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Core Nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-terracotta text-white flex items-center justify-center font-serif text-base font-bold shadow-xs group-hover:bg-terracotta-dark transition-colors">
                다
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg text-vintage-900 tracking-tight leading-none">
                  다시 <span className="text-[11px] font-sans font-normal text-vintage-500">DASI</span>
                </span>
                <span className="text-[9px] text-vintage-500 font-medium tracking-wide">그때 그 취미, 다시</span>
              </div>
            </Link>

            {/* Desktop Core Nav (Clean & Spaced) */}
            <nav className="hidden md:flex items-center gap-1">
              {coreNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-vintage-200/80 text-vintage-900 shadow-2xs'
                        : 'text-vintage-700 hover:text-vintage-900 hover:bg-vintage-100/70'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {/* More Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsMoreDropdownOpen((prev) => !prev)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                    isMoreDropdownOpen
                      ? 'bg-vintage-200 text-vintage-900'
                      : 'text-vintage-700 hover:text-vintage-900 hover:bg-vintage-100/70'
                  }`}
                >
                  <span>더보기</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMoreDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMoreDropdownOpen && (
                  <div
                    className="absolute top-full left-0 mt-2 w-72 rounded-2xl bg-white border border-vintage-200 shadow-xl p-2 z-50 animate-fadeIn"
                    onMouseLeave={() => setIsMoreDropdownOpen(false)}
                  >
                    {moreNavItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-vintage-50 transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-vintage-100 text-terracotta group-hover:bg-terracotta group-hover:text-white transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-vintage-900">{item.label}</div>
                            <div className="text-[10px] text-vintage-500 leading-snug">{item.desc}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>
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
                    className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white border border-vintage-200 shadow-xl p-2 z-50 animate-fadeIn"
                    onMouseLeave={() => setIsNotifOpen(false)}
                  >
                    <div className="text-[10px] font-bold text-vintage-400 uppercase tracking-wider px-2 py-1.5">최근 알림</div>
                    <div className="space-y-0.5">
                      {notifications.map(n => (
                        <div
                          key={n.id}
                          className={['flex items-start gap-2.5 p-2.5 rounded-xl text-xs transition-colors', n.read ? 'text-vintage-500' : 'bg-amber-50 text-vintage-900'].join(' ')}
                        >
                          <span className="text-base shrink-0 mt-0.5">{n.icon}</span>
                          <div>
                            <div className="font-semibold leading-tight">{n.text}</div>
                            <div className="text-vintage-400 text-[10px] mt-0.5">{n.sub}</div>
                          </div>
                          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-terracotta shrink-0 mt-1.5 ml-auto" />}
                        </div>
                      ))}
                    </div>
                    <Link
                      href="/cabinet"
                      className="mt-2 block text-center text-[10px] font-bold text-terracotta hover:text-terracotta/80 py-1.5 border-t border-vintage-100"
                      onClick={() => setIsNotifOpen(false)}
                    >
                      전체 내역 보기 →
                    </Link>
                  </div>
                )}
              </div>
            )}

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
            {coreNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`p-3 rounded-xl font-bold flex items-center justify-between ${
                  pathname === item.href ? 'bg-vintage-900 text-white' : 'bg-vintage-50 text-vintage-800'
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
          </div>
        </div>
      )}

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
};
