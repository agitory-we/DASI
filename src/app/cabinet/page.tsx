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
  AlertCircle
} from 'lucide-react';
import { mockUserCoupons } from '@/data/mockData';
import { useDasi } from '@/context/DasiContext';

export default function CabinetPage() {
  const { rentingItems, ownedItems, convertToOwn } = useDasi();
  const [selectedCertificate, setSelectedCertificate] = useState<any | null>(null);

  const activeRenting = rentingItems[0] || null;

  const handleConvertToOwn = (id: string, name: string, total: number, paid: number) => {
    const diff = total - paid;
    if (confirm(`대여료가 공제된 차액 ${diff.toLocaleString()}원만 결제하고 이 카메라를 영구 소장하시겠습니까?`)) {
      convertToOwn(id);
      alert('소장 전환이 완료되었습니다! 정품 보증서가 발행되었습니다.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>My Digital Heritage Cabinet</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-vintage-900">
          마이 캐비닛 (내 기기 &amp; 디지털 보증서)
        </h1>
        <p className="text-xs sm:text-sm text-vintage-600">
          현재 주말 대여 중인 기기의 반납 일정 확인과 소장 전환(Rent-to-Own), 그리고 내 컬렉션의 디지털 정품 보증서를 관리합니다.
        </p>
      </div>

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
            <div className="text-center py-8 text-xs text-vintage-500">
              현재 대여 중인 카메라가 없습니다. 주말 카메라를 예약해 보세요!
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
                    onClick={() => handleConvertToOwn(activeRenting.id, activeRenting.name, activeRenting.purchaseTotal, activeRenting.rentalPaid)}
                    className="px-6 py-3 rounded-xl bg-terracotta hover:bg-terracotta-light text-white text-xs sm:text-sm font-bold transition-all shadow-xs"
                  >
                    대여료 빼고 내 것으로 소장하기
                  </button>
                  <button
                    onClick={() => alert('반납 일정이 상점에 통보되었습니다. 매장에 방문해 주세요!')}
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
                  onClick={() => alert('DASI 인증 리셀(재판매) 견적을 산출 중입니다. 감가 방어율 92%!')}
                  className="px-4 py-2 rounded-xl border border-vintage-300 hover:bg-vintage-50 text-vintage-700 text-xs font-semibold"
                >
                  재판매(Resell)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

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
    </div>
  );
}
