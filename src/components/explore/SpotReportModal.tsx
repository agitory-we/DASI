'use client';

import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SpotReportModal({ isOpen, onClose, onSuccess }: Props) {
  const { user, openLoginModal } = useAuth();
  const [form, setForm] = useState({ title: '', location: '', goldenHour: '', filmTips: '', bestTime: '', tags: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { onClose(); openLoginModal(); return; }
    if (!form.title || !form.location) return;
    setIsSubmitting(true);
    try {
      const tagsArr = form.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      const { error } = await supabase.from('spot_reports' as any).insert({
        reporter_id: user.id,
        title: form.title,
        location: form.location,
        golden_hour: form.goldenHour || null,
        film_tips: form.filmTips || null,
        best_time: form.bestTime || null,
        tags: tagsArr,
        status: 'pending',
      });
      if (error) throw error;
      setDone(true);
    } catch (err) {
      console.error('[SpotReportModal]:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
        <div className="w-full max-w-sm bg-[#FAF8F5] rounded-3xl p-8 text-center space-y-4 shadow-2xl border border-vintage-200">
          <div className="text-5xl">✅</div>
          <h3 className="font-serif text-xl font-bold text-vintage-900">제보 완료!</h3>
          <p className="text-xs text-vintage-600">검토 후 승인되면 <strong className="text-terracotta">500P</strong>가 자동 적립됩니다.</p>
          <button onClick={() => { setDone(false); setForm({ title: '', location: '', goldenHour: '', filmTips: '', bestTime: '', tags: '' }); onSuccess?.(); onClose(); }} className="px-6 py-2.5 rounded-xl bg-vintage-900 text-white text-xs font-bold hover:bg-terracotta transition-colors">확인</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="relative w-full max-w-md bg-[#FAF8F5] rounded-3xl shadow-2xl border border-vintage-200 max-h-[90vh] overflow-y-auto" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <div className="sticky top-0 bg-[#FAF8F5] flex items-center justify-between p-6 border-b border-vintage-100 z-10">
          <div>
            <h2 className="font-serif text-lg font-bold text-vintage-900">📍 출사 명소 제보하기</h2>
            <p className="text-[11px] text-vintage-500">검증 완료 시 500P 자동 적립</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-vintage-400 hover:text-vintage-800 rounded-full hover:bg-vintage-100"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-vintage-700">장소명 <span className="text-terracotta">*</span></label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="예: 을지로 세운상가 3층 공중보행로" className="w-full px-3.5 py-2.5 rounded-xl border border-vintage-200 bg-white text-xs text-vintage-900 focus:outline-none focus:border-terracotta" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-vintage-700">상세 주소 <span className="text-terracotta">*</span></label>
            <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="예: 서울 중구 을지로 157" className="w-full px-3.5 py-2.5 rounded-xl border border-vintage-200 bg-white text-xs text-vintage-900 focus:outline-none focus:border-terracotta" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-vintage-700">추천 골든아워</label>
              <input value={form.goldenHour} onChange={e => setForm(f => ({ ...f, goldenHour: e.target.value }))} placeholder="17:00 ~ 18:00" className="w-full px-3.5 py-2.5 rounded-xl border border-vintage-200 bg-white text-xs text-vintage-900 focus:outline-none focus:border-terracotta" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-vintage-700">최적 시기</label>
              <input value={form.bestTime} onChange={e => setForm(f => ({ ...f, bestTime: e.target.value }))} placeholder="봄, 가을 오후" className="w-full px-3.5 py-2.5 rounded-xl border border-vintage-200 bg-white text-xs text-vintage-900 focus:outline-none focus:border-terracotta" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-vintage-700">필름 추스 팁 (선택)</label>
            <textarea value={form.filmTips} onChange={e => setForm(f => ({ ...f, filmTips: e.target.value }))} rows={3} placeholder="예: Kodak Portra 400으로 찍으면..." className="w-full px-3.5 py-2.5 rounded-xl border border-vintage-200 bg-white text-xs text-vintage-900 focus:outline-none focus:border-terracotta resize-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-vintage-700">태그 (쉼표 구분)</label>
            <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="예: 을지로, 노을명소" className="w-full px-3.5 py-2.5 rounded-xl border border-vintage-200 bg-white text-xs text-vintage-900 focus:outline-none focus:border-terracotta" />
          </div>
          <button type="submit" disabled={isSubmitting || !form.title || !form.location} className="w-full py-3 rounded-xl bg-vintage-900 hover:bg-terracotta disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors">
            {isSubmitting ? '제출 중...' : <><Send className="w-3.5 h-3.5" />제보 보내기 (+500P 예정)</>}
          </button>
        </form>
      </div>
    </div>
  );
}
