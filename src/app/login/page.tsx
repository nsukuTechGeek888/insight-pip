// app/login/page.tsx - SIMPLIFIED VERSION
'use client';

import { useEffect, useState } from 'react';
import DesktopLogin from './DesktopLogin';
import MobileLoginPage from '@/components/auth/MobileLoginPage';

export default function LoginPage() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Show loading while detecting
  if (isMobile === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-white">Loading login...</div>
      </div>
    );
  }

  // Render appropriate component directly (NO REDIRECT)
  return (
    <>
      {/* Desktop - hidden on mobile */}
      <div className={`${isMobile ? 'hidden' : 'block'}`}>
        <DesktopLogin />
      </div>
      
      {/* Mobile - hidden on desktop */}
      <div className={`${isMobile ? 'block' : 'hidden'}`}>
        <MobileLoginPage />
      </div>
    </>
  );
}
