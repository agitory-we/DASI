'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import * as SunCalc from 'suncalc';
import { mockEventsAndHotSpots } from '@/data/mockData';
import { EventOrHotSpot, CommunityPhoto } from '@/types';
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
  UploadCloud,
  BookOpen,
  Award,
  Download,
  ExternalLink,
  FileText,
  CheckCircle,
  Share2,
  Plus,
  Leaf,
  QrCode,
  Film,
  ShoppingBag,
  Users
} from 'lucide-react';
import { useDasi } from '@/context/DasiContext';
import { SpotReportModal } from '@/components/explore/SpotReportModal';
import { SpotCheckInModal } from '@/components/explore/SpotCheckInModal';
import { PhotoUploadModal } from '@/components/common/PhotoUploadModal';
import { FilmStripViewer } from '@/components/explore/FilmStripViewer';
import { useAuth } from '@/context/AuthContext';
import { KOREA_TOP_100_SPOTS, KoreaTopSpot } from '@/data/koreaTop100Spots';
import { OFFICIAL_GUIDEBOOKS, OFFICIAL_ARTICLES, TravelGuidebook, TravelArticle } from '@/data/travelGuides';
import type { PhotoGalleryItem } from '@/lib/photoGalleryApi';

// ──────────────────────────────────────────────────────────────────────────────
// Shot-to-Rent 스마트 패키지 매칭 인터페이스 & 헬퍼
// ──────────────────────────────────────────────────────────────────────────────
interface ShotToRentPackage {
  title: string;
  location: string;
  imageUrl: string;
  photographer?: string;
  moodTag: string;
  recommendedCamera: string;
  recommendedFilm: string;
  recommendedLab: string;
  pricePerDay: number;
  highlight: string;
}

function getShotToRentPackage(title: string, location: string, imageUrl: string, tags: string = ''): ShotToRentPackage {
  const lower = (title + location + tags).toLowerCase();
  if (lower.includes('궁') || lower.includes('한옥') || lower.includes('골목') || lower.includes('마을')) {
    return {
      title,
      location,
      imageUrl,
      moodTag: '고즈넉한 빈티지 웜톤',
      recommendedCamera: 'Olympus PEN EE-3',
      recommendedFilm: 'Kodak Gold 200',
      recommendedLab: '망우삼림 (을지로 본점)',
      pricePerDay: 18000,
      highlight: '하프 프레임 72컷 촬영으로 부담 없이 담아내는 골목길 일상 스냅',
    };
  } else if (lower.includes('바다') || lower.includes('산') || lower.includes('자연') || lower.includes('호수') || lower.includes('하늘')) {
    return {
      title,
      location,
      imageUrl,
      moodTag: '청량하고 깊은 풍경 콘트라스트',
      recommendedCamera: 'Nikon FM2',
      recommendedFilm: 'Kodak Portra 400',
      recommendedLab: '고래사진관 (충무로)',
      pricePerDay: 35000,
      highlight: '1/4000초 초고속 기계식 셔터로 대낮 야외 풍경과 피사체를 선명하게 포착',
    };
  } else if (lower.includes('축제') || lower.includes('거리') || lower.includes('야경') || lower.includes('빛')) {
    return {
      title,
      location,
      imageUrl,
      moodTag: '화려한 색채와 부드러운 인물 보케',
      recommendedCamera: 'Canon AE-1 Program',
      recommendedFilm: 'Fujifilm 200',
      recommendedLab: '팔레트사진관 (성수)',
      pricePerDay: 28000,
      highlight: 'F1.4 밝은 표준 단렌즈로 저녁 축제의 따뜻한 조명과 인물 인화 감성 재현',
    };
  }
  return {
    title,
    location,
    imageUrl,
    moodTag: '필름 특유의 은염 입자감과 따뜻함',
    recommendedCamera: 'Minolta X-700',
    recommendedFilm: 'Kodak UltraMax 400',
    recommendedLab: '망우삼림 (을지로 본점)',
    pricePerDay: 25000,
    highlight: '로쿠르(Rokkor) 명품 렌즈의 부드러운 묘사력으로 일상과 여행을 영화처럼 기록',
  };
}

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

function ExploreQuerySync({
  onFilterChange,
  onOpenUpload,
  onOpenReport,
  onSelectSpotId,
}: {
  onFilterChange: (f: any) => void;
  onOpenUpload: () => void;
  onOpenReport: () => void;
  onSelectSpotId: (id: string) => void;
}) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter && ['all', 'top100', 'knto_gallery', 'festival', 'hotspot', 'guidebooks', 'saved', 'photos'].includes(filter)) {
      onFilterChange(filter);
    }
    const action = searchParams.get('action');
    if (action === 'upload') onOpenUpload();
    if (action === 'report') onOpenReport();

    const spotId = searchParams.get('spotId');
    if (spotId) onSelectSpotId(spotId);
  }, [searchParams, onFilterChange, onOpenUpload, onOpenReport, onSelectSpotId]);

  return null;
}

function ExploreContent() {
  const { savedSpotIds, toggleSaveSpot, communityPhotos, likeCommunityPhoto, openMapModal } = useDasi();
  const { user, openLoginModal } = useAuth();
  const [filterType, setFilterType] = useState<'all' | 'top100' | 'knto_gallery' | 'festival' | 'hotspot' | 'guidebooks' | 'saved' | 'photos'>('all');
  const [selectedSpot, setSelectedSpot] = useState<EventOrHotSpot | null>(null);
  const [checkInSpot, setCheckInSpot] = useState<EventOrHotSpot | null>(null);
  const [selectedTopSpot, setSelectedTopSpot] = useState<KoreaTopSpot | null>(null);
  const [selectedGuidebook, setSelectedGuidebook] = useState<TravelGuidebook | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<TravelArticle | null>(null);
  const [kntoGalleryPhotos, setKntoGalleryPhotos] = useState<PhotoGalleryItem[]>([]);
  const [allItems, setAllItems] = useState<EventOrHotSpot[]>(mockEventsAndHotSpots);
  const [isLoading, setIsLoading] = useState(true);
  const [sunData, setSunData] = useState(() => getSeoulSunData());
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPhotoUploadModalOpen, setIsPhotoUploadModalOpen] = useState(false);
  const [selectedShotToRent, setSelectedShotToRent] = useState<ShotToRentPackage | null>(null);
  const currentSeason = useMemo(() => getCurrentSeason(), []);

  // TourAPI KorService2 축제 및 PhotoGalleryService1 데이터 fetch
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [resExplore, resGallery] = await Promise.all([
          fetch('/api/explore').catch(() => null),
          fetch('/api/gallery?numOfRows=16').catch(() => null),
        ]);

        if (resExplore && resExplore.ok) {
          const json = await resExplore.json();
          if (json.events && json.events.length > 0) {
            const mockHotspots = mockEventsAndHotSpots.filter(i => i.type === 'hotspot');
            setAllItems([...json.events, ...mockHotspots]);
          }
        }

        if (resGallery && resGallery.ok) {
          const galleryJson = await resGallery.json();
          if (galleryJson.items && galleryJson.items.length > 0) {
            setKntoGalleryPhotos(galleryJson.items);
          }
        }
      } catch {
        // graceful fallback to mock
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // 35mm 필름 스트립용 사진 데이터: 관광공사 전문 작가 사진과 유저 커뮤니티 사진 합성
  const filmStripPhotos: CommunityPhoto[] = useMemo(() => {
    if (kntoGalleryPhotos.length > 0) {
      const kntoMapped: CommunityPhoto[] = kntoGalleryPhotos.slice(0, 8).map((item, idx) => ({
        id: `knto-gal-${item.galContentId || idx}`,
        imageUrl: item.galWebImageUrl,
        caption: `${item.galTitle} (한국관광공사 전문 사진작가 공인 실사진)`,
        cameraModel: 'Leica M6 / Hasselblad 500C',
        filmType: 'Kodak Portra 400',
        labName: '한국관광공사 공식 갤러리',
        photographerName: item.galPhotographer ? `${item.galPhotographer} 작가` : '한국관광공사 사진작가',
        photographerTier: 'legend' as const,
        likesCount: 128 + idx * 17,
        location: item.galPhotographyLocation || item.galTitle,
        createdAt: item.galPhotographyMonth ? `${item.galPhotographyMonth.slice(0, 4)}.${item.galPhotographyMonth.slice(4, 6)}` : '2025.09',
      }));
      return [...kntoMapped, ...communityPhotos];
    }
    return communityPhotos;
  }, [kntoGalleryPhotos, communityPhotos]);

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

  const festivalCount = useMemo(() => {
    return allItems.filter(i => i.type === 'festival' && !isExpired(i)).length;
  }, [allItems]);



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <ExploreQuerySync
        onFilterChange={setFilterType}
        onOpenUpload={() => setIsPhotoUploadModalOpen(true)}
        onOpenReport={() => setIsReportModalOpen(true)}
        onSelectSpotId={(id) => {
          const found = allItems.find((i) => i.id === id);
          if (found) setSelectedSpot(found);
        }}
      />
      {/* Header Banner */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
            <Calendar className="w-3.5 h-3.5 text-amber-700" />
            <span>서울 52주 출사 &amp; 축제 큐레이션 — 52-Week Shutter Guide</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-vintage-900">
            서울 52주 축제 &amp; 골목 출사 Hot Spot 가이드
          </h1>
          <p className="text-xs sm:text-sm text-vintage-600 max-w-3xl leading-relaxed">
            1년 52주, 서울의 숨은 골목과 축제는 매주 새로운 감성을 선물합니다.
            아날로그 필름과 수동 카메라에 최적화된 추천 화각, 매직아워(골든아워), 그리고 현장 촬영 팁을 만나보세요.
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

      {/* 35mm Darkroom Film Strip Showcase (한국관광공사 전문 사진작가 & 커뮤니티 특별전) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <h2 className="font-serif font-bold text-sm sm:text-base text-vintage-900">
              🎞️ 35mm 네거티브 필름 스트립 & 암실 모드 (한국관광공사 전문 작가 실사진 컬렉션)
            </h2>
          </div>
          <span className="text-[11px] text-vintage-500 hidden sm:inline">암실 붉은 조명(Safelight)과 네거티브 반전을 켜보세요</span>
        </div>
        <FilmStripViewer photos={filmStripPhotos} />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-vintage-200 pb-4 overflow-x-auto">
        {[
          { id: 'all', label: '🌐 전체 둘러보기' },
          { id: 'top100', label: '🏅 한국관광 100선 명품 출사지' },
          { id: 'knto_gallery', label: `📸 관광공사 사진작가 갤러리 (${kntoGalleryPhotos.length || 16})` },
          { id: 'festival', label: `🎉 서울·전국 실시간 축제 (${festivalCount})` },
          { id: 'hotspot', label: '📷 골목길 출사 핫스팟' },
          { id: 'guidebooks', label: '📚 공식 여행 가이드북 & 매거진' },
          { id: 'saved', label: `❤️ 찜한 스팟 (${savedSpotIds.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
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
                    <button
                      type="button"
                      onClick={() => {
                        const pkg = getShotToRentPackage(photo.caption, photo.location || '', photo.imageUrl, photo.filmType);
                        pkg.photographer = photo.photographerName;
                        pkg.recommendedCamera = photo.cameraModel;
                        pkg.recommendedFilm = photo.filmType;
                        pkg.recommendedLab = photo.labName;
                        setSelectedShotToRent(pkg);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-vintage-900 hover:bg-terracotta text-white font-bold text-[10px] flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>이 기기 대여</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: KOREA TOP 100 SPOTS (한국관광 100선 & 캐치프레이즈 & 150P 인증) */}
      {!isLoading && filterType === 'top100' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-100/30 to-amber-600/10 border border-amber-300/80 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-600 text-white text-[11px] font-bold">
                <Award className="w-3.5 h-3.5" />
                <span>한국관광공사 공인 2025~2026 한국관광 100선</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-vintage-900">
                대한민국 100대 명품 필름 출사지 컬렉션
              </h3>
              <p className="text-xs text-vintage-600">
                대한민국 구석구석 공식 캐치프레이즈와 함께 엄선된 최고 권위의 출사 명소입니다. 방문 인증 시 150P를 지급합니다.
              </p>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white border border-amber-200 shadow-2xs text-center">
              <div className="text-[10px] text-vintage-400 font-bold">인증 리워드</div>
              <div className="font-serif text-lg font-bold text-terracotta">+150 포인트</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {KOREA_TOP_100_SPOTS.map((spot) => (
              <div
                key={spot.id}
                className="rounded-3xl bg-white border border-vintage-200 overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-4/3 bg-vintage-100 overflow-hidden">
                    <img
                      src={spot.imageUrl}
                      alt={spot.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-md flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        <span>100선 공인</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px]">
                        {spot.region} · {spot.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    {/* 대한민국구석구석 공식 캐치프레이즈 */}
                    <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/60 text-vintage-800 text-xs italic font-serif leading-relaxed">
                      "{spot.catchphrase}"
                    </div>

                    <div>
                      <h4 className="font-serif text-lg font-bold text-vintage-900 group-hover:text-terracotta transition-colors">
                        {spot.name}
                      </h4>
                      <p className="text-[11px] text-vintage-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-terracotta" />
                        <span>{spot.address}</span>
                      </p>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-vintage-700 bg-vintage-50 p-3 rounded-xl border border-vintage-100">
                      <div>📷 <strong>추천 화각:</strong> {spot.recommendedLens}</div>
                      <div>🎞️ <strong>추천 필름:</strong> {spot.filmRecommendation}</div>
                      <div>🌅 <strong>골든아워:</strong> {spot.goldenHour}</div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-vintage-100 mt-2 flex gap-2">
                  <button
                    onClick={() => {
                      setCheckInSpot({
                        id: spot.id,
                        type: 'hotspot',
                        title: spot.name,
                        location: spot.address,
                        periodOrTime: '상시 개방',
                        goldenHour: spot.goldenHour,
                        recommendedLenses: spot.recommendedLens,
                        tips: spot.filmRecommendation,
                        imageUrl: spot.imageUrl,
                        tags: ['한국관광100선', spot.region],
                        source: 'manual',
                        sourceId: spot.id,
                        lat: spot.lat,
                        lng: spot.lng,
                      });
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>출사 인증 (+150P)</span>
                  </button>
                  <button
                    onClick={() => setSelectedTopSpot(spot)}
                    className="px-3.5 py-2.5 rounded-xl bg-vintage-100 hover:bg-vintage-200 text-vintage-800 text-xs font-semibold transition-colors"
                  >
                    연관 코스
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: KNTO PHOTO GALLERY (한국관광공사 전문 사진작가 갤러리) */}
      {!isLoading && filterType === 'knto_gallery' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-vintage-900 via-vintage-950 to-stone-900 text-white flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-terracotta text-white text-[11px] font-bold">
                <Camera className="w-3.5 h-3.5" />
                <span>PhotoGalleryService1 공공데이터 연동</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold">
                한국관광공사 전문 사진작가 출사 갤러리
              </h3>
              <p className="text-xs text-vintage-300">
                대한민국 구석구석 전문 사진기자단이 직접 촬영한 계절별 고화질 공식 사진과 촬영작가, 촬영월 메타데이터입니다.
              </p>
            </div>
            <div className="text-right text-xs text-vintage-400 font-mono">
              수집 건수: <strong className="text-white">{kntoGalleryPhotos.length}</strong>건 실시간 로딩
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {kntoGalleryPhotos.map((photo, idx) => (
              <div
                key={photo.galContentId || idx}
                className="rounded-2xl bg-white border border-vintage-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-4/3 bg-vintage-100 overflow-hidden">
                    <img
                      src={photo.galWebImageUrl}
                      alt={photo.galTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px]">
                      {photo.galPhotographyMonth ? `${photo.galPhotographyMonth.slice(0, 4)}년 ${photo.galPhotographyMonth.slice(4, 6)}월` : '촬영'}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div>
                      <h4 className="font-serif text-sm font-bold text-vintage-900 group-hover:text-terracotta transition-colors line-clamp-1">
                        {photo.galTitle}
                      </h4>
                      <p className="text-[11px] text-vintage-500 flex items-center gap-1 mt-0.5 line-clamp-1">
                        <MapPin className="w-3 h-3 text-terracotta shrink-0" />
                        <span>{photo.galPhotographyLocation || '대한민국'}</span>
                      </p>
                    </div>

                    <div className="text-[11px] text-vintage-600 bg-vintage-50 p-2.5 rounded-xl border border-vintage-100 flex items-center justify-between">
                      <span>📸 작가: <strong>{photo.galPhotographer || '관광공사 사진작가'}</strong></span>
                      <span className="text-[10px] text-vintage-400 font-mono">공인 실측치</span>
                    </div>

                    {photo.galSearchKeyword && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {photo.galSearchKeyword.split(',').slice(0, 2).map((tag, tIdx) => (
                          <span key={tIdx} className="px-2 py-0.5 rounded bg-vintage-100 text-vintage-600 text-[10px]">
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      const pkg = getShotToRentPackage(photo.galTitle, photo.galPhotographyLocation, photo.galWebImageUrl, photo.galSearchKeyword);
                      pkg.photographer = photo.galPhotographer;
                      setSelectedShotToRent(pkg);
                    }}
                    className="w-full py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>이 감성 그대로 대여하기</span>
                  </button>
                  <a
                    href={photo.galWebImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-1.5 rounded-xl bg-vintage-50 hover:bg-vintage-100 text-vintage-600 text-[10px] font-medium flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>고화질 원본 감상</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: OFFICIAL GUIDEBOOKS & ARTICLES (가이드북 & 매거진) */}
      {!isLoading && filterType === 'guidebooks' && (
        <div className="space-y-10">
          {/* Guidebooks Section */}
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-vintage-200 pb-3">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-vintage-900 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-terracotta" />
                  <span>한국관광공사 공식 테마 여행 가이드북</span>
                </h3>
                <p className="text-xs text-vintage-500 mt-1">
                  골목 재생, 유네스코 문화유산, 생태 웰니스 등 테마별 공식 가이드북을 무료로 열람 및 다운로드하세요.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {OFFICIAL_GUIDEBOOKS.map((book) => (
                <div
                  key={book.id}
                  className="rounded-3xl bg-white border border-vintage-200 p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex gap-4 items-start">
                    <div className="w-24 h-32 rounded-2xl overflow-hidden bg-vintage-100 shrink-0 shadow-sm border border-vintage-200">
                      <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <span className="px-2 py-0.5 rounded-full bg-terracotta/10 text-terracotta text-[10px] font-bold">
                        {book.theme}
                      </span>
                      <h4 className="font-serif text-base font-bold text-vintage-900 leading-snug">
                        {book.title}
                      </h4>
                      <p className="text-xs text-vintage-600 line-clamp-2 leading-relaxed">
                        {book.summary}
                      </p>
                      <div className="text-[11px] text-vintage-400 font-mono">
                        발행: {book.publisher} · {book.publishedYear}년 ({book.pageCount}p)
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-vintage-100">
                    <a
                      href={book.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>공식 가이드북 열람</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Articles Section */}
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-vintage-200 pb-3">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-vintage-900 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-amber-600" />
                  <span>대한민국 구석구석 추천 출사 리포트 &amp; 기사</span>
                </h3>
                <p className="text-xs text-vintage-500 mt-1">
                  사광과 일몰이 아름다운 대한민국 대표 출사지를 집중 취재한 공식 여행 기사입니다.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {OFFICIAL_ARTICLES.map((art) => (
                <div
                  key={art.id}
                  className="rounded-2xl bg-white border border-vintage-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative aspect-16/10 bg-vintage-100 overflow-hidden">
                      <img src={art.imageUrl} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px]">
                        {art.category}
                      </span>
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="font-serif text-sm font-bold text-vintage-900 group-hover:text-terracotta transition-colors line-clamp-2">
                        {art.title}
                      </h4>
                      <p className="text-xs text-vintage-500 line-clamp-2">
                        {art.subtitle}
                      </p>
                      <div className="text-[10px] text-vintage-400 font-mono">
                        {art.region} · 읽는 시간 {art.readTimeMin}분
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <a
                      href={art.contentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 rounded-xl bg-vintage-50 hover:bg-vintage-100 text-vintage-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>기사 전문 읽기</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cards Grid (기존 축제 및 출사지 목록: all, festival, hotspot, saved일 때) */}
      {!isLoading && (filterType === 'all' || filterType === 'festival' || filterType === 'hotspot' || filterType === 'saved') && (
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
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className={`px-2.5 py-1 rounded-full backdrop-blur-md text-white text-[10px] font-medium ${TYPE_COLORS[item.type]}`}>
                    {TYPE_LABELS[item.type]}
                  </span>
                  {item.source === 'tourapi' && (
                    <span className="px-2 py-1 rounded-full bg-blue-600/80 backdrop-blur-md text-white text-[10px] font-medium">
                      공식 축제
                    </span>
                  )}
                  {item.type === 'festival' && item.startDate && (
                    item.startDate <= new Date().toISOString().slice(0, 10).replace(/-/g, '') ? (
                      <span className="px-2 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span>진행 중</span>
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full bg-amber-600/90 backdrop-blur-md text-white text-[10px] font-medium">
                        개막 예정
                      </span>
                    )
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

                {/* 52-Week Passport Stamp Eligibility */}
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>52주 패스포트 인증 스팟 (+200P · 제휴 현상소 바우처 교환)</span>
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

                {/* 52주 취미 생태계 연결: 골든아워 & 추천 기종 */}
                <div className="flex items-center gap-2 pt-2 border-t border-vintage-100/70 text-[11px]">
                  <Link
                    href="/golden-hour"
                    className="flex-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Sun className="w-3 h-3 text-amber-600" />
                    <span>실시간 일몰 예보</span>
                  </Link>
                  <Link
                    href={`/rent?spotTitle=${encodeURIComponent(item.title)}&recommendedLens=${encodeURIComponent(item.recommendedLenses)}`}
                    className="flex-1 px-2.5 py-1.5 rounded-xl bg-vintage-100/70 hover:bg-vintage-200 text-vintage-700 border border-vintage-200 font-semibold flex items-center justify-center gap-1 transition-colors"
                    title={`${item.title}에 어울리는 추천 기종 둘러보기`}
                  >
                    <Camera className="w-3 h-3 text-terracotta" />
                    <span>추천 기종 둘러보기</span>
                  </Link>
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
                type="button"
                onClick={() => openMapModal(item.id)}
                className="px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                title="웹 내 팝업 지도로 이 스팟 위치 보기"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden sm:inline">지도</span>
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSpot(null);
                      openMapModal('spot-1');
                    }}
                    className="p-2.5 rounded-xl border border-vintage-200 hover:border-terracotta bg-vintage-50 hover:bg-white text-center transition-all group"
                  >
                    <div className="text-sm">📍</div>
                    <div className="text-[11px] font-bold text-vintage-900 group-hover:text-terracotta">
                      인근 제휴 현상소
                    </div>
                  </button>
                  <Link
                    href={`/experiences?action=create&spotTitle=${encodeURIComponent(selectedSpot.title)}&type=flash_walk`}
                    onClick={() => setSelectedSpot(null)}
                    className="p-2.5 rounded-xl border border-vintage-200 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50 text-center transition-all group"
                  >
                    <div className="text-sm">⚡</div>
                    <div className="text-[11px] font-bold text-vintage-900 group-hover:text-amber-800">
                      출사 번개 (+300P)
                    </div>
                  </Link>
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

      {/* TOP 100 & RELATED COURSE MODAL (한국관광 데이터랩 연관 코스) */}
      {selectedTopSpot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-vintage-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-vintage-100">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-white flex items-center gap-1 w-fit">
                  <Award className="w-3 h-3" />
                  <span>한국관광 100선 공인 명소</span>
                </span>
                <h3 className="font-serif text-xl font-bold text-vintage-900 mt-1">
                  {selectedTopSpot.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTopSpot(null)}
                className="p-1.5 text-vintage-400 hover:text-vintage-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-16/10 rounded-2xl overflow-hidden">
              <img src={selectedTopSpot.imageUrl} alt={selectedTopSpot.name} className="w-full h-full object-cover" />
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs italic font-serif text-vintage-800">
              "{selectedTopSpot.catchphrase}"
            </div>

            {/* 연관 관광지 추천 코스 (TarRlteTarService1 연계) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-vintage-900 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-terracotta" />
                  <span>한국관광 데이터랩 빅데이터 연관 출사 코스</span>
                </h4>
                <span className="text-[10px] text-vintage-400">도보 1일 추천 동선</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {selectedTopSpot.relatedCourseIds.length > 0 ? (
                  selectedTopSpot.relatedCourseIds.map((rId) => {
                    const rSpot = KOREA_TOP_100_SPOTS.find((s) => s.id === rId);
                    if (!rSpot) return null;
                    return (
                      <div
                        key={rSpot.id}
                        onClick={() => setSelectedTopSpot(rSpot)}
                        className="p-3 rounded-xl border border-vintage-200 bg-vintage-50 hover:bg-white hover:border-terracotta cursor-pointer transition-all space-y-1"
                      >
                        <div className="font-bold text-vintage-900 text-xs line-clamp-1">{rSpot.name}</div>
                        <div className="text-[10px] text-vintage-500 line-clamp-1">{rSpot.catchphrase}</div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 p-3 rounded-xl bg-vintage-50 text-[11px] text-vintage-500 text-center">
                    반경 내 단독 명소 코스 (인근 로컬 카페와 함께 출사하기 좋습니다)
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  const target = selectedTopSpot;
                  setSelectedTopSpot(null);
                  setCheckInSpot({
                    id: target.id,
                    type: 'hotspot',
                    title: target.name,
                    location: target.address,
                    periodOrTime: '상시 개방',
                    goldenHour: target.goldenHour,
                    recommendedLenses: target.recommendedLens,
                    tips: target.filmRecommendation,
                    imageUrl: target.imageUrl,
                    tags: ['한국관광100선', target.region],
                    source: 'manual',
                    sourceId: target.id,
                    lat: target.lat,
                    lng: target.lng,
                  });
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>현장 출사 인증 (+150P)</span>
              </button>
              <button
                onClick={() => setSelectedTopSpot(null)}
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

      {/* 🎨 [제안 1] Shot-to-Rent 스마트 패키지 매칭 모달 */}
      {selectedShotToRent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedShotToRent(null)}
        >
          <div
            className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-vintage-300 text-vintage-900 animate-slide-up space-y-5 cursor-default max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedShotToRent(null)}
              className="absolute top-4 right-4 p-2 text-vintage-400 hover:text-vintage-800 rounded-full hover:bg-vintage-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 헤더 & 감성 무드 태그 */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Shot-to-Rent 감성 재현 매칭</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-vintage-900">
                &ldquo;이 사진 감성 그대로 주말 대여&rdquo;
              </h3>
              <p className="text-xs text-vintage-600">
                선택하신 사진의 색감과 피사체에 가장 최적화된 클래식 명기 바디와 필름 패키지입니다.
              </p>
            </div>

            {/* 선택 사진 프리뷰 카드 */}
            <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-vintage-900 border border-vintage-200 shadow-inner">
              <img
                src={selectedShotToRent.imageUrl}
                alt={selectedShotToRent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                  {selectedShotToRent.moodTag}
                </span>
                <h4 className="font-serif text-base font-bold line-clamp-1">{selectedShotToRent.title}</h4>
                <p className="text-xs text-vintage-300">{selectedShotToRent.location} {selectedShotToRent.photographer ? `· 📸 ${selectedShotToRent.photographer}` : ''}</p>
              </div>
            </div>

            {/* 추천 패키지 3종 상세 */}
            <div className="p-4 rounded-2xl bg-white border border-vintage-200 space-y-3">
              <div className="text-xs font-bold text-vintage-900 border-b border-vintage-100 pb-2 flex items-center justify-between">
                <span>🎯 스마트 매칭 번들 구성</span>
                <span className="text-terracotta text-[11px] font-normal">Rent-to-Own 100% 공제 대상</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-terracotta/10 text-terracotta flex items-center justify-center font-bold">
                      <Camera className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <div className="font-bold text-vintage-900">{selectedShotToRent.recommendedCamera}</div>
                      <div className="text-[10px] text-vintage-500">40년 명장 정밀 오버홀 완료 바디</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-vintage-800">₩{selectedShotToRent.pricePerDay.toLocaleString()}/일</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                      <Film className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <div className="font-bold text-vintage-900">{selectedShotToRent.recommendedFilm} (36exp)</div>
                      <div className="text-[10px] text-vintage-500">풍부한 계조의 감성 필름</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold">픽업 현장 보유</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-700 flex items-center justify-center font-bold">
                      🧪
                    </span>
                    <div>
                      <div className="font-bold text-vintage-900">{selectedShotToRent.recommendedLab}</div>
                      <div className="text-[10px] text-vintage-500">1초 QR 접수 및 당일 고화질 스캔</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-vintage-600 font-medium">+150P 적립</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-vintage-50 border border-vintage-100 text-[11px] text-vintage-600 leading-snug">
                💡 <strong>명장 추천 팁</strong>: {selectedShotToRent.highlight}
              </div>
            </div>

            {/* 하단 CTA 버튼 */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <Link
                href="/rent"
                onClick={() => setSelectedShotToRent(null)}
                className="flex-1 py-3.5 rounded-2xl bg-vintage-900 hover:bg-terracotta text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 text-center"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>주말 렌탈 바로 예약하기 (대여료 100% 소장 공제)</span>
              </Link>
              <Link
                href={`/experiences?action=create&spotTitle=${encodeURIComponent(selectedShotToRent.title)}&type=flash_walk`}
                onClick={() => setSelectedShotToRent(null)}
                className="py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-vintage-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 text-center"
              >
                <Users className="w-4 h-4" />
                <span>번개 모임 열기 (+300P)</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-8 text-vintage-500 text-xs">
          <span>서울 52주 출사 가이드 로딩 중...</span>
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}

