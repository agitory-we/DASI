'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Star,
  Camera,
  Calendar,
  Award,
  ChevronRight,
  X,
  CheckCircle2,
  QrCode,
  Phone
} from 'lucide-react';
import { playShutterSound } from '@/utils/shutterAudio';
import { useDasi } from '@/context/DasiContext';

export default function ProStudioPage() {
  const { bookProConsultation, showToast } = useDasi();
  const [selectedProArtist, setSelectedProArtist] = useState<any | null>(null);
  const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null);
  const [isConsultSubmitted, setIsConsultSubmitted] = useState<boolean>(false);
  const [dateInput, setDateInput] = useState<string>('2026-10-17');
  const [locationInput, setLocationInput] = useState<string>('서울 신라호텔 영빈관');
  const [phoneInput, setPhoneInput] = useState<string>('010-8291-7721');
  const [generatedVipCode, setGeneratedVipCode] = useState<string>('');

  const proArtists = [
    {
      id: 'pro-1',
      studioName: 'ATELIER DE NOIR (아틀리에 드 누아)',
      artistName: '최서우 수석 실장',
      category: '본식 하이엔드 웨딩 & 리허설 스냅',
      gear: 'Leica M11 + Summilux 35mm F1.4 ASPH',
      experience: '보그·엘르 룩북 포토그래퍼 경력 12년',
      pricing: '본식 2인 촬영 1,800,000원부터',
      portfolio: [
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80',
      ],
      philosophy: '가장 찬란한 사랑의 순간을 100년 후에도 바래지 않는 라이카의 빛과 흑백의 계조로 기록합니다.',
    },
    {
      id: 'pro-2',
      studioName: 'LUMEN ARCHIVE (루멘 아카이브)',
      artistName: '박준혁 작가',
      category: '브랜드 룩북 & 건축/공간 다큐멘터리',
      gear: 'Hasselblad 907X 50C (중형 디지털) & Contax 645',
      experience: '해외 국제 건축사진 비엔나 비엔날레 초청 작가',
      pricing: '하프 데이(4시간) 1,200,000원부터',
      portfolio: [
        'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
      ],
      philosophy: '인공적인 조명을 배제하고, 오직 공간이 머금은 자연광과 필름의 질감만으로 브랜드의 정체성을 완성합니다.',
    },
  ];

  return (
    <div className="bg-[#12100E] text-[#F3EFEA] min-h-screen py-16 -mt-px space-y-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Gateway Badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-vintage-800 pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>DASI PRO ARTISTS &amp; STUDIOS</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              하이엔드 전문 작가의 단독 브랜드관
            </h1>
            <p className="text-xs sm:text-sm text-vintage-400 max-w-2xl leading-relaxed">
              DASI 메인의 캐주얼한 로컬 긱을 넘어, 본식 웨딩과 하이엔드 룩북을 책임지는 
              준프로·프로 사진작가의 독점 포트폴리오 샵입니다.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-vintage-700 bg-vintage-900/80 hover:bg-vintage-800 text-xs font-semibold text-vintage-200 transition-colors shrink-0"
          >
            <span>← DASI 메인 마켓으로 돌아가기</span>
          </Link>
        </div>

        {/* Studios Grid */}
        <div className="space-y-12">
          {proArtists.map((artist) => (
            <div
              key={artist.id}
              className="rounded-3xl border border-vintage-800 bg-vintage-900/60 p-8 sm:p-12 space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono text-amber-400 tracking-wider uppercase">
                    {artist.category}
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                    {artist.studioName}
                  </h2>
                  <div className="text-xs text-vintage-400 mt-1">
                    {artist.artistName} · {artist.experience}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-vintage-400">촬영 패키지 견적</span>
                  <div className="text-xl font-serif font-bold text-amber-300">
                    {artist.pricing}
                  </div>
                </div>
              </div>

              {/* Portfolio Duo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {artist.portfolio.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveLightboxImg(img)}
                    className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-vintage-950 border border-vintage-800 cursor-pointer group/img"
                  >
                    <img
                      src={img}
                      alt={artist.studioName}
                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
                        원본 확대 보기 🔍
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Philosophy Quote */}
              <div className="p-6 rounded-2xl bg-vintage-950/80 border border-vintage-800/80 space-y-2">
                <div className="text-[11px] font-mono text-amber-400">ARTIST STATEMENT</div>
                <p className="font-serif italic text-sm sm:text-base text-vintage-200 leading-relaxed">
                  &ldquo;{artist.philosophy}&rdquo;
                </p>
                <div className="text-xs text-vintage-400 pt-2 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-vintage-500" />
                  <span>주력 마스터 기기: <strong>{artist.gear}</strong></span>
                </div>
              </div>

              {/* Booking Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-xs text-vintage-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>DASI Pro 공식 에스크로 계약 보증 (일정 변경 및 계약금 보호)</span>
                </div>

                <button
                  onClick={() => {
                    setSelectedProArtist(artist);
                    setIsConsultSubmitted(false);
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-vintage-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <span>1:1 상담 및 본식 일정 예약 문의</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {activeLightboxImg && (
        <div
          onClick={() => setActiveLightboxImg(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer animate-fadeIn"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            <img
              src={activeLightboxImg}
              alt="Pro Portfolio"
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setActiveLightboxImg(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* VIP CONSULTATION MODAL */}
      {selectedProArtist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn text-vintage-900">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-vintage-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-vintage-100">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                  DASI Pro 프라이빗 상담실
                </span>
                <h3 className="font-serif text-xl font-bold text-vintage-900 mt-1">
                  {selectedProArtist.studioName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProArtist(null)}
                className="p-1.5 text-vintage-400 hover:text-vintage-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isConsultSubmitted ? (
              <div className="text-center py-6 space-y-5 animate-fade-in">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                
                <div className="space-y-1">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    VIP 일정 조율 접수 완료
                  </span>
                  <h4 className="font-serif text-2xl font-bold text-vintage-900">
                    상담 예약 접수 완료
                  </h4>
                  <p className="text-xs text-vintage-600 leading-relaxed max-w-sm mx-auto">
                    <strong>{selectedProArtist.artistName}</strong> 수석 실장 매니저가 24시간 내 유선 상담 및 본식 캘린더 일정을 확인해 드립니다.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-vintage-50 border border-vintage-200 text-xs text-left max-w-sm mx-auto space-y-2">
                  <div className="flex justify-between font-bold text-vintage-900">
                    <span>VIP 상담 일련번호</span>
                    <span className="text-terracotta font-mono">{generatedVipCode || 'PRO-VIP-881920'}</span>
                  </div>
                  <div className="text-[11px] text-vintage-600">
                    촬영 희망일: <strong>{dateInput}</strong> ({locationInput})
                  </div>
                  <div className="text-[11px] text-vintage-500">
                    스튜디오 라운지: 서울 강남구 도산대로 본원 라운지
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedProArtist(null)}
                    className="flex-1 py-3 rounded-xl border border-vintage-300 text-vintage-700 font-semibold text-xs hover:bg-vintage-50 transition-colors"
                  >
                    닫기
                  </button>
                  <Link
                    href="/cabinet"
                    className="flex-1 py-3 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-semibold text-center transition-colors shadow-xs"
                  >
                    내 캐비닛에서 확인
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-vintage-50 border border-vintage-100 space-y-1">
                  <div>👤 <strong>수석 작가:</strong> {selectedProArtist.artistName}</div>
                  <div>📷 <strong>촬영 분야:</strong> {selectedProArtist.category}</div>
                  <div>💰 <strong>기준 견적:</strong> {selectedProArtist.pricing}</div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-vintage-800">예식 또는 촬영 희망 일자</label>
                  <input
                    type="date"
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-vintage-300 focus:outline-none focus:border-terracotta text-vintage-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-vintage-800">촬영 장소 / 베뉴 (예: 신라호텔 영빈관, 성수 브랜드 팝업 등)</label>
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="예식장 또는 촬영 로케이션"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-vintage-300 focus:outline-none focus:border-terracotta text-vintage-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-vintage-800">연락처 (매니저 1:1 유선 상담용)</label>
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="010-0000-0000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-vintage-300 focus:outline-none focus:border-terracotta text-vintage-900"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => setSelectedProArtist(null)}
                    className="flex-1 py-2.5 rounded-xl border border-vintage-300 text-vintage-700 font-semibold"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      playShutterSound('slr');
                      const code = bookProConsultation({
                        studioName: selectedProArtist.studioName,
                        artistName: selectedProArtist.artistName,
                        category: selectedProArtist.category,
                        pricing: selectedProArtist.pricing,
                        targetDate: dateInput || '2026-10-17',
                        location: locationInput || '서울 신라호텔 영빈관',
                        contact: phoneInput || '010-8291-7721',
                      });
                      setGeneratedVipCode(code);
                      setIsConsultSubmitted(true);
                      showToast(`${selectedProArtist.studioName} VIP 상담이 접수되었습니다. 마이 캐비닛에서 일정을 확인하세요.`, 'success');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-vintage-950 font-bold transition-colors shadow-xs"
                  >
                    VIP 프라이빗 상담 신청
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
