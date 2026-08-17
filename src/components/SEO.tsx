// components/SEO.tsx
'use client';

import Head from 'next/head';
import { usePathname } from 'next/navigation';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noIndex?: boolean;
  children?: React.ReactNode;
}

const SITE_NAME = 'InsightPip';
const SITE_URL = 'https://insightpip.com';
const DEFAULT_IMAGE = 'https://insightpip.com/images/og-image.png';
const DEFAULT_DESCRIPTION = 'Compare prop firms, forex brokers, and trading platforms with real trader reviews, trust scores, and verified payouts.';

export function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  noIndex = false,
  children,
}: SEOProps) {
  const pathname = usePathname();
  const canonicalUrl = url || `${SITE_URL}${pathname}`;
  const metaTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Trusted Trading Platform Comparison`;
  const metaDescription = description || DEFAULT_DESCRIPTION;
  const metaImage = image || DEFAULT_IMAGE;

  return (
    <Head>
      {/* Basic Meta */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      {author && <meta name="author" content={author} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
      )}
      
      {/* Open Graph */}
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      <meta name="twitter:site" content="@insightpip" />
      <meta name="twitter:creator" content="@insightpip" />
      
      {/* Additional Meta */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      
      {children}
    </Head>
  );
}

export default SEO;