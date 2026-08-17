"use client";

import React, { useState, useEffect, useRef } from "react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { slugify } from "@/lib/slugify";
import { formatCurrency } from "@/utils/api-helpers";
import { useUser } from "@/contexts/UserContext";
import { useRegion } from "@/contexts/RegionContext";
import TrustScoreBadge from "@/components/ui/TrustScoreBadge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Star, ExternalLink, Users, Shield, Zap, Clock, DollarSign,
  Check, X, BarChart3, Target, Award, Globe, Copy, CheckCircle,
  Rocket, Network, TrendingUp, ShieldCheck, ArrowLeft,
  BadgeCheck, MessageSquare, Share2, Bookmark, Eye,
  CreditCard, Smartphone, Monitor, Lock as LockIcon, PieChart,
  Wallet, Building, Gift, Mail, Phone, MessageCircle,
  BookOpen, AlertTriangle, ThumbsUp, ThumbsDown,
  Sparkles, Flame, Crown, Gem, Info, RefreshCw, 
  Headphones, Activity, Flag, Plus, Send as SendIcon,
  Landmark, Scale, Twitter, Facebook, Youtube, Instagram,
  Linkedin, Send, AlertOctagon, CalendarIcon,
  CheckCircle2, XCircle, HelpCircle, Award as AwardIcon,
  Percent, Tag, Rocket as RocketIcon, Layers,
  ImagePlus, Reply, ChevronLeft, ChevronRight, Loader2,
  Trophy, Medal, Timer, Gauge, ChartNoAxesCombined,
  BadgeDollarSign, Compass, GitCompare, LayoutGrid,
  Image as ImageIcon, User, Briefcase, AlertCircle, 
  ThumbsUp as ThumbsUpIcon, ThumbsDown as ThumbsDownIcon,
  FileText, BarChart, TrendingUp as TrendingUpIcon,
  GraduationCap, Sword, Store, Wallet as WalletIcon,
  User as UserIcon, Hash, Link2, MapPin, Calendar, Building2,
  Banknote, CreditCard as CreditCardIcon, Clock as ClockIcon,
  Globe2, PhoneCall, Mail as MailIcon, MessageCircle as MessageCircleIcon,
  Sparkle, ArrowRight as ArrowRightIcon, Star as StarIcon,
  Zap as ZapIcon, Crown as CrownIcon, Gem as GemIcon
} from "lucide-react";

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

interface Props { 
  params: Promise<{ firm: string }>
}

// Helper function to generate gradient for fallback
const generateGradient = (name: string) => {
  const gradients = [
    "from-purple-500 to-pink-500", "from-blue-500 to-cyan-500", 
    "from-green-500 to-emerald-500", "from-orange-500 to-red-500",
    "from-indigo-500 to-purple-500", "from-teal-500 to-green-500"
  ];
  return gradients[(name?.length || 0) % gradients.length];
};

// ===================== CONVERSION BUTTON COMPONENTS =====================

// Primary CTA Button
function PrimaryCTA({ href, text, size = "lg", className = "", showSparkle = true }: { 
  href: string; 
  text: string; 
  size?: "sm" | "md" | "lg";
  className?: string;
  showSparkle?: boolean;
}) {
  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  };
  
  return (
    <button 
      onClick={() => window.open(href, '_blank')}
      className={`relative group bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white rounded-xl font-bold hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2 overflow-hidden ${sizes[size]} ${className}`}
    >
      {showSparkle && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
      )}
      {showSparkle && <Sparkle size={size === "sm" ? 14 : size === "md" ? 16 : 18} className="text-white/80" />}
      {text}
      <ExternalLink size={size === "sm" ? 12 : size === "md" ? 14 : 16} />
    </button>
  );
}

// Secondary CTA
function SecondaryCTA({ href, text, size = "md", className = "" }: { 
  href: string; 
  text: string; 
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3 text-base"
  };
  
  return (
    <button 
      onClick={() => window.open(href, '_blank')}
      className={`bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg hover:shadow-amber-500/30 flex items-center justify-center gap-2 ${sizes[size]} ${className}`}
    >
      <RocketIcon size={size === "sm" ? 12 : size === "md" ? 14 : 16} />
      {text}
      <ArrowRightIcon size={size === "sm" ? 10 : size === "md" ? 12 : 14} />
    </button>
  );
}

// Program-specific CTA
function ProgramCTA({ href, text, size = "sm", className = "" }: { 
  href: string; 
  text: string; 
  size?: "sm" | "md";
  className?: string;
}) {
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm"
  };
  
  return (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        window.open(href, '_blank');
      }}
      className={`bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-500 hover:to-emerald-500 transition-all shadow-md hover:shadow-green-500/20 flex items-center justify-center gap-1.5 ${sizes[size]} ${className}`}
    >
      <RocketIcon size={size === "sm" ? 10 : 12} />
      {text}
    </button>
  );
}

// Star Rating Component
function StarRating({ rating, count = 0, size = "sm", readonly = true, setRating }: { 
  rating: number; 
  count?: number; 
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  setRating?: (rating: number) => void;
}) {
  const sizes = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" };
  const hasReviews = count > 0;
  const displayRating = hasReviews ? Math.min(5, Math.max(0, rating || 0)) : 0;
  const roundedRating = Math.round(displayRating);

  return (
    <div className="flex items-center gap-1.5">
      <div className={`flex gap-0.5 ${!readonly ? 'cursor-pointer' : ''}`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star 
            key={i} 
            className={`${sizes[size]} ${i <= (setRating ? rating : roundedRating) && (hasReviews || setRating) ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'} ${!readonly ? 'hover:text-yellow-400 hover:fill-yellow-400 transition-colors' : ''}`}
            onClick={() => !readonly && setRating && setRating(i)}
          />
        ))}
      </div>
      {hasReviews && (
        <span className="text-sm text-white">{displayRating.toFixed(1)}</span>
      )}
      {count > 0 && <span className="text-xs text-zinc-500">({count} reviews)</span>}
    </div>
  );
}

// Trust Score Display
function TrustScoreDisplay({ score }: { score: number }) {
  let bgColor = 'bg-red-500/20', textColor = 'text-red-400', text = 'Low';
  if (score >= 80) { bgColor = 'bg-green-500/20'; textColor = 'text-green-400'; text = 'High'; }
  else if (score >= 60) { bgColor = 'bg-yellow-500/20'; textColor = 'text-yellow-400'; text = 'Medium'; }
  
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${bgColor}`}>
      <Shield size={14} className={textColor} />
      <span className={`text-sm font-medium ${textColor}`}>{text} Trust</span>
      <span className="text-white text-sm font-bold">{score}</span>
    </div>
  );
}

// Info Card Component
function InfoCard({ icon: Icon, label, value, color = "blue", badge, href, ctaText }: any) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    pink: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    teal: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  };
  
  const displayValue = (value !== undefined && value !== null && value !== '') ? value : '—';
  const cleanValue = typeof displayValue === 'string' && displayValue.startsWith('$$') 
    ? displayValue.substring(1) 
    : displayValue;
  
  return (
    <div className={`p-3 rounded-xl border ${colors[color] || colors.blue} group hover:scale-105 transition-all duration-300`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} />
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
      <div className="text-white font-semibold text-sm flex items-center gap-2">
        {cleanValue}
        {badge && <span className="text-[8px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full">{badge}</span>}
      </div>
      {href && (
        <button 
          onClick={() => window.open(href, '_blank')}
          className="mt-2 text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors opacity-0 group-hover:opacity-100"
        >
          {ctaText || 'Claim Now'} →
        </button>
      )}
    </div>
  );
}

// Offer Card Component
function OfferCard({ promotion, affiliateLink }: { promotion: any; affiliateLink: string }) {
  if (!promotion) return null;
  
  const cleanDescription = promotion.description?.replace(/\$\$/g, '$') || '';
  
  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/30 hover:border-amber-500/50 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Gift size={16} className="text-amber-400" />
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Limited Offer</span>
            {promotion.code && (
              <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400">Code: {promotion.code}</span>
            )}
          </div>
          <h4 className="text-white font-semibold text-base">{promotion.name || 'Special Offer'}</h4>
          {cleanDescription && (
            <p className="text-xs text-zinc-400 mt-1">{cleanDescription}</p>
          )}
          {promotion.discount && (
            <div className="mt-2 inline-flex items-center gap-1 bg-green-500/20 px-2 py-0.5 rounded-full">
              <Percent size={10} className="text-green-400" />
              <span className="text-xs text-green-400">{promotion.discount}% OFF</span>
            </div>
          )}
          {promotion.validUntil && (
            <p className="text-xs text-orange-400 mt-1 flex items-center gap-1">
              <Clock size={10} /> Valid until: {new Date(promotion.validUntil).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          {promotion.code ? (
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => navigator.clipboard.writeText(promotion.code)}
                className="px-3 py-1.5 bg-zinc-800 rounded-lg text-white text-xs hover:bg-zinc-700 transition-colors flex items-center gap-1"
              >
                <Copy size={10} /> Copy Code
              </button>
              <SecondaryCTA href={affiliateLink} text="Claim" size="sm" className="!bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400" />
            </div>
          ) : (
            <SecondaryCTA href={affiliateLink} text="Claim Offer" size="sm" className="!bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400" />
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to format profit target
const formatProfitTarget = (target: any): string => {
  if (!target) return '0%';
  if (typeof target === 'object') {
    if (target.phase1 && target.phase2) {
      return `${target.phase1}% + ${target.phase2}%`;
    }
    if (target.total) return `${target.total}%`;
    return 'N/A';
  }
  return `${target}%`;
};

// Helper functions for prop firms
const getAllAccountOptions = (firm: any) => {
  if (!firm || !firm.programs) return [];
  return firm.programs.flatMap((program: any) => program.accountOptions || []);
};

const getMaxPayout = (firm: any) => {
  const accountOptions = getAllAccountOptions(firm);
  if (accountOptions.length === 0) return firm.payoutPercentage || 0;
  return Math.max(...accountOptions.map((acc: any) => {
    const payout = acc.payoutPercentage || acc.payout || 0;
    return typeof payout === 'string' ? parseInt(payout.replace('%', '')) : payout;
  }));
};

const getMinPrice = (firm: any) => {
  const accountOptions = getAllAccountOptions(firm);
  if (accountOptions.length === 0) return firm.minDeposit || 0;
  return Math.min(...accountOptions.map((acc: any) => acc.price || 0));
};

const getMinAccountSize = (firm: any) => {
  const accountOptions = getAllAccountOptions(firm);
  if (accountOptions.length === 0) return firm.minDeposit || 0;
  return Math.min(...accountOptions.map((acc: any) => acc.accountSize || 0));
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
    <div className={`${depth > 0 ? 'ml-8 mt-3' : 'mt-3'}`}>
      <div className={`p-3 rounded-xl ${styles.bg} border ${styles.border}`}>
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${generateGradient(reply.user?.name || reply.broker?.name || reply.propFirm?.name || 'Reply')} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
            {(reply.user?.name?.charAt(0) || reply.broker?.name?.charAt(0) || reply.propFirm?.name?.charAt(0) || 'U').toUpperCase()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-white text-sm">
                {reply.user?.name || reply.broker?.name || reply.propFirm?.name || 'Anonymous'}
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
                    className="relative w-20 h-20 rounded-lg overflow-hidden bg-zinc-800 cursor-pointer group"
                    onClick={() => onOpenLightbox(reply.mediaUrls, idx)}
                  >
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
                currentUser={currentUser}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ===================== REVIEW FORM MODAL =====================
function ReviewFormModal({ isOpen, onClose, firm, onSuccess }: { 
  isOpen: boolean; 
  onClose: () => void; 
  firm: any; 
  onSuccess: () => void;
}) {
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
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><LockIcon size={28} className="text-white" /></div>
          <h3 className="text-xl font-bold text-white mb-2">Login Required</h3>
          <p className="text-zinc-400 mb-6">Please login to write a review.</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg bg-zinc-800 text-white">Cancel</button>
            <button onClick={() => { router.push('/login'); onClose(); }} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white">Login</button>
          </div>
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
              {firm?.logo ? (
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700">
                  <img src={firm.logo} alt={firm.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${generateGradient(firm?.name)} flex items-center justify-center text-white font-bold text-sm`}>
                  {firm?.name?.charAt(0) || 'P'}
                </div>
              )}
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
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
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
function IncidentFormModal({ isOpen, onClose, firm, onSuccess }: { 
  isOpen: boolean; 
  onClose: () => void; 
  firm: any; 
  onSuccess: () => void;
}) {
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
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><LockIcon size={28} className="text-white" /></div>
          <h3 className="text-xl font-bold text-white mb-2">Login Required</h3>
          <p className="text-zinc-400 mb-6">Please login to report an incident.</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg bg-zinc-800 text-white">Cancel</button>
            <button onClick={() => { router.push('/login'); onClose(); }} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 text-white">Login</button>
          </div>
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
              {firm?.logo ? (
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700">
                  <img src={firm.logo} alt={firm.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${generateGradient(firm?.name)} flex items-center justify-center text-white font-bold text-sm`}>
                  {firm?.name?.charAt(0) || 'P'}
                </div>
              )}
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
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
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

// Incident Types
const incidentTypes = [
  { value: 'WITHDRAWAL_DELAY', label: 'Withdrawal Delay', icon: Clock, color: 'text-orange-400' },
  { value: 'WITHDRAWAL_REJECTED', label: 'Withdrawal Rejected', icon: X, color: 'text-red-400' },
  { value: 'SLIPPAGE_ISSUES', label: 'Slippage Issues', icon: Zap, color: 'text-yellow-400' },
  { value: 'SPREAD_SPIKE', label: 'Spread Spike', icon: Target, color: 'text-orange-400' },
  { value: 'EXECUTION_DELAY', label: 'Execution Delay', icon: Clock, color: 'text-yellow-400' },
  { value: 'PLATFORM_FREEZE', label: 'Platform Freeze', icon: Smartphone, color: 'text-purple-400' },
  { value: 'SERVER_DOWN', label: 'Server Down', icon: X, color: 'text-red-400' },
  { value: 'ACCOUNT_SUSPENDED', label: 'Account Suspended', icon: AlertTriangle, color: 'text-red-400' },
  { value: 'SCAM_WARNING', label: 'Scam Warning', icon: AlertTriangle, color: 'text-red-400' },
];

// ===================== MAIN COMPONENT =====================
export default function PropFirmPage({ params }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { region } = useRegion();
  const [activeTab, setActiveTab] = useState('overview');
  const [firm, setFirm] = useState<any>(null);
  const [firmReviews, setFirmReviews] = useState<any[]>([]);
  const [firmIncidents, setFirmIncidents] = useState<any[]>([]);
  const [incidentCount, setIncidentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [incidentsLoading, setIncidentsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);
  const [copiedReviewId, setCopiedReviewId] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [bookmarked, setBookmarked] = useState(false);
  const [copiedPromoCode, setCopiedPromoCode] = useState<string | null>(null);
  const [regionUnavailable, setRegionUnavailable] = useState(false);

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

  // Set active tab from URL query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) setActiveTab(tabParam);
  }, [searchParams]);

  // Load firm data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const resolvedParams = await params;
        const firmId = parseInt(resolvedParams.firm);
        let foundFirm = null;
        
        if (!isNaN(firmId)) {
          const response = await api.getPropFirmById(firmId);
          if (response.success && response.data) foundFirm = response.data;
        }
        
        if (!foundFirm) {
          const response = await api.getPropFirmBySlug(resolvedParams.firm);
          if (response.success && response.data) foundFirm = response.data;
        }
        
        if (!foundFirm) {
          const allFirmsResponse = await api.getPropFirms();
          if (allFirmsResponse.success && allFirmsResponse.data) {
            const slugifiedParam = slugify(resolvedParams.firm);
            foundFirm = allFirmsResponse.data.find((f: any) => {
              return f.id?.toString() === resolvedParams.firm || 
                     f.slug === slugifiedParam || 
                     (f.name && slugify(f.name) === slugifiedParam) ||
                     f.name?.toLowerCase() === resolvedParams.firm.toLowerCase();
            });
          }
        }
        
        if (foundFirm) {
          setFirm(foundFirm);
          
          // Check region availability
          const available = isAvailableInRegion(foundFirm, region);
          setRegionUnavailable(!available);
          
          if (typeof window !== 'undefined') {
            const bookmarks = JSON.parse(localStorage.getItem('propFirmBookmarks') || '[]');
            setBookmarked(bookmarks.includes(resolvedParams.firm));
          }
          await Promise.all([
            fetchFirmReviews(foundFirm.id),
            fetchIncidents(foundFirm.id)
          ]);
        } else {
          setFirm(null);
        }
      } catch (error) {
        console.error('Error loading prop firm:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [params, region]);

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
    setIncidentsLoading(true);
    try {
      const response = await fetch(`/api/incidents?entityType=propFirm&entityId=${firmId}&limit=50`, { credentials: 'include' });
      const data = await response.json();
      if (response.ok) {
        setFirmIncidents(data.incidents || []);
        setIncidentCount(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setIncidentsLoading(false);
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

  // Mark review as helpful
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

  const calculateReviewTrustScore = (review: any) => {
    let score = 0;
    let totalWeight = 0;
    
    if (review.payoutProcess > 0) {
      score += (review.payoutProcess / 5) * 40;
      totalWeight += 40;
    }
    if (review.tradingConditions > 0) {
      score += (review.tradingConditions / 5) * 20;
      totalWeight += 20;
    }
    if (review.customerCare > 0) {
      score += (review.customerCare / 5) * 20;
      totalWeight += 20;
    }
    if (review.userFriendliness > 0) {
      score += (review.userFriendliness / 5) * 20;
      totalWeight += 20;
    }
    
    if (totalWeight === 0) return null;
    return Math.round((score / totalWeight) * 100);
  };

  const handleReviewSuccess = () => {
    fetchFirmReviews(firm.id);
  };

  const handleIncidentSuccess = () => {
    fetchIncidents(firm.id);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Get Funded with ${firm?.name}`, text: `Check out ${firm?.name} - a top prop firm!`, url: window.location.href });
      } catch (error) { console.log('Error sharing:', error); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const toggleBookmark = () => {
    if (typeof window !== 'undefined') {
      const bookmarks = JSON.parse(localStorage.getItem('propFirmBookmarks') || '[]');
      const newBookmarks = bookmarked ? bookmarks.filter((b: string) => b !== firm?.slug) : [...bookmarks, firm?.slug];
      localStorage.setItem('propFirmBookmarks', JSON.stringify(newBookmarks));
      setBookmarked(!bookmarked);
    }
  };

  const getInitials = (name: string): string => {
    if (!name) return "P";
    return name.split(" ").map((n: string) => n[0]).join("").slice(0, 3).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto" />
          <p className="mt-4 text-zinc-500">Loading prop firm details...</p>
        </div>
      </div>
    );
  }

  if (!firm) return notFound();

  // ===== CALCULATE DERIVED VALUES =====
  const hasReviews = firmReviews.length > 0;
  const avgRating = hasReviews 
    ? firmReviews.reduce((sum, r) => sum + r.rating, 0) / firmReviews.length 
    : firm.rating || 0;
  const reviewCount = hasReviews ? firmReviews.length : firm.reviewsCount || 0;
  const affiliateLink = firm.signupLink || firm.website || '#';
  
  const maxPayout = getMaxPayout(firm);
  const minPrice = getMinPrice(firm);
  const minAccount = getMinAccountSize(firm);
  const hasWarnings = firm.warnings?.length > 0 || firm.regulatoryWarnings?.length > 0;
  const hasOffers = firm.promotions?.length > 0;
  const hasIncidents = incidentCount > 0;
  
  const programTypes = firm.programs?.map((p: any) => p.type) || [];
  const uniqueProgramTypes = [...new Set(programTypes)];
  const allPlatforms = firm.platforms || [];

  const regionInfo = REGION_DISPLAY[region] || REGION_DISPLAY['GLOBAL'];

  return (
    <div className="min-h-screen bg-black">
      {/* ❌ REGION BANNER REMOVED - Users select region in navbar */}

      {/* Region Unavailable Warning */}
      {regionUnavailable && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-red-400 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-semibold text-sm">Not Available in Your Region</h4>
                  <p className="text-sm text-zinc-400">
                    {firm?.name} is not available in {regionInfo.flag} {regionInfo.label}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const selector = document.querySelector('[data-region-selector]');
                  if (selector) (selector as HTMLElement).click();
                }}
                className="sm:ml-auto px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-white transition-colors whitespace-nowrap"
              >
                Change Region
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="border-b border-zinc-800/50 bg-zinc-900/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
            <div className="flex items-center gap-2">
              <button onClick={toggleBookmark} className={`p-2 rounded-xl transition-colors ${bookmarked ? 'text-yellow-400 bg-yellow-500/10' : 'text-zinc-400 hover:text-yellow-400 hover:bg-yellow-500/10'}`}>
                <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} />
              </button>
              <button onClick={handleShare} className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                <Share2 size={18} />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <div className="flex gap-5">
              {firm.logo ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700 shadow-lg flex-shrink-0">
                  <img 
                    src={firm.logo} 
                    alt={firm.name} 
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = `w-20 h-20 rounded-2xl bg-gradient-to-r ${generateGradient(firm.name)} flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0`;
                        fallback.textContent = getInitials(firm.name);
                        parent.appendChild(fallback);
                        target.remove();
                      }
                    }}
                  />
                </div>
              ) : (
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${generateGradient(firm.name)} flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0`}>
                  {firm.name?.charAt(0) || 'P'}
                </div>
              )}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{firm.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  {hasReviews ? (
                    <StarRating rating={avgRating} count={reviewCount} size="md" />
                  ) : (
                    <span className="text-sm text-zinc-500">No reviews yet</span>
                  )}
                  {firm.trustScore > 0 && <TrustScoreDisplay score={firm.trustScore || firm.avgTrustScore || 0} />}
                  {firm.regulated && (
                    <span className="flex items-center gap-1 text-green-400 text-sm bg-green-500/10 px-2 py-1 rounded-full">
                      <ShieldCheck size={12} /> Regulated
                    </span>
                  )}
                  <div className="flex items-center gap-1 text-zinc-400 text-sm">
                    <Globe size={12} /> {firm.country || 'International'}
                  </div>
                  <div className="flex items-center gap-1 text-zinc-400 text-sm">
                    <CalendarIcon size={12} /> Est. {firm.founded || '—'}
                  </div>
                  {firm.yearsInOperation && (
                    <div className="flex items-center gap-1 text-zinc-400 text-sm">
                      <Clock size={12} /> {firm.yearsInOperation} years
                    </div>
                  )}
                  {firm.totalTradersServed && (
                    <div className="flex items-center gap-1 text-zinc-400 text-sm">
                      <Users size={12} /> {firm.totalTradersServed.toLocaleString()} traders
                    </div>
                  )}
                </div>
                <p className="text-zinc-400 max-w-2xl">{firm.shortDescription || firm.description?.substring(0, 200)}</p>
              </div>
            </div>
            <div className="flex-shrink-0 flex flex-col items-end gap-3">
              <PrimaryCTA href={affiliateLink} text="Start Challenge →" size="lg" />
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <CheckCircle2 size={12} className="text-green-400" />
                <span>Join {firm.totalTradersServed ? firm.totalTradersServed.toLocaleString() : '10,000+'}+ traders</span>
                <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                <Shield size={12} className="text-purple-400" />
                <span>Secure platform</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mt-8">
            <InfoCard icon={DollarSign} label="Min Account" value={minAccount ? `${formatCurrency(minAccount)}` : '—'} color="green" />
            <InfoCard icon={Percent} label="Max Payout" value={maxPayout ? `${maxPayout}%` : '—'} color="purple" />
            <InfoCard icon={Wallet} label="Starting Price" value={minPrice ? `${formatCurrency(minPrice)}` : '—'} color="blue" />
            <InfoCard icon={Layers} label="Programs" value={uniqueProgramTypes.length} color="orange" />
            <InfoCard icon={Smartphone} label="Platforms" value={allPlatforms.length} color="cyan" />
            <InfoCard icon={Clock} label="Payout Frequency" value={firm.payoutFrequency || '—'} color="yellow" />
            <InfoCard icon={Target} label="Min Payout" value={firm.minimumPayout ? `${formatCurrency(firm.minimumPayout)}` : '—'} color="amber" />
            <div className={`p-3 rounded-xl border bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 hover:border-purple-500/60 transition-all cursor-pointer group`}>
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-[10px] text-zinc-400 mb-1">Ready to Start?</div>
                <button 
                  onClick={() => window.open(affiliateLink, '_blank')}
                  className="text-white font-semibold text-sm flex items-center gap-1 group-hover:text-purple-400 transition-colors"
                >
                  Get Funded <ArrowRightIcon size={12} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {hasOffers && (
            <div className="mt-6">
              {firm.promotions.slice(0, 1).map((promo: any, idx: number) => (
                <OfferCard key={idx} promotion={promo} affiliateLink={affiliateLink} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-zinc-800 bg-zinc-900/10 sticky top-0 z-30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex overflow-x-auto gap-1 py-3">
            {[
              { id: "overview", label: "Overview", icon: Eye },
              { id: "programs", label: "Programs", icon: Layers },
              { id: "offers", label: "Offers", icon: Gift },
              { id: "rules", label: "Rules", icon: Scale },
              { id: "payouts", label: "Payouts", icon: DollarSign },
              { id: "reputation", label: "Reputation", icon: Shield },
              { id: "reviews", label: `Reviews${reviewCount > 0 ? ` (${reviewCount})` : ''}`, icon: MessageSquare },
              { id: "incidents", label: `Incidents${incidentCount > 0 ? ` (${incidentCount})` : ''}`, icon: AlertOctagon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isIncidentTab = tab.id === "incidents";
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                    isActive 
                      ? isIncidentTab 
                        ? "bg-red-600 text-white shadow-lg" 
                        : "bg-purple-600 text-white shadow-lg"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            
            {/* ==================== OVERVIEW TAB ==================== */}
            {activeTab === "overview" && (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-zinc-900/30 rounded-xl p-6 border border-zinc-800">
                    <h2 className="text-xl font-semibold text-white mb-3">About {firm.name}</h2>
                    <p className="text-zinc-400 leading-relaxed whitespace-pre-line">{firm.description}</p>
                  </div>
                  
                  {(firm.warnings?.length > 0 || firm.regulatoryWarnings?.length > 0) && (
                    <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle size={18} className="text-red-400" />
                        <h4 className="font-semibold text-red-400">Important Warnings</h4>
                      </div>
                      <ul className="space-y-2">
                        {[...(firm.warnings || []), ...(firm.regulatoryWarnings || [])].map((warning, i) => (
                          <li key={i} className="text-sm text-red-300/80 flex items-start gap-2">
                            <span className="mt-1">•</span>
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {firm.riskLevel && (
                    <div className="bg-zinc-900/30 rounded-xl p-6 border border-zinc-800">
                      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Shield size={20} className="text-purple-400" />
                        Risk Assessment
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-zinc-800/30 rounded-lg p-3 text-center">
                          <div className="text-zinc-500 text-xs">Risk Level</div>
                          <div className={`text-lg font-bold ${
                            firm.riskLevel === 'Low' ? 'text-green-400' : 
                            firm.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                          }`}>{firm.riskLevel}</div>
                        </div>
                        {firm.riskScore && (
                          <div className="bg-zinc-800/30 rounded-lg p-3 text-center">
                            <div className="text-zinc-500 text-xs">Risk Score</div>
                            <div className="text-white text-lg font-bold">{firm.riskScore}/100</div>
                          </div>
                        )}
                        {firm.recommendation && (
                          <div className="bg-zinc-800/30 rounded-lg p-3 text-center col-span-2">
                            <div className="text-zinc-500 text-xs">Recommendation</div>
                            <div className="text-white text-sm font-medium">{firm.recommendation}</div>
                          </div>
                        )}
                      </div>
                      {firm.riskFactors?.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-xs text-zinc-500 mb-2">Risk Factors</h4>
                          <ul className="space-y-1">
                            {firm.riskFactors.map((factor: string, i: number) => (
                              <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                                <AlertCircle size={10} className="text-yellow-400 mt-0.5" />
                                {factor}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="bg-zinc-900/30 rounded-xl p-6 border border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <TrendingUp size={20} className="text-green-400" />
                        Programs Overview
                      </h2>
                      <PrimaryCTA href={affiliateLink} text="View All Programs" size="sm" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {firm.programs?.slice(0, 4).map((program: any, idx: number) => (
                        <div key={idx} className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700">
                          <h4 className="text-white font-medium text-sm">{program.type}</h4>
                          <p className="text-xs text-zinc-400 mt-1">{program.description?.substring(0, 60)}...</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">
                              {program.accountOptions?.length || 0} options
                            </span>
                            {program.rules?.maxDrawdown && (
                              <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">
                                DD: {program.rules.maxDrawdown}%
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {(firm.totalPayoutsPaid || firm.totalTradersServed || firm.countriesServed) && (
                    <div className="bg-zinc-900/30 rounded-xl p-6 border border-zinc-800">
                      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <BarChart size={20} className="text-green-400" />
                        Financial Performance
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {firm.totalPayoutsPaid && (
                          <div className="bg-zinc-800/30 rounded-lg p-3 text-center">
                            <div className="text-zinc-500 text-xs">Total Payouts</div>
                            <div className="text-green-400 text-lg font-bold">{firm.totalPayoutsPaid}</div>
                            {firm.totalPayoutsVerified && (
                              <span className="text-[8px] bg-green-500/20 text-green-400 px-1 py-0.5 rounded-full">Verified</span>
                            )}
                          </div>
                        )}
                        {firm.totalTradersServed && (
                          <div className="bg-zinc-800/30 rounded-lg p-3 text-center">
                            <div className="text-zinc-500 text-xs">Traders Served</div>
                            <div className="text-white text-lg font-bold">{firm.totalTradersServed.toLocaleString()}</div>
                          </div>
                        )}
                        {firm.countriesServed && (
                          <div className="bg-zinc-800/30 rounded-lg p-3 text-center">
                            <div className="text-zinc-500 text-xs">Countries</div>
                            <div className="text-white text-lg font-bold">{firm.countriesServed}+</div>
                          </div>
                        )}
                        {firm.dailyTradeCount && (
                          <div className="bg-zinc-800/30 rounded-lg p-3 text-center">
                            <div className="text-zinc-500 text-xs">Daily Trades</div>
                            <div className="text-white text-lg font-bold">{firm.dailyTradeCount.toLocaleString()}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div className="bg-zinc-900/30 rounded-xl p-6 border border-zinc-800">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Building size={18} className="text-purple-400" />Company Info</h3>
                    <div className="space-y-3 text-sm">
                      {firm.legalName && <div><span className="text-zinc-500">Legal Name:</span> <span className="text-white">{firm.legalName}</span></div>}
                      {firm.ceo && <div><span className="text-zinc-500">CEO:</span> <span className="text-white">{firm.ceo}</span></div>}
                      {firm.headquarters && <div><span className="text-zinc-500">Headquarters:</span> <span className="text-white">{firm.headquarters}</span></div>}
                      {firm.corporateAddress && <div><span className="text-zinc-500">Corporate Address:</span> <span className="text-white">{firm.corporateAddress}</span></div>}
                      {firm.founded && <div><span className="text-zinc-500">Founded:</span> <span className="text-white">{firm.founded}</span></div>}
                      {firm.foundedMonth && <div><span className="text-zinc-500">Founded Month:</span> <span className="text-white">{firm.foundedMonth}</span></div>}
                      {firm.yearsInOperation && <div><span className="text-zinc-500">Years in Operation:</span> <span className="text-white">{firm.yearsInOperation} years</span></div>}
                      {firm.contactEmail && <div><span className="text-zinc-500">Email:</span> <span className="text-white">{firm.contactEmail}</span></div>}
                      {firm.contactPhone && <div><span className="text-zinc-500">Phone:</span> <span className="text-white">{firm.contactPhone}</span></div>}
                      {firm.regulation && <div><span className="text-zinc-500">Regulation:</span> <span className="text-white">{firm.regulation}</span></div>}
                      {firm.regulatoryBodies?.length > 0 && (
                        <div><span className="text-zinc-500">Regulatory Bodies:</span> <span className="text-white">{firm.regulatoryBodies.join(', ')}</span></div>
                      )}
                      {firm.companyNumber && <div><span className="text-zinc-500">Company Number:</span> <span className="text-white">{firm.companyNumber}</span></div>}
                      {firm.registrationCountry && <div><span className="text-zinc-500">Registered In:</span> <span className="text-white">{firm.registrationCountry}</span></div>}
                    </div>
                  </div>
                  
                  {firm.supportedCountries?.length > 0 && (
                    <div className="bg-zinc-900/30 rounded-xl p-6 border border-zinc-800">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><Globe size={18} className="text-blue-400" />Countries</h3>
                      <div className="flex flex-wrap gap-1">
                        {firm.supportedCountries.map((c: string) => (
                          <span key={c} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {firm.socialMedia && Object.keys(firm.socialMedia).filter(k => firm.socialMedia[k]).length > 0 && (
                    <div className="bg-zinc-900/30 rounded-xl p-6 border border-zinc-800">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><Share2 size={18} className="text-blue-400" />Social Media</h3>
                      <div className="flex flex-wrap gap-2">
                        {firm.socialMedia.twitter && (
                          <a href={firm.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                            <Twitter size={16} className="text-blue-400" />
                          </a>
                        )}
                        {firm.socialMedia.linkedin && (
                          <a href={firm.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                            <Linkedin size={16} className="text-blue-400" />
                          </a>
                        )}
                        {firm.socialMedia.youtube && (
                          <a href={firm.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                            <Youtube size={16} className="text-red-400" />
                          </a>
                        )}
                        {firm.socialMedia.instagram && (
                          <a href={firm.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                            <Instagram size={16} className="text-pink-400" />
                          </a>
                        )}
                        {firm.socialMedia.facebook && (
                          <a href={firm.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                            <Facebook size={16} className="text-blue-400" />
                          </a>
                        )}
                        {firm.socialMedia.discord && (
                          <a href={firm.socialMedia.discord} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                            <MessageCircle size={16} className="text-purple-400" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==================== PROGRAMS TAB ==================== */}
            {activeTab === "programs" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Layers size={24} className="text-purple-400" />
                    Trading Programs
                  </h2>
                  <PrimaryCTA href={affiliateLink} text="View All Programs" size="sm" />
                </div>
                {firm.programs?.map((program: any, idx: number) => {
                  const options = program.accountOptions || [];
                  const maxPayout = options.length > 0 ? Math.max(...options.map((o: any) => o.payoutPercentage || 0)) : 0;
                  
                  return (
                    <div key={idx} className="bg-zinc-900/30 rounded-xl p-6 border border-zinc-800 hover:border-purple-500/30 transition-all">
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white">{program.type}</h3>
                          {program.name && <p className="text-sm text-zinc-400">{program.name}</p>}
                        </div>
                        <div className="flex gap-2">
                          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                            {options.length} Options
                          </span>
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                            Up to {maxPayout}%
                          </span>
                        </div>
                      </div>
                      
                      {program.description && (
                        <p className="text-zinc-400 text-sm mb-4">{program.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-xs">
                        <div className="bg-zinc-800/30 rounded-lg p-2 text-center">
                          <div className="text-zinc-500">Profit Target</div>
                          <div className="text-white font-semibold">{formatProfitTarget(program.rules?.profitTarget)}</div>
                        </div>
                        <div className="bg-zinc-800/30 rounded-lg p-2 text-center">
                          <div className="text-zinc-500">Max Drawdown</div>
                          <div className="text-white font-semibold">{program.rules?.maxDrawdown || 0}%</div>
                        </div>
                        <div className="bg-zinc-800/30 rounded-lg p-2 text-center">
                          <div className="text-zinc-500">Daily Drawdown</div>
                          <div className="text-white font-semibold">{program.rules?.dailyDrawdown || 0}%</div>
                        </div>
                        <div className="bg-zinc-800/30 rounded-lg p-2 text-center">
                          <div className="text-zinc-500">Min Days</div>
                          <div className="text-white font-semibold">{program.rules?.minTradingDays || 0}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {options.map((option: any, oi: number) => (
                          <div key={oi} className="bg-zinc-800/30 rounded-lg p-2 text-center border border-zinc-700 hover:border-purple-500/30 transition-all">
                            {option.popular && (
                              <span className="text-[8px] bg-yellow-500/20 text-yellow-400 px-1 py-0.5 rounded-full">Popular</span>
                            )}
                            <div className="text-xs text-zinc-500">{formatCurrency(option.accountSize)}</div>
                            <div className="text-white font-semibold text-sm">{formatCurrency(option.price)}</div>
                            <div className="text-green-400 text-xs">{option.payoutPercentage || 0}% split</div>
                            {option.maxAllocation && (
                              <div className="text-[10px] text-zinc-500">Max: {formatCurrency(option.maxAllocation)}</div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 flex items-center justify-end gap-3 pt-4 border-t border-zinc-700">
                        <div className="text-xs text-zinc-500">
                          {options.length} options available
                        </div>
                        <ProgramCTA 
                          href={affiliateLink} 
                          text={`Start ${program.type} →`} 
                          size="md" 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ==================== OFFERS TAB ==================== */}
            {activeTab === "offers" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Gift size={24} className="text-amber-400" />
                    Exclusive Offers & Discounts
                  </h2>
                  <SecondaryCTA href={affiliateLink} text="View All Offers" size="sm" />
                </div>
                {firm.promotions?.length > 0 ? (
                  <div className="space-y-4">
                    {firm.promotions.map((promo: any, idx: number) => (
                      <OfferCard key={idx} promotion={promo} affiliateLink={affiliateLink} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-zinc-900/30 rounded-xl border border-zinc-800">
                    <Gift size={48} className="text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Active Offers</h3>
                    <p className="text-zinc-400">Check back later for exclusive promotions and discounts.</p>
                    <div className="mt-4">
                      <PrimaryCTA href={affiliateLink} text="Start Trading" size="sm" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==================== RULES TAB ==================== */}
            {activeTab === "rules" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Scale size={24} className="text-purple-400" />
                    Challenge Rules
                  </h2>
                  <PrimaryCTA href={affiliateLink} text="Start Challenge" size="sm" />
                </div>
                {firm.programs?.map((program: any, idx: number) => (
                  <div key={idx} className="bg-zinc-900/30 rounded-xl p-6 border border-zinc-800 hover:border-purple-500/30 transition-all">
                    <h3 className="text-lg font-bold text-white mb-4">{program.type} Rules</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="bg-zinc-800/30 rounded-lg p-3">
                        <div className="text-zinc-500 text-xs mb-1">Profit Target</div>
                        <div className="text-white font-medium">{formatProfitTarget(program.rules?.profitTarget)}</div>
                      </div>
                      <div className="bg-zinc-800/30 rounded-lg p-3">
                        <div className="text-zinc-500 text-xs mb-1">Max Drawdown</div>
                        <div className="text-white font-medium">{program.rules?.maxDrawdown || 0}%</div>
                      </div>
                      <div className="bg-zinc-800/30 rounded-lg p-3">
                        <div className="text-zinc-500 text-xs mb-1">Daily Drawdown</div>
                        <div className="text-white font-medium">{program.rules?.dailyDrawdown || 0}%</div>
                      </div>
                      <div className="bg-zinc-800/30 rounded-lg p-3">
                        <div className="text-zinc-500 text-xs mb-1">Min Trading Days</div>
                        <div className="text-white font-medium">{program.rules?.minTradingDays || 0}</div>
                      </div>
                      <div className="bg-zinc-800/30 rounded-lg p-3">
                        <div className="text-zinc-500 text-xs mb-1">Weekend Holding</div>
                        <div className="text-white font-medium">{program.rules?.weekendHolding ? '✅ Allowed' : '❌ Not Allowed'}</div>
                      </div>
                      <div className="bg-zinc-800/30 rounded-lg p-3">
                        <div className="text-zinc-500 text-xs mb-1">EA Trading</div>
                        <div className="text-white font-medium">{program.rules?.eaTrading ? '✅ Allowed' : '❌ Not Allowed'}</div>
                      </div>
                      <div className="bg-zinc-800/30 rounded-lg p-3">
                        <div className="text-zinc-500 text-xs mb-1">News Trading</div>
                        <div className="text-white font-medium">{program.rules?.newsTrading || 'Allowed'}</div>
                      </div>
                      <div className="bg-zinc-800/30 rounded-lg p-3">
                        <div className="text-zinc-500 text-xs mb-1">Consistency Rule</div>
                        <div className="text-white font-medium">{program.rules?.consistencyRule || 'None'}</div>
                      </div>
                    </div>
                    
                    {firm.newsTradingRestrictions && (
                      <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <div className="flex items-start gap-2">
                          <AlertCircle size={14} className="text-yellow-400 mt-0.5" />
                          <div>
                            <span className="text-xs font-semibold text-yellow-400">News Trading:</span>
                            <span className="text-xs text-zinc-300 ml-1">{firm.newsTradingRestrictions}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {firm.prohibitedStrategies?.length > 0 && (
                      <div className="mt-4 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <div className="flex items-start gap-2">
                          <AlertTriangle size={14} className="text-red-400 mt-0.5" />
                          <div>
                            <span className="text-xs font-semibold text-red-400">Prohibited Strategies:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {firm.prohibitedStrategies.map((strategy: string, i: number) => (
                                <span key={i} className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">{strategy}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 flex justify-end">
                      <ProgramCTA href={affiliateLink} text={`Start ${program.type}`} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ==================== PAYOUTS TAB ==================== */}
            {activeTab === "payouts" && (
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-zinc-900/30 rounded-xl p-6 border border-zinc-800">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><DollarSign size={18} className="text-green-400" />Payout Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-zinc-800"><span className="text-zinc-400">Max Payout</span><span className="text-white font-medium">{maxPayout}%</span></div>
                    <div className="flex justify-between py-2 border-b border-zinc-800"><span className="text-zinc-400">Payout Frequency</span><span className="text-white font-medium">{firm.payoutFrequency || '—'}</span></div>
                    <div className="flex justify-between py-2 border-b border-zinc-800"><span className="text-zinc-400">Minimum Payout</span><span className="text-white font-medium">{formatCurrency(firm.minimumPayout)}</span></div>
                    <div className="flex justify-between py-2 border-b border-zinc-800"><span className="text-zinc-400">Payout Methods</span><span className="text-white font-medium">{firm.payoutMethods?.join(', ') || '—'}</span></div>
                    {firm.payoutProcessingTime && (
                      <div className="flex justify-between py-2 border-b border-zinc-800"><span className="text-zinc-400">Processing Time</span><span className="text-white font-medium">{firm.payoutProcessingTime}</span></div>
                    )}
                    {firm.totalPayoutsPaid && (
                      <div className="flex justify-between py-2 border-b border-zinc-800"><span className="text-zinc-400">Total Paid</span><span className="text-green-400 font-medium">{firm.totalPayoutsPaid}</span></div>
                    )}
                  </div>
                  <div className="mt-6 pt-6 border-t border-zinc-800">
                    <PrimaryCTA href={affiliateLink} text="Start Earning Now" size="sm" className="w-full" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-zinc-900/30 rounded-xl p-6 border border-zinc-800">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-purple-400" />Profit Split Options</h3>
                    <div className="space-y-3">
                      {firm.programs?.map((program: any, idx: number) => {
                        const options = program.accountOptions || [];
                        const maxSplit = options.length > 0 ? Math.max(...options.map((o: any) => o.payoutPercentage || 0)) : 0;
                        const avgSplit = options.length > 0 ? Math.round(options.reduce((a: any, o: any) => a + (o.payoutPercentage || 0), 0) / options.length) : 0;
                        return (
                          <div key={idx} className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700">
                            <div className="flex justify-between items-center">
                              <span className="text-white font-medium">{program.type}</span>
                              <div className="flex gap-2">
                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Avg {avgSplit}%</span>
                                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">Max {maxSplit}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {firm.scalingPlan && (
                    <div className="bg-zinc-900/30 rounded-xl p-6 border border-zinc-800">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Award size={18} className="text-yellow-400" />Scaling Plan</h3>
                      <div className="space-y-3">
                        {firm.scalingPlan.levels?.map((level: any, idx: number) => (
                          <div key={idx} className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-white font-medium">{level.name}</span>
                                <div className="text-xs text-zinc-400">{level.monthsRequired} months · {level.payoutsRequired} payouts</div>
                              </div>
                              <div className="text-right">
                                <div className="text-green-400 font-bold">{level.profitSplit}% split</div>
                                <div className="text-xs text-zinc-400">+{level.capitalBoost}% boost</div>
                              </div>
                            </div>
                            {level.benefits?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {level.benefits.map((benefit: string, i: number) => (
                                  <span key={i} className="text-[8px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full">{benefit}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-zinc-800">
                        <PrimaryCTA href={affiliateLink} text="Start Scaling" size="sm" className="w-full" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==================== REPUTATION TAB ==================== */}
            {activeTab === "reputation" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Shield size={24} className="text-purple-400" />
                    Reputation & Trust
                  </h2>
                  <PrimaryCTA href={affiliateLink} text="Join Trusted Community" size="sm" />
                </div>
                
                {(firm.trustpilotRating > 0 || firm.trustpilotReviews > 0) && (
                  <div className="bg-zinc-900/30 rounded-xl p-6 border border-zinc-800">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Star size={18} className="text-yellow-400" />
                      Trustpilot Reviews
                    </h3>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-white">{firm.trustpilotRating.toFixed(1)}</div>
                        <StarRating rating={firm.trustpilotRating} count={firm.trustpilotReviews} size="md" />
                        <div className="text-xs text-zinc-500 mt-1">{firm.trustpilotReviews} reviews</div>
                      </div>
                      {firm.trustpilotUrl && (
                        <a href={firm.trustpilotUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                          View on Trustpilot →
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {(firm.positiveReviewThemes?.length > 0 || firm.negativeReviewThemes?.length > 0) && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {firm.positiveReviewThemes?.length > 0 && (
                      <div className="bg-zinc-900/30 rounded-xl p-6 border border-green-500/20">
                        <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2"><ThumbsUpIcon size={16} /> Positive Themes</h4>
                        <ul className="space-y-1">
                          {firm.positiveReviewThemes.map((theme: string, i: number) => (
                            <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                              <CheckCircle size={10} className="text-green-400 mt-0.5" />
                              {theme}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {firm.negativeReviewThemes?.length > 0 && (
                      <div className="bg-zinc-900/30 rounded-xl p-6 border border-red-500/20">
                        <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2"><ThumbsDownIcon size={16} /> Negative Themes</h4>
                        <ul className="space-y-1">
                          {firm.negativeReviewThemes.map((theme: string, i: number) => (
                            <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                              <XCircle size={10} className="text-red-400 mt-0.5" />
                              {theme}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {firm.supportAgents?.length > 0 && (
                  <div className="bg-zinc-900/30 rounded-xl p-6 border border-zinc-800">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Headphones size={16} className="text-purple-400" />Support Team</h4>
                    <div className="flex flex-wrap gap-2">
                      {firm.supportAgents.map((agent: string, i: number) => (
                        <span key={i} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full">{agent}</span>
                      ))}
                    </div>
                  </div>
                )}

                {firm.knownIssues?.length > 0 && (
                  <div className="bg-zinc-900/30 rounded-xl p-6 border border-yellow-500/20">
                    <h4 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2"><AlertTriangle size={16} /> Known Issues</h4>
                    <div className="space-y-3">
                      {firm.knownIssues.map((issue: any, i: number) => (
                        <div key={i} className="bg-zinc-800/30 rounded-lg p-3 border border-yellow-500/10">
                          <div className="flex justify-between items-start">
                            <span className="text-white font-medium text-sm">{issue.issue}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                              issue.severity === 'High' ? 'bg-red-500/20 text-red-400' :
                              issue.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>{issue.severity}</span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-1">{issue.description}</p>
                          {issue.affectedUsers && (
                            <div className="text-[10px] text-zinc-500 mt-1">Affected: {issue.affectedUsers}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {firm.systemBugs?.length > 0 && (
                  <div className="bg-zinc-900/30 rounded-xl p-6 border border-red-500/20">
                    <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2"><AlertCircle size={16} /> Reported System Bugs</h4>
                    <div className="flex flex-wrap gap-2">
                      {firm.systemBugs.map((bug: string, i: number) => (
                        <span key={i} className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-full border border-red-500/20">{bug}</span>
                      ))}
                    </div>
                  </div>
                )}

                {(firm.payoutDelaysReported || firm.slippageReported || firm.hiddenRulesReported || firm.retroactiveRuleChanges || firm.withdrawalDenials) && (
                  <div className="bg-zinc-900/30 rounded-xl p-6 border border-red-500/20">
                    <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2"><AlertOctagon size={16} /> Warning Flags</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {firm.payoutDelaysReported && (
                        <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-full border border-red-500/20">⚠️ Payout Delays</span>
                      )}
                      {firm.slippageReported && (
                        <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-full border border-red-500/20">⚠️ Slippage Issues</span>
                      )}
                      {firm.hiddenRulesReported && (
                        <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-full border border-red-500/20">⚠️ Hidden Rules</span>
                      )}
                      {firm.retroactiveRuleChanges && (
                        <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-full border border-red-500/20">⚠️ Retroactive Rule Changes</span>
                      )}
                      {firm.withdrawalDenials && (
                        <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-full border border-red-500/20">⚠️ Withdrawal Denials</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==================== REVIEWS TAB ==================== */}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-wrap justify-between items-center gap-4">
                  {hasReviews ? (
                    <div className="bg-zinc-900/30 rounded-xl p-6 text-center flex-1 min-w-[200px]">
                      <div className="text-4xl font-bold text-white mb-2">{avgRating.toFixed(1)}</div>
                      <StarRating rating={avgRating} count={reviewCount} size="md" />
                      <p className="text-zinc-500 text-sm mt-2">Based on {reviewCount} reviews</p>
                    </div>
                  ) : (
                    <div className="bg-zinc-900/30 rounded-xl p-6 text-center flex-1 min-w-[200px]">
                      <div className="text-2xl text-zinc-500 mb-2">No Reviews Yet</div>
                      <p className="text-zinc-500 text-sm">Be the first to share your funded trading experience</p>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <button 
                      onClick={() => setShowReviewForm(true)} 
                      className="px-5 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:from-green-500 hover:to-emerald-500 transition-all flex items-center gap-2"
                    >
                      <Plus size={16} /> Write a Review
                    </button>
                    <PrimaryCTA href={affiliateLink} text="Start Challenge" size="sm" />
                  </div>
                </div>

                {/* Review List */}
                {reviewsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" />
                  </div>
                ) : firmReviews.length > 0 ? (
                  <div className="space-y-4">
                    {firmReviews.map((review) => {
                      const reviewTrustScore = review.trustScore || calculateReviewTrustScore(review);
                      const isExpanded = expandedReviewId === review.id;
                      const topLevelReplies = repliesCache[review.id] || [];
                      
                      return (
                        <div key={review.id} className="bg-zinc-900/30 rounded-xl p-5 border border-zinc-800 hover:border-purple-500/30 transition-all">
                          <div className="flex flex-col md:flex-row gap-4">
                            {/* Left Column */}
                            <div className="md:w-32 flex-shrink-0">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                                  {review.user?.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <div className="text-white text-sm font-medium">{review.user?.name || 'Anonymous'}</div>
                                  <div className="text-xs text-zinc-500">{new Date(review.createdAt).toLocaleDateString()}</div>
                                </div>
                              </div>
                              <div className="text-center p-2 bg-zinc-800/30 rounded-lg">
                                <div className="text-lg font-bold text-white">{review.rating}.0</div>
                                <StarRating rating={review.rating} size="sm" />
                              </div>
                              {reviewTrustScore && (
                                <div className="mt-2 p-2 bg-purple-500/10 rounded-lg text-center">
                                  <div className="text-xs text-zinc-400">Trust Score</div>
                                  <div className="text-sm font-bold text-purple-400">{reviewTrustScore}</div>
                                </div>
                              )}
                              {review.verifiedTrader && (
                                <div className="mt-2 text-center">
                                  <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                    <BadgeCheck size={10} /> Verified
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Right Column */}
                            <div className="flex-1">
                              <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                                <h4 className="text-lg font-semibold text-white">{review.title}</h4>
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
                                {isExpanded ? review.content : `${review.content.substring(0, 250)}${review.content.length > 250 ? '...' : ''}`}
                              </p>
                              {review.content.length > 250 && !isExpanded && (
                                <button onClick={() => toggleReviewExpand(review.id)} className="text-purple-400 text-xs mt-1 hover:underline">
                                  Read more
                                </button>
                              )}
                              
                              {(review.pros || review.cons) && (
                                <div className="mt-3 flex flex-wrap gap-3">
                                  {review.pros && (
                                    <div className="bg-green-500/10 rounded-lg px-3 py-1.5 border border-green-500/20">
                                      <span className="text-xs text-green-400 font-medium">✅ Pro</span>
                                      <p className="text-xs text-zinc-300 mt-0.5">{review.pros}</p>
                                    </div>
                                  )}
                                  {review.cons && (
                                    <div className="bg-red-500/10 rounded-lg px-3 py-1.5 border border-red-500/20">
                                      <span className="text-xs text-red-400 font-medium">⚠️ Con</span>
                                      <p className="text-xs text-zinc-300 mt-0.5">{review.cons}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {isExpanded && (
                                <div className="mt-4 p-3 bg-zinc-800/30 rounded-lg">
                                  <h5 className="text-xs text-zinc-500 mb-2">Detailed Ratings</h5>
                                  <div className="grid grid-cols-2 gap-3">
                                    {review.tradingConditions && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-500">Trading</span>
                                        <span className="text-white text-sm">{review.tradingConditions}/5</span>
                                      </div>
                                    )}
                                    {review.customerCare && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-500">Support</span>
                                        <span className="text-white text-sm">{review.customerCare}/5</span>
                                      </div>
                                    )}
                                    {review.userFriendliness && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-500">Usability</span>
                                        <span className="text-white text-sm">{review.userFriendliness}/5</span>
                                      </div>
                                    )}
                                    {review.payoutProcess && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-500">Payouts</span>
                                        <span className="text-white text-sm">{review.payoutProcess}/5</span>
                                      </div>
                                    )}
                                    {review.executionQuality && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-500">Execution</span>
                                        <span className="text-white text-sm">{review.executionQuality}/5</span>
                                      </div>
                                    )}
                                    {review.reliability && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-500">Reliability</span>
                                        <span className="text-white text-sm">{review.reliability}/5</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-4 mt-3 pt-2 border-t border-zinc-800">
                                <button 
                                  onClick={() => markHelpful(review.id, 'HELPFUL')} 
                                  className={`flex items-center gap-1 text-xs ${userVotes[review.id] === 'HELPFUL' ? 'text-green-400' : 'text-zinc-500 hover:text-white'}`}
                                >
                                  <ThumbsUp size={12} /> Helpful ({review.helpfulCount || 0})
                                </button>
                                <button 
                                  onClick={() => shareReview(review)} 
                                  className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors"
                                >
                                  {copiedReviewId === review.id ? <CheckCircle size={12} className="text-green-400" /> : <Share2 size={12} />} 
                                  {copiedReviewId === review.id ? 'Copied!' : 'Share'}
                                </button>
                                {review.verifiedTrader && (
                                  <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <BadgeCheck size={10} /> Verified
                                  </span>
                                )}
                                {review.payoutProcess >= 4 && (
                                  <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                                    Fast Payouts
                                  </span>
                                )}
                              </div>
                              
                              {/* ====== REPLY / COMMENT SECTION ====== */}
                              {showReplySection[review.id] && (
                                <div className="mt-4 border-t border-zinc-800 pt-4">
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
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
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
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-zinc-900/30 rounded-xl border border-zinc-800">
                    <MessageCircle className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-400">No reviews yet for this prop firm</p>
                    <p className="text-zinc-500 text-sm mt-1">Be the first to share your funded trading experience</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                      <button 
                        onClick={() => setShowReviewForm(true)} 
                        className="px-5 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:from-green-500 hover:to-emerald-500 transition-all flex items-center gap-2"
                      >
                        <Plus size={16} /> Write a Review
                      </button>
                      <PrimaryCTA href={affiliateLink} text="Get Funded" size="sm" />
                    </div>
                  </div>
                )}
                
                {/* Bottom CTA */}
                <div className="mt-8 p-6 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-2xl border border-purple-500/30 text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Join thousands of funded traders
                  </h3>
                  <p className="text-zinc-400 text-sm mb-4 max-w-md mx-auto">
                    {firm.totalTradersServed ? `${firm.totalTradersServed.toLocaleString()}+ traders` : '10,000+ traders'} have already started their journey
                  </p>
                  <PrimaryCTA href={affiliateLink} text="Start Your Challenge Today" size="md" />
                </div>
              </div>
            )}

            {/* ==================== INCIDENTS TAB ==================== */}
            {activeTab === "incidents" && (
              <div className="space-y-6">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <AlertOctagon size={24} className="text-red-400" />
                    Incidents & Reports
                  </h2>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowIncidentForm(true)} 
                      className="px-5 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg hover:from-red-500 hover:to-orange-500 transition-all flex items-center gap-2"
                    >
                      <Flag size={16} /> Report Incident
                    </button>
                    <PrimaryCTA href={affiliateLink} text="Start Trading" size="sm" />
                  </div>
                </div>

                {/* Incident Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-500/10 rounded-xl p-4 text-center border border-red-500/20">
                    <AlertTriangle size={20} className="text-red-400 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-white">{incidentCount}</div>
                    <div className="text-xs text-zinc-500">Total Reports</div>
                  </div>
                  <div className="bg-yellow-500/10 rounded-xl p-4 text-center border border-yellow-500/20">
                    <Clock size={20} className="text-yellow-400 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-white">{firmIncidents.filter(i => i.resolutionStatus === 'PENDING').length}</div>
                    <div className="text-xs text-zinc-500">Unresolved</div>
                  </div>
                  <div className="bg-green-500/10 rounded-xl p-4 text-center border border-green-500/20">
                    <CheckCircle size={20} className="text-green-400 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-white">{firmIncidents.filter(i => i.resolutionStatus === 'RESOLVED').length}</div>
                    <div className="text-xs text-zinc-500">Resolved</div>
                  </div>
                </div>

                {/* Incident List */}
                {incidentsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" />
                  </div>
                ) : firmIncidents.length > 0 ? (
                  <div className="space-y-4">
                    {firmIncidents.map((incident) => {
                      const typeInfo = incidentTypes.find(t => t.value === incident.incidentType);
                      const IconComponent = typeInfo?.icon || AlertTriangle;
                      const typeColor = typeInfo?.color || 'text-red-400';
                      const isResolved = incident.resolutionStatus === 'RESOLVED' || incident.resolutionStatus === 'CONFIRMED';
                      
                      return (
                        <div key={incident.id} className="bg-zinc-900/30 rounded-xl p-5 border border-red-500/20 hover:border-red-500/40 transition-all">
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${typeColor.replace('text', 'bg')}/10 flex-shrink-0`}>
                              <IconComponent size={20} className={typeColor} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 flex-wrap">
                                <h4 className="text-white font-semibold">{incident.title}</h4>
                                <div className="flex gap-2 flex-shrink-0">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isResolved ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {isResolved ? 'RESOLVED' : (incident.resolutionStatus || 'PENDING')}
                                  </span>
                                  {incident.verifiedBadge && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 flex items-center gap-1">
                                      <BadgeCheck size={10} /> Verified
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-zinc-300 text-sm mt-2">{incident.description}</p>
                              <div className="flex flex-wrap gap-4 mt-3 text-xs text-zinc-500">
                                <span className="flex items-center gap-1">
                                  <CalendarIcon size={12} /> {new Date(incident.incidentDate || incident.createdAt).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <AlertOctagon size={12} /> {incident.incidentType?.replace(/_/g, ' ')}
                                </span>
                                {incident.withdrawalAmount && (
                                  <span className="flex items-center gap-1">
                                    <DollarSign size={12} /> {formatCurrency(incident.withdrawalAmount)}
                                  </span>
                                )}
                                {incident.withdrawalMethod && (
                                  <span className="flex items-center gap-1">
                                    <Wallet size={12} /> {incident.withdrawalMethod}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-xs">
                                {incident.confirmations > 0 && (
                                  <span className="text-green-400 flex items-center gap-1">
                                    <Users size={12} /> {incident.confirmations} confirmations
                                  </span>
                                )}
                                {incident.disputes > 0 && (
                                  <span className="text-yellow-400 flex items-center gap-1">
                                    <AlertTriangle size={12} /> {incident.disputes} disputes
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-zinc-900/30 rounded-xl border border-zinc-800">
                    <Shield className="w-12 h-12 text-green-400 mx-auto mb-3" />
                    <p className="text-zinc-400">No incidents reported for this prop firm</p>
                    <p className="text-zinc-500 text-sm mt-1">This firm has a clean record</p>
                    <div className="mt-4">
                      <PrimaryCTA href={affiliateLink} text="Start with Confidence" size="sm" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-zinc-900/95 border-t border-zinc-800 backdrop-blur-sm md:hidden">
        <PrimaryCTA href={affiliateLink} text="Start Challenge Now" size="md" className="w-full" />
      </div>

      {/* Modals */}
      <ReviewFormModal
        isOpen={showReviewForm}
        onClose={() => setShowReviewForm(false)}
        firm={firm}
        onSuccess={handleReviewSuccess}
      />

      <IncidentFormModal
        isOpen={showIncidentForm}
        onClose={() => setShowIncidentForm(false)}
        firm={firm}
        onSuccess={handleIncidentSuccess}
      />

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