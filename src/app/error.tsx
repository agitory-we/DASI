'use client';

import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-vintage-200 shadow-sm">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-rose-700 uppercase">System Notice</span>
          <h1 className="font-serif text-2xl font-bold text-vintage-900">
            화면을 불러오는 중 오류가 발생했습니다
          </h1>
          <p className="text-xs text-vintage-600 leading-relaxed">
            일시적인 통신 상태 문제일 수 있습니다. 아래 재시도 버튼을 눌러주세요.
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white font-bold text-xs inline-flex items-center gap-2 transition-colors shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>다시 시도하기</span>
        </button>
      </div>
    </div>
  );
}
