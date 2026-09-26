'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  ArrowRight,
  QrCode,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useDasi } from '@/context/DasiContext';
import { playShutterSound } from '@/utils/shutterAudio';
import { Experience } from '@/types';

export default function ExperiencesPage() {
  const { experiences, cameras, isLoadingData, bookExperience, showToast } = useDasi();
  const [selectedType, setSelectedType] = useState<'all' | 'photo_walk' | 'master_class'>('all');
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);
  const [isBooked, setIsBooked] = useState(false);
  const [withRentalPackage, setWithRentalPackage] = useState(false);
  const [bundledCamera, setBundledCamera] = useState<string>('Olympus PEN EE-3 (하프 필름)');
  const [issuedTicketCode, setIssuedTicketCode] = useState('');

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

      {/* Grid or Skeleton */}
      {isLoadingData ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="rounded-3xl bg-white border border-vintage-200 p-6 space-y-4 animate-pulse">
              <div className="aspect-[16/10] bg-vintage-100 rounded-2xl" />
              <div className="h-5 bg-vintage-200 rounded w-2/3" />
              <div className="h-4 bg-vintage-100 rounded w-full" />
              <div className="h-10 bg-vintage-100 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : (
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
      )}

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
              <div className="text-center py-6 space-y-5 animate-fade-in">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                
                <div className="space-y-1">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    모바일 입장 티켓 발급 완료
                  </span>
                  <h4 className="font-serif text-2xl font-bold text-vintage-900">
                    {selectedExp.type === 'photo_walk' ? '출사 클럽' : '명장 클래스'} 예매 완료
                  </h4>
                  <p className="text-xs text-vintage-600 leading-relaxed max-w-sm mx-auto">
                    예약이 확정되었습니다. 당일 집결 장소(<strong>{selectedExp.location}</strong>)에서 명단 확인 후 입장합니다.
                  </p>
                </div>

                {/* Digital Mobile Ticket Card */}
                <div className="p-5 rounded-3xl bg-vintage-50 border border-vintage-200 text-left max-w-sm mx-auto space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-vintage-200/60 pb-2.5">
                    <span className="text-xs font-bold text-vintage-900 flex items-center gap-1.5">
                      <Ticket className="w-4 h-4 text-terracotta" />
                      DASI 디지털 입장권
                    </span>
                    <span className="text-[10px] font-mono text-terracotta bg-terracotta/10 px-2 py-0.5 rounded-full font-bold">
                      {issuedTicketCode || 'TKT-EXP-9921'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-vintage-700">
                    <div className="flex justify-between">
                      <span className="text-vintage-500">프로그램</span>
                      <span className="font-bold text-vintage-900 truncate max-w-[180px]">{selectedExp.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-vintage-500">진행 호스트</span>
                      <span className="font-semibold text-vintage-800">{selectedExp.hostName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-vintage-500">일시</span>
                      <span className="font-semibold text-vintage-800">{selectedExp.dateTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-vintage-500">결제 금액</span>
                      <span className="font-bold text-terracotta">
                        {(withRentalPackage ? selectedExp.price - 10000 : selectedExp.price).toLocaleString()}원
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-900">
                    💡 <strong>현장 혜택:</strong> 필름 1롤 무료 제공 및 현상소 스캔 쿠폰이 당일 현장에서 지급됩니다.
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto pt-2">
                  <Link
                    href="/cabinet?tab=tickets"
                    onClick={() => setSelectedExp(null)}
                    className="flex-1 py-3 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-xs"
                  >
                    <span>내 캐비닛에서 티켓 확인</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => setSelectedExp(null)}
                    className="px-5 py-3 rounded-xl border border-vintage-300 text-vintage-700 hover:bg-vintage-100 text-xs font-semibold"
                  >
                    닫기
                  </button>
                </div>
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

                {/* Rental Bundle Discount Toggle & Camera Select */}
                <div className="space-y-2">
                  <div
                    onClick={() => setWithRentalPackage(!withRentalPackage)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      withRentalPackage
                        ? 'border-terracotta bg-terracotta/5'
                        : 'border-vintage-200 hover:bg-vintage-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={withRentalPackage}
                        onChange={() => {}}
                        className="text-terracotta rounded"
                      />
                      <div>
                        <div className="font-bold text-vintage-900">DASI 카메라 주말 렌탈 결합 할인</div>
                        <div className="text-[10px] text-vintage-500">카메라 대여 고객 티켓 10,000원 즉시 할인 + 현장 수령</div>
                      </div>
                    </div>
                    <span className="font-bold text-terracotta">-10,000원</span>
                  </div>

                  {withRentalPackage && (
                    <div className="p-3 bg-vintage-50 border border-vintage-200 rounded-2xl space-y-1.5 animate-fadeIn">
                      <label className="text-[11px] font-bold text-vintage-700">현장 대여 희망 카메라 기종 선택</label>
                      <select
                        value={bundledCamera}
                        onChange={(e) => setBundledCamera(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-vintage-300 text-xs bg-white text-vintage-900 font-medium focus:outline-hidden focus:border-terracotta"
                      >
                        {cameras.map((cam) => (
                          <option key={cam.id} value={`${cam.name} (${cam.brand})`}>
                            {cam.name} ({cam.brand}) · {cam.conditionGrade} 등급
                          </option>
                        ))}
                      </select>
                      <div className="text-[10px] text-vintage-500">
                        * 선택하신 기종과 필름 1롤이 집결 장소에서 호스트를 통해 즉시 전달됩니다.
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-vintage-100">
                  <div>
                    <span className="text-vintage-400">최종 예매 결제 금액</span>
                    <div className="text-lg font-bold text-terracotta">
                      {(withRentalPackage ? selectedExp.price - 10000 : selectedExp.price).toLocaleString()}원
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
                      onClick={() => {
                        playShutterSound('slr');
                        const code = bookExperience({
                          experienceId: selectedExp.id,
                          title: selectedExp.title,
                          hostName: selectedExp.hostName,
                          location: selectedExp.location,
                          dateTime: selectedExp.dateTime,
                          price: withRentalPackage ? selectedExp.price - 10000 : selectedExp.price,
                          hasRentalPackage: withRentalPackage,
                        });
                        setIssuedTicketCode(code);
                        showToast(`「${selectedExp.title}」 티켓 예매가 완료되었습니다! (발급번호: ${code})`, 'success');
                        setIsBooked(true);
                      }}
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
