// app/compare/page.tsx - COMPLETE UPDATED (Region Banner Removed)

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRegion } from '@/contexts/RegionContext';
import { 
  Search, X, Star, TrendingUp, Shield, Users, DollarSign, Target,
  Zap, BarChart3, Clock, Globe, Award, Sparkles, ArrowRight, ExternalLink,
  Scale, BadgeCheck, Check, Monitor, Wallet, Gift, Crown, Trophy, Medal,
  Eye, CheckCircle, Activity, ShieldCheck, Smartphone, Laptop, BookOpen,
  Building2, AlertTriangle, RefreshCw, Percent, Rocket, Tag, Info,
  Layers, GitCompare, PieChart, Layout, Grid3x3, Plus, Minus, Maximize2, Minimize2,
  ArrowLeft, Gauge, Coins, BookOpen as BookOpenIcon, Headphones, Rocket as RocketIcon,
  ChevronDown, ChevronUp, Building, Landmark, BadgeDollarSign, Heart
} from "lucide-react";
import { api } from '@/lib/api';
import { slugify } from '@/lib/slugify';
import { formatCurrency } from '@/utils/api-helpers';
import TrustScoreBadge from '@/components/ui/TrustScoreBadge';

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
function StarRating({ rating, count = 0, size = "sm" }: { rating: number; count?: number; size?: "sm" | "md" }) {
  const sizes = { sm: "w-4 h-4", md: "w-5 h-5" };
  const hasReviews = count > 0;
  const displayRating = hasReviews ? Math.min(5, Math.max(0, rating || 0)) : 0;
  const roundedRating = Math.round(displayRating);

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`${sizes[size]} ${
              i <= roundedRating && hasReviews
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-zinc-600'
            }`}
          />
        ))}
      </div>
      {hasReviews && (
        <>
          <span className="text-sm text-white ml-1">{displayRating.toFixed(1)}</span>
          <span className="text-xs text-zinc-400 ml-1">({count})</span>
        </>
      )}
    </div>
  );
}

const generateGradient = (name: string): string => {
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

// ===================== REVIEW STATS CALCULATION =====================
// This matches exactly what BrokerReviewsTab and PropFirmReviewsTab use

const calculateBrokerReviewStats = (reviews: any[]) => {
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

const calculatePropFirmReviewStats = (reviews: any[]) => {
  if (!reviews || reviews.length === 0) {
    return {
      avgTradingConditions: 0,
      avgCustomerCare: 0,
      avgUserFriendliness: 0,
      avgPayoutProcess: 0,
      avgRating: 0,
      trustScore: 0,
      reviewCount: 0
    };
  }
  
  let sumTrading = 0, sumCustomerCare = 0, sumUserFriendliness = 0, sumPayoutProcess = 0, sumRating = 0, sumTrust = 0;
  let hasTrading = false, hasCustomerCare = false, hasUserFriendliness = false, hasPayoutProcess = false;
  
  reviews.forEach(r => {
    sumRating += r.rating || 0;
    sumTrust += r.trustScore || 0;
    
    if (r.tradingConditions && r.tradingConditions > 0) {
      sumTrading += r.tradingConditions;
      hasTrading = true;
    }
    
    if (r.customerCare && r.customerCare > 0) {
      sumCustomerCare += r.customerCare;
      hasCustomerCare = true;
    }
    
    if (r.userFriendliness && r.userFriendliness > 0) {
      sumUserFriendliness += r.userFriendliness;
      hasUserFriendliness = true;
    }
    
    if (r.payoutProcess && r.payoutProcess > 0) {
      sumPayoutProcess += r.payoutProcess;
      hasPayoutProcess = true;
    }
  });
  
  const count = reviews.length;
  return {
    avgTradingConditions: hasTrading ? Number((sumTrading / count).toFixed(1)) : 0,
    avgCustomerCare: hasCustomerCare ? Number((sumCustomerCare / count).toFixed(1)) : 0,
    avgUserFriendliness: hasUserFriendliness ? Number((sumUserFriendliness / count).toFixed(1)) : 0,
    avgPayoutProcess: hasPayoutProcess ? Number((sumPayoutProcess / count).toFixed(1)) : 0,
    avgRating: Number((sumRating / count).toFixed(1)),
    trustScore: Math.round(sumTrust / count),
    reviewCount: count
  };
};

// ===================== HELPER FUNCTIONS =====================

const getPlatforms = (item: any) => {
  return item.platforms || item.platform || [];
};

const getRegulation = (item: any) => {
  if (item.type === 'broker') {
    return item.regulation?.authorities || (typeof item.regulation === 'string' ? [item.regulation] : []);
  }
  return [];
};

const getAllAccountOptions = (firm: any) => {
  if (!firm.programs) return [];
  return firm.programs.flatMap((program: any) => program.accountOptions || []);
};

const getMinAccountSize = (item: any) => {
  if (item.type === 'prop-firm') {
    const accountOptions = getAllAccountOptions(item);
    return accountOptions?.length > 0 ? Math.min(...accountOptions.map((acc: any) => acc.accountSize || 0)) : 0;
  }
  return item.minDeposit || 0;
};

const getMaxPayout = (item: any) => {
  if (item.type === 'prop-firm') {
    const accountOptions = getAllAccountOptions(item);
    if (accountOptions?.length > 0) {
      return Math.max(...accountOptions.map((acc: any) => {
        const payout = acc.payoutPercentage || acc.payout || 0;
        return typeof payout === 'string' ? parseInt(payout.replace('%', '')) : payout;
      }));
    }
    return 0;
  }
  return 0;
};

const getPayoutSpeed = (item: any): string => {
  if (item.type === 'prop-firm') {
    const frequency = item.payoutFrequency;
    if (frequency === 'daily') return 'Daily';
    if (frequency === 'weekly') return 'Weekly';
    if (frequency === 'bi-weekly') return 'Bi-Weekly';
    if (frequency === 'monthly') return 'Monthly';
    return frequency || 'N/A';
  }
  return 'N/A';
};

const getAccountOptionsWithPrice = (item: any) => {
  if (item.type === 'prop-firm') {
    const accountOptions = getAllAccountOptions(item);
    return accountOptions.map((acc: any) => ({
      size: acc.accountSize,
      price: acc.price,
      payout: acc.payoutPercentage || acc.payout,
      leverage: acc.leverage,
      maxAllocation: acc.maxAllocation,
      profitTarget: acc.profitTarget,
      maxDrawdown: acc.maxDrawdown,
      dailyDrawdown: acc.dailyDrawdown,
      minTradingDays: acc.minTradingDays
    }));
  }
  return [];
};

export default function ComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { region } = useRegion();
  const [brokersData, setBrokersData] = useState<any[]>([]);
  const [propFirmsData, setPropFirmsData] = useState<any[]>([]);
  const [enrichedBrokers, setEnrichedBrokers] = useState<any[]>([]);
  const [enrichedPropFirms, setEnrichedPropFirms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedType, setSelectedType] = useState<'brokers' | 'prop-firms'>('brokers');
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [expandedProgram, setExpandedProgram] = useState<number | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get region info for display
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

  // Enrich brokers with review stats
  useEffect(() => {
    const enrichBrokers = async () => {
      if (brokersData.length === 0) return;
      
      const enriched = await Promise.all(
        brokersData.map(async (broker) => {
          try {
            const response = await fetch(`/api/reviews?brokerId=${broker.id}&status=APPROVED&limit=100`);
            const data = await response.json();
            if (response.ok && data.reviews && data.reviews.length > 0) {
              const stats = calculateBrokerReviewStats(data.reviews);
              return { 
                ...broker, 
                ...stats,
                type: 'broker',
                // Keep original fields for display
                avgRating: stats.avgRating,
                reviewCount: stats.reviewCount,
                trustScore: stats.trustScore
              };
            }
          } catch (err) {
            console.error(`Error fetching reviews for broker ${broker.id}:`, err);
          }
          return { ...broker, type: 'broker', avgRating: broker.rating || 0, reviewCount: broker.reviewsCount || 0, trustScore: 0 };
        })
      );
      setEnrichedBrokers(enriched);
    };
    enrichBrokers();
  }, [brokersData]);

  // Enrich prop firms with review stats
  useEffect(() => {
    const enrichPropFirms = async () => {
      if (propFirmsData.length === 0) return;
      
      const enriched = await Promise.all(
        propFirmsData.map(async (firm) => {
          try {
            const response = await fetch(`/api/reviews?propFirmId=${firm.id}&status=APPROVED&limit=100`);
            const data = await response.json();
            if (response.ok && data.reviews && data.reviews.length > 0) {
              const stats = calculatePropFirmReviewStats(data.reviews);
              return { 
                ...firm, 
                ...stats,
                type: 'prop-firm',
                avgRating: stats.avgRating,
                reviewCount: stats.reviewCount,
                trustScore: stats.trustScore
              };
            }
          } catch (err) {
            console.error(`Error fetching reviews for prop firm ${firm.id}:`, err);
          }
          return { ...firm, type: 'prop-firm', avgRating: firm.rating || 0, reviewCount: firm.totalReviews || 0, trustScore: 0 };
        })
      );
      setEnrichedPropFirms(enriched);
    };
    enrichPropFirms();
  }, [propFirmsData]);

  // Load items from query after data is enriched
  useEffect(() => {
    if ((enrichedBrokers.length > 0 || enrichedPropFirms.length > 0) && !loading) {
      const idsParam = searchParams.get('ids');
      const typeParam = searchParams.get('type');
      
      if (idsParam) {
        const ids = idsParam.split(',').map(id => parseInt(id));
        let type = selectedType;
        
        if (typeParam === 'prop') {
          type = 'prop-firms';
          setSelectedType('prop-firms');
        } else if (typeParam === 'broker') {
          type = 'brokers';
          setSelectedType('brokers');
        }
        
        const currentData = type === 'prop-firms' ? enrichedPropFirms : enrichedBrokers;
        const items = currentData.filter(item => ids.includes(item.id));
        if (items.length > 0) {
          setSelectedItems(items);
        }
      }
    }
  }, [enrichedBrokers, enrichedPropFirms, loading, searchParams]);

  // Get current data based on selected type
  const currentData = selectedType === 'brokers' ? enrichedBrokers : enrichedPropFirms;
  const currentLabel = selectedType === 'brokers' ? 'Brokers' : 'Prop Firms';

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!search) return currentData;
    return currentData.filter(item => 
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      (item.country?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [currentData, search]);

  // Search suggestions
  useEffect(() => {
    if (search.length > 1) {
      const suggestions = filteredItems.slice(0, 5);
      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [search, filteredItems]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddItem = (item: any) => {
    if (!selectedItems.find((i) => i.id === item.id) && selectedItems.length < 4) {
      setSelectedItems([...selectedItems, item]);
      setSearch("");
      setShowSuggestions(false);
    }
  };

  const handleRemoveItem = (id: number) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== id));
  };

  const clearSearch = () => {
    setSearch("");
    setSearchSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  if (loading || (enrichedBrokers.length === 0 && enrichedPropFirms.length === 0)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-zinc-500">Loading comparison data...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no entities in region
  if (enrichedBrokers.length === 0 && enrichedPropFirms.length === 0) {
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
          <h2 className="text-2xl font-bold text-white mb-2">No trading partners in your region</h2>
          <p className="text-zinc-400 mb-4">
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
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all"
          >
            View All Global
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* ❌ REGION BANNER REMOVED - Users select region in navbar */}

      {/* Header */}
      <div className="border-b border-zinc-800/50 bg-gradient-to-r from-zinc-900/30 via-transparent to-zinc-900/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Link 
                  href="/"
                  className="p-2 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <ArrowLeft size={18} />
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                  <GitCompare className="text-purple-400" size={28} />
                  Compare {currentLabel}
                </h1>
              </div>
              <p className="text-zinc-400 text-sm mt-1 ml-10">Select up to 4 platforms to compare side by side</p>
            </div>
            
            {/* Type Toggle */}
            <div className="flex gap-2 bg-zinc-900/50 rounded-lg p-1">
              <button
                onClick={() => {
                  setSelectedType('brokers');
                  setSelectedItems([]);
                  setSearch('');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedType === 'brokers'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <TrendingUp size={14} className="inline mr-2" />
                Brokers ({enrichedBrokers.length})
              </button>
              <button
                onClick={() => {
                  setSelectedType('prop-firms');
                  setSelectedItems([]);
                  setSearch('');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedType === 'prop-firms'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Trophy size={14} className="inline mr-2" />
                Prop Firms ({enrichedPropFirms.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Add Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Plus size={16} className="text-purple-400" />
            </div>
            <h2 className="text-white font-semibold">Add {currentLabel} to Compare</h2>
            <span className="text-xs text-zinc-500">({selectedItems.length}/4 selected)</span>
          </div>
          
          <div className="relative" ref={searchRef}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              ref={inputRef}
              type="text"
              placeholder={`Search ${currentLabel.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => search.length > 1 && setShowSuggestions(true)}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
            {search && (
              <button onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                <X size={18} />
              </button>
            )}

            <AnimatePresence>
              {showSuggestions && searchSuggestions.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-20 overflow-hidden">
                  {searchSuggestions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleAddItem(item)}
                      disabled={selectedItems.length >= 4}
                      className="w-full px-4 py-3 text-left hover:bg-zinc-800 transition-colors flex items-center gap-3 border-b border-zinc-800 last:border-0 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FirmLogo firm={item} size="sm" />
                      <div className="flex-1">
                        <div className="text-white font-medium">{item.name}</div>
                        <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                          <span>{item.country || 'International'}</span>
                          <StarRating rating={item.rating || 0} count={item.reviewCount || 0} size="sm" />
                        </div>
                      </div>
                      <Plus size={16} className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {selectedItems.length >= 4 && (
            <p className="text-xs text-amber-500 mt-3">Maximum 4 platforms can be compared at once</p>
          )}
        </div>
      </div>

      {/* Selected Items - with Logos */}
      {selectedItems.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedItems.map((item, index) => {
              const trustScore = item.trustScore || 0;
              const rating = item.rating || 0;
              const reviewsCount = item.reviewCount || 0;
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-purple-500/50 transition-all duration-300 group"
                  onMouseEnter={() => setHoveredCard(item.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <FirmLogo firm={item} size="md" />
                        <div>
                          <h3 className="font-semibold text-white text-sm">{item.name}</h3>
                          <div className="flex items-center gap-1 mt-0.5">
                            <StarRating rating={rating} count={reviewsCount} size="sm" />
                            <div className="flex items-center gap-0.5 ml-1">
                              <Shield size={10} className="text-zinc-500" />
                              <span className="text-[10px] text-zinc-500">{trustScore}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className={`p-1 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600/20 transition-colors ${hoveredCard === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                      >
                        <X size={12} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="bg-zinc-800/30 rounded-lg p-2 text-center">
                        <div className="text-zinc-500 text-[10px] uppercase">Min {selectedType === 'brokers' ? 'Deposit' : 'Account'}</div>
                        <div className="text-white font-bold text-sm">${getMinAccountSize(item).toLocaleString()}</div>
                      </div>
                      {selectedType === 'prop-firms' ? (
                        <div className="bg-zinc-800/30 rounded-lg p-2 text-center">
                          <div className="text-zinc-500 text-[10px] uppercase">Max Payout</div>
                          <div className="text-green-400 font-bold text-sm">{getMaxPayout(item)}%</div>
                        </div>
                      ) : (
                        <div className="bg-zinc-800/30 rounded-lg p-2 text-center">
                          <div className="text-zinc-500 text-[10px] uppercase">Leverage</div>
                          <div className="text-white font-bold text-sm">{item.leverage || '1:100'}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/${selectedType === 'brokers' ? 'brokers' : 'prop-firms'}/${slugify(item.name)}`)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
                      >
                        <Eye size={10} className="inline mr-1" /> Details
                      </button>
                      <button
                        onClick={() => window.open(item.website || item.signupLink, '_blank')}
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 transition-all"
                      >
                        <ExternalLink size={10} className="inline mr-1" /> Visit
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Comparison Table - USING ENRICHED DATA */}
      {selectedItems.length >= 2 && (
        <div className="max-w-7xl mx-auto px-6 pb-16">
          <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 bg-zinc-800/30">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <BarChart3 size={16} className="text-purple-400" />
                {selectedType === 'prop-firms' ? 'Prop Firm Comparison' : 'Broker Comparison'}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-800/20">
                    <th className="p-4 text-left text-zinc-400 font-medium w-48">Feature</th>
                    {selectedItems.map((item) => (
                      <th key={item.id} className="p-4 text-center min-w-[180px]">
                        <div className="flex flex-col items-center">
                          <FirmLogo firm={item} size="sm" />
                          <span className="text-sm font-medium text-white mt-1">{item.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  
                  {/* ============ BROKERS COMPARISON FIELDS ============ */}
                  {selectedType === 'brokers' && (
                    <>
                      {/* Rating */}
                      <tr className="hover:bg-zinc-800/20 transition-colors">
                        <td className="p-4 text-zinc-400 font-medium flex items-center gap-2">
                          <Star size={14} className="text-yellow-500" />
                          Rating
                        </td>
                        {selectedItems.map((item) => (
                          <td key={`rating-${item.id}`} className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-white font-medium">{item.avgRating?.toFixed(1) || '0.0'}</span>
                              <span className="text-xs text-zinc-500">({item.reviewCount || 0})</span>
                            </div>
                          </td>
                        ))}
                      </tr>
                      
                      {/* Trust Score */}
                      <tr className="hover:bg-zinc-800/20 transition-colors">
                        <td className="p-4 text-zinc-400 font-medium flex items-center gap-2">
                          <Shield size={14} className="text-purple-500" />
                          Trust Score
                        </td>
                        {selectedItems.map((item) => (
                          <td key={`trust-${item.id}`} className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-white font-medium">{item.trustScore || 0}</span>
                              <TrustScoreBadge score={item.trustScore || 0} size="sm" showLabel={false} />
                            </div>
                          </td>
                        ))}
                      </tr>
                      
                      {/* Trading Conditions */}
                      <tr className="hover:bg-zinc-800/20 transition-colors">
                        <td className="p-4 text-zinc-400 font-medium flex items-center gap-2">
                          <Activity size={14} className="text-orange-500" />
                          Trading Conditions
                        </td>
                        {selectedItems.map((item) => (
                          <td key={`trading-${item.id}`} className="p-4 text-center">
                            <span className="text-white font-medium">{item.avgTradingConditions?.toFixed(1) || '0.0'}/5</span>
                          </td>
                        ))}
                      </tr>
                      
                      {/* Platform Stability */}
                      <tr className="hover:bg-zinc-800/20 transition-colors">
                        <td className="p-4 text-zinc-400 font-medium flex items-center gap-2">
                          <Monitor size={14} className="text-blue-500" />
                          Platform Stability
                        </td>
                        {selectedItems.map((item) => (
                          <td key={`platform-${item.id}`} className="p-4 text-center">
                            <span className="text-white font-medium">{item.avgPlatformStability?.toFixed(1) || '0.0'}/5</span>
                          </td>
                        ))}
                      </tr>
                      
                      {/* Customer Support */}
                      <tr className="hover:bg-zinc-800/20 transition-colors">
                        <td className="p-4 text-zinc-400 font-medium flex items-center gap-2">
                          <Headphones size={14} className="text-purple-500" />
                          Customer Support
                        </td>
                        {selectedItems.map((item) => (
                          <td key={`support-${item.id}`} className="p-4 text-center">
                            <span className="text-white font-medium">{item.avgCustomerSupport?.toFixed(1) || '0.0'}/5</span>
                          </td>
                        ))}
                      </tr>
                      
                      {/* Withdrawal Speed */}
                      <tr className="hover:bg-zinc-800/20 transition-colors">
                        <td className="p-4 text-zinc-400 font-medium flex items-center gap-2">
                          <Zap size={14} className="text-green-500" />
                          Withdrawal Speed
                        </td>
                        {selectedItems.map((item) => (
                          <td key={`withdrawal-${item.id}`} className="p-4 text-center">
                            <span className="text-white font-medium">{item.avgWithdrawalSpeed?.toFixed(1) || '0.0'}/5</span>
                          </td>
                        ))}
                      </tr>
                      
                      {/* Minimum Deposit */}
                      <tr className="hover:bg-zinc-800/20 transition-colors">
                        <td className="p-4 text-zinc-400 font-medium flex items-center gap-2">
                          <DollarSign size={14} className="text-emerald-500" />
                          Min Deposit
                        </td>
                        {selectedItems.map((item) => (
                          <td key={`min-deposit-${item.id}`} className="p-4 text-center">
                            <span className="text-white font-bold">${getMinAccountSize(item).toLocaleString()}</span>
                          </td>
                        ))}
                      </tr>
                      
                      {/* Max Leverage */}
                      <tr className="hover:bg-zinc-800/20 transition-colors">
                        <td className="p-4 text-zinc-400 font-medium flex items-center gap-2">
                          <Gauge size={14} className="text-blue-500" />
                          Max Leverage
                        </td>
                        {selectedItems.map((item) => (
                          <td key={`leverage-${item.id}`} className="p-4 text-center">
                            <span className="text-white font-bold">{item.leverage || '1:100'}</span>
                          </td>
                        ))}
                      </tr>
                      
                      {/* Platforms */}
                      <tr className="hover:bg-zinc-800/20 transition-colors">
                        <td className="p-4 text-zinc-400 font-medium flex items-center gap-2">
                          <Layers size={14} className="text-cyan-500" />
                          Platforms
                        </td>
                        {selectedItems.map((item) => (
                          <td key={`platforms-${item.id}`} className="p-4 text-center">
                            <div className="flex flex-wrap gap-1 justify-center">
                              {getPlatforms(item).slice(0, 3).map((p: string, idx: number) => (
                                <span key={idx} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">{p}</span>
                              ))}
                              {getPlatforms(item).length > 3 && (
                                <span className="text-[10px] text-zinc-500">+{getPlatforms(item).length - 3}</span>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                      
                      {/* Regulation */}
                      <tr className="hover:bg-zinc-800/20 transition-colors">
                        <td className="p-4 text-zinc-400 font-medium flex items-center gap-2">
                          <ShieldCheck size={14} className="text-green-500" />
                          Regulation
                        </td>
                        {selectedItems.map((item) => (
                          <td key={`regulation-${item.id}`} className="p-4 text-center">
                            <div className="flex flex-wrap gap-1 justify-center">
                              {getRegulation(item).slice(0, 2).map((reg: string, idx: number) => (
                                <span key={idx} className="text-[10px] bg-green-900/50 text-green-300 px-2 py-0.5 rounded">{reg}</span>
                              ))}
                              {getRegulation(item).length > 2 && (
                                <span className="text-[10px] text-zinc-500">+{getRegulation(item).length - 2}</span>
                              )}
                              {getRegulation(item).length === 0 && (
                                <span className="text-[10px] text-zinc-500">N/A</span>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                      
                      {/* Country */}
                      <tr className="hover:bg-zinc-800/20 transition-colors">
                        <td className="p-4 text-zinc-400 font-medium flex items-center gap-2">
                          <Globe size={14} className="text-blue-400" />
                          Country
                        </td>
                        {selectedItems.map((item) => (
                          <td key={`country-${item.id}`} className="p-4 text-center">
                            <span className="text-white">{item.country || 'International'}</span>
                          </td>
                        ))}
                      </tr>
                    </>
                  )}

                  {/* ============ PROP FIRMS COMPARISON FIELDS ============ */}
                  {selectedType === 'prop-firms' && (
                    <>
                      {/* Rating */}
                      <tr className="hover:bg-zinc-800/20 transition-colors">
                        <td className="p-4 text-zinc-400 font-medium flex items-center gap-2">
                          <Star size={14} className="text-yellow-500" />
                          Rating
                        </td>
                        {selectedItems.map((item) => (
                          <td key={`rating-${item.id}`} className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-white font-medium">{item.avgRating?.toFixed(1) || '0.0'}</span>
                              <span className="text-xs text-zinc-500">({item.reviewCount || 0})</span>
                            </div>
                          </td>
                        ))}
                      </tr>
                      
                      {/* Trust Score */}
                      <tr className="hover:bg-zinc-800/20 transition-colors">
                        <td className="p-4 text-zinc-400 font-medium flex items-center gap-2">
                          <Shield size={14} className="text-purple-500" />
                          Trust Score
                        </td>
                        {selectedItems.map((item) => (
                          <td key={`trust-${item.id}`} className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-white font-medium">{item.trustScore || 0}</span>
                              <TrustScoreBadge score={item.trustScore || 0} size="sm" showLabel={false} />
                            </div>
                          </td>
                        ))}
                      </tr>
                      
                      {/* Trading Conditions */}
                      <tr className="hover:bg-zinc-800/20 transition-colors">
                        <td className="p-4 text-zinc-400 font-medium flex items-center gap-2">
                          <Activity size={14} className="text-orange-500" />
                          Trading Conditions
                        </td>
                        {selectedItems.map((item) => (
                          <td key={`trading-${item.id}`} className="p-4 text-center">
                            <span className="text-white font-medium">{item.avgTradingConditions?.toFixed(1) || '0.0'}/5</span>
                          </td>
                        ))}
                      </tr>
                      
                      {/* Customer Care */}
                      <tr className="hover:bg-zinc-800/20 transition-colors">
                        <td className="p-4 text-zinc-400 font-medium flex items-center gap-2">
                          <Headphones size={14} className="text-purple-500" />
                          Customer Care
                        </td>
                        {selectedItems.map((item) => (
                          <td key={`support-${item.id}`} className="p-4 text-center">
                            <span className="text-white font-medium">{item.avgCustomerCare?.toFixed(1) || '0.0'}/5</span>
                          </td>
                        ))}
                      </tr>
                      
                      {/* Max Payout */}
                      <tr className="hover:bg-zinc-800/20 transition-colors">
                        <td className="p-4 text-zinc-400 font-medium flex items-center gap-2">
                          <Percent size={14} className="text-green-500" />
                          Max Payout
                        </td>
                        {selectedItems.map((item) => (
                          <td key={`payout-${item.id}`} className="p-4 text-center">
                            <span className="text-white font-bold">{getMaxPayout(item)}%</span>
                          </td>
                        ))}
                      </tr>
                      
                      {/* Payout Speed */}
                      <tr className="hover:bg-zinc-800/20 transition-colors">
                        <td className="p-4 text-zinc-400 font-medium flex items-center gap-2">
                          <Clock size={14} className="text-cyan-500" />
                          Payout Speed
                        </td>
                        {selectedItems.map((item) => (
                          <td key={`payout-speed-${item.id}`} className="p-4 text-center">
                            <span className="text-white">{getPayoutSpeed(item)}</span>
                          </td>
                        ))}
                      </tr>
                      
                      {/* Platforms */}
                      <tr className="hover:bg-zinc-800/20 transition-colors">
                        <td className="p-4 text-zinc-400 font-medium flex items-center gap-2">
                          <Layers size={14} className="text-cyan-500" />
                          Platforms
                        </td>
                        {selectedItems.map((item) => (
                          <td key={`platforms-${item.id}`} className="p-4 text-center">
                            <div className="flex flex-wrap gap-1 justify-center">
                              {getPlatforms(item).slice(0, 3).map((p: string, idx: number) => (
                                <span key={idx} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">{p}</span>
                              ))}
                              {getPlatforms(item).length > 3 && (
                                <span className="text-[10px] text-zinc-500">+{getPlatforms(item).length - 3}</span>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                      
                      {/* Account Options */}
                      <tr className="hover:bg-zinc-800/20 transition-colors">
                        <td className="p-4 text-zinc-400 font-medium flex items-center gap-2">
                          <Wallet size={14} className="text-emerald-500" />
                          Account Options
                        </td>
                        {selectedItems.map((item) => {
                          const accountOptions = getAccountOptionsWithPrice(item);
                          const showMore = expandedProgram === item.id;
                          const displayOptions = showMore ? accountOptions : accountOptions.slice(0, 2);
                          return (
                            <td key={`costs-${item.id}`} className="p-4">
                              <div className="space-y-2">
                                {displayOptions.map((acc, idx) => (
                                  <div key={idx} className="bg-zinc-800/30 rounded-lg p-2 text-center">
                                    <div className="text-white font-bold text-sm">${acc.size.toLocaleString()}</div>
                                    <div className="text-green-400 text-xs">${acc.price.toLocaleString()}</div>
                                    <div className="text-zinc-500 text-[10px]">{acc.payout}%</div>
                                  </div>
                                ))}
                                {accountOptions.length > 2 && (
                                  <button
                                    onClick={() => setExpandedProgram(expandedProgram === item.id ? null : item.id)}
                                    className="text-xs text-purple-400 hover:text-purple-300 w-full text-center py-1"
                                  >
                                    {showMore ? 'Show less' : `+${accountOptions.length - 2} more`}
                                  </button>
                                )}
                                {accountOptions.length === 0 && (
                                  <span className="text-zinc-500 text-xs">N/A</span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                      
                      {/* Min Account */}
                      <tr className="hover:bg-zinc-800/20 transition-colors">
                        <td className="p-4 text-zinc-400 font-medium flex items-center gap-2">
                          <BadgeDollarSign size={14} className="text-blue-500" />
                          Min Account
                        </td>
                        {selectedItems.map((item) => (
                          <td key={`min-account-${item.id}`} className="p-4 text-center">
                            <span className="text-white font-bold">${getMinAccountSize(item).toLocaleString()}</span>
                          </td>
                        ))}
                      </tr>
                      
                      {/* Country */}
                      <tr className="hover:bg-zinc-800/20 transition-colors">
                        <td className="p-4 text-zinc-400 font-medium flex items-center gap-2">
                          <Globe size={14} className="text-blue-400" />
                          Country
                        </td>
                        {selectedItems.map((item) => (
                          <td key={`country-${item.id}`} className="p-4 text-center">
                            <span className="text-white">{item.country || 'International'}</span>
                          </td>
                        ))}
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Quick Insights */}
          {selectedItems.length >= 2 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl border border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Award className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-zinc-400">Quick Insights</p>
                  <p className="text-sm text-white">
                    {(() => {
                      const highestRated = [...selectedItems].sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))[0];
                      const bestSupport = [...selectedItems].sort((a, b) => 
                        (selectedType === 'brokers' ? (b.avgCustomerSupport || 0) : (b.avgCustomerCare || 0)) - 
                        (selectedType === 'brokers' ? (a.avgCustomerSupport || 0) : (a.avgCustomerCare || 0))
                      )[0];
                      const lowestMin = [...selectedItems].sort((a, b) => getMinAccountSize(a) - getMinAccountSize(b))[0];
                      return `${highestRated?.name} has the highest rating. ${bestSupport?.name} has the best support. ${lowestMin?.name} has the lowest minimum ${selectedType === 'brokers' ? 'deposit' : 'account size'}.`;
                    })()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {selectedItems.length === 0 && (
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
              <GitCompare className="w-10 h-10 text-zinc-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Platforms Selected</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Search and select up to 4 {selectedType === 'brokers' ? 'brokers' : 'prop firms'} to compare their features side by side.
            </p>
            <div className="grid grid-cols-3 gap-4 text-xs text-zinc-500">
              <div>1. Search</div>
              <div>2. Select platforms</div>
              <div>3. Compare features</div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-zinc-800/50 py-6 px-6 mt-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs text-zinc-600">Data is community-reported and verified. Compare up to 4 platforms side by side.</p>
        </div>
      </div>
    </div>
  );
}