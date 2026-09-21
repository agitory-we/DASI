import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { BottomNav } from '@/components/common/BottomNav';
import { DasiProvider } from '@/context/DasiContext';

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
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col bg-vintage-50 text-vintage-900 font-sans antialiased selection:bg-terracotta selection:text-white">
        <DasiProvider>
          <Header />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer />
          <BottomNav />
        </DasiProvider>
      </body>
    </html>
  );
}
