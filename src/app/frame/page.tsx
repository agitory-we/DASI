'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Camera,
  Share2,
  Download,
  Upload,
  RotateCcw,
  Check,
  Image as ImageIcon,
  ShieldCheck,
  Box,
  Gift,
  X,
  Printer
} from 'lucide-react';
import { playShutterSound } from '@/utils/shutterAudio';

export default function FrameMakerPage() {
  const [selectedModel, setSelectedModel] = useState<string>('Nikon FM2 / Nikkor 50mm F1.4');
  const [selectedLab, setSelectedLab] = useState<string>('망우삼림 을지로 (Fuji Frontier SP3000)');
  const [dateText, setDateText] = useState<string>('2026.09.22');
  const [frameColor, setFrameColor] = useState<'cream' | 'white' | 'black'>('cream');
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string>(
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1000&auto=format&fit=crop&q=80'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPhysicalOrderModalOpen, setIsPhysicalOrderModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [woodType, setWoodType] = useState<'oak' | 'walnut' | 'cherry'>('oak');
  const [paperType, setPaperType] = useState<'hahnemuhle' | 'fuji_crystal'>('hahnemuhle');
  const [frameSize, setFrameSize] = useState<'A4' | 'A3'>('A4');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Redraw canvas whenever settings change
  useEffect(() => {
    drawFrame();
  }, [selectedModel, selectedLab, dateText, frameColor, uploadedImageSrc]);

  const drawFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High resolution Instagram 4:5 ratio (1080 x 1350)
    canvas.width = 1080;
    canvas.height = 1350;

    // Background color
    ctx.fillStyle = frameColor === 'cream' ? '#FAF6EE' : frameColor === 'white' ? '#FFFFFF' : '#181614';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load photo
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Photo dimensions inside frame
      const paddingX = 70;
      const paddingTop = 70;
      const photoWidth = canvas.width - paddingX * 2; // 940
      const photoHeight = 1080; // 940 x 1080 (approx 4:4.6)

      // Draw subtle photo border / shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.08)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 12;
      ctx.fillStyle = '#E5DFD5';
      ctx.fillRect(paddingX, paddingTop, photoWidth, photoHeight);
      ctx.restore();

      // Draw image object-cover inside target rect
      drawImageProp(ctx, img, paddingX, paddingTop, photoWidth, photoHeight);

      // Bottom Metadata Section
      const bottomAreaY = paddingTop + photoHeight + 35;

      ctx.fillStyle = frameColor === 'black' ? '#FFFFFF' : '#2D241E';
      ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
      ctx.fillText(`📷 ${selectedModel}`, paddingX + 5, bottomAreaY + 32);

      ctx.fillStyle = frameColor === 'black' ? '#A39990' : '#736458';
      ctx.font = '22px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
      ctx.fillText(`LAB: ${selectedLab}`, paddingX + 5, bottomAreaY + 70);

      // Right-aligned Date and DASI branding
      ctx.textAlign = 'right';
      ctx.fillStyle = frameColor === 'black' ? '#FFFFFF' : '#2D241E';
      ctx.font = 'bold 28px monospace';
      ctx.fillText(dateText, canvas.width - paddingX - 5, bottomAreaY + 32);

      ctx.fillStyle = '#C85A38'; // Terracotta
      ctx.font = 'bold 22px monospace';
      ctx.fillText('DASI.KR · VINTAGE', canvas.width - paddingX - 5, bottomAreaY + 70);
      ctx.textAlign = 'left';
    };
    img.src = uploadedImageSrc;
  };

  // Helper for drawImage object-cover
  function drawImageProp(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    const imgRatio = img.width / img.height;
    const targetRatio = w / h;
    let sx, sy, sWidth, sHeight;

    if (imgRatio > targetRatio) {
      sHeight = img.height;
      sWidth = img.height * targetRatio;
      sx = (img.width - sWidth) / 2;
      sy = 0;
    } else {
      sWidth = img.width;
      sHeight = img.width / targetRatio;
      sx = 0;
      sy = (img.height - sHeight) / 2;
    }

    ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadedImageSrc(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    playShutterSound('slr');
    setIsGenerating(true);
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `DASI_${selectedModel.split('/')[0].trim()}_${dateText}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setIsGenerating(false);
    }, 300);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>DASI Analog Frame Maker</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-vintage-900">
          인스타그램 필름 프레임 생성기
        </h1>
        <p className="text-xs sm:text-sm text-vintage-600">
          내 스마트폰의 실제 사진을 올리고 감성 프레임을 입혀 <strong>고화질 4:5 인스타 규격 이미지</strong>로 다운로드하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: High-Res HTML5 Canvas Preview */}
        <div className="lg:col-span-7 flex flex-col items-center space-y-4">
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-vintage-300 bg-vintage-100">
            <canvas
              ref={canvasRef}
              className="w-full h-auto block"
            />
          </div>
          <p className="text-[11px] text-vintage-500 text-center">
            ✨ 인스타그램 피드 및 스토리에 최적화된 1080 × 1350 픽셀 규격입니다.
          </p>
        </div>

        {/* Right: Controls & Upload */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-vintage-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-vintage-100 pb-3">
            <h3 className="font-serif text-lg font-bold text-vintage-900">
              프레임 커스텀 설정
            </h3>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-terracotta/10 hover:bg-terracotta/20 text-terracotta text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>내 사진 불러오기</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          <div className="space-y-4 text-xs">
            {/* Frame Background Color */}
            <div className="space-y-2">
              <label className="font-bold text-vintage-800">프레임 색상</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cream', label: '빈티지 크림' },
                  { id: 'white', label: '모던 화이트' },
                  { id: 'black', label: '매트 블랙' },
                ].map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setFrameColor(col.id as any)}
                    className={`py-2.5 rounded-xl border font-semibold transition-all ${
                      frameColor === col.id
                        ? 'border-terracotta bg-terracotta/10 text-terracotta ring-2 ring-terracotta/20'
                        : 'border-vintage-200 hover:bg-vintage-50 text-vintage-700'
                    }`}
                  >
                    {col.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Model Select */}
            <div className="space-y-1.5">
              <label className="font-bold text-vintage-800">촬영 기종 및 렌즈</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-vintage-300 focus:outline-none focus:border-terracotta text-xs"
              >
                <option value="Nikon FM2 / Nikkor 50mm F1.4">Nikon FM2 / Nikkor 50mm F1.4</option>
                <option value="Olympus PEN EE-3 / D.Zuiko 28mm">Olympus PEN EE-3 / D.Zuiko 28mm</option>
                <option value="Fujifilm X100VI / Classic Chrome">Fujifilm X100VI / Classic Chrome</option>
                <option value="Ricoh GR IIIx / Positive Film">Ricoh GR IIIx / Positive Film</option>
                <option value="Leica M6 / Summicron 35mm">Leica M6 / Summicron 35mm</option>
                <option value="Contax T2 / Sonnar 38mm F2.8">Contax T2 / Sonnar 38mm F2.8</option>
              </select>
            </div>

            {/* Lab Select */}
            <div className="space-y-1.5">
              <label className="font-bold text-vintage-800">현상소 및 스캐너 정보</label>
              <select
                value={selectedLab}
                onChange={(e) => setSelectedLab(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-vintage-300 focus:outline-none focus:border-terracotta text-xs"
              >
                <option value="망우삼림 을지로 (Fuji Frontier SP3000)">망우삼림 을지로 (Fuji SP3000)</option>
                <option value="고래사진관 충무로 (Noritsu HS-1800)">고래사진관 충무로 (Noritsu HS-1800)</option>
                <option value="성수 필름로그 Lab">성수 필름로그 Lab</option>
                <option value="남대문 중앙사 오버홀 점검">남대문 중앙사 오버홀 점검</option>
              </select>
            </div>

            {/* Date Input */}
            <div className="space-y-1.5">
              <label className="font-bold text-vintage-800">촬영 / 현상 날짜</label>
              <input
                type="text"
                value={dateText}
                onChange={(e) => setDateText(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-vintage-300 focus:outline-none focus:border-terracotta font-mono text-xs"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2.5">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="w-full py-3.5 rounded-xl bg-terracotta hover:bg-terracotta-light text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? '이미지 렌더링 중...' : '고화질 PNG 이미지 다운로드 (무료)'}</span>
            </button>

            <button
              onClick={() => setIsPhysicalOrderModalOpen(true)}
              className="w-full py-3 rounded-xl bg-vintage-900 hover:bg-vintage-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Box className="w-4 h-4 text-amber-300" />
              <span>장인 수제 원목 액자 &amp; 파인아트 인화 주문 제작</span>
            </button>

            <button
              onClick={() => setIsChallengeModalOpen(true)}
              className="w-full py-2.5 rounded-xl border border-vintage-300 hover:bg-vintage-50 text-vintage-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Gift className="w-3.5 h-3.5 text-terracotta" />
              <span>#DASI 인스타 챌린지 혜택 (3,000원 쿠폰)</span>
            </button>
          </div>
        </div>
      </div>

      {/* PHYSICAL WOODEN FRAME ORDER MODAL */}
      {isPhysicalOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-vintage-200 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-vintage-100 pb-3">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-terracotta" />
                <h3 className="font-serif text-xl font-bold text-vintage-900">
                  을지로 40년 장인 수제 원목 액자 주문
                </h3>
              </div>
              <button
                onClick={() => setIsPhysicalOrderModalOpen(false)}
                className="p-1.5 text-vintage-400 hover:text-vintage-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-vintage-700">
              <p className="text-vintage-600 leading-relaxed">
                현재 생성된 사진을 <strong>독일 하네뮬레(Hahnemühle) 파인아트 코튼지</strong>에 12색 피그먼트로 암실 인화하고, 을지로 40년 목공 장인이 짜 맞춘 북미산 천연 원목 프레임에 담아 배송해 드립니다.
              </p>

              {/* Wood Type Selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-vintage-900">1. 원목 수종 선택</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'oak', label: '화이트 오크', desc: '따뜻한 내추럴' },
                    { id: 'walnut', label: '북미산 월넛', desc: '고급스러운 딥브라운' },
                    { id: 'cherry', label: '체리우드', desc: '붉은빛 클래식' },
                  ].map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setWoodType(w.id as any)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        woodType === w.id
                          ? 'border-terracotta bg-terracotta/5 font-bold text-terracotta'
                          : 'border-vintage-200 hover:bg-vintage-50 text-vintage-700'
                      }`}
                    >
                      <div>{w.label}</div>
                      <div className="text-[10px] opacity-75">{w.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Frame Size Selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-vintage-900">2. 액자 규격</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'A4', label: 'A4 클래식 데스크형', price: '48,000원' },
                    { id: 'A3', label: 'A3 와이드 벽걸이형', price: '72,000원' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setFrameSize(s.id as any)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        frameSize === s.id
                          ? 'border-terracotta bg-terracotta/5 font-bold text-terracotta'
                          : 'border-vintage-200 hover:bg-vintage-50 text-vintage-700'
                      }`}
                    >
                      <div>{s.label}</div>
                      <div className="text-[11px] text-terracotta font-bold mt-0.5">{s.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-vintage-50 border border-vintage-200 rounded-2xl space-y-1.5">
                <div className="flex justify-between font-bold text-vintage-900">
                  <span>총 주문 견적</span>
                  <span className="text-terracotta text-sm">
                    {frameSize === 'A4' ? '48,000원' : '72,000원'} (무료 배송)
                  </span>
                </div>
                <div className="text-[10px] text-vintage-500">
                  제작처: 을지로 삼우목공사 · 인화: 충무로 파인아트 랩
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsPhysicalOrderModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-vintage-300 text-vintage-700 text-xs font-semibold"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  alert('원목 액자 제작 의뢰가 접수되었습니다! 장인님이 사진 해상도를 최종 검수한 뒤 카카오톡으로 시안을 전송해 드립니다.');
                  setIsPhysicalOrderModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-terracotta text-white text-xs font-bold hover:bg-terracotta-light transition-colors"
              >
                장인 액자 제작 결제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSTA CHALLENGE MODAL */}
      {isChallengeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-vintage-200 p-6 sm:p-8 space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto border border-amber-500/20">
              <Gift className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-xl font-bold text-vintage-900">
                #DASI 인스타그램 챌린지
              </h3>
              <p className="text-xs text-vintage-600 leading-relaxed">
                다운로드한 감성 프레임 사진을 인스타그램 피드에 <strong>@dasi.vintage</strong> 태그와 함께 게시해 주시면, 확인 즉시 <strong>다음 카메라 렌탈 3,000원 할인 쿠폰</strong>이 마이 캐비닛 지갑으로 자동 지급됩니다!
              </p>
            </div>

            <div className="p-3 bg-vintage-50 rounded-xl border border-vintage-200 text-[11px] text-vintage-700 font-mono">
              필수 해시태그: #다시마켓 #아날로그감성 #DASI
            </div>

            <button
              onClick={() => setIsChallengeModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-vintage-900 text-white text-xs font-semibold hover:bg-terracotta transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
