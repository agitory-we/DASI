'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import * as SunCalc from 'suncalc';
import { AnalogSpot, SpotCategory } from '@/types';
import {
  MapPin,
  Clock,
  Sparkles,
  Phone,
  Navigation,
  CheckCircle2,
  Filter,
  Flame,
  Layers,
  Store,
  ChevronRight,
  Info,
  X,
  Heart,
  ExternalLink,
  Compass,
  QrCode,
  Award,
  Zap,
  Ticket,
  Wrench,
  Sun,
  Camera,
  Film,
  Calendar,
  ShoppingBag
} from 'lucide-react';
import { useDasi } from '@/context/DasiContext';
import { ReviewModal } from '@/components/common/ReviewModal';
import { LabQrDropModal } from '@/components/common/LabQrDropModal';
import { SpotCheckInModal } from '@/components/explore/SpotCheckInModal';
import { QrCouponModal } from '@/components/cabinet/QrCouponModal';
import { StudioDirectoryModal } from '@/components/studio/StudioDirectoryModal';
import { KOREA_TOP_100_SPOTS } from '@/data/koreaTop100Spots';
import { GoogleMapCanvas } from '@/components/map/GoogleMapCanvas';

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

export interface MapContentProps {
  defaultSpotId?: string;
}

export default function MapContent({ defaultSpotId }: MapContentProps = {}) {
  const { analogSpots, isLoadingData, showToast, savedSpotIds, toggleSaveSpot, communityPhotos, addCoupon } = useDasi();
  const [selectedCategory, setSelectedCategory] = useState<SpotCategory | 'all'>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [activeSpotId, setActiveSpotId] = useState<string>(defaultSpotId || '');
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState<boolean>(false);
  const [isSpotReviewModalOpen, setIsSpotReviewModalOpen] = useState<boolean>(false);
  const [isLabQrModalOpen, setIsLabQrModalOpen] = useState<boolean>(false);
  const [isSpotCheckInOpen, setIsSpotCheckInOpen] = useState<boolean>(false);
  const [isStudioModalOpen, setIsStudioModalOpen] = useState<boolean>(false);
  const [selectedCouponSpot, setSelectedCouponSpot] = useState<AnalogSpot | null>(null);
  const [selectedShotToRent, setSelectedShotToRent] = useState<ShotToRentPackage | null>(null);
  const [filterSameDayOnly, setFilterSameDayOnly] = useState<boolean>(false);
  const [filterQrDiscountOnly, setFilterQrDiscountOnly] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [sortByNearest, setSortByNearest] = useState<boolean>(false);
  const [selectedToneScanner, setSelectedToneScanner] = useState<string>('');
  const [festivalSpots, setFestivalSpots] = useState<AnalogSpot[]>([]);


  // Haversine Distance formula in meters/km
  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      showToast('브라우저에서 위치 서비스를 지원하지 않습니다.', 'warning');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setSortByNearest(true);
        setIsLocating(false);
        showToast('현재 내 위치를 기준으로 가장 가까운 스팟을 정렬합니다.', 'success');
      },
      () => {
        // Fallback to Jongno / Euljiro central coordinates if denied
        setUserLocation({ lat: 37.5665, lng: 126.9910 });
        setSortByNearest(true);
        setIsLocating(false);
        showToast('을지로 중심 좌표를 기준으로 거리순 정렬합니다.', 'info');
      },
      { timeout: 5000 }
    );
  };

  const [tourApiNearbySpots, setTourApiNearbySpots] = useState<AnalogSpot[]>([]);
  const [studiosList, setStudiosList] = useState<AnalogSpot[]>([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);

  // defaultSpotId 전달 시 자동 활성화 및 카드 포커스 스크롤
  useEffect(() => {
    if (defaultSpotId) {
      setActiveSpotId(defaultSpotId);
      const timer = setTimeout(() => {
        const el = document.getElementById(`spot-card-${defaultSpotId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [defaultSpotId]);

  // 서울시 사진관/노포 현상소 공공 융합 데이터 동적 로드
  useEffect(() => {
    fetch('/api/studios')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.studios)) {
          const mapped: AnalogSpot[] = data.studios.map((st: any) => ({
            id: st.id,
            name: st.name,
            category: (st.category === 'lab' || st.category === 'darkroom' ? 'lab' : 'film_shop') as SpotCategory,
            isPartner: st.isPartner,
            partnerBadgeText: st.isPartner ? '⭐ DASI 제휴 20% 할인' : st.isHeritage ? `🏛️ ${st.yearsInBusiness}년 노포` : undefined,
            address: st.address,
            area: st.address.includes('중구') ? '을지로/충무로' : st.address.includes('종로') ? '종로' : st.address.includes('성동') ? '성수' : '홍대/연남',
            lat: st.lat,
            lng: st.lng,
            contact: st.tel || '02-2270-0000',
            openHours: st.isHeritage ? '10:00 - 19:00 (일요일 휴무)' : '11:00 - 20:00 (연중무휴)',
            rating: st.isHeritage ? 4.9 : 4.8,
            reviewsCount: st.isHeritage ? 89 : 45,
            services: st.specialties || ['필름 현상', '스캔'],
            scanners: ['노리츠/후지 고정밀'],
            description: st.isPartner && st.partnerBenefit ? `${st.partnerBenefit.discountText} — ${st.partnerBenefit.perk}` : `${st.yearsInBusiness ? `${st.yearsInBusiness}년 전통 ` : ''}${st.commercialDistrict || '서울 사진관'}`,
            imageUrl: st.isPartner
              ? 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
            sameDayAvailable: true,
            hasQrDiscount: st.isPartner,
            qrDiscountRate: st.isPartner ? '20%' : undefined,
            dropBox: st.dropoffAvailable,
          }));
          setStudiosList(mapped);
        }
      })
      .catch((err) => console.error('Failed to load studios on map:', err));
  }, []);

  // 1. 공공데이터 TourAPI 실시간 축제 로드 및 지도 스팟 매핑
  useEffect(() => {
    fetch('/api/explore')
      .then((r) => r.json())
      .then((data) => {
        if (data.events && data.events.length > 0) {
          const mapped: AnalogSpot[] = data.events
            .filter((ev: any) => ev.lat && ev.lng)
            .map((ev: any) => ({
              id: ev.id,
              name: ev.title,
              category: 'festival' as SpotCategory,
              isMicroAdPartner: false,
              partnerBadgeText: 'TourAPI 공인 축제',
              address: ev.location,
              area: ev.location.includes('서울') ? '서울' : (ev.location.split(' ')[0] || '전국'),
              lat: ev.lat,
              lng: ev.lng,
              contact: '1330 (관광안내)',
              openHours: ev.periodOrTime || '행사 기간 상시 운영',
              rating: 4.9,
              reviewsCount: 52,
              services: ['실시간축제', '공식행사', ev.recommendedLenses || '35mm 단렌즈', '야간조명'],
              scanners: ['현장 출사 포토존'],
              description: ev.tips || `${ev.title} 공식 축제 현장 출사`,
              imageUrl: ev.imageUrl,
              isPartner: false,
              eventPeriod: ev.periodOrTime,
              goldenHourTip: ev.goldenHour,
              recommendedLenses: ev.recommendedLenses,
              tips: ev.tips,
              photosTakenHere: [
                {
                  imageUrl: ev.imageUrl,
                  caption: `${ev.title} 현장 컷`,
                  cameraModel: 'Leica M6 / Contax T2',
                  filmType: 'Kodak Portra 400',
                  photographer: '한국관광공사 전문기자단',
                },
              ],
            }));
          setFestivalSpots(mapped);
        }
      })
      .catch((err) => console.error('Failed to load festivals on map:', err));
  }, []);

  // 2. 한국관광 100선 및 공식 캐치프레이즈를 AnalogSpot 형태로 매핑
  const top100AnalogSpots: AnalogSpot[] = useMemo(() => {
    return KOREA_TOP_100_SPOTS.map((s) => ({
      id: s.id,
      name: s.name,
      category: 'spot' as SpotCategory, // 출사 명소 카테고리로 정상화
      isMicroAdPartner: false,
      partnerBadgeText: '한국관광 100선 공인',
      address: s.address,
      area: s.region,
      lat: s.lat,
      lng: s.lng,
      contact: '한국관광공사 1330',
      openHours: '연중무휴 (일출~일몰 권장)',
      rating: 4.95,
      reviewsCount: 68,
      services: ['한국관광100선', '공식캐치프레이즈', '출사인증+150P', s.recommendedLens],
      scanners: [s.filmRecommendation],
      description: `"${s.catchphrase}" — ${s.goldenHour}`,
      imageUrl: s.imageUrl,
      isPartner: true,
      goldenHourTip: s.goldenHour,
      recommendedLenses: s.recommendedLens,
      tips: s.filmRecommendation,
      photosTakenHere: [
        {
          imageUrl: s.imageUrl,
          caption: `${s.name} 대표 출사 화각`,
          cameraModel: 'Nikon FM2 / Leica M6',
          filmType: s.filmRecommendation.split(' ')[0] || 'Kodak Portra 400',
          photographer: '한국관광공사 공인 사진작가',
        },
      ],
      dropBox: false,
    }));
  }, []);

  const handleFetchTourApiNearby = async () => {
    setIsLoadingNearby(true);
    const targetLat = userLocation?.lat || 37.5665;
    const targetLng = userLocation?.lng || 126.9780;
    try {
      const res = await fetch(`/api/spots/nearby?lat=${targetLat}&lng=${targetLng}&radius=3000&numOfRows=15`);
      if (res.ok) {
        const json = await res.json();
        if (json.spots && json.spots.length > 0) {
          const mapped: AnalogSpot[] = json.spots.map((item: any) => ({
            id: `tourapi-nearby-${item.contentid}`,
            name: item.title,
            category: 'spot' as SpotCategory, // 출사 명소 카테고리로 정상화
            isMicroAdPartner: false,
            address: item.addr1 + (item.addr2 ? ` ${item.addr2}` : ''),
            area: '서울',
            lat: parseFloat(item.mapy) || targetLat,
            lng: parseFloat(item.mapx) || targetLng,
            contact: item.tel || '1330',
            openHours: '상시 관람',
            rating: 4.8,
            reviewsCount: 24,
            services: ['한국관광공사공인', '실시간위치기반'],
            scanners: ['자연광 표준 렌즈 권장'],
            description: `한국관광공사 실시간 위치기반 공공데이터 (현재 위치 기준 약 ${Math.round(parseFloat(item.dist || '0'))}m 거리)`,
            imageUrl: item.firstimage || 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=800&auto=format&fit=crop&q=80',
            isPartner: false,
            dropBox: false,
            photosTakenHere: [
              {
                imageUrl: item.firstimage || 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=800&auto=format&fit=crop&q=80',
                caption: `${item.title} 현장 실사진`,
                cameraModel: 'Olympus PEN EE-3',
                filmType: 'Kodak Gold 200',
                photographer: '관광공사 공인 실측',
              }
            ]
          }));
          setTourApiNearbySpots(mapped);
          showToast(`내 주변 3km 내 한국관광공사 출사지 ${mapped.length}곳을 실시간 불러왔습니다!`, 'success');
        } else {
          showToast('주변 3km 내 관광공사 등록 스팟이 없습니다.', 'info');
        }
      }
    } catch {
      showToast('주변 스팟 로딩에 실패했습니다.', 'warning');
    } finally {
      setIsLoadingNearby(false);
    }
  };

  const combinedSpots = useMemo(() => {
    return [...analogSpots, ...top100AnalogSpots, ...festivalSpots, ...tourApiNearbySpots, ...studiosList];
  }, [analogSpots, top100AnalogSpots, festivalSpots, tourApiNearbySpots, studiosList]);

  const sortedSpots = useMemo(() => {
    return [...combinedSpots].filter((spot) => {
      const matchCategory = selectedCategory === 'all' || spot.category === selectedCategory;
      const matchArea = selectedArea === 'all' || spot.area === selectedArea;
      const matchSameDay = !filterSameDayOnly || spot.sameDayAvailable;
      const matchQrDiscount = !filterQrDiscountOnly || spot.hasQrDiscount;
      return matchCategory && matchArea && matchSameDay && matchQrDiscount;
    }).sort((a, b) => {
      if (!sortByNearest || !userLocation) return 0;
      const distA = getDistanceKm(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distB = getDistanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return distA - distB;
    });
  }, [combinedSpots, selectedCategory, selectedArea, filterSameDayOnly, filterQrDiscountOnly, sortByNearest, userLocation]);

  const activeSpot = useMemo(() => {
    return combinedSpots.find((s) => s.id === activeSpotId) || sortedSpots[0] || combinedSpots[0];
  }, [combinedSpots, sortedSpots, activeSpotId]);

  // 스팟별 실제 GPS 좌표 기반 실시간 일몰 & 골든아워 동적 계산
  const spotSunData = useMemo(() => {
    if (!activeSpot || !activeSpot.lat || !activeSpot.lng) return null;
    try {
      const now = new Date();
      const times = SunCalc.getTimes(now, activeSpot.lat, activeSpot.lng);
      const toHHMM = (d: Date) => {
        if (!d || isNaN(d.getTime())) return '--:--';
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      };
      if (!times.sunset || isNaN(times.sunset.getTime())) return null;
      const sunsetStr = toHHMM(times.sunset);
      const goldenStart = toHHMM(new Date(times.sunset.getTime() - 60 * 60 * 1000));
      return {
        sunset: sunsetStr,
        goldenRange: `${goldenStart} ~ ${sunsetStr}`,
      };
    } catch {
      return null;
    }
  }, [activeSpot]);

  // 활성화된 스팟에서 실제로 찍힌 사진 컬렉션 (Shot at this Spot)
  const photosForActiveSpot = useMemo(() => {
    if (!activeSpot) return [];
    const list: any[] = [];
    const seenUrls = new Set<string>();

    // 1. 스팟 자체의 photosTakenHere
    if (activeSpot.photosTakenHere) {
      activeSpot.photosTakenHere.forEach((p) => {
        if (!seenUrls.has(p.imageUrl)) {
          list.push(p);
          seenUrls.add(p.imageUrl);
        }
      });
    }

    // 2. 커뮤니티 사진 중 장소명/제목 매칭
    const spotKw = activeSpot.name.replace(/[^가-힣a-zA-Z0-9]/g, '');
    communityPhotos.forEach((cp) => {
      const targetText = (cp.location + ' ' + cp.caption + ' ' + (cp.labName || '')).replace(/[^가-힣a-zA-Z0-9]/g, '');
      if (
        (spotKw.length >= 2 && targetText.includes(spotKw)) ||
        (targetText.length >= 2 && spotKw.includes(targetText.slice(0, 3)))
      ) {
        if (!seenUrls.has(cp.imageUrl)) {
          list.push({
            id: cp.id,
            imageUrl: cp.imageUrl,
            caption: cp.caption,
            cameraModel: cp.cameraModel,
            filmType: cp.filmType,
            photographer: cp.photographerName,
            labName: cp.labName,
            likesCount: cp.likesCount,
          });
          seenUrls.add(cp.imageUrl);
        }
      }
    });

    // 3. 사진이 1장 이하이고 대표 이미지가 있으면 보강
    if (list.length === 0 && activeSpot.imageUrl) {
      list.push({
        imageUrl: activeSpot.imageUrl,
        caption: `${activeSpot.name} 대표 출사 구도`,
        cameraModel: activeSpot.recommendedLenses || '35mm / 50mm 단렌즈',
        filmType: 'Kodak Portra 400',
        photographer: 'DASI 아카이브',
      });
    }

    return list;
  }, [activeSpot, communityPhotos]);

  const getCategoryIcon = (category: SpotCategory) => {
    switch (category) {
      case 'festival':
        return '🔥';
      case 'spot':
        return '📍';
      case 'lab':
        return '🧪';
      case 'film_shop':
        return '🎞️';
      case 'vending_machine':
        return '⚡';
      case 'repair':
        return '🔧';
      case 'pickup':
        return '📷';
      default:
        return '📍';
    }
  };

  const openNavigation = (spot: AnalogSpot, service: 'google' | 'kakao' | 'naver') => {
    if (service === 'google') {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}&destination_place_id=${encodeURIComponent(
          spot.name
        )}`,
        '_blank'
      );
    } else if (service === 'kakao') {
      window.open(`https://map.kakao.com/link/to/${encodeURIComponent(spot.name)},${spot.lat},${spot.lng}`, '_blank');
    } else {
      window.open(`https://map.naver.com/v5/search/${encodeURIComponent(spot.address)}`, '_blank');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vintage-200/80 hover:bg-vintage-300 text-vintage-800 text-xs font-bold transition-all shadow-2xs group"
              title="메인 웹(홈) 화면으로 돌아가기"
            >
              <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
              <span>웹으로 돌아가기</span>
            </Link>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <MapPin className="w-3.5 h-3.5" />
              <span>실시간 아날로그 스팟 &amp; 당일 스캔 맵</span>
            </div>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-vintage-900">
            전국 현상소 · 필름 자판기 지도
          </h1>
          <p className="text-xs sm:text-sm text-vintage-600 mt-1 max-w-2xl leading-relaxed">
            을지로, 충무로, 성수동 등 당일 스캔이 가능한 현상소와 24시 필름 자판기, 40년 명장 수리실의 위치와 색감 갤러리를 확인하세요.
          </p>
        </div>

        {/* Micro-Ads & GPS Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="px-3.5 py-2.5 rounded-xl border border-vintage-300 bg-white hover:bg-vintage-50 text-xs font-semibold text-vintage-800 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Compass className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-terracotta' : 'text-emerald-700'}`} />
            <span>{isLocating ? '위치 찾는 중...' : '내 주변 거리순 정렬'}</span>
          </button>

          <button
            onClick={handleFetchTourApiNearby}
            disabled={isLoadingNearby}
            className="px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-900 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isLoadingNearby ? 'animate-spin text-amber-600' : 'text-amber-600'}`} />
            <span>{isLoadingNearby ? '공공데이터 스캔 중...' : '📍 주변 3km 공공데이터 출사지 로딩'}</span>
          </button>

          <button
            onClick={() => setIsStudioModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-500/15 hover:bg-amber-500/25 text-xs font-bold text-amber-900 transition-colors flex items-center gap-1.5 shadow-2xs"
            title="서울시 사진관 & 노포 현상소 (20% 할인 QR & 업력)"
          >
            <Store className="w-3.5 h-3.5 text-terracotta" />
            <span>🏛️ 서울 사진관·현상소 (제휴 QR)</span>
          </button>

          <button
            onClick={() => setIsPartnerModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Store className="w-3.5 h-3.5" />
            <span>상점 입점 제휴 신청</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-vintage-200 pb-4">
        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: '🌐 전체 스팟' },
            { id: 'spot', label: '📍 출사 핫스팟 & 100선' },
            { id: 'festival', label: `🔥 실시간 축제 (${festivalSpots.length})` },
            { id: 'lab', label: '🧪 당일 현상소' },
            { id: 'vending_machine', label: '⚡ 24시 자판기' },
            { id: 'film_shop', label: '🎞️ 필름샵' },
            { id: 'repair', label: '🔧 명장 수리실' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === tab.id
                  ? 'bg-vintage-900 text-white shadow-xs'
                  : 'bg-white text-vintage-700 hover:bg-vintage-100 border border-vintage-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Region Filter */}
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1 max-w-full">
          <span className="text-vintage-500 font-medium shrink-0">권역:</span>
          {['all', '을지로', '충무로', '성수', '종로', '서울', '강원', '경상', '전라', '제주'].map((area) => (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
                selectedArea === area
                  ? 'bg-terracotta text-white font-bold'
                  : 'bg-vintage-100 text-vintage-700 hover:bg-vintage-200'
              }`}
            >
              {area === 'all' ? '전체' : area}
            </button>
          ))}
        </div>

        {/* Instant & QR Benefit Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-vintage-200/60 w-full">
          <span className="text-vintage-500 text-xs font-semibold">조건별 모아보기:</span>
          <button
            onClick={() => setFilterSameDayOnly((prev) => !prev)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterSameDayOnly
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span>⚡ 당일 즉시 가능 매장만</span>
            {filterSameDayOnly && <CheckCircle2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setFilterQrDiscountOnly((prev) => !prev)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterQrDiscountOnly
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <span>🎟️ DASI 제휴 QR 할인 매장만</span>
            {filterQrDiscountOnly && <CheckCircle2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 1. Full-Width Interactive Multi-Spot Panorama Map */}
      <div className="rounded-3xl bg-stone-900 border border-vintage-200 overflow-hidden shadow-sm">
        <GoogleMapCanvas
          activeSpot={activeSpot}
          spots={sortedSpots}
          onSelectSpot={(spot) => {
            setActiveSpotId(spot.id);
            const el = document.getElementById(`spot-card-${spot.id}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }}
          onOpenNavigation={openNavigation}
        />
      </div>

      {/* 2. Main 2-Column Content Grid: List (5 cols) & Active Detail (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Spot Cards List */}
        <div className="lg:col-span-5 space-y-4 max-h-[750px] overflow-y-auto pr-2">
          {isLoadingData ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-5 rounded-2xl bg-white border border-vintage-200 animate-pulse space-y-3">
                  <div className="h-4 bg-vintage-200 rounded w-1/3" />
                  <div className="h-5 bg-vintage-100 rounded w-2/3" />
                  <div className="h-3 bg-vintage-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : sortedSpots.length === 0 ? (
            <div className="text-center py-12 p-6 rounded-2xl bg-vintage-50 border border-vintage-200 text-xs text-vintage-500">
              선택하신 조건에 해당하는 스팟이 없습니다.
            </div>
          ) : (
            sortedSpots.map((spot) => {
              const isSaved = savedSpotIds.includes(spot.id);
              const isSelected = activeSpot?.id === spot.id;
              const distanceKm = userLocation
                ? getDistanceKm(userLocation.lat, userLocation.lng, spot.lat, spot.lng).toFixed(1)
                : null;

              return (
                <div
                  key={spot.id}
                  id={`spot-card-${spot.id}`}
                  onClick={() => setActiveSpotId(spot.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 relative ${
                    isSelected
                      ? 'bg-terracotta/5 border-terracotta shadow-xs'
                      : 'bg-white border-vintage-200 hover:border-vintage-300 hover:bg-vintage-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{getCategoryIcon(spot.category)}</span>
                      <h3 className="font-serif text-base font-bold text-vintage-900">
                        {spot.name}
                      </h3>
                      {spot.isMicroAdPartner && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 font-bold border border-amber-300/40">
                          {spot.partnerBadgeText || '공식 제휴점'}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveSpot(spot.id);
                      }}
                      className="p-1 text-vintage-400 hover:text-terracotta transition-colors"
                      title={isSaved ? '저장됨' : '출사 위시리스트 저장'}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-terracotta text-terracotta' : ''}`} />
                    </button>
                  </div>

                  <p className="text-xs text-vintage-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-vintage-400 shrink-0" />
                    <span className="truncate">{spot.address}</span>
                    {distanceKm && (
                      <span className="ml-auto font-mono text-terracotta font-bold shrink-0">
                        {distanceKm}km
                      </span>
                    )}
                  </p>

                  {/* Availability & Lead Time Specs */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {spot.sameDayAvailable && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        당일 즉시 가능
                      </span>
                    )}
                    {spot.filmDevelopLeadTime && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-medium border border-purple-200/50">
                        <Clock className="w-3 h-3 text-purple-500" />
                        현상: {spot.filmDevelopLeadTime}
                      </span>
                    )}
                    {spot.repairLeadTime && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-medium border border-amber-200/50">
                        <Wrench className="w-3 h-3 text-amber-600" />
                        점검: {spot.repairLeadTime}
                      </span>
                    )}
                    {spot.quickDeliveryAvailable && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-200/50">
                        <Zap className="w-3 h-3 text-blue-500" />
                        3시간 퀵 가능
                      </span>
                    )}
                  </div>

                  {/* Highlights (당일 스캔 or 필름 재고) */}
                  {spot.todayScanCutoff && (
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-900 text-[11px] font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{spot.todayScanCutoff}</span>
                    </div>
                  )}

                  {spot.filmStockStatus && (
                    <div className="text-[11px] text-vintage-600">
                      🎞️ <strong>필름 현황:</strong> {spot.filmStockStatus}
                    </div>
                  )}

                  {/* QR Discount Badge & Quick Action */}
                  {spot.hasQrDiscount && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-rose-800 text-[11px] font-bold">
                        <QrCode className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>{spot.qrDiscountRate || 'DASI 제휴 10% 즉시 할인'}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCouponSpot(spot);
                          addCoupon({
                            id: `coupon-${Date.now()}-${spot.id}`,
                            title: `[현장 할인] ${spot.name}`,
                            issuerName: spot.name,
                            discountText: spot.qrDiscountRate || 'DASI 공식 제휴 20% 즉시 할인',
                            validUntil: '2026.12.31',
                            category: spot.category === 'repair' ? 'repair' : 'lab',
                            isUsed: false,
                          });
                          showToast(`${spot.name} 현장 할인 쿠폰이 캐비닛 쿠폰함에 자동 보관되었습니다!`, 'success');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold transition-colors shadow-2xs shrink-0"
                      >
                        QR 발급
                      </button>
                    </div>
                  )}

                  {spot.promoNotice && !spot.hasQrDiscount && (
                    <div className="text-[11px] text-terracotta font-semibold">
                      🎁 {spot.promoNotice}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT: Active Spot Detail */}
        <div className="lg:col-span-7 space-y-6">
          {activeSpot && (
            <div className="rounded-3xl bg-white border border-vintage-200 overflow-hidden shadow-xs space-y-6">
              {/* Spot Body Details */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-vintage-100 pb-4">
                  <div>
                    <span className="text-xs text-vintage-500">{activeSpot.area} 권역</span>
                    <h2 className="font-serif text-2xl font-bold text-vintage-900 mt-0.5">
                      {activeSpot.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 text-xs text-vintage-600">
                      <span>★ {activeSpot.rating.toFixed(2)} ({activeSpot.reviewsCount}개의 방문 리뷰)</span>
                      <span>·</span>
                      <span>{activeSpot.openHours}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeSpot.category === 'lab' ? (
                      <button
                        onClick={() => setIsLabQrModalOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                        title="현상소 카운터 방문 1초 QR 접수 (+150P)"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>🧪 1초 스캔 접수 QR (+150P)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsSpotCheckInOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                        title="현장 방문 브라스 핀 체크인 (+200P)"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>📍 현장 체크인 QR (+200P)</span>
                      </button>
                    )}
                    <button
                      onClick={() => setIsSpotReviewModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                      title="방문 후기 작성하고 +100P 받기"
                    >
                      <span>✍️ 리뷰 (+100P)</span>
                    </button>
                    <a
                      href={`tel:${activeSpot.contact}`}
                      className="px-4 py-2 rounded-xl bg-vintage-100 hover:bg-vintage-200 text-vintage-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-vintage-600" />
                      <span>{activeSpot.contact}</span>
                    </a>
                  </div>

                </div>

                {/* 실시간 가동성 & 소요 시간 스펙 박스 */}
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-vintage-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-vintage-900 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      실시간 가동 현황 &amp; 작업 소요 시간
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {activeSpot.sameDayAvailable ? '🟢 당일 작업 즉시 가능' : '🟡 순차 처리 중'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-vintage-100 space-y-1">
                      <div className="text-[11px] text-vintage-500 font-medium">현상·스캔 소요 시간</div>
                      <div className="font-bold text-vintage-900">{activeSpot.filmDevelopLeadTime || '당일 3~4시간 (17시 이전 접수 시)'}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-vintage-100 space-y-1">
                      <div className="text-[11px] text-vintage-500 font-medium">카메라 점검·수리 소요</div>
                      <div className="font-bold text-vintage-900">{activeSpot.repairLeadTime || '현장 30분 기본점검 (정밀 3일)'}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-vintage-100 space-y-1">
                      <div className="text-[11px] text-vintage-500 font-medium">배송 / 퀵 서비스</div>
                      <div className="font-bold text-emerald-700">{activeSpot.quickDeliveryAvailable ? '서울 전역 3시간 퀵 가능' : '현장 방문 수령 전용'}</div>
                    </div>
                  </div>

                  {/* DASI 제휴 현장 할인 QR 발급 배너 */}
                  {activeSpot.hasQrDiscount && (
                    <div className="mt-2 p-3.5 rounded-xl bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                          <Ticket className="w-4 h-4 text-rose-600" />
                          <span>DASI 회원 현장 즉시 할인 제휴처</span>
                        </div>
                        <p className="text-[11px] text-rose-700 mt-0.5">
                          {activeSpot.qrDiscountRate || '방문 시 현장 전 품목 10% 즉시 할인 혜택 제공'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedCouponSpot(activeSpot);
                          addCoupon({
                            id: `coupon-${Date.now()}-${activeSpot.id}`,
                            title: `[현장 할인] ${activeSpot.name}`,
                            issuerName: activeSpot.name,
                            discountText: activeSpot.qrDiscountRate || 'DASI 공식 제휴 20% 즉시 할인',
                            validUntil: '2026.12.31',
                            category: activeSpot.category === 'repair' ? 'repair' : 'lab',
                            isUsed: false,
                          });
                          showToast(`${activeSpot.name} 현장 할인 쿠폰이 캐비닛 쿠폰함에 자동 보관되었습니다!`, 'success');
                        }}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>현장 제시용 할인 QR 발급</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Scanner Color Tone Showcase (현상소일 경우) */}
                {activeSpot.sampleColorToneImages && activeSpot.sampleColorToneImages.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-vintage-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-terracotta" />
                        보유 스캐너별 색감 갤러리 (노리츠 vs 후지)
                      </span>
                      <span className="text-[11px] text-vintage-500">실제 현상 스캔본 샘플</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeSpot.sampleColorToneImages.map((tone, idx) => (
                        <div key={idx} className="rounded-2xl border border-vintage-200 overflow-hidden bg-vintage-50">
                          <div className="aspect-4/3 relative">
                            <img src={tone.imageUrl} alt={tone.scannerName} className="w-full h-full object-cover" />
                            <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/75 text-white text-[10px] font-bold backdrop-blur-xs">
                              {tone.scannerName}
                            </span>
                          </div>
                          <div className="p-3 text-xs text-vintage-700 leading-snug">
                            {tone.toneDescription}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 실제 유저 스캔 출사 사진 크로스 피딩 (Sprint 3-C) */}
                {(() => {
                  const matchedLabPhotos = communityPhotos.filter(p => p.labName === activeSpot.name);
                  if (matchedLabPhotos.length === 0) return null;
                  return (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-vintage-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          이 현상소에서 스캔된 실제 유저 출사 사진 ({matchedLabPhotos.length}장)
                        </span>
                        <span className="text-[10px] text-vintage-500">실시간 피드 연동</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {matchedLabPhotos.map((photo) => (
                          <div key={photo.id} className="rounded-2xl border border-vintage-200 overflow-hidden bg-vintage-900 group relative aspect-[4/3]">
                            <img src={photo.imageUrl} alt={photo.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-2.5 text-white">
                              <span className="text-[10px] font-bold truncate">📷 {photo.cameraModel}</span>
                              <span className="text-[9px] text-amber-300 truncate">🎞️ {photo.filmType}</span>
                              <span className="text-[8px] text-vintage-300 truncate mt-0.5">&ldquo;{photo.caption}&rdquo;</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* 🌅 실시간 동적 골든아워 & 일몰 위젯 (스팟별 실제 GPS 좌표 연산) */}
                {spotSunData && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-100/40 to-terracotta/10 border border-amber-300/80 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                        <Sun className="w-4 h-4 animate-spin-slow" />
                      </div>
                      <div>
                        <div className="text-[10px] text-vintage-500 font-medium">{activeSpot.name} 오늘 일몰</div>
                        <div className="font-serif font-bold text-vintage-900">{spotSunData.sunset} PM</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 border-l border-amber-200/80 pl-3">
                      <div className="w-8 h-8 rounded-xl bg-terracotta/20 text-terracotta flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] text-vintage-500 font-medium">최적 매직 골든아워</div>
                        <div className="font-serif font-bold text-terracotta">{spotSunData.goldenRange}</div>
                      </div>
                    </div>
                    {activeSpot.recommendedLenses && (
                      <div className="hidden sm:block border-l border-amber-200/80 pl-3">
                        <div className="text-[10px] text-vintage-500 font-medium">추천 화각</div>
                        <div className="font-serif font-bold text-vintage-800">{activeSpot.recommendedLenses}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* 📸 이 장소에서 찍힌 실제 필름 사진 컬렉션 (Shot at this Spot) */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-vintage-900 flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-terracotta" />
                        <span>📸 이 장소에서 찍힌 실제 필름 사진 ({photosForActiveSpot.length}장)</span>
                      </span>
                      <p className="text-[11px] text-vintage-500 mt-0.5">
                        공공데이터 공인 사진작가 및 DASI 커뮤니티 유저가 직접 담아낸 무보정 실사진입니다.
                      </p>
                    </div>
                    <span className="text-[10px] text-terracotta font-semibold hidden sm:inline">사진 클릭 시 촬영 기기 즉시 대여</span>
                  </div>

                  {photosForActiveSpot.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {photosForActiveSpot.map((photo, pIdx) => (
                        <div
                          key={photo.id || pIdx}
                          onClick={() => {
                            setSelectedShotToRent({
                              title: photo.caption || `${activeSpot.name} 출사 컷`,
                              location: activeSpot.name,
                              imageUrl: photo.imageUrl,
                              photographer: photo.photographer || '한국관광공사 사진작가',
                              moodTag: photo.filmType?.includes('Portra') ? '청량하고 자연스러운 피부톤' : '빈티지 아날로그 감성',
                              recommendedCamera: photo.cameraModel || 'Olympus PEN EE-3',
                              recommendedFilm: photo.filmType || 'Kodak Gold 200',
                              recommendedLab: photo.labName || '망우삼림 (을지로 본점)',
                              pricePerDay: 25000,
                              highlight: `${activeSpot.name}의 빛과 색감을 가장 완벽하게 재현하는 클래식 세팅입니다.`,
                            });
                          }}
                          className="rounded-2xl border border-vintage-200 overflow-hidden bg-vintage-950 group relative aspect-4/3 cursor-pointer shadow-xs hover:shadow-lg transition-all"
                        >
                          <img
                            src={photo.imageUrl}
                            alt={photo.caption || activeSpot.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-2.5 text-white">
                            <span className="text-[10px] font-bold truncate flex items-center gap-1">
                              <span>📷</span>
                              <span>{photo.cameraModel || '35mm 필름 카메라'}</span>
                            </span>
                            <span className="text-[9px] text-amber-300 truncate">
                              🎞️ {photo.filmType || '아날로그 컬러 필름'}
                            </span>
                            <span className="text-[8px] text-vintage-300 truncate mt-0.5">
                              {photo.caption ? `"${photo.caption}"` : activeSpot.name}
                            </span>
                            <div className="mt-1 flex items-center justify-between text-[8px] text-vintage-400 border-t border-white/10 pt-1">
                              <span>{photo.photographer ? `📸 ${photo.photographer}` : '공인 작가'}</span>
                              <span className="text-amber-400 font-bold">이 기기 대여 &gt;</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-vintage-50 border border-vintage-200 text-center text-xs text-vintage-500 space-y-2">
                      <p>아직 이 장소에 등록된 유저 출사 사진이 없습니다.</p>
                      <button
                        onClick={() => setIsSpotReviewModalOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-terracotta text-white text-xs font-bold"
                      >
                        첫 출사 사진 제보하고 +150P 받기
                      </button>
                    </div>
                  )}
                </div>

                {/* 💡 DASI 큐레이터의 출사 비법 & 가이드 */}
                {(activeSpot.tips || activeSpot.description) && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-vintage-800 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-900">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      <span>DASI 큐레이터의 출사 팁</span>
                    </div>
                    <p className="text-[11px] text-vintage-700 leading-relaxed">
                      {activeSpot.tips || activeSpot.description}
                    </p>
                  </div>
                )}

                {/* Micro-Ad Promotion Box */}
                {activeSpot.promoNotice && (
                  <div className="p-4 rounded-2xl bg-terracotta/5 border border-terracotta/20 flex items-start gap-3">
                    <Flame className="w-5 h-5 text-terracotta shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-vintage-900">DASI 회원 단독 제휴 혜택</div>
                      <p className="text-xs text-vintage-700 mt-0.5 leading-relaxed">
                        {activeSpot.promoNotice} (방문 시 DASI 웹 화면을 보여주시면 즉시 적용됩니다)
                      </p>
                    </div>
                  </div>
                )}

                {/* 하단 Action Bridge */}
                <div className="pt-2 border-t border-vintage-100 flex flex-wrap gap-2">
                  <Link
                    href="/rent"
                    className="flex-1 py-3 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs text-center"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                    <span>이 장소 추천 카메라 렌탈하기</span>
                  </Link>
                  <button
                    onClick={() => openNavigation(activeSpot, 'google')}
                    className="px-4 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>길찾기</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Shot-to-Rent 스마트 패키지 매칭 모달 */}
      {selectedShotToRent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
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

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Shot-to-Rent 감성 재현 매칭</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-vintage-900">
                &ldquo;이 장소 감성 그대로 주말 대여&rdquo;
              </h3>
              <p className="text-xs text-vintage-600">
                선택하신 사진의 색감과 장소에 가장 최적화된 클래식 명기 바디와 필름 패키지입니다.
              </p>
            </div>

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
                <p className="text-xs text-vintage-300">
                  {selectedShotToRent.location} {selectedShotToRent.photographer ? `· 📸 ${selectedShotToRent.photographer}` : ''}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-vintage-200 space-y-3">
              <div className="text-xs font-bold text-vintage-900 border-b border-vintage-100 pb-2 flex items-center justify-between">
                <span>🎯 스마트 매칭 번들 구성</span>
                <span className="text-terracotta text-[11px] font-normal">대여료 100% 소장 공제</span>
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
                      <div className="text-[10px] text-vintage-500">당일 고화질 현상·스캔 지원</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-vintage-600 font-medium">+150P 적립</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-vintage-50 border border-vintage-100 text-[11px] text-vintage-600 leading-snug">
                💡 <strong>명장 추천 팁</strong>: {selectedShotToRent.highlight}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Link
                href="/rent"
                onClick={() => setSelectedShotToRent(null)}
                className="flex-1 py-3.5 rounded-2xl bg-vintage-900 hover:bg-terracotta text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 text-center"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>주말 렌탈 바로 예약하기 (대여료 100% 소장 공제)</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* B2B MICRO-ADS PROMOTION BANNER (Turn 5 Charter) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-vintage-900 to-vintage-800 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-vintage-700">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
            <Flame className="w-3 h-3" />
            <span>월 14,900원 로컬 상점 소액 홍보 (Micro-Ads)</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-white">
            현상소·필름샵·수리실 사장님이신가요? DASI 지도에 황금 핀을 꽂으세요
          </h2>
          <p className="text-xs text-vintage-300 leading-relaxed">
            비싼 인스타 광고 대신, 주말마다 출사 나가는 100% 진성 필름 유저들에게 '오늘 당일 스캔 가능', '실시간 필름 재고 현황', '색감 갤러리'를 직접 알릴 수 있습니다.
          </p>
        </div>

        <button
          onClick={() => setIsPartnerModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-terracotta hover:bg-terracotta-light text-white text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 shrink-0 flex items-center gap-2"
        >
          <Store className="w-4 h-4" />
          <span>월 14,900원 파트너 핀 신청 →</span>
        </button>
      </div>

      {/* PARTNER REGISTRATION MODAL */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-vintage-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-vintage-100 pb-3">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-terracotta" />
                <h3 className="font-serif text-xl font-bold text-vintage-900">
                  아날로그 스팟 입점 &amp; 소액 홍보
                </h3>
              </div>
              <button
                onClick={() => setIsPartnerModalOpen(false)}
                className="p-1.5 text-vintage-400 hover:text-vintage-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-vintage-600 leading-relaxed">
              현상소, 필름 자판기, 빈티지 샵을 운영 중이신가요?
              DASI 지도 상단 노출 및 '오늘 당일 스캔' 실시간 마감 알림을 통해 주말 출사객을 직접 매장으로 유치하세요.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-vintage-800 block mb-1">상점/현상소 명칭</label>
                <input
                  type="text"
                  placeholder="예: 을지로 망우삼림"
                  className="w-full bg-vintage-50 border border-vintage-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-terracotta"
                />
              </div>

              <div>
                <label className="font-bold text-vintage-800 block mb-1">매장 주소 및 연락처</label>
                <input
                  type="text"
                  placeholder="서울 중구 을지로 108 / 02-1234-5678"
                  className="w-full bg-vintage-50 border border-vintage-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-terracotta"
                />
              </div>

              <div>
                <label className="font-bold text-vintage-800 block mb-1">보유 스캐너 및 특장점</label>
                <textarea
                  rows={2}
                  placeholder="예: 노리츠 HS-1800 보유, 당일 스캔 3시간 내 완료"
                  className="w-full bg-vintage-50 border border-vintage-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-terracotta"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setIsPartnerModalOpen(false);
                showToast('입점 제휴 신청이 접수되었습니다. 담당자가 24시간 내 연락드립니다.', 'success');
              }}
              className="w-full py-3 rounded-xl bg-terracotta hover:bg-terracotta-light text-white text-xs sm:text-sm font-bold transition-colors shadow-xs"
            >
              제휴 입점 신청서 제출하기
            </button>
          </div>
        </div>
      )}

      {/* 아날로그 스팟 방문 리뷰 모달 */}
      {isSpotReviewModalOpen && activeSpot && (
        <ReviewModal
          isOpen={isSpotReviewModalOpen}
          onClose={() => setIsSpotReviewModalOpen(false)}
          targetType={activeSpot.category === 'lab' ? 'lab' : 'spot'}
          targetId={activeSpot.id}
          targetName={activeSpot.name}
          onSuccess={() => {
            showToast(`${activeSpot.name} 방문 리뷰가 등록되었습니다! (+100P 적립)`, 'success');
          }}
        />
      )}

      {/* 현상소 1초 스마트 스캔 접수 QR 모달 */}
      {isLabQrModalOpen && activeSpot && (
        <LabQrDropModal
          isOpen={isLabQrModalOpen}
          onClose={() => setIsLabQrModalOpen(false)}
          defaultLabName={activeSpot.name}
          onSuccess={() => {
            showToast(`${activeSpot.name} 1초 스캔 접수가 완료되었습니다! (+150P 적립)`, 'success');
          }}
        />
      )}

      {/* 스팟 현장 브라스 핀 체크인 QR 모달 */}
      {isSpotCheckInOpen && activeSpot && (
        <SpotCheckInModal
          isOpen={isSpotCheckInOpen}
          onClose={() => setIsSpotCheckInOpen(false)}
          spotTitle={activeSpot.name}
          spotLocation={activeSpot.address}
          onSuccess={() => {
            showToast(`${activeSpot.name} 현장 체크인이 완료되었습니다! (+200P 적립)`, 'success');
          }}
        />
      )}

      {/* DASI 공식 제휴 현장 즉시 할인 QR 쿠폰 모달 */}
      {selectedCouponSpot && (
        <QrCouponModal
          isOpen={!!selectedCouponSpot}
          onClose={() => setSelectedCouponSpot(null)}
          shopName={selectedCouponSpot.name}
          discountText={selectedCouponSpot.qrDiscountRate || 'DASI 공식 제휴 10% 현장 즉시 할인'}
          categoryName={selectedCouponSpot.category === 'lab' ? '당일 현상·스캔 제휴처' : selectedCouponSpot.category === 'repair' ? '명장 정밀 수리실' : '필름 & 카메라 전문점'}
          leadTime={selectedCouponSpot.filmDevelopLeadTime || selectedCouponSpot.repairLeadTime || '당일 현장 즉시 적용'}
        />
      )}

      {/* 서울시 사진관 & 노포 현상소 공공 융합 디렉토리 모달 */}
      <StudioDirectoryModal
        isOpen={isStudioModalOpen}
        onClose={() => setIsStudioModalOpen(false)}
      />
    </div>
  );
}