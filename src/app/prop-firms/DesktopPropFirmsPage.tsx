"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useRegion } from "@/contexts/RegionContext";
import { slugify } from "@/lib/slugify";
import { formatCurrency } from "@/utils/api-helpers";
import TrustScoreBadge from "@/components/ui/TrustScoreBadge";
import ReviewsTab from "./ReviewsTab";
import { 
  Star, ShieldCheck, Gift, Globe, Search, TrendingUp, 
  BarChart3, Users, Zap, Award, X, ExternalLink, ArrowRight, Eye, 
  Calculator, CheckCircle, AlertTriangle, Building, Clock, MessageCircle, 
  Heart, DollarSign, CreditCard, Smartphone, BookOpen, 
  Rocket, Filter, Sparkles, Flame, Crown, Gem, Info, RefreshCw, 
  Activity, Target, XCircle, AlertCircle, Headphones, Gauge,
  Wallet, Landmark, Compass, Trophy, Medal,
  ChevronDown, Shield, ChevronLeft, ChevronRight, LayoutGrid, List, GitCompare,
  Building2, AlertOctagon, Scale as ScaleIcon, Percent, Tag, Layers,
  BadgeCheck, Monitor, Server, Calendar as CalendarIcon, Briefcase,
  ChevronUp, ChevronRight as ChevronRightIcon, Copy
} from "lucide-react";

// ===================== LOGO COMPONENT =====================
function FirmLogo({ firm, size = "md" }: { firm: any; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-10 h-10 rounded-xl text-sm",
    md: "w-14 h-14 rounded-xl text-base",
    lg: "w-16 h-16 rounded-xl text-lg"
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
      {hasReviews && <span className="text-xs text-zinc-500">({count})</span>}
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
          <p className="text-zinc-500 text-xs">Based on payout reliability, trading conditions, and community feedback</p>
        </div>
      )}
    </div>
  );
}

// Helper functions for prop firms
const getAllAccountOptions = (firm: any) => {
  if (!firm || !firm.programs) return [];
  return firm.programs.flatMap((program: any) => program.accountOptions || []);
};

const getMaxPayout = (firm: any) => {
  const accountOptions = getAllAccountOptions(firm);
  if (accountOptions.length === 0) return 0;
  return Math.max(...accountOptions.map((acc: any) => {
    const payout = acc.payoutPercentage || acc.payout || 0;
    return typeof payout === 'string' ? parseInt(payout.replace('%', '')) : payout;
  }));
};

const getMinPrice = (firm: any) => {
  const accountOptions = getAllAccountOptions(firm);
  if (accountOptions.length === 0) return 0;
  return Math.min(...accountOptions.map((acc: any) => acc.price || 0));
};

const getMinAccountSize = (firm: any) => {
  const accountOptions = getAllAccountOptions(firm);
  if (accountOptions.length === 0) return 0;
  return Math.min(...accountOptions.map((acc: any) => acc.accountSize || 0));
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

// Helper function to format profit target (handles objects)
const formatProfitTarget = (target: any) => {
  if (!target) return '0%';
  if (typeof target === 'object') {
    if (target.phase1 && target.phase2) {
      return `${target.phase1}% + ${target.phase2}%`;
    }
    if (target.total) return `${target.total}%`;
    return 'N/A';
  }
  return `${target}%`;
};

// Sponsored Card - Prop Firm Version
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
            Get Funded with <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">90% Profit Split</span>
          </h3>
          <p className="text-zinc-400 text-sm mb-4 max-w-md">
            Pass your challenge with up to 50% discount. No minimum trading days. Instant funding available.
          </p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <div className="flex items-center gap-1.5 text-xs text-zinc-300"><CheckCircle size={12} className="text-green-400" /> 90% Profit Split</div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-300"><Zap size={12} className="text-yellow-400" /> Instant Funding</div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-300"><ShieldCheck size={12} className="text-blue-400" /> No Time Limit</div>
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

// Calculate trust stats from reviews
const calculateTrustStatsFromReviews = (reviews: any[]) => {
  if (!reviews || reviews.length === 0) return { avgTrustScore: 0, totalReviews: 0 };
  const avgTrustScore = reviews.reduce((sum, r) => sum + (r.trustScore || 0), 0) / reviews.length;
  return { avgTrustScore: Math.round(avgTrustScore), totalReviews: reviews.length };
};

// ProgramCTA component
function ProgramCTA({ href, text, size = "sm" }: { href: string; text: string; size?: "sm" | "md" }) {
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  return (
    <button 
      onClick={() => window.open(href, '_blank')}
      className={`bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-500 hover:to-emerald-500 transition-all shadow-md hover:shadow-green-500/20 flex items-center justify-center gap-1.5 ${sizes[size]}`}
    >
      <Rocket size={size === "sm" ? 10 : 12} />
      {text}
    </button>
  );
}

export default function DesktopPropFirms() {
  const router = useRouter();
  const { region } = useRegion();
  const searchRef = useRef<HTMLDivElement>(null);
  const [firmsData, setFirmsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState("firms");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [sortBy, setSortBy] = useState<string>("rating-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredFirm, setHoveredFirm] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Tab-specific pagination states
  const [offersPage, setOffersPage] = useState(1);
  const [rulesPage, setRulesPage] = useState(1);
  const itemsPerPage = 6;
  
  // Tab-specific search states
  const [offersSearch, setOffersSearch] = useState("");
  const [rulesSearch, setRulesSearch] = useState("");
  
  // Expand states for Offers and Rules
  const [expandedOffers, setExpandedOffers] = useState<Record<number, boolean>>({});
  const [expandedRules, setExpandedRules] = useState<Record<number, boolean>>({});
  
  // Filter states
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [minPayout, setMinPayout] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bonusAvailable, setBonusAvailable] = useState(false);
  
  // Enriched firms
  const [enrichedFirms, setEnrichedFirms] = useState<any[]>([]);
  const [loadingEnriched, setLoadingEnriched] = useState(true);
  const [firmIncidents, setFirmIncidents] = useState<Record<number, number>>({});

  // ✅ Fetch firms with region
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.getPropFirms(region);
        if (response.success) setFirmsData(response.data || []);
      } catch (err) {
        console.error('Error fetching prop firms:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [region]);

  // Fetch incidents
  useEffect(() => {
    const fetchIncidents = async () => {
      if (enrichedFirms.length === 0) return;
      const incidentsMap: Record<number, number> = {};
      await Promise.all(
        enrichedFirms.map(async (firm) => {
          try {
            const response = await fetch(`/api/incidents?entityType=propFirm&entityId=${firm.id}&limit=1`);
            const data = await response.json();
            if (response.ok && data.pagination) incidentsMap[firm.id] = data.pagination.total;
          } catch (err) { incidentsMap[firm.id] = 0; }
        })
      );
      setFirmIncidents(incidentsMap);
    };
    fetchIncidents();
  }, [enrichedFirms]);

  // Enrich firms with trust scores
  useEffect(() => {
    const enrichFirms = async () => {
      if (firmsData.length === 0) return;
      setLoadingEnriched(true);
      const enriched = await Promise.all(
        firmsData.map(async (firm) => {
          try {
            const response = await fetch(`/api/reviews?propFirmId=${firm.id}&status=APPROVED&limit=100`);
            const data = await response.json();
            if (response.ok && data.reviews) {
              const stats = calculateTrustStatsFromReviews(data.reviews);
              return { ...firm, trustScore: stats.avgTrustScore, reviewCount: stats.totalReviews };
            }
          } catch (err) {}
          return { ...firm, trustScore: firm.avgTrustScore || 0, reviewCount: firm.totalReviews || 0 };
        })
      );
      setEnrichedFirms(enriched);
      setLoadingEnriched(false);
    };
    enrichFirms();
  }, [firmsData]);

  const countries = [...new Set(enrichedFirms.map(f => f.country).filter(Boolean))];

  // Search dropdown
  useEffect(() => {
    if (search.trim()) {
      const results = enrichedFirms.filter(f => f.name?.toLowerCase().includes(search.toLowerCase())).slice(0, 5);
      setSearchResults(results);
      setShowSearchDropdown(true);
    } else {
      setShowSearchDropdown(false);
    }
  }, [search, enrichedFirms]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setShowSearchDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Stats
  const totalReviews = enrichedFirms.reduce((sum, f) => sum + (f.reviewCount || 0), 0);
  const avgRating = enrichedFirms.length > 0 ? (enrichedFirms.reduce((sum, f) => sum + (f.rating || 0), 0) / enrichedFirms.length).toFixed(1) : "0.0";
  const avgTrustScore = enrichedFirms.length > 0 ? Math.round(enrichedFirms.reduce((sum, f) => sum + (f.trustScore || 0), 0) / enrichedFirms.length) : 0;
  const totalIncidents = Object.values(firmIncidents).reduce((sum, count) => sum + count, 0);

  // Filter firms for main list
  const filteredFirms = enrichedFirms.filter(f => {
    const matchesSearch = search ? f.name?.toLowerCase().includes(search.toLowerCase()) : true;
    const matchesCountry = selectedCountries.length === 0 || selectedCountries.includes(f.country);
    const matchesPayout = minPayout === '' || (getMaxPayout(f) >= Number(minPayout));
    const matchesPrice = maxPrice === '' || (getMinPrice(f) <= Number(maxPrice));
    const matchesBonus = !bonusAvailable || (f.promotions && f.promotions.length > 0);
    return matchesSearch && matchesCountry && matchesPayout && matchesPrice && matchesBonus;
  });

  // Filter firms with offers for Offers tab
  const firmsWithOffers = enrichedFirms.filter(f => f.promotions && f.promotions.length > 0);
  const filteredOffersFirms = firmsWithOffers.filter(f => {
    if (!offersSearch) return true;
    return f.name?.toLowerCase().includes(offersSearch.toLowerCase());
  });

  // Filter firms with programs for Rules tab
  const firmsWithPrograms = enrichedFirms.filter(f => f.programs && f.programs.length > 0);
  const filteredRulesFirms = firmsWithPrograms.filter(f => {
    if (!rulesSearch) return true;
    return f.name?.toLowerCase().includes(rulesSearch.toLowerCase());
  });

  // Sort firms
  const sortedFirms = [...filteredFirms].sort((a, b) => {
    switch (sortBy) {
      case "rating-desc": return (b.rating || 0) - (a.rating || 0);
      case "trust-desc": return (b.trustScore || 0) - (a.trustScore || 0);
      case "payout-desc": return getMaxPayout(b) - getMaxPayout(a);
      case "price-asc": return getMinPrice(a) - getMinPrice(b);
      default: return (b.rating || 0) - (a.rating || 0);
    }
  });

  // Pagination for main firms
  const totalPages = Math.ceil(sortedFirms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFirms = sortedFirms.slice(startIndex, startIndex + itemsPerPage);

  // Pagination for Offers tab
  const offersTotalPages = Math.ceil(filteredOffersFirms.length / itemsPerPage);
  const offersStartIndex = (offersPage - 1) * itemsPerPage;
  const paginatedOffersFirms = filteredOffersFirms.slice(offersStartIndex, offersStartIndex + itemsPerPage);

  // Pagination for Rules tab
  const rulesTotalPages = Math.ceil(filteredRulesFirms.length / itemsPerPage);
  const rulesStartIndex = (rulesPage - 1) * itemsPerPage;
  const paginatedRulesFirms = filteredRulesFirms.slice(rulesStartIndex, rulesStartIndex + itemsPerPage);

  const handleNavigate = (id: number, name: string) => {
    router.push(`/prop-firms/${id}`);
  };

  const clearFilters = () => {
    setSelectedCountries([]);
    setMinPayout('');
    setMaxPrice('');
    setBonusAvailable(false);
  };

  const tabStyle = (tab: string) =>
    `px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
      activeTab === tab
        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20"
        : "bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700"
    }`;

  if (loading || loadingEnriched) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          </div>
          <p className="mt-4 text-zinc-500">Loading prop firms...</p>
        </div>
      </div>
    );
  }

  // ✅ IMPROVED: Empty state with region suggestions
  if (enrichedFirms.length === 0) {
    // Define nearby regions
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
          <Building size={48} className="text-zinc-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            No prop firms in this region
          </h2>
          <p className="text-zinc-400 mb-6">
            We don't have any prop firms available in this region yet.
          </p>
          
          {/* Suggestions */}
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
          
          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                const { setRegion } = useRegion();
                setRegion('GLOBAL');
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
            >
              View All Global Prop Firms
            </button>
            <button
              onClick={() => {
                const selector = document.querySelector('[data-region-selector]');
                if (selector) {
                  (selector as HTMLElement).click();
                }
              }}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              🔄 Change Region
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* ❌ REMOVED Region Banner - Users can select region in navbar */}

      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building size={20} className="text-purple-400" />
              <span className="text-sm text-purple-400 font-medium">{enrichedFirms.length} Prop Firms Listed</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Find a <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Trusted Prop Firm</span> Today
            </h1>
            <p className="text-zinc-400 mt-2 max-w-2xl">
              Compare payouts, fees, drawdown rules, and real trader reviews to find your perfect prop firm.
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-80" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input
              type="text"
              placeholder="Search prop firms..."
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
              <span className="text-white font-medium">{enrichedFirms.length} prop firms</span>
              <span className="text-zinc-400">{totalReviews.toLocaleString()} reviews</span>
              <span className="text-purple-400">Avg Trust: {avgTrustScore}</span>
              <span className="text-yellow-400">Avg Rating: {avgRating}</span>
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
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-zinc-800/50 pb-4">
          <button onClick={() => { setActiveTab("firms"); setCurrentPage(1); }} className={tabStyle("firms")}>
            <Building2 size={16} /> Firms
          </button>
          <button onClick={() => { setActiveTab("offers"); setOffersPage(1); }} className={tabStyle("offers")}>
            <Gift size={16} /> Offers
          </button>
          <button onClick={() => { setActiveTab("rules"); setRulesPage(1); }} className={tabStyle("rules")}>
            <ScaleIcon size={16} /> Rules
          </button>
          <button onClick={() => { setActiveTab("reviews"); }} className={tabStyle("reviews")}>
            <Star size={16} /> Reviews
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            
            {/* ==================== FIRMS TAB ==================== */}
            {activeTab === "firms" && (
              <>
                {/* Filter Bar */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/50 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors">
                      <Filter size={14} /> Filters
                      {(minPayout || maxPrice || selectedCountries.length > 0 || bonusAvailable) && <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />}
                    </button>
                    <span className="text-xs text-zinc-500">{filteredFirms.length} results</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500">Sort by:</span>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-zinc-800/80 border border-zinc-700 text-white text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer">
                      <option value="rating-desc">Highest Rated</option>
                      <option value="trust-desc">Highest Trust Score</option>
                      <option value="payout-desc">Highest Payout</option>
                      <option value="price-asc">Lowest Price</option>
                    </select>
                  </div>
                </div>

                {/* Filters Panel */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800 overflow-hidden">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div><label className="text-xs text-zinc-500 block mb-1">Min Payout (%)</label><input type="number" placeholder="80" value={minPayout} onChange={(e) => setMinPayout(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm" /></div>
                        <div><label className="text-xs text-zinc-500 block mb-1">Max Price ($)</label><input type="number" placeholder="500" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm" /></div>
                        <div><label className="text-xs text-zinc-500 block mb-1">Country</label><select value={selectedCountries[0] || ''} onChange={(e) => setSelectedCountries(e.target.value ? [e.target.value] : [])} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"><option value="">Any</option>{countries.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                        <div><label className="text-xs text-zinc-500 block mb-1">Has Discount</label><label className="flex items-center gap-2 mt-2"><input type="checkbox" checked={bonusAvailable} onChange={(e) => setBonusAvailable(e.target.checked)} className="rounded border-zinc-700 bg-zinc-800" /><span className="text-sm text-zinc-300">Show only with offers</span></label></div>
                      </div>
                      <div className="flex justify-end mt-4"><button onClick={clearFilters} className="text-xs text-zinc-500 hover:text-white transition-colors">Clear All</button></div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {paginatedFirms.map((firm, idx) => {
                    const trustScore = firm.trustScore || 0;
                    const reviewCount = firm.reviewCount || 0;
                    const hasOffer = firm.promotions && firm.promotions.length > 0;
                    const offerText = firm.promotions?.[0]?.name || "Special Discount";
                    const isTopRated = idx === 0 && firm.rating >= 4.5;
                    const incidentCount = firmIncidents[firm.id] || 0;
                    const maxPayout = getMaxPayout(firm);
                    const minPrice = getMinPrice(firm);
                    const minAccount = getMinAccountSize(firm);
                    
                    return (
                      <motion.div
                        key={firm.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group relative bg-zinc-900/50 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-zinc-800 hover:border-purple-500/30"
                        onMouseEnter={() => setHoveredFirm(firm.id)}
                        onMouseLeave={() => setHoveredFirm(null)}
                      >
                        {isTopRated && (
                          <div className="absolute -top-2 -right-2 z-10">
                            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1"><Trophy size={10} /> Top Rated</div>
                          </div>
                        )}
                        
                        <div className={`absolute -top-2 -left-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-lg z-10 transition-all duration-300 flex items-center gap-1 ${hoveredFirm === firm.id ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                          <Eye size={8} /> View Details
                        </div>

                        <div className="p-5">
                          <div className="flex items-start gap-3 mb-4">
                            <FirmLogo firm={firm} size="md" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-white text-lg group-hover:text-purple-400 transition-colors truncate">{firm.name}</h3>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <StarRating rating={firm.rating || 0} count={reviewCount} size="sm" />
                                {trustScore > 0 && <TrustScoreBadge score={trustScore} size="sm" />}
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-white/5 p-2.5 rounded-lg text-center hover:bg-white/10 transition-colors">
                              <div className="text-zinc-500 text-xs mb-1">Max Payout</div>
                              <div className="text-white font-bold">{maxPayout}%</div>
                            </div>
                            <div className="bg-white/5 p-2.5 rounded-lg text-center hover:bg-white/10 transition-colors">
                              <div className="text-zinc-500 text-xs mb-1">Starting Price</div>
                              <div className="text-white font-bold">{formatCurrency(minPrice)}</div>
                            </div>
                            <div className="bg-white/5 p-2.5 rounded-lg text-center hover:bg-white/10 transition-colors">
                              <div className="text-zinc-500 text-xs mb-1">Min Account</div>
                              <div className="text-white font-bold">{formatCurrency(minAccount)}</div>
                            </div>
                            <div className="bg-white/5 p-2.5 rounded-lg text-center hover:bg-white/10 transition-colors">
                              <div className="text-zinc-500 text-xs mb-1">Incidents</div>
                              <div className={`font-bold flex items-center justify-center gap-1 ${incidentCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                {incidentCount > 0 ? <AlertTriangle size={10} /> : <CheckCircle size={10} />}
                                {incidentCount} reported
                              </div>
                            </div>
                          </div>

                          {firm.programs && firm.programs.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {firm.programs.slice(0, 3).map((program: any, i: number) => (
                                <span key={i} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full">{program.type}</span>
                              ))}
                            </div>
                          )}

                          {hasOffer && (
                            <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
                              <div className="flex items-center gap-2 mb-1"><Gift size={12} className="text-amber-400" /><span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Limited Offer</span></div>
                              <p className="text-white text-sm font-medium">{offerText}</p>
                            </div>
                          )}
                          
                          <button onClick={() => handleNavigate(firm.id, firm.name)} className="w-full mt-2 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium text-sm hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2">
                            View Full Details <ArrowRight size={14} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 rounded-xl text-sm text-zinc-400 disabled:opacity-50 hover:text-white border border-zinc-800 hover:border-purple-500/50 transition-all">Previous</button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + Math.max(1, currentPage - 2)).filter(p => p <= totalPages).map(p => (
                      <button key={p} onClick={() => setCurrentPage(p)} className={`px-3 py-2 rounded-xl text-sm transition-all ${p === currentPage ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white border border-zinc-800 hover:border-purple-500/50'}`}>{p}</button>
                    ))}
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 rounded-xl text-sm text-zinc-400 disabled:opacity-50 hover:text-white border border-zinc-800 hover:border-purple-500/50 transition-all">Next</button>
                  </div>
                )}
              </>
            )}

            {/* ==================== OFFERS TAB - EXPANDABLE CARDS ==================== */}
            {activeTab === "offers" && (
              <div className="space-y-4">
                {/* Offers Header with Search */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-orange-400" />
                      <span className="text-sm text-orange-400 font-medium">{filteredOffersFirms.length} Active Offers</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      Exclusive <span className="bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">Trading Offers</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">Get the best deals on prop firm challenges</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                    <input
                      type="text"
                      placeholder="Search offers..."
                      value={offersSearch}
                      onChange={(e) => { setOffersSearch(e.target.value); setOffersPage(1); }}
                      className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {filteredOffersFirms.length === 0 ? (
                  <div className="text-center py-12 bg-zinc-900/30 rounded-xl border border-zinc-800">
                    <Gift size={48} className="text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Active Offers</h3>
                    <p className="text-zinc-400">Check back later for exclusive promotions and discounts.</p>
                  </div>
                ) : (
                  <>
                    {paginatedOffersFirms.map((firm, idx) => {
                      const promotions = firm.promotions || [];
                      const primaryPromotion = promotions[0];
                      const additionalPromotions = promotions.slice(1);
                      const hasMultipleOffers = additionalPromotions.length > 0;
                      const maxPayout = getMaxPayout(firm);
                      const minPrice = getMinPrice(firm);
                      const minAccount = getMinAccountSize(firm);
                      const platforms = firm.platforms || firm.platform || [];
                      const programTypes = firm.programs?.map((p: any) => p.type) || [];
                      const isExpanded = expandedOffers[firm.id] || false;
                      
                      return (
                        <motion.div
                          key={firm.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-orange-500/50 transition-all duration-300 overflow-hidden"
                        >
                          {/* Collapsed View */}
                          <div className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4 flex-1">
                                <FirmLogo firm={firm} size="lg" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <h3 className="text-xl font-bold text-white hover:text-orange-400 transition-colors">{firm.name}</h3>
                                    {firm.rating >= 4.5 && (
                                      <span className="text-[10px] bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Flame size={10} /> HOT
                                      </span>
                                    )}
                                    {hasMultipleOffers && (
                                      <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Tag size={10} /> {promotions.length} Offers
                                      </span>
                                    )}
                                    {primaryPromotion?.discount && (
                                      <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                                        {primaryPromotion.discount}% OFF
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                                    <StarRating rating={firm.rating || 0} count={firm.reviewCount || 0} size="sm" />
                                    {firm.regulated && <BadgeCheck size={14} className="text-green-400" />}
                                    <span className="text-xs text-zinc-500">{firm.country || 'International'}</span>
                                    {firm.yearsInOperation && (
                                      <span className="text-xs text-zinc-500">{firm.yearsInOperation}+ years</span>
                                    )}
                                  </div>
                                  {/* Quick metrics in collapsed view */}
                                  <div className="grid grid-cols-4 gap-2 mt-3">
                                    <div className="bg-zinc-800/30 rounded-lg p-1.5 text-center">
                                      <div className="text-zinc-400 text-[8px]">Min Account</div>
                                      <div className="text-white font-semibold text-xs">{formatCurrency(minAccount)}</div>
                                    </div>
                                    <div className="bg-zinc-800/30 rounded-lg p-1.5 text-center">
                                      <div className="text-zinc-400 text-[8px]">Payout</div>
                                      <div className="text-white font-semibold text-xs">Up to {maxPayout}%</div>
                                    </div>
                                    <div className="bg-zinc-800/30 rounded-lg p-1.5 text-center">
                                      <div className="text-zinc-400 text-[8px]">Price</div>
                                      <div className="text-white font-semibold text-xs">{formatCurrency(minPrice)}</div>
                                    </div>
                                    <div className="bg-zinc-800/30 rounded-lg p-1.5 text-center">
                                      <div className="text-zinc-400 text-[8px]">Programs</div>
                                      <div className="text-white font-semibold text-xs">{firm.programs?.length || 0}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => setExpandedOffers(prev => ({ ...prev, [firm.id]: !prev[firm.id] }))}
                                className="ml-4 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors flex-shrink-0"
                              >
                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                              </button>
                            </div>
                            
                            {/* Collapsed Offers Summary */}
                            {!isExpanded && primaryPromotion && (
                              <div className="mt-3 pt-3 border-t border-zinc-800">
                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                  <Rocket size={12} className="text-orange-400" />
                                  <span className="font-medium text-white">{primaryPromotion.name || "Special Offer"}</span>
                                  {primaryPromotion.code && (
                                    <code className="text-[10px] font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-orange-400">
                                      {primaryPromotion.code}
                                    </code>
                                  )}
                                  {hasMultipleOffers && (
                                    <span className="text-[10px] text-zinc-500">+{additionalPromotions.length} more offers</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Expanded Content */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="border-t border-zinc-800"
                              >
                                <div className="p-6 bg-zinc-900/30 space-y-4">
                                  {/* Programs & Platforms */}
                                  <div className="flex flex-wrap gap-4">
                                    {programTypes.length > 0 && (
                                      <div>
                                        <div className="text-zinc-400 text-[10px] mb-1 flex items-center gap-1"><Layers size={10} /> Programs</div>
                                        <div className="flex flex-wrap gap-1">
                                          {programTypes.slice(0, 4).map((type: string, i: number) => (
                                            <span key={i} className="text-[9px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">{type}</span>
                                          ))}
                                          {programTypes.length > 4 && (
                                            <span className="text-[9px] text-zinc-500">+{programTypes.length - 4}</span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    {platforms.length > 0 && (
                                      <div>
                                        <div className="text-zinc-400 text-[10px] mb-1 flex items-center gap-1"><Monitor size={10} /> Platforms</div>
                                        <div className="flex flex-wrap gap-1">
                                          {platforms.slice(0, 4).map((p: string, i: number) => (
                                            <span key={i} className="text-[9px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">{p}</span>
                                          ))}
                                          {platforms.length > 4 && (
                                            <span className="text-[9px] text-zinc-500">+{platforms.length - 4}</span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* All Offers */}
                                  <div className="space-y-3">
                                    {/* Primary Offer */}
                                    {primaryPromotion && (
                                      <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Rocket size={14} className="text-orange-400" />
                                          <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">Featured Offer</span>
                                          {primaryPromotion.discount && (
                                            <span className="ml-auto text-sm font-bold text-green-400">{primaryPromotion.discount}% OFF</span>
                                          )}
                                        </div>
                                        <p className="text-white font-semibold text-base mb-1">{primaryPromotion.name || "Special Challenge Discount"}</p>
                                        {primaryPromotion.description && (
                                          <p className="text-xs text-zinc-400 mb-2">{primaryPromotion.description}</p>
                                        )}
                                        {primaryPromotion.code && (
                                          <div className="flex items-center gap-2">
                                            <code className="text-xs font-mono bg-zinc-800 px-2 py-1 rounded text-orange-400 border border-orange-500/30">
                                              {primaryPromotion.code}
                                            </code>
                                            <button 
                                              onClick={() => navigator.clipboard.writeText(primaryPromotion.code)}
                                              className="text-xs text-zinc-400 hover:text-orange-400 transition-colors flex items-center gap-1"
                                            >
                                              <Copy size={12} /> Copy
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Additional Offers */}
                                    {hasMultipleOffers && (
                                      <div className="space-y-2">
                                        <div className="text-xs text-zinc-500 font-medium">Additional Offers</div>
                                        {additionalPromotions.map((promo: any, idx: number) => (
                                          <div key={idx} className="p-3 rounded-lg bg-zinc-800/30 border border-zinc-700 hover:border-orange-500/30 transition-colors">
                                            <div className="flex items-center justify-between">
                                              <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                  <Tag size={10} className="text-zinc-500" />
                                                  <span className="text-white text-xs font-medium">{promo.name || "Additional Offer"}</span>
                                                  {promo.discount && (
                                                    <span className="text-xs font-bold text-green-400">{promo.discount}% OFF</span>
                                                  )}
                                                  {promo.amount && (
                                                    <span className="text-xs font-bold text-purple-400">{promo.amount}</span>
                                                  )}
                                                </div>
                                                {promo.description && (
                                                  <p className="text-[10px] text-zinc-400 mt-0.5">{promo.description}</p>
                                                )}
                                              </div>
                                              {promo.code && (
                                                <button 
                                                  onClick={() => navigator.clipboard.writeText(promo.code)}
                                                  className="text-xs text-zinc-400 hover:text-orange-400 transition-colors flex items-center gap-1 ml-2"
                                                >
                                                  <Copy size={10} /> Copy
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* CTA Buttons */}
                                  <div className="flex gap-3 pt-2 border-t border-zinc-800">
                                    <button
                                      onClick={() => window.open(firm.signupLink || firm.affiliateLink || '#', '_blank')}
                                      className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:from-orange-500 hover:to-red-500 transition-all shadow-lg flex items-center justify-center gap-2"
                                    >
                                      Claim Offer <ArrowRight size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleNavigate(firm.id, firm.name)}
                                      className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white border border-zinc-700 hover:border-orange-500/50 transition-colors"
                                    >
                                      Details
                                    </button>
                                  </div>

                                  {/* Quick Features */}
                                  <div className="flex justify-between text-xs text-zinc-500">
                                    <div className="flex items-center gap-1">
                                      <CheckCircle size={12} className="text-green-500" />
                                      <span>Instant Access</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock size={12} className="text-blue-500" />
                                      <span>24/7 Support</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Award size={12} className="text-purple-500" />
                                      <span>Scaling Plan</span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                    
                    {/* Offers Pagination */}
                    {offersTotalPages > 1 && (
                      <div className="flex justify-center gap-2 mt-6">
                        <button disabled={offersPage === 1} onClick={() => setOffersPage(p => p - 1)} className="px-4 py-2 rounded-xl text-sm text-zinc-400 disabled:opacity-50 hover:text-white border border-zinc-800 hover:border-orange-500/50 transition-all">Previous</button>
                        {Array.from({ length: Math.min(5, offersTotalPages) }, (_, i) => i + Math.max(1, offersPage - 2)).filter(p => p <= offersTotalPages).map(p => (
                          <button key={p} onClick={() => setOffersPage(p)} className={`px-3 py-2 rounded-xl text-sm transition-all ${p === offersPage ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white border border-zinc-800 hover:border-orange-500/50'}`}>{p}</button>
                        ))}
                        <button disabled={offersPage === offersTotalPages} onClick={() => setOffersPage(p => p + 1)} className="px-4 py-2 rounded-xl text-sm text-zinc-400 disabled:opacity-50 hover:text-white border border-zinc-800 hover:border-orange-500/50 transition-all">Next</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ==================== RULES TAB - EXPANDABLE CARDS ==================== */}
            {activeTab === "rules" && (
              <div className="space-y-4">
                {/* Rules Header with Search */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                      <ScaleIcon size={18} className="text-purple-400" />
                      Challenge Rules
                    </h3>
                    <p className="text-xs text-zinc-500">{filteredRulesFirms.length} firms with challenge programs</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                    <input
                      type="text"
                      placeholder="Search rules..."
                      value={rulesSearch}
                      onChange={(e) => { setRulesSearch(e.target.value); setRulesPage(1); }}
                      className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {filteredRulesFirms.length === 0 ? (
                  <div className="text-center py-12 bg-zinc-900/30 rounded-xl border border-zinc-800">
                    <ScaleIcon size={48} className="text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Rules Found</h3>
                    <p className="text-zinc-400">No challenge programs available at the moment.</p>
                  </div>
                ) : (
                  <>
                    {paginatedRulesFirms.map((firm) => {
                      const isExpanded = expandedRules[firm.id] || false;
                      
                      return (
                        <div key={firm.id} className="bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-purple-500/30 transition-all overflow-hidden">
                          {/* Collapsed View */}
                          <div className="p-5">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <FirmLogo firm={firm} size="md" />
                                <div>
                                  <h3 className="text-white font-semibold text-lg">{firm.name}</h3>
                                  <StarRating rating={firm.rating || 0} count={firm.reviewCount || 0} size="sm" />
                                </div>
                              </div>
                              <button
                                onClick={() => setExpandedRules(prev => ({ ...prev, [firm.id]: !prev[firm.id] }))}
                                className="ml-4 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors flex-shrink-0"
                              >
                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                              </button>
                            </div>
                            
                            {/* Collapsed Summary */}
                            {!isExpanded && firm.programs && firm.programs.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-zinc-800">
                                <div className="flex flex-wrap gap-2">
                                  {firm.programs.slice(0, 3).map((program: any, idx: number) => (
                                    <span key={idx} className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                                      {program.type}
                                    </span>
                                  ))}
                                  {firm.programs.length > 3 && (
                                    <span className="text-[10px] text-zinc-500">+{firm.programs.length - 3} more</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Expanded Content */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="border-t border-zinc-800"
                              >
                                <div className="p-5 bg-zinc-900/30 space-y-4">
                                  {firm.programs && firm.programs.map((program: any, idx: number) => {
                                    const options = program.accountOptions || [];
                                    const maxPayout = options.length > 0 ? Math.max(...options.map((o: any) => o.payoutPercentage || 0)) : 0;
                                    
                                    return (
                                      <div key={idx} className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700">
                                        <div className="flex flex-wrap justify-between items-center mb-3">
                                          <h4 className="text-white font-medium text-base">{program.type}</h4>
                                          <div className="flex gap-2">
                                            <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                                              {options.length} options
                                            </span>
                                            <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                                              Up to {maxPayout}%
                                            </span>
                                          </div>
                                        </div>
                                        
                                        {program.description && (
                                          <p className="text-xs text-zinc-400 mb-3">{program.description}</p>
                                        )}
                                        
                                        {/* Rules Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                          <div className="bg-zinc-900/50 rounded-lg p-2 text-center">
                                            <div className="text-zinc-500">Profit Target</div>
                                            <div className="text-white font-medium">{formatProfitTarget(program.rules?.profitTarget)}</div>
                                          </div>
                                          <div className="bg-zinc-900/50 rounded-lg p-2 text-center">
                                            <div className="text-zinc-500">Max Drawdown</div>
                                            <div className="text-white font-medium">{program.rules?.maxDrawdown || 0}%</div>
                                          </div>
                                          <div className="bg-zinc-900/50 rounded-lg p-2 text-center">
                                            <div className="text-zinc-500">Daily Drawdown</div>
                                            <div className="text-white font-medium">{program.rules?.dailyDrawdown || 0}%</div>
                                          </div>
                                          <div className="bg-zinc-900/50 rounded-lg p-2 text-center">
                                            <div className="text-zinc-500">Min Days</div>
                                            <div className="text-white font-medium">{program.rules?.minTradingDays || 0}</div>
                                          </div>
                                          <div className="bg-zinc-900/50 rounded-lg p-2 text-center">
                                            <div className="text-zinc-500">Weekend Holding</div>
                                            <div className="text-white font-medium">{program.rules?.weekendHolding ? '✅ Allowed' : '❌ Not Allowed'}</div>
                                          </div>
                                          <div className="bg-zinc-900/50 rounded-lg p-2 text-center">
                                            <div className="text-zinc-500">EA Trading</div>
                                            <div className="text-white font-medium">{program.rules?.eaTrading ? '✅ Allowed' : '❌ Not Allowed'}</div>
                                          </div>
                                          <div className="bg-zinc-900/50 rounded-lg p-2 text-center">
                                            <div className="text-zinc-500">News Trading</div>
                                            <div className="text-white font-medium">{program.rules?.newsTrading || 'Allowed'}</div>
                                          </div>
                                          <div className="bg-zinc-900/50 rounded-lg p-2 text-center">
                                            <div className="text-zinc-500">Consistency Rule</div>
                                            <div className="text-white font-medium">{program.rules?.consistencyRule || 'None'}</div>
                                          </div>
                                        </div>

                                        {/* Account Options */}
                                        {options.length > 0 && (
                                          <div className="mt-3 pt-3 border-t border-zinc-700">
                                            <div className="text-zinc-400 text-xs mb-2">Account Options</div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                              {options.slice(0, 4).map((option: any, oi: number) => (
                                                <div key={oi} className="bg-zinc-900/50 rounded-lg p-2 text-center">
                                                  {option.popular && (
                                                    <span className="text-[8px] bg-yellow-500/20 text-yellow-400 px-1 py-0.5 rounded-full">Popular</span>
                                                  )}
                                                  <div className="text-white font-semibold text-sm">{formatCurrency(option.accountSize)}</div>
                                                  <div className="text-xs text-zinc-400">{formatCurrency(option.price)}</div>
                                                  <div className="text-[10px] text-green-400">{option.payoutPercentage || 0}% split</div>
                                                </div>
                                              ))}
                                              {options.length > 4 && (
                                                <div className="bg-zinc-900/50 rounded-lg p-2 text-center flex items-center justify-center">
                                                  <span className="text-xs text-zinc-500">+{options.length - 4} more</span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}

                                        {/* News Trading Restrictions */}
                                        {firm.newsTradingRestrictions && (
                                          <div className="mt-3 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                            <div className="flex items-start gap-2">
                                              <AlertCircle size={12} className="text-yellow-400 mt-0.5" />
                                              <span className="text-[10px] text-zinc-300">{firm.newsTradingRestrictions}</span>
                                            </div>
                                          </div>
                                        )}

                                        {/* Prohibited Strategies */}
                                        {firm.prohibitedStrategies?.length > 0 && (
                                          <div className="mt-3 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                                            <div className="flex items-start gap-2">
                                              <AlertTriangle size={12} className="text-red-400 mt-0.5" />
                                              <div>
                                                <span className="text-[10px] font-semibold text-red-400">Prohibited Strategies:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                  {firm.prohibitedStrategies.slice(0, 4).map((strategy: string, i: number) => (
                                                    <span key={i} className="text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">{strategy}</span>
                                                  ))}
                                                  {firm.prohibitedStrategies.length > 4 && (
                                                    <span className="text-[8px] text-zinc-500">+{firm.prohibitedStrategies.length - 4}</span>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                        {/* Start Button */}
                                        <div className="mt-3 pt-3 border-t border-zinc-700 flex justify-end">
                                          <ProgramCTA href={firm.signupLink || firm.website || '#'} text={`Start ${program.type}`} size="md" />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                    
                    {/* Rules Pagination */}
                    {rulesTotalPages > 1 && (
                      <div className="flex justify-center gap-2 mt-6">
                        <button disabled={rulesPage === 1} onClick={() => setRulesPage(p => p - 1)} className="px-4 py-2 rounded-xl text-sm text-zinc-400 disabled:opacity-50 hover:text-white border border-zinc-800 hover:border-purple-500/50 transition-all">Previous</button>
                        {Array.from({ length: Math.min(5, rulesTotalPages) }, (_, i) => i + Math.max(1, rulesPage - 2)).filter(p => p <= rulesTotalPages).map(p => (
                          <button key={p} onClick={() => setRulesPage(p)} className={`px-3 py-2 rounded-xl text-sm transition-all ${p === rulesPage ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white border border-zinc-800 hover:border-purple-500/50'}`}>{p}</button>
                        ))}
                        <button disabled={rulesPage === rulesTotalPages} onClick={() => setRulesPage(p => p + 1)} className="px-4 py-2 rounded-xl text-sm text-zinc-400 disabled:opacity-50 hover:text-white border border-zinc-800 hover:border-purple-500/50 transition-all">Next</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "reviews" && <ReviewsTab />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-zinc-800/50 py-10 px-6 mt-6 bg-gradient-to-t from-zinc-900/30 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3"><MessageCircle size={16} className="text-purple-400" /><p className="text-zinc-500 text-sm">Share your funded trading experience</p></div>
          <div className="flex gap-3 justify-center">
            <Link href="/reviews" className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center gap-2 font-medium"><Star size={14} /> Write a review</Link>
            <Link href="/reviews?tab=incidents" className="px-5 py-2.5 bg-zinc-800/80 text-zinc-300 text-sm rounded-xl hover:bg-zinc-700 transition-all flex items-center gap-2 font-medium border border-zinc-700"><AlertTriangle size={14} /> Report incident</Link>
          </div>
          <p className="text-xs text-zinc-600 mt-4">Data is community-reported + verified by our team</p>
        </div>
      </div>
    </div>
  );
}