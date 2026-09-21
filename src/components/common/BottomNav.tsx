'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Camera, MapPin, Users, FolderLock } from 'lucide-react';
import { useDasi } from '@/context/DasiContext';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { rentingItems, ownedItems, bookedGigs, bookedExperiences, repairEstimates, proConsultations } = useDasi();

  const totalCabinetCount =
    rentingItems.filter((r) => !r.isConvertedToOwn).length +
    ownedItems.length +
    bookedGigs.length +
    bookedExperiences.length +
    repairEstimates.length +
    proConsultations.length;

  const navItems = [
    { href: '/', label: '홈', icon: Home },
    { href: '/rent', label: '렌탈·소장', icon: Camera },
    { href: '/map', label: '스팟지도', icon: MapPin },
    { href: '/gigs', label: '포토긱', icon: Users },
    { href: '/cabinet', label: '캐비닛', icon: FolderLock, badge: totalCabinetCount },
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
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-terracotta font-bold'
                  : 'text-vintage-500 hover:text-vintage-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-terracotta' : ''} transition-transform`} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 px-1 min-w-[15px] h-[15px] rounded-full bg-terracotta text-white text-[9px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
