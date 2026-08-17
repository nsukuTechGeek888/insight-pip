// components/home/MobileHome.tsx - FULLY UPDATED WITH REGION AWARENESS

'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useRegion } from '@/contexts/RegionContext';
import { 
  Star, Search, Shield, Zap, Building2, MessageCircle, 
  AlertTriangle, CheckCircle, ArrowRight, Sparkles, Users, 
  Eye, Filter, X, Clock, Award, Info, DollarSign, Wallet, 
  Gauge, Heart, RefreshCw, Flame, Crown, Gem, Gift, Percent, 
  Rocket, Tag, ShieldCheck, HelpCircle, XCircle, Activity, 
  Target, Smartphone, AlertCircle, TrendingUp, ChevronRight,
  Menu, Home, BarChart3, FileText, Settings, ChevronDown,
  ThumbsUp, ThumbsDown, ExternalLink, ChevronUp, Layers,
  Briefcase, LineChart, PiggyBank, Globe, Server, Monitor,
  CreditCard, Landmark, Award as AwardIcon, BadgeCheck,
  Trophy, Medal, Hash
} from 'lucide-react';
import { formatCurrency } from '@/utils/api-helpers';
import TrustScoreBadge from '@/components/ui/TrustScoreBadge';
import MobileLayout from '@/components/mobile/MobileLayout';

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

// Helper functions
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
  const index = name.length % gradients.length;
  return gradients[index];
};

// Platform icon mapping
const platformIconMap: Record<string, string> = {
  'MT4': 'MT4',
  'MT5': 'MT5',
  'cTrader': 'cT',
  'TradingView': 'TV',
  'NinjaTrader': 'NT',
  'MetaTrader 4': 'MT4',
  'MetaTrader 5': 'MT5',
  'WebTrader': 'Web',
  'Mobile App': 'App',
};

// Get platform color
const getPlatformColor = (platform: string): string => {
  const colors: Record<string, string> = {
    'MT4': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'MT5': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'cTrader': 'bg-green-500/20 text-green-400 border-green-500/30',
    'TradingView': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'NinjaTrader': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'WebTrader': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Mobile App': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  };
  return colors[platform] || 'bg-zinc-700/50 text-zinc-400 border-zinc-600/50';
};

// Trust score calculation from reviews
const calculateTrustStatsFromReviews = (reviews: any[]) => {
  if (!reviews || reviews.length === 0) {
    return { avgTrustScore: 0, totalReviews: 0 };
  }
  const avgTrustScore = reviews.reduce((sum, r) => sum + (r.trustScore || 0), 0) / reviews.length;
  return { avgTrustScore, totalReviews: reviews.length };
};

// Incident Types
const incidentTypes = [
  { value: 'WITHDRAWAL_DELAY', label: 'Withdrawal Delay', icon: Clock, color: 'text-orange-400' },
  { value: 'WITHDRAWAL_REJECTED', label: 'Withdrawal Rejected', icon: XCircle, color: 'text-red-400' },
  { value: 'WITHDRAWAL_PAID', label: 'Withdrawal Paid', icon: CheckCircle, color: 'text-green-400' },
  { value: 'SCAM_WARNING', label: 'Scam Warning', icon: AlertCircle, color: 'text-red-400' },
  { value: 'ACCOUNT_SUSPENDED', label: 'Account Suspended', icon: AlertTriangle, color: 'text-red-400' },
];

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

// Star Rating Component
function StarRating({ rating, count = 0 }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`w-3 h-3 ${i <= Math.floor(rating) && count > 0 ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-700'}`} />
        ))}
      </div>
      {count > 0 && <span className="text-xs text-zinc-500">({count})</span>}
    </div>
  );
}

// ===================== RANKING NUMBER COMPONENT =====================
function RankingNumber({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg shadow-yellow-500/30 flex-shrink-0">
        <Trophy size={12} className="text-white" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full shadow-lg shadow-gray-400/30 flex-shrink-0">
        <Medal size={12} className="text-white" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full shadow-lg shadow-amber-600/30 flex-shrink-0">
        <Medal size={12} className="text-white" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-800/80 text-zinc-400 font-mono text-[10px] border border-zinc-700/50 flex-shrink-0">
      #{rank}
    </div>
  );
}

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

// Live Incident Feed Component
function LiveIncidentFeed({ brokers, propFirms }: { brokers: any[]; propFirms: any[] }) {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

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
      <div className="bg-red-500/5 rounded-xl p-3 border border-red-500/20">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-medium text-zinc-400">Live Incidents</span>
        </div>
        <div className="text-center py-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500 mx-auto" />
        </div>
      </div>
    );
  }

  const current = incidents[currentIndex];
  const typeInfo = incidentTypes.find(t => t.value === current.incidentType);
  const IconComponent = typeInfo?.icon || AlertTriangle;
  const iconColor = typeInfo?.color || 'text-red-400';

  return (
    <div className="bg-gradient-to-r from-red-500/5 via-amber-500/5 to-purple-500/5 rounded-xl p-3 border border-red-500/20">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping absolute" />
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          </div>
          <span className="text-xs font-medium text-zinc-400">⚠️ Live Incident Alert</span>
        </div>
        <Link href="/reviews?tab=incidents" className="text-[10px] text-purple-400">View all</Link>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-1">
          <div className="flex items-center gap-2">
            <IconComponent size={12} className={iconColor} />
            <span className="text-white font-semibold text-sm">{current.entityName}</span>
            {current.confirmations >= 3 && (
              <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">Verified</span>
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

// ===================== FIRM CARD WITH RANKING AND LOGO =====================
function FirmCard({ firm, type, rank, onViewDetails }: { firm: any; type: 'prop' | 'broker'; rank: number; onViewDetails: () => void }) {
  const [expanded, setExpanded] = useState(true);
  const trustScore = firm.trustScore || 0;
  const reviewCount = firm.reviewCount || 0;
  const isTop3 = rank <= 3;
  
  const uniqueAccountTypes = type === 'prop' ? [...new Set(getAllProgramTypes(firm))] : [];
  const platforms = type === 'prop' ? getAllPlatforms(firm) : (firm.platforms || firm.platform || []);
  const assets = type === 'prop' && firm.assets ? (typeof firm.assets === 'string' ? firm.assets.split(',') : firm.assets) : [];
  
  const isRegulated = firm.regulated || firm.regulation || (firm.regulatoryBodies && firm.regulatoryBodies.length > 0);
  const hasOffer = type === 'broker' 
    ? ((firm.bonuses && firm.bonuses.length > 0) || (firm.promotions && firm.promotions.length > 0))
    : (firm.promotions && firm.promotions.length > 0);
  const offerText = type === 'broker'
    ? (firm.bonuses?.[0]?.amount || firm.promotions?.[0]?.name || "Special Offer")
    : (firm.promotions?.[0]?.name || "Limited Time");
  const discountPercent = type === 'prop' ? firm.promotions?.[0]?.discount : null;
  
  const renderPlatformIcons = () => {
    const displayPlatforms = platforms.slice(0, 3);
    return (
      <div className="flex flex-wrap gap-1">
        {displayPlatforms.map((p: string, i: number) => {
          const shortName = platformIconMap[p] || p.slice(0, 3);
          const colorClass = getPlatformColor(p);
          return (
            <span key={i} className={`text-[8px] px-1.5 py-0.5 rounded border ${colorClass}`}>
              {shortName}
            </span>
          );
        })}
        {platforms.length > 3 && (
          <span className="text-[8px] text-zinc-500">+{platforms.length - 3}</span>
        )}
        {platforms.length === 0 && (
          <span className="text-[8px] text-zinc-600">—</span>
        )}
      </div>
    );
  };

  const renderRegulationBadges = () => {
    if (type === 'prop') return null;
    const regs = firm.regulation?.authorities || (typeof firm.regulation === 'string' ? [firm.regulation] : []);
    if (regs.length === 0 && !isRegulated) return null;
    return (
      <div className="flex flex-wrap gap-1">
        {regs.slice(0, 2).map((reg: string, i: number) => (
          <span key={i} className="text-[8px] bg-green-900/50 text-green-300 px-1.5 py-0.5 rounded">{reg.split(' ')[0]}</span>
        ))}
        {regs.length === 0 && isRegulated && (
          <span className="text-[8px] bg-green-900/50 text-green-300 px-1.5 py-0.5 rounded">Regulated</span>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-zinc-900/50 rounded-xl border overflow-hidden transition-all ${
      isTop3 ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/10' : 'border-zinc-800 hover:border-purple-500/30'
    }`}>
      {/* Header - With Ranking and Logo */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Ranking Number */}
          <RankingNumber rank={rank} />
          
          <FirmLogo firm={firm} size="md" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-white font-semibold text-base truncate">{firm.name}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <StarRating rating={firm.rating || 0} count={reviewCount} />
                  {trustScore > 0 && <TrustScoreBadge score={trustScore} size="sm" showLabel={true} />}
                  {isRegulated && type === 'broker' && (
                    <BadgeCheck size={12} className="text-green-400" />
                  )}
                </div>
              </div>
              <button 
                onClick={() => setExpanded(!expanded)} 
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors flex-shrink-0"
              >
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Top 3 Badge */}
        {isTop3 && rank === 1 && (
          <div className="mt-2 inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full">
            <Crown size={10} /> #1 Ranked
          </div>
        )}
        {isTop3 && rank === 2 && (
          <div className="mt-2 inline-flex items-center gap-1 bg-gradient-to-r from-gray-300 to-gray-400 text-black text-[8px] font-bold px-2 py-0.5 rounded-full">
            <Medal size={10} /> #2 Ranked
          </div>
        )}
        {isTop3 && rank === 3 && (
          <div className="mt-2 inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full">
            <Medal size={10} /> #3 Ranked
          </div>
        )}
      </div>
      
      {/* Expanded Content */}
      <div className="px-4 pb-4 space-y-3">
        {/* Quick Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          {type === 'prop' ? (
            <>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <div className="text-zinc-500 text-[8px] uppercase tracking-wider">Payout</div>
                <div className="text-white font-semibold text-sm">Up to {getMaxPayout(firm)}%</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <div className="text-zinc-500 text-[8px] uppercase tracking-wider">Min Account</div>
                <div className="text-white font-semibold text-sm">{formatCurrency(getMinAccountSize(firm))}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <div className="text-zinc-500 text-[8px] uppercase tracking-wider">Programs</div>
                <div className="text-white font-semibold text-sm">{firm.programs?.length || 0}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <div className="text-zinc-500 text-[8px] uppercase tracking-wider">Platforms</div>
                <div className="text-white font-semibold text-sm">{platforms.length}</div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <div className="text-zinc-500 text-[8px] uppercase tracking-wider">Min Deposit</div>
                <div className="text-white font-semibold text-sm">{formatCurrency(firm.minDeposit || 100)}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <div className="text-zinc-500 text-[8px] uppercase tracking-wider">Leverage</div>
                <div className="text-white font-semibold text-sm">{firm.leverage || '1:100'}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <div className="text-zinc-500 text-[8px] uppercase tracking-wider">Regulation</div>
                <div className="text-white font-semibold text-sm flex justify-center">
                  {renderRegulationBadges() || <span className="text-zinc-500 text-xs">—</span>}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <div className="text-zinc-500 text-[8px] uppercase tracking-wider">Platforms</div>
                <div className="text-white font-semibold text-sm flex justify-center">
                  {renderPlatformIcons()}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Additional Info */}
        <div className="space-y-2">
          {/* Platforms - Full list */}
          {platforms.length > 0 && (
            <div>
              <div className="text-zinc-500 text-[9px] mb-1 flex items-center gap-1">
                <Monitor size={10} /> Trading Platforms
              </div>
              <div className="flex flex-wrap gap-1">
                {platforms.slice(0, 6).map((p: string, i: number) => (
                  <span key={i} className="text-[9px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">{p}</span>
                ))}
                {platforms.length > 6 && (
                  <span className="text-[9px] text-zinc-500">+{platforms.length - 6}</span>
                )}
              </div>
            </div>
          )}
          
          {/* Account Types (Prop Firms) */}
          {type === 'prop' && uniqueAccountTypes.length > 0 && (
            <div>
              <div className="text-zinc-500 text-[9px] mb-1 flex items-center gap-1">
                <Layers size={10} /> Challenge Types
              </div>
              <div className="flex flex-wrap gap-1">
                {uniqueAccountTypes.map((t: string, i: number) => (
                  <span key={i} className="text-[9px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </div>
          )}
          
          {/* Assets (Prop Firms) */}
          {type === 'prop' && assets.length > 0 && (
            <div>
              <div className="text-zinc-500 text-[9px] mb-1 flex items-center gap-1">
                <Globe size={10} /> Tradable Assets
              </div>
              <div className="flex flex-wrap gap-1">
                {assets.slice(0, 4).map((a: string, i: number) => (
                  <span key={i} className="text-[9px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">{a.trim()}</span>
                ))}
                {assets.length > 4 && (
                  <span className="text-[9px] text-zinc-500">+{assets.length - 4}</span>
                )}
              </div>
            </div>
          )}

          {/* Offer/Promotion */}
          {hasOffer && (
            <div className="mt-2 p-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
              <div className="flex items-center gap-1.5">
                {type === 'broker' ? <Gift size={12} className="text-amber-400" /> : <Rocket size={12} className="text-orange-400" />}
                <span className="text-[8px] font-semibold text-amber-400 uppercase tracking-wider">
                  {type === 'broker' ? 'Limited Offer' : 'Promotion'}
                </span>
                {discountPercent && (
                  <span className="text-[8px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
              <p className="text-white text-xs font-medium">{offerText}</p>
            </div>
          )}
        </div>
        
        {/* Action Button */}
        <button
          onClick={onViewDetails}
          className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            type === 'prop' 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500'
          }`}
        >
          {type === 'prop' ? (
            <>View Challenge Options <ArrowRight size={14} /></>
          ) : (
            <>View Account Types <ArrowRight size={14} /></>
          )}
        </button>
      </div>
    </div>
  );
}

// ===================== FEATURED CARD WITH LOGO =====================
function FeaturedCard({ firm, type, onPress, trustScore, reviewCount }: { firm: any; type: 'broker' | 'prop'; onPress: () => void; trustScore: number; reviewCount: number }) {
  const isBroker = type === 'broker';
  const platforms = type === 'prop' ? getAllPlatforms(firm) : (firm.platforms || firm.platform || []);
  
  return (
    <div className="relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-xl blur opacity-75" />
      <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl overflow-hidden border border-purple-500/30">
        <div className="absolute top-2 right-2">
          <div className="bg-gradient-to-l from-purple-500 to-pink-500 text-white px-2 py-0.5 text-[8px] font-bold rounded-bl-lg flex items-center gap-1">
            <Crown size={8} />
            {isBroker ? 'FEATURED BROKER' : 'FEATURED PROP FIRM'}
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <FirmLogo firm={firm} size="lg" />
            <div>
              <h3 className="text-white font-bold text-base">{firm.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <StarRating rating={firm.rating || 0} count={reviewCount} />
                {trustScore > 0 && <TrustScoreBadge score={trustScore} size="sm" showLabel={true} />}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            {isBroker ? (
              <>
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="text-zinc-500 text-[10px]">Min Deposit</div>
                  <div className="text-white font-semibold text-sm">{formatCurrency(firm.minDeposit || 100)}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="text-zinc-500 text-[10px]">Leverage</div>
                  <div className="text-white font-semibold text-sm">{firm.leverage || '1:200'}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2 col-span-2">
                  <div className="text-zinc-500 text-[10px]">Platforms</div>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {platforms.slice(0, 3).map((p: string, i: number) => (
                      <span key={i} className="text-[8px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded">{p}</span>
                    ))}
                    {platforms.length > 3 && (
                      <span className="text-[8px] text-zinc-500">+{platforms.length - 3}</span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="text-zinc-500 text-[10px]">Max Payout</div>
                  <div className="text-white font-semibold text-sm">Up to {getMaxPayout(firm)}%</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="text-zinc-500 text-[10px]">Min Account</div>
                  <div className="text-white font-semibold text-sm">{formatCurrency(getMinAccountSize(firm))}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2 col-span-2">
                  <div className="text-zinc-500 text-[10px]">Programs</div>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {getAllProgramTypes(firm).slice(0, 3).map((p: string, i: number) => (
                      <span key={i} className="text-[8px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">{p}</span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          
          <button onClick={onPress} className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1">
            {isBroker ? 'View Account Types' : 'View Challenge Options'} <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Quick Action Card
function QuickActionCard({ icon: Icon, title, description, href, color }: any) {
  return (
    <Link href={href} className="flex-1">
      <div className={`bg-gradient-to-br ${color} rounded-xl p-3 text-center`}>
        <Icon size={20} className="text-white mx-auto mb-1" />
        <div className="text-white font-semibold text-xs">{title}</div>
        <div className="text-white/70 text-[10px]">{description}</div>
      </div>
    </Link>
  );
}

export default function MobileHome() {
  const router = useRouter();
  const { region } = useRegion(); // ✅ ADDED REGION
  const [brokers, setBrokers] = useState<any[]>([]);
  const [propFirms, setPropFirms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrichedBrokers, setEnrichedBrokers] = useState<any[]>([]);
  const [enrichedPropFirms, setEnrichedPropFirms] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<'prop' | 'broker'>('prop');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Get region info for display
  const regionInfo = REGION_DISPLAY[region] || REGION_DISPLAY['GLOBAL'];

  // Fetch data with region
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [brokersRes, propFirmsRes] = await Promise.all([
          api.getBrokers(region), // ✅ ADDED region
          api.getPropFirms(region) // ✅ ADDED region
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
  }, [region]); // ✅ ADDED region dependency

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

  // Filter firms by region availability
  const regionFilteredPropFirms = useMemo(() => {
    return enrichedPropFirms.filter(firm => isAvailableInRegion(firm, region));
  }, [enrichedPropFirms, region]);

  const regionFilteredBrokers = useMemo(() => {
    return enrichedBrokers.filter(firm => isAvailableInRegion(firm, region));
  }, [enrichedBrokers, region]);

  // Sort firms by trust score for ranking
  const sortedPropFirms = useMemo(() => {
    return [...regionFilteredPropFirms].sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0));
  }, [regionFilteredPropFirms]);

  const sortedBrokers = useMemo(() => {
    return [...regionFilteredBrokers].sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0));
  }, [regionFilteredBrokers]);

  // Get current sorted firms based on selected type
  const sortedCurrentFirms = selectedType === 'prop' ? sortedPropFirms : sortedBrokers;
  
  // Filter firms by search
  const filteredFirms = useMemo(() => {
    if (!searchTerm) return sortedCurrentFirms;
    return sortedCurrentFirms.filter(f => f.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [sortedCurrentFirms, searchTerm]);

  // Get featured firms (top rated by trust score)
  const featuredPropFirm = sortedPropFirms[0] || null;
  const featuredBroker = sortedBrokers[0] || null;

  // Pagination
  const totalPages = Math.ceil(filteredFirms.length / itemsPerPage);
  const paginatedFirms = filteredFirms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when type changes
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm('');
  }, [selectedType]);

  const totalReviews = [...enrichedBrokers, ...enrichedPropFirms].reduce((sum, f) => sum + (f.reviewCount || 0), 0);

  const handleNavigate = (id: number, name: string, type: 'broker' | 'prop') => {
    router.push(type === 'prop' ? `/prop-firms/${id}` : `/brokers/${id}`);
  };

  // Show empty state if no firms in region
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
              // Open region selector
              const regionSelector = document.querySelector('[data-region-selector]');
              if (regionSelector) {
                (regionSelector as HTMLElement).click();
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all text-sm"
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" />
            <p className="text-xs text-zinc-500 mt-3">Loading trading platforms...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="InsightPip" showSearch={false}>
      {/* ❌ REGION BANNER REMOVED - Users select region in navbar */}

      <div className="space-y-5 pb-6">
        
        {/* Hero Section - Stats */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-5 border border-purple-500/30">
          <h1 className="text-2xl font-bold text-white mb-2">Find Your Trusted <span className="text-purple-400">Trading Partner</span></h1>
          <p className="text-zinc-400 text-sm mb-4">Compare {brokers.length + propFirms.length}+ brokers and prop firms with real trader reviews.</p>
          <div className="flex gap-2">
            <div className="flex-1 bg-white/10 rounded-lg p-2 text-center">
              <div className="text-purple-400 font-bold text-lg">{propFirms.length}</div>
              <div className="text-zinc-400 text-[10px]">Prop Firms</div>
            </div>
            <div className="flex-1 bg-white/10 rounded-lg p-2 text-center">
              <div className="text-blue-400 font-bold text-lg">{brokers.length}</div>
              <div className="text-zinc-400 text-[10px]">Brokers</div>
            </div>
            <div className="flex-1 bg-white/10 rounded-lg p-2 text-center">
              <div className="text-yellow-400 font-bold text-lg">{totalReviews.toLocaleString()}</div>
              <div className="text-zinc-400 text-[10px]">Reviews</div>
            </div>
          </div>
          <div className="mt-3 text-center text-[10px] text-zinc-500 flex items-center justify-center gap-1">
            <Hash size={10} /> Ranked by Trust Score
          </div>
        </div>

        {/* Live Incident Feed */}
        <LiveIncidentFeed brokers={brokers} propFirms={propFirms} />

        {/* Quick Actions */}
        <div className="flex gap-3">
          <QuickActionCard 
            icon={MessageCircle} 
            title="Write a Review" 
            description="Share your experience" 
            href="/reviews"
            color="from-purple-600 to-pink-600"
          />
          <QuickActionCard 
            icon={AlertTriangle} 
            title="Report Incident" 
            description="Warn other traders" 
            href="/reviews?tab=incidents"
            color="from-red-600 to-orange-600"
          />
        </div>

        {/* Featured Sections */}
        {featuredPropFirm && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Gem size={14} className="text-purple-400" />
              <h2 className="text-white font-semibold text-sm">🏆 Top Ranked Prop Firm</h2>
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
              <Crown size={14} className="text-blue-400" />
              <h2 className="text-white font-semibold text-sm">🏆 Top Ranked Broker</h2>
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

        {/* Type Toggle with Ranking Info */}
        <div className="flex gap-2 bg-zinc-900/50 rounded-xl p-1 border border-zinc-800">
          <button
            onClick={() => setSelectedType('prop')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              selectedType === 'prop'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-zinc-400'
            }`}
          >
            🏢 Prop Firms ({sortedPropFirms.length})
          </button>
          <button
            onClick={() => setSelectedType('broker')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              selectedType === 'broker'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                : 'text-zinc-400'
            }`}
          >
            📈 Brokers ({sortedBrokers.length})
          </button>
        </div>

        {/* Search Bar */}
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
            className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-9 pr-4 py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Results Count */}
        {searchTerm && (
          <div className="text-xs text-zinc-500">
            Found {filteredFirms.length} result{filteredFirms.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Firms List - With Rankings and Logos */}
        {paginatedFirms.length > 0 ? (
          <div className="space-y-3">
            {paginatedFirms.map((firm, index) => {
              // Calculate global rank (based on filtered list position + page offset)
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
              className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-zinc-400 text-xs">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Footer Note */}
        <div className="text-center text-[10px] text-zinc-600 py-4">
          Data is community-reported and verified. Always do your own research.
        </div>
      </div>
    </MobileLayout>
  );
}