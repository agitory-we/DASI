'use client';

import React, { useState } from 'react';
import { mockEventsAndHotSpots } from '@/data/mockData';
import { EventOrHotSpot } from '@/types';
import {
  Calendar,
  MapPin,
  Clock,
  Camera,
  Sparkles,
  Info,
  Compass,
  ArrowRight,
  Sun,
  Flame,
  X
} from 'lucide-react';

export default function ExplorePage() {
  const [filterType, setFilterType] = useState<'all' | 'festival' | 'hotspot'>('all');
  const [selectedSpot, setSelectedSpot] = useState<EventOrHotSpot | null>(null);

  const filteredItems = filterType === 'all'
    ? mockEventsAndHotSpots
    : mockEventsAndHotSpots.filter((item) => item.type === filterType);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          <Calendar className="w-3.5 h-3.5 text-amber-700" />
          <span>DASI Explore [Phase 2]</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-vintage-900">
          서울 축제 &amp; 지역별 출사 Hot Spot 가이드
        </h1>
        <p className="text-xs sm:text-sm text-vintage-600 max-w-3xl leading-relaxed">
          카메라를 렌탈하고 어디로 떠나야 할지 고민이신가요?
          계절별 서울 축제 일정과 아날로그 카메라로 인생 사진을 건질 수 있는 추천 화각, 최적 골든아워, 현장 세팅 팁을 매주 업데이트합니다.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-vintage-200 pb-4">
        {[
          { id: 'all', label: '전체 둘러보기' },
          { id: 'festival', label: '🎉 서울 시즌별 축제 &amp; 행사' },
          { id: 'hotspot', label: '📸 골목길 출사 Hot Spot' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id as 'all' | 'festival' | 'hotspot')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              filterType === tab.id
                ? 'bg-vintage-900 text-white shadow-xs'
                : 'bg-white text-vintage-700 hover:bg-vintage-100 border border-vintage-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="rounded-3xl bg-white border border-vintage-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Image Preview */}
              <div className="relative aspect-[16/9] bg-vintage-100 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium">
                    {item.type === 'festival' ? '시즌 축제' : '출사 명소'}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-terracotta-light" />
                  <span>{item.location}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div>
                  <div className="text-[11px] font-bold text-terracotta mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.periodOrTime}</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-vintage-900 group-hover:text-terracotta transition-colors">
                    {item.title}
                  </h3>
                </div>

                {/* Shooting Spec Guide Box */}
                <div className="p-4 rounded-2xl bg-vintage-50 border border-vintage-100 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-vintage-800">
                    <Sun className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <strong className="text-vintage-900">최적 골든아워:</strong> {item.goldenHour}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-vintage-800">
                    <Camera className="w-4 h-4 text-terracotta shrink-0" />
                    <div>
                      <strong className="text-vintage-900">추천 화각:</strong> {item.recommendedLenses}
                    </div>
                  </div>
                </div>

                {/* Pro Tips */}
                <div className="text-xs text-vintage-700 leading-relaxed bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80">
                  💡 <strong>촬영 팁:</strong> {item.tips}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-vintage-100 text-vintage-600 text-[10px]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-6 pt-0 border-t border-vintage-100 mt-2">
              <button
                onClick={() => setSelectedSpot(item)}
                className="w-full py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <span>상세 구도 가이드 &amp; 주변 현상소 확인</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DETAIL MODAL */}
      {selectedSpot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-vintage-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-vintage-100">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-terracotta/10 text-terracotta">
                  {selectedSpot.type === 'festival' ? '서울 축제' : '출사 핫스팟'}
                </span>
                <h3 className="font-serif text-xl font-bold text-vintage-900 mt-1">
                  {selectedSpot.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSpot(null)}
                className="p-1.5 text-vintage-400 hover:text-vintage-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden">
              <img
                src={selectedSpot.imageUrl}
                alt={selectedSpot.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-3 text-xs text-vintage-700 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-vintage-50 border border-vintage-100 space-y-1.5">
                <div>📍 <strong>상세 위치:</strong> {selectedSpot.location}</div>
                <div>⏰ <strong>운영 기간/시간:</strong> {selectedSpot.periodOrTime}</div>
                <div>🌅 <strong>매직아워:</strong> {selectedSpot.goldenHour}</div>
                <div>📷 <strong>최적 화각:</strong> {selectedSpot.recommendedLenses}</div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>DASI 큐레이터의 출사 비법</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {selectedSpot.tips}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-vintage-100 text-vintage-800 flex items-center justify-between">
                <span>📍 이 출사지 인근 제휴 현상소 확인</span>
                <a
                  href="/map"
                  className="font-bold text-terracotta hover:underline"
                >
                  아날로그 맵 열기 →
                </a>
              </div>
            </div>

            <button
              onClick={() => setSelectedSpot(null)}
              className="w-full py-2.5 rounded-xl bg-vintage-900 text-white text-xs font-semibold hover:bg-terracotta transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
