// app/robots.ts
import { MetadataRoute } from 'next';

const SITE_URL = 'https://insightpip.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/_next/',
        '/admin/',
        '/login',
        '/signup',
        '/forgot-password',
        '/reset-password',
        '/profile',
        '/dashboard',
        '/settings',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}