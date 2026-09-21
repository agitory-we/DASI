'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Camera, MapPin, Users, FolderLock } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: '홈', icon: Home },
    { href: '/rent', label: '렌탈·소장', icon: Camera },
    { href: '/map', label: '스팟지도', icon: MapPin },
    { href: '/gigs', label: '포토긱', icon: Users },
    { href: '/cabinet', label: '캐비닛', icon: FolderLock },
  ];

  return (
    <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-vintage-200 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-terracotta font-bold'
                  : 'text-vintage-500 hover:text-vintage-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-terracotta' : ''} transition-transform`} />
              <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
