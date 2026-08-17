'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Calendar, User, Clock, Eye, 
  BookOpen, ArrowRight, Tag, Filter, 
  ThumbsUp, MessageCircle, TrendingUp,
  AlertCircle
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
    name: string;
    email: string;
    avatar?: string;
  };
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('status', 'PUBLISHED');
      params.append('limit', '50');

      const response = await fetch(`/api/blog?${params}`, { 
        credentials: 'include' 
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch blog posts (status: ${response.status})`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch blog posts');
      }

      setPosts(data.posts || []);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.posts.map((p: BlogPost) => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error: any) {
      console.error('Error fetching blog posts:', error);
      setError(error.message || 'Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = posts.filter(p => p.featured);
  const regularPosts = filteredPosts.filter(p => !p.featured);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-zinc-400">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Failed to load articles</h2>
          <p className="text-zinc-400 mb-4">{error}</p>
          <button
            onClick={fetchPosts}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-400 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900 py-16 px-6 text-center rounded-b-3xl shadow-lg border-b border-zinc-800">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 px-4 py-2 rounded-full text-blue-300 text-sm mb-6">
            <BookOpen className="w-4 h-4" />
            Trading Insights & Education
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            InsightPip Blog
          </h1>
          <p className="text-lg sm:text-xl text-zinc-300 max-w-2xl mx-auto">
            Expert analysis, platform comparisons, and trading strategies to elevate your trading journey.
          </p>
          <div className="mt-6 flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{posts.length}</div>
              <div className="text-sm text-zinc-400">Articles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{categories.length}</div>
              <div className="text-sm text-zinc-400">Categories</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          )}
        </div>

        {/* No Posts Message */}
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-20 h-20 text-zinc-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No articles yet</h2>
            <p className="text-zinc-400 max-w-md mx-auto">
              Check back soon for new trading insights and educational content.
            </p>
            <div className="mt-6 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700 max-w-md mx-auto">
              <p className="text-sm text-zinc-500">
                💡 Tip: Articles are created and published by our admin team.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Featured Posts */}
            {featuredPosts.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-400" />
                  Featured Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredPosts.slice(0, 2).map((post) => (
                    <FeaturedPostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}

            {/* All Posts */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                {selectedCategory === 'all' ? 'All Articles' : selectedCategory}
                <span className="text-sm text-zinc-400 ml-2">({filteredPosts.length} articles)</span>
              </h2>
              
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No articles found</h3>
                  <p className="text-zinc-400">
                    {searchQuery ? 'Try adjusting your search' : 'No articles available in this category'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularPosts.map((post) => (
                    <BlogPostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Featured Post Card Component
function FeaturedPostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl overflow-hidden border border-zinc-700 hover:border-purple-500/50 transition-all duration-300 group h-full">
        {post.imageUrl && (
          <div className="relative overflow-hidden h-48">
            <img 
              src={post.imageUrl} 
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute top-3 left-3">
              <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                Featured
              </span>
            </div>
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center gap-3 text-xs text-zinc-400 mb-3">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {format(new Date(post.publishedAt || post.createdAt), 'MMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {Math.ceil(post.content?.split(' ').length / 200) || 3} min read
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-purple-400 transition-colors">
            {post.title}
          </h3>
          <p className="text-zinc-400 text-sm line-clamp-3 mb-4">{post.summary}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {post.author?.name?.charAt(0) || 'U'}
              </div>
              <span className="text-sm text-zinc-400">{post.author?.name || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-500">
              <span className="flex items-center gap-1 text-xs">
                <ThumbsUp size={14} /> {post.likes || 0}
              </span>
              <span className="flex items-center gap-1 text-xs">
                <MessageCircle size={14} /> {post.comments || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Blog Post Card Component
function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <div className="bg-zinc-900/50 rounded-2xl overflow-hidden border border-zinc-800 hover:border-purple-500/30 transition-all duration-300 group h-full">
        {post.imageUrl && (
          <div className="relative overflow-hidden h-48">
            <img 
              src={post.imageUrl} 
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 left-3">
              <span className="bg-black/80 text-white px-2 py-1 rounded-md text-xs">
                {post.category}
              </span>
            </div>
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {format(new Date(post.publishedAt || post.createdAt), 'MMM d, yyyy')}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {Math.ceil(post.content?.split(' ').length / 200) || 3} min
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
            {post.title}
          </h3>
          <p className="text-zinc-400 text-sm line-clamp-2 mb-4">{post.summary}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                {post.author?.name?.charAt(0) || 'U'}
              </div>
              <span className="text-xs text-zinc-400">{post.author?.name || 'Unknown'}</span>
            </div>
            <ArrowRight size={16} className="text-zinc-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// Star Icon Component
function Star({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}