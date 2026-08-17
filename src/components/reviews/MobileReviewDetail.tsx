// components/reviews/MobileReviewDetail.tsx - COMPLETE WITH REGION AWARENESS

'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRegion } from '@/contexts/RegionContext';
import { 
  Star, ArrowLeft, MessageCircle, ThumbsUp, Share2, Copy, Check,
  Flag, Eye, Clock, Users, Shield, AlertTriangle, CheckCircle,
  Image as ImageIcon, X, Send, ChevronDown,
  ChevronUp, Reply, Building2, Award, Zap, Wallet, CreditCard, 
  Headphones, DollarSign, BarChart3, Activity, Loader2,
  ChevronLeft, ChevronRight, Paperclip, ThumbsDown, Globe
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import TrustScoreBadge from '@/components/ui/TrustScoreBadge';
import MobileLayout from '@/components/mobile/MobileLayout';

// Region display info
const REGION_DISPLAY: Record<string, { label: string; flag: string }> = {
  SA: { label: 'South Africa', flag: '🇿🇦' },
  EU: { label: 'Europe', flag: '🇪🇺' },
  UK: { label: 'United Kingdom', flag: '🇬🇧' },
  UAE: { label: 'UAE', flag: '🇦🇪' },
  KE: { label: 'Kenya', flag: '🇰🇪' },
  AU: { label: 'Australia', flag: '🇦🇺' },
  SG: { label: 'Singapore', flag: '🇸🇬' },
  US: { label: 'United States', flag: '🇺🇸' },
  CA: { label: 'Canada', flag: '🇨🇦' },
  GLOBAL: { label: 'Global', flag: '🌍' },
};

// ============ LOGO COMPONENT ============
function FirmLogo({ item, size = "md" }: { item: any; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-10 h-10 rounded-xl text-sm",
    md: "w-12 h-12 rounded-xl text-base",
    lg: "w-14 h-14 rounded-xl text-lg"
  };
  
  if (item.logo) {
    return (
      <div className={`${sizeClasses[size]} overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0 shadow-lg`}>
        <img 
          src={item.logo} 
          alt={item.name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const fallback = document.createElement('div');
              fallback.className = `${sizeClasses[size]} bg-gradient-to-r ${generateGradient(item.name)} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`;
              fallback.textContent = item.name?.charAt(0) || '?';
              parent.appendChild(fallback);
            }
          }}
        />
      </div>
    );
  }
  
  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-r ${generateGradient(item.name)} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`}>
      {item.name?.charAt(0) || '?'}
    </div>
  );
}

// ============ GRADIENT GENERATOR ============
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

// Types
interface Reply {
  id: string;
  content: string;
  mediaUrls: string[];
  replyType: 'USER' | 'BROKER' | 'PROP_FIRM' | 'ADMIN';
  replyCount: number;
  createdAt: string;
  user: { id: string; name: string; avatar: string | null; role: string };
  broker: { id: number; name: string; logo: string } | null;
  propFirm: { id: number; name: string; logo: string } | null;
  parentReplyId: string | null;
  helpfulCount: number;
}

interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  trustScore: number;
  experienceLevel: string;
  yearsTrading: string;
  tradingStyle: string;
  tradingEnvironment: string;
  platformStability: number;
  executionQuality: number;
  withdrawalExperience: number;
  depositExperience: number;
  customerSupport: number;
  reliability: number;
  value: number;
  withdrawalSpeed: string;
  accountIssues: string;
  wouldRecommend: string;
  pros: string;
  cons: string;
  isVerified: boolean;
  helpfulCount: number;
  replyCount: number;
  createdAt: string;
  user: { id: string; name: string; avatar: string | null };
  entityId: number;
  entityName: string;
  entityType: 'broker' | 'propFirm';
  entitySlug: string;
  entityLogo?: string;
  entityRegions?: string[];
}

// Star Rating Component - Mobile Optimized
function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-3 h-3", md: "w-4 h-4", lg: "w-5 h-5" };
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${sizes[size]} ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}`} />
      ))}
    </div>
  );
}

// Rating Bar Component - Mobile Optimized
function RatingBar({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  const percentage = (value / 5) * 100;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <Icon size={10} className="text-zinc-500" />
          <span className="text-zinc-400">{label}</span>
        </div>
        <span className="text-white font-medium text-xs">{value.toFixed(1)}</span>
      </div>
      <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

// Lightbox Modal
function LightboxModal({ images, initialIndex, onClose }: { images: string[]; initialIndex: number; onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrentIndex(prev => Math.max(0, prev - 1));
      if (e.key === 'ArrowRight') setCurrentIndex(prev => Math.min(images.length - 1, prev + 1));
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [images.length, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-lg flex items-center justify-center"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10">
        <X size={24} className="text-white" />
      </button>
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => Math.max(0, prev - 1)); }} className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50" disabled={currentIndex === 0}>
            <ChevronLeft size={24} className="text-white" />
          </button>
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
      <motion.div key={currentIndex} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        {images[currentIndex].match(/\.(mp4|webm|mov)$/i) ? (
          <video src={images[currentIndex]} controls autoPlay className="max-w-full max-h-[90vh] rounded-lg" />
        ) : (
          <img src={images[currentIndex]} alt="Full size view" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
        )}
      </motion.div>
      {images.length > 1 && (
        <button onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => Math.min(images.length - 1, prev + 1)); }} className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50" disabled={currentIndex === images.length - 1}>
          <ChevronRight size={24} className="text-white" />
        </button>
      )}
    </motion.div>
  );
}

// Reply Component - Mobile Optimized with Optimistic Updates
function ReplyItem({ reply, depth = 0, onReply, onHelpful, reviewId, currentUser }: { 
  reply: Reply; 
  depth?: number; 
  onReply: (replyId: string, content: string, mediaFiles: File[]) => Promise<boolean>;
  onHelpful: (replyId: string) => void;
  reviewId: string;
  currentUser: any;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyMedia, setReplyMedia] = useState<File[]>([]);
  const [childReplies, setChildReplies] = useState<Reply[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [helpful, setHelpful] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localReplyCount, setLocalReplyCount] = useState(reply.replyCount);
  const maxDepth = 3;

  const isBrokerReply = reply.replyType === 'BROKER';
  const isPropFirmReply = reply.replyType === 'PROP_FIRM';
  const isAdminReply = reply.replyType === 'ADMIN';
  const isVerified = isBrokerReply || isPropFirmReply || isAdminReply;
  
  const replyColor = isBrokerReply ? 'from-blue-500 to-cyan-500' : 
                     isPropFirmReply ? 'from-purple-500 to-pink-500' : 
                     isAdminReply ? 'from-red-500 to-orange-500' : 'from-zinc-600 to-zinc-500';
  
  const replyLabel = isBrokerReply ? 'Broker' : 
                     isPropFirmReply ? 'Prop Firm' : 
                     isAdminReply ? 'Admin' : 'Trader';
  
  const ReplyIconComponent = isBrokerReply ? Building2 : 
                             isPropFirmReply ? Award : 
                             isAdminReply ? Shield : MessageCircle;

  useEffect(() => {
    setLocalReplyCount(reply.replyCount);
  }, [reply.replyCount]);

  const loadChildReplies = async () => {
    if (childReplies.length > 0 && showReplies) {
      setShowReplies(false);
      return;
    }
    
    setLoadingReplies(true);
    try {
      const response = await fetch(`/api/reviews/${reviewId}/replies?parentId=${reply.id}`, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setChildReplies(data.replies);
        setShowReplies(true);
      }
    } catch (error) {
      console.error('Error loading replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim() && replyMedia.length === 0) return;
    if (submitting) return;
    
    setSubmitting(true);
    
    const optimisticReply: Reply = {
      id: `temp-${Date.now()}`,
      content: replyContent,
      mediaUrls: replyMedia.map(file => URL.createObjectURL(file)),
      replyType: 'USER',
      replyCount: 0,
      createdAt: new Date().toISOString(),
      user: {
        id: currentUser?.id || 'temp',
        name: currentUser?.name || 'You',
        avatar: null,
        role: 'USER'
      },
      broker: null,
      propFirm: null,
      parentReplyId: reply.id,
      helpfulCount: 0
    };
    
    setChildReplies(prev => [...prev, optimisticReply]);
    setLocalReplyCount(prev => prev + 1);
    setShowReplies(true);
    setReplyContent('');
    setReplyMedia([]);
    setShowReplyForm(false);
    
    try {
      const success = await onReply(reply.id, replyContent, replyMedia);
      if (success) {
        const response = await fetch(`/api/reviews/${reviewId}/replies?parentId=${reply.id}`, { credentials: 'include' });
        const data = await response.json();
        if (data.success) {
          setChildReplies(data.replies);
          setLocalReplyCount(data.replies.length);
        }
      } else {
        setChildReplies(prev => prev.filter(r => r.id !== optimisticReply.id));
        setLocalReplyCount(prev => prev - 1);
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      setChildReplies(prev => prev.filter(r => r.id !== optimisticReply.id));
      setLocalReplyCount(prev => prev - 1);
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpfulClick = () => {
    setHelpful(true);
    onHelpful(reply.id);
  };

  const removeFile = (index: number) => {
    setReplyMedia(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`relative ${depth > 0 ? 'ml-6 mt-3 pl-3 border-l-2 border-zinc-800' : 'mt-3'}`}>
      <div className="bg-zinc-800/30 rounded-xl p-3 border border-zinc-800">
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0">
            {reply.user?.avatar ? (
              <img src={reply.user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${replyColor} flex items-center justify-center text-white font-bold text-xs`}>
                {reply.user?.name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
              <span className="font-medium text-white text-xs">{reply.user?.name || 'Anonymous'}</span>
              {isVerified && (
                <span className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[8px] font-medium bg-gradient-to-r ${replyColor} text-white`}>
                  <ReplyIconComponent size={6} />
                  {replyLabel}
                </span>
              )}
              <span className="text-[10px] text-zinc-500">{new Date(reply.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-zinc-300 text-xs leading-relaxed">{reply.content}</p>
            
            {reply.mediaUrls && reply.mediaUrls.length > 0 && (
              <div className="flex gap-1.5 mt-2">
                {reply.mediaUrls.slice(0, 3).map((url, idx) => (
                  <img key={idx} src={url} alt="" className="w-12 h-12 rounded-lg object-cover bg-zinc-800" />
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-3 mt-2">
              {depth < maxDepth && (
                <button onClick={() => setShowReplyForm(!showReplyForm)} className="flex items-center gap-0.5 text-[10px] text-zinc-500 hover:text-purple-400">
                  <Reply size={10} /> Reply
                </button>
              )}
              <button onClick={handleHelpfulClick} className={`flex items-center gap-0.5 text-[10px] ${helpful ? 'text-green-400' : 'text-zinc-500 hover:text-green-400'}`}>
                <ThumbsUp size={10} /> {reply.helpfulCount > 0 && `(${reply.helpfulCount})`}
              </button>
              {localReplyCount > 0 && (
                <button onClick={loadChildReplies} className="flex items-center gap-0.5 text-[10px] text-zinc-500 hover:text-blue-400">
                  {showReplies ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                  {localReplyCount}
                </button>
              )}
            </div>
            
            {showReplyForm && (
              <div className="mt-3">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Reply to ${reply.user?.name || 'user'}...`}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  rows={2}
                />
                {replyMedia.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {replyMedia.map((file, idx) => (
                      <div key={idx} className="relative">
                        <img src={URL.createObjectURL(file)} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        <button onClick={() => removeFile(idx)} className="absolute -top-1 -right-1 p-0.5 bg-red-500 rounded-full">
                          <X size={10} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between items-center mt-2">
                  <label className="cursor-pointer p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors">
                    <ImageIcon size={14} className="text-zinc-400" />
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*,video/*" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files) setReplyMedia(Array.from(e.target.files));
                      }} 
                    />
                  </label>
                  <div className="flex gap-2">
                    <button onClick={() => setShowReplyForm(false)} className="px-3 py-1 rounded-lg bg-zinc-700 text-white text-xs">Cancel</button>
                    <button
                      onClick={handleSubmitReply}
                      disabled={(!replyContent.trim() && replyMedia.length === 0) || submitting}
                      className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs disabled:opacity-50 flex items-center gap-1"
                    >
                      {submitting ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
                      {submitting ? 'Sending...' : 'Reply'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {showReplies && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {loadingReplies ? (
              <div className="ml-6 mt-2 p-3 text-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500 mx-auto"></div>
              </div>
            ) : (
              childReplies.map((childReply) => (
                <ReplyItem
                  key={childReply.id}
                  reply={childReply}
                  depth={depth + 1}
                  onReply={onReply}
                  onHelpful={onHelpful}
                  reviewId={reviewId}
                  currentUser={currentUser}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Main Reply Form Component
function MainReplyForm({ reviewId, onSuccess, onCancel, currentUser }: { 
  reviewId: string; 
  onSuccess: (optimisticReply?: any) => Promise<void>;
  onCancel: () => void;
  currentUser: any;
}) {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Please login to reply');
      return;
    }
    if (!content.trim() && mediaFiles.length === 0) {
      setError('Please enter a reply or add media');
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    setError('');

    const optimisticReply = {
      id: `temp-${Date.now()}`,
      content: content.trim(),
      mediaUrls: mediaFiles.map(file => URL.createObjectURL(file)),
      replyType: 'USER',
      replyCount: 0,
      createdAt: new Date().toISOString(),
      user: {
        id: currentUser.id,
        name: currentUser.name || 'You',
        avatar: null,
        role: currentUser.role || 'USER'
      },
      broker: null,
      propFirm: null,
      parentReplyId: null,
      helpfulCount: 0
    };

    setContent('');
    setMediaFiles([]);
    await onSuccess(optimisticReply);

    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      mediaFiles.forEach(file => formData.append('media', file));

      const response = await fetch(`/api/reviews/${reviewId}/replies`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to post reply');
      }
      
      await onSuccess();
    } catch (err: any) {
      setError(err.message);
      await onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 p-3 bg-zinc-800/30 rounded-xl border border-zinc-800">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your thoughts..."
        rows={2}
        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none text-xs"
      />
      
      {mediaFiles.length > 0 && (
        <div className="flex gap-1.5 mt-2">
          {mediaFiles.map((file, idx) => (
            <div key={idx} className="relative">
              <img src={URL.createObjectURL(file)} alt="" className="w-10 h-10 rounded-lg object-cover bg-zinc-800" />
              <button type="button" onClick={() => setMediaFiles(prev => prev.filter((_, i) => i !== idx))} className="absolute -top-1 -right-1 p-0.5 bg-red-500 rounded-full">
                <X size={8} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-center justify-between mt-2">
        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400">
          <ImageIcon size={12} />
        </button>
        <input type="file" ref={fileInputRef} onChange={(e) => {
          if (e.target.files) setMediaFiles(prev => [...prev, ...Array.from(e.target.files)]);
        }} multiple accept="image/*,video/*" className="hidden" />
        
        <div className="flex gap-1.5">
          <button type="button" onClick={onCancel} className="px-2 py-1 rounded-lg bg-zinc-800 text-white text-[10px]">Cancel</button>
          <button type="submit" disabled={submitting || (!content.trim() && mediaFiles.length === 0)} className="px-2 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-medium disabled:opacity-50 flex items-center gap-1">
            {submitting ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
            Post
          </button>
        </div>
      </div>
      {error && <p className="text-red-400 text-[10px] mt-1.5">{error}</p>}
    </form>
  );
}

// Main Mobile Component
export default function MobileReviewDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { region } = useRegion(); // ✅ ADDED REGION
  const reviewId = params.id as string;
  
  const [review, setReview] = useState<Review | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [helpful, setHelpful] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Get region info for display
  const regionInfo = REGION_DISPLAY[region] || REGION_DISPLAY['GLOBAL'];

  const fetchReviewData = async () => {
    try {
      const [reviewRes, repliesRes] = await Promise.all([
        fetch(`/api/reviews/${reviewId}`, { credentials: 'include' }),
        fetch(`/api/reviews/${reviewId}/replies`, { credentials: 'include' })
      ]);
      
      if (!reviewRes.ok) throw new Error('Review not found');
      const reviewData = await reviewRes.json();
      setReview(reviewData.review || reviewData);
      
      const repliesData = await repliesRes.json();
      if (repliesData.success) {
        setReplies(repliesData.replies);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reviewId) {
      fetchReviewData();
    }
  }, [reviewId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHelpful = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ voteType: 'HELPFUL' })
      });
      if (response.ok) {
        setHelpful(true);
        setReview(prev => prev ? { ...prev, helpfulCount: prev.helpfulCount + 1 } : null);
      }
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const handleReplySubmit = async (parentId: string | null, content: string, mediaFiles: File[]): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (parentId) formData.append('parentReplyId', parentId);
      mediaFiles.forEach(file => formData.append('media', file));

      const response = await fetch(`/api/reviews/${reviewId}/replies`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      return response.ok;
    } catch (error) {
      console.error('Error submitting reply:', error);
      return false;
    }
  };

  const handleReplyHelpful = async (replyId: string) => {
    try {
      await fetch(`/api/reviews/${replyId}/helpful`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ voteType: 'HELPFUL' })
      });
    } catch (error) {
      console.error('Error marking reply helpful:', error);
    }
  };

  const onMainReplySuccess = async (optimisticReply?: any) => {
    if (optimisticReply) {
      setReplies(prev => [...prev, optimisticReply]);
      if (review) setReview(prev => prev ? { ...prev, replyCount: prev.replyCount + 1 } : null);
      setShowReplyForm(false);
    } else {
      await fetchReviewData();
      setShowReplyForm(false);
    }
  };

  const ratingIcons = {
    platformStability: Activity,
    executionQuality: Zap,
    withdrawalExperience: Wallet,
    depositExperience: CreditCard,
    customerSupport: Headphones,
    reliability: Shield,
    value: DollarSign
  };

  const ratingLabels = {
    platformStability: 'Platform',
    executionQuality: 'Execution',
    withdrawalExperience: 'Withdrawal',
    depositExperience: 'Deposit',
    customerSupport: 'Support',
    reliability: 'Reliability',
    value: 'Value'
  };

  if (loading) {
    return (
      <MobileLayout title="Review" showSearch={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" />
            <p className="text-xs text-zinc-500 mt-3">Loading review...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (error || !review) {
    return (
      <MobileLayout title="Review" showSearch={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertTriangle size={32} className="text-red-500 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">{error || 'Review not found'}</p>
            <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-purple-600 rounded-lg text-white text-sm">Go Back</button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  const totalRatings = [
    review.platformStability,
    review.executionQuality,
    review.withdrawalExperience,
    review.depositExperience,
    review.customerSupport,
    review.reliability,
    review.value
  ].filter(r => r && r > 0).length;

  const contentPreview = review.content.length > 200 && !showFullContent 
    ? review.content.slice(0, 200) + '...' 
    : review.content;

  // Build firm data for logo
  const firmData = {
    name: review.entityName,
    logo: review.entityLogo || null
  };

  return (
    <MobileLayout title="Review Detail" showSearch={false}>
      {/* ❌ REGION BANNER REMOVED - Users select region in navbar */}

      <div className="space-y-4 pb-6">
        
        {/* Region Context - Subtle */}
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white">
            <ArrowLeft size={14} /> Back
          </button>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
            <Globe size={10} />
            <span>{regionInfo.flag} {regionInfo.label}</span>
          </div>
        </div>

        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-start justify-between gap-3 mb-3">
              <Link href={`/${review.entityType === 'broker' ? 'brokers' : 'prop-firms'}/${review.entitySlug}`} className="flex items-center gap-3">
                <FirmLogo item={firmData} size="sm" />
                <div>
                  <p className="text-white font-semibold text-sm">{review.entityName}</p>
                  <p className="text-[10px] text-zinc-500 capitalize">{review.entityType}</p>
                </div>
              </Link>
              <button onClick={handleShare} className="p-2 rounded-lg bg-zinc-800">
                {copied ? <Check size={14} className="text-green-400" /> : <Share2 size={14} className="text-zinc-400" />}
              </button>
            </div>
            
            <h2 className="text-lg font-bold text-white mb-2">{review.title}</h2>
            
            <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-500 mb-3">
              <span className="flex items-center gap-0.5"><Clock size={10} /> {new Date(review.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center gap-0.5"><ThumbsUp size={10} /> {review.helpfulCount}</span>
              <span className="flex items-center gap-0.5"><MessageCircle size={10} /> {review.replyCount}</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <StarRating rating={review.rating} size="md" />
              <span className="text-white font-bold text-sm">{review.rating}.0</span>
              {review.trustScore > 0 && <TrustScoreBadge score={review.trustScore} size="sm" />}
            </div>
            
            <div className="flex flex-wrap gap-1.5 mb-3">
              {review.isVerified && (
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-[9px] flex items-center gap-0.5">
                  <CheckCircle size={8} /> Verified
                </span>
              )}
              {review.wouldRecommend === 'Yes' && (
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-[9px]">Recommended</span>
              )}
            </div>
            
            <p className="text-zinc-300 text-xs leading-relaxed">
              {contentPreview}
              {review.content.length > 200 && (
                <button onClick={() => setShowFullContent(!showFullContent)} className="text-purple-400 ml-1 text-xs">
                  {showFullContent ? 'Show less' : 'Read more'}
                </button>
              )}
            </p>
          </div>
          
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <Users size={12} className="text-purple-400" />
              <h3 className="text-xs font-semibold text-white">Trader Info</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {review.experienceLevel && <div><span className="text-zinc-500">Level:</span> <span className="text-white">{review.experienceLevel}</span></div>}
              {review.yearsTrading && <div><span className="text-zinc-500">Years:</span> <span className="text-white">{review.yearsTrading}</span></div>}
              {review.tradingStyle && <div><span className="text-zinc-500">Style:</span> <span className="text-white">{review.tradingStyle}</span></div>}
              {review.withdrawalSpeed && <div><span className="text-zinc-500">Withdrawal:</span> <span className="text-white">{review.withdrawalSpeed}</span></div>}
            </div>
          </div>
          
          {(review.pros || review.cons) && (
            <div className="p-4 border-b border-zinc-800">
              <div className="grid grid-cols-2 gap-3">
                {review.pros && (
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <ThumbsUp size={10} className="text-green-400" />
                      <span className="text-[10px] text-zinc-500">Pros</span>
                    </div>
                    <p className="text-green-400 text-xs">{review.pros}</p>
                  </div>
                )}
                {review.cons && (
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <ThumbsDown size={10} className="text-red-400" />
                      <span className="text-[10px] text-zinc-500">Cons</span>
                    </div>
                    <p className="text-red-400 text-xs">{review.cons}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {totalRatings > 0 && (
            <div className="p-4 border-b border-zinc-800">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={12} className="text-purple-400" />
                <h3 className="text-xs font-semibold text-white">Ratings</h3>
              </div>
              <div className="space-y-2">
                {Object.entries(ratingLabels).map(([key, label]) => {
                  const value = review[key as keyof Review] as number;
                  const Icon = ratingIcons[key as keyof typeof ratingIcons];
                  if (!value || value === 0) return null;
                  return <RatingBar key={key} label={label} value={value} icon={Icon} />;
                })}
              </div>
            </div>
          )}
          
          <div className="p-4 flex gap-3">
            <button onClick={handleHelpful} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${helpful ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-zinc-800 text-zinc-400'}`}>
              <ThumbsUp size={12} /> Helpful ({review.helpfulCount})
            </button>
            <button onClick={() => setShowReplyForm(!showReplyForm)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-medium">
              <MessageCircle size={12} /> Reply
            </button>
          </div>
        </div>
        
        {showReplyForm && (
          <MainReplyForm 
            reviewId={reviewId}
            onSuccess={onMainReplySuccess}
            onCancel={() => setShowReplyForm(false)}
            currentUser={user}
          />
        )}
        
        {replies.length > 0 && (
          <div className="mt-2">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
              <MessageCircle size={12} /> {review.replyCount} {review.replyCount === 1 ? 'Reply' : 'Replies'}
            </h3>
            <div className="space-y-1">
              {replies.map((reply) => (
                <ReplyItem
                  key={reply.id}
                  reply={reply}
                  onReply={handleReplySubmit}
                  onHelpful={handleReplyHelpful}
                  reviewId={reviewId}
                  currentUser={user}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <LightboxModal
            images={lightboxImages}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
    </MobileLayout>
  );
}