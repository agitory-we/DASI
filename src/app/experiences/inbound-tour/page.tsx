'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Globe,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Camera,
  CheckCircle2,
  Package,
  Plane,
  Building,
  ChevronRight,
  Sun,
  ShieldCheck,
  Check,
  Languages
} from 'lucide-react';
import { playShutterSound } from '@/utils/shutterAudio';
import { useDasi } from '@/context/DasiContext';

type Lang = 'ko' | 'en' | 'ja';

interface TourCourse {
  id: string;
  title: Record<Lang, string>;
  sub: Record<Lang, string>;
  desc: Record<Lang, string>;
  duration: string;
  timeSlot: string;
  location: string;
  imageUrl: string;
}

const COURSES: TourCourse[] = [
  {
    id: 'euljiro-sunset',
    title: {
      ko: '을지로 1980s 인쇄골목 & 철공소 선셋 워크',
      en: 'Euljiro 1980s Alley & Ironworks Sunset Walk',
      ja: '乙支路 1980年代の印刷横丁＆鉄工所サンセットウォーク'
    },
    sub: {
      ko: '장인들의 숨결과 골든아워가 빚어내는 가장 묵직한 서울의 색채',
      en: 'Heavy, nostalgic Seoul colors crafted by master craftsmen and golden hour light',
      ja: '職人たちの息吹とゴールデンアワーが織りなす重厚なソウルの色彩'
    },
    desc: {
      ko: '40년간 이어져 온 세운상가와 을지로 골목길을 현지 전문 포토그래퍼와 함께 거닐며, 붉게 물드는 골든아워 철공소의 실루엣을 아날로그 필름에 담습니다.',
      en: 'Stroll through 40-year-old Euljiro alleys with a bilingual photographer guide and capture glowing sunset silhouettes on 35mm film.',
      ja: '40年の歴史を持つ乙支路の路地をバイリンガルガイドと共に散策し、夕暮れに染まるシルエットを35mmフィルムに収めます。'
    },
    duration: '2.5 Hours',
    timeSlot: '16:30 ~ 19:00 (Sunset)',
    location: 'Euljiro 3-ga, Seoul',
    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'seongsu-brick',
    title: {
      ko: '성수 붉은벽돌 아틀리에 & 인더스트리얼 힙',
      en: 'Seongsu Red Brick Atelier & Industrial Hip Route',
      ja: '聖水 赤レンガアトリエ＆インダストリアル・ヒップルート'
    },
    sub: {
      ko: '과거 구두 공장과 현대 K-패션이 공존하는 트렌드의 성지',
      en: 'Where shoe factory heritage meets contemporary K-fashion culture',
      ja: '製靴工場の遺産と現代のK-ファッションが交差するトレンドの聖地'
    },
    desc: {
      ko: '성수동 연무장길의 유서 깊은 붉은 벽돌 창고들과 트렌디한 팝업 스토어의 대비를 자동 필름 카메라(오토보이)의 경쾌한 셔터로 기록합니다.',
      en: 'Document the contrast between historic brick warehouses and trendy pop-ups with an easy-to-use Canon Autoboy compact camera.',
      ja: '歴史ある赤レンガ倉庫とトレンディなショップのコントラストを、使いやすいオートボーイで軽快に記録します。'
    },
    duration: '2.0 Hours',
    timeSlot: '14:00 ~ 16:00',
    location: 'Seongsu-dong, Seoul',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'jeongdong-palace',
    title: {
      ko: '정동 덕수궁 돌담길 & 근대 역사 헤리티지',
      en: 'Jeongdong Deoksugung Stone Wall & Modern History Route',
      ja: '貞洞 徳寿宮石垣道＆近代歴史ヘリテージルート'
    },
    sub: {
      ko: '고즈넉한 고궁의 담장과 가을 은행나무 그림자의 클래식',
      en: 'Classic Korean palace walls and peaceful afternoon tree silhouettes',
      ja: '静寂な宮殿の石垣と穏やかな午後の木漏れ日を愛でるクラシックコース'
    },
    desc: {
      ko: '대한제국의 역사가 숨 쉬는 정동길과 덕수궁 돌담을 따라 흑백 필름(Ilford HP5)으로 시간의 깊이를 흑백 계조로 포착하는 명상 투어.',
      en: 'Capture timeless black-and-white tonal depth along the iconic stone wall with classic Ilford HP5 400 film.',
      ja: '有名な石垣道沿いで、名門イルフォードHP5モノクロフィルムを使って時間の深みを記録する瞑想的ツアー。'
    },
    duration: '2.0 Hours',
    timeSlot: '10:30 ~ 12:30',
    location: 'Jeongdong, Seoul',
    imageUrl: 'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?auto=format&fit=crop&w=1000&q=80'
  }
];

export default function InboundTourPage() {
  const { showToast } = useDasi();
  const [lang, setLang] = useState<Lang>('ko');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('euljiro-sunset');
  const [pickupOption, setPickupOption] = useState<'hotel' | 'airport' | 'shop'>('hotel');
  const [cameraChoice, setCameraChoice] = useState<'fm2' | 'autoboy'>('fm2');

  const [travelerName, setTravelerName] = useState('');
  const [travelerContact, setTravelerContact] = useState('');
  const [pickupDetail, setPickupDetail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  const currentCourse = COURSES.find((c) => c.id === selectedCourseId) || COURSES[0];

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!travelerName || !travelerContact) {
      showToast(
        lang === 'ko'
          ? '예약자 성함과 연락처를 입력해주세요.'
          : lang === 'en'
          ? 'Please enter your name and contact info.'
          : 'お名前とご連絡先を入力してください。',
        'warning'
      );
      return;
    }

    setIsSubmitting(true);
    playShutterSound('slr');

    setTimeout(() => {
      const ref = `K-TOUR-${Math.floor(10000 + Math.random() * 90000)}`;
      setBookingRef(ref);
      setIsSubmitting(false);
      setIsBooked(true);
      showToast(
        lang === 'ko'
          ? '🇰🇷 K-헤리티지 포토 투어 예약이 완료되었습니다!'
          : lang === 'en'
          ? '🇰🇷 K-Heritage Photo Tour successfully booked!'
          : '🇰🇷 K-フォトツアーのご予約が完了しました！',
        'success'
      );
    }, 700);
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-amber-500 selection:text-stone-950">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Navigation & Language Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
            <Link href="/" className="hover:text-amber-400 transition-colors">DASI</Link>
            <ChevronRight className="w-3 h-3 text-stone-600" />
            <Link href="/experiences" className="hover:text-amber-400 transition-colors">EXPERIENCES</Link>
            <ChevronRight className="w-3 h-3 text-stone-600" />
            <span className="text-amber-500 font-semibold">K-HERITAGE TOUR</span>
          </div>

          {/* Lang Selector Pill */}
          <div className="inline-flex items-center gap-1 p-1 bg-stone-950 border border-stone-800 rounded-xl text-xs font-mono">
            <Languages className="w-3.5 h-3.5 text-stone-400 ml-2" />
            {(['ko', 'en', 'ja'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => {
                  setLang(l);
                  playShutterSound('compact');
                }}
                className={`px-3 py-1 rounded-lg uppercase font-bold transition-all ${
                  lang === l
                    ? 'bg-amber-500 text-stone-950'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/70 border border-rose-600/30 text-rose-400 text-xs font-mono">
            <Globe className="w-3.5 h-3.5" />
            <span>CMO INBOUND EXPRESS · K-컬처 골든아워 필름 워크</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-stone-50">
            {lang === 'ko' && 'K-헤리티지 아날로그 포토길드'}
            {lang === 'en' && 'K-Heritage Analog Photo Guild'}
            {lang === 'ja' && 'K-ヘリテージ アナログフォトギルド'}
          </h1>
          <p className="text-sm sm:text-base text-stone-400 max-w-2xl mx-auto leading-relaxed">
            {lang === 'ko' && '방한 외국인과 MZ 세대를 위한 원스톱 필름 카메라 투어. 호텔 수령부터 충무로 당일 디지털 스캔본 전송까지 서울의 가장 진실된 골목을 기록하세요.'}
            {lang === 'en' && 'The premium all-in-one film photography tour in Seoul. From hotel front desk delivery to same-day digital scans before your departure.'}
            {lang === 'ja' && '訪韓旅行者のためのプレミアム・フィルムカメラツアー。ホテル受取から当日デジタルスキャン送信まで、ソウルの最も深い路地を記録します。'}
          </p>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COURSES.map((course) => (
            <div
              key={course.id}
              onClick={() => {
                setSelectedCourseId(course.id);
                playShutterSound('compact');
              }}
              className={`rounded-2xl border-2 overflow-hidden cursor-pointer transition-all flex flex-col justify-between group ${
                selectedCourseId === course.id
                  ? 'border-amber-500 bg-stone-950 shadow-2xl shadow-amber-950/50 scale-[1.02]'
                  : 'border-stone-800 bg-stone-950/60 opacity-80 hover:opacity-100 hover:border-stone-700'
              }`}
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={course.imageUrl}
                    alt={course.title[lang]}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-[10px] font-mono text-amber-400 border border-stone-700 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-1 text-[11px] font-mono text-stone-400">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span>{course.location}</span>
                  </div>
                  <h3 className="font-bold font-serif text-stone-100 text-base leading-snug">
                    {course.title[lang]}
                  </h3>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    {course.desc[lang]}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="border-t border-stone-800/80 pt-3 flex items-center justify-between text-xs font-mono">
                  <span className="text-stone-400">{course.timeSlot}</span>
                  <span className={`font-bold ${selectedCourseId === course.id ? 'text-amber-400' : 'text-stone-500'}`}>
                    {selectedCourseId === course.id ? '✓ 선택됨' : '선택하기'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* All-in-One Tin Case Kit Showcase */}
        <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 mb-1">
                <Package className="w-3.5 h-3.5" />
                <span>INCLUDED ALL-IN-ONE HERITAGE TIN CASE</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-100">
                {lang === 'ko' && '투어에 포함된 올인원 헤리티지 키트'}
                {lang === 'en' && 'What is in your Heritage Tin Case?'}
                {lang === 'ja' && 'ツアーに含まれるヘリテージ・ティンケース'}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-amber-400">129,000</span>
              <span className="text-xs text-stone-400"> KRW (All-inclusive)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: '클래식 카메라 대여 1일',
                sub: cameraChoice === 'fm2' ? 'Nikon FM2 수동 명기' : 'Canon Autoboy 자동 컴팩트',
                icon: Camera
              },
              {
                title: '필름 2롤 증정',
                sub: '컬러 1롤(코닥 골드) + 흑백 1롤(일포드)',
                icon: Sparkles
              },
              {
                title: '당일 충무로 고화질 스캔',
                sub: '촬영 당일 밤 클라우드 링크 즉시 전송',
                icon: Sun
              },
              {
                title: '호텔/공항 안심 수령 & 반납',
                sub: '서울 전역 투숙 호텔 프론트 배송 지원',
                icon: Building
              }
            ].map((k, i) => (
              <div key={i} className="bg-stone-900/60 border border-stone-800 rounded-xl p-4 space-y-2">
                <k.icon className="w-5 h-5 text-amber-400" />
                <div className="font-bold text-xs text-stone-200">{k.title}</div>
                <div className="text-[11px] text-stone-500 leading-tight">{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Customization Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-800">
            {/* Camera Model Select */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-stone-400">선호 카메라 기종 선택</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCameraChoice('fm2')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    cameraChoice === 'fm2'
                      ? 'border-amber-500 bg-amber-950/20 text-stone-100'
                      : 'border-stone-800 bg-stone-900 text-stone-400'
                  }`}
                >
                  <div className="font-bold text-xs">Nikon FM2 (SLR 수동)</div>
                  <div className="text-[10px] text-stone-500 mt-1">셔터 손맛 & 조리개 제어</div>
                </button>
                <button
                  onClick={() => setCameraChoice('autoboy')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    cameraChoice === 'autoboy'
                      ? 'border-amber-500 bg-amber-950/20 text-stone-100'
                      : 'border-stone-800 bg-stone-900 text-stone-400'
                  }`}
                >
                  <div className="font-bold text-xs">Canon Autoboy (자동)</div>
                  <div className="text-[10px] text-stone-500 mt-1">누구나 쉬운 포인트앤슛</div>
                </button>
              </div>
            </div>

            {/* Pickup Location Select */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-stone-400">틴케이스 수령 방식</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'hotel' as const, label: '투숙 호텔', sub: '프론트 데스크' },
                  { id: 'airport' as const, label: '인천공항', sub: 'T1/T2 카운터' },
                  { id: 'shop' as const, label: '을지로 본점', sub: '충무로 명장실' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPickupOption(item.id)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      pickupOption === item.id
                        ? 'border-amber-500 bg-amber-950/20 text-stone-100'
                        : 'border-stone-800 bg-stone-900 text-stone-400'
                    }`}
                  >
                    <div className="font-bold text-xs">{item.label}</div>
                    <div className="text-[10px] text-stone-500 mt-0.5">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6 sm:p-10 shadow-2xl max-w-xl mx-auto">
          {isBooked ? (
            <div className="text-center space-y-4 animate-in zoom-in-95 duration-500">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400">
                <Check className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold font-serif text-stone-100">
                {lang === 'ko' && 'K-포토길드 투어 예약이 완료되었습니다!'}
                {lang === 'en' && 'Booking Successfully Confirmed!'}
                {lang === 'ja' && 'ツアーのご予約が完了しました！'}
              </h3>
              <div className="text-xs font-mono text-amber-400">BOOKING REF: {bookingRef}</div>
              <p className="text-xs text-stone-400 leading-relaxed">
                <strong>{travelerName}</strong> 님, 등록하신 연락처(<strong>{travelerContact}</strong>)로
                안내 카카오톡 및 영문 바우처가 발송되었습니다.
              </p>
              <button
                onClick={() => setIsBooked(false)}
                className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-mono text-stone-300"
              >
                다른 코스 둘러보기
              </button>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-4">
              <div className="text-center space-y-1 mb-6">
                <h3 className="text-lg font-bold font-serif text-stone-100">
                  {lang === 'ko' && '투어 및 키트 예약하기'}
                  {lang === 'en' && 'Reserve Your Heritage Tour'}
                  {lang === 'ja' && 'ツアー＆キットのご予約'}
                </h3>
                <div className="text-xs text-amber-400 font-mono">
                  선택 코스: {currentCourse.title[lang]}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-stone-400 mb-1">
                  {lang === 'ko' ? '예약자 영문/국문 성함' : 'Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={travelerName}
                  onChange={(e) => setTravelerName(e.target.value)}
                  placeholder="John Doe / 홍길동"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 focus:border-amber-500 focus:outline-none text-sm text-stone-100 placeholder-stone-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-stone-400 mb-1">
                  {lang === 'ko' ? '연락처 (모바일 / WhatsApp)' : 'Phone or WhatsApp'}
                </label>
                <input
                  type="text"
                  required
                  value={travelerContact}
                  onChange={(e) => setTravelerContact(e.target.value)}
                  placeholder="+82 10-1234-5678 or WhatsApp ID"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 focus:border-amber-500 focus:outline-none text-sm text-stone-100 placeholder-stone-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-stone-400 mb-1">
                  {pickupOption === 'hotel'
                    ? (lang === 'ko' ? '투숙 호텔 이름 및 객실 번호' : 'Hotel Name & Room (Optional)')
                    : pickupOption === 'airport'
                    ? (lang === 'ko' ? '도착 항공편 및 터미널' : 'Flight Number & Terminal')
                    : (lang === 'ko' ? '방문 희망 시각' : 'Expected Visit Time')}
                </label>
                <input
                  type="text"
                  value={pickupDetail}
                  onChange={(e) => setPickupDetail(e.target.value)}
                  placeholder="예: Lotte Hotel Myeongdong / KE012"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 focus:border-amber-500 focus:outline-none text-sm text-stone-100 placeholder-stone-600"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-lg shadow-amber-950/40 transition-all flex items-center justify-center gap-2 active:scale-[0.99] mt-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>
                      {lang === 'ko' && '129,000원으로 올인원 투어 예약 확정하기'}
                      {lang === 'en' && 'Confirm Booking (129,000 KRW)'}
                      {lang === 'ja' && '129,000ウォンで予約を確定する'}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
