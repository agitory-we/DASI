import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppSidebarLayout } from '@/components/layout/AppSidebarLayout';
import { BottomNav } from '@/components/common/BottomNav';
import { DasiProvider } from '@/context/DasiContext';
import { AuthProvider } from '@/context/AuthContext';
import { LoginModal } from '@/components/auth/LoginModal';
import { PwaInstallBanner } from '@/components/common/PwaInstallBanner';

export const viewport: Viewport = {
  themeColor: '#FAF8F5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: '다시 DASI | 그때 그 취미, 다시 - 아날로그 카메라 렌탈 & 라이프스타일',
  description:
    '충무로·을지로 40년 명장 전수 점검 필름카메라 & 하이엔드 디카 주말 렌탈, Rent-to-Own 소장 전환, 전국 현상소 지도, 로컬 포토 긱 매칭, 수리 케어 플랫폼',
  keywords: [
    '필름카메라 대여',
    '아날로그 카메라',
    'Rent-to-Own',
    '을지로 현상소',
    '충무로 카메라',
    'Nikon FM2',
    'Olympus PEN EE-3',
    '스냅 사진 알바',
    '카메라 수리 명장'
  ],
  openGraph: {
    title: '다시 DASI | 아날로그 카메라 주말 렌탈 & Rent-to-Own',
    description: '써보고 반하면 대여료 100% 공제 후 소장하는 아날로그 카메라 플랫폼',
    url: 'https://dasi-market.vercel.app',
    siteName: 'DASI 다시',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&auto=format&fit=crop&q=80',
        width: 1200,
        height: 630,
        alt: '다시 DASI 아날로그 카메라 렌탈 플랫폼'
      }
    ],
    locale: 'ko_KR',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: '다시 DASI | 그때 그 취미, 다시',
    description: '아날로그 카메라 렌탈 & Rent-to-Own 소장 플랫폼',
    images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&auto=format&fit=crop&q=80']
  },
  manifest: '/manifest.json'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-vintage-50 text-vintage-900 font-sans antialiased selection:bg-terracotta selection:text-white">
        <AuthProvider>
          <DasiProvider>
            <AppSidebarLayout>
              {children}
            </AppSidebarLayout>
            <BottomNav />
            {/* 전역 로그인 모달 — useAuth().openLoginModal()로 어디서나 호출 가능 */}
            <LoginModal />
            {/* PWA 모바일 앱 설치 가이드 플로팅 배너 */}
            <PwaInstallBanner />
          </DasiProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


