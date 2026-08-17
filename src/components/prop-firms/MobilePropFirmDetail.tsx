// components/prop-firms/MobilePropFirmDetail.tsx
'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { slugify } from "@/lib/slugify";
import { formatCurrency } from "@/utils/api-helpers";
import TrustScoreBadge from "@/components/ui/TrustScoreBadge";
import MobileLayout from "@/components/mobile/MobileLayout";
import { 
  Star, ArrowLeft, ExternalLink, Share2, Bookmark, 
  Gift, Rocket, Shield, Clock, Globe, AlertTriangle,
  DollarSign, TrendingUp, Target, Users, Monitor,
  ShieldCheck, Wallet, Headphones, MessageSquare,
  AlertOctagon, CheckCircle, X, Copy, ThumbsUp,
  Flag, SendIcon, Lock, Plus, Eye, Scale,
  Calendar as CalendarIcon, Activity, XCircle, Smartphone,
  BadgeCheck, Award, BarChart3, Trophy, TrendingDown,
  Zap, CircleDollarSign, Building, User, Twitter, Facebook,
  Youtube, Instagram, Linkedin, MessageCircle, Sparkle,
  ArrowRight as ArrowRightIcon, Crown, Gem, Info,
  ThumbsDown as ThumbsDownIcon, ImagePlus, Reply, ChevronLeft, ChevronRight, Loader2, Send
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

// ===================== LIGHTBOX MODAL =====================
function LightboxModal({ images, initialIndex, onClose }: { 
  images: string[]; 
  initialIndex: number; 
  onClose: () => void;
}) {
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
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
      >
        <X size={24} className="text-white" />
      </button>
      
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => Math.max(0, prev - 1)); }}
            className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
      
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {images[currentIndex]?.match(/\.(mp4|webm|mov)$/i) ? (
          <video src={images[currentIndex]} controls autoPlay className="max-w-full max-h-[90vh] rounded-lg" />
        ) : (
          <img 
            src={images[currentIndex]} 
            alt="Full size view" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        )}
      </motion.div>
      
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => Math.min(images.length - 1, prev + 1)); }}
          className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
          disabled={currentIndex === images.length - 1}
        >
          <ChevronRight size={24} className="text-white" />
        </button>
      )}
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black/50 px-3 py-1 rounded-full">
        Click outside to close
      </div>
    </motion.div>
  );
}

// ===================== REPLY THREAD COMPONENT =====================
function ReplyThread({ reply, onReply, onLoadChildReplies, onOpenLightbox, depth = 0, currentUser }: { 
  reply: any; 
  onReply: (parentId: string, content: string, mediaFiles: File[]) => Promise<boolean>;
  onLoadChildReplies: (replyId: string) => Promise<any[]>;
  onOpenLightbox: (images: string[], index: number) => void;
  depth?: number;
  currentUser: any;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyMedia, setReplyMedia] = useState<File[]>([]);
  const [childReplies, setChildReplies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const maxDepth = 3;

  const handleToggleExpand = async () => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }
    
    setIsExpanded(true);
    
    if (!hasLoaded && reply.replyCount > 0) {
      setIsLoading(true);
      const children = await onLoadChildReplies(reply.id);
      setChildReplies(children);
      setHasLoaded(true);
      setIsLoading(false);
    }
  };

  const handleSubmitReply = async () => {
    if ((!replyContent.trim() && replyMedia.length === 0) || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const success = await onReply(reply.id, replyContent, replyMedia);
      
      if (success) {
        setReplyContent('');
        setReplyMedia([]);
        setShowReplyForm(false);
        
        setTimeout(async () => {
          setIsLoading(true);
          const children = await onLoadChildReplies(reply.id);
          setChildReplies(children);
          setHasLoaded(true);
          setIsExpanded(true);
          setIsLoading(false);
        }, 500);
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getReplyTypeStyles = () => {
    switch (reply.replyType) {
      case 'BROKER':
        return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', label: 'Official Broker Response' };
      case 'PROP_FIRM':
        return { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', label: 'Official Prop Firm Response' };
      case 'ADMIN':
        return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', label: 'Admin Response' };
      default:
        return { bg: 'bg-zinc-800/50', border: 'border-zinc-700', text: 'text-zinc-400', label: 'User Comment' };
    }
  };

  const styles = getReplyTypeStyles();

  const removeFile = (index: number) => {
    setReplyMedia(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`${depth > 0 ? 'ml-6 mt-3' : 'mt-3'}`}>
      <div className={`p-3 rounded-xl ${styles.bg} border ${styles.border}`}>
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${generateGradient(reply.user?.name || reply.propFirm?.name || 'Reply')} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
            {(reply.user?.name?.charAt(0) || reply.propFirm?.name?.charAt(0) || 'U').toUpperCase()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-white text-sm">
                {reply.user?.name || reply.propFirm?.name || 'Anonymous'}
              </span>
              {reply.replyType !== 'USER' && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${styles.text} ${styles.bg} border ${styles.border}`}>
                  {styles.label}
                </span>
              )}
              <span className="text-xs text-zinc-500">
                {new Date(reply.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-zinc-300 text-sm mt-1 break-words">{reply.content}</p>
            
            {reply.mediaUrls && reply.mediaUrls.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {reply.mediaUrls.map((url: string, idx: number) => (
                  <div 
                    key={idx} 
                    className="relative w-16 h-16 rounded-lg overflow-hidden bg-zinc-800 cursor-pointer group"
                    onClick={() => onOpenLightbox(reply.mediaUrls, idx)}
                  >
                    <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye size={14} className="text-white" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-3 mt-2">
              {depth < maxDepth && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-xs text-zinc-500 hover:text-purple-400 transition-colors flex items-center gap-1"
                >
                  <Reply size={10} /> Reply
                </button>
              )}
              {reply.replyCount > 0 && (
                <button
                  onClick={handleToggleExpand}
                  className="text-xs text-zinc-500 hover:text-purple-400 transition-colors flex items-center gap-1"
                >
                  <MessageCircle size={10} />
                  {isExpanded ? 'Hide' : `View ${reply.replyCount} ${reply.replyCount === 1 ? 'reply' : 'replies'}`}
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
                    <ImagePlus size={14} className="text-zinc-400" />
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
                      className="px-3 py-1 rounded-lg bg-zinc-700 text-white text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitReply}
                      disabled={(!replyContent.trim() && replyMedia.length === 0) || isSubmitting}
                      className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs disabled:opacity-50 flex items-center gap-1"
                    >
                      {isSubmitting ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
                      {isSubmitting ? 'Sending...' : 'Reply'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-2">
          {isLoading ? (
            <div className="ml-6 mt-3 p-4 text-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500 mx-auto"></div>
            </div>
          ) : (
            childReplies.map((childReply) => (
              <ReplyThread
                key={childReply.id}
                reply={childReply}
                onReply={onReply}
                onLoadChildReplies={onLoadChildReplies}
                onOpenLightbox={onOpenLightbox}
                depth={depth + 1}
                currentUser={currentUser}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Helper functions
const getAllAccountOptions = (firm: any) => {
  if (!firm?.programs) return [];
  return firm.programs.flatMap((program: any) => program.accountOptions || []);
};

const getMaxPayout = (firm: any) => {
  const options = getAllAccountOptions(firm);
  if (options.length === 0) return 80;
  return Math.max(...options.map((acc: any) => acc.payoutPercentage || acc.payout || 80));
};

const getMinPrice = (firm: any) => {
  const options = getAllAccountOptions(firm);
  if (options.length === 0) return 99;
  return Math.min(...options.map((acc: any) => acc.price || 0));
};

const getMinAccountSize = (firm: any) => {
  const options = getAllAccountOptions(firm);
  if (options.length === 0) return 5000;
  return Math.min(...options.map((acc: any) => acc.accountSize || 0));
};

const getMaxAccountSize = (firm: any) => {
  const options = getAllAccountOptions(firm);
  if (options.length === 0) return 100000;
  return Math.max(...options.map((acc: any) => acc.accountSize || 0));
};

const formatProfitTarget = (target: any): string => {
  if (!target) return '0%';
  if (typeof target === 'object') {
    if (target.phase1 && target.phase2) return `${target.phase1}% + ${target.phase2}%`;
    if (target.total) return `${target.total}%`;
    return 'N/A';
  }
  return `${target}%`;
};

const generateGradient = (name: string) => {
  const gradients = [
    "from-purple-500 to-pink-500", "from-blue-500 to-purple-500",
    "from-green-500 to-blue-500", "from-yellow-500 to-orange-500",
    "from-red-500 to-pink-500", "from-indigo-500 to-blue-500"
  ];
  return gradients[(name?.length || 0) % gradients.length];
};

// ===================== CONVERSION BUTTON COMPONENTS =====================

// Primary CTA - Mobile
function MobilePrimaryCTA({ href, text, className = "" }: { href: string; text: string; className?: string }) {
  if (!href) href = '#';
  return (
    <button 
      onClick={() => href !== '#' && window.open(href, '_blank')}
      className={`relative group bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white rounded-xl font-bold hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2 overflow-hidden py-3 px-4 text-sm ${className}`}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
      <Sparkle size={14} className="text-white/80" />
      {text}
      <ExternalLink size={12} />
    </button>
  );
}

// Secondary CTA - For offers
function MobileSecondaryCTA({ href, text, className = "" }: { href: string; text: string; className?: string }) {
  if (!href) href = '#';
  return (
    <button 
      onClick={() => href !== '#' && window.open(href, '_blank')}
      className={`bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg hover:shadow-amber-500/30 flex items-center justify-center gap-2 py-2.5 px-4 text-sm ${className}`}
    >
      <Rocket size={14} />
      {text}
      <ArrowRightIcon size={12} />
    </button>
  );
}

// Program CTA - Mobile
function MobileProgramCTA({ href, text, className = "" }: { href: string; text: string; className?: string }) {
  if (!href) href = '#';
  return (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        href !== '#' && window.open(href, '_blank');
      }}
      className={`bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-500 hover:to-emerald-500 transition-all shadow-md hover:shadow-green-500/20 flex items-center justify-center gap-1.5 py-2 px-3 text-xs ${className}`}
    >
      <Rocket size={10} />
      {text}
    </button>
  );
}

// Star Rating Component
function StarRating({ rating, count = 0, size = "sm", readonly = true }: { 
  rating: number; 
  count?: number; 
  size?: "sm" | "md"; 
  readonly?: boolean 
}) {
  const sizes = { sm: "w-3.5 h-3.5", md: "w-5 h-5" };
  const hasReviews = count > 0;
  const displayRating = hasReviews ? Math.min(5, Math.max(0, rating || 0)) : 0;
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`${sizes[size]} ${i <= Math.floor(displayRating) && hasReviews ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}`} />
        ))}
      </div>
      {hasReviews && <span className="text-xs text-zinc-500">({count})</span>}
    </div>
  );
}

// Progress Bar Component
function ProgressBar({ value, label, color = "from-purple-500 to-pink-500" }: { value: number; label?: string; color?: string }) {
  const percentage = (value / 5) * 100;
  return (
    <div className="space-y-1">
      {label && <div className="flex justify-between text-xs"><span className="text-zinc-400">{label}</span><span className="text-white">{value.toFixed(1)}/5</span></div>}
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

// Incident Types
const incidentTypes = [
  { value: 'WITHDRAWAL_DELAY', label: 'Withdrawal Delay', icon: Clock, color: 'text-orange-400' },
  { value: 'WITHDRAWAL_REJECTED', label: 'Withdrawal Rejected', icon: XCircle, color: 'text-red-400' },
  { value: 'WITHDRAWAL_PAID', label: 'Withdrawal Paid', icon: CheckCircle, color: 'text-green-400' },
  { value: 'SLIPPAGE_ISSUES', label: 'Slippage Issues', icon: Activity, color: 'text-yellow-400' },
  { value: 'SPREAD_SPIKE', label: 'Spread Spike', icon: Target, color: 'text-orange-400' },
  { value: 'EXECUTION_DELAY', label: 'Execution Delay', icon: Clock, color: 'text-yellow-400' },
  { value: 'PLATFORM_FREEZE', label: 'Platform Freeze', icon: Smartphone, color: 'text-purple-400' },
  { value: 'SERVER_DOWN', label: 'Server Down', icon: XCircle, color: 'text-red-400' },
  { value: 'ACCOUNT_SUSPENDED', label: 'Account Suspended', icon: AlertTriangle, color: 'text-red-400' },
  { value: 'SCAM_WARNING', label: 'Scam Warning', icon: AlertTriangle, color: 'text-red-400' },
];

// Review Form Modal
function ReviewFormModal({ isOpen, onClose, firm, onSuccess }: any) {
  const { user } = useUser();
  const router = useRouter();
  const [withdrawalExperience, setWithdrawalExperience] = useState(0);
  const [executionQuality, setExecutionQuality] = useState(0);
  const [reliability, setReliability] = useState(0);
  const [customerSupport, setCustomerSupport] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [verifiedTrader, setVerifiedTrader] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hoverRating, setHoverRating] = useState<{ [key: string]: number }>({});

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="bg-zinc-900 rounded-2xl p-6 text-center max-w-sm mx-auto" onClick={(e) => e.stopPropagation()}>
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><Lock size={28} className="text-white" /></div>
          <h3 className="text-xl font-bold text-white mb-2">Login Required</h3>
          <p className="text-zinc-400 mb-6">Please login to write a review.</p>
          <div className="flex gap-3"><button onClick={onClose} className="flex-1 py-2 rounded-lg bg-zinc-800 text-white">Cancel</button><button onClick={() => { router.push('/login'); onClose(); }} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white">Login</button></div>
        </div>
      </div>
    );
  }

  const calculateTrustScore = () => {
    let score = 0, weight = 0;
    if (withdrawalExperience > 0) { score += (withdrawalExperience / 5) * 40; weight += 40; }
    if (executionQuality > 0) { score += (executionQuality / 5) * 20; weight += 20; }
    if (reliability > 0) { score += (reliability / 5) * 20; weight += 20; }
    if (customerSupport > 0) { score += (customerSupport / 5) * 10; weight += 10; }
    return weight === 0 ? null : Math.round((score / weight) * 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!title.trim()) { setError("Please enter a title"); return; }
    if (!content.trim()) { setError("Please enter your review"); return; }
    if (!agreeTerms) { setError("Please agree to the terms"); return; }
    if (withdrawalExperience === 0 && executionQuality === 0 && reliability === 0 && customerSupport === 0) {
      setError("Please rate at least one category");
      return;
    }

    setIsSubmitting(true);
    try {
      const totalRating = [withdrawalExperience, executionQuality, reliability, customerSupport]
        .filter(r => r > 0).reduce((a, b) => a + b, 0) / 
        [withdrawalExperience, executionQuality, reliability, customerSupport].filter(r => r > 0).length;

      const payload: any = {
        propFirmId: firm.id,
        title: title.trim(),
        content: content.trim(),
        rating: Math.round(totalRating),
        trustScore: calculateTrustScore(),
        pros: pros.trim() || undefined,
        cons: cons.trim() || undefined,
        verifiedTrader,
      };
      if (withdrawalExperience > 0) payload.withdrawalExperience = withdrawalExperience;
      if (executionQuality > 0) payload.executionQuality = executionQuality;
      if (reliability > 0) payload.reliability = reliability;
      if (customerSupport > 0) payload.customerSupport = customerSupport;

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to submit review');
      
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingRow = ({ label, value, setValue, icon }: any) => (
    <div className="flex items-center justify-between gap-3 p-2 bg-zinc-800/30 rounded-lg">
      <div className="flex items-center gap-2 text-xs text-zinc-300 min-w-[100px]">{icon}{label}</div>
      <div className="flex gap-1">
        {[1,2,3,4,5].map(star => (
          <button key={star} type="button" onClick={() => setValue(star)} onMouseEnter={() => setHoverRating({ ...hoverRating, [label]: star })} onMouseLeave={() => setHoverRating({ ...hoverRating, [label]: 0 })} className="focus:outline-none">
            <Star size={16} className={`transition-all duration-200 ${star <= (hoverRating[label] || value) ? "text-yellow-400 fill-yellow-400" : "text-zinc-600"}`} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-5 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${generateGradient(firm?.name)} flex items-center justify-center text-white font-bold text-sm`}>
                {firm?.name?.charAt(0) || 'P'}
              </div>
              <h2 className="text-white font-bold">Write a Review</h2>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800"><X size={18} className="text-zinc-400" /></button>
          </div>

          {success ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-400" /></div>
              <h3 className="text-xl font-bold text-white mb-2">Review Submitted!</h3>
              <p className="text-zinc-400">Thank you for sharing your experience.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300">Rate Your Experience</label>
                <RatingRow label="Withdrawal" value={withdrawalExperience} setValue={setWithdrawalExperience} icon={<Wallet size={12} className="text-green-400" />} />
                <RatingRow label="Execution" value={executionQuality} setValue={setExecutionQuality} icon={<Zap size={12} className="text-yellow-400" />} />
                <RatingRow label="Reliability" value={reliability} setValue={setReliability} icon={<Shield size={12} className="text-blue-400" />} />
                <RatingRow label="Support" value={customerSupport} setValue={setCustomerSupport} icon={<Headphones size={12} className="text-purple-400" />} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-zinc-400 mb-1 block">Pros (Optional)</label><Textarea placeholder="What you liked" value={pros} onChange={(e) => setPros(e.target.value)} rows={2} className="bg-zinc-800 border-zinc-700 text-white text-sm" /></div>
                <div><label className="text-xs text-zinc-400 mb-1 block">Cons (Optional)</label><Textarea placeholder="What could improve" value={cons} onChange={(e) => setCons(e.target.value)} rows={2} className="bg-zinc-800 border-zinc-700 text-white text-sm" /></div>
              </div>

              <div><label className="text-xs font-medium text-zinc-300 mb-1 block">Review Title *</label><Input placeholder="Summarize your experience" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" /></div>
              <div><label className="text-xs font-medium text-zinc-300 mb-1 block">Detailed Review *</label><Textarea placeholder="Share your experience..." value={content} onChange={(e) => setContent(e.target.value)} rows={3} className="bg-zinc-800 border-zinc-700 text-white resize-none" /></div>

              <div className="flex items-center gap-2 p-2 bg-zinc-800/30 rounded-lg"><Checkbox checked={verifiedTrader} onCheckedChange={(c) => setVerifiedTrader(c as boolean)} className="border-zinc-600" /><span className="text-xs text-zinc-300">I am a verified funded trader</span></div>
              <div className="flex items-center gap-2 p-2 bg-purple-500/10 rounded-lg border border-purple-500/20"><Checkbox checked={agreeTerms} onCheckedChange={(c) => setAgreeTerms(c as boolean)} className="border-purple-500" /><span className="text-xs text-zinc-300">I confirm this is based on my genuine experience *</span></div>

              {error && <div className="bg-red-500/20 rounded-lg p-2"><p className="text-red-400 text-xs">{error}</p></div>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg bg-zinc-800 text-white text-sm">Cancel</button>
                <button type="submit" disabled={isSubmitting || !agreeTerms || !title.trim() || !content.trim()} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium disabled:opacity-50">Submit Review</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// Incident Form Modal
function IncidentFormModal({ isOpen, onClose, firm, onSuccess }: any) {
  const { user } = useUser();
  const router = useRouter();
  const [incidentType, setIncidentType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="bg-zinc-900 rounded-2xl p-6 text-center max-w-sm mx-auto" onClick={(e) => e.stopPropagation()}>
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><Lock size={28} className="text-white" /></div>
          <h3 className="text-xl font-bold text-white mb-2">Login Required</h3>
          <p className="text-zinc-400 mb-6">Please login to report an incident.</p>
          <div className="flex gap-3"><button onClick={onClose} className="flex-1 py-2 rounded-lg bg-zinc-800 text-white">Cancel</button><button onClick={() => { router.push('/login'); onClose(); }} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 text-white">Login</button></div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentType) { setError('Please select an incident type'); return; }
    if (!title.trim()) { setError('Please add a title'); return; }
    if (!description.trim()) { setError('Please describe the incident'); return; }

    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        entityType: 'propFirm',
        entityId: firm.id,
        incidentType,
        title: title.trim(),
        description: description.trim(),
        incidentDate: new Date(incidentDate).toISOString(),
        withdrawalAmount: withdrawalAmount ? parseFloat(withdrawalAmount) : undefined,
        withdrawalMethod: withdrawalMethod || undefined,
      };

      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to submit incident');
      
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit incident');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTypeInfo = incidentTypes.find(t => t.value === incidentType);
  const IconComponent = selectedTypeInfo?.icon || AlertTriangle;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-5 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${generateGradient(firm?.name)} flex items-center justify-center text-white font-bold text-sm`}>
                {firm?.name?.charAt(0) || 'P'}
              </div>
              <h2 className="text-white font-bold">Report Incident</h2>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800"><X size={18} className="text-zinc-400" /></button>
          </div>

          {success ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-400" /></div>
              <h3 className="text-xl font-bold text-white mb-2">Incident Reported!</h3>
              <p className="text-zinc-400">Thank you for helping the community.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="text-xs font-medium text-zinc-300 mb-1 block">Incident Type *</label>
                <select value={incidentType} onChange={(e) => setIncidentType(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm">
                  <option value="">Select incident type</option>
                  {incidentTypes.map(type => (<option key={type.value} value={type.value}>{type.label}</option>))}
                </select>
              </div>

              {incidentType && selectedTypeInfo && (
                <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                  <IconComponent size={14} className={selectedTypeInfo.color} />
                  <span className="text-xs text-zinc-300">Reporting: <span className="text-white">{selectedTypeInfo.label}</span></span>
                </div>
              )}

              <div><label className="text-xs font-medium text-zinc-300 mb-1 block">Title *</label><Input placeholder="Brief summary" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" /></div>
              <div><label className="text-xs font-medium text-zinc-300 mb-1 block">Description *</label><Textarea placeholder="Detailed description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="bg-zinc-800 border-zinc-700 text-white resize-none" /></div>
              <div><label className="text-xs font-medium text-zinc-300 mb-1 block">Incident Date *</label><input type="date" value={incidentDate} onChange={(e) => setIncidentDate(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm" /></div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-zinc-400 mb-1 block">Withdrawal Amount</label><input type="number" placeholder="$0.00" value={withdrawalAmount} onChange={(e) => setWithdrawalAmount(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm" /></div>
                <div><label className="text-xs text-zinc-400 mb-1 block">Withdrawal Method</label><select value={withdrawalMethod} onChange={(e) => setWithdrawalMethod(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm"><option value="">Select</option><option value="Bank Transfer">Bank Transfer</option><option value="Crypto">Crypto</option><option value="Card">Card</option><option value="Skrill">Skrill</option><option value="Neteller">Neteller</option></select></div>
              </div>

              {error && <div className="bg-red-500/20 rounded-lg p-2"><p className="text-red-400 text-xs">{error}</p></div>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg bg-zinc-800 text-white text-sm">Cancel</button>
                <button type="submit" disabled={isSubmitting || !incidentType || !title.trim() || !description.trim()} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 text-white text-sm font-medium disabled:opacity-50">Submit Report</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MobilePropFirmDetail({ params }: { params: { firm: string } }) {
  const router = useRouter();
  const { user } = useUser();
  const [firm, setFirm] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'rules' | 'payouts' | 'reputation' | 'reviews' | 'incidents'>('overview');
  const [firmReviews, setFirmReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [firmIncidents, setFirmIncidents] = useState<number>(0);
  const [incidentsList, setIncidentsList] = useState<any[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Reply state
  const [replyingToReview, setReplyingToReview] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyMedia, setReplyMedia] = useState<File[]>([]);
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [showReplySection, setShowReplySection] = useState<Record<string, boolean>>({});
  const [repliesCache, setRepliesCache] = useState<Record<string, any[]>>({});
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Load firm data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const firmId = parseInt(params.firm);
        let foundFirm = null;
        
        if (!isNaN(firmId)) {
          const response = await api.getPropFirmById(firmId);
          if (response.success && response.data) foundFirm = response.data;
        }
        
        if (!foundFirm) {
          const allFirmsResponse = await api.getPropFirms();
          if (allFirmsResponse.success && allFirmsResponse.data) {
            foundFirm = allFirmsResponse.data.find((f: any) => {
              return f.id?.toString() === params.firm || 
                     (f.name && slugify(f.name) === params.firm) ||
                     f.name?.toLowerCase() === params.firm.toLowerCase();
            });
          }
        }
        
        if (foundFirm) {
          setFirm(foundFirm);
          await fetchFirmReviews(foundFirm.id);
          await fetchIncidents(foundFirm.id);
          if (typeof window !== 'undefined') {
            const bookmarks = JSON.parse(localStorage.getItem('propFirmBookmarks') || '[]');
            setIsBookmarked(bookmarks.includes(foundFirm.slug || slugify(foundFirm.name)));
          }
        } else {
          setError('Prop firm not found');
        }
      } catch (err) {
        console.error('Error loading firm:', err);
        setError('Failed to load prop firm data');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [params.firm]);

  const fetchFirmReviews = async (firmId: number) => {
    setReviewsLoading(true);
    try {
      const response = await fetch(`/api/reviews?propFirmId=${firmId}&status=APPROVED`, { credentials: 'include' });
      const data = await response.json();
      if (response.ok) setFirmReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchIncidents = async (firmId: number) => {
    try {
      const response = await fetch(`/api/incidents?entityType=propFirm&entityId=${firmId}&limit=20`);
      const data = await response.json();
      if (response.ok) {
        setFirmIncidents(data.pagination?.total || 0);
        setIncidentsList(data.incidents || []);
      }
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
    }
  };

  // Fetch replies for a specific parent
  const fetchRepliesForParent = async (reviewId: string, parentId: string | null = null): Promise<any[]> => {
    const cacheKey = parentId ? `${reviewId}_parent_${parentId}` : reviewId;
    
    if (repliesCache[cacheKey]) return repliesCache[cacheKey];
    
    try {
      const url = parentId 
        ? `/api/reviews/${reviewId}/replies?parentId=${parentId}`
        : `/api/reviews/${reviewId}/replies`;
        
      const response = await fetch(url, { credentials: 'include' });
      const data = await response.json();
      
      if (response.ok) {
        setRepliesCache(prev => ({ ...prev, [cacheKey]: data.replies || [] }));
        return data.replies || [];
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
    return [];
  };

  // Submit a reply
  const submitReply = async (reviewId: string, parentId: string | null, content: string, mediaFiles: File[]) => {
    if (!user) {
      router.push('/login');
      return false;
    }
    
    const formData = new FormData();
    formData.append('content', content);
    if (parentId) formData.append('parentReplyId', parentId);
    mediaFiles.forEach(file => formData.append('media', file));
    
    try {
      const response = await fetch(`/api/reviews/${reviewId}/replies`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        const cacheKey = parentId ? `${reviewId}_parent_${parentId}` : reviewId;
        setRepliesCache(prev => {
          const newCache = { ...prev };
          delete newCache[cacheKey];
          return newCache;
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error submitting reply:', error);
      return false;
    }
  };

  // Handle reply submission from UI
  const handleSubmitReply = async (reviewId: string, parentId: string | null = null) => {
    if (!replyContent.trim() && replyMedia.length === 0) return;
    
    setReplySubmitting(true);
    const success = await submitReply(reviewId, parentId, replyContent, replyMedia);
    if (success) {
      setReplyContent('');
      setReplyMedia([]);
      setReplyingToReview(null);
      const cacheKey = parentId ? `${reviewId}_parent_${parentId}` : reviewId;
      const freshReplies = await fetchRepliesForParent(reviewId, parentId);
      setRepliesCache(prev => ({ ...prev, [cacheKey]: freshReplies }));
      setShowReplySection(prev => ({ ...prev, [reviewId]: true }));
    }
    setReplySubmitting(false);
  };

  // Handle opening lightbox
  const handleOpenLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const markHelpful = async (reviewId: string, voteType: 'HELPFUL' | 'NOT_HELPFUL') => {
    if (!user) { router.push('/login'); return; }
    try {
      const res = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ voteType }),
      });
      if (res.ok) {
        const data = await res.json();
        setUserVotes(prev => ({ ...prev, [reviewId]: data.userVote }));
        setFirmReviews(firmReviews.map(review => 
          review.id === reviewId ? { ...review, helpfulCount: data.helpfulCount } : review
        ));
      }
    } catch (error) { console.error('Error voting:', error); }
  };

  const toggleBookmark = () => {
    if (typeof window !== 'undefined' && firm) {
      const bookmarks = JSON.parse(localStorage.getItem('propFirmBookmarks') || '[]');
      const slug = firm.slug || slugify(firm.name);
      const newBookmarks = isBookmarked ? bookmarks.filter((b: string) => b !== slug) : [...bookmarks, slug];
      localStorage.setItem('propFirmBookmarks', JSON.stringify(newBookmarks));
      setIsBookmarked(!isBookmarked);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: `Get Funded with ${firm?.name || 'Prop Firm'}`, url: window.location.href }); } 
      catch (error) { console.log('Error sharing:', error); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied!');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const calculateTrustStats = () => {
    if (!firmReviews || firmReviews.length === 0) {
      return { 
        avgTrustScore: 0, 
        totalReviews: 0,
        withdrawalExperience: 0,
        executionQuality: 0,
        reliability: 0,
        customerSupport: 0,
        recommendationRate: 0
      };
    }
    const avgTrustScore = firmReviews.reduce((sum, r) => sum + (r.trustScore || 0), 0) / firmReviews.length;
    const withdrawalExperience = firmReviews.filter(r => r.withdrawalExperience).reduce((sum, r) => sum + (r.withdrawalExperience || 0), 0) / (firmReviews.filter(r => r.withdrawalExperience).length || 1);
    const executionQuality = firmReviews.filter(r => r.executionQuality).reduce((sum, r) => sum + (r.executionQuality || 0), 0) / (firmReviews.filter(r => r.executionQuality).length || 1);
    const reliability = firmReviews.filter(r => r.reliability).reduce((sum, r) => sum + (r.reliability || 0), 0) / (firmReviews.filter(r => r.reliability).length || 1);
    const customerSupport = firmReviews.filter(r => r.customerSupport).reduce((sum, r) => sum + (r.customerSupport || 0), 0) / (firmReviews.filter(r => r.customerSupport).length || 1);
    const recommendationRate = (firmReviews.filter(r => r.wouldRecommend === 'Yes').length / firmReviews.length) * 100;
    return { avgTrustScore, totalReviews: firmReviews.length, withdrawalExperience, executionQuality, reliability, customerSupport, recommendationRate };
  };

  const trustStats = calculateTrustStats();
  const maxPayout = firm ? getMaxPayout(firm) : 0;
  const minPrice = firm ? getMinPrice(firm) : 0;
  const minAccount = firm ? getMinAccountSize(firm) : 0;
  const maxAccount = firm ? getMaxAccountSize(firm) : 0;
  const programsCount = firm?.programs?.length || 0;
  const hasRealReviews = trustStats.totalReviews > 0;
  const displayRating = hasRealReviews ? (firm?.rating || trustStats.avgTrustScore / 20 || 0) : 0;
  const affiliateLink = firm?.signupLink || firm?.website || '#';

  if (isLoading) {
    return (
      <MobileLayout title="Prop Firm Details" showSearch={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" /><p className="text-xs text-zinc-500 mt-3">Loading prop firm...</p></div>
        </div>
      </MobileLayout>
    );
  }

  if (error || !firm) {
    return (
      <MobileLayout title="Prop Firm Details" showSearch={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center"><AlertTriangle size={32} className="text-red-400 mx-auto mb-3" /><p className="text-zinc-500">{error || 'Prop firm not found'}</p><button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-purple-600 rounded-lg text-white text-sm">Go Back</button></div>
        </div>
      </MobileLayout>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'accounts', label: 'Accounts', icon: Wallet },
    { id: 'rules', label: 'Rules', icon: Scale },
    { id: 'payouts', label: 'Payouts', icon: DollarSign },
    { id: 'reputation', label: 'Reputation', icon: Shield },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'incidents', label: 'Incidents', icon: AlertOctagon },
  ];

  return (
    <MobileLayout title={firm.name} showSearch={false}>
      <div className="space-y-4 pb-6">
        
        {/* Hero Section - Keep as is */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-5 border border-purple-500/30">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {firm.logo ? (
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0">
                  <img src={firm.logo} alt={firm.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${generateGradient(firm.name)} flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0`}>
                  {firm.name?.charAt(0) || 'P'}
                </div>
              )}
              <div>
                <h1 className="text-white font-bold text-xl">{firm.name}</h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <StarRating rating={displayRating} count={trustStats.totalReviews} size="sm" />
                  <div className="flex items-center gap-1"><Globe size={12} className="text-zinc-400" /><span className="text-xs text-zinc-400">{firm.country || 'International'}</span></div>
                </div>
                {firm.trustScore > 0 && <TrustScoreBadge score={firm.trustScore || firm.avgTrustScore || 0} size="sm" />}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={toggleBookmark} className="p-2 rounded-lg bg-zinc-800"><Bookmark size={16} className={isBookmarked ? "text-yellow-400 fill-yellow-400" : "text-zinc-400"} /></button>
              <button onClick={handleShare} className="p-2 rounded-lg bg-zinc-800"><Share2 size={16} className="text-zinc-400" /></button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
              <div className="text-[10px] text-zinc-500">Min Account</div>
              <div className="text-white font-bold text-sm">{formatCurrency(minAccount)}</div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
              <div className="text-[10px] text-zinc-500">Max Payout</div>
              <div className="text-white font-bold text-sm">{maxPayout}%</div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
              <div className="text-[10px] text-zinc-500">Starting Price</div>
              <div className="text-white font-bold text-sm">{formatCurrency(minPrice)}</div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
              <div className="text-[10px] text-zinc-500">Trust Score</div>
              <div className="text-white font-bold text-sm">{hasRealReviews ? Math.round(trustStats.avgTrustScore) : 'N/A'}</div>
            </div>
          </div>

          {/* Warnings */}
          {(firm.warnings?.length > 0 || firm.regulatoryWarnings?.length > 0) && (
            <div className="mb-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-red-400 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-red-400">Important Warnings</div>
                  <ul className="text-xs text-zinc-300 mt-1 space-y-1">
                    {[...(firm.warnings || []), ...(firm.regulatoryWarnings || [])].slice(0, 2).map((w: string, i: number) => (
                      <li key={i}>• {w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <MobilePrimaryCTA href={affiliateLink} text="Start Challenge" />
            {firm.promotions && firm.promotions.length > 0 && (
              <div className="flex gap-2">
                <button className="flex-1 py-2.5 bg-zinc-800 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2">
                  <Gift size={14} className="text-amber-400" /> {firm.promotions[0].discount ? `${firm.promotions[0].discount}% OFF` : 'Special Offer'}
                </button>
                {firm.promotions[0].code && (
                  <button onClick={() => handleCopyCode(firm.promotions[0].code)} className="px-3 py-2.5 bg-zinc-800 rounded-xl text-white text-sm font-medium flex items-center gap-1">
                    {copiedCode === firm.promotions[0].code ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Incident Alert */}
        {firmIncidents > 0 && (
          <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20 flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-400" />
            <p className="text-xs text-red-400">{firmIncidents} incident{firmIncidents !== 1 ? 's' : ''} reported</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === tab.id ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg" : "bg-zinc-800/50 text-zinc-400"}`}>
                <Icon size={12} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* ============ OVERVIEW TAB ============ */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Description */}
            <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
              <p className="text-zinc-400 text-sm leading-relaxed">{firm.description}</p>
            </div>

            {/* Risk Assessment */}
            {firm.riskLevel && (
              <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2"><Shield size={14} className="text-purple-400" />Risk Assessment</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                    <div className="text-[10px] text-zinc-500">Risk Level</div>
                    <div className={`text-sm font-bold ${firm.riskLevel === 'Low' ? 'text-green-400' : firm.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>{firm.riskLevel}</div>
                  </div>
                  {firm.riskScore && (
                    <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                      <div className="text-[10px] text-zinc-500">Risk Score</div>
                      <div className="text-white text-sm font-bold">{firm.riskScore}/100</div>
                    </div>
                  )}
                </div>
                {firm.recommendation && (
                  <div className="mt-2 bg-zinc-800/30 rounded-lg p-2 text-center">
                    <div className="text-[10px] text-zinc-500">Recommendation</div>
                    <div className="text-white text-xs font-medium">{firm.recommendation}</div>
                  </div>
                )}
              </div>
            )}

            {/* Financial Performance */}
            {(firm.totalPayoutsPaid || firm.totalTradersServed || firm.countriesServed) && (
              <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2"><BarChart3 size={14} className="text-green-400" />Financial Performance</h3>
                <div className="grid grid-cols-2 gap-2">
                  {firm.totalPayoutsPaid && (
                    <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                      <div className="text-[10px] text-zinc-500">Total Payouts</div>
                      <div className="text-green-400 text-sm font-bold">{firm.totalPayoutsPaid}</div>
                    </div>
                  )}
                  {firm.totalTradersServed && (
                    <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                      <div className="text-[10px] text-zinc-500">Traders Served</div>
                      <div className="text-white text-sm font-bold">{firm.totalTradersServed.toLocaleString()}</div>
                    </div>
                  )}
                  {firm.countriesServed && (
                    <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                      <div className="text-[10px] text-zinc-500">Countries</div>
                      <div className="text-white text-sm font-bold">{firm.countriesServed}+</div>
                    </div>
                  )}
                  {firm.dailyTradeCount && (
                    <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                      <div className="text-[10px] text-zinc-500">Daily Trades</div>
                      <div className="text-white text-sm font-bold">{firm.dailyTradeCount.toLocaleString()}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Company Info */}
            <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
              <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2"><Building size={14} className="text-purple-400" />Company Info</h3>
              <div className="space-y-2 text-xs">
                {firm.ceo && <div className="flex justify-between"><span className="text-zinc-500">CEO</span><span className="text-white">{firm.ceo}</span></div>}
                {firm.legalName && <div className="flex justify-between"><span className="text-zinc-500">Legal Name</span><span className="text-white">{firm.legalName}</span></div>}
                {firm.headquarters && <div className="flex justify-between"><span className="text-zinc-500">Headquarters</span><span className="text-white">{firm.headquarters}</span></div>}
                {firm.founded && <div className="flex justify-between"><span className="text-zinc-500">Founded</span><span className="text-white">{firm.founded}</span></div>}
                {firm.foundedMonth && <div className="flex justify-between"><span className="text-zinc-500">Founded Month</span><span className="text-white">{firm.foundedMonth}</span></div>}
                {firm.yearsInOperation && <div className="flex justify-between"><span className="text-zinc-500">Years</span><span className="text-white">{firm.yearsInOperation}</span></div>}
                {firm.regulation && <div className="flex justify-between"><span className="text-zinc-500">Regulation</span><span className="text-white">{firm.regulation}</span></div>}
                {firm.regulatoryBodies?.length > 0 && <div className="flex justify-between"><span className="text-zinc-500">Regulatory Bodies</span><span className="text-white">{firm.regulatoryBodies.join(', ')}</span></div>}
                {firm.contactEmail && <div className="flex justify-between"><span className="text-zinc-500">Email</span><span className="text-white">{firm.contactEmail}</span></div>}
              </div>
            </div>

            {/* Supported Countries */}
            {firm.supportedCountries?.length > 0 && (
              <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2"><Globe size={14} className="text-blue-400" />Supported Countries</h3>
                <div className="flex flex-wrap gap-1">
                  {firm.supportedCountries.map((c: string) => (
                    <span key={c} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Social Media */}
            {firm.socialMedia && Object.keys(firm.socialMedia).filter(k => firm.socialMedia[k]).length > 0 && (
              <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2"><Share2 size={14} className="text-blue-400" />Social Media</h3>
                <div className="flex flex-wrap gap-2">
                  {firm.socialMedia.twitter && (
                    <a href={firm.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg">
                      <Twitter size={16} className="text-blue-400" />
                    </a>
                  )}
                  {firm.socialMedia.linkedin && (
                    <a href={firm.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg">
                      <Linkedin size={16} className="text-blue-400" />
                    </a>
                  )}
                  {firm.socialMedia.youtube && (
                    <a href={firm.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg">
                      <Youtube size={16} className="text-red-400" />
                    </a>
                  )}
                  {firm.socialMedia.instagram && (
                    <a href={firm.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg">
                      <Instagram size={16} className="text-pink-400" />
                    </a>
                  )}
                  {firm.socialMedia.facebook && (
                    <a href={firm.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg">
                      <Facebook size={16} className="text-blue-400" />
                    </a>
                  )}
                  {firm.socialMedia.discord && (
                    <a href={firm.socialMedia.discord} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg">
                      <MessageCircle size={16} className="text-purple-400" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============ ACCOUNTS TAB ============ */}
        {activeTab === 'accounts' && firm.programs && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-sm">Trading Programs</h2>
              <MobilePrimaryCTA href={affiliateLink} text="View All" className="py-1.5 px-3 text-xs" />
            </div>
            {firm.programs.map((program: any, idx: number) => (
              <div key={idx} className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
                <h3 className="text-white font-semibold text-base mb-2">{program.type}</h3>
                <p className="text-zinc-400 text-xs mb-3">{program.description}</p>
                <div className="space-y-2">
                  {program.accountOptions?.map((option: any, optIdx: number) => (
                    <div key={optIdx} className="bg-zinc-800/50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white font-medium text-sm">{formatCurrency(option.accountSize)}</span>
                        <span className="text-green-400 font-bold text-sm">{formatCurrency(option.price)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-zinc-400">
                        <span>Payout: {option.payoutPercentage || 80}%</span>
                        <span>Allocation: {formatCurrency(option.maxAllocation)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-zinc-700 flex justify-end">
                  <MobileProgramCTA href={affiliateLink} text={`Start ${program.type}`} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============ RULES TAB ============ */}
        {activeTab === 'rules' && firm.programs && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-sm">Challenge Rules</h2>
              <MobilePrimaryCTA href={affiliateLink} text="Start Challenge" className="py-1.5 px-3 text-xs" />
            </div>
            {firm.programs.map((program: any, idx: number) => (
              <div key={idx} className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
                <h3 className="text-white font-semibold text-sm mb-3">{program.type}</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                    <div className="text-zinc-500 text-[10px]">Profit Target</div>
                    <div className="text-white font-medium">{formatProfitTarget(program.rules?.profitTarget)}</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                    <div className="text-zinc-500 text-[10px]">Max Drawdown</div>
                    <div className="text-white font-medium">{program.rules?.maxDrawdown || 0}%</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                    <div className="text-zinc-500 text-[10px]">Daily Drawdown</div>
                    <div className="text-white font-medium">{program.rules?.dailyDrawdown || 0}%</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                    <div className="text-zinc-500 text-[10px]">Min Days</div>
                    <div className="text-white font-medium">{program.rules?.minTradingDays || 0}</div>
                  </div>
                </div>

                {/* News Trading Restrictions */}
                {firm.newsTradingRestrictions && (
                  <div className="mt-3 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={12} className="text-yellow-400 mt-0.5" />
                      <span className="text-[10px] text-zinc-300">{firm.newsTradingRestrictions}</span>
                    </div>
                  </div>
                )}

                {/* Prohibited Strategies */}
                {firm.prohibitedStrategies?.length > 0 && (
                  <div className="mt-3 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={12} className="text-red-400 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-semibold text-red-400">Prohibited:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {firm.prohibitedStrategies.slice(0, 3).map((strategy: string, i: number) => (
                            <span key={i} className="text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">{strategy}</span>
                          ))}
                          {firm.prohibitedStrategies.length > 3 && (
                            <span className="text-[8px] text-zinc-500">+{firm.prohibitedStrategies.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ============ PAYOUTS TAB ============ */}
        {activeTab === 'payouts' && (
          <div className="space-y-4">
            <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
              <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2"><DollarSign size={14} className="text-green-400" />Payout Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-zinc-500">Max Payout</span><span className="text-white font-medium">{maxPayout}%</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Payout Frequency</span><span className="text-white font-medium">{firm.payoutFrequency || '—'}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Minimum Payout</span><span className="text-white font-medium">{formatCurrency(firm.minimumPayout)}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Payout Methods</span><span className="text-white font-medium">{firm.payoutMethods?.join(', ') || '—'}</span></div>
                {firm.payoutProcessingTime && <div className="flex justify-between"><span className="text-zinc-500">Processing Time</span><span className="text-white font-medium">{firm.payoutProcessingTime}</span></div>}
                {firm.totalPayoutsPaid && <div className="flex justify-between"><span className="text-zinc-500">Total Paid</span><span className="text-green-400 font-medium">{firm.totalPayoutsPaid}</span></div>}
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800">
                <MobilePrimaryCTA href={affiliateLink} text="Start Earning Now" className="w-full py-2.5 text-sm" />
              </div>
            </div>

            {/* Scaling Plan */}
            {firm.scalingPlan && (
              <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2"><Trophy size={14} className="text-yellow-400" />Scaling Plan</h3>
                <div className="space-y-2">
                  {firm.scalingPlan.levels?.map((level: any, idx: number) => (
                    <div key={idx} className="bg-zinc-800/50 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-white font-medium text-sm">{level.name}</span>
                          <div className="text-[10px] text-zinc-400">{level.monthsRequired}m · {level.payoutsRequired} payouts</div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold text-sm">{level.profitSplit}% split</div>
                          <div className="text-[10px] text-zinc-400">+{level.capitalBoost}% boost</div>
                        </div>
                      </div>
                      {level.benefits?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {level.benefits.map((benefit: string, i: number) => (
                            <span key={i} className="text-[8px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full">{benefit}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-zinc-800">
                  <MobilePrimaryCTA href={affiliateLink} text="Start Scaling" className="w-full py-2 text-sm" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============ REPUTATION TAB ============ */}
        {activeTab === 'reputation' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-sm flex items-center gap-2"><Shield size={14} className="text-purple-400" />Reputation</h2>
              <MobilePrimaryCTA href={affiliateLink} text="Join Community" className="py-1.5 px-3 text-xs" />
            </div>

            {/* Trustpilot */}
            {(firm.trustpilotRating > 0 || firm.trustpilotReviews > 0) && (
              <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
                <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2"><Star size={14} className="text-yellow-400" />Trustpilot Reviews</h4>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{firm.trustpilotRating.toFixed(1)}</div>
                    <StarRating rating={firm.trustpilotRating} count={firm.trustpilotReviews} size="sm" />
                    <div className="text-[10px] text-zinc-500 mt-1">{firm.trustpilotReviews} reviews</div>
                  </div>
                  {firm.trustpilotUrl && (
                    <a href={firm.trustpilotUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400">View on Trustpilot →</a>
                  )}
                </div>
              </div>
            )}

            {/* Review Themes */}
            {(firm.positiveReviewThemes?.length > 0 || firm.negativeReviewThemes?.length > 0) && (
              <div className="grid grid-cols-2 gap-3">
                {firm.positiveReviewThemes?.length > 0 && (
                  <div className="bg-zinc-900/80 rounded-xl p-3 border border-green-500/20">
                    <h4 className="text-xs font-semibold text-green-400 mb-2 flex items-center gap-1"><ThumbsUp size={12} /> Positive</h4>
                    <ul className="space-y-1">
                      {firm.positiveReviewThemes.slice(0, 3).map((theme: string, i: number) => (
                        <li key={i} className="text-[10px] text-zinc-300 flex items-start gap-1">
                          <CheckCircle size={8} className="text-green-400 mt-0.5" />
                          <span>{theme.length > 50 ? theme.substring(0, 50) + '...' : theme}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {firm.negativeReviewThemes?.length > 0 && (
                  <div className="bg-zinc-900/80 rounded-xl p-3 border border-red-500/20">
                    <h4 className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1"><ThumbsDownIcon size={12} /> Negative</h4>
                    <ul className="space-y-1">
                      {firm.negativeReviewThemes.slice(0, 3).map((theme: string, i: number) => (
                        <li key={i} className="text-[10px] text-zinc-300 flex items-start gap-1">
                          <XCircle size={8} className="text-red-400 mt-0.5" />
                          <span>{theme.length > 50 ? theme.substring(0, 50) + '...' : theme}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Support Agents */}
            {firm.supportAgents?.length > 0 && (
              <div className="bg-zinc-900/80 rounded-xl p-3 border border-zinc-800">
                <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-1"><Headphones size={12} className="text-purple-400" />Support Team</h4>
                <div className="flex flex-wrap gap-1">
                  {firm.supportAgents.map((agent: string, i: number) => (
                    <span key={i} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">{agent}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Known Issues */}
            {firm.knownIssues?.length > 0 && (
              <div className="bg-zinc-900/80 rounded-xl p-3 border border-yellow-500/20">
                <h4 className="text-xs font-semibold text-yellow-400 mb-2 flex items-center gap-1"><AlertTriangle size={12} /> Known Issues</h4>
                <div className="space-y-2">
                  {firm.knownIssues.slice(0, 2).map((issue: any, i: number) => (
                    <div key={i} className="bg-zinc-800/50 rounded-lg p-2">
                      <div className="flex justify-between items-start">
                        <span className="text-white text-xs font-medium">{issue.issue}</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${issue.severity === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{issue.severity}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1">{issue.description}</p>
                    </div>
                  ))}
                  {firm.knownIssues.length > 2 && <p className="text-[10px] text-zinc-500">+{firm.knownIssues.length - 2} more</p>}
                </div>
              </div>
            )}

            {/* Warning Flags */}
            {(firm.payoutDelaysReported || firm.slippageReported || firm.hiddenRulesReported || firm.retroactiveRuleChanges || firm.withdrawalDenials) && (
              <div className="bg-zinc-900/80 rounded-xl p-3 border border-red-500/20">
                <h4 className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1"><AlertOctagon size={12} /> Warning Flags</h4>
                <div className="flex flex-wrap gap-1">
                  {firm.payoutDelaysReported && <span className="text-[8px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/20">⚠️ Payout Delays</span>}
                  {firm.slippageReported && <span className="text-[8px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/20">⚠️ Slippage</span>}
                  {firm.hiddenRulesReported && <span className="text-[8px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/20">⚠️ Hidden Rules</span>}
                  {firm.retroactiveRuleChanges && <span className="text-[8px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/20">⚠️ Retroactive Rules</span>}
                  {firm.withdrawalDenials && <span className="text-[8px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/20">⚠️ Withdrawal Denials</span>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============ REVIEWS TAB WITH COMMENTS ============ */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <button onClick={() => setShowReviewForm(true)} className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2">
              <Plus size={14} /> Write a Review
            </button>

            <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800 text-center">
              <div className="text-3xl font-bold text-white mb-1">{hasRealReviews ? displayRating.toFixed(1) : 'N/A'}</div>
              <StarRating rating={displayRating} count={trustStats.totalReviews} size="md" />
              <p className="text-xs text-zinc-500 mt-2">{trustStats.totalReviews} review{trustStats.totalReviews !== 1 ? 's' : ''}</p>
            </div>

            {reviewsLoading ? (
              <div className="text-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto" /></div>
            ) : firmReviews.length > 0 ? (
              <div className="space-y-3">
                {firmReviews.map((review) => {
                  const isExpanded = expandedReviewId === review.id;
                  const topLevelReplies = repliesCache[review.id] || [];
                  
                  return (
                    <div key={review.id} className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {review.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-semibold text-sm">{review.user?.name || 'Anonymous'}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <StarRating rating={review.rating} size="sm" />
                            <span className="text-[10px] text-zinc-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => markHelpful(review.id, 'HELPFUL')} className={`p-1.5 rounded-lg transition-colors ${userVotes[review.id] === 'HELPFUL' ? 'bg-green-500/20 text-green-400' : 'text-zinc-500 hover:text-green-400'}`}>
                            <ThumbsUp size={14} />
                          </button>
                          {review.trustScore && <TrustScoreBadge score={review.trustScore} size="sm" />}
                        </div>
                      </div>
                      
                      <h4 className="text-white font-semibold text-sm mb-2">{review.title}</h4>
                      <p className="text-zinc-300 text-xs leading-relaxed">{isExpanded ? review.content : `${review.content.substring(0, 150)}${review.content.length > 150 ? '...' : ''}`}</p>
                      {review.content.length > 150 && !isExpanded && (
                        <button onClick={() => setExpandedReviewId(review.id)} className="text-purple-400 text-xs mt-1">Read more</button>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-zinc-800">
                        <button onClick={() => markHelpful(review.id, 'HELPFUL')} className={`flex items-center gap-1 text-xs ${userVotes[review.id] === 'HELPFUL' ? 'text-green-400' : 'text-zinc-500'}`}>
                          <ThumbsUp size={12} /> Helpful ({review.helpfulCount || 0})
                        </button>
                        {review.verifiedTrader && (
                          <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">Verified Trader</span>
                        )}
                        <button
                          onClick={async () => {
                            const isOpen = showReplySection[review.id];
                            setShowReplySection(prev => ({ ...prev, [review.id]: !isOpen }));
                            if (!isOpen && !repliesCache[review.id]) {
                              const replies = await fetchRepliesForParent(review.id, null);
                              setRepliesCache(prev => ({ ...prev, [review.id]: replies }));
                            }
                          }}
                          className="relative flex items-center gap-1 text-xs text-zinc-500 hover:text-green-400 transition-colors"
                        >
                          <MessageCircle size={12} />
                          Comments {review.replyCount > 0 && `(${review.replyCount})`}
                        </button>
                      </div>
                      
                      {/* ====== REPLY / COMMENT SECTION ====== */}
                      {showReplySection[review.id] && (
                        <div className="mt-3 border-t border-zinc-800 pt-3">
                          {/* Existing Replies */}
                          {topLevelReplies.map((reply) => (
                            <ReplyThread
                              key={reply.id}
                              reply={reply}
                              onReply={(parentId, content, mediaFiles) => submitReply(review.id, parentId, content, mediaFiles)}
                              onLoadChildReplies={(replyId) => fetchRepliesForParent(review.id, replyId)}
                              onOpenLightbox={handleOpenLightbox}
                              currentUser={user}
                            />
                          ))}
                          
                          {/* New Reply Form */}
                          <div className="mt-3 flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1">
                              <textarea
                                value={replyingToReview === review.id ? replyContent : ''}
                                onChange={(e) => {
                                  setReplyingToReview(review.id);
                                  setReplyContent(e.target.value);
                                }}
                                placeholder="Add a comment..."
                                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                                rows={2}
                                onFocus={() => setReplyingToReview(review.id)}
                              />
                              <div className="flex justify-between items-center mt-2">
                                <div className="flex gap-2">
                                  <label className="cursor-pointer p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors">
                                    <ImagePlus size={14} className="text-zinc-400" />
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
                                  {replyMedia.length > 0 && (
                                    <div className="flex gap-1">
                                      {replyMedia.map((file, idx) => (
                                        <div key={idx} className="relative">
                                          <img src={URL.createObjectURL(file)} alt="" className="w-8 h-8 rounded object-cover" />
                                          <button 
                                            onClick={() => setReplyMedia(prev => prev.filter((_, i) => i !== idx))}
                                            className="absolute -top-1 -right-1 p-0.5 bg-red-500 rounded-full"
                                          >
                                            <X size={8} className="text-white" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                {replyingToReview === review.id && (replyContent.trim() || replyMedia.length > 0) && (
                                  <button
                                    onClick={() => handleSubmitReply(review.id, null)}
                                    disabled={replySubmitting}
                                    className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs disabled:opacity-50 flex items-center gap-1"
                                  >
                                    {replySubmitting ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
                                    {replySubmitting ? 'Sending...' : 'Post'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <MessageSquare size={32} className="text-zinc-600 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">No reviews yet</p>
                <p className="text-zinc-600 text-xs">Be the first to share your experience</p>
              </div>
            )}

            {/* Bottom CTA */}
            <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-xl p-4 border border-purple-500/30 text-center">
              <h3 className="text-white font-semibold text-sm mb-1">Join thousands of funded traders</h3>
              <p className="text-zinc-400 text-xs mb-3">{firm.totalTradersServed ? `${firm.totalTradersServed.toLocaleString()}+ traders` : '10,000+ traders'} have started their journey</p>
              <MobilePrimaryCTA href={affiliateLink} text="Start Your Challenge Today" className="w-full py-2.5 text-sm" />
            </div>
          </div>
        )}

        {/* ============ INCIDENTS TAB ============ */}
        {activeTab === 'incidents' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button onClick={() => setShowIncidentForm(true)} className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                <Flag size={14} /> Report Incident
              </button>
              <MobilePrimaryCTA href={affiliateLink} text="Start Trading" className="py-2.5 px-4 text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-500/10 rounded-xl p-3 text-center border border-red-500/20">
                <AlertTriangle size={16} className="text-red-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-white">{firmIncidents}</div>
                <div className="text-[10px] text-zinc-500">Total Reports</div>
              </div>
              <div className="bg-yellow-500/10 rounded-xl p-3 text-center border border-yellow-500/20">
                <Clock size={16} className="text-yellow-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-white">{incidentsList.filter(i => i.resolutionStatus === 'PENDING').length}</div>
                <div className="text-[10px] text-zinc-500">Unresolved</div>
              </div>
            </div>

            {incidentsList.length > 0 ? (
              <div className="space-y-3">
                {incidentsList.map((incident) => {
                  const typeInfo = incidentTypes.find(t => t.value === incident.incidentType);
                  const IconComponent = typeInfo?.icon || AlertTriangle;
                  const typeColor = typeInfo?.color || 'text-red-400';
                  return (
                    <div key={incident.id} className="bg-zinc-900/80 rounded-xl p-4 border border-red-500/20">
                      <div className="flex items-start gap-3 mb-2">
                        <IconComponent size={14} className={typeColor} />
                        <div className="flex-1">
                          <h4 className="text-white font-semibold text-sm">{incident.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${incident.resolutionStatus === 'RESOLVED' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {incident.resolutionStatus || 'PENDING'}
                            </span>
                            <span className="text-[10px] text-zinc-500">{new Date(incident.incidentDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-zinc-300 text-xs mb-2">{incident.description}</p>
                      {incident.withdrawalAmount && <div className="text-xs text-zinc-500">Amount: {formatCurrency(incident.withdrawalAmount)}</div>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <Shield size={32} className="text-green-400 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">No incidents reported</p>
                <p className="text-zinc-600 text-xs">This prop firm has a clean record</p>
                <div className="mt-3">
                  <MobilePrimaryCTA href={affiliateLink} text="Start with Confidence" className="py-2 px-4 text-sm inline-flex" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA Footer */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-4 border border-purple-500/30 text-center">
          <Rocket size={20} className="text-purple-400 mx-auto mb-2" />
          <p className="text-white text-sm font-medium mb-1">Ready to get funded?</p>
          <p className="text-zinc-400 text-xs mb-3">Start your challenge with {firm.name} today</p>
          <MobilePrimaryCTA href={affiliateLink} text="Start Challenge →" className="w-full py-2.5 text-sm" />
        </div>
      </div>

      {/* Modals */}
      <ReviewFormModal isOpen={showReviewForm} onClose={() => setShowReviewForm(false)} firm={firm} onSuccess={() => { fetchFirmReviews(firm.id); setShowReviewForm(false); }} />
      <IncidentFormModal isOpen={showIncidentForm} onClose={() => setShowIncidentForm(false)} firm={firm} onSuccess={() => { fetchIncidents(firm.id); setShowIncidentForm(false); }} />
      
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
    </MobileLayout>
  );
}