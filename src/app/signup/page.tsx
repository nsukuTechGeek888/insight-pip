// app/signup/page.tsx
'use client';

import { useEffect, useState } from 'react';
import DesktopSignUp from './DesktopSignUp';
import MobileSignUp from './MobileSignUp';

export default function SignUpPage() {
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
        <div className="animate-pulse text-white">Loading signup...</div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop - hidden on mobile */}
      <div className={`${isMobile ? 'hidden' : 'block'}`}>
        <DesktopSignUp />
      </div>
      
      {/* Mobile - hidden on desktop */}
      <div className={`${isMobile ? 'block' : 'hidden'}`}>
        <MobileSignUp />
      </div>
    </>
  );
}