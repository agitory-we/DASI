'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  Share2,
  Download,
  Check,
  RotateCcw
} from 'lucide-react';

export default function FrameMakerPage() {
  const [selectedModel, setSelectedModel] = useState<string>('Nikon FM2 / Nikkor 50mm F1.4');
  const [selectedLab, setSelectedLab] = useState<string>('망우삼림 을지로 (Fuji Frontier SP3000)');
  const [dateText, setDateText] = useState<string>('2026.09.22');
  const [frameColor, setFrameColor] = useState<'white' | 'black' | 'cream'>('cream');
  const [isCopied, setIsCopied] = useState(false);

  const samplePhoto = 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1000&auto=format&fit=crop&q=80';

  const handleShare = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    alert('인스타그램 스토리 공유용 이미지가 클립보드에 복사되었습니다! #DASI #다시필름 태그와 함께 올려보세요.');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>DASI Analog Frame Maker (인스타 바이럴)</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-vintage-900">
          아날로그 필름 프레임 생성기
        </h1>
        <p className="text-xs sm:text-sm text-vintage-600">
          내가 찍은 스캔본에 카메라 기종과 현상소 정보가 담긴 감성 필름 프레임을 입혀 인스타그램에 자랑해 보세요.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Canvas Preview */}
        <div className="lg:col-span-7 flex justify-center">
          <div
            className={`w-full max-w-md p-6 rounded-2xl shadow-xl border transition-colors flex flex-col items-center ${
              frameColor === 'white'
                ? 'bg-white border-vintage-200'
                : frameColor === 'black'
                ? 'bg-[#1a1816] text-white border-vintage-800'
                : 'bg-[#FAF7F0] border-vintage-300'
            }`}
          >
            {/* Inner Photo Frame */}
            <div className="relative aspect-[4/5] w-full rounded-lg overflow-hidden bg-vintage-200 shadow-inner">
              <img
                src={samplePhoto}
                alt="Sample frame preview"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Bottom Analog Metadata Strip */}
            <div className="w-full pt-4 px-1 flex items-end justify-between text-[11px] font-mono opacity-85">
              <div className="space-y-0.5">
                <div className="font-bold tracking-tight">📷 {selectedModel}</div>
                <div className="text-[9px] opacity-75">LAB: {selectedLab}</div>
              </div>
              <div className="text-right space-y-0.5">
                <div className="font-bold tracking-wider">{dateText}</div>
                <div className="text-[9px] text-terracotta font-bold tracking-widest">DASI.KR</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Customization Controls */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-vintage-200 p-6 space-y-6 shadow-xs">
          <h3 className="font-serif text-lg font-bold text-vintage-900">
            프레임 세부 설정
          </h3>

          <div className="space-y-4 text-xs">
            {/* Frame Background Color */}
            <div className="space-y-2">
              <label className="font-bold text-vintage-800">프레임 배경 색상</label>
              <div className="flex gap-2">
                {[
                  { id: 'cream', label: '빈티지 크림' },
                  { id: 'white', label: '모던 화이트' },
                  { id: 'black', label: '매트 블랙' },
                ].map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setFrameColor(col.id as any)}
                    className={`flex-1 py-2 rounded-xl border font-semibold transition-all ${
                      frameColor === col.id
                        ? 'border-terracotta bg-terracotta/10 text-terracotta'
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
                className="w-full p-2.5 rounded-xl border border-vintage-300 focus:outline-none focus:border-terracotta"
              >
                <option value="Nikon FM2 / Nikkor 50mm F1.4">Nikon FM2 / Nikkor 50mm F1.4</option>
                <option value="Olympus PEN EE-3 / D.Zuiko 28mm">Olympus PEN EE-3 / D.Zuiko 28mm</option>
                <option value="Fujifilm X100VI / Classic Chrome">Fujifilm X100VI / Classic Chrome</option>
                <option value="Ricoh GR IIIx / Positive Film">Ricoh GR IIIx / Positive Film</option>
                <option value="Leica M6 / Summicron 35mm">Leica M6 / Summicron 35mm</option>
              </select>
            </div>

            {/* Lab Select */}
            <div className="space-y-1.5">
              <label className="font-bold text-vintage-800">현상소 및 스캐너</label>
              <select
                value={selectedLab}
                onChange={(e) => setSelectedLab(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-vintage-300 focus:outline-none focus:border-terracotta"
              >
                <option value="망우삼림 을지로 (Fuji Frontier SP3000)">망우삼림 을지로 (Fuji SP3000)</option>
                <option value="고래사진관 충무로 (Noritsu HS-1800)">고래사진관 충무로 (Noritsu HS-1800)</option>
                <option value="성수 필름로그 Lab">성수 필름로그 Lab</option>
                <option value="남대문 중앙사 오버홀">남대문 중앙사 오버홀</option>
              </select>
            </div>

            {/* Date Input */}
            <div className="space-y-1.5">
              <label className="font-bold text-vintage-800">촬영/현상 일자</label>
              <input
                type="text"
                value={dateText}
                onChange={(e) => setDateText(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-vintage-300 focus:outline-none focus:border-terracotta"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={handleShare}
              className="w-full py-3 rounded-xl bg-terracotta hover:bg-terracotta-light text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Share2 className="w-4 h-4" />
              <span>{isCopied ? '복사 완료! 인스타에 붙여넣기' : '인스타그램 스토리용 이미지 생성 & 공유'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
