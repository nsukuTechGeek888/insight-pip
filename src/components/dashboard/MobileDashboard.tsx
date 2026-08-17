// components/dashboard/MobileDashboard.tsx
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
  ChevronRight, ChevronLeft, PlusCircle, Heart, Eye, BookOpen,
  Menu, Home, FileText, LogOut
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import MobileLayout from '@/components/mobile/MobileLayout';

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
      whileHover={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl p-4 border border-zinc-800 active:border-purple-500/50 transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-zinc-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value !== undefined && value !== null ? value : '0'}</p>
        </div>
        <div className={`p-2 rounded-xl bg-gradient-to-br ${color} bg-opacity-10`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
    </motion.div>
  );
}

// Activity Item Component
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
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-xl border border-zinc-800 active:border-purple-500/30 transition-all cursor-pointer"
      onClick={handleClick}
    >
      <div className={`p-2 rounded-lg ${type === 'review' ? 'bg-purple-500/20' : 'bg-orange-500/20'}`}>
        {type === 'review' ? <Star size={14} className="text-purple-400" /> : <AlertTriangle size={14} className="text-orange-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{activity.title || 'Untitled'}</p>
        <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5 flex-wrap">
          <span className="flex items-center gap-1">
            <Building2 size={8} />
            {getEntityName()}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock size={8} /> 
            {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : 'Unknown'}
          </span>
          {type === 'review' && activity.rating && (
            <span className="flex items-center gap-1">
              <Star size={8} className="text-yellow-400" /> 
              {activity.rating}/5
            </span>
          )}
        </div>
      </div>
      <ChevronRight size={14} className="text-zinc-500" />
    </motion.div>
  );
}

export default function MobileDashboard() {
  const { user, isLoading, logout } = useUser();
  const router = useRouter();
  
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
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reviews' | 'incidents'>('reviews');

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
      const [statsRes, profileRes, reviewsRes, incidentsRes] = await Promise.all([
        fetch('/api/user/stats', { credentials: 'include' }),
        fetch('/api/user/profile', { credentials: 'include' }),
        fetch('/api/user/reviews?limit=5', { credentials: 'include' }),
        fetch('/api/user/incidents?limit=5', { credentials: 'include' })
      ]);
      
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats({
          totalReviews: statsData.stats?.totalReviews || 0,
          approvedReviews: statsData.stats?.approvedReviews || 0,
          pendingReviews: statsData.stats?.pendingReviews || 0,
          totalIncidents: statsData.stats?.totalIncidents || 0,
          resolvedIncidents: statsData.stats?.resolvedIncidents || 0,
          pendingIncidents: statsData.stats?.pendingIncidents || 0,
          helpfulReceived: statsData.stats?.helpfulReceived || 0,
          avgTrustScore: statsData.stats?.avgTrustScore || 0
        });
      }
      
      const profileData = await profileRes.json();
      if (profileData.success) setProfile(profileData.user);
      
      const reviewsData = await reviewsRes.json();
      if (reviewsData.success) setRecentReviews(reviewsData.reviews || []);
      
      const incidentsData = await incidentsRes.json();
      if (incidentsData.success) setRecentIncidents(incidentsData.incidents || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading) {
    return (
      <MobileLayout title="Dashboard" showSearch={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" />
            <p className="text-xs text-zinc-500 mt-3">Loading dashboard...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (!user) return null;

  return (
    <MobileLayout title="Dashboard" showSearch={false}>
      <div className="space-y-5 pb-6">
        
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-5 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-purple-400" />
            <span className="text-xs text-purple-400 font-medium">Welcome back</span>
          </div>
          <h1 className="text-xl font-bold text-white">
            {profile?.name || user.name || 'Trader'}
          </h1>
          <p className="text-xs text-zinc-400 mt-1 truncate">{user.email}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard 
            title="Reviews" 
            value={stats.totalReviews} 
            icon={MessageCircle} 
            color="from-purple-500 to-pink-500"
            onClick={() => router.push('/dashboard/reviews')}
          />
          <StatCard 
            title="Incidents" 
            value={stats.totalIncidents} 
            icon={AlertTriangle} 
            color="from-orange-500 to-red-500"
            onClick={() => router.push('/dashboard/incidents')}
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

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Link href="/reviews" className="flex-1">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-3 text-center">
              <MessageCircle size={16} className="text-white mx-auto mb-1" />
              <span className="text-white text-xs font-medium">Write Review</span>
            </div>
          </Link>
          <Link href="/reviews?tab=incidents" className="flex-1">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-3 text-center">
              <AlertTriangle size={16} className="text-white mx-auto mb-1" />
              <span className="text-white text-xs font-medium">Report Issue</span>
            </div>
          </Link>
          <Link href="/dashboard/profile" className="flex-1">
            <div className="bg-zinc-800 rounded-xl p-3 text-center">
              <User size={16} className="text-zinc-300 mx-auto mb-1" />
              <span className="text-zinc-300 text-xs font-medium">Profile</span>
            </div>
          </Link>
        </div>

        {/* Review Summary */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-purple-400" />
              <span className="text-sm font-medium text-white">Review Status</span>
            </div>
            <Link href="/dashboard/reviews" className="text-[10px] text-purple-400">View all</Link>
          </div>
          <div className="flex justify-between text-center">
            <div>
              <div className="text-green-400 font-bold text-lg">{stats.approvedReviews}</div>
              <div className="text-[10px] text-zinc-500">Approved</div>
            </div>
            <div>
              <div className="text-yellow-400 font-bold text-lg">{stats.pendingReviews}</div>
              <div className="text-[10px] text-zinc-500">Pending</div>
            </div>
          </div>
        </div>

        {/* Incident Summary */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-orange-400" />
              <span className="text-sm font-medium text-white">Incident Status</span>
            </div>
            <Link href="/dashboard/incidents" className="text-[10px] text-orange-400">View all</Link>
          </div>
          <div className="flex justify-between text-center">
            <div>
              <div className="text-green-400 font-bold text-lg">{stats.resolvedIncidents}</div>
              <div className="text-[10px] text-zinc-500">Resolved</div>
            </div>
            <div>
              <div className="text-yellow-400 font-bold text-lg">{stats.pendingIncidents}</div>
              <div className="text-[10px] text-zinc-500">Pending</div>
            </div>
          </div>
        </div>

        {/* Trust Score Progress */}
        {stats.avgTrustScore > 0 && (
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} className="text-purple-400" />
              <span className="text-sm font-medium text-white">Your Trust Score</span>
            </div>
            <div className="text-2xl font-bold text-white mb-2">{stats.avgTrustScore}</div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${stats.avgTrustScore}%` }} />
            </div>
            <p className="text-[10px] text-zinc-500 mt-2 text-center">
              Based on {stats.approvedReviews} approved review{stats.approvedReviews !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Recent Activity Tabs */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="flex border-b border-zinc-800">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-3 text-sm font-medium transition-all ${
                activeTab === 'reviews'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/5'
                  : 'text-zinc-500'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <Star size={12} />
                Recent Reviews ({recentReviews.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('incidents')}
              className={`flex-1 py-3 text-sm font-medium transition-all ${
                activeTab === 'incidents'
                  ? 'text-orange-400 border-b-2 border-orange-400 bg-orange-500/5'
                  : 'text-zinc-500'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <AlertTriangle size={12} />
                Recent Incidents ({recentIncidents.length})
              </div>
            </button>
          </div>

          <div className="p-3 space-y-2">
            {activeTab === 'reviews' ? (
              recentReviews.length === 0 ? (
                <div className="text-center py-8">
                  <Star size={24} className="text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs text-zinc-500">No reviews yet</p>
                  <Link href="/reviews" className="text-purple-400 text-xs mt-1 inline-block">Write your first review →</Link>
                </div>
              ) : (
                recentReviews.map((review) => (
                  <ActivityItem key={review.id} activity={review} type="review" />
                ))
              )
            ) : (
              recentIncidents.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle size={24} className="text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs text-zinc-500">No incidents reported</p>
                  <Link href="/reviews?tab=incidents" className="text-orange-400 text-xs mt-1 inline-block">Report an incident →</Link>
                </div>
              ) : (
                recentIncidents.map((incident) => (
                  <ActivityItem key={incident.id} activity={incident} type="incident" />
                ))
              )
            )}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center justify-center gap-2 active:bg-red-500/20 transition-all"
        >
          <LogOut size={14} />
          Sign Out
        </button>

        {/* Footer */}
        <div className="text-center text-[10px] text-zinc-600 py-2">
          Your contributions help keep the trading community informed
        </div>
      </div>
    </MobileLayout>
  );
}