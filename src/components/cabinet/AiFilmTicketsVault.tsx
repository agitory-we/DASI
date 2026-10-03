'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Film,
  Camera,
  Aperture,
  Clock,
  Printer,
  Download,
  Share2,
  X,
  ExternalLink,
  ChevronRight,
  Info,
  CheckCircle2,
  Sun
} from 'lucide-react';
import { playShutterSound } from '@/utils/shutterAudio';
import { useDasi } from '@/context/DasiContext';

export interface SavedFilmTicket {
  ticketId: string;
  photoUrl: string;
  filmStock: string;
  iso: number;
  estimatedShutter: string;
  estimatedAperture: string;
  estimatedCamera: string;
  estimatedLens: string;
  vibeScore: number;
  grainIndex: number;
  colorTemp: string;
  moodSummary: string;
  shootingAdvice: string;
  createdAt: string;
}

const DEFAULT_SAVED_TICKETS: SavedFilmTicket[] = [
  {
    ticketId: 'DASI-202610-8841',
    photoUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
    filmStock: 'Kodak Portra 400',
    iso: 400,
    estimatedShutter: '1/250s',
    estimatedAperture: 'f/2.8',
    estimatedCamera: 'Nikon FM2 Silver',
    estimatedLens: 'Nikkor 50mm f/1.4 AI-S',
    vibeScore: 98,
    grainIndex: 62,
    colorTemp: '5400K Warm Golden',
    moodSummary: '피부 톤과 따스한 을지로 석양빛의 그라데이션이 유려하게 녹아든 포트라 특유의 온기',
    shootingAdvice: '황혼기에는 f/2.0 개방으로 원형 보케를 살리고 셔터스피드를 1/125s로 유지하세요.',
    createdAt: '2026.10.02 17:42'
  },
  {
    ticketId: 'DASI-202610-3190',
    photoUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    filmStock: 'Cinestill 800T (Tungsten)',
    iso: 800,
    estimatedShutter: '1/60s',
    estimatedAperture: 'f/2.0',
    estimatedCamera: 'Contax RTS II',
    estimatedLens: 'Planar 50mm f/1.4 T*',
    vibeScore: 99,
    grainIndex: 84,
    colorTemp: '3200K Neon Halation',
    moodSummary: '성수 카페 골목의 네온사인 주변에 붉게 번지는 시네마틱 할레이션과 묵직한 밤의 공기',
    shootingAdvice: '도심 야경에서는 조명 광원을 프레임 코너에 배치하면 시네스틸 특유의 붉은 림라이트가 극대화됩니다.',
    createdAt: '2026.09.28 20:15'
  }
];

export const AiFilmTicketsVault: React.FC = () => {
  const { showToast } = useDasi();
  const [tickets, setTickets] = useState<SavedFilmTicket[]>(DEFAULT_SAVED_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<SavedFilmTicket | null>(null);

  const handleOpenTicket = (ticket: SavedFilmTicket) => {
    playShutterSound('compact');
    setSelectedTicket(ticket);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = (ticket: SavedFilmTicket) => {
    if (navigator.share) {
      navigator.share({
        title: `DASI 아날로그 촬영 티켓 - ${ticket.filmStock}`,
        text: `${ticket.estimatedCamera} | ${ticket.estimatedLens} 로 복원된 아날로그 메타데이터입니다.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast('🔗 티켓 링크가 클립보드에 복사되었습니다.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-vintage-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-700 font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>OPTICAL INTELLIGENCE VAULT</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-vintage-900">
            AI 아날로그 촬영 티켓 보관함
          </h2>
          <p className="text-xs text-vintage-600 mt-0.5">
            Gemini AI로 복원한 필름 스톡, 조리개, 셔터속도 영수증 카드가 영구 보관됩니다.
          </p>
        </div>

        <Link
          href="/film-logbook"
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-2xs shrink-0 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-stone-950" />
          <span>새 사진 EXIF 복원하기</span>
        </Link>
      </div>

      {/* Ticket Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tickets.map((ticket) => (
          <div
            key={ticket.ticketId}
            onClick={() => handleOpenTicket(ticket)}
            className="p-5 rounded-2xl bg-white border border-vintage-200/90 hover:border-amber-400 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {ticket.filmStock}
                </span>
                <span className="text-vintage-500 text-[11px]">{ticket.createdAt}</span>
              </div>

              <div className="flex gap-4 items-center">
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-vintage-200 bg-stone-900">
                  <img
                    src={ticket.photoUrl}
                    alt={ticket.filmStock}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="font-bold text-sm text-vintage-900 truncate">
                    {ticket.estimatedCamera}
                  </div>
                  <div className="text-xs text-vintage-600 truncate">{ticket.estimatedLens}</div>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-amber-900 pt-1">
                    <span>{ticket.estimatedShutter}</span>
                    <span>·</span>
                    <span>{ticket.estimatedAperture}</span>
                    <span>·</span>
                    <span>ISO {ticket.iso}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-vintage-600 line-clamp-2 leading-relaxed bg-vintage-50/60 p-2.5 rounded-xl border border-vintage-100">
                &ldquo;{ticket.moodSummary}&rdquo;
              </p>
            </div>

            <div className="pt-4 border-t border-vintage-100 flex items-center justify-between text-xs font-mono text-amber-700 font-bold">
              <span>티켓 번호: {ticket.ticketId}</span>
              <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                티켓 열기 <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Full Ticket Receipt Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-xl w-full">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute -top-12 right-0 p-2 text-stone-300 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Vintage Receipt UI */}
            <div className="bg-[#faf6ed] text-stone-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-900/20 font-mono relative overflow-hidden">
              <div className="border-b-2 border-stone-300 pb-4 mb-5 flex justify-between items-start">
                <div>
                  <div className="text-[10px] tracking-wider text-amber-800 font-bold uppercase">
                    Chungmuro Heritage Optical Lab
                  </div>
                  <div className="text-xl font-serif font-black tracking-tight text-stone-950">
                    DASI ANALOG LOGBOOK
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-stone-500">TICKET NO.</div>
                  <div className="text-xs font-bold text-stone-800">{selectedTicket.ticketId}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 bg-stone-100/90 p-3.5 rounded-xl border border-stone-300 text-xs">
                <div>
                  <div className="text-[9px] text-stone-500">FILM</div>
                  <div className="font-bold text-stone-900 truncate">{selectedTicket.filmStock}</div>
                  <div className="text-[9px] text-amber-800">ISO {selectedTicket.iso}</div>
                </div>
                <div>
                  <div className="text-[9px] text-stone-500">SHUTTER</div>
                  <div className="font-bold text-stone-900">{selectedTicket.estimatedShutter}</div>
                </div>
                <div>
                  <div className="text-[9px] text-stone-500">APERTURE</div>
                  <div className="font-bold text-stone-900">{selectedTicket.estimatedAperture}</div>
                </div>
                <div>
                  <div className="text-[9px] text-stone-500">CAMERA</div>
                  <div className="font-bold text-stone-900 truncate">{selectedTicket.estimatedCamera}</div>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="text-[10px] font-bold text-amber-900 mb-1 flex items-center gap-1">
                    <Sun className="w-3 h-3" />
                    분위기 & 색채 (Atmosphere)
                  </div>
                  <p className="text-xs text-stone-700 font-sans leading-relaxed">
                    {selectedTicket.moodSummary}
                  </p>
                </div>
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <div className="text-[10px] font-bold text-stone-900 mb-1 flex items-center gap-1">
                    <Info className="w-3 h-3 text-stone-600" />
                    충무로 명장의 슈팅 팁
                  </div>
                  <p className="text-xs text-stone-600 font-sans leading-relaxed">
                    {selectedTicket.shootingAdvice}
                  </p>
                </div>
              </div>

              {/* Barcode Footer */}
              <div className="border-t-2 border-stone-300 pt-4 flex items-center justify-between">
                <div className="text-[9px] text-stone-500 font-sans">
                  발행일시: {selectedTicket.createdAt} · DASI LAB VERIFIED
                </div>
                <div className="flex items-center gap-0.5 h-6">
                  {[3,1,4,2,5,1,3,2,6,3,2,4,1,5,2].map((w, i) => (
                    <div key={i} className="bg-stone-950 h-full" style={{ width: `${w}px` }} />
                  ))}
                </div>
              </div>

              {/* Cloud Backup Status & Passport Subscription CTA */}
              <div className="mt-4 p-3.5 rounded-2xl bg-amber-100/60 border border-amber-300/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-stone-800">
                    Google One 스토리지 동기화 완료
                  </span>
                </div>
                <Link
                  href="/passport"
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-[11px] flex items-center gap-1 transition-colors shrink-0"
                >
                  <Film className="w-3 h-3" />
                  <span>{selectedTicket.filmStock} 25% 할인 구독 &gt;</span>
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4 border-t border-dashed border-stone-300 mt-4">
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>티켓 인쇄 / PDF</span>
                </button>
                <button
                  onClick={() => handleShare(selectedTicket)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>스토리 공유</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
