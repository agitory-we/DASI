'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, MapPin, Sparkles, Wrench, Compass, ArrowUpRight, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: '홈 큐레이션' },
    { href: '/rent', label: '카메라 렌탈 & 소장' },
    { href: '/map', label: '아날로그 맵' },
    { href: '/gigs', label: '로컬 포토 긱' },
    { href: '/clinic', label: '명장 클리닉' },
    { href: '/explore', label: '축제 & 출사지' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-vintage-200 bg-vintage-50/90 backdrop-blur-md">
      {/* Top Banner: DASI Care & Guarantee */}
      <div className="bg-terracotta px-4 py-1.5 text-center text-xs font-medium text-white flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>전 기기 40년 명장 오버홀 점검 완료 · 7일 무상 반품 &amp; 30일 AS 보증</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
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
            <nav className="hidden md:flex items-center gap-1 ml-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-vintage-200/80 text-vintage-900 font-semibold shadow-xs'
                        : 'text-vintage-700 hover:text-vintage-900 hover:bg-vintage-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* DASI Pro link */}
            <a
              href="#pro-studio"
              className="hidden lg:inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-vintage-300 bg-white/70 text-xs font-semibold text-vintage-800 hover:border-vintage-400 hover:bg-white transition-all shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>DASI Pro 스튜디오</span>
              <ArrowUpRight className="w-3 h-3 text-vintage-400" />
            </a>

            <Link
              href="/rent"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-terracotta text-white text-xs sm:text-sm font-semibold hover:bg-terracotta-light active:scale-95 transition-all shadow-sm"
            >
              주말 카메라 대여하기
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
