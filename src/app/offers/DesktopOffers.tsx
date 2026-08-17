// src/app/DesktopOffers.tsx - FULLY UPDATED (Removed Region Banner + Fixed Search)

'use client';

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useRegion } from "@/contexts/RegionContext";
import { formatCurrency } from "@/utils/api-helpers";
import { 
  Star, Gift, Zap, TrendingUp, Search, Copy, ArrowRight, X, 
  Sparkles, Rocket, Users, Award, DollarSign, Target, 
  BarChart3, CheckCircle2, Clock, Eye, Filter, Percent, 
  Wallet, Crown, Gem, Flame, Shield, Tag, Timer, 
  ChevronRight, CircleDollarSign, BadgePercent, Calendar, Bell,
  ChevronDown, ChevronUp, Monitor, Building2, Globe,
  BadgeCheck, BookOpen, Layers, Briefcase
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
function StarRating({ rating, reviewCount = 0, size = "sm" }: { rating: number; reviewCount?: number; size?: "sm" | "md" }) {
  const sizes = { sm: "w-4 h-4", md: "w-5 h-5" };
  const hasReviews = reviewCount > 0;
  const displayRating = hasReviews ? Math.min(5, Math.max(0, rating || 0)) : 0;
  const roundedRating = Math.round(displayRating);

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`${sizes[size]} ${i <= roundedRating && hasReviews ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}`} />
        ))}
      </div>
      {hasReviews ? (
        <>
          <span className="text-sm text-white ml-1">{displayRating.toFixed(1)}</span>
          <span className="text-xs text-zinc-400 ml-1">({reviewCount})</span>
        </>
      ) : (
        <span className="text-xs text-zinc-500 ml-1">No reviews</span>
      )}
    </div>
  );
}

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

// Helper functions
const getAllAccountOptions = (firm: any) => {
  if (!firm || !firm.programs) return [];
  return firm.programs.flatMap((program: any) => program.accountOptions || []);
};

const getMaxPayout = (firm: any) => {
  const accountOptions = getAllAccountOptions(firm);
  if (accountOptions.length === 0) return 0;
  return Math.max(...accountOptions.map((acc: any) => acc.payoutPercentage || acc.payout));
};

const getMinAccountSize = (firm: any) => {
  const accountOptions = getAllAccountOptions(firm);
  if (accountOptions.length === 0) return 0;
  return Math.min(...accountOptions.map((acc: any) => acc.accountSize));
};

const getMinPrice = (firm: any) => {
  const allOptions = getAllAccountOptions(firm);
  if (allOptions.length === 0) return 0;
  return Math.min(...allOptions.map((opt: any) => opt.price || 0));
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
  GLOBAL: { label: 'Global', flag: '🌍' },
};

// ===================== OFFER CARD - LONG FORMAT WITH LOGOS =====================
function OfferCard({ firm, type, onNavigate }: { firm: any; type: 'prop' | 'broker'; onNavigate: (id: number, name: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const isProp = type === 'prop';
  const allOffers = isProp 
    ? (firm.promotions || [])
    : [...(firm.bonuses || []), ...(firm.promotions || [])];
  
  const primaryOffer = allOffers[0];
  const additionalOffers = allOffers.slice(1);
  const hasMultipleOffers = additionalOffers.length > 0;
  
  const maxPayout = isProp ? getMaxPayout(firm) : null;
  const minPrice = isProp ? getMinPrice(firm) : null;
  const minAccount = isProp ? getMinAccountSize(firm) : null;

  const handleCopy = (id: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Platform display
  const platforms = isProp ? (firm.platforms || firm.platform || []) : (firm.platforms || firm.platform || []);
  
  // Program types for prop firms
  const programTypes = isProp && firm.programs ? firm.programs.map((p: any) => p.type) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`group bg-zinc-900 rounded-2xl border ${isProp ? 'border-orange-500/30 hover:border-orange-500/60' : 'border-purple-500/30 hover:border-purple-500/60'} transition-all duration-300 overflow-hidden`}
    >
      <div className="p-6">
        {/* Header with Logo and Basic Info */}
        <div className="flex items-start gap-4 mb-4">
          <FirmLogo firm={firm} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">
                {firm.name}
              </h3>
              {isProp && firm.regulated && (
                <BadgeCheck size={16} className="text-green-400" />
              )}
              {!isProp && firm.regulated && (
                <BadgeCheck size={16} className="text-green-400" />
              )}
              {firm.rating >= 4.5 && (
                <span className="text-[10px] bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Flame size={10} /> Top Rated
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <StarRating rating={firm.rating || 0} reviewCount={firm.reviewCount || firm.reviews || 0} size="sm" />
              <div className="flex items-center gap-1 text-zinc-400">
                <Globe size={12} />
                <span className="text-xs">{firm.country || 'International'}</span>
              </div>
              {firm.yearsInOperation && (
                <div className="flex items-center gap-1 text-zinc-400">
                  <Clock size={12} />
                  <span className="text-xs">{firm.yearsInOperation}+ years</span>
                </div>
              )}
              {hasMultipleOffers && (
                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Tag size={10} /> {allOffers.length} Offers
                </span>
              )}
            </div>
          </div>
          {primaryOffer?.discount && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1 whitespace-nowrap">
              <Percent size={14} />
              {primaryOffer.discount}% OFF
            </div>
          )}
          {!isProp && primaryOffer?.amount && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1 whitespace-nowrap">
              <Gift size={14} />
              {primaryOffer.amount}
            </div>
          )}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {isProp ? (
            <>
              <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                <div className="text-zinc-400 text-xs">Max Payout</div>
                <div className="text-white font-semibold text-lg">Up to {maxPayout}%</div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                <div className="text-zinc-400 text-xs">Min Account</div>
                <div className="text-white font-semibold text-lg">{formatCurrency(minAccount)}</div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                <div className="text-zinc-400 text-xs">Starting Price</div>
                <div className="text-white font-semibold text-lg">{formatCurrency(minPrice)}</div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                <div className="text-zinc-400 text-xs">Programs</div>
                <div className="text-white font-semibold text-lg">{firm.programs?.length || 0}</div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                <div className="text-zinc-400 text-xs">Min Deposit</div>
                <div className="text-white font-semibold text-lg">{formatCurrency(firm.minDeposit || 0)}</div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                <div className="text-zinc-400 text-xs">Leverage</div>
                <div className="text-white font-semibold text-lg">{firm.leverage || '1:100'}</div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                <div className="text-zinc-400 text-xs">EURUSD Spread</div>
                <div className="text-white font-semibold text-lg">{firm.spreads?.eurusd?.split('-')[0]?.trim() || '0.1'} pips</div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                <div className="text-zinc-400 text-xs">Platforms</div>
                <div className="text-white font-semibold text-lg">{platforms.length}</div>
              </div>
            </>
          )}
        </div>

        {/* Programs/Platforms Section */}
        <div className="flex flex-wrap gap-4 mb-4">
          {isProp && programTypes.length > 0 && (
            <div className="flex-1 min-w-[200px]">
              <div className="text-zinc-400 text-xs mb-1 flex items-center gap-1">
                <Layers size={12} /> Available Programs
              </div>
              <div className="flex flex-wrap gap-1.5">
                {programTypes.slice(0, 4).map((type: string, idx: number) => (
                  <span key={idx} className="text-xs bg-zinc-800/80 text-zinc-300 px-2.5 py-1 rounded-full border border-zinc-700">
                    {type}
                  </span>
                ))}
                {programTypes.length > 4 && (
                  <span className="text-xs text-zinc-500">+{programTypes.length - 4} more</span>
                )}
              </div>
            </div>
          )}
          
          {platforms.length > 0 && (
            <div className="flex-1 min-w-[150px]">
              <div className="text-zinc-400 text-xs mb-1 flex items-center gap-1">
                <Monitor size={12} /> Platforms
              </div>
              <div className="flex flex-wrap gap-1.5">
                {platforms.slice(0, 3).map((p: string, idx: number) => (
                  <span key={idx} className="text-xs bg-zinc-800/80 text-zinc-300 px-2.5 py-1 rounded-full border border-zinc-700">
                    {p}
                  </span>
                ))}
                {platforms.length > 3 && (
                  <span className="text-xs text-zinc-500">+{platforms.length - 3}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Offers Section - Integrated with expandable */}
        <div className="space-y-3">
          {/* Primary Offer */}
          {primaryOffer && (
            <div className={`p-3 rounded-lg ${isProp ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-purple-500/10 border border-purple-500/30'}`}>
              <div className="flex items-center gap-2 mb-1">
                {isProp ? (
                  <Rocket size={14} className="text-orange-400" />
                ) : (
                  <Gift size={14} className="text-purple-400" />
                )}
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  {hasMultipleOffers ? "Featured Offer" : "Active Offer"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-white font-medium">
                  {primaryOffer.name || primaryOffer.amount || (isProp ? "Challenge Discount" : "Welcome Bonus")}
                </span>
                {primaryOffer.code && (
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono bg-zinc-800 px-2 py-1 rounded text-orange-400 border border-orange-500/30">
                      {primaryOffer.code}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(primaryOffer.code);
                        setCopiedId("primary");
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      className="text-xs text-zinc-400 hover:text-orange-400 transition-colors flex items-center gap-1"
                    >
                      {copiedId === "primary" ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                      {copiedId === "primary" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Expandable Additional Offers */}
          {hasMultipleOffers && (
            <div>
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {expanded ? "Hide" : `View ${additionalOffers.length} more ${additionalOffers.length === 1 ? 'offer' : 'offers'}`}
              </button>
              
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 space-y-2 overflow-hidden"
                  >
                    {additionalOffers.map((offer: any, idx: number) => (
                      <div key={idx} className={`p-2.5 rounded-lg ${isProp ? 'bg-zinc-800/50 border border-zinc-700' : 'bg-zinc-800/50 border border-zinc-700'}`}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {offer.discount && (
                                <span className="text-sm font-bold text-green-400">{offer.discount}% OFF</span>
                              )}
                              {offer.amount && (
                                <span className="text-sm font-bold text-purple-400">{offer.amount}</span>
                              )}
                              {offer.name && !offer.discount && !offer.amount && (
                                <span className="text-sm text-white">{offer.name}</span>
                              )}
                            </div>
                            {offer.description && (
                              <p className="text-xs text-zinc-400 mt-0.5">{offer.description}</p>
                            )}
                          </div>
                          {offer.code && (
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <code className="text-[10px] font-mono bg-zinc-900 px-2 py-1 rounded text-orange-400 border border-orange-500/30">
                                {offer.code}
                              </code>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(offer.code);
                                  const id = `offer-${idx}`;
                                  setCopiedId(id);
                                  setTimeout(() => setCopiedId(null), 2000);
                                }}
                                className="text-zinc-400 hover:text-orange-400 transition-colors"
                              >
                                {copiedId === `offer-${idx}` ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-3 mt-4 pt-4 border-t border-zinc-800">
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(firm.signupLink || firm.website || firm.affiliateLink || '#', '_blank');
            }}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
              isProp 
                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
            }`}
          >
            {isProp ? 'Claim Challenge' : 'Claim Bonus'}
            <ArrowRight size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(firm.id, firm.name);
            }}
            className="px-5 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-white border border-zinc-700 hover:border-orange-500/50 transition-colors"
          >
            Details
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function DesktopOffers() {
  const router = useRouter();
  const { region } = useRegion();
  
  const [activeTab, setActiveTab] = useState<"prop" | "broker">("prop");
  const [search, setSearch] = useState("");
  const [brokersData, setBrokersData] = useState<any[]>([]);
  const [propFirmsData, setPropFirmsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("discount-desc");
  const [showFilters, setShowFilters] = useState(false);
  const [minDiscount, setMinDiscount] = useState("");

  // Get region info for display
  const regionInfo = REGION_DISPLAY[region] || REGION_DISPLAY['GLOBAL'];

  // Fetch data with region filtering
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
        console.error('Failed to load offers data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [region]);

  // ✅ FIXED: Filter firms with active offers (region-aware)
  const propFirmsWithOffers = propFirmsData.filter(firm => {
    if (!firm.promotions || firm.promotions.length === 0) return false;
    
    // Check if firm is available in current region
    if (firm.regions) {
      return firm.regions.includes(region) || 
             firm.regions.includes('GLOBAL') ||
             firm.regions.length === 0;
    }
    if (firm.region) {
      return firm.region === region || firm.region === 'GLOBAL';
    }
    return true;
  });
  
  const brokersWithOffers = brokersData.filter(broker => {
    const hasOffer = (broker.bonuses && broker.bonuses.length > 0) || 
                     (broker.promotions && broker.promotions.length > 0);
    if (!hasOffer) return false;
    
    // Check if broker is available in current region
    if (broker.regions) {
      return broker.regions.includes(region) || 
             broker.regions.includes('GLOBAL') ||
             broker.regions.length === 0;
    }
    if (broker.region) {
      return broker.region === region || broker.region === 'GLOBAL';
    }
    return true;
  });

  // Filter and sort logic
  const filteredPropFirms = useMemo(() => {
    let filtered = [...propFirmsWithOffers];
    
    if (search) {
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (minDiscount) {
      filtered = filtered.filter(f => {
        const discount = f.promotions?.[0]?.discount || 0;
        return discount >= Number(minDiscount);
      });
    }
    
    filtered.sort((a, b) => {
      const discountA = a.promotions?.[0]?.discount || 0;
      const discountB = b.promotions?.[0]?.discount || 0;
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      
      switch (sortBy) {
        case "discount-desc": return discountB - discountA;
        case "rating-desc": return ratingB - ratingA;
        default: return discountB - discountA;
      }
    });
    
    return filtered;
  }, [propFirmsWithOffers, search, sortBy, minDiscount]);

  const filteredBrokers = useMemo(() => {
    let filtered = [...brokersWithOffers];
    
    if (search) {
      filtered = filtered.filter(b => 
        b.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    filtered.sort((a, b) => {
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      
      switch (sortBy) {
        case "rating-desc": return ratingB - ratingA;
        default: return ratingB - ratingA;
      }
    });
    
    return filtered;
  }, [brokersWithOffers, search, sortBy]);

  const handleNavigate = (id: number, name: string) => {
    router.push(`/${activeTab === 'prop' ? 'prop-firms' : 'brokers'}/${id}`);
  };

  const totalActiveOffers = propFirmsWithOffers.reduce((sum, f) => sum + (f.promotions?.length || 0), 0) + 
                           brokersWithOffers.reduce((sum, b) => sum + ((b.bonuses?.length || 0) + (b.promotions?.length || 0)), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-zinc-500">Loading exclusive offers...</p>
        </div>
      </div>
    );
  }

  // ✅ IMPROVED: Show empty state with region suggestions
  if (propFirmsWithOffers.length === 0 && brokersWithOffers.length === 0) {
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
          <Gift size={48} className="text-zinc-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No offers in {regionInfo.flag} {regionInfo.label}</h2>
          <p className="text-zinc-400 mb-6">
            We don't have any active offers available in {regionInfo.flag} {regionInfo.label} yet.
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
              View All Global Offers
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

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={20} className="text-orange-400" />
              <span className="text-sm text-orange-400 font-medium">{totalActiveOffers} Active Offers</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Exclusive Trading <span className="bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">Offers</span>
            </h1>
            <p className="text-zinc-400 mt-2">Get the best deals on prop firm challenges and broker bonuses available in your region</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input
              type="text"
              placeholder="Search offers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs with counts */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("prop")}
            className={`px-5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === "prop"
                ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                : "bg-zinc-800/50 text-zinc-400 hover:text-white"
            }`}
          >
            <Rocket size={16} />
            Prop Firm Offers
            {propFirmsWithOffers.length > 0 && (
              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">{propFirmsWithOffers.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("broker")}
            className={`px-5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === "broker"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                : "bg-zinc-800/50 text-zinc-400 hover:text-white"
            }`}
          >
            <Gift size={16} />
            Broker Bonuses
            {brokersWithOffers.length > 0 && (
              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">{brokersWithOffers.length}</span>
            )}
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {activeTab === "prop" && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/50 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
              >
                <Filter size={14} />
                Filters
                {minDiscount && <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />}
              </button>
            )}
            <span className="text-xs text-zinc-500">
              {activeTab === "prop" ? filteredPropFirms.length : filteredBrokers.length} firms with offers
            </span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-500"
          >
            {activeTab === "prop" ? (
              <>
                <option value="discount-desc">Highest Discount</option>
                <option value="rating-desc">Highest Rated</option>
              </>
            ) : (
              <>
                <option value="rating-desc">Highest Rated</option>
              </>
            )}
          </select>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && activeTab === "prop" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-zinc-900/50 rounded-xl p-4 border border-zinc-800 overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-zinc-500 block mb-1">Min Discount (%)</label>
                  <select
                    value={minDiscount}
                    onChange={(e) => setMinDiscount(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Any Discount</option>
                    <option value="10">10% or more</option>
                    <option value="20">20% or more</option>
                    <option value="30">30% or more</option>
                    <option value="40">40% or more</option>
                    <option value="50">50% or more</option>
                  </select>
                </div>
                <button
                  onClick={() => setMinDiscount("")}
                  className="mt-5 text-xs text-zinc-500 hover:text-white"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Offers Grid - Cards with Logos */}
        <div className="space-y-4">
          {activeTab === "prop" ? (
            filteredPropFirms.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-zinc-800/50 rounded-full flex items-center justify-center">
                  <Percent size={24} className="text-zinc-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">No Prop Firm Offers</h3>
                <p className="text-zinc-400 text-sm">No active promotions at the moment. Check back soon!</p>
              </div>
            ) : (
              filteredPropFirms.map((firm) => (
                <OfferCard key={firm.id} firm={firm} type="prop" onNavigate={handleNavigate} />
              ))
            )
          ) : (
            filteredBrokers.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-zinc-800/50 rounded-full flex items-center justify-center">
                  <Gift size={24} className="text-zinc-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">No Broker Bonuses</h3>
                <p className="text-zinc-400 text-sm">No active bonuses at the moment. Check back soon!</p>
              </div>
            ) : (
              filteredBrokers.map((broker) => (
                <OfferCard key={broker.id} firm={broker} type="broker" onNavigate={handleNavigate} />
              ))
            )
          )}
        </div>

        {/* Newsletter CTA - Subtle */}
        <div className="mt-12 p-5 rounded-xl bg-gradient-to-r from-orange-500/5 to-purple-500/5 border border-zinc-800 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Bell size={18} className="text-orange-400" />
            <span className="text-sm font-medium text-white">Get notified of new offers</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-orange-500"
            />
            <button className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg text-sm font-medium hover:from-orange-500 hover:to-red-500 transition-all">
              Notify Me
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}