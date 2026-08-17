'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRegion } from '@/contexts/RegionContext';
import { 
  Star, Search, Filter, ChevronDown, Users, MessageCircle, ThumbsUp, 
  Share2, Copy, Check, TrendingUp, Award, Zap, Shield, AlertCircle,
  X, Plus, Eye, Flag, ArrowLeft, Upload, Clock, AlertTriangle,
  ThumbsDown, CheckCircle, XCircle, Gauge, Wallet, CreditCard,
  Headphones, HeartHandshake, DollarSign, Flame, Gem, Info,
  Building2, RefreshCw, Percent, Rocket, Tag, Crown, GitCompare,
  Layers, Grid3x3, List, PlusCircle, MinusCircle, Maximize2, Minimize2,
  Activity, Smartphone, Laptop, BookOpen, Gift, Target, Scale, BadgeCheck,
  Sparkles, Send, Lock, SendIcon, Image, Video, Paperclip, Reply,
  MoreVertical, Trash2, Edit, ImagePlus, ChevronLeft, ChevronRight,
  Calendar, Loader2, Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useUser } from '@/contexts/UserContext';
import TrustScoreBadge from '@/components/ui/TrustScoreBadge';

// ===================== REGION DISPLAY =====================
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

// ===================== LOGO COMPONENT =====================
function FirmLogo({ firm, size = "md" }: { firm: any; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-10 h-10 rounded-xl text-sm",
    md: "w-12 h-12 rounded-xl text-base",
    lg: "w-14 h-14 rounded-xl text-lg"
  };
  
  const firmObj = typeof firm === 'string' ? { name: firm } : firm;
  
  if (firmObj.logo) {
    return (
      <div className={`${sizeClasses[size]} overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0 shadow-lg`}>
        <img 
          src={firmObj.logo} 
          alt={firmObj.name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const fallback = document.createElement('div');
              fallback.className = `${sizeClasses[size]} bg-gradient-to-r ${generateGradient(firmObj.name)} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`;
              fallback.textContent = firmObj.name?.charAt(0) || '?';
              parent.appendChild(fallback);
            }
          }}
        />
      </div>
    );
  }
  
  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-r ${generateGradient(firmObj.name)} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`}>
      {firmObj.name?.charAt(0) || '?'}
    </div>
  );
}

// Star rating component
function StarRating({ rating, setRating, size = "md", readonly = false }: { 
  rating: number; 
  setRating?: (rating: number) => void; 
  size?: "sm" | "md" | "lg"; 
  readonly?: boolean 
}) {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };

  return (
    <div className={`flex gap-1 ${readonly ? '' : 'cursor-pointer'}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sizes[size]} transition-all duration-200 ${
            i <= rating 
              ? 'text-yellow-400 fill-yellow-400' 
              : 'text-zinc-600 hover:text-yellow-400'
          }`}
          onClick={() => !readonly && setRating && setRating(i)}
        />
      ))}
    </div>
  );
}

// Function to generate gradient
const generateGradient = (name: string) => {
  const gradients = [
    "from-pink-500 to-purple-500",
    "from-blue-500 to-purple-500",
    "from-green-500 to-blue-500",
    "from-yellow-500 to-orange-500",
    "from-red-500 to-pink-500",
    "from-indigo-500 to-blue-500",
    "from-teal-500 to-green-500",
  ];
  const index = (name?.length || 0) % gradients.length;
  return gradients[index];
};

// Lightbox Modal Component
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
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black/50 px-3 py-1 rounded-full">
        Click outside to close
      </div>
    </motion.div>
  );
}

// Reply Thread Component
function ReplyThread({ reply, onReply, onLoadChildReplies, onOpenLightbox, depth = 0 }: { 
  reply: any; 
  onReply: (parentId: string, content: string, mediaFiles: File[]) => Promise<boolean>;
  onLoadChildReplies: (replyId: string) => Promise<any[]>;
  onOpenLightbox: (images: string[], index: number) => void;
  depth?: number;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyMedia, setReplyMedia] = useState<File[]>([]);
  const [childReplies, setChildReplies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      case 'BROKER': return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', label: 'Official Broker Response' };
      case 'PROP_FIRM': return { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', label: 'Official Prop Firm Response' };
      case 'ADMIN': return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', label: 'Admin Response' };
      default: return { bg: 'bg-zinc-800/50', border: 'border-zinc-700', text: 'text-zinc-400', label: 'User Comment' };
    }
  };

  const styles = getReplyTypeStyles();

  const removeFile = (index: number) => {
    setReplyMedia(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-3' : 'mt-3'}`}>
      <div className={`p-3 rounded-xl ${styles.bg} border ${styles.border}`}>
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${generateGradient(reply.user?.name || reply.broker?.name || reply.propFirm?.name || 'Reply')} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
            {(reply.user?.name?.charAt(0) || reply.broker?.name?.charAt(0) || reply.propFirm?.name?.charAt(0) || 'U').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-white text-sm">{reply.user?.name || reply.broker?.name || reply.propFirm?.name || 'Anonymous'}</span>
              {reply.replyType !== 'USER' && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${styles.text} ${styles.bg} border ${styles.border}`}>
                  {styles.label}
                </span>
              )}
              <span className="text-xs text-zinc-500">{new Date(reply.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-zinc-300 text-sm mt-1 break-words">{reply.content}</p>
            {reply.mediaUrls && reply.mediaUrls.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {reply.mediaUrls.map((url: string, idx: number) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden bg-zinc-800 cursor-pointer group" onClick={() => onOpenLightbox(reply.mediaUrls, idx)}>
                    <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye size={16} className="text-white" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3 mt-2">
              {depth < maxDepth && (
                <button onClick={() => setShowReplyForm(!showReplyForm)} className="text-xs text-zinc-500 hover:text-purple-400 transition-colors flex items-center gap-1">
                  <Reply size={10} /> Reply
                </button>
              )}
              {reply.replyCount > 0 && (
                <button onClick={handleToggleExpand} className="text-xs text-zinc-500 hover:text-purple-400 transition-colors flex items-center gap-1">
                  <MessageCircle size={10} />
                  {isExpanded ? 'Hide' : `View ${reply.replyCount} ${reply.replyCount === 1 ? 'reply' : 'replies'}`}
                </button>
              )}
            </div>
            {showReplyForm && (
              <div className="mt-3">
                <textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder={`Reply to ${reply.user?.name || 'user'}...`} className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" rows={2} />
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
                    <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => { if (e.target.files) setReplyMedia(Array.from(e.target.files)); }} />
                  </label>
                  <div className="flex gap-2">
                    <button onClick={() => setShowReplyForm(false)} className="px-3 py-1 rounded-lg bg-zinc-700 text-white text-xs">Cancel</button>
                    <button onClick={handleSubmitReply} disabled={(!replyContent.trim() && replyMedia.length === 0) || isSubmitting} className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs disabled:opacity-50 flex items-center gap-1">
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
            <div className="ml-8 mt-3 p-4 text-center">
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
  { value: 'LOGIN_ISSUES', label: 'Login Issues', icon: Lock, color: 'text-yellow-400' },
  { value: 'ACCOUNT_SUSPENDED', label: 'Account Suspended', icon: AlertTriangle, color: 'text-orange-400' },
  { value: 'ACCOUNT_BANNED', label: 'Account Banned', icon: AlertCircle, color: 'text-red-400' },
  { value: 'SCAM_WARNING', label: 'Scam Warning', icon: AlertCircle, color: 'text-red-400' },
];

export default function DesktopReviews() {
  const { user } = useUser();
  const { region } = useRegion();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [brokersData, setBrokersData] = useState<any[]>([]);
  const [propFirmsData, setPropFirmsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  
  const [filterType, setFilterType] = useState<'broker' | 'propFirm'>('broker');
  const [filterName, setFilterName] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'mostHelpful'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    minRating: null as number | null,
    verifiedOnly: false,
  });
  
  const [activeTab, setActiveTab] = useState<'reviews' | 'incidents'>('reviews');
  const [incidents, setIncidents] = useState<any[]>([]);
  const [incidentsLoading, setIncidentsLoading] = useState(false);
  const [incidentPagination, setIncidentPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [incidentDays, setIncidentDays] = useState(30);
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  
  const [reviewFormType, setReviewFormType] = useState<'broker' | 'propFirm'>('broker');
  const [firmSearch, setFirmSearch] = useState('');
  const [firmDropdownOpen, setFirmDropdownOpen] = useState(false);
  const [selectedFirmId, setSelectedFirmId] = useState<number | null>(null);
  const [selectedFirmName, setSelectedFirmName] = useState('');
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
  
  const [replyingToReview, setReplyingToReview] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyMedia, setReplyMedia] = useState<File[]>([]);
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [showReplySection, setShowReplySection] = useState<Record<string, boolean>>({});
  const [repliesCache, setRepliesCache] = useState<Record<string, any[]>>({});
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
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

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'incidents') {
      setActiveTab('incidents');
    }
  }, [searchParams]);

  useEffect(() => {
    const handleOpenLightbox = (e: CustomEvent) => {
      setLightboxImages(e.detail.images);
      setLightboxIndex(e.detail.index);
      setLightboxOpen(true);
    };
    window.addEventListener('openLightbox', handleOpenLightbox as EventListener);
    return () => window.removeEventListener('openLightbox', handleOpenLightbox as EventListener);
  }, []);

  // Fetch brokers and prop firms with region
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [brokersRes, propFirmsRes] = await Promise.all([
          api.getBrokers(region),
          api.getPropFirms(region)
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
  }, [region]);

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
        ...(filters.minRating && { minRating: filters.minRating.toString() }),
        ...(filters.verifiedOnly && { verified: 'true' })
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

  const handleOpenLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const fetchIncidents = async () => {
    setIncidentsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', incidentPagination.page.toString());
      params.append('limit', incidentPagination.limit.toString());
      if (incidentDays > 0) params.append('days', incidentDays.toString());
      
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
  }, [filterType, filterName, sortBy, pagination.page, filters, searchQuery]);

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

  const incidentFilteredFirms = [...allFirms.broker, ...allFirms.propFirm].filter((f) =>
    f.name.toLowerCase().includes(incidentFirmSearch.toLowerCase())
  );

  const selectFirm = (firm: any) => {
    setSelectedFirmId(firm.id);
    setSelectedFirmName(firm.name);
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
    if (!user) { router.push('/login'); return; }
    if (!selectedFirmId) { setFormErrors('Please select a firm!'); return; }
    if (!form.title.trim()) { setFormErrors('Please add a review title!'); return; }
    if (!form.content.trim()) { setFormErrors('Please write a review!'); return; }

    setSubmitting(true);
    setFormErrors('');

    try {
      const payload: any = {
        title: form.title,
        content: form.content,
        rating: form.rating || 3,
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
    if (!user) { setIncidentError('Please login to report an incident'); return; }
    if (!selectedIncidentFirmId) { setIncidentError('Please select a firm!'); return; }
    if (!incidentForm.incidentType) { setIncidentError('Please select an incident type!'); return; }
    if (!incidentForm.title.trim()) { setIncidentError('Please add a title!'); return; }
    if (!incidentForm.description.trim()) { setIncidentError('Please describe the incident!'); return; }

    setIncidentSubmitting(true);
    setIncidentError('');
    setIncidentSuccess(false);

    try {
      const payload: any = {
        entityType: 'broker',
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

  // Helper to find firm by name and type
  const findFirm = (entityName: string, entityType: string) => {
    if (entityType === 'broker') {
      return brokersData.find(b => b.name === entityName);
    } else if (entityType === 'propFirm') {
      return propFirmsData.find(p => p.name === entityName);
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-zinc-500">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* ❌ REGION BANNER REMOVED - Users select region in navbar */}

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400 text-sm mb-6">
            <Sparkles size={14} /> Community-Driven Insights
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Real Trader<br />Experiences
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
            Read authentic reviews focused on withdrawals, execution, and reliability. Share your real trading experience.
          </motion.p>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="border-y border-zinc-800/50 bg-gradient-to-r from-zinc-900/30 via-transparent to-zinc-900/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center text-sm flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <span className="text-white font-medium">{brokersData.length} brokers</span>
              <span className="text-white font-medium">{propFirmsData.length} prop firms</span>
              <span className="text-purple-400 font-medium">{totalReviews} reviews</span>
              <span className="text-orange-400 font-medium">{totalIncidents} incidents</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setActiveTab('reviews')} className={`px-3 py-1 rounded-lg text-sm transition-all ${activeTab === 'reviews' ? 'bg-purple-500/20 text-purple-400' : 'text-zinc-500 hover:text-zinc-300'}`}>Reviews</button>
              <button onClick={() => setActiveTab('incidents')} className={`px-3 py-1 rounded-lg text-sm transition-all ${activeTab === 'incidents' ? 'bg-purple-500/20 text-purple-400' : 'text-zinc-500 hover:text-zinc-300'}`}>Incidents</button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-3 mb-8 justify-end">
          <button onClick={() => user ? setShowReviewForm(true) : router.push('/login')} className="px-5 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:from-purple-500 hover:to-pink-500 transition-all flex items-center gap-2">
            <Plus size={16} /> Write Review
          </button>
          <button onClick={() => user ? setShowIncidentForm(true) : router.push('/login')} className="px-5 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg hover:from-orange-500 hover:to-red-500 transition-all flex items-center gap-2">
            <AlertTriangle size={16} /> Report Incident
          </button>
        </div>

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' ? (
          <>
            <div className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800 mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                <select
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm"
                  value={filterType}
                  onChange={(e) => { setFilterType(e.target.value as any); setFilterName(''); }}
                >
                  <option value="broker">Brokers</option>
                  <option value="propFirm">Prop Firms</option>
                </select>
                <select
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                >
                  <option value="">All {filterType === 'broker' ? 'Brokers' : 'Prop Firms'}</option>
                  {allFirms[filterType].map((firm) => (
                    <option key={firm.id} value={firm.name}>{firm.name}</option>
                  ))}
                </select>
                <select
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="newest">Newest First</option>
                  <option value="highest">Highest Rated</option>
                  <option value="most-helpful">Most Helpful</option>
                </select>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <input
                    placeholder="Search reviews..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm"
                  />
                </div>
              </div>
            </div>

            {reviewsLoading ? (
              <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" /></div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/30 rounded-2xl border border-zinc-800">
                <MessageCircle className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No reviews found</h3>
                <p className="text-zinc-400">Be the first to share your trading experience!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => {
                  const topLevelReplies = repliesCache[review.id] || [];
                  const firm = findFirm(review.entityName, review.entityType);
                  
                  return (
                    <div key={review.id} className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-5 hover:border-purple-500/30 transition-all">
                      <div className="flex flex-col md:flex-row gap-5">
                        {/* Left Side - WITH LOGO */}
                        <div className="md:w-48 flex-shrink-0">
                          <div className="flex items-center gap-3 mb-3">
                            <FirmLogo firm={{ name: review.entityName, logo: firm?.logo }} size="md" />
                            <div>
                              <h3 className="font-semibold text-white">{review.entityName}</h3>
                              <p className="text-xs text-zinc-500 capitalize">{review.entityType}</p>
                            </div>
                          </div>
                          <div className="text-center p-3 bg-zinc-800/30 rounded-lg mb-3">
                            <div className="text-2xl font-bold text-white">{review.rating}.0</div>
                            <StarRating rating={review.rating} size="sm" readonly />
                          </div>
                          {review.trustScore && (
                            <div className="p-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg text-center">
                              <div className="text-xs text-zinc-400">Trust Score</div>
                              <div className="text-sm font-bold text-purple-400">{review.trustScore}</div>
                            </div>
                          )}
                        </div>
                        
                        {/* Right Side */}
                        <div className="flex-1">
                          <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                            <div>
                              <h4 className="text-lg font-semibold text-white">{review.title}</h4>
                              <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                                <span>by {review.user?.name || 'Anonymous'}</span>
                                <span>•</span>
                                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => markHelpful(review.id, 'HELPFUL')} className={`p-1.5 rounded-lg transition-colors ${userVotes[review.id] === 'HELPFUL' ? 'bg-green-500/20 text-green-400' : 'text-zinc-500 hover:text-green-400'}`}>
                                <ThumbsUp size={14} />
                              </button>
                              <button onClick={() => shareReview(review)} className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-400 transition-colors">
                                {copiedReviewId === review.id ? <Check size={14} /> : <Share2 size={14} />}
                              </button>
                              <button onClick={() => toggleReviewExpand(review.id)} className="p-1.5 rounded-lg text-zinc-500 hover:text-purple-400 transition-colors">
                                <Eye size={14} />
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
                                className="relative p-1.5 rounded-lg text-zinc-500 hover:text-green-400 transition-colors"
                              >
                                <MessageCircle size={14} />
                                {review.replyCount > 0 && (
                                  <span className="absolute -top-1 -right-1 text-[10px] bg-green-500 text-white rounded-full px-1 min-w-[16px] h-4 flex items-center justify-center">
                                    {review.replyCount}
                                  </span>
                                )}
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-zinc-300 text-sm leading-relaxed">
                            {expandedReviewId === review.id ? review.content : `${review.content.substring(0, 250)}${review.content.length > 250 ? '...' : ''}`}
                          </p>
                          {review.content.length > 250 && expandedReviewId !== review.id && (
                            <button onClick={() => toggleReviewExpand(review.id)} className="text-purple-400 text-xs mt-1 hover:underline">Read more</button>
                          )}
                          
                          <div className="flex flex-wrap gap-2 mt-3">
                            {review.wouldRecommend === 'Yes' && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Recommended</span>}
                            {review.isVerified && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Verified Trader</span>}
                          </div>
                          
                          {/* Reply Section */}
                          {showReplySection[review.id] && (
                            <div className="mt-4 border-t border-zinc-800 pt-4">
                              {topLevelReplies.map((reply) => (
                                <ReplyThread
                                  key={reply.id}
                                  reply={reply}
                                  onReply={(parentId, content, mediaFiles) => submitReply(review.id, parentId, content, mediaFiles)}
                                  onLoadChildReplies={(replyId) => fetchRepliesForParent(review.id, replyId)}
                                  onOpenLightbox={handleOpenLightbox}
                                />
                              ))}
                              <div className="mt-3 flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
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
                                        <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => { if (e.target.files) setReplyMedia(Array.from(e.target.files)); }} />
                                      </label>
                                      {replyMedia.length > 0 && (
                                        <span className="text-xs text-green-400">{replyMedia.length} file(s)</span>
                                      )}
                                    </div>
                                    {replyingToReview === review.id && (replyContent.trim() || replyMedia.length > 0) && (
                                      <button onClick={() => handleSubmitReply(review.id, null)} disabled={replySubmitting} className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs disabled:opacity-50">
                                        {replySubmitting ? 'Sending...' : 'Post'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button disabled={pagination.page === 1} onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })} className="px-3 py-1.5 text-sm text-zinc-400 disabled:opacity-50 hover:text-white border border-zinc-700 rounded-lg">Prev</button>
                <span className="px-3 py-1.5 text-sm text-zinc-400">{pagination.page} / {pagination.pages}</span>
                <button disabled={pagination.page === pagination.pages} onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })} className="px-3 py-1.5 text-sm text-zinc-400 disabled:opacity-50 hover:text-white border border-zinc-700 rounded-lg">Next</button>
              </div>
            )}
          </>
        ) : (
          /* INCIDENTS TAB */
          <>
            <div className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800 mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                <select
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm"
                  value={filterType}
                  onChange={(e) => { setFilterType(e.target.value as any); setFilterName(''); setIncidentPagination(prev => ({ ...prev, page: 1 })); }}
                >
                  <option value="broker">Brokers</option>
                  <option value="propFirm">Prop Firms</option>
                </select>
                <select
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm"
                  value={filterName}
                  onChange={(e) => { setFilterName(e.target.value); setIncidentPagination(prev => ({ ...prev, page: 1 })); }}
                >
                  <option value="">All {filterType === 'broker' ? 'Brokers' : 'Prop Firms'}</option>
                  {allFirms[filterType].map((firm) => (
                    <option key={firm.id} value={firm.name}>{firm.name}</option>
                  ))}
                </select>
                <select
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm"
                  value={incidentDays}
                  onChange={(e) => { setIncidentDays(parseInt(e.target.value)); setIncidentPagination(prev => ({ ...prev, page: 1 })); }}
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                  <option value="0">All time</option>
                </select>
                <button onClick={() => fetchIncidents()} className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-red-500/10 rounded-xl p-4 text-center border border-red-500/20">
                <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{incidents.filter(i => i.resolutionStatus === 'PENDING').length}</div>
                <div className="text-xs text-zinc-500">Unresolved</div>
              </div>
              <div className="bg-green-500/10 rounded-xl p-4 text-center border border-green-500/20">
                <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{incidents.filter(i => i.resolutionStatus === 'RESOLVED').length}</div>
                <div className="text-xs text-zinc-500">Resolved</div>
              </div>
              <div className="bg-blue-500/10 rounded-xl p-4 text-center border border-blue-500/20">
                <Shield className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{incidents.filter(i => i.verifiedBadge).length}</div>
                <div className="text-xs text-zinc-500">Verified</div>
              </div>
              <div className="bg-yellow-500/10 rounded-xl p-4 text-center border border-yellow-500/20">
                <Users className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{incidents.reduce((sum, i) => sum + (i.confirmations || 0), 0)}</div>
                <div className="text-xs text-zinc-500">Confirmations</div>
              </div>
            </div>

            {incidentsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                <p className="mt-4 text-zinc-500">Loading incidents...</p>
              </div>
            ) : incidents.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/30 rounded-2xl border border-zinc-800">
                <Shield className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No incidents reported</h3>
                <p className="text-zinc-400">Be the first to report an issue with a platform.</p>
                <button onClick={() => user ? setShowIncidentForm(true) : router.push('/login')} className="mt-4 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-500 hover:to-red-500 transition-all">
                  Report an Incident
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {incidents.map((incident) => {
                  const typeInfo = incidentTypes.find(t => t.value === incident.incidentType);
                  const IconComponent = typeInfo?.icon || AlertTriangle;
                  const iconColor = typeInfo?.color || 'text-red-400';
                  
                  let entityName = incident.entityName;
                  if (!entityName && incident.entityType === 'broker') {
                    const broker = brokersData.find(b => b.id === incident.entityId);
                    entityName = broker?.name || 'Unknown Broker';
                  } else if (!entityName && incident.entityType === 'propFirm') {
                    const propFirm = propFirmsData.find(p => p.id === incident.entityId);
                    entityName = propFirm?.name || 'Unknown Prop Firm';
                  }
                  
                  const isResolved = incident.resolutionStatus === 'RESOLVED';
                  const isVerified = incident.verifiedBadge;
                  
                  return (
                    <div key={incident.id} className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-5 hover:border-orange-500/30 transition-all">
                      <div className="flex flex-col md:flex-row gap-5">
                        <div className="md:w-48 flex-shrink-0">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${generateGradient(entityName)} flex items-center justify-center text-white font-bold text-lg`}>
                              {entityName?.charAt(0) || '?'}
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{entityName}</h3>
                              <p className="text-xs text-zinc-500 capitalize">{incident.entityType || 'Unknown'}</p>
                            </div>
                          </div>
                          <div className={`flex items-center gap-2 p-2 rounded-lg ${isResolved ? 'bg-green-500/10' : isVerified ? 'bg-blue-500/10' : 'bg-red-500/10'}`}>
                            {isResolved ? <CheckCircle size={14} className="text-green-400" /> : isVerified ? <Shield size={14} className="text-blue-400" /> : <AlertTriangle size={14} className="text-red-400" />}
                            <span className={`text-xs ${isResolved ? 'text-green-400' : isVerified ? 'text-blue-400' : 'text-red-400'}`}>
                              {isResolved ? 'Resolved' : isVerified ? 'Verified' : 'Pending'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <IconComponent size={16} className={iconColor} />
                            <h4 className="text-lg font-semibold text-white">{incident.title}</h4>
                          </div>
                          <p className="text-zinc-300 text-sm mb-3">{incident.description}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
                            <span className="flex items-center gap-1"><Clock size={12} /> {new Date(incident.incidentDate || incident.createdAt).toLocaleDateString()}</span>
                            {incident.withdrawalAmount && <span className="flex items-center gap-1"><DollarSign size={12} /> ${incident.withdrawalAmount.toLocaleString()}</span>}
                            {incident.withdrawalMethod && <span className="flex items-center gap-1"><CreditCard size={12} /> {incident.withdrawalMethod}</span>}
                            <span className="flex items-center gap-1"><Users size={12} /> {incident.confirmations || 0} confirmations</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {incidentPagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button disabled={incidentPagination.page === 1} onClick={() => setIncidentPagination({ ...incidentPagination, page: incidentPagination.page - 1 })} className="px-3 py-1.5 text-sm text-zinc-400 disabled:opacity-50 hover:text-white border border-zinc-700 rounded-lg">Prev</button>
                <span className="px-3 py-1.5 text-sm text-zinc-400">{incidentPagination.page} / {incidentPagination.pages}</span>
                <button disabled={incidentPagination.page === incidentPagination.pages} onClick={() => setIncidentPagination({ ...incidentPagination, page: incidentPagination.page + 1 })} className="px-3 py-1.5 text-sm text-zinc-400 disabled:opacity-50 hover:text-white border border-zinc-700 rounded-lg">Next</button>
              </div>
            )}
          </>
        )}
      </main>

      {/* REVIEW FORM MODAL */}
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
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">What are you reviewing?</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setReviewFormType('broker'); setSelectedFirmId(null); setSelectedFirmName(''); setFirmSearch(''); }} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${reviewFormType === 'broker' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>Broker</button>
                      <button type="button" onClick={() => { setReviewFormType('propFirm'); setSelectedFirmId(null); setSelectedFirmName(''); setFirmSearch(''); }} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${reviewFormType === 'propFirm' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>Prop Firm</button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Select Firm *</label>
                    <div className="relative" ref={dropdownRef}>
                      <input type="text" value={firmSearch} onChange={(e) => { setFirmSearch(e.target.value); setFirmDropdownOpen(true); setSelectedFirmId(null); setSelectedFirmName(''); }} onFocus={() => setFirmDropdownOpen(true)} placeholder="Search broker or prop firm..." className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm" />
                      {firmDropdownOpen && filteredFirms.length > 0 && (
                        <div className="absolute z-20 mt-2 max-h-48 w-full overflow-auto rounded-xl border border-zinc-700 bg-zinc-900">
                          {filteredFirms.map((firm) => (
                            <div key={firm.id} onClick={() => selectFirm(firm)} className="px-4 py-2 hover:bg-purple-600 cursor-pointer border-b border-zinc-800">
                              <div className="text-white text-sm">{firm.name}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedFirmName && <div className="text-xs text-green-400 mt-1">✓ Selected: {selectedFirmName}</div>}
                  </div>
                  
                  {/* Rest of the form remains the same... */}
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Rate Your Experience</label>
                    <div className="flex gap-1 mb-3">
                      <StarRating rating={form.rating} setRating={(r) => setForm({ ...form, rating: r })} size="md" />
                    </div>
                    <div className="space-y-3">
                      {[
                        { key: 'platformStability', label: 'Platform Stability' },
                        { key: 'executionQuality', label: 'Execution Quality' },
                        { key: 'withdrawalExperience', label: 'Withdrawal Experience' },
                        { key: 'customerSupport', label: 'Customer Support' },
                        { key: 'reliability', label: 'Reliability' }
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
                  
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Would you recommend?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2"><input type="radio" name="wouldRecommend" value="Yes" checked={form.wouldRecommend === 'Yes'} onChange={(e) => setForm({ ...form, wouldRecommend: e.target.value })} className="text-purple-500" /><span className="text-white text-sm">Yes</span></label>
                      <label className="flex items-center gap-2"><input type="radio" name="wouldRecommend" value="No" checked={form.wouldRecommend === 'No'} onChange={(e) => setForm({ ...form, wouldRecommend: e.target.value })} className="text-purple-500" /><span className="text-white text-sm">No</span></label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Withdrawal Speed</label>
                    <select value={form.withdrawalSpeed} onChange={(e) => setForm({ ...form, withdrawalSpeed: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm">
                      <option value="">Select speed</option>
                      <option value="Same Day">Same Day</option>
                      <option value="1-3 Days">1-3 Days</option>
                      <option value="3-7 Days">3-7 Days</option>
                      <option value="7+ Days">7+ Days</option>
                      <option value="Still Waiting">Still Waiting</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Review Title *</label>
                    <input name="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm" placeholder="Summarize your experience" />
                  </div>
                  
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Your Experience *</label>
                    <textarea name="content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm resize-none" placeholder="Describe your experience..." />
                  </div>
                  
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.verifiedTrader} onChange={(e) => setForm({ ...form, verifiedTrader: e.target.checked })} className="rounded" />
                    <span className="text-sm text-zinc-300">I am a verified trader</span>
                  </label>
                  
                  {formErrors && <div className="text-red-400 text-sm">{formErrors}</div>}
                  
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

      {/* INCIDENT FORM MODAL */}
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
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Select Firm *</label>
                    <div className="relative" ref={incidentDropdownRef}>
                      <input type="text" value={incidentFirmSearch} onChange={(e) => { setIncidentFirmSearch(e.target.value); setIncidentFirmDropdownOpen(true); setSelectedIncidentFirmId(null); setSelectedIncidentFirmName(''); }} placeholder="Search for a broker or prop firm..." className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm" />
                      {incidentFirmDropdownOpen && incidentFilteredFirms.length > 0 && (
                        <div className="absolute z-20 mt-2 max-h-48 w-full overflow-auto rounded-xl border border-zinc-700 bg-zinc-900">
                          {incidentFilteredFirms.map((firm) => (
                            <div key={firm.id} onClick={() => selectIncidentFirm(firm)} className="px-4 py-2 hover:bg-purple-600 cursor-pointer border-b border-zinc-800">
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
                    <textarea rows={4} value={incidentForm.description} onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm resize-none" placeholder="Detailed description of the incident..." />
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
                  
                  {incidentError && <div className="text-red-400 text-sm">{incidentError}</div>}
                  
                  {incidentSuccess && (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-center">
                      <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
                      <p className="text-green-400 text-sm">Incident reported successfully!</p>
                    </div>
                  )}
                  
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

      {/* Footer */}
      <div className="border-t border-zinc-800/50 py-8 px-6 mt-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs text-zinc-600">Data is community-reported and verified. Reviews help other traders make informed decisions.</p>
        </div>
      </div>
    </div>
  );
}