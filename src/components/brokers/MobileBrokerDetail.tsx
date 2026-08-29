// components/brokers/MobileBrokerDetail.tsx - FULLY UPDATED WITH REGION AWARENESS

'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useRegion } from "@/contexts/RegionContext";
import { slugify } from "@/lib/slugify";
import { formatCurrency } from "@/utils/api-helpers";
import TrustScoreBadge from "@/components/ui/TrustScoreBadge";
import MobileLayout from "@/components/mobile/MobileLayout";
import { 
  Star, ArrowLeft, ExternalLink, Share2, Bookmark, 
  Gift, Rocket, Shield, Clock, Globe, AlertTriangle,
  DollarSign, TrendingUp, Target, Network, Monitor,
  ShieldCheck, Wallet, Headphones, MessageSquare,
  AlertOctagon, CheckCircle, X, Copy, ThumbsUp,
  Calendar, Flag, SendIcon, Lock, Plus, Eye,
  ChevronDown, ChevronUp, Building, PieChart,
  Smartphone, Landmark, BookOpen, MessageCircle,
  Users, CreditCard, Zap, Award, BadgeCheck,
  Scale, Banknote, HeartHandshake, Activity,
  BarChart3, Gauge, Trophy, Medal, Compass,
  GitCompare, Layers, Grid3x3, List, Sparkle,
  ArrowRight as ArrowRightIcon, Crown, Gem,
  ImagePlus, Reply, Loader2, Info, AlertCircle,
  ThumbsDown as ThumbsDownIcon, Twitter, Facebook,
  Youtube, Instagram, Linkedin, CalendarIcon,
  CheckCircle2, XCircle, HelpCircle, ChevronLeft
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

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
  GLOBAL: { label: 'Global', flag: '🌍' },
};

// ===================== HELPER FUNCTIONS =====================

// Safe string conversion - prevents "Objects are not valid as React child" errors
const safeString = (value: any): string => {
  if (value === undefined || value === null) return '—';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') {
    try {
      if (Array.isArray(value)) {
        return value.map(v => safeString(v)).join(', ');
      }
      if (value.name) return String(value.name);
      if (value.label) return String(value.label);
      if (value.amount) return `$${value.amount}`;
      if (value.value) return String(value.value);
      return JSON.stringify(value);
    } catch {
      return '—';
    }
  }
  return String(value);
};

// Safe regulation display
const safeRegulation = (regulation: any): string => {
  if (!regulation) return '—';
  if (typeof regulation === 'string') return regulation;
  if (Array.isArray(regulation)) {
    if (regulation.length === 0) return '—';
    return regulation.map(r => safeRegulation(r)).join(', ');
  }
  if (typeof regulation === 'object') {
    if (regulation.authorities && Array.isArray(regulation.authorities)) {
      return regulation.authorities.map((a: any) => safeRegulation(a)).join(', ');
    }
    if (regulation.name) return safeString(regulation.name);
    if (regulation.label) return safeString(regulation.label);
    return safeString(regulation);
  }
  return safeString(regulation);
};

// Get leverage display value
const getLeverageDisplay = (leverage: any): string => {
  if (!leverage) return '—';
  if (typeof leverage === 'string') {
    if (leverage.startsWith('1:')) return leverage;
    if (leverage.startsWith(':')) return `1${leverage}`;
    return `1:${leverage}`;
  }
  if (typeof leverage === 'number') return `1:${leverage}`;
  if (typeof leverage === 'object') {
    const values = Object.values(leverage);
    if (values.length > 0) {
      const firstVal = values[0];
      if (typeof firstVal === 'string' && firstVal.startsWith('1:')) return firstVal;
      if (typeof firstVal === 'string') return `1:${firstVal}`;
      if (typeof firstVal === 'number') return `1:${firstVal}`;
      return safeString(firstVal);
    }
    if (leverage.max) return getLeverageDisplay(leverage.max);
    if (leverage.forex) return getLeverageDisplay(leverage.forex);
  }
  return safeString(leverage);
};

// Helper to generate gradient
const generateGradient = (name: string) => {
  const gradients = [
    "from-pink-500 to-purple-500", "from-blue-500 to-purple-500",
    "from-green-500 to-blue-500", "from-yellow-500 to-orange-500",
    "from-red-500 to-pink-500", "from-indigo-500 to-blue-500"
  ];
  return gradients[(name?.length || 0) % gradients.length];
};

// Check if broker is regulated
const isBrokerRegulated = (broker: any): boolean => {
  if (!broker) return false;
  if (broker.regulated === true) return true;
  if (broker.regulated === 'true' || broker.regulated === 'Yes') return true;
  if (broker.regulated === false || broker.regulated === 'false' || broker.regulated === 'No') return false;
  
  if (broker.regulation) {
    if (typeof broker.regulation === 'string' && broker.regulation.length > 0) return true;
    if (typeof broker.regulation === 'object') {
      const hasData = Object.values(broker.regulation).some(v => v !== null && v !== undefined && v !== '');
      if (hasData) return true;
    }
  }
  
  if (broker.regulatoryBodies && broker.regulatoryBodies.length > 0) return true;
  
  return false;
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

// ===================== BUTTON COMPONENTS =====================

// Primary CTA - Mobile
function MobilePrimaryCTA({ href, text, className = "", showSparkle = true }: { 
  href: string; 
  text: string; 
  className?: string;
  showSparkle?: boolean;
}) {
  if (!href) href = '#';
  return (
    <button 
      onClick={() => href !== '#' && window.open(href, '_blank')}
      className={`relative group bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white rounded-xl font-bold hover:from-blue-500 hover:via-purple-500 hover:to-pink-400 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2 overflow-hidden py-3 px-4 text-sm w-full ${className}`}
    >
      {showSparkle && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
      )}
      {showSparkle && <Sparkle size={14} className="text-white/80" />}
      {text}
      <ExternalLink size={12} />
    </button>
  );
}

// Secondary CTA - For offers
function MobileSecondaryCTA({ href, text, className = "" }: { 
  href: string; 
  text: string; 
  className?: string;
}) {
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

// ===================== UI COMPONENTS =====================

// Star Rating Component
function StarRating({ rating, count = 0, size = "sm", readonly = true, setRating }: { 
  rating: number; 
  count?: number; 
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  setRating?: (rating: number) => void;
}) {
  const sizes = { sm: "w-3.5 h-3.5", md: "w-5 h-5", lg: "w-6 h-6" };
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
            <span>{safeString(warning)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ===================== INCIDENT TYPES =====================
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

// ===================== REVIEW FORM MODAL =====================
function ReviewFormModal({ isOpen, onClose, broker, onSuccess }: any) {
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
      const ratings = [withdrawalExperience, executionQuality, reliability, customerSupport].filter(r => r > 0);
      const totalRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

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
              {broker?.logo ? (
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700">
                  <img src={broker.logo} alt={broker.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${generateGradient(broker?.name)} flex items-center justify-center text-white font-bold text-sm`}>
                  {broker?.name?.charAt(0) || 'B'}
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
function IncidentFormModal({ isOpen, onClose, broker, onSuccess }: any) {
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
              {broker?.logo ? (
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700">
                  <img src={broker.logo} alt={broker.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${generateGradient(broker?.name)} flex items-center justify-center text-white font-bold text-sm`}>
                  {broker?.name?.charAt(0) || 'B'}
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
          <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${generateGradient(reply.user?.name || reply.broker?.name || 'Reply')} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
            {(reply.user?.name?.charAt(0) || reply.broker?.name?.charAt(0) || 'U').toUpperCase()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-white text-sm">
                {reply.user?.name || reply.broker?.name || 'Anonymous'}
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
            <p className="text-zinc-300 text-sm mt-1 break-words">{safeString(reply.content)}</p>
            
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
                      {isSubmitting ? <Loader2 size={10} className="animate-spin" /> : <SendIcon size={10} />}
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
    <div
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
      
      <div
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
      </div>
      
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
    </div>
  );
}

// ===================== MAIN COMPONENT =====================
export default function MobileBrokerDetail({ params }: { params: { broker: string } }) {
  const router = useRouter();
  const { user } = useUser();
  const { region } = useRegion();
  const [broker, setBroker] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'platforms' | 'instruments' | 'bonuses' | 'regulation' | 'reputation' | 'reviews' | 'incidents'>('overview');
  const [brokerReviews, setBrokerReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [brokerIncidents, setBrokerIncidents] = useState<number>(0);
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

  // Get region info for display
  const regionInfo = REGION_DISPLAY[region] || REGION_DISPLAY['GLOBAL'];

  // Fetch replies when reply section is opened
  useEffect(() => {
    const reviewIds = Object.keys(showReplySection).filter(id => showReplySection[id] && !repliesCache[id]);
    reviewIds.forEach(async (reviewId) => {
      await fetchRepliesForParent(reviewId, null);
    });
  }, [showReplySection]);

  // ===================== FIXED: Load broker data with region =====================
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const identifier = params.broker;
        console.log('🔍 Mobile: Loading broker with identifier:', identifier);
        console.log('📍 Mobile: Current region:', region);
        
        let foundBroker = null;
        
        // Try by slug first (most common)
        const slugResponse = await fetch(`/api/brokers/slug/${identifier}?region=${region}`);
        const slugData = await slugResponse.json();
        
        if (slugData.success && slugData.data) {
          foundBroker = slugData.data;
          console.log('✅ Mobile: Found broker by slug:', foundBroker.name);
        }
        
        // If slug fails and identifier is numeric, try by ID
        if (!foundBroker) {
          const numericId = parseInt(identifier);
          if (!isNaN(numericId)) {
            const idResponse = await fetch(`/api/brokers/${numericId}?region=${region}`);
            const idData = await idResponse.json();
            if (idData.success && idData.data) {
              foundBroker = idData.data;
              console.log('✅ Mobile: Found broker by ID:', foundBroker.name);
            }
          }
        }
        
        // Fallback: search all brokers
        if (!foundBroker) {
          console.log('🔄 Mobile: Searching all brokers...');
          const allBrokersResponse = await fetch(`/api/brokers?region=${region}&limit=100`);
          const allData = await allBrokersResponse.json();
          
          if (allData.success && allData.data) {
            const slugifiedParam = slugify(identifier);
            foundBroker = allData.data.find((b: any) => {
              return b.slug === slugifiedParam || 
                     b.slug === identifier ||
                     (b.name && slugify(b.name) === slugifiedParam) ||
                     b.name?.toLowerCase() === identifier.toLowerCase();
            });
            if (foundBroker) {
              console.log('✅ Mobile: Found broker in fallback search:', foundBroker.name);
            }
          }
        }
        
        if (foundBroker) {
          setBroker(foundBroker);
          if (typeof window !== 'undefined') {
            const bookmarks = JSON.parse(localStorage.getItem('brokerBookmarks') || '[]');
            setIsBookmarked(bookmarks.includes(foundBroker.slug || slugify(foundBroker.name)));
          }
          await Promise.all([
            fetchBrokerReviews(foundBroker.id),
            fetchIncidents(foundBroker.id)
          ]);
        } else {
          setError('Broker not found');
          console.log('❌ Mobile: No broker found for:', identifier);
        }
      } catch (err) {
        console.error('❌ Mobile: Error loading broker:', err);
        setError('Failed to load broker data');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [params.broker, region]);

  const fetchBrokerReviews = async (brokerId: number) => {
    setReviewsLoading(true);
    try {
      const response = await fetch(`/api/reviews?brokerId=${brokerId}&status=APPROVED`, { credentials: 'include' });
      const data = await response.json();
      if (response.ok) {
        const reviews = data.reviews || [];
        setBrokerReviews(reviews);
        if (reviews.length > 0 && broker) {
          const avgRating = reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length;
          setBroker(prev => prev ? { ...prev, rating: avgRating } : null);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchIncidents = async (brokerId: number) => {
    try {
      const response = await fetch(`/api/incidents?entityType=broker&entityId=${brokerId}&limit=20`);
      const data = await response.json();
      if (response.ok) {
        setBrokerIncidents(data.pagination?.total || 0);
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
  const handleSubmitReply = async (reviewId: string, parentId: string | null = null, content: string, mediaFiles: File[]) => {
    const success = await submitReply(reviewId, parentId, content, mediaFiles);
    if (success) {
      const cacheKey = parentId ? `${reviewId}_parent_${parentId}` : reviewId;
      const freshReplies = await fetchRepliesForParent(reviewId, parentId);
      setRepliesCache(prev => ({ ...prev, [cacheKey]: freshReplies }));
      setShowReplySection(prev => ({ ...prev, [reviewId]: true }));
    }
    return success;
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
        setBrokerReviews(brokerReviews.map(review => 
          review.id === reviewId ? { ...review, helpfulCount: data.helpfulCount } : review
        ));
      }
    } catch (error) { console.error('Error voting:', error); }
  };

  const shareReview = (review: any) => {
    const shareUrl = `${window.location.origin}/reviews/${review.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedCode(shareUrl);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleBookmark = () => {
    if (typeof window !== 'undefined' && broker) {
      const bookmarks = JSON.parse(localStorage.getItem('brokerBookmarks') || '[]');
      const slug = broker.slug || slugify(broker.name);
      const newBookmarks = isBookmarked ? bookmarks.filter((b: string) => b !== slug) : [...bookmarks, slug];
      localStorage.setItem('brokerBookmarks', JSON.stringify(newBookmarks));
      setIsBookmarked(!isBookmarked);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: `Trade with ${broker?.name || 'Broker'}`, url: window.location.href }); } 
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

  const calculateReviewTrustScore = (review: any) => {
    let score = 0;
    let totalWeight = 0;
    
    if (review.withdrawalExperience > 0) {
      score += (review.withdrawalExperience / 5) * 40;
      totalWeight += 40;
    }
    if (review.executionQuality > 0) {
      score += (review.executionQuality / 5) * 20;
      totalWeight += 20;
    }
    if (review.reliability > 0) {
      score += (review.reliability / 5) * 20;
      totalWeight += 20;
    }
    if (review.customerSupport > 0) {
      score += (review.customerSupport / 5) * 10;
      totalWeight += 10;
    }
    if (review.wouldRecommend === 'Yes') {
      score += 10;
      totalWeight += 10;
    }
    
    if (totalWeight === 0) return null;
    return Math.round((score / totalWeight) * 100);
  };

  const calculateTrustStats = () => {
    if (!brokerReviews || brokerReviews.length === 0) {
      return { 
        avgTrustScore: broker?.avgTrustScore || 0, 
        totalReviews: broker?.reviewsCount || 0,
        withdrawalSuccess: 0,
        executionQuality: 0,
        avgReliability: 0,
        recommendationRate: 0,
        avgRating: broker?.rating || 0
      };
    }
    const avgTrustScore = brokerReviews.reduce((sum, r) => sum + (r.trustScore || 0), 0) / brokerReviews.length;
    const withdrawalSuccess = brokerReviews.filter(r => r.withdrawalExperience).reduce((sum, r) => sum + (r.withdrawalExperience || 0), 0) / (brokerReviews.filter(r => r.withdrawalExperience).length || 1);
    const executionQuality = brokerReviews.filter(r => r.executionQuality).reduce((sum, r) => sum + (r.executionQuality || 0), 0) / (brokerReviews.filter(r => r.executionQuality).length || 1);
    const avgReliability = brokerReviews.filter(r => r.reliability).reduce((sum, r) => sum + (r.reliability || 0), 0) / (brokerReviews.filter(r => r.reliability).length || 1);
    const recommendationRate = (brokerReviews.filter(r => r.wouldRecommend === 'Yes').length / brokerReviews.length) * 100;
    const avgRating = brokerReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / brokerReviews.length;
    
    return { 
      avgTrustScore, 
      totalReviews: brokerReviews.length, 
      withdrawalSuccess, 
      executionQuality, 
      avgReliability, 
      recommendationRate,
      avgRating
    };
  };

  const trustStats = calculateTrustStats();
  const minDeposit = Math.min(...(broker?.accountTypes?.map((acc: any) => acc.minDeposit) || [100]));
  const totalPlatforms = broker?.platforms?.length || broker?.platform?.length || 0;
  const totalInstruments = Object.values(broker?.instruments || {}).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
  const regulations = broker?.regulation?.authorities || (typeof broker?.regulation === 'string' ? [broker.regulation] : []);
  const affiliateLink = broker?.signupLink || broker?.website || '#';
  const displayRating = trustStats.avgRating || broker?.rating || 0;
  const allBonuses = [...(broker?.bonuses || []), ...(broker?.promotions || [])];
  const hasWarnings = broker?.regulatoryWarnings?.length > 0;
  const regulated = isBrokerRegulated(broker);

  // Check if broker is available in region
  const isAvailable = broker ? isAvailableInRegion(broker, region) : true;

  if (isLoading) {
    return (
      <MobileLayout title="Broker Details" showSearch={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" /><p className="text-xs text-zinc-500 mt-3">Loading broker...</p></div>
        </div>
      </MobileLayout>
    );
  }

  if (error || !broker) {
    return (
      <MobileLayout title="Broker Details" showSearch={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center"><AlertTriangle size={32} className="text-red-400 mx-auto mb-3" /><p className="text-zinc-500">{error || 'Broker not found'}</p><button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-purple-600 rounded-lg text-white text-sm">Go Back</button></div>
        </div>
      </MobileLayout>
    );
  }

  // Show region unavailable warning
  const showRegionWarning = !isAvailable && broker;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'accounts', label: 'Accounts', icon: Wallet },
    { id: 'platforms', label: 'Platforms', icon: Monitor },
    { id: 'instruments', label: 'Instruments', icon: PieChart },
    { id: 'bonuses', label: 'Bonuses', icon: Gift },
    { id: 'regulation', label: 'Regulation', icon: ShieldCheck },
    { id: 'reputation', label: 'Reputation', icon: Shield },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'incidents', label: 'Incidents', icon: AlertOctagon },
  ];

  return (
    <MobileLayout title={broker.name} showSearch={false}>
      <div className="space-y-4 pb-6">
        
        {/* Region Unavailable Warning */}
        {showRegionWarning && (
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
        )}
        
        {/* ==================== HERO SECTION ==================== */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-5 border border-purple-500/30">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* LOGO */}
              {broker.logo ? (
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0">
                  <img 
                    src={broker.logo} 
                    alt={broker.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = `w-16 h-16 rounded-xl bg-gradient-to-r ${generateGradient(broker.name)} flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0`;
                        fallback.textContent = broker.name?.charAt(0) || 'B';
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${generateGradient(broker.name)} flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0`}>
                  {broker.name?.charAt(0) || 'B'}
                </div>
              )}
              <div>
                <h1 className="text-white font-bold text-xl">{safeString(broker.name)}</h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <StarRating rating={displayRating} count={trustStats.totalReviews} size="sm" />
                  <div className="flex items-center gap-1"><Globe size={12} className="text-zinc-400" /><span className="text-xs text-zinc-400">{safeString(broker.country || 'International')}</span></div>
                  {regulated && <BadgeCheck size={14} className="text-green-400" />}
                  {broker.trustScore > 0 && <TrustScoreDisplay score={broker.trustScore || broker.avgTrustScore || 0} />}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={toggleBookmark} className="p-2 rounded-lg bg-zinc-800"><Bookmark size={16} className={isBookmarked ? "text-yellow-400 fill-yellow-400" : "text-zinc-400"} /></button>
              <button onClick={handleShare} className="p-2 rounded-lg bg-zinc-800"><Share2 size={16} className="text-zinc-400" /></button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
              <div className="text-[10px] text-zinc-500">Min Deposit</div>
              <div className="text-white font-bold text-sm">${minDeposit}</div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
              <div className="text-[10px] text-zinc-500">Leverage</div>
              <div className="text-white font-bold text-sm">{getLeverageDisplay(broker.leverage)}</div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
              <div className="text-[10px] text-zinc-500">Trust Score</div>
              <div className="text-white font-bold text-sm">{Math.round(trustStats.avgTrustScore || 0)}%</div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <MobilePrimaryCTA href={affiliateLink} text="Open Account →" />
            {allBonuses.length > 0 && (
              <div className="flex gap-2">
                <button className="flex-1 py-2.5 bg-zinc-800 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2">
                  <Gift size={14} className="text-amber-400" /> {safeString(allBonuses[0].amount || 'Bonus Available')}
                </button>
                {allBonuses[0].code && (
                  <button onClick={() => handleCopyCode(allBonuses[0].code)} className="px-3 py-2.5 bg-zinc-800 rounded-xl text-white text-sm font-medium flex items-center gap-1">
                    {copiedCode === allBonuses[0].code ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Incident Alert */}
        {brokerIncidents > 0 && (
          <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20 flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-400" />
            <p className="text-xs text-red-400">{brokerIncidents} incident{brokerIncidents !== 1 ? 's' : ''} reported</p>
          </div>
        )}

        {/* ==================== TABS ==================== */}
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

        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* About */}
            <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
              <h2 className="text-white font-semibold text-sm mb-2">About {safeString(broker.name)}</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">{safeString(broker.description)}</p>
            </div>

            {/* Warnings */}
            {hasWarnings && (
              <WarningCard title="Regulatory Warnings" warnings={broker.regulatoryWarnings} type="warning" />
            )}

            {/* Risk Assessment */}
            {broker.riskLevel && (
              <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2"><Shield size={14} className="text-purple-400" />Risk Assessment</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                    <div className="text-[10px] text-zinc-500">Risk Level</div>
                    <div className={`text-sm font-bold ${broker.riskLevel === 'Low' ? 'text-green-400' : broker.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>{safeString(broker.riskLevel)}</div>
                  </div>
                  {broker.riskScore && (
                    <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                      <div className="text-[10px] text-zinc-500">Risk Score</div>
                      <div className="text-white text-sm font-bold">{safeString(broker.riskScore)}/100</div>
                    </div>
                  )}
                </div>
                {broker.recommendation && (
                  <div className="mt-2 bg-zinc-800/30 rounded-lg p-2 text-center">
                    <div className="text-[10px] text-zinc-500">Recommendation</div>
                    <div className="text-white text-xs font-medium">{safeString(broker.recommendation)}</div>
                  </div>
                )}
                {broker.riskFactors?.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-[10px] text-zinc-500 mb-1">Risk Factors</h4>
                    <ul className="space-y-0.5">
                      {broker.riskFactors.slice(0, 3).map((factor: string, i: number) => (
                        <li key={i} className="text-[10px] text-zinc-400 flex items-start gap-1.5">
                          <AlertCircle size={8} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                          {safeString(factor)}
                        </li>
                      ))}
                      {broker.riskFactors.length > 3 && (
                        <li className="text-[10px] text-zinc-500">+{broker.riskFactors.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Financial Performance */}
            {(broker.totalPayoutsPaid || broker.totalTradersServed || broker.countriesServed) && (
              <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2"><BarChart3 size={14} className="text-green-400" />Financial Performance</h3>
                <div className="grid grid-cols-2 gap-2">
                  {broker.totalPayoutsPaid && (
                    <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                      <div className="text-[10px] text-zinc-500">Total Payouts</div>
                      <div className="text-green-400 text-sm font-bold">{safeString(broker.totalPayoutsPaid)}</div>
                      {broker.totalPayoutsVerified && (
                        <span className="text-[8px] bg-green-500/20 text-green-400 px-1 py-0.5 rounded-full">Verified</span>
                      )}
                    </div>
                  )}
                  {broker.totalTradersServed && (
                    <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                      <div className="text-[10px] text-zinc-500">Traders Served</div>
                      <div className="text-white text-sm font-bold">{safeString(broker.totalTradersServed)}</div>
                    </div>
                  )}
                  {broker.countriesServed && (
                    <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                      <div className="text-[10px] text-zinc-500">Countries</div>
                      <div className="text-white text-sm font-bold">{safeString(broker.countriesServed)}+</div>
                    </div>
                  )}
                  {broker.dailyTradeCount && (
                    <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                      <div className="text-[10px] text-zinc-500">Daily Trades</div>
                      <div className="text-white text-sm font-bold">{safeString(broker.dailyTradeCount)}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Trading Conditions */}
            <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2"><TrendingUp size={14} className="text-green-400" />Trading Conditions</h3>
                <MobilePrimaryCTA href={affiliateLink} text="Start Trading" className="py-1.5 px-3 text-xs w-auto" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1.5 border-b border-zinc-800"><span className="text-zinc-400">Min Deposit</span><span className="text-white font-medium">${minDeposit}</span></div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800"><span className="text-zinc-400">Max Leverage</span><span className="text-white font-medium">{getLeverageDisplay(broker.leverage)}</span></div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800"><span className="text-zinc-400">Min Trade Size</span><span className="text-white font-medium">{safeString(broker.minTradeSize || '0.01 lots')}</span></div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800"><span className="text-zinc-400">Order Execution</span><span className="text-white font-medium">{safeString(broker.orderExecution || 'Market Execution')}</span></div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800"><span className="text-zinc-400">Margin Call</span><span className="text-white font-medium">{safeString(broker.marginCall || '100%')}</span></div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800"><span className="text-zinc-400">Stop Out Level</span><span className="text-white font-medium">{safeString(broker.stopOutLevel || '50%')}</span></div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800"><span className="text-zinc-400">Swap-Free Account</span><span className="text-white font-medium">{broker.islamicAccount ? '✅ Available' : '❌ Not Available'}</span></div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800"><span className="text-zinc-400">Demo Account</span><span className="text-white font-medium">{broker.demoAccount ? '✅ Available' : '❌ Not Available'}</span></div>
              </div>
            </div>

            {/* Spreads */}
            <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
              <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2"><Target size={14} className="text-blue-400" />Typical Spreads</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs py-1.5 border-b border-zinc-800"><span className="text-zinc-400">EUR/USD</span><span className="text-white">{safeString(broker.spreads?.eurusd || '0.1 pips')}</span></div>
                <div className="flex justify-between text-xs py-1.5 border-b border-zinc-800"><span className="text-zinc-400">GBP/USD</span><span className="text-white">{safeString(broker.spreads?.gbpusd || '0.2 pips')}</span></div>
                <div className="flex justify-between text-xs py-1.5 border-b border-zinc-800"><span className="text-zinc-400">USD/JPY</span><span className="text-white">{safeString(broker.spreads?.usdjpy || '0.3 pips')}</span></div>
                <div className="flex justify-between text-xs py-1.5 border-b border-zinc-800"><span className="text-zinc-400">XAU/USD</span><span className="text-white">{safeString(broker.spreads?.xauusd || '0.8 pips')}</span></div>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
              <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2"><Building size={14} className="text-purple-400" />Company Info</h3>
              <div className="space-y-2 text-xs">
                {broker.legalName && <div className="flex justify-between py-1.5 border-b border-zinc-800"><span className="text-zinc-500">Legal Name</span><span className="text-white">{safeString(broker.legalName)}</span></div>}
                {broker.ceo && <div className="flex justify-between py-1.5 border-b border-zinc-800"><span className="text-zinc-500">CEO</span><span className="text-white">{safeString(broker.ceo)}</span></div>}
                {broker.headquarters && <div className="flex justify-between py-1.5 border-b border-zinc-800"><span className="text-zinc-500">Headquarters</span><span className="text-white">{safeString(broker.headquarters)}</span></div>}
                {broker.corporateAddress && <div className="flex justify-between py-1.5 border-b border-zinc-800"><span className="text-zinc-500">Corporate Address</span><span className="text-white">{safeString(broker.corporateAddress)}</span></div>}
                {broker.founded && <div className="flex justify-between py-1.5 border-b border-zinc-800"><span className="text-zinc-500">Founded</span><span className="text-white">{safeString(broker.founded)}</span></div>}
                {broker.foundedMonth && <div className="flex justify-between py-1.5 border-b border-zinc-800"><span className="text-zinc-500">Founded Month</span><span className="text-white">{safeString(broker.foundedMonth)}</span></div>}
                {broker.yearsInOperation && <div className="flex justify-between py-1.5 border-b border-zinc-800"><span className="text-zinc-500">Years in Operation</span><span className="text-white">{safeString(broker.yearsInOperation)} years</span></div>}
                {broker.contactEmail && <div className="flex justify-between py-1.5 border-b border-zinc-800"><span className="text-zinc-500">Email</span><span className="text-white">{safeString(broker.contactEmail)}</span></div>}
                {broker.contactPhone && <div className="flex justify-between py-1.5 border-b border-zinc-800"><span className="text-zinc-500">Phone</span><span className="text-white">{safeString(broker.contactPhone)}</span></div>}
                
                <div className="flex justify-between py-1.5 border-b border-zinc-800">
                  <span className="text-zinc-500">Regulated</span>
                  <span className="text-white flex items-center gap-1.5">
                    {regulated ? (
                      <>
                        <CheckCircle size={12} className="text-green-400" />
                        <span className="text-green-400">Yes</span>
                      </>
                    ) : (
                      <>
                        <X size={12} className="text-red-400" />
                        <span className="text-red-400">No</span>
                      </>
                    )}
                  </span>
                </div>
                
                {broker.regulatoryBodies?.length > 0 && (
                  <div className="flex justify-between py-1.5 border-b border-zinc-800">
                    <span className="text-zinc-500">Regulatory Bodies</span>
                    <span className="text-white text-right max-w-[60%]">{safeString(broker.regulatoryBodies.join(', '))}</span>
                  </div>
                )}
                
                {broker.companyNumber && <div className="flex justify-between py-1.5 border-b border-zinc-800"><span className="text-zinc-500">Company Number</span><span className="text-white">{safeString(broker.companyNumber)}</span></div>}
                {broker.registrationCountry && <div className="flex justify-between py-1.5 border-b border-zinc-800"><span className="text-zinc-500">Registered In</span><span className="text-white">{safeString(broker.registrationCountry)}</span></div>}
              </div>
            </div>

            {/* Supported Countries */}
            {broker.supportedCountries?.length > 0 && (
              <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
                <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2"><Globe size={14} className="text-blue-400" />Supported Countries</h3>
                <div className="flex flex-wrap gap-1">
                  {broker.supportedCountries.map((c: string) => (
                    <span key={c} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">{safeString(c)}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Social Media */}
            {broker.socialMedia && Object.keys(broker.socialMedia).filter(k => broker.socialMedia[k]).length > 0 && (
              <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
                <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2"><Share2 size={14} className="text-blue-400" />Social Media</h3>
                <div className="flex flex-wrap gap-2">
                  {broker.socialMedia.twitter && <a href={broker.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg"><Twitter size={16} className="text-blue-400" /></a>}
                  {broker.socialMedia.linkedin && <a href={broker.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg"><Linkedin size={16} className="text-blue-400" /></a>}
                  {broker.socialMedia.youtube && <a href={broker.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg"><Youtube size={16} className="text-red-400" /></a>}
                  {broker.socialMedia.instagram && <a href={broker.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg"><Instagram size={16} className="text-pink-400" /></a>}
                  {broker.socialMedia.facebook && <a href={broker.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg"><Facebook size={16} className="text-blue-400" /></a>}
                  {broker.socialMedia.discord && <a href={broker.socialMedia.discord} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg"><MessageCircle size={16} className="text-purple-400" /></a>}
                </div>
              </div>
            )}

            {/* Trust Metrics */}
            {trustStats.totalReviews > 0 && (
              <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2"><BarChart3 size={14} className="text-blue-400" />Trust Metrics</h3>
                <div className="space-y-2">
                  <ProgressBar value={trustStats.withdrawalSuccess} label="Withdrawal Success" color="from-green-500 to-green-400" />
                  <ProgressBar value={trustStats.executionQuality} label="Execution Quality" color="from-blue-500 to-blue-400" />
                  <ProgressBar value={trustStats.avgReliability} label="Reliability" color="from-purple-500 to-purple-400" />
                </div>
                <div className="mt-3 pt-2 border-t border-zinc-800 flex justify-between text-xs">
                  <span className="text-zinc-400">Recommendation Rate</span>
                  <span className="text-white font-medium">{Math.round(trustStats.recommendationRate)}%</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== ACCOUNTS TAB ==================== */}
        {activeTab === 'accounts' && broker.accountTypes && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-semibold text-sm">Account Types</h2>
              <MobilePrimaryCTA href={affiliateLink} text="Open Account" className="py-1.5 px-3 text-xs w-auto" />
            </div>
            {broker.accountTypes.map((account: any, i: number) => (
              <div key={i} className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
                <h3 className="text-white font-semibold text-sm mb-2">{safeString(account.name || 'Standard Account')}</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-zinc-400">Min Deposit</span><span className="text-white">${account.minDeposit || 0}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400">Spread</span><span className="text-white">{safeString(account.spreadType || 'Variable')}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400">Commission</span><span className="text-white">{safeString(account.commission || 'No commission')}</span></div>
                  {account.leverage && <div className="flex justify-between"><span className="text-zinc-400">Leverage</span><span className="text-white">{getLeverageDisplay(account.leverage)}</span></div>}
                </div>
                <div className="mt-2 pt-2 border-t border-zinc-700">
                  <MobilePrimaryCTA href={affiliateLink} text={`Open ${account.name || 'Account'}`} className="py-1.5 text-xs w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==================== PLATFORMS TAB ==================== */}
        {activeTab === 'platforms' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-semibold text-sm">Trading Platforms</h2>
              <MobilePrimaryCTA href={affiliateLink} text="Start Trading" className="py-1.5 px-3 text-xs w-auto" />
            </div>
            <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
              <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2"><Monitor size={14} className="text-blue-400" />Trading Platforms</h3>
              <div className="flex flex-wrap gap-2">
                {(broker.platforms || broker.platform || []).map((p: string, i: number) => (
                  <span key={i} className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full">{safeString(p)}</span>
                ))}
              </div>
            </div>
            <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
              <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2"><Smartphone size={14} className="text-green-400" />Mobile Trading</h3>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1.5 rounded-full">iOS App</span>
                <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1.5 rounded-full">Android App</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== INSTRUMENTS TAB ==================== */}
        {activeTab === 'instruments' && (
          <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2"><PieChart size={14} className="text-purple-400" />Trading Instruments</h3>
              <MobilePrimaryCTA href={affiliateLink} text="Trade Now" className="py-1.5 px-3 text-xs w-auto" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(broker.instruments || {}).map(([instrument, count], idx) => (
                <div key={idx} className="bg-zinc-800/50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-purple-400">{safeString(count)}</div>
                  <div className="text-[10px] text-zinc-500 capitalize">{safeString(instrument)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== BONUSES TAB ==================== */}
        {activeTab === 'bonuses' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-semibold text-sm">Bonuses & Offers</h2>
              <MobileSecondaryCTA href={affiliateLink} text="View All" className="py-1.5 px-3 text-xs w-auto" />
            </div>
            {allBonuses.length > 0 ? (
              allBonuses.map((bonus: any, idx: number) => (
                <div key={idx} className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-4 border border-purple-500/30">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-white font-bold text-base mb-1">{safeString(bonus.amount || bonus.type || 'Special Offer')}</h3>
                      <p className="text-zinc-400 text-xs mb-2">{safeString(bonus.conditions || '')}</p>
                      {bonus.code && (
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono bg-zinc-800 px-2 py-1 rounded text-purple-400">{safeString(bonus.code)}</code>
                          <button onClick={() => handleCopyCode(bonus.code)} className="text-zinc-400 hover:text-purple-400">
                            {copiedCode === bonus.code ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
                          </button>
                        </div>
                      )}
                    </div>
                    <MobileSecondaryCTA href={affiliateLink} text="Claim" className="py-2 px-4 text-xs whitespace-nowrap" />
                  </div>
                  {bonus.expiry && (
                    <div className="mt-2 text-xs text-zinc-500 flex items-center gap-1">
                      <Clock size={10} /> Valid until {safeString(bonus.expiry)}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <Gift size={32} className="text-zinc-600 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">No active bonuses</p>
                <p className="text-zinc-600 text-xs">Check back later for promotions</p>
              </div>
            )}
          </div>
        )}

        {/* ==================== REGULATION TAB ==================== */}
        {activeTab === 'regulation' && (
          <div className="space-y-3">
            {hasWarnings && <WarningCard title="Regulatory Warnings" warnings={broker.regulatoryWarnings} type="warning" />}
            
            {/* Regulation Details */}
            <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
              <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2"><Landmark size={14} className="text-blue-400" />Regulatory Details</h3>
              
              {broker.regulation && (
                <div className="space-y-2 text-xs">
                  {typeof broker.regulation === 'object' ? (
                    Object.entries(broker.regulation).map(([key, value]) => {
                      if (!value) return null;
                      if (typeof value === 'object') {
                        if (Array.isArray(value) && value.length === 0) return null;
                        if (Object.keys(value).length === 0) return null;
                        if (Array.isArray(value) && value.every(v => typeof v === 'string')) {
                          return (
                            <div key={key} className="flex justify-between py-1.5 border-b border-zinc-800">
                              <span className="text-zinc-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <span className="text-white text-right max-w-[60%]">{safeString(value.join(', '))}</span>
                            </div>
                          );
                        }
                        return null;
                      }
                      return (
                        <div key={key} className="flex justify-between py-1.5 border-b border-zinc-800">
                          <span className="text-zinc-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="text-white text-right max-w-[60%]">{safeString(value)}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex justify-between py-1.5 border-b border-zinc-800">
                      <span className="text-zinc-500">Regulation</span>
                      <span className="text-white">{safeString(broker.regulation)}</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Regulatory Bodies */}
              if (broker.regulatoryBodies?.length > 0) {(
                <div className="mt-3">
                  <h4 className="text-xs text-zinc-400 mb-2">Regulatory Bodies</h4>
                  <div className="flex flex-wrap gap-2">
                    {broker.regulatoryBodies.map((reg: string, i: number) => (
                      <span key={i} className="text-xs bg-blue-900/50 text-blue-300 px-3 py-1.5 rounded-full">{safeString(reg)}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Client Protection */}
            <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
              <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2"><Shield size={14} className="text-green-400" />Client Protection</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-zinc-800/30 rounded-lg">
                  <span className="text-zinc-300 text-xs">Negative Balance Protection</span>
                  {broker.regulation?.negativeBalanceProtection ? <CheckCircle size={14} className="text-green-400" /> : <X size={14} className="text-red-400" />}
                </div>
                <div className="flex justify-between items-center p-2 bg-zinc-800/30 rounded-lg">
                  <span className="text-zinc-300 text-xs">Segregated Accounts</span>
                  {broker.regulation?.segregatedAccounts ? <CheckCircle size={14} className="text-green-400" /> : <X size={14} className="text-red-400" />}
                </div>
                <div className="flex justify-between items-center p-2 bg-zinc-800/30 rounded-lg">
                  <span className="text-zinc-300 text-xs">Investor Compensation</span>
                  {broker.regulation?.investorCompensation ? <CheckCircle size={14} className="text-green-400" /> : <X size={14} className="text-red-400" />}
                </div>
                {broker.regulation?.compensationScheme && (
                  <div className="flex justify-between items-center p-2 bg-zinc-800/30 rounded-lg">
                    <span className="text-zinc-300 text-xs">Compensation Scheme</span>
                    <span className="text-white text-xs">{safeString(broker.regulation.compensationScheme)}</span>
                  </div>
                )}
              </div>
              <div className="mt-3 pt-2 border-t border-zinc-800">
                <MobilePrimaryCTA href={affiliateLink} text="Trade with Confidence" className="py-2 text-xs w-full" />
              </div>
            </div>
          </div>
        )}

        {/* ==================== REPUTATION TAB ==================== */}
        {activeTab === 'reputation' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-semibold text-sm flex items-center gap-2"><Shield size={14} className="text-purple-400" />Reputation</h2>
              <MobilePrimaryCTA href={affiliateLink} text="Join Community" className="py-1.5 px-3 text-xs w-auto" />
            </div>

            {/* Trustpilot */}
            {(broker.trustpilotRating > 0 || broker.trustpilotReviews > 0) && (
              <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
                <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2"><Star size={14} className="text-yellow-400" />Trustpilot Reviews</h4>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{safeString(broker.trustpilotRating?.toFixed(1) || '0')}</div>
                    <StarRating rating={broker.trustpilotRating || 0} count={broker.trustpilotReviews || 0} size="sm" />
                    <div className="text-[10px] text-zinc-500 mt-1">{safeString(broker.trustpilotReviews || 0)} reviews</div>
                  </div>
                  {broker.trustpilotUrl && (
                    <a href={broker.trustpilotUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400">View on Trustpilot →</a>
                  )}
                </div>
              </div>
            )}

            {/* Review Themes */}
            {(broker.positiveReviewThemes?.length > 0 || broker.negativeReviewThemes?.length > 0) && (
              <div className="grid grid-cols-2 gap-3">
                {broker.positiveReviewThemes?.length > 0 && (
                  <div className="bg-zinc-900/80 rounded-xl p-3 border border-green-500/20">
                    <h4 className="text-xs font-semibold text-green-400 mb-2 flex items-center gap-1"><ThumbsUp size={12} /> Positive</h4>
                    <ul className="space-y-1">
                      {broker.positiveReviewThemes.slice(0, 3).map((theme: string, i: number) => (
                        <li key={i} className="text-[10px] text-zinc-300 flex items-start gap-1">
                          <CheckCircle size={8} className="text-green-400 mt-0.5" />
                          <span>{safeString(theme)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {broker.negativeReviewThemes?.length > 0 && (
                  <div className="bg-zinc-900/80 rounded-xl p-3 border border-red-500/20">
                    <h4 className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1"><ThumbsDownIcon size={12} /> Negative</h4>
                    <ul className="space-y-1">
                      {broker.negativeReviewThemes.slice(0, 3).map((theme: string, i: number) => (
                        <li key={i} className="text-[10px] text-zinc-300 flex items-start gap-1">
                          <XCircle size={8} className="text-red-400 mt-0.5" />
                          <span>{safeString(theme)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Support Agents */}
            {broker.supportAgents?.length > 0 && (
              <div className="bg-zinc-900/80 rounded-xl p-3 border border-zinc-800">
                <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-1"><Headphones size={12} className="text-purple-400" />Support Team</h4>
                <div className="flex flex-wrap gap-1">
                  {broker.supportAgents.map((agent: string, i: number) => (
                    <span key={i} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">{safeString(agent)}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Known Issues */}
            {broker.knownIssues?.length > 0 && (
              <div className="bg-zinc-900/80 rounded-xl p-3 border border-yellow-500/20">
                <h4 className="text-xs font-semibold text-yellow-400 mb-2 flex items-center gap-1"><AlertTriangle size={12} /> Known Issues</h4>
                <div className="space-y-2">
                  {broker.knownIssues.slice(0, 2).map((issue: any, i: number) => (
                    <div key={i} className="bg-zinc-800/50 rounded-lg p-2">
                      <div className="flex justify-between items-start">
                        <span className="text-white text-xs font-medium">{safeString(issue.issue)}</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${issue.severity === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{safeString(issue.severity)}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1">{safeString(issue.description)}</p>
                    </div>
                  ))}
                  {broker.knownIssues.length > 2 && <p className="text-[10px] text-zinc-500">+{broker.knownIssues.length - 2} more</p>}
                </div>
              </div>
            )}

            {/* Warning Flags */}
            {(broker.payoutDelaysReported || broker.slippageReported || broker.hiddenRulesReported || broker.retroactiveRuleChanges || broker.withdrawalDenials) && (
              <div className="bg-zinc-900/80 rounded-xl p-3 border border-red-500/20">
                <h4 className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1"><AlertOctagon size={12} /> Warning Flags</h4>
                <div className="flex flex-wrap gap-1">
                  {broker.payoutDelaysReported && <span className="text-[8px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/20">⚠️ Payout Delays</span>}
                  {broker.slippageReported && <span className="text-[8px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/20">⚠️ Slippage</span>}
                  {broker.hiddenRulesReported && <span className="text-[8px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/20">⚠️ Hidden Rules</span>}
                  {broker.retroactiveRuleChanges && <span className="text-[8px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/20">⚠️ Retroactive Rules</span>}
                  {broker.withdrawalDenials && <span className="text-[8px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/20">⚠️ Withdrawal Denials</span>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== REVIEWS TAB ==================== */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <button onClick={() => setShowReviewForm(true)} className="flex-1 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                <Plus size={14} /> Write a Review
              </button>
              <MobilePrimaryCTA href={affiliateLink} text="Try It" className="py-2.5 px-4 text-sm w-auto" />
            </div>

            <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800 text-center">
              <div className="text-3xl font-bold text-white mb-1">{trustStats.totalReviews > 0 ? displayRating.toFixed(1) : 'N/A'}</div>
              <StarRating rating={displayRating} count={trustStats.totalReviews} size="md" />
              <p className="text-xs text-zinc-500 mt-2">{trustStats.totalReviews} review{trustStats.totalReviews !== 1 ? 's' : ''}</p>
            </div>

            {reviewsLoading ? (
              <div className="text-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto" /></div>
            ) : brokerReviews.length > 0 ? (
              <div className="space-y-3">
                {brokerReviews.map((review) => {
                  const reviewTrustScore = review.trustScore || calculateReviewTrustScore(review);
                  const isExpanded = expandedReviewId === review.id;
                  const topLevelReplies = repliesCache[review.id] || [];
                  
                  return (
                    <div key={review.id} className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {review.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-semibold text-sm">{safeString(review.user?.name || 'Anonymous')}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <StarRating rating={review.rating || 0} size="sm" />
                            <span className="text-[10px] text-zinc-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {reviewTrustScore && <TrustScoreBadge score={reviewTrustScore} size="sm" />}
                      </div>
                      <h4 className="text-white font-semibold text-sm mb-2">{safeString(review.title)}</h4>
                      <p className="text-zinc-300 text-xs leading-relaxed">{isExpanded ? safeString(review.content) : `${safeString(review.content).substring(0, 150)}${safeString(review.content).length > 150 ? '...' : ''}`}</p>
                      {review.content && safeString(review.content).length > 150 && !isExpanded && (
                        <button onClick={() => setExpandedReviewId(review.id)} className="text-purple-400 text-xs mt-1">Read more</button>
                      )}
                      
                      {/* Pros/Cons */}
                      {(review.pros || review.cons) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {review.pros && (
                            <div className="bg-green-500/10 rounded-lg px-2 py-1 border border-green-500/20">
                              <span className="text-[10px] text-green-400 font-medium">✅ Pro</span>
                              <p className="text-[10px] text-zinc-300 mt-0.5">{safeString(review.pros)}</p>
                            </div>
                          )}
                          {review.cons && (
                            <div className="bg-red-500/10 rounded-lg px-2 py-1 border border-red-500/20">
                              <span className="text-[10px] text-red-400 font-medium">⚠️ Con</span>
                              <p className="text-[10px] text-zinc-300 mt-0.5">{safeString(review.cons)}</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-3 mt-3 pt-2 border-t border-zinc-800">
                        <button onClick={() => markHelpful(review.id, 'HELPFUL')} className={`flex items-center gap-1 text-xs ${userVotes[review.id] === 'HELPFUL' ? 'text-green-400' : 'text-zinc-500'}`}>
                          <ThumbsUp size={12} /> Helpful ({review.helpfulCount || 0})
                        </button>
                        <button onClick={() => shareReview(review)} className="flex items-center gap-1 text-xs text-zinc-500">
                          {copiedCode === review.id ? <CheckCircle size={12} className="text-green-400" /> : <Share2 size={12} />} Share
                        </button>
                        {review.verifiedTrader && (
                          <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <BadgeCheck size={10} /> Verified
                          </span>
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
                          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-green-400 transition-colors"
                        >
                          <MessageCircle size={12} /> 
                          Comments {review.replyCount > 0 && `(${review.replyCount})`}
                        </button>
                      </div>

                      {/* Reply Section */}
                      {showReplySection[review.id] && (
                        <div className="mt-3 border-t border-zinc-800 pt-3">
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
                                        if (e.target.files) {
                                          setReplyMedia(Array.from(e.target.files));
                                        }
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
                                      const success = await handleSubmitReply(review.id, null, replyContent, replyMedia);
                                      if (success) {
                                        setReplyContent('');
                                        setReplyMedia([]);
                                        setReplyingToReview(null);
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
            ) : (
              <div className="text-center py-8 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <MessageSquare size={32} className="text-zinc-600 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">No reviews yet</p>
                <p className="text-zinc-600 text-xs">Be the first to share your experience</p>
              </div>
            )}
            
            {/* Bottom CTA after reviews */}
            <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-xl p-4 border border-purple-500/30 text-center">
              <h3 className="text-white font-semibold text-sm mb-1">Join thousands of traders</h3>
              <p className="text-zinc-400 text-xs mb-3">Start trading with {safeString(broker.name)} today</p>
              <MobilePrimaryCTA href={affiliateLink} text="Open Your Account Now" className="py-2.5 text-sm w-full" />
            </div>
          </div>
        )}

        {/* ==================== INCIDENTS TAB ==================== */}
        {activeTab === 'incidents' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button onClick={() => setShowIncidentForm(true)} className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                <Flag size={14} /> Report Incident
              </button>
              <MobilePrimaryCTA href={affiliateLink} text="Start Trading" className="py-2.5 px-4 text-sm w-auto" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-500/10 rounded-xl p-3 text-center border border-red-500/20">
                <AlertTriangle size={16} className="text-red-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-white">{brokerIncidents}</div>
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
                  const isResolved = incident.resolutionStatus === 'RESOLVED' || incident.resolutionStatus === 'CONFIRMED';
                  
                  return (
                    <div key={incident.id} className="bg-zinc-900/80 rounded-xl p-4 border border-red-500/20">
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-lg ${typeColor.replace('text', 'bg')}/10`}>
                          <IconComponent size={14} className={typeColor} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-white font-semibold text-sm">{safeString(incident.title)}</h4>
                            <div className="flex gap-1 flex-shrink-0">
                              <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${isResolved ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {isResolved ? 'RESOLVED' : (incident.resolutionStatus || 'PENDING')}
                              </span>
                              {incident.verifiedBadge && (
                                <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                  <BadgeCheck size={8} /> Verified
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-zinc-300 text-xs mt-1">{safeString(incident.description)}</p>
                          <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-zinc-500">
                            <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(incident.incidentDate || incident.createdAt).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><AlertOctagon size={10} /> {safeString(incident.incidentType?.replace(/_/g, ' '))}</span>
                            {incident.withdrawalAmount && <span className="flex items-center gap-1"><DollarSign size={10} /> ${safeString(incident.withdrawalAmount)}</span>}
                          </div>
                          {incident.confirmations > 0 && (
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-green-400">
                              <Users size={10} /> {incident.confirmations} confirmations
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <Shield size={32} className="text-green-400 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">No incidents reported</p>
                <p className="text-zinc-600 text-xs">This broker has a clean record</p>
                <div className="mt-3">
                  <MobilePrimaryCTA href={affiliateLink} text="Trade with Confidence" className="py-2 text-xs w-full" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA Footer */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-4 border border-purple-500/30 text-center">
          <Rocket size={20} className="text-purple-400 mx-auto mb-2" />
          <p className="text-white text-sm font-medium mb-1">Ready to start trading?</p>
          <p className="text-zinc-400 text-xs mb-3">Get started with {safeString(broker.name)} today</p>
          <MobilePrimaryCTA href={affiliateLink} text="Open Account →" className="py-2.5 text-sm w-full" />
        </div>
      </div>

      {/* Modals */}
      <ReviewFormModal isOpen={showReviewForm} onClose={() => setShowReviewForm(false)} broker={broker} onSuccess={() => { fetchBrokerReviews(broker.id); setShowReviewForm(false); }} />
      <IncidentFormModal isOpen={showIncidentForm} onClose={() => setShowIncidentForm(false)} broker={broker} onSuccess={() => { fetchIncidents(broker.id); setShowIncidentForm(false); }} />
      
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