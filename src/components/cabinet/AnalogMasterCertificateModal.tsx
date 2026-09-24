'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Award,
  Download,
  Share2,
  X,
  Sparkles,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { useDevicePlatform } from '@/hooks/useDevicePlatform';
import { useDasi } from '@/context/DasiContext';

interface AnalogMasterCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  holderName: string;
  stampedCount: number;
  totalSpots: number;
}

export const AnalogMasterCertificateModal: React.FC<AnalogMasterCertificateModalProps> = ({
  isOpen,
  onClose,
  holderName,
  stampedCount,
  totalSpots,
}) => {
  const { triggerHaptic } = useDevicePlatform();
  const { showToast } = useDasi();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const certNumber = 'CERT-2026-DASI-8821';
  const issueDate = '2026.09.24';

  useEffect(() => {
    if (!isOpen) return;

    // Canvas 1080x1920 (9:16 인스타 스토리 규격) 렌더링
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1920;

    // 1. 다크 빈티지 배경
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
    bgGrad.addColorStop(0, '#1c130d');
    bgGrad.addColorStop(0.5, '#2e1f16');
    bgGrad.addColorStop(1, '#150d09');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. 골드 테두리 프레임
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 14;
    ctx.strokeRect(60, 60, 960, 1800);

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(84, 84, 912, 1752);

    // 3. 상단 헤더 텍스트
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f5e6c8';
    ctx.font = 'bold 36px serif';
    ctx.fillText('REPUBLIC OF DASI · ANALOG HERITAGE', 540, 220);

    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 74px serif';
    ctx.fillText('아날로그 성지순례 마스터', 540, 340);

    ctx.fillStyle = '#e8ded1';
    ctx.font = '28px sans-serif';
    ctx.fillText('CERTIFICATE OF ANALOG ACCOMPLISHMENT', 540, 400);

    // 구분선
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(340, 440);
    ctx.lineTo(740, 440);
    ctx.stroke();

    // 4. 수여 대상자 박스
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.roundRect(140, 520, 800, 320, [30]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
    ctx.stroke();

    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('PASSPORT HOLDER', 540, 600);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px serif';
    ctx.fillText(holderName || '아날로그 필름러', 540, 690);

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(`서울 아날로그 성지 ${stampedCount}/${totalSpots} 스탬프 완주 공인`, 540, 770);

    // 5. 본문 서약 및 인증 문구
    ctx.fillStyle = '#d9c8b4';
    ctx.font = '32px serif';
    ctx.fillText('위 사람은 충무로와 을지로의 40년 카메라 헤리티지 거리와', 540, 940);
    ctx.fillText('빈티지 필름 현상소를 직접 탐방하여 아날로그 사진 문화를', 540, 990);
    ctx.fillText('계승하고 기록하는 [DASI 아날로그 마스터]임을 보증합니다.', 540, 1040);

    // 6. 스탬프 뱃지 4개 그래픽
    const spots = ['망우삼림', '을지로 신성카메라', '충무로 보성광학', '세운상가 일몰'];
    spots.forEach((spot, i) => {
      const x = 320 + (i % 2) * 440;
      const y = 1180 + Math.floor(i / 2) * 160;

      ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
      ctx.beginPath();
      ctx.arc(x, y, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('STAMPED', x, y - 8);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(spot.slice(0, 6), x, y + 22);
    });

    // 7. 하단 골드 실링 및 서명
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 28px serif';
    ctx.fillText('DASI 충무로 명장 보증 협의체 공인', 540, 1580);

    ctx.fillStyle = 'rgba(245, 230, 200, 0.6)';
    ctx.font = '24px monospace';
    ctx.fillText(`SERIAL NO: ${certNumber} · ISSUED: ${issueDate}`, 540, 1640);

    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#d4af37';
    ctx.fillText('www.dasi-market.vercel.app', 540, 1760);

    // DataURL 생성
    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setImageUrl(dataUrl);
    } catch {
      // ignore
    }
  }, [isOpen, holderName, stampedCount, totalSpots]);

  if (!isOpen) return null;

  const handleDownload = () => {
    triggerHaptic('success');
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `DASI_Master_Certificate_${holderName || 'Film'}.jpg`;
    a.click();
    showToast('📥 아날로그 마스터 수료증이 저장되었습니다! (인스타 9:16 규격)', 'success');
  };

  const handleShare = async () => {
    triggerHaptic('medium');
    if (!imageUrl) return;
    try {
      if (navigator.share) {
        const blob = await (await fetch(imageUrl)).blob();
        const file = new File([blob], 'dasi-certificate.jpg', { type: 'image/jpeg' });
        await navigator.share({
          title: 'DASI 아날로그 마스터 수료증',
          text: `${holderName}님의 서울 아날로그 성지순례 완주 인증서입니다. #DASI #필름카메라`,
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
      <div className="relative w-full max-w-md bg-[#20150F] border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl text-white flex flex-col max-h-[90vh] overflow-y-auto">
        {/* 상단 바 */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-cream">
                아날로그 마스터 디지털 수료증
              </h3>
              <p className="text-[11px] text-amber-300/80">인스타그램 스토리(9:16) 공유용</p>
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

        {/* 숨김 캔버스 (1080x1920 생성용) */}
        <canvas ref={canvasRef} className="hidden" />

        {/* 프리뷰 카드 (9:16 비율) */}
        {imageUrl ? (
          <div className="relative aspect-[9/16] w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-amber-400/30 group">
            <img src={imageUrl} alt="DASI Master Certificate" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />
          </div>
        ) : (
          <div className="aspect-[9/16] w-full max-w-[280px] mx-auto rounded-2xl bg-black/40 flex items-center justify-center text-xs text-white/50">
            수료증 렌더링 중...
          </div>
        )}

        {/* 버튼 액션 바 */}
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
            <span>인스타 공유하기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
