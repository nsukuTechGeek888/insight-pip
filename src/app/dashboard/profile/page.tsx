// app/dashboard/profile/page.tsx - Routing page
import { headers } from 'next/headers';
import MobileProfile from '@/components/dashboard/MobileProfile';
import DesktopProfile from '@/app/dashboard/DesktopProfile';

export default function ProfilePage() {
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  if (isMobile) {
    return <MobileProfile />;
  }

  return <DesktopProfile />;
}