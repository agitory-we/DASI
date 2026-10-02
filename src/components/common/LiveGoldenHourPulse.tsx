'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import * as SunCalc from 'suncalc';
import { Sun, Flame, Moon } from 'lucide-react';

const SEOUL_LAT = 37.5665;
const SEOUL_LNG = 126.9780;

function toHHMM(d: Date | null | undefined): string {
  if (!d || isNaN(d.getTime())) return '18:00';
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export const LiveGoldenHourPulse: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [sunState, setSunState] = useState<{
    status: 'golden' | 'before' | 'after';
    sunsetStr: string;
    diffText: string;
  } | null>(null);

  useEffect(() => {
    const calculate = () => {
      const now = new Date();
      const times = SunCalc.getTimes(now, SEOUL_LAT, SEOUL_LNG);
      const sunset = times.sunset || new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0);
      const goldenStart = new Date(sunset.getTime() - 60 * 60 * 1000);
      const blueHourEnd = new Date(sunset.getTime() + 45 * 60 * 1000);
      const sunsetStr = toHHMM(sunset);

      if (now >= goldenStart && now <= sunset) {
        // 골든아워 진행 중
        const leftMin = Math.max(1, Math.round((sunset.getTime() - now.getTime()) / 60000));
        setSunState({
          status: 'golden',
          sunsetStr,
          diffText: `일몰까지 ${leftMin}분 남음`,
        });
      } else if (now < goldenStart) {
        // 골든아워 전
        const diffMs = goldenStart.getTime() - now.getTime();
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffMins = Math.floor((diffMs % 3600000) / 60000);
        const timeText = diffHrs > 0 ? `${diffHrs}시간 ${diffMins}분` : `${diffMins}분`;
        setSunState({
          status: 'before',
          sunsetStr,
          diffText: `골든아워까지 ${timeText}`,
        });
      } else if (now <= blueHourEnd) {
        // 블루아워 / 야경 타임
        setSunState({
          status: 'after',
          sunsetStr,
          diffText: '야간 조명·블루아워 타임',
        });
      } else {
        // 밤
        setSunState({
          status: 'after',
          sunsetStr,
          diffText: `내일 일출 ${toHHMM(times.sunrise)}`,
        });
      }
    };

    calculate();
    const interval = setInterval(calculate, 60000); // 1분마다 갱신
    return () => clearInterval(interval);
  }, []);

  if (!sunState) return null;

  return (
    <Link
      href="/golden-hour"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-xs border cursor-pointer group ${
        sunState.status === 'golden'
          ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-terracotta/20 text-orange-700 dark:text-orange-300 border-amber-400/50 animate-pulse hover:shadow-md'
          : sunState.status === 'before'
          ? 'bg-vintage-100/80 dark:bg-stone-800 text-vintage-800 dark:text-stone-200 border-vintage-200/80 dark:border-stone-700 hover:border-terracotta'
          : 'bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 border-indigo-300/40 hover:border-indigo-400'
      } ${className}`}
    >
      {sunState.status === 'golden' ? (
        <Flame className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 animate-bounce shrink-0" />
      ) : sunState.status === 'before' ? (
        <Sun className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 group-hover:rotate-45 transition-transform" />
      ) : (
        <Moon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
      )}

      <span className="font-semibold tracking-tight">
        {sunState.status === 'golden' ? '🔥 골든아워 진행 중' : `오늘 일몰 ${sunState.sunsetStr}`}
      </span>
      <span className="text-[10px] opacity-75 hidden sm:inline">·</span>
      <span className="text-[11px] font-bold text-terracotta dark:text-amber-300">
        {sunState.diffText}
      </span>
    </Link>
  );
};
