// components/reviews/MobileReviewsPage.tsx - COMPLETE WITH REGION AWARENESS

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useRegion } from '@/contexts/RegionContext';
import { useUser } from '@/contexts/UserContext';
import MobileLayout from '@/components/mobile/MobileLayout';
import TrustScoreBadge from '@/components/ui/TrustScoreBadge';
import { 
  Star, Search, MessageCircle, ThumbsUp, Share2, Copy, Check,
  AlertTriangle, Clock, CheckCircle, XCircle, Activity, Target,
  Smartphone, AlertCircle, Flag, Plus, X, Send, Eye, Users,
  DollarSign, CreditCard, Shield, Building2, Award, Sparkles,
  ChevronDown, ChevronUp, Filter, Calendar, Reply, ImagePlus,
  Paperclip, MoreVertical, Trash2, Edit, ChevronLeft, ChevronRight, Loader2,
  Globe
} from 'lucide-react';

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

// Region availability helper
const isAvailableInRegion = (firm: any, region: string) => {
  if (!firm) return false;
  if (firm.regions) {
    return firm.regions.includes(region) || 
           firm.regions.includes('GLOBAL') ||
           firm.regions.length === 0;
  }
  if (firm.region) {
    return firm.region === region || firm.region === 'GLOBAL';
  }
  return true;
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

// Star rating component
function StarRating({ rating, size = "sm", readonly = true }: { 
  rating: number; 
  size?: "sm" | "md"; 
  readonly?: boolean 
}) {
  const sizes = { sm: "w-3.5 h-3.5", md: "w-5 h-5" };
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sizes[size]} ${i <= Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}`}
        />
      ))}
    </div>
  );
}

// Lightbox Modal Component for Mobile
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
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-xs">
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
        {images[currentIndex].match(/\.(mp4|webm|mov)$/i) ? (
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
    </motion.div>
  );
}

// Reply Thread Component for Mobile - WITH OPTIMISTIC UPDATES
function ReplyThread({ reply, onReply, onLoadReplies, onOpenLightbox, depth = 0, currentUser, reviewId }: { 
  reply: any; 
  onReply: (parentId: string, content: string, mediaFiles: File[]) => Promise<boolean>;
  onLoadReplies: (replyId: string) => Promise<any[]>;
  onOpenLightbox: (images: string[], index: number) => void;
  depth?: number;
  currentUser: any;
  reviewId: string;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyMedia, setReplyMedia] = useState<File[]>([]);
  const [childReplies, setChildReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localReplyCount, setLocalReplyCount] = useState(reply.replyCount);
  const maxDepth = 3;

  useEffect(() => {
    setLocalReplyCount(reply.replyCount);
  }, [reply.replyCount]);

  const handleSubmitReply = async () => {
    if (!replyContent.trim() && replyMedia.length === 0) return;
    if (submitting) return;
    
    setSubmitting(true);
    
    // Create optimistic reply
    const optimisticReply = {
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
    
    try {
      const success = await onReply(reply.id, replyContent, replyMedia);
      if (success) {
        // Refresh to get real reply
        const children = await onLoadReplies(reply.id);
        setChildReplies(children);
        setLocalReplyCount(children.length);
      } else {
        // Remove optimistic reply on failure
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

  const loadReplies = async () => {
    if (childReplies.length === 0 && !showReplies) {
      setLoading(true);
      const children = await onLoadReplies(reply.id);
      setChildReplies(children);
      setLoading(false);
    }
    setShowReplies(!showReplies);
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
    <div className={`ml-${depth > 0 ? '6' : '0'} mt-3`}>
      <div className={`p-3 rounded-xl ${styles.bg} border ${styles.border}`}>
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${generateGradient(reply.user?.name || reply.broker?.name || reply.propFirm?.name || 'Reply')} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
            {(reply.user?.name?.charAt(0) || reply.broker?.name?.charAt(0) || reply.propFirm?.name?.charAt(0) || 'U').toUpperCase()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-white text-sm">
                {reply.user?.name || reply.broker?.name || reply.propFirm?.name || 'Anonymous'}
              </span>
              {reply.replyType !== 'USER' && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${styles.text} ${styles.bg} border ${styles.border}`}>
                  {styles.label}
                </span>
              )}
              <span className="text-xs text-zinc-500">
                {new Date(reply.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-zinc-300 text-xs mt-1 break-words">{reply.content}</p>
            
            {/* Media Gallery */}
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
                      <Eye size={12} className="text-white" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Actions */}
            <div className="flex items-center gap-3 mt-2">
              {depth < maxDepth && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-xs text-zinc-500 hover:text-purple-400 transition-colors flex items-center gap-1"
                >
                  <Reply size={10} /> Reply
                </button>
              )}
              {localReplyCount > 0 && (
                <button
                  onClick={loadReplies}
                  className="text-xs text-zinc-500 hover:text-purple-400 transition-colors flex items-center gap-1"
                >
                  <MessageCircle size={10} />
                  {showReplies ? 'Hide' : `View ${localReplyCount} replies`}
                </button>
              )}
            </div>
            
            {/* Reply Form */}
            {showReplyForm && (
              <div className="mt-3">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
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
                  <div className="flex gap-2">
                    <label className="cursor-pointer p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors">
                      <ImagePlus size={14} className="text-zinc-400" />
                      <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => {
                        if (e.target.files) setReplyMedia(Array.from(e.target.files));
                      }} />
                    </label>
                    {replyMedia.length > 0 && (
                      <span className="text-xs text-green-400">{replyMedia.length} file(s)</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowReplyForm(false)}
                      className="px-3 py-1 rounded-lg bg-zinc-700 text-white text-xs"
                    >
                      Cancel
                    </button>
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
      
      {/* Child Replies */}
      {showReplies && (
        <div className="mt-2">
          {loading ? (
            <div className="ml-6 mt-2 p-3 text-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500 mx-auto"></div>
            </div>
          ) : (
            childReplies.map((childReply) => (
              <ReplyThread
                key={childReply.id}
                reply={childReply}
                onReply={onReply}
                onLoadReplies={onLoadReplies}
                onOpenLightbox={onOpenLightbox}
                depth={depth + 1}
                currentUser={currentUser}
                reviewId={reviewId}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Incident Types
const incidentTypes = [
  { value: 'WITHDRAWAL_PAID', label: 'Withdrawal Paid', icon: CheckCircle, color: 'text-green-400' },
  { value: 'WITHDRAWAL_DELAY', label: 'Withdrawal Delay', icon: Clock, color: 'text-orange-400' },
  { value: 'WITHDRAWAL_REJECTED', label: 'Withdrawal Rejected', icon: XCircle, color: 'text-red-400' },
  { value: 'SLIPPAGE_ISSUES', label: 'Slippage Issues', icon: Activity, color: 'text-yellow-400' },
  { value: 'SPREAD_SPIKE', label: 'Spread Spike', icon: Target, color: 'text-orange-400' },
  { value: 'EXECUTION_DELAY', label: 'Execution Delay', icon: Clock, color: 'text-yellow-400' },
  { value: 'PLATFORM_FREEZE', label: 'Platform Freeze', icon: Smartphone, color: 'text-purple-400' },
  { value: 'SERVER_DOWN', label: 'Server Down', icon: XCircle, color: 'text-red-400' },
  { value: 'ACCOUNT_SUSPENDED', label: 'Account Suspended', icon: AlertTriangle, color: 'text-orange-400' },
  { value: 'SCAM_WARNING', label: 'Scam Warning', icon: AlertCircle, color: 'text-red-400' },
];

export default function MobileReviewsPage() {
  const { user } = useUser();
  const { region } = useRegion(); // ✅ ADDED REGION
  const router = useRouter();
  
  const [brokersData, setBrokersData] = useState<any[]>([]);
  const [propFirmsData, setPropFirmsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  
  // Filters
  const [filterType, setFilterType] = useState<'broker' | 'propFirm'>('broker');
  const [filterName, setFilterName] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'mostHelpful'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeTab, setActiveTab] = useState<'reviews' | 'incidents'>('reviews');
  const [incidents, setIncidents] = useState<any[]>([]);
  const [incidentsLoading, setIncidentsLoading] = useState(false);
  const [incidentPagination, setIncidentPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [incidentDays, setIncidentDays] = useState(30);
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  
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
  
  // Review form state
  const [reviewFormType, setReviewFormType] = useState<'broker' | 'propFirm'>('broker');
  const [firmSearch, setFirmSearch] = useState('');
  const [firmDropdownOpen, setFirmDropdownOpen] = useState(false);
  const [selectedFirmId, setSelectedFirmId] = useState<number | null>(null);
  const [selectedFirmName, setSelectedFirmName] = useState('');
  const [selectedFirmLogo, setSelectedFirmLogo] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    content: '',
    rating: 0,
    platformStability: 0,
    executionQuality: 0,
    withdrawalExperience: 0,
    customerSupport: 0,
    reliability: 0,
    withdrawalSpeed: '',
    wouldRecommend: '',
    verifiedTrader: false
  });
  const [formErrors, setFormErrors] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Incident form state
  const [incidentType, setIncidentType] = useState<'broker' | 'propFirm'>('broker');
  const [incidentFirmSearch, setIncidentFirmSearch] = useState('');
  const [incidentFirmDropdownOpen, setIncidentFirmDropdownOpen] = useState(false);
  const [selectedIncidentFirmId, setSelectedIncidentFirmId] = useState<number | null>(null);
  const [selectedIncidentFirmName, setSelectedIncidentFirmName] = useState('');
  const [incidentForm, setIncidentForm] = useState({
    incidentType: '',
    title: '',
    description: '',
    incidentDate: new Date().toISOString().split('T')[0],
    withdrawalAmount: '',
    withdrawalMethod: '',
  });
  const [incidentSubmitting, setIncidentSubmitting] = useState(false);
  const [incidentError, setIncidentError] = useState('');
  const [incidentSuccess, setIncidentSuccess] = useState(false);
  
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);
  const [copiedReviewId, setCopiedReviewId] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const incidentDropdownRef = useRef<HTMLDivElement>(null);

  // Get region info for display
  const regionInfo = REGION_DISPLAY[region] || REGION_DISPLAY['GLOBAL'];

  // Fetch replies when reply section is opened
  useEffect(() => {
    const reviewIds = Object.keys(showReplySection).filter(id => showReplySection[id] && !repliesCache[id]);
    reviewIds.forEach(async (reviewId) => {
      await fetchReplies(reviewId);
    });
  }, [showReplySection]);

  // Fetch data with region
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [brokersRes, propFirmsRes] = await Promise.all([
          api.getBrokers(region), // ✅ ADDED region
          api.getPropFirms(region) // ✅ ADDED region
        ]);
        if (brokersRes.success) setBrokersData(brokersRes.data || []);
        if (propFirmsRes.success) setPropFirmsData(propFirmsRes.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [region]); // ✅ ADDED region dependency

  // Fetch reviews
  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort: sortBy,
        type: filterType,
        ...(filterName && { firmName: filterName }),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/reviews?${params}`);
      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews || []);
        setPagination(data.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
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

  // Fetch replies for a review (top-level)
  const fetchReplies = async (reviewId: string): Promise<any[]> => {
    return fetchRepliesForParent(reviewId, null);
  };

  // Submit a reply with optimistic update support
  const submitReply = async (reviewId: string, parentId: string | null, content: string, mediaFiles: File[]): Promise<boolean> => {
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
      
      if (response.ok) {
        // Clear cache for this parent
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
  const handleSubmitReply = async (reviewId: string, parentId: string | null = null, content: string, mediaFiles: File[]) => {
    return submitReply(reviewId, parentId, content, mediaFiles);
  };

  // Handle opening lightbox
  const handleOpenLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Fetch incidents
  const fetchIncidents = async () => {
    setIncidentsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', incidentPagination.page.toString());
      params.append('limit', incidentPagination.limit.toString());
      
      if (incidentDays > 0) {
        params.append('days', incidentDays.toString());
      }
      
      if (filterName) {
        const selectedFirm = allFirms[filterType].find(f => f.name === filterName);
        if (selectedFirm) {
          params.append('entityType', filterType);
          params.append('entityId', selectedFirm.id.toString());
        }
      }

      const response = await fetch(`/api/incidents?${params}`);
      const data = await response.json();

      if (response.ok) {
        const incidentsWithNames = (data.incidents || []).map((incident: any) => {
          if (!incident.entityName && incident.entityType === 'broker') {
            const broker = brokersData.find(b => b.id === incident.entityId);
            if (broker) incident.entityName = broker.name;
          } else if (!incident.entityName && incident.entityType === 'propFirm') {
            const propFirm = propFirmsData.find(p => p.id === incident.entityId);
            if (propFirm) incident.entityName = propFirm.name;
          }
          return incident;
        });
        
        setIncidents(incidentsWithNames);
        setIncidentPagination(data.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setIncidentsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filterType, filterName, sortBy, pagination.page, searchQuery]);

  useEffect(() => {
    if (activeTab === 'incidents') {
      setIncidentPagination(prev => ({ ...prev, page: 1 }));
      fetchIncidents();
    }
  }, [activeTab, filterType, filterName, incidentDays, incidentPagination.page]);

  const allFirms = {
    broker: brokersData.map((b) => ({ id: b.id, name: b.name, logo: b.logo })),
    propFirm: propFirmsData.map((c) => ({ id: c.id, name: c.name, logo: c.logo })),
  };

  const filteredFirms = allFirms[reviewFormType].filter((f) =>
    f.name.toLowerCase().includes(firmSearch.toLowerCase())
  );

  const incidentFilteredFirms = allFirms[incidentType].filter((f) =>
    f.name.toLowerCase().includes(incidentFirmSearch.toLowerCase())
  );

  const selectFirm = (firm: any) => {
    setSelectedFirmId(firm.id);
    setSelectedFirmName(firm.name);
    setSelectedFirmLogo(firm.logo);
    setFirmSearch(firm.name);
    setFirmDropdownOpen(false);
  };

  const selectIncidentFirm = (firm: any) => {
    setSelectedIncidentFirmId(firm.id);
    setSelectedIncidentFirmName(firm.name);
    setIncidentFirmSearch(firm.name);
    setIncidentFirmDropdownOpen(false);
  };

  const onRatingChange = (name: string, value: number) => {
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!selectedFirmId) {
      setFormErrors('Please select a firm!');
      return;
    }
    
    if (!form.title.trim()) {
      setFormErrors('Please add a review title!');
      return;
    }
    
    if (!form.content.trim()) {
      setFormErrors('Please write a review!');
      return;
    }

    setSubmitting(true);
    setFormErrors('');

    try {
      const payload: any = {
        title: form.title,
        content: form.content,
        rating: 3,
      };

      if (reviewFormType === 'broker') {
        payload.brokerId = selectedFirmId;
      } else {
        payload.propFirmId = selectedFirmId;
      }
      
      if (form.platformStability > 0) payload.platformStability = form.platformStability;
      if (form.executionQuality > 0) payload.executionQuality = form.executionQuality;
      if (form.withdrawalExperience > 0) payload.withdrawalExperience = form.withdrawalExperience;
      if (form.customerSupport > 0) payload.customerSupport = form.customerSupport;
      if (form.reliability > 0) payload.reliability = form.reliability;
      if (form.withdrawalSpeed) payload.withdrawalSpeed = form.withdrawalSpeed;
      if (form.wouldRecommend) payload.wouldRecommend = form.wouldRecommend;
      if (form.verifiedTrader) payload.verifiedTrader = form.verifiedTrader;

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setForm({
        title: '',
        content: '',
        rating: 0,
        platformStability: 0,
        executionQuality: 0,
        withdrawalExperience: 0,
        customerSupport: 0,
        reliability: 0,
        withdrawalSpeed: '',
        wouldRecommend: '',
        verifiedTrader: false
      });
      setFirmSearch('');
      setSelectedFirmId(null);
      setSelectedFirmName('');
      setSelectedFirmLogo(null);
      setShowReviewForm(false);
      fetchReviews();
      
    } catch (error: any) {
      setFormErrors(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) { 
      setIncidentError('Please login to report an incident');
      return; 
    }
    
    if (!selectedIncidentFirmId) { 
      setIncidentError('Please select a firm!'); 
      return; 
    }
    
    if (!incidentForm.incidentType) { 
      setIncidentError('Please select an incident type!'); 
      return; 
    }
    
    if (!incidentForm.title.trim()) { 
      setIncidentError('Please add a title!'); 
      return; 
    }
    
    if (!incidentForm.description.trim()) { 
      setIncidentError('Please describe the incident!'); 
      return; 
    }

    setIncidentSubmitting(true);
    setIncidentError('');
    setIncidentSuccess(false);

    try {
      const payload: any = {
        entityType: incidentType,
        entityId: selectedIncidentFirmId,
        incidentType: incidentForm.incidentType,
        title: incidentForm.title.trim(),
        description: incidentForm.description.trim(),
        incidentDate: new Date(incidentForm.incidentDate).toISOString(),
      };

      if (incidentForm.withdrawalAmount && parseFloat(incidentForm.withdrawalAmount) > 0) {
        payload.withdrawalAmount = parseFloat(incidentForm.withdrawalAmount);
      }
      
      if (incidentForm.withdrawalMethod) {
        payload.withdrawalMethod = incidentForm.withdrawalMethod;
      }

      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit incident');
      }

      setIncidentSuccess(true);
      
      setIncidentForm({
        incidentType: '',
        title: '',
        description: '',
        incidentDate: new Date().toISOString().split('T')[0],
        withdrawalAmount: '',
        withdrawalMethod: '',
      });
      setIncidentFirmSearch('');
      setSelectedIncidentFirmId(null);
      setSelectedIncidentFirmName('');
      setIncidentType('broker');
      
      setTimeout(() => {
        setShowIncidentForm(false);
        setIncidentSuccess(false);
        fetchIncidents();
      }, 2000);
      
    } catch (error: any) {
      setIncidentError(error.message);
    } finally {
      setIncidentSubmitting(false);
    }
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
        setReviews(reviews.map(review => 
          review.id === reviewId 
            ? { ...review, helpfulCount: data.helpfulCount }
            : review
        ));
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const shareReview = (review: any) => {
    const shareUrl = `${window.location.origin}/reviews/${review.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedReviewId(review.id);
    setTimeout(() => setCopiedReviewId(null), 2000);
  };

  const toggleReviewExpand = (reviewId: string) => {
    setExpandedReviewId(expandedReviewId === reviewId ? null : reviewId);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setFirmDropdownOpen(false);
      }
      if (incidentDropdownRef.current && !incidentDropdownRef.current.contains(event.target as Node)) {
        setIncidentFirmDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalReviews = pagination.total;
  const totalIncidents = incidentPagination.total;

  // Show empty state if no brokers/prop firms in region
  if (!loading && brokersData.length === 0 && propFirmsData.length === 0) {
    const nearbyRegions: Record<string, { key: string; label: string; flag: string }[]> = {
      'SA': [
        { key: 'KE', label: 'Kenya', flag: '🇰🇪' },
        { key: 'UAE', label: 'UAE', flag: '🇦🇪' },
        { key: 'GLOBAL', label: 'Global', flag: '🌍' }
      ],
      'EU': [
        { key: 'UK', label: 'United Kingdom', flag: '🇬🇧' },
        { key: 'UAE', label: 'UAE', flag: '🇦🇪' },
        { key: 'GLOBAL', label: 'Global', flag: '🌍' }
      ],
      'UK': [
        { key: 'EU', label: 'Europe', flag: '🇪🇺' },
        { key: 'UAE', label: 'UAE', flag: '🇦🇪' },
        { key: 'GLOBAL', label: 'Global', flag: '🌍' }
      ],
      'UAE': [
        { key: 'SA', label: 'South Africa', flag: '🇿🇦' },
        { key: 'KE', label: 'Kenya', flag: '🇰🇪' },
        { key: 'GLOBAL', label: 'Global', flag: '🌍' }
      ],
      'KE': [
        { key: 'SA', label: 'South Africa', flag: '🇿🇦' },
        { key: 'UAE', label: 'UAE', flag: '🇦🇪' },
        { key: 'GLOBAL', label: 'Global', flag: '🌍' }
      ],
    };

    const suggestions = nearbyRegions[region] || [{ key: 'GLOBAL', label: 'Global', flag: '🌍' }];

    return (
      <MobileLayout title="Reviews" showSearch={false}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <Globe size={48} className="text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            No reviews in {regionInfo.flag} {regionInfo.label}
          </h2>
          <p className="text-zinc-400 text-sm mb-4">
            We don't have any brokers or prop firms available in {regionInfo.flag} {regionInfo.label} yet.
          </p>
          
          <div className="bg-zinc-900/50 rounded-xl p-4 mb-6 border border-zinc-800">
            <p className="text-sm text-zinc-400 mb-3">Try these regions instead:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.key}
                  onClick={() => {
                    const { setRegion } = useRegion();
                    setRegion(suggestion.key);
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-white transition-all duration-200 hover:scale-105"
                >
                  {suggestion.flag} {suggestion.label}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={() => {
              const { setRegion } = useRegion();
              setRegion('GLOBAL');
            }}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
          >
            View All Global Reviews
          </button>
        </div>
      </MobileLayout>
    );
  }

  if (loading) {
    return (
      <MobileLayout title="Reviews" showSearch={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" /><p className="text-xs text-zinc-500 mt-3">Loading reviews...</p></div>
        </div>
      </MobileLayout>
    );
  }

  // Function to get firm data for logo display - with region awareness
  const getFirmForLogo = (review: any) => {
    if (review.entityType === 'broker') {
      const broker = brokersData.find(b => b.id === review.entityId);
      return broker || { name: review.entityName, logo: null };
    } else {
      const propFirm = propFirmsData.find(p => p.id === review.entityId);
      return propFirm || { name: review.entityName, logo: null };
    }
  };

  return (
    <MobileLayout title="Reviews" showSearch={false}>
      {/* ❌ REGION BANNER REMOVED - Users select region in navbar */}

      <div className="space-y-4 pb-6">
        
        {/* Hero Stats */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-4 border border-purple-500/30">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{totalReviews}</div>
              <div className="text-xs text-zinc-400">Reviews</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">{totalIncidents}</div>
              <div className="text-xs text-zinc-400">Incidents</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => user ? setShowReviewForm(true) : router.push('/login')}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Write Review
          </button>
          <button
            onClick={() => user ? setShowIncidentForm(true) : router.push('/login')}
            className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2"
          >
            <AlertTriangle size={16} /> Report
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900/50 rounded-xl p-1 border border-zinc-800">
          <button onClick={() => { setActiveTab('reviews'); setIncidentPagination(prev => ({ ...prev, page: 1 })); }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'reviews' ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg" : "text-zinc-400"}`}>
            📝 Reviews
          </button>
          <button onClick={() => { setActiveTab('incidents'); setPagination(prev => ({ ...prev, page: 1 })); }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'incidents' ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg" : "text-zinc-400"}`}>
            ⚠️ Incidents
          </button>
        </div>

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <>
            {/* Filters */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <select
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm"
                  value={filterType}
                  onChange={(e) => { setFilterType(e.target.value as any); setFilterName(''); }}
                >
                  <option value="broker">Brokers</option>
                  <option value="propFirm">Prop Firms</option>
                </select>
                
                <select
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                >
                  <option value="">All {filterType === 'broker' ? 'Brokers' : 'Prop Firms'}</option>
                  {allFirms[filterType].slice(0, 20).map((firm) => (
                    <option key={firm.id} value={firm.name}>{firm.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-2">
                <select
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="newest">Newest First</option>
                  <option value="highest">Highest Rated</option>
                  <option value="most-helpful">Most Helpful</option>
                </select>
                
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                  <input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Reviews List */}
            {reviewsLoading ? (
              <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" /></div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <MessageCircle size={32} className="text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">No reviews found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => {
                  const topLevelReplies = repliesCache[review.id] || [];
                  const firmData = getFirmForLogo(review);
                  
                  return (
                    <div key={review.id} className="bg-zinc-900/80 rounded-xl border border-zinc-800 overflow-hidden">
                      <div className="p-4">
                        {/* Header with Logo */}
                        <div className="flex items-start gap-3 mb-3">
                          <FirmLogo item={firmData} size="sm" />
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-sm">{review.entityName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <StarRating rating={review.rating || 3} size="sm" />
                              <span className="text-xs text-zinc-500">by {review.user?.name || 'Anonymous'}</span>
                            </div>
                          </div>
                          {review.trustScore && <TrustScoreBadge score={review.trustScore} size="sm" />}
                        </div>
                        
                        {/* Content */}
                        <h4 className="text-white font-semibold text-sm mb-2">{review.title}</h4>
                        <p className="text-zinc-300 text-xs leading-relaxed">
                          {expandedReviewId === review.id ? review.content : `${review.content?.substring(0, 150)}${review.content?.length > 150 ? '...' : ''}`}
                        </p>
                        {review.content?.length > 150 && expandedReviewId !== review.id && (
                          <button onClick={() => toggleReviewExpand(review.id)} className="text-purple-400 text-xs mt-1">Read more</button>
                        )}
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mt-3">
                          {review.wouldRecommend === 'Yes' && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Recommended</span>}
                          {review.verifiedTrader && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Verified</span>}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-4 mt-3 pt-2 border-t border-zinc-800">
                          <button onClick={() => markHelpful(review.id, 'HELPFUL')} className={`flex items-center gap-1 text-xs ${userVotes[review.id] === 'HELPFUL' ? 'text-green-400' : 'text-zinc-500'}`}>
                            <ThumbsUp size={12} /> Helpful ({review.helpfulCount || 0})
                          </button>
                          <button onClick={() => shareReview(review)} className="flex items-center gap-1 text-xs text-zinc-500">
                            {copiedReviewId === review.id ? <Check size={12} className="text-green-400" /> : <Share2 size={12} />} Share
                          </button>
                          <button
                            onClick={async () => {
                              const isOpen = showReplySection[review.id];
                              setShowReplySection(prev => ({ ...prev, [review.id]: !isOpen }));
                              if (!isOpen && !repliesCache[review.id]) {
                                const replies = await fetchRepliesForParent(review.id, null);
                                setRepliesCache(prev => ({ ...prev, [review.id]: replies }));
                              }
                            }}
                            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-green-400 transition-colors"
                          >
                            <MessageCircle size={12} /> 
                            Comments {review.replyCount > 0 && `(${review.replyCount})`}
                          </button>
                        </div>
                      </div>

                      {/* Reply Section */}
                      {showReplySection[review.id] && (
                        <div className="border-t border-zinc-800 p-4 bg-zinc-900/50">
                          {topLevelReplies.map((reply) => (
                            <ReplyThread
                              key={reply.id}
                              reply={reply}
                              onReply={(parentId, content, mediaFiles) => submitReply(review.id, parentId, content, mediaFiles)}
                              onLoadReplies={(replyId) => fetchRepliesForParent(review.id, replyId)}
                              onOpenLightbox={handleOpenLightbox}
                              currentUser={user}
                              reviewId={review.id}
                            />
                          ))}
                          
                          {/* New Reply Form */}
                          <div className="mt-3 flex gap-3">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${generateGradient(user?.name || 'User')} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
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
                                    <span className="text-xs text-green-400">{replyMedia.length} file(s)</span>
                                  )}
                                </div>
                                {replyingToReview === review.id && (replyContent.trim() || replyMedia.length > 0) && (
                                  <button
                                    onClick={async () => {
                                      setReplySubmitting(true);
                                      const success = await submitReply(review.id, null, replyContent, replyMedia);
                                      if (success) {
                                        setReplyContent('');
                                        setReplyMedia([]);
                                        setReplyingToReview(null);
                                        const freshReplies = await fetchRepliesForParent(review.id, null);
                                        setRepliesCache(prev => ({ ...prev, [review.id]: freshReplies }));
                                      }
                                      setReplySubmitting(false);
                                    }}
                                    disabled={replySubmitting}
                                    className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs disabled:opacity-50"
                                  >
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
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 py-2">
                <button disabled={pagination.page === 1} onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-xs disabled:opacity-50">Prev</button>
                <span className="px-3 py-1.5 text-zinc-400 text-xs">{pagination.page} / {pagination.pages}</span>
                <button disabled={pagination.page === pagination.pages} onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-xs disabled:opacity-50">Next</button>
              </div>
            )}
          </>
        )}

        {/* INCIDENTS TAB */}
        {activeTab === 'incidents' && (
          <>
            {/* Filters */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <select
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm"
                  value={filterType}
                  onChange={(e) => { setFilterType(e.target.value as any); setFilterName(''); }}
                >
                  <option value="broker">Brokers</option>
                  <option value="propFirm">Prop Firms</option>
                </select>
                
                <select
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                >
                  <option value="">All {filterType === 'broker' ? 'Brokers' : 'Prop Firms'}</option>
                  {allFirms[filterType].slice(0, 20).map((firm) => (
                    <option key={firm.id} value={firm.name}>{firm.name}</option>
                  ))}
                </select>
              </div>
              
              <select
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm"
                value={incidentDays}
                onChange={(e) => {
                  setIncidentDays(parseInt(e.target.value));
                  setIncidentPagination(prev => ({ ...prev, page: 1 }));
                }}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
                <option value="0">All time</option>
              </select>
            </div>

            {/* Incident Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-500/10 rounded-xl p-3 text-center border border-red-500/20">
                <AlertTriangle size={16} className="text-red-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-white">{incidents.filter(i => i.resolutionStatus === 'PENDING').length}</div>
                <div className="text-[10px] text-zinc-500">Unresolved</div>
              </div>
              <div className="bg-green-500/10 rounded-xl p-3 text-center border border-green-500/20">
                <CheckCircle size={16} className="text-green-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-white">{incidents.filter(i => i.resolutionStatus === 'RESOLVED').length}</div>
                <div className="text-[10px] text-zinc-500">Resolved</div>
              </div>
            </div>

            {/* Incidents List */}
            {incidentsLoading ? (
              <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" /></div>
            ) : incidents.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <Shield size={32} className="text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">No incidents reported</p>
              </div>
            ) : (
              <div className="space-y-3">
                {incidents.map((incident) => {
                  const typeInfo = incidentTypes.find(t => t.value === incident.incidentType);
                  const IconComponent = typeInfo?.icon || AlertTriangle;
                  const typeColor = typeInfo?.color || 'text-red-400';
                  
                  let entityName = incident.entityName;
                  let entityLogo = null;
                  if (!entityName && incident.entityType === 'broker') {
                    const broker = brokersData.find(b => b.id === incident.entityId);
                    entityName = broker?.name || 'Unknown';
                    entityLogo = broker?.logo || null;
                  } else if (!entityName && incident.entityType === 'propFirm') {
                    const propFirm = propFirmsData.find(p => p.id === incident.entityId);
                    entityName = propFirm?.name || 'Unknown';
                    entityLogo = propFirm?.logo || null;
                  }
                  
                  const firmData = { name: entityName, logo: entityLogo };
                  
                  return (
                    <div key={incident.id} className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <FirmLogo item={firmData} size="sm" />
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-sm">{entityName}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <IconComponent size={12} className={typeColor} />
                            <span className="text-xs text-zinc-500">{incident.incidentType?.replace(/_/g, ' ')}</span>
                          </div>
                        </div>
                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${incident.resolutionStatus === 'RESOLVED' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {incident.resolutionStatus || 'PENDING'}
                        </div>
                      </div>
                      
                      <h4 className="text-white font-semibold text-sm mb-2">{incident.title}</h4>
                      <p className="text-zinc-300 text-xs leading-relaxed mb-3">{incident.description}</p>
                      
                      <div className="flex flex-wrap gap-3 text-[10px] text-zinc-500">
                        <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(incident.incidentDate || incident.createdAt).toLocaleDateString()}</span>
                        {incident.withdrawalAmount && <span className="flex items-center gap-1"><DollarSign size={10} /> ${incident.withdrawalAmount}</span>}
                        <span className="flex items-center gap-1"><Users size={10} /> {incident.confirmations || 0} confirmations</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {incidentPagination.pages > 1 && (
              <div className="flex justify-center gap-2 py-2">
                <button disabled={incidentPagination.page === 1} onClick={() => setIncidentPagination({ ...incidentPagination, page: incidentPagination.page - 1 })} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-xs disabled:opacity-50">Prev</button>
                <span className="px-3 py-1.5 text-zinc-400 text-xs">{incidentPagination.page} / {incidentPagination.pages}</span>
                <button disabled={incidentPagination.page === incidentPagination.pages} onClick={() => setIncidentPagination({ ...incidentPagination, page: incidentPagination.page + 1 })} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-xs disabled:opacity-50">Next</button>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="text-center text-[10px] text-zinc-600 py-4">Data is community-reported and verified.</div>
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

      {/* Review Form Modal */}
      <AnimatePresence>
        {showReviewForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowReviewForm(false)} />
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="p-5 border-b border-zinc-800 bg-gradient-to-r from-purple-600/20 to-pink-600/20">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold text-lg">Write a Review</h3>
                    <button onClick={() => setShowReviewForm(false)} className="p-1"><X size={20} className="text-zinc-400" /></button>
                  </div>
                </div>
                
                <form onSubmit={submitReview} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Type Selection */}
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">What are you reviewing?</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setReviewFormType('broker'); setSelectedFirmId(null); setSelectedFirmName(''); setSelectedFirmLogo(null); setFirmSearch(''); }} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${reviewFormType === 'broker' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>Broker</button>
                      <button type="button" onClick={() => { setReviewFormType('propFirm'); setSelectedFirmId(null); setSelectedFirmName(''); setSelectedFirmLogo(null); setFirmSearch(''); }} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${reviewFormType === 'propFirm' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>Prop Firm</button>
                    </div>
                  </div>
                  
                  {/* Firm Selection with Logo */}
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Select Firm *</label>
                    <div className="relative" ref={dropdownRef}>
                      <input type="text" value={firmSearch} onChange={(e) => { setFirmSearch(e.target.value); setFirmDropdownOpen(true); setSelectedFirmId(null); setSelectedFirmName(''); setSelectedFirmLogo(null); }} onFocus={() => setFirmDropdownOpen(true)} placeholder={`Search ${reviewFormType === 'broker' ? 'broker' : 'prop firm'}...`} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm" />
                      {firmDropdownOpen && filteredFirms.length > 0 && (
                        <div className="absolute z-20 mt-2 max-h-48 w-full overflow-auto rounded-xl border border-zinc-700 bg-zinc-900">
                          {filteredFirms.map((firm) => (
                            <div key={firm.id} onClick={() => selectFirm(firm)} className="px-4 py-2 hover:bg-purple-600 cursor-pointer border-b border-zinc-800 flex items-center gap-3">
                              <FirmLogo item={firm} size="sm" />
                              <div className="text-white text-sm">{firm.name}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedFirmName && (
                      <div className="flex items-center gap-2 mt-1">
                        {selectedFirmLogo && (
                          <img src={selectedFirmLogo} alt={selectedFirmName} className="w-6 h-6 rounded object-cover" />
                        )}
                        <span className="text-xs text-green-400">✓ Selected: {selectedFirmName}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Ratings */}
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Rate Your Experience</label>
                    <div className="space-y-3">
                      {[
                        { key: 'platformStability', label: 'Platform', icon: Smartphone },
                        { key: 'executionQuality', label: 'Execution', icon: Target },
                        { key: 'withdrawalExperience', label: 'Withdrawal', icon: DollarSign },
                        { key: 'customerSupport', label: 'Support', icon: Users },
                        { key: 'reliability', label: 'Reliability', icon: Shield }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between">
                          <span className="text-xs text-zinc-400">{item.label}</span>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map(i => (
                              <button key={i} type="button" onClick={() => onRatingChange(item.key, i)} className={`w-8 h-8 rounded-lg text-sm ${form[item.key] >= i ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>{i}</button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Review Content */}
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Review Title *</label>
                    <input name="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm" placeholder="Summarize your experience" />
                  </div>
                  
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Your Experience *</label>
                    <textarea name="content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm resize-none" placeholder="Describe your experience..." />
                  </div>
                  
                  {formErrors && <div className="text-red-400 text-xs">{formErrors}</div>}
                  
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowReviewForm(false)} className="flex-1 py-3 bg-zinc-800 rounded-xl text-white text-sm">Cancel</button>
                    <button type="submit" disabled={!selectedFirmId || !form.title || !form.content || submitting} className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white text-sm font-medium disabled:opacity-50">Submit</button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Incident Form Modal */}
      <AnimatePresence>
        {showIncidentForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !incidentSubmitting && setShowIncidentForm(false)} />
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="p-5 border-b border-zinc-800 bg-gradient-to-r from-red-600/20 to-orange-600/20">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold text-lg">Report Incident</h3>
                    <button onClick={() => setShowIncidentForm(false)} className="p-1"><X size={20} className="text-zinc-400" /></button>
                  </div>
                </div>
                
                <form onSubmit={submitIncident} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setIncidentType('broker'); setSelectedIncidentFirmId(null); setSelectedIncidentFirmName(''); setIncidentFirmSearch(''); }} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${incidentType === 'broker' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>Broker</button>
                    <button type="button" onClick={() => { setIncidentType('propFirm'); setSelectedIncidentFirmId(null); setSelectedIncidentFirmName(''); setIncidentFirmSearch(''); }} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${incidentType === 'propFirm' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>Prop Firm</button>
                  </div>
                  
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Select Firm *</label>
                    <div className="relative" ref={incidentDropdownRef}>
                      <input type="text" value={incidentFirmSearch} onChange={(e) => { setIncidentFirmSearch(e.target.value); setIncidentFirmDropdownOpen(true); setSelectedIncidentFirmId(null); setSelectedIncidentFirmName(''); }} placeholder={`Search ${incidentType === 'broker' ? 'broker' : 'prop firm'}...`} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm" />
                      {incidentFirmDropdownOpen && incidentFilteredFirms.length > 0 && (
                        <div className="absolute z-20 mt-2 max-h-48 w-full overflow-auto rounded-xl border border-zinc-700 bg-zinc-900">
                          {incidentFilteredFirms.map((firm) => (
                            <div key={firm.id} onClick={() => selectIncidentFirm(firm)} className="px-4 py-2 hover:bg-purple-600 cursor-pointer border-b border-zinc-800 flex items-center gap-3">
                              <FirmLogo item={firm} size="sm" />
                              <div className="text-white text-sm">{firm.name}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedIncidentFirmName && <div className="text-xs text-green-400 mt-1">✓ Selected: {selectedIncidentFirmName}</div>}
                  </div>
                  
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Incident Type *</label>
                    <select value={incidentForm.incidentType} onChange={(e) => setIncidentForm({ ...incidentForm, incidentType: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm">
                      <option value="">Select type</option>
                      {incidentTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Title *</label>
                    <input value={incidentForm.title} onChange={(e) => setIncidentForm({ ...incidentForm, title: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm" placeholder="Brief summary" />
                  </div>
                  
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Description *</label>
                    <textarea rows={4} value={incidentForm.description} onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm resize-none" placeholder="Detailed description..." />
                  </div>
                  
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Incident Date *</label>
                    <input type="date" value={incidentForm.incidentDate} onChange={(e) => setIncidentForm({ ...incidentForm, incidentDate: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-zinc-400 mb-2 block">Withdrawal Amount</label>
                      <input type="number" value={incidentForm.withdrawalAmount} onChange={(e) => setIncidentForm({ ...incidentForm, withdrawalAmount: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm" placeholder="$0.00" />
                    </div>
                    <div>
                      <label className="text-sm text-zinc-400 mb-2 block">Withdrawal Method</label>
                      <select value={incidentForm.withdrawalMethod} onChange={(e) => setIncidentForm({ ...incidentForm, withdrawalMethod: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm">
                        <option value="">Select method</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Crypto">Crypto</option>
                        <option value="Card">Card</option>
                        <option value="Skrill">Skrill</option>
                        <option value="Neteller">Neteller</option>
                        <option value="PayPal">PayPal</option>
                      </select>
                    </div>
                  </div>
                  
                  {incidentError && <div className="text-red-400 text-xs">{incidentError}</div>}
                  
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowIncidentForm(false)} className="flex-1 py-3 bg-zinc-800 rounded-xl text-white text-sm">Cancel</button>
                    <button type="submit" disabled={!selectedIncidentFirmId || !incidentForm.incidentType || !incidentForm.title || !incidentForm.description || incidentSubmitting} className="flex-1 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl text-white text-sm font-medium disabled:opacity-50">Submit Report</button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </MobileLayout>
  );
}