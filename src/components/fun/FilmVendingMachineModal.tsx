'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Gift, Download, RotateCcw, Coins, Check, ArrowRight, ShieldCheck, Flame } from 'lucide-react';
import { playCoinSound, playVendingClunkSound } from '@/utils/shutterAudio';
import { useDasi } from '@/context/DasiContext';
import { UserCoupon } from '@/types';

interface FilmVendingMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PrizeResult {
  tier: 'ultra' | 'rare' | 'common';
  title: string;
  badge: string;
  badgeColor: string;
  couponName: string;
  discountAmount: number;
  discountType: 'percentage' | 'fixed';
  stickerTitle: string;
  stickerEmoji: string;
  quote: string;
  capsuleColor: string;
}

const PRIZE_POOL: PrizeResult[] = [
  {
    tier: 'ultra',
    title: '🏆 전설의 황금 캡슐! 1일 무료 렌탈권',
    badge: 'ULTRA RARE (3%)',
    badgeColor: 'bg-amber-400 text-stone-900 border-amber-300',
    couponName: '[자판기 대박] 전 기종 1일 100% 무료 렌탈권',
    discountAmount: 100,
    discountType: 'percentage',
    stickerTitle: 'LEICA M3 GOLD EDITION',
    stickerEmoji: '👑',
    quote: '"장인의 숨결이 깃든 라이카의 기운이 당신과 함께합니다!"',
    capsuleColor: 'from-amber-300 via-yellow-400 to-amber-600',
  },
  {
    tier: 'rare',
    title: '✨ 실버 캡슐! 5,000원 렌탈/현상 지원권',
    badge: 'RARE (17%)',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    couponName: '[자판기 행운] 5,000원 즉시 할인 쿠폰',
    discountAmount: 5000,
    discountType: 'fixed',
    stickerTitle: 'EULJIRO RETRO NIGHT',
    stickerEmoji: '🎞️',
    quote: '"을지로 인쇄골목의 묵직한 필름 감성을 선물합니다."',
    capsuleColor: 'from-slate-200 via-indigo-300 to-slate-400',
  },
  {
    tier: 'common',
    title: '🎞️ 클래식 캡슐! 2,000원 렌탈 응원권',
    badge: 'COMMON (80%)',
    badgeColor: 'bg-stone-100 text-stone-700 border-stone-300',
    couponName: '[자판기 응원] 2,000원 웰컴 할인 쿠폰',
    discountAmount: 2000,
    discountType: 'fixed',
    stickerTitle: 'DASI ANALOG SOUL',
    stickerEmoji: '📷',
    quote: '"오늘 당신이 담아낼 36컷의 이야기를 응원합니다."',
    capsuleColor: 'from-amber-200 via-rose-300 to-amber-400',
  },
];

export const FilmVendingMachineModal: React.FC<FilmVendingMachineModalProps> = ({ isOpen, onClose }) => {
  const { addCoupon, showToast } = useDasi();
  const [mounted, setMounted] = useState<boolean>(false);
  const [points, setPoints] = useState<number>(600); // 사용자 가상 포인트
  const [isCoinInserted, setIsCoinInserted] = useState<boolean>(false);
  const [isDialTurning, setIsDialTurning] = useState<boolean>(false);
  const [dialRotation, setDialRotation] = useState<number>(0);
  const [dispensedCapsule, setDispensedCapsule] = useState<PrizeResult | null>(null);
  const [isOpeningCapsule, setIsOpeningCapsule] = useState<boolean>(false);
  const [revealedPrize, setRevealedPrize] = useState<PrizeResult | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  // 동전 투입
  const handleInsertCoin = () => {
    if (isCoinInserted || isDialTurning) return;
    if (points < 200) {
      showToast('포인트가 부족하여 200P 보너스를 충전해 드렸습니다!', 'info');
      setPoints((prev) => prev + 200);
      return;
    }

    playCoinSound();
    setPoints((prev) => prev - 200);
    setIsCoinInserted(true);
    showToast('짤랑- 200P 투입 완료! 크롬 레버를 360도 돌려주세요.', 'success');
  };

  // 다이얼 회전 & 캡슐 드롭
  const handleTurnDial = () => {
    if (!isCoinInserted || isDialTurning) return;

    setIsDialTurning(true);
    setDialRotation((prev) => prev + 360);

    setTimeout(() => {
      const rand = Math.random() * 100;
      let selectedPrize: PrizeResult;
      if (rand < 3) {
        selectedPrize = PRIZE_POOL[0];
      } else if (rand < 20) {
        selectedPrize = PRIZE_POOL[1];
      } else {
        selectedPrize = PRIZE_POOL[2];
      }

      playVendingClunkSound();
      setDispensedCapsule(selectedPrize);
      setIsDialTurning(false);
      setIsCoinInserted(false);
      showToast('덜커덩! 캡슐이 슈트로 떨어졌습니다. 캡슐을 터치해 열어보세요!', 'warning');
    }, 1100);
  };

  // 캡슐 열기 & 쿠폰 자동 발급
  const handleOpenCapsule = () => {
    if (!dispensedCapsule || isOpeningCapsule) return;
    setIsOpeningCapsule(true);

    setTimeout(() => {
      setRevealedPrize(dispensedCapsule);
      setDispensedCapsule(null);
      setIsOpeningCapsule(false);

      const newCoupon: UserCoupon = {
        id: `gacha-${Date.now()}`,
        title: dispensedCapsule.couponName,
        issuerName: '을지로 24시 자판기',
        discountText: dispensedCapsule.discountAmount === 100 ? '전 기종 1일 100% 무료' : `${dispensedCapsule.discountAmount.toLocaleString()}원 즉시 할인`,
        validUntil: '2026.12.31',
        category: 'film',
        isUsed: false,
      };
      addCoupon(newCoupon);
    }, 600);
  };

  // Canvas 기반 디지털 스티커 PNG 다운로드
  const handleDownloadSticker = () => {
    if (!revealedPrize) return;
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background Badge
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.roundRect(20, 20, 560, 560, 40);
    ctx.fill();

    // Vintage Border
    ctx.strokeStyle = revealedPrize.tier === 'ultra' ? '#f59e0b' : '#64748b';
    ctx.lineWidth = 12;
    ctx.stroke();

    // Emoji/Icon
    ctx.font = '90px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(revealedPrize.stickerEmoji, 300, 200);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(revealedPrize.stickerTitle, 300, 320);

    // Subtitle
    ctx.fillStyle = '#f59e0b';
    ctx.font = '600 24px sans-serif';
    ctx.fillText(revealedPrize.badge, 300, 370);

    // Quote
    ctx.fillStyle = '#a8a29e';
    ctx.font = 'italic 20px sans-serif';
    ctx.fillText(revealedPrize.quote.replace(/"/g, ''), 300, 440);

    // Footer
    ctx.fillStyle = '#78716c';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('DASI ANALOG COLLECTIBLE STICKER PACK • 2026', 300, 510);

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `DASI_STICKER_${revealedPrize.stickerTitle.replace(/\s+/g, '_')}.png`;
    link.href = dataUrl;
    link.click();
    showToast('디지털 스티커가 고화질 PNG로 저장되었습니다!', 'success');
  };

  const handleResetForNext = () => {
    setRevealedPrize(null);
    setDispensedCapsule(null);
    setIsCoinInserted(false);
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-stone-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-stone-900 rounded-3xl border border-stone-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-900/95 sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <h3 className="font-serif text-lg font-bold text-stone-100 flex items-center gap-2">
              을지로 24시 필름 가챠 자판기
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-sans font-medium">
                손맛 100%
              </span>
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800 border border-stone-700 text-xs text-amber-300 font-mono font-bold">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{points} P</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition shadow-xs"
              aria-label="닫기"
              title="창 닫기 (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 자판기 본체 외관 */}
          <div className="relative mx-auto max-w-md rounded-2xl bg-gradient-to-b from-stone-800 via-stone-850 to-stone-900 border-4 border-stone-700 p-5 shadow-2xl">
            {/* 상단 네온 사인 */}
            <div className="text-center py-2 px-4 rounded-xl bg-stone-950 border border-amber-500/40 mb-4 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <p className="text-[11px] font-mono tracking-widest text-amber-400 font-bold uppercase flex items-center justify-center gap-2">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                VINTAGE 35mm CAPSULE DISPENSER
                <Flame className="w-3.5 h-3.5 text-amber-500" />
              </p>
              <p className="text-xs text-stone-300 font-serif mt-0.5">
                1회 200P 투입 시 <strong className="text-amber-300">최대 100% 무료 렌탈권</strong> & 한정판 스티커 증정!
              </p>
            </div>

            {/* 쇼케이스 투명창 (볼 캡슐) */}
            <div className="relative h-44 rounded-xl bg-gradient-to-b from-cyan-950/40 via-stone-900/80 to-stone-950 border-2 border-stone-600/80 p-3 overflow-hidden shadow-inner flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

              <div className="grid grid-cols-5 gap-3 w-full justify-items-center opacity-90">
                {['bg-amber-400', 'bg-rose-400', 'bg-indigo-400', 'bg-emerald-400', 'bg-yellow-300',
                  'bg-orange-400', 'bg-purple-400', 'bg-sky-400', 'bg-pink-400', 'bg-teal-400'].map((color, i) => (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-full ${color} shadow-lg border-2 border-white/40 flex items-center justify-center transform transition-transform hover:scale-110 cursor-pointer ${
                      isDialTurning ? 'animate-bounce' : ''
                    }`}
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-white/60 -mt-2 -ml-2" />
                  </div>
                ))}
              </div>

              <div className="absolute bottom-2 text-[10px] text-stone-400 font-mono tracking-wider bg-stone-950/80 px-2.5 py-0.5 rounded-md border border-stone-800">
                ULTRARARE 3% • RARE 17% • COMMON 80%
              </div>
            </div>

            {/* 중단 컨트롤 패널 */}
            <div className="mt-5 grid grid-cols-2 gap-4 items-center bg-stone-950/90 rounded-xl p-4 border border-stone-700/80">
              {/* 왼쪽: 동전 투입 슬롯 */}
              <div className="flex flex-col items-center justify-center text-center p-3 rounded-lg bg-stone-900 border border-stone-800">
                <span className="text-[11px] text-stone-400 font-medium mb-1.5 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-400" /> 코인 슬롯
                </span>
                <button
                  onClick={handleInsertCoin}
                  disabled={isCoinInserted || isDialTurning}
                  className={`w-full py-2.5 px-3 rounded-lg font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5 ${
                    isCoinInserted
                      ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/50 cursor-default'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 active:scale-95'
                  }`}
                >
                  {isCoinInserted ? (
                    <>
                      <Check className="w-4 h-4" /> 200P 투입완료
                    </>
                  ) : (
                    <>
                      <Coins className="w-4 h-4" /> 200P 동전 투입
                    </>
                  )}
                </button>
              </div>

              {/* 오른쪽: 크롬 회전 다이얼 */}
              <div className="flex flex-col items-center justify-center text-center p-3 rounded-lg bg-stone-900 border border-stone-800">
                <span className="text-[11px] text-stone-400 font-medium mb-1.5 flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-stone-400" /> 회전 레버
                </span>
                <button
                  onClick={handleTurnDial}
                  disabled={!isCoinInserted || isDialTurning}
                  className={`relative w-16 h-16 rounded-full border-4 border-stone-400 shadow-xl flex items-center justify-center transition-all ${
                    !isCoinInserted
                      ? 'bg-stone-800 opacity-50 cursor-not-allowed border-stone-600'
                      : 'bg-gradient-to-tr from-stone-400 via-stone-200 to-stone-500 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                  }`}
                  style={{
                    transform: `rotate(${dialRotation}deg)`,
                    transition: isDialTurning ? 'transform 1.1s cubic-bezier(0.4, 0, 0.2, 1)' : 'transform 0.2s',
                  }}
                  title="다이얼을 360도 돌려주세요"
                >
                  <div className="w-12 h-2.5 bg-stone-800 rounded-full shadow" />
                </button>
                <span className="text-[10px] text-amber-400/90 font-mono mt-2">
                  {isCoinInserted ? '👉 다이얼 터치!' : '코인 필요'}
                </span>
              </div>
            </div>

            {/* 하단 배출구 */}
            <div className="mt-4 pt-3 border-t border-stone-800">
              <div className="text-[11px] text-stone-400 font-mono text-center mb-2">CAPSULE CHUTE (배출구)</div>
              <div className="h-20 bg-stone-950 rounded-xl border-2 border-stone-800 flex items-center justify-center p-2 relative overflow-hidden">
                {dispensedCapsule ? (
                  <button
                    onClick={handleOpenCapsule}
                    disabled={isOpeningCapsule}
                    className="flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-bold text-xs shadow-2xl hover:scale-105 active:scale-95 transition animate-bounce cursor-pointer"
                  >
                    <Gift className="w-4 h-4 text-stone-950" />
                    <span>🎁 캡슐 도착! 터치하여 개봉하기</span>
                  </button>
                ) : (
                  <span className="text-xs text-stone-600 font-mono">
                    {isDialTurning ? '덜커덩... 캡슐 낙하 중!' : '레버를 돌리면 캡슐이 이곳으로 떨어집니다'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 당첨 결과 공개 팝업 카드 */}
          {revealedPrize && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-stone-800 to-stone-850 border-2 border-amber-500/80 shadow-2xl animate-scaleUp space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-md border ${revealedPrize.badgeColor}`}>
                  {revealedPrize.badge}
                </span>
                <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> 캐비닛 쿠폰함 자동 보관
                </span>
              </div>

              <div>
                <h4 className="text-xl font-serif font-bold text-white mb-1">
                  {revealedPrize.title}
                </h4>
                <p className="text-xs text-stone-300 italic">
                  {revealedPrize.quote}
                </p>
              </div>

              {/* 혜택 바우처 */}
              <div className="p-4 rounded-xl bg-stone-900 border border-stone-700 flex items-center justify-between">
                <div>
                  <p className="text-xs text-stone-400 font-mono">당첨 쿠폰</p>
                  <p className="text-sm font-bold text-amber-300">{revealedPrize.couponName}</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">유효기간: 2026.12.31까지 (렌탈 주문 시 즉시 사용 가능)</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 자동 적립됨
                  </span>
                </div>
              </div>

              {/* 획득 스티커 다운로드 버튼 */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                <button
                  onClick={handleDownloadSticker}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-stone-700 hover:bg-stone-600 text-stone-100 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  한정판 디지털 스티커 PNG 저장
                </button>
                <button
                  onClick={handleResetForNext}
                  className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  한 번 더 뽑기 <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
