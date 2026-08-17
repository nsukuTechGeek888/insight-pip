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
    <div className="min-h-screen bg-black text-white pb-20">
      <MobileHeader title={title} showSearch={showSearch} />
      <main className="px-4 pt-4">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}