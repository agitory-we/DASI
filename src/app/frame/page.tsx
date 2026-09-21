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
  Image as ImageIcon
} from 'lucide-react';

export default function FrameMakerPage() {
  const [selectedModel, setSelectedModel] = useState<string>('Nikon FM2 / Nikkor 50mm F1.4');
  const [selectedLab, setSelectedLab] = useState<string>('망우삼림 을지로 (Fuji Frontier SP3000)');
  const [dateText, setDateText] = useState<string>('2026.09.22');
  const [frameColor, setFrameColor] = useState<'cream' | 'white' | 'black'>('cream');
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string>(
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1000&auto=format&fit=crop&q=80'
  );
  const [isGenerating, setIsGenerating] = useState(false);

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
          <div className="pt-2 space-y-2">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="w-full py-3.5 rounded-xl bg-terracotta hover:bg-terracotta-light text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? '이미지 렌더링 중...' : '고화질 PNG 이미지 파일 다운로드'}</span>
            </button>

            <button
              onClick={() => {
                alert('DASI 인스타 공식 계정(@dasi.vintage)을 태그하고 피드에 올려주시면 다음 카메라 렌탈 3,000원 쿠폰을 드립니다!');
              }}
              className="w-full py-2.5 rounded-xl border border-vintage-300 hover:bg-vintage-50 text-vintage-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>#DASI 인스타 챌린지 혜택 보기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
