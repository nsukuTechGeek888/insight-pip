'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, TrendingUp, Award, Search, Filter, BarChart3, Users, 
  ChevronRight, MessageCircle, Send, Zap, Shield, Clock, 
  DollarSign, ExternalLink, Calendar, Globe,
  Heart, Clock4, ShieldCheck, UserCheck,
  PieChart, CreditCard, Smartphone, BookOpen, 
  ChevronLeft, ChevronRight as ChevronRightIcon, ThumbsUp,
  CheckCircle2, AlertCircle, MessageSquare, Eye, Gauge,
  Rocket, Sparkles, ThumbsDown, TrendingDown, 
  X, CheckCircle, AlertTriangle, Building, Copy, Info, RefreshCw,
  Building2, Crown, Gem, Flame, AlertOctagon, Flag, Plus, Send as SendIcon,
  Headphones, Activity, Target, XCircle, Wallet, Calendar as CalendarIcon,
  BadgeCheck, Monitor, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatCurrency } from "@/utils/api-helpers";
import { slugify } from "@/lib/slugify";
import TrustScoreBadge from "@/components/ui/TrustScoreBadge";
import { useUser } from "@/contexts/UserContext";
import { useRegion } from "@/contexts/RegionContext";

// ===================== REGION DISPLAY INFO =====================
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

// ===================== LOGO COMPONENT =====================
function FirmLogo({ firm, size = "md" }: { firm: any; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-10 h-10 rounded-xl text-sm",
    md: "w-12 h-12 rounded-xl text-base",
    lg: "w-14 h-14 rounded-xl text-lg"
  };
  
  if (firm.logo) {
    return (
      <div className={`${sizeClasses[size]} overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0 shadow-lg`}>
        <img 
          src={firm.logo} 
          alt={firm.name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const fallback = document.createElement('div');
              fallback.className = `${sizeClasses[size]} bg-gradient-to-r ${generateGradient(firm.name)} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`;
              fallback.textContent = firm.name?.charAt(0) || '?';
              parent.appendChild(fallback);
            }
          }}
        />
      </div>
    );
  }
  
  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-r ${generateGradient(firm.name)} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`}>
      {firm.name?.charAt(0) || '?'}
    </div>
  );
}

// Star Rating Component
function StarRating({ rating, setRating, size = "sm", readonly = false }: { 
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
              ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_2px_rgba(250,204,21,0.5)]' 
              : 'text-zinc-600 hover:text-yellow-400'
          }`}
          onClick={() => !readonly && setRating && setRating(i)}
        />
      ))}
    </div>
  );
}

// Helper functions
const getAllPlatforms = (broker: any) => {
  return broker.platforms || broker.platform || [];
};

const getMinDeposit = (broker: any) => {
  if (!broker.accountTypes) return broker.minDeposit || 0;
  return Math.min(...broker.accountTypes.map((acc: any) => acc.minDeposit || 0));
};

const getMaxLeverage = (broker: any) => {
  return broker.leverage || '1:100';
};

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

// Calculate review stats from reviews
const calculateReviewStats = (reviews: any[]) => {
  if (!reviews || reviews.length === 0) {
    return {
      avgTradingConditions: 0,
      avgPlatformStability: 0,
      avgCustomerSupport: 0,
      avgWithdrawalSpeed: 0,
      avgRating: 0,
      trustScore: 0,
      reviewCount: 0
    };
  }
  
  let sumTrading = 0, sumPlatform = 0, sumSupport = 0, sumWithdrawal = 0, sumRating = 0, sumTrust = 0;
  let hasTrading = false, hasPlatform = false, hasSupport = false, hasWithdrawal = false;
  
  reviews.forEach(r => {
    sumRating += r.rating || 0;
    sumTrust += r.trustScore || 0;
    
    if (r.executionQuality && r.executionQuality > 0) {
      sumTrading += r.executionQuality;
      hasTrading = true;
    }
    
    if (r.platformStability && r.platformStability > 0) {
      sumPlatform += r.platformStability;
      hasPlatform = true;
    }
    
    if (r.customerSupport && r.customerSupport > 0) {
      sumSupport += r.customerSupport;
      hasSupport = true;
    }
    
    if (r.withdrawalExperience && r.withdrawalExperience > 0) {
      sumWithdrawal += r.withdrawalExperience;
      hasWithdrawal = true;
    }
  });
  
  const count = reviews.length;
  return {
    avgTradingConditions: hasTrading ? Number((sumTrading / count).toFixed(1)) : 0,
    avgPlatformStability: hasPlatform ? Number((sumPlatform / count).toFixed(1)) : 0,
    avgCustomerSupport: hasSupport ? Number((sumSupport / count).toFixed(1)) : 0,
    avgWithdrawalSpeed: hasWithdrawal ? Number((sumWithdrawal / count).toFixed(1)) : 0,
    avgRating: Number((sumRating / count).toFixed(1)),
    trustScore: Math.round(sumTrust / count),
    reviewCount: count
  };
};

// Progress Bar Component
const ProgressBar = ({ value, label, icon, color }: { value: number; label: string; icon: React.ReactNode; color: string }) => {
  const percentage = (value / 5) * 100;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-zinc-400">{label}</span>
        </div>
        <span className="text-white font-medium">{value.toFixed(1)}/5</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Incident Types
const incidentTypes = [
  { value: 'WITHDRAWAL_DELAY', label: 'Withdrawal Delay', icon: Clock, color: 'text-orange-400', category: 'withdrawal' },
  { value: 'WITHDRAWAL_REJECTED', label: 'Withdrawal Rejected', icon: XCircle, color: 'text-red-400', category: 'withdrawal' },
  { value: 'WITHDRAWAL_PAID', label: 'Withdrawal Paid', icon: CheckCircle, color: 'text-green-400', category: 'withdrawal' },
  { value: 'SLIPPAGE_ISSUES', label: 'Slippage Issues', icon: Activity, color: 'text-yellow-400', category: 'execution' },
  { value: 'SPREAD_SPIKE', label: 'Spread Spike', icon: Target, color: 'text-orange-400', category: 'execution' },
  { value: 'EXECUTION_DELAY', label: 'Execution Delay', icon: Clock, color: 'text-yellow-400', category: 'execution' },
  { value: 'PLATFORM_FREEZE', label: 'Platform Freeze', icon: Smartphone, color: 'text-purple-400', category: 'platform' },
  { value: 'SERVER_DOWN', label: 'Server Down', icon: XCircle, color: 'text-red-400', category: 'platform' },
  { value: 'ACCOUNT_SUSPENDED', label: 'Account Suspended', icon: AlertTriangle, color: 'text-red-400', category: 'account' },
  { value: 'ACCOUNT_BANNED', label: 'Account Banned', icon: AlertCircle, color: 'text-red-400', category: 'account' },
  { value: 'SCAM_WARNING', label: 'Scam Warning', icon: AlertCircle, color: 'text-red-400', category: 'compliance' },
];

// ===================== REGION AVAILABILITY HELPER =====================
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

// Review Form Modal Component
function ReviewFormModal({ isOpen, onClose, broker, onSuccess }: { 
  isOpen: boolean; 
  onClose: () => void; 
  broker: any; 
  onSuccess: () => void;
}) {
  const { user } = useUser();
  const [tradingConditions, setTradingConditions] = useState(0);
  const [platformStability, setPlatformStability] = useState(0);
  const [customerSupport, setCustomerSupport] = useState(0);
  const [withdrawalSpeed, setWithdrawalSpeed] = useState(0);
  const [hoverRating, setHoverRating] = useState<{ [key: string]: number }>({});
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [yearsTrading, setYearsTrading] = useState("");
  const [verifiedTrader, setVerifiedTrader] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const calculateTrustScore = () => {
    let score = 0, weight = 0;
    if (tradingConditions > 0) { score += (tradingConditions / 5) * 20; weight += 20; }
    if (platformStability > 0) { score += (platformStability / 5) * 20; weight += 20; }
    if (customerSupport > 0) { score += (customerSupport / 5) * 20; weight += 20; }
    if (withdrawalSpeed > 0) { score += (withdrawalSpeed / 5) * 40; weight += 40; }
    return weight === 0 ? null : Math.round((score / weight) * 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setError("Please login to submit a review"); return; }
    
    setError(null);
    const ratings = [tradingConditions, platformStability, customerSupport, withdrawalSpeed];
    const totalRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;

    if (totalRating === 0) { setError("Please select ratings for at least one category"); return; }
    if (!title.trim()) { setError("Please enter a review title"); return; }
    if (!content.trim()) { setError("Please enter your review"); return; }
    if (!agreeTerms) { setError("Please agree to the terms"); return; }

    setIsSubmitting(true);
    try {
      const trustScore = calculateTrustScore();
      const payload = {
        brokerId: broker.id,
        title: title.trim(),
        content: content.trim(),
        rating: totalRating,
        executionQuality: tradingConditions || undefined,
        platformStability: platformStability || undefined,
        customerSupport: customerSupport || undefined,
        withdrawalExperience: withdrawalSpeed || undefined,
        pros: pros || undefined,
        cons: cons || undefined,
        yearsTrading: yearsTrading || undefined,
        verifiedTrader,
        trustScore: trustScore || undefined,
      };

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to submit review');
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess(false);
        setTradingConditions(0);
        setPlatformStability(0);
        setCustomerSupport(0);
        setWithdrawalSpeed(0);
        setTitle("");
        setContent("");
        setPros("");
        setCons("");
        setYearsTrading("");
        setVerifiedTrader(false);
        setAgreeTerms(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingRow = ({ label, value, setValue, icon }: { label: string; value: number; setValue: (val: number) => void; icon: React.ReactNode }) => (
    <div className="flex items-center justify-between gap-4 p-2 bg-zinc-800/30 rounded-lg">
      <div className="flex items-center gap-2 text-zinc-300 text-sm min-w-[120px]">
        {icon}
        {label}
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            onClick={() => setValue(star)}
            onMouseEnter={() => setHoverRating({ ...hoverRating, [label]: star })}
            onMouseLeave={() => setHoverRating({ ...hoverRating, [label]: 0 })}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="focus:outline-none"
          >
            <Star
              size={18}
              className={`transition-all duration-200 ${
                star <= (hoverRating[label] || value)
                  ? "text-yellow-400 fill-yellow-400 drop-shadow-lg" 
                  : "text-zinc-600 hover:text-zinc-500"
              }`}
            />
          </motion.button>
        ))}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-2xl"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900/95 to-zinc-800/95 backdrop-blur-xl border border-zinc-700/50 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 animate-pulse" />
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
                  <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl" />
                </div>
                
                <div className="relative px-6 py-5 border-b border-zinc-700/50 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FirmLogo firm={broker} size="md" />
                      <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          Review {broker?.name}
                          <Sparkles size={16} className="text-yellow-400" />
                        </h3>
                        <p className="text-sm text-zinc-400">Share your trading experience with the community</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onClose}
                      className="p-2 rounded-lg hover:bg-zinc-700/50 transition-colors group"
                    >
                      <X size={20} className="text-zinc-400 group-hover:text-white transition-colors" />
                    </motion.button>
                  </div>
                </div>

                {success ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Review Submitted!</h3>
                    <p className="text-zinc-400">Thank you for sharing your experience. Your review will be visible after moderation.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="relative px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                        <Star size={16} className="text-yellow-400" />
                        Rate Different Aspects
                      </label>
                      <div className="space-y-2">
                        <RatingRow label="Trading Conditions" value={tradingConditions} setValue={setTradingConditions} icon={<TrendingUp size={14} className="text-green-400" />} />
                        <RatingRow label="Platform Stability" value={platformStability} setValue={setPlatformStability} icon={<Monitor size={14} className="text-blue-400" />} />
                        <RatingRow label="Customer Support" value={customerSupport} setValue={setCustomerSupport} icon={<Headphones size={14} className="text-purple-400" />} />
                        <RatingRow label="Withdrawal Speed" value={withdrawalSpeed} setValue={setWithdrawalSpeed} icon={<Rocket size={14} className="text-yellow-400" />} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                        <MessageCircle size={16} className="text-blue-400" />
                        Review Title <span className="text-blue-500">*</span>
                      </label>
                      <Input
                        placeholder="Summarize your experience in one line"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-purple-500/20 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                        <SendIcon size={16} className="text-green-400" />
                        Your Review <span className="text-blue-500">*</span>
                      </label>
                      <Textarea
                        placeholder="Tell us about your experience with this broker..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[100px] bg-zinc-800/50 border-zinc-700/50 text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-purple-500/20 transition-all resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                          <TrendingUp size={16} className="text-green-400" />
                          Pros
                        </label>
                        <Textarea
                          placeholder="What did you like?"
                          value={pros}
                          onChange={(e) => setPros(e.target.value)}
                          className="min-h-[80px] bg-zinc-800/50 border-zinc-700/50 text-white placeholder-zinc-500 focus:border-green-500 focus:ring-green-500/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                          <TrendingDown size={16} className="text-red-400" />
                          Cons
                        </label>
                        <Textarea
                          placeholder="What could be improved?"
                          value={cons}
                          onChange={(e) => setCons(e.target.value)}
                          className="min-h-[80px] bg-zinc-800/50 border-zinc-700/50 text-white placeholder-zinc-500 focus:border-red-500 focus:ring-red-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                          <Clock size={16} className="text-purple-400" />
                          Years Trading
                        </label>
                        <select
                          value={yearsTrading}
                          onChange={(e) => setYearsTrading(e.target.value)}
                          className="w-full bg-zinc-800/50 border border-zinc-700/50 text-white rounded-lg px-3 py-2.5 text-sm focus:border-purple-500 focus:ring-purple-500/20 transition-all"
                        >
                          <option value="">Select experience</option>
                          <option value="1">Less than 1 year</option>
                          <option value="2">1-2 years</option>
                          <option value="3">3-5 years</option>
                          <option value="5">5-10 years</option>
                          <option value="10">10+ years</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                          <ShieldCheck size={16} className="text-blue-400" />
                          Verification
                        </label>
                        <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-purple-500/50 transition-colors">
                          <Checkbox
                            checked={verifiedTrader}
                            onCheckedChange={(checked) => setVerifiedTrader(checked as boolean)}
                            className="border-zinc-600 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                          />
                          <label className="text-sm text-zinc-300">I am a verified trader with this broker</label>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                      <Checkbox
                        checked={agreeTerms}
                        onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                        className="border-purple-500 data-[state=checked]:bg-purple-500"
                      />
                      <label className="text-sm text-zinc-300">
                        I agree to the <span className="text-purple-400 hover:text-purple-300 cursor-pointer font-medium">terms and conditions</span> and confirm that this review is based on my genuine experience <span className="text-purple-500">*</span>
                      </label>
                    </div>

                    {error && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                        <p className="text-red-400 text-sm flex items-center gap-2"><AlertTriangle size={16} />{error}</p>
                      </motion.div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <motion.button
                        type="button"
                        onClick={onClose}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all font-medium text-sm"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isSubmitting || !agreeTerms || !title.trim() || !content.trim()}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2"><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />Submitting...</span>
                        ) : (
                          <span className="flex items-center justify-center gap-2"><SendIcon size={14} />Submit Review</span>
                        )}
                      </motion.button>
                    </div>
                  </form>
                )}

                <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-purple-500/30 rounded-tl-2xl pointer-events-none" />
                <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-pink-500/30 rounded-tr-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-orange-500/30 rounded-bl-2xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-purple-500/30 rounded-br-2xl pointer-events-none" />
              </div>
            </motion.div>
          </div>

          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: rgba(39, 39, 42, 0.5); border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #a855f7, #ec4899); border-radius: 10px; }
          `}</style>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function BrokerReviewsTab() {
  const router = useRouter();
  const { region } = useRegion(); // ✅ ADDED
  const [brokersData, setBrokersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brokerIncidents, setBrokerIncidents] = useState<Record<number, number>>({});
  const [enrichedBrokers, setEnrichedBrokers] = useState<any[]>([]);
  const [loadingEnriched, setLoadingEnriched] = useState(true);
  
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "reviews" | "incidents">("rating");
  const [currentPage, setCurrentPage] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<any>(null);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [showRegulatedOnly, setShowRegulatedOnly] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Get region info for display
  const regionInfo = REGION_DISPLAY[region] || REGION_DISPLAY['GLOBAL'];

  // Fetch brokers data with region
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.getBrokers(region); // ✅ ADDED region
        if (response.success) setBrokersData(response.data || []);
      } catch (err) {
        console.error('Error fetching brokers:', err);
        setError('Failed to load brokers data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [region]); // ✅ ADDED region dependency

  // Enrich brokers with review stats
  useEffect(() => {
    const enrichBrokers = async () => {
      if (brokersData.length === 0) return;
      setLoadingEnriched(true);
      
      const enriched = await Promise.all(
        brokersData.map(async (broker) => {
          try {
            const response = await fetch(`/api/reviews?brokerId=${broker.id}&status=APPROVED&limit=100`);
            const data = await response.json();
            
            if (response.ok && data.reviews && data.reviews.length > 0) {
              const stats = calculateReviewStats(data.reviews);
              return { 
                ...broker, 
                trustScore: stats.trustScore, 
                reviewCount: stats.reviewCount,
                avgRating: stats.avgRating,
                avgTradingConditions: stats.avgTradingConditions,
                avgPlatformStability: stats.avgPlatformStability,
                avgCustomerSupport: stats.avgCustomerSupport,
                avgWithdrawalSpeed: stats.avgWithdrawalSpeed
              };
            }
          } catch (err) {
            console.error(`Error fetching reviews for broker ${broker.id}:`, err);
          }
          return { 
            ...broker, 
            trustScore: broker.trustScore || 0, 
            reviewCount: broker.reviewsCount || 0,
            avgRating: broker.rating || 0,
            avgTradingConditions: 0,
            avgPlatformStability: 0,
            avgCustomerSupport: 0,
            avgWithdrawalSpeed: 0
          };
        })
      );
      
      setEnrichedBrokers(enriched);
      setLoadingEnriched(false);
    };
    
    enrichBrokers();
  }, [brokersData]);

  // Fetch incidents for each broker
  useEffect(() => {
    const fetchIncidents = async () => {
      if (enrichedBrokers.length === 0) return;
      
      const incidentsMap: Record<number, number> = {};
      await Promise.all(
        enrichedBrokers.map(async (broker) => {
          try {
            const response = await fetch(`/api/incidents?entityType=broker&entityId=${broker.id}&limit=1`);
            const data = await response.json();
            if (response.ok && data.pagination) {
              incidentsMap[broker.id] = data.pagination.total;
            } else {
              incidentsMap[broker.id] = 0;
            }
          } catch (err) {
            incidentsMap[broker.id] = 0;
          }
        })
      );
      setBrokerIncidents(incidentsMap);
    };
    
    fetchIncidents();
  }, [enrichedBrokers]);

  const regions = [...new Set(brokersData.map(b => b.headquarters?.split(',').pop()?.trim() || b.country).filter(Boolean))];
  
  // Filter brokers with region awareness
  const filteredBrokers = enrichedBrokers
    .filter((broker) => {
      // Region availability check
      if (!isAvailableInRegion(broker, region)) return false;
      
      const matchesSearch = broker.name?.toLowerCase().includes(search.toLowerCase()) ||
                           broker.country?.toLowerCase().includes(search.toLowerCase());
      const matchesRegion = selectedRegions.length === 0 || selectedRegions.some(r => broker.headquarters?.includes(r) || broker.country?.includes(r));
      const matchesRegulated = !showRegulatedOnly || broker.regulated === true;
      return matchesSearch && matchesRegion && matchesRegulated;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return (b.avgRating || 0) - (a.avgRating || 0);
      if (sortBy === "reviews") return (b.reviewCount || 0) - (a.reviewCount || 0);
      if (sortBy === "incidents") return (brokerIncidents[b.id] || 0) - (brokerIncidents[a.id] || 0);
      return (b.avgRating || 0) - (a.avgRating || 0);
    });

  const totalBrokers = enrichedBrokers.length;
  const totalReviews = enrichedBrokers.reduce((acc, b) => acc + (b.reviewCount || 0), 0);
  const avgRating = enrichedBrokers.length > 0 
    ? (enrichedBrokers.reduce((acc, b) => acc + (b.avgRating || 0), 0) / enrichedBrokers.length).toFixed(1) 
    : "0.0";
  const regulatedCount = enrichedBrokers.filter(b => b.regulated).length;
  const totalIncidents = Object.values(brokerIncidents).reduce((sum, count) => sum + count, 0);

  const CARDS_PER_PAGE = 6;
  const totalPages = Math.ceil(filteredBrokers.length / CARDS_PER_PAGE);
  const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
  const paginatedBrokers = filteredBrokers.slice(startIndex, startIndex + CARDS_PER_PAGE);

  const navigateToBrokerReviews = (brokerName: string) => {
    router.push(`/brokers/${slugify(brokerName)}?tab=reviews`);
  };

  const handleOpenReviewForm = (broker: any) => {
    setSelectedBroker(broker);
    setShowReviewForm(true);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const renderFeatureBadge = (value: any, label: string, icon: React.ReactNode, positive: boolean = true) => {
    let displayValue = value;
    if (typeof value === 'number') {
      if (label.includes('$')) displayValue = formatCurrency(value);
      else displayValue = value.toLocaleString();
    }
    const color = positive ? "text-green-400" : "text-zinc-400";
    const bgColor = positive ? "bg-green-500/10" : "bg-zinc-800";
    
    return (
      <div className={`flex items-center gap-1 p-1.5 ${bgColor} rounded-md border border-${positive ? 'green-500/20' : 'zinc-700'}`}>
        <div className={color}>{icon}</div>
        <div className="min-w-0">
          <div className="text-xs text-zinc-400 truncate">{label}</div>
          <div className={`font-semibold text-xs ${color} truncate`}>{displayValue}</div>
        </div>
      </div>
    );
  };

  if (loading || loadingEnriched) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-white">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={handleRefresh} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Retry</button>
        </div>
      </div>
    );
  }

  // Show empty state if no brokers in region
  if (enrichedBrokers.length === 0) {
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
      'AU': [
        { key: 'SG', label: 'Singapore', flag: '🇸🇬' },
        { key: 'GLOBAL', label: 'Global', flag: '🌍' }
      ],
      'SG': [
        { key: 'AU', label: 'Australia', flag: '🇦🇺' },
        { key: 'GLOBAL', label: 'Global', flag: '🌍' }
      ],
      'US': [
        { key: 'CA', label: 'Canada', flag: '🇨🇦' },
        { key: 'GLOBAL', label: 'Global', flag: '🌍' }
      ],
      'CA': [
        { key: 'US', label: 'United States', flag: '🇺🇸' },
        { key: 'GLOBAL', label: 'Global', flag: '🌍' }
      ],
    };

    const suggestions = nearbyRegions[region] || [{ key: 'GLOBAL', label: 'Global', flag: '🌍' }];

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md px-6">
          <MessageCircle size={48} className="text-zinc-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            No reviews in {regionInfo.flag} {regionInfo.label}
          </h2>
          <p className="text-zinc-400 mb-6">
            We don't have any brokers with reviews in {regionInfo.flag} {regionInfo.label} yet.
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
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ❌ REGION BANNER REMOVED - Users select region in navbar */}

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-4">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-orange-900/20" />
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400 text-sm mb-4">
            <Sparkles size={14} /> Community-Driven Reviews
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Broker Ratings & Reviews
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-zinc-400 max-w-2xl mx-auto text-sm">
            Real trader reviews on trading conditions, platform stability, customer support, and withdrawal speed
          </motion.p>
        </div>
      </section>

      {/* Stats Row */}
      <div className="border-y border-zinc-800/50 bg-gradient-to-r from-zinc-900/30 via-transparent to-zinc-900/30">
        <div className="max-w-6xl mx-auto py-3 px-4">
          <div className="flex flex-wrap justify-between items-center gap-4 text-sm">
            <div className="flex items-center gap-6">
              <span className="text-white font-medium">{totalBrokers} brokers</span>
              <span className="text-zinc-400">{totalReviews.toLocaleString()} reviews</span>
              <span className="text-yellow-400">★ {avgRating} avg rating</span>
              <span className="text-purple-400">{regulatedCount} regulated</span>
              <span className="text-red-400 flex items-center gap-1"><AlertTriangle size={12} /> {totalIncidents} incidents</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input
              placeholder="Search brokers by name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="rating">Highest Rated</option>
            <option value="reviews">Most Reviews</option>
            <option value="incidents">Most Incidents</option>
          </select>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowRegulatedOnly(!showRegulatedOnly)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${showRegulatedOnly ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'bg-zinc-800/50 text-zinc-400 hover:text-white border border-zinc-700'}`}
            >
              <ShieldCheck size={14} /> Regulated Only
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="max-w-6xl mx-auto flex items-center gap-2">
        <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
        <span className="text-sm text-zinc-500">{filteredBrokers.length} brokers found</span>
      </div>

      {/* Broker Cards Grid - WITH LOGOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
        {paginatedBrokers.map((broker, index) => {
          const minDeposit = getMinDeposit(broker);
          const maxLeverage = getMaxLeverage(broker);
          const platforms = getAllPlatforms(broker);
          const trustScore = broker.trustScore || 0;
          const incidentCount = brokerIncidents[broker.id] || 0;
          const rating = broker.avgRating || 0;
          
          const isTopRated = index === 0 && rating >= 4.5;
          
          return (
            <motion.div
              key={broker.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              onMouseEnter={() => setHoveredCard(broker.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-xl transition-all duration-500 opacity-0 group-hover:opacity-30" />
              
              <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl border border-zinc-800 hover:border-purple-500/30 transition-all overflow-hidden">
                {/* Top Rated Badge */}
                {isTopRated && (
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-lg">
                      <Flame size={10} /> Top Rated
                    </div>
                  </div>
                )}
                
                <div className="p-5">
                  {/* Header - WITH LOGO */}
                  <div className="flex items-start gap-3 mb-4">
                    <FirmLogo firm={broker} size="md" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-lg group-hover:text-purple-400 transition-colors truncate">
                        {broker.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <div className="flex items-center gap-1">
                          <StarRating rating={rating} readonly size="sm" />
                          <span className="text-xs text-zinc-400">({rating.toFixed(1)})</span>
                        </div>
                        {trustScore > 0 && <TrustScoreBadge score={trustScore} size="sm" />}
                        {broker.regulated && <BadgeCheck size={14} className="text-green-400" />}
                      </div>
                    </div>
                  </div>
                  
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {renderFeatureBadge(minDeposit, "Min Deposit", <DollarSign size={12} className="text-green-400" />)}
                    {renderFeatureBadge(maxLeverage, "Max Leverage", <Gauge size={12} className="text-blue-400" />)}
                  </div>

                  {/* Rating Breakdown with PROGRESS BARS */}
                  <div className="space-y-2 mb-4">
                    <div className="text-xs text-zinc-500 mb-1">Community Ratings</div>
                    
                    <ProgressBar 
                      value={broker.avgTradingConditions || 0} 
                      label="Trading Conditions" 
                      icon={<TrendingUp size={12} className="text-green-400" />}
                      color="from-green-500 to-green-400"
                    />
                    
                    <ProgressBar 
                      value={broker.avgPlatformStability || 0} 
                      label="Platform Stability" 
                      icon={<Gauge size={12} className="text-blue-400" />}
                      color="from-blue-500 to-blue-400"
                    />
                    
                    <ProgressBar 
                      value={broker.avgCustomerSupport || 0} 
                      label="Customer Support" 
                      icon={<Headphones size={12} className="text-purple-400" />}
                      color="from-purple-500 to-purple-400"
                    />
                    
                    <ProgressBar 
                      value={broker.avgWithdrawalSpeed || 0} 
                      label="Withdrawal Speed" 
                      icon={<Zap size={12} className="text-yellow-400" />}
                      color="from-yellow-500 to-yellow-400"
                    />
                  </div>

                  {/* Incident Badge */}
                  <div className="mb-4">
                    <div className={`flex items-center justify-between p-2 rounded-lg ${incidentCount > 0 ? 'bg-red-500/10 border border-red-500/20' : 'bg-zinc-800/30'}`}>
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={12} className={incidentCount > 0 ? 'text-red-400' : 'text-zinc-500'} />
                        <span className="text-xs text-zinc-400">Reported Incidents</span>
                      </div>
                      <span className={`text-sm font-semibold ${incidentCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {incidentCount}
                      </span>
                    </div>
                  </div>

                  {/* Platforms */}
                  {platforms.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {platforms.slice(0, 3).map((p: string, i: number) => (
                        <span key={i} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full">{p}</span>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigateToBrokerReviews(broker.name)}
                      className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs font-medium hover:from-purple-500 hover:to-pink-500 transition-all flex items-center justify-center gap-1"
                    >
                      <MessageCircle size={12} /> Reviews ({broker.reviewCount || 0})
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(p => p - 1)} 
            className="px-4 py-2 rounded-xl text-sm text-zinc-400 disabled:opacity-50 hover:text-white border border-zinc-800 hover:border-purple-500/50 transition-all"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + Math.max(1, currentPage - 2))
            .filter(p => p <= totalPages)
            .map(p => (
              <button 
                key={p} 
                onClick={() => setCurrentPage(p)} 
                className={`px-3 py-2 rounded-xl text-sm transition-all ${
                  p === currentPage 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                    : 'text-zinc-400 hover:text-white border border-zinc-800 hover:border-purple-500/50'
                }`}
              >
                {p}
              </button>
            ))}
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(p => p + 1)} 
            className="px-4 py-2 rounded-xl text-sm text-zinc-400 disabled:opacity-50 hover:text-white border border-zinc-800 hover:border-purple-500/50 transition-all"
          >
            Next
          </button>
        </div>
      )}

      {/* Review Form Modal */}
      <ReviewFormModal
        isOpen={showReviewForm}
        onClose={() => { setShowReviewForm(false); setSelectedBroker(null); }}
        broker={selectedBroker}
        onSuccess={() => {
          window.location.reload();
        }}
      />

      {/* Newsletter */}
      <div className="border-t border-zinc-800/50 py-8 mt-4 bg-gradient-to-t from-zinc-900/30 to-transparent">
        <div className="max-w-md mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <MessageCircle size={16} className="text-purple-400" />
            <p className="text-zinc-500 text-sm">Get notified of new reviews</p>
          </div>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Your email" 
              className="flex-1 bg-zinc-800/80 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500" 
            />
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:from-purple-500 hover:to-pink-500 transition-all">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}