// app/reviews/[id]/page.tsx - SEO ENHANCED WITH REGION SUPPORT
import { headers } from 'next/headers';
import { SEO } from '@/components/SEO';
import { StructuredData, BreadcrumbSchema } from '@/components/StructuredData';
import DesktopReviewDetail from './DesktopReviewDetail';
import MobileReviewDetail from '@/components/reviews/MobileReviewDetail';
import { cookies } from 'next/headers';

// Region display info
const REGION_DISPLAY: Record<string, { label: string; flag: string }> = {
  SA: { label: 'South Africa', flag: '🇿🇦' },
  EU: { label: 'Europe', flag: '🇪🇺' },
  UK: { label: 'United Kingdom', flag: '🇬🇧' },
  UAE: { label: 'UAE', flag: '🇦🇪' },
  KE: { label: 'Kenya', flag: '🇰🇪' },
  AU: { label: 'Australia', flag: '🇦🇺' },
  SG: { label: 'Singapore', flag: '🇸🇬' },
  US: { label: 'United States', flag: '🇺🇸' },
  CA: { label: 'Canada', flag: '🇨🇦' },
  MU: { label: 'Mauritius', flag: '🇲🇺' },
  SC: { label: 'Seychelles', flag: '🇸🇨' },
  BVI: { label: 'BVI', flag: '🇻🇬' },
  NZ: { label: 'New Zealand', flag: '🇳🇿' },
  HK: { label: 'Hong Kong', flag: '🇭🇰' },
  IN: { label: 'India', flag: '🇮🇳' },
  BR: { label: 'Brazil', flag: '🇧🇷' },
  MX: { label: 'Mexico', flag: '🇲🇽' },
  NG: { label: 'Nigeria', flag: '🇳🇬' },
  GH: { label: 'Ghana', flag: '🇬🇭' },
  TZ: { label: 'Tanzania', flag: '🇹🇿' },
  ZW: { label: 'Zimbabwe', flag: '🇿🇼' },
  GLOBAL: { label: 'Global', flag: '🌍' },
};

interface Props {
  params: Promise<{ id: string }>;
}

// Helper to get region from cookies
function getRegionFromCookies(): string {
  const cookieStore = cookies();
  const regionCookie = cookieStore.get('user_region');
  if (regionCookie?.value) {
    return regionCookie.value;
  }
  return 'GLOBAL';
}

export default async function ReviewDetailPage({ params }: Props) {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const resolvedParams = await params;
  const reviewId = resolvedParams.id;

  // Get region from cookies
  const region = getRegionFromCookies();
  const regionInfo = REGION_DISPLAY[region] || REGION_DISPLAY['GLOBAL'];

  // Fetch the review for metadata
  let review = null;
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://insightpip.com'}/api/reviews/${reviewId}`, {
      next: { revalidate: 3600 }
    });
    if (response.ok) {
      const data = await response.json();
      review = data.review || data;
    }
  } catch (error) {
    console.error('Error fetching review for metadata:', error);
  }

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Reviews', url: '/reviews' },
    { name: review?.title || 'Review', url: `/reviews/${reviewId}` },
  ];

  // Generate region-specific metadata
  const regionLabel = regionInfo.label;
  const regionFlag = regionInfo.flag;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://insightpip.com';

  return (
    <>
      <SEO
        title={review ? `${review.title} - Trading Review in ${regionLabel}` : `Trading Review in ${regionLabel}`}
        description={review?.content?.substring(0, 160) || `Read real trader reviews for brokers and prop firms in ${regionLabel}.`}
        type="article"
        publishedTime={review?.createdAt}
        author={review?.user?.name}
        keywords={`${review?.entityName || 'Trading'} review, ${review?.entityType || 'broker'} review, trader review ${regionLabel}, ${regionLabel} trading review`}
        locale={region === 'SA' ? 'en-ZA' : region === 'UK' ? 'en-GB' : 'en-US'}
        canonicalUrl={`${siteUrl}/reviews/${reviewId}`}
        openGraph={{
          title: review ? `${review.title} - Trading Review in ${regionLabel}` : `Trading Review in ${regionLabel}`,
          description: review?.content?.substring(0, 160) || `Read real trader reviews for brokers and prop firms in ${regionLabel}.`,
          url: `${siteUrl}/reviews/${reviewId}`,
          type: 'article',
          siteName: 'InsightPip',
          locale: region === 'SA' ? 'en_ZA' : region === 'UK' ? 'en_GB' : 'en_US',
        }}
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      
      {review && (
        <StructuredData
          type="Review"
          data={{
            entityType: review.entityType,
            entityName: review.entityName,
            author: review.user?.name || 'Anonymous',
            body: review.content,
            rating: review.rating,
            datePublished: review.createdAt,
            region: regionLabel,
          }}
        />
      )}
      
      {/* Regional Context - visible for SEO */}
      <div className="sr-only" aria-hidden="true">
        <meta name="region" content={region} />
        <meta name="region-label" content={regionLabel} />
        <meta name="region-flag" content={regionFlag} />
      </div>

      {/* Render appropriate component - banner removed, region passed via context */}
      {isMobile ? <MobileReviewDetail /> : <DesktopReviewDetail />}
    </>
  );
}

// Generate static paths for better SEO
export async function generateStaticParams() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://insightpip.com'}/api/reviews?limit=100`, {
      next: { revalidate: 3600 }
    });
    if (response.ok) {
      const data = await response.json();
      if (data.reviews && Array.isArray(data.reviews)) {
        return data.reviews.map((review: any) => ({
          id: review.id.toString(),
        }));
      }
    }
  } catch (error) {
    console.error('Error generating static params for reviews:', error);
  }
  return [];
}

// Revalidate pages every hour
export const revalidate = 3600;