'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, Trophy, Star, AlertTriangle, Users, 
  TrendingUp, Shield, Crown, ArrowRight, BarChart3,
  CheckCircle, XCircle, Clock, Activity, LayoutGrid,
  Settings, Database, Key, Gift, Rocket, RefreshCw, Upload,
  BookOpen, PenTool, Newspaper, FileText
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

export default function AdminDashboard() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState({
    brokers: 0,
    propFirms: 0,
    reviews: 0,
    pendingReviews: 0,
    incidents: 0,
    pendingIncidents: 0,
    users: 0,
    blogPosts: 0,
    publishedPosts: 0,
    draftPosts: 0
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
      return;
    }
    if (user?.role === 'ADMIN') {
      fetchStats();
      // Refresh stats every 30 seconds
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [user, isLoading]);

  const fetchStats = async () => {
    try {
      setLastUpdated(new Date());
      
      const [brokersRes, propFirmsRes, reviewsRes, incidentsRes, pendingReviewsRes, usersRes, blogRes] = await Promise.all([
        fetch('/api/admin/brokers', { credentials: 'include' }),
        fetch('/api/prop-firms', { credentials: 'include' }),
        fetch('/api/reviews?limit=1', { credentials: 'include' }),
        fetch('/api/incidents?limit=1', { credentials: 'include' }),
        fetch('/api/reviews?status=PENDING&limit=1', { credentials: 'include' }),
        fetch('/api/admin/users?limit=1', { credentials: 'include' }),
        fetch('/api/admin/blog?limit=1', { credentials: 'include' }),
      ]);
      
      const brokers = await brokersRes.json();
      const propFirms = await propFirmsRes.json();
      const reviews = await reviewsRes.json();
      const incidents = await incidentsRes.json();
      const pendingReviews = await pendingReviewsRes.json();
      const users = usersRes.ok ? await usersRes.json() : { pagination: { total: 0 } };
      
      // Get pending incidents count
      const pendingIncidentsRes = await fetch('/api/incidents?status=PENDING&limit=1', { credentials: 'include' });
      const pendingIncidents = pendingIncidentsRes.ok ? await pendingIncidentsRes.json() : { pagination: { total: 0 } };
      
      // Get blog stats
      let blogStats = { posts: [], total: 0 };
      if (blogRes.ok) {
        const blogData = await blogRes.json();
        blogStats = blogData || { posts: [], total: 0 };
      }
      
      const posts = blogStats.posts || [];
      const publishedPosts = posts.filter((p: any) => p.status === 'PUBLISHED').length;
      const draftPosts = posts.filter((p: any) => p.status === 'DRAFT').length;
      
      setStats({
        brokers: brokers.brokers?.length || 0,
        propFirms: propFirms.data?.length || 0,
        reviews: reviews.pagination?.total || 0,
        pendingReviews: pendingReviews.pagination?.total || 0,
        incidents: incidents.pagination?.total || 0,
        pendingIncidents: pendingIncidents.pagination?.total || 0,
        users: users.pagination?.total || 0,
        blogPosts: blogStats.total || 0,
        publishedPosts,
        draftPosts
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRefresh = () => {
    fetchStats();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
          <p className="mt-4 text-zinc-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header with Refresh */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown size={20} className="text-purple-400" />
              <span className="text-sm text-purple-400 font-medium">Admin Panel</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-zinc-400 mt-1">Welcome back, {user.name || 'Admin'}</p>
          </div>
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
          >
            <RefreshCw size={16} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>

        {/* Stats Grid - 7 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 mb-8">
          {/* Brokers Card */}
          <Link href="/admin/brokers" className="bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 rounded-xl p-4 border border-zinc-800 hover:border-blue-500/50 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10">
                <Building2 size={16} className="text-blue-400" />
              </div>
              <span className="text-xl font-bold text-white">{stats.brokers}</span>
            </div>
            <p className="text-zinc-400 text-xs">Brokers</p>
            <p className="text-[10px] text-zinc-600 mt-1 group-hover:text-blue-400 transition-colors flex items-center gap-1">Manage <ArrowRight size={10} /></p>
          </Link>

          {/* Prop Firms Card */}
          <Link href="/admin/prop-firms" className="bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 rounded-xl p-4 border border-zinc-800 hover:border-purple-500/50 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10">
                <Trophy size={16} className="text-purple-400" />
              </div>
              <span className="text-xl font-bold text-white">{stats.propFirms}</span>
            </div>
            <p className="text-zinc-400 text-xs">Prop Firms</p>
            <p className="text-[10px] text-zinc-600 mt-1 group-hover:text-purple-400 transition-colors flex items-center gap-1">Manage <ArrowRight size={10} /></p>
          </Link>

          {/* Reviews Card */}
          <Link href="/admin/reviews" className="bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 rounded-xl p-4 border border-zinc-800 hover:border-yellow-500/50 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-yellow-500/10">
                <Star size={16} className="text-yellow-400" />
              </div>
              <span className="text-xl font-bold text-white">{stats.reviews}</span>
            </div>
            <p className="text-zinc-400 text-xs">Reviews</p>
            {stats.pendingReviews > 0 && (
              <span className="inline-block mt-1 text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">
                {stats.pendingReviews} pending
              </span>
            )}
            <p className="text-[10px] text-zinc-600 mt-1 group-hover:text-yellow-400 transition-colors flex items-center gap-1">Moderate <ArrowRight size={10} /></p>
          </Link>

          {/* Incidents Card */}
          <Link href="/admin/incidents" className="bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 rounded-xl p-4 border border-zinc-800 hover:border-red-500/50 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-red-500/10">
                <AlertTriangle size={16} className="text-red-400" />
              </div>
              <span className="text-xl font-bold text-white">{stats.incidents}</span>
            </div>
            <p className="text-zinc-400 text-xs">Incidents</p>
            {stats.pendingIncidents > 0 && (
              <span className="inline-block mt-1 text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">
                {stats.pendingIncidents} pending
              </span>
            )}
            <p className="text-[10px] text-zinc-600 mt-1 group-hover:text-red-400 transition-colors flex items-center gap-1">Review <ArrowRight size={10} /></p>
          </Link>

          {/* Users Card */}
          <Link href="/admin/users" className="bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 rounded-xl p-4 border border-zinc-800 hover:border-green-500/50 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-green-500/10">
                <Users size={16} className="text-green-400" />
              </div>
              <span className="text-xl font-bold text-white">{stats.users}</span>
            </div>
            <p className="text-zinc-400 text-xs">Users</p>
            <p className="text-[10px] text-zinc-600 mt-1 group-hover:text-green-400 transition-colors flex items-center gap-1">Manage <ArrowRight size={10} /></p>
          </Link>

          {/* Blog Posts Card */}
          <Link href="/admin/blog" className="bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 rounded-xl p-4 border border-zinc-800 hover:border-emerald-500/50 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10">
                <BookOpen size={16} className="text-emerald-400" />
              </div>
              <span className="text-xl font-bold text-white">{stats.blogPosts}</span>
            </div>
            <p className="text-zinc-400 text-xs">Blog Posts</p>
            <div className="flex gap-2 mt-1">
              {stats.publishedPosts > 0 && (
                <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">
                  {stats.publishedPosts} published
                </span>
              )}
              {stats.draftPosts > 0 && (
                <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">
                  {stats.draftPosts} drafts
                </span>
              )}
            </div>
            <p className="text-[10px] text-zinc-600 mt-1 group-hover:text-emerald-400 transition-colors flex items-center gap-1">Manage <ArrowRight size={10} /></p>
          </Link>

          {/* Import Card - Quick Import */}
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-500/20 hover:border-orange-500/50 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-orange-500/10">
                <Upload size={16} className="text-orange-400" />
              </div>
              <span className="text-xl font-bold text-white">Bulk</span>
            </div>
            <p className="text-zinc-400 text-xs">Quick Import</p>
            <div className="flex flex-wrap gap-1 mt-1">
              <Link href="/admin/brokers/import" className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full hover:bg-blue-500/30 transition-colors">Brokers</Link>
              <Link href="/admin/prop-firms/import" className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full hover:bg-purple-500/30 transition-colors">Prop Firms</Link>
            </div>
            <p className="text-[10px] text-zinc-600 mt-1 group-hover:text-orange-400 transition-colors flex items-center gap-1">Import JSON <ArrowRight size={10} /></p>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Quick Actions */}
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Rocket size={18} className="text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <Link href="/admin/brokers" className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-blue-500/20">
                    <Building2 size={14} className="text-blue-400" />
                  </div>
                  <span className="text-white">Add New Broker</span>
                </div>
                <ArrowRight size={16} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/admin/prop-firms" className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-purple-500/20">
                    <Trophy size={14} className="text-purple-400" />
                  </div>
                  <span className="text-white">Add New Prop Firm</span>
                </div>
                <ArrowRight size={16} className="text-purple-400 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/admin/blog/new" className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20">
                    <PenTool size={14} className="text-emerald-400" />
                  </div>
                  <span className="text-white">Write New Blog Post</span>
                </div>
                <ArrowRight size={16} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/admin/reviews" className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-yellow-500/20">
                    <Star size={14} className="text-yellow-400" />
                  </div>
                  <span className="text-white">Moderate Pending Reviews</span>
                  {stats.pendingReviews > 0 && (
                    <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">{stats.pendingReviews}</span>
                  )}
                </div>
                <ArrowRight size={16} className="text-yellow-400 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/admin/incidents" className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-red-500/20">
                    <AlertTriangle size={14} className="text-red-400" />
                  </div>
                  <span className="text-white">Review Incident Reports</span>
                  {stats.pendingIncidents > 0 && (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">{stats.pendingIncidents}</span>
                  )}
                </div>
                <ArrowRight size={16} className="text-red-400 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/admin/users" className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-green-500/20">
                    <Users size={14} className="text-green-400" />
                  </div>
                  <span className="text-white">Manage Users</span>
                </div>
                <ArrowRight size={16} className="text-green-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column - Platform Status & Recent Activity */}
          <div className="space-y-6">
            {/* Platform Status */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Database size={18} className="text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Platform Status</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50">
                  <div className="flex items-center gap-2">
                    <Database size={14} className="text-green-400" />
                    <span className="text-zinc-400">Database</span>
                  </div>
                  <span className="text-green-400 flex items-center gap-1"><CheckCircle size={14} /> Connected</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50">
                  <div className="flex items-center gap-2">
                    <Key size={14} className="text-green-400" />
                    <span className="text-zinc-400">Auth System</span>
                  </div>
                  <span className="text-green-400 flex items-center gap-1"><CheckCircle size={14} /> Active</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50">
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-green-400" />
                    <span className="text-zinc-400">Admin Access</span>
                  </div>
                  <span className="text-green-400 flex items-center gap-1"><CheckCircle size={14} /> Granted</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-zinc-400" />
                    <span className="text-zinc-400">Last Updated</span>
                  </div>
                  <span className="text-zinc-400 text-sm">{lastUpdated.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            {/* Quick Summary */}
            <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-800/30 rounded-2xl p-6 border border-zinc-800">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={18} className="text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Content Summary</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl bg-zinc-800/30">
                  <div className="text-xl font-bold text-white">{stats.brokers + stats.propFirms}</div>
                  <div className="text-[10px] text-zinc-500">Entities</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-zinc-800/30">
                  <div className="text-xl font-bold text-white">{stats.reviews}</div>
                  <div className="text-[10px] text-zinc-500">Reviews</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-zinc-800/30">
                  <div className="text-xl font-bold text-white">{stats.blogPosts}</div>
                  <div className="text-[10px] text-zinc-500">Blog Posts</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-zinc-800/30">
                  <div className="text-xl font-bold text-white">{stats.incidents}</div>
                  <div className="text-[10px] text-zinc-500">Incidents</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-zinc-800/30">
                  <div className="text-xl font-bold text-white">{stats.users}</div>
                  <div className="text-[10px] text-zinc-500">Users</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-zinc-800/30">
                  <div className="text-xl font-bold text-white">{stats.publishedPosts}</div>
                  <div className="text-[10px] text-zinc-500">Published</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Import Section */}
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-green-500/5 to-emerald-500/5 border border-green-500/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Gift size={20} className="text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Bulk Import Available</h3>
                <p className="text-zinc-400 text-sm">Import multiple brokers or prop firms at once using JSON files</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/brokers/import" className="px-4 py-2 bg-blue-600 rounded-lg text-white text-sm hover:bg-blue-500 transition-colors flex items-center gap-2">
                <Upload size={14} /> Import Brokers
              </Link>
              <Link href="/admin/prop-firms/import" className="px-4 py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-500 transition-colors flex items-center gap-2">
                <Upload size={14} /> Import Prop Firms
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Blog Stats */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-emerald-500/20">
                <Newspaper size={18} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Blog Content</p>
                <p className="text-zinc-400 text-xs">
                  {stats.publishedPosts} published · {stats.draftPosts} drafts · {stats.blogPosts} total
                </p>
              </div>
            </div>
            <Link href="/admin/blog" className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors flex items-center gap-1">
              Manage Blog <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-600">
            InsightPip Admin Dashboard v1.0 | {new Date().getFullYear()} | All data is community-reported and verified
          </p>
        </div>
      </div>
    </div>
  );
}