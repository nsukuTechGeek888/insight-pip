// app/brokers/page.tsx - UPDATED WITH REGION CONTEXT (BANNER REMOVED)

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRegion } from '@/contexts/RegionContext';
import { useUser } from '@/contexts/UserContext';
import DesktopBrokersPage from './DesktopBrokersPage';
import MobileBrokersPage from '@/components/brokers/MobileBrokersPage';

export default function BrokersPage() {
  const router = useRouter();
  const { region, isLoading: regionLoading } = useRegion();
  const { user, isLoading: userLoading } = useUser();
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show loading while detecting
  if (!mounted || regionLoading || userLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-zinc-500">Loading brokers for your region...</p>
        </div>
      </div>
    );
  }

  // Get current region label
  const regionInfo: Record<string, { label: string; flag: string }> = {
    SA: { label: 'South Africa', flag: '🇿🇦' },
    EU: { label: 'Europe', flag: '🇪🇺' },
    UK: { label: 'United Kingdom', flag: '🇬🇧' },
    UAE: { label: 'United Arab Emirates', flag: '🇦🇪' },
    KE: { label: 'Kenya', flag: '🇰🇪' },
    AU: { label: 'Australia', flag: '🇦🇺' },
    SG: { label: 'Singapore', flag: '🇸🇬' },
    US: { label: 'United States', flag: '🇺🇸' },
    CA: { label: 'Canada', flag: '🇨🇦' },
    GLOBAL: { label: 'Global', flag: '🌍' },
  };

  const currentRegionInfo = regionInfo[region] || { label: region, flag: '🌍' };

  return (
    <>
      {/* ❌ REGION BANNER REMOVED - Users select region in navbar */}

      {/* Render appropriate component */}
      {isMobile ? (
        <MobileBrokersPage region={region} />
      ) : (
        <DesktopBrokersPage region={region} />
      )}
    </>
  );
}