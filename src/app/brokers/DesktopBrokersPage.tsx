'use client';

import RegulationsTab from "./RegulationsTab";
import ReviewsTab from "./ReviewsTab"; 
import BonusesTab from "./BonusesTab";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRegion } from "@/contexts/RegionContext";
import { 
  Star, ShieldCheck, Gift, Globe, Search, TrendingUp, 
  BarChart3, Users, Zap, Award, X, ExternalLink, ArrowRight, Eye, 
  Calculator, CheckCircle, AlertTriangle, Building, Clock, MessageCircle, 
  Heart, DollarSign, CreditCard, Smartphone, BookOpen, 
  Rocket, Filter, Sparkles, Flame, Crown, Gem, Info, RefreshCw, 
  Activity, Target, XCircle, AlertCircle, Headphones, Gauge,
  Wallet, Landmark, Compass, Trophy, Medal,
  ChevronDown, Shield, ChevronLeft, ChevronRight, LayoutGrid, List, GitCompare,
  Building2, AlertOctagon, Monitor, Layers, BadgeCheck
} from "lucide-react";
import { api } from "@/lib/api";
import { slugify } from "@/lib/slugify";
import { formatCurrency } from "@/utils/api-helpers";
import TrustScoreBadge from "@/components/ui/TrustScoreBadge";

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
  const sizes = { sm: "w-3.5 h-3.5", md: "w-4 h-4" };
  const hasReviews = count > 0;
  const displayRating = hasReviews ? Math.min(5, Math.max(0, rating || 0)) : 0;
  const roundedRating = Math.round(displayRating);

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star 
            key={i} 
            className={`${sizes[size]} ${i <= roundedRating && hasReviews ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_2px_rgba(250,204,21,0.5)]' : 'text-zinc-700'}`} 
          />
        ))}
      </div>
      {hasReviews ? (
        <>
          <span className="text-xs text-white ml-0.5">{displayRating.toFixed(1)}</span>
          <span className="text-xs text-zinc-500">({count})</span>
        </>
      ) : (
        <span className="text-xs text-zinc-500 ml-1">No reviews</span>
      )}
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

// Calculate trust stats from reviews
const calculateTrustStatsFromReviews = (reviews: any[]) => {
  if (!reviews || reviews.length === 0) return { avgTrustScore: 0, totalReviews: 0 };
  const avgTrustScore = reviews.reduce((sum, r) => sum + (r.trustScore || 0), 0) / reviews.length;
  return { avgTrustScore: Math.round(avgTrustScore), totalReviews: reviews.length };
};

const generateGradient = (name: string) => {
  const gradients = [
    "from-pink-500 to-purple-500", "from-blue-500 to-purple-500", 
    "from-green-500 to-blue-500", "from-yellow-500 to-orange-500",
    "from-red-500 to-pink-500", "from-indigo-500 to-blue-500",
    "from-teal-500 to-green-500", "from-orange-500 to-red-500"
  ];
  return gradients[(name?.length || 0) % gradients.length];
};

// Sponsored Card Component
function SponsoredCard() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-orange-900/30 rounded-xl border border-purple-500/30 p-6 group">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-orange-600/10 animate-pulse" />
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400 text-[10px] font-medium mb-3">
            <Crown size={10} /> SPONSORED
          </div>
          <h3 className="text-white text-xl md:text-2xl font-bold mb-2">
            Trade with <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Zero Commission</span>
          </h3>
          <p className="text-zinc-400 text-sm mb-4 max-w-md">
            Get $100 bonus on first deposit + 0% commission on all major pairs. Limited time offer.
          </p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <div className="flex items-center gap-1.5 text-xs text-zinc-300">
              <CheckCircle size={12} className="text-green-400" />
              Regulated Broker
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-300">
              <Zap size={12} className="text-yellow-400" />
              Instant Execution
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-300">
              <ShieldCheck size={12} className="text-blue-400" />
              Negative Balance Protection
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <button className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium text-sm hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg hover:shadow-purple-500/25 flex items-center gap-2">
            Claim Offer <ArrowRight size={14} />
          </button>
        </div>
      </div>
      
      <div className="absolute top-4 right-4 w-20 h-20 bg-purple-500/10 rounded-full blur-xl" />
      <div className="absolute bottom-4 left-4 w-16 h-16 bg-pink-500/10 rounded-full blur-xl" />
    </div>
  );
}

export default function BrokersPage() {
  const router = useRouter();
  const { region } = useRegion();
  const [brokersData, setBrokersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [sortBy, setSortBy] = useState<string>("rating-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredBroker, setHoveredBroker] = useState<number | null>(null);
  const [expandedBroker, setExpandedBroker] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [minDeposit, setMinDeposit] = useState('');
  const [leverage, setLeverage] = useState('');
  const [bonusAvailable, setBonusAvailable] = useState(false);
  const [showRegulated, setShowRegulated] = useState<boolean | null>(null);
  
  // Enriched brokers
  const [enrichedBrokers, setEnrichedBrokers] = useState<any[]>([]);
  const [loadingEnriched, setLoadingEnriched] = useState(true);
  const [brokerIncidents, setBrokerIncidents] = useState<Record<number, number>>({});

  const searchRef = useRef<HTMLDivElement>(null);

  // Get region info for display
  const regionInfo = REGION_DISPLAY[region] || REGION_DISPLAY['GLOBAL'];

  // Fetch brokers with region
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.getBrokers(region);
        if (response.success) setBrokersData(response.data || []);
      } catch (err) {
        console.error('Error fetching brokers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [region]);

  // Fetch incidents for each broker
  useEffect(() => {
    const fetchIncidentsForBrokers = async () => {
      if (enrichedBrokers.length === 0) return;
      
      const incidentsMap: Record<number, number> = {};
      await Promise.all(
        enrichedBrokers.map(async (broker) => {
          try {
            const response = await fetch(`/api/incidents?entityType=broker&entityId=${broker.id}&limit=1`);
            const data = await response.json();
            if (response.ok && data.pagination) {
              incidentsMap[broker.id] = data.pagination.total;
            }
          } catch (err) {
            incidentsMap[broker.id] = 0;
          }
        })
      );
      setBrokerIncidents(incidentsMap);
    };
    
    fetchIncidentsForBrokers();
  }, [enrichedBrokers]);

  // Enrich brokers with trust scores
  useEffect(() => {
    const enrichBrokers = async () => {
      if (brokersData.length === 0) return;
      setLoadingEnriched(true);
      
      const enriched = await Promise.all(
        brokersData.map(async (broker) => {
          try {
            const response = await fetch(`/api/reviews?brokerId=${broker.id}&status=APPROVED&limit=100`);
            const data = await response.json();
            if (response.ok && data.reviews) {
              const stats = calculateTrustStatsFromReviews(data.reviews);
              return { ...broker, trustScore: stats.avgTrustScore, reviewCount: stats.totalReviews };
            }
          } catch (err) {}
          return { ...broker, trustScore: broker.avgTrustScore || 0, reviewCount: broker.reviewsCount || 0 };
        })
      );
      
      setEnrichedBrokers(enriched);
      setLoadingEnriched(false);
    };
    enrichBrokers();
  }, [brokersData]);

  // Get unique filter values
  const countries = [...new Set(enrichedBrokers.map(b => b.country).filter(Boolean))];
  const platforms = [...new Set(enrichedBrokers.flatMap(b => b.platform || []))];
  const leverageOptions = [...new Set(enrichedBrokers.map(b => b.leverage).filter(Boolean))];

  // Search dropdown
  useEffect(() => {
    if (search.trim()) {
      const results = enrichedBrokers.filter(b => b.name?.toLowerCase().includes(search.toLowerCase())).slice(0, 5);
      setSearchResults(results);
      setShowSearchDropdown(true);
    } else {
      setShowSearchDropdown(false);
    }
  }, [search, enrichedBrokers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setShowSearchDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Stats
  const totalReviews = enrichedBrokers.reduce((sum, b) => sum + (b.reviewCount || 0), 0);
  const avgRating = enrichedBrokers.length > 0 ? (enrichedBrokers.reduce((sum, b) => sum + (b.rating || 0), 0) / enrichedBrokers.length).toFixed(1) : "0.0";
  const regulatedCount = enrichedBrokers.filter(b => b.regulated).length;
  const totalIncidents = Object.values(brokerIncidents).reduce((sum, count) => sum + count, 0);
  
  // Filter brokers
  const filteredBrokers = enrichedBrokers.filter(b => {
    const matchesSearch = search ? b.name?.toLowerCase().includes(search.toLowerCase()) : true;
    const matchesCountry = selectedCountries.length === 0 || selectedCountries.includes(b.country);
    const matchesPlatform = selectedPlatforms.length === 0 || selectedPlatforms.some(p => (b.platform || []).includes(p));
    const matchesDeposit = minDeposit === '' || (b.minDeposit >= Number(minDeposit));
    const matchesLeverage = leverage === '' || b.leverage === leverage;
    const matchesBonus = !bonusAvailable || ((b.bonuses && b.bonuses.length > 0) || (b.promotions && b.promotions.length > 0));
    const matchesRegulated = showRegulated === null || b.regulated === showRegulated;
    
    return matchesSearch && matchesCountry && matchesPlatform && matchesDeposit && matchesLeverage && matchesBonus && matchesRegulated;
  });
  
  // Sort brokers
  const sortedBrokers = [...filteredBrokers].sort((a, b) => {
    switch (sortBy) {
      case "rating-desc": return (b.rating || 0) - (a.rating || 0);
      case "trust-desc": return (b.trustScore || 0) - (a.trustScore || 0);
      case "deposit-asc": return (a.minDeposit || 0) - (b.minDeposit || 0);
      default: return (b.rating || 0) - (a.rating || 0);
    }
  });

  // Pagination
  const itemsPerPage = 6;
  const totalPages = Math.ceil(sortedBrokers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBrokers = sortedBrokers.slice(startIndex, startIndex + itemsPerPage);

  const handleNavigate = (id: number, name: string) => {
    router.push(`/brokers/${id}`);
  };

  const toggleExpand = (id: number) => {
    setExpandedBroker(expandedBroker === id ? null : id);
  };

  const clearFilters = () => {
    setSelectedCountries([]);
    setSelectedPlatforms([]);
    setMinDeposit('');
    setLeverage('');
    setBonusAvailable(false);
    setShowRegulated(null);
  };

  if (loading || loadingEnriched) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-zinc-500">Loading brokers...</p>
        </div>
      </div>
    );
  }

  // Show empty state with region suggestions if no brokers in region
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <Globe size={48} className="text-zinc-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No brokers in your region</h2>
          <p className="text-zinc-400 mb-4">
            We don't have any brokers available in {regionInfo.flag} {regionInfo.label} yet.
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
            View All Global Brokers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building size={20} className="text-purple-400" />
              <span className="text-sm text-purple-400 font-medium">{enrichedBrokers.length} Brokers Available</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Find a <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Trusted Broker</span> Today
            </h1>
            <p className="text-zinc-400 mt-2 max-w-2xl">
              Compare spreads, leverage, regulations, and real trader reviews to find your perfect trading partner.
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-80" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input
              type="text"
              placeholder="Search brokers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
            />
            
            <AnimatePresence>
              {showSearchDropdown && searchResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }} 
                  className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-20 overflow-hidden"
                >
                  {searchResults.map((result) => (
                    <button 
                      key={result.id} 
                      onClick={() => { 
                        handleNavigate(result.id, result.name); 
                        setShowSearchDropdown(false); 
                      }} 
                      className="w-full px-4 py-3 text-left hover:bg-zinc-800 transition-all flex items-center gap-3 border-b border-zinc-800 last:border-0 group"
                    >
                      <FirmLogo firm={result} size="sm" />
                      <div className="flex-1">
                        <div className="text-white font-medium group-hover:text-purple-400 transition-colors">{result.name}</div>
                        <div className="text-xs text-zinc-500">{result.country || 'International'}</div>
                      </div>
                      <ArrowRight size={14} className="text-zinc-500 group-hover:text-purple-400 transition-colors" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="border-y border-zinc-800/50 bg-gradient-to-r from-zinc-900/30 via-transparent to-zinc-900/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center text-sm flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <span className="text-white font-medium">{enrichedBrokers.length} brokers</span>
              <span className="text-zinc-400">{totalReviews.toLocaleString()} reviews</span>
              <span className="text-yellow-400">★ {avgRating} avg rating</span>
              <span className="text-red-400 flex items-center gap-1"><AlertTriangle size={12} /> {totalIncidents} incidents</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sponsored Card */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <SponsoredCard />
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 max-w-7xl mx-auto">
        {/* Tabs with Icons */}
        <div className="flex gap-2 mb-6 border-b border-zinc-800/50 pb-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === "overview"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                : "bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700"
            }`}
          >
            <LayoutGrid size={16} /> Overview
          </button>
          <button
            onClick={() => setActiveTab("bonuses")}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === "bonuses"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                : "bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700"
            }`}
          >
            <Gift size={16} /> Bonuses
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === "reviews"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                : "bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700"
            }`}
          >
            <Star size={16} /> Reviews
          </button>
          <button
            onClick={() => setActiveTab("regulations")}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === "regulations"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                : "bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700"
            }`}
          >
            <ShieldCheck size={16} /> Regulations
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            transition={{ duration: 0.2 }}
          >
            {activeTab === "bonuses" && <BonusesTab />}
            {activeTab === "reviews" && <ReviewsTab />}
            {activeTab === "regulations" && <RegulationsTab />}
            
            {activeTab === "overview" && (
              <>
                {/* Filter Bar */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setShowFilters(!showFilters)} 
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/50 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                      <Filter size={14} /> Filters
                      {(minDeposit || leverage || selectedCountries.length > 0 || selectedPlatforms.length > 0 || bonusAvailable || showRegulated !== null) && 
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                      }
                    </button>
                    <span className="text-xs text-zinc-500">{filteredBrokers.length} results</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500">Sort by:</span>
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)} 
                      className="bg-zinc-800/80 border border-zinc-700 text-white text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="rating-desc">Highest Rated</option>
                      <option value="trust-desc">Highest Trust Score</option>
                      <option value="deposit-asc">Lowest Min Deposit</option>
                    </select>
                  </div>
                </div>

                {/* Filters Panel */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: "auto" }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800 overflow-hidden"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-xs text-zinc-500 block mb-1">Min Deposit ($)</label>
                          <input 
                            type="number" 
                            placeholder="100" 
                            value={minDeposit} 
                            onChange={(e) => setMinDeposit(e.target.value)} 
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm" 
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-500 block mb-1">Leverage</label>
                          <select 
                            value={leverage} 
                            onChange={(e) => setLeverage(e.target.value)} 
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                          >
                            <option value="">Any</option>
                            {leverageOptions.map(lev => (
                              <option key={lev} value={lev}>{lev}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-zinc-500 block mb-1">Country</label>
                          <select 
                            value={selectedCountries[0] || ''} 
                            onChange={(e) => setSelectedCountries(e.target.value ? [e.target.value] : [])} 
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                          >
                            <option value="">Any</option>
                            {countries.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-zinc-500 block mb-1">Platform</label>
                          <select 
                            value={selectedPlatforms[0] || ''} 
                            onChange={(e) => setSelectedPlatforms(e.target.value ? [e.target.value] : [])} 
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                          >
                            <option value="">Any</option>
                            {platforms.map(p => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-zinc-500 block mb-1">Has Bonus/Offer</label>
                          <label className="flex items-center gap-2 mt-2">
                            <input 
                              type="checkbox" 
                              checked={bonusAvailable} 
                              onChange={(e) => setBonusAvailable(e.target.checked)} 
                              className="rounded border-zinc-700 bg-zinc-800"
                            />
                            <span className="text-sm text-zinc-300">Show only with offers</span>
                          </label>
                        </div>
                        <div>
                          <label className="text-xs text-zinc-500 block mb-1">Regulation Status</label>
                          <select 
                            value={showRegulated === null ? '' : (showRegulated ? 'regulated' : 'unregulated')} 
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'regulated') setShowRegulated(true);
                              else if (val === 'unregulated') setShowRegulated(false);
                              else setShowRegulated(null);
                            }} 
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                          >
                            <option value="">Any</option>
                            <option value="regulated">Regulated Only</option>
                            <option value="unregulated">Unregulated Only</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end mt-4">
                        <button 
                          onClick={clearFilters} 
                          className="text-xs text-zinc-500 hover:text-white transition-colors"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Broker Cards Grid - WITH LOGOS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {paginatedBrokers.map((broker, idx) => {
                    const trustScore = broker.trustScore || 0;
                    const reviewCount = broker.reviewCount || 0;
                    const hasOffer = (broker.bonuses && broker.bonuses.length > 0) || (broker.promotions && broker.promotions.length > 0);
                    const offerText = broker.bonuses?.[0]?.amount || broker.promotions?.[0]?.name || "Special Offer";
                    const isTopRated = idx === 0 && broker.rating >= 4.5;
                    const incidentCount = brokerIncidents[broker.id] || 0;
                    
                    const regulations = broker.regulation?.authorities || (typeof broker.regulation === 'string' ? [broker.regulation] : []);
                    
                    return (
                      <motion.div
                        key={broker.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group relative bg-zinc-900/50 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-zinc-800 hover:border-purple-500/30"
                        onMouseEnter={() => setHoveredBroker(broker.id)}
                        onMouseLeave={() => setHoveredBroker(null)}
                      >
                        {/* Top Rated Badge */}
                        {isTopRated && (
                          <div className="absolute -top-2 -right-2 z-10">
                            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1">
                              <Trophy size={10} /> Top Rated
                            </div>
                          </div>
                        )}
                        
                        {/* View Details Badge on Hover */}
                        <div className={`absolute -top-2 -left-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-lg z-10 transition-all duration-300 flex items-center gap-1 ${
                          hoveredBroker === broker.id ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                        }`}>
                          <Eye size={8} /> View Details
                        </div>

                        <div className="p-5">
                          {/* Header - WITH LOGO */}
                          <div className="flex items-start gap-3 mb-4">
                            <FirmLogo firm={broker} size="md" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-white text-lg group-hover:text-purple-400 transition-colors truncate">
                                {broker.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <StarRating rating={broker.rating || 0} count={reviewCount} size="sm" />
                                {trustScore > 0 && <TrustScoreBadge score={trustScore} size="sm" />}
                                {broker.regulated && <BadgeCheck size={14} className="text-green-400" />}
                              </div>
                            </div>
                          </div>
                          
                          {/* Key Metrics Grid */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-white/5 p-2.5 rounded-lg text-center hover:bg-white/10 transition-colors">
                              <div className="text-zinc-500 text-xs mb-1">Min Deposit</div>
                              <div className="text-white font-bold">{formatCurrency(broker.minDeposit || 100)}</div>
                            </div>
                            <div className="bg-white/5 p-2.5 rounded-lg text-center hover:bg-white/10 transition-colors">
                              <div className="text-zinc-500 text-xs mb-1">Leverage</div>
                              <div className="text-white font-bold">{broker.leverage || '1:200'}</div>
                            </div>
                            <div className="bg-white/5 p-2.5 rounded-lg text-center hover:bg-white/10 transition-colors">
                              <div className="text-zinc-500 text-xs mb-1">EURUSD Spread</div>
                              <div className="text-white font-bold">{broker.spreads?.eurusd?.split('-')[0]?.trim() || '0.1'} pips</div>
                            </div>
                            <div className="bg-white/5 p-2.5 rounded-lg text-center hover:bg-white/10 transition-colors">
                              <div className="text-zinc-500 text-xs mb-1">Incidents</div>
                              <div className={`font-bold flex items-center justify-center gap-1 ${incidentCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                {incidentCount > 0 ? <AlertTriangle size={10} /> : <CheckCircle size={10} />}
                                {incidentCount} reported
                              </div>
                            </div>
                          </div>

                          {/* Platforms */}
                          {(broker.platforms || broker.platform || []).length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {(broker.platforms || broker.platform || []).slice(0, 4).map((p: string, i: number) => (
                                <span key={i} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full">{p}</span>
                              ))}
                            </div>
                          )}

                          {/* Regulation Badges */}
                          <div className="flex flex-wrap gap-1 mb-4">
                            {regulations.slice(0, 3).map((reg: string, i: number) => (
                              <span key={i} className="text-[10px] bg-green-900/50 text-green-300 px-2 py-0.5 rounded">{reg.split(' ')[0]}</span>
                            ))}
                            {regulations.length === 0 && <span className="text-[10px] text-zinc-500">No regulation info</span>}
                          </div>

                          {/* Offer Section */}
                          {hasOffer && (
                            <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
                              <div className="flex items-center gap-2 mb-1">
                                <Gift size={12} className="text-amber-400" />
                                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Limited Time Offer</span>
                              </div>
                              <p className="text-white text-sm font-medium">{offerText}</p>
                            </div>
                          )}
                          
                          {/* CTA Button */}
                          <button 
                            onClick={() => handleNavigate(broker.id, broker.name)} 
                            className="w-full mt-2 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium text-sm hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2"
                          >
                            View Full Details
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
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
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-zinc-800/50 py-10 px-6 mt-6 bg-gradient-to-t from-zinc-900/30 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <MessageCircle size={16} className="text-purple-400" />
            <p className="text-zinc-500 text-sm">Share your trading experience</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Link 
              href="/reviews" 
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center gap-2 font-medium"
            >
              <Star size={14} /> Write a review
            </Link>
            <Link 
              href="/reviews?tab=incidents" 
              className="px-5 py-2.5 bg-zinc-800/80 text-zinc-300 text-sm rounded-xl hover:bg-zinc-700 transition-all flex items-center gap-2 font-medium border border-zinc-700"
            >
              <AlertTriangle size={14} /> Report incident
            </Link>
          </div>
          <p className="text-xs text-zinc-600 mt-4">Data is community-reported + verified by our team</p>
        </div>
      </div>
    </div>
  );
}