// components/home/MobileHome.tsx - REDESIGNED WITH RANKINGS SLIDER & LOGOS

'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useRegion } from '@/contexts/RegionContext';
import { 
  Star, Shield, Building2, MessageCircle, 
  AlertTriangle, CheckCircle, ArrowRight, Users, 
  Eye, Clock, Award, Info, DollarSign, Wallet, 
  Gauge, Heart, RefreshCw, Flame, Crown, Gem, Gift, 
  Rocket, Tag, ShieldCheck, HelpCircle, XCircle, Activity, 
  Target, Smartphone, AlertCircle, TrendingUp, ChevronRight,
  Menu, Home, BarChart3, FileText, Settings, ChevronDown,
  ThumbsUp, ThumbsDown, ExternalLink, ChevronUp, Layers,
  Briefcase, LineChart, PiggyBank, Globe, Server, Monitor,
  CreditCard, Landmark, BadgeCheck,
  Trophy, Medal, Hash, Sparkles, Zap, Compass, GitCompare,
  ChevronLeft, ChevronRight as ChevronRightIcon, User, Percent,
  Flame as FlameIcon, Zap as ZapIcon
} from 'lucide-react';
import { formatCurrency } from '@/utils/api-helpers';
import TrustScoreBadge from '@/components/ui/TrustScoreBadge';
import MobileLayout from '@/components/mobile/MobileLayout';

// ===================== DESIGN SYSTEM =====================
const COLORS = {
  surface: '#0a0a12',
  surfaceLight: '#12121f',
  surfaceCard: '#1a1a2e',
  border: '#1e1e32',
  borderLight: '#2a2a3e',
  textPrimary: '#ffffff',
  textSecondary: '#8a8aa0',
  textMuted: '#5a5a72',
  accent: '#2563eb',
  accentHover: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  gold: '#fbbf24',
  silver: '#9ca3af',
  bronze: '#d97706',
  offerGradient1: '#1a1a2e',
  offerGradient2: '#2a1a3e',
};

// ===================== REGION =====================
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

// ===================== HELPERS =====================
const calculateTrustStatsFromReviews = (reviews: any[]) => {
  if (!reviews || reviews.length === 0) {
    return { avgTrustScore: 0, totalReviews: 0 };
  }
  const avgTrustScore = reviews.reduce((sum, r) => sum + (r.trustScore || 0), 0) / reviews.length;
  return { avgTrustScore: Math.round(avgTrustScore), totalReviews: reviews.length };
};

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

// ===================== COMPONENTS =====================

// Star Rating - Clean
function StarRating({ rating, count = 0, size = "sm" }: { rating: number; count?: number; size?: "sm" | "md" }) {
  const starSize = size === "md" ? "w-4 h-4" : "w-3 h-3";
  const hasReviews = count > 0;
  const displayRating = hasReviews ? Math.min(5, Math.max(0, rating || 0)) : 0;
  const roundedRating = Math.round(displayRating);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star 
            key={i} 
            className={`${starSize} ${i <= roundedRating && hasReviews ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-700'}`} 
          />
        ))}
      </div>
      {hasReviews && (
        <span className="text-xs text-white font-medium">{displayRating.toFixed(1)}</span>
      )}
      {count > 0 && (
        <span className="text-[10px] text-zinc-500">({count})</span>
      )}
    </div>
  );
}

// Trust Score Display - Clean, prominent
function TrustScoreDisplay({ score, size = "sm" }: { score: number; size?: "sm" | "md" }) {
  const normalizedScore = Math.min(100, Math.max(0, score || 0));
  const getColor = () => {
    if (normalizedScore >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (normalizedScore >= 60) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-red-400 border-red-500/30 bg-red-500/10';
  };
  
  const getLabel = () => {
    if (normalizedScore >= 80) return 'High Trust';
    if (normalizedScore >= 60) return 'Medium Trust';
    return 'Low Trust';
  };

  const textSize = size === "md" ? "text-sm" : "text-[10px]";
  const numberSize = size === "md" ? "text-base" : "text-xs";

  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${getColor()}`}>
      <Shield size={size === "md" ? 14 : 10} />
      <span className={`${textSize} font-medium`}>{getLabel()}</span>
      <span className={`${numberSize} font-bold text-white`}>{normalizedScore}</span>
    </div>
  );
}

// Ranking Entry - Premium financial index style with Logo
function RankingEntry({ rank, entity, onClick, index }: { rank: number; entity: any; onClick: () => void; index: number }) {
  const isTop3 = rank <= 3;
  
  const getRankDisplay = () => {
    if (rank === 1) return <Crown size={12} className="text-amber-400" />;
    if (rank === 2) return <Medal size={12} className="text-zinc-400" />;
    if (rank === 3) return <Medal size={12} className="text-amber-700" />;
    return <span className="text-zinc-500 font-mono text-xs w-4 text-center">{rank}</span>;
  };

  const logoUrl = entity.logo || null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`flex items-center gap-3 py-2.5 border-b border-[#1e1e32] last:border-0 cursor-pointer hover:bg-[#1a1a2e] transition-all px-2 -mx-2 rounded-lg ${
        isTop3 ? 'bg-amber-500/5' : ''
      }`}
    >
      <div className="w-6 flex items-center justify-center flex-shrink-0">
        {getRankDisplay()}
      </div>
      
      {/* Logo */}
      <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#1a1a2e] border border-[#2a2a3e] flex-shrink-0 flex items-center justify-center">
        {logoUrl ? (
          <img 
            src={logoUrl} 
            alt={entity.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const fallback = document.createElement('span');
                fallback.className = 'text-white font-bold text-xs';
                fallback.textContent = entity.name.charAt(0);
                parent.appendChild(fallback);
              }
            }}
          />
        ) : (
          <span className="text-white font-bold text-xs">{entity.name.charAt(0)}</span>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium text-sm truncate">{entity.name}</span>
          {entity.regulated && (
            <BadgeCheck size={10} className="text-emerald-400 flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
          <StarRating rating={entity.rating || 0} count={entity.reviewCount || 0} />
          <span>•</span>
          <span className="text-zinc-500">{entity.country || 'International'}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        <TrustScoreDisplay score={entity.trustScore || 0} />
        <ArrowRight size={12} className="text-zinc-500" />
      </div>
    </motion.div>
  );
}

// Offer Card Component - Standout Design
function OfferCard({ offer, type, index }: { offer: any; type: 'broker' | 'prop'; index: number }) {
  const router = useRouter();
  
  const handleClick = () => {
    if (type === 'broker') {
      router.push(`/brokers/${offer.slug || offer.name.toLowerCase().replace(/\s+/g, '-')}`);
    } else {
      router.push(`/prop-firms/${offer.slug || offer.name.toLowerCase().replace(/\s+/g, '-')}`);
    }
  };

  const isBroker = type === 'broker';
  const logoUrl = offer.logo || null;
  
  // Get the best offer text
  let offerText = 'Special Offer';
  let discountText = '';
  let expiry = '';
  
  if (isBroker) {
    if (offer.promotions && offer.promotions.length > 0) {
      offerText = offer.promotions[0].name || offerText;
      discountText = offer.promotions[0].discount || '';
      expiry = offer.promotions[0].validUntil || '';
    }
    if (offer.bonuses && offer.bonuses.length > 0 && !offer.promotions?.length) {
      offerText = offer.bonuses[0].amount || offer.bonuses[0].type || offerText;
      expiry = offer.bonuses[0].expiry || '';
    }
  } else {
    if (offer.promotions && offer.promotions.length > 0) {
      offerText = offer.promotions[0].name || offerText;
      discountText = offer.promotions[0].discount || '';
      expiry = offer.promotions[0].validUntil || '';
    }
  }

  const hasDiscount = discountText && discountText !== '';
  const hasExpiry = expiry && expiry !== '';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={handleClick}
      className="relative group cursor-pointer overflow-hidden rounded-lg border border-amber-500/30 bg-gradient-to-br from-[#1a1a2e] to-[#2a1a3e] hover:border-amber-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5 group-hover:from-amber-500/10 group-hover:to-amber-500/10 transition-all duration-500" />
      
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full" />
      
      <div className="relative p-3 flex items-center gap-3">
        {/* Logo */}
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#12121f] border border-amber-500/20 flex-shrink-0 flex items-center justify-center group-hover:border-amber-500/40 transition-all">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={offer.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const fallback = document.createElement('span');
                  fallback.className = 'text-white font-bold text-sm';
                  fallback.textContent = offer.name.charAt(0);
                  parent.appendChild(fallback);
                }
              }}
            />
          ) : (
            <span className="text-white font-bold text-sm">{offer.name.charAt(0)}</span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium text-sm truncate">{offer.name}</span>
            <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${
              isBroker 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
            }`}>
              {isBroker ? 'Broker' : 'Prop'}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <FlameIcon size={10} className="text-amber-400" />
              <span className="text-amber-400 text-xs font-medium truncate">{offerText}</span>
            </div>
            {hasDiscount && (
              <span className="text-[8px] bg-green-500/30 text-green-400 px-1.5 py-0.5 rounded-full font-medium border border-green-500/20">
                {discountText}% OFF
              </span>
            )}
            {!hasDiscount && isBroker && (
              <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full border border-blue-500/20">
                Bonus Available
              </span>
            )}
          </div>
          {hasExpiry && (
            <div className="flex items-center gap-1 mt-0.5">
              <Clock size={8} className="text-zinc-500" />
              <span className="text-[8px] text-zinc-500">
                Expires: {new Date(expiry).toLocaleDateString()}
              </span>
            </div>
          )}
          {!hasExpiry && (
            <div className="flex items-center gap-1 mt-0.5">
              <ZapIcon size={8} className="text-amber-400" />
              <span className="text-[8px] text-amber-400/70">Limited Time</span>
            </div>
          )}
        </div>
        
        <ArrowRight size={16} className="text-amber-400/60 group-hover:text-amber-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>
    </motion.div>
  );
}

// ===================== MAIN COMPONENT =====================
export default function MobileHome() {
  const router = useRouter();
  const { region } = useRegion();
  const [brokers, setBrokers] = useState<any[]>([]);
  const [propFirms, setPropFirms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrichedBrokers, setEnrichedBrokers] = useState<any[]>([]);
  const [enrichedPropFirms, setEnrichedPropFirms] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<any[]>([]);
  
  // Rankings slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Offers toggle state
  const [offersTab, setOffersTab] = useState<'all' | 'brokers' | 'propFirms'>('all');

  const regionInfo = REGION_DISPLAY[region] || REGION_DISPLAY['GLOBAL'];

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [brokersRes, propFirmsRes] = await Promise.all([
          api.getBrokers(region),
          api.getPropFirms(region)
        ]);

        if (brokersRes.success) setBrokers(brokersRes.data || []);
        if (propFirmsRes.success) setPropFirms(propFirmsRes.data || []);

        try {
          const reviewsRes = await fetch('/api/reviews?limit=5&status=APPROVED');
          const reviewsData = await reviewsRes.json();
          if (reviewsData.reviews) setRecentReviews(reviewsData.reviews);
        } catch (err) {}

        try {
          const incidentsRes = await fetch('/api/incidents?limit=5');
          const incidentsData = await incidentsRes.json();
          if (incidentsData.incidents) setRecentIncidents(incidentsData.incidents);
        } catch (err) {}
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [region]);

  // Enrich brokers with trust scores
  useEffect(() => {
    const enrichFirms = async () => {
      if (brokers.length === 0 && propFirms.length === 0) return;
      
      const enrichedBrokersList = await Promise.all(
        brokers.map(async (broker) => {
          try {
            const response = await fetch(`/api/reviews?brokerId=${broker.id}&status=APPROVED&limit=100`);
            const data = await response.json();
            if (response.ok && data.reviews) {
              const stats = calculateTrustStatsFromReviews(data.reviews);
              return { 
                ...broker, 
                trustScore: stats.avgTrustScore, 
                reviewCount: stats.totalReviews
              };
            }
          } catch (err) {}
          return { ...broker, trustScore: 0, reviewCount: 0 };
        })
      );
      
      const enrichedPropList = await Promise.all(
        propFirms.map(async (propFirm) => {
          try {
            const response = await fetch(`/api/reviews?propFirmId=${propFirm.id}&status=APPROVED&limit=100`);
            const data = await response.json();
            if (response.ok && data.reviews) {
              const stats = calculateTrustStatsFromReviews(data.reviews);
              return { 
                ...propFirm, 
                trustScore: stats.avgTrustScore, 
                reviewCount: stats.totalReviews
              };
            }
          } catch (err) {}
          return { ...propFirm, trustScore: 0, reviewCount: 0 };
        })
      );
      
      setEnrichedBrokers(enrichedBrokersList);
      setEnrichedPropFirms(enrichedPropList);
    };
    enrichFirms();
  }, [brokers, propFirms]);

  // Filter by region and sort by trust score
  const regionFilteredBrokers = useMemo(() => {
    return enrichedBrokers
      .filter(firm => isAvailableInRegion(firm, region))
      .sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0));
  }, [enrichedBrokers, region]);

  const regionFilteredPropFirms = useMemo(() => {
    return enrichedPropFirms
      .filter(firm => isAvailableInRegion(firm, region))
      .sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0));
  }, [enrichedPropFirms, region]);

  // Top 5 for rankings
  const topBrokers = regionFilteredBrokers.slice(0, 5);
  const topPropFirms = regionFilteredPropFirms.slice(0, 5);

  // Get offers
  const brokerOffers = useMemo(() => {
    return regionFilteredBrokers
      .filter(b => (b.bonuses && b.bonuses.length > 0) || (b.promotions && b.promotions.length > 0))
      .slice(0, 6);
  }, [regionFilteredBrokers]);

  const propFirmOffers = useMemo(() => {
    return regionFilteredPropFirms
      .filter(p => p.promotions && p.promotions.length > 0)
      .slice(0, 6);
  }, [regionFilteredPropFirms]);

  // Filter offers based on tab
  const filteredOffers = useMemo(() => {
    if (offersTab === 'brokers') {
      return brokerOffers.map(o => ({ ...o, _type: 'broker' as const }));
    }
    if (offersTab === 'propFirms') {
      return propFirmOffers.map(o => ({ ...o, _type: 'prop' as const }));
    }
    // 'all' - combine and interleave
    const combined = [];
    const maxLen = Math.max(brokerOffers.length, propFirmOffers.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < brokerOffers.length) {
        combined.push({ ...brokerOffers[i], _type: 'broker' as const });
      }
      if (i < propFirmOffers.length) {
        combined.push({ ...propFirmOffers[i], _type: 'prop' as const });
      }
    }
    return combined.slice(0, 6);
  }, [brokerOffers, propFirmOffers, offersTab]);

  // Slider data
  const slides = [
    { 
      id: 'brokers', 
      label: 'Top Brokers', 
      icon: Building2, 
      data: topBrokers,
      type: 'broker' as const,
      emptyMessage: 'No brokers available in your region'
    },
    { 
      id: 'propFirms', 
      label: 'Top Prop Firms', 
      icon: TrendingUp, 
      data: topPropFirms,
      type: 'prop' as const,
      emptyMessage: 'No prop firms available in your region'
    },
  ];

  const totalSlides = slides.length;

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    setOffsetX(diff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const threshold = 50;
    if (offsetX > threshold && currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    } else if (offsetX < -threshold && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
    setOffsetX(0);
  };

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  const incidentTypeMap: Record<string, { icon: any; color: string; label: string }> = {
    'WITHDRAWAL_DELAY': { icon: Clock, color: 'text-amber-400', label: 'Withdrawal Delay' },
    'WITHDRAWAL_REJECTED': { icon: XCircle, color: 'text-red-400', label: 'Withdrawal Rejected' },
    'SCAM_WARNING': { icon: AlertCircle, color: 'text-red-400', label: 'Scam Warning' },
    'ACCOUNT_SUSPENDED': { icon: AlertTriangle, color: 'text-red-400', label: 'Account Suspended' },
    'WITHDRAWAL_PAID': { icon: CheckCircle, color: 'text-emerald-400', label: 'Withdrawal Paid' },
    'PLATFORM_FREEZE': { icon: Activity, color: 'text-amber-400', label: 'Platform Freeze' },
    'SERVER_DOWN': { icon: Server, color: 'text-red-400', label: 'Server Down' },
    'EXECUTION_DELAY': { icon: Clock, color: 'text-amber-400', label: 'Execution Delay' },
  };

  const totalReviews = [...enrichedBrokers, ...enrichedPropFirms].reduce((sum, f) => sum + (f.reviewCount || 0), 0);

  const handleNavigate = (id: number, name: string, type: 'broker' | 'prop') => {
    router.push(type === 'prop' ? `/prop-firms/${id}` : `/brokers/${id}`);
  };

  if (loading) {
    return (
      <MobileLayout title="InsightPip" showSearch={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p className="text-xs text-zinc-500 mt-3">Loading...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (brokers.length === 0 && propFirms.length === 0) {
    return (
      <MobileLayout title="InsightPip" showSearch={false}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <Globe size={48} className="text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            No trading partners in {regionInfo.flag} {regionInfo.label}
          </h2>
          <p className="text-zinc-400 text-sm mb-4">
            We don't have any brokers or prop firms available in {regionInfo.flag} {regionInfo.label} yet.
          </p>
          <button
            onClick={() => {
              const selector = document.querySelector('[data-region-selector]');
              if (selector) (selector as HTMLElement).click();
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Change Region
          </button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="InsightPip" showSearch={false}>
      <div className="space-y-8 pb-6">
        
        {/* ==================== 1. HERO ==================== */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="pt-4 pb-2"
        >
          <h1 className="text-3xl font-bold text-white leading-tight">
            Know who you're <span className="text-blue-400">trusting</span>.
          </h1>
          <p className="text-zinc-400 text-sm mt-2 leading-relaxed max-w-xs">
            Research brokers and prop firms before you trade with them.
          </p>
          <div className="flex gap-3 mt-4">
            <Link
              href="/rankings"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1.5"
            >
              Explore Rankings <ArrowRight size={14} />
            </Link>
            <Link
              href="/compare"
              className="px-5 py-2.5 bg-[#1a1a2e] border border-[#2a2a3e] text-white rounded-lg text-sm font-medium hover:bg-[#2a2a3e] transition-colors flex items-center gap-1.5"
            >
              <GitCompare size={14} className="text-zinc-400" /> Compare
            </Link>
          </div>
        </motion.div>

        {/* ==================== 2. INSIGHTPIP INTELLIGENCE ==================== */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="border border-[#1e1e32] rounded-lg p-4 bg-[#12121f]"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-white">InsightPip Intelligence</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{brokers.length}</div>
              <div className="text-[10px] text-zinc-500">Brokers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{propFirms.length}</div>
              <div className="text-[10px] text-zinc-500">Prop Firms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{totalReviews}</div>
              <div className="text-[10px] text-zinc-500">Reviews</div>
            </div>
          </div>
        </motion.div>

        {/* ==================== 3. THE TRUST RANKINGS - SLIDER ==================== */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-amber-400" />
              <h2 className="text-base font-semibold text-white">The Trust Rankings</h2>
            </div>
            <Link href="/rankings" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {/* Slider Container */}
          <div className="relative bg-[#12121f] border border-[#1e1e32] rounded-lg overflow-hidden">
            
            {/* Slide Indicator */}
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <div className="flex gap-1">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(index)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium transition-all ${
                      currentSlide === index
                        ? 'bg-blue-600 text-white'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <slide.icon size={12} />
                    {slide.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-zinc-500">
                  {currentSlide + 1} / {totalSlides}
                </span>
              </div>
            </div>

            {/* Dots */}
            <div className="flex items-center justify-center gap-1 px-4 pb-1">
              <div className="flex gap-1">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`h-1 rounded-full transition-all ${
                      currentSlide === index
                        ? 'w-6 bg-blue-500'
                        : 'w-2 bg-zinc-600 hover:bg-zinc-500'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Swipe hint */}
            <div className="text-center text-[8px] text-zinc-600 pb-1">
              ← Swipe to see more →
            </div>

            {/* Slides */}
            <div 
              ref={sliderRef}
              className="overflow-hidden touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <motion.div
                className="flex"
                animate={{ x: `-${currentSlide * 100}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ width: `${totalSlides * 100}%` }}
              >
                {slides.map((slide) => (
                  <div key={slide.id} className="w-full px-3 pb-3 flex-shrink-0">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
                      {slide.label}
                    </p>
                    {slide.data.length > 0 ? (
                      slide.data.map((entity, index) => (
                        <RankingEntry
                          key={entity.id}
                          rank={index + 1}
                          entity={entity}
                          index={index}
                          onClick={() => handleNavigate(entity.id, entity.name, slide.type)}
                        />
                      ))
                    ) : (
                      <p className="text-zinc-500 text-sm text-center py-4">{slide.emptyMessage}</p>
                    )}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Navigation Arrows */}
            <div className="absolute inset-y-0 left-0 right-0 pointer-events-none flex items-center justify-between px-1">
              {currentSlide > 0 && (
                <button
                  onClick={() => setCurrentSlide(currentSlide - 1)}
                  className="pointer-events-auto w-7 h-7 rounded-full bg-[#1a1a2e] border border-[#2a2a3e] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#2a2a3e] transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
              )}
              {currentSlide < totalSlides - 1 && (
                <button
                  onClick={() => setCurrentSlide(currentSlide + 1)}
                  className="pointer-events-auto w-7 h-7 rounded-full bg-[#1a1a2e] border border-[#2a2a3e] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#2a2a3e] transition-colors ml-auto"
                >
                  <ChevronRightIcon size={14} />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* ==================== 4. BEST OFFERS - STANDOUT DESIGN WITH TOGGLE ==================== */}
        {filteredOffers.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20">
                  <Percent size={14} className="text-amber-400" />
                </div>
                <h2 className="text-base font-semibold text-white">Best Offers</h2>
              </div>
              <Link href="/offers" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {/* Toggle - Standout Design */}
            <div className="flex gap-1 bg-[#12121f] border border-amber-500/20 rounded-lg p-1 mb-3">
              <button
                onClick={() => setOffersTab('all')}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                  offersTab === 'all'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setOffersTab('brokers')}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                  offersTab === 'brokers'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Building2 size={10} className="inline mr-1" />
                Brokers
              </button>
              <button
                onClick={() => setOffersTab('propFirms')}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                  offersTab === 'propFirms'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <TrendingUp size={10} className="inline mr-1" />
                Prop Firms
              </button>
            </div>

            {/* Offer Cards */}
            <div className="space-y-2">
              {filteredOffers.slice(0, 4).map((offer, index) => (
                <OfferCard 
                  key={`${offer._type}-${offer.id}`}
                  offer={offer}
                  type={offer._type}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ==================== 5. TRADER VOICES - WITH LOGOS & AVATARS ==================== */}
        {recentReviews.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageCircle size={16} className="text-blue-400" />
                <h2 className="text-base font-semibold text-white">Trader Voices</h2>
              </div>
              <Link href="/reviews" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                Read all <ArrowRight size={12} />
              </Link>
            </div>

            <div className="space-y-2">
              {recentReviews.slice(0, 3).map((review) => {
                const entityLogo = review.entityLogo || null;
                const userAvatar = review.user?.avatar || null;
                const userName = review.user?.name || 'Anonymous';
                const userInitial = userName.charAt(0).toUpperCase();

                return (
                  <div key={review.id} className="bg-[#12121f] border border-[#1e1e32] rounded-lg p-3">
                    {/* Header with Entity Logo and Name */}
                    <div className="flex items-center gap-2 mb-1.5">
                      {/* Entity Logo */}
                      <div className="w-5 h-5 rounded-md overflow-hidden bg-[#1a1a2e] border border-[#2a2a3e] flex-shrink-0 flex items-center justify-center">
                        {entityLogo ? (
                          <img 
                            src={entityLogo} 
                            alt={review.entityName} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                const fallback = document.createElement('span');
                                fallback.className = 'text-white font-bold text-[8px]';
                                fallback.textContent = review.entityName?.charAt(0) || '?';
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        ) : (
                          <span className="text-white font-bold text-[8px]">{review.entityName?.charAt(0) || '?'}</span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-400 font-medium">{review.entityName}</span>
                      <span className="text-[8px] text-zinc-600">•</span>
                      <StarRating rating={review.rating || 0} size="sm" />
                    </div>

                    {/* Review Content */}
                    <p className="text-zinc-300 text-sm leading-relaxed line-clamp-2">
                      {review.content}
                    </p>

                    {/* Footer with User Avatar and Date */}
                    <div className="flex items-center gap-2 mt-2">
                      {/* User Avatar */}
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-[#1a1a2e] border border-[#2a2a3e] flex-shrink-0 flex items-center justify-center">
                        {userAvatar ? (
                          <img 
                            src={userAvatar} 
                            alt={userName} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                const fallback = document.createElement('span');
                                fallback.className = 'text-white font-bold text-[8px]';
                                fallback.textContent = userInitial;
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        ) : (
                          <User size={10} className="text-zinc-400" />
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500">{userName}</span>
                      <span className="text-[8px] text-zinc-600">•</span>
                      <span className="text-[10px] text-zinc-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ==================== 6. WHAT'S HAPPENING ==================== */}
        {recentIncidents.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-400" />
                <h2 className="text-base font-semibold text-white">What's Happening</h2>
              </div>
              <Link href="/reviews?tab=incidents" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>

            <div className="space-y-2">
              {recentIncidents.slice(0, 3).map((incident) => {
                const typeInfo = incidentTypeMap[incident.incidentType] || { icon: AlertCircle, color: 'text-zinc-400', label: 'Reported' };
                const Icon = typeInfo.icon;
                return (
                  <div key={incident.id} className="bg-[#12121f] border border-[#1e1e32] rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Icon size={14} className={`${typeInfo.color} mt-0.5 flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm truncate">{incident.entityName || 'Unknown'}</span>
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex-shrink-0">
                            {incident.status || 'PENDING'}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-xs">{incident.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-500">
                          <span>{typeInfo.label}</span>
                          <span>•</span>
                          <span>{new Date(incident.incidentDate || incident.createdAt).toLocaleDateString()}</span>
                          {incident.confirmations > 0 && (
                            <>
                              <span>•</span>
                              <span>{incident.confirmations} confirmations</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ==================== 7. EXPLORE TRADING PARTNERS ==================== */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="border border-[#1e1e32] rounded-lg p-4 bg-[#12121f]"
        >
          <h2 className="text-sm font-semibold text-white mb-3">Explore Trading Partners</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/brokers"
              className="p-3 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg text-center hover:bg-[#2a2a3e] transition-colors"
            >
              <Building2 size={20} className="text-blue-400 mx-auto mb-1" />
              <div className="text-white text-sm font-medium">Brokers</div>
              <div className="text-[10px] text-zinc-500">Research, reviews, incidents</div>
            </Link>
            <Link
              href="/prop-firms"
              className="p-3 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg text-center hover:bg-[#2a2a3e] transition-colors"
            >
              <TrendingUp size={20} className="text-purple-400 mx-auto mb-1" />
              <div className="text-white text-sm font-medium">Prop Firms</div>
              <div className="text-[10px] text-zinc-500">Challenges, rules, offers</div>
            </Link>
          </div>
        </motion.div>

        {/* ==================== 8. FINAL BRAND STATEMENT ==================== */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center py-4 border-t border-[#1e1e32]"
        >
          <p className="text-sm text-zinc-400 italic">
            "Before you trade with them, <span className="text-white">know them</span>."
          </p>
          <Link
            href="/brokers"
            className="inline-flex items-center gap-2 mt-3 text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors"
          >
            Research Brokers <ArrowRight size={14} />
          </Link>
        </motion.div>

        {/* Footer */}
        <div className="text-center text-[10px] text-zinc-600 pb-2">
          Research before you trust.™
        </div>
      </div>
    </MobileLayout>
  );
}