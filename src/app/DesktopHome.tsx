// src/app/DesktopHome.tsx - FULLY UPDATED WITH ALL FIXES

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useRegion } from '@/contexts/RegionContext';
import { 
  Star, Search, TrendingUp, Shield, Zap, 
  Building2, MessageCircle, AlertTriangle, CheckCircle,
  ArrowRight, Sparkles, Users, Eye, Filter, X,
  Clock, Award, Info, ChevronDown, BarChart3,
  DollarSign, Wallet, Gauge, Heart, BookOpen,
  RefreshCw, Flame, Crown, Gem, Gift, Percent, Rocket,
  Tag, ShieldCheck, HelpCircle, XCircle,
  Activity, Target, Smartphone, AlertCircle,
  TrendingDown, Trophy, Medal, Hash, Globe
} from 'lucide-react';
import { formatCurrency } from '@/utils/api-helpers';
import TrustScoreBadge from '@/components/ui/TrustScoreBadge';

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

const getAllAssets = (firm: any) => {
  if (typeof firm.assets === 'string') {
    return firm.assets.split(',').map((a: string) => a.trim());
  }
  return firm.assets || [];
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

// Trust score calculation
const calculateTrustStatsFromReviews = (reviews: any[]) => {
  if (!reviews || reviews.length === 0) {
    return {
      avgTrustScore: 0,
      totalReviews: 0,
      withdrawalSuccess: 0,
      executionQuality: 0,
      avgReliability: 0,
      recommendationRate: 0
    };
  }

  const avgTrustScore = reviews.reduce((sum, r) => sum + (r.trustScore || 0), 0) / reviews.length;
  
  const withdrawalSuccess = reviews
    .filter(r => r.withdrawalExperience)
    .reduce((sum, r) => sum + (r.withdrawalExperience || 0), 0) / 
    (reviews.filter(r => r.withdrawalExperience).length || 1);
  
  const executionQuality = reviews
    .filter(r => r.executionQuality)
    .reduce((sum, r) => sum + (r.executionQuality || 0), 0) / 
    (reviews.filter(r => r.executionQuality).length || 1);
  
  const avgReliability = reviews
    .filter(r => r.reliability)
    .reduce((sum, r) => sum + (r.reliability || 0), 0) / 
    (reviews.filter(r => r.reliability).length || 1);
  
  const recommendationRate = (reviews.filter(r => r.wouldRecommend === 'Yes').length / reviews.length) * 100;

  return {
    avgTrustScore,
    totalReviews: reviews.length,
    withdrawalSuccess,
    executionQuality,
    avgReliability,
    recommendationRate
  };
};

// Incident Types mapping
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
  { value: 'ACCOUNT_BANNED', label: 'Account Banned', icon: AlertCircle, color: 'text-red-400' },
  { value: 'SCAM_WARNING', label: 'Scam Warning', icon: AlertCircle, color: 'text-red-400' },
];

// Star Rating component
function StarRating({ rating, count = 0 }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.floor(rating) && count > 0 ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_2px_rgba(250,204,21,0.5)]' : 'text-zinc-700'}`} />
        ))}
      </div>
      {count > 0 && <span className="text-xs text-zinc-500">({count})</span>}
    </div>
  );
}

// Trust Score Tooltip
function TrustTooltip({ score }: { score: number }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <button onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} className="text-zinc-600 hover:text-zinc-400 transition-colors">
        <Info size={12} />
      </button>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 text-xs backdrop-blur-sm">
          <p className="text-white font-medium mb-1">Trust Score: {score}</p>
          <p className="text-zinc-500 text-xs">Based on withdrawal reliability, execution quality, and community feedback</p>
        </div>
      )}
    </div>
  );
}

// Quick Compare Button
function CompareButton({ selected, onCompare }: { selected: number[]; onCompare: () => void }) {
  if (selected.length === 0) return null;
  return (
    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <button onClick={onCompare} disabled={selected.length < 2} className={`px-5 py-2.5 rounded-full text-sm font-medium shadow-lg transition-all ${selected.length >= 2 ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-purple-500/50' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}>
        <Eye size={14} className="inline mr-2" />
        Compare ({selected.length})
      </button>
    </motion.div>
  );
}

// Incident Feed Component
function LiveIncidentFeed({ brokers, propFirms }: { brokers: any[]; propFirms: any[] }) {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await fetch('/api/incidents?limit=10');
        const data = await response.json();
        if (response.ok && data.incidents) {
          const enrichedIncidents = data.incidents.map((incident: any) => {
            let entityName = incident.entityName;
            if (!entityName && incident.entityType === 'broker') {
              const broker = brokers.find(b => b.id === incident.entityId);
              entityName = broker?.name || 'Unknown Broker';
            } else if (!entityName && incident.entityType === 'propFirm') {
              const propFirm = propFirms.find(p => p.id === incident.entityId);
              entityName = propFirm?.name || 'Unknown Prop Firm';
            }
            return { ...incident, entityName };
          });
          setIncidents(enrichedIncidents);
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
      setLastUpdated(new Date());
    }, 8000);
    return () => clearInterval(interval);
  }, [incidents.length]);

  if (loading || incidents.length === 0) {
    return (
      <div className="bg-gradient-to-r from-red-500/5 via-amber-500/5 to-purple-500/5 rounded-xl p-4 border border-red-500/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Live Incident Feed</span>
          </div>
        </div>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-xs text-zinc-500 mt-2">Loading incidents...</p>
        </div>
      </div>
    );
  }

  const current = incidents[currentIndex];
  const typeInfo = incidentTypes.find(t => t.value === current.incidentType);
  const IconComponent = typeInfo?.icon || AlertTriangle;
  const iconColor = typeInfo?.color || 'text-red-400';
  
  const isVerified = current.resolutionStatus === 'CONFIRMED' || current.confirmations >= 3;
  const isDisputed = current.resolutionStatus === 'DISPUTED';
  const isPending = current.resolutionStatus === 'PENDING' && !isVerified;

  return (
    <div className="bg-gradient-to-r from-red-500/5 via-amber-500/5 to-purple-500/5 rounded-xl p-4 border border-red-500/20 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute" />
            <div className="w-2 h-2 rounded-full bg-red-500 relative" />
          </div>
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Live Incident Feed</span>
          <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">LIVE</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
          <RefreshCw size={8} />
          <span>Updated {Math.floor((Date.now() - lastUpdated.getTime()) / 1000)}s ago</span>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
          <div className="flex items-center gap-3">
            <IconComponent size={14} className={iconColor} />
            <span className="text-white font-medium text-sm">{current.entityName || 'Unknown Firm'}</span>
            <span className="text-zinc-500 text-xs">reported</span>
          </div>
          <p className="text-zinc-300 text-sm">{current.title}</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-zinc-500 flex items-center gap-1">
              <Clock size={10} /> 
              {new Date(current.incidentDate || current.createdAt).toLocaleDateString()}
            </span>
            <span className="text-zinc-500 flex items-center gap-1">
              <Users size={10} /> {current.confirmations || 0} confirmations
            </span>
            {isVerified && (
              <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle size={8} /> Verified
              </span>
            )}
            {isDisputed && (
              <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle size={8} /> Disputed
              </span>
            )}
            {isPending && (
              <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <HelpCircle size={8} /> Awaiting Verification
              </span>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      
      <Link href="/reviews?tab=incidents" className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 mt-3 transition-colors">
        View all incidents <ArrowRight size={10} />
      </Link>
    </div>
  );
}

// Logo component with fallback
function FirmLogo({ firm, size = "md" }: { firm: any; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base"
  };
  
  if (firm.logo) {
    return (
      <div className={`${sizeClasses[size]} rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0`}>
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
              fallback.className = `${sizeClasses[size]} rounded-xl bg-gradient-to-r ${generateGradient(firm.name)} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`;
              fallback.textContent = firm.name?.charAt(0) || '?';
              parent.appendChild(fallback);
            }
          }}
        />
      </div>
    );
  }
  
  return (
    <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-r ${generateGradient(firm.name)} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`}>
      {firm.name?.charAt(0) || '?'}
    </div>
  );
}

// Featured Card Component
function FeaturedCard({ firm, type, onNavigate, trustScore, reviewCount }: { firm: any; type: 'broker' | 'prop'; onNavigate: (id: number, name: string, type: 'broker' | 'prop') => void; trustScore: number; reviewCount: number }) {
  const isBroker = type === 'broker';
  const hasOffer = isBroker 
    ? (firm.bonuses && firm.bonuses.length > 0) || (firm.promotions && firm.promotions.length > 0)
    : (firm.promotions && firm.promotions.length > 0);
  const offerText = isBroker
    ? firm.bonuses?.[0]?.amount || firm.promotions?.[0]?.name || "Special Offer"
    : firm.promotions?.[0]?.name || "Limited Time Offer";
  
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition duration-500" />
      <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl overflow-hidden border border-purple-500/30 group-hover:border-purple-500/50 transition-all duration-300">
        <div className="absolute top-0 right-0">
          <div className="bg-gradient-to-l from-purple-500 to-pink-500 text-white px-3 py-1 text-[10px] font-bold rounded-bl-xl flex items-center gap-1 shadow-lg">
            <Crown size={10} />
            {isBroker ? 'ELITE BROKER' : 'TOP PICK'}
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <FirmLogo firm={firm} size="lg" />
            <div>
              <h3 className="text-xl font-bold text-white">{firm.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={firm.rating || 0} count={reviewCount} />
                {trustScore > 0 && <TrustScoreBadge score={trustScore} size="sm" />}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            {isBroker ? (
              <>
                <div className="bg-white/5 p-2 rounded-lg">
                  <div className="text-zinc-500 text-xs">Min Deposit</div>
                  <div className="text-white font-semibold">{formatCurrency(firm.minDeposit || 100)}</div>
                </div>
                <div className="bg-white/5 p-2 rounded-lg">
                  <div className="text-zinc-500 text-xs">Leverage</div>
                  <div className="text-white font-semibold">{firm.leverage || '1:200'}</div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white/5 p-2 rounded-lg">
                  <div className="text-zinc-500 text-xs">Payout</div>
                  <div className="text-white font-semibold">Up to {getMaxPayout(firm)}%</div>
                </div>
                <div className="bg-white/5 p-2 rounded-lg">
                  <div className="text-zinc-500 text-xs">Min Account</div>
                  <div className="text-white font-semibold">{formatCurrency(getMinAccountSize(firm))}</div>
                </div>
              </>
            )}
          </div>

          {hasOffer && (
            <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
              <div className="flex items-center gap-2 mb-1">
                {isBroker ? <Gift size={14} className="text-amber-400" /> : <Rocket size={14} className="text-orange-400" />}
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  {isBroker ? 'Limited Time Offer' : 'Special Promotion'}
                </span>
              </div>
              <p className="text-white text-sm font-medium">{offerText}</p>
              {!isBroker && firm.promotions?.[0]?.discount && (
                <div className="mt-1 flex items-center gap-1">
                  <Percent size={10} className="text-green-400" />
                  <span className="text-[10px] text-green-400">{firm.promotions[0].discount}% discount</span>
                </div>
              )}
            </div>
          )}
          
          <button onClick={() => onNavigate(firm.id, firm.name, type)} className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium text-sm hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-lg hover:shadow-purple-500/25">
            {isBroker ? 'Claim Offer →' : 'Start Challenge →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Ranking number component with medal icons for top 3
function RankingNumber({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg shadow-yellow-500/30">
        <Trophy size={14} className="text-white" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full shadow-lg shadow-gray-400/30">
        <Medal size={14} className="text-white" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full shadow-lg shadow-amber-600/30">
        <Medal size={14} className="text-white" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800/80 text-zinc-400 font-mono text-xs border border-zinc-700/50">
      #{rank}
    </div>
  );
}

// Sort options
type SortOption = 'trustScore' | 'reviews' | 'rating' | 'payout' | 'accountSize';

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

export default function DesktopHome() {
  const router = useRouter();
  const { region } = useRegion();
  
  const [brokers, setBrokers] = useState<any[]>([]);
  const [propFirms, setPropFirms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [type, setType] = useState<'broker' | 'prop'>('prop');
  const [compareSelected, setCompareSelected] = useState<number[]>([]);
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [tableCurrentPage, setTableCurrentPage] = useState(1);
  const [tableItemsPerPage, setTableItemsPerPage] = useState(8);
  const [sortBy, setSortBy] = useState<SortOption>('trustScore');
  
  // Store enriched firms
  const [enrichedBrokers, setEnrichedBrokers] = useState<any[]>([]);
  const [enrichedPropFirms, setEnrichedPropFirms] = useState<any[]>([]);
  const [loadingEnriched, setLoadingEnriched] = useState(true);
  
  // Filter states
  const [minPayout, setMinPayout] = useState('');
  const [accountSize, setAccountSize] = useState('');
  const [maxAllocation, setMaxAllocation] = useState('');
  const [yearsInOperation, setYearsInOperation] = useState('');
  const [selectedFirmTypes, setSelectedFirmTypes] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedProgramTypes, setSelectedProgramTypes] = useState<string[]>([]);
  const [selectedRegulations, setSelectedRegulations] = useState<string[]>([]);
  const [minDeposit, setMinDeposit] = useState('');
  const [leverage, setLeverage] = useState('');
  const [bonusAvailable, setBonusAvailable] = useState(false);
  const [minTrustScore, setMinTrustScore] = useState('');
  const [minReviews, setMinReviews] = useState('');

  const searchRef = useRef<HTMLDivElement>(null);

  // Get region info for display
  const regionInfo = REGION_DISPLAY[region] || REGION_DISPLAY['GLOBAL'];

  // Fetch brokers and prop firms with region
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [brokersRes, propFirmsRes] = await Promise.all([
          fetch(`/api/brokers?region=${region}&limit=100`),
          fetch(`/api/prop-firms?region=${region}&limit=100`)
        ]);
        
        const brokersData = await brokersRes.json();
        const propFirmsData = await propFirmsRes.json();
        
        if (brokersData.success) {
          console.log('📊 Brokers loaded:', brokersData.data?.length || 0);
          console.log('📊 Brokers with promotions:', brokersData.data?.filter((b: any) => b.promotions?.length > 0 || b.bonuses?.length > 0).length || 0);
          setBrokers(brokersData.data || []);
        }
        if (propFirmsData.success) {
          console.log('📊 Prop firms loaded:', propFirmsData.data?.length || 0);
          console.log('📊 Prop firms with promotions:', propFirmsData.data?.filter((p: any) => p.promotions?.length > 0).length || 0);
          setPropFirms(propFirmsData.data || []);
        }
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [region]);

  // Enrich firms with reviews
  useEffect(() => {
    const enrichFirmsWithReviews = async () => {
      if (brokers.length === 0 && propFirms.length === 0) return;
      
      setLoadingEnriched(true);
      
      const enrichedBrokersList = await Promise.all(
        brokers.map(async (broker) => {
          try {
            const response = await fetch(`/api/reviews?brokerId=${broker.id}&status=APPROVED&limit=100`);
            const data = await response.json();
            if (response.ok && data.reviews) {
              const stats = calculateTrustStatsFromReviews(data.reviews);
              return { ...broker, trustScore: Math.round(stats.avgTrustScore), reviewCount: stats.totalReviews };
            }
          } catch (err) {
            console.error(`Failed to fetch reviews for broker ${broker.id}:`, err);
          }
          return { ...broker, trustScore: broker.avgTrustScore || 0, reviewCount: broker.reviewsCount || 0 };
        })
      );
      
      const enrichedPropFirmsList = await Promise.all(
        propFirms.map(async (propFirm) => {
          try {
            const response = await fetch(`/api/reviews?propFirmId=${propFirm.id}&status=APPROVED&limit=100`);
            const data = await response.json();
            if (response.ok && data.reviews) {
              const stats = calculateTrustStatsFromReviews(data.reviews);
              return { ...propFirm, trustScore: Math.round(stats.avgTrustScore), reviewCount: stats.totalReviews };
            }
          } catch (err) {
            console.error(`Failed to fetch reviews for prop firm ${propFirm.id}:`, err);
          }
          return { ...propFirm, trustScore: propFirm.avgTrustScore || 0, reviewCount: propFirm.totalReviews || 0 };
        })
      );
      
      setEnrichedBrokers(enrichedBrokersList);
      setEnrichedPropFirms(enrichedPropFirmsList);
      setLoadingEnriched(false);
    };
    
    enrichFirmsWithReviews();
  }, [brokers, propFirms]);

  const firms = type === 'prop' ? enrichedPropFirms : enrichedBrokers;
  
  // ✅ FIXED: Combined firms for search - ONLY shows region-available firms
  const allFirms = useMemo(() => {
    const isAvailableInRegion = (firm: any) => {
      // If firm has regions array (from API)
      if (firm.regions) {
        return firm.regions.includes(region) || 
               firm.regions.includes('GLOBAL') ||
               firm.regions.length === 0;
      }
      // If firm has single region field
      if (firm.region) {
        return firm.region === region || firm.region === 'GLOBAL';
      }
      // No region info - assume globally available
      return true;
    };

    const filteredBrokers = enrichedBrokers
      .filter(isAvailableInRegion)
      .map(f => ({ ...f, entityType: 'broker' as const }));
      
    const filteredPropFirms = enrichedPropFirms
      .filter(isAvailableInRegion)
      .map(f => ({ ...f, entityType: 'prop' as const }));
      
    return [...filteredBrokers, ...filteredPropFirms];
  }, [enrichedBrokers, enrichedPropFirms, region]);
  
  // Search - limit to 5 results
  useEffect(() => {
    if (searchTerm.trim()) {
      const results = allFirms.filter(f => f.name?.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5);
      setSearchResults(results);
      setShowSearchDropdown(true);
    } else {
      setShowSearchDropdown(false);
      setSearchResults([]);
    }
  }, [searchTerm, allFirms]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered and Sorted firms
  const filteredFirms = useMemo(() => {
    let result = firms.filter(firm => {
      const trustScore = firm.trustScore || 0;
      const reviewCount = firm.reviewCount || 0;
      
      if (type === 'prop') {
        const hasMatchingAccount = getAllAccountOptions(firm).some((account: any) => 
          (minPayout === '' || (account.payoutPercentage || account.payout) >= Number(minPayout)) &&
          (!accountSize || account.accountSize >= Number(accountSize)) &&
          (!maxAllocation || account.maxAllocation >= Number(maxAllocation))
        );
        const programTypesMatch = selectedProgramTypes.length === 0 || selectedProgramTypes.some(t => getAllProgramTypes(firm).includes(t));
        const platformsMatch = selectedPlatforms.length === 0 || selectedPlatforms.some(p => getAllPlatforms(firm).includes(p));
        const assetsMatch = selectedAssets.length === 0 || selectedAssets.some(a => getAllAssets(firm).map(ass => ass.toLowerCase()).includes(a.toLowerCase()));
        const yearsMatch = !yearsInOperation || firm.yearsInOperation >= Number(yearsInOperation);
        const trustMatch = !minTrustScore || trustScore >= Number(minTrustScore);
        const reviewsMatch = !minReviews || reviewCount >= Number(minReviews);
        return hasMatchingAccount && programTypesMatch && platformsMatch && assetsMatch && yearsMatch && trustMatch && reviewsMatch;
      } else {
        const depositMatch = minDeposit === '' || (firm.minDeposit >= Number(minDeposit));
        const leverageMatch = leverage === '' || String(firm.leverage) === String(leverage);
        const bonusMatch = !bonusAvailable || ((firm.bonuses && firm.bonuses.length > 0) || (firm.promotions && firm.promotions.length > 0));
        const platformsMatch = selectedPlatforms.length === 0 || selectedPlatforms.some(p => getAllPlatforms(firm).includes(p));
        const regulationMatch = selectedRegulations.length === 0 || (firm.regulation?.authorities?.some((a: string) => selectedRegulations.some(r => a.includes(r))));
        const trustMatch = !minTrustScore || trustScore >= Number(minTrustScore);
        const reviewsMatch = !minReviews || reviewCount >= Number(minReviews);
        return depositMatch && leverageMatch && bonusMatch && platformsMatch && regulationMatch && trustMatch && reviewsMatch;
      }
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'trustScore':
          return (b.trustScore || 0) - (a.trustScore || 0);
        case 'reviews':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'payout':
          if (type === 'prop') {
            return getMaxPayout(b) - getMaxPayout(a);
          }
          return 0;
        case 'accountSize':
          if (type === 'prop') {
            return getMinAccountSize(b) - getMinAccountSize(a);
          }
          return (b.minDeposit || 0) - (a.minDeposit || 0);
        default:
          return (b.trustScore || 0) - (a.trustScore || 0);
      }
    });

    return result;
  }, [firms, type, minPayout, accountSize, maxAllocation, yearsInOperation, selectedProgramTypes, selectedPlatforms, selectedAssets, minDeposit, leverage, bonusAvailable, selectedRegulations, minTrustScore, minReviews, sortBy]);
  
  // Pagination
  const totalItems = filteredFirms.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const page = Math.min(Math.max(1, currentPage), totalPages || 1);
  const paginatedFirms = filteredFirms.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  
  const tableTotalPages = Math.ceil(totalItems / tableItemsPerPage);
  const tablePage = Math.min(Math.max(1, tableCurrentPage), tableTotalPages || 1);
  const paginatedTableFirms = filteredFirms.slice((tablePage - 1) * tableItemsPerPage, tablePage * tableItemsPerPage);

  const totalReviews = [...enrichedBrokers, ...enrichedPropFirms].reduce((sum, firm) => sum + (firm.reviewCount || 0), 0);
  
  const [totalIncidents, setTotalIncidents] = useState(0);
  useEffect(() => {
    const fetchIncidentCount = async () => {
      try {
        const response = await fetch('/api/incidents?limit=1');
        const data = await response.json();
        if (response.ok && data.pagination) setTotalIncidents(data.pagination.total);
      } catch (err) {
        console.error('Failed to fetch incident count:', err);
      }
    };
    fetchIncidentCount();
  }, []);

  const handleNavigate = (id: number, name: string, type: 'broker' | 'prop') => {
    router.push(type === 'prop' ? `/prop-firms/${id}` : `/brokers/${id}`);
  };
  
  const handleSearchNavigate = (result: any) => {
    router.push(result.entityType === 'prop' ? `/prop-firms/${result.id}` : `/brokers/${result.id}`);
    setShowSearchDropdown(false);
    setSearchTerm('');
  };

  const toggleCompare = (id: number) => {
    setCompareSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id].slice(0, 3));
  };

  const handleCompare = () => {
    if (compareSelected.length >= 2) router.push(`/compare?ids=${compareSelected.join(',')}&type=${type}`);
  };

  const renderPlatformIcons = (platforms: string[]) => {
    const displayPlatforms = platforms.slice(0, 3);
    return (
      <div className="flex flex-wrap gap-1">
        {displayPlatforms.map((p, i) => {
          const shortName = platformIconMap[p] || p.slice(0, 3);
          const colorClass = getPlatformColor(p);
          return (
            <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded border ${colorClass}`}>
              {shortName}
            </span>
          );
        })}
        {platforms.length > 3 && (
          <span className="text-[10px] text-zinc-500">+{platforms.length - 3}</span>
        )}
        {platforms.length === 0 && (
          <span className="text-[10px] text-zinc-600">—</span>
        )}
      </div>
    );
  };

  const renderRegulationBadges = (firm: any) => {
    const regs = firm.regulation?.authorities || (typeof firm.regulation === 'string' ? [firm.regulation] : []);
    return regs.slice(0, 2).map((reg: string, i: number) => (
      <span key={i} className="text-[10px] bg-green-900/50 text-green-300 px-1.5 py-0.5 rounded">{reg.split(' ')[0]}</span>
    ));
  };

  if (loading || loadingEnriched) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-zinc-500">Loading trading partners...</p>
        </div>
      </div>
    );
  }

  // ✅ IMPROVED: Empty state with region suggestions
  if (brokers.length === 0 && propFirms.length === 0) {
    // Define nearby regions based on current region
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <Globe size={48} className="text-zinc-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            No trading partners in {regionInfo.flag} {regionInfo.label}
          </h2>
          <p className="text-zinc-400 mb-6">
            We're expanding our coverage! {regionInfo.flag} {regionInfo.label} doesn't have any brokers or prop firms yet.
          </p>
          
          {/* Suggestions */}
          <div className="bg-zinc-900/50 rounded-xl p-4 mb-6 border border-zinc-800">
            <p className="text-sm text-zinc-400 mb-3">Try these regions instead:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.key}
                  onClick={() => {
                    // Use the setRegion from context
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
          
          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                const { setRegion } = useRegion();
                setRegion('GLOBAL');
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
            >
              View All Global Partners
            </button>
            <button
              onClick={() => {
                // Find and trigger region selector
                const selector = document.querySelector('[data-region-selector]');
                if (selector) {
                  (selector as HTMLElement).click();
                }
              }}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              🔄 Change Region
            </button>
            <p className="text-xs text-zinc-600 mt-2">
              Can't find your region?{' '}
              <button 
                onClick={() => router.push('/suggest-firm')}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Suggest a firm →
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <CompareButton selected={compareSelected} onCompare={handleCompare} />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400 text-sm mb-6">
            <Sparkles size={14} /> Trusted by 10,000+ traders
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Find Your Perfect<br />Trading Partner
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
            Compare {brokers.length + propFirms.length} brokers and prop firms. Real reviews, verified payouts, and community-reported incidents.
          </motion.p>
          
          {/* Search with Dropdown */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="relative max-w-xl mx-auto" ref={searchRef}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Search for any broker or prop firm..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchTerm && setShowSearchDropdown(true)}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" 
            />
            
            <AnimatePresence>
              {showSearchDropdown && searchResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }} 
                  className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-[100] overflow-hidden"
                >
                  <div className="divide-y divide-zinc-800">
                    {searchResults.map((result) => (
                      <button 
                        key={`${result.entityType}-${result.id}`} 
                        onClick={() => handleSearchNavigate(result)} 
                        className="w-full px-4 py-3 text-left hover:bg-zinc-800 transition-all duration-150 flex items-center gap-3 group"
                      >
                        <FirmLogo firm={result} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-medium group-hover:text-purple-400 transition-colors">{result.name}</h3>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              result.entityType === 'prop' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {result.entityType === 'prop' ? 'Prop' : 'Broker'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                            {result.trustScore > 0 && (
                              <span className="flex items-center gap-1">
                                <Shield size={10} className="text-purple-400" />
                                <span>Trust {result.trustScore}</span>
                              </span>
                            )}
                            {result.reviewCount > 0 && (
                              <span className="flex items-center gap-1">
                                <Star size={10} className="text-yellow-400" />
                                <span>{result.reviewCount} reviews</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-zinc-500 group-hover:text-purple-400 transition-colors flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center gap-4 text-sm mt-8">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/20"><CheckCircle size={14} className="text-green-500" /><span className="text-zinc-300">92% payout success</span></div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-full border border-red-500/20"><AlertTriangle size={14} className="text-red-400" /><span className="text-zinc-300">{totalIncidents} reports this month</span></div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20"><Shield size={14} className="text-blue-400" /><span className="text-zinc-300">Verified reviews</span></div>
          </div>
        </div>
      </section>

      {/* Featured Cards Section - Only if both exist */}
      {enrichedPropFirms.length > 0 && enrichedBrokers.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Flame size={18} className="text-orange-500" />
            <h2 className="text-lg font-semibold text-white">🔥 Top Picks This Week</h2>
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">Sponsored</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <div className="absolute -top-3 left-4 z-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 border border-white/20">
                <Gem size={12} /> PROP FIRM
              </div>
              <FeaturedCard 
                firm={enrichedPropFirms[0]} 
                type="prop" 
                onNavigate={handleNavigate}
                trustScore={enrichedPropFirms[0].trustScore || 0}
                reviewCount={enrichedPropFirms[0].reviewCount || 0}
              />
            </div>
            <div className="relative">
              <div className="absolute -top-3 left-4 z-10 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 border border-white/20">
                <Crown size={12} /> BROKER
              </div>
              <FeaturedCard 
                firm={enrichedBrokers[0]} 
                type="broker" 
                onNavigate={handleNavigate}
                trustScore={enrichedBrokers[0].trustScore || 0}
                reviewCount={enrichedBrokers[0].reviewCount || 0}
              />
            </div>
          </div>
        </div>
      )}

      {/* Live Incident Feed */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <LiveIncidentFeed brokers={brokers} propFirms={propFirms} />
      </div>

      {/* Stats Bar with Ranking Info */}
      <div className="border-y border-zinc-800/50 bg-gradient-to-r from-zinc-900/30 via-transparent to-zinc-900/30">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-6">
              <span className="text-white font-medium">{brokers.length} brokers</span>
              <span className="text-white font-medium">{propFirms.length} prop firms</span>
              <span className="text-zinc-400">{totalReviews.toLocaleString()} reviews</span>
              <span className="text-zinc-500 flex items-center gap-1">
                <Hash size={12} />
                Ranked by Trust Score
              </span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setView('cards')} className={`px-3 py-1 rounded-lg text-sm transition-all ${view === 'cards' ? 'bg-purple-500/20 text-purple-400' : 'text-zinc-500 hover:text-zinc-300'}`}>Cards</button>
              <button onClick={() => setView('table')} className={`px-3 py-1 rounded-lg text-sm transition-all ${view === 'table' ? 'bg-purple-500/20 text-purple-400' : 'text-zinc-500 hover:text-zinc-300'}`}>Table</button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Type Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <button onClick={() => setType('prop')} className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-all ${type === 'prop' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'bg-zinc-800/50 text-zinc-400 hover:text-white'}`}>
              Prop Firms ({propFirms.length})
            </button>
            <button onClick={() => setType('broker')} className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-all ${type === 'broker' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'bg-zinc-800/50 text-zinc-400 hover:text-white'}`}>
              Brokers ({brokers.length})
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500">Sort by:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              <option value="trustScore">Trust Score</option>
              <option value="reviews">Most Reviews</option>
              <option value="rating">Rating</option>
              {type === 'prop' && (
                <>
                  <option value="payout">Highest Payout</option>
                  <option value="accountSize">Account Size</option>
                </>
              )}
              {type === 'broker' && (
                <option value="accountSize">Min Deposit</option>
              )}
            </select>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/50 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors">
              <Filter size={14} /> Filters
              {(minPayout || accountSize || minDeposit || leverage || minTrustScore) && <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />}
            </button>
            <span className="text-xs text-zinc-500">{filteredFirms.length} results</span>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {type === 'prop' ? (
                <>
                  <div><label className="text-xs text-zinc-500 block mb-1">Min Payout (%)</label><input type="number" placeholder="70" value={minPayout} onChange={(e) => setMinPayout(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm" /></div>
                  <div><label className="text-xs text-zinc-500 block mb-1">Min Account Size</label><input type="number" placeholder="$10,000" value={accountSize} onChange={(e) => setAccountSize(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm" /></div>
                  <div><label className="text-xs text-zinc-500 block mb-1">Min Trust Score</label><select value={minTrustScore} onChange={(e) => setMinTrustScore(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"><option value="">Any</option><option value="80">80+ (High)</option><option value="60">60+ (Medium)</option></select></div>
                  <div><label className="text-xs text-zinc-500 block mb-1">Program Type</label><select multiple className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm" value={selectedProgramTypes} onChange={(e) => setSelectedProgramTypes(Array.from(e.target.selectedOptions, o => o.value))}><option value="Instant Funding">Instant</option><option value="1-Step Evaluation">1-Step</option><option value="2-Step Evaluation">2-Step</option></select></div>
                </>
              ) : (
                <>
                  <div><label className="text-xs text-zinc-500 block mb-1">Min Deposit ($)</label><input type="number" placeholder="100" value={minDeposit} onChange={(e) => setMinDeposit(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm" /></div>
                  <div><label className="text-xs text-zinc-500 block mb-1">Leverage</label><select value={leverage} onChange={(e) => setLeverage(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"><option value="">Any</option><option value="1:100">1:100</option><option value="1:500">1:500</option></select></div>
                  <div><label className="text-xs text-zinc-500 block mb-1">Min Trust Score</label><select value={minTrustScore} onChange={(e) => setMinTrustScore(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"><option value="">Any</option><option value="80">80+ (High)</option><option value="60">60+ (Medium)</option></select></div>
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">Has Bonus/Offer</label>
                    <label className="flex items-center gap-2 mt-2">
                      <input type="checkbox" checked={bonusAvailable} onChange={(e) => setBonusAvailable(e.target.checked)} className="rounded border-zinc-700 bg-zinc-800" />
                      <span className="text-sm text-zinc-300">Show only firms with offers</span>
                    </label>
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end mt-4"><button onClick={() => { setMinPayout(''); setAccountSize(''); setMinDeposit(''); setLeverage(''); setMinTrustScore(''); setSelectedProgramTypes([]); setSelectedRegulations([]); setBonusAvailable(false); }} className="text-xs text-zinc-500 hover:text-white">Clear All</button></div>
          </motion.div>
        )}

        {/* Results - Cards View */}
        {filteredFirms.length === 0 ? (
          <div className="text-center py-16"><div className="w-12 h-12 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4"><Search size={20} className="text-zinc-500" /></div><p className="text-zinc-500">No results found. Try adjusting your filters.</p></div>
        ) : view === 'cards' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {paginatedFirms.map((firm, idx) => {
                const globalRank = (page - 1) * itemsPerPage + idx + 1;
                const trustScore = firm.trustScore || 0;
                const reviewCount = firm.reviewCount || 0;
                const isHighlight = globalRank <= 3;
                const hasOffer = type === 'broker' 
                  ? ((firm.bonuses && firm.bonuses.length > 0) || (firm.promotions && firm.promotions.length > 0))
                  : (firm.promotions && firm.promotions.length > 0);
                const offerText = type === 'broker'
                  ? (firm.bonuses?.[0]?.amount || firm.promotions?.[0]?.name || "Special Offer")
                  : (firm.promotions?.[0]?.name || "Limited Time");
                const discountPercent = type === 'prop' ? firm.promotions?.[0]?.discount : null;
                
                return (
                  <div key={firm.id} className={`group relative bg-zinc-900/50 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isHighlight ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/10' : 'border-zinc-800 hover:border-purple-500/30'}`}>
                    {/* Ranking Number */}
                    <div className="absolute top-3 left-3 z-10">
                      <RankingNumber rank={globalRank} />
                    </div>
                    
                    {/* Compare Checkbox */}
                    <div className="absolute top-3 right-3 z-10">
                      <input 
                        type="checkbox" 
                        checked={compareSelected.includes(firm.id)} 
                        onChange={() => toggleCompare(firm.id)} 
                        className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-800 focus:ring-purple-500 cursor-pointer" 
                      />
                    </div>

                    {/* Top Badges */}
                    {isHighlight && globalRank === 1 && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-lg flex items-center gap-1 z-20">
                        <Crown size={10} /> #1 Ranked
                      </div>
                    )}
                    {isHighlight && globalRank === 2 && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gray-300 to-gray-400 text-black text-[10px] font-bold px-3 py-0.5 rounded-full shadow-lg flex items-center gap-1 z-20">
                        <Medal size={10} /> #2 Ranked
                      </div>
                    )}
                    {isHighlight && globalRank === 3 && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-lg flex items-center gap-1 z-20">
                        <Medal size={10} /> #3 Ranked
                      </div>
                    )}
                    
                    <div className="p-5 pt-8">
                      <div className="flex items-start justify-between mb-3">
                        <FirmLogo firm={firm} size="md" />
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-white">{trustScore > 0 ? trustScore : '—'}</span>
                          {trustScore > 0 && <TrustTooltip score={trustScore} />}
                        </div>
                      </div>
                      <h3 className="font-semibold text-white mb-1">{firm.name}</h3>
                      <div className="flex items-center justify-between mb-4">
                        <StarRating rating={firm.rating || 0} count={reviewCount} />
                        {trustScore > 0 && <TrustScoreBadge score={trustScore} size="sm" showLabel={false} />}
                      </div>
                      <div className="space-y-2 text-sm mb-4">
                        {type === 'prop' ? (
                          <>
                            <div className="flex justify-between"><span className="text-zinc-500">Payout</span><span className="text-white font-medium">Up to {getMaxPayout(firm)}%</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500">Min account</span><span className="text-white">{formatCurrency(getMinAccountSize(firm))}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500">Platforms</span><div className="flex gap-1">{renderPlatformIcons(getAllPlatforms(firm))}</div></div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between"><span className="text-zinc-500">Min deposit</span><span className="text-white">{formatCurrency(firm.minDeposit || 0)}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500">Leverage</span><span className="text-white">{firm.leverage || '1:100'}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500">Regulation</span><div className="flex gap-1">{renderRegulationBadges(firm)}</div></div>
                          </>
                        )}
                      </div>
                      {hasOffer && (
                        <div className="mb-4 p-2.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
                          <div className="flex items-center gap-2 mb-1">
                            {type === 'broker' ? <Gift size={12} className="text-amber-400" /> : <Rocket size={12} className="text-orange-400" />}
                            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">{type === 'broker' ? 'Limited Offer' : 'Promotion'}</span>
                          </div>
                          <p className="text-white text-sm font-medium">{offerText}</p>
                          {discountPercent && (
                            <div className="mt-1 flex items-center gap-1">
                              <Percent size={10} className="text-green-400" />
                              <span className="text-[10px] text-green-400">{discountPercent}% discount</span>
                            </div>
                          )}
                        </div>
                      )}
                      <button onClick={() => handleNavigate(firm.id, firm.name, type)} className="w-full py-2 text-sm font-medium text-zinc-400 hover:text-white border-t border-zinc-800 pt-3 mt-1 transition-colors group-hover:text-purple-400">
                        View details →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1.5 text-sm text-zinc-500 disabled:opacity-50 hover:text-white">Prev</button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + Math.max(1, currentPage - 2)).filter(p => p <= totalPages).map(p => (
                  <button key={p} onClick={() => setCurrentPage(p)} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${p === currentPage ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'}`}>{p}</button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1.5 text-sm text-zinc-500 disabled:opacity-50 hover:text-white">Next</button>
              </div>
            )}
          </>
        ) : (
          // Table View
          <div className="mt-8">
            <div className="sticky top-[64px] z-30 bg-zinc-900 rounded-t-2xl border-t border-x border-zinc-800">
              <div className={`grid ${type === 'prop' ? 'grid-cols-[50px_180px_90px_90px_80px_120px_100px_100px_90px_90px]' : 'grid-cols-[50px_180px_90px_90px_100px_100px_100px_100px_90px_90px]'} w-full px-6 py-4 gap-3`}>
                <div className="text-left text-sm font-medium text-zinc-400">#</div>
                <div className="text-left text-sm font-medium text-zinc-300">Firm</div>
                <div className="text-left text-sm font-medium text-zinc-300">Rating</div>
                <div className="text-left text-sm font-medium text-zinc-300">Trust</div>
                <div className="text-left text-sm font-medium text-zinc-300">Country</div>
                <div className="text-left text-sm font-medium text-zinc-300">Platforms</div>
                {type === 'prop' ? (
                  <>
                    <div className="text-left text-sm font-medium text-zinc-300">Max Payout</div>
                    <div className="text-left text-sm font-medium text-zinc-300">Min Account</div>
                  </>
                ) : (
                  <>
                    <div className="text-left text-sm font-medium text-zinc-300">Min Deposit</div>
                    <div className="text-left text-sm font-medium text-zinc-300">Leverage</div>
                  </>
                )}
                <div className="text-left text-sm font-medium text-zinc-300">Offer</div>
                <div className="text-left text-sm font-medium text-zinc-300">Actions</div>
              </div>
            </div>
            <div className="rounded-b-2xl border-b border-x border-zinc-800">
              {paginatedTableFirms.map((firm, idx) => {
                const globalRank = (tablePage - 1) * tableItemsPerPage + idx + 1;
                const trustScore = firm.trustScore || 0;
                const reviewCount = firm.reviewCount || 0;
                const rating = firm.rating || 0;
                const maxPayout = type === 'prop' ? getMaxPayout(firm) : null;
                const minAccountSize = type === 'prop' ? getMinAccountSize(firm) : null;
                const minDepositVal = type === 'broker' ? firm.minDeposit : null;
                const leverageVal = type === 'broker' ? firm.leverage : null;
                const platforms = type === 'prop' ? getAllPlatforms(firm) : (firm.platforms || firm.platform || []);
                const hasOffer = type === 'broker' ? ((firm.bonuses && firm.bonuses.length > 0) || (firm.promotions && firm.promotions.length > 0)) : (firm.promotions && firm.promotions.length > 0);
                const primaryOffer = type === 'broker' ? (firm.bonuses?.[0] || firm.promotions?.[0]) : firm.promotions?.[0];
                const offerDiscount = primaryOffer?.discount;
                const offerAmount = primaryOffer?.amount;
                const offerCode = primaryOffer?.code;
                
                return (
                  <div key={firm.id} className={`grid ${type === 'prop' ? 'grid-cols-[50px_180px_90px_90px_80px_120px_100px_100px_90px_90px]' : 'grid-cols-[50px_180px_90px_90px_100px_100px_100px_100px_90px_90px]'} w-full px-6 py-4 gap-3 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800 last:border-0 cursor-pointer items-center`} onClick={() => handleNavigate(firm.id, firm.name, type)}>
                    <div className="flex items-center justify-center">
                      <RankingNumber rank={globalRank} />
                    </div>
                    <div className="flex items-center gap-3 min-w-0">
                      <FirmLogo firm={firm} size="sm" />
                      <div className="min-w-0">
                        <div className="font-medium text-white truncate">{firm.name}</div>
                        <div className="text-xs text-zinc-400 truncate">{firm.country || 'International'}</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1">{reviewCount > 0 ? <><span className="text-white font-medium">{rating.toFixed(1)}</span><span className="text-xs text-zinc-400">({reviewCount})</span></> : <span className="text-xs text-zinc-500">No reviews</span>}</div>
                      {reviewCount > 0 && rating > 0 && (<div className="flex items-center gap-0.5">{[...Array(5)].map((_, i) => (<Star key={i} size={10} className={i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'} />))}</div>)}
                    </div>
                    <div className="flex items-center gap-1"><Shield size={12} className="text-zinc-500" /><span className="text-white font-medium">{trustScore > 0 ? trustScore : '—'}</span></div>
                    <div className="text-white truncate text-sm">{firm.country || 'International'}</div>
                    <div className="flex flex-wrap gap-1">{renderPlatformIcons(platforms)}</div>
                    {type === 'prop' ? (
                      <>
                        <div className="text-white font-medium">{maxPayout}%</div>
                        <div className="text-white">{formatCurrency(minAccountSize)}</div>
                      </>
                    ) : (
                      <>
                        <div className="text-white">{formatCurrency(minDepositVal || 0)}</div>
                        <div className="text-white">{leverageVal || '1:100'}</div>
                      </>
                    )}
                    <div>{hasOffer ? (<div className="flex flex-col gap-1"><div className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-2 py-1 rounded-full border border-amber-500/30 w-fit">{offerDiscount ? (<><Percent size={10} className="text-green-400" /><span className="text-[10px] font-bold text-green-400">{offerDiscount}% OFF</span></>) : offerAmount ? (<><Gift size={10} className="text-purple-400" /><span className="text-[10px] font-bold text-purple-400">{offerAmount}</span></>) : (<><Tag size={10} className="text-amber-400" /><span className="text-[10px] font-medium text-amber-400">Offer</span></>)}</div>{offerCode && <code className="text-[9px] font-mono text-zinc-400 bg-zinc-800 px-1 py-0.5 rounded w-fit">{offerCode}</code>}</div>) : <span className="text-xs text-zinc-600">—</span>}</div>
                    <div><button onClick={(e) => { e.stopPropagation(); handleNavigate(firm.id, firm.name, type); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${type === 'prop' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-pink-500 hover:to-pink-400' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600'}`}>{type === 'prop' ? 'View' : 'Sign Up'}</button></div>
                  </div>
                );
              })}
              {paginatedTableFirms.length === 0 && (<div className="text-center py-12"><div className="w-12 h-12 mx-auto mb-3 bg-zinc-800/50 rounded-full flex items-center justify-center"><Search size={20} className="text-zinc-500" /></div><p className="text-zinc-500">No results found. Try adjusting your filters.</p></div>)}
            </div>
          </div>
        )}

        {/* Table Pagination */}
        {view === 'table' && tableTotalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-zinc-400">Showing {((tablePage - 1) * tableItemsPerPage) + 1} to {Math.min(tablePage * tableItemsPerPage, totalItems)} of {totalItems} firms</div>
            <div className="flex items-center gap-2">
              <button disabled={tableCurrentPage === 1} onClick={() => setTableCurrentPage((p) => Math.max(1, p - 1))} className="px-4 py-2 rounded-lg bg-zinc-800 text-white disabled:opacity-50 hover:bg-zinc-700">Prev</button>
              {Array.from({ length: Math.min(5, tableTotalPages) }, (_, i) => { let pageNum; if (tableTotalPages <= 5) pageNum = i + 1; else if (tableCurrentPage <= 3) pageNum = i + 1; else if (tableCurrentPage >= tableTotalPages - 2) pageNum = tableTotalPages - 4 + i; else pageNum = tableCurrentPage - 2 + i; return (<button key={pageNum} onClick={() => setTableCurrentPage(pageNum)} className={`px-3 py-1 rounded-lg text-sm ${pageNum === tableCurrentPage ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}>{pageNum}</button>); })}
              <button disabled={tableCurrentPage === tableTotalPages} onClick={() => setTableCurrentPage((p) => Math.min(tableTotalPages, p + 1))} className="px-4 py-2 rounded-lg bg-zinc-800 text-white disabled:opacity-50 hover:bg-zinc-700">Next</button>
            </div>
            <div className="flex items-center gap-2"><span className="text-sm text-zinc-400">Per page:</span><select className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1 text-sm text-white" value={tableItemsPerPage} onChange={(e) => { setTableItemsPerPage(Number(e.target.value)); setTableCurrentPage(1); }}><option value={8}>8</option><option value={10}>10</option><option value={15}>15</option><option value={20}>20</option><option value={25}>25</option></select></div>
          </div>
        )}
      </main>

      {/* Footer CTA */}
      <div className="border-t border-zinc-800/50 py-12 px-6 mt-8 bg-gradient-to-t from-zinc-900/30 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-zinc-500 text-sm mb-4">Help other traders make better decisions</p>
          <div className="flex gap-3 justify-center">
            <Link href="/reviews" className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all">Write a review</Link>
            <Link href="/reviews?tab=incidents" className="px-4 py-1.5 bg-zinc-800 text-zinc-300 text-sm rounded-lg hover:bg-zinc-700 transition-colors">Report incident</Link>
          </div>
          <p className="text-xs text-zinc-600 mt-4">Data is community-reported + verified</p>
        </div>
      </div>
    </div>
  );
}