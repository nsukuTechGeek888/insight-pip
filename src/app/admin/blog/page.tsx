'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, ArrowLeft, Plus, Search, RefreshCw, MoreVertical,
  Edit, Trash2, Eye, CheckCircle, XCircle, Clock, 
  Filter, Calendar, User, Tag, Image as ImageIcon, Globe, Lock,
  TrendingUp, MessageCircle, Share2, Star, Eye as EyeIcon,
  Loader2, AlertTriangle, X, FileText, Pencil, Copy,
  ThumbsUp
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  imageUrl: string;
  authorId: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  views: number;
  likes: number;
  comments: number;
  featured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBlogPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    archived: 0,
    totalViews: 0
  });

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
      return;
    }
    if (user?.role === 'ADMIN') {
      fetchPosts();
      fetchCategories();
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchPosts();
    }
  }, [searchQuery, statusFilter, categoryFilter]);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      params.append('limit', '50');

      const response = await fetch(`/api/admin/blog?${params}`, { 
        credentials: 'include' 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch blog posts');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch blog posts');
      }

      setPosts(data.posts || []);
      
      // Calculate stats
      const postsData = data.posts || [];
      setStats({
        total: postsData.length,
        published: postsData.filter((p: BlogPost) => p.status === 'PUBLISHED').length,
        drafts: postsData.filter((p: BlogPost) => p.status === 'DRAFT').length,
        archived: postsData.filter((p: BlogPost) => p.status === 'ARCHIVED').length,
        totalViews: postsData.reduce((sum: number, p: BlogPost) => sum + (p.views || 0), 0)
      });
    } catch (error: any) {
      console.error('Error fetching blog posts:', error);
      setError(error.message || 'Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/blog/categories', { 
        credentials: 'include' 
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const deletePost = async (postId: string) => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/blog?id=${postId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete post');
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchPosts();
        setShowDeleteModal(false);
        setDeleteTarget(null);
      }
    } catch (error: any) {
      console.error('Error deleting post:', error);
      alert(error.message || 'Failed to delete post');
    } finally {
      setDeleting(false);
      setActionMenu(null);
    }
  };

  const updatePostStatus = async (postId: string, action: string) => {
    try {
      const response = await fetch('/api/admin/blog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ postId, action })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update post');
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchPosts();
      }
    } catch (error: any) {
      console.error('Error updating post:', error);
      alert(error.message || 'Failed to update post');
    }
    setActionMenu(null);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PUBLISHED': return { text: 'Published', color: 'text-green-400', bg: 'bg-green-500/20', icon: CheckCircle };
      case 'DRAFT': return { text: 'Draft', color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: Clock };
      case 'ARCHIVED': return { text: 'Archived', color: 'text-red-400', bg: 'bg-red-500/20', icon: ArchiveIcon };
      default: return { text: status, color: 'text-zinc-400', bg: 'bg-zinc-500/20', icon: FileText };
    }
  };

  // Archive icon component
  const ArchiveIcon = ({ className = "" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  );

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
          <p className="mt-4 text-zinc-500">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Blog Management</h1>
              <p className="text-zinc-400 text-sm">Create, edit, and manage blog posts</p>
            </div>
          </div>
          <Link href="/admin/blog/new">
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity">
              <Plus size={18} />
              <span>New Post</span>
            </button>
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-zinc-900/30 rounded-lg p-4 border border-zinc-800">
            <p className="text-zinc-400 text-xs">Total Posts</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-zinc-900/30 rounded-lg p-4 border border-green-500/20">
            <p className="text-zinc-400 text-xs">Published</p>
            <p className="text-2xl font-bold text-green-400">{stats.published}</p>
          </div>
          <div className="bg-zinc-900/30 rounded-lg p-4 border border-yellow-500/20">
            <p className="text-zinc-400 text-xs">Drafts</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.drafts}</p>
          </div>
          <div className="bg-zinc-900/30 rounded-lg p-4 border border-red-500/20">
            <p className="text-zinc-400 text-xs">Archived</p>
            <p className="text-2xl font-bold text-red-400">{stats.archived}</p>
          </div>
          <div className="bg-zinc-900/30 rounded-lg p-4 border border-blue-500/20">
            <p className="text-zinc-400 text-xs">Total Views</p>
            <p className="text-2xl font-bold text-blue-400">{stats.totalViews.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input
              type="text"
              placeholder="Search posts by title, summary, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <button onClick={fetchPosts} className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Posts Table */}
        <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800/50 border-b border-zinc-800">
                <tr className="text-left text-xs text-zinc-400">
                  <th className="px-4 py-3">Post</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Stats</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                      {loading ? 'Loading...' : 'No blog posts found'}
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => {
                    const statusBadge = getStatusBadge(post.status);
                    const StatusIcon = statusBadge.icon;
                    
                    return (
                      <tr key={post.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {post.imageUrl && (
                              <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
                                <img 
                                  src={post.imageUrl} 
                                  alt={post.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium line-clamp-1">{post.title}</p>
                              <p className="text-zinc-500 text-xs line-clamp-1">{post.summary}</p>
                              {post.featured && (
                                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-400">
                                  <Star size={10} /> Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-white text-sm">{post.author?.name || 'Unknown'}</p>
                          <p className="text-zinc-500 text-xs">{post.author?.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
                            {post.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusBadge.bg} ${statusBadge.color}`}>
                            <StatusIcon size={10} /> {statusBadge.text}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 text-xs text-zinc-500">
                            <span className="flex items-center gap-1">
                              <EyeIcon size={10} /> {post.views || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp size={10} /> {post.likes || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle size={10} /> {post.comments || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-zinc-400 text-xs">
                          {post.publishedAt 
                            ? new Date(post.publishedAt).toLocaleDateString()
                            : new Date(post.createdAt).toLocaleDateString()
                          }
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative">
                            <button 
                              onClick={() => setActionMenu(actionMenu === post.id ? null : post.id)} 
                              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
                            >
                              <MoreVertical size={14} />
                            </button>
                            {actionMenu === post.id && (
                              <div className="absolute right-0 mt-1 w-44 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-10">
                                <Link href={`/admin/blog/${post.id}/edit`}>
                                  <button className="w-full px-3 py-2 text-left text-xs text-white hover:bg-zinc-800 flex items-center gap-2">
                                    <Edit size={12} /> Edit Post
                                  </button>
                                </Link>
                                <Link href={`/blog/${post.slug}`} target="_blank">
                                  <button className="w-full px-3 py-2 text-left text-xs text-blue-400 hover:bg-zinc-800 flex items-center gap-2">
                                    <Eye size={12} /> View Post
                                  </button>
                                </Link>
                                <button 
                                  onClick={() => {
                                    if (post.status === 'PUBLISHED') {
                                      updatePostStatus(post.id, 'draft');
                                    } else if (post.status === 'DRAFT') {
                                      updatePostStatus(post.id, 'publish');
                                    }
                                    setActionMenu(null);
                                  }} 
                                  className="w-full px-3 py-2 text-left text-xs text-yellow-400 hover:bg-zinc-800 flex items-center gap-2"
                                >
                                  {post.status === 'PUBLISHED' ? <Clock size={12} /> : <CheckCircle size={12} />}
                                  {post.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                                </button>
                                <button 
                                  onClick={() => {
                                    updatePostStatus(post.id, post.featured ? 'unfeature' : 'feature');
                                    setActionMenu(null);
                                  }} 
                                  className="w-full px-3 py-2 text-left text-xs text-purple-400 hover:bg-zinc-800 flex items-center gap-2"
                                >
                                  <Star size={12} /> {post.featured ? 'Unfeature' : 'Feature'}
                                </button>
                                <div className="border-t border-zinc-800 my-1"></div>
                                <button 
                                  onClick={() => {
                                    setDeleteTarget(post.id);
                                    setShowDeleteModal(true);
                                    setActionMenu(null);
                                  }} 
                                  className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-zinc-800 flex items-center gap-2"
                                >
                                  <Trash2 size={12} /> Delete Post
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 max-w-md w-full">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-400" />
                <h3 className="text-lg font-bold text-white">Confirm Delete</h3>
              </div>
              <button onClick={() => setShowDeleteModal(false)} className="text-zinc-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-zinc-400 text-sm mb-4">
                Are you sure you want to delete this blog post? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deletePost(deleteTarget)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete Post
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}