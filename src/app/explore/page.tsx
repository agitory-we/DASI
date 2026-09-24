'use client';

import React, { useState, useEffect, useMemo } from 'react';
import * as SunCalc from 'suncalc';
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
  X,
  Heart,
  RefreshCw,
  Leaf,
  Plus,
  QrCode,
  UploadCloud
} from 'lucide-react';
import { useDasi } from '@/context/DasiContext';
import { SpotReportModal } from '@/components/explore/SpotReportModal';
import { SpotCheckInModal } from '@/components/explore/SpotCheckInModal';
import { PhotoUploadModal } from '@/components/common/PhotoUploadModal';
import { FilmStripViewer } from '@/components/explore/FilmStripViewer';
import { useAuth } from '@/context/AuthContext';

// ──────────────────────────────────────────────────────────────────────────────
// 헬퍼: suncalc 기반 골든아워 계산 (서울 위경도 고정)
// ──────────────────────────────────────────────────────────────────────────────
const SEOUL_LAT = 37.5665;
const SEOUL_LNG = 126.9780;

function toHHMM(date: Date | null | undefined): string {
  if (!date || isNaN(date.getTime())) return '--:--';
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function addMinutes(date: Date | null | undefined, mins: number): Date | null {
  if (!date || isNaN(date.getTime())) return null;
  return new Date(date.getTime() + mins * 60 * 1000);
}

function getSeoulSunData() {
  const now = new Date();
  const times = SunCalc.getTimes(now, SEOUL_LAT, SEOUL_LNG);
  const sunriseStr = toHHMM(times.sunrise);
  const sunsetStr = toHHMM(times.sunset);
  const goldenStart = toHHMM(addMinutes(times.sunset, -60));
  const goldenEnd = sunsetStr;
  return { sunriseStr, sunsetStr, goldenStart, goldenEnd };
}

// 계절 자동 분류
function getCurrentSeason(): '봄' | '여름' | '가을' | '겨울' {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return '봄';
  if (m >= 6 && m <= 8) return '여름';
  if (m >= 9 && m <= 11) return '가을';
  return '겨울';
}

// 콘텐츠 타입 레이블 매핑
const TYPE_LABELS: Record<EventOrHotSpot['type'], string> = {
  festival: '시즌 축제',
  hotspot: '출사 명소',
  seasonal: '계절 특집',
  golden_hour_alert: '골든아워 알림',
  film_pairing: '필름 페어링',
  photo_walk: '출사 투어',
};

const TYPE_COLORS: Record<EventOrHotSpot['type'], string> = {
  festival: 'bg-terracotta/80',
  hotspot: 'bg-emerald-600/80',
  seasonal: 'bg-amber-600/80',
  golden_hour_alert: 'bg-orange-500/80',
  film_pairing: 'bg-violet-600/80',
  photo_walk: 'bg-blue-600/80',
};

// 만료 여부 체크 (periodOrTime에서 날짜 추출)
function isExpired(item: EventOrHotSpot): boolean {
  if (item.endDate) {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return item.endDate < today;
  }
  return false;
}

export default function ExplorePage() {
  const { savedSpotIds, toggleSaveSpot, communityPhotos, likeCommunityPhoto } = useDasi();
  const { user, openLoginModal } = useAuth();
  const [filterType, setFilterType] = useState<'all' | 'festival' | 'hotspot' | 'photos' | 'saved'>('all');
  const [selectedSpot, setSelectedSpot] = useState<EventOrHotSpot | null>(null);
  const [checkInSpot, setCheckInSpot] = useState<EventOrHotSpot | null>(null);
  const [allItems, setAllItems] = useState<EventOrHotSpot[]>(mockEventsAndHotSpots);
  const [isLoading, setIsLoading] = useState(true);
  const [sunData, setSunData] = useState(() => getSeoulSunData());
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPhotoUploadModalOpen, setIsPhotoUploadModalOpen] = useState(false);
  const currentSeason = useMemo(() => getCurrentSeason(), []);

  // TourAPI 데이터 fetch (API 키 없으면 mockData 그대로)
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/explore');
        if (res.ok) {
          const json = await res.json();
          if (json.events && json.events.length > 0) {
            // TourAPI 데이터 + 기존 hotspot mock 병합
            const mockHotspots = mockEventsAndHotSpots.filter(i => i.type === 'hotspot');
            setAllItems([...json.events, ...mockHotspots]);
          }
        }
      } catch {
        // 실패 시 mockData 그대로 사용
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // suncalc 매 분 갱신
  useEffect(() => {
    const interval = setInterval(() => setSunData(getSeoulSunData()), 60_000);
    setSunData(getSeoulSunData());
    setIsLoading(false);
    return () => clearInterval(interval);
  }, []);

  const filteredItems = useMemo(() => {
    const active = allItems.filter(item => !isExpired(item));
    if (filterType === 'all') return active;
    if (filterType === 'saved') return active.filter(i => savedSpotIds.includes(i.id));
    return active.filter(i => i.type === filterType);
  }, [allItems, filterType, savedSpotIds]);



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
            <Calendar className="w-3.5 h-3.5 text-amber-700" />
            <span>DASI Explore — 커뮤니티 큐레이션</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-vintage-900">
            서울 축제 &amp; 지역별 출사 Hot Spot 가이드
          </h1>
          <p className="text-xs sm:text-sm text-vintage-600 max-w-3xl leading-relaxed">
            카메라를 렌탈하고 어디로 떠나야 할지 고민이신가요?
            계절별 서울 축제 일정과 아날로그 카메라로 인생 사진을 건질 수 있는 추천 화각, 최적 골든아워, 현장 세팅 팁을 매주 업데이트합니다.
          </p>
        </div>
        {/* UGC 버튼 그룹 */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsPhotoUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-terracotta hover:bg-terracotta-light text-white text-xs font-bold transition-all shadow-xs"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>사진 올리기 (+150P)</span>
          </button>
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-vintage-900 hover:bg-vintage-800 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>명소 제보 (+500P)</span>
          </button>
        </div>
      </div>

      {/* Realtime Golden Hour & Weather Station Widget */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-[#FAF6EE] to-terracotta/10 border border-amber-300/60 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
            <Sun className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="text-[10px] text-vintage-500 font-medium">오늘 서울 일몰 (Sunset)</div>
            <div className="font-serif text-base font-bold text-vintage-900">{sunData.sunsetStr} PM</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-terracotta/20 text-terracotta flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-vintage-500 font-medium">매직 골든아워 (Golden Hour)</div>
            <div className="font-serif text-base font-bold text-terracotta">{sunData.goldenStart} ~ {sunData.goldenEnd}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-vintage-500 font-medium">오늘의 추천 필름 감도</div>
            <div className="font-serif text-base font-bold text-emerald-800">
              {currentSeason === '여름' ? 'ISO 100 · 200' : currentSeason === '겨울' ? 'ISO 800 · 1600' : 'ISO 200 · 400'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-200/60 text-amber-800 flex items-center justify-center shrink-0">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-vintage-500 font-medium">현재 출사 시즌</div>
            <div className="font-serif text-base font-bold text-amber-900">
              {currentSeason === '봄' ? '🌸 봄 벚꽃 시즌' : currentSeason === '여름' ? '🌊 여름 야경 시즌' : currentSeason === '가을' ? '🍁 가을 단풍 시즌' : '❄️ 겨울 설경 시즌'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-vintage-200 pb-4 overflow-x-auto">
        {[
          { id: 'all', label: '전체 둘러보기' },
          { id: 'photos', label: `🎞️ 출사 사진 피드 (${communityPhotos.length})` },
          { id: 'festival', label: '🎉 서울 시즌별 축제' },
          { id: 'hotspot', label: '📸 골목길 출사지' },
          { id: 'saved', label: `❤️ 찜한 스팟 (${savedSpotIds.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id as 'all' | 'photos' | 'festival' | 'hotspot' | 'saved')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              filterType === tab.id
                ? 'bg-vintage-900 text-white shadow-xs'
                : 'bg-white text-vintage-700 hover:bg-vintage-100 border border-vintage-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-3xl bg-white border border-vintage-200 overflow-hidden animate-pulse">
              <div className="aspect-[16/9] bg-vintage-100" />
              <div className="p-6 space-y-3">
                <div className="h-4 bg-vintage-100 rounded-lg w-1/3" />
                <div className="h-6 bg-vintage-100 rounded-lg w-3/4" />
                <div className="h-16 bg-vintage-50 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Community Photos Feed (filterType === 'photos') ── */}
      {!isLoading && filterType === 'photos' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-vintage-900">
                필름러들의 실시간 출사 갤러리
              </h2>
              <p className="text-xs text-vintage-500 mt-0.5">
                DASI 기기 대여 회원과 포토워커들이 직접 찍어 올린 무보정 실사용 사진입니다.
              </p>
            </div>
            <button
              onClick={() => setIsPhotoUploadModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-terracotta hover:bg-terracotta-light text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>사진 등록 (+150P)</span>
            </button>
          </div>

          {/* 35mm 암실 필름 스트립 가로 뷰어 */}
          <FilmStripViewer photos={communityPhotos} />

          <div className="pt-2">
            <h3 className="font-serif font-bold text-base text-vintage-900 mb-3">
              전체 갤러리 피드
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {communityPhotos.map((photo) => (
              <div
                key={photo.id}
                className="rounded-3xl bg-white border border-vintage-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-[4/3] bg-vintage-900 overflow-hidden">
                    <img
                      src={photo.imageUrl}
                      alt={photo.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold">
                        📷 {photo.cameraModel}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold">
                        🎞️ {photo.filmType}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <p className="text-xs text-vintage-800 leading-relaxed font-medium">
                      &ldquo;{photo.caption}&rdquo;
                    </p>

                    <div className="space-y-1 text-[11px] text-vintage-500 pt-2 border-t border-vintage-100">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-terracotta shrink-0" />
                        <span>{photo.location || '서울 도심'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-vintage-400">🧪</span>
                        <span className="text-vintage-700 font-semibold">{photo.labName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between border-t border-vintage-100/60 mt-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-terracotta text-white flex items-center justify-center text-[10px] font-bold">
                      {photo.photographerName[0]}
                    </div>
                    <span className="font-bold text-vintage-900 text-[11px]">{photo.photographerName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => likeCommunityPhoto(photo.id)}
                      className="flex items-center gap-1 text-xs text-vintage-500 hover:text-terracotta transition-colors"
                    >
                      <Heart className="w-3.5 h-3.5 fill-terracotta text-terracotta" />
                      <span className="font-mono text-[11px]">{photo.likesCount}</span>
                    </button>
                    <a
                      href="/rent"
                      className="px-2.5 py-1 rounded-lg bg-vintage-100 hover:bg-vintage-200 text-vintage-800 font-bold text-[10px] transition-colors"
                    >
                      기기 대여
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cards Grid */}
      {!isLoading && filterType !== 'photos' && (
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
                  <span className={`px-2.5 py-1 rounded-full backdrop-blur-md text-white text-[10px] font-medium ${TYPE_COLORS[item.type]}`}>
                    {TYPE_LABELS[item.type]}
                  </span>
                  {item.source === 'tourapi' && (
                    <span className="px-2 py-1 rounded-full bg-blue-600/70 backdrop-blur-md text-white text-[10px] font-medium">
                      공식 행사
                    </span>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveSpot(item.id);
                    }}
                    className={`p-2 rounded-full backdrop-blur-md transition-all ${
                      savedSpotIds.includes(item.id)
                        ? 'bg-terracotta text-white shadow-md'
                        : 'bg-black/50 text-white/80 hover:text-white hover:bg-black/70'
                    }`}
                    title={savedSpotIds.includes(item.id) ? '위시리스트 해제' : '출사 위시리스트 저장'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${savedSpotIds.includes(item.id) ? 'fill-current' : ''}`} />
                  </button>
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
            <div className="p-6 pt-0 border-t border-vintage-100 mt-2 flex items-center gap-2">
              <button
                onClick={() => setSelectedSpot(item)}
                className="flex-1 py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <span>상세 구도 가이드</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCheckInSpot(item)}
                className="px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs shrink-0"
                title="현장 방문 브라스 핀 인증 (+200P)"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>체크인 (+200P)</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      )} {/* !isLoading 카드 그리드 종료 */}

      {/* EMPTY STATE */}
      {!isLoading && filteredItems.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-vintage-200 p-8 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-vintage-900">
              아직 찜한 출사 스팟이 없습니다
            </h3>
            <p className="text-xs text-vintage-500 max-w-sm mx-auto">
              서울 축제 및 골목길 출사지 카드의 하트 버튼을 눌러 이번 주말 가고 싶은 장소를 저장해 보세요.
            </p>
          </div>
          <button
            onClick={() => setFilterType('all')}
            className="px-5 py-2.5 rounded-xl bg-vintage-900 text-white text-xs font-semibold hover:bg-terracotta transition-colors"
          >
            전체 스팟 둘러보기
          </button>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedSpot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-vintage-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-vintage-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-terracotta/10 text-terracotta">
                    {selectedSpot.type === 'festival' ? '서울 축제' : '출사 핫스팟'}
                  </span>
                  <button
                    onClick={() => toggleSaveSpot(selectedSpot.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                      savedSpotIds.includes(selectedSpot.id)
                        ? 'bg-terracotta text-white'
                        : 'bg-vintage-100 text-vintage-600 hover:bg-vintage-200'
                    }`}
                  >
                    <Heart className={`w-3 h-3 ${savedSpotIds.includes(selectedSpot.id) ? 'fill-current' : ''}`} />
                    <span>{savedSpotIds.includes(selectedSpot.id) ? '위시리스트 저장됨' : '위시 담기'}</span>
                  </button>
                </div>
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

              {/* Cross-selling Action Bridge */}
              <div className="space-y-2 pt-1">
                <div className="text-[10px] font-bold text-vintage-400 uppercase tracking-wider">
                  연계 서비스 바로가기
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <a
                    href="/rent"
                    className="p-2.5 rounded-xl border border-vintage-200 hover:border-terracotta bg-vintage-50 hover:bg-white text-center transition-all group"
                  >
                    <div className="text-sm">📷</div>
                    <div className="text-[11px] font-bold text-vintage-900 group-hover:text-terracotta">
                      추천 카메라 렌탈
                    </div>
                  </a>
                  <a
                    href="/gigs"
                    className="p-2.5 rounded-xl border border-vintage-200 hover:border-terracotta bg-vintage-50 hover:bg-white text-center transition-all group"
                  >
                    <div className="text-sm">🤝</div>
                    <div className="text-[11px] font-bold text-vintage-900 group-hover:text-terracotta">
                      이 장소 스냅 작가
                    </div>
                  </a>
                  <a
                    href="/map"
                    className="p-2.5 rounded-xl border border-vintage-200 hover:border-terracotta bg-vintage-50 hover:bg-white text-center transition-all group"
                  >
                    <div className="text-sm">📍</div>
                    <div className="text-[11px] font-bold text-vintage-900 group-hover:text-terracotta">
                      인근 제휴 현상소
                    </div>
                  </a>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const target = selectedSpot;
                  setSelectedSpot(null);
                  setCheckInSpot(target);
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>현장 체크인 (+200P)</span>
              </button>
              <button
                onClick={() => setSelectedSpot(null)}
                className="px-5 py-2.5 rounded-xl bg-vintage-200 text-vintage-800 text-xs font-semibold hover:bg-vintage-300 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 출사 명소 제보 모달 */}
      <SpotReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      {/* 출사 사진 업로드 모달 (+150P) */}
      <PhotoUploadModal
        isOpen={isPhotoUploadModalOpen}
        onClose={() => setIsPhotoUploadModalOpen(false)}
      />

      {/* 출사 명소 현장 체크인 QR 모달 */}
      {checkInSpot && (
        <SpotCheckInModal
          isOpen={!!checkInSpot}
          onClose={() => setCheckInSpot(null)}
          spotTitle={checkInSpot.title}
          spotLocation={checkInSpot.location}
          goldenHourTip={checkInSpot.goldenHour}
          recommendedLens={checkInSpot.recommendedLenses}
        />
      )}
    </div>
  );
}

