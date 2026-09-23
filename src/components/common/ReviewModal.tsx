'use client';

import React, { useState } from 'react';
import { X, Star, Send, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'camera' | 'spot' | 'lab';
  targetId: string;
  targetName: string;
  onSuccess?: () => void;
}

const POPULAR_FILMS = [
  'Kodak Portra 400',
  'Kodak ColorPlus 200',
  'Kodak Gold 200',
  'Fuji Superia 400',
  'Ilford HP5 Plus',
  'Cinestill 800T'
];

const PRESET_SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=800&auto=format&fit=crop&q=80'
];

export function ReviewModal({ isOpen, onClose, targetType, targetId, targetName, onSuccess }: Props) {
  const { user, openLoginModal, awardPoints } = useAuth();
  const [rating, setRating] = useState(5);
  const [filmUsed, setFilmUsed] = useState('Kodak Portra 400');
  const [content, setContent] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(PRESET_SAMPLE_PHOTOS[0]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onClose();
      openLoginModal();
      return;
    }
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const finalPhoto = customPhotoUrl.trim() || selectedPhoto;
      await supabase.from('user_reviews' as any).insert({
        user_id: user.id,
        target_type: targetType,
        target_id: targetId,
        rating,
        content,
        film_used: filmUsed,
        image_urls: finalPhoto ? [finalPhoto] : [],
        points_awarded: true
      });

      await awardPoints('film_review', targetId);
      setDone(true);
    } catch (err) {
      console.error('[ReviewModal] error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
        <div className="w-full max-w-sm bg-[#FAF8F5] rounded-3xl p-8 text-center space-y-4 shadow-2xl border border-vintage-200">
          <div className="text-4xl">⭐</div>
          <h3 className="font-serif text-xl font-bold text-vintage-900">리뷰 등록 완료!</h3>
          <p className="text-xs text-vintage-600 leading-relaxed">
            생태계 기여 보너스로 <strong className="text-terracotta font-bold">+100P</strong>가 적립되었습니다. 다른 사용자들의 기기 선택에 소중한 영감이 됩니다.
          </p>
          <button
            onClick={() => {
              setDone(false);
              setContent('');
              onSuccess?.();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-vintage-900 text-white text-xs font-bold hover:bg-terracotta transition-colors shadow-xs"
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn" onClick={onClose}>
      <div
        className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl shadow-2xl border border-vintage-200 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#FAF8F5] flex items-center justify-between p-6 border-b border-vintage-100 z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold mb-1">
              <Sparkles className="w-3 h-3 text-amber-700" />
              <span>실사용 1컷 리뷰 (+100P 적립)</span>
            </div>
            <h2 className="font-serif text-lg font-bold text-vintage-900">
              [{targetName}] 실사용 후기 &amp; 팁
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-vintage-400 hover:text-vintage-800 rounded-full hover:bg-vintage-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-vintage-700">만족도 평점</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-2xl transition-transform hover:scale-110"
                >
                  <Star
                    className={'w-6 h-6 ' + (star <= rating ? 'text-amber-400 fill-amber-400' : 'text-vintage-300')}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-vintage-800 ml-2">{rating}점 / 5점</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-vintage-700">함께 사용한 필름</label>
            <div className="flex flex-wrap gap-1.5 pb-1">
              {POPULAR_FILMS.map((film) => (
                <button
                  type="button"
                  key={film}
                  onClick={() => setFilmUsed(film)}
                  className={'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ' + (
                    filmUsed === film
                      ? 'bg-vintage-900 text-white'
                      : 'bg-white border border-vintage-200 text-vintage-700 hover:bg-vintage-100'
                  )}
                >
                  {film}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={filmUsed}
              onChange={(e) => setFilmUsed(e.target.value)}
              placeholder="또는 필름 기종 직접 입력"
              className="w-full px-3 py-2 rounded-xl border border-vintage-200 bg-white text-xs text-vintage-900 focus:outline-none focus:border-terracotta"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-vintage-700">실제 촬영 결과물 사진 1장</label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_SAMPLE_PHOTOS.map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedPhoto(url);
                    setCustomPhotoUrl('');
                  }}
                  className={'relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ' + (
                    selectedPhoto === url && !customPhotoUrl
                      ? 'border-terracotta ring-2 ring-terracotta/20 scale-95'
                      : 'border-vintage-200 opacity-70 hover:opacity-100'
                  )}
                >
                  <img src={url} alt="Sample" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <input
              type="url"
              value={customPhotoUrl}
              onChange={(e) => setCustomPhotoUrl(e.target.value)}
              placeholder="또는 외부 이미지 URL 직접 입력 (선택)"
              className="w-full px-3 py-2 rounded-xl border border-vintage-200 bg-white text-xs text-vintage-900 focus:outline-none focus:border-terracotta"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-vintage-700">
              조작감 &amp; 촬영 팁 <span className="text-terracotta">*</span>
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="예: 셔터 소리가 묵직해서 손맛이 최고입니다. 골든아워 노을빛 역광에서 조리개를 f/2.8로 열고 찍으면 몽환적인 플레어가 잡힙니다."
              className="w-full p-3 rounded-xl border border-vintage-200 bg-white text-xs text-vintage-900 focus:outline-none focus:border-terracotta resize-none leading-relaxed"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="w-full py-3 rounded-xl bg-vintage-900 hover:bg-terracotta disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            {isSubmitting ? <span className="animate-spin">⏳</span> : <Send className="w-3.5 h-3.5" />}
            <span>{isSubmitting ? '등록 중...' : '리뷰 등록하고 +100P 받기'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
