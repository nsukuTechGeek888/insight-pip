'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, Calendar, User, Clock, Eye, 
  BookOpen, ArrowRight, Tag, Filter, 
  ThumbsUp, MessageCircle, TrendingUp, X,
  Loader2, AlertCircle, Home, Bookmark, 
  User as UserIcon, Settings, MoreVertical,
  Heart, Send, BarChart3, Star
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
    name: string;
    email: string;
    avatar?: string;
  };
}

// Mobile Search Component
const MobileBlogSearch = ({ 
  search, 
  setSearch, 
  onShowFilters,
  filteredCount,
  totalCount 
}: {
  search: string;
  setSearch: (value: string) => void;
  onShowFilters: () => void;
  filteredCount: number;
  totalCount: number;
}) => {
  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
          <input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white text-base focus:outline-none focus:border-purple-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <button
          onClick={onShowFilters}
          className="bg-zinc-800/50 border border-zinc-700 text-white rounded-xl p-3 hover:bg-zinc-700 transition-colors"
        >
          <Filter size={20} />
        </button>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center text-sm text-zinc-400">
        <span>
          {filteredCount} of {totalCount} articles
        </span>
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-purple-400 text-sm font-medium"
          >
            Clear search
          </button>
        )}
      </div>
    </div>
  );
};

// Mobile Filters Component
const MobileBlogFilters = ({
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  categories,
  onClose
}: {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  categories: string[];
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black/95 z-50 p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Filters</h2>
          <p className="text-zinc-400 text-sm">Customize your blog feed</p>
        </div>
        <button
          onClick={onClose}
          className="bg-zinc-800 text-white p-2 rounded-xl border border-zinc-700"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 space-y-6">
        {/* Categories */}
        <div>
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Tag size={18} className="text-purple-400" />
            Categories
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>All Categories</span>
                {selectedCategory === 'all' && (
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                )}
              </div>
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="capitalize">{category}</span>
                  {selectedCategory === category && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-400" />
            Sort By
          </h3>
          <div className="space-y-2">
            {[
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
              { value: 'popular', label: 'Most Popular' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                  sortBy === option.value
                    ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border border-blue-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option.label}</span>
                  {sortBy === option.value && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-6">
        <button
          onClick={() => {
            setSelectedCategory('all');
            setSortBy('newest');
          }}
          className="flex-1 px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700 transition-colors"
        >
          Reset All
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

// Mobile Blog Card Component
const MobileBlogCard = ({ post, index }: { post: BlogPost; index: number }) => {
  return (
    <div className="bg-zinc-900/50 rounded-2xl overflow-hidden border border-zinc-800 hover:border-purple-500/30 transition-all group">
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
          {post.featured && (
            <div className="absolute top-3 right-3">
              <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-md text-xs backdrop-blur-sm">
                ⭐ Featured
              </span>
            </div>
          )}
        </div>
      )}
      <div className="p-4">
        {/* Meta Information */}
        <div className="flex items-center gap-3 text-xs text-zinc-400 mb-2">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {format(new Date(post.publishedAt || post.createdAt), 'MMM d, yyyy')}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {Math.ceil(post.content?.split(' ').length / 200) || 3} min
          </span>
        </div>

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 hover:text-purple-400 transition-colors">
            {post.title}
          </h3>
        </Link>
        
        {/* Summary */}
        <p className="text-zinc-400 text-sm mb-3 line-clamp-2">
          {post.summary}
        </p>

        {/* Author & Engagement */}
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

        {/* Read More Button */}
        <Link href={`/blog/${post.slug}`}>
          <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors">
            <span>Read More</span>
            <ArrowRight size={16} />
          </div>
        </Link>
      </div>
    </div>
  );
};

// Mobile Featured Post Component
const MobileFeaturedPost = ({ post }: { post: BlogPost }) => {
  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl overflow-hidden border border-zinc-700 hover:border-purple-500/30 transition-all group">
      {post.imageUrl && (
        <div className="relative overflow-hidden h-56">
          <img 
            src={post.imageUrl} 
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
              Featured
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-3 text-sm text-zinc-400 mb-2">
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {format(new Date(post.publishedAt || post.createdAt), 'MMM d, yyyy')}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {Math.ceil(post.content?.split(' ').length / 200) || 3} min read
          </span>
        </div>

        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-xl font-bold text-white mb-2 hover:text-purple-400 transition-colors">
            {post.title}
          </h2>
        </Link>
        
        <p className="text-zinc-300 text-sm mb-3 leading-relaxed line-clamp-3">
          {post.summary}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {post.author?.name?.charAt(0) || 'U'}
            </div>
            <span className="text-sm text-zinc-400">{post.author?.name || 'Unknown'}</span>
          </div>
          
          <Link href={`/blog/${post.slug}`}>
            <button className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl text-sm font-medium transition-all">
              Read
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Mobile Categories Section
const MobileCategoriesSection = ({
  categories,
  selectedCategory,
  setSelectedCategory
}: {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}) => {
  if (categories.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
        <Tag size={14} className="text-purple-400" />
        Categories
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            selectedCategory === 'all'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : 'bg-zinc-800/50 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedCategory === category
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-zinc-800/50 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

// Main Mobile Blog Page Component
export default function MobileBlogPage() {
  const { updateDynamicItem } = useNavigation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    updateDynamicItem('blog');
  }, [updateDynamicItem]);

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

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        const matchesSearch = 
          post.title.toLowerCase().includes(search.toLowerCase()) ||
          post.summary.toLowerCase().includes(search.toLowerCase()) ||
          post.category.toLowerCase().includes(search.toLowerCase());
        
        const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.publishedAt || b.createdAt).getTime() - 
                   new Date(a.publishedAt || a.createdAt).getTime();
          case 'oldest':
            return new Date(a.publishedAt || a.createdAt).getTime() - 
                   new Date(b.publishedAt || b.createdAt).getTime();
          case 'popular':
            return (b.views || 0) - (a.views || 0);
          default:
            return 0;
        }
      });
  }, [posts, search, selectedCategory, sortBy]);

  // Featured post
  const featuredPosts = filteredPosts.filter(p => p.featured);
  const regularPosts = filteredPosts.filter(p => !p.featured);

  if (loading) {
    return (
      <MobileLayout title="Blog" showSearch={false}>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">Loading articles...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Blog" showSearch={false}>
      <div className="min-h-screen bg-black text-white pb-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900 py-8 px-4 rounded-b-3xl mb-6 -mx-4 -mt-4">
          <div className="text-center max-w-md mx-auto pt-8">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-lg px-3 py-1 rounded-full text-white text-sm mb-4">
              <BookOpen className="w-4 h-4" />
              Trading Insights & Education
            </div>

            <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              InsightPip Blog
            </h1>
            <p className="text-zinc-200 text-sm mb-6">
              Expert analysis, platform comparisons, and trading strategies to elevate your trading journey.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-white">{posts.length}</div>
                <div className="text-zinc-300 text-xs">Articles</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{categories.length}</div>
                <div className="text-zinc-300 text-xs">Categories</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">
                  {posts.reduce((sum, p) => sum + (p.views || 0), 0).toLocaleString()}
                </div>
                <div className="text-zinc-300 text-xs">Views</div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4">
          {/* Search Section */}
          <div className="mb-4">
            <MobileBlogSearch
              search={search}
              setSearch={setSearch}
              onShowFilters={() => setShowFilters(true)}
              filteredCount={filteredPosts.length}
              totalCount={posts.length}
            />
          </div>

          {/* Categories Section */}
          <MobileCategoriesSection
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle size={18} />
                <span className="text-sm">{error}</span>
              </div>
              <button
                onClick={fetchPosts}
                className="mt-2 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* No Posts State */}
          {!error && posts.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No articles yet</h3>
              <p className="text-zinc-400 text-sm">
                Check back soon for new trading insights and educational content.
              </p>
            </div>
          )}

          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Star size={18} className="text-yellow-400" />
                Featured
              </h2>
              <div className="space-y-4">
                {featuredPosts.slice(0, 2).map((post) => (
                  <MobileFeaturedPost key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}

          {/* All Posts */}
          {regularPosts.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-3">
                {selectedCategory === 'all' ? 'All Articles' : selectedCategory}
                <span className="text-sm text-zinc-400 ml-2">({regularPosts.length})</span>
              </h2>
              <div className="space-y-4">
                {regularPosts.map((post, index) => (
                  <MobileBlogCard key={post.id} post={post} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {!error && posts.length > 0 && filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No articles found</h3>
              <p className="text-zinc-400">
                {search ? 'Try adjusting your search' : 'No articles available in this category'}
              </p>
            </div>
          )}
        </div>

        {/* Filters Modal */}
        {showFilters && (
          <MobileBlogFilters
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
            categories={['all', ...categories]}
            onClose={() => setShowFilters(false)}
          />
        )}
      </div>
    </MobileLayout>
  );
}