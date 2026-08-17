// app/reviews/[id]/DesktopReviewDetail.tsx - UPDATED WITH REGION DETECTION

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  ChevronLeft, ChevronRight, Paperclip, Globe
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import TrustScoreBadge from '@/components/ui/TrustScoreBadge';

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
  MU: { label: 'Mauritius', flag: '🇲🇺' },
  SC: { label: 'Seychelles', flag: '🇸🇨' },
  BVI: { label: 'BVI', flag: '🇻🇬' },
  NZ: { label: 'New Zealand', flag: '🇳🇿' },
  HK: { label: 'Hong Kong', flag: '🇭🇰' },
  IN: { label: 'India', flag: '🇮🇳' },
  BR: { label: 'Brazil', flag: '🇧🇷' },
  MX: { label: 'Mexico', flag: '🇲🇽' },
  NG: { label: 'Nigeria', flag: '🇳🇬' },
  GH: { label: 'Ghana', flag: '🇬🇭' },
  TZ: { label: 'Tanzania', flag: '🇹🇿' },
  ZW: { label: 'Zimbabwe', flag: '🇿🇼' },
  GLOBAL: { label: 'Global', flag: '🌍' },
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
  region: string; // Added region field
}

function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" };
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${sizes[size]} ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}`} />
      ))}
    </div>
  );
}

function RatingBar({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  const percentage = (value / 5) * 100;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <Icon size={12} className="text-zinc-500" />
          <span className="text-zinc-400">{label}</span>
        </div>
        <span className="text-white font-medium">{value.toFixed(1)}</span>
      </div>
      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

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

// Reply Thread Component - WITH OPTIMISTIC UPDATES AND USER PROP
function ReplyThread({ 
  reply, 
  depth = 0, 
  onReplySubmit, 
  reviewId,
  onUpdateReplyCount,
  onOpenLightbox,
  currentUser
}: { 
  reply: Reply; 
  depth?: number; 
  onReplySubmit: (reviewId: string, parentReplyId: string | null, content: string, mediaFiles: File[]) => Promise<{ success: boolean; reply?: any }>;
  reviewId: string;
  onUpdateReplyCount: (replyId: string, increment: number) => void;
  onOpenLightbox: (images: string[], index: number) => void;
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
  
  const replyLabel = isBrokerReply ? 'Broker Representative' : 
                     isPropFirmReply ? 'Prop Firm Representative' : 
                     isAdminReply ? 'Admin' : 'Trader';

  // Update local reply count when prop changes
  useEffect(() => {
    setLocalReplyCount(reply.replyCount);
  }, [reply.replyCount]);

  // Load child replies
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
    
    // Create optimistic reply object
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
    
    // Optimistically add to UI
    setChildReplies(prev => [...prev, optimisticReply]);
    setLocalReplyCount(prev => prev + 1);
    setShowReplies(true);
    setReplyContent('');
    setReplyMedia([]);
    setShowReplyForm(false);
    
    // Update parent reply count in main state
    onUpdateReplyCount(reply.id, 1);
    
    try {
      const result = await onReplySubmit(reviewId, reply.id, replyContent, replyMedia);
      if (result.success && result.reply) {
        // Replace optimistic reply with real one
        setChildReplies(prev => prev.map(r => r.id === optimisticReply.id ? result.reply : r));
      } else {
        // Remove optimistic reply on failure
        setChildReplies(prev => prev.filter(r => r.id !== optimisticReply.id));
        setLocalReplyCount(prev => prev - 1);
        onUpdateReplyCount(reply.id, -1);
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      // Remove optimistic reply on error
      setChildReplies(prev => prev.filter(r => r.id !== optimisticReply.id));
      setLocalReplyCount(prev => prev - 1);
      onUpdateReplyCount(reply.id, -1);
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async () => {
    try {
      const response = await fetch(`/api/reviews/${reply.id}/helpful`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ voteType: 'HELPFUL' })
      });
      if (response.ok) {
        setHelpful(true);
      }
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const removeFile = (index: number) => {
    setReplyMedia(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`relative ${depth > 0 ? 'ml-8 mt-3 pl-4 border-l-2 border-zinc-800' : 'mt-4'}`}>
      <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-800 hover:border-zinc-700 transition-all">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {reply.user?.avatar ? (
              <img src={reply.user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${replyColor} flex items-center justify-center text-white font-bold`}>
                {reply.user?.name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-medium text-white text-sm">{reply.user?.name || 'Anonymous'}</span>
              {isVerified && (
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-gradient-to-r ${replyColor} text-white`}>
                  {replyLabel}
                </span>
              )}
              <span className="text-xs text-zinc-500">{new Date(reply.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">{reply.content}</p>
            
            {/* Media Attachments */}
            {reply.mediaUrls && reply.mediaUrls.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {reply.mediaUrls.map((url, idx) => (
                  <div 
                    key={idx} 
                    className="relative w-20 h-20 rounded-lg overflow-hidden bg-zinc-800 cursor-pointer group"
                    onClick={() => onOpenLightbox(reply.mediaUrls, idx)}
                  >
                    {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img src={url} alt="Uploaded" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    ) : url.match(/\.(mp4|webm|mov)$/i) ? (
                      <video src={url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-700">
                        <Paperclip size={20} className="text-zinc-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye size={16} className="text-white" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-3 mt-3">
              {depth < maxDepth && (
                <button onClick={() => setShowReplyForm(!showReplyForm)} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-purple-400 transition-colors">
                  <Reply size={12} /> Reply
                </button>
              )}
              <button onClick={handleHelpful} className={`flex items-center gap-1 text-xs transition-colors ${helpful ? 'text-green-400' : 'text-zinc-500 hover:text-green-400'}`}>
                <ThumbsUp size={12} /> Helpful {reply.helpfulCount > 0 && `(${reply.helpfulCount})`}
              </button>
              {localReplyCount > 0 && (
                <button onClick={loadChildReplies} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-blue-400 transition-colors">
                  {showReplies ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  {localReplyCount} {localReplyCount === 1 ? 'reply' : 'replies'}
                </button>
              )}
            </div>
            
            {/* Reply Form with Media Upload */}
            {showReplyForm && (
              <div className="mt-3">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Reply to ${reply.user?.name || 'user'}...`}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  rows={2}
                />
                
                {/* Media Previews */}
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
                    <button
                      onClick={() => setShowReplyForm(false)}
                      className="px-3 py-1 rounded-lg bg-zinc-800 text-white text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitReply}
                      disabled={(!replyContent.trim() && replyMedia.length === 0) || submitting}
                      className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs disabled:opacity-50 flex items-center gap-1"
                    >
                      {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                      {submitting ? 'Sending...' : 'Reply'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Child Replies */}
      <AnimatePresence>
        {showReplies && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {loadingReplies ? (
              <div className="ml-8 mt-3 p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
              </div>
            ) : (
              childReplies.map((childReply) => (
                <ReplyThread
                  key={childReply.id}
                  reply={childReply}
                  depth={depth + 1}
                  onReplySubmit={onReplySubmit}
                  reviewId={reviewId}
                  onUpdateReplyCount={onUpdateReplyCount}
                  onOpenLightbox={onOpenLightbox}
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

// Top Level Reply Form
function TopLevelReplyForm({ reviewId, onSuccess, isPosting, setIsPosting, currentUser }: { 
  reviewId: string; 
  onSuccess: (optimisticReply?: any) => Promise<void>;
  isPosting: boolean;
  setIsPosting: (value: boolean) => void;
  currentUser: any;
}) {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setMediaFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

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
    if (isPosting) return;

    setIsPosting(true);
    setError('');

    // Create optimistic reply
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

    // Clear form immediately
    setContent('');
    setMediaFiles([]);
    
    // Pass optimistic reply to parent for immediate UI update
    await onSuccess(optimisticReply);

    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      mediaFiles.forEach(file => {
        formData.append('media', file);
      });

      const response = await fetch(`/api/reviews/${reviewId}/replies`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post reply');
      }
      
      // Refresh to get the real reply with correct ID
      await onSuccess();
    } catch (err: any) {
      setError(err.message);
      // Remove optimistic reply on error by refreshing
      await onSuccess();
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-zinc-800/30 rounded-xl border border-zinc-800">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your thoughts..."
        rows={3}
        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none text-sm"
      />
      
      {/* Media Previews */}
      {mediaFiles.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {mediaFiles.map((file, idx) => (
            <div key={idx} className="relative">
              <img src={URL.createObjectURL(file)} alt="" className="w-16 h-16 rounded-lg object-cover bg-zinc-800" />
              <button type="button" onClick={() => removeFile(idx)} className="absolute -top-1 -right-1 p-0.5 bg-red-500 rounded-full">
                <X size={10} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-center justify-between mt-3">
        <label className="cursor-pointer p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
          <ImageIcon size={16} />
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple accept="image/*,video/*" className="hidden" />
        </label>
        
        <button type="submit" disabled={isPosting || (!content.trim() && mediaFiles.length === 0)} className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2">
          {isPosting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          {isPosting ? 'Posting...' : 'Post Reply'}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </form>
  );
}

export default function DesktopReviewDetail() {
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isPosting, setIsPosting] = useState(false);

  // Get region info for display
  const regionInfo = REGION_DISPLAY[region] || REGION_DISPLAY['GLOBAL'];

  const fetchReviewData = useCallback(async () => {
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
  }, [reviewId]);

  useEffect(() => {
    if (reviewId) {
      fetchReviewData();
    }
  }, [reviewId, fetchReviewData]);

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

  const handleReplySubmit = async (reviewId: string, parentReplyId: string | null, content: string, mediaFiles: File[]): Promise<{ success: boolean; reply?: any }> => {
    if (!user) {
      router.push('/login');
      return { success: false };
    }
    
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (parentReplyId) {
        formData.append('parentReplyId', parentReplyId);
      }
      mediaFiles.forEach(file => {
        formData.append('media', file);
      });

      const response = await fetch(`/api/reviews/${reviewId}/replies`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, reply: data.reply };
      }
      
      return { success: false };
    } catch (error) {
      console.error('Error submitting reply:', error);
      return { success: false };
    }
  };

  // Update reply count for a specific parent
  const updateReplyCount = useCallback((replyId: string, increment: number) => {
    setReplies(prevReplies => 
      prevReplies.map(reply => 
        reply.id === replyId 
          ? { ...reply, replyCount: Math.max(0, reply.replyCount + increment) }
          : reply
      )
    );
    // Also update the review's total reply count
    if (review) {
      setReview(prev => prev ? { ...prev, replyCount: prev.replyCount + increment } : null);
    }
  }, [review]);

  // Handle top-level reply with optimistic update
  const onTopLevelReplySuccess = useCallback(async (optimisticReply?: any) => {
    if (optimisticReply) {
      // Add optimistic reply to UI immediately
      setReplies(prev => [...prev, optimisticReply]);
      if (review) {
        setReview(prev => prev ? { ...prev, replyCount: prev.replyCount + 1 } : null);
      }
      setShowReplyForm(false);
    } else {
      // Refresh to get real data
      const repliesRes = await fetch(`/api/reviews/${reviewId}/replies`, { credentials: 'include' });
      const repliesData = await repliesRes.json();
      if (repliesData.success) {
        setReplies(repliesData.replies);
      }
      const reviewRes = await fetch(`/api/reviews/${reviewId}`, { credentials: 'include' });
      const reviewData = await reviewRes.json();
      if (reviewRes.ok) {
        setReview(reviewData.review || reviewData);
      }
      setShowReplyForm(false);
    }
  }, [reviewId, review]);

  const handleOpenLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
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
    platformStability: 'Platform Stability',
    executionQuality: 'Execution Quality',
    withdrawalExperience: 'Withdrawal Experience',
    depositExperience: 'Deposit Experience',
    customerSupport: 'Customer Support',
    reliability: 'Reliability',
    value: 'Value'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-zinc-500">Loading review...</p>
        </div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Review Not Found</h1>
          <p className="text-zinc-400 mb-6">{error || 'The review you\'re looking for doesn\'t exist.'}</p>
          <button onClick={() => router.back()} className="px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-500">Go Back</button>
        </div>
      </div>
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

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* ❌ REGION BANNER REMOVED - Users select region in navbar */}

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Region Context Indicator - Subtle */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft size={18} /> Back
          </button>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Globe size={12} />
            <span>{regionInfo.flag} {regionInfo.label}</span>
          </div>
        </div>

        <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-zinc-800">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${review.entityType === 'broker' ? 'from-blue-500 to-purple-500' : 'from-purple-500 to-pink-500'} flex items-center justify-center text-white font-bold text-xl`}>
                  {review.entityName?.charAt(0) || '?'}
                </div>
                <div>
                  <Link href={`/${review.entityType === 'broker' ? 'brokers' : 'prop-firms'}/${review.entitySlug}`} className="text-white font-semibold hover:text-purple-400 transition-colors">
                    {review.entityName}
                  </Link>
                  <p className="text-xs text-zinc-500 capitalize">{review.entityType}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleShare} className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                  {copied ? <Check size={18} /> : <Share2 size={18} />}
                </button>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">{review.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 mb-4">
              <span className="flex items-center gap-1"><Clock size={14} /> {new Date(review.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><Users size={14} /> {review.helpfulCount} found helpful</span>
              <span className="flex items-center gap-1"><MessageCircle size={14} /> {review.replyCount} {review.replyCount === 1 ? 'reply' : 'replies'}</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <StarRating rating={review.rating} size="lg" />
              <span className="text-white font-bold">{review.rating}.0/5</span>
              {review.trustScore > 0 && <TrustScoreBadge score={review.trustScore} size="md" />}
              {review.isVerified && <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs flex items-center gap-1"><CheckCircle size={12} /> Verified Trader</span>}
              {review.wouldRecommend === 'Yes' && <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">Recommended</span>}
            </div>
            
            <p className="text-zinc-300 leading-relaxed">{review.content}</p>
          </div>
          
          <div className="p-6 border-b border-zinc-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Users size={14} /> Trader Profile</h3>
                <div className="grid grid-cols-2 gap-3">
                  {review.experienceLevel && <div><div className="text-xs text-zinc-500">Experience</div><div className="text-sm text-white">{review.experienceLevel}</div></div>}
                  {review.yearsTrading && <div><div className="text-xs text-zinc-500">Years Trading</div><div className="text-sm text-white">{review.yearsTrading}</div></div>}
                  {review.tradingStyle && <div><div className="text-xs text-zinc-500">Trading Style</div><div className="text-sm text-white">{review.tradingStyle}</div></div>}
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Shield size={14} /> Trust Signals</h3>
                <div className="grid grid-cols-2 gap-3">
                  {review.withdrawalSpeed && <div><div className="text-xs text-zinc-500">Withdrawal Speed</div><div className="text-sm text-white">{review.withdrawalSpeed}</div></div>}
                  {review.wouldRecommend && <div><div className="text-xs text-zinc-500">Recommendation</div><div className="text-sm text-green-400">{review.wouldRecommend}</div></div>}
                  {review.pros && <div><div className="text-xs text-zinc-500">Pros</div><div className="text-sm text-green-400">{review.pros}</div></div>}
                  {review.cons && <div><div className="text-xs text-zinc-500">Cons</div><div className="text-sm text-red-400">{review.cons}</div></div>}
                </div>
              </div>
            </div>
          </div>
          
          {totalRatings > 0 && (
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><BarChart3 size={14} /> Detailed Ratings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(ratingLabels).map(([key, label]) => {
                  const value = review[key as keyof Review] as number;
                  const Icon = ratingIcons[key as keyof typeof ratingIcons];
                  if (!value || value === 0) return null;
                  return <RatingBar key={key} label={label} value={value} icon={Icon} />;
                })}
              </div>
            </div>
          )}
          
          <div className="p-6 flex flex-wrap gap-3">
            <button onClick={handleHelpful} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${helpful ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>
              <ThumbsUp size={16} /> Helpful ({review.helpfulCount})
            </button>
            <button onClick={() => setShowReplyForm(!showReplyForm)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
              <MessageCircle size={16} /> Reply
            </button>
          </div>
        </div>
        
        {showReplyForm && (
          <TopLevelReplyForm 
            reviewId={reviewId} 
            onSuccess={onTopLevelReplySuccess}
            isPosting={isPosting}
            setIsPosting={setIsPosting}
            currentUser={user}
          />
        )}
        
        {replies.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageCircle size={18} /> {review.replyCount} {review.replyCount === 1 ? 'Reply' : 'Replies'}
            </h2>
            <div className="space-y-2">
              {replies.map((reply) => (
                <ReplyThread
                  key={reply.id}
                  reply={reply}
                  onReplySubmit={handleReplySubmit}
                  reviewId={reviewId}
                  onUpdateReplyCount={updateReplyCount}
                  onOpenLightbox={handleOpenLightbox}
                  currentUser={user}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <LightboxModal
            images={lightboxImages}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}