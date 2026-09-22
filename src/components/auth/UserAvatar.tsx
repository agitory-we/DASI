'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth, TIER_INFO } from '@/context/AuthContext';

export function UserAvatar() {
  const { user, profile, signOut, openLoginModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user || !profile) {
    return (
      <button
        onClick={openLoginModal}
        className="px-3.5 py-2 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-bold transition-all shadow-xs"
      >
        로그인
      </button>
    );
  }

  const tierInfo = TIER_INFO[profile.tier];
  const initial = (profile.nickname || user.email || 'U')[0].toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(v => !v)}
        className="flex items-center gap-1.5 p-1 pr-2 rounded-xl hover:bg-vintage-100 transition-all border border-vintage-200 bg-white"
      >
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="avatar" className="w-7 h-7 rounded-lg object-cover" />
        ) : (
          <div className="w-7 h-7 rounded-lg bg-terracotta text-white flex items-center justify-center text-xs font-bold">{initial}</div>
        )}
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-[10px] font-bold text-vintage-900 leading-none">{profile.nickname || '익명 필름러'}</span>
          <span className={['text-[9px] font-bold', tierInfo.color].join(' ')}>{tierInfo.label}</span>
        </div>
        <ChevronDown className={['w-3 h-3 text-vintage-400 transition-transform', isOpen ? 'rotate-180' : ''].join(' ')} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white border border-vintage-200 shadow-xl p-3 z-50 animate-fadeIn space-y-2">
          <div className="p-3 rounded-xl bg-vintage-50 border border-vintage-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-vintage-900">DASI 포인트</span>
              <span className={['text-[10px] font-bold px-2 py-0.5 rounded-full', tierInfo.bg, tierInfo.color].join(' ')}>{tierInfo.label}</span>
            </div>
            <div className="font-serif text-2xl font-bold text-terracotta">{profile.total_points.toLocaleString()}P</div>
            {profile.tier !== 'legend' && (
              <div className="mt-2">
                <div className="h-1.5 bg-vintage-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-terracotta rounded-full transition-all"
                    style={{ width: profile.tier === 'filmmer' ? (Math.min(profile.total_points / 500, 1) * 100) + '%' : (Math.min((profile.total_points - 500) / 2500, 1) * 100) + '%' }}
                  />
                </div>
                <div className="text-[9px] text-vintage-400 mt-1">
                  {profile.tier === 'filmmer' ? ('포토워커까지 ' + (500 - profile.total_points) + 'P') : ('레전드까지 ' + (3000 - profile.total_points) + 'P')}
                </div>
              </div>
            )}
          </div>
          <div className="space-y-1">
            <a href="/cabinet" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-vintage-50 text-xs text-vintage-800 font-medium transition-colors" onClick={() => setIsOpen(false)}>
              <User className="w-3.5 h-3.5 text-terracotta" />마이 캐비넷
            </a>
            <button onClick={() => { signOut(); setIsOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 text-xs text-red-600 font-medium transition-colors">
              <LogOut className="w-3.5 h-3.5" />로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
