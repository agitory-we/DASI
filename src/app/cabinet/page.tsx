'use client';

import React, { useState } from 'react';
import {
  Camera,
  Sparkles,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Ticket,
  ChevronRight,
  RotateCcw,
  QrCode,
  FileText,
  AlertCircle,
  Film,
  Download,
  ExternalLink,
  Check,
  X,
  TrendingUp,
  Wrench
} from 'lucide-react';
import { useDasi } from '@/context/DasiContext';
import { playShutterSound } from '@/utils/shutterAudio';

export default function CabinetPage() {
  const {
    rentingItems,
    ownedItems,
    convertToOwn,
    bookedGigs,
    bookedExperiences,
    repairEstimates
  } = useDasi();
  const [activeTab, setActiveTab] = useState<'camera' | 'tickets' | 'repairs'>('camera');
  const [selectedCertificate, setSelectedCertificate] = useState<any | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<{ type: 'gig' | 'experience'; data: any } | null>(null);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isResellModalOpen, setIsResellModalOpen] = useState(false);
  const [selectedResellItem, setSelectedResellItem] = useState<any | null>(null);

  const activeRenting = rentingItems[0] || null;

  // Mock Scanned Film Rolls
  const mockFilmRolls = [
    {
      id: 'roll-1',
      title: '을지로 & 세운상가 골목 출사',
      filmType: 'Kodak Portra 400 (36컷)',
      labName: '망우삼림 을지로 (SP3000 스캔)',
      scannedDate: '2026.09.21',
      status: 'scanned',
      previewUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80',
      totalPhotos: 36,
    },
    {
      id: 'roll-2',
      title: '경복궁 가을 야간개장 한복 스냅',
      filmType: 'Fuji Superia X-TRA 400',
      labName: '고래사진관 충무로 (Noritsu HS-1800)',
      scannedDate: '2026.09.18',
      status: 'scanned',
      previewUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
      totalPhotos: 37,
    },
  ];

  const handleConfirmConvert = () => {
    if (!activeRenting) return;
    playShutterSound('slr');
    convertToOwn(activeRenting.id);
    setIsConvertModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>My Digital Heritage Cabinet</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-vintage-900">
          마이 캐비닛 (내 기기 &amp; 통합 예약 센터)
        </h1>
        <p className="text-xs sm:text-sm text-vintage-600">
          대여 중인 기기 소장 전환(Rent-to-Own), 디지털 정품 보증서, 스냅 및 클래스 모바일 티켓을 모두 관리합니다.
        </p>
      </div>

      {/* 3-Tab Navigator */}
      <div className="flex border-b border-vintage-200 gap-2 pb-2">
        {[
          { id: 'camera', label: '📷 카메라 렌탈 & 소장 컬렉션', count: rentingItems.filter(r => !r.isConvertedToOwn).length + ownedItems.length },
          { id: 'tickets', label: '🎟️ 스냅 & 출사 클래스 티켓', count: bookedGigs.length + bookedExperiences.length },
          { id: 'repairs', label: '🔧 명장 수리 & 필름 보관함', count: repairEstimates.length + mockFilmRolls.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-vintage-900 text-white shadow-xs'
                : 'bg-white text-vintage-700 hover:bg-vintage-100 border border-vintage-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-vintage-100 text-vintage-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: CAMERA RENTAL & OWNED COLLECTION                  */}
      {/* ======================================================== */}
      {activeTab === 'camera' && (
        <div className="space-y-8 animate-fadeIn">
          {/* 1. CURRENTLY RENTING DEVICE */}
          <div className="rounded-3xl bg-white border border-vintage-200 overflow-hidden shadow-xs space-y-6">
            <div className="p-6 border-b border-vintage-100 flex items-center justify-between bg-vintage-50/50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h2 className="font-serif text-lg font-bold text-vintage-900">
                  현재 대여 중인 카메라 ({rentingItems.filter(r => !r.isConvertedToOwn).length})
                </h2>
              </div>
              {activeRenting && !activeRenting.isConvertedToOwn && (
                <span className="text-xs text-terracotta font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>대여 {activeRenting.rentalDays}일차 이용 중</span>
                </span>
              )}
            </div>

            <div className="p-6 sm:p-8">
              {!activeRenting ? (
                <div className="text-center py-10 space-y-3">
                  <p className="text-xs text-vintage-500">현재 대여 중인 카메라가 없습니다. 이번 주말 감성 출사용 카메라를 예약해 보세요!</p>
                  <a
                    href="/rent"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-vintage-900 text-white text-xs font-semibold hover:bg-terracotta transition-colors"
                  >
                    <span>카메라 대여 라인업 둘러보기</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : activeRenting.isConvertedToOwn ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto font-bold">
                    ✓
                  </div>
                  <h3 className="font-serif text-xl font-bold text-emerald-950">
                    소장 전환이 완료되었습니다!
                  </h3>
                  <p className="text-xs text-emerald-800">
                    이제 완전히 대표님의 소중한 카메라가 되었습니다. 아래 [소장 컬렉션]에서 디지털 정품 보증서를 확인하세요.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-4 relative aspect-[4/3] rounded-2xl overflow-hidden bg-vintage-100">
                    <img
                      src={activeRenting.imageUrl}
                      alt={activeRenting.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="md:col-span-8 space-y-5">
                    <div>
                      <span className="text-xs text-vintage-500">{activeRenting.brand}</span>
                      <h3 className="font-serif text-2xl font-bold text-vintage-900">
                        {activeRenting.name}
                      </h3>
                      <div className="text-xs text-vintage-600 mt-1">
                        반납처: <strong>{activeRenting.shopName}</strong>
                      </div>
                    </div>

                    {/* Rent to Own Math Box */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-vintage-50 border border-amber-200/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-900 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          Rent-to-Own 즉시 소장 잔금
                        </span>
                        <span className="text-emerald-700 font-bold">대여료 {activeRenting.rentalPaid.toLocaleString()}원 100% 공제</span>
                      </div>
                      <div className="flex items-baseline justify-between text-xs pt-1">
                        <span className="text-vintage-600">정상가 {activeRenting.purchaseTotal.toLocaleString()}원 - 기결제 대여료 {activeRenting.rentalPaid.toLocaleString()}원 =</span>
                        <span className="text-lg font-bold text-terracotta">
                          {(activeRenting.purchaseTotal - activeRenting.rentalPaid).toLocaleString()}원
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setIsConvertModalOpen(true)}
                        className="px-6 py-3 rounded-xl bg-terracotta hover:bg-terracotta-light text-white text-xs sm:text-sm font-bold transition-all shadow-xs"
                      >
                        대여료 빼고 내 것으로 소장하기
                      </button>
                      <button
                        onClick={() => setIsReturnModalOpen(true)}
                        className="px-5 py-3 rounded-xl bg-vintage-100 hover:bg-vintage-200 text-vintage-800 text-xs sm:text-sm font-semibold transition-colors"
                      >
                        매장 방문 반납 신청
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. MY OWNED COLLECTION & DIGITAL CERTIFICATES */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-vintage-900">
                  내 소장 컬렉션 &amp; 디지털 보증서 (Passport)
                </h2>
                <p className="text-xs text-vintage-600 mt-0.5">
                  DASI에서 검증된 정품 이력과 장인 점검 로그로 추후 원클릭 재판매(Resell)가 가능합니다.
                </p>
              </div>
              <span className="text-xs font-bold text-vintage-700">보유 기기 {ownedItems.length}대</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ownedItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl bg-white border border-vintage-200 p-6 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 rounded-2xl object-cover border border-vintage-200 shrink-0"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        DASI 정품 인증 기기
                      </span>
                      <h3 className="font-serif text-lg font-bold text-vintage-900">
                        {item.name}
                      </h3>
                      <div className="text-[11px] text-vintage-500 font-mono">
                        SN: {item.serial}
                      </div>
                      <div className="text-[11px] text-vintage-600">
                        취득일: {item.acquiredDate}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-vintage-50 border border-vintage-100 text-[11px] text-vintage-700">
                    🔧 {item.masterInspection}
                  </div>

                  <div className="pt-2 border-t border-vintage-100 flex gap-2">
                    <button
                      onClick={() => setSelectedCertificate(item)}
                      className="flex-1 py-2 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>디지털 정품 보증서 열기</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedResellItem(item);
                        setIsResellModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl border border-vintage-300 hover:bg-vintage-50 text-vintage-700 text-xs font-semibold"
                    >
                      재판매(Resell)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: TICKETS (GIGS & WORKSHOPS)                        */}
      {/* ======================================================== */}
      {activeTab === 'tickets' && (
        <div className="space-y-10 animate-fadeIn">
          {/* A. BOOKED PHOTO GIGS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-vintage-900 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  <span>스냅 작가 촬영 예약 내역 ({bookedGigs.length})</span>
                </h2>
                <p className="text-xs text-vintage-600 mt-0.5">
                  안심 에스크로 보증으로 사진을 최종 수령하고 확인할 때까지 결제 대금이 안전하게 보호됩니다.
                </p>
              </div>
            </div>

            {bookedGigs.length === 0 ? (
              <div className="rounded-3xl bg-white border border-vintage-200 p-10 text-center space-y-3">
                <p className="text-xs text-vintage-500">예약된 스냅 촬영 내역이 없습니다.</p>
                <a
                  href="/gigs"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-vintage-900 text-white text-xs font-semibold hover:bg-terracotta transition-colors"
                >
                  <span>을지로·성수 감성 스냅 작가 둘러보기</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {bookedGigs.map((gig) => (
                  <div
                    key={gig.id}
                    className="rounded-3xl bg-white border border-vintage-200 p-6 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>안심 에스크로 예치 중</span>
                        </span>
                        <span className="text-[10px] font-mono text-vintage-400">
                          {gig.bookedAt} 접수
                        </span>
                      </div>

                      <div>
                        <h3 className="font-serif text-lg font-bold text-vintage-900">
                          {gig.title}
                        </h3>
                        <div className="text-xs text-vintage-600 mt-1 flex items-center gap-2">
                          <span>배정 작가: <strong>{gig.creatorName}</strong></span>
                          <span>•</span>
                          <span>위치: <strong>{gig.location}</strong></span>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-vintage-50 border border-vintage-200/70 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-vintage-500">촬영 예정 일시</span>
                          <span className="font-bold text-vintage-900">{gig.scheduledAt}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-vintage-500">에스크로 예치 금액</span>
                          <span className="font-bold text-terracotta">{gig.price.toLocaleString()}원</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedTicket({ type: 'gig', data: gig })}
                      className="w-full py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>에스크로 보증 바우처 확인</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* B. BOOKED EXPERIENCES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-vintage-900 flex items-center gap-2">
                  <Ticket className="w-6 h-6 text-terracotta" />
                  <span>출사 &amp; 암실 클래스 모바일 티켓 ({bookedExperiences.length})</span>
                </h2>
                <p className="text-xs text-vintage-600 mt-0.5">
                  현장 방문 시 모바일 QR 코드를 제시하여 즉시 입장하고 카메라 패키지를 수령할 수 있습니다.
                </p>
              </div>
            </div>

            {bookedExperiences.length === 0 ? (
              <div className="rounded-3xl bg-white border border-vintage-200 p-10 text-center space-y-3">
                <p className="text-xs text-vintage-500">예약된 출사 또는 암실 클래스가 없습니다.</p>
                <a
                  href="/experiences"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-vintage-900 text-white text-xs font-semibold hover:bg-terracotta transition-colors"
                >
                  <span>주말 골목 출사 & 암실 클래스 둘러보기</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {bookedExperiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="rounded-3xl bg-white border border-vintage-200 p-6 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-vintage-100 text-vintage-800">
                          {exp.status === 'confirmed' ? '✓ 예약 확정' : '참여 완료'}
                        </span>
                        {exp.hasRentalPackage && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900">
                            📷 대여 카메라 패키지 포함
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="font-serif text-lg font-bold text-vintage-900">
                          {exp.title}
                        </h3>
                        <div className="text-xs text-vintage-600 mt-1">
                          호스트: <strong>{exp.hostName}</strong> • 장소: {exp.location}
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-vintage-50 border border-vintage-200/70 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-vintage-500">체험 일시</span>
                          <span className="font-bold text-vintage-900">{exp.dateTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-vintage-500">티켓 번호</span>
                          <span className="font-mono text-vintage-700">{exp.ticketCode}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedTicket({ type: 'experience', data: exp })}
                      className="w-full py-2.5 rounded-xl bg-terracotta hover:bg-terracotta-light text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>모바일 입장 티켓 열기</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: REPAIRS & SCANNED FILM ROLLS                      */}
      {/* ======================================================== */}
      {activeTab === 'repairs' && (
        <div className="space-y-10 animate-fadeIn">
          {/* A. REPAIR ESTIMATES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-vintage-900 flex items-center gap-2">
                  <Wrench className="w-6 h-6 text-vintage-800" />
                  <span>명장 수리실 1:1 온라인 사전 견적 ({repairEstimates.length})</span>
                </h2>
                <p className="text-xs text-vintage-600 mt-0.5">
                  충무로·을지로 장인 공방에 접수된 카메라의 사전 진단 상태 및 수리 타임라인입니다.
                </p>
              </div>
            </div>

            {repairEstimates.length === 0 ? (
              <div className="rounded-3xl bg-white border border-vintage-200 p-10 text-center space-y-3">
                <p className="text-xs text-vintage-500">접수된 명장 수리 견적이 없습니다. 장롱 속 카메라를 무료로 진단받아 보세요!</p>
                <a
                  href="/clinic"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-vintage-900 text-white text-xs font-semibold hover:bg-terracotta transition-colors"
                >
                  <span>명장 클리닉 사전 견적 신청하기</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {repairEstimates.map((est) => (
                  <div
                    key={est.id}
                    className="rounded-3xl bg-white border border-vintage-200 p-6 shadow-xs space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        est.status === 'diagnosing'
                          ? 'bg-amber-100 text-amber-900'
                          : est.status === 'repairing'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {est.status === 'diagnosing'
                          ? '🔍 명장 정밀 진단 중'
                          : est.status === 'repairing'
                          ? '⚙️ 부품 수급 및 정비 중'
                          : '✓ 수리 완료 (안심 배송 대기)'}
                      </span>
                      <span className="text-[10px] font-mono text-vintage-400">
                        {est.estimateCode}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif text-lg font-bold text-vintage-900">
                        {est.cameraModel}
                      </h3>
                      <div className="text-xs text-vintage-600 mt-1">
                        담당 명장: <strong>{est.masterName}</strong>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {est.symptoms.map((sym) => (
                        <span key={sym} className="px-2 py-0.5 rounded bg-vintage-100 text-vintage-700 text-[10px]">
                          {sym}
                        </span>
                      ))}
                    </div>

                    <div className="p-3 rounded-2xl bg-vintage-50 border border-vintage-200/70 text-xs text-vintage-700">
                      <p className="line-clamp-2">💬 {est.details}</p>
                    </div>

                    <div className="pt-2 border-t border-vintage-100 flex items-center justify-between text-[11px] text-vintage-500">
                      <span>접수일: {est.requestedAt}</span>
                      <span className="text-emerald-700 font-medium">안심 픽업 박스 지원 대상</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* B. SCANNED FILM ROLLS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-vintage-900 flex items-center gap-2">
                  <Film className="w-6 h-6 text-terracotta" />
                  <span>내 보관 필름 롤 &amp; 현상소 스캔 ({mockFilmRolls.length})</span>
                </h2>
                <p className="text-xs text-vintage-600 mt-0.5">
                  제휴 현상소에서 스캔 완료된 원본 사진을 다운로드하거나 프레임 생성기로 바로 보낼 수 있습니다.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockFilmRolls.map((roll) => (
                <div
                  key={roll.id}
                  className="rounded-3xl bg-white border border-vintage-200 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[16/9] bg-vintage-100 overflow-hidden">
                      <img
                        src={roll.previewUrl}
                        alt={roll.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium">
                        {roll.filmType}
                      </div>
                      <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-lg bg-emerald-600/90 text-white text-[10px] font-bold">
                        ✓ 고화질 스캔 완료 ({roll.totalPhotos}장)
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="text-[11px] text-vintage-500">{roll.scannedDate} 스캔</div>
                      <h3 className="font-serif text-lg font-bold text-vintage-900 group-hover:text-terracotta transition-colors">
                        {roll.title}
                      </h3>
                      <p className="text-xs text-vintage-600">
                        📍 {roll.labName}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex gap-2">
                    <a
                      href="/frame"
                      className="flex-1 py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-semibold text-center transition-colors"
                    >
                      감성 프레임 입히기
                    </a>
                    <button
                      onClick={() => alert(`[${roll.title}] 원본 압축 ZIP 파일 다운로드를 시작합니다!`)}
                      className="px-4 py-2.5 rounded-xl border border-vintage-300 hover:bg-vintage-100 text-vintage-700 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>전체 다운로드</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RTO CONVERT CONFIRMATION MODAL */}
      {isConvertModalOpen && activeRenting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-vintage-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-vintage-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-terracotta" />
                <h3 className="font-serif text-xl font-bold text-vintage-900">
                  Rent-to-Own 소장 전환
                </h3>
              </div>
              <button
                onClick={() => setIsConvertModalOpen(false)}
                className="p-1.5 text-vintage-400 hover:text-vintage-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-vintage-700">
              <p className="leading-relaxed">
                이미 지불하신 대여료 <strong>{activeRenting.rentalPaid.toLocaleString()}원</strong>을 100% 공제하고 잔금만 결제하시면, 이 카메라의 소유권이 영구히 이전되며 <strong>디지털 정품 보증서</strong>가 즉시 발행됩니다.
              </p>

              <div className="p-4 rounded-2xl bg-vintage-50 border border-vintage-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-vintage-500">소장 대상 기종</span>
                  <span className="font-bold text-vintage-900">{activeRenting.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-vintage-500">정상 소장가</span>
                  <span className="text-vintage-800">{activeRenting.purchaseTotal.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-terracotta">
                  <span>대여료 전액 공제 (100%)</span>
                  <span>- {activeRenting.rentalPaid.toLocaleString()}원</span>
                </div>
                <div className="pt-2 border-t border-vintage-200 flex justify-between text-sm font-bold text-vintage-900">
                  <span>최종 실결제 잔금</span>
                  <span className="text-emerald-800">
                    {(activeRenting.purchaseTotal - activeRenting.rentalPaid).toLocaleString()}원
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>DASI 평생 케어 보증 혜택 부여</span>
                </div>
                <p className="text-[10px] text-emerald-800 leading-relaxed">
                  소장 전환 즉시 충무로·을지로 명장 오버홀 이력 카드가 활성화되며, 6개월간 무상 기능 점검을 보증합니다.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setIsConvertModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-vintage-300 text-vintage-700 text-xs font-semibold hover:bg-vintage-100"
              >
                취소
              </button>
              <button
                onClick={handleConfirmConvert}
                className="flex-1 py-2.5 rounded-xl bg-terracotta hover:bg-terracotta-light text-white text-xs font-bold transition-colors shadow-xs"
              >
                {(activeRenting.purchaseTotal - activeRenting.rentalPaid).toLocaleString()}원 결제하고 소장 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RETURN APPLICATION MODAL */}
      {isReturnModalOpen && activeRenting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-vintage-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-vintage-100 pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-vintage-700" />
                <h3 className="font-serif text-xl font-bold text-vintage-900">
                  매장 방문 반납 접수
                </h3>
              </div>
              <button
                onClick={() => setIsReturnModalOpen(false)}
                className="p-1.5 text-vintage-400 hover:text-vintage-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-vintage-700">
              <div className="p-4 rounded-2xl bg-vintage-50 border border-vintage-200 space-y-2">
                <div>📍 <strong>반납 지정 매장:</strong> {activeRenting.shopName}</div>
                <div>📷 <strong>반납 기종:</strong> {activeRenting.name}</div>
                <div>🕒 <strong>반납 마감:</strong> 대여 종료일 19:00까지</div>
              </div>

              <div className="p-3 bg-amber-50 text-amber-900 rounded-xl text-[11px]">
                💡 <strong>가승인 자동 해제 안내:</strong> 현장 방문 시 장인님의 3분 외관 검수 완료 즉시 신용카드 보증금 가승인이 자동 전액 취소됩니다.
              </div>
            </div>

            <button
              onClick={() => setIsReturnModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-vintage-900 text-white text-xs font-semibold hover:bg-terracotta transition-colors"
            >
              반납 일정 확정 완료
            </button>
          </div>
        </div>
      )}

      {/* RESELL MODAL */}
      {isResellModalOpen && selectedResellItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-vintage-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-vintage-100 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3 className="font-serif text-xl font-bold text-vintage-900">
                  DASI 인증 리셀(재판매) 견적
                </h3>
              </div>
              <button
                onClick={() => setIsResellModalOpen(false)}
                className="p-1.5 text-vintage-400 hover:text-vintage-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-vintage-700">
              <div className="p-4 rounded-2xl bg-vintage-50 border border-vintage-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-vintage-500">기종</span>
                  <span className="font-bold text-vintage-900">{selectedResellItem.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-vintage-500">보증 상태</span>
                  <span className="text-emerald-700 font-bold">DASI 정품 이력 인증 완료</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-vintage-500">감가 방어율</span>
                  <span className="font-bold text-vintage-900">92% (최상위 티어)</span>
                </div>
                <div className="pt-2 border-t border-vintage-200 flex justify-between text-sm font-bold text-vintage-900">
                  <span>DASI 즉시 매입 보장가</span>
                  <span className="text-terracotta">390,000원</span>
                </div>
              </div>

              <p className="text-[11px] text-vintage-500 leading-relaxed">
                DASI 디지털 정품 여권(Passport)이 발급된 카메라는 충무로 제휴 매장에서 감가 없이 즉시 현금 매입을 보장합니다.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsResellModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-vintage-300 text-vintage-700 text-xs font-semibold"
              >
                다음에 하기
              </button>
              <button
                onClick={() => {
                  alert('제휴 매장 즉시 매입 신청이 접수되었습니다! 카카오 알림톡을 확인해 주세요.');
                  setIsResellModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-terracotta text-white text-xs font-bold hover:bg-terracotta-light transition-colors"
              >
                390,000원에 매입 신청
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CERTIFICATE MODAL */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#FAF7F0] rounded-3xl overflow-hidden shadow-2xl border-4 border-vintage-300 p-8 space-y-6 text-center">
            <div className="space-y-1 border-b-2 border-vintage-300 pb-4">
              <div className="w-12 h-12 rounded-full bg-terracotta text-white flex items-center justify-center font-serif text-xl font-bold mx-auto mb-2">
                다
              </div>
              <span className="text-[10px] tracking-widest uppercase font-mono text-vintage-600">
                CERTIFICATE OF VINTAGE AUTHENTICITY
              </span>
              <h3 className="font-serif text-2xl font-bold text-vintage-900">
                {selectedCertificate.name}
              </h3>
              <div className="text-xs font-mono text-terracotta font-bold">
                SERIAL NUMBER: {selectedCertificate.serial}
              </div>
            </div>

            <div className="space-y-2 text-xs text-vintage-800 text-left bg-white/60 p-4 rounded-2xl border border-vintage-200">
              <div>✓ <strong>외관 및 기능 상태:</strong> {selectedCertificate.condition} 등급</div>
              <div>✓ <strong>점검 내역:</strong> {selectedCertificate.masterInspection}</div>
              <div>✓ <strong>소유권 취득:</strong> {selectedCertificate.acquiredDate}</div>
              <div>✓ <strong>보증 기간:</strong> DASI 케어 영구 이력 등록</div>
            </div>

              <div className="p-3 bg-white rounded-xl border border-vintage-200 inline-block">
                <QrCode className="w-20 h-20 text-vintage-900 mx-auto" />
                <div className="text-[9px] text-vintage-400 mt-1 font-mono">DASI-VERIFIED-HASH#9912</div>
              </div>

              <button
                onClick={() => setSelectedCertificate(null)}
                className="w-full py-2.5 rounded-xl bg-vintage-900 text-white text-xs font-bold hover:bg-terracotta"
              >
                닫기
              </button>
            </div>
          </div>
        )}

        {/* TICKET / ESCROW VOUCHER MODAL */}
        {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#FAF7F0] rounded-3xl overflow-hidden shadow-2xl border-4 border-vintage-300 p-8 space-y-6 text-center">
            {selectedTicket.type === 'gig' ? (
              <>
                <div className="space-y-1 border-b-2 border-vintage-300 pb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center mx-auto mb-2 font-bold">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] tracking-widest uppercase font-mono text-emerald-800 font-bold">
                    DASI SAFE ESCROW VOUCHER
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-vintage-900">
                    {selectedTicket.data.title}
                  </h3>
                  <div className="text-xs font-mono text-terracotta font-bold">
                    작가: {selectedTicket.data.creatorName}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-vintage-800 text-left bg-white/70 p-4 rounded-2xl border border-vintage-200">
                  <div>📍 <strong>촬영 위치:</strong> {selectedTicket.data.location}</div>
                  <div>🕒 <strong>촬영 일시:</strong> {selectedTicket.data.scheduledAt}</div>
                  <div>💰 <strong>에스크로 예치금:</strong> {selectedTicket.data.price.toLocaleString()}원</div>
                  <div>🛡️ <strong>보호 원칙:</strong> 사진 최종 검수 완료 시 대금 지급</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-vintage-200 inline-block">
                  <QrCode className="w-20 h-20 text-vintage-900 mx-auto" />
                  <div className="text-[9px] text-vintage-400 mt-1 font-mono">DASI-ESCROW-CERT#9920</div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1 border-b-2 border-vintage-300 pb-4">
                  <div className="w-12 h-12 rounded-full bg-terracotta text-white flex items-center justify-center mx-auto mb-2 font-bold">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] tracking-widest uppercase font-mono text-terracotta font-bold">
                    MOBILE ADMISSION VOUCHER
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-vintage-900">
                    {selectedTicket.data.title}
                  </h3>
                  <div className="text-xs font-mono text-vintage-600">
                    TICKET: {selectedTicket.data.ticketCode}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-vintage-800 text-left bg-white/70 p-4 rounded-2xl border border-vintage-200">
                  <div>👤 <strong>진행 호스트:</strong> {selectedTicket.data.hostName}</div>
                  <div>📍 <strong>집합 장소:</strong> {selectedTicket.data.location}</div>
                  <div>🕒 <strong>일시:</strong> {selectedTicket.data.dateTime}</div>
                  {selectedTicket.data.hasRentalPackage && (
                    <div className="text-amber-800 font-bold">📷 <strong>특전:</strong> 대여 카메라 &amp; 필름 1롤 현장 수령</div>
                  )}
                </div>

                <div className="p-3 bg-white rounded-xl border border-vintage-200 inline-block">
                  <QrCode className="w-20 h-20 text-vintage-900 mx-auto" />
                  <div className="text-[9px] text-vintage-400 mt-1 font-mono">{selectedTicket.data.ticketCode}</div>
                </div>
              </>
            )}

            <button
              onClick={() => setSelectedTicket(null)}
              className="w-full py-2.5 rounded-xl bg-vintage-900 text-white text-xs font-bold hover:bg-terracotta"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
