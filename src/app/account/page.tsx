// app/account/page.tsx
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

// Loading component
function AccountLoading() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
        />
        <p className="text-zinc-400">Loading Account...</p>
      </div>
    </div>
  );
}

// Dynamic import for mobile account page
const MobileAccountPage = dynamic(() => import('@/components/account/MobileAccountPage'), {
  loading: () => <AccountLoading />,
  ssr: false
});

export default function AccountPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // For now, we'll only show mobile version
  // You can add desktop version later if needed
  return <MobileAccountPage />;
}