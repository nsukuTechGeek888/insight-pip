'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, ArrowLeft, Search, RefreshCw, MoreVertical, 
  Star, AlertTriangle, MessageCircle, ThumbsUp, 
  CheckCircle, XCircle, Clock, Mail, Calendar,
  Shield, Crown, User, Filter, Eye, Ban,
  Activity, FileText, TrendingUp, X, Flag,
  Edit, Trash2, MessageSquare, Link as LinkIcon,
  ExternalLink
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  status: string;
  helpfulCount: number;
  replyCount: number;
  reportCount: number;
  createdAt: string;
  isFeatured: boolean;
  isHidden: boolean;
  isApproved: boolean;
  trustScore: number | null;
  broker?: { name: string };
  propFirm?: { name: string };
  replies?: ReviewReply[];
  votes?: HelpfulVote[];
  reports?: ReviewReport[];
}

interface ReviewReply {
  id: string;
  content: string;
  replyType: string;
  createdAt: string;
  user?: { name: string; email: string };
  broker?: { name: string };
  propFirm?: { name: string };
  helpfulCount: number;
  isApproved: boolean;
  isHidden: boolean;
}

interface HelpfulVote {
  id: string;
  voteType: string;
  userId: string;
}

interface ReviewReport {
  id: string;
  reason: string;
  details: string;
  status: string;
  createdAt: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  createdAt: string;
  _count: {
    reviews: number;
    incidents: number;
    favorites: number;
  };
  stats?: {
    totalReviews: number;
    approvedReviews: number;
    pendingReviews: number;
    totalIncidents: number;
    pendingIncidents: number;
    resolvedIncidents: number;
    totalFavorites: number;
    helpfulReceived: number;
    avgTrustScore: number;
    impactScore: number;
    reportedReviews: number;
  };
  recentActivity?: {
    reviews: any[];
    incidents: any[];
  };
  reviews?: Review[];
  reviewReplies?: ReviewReply[];
}

export default function AdminUsersPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'profile' | 'reviews' | 'replies' | 'incidents'>('profile');

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
      return;
    }
    if (user?.role === 'ADMIN') {
      fetchUsers();
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchUsers();
    }
  }, [searchQuery, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      params.append('limit', '50');

      const response = await fetch(`/api/admin/users?${params}`, { 
        credentials: 'include' 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      setUsers(data.users || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}?include=reviews,replies`, { 
        credentials: 'include' 
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      
      const data = await response.json();
      setSelectedUser(data.user);
      setShowUserModal(true);
      setSelectedTab('profile');
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    setUpdating(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, role: newRole })
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchUsers();
        if (selectedUser?.id === userId) {
          setSelectedUser(prev => prev ? { ...prev, role: newRole } : null);
        }
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      setUpdating(false);
      setActionMenu(null);
    }
  };

  const toggleUserStatus = async (userId: string, action: 'suspend' | 'activate') => {
    setUpdating(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, action })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} user`);
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchUsers();
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
    } finally {
      setUpdating(false);
      setActionMenu(null);
    }
  };

  const flagUserReview = async (reviewId: string, reason: string, details?: string) => {
    try {
      const response = await fetch('/api/admin/reviews/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reviewId, reason, details })
      });

      if (!response.ok) {
        throw new Error('Failed to flag review');
      }

      const data = await response.json();
      
      if (data.success) {
        // Refresh user details to show updated flag
        if (selectedUser) {
          await fetchUserDetails(selectedUser.id);
        }
        alert('Review flagged successfully');
      }
    } catch (error) {
      console.error('Error flagging review:', error);
      alert('Failed to flag review');
    }
  };

  const updateReviewStatus = async (reviewId: string, action: 'approve' | 'reject' | 'hide' | 'feature') => {
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reviewId, action })
      });

      if (!response.ok) {
        throw new Error('Failed to update review');
      }

      const data = await response.json();
      
      if (data.success) {
        if (selectedUser) {
          await fetchUserDetails(selectedUser.id);
        }
        alert(`Review ${action}d successfully`);
      }
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Failed to update review');
    }
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'ADMIN': return { text: 'Admin', color: 'text-purple-400', bg: 'bg-purple-500/20', icon: Crown };
      case 'MODERATOR': return { text: 'Moderator', color: 'text-blue-400', bg: 'bg-blue-500/20', icon: Shield };
      default: return { text: 'User', color: 'text-zinc-400', bg: 'bg-zinc-500/20', icon: User };
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'APPROVED': return { text: 'Approved', color: 'text-green-400', bg: 'bg-green-500/20' };
      case 'PENDING': return { text: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
      case 'REJECTED': return { text: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/20' };
      default: return { text: status, color: 'text-zinc-400', bg: 'bg-zinc-500/20' };
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="p-2 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <p className="text-zinc-400 text-sm">View and manage all platform users</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm"
          >
            <option value="all">All Roles</option>
            <option value="USER">Users</option>
            <option value="MODERATOR">Moderators</option>
            <option value="ADMIN">Admins</option>
          </select>
          <button 
            onClick={fetchUsers} 
            className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800/50 border-b border-zinc-800">
                <tr className="text-left text-xs text-zinc-400">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Activity</th>
                  <th className="px-4 py-3">Engagement</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                      {loading ? 'Loading...' : 'No users found'}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const roleBadge = getRoleBadge(user.role);
                    const RoleIcon = roleBadge.icon;
                    const hasReports = user.stats?.reportedReviews && user.stats.reportedReviews > 0;
                    
                    return (
                      <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td 
                          className="px-4 py-3 cursor-pointer"
                          onClick={() => fetchUserDetails(user.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-white font-medium border border-zinc-700 relative">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                user.name?.charAt(0)?.toUpperCase() || 'U'
                              )}
                              {hasReports && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black"></span>
                              )}
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">{user.name || 'Anonymous'}</p>
                              <p className="text-zinc-500 text-xs">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${roleBadge.bg} ${roleBadge.color}`}>
                            <RoleIcon size={10} /> {roleBadge.text}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3 text-xs">
                              <span className="flex items-center gap-1 text-yellow-400">
                                <Star size={10} /> {user._count?.reviews || 0}
                              </span>
                              <span className="flex items-center gap-1 text-red-400">
                                <AlertTriangle size={10} /> {user._count?.incidents || 0}
                              </span>
                              <span className="flex items-center gap-1 text-blue-400">
                                <Heart size={10} /> {user._count?.favorites || 0}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {user.stats?.avgTrustScore ? (
                              <div className="flex items-center gap-1">
                                <TrendingUp size={12} className="text-green-400" />
                                <span className="text-white text-sm">{user.stats.avgTrustScore}%</span>
                              </div>
                            ) : (
                              <span className="text-zinc-500 text-xs">No activity</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-zinc-400 text-xs">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionMenu(actionMenu === user.id ? null : user.id);
                              }} 
                              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
                            >
                              <MoreVertical size={14} />
                            </button>
                            {actionMenu === user.id && (
                              <div className="absolute right-0 mt-1 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-10">
                                <button 
                                  onClick={() => {
                                    fetchUserDetails(user.id);
                                    setActionMenu(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-zinc-800 flex items-center gap-2"
                                >
                                  <Eye size={12} /> View Details
                                </button>
                                <button 
                                  onClick={() => {
                                    fetchUserDetails(user.id);
                                    setSelectedTab('reviews');
                                    setActionMenu(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-xs text-yellow-400 hover:bg-zinc-800 flex items-center gap-2"
                                >
                                  <Star size={12} /> View Reviews
                                </button>
                                <button 
                                  onClick={() => updateUserRole(user.id, 'MODERATOR')}
                                  className="w-full px-3 py-2 text-left text-xs text-blue-400 hover:bg-zinc-800 flex items-center gap-2"
                                >
                                  <Shield size={12} /> Make Moderator
                                </button>
                                <button 
                                  onClick={() => updateUserRole(user.id, 'ADMIN')}
                                  className="w-full px-3 py-2 text-left text-xs text-purple-400 hover:bg-zinc-800 flex items-center gap-2"
                                >
                                  <Crown size={12} /> Make Admin
                                </button>
                                <button 
                                  onClick={() => updateUserRole(user.id, 'USER')}
                                  className="w-full px-3 py-2 text-left text-xs text-zinc-400 hover:bg-zinc-800 flex items-center gap-2"
                                >
                                  <User size={12} /> Demote to User
                                </button>
                                <div className="border-t border-zinc-800 my-1"></div>
                                <button 
                                  onClick={() => toggleUserStatus(user.id, 'suspend')}
                                  className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-zinc-800 flex items-center gap-2"
                                >
                                  <Ban size={12} /> Suspend User
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

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900 z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-white text-xl font-medium border border-zinc-700">
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    selectedUser.name?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedUser.name || 'Anonymous'}</h3>
                  <p className="text-zinc-400 text-sm">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setShowUserModal(false)} className="text-zinc-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-800 px-6">
              <button
                onClick={() => setSelectedTab('profile')}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  selectedTab === 'profile'
                    ? 'text-purple-400 border-purple-400'
                    : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setSelectedTab('reviews')}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  selectedTab === 'reviews'
                    ? 'text-yellow-400 border-yellow-400'
                    : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                Reviews ({selectedUser._count?.reviews || 0})
              </button>
              <button
                onClick={() => setSelectedTab('replies')}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  selectedTab === 'replies'
                    ? 'text-blue-400 border-blue-400'
                    : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                Comments
              </button>
              <button
                onClick={() => setSelectedTab('incidents')}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  selectedTab === 'incidents'
                    ? 'text-red-400 border-red-400'
                    : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                Incidents ({selectedUser._count?.incidents || 0})
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedTab === 'profile' && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  {selectedUser.stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-zinc-800/50 rounded-lg p-4">
                        <p className="text-zinc-400 text-xs">Reviews</p>
                        <p className="text-2xl font-bold text-white">{selectedUser.stats.totalReviews}</p>
                        <div className="flex gap-2 mt-1 text-xs">
                          <span className="text-green-400">{selectedUser.stats.approvedReviews} ✓</span>
                          <span className="text-yellow-400">{selectedUser.stats.pendingReviews} ⏳</span>
                          {selectedUser.stats.reportedReviews > 0 && (
                            <span className="text-red-400">{selectedUser.stats.reportedReviews} 🚩</span>
                          )}
                        </div>
                      </div>
                      <div className="bg-zinc-800/50 rounded-lg p-4">
                        <p className="text-zinc-400 text-xs">Incidents</p>
                        <p className="text-2xl font-bold text-white">{selectedUser.stats.totalIncidents}</p>
                        <div className="flex gap-2 mt-1 text-xs">
                          <span className="text-green-400">{selectedUser.stats.resolvedIncidents} ✓</span>
                          <span className="text-yellow-400">{selectedUser.stats.pendingIncidents} ⏳</span>
                        </div>
                      </div>
                      <div className="bg-zinc-800/50 rounded-lg p-4">
                        <p className="text-zinc-400 text-xs">Favorites</p>
                        <p className="text-2xl font-bold text-white">{selectedUser.stats.totalFavorites}</p>
                        <p className="text-xs text-zinc-500 mt-1">Saved items</p>
                      </div>
                      <div className="bg-zinc-800/50 rounded-lg p-4">
                        <p className="text-zinc-400 text-xs">Impact Score</p>
                        <p className="text-2xl font-bold text-white">{selectedUser.stats.impactScore || 0}</p>
                        <p className="text-xs text-zinc-500 mt-1">Influence level</p>
                      </div>
                    </div>
                  )}

                  {/* User Info */}
                  <div className="bg-zinc-800/30 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-zinc-500">User ID</p>
                        <p className="text-white font-mono text-xs">{selectedUser.id}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500">Role</p>
                        <p className="text-white">{selectedUser.role}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500">Joined</p>
                        <p className="text-white">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500">Status</p>
                        <p className="text-green-400">Active</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setSelectedTab('reviews')}
                      className="px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 text-sm"
                    >
                      <Star size={16} className="inline mr-2" />
                      View Reviews
                    </button>
                    <button
                      onClick={() => updateUserRole(selectedUser.id, 'MODERATOR')}
                      disabled={updating}
                      className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-sm disabled:opacity-50"
                    >
                      <Shield size={16} className="inline mr-2" />
                      Make Moderator
                    </button>
                    <button
                      onClick={() => updateUserRole(selectedUser.id, 'ADMIN')}
                      disabled={updating}
                      className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 text-sm disabled:opacity-50"
                    >
                      <Crown size={16} className="inline mr-2" />
                      Make Admin
                    </button>
                    <button
                      onClick={() => toggleUserStatus(selectedUser.id, 'suspend')}
                      disabled={updating}
                      className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm disabled:opacity-50"
                    >
                      <Ban size={16} className="inline mr-2" />
                      Suspend User
                    </button>
                  </div>
                </div>
              )}

              {selectedTab === 'reviews' && (
                <div className="space-y-4">
                  {selectedUser.reviews && selectedUser.reviews.length > 0 ? (
                    selectedUser.reviews.map((review) => {
                      const statusBadge = getStatusBadge(review.status);
                      const entityName = review.broker?.name || review.propFirm?.name || 'Unknown';
                      const hasReports = review.reportCount && review.reportCount > 0;
                      
                      return (
                        <div key={review.id} className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700/50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-medium">{review.title}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${statusBadge.bg} ${statusBadge.color}`}>
                                  {statusBadge.text}
                                </span>
                                {review.isFeatured && (
                                  <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-400">⭐ Featured</span>
                                )}
                                {review.isHidden && (
                                  <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400">Hidden</span>
                                )}
                                {hasReports && (
                                  <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400 flex items-center gap-1">
                                    <Flag size={10} /> {review.reportCount} reports
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-zinc-400 mb-2">
                                <span>Rating: {review.rating}/5 ⭐</span>
                                <span>Entity: {entityName}</span>
                                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                {review.trustScore && (
                                  <span className="text-green-400">Trust Score: {review.trustScore}%</span>
                                )}
                              </div>
                              <p className="text-zinc-300 text-sm">{review.content}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                                <span>👍 {review.helpfulCount} helpful</span>
                                <span>💬 {review.replyCount} replies</span>
                                <span>🚩 {review.reportCount || 0} reports</span>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => {
                                  const reason = prompt('Enter reason for flagging this review:');
                                  if (reason) {
                                    flagUserReview(review.id, reason);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                title="Flag Review"
                              >
                                <Flag size={14} />
                              </button>
                              <button
                                onClick={() => updateReviewStatus(review.id, 'approve')}
                                className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                title="Approve"
                              >
                                <CheckCircle size={14} />
                              </button>
                              <button
                                onClick={() => updateReviewStatus(review.id, 'reject')}
                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                title="Reject"
                              >
                                <XCircle size={14} />
                              </button>
                              <button
                                onClick={() => updateReviewStatus(review.id, 'hide')}
                                className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                                title="Hide"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => updateReviewStatus(review.id, 'feature')}
                                className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                                title="Feature"
                              >
                                <Star size={14} />
                              </button>
                            </div>
                          </div>
                          
                          {/* Show replies for this review */}
                          {review.replies && review.replies.length > 0 && (
                            <div className="mt-3 pl-4 border-l-2 border-zinc-700/50 space-y-2">
                              <p className="text-xs text-zinc-500">Replies:</p>
                              {review.replies.slice(0, 3).map((reply) => (
                                <div key={reply.id} className="bg-zinc-800/50 rounded p-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <MessageSquare size={12} className="text-blue-400" />
                                    <span className="text-zinc-300">{reply.content}</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                                    <span>By: {reply.user?.name || reply.broker?.name || reply.propFirm?.name || 'Unknown'}</span>
                                    <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                                    {reply.replyType === 'BROKER' && (
                                      <span className="text-blue-400">(Broker Reply)</span>
                                    )}
                                    {reply.replyType === 'PROP_FIRM' && (
                                      <span className="text-purple-400">(Prop Firm Reply)</span>
                                    )}
                                    {reply.replyType === 'ADMIN' && (
                                      <span className="text-red-400">(Admin Reply)</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {review.replies.length > 3 && (
                                <p className="text-xs text-zinc-500">+ {review.replies.length - 3} more replies</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-zinc-500 py-8">
                      No reviews found for this user
                    </div>
                  )}
                </div>
              )}

              {selectedTab === 'replies' && (
                <div className="space-y-4">
                  {selectedUser.reviewReplies && selectedUser.reviewReplies.length > 0 ? (
                    selectedUser.reviewReplies.map((reply) => (
                      <div key={reply.id} className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700/50">
                        <div className="flex items-start gap-3">
                          <MessageSquare size={16} className="text-blue-400 mt-1" />
                          <div className="flex-1">
                            <p className="text-zinc-300 text-sm">{reply.content}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                              <span>Reply Type: {reply.replyType}</span>
                              <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                              {reply.isApproved ? (
                                <span className="text-green-400">✅ Approved</span>
                              ) : (
                                <span className="text-yellow-400">⏳ Pending</span>
                              )}
                              {reply.isHidden && <span className="text-red-400">🔒 Hidden</span>}
                              <span>👍 {reply.helpfulCount} helpful</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const reason = prompt('Enter reason for flagging this reply:');
                                if (reason) {
                                  // Flag reply functionality
                                  alert('Reply flagged successfully');
                                }
                              }}
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                              title="Flag Reply"
                            >
                              <Flag size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-zinc-500 py-8">
                      No comments/replies found for this user
                    </div>
                  )}
                </div>
              )}

              {selectedTab === 'incidents' && (
                <div className="space-y-4">
                  {selectedUser.recentActivity?.incidents && selectedUser.recentActivity.incidents.length > 0 ? (
                    selectedUser.recentActivity.incidents.map((incident) => (
                      <div key={incident.id} className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700/50">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle size={16} className="text-red-400" />
                              <span className="text-white font-medium">{incident.title}</span>
                              <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400">
                                {incident.incidentType}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                incident.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {incident.status}
                              </span>
                            </div>
                            <div className="text-xs text-zinc-500">
                              <span>{new Date(incident.createdAt).toLocaleDateString()}</span>
                              {incident.resolutionStatus && (
                                <span className="ml-3">Resolution: {incident.resolutionStatus}</span>
                              )}
                              {incident.confirmations > 0 && (
                                <span className="ml-3">✅ {incident.confirmations} confirmations</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-zinc-500 py-8">
                      No incidents found for this user
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Heart icon component
function Heart(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}