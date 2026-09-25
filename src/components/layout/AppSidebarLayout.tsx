'use client';

import React, { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { SpotMapModal } from '@/components/map/SpotMapModal';

interface AppSidebarLayoutProps {
  children: React.ReactNode;
}

export const AppSidebarLayout: React.FC<AppSidebarLayoutProps> = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <div className="min-h-screen flex bg-[#FAF8F5]">
      {/* 1. Left Grouped Sidebar (Desktop & Mobile Drawer) */}
      <AppSidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      {/* 2. Main Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          isSidebarCollapsed={isCollapsed}
          onToggleSidebarCollapse={toggleCollapse}
        />
        <main className="flex-1 pb-16 lg:pb-0">{children}</main>
        <Footer />
      </div>

      {/* 3. Global Spot Map Popup Modal */}
      <SpotMapModal />
    </div>
  );
};