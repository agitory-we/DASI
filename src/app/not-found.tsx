'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-vintage-200 shadow-sm">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
          <Compass className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-amber-700 uppercase">404 Page Not Found</span>
          <h1 className="font-serif text-2xl font-bold text-vintage-900">
            필름 프레임 밖의 공간입니다
          </h1>
          <p className="text-xs text-vintage-600 leading-relaxed">
            요청하신 페이지가 이동되었거나 존재하지 않습니다.
            <br />
            아래 버튼을 눌러 메인 화면이나 출사 지도로 돌아가실 수 있습니다.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Home className="w-3.5 h-3.5" />
            <span>홈으로 이동</span>
          </Link>
          <Link
            href="/map"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>출사 지도 보기</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
