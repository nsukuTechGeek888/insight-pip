// app/dashboard/reviews/page.tsx - Routing page
import { headers } from 'next/headers';
import MobileMyReviews from '@/components/dashboard/MobileReviews';
import DesktopMyReviews from '@/app/dashboard/DesktopReviews';

export default function MyReviewsPage() {
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  if (isMobile) {
    return <MobileMyReviews />;
  }

  return <DesktopMyReviews />;
}