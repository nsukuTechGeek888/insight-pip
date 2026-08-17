// components/AdaptiveLayout.tsx
'use client';

import { useMediaQuery } from 'react-responsive';
import { DesktopHome } from './home/DesktopHome';
import { MobileHome } from './home/MobileHome';

export default function AdaptiveLayout() {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  
  return isMobile ? <MobileHome /> : <DesktopHome />;
}