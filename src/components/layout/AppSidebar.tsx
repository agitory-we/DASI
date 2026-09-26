'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  Calendar,
  Sun,
  MapPin,
  Camera,
  Film,
  Wrench,
  Sparkles,
  Ticket,
  Coins,
  Share2,
  Award,
  Store,
  Sliders,
  Users,
  ChevronLeft,
  ChevronRight,
  Radio,
  Clock,
  X,
} from 'lucide-react';
import { useDasi } from '@/context/DasiContext';
import { useAuth } from '@/context/AuthContext';
import * as SunCalc from 'suncalc';

interface AppSidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isOpenMobile = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const pathname = usePathname();
  const { cameras, analogSpots, meetups, coupons, openMapModal } = useDasi();
  const { profile } = useAuth();

  // 실시간 일몰/골든아워 계산 (서울 위경도)
  const [sunsetInfo, setSunsetInfo] = useState<{ sunset: string; golden: string }>({
    sunset: '18:24',
    golden: '17:24',
  });

  useEffect(() => {
    try {
      const now = new Date();
      const times = SunCalc.getTimes(now, 37.5665, 126.978);
      if (times.sunset && !isNaN(times.sunset.getTime())) {
        const sh = String(times.sunset.getHours()).padStart(2, '0');
        const sm = String(times.sunset.getMinutes()).padStart(2, '0');
        const gh = String(new Date(times.sunset.getTime() - 60 * 60 * 1000).getHours()).padStart(2, '0');
        const gm = String(new Date(times.sunset.getTime() - 60 * 60 * 1000).getMinutes()).padStart(2, '0');
        setSunsetInfo({
          sunset: `${sh}:${sm}`,
          golden: `${gh}:${gm}`,
        });
      }
    } catch {
      // fallback
    }
  }, []);

  // 통계 카운트 계산
  const availableCamCount = cameras.filter((c) => c.isAvailable).length;
  const spotCount = analogSpots.length;
  const meetupCount = meetups.length;
  const couponCount = coupons.filter((c) => !c.isUsed).length;
  const points = profile?.total_points ?? 1200;

  // 5대 핵심 카테고리 그룹 (52주 아날로그 취미 생태계 & 플레이그라운드 중심)
  const menuGroups = [
    {
      groupTitle: '출사 & 52주 영감',
      groupTag: 'EXPLORE',
      tagColor: 'text-purple-700 bg-purple-50 border-purple-200',
      dotColor: 'bg-purple-500',
      items: [
        {
          title: '서울 52주 축제 & 핫스팟',
          href: '/explore',
          icon: Calendar,
          badge: `${spotCount || 18}곳`,
          badgeColor: 'bg-purple-100 text-purple-700',
        },
        {
          title: '골든아워 실시간 예보',
          href: '/golden-hour',
          icon: Sun,
          badge: 'LIVE',
          badgeColor: 'bg-amber-100 text-amber-700 animate-pulse',
        },
        {
          title: '52주 출사 모임 & 주말 번개',
          href: '/experiences',
          icon: Compass,
          badge: `${meetupCount || 4}개`,
          badgeColor: 'bg-amber-100 text-amber-900 font-bold',
        },
        {
          title: '로컬 포토긱 & 출사 동행',
          href: '/gigs',
          icon: Users,
          badge: '동행 매칭',
          badgeColor: 'bg-sky-100 text-sky-800 font-semibold',
        },
      ],
    },
    {
      groupTitle: '장비 & 필름 서포트',
      groupTag: 'EQUIPMENT',
      tagColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      dotColor: 'bg-emerald-500',
      items: [
        {
          title: '내 주변 당일 수령 맵',
          href: '/map',
          icon: MapPin,
          badge: '당일 수령',
          badgeColor: 'bg-emerald-100 text-emerald-800 font-bold',
        },
        {
          title: '필름 주문 & 대량 벌크샵',
          href: '/films',
          icon: Film,
          badge: '당일 퀵',
          badgeColor: 'bg-rose-100 text-rose-700 font-bold',
        },
        {
          title: '카메라 체험 & 소장(Rent-to-Own)',
          href: '/rent',
          icon: Camera,
          badge: `${availableCamCount}대`,
          badgeColor: 'bg-terracotta/10 text-terracotta font-semibold',
        },
        {
          title: '서울 제휴 현상소 & 사진관',
          href: '/studios',
          icon: Store,
          badge: 'QR 20%↓',
          badgeColor: 'bg-amber-100 text-amber-800 font-bold',
        },
      ],
    },
    {
      groupTitle: '명장 케어 & 스마트 도구',
      groupTag: 'TOOLS',
      tagColor: 'text-amber-700 bg-amber-50 border-amber-200',
      dotColor: 'bg-amber-500',
      items: [
        {
          title: '40년 명장 정밀 클리닉',
          href: '/clinic',
          icon: Wrench,
          badge: '무료 점검',
          badgeColor: 'bg-amber-100 text-amber-800',
        },
        {
          title: '스마트폰 실시간 노출계',
          href: '/meter',
          icon: Sliders,
          badge: 'LIVE',
          badgeColor: 'bg-emerald-100 text-emerald-800 font-bold',
        },
        {
          title: 'AI 카메라 감정 & 보증서',
          href: '/ai-appraisal',
          icon: Sparkles,
          badge: 'VISION',
          badgeColor: 'bg-indigo-100 text-indigo-700',
        },
      ],
    },
    {
      groupTitle: '혜택 & 리워드',
      groupTag: 'BENEFIT',
      tagColor: 'text-rose-700 bg-rose-50 border-rose-200',
      dotColor: 'bg-rose-500',
      items: [
        {
          title: '제휴 할인 QR 쿠폰 지갑',
          href: '/cabinet?tab=coupons',
          icon: Ticket,
          badge: `${couponCount}장`,
          badgeColor: 'bg-rose-100 text-rose-700 font-bold',
        },
        {
          title: 'DASI 포인트 교환소',
          href: '/cabinet?tab=points',
          icon: Coins,
          badge: `${points.toLocaleString()}P`,
          badgeColor: 'bg-amber-100 text-amber-800 font-bold',
        },
        {
          title: '필름 프레임 메이커',
          href: '/frame',
          icon: Share2,
          badge: '무료',
          badgeColor: 'bg-slate-100 text-slate-600',
        },
      ],
    },
    {
      groupTitle: '전문관 & 파트너',
      groupTag: 'PORTAL',
      tagColor: 'text-slate-700 bg-slate-100 border-slate-200',
      dotColor: 'bg-slate-400',
      items: [
        {
          title: 'DASI Pro 스튜디오',
          href: '/pro',
          icon: Award,
          badge: 'VIP',
          badgeColor: 'bg-vintage-900 text-white',
        },
        {
          title: 'B2B 파트너 콘솔',
          href: '/partner',
          icon: Store,
          badge: '상점용',
          badgeColor: 'bg-blue-100 text-blue-700',
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#FAF8F5] select-none border-r border-vintage-200/80">
      {/* 1. Brand Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-vintage-200/80 bg-white/70 backdrop-blur-xs shrink-0">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden group">
          <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-xs shrink-0 border border-vintage-300/80 bg-stone-900 group-hover:scale-105 transition-transform">
            <img
              src="/icons/dasi_camera_icon.png"
              alt="DASI 아날로그 카메라 로고"
              className="w-full h-full object-cover"
            />
          </div>
          {!isCollapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-serif font-bold text-lg text-vintage-900 tracking-tight">
                DASI
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-terracotta/10 text-terracotta text-[10px] font-bold shrink-0">
                AI 2.0
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-semibold border border-emerald-200/60 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-7 h-7 rounded-lg border border-vintage-200 bg-white hover:bg-vintage-100 text-vintage-600 items-center justify-center transition-colors shrink-0 shadow-2xs"
            title={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden w-8 h-8 rounded-lg bg-vintage-100 text-vintage-700 flex items-center justify-center hover:bg-vintage-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. Grouped Menu Navigation (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1.5">
            {/* Group Header */}
            {!isCollapsed ? (
              <div className="flex items-center justify-between px-2.5 py-1">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${group.dotColor}`} />
                  <span className="text-[11px] font-bold text-vintage-500 uppercase tracking-wider">
                    {group.groupTitle}
                  </span>
                </div>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${group.tagColor}`}
                >
                  {group.groupTag}
                </span>
              </div>
            ) : (
              <div className="flex justify-center py-1">
                <span className={`w-1.5 h-1.5 rounded-full ${group.dotColor}`} />
              </div>
            )}

            {/* Menu Items */}
            <div className="space-y-0.5">
              {group.items.map((item, iIdx) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && !item.href.includes('#'));
                const IconComponent = item.icon;

                return (
                  <Link
                    key={iIdx}
                    href={item.href}
                    onClick={(e) => {
                      if (item.href === '/map') {
                        e.preventDefault();
                        openMapModal();
                      }
                      if (onCloseMobile) onCloseMobile();
                    }}
                    title={isCollapsed ? item.title : undefined}
                    className={`group flex items-center justify-between rounded-xl transition-all ${
                      isCollapsed
                        ? 'p-2.5 justify-center'
                        : 'px-3 py-2 text-xs font-semibold'
                    } ${
                      isActive
                        ? 'bg-vintage-900 text-white shadow-xs'
                        : 'text-vintage-700 hover:bg-vintage-200/60 hover:text-vintage-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IconComponent
                        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-terracotta-light' : 'text-vintage-500'
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="truncate tracking-tight">{item.title}</span>
                      )}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 font-medium ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeColor
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Live Radar / Status Card at Bottom */}
      {!isCollapsed ? (
        <div className="p-3 border-t border-vintage-200/80 bg-white/60 shrink-0">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/70 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Radio className="w-3.5 h-3.5 text-terracotta animate-pulse" />
                <span>DASI Live Radar</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-terracotta text-white font-bold">
                서울
              </span>
            </div>

            <div className="space-y-1 text-[11px] text-vintage-700">
              <div className="flex items-center justify-between">
                <span className="text-vintage-500 flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-600" /> 오늘 골든아워
                </span>
                <span className="font-bold text-vintage-900">{sunsetInfo.golden} ~ {sunsetInfo.sunset}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-vintage-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-600" /> 당일 즉시 픽업
                </span>
                <span className="font-bold text-emerald-700">{availableCamCount}대 대기 중</span>
              </div>
            </div>

            <Link
              href="/map"
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
              }}
              className="mt-1 block text-center py-1.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-[11px] font-bold transition-colors shadow-2xs"
            >
              내 주변 즉시 가능 매장 찾기 →
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-3 border-t border-vintage-200/80 flex justify-center bg-white/60 shrink-0">
          <Link
            href="/map"
            className="w-10 h-10 rounded-xl bg-amber-100 hover:bg-terracotta hover:text-white text-amber-800 flex items-center justify-center transition-colors"
            title="DASI Live Radar (당일 수령 맵)"
          >
            <Radio className="w-5 h-5 animate-pulse" />
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Fixed/Collapsible Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 sticky top-0 h-screen z-40 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-over) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={onCloseMobile}
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-slide-right">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};