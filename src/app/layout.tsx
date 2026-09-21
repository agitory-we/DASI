import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { BottomNav } from '@/components/common/BottomNav';
import { DasiProvider } from '@/context/DasiContext';

export const metadata: Metadata = {
  title: '다시 DASI | 그때 그 취미, 다시 - 아날로그 카메라 렌탈 & 라이프스타일',
  description:
    '필름카메라 및 감성 하이엔드 디카 주말 렌탈, Rent-to-Own 소장 전환, 전국 현상소 지도, 로컬 포토 긱 매칭, 40년 명장 수리 케어 플랫폼',
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
