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
  Wrench,
  Coins,
  Award,
  Send,
  Plus,
  MapPin
} from 'lucide-react';
import { UserCoupon } from '@/types';
import { useDasi } from '@/context/DasiContext';
import { playShutterSound } from '@/utils/shutterAudio';
import { useAuth, TIER_INFO, POINT_ACTIONS } from '@/context/AuthContext';
import { SpotReportModal } from '@/components/explore/SpotReportModal';
import { LabQrDropModal } from '@/components/common/LabQrDropModal';
import { useDevicePlatform } from '@/hooks/useDevicePlatform';
import { AnalogMasterCertificateModal } from '@/components/cabinet/AnalogMasterCertificateModal';
import { QrCouponModal } from '@/components/cabinet/QrCouponModal';

// 아날로그 성지순례 스팟별 공식 실측 인증 컷 프리뷰 (스탬프 날인 시 자동 박제 아카이빙)
const SPOT_PREVIEWS: Record<string, string> = {
  '망우삼림': 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&auto=format&fit=crop&q=80',
  '을지로 신성카메라': 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
  '충무로 보성광학': 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&auto=format&fit=crop&q=80',
  '세운상가 옥상 일몰': 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
  '성수 독립서점 거리': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
  '서울숲 메타세콰이어길': 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80',
  '성수 로컬 현상소': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
  '경복궁 & 근정전': 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=600&auto=format&fit=crop&q=80',
  '북촌 한옥마을 & 계동길': 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=600&auto=format&fit=crop&q=80',
  '순천만 습지 & 갈대밭': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
  '경주 불국사 & 토함산': 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
};

export default function CabinetPage() {
  const {
    rentingItems,
    ownedItems,
    convertToOwn,
    bookedGigs,
    bookedExperiences,
    repairEstimates,
    proConsultations,
    coupons,
    useCoupon,
    addCoupon,
    showToast
  } = useDasi();
  const { user, profile, openLoginModal, awardPoints } = useAuth();
  const { triggerHaptic } = useDevicePlatform();
  const [activeTab, setActiveTab] = useState<'camera' | 'tickets' | 'repairs' | 'pro' | 'coupons' | 'points' | 'passport'>('camera');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLabQrModalOpen, setIsLabQrModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<any | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<{ type: 'gig' | 'experience'; data: any } | null>(null);
  const [selectedBarcodeCoupon, setSelectedBarcodeCoupon] = useState<UserCoupon | null>(null);
  const [selectedEscrowReviewGig, setSelectedEscrowReviewGig] = useState<any | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // 성지순례 패스포트 스탬프 상태
  const [stampedSpots, setStampedSpots] = useState<string[]>([
    '망우삼림',
    '을지로 신성카메라',
    '충무로 보성광학',
    '성수 독립서점 거리',
  ]);

  const handleStampSpot = async (spotName: string) => {
    if (stampedSpots.includes(spotName)) return;
    triggerHaptic('success');
    playShutterSound('slr');
    const nextStamped = [...stampedSpots, spotName];
    setStampedSpots(nextStamped);
    try {
      await awardPoints('spot_report', `stamp_${spotName}`);
    } catch (e) {
      console.error(e);
    }
    showToast(`📜 [${spotName}] 성지순례 스탬프 획득! (+200P 적립)`, 'success');

    const euljiroCourse = ['망우삼림', '을지로 신성카메라', '충무로 보성광학', '세운상가 옥상 일몰'];
    const isEuljiroComplete = euljiroCourse.every(s => nextStamped.includes(s));
    if (isEuljiroComplete && spotName === '세운상가 옥상 일몰') {
      setTimeout(() => {
        showToast('🎉 을지로·충무로 코스 완주! 1,000P 보너스와 한정판 스트랩 교환권이 발급되었습니다.', 'success');
      }, 1500);
    }
  };

  const [confirmedEscrowIds, setConfirmedEscrowIds] = useState<string[]>([]);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedConvertingItem, setSelectedConvertingItem] = useState<any | null>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedReturningItem, setSelectedReturningItem] = useState<any | null>(null);
  const [isResellModalOpen, setIsResellModalOpen] = useState(false);
  const [selectedResellItem, setSelectedResellItem] = useState<any | null>(null);
  const [convertPaymentMethod, setConvertPaymentMethod] = useState<'card' | 'toss' | 'kakao'>('card');
  const [isConvertingProcessing, setIsConvertingProcessing] = useState(false);

  const activeRentings = rentingItems.filter((r) => !r.isConvertedToOwn);
  const activeRenting = activeRentings[0] || null;
  const [selectedFilmRoll, setSelectedFilmRoll] = useState<{
    id: string;
    title: string;
    filmType: string;
    labName: string;
    scannedDate: string;
    totalPhotos: number;
    previewUrl: string;
    photos: string[];
  } | null>(null);
  const [selectedPhotoViewer, setSelectedPhotoViewer] = useState<string | null>(null);

  // Mock Scanned Film Rolls
  const mockFilmRolls = [
    {
      id: 'roll-1',
      title: '을지로 & 세운상가 골목 출사',
      filmType: 'Kodak Portra 400 (36컷)',
      labName: '망우삼림 을지로 (Fuji Frontier SP3000 스캔)',
      scannedDate: '2026.09.21',
      status: 'scanned',
      previewUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80',
      totalPhotos: 36,
      photos: [
        'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1000&auto=format&fit=crop&q=80'
      ]
    },
    {
      id: 'roll-2',
      title: '경복궁 가을 야간개장 한복 스냅',
      filmType: 'Fuji Superia X-TRA 400 (37컷)',
      labName: '고래사진관 충무로 (Noritsu HS-1800 스캔)',
      scannedDate: '2026.09.18',
      status: 'scanned',
      previewUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
      totalPhotos: 37,
      photos: [
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1000&auto=format&fit=crop&q=80'
      ]
    },
  ];

  const handleConfirmConvert = () => {
    if (!selectedConvertingItem) return;
    setIsConvertingProcessing(true);
    setTimeout(() => {
      playShutterSound('slr');
      convertToOwn(selectedConvertingItem.id);
      setIsConvertingProcessing(false);
      setIsConvertModalOpen(false);
      showToast(`${selectedConvertingItem.name} 소장 전환이 완료되었습니다! 정품 보증서가 발급되었습니다.`, 'success');
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & User Ecosystem Profile Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-vintage-900 via-[#2D241E] to-vintage-800 text-white shadow-md">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DASI 생태계 멤버십 &amp; 디지털 캐비닛</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
            {profile ? `${profile.nickname || '익명 필름러'}님의 캐비닛` : '마이 캐비닛 (통합 예약 &amp; 소장 센터)'}
          </h1>
          <p className="text-xs text-vintage-300">
            {profile
              ? '출사 명소 제보, 리뷰 등 자발적 기여로 모은 포인트를 확인하고 렌탈·현상 쿠폰으로 교환하세요.'
              : '로그인하시면 찜한 스팟, 대여 내역, 기여 포인트가 영구 보존됩니다.'}
          </p>
        </div>

        {/* 포인트 & 티어 요약 위젯 */}
        <div className="flex items-center gap-3 shrink-0">
          {user && profile ? (
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <div className="space-y-0.5 text-right">
                <div className="text-[10px] text-vintage-300 font-medium">보유 DASI 포인트</div>
                <div className="font-serif text-xl font-bold text-amber-300">{profile.total_points.toLocaleString()}P</div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-left">
                <div className="text-[10px] text-vintage-300 font-medium">멤버십 등급</div>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${TIER_INFO[profile.tier].bg} ${TIER_INFO[profile.tier].color}`}>
                  {TIER_INFO[profile.tier].label}
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={openLoginModal}
              className="px-5 py-3 rounded-2xl bg-terracotta hover:bg-terracotta-light text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-2"
            >
              <span>1초 간편 로그인하고 +500P 받기</span>
            </button>
          )}
        </div>
      </div>

      {/* 6-Tab Navigator */}
      <div className="flex border-b border-vintage-200 gap-2 pb-2 overflow-x-auto">
        {[
          { id: 'camera', label: '📷 카메라 렌탈 & 소장 컬렉션', count: rentingItems.filter(r => !r.isConvertedToOwn).length + ownedItems.length },
          { id: 'tickets', label: '🎟️ 스냅 & 출사 클래스 티켓', count: bookedGigs.length + bookedExperiences.length },
          { id: 'repairs', label: '🔧 명장 수리 & 필름 보관함', count: repairEstimates.length + mockFilmRolls.length },
          { id: 'pro', label: '🏆 PRO 스튜디오 VIP 상담', count: proConsultations.length },
          { id: 'coupons', label: '🎫 멤버십 & 쿠폰팩', count: coupons.length },
          { id: 'points', label: '⭐ 기여 & 포인트 리워드', count: profile ? `${profile.total_points}P` : '500P' },
          { id: 'passport', label: '📜 성지순례 패스포트', count: `${stampedSpots.length}/7 스탬프` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 ${
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
              {activeRentings.length > 0 && (
                <span className="text-xs text-terracotta font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{activeRentings.length}대 이용 중</span>
                </span>
              )}
            </div>

            <div className="p-6 sm:p-8">
              {activeRentings.length === 0 ? (
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
              ) : (
                <div className="space-y-6 divide-y divide-vintage-100">
                  {activeRentings.map((rentItem, idx) => (
                    <div key={rentItem.id} className={`grid grid-cols-1 md:grid-cols-12 gap-8 items-center ${idx > 0 ? 'pt-6' : ''}`}>
                      <div className="md:col-span-4 relative aspect-[4/3] rounded-2xl overflow-hidden bg-vintage-100">
                        <img
                          src={rentItem.imageUrl}
                          alt={rentItem.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-vintage-950/80 text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1">
                          <Clock className="w-3 h-3 text-terracotta" />
                          <span>{rentItem.rentalDays}일 렌탈</span>
                        </div>
                      </div>

                      <div className="md:col-span-8 space-y-4">
                        <div>
                          <span className="text-xs text-vintage-500">{rentItem.brand} · 예약일 {rentItem.bookedAt}</span>
                          <h3 className="font-serif text-2xl font-bold text-vintage-900">
                            {rentItem.name}
                          </h3>
                          <div className="text-xs text-vintage-600 mt-1">
                            픽업/반납 지정처: <strong>{rentItem.shopName}</strong>
                          </div>
                        </div>

                        {/* Rent to Own Math Box */}
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-vintage-50 border border-amber-200/80 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-amber-900 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              Rent-to-Own 즉시 소장 잔금
                            </span>
                            <span className="text-emerald-700 font-bold">기결제 대여료 {rentItem.rentalPaid.toLocaleString()}원 100% 공제</span>
                          </div>
                          <div className="flex items-baseline justify-between text-xs pt-1">
                            <span className="text-vintage-600">정상가 {rentItem.purchaseTotal.toLocaleString()}원 - 대여료 {rentItem.rentalPaid.toLocaleString()}원 =</span>
                            <span className="text-lg font-bold text-terracotta">
                              {Math.max(0, rentItem.purchaseTotal - rentItem.rentalPaid).toLocaleString()}원
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => {
                              setSelectedConvertingItem(rentItem);
                              setIsConvertModalOpen(true);
                            }}
                            className="px-6 py-2.5 rounded-xl bg-terracotta hover:bg-terracotta-light text-white text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-1.5"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>대여료 전액 빼고 내 것으로 소장하기</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReturningItem(rentItem);
                              setIsReturnModalOpen(true);
                            }}
                            className="px-5 py-2.5 rounded-xl bg-vintage-100 hover:bg-vintage-200 text-vintage-800 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-4 h-4 text-vintage-600" />
                            <span>매장 방문 반납 신청</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
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

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => setSelectedTicket({ type: 'gig', data: gig })}
                        className="py-2.5 px-3 rounded-xl border border-vintage-300 hover:bg-vintage-100 text-vintage-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>보증 바우처</span>
                      </button>

                      <button
                        onClick={() => setSelectedEscrowReviewGig(gig)}
                        className={`py-2.5 px-3 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                          confirmedEscrowIds.includes(gig.id)
                            ? 'bg-emerald-700 hover:bg-emerald-800'
                            : 'bg-terracotta hover:bg-terracotta-light'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{confirmedEscrowIds.includes(gig.id) ? '정산 완료 (원본)' : '검수 & 구매 확정'}</span>
                      </button>
                    </div>
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-vintage-900 flex items-center gap-2">
                  <Film className="w-6 h-6 text-terracotta" />
                  <span>내 보관 필름 롤 &amp; 현상소 스캔 ({mockFilmRolls.length})</span>
                </h2>
                <p className="text-xs text-vintage-600 mt-0.5">
                  제휴 현상소에서 스캔 완료된 원본 사진을 다운로드하거나 프레임 생성기로 바로 보낼 수 있습니다.
                </p>
              </div>

              <button
                onClick={() => setIsLabQrModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs active:scale-95 shrink-0"
              >
                <QrCode className="w-4 h-4 text-amber-300" />
                <span>🧪 현상소 1초 접수 QR 패스 (+150P)</span>
              </button>
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

                  <div className="p-5 pt-0 space-y-2">
                    <button
                      onClick={() => setSelectedFilmRoll(roll)}
                      className="w-full py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>웹 갤러리 열기 ({roll.totalPhotos}컷 보기)</span>
                    </button>

                    <div className="flex gap-2">
                      <a
                        href="/frame"
                        className="flex-1 py-2 rounded-xl bg-vintage-100 hover:bg-vintage-200 text-vintage-800 text-xs font-semibold text-center transition-colors"
                      >
                        감성 프레임 입히기
                      </a>
                      <button
                        onClick={() => showToast(`[${roll.title}] 원본 압축 ZIP 파일 다운로드가 시작되었습니다.`, 'info')}
                        className="px-4 py-2 rounded-xl border border-vintage-300 hover:bg-vintage-100 text-vintage-700 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>ZIP 다운</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: PRO STUDIO VIP CONSULTATIONS                      */}
      {/* ======================================================== */}
      {activeTab === 'pro' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="rounded-3xl bg-white border border-vintage-200 overflow-hidden shadow-xs">
            <div className="p-6 border-b border-vintage-100 flex items-center justify-between bg-vintage-50/50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h2 className="font-serif text-lg font-bold text-vintage-900">
                  DASI Pro 하이엔드 스튜디오 VIP 상담 이력 ({proConsultations.length})
                </h2>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              {proConsultations.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <p className="text-xs text-vintage-500">접수된 VIP 상담이 없습니다.</p>
                  <a
                    href="/pro"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-vintage-950 text-xs font-bold hover:bg-amber-400 transition-colors"
                  >
                    <span>하이엔드 Pro 스튜디오 갤러리 보기</span>
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {proConsultations.map((cons) => (
                    <div
                      key={cons.id}
                      className="p-5 rounded-2xl bg-[#FAF6EE] border border-vintage-200 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-mono text-amber-700 font-bold">{cons.vipCode}</div>
                          <h3 className="font-serif text-base font-bold text-vintage-900 mt-0.5">{cons.studioName}</h3>
                          <div className="text-xs text-vintage-500">{cons.artistName} · {cons.category}</div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          cons.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {cons.status === 'confirmed' ? '✓ 일정 확정' : '매니저 연락 중'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-vintage-700">
                        <div className="p-2.5 bg-white rounded-xl border border-vintage-100">
                          <div className="text-[10px] text-vintage-400">촬영 희망일</div>
                          <div className="font-bold text-vintage-900 mt-0.5">{cons.targetDate}</div>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-vintage-100">
                          <div className="text-[10px] text-vintage-400">베뉴 / 장소</div>
                          <div className="font-bold text-vintage-900 mt-0.5 truncate">{cons.location}</div>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-vintage-100">
                          <div className="text-[10px] text-vintage-400">기준 견적</div>
                          <div className="font-bold text-terracotta mt-0.5">{cons.pricing}</div>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-vintage-100">
                          <div className="text-[10px] text-vintage-400">접수일</div>
                          <div className="font-bold text-vintage-900 mt-0.5">{cons.requestedAt}</div>
                        </div>
                      </div>

                      <div className="text-[11px] text-vintage-500 flex items-center gap-1.5">
                        <span>📞 상담 연락처:</span>
                        <span className="font-semibold text-vintage-700">{cons.contact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 pt-0 border-t border-vintage-100">
              <a
                href="/pro"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-bold transition-colors shadow-xs"
              >
                <span>DASI Pro 스튜디오 추가 예약</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: MEMBERSHIP BENEFITS & COUPON WALLET               */}
      {/* ======================================================== */}
      {activeTab === 'coupons' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="rounded-3xl bg-white border border-vintage-200 overflow-hidden shadow-xs">
            <div className="p-6 border-b border-vintage-100 flex items-center justify-between bg-vintage-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-terracotta" />
                  <h2 className="font-serif text-lg font-bold text-vintage-900">
                    내 보유 멤버십 쿠폰 &amp; 바우처 ({coupons.length})
                  </h2>
                </div>
                <p className="text-xs text-vintage-600 mt-0.5">
                  현상소 방문 및 명장 클리닉 정비 시 즉시 적용 가능한 모바일 할인권입니다.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {coupons.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center mx-auto">
                    <Ticket className="w-7 h-7" />
                  </div>
                  <p className="text-xs text-vintage-500">보유 중인 쿠폰이 없습니다. 장인 클리닉에서 웰컴 쿠폰팩을 받아보세요!</p>
                  <a
                    href="/clinic"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-terracotta text-white text-xs font-semibold hover:bg-terracotta-light transition-colors"
                  >
                    <span>웰컴 쿠폰팩 받으러 가기</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {coupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
                        coupon.isUsed
                          ? 'bg-vintage-50 border-vintage-200 opacity-60'
                          : 'bg-gradient-to-br from-white to-[#FAF6EE] border-vintage-300 shadow-xs hover:border-terracotta/50'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            coupon.isUsed ? 'bg-vintage-200 text-vintage-600' : 'bg-terracotta/10 text-terracotta'
                          }`}>
                            {coupon.category === 'lab' ? '현상·스캔' : coupon.category === 'repair' ? '명장 수리' : '필름·소모품'}
                          </span>
                          <span className="text-[10px] text-vintage-400">유효기간: {coupon.validUntil}</span>
                        </div>

                        <div>
                          <h3 className="font-serif text-base font-bold text-vintage-900 leading-snug">
                            {coupon.title}
                          </h3>
                          <p className="text-xs text-vintage-500 mt-0.5">
                            발행처: {coupon.issuerName}
                          </p>
                        </div>

                        <div className="text-lg font-extrabold text-terracotta">
                          {coupon.discountText}
                        </div>
                      </div>

                      <div>
                        {coupon.isUsed ? (
                          <div className="py-2 text-center text-xs font-semibold text-vintage-400 bg-vintage-100 rounded-xl">
                            사용 완료됨
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedBarcodeCoupon(coupon)}
                            className="w-full py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>현장 사용 (바코드)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: ECOSYSTEM POINTS & UGC CONTRIBUTION               */}
      {/* ======================================================== */}
      {activeTab === 'points' && (
        <div className="space-y-8 animate-fadeIn">
          {/* 1. Points & Tier Dashboard Header */}
          <div className="rounded-3xl bg-white border border-vintage-200 overflow-hidden shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-vintage-100 pb-6">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-vintage-400 uppercase tracking-wider">
                  DASI CONTRIBUTE-TO-EARN ECOSYSTEM
                </span>
                <h2 className="font-serif text-2xl font-bold text-vintage-900">
                  내 DASI 포인트 &amp; 생태계 기여 리워드
                </h2>
                <p className="text-xs text-vintage-600">
                  내가 올린 출사지 팁과 솔직한 리뷰는 다른 필름러들에게 큰 영감이 되며, 모인 포인트는 렌탈비와 현상 쿠폰으로 돌려받습니다.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>출사 명소 제보 (+500P)</span>
                </button>
              </div>
            </div>

            {/* Current Balance & Tier Progress */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-600" />
                  <span>사용 가능 포인트</span>
                </div>
                <div className="font-serif text-3xl font-extrabold text-amber-900">
                  {(profile?.total_points || 500).toLocaleString()}<span className="text-base font-normal ml-1">P</span>
                </div>
                <div className="text-[11px] text-amber-700">
                  1,000P = 1,000원 상당 렌탈·현상 할인 가능
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-slate-600" />
                  <span>현재 멤버십 티어</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-2xl font-bold text-slate-900">
                    {TIER_INFO[profile?.tier || 'filmmer'].label}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {profile?.tier === 'legend'
                    ? '최고 등급! 금요일 밤 DROP 5분 우선 예약권 보유'
                    : profile?.tier === 'photowalker'
                    ? '매월 제휴 현상소 1회 무료 스캔 쿠폰 자동 지급'
                    : '가입 즉시 첫 렌탈 5% 할인 혜택 적용'}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-vintage-50 border border-vintage-200 space-y-2">
                <div className="text-xs font-bold text-vintage-800 flex items-center justify-between">
                  <span>다음 등급까지</span>
                  <span className="text-terracotta font-mono font-bold">
                    {profile?.tier === 'legend' ? 'MAX' : profile?.tier === 'photowalker' ? `${Math.max(0, 3000 - (profile?.total_points || 500))}P 남음` : `${Math.max(0, 500 - (profile?.total_points || 0))}P 남음`}
                  </span>
                </div>
                <div className="w-full bg-vintage-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-terracotta h-full rounded-full transition-all"
                    style={{
                      width: profile?.tier === 'legend' ? '100%' : profile?.tier === 'photowalker' ? `${Math.min(100, (((profile?.total_points || 500) - 500) / 2500) * 100)}%` : `${Math.min(100, ((profile?.total_points || 0) / 500) * 100)}%`
                    }}
                  />
                </div>
                <div className="text-[10px] text-vintage-500 leading-tight">
                  {profile?.tier === 'filmmer'
                    ? '출사 명소 1곳만 제보해도 바로 [포토워커] 승급!'
                    : profile?.tier === 'photowalker'
                    ? '누적 3,000P 달성 시 전설의 [DASI 레전드] 등극'
                    : 'DASI 최상위 마스터 컬렉터 멤버십'}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Ways to Earn Points (Win-Win Loop Guide) */}
          <div className="rounded-3xl bg-white border border-vintage-200 overflow-hidden shadow-xs p-6 sm:p-8 space-y-4">
            <h3 className="font-serif text-lg font-bold text-vintage-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-terracotta" />
              <span>포인트 적립 미션 (자발적 데이터 기여 루프)</span>
            </h3>
            <p className="text-xs text-vintage-500">
              아래 활동에 참여하시면 시스템이 기여 데이터를 검증하여 포인트를 즉시 적립해 드립니다.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {[
                {
                  icon: '📍',
                  title: '출사 Hot Spot 제보',
                  points: '+500P',
                  desc: '나만 아는 골든아워 명소와 필름 꿀팁 제보 (검증 완료 시)',
                  action: () => setIsReportModalOpen(true),
                  btnLabel: '명소 제보하기'
                },
                {
                  icon: '✍️',
                  title: '실사용 기기/스팟 리뷰',
                  points: '+100P',
                  desc: '렌탈 이용 후 솔직한 사진 1장과 한줄 조작감 공유',
                  action: () => showToast('렌탈 이용 완료 내역에서 [리뷰 작성]을 누르시면 +100P가 지급됩니다.', 'info'),
                  btnLabel: '리뷰 가이드'
                },
                {
                  icon: '🎞️',
                  title: '스캔 롤 웹 갤러리 공유',
                  points: '+150P',
                  desc: '현상소에서 스캔받은 롤에 태그 달고 아날로그 맵 연동',
                  action: () => showToast('상단 [명장 수리 & 필름 보관함]에서 현상본을 공유할 수 있습니다.', 'info'),
                  btnLabel: '필름롤 확인'
                },
                {
                  icon: '🤝',
                  title: '친구 초대 (첫 렌탈)',
                  points: '+1,000P',
                  desc: '초대 링크로 친구가 첫 주말 렌탈 완료 시 즉시 지급',
                  action: () => {
                    navigator.clipboard?.writeText?.(window.location.origin);
                    showToast('초대 링크가 복사되었습니다! 친구에게 공유해 보세요.', 'success');
                  },
                  btnLabel: '초대 링크 복사'
                },
                {
                  icon: '🔧',
                  title: '수리/오버홀 후기 등록',
                  points: '+300P',
                  desc: '명장 클리닉 견적 수리 후 비포/애프터 상태 기록',
                  action: () => showToast('명장 수리 완료 후 캐비닛에서 등록 가능합니다.', 'info'),
                  btnLabel: '수리 내역 보기'
                },
                {
                  icon: '🎉',
                  title: '신규 가입 웰컴 팩',
                  points: '+500P',
                  desc: 'DASI 계정 연동 및 프로필 설정 시 즉시 자동 지급',
                  action: () => openLoginModal(),
                  btnLabel: user ? '지급 완료' : '로그인하고 받기'
                }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-vintage-50/70 border border-vintage-200 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{item.icon}</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold font-mono">
                        {item.points}
                      </span>
                    </div>
                    <h4 className="font-serif text-sm font-bold text-vintage-900">{item.title}</h4>
                    <p className="text-[11px] text-vintage-600 leading-relaxed">{item.desc}</p>
                  </div>
                  <button
                    onClick={item.action}
                    className="w-full py-2 rounded-xl bg-white hover:bg-vintage-100 border border-vintage-200 text-vintage-800 text-xs font-semibold transition-colors"
                  >
                    {item.btnLabel}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Point Redemption Center */}
          <div className="rounded-3xl bg-white border border-vintage-200 overflow-hidden shadow-xs p-6 sm:p-8 space-y-4">
            <h3 className="font-serif text-lg font-bold text-vintage-900 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-terracotta" />
              <span>포인트 리워드 교환소 (Redeem Store)</span>
            </h3>
            <p className="text-xs text-vintage-500">
              차곡차곡 모은 포인트는 아래 전용 바우처로 언제든 즉시 교환하여 실결제 시 사용할 수 있습니다.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {[
                {
                  id: 'voucher-repair-free',
                  title: '신성카메라 명장 무료 30분 정밀 점검권',
                  cost: 3000,
                  desc: '셔터스피드 오차·노출계·렌즈 조리개 점검 전액 지원',
                  badge: '명장 무료 정비',
                  category: 'repair' as const,
                  issuerName: '을지로 신성카메라 (명장 이진호)',
                  discountText: '정밀 점검 30분 무료 (30,000원 상당)',
                },
                {
                  id: 'voucher-scan-free',
                  title: '망우삼림 무료 1롤 고화질 현상·스캔권',
                  cost: 2000,
                  desc: '노리츠/후지 3000dpi 스캔 1롤 전액 지원 (당일 3시간 완성)',
                  badge: '무료 현상·인화',
                  category: 'lab' as const,
                  issuerName: '을지로 망우삼림',
                  discountText: '현상+스캔 1롤 전액 무료 (8,000원 상당)',
                },
                {
                  id: 'voucher-repair-discount',
                  title: '충무로 보성광학 5,000원 수리 할인권',
                  cost: 1500,
                  desc: '클래식 SLR 셔터막 교체 & 곰팡이 클리닝 공임 할인',
                  badge: '명장 수리 할인',
                  category: 'repair' as const,
                  issuerName: '충무로 보성광학 (명장 강보성)',
                  discountText: '수리 공임비 5,000원 즉시 할인',
                },
                {
                  id: 'voucher-damage-care',
                  title: 'DASI 안심 케어(파손 보험) 1회 면제권',
                  cost: 1000,
                  desc: '카메라 주말 렌탈 시 3,000원 안심 보험료 전액 면제',
                  badge: '케어 혜택',
                  category: 'rental' as const,
                  issuerName: 'DASI 케어 센터',
                  discountText: '안심 보험료 3,000원 전액 면제',
                },
              ].map((voucher, idx) => (
                <div key={idx} className="p-5 rounded-2xl border-2 border-dashed border-vintage-300 bg-[#FAF8F5] flex flex-col justify-between space-y-4 text-center">
                  <div className="space-y-1.5">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-terracotta/10 text-terracotta">
                      {voucher.badge}
                    </span>
                    <h4 className="font-serif text-sm font-bold text-vintage-900 leading-snug">{voucher.title}</h4>
                    <p className="text-[11px] text-vintage-500 leading-relaxed">{voucher.desc}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="font-serif text-lg font-bold text-terracotta">{voucher.cost.toLocaleString()}P</div>
                    <button
                      onClick={async () => {
                        if (!user) {
                          openLoginModal();
                          return;
                        }
                        if ((profile?.total_points || 0) < voucher.cost) {
                          showToast(`포인트가 부족합니다. (${voucher.cost}P 필요 / 보유 ${(profile?.total_points || 0).toLocaleString()}P)`, 'warning');
                          return;
                        }

                        try {
                          await awardPoints('redeem', voucher.id);
                        } catch (e) {
                          console.error(e);
                        }

                        // 사용자 쿠폰함에 신규 쿠폰 즉시 발행
                        const expiry = new Date();
                        expiry.setDate(expiry.getDate() + 90);
                        const newCoupon = {
                          id: `coupon-${Date.now()}`,
                          title: voucher.title,
                          discountText: voucher.discountText,
                          issuerName: voucher.issuerName,
                          category: voucher.category,
                          validUntil: expiry.toISOString().slice(0, 10),
                          barcode: `DASI-${Math.floor(100000000 + Math.random() * 900000000)}`,
                          isUsed: false,
                        };
                        addCoupon(newCoupon);

                        showToast(`🎉 [${voucher.title}] 교환 완료! [멤버십 & 쿠폰팩] 보관함에 QR/바코드가 저장되었습니다.`, 'success');
                      }}
                      className="w-full py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-bold transition-all shadow-xs active:scale-95"
                    >
                      교환하기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 7: ANALOG PILGRIMAGE PASSPORT (성지순례 패스포트)     */}
      {/* ======================================================== */}
      {activeTab === 'passport' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Vintage Leather Passport Header */}
          <div className="rounded-3xl bg-gradient-to-br from-[#1a2332] via-[#0f172a] to-[#0b0f19] text-white p-6 sm:p-10 shadow-2xl border-2 border-amber-500/40 relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/30 pb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center text-xl">
                  📜
                </div>
                <div>
                  <div className="text-[10px] tracking-widest text-amber-400 font-bold uppercase">
                    REPUBLIC OF KOREA · ANALOG PILGRIMAGE
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">
                    아날로그 성지순례 패스포트
                  </h2>
                </div>
              </div>

              <div className="text-right text-xs font-mono text-amber-300/80">
                <div>여권 번호: <strong className="text-white">DASI-PASS-2026-KR</strong></div>
                <div>순례자: <strong className="text-amber-300">{profile?.nickname || user?.email?.split('@')[0] || '필름러'}</strong></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs relative z-10">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-vintage-400 text-[11px]">총 획득 스탬프</span>
                <div className="font-serif text-2xl font-bold text-amber-300">
                  {stampedSpots.length} <span className="text-xs text-vintage-400 font-normal">/ 11개</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-vintage-400 text-[11px]">스탬프 누적 적립금</span>
                <div className="font-serif text-2xl font-bold text-emerald-400">
                  +{(stampedSpots.length * 200).toLocaleString()}P
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                <span className="text-amber-300 text-[11px]">완주 리워드 상태</span>
                <div className="font-serif text-sm font-bold text-white mt-1">
                  {stampedSpots.length >= 7 ? '🎉 한정판 스트랩 수령 가능' : `남은 스팟: ${11 - stampedSpots.length}곳`}
                </div>
              </div>
            </div>
          </div>

          {/* 3 Pilgrimage Theme Courses */}
          <div className="space-y-8">
            {/* COURSE 1: EULJIRO & CHUNGMURO HERITAGE */}
            <div className="rounded-3xl bg-white border border-vintage-200 p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-vintage-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏮</span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-vintage-900">
                      코스 1: 을지로·충무로 40년 헤리티지 순례 (4선)
                    </h3>
                    <p className="text-xs text-vintage-500">
                      대한민국 필름 카메라의 메카, 장인들의 숨결이 살아 숨 쉬는 골목길
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                  완주 시 +1,000P &amp; 한정판 황동 스트랩
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: '망우삼림', role: '현상소', desc: '을지로 홍콩 무드 당일 스캔 성지', icon: '🧪' },
                  { name: '을지로 신성카메라', role: '수리실', desc: '40년 명장의 카메라 오버홀', icon: '🔧' },
                  { name: '충무로 보성광학', role: '카메라 샵', desc: '충무로 아날로그 바디 명가', icon: '📷' },
                  { name: '세운상가 옥상 일몰', role: '포토스팟', desc: '종로·을지로 전경 골든아워', icon: '🌅' },
                ].map((spot) => {
                  const isStamped = stampedSpots.includes(spot.name);
                  return (
                    <div
                      key={spot.name}
                      className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-4 ${
                        isStamped
                          ? 'border-red-600/50 bg-red-50/20 shadow-xs'
                          : 'border-dashed border-vintage-300 bg-vintage-50/50'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-lg">{spot.icon}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-vintage-200 text-vintage-700">
                            {spot.role}
                          </span>
                        </div>
                        <h4 className="font-serif text-base font-bold text-vintage-900">{spot.name}</h4>
                        <p className="text-[11px] text-vintage-500 leading-snug">{spot.desc}</p>
                      </div>

                      {/* 순례 인증 사진 박제 슬롯 */}
                      {isStamped ? (
                        <div className="relative aspect-[3/2] w-full rounded-xl overflow-hidden bg-vintage-900 border-2 border-white shadow-xs">
                          <img
                            src={SPOT_PREVIEWS[spot.name] || 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&auto=format&fit=crop&q=80'}
                            alt={spot.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] text-amber-300 font-mono">
                            PROOF ARCHIVED
                          </div>
                        </div>
                      ) : (
                        <div className="h-14 rounded-xl border border-dashed border-vintage-300 flex flex-col items-center justify-center text-vintage-400 text-[10px] bg-white/40">
                          <Camera className="w-3.5 h-3.5 mb-0.5 opacity-60" />
                          <span>스탬프 날인 시 사진 보관</span>
                        </div>
                      )}

                      {isStamped ? (
                        <div className="w-full py-2.5 rounded-xl border border-red-600 bg-red-100/60 text-red-700 font-serif font-bold text-xs flex items-center justify-center gap-1.5 rotate-[-2deg] shadow-2xs">
                          <span>✓ 40년 명장 공인 날인 (+200P)</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStampSpot(spot.name)}
                          className="w-full py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <span>스탬프 날인 (+200P)</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COURSE 2: SEONGSU & SEOUL FOREST */}
            <div className="rounded-3xl bg-white border border-vintage-200 p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-vintage-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌿</span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-vintage-900">
                      코스 2: 성수·서울숲 붉은 벽돌 &amp; 자연광 코스 (3선)
                    </h3>
                    <p className="text-xs text-vintage-500">
                      붉은 벽돌 카페거리와 싱그러운 메타세콰이어 숲속 햇살
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                  완주 시 +500P 바우처
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { name: '성수 독립서점 거리', role: '문화거리', desc: '아날로그 지류와 감성 서점', icon: '📚' },
                  { name: '서울숲 메타세콰이어길', role: '포토스팟', desc: '자연광 빛내림 틴달 현상 명소', icon: '🌲' },
                  { name: '성수 로컬 현상소', role: '현상소', desc: '24시간 필름 자판기 & 드롭박스', icon: '⚡' },
                ].map((spot) => {
                  const isStamped = stampedSpots.includes(spot.name);
                  return (
                    <div
                      key={spot.name}
                      className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-4 ${
                        isStamped
                          ? 'border-emerald-600/50 bg-emerald-50/20 shadow-xs'
                          : 'border-dashed border-vintage-300 bg-vintage-50/50'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-lg">{spot.icon}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-vintage-200 text-vintage-700">
                            {spot.role}
                          </span>
                        </div>
                        <h4 className="font-serif text-base font-bold text-vintage-900">{spot.name}</h4>
                        <p className="text-[11px] text-vintage-500 leading-snug">{spot.desc}</p>
                      </div>

                      {/* 순례 인증 사진 박제 슬롯 */}
                      {isStamped ? (
                        <div className="relative aspect-[3/2] w-full rounded-xl overflow-hidden bg-vintage-900 border-2 border-white shadow-xs">
                          <img
                            src={SPOT_PREVIEWS[spot.name] || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80'}
                            alt={spot.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] text-emerald-300 font-mono">
                            PROOF ARCHIVED
                          </div>
                        </div>
                      ) : (
                        <div className="h-14 rounded-xl border border-dashed border-vintage-300 flex flex-col items-center justify-center text-vintage-400 text-[10px] bg-white/40">
                          <Camera className="w-3.5 h-3.5 mb-0.5 opacity-60" />
                          <span>스탬프 날인 시 사진 보관</span>
                        </div>
                      )}

                      {isStamped ? (
                        <div className="w-full py-2.5 rounded-xl border border-emerald-600 bg-emerald-100/60 text-emerald-800 font-serif font-bold text-xs flex items-center justify-center gap-1.5 rotate-[1deg] shadow-2xs">
                          <span>✓ 서울숲 순례 인증 (+200P)</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStampSpot(spot.name)}
                          className="w-full py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <span>스탬프 날인 (+200P)</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COURSE 3: KOREA TOURISM TOP 100 OFFICIAL PILGRIMAGE */}
            <div className="rounded-3xl bg-white border border-vintage-200 p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-vintage-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏅</span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-vintage-900">
                      코스 3: 한국관광공사 공인 2025~2026 한국관광 100선 특별 순례 (4선)
                    </h3>
                    <p className="text-xs text-vintage-500">
                      대한민국구석구석 공식 캐치프레이즈와 함께하는 최고 권위의 필름 출사지
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                  공공데이터포털 연동 공인 스탬프
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: '경복궁 & 근정전', role: '고궁', desc: '조선 왕조의 위엄과 아침 안개', icon: '🏯' },
                  { name: '북촌 한옥마을', role: '골목', desc: '600년 역사의 돌담길과 기와', icon: '🏘️' },
                  { name: '덕수궁 돌담길', role: '고궁', desc: '붉은 벽돌과 노란 은행잎 산책길', icon: '🍁' },
                  { name: '순천만 국가정원 & 습지', role: '생태', desc: '황금빛 갈대숲 최고의 일몰', icon: '🌾' },
                ].map((spot) => {
                  const isStamped = stampedSpots.includes(spot.name);
                  return (
                    <div
                      key={spot.name}
                      className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-4 ${
                        isStamped
                          ? 'border-amber-600/50 bg-amber-50/20 shadow-xs'
                          : 'border-dashed border-vintage-300 bg-vintage-50/50'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-lg">{spot.icon}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                            {spot.role}
                          </span>
                        </div>
                        <h4 className="font-serif text-base font-bold text-vintage-900">{spot.name}</h4>
                        <p className="text-[11px] text-vintage-500 leading-snug">{spot.desc}</p>
                      </div>

                      {/* 순례 인증 사진 박제 슬롯 */}
                      {isStamped ? (
                        <div className="relative aspect-[3/2] w-full rounded-xl overflow-hidden bg-vintage-900 border-2 border-white shadow-xs">
                          <img
                            src={SPOT_PREVIEWS[spot.name] || 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=600&auto=format&fit=crop&q=80'}
                            alt={spot.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] text-amber-300 font-mono">
                            PROOF ARCHIVED
                          </div>
                        </div>
                      ) : (
                        <div className="h-14 rounded-xl border border-dashed border-vintage-300 flex flex-col items-center justify-center text-vintage-400 text-[10px] bg-white/40">
                          <Camera className="w-3.5 h-3.5 mb-0.5 opacity-60" />
                          <span>스탬프 날인 시 사진 보관</span>
                        </div>
                      )}

                      {isStamped ? (
                        <div className="w-full py-2.5 rounded-xl border border-amber-600 bg-amber-100/60 text-amber-900 font-serif font-bold text-xs flex items-center justify-center gap-1.5 rotate-[-1deg] shadow-2xs">
                          <span>🏅 100선 공인 날인 (+200P)</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStampSpot(spot.name)}
                          className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <span>100선 스탬프 날인 (+200P)</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {isConvertModalOpen && selectedConvertingItem && (
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
                이미 지불하신 대여료 <strong>{selectedConvertingItem.rentalPaid.toLocaleString()}원</strong>을 100% 공제하고 잔금만 결제하시면, 이 카메라의 소유권이 영구히 이전되며 <strong>디지털 정품 보증서</strong>가 즉시 발행됩니다.
              </p>

              <div className="p-4 rounded-2xl bg-vintage-50 border border-vintage-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-vintage-500">소장 대상 기종</span>
                  <span className="font-bold text-vintage-900">{selectedConvertingItem.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-vintage-500">정상 소장가</span>
                  <span className="text-vintage-800">{selectedConvertingItem.purchaseTotal.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-terracotta font-semibold">
                  <span>대여료 전액 공제 (100%)</span>
                  <span>- {selectedConvertingItem.rentalPaid.toLocaleString()}원</span>
                </div>
                <div className="pt-2 border-t border-vintage-200 flex justify-between text-sm font-bold text-vintage-900">
                  <span>최종 실결제 잔금</span>
                  <span className="text-emerald-800 font-extrabold text-base">
                    {Math.max(0, selectedConvertingItem.purchaseTotal - selectedConvertingItem.rentalPaid).toLocaleString()}원
                  </span>
                </div>
              </div>

              {/* 결제 수단 선택 */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-vintage-800">잔액 결제 수단</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'card', label: '신용카드' },
                    { id: 'toss', label: '토스페이' },
                    { id: 'kakao', label: '카카오페이' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setConvertPaymentMethod(m.id as any)}
                      className={`py-2 text-[11px] font-semibold rounded-xl border transition-all ${
                        convertPaymentMethod === m.id
                          ? 'border-vintage-900 bg-vintage-900 text-white'
                          : 'border-vintage-200 bg-white text-vintage-700 hover:bg-vintage-50'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
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
                disabled={isConvertingProcessing}
                className="px-4 py-2.5 rounded-xl border border-vintage-300 text-vintage-700 text-xs font-semibold hover:bg-vintage-100"
              >
                취소
              </button>
              <button
                onClick={handleConfirmConvert}
                disabled={isConvertingProcessing}
                className="flex-1 py-2.5 rounded-xl bg-terracotta hover:bg-terracotta-light text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                {isConvertingProcessing ? (
                  <span>안전 결제 승인 중...</span>
                ) : (
                  <span>{Math.max(0, selectedConvertingItem.purchaseTotal - selectedConvertingItem.rentalPaid).toLocaleString()}원 결제하고 소장 완료</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RETURN APPLICATION MODAL */}
      {isReturnModalOpen && selectedReturningItem && (
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
                <div>📍 <strong>반납 지정 매장:</strong> {selectedReturningItem.shopName}</div>
                <div>📷 <strong>반납 기종:</strong> {selectedReturningItem.name}</div>
                <div>🕒 <strong>반납 마감:</strong> 대여 종료일 19:00까지</div>
              </div>

              <div className="p-3 bg-amber-50 text-amber-900 rounded-xl text-[11px]">
                💡 <strong>가승인 자동 해제 안내:</strong> 현장 방문 시 장인님의 3분 외관 검수 완료 즉시 신용카드 보증금 가승인이 자동 전액 취소됩니다.
              </div>
            </div>

            <button
              onClick={() => {
                setIsReturnModalOpen(false);
                showToast(`${selectedReturningItem.name} 반납 일정이 매장에 접수되었습니다.`, 'info');
              }}
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
                  showToast('제휴 매장 즉시 매입 신청이 접수되었습니다! 카카오 알림톡을 확인해 주세요.', 'success');
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

      {/* SCANNED FILM ROLL WEB GALLERY MODAL */}
      {selectedFilmRoll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-vintage-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-vintage-100 flex items-center justify-between bg-vintage-50/70">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {selectedFilmRoll.filmType}
                  </span>
                  <span className="text-xs text-vintage-500">{selectedFilmRoll.scannedDate} 스캔</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-vintage-900 mt-1">
                  {selectedFilmRoll.title}
                </h3>
                <p className="text-xs text-vintage-600">
                  현상소: {selectedFilmRoll.labName} · 총 {selectedFilmRoll.totalPhotos}컷 인덱스
                </p>
              </div>
              <button
                onClick={() => setSelectedFilmRoll(null)}
                className="p-2 text-vintage-400 hover:text-vintage-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gallery Grid */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {selectedFilmRoll.photos.map((photo, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPhotoViewer(photo)}
                    className="relative aspect-square rounded-2xl overflow-hidden bg-vintage-100 border border-vintage-200 cursor-pointer group hover:shadow-md transition-all"
                  >
                    <img
                      src={photo}
                      alt={`Cut ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-bold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs transition-opacity">
                        #{idx + 1} 크게보기
                      </span>
                    </div>
                    <span className="absolute bottom-1.5 left-2 text-[10px] font-mono text-white/90 drop-shadow">
                      EXP {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-vintage-100 bg-vintage-50 flex items-center justify-between">
              <span className="text-xs text-vintage-600">
                사진을 클릭하면 큰 화면으로 감상하거나 프레임 생성기로 연결됩니다.
              </span>
              <div className="flex gap-2">
                <a
                  href="/frame"
                  className="px-4 py-2 rounded-xl bg-terracotta hover:bg-terracotta-light text-white text-xs font-semibold shadow-xs"
                >
                  프레임 메이커로 이동
                </a>
                <button
                  onClick={() => setSelectedFilmRoll(null)}
                  className="px-4 py-2 rounded-xl border border-vintage-300 text-vintage-700 hover:bg-vintage-100 text-xs font-semibold"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 7: ANALOG HERITAGE PASSPORT (성지순례 패스포트)     */}
      {/* ======================================================== */}
      {activeTab === 'passport' && (
        <div className="space-y-8 animate-fadeIn">
          {/* PASSPORT COVER & STATUS HEADER */}
          <div className="rounded-3xl bg-gradient-to-r from-[#20150F] via-[#2F2016] to-[#20150F] border-2 border-amber-500/40 p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
            {/* Subtle vintage watermark */}
            <div className="absolute -right-6 -bottom-8 font-serif text-[110px] font-black text-amber-400/5 select-none pointer-events-none">
              DASI
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold font-mono tracking-wider">
                  <span>REPUBLIC OF DASI · ANALOG PASSPORT</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-cream">
                  서울 아날로그 성지순례 패스포트
                </h2>
                <p className="text-xs text-vintage-300 max-w-xl leading-relaxed">
                  현상소, 40년 명장 수리 공방, 골든아워 출사지를 방문해 디지털 브라스 도장을 모으세요. 각 코스를 완주할 때마다 1,000P 바우처와 한정판 실물 굿즈가 지급됩니다.
                </p>
              </div>

              {/* Passport User Stamp Card */}
              <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-amber-400/20 shrink-0 text-right space-y-1">
                <div className="text-[10px] text-amber-300 font-mono tracking-wider uppercase">PASSPORT HOLDER</div>
                <div className="text-sm font-bold text-white">{profile?.nickname || '익명 필름러'}</div>
                <div className="text-xs text-emerald-400 font-mono font-bold mt-1">
                  스탬프 {stampedSpots.length} / 7 획득 ({Math.round((stampedSpots.length / 7) * 100)}%)
                </div>
                <div className="w-40 h-2 bg-white/10 rounded-full overflow-hidden mt-2 ml-auto">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-terracotta rounded-full transition-all duration-700"
                    style={{ width: `${(stampedSpots.length / 7) * 100}%` }}
                  />
                </div>
                <button
                  onClick={() => {
                    triggerHaptic('medium');
                    setIsCertModalOpen(true);
                  }}
                  className="mt-3 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-terracotta text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>마스터 수료증 &amp; 인스타 공유</span>
                </button>
              </div>
            </div>
          </div>

          {/* COURSE 1: EULJIRO & CHUNGMURO HERITAGE COURSE */}
          <div className="rounded-3xl bg-white border border-vintage-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-vintage-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-terracotta/10 text-terracotta text-[10px] font-bold">
                  코스 01 · 4개 스팟
                </div>
                <h3 className="font-serif text-lg font-bold text-vintage-900 mt-1">
                  을지로·충무로 아날로그 헤리티지 코스
                </h3>
                <p className="text-xs text-vintage-500">
                  40년 역사의 카메라 거리와 힙한 필름 현상소를 도보 2시간 동안 탐방하는 클래식 코스
                </p>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 shrink-0">
                🎁 완주 시: 1,000P + 현상 1롤 무료권
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: '망우삼림', role: '을지로 대표 현상소', desc: '노리츠/후지 고화질 스캔 & 빈티지 암실 감성' },
                { name: '을지로 신성카메라', role: '강태훈 명장 (42년)', desc: '장롱 속 기계식 바디 정밀 점검 및 픽업처' },
                { name: '충무로 보성광학', role: '한동규 장인 (38년)', desc: '1/4000초 셔터막 오차 오버홀 전문 공방' },
                { name: '세운상가 옥상 일몰', role: '골든아워 핫스팟', desc: '종묘와 북한산 뷰가 펼쳐지는 노을 성지' },
              ].map((spot, idx) => {
                const isStamped = stampedSpots.includes(spot.name);
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      isStamped
                        ? 'bg-amber-50/50 border-amber-300/80 shadow-2xs'
                        : 'bg-vintage-50 border-vintage-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-vintage-400">0{idx + 1}</span>
                        <span className="text-[10px] font-bold text-terracotta">{spot.role}</span>
                      </div>
                      <h4 className="text-sm font-bold text-vintage-900">{spot.name}</h4>
                      <p className="text-[11px] text-vintage-500 leading-snug">{spot.desc}</p>
                    </div>

                    {/* Stamp Mark or Action Button */}
                    <div className="pt-2">
                      {isStamped ? (
                        <div className="p-2.5 rounded-xl bg-white border border-amber-300 text-center space-y-0.5 shadow-2xs">
                          <div className="font-mono text-[10px] font-bold text-amber-700 tracking-wider">
                            ✓ DASI STAMPED
                          </div>
                          <div className="text-[9px] text-vintage-400 font-mono">2026.09 · 인증완료</div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStampSpot(spot.name)}
                          className="w-full py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs"
                        >
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          <span>스탬프 찍기 (+200P)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COURSE 2: SEONGSU & SEOUL FOREST COURSE */}
          <div className="rounded-3xl bg-white border border-vintage-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-vintage-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-600/10 text-emerald-700 text-[10px] font-bold">
                  코스 02 · 3개 스팟
                </div>
                <h3 className="font-serif text-lg font-bold text-vintage-900 mt-1">
                  성수·서울숲 레트로 감성 투어
                </h3>
                <p className="text-xs text-vintage-500">
                  붉은 벽돌 팩토리 카페와 서울숲 자연광 아래서 감성 샷을 건지는 MZ 인기 출사 코스
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 shrink-0">
                🎁 완주 시: DASI 한정판 넥스트랩 바우처
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: '성수 독립서점 거리', role: '인문학 필름 스냅', desc: '골목길 사이 따스한 자연광과 종이 냄새' },
                { name: '서울숲 억새밭 일몰', role: '자연광 골든아워', desc: '가을 억새와 부드러운 역광 인물 촬영지' },
                { name: '연무장길 24시 필름 자판기', role: '심야 필름 스팟', desc: '야간 긴급 필름 보급 및 Y2K 인증샷' },
              ].map((spot, idx) => {
                const isStamped = stampedSpots.includes(spot.name);
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      isStamped
                        ? 'bg-emerald-50/50 border-emerald-300/80 shadow-2xs'
                        : 'bg-vintage-50 border-vintage-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-vintage-400">0{idx + 1}</span>
                        <span className="text-[10px] font-bold text-emerald-700">{spot.role}</span>
                      </div>
                      <h4 className="text-sm font-bold text-vintage-900">{spot.name}</h4>
                      <p className="text-[11px] text-vintage-500 leading-snug">{spot.desc}</p>
                    </div>

                    <div className="pt-2">
                      {isStamped ? (
                        <div className="p-2.5 rounded-xl bg-white border border-emerald-300 text-center space-y-0.5 shadow-2xs">
                          <div className="font-mono text-[10px] font-bold text-emerald-700 tracking-wider">
                            ✓ DASI STAMPED
                          </div>
                          <div className="text-[9px] text-vintage-400 font-mono">2026.09 · 인증완료</div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStampSpot(spot.name)}
                          className="w-full py-2.5 rounded-xl bg-vintage-900 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs"
                        >
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                          <span>스탬프 찍기 (+200P)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SINGLE PHOTO LIGHTBOX VIEWER */}
      {selectedPhotoViewer && (
        <div
          onClick={() => setSelectedPhotoViewer(null)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl max-h-[85vh] rounded-3xl overflow-hidden bg-vintage-900 border border-vintage-800 shadow-2xl flex flex-col cursor-default"
          >
            <button
              onClick={() => setSelectedPhotoViewer(null)}
              className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white bg-black/50 rounded-full backdrop-blur-xs"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedPhotoViewer}
              alt="High res photo"
              className="w-full h-auto max-h-[75vh] object-contain"
            />
            <div className="p-4 bg-vintage-900/90 text-white flex items-center justify-between border-t border-white/10">
              <span className="text-xs text-vintage-300">DASI Lab Web Scanner 3000dpi High-Res</span>
              <a
                href="/frame"
                className="px-3.5 py-1.5 rounded-xl bg-terracotta text-white text-xs font-semibold hover:bg-terracotta-light"
              >
                이 사진에 프레임 입히기 →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* BARCODE / QR MODAL FOR COUPONS */}
      {selectedBarcodeCoupon && (
        <div
          onClick={() => setSelectedBarcodeCoupon(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm bg-[#FAF7F0] rounded-3xl overflow-hidden shadow-2xl border-4 border-vintage-300 p-6 sm:p-8 space-y-5 text-center cursor-default"
          >
            <div className="space-y-1.5 border-b-2 border-vintage-200 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center mx-auto mb-1">
                <Ticket className="w-6 h-6" />
              </div>
              <span className="text-[10px] tracking-widest uppercase font-mono text-terracotta font-bold">
                DASI MEMBERSHIP BENEFIT PASS
              </span>
              <h3 className="font-serif text-xl font-bold text-vintage-900 leading-snug">
                {selectedBarcodeCoupon.title}
              </h3>
              <p className="text-xs text-vintage-600">
                발행처: <strong className="text-vintage-800">{selectedBarcodeCoupon.issuerName}</strong>
              </p>
            </div>

            {/* BARCODE & QR DUAL PASS GRAPHIC */}
            <div className="bg-white p-5 rounded-2xl border border-vintage-200 shadow-inner space-y-3">
              <div className="flex items-center justify-center gap-4">
                {/* QR Vector Pattern */}
                <div className="w-20 h-20 bg-vintage-900 rounded-xl p-1.5 flex flex-col justify-between shrink-0 shadow-xs">
                  <div className="flex justify-between">
                    <div className="w-5 h-5 bg-white rounded-xs p-1 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-vintage-900 rounded-2xs" />
                    </div>
                    <div className="w-5 h-5 bg-white rounded-xs p-1 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-vintage-900 rounded-2xs" />
                    </div>
                  </div>
                  <div className="flex justify-center items-center py-0.5">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                  </div>
                  <div className="flex justify-between">
                    <div className="w-5 h-5 bg-white rounded-xs p-1 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-vintage-900 rounded-2xs" />
                    </div>
                    <div className="w-3.5 h-3.5 bg-amber-400 rounded-xs" />
                  </div>
                </div>

                {/* Barcode Strip */}
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center h-14 gap-0.5 px-2 bg-white rounded-lg overflow-hidden">
                    {[4, 2, 5, 2, 3, 2, 4, 3, 2, 5, 2, 3, 4, 2, 5, 3, 2, 4, 3, 2, 5, 2, 4, 2, 3, 5, 2, 4, 3].map((w, idx) => (
                      <div
                        key={idx}
                        className="h-full bg-vintage-900 rounded-[0.5px]"
                        style={{ width: `${w}px` }}
                      />
                    ))}
                  </div>
                  <div className="text-[10px] font-mono tracking-wider text-vintage-500 font-bold truncate">
                    {selectedBarcodeCoupon.barcode || `DASI-${selectedBarcodeCoupon.id.toUpperCase()}`}
                  </div>
                </div>
              </div>

              <div className="text-xs text-terracotta font-bold border-t border-vintage-150 pt-2">
                혜택: {selectedBarcodeCoupon.discountText}
              </div>
            </div>

            <div className="p-3 bg-vintage-100/70 rounded-xl text-[11px] text-vintage-600 text-left space-y-1">
              <div>• 현장(제휴 현상소/수리실/매장) 카운터에 위 바코드를 제시해 주세요.</div>
              <div>• 유효기간: <strong>{selectedBarcodeCoupon.validUntil}</strong>까지</div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  useCoupon(selectedBarcodeCoupon.id);
                  setSelectedBarcodeCoupon(null);
                  showToast(`${selectedBarcodeCoupon.title} 쿠폰 사용이 완료되었습니다!`, 'success');
                }}
                className="w-full py-3 rounded-xl bg-terracotta text-white text-xs font-bold hover:bg-terracotta-light shadow-md transition-all active:scale-95"
              >
                현장에서 사용 완료 처리하기
              </button>
              <button
                onClick={() => setSelectedBarcodeCoupon(null)}
                className="w-full py-2.5 rounded-xl bg-vintage-200 text-vintage-700 text-xs font-semibold hover:bg-vintage-300 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ESCROW WATERMARK REVIEW & RELEASE MODAL (CTO Charter) */}
      {selectedEscrowReviewGig && (
        <div
          onClick={() => setSelectedEscrowReviewGig(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-vintage-200 p-6 sm:p-8 space-y-6 text-left cursor-default max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-vintage-200 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>DASI SAFE ESCROW 정산 검수</span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-vintage-900 mt-1">
                  {selectedEscrowReviewGig.title}
                </h3>
                <p className="text-xs text-vintage-500">
                  작가: <strong>{selectedEscrowReviewGig.creatorName}</strong> · 촬영지: {selectedEscrowReviewGig.location} · 예치금: {selectedEscrowReviewGig.price?.toLocaleString()}원
                </p>
              </div>
              <button
                onClick={() => setSelectedEscrowReviewGig(null)}
                className="p-2 text-vintage-400 hover:text-vintage-800 rounded-full hover:bg-vintage-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              💡 <strong>에스크로 안심 검수 원칙:</strong> 작가님이 업로드한 사진 4장을 미리 확인하세요. [최종 구매 확정]을 누르시면 예치금이 작가님께 전달되며, 워터마크가 제거된 무손실 고화질 원본 다운로드가 즉시 열립니다.
            </div>

            {/* 4 WATERMARK SAMPLE PHOTOS */}
            <div className="grid grid-cols-2 gap-3">
              {[
                'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&auto=format&fit=crop&q=80',
              ].map((imgUrl, idx) => (
                <div key={idx} className="relative aspect-4/3 rounded-2xl overflow-hidden bg-vintage-100 border border-vintage-200 group">
                  <img src={imgUrl} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  {!confirmedEscrowIds.includes(selectedEscrowReviewGig.id) ? (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-3 pointer-events-none">
                      <div className="border-2 border-white/80 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-mono font-bold text-white tracking-wider uppercase rotate-[-12deg] text-center shadow-lg bg-black/30 backdrop-blur-2xs">
                        DASI ESCROW PREVIEW
                      </div>
                    </div>
                  ) : (
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-emerald-700/90 text-white text-[9px] font-bold">
                      ✓ 워터마크 해제됨
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-2 border-t border-vintage-200 flex flex-col sm:flex-row gap-2 justify-end">
              <button
                onClick={() => setSelectedEscrowReviewGig(null)}
                className="px-4 py-2.5 rounded-xl border border-vintage-300 text-vintage-700 text-xs font-semibold hover:bg-vintage-100 text-center"
              >
                닫기
              </button>

              {confirmedEscrowIds.includes(selectedEscrowReviewGig.id) ? (
                <button
                  onClick={() => showToast('4K 무손실 원본 ZIP 파일 다운로드를 시작합니다.', 'success')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 text-white text-xs sm:text-sm font-bold hover:bg-emerald-800 shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>✓ 4K 무손실 원본 다운로드 (.ZIP)</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setConfirmedEscrowIds((prev) => [...prev, selectedEscrowReviewGig.id]);
                    showToast('에스크로 대금이 작가님께 정상 정산되었으며 원본 다운로드가 해금되었습니다!', 'success');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-terracotta text-white text-xs sm:text-sm font-bold hover:bg-terracotta-light shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>최종 구매 확정 및 에스크로 대금 지급</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 출사 명소 제보 모달 (캐비닛 내 어디서든 호출 가능) */}
      <SpotReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={() => {
          awardPoints('spot_report');
        }}
      />

      {/* 현상소 1초 스마트 스캔 접수 QR 모달 */}
      <LabQrDropModal
        isOpen={isLabQrModalOpen}
        onClose={() => setIsLabQrModalOpen(false)}
        defaultLabName="을지로 제휴 현상소"
        onSuccess={() => {
          showToast('현상소 스마트 스캔 접수가 완료되었습니다! (+150P 적립)', 'success');
        }}
      />

      {/* 아날로그 성지순례 마스터 디지털 수료증 & 인스타 공유 모달 */}
      <AnalogMasterCertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        holderName={profile?.nickname || '아날로그 필름러'}
        stampedCount={stampedSpots.length}
        totalSpots={7}
      />
    </div>
  );
}

