'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { showToast } from '@/utils/toast'; // DasiContext showToast 대신 직접 import 예정

// 사용자 프로필 (Supabase user_profiles 테이블)
export interface UserProfile {
  id: string;
  nickname: string | null;
  avatar_url: string | null;
  tier: 'filmmer' | 'photowalker' | 'legend';
  total_points: number;
  created_at: string;
}

// 멤버십 티어 정보
export const TIER_INFO = {
  filmmer:     { label: '🥉 필름러',    minPoints: 0,    color: 'text-amber-700',   bg: 'bg-amber-100' },
  photowalker: { label: '🥈 포토워커',  minPoints: 500,  color: 'text-slate-700',   bg: 'bg-slate-100' },
  legend:      { label: '🥇 DASI 레전드', minPoints: 3000, color: 'text-yellow-700', bg: 'bg-yellow-100' },
} as const;

// 포인트 액션 설명
export const POINT_ACTIONS = {
  spot_report:    { points: 500,   label: '출사 명소 제보 (검증 통과)' },
  film_review:    { points: 100,   label: '필름/카메라 리뷰 작성' },
  photo_upload:   { points: 150,   label: '출사 사진 업로드 + 태그' },
  rental_review:  { points: 200,   label: '렌탈 완료 후기 작성' },
  referral:       { points: 1000,  label: '친구 초대 (첫 렌탈 완료)' },
  repair_case:    { points: 300,   label: '수리 케이스 기록 공유' },
  redeem:         { points: 0,     label: '포인트 사용' },
} as const;

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  signInWithKakao: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  awardPoints: (action: keyof typeof POINT_ACTIONS, refId?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]         = useState<User | null>(null);
  const [session, setSession]   = useState<Session | null>(null);
  const [profile, setProfile]   = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data as UserProfile);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setIsLoading(false);
    });

    // 인증 상태 변화 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signInWithKakao = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  // 포인트 적립 (서버사이드 Route Handler 경유 — RLS 우회)
  const awardPoints = useCallback(async (action: keyof typeof POINT_ACTIONS, refId?: string) => {
    if (!user) return;
    const info = POINT_ACTIONS[action];
    try {
      await fetch('/api/points/award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, refId, points: info.points, description: info.label }),
      });
      await refreshProfile();
    } catch (err) {
      console.error('[awardPoints] 오류:', err);
    }
  }, [user, refreshProfile]);

  return (
    <AuthContext.Provider value={{
      user, session, profile, isLoading,
      isLoginModalOpen,
      openLoginModal: () => setIsLoginModalOpen(true),
      closeLoginModal: () => setIsLoginModalOpen(false),
      signInWithKakao, signInWithGoogle, signOut,
      awardPoints, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth는 AuthProvider 내부에서만 사용 가능합니다.');
  return ctx;
}
