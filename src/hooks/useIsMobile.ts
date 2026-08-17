// hooks/useIsMobile.ts
'use client';

import { useState, useEffect } from 'react';

export function useIsMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    // Initial check
    checkDevice();

    // Add event listener for resize
    window.addEventListener('resize', checkDevice);

    // Cleanup
    return () => window.removeEventListener('resize', checkDevice);
  }, [breakpoint]);

  return isMobile;
}

// Alternative version that returns false during SSR to avoid hydration issues
export function useIsMobileSafe(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, [breakpoint]);

  return isMobile;
}