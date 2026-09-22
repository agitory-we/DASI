'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { useAuth, TIER_INFO } from '@/context/AuthContext';

export function PointsBadge() {
  const { user, profile } = useAuth();
  if (!user || !profile) return null;
  const tierInfo = TIER_INFO[profile.tier];
  return (
    <div className={['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold', tierInfo.bg, tierInfo.color].join(' ')}>
      <Star className="w-3 h-3 fill-current" />
      <span>{profile.total_points.toLocaleString()}P</span>
      <span className="opacity-60">·</span>
      <span>{tierInfo.label}</span>
    </div>
  );
}
