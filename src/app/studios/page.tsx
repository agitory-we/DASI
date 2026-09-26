'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Store,
  MapPin,
  Clock,
  Sparkles,
  Phone,
  QrCode,
  Share2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Film,
  Camera,
  Compass,
  ChevronRight,
} from 'lucide-react';
import { useDasi } from '@/context/DasiContext';
import { QrCouponModal } from '@/components/cabinet/QrCouponModal';
import { shareViaKakaoTalk } from '@/utils/kakaoShare';

interface PartnerLabItem {
  id: string;
  name: string;
  category: 'heritage' | 'lab' | 'dropoff';
  years: number;
  openYear: number;
  district: string;
  address: string;
  phone: string;
  specialties: string[];
  discountText: string;
  leadTime: string;
  dropoffAvailable: boolean;
  dropoffBoxName?: string;
  badge: string;
}

const PARTNER_LABS: PartnerLabItem[] = [
  {
    id: 'lab-1',
    name: '충무로 일진사 (사진현상 연구소)',
    category: 'heritage',
    years: 48,
    openYear: 1978,
    district: '충무로',
    address: '서울특별시 중구 수표로 18 (충무로3가)',
    phone: '02-2274-1294',
    specialties: ['35mm/120 슬라이드 현상', '흑백 수작업 밀착인화', '대형 규격 필름'],
    discountText: '전 품목 현상/스캔 20% 즉시 할인',
    leadTime: '당일 3시간 완성 (노리츠 3000dpi)',
    dropoffAvailable: true,
    dropoffBoxName: 'GS25 충무로역점 (24시 드롭오프)',
    badge: '48년 전통 노포',
  },
  {
    id: 'lab-2',
    name: '우성상사 (을지로 카메라 & 필름)',
    category: 'heritage',
    years: 38,
    openYear: 1988,
    district: '을지로',
    address: '서울특별시 중구 수표로 29-1 (을지로3가)',
    phone: '02-2277-6402',
    specialties: ['희귀 단종 필름 취급', '빈티지 RF 카메라 정비', 'C-41 컬러 네거티브'],
    discountText: '코닥/후지 필름 구매 시 롤당 2,000원 즉시 할인',
    leadTime: '현장 수령 5분 즉시 교부',
    dropoffAvailable: true,
    dropoffBoxName: 'CU 을지로3가역점 (24시 드롭오프)',
    badge: '38년 전통 노포',
  },
  {
    id: 'lab-3',
    name: '충무로 포토마루 (전문 컬러/흑백 랩)',
    category: 'lab',
    years: 22,
    openYear: 2004,
    district: '충무로',
    address: '서울특별시 중구 퇴계로 197 (충무로역 인근)',
    phone: '02-2269-0222',
    specialties: ['중형 120 / 대형 4x5 컬러네거티브 현상', '파인아트 드럼 스캔'],
    discountText: 'DASI 회원 전용 현상/스캔 패키지 15% 상시 할인',
    leadTime: '스캔 웹하드 12시간 내 업로드',
    dropoffAvailable: true,
    dropoffBoxName: '세븐일레븐 충무로2가점',
    badge: '전문 현상소',
  },
  {
    id: 'lab-4',
    name: '종로 고래사진관 (셀프 스캔 랩)',
    category: 'lab',
    years: 8,
    openYear: 2018,
    district: '종로/을지로',
    address: '서울특별시 중구 마른내로 2 (을지로3가역 11번 출구)',
    phone: '02-2266-6456',
    specialties: ['직접 스캔하는 셀프 스캔 부스', '당일 2시간 초고속 현상', '시네스틸 현상'],
    discountText: '노리츠/후지 셀프 스캐너 이용료 20% 즉시 할인',
    leadTime: '당일 2시간 초고속 현상',
    dropoffAvailable: false,
    badge: '셀프 스캔 랩',
  },
  {
    id: 'lab-5',
    name: '을지로 망우삼림 (현상/스캔 감성 랩)',
    category: 'lab',
    years: 7,
    openYear: 2019,
    district: '을지로',
    address: '서울특별시 중구 을지로 108 3층 (을지로3가역)',
    phone: '02-2269-9599',
    specialties: ['후지 스패너 3000dpi 스캔', '빈티지 홍콩 암실 인테리어', '디지털 인화'],
    discountText: '현상+스캔 1롤 전액 무료 쿠폰 제휴처',
    leadTime: '당일 4시간 완성 및 웹 링크 발송',
    dropoffAvailable: true,
    dropoffBoxName: 'CU 을지로3가점 (24시)',
    badge: '인기 핫스팟',
  },
];

export default function StudiosPage() {
  const { showToast } = useDasi();
  const [activeCategory, setActiveCategory] = useState<'all' | 'heritage' | 'lab' | 'dropoff'>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedStudioForQr, setSelectedStudioForQr] = useState<PartnerLabItem | null>(null);

  const filteredLabs = PARTNER_LABS.filter((lab) => {
    if (activeCategory === 'heritage' && lab.category !== 'heritage') return false;
    if (activeCategory === 'lab' && lab.category !== 'lab') return false;
    if (activeCategory === 'dropoff' && !lab.dropoffAvailable) return false;
    if (selectedDistrict !== 'all' && !lab.district.includes(selectedDistrict)) return false;
    return true;
  });

  const handleOpenKakaoMap = (lab: PartnerLabItem) => {
    const query = encodeURIComponent(`${lab.name} ${lab.address}`);
    window.open(`https://map.kakao.com/link/search/${query}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200">
          <Store className="w-3.5 h-3.5" />
          <span>공공데이터 + 골목상권 소상공인 융합 헤리티지</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-vintage-900 tracking-tight">
          서울시 사진관 &amp; 공식 제휴 현상소 디렉터리
        </h1>
        <p className="text-sm sm:text-base text-vintage-700 max-w-3xl leading-relaxed">
          40년 넘게 서울 충무로와 을지로의 아날로그 감성을 지켜온 장인 노포 현상소부터, 
          직접 색감을 만지는 셀프 스캔 랩과 <strong>24시간 무인 편의점 드롭오프 수거함</strong>까지 한눈에 탐색하세요.
          DASI 회원 전용 현장 20% 즉시 할인 바우처를 무료로 발급받으실 수 있습니다.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-vintage-200 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: '전체 보기' },
            { id: 'heritage', label: '🏛️ 노포 헤리티지 (30~50년)' },
            { id: 'lab', label: '🧪 전문 현상소 & 셀프 랩' },
            { id: 'dropoff', label: '🏪 24시 편의점 드롭오프 연계' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeCategory === tab.id
                  ? 'bg-vintage-900 text-white shadow-xs'
                  : 'bg-white text-vintage-700 border border-vintage-200 hover:bg-vintage-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-vintage-500 shrink-0">상권 필터:</span>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-vintage-300 bg-white text-vintage-800 focus:outline-none focus:border-terracotta"
          >
            <option value="all">서울 전역</option>
            <option value="을지로">을지로 상권</option>
            <option value="충무로">충무로 인쇄·카메라 상권</option>
            <option value="종로">종로 상권</option>
          </select>
        </div>
      </div>

      {/* Studio Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredLabs.map((lab) => (
          <div
            key={lab.id}
            className="p-6 rounded-3xl bg-white border border-vintage-200 hover:border-amber-400 hover:shadow-xl transition-all flex flex-col justify-between space-y-5 relative group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-900 text-white text-[10px] font-mono font-bold">
                    {lab.badge}
                  </span>
                  <span className="text-[11px] text-vintage-500 font-medium">
                    {lab.openYear}년 개업 ({lab.years}년 전통)
                  </span>
                </div>
                <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{lab.district}</span>
                </span>
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-vintage-900 group-hover:text-terracotta transition-colors">
                  {lab.name}
                </h3>
                <p className="text-xs text-vintage-500 mt-1 flex items-center gap-1">
                  <span>{lab.address}</span>
                  <span>·</span>
                  <span className="font-mono text-vintage-700">{lab.phone}</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {lab.specialties.map((spec, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-vintage-100 text-vintage-700 text-[10px] font-medium"
                  >
                    #{spec}
                  </span>
                ))}
              </div>

              {/* Benefit Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>{lab.discountText}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-extrabold">
                    DASI 단독 제휴
                  </span>
                </div>
                <div className="text-[11px] text-amber-800 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>소요 시간: {lab.leadTime}</span>
                </div>
              </div>

              {lab.dropoffAvailable && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    24h
                  </div>
                  <div>
                    <span className="font-bold">{lab.dropoffBoxName}</span>
                    <span className="text-[11px] text-emerald-600 block">야간·새벽 무인 필름 수거함 무료 연동</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-vintage-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedStudioForQr(lab);
                  showToast(`🎫 [${lab.name}] 현장 할인 QR 바우처가 발급되었습니다!`, 'success');
                }}
                className="flex-1 py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>현장 20% 할인 QR 발급</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenKakaoMap(lab)}
                className="p-2.5 rounded-xl bg-vintage-100 hover:bg-vintage-200 text-vintage-800 transition-colors"
                title="카카오맵 길찾기"
              >
                <ExternalLink className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  shareViaKakaoTalk({
                    title: `${lab.name} - DASI 서울 제휴 현상소`,
                    description: `${lab.discountText} · 소요시간: ${lab.leadTime}`,
                    imageUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800',
                    buttonTitle: '현상소 정보 & 쿠폰 받기',
                  })
                }
                className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-950 transition-colors font-bold"
                title="카카오톡 공유"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 52-Week Hobby Flow Bridge Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-vintage-900 to-[#2D241E] text-white space-y-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>현상 접수 완료 후 DASI 아날로그 라이프 루틴</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold">
              스캔본을 기다리는 동안 다음 롤과 출사를 준비해 보세요
            </h3>
          </div>
          <Link
            href="/explore"
            className="px-4 py-2 rounded-xl bg-terracotta hover:bg-terracotta-light text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <span>52주 출사지 보기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <Link
            href="/films"
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all space-y-1 group"
          >
            <div className="text-amber-400 font-bold flex items-center gap-1.5">
              <Film className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>1. 다음 롤 필름 퀵 주문</span>
            </div>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              현상소 방문 길에 다음 출사를 위한 신선 필름을 특가로 바로 보급하세요.
            </p>
          </Link>

          <Link
            href="/explore"
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all space-y-1 group"
          >
            <div className="text-amber-400 font-bold flex items-center gap-1.5">
              <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform" />
              <span>2. 다음 52주 출사지</span>
            </div>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              현상소 근처 을지로 인쇄골목부터 세운상가 옥상까지 이어지는 추천 산책로를 걸어보세요.
            </p>
          </Link>

          <Link
            href="/clinic"
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all space-y-1 group"
          >
            <div className="text-amber-400 font-bold flex items-center gap-1.5">
              <Camera className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>3. 충무로 40년 명장 점검</span>
            </div>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              현상 결과물에 빛샘이나 셔터 랙이 보인다면 충무로 명장 수리실에서 무료 진단을 받으세요.
            </p>
          </Link>

          <Link
            href="/cabinet?tab=repairs"
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all space-y-1 group"
          >
            <div className="text-amber-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>4. 마이 캐비닛 스캔 보관함</span>
            </div>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              웹하드에서 받은 고화질 스캔본을 내 디지털 보관함에 아카이빙하고 인증 포인트를 받으세요.
            </p>
          </Link>
        </div>
      </div>

      {/* QR Voucher Modal */}
      {selectedStudioForQr && (
        <QrCouponModal
          isOpen={!!selectedStudioForQr}
          onClose={() => setSelectedStudioForQr(null)}
          shopName={selectedStudioForQr.name}
          discountText={selectedStudioForQr.discountText}
          categoryName={
            selectedStudioForQr.category === 'heritage'
              ? '40년+ 노포 헤리티지 현상소'
              : '공식 제휴 셀프/전문 랩'
          }
          leadTime={selectedStudioForQr.leadTime}
        />
      )}
    </div>
  );
}
