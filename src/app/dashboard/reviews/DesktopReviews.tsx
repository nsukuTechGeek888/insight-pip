'use client';

import {confirmAction} from '@/components/ui/Feedback';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ThumbsUp, Star, MessageCircle, ArrowLeft, Edit, Trash2, Eye,
  CheckCircle, XCircle, Clock, AlertCircle, Search,
  Filter, ChevronDown, MoreVertical, Copy, Check
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import TrustScoreBadge from '@/components/ui/TrustScoreBadge';

const generateGradient = (name: string) => {
  const gradients = [
    "from-pink-500 to-blue-500",
    "from-blue-500 to-blue-500",
    "from-green-500 to-blue-500",
    "from-yellow-500 to-orange-500",
    "from-red-500 to-pink-500",
  ];
  const index = (name?.length || 0) % gradients.length;
  return gradients[index];
};

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizes = { sm: "w-4 h-4", md: "w-5 h-5" };
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${sizes[size]} ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}`} />
      ))}
    </div>
  );
}

export default function MyReviewsPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchReviews();
    }
  }, [user, isLoading, pagination.page, statusFilter, searchQuery]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery })
      });
      const response = await fetch(`/api/user/reviews?${params}`, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!await confirmAction('Are you sure you want to delete this review? This action cannot be undone.')) return;
    setDeletingId(reviewId);
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE', credentials: 'include' });
      if (response.ok) {
        setReviews(reviews.filter(r => r.id !== reviewId));
        setPagination(prev => ({ ...prev, total: prev.total - 1 }));
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[var(--ip-bg)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--ip-bg)] pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="p-2 rounded-lg bg-[var(--ip-surface-2)] text-[var(--ip-text-2)] hover:text-[var(--ip-text)] transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--ip-text)]">My Reviews</h1>
            <p className="text-[var(--ip-text-2)] text-sm mt-1">Manage and track your reviews</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[var(--ip-surface)] rounded-xl p-4 border border-[var(--ip-border)]">
            <div className="flex items-center gap-3">
              <MessageCircle size={20} className="text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-[var(--ip-text)]">{pagination.total}</div>
                <div className="text-xs text-[var(--ip-text-2)]">Total Reviews</div>
              </div>
            </div>
          </div>
          <div className="bg-[var(--ip-surface)] rounded-xl p-4 border border-[var(--ip-border)]">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-green-400" />
              <div>
                <div className="text-2xl font-bold text-[var(--ip-text)]">{reviews.filter(r => r.status === 'APPROVED').length}</div>
                <div className="text-xs text-[var(--ip-text-2)]">Approved</div>
              </div>
            </div>
          </div>
          <div className="bg-[var(--ip-surface)] rounded-xl p-4 border border-[var(--ip-border)]">
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-[var(--ip-text)]">{reviews.filter(r => r.status === 'PENDING').length}</div>
                <div className="text-xs text-[var(--ip-text-2)]">Pending</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ip-text-2)]" size={16} />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg pl-10 pr-4 py-2 text-[var(--ip-text)] text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-4 py-2 text-[var(--ip-text)] text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-16 bg-[var(--ip-surface)] rounded-2xl border border-[var(--ip-border)]">
            <MessageCircle size={48} className="text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[var(--ip-text)] mb-2">No reviews yet</h3>
            <p className="text-[var(--ip-text-2)] mb-6">Share your trading experience with the community</p>
            <Link href="/reviews" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-pink-600 text-[var(--ip-text)] rounded-lg hover:from-blue-500 hover:to-pink-500 transition-all">Write a Review</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--ip-surface)] rounded-xl border border-[var(--ip-border)] p-5 hover:border-blue-500/30 transition-all"
              >
                <div className="flex flex-col md:flex-row gap-5">
                  {/* Left Side */}
                  <div className="md:w-48 flex-shrink-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${generateGradient(review.entityName)} flex items-center justify-center text-[var(--ip-text)] font-bold text-lg`}>
                        {review.entityName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--ip-text)]">{review.entityName}</h3>
                        <p className="text-xs text-[var(--ip-text-2)] capitalize">{review.entityType}</p>
                      </div>
                    </div>
                    <div className="text-center p-3 bg-[var(--ip-surface-2)] rounded-lg mb-3">
                      <div className="text-2xl font-bold text-[var(--ip-text)]">{review.rating}.0</div>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    {review.trustScore && (
                      <div className="p-2 bg-gradient-to-r from-blue-500/10 to-pink-500/10 rounded-lg text-center">
                        <div className="text-xs text-[var(--ip-text-2)]">Trust Score</div>
                        <div className="text-sm font-bold text-blue-400">{review.trustScore}</div>
                      </div>
                    )}
                  </div>

                  {/* Right Side */}
                  <div className="flex-1">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                      <div>
                        <h4 className="text-lg font-semibold text-[var(--ip-text)]">{review.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-[var(--ip-text-2)] mt-1">
                          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className={`flex items-center gap-1 ${review.status === 'APPROVED' ? 'text-green-400' : review.status === 'PENDING' ? 'text-yellow-400' : 'text-red-400'}`}>
                            {review.status === 'APPROVED' ? <CheckCircle size={12} /> : review.status === 'PENDING' ? <Clock size={12} /> : <XCircle size={12} />}
                            {review.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/reviews/${review.id}`}
                          className="p-2 rounded-lg text-[var(--ip-text-2)] hover:text-blue-400 transition-colors"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/dashboard/reviews/edit/${review.id}`}
                          className="p-2 rounded-lg text-[var(--ip-text-2)] hover:text-green-400 transition-colors"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(review.id)}
                          disabled={deletingId === review.id}
                          className="p-2 rounded-lg text-[var(--ip-text-2)] hover:text-red-400 transition-colors disabled:opacity-50"
                        >
                          {deletingId === review.id ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </div>
                    <p className="text-[var(--ip-text-2)] text-sm leading-relaxed line-clamp-3">{review.content}</p>
                    {review.helpfulCount > 0 && (
                      <div className="flex items-center gap-2 mt-3 text-xs text-[var(--ip-text-2)]">
                        <ThumbsUp size={12} />
                        <span>{review.helpfulCount} people found this helpful</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button disabled={pagination.page === 1} onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} className="px-3 py-1.5 text-sm text-[var(--ip-text-2)] disabled:opacity-50 hover:text-[var(--ip-text)] border border-[var(--ip-border)] rounded-lg">Prev</button>
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => i + Math.max(1, pagination.page - 2)).filter(p => p <= pagination.pages).map(p => (
              <button key={p} onClick={() => setPagination(prev => ({ ...prev, page: p }))} className={`px-3 py-1.5 text-sm rounded-lg ${p === pagination.page ? 'bg-blue-600 text-[var(--ip-text)]' : 'text-[var(--ip-text-2)] hover:text-[var(--ip-text)] border border-[var(--ip-border)]'}`}>{p}</button>
            ))}
            <button disabled={pagination.page === pagination.pages} onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} className="px-3 py-1.5 text-sm text-[var(--ip-text-2)] disabled:opacity-50 hover:text-[var(--ip-text)] border border-[var(--ip-border)] rounded-lg">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
