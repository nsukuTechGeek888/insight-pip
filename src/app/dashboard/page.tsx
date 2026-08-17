// app/dashboard/page.tsx - CORRECTED
import { headers } from 'next/headers';
import MobileDashboard from '@/components/dashboard/MobileDashboard';
import DesktopDashboard from './DesktopDashboard'; // This needs to point to the actual file

export default function DashboardPage() {
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  if (isMobile) {
    return <MobileDashboard />;
  }

  return <DesktopDashboard />;
}