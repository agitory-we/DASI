'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Award,
  Download,
  Share2,
  X,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useDevicePlatform } from '@/hooks/useDevicePlatform';
import { useDasi } from '@/context/DasiContext';
import type { AppraisalResponse } from '@/app/api/ai-appraisal/route';

interface AppraisalCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AppraisalResponse;
  photoUrl: string | null;
}

export const AppraisalCertificateModal: React.FC<AppraisalCertificateModalProps> = ({
  isOpen,
  onClose,
  result,
  photoUrl,
}) => {
  const { triggerHaptic } = useDevicePlatform();
  const { showToast } = useDasi();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !result) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1920;

    // 1. 다크 프리미엄 배경
    const bg = ctx.createLinearGradient(0, 0, 1080, 1920);
    bg.addColorStop(0, '#1c1511');
    bg.addColorStop(0.5, '#291d17');
    bg.addColorStop(1, '#140e0b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. 테두리
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 12;
    ctx.strokeRect(60, 60, 960, 1800);

    ctx.strokeStyle = 'rgba(197, 160, 89, 0.4)';
    ctx.lineWidth = 3;
    ctx.strokeRect(80, 80, 920, 1760);

    // 3. 헤더
    ctx.textAlign = 'center';
    ctx.fillStyle = '#c5a059';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('DASI OFFICIAL AI & MASTER APPRAISAL', 540, 200);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 68px serif';
    ctx.fillText('디지털 정품 공인 감정서', 540, 300);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '26px monospace';
    ctx.fillText(`CERTIFICATE ID: ${result.appraisalCode}`, 540, 360);

    // 4. 카메라 메타 카드 영역
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.roundRect(120, 430, 840, 560, [24]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(197, 160, 89, 0.3)';
    ctx.stroke();

    ctx.fillStyle = '#c5a059';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(`${result.brand} · ${result.era}`, 540, 510);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 58px serif';
    ctx.fillText(result.modelName, 540, 590);

    // 등급 뱃지
    ctx.fillStyle = '#059669';
    ctx.roundRect(390, 640, 300, 70, [35]);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(`상태 등급: ${result.conditionGrade}급`, 540, 690);

    ctx.fillStyle = '#d9c8b4';
    ctx.font = '26px monospace';
    ctx.fillText(`SERIAL NO: ${result.serialNumber} (정합도 ${result.confidenceScore}%)`, 540, 760);

    // 5. 시세 정보 박스
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.roundRect(140, 810, 800, 150, [20]);
    ctx.fill();

    ctx.fillStyle = '#a89485';
    ctx.font = '24px sans-serif';
    ctx.fillText('국내외 실거래 빅데이터 기반 평균 시세', 540, 860);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 48px monospace';
    ctx.fillText(`₩ ${result.estimatedPriceAvg.toLocaleString()}`, 540, 925);

    // 6. 40년 명장 점검 의견
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.roundRect(120, 1040, 840, 340, [24]);
    ctx.fill();

    ctx.fillStyle = '#c5a059';
    ctx.font = 'bold 28px serif';
    ctx.fillText('충무로 40년 명장 정밀 소견', 540, 1110);

    ctx.fillStyle = '#e8ded1';
    ctx.font = '28px serif';
    ctx.fillText(`외관 상태: ${result.cosmeticCondition || '우수'}`, 540, 1180);
    ctx.fillText(`광학계: ${result.opticalCondition || '곰팡이 없음'}`, 540, 1235);
    ctx.fillText(`구동계: ${result.mechanicalCondition || '정상 작동'}`, 540, 1290);

    // 7. 하단 직인 및 보증 문구
    ctx.fillStyle = '#c5a059';
    ctx.font = 'bold 30px serif';
    ctx.fillText('DASI 충무로 명장 보증 협의체 공인 직인', 540, 1500);

    // 인감 도장 그래픽
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 6;
    ctx.strokeRect(460, 1540, 160, 160);
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 44px serif';
    ctx.fillText('다시', 540, 1610);
    ctx.fillText('공인', 540, 1670);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '22px sans-serif';
    ctx.fillText(`발급일자: ${result.appraisedAt} · www.dasi-market.vercel.app`, 540, 1770);

    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setImageUrl(dataUrl);
    } catch {
      // ignore
    }
  }, [isOpen, result, photoUrl]);

  if (!isOpen || !result) return null;

  const handleDownload = () => {
    triggerHaptic('success');
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `DASI_Appraisal_${result.modelName.replace(/\s+/g, '_')}.jpg`;
    a.click();
    showToast('📥 공인 디지털 감정서가 저장되었습니다! (9:16 인스타 규격)', 'success');
  };

  const handleShare = async () => {
    triggerHaptic('medium');
    if (!imageUrl) return;
    try {
      if (navigator.share) {
        const blob = await (await fetch(imageUrl)).blob();
        const file = new File([blob], 'dasi-appraisal.jpg', { type: 'image/jpeg' });
        await navigator.share({
          title: `DASI 디지털 감정서 - ${result.modelName}`,
          text: `[${result.modelName}] DASI 40년 명장 공인 감정서입니다. 상태 등급: ${result.conditionGrade}급, 시세: ${result.estimatedPriceAvg.toLocaleString()}원`,
          files: [file],
        });
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#20150F] border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl text-white flex flex-col max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-cream">
                DASI 공인 디지털 감정서
              </h3>
              <p className="text-[11px] text-amber-300/80">9:16 모바일 &amp; 인스타 규격</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('selection');
              onClose();
            }}
            className="p-1.5 text-white/60 hover:text-white rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {imageUrl ? (
          <div className="relative aspect-[9/16] w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-amber-400/30">
            <img src={imageUrl} alt="Appraisal Certificate" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="aspect-[9/16] w-full max-w-[280px] mx-auto rounded-2xl bg-black/40 flex items-center justify-center text-xs text-white/50">
            감정서 생성 중...
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            onClick={handleDownload}
            className="py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-serif font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>이미지 저장 (JPG)</span>
          </button>
          <button
            onClick={handleShare}
            className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-serif font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Share2 className="w-4 h-4 text-amber-400" />
            <span>카톡/인스타 공유</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppraisalCertificateModal;
