// app/compare/MobileCompare.tsx - COMPLETE WITH REGION AWARENESS

'use client';

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRegion } from "@/contexts/RegionContext";
import { 
  Search, X, Star, TrendingUp, Shield, Users, DollarSign, Target,
  Zap, BarChart3, Clock, Globe, Award, Sparkles, ArrowRight, ExternalLink,
  Scale, BadgeCheck, Check, Monitor, Wallet, Gift, Crown, Trophy, Medal,
  Eye, CheckCircle, Activity, ShieldCheck, Smartphone, Laptop, BookOpen,
  Building2, AlertTriangle, RefreshCw, Percent, Rocket, Share,Tag, Info,
  Layers, GitCompare, PieChart, Layout, Grid3x3, Plus, Minus, Maximize2, Minimize2,
  ArrowLeft, Gauge, Coins, Headphones, BookOpen as BookOpenIcon
} from "lucide-react";
import { api } from "@/lib/api";
import { slugify } from "@/lib/slugify";
import { formatCurrency } from "@/utils/api-helpers";
import TrustScoreBadge from "@/components/ui/TrustScoreBadge";
import MobileLayout from "@/components/mobile/MobileLayout";

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

// ============ LOGO COMPONENT - SAME AS DETAIL PAGE ============
function FirmLogo({ item, size = "md" }: { item: any; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-10 h-10 rounded-xl text-sm",
    md: "w-12 h-12 rounded-xl text-base",
    lg: "w-14 h-14 rounded-xl text-lg"
  };
  
  if (item.logo) {
    return (
      <div className={`${sizeClasses[size]} overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0 shadow-lg`}>
        <img 
          src={item.logo} 
          alt={item.name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const fallback = document.createElement('div');
              fallback.className = `${sizeClasses[size]} bg-gradient-to-r ${generateGradient(item.name)} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`;
              fallback.textContent = item.name?.charAt(0) || '?';
              parent.appendChild(fallback);
            }
          }}
        />
      </div>
    );
  }
  
  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-r ${generateGradient(item.name)} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`}>
      {item.name?.charAt(0) || '?'}
    </div>
  );
}

// ============ STAR RATING COMPONENT ============
function StarRating({ rating, count = 0, size = "sm" }: { rating: number; count?: number; size?: "sm" | "md" }) {
  const sizes = { sm: "w-3.5 h-3.5", md: "w-4 h-4" };
  const hasReviews = count > 0;
  const displayRating = hasReviews ? Math.min(5, Math.max(0, rating || 0)) : 0;
  const roundedRating = Math.round(displayRating);

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`${sizes[size]} ${i <= roundedRating && hasReviews ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}`} />
        ))}
      </div>
      {hasReviews && (
        <>
          <span className="text-xs text-white ml-0.5">{displayRating.toFixed(1)}</span>
          <span className="text-[10px] text-zinc-500 ml-0.5">({count})</span>
        </>
      )}
    </div>
  );
}

// ============ GRADIENT GENERATOR ============
const generateGradient = (name: string): string => {
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

// ============ HELPER FUNCTIONS ============
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

const getPlatforms = (item: any) => {
  return item.platforms || item.platform || [];
};

const getAllAccountOptionsWithPrice = (item: any) => {
  if (item.type === 'prop-firm') {
    const accountOptions = getAllAccountOptions(item);
    return accountOptions.map((acc: any) => ({
      size: acc.accountSize,
      price: acc.price,
      payout: acc.payoutPercentage || acc.payout,
      leverage: acc.leverage,
      maxAllocation: acc.maxAllocation
    }));
  }
  return [];
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

const getWithdrawalSpeedRating = (item: any): number => {
  if (item.type === 'broker') {
    return item.avgWithdrawalExperience || 0;
  }
  return 0;
};

const getSupportScore = (item: any): number => {
  if (item.type === 'prop-firm') {
    return item.avgCustomerCare || item.customerCare || 0;
  }
  return item.avgSupportRating || 0;
};

const getTradingConditions = (item: any): number => {
  if (item.type === 'prop-firm') {
    return item.avgTradingConditions || item.tradingConditions || 0;
  }
  return item.avgServiceRating || 0;
};

export default function MobileCompare() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { region } = useRegion(); // ✅ ADDED REGION
  const [brokersData, setBrokersData] = useState<any[]>([]);
  const [propFirmsData, setPropFirmsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedType, setSelectedType] = useState<'brokers' | 'prop-firms'>('brokers');
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [expandedProgram, setExpandedProgram] = useState<number | null>(null);

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
          api.getBrokers(region), // ✅ ADDED region
          api.getPropFirms(region) // ✅ ADDED region
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
  }, [region]); // ✅ ADDED region dependency

  // Load items from query after data is loaded
  useEffect(() => {
    if (!loading && (brokersData.length > 0 || propFirmsData.length > 0)) {
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
        
        const currentData = type === 'prop-firms' ? propFirmsData : brokersData;
        const items = currentData.filter(item => ids.includes(item.id));
        if (items.length > 0) {
          setSelectedItems(items);
        }
      }
    }
  }, [loading, brokersData, propFirmsData, searchParams]);

  // Get current data based on selected type
  const currentData = selectedType === 'brokers' ? brokersData : propFirmsData;
  const currentLabel = selectedType === 'brokers' ? 'Brokers' : 'Prop Firms';

  // Filter items based on search - REGION AWARE
  const filteredItems = useMemo(() => {
    if (!search) {
      // Filter by region availability
      return currentData.filter(item => isAvailableInRegion(item, region));
    }
    return currentData.filter(item => 
      (item.name?.toLowerCase().includes(search.toLowerCase()) ||
      (item.country?.toLowerCase().includes(search.toLowerCase()))) &&
      isAvailableInRegion(item, region)
    );
  }, [currentData, search, region]);

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

  // Show empty state if no entities in region
  if (!loading && brokersData.length === 0 && propFirmsData.length === 0) {
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
    };

    const suggestions = nearbyRegions[region] || [{ key: 'GLOBAL', label: 'Global', flag: '🌍' }];

    return (
      <MobileLayout title="Compare Platforms" showSearch={false}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <Globe size={48} className="text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            No trading partners in {regionInfo.flag} {regionInfo.label}
          </h2>
          <p className="text-zinc-400 text-sm mb-4">
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
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
          >
            View All Global Partners
          </button>
        </div>
      </MobileLayout>
    );
  }

  if (loading) {
    return (
      <MobileLayout title="Compare Platforms" showSearch={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" />
            <p className="text-xs text-zinc-500 mt-3">Loading comparison data...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Compare Platforms" showSearch={false}>
      {/* ❌ REGION BANNER REMOVED - Users select region in navbar */}

      <div className="space-y-5 pb-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-5 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-2">
            <GitCompare size={18} className="text-purple-400" />
            <span className="text-xs text-purple-400 font-medium">Compare Side by Side</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Compare <span className="text-purple-400">{currentLabel}</span></h1>
          <p className="text-xs text-zinc-400 mt-1">Select up to 4 platforms to compare features, pricing, and ratings</p>
        </div>

        {/* Type Toggle */}
        <div className="flex gap-2 bg-zinc-900/50 rounded-xl p-1 border border-zinc-800">
          <button
            onClick={() => {
              setSelectedType('brokers');
              setSelectedItems([]);
              setSearch('');
            }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              selectedType === 'brokers'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'text-zinc-400'
            }`}
          >
            <TrendingUp size={14} /> Brokers ({brokersData.length})
          </button>
          <button
            onClick={() => {
              setSelectedType('prop-firms');
              setSelectedItems([]);
              setSearch('');
            }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              selectedType === 'prop-firms'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-zinc-400'
            }`}
          >
            <Trophy size={14} /> Prop Firms ({propFirmsData.length})
          </button>
        </div>

        {/* Search & Add Section */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Plus size={14} className="text-purple-400" />
              <span className="text-white text-sm font-medium">Add to Compare</span>
            </div>
            <span className="text-xs text-zinc-500">{selectedItems.length}/4 selected</span>
          </div>
          
          <div className="relative" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
            <input
              ref={inputRef}
              type="text"
              placeholder={`Search ${currentLabel.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => search.length > 1 && setShowSuggestions(true)}
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl pl-9 pr-8 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-purple-500"
            />
            {search && (
              <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                <X size={14} />
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
                      className="w-full px-3 py-2.5 text-left hover:bg-zinc-800 transition-colors flex items-center gap-3 border-b border-zinc-800 last:border-0 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FirmLogo item={item} size="sm" />
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{item.name}</div>
                        <div className="text-[10px] text-zinc-500 flex items-center gap-2">
                          <span>{item.country || 'International'}</span>
                          <StarRating rating={item.rating || 0} count={selectedType === 'brokers' ? item.reviewsCount : item.totalReviews} size="sm" />
                        </div>
                      </div>
                      <Plus size={14} className="text-purple-400 opacity-0 group-hover:opacity-100" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {selectedItems.length >= 4 && (
            <p className="text-[10px] text-amber-500 mt-2">Maximum 4 platforms can be compared at once</p>
          )}
        </div>

        {/* Selected Items */}
        {selectedItems.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-white">Selected Platforms</h3>
            <div className="space-y-2">
              {selectedItems.map((item, index) => {
                const trustScore = item.avgTrustScore || item.trustScore || 0;
                const rating = item.rating || 0;
                const reviewsCount = selectedType === 'brokers' ? (item.reviewsCount || 0) : (item.totalReviews || 0);
                const hasOffer = selectedType === 'brokers' 
                  ? ((item.bonuses && item.bonuses.length > 0) || (item.promotions && item.promotions.length > 0))
                  : (item.promotions && item.promotions.length > 0);
                
                return (
                  <div key={item.id} className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FirmLogo item={item} size="sm" />
                        <div>
                          <h4 className="text-white font-semibold text-sm">{item.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StarRating rating={rating} count={reviewsCount} size="sm" />
                            {trustScore > 0 && <TrustScoreBadge score={trustScore} size="sm" />}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="bg-zinc-800/30 rounded-lg p-2 text-center">
                        <div className="text-zinc-500 text-[10px]">Min {selectedType === 'brokers' ? 'Deposit' : 'Account'}</div>
                        <div className="text-white font-semibold text-xs">${getMinAccountSize(item).toLocaleString()}</div>
                      </div>
                      {selectedType === 'prop-firms' ? (
                        <div className="bg-zinc-800/30 rounded-lg p-2 text-center">
                          <div className="text-zinc-500 text-[10px]">Max Payout</div>
                          <div className="text-green-400 font-semibold text-xs">{getMaxPayout(item)}%</div>
                        </div>
                      ) : (
                        <div className="bg-zinc-800/30 rounded-lg p-2 text-center">
                          <div className="text-zinc-500 text-[10px]">Leverage</div>
                          <div className="text-white font-semibold text-xs">{item.maxLeverage || item.leverage || '1:100'}</div>
                        </div>
                      )}
                      <div className="bg-zinc-800/30 rounded-lg p-2 text-center">
                        <div className="text-zinc-500 text-[10px]">Rating</div>
                        <div className="text-yellow-400 font-semibold text-xs">{rating.toFixed(1)}</div>
                      </div>
                    </div>
                    
                    {hasOffer && (
                      <div className="mt-2 p-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                        <div className="flex items-center gap-1 text-[10px] text-amber-400">
                          <Gift size={10} /> Special offer available
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Comparison Table - WITH LOGOS IN HEADER */}
        {selectedItems.length >= 2 && (
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
            {/* Header Row with Logos and Names */}
            <div className="p-3 border-b border-zinc-800 bg-zinc-800/30">
              <div className="grid grid-cols-5 gap-2 items-center">
                <div className="col-span-1">
                  <h3 className="text-white text-sm font-semibold flex items-center gap-2">
                    <BarChart3 size={14} className="text-purple-400" />
                    Feature
                  </h3>
                </div>
                {selectedItems.map((item) => (
                  <div key={`header-${item.id}`} className="col-span-1 text-center">
                    <div className="flex flex-col items-center">
                      <FirmLogo item={item} size="sm" />
                      <span className="text-xs font-medium text-white truncate max-w-[80px] mt-1">{item.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="divide-y divide-zinc-800">
              {/* PROP FIRMS COMPARISON FIELDS */}
              {selectedType === 'prop-firms' && (
                <>
                  {/* Rating */}
                  <div className="p-3">
                    <div className="grid grid-cols-5 gap-2 items-center">
                      <div className="col-span-1">
                        <div className="flex items-center gap-2">
                          <Star size={12} className="text-yellow-500" />
                          <span className="text-xs text-zinc-400 font-medium">Rating</span>
                        </div>
                      </div>
                      {selectedItems.map((item) => (
                        <div key={`rating-${item.id}`} className="col-span-1 text-center">
                          <div className="text-white text-sm font-medium">{item.rating?.toFixed(1) || '0.0'}</div>
                          <div className="text-[10px] text-zinc-500">({item.totalReviews || 0})</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Trust Score */}
                  <div className="p-3">
                    <div className="grid grid-cols-5 gap-2 items-center">
                      <div className="col-span-1">
                        <div className="flex items-center gap-2">
                          <Shield size={12} className="text-purple-500" />
                          <span className="text-xs text-zinc-400 font-medium">Trust Score</span>
                        </div>
                      </div>
                      {selectedItems.map((item) => (
                        <div key={`trust-${item.id}`} className="col-span-1 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-white text-sm font-medium">{item.avgTrustScore || item.trustScore || 0}</span>
                            <TrustScoreBadge score={item.avgTrustScore || item.trustScore || 0} size="sm" showLabel={false} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Payout Speed */}
                  <div className="p-3">
                    <div className="grid grid-cols-5 gap-2 items-center">
                      <div className="col-span-1">
                        <div className="flex items-center gap-2">
                          <Clock size={12} className="text-green-500" />
                          <span className="text-xs text-zinc-400 font-medium">Payout Speed</span>
                        </div>
                      </div>
                      {selectedItems.map((item) => (
                        <div key={`payout-${item.id}`} className="col-span-1 text-center">
                          <span className="text-white text-sm">{getPayoutSpeed(item)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Trading Rules */}
                  <div className="p-3">
                    <div className="grid grid-cols-5 gap-2 items-center">
                      <div className="col-span-1">
                        <div className="flex items-center gap-2">
                          <BookOpenIcon size={12} className="text-cyan-500" />
                          <span className="text-xs text-zinc-400 font-medium">Trading Rules</span>
                        </div>
                      </div>
                      {selectedItems.map((item) => {
                        const firstProgram = item.programs?.[0];
                        const rules = firstProgram?.rules;
                        return (
                          <div key={`rules-${item.id}`} className="col-span-1 text-center space-y-1">
                            {rules?.maxDrawdown && (
                              <div className="text-[10px]"><span className="text-zinc-500">Max DD:</span> <span className="text-white">{rules.maxDrawdown}%</span></div>
                            )}
                            {rules?.profitTarget && (
                              <div className="text-[10px]"><span className="text-zinc-500">Target:</span> <span className="text-white">
                                {typeof rules.profitTarget === 'object' 
                                  ? `${rules.profitTarget.phase1 || 0}% + ${rules.profitTarget.phase2 || 0}%` 
                                  : `${rules.profitTarget}%`}
                              </span></div>
                            )}
                            {rules?.minTradingDays && (
                              <div className="text-[10px]"><span className="text-zinc-500">Min Days:</span> <span className="text-white">{rules.minTradingDays}</span></div>
                            )}
                            {!rules && <span className="text-[10px] text-zinc-500">N/A</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Account Costs */}
                  <div className="p-3">
                    <div className="grid grid-cols-5 gap-2 items-center">
                      <div className="col-span-1">
                        <div className="flex items-center gap-2">
                          <Coins size={12} className="text-emerald-500" />
                          <span className="text-xs text-zinc-400 font-medium">Account Costs</span>
                        </div>
                      </div>
                      {selectedItems.map((item) => {
                        const accountOptions = getAllAccountOptionsWithPrice(item);
                        const showMore = expandedProgram === item.id;
                        const displayOptions = showMore ? accountOptions : accountOptions.slice(0, 2);
                        return (
                          <div key={`costs-${item.id}`} className="col-span-1 text-center space-y-1">
                            {displayOptions.map((acc, idx) => (
                              <div key={idx} className="bg-zinc-800/30 rounded-lg p-1">
                                <div className="text-white text-xs font-medium">${acc.size.toLocaleString()}</div>
                                <div className="text-green-400 text-[10px]">${acc.price.toLocaleString()}</div>
                              </div>
                            ))}
                            {accountOptions.length > 2 && (
                              <button
                                onClick={() => setExpandedProgram(expandedProgram === item.id ? null : item.id)}
                                className="text-[10px] text-purple-400"
                              >
                                {showMore ? 'Show less' : `+${accountOptions.length - 2} more`}
                              </button>
                            )}
                            {accountOptions.length === 0 && <span className="text-[10px] text-zinc-500">N/A</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Trading Conditions */}
                  <div className="p-3">
                    <div className="grid grid-cols-5 gap-2 items-center">
                      <div className="col-span-1">
                        <div className="flex items-center gap-2">
                          <Activity size={12} className="text-orange-500" />
                          <span className="text-xs text-zinc-400 font-medium">Trading Conditions</span>
                        </div>
                      </div>
                      {selectedItems.map((item) => (
                        <div key={`conditions-${item.id}`} className="col-span-1 text-center">
                          <span className="text-white text-sm">{getTradingConditions(item).toFixed(1)}/5</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Support Score */}
                  <div className="p-3">
                    <div className="grid grid-cols-5 gap-2 items-center">
                      <div className="col-span-1">
                        <div className="flex items-center gap-2">
                          <Headphones size={12} className="text-blue-500" />
                          <span className="text-xs text-zinc-400 font-medium">Support Score</span>
                        </div>
                      </div>
                      {selectedItems.map((item) => (
                        <div key={`support-${item.id}`} className="col-span-1 text-center">
                          <span className="text-white text-sm">{getSupportScore(item).toFixed(1)}/5</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Platforms */}
                  <div className="p-3">
                    <div className="grid grid-cols-5 gap-2 items-center">
                      <div className="col-span-1">
                        <div className="flex items-center gap-2">
                          <Monitor size={12} className="text-cyan-500" />
                          <span className="text-xs text-zinc-400 font-medium">Platforms</span>
                        </div>
                      </div>
                      {selectedItems.map((item) => (
                        <div key={`platforms-${item.id}`} className="col-span-1 text-center">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {getPlatforms(item).slice(0, 2).map((p: string, idx: number) => (
                              <span key={idx} className="text-[9px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded">{p}</span>
                            ))}
                            {getPlatforms(item).length > 2 && (
                              <span className="text-[9px] text-zinc-500">+{getPlatforms(item).length - 2}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* BROKERS COMPARISON FIELDS */}
              {selectedType === 'brokers' && (
                <>
                  {/* Rating */}
                  <div className="p-3">
                    <div className="grid grid-cols-5 gap-2 items-center">
                      <div className="col-span-1">
                        <div className="flex items-center gap-2">
                          <Star size={12} className="text-yellow-500" />
                          <span className="text-xs text-zinc-400 font-medium">Rating</span>
                        </div>
                      </div>
                      {selectedItems.map((item) => (
                        <div key={`rating-${item.id}`} className="col-span-1 text-center">
                          <div className="text-white text-sm font-medium">{item.rating?.toFixed(1) || '0.0'}</div>
                          <div className="text-[10px] text-zinc-500">({item.reviewsCount || 0})</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Trust Score */}
                  <div className="p-3">
                    <div className="grid grid-cols-5 gap-2 items-center">
                      <div className="col-span-1">
                        <div className="flex items-center gap-2">
                          <Shield size={12} className="text-purple-500" />
                          <span className="text-xs text-zinc-400 font-medium">Trust Score</span>
                        </div>
                      </div>
                      {selectedItems.map((item) => (
                        <div key={`trust-${item.id}`} className="col-span-1 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-white text-sm font-medium">{item.avgTrustScore || item.trustScore || 0}</span>
                            <TrustScoreBadge score={item.avgTrustScore || item.trustScore || 0} size="sm" showLabel={false} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Withdrawal Speed */}
                  <div className="p-3">
                    <div className="grid grid-cols-5 gap-2 items-center">
                      <div className="col-span-1">
                        <div className="flex items-center gap-2">
                          <Clock size={12} className="text-green-500" />
                          <span className="text-xs text-zinc-400 font-medium">Withdrawal Speed</span>
                        </div>
                      </div>
                      {selectedItems.map((item) => (
                        <div key={`withdrawal-${item.id}`} className="col-span-1 text-center">
                          {getWithdrawalSpeedRating(item) > 0 ? (
                            <span className="text-white text-sm">{getWithdrawalSpeedRating(item).toFixed(1)}/5</span>
                          ) : (
                            <span className="text-[10px] text-zinc-500">N/A</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Trading Conditions */}
                  <div className="p-3">
                    <div className="grid grid-cols-5 gap-2 items-center">
                      <div className="col-span-1">
                        <div className="flex items-center gap-2">
                          <Activity size={12} className="text-orange-500" />
                          <span className="text-xs text-zinc-400 font-medium">Trading Conditions</span>
                        </div>
                      </div>
                      {selectedItems.map((item) => (
                        <div key={`conditions-${item.id}`} className="col-span-1 text-center">
                          <span className="text-white text-sm">{getTradingConditions(item).toFixed(1)}/5</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Max Leverage */}
                  <div className="p-3">
                    <div className="grid grid-cols-5 gap-2 items-center">
                      <div className="col-span-1">
                        <div className="flex items-center gap-2">
                          <Gauge size={12} className="text-blue-500" />
                          <span className="text-xs text-zinc-400 font-medium">Max Leverage</span>
                        </div>
                      </div>
                      {selectedItems.map((item) => (
                        <div key={`leverage-${item.id}`} className="col-span-1 text-center">
                          <span className="text-white text-sm font-bold">{item.maxLeverage || item.leverage || '1:100'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Spreads */}
                  <div className="p-3">
                    <div className="grid grid-cols-5 gap-2 items-center">
                      <div className="col-span-1">
                        <div className="flex items-center gap-2">
                          <Target size={12} className="text-cyan-500" />
                          <span className="text-xs text-zinc-400 font-medium">Spreads</span>
                        </div>
                      </div>
                      {selectedItems.map((item) => (
                        <div key={`spreads-${item.id}`} className="col-span-1 text-center space-y-1">
                          {item.averageSpreads && Object.keys(item.averageSpreads).length > 0 ? (
                            <>
                              {item.averageSpreads.eurusd && (
                                <div className="text-[10px]"><span className="text-zinc-500">EURUSD:</span> <span className="text-white">{item.averageSpreads.eurusd} pips</span></div>
                              )}
                              {item.averageSpreads.us30 && (
                                <div className="text-[10px]"><span className="text-zinc-500">US30:</span> <span className="text-white">{item.averageSpreads.us30} pips</span></div>
                              )}
                              {item.averageSpreads.xauusd && (
                                <div className="text-[10px]"><span className="text-zinc-500">XAUUSD:</span> <span className="text-white">{item.averageSpreads.xauusd} pips</span></div>
                              )}
                            </>
                          ) : (
                            <span className="text-[10px] text-zinc-500">N/A</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Support Score */}
                  <div className="p-3">
                    <div className="grid grid-cols-5 gap-2 items-center">
                      <div className="col-span-1">
                        <div className="flex items-center gap-2">
                          <Headphones size={12} className="text-blue-500" />
                          <span className="text-xs text-zinc-400 font-medium">Support Score</span>
                        </div>
                      </div>
                      {selectedItems.map((item) => (
                        <div key={`support-${item.id}`} className="col-span-1 text-center">
                          <span className="text-white text-sm">{getSupportScore(item).toFixed(1)}/5</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Minimum Deposit */}
                  <div className="p-3">
                    <div className="grid grid-cols-5 gap-2 items-center">
                      <div className="col-span-1">
                        <div className="flex items-center gap-2">
                          <DollarSign size={12} className="text-emerald-500" />
                          <span className="text-xs text-zinc-400 font-medium">Min Deposit</span>
                        </div>
                      </div>
                      {selectedItems.map((item) => (
                        <div key={`deposit-${item.id}`} className="col-span-1 text-center">
                          <span className="text-white text-sm font-bold">${getMinAccountSize(item).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Quick Insights */}
        {selectedItems.length >= 2 && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Award size={14} className="text-purple-400" />
              <span className="text-xs font-medium text-white">Quick Insights</span>
            </div>
            <p className="text-[11px] text-zinc-300">
              {(() => {
                const highestRated = [...selectedItems].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
                const bestSupport = [...selectedItems].sort((a, b) => getSupportScore(b) - getSupportScore(a))[0];
                const lowestMin = [...selectedItems].sort((a, b) => getMinAccountSize(a) - getMinAccountSize(b))[0];
                return `${highestRated?.name} has the highest rating. ${bestSupport?.name} has the best support. ${lowestMin?.name} has the lowest minimum ${selectedType === 'brokers' ? 'deposit' : 'account size'}.`;
              })()}
            </p>
          </div>
        )}

        {/* Empty State */}
        {selectedItems.length === 0 && (
          <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
              <GitCompare size={24} className="text-zinc-500" />
            </div>
            <p className="text-zinc-500 text-sm">No platforms selected</p>
            <p className="text-zinc-600 text-xs mt-1">Search and add up to 4 to compare</p>
          </div>
        )}

        {/* Action Buttons */}
        {selectedItems.length >= 2 && (
          <div className="flex gap-3">
            <button
              onClick={() => {
                const ids = selectedItems.map(i => i.id).join(',');
                const type = selectedType === 'brokers' ? 'broker' : 'prop';
                router.push(`/compare?ids=${ids}&type=${type}`);
              }}
              className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            >
              <Share size={14} /> Share Comparison
            </button>
            <button
              onClick={() => setSelectedItems([])}
              className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            >
              <X size={14} /> Clear All
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-[10px] text-zinc-600 py-2">Compare up to 4 platforms. Data is community-reported.</div>
      </div>
    </MobileLayout>
  );
}