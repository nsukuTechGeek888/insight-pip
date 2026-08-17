// app/sitemap.ts
import { MetadataRoute } from 'next';

const SITE_URL = 'https://insightpip.com';

// Fetch dynamic data for sitemap
async function getBrokers() {
  try {
    const response = await fetch(`${SITE_URL}/api/brokers?limit=1000`, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching brokers for sitemap:', error);
    return [];
  }
}

async function getPropFirms() {
  try {
    const response = await fetch(`${SITE_URL}/api/prop-firms?limit=1000`, {
      next: { revalidate: 86400 }
    });
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching prop firms for sitemap:', error);
    return [];
  }
}

async function getBlogPosts() {
  try {
    const response = await fetch(`${SITE_URL}/api/blog?status=PUBLISHED&limit=1000`, {
      next: { revalidate: 86400 }
    });
    const data = await response.json();
    return data.posts || [];
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [brokers, propFirms, blogPosts] = await Promise.all([
    getBrokers(),
    getPropFirms(),
    getBlogPosts(),
  ]);

  // Static routes
  const staticRoutes = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/brokers`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/prop-firms`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/reviews`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/offers`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/compare`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
  ];

  // Broker detail pages
  const brokerRoutes = brokers.map((broker: any) => ({
    url: `${SITE_URL}/brokers/${broker.id}`,
    lastModified: new Date(broker.updatedAt || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Prop firm detail pages
  const propFirmRoutes = propFirms.map((firm: any) => ({
    url: `${SITE_URL}/prop-firms/${firm.id}`,
    lastModified: new Date(firm.updatedAt || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Blog post pages
  const blogRoutes = blogPosts.map((post: any) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt || post.updatedAt || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Review detail pages
  const reviewRoutes = blogPosts.map((post: any) => ({
    url: `${SITE_URL}/reviews/${post.id}`,
    lastModified: new Date(post.updatedAt || Date.now()),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...brokerRoutes,
    ...propFirmRoutes,
    ...blogRoutes,
    ...reviewRoutes,
  ];
}