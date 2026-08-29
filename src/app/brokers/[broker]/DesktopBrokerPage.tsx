"use client";

import React, { useState, useEffect, useRef } from "react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useRegion } from "@/contexts/RegionContext";
import { slugify } from "@/lib/slugify";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, ExternalLink, Users, Shield, Zap, Clock, DollarSign,
  Check, X, BarChart3, Target, Award, Globe, Copy, CheckCircle,
  Rocket, Network, TrendingUp, ShieldCheck, ArrowLeft,
  BadgeCheck, MessageSquare, Share2, Bookmark, Eye,
  CreditCard, Smartphone, Monitor, Lock, PieChart,
  Wallet, Building, Gift, Mail, Phone, MessageCircle,
  BookOpen, AlertTriangle, ThumbsUp, ThumbsDown,
  Sparkles, Flame, Crown, Gem, Info, RefreshCw, 
  Headphones, Activity, Flag, Plus, Send as SendIcon,
  Landmark, Scale, Twitter, Facebook, Youtube, Instagram,
  Linkedin, Send, AlertOctagon, CalendarIcon,
  CheckCircle2, XCircle, HelpCircle, AwardIcon,
  Percent, Tag, Rocket as RocketIcon, Layers,
  ImagePlus, Reply, ChevronLeft, ChevronRight, Loader2,
  ArrowRight as ArrowRightIcon, Sparkle, Twitter as TwitterIcon,
  Linkedin as LinkedinIcon, Instagram as InstagramIcon,
  Youtube as YoutubeIcon, Facebook as FacebookIcon,
  Send as TelegramIcon, MapPin, Phone as PhoneIcon,
  Mail as MailIcon, Globe as GlobeIcon, Copy as CopyIcon,
  Calendar, Users as UsersIcon, Briefcase, Code, Server,
  Database, Cloud, Bot, Layout, Square, Circle,
  Triangle, Hexagon, Octagon, Pentagon, Diamond,
  Activity as ActivityIcon, BarChart, LineChart, 
  PieChart as PieChartIcon, ScatterChart, AreaChart
} from "lucide-react";
import TrustScoreBadge from "@/components/ui/TrustScoreBadge";
import { useUser } from "@/contexts/UserContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface Props { 
  params: Promise<{ broker: string }>
}

// Helper function to generate gradient for fallback
const generateGradient = (name: string) => {
  const gradients = [
    "from-blue-500 to-cyan-500", "from-purple-500 to-pink-500", 
    "from-green-500 to-emerald-500", "from-orange-500 to-red-500",
    "from-indigo-500 to-purple-500", "from-teal-500 to-green-500"
  ];
  return gradients[(name?.length || 0) % gradients.length];
};

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

// ===================== REGION AVAILABILITY HELPER =====================
const isAvailableInRegion = (broker: any, region: string) => {
  if (!broker) return false;
  if (broker.regions) {
    return broker.regions.includes(region) || 
           broker.regions.includes('GLOBAL') ||
           broker.regions.length === 0;
  }
  if (broker.region) {
    return broker.region === region || broker.region === 'GLOBAL';
  }
  return true;
};

// ===================== CONVERSION BUTTON COMPONENTS =====================

// Primary CTA Button - Large, bold, with sparkle effect
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
      className={`relative group bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white rounded-xl font-bold hover:from-blue-500 hover:via-purple-500 hover:to-pink-400 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2 overflow-hidden ${sizes[size]} ${className}`}
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

// Secondary CTA - For offers and promotions
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

// Info Card Component
function InfoCard({ icon: Icon, label, value, color = "blue" }: any) {
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
  
  return (
    <div className={`p-3 rounded-xl border ${colors[color] || colors.blue}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} />
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
      <div className="text-white font-semibold text-sm">{displayValue}</div>
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

// Warning Card Component
function WarningCard({ title, warnings, type = "warning" }: { title: string; warnings: string[]; type?: "warning" | "info" }) {
  if (!warnings || warnings.length === 0) return null;
  
  const colors = type === "warning" 
    ? "bg-red-500/10 border-red-500/20 text-red-400"
    : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
  
  return (
    <div className={`p-4 rounded-xl border ${colors} mb-6`}>
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={18} />
        <h4 className="font-semibold">{title}</h4>
      </div>
      <ul className="space-y-2">
        {warnings.map((warning, i) => (
          <li key={i} className="text-sm flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>{warning}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Enhanced Offer Card Component
function OfferCard({ bonus, affiliateLink }: { bonus: any; affiliateLink: string }) {
  if (!bonus) return null;
  
  const cleanDescription = bonus.conditions?.replace(/\$\$/g, '$') || bonus.description || '';
  
  // Determine if this is a promotion with discount/code
  const hasDiscount = bonus.discount && bonus.discount !== '';
  const hasCode = bonus.code && bonus.code !== '';
  const isPromotion = bonus.name && bonus.name !== '';
  const displayTitle = isPromotion ? bonus.name : (bonus.amount || bonus.type || 'Special Offer');
  
  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/30 hover:border-amber-500/50 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {hasDiscount && (
              <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                {bonus.discount} OFF
              </span>
            )}
            {hasCode && (
              <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400 font-mono">
                Code: {bonus.code}
              </span>
            )}
            {!hasDiscount && !hasCode && (
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Limited Offer</span>
            )}
          </div>
          <h4 className="text-white font-semibold text-base">{displayTitle}</h4>
          {cleanDescription && (
            <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{cleanDescription}</p>
          )}
          {bonus.expiry && bonus.expiry !== 'Ongoing' && bonus.expiry !== '' && (
            <p className="text-xs text-orange-400 mt-1 flex items-center gap-1">
              <Clock size={10} /> Expires: {bonus.expiry}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <div className="flex flex-col gap-2">
            {hasCode && (
              <button 
                onClick={() => navigator.clipboard.writeText(bonus.code)}
                className="px-3 py-1.5 bg-zinc-800 rounded-lg text-white text-xs hover:bg-zinc-700 transition-colors flex items-center gap-1"
              >
                <Copy size={10} /> Copy Code
              </button>
            )}
            <SecondaryCTA href={affiliateLink} text="Claim Offer" size="sm" className="!bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Social Media Links Component
function SocialLinks({ socialMedia }: { socialMedia: Record<string, string> }) {
  if (!socialMedia || Object.keys(socialMedia).length === 0) return null;
  
  const platforms: Record<string, { icon: any; label: string; color: string }> = {
    twitter: { icon: TwitterIcon, label: 'Twitter', color: 'hover:text-blue-400' },
    facebook: { icon: FacebookIcon, label: 'Facebook', color: 'hover:text-blue-600' },
    linkedin: { icon: LinkedinIcon, label: 'LinkedIn', color: 'hover:text-blue-500' },
    youtube: { icon: YoutubeIcon, label: 'YouTube', color: 'hover:text-red-500' },
    instagram: { icon: InstagramIcon, label: 'Instagram', color: 'hover:text-pink-500' },
    telegram: { icon: TelegramIcon, label: 'Telegram', color: 'hover:text-blue-400' },
  };
  
  const activePlatforms = Object.entries(socialMedia).filter(([key, value]) => value && value !== '');
  
  if (activePlatforms.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {activePlatforms.map(([key, url]) => {
        const platform = platforms[key];
        if (!platform) return null;
        const Icon = platform.icon;
        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-zinc-500 hover:text-white transition-colors ${platform.color}`}
          >
            <Icon size={20} />
          </a>
        );
      })}
    </div>
  );
}

// Award Display Component
function AwardsDisplay({ awards }: { awards: string[] }) {
  if (!awards || awards.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {awards.slice(0, 5).map((award, idx) => (
        <div key={idx} className="flex items-center gap-1 text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded-full border border-purple-500/20">
          <AwardIcon size={10} />
          <span>{award}</span>
        </div>
      ))}
      {awards.length > 5 && (
        <span className="text-xs text-zinc-500">+{awards.length - 5} more</span>
      )}
    </div>
  );
}

// Payment Methods Display
function PaymentMethodsDisplay({ methods, title }: { methods: any[]; title: string }) {
  if (!methods || methods.length === 0) return null;
  
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-zinc-300">{title}</h4>
      <div className="space-y-2">
        {methods.map((method, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 bg-zinc-800/30 rounded-lg text-sm">
            <span className="text-white">{method.name}</span>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <span>{method.processingTime || '—'}</span>
              <span>${method.minAmount || '—'} - ${method.maxAmount || '—'}</span>
              <span className="text-green-400">{method.fee || 'Free'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===================== REVIEW FORM MODAL =====================
function ReviewFormModal({ isOpen, onClose, broker, onSuccess }: { 
  isOpen: boolean; 
  onClose: () => void; 
  broker: any; 
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
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><Lock size={28} className="text-white" /></div>
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
        brokerId: broker.id,
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
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${generateGradient(broker?.name)} flex items-center justify-center text-white font-bold text-sm`}>
                {broker?.name?.charAt(0) || 'B'}
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

              <div className="flex items-center gap-2 p-2 bg-zinc-800/30 rounded-lg"><Checkbox checked={verifiedTrader} onCheckedChange={(c) => setVerifiedTrader(c as boolean)} className="border-zinc-600" /><span className="text-xs text-zinc-300">I am a verified trader</span></div>
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

// ===================== INCIDENT FORM MODAL =====================
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

function IncidentFormModal({ isOpen, onClose, broker, onSuccess }: { 
  isOpen: boolean; 
  onClose: () => void; 
  broker: any; 
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
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><Lock size={28} className="text-white" /></div>
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
        entityType: 'broker',
        entityId: broker.id,
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
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${generateGradient(broker?.name)} flex items-center justify-center text-white font-bold text-sm`}>
                {broker?.name?.charAt(0) || 'B'}
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

// ===================== MAIN COMPONENT =====================
export default function BrokerPage({ params }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { region } = useRegion();
  const [activeTab, setActiveTab] = useState('overview');
  const [broker, setBroker] = useState<any>(null);
  const [brokerReviews, setBrokerReviews] = useState<any[]>([]);
  const [brokerIncidents, setBrokerIncidents] = useState<any[]>([]);
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
  const [regionUnavailable, setRegionUnavailable] = useState(false);

  // Get region info for display
  const regionInfo = REGION_DISPLAY[region] || REGION_DISPLAY['GLOBAL'];

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) setActiveTab(tabParam);
  }, [searchParams]);

  // ===================== FIXED: LOAD BROKER DATA =====================
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const resolvedParams = await params;
        const identifier = resolvedParams.broker;
        
        console.log('🔍 Loading broker with identifier:', identifier);
        console.log('📍 Current region:', region);
        console.log('🔍 Is numeric?', /^\d+$/.test(identifier));
        
        let foundBroker = null;
        
        // STEP 1: Check if it's a numeric ID first
        const isNumeric = /^\d+$/.test(identifier);
        
        if (isNumeric) {
          // Try by ID first
          console.log('🔍 Trying by ID (numeric):', identifier);
          const idResponse = await fetch(`/api/brokers/${identifier}?region=${region}`);
          const idData = await idResponse.json();
          console.log('📡 ID API response:', idData.success ? 'Success' : 'Failed', idData.error || '');
          
          if (idData.success && idData.data) {
            foundBroker = idData.data;
            console.log('✅ Found broker by ID:', foundBroker.name);
          }
        }
        
        // STEP 2: If not found, try by slug
        if (!foundBroker) {
          console.log('🔍 Trying by slug:', identifier);
          const slugResponse = await fetch(`/api/brokers/slug/${identifier}?region=${region}`);
          const slugData = await slugResponse.json();
          console.log('📡 Slug API response:', slugData.success ? 'Success' : 'Failed', slugData.error || '');
          
          if (slugData.success && slugData.data) {
            foundBroker = slugData.data;
            console.log('✅ Found broker by slug:', foundBroker.name);
          }
        }
        
        // STEP 3: If still not found, search by name
        if (!foundBroker) {
          console.log('🔍 Searching all brokers for match...');
          const allBrokersResponse = await fetch(`/api/brokers?region=${region}&limit=100`);
          const allData = await allBrokersResponse.json();
          
          if (allData.success && allData.data) {
            const slugifiedParam = slugify(identifier);
            foundBroker = allData.data.find((b: any) => {
              return b.slug === slugifiedParam || 
                     b.slug === identifier ||
                     b.id === parseInt(identifier) ||
                     (b.name && slugify(b.name) === slugifiedParam) ||
                     b.name?.toLowerCase() === identifier.toLowerCase();
            });
            
            if (foundBroker) {
              console.log('✅ Found broker by name search:', foundBroker.name);
            }
          }
        }
        
        if (foundBroker) {
          setBroker(foundBroker);
          const available = isAvailableInRegion(foundBroker, region);
          setRegionUnavailable(!available);
          await fetchBrokerReviews(foundBroker.id);
          await fetchIncidents(foundBroker.id);
        } else {
          console.log('❌ No broker found for identifier:', identifier);
          setBroker(null);
        }
      } catch (error) {
        console.error('Error loading broker:', error);
        setBroker(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [params, region]);

  const fetchBrokerReviews = async (brokerId: number) => {
    setReviewsLoading(true);
    try {
      const response = await fetch(`/api/reviews?brokerId=${brokerId}&status=APPROVED`, { credentials: 'include' });
      const data = await response.json();
      if (response.ok) setBrokerReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchIncidents = async (brokerId: number) => {
    setIncidentsLoading(true);
    try {
      const response = await fetch(`/api/incidents?entityType=broker&entityId=${brokerId}&limit=50`, { credentials: 'include' });
      const data = await response.json();
      if (response.ok) {
        setBrokerIncidents(data.incidents || []);
        setIncidentCount(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setIncidentsLoading(false);
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
        setBrokerReviews(brokerReviews.map(review => 
          review.id === reviewId 
            ? { ...review, helpfulCount: data.helpfulCount, notHelpfulCount: data.notHelpfulCount }
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

  const handleReviewSuccess = () => {
    fetchBrokerReviews(broker.id);
  };

  const handleIncidentSuccess = () => {
    fetchIncidents(broker.id);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Trade with ${broker?.name}`, text: `Check out ${broker?.name} - a top broker!`, url: window.location.href });
      } catch (error) { console.log('Error sharing:', error); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const toggleBookmark = () => {
    if (typeof window !== 'undefined') {
      const bookmarks = JSON.parse(localStorage.getItem('brokerBookmarks') || '[]');
      const newBookmarks = bookmarked ? bookmarks.filter((b: string) => b !== broker?.slug) : [...bookmarks, broker?.slug];
      localStorage.setItem('brokerBookmarks', JSON.stringify(newBookmarks));
      setBookmarked(!bookmarked);
    }
  };

  const getInitials = (name: string): string => {
    if (!name) return "B";
    return name.split(" ").map((n: string) => n[0]).join("").slice(0, 3).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto" />
          <p className="mt-4 text-zinc-500">Loading broker details...</p>
        </div>
      </div>
    );
  }

  if (!broker) return notFound();

  // ===== CALCULATE DERIVED VALUES =====
  const totalInstruments = Object.values(broker.instruments || {}).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
  const regulations = broker.regulation?.authorities || [];
  const hasWarnings = broker.regulatoryWarnings?.length > 0;
  const hasReviews = brokerReviews.length > 0;
  const avgRating = hasReviews 
    ? brokerReviews.reduce((sum, r) => sum + r.rating, 0) / brokerReviews.length 
    : broker.rating || 0;
  const reviewCount = hasReviews ? brokerReviews.length : broker.reviewsCount || 0;
  const affiliateLink = broker.signupLink || broker.website || '#';
  
  let minDepositFromAccounts = null;
  if (broker.accountTypes && broker.accountTypes.length > 0) {
    const depositValues = broker.accountTypes
      .map((acc: any) => acc.minDeposit)
      .filter((val: number) => val !== null && val !== undefined && val > 0);
    if (depositValues.length > 0) {
      minDepositFromAccounts = Math.min(...depositValues);
    }
  }
  const effectiveMinDeposit = minDepositFromAccounts !== null 
    ? minDepositFromAccounts 
    : broker.minDeposit;
  
  const leverageDisplay = broker.leverage || broker.maxLeverage || '—';
  const tradingHoursDisplay = broker.tradingHours?.split(',')[0] || '24/5';
  const executionDisplay = broker.orderExecution?.split(' ')[0] || 'Market';
  const platformCount = broker.platforms?.length || 0;
  const accountTypesCount = broker.accountTypes?.length || 0;
  const hasIncidents = incidentCount > 0;
  
  // Combine all bonuses and promotions with proper structure
  const allBonuses = [
    ...(broker.bonuses || []).map((b: any) => ({ ...b, _type: 'bonus' })),
    ...(broker.promotions || []).map((p: any) => ({ 
      ...p, 
      _type: 'promotion',
      type: p.name,
      amount: p.discount || 'Special Offer',
      conditions: p.description || '',
      code: p.code || '',
      expiry: p.validUntil || 'Ongoing'
    }))
  ];

  // Get the best offer to display in hero
  const bestOffer = allBonuses.length > 0 ? allBonuses[0] : null;

  return (
    <div className="min-h-screen bg-black">
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
                    {broker?.name} is not available in {regionInfo.flag} {regionInfo.label}
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
          <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <div className="flex gap-5">
              {broker.logo ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700 shadow-lg flex-shrink-0">
                  <img 
                    src={broker.logo} 
                    alt={broker.name} 
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = `w-20 h-20 rounded-2xl bg-gradient-to-r ${generateGradient(broker.name)} flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0`;
                        fallback.textContent = getInitials(broker.name);
                        parent.appendChild(fallback);
                        target.remove();
                      }
                    }}
                  />
                </div>
              ) : (
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${generateGradient(broker.name)} flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0`}>
                  {broker.name?.charAt(0) || 'B'}
                </div>
              )}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{broker.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  {hasReviews ? (
                    <StarRating rating={avgRating} count={reviewCount} size="md" />
                  ) : (
                    <span className="text-sm text-zinc-500">No reviews yet</span>
                  )}
                  {(broker.trustScore > 0 || broker.avgTrustScore > 0) && (
                    <TrustScoreDisplay score={broker.trustScore || broker.avgTrustScore || 0} />
                  )}
                  {broker.regulated && (
                    <span className="flex items-center gap-1 text-green-400 text-sm bg-green-500/10 px-2 py-1 rounded-full">
                      <ShieldCheck size={12} /> Regulated
                    </span>
                  )}
                  <div className="flex items-center gap-1 text-zinc-400 text-sm">
                    <Globe size={12} /> {broker.country || 'International'}
                  </div>
                  {broker.founded && (
                    <div className="flex items-center gap-1 text-zinc-400 text-sm">
                      <Calendar size={12} /> Est. {broker.founded}
                    </div>
                  )}
                </div>
                <p className="text-zinc-400 max-w-2xl">{broker.shortDescription || broker.description?.substring(0, 200)}</p>
                
                {/* Social Media Links */}
                <SocialLinks socialMedia={broker.socialMedia} />
                
                {/* Awards Display */}
                <AwardsDisplay awards={broker.awards} />
              </div>
            </div>
            <div className="flex-shrink-0 flex flex-col items-end gap-3">
              <PrimaryCTA href={affiliateLink} text="Open Account →" size="lg" />
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <CheckCircle2 size={12} className="text-green-400" />
                <span>Trusted by traders worldwide</span>
                <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                <Shield size={12} className="text-purple-400" />
                <span>Regulated broker</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mt-8">
            <InfoCard icon={DollarSign} label="Min Deposit" value={effectiveMinDeposit ? `$${effectiveMinDeposit}` : '—'} color="green" />
            <InfoCard icon={TrendingUp} label="Max Leverage" value={leverageDisplay} color="blue" />
            <InfoCard icon={Layers} label="Account Types" value={accountTypesCount} color="purple" />
            <InfoCard icon={Wallet} label="Instruments" value={`${totalInstruments}+`} color="orange" />
            <InfoCard icon={Smartphone} label="Platforms" value={platformCount} color="cyan" />
            <InfoCard icon={Clock} label="Trading Hours" value={tradingHoursDisplay} color="yellow" />
            <InfoCard icon={Zap} label="Execution" value={executionDisplay} color="pink" />
            <div className={`p-3 rounded-xl border bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30 hover:border-blue-500/60 transition-all cursor-pointer group`}>
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-[10px] text-zinc-400 mb-1">Ready to Trade?</div>
                <button 
                  onClick={() => window.open(affiliateLink, '_blank')}
                  className="text-white font-semibold text-sm flex items-center gap-1 group-hover:text-blue-400 transition-colors"
                >
                  Open Account <ArrowRightIcon size={12} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {bestOffer && (
            <div className="mt-6">
              <OfferCard bonus={bestOffer} affiliateLink={affiliateLink} />
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
              { id: "offers", label: `Offers${allBonuses.length > 0 ? ` (${allBonuses.length})` : ''}`, icon: Gift },
              { id: "regulation", label: "Regulation", icon: ShieldCheck },
              { id: "trading", label: "Trading", icon: TrendingUp },
              { id: "accounts", label: "Accounts", icon: Wallet },
              { id: "platforms", label: "Platforms", icon: Smartphone },
              { id: "fees", label: "Fees", icon: DollarSign },
              { id: "support", label: "Support", icon: Headphones },
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

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            className="space-y-6"
          >
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
                <h2 className="text-xl font-bold text-white mb-4">About {broker.name}</h2>
                <p className="text-zinc-400 leading-relaxed">{broker.description || 'No description available.'}</p>
                
                {regulations.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-zinc-300 mb-2">Regulation</h3>
                    <div className="flex flex-wrap gap-2">
                      {regulations.map((reg: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm border border-green-500/20">
                          {reg}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Offers Tab */}
            {activeTab === 'offers' && (
              <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Offers & Promotions</h2>
                {allBonuses.length > 0 ? (
                  <div className="space-y-4">
                    {allBonuses.map((bonus: any, idx: number) => (
                      <OfferCard key={idx} bonus={bonus} affiliateLink={affiliateLink} />
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-400">No current offers available.</p>
                )}
              </div>
            )}

            {/* Regulation Tab */}
            {activeTab === 'regulation' && (
              <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Regulation & Compliance</h2>
                <div className="space-y-4">
                  {regulations.length > 0 ? (
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-300 mb-2">Regulatory Bodies</h3>
                      <div className="flex flex-wrap gap-2">
                        {regulations.map((reg: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm border border-green-500/20">
                            {reg}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-zinc-400">No regulation information available.</p>
                  )}
                  {hasWarnings && (
                    <WarningCard title="Regulatory Warnings" warnings={broker.regulatoryWarnings} type="warning" />
                  )}
                </div>
              </div>
            )}

            {/* Trading Tab */}
            {activeTab === 'trading' && (
              <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Trading Conditions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-zinc-800">
                      <span className="text-zinc-400">Max Leverage</span>
                      <span className="text-white font-medium">{leverageDisplay}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-zinc-800">
                      <span className="text-zinc-400">Min Deposit</span>
                      <span className="text-white font-medium">${effectiveMinDeposit || '—'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-zinc-800">
                      <span className="text-zinc-400">Order Execution</span>
                      <span className="text-white font-medium">{executionDisplay}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-zinc-800">
                      <span className="text-zinc-400">Trading Hours</span>
                      <span className="text-white font-medium">{tradingHoursDisplay}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-zinc-800">
                      <span className="text-zinc-400">Platforms</span>
                      <span className="text-white font-medium">{platformCount}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-zinc-800">
                      <span className="text-zinc-400">Account Types</span>
                      <span className="text-white font-medium">{accountTypesCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Accounts Tab */}
            {activeTab === 'accounts' && (
              <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Account Types</h2>
                {broker.accountTypes && broker.accountTypes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {broker.accountTypes.map((acc: any, idx: number) => (
                      <div key={idx} className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700">
                        <h3 className="text-white font-semibold mb-2">{acc.name || 'Standard Account'}</h3>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Min Deposit</span>
                            <span className="text-white">${acc.minDeposit || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Spread Type</span>
                            <span className="text-white">{acc.spreadType || 'Variable'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Commission</span>
                            <span className="text-white">{acc.commission || 'No commission'}</span>
                          </div>
                          {acc.swapFree && (
                            <div className="flex justify-between">
                              <span className="text-zinc-400">Swap-Free</span>
                              <span className="text-green-400">✅ Available</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-400">No account information available.</p>
                )}
              </div>
            )}

            {/* Platforms Tab */}
            {activeTab === 'platforms' && (
              <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Trading Platforms</h2>
                {broker.platforms && broker.platforms.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {broker.platforms.map((platform: string, idx: number) => (
                      <span key={idx} className="px-4 py-2 bg-zinc-800 rounded-xl text-white border border-zinc-700">
                        {platform}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-400">No platform information available.</p>
                )}
              </div>
            )}

            {/* Fees Tab */}
            {activeTab === 'fees' && (
              <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Fees & Costs</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-zinc-800">
                      <span className="text-zinc-400">Min Deposit</span>
                      <span className="text-white font-medium">${effectiveMinDeposit || '—'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-zinc-800">
                      <span className="text-zinc-400">Min Withdrawal</span>
                      <span className="text-white font-medium">${broker.minWithdrawal || '—'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-zinc-800">
                      <span className="text-zinc-400">Withdrawal Fee</span>
                      <span className="text-white font-medium">{broker.withdrawalFee || 'No fee'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-zinc-800">
                      <span className="text-zinc-400">Inactivity Fee</span>
                      <span className="text-white font-medium">{broker.inactivityFee || 'No fee'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-zinc-800">
                      <span className="text-zinc-400">Margin Call</span>
                      <span className="text-white font-medium">{broker.marginCall || '100%'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-zinc-800">
                      <span className="text-zinc-400">Stop Out Level</span>
                      <span className="text-white font-medium">{broker.stopOutLevel || '50%'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Support Tab */}
            {activeTab === 'support' && (
              <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Customer Support</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-zinc-800">
                      <span className="text-zinc-400">Support Languages</span>
                      <span className="text-white font-medium">{broker.supportLanguages?.join(', ') || 'English'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-zinc-800">
                      <span className="text-zinc-400">Availability</span>
                      <span className="text-white font-medium">{broker.supportAvailability || '24/5'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-zinc-800">
                      <span className="text-zinc-400">Channels</span>
                      <span className="text-white font-medium">Live Chat, Email, Phone</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-zinc-800">
                      <span className="text-zinc-400">Response Time</span>
                      <span className="text-white font-medium">Under 5 minutes (live chat)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Reviews</h2>
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
                  >
                    Write a Review
                  </button>
                </div>
                {reviewsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 size={24} className="animate-spin text-purple-500 mx-auto" />
                  </div>
                ) : brokerReviews.length > 0 ? (
                  <div className="space-y-4">
                    {brokerReviews.map((review) => (
                      <div key={review.id} className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {review.user?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="text-white font-medium">{review.user?.name || 'Anonymous'}</div>
                            <div className="flex items-center gap-2">
                              <StarRating rating={review.rating || 0} size="sm" />
                              <span className="text-xs text-zinc-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <h4 className="text-white font-semibold mb-1">{review.title}</h4>
                        <p className="text-zinc-400 text-sm">{review.content}</p>
                        <div className="flex items-center gap-4 mt-3 pt-2 border-t border-zinc-700">
                          <button
                            onClick={() => markHelpful(review.id, 'HELPFUL')}
                            className={`flex items-center gap-1 text-xs ${userVotes[review.id] === 'HELPFUL' ? 'text-green-400' : 'text-zinc-500'}`}
                          >
                            <ThumbsUp size={12} /> Helpful ({review.helpfulCount || 0})
                          </button>
                          <button
                            onClick={() => shareReview(review)}
                            className="flex items-center gap-1 text-xs text-zinc-500"
                          >
                            <Share2 size={12} /> Share
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-400 text-center py-8">No reviews yet. Be the first to share your experience!</p>
                )}
              </div>
            )}

            {/* Incidents Tab */}
            {activeTab === 'incidents' && (
              <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Incidents</h2>
                  <button
                    onClick={() => setShowIncidentForm(true)}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg text-sm font-medium hover:from-red-500 hover:to-orange-500 transition-all"
                  >
                    Report Incident
                  </button>
                </div>
                {incidentsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 size={24} className="animate-spin text-purple-500 mx-auto" />
                  </div>
                ) : brokerIncidents.length > 0 ? (
                  <div className="space-y-4">
                    {brokerIncidents.map((incident) => (
                      <div key={incident.id} className="bg-red-500/5 rounded-xl p-4 border border-red-500/20">
                        <div className="flex items-start gap-3">
                          <AlertTriangle size={16} className="text-red-400 mt-1 flex-shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-white font-semibold">{incident.title}</h4>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                incident.resolutionStatus === 'RESOLVED' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {incident.resolutionStatus || 'PENDING'}
                              </span>
                            </div>
                            <p className="text-zinc-400 text-sm mt-1">{incident.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                              <span>{new Date(incident.createdAt).toLocaleDateString()}</span>
                              <span>{incident.incidentType?.replace(/_/g, ' ')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-400 text-center py-8">No incidents reported for this broker.</p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating CTA - Sticky at bottom on mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-zinc-900/95 border-t border-zinc-800 backdrop-blur-sm md:hidden">
        <PrimaryCTA href={affiliateLink} text="Open Account Now" size="md" className="w-full" />
      </div>

      {/* Review Form Modal */}
      <ReviewFormModal
        isOpen={showReviewForm}
        onClose={() => setShowReviewForm(false)}
        broker={broker}
        onSuccess={handleReviewSuccess}
      />

      {/* Incident Form Modal */}
      <IncidentFormModal
        isOpen={showIncidentForm}
        onClose={() => setShowIncidentForm(false)}
        broker={broker}
        onSuccess={handleIncidentSuccess}
      />
    </div>
  );
}