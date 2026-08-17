// app/dashboard/incidents/page.tsx - Routing page
import { headers } from 'next/headers';
import MobileMyIncidents from '@/components/dashboard/MobileIncidents';
import DesktopMyIncidents from '@/app/dashboard/DesktopIncidents';

export default function MyIncidentsPage() {
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  if (isMobile) {
    return <MobileMyIncidents />;
  }

  return <DesktopMyIncidents />;
}