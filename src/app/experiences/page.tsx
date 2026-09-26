'use client';

import React, { useState, Suspense } from 'react';
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
  Building2
} from 'lucide-react';
import { useDasi } from '@/context/DasiContext';
import { playShutterSound } from '@/utils/shutterAudio';
import { PhotoMeetup, MeetupCategory } from '@/types';

// URL 파라미터 감지하여 모임 개설 모달 자동 오픈 (?action=create&spotTitle=...)
function ExperienceQuerySync({
  onOpenCreateWithSpot
}: {
  onOpenCreateWithSpot: (spotTitle?: string, type?: MeetupCategory) => void;
}) {
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const action = searchParams.get('action');
    const spotTitle = searchParams.get('spotTitle');
    const typeParam = searchParams.get('type') as MeetupCategory | null;

    if (action === 'create') {
      onOpenCreateWithSpot(spotTitle || undefined, typeParam || undefined);
    }
  }, [searchParams, onOpenCreateWithSpot]);

  return null;
}

export default function ExperiencesPage() {
  const { meetups, createMeetup, joinMeetup, showToast } = useDasi();

  const [selectedCategory, setSelectedCategory] = useState<MeetupCategory | 'all'>('all');
  const [selectedMeetup, setSelectedMeetup] = useState<PhotoMeetup | null>(null);

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
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [joinForm, setJoinForm] = useState({
    name: '',
    phone: '',
    camera: '',
    withRental: false,
    selectedCamera: 'Olympus PEN EE-3 (하프 필름)',
    withFilm: false,
  });
  const [issuedTicketCode, setIssuedTicketCode] = useState<string | null>(null);

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
    if (!selectedMeetup) return;
    if (!joinForm.name.trim()) {
      showToast('신청자 성함을 입력해주세요.', 'warning');
      return;
    }

    playShutterSound('slr');
    const code = joinMeetup(selectedMeetup.id, {
      name: joinForm.name,
      camera: joinForm.withRental ? joinForm.selectedCamera : joinForm.camera || '개인 소장 필름 카메라',
      withRental: joinForm.withRental,
    });

    setIssuedTicketCode(code);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <Suspense fallback={null}>
        <ExperienceQuerySync onOpenCreateWithSpot={handleOpenCreateWithSpot} />
      </Suspense>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-vintage-900 via-vintage-800 to-terracotta/90 text-white p-8 sm:p-12 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-terracotta/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-200 text-xs font-bold border border-white/15">
            <Compass className="w-3.5 h-3.5 text-amber-300" />
            <span>52주 필름 출사 클럽 &amp; 주말 번개 놀이터</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            혼자 걷던 골목길에서,<br />
            함께 웃는 <span className="text-amber-300">52주 낭만 출사</span>로
          </h1>

          <p className="text-sm sm:text-base text-vintage-100 leading-relaxed max-w-2xl font-normal">
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
              <span>내 출사 티켓 보관함</span>
              <ChevronRight className="w-4 h-4 text-vintage-300" />
            </Link>
          </div>
        </div>
      </div>

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

        <div className="text-xs text-vintage-500 font-medium shrink-0">
          총 <strong className="text-terracotta">{filteredMeetups.length}개</strong>의 출사 모임 진행 중
        </div>
      </div>

      {/* Meetups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredMeetups.map((meetup) => {
          const isFull = meetup.currentAttendees >= meetup.maxAttendees;
          const seatsLeft = Math.max(0, meetup.maxAttendees - meetup.currentAttendees);
          const percentFilled = Math.min(100, Math.round((meetup.currentAttendees / meetup.maxAttendees) * 100));

          return (
            <div
              key={meetup.id}
              className="group bg-white rounded-2xl border border-vintage-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative h-56 w-full overflow-hidden bg-vintage-100">
                  <img
                    src={meetup.imageUrl}
                    alt={meetup.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

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
                      <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-vintage-800 text-2xs font-bold border border-vintage-200">
                        C2C 유저 개설
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-terracotta/90 backdrop-blur-xs text-white text-2xs font-bold">
                        DASI 공식
                      </span>
                    )}
                  </div>

                  {/* Bottom Host Info inside Image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <img
                        src={meetup.hostAvatar}
                        alt={meetup.hostName}
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
                  <div>
                    <h3 className="font-serif text-lg font-bold text-vintage-900 leading-snug group-hover:text-terracotta transition-colors">
                      {meetup.title}
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
                          <span>추천 기종: {meetup.recommendedGear}</span>
                        </span>
                      )}
                      {meetup.recommendedFilm && (
                        <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200/60 flex items-center gap-1">
                          <Film className="w-3 h-3 text-emerald-700" />
                          <span>추천 필름: {meetup.recommendedFilm}</span>
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
              <div className="p-5 pt-0">
                <button
                  disabled={isFull}
                  onClick={() => {
                    setSelectedMeetup(meetup);
                    setIssuedTicketCode(null);
                    setJoinForm({
                      name: '',
                      phone: '',
                      camera: meetup.recommendedGear || '',
                      withRental: false,
                      selectedCamera: 'Olympus PEN EE-3 (하프 필름)',
                      withFilm: false,
                    });
                    setIsJoinOpen(true);
                  }}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isFull
                      ? 'bg-vintage-200 text-vintage-400 cursor-not-allowed'
                      : 'bg-vintage-900 hover:bg-terracotta text-white shadow-xs hover:shadow-md active:scale-98'
                  }`}
                >
                  {isFull ? (
                    <span>모집이 마감되었습니다</span>
                  ) : (
                    <>
                      <Ticket className="w-4 h-4 text-amber-300" />
                      <span>모임 참여 신청하기 (+150P)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

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
                    <label className="font-bold text-vintage-800 text-xs">집결 장소 &amp; 코스 *</label>
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
                    <label className="font-bold text-vintage-800 text-xs">모임 정원 (호스트 포함)</label>
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
      {isJoinOpen && selectedMeetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-vintage-200 relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setIsJoinOpen(false);
                setSelectedMeetup(null);
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
                    <h4 className="font-serif text-sm font-bold text-vintage-900">{selectedMeetup.title}</h4>
                    <div className="text-xs text-vintage-600 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-vintage-400" />
                      <span>{selectedMeetup.dateTime}</span>
                    </div>
                    <div className="text-xs text-vintage-600 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-vintage-400" />
                      <span>{selectedMeetup.location}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-vintage-500 border-t border-vintage-200/80">
                    <span>호스트: {selectedMeetup.hostName}</span>
                    <span className="font-bold text-vintage-800">
                      {selectedMeetup.price === 0 ? '무료 번개' : `${selectedMeetup.price.toLocaleString()}원`}
                    </span>
                  </div>
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
                      setIsJoinOpen(false);
                      setSelectedMeetup(null);
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
                    {selectedMeetup.title}
                  </h3>
                  <div className="mt-2 text-xs text-vintage-600 space-y-1 bg-vintage-50 p-3 rounded-xl border border-vintage-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-terracotta shrink-0" />
                      <span>{selectedMeetup.dateTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0" />
                      <span>{selectedMeetup.location}</span>
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
                        {selectedMeetup.price === 0 ? '무료 참여' : `${selectedMeetup.price.toLocaleString()}원`}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsJoinOpen(false)}
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
    </div>
  );
}
