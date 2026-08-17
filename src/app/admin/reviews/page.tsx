'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Star, ArrowLeft, CheckCircle, XCircle, Clock, Eye, Search,
  RefreshCw, MoreVertical, ThumbsUp, MessageCircle, Flag,
  Trash2, MessageSquare, User, Building2, Shield, X,
  Loader2, AlertTriangle, ChevronDown, ChevronRight
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

interface ReviewReply {
  id: string;
  content: string;
  replyType: string;
  createdAt: string;
  helpfulCount: number;
  isApproved: boolean;
  isHidden: boolean;
  user?: { name: string; email: string };
  broker?: { name: string };
  propFirm?: { name: string };
  _count?: { replies: number };
}

interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  status: string;
  isFeatured: boolean;
  isHidden: boolean;
  helpfulCount: number;
  replyCount: number;
  reportCount: number;
  createdAt: string;
  user: { id: string; name: string; email: string };
  broker?: { id: number; name: string };
  propFirm?: { id: number; name: string };
  replies?: ReviewReply[];
}

export default function AdminReviewsPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'review' | 'reply'; id: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
      return;
    }
    if (user?.role === 'ADMIN') {
      fetchReviews();
    }
  }, [user, isLoading, statusFilter, searchQuery]);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: '50',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery })
      });
      const response = await fetch(`/api/admin/reviews?${params}`, { credentials: 'include' });
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch reviews');
      }
      
      setReviews(data.reviews || []);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      setError(error.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (reviewId: string, action: string) => {
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
        await fetchReviews();
      }
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Failed to update review');
    }
    setActionMenu(null);
  };

  const deleteReview = async (reviewId: string) => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/reviews?id=${reviewId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete review');
      }
      
      const data = await response.json();
      
      if (data.success) {
        await fetchReviews();
        setShowDeleteModal(false);
        setDeleteTarget(null);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    } finally {
      setDeleting(false);
    }
  };

  const deleteReply = async (replyId: string) => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/reviews/replies?id=${replyId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete reply');
      }
      
      const data = await response.json();
      
      if (data.success) {
        await fetchReviews();
        setShowDeleteModal(false);
        setDeleteTarget(null);
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      alert('Failed to delete reply');
    } finally {
      setDeleting(false);
    }
  };

  const toggleReplyApproval = async (replyId: string, approve: boolean) => {
    try {
      const response = await fetch('/api/admin/reviews/replies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ replyId, approve })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update reply');
      }
      
      const data = await response.json();
      
      if (data.success) {
        await fetchReviews();
      }
    } catch (error) {
      console.error('Error updating reply:', error);
      alert('Failed to update reply');
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'APPROVED': return { text: 'Approved', color: 'text-green-400', bg: 'bg-green-500/20', icon: CheckCircle };
      case 'PENDING': return { text: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: Clock };
      case 'REJECTED': return { text: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/20', icon: XCircle };
      default: return { text: status, color: 'text-zinc-400', bg: 'bg-zinc-500/20', icon: Eye };
    }
  };

  const getReplyTypeIcon = (type: string) => {
    switch(type) {
      case 'USER': return { icon: User, color: 'text-blue-400' };
      case 'BROKER': return { icon: Building2, color: 'text-green-400' };
      case 'PROP_FIRM': return { icon: Building2, color: 'text-purple-400' };
      case 'ADMIN': return { icon: Shield, color: 'text-red-400' };
      default: return { icon: MessageSquare, color: 'text-zinc-400' };
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
            <h1 className="text-2xl font-bold text-white">Review Moderation</h1>
            <p className="text-zinc-400 text-sm">Approve, reject, or feature user reviews and manage comments</p>
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
              placeholder="Search reviews..."
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
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <button onClick={fetchReviews} className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Reviews Table */}
        <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800/50 border-b border-zinc-800">
                <tr className="text-left text-xs text-zinc-400">
                  <th className="px-4 py-3">Review</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Engagement</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {reviews.length === 0 ? (
                  <tr key="no-reviews">
                    <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">No reviews found</td>
                  </tr>
                ) : (
                  reviews.map((review) => {
                    const statusBadge = getStatusBadge(review.status);
                    const StatusIcon = statusBadge.icon;
                    const entityName = review.broker?.name || review.propFirm?.name || 'Unknown';
                    const isExpanded = expandedReview === review.id;
                    
                    return (
                      <Fragment key={review.id}>
                        {/* Main Review Row */}
                        <tr className="hover:bg-zinc-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-start gap-2">
                              <button
                                onClick={() => setExpandedReview(isExpanded ? null : review.id)}
                                className="mt-0.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                              >
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              </button>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium line-clamp-1">{review.title}</p>
                                <p className="text-zinc-500 text-xs mt-1 line-clamp-2">{review.content.substring(0, 100)}...</p>
                                <p className="text-xs text-zinc-600 mt-1">{entityName}</p>
                                {review.reportCount > 0 && (
                                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400">
                                    <Flag size={10} /> {review.reportCount} reports
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-white text-sm">{review.user?.name || 'Anonymous'}</p>
                            <p className="text-zinc-500 text-xs">{review.user?.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Star size={14} className="text-yellow-400" />
                              <span className="text-white">{review.rating}.0</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusBadge.bg} ${statusBadge.color}`}>
                                <StatusIcon size={10} /> {statusBadge.text}
                              </span>
                              {review.isFeatured && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400">
                                  <Star size={10} /> Featured
                                </span>
                              )}
                              {review.isHidden && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
                                  <Eye size={10} /> Hidden
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 text-xs text-zinc-500">
                              <span className="flex items-center gap-1">
                                <ThumbsUp size={10} /> {review.helpfulCount}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle size={10} /> {review.replyCount}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-zinc-400 text-xs">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="relative">
                              <button 
                                onClick={() => setActionMenu(actionMenu === review.id ? null : review.id)} 
                                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
                              >
                                <MoreVertical size={14} />
                              </button>
                              {actionMenu === review.id && (
                                <div className="absolute right-0 mt-1 w-40 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-10">
                                  <button 
                                    onClick={() => {
                                      updateReviewStatus(review.id, 'approve');
                                      setActionMenu(null);
                                    }} 
                                    className="w-full px-3 py-2 text-left text-xs text-green-400 hover:bg-zinc-800 flex items-center gap-2"
                                  >
                                    <CheckCircle size={12} /> Approve
                                  </button>
                                  <button 
                                    onClick={() => {
                                      updateReviewStatus(review.id, 'reject');
                                      setActionMenu(null);
                                    }} 
                                    className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-zinc-800 flex items-center gap-2"
                                  >
                                    <XCircle size={12} /> Reject
                                  </button>
                                  <button 
                                    onClick={() => {
                                      updateReviewStatus(review.id, review.isFeatured ? 'unfeature' : 'feature');
                                      setActionMenu(null);
                                    }} 
                                    className="w-full px-3 py-2 text-left text-xs text-purple-400 hover:bg-zinc-800 flex items-center gap-2"
                                  >
                                    <Star size={12} /> {review.isFeatured ? 'Unfeature' : 'Feature'}
                                  </button>
                                  <button 
                                    onClick={() => {
                                      updateReviewStatus(review.id, review.isHidden ? 'unhide' : 'hide');
                                      setActionMenu(null);
                                    }} 
                                    className="w-full px-3 py-2 text-left text-xs text-yellow-400 hover:bg-zinc-800 flex items-center gap-2"
                                  >
                                    <Eye size={12} /> {review.isHidden ? 'Unhide' : 'Hide'}
                                  </button>
                                  <div className="border-t border-zinc-800 my-1"></div>
                                  <button 
                                    onClick={() => {
                                      setDeleteTarget({ type: 'review', id: review.id });
                                      setShowDeleteModal(true);
                                      setActionMenu(null);
                                    }} 
                                    className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-zinc-800 flex items-center gap-2"
                                  >
                                    <Trash2 size={12} /> Delete Review
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                        
                        {/* Expanded replies section - using a single row with colspan */}
                        {isExpanded && (
                          <tr className="bg-zinc-800/20">
                            <td colSpan={7} className="px-4 py-3">
                              <div className="pl-8 border-l-2 border-zinc-700/50">
                                <div className="flex items-center gap-2 mb-3">
                                  <MessageSquare size={14} className="text-blue-400" />
                                  <span className="text-xs text-zinc-400 font-medium">
                                    Comments ({review.replies?.length || 0})
                                  </span>
                                  {review.replyCount > 0 && (
                                    <span className="text-xs text-zinc-500">
                                      ({review.replyCount} total)
                                    </span>
                                  )}
                                </div>
                                <div className="space-y-3">
                                  {review.replies && review.replies.length > 0 ? (
                                    review.replies.map((reply) => {
                                      const ReplyIcon = getReplyTypeIcon(reply.replyType).icon;
                                      const replyColor = getReplyTypeIcon(reply.replyType).color;
                                      const replyAuthor = reply.user?.name || reply.broker?.name || reply.propFirm?.name || 'Unknown';
                                      
                                      return (
                                        <div key={reply.id} className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700/30">
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <ReplyIcon size={12} className={replyColor} />
                                                <span className="text-xs font-medium text-white">{replyAuthor}</span>
                                                <span className={`text-xs ${replyColor}`}>
                                                  ({reply.replyType})
                                                </span>
                                                {reply.isApproved ? (
                                                  <span className="text-xs text-green-400 flex items-center gap-1">
                                                    <CheckCircle size={10} /> Approved
                                                  </span>
                                                ) : (
                                                  <span className="text-xs text-yellow-400 flex items-center gap-1">
                                                    <Clock size={10} /> Pending
                                                  </span>
                                                )}
                                                {reply.isHidden && (
                                                  <span className="text-xs text-red-400 flex items-center gap-1">
                                                    <Eye size={10} /> Hidden
                                                  </span>
                                                )}
                                                <span className="text-xs text-zinc-500 flex items-center gap-1">
                                                  <ThumbsUp size={10} /> {reply.helpfulCount}
                                                </span>
                                                <span className="text-xs text-zinc-500">
                                                  {new Date(reply.createdAt).toLocaleDateString()}
                                                </span>
                                              </div>
                                              <p className="text-zinc-300 text-sm">{reply.content}</p>
                                            </div>
                                            <div className="flex gap-1 ml-4 flex-shrink-0">
                                              <button
                                                onClick={() => toggleReplyApproval(reply.id, !reply.isApproved)}
                                                className="p-1 rounded bg-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                                                title={reply.isApproved ? 'Unapprove' : 'Approve'}
                                              >
                                                {reply.isApproved ? (
                                                  <XCircle size={12} />
                                                ) : (
                                                  <CheckCircle size={12} />
                                                )}
                                              </button>
                                              <button
                                                onClick={() => {
                                                  setDeleteTarget({ type: 'reply', id: reply.id });
                                                  setShowDeleteModal(true);
                                                }}
                                                className="p-1 rounded bg-zinc-700/50 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors"
                                                title="Delete Reply"
                                              >
                                                <Trash2 size={12} />
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <p className="text-zinc-500 text-sm text-center py-2">No comments yet</p>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
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
                Are you sure you want to delete this {deleteTarget.type}? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteTarget.type === 'review') {
                      deleteReview(deleteTarget.id);
                    } else {
                      deleteReply(deleteTarget.id);
                    }
                  }}
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
                      Delete {deleteTarget.type}
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