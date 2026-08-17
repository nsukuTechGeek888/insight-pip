// app/page.tsx - SEO ENHANCED
import { headers } from 'next/headers';
import { SEO } from '@/components/SEO';
import { OrganizationSchema, WebSiteSchema } from '@/components/StructuredData';
import MobileHome from '@/components/home/MobileHome';
import DesktopHome from './DesktopHome';

// This page should be server component for SEO
export default async function HomePage() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  const pageTitle = 'Find Your Trusted Trading Partner - Compare Prop Firms & Brokers';
  const pageDescription = 'Compare 200+ prop firms and forex brokers with real trader reviews, verified payouts, and community-reported incidents. Find the best trading platform for your needs.';

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords="prop firms, forex brokers, trading reviews, funded accounts, prop trading, forex trading, broker comparison, trusted brokers"
        type="website"
      />
      <OrganizationSchema />
      <WebSiteSchema />
      
      {isMobile ? <MobileHome /> : <DesktopHome />}
    </>
  );
}