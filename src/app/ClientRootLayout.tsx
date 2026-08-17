// src/app/ClientRootLayout.tsx
'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { UserProvider } from '@/contexts/UserContext';

export default function ClientRootLayout({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <UserProvider>
      <NavigationProvider>
        <div className="flex flex-col min-h-screen bg-black text-white">
          {isMobile ? (
            <main className="flex-1">{children}</main>
          ) : (
            <>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </>
          )}
        </div>
      </NavigationProvider>
    </UserProvider>
  );
}