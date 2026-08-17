// app/reviews/page.tsx - SEO ENHANCED WITH REGION

import { headers } from 'next/headers';
import { SEO } from '@/components/SEO';
import { BreadcrumbSchema } from '@/components/StructuredData';
import DesktopReviews from './DesktopReviews';
import MobileReviews from '@/components/reviews/MobileReviews';

const breadcrumbItems = [
  { name: 'Home', url: '/' },
  { name: 'Reviews', url: '/reviews' },
];

export default async function ReviewsPage() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  // Get region from headers for SEO
  const cfCountry = headersList.get('CF-IPCountry') || 
                    headersList.get('x-vercel-ip-country') ||
                    headersList.get('x-country-code') ||
                    'Global';
  
  // Map country code to region name for SEO
  const regionNames: Record<string, string> = {
    'ZA': 'South Africa',
    'KE': 'Kenya',
    'NG': 'Nigeria',
    'GH': 'Ghana',
    'TZ': 'Tanzania',
    'ZW': 'Zimbabwe',
    'GB': 'United Kingdom',
    'DE': 'Europe',
    'FR': 'Europe',
    'IT': 'Europe',
    'ES': 'Europe',
    'NL': 'Europe',
    'BE': 'Europe',
    'PT': 'Europe',
    'GR': 'Europe',
    'SE': 'Europe',
    'NO': 'Europe',
    'DK': 'Europe',
    'FI': 'Europe',
    'IE': 'Europe',
    'CH': 'Europe',
    'AT': 'Europe',
    'PL': 'Europe',
    'AE': 'UAE',
    'AU': 'Australia',
    'SG': 'Singapore',
    'US': 'United States',
    'CA': 'Canada',
    'IN': 'India',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'MU': 'Mauritius',
    'SC': 'Seychelles',
  };
  
  const regionName = regionNames[cfCountry] || 'Global';
  const regionFlag = {
    'South Africa': '🇿🇦',
    'Kenya': '🇰🇪',
    'Nigeria': '🇳🇬',
    'Ghana': '🇬🇭',
    'Tanzania': '🇹🇿',
    'Zimbabwe': '🇿🇼',
    'United Kingdom': '🇬🇧',
    'Europe': '🇪🇺',
    'UAE': '🇦🇪',
    'Australia': '🇦🇺',
    'Singapore': '🇸🇬',
    'United States': '🇺🇸',
    'Canada': '🇨🇦',
    'India': '🇮🇳',
    'Brazil': '🇧🇷',
    'Mexico': '🇲🇽',
    'Mauritius': '🇲🇺',
    'Seychelles': '🇸🇨',
    'Global': '🌍',
  }[regionName] || '🌍';

  const pageTitle = `Trading Platform Reviews in ${regionName} ${regionFlag} - Real Trader Experiences`;
  const pageDescription = `Read real trader reviews for brokers and prop firms available in ${regionName}. Share your experience, report incidents, and help the trading community in ${regionName} make informed decisions.`;
  const pageKeywords = `trading reviews in ${regionName}, broker reviews ${regionName}, prop firm reviews ${regionName}, trader experiences ${regionName}, withdrawal reviews ${regionName}, trust scores ${regionName}`;

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={pageKeywords}
        type="website"
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      
      {isMobile ? <MobileReviews /> : <DesktopReviews />}
    </>
  );
}