'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Star, MessageCircle, AlertTriangle, TrendingUp, 
  ArrowRight, Sparkles, Shield, Clock, CheckCircle, 
  User, Settings, Award, Flame, Crown, Zap, BarChart3,
  Activity, ThumbsUp, Building2, Rocket, Trophy, Bell,
  ChevronRight, ChevronLeft, PlusCircle, Heart, Eye, BookOpen
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const generateGradient = (name: string) => {
  const gradients = [
    "from-pink-500 to-purple-500",
    "from-blue-500 to-purple-500",
    "from-green-500 to-blue-500",
    "from-yellow-500 to-orange-500",
    "from-red-500 to-pink-500",
    "from-indigo-500 to-blue-500",
  ];
  const index = (name?.length || 0) % gradients.length;
  return gradients[index];
};

// Stat Card Component
function StatCard({ title, value, icon: Icon, color, onClick }: any) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="relative group cursor-pointer"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
      <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-5 border border-zinc-800 group-hover:border-purple-500/50 transition-all">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-zinc-500 mb-1">{title}</p>
            <p className="text-3xl font-bold text-white">{value !== undefined && value !== null ? value : '0'}</p>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} bg-opacity-10`}>
            <Icon size={20} className="text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Activity Item Component - FIXED with explicit type handling
function ActivityItem({ activity, type }: { activity: any; type: 'review' | 'incident' }) {
  const router = useRouter();
  
  const getEntityName = () => {
    if (type === 'review') {
      return activity.entityName || activity.broker?.name || activity.propFirm?.name || 'Unknown';
    }
    return activity.entityName || 'Unknown';
  };
  
  const handleClick = () => {
    if (type === 'review') {
      router.push(`/reviews/${activity.id}`);
    } else {
      router.push(`/incidents/${activity.id}`);
    }
  };
  
  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-center gap-4 p-4 bg-zinc-800/30 rounded-xl border border-zinc-800 hover:border-purple-500/30 transition-all cursor-pointer group"
      onClick={handleClick}
    >
      <div className={`p-2 rounded-lg ${type === 'review' ? 'bg-purple-500/20' : 'bg-orange-500/20'} group-hover:scale-110 transition-transform`}>
        {type === 'review' ? <Star size={16} className="text-purple-400" /> : <AlertTriangle size={16} className="text-orange-400" />}
      </div>
      <div className="flex-1">
        <p className="text-white text-sm font-medium line-clamp-1">{activity.title || 'Untitled'}</p>
        <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1 flex-wrap">
          <span className="flex items-center gap-1">
            <Building2 size={10} />
            {getEntityName()}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock size={10} /> 
            {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : 'Unknown date'}
          </span>
          {type === 'review' && activity.rating && (
            <span className="flex items-center gap-1">
              <Star size={10} className="text-yellow-400" /> 
              {activity.rating}/5
            </span>
          )}
          {type === 'incident' && (
            <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] ${
              activity.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : 
              activity.status === 'RESOLVED' ? 'bg-blue-500/20 text-blue-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>
              {activity.status === 'APPROVED' ? <CheckCircle size={8} /> : 
               activity.status === 'RESOLVED' ? <CheckCircle size={8} /> : 
               <Clock size={8} />}
              {activity.status || 'PENDING'}
            </span>
          )}
        </div>
      </div>
      <ArrowRight size={16} className="text-zinc-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
    </motion.div>
  );
}

// Pagination Component
function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-zinc-800">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-1.5 text-sm text-zinc-400 disabled:opacity-50 hover:text-white border border-zinc-700 rounded-lg transition-colors"
      >
        Previous
      </button>
      <div className="flex gap-1">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) pageNum = i + 1;
          else if (currentPage <= 3) pageNum = i + 1;
          else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
          else pageNum = currentPage - 2 + i;
          
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                pageNum === currentPage
                  ? 'bg-purple-600 text-white'
                  : 'text-zinc-400 hover:text-white border border-zinc-700'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-1.5 text-sm text-zinc-400 disabled:opacity-50 hover:text-white border border-zinc-700 rounded-lg transition-colors"
      >
        Next
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  
  // Stats state
  const [stats, setStats] = useState({
    totalReviews: 0,
    approvedReviews: 0,
    pendingReviews: 0,
    totalIncidents: 0,
    resolvedIncidents: 0,
    pendingIncidents: 0,
    helpfulReceived: 0,
    avgTrustScore: 0
  });
  
  const [profile, setProfile] = useState<any>(null);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [allIncidents, setAllIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [activeTab, setActiveTab] = useState<'reviews' | 'incidents'>('reviews');
  const [reviewsPage, setReviewsPage] = useState(1);
  const [incidentsPage, setIncidentsPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchDashboardData();
    }
  }, [user, isLoading]);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsRes = await fetch('/api/user/stats', { credentials: 'include' });
      const statsData = await statsRes.json();
      console.log('Stats API response:', statsData);
      
      if (statsData.success) {
        setStats({
          totalReviews: statsData.stats?.totalReviews || statsData.totalReviews || 0,
          approvedReviews: statsData.stats?.approvedReviews || statsData.approvedReviews || 0,
          pendingReviews: statsData.stats?.pendingReviews || statsData.pendingReviews || 0,
          totalIncidents: statsData.stats?.totalIncidents || statsData.totalIncidents || 0,
          resolvedIncidents: statsData.stats?.resolvedIncidents || statsData.resolvedIncidents || 0,
          pendingIncidents: statsData.stats?.pendingIncidents || statsData.pendingIncidents || 0,
          helpfulReceived: statsData.stats?.helpfulReceived || statsData.helpfulReceived || 0,
          avgTrustScore: statsData.stats?.avgTrustScore || statsData.avgTrustScore || 0
        });
      }
      
      // Fetch profile
      const profileRes = await fetch('/api/user/profile', { credentials: 'include' });
      const profileData = await profileRes.json();
      if (profileData.success) {
        setProfile(profileData.user);
      }
      
      // Fetch all reviews (for pagination)
      const reviewsRes = await fetch('/api/user/reviews?limit=100', { credentials: 'include' });
      const reviewsData = await reviewsRes.json();
      if (reviewsData.success && reviewsData.reviews) {
        setAllReviews(reviewsData.reviews);
      }
      
      // Fetch all incidents (for pagination)
      const incidentsRes = await fetch('/api/user/incidents?limit=100', { credentials: 'include' });
      const incidentsData = await incidentsRes.json();
      if (incidentsData.success && incidentsData.incidents) {
        setAllIncidents(incidentsData.incidents);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Paginated data
  const paginatedReviews = allReviews.slice((reviewsPage - 1) * itemsPerPage, reviewsPage * itemsPerPage);
  const paginatedIncidents = allIncidents.slice((incidentsPage - 1) * itemsPerPage, incidentsPage * itemsPerPage);
  
  const reviewsTotalPages = Math.ceil(allReviews.length / itemsPerPage);
  const incidentsTotalPages = Math.ceil(allIncidents.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-zinc-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const currentPage = activeTab === 'reviews' ? reviewsPage : incidentsPage;
  const totalPages = activeTab === 'reviews' ? reviewsTotalPages : incidentsTotalPages;
  const setPage = (page: number) => {
    if (activeTab === 'reviews') {
      setReviewsPage(page);
    } else {
      setIncidentsPage(page);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-6">
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={18} className="text-purple-400" />
                <span className="text-sm text-purple-400 font-medium">Welcome back</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {profile?.name || user.name || 'Trader'}
              </h1>
              <p className="text-zinc-400 mt-1 flex items-center gap-2">
                {user.email}
                <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                <span className="text-xs text-zinc-500">
                  Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                </span>
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/dashboard/profile"
                className="px-4 py-2 rounded-lg bg-zinc-800/50 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors flex items-center gap-2"
              >
                <User size={14} /> Profile
              </Link>
              <Link
                href="/reviews"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm hover:from-purple-500 hover:to-pink-500 transition-all flex items-center gap-2 shadow-lg hover:shadow-purple-500/25"
              >
                <MessageCircle size={14} /> Write Review
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard 
              title="Reviews Written" 
              value={stats.totalReviews} 
              icon={MessageCircle} 
              color="from-purple-500 to-pink-500"
            />
            <StatCard 
              title="Incidents Reported" 
              value={stats.totalIncidents} 
              icon={AlertTriangle} 
              color="from-orange-500 to-red-500"
            />
            <StatCard 
              title="Trust Score" 
              value={stats.avgTrustScore > 0 ? stats.avgTrustScore : '—'} 
              icon={Shield} 
              color="from-green-500 to-teal-500"
            />
            <StatCard 
              title="Helpful Votes" 
              value={stats.helpfulReceived} 
              icon={ThumbsUp} 
              color="from-blue-500 to-cyan-500"
            />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/dashboard/reviews" className="group">
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20 hover:border-purple-500/50 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Star size={20} className="text-purple-400" />
                        <span className="text-white font-medium">My Reviews</span>
                      </div>
                      <ArrowRight size={16} className="text-purple-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">Manage your {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}</p>
                  </div>
                </Link>
                <Link href="/dashboard/incidents" className="group">
                  <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-500/20 hover:border-orange-500/50 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle size={20} className="text-orange-400" />
                        <span className="text-white font-medium">My Incidents</span>
                      </div>
                      <ArrowRight size={16} className="text-orange-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">Track your {stats.totalIncidents} incident{stats.totalIncidents !== 1 ? 's' : ''}</p>
                  </div>
                </Link>
              </div>

              {/* Recent Activity with Tabs and Pagination - FIXED with separate rendering */}
              <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-zinc-800">
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                      activeTab === 'reviews'
                        ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/5'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Star size={14} />
                      Reviews ({allReviews.length})
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('incidents')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                      activeTab === 'incidents'
                        ? 'text-orange-400 border-b-2 border-orange-400 bg-orange-500/5'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <AlertTriangle size={14} />
                      Incidents ({allIncidents.length})
                    </div>
                  </button>
                </div>

                {/* Activity List - FIXED: Separate rendering for each tab */}
                {activeTab === 'reviews' ? (
                  <>
                    {paginatedReviews.length === 0 ? (
                      <div className="p-8 text-center">
                        <Star size={32} className="text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-500 text-sm">No reviews yet</p>
                        <Link href="/reviews" className="text-purple-400 text-sm mt-2 inline-block hover:underline">Write your first review →</Link>
                      </div>
                    ) : (
                      <div className="divide-y divide-zinc-800">
                        {paginatedReviews.map((review) => (
                          <ActivityItem key={review.id} activity={review} type="review" />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {paginatedIncidents.length === 0 ? (
                      <div className="p-8 text-center">
                        <AlertTriangle size={32} className="text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-500 text-sm">No incidents reported yet</p>
                        <Link href="/reviews?tab=incidents" className="text-orange-400 text-sm mt-2 inline-block hover:underline">Report an incident →</Link>
                      </div>
                    ) : (
                      <div className="divide-y divide-zinc-800">
                        {paginatedIncidents.map((incident) => (
                          <ActivityItem key={incident.id} activity={incident} type="incident" />
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Pagination */}
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-6">
              {/* Trust Score Breakdown */}
              {stats.avgTrustScore > 0 && (
                <div className="bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl border border-purple-500/20 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield size={16} className="text-purple-400" />
                    <span className="text-sm font-medium text-white">Trust Score</span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{stats.avgTrustScore}</div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${stats.avgTrustScore}%` }} />
                  </div>
                  <p className="text-xs text-zinc-500 mt-3 text-center">
                    Based on your {stats.approvedReviews} approved review{stats.approvedReviews !== 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {/* Review Stats Summary */}
              <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 size={16} className="text-purple-400" />
                  <span className="text-sm font-medium text-white">Review Summary</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Approved</span>
                    <span className="text-green-400">{stats.approvedReviews}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Pending</span>
                    <span className="text-yellow-400">{stats.pendingReviews}</span>
                  </div>
                </div>
              </div>

              {/* Incident Stats Summary */}
              <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-orange-400" />
                  <span className="text-sm font-medium text-white">Incident Summary</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Resolved</span>
                    <span className="text-green-400">{stats.resolvedIncidents}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Pending</span>
                    <span className="text-yellow-400">{stats.pendingIncidents}</span>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-orange-600/10 rounded-2xl border border-purple-500/20 p-5 text-center">
                <Rocket size={24} className="text-purple-400 mx-auto mb-2" />
                <p className="text-white text-sm font-medium mb-1">Help the community grow</p>
                <p className="text-xs text-zinc-400 mb-3">Your voice matters. Share your trading experience.</p>
                <div className="flex gap-2 justify-center">
                  <Link href="/reviews" className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all">
                    Write Review
                  </Link>
                  <Link href="/reviews?tab=incidents" className="px-3 py-1.5 bg-zinc-800 text-zinc-300 text-xs rounded-lg hover:bg-zinc-700 transition-all">
                    Report Incident
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="border-t border-zinc-800/50 py-6 px-6 mt-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs text-zinc-600">Your contributions help keep the trading community informed and safe.</p>
        </div>
      </div>
    </div>
  );
}