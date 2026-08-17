// app/compare/page.tsx - SEO ENHANCED WITH REGION

import { headers } from 'next/headers';
import { SEO } from '@/components/SEO';
import { BreadcrumbSchema } from '@/components/StructuredData';
import DesktopCompare from './DesktopCompare';
import MobileCompare from '@/components/compare/MobileCompare';

const breadcrumbItems = [
  { name: 'Home', url: '/' },
  { name: 'Compare', url: '/compare' },
];

export default async function ComparePage() {
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

  const pageTitle = `Compare Brokers & Prop Firms in ${regionName} ${regionFlag} - Side by Side Comparison`;
  const pageDescription = `Compare brokers and prop firms available in ${regionName} side by side. See ratings, fees, features, and real trader reviews to find the best platform for your trading style in ${regionName}.`;
  const pageKeywords = `compare brokers in ${regionName}, compare prop firms in ${regionName}, trading platform comparison ${regionName}, side by side comparison ${regionName}, best brokers ${regionName}, best prop firms ${regionName}, ${regionName} trading`;

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={pageKeywords}
        type="website"
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      
      {isMobile ? <MobileCompare /> : <DesktopCompare />}
    </>
  );
}