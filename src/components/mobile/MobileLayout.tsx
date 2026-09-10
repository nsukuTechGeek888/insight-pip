// components/mobile/MobileLayout.tsx
'use client';

import { ReactNode } from 'react';
import MobileHeader from './MobileHeader';
import BottomNavigation from './BottomNavigation';

interface MobileLayoutProps {
  children: ReactNode;
  title: string;
  showSearch?: boolean;
}

export default function MobileLayout({ children, title, showSearch = false }: MobileLayoutProps) {
  return (
    <div
      className="min-h-screen pb-24"
      style={{ backgroundColor: '#FFFFFF', color: '#0A0E1A' }}
    >
      <MobileHeader title={title} showSearch={showSearch} />
      <main className="px-4 pt-4 max-w-lg mx-auto">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}