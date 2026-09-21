import React from 'react';
import Link from 'next/link';
import { ShieldCheck, HeartHandshake, MapPin, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-vintage-900 text-vintage-100 pt-16 pb-24 md:pb-16 border-t border-vintage-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-terracotta text-white flex items-center justify-center font-serif text-base font-bold">
                다
              </div>
              <span className="font-serif font-bold text-xl text-cream">다시 DASI</span>
            </div>
            <p className="text-xs text-vintage-300 leading-relaxed mb-4">
              필름카메라부터 감성 하이엔드 디카까지, 실패 없는 주말 체험과 소장 전환(Rent-to-Own), 그리고 골목길 수리 장인과 함께하는 대한민국 아날로그 라이프스타일 플랫폼입니다.
            </p>
            <div className="text-[11px] text-vintage-400">
              © 2026 DASI Inc. All rights reserved.
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-vintage-200 uppercase tracking-wider mb-4">
              서비스 탐색
            </h4>
            <ul className="space-y-2 text-xs text-vintage-300">
              <li>
                <Link href="/rent" className="hover:text-cream transition-colors">
                  카메라 주말 렌탈 &amp; Rent-to-Own
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-cream transition-colors">
                  전국 현상소 &amp; 필름 자판기 지도
                </Link>
              </li>
              <li>
                <Link href="/gigs" className="hover:text-cream transition-colors">
                  로컬 포토 긱 (스냅 알바 &amp; 투어)
                </Link>
              </li>
              <li>
                <Link href="/clinic" className="hover:text-cream transition-colors">
                  닥터 DASI (40년 명장 간편 수리 견적)
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-cream transition-colors">
                  [Phase 2] 서울 축제 &amp; 출사 핫스팟
                </Link>
              </li>
            </ul>
          </div>

          {/* Partner & Masters */}
          <div>
            <h4 className="text-xs font-semibold text-vintage-200 uppercase tracking-wider mb-4">
              공식 제휴 장인 네트워크
            </h4>
            <ul className="space-y-2 text-xs text-vintage-300">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-terracotta" />
                <span>을지로 신성카메라 (정인수 명장, 42년 경력)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-terracotta" />
                <span>충무로 보성광학 (김상철 장인, 38년 경력)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-terracotta" />
                <span>남대문 중앙사 (이동현 장인, 35년 경력)</span>
              </li>
              <li className="pt-2">
                <Link href="/clinic" className="text-terracotta hover:underline font-medium">
                  수리점 / 현상소 파트너 입점 문의 →
                </Link>
              </li>
            </ul>
          </div>

          {/* Guarantee & Safety */}
          <div>
            <h4 className="text-xs font-semibold text-vintage-200 uppercase tracking-wider mb-4">
              DASI 안심 보증 시스템
            </h4>
            <div className="space-y-3 text-xs text-vintage-300">
              <div className="p-3 rounded-xl bg-vintage-800/80 border border-vintage-700/60">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>DASI Care 파손 보증</span>
                </div>
                <p className="text-[11px] text-vintage-400 leading-snug">
                  렌탈 중 경미한 흠집이나 고장 발생 시 자기부담금 3만 원 한도로 수리비 전액을 보증합니다.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-vintage-800/80 border border-vintage-700/60">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                  <HeartHandshake className="w-4 h-4" />
                  <span>안심 에스크로 정산</span>
                </div>
                <p className="text-[11px] text-vintage-400 leading-snug">
                  포토 긱 스냅 촬영본 확인 및 기기 반납 검수 완료 시까지 결제 대금을 안전하게 보호합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
