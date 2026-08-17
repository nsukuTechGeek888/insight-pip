// components/StructuredData.tsx - COMPLETE WITH ALL EXPORTS
'use client';

import { usePathname } from 'next/navigation';

interface StructuredDataProps {
  type: 'Organization' | 'WebSite' | 'BreadcrumbList' | 'Article' | 'Product' | 'Review' | 'FAQPage';
  data: Record<string, any>;
}

const SITE_NAME = 'InsightPip';
const SITE_URL = 'https://insightpip.com';
const LOGO_URL = 'https://insightpip.com/images/insightpip-logo.png';

export function StructuredData({ type, data }: StructuredDataProps) {
  const pathname = usePathname();
  
  const getSchema = () => {
    switch (type) {
      case 'Organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
          logo: LOGO_URL,
          description: 'Compare prop firms, forex brokers, and trading platforms with real trader reviews.',
          sameAs: [
            'https://twitter.com/insightpip',
            'https://linkedin.com/company/insightpip',
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            email: 'support@insightpip.com',
            contactType: 'customer support',
          },
        };
      
      case 'WebSite':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_NAME,
          url: SITE_URL,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${SITE_URL}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        };
      
      case 'BreadcrumbList': {
        const items = data.items || [];
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((item: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${SITE_URL}${item.url}`,
          })),
        };
      }
      
      case 'Article':
        return {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: data.title,
          description: data.description,
          image: data.image,
          datePublished: data.datePublished,
          dateModified: data.dateModified || data.datePublished,
          author: {
            '@type': 'Person',
            name: data.author || 'InsightPip Team',
          },
          publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            logo: {
              '@type': 'ImageObject',
              url: LOGO_URL,
            },
          },
          mainEntityOfPage: `${SITE_URL}${pathname}`,
        };
      
      case 'Product': {
        const offers = data.offers || [];
        const reviews = data.reviews || [];
        return {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: data.name,
          description: data.description,
          image: data.image,
          brand: {
            '@type': 'Brand',
            name: data.brand || data.name,
          },
          aggregateRating: data.aggregateRating ? {
            '@type': 'AggregateRating',
            ratingValue: data.aggregateRating.ratingValue,
            reviewCount: data.aggregateRating.reviewCount,
          } : undefined,
          offers: offers.length > 0 ? {
            '@type': 'AggregateOffer',
            priceCurrency: 'USD',
            lowPrice: Math.min(...offers.map((o: any) => o.price)),
            highPrice: Math.max(...offers.map((o: any) => o.price)),
            offerCount: offers.length,
          } : undefined,
          review: reviews.map((review: any) => ({
            '@type': 'Review',
            author: {
              '@type': 'Person',
              name: review.author,
            },
            reviewBody: review.body,
            reviewRating: {
              '@type': 'Rating',
              ratingValue: review.rating,
            },
          })),
        };
      }
      
      case 'Review':
        return {
          '@context': 'https://schema.org',
          '@type': 'Review',
          itemReviewed: {
            '@type': data.entityType === 'broker' ? 'FinancialService' : 'Organization',
            name: data.entityName,
          },
          author: {
            '@type': 'Person',
            name: data.author,
          },
          reviewBody: data.body,
          reviewRating: {
            '@type': 'Rating',
            ratingValue: data.rating,
            bestRating: 5,
          },
          datePublished: data.datePublished,
        };
      
      case 'FAQPage':
        return {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: data.faqs.map((faq: any) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        };
      
      default:
        return null;
    }
  };

  const schema = getSchema();
  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ===================== HELPER EXPORTS =====================

// Organization Schema
export function OrganizationSchema() {
  return (
    <StructuredData
      type="Organization"
      data={{}}
    />
  );
}

// Website Schema
export function WebSiteSchema() {
  return (
    <StructuredData
      type="WebSite"
      data={{}}
    />
  );
}

// Breadcrumb Schema - ✅ NOW EXPORTED
export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  return (
    <StructuredData
      type="BreadcrumbList"
      data={{ items }}
    />
  );
}

// Article Schema
export function ArticleSchema({ data }: { data: any }) {
  return (
    <StructuredData
      type="Article"
      data={data}
    />
  );
}

// Product Schema
export function ProductSchema({ data }: { data: any }) {
  return (
    <StructuredData
      type="Product"
      data={data}
    />
  );
}

// Review Schema
export function ReviewSchema({ data }: { data: any }) {
  return (
    <StructuredData
      type="Review"
      data={data}
    />
  );
}

// FAQ Schema
export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <StructuredData
      type="FAQPage"
      data={{ faqs }}
    />
  );
}