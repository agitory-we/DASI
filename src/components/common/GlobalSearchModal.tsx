'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Camera,
  MapPin,
  Users,
  Wrench,
  Calendar,
  ChevronRight
} from 'lucide-react';
import {
  mockCameras,
  mockAnalogSpots,
  mockPhotoGigs,
  mockMasters,
  mockEventsAndHotSpots
} from '@/data/mockData';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const router = useRouter();

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const filteredCameras = trimmed
    ? mockCameras.filter((c) =>
        c.name.toLowerCase().includes(trimmed) ||
        c.brand.toLowerCase().includes(trimmed) ||
        c.description.toLowerCase().includes(trimmed)
      )
    : [];

  const filteredSpots = trimmed
    ? mockAnalogSpots.filter((s) =>
        s.name.toLowerCase().includes(trimmed) ||
        s.area.toLowerCase().includes(trimmed) ||
        s.address.toLowerCase().includes(trimmed)
      )
    : [];

  const filteredGigs = trimmed
    ? mockPhotoGigs.filter((g) =>
        g.title.toLowerCase().includes(trimmed) ||
        g.location.toLowerCase().includes(trimmed) ||
        g.creatorName.toLowerCase().includes(trimmed)
      )
    : [];

  const filteredMasters = trimmed
    ? mockMasters.filter((m) =>
        m.name.toLowerCase().includes(trimmed) ||
        m.shopName.toLowerCase().includes(trimmed) ||
        m.specialty.toLowerCase().includes(trimmed)
      )
    : [];

  const filteredExplore = trimmed
    ? mockEventsAndHotSpots.filter((e) =>
        e.title.toLowerCase().includes(trimmed) ||
        e.location.toLowerCase().includes(trimmed)
      )
    : [];

  const totalResults =
    filteredCameras.length +
    filteredSpots.length +
    filteredGigs.length +
    filteredMasters.length +
    filteredExplore.length;

  const handleNavigate = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-vintage-200 flex flex-col max-h-[75vh]">
        {/* Search Input Header */}
        <div className="p-4 sm:p-5 border-b border-vintage-200 flex items-center gap-3 bg-vintage-50">
          <Search className="w-5 h-5 text-terracotta shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="카메라 기종, 현상소, 스냅 작가, 수리 명장, 출사지 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm sm:text-base text-vintage-900 focus:outline-none placeholder:text-vintage-400 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-vintage-400 hover:text-vintage-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-vintage-500 bg-vintage-200/80 rounded border border-vintage-300">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {!trimmed ? (
            <div className="space-y-4 text-xs text-vintage-500">
              <div className="font-semibold text-vintage-800">추천 검색어</div>
              <div className="flex flex-wrap gap-2">
                {['Nikon FM2', '망우삼림', '성수동 외국인 스냅', '오버홀 명장', '경복궁 야경'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1.5 rounded-xl bg-vintage-100 hover:bg-vintage-200 text-vintage-800 transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-10 space-y-2 text-vintage-400 text-xs">
              <p className="text-sm text-vintage-700 font-semibold">검색 결과가 없습니다.</p>
              <p>&apos;을지로&apos;, &apos;FM2&apos;, &apos;현상&apos;, &apos;스냅&apos; 등 다른 검색어를 입력해 보세요.</p>
            </div>
          ) : (
            <div className="space-y-6 text-xs">
              {/* Cameras */}
              {filteredCameras.length > 0 && (
                <div className="space-y-2">
                  <div className="font-bold text-vintage-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-terracotta" />
                    <span>카메라 대여 ({filteredCameras.length})</span>
                  </div>
                  <div className="divide-y divide-vintage-100 border border-vintage-100 rounded-2xl overflow-hidden">
                    {filteredCameras.map((cam) => (
                      <div
                        key={cam.id}
                        onClick={() => handleNavigate('/rent')}
                        className="p-3 bg-white hover:bg-vintage-50 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="font-bold text-vintage-900">{cam.name}</div>
                          <div className="text-[11px] text-vintage-500">{cam.brand} · 1일 {cam.rentalPricePerDay.toLocaleString()}원</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-vintage-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analog Spots */}
              {filteredSpots.length > 0 && (
                <div className="space-y-2">
                  <div className="font-bold text-vintage-500 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>현상소 &amp; 아날로그 스팟 ({filteredSpots.length})</span>
                  </div>
                  <div className="divide-y divide-vintage-100 border border-vintage-100 rounded-2xl overflow-hidden">
                    {filteredSpots.map((spot) => (
                      <div
                        key={spot.id}
                        onClick={() => handleNavigate('/map')}
                        className="p-3 bg-white hover:bg-vintage-50 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="font-bold text-vintage-900">{spot.name}</div>
                          <div className="text-[11px] text-vintage-500">{spot.address}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-vintage-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photo Gigs */}
              {filteredGigs.length > 0 && (
                <div className="space-y-2">
                  <div className="font-bold text-vintage-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-terracotta" />
                    <span>로컬 포토 긱 ({filteredGigs.length})</span>
                  </div>
                  <div className="divide-y divide-vintage-100 border border-vintage-100 rounded-2xl overflow-hidden">
                    {filteredGigs.map((gig) => (
                      <div
                        key={gig.id}
                        onClick={() => handleNavigate('/gigs')}
                        className="p-3 bg-white hover:bg-vintage-50 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="font-bold text-vintage-900">{gig.title}</div>
                          <div className="text-[11px] text-vintage-500">{gig.creatorName} · {gig.location}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-vintage-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Masters */}
              {filteredMasters.length > 0 && (
                <div className="space-y-2">
                  <div className="font-bold text-vintage-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-amber-600" />
                    <span>수리 명장 ({filteredMasters.length})</span>
                  </div>
                  <div className="divide-y divide-vintage-100 border border-vintage-100 rounded-2xl overflow-hidden">
                    {filteredMasters.map((master) => (
                      <div
                        key={master.id}
                        onClick={() => handleNavigate('/clinic')}
                        className="p-3 bg-white hover:bg-vintage-50 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="font-bold text-vintage-900">{master.name} ({master.shopName})</div>
                          <div className="text-[11px] text-vintage-500">{master.specialty}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-vintage-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Explore */}
              {filteredExplore.length > 0 && (
                <div className="space-y-2">
                  <div className="font-bold text-vintage-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>출사지 &amp; 축제 ({filteredExplore.length})</span>
                  </div>
                  <div className="divide-y divide-vintage-100 border border-vintage-100 rounded-2xl overflow-hidden">
                    {filteredExplore.map((exp) => (
                      <div
                        key={exp.id}
                        onClick={() => handleNavigate('/explore')}
                        className="p-3 bg-white hover:bg-vintage-50 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="font-bold text-vintage-900">{exp.title}</div>
                          <div className="text-[11px] text-vintage-500">{exp.location}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-vintage-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
