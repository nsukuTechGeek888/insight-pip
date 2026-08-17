// app/prop-firms/page.tsx - SEO ENHANCED
import { headers } from 'next/headers';
import { SEO } from '@/components/SEO';
import { BreadcrumbSchema } from '@/components/StructuredData';
import DesktopPropFirms from './DesktopPropFirmsPage';
import MobilePropFirms from '@/components/prop-firms/MobilePropFirms';

const breadcrumbItems = [
  { name: 'Home', url: '/' },
  { name: 'Prop Firms', url: '/prop-firms' },
];

export default async function PropFirmsPage() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  return (
    <>
      <SEO
        title="Compare Prop Firms - Funded Accounts & Challenges"
        description="Find the best prop firms with real trader reviews. Compare payout splits, challenge rules, account sizes, and trust scores to get funded."
        keywords="prop firms, funded accounts, prop trading, trading challenges, get funded, forex prop firms, trading reviews"
        type="website"
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      
      {isMobile ? <MobilePropFirms /> : <DesktopPropFirms />}
    </>
  );
}