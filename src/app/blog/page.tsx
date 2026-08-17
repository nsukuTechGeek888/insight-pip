// app/blog/page.tsx - SEO ENHANCED
import { headers } from 'next/headers';
import { SEO } from '@/components/SEO';
import { BreadcrumbSchema } from '@/components/StructuredData';
import DesktopBlogPage from './DesktopBlogPage';
import MobileBlogPage from '@/components/blog/MobileBlogPage';

const breadcrumbItems = [
  { name: 'Home', url: '/' },
  { name: 'Blog', url: '/blog' },
];

export default async function BlogPage() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  return (
    <>
      <SEO
        title="Trading Blog - Insights, Strategies & Platform Comparisons"
        description="Expert trading insights, platform comparisons, and strategies to elevate your trading journey. Stay informed with the latest in prop trading and forex."
        keywords="trading blog, forex trading tips, prop trading strategies, trading education, platform comparisons, trading insights"
        type="website"
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      
      {isMobile ? <MobileBlogPage /> : <DesktopBlogPage />}
    </>
  );
}