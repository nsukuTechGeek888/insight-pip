// components/SEOClient.tsx
'use client';

import SEO from './SEO';

interface SEOClientProps {
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

export function SEOClient(props: SEOClientProps) {
  return <SEO {...props} />;
}