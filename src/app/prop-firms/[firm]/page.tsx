// app/prop-firms/[firm]/page.tsx
'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

// Import both versions - desktop and mobile detailed pages
const DesktopPropFirmDetail = dynamic(
  () => import("./DesktopPropFirmDetail"),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading desktop version...</div>
      </div>
    )
  }
);

const MobilePropFirmDetail = dynamic(
  () => import("@/components/prop-firms/MobilePropFirmDetail"),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading mobile version...</div>
      </div>
    )
  }
);

// Loading component
const PropFirmDetailLoading = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-white text-xl">Loading prop firm details...</div>
  </div>
);

export default function PropFirmDetailPage() {
  const params = useParams();
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    console.log('🔄 Checking mobile detection for prop firm detail...');
    
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        const mobile = window.innerWidth < 768;
        console.log('📱 Screen width:', window.innerWidth, 'Is mobile:', mobile);
        setIsMobile(mobile);
      };

      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  if (isMobile === null) {
    return <PropFirmDetailLoading />;
  }

  console.log('🚀 Rendering prop firm detail:', isMobile ? 'MobilePropFirmDetail' : 'DesktopPropFirmDetail');
  console.log('📦 Params:', params);

  return (
    <>
      {isMobile ? (
        <MobilePropFirmDetail params={params} />
      ) : (
        <DesktopPropFirmDetail params={params} />
      )}
    </>
  );
}