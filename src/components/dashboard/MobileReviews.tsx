// components/dashboard/MobileReviews.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Star, Building2, Clock, CheckCircle, 
  XCircle, Eye, Trash2, AlertCircle, Search, Filter
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
  ];
  const index = (name?.length || 0) % gradients.length;
  return gradients[index];
};

export default function MobileMyReviews() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchReviews();
    }
  }, [user, isLoading, statusFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/user/reviews?${params}`, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { text: 'Approved', color: 'text-green-400', bg: 'bg-green-500/20', icon: CheckCircle };
      case 'REJECTED':
        return { text: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/20', icon: XCircle };
      default:
        return { text: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: Clock };
    }
  };

  if (isLoading || loading) {
    return (
      <MobileLayout title="My Reviews" showSearch={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" />
        </div>
      </MobileLayout>
    );
  }

  const approvedCount = reviews.filter(r => r.status === 'APPROVED').length;
  const pendingCount = reviews.filter(r => r.status === 'PENDING').length;

  return (
    <MobileLayout title="My Reviews" showSearch={false}>
      <div className="space-y-4 pb-6">
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-500/10 rounded-xl p-3 border border-green-500/20 text-center">
            <div className="text-green-400 font-bold text-xl">{approvedCount}</div>
            <div className="text-[10px] text-zinc-500">Approved</div>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-3 border border-yellow-500/20 text-center">
            <div className="text-yellow-400 font-bold text-xl">{pendingCount}</div>
            <div className="text-[10px] text-zinc-500">Pending</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Reviews</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/30 rounded-xl border border-zinc-800">
            <Star size={32} className="text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No reviews yet</p>
            <Link href="/reviews" className="text-purple-400 text-xs mt-2 inline-block">Write your first review →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => {
              const statusBadge = getStatusBadge(review.status);
              const StatusIcon = statusBadge.icon;
              const entityName = review.entityName || review.broker?.name || review.propFirm?.name || 'Unknown';
              
              return (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${generateGradient(entityName)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {entityName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-white font-semibold text-sm truncate">{entityName}</h3>
                          <div className="flex items-center gap-1 mt-0.5">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} className={`w-3 h-3 ${i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-700'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${statusBadge.bg}`}>
                          <StatusIcon size={10} className={statusBadge.color} />
                          <span className={`text-[10px] ${statusBadge.color}`}>{statusBadge.text}</span>
                        </div>
                      </div>
                      <p className="text-zinc-400 text-xs mt-2 line-clamp-2">{review.comment}</p>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-500 mt-2">
                        <span className="flex items-center gap-1"><Clock size={8} /> {new Date(review.createdAt).toLocaleDateString()}</span>
                        <Link href={`/reviews/${review.id}`} className="text-purple-400 flex items-center gap-1"><Eye size={8} /> View</Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}