'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  ChevronRight,
  ShieldCheck,
  PlusCircle,
  Flame,
  Award,
  Film,
  Building2,
  Share2,
  Check,
  Copy,
  ExternalLink,
  MessageCircle,
  Sliders,
  AlertCircle,
  Heart,
  Star,
  Upload,
  Layers,
  Sparkle
} from 'lucide-react';
import { useDasi } from '@/context/DasiContext';
import { playShutterSound } from '@/utils/shutterAudio';
import { PhotoMeetup, MeetupCategory, MeetupPhotoRoll, WeeklyPlaygroundPlan } from '@/types';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';

// URL 파라미터 감지하여 모임 개설 모달 자동 오픈 (?action=create&spotTitle=...)
function ExperienceQuerySync({
  onOpenCreateWithSpot
}: {
  onOpenCreateWithSpot: (spotTitle?: string, type?: MeetupCategory) => void;
}) {
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const action = searchParams.get('action');
    const spotTitleParam = searchParams.get('spotTitle');
    const typeParam = searchParams.get('type') as MeetupCategory | null;

    if (action === 'create') {
      const decodedSpot = spotTitleParam ? decodeURIComponent(spotTitleParam) : undefined;
      onOpenCreateWithSpot(decodedSpot, typeParam || undefined);
    }
  }, [searchParams, onOpenCreateWithSpot]);

  return null;
}

export default function ExperiencesPage() {
  const {
    meetups,
    bookedExperiences,
    createMeetup,
    joinMeetup,
    cancelMeetup,
    closeMeetup,
    photoRolls,
    crews,
    weeklyPlans,
    uploadPhotoRoll,
    togglePhotoRollLike,
    joinCrew,
    showToast
  } = useDasi();

  const [activeView, setActiveView] = useState<'meetups' | 'calendar' | 'crews'>('meetups');
  const [calendarSeasonFilter, setCalendarSeasonFilter] = useState<'all' | 'spring' | 'summer' | 'autumn' | 'winter'>('all');
  const [selectedCategory, setSelectedCategory] = useState<MeetupCategory | 'all'>('all');
  
  // 모임 상세 보기 모달 상태 및 탭
  const [selectedDetailMeetup, setSelectedDetailMeetup] = useState<PhotoMeetup | null>(null);
  const [detailTab, setDetailTab] = useState<'info' | 'photos' | 'reviews'>('info');

  // 사진 롤 업로드 모달 상태
  const [isUploadRollOpen, setIsUploadRollOpen] = useState(false);
  const [rollForm, setRollForm] = useState({
    authorName: '',
    cameraModel: 'Olympus PEN EE-3',
    filmStock: 'Kodak Portra 400',
    labName: '을지로 망우삼림 (SP3000)',
    rating: 5,
    caption: '',
    reviewText: '',
    selectedSampleIndex: 0,
  });

  // 모임 개설 모달 상태
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    category: 'flash_walk' as MeetupCategory,
    title: '',
    hostName: '아날로그 탐험가',
    hostRole: '@film_walker',
    dateTime: '이번 주말 토요일 17:00 (일몰 1시간 전)',
    duration: '약 2시간 30분',
    location: '',
    maxAttendees: 6,
    price: 0,
    description: '',
    recommendedGear: 'Olympus PEN EE-3 또는 35mm 자동카메라',
    recommendedFilm: '코닥 골드 200 또는 울트라맥스 400',
    includedItems: '출사 지도 브리핑, 현장 노출 팁 코칭, 모임 단톡방',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80',
  });

  // 모임 참가 모달 상태
  const [selectedMeetupForJoin, setSelectedMeetupForJoin] = useState<PhotoMeetup | null>(null);
  const [joinForm, setJoinForm] = useState({
    name: '',
    phone: '',
    camera: '',
    withRental: false,
    selectedCamera: 'Olympus PEN EE-3 (하프 필름)',
    withFilm: false,
  });
  const [issuedTicketCode, setIssuedTicketCode] = useState<string | null>(null);
  const [isCopiedChatLink, setIsCopiedChatLink] = useState(false);
  const [aiCuratedPlan, setAiCuratedPlan] = useState<WeeklyPlaygroundPlan | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    fetch('/api/cron/curate-weekly')
      .then((res) => res.json())
      .then((data) => {
        if (isSubscribed && data.plan) {
          setAiCuratedPlan(data.plan);
        }
      })
      .catch((err) => console.warn('AI 큐레이션 로드 실패:', err));
    return () => {
      isSubscribed = false;
    };
  }, []);

  const handleOpenCreateWithSpot = React.useCallback((spotTitle?: string, type?: MeetupCategory) => {
    setCreateForm((prev) => ({
      ...prev,
      category: type || 'flash_walk',
      title: spotTitle ? `[번개⚡] ${spotTitle} 골든아워 필름 출사` : prev.title,
      location: spotTitle ? `${spotTitle} 인근 집결` : prev.location,
    }));
    setIsCreateOpen(true);
  }, []);

  const filteredMeetups = selectedCategory === 'all'
    ? meetups
    : meetups.filter((m) => m.category === selectedCategory);

  // 이미 참가 신청했거나 본인이 호스트인 티켓 확인
  const isUserJoined = (meetupId: string) => {
    return bookedExperiences.some((b) => b.experienceId === meetupId);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim() || !createForm.location.trim()) {
      showToast('모임 제목과 집결 장소를 입력해주세요.', 'warning');
      return;
    }

    playShutterSound('slr');
    createMeetup({
      category: createForm.category,
      title: createForm.title,
      hostName: createForm.hostName,
      hostRole: createForm.hostRole,
      hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      location: createForm.location,
      dateTime: createForm.dateTime,
      duration: createForm.duration,
      price: Number(createForm.price) || 0,
      maxAttendees: Number(createForm.maxAttendees) || 6,
      description: createForm.description || '편안하게 걸으며 서로의 사진을 남겨주는 캐주얼 필름 출사 모임입니다.',
      imageUrl: createForm.imageUrl,
      recommendedGear: createForm.recommendedGear,
      recommendedFilm: createForm.recommendedFilm,
      rentalPackageDiscount: '출사 참여자 카메라 렌탈 1만원 결합 할인',
      included: createForm.includedItems.split(',').map((s) => s.trim()).filter(Boolean),
      tags: ['DASI출사', '필름산책', createForm.category === 'flash_walk' ? '번개' : '정기'],
      isUserCreated: true,
    });

    setIsCreateOpen(false);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeetupForJoin) return;
    if (!joinForm.name.trim()) {
      showToast('신청자 성함을 입력해주세요.', 'warning');
      return;
    }

    playShutterSound('slr');
    const code = joinMeetup(selectedMeetupForJoin.id, {
      name: joinForm.name,
      camera: joinForm.withRental ? joinForm.selectedCamera : joinForm.camera || '개인 소장 필름 카메라',
      withRental: joinForm.withRental,
    });

    setIssuedTicketCode(code);
  };

  const sampleUploadPhotos = [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?auto=format&fit=crop&w=1000&q=80',
  ];

  const handleUploadRollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDetailMeetup) return;
    if (!rollForm.caption.trim()) {
      showToast('사진 롤의 한 줄 소개(캡션)를 입력해주세요.', 'warning');
      return;
    }

    playShutterSound('slr');
    const chosenPhoto = sampleUploadPhotos[rollForm.selectedSampleIndex] || sampleUploadPhotos[0];
    const secondPhoto = sampleUploadPhotos[(rollForm.selectedSampleIndex + 1) % sampleUploadPhotos.length];

    uploadPhotoRoll({
      meetupId: selectedDetailMeetup.id,
      meetupTitle: selectedDetailMeetup.title,
      photographerName: rollForm.authorName.trim() || '익명의 필름러',
      photographerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      imageUrl: chosenPhoto,
      photos: [chosenPhoto, secondPhoto],
      cameraModel: rollForm.cameraModel,
      filmType: rollForm.filmStock,
      labName: rollForm.labName,
      caption: rollForm.caption,
      rating: rollForm.rating,
      reviewText: rollForm.reviewText.trim() || '동료 필름러들과 좋은 풍경을 담을 수 있어 정말 뜻깊은 시간이었습니다.',
    });

    setIsUploadRollOpen(false);
    setDetailTab('photos');
    setRollForm({
      authorName: '',
      cameraModel: 'Olympus PEN EE-3',
      filmStock: 'Kodak Portra 400',
      labName: '을지로 망우삼림 (SP3000)',
      rating: 5,
      caption: '',
      reviewText: '',
      selectedSampleIndex: 0,
    });
  };

  const handleCopyChatLink = () => {
    navigator.clipboard.writeText('https://open.kakao.com/o/dasi_photowalk_2026');
    setIsCopiedChatLink(true);
    showToast('오픈채팅방 초대 링크가 클립보드에 복사되었습니다.', 'success');
    setTimeout(() => setIsCopiedChatLink(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <Suspense fallback={null}>
        <ExperienceQuerySync onOpenCreateWithSpot={handleOpenCreateWithSpot} />
      </Suspense>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-vintage-950 via-vintage-900 to-[#2A201B] text-white p-8 sm:p-12 shadow-2xl border border-vintage-800/80">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-terracotta/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-200 text-xs font-bold border border-white/15">
            <Compass className="w-3.5 h-3.5 text-amber-300" />
            <span>52주 필름 출사 클럽 & 주말 번개 놀이터</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            혼자 걷던 골목길에서,<br />
            함께 웃는 <span className="text-amber-300">52주 낭만 출사</span>로
          </h1>

          <p className="text-sm sm:text-base text-vintage-200 leading-relaxed max-w-2xl font-normal">
            원하는 스팟에서 언제든 번개 출사를 직접 열고(+300P), 동료 필름러들과 함께 참여(+150P)하세요.
            카메라가 없어도 괜찮습니다. 모임 참여자는 <strong>렌트투온 1만원 결합 할인</strong>과 <strong>신선 필름 당일 픽업</strong>, <strong>20% 제휴 현상소 혜택</strong>이 원클릭으로 이어집니다.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 text-vintage-950 font-bold hover:bg-amber-300 transition-all shadow-lg hover:shadow-amber-400/20 active:scale-95 text-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>내 출사 모임·번개 개설하기 (+300P)</span>
            </button>

            <Link
              href="/cabinet?tab=tickets"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/15 hover:bg-white/20 backdrop-blur-md text-white font-semibold transition-all border border-white/20 text-sm"
            >
              <Ticket className="w-4 h-4 text-amber-300" />
              <span>내 출사 티켓 보관함 ({bookedExperiences.length})</span>
              <ChevronRight className="w-4 h-4 text-vintage-300" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3대 핵심 뷰 전환 탭: [출사 모임] / [52주 캘린더] / [시즌 정기 크루] */}
      <div className="flex p-1.5 rounded-2xl bg-vintage-100 border border-vintage-200/80 gap-1.5 shadow-inner">
        <button
          onClick={() => setActiveView('meetups')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeView === 'meetups'
              ? 'bg-vintage-900 text-white shadow-md'
              : 'text-vintage-600 hover:text-vintage-900 hover:bg-white/60'
          }`}
        >
          <Flame className={`w-4 h-4 ${activeView === 'meetups' ? 'text-amber-300' : 'text-vintage-500'}`} />
          <span>주말 출사 모임·번개 ({meetups.length})</span>
        </button>

        <button
          onClick={() => setActiveView('calendar')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeView === 'calendar'
              ? 'bg-vintage-900 text-white shadow-md'
              : 'text-vintage-600 hover:text-vintage-900 hover:bg-white/60'
          }`}
        >
          <Calendar className={`w-4 h-4 ${activeView === 'calendar' ? 'text-amber-300' : 'text-vintage-500'}`} />
          <span>52주 아날로그 캘린더 ({weeklyPlans.length}주차)</span>
        </button>

        <button
          onClick={() => setActiveView('crews')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeView === 'crews'
              ? 'bg-vintage-900 text-white shadow-md'
              : 'text-vintage-600 hover:text-vintage-900 hover:bg-white/60'
          }`}
        >
          <Users className={`w-4 h-4 ${activeView === 'crews' ? 'text-amber-300' : 'text-vintage-500'}`} />
          <span>시즌 정기 크루 ({crews.length})</span>
        </button>
      </div>

      {/* VIEW 1: MEETUPS */}
      {activeView === 'meetups' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Categories & Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-vintage-200 pb-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: '전체 모임' },
                { id: 'flash_walk', label: '⚡ 즉석 번개 출사' },
                { id: 'golden_hour', label: '🌅 노을·골든아워' },
                { id: 'theme_walk', label: '🎞️ 테마 스트리트' },
                { id: 'master_class', label: '🔧 40년 명장 클래스' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as MeetupCategory | 'all')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-vintage-900 text-white shadow-xs'
                      : 'bg-vintage-100 text-vintage-600 hover:bg-vintage-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-vintage-500 font-medium shrink-0 flex items-center gap-2">
              <span>총 <strong className="text-terracotta">{filteredMeetups.length}개</strong> 모임 진행 중</span>
              <span className="text-vintage-300">|</span>
              <span className="text-emerald-700 font-semibold">내 참여/주최 {bookedExperiences.length}건</span>
            </div>
          </div>

          {/* Meetups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredMeetups.map((meetup) => {
          const isFull = meetup.currentAttendees >= meetup.maxAttendees;
          const seatsLeft = Math.max(0, meetup.maxAttendees - meetup.currentAttendees);
          const percentFilled = Math.min(100, Math.round((meetup.currentAttendees / meetup.maxAttendees) * 100));
          const hasJoined = isUserJoined(meetup.id);

          return (
            <div
              key={meetup.id}
              className="group bg-white rounded-2xl border border-vintage-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image & Badges */}
                <div
                  onClick={() => setSelectedDetailMeetup(meetup)}
                  className="relative h-56 w-full overflow-hidden bg-vintage-100 cursor-pointer"
                >
                  <img
                    src={meetup.imageUrl}
                    alt={meetup.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {meetup.category === 'flash_walk' && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500 text-vintage-950 text-xs font-bold flex items-center gap-1 shadow-xs">
                        <Flame className="w-3 h-3 fill-current" /> 즉석 번개
                      </span>
                    )}
                    {meetup.category === 'golden_hour' && (
                      <span className="px-2.5 py-1 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center gap-1 shadow-xs">
                        <Sparkles className="w-3 h-3" /> 골든아워
                      </span>
                    )}
                    {meetup.category === 'theme_walk' && (
                      <span className="px-2.5 py-1 rounded-full bg-vintage-800 text-amber-200 text-xs font-bold flex items-center gap-1 shadow-xs">
                        <Film className="w-3 h-3" /> 테마 워크
                      </span>
                    )}
                    {meetup.category === 'master_class' && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs">
                        <Award className="w-3 h-3" /> 명장 클래스
                      </span>
                    )}

                    {meetup.isUserCreated ? (
                      <span className="px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-vintage-900 text-2xs font-bold border border-vintage-200 shadow-2xs">
                        C2C 유저 주최
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-terracotta/90 backdrop-blur-xs text-white text-2xs font-bold">
                        DASI 공식
                      </span>
                    )}

                    {hasJoined && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-2xs font-bold flex items-center gap-1 shadow-xs">
                        <Check className="w-3 h-3" /> 참여 확정됨
                      </span>
                    )}
                  </div>

                  {/* Bottom Host Info inside Image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <img
                        src={meetup.hostAvatar}
                        alt={meetup.hostName}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
                        }}
                        className="w-8 h-8 rounded-full border border-white/60 object-cover"
                      />
                      <div>
                        <div className="text-xs font-bold leading-tight">{meetup.hostName}</div>
                        <div className="text-2xs text-vintage-300">{meetup.hostRole}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-amber-300">
                        {meetup.price === 0 ? '무료 참여' : `${meetup.price.toLocaleString()}원`}
                      </div>
                      {meetup.rentalPackageDiscount && (
                        <div className="text-3xs text-vintage-200 underline decoration-amber-300/40">
                          {meetup.rentalPackageDiscount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-4">
                  <div
                    onClick={() => setSelectedDetailMeetup(meetup)}
                    className="cursor-pointer"
                  >
                    <h3 className="font-serif text-lg font-bold text-vintage-900 leading-snug group-hover:text-terracotta transition-colors flex items-center justify-between gap-2">
                      <span>{meetup.title}</span>
                      <ChevronRight className="w-4 h-4 text-vintage-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </h3>
                    <p className="mt-1 text-xs text-vintage-600 line-clamp-2 leading-relaxed">
                      {meetup.description}
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-vintage-600 bg-vintage-50/70 p-3 rounded-xl border border-vintage-100">
                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar className="w-3.5 h-3.5 text-terracotta shrink-0" />
                      <span className="truncate">{meetup.dateTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-terracotta shrink-0" />
                      <span>{meetup.duration}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0" />
                      <span className="truncate font-medium text-vintage-800">{meetup.location}</span>
                    </div>
                  </div>

                  {/* Recommended Gear & Film Tags */}
                  {(meetup.recommendedGear || meetup.recommendedFilm) && (
                    <div className="flex flex-wrap gap-1.5 text-2xs">
                      {meetup.recommendedGear && (
                        <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200/60 flex items-center gap-1">
                          <Camera className="w-3 h-3 text-amber-700" />
                          <span>기종: {meetup.recommendedGear}</span>
                        </span>
                      )}
                      {meetup.recommendedFilm && (
                        <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200/60 flex items-center gap-1">
                          <Film className="w-3 h-3 text-emerald-700" />
                          <span>필름: {meetup.recommendedFilm}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Attendees Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-vintage-500 flex items-center gap-1 font-medium">
                        <Users className="w-3.5 h-3.5 text-vintage-400" />
                        참여 인원 ({meetup.currentAttendees}/{meetup.maxAttendees}명)
                      </span>
                      <span className={`font-bold ${isFull ? 'text-red-500' : 'text-terracotta'}`}>
                        {isFull ? '모집 마감' : `${seatsLeft}석 남음`}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-vintage-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          isFull ? 'bg-red-400' : percentFilled > 70 ? 'bg-amber-500' : 'bg-terracotta'
                        }`}
                        style={{ width: `${percentFilled}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-5 pt-0 space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedDetailMeetup(meetup)}
                    className="px-3.5 py-2.5 rounded-xl border border-vintage-300 text-vintage-700 hover:bg-vintage-100 font-semibold text-xs transition-colors"
                  >
                    상세보기
                  </button>

                  {hasJoined ? (
                    <Link
                      href="/cabinet?tab=tickets"
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <Ticket className="w-4 h-4 text-emerald-200" />
                      <span>내 모바일 티켓 확인</span>
                    </Link>
                  ) : (
                    <button
                      disabled={isFull}
                      onClick={() => {
                        setSelectedMeetupForJoin(meetup);
                        setIssuedTicketCode(null);
                        setJoinForm({
                          name: '',
                          phone: '',
                          camera: meetup.recommendedGear || '',
                          withRental: false,
                          selectedCamera: 'Olympus PEN EE-3 (하프 필름)',
                          withFilm: false,
                        });
                      }}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isFull
                          ? 'bg-vintage-200 text-vintage-400 cursor-not-allowed'
                          : 'bg-vintage-900 hover:bg-terracotta text-white shadow-xs hover:shadow-md active:scale-98'
                      }`}
                    >
                      {isFull ? (
                        <span>모집 마감</span>
                      ) : (
                        <>
                          <Ticket className="w-4 h-4 text-amber-300" />
                          <span>참여 신청하기 (+150P)</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Host Quick Actions */}
                {meetup.isUserCreated && (
                  <div className="flex items-center justify-between text-2xs text-vintage-500 pt-1 border-t border-vintage-100">
                    <span className="font-semibold text-amber-800">👑 내가 주최한 모임</span>
                    <div className="flex items-center gap-2">
                      {!isFull && (
                        <button
                          onClick={() => closeMeetup(meetup.id)}
                          className="text-vintage-600 hover:text-vintage-900 underline"
                        >
                          조기 마감
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm(`'${meetup.title}' 모임을 취소하시겠습니까?`)) {
                            cancelMeetup(meetup.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-700 underline"
                      >
                        모임 취소
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
          </div>
        </div>
      )}

      {/* VIEW 2: 52-WEEK CALENDAR */}
      {activeView === 'calendar' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Calendar Intro & Season Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-vintage-200 pb-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-vintage-900 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-terracotta" />
                <span>52주 아날로그 출사 캘린더 (연간 로드맵)</span>
              </h2>
              <p className="text-xs text-vintage-600 mt-1">
                계절의 빛과 날씨에 가장 어울리는 전국 감성 출사 스팟과 최적의 필름·카메라 매칭 큐레이션입니다.
              </p>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: '전체 (52주)' },
                { id: 'spring', label: '🌸 봄 (3~5월)' },
                { id: 'summer', label: '🌿 여름 (6~8월)' },
                { id: 'autumn', label: '🍂 가을 (9~11월)' },
                { id: 'winter', label: '❄️ 겨울 (12~2월)' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setCalendarSeasonFilter(s.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    calendarSeasonFilter === s.id
                      ? 'bg-vintage-900 text-white shadow-xs'
                      : 'bg-vintage-100 text-vintage-600 hover:bg-vintage-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Real-time Weekly Curation Highlight */}
          {aiCuratedPlan && (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-vintage-900 to-terracotta text-white p-6 sm:p-8 shadow-xl border border-vintage-700/50 space-y-4 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-300/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  AI 이번 주말 맞춤 큐레이션 (TourAPI 실시간 축제 연계)
                </span>
                <span className="text-xs text-vintage-300 font-mono">
                  WEEK {aiCuratedPlan.weekNumber} · {aiCuratedPlan.month}월 실시간
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-amber-100">
                  {aiCuratedPlan.theme}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-vintage-200">
                  <span className="flex items-center gap-1 text-amber-300 font-semibold">
                    <MapPin className="w-3.5 h-3.5" />
                    {aiCuratedPlan.spotName} ({aiCuratedPlan.region})
                  </span>
                  {aiCuratedPlan.festivalName && (
                    <span className="bg-white/10 px-2 py-0.5 rounded-full border border-white/20">
                      🏮 {aiCuratedPlan.festivalName}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-vintage-200 leading-relaxed max-w-3xl">
                {aiCuratedPlan.highlight}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/15">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
                    <Camera className="w-3.5 h-3.5 text-amber-300" />
                    <span className="text-vintage-300">추천 기종:</span>
                    <Link href="/rent" className="font-bold text-white hover:text-amber-300 underline">
                      {aiCuratedPlan.recommendedCamera}
                    </Link>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
                    <Film className="w-3.5 h-3.5 text-emerald-300" />
                    <span className="text-vintage-300">추천 필름:</span>
                    <Link href="/films" className="font-bold text-white hover:text-emerald-300 underline">
                      {aiCuratedPlan.recommendedFilm}
                    </Link>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenCreateWithSpot(aiCuratedPlan.spotName)}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-vintage-950 font-bold text-xs transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-vintage-950" />
                  이 코스로 출사 번개 열기
                </button>
              </div>
            </div>
          )}

          {/* Calendar Weekly Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(calendarSeasonFilter === 'all'
              ? weeklyPlans
              : weeklyPlans.filter((p) => p.season === calendarSeasonFilter)
            ).map((plan) => (
              <div
                key={plan.weekNumber}
                className="bg-white rounded-3xl border border-vintage-200/90 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-mono font-bold">
                      WEEK {plan.weekNumber}
                    </span>
                    <span className="text-2xs font-semibold text-vintage-500">
                      {plan.month}월 추천 테마
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-lg font-bold text-vintage-900 leading-snug">
                      {plan.theme}
                    </h3>
                    <div className="text-xs text-terracotta font-semibold mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{plan.spotName}</span>
                    </div>
                  </div>

                  <p className="text-xs text-vintage-600 leading-relaxed">
                    {plan.highlight}
                  </p>

                  <div className="p-3 rounded-xl bg-vintage-50 border border-vintage-100 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-vintage-700">
                      <Camera className="w-3.5 h-3.5 text-terracotta shrink-0" />
                      <span className="text-vintage-500">추천 기종:</span>
                      <Link href="/rent" className="font-semibold text-vintage-900 hover:text-terracotta underline">
                        {plan.recommendedCamera}
                      </Link>
                    </div>
                    <div className="flex items-center gap-1.5 text-vintage-700">
                      <Film className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="text-vintage-500">추천 필름:</span>
                      <Link href="/films" className="font-semibold text-vintage-900 hover:text-emerald-800 underline">
                        {plan.recommendedFilm}
                      </Link>
                    </div>
                  </div>

                  {plan.festivalName && (
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-2xs text-amber-900 flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span><strong>시즌 페스티벌:</strong> {plan.festivalName}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-vintage-100">
                  <button
                    onClick={() => handleOpenCreateWithSpot(plan.spotName)}
                    className="w-full py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
                    <span>이 코스로 번개 모임 개설하기 (+300P)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: SEASONAL CREWS */}
      {activeView === 'crews' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Crews Intro Banner */}
          <div className="rounded-3xl bg-linear-to-r from-vintage-900 via-vintage-800 to-terracotta/90 text-white p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
            <div className="space-y-2 max-w-2xl">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-vintage-950 text-xs font-bold">
                DASI 시즌 정기 크루 (Photo Crews)
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold">
                혼자가 아닌, 깊이 있게 기록하는 동료 필름러
              </h2>
              <p className="text-xs sm:text-sm text-vintage-200 leading-relaxed">
                격주 또는 월 단위로 정기 출사를 떠나며, 시즌 말 멤버들과 공동 필름 사진집 출판 및 전시에 참여할 수 있습니다.
                크루원에게는 <strong>DASI 카메라 렌탈 20% 상시 할인</strong> 혜택이 적용됩니다.
              </p>
            </div>
            <div className="text-xs bg-white/10 p-4 rounded-2xl border border-white/15 space-y-1 shrink-0">
              <div className="text-amber-300 font-bold">🎁 크루원 정기 혜택</div>
              <div>• 시즌 종료 후 공동 zine(사진집) 발간 지원</div>
              <div>• 매월 제휴 현상소 2롤 무료 스캔 쿠폰</div>
              <div>• 장인 수리실 1회 무상 오버홀 정기 점검권</div>
            </div>
          </div>

          {/* Crews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {crews.map((crew) => (
              <div
                key={crew.id}
                className="bg-white rounded-3xl border border-vintage-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-vintage-100">
                    <img
                      src={crew.coverImage}
                      alt={crew.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/20">
                        {crew.preferredGearTheme}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                        {crew.region}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h3 className="font-serif text-xl font-bold">{crew.name}</h3>
                      <p className="text-xs text-vintage-200">{crew.tagline}</p>
                    </div>
                  </div>

                  <div className="p-6 space-y-4 text-xs">
                    {/* Leader info */}
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-vintage-50 border border-vintage-100">
                      <img
                        src={crew.leaderAvatar}
                        alt={crew.leaderName}
                        className="w-10 h-10 rounded-full object-cover border border-vintage-200"
                      />
                      <div>
                        <div className="font-bold text-vintage-900 text-xs">크루장: {crew.leaderName}</div>
                        <div className="text-2xs text-vintage-500">{crew.preferredGearTheme}</div>
                      </div>
                    </div>

                    {/* Schedule and Spots */}
                    <div className="space-y-2 text-vintage-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-terracotta shrink-0" />
                        <span>정기 출사: <strong>{crew.schedule}</strong></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                        <span>활동 거점: <strong>{crew.region}</strong></span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {crew.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-vintage-100 text-vintage-700 text-2xs font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Capacity progress */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-2xs text-vintage-600">
                        <span>크루 정원</span>
                        <span><strong>{crew.membersCount}</strong> / {crew.maxMembers}명</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-vintage-100 overflow-hidden">
                        <div
                          className="h-full bg-terracotta rounded-full transition-all"
                          style={{ width: `${Math.min(100, (crew.membersCount / crew.maxMembers) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => {
                      playShutterSound('slr');
                      joinCrew(crew.id);
                    }}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                      crew.isJoined
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        : 'bg-terracotta hover:bg-terracotta-light text-white'
                    }`}
                  >
                    {crew.isJoined ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                        <span>✓ 크루원 활동 중 (클릭 시 탈퇴)</span>
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4" />
                        <span>정기 크루 합류 신청 (+100P)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3-Step Hobby Ecosystem Banner */}
      <div className="rounded-3xl border border-vintage-200 bg-white p-8 sm:p-10 shadow-xs space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vintage-100 text-vintage-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-terracotta" />
            <span>DASI 52주 취미 생태계 선순환</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-vintage-900">
            DASI 출사는 카메라가 없어도 괜찮습니다
          </h2>
          <p className="text-xs sm:text-sm text-vintage-600">
            모임 신청 한 번으로 명기 대여부터 신선 필름 수령, 제휴 현상소 스캔까지 매끄럽게 연결됩니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-5 rounded-2xl bg-vintage-50 border border-vintage-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div className="font-bold text-vintage-900 text-sm">1. 렌트투온 기종 대여 (1만원 결합 할인)</div>
            <p className="text-xs text-vintage-600 leading-relaxed">
              사고 싶었던 올림푸스 하프카메라나 롤라이35를 출사 기간 동안 부담 없이 빌려 쓰고, 마음에 들면 잔금만 내고 인수하세요.
            </p>
            <Link
              href="/cameras"
              className="inline-flex items-center gap-1 text-xs font-bold text-terracotta hover:underline pt-1"
            >
              <span>렌탈 카메라 둘러보기</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-vintage-50 border border-vintage-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <Film className="w-5 h-5" />
            </div>
            <div className="font-bold text-vintage-900 text-sm">2. 18°C 항온 냉장 필름 당일 픽업</div>
            <p className="text-xs text-vintage-600 leading-relaxed">
              유통기한과 보관 온도가 철저히 관리된 코닥 골드, 포트라, 일포드 흑백 필름을 모임 당일 픽업하거나 택배로 수령하세요.
            </p>
            <Link
              href="/films"
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:underline pt-1"
            >
              <span>신선 필름 라인업 보기</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-vintage-50 border border-vintage-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="font-bold text-vintage-900 text-sm">3. 출사 종료 후 제휴 현상소 20% 스캔</div>
            <p className="text-xs text-vintage-600 leading-relaxed">
              망우삼림, 충무로 고래사진관 등 DASI 제휴 현상소에 티켓 바우처를 제시하면 현상·고화질 스캔을 20% 할인받습니다.
            </p>
            <Link
              href="/studios"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline pt-1"
            >
              <span>전국 제휴 현상소 지도</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* MEETUP DETAIL MODAL */}
      {selectedDetailMeetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-vintage-200 relative my-8 animate-in fade-in zoom-in-95 duration-200 space-y-6">
            <button
              onClick={() => setSelectedDetailMeetup(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-vintage-400 hover:text-vintage-800 hover:bg-vintage-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Image */}
            <div className="relative h-64 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 rounded-t-3xl overflow-hidden">
              <img
                src={selectedDetailMeetup.imageUrl}
                alt={selectedDetailMeetup.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-vintage-950 text-xs font-bold">
                  {selectedDetailMeetup.category === 'flash_walk' ? '⚡ 즉석 번개' :
                   selectedDetailMeetup.category === 'golden_hour' ? '🌅 골든아워 노을' :
                   selectedDetailMeetup.category === 'theme_walk' ? '🎞️ 테마 워크' : '🔧 명장 클래스'}
                </span>
                <h3 className="font-serif text-2xl font-bold leading-snug">{selectedDetailMeetup.title}</h3>
                <p className="text-xs text-vintage-200 flex items-center gap-2">
                  <span>호스트: {selectedDetailMeetup.hostName}</span>
                  <span>•</span>
                  <span>{selectedDetailMeetup.hostRole}</span>
                </p>
              </div>
            </div>

            {/* Internal Modal Tabs */}
            {(() => {
              const currentRolls = photoRolls.filter((r) => r.meetupId === selectedDetailMeetup.id);
              const currentReviews = currentRolls.filter((r) => r.reviewText);

              return (
                <>
                  <div className="flex border-b border-vintage-200 gap-4 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setDetailTab('info')}
                      className={`pb-2.5 border-b-2 transition-all cursor-pointer ${
                        detailTab === 'info'
                          ? 'border-vintage-900 text-vintage-900'
                          : 'border-transparent text-vintage-400 hover:text-vintage-700'
                      }`}
                    >
                      📋 모임 안내
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailTab('photos')}
                      className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                        detailTab === 'photos'
                          ? 'border-terracotta text-terracotta'
                          : 'border-transparent text-vintage-400 hover:text-vintage-700'
                      }`}
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>📸 참가자 필름 롤</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-terracotta/10 text-terracotta text-[10px]">
                        {currentRolls.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailTab('reviews')}
                      className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                        detailTab === 'reviews'
                          ? 'border-emerald-700 text-emerald-800'
                          : 'border-transparent text-vintage-400 hover:text-vintage-700'
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>💬 생생 후기</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                        {currentReviews.length}
                      </span>
                    </button>
                  </div>

                  {/* TAB 1: INFO */}
                  {detailTab === 'info' && (
                    <div className="space-y-4 text-xs sm:text-sm animate-fadeIn">
                      <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-vintage-50 border border-vintage-100">
                        <div className="flex items-center gap-2 text-vintage-700">
                          <Calendar className="w-4 h-4 text-terracotta shrink-0" />
                          <span>일시: <strong>{selectedDetailMeetup.dateTime}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-vintage-700">
                          <Clock className="w-4 h-4 text-terracotta shrink-0" />
                          <span>소요 시간: <strong>{selectedDetailMeetup.duration}</strong></span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2 text-vintage-700">
                          <MapPin className="w-4 h-4 text-terracotta shrink-0" />
                          <span>집결 장소: <strong>{selectedDetailMeetup.location}</strong></span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="font-bold text-vintage-900 text-xs">출사 코스 및 모임 소개</div>
                        <p className="text-vintage-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                          {selectedDetailMeetup.description}
                        </p>
                      </div>

                      {/* Included Perks */}
                      {selectedDetailMeetup.included && selectedDetailMeetup.included.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="font-bold text-vintage-900 text-xs">포함 내역 및 혜택</div>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedDetailMeetup.included.map((inc: string, i: number) => (
                              <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-2xs font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>{inc}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommended Gear & Film */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        {selectedDetailMeetup.recommendedGear && (
                          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                            <span className="font-bold text-amber-900 text-2xs flex items-center gap-1">
                              <Camera className="w-3 h-3 text-amber-700" /> 추천 카메라 기종
                            </span>
                            <div className="text-xs text-vintage-800">{selectedDetailMeetup.recommendedGear}</div>
                          </div>
                        )}
                        {selectedDetailMeetup.recommendedFilm && (
                          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                            <span className="font-bold text-emerald-900 text-2xs flex items-center gap-1">
                              <Film className="w-3 h-3 text-emerald-700" /> 추천 필름
                            </span>
                            <div className="text-xs text-vintage-800">{selectedDetailMeetup.recommendedFilm}</div>
                          </div>
                        )}
                      </div>

                      {/* Attendees & Chat Notice */}
                      <div className="p-3.5 rounded-xl bg-vintage-100/60 border border-vintage-200/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-vintage-700">
                          <Users className="w-4 h-4 text-terracotta" />
                          <span>
                            참여 인원: <strong>{selectedDetailMeetup.currentAttendees} / {selectedDetailMeetup.maxAttendees}명</strong>
                          </span>
                        </div>
                        <div className="text-amber-800 font-bold text-xs flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>참여 확정 시 단톡방 링크 안내</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: PHOTO ROLLS ARCHIVE */}
                  {detailTab === 'photos' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            <span>출사 롤을 공유하고 150P를 받으세요!</span>
                          </div>
                          <p className="text-2xs text-vintage-600">
                            동료들과 함께 촬영한 필름 스캔본을 아카이빙할 수 있습니다.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setRollForm((prev) => ({
                              ...prev,
                              cameraModel: selectedDetailMeetup.recommendedGear?.split('또는')[0]?.trim() || prev.cameraModel,
                              filmStock: selectedDetailMeetup.recommendedFilm?.split('또는')[0]?.trim() || prev.filmStock,
                            }));
                            setIsUploadRollOpen(true);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-vintage-900 hover:bg-terracotta text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 text-amber-300" />
                          <span>내 롤 올리기 (+150P)</span>
                        </button>
                      </div>

                      {currentRolls.length === 0 ? (
                        <div className="text-center py-10 rounded-2xl border border-dashed border-vintage-200 p-6 space-y-2">
                          <Film className="w-8 h-8 text-vintage-300 mx-auto" />
                          <p className="text-xs font-semibold text-vintage-700">아직 등록된 출사 사진 롤이 없습니다.</p>
                          <p className="text-2xs text-vintage-400">첫 번째로 현상·스캔 사진 롤을 공유해 보세요!</p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                          {currentRolls.map((roll) => (
                            <div
                              key={roll.id}
                              className="p-4 rounded-2xl bg-vintage-50/80 border border-vintage-200/80 space-y-3"
                            >
                              {/* Roll Author & Rating */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={roll.photographerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                                    alt={roll.photographerName}
                                    className="w-7 h-7 rounded-full object-cover border border-vintage-200"
                                  />
                                  <div>
                                    <span className="font-bold text-vintage-900 text-xs">{roll.photographerName}</span>
                                    <span className="text-2xs text-vintage-400 ml-2 font-mono">{roll.createdAt}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3.5 h-3.5 ${
                                        i < (roll.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-vintage-200'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>

                              {/* Gear Tags */}
                              <div className="flex flex-wrap gap-1.5 text-2xs">
                                <Link
                                  href="/rent"
                                  className="px-2 py-0.5 rounded-md bg-white border border-vintage-200 text-vintage-800 font-semibold hover:border-terracotta hover:text-terracotta transition-colors flex items-center gap-1"
                                >
                                  <Camera className="w-3 h-3 text-terracotta" />
                                  <span>{roll.cameraModel} (렌탈)</span>
                                </Link>
                                <Link
                                  href="/films"
                                  className="px-2 py-0.5 rounded-md bg-white border border-vintage-200 text-emerald-800 font-semibold hover:border-emerald-500 transition-colors flex items-center gap-1"
                                >
                                  <Film className="w-3 h-3 text-emerald-600" />
                                  <span>{roll.filmType}</span>
                                </Link>
                                <Link
                                  href="/studios"
                                  className="px-2 py-0.5 rounded-md bg-white border border-vintage-200 text-vintage-700 font-medium hover:text-vintage-900 transition-colors"
                                >
                                  🧪 {roll.labName}
                                </Link>
                              </div>

                              {/* Photos Gallery */}
                              <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
                                {(roll.photos && roll.photos.length > 0 ? roll.photos : [roll.imageUrl]).map((p: string, idx: number) => (
                                  <div key={idx} className="relative h-40 bg-black/10 overflow-hidden group/pic">
                                    <img
                                      src={p}
                                      alt={`${roll.photographerName}-${idx}`}
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                                      }}
                                      className="w-full h-full object-cover group-hover/pic:scale-105 transition-transform duration-300"
                                    />
                                    <Link
                                      href="/frame"
                                      className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-bold opacity-0 group-hover/pic:opacity-100 transition-opacity flex items-center gap-1"
                                    >
                                      <Layers className="w-3 h-3 text-amber-300" />
                                      <span>프레임 입히기</span>
                                    </Link>
                                  </div>
                                ))}
                              </div>

                              {/* Caption */}
                              <p className="text-xs text-vintage-700 font-medium leading-relaxed">
                                {roll.caption}
                              </p>

                              {/* Roll Actions */}
                              <div className="flex items-center justify-between pt-1 border-t border-vintage-200/60 text-xs">
                                <button
                                  type="button"
                                  onClick={() => togglePhotoRollLike(roll.id)}
                                  className="flex items-center gap-1.5 text-vintage-600 hover:text-red-500 transition-colors font-medium cursor-pointer"
                                >
                                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                                  <span>좋아요 {roll.likesCount}</span>
                                </button>

                                <div className="flex items-center gap-2">
                                  <Link
                                    href="/frame"
                                    className="px-2.5 py-1 rounded-lg bg-vintage-100 hover:bg-vintage-200 text-vintage-800 text-2xs font-bold transition-colors"
                                  >
                                    🖼️ DASI 프레임 입히기
                                  </Link>
                                  <Link
                                    href="/rent"
                                    className="px-2.5 py-1 rounded-lg bg-terracotta/10 hover:bg-terracotta/20 text-terracotta text-2xs font-bold transition-colors"
                                  >
                                    📷 이 카메라 렌트투온
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: REVIEWS */}
                  {detailTab === 'reviews' && (
                    <div className="space-y-3 animate-fadeIn">
                      {currentReviews.length === 0 ? (
                        <div className="text-center py-10 rounded-2xl border border-dashed border-vintage-200 p-6 space-y-2">
                          <MessageCircle className="w-8 h-8 text-vintage-300 mx-auto" />
                          <p className="text-xs font-semibold text-vintage-700">아직 등록된 출사 후기가 없습니다.</p>
                          <p className="text-2xs text-vintage-400">참가자 필름 롤을 업로드하면서 후기를 함께 남겨주세요!</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                          {currentReviews.map((r) => (
                            <div
                              key={r.id}
                              className="p-4 rounded-2xl bg-vintage-50 border border-vintage-200/80 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={r.photographerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                                    alt={r.photographerName}
                                    className="w-7 h-7 rounded-full object-cover"
                                  />
                                  <span className="font-bold text-vintage-900 text-xs">{r.photographerName}</span>
                                </div>
                                <div className="flex items-center gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3.5 h-3.5 ${
                                        i < (r.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-vintage-200'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-vintage-700 leading-relaxed">
                                {r.reviewText}
                              </p>
                              <div className="text-2xs text-vintage-500 font-mono flex items-center justify-between pt-1">
                                <span>사용 기종: {r.cameraModel} • {r.filmType}</span>
                                <span>{r.createdAt}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              );
            })()}

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-vintage-100">
              <div>
                <span className="text-2xs text-vintage-400">참가비</span>
                <div className="text-lg font-bold text-terracotta">
                  {selectedDetailMeetup.price === 0 ? '무료 참여' : `${selectedDetailMeetup.price.toLocaleString()}원`}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedDetailMeetup(null)}
                  className="px-4 py-2.5 rounded-xl border border-vintage-300 text-vintage-700 font-semibold text-xs"
                >
                  닫기
                </button>

                {isUserJoined(selectedDetailMeetup.id) ? (
                  <Link
                    href="/cabinet?tab=tickets"
                    className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>내 티켓 보러가기</span>
                  </Link>
                ) : (
                  <button
                    disabled={selectedDetailMeetup.currentAttendees >= selectedDetailMeetup.maxAttendees}
                    onClick={() => {
                      const target = selectedDetailMeetup;
                      setSelectedDetailMeetup(null);
                      setSelectedMeetupForJoin(target);
                      setIssuedTicketCode(null);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-terracotta hover:bg-terracotta-light text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>이 모임 참여 신청하기 (+150P)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MEETUP MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-vintage-200 relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-vintage-400 hover:text-vintage-800 hover:bg-vintage-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>호스트 기여 보너스 +300P 지급</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-vintage-900">
                  새 출사 모임·주말 번개 개설하기
                </h3>
                <p className="text-xs text-vintage-600">
                  내가 아는 감성 골목과 골든아워 스팟을 동료 필름러들과 함께 걸어보세요.
                </p>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs sm:text-sm">
                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="font-bold text-vintage-800 text-xs">모임 유형 선택</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'flash_walk', label: '⚡ 즉석 번개' },
                      { id: 'golden_hour', label: '🌅 골든아워' },
                      { id: 'theme_walk', label: '🎞️ 테마 워크' },
                      { id: 'master_class', label: '🔧 장인 클래스' },
                    ].map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setCreateForm({ ...createForm, category: cat.id as MeetupCategory })}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                          createForm.category === cat.id
                            ? 'bg-vintage-900 text-white border-vintage-900 shadow-xs'
                            : 'bg-vintage-50 text-vintage-600 border-vintage-200 hover:bg-vintage-100'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <label className="font-bold text-vintage-800 text-xs">모임 제목 *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: [번개⚡] 성수동 붉은벽돌 골목 & 서울숲 일몰 출사"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-vintage-200 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none text-xs"
                  />
                </div>

                {/* Host Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-vintage-800 text-xs">호스트 닉네임 *</label>
                    <input
                      type="text"
                      required
                      value={createForm.hostName}
                      onChange={(e) => setCreateForm({ ...createForm, hostName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-vintage-200 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-vintage-800 text-xs">인스타그램 아이디 (선택)</label>
                    <input
                      type="text"
                      placeholder="@film_lover"
                      value={createForm.hostRole}
                      onChange={(e) => setCreateForm({ ...createForm, hostRole: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-vintage-200 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none text-xs"
                    />
                  </div>
                </div>

                {/* Location & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-vintage-800 text-xs">집결 장소 & 코스 *</label>
                    <input
                      type="text"
                      required
                      placeholder="예: 뚝섬역 8번 출구 앞 (서울숲 방면)"
                      value={createForm.location}
                      onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-vintage-200 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-vintage-800 text-xs">집결 일시 *</label>
                    <input
                      type="text"
                      required
                      value={createForm.dateTime}
                      onChange={(e) => setCreateForm({ ...createForm, dateTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-vintage-200 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none text-xs"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="font-bold text-vintage-800 text-xs">모임 소개 및 코스 브리핑</label>
                  <textarea
                    rows={2}
                    placeholder="출사 경로, 사진 찍기 좋은 스팟, 모임 분위기 등을 자유롭게 적어주세요."
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-vintage-200 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none text-xs"
                  />
                </div>

                {/* Capacity & Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-vintage-800 text-xs">모집 정원 (호스트 포함)</label>
                    <input
                      type="number"
                      min={2}
                      max={20}
                      value={createForm.maxAttendees}
                      onChange={(e) => setCreateForm({ ...createForm, maxAttendees: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 rounded-xl border border-vintage-200 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-vintage-800 text-xs">참가비 (0원 = 무료 번개)</label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={createForm.price}
                      onChange={(e) => setCreateForm({ ...createForm, price: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 rounded-xl border border-vintage-200 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none text-xs"
                    />
                  </div>
                </div>

                {/* Recommendations */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-vintage-800 text-xs">추천 카메라 기종</label>
                    <input
                      type="text"
                      value={createForm.recommendedGear}
                      onChange={(e) => setCreateForm({ ...createForm, recommendedGear: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-vintage-200 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-vintage-800 text-xs">추천 필름</label>
                    <input
                      type="text"
                      value={createForm.recommendedFilm}
                      onChange={(e) => setCreateForm({ ...createForm, recommendedFilm: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-vintage-200 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none text-xs"
                    />
                  </div>
                </div>

                {/* Host Benefit Banner */}
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    모임 개설 즉시 호스트 전용 <strong>QR 티켓이 마이 캐비닛에 보관</strong>되며, <strong>기여 포인트 +300P</strong>가 적립됩니다.
                  </span>
                </div>

                {/* Submit Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-vintage-300 text-vintage-700 font-semibold hover:bg-vintage-100 text-xs cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white font-bold transition-all shadow-md active:scale-95 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-amber-300" />
                    <span>출사 모임 등록하고 +300P 받기</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* JOIN MEETUP MODAL */}
      {selectedMeetupForJoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-vintage-200 relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setSelectedMeetupForJoin(null);
                setIssuedTicketCode(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-full text-vintage-400 hover:text-vintage-800 hover:bg-vintage-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {issuedTicketCode ? (
              /* Success / Ticket View */
              <div className="text-center py-4 space-y-5">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                    참여 보너스 +150P 지급 완료!
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-vintage-900">
                    출사 모임 신청이 완료되었습니다!
                  </h3>
                  <p className="text-xs text-vintage-600">
                    신청 내역과 디지털 QR 티켓이 마이 캐비닛에 보관되었습니다.
                  </p>
                </div>

                {/* Digital Ticket Card */}
                <div className="bg-vintage-50 p-5 rounded-2xl border border-vintage-200 text-left space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-vintage-200/80 pb-2">
                    <span className="text-xs font-bold text-terracotta">DASI PHOTO CLUB PASS</span>
                    <span className="font-mono text-xs font-bold text-vintage-600">{issuedTicketCode}</span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-serif text-sm font-bold text-vintage-900">{selectedMeetupForJoin.title}</h4>
                    <div className="text-xs text-vintage-600 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-vintage-400" />
                      <span>{selectedMeetupForJoin.dateTime}</span>
                    </div>
                    <div className="text-xs text-vintage-600 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-vintage-400" />
                      <span>{selectedMeetupForJoin.location}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-vintage-500 border-t border-vintage-200/80">
                    <span>호스트: {selectedMeetupForJoin.hostName}</span>
                    <span className="font-bold text-vintage-800">
                      {selectedMeetupForJoin.price === 0 ? '무료 번개' : `${selectedMeetupForJoin.price.toLocaleString()}원`}
                    </span>
                  </div>
                </div>

                {/* Open Chat Invite Box */}
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-amber-700" />
                      <span>출사 참여자 카카오톡 오픈채팅방</span>
                    </span>
                    <span className="text-2xs bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded font-semibold">
                      실시간 집결 안내
                    </span>
                  </div>
                  <p className="text-2xs text-vintage-600">
                    출사 당일 현장 집결 및 사진 공유를 위한 단톡방에 입장해 주세요.
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyChatLink}
                    className="w-full py-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-vintage-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {isCopiedChatLink ? <Check className="w-3.5 h-3.5 text-emerald-800" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopiedChatLink ? '단톡방 링크 복사 완료!' : '오픈채팅 참여 링크 복사하기'}</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <Link
                    href="/cabinet?tab=tickets"
                    className="flex-1 py-3 rounded-xl bg-terracotta text-white font-bold text-xs sm:text-sm hover:bg-terracotta-light transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>마이 캐비닛에서 티켓 보기</span>
                  </Link>
                  <button
                    onClick={() => {
                      setSelectedMeetupForJoin(null);
                      setIssuedTicketCode(null);
                    }}
                    className="px-5 py-3 rounded-xl border border-vintage-300 text-vintage-700 font-semibold text-xs sm:text-sm hover:bg-vintage-100 cursor-pointer"
                  >
                    닫기
                  </button>
                </div>
              </div>
            ) : (
              /* Join Form */
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-terracotta">출사 참여 신청</span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-vintage-900 leading-snug">
                    {selectedMeetupForJoin.title}
                  </h3>
                  <div className="mt-2 text-xs text-vintage-600 space-y-1 bg-vintage-50 p-3 rounded-xl border border-vintage-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-terracotta shrink-0" />
                      <span>{selectedMeetupForJoin.dateTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0" />
                      <span>{selectedMeetupForJoin.location}</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleJoinSubmit} className="space-y-4 text-xs sm:text-sm">
                  <div className="space-y-1">
                    <label className="font-bold text-vintage-800 text-xs">신청자 성함 / 닉네임 *</label>
                    <input
                      type="text"
                      required
                      placeholder="김필름"
                      value={joinForm.name}
                      onChange={(e) => setJoinForm({ ...joinForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-vintage-200 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-vintage-800 text-xs">연락처 (집결 SMS 안내용) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="010-0000-0000"
                      value={joinForm.phone}
                      onChange={(e) => setJoinForm({ ...joinForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-vintage-200 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none text-xs"
                    />
                  </div>

                  {/* Camera Option: Rent-to-Own Bundle */}
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={joinForm.withRental}
                        onChange={(e) => setJoinForm({ ...joinForm, withRental: e.target.checked })}
                        className="mt-0.5 rounded text-terracotta focus:ring-terracotta w-4 h-4"
                      />
                      <div className="space-y-0.5">
                        <div className="font-bold text-vintage-900 text-xs flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-terracotta" />
                          <span>📸 DASI 카메라 렌트투온 결합 할인 (10,000원 할인)</span>
                        </div>
                        <p className="text-2xs text-vintage-600">
                          아직 카메라가 없거나 다른 명기를 써보고 싶다면, 출사 모임 결합 특가로 대여해 드립니다.
                        </p>
                      </div>
                    </label>

                    {joinForm.withRental && (
                      <div className="pt-2 pl-6">
                        <label className="text-2xs font-bold text-vintage-700 block mb-1">
                          희망 렌탈 기종 선택
                        </label>
                        <select
                          value={joinForm.selectedCamera}
                          onChange={(e) => setJoinForm({ ...joinForm, selectedCamera: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-vintage-200 bg-white text-xs text-vintage-800"
                        >
                          <option value="Olympus PEN EE-3 (하프 필름)">Olympus PEN EE-3 (하프 필름 - 72장 촬영)</option>
                          <option value="Canon Canonet QL17 G-III">Canon Canonet QL17 G-III (RF 명기)</option>
                          <option value="Rollei 35">Rollei 35 (초소형 명품 바디)</option>
                          <option value="Nikon FM2">Nikon FM2 (기계식 SLR의 표준)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Film Option */}
                  <div className="p-3 rounded-xl bg-vintage-50 border border-vintage-200 space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={joinForm.withFilm}
                        onChange={(e) => setJoinForm({ ...joinForm, withFilm: e.target.checked })}
                        className="rounded text-terracotta focus:ring-terracotta w-3.5 h-3.5"
                      />
                      <span className="text-xs font-semibold text-vintage-800">
                        🎞️ 신선 필름 당일 현장 수령 (골든아워 번개 특가 15,000원)
                      </span>
                    </label>
                  </div>

                  {/* Summary & Price */}
                  <div className="pt-2 flex items-center justify-between border-t border-vintage-100">
                    <div>
                      <div className="text-2xs text-vintage-400">최종 참가비</div>
                      <div className="text-base font-bold text-terracotta">
                        {selectedMeetupForJoin.price === 0 ? '무료 참여' : `${selectedMeetupForJoin.price.toLocaleString()}원`}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedMeetupForJoin(null)}
                        className="px-4 py-2.5 rounded-xl border border-vintage-300 text-vintage-700 font-semibold text-xs cursor-pointer"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-terracotta text-white font-bold hover:bg-terracotta-light transition-all shadow-xs text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>신청 확정하기 (+150P)</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* UPLOAD PHOTO ROLL MODAL */}
      {isUploadRollOpen && selectedDetailMeetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-vintage-200 relative my-8 animate-in fade-in zoom-in-95 duration-200 space-y-5">
            <button
              onClick={() => setIsUploadRollOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-vintage-400 hover:text-vintage-800 hover:bg-vintage-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>필름 롤 아카이빙 보너스 +150P 지급</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-vintage-900">
                출사 필름 롤 & 후기 등록
              </h3>
              <p className="text-xs text-vintage-600">
                <strong>{selectedDetailMeetup.title}</strong> 출사에서 담은 소중한 빛과 색감을 동료들과 공유하세요.
              </p>
            </div>

            <form onSubmit={handleUploadRollSubmit} className="space-y-4 text-xs sm:text-sm">
              {/* Author & Rating */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-vintage-800 text-xs">작성자 닉네임 *</label>
                  <input
                    type="text"
                    required
                    placeholder="김필름러"
                    value={rollForm.authorName}
                    onChange={(e) => setRollForm({ ...rollForm, authorName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-vintage-200 focus:border-terracotta outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-vintage-800 text-xs">모임 만족도 (별점)</label>
                  <div className="flex items-center gap-1 py-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRollForm({ ...rollForm, rating: star })}
                        className="cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 transition-transform hover:scale-110 ${
                            star <= rollForm.rating ? 'text-amber-400 fill-amber-400' : 'text-vintage-200'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-vintage-700 ml-1.5">{rollForm.rating}점</span>
                  </div>
                </div>
              </div>

              {/* Gear selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-vintage-800 text-2xs">사용 카메라 바디 *</label>
                  <select
                    value={rollForm.cameraModel}
                    onChange={(e) => setRollForm({ ...rollForm, cameraModel: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-vintage-200 bg-white text-xs text-vintage-800"
                  >
                    <option value="Olympus PEN EE-3">Olympus PEN EE-3</option>
                    <option value="Canon Canonet QL17 G-III">Canon Canonet QL17</option>
                    <option value="Rollei 35">Rollei 35</option>
                    <option value="Nikon FM2">Nikon FM2</option>
                    <option value="Minolta X-700">Minolta X-700</option>
                    <option value="Leica M6">Leica M6</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-vintage-800 text-2xs">사용 필름 스톡 *</label>
                  <select
                    value={rollForm.filmStock}
                    onChange={(e) => setRollForm({ ...rollForm, filmStock: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-vintage-200 bg-white text-xs text-vintage-800"
                  >
                    <option value="Kodak Portra 400">Kodak Portra 400</option>
                    <option value="Kodak Gold 200">Kodak Gold 200</option>
                    <option value="Kodak UltraMax 400">Kodak UltraMax 400</option>
                    <option value="Fujicolor C200">Fujicolor C200</option>
                    <option value="Ilford HP5 Plus 400">Ilford HP5 Plus 400</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-vintage-800 text-2xs">스캔 현상소 *</label>
                  <select
                    value={rollForm.labName}
                    onChange={(e) => setRollForm({ ...rollForm, labName: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-vintage-200 bg-white text-xs text-vintage-800"
                  >
                    <option value="을지로 망우삼림 (SP3000)">을지로 망우삼림</option>
                    <option value="충무로 고래사진관 (Noritsu)">충무로 고래사진관</option>
                    <option value="성수 팔레트사진관">성수 팔레트사진관</option>
                    <option value="홍대 필름로그">홍대 필름로그</option>
                    <option value="자가 현상소 (Self Scan)">자가 현상/스캔</option>
                  </select>
                </div>
              </div>

              {/* Sample Photo Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-vintage-800 text-xs">
                  필름 스캔 컷 선택 (대표 2컷 아카이빙)
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {sampleUploadPhotos.map((url, idx) => (
                    <div
                      key={idx}
                      onClick={() => setRollForm({ ...rollForm, selectedSampleIndex: idx })}
                      className={`relative h-16 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                        rollForm.selectedSampleIndex === idx
                          ? 'border-terracotta ring-2 ring-terracotta/30 scale-105'
                          : 'border-vintage-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`sample-${idx}`} className="w-full h-full object-cover" />
                      {rollForm.selectedSampleIndex === idx && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-terracotta text-white flex items-center justify-center text-[9px] font-bold">
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div className="space-y-1">
                <label className="font-bold text-vintage-800 text-xs">필름 롤 한 줄 소개 (캡션) *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 늦은 오후 골목 어귀에서 만난 주황빛 햇살과 차분한 입자감"
                  value={rollForm.caption}
                  onChange={(e) => setRollForm({ ...rollForm, caption: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-vintage-200 focus:border-terracotta outline-none text-xs"
                />
              </div>

              {/* Review Text */}
              <div className="space-y-1">
                <label className="font-bold text-vintage-800 text-xs">출사 생생 후기 (선택)</label>
                <textarea
                  rows={2}
                  placeholder="모임의 분위기, 호스트님의 팁 코칭, 다른 참가자분들과의 교류 경험을 들려주세요."
                  value={rollForm.reviewText}
                  onChange={(e) => setRollForm({ ...rollForm, reviewText: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-vintage-200 focus:border-terracotta outline-none text-xs"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-vintage-100">
                <button
                  type="button"
                  onClick={() => setIsUploadRollOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-vintage-300 text-vintage-700 font-semibold text-xs cursor-pointer hover:bg-vintage-100"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-terracotta hover:bg-terracotta-light text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>필름 롤 아카이빙 등록 (+150P)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
