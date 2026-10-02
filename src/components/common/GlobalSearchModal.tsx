'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { SafeImage } from '@/components/common/SafeImage';
import {
  Search,
  X,
  Camera,
  MapPin,
  Sparkles,
  Calendar,
  ChevronRight,
  Loader2,
  Building2,
  Layers,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';
import { OmniSearchPayload, OmniSpotResult, OmniCameraResult, OmniStudioResult, OmniCommunityResult } from '@/app/api/search/omni/route';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<OmniSearchPayload['results']>({
    spots: [],
    cameras: [],
    studios: [],
    community: [],
  });
  const [totalCount, setTotalCount] = useState(0);

  const router = useRouter();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced Search API Call
  useEffect(() => {
    const trimmed = query.trim();

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!trimmed) {
      setResults({ spots: [], cameras: [], studios: [], community: [] });
      setTotalCount(0);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/omni?q=${encodeURIComponent(trimmed)}`);
        if (!res.ok) throw new Error('검색 서버 응답 오류');
        const data: OmniSearchPayload = await res.json();
        setResults(data.results);
        setTotalCount(data.totalCount);
      } catch (err: unknown) {
        console.error('검색 오류:', err);
        setError('검색 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  if (!isOpen || !mounted) return null;

  const handleNavigate = (href: string) => {
    onClose();
    router.push(href);
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-12 sm:pt-20 p-4 bg-stone-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-white dark:bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-vintage-200 dark:border-stone-800 flex flex-col max-h-[82vh]"
      >
        {/* Search Input Bar (Apple Spotlight Style) */}
        <div className="p-4 sm:p-5 border-b border-vintage-200 dark:border-stone-800 flex items-center gap-3.5 bg-vintage-50/70 dark:bg-stone-900/90 backdrop-blur sticky top-0 z-10">
          {loading ? (
            <Loader2 className="w-5 h-5 text-terracotta animate-spin shrink-0" />
          ) : (
            <Search className="w-5 h-5 text-terracotta shrink-0" />
          )}
          <input
            type="text"
            autoFocus
            placeholder="출사지, 관광공사 축제, 필름 카메라, 24시 자판기, 수리 명장 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm sm:text-base text-vintage-900 dark:text-stone-100 focus:outline-none placeholder:text-vintage-400 dark:placeholder:text-stone-500 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-vintage-400 hover:text-vintage-700 dark:hover:text-stone-200 hover:bg-vintage-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2.5 py-1 text-[11px] font-mono text-vintage-500 dark:text-stone-400 bg-vintage-200/60 dark:bg-stone-800 rounded-lg border border-vintage-300/80 dark:border-stone-700">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Initial State: Popular Tags & Quick Links */}
          {!query.trim() && (
            <div className="space-y-6 text-xs text-vintage-500 dark:text-stone-400 py-1">
              {/* Popular Tags */}
              <div className="space-y-3">
                <div className="font-semibold text-vintage-900 dark:text-stone-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-terracotta" />
                    실시간 인기 검색어
                  </span>
                  <span className="text-[11px] text-vintage-400 font-normal">공공데이터 &amp; DASI 큐레이션</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    '경복궁 야경',
                    'Nikon FM2',
                    '을지로 자판기',
                    '망우삼림',
                    '성수동 스냅',
                    'Olympus PEN',
                    '여의도 불꽃축제',
                    '카메라 오버홀',
                    '덕수궁 돌담길',
                  ].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className="px-3.5 py-1.5 rounded-full bg-vintage-100/90 dark:bg-stone-800 hover:bg-terracotta hover:text-white dark:hover:bg-terracotta text-vintage-800 dark:text-stone-200 transition-all font-medium border border-vintage-200/60 dark:border-stone-700 hover:border-terracotta"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Jump Grid */}
              <div className="space-y-3 pt-3 border-t border-vintage-100 dark:border-stone-800">
                <div className="font-semibold text-vintage-900 dark:text-stone-200 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-600" />
                  빠른 서비스 바로가기
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { label: '아날로그 맵', href: '/map', icon: '📍', sub: '핫스팟·실시간 골든아워' },
                    { label: '카메라 렌탈', href: '/rent', icon: '📷', sub: 'Rent-to-Own' },
                    { label: '전국 축제·행사', href: '/festivals', icon: '🏮', sub: '한국관광공사 실데이터' },
                    { label: '수리 명장 클리닉', href: '/clinic', icon: '🔧', sub: '오버홀·무료 견적' },
                    { label: '로컬 포토긱', href: '/gigs', icon: '🤝', sub: '1:1 맞춤 출사' },
                    { label: '출사 워크숍', href: '/experiences', icon: '🎟️', sub: '주말 필름 클래스' },
                    { label: 'AI 감정원', href: '/ai-appraisal', icon: '✨', sub: '시세·상태 진단' },
                    { label: 'DASI Pro', href: '/pro', icon: '🏛️', sub: 'B2B 파트너십' },
                  ].map((item) => (
                    <button
                      key={item.href}
                      onClick={() => handleNavigate(item.href)}
                      className="p-3 rounded-2xl border border-vintage-200/70 dark:border-stone-800 hover:border-terracotta bg-vintage-50/40 dark:bg-stone-850 hover:bg-white dark:hover:bg-stone-800 text-left transition-all group"
                    >
                      <div className="text-xl mb-1.5">{item.icon}</div>
                      <div className="font-bold text-vintage-900 dark:text-stone-100 group-hover:text-terracotta text-xs transition-colors">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-vintage-400 dark:text-stone-500 mt-0.5 truncate">{item.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {query.trim() && loading && (
            <div className="space-y-4 py-2 animate-pulse">
              <div className="h-4 bg-vintage-200/60 dark:bg-stone-800 rounded-md w-36"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-vintage-100 dark:bg-stone-850 rounded-2xl"></div>
                ))}
              </div>
              <div className="h-4 bg-vintage-200/60 dark:bg-stone-800 rounded-md w-28 mt-4"></div>
              <div className="h-16 bg-vintage-100 dark:bg-stone-850 rounded-2xl"></div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 flex items-center gap-3 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Empty State */}
          {query.trim() && !loading && !error && totalCount === 0 && (
            <div className="text-center py-12 space-y-3 text-vintage-400 dark:text-stone-500 text-xs">
              <div className="w-12 h-12 mx-auto rounded-full bg-vintage-100 dark:bg-stone-800 flex items-center justify-center text-vintage-400">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm text-vintage-800 dark:text-stone-200 font-bold">
                &lsquo;{query}&rsquo;에 대한 통합 검색 결과가 없습니다.
              </p>
              <p className="max-w-xs mx-auto leading-relaxed">
                출사지 이름(경복궁, 성수), 카메라 기종(FM2, 올림푸스), 또는 &lsquo;자판기&rsquo;, &lsquo;현상소&rsquo; 키워드로 검색해 보세요.
              </p>
            </div>
          )}

          {/* Results List */}
          {query.trim() && !loading && totalCount > 0 && (
            <div className="space-y-6 text-xs">
              {/* Section 1: Real-time Spots & Festivals (TourAPI 40k DB + DASI) */}
              {results.spots.length > 0 && (
                <div className="space-y-2.5">
                  <div className="font-bold text-vintage-700 dark:text-stone-300 flex items-center justify-between tracking-wide">
                    <span className="flex items-center gap-1.5 uppercase text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      실시간 출사지 &amp; 축제 ({results.spots.length})
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      한국관광공사 TourAPI 공인
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {results.spots.map((spot: OmniSpotResult) => (
                      <div
                        key={spot.id}
                        onClick={() => handleNavigate(spot.link)}
                        className="group p-3 bg-white dark:bg-stone-850 hover:bg-vintage-50 dark:hover:bg-stone-800 border border-vintage-200/80 dark:border-stone-800 rounded-2xl flex items-center gap-3 cursor-pointer transition-all hover:shadow-md hover:border-emerald-500/50"
                      >
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-vintage-100 shrink-0">
                          <SafeImage
                            src={spot.imageUrl}
                            alt={spot.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="56px"
                            category={spot.category === 'festival' ? 'festival' : 'spot'}
                          />
                          {spot.category === 'festival' && (
                            <span className="absolute bottom-1 left-1 bg-amber-500 text-white text-[9px] px-1 py-0.2 rounded font-bold">
                              축제
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-vintage-900 dark:text-stone-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                              {spot.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-vintage-500 dark:text-stone-400 truncate mt-0.5">
                            {spot.address}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                              지도에서 열기 <ArrowUpRight className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 2: DASI Cameras (Rent-to-Own) */}
              {results.cameras.length > 0 && (
                <div className="space-y-2.5">
                  <div className="font-bold text-vintage-700 dark:text-stone-300 flex items-center justify-between tracking-wide">
                    <span className="flex items-center gap-1.5 uppercase text-[11px]">
                      <Camera className="w-3.5 h-3.5 text-terracotta" />
                      추천 대여 카메라 ({results.cameras.length})
                    </span>
                    <span className="text-[10px] text-terracotta font-medium bg-terracotta/10 px-2 py-0.5 rounded-full">
                      Rent-to-Own 대여 가능
                    </span>
                  </div>
                  <div className="divide-y divide-vintage-100 dark:divide-stone-800 border border-vintage-200/80 dark:border-stone-800 rounded-2xl overflow-hidden bg-white dark:bg-stone-850">
                    {results.cameras.map((cam: OmniCameraResult) => (
                      <div
                        key={cam.id}
                        onClick={() => handleNavigate(cam.link)}
                        className="group p-3 hover:bg-vintage-50 dark:hover:bg-stone-800 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-vintage-100 shrink-0">
                            <SafeImage
                              src={cam.imageUrl}
                              alt={cam.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                              sizes="48px"
                              category="camera"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-vintage-900 dark:text-stone-100 group-hover:text-terracotta transition-colors flex items-center gap-1.5">
                              {cam.name}
                              <span className="text-[10px] font-normal text-vintage-400 dark:text-stone-500 border border-vintage-200 dark:border-stone-700 px-1 rounded">
                                {cam.brand}
                              </span>
                            </div>
                            <div className="text-[11px] text-vintage-500 dark:text-stone-400 mt-0.5">
                              {cam.era || cam.pickupLocation} · <span className="font-semibold text-terracotta">1일 ₩{cam.rentalPricePerDay.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-vintage-400 group-hover:text-terracotta transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 3: Vending & Heritage Studios */}
              {results.studios.length > 0 && (
                <div className="space-y-2.5">
                  <div className="font-bold text-vintage-700 dark:text-stone-300 flex items-center justify-between tracking-wide">
                    <span className="flex items-center gap-1.5 uppercase text-[11px]">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      24시 필름 자판기 &amp; 제휴 현상소 ({results.studios.length})
                    </span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200/60">
                      공식 파트너십
                    </span>
                  </div>
                  <div className="divide-y divide-vintage-100 dark:divide-stone-800 border border-vintage-200/80 dark:border-stone-800 rounded-2xl overflow-hidden bg-white dark:bg-stone-850">
                    {results.studios.map((std: OmniStudioResult) => (
                      <div
                        key={std.id}
                        onClick={() => handleNavigate(std.link)}
                        className="group p-3 hover:bg-vintage-50 dark:hover:bg-stone-800 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="font-bold text-vintage-900 dark:text-stone-100 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                            {std.name}
                            {std.category === 'vending' && (
                              <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded font-semibold">
                                24시 자판기
                              </span>
                            )}
                            {std.isPartner && (
                              <span className="text-[10px] bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 rounded font-semibold">
                                DASI 제휴
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-vintage-500 dark:text-stone-400 mt-0.5 truncate max-w-md">
                            {std.address} {std.partnerBenefit ? `· ${std.partnerBenefit}` : ''}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-vintage-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 4: Community, Masters & Gigs */}
              {results.community.length > 0 && (
                <div className="space-y-2.5">
                  <div className="font-bold text-vintage-700 dark:text-stone-300 uppercase text-[11px] flex items-center gap-1.5 tracking-wide">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    수리 명장 · 로컬 포토긱 ({results.community.length})
                  </div>
                  <div className="divide-y divide-vintage-100 dark:divide-stone-800 border border-vintage-200/80 dark:border-stone-800 rounded-2xl overflow-hidden bg-white dark:bg-stone-850">
                    {results.community.map((item: OmniCommunityResult) => (
                      <div
                        key={item.id}
                        onClick={() => handleNavigate(item.link)}
                        className="group p-3 hover:bg-vintage-50 dark:hover:bg-stone-800 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="font-bold text-vintage-900 dark:text-stone-100 group-hover:text-amber-600 transition-colors">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-vintage-500 dark:text-stone-400 mt-0.5">
                            {item.subtitle} · {item.location}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-vintage-400 group-hover:text-amber-600 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Guidance */}
        <div className="px-5 py-3 border-t border-vintage-200 dark:border-stone-800 bg-vintage-50/50 dark:bg-stone-900/60 flex items-center justify-between text-[11px] text-vintage-400 dark:text-stone-500">
          <span>한국관광공사 공공데이터 TourAPI 4.0 연동 중</span>
          <div className="flex items-center gap-2">
            <span>방향키/마우스 클릭 이동</span>
            <span>·</span>
            <span>ESC 닫기</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
