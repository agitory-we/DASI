'use client';

import React, { useState } from 'react';
import { X, Camera, Film, MapPin, Sparkles, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { useDasi } from '@/context/DasiContext';
import { useAuth } from '@/context/AuthContext';
import { playShutterSound } from '@/utils/shutterAudio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultCameraModel?: string;
  defaultLabName?: string;
}

const PRESET_IMAGES = [
  { label: '노을빛 골목', url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80' },
  { label: '클래식 거리', url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80' },
  { label: '청량한 바다', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80' },
  { label: '감성 한옥', url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80' },
];

export function PhotoUploadModal({
  isOpen,
  onClose,
  defaultCameraModel,
  defaultLabName,
}: Props) {
  const { uploadCommunityPhoto, showToast, cameras, analogSpots } = useDasi();
  const { user, profile, openLoginModal, awardPoints } = useAuth();

  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [caption, setCaption] = useState('');
  const [cameraModel, setCameraModel] = useState(defaultCameraModel || 'Olympus PEN EE-3');
  const [filmType, setFilmType] = useState('Kodak Gold 200');
  const [labName, setLabName] = useState(defaultLabName || '망우삼림 (망우포토)');
  const [location, setLocation] = useState('을지로 세운상가 옥상');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onClose();
      openLoginModal();
      return;
    }

    if (!caption.trim()) {
      showToast('사진에 얽힌 짧은 한 줄 스토리를 입력해 주세요.', 'warning');
      return;
    }

    setIsSubmitting(true);
    playShutterSound('slr');

    try {
      uploadCommunityPhoto({
        imageUrl,
        caption: caption.trim(),
        cameraModel,
        filmType,
        labName,
        location,
        photographerName: profile?.nickname || user.email?.split('@')[0] || '익명 필름러',
        photographerTier: profile?.tier || 'filmmer',
      });

      // 포인트 +150P 지급
      await awardPoints('photo_upload', `photo_${Date.now()}`);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl shadow-2xl border-4 border-vintage-300 p-6 sm:p-7 space-y-5 cursor-default max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-vintage-400 hover:text-vintage-800 rounded-full hover:bg-vintage-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>출사 사진 공유하고 +150P 적립</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-vintage-900">
            필름 출사 사진 업로드
          </h2>
          <p className="text-xs text-vintage-600">
            등록한 사진은 해당 카메라 렌탈 상세 페이지와 현상소 지도의 실사용 샘플로 자동 노출됩니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이미지 미리보기 및 프리셋 선택 */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-vintage-800">사진 선택 *</label>
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-vintage-900 border border-vintage-300">
              <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] text-white font-mono">
                {cameraModel} · {filmType}
              </div>
            </div>
            {/* 프리셋 선택 칩 */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              <span className="text-vintage-400 shrink-0">샘플:</span>
              {PRESET_IMAGES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImageUrl(preset.url)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
                    imageUrl === preset.url
                      ? 'bg-vintage-900 text-white font-bold'
                      : 'bg-vintage-100 text-vintage-700 hover:bg-vintage-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 한줄 스토리 */}
          <div>
            <label className="block text-xs font-bold text-vintage-800 mb-1">한줄 출사 코멘트 *</label>
            <textarea
              required
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="예: 을지로 세운상가 옥상 일몰. 하프 카메라라 72장 마음껏 연사했습니다!"
              className="w-full text-xs p-3 rounded-xl border border-vintage-200 bg-white focus:outline-none focus:border-terracotta resize-none text-vintage-900"
            />
          </div>

          {/* 기종 & 필름 태그 선택 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-vintage-800 mb-1 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-terracotta" />
                <span>카메라 기종</span>
              </label>
              <select
                value={cameraModel}
                onChange={(e) => setCameraModel(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-vintage-200 bg-white text-xs text-vintage-900 focus:outline-none focus:border-terracotta font-medium"
              >
                {cameras.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-vintage-800 mb-1 flex items-center gap-1">
                <Film className="w-3.5 h-3.5 text-amber-600" />
                <span>사용 필름</span>
              </label>
              <select
                value={filmType}
                onChange={(e) => setFilmType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-vintage-200 bg-white text-xs text-vintage-900 focus:outline-none focus:border-terracotta font-medium"
              >
                <option value="Kodak Gold 200">Kodak Gold 200</option>
                <option value="Kodak UltraMax 400">Kodak UltraMax 400</option>
                <option value="Fujifilm 200">Fujifilm 200</option>
                <option value="Kodak Portra 400">Kodak Portra 400</option>
                <option value="Ilford HP5 Plus 400">Ilford HP5 Plus 400 (흑백)</option>
              </select>
            </div>
          </div>

          {/* 현상소 & 위치 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-vintage-800 mb-1 flex items-center gap-1">
                <span>🧪 현상소</span>
              </label>
              <select
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-vintage-200 bg-white text-xs text-vintage-900 focus:outline-none focus:border-terracotta font-medium"
              >
                {analogSpots.filter(s => s.category === 'lab').map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-vintage-800 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>촬영 장소</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="예: 을지로 세운상가"
                className="w-full p-2.5 rounded-xl border border-vintage-200 bg-white text-xs text-vintage-900 focus:outline-none focus:border-terracotta font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-vintage-900 hover:bg-terracotta text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{isSubmitting ? '업로드 중...' : '출사 사진 등록하기 (+150P 즉시 적립)'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}