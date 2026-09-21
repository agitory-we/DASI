'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Camera,
  MapPin,
  Sparkles,
  Wrench,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  Award,
  Share2,
  FolderLock,
  Search
} from 'lucide-react';
import { GlobalSearchModal } from '@/components/common/GlobalSearchModal';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  // Bind Ctrl+K or Cmd+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const primaryNavItems = [
    { href: '/', label: '홈' },
    { href: '/rent', label: '렌탈·소장' },
    { href: '/map', label: '아날로그맵' },
    { href: '/gigs', label: '포토긱' },
    { href: '/experiences', label: '출사·클래스' },
    { href: '/clinic', label: '명장케어' },
    { href: '/explore', label: '축제·스팟' },
  ];

  const secondaryTools = [
    { href: '/ai-appraisal', label: 'AI 감정', icon: Sparkles },
    { href: '/frame', label: '필름프레임', icon: Share2 },
    { href: '/cabinet', label: '마이캐비닛', icon: FolderLock },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-vintage-200 bg-vintage-50/90 backdrop-blur-md">
      {/* Top Banner */}
      <div className="bg-terracotta px-4 py-1.5 text-center text-[11px] sm:text-xs font-medium text-white flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>40년 명장 오버홀 점검 완료 · Rent-to-Own 대여료 100% 공제 · 30일 AS 보증</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo & Nav */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-vintage-900 text-cream flex items-center justify-center font-serif text-lg font-bold shadow-sm group-hover:bg-terracotta transition-colors">
                다
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg text-vintage-900 tracking-tight leading-tight">
                  다시 <span className="text-xs font-sans font-normal text-vintage-500">DASI</span>
                </span>
                <span className="text-[10px] text-vintage-600 font-medium -mt-0.5">그때 그 취미, 다시</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-1">
              {primaryNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-vintage-200 text-vintage-900 font-bold shadow-2xs'
                        : 'text-vintage-700 hover:text-vintage-900 hover:bg-vintage-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Tools & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Secondary Quick Tools */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-vintage-700">
              {secondaryTools.map((tool) => {
                const Icon = tool.icon;
                const isActive = pathname === tool.href;
                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors ${
                      isActive
                        ? 'bg-vintage-200 text-vintage-900 font-bold'
                        : 'hover:bg-vintage-100 text-vintage-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-terracotta" />
                    <span>{tool.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Search Trigger Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-xl bg-white/70 hover:bg-white text-vintage-700 hover:text-vintage-900 border border-vintage-200 flex items-center gap-1.5 transition-colors shadow-2xs"
              title="전역 검색 (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-terracotta" />
              <span className="hidden sm:inline-block text-xs font-medium text-vintage-500">검색</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] font-mono text-vintage-500 bg-vintage-100 rounded border border-vintage-200">
                ⌘K
              </kbd>
            </button>

            {/* DASI Pro Studio Link */}
            <Link
              href="/pro"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-amber-300 bg-amber-50 text-[11px] font-bold text-amber-900 hover:bg-amber-100 transition-colors shadow-2xs"
            >
              <Award className="w-3.5 h-3.5 text-amber-700" />
              <span>DASI Pro 스튜디오</span>
            </Link>

            {/* Main Action */}
            <Link
              href="/rent"
              className="inline-flex items-center justify-center px-3.5 py-2 rounded-xl bg-terracotta text-white text-xs font-bold hover:bg-terracotta-light active:scale-95 transition-all shadow-xs"
            >
              카메라 대여
            </Link>
          </div>
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
};
