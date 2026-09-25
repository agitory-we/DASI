'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Store,
  QrCode,
  Package,
  Clock,
  Wrench,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  Check,
  Search,
  ChevronRight,
  ShieldCheck,
  Coins,
  Sparkles,
  ArrowUpRight,
  Eye,
  Camera,
  Download,
  X
} from 'lucide-react';
import { useDasi } from '@/context/DasiContext';
import { useAuth } from '@/context/AuthContext';
import { playShutterSound } from '@/utils/shutterAudio';
import { sendLocalNotification } from '@/utils/webPush';
import { useDevicePlatform } from '@/hooks/useDevicePlatform';

// 현상소 파트너 초기 재고 데이터
interface FilmStock {
  id: string;
  name: string;
  brand: string;
  iso: number;
  count: number;
  price: number;
  isSoldOut: boolean;
}

const INITIAL_FILM_STOCKS: FilmStock[] = [
  { id: 'f-1', name: 'Kodak Gold 200 (36exp)', brand: 'Kodak', iso: 200, count: 14, price: 16500, isSoldOut: false },
  { id: 'f-2', name: 'Kodak UltraMax 400 (36exp)', brand: 'Kodak', iso: 400, count: 8, price: 17500, isSoldOut: false },
  { id: 'f-3', name: 'Fujifilm 200 (36exp)', brand: 'Fujifilm', iso: 200, count: 5, price: 15500, isSoldOut: false },
  { id: 'f-4', name: 'Kodak Portra 400 (36exp)', brand: 'Kodak', iso: 400, count: 0, price: 24000, isSoldOut: true },
  { id: 'f-5', name: 'Ilford HP5 Plus 400 (흑백)', brand: 'Ilford', iso: 400, count: 6, price: 14000, isSoldOut: false },
];

export default function PartnerDashboardPage() {
  const { showToast, redeemCouponByCode } = useDasi();
  const { user, profile, awardPoints } = useAuth();
  const { triggerHaptic } = useDevicePlatform();

  // 상점 선택
  const [partnerType, setPartnerType] = useState<'lab' | 'repair'>('lab');
  const [selectedPartnerId, setSelectedPartnerId] = useState('spot-1'); // 망우삼림 기본

  // 1초 QR 접수 코드 검증
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [isCameraScanning, setIsCameraScanning] = useState(false);
  const videoScannerRef = useRef<HTMLVideoElement>(null);

  const [verifiedDrop, setVerifiedDrop] = useState<{
    code: string;
    customerName: string;
    scannerType: string;
    rollCount: number;
    filmType: string;
    timestamp: string;
    status: 'pending' | 'accepted' | 'completed';
  } | null>(null);

  // 실시간 필름 재고 상태
  const [filmStocks, setFilmStocks] = useState<FilmStock[]>(INITIAL_FILM_STOCKS);

  // 당일 스캔 마감 스위치
  const [isScanAccepting, setIsScanAccepting] = useState(true);
  const [cutoffTime, setCutoffTime] = useState('17:30');

  // 사진관 20% 제휴 할인 QR 검증 상태 & 핸들러
  const [studioCodeInput, setStudioCodeInput] = useState('');
  const [studioRedeemResult, setStudioRedeemResult] = useState<{
    success: boolean;
    coupon?: any;
    message: string;
    redeemedAt?: string;
  } | null>(null);
  const [studioHistory, setStudioHistory] = useState<Array<{ code: string; title: string; time: string; discountAmt: number }>>([
    { code: 'GOHALE-DASI-SCAN', title: '종로 고래사진관 20% 할인', time: '11:42', discountAmt: 3000 },
    { code: 'ILJIN-DASI-20', title: '충무로 일진사 제휴 20% 할인', time: '10:15', discountAmt: 4000 },
  ]);

  const handleVerifyStudioCoupon = (codeToVerify?: string) => {
    const code = (codeToVerify || studioCodeInput).trim().toUpperCase();
    if (!code) {
      showToast('쿠폰 코드를 입력해주세요.', 'warning');
      return;
    }
    triggerHaptic('selection');
    playShutterSound('slr');
    const result = redeemCouponByCode(code);
    const nowTime = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    if (result.success) {
      setStudioRedeemResult({
        ...result,
        redeemedAt: nowTime,
      });
      setStudioHistory(prev => [
        {
          code,
          title: result.coupon?.title || '제휴 20% 즉시 할인',
          time: nowTime,
          discountAmt: 4000,
        },
        ...prev,
      ]);
      setStudioCodeInput('');
      triggerHaptic('success');
    } else {
      setStudioRedeemResult({
        ...result,
        redeemedAt: nowTime,
      });
      triggerHaptic('warning');
    }
  };

  // 수리 명장 케이스 등록 상태
  const [repairCase, setRepairCase] = useState({
    model: '',
    symptom: '',
    solution: '',
    cost: '',
    durationDays: '3',
  });
  const [repairCaseSuccess, setRepairCaseSuccess] = useState(false);

  // 어르신 사장님 전용 큰글씨 간편 POS 모드 (모바일 기본 활성화)
  const [isSeniorEasyMode, setIsSeniorEasyMode] = useState(true);

  // 스마트폰 카메라 스캐너 시작
  const handleStartCameraScan = async () => {
    setIsCameraScanning(true);
    triggerHaptic('medium');
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoScannerRef.current) {
          videoScannerRef.current.srcObject = stream;
          videoScannerRef.current.play();
        }
      }
    } catch {
      // 카메라 권한 거부 시 모달 내 안내
    }
  };

  const handleStopCameraScan = () => {
    triggerHaptic('selection');
    if (videoScannerRef.current && videoScannerRef.current.srcObject) {
      const stream = videoScannerRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsCameraScanning(false);
  };

  const handleSimulateScanFound = (code: string = 'DASI-LAB-8921') => {
    triggerHaptic('success');
    playShutterSound('slr');
    setQrCodeInput(code);
    handleStopCameraScan();
    setVerifiedDrop({
      code,
      customerName: '김민수 (필름러)',
      scannerType: '후지 프론티어 SP3000 (따뜻한 인물톤)',
      rollCount: 2,
      filmType: 'Kodak Gold 200 · 컬러네거티브 (C-41)',
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
    });
    showToast('📷 QR 코드를 1초 만에 감지했습니다! 접수 티켓을 확인하세요.', 'success');
  };

  // QR 접수번호 검증 로직
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = qrCodeInput.trim().toUpperCase();
    if (!trimmed) return;

    playShutterSound('slr');
    triggerHaptic('selection');
    setVerifiedDrop({
      code: trimmed.startsWith('DASI-') ? trimmed : `DASI-LAB-${trimmed}`,
      customerName: '김민수 (필름러)',
      scannerType: '후지 프론티어 SP3000 (따뜻한 인물톤)',
      rollCount: 2,
      filmType: 'Kodak Gold 200 · 컬러네거티브 (C-41)',
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
    });
    showToast('접수 티켓을 확인했습니다. 현물 수령 후 접수 확정을 진행하세요.', 'info');
  };

  // 접수 확정 처리 (고객에게 실시간 PWA 푸시 알림 발송!)
  const handleAcceptDrop = async () => {
    if (!verifiedDrop) return;
    playShutterSound('slr');
    triggerHaptic('success');
    setVerifiedDrop(prev => (prev ? { ...prev, status: 'accepted' } : null));
    try {
      await awardPoints('spot_report', verifiedDrop.code);
    } catch (e) {
      console.error(e);
    }
    // 고객 스마트폰 브라우저 푸시 알림 트리거
    sendLocalNotification(
      '🧪 [을지로 망우삼림] 필름 스캔 접수 완료!',
      `${verifiedDrop.customerName}님의 필름 ${verifiedDrop.rollCount}롤 접수 승인! 3영업일 내 스캔본이 캐비닛에 업로드됩니다.`,
      '/cabinet?tab=qr'
    );
    showToast(`✅ [${verifiedDrop.code}] 1초 스캔 접수가 승인되었습니다. 고객에게 푸시 알림이 전송됩니다. (+150P)`, 'success');
  };

  // 재고 증감
  const handleStockChange = (id: string, delta: number) => {
    setFilmStocks(prev =>
      prev.map(item => {
        if (item.id === id) {
          const nextCount = Math.max(0, item.count + delta);
          return {
            ...item,
            count: nextCount,
            isSoldOut: nextCount === 0,
          };
        }
        return item;
      })
    );
  };

  // 재고 품절 토글
  const handleToggleSoldOut = (id: string) => {
    setFilmStocks(prev =>
      prev.map(item => {
        if (item.id === id) {
          const nextSoldOut = !item.isSoldOut;
          return {
            ...item,
            isSoldOut: nextSoldOut,
            count: nextSoldOut ? 0 : item.count || 5,
          };
        }
        return item;
      })
    );
  };

  // 수리 케이스 등록 제출
  const handleSubmitRepairCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairCase.model || !repairCase.symptom || !repairCase.cost) {
      showToast('기종, 증상, 수리 비용을 모두 입력해 주세요.', 'warning');
      return;
    }
    playShutterSound('slr');
    setRepairCaseSuccess(true);
    try {
      await awardPoints('repair_case', repairCase.model);
    } catch (err) {
      console.error(err);
    }
    showToast(`🔧 [${repairCase.model}] 수리 케이스가 DASI 케어 DB에 등록되었습니다 (+300P 적립)`, 'success');
    setTimeout(() => {
      setRepairCase({ model: '', symptom: '', solution: '', cost: '', durationDays: '3' });
      setRepairCaseSuccess(false);
    }, 2500);
  };

  // B2B 월간 정산서 UTF-8 with BOM CSV 다운로드 (글로벌 헌장 Rule 1 준수)
  const handleDownloadSettlementCsv = (mode: 'lab' | 'repair') => {
    playShutterSound('slr');
    triggerHaptic('medium');

    const isLab = mode === 'lab';
    const filename = isLab
      ? 'DASI_현상소파트너_정산내역서_202609.csv'
      : 'DASI_수리명장_공임정산내역서_202609.csv';

    let csvContent = '\uFEFF'; // Excel 한글 깨짐 방지 UTF-8 with BOM

    if (isLab) {
      csvContent += '정산월,접수번호,일자,구분,고객명,필름/장비,스캐너,금액,수수료율,지급예정액,상태\r\n';
      csvContent += '2026-09,DASI-LAB-7294,2026-09-24 14:20,현장QR접수대행,김민준,Kodak Gold 200 (2롤),노리츠(Noritsu),14000,10%,12600,승인완료\r\n';
      csvContent += '2026-09,DASI-LAB-3180,2026-09-23 11:15,현장QR접수대행,이수진,Fujifilm 200 (1롤),후지(Frontier),7000,10%,6300,승인완료\r\n';
      csvContent += '2026-09,DASI-RENT-1082,2026-09-22 16:40,렌탈거점픽업마진,박서연,Olympus PEN EE-3 (주말),45000,20%,9000,지급완료\r\n';
      csvContent += '2026-09,DASI-RENT-1094,2026-09-21 13:00,렌탈거점픽업마진,정현우,Canon AE-1 Program (주말),68000,20%,13600,지급완료\r\n';
      csvContent += '2026-09,합계,,,,,,,432000원 정산예정액,,\r\n';
    } else {
      csvContent += '정산월,접수번호,완료일자,카메라기종,고장증상,조치내역,소요일수,실제공임,DASI수수료,실수령액,지급상태\r\n';
      csvContent += '2026-09,DASI-REP-0112,2026-09-24,Nikon FM2,셔터막 저속 지연 및 프리즘 곰팡이,오버홀 분해소제 및 프리즘 세척,3일,85000,0원(명장전액지급),85000,지급예정\r\n';
      csvContent += '2026-09,DASI-REP-0110,2026-09-22,Olympus PEN EE-3,셀레늄 수광소자 접점 청소 및 적기 해제,적기 릴리즈 센서 정밀 조정,당일,45000,0원(명장전액지급),45000,지급완료\r\n';
      csvContent += '2026-09,DASI-REP-0108,2026-09-20,Canon AE-1,캐논 셔터 소리(스퀴크) 발생,미러 기어 윤활 및 오버홀,2일,70000,0원(명장전액지급),70000,지급완료\r\n';
      csvContent += '2026-09,합계,,,,,,,200000원 공임합계,,\r\n';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`📊 2026년 9월 B2B 정산서가 UTF-8 with BOM CSV로 다운로드되었습니다.`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* 상단 파트너 헤더 */}
        <div className="bg-gradient-to-r from-vintage-900 via-[#2D211A] to-vintage-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-vintage-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-terracotta/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                <Store className="w-3.5 h-3.5" />
                <span>DASI 공식 인증 파트너 전용 콘솔</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                파트너 실시간 운영 대시보드
              </h1>
              <p className="text-xs sm:text-sm text-vintage-300 max-w-xl">
                현장 1초 접수 QR 검증, 실시간 필름 재고 +/- 조정, 수리 케이스 등록을 한곳에서 즉시 처리합니다.
              </p>
            </div>

            {/* 큰글씨 간편 사장님 모드 & Micro-Ads 지표 */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setIsSeniorEasyMode(!isSeniorEasyMode);
                }}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all ${
                  isSeniorEasyMode
                    ? 'bg-amber-400 text-vintage-950 border-amber-300 shadow-md ring-2 ring-amber-300/80'
                    : 'bg-white/10 hover:bg-white/15 text-white border-white/20'
                }`}
                title="어르신 사장님을 위한 큼직한 글씨와 1초 원터치 모드"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">👓</span>
                  <div>
                    <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                      <span>큰글씨 간편 사장님 모드</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${isSeniorEasyMode ? 'bg-vintage-950 text-amber-300' : 'bg-white/20 text-white'}`}>
                        {isSeniorEasyMode ? '작동중' : '꺼짐'}
                      </span>
                    </div>
                    <div className={`text-[10px] mt-0.5 ${isSeniorEasyMode ? 'text-vintage-800' : 'text-vintage-300'}`}>
                      할인 &amp; 접수만 아주 크게 보기
                    </div>
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${isSeniorEasyMode ? 'bg-vintage-950 text-white' : 'bg-white/20 text-white'}`}>
                  {isSeniorEasyMode ? 'ON' : 'OFF'}
                </div>
              </button>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 hidden md:flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-lg">
                  ⭐
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-vintage-300">
                    <span>황금 핀 파트너</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">인증완료</span>
                  </div>
                  <div className="text-xs text-amber-300 font-mono mt-0.5">이번 달 유입 148명 · 접수 52건</div>
                </div>
              </div>
            </div>
          </div>

          {/* 파트너 유형 탭 */}
          <div className="flex items-center gap-2 mt-6 pt-6 border-t border-white/10">
            <button
              onClick={() => setPartnerType('lab')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                partnerType === 'lab'
                  ? 'bg-terracotta text-white shadow-sm'
                  : 'bg-white/10 text-vintage-300 hover:bg-white/20'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>현상소 &amp; 필름샵 모드 (을지로 망우삼림)</span>
            </button>
            <button
              onClick={() => setPartnerType('repair')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                partnerType === 'repair'
                  ? 'bg-terracotta text-white shadow-sm'
                  : 'bg-white/10 text-vintage-300 hover:bg-white/20'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>수리 명장 모드 (충무로 보성광학)</span>
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            어르신 사장님 맞춤형 초간편 모바일 POS 인터페이스 (Senior POS)
            - 노안을 고려한 18px~26px 대형 폰트와 고대비 컬러
            - 손떨림/오터치 방지 56px+ 대형 터치 버튼
            - "오늘 장사 상태", "20% 할인 확인", "필름 접수", "오늘 번 돈" 4대 핵심만 노출
        ══════════════════════════════════════════════════════════════════ */}
        {isSeniorEasyMode && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1. 영업 상태 & 오늘 정산금 요약 바 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-vintage-300 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-xs shrink-0 ${isScanAccepting ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300' : 'bg-rose-100 text-rose-700 border-2 border-rose-300'}`}>
                  {isScanAccepting ? '영업' : '마감'}
                </div>
                <div>
                  <div className="text-xs text-vintage-500 font-bold">지금 우리 가게 상태</div>
                  <div className="text-xl sm:text-2xl font-extrabold text-vintage-900 mt-0.5">
                    {isScanAccepting ? '손님 필름 정상 접수 중' : '오늘 접수 마감됨'}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const next = !isScanAccepting;
                    setIsScanAccepting(next);
                    triggerHaptic('medium');
                    showToast(next ? '지금부터 정상 영업(접수 시작)으로 전환되었습니다.' : '오늘 당일 접수가 마감되었습니다.', 'info');
                  }}
                  className={`flex-1 sm:flex-none px-6 py-3.5 rounded-2xl font-bold text-base transition-all shadow-xs active:scale-95 flex items-center justify-center gap-2 ${
                    isScanAccepting
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  <span>{isScanAccepting ? '오늘 장사 마감하기' : '손님 다시 받기 (영업 재개)'}</span>
                </button>

                <div className="px-5 py-3 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center gap-3 shrink-0">
                  <span className="text-xl">💰</span>
                  <div>
                    <div className="text-[11px] font-bold text-amber-900">오늘 모인 정산금</div>
                    <div className="text-lg sm:text-xl font-mono font-black text-amber-950">
                      {(studioHistory.length * 4000 + 16000).toLocaleString()}원
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2대 대형 핵심 카드 (Big Card POS Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* [카드 ①] 🎟️ 손님 20% 할인 확인 (가장 중요) */}
              <div className="p-6 sm:p-7 rounded-3xl bg-amber-50 border-3 border-amber-400 shadow-md space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-black tracking-wide">
                      가장 많이 쓰는 기능
                    </span>
                    <span className="text-xs font-mono font-bold text-terracotta bg-white px-2.5 py-1 rounded-xl border border-amber-300">
                      건당 +4,000원 적립
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-amber-950 flex items-center gap-2">
                    <span>🎟️ 손님 20% 할인 확인</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
                    손님이 스마트폰으로 보여주는 <strong>할인 쿠폰 번호</strong>를 입력하고 승인 버튼을 누르세요.
                  </p>
                </div>

                {/* 대형 입력창 & 승인 버튼 */}
                <div className="space-y-3">
                  <input
                    type="text"
                    value={studioCodeInput}
                    onChange={(e) => setStudioCodeInput(e.target.value)}
                    placeholder="예: ILJIN-DASI-20"
                    className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-amber-400 text-lg sm:text-xl font-mono font-black text-vintage-900 placeholder:text-vintage-400 focus:outline-none focus:ring-4 focus:ring-amber-300 shadow-inner"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleVerifyStudioCoupon()}
                      className="w-full py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>1초 즉시 할인 승인</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleStartCameraScan}
                      className="w-full py-4 rounded-2xl bg-vintage-900 hover:bg-black text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all"
                    >
                      <Camera className="w-5 h-5 text-amber-400" />
                      <span>📸 카메라로 QR 찍기</span>
                    </button>
                  </div>
                </div>

                {/* 손쉬운 원터치 테스트 칩 */}
                <div className="pt-2 border-t border-amber-200">
                  <div className="text-[11px] font-bold text-amber-800 mb-1.5">터치해서 바로 시험해보기:</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { name: '일진사 20% 할인', code: 'ILJIN-DASI-20' },
                      { name: '고래사진관 20% 할인', code: 'GOHALE-DASI-SCAN' },
                      { name: '망우삼림 20% 할인', code: 'MANGWOO-DASI-20' },
                      { name: '우성상사 필름할인', code: 'WOOSUNG-DASI-FILM' },
                    ].map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => {
                          setStudioCodeInput(item.code);
                          handleVerifyStudioCoupon(item.code);
                        }}
                        className="p-2.5 rounded-xl bg-white hover:bg-amber-200/80 border border-amber-300 text-amber-950 font-bold text-xs text-left transition-colors truncate shadow-2xs"
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 대형 승인 결과 피드백 */}
                {studioRedeemResult && (
                  <div className={`p-4 rounded-2xl border-2 animate-fadeIn ${
                    studioRedeemResult.success
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-950'
                      : 'bg-rose-100 border-rose-500 text-rose-950'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{studioRedeemResult.success ? '🎉' : '⚠️'}</span>
                      <div>
                        <div className="text-base font-black">
                          {studioRedeemResult.success ? '20% 제휴 할인 정상 승인 완료!' : '승인 불가'}
                        </div>
                        <div className="text-xs font-semibold mt-0.5 opacity-90">
                          {studioRedeemResult.message}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* [카드 ②] 🧪 오늘 맡긴 필름 1초 접수 */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-vintage-300 shadow-md space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="px-3 py-1 rounded-full bg-vintage-900 text-white text-xs font-black tracking-wide">
                    필름 현물 수령 접수
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-vintage-900 flex items-center gap-2">
                    <span>🧪 손님 필름 접수하기</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-vintage-600 leading-relaxed font-medium">
                    손님이 가져온 필름과 <strong>접수번호 4자리</strong>를 확인하고 수령을 확정하세요.
                  </p>
                </div>

                {/* 코드 입력 & 확인 */}
                <form onSubmit={handleVerifyCode} className="space-y-3">
                  <input
                    type="text"
                    value={qrCodeInput}
                    onChange={(e) => setQrCodeInput(e.target.value)}
                    placeholder="예: 7294 또는 DASI-LAB-7294"
                    className="w-full px-5 py-4 rounded-2xl bg-vintage-50 border-2 border-vintage-300 text-lg sm:text-xl font-mono font-black text-vintage-900 placeholder:text-vintage-400 focus:outline-none focus:ring-4 focus:ring-vintage-300 shadow-inner"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="submit"
                      className="w-full py-4 rounded-2xl bg-vintage-900 hover:bg-terracotta text-white font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                    >
                      <Search className="w-5 h-5 text-amber-400" />
                      <span>접수번호 확인</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrCodeInput('DASI-LAB-7294')}
                      className="w-full py-4 rounded-2xl bg-vintage-100 hover:bg-vintage-200 text-vintage-800 font-bold text-sm flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>예시 #7294 채우기</span>
                    </button>
                  </div>
                </form>

                {/* 검증된 접수증이 있을 때 대형 수령 확인 버튼 */}
                {verifiedDrop ? (
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border-2 border-amber-400 space-y-3 animate-fadeIn">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-mono font-bold text-amber-800">{verifiedDrop.code}</div>
                        <div className="text-lg font-black text-vintage-900">{verifiedDrop.customerName} 손님</div>
                        <div className="text-xs font-bold text-terracotta mt-0.5">총 {verifiedDrop.rollCount}롤 · {verifiedDrop.filmType}</div>
                      </div>
                      <span className="text-[10px] bg-vintage-200 text-vintage-700 px-2 py-0.5 rounded font-mono">
                        {verifiedDrop.timestamp}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleAcceptDrop}
                      className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all"
                    >
                      <Check className="w-5 h-5" />
                      <span>손님 필름 받았음 (수령 확정)</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-vintage-50 border border-vintage-200 text-center text-xs text-vintage-500">
                    접수번호를 입력하고 확인을 누르면 손님이 맡긴 롤 수와 스캐너가 크게 표시됩니다.
                  </div>
                )}
              </div>
            </div>

            {/* 하단 상세 기능 펼치기 토글 안내 */}
            <div className="p-4 rounded-2xl bg-vintage-100/70 border border-vintage-200 text-center text-xs text-vintage-600 flex items-center justify-between">
              <span>💡 필름 재고 증감, 정산 엑셀(CSV) 다운로드 등 복잡한 설정은 아래 상세 화면에서 관리하실 수 있습니다.</span>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setIsSeniorEasyMode(false);
                }}
                className="text-terracotta font-bold underline shrink-0 ml-2"
              >
                상세 화면 보기 →
              </button>
            </div>
          </div>
        )}

        {/* ── LAB MODE: 현상소 파트너 대시보드 (상세 화면: 간편 모드 OFF일 때만 표시) ── */}
        {partnerType === 'lab' && !isSeniorEasyMode && (
          <div className="space-y-4 animate-fadeIn">
            {/* 상단 간편 모드 복귀 버튼 */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setIsSeniorEasyMode(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-vintage-950 font-black text-xs flex items-center gap-1.5 shadow-xs transition-all"
              >
                <span>👓 큰글씨 간편 사장님 모드로 돌아가기</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* 좌측: 1초 QR 접수 검증기 (8 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* 1. 현장 1초 QR 접수 코드 리더 */}
              <div className="bg-white rounded-3xl p-6 border border-vintage-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-vintage-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-vintage-900">현장 1초 스마트 스캔 QR 검증</h2>
                      <p className="text-[11px] text-vintage-500">고객이 제시한 QR 코드 또는 4자리 접수코드를 확인하세요</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    대기 접수 2건
                  </span>
                </div>

                {/* 코드 입력 폼 & 실시간 카메라 스캔 */}
                <form onSubmit={handleVerifyCode} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={qrCodeInput}
                      onChange={(e) => setQrCodeInput(e.target.value)}
                      placeholder="예: 7294 또는 DASI-LAB-7294"
                      className="w-full px-4 py-3 rounded-2xl bg-vintage-50 border border-vintage-200 text-sm font-mono font-bold text-vintage-900 placeholder:text-vintage-400 focus:outline-none focus:border-terracotta"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleStartCameraScan}
                    className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 shrink-0"
                    title="스마트폰 카메라로 실시간 QR 바코드 스캔"
                  >
                    <Camera className="w-4 h-4" />
                    <span>카메라 스캔</span>
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-2xl bg-vintage-900 hover:bg-terracotta text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 shrink-0"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>조회</span>
                  </button>
                </form>

                {/* 빠른 시뮬레이션 버튼 */}
                <div className="flex items-center gap-2 text-[11px] text-vintage-500">
                  <span>빠른 테스트:</span>
                  <button
                    type="button"
                    onClick={() => { setQrCodeInput('DASI-LAB-7294'); }}
                    className="px-2 py-0.5 rounded-md bg-vintage-100 hover:bg-vintage-200 font-mono text-vintage-700 font-semibold"
                  >
                    #7294 (노리츠 2롤)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setQrCodeInput('DASI-LAB-3180'); }}
                    className="px-2 py-0.5 rounded-md bg-vintage-100 hover:bg-vintage-200 font-mono text-vintage-700 font-semibold"
                  >
                    #3180 (후지 1롤)
                  </button>
                </div>

                {/* 검증 결과 카드 */}
                {verifiedDrop && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border-2 border-amber-300 space-y-3 animate-fadeIn">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-vintage-900 text-amber-300">
                          {verifiedDrop.code}
                        </span>
                        <h3 className="text-base font-bold text-vintage-900 mt-1">
                          {verifiedDrop.customerName} · 총 {verifiedDrop.rollCount}롤
                        </h3>
                        <p className="text-xs text-vintage-600 mt-0.5">{verifiedDrop.filmType}</p>
                      </div>
                      <span className="text-xs text-vintage-400 font-mono">{verifiedDrop.timestamp} 접수</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-vintage-200 text-xs text-vintage-700 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-vintage-500">요청 스캐너:</span>
                        <strong className="text-terracotta">{verifiedDrop.scannerType}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-vintage-500">수령 방식:</span>
                        <span>카카오 알림톡 웹갤러리 링크 + 네거티브 필름 보관</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-vintage-500">고객 보상:</span>
                        <span className="text-emerald-700 font-bold">+150P 자동 지급 예정</span>
                      </div>
                    </div>

                    {verifiedDrop.status === 'pending' ? (
                      <button
                        onClick={handleAcceptDrop}
                        className="w-full py-3 rounded-xl bg-terracotta hover:bg-terracotta-light text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        <span>필름 수령 확인 및 접수 승인 (+150P 지급)</span>
                      </button>
                    ) : (
                      <div className="py-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>접수 승인 완료됨 (스캔 작업 대기열 등록)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 1.5. [신규] 서울 사진관 & DASI 제휴 현상소 20% 할인 QR 검증기 */}
              <div className="bg-white rounded-3xl p-6 border-2 border-amber-300 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-vintage-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-sm font-bold text-vintage-900">제휴 사진관 &amp; 현상소 20% 할인 QR 승인기</h2>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                          O2O 현장 정산
                        </span>
                      </div>
                      <p className="text-[11px] text-vintage-500">
                        고객이 제시한 20% 할인 QR 코드(또는 쿠폰 번호)를 1초 만에 검증하고 현장 할인을 확정합니다.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-terracotta bg-terracotta/10 px-2.5 py-1 rounded-xl">
                    건당 +4,000원 정산
                  </span>
                </div>

                {/* 코드 입력 폼 */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={studioCodeInput}
                    onChange={(e) => setStudioCodeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleVerifyStudioCoupon();
                      }
                    }}
                    placeholder="예: ILJIN-DASI-20 또는 GOHALE-DASI-SCAN"
                    className="flex-1 px-4 py-3 rounded-2xl bg-amber-50/50 border border-amber-300 text-sm font-mono font-bold text-vintage-900 placeholder:text-vintage-400 focus:outline-none focus:border-terracotta"
                  />
                  <button
                    type="button"
                    onClick={() => handleVerifyStudioCoupon()}
                    className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>1초 할인 승인</span>
                  </button>
                </div>

                {/* 빠른 제휴 쿠폰 시뮬레이션 버튼 */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-vintage-600">
                  <span className="font-semibold text-vintage-500">빠른 테스트:</span>
                  {[
                    { label: '충무로 일진사 (20%)', code: 'ILJIN-DASI-20' },
                    { label: '종로 고래사진관 (20%)', code: 'GOHALE-DASI-SCAN' },
                    { label: '을지로 망우삼림 (20%)', code: 'MANGWOO-DASI-20' },
                    { label: '우성상사 (필름할인)', code: 'WOOSUNG-DASI-FILM' },
                  ].map((testItem) => (
                    <button
                      key={testItem.code}
                      type="button"
                      onClick={() => {
                        setStudioCodeInput(testItem.code);
                        handleVerifyStudioCoupon(testItem.code);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-vintage-100 hover:bg-amber-100 hover:text-amber-900 text-vintage-700 font-medium transition-colors"
                    >
                      {testItem.label}
                    </button>
                  ))}
                </div>

                {/* 실시간 승인 결과 피드백 */}
                {studioRedeemResult && (
                  <div
                    className={`p-4 rounded-2xl border animate-fadeIn transition-all ${
                      studioRedeemResult.success
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-rose-50 border-rose-300 text-rose-900'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {studioRedeemResult.success ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0">
                            <X className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div>
                          <div className="text-xs font-bold">
                            {studioRedeemResult.success ? '현장 20% 제휴 할인 정상 승인 완료' : '쿠폰 승인 불가'}
                          </div>
                          <div className="text-[11px] opacity-90 mt-0.5">
                            {studioRedeemResult.message}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono opacity-70">
                        {studioRedeemResult.redeemedAt}
                      </span>
                    </div>

                    {studioRedeemResult.success && studioRedeemResult.coupon && (
                      <div className="mt-3 pt-3 border-t border-emerald-200/80 flex items-center justify-between text-xs font-semibold">
                        <span>혜택: {studioRedeemResult.coupon.title}</span>
                        <span className="text-emerald-700 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                          파트너 정산 마진 +4,000원 반영
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* 금일 제휴 할인 승인 내역 */}
                <div className="pt-2 border-t border-vintage-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-vintage-800">금일 제휴 QR 할인 승인 목록</span>
                    <span className="text-[11px] text-vintage-500 font-mono">
                      총 {studioHistory.length}건 승인
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {studioHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-vintage-50 border border-vintage-200/70 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-vintage-900 bg-white px-2 py-0.5 rounded border border-vintage-200">
                            {item.code}
                          </span>
                          <span className="text-vintage-700 text-[11px]">{item.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-vintage-400 font-mono">{item.time}</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            +{item.discountAmt.toLocaleString()}원 정산
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. 당일 스캔 마감 시간 관리 */}
              <div className="bg-white rounded-3xl p-6 border border-vintage-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-vintage-900">당일 스캔 마감 상태 관리</h2>
                      <p className="text-[11px] text-vintage-500">DASI 지도 핀 및 스팟 상세 페이지에 실시간 반영됩니다</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${isScanAccepting ? 'text-emerald-700' : 'text-vintage-400'}`}>
                      {isScanAccepting ? '당일 접수 중' : '당일 마감'}
                    </span>
                    <button
                      onClick={() => {
                        const next = !isScanAccepting;
                        setIsScanAccepting(next);
                        showToast(next ? '당일 스캔 접수가 재개되었습니다.' : '오늘 당일 스캔이 마감 처리되었습니다.', 'info');
                      }}
                      className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                        isScanAccepting ? 'bg-emerald-500 justify-end' : 'bg-vintage-300 justify-start'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-vintage-50 border border-vintage-200 text-xs space-y-1">
                    <span className="text-vintage-500">당일 스캔 마감 시간</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={cutoffTime}
                        onChange={(e) => setCutoffTime(e.target.value)}
                        className="font-mono font-bold text-vintage-900 bg-white px-2 py-1 rounded-lg border border-vintage-200"
                      />
                      <span className="text-[11px] text-vintage-500">이전 접수 건 당일 발송</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-vintage-50 border border-vintage-200 text-xs space-y-1">
                    <span className="text-vintage-500">웹 갤러리 예상 발송 시각</span>
                    <div className="font-bold text-vintage-900 text-sm mt-1">오늘 밤 21:30 일괄 전송</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 우측: 실시간 필름 재고 원탭 관리기 (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-vintage-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-vintage-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-vintage-900">실시간 필름 재고 관리</h2>
                      <p className="text-[11px] text-vintage-500">클릭 즉시 지도 사용자에게 잔여 수량 노출</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {filmStocks.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        item.isSoldOut
                          ? 'bg-vintage-50 border-vintage-200 opacity-60'
                          : 'bg-white border-vintage-200 hover:border-terracotta/40'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-vintage-900">{item.name}</span>
                            {item.isSoldOut && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-bold">
                                품절
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-vintage-500 mt-0.5">
                            ₩{item.price.toLocaleString()} · ISO {item.iso}
                          </div>
                        </div>

                        {/* +/- 조정기 */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStockChange(item.id, -1)}
                            className="w-7 h-7 rounded-lg bg-vintage-100 hover:bg-vintage-200 text-vintage-800 flex items-center justify-center font-bold active:scale-95"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-mono font-bold text-sm text-vintage-900">
                            {item.count}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleStockChange(item.id, 1)}
                            className="w-7 h-7 rounded-lg bg-vintage-100 hover:bg-vintage-200 text-vintage-800 flex items-center justify-center font-bold active:scale-95"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-vintage-100/60 text-[11px]">
                        <button
                          type="button"
                          onClick={() => handleToggleSoldOut(item.id)}
                          className="text-vintage-500 hover:text-terracotta font-medium"
                        >
                          {item.isSoldOut ? '재입고 처리' : '원터치 품절 설정'}
                        </button>
                        <span className="text-emerald-700 font-semibold font-mono">
                          {item.count > 0 ? `잔여 ${item.count}롤 실시간 노출` : '지도 품절 표시'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-vintage-700 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    필름 재고 수량을 입력해두면 주변 3km 내 필름을 찾는 출사자에게 <strong>&apos;실시간 재고 보유 샵&apos;</strong>으로 우선 추천됩니다.
                  </p>
                </div>
              </div>

              {/* 월간 정산 요약 카드 */}
              <div className="bg-gradient-to-br from-[#2D211A] to-vintage-900 rounded-3xl p-6 text-white shadow-xs space-y-4">
                <div className="flex items-center justify-between text-xs text-vintage-300">
                  <span>2026년 9월 정산 예정액</span>
                  <span className="text-emerald-400 font-bold">익월 10일 정산</span>
                </div>
                <div className="font-serif text-3xl font-bold text-amber-300">₩432,000</div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs text-vintage-300">
                  <div>• QR 접수 대행료: ₩104,000</div>
                  <div>• 렌탈 픽업 거점 마진: ₩328,000</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadSettlementCsv('lab')}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/20 transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span>월간 정산서 다운로드 (Excel CSV BOM)</span>
                </button>
              </div>
            </div>

          </div>
          </div>
        )}

        {/* ── REPAIR MODE: 수리 명장 대시보드 ── */}
        {partnerType === 'repair' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* 수리 케이스 신속 등록기 (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-vintage-200 shadow-xs space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-vintage-100">
                <div className="w-10 h-10 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center font-bold">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-vintage-900">수리 명장 완료 케이스 등록</h2>
                  <p className="text-xs text-vintage-500">등록된 수리 내역은 동일 기종 고객의 예상 견적 DB로 자동 연동됩니다 (+300P)</p>
                </div>
              </div>

              <form onSubmit={handleSubmitRepairCase} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-vintage-800 mb-1">수리 카메라 기종 *</label>
                  <input
                    type="text"
                    required
                    value={repairCase.model}
                    onChange={(e) => setRepairCase({ ...repairCase, model: e.target.value })}
                    placeholder="예: Nikon FM2, Canon AE-1, Olympus Pen EE-3"
                    className="w-full px-4 py-2.5 rounded-xl bg-vintage-50 border border-vintage-200 text-xs text-vintage-900 focus:outline-none focus:border-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-vintage-800 mb-1">고장 증상 *</label>
                  <input
                    type="text"
                    required
                    value={repairCase.symptom}
                    onChange={(e) => setRepairCase({ ...repairCase, symptom: e.target.value })}
                    placeholder="예: 셔터막 저속 끊김 및 뷰파인더 곰팡이 침투"
                    className="w-full px-4 py-2.5 rounded-xl bg-vintage-50 border border-vintage-200 text-xs text-vintage-900 focus:outline-none focus:border-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-vintage-800 mb-1">명장 조치 내역 (상세 솔루션)</label>
                  <textarea
                    rows={3}
                    value={repairCase.solution}
                    onChange={(e) => setRepairCase({ ...repairCase, solution: e.target.value })}
                    placeholder="예: 셔터 모듈 분해소제(오버홀), 뷰파인더 프리즘 세척, 몰트 플레인 교체"
                    className="w-full px-4 py-2.5 rounded-xl bg-vintage-50 border border-vintage-200 text-xs text-vintage-900 focus:outline-none focus:border-terracotta resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-vintage-800 mb-1">실제 수리 비용 (원) *</label>
                    <input
                      type="text"
                      required
                      value={repairCase.cost}
                      onChange={(e) => setRepairCase({ ...repairCase, cost: e.target.value })}
                      placeholder="예: 85000"
                      className="w-full px-4 py-2.5 rounded-xl bg-vintage-50 border border-vintage-200 text-xs text-vintage-900 focus:outline-none focus:border-terracotta font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-vintage-800 mb-1">소요 일수</label>
                    <select
                      value={repairCase.durationDays}
                      onChange={(e) => setRepairCase({ ...repairCase, durationDays: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-vintage-50 border border-vintage-200 text-xs text-vintage-900 focus:outline-none focus:border-terracotta"
                    >
                      <option value="1">당일 수리 (1일)</option>
                      <option value="2">2일 이내</option>
                      <option value="3">3일 이내 (표준)</option>
                      <option value="5">5일 (부품 수급)</option>
                      <option value="7">7일 이상</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={repairCaseSuccess}
                  className="w-full py-3.5 rounded-2xl bg-vintage-900 hover:bg-terracotta text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  <Wrench className="w-4 h-4" />
                  <span>{repairCaseSuccess ? '케이스 등록 완료! (+300P)' : '명장 케이스 데이터베이스 등록 (+300P)'}</span>
                </button>
              </form>
            </div>

            {/* 수리 명장 통계 및 공개 DB 미리보기 (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-vintage-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-vintage-100">
                  <h3 className="text-sm font-bold text-vintage-900">최근 명장 등록 케이스</h3>
                  <span className="text-xs text-vintage-500 font-mono">누적 124건</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-2xl bg-vintage-50 border border-vintage-200 space-y-1">
                    <div className="flex justify-between items-center">
                      <strong className="text-vintage-900">Nikon FM2</strong>
                      <span className="text-terracotta font-mono font-bold">₩85,000</span>
                    </div>
                    <p className="text-vintage-600 text-[11px]">셔터막 지연 및 렌즈 곰팡이 오버홀 · 3일</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-vintage-50 border border-vintage-200 space-y-1">
                    <div className="flex justify-between items-center">
                      <strong className="text-vintage-900">Olympus PEN EE-3</strong>
                      <span className="text-terracotta font-mono font-bold">₩45,000</span>
                    </div>
                    <p className="text-vintage-600 text-[11px]">셀레늄 수광소자 접점 청소 및 적기 해제 · 당일</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-vintage-50 border border-vintage-200 space-y-1">
                    <div className="flex justify-between items-center">
                      <strong className="text-vintage-900">Canon AE-1</strong>
                      <span className="text-terracotta font-mono font-bold">₩70,000</span>
                    </div>
                    <p className="text-vintage-600 text-[11px]">캐논 셔터 명음(소리) 오버홀 구리스 주입 · 2일</p>
                  </div>
                </div>

                {/* 수리 명장 월간 공임 정산 카드 */}
                <div className="p-4 rounded-2xl bg-vintage-900 text-white space-y-2.5">
                  <div className="flex justify-between items-center text-xs text-vintage-300">
                    <span>9월 명장 공임 정산액</span>
                    <span className="text-emerald-400 font-bold">수수료 0% 전액 지급</span>
                  </div>
                  <div className="font-serif text-2xl font-bold text-amber-300">₩200,000</div>
                  <button
                    type="button"
                    onClick={() => handleDownloadSettlementCsv('repair')}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-white/20 transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-300" />
                    <span>공임 정산 내역서 CSV (BOM) 다운로드</span>
                  </button>
                </div>

                <div className="pt-2">
                  <Link
                    href="/clinic"
                    className="w-full py-2.5 rounded-xl bg-vintage-100 hover:bg-vintage-200 text-vintage-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>소비자용 명장 케어관 둘러보기</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* 실시간 스마트폰 카메라 바코드 스캐너 모달 */}
      {isCameraScanning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-vintage-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20 p-5 text-white text-center animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <span className="text-xs font-bold text-amber-300">카메라 실시간 QR 스캐너</span>
              <button onClick={handleStopCameraScan} className="p-1 rounded-full text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black mb-4 flex items-center justify-center border-2 border-dashed border-amber-400">
              <video ref={videoScannerRef} playsInline muted className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-amber-400 rounded-2xl relative animate-pulse">
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-amber-400" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-amber-400" />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-amber-400" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-amber-400" />
                </div>
              </div>
            </div>

            <p className="text-xs text-vintage-300 mb-3">
              고객이 제시한 1초 스마트 스캔 QR 코드를 중앙에 맞춰주세요
            </p>

            <button
              onClick={() => handleSimulateScanFound('DASI-LAB-7294')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-terracotta text-black font-bold text-xs shadow-md transition-all active:scale-95"
            >
              ⚡️ 바코드 1초 인식 시뮬레이션 (#7294)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}