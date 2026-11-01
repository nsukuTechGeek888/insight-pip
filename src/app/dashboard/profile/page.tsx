// app/dashboard/profile/page.tsx - Routing page
import { headers } from 'next/headers';
import MobileProfile from '@/components/dashboard/MobileProfile';
import DesktopProfile from './DesktopProfile';

export default async function ProfilePage() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  if (isMobile) {
    return <MobileProfile />;
  }

  return <DesktopProfile />;
}