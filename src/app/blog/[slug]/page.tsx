// app/blog/[slug]/page.tsx - SEO ENHANCED
import { headers } from 'next/headers';
import { SEO } from '@/components/SEO';
import { StructuredData, BreadcrumbSchema } from '@/components/StructuredData';
import DesktopBlogPost from './DesktopBlogPost';
import MobileBlogPost from '@/components/blog/MobileBlogPost';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: Props) {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Fetch the blog post for metadata
  let post = null;
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://insightpip.com'}/api/blog/${slug}`, {
      next: { revalidate: 3600 }
    });
    if (response.ok) {
      const data = await response.json();
      if (data.success) post = data.post;
    }
  } catch (error) {
    console.error('Error fetching blog post for metadata:', error);
  }

  if (!post) {
    // Handle not found
    return <div>Post not found</div>;
  }

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${post.slug}` },
  ];

  return (
    <>
      <SEO
        title={post.title}
        description={post.summary}
        keywords={post.tags?.join(', ') || post.category}
        image={post.imageUrl}
        type="article"
        publishedTime={post.publishedAt}
        modifiedTime={post.updatedAt || post.publishedAt}
        author={post.author?.name}
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      
      {/* Article Schema */}
      <StructuredData
        type="Article"
        data={{
          title: post.title,
          description: post.summary,
          image: post.imageUrl,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt || post.publishedAt,
          author: post.author?.name || 'InsightPip Team',
        }}
      />
      
      {isMobile ? (
        <MobileBlogPost slug={slug} />
      ) : (
        <DesktopBlogPost slug={slug} />
      )}
    </>
  );
}