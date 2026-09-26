'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Camera,
  MapPin,
  Sparkles,
  Users,
  Wrench,
  ArrowRight,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Flame,
  Ticket,
  Compass,
  Share2,
  FolderLock,
  Film,
  Store,
  PlusCircle,
} from 'lucide-react';
import { mockEventsAndHotSpots } from '@/data/mockData';
import { useDasi } from '@/context/DasiContext';

import { Bell, Heart } from 'lucide-react';

export default function HomePage() {
  const {
    cameras,
    analogSpots,
    photoGigs,
    repairMasters,
    experiences,
    meetups,
    isLoadingData,
    isWelcomeClaimed,
    claimWelcomeCoupons,
    rentingItems,
    ownedItems,
    bookedGigs,
    bookedExperiences,
    repairEstimates,
    proConsultations,
    savedSpotIds,
    showToast,
  } = useDasi();

  const activeRenting = rentingItems.find(r => !r.isConvertedToOwn) || null;
  const totalCabinet = rentingItems.filter(r => !r.isConvertedToOwn).length
    + ownedItems.length + bookedGigs.length + bookedExperiences.length
    + repairEstimates.length + proConsultations.length;


  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION: 52-WEEK ANALOG PHOTO PLAYGROUND */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 border-b border-vintage-200">
        {/* Background Warm Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-vintage-200/40 via-vintage-100/20 to-transparent pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-vintage-100/90 border border-vintage-200/90 text-vintage-800 text-xs sm:text-sm font-semibold shadow-2xs">
                <img
                  src="/icons/dasi_camera_icon.png"
                  alt="DASI 메인 카메라"
                  className="w-5 h-5 rounded-md object-cover shadow-2xs"
                />
                <span className="text-terracotta font-bold">DASI 아날로그</span>
                <span className="text-vintage-300">|</span>
                <span>서울 52주 아날로그 사진 놀이터 &amp; 라이프스타일 허브</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-vintage-900 leading-[1.15]">
                서울 52주 아날로그 사진 놀이터, <br />
                <span className="text-terracotta underline decoration-vintage-300 decoration-wavy underline-offset-8">
                  매주 발견하는 새로운 셔터 찬스.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-vintage-700 leading-relaxed max-w-2xl font-sans">
                고궁의 붉은 노을빛부터 숨은 골목의 따스한 빛까지. 
                이번 주말 떠날 출사지와 골든아워를 확인하고, 장비가 고민이라면 명장의 카메라로 부담 없이 시작해 보세요.
              </p>

              {/* 3 Core Value Badges */}
              <div className="grid grid-cols-3 gap-3 pt-2 max-w-xl">
                <div className="p-3 rounded-2xl bg-white/80 border border-vintage-200 shadow-2xs">
                  <div className="text-terracotta font-serif font-bold text-lg sm:text-xl">52주 코스</div>
                  <div className="text-[11px] sm:text-xs text-vintage-600 font-medium">시즌 축제 &amp; 골든아워</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/80 border border-vintage-200 shadow-2xs">
                  <div className="text-vintage-900 font-serif font-bold text-lg sm:text-xl">취미 서포트</div>
                  <div className="text-[11px] sm:text-xs text-vintage-600 font-medium">당일 필름 · 현상 할인 20%</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/80 border border-vintage-200 shadow-2xs">
                  <div className="text-emerald-700 font-serif font-bold text-lg sm:text-xl">Rent-to-Own</div>
                  <div className="text-[11px] sm:text-xs text-vintage-600 font-medium">체험 후 대여료 공제 소장</div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/explore"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-terracotta text-white text-sm sm:text-base font-semibold hover:bg-terracotta-light active:scale-98 transition-all shadow-md"
                >
                  <Compass className="w-4 h-4" />
                  <span>이번 주말 52주 출사지 &amp; 축제 탐험</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/onboarding"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-amber-50 text-amber-900 border border-amber-300/80 text-sm sm:text-base font-semibold hover:bg-amber-100 active:scale-98 transition-all shadow-2xs"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>내 취향 맞춤 출사 코스 &amp; 500P</span>
                </Link>

                <Link
                  href="/map"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white text-vintage-800 border border-vintage-300 text-sm sm:text-base font-semibold hover:bg-vintage-100 active:scale-98 transition-all shadow-2xs"
                >
                  <MapPin className="w-4 h-4 text-terracotta" />
                  <span>주변 현상소·자판기 지도</span>
                </Link>
              </div>
            </div>

            {/* Right Hero Visual Card: Weekly Shutter Spot & Gear Bridge */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden bg-vintage-900 p-6 sm:p-8 text-cream shadow-xl border border-vintage-800">
                {/* Visual Header Tag */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-terracotta/90 text-xs font-bold text-white shadow-2xs flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    <span>WEEK 39 · 이번 주 추천 출사 코스</span>
                  </span>
                  <span className="text-xs text-amber-300 font-medium">🌅 일몰 17:40</span>
                </div>

                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-5 bg-vintage-800">
                  <img
                    src="https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&auto=format&fit=crop&q=80"
                    alt="2026 가을 경복궁 & 창경궁 달빛 야간기행"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] text-white flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-terracotta-light" />
                    <span>종로구 사직로 경복궁 일대</span>
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-amber-500/90 text-vintage-950 font-bold text-[10px] shadow-2xs">
                    고궁 야간 달빛기행
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white leading-snug">
                      가을 고궁 달빛 야간기행 &amp; 매직아워
                    </h3>
                    <p className="text-xs text-vintage-300 mt-1 line-clamp-2 leading-relaxed">
                      궁궐 처마 뒤로 물드는 붉은 노을 실루엣과 달빛 아래 단풍. 고감도 필름이나 밝은 조리개 단렌즈와 최고의 궁합입니다.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-vintage-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-vintage-400">골든아워 매직타임</span>
                      <div className="text-sm font-bold text-amber-300">17:40 - 18:30</div>
                    </div>
                    <div className="text-right">
                      <span className="text-vintage-400">장비가 고민이라면?</span>
                      <div className="text-xs font-semibold text-white">입문 명장 기기 18,000원~</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Link
                      href="/explore"
                      className="py-2.5 rounded-xl bg-terracotta text-white text-xs font-bold flex items-center justify-center gap-1 hover:bg-terracotta-light transition-colors"
                    >
                      <span>출사 가이드 보기</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href="/rent"
                      className="py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-white/10"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-300" />
                      <span>추천 기종 둘러보기</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK HUB: 4 Photography Enablers for 52-Week Journey */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/rent"
            className="p-5 rounded-2xl bg-white border border-vintage-200/90 shadow-xs hover:shadow-md hover:border-terracotta/40 transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-vintage-900 group-hover:text-terracotta transition-colors flex items-center justify-between">
                <span>명장 기기 주말 체험</span>
                <span className="text-[10px] text-terracotta font-medium">Rent-to-Own</span>
              </div>
              <p className="text-[11px] text-vintage-500 mt-1 leading-snug">
                카메라가 없어도 OK! 써보고 반하면 대여료 공제 후 소장
              </p>
            </div>
          </Link>

          <Link
            href="/films"
            className="p-5 rounded-2xl bg-white border border-vintage-200/90 shadow-xs hover:shadow-md hover:border-amber-500/40 transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-vintage-900 group-hover:text-amber-700 transition-colors flex items-center justify-between">
                <span>서울 3시간 당일 퀵</span>
                <span className="text-[10px] text-amber-700 font-medium">대량 벌크샵</span>
              </div>
              <p className="text-[11px] text-vintage-500 mt-1 leading-snug">
                출사 전 필름 급구! 24시 자판기 지도 &amp; 3시간 당일 퀵
              </p>
            </div>
          </Link>

          <Link
            href="/gigs"
            className="p-5 rounded-2xl bg-white border border-vintage-200/90 shadow-xs hover:shadow-md hover:border-indigo-500/40 transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-vintage-900 group-hover:text-indigo-700 transition-colors flex items-center justify-between">
                <span>로컬 사진가 동행 &amp; 긱</span>
                <span className="text-[10px] text-indigo-700 font-medium">1:1 출사</span>
              </div>
              <p className="text-[11px] text-vintage-500 mt-1 leading-snug">
                혼출이 망설여질 때! 동네 사진가와 함께하는 골목 스냅
              </p>
            </div>
          </Link>

          <Link
            href="/studios"
            className="p-5 rounded-2xl bg-white border border-vintage-200/90 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-vintage-900 group-hover:text-emerald-700 transition-colors flex items-center justify-between">
                <span>40년 노포 현상소</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">20% 할인</span>
              </div>
              <p className="text-[11px] text-vintage-500 mt-1 leading-snug">
                다 찍은 필름은 모바일 1초 QR로 맡기고 스캔/인화 할인
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* DASI WIN-WIN FLYWHEEL ECOSYSTEM SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-[#FAF8F5] to-vintage-100/70 border border-vintage-300/80 p-6 sm:p-10 shadow-sm relative overflow-hidden">
          {/* Subtle watermark */}
          <div className="absolute -right-8 -bottom-8 font-serif text-[120px] font-black text-vintage-900/5 select-none pointer-events-none">
            DASI
          </div>

          <div className="max-w-3xl mb-8 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>함께 성장하는 아날로그 데이터 플랫폼</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-vintage-900 tracking-tight">
              참여할수록 혜택이 커지는 <span className="text-terracotta underline decoration-amber-400 decoration-wavy underline-offset-6">선순환 플라이휠</span>
            </h2>
            <p className="text-xs sm:text-sm text-vintage-600 leading-relaxed">
              사용자가 출사지와 현상소 리뷰를 공유할수록 데이터베이스가 풍성해지고, 적립된 포인트는 대여료 할인과 무료 현상 바우처로 즉시 환원되는 자발적 상생 구조입니다.
            </p>
          </div>

          {/* 4 Flywheel Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Step 1 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-vintage-200/90 shadow-2xs space-y-3 relative group hover:border-terracotta/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-vintage-100 text-vintage-800 text-xs font-bold flex items-center justify-center font-mono">01</span>
                <span className="text-xs font-bold text-terracotta">대여 &amp; 소장</span>
              </div>
              <div className="text-2xl">🎞️</div>
              <div>
                <h3 className="text-sm font-bold text-vintage-900">명장 기기 주말 렌탈</h3>
                <p className="text-xs text-vintage-500 mt-1 leading-snug">
                  40년 명장의 100% 점검 카메라를 대여하고 마음에 들면 대여료 전액 공제 후 소장 전환
                </p>
              </div>
              <div className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                🎁 첫 대여 500P 웰컴 할인
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-vintage-200/90 shadow-2xs space-y-3 relative group hover:border-emerald-400/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center font-mono">02</span>
                <span className="text-xs font-bold text-emerald-600">자발적 기여</span>
              </div>
              <div className="text-2xl">📍</div>
              <div>
                <h3 className="text-sm font-bold text-vintage-900">현장 인증 &amp; 제보</h3>
                <p className="text-xs text-vintage-500 mt-1 leading-snug">
                  출사지 GPS 체크인, 골든아워 촬영 팁과 현상소 1초 접수 QR로 실시간 데이터 등록
                </p>
              </div>
              <div className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                ⭐ 체크인 +200P · 제보 +500P
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-vintage-200/90 shadow-2xs space-y-3 relative group hover:border-indigo-400/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center justify-center font-mono">03</span>
                <span className="text-xs font-bold text-indigo-600">데이터 고도화</span>
              </div>
              <div className="text-2xl">🧪</div>
              <div>
                <h3 className="text-sm font-bold text-vintage-900">AI 추천 &amp; 지도 확장</h3>
                <p className="text-xs text-vintage-500 mt-1 leading-snug">
                  집단 지성으로 축적된 데이터로 한국관광공사 TourAPI와 일몰/일출 시각이 결합된 맞춤 코스 제공
                </p>
              </div>
              <div className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                🗺️ 전국 52+ 아날로그 스팟
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-vintage-200/90 shadow-2xs space-y-3 relative group hover:border-amber-400/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center font-mono">04</span>
                <span className="text-xs font-bold text-amber-700">혜택 환원 &amp; 상생</span>
              </div>
              <div className="text-2xl">🤝</div>
              <div>
                <h3 className="text-sm font-bold text-vintage-900">포인트 재사용 &amp; 긱</h3>
                <p className="text-xs text-vintage-500 mt-1 leading-snug">
                  적립 포인트로 대여료·현상비 차감, 내 카메라로 주말 로컬 스냅 알바(+300P) 등록까지
                </p>
              </div>
              <div className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg">
                🎟️ 최대 3,000P 바우처 교환
              </div>
            </div>
          </div>

          {/* Quick link action bar */}
          <div className="mt-6 pt-5 border-t border-vintage-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-vintage-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>오늘 등록된 출사 명소와 현상소 리뷰는 모든 회원에게 무료로 공개됩니다.</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/onboarding"
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors shadow-2xs"
              >
                취향 가이드 시작 (+500P)
              </Link>
              <Link
                href="/cabinet?tab=points"
                className="px-3.5 py-1.5 rounded-xl bg-white border border-vintage-300 text-vintage-800 font-semibold hover:bg-vintage-50 transition-colors"
              >
                내 포인트 보관함 가기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PERSONAL DASHBOARD WIDGET — 나의 활성 대여·예약 현황 */}
      {totalCabinet > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-vintage-900 to-[#1E1813] border border-vintage-800 p-6 sm:p-8 text-white overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-terracotta/10 blur-3xl pointer-events-none" />
            <div className="absolute right-20 bottom-0 w-32 h-32 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                  <Bell className="w-3.5 h-3.5" />
                  <span>나의 DASI 활성 현황</span>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold">
                  마이 캐비닛에 {totalCabinet}건이 있습니다
                </h2>
                {activeRenting && (
                  <p className="text-xs text-vintage-300 flex items-center gap-1.5 mt-1">
                    <Camera className="w-3.5 h-3.5 text-terracotta-light shrink-0" />
                    <span>
                      <strong className="text-white">{activeRenting.name}</strong> 대여 진행 중
                      {activeRenting.purchaseTotal > 0 && ` · 소장 전환 ${Math.round((activeRenting.rentalPaid / activeRenting.purchaseTotal) * 100)}% 달성`}
                    </span>
                  </p>
                )}
              </div>

              {/* Stats strip with direct deep-links */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 shrink-0">
                {[
                  { label: '대여 중', value: rentingItems.filter(r => !r.isConvertedToOwn).length, color: 'text-terracotta-light', href: '/cabinet?tab=camera' },
                  { label: '소장 컬렉션', value: ownedItems.length, color: 'text-amber-300', href: '/cabinet?tab=camera' },
                  { label: '스냅 예약', value: bookedGigs.length + bookedExperiences.length, color: 'text-emerald-300', href: '/cabinet?tab=tickets' },
                  { label: '수리 접수', value: repairEstimates.length, color: 'text-blue-300', href: '/cabinet?tab=repairs' },
                  { label: '찜한 스팟', value: savedSpotIds.length, color: 'text-rose-300', href: '/explore?filter=saved' },
                ].map((stat) => (
                  <Link
                    key={stat.label}
                    href={stat.href}
                    className="text-center p-3 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 backdrop-blur-sm transition-all hover:scale-105 active:scale-95 block"
                    title={`${stat.label} 상세 내역으로 바로가기`}
                  >
                    <div className={`text-xl font-bold font-serif ${stat.color}`}>{stat.value}</div>
                    <div className="text-[10px] text-vintage-300 mt-0.5 font-medium">{stat.label}</div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-3 relative z-10">
              <Link
                href="/cabinet"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-terracotta hover:bg-terracotta-light text-white text-xs font-bold transition-colors shadow-xs"
              >
                <FolderLock className="w-3.5 h-3.5" />
                <span>마이 캐비닛 전체 보기</span>
              </Link>
              {activeRenting && (
                <Link
                  href="/cabinet?tab=camera"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors border border-white/10"
                >
                  <span>Rent-to-Own 전환 진행하기 →</span>
                </Link>
              )}
              {savedSpotIds.length > 0 && (
                <Link
                  href="/explore?filter=saved"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors border border-white/10"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-300" />
                  <span>찜한 스팟 {savedSpotIds.length}곳 보기</span>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 2. HOBBY GEAR SHOWCASE (Rent-to-Own) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-terracotta text-xs font-bold tracking-wider uppercase mb-1">
              <Camera className="w-4 h-4" />
              <span>DASI Gear Support · 써보고 소장하는 Rent-to-Own</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-vintage-900">
              이번 주 출사 테마와 어울리는 추천 기종 둘러보기
            </h2>
            <p className="text-sm text-vintage-600 mt-1">
              어떤 카메라가 나에게 맞을지 고민될 때, 40년 명장의 오버홀 점검 기기로 주말 동안 직접 만져보고 반했을 때 소장하세요.
            </p>
          </div>
          <Link
            href="/rent"
            className="inline-flex items-center gap-1 text-sm font-semibold text-terracotta hover:underline"
          >
            <span>전체 24개 체험 기종 보기</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cameras.slice(0, 3).map((camera) => (
            <div
              key={camera.id}
              className="rounded-2xl bg-white border border-vintage-200 overflow-hidden hover:shadow-lg transition-all flex flex-col group"
            >
              <div className="relative aspect-[16/10] bg-vintage-100 overflow-hidden">
                <img
                  src={camera.imageUrl}
                  alt={camera.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium">
                    {camera.category === 'film'
                      ? '아날로그 필름'
                      : camera.category === 'digital_compact'
                      ? '하이엔드 디카'
                      : 'Y2K CCD'}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-emerald-700/80 text-white text-[10px] font-semibold">
                    {camera.conditionGrade}
                  </span>
                </div>
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-white/90 text-vintage-900 text-[11px] font-bold shadow-xs">
                  {camera.specs.difficulty}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[11px] text-vintage-500 font-medium">{camera.era}</div>
                  <h3 className="font-serif text-lg font-bold text-vintage-900 group-hover:text-terracotta transition-colors">
                    {camera.name}
                  </h3>
                  <p className="text-xs text-vintage-600 line-clamp-2 mt-1.5 leading-relaxed">
                    {camera.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-vintage-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-vintage-500">1일 대여료</span>
                    <span className="font-bold text-terracotta text-sm">
                      {camera.rentalPricePerDay.toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-vintage-600">
                    <span>소장 전환가 (대여료 차감)</span>
                    <span className="font-semibold text-vintage-900">
                      {camera.purchasePrice.toLocaleString()}원
                    </span>
                  </div>

                  <Link
                    href="/rent"
                    className="w-full mt-2 py-2 rounded-xl bg-vintage-100 hover:bg-terracotta hover:text-white text-vintage-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>날짜 선택 &amp; 픽업 예약</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ANALOG SPOT MAP HIGHLIGHT */}
      <section className="bg-vintage-100/70 border-y border-vintage-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>실시간 아날로그 맵</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-vintage-900">
                다 찍은 필름, <br />
                어디서 가장 예쁘게 나올까요?
              </h2>
              <p className="text-sm text-vintage-700 leading-relaxed">
                서울 시내 전문 현상소, 24시 무인 필름 자판기, 그리고 40년 수리 명장실의 위치와 실시간 정보를 제공합니다.
                현상소별 스캐너(노리츠 vs 후지 프론티어) 색감 갤러리를 미리 비교해 보세요.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-start gap-2.5 text-xs text-vintage-800">
                  <CheckCircle2 className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                  <span><strong>당일 스캔 마감 카운트다운</strong> (오늘 접수 시 당일 웹 갤러리 전달)</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-vintage-800">
                  <CheckCircle2 className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                  <span><strong>소액 홍보 파트너(Micro-Ads) 핀</strong>으로 실시간 필름 재고 확인</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-vintage-800">
                  <CheckCircle2 className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                  <span><strong>DASI 전용 할인 바우처</strong> 현장 즉시 적용</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/map"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-vintage-900 text-white text-sm font-semibold hover:bg-vintage-800 transition-colors shadow-sm"
                >
                  <span>내 주변 아날로그 스팟 찾기</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Map Preview Card */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl bg-white border border-vintage-200 p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-vintage-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-vintage-900">을지로·충무로 실시간 접수 중</span>
                  </div>
                  <span className="text-xs text-vintage-500">당일 스캔 마감 17:30</span>
                </div>

                <div className="space-y-3">
                  {analogSpots.slice(0, 2).map((spot) => (
                    <div
                      key={spot.id}
                      className="p-4 rounded-2xl bg-vintage-50 border border-vintage-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-terracotta/40 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm text-vintage-900">{spot.name}</h4>
                          {spot.isMicroAdPartner && (
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                              {spot.partnerBadgeText}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-vintage-600">{spot.address}</p>
                        <p className="text-[11px] text-terracotta font-medium mt-1">
                          ⚡ {spot.todayScanCutoff}
                        </p>
                      </div>

                      <Link
                        href="/map"
                        className="px-3.5 py-1.5 rounded-lg bg-white border border-vintage-300 text-xs font-semibold text-vintage-800 hover:bg-vintage-100 text-center shrink-0"
                      >
                        색감 비교 &amp; 길찾기
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LOCAL PHOTO GIGS (스냅 알바 & 인생샷) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-terracotta text-xs font-bold tracking-wider uppercase mb-1">
              <Users className="w-4 h-4" />
              <span>DASI Local Photo Gig</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-vintage-900">
              내 카메라로 주말에 용돈 벌기 &amp; 로컬 스냅
            </h2>
            <p className="text-sm text-vintage-600 mt-1">
              성수동 외국인 여행자 스냅부터 친구 시선의 가성비 서브 웨딩까지, 취향을 공유하는 작가와 매칭됩니다.
            </p>
          </div>
          <Link
            href="/gigs"
            className="inline-flex items-center gap-1 text-sm font-semibold text-terracotta hover:underline"
          >
            <span>스냅 작가 목록 &amp; 등록하기</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {photoGigs.map((gig) => (
            <div
              key={gig.id}
              className="rounded-2xl bg-white border border-vintage-200 overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/10] bg-vintage-100 overflow-hidden">
                  <img
                    src={gig.portfolioImages[0]}
                    alt={gig.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium">
                    {gig.location}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={gig.creatorAvatar}
                      alt={gig.creatorName}
                      className="w-8 h-8 rounded-full object-cover border border-vintage-300"
                    />
                    <div>
                      <div className="text-xs font-bold text-vintage-900">{gig.creatorName}</div>
                      <div className="text-[10px] text-vintage-500">{gig.gearUsed.join(' · ')}</div>
                    </div>
                  </div>

                  <h3 className="font-semibold text-sm text-vintage-900 leading-snug line-clamp-2">
                    {gig.title}
                  </h3>

                  <div className="flex flex-wrap gap-1">
                    {gig.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded bg-vintage-100 text-[10px] text-vintage-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-vintage-100 flex items-center justify-between mt-2">
                <div>
                  <span className="text-[11px] text-vintage-500">시간당 촬영비</span>
                  <div className="text-base font-bold text-vintage-900">
                    {gig.pricePerHour.toLocaleString()}원
                  </div>
                </div>
                <Link
                  href="/gigs"
                  className="px-4 py-2 rounded-xl bg-terracotta text-white text-xs font-semibold hover:bg-terracotta-light transition-colors"
                >
                  포트폴리오 예약
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. MASTER CLINIC & WELCOME COUPON POCKET */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-vintage-900 via-vintage-800 to-vintage-900 p-8 sm:p-12 text-cream border border-vintage-700 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta/30 text-amber-300 text-xs font-semibold">
                <Wrench className="w-3.5 h-3.5" />
                <span>닥터 DASI · 장인 클리닉</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-tight">
                고장 난 줄 알고 장롱 속에 넣어둔 <br />
                카메라를 다시 깨워보세요.
              </h2>
              <p className="text-xs sm:text-sm text-vintage-300 leading-relaxed max-w-xl">
                충무로와 을지로에서 40년간 카메라만 만져온 수리 명장들이 증상 사진만으로 예상 견적을 알려드립니다.
                지금 가입 시 웰컴 케어 쿠폰팩(현상 1롤 무료 + 점검 할인권)을 즉시 드립니다.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={claimWelcomeCoupons}
                  disabled={isWelcomeClaimed}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md ${
                    isWelcomeClaimed
                      ? 'bg-emerald-700 text-white'
                      : 'bg-terracotta text-white hover:bg-terracotta-light active:scale-95'
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  <span>{isWelcomeClaimed ? '웰컴 쿠폰팩 발급 완료!' : '웰컴 케어 쿠폰팩 무료 받기'}</span>
                </button>

                <Link
                  href="/clinic"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold border border-white/20 transition-all"
                >
                  <span>수리 명장 간편 견적 신청</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 space-y-4">
              <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                제휴 명장 추천 한마디
              </h4>
              <p className="text-sm font-serif italic text-vintage-100 leading-relaxed">
                &ldquo;셔터가 뻑뻑하거나 렌즈에 곰팡이가 피었다고 버리지 마세요.
                오래된 필름카메라는 부품을 깎아서라도 고치면 다음 세대까지 물려줄 수 있습니다.&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                <img
                  src={repairMasters[0]?.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80'}
                  alt={repairMasters[0]?.name || '강태훈'}
                  className="w-10 h-10 rounded-full object-cover border border-white/30"
                />
                <div>
                  <div className="text-xs font-bold text-white">{repairMasters[0]?.name || '강태훈'} (경력 {repairMasters[0]?.experienceYears || 42}년)</div>
                  <div className="text-[11px] text-vintage-300">{repairMasters[0]?.shopName || '을지로 신성카메라'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. 52-WEEK SEOUL FESTIVALS & HOT SPOTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-terracotta text-xs font-bold tracking-wider uppercase mb-1">
              <Calendar className="w-4 h-4" />
              <span>서울 52주 축제 &amp; 골든아워 출사 가이드</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-vintage-900">
              이번 주말 어디로 출사 갈까? 52주 테마 코스
            </h2>
            <p className="text-sm text-vintage-600 mt-1">
              달빛기행부터 여의도 불꽃축제까지, 아날로그 카메라에 최적화된 화각과 골든아워를 안내합니다.
            </p>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1 text-sm font-semibold text-terracotta hover:underline"
          >
            <span>전체 52주 출사 가이드 보기</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockEventsAndHotSpots.slice(0, 2).map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white border border-vintage-200 overflow-hidden hover:shadow-lg transition-all flex flex-col sm:flex-row"
            >
              <div className="sm:w-2/5 relative aspect-[4/3] sm:aspect-auto bg-vintage-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs">
                  {item.type === 'festival' ? '시즌 축제' : '출사 핫스팟'}
                </span>
              </div>
              <div className="sm:w-3/5 p-5 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-[11px] text-terracotta font-semibold">{item.periodOrTime}</div>
                  <h3 className="font-serif text-base font-bold text-vintage-900 mt-0.5">
                    {item.title}
                  </h3>
                  <div className="text-xs text-vintage-600 mt-2 space-y-1">
                    <div>⏰ <strong>골든아워:</strong> {item.goldenHour}</div>
                    <div>📷 <strong>추천 화각:</strong> {item.recommendedLenses}</div>
                  </div>
                </div>

                <Link
                  href="/explore"
                  className="text-xs font-bold text-terracotta hover:underline inline-flex items-center gap-1"
                >
                  <span>상세 촬영 팁 &amp; 설정값 보기</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NEW: 52-WEEK PHOTO MEETUPS & FLASH WALKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-terracotta text-xs font-bold tracking-wider uppercase mb-1">
              <Compass className="w-4 h-4" />
              <span>DASI Photo Club &amp; Meetup Playground</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-vintage-900">
              52주 필름 출사 모임 &amp; 주말 번개 놀이터
            </h2>
            <p className="text-sm text-vintage-600 mt-1">
              혼자 걷던 골목길에서 함께 걷는 낭만으로. 원하는 스팟에서 직접 번개를 열고(+300P), 동료들과 참여(+150P)하세요.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/experiences?action=create"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-vintage-950 font-bold text-xs shadow-xs transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ 번개 모임 열기 (+300P)</span>
            </Link>
            <Link
              href="/experiences"
              className="inline-flex items-center gap-1 text-sm font-semibold text-terracotta hover:underline"
            >
              <span>전체 모임 보기</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {meetups.slice(0, 2).map((meetup) => {
            const isFull = meetup.currentAttendees >= meetup.maxAttendees;
            const percentFilled = Math.min(100, Math.round((meetup.currentAttendees / meetup.maxAttendees) * 100));

            return (
              <div
                key={meetup.id}
                className="rounded-3xl bg-white border border-vintage-200 overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-[16/9] bg-vintage-100 overflow-hidden">
                    <img
                      src={meetup.imageUrl}
                      alt={meetup.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500 text-vintage-950 text-[10px] font-bold">
                        {meetup.category === 'flash_walk' ? '⚡ 즉석 번개' :
                         meetup.category === 'golden_hour' ? '🌅 골든아워' :
                         meetup.category === 'theme_walk' ? '🎞️ 테마 워크' : '🔧 명장 클래스'}
                      </span>
                      {meetup.isUserCreated && (
                        <span className="px-2 py-0.5 rounded-full bg-white/90 text-vintage-900 text-[10px] font-bold">
                          유저 개설
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={meetup.hostAvatar}
                          alt={meetup.hostName}
                          className="w-7 h-7 rounded-full border border-white/60 object-cover"
                        />
                        <span className="font-bold">{meetup.hostName}</span>
                      </div>
                      <span className="font-bold text-amber-300">
                        {meetup.price === 0 ? '무료 번개' : `${meetup.price.toLocaleString()}원`}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-vintage-500">
                      <Clock className="w-3.5 h-3.5 text-terracotta" />
                      <span>{meetup.dateTime}</span>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-vintage-900 group-hover:text-terracotta transition-colors leading-snug">
                      {meetup.title}
                    </h3>
                    <p className="text-xs text-vintage-600 line-clamp-2">
                      {meetup.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-2xs text-vintage-500 font-medium">
                        <span>참여 현황 ({meetup.currentAttendees}/{meetup.maxAttendees}명)</span>
                        <span className={isFull ? 'text-red-500 font-bold' : 'text-terracotta font-bold'}>
                          {isFull ? '모집 마감' : `${meetup.maxAttendees - meetup.currentAttendees}석 남음`}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-vintage-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isFull ? 'bg-red-400' : 'bg-terracotta'}`}
                          style={{ width: `${percentFilled}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-vintage-100 flex items-center justify-between mt-2">
                  <div className="text-[11px] text-vintage-500 truncate max-w-[200px]">
                    📍 {meetup.location}
                  </div>
                  <Link
                    href="/experiences"
                    className="px-4 py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    참여 신청하기 (+150P)
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* NEW: DUAL INTERACTIVE BANNERS (AI APPRAISAL & FRAME MAKER) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Banner 1: AI Camera Appraisal */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#2D241E] to-[#1E1813] text-white space-y-5 border border-vintage-800 shadow-xl flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>DASI Vision AI 감정 엔진</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
                장롱 속 잠든 내 카메라, <br />
                사진 3장으로 AI 시세 감정
              </h3>
              <p className="text-xs sm:text-sm text-vintage-300 leading-relaxed">
                외관 사진만 올리면 10만 건의 국내외 실거래가와 대조하여 모델명, 연식, 외관 등급, 즉시 매입가를 산출하고 마이 캐비닛에 디지털 정품 보증서로 등록합니다.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/ai-appraisal"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-terracotta hover:bg-terracotta-light text-white text-xs sm:text-sm font-bold transition-all shadow-md"
              >
                <span>무료 AI 감정 시작하기</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Banner 2: Analog Frame Maker */}
          <div className="p-8 rounded-3xl bg-[#FAF6EE] text-vintage-900 space-y-5 border border-vintage-300 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold">
                <Share2 className="w-3.5 h-3.5" />
                <span>DASI Analog Frame Maker</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight text-vintage-900">
                인스타그램 4:5 감성, <br />
                필름 메타데이터 프레임 입히기
              </h3>
              <p className="text-xs sm:text-sm text-vintage-600 leading-relaxed">
                스마트폰이나 디카로 찍은 사진에 카메라 기종, 현상소 색감, 날짜 워터마크를 자동으로 합성하여 고화질 다운로드하거나 장인의 원목 액자로 주문하세요.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/frame"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs sm:text-sm font-bold transition-colors shadow-xs"
              >
                <span>감성 프레임 생성기 열기</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. DASI PRO STUDIO GATEWAY */}
      <section id="pro-studio" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="rounded-3xl border border-vintage-300 bg-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-100 text-amber-900 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>DASI Pro Artists &amp; Studios</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-vintage-900">
              하이엔드 전문 작가의 단독 스냅 샵을 찾으시나요?
            </h3>
            <p className="text-xs sm:text-sm text-vintage-600">
              본식 웨딩, 브랜드 화보, 개인 프로필 전문 준프로·프로 사진작가의 독점 포트폴리오 관으로 연결됩니다.
            </p>
          </div>
          <Link
            href="/pro"
            className="shrink-0 px-6 py-3 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors"
          >
            <span>DASI Pro 스튜디오 방문하기</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
