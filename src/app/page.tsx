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
  FolderLock
} from 'lucide-react';
import { mockCameras, mockAnalogSpots, mockPhotoGigs, mockMasters, mockEventsAndHotSpots } from '@/data/mockData';
import { useDasi } from '@/context/DasiContext';

export default function HomePage() {
  const { isWelcomeClaimed, claimWelcomeCoupons } = useDasi();

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 border-b border-vintage-200">
        {/* Background Warm Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-vintage-200/40 via-vintage-100/20 to-transparent pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-terracotta/10 border border-terracotta/20 text-terracotta text-xs sm:text-sm font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>써보고 반하면 소장하는 Rent-to-Own 마켓</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-vintage-900 leading-[1.15]">
                그때 그 손맛 그대로, <br />
                <span className="text-terracotta underline decoration-vintage-300 decoration-wavy underline-offset-8">
                  주말 동안 가볍게 대여하고
                </span><br />
                마음에 들면 내 것으로.
              </h1>

              <p className="text-base sm:text-lg text-vintage-700 leading-relaxed max-w-2xl font-sans">
                충무로·을지로 40년 명장의 1:1 오버홀 점검 기기만 취급합니다.
                클래식 필름카메라부터 후지필름·리코 하이엔드 디카까지, 
                직접 픽업하고 장인에게 10분 온보딩 강습을 받아보세요.
              </p>

              {/* Value Badges */}
              <div className="grid grid-cols-3 gap-3 pt-2 max-w-xl">
                <div className="p-3 rounded-2xl bg-white/80 border border-vintage-200 shadow-2xs">
                  <div className="text-terracotta font-serif font-bold text-lg sm:text-xl">100%</div>
                  <div className="text-[11px] sm:text-xs text-vintage-600 font-medium">명장 오버홀 점검</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/80 border border-vintage-200 shadow-2xs">
                  <div className="text-vintage-900 font-serif font-bold text-lg sm:text-xl">Rent-to-Own</div>
                  <div className="text-[11px] sm:text-xs text-vintage-600 font-medium">대여료 공제 후 소장</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/80 border border-vintage-200 shadow-2xs">
                  <div className="text-emerald-700 font-serif font-bold text-lg sm:text-xl">0원</div>
                  <div className="text-[11px] sm:text-xs text-vintage-600 font-medium">신용 가승인 무보증금</div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/rent"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-terracotta text-white text-sm sm:text-base font-semibold hover:bg-terracotta-light active:scale-98 transition-all shadow-md"
                >
                  <Camera className="w-4 h-4" />
                  <span>이번 주말 카메라 대여하기</span>
                  <ArrowRight className="w-4 h-4" />
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

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden bg-vintage-900 p-6 sm:p-8 text-cream shadow-xl border border-vintage-800">
                {/* Visual Camera Tag */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-amber-300 backdrop-blur-md">
                    👑 이번 주 대여 1위 기종
                  </span>
                  <span className="text-xs text-vintage-300">소장 전환율 68%</span>
                </div>

                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-vintage-800">
                  <img
                    src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80"
                    alt="Olympus Pen EE-3"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] text-white">
                    을지로 신성카메라 픽업 가능
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                      Olympus PEN EE-3
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                      Mint 등급
                    </span>
                  </div>
                  <p className="text-xs text-vintage-300 line-clamp-2">
                    배터리 없이 72장 촬영 가능한 하프 카메라. 정인수 명장의 10분 오버홀 검수 완료.
                  </p>

                  <div className="pt-2 border-t border-vintage-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-vintage-400">주말 1박2일 대여</span>
                      <div className="text-lg font-bold text-terracotta-light">18,000원~</div>
                    </div>
                    <div className="text-right">
                      <span className="text-vintage-400">마음에 들면 소장 전환</span>
                      <div className="text-sm font-semibold text-white">190,000원 (대여료 공제)</div>
                    </div>
                  </div>

                  <Link
                    href="/rent"
                    className="w-full mt-3 py-2.5 rounded-xl bg-white text-vintage-900 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-vintage-100 transition-colors"
                  >
                    <span>기기 세부 스펙 &amp; 예약 캘린더 보기</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK HUB: 4 Core Capabilities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/ai-appraisal"
            className="p-5 rounded-2xl bg-white border border-vintage-200/90 shadow-xs hover:shadow-md hover:border-terracotta/40 transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-vintage-900 group-hover:text-terracotta transition-colors">
                사진 3장 AI 감정
              </div>
              <p className="text-[11px] text-vintage-500 mt-1 leading-snug">
                외관 등급과 최근 6개월 실거래 시세 즉시 산출
              </p>
            </div>
          </Link>

          <Link
            href="/experiences"
            className="p-5 rounded-2xl bg-white border border-vintage-200/90 shadow-xs hover:shadow-md hover:border-terracotta/40 transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-vintage-900 group-hover:text-terracotta transition-colors">
                작가 출사 &amp; 장인 클래스
              </div>
              <p className="text-[11px] text-vintage-500 mt-1 leading-snug">
                을지로 골목 출사 워크숍 &amp; 렌즈 분해 세척 강습
              </p>
            </div>
          </Link>

          <Link
            href="/frame"
            className="p-5 rounded-2xl bg-white border border-vintage-200/90 shadow-xs hover:shadow-md hover:border-terracotta/40 transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-vintage-900 group-hover:text-terracotta transition-colors">
                인스타 필름프레임 생성기
              </div>
              <p className="text-[11px] text-vintage-500 mt-1 leading-snug">
                내 사진에 기종·현상소 워터마크 입혀 PNG 다운로드
              </p>
            </div>
          </Link>

          <Link
            href="/cabinet"
            className="p-5 rounded-2xl bg-white border border-vintage-200/90 shadow-xs hover:shadow-md hover:border-terracotta/40 transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-vintage-900/10 text-vintage-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FolderLock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-vintage-900 group-hover:text-terracotta transition-colors">
                마이 캐비닛 &amp; 보증서
              </div>
              <p className="text-[11px] text-vintage-500 mt-1 leading-snug">
                대여 기기 반납 관리, 소장 전환 &amp; 디지털 보증서
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* 2. RENT-TO-OWN CAMERA SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-terracotta text-xs font-bold tracking-wider uppercase mb-1">
              <Flame className="w-4 h-4" />
              <span>DASI Rental &amp; Own</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-vintage-900">
              실패 없는 주말 렌탈 기기 라인업
            </h2>
            <p className="text-sm text-vintage-600 mt-1">
              클래식 필름부터 후지·리코 하이엔드 디카까지, 사용 후 대여료를 빼고 소장할 수 있습니다.
            </p>
          </div>
          <Link
            href="/rent"
            className="inline-flex items-center gap-1 text-sm font-semibold text-terracotta hover:underline"
          >
            <span>전체 24개 기종 보기</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockCameras.slice(0, 3).map((camera) => (
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
                  {mockAnalogSpots.slice(0, 2).map((spot) => (
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
          {mockPhotoGigs.map((gig) => (
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
                  src={mockMasters[0].profileImage}
                  alt={mockMasters[0].name}
                  className="w-10 h-10 rounded-full object-cover border border-white/30"
                />
                <div>
                  <div className="text-xs font-bold text-white">{mockMasters[0].name} (경력 42년)</div>
                  <div className="text-[11px] text-vintage-300">{mockMasters[0].shopName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. [PHASE 2 PREVIEW] SEOUL FESTIVALS & HOT SPOTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-terracotta text-xs font-bold tracking-wider uppercase mb-1">
              <Calendar className="w-4 h-4" />
              <span>DASI Explore &amp; Spots [Phase 2]</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-vintage-900">
              이번 주말 어디로 출사 갈까? 서울 축제 &amp; 핫스팟
            </h2>
            <p className="text-sm text-vintage-600 mt-1">
              달빛기행부터 여의도 불꽃축제까지, 아날로그 카메라에 최적화된 화각과 골든아워를 안내합니다.
            </p>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1 text-sm font-semibold text-terracotta hover:underline"
          >
            <span>전체 출사 가이드 보기</span>
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
