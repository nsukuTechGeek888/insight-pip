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

export default function DesktopBlogPost({ slug }: { slug: string }) {
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

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
      <div className="min-h-screen bg-[var(--ip-bg)] text-[var(--ip-text)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-[var(--ip-text-2)]">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[var(--ip-bg)] text-[var(--ip-text)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[var(--ip-text)] mb-2">Article not found</h2>
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
    );
  }

  return (
    <div className="min-h-screen bg-[var(--ip-bg)] text-[var(--ip-text)]">
      <article className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/blog" className="inline-flex items-center gap-2 text-[var(--ip-text-2)] hover:text-[var(--ip-text)] transition-colors mb-6">
          <ArrowLeft size={20} />
          <span>Back to Blog</span>
        </Link>

        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
            {post.category}
          </span>
          {post.featured && (
            <span className="ml-2 inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
              ⭐ Featured
            </span>
          )}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-[var(--ip-text)] mb-6">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--ip-text-2)] mb-8 pb-8 border-b border-[var(--ip-border)]">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-500 rounded-full flex items-center justify-center text-[var(--ip-text)] font-bold">
              {post.author?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="text-[var(--ip-text)] font-medium">{post.author?.name || 'Unknown'}</div>
              <div className="text-xs">Author</div>
            </div>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <span className="flex items-center gap-1">
              <Calendar size={16} />
              {format(new Date(post.publishedAt || post.createdAt), 'MMMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={16} />
              {Math.ceil(post.content?.split(' ').length / 200) || 3} min read
            </span>
            <span className="flex items-center gap-1">
              <Eye size={16} />
              {post.views || 0} views
            </span>
          </div>
        </div>

        {post.imageUrl && (
          <div className="mb-8 rounded-2xl overflow-hidden">
            <img 
              src={post.imageUrl} 
              alt={post.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        <div className="prose prose-invert max-w-none">
          <div 
            className="text-[var(--ip-text-2)] leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
          />
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t border-[var(--ip-border)]">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag size={16} className="text-[var(--ip-text-2)]" />
              {post.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-[var(--ip-surface-2)] rounded-full text-sm text-[var(--ip-text-2)]">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-[var(--ip-border)] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--ip-surface-2)] rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <ThumbsUp size={18} className="text-[var(--ip-text-2)]" />
              <span className="text-[var(--ip-text)]">{post.likes || 0}</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--ip-surface-2)] rounded-lg hover:bg-zinc-700 transition-colors">
              <MessageCircle size={18} className="text-[var(--ip-text-2)]" />
              <span className="text-[var(--ip-text)]">{post.comments || 0}</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-[var(--ip-surface-2)] rounded-lg hover:bg-zinc-700 transition-colors">
              <Bookmark size={18} className="text-[var(--ip-text-2)]" />
            </button>
            <button className="p-2 bg-[var(--ip-surface-2)] rounded-lg hover:bg-zinc-700 transition-colors">
              <Share2 size={18} className="text-[var(--ip-text-2)]" />
            </button>
          </div>
        </div>

        {relatedPosts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-[var(--ip-border)]">
            <h3 className="text-xl font-bold text-[var(--ip-text)] mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link key={related.id} href={`/blog/${related.slug}`}>
                  <div className="bg-[var(--ip-surface)] rounded-xl overflow-hidden border border-[var(--ip-border)] hover:border-blue-500/30 transition-all group">
                    {related.imageUrl && (
                      <div className="h-32 overflow-hidden">
                        <img 
                          src={related.imageUrl} 
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4">
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
      </article>
    </div>
  );
}