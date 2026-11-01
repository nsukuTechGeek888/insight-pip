'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Calendar, Clock, Eye, 
  ThumbsUp, MessageCircle, Share2, Bookmark,
  Tag, AlertCircle, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import MobileLayout from '@/components/mobile/MobileLayout';
import { useNavigation } from '@/contexts/NavigationContext';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  imageUrl: string;
  featured: boolean;
  status: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export default function MobileBlogPost({ slug }: { slug: string }) {
  const { updateDynamicItem } = useNavigation();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    updateDynamicItem('blog');
  }, [updateDynamicItem]);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/blog/${slug}`, { 
        credentials: 'include' 
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Article not found');
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch blog post (status: ${response.status})`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch blog post');
      }

      if (!data.post) {
        throw new Error('No post data received');
      }

      setPost(data.post);
      
      try {
        const relatedResponse = await fetch(
          `/api/blog?category=${data.post.category}&limit=3&exclude=${data.post.id}`,
          { credentials: 'include' }
        );
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          setRelatedPosts(relatedData.posts || []);
        }
      } catch (relatedError) {
        console.error('Error fetching related posts:', relatedError);
      }
    } catch (error: any) {
      console.error('Error fetching blog post:', error);
      setError(error.message || 'Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    try {
      const response = await fetch(`/api/blog/${slug}/like`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setPost({ ...post, likes: data.likes });
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  if (loading) {
    return (
      <MobileLayout title="Article" showSearch={false} showBack={true}>
        <div className="min-h-screen bg-[var(--ip-bg)] text-[var(--ip-text)] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-[var(--ip-text-2)]">Loading article...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (error || !post) {
    return (
      <MobileLayout title="Article" showSearch={false} showBack={true}>
        <div className="min-h-screen bg-[var(--ip-bg)] text-[var(--ip-text)] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[var(--ip-text)] mb-2">Article not found</h2>
            <p className="text-[var(--ip-text-2)] mb-4">
              {error || "The article you're looking for doesn't exist or has been removed."}
            </p>
            <Link href="/blog">
              <button className="px-6 py-2 bg-blue-500 text-[var(--ip-text)] rounded-lg hover:bg-blue-400 transition-colors">
                Back to Blog
              </button>
            </Link>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title={post.title} showSearch={false} showBack={true}>
      <div className="min-h-screen bg-[var(--ip-bg)] text-[var(--ip-text)] px-4 py-4 pb-20">
        {/* Category Badge */}
        <div className="mb-3">
          <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
            {post.category}
          </span>
          {post.featured && (
            <span className="ml-2 inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
              ⭐ Featured
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-[var(--ip-text)] mb-3">
          {post.title}
        </h1>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--ip-text-2)] mb-4 pb-4 border-b border-[var(--ip-border)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-500 rounded-full flex items-center justify-center text-[var(--ip-text)] text-xs font-bold">
              {post.author?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="text-[var(--ip-text)] text-sm font-medium">{post.author?.name || 'Unknown'}</div>
              <div className="text-[10px]">Author</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 ml-auto">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {format(new Date(post.publishedAt || post.createdAt), 'MMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {Math.ceil(post.content?.split(' ').length / 200) || 3} min
            </span>
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {post.views || 0}
            </span>
          </div>
        </div>

        {/* Featured Image */}
        {post.imageUrl && (
          <div className="mb-4 rounded-xl overflow-hidden">
            <img 
              src={post.imageUrl} 
              alt={post.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <div 
            className="text-[var(--ip-text-2)] leading-relaxed whitespace-pre-wrap text-sm"
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
          />
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-6 pt-4 border-t border-[var(--ip-border)]">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag size={14} className="text-[var(--ip-text-2)]" />
              {post.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-[var(--ip-surface-2)] rounded-full text-xs text-[var(--ip-text-2)]">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Engagement */}
        <div className="mt-6 pt-4 border-t border-[var(--ip-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              className="flex items-center gap-2 px-3 py-2 bg-[var(--ip-surface-2)] rounded-xl hover:bg-zinc-700 transition-colors"
            >
              <ThumbsUp size={16} className="text-[var(--ip-text-2)]" />
              <span className="text-[var(--ip-text)] text-sm">{post.likes || 0}</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-[var(--ip-surface-2)] rounded-xl hover:bg-zinc-700 transition-colors">
              <MessageCircle size={16} className="text-[var(--ip-text-2)]" />
              <span className="text-[var(--ip-text)] text-sm">{post.comments || 0}</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-[var(--ip-surface-2)] rounded-xl hover:bg-zinc-700 transition-colors">
              <Bookmark size={16} className="text-[var(--ip-text-2)]" />
            </button>
            <button className="p-2 bg-[var(--ip-surface-2)] rounded-xl hover:bg-zinc-700 transition-colors">
              <Share2 size={16} className="text-[var(--ip-text-2)]" />
            </button>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-6 pt-4 border-t border-[var(--ip-border)]">
            <h3 className="text-lg font-bold text-[var(--ip-text)] mb-4">Related Articles</h3>
            <div className="space-y-3">
              {relatedPosts.map((related) => (
                <Link key={related.id} href={`/blog/${related.slug}`}>
                  <div className="bg-[var(--ip-surface)] rounded-xl overflow-hidden border border-[var(--ip-border)] hover:border-blue-500/30 transition-all group flex">
                    {related.imageUrl && (
                      <div className="w-24 h-24 flex-shrink-0 overflow-hidden">
                        <img 
                          src={related.imageUrl} 
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-3 flex-1">
                      <h4 className="text-sm font-medium text-[var(--ip-text)] line-clamp-2 group-hover:text-blue-400 transition-colors">
                        {related.title}
                      </h4>
                      <p className="text-xs text-[var(--ip-text-2)] mt-1">
                        {format(new Date(related.publishedAt || related.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}