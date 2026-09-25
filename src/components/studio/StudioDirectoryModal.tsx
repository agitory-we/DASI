'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Store,
  Sparkles,
  MapPin,
  Phone,
  QrCode,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Filter,
  Flame,
  Award,
  ChevronRight,
  Layers,
  Copy,
  Check,
  Share2
} from 'lucide-react';
import { PhotoStudio } from '@/types';
import { useDasi } from '@/context/DasiContext';
import { shareViaKakaoTalk } from '@/utils/kakaoShare';

interface StudioDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudioDirectoryModal: React.FC<StudioDirectoryModalProps> = ({ isOpen, onClose }) => {
  const { showToast, addCoupon } = useDasi();
  const [studios, setStudios] = useState<PhotoStudio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'partner' | 'heritage' | 'lab' | 'dropoff'>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedStudioForQr, setSelectedStudioForQr] = useState<PhotoStudio | null>(null);
  const [qrRemainingSeconds, setQrRemainingSeconds] = useState<number>(600); // 10분 유효시간

  const handleIssueQrVoucher = (studio: PhotoStudio) => {
    setSelectedStudioForQr(studio);
    if (studio.partnerBenefit) {
      addCoupon({
        id: `voucher-${Date.now()}`,
        title: `[현장 20% 할인] ${studio.name}`,
        issuerName: studio.name,
        discountText: studio.partnerBenefit.discountText,
        validUntil: '2026.12.31',
        category: 'lab',
        isUsed: false,
      });
      showToast(`${studio.name} 20% 현장 할인권이 캐비닛 쿠폰함에 자동 보관되었습니다!`, 'success');
    }
  };

  // QR 모달 타이머
  useEffect(() => {
    if (!selectedStudioForQr) return;
    setQrRemainingSeconds(600);
    const interval = setInterval(() => {
      setQrRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedStudioForQr]);

  // API 데이터 로드
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    const query = new URLSearchParams();
    if (activeFilter !== 'all') query.set('filter', activeFilter);
    if (selectedDistrict !== 'all') query.set('district', selectedDistrict);

    fetch(`/api/studios?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.studios)) {
          setStudios(data.studios);
        }
      })
      .catch((err) => {
        console.error('Failed to load studios:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, activeFilter, selectedDistrict]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOpenKakaoMap = (studio: PhotoStudio) => {
    const query = encodeURIComponent(`${studio.name} ${studio.address}`);
    window.open(`https://map.kakao.com/link/search/${query}`, '_blank');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-stone-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-white rounded-3xl border border-vintage-300 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] my-auto"
      >
        {/* Header (Always pinned & prominent) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-vintage-200 bg-white sticky top-0 z-30 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-terracotta/10 text-terracotta">
                <Store className="w-4 h-4" />
              </span>
              <h3 className="font-serif text-lg font-bold text-vintage-900">
                서울시 사진관 &amp; 공식 제휴 현상소
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono font-bold">
                공공데이터 + 소상공인 융합
              </span>
            </div>
            <p className="text-xs text-vintage-500 mt-0.5">
              30년+ 노포 사진관부터 DASI 단독 현장 20% 할인 제휴 현상소까지 한눈에 탐색
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-vintage-100 hover:bg-vintage-200 text-vintage-700 hover:text-vintage-950 flex items-center justify-center transition shadow-xs"
            aria-label="닫기"
            title="창 닫기 (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Navigation Bar */}
        <div className="p-4 border-b border-vintage-200 bg-vintage-50/80 flex flex-wrap items-center justify-between gap-3">
          {/* Main Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: '전체 보기', icon: Layers },
              { id: 'partner', label: '⭐ DASI 제휴샵 (할인)', icon: Sparkles, highlight: true },
              { id: 'heritage', label: '🏛️ 노포 헤리티지 (15~50년)', icon: Award },
              { id: 'lab', label: '🧪 전문 현상소', icon: Store },
              { id: 'dropoff', label: '🏪 24시 드롭오프 편의점', icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                    isActive
                      ? tab.highlight
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-vintage-900 text-white shadow-xs'
                      : tab.highlight
                      ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                      : 'bg-white text-vintage-700 hover:bg-vintage-200/80 border border-vintage-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* District Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-vintage-500">주요 상권:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-vintage-300 text-vintage-800 shadow-2xs focus:outline-none focus:ring-1 focus:ring-terracotta"
            >
              <option value="all">서울 전역</option>
              <option value="junggu">중구 (충무로·을지로)</option>
              <option value="jongno">종로구 (종로·세운상가)</option>
              <option value="mapo">마포·서대문 (연남·신촌)</option>
              <option value="seongsu">성동구 (성수동)</option>
            </select>
          </div>
        </div>

        {/* Studio Cards Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 mx-auto border-3 border-terracotta border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-vintage-500 font-mono">
                소상공인 상권정보 &amp; 서울시 인허가 데이터 융합 로딩 중...
              </p>
            </div>
          ) : studios.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-vintage-200 p-6 space-y-2">
              <Store className="w-10 h-10 mx-auto text-vintage-300" />
              <p className="text-sm font-bold text-vintage-800">해당 조건의 사진관이 없습니다.</p>
              <p className="text-xs text-vintage-500">다른 필터나 상권을 선택해 보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studios.map((studio) => {
                return (
                  <div
                    key={studio.id}
                    className={`rounded-2xl p-5 border transition-all hover:shadow-md flex flex-col justify-between ${
                      studio.isPartner
                        ? 'bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 border-amber-300 shadow-xs relative overflow-hidden'
                        : 'bg-white border-vintage-200'
                    }`}
                  >
                    {/* Partner Gold Top Accent Ribbon */}
                    {studio.isPartner && (
                      <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-xl shadow-xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> DASI 공식 제휴사
                      </div>
                    )}

                    <div className="space-y-3">
                      {/* Badges Bar */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {/* Heritage Badge */}
                        {studio.isHeritage && (
                          <span className="px-2 py-0.5 rounded-md bg-stone-900 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1 shadow-2xs">
                            <Award className="w-3 h-3 text-amber-400" />
                            {studio.yearsInBusiness}년 전통 노포 ({studio.openYear}년 개업)
                          </span>
                        )}

                        {/* Commercial District Tag */}
                        {studio.commercialDistrict && (
                          <span className="px-2 py-0.5 rounded-md bg-vintage-100 text-vintage-700 text-[10px] font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-terracotta" />
                            {studio.commercialDistrict.split(' (')[0]}
                          </span>
                        )}

                        {/* 24h Dropoff Convenience Tag */}
                        {studio.dropoffAvailable && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-600" />
                            24시 편의점 드롭오프 연계
                          </span>
                        )}
                      </div>

                      {/* Studio Name & Category */}
                      <div>
                        <h4 className="text-base font-bold text-vintage-900 font-serif flex items-center gap-1.5">
                          {studio.name}
                        </h4>
                        <p className="text-xs text-vintage-600 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-vintage-400 shrink-0" />
                          <span className="truncate">{studio.address}</span>
                        </p>
                        {studio.tel && (
                          <p className="text-[11px] text-vintage-500 flex items-center gap-1 mt-0.5 font-mono">
                            <Phone className="w-3 h-3 text-vintage-400 shrink-0" />
                            {studio.tel}
                          </p>
                        )}
                      </div>

                      {/* Specialties Tags */}
                      <div className="flex flex-wrap gap-1">
                        {studio.specialties.map((spec, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-vintage-100/70 text-vintage-600 text-[10px]"
                          >
                            #{spec}
                          </span>
                        ))}
                      </div>

                      {/* Partner Exclusive Benefit Banner */}
                      {studio.isPartner && studio.partnerBenefit && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-300/80 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5 text-amber-600" />
                              {studio.partnerBenefit.discountText}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-200/60 px-1.5 py-0.2 rounded">
                              현장 QR 즉시 적용
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-800 leading-snug">
                            🎁 {studio.partnerBenefit.perk}
                          </p>
                        </div>
                      )}

                      {/* Dropoff Details if available */}
                      {studio.dropoffAvailable && studio.dropoffStoreName && (
                        <div className="text-[11px] text-vintage-600 bg-vintage-50 p-2 rounded-lg border border-vintage-200/80 flex items-center justify-between">
                          <span>🏪 심야 무인 수거함:</span>
                          <strong className="text-vintage-900 font-medium">{studio.dropoffStoreName}</strong>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-vintage-200/70 flex items-center gap-2">
                      {studio.isPartner ? (
                        <button
                          onClick={() => handleIssueQrVoucher(studio)}
                          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>현장 할인 QR 발급 (20% OFF)</span>
                        </button>
                      ) : (
                        <div className="flex-1 py-1.5 text-[11px] text-vintage-500 font-mono">
                          일반 공공등록 점포
                        </div>
                      )}

                      <button
                        onClick={() => handleOpenKakaoMap(studio)}
                        className="py-2 px-3 rounded-xl bg-white hover:bg-vintage-100 text-vintage-700 border border-vintage-300 font-semibold text-xs flex items-center gap-1 transition shadow-2xs"
                        title="카카오맵에서 위치 및 길찾기"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-vintage-500" />
                        <span className="hidden sm:inline">길찾기</span>
                      </button>

                      <button
                        onClick={() => {
                          const shared = shareViaKakaoTalk({
                            title: `[DASI 공식 제휴 현상소] ${studio.name}`,
                            description: `${studio.address} · ${studio.specialties.join(', ')}`,
                            buttonTitle: '현상소 20% 할인권 보기',
                          });
                          if (shared) {
                            showToast('카카오톡 공유창이 열렸습니다!', 'success');
                          } else {
                            showToast('링크가 클립보드에 복사되었습니다.', 'info');
                          }
                        }}
                        className="py-2 px-2.5 rounded-xl bg-[#FEE500] hover:bg-[#F0D700] text-[#3B1E08] font-bold text-xs flex items-center gap-1 transition shadow-2xs shrink-0"
                        title="카카오톡으로 현상소 정보 공유하기"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">공유</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* DASI 공식 제휴 현장 할인 QR 바우처 모달 */}
      {selectedStudioForQr && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white rounded-3xl border-2 border-amber-400 shadow-2xl p-6 text-center space-y-4">
            <button
              onClick={() => setSelectedStudioForQr(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>DASI 공식 현장 제휴 바우처</span>
            </div>

            <div>
              <h4 className="text-lg font-serif font-bold text-stone-900">
                {selectedStudioForQr.name}
              </h4>
              <p className="text-xs text-amber-600 font-bold mt-0.5">
                {selectedStudioForQr.partnerBenefit?.discountText}
              </p>
            </div>

            {/* Simulated Live Canvas 2D QR Pattern */}
            <div className="mx-auto w-52 h-52 bg-white rounded-2xl border-4 border-stone-800 p-3 shadow-inner flex flex-col items-center justify-center relative">
              {/* Dynamic QR Code Mock Matrix */}
              <div className="grid grid-cols-6 gap-1.5 w-full h-full p-2 bg-stone-100 rounded-xl">
                {Array.from({ length: 36 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xs ${
                      idx % 2 === 0 || idx % 5 === 0 || idx < 6 || idx > 29 ? 'bg-stone-900' : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>

              {/* Central Logo */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 rounded-lg bg-terracotta text-white font-serif font-bold text-xs flex items-center justify-center shadow-lg border-2 border-white">
                  다시
                </div>
              </div>
            </div>

            {/* Timer & Voucher Code */}
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-rose-600 font-bold">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>유효 시간: {formatTimer(qrRemainingSeconds)}</span>
              </div>
              <p className="text-[11px] font-mono text-stone-400">
                인증 코드: {selectedStudioForQr.partnerBenefit?.couponCode}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 text-left leading-relaxed">
              💡 <strong>사용 방법:</strong> 현상소 접수대 카운터에 위 화면을 제시하시면 즉시 할인이 적용되며, 스캔 완료 알림이 DASI 알림함으로 연동됩니다.
            </div>

            <button
              onClick={() => {
                showToast('할인 바우처 코드가 복사되었습니다.', 'success');
              }}
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>바우처 코드 복사</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
