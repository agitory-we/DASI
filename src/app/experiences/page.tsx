'use client';

import React, { useState } from 'react';
import {
  Compass,
  Calendar,
  Clock,
  MapPin,
  Users,
  Sparkles,
  Camera,
  CheckCircle2,
  Ticket,
  X,
  ArrowRight
} from 'lucide-react';

interface Experience {
  id: string;
  type: 'photo_walk' | 'master_class';
  title: string;
  hostName: string;
  hostRole: string;
  hostAvatar: string;
  location: string;
  dateTime: string;
  duration: string;
  price: number;
  rentalPackageDiscount: string;
  capacity: string;
  description: string;
  imageUrl: string;
  included: string[];
}

export default function ExperiencesPage() {
  const [selectedType, setSelectedType] = useState<'all' | 'photo_walk' | 'master_class'>('all');
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);
  const [isBooked, setIsBooked] = useState(false);

  const experiences: Experience[] = [
    {
      id: 'exp-1',
      type: 'photo_walk',
      title: '을지로 골목길 매직아워 출사 & 흑백 필름 감성 워크',
      hostName: '김민우 사진작가',
      hostRole: '인스타그램 12만 빈티지 스트리트 포토그래퍼',
      hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      location: '을지로3가역 세운상가 3층 보행로 집결',
      dateTime: '2026.09.26 (토) 16:30 - 19:00',
      duration: '2시간 30분',
      price: 45000,
      rentalPackageDiscount: 'DASI 카메라 렌탈 고객 10,000원 즉시 할인',
      capacity: '정원 8명 (잔여 2석)',
      description: '빛과 그림자가 드라마틱하게 변하는 골목길에서 레인지파인더 수동 초점 맞추는 법과 흑백 필름의 구도를 1:1로 코칭해 드립니다.',
      imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=800&auto=format&fit=crop&q=80',
      included: ['코닥 Tri-X 400 흑백 필름 1롤 무료 제공', '을지로 망우삼림 당일 스캔권 포함', '현장 1:1 사진 구도 피드백'],
    },
    {
      id: 'exp-2',
      type: 'master_class',
      title: '정인수 명장에게 배우는 필름카메라 렌즈 분해 & 자가 클리닝 클래스',
      hostName: '정인수 명장',
      hostRole: '을지로 신성카메라 (수리 경력 42년)',
      hostAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      location: '을지로 대림상가 3층 신성카메라 수리 공방',
      dateTime: '2026.09.27 (일) 14:00 - 16:30',
      duration: '2시간 30분',
      price: 60000,
      rentalPackageDiscount: 'DASI 케어 회원 15,000원 제휴 쿠폰 사용 가능',
      capacity: '정원 5명 (선착순 밀착 지도)',
      description: '단순한 사용자를 넘어 카메라를 이해하는 진정한 애호가로! 렌즈 내부 곰팡이 세척과 차광 스펀지(모ルト) 교체를 명장 공구로 직접 실습합니다.',
      imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
      included: ['독일제 렌즈 클리닝 키트 증정', '내 카메라 무료 정밀 점검 1대', '명장의 수리 노하우 가이드북'],
    },
    {
      id: 'exp-3',
      type: 'photo_walk',
      title: '성수동 붉은벽돌 골목 & 서울숲 빛을 찾는 컬러 필름 출사',
      hostName: '이하은 작가',
      hostRole: '필름 룩북 & 매거진 전문 포토그래퍼',
      hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      location: '성수역 3번 출구 카페 어니언 앞 집결',
      dateTime: '2026.10.03 (토) 15:00 - 17:30',
      duration: '2시간 30분',
      price: 45000,
      rentalPackageDiscount: 'DASI 카메라 렌탈 고객 10,000원 즉시 할인',
      capacity: '정원 10명 (잔여 4석)',
      description: '후지필름과 코닥 컬러필름의 색감 차이를 직접 체감하고, 성수동의 힙한 텍스처와 인물을 감각적으로 프레이밍하는 노하우를 나눕니다.',
      imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80',
      included: ['후지 컬러필름 1롤 제공', '성수 필름로그 고화질 스캔권', '감성 인생 프로필 작가 직접 3장 촬영 선물'],
    },
  ];

  const filtered = selectedType === 'all'
    ? experiences
    : experiences.filter((e) => e.type === selectedType);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold">
          <Compass className="w-3.5 h-3.5" />
          <span>DASI Experiences &amp; Masterclass</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-vintage-900">
          사진작가 출사 클럽 &amp; 장인 원데이 클래스
        </h1>
        <p className="text-xs sm:text-sm text-vintage-600 max-w-3xl leading-relaxed">
          카메라만 빌려주는 것으로 끝나지 않습니다.
          인기 사진작가와 함께하는 골목길 출사(Photo Walk)와 40년 장인에게 직접 배우는 렌즈 수리·자가 현상 클래스로 아날로그의 낭만을 온몸으로 경험하세요.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-vintage-200 pb-4">
        {[
          { id: 'all', label: '전체 프로그램' },
          { id: 'photo_walk', label: '📸 사진작가 주말 출사 클럽' },
          { id: 'master_class', label: '🔧 40년 명장 원데이 클래스' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedType(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedType === tab.id
                ? 'bg-vintage-900 text-white shadow-xs'
                : 'bg-white text-vintage-700 hover:bg-vintage-100 border border-vintage-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filtered.map((exp) => (
          <div
            key={exp.id}
            className="rounded-3xl bg-white border border-vintage-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="relative aspect-[16/10] bg-vintage-100 overflow-hidden">
                <img
                  src={exp.imageUrl}
                  alt={exp.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium">
                  {exp.type === 'photo_walk' ? '주말 출사' : '장인 클래스'}
                </span>
                <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-white/90 text-vintage-900 text-[10px] font-bold shadow-xs">
                  {exp.capacity}
                </span>
              </div>

              <div className="p-6 space-y-4">
                {/* Host */}
                <div className="flex items-center gap-2.5">
                  <img
                    src={exp.hostAvatar}
                    alt={exp.hostName}
                    className="w-9 h-9 rounded-full object-cover border"
                  />
                  <div>
                    <div className="text-xs font-bold text-vintage-900">{exp.hostName}</div>
                    <div className="text-[10px] text-vintage-500">{exp.hostRole}</div>
                  </div>
                </div>

                <h3 className="font-serif text-lg font-bold text-vintage-900 group-hover:text-terracotta transition-colors leading-snug">
                  {exp.title}
                </h3>

                <p className="text-xs text-vintage-600 line-clamp-2 leading-relaxed">
                  {exp.description}
                </p>

                {/* Info Pills */}
                <div className="space-y-1.5 text-xs text-vintage-700 p-3 rounded-2xl bg-vintage-50 border border-vintage-100">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-terracotta shrink-0" />
                    <span>{exp.dateTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0" />
                    <span className="truncate">{exp.location}</span>
                  </div>
                </div>

                <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/80">
                  🎁 {exp.rentalPackageDiscount}
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-vintage-100 flex items-center justify-between mt-2">
              <div>
                <span className="text-[10px] text-vintage-400">참가비 (필름/재료 포함)</span>
                <div className="text-base font-bold text-terracotta">
                  {exp.price.toLocaleString()}원
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedExp(exp);
                  setIsBooked(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-bold transition-colors shadow-xs"
              >
                티켓 예매하기
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* TICKET BOOKING MODAL */}
      {selectedExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-vintage-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-vintage-100">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-terracotta/10 text-terracotta">
                  {selectedExp.type === 'photo_walk' ? '출사 티켓' : '워크숍 티켓'}
                </span>
                <h3 className="font-serif text-xl font-bold text-vintage-900 mt-1">
                  {selectedExp.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedExp(null)}
                className="p-1.5 text-vintage-400 hover:text-vintage-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isBooked ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-xl font-bold text-vintage-900">
                  예매가 성공적으로 완료되었습니다!
                </h4>
                <p className="text-xs text-vintage-600 leading-relaxed max-w-sm mx-auto">
                  모바일 티켓이 발송되었습니다. 당일 집결 장소(<strong>{selectedExp.location}</strong>)로 시간 맞춰 와주세요.
                </p>
                <button
                  onClick={() => setSelectedExp(null)}
                  className="px-6 py-2.5 rounded-xl bg-terracotta text-white text-xs font-semibold"
                >
                  확인
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-vintage-50 border border-vintage-100 space-y-1.5">
                  <div>👤 <strong>진행 호스트:</strong> {selectedExp.hostName} ({selectedExp.hostRole})</div>
                  <div>📅 <strong>일시:</strong> {selectedExp.dateTime} ({selectedExp.duration})</div>
                  <div>📍 <strong>집결:</strong> {selectedExp.location}</div>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-vintage-900">포함 내역</div>
                  <ul className="space-y-1 text-vintage-700">
                    {selectedExp.included.map((inc, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-vintage-100">
                  <div>
                    <span className="text-vintage-400">참가 결제 금액</span>
                    <div className="text-base font-bold text-terracotta">
                      {selectedExp.price.toLocaleString()}원
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedExp(null)}
                      className="px-4 py-2.5 rounded-xl border border-vintage-300 text-vintage-700 font-semibold"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => setIsBooked(true)}
                      className="px-6 py-2.5 rounded-xl bg-terracotta text-white font-bold hover:bg-terracotta-light transition-colors shadow-xs"
                    >
                      예매 확정하기
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
