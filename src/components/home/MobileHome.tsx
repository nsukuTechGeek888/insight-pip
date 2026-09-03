// components/home/MobileHome.tsx - REDESIGNED: Clean, Professional, Data-Driven

'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useRegion } from '@/contexts/RegionContext';
import { 
  Star, Search, Shield, Building2, MessageCircle, 
  AlertTriangle, CheckCircle, ArrowRight, Users, 
  Eye, X, Clock, Award, Info, DollarSign, Wallet, 
  Gauge, Heart, RefreshCw, Flame, Crown, Gem, Gift, Percent, 
  Rocket, Tag, ShieldCheck, HelpCircle, XCircle, Activity, 
  Target, Smartphone, AlertCircle, TrendingUp, ChevronRight,
  Menu, Home, BarChart3, FileText, Settings, ChevronDown,
  ThumbsUp, ThumbsDown, ExternalLink, ChevronUp, Layers,
  Briefcase, LineChart, PiggyBank, Globe, Server, Monitor,
  CreditCard, Landmark, BadgeCheck,
  Trophy, Medal, Hash, Sparkles
} from 'lucide-react';
import { formatCurrency } from '@/utils/api-helpers';
import TrustScoreBadge from '@/components/ui/TrustScoreBadge';
import MobileLayout from '@/components/mobile/MobileLayout';

// ===================== DESIGN SYSTEM =====================
// Colors: Clean, restrained, professional
const COLORS = {
  surface: '#0d0d1a',
  surfaceLight: '#151525',
  surfaceCard: '#1a1a2e',
  border: '#2a2a3e',
  borderLight: '#3a3a4e',
  textPrimary: '#ffffff',
  textSecondary: '#a0a0b8',
  textMuted: '#68687e',
  accent: '#2563eb',
  accentHover: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  gold: '#fbbf24',
  silver: '#9ca3af',
  bronze: '#d97706',
};

// Typography scale
const TYPOGRAPHY = {
  h1: 'text-2xl font-bold leading-tight',
  h2: 'text-lg font-semibold leading-tight',
  h3: 'text-base font-semibold leading-tight',
  body: 'text-sm leading-relaxed',
  small: 'text-xs leading-relaxed',
  meta: 'text-[10px] leading-relaxed',
};

// Spacing
const SPACING = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
  xl: 'gap-5',
  '2xl': 'gap-6',
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
const getAllAccountOptions = (firm: any) => {
  if (!firm.programs) return [];
  return firm.programs.flatMap((program: any) => program.accountOptions || []);
};

const getAllProgramTypes = (firm: any) => {
  if (!firm.programs) return [];
  return firm.programs.map((program: any) => program.type);
};

const getAllPlatforms = (firm: any) => {
  return firm.platforms || firm.platform || [];
};

const getMinAccountSize = (firm: any) => {
  const accountOptions = getAllAccountOptions(firm);
  if (accountOptions.length === 0) return 0;
  return Math.min(...accountOptions.map((acc: any) => acc.accountSize));
};

const getMaxPayout = (firm: any) => {
  const accountOptions = getAllAccountOptions(firm);
  if (accountOptions.length === 0) return 0;
  return Math.max(...accountOptions.map((acc: any) => acc.payoutPercentage || acc.payout));
};

const calculateTrustStatsFromReviews = (reviews: any[]) => {
  if (!reviews || reviews.length === 0) {
    return { avgTrustScore: 0, totalReviews: 0 };
  }
  const avgTrustScore = reviews.reduce((sum, r) => sum + (r.trustScore || 0), 0) / reviews.length;
  return { avgTrustScore, totalReviews: reviews.length };
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

// Star Rating - Clean, minimal
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
        <span className="text-sm text-white font-medium">{displayRating.toFixed(1)}</span>
      )}
      {count > 0 && (
        <span className="text-xs text-zinc-500">({count})</span>
      )}
    </div>
  );
}

// Ranking Number - Clean, no gradients
function RankingNumber({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex items-center justify-center w-7 h-7 bg-amber-500 rounded-full flex-shrink-0">
        <Trophy size={12} className="text-white" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center justify-center w-7 h-7 bg-zinc-400 rounded-full flex-shrink-0">
        <Medal size={12} className="text-white" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex items-center justify-center w-7 h-7 bg-amber-700 rounded-full flex-shrink-0">
        <Medal size={12} className="text-white" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-500 font-mono text-[10px] flex-shrink-0">
      {rank}
    </div>
  );
}

// Firm Logo - Clean
function FirmLogo({ firm, size = "md" }: { firm: any; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-10 h-10 rounded-lg text-sm",
    md: "w-12 h-12 rounded-lg text-base",
    lg: "w-14 h-14 rounded-lg text-lg"
  };
  
  const initials = firm.name?.charAt(0) || '?';
  
  if (firm.logo) {
    return (
      <div className={`${sizeClasses[size]} overflow-hidden bg-white border border-zinc-800 flex-shrink-0`}>
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
              fallback.className = `${sizeClasses[size]} bg-zinc-800 flex items-center justify-center text-white font-bold flex-shrink-0`;
              fallback.textContent = initials;
              parent.appendChild(fallback);
            }
          }}
        />
      </div>
    );
  }
  
  return (
    <div className={`${sizeClasses[size]} bg-zinc-800 flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

// Trust Score Display - Clean, prominent
function TrustScoreDisplay({ score }: { score: number }) {
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

  return (
    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border ${getColor()}`}>
      <Shield size={12} />
      <span className="text-[10px] font-medium">{getLabel()}</span>
      <span className="text-white font-bold text-sm">{normalizedScore}</span>
    </div>
  );
}

// ===================== FIRM CARD =====================
function FirmCard({ firm, type, rank, onViewDetails }: { 
  firm: any; 
  type: 'prop' | 'broker'; 
  rank: number; 
  onViewDetails: () => void;
}) {
  const trustScore = firm.trustScore || 0;
  const reviewCount = firm.reviewCount || 0;
  const isTop3 = rank <= 3;
  const platforms = type === 'prop' ? getAllPlatforms(firm) : (firm.platforms || firm.platform || []);
  
  const isRegulated = firm.regulated || firm.regulation || (firm.regulatoryBodies && firm.regulatoryBodies.length > 0);
  const hasOffer = type === 'broker' 
    ? ((firm.bonuses && firm.bonuses.length > 0) || (firm.promotions && firm.promotions.length > 0))
    : (firm.promotions && firm.promotions.length > 0);
  const offerText = type === 'broker'
    ? (firm.bonuses?.[0]?.amount || firm.promotions?.[0]?.name || "Special Offer")
    : (firm.promotions?.[0]?.name || "Limited Time");

  return (
    <div className={`bg-zinc-900 rounded-lg border ${isTop3 ? 'border-amber-500/30' : 'border-zinc-800'}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <RankingNumber rank={rank} />
          <FirmLogo firm={firm} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-white font-semibold text-base truncate">{firm.name}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <StarRating rating={firm.rating || 0} count={reviewCount} />
                  {isRegulated && type === 'broker' && (
                    <BadgeCheck size={12} className="text-emerald-400" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 Badge */}
        {isTop3 && (
          <div className="mt-3 inline-flex items-center gap-1 border border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px] font-medium px-2 py-0.5 rounded-full">
            {rank === 1 && <Crown size={10} />}
            {rank === 2 && <Medal size={10} />}
            {rank === 3 && <Medal size={10} />}
            #{rank} Ranked
          </div>
        )}
        
        {/* Metrics */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {type === 'prop' ? (
            <>
              <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                <div className="text-zinc-500 text-[8px] uppercase tracking-wider">Payout</div>
                <div className="text-white font-semibold text-sm">Up to {getMaxPayout(firm)}%</div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                <div className="text-zinc-500 text-[8px] uppercase tracking-wider">Min Account</div>
                <div className="text-white font-semibold text-sm">{formatCurrency(getMinAccountSize(firm))}</div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                <div className="text-zinc-500 text-[8px] uppercase tracking-wider">Min Deposit</div>
                <div className="text-white font-semibold text-sm">{formatCurrency(firm.minDeposit || 100)}</div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                <div className="text-zinc-500 text-[8px] uppercase tracking-wider">Leverage</div>
                <div className="text-white font-semibold text-sm">{firm.leverage || '1:100'}</div>
              </div>
            </>
          )}
        </div>

        {/* Trust Score */}
        {trustScore > 0 && (
          <div className="mt-3">
            <TrustScoreDisplay score={trustScore} />
          </div>
        )}

        {/* Platform Badges */}
        {platforms.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {platforms.slice(0, 3).map((p: string, i: number) => (
              <span key={i} className="text-[8px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700">
                {p}
              </span>
            ))}
            {platforms.length > 3 && (
              <span className="text-[8px] text-zinc-500">+{platforms.length - 3}</span>
            )}
          </div>
        )}

        {/* Offer */}
        {hasOffer && (
          <div className="mt-3 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-center gap-1.5">
              <Gift size={10} className="text-amber-400" />
              <span className="text-[8px] font-medium text-amber-400 uppercase tracking-wider">Offer</span>
            </div>
            <p className="text-white text-xs font-medium">{offerText}</p>
          </div>
        )}
        
        {/* Action Button */}
        <button
          onClick={onViewDetails}
          className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          View Details <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ===================== FEATURED CARD =====================
function FeaturedCard({ firm, type, onPress, trustScore, reviewCount }: { 
  firm: any; 
  type: 'broker' | 'prop'; 
  onPress: () => void; 
  trustScore: number; 
  reviewCount: number;
}) {
  const isBroker = type === 'broker';
  const platforms = type === 'prop' ? getAllPlatforms(firm) : (firm.platforms || firm.platform || []);
  
  return (
    <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg overflow-hidden">
      <div className="p-4">
        {/* Featured Badge */}
        <div className="flex justify-between items-start mb-3">
          <div className="inline-flex items-center gap-1 border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[9px] font-medium px-2 py-0.5 rounded-full">
            <Crown size={10} />
            FEATURED
          </div>
          <span className="text-[8px] text-zinc-500">{isBroker ? 'Broker' : 'Prop Firm'}</span>
        </div>
        
        <div className="flex items-center gap-3 mb-3">
          <FirmLogo firm={firm} size="lg" />
          <div>
            <h3 className="text-white font-bold text-base">{firm.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating rating={firm.rating || 0} count={reviewCount} size="md" />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          {isBroker ? (
            <>
              <div className="bg-zinc-800/50 rounded-lg p-2">
                <div className="text-zinc-500 text-[10px]">Min Deposit</div>
                <div className="text-white font-semibold text-sm">{formatCurrency(firm.minDeposit || 100)}</div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-2">
                <div className="text-zinc-500 text-[10px]">Leverage</div>
                <div className="text-white font-semibold text-sm">{firm.leverage || '1:200'}</div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-zinc-800/50 rounded-lg p-2">
                <div className="text-zinc-500 text-[10px]">Max Payout</div>
                <div className="text-white font-semibold text-sm">Up to {getMaxPayout(firm)}%</div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-2">
                <div className="text-zinc-500 text-[10px]">Min Account</div>
                <div className="text-white font-semibold text-sm">{formatCurrency(getMinAccountSize(firm))}</div>
              </div>
            </>
          )}
        </div>

        {trustScore > 0 && (
          <div className="mb-3">
            <TrustScoreDisplay score={trustScore} />
          </div>
        )}
        
        <button 
          onClick={onPress} 
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          {isBroker ? 'View Account Types' : 'View Challenge Options'} <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ===================== QUICK ACTION CARD =====================
function QuickActionCard({ icon: Icon, title, description, href, color }: any) {
  return (
    <Link href={href} className="flex-1">
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center hover:bg-zinc-800 transition-colors">
        <Icon size={18} className={`${color} mx-auto mb-1`} />
        <div className="text-white font-medium text-xs">{title}</div>
        <div className="text-zinc-500 text-[10px]">{description}</div>
      </div>
    </Link>
  );
}

// ===================== LIVE INCIDENT FEED =====================
function LiveIncidentFeed({ brokers, propFirms }: { brokers: any[]; propFirms: any[] }) {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const incidentTypes = [
    { value: 'WITHDRAWAL_DELAY', label: 'Withdrawal Delay', icon: Clock, color: 'text-amber-400' },
    { value: 'WITHDRAWAL_REJECTED', label: 'Withdrawal Rejected', icon: XCircle, color: 'text-red-400' },
    { value: 'SCAM_WARNING', label: 'Scam Warning', icon: AlertCircle, color: 'text-red-400' },
    { value: 'ACCOUNT_SUSPENDED', label: 'Account Suspended', icon: AlertTriangle, color: 'text-red-400' },
  ];

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await fetch('/api/incidents?limit=5');
        const data = await response.json();
        if (response.ok && data.incidents) {
          const enriched = data.incidents.map((incident: any) => {
            let entityName = incident.entityName;
            if (!entityName && incident.entityType === 'broker') {
              const broker = brokers.find(b => b.id === incident.entityId);
              entityName = broker?.name || 'Unknown';
            } else if (!entityName && incident.entityType === 'propFirm') {
              const propFirm = propFirms.find(p => p.id === incident.entityId);
              entityName = propFirm?.name || 'Unknown';
            }
            return { ...incident, entityName };
          });
          setIncidents(enriched);
        }
      } catch (err) {
        console.error('Failed to fetch incidents:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 30000);
    return () => clearInterval(interval);
  }, [brokers, propFirms]);

  useEffect(() => {
    if (incidents.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % incidents.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [incidents.length]);

  if (loading || incidents.length === 0) {
    return (
      <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-medium text-zinc-400">Live Incidents</span>
        </div>
        <div className="text-center py-1 text-zinc-500 text-xs">No recent incidents</div>
      </div>
    );
  }

  const current = incidents[currentIndex];
  const typeInfo = incidentTypes.find(t => t.value === current.incidentType);
  const IconComponent = typeInfo?.icon || AlertTriangle;
  const iconColor = typeInfo?.color || 'text-red-400';

  return (
    <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping absolute" />
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          </div>
          <span className="text-xs font-medium text-zinc-400">⚠️ Live Incident Alert</span>
        </div>
        <Link href="/reviews?tab=incidents" className="text-[10px] text-blue-400 hover:text-blue-300">
          View all
        </Link>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentIndex} 
          initial={{ opacity: 0, y: 8 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: -8 }} 
          className="space-y-1"
        >
          <div className="flex items-center gap-2">
            <IconComponent size={12} className={iconColor} />
            <span className="text-white font-semibold text-sm">{current.entityName}</span>
            {current.confirmations >= 3 && (
              <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">Verified</span>
            )}
          </div>
          <p className="text-zinc-300 text-xs">{current.title}</p>
          <div className="flex items-center gap-3 text-[10px] text-zinc-500">
            <span className="flex items-center gap-1"><Clock size={8} /> {new Date(current.incidentDate).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Users size={8} /> {current.confirmations} confirmations</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
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
  const [selectedType, setSelectedType] = useState<'prop' | 'broker'>('prop');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const regionInfo = REGION_DISPLAY[region] || REGION_DISPLAY['GLOBAL'];

  // Fetch data with region
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
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [region]);

  // Enrich firms with reviews and trust scores
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
                trustScore: Math.round(stats.avgTrustScore), 
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
                trustScore: Math.round(stats.avgTrustScore), 
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

  // Filter by region
  const regionFilteredPropFirms = useMemo(() => {
    return enrichedPropFirms.filter(firm => isAvailableInRegion(firm, region));
  }, [enrichedPropFirms, region]);

  const regionFilteredBrokers = useMemo(() => {
    return enrichedBrokers.filter(firm => isAvailableInRegion(firm, region));
  }, [enrichedBrokers, region]);

  // Sort by trust score
  const sortedPropFirms = useMemo(() => {
    return [...regionFilteredPropFirms].sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0));
  }, [regionFilteredPropFirms]);

  const sortedBrokers = useMemo(() => {
    return [...regionFilteredBrokers].sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0));
  }, [regionFilteredBrokers]);

  const sortedCurrentFirms = selectedType === 'prop' ? sortedPropFirms : sortedBrokers;
  
  const filteredFirms = useMemo(() => {
    if (!searchTerm) return sortedCurrentFirms;
    return sortedCurrentFirms.filter(f => f.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [sortedCurrentFirms, searchTerm]);

  const featuredPropFirm = sortedPropFirms[0] || null;
  const featuredBroker = sortedBrokers[0] || null;

  const totalPages = Math.ceil(filteredFirms.length / itemsPerPage);
  const paginatedFirms = filteredFirms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm('');
  }, [selectedType]);

  const totalReviews = [...enrichedBrokers, ...enrichedPropFirms].reduce((sum, f) => sum + (f.reviewCount || 0), 0);

  const handleNavigate = (id: number, name: string, type: 'broker' | 'prop') => {
    router.push(type === 'prop' ? `/prop-firms/${id}` : `/brokers/${id}`);
  };

  if (!loading && brokers.length === 0 && propFirms.length === 0) {
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
              const regionSelector = document.querySelector('[data-region-selector]');
              if (regionSelector) {
                (regionSelector as HTMLElement).click();
              }
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Change Region
          </button>
        </div>
      </MobileLayout>
    );
  }

  if (loading) {
    return (
      <MobileLayout title="InsightPip" showSearch={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p className="text-xs text-zinc-500 mt-3">Loading trading platforms...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="InsightPip" showSearch={false}>
      <div className="space-y-5 pb-6">
        
        {/* Hero - Clean Stats */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5">
          <h1 className="text-xl font-bold text-white mb-1">Trading Partner<span className="text-blue-400"> Research</span></h1>
          <p className="text-zinc-400 text-sm mb-4">Compare {brokers.length + propFirms.length}+ verified brokers and prop firms.</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
              <div className="text-blue-400 font-bold text-lg">{propFirms.length}</div>
              <div className="text-zinc-500 text-[10px]">Prop Firms</div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
              <div className="text-blue-400 font-bold text-lg">{brokers.length}</div>
              <div className="text-zinc-500 text-[10px]">Brokers</div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
              <div className="text-blue-400 font-bold text-lg">{totalReviews.toLocaleString()}</div>
              <div className="text-zinc-500 text-[10px]">Reviews</div>
            </div>
          </div>
          <div className="mt-3 text-center text-[10px] text-zinc-500 flex items-center justify-center gap-1">
            <Hash size={10} /> Ranked by Trust Score
          </div>
        </div>

        {/* Live Incident Feed */}
        <LiveIncidentFeed brokers={brokers} propFirms={propFirms} />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <QuickActionCard 
            icon={MessageCircle} 
            title="Write a Review" 
            description="Share your experience" 
            href="/reviews"
            color="text-blue-400"
          />
          <QuickActionCard 
            icon={AlertTriangle} 
            title="Report Incident" 
            description="Warn other traders" 
            href="/reviews?tab=incidents"
            color="text-red-400"
          />
        </div>

        {/* Featured Sections */}
        {featuredPropFirm && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={14} className="text-amber-400" />
              <h2 className="text-white font-semibold text-sm">Top Ranked Prop Firm</h2>
            </div>
            <FeaturedCard 
              firm={featuredPropFirm} 
              type="prop" 
              onPress={() => handleNavigate(featuredPropFirm.id, featuredPropFirm.name, 'prop')}
              trustScore={featuredPropFirm.trustScore || 0}
              reviewCount={featuredPropFirm.reviewCount || 0}
            />
          </div>
        )}

        {featuredBroker && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={14} className="text-amber-400" />
              <h2 className="text-white font-semibold text-sm">Top Ranked Broker</h2>
            </div>
            <FeaturedCard 
              firm={featuredBroker} 
              type="broker" 
              onPress={() => handleNavigate(featuredBroker.id, featuredBroker.name, 'broker')}
              trustScore={featuredBroker.trustScore || 0}
              reviewCount={featuredBroker.reviewCount || 0}
            />
          </div>
        )}

        {/* Type Toggle */}
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          <button
            onClick={() => setSelectedType('prop')}
            className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
              selectedType === 'prop'
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Prop Firms ({sortedPropFirms.length})
          </button>
          <button
            onClick={() => setSelectedType('broker')}
            className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
              selectedType === 'broker'
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Brokers ({sortedBrokers.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input
            type="text"
            placeholder={`Search ${selectedType === 'prop' ? 'prop firms' : 'brokers'}...`}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* Results Count */}
        {searchTerm && (
          <div className="text-xs text-zinc-500">
            Found {filteredFirms.length} result{filteredFirms.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Firms List */}
        {paginatedFirms.length > 0 ? (
          <div className="space-y-3">
            {paginatedFirms.map((firm, index) => {
              const globalRank = (currentPage - 1) * itemsPerPage + index + 1;
              return (
                <FirmCard
                  key={firm.id}
                  firm={firm}
                  type={selectedType}
                  rank={globalRank}
                  onViewDetails={() => handleNavigate(firm.id, firm.name, selectedType)}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search size={24} className="text-zinc-500" />
            </div>
            <p className="text-zinc-500 text-sm">No {selectedType === 'prop' ? 'prop firms' : 'brokers'} found</p>
            <p className="text-zinc-600 text-xs mt-1">Try adjusting your search</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 py-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-3 py-1.5 rounded-md bg-zinc-800 text-white text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-zinc-400 text-xs">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-3 py-1.5 rounded-md bg-zinc-800 text-white text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Footer Note */}
        <div className="text-center text-[10px] text-zinc-600 py-2 border-t border-zinc-800 pt-4">
          Data is community-reported and verified. Always do your own research.
        </div>
      </div>
    </MobileLayout>
  );
}