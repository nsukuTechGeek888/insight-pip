// app/offers/page.tsx - COMPLETE FILE

import { headers } from 'next/headers';
import { SEO } from '@/components/SEO';
import { BreadcrumbSchema } from '@/components/StructuredData';
import DesktopOffers from './DesktopOffers';
import MobileOffers from '@/components/offers/MobileOffers';

const breadcrumbItems = [
  { name: 'Home', url: '/' },
  { name: 'Offers', url: '/offers' },
];

export default async function OffersPage() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  return (
    <>
      <SEO
        title="Trading Offers & Bonuses - Exclusive Deals on Prop Firms & Brokers"
        description="Get exclusive offers, discounts, and bonuses on prop firm challenges and broker accounts. Save money on your trading journey with verified deals from trusted brokers and prop firms."
        keywords="trading offers, prop firm discounts, broker bonuses, exclusive deals, trading promotions, get funded discounts"
        type="website"
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      
      {isMobile ? <MobileOffers /> : <DesktopOffers />}
    </>
  );
}