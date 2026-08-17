'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRegion } from "@/contexts/RegionContext";
import { 
  Gift, Zap, Star, Clock, ShieldCheck, Search, ExternalLink, 
  ArrowRight, Eye, Sparkles, Flame, Crown, Tag, Percent, 
  DollarSign, Calendar, Copy, CheckCircle, X, TrendingUp,
  Wallet, Rocket, Award, Gem, Bell, ChevronLeft, ChevronRight,
  Grid3x3, Layers, TrendingDown, Clock as ClockIcon,
  Shield, Coffee, Users, Building2, Heart, BadgeDollarSign,
  ChevronDown, ChevronUp, Info, Filter, Monitor, Globe,
  BadgeCheck, Gauge, Landmark, Banknote, Zap as Lightning
} from "lucide-react";
import { api } from "@/lib/api";
import { slugify } from "@/lib/slugify";
import Link from "next/link";

// ===================== LOGO COMPONENT =====================
function FirmLogo({ firm, size = "sm" }: { firm: any; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-10 h-10 rounded-xl text-sm",
    md: "w-12 h-12 rounded-xl text-base",
    lg: "w-14 h-14 rounded-xl text-lg"
  };
  
  const firmObj = typeof firm === 'string' ? { name: firm } : firm;
  
  if (firmObj.logo) {
    return (
      <div className={`${sizeClasses[size]} overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0 shadow-lg`}>
        <img 
          src={firmObj.logo} 
          alt={firmObj.name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const fallback = document.createElement('div');
              fallback.className = `${sizeClasses[size]} bg-gradient-to-r ${generateGradient(firmObj.name)} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`;
              fallback.textContent = firmObj.name?.charAt(0) || '?';
              parent.appendChild(fallback);
            }
          }}
        />
      </div>
    );
  }
  
  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-r ${generateGradient(firmObj.name)} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`}>
      {firmObj.name?.charAt(0) || '?'}
    </div>
  );
}

const generateGradient = (name: string) => {
  const gradients = [
    "from-pink-500 to-purple-500", "from-blue-500 to-purple-500", 
    "from-green-500 to-blue-500", "from-yellow-500 to-orange-500",
    "from-red-500 to-pink-500", "from-indigo-500 to-blue-500",
    "from-teal-500 to-green-500", "from-orange-500 to-red-500"
  ];
  return gradients[(name?.length || 0) % gradients.length];
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

// Helper function to get category label
function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    nodeposit: "No Deposit",
    "deposit-100": "100%+ Match",
    "deposit-50": "50-99% Match",
    deposit: "Deposit Bonus",
    cashback: "Cashback",
    lowspread: "Low Spread",
    fastwithdrawal: "Fast WD",
    highleverage: "High Leverage",
    demoaccount: "Demo Account",
    other: "Offer"
  };
  return labels[category] || "Offer";
}

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    nodeposit: "bg-green-500/20 text-green-400 border-green-500/30",
    "deposit-100": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "deposit-50": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    deposit: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    cashback: "bg-red-500/20 text-red-400 border-red-500/30",
    lowspread: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    fastwithdrawal: "bg-teal-500/20 text-teal-400 border-teal-500/30",
    highleverage: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    demoaccount: "bg-blue-400/20 text-blue-400 border-blue-400/30",
    other: "bg-zinc-700/30 text-zinc-400 border-zinc-600/30"
  };
  return colors[category] || "bg-zinc-700/30 text-zinc-400 border-zinc-600/30";
}

// Category definitions
const categories = [
  { id: "all", label: "All Offers", icon: Gift, color: "from-purple-500 to-pink-500" },
  { id: "nodeposit", label: "No Deposit", icon: Coffee, color: "from-green-500 to-emerald-500", badge: "🔥 FREE" },
  { id: "deposit-100", label: "100%+ Match", icon: Percent, color: "from-yellow-500 to-orange-500", badge: "BEST VALUE" },
  { id: "highleverage", label: "High Leverage", icon: Gauge, color: "from-orange-500 to-red-500", badge: "500:1+" },
  { id: "lowspread", label: "Low Spread", icon: TrendingDown, color: "from-cyan-500 to-blue-500" },
  { id: "fastwithdrawal", label: "Fast WD", icon: Lightning, color: "from-teal-500 to-green-500" },
  { id: "deposit", label: "Deposit Bonus", icon: DollarSign, color: "from-purple-500 to-indigo-500" },
  { id: "cashback", label: "Cashback", icon: Shield, color: "from-red-500 to-orange-500" },
  { id: "demoaccount", label: "Demo Account", icon: Monitor, color: "from-blue-400 to-cyan-400" },
];

export default function BonusesTab() {
  const { region } = useRegion();
  const [brokersData, setBrokersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedBonus, setExpandedBonus] = useState<Record<number, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const itemsPerPage = 6;

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

  // Enhanced categorization - detects more offer types
  const categorizeBonus = (bonus: any, broker: any) => {
    const type = bonus.type?.toLowerCase() || '';
    const amount = bonus.amount?.toLowerCase() || '';
    const conditions = bonus.conditions?.toLowerCase() || '';
    
    // No Deposit Bonus
    if (type.includes('no deposit') || amount.includes('free') || conditions.includes('no deposit')) {
      return 'nodeposit';
    }
    
    // High Leverage (check broker leverage)
    if (broker.leverage) {
      const leverageNum = parseInt(String(broker.leverage).replace(/[^0-9]/g, ''));
      if (leverageNum >= 500) {
        if (type.includes('leverage') || conditions.includes('leverage') || amount.includes('leverage')) {
          return 'highleverage';
        }
      }
    }
    
    // Fast Withdrawal
    if (broker.withdrawalSpeed) {
      const speed = broker.withdrawalSpeed.toLowerCase();
      if (speed.includes('instant') || speed.includes('same day') || speed.includes('1 day')) {
        if (type.includes('withdrawal') || conditions.includes('withdrawal')) {
          return 'fastwithdrawal';
        }
      }
    }
    
    // Low Spread
    if (broker.spreads?.eurusd) {
      const spread = parseFloat(broker.spreads.eurusd.split('-')[0]?.trim());
      if (spread !== null && spread < 0.5) {
        if (type.includes('spread') || conditions.includes('spread')) {
          return 'lowspread';
        }
      }
    }
    
    // Demo Account
    if (broker.demoAccount === true) {
      if (type.includes('demo') || amount.includes('demo') || conditions.includes('demo')) {
        return 'demoaccount';
      }
    }
    
    // Cashback
    if (type.includes('cashback') || conditions.includes('cashback') || amount.includes('cashback')) {
      return 'cashback';
    }
    
    // Deposit Bonuses
    if (type.includes('welcome') || type.includes('deposit') || type.includes('match') || amount.includes('%')) {
      const match = amount.match(/(\d+)%/);
      if (match) {
        const percent = parseInt(match[1]);
        if (percent >= 100) return 'deposit-100';
        if (percent >= 50) return 'deposit-50';
        return 'deposit';
      }
      return 'deposit';
    }
    
    return 'other';
  };

  // Extract all bonuses with metadata
  const allBonuses = brokersData.flatMap((broker) =>
    (broker.bonuses || []).map((b: any, idx: number) => ({
      id: `${broker.id}-${idx}`,
      brokerId: broker.id,
      brokerName: broker.name,
      brokerLogo: broker.logo,
      brokerRating: broker.rating || 0,
      brokerReviews: broker.reviewsCount || broker.reviews || 0,
      brokerCountry: broker.country || 'International',
      brokerRegulated: broker.regulated,
      brokerSpread: broker.spreads?.eurusd || 'N/A',
      brokerWithdrawalSpeed: broker.withdrawalSpeed || 'N/A',
      brokerLeverage: broker.leverage || 'N/A',
      brokerDemoAccount: broker.demoAccount || false,
      affiliateLink: broker.affiliateLink || broker.signupLink || broker.website || '#',
      ...b,
      category: categorizeBonus(b, broker),
      percentValue: b.amount ? parseInt(b.amount.replace(/[^0-9]/g, '')) : 0
    }))
  ).filter(bonus => bonus.brokerName);

  // Filter bonuses by category and search
  const filteredBonuses = allBonuses
    .filter(b => selectedCategory === "all" || b.category === selectedCategory)
    .filter(b => b.brokerName.toLowerCase().includes(searchTerm.toLowerCase()));

  // Pagination
  const totalPages = Math.ceil(filteredBonuses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBonuses = filteredBonuses.slice(startIndex, startIndex + itemsPerPage);

  // Stats
  const noDepositBonuses = allBonuses.filter(b => b.category === 'nodeposit');
  const highLeverageBonuses = allBonuses.filter(b => b.category === 'highleverage');
  const lowSpreadBonuses = allBonuses.filter(b => b.category === 'lowspread');
  const totalBonuses = allBonuses.length;

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleExpand = (id: number) => {
    setExpandedBonus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          </div>
          <p className="mt-4 text-zinc-500 font-medium">Loading best offers...</p>
        </div>
      </div>
    );
  }

  // Show empty state with region suggestions if no bonuses in region
  if (allBonuses.length === 0) {
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
      <div className="text-center py-12 bg-zinc-900/30 rounded-xl border border-zinc-800">
        <Gift size={48} className="text-zinc-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No offers in this region</h3>
        <p className="text-zinc-400 mb-4">We don't have any active offers available in {regionInfo.flag} {regionInfo.label} yet.</p>
        
        <div className="bg-zinc-900/50 rounded-xl p-4 mb-4 max-w-sm mx-auto border border-zinc-800">
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
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all text-sm"
        >
          View All Global Offers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ❌ REGION BANNER REMOVED - Users select region in navbar */}

      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-400" />
            <span className="text-sm text-purple-400 font-medium">{totalBonuses} Active Offers</span>
          </div>
          <h3 className="text-xl font-bold text-white">
            Exclusive <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Trading Bonuses</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-1">No deposit bonuses, high leverage, low spreads & more</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-green-400">{noDepositBonuses.length}</div>
            <div className="text-[10px] text-zinc-500">No Deposit</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-orange-400">{highLeverageBonuses.length}</div>
            <div className="text-[10px] text-zinc-500">High Leverage</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-cyan-400">{lowSpreadBonuses.length}</div>
            <div className="text-[10px] text-zinc-500">Low Spread</div>
          </div>
          <div className="relative w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
            <input
              type="text"
              placeholder="Search offers..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          const count = cat.id === "all" ? totalBonuses : allBonuses.filter(b => b.category === cat.id).length;
          
          return (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                isActive 
                  ? `bg-gradient-to-r ${cat.color} text-white shadow-lg shadow-purple-500/20` 
                  : "bg-zinc-800/50 text-zinc-400 hover:text-white border border-zinc-700"
              }`}
            >
              <Icon size={14} />
              {cat.label}
              <span className={`text-xs ${isActive ? 'text-white/80' : 'text-zinc-500'}`}>({count})</span>
              {cat.badge && (
                <span className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">{cat.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
        <span className="text-sm text-zinc-500">{filteredBonuses.length} offers found</span>
      </div>

      {/* Bonus Cards */}
      {filteredBonuses.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/30 rounded-xl border border-zinc-800">
          <Gift size={48} className="text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No offers found</h3>
          <p className="text-zinc-400">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedBonuses.map((bonus, idx) => {
            const isExpanded = expandedBonus[bonus.brokerId] || false;
            
            return (
              <motion.div
                key={bonus.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-purple-500/50 transition-all duration-300 overflow-hidden group"
                onMouseEnter={() => setHoveredCard(bonus.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Collapsed View */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <FirmLogo firm={{ name: bonus.brokerName, logo: bonus.brokerLogo }} size="lg" />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-xl font-bold text-white hover:text-purple-400 transition-colors">
                            {bonus.brokerName}
                          </h3>
                          {bonus.brokerRating >= 4.5 && (
                            <span className="text-[10px] bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Flame size={10} /> HOT
                            </span>
                          )}
                          <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                            <Tag size={10} /> {bonus.amount}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <StarRating rating={bonus.brokerRating} count={bonus.brokerReviews} size="sm" />
                          {bonus.brokerRegulated && <BadgeCheck size={14} className="text-green-400" />}
                          <span className="text-xs text-zinc-500">{bonus.brokerCountry || 'International'}</span>
                        </div>
                        {/* Quick metrics in collapsed view */}
                        <div className="grid grid-cols-4 gap-2 mt-3">
                          <div className="bg-zinc-800/30 rounded-lg p-1.5 text-center">
                            <div className="text-zinc-400 text-[8px]">Bonus</div>
                            <div className="text-white font-semibold text-xs">{bonus.amount}</div>
                          </div>
                          <div className="bg-zinc-800/30 rounded-lg p-1.5 text-center">
                            <div className="text-zinc-400 text-[8px]">Min Deposit</div>
                            <div className="text-white font-semibold text-xs">${bonus.minDeposit || 0}</div>
                          </div>
                          <div className="bg-zinc-800/30 rounded-lg p-1.5 text-center">
                            <div className="text-zinc-400 text-[8px]">Leverage</div>
                            <div className="text-white font-semibold text-xs">{bonus.brokerLeverage || '—'}</div>
                          </div>
                          <div className="bg-zinc-800/30 rounded-lg p-1.5 text-center">
                            <div className="text-zinc-400 text-[8px]">Category</div>
                            <div className="text-white font-semibold text-xs">{getCategoryLabel(bonus.category)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleExpand(bonus.brokerId)}
                      className="ml-4 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors flex-shrink-0"
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                  
                  {/* Collapsed Bonus Summary */}
                  {!isExpanded && (
                    <div className="mt-3 pt-3 border-t border-zinc-800">
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Gift size={12} className="text-purple-400" />
                        <span className="font-medium text-white">{bonus.amount}</span>
                        {bonus.code && (
                          <code className="text-[10px] font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-purple-400">
                            {bonus.code}
                          </code>
                        )}
                        {bonus.discount && (
                          <span className="text-[10px] text-green-400">{bonus.discount}% OFF</span>
                        )}
                        {bonus.brokerLeverage && parseInt(String(bonus.brokerLeverage).replace(/[^0-9]/g, '')) >= 500 && (
                          <span className="text-[10px] text-orange-400">{bonus.brokerLeverage} Leverage</span>
                        )}
                        {bonus.brokerSpread && parseFloat(String(bonus.brokerSpread).split('-')[0]?.trim()) < 0.5 && (
                          <span className="text-[10px] text-cyan-400">Low Spread</span>
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
                        {/* Bonus Details */}
                        <div className="space-y-3">
                          {/* Primary Offer Detail */}
                          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                            <div className="flex items-center gap-2 mb-2">
                              <Gift size={14} className="text-purple-400" />
                              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Bonus Details</span>
                            </div>
                            <p className="text-white font-semibold text-base mb-1">{bonus.amount}</p>
                            {bonus.description && (
                              <p className="text-xs text-zinc-400 mb-2">{bonus.description}</p>
                            )}
                            {bonus.code && (
                              <div className="flex items-center gap-2">
                                <code className="text-xs font-mono bg-zinc-800 px-2 py-1 rounded text-purple-400 border border-purple-500/30">
                                  {bonus.code}
                                </code>
                                <button 
                                  onClick={(e) => handleCopyCode(bonus.code, e)}
                                  className="text-xs text-zinc-400 hover:text-purple-400 transition-colors flex items-center gap-1"
                                >
                                  <Copy size={12} /> Copy
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Bonus Features */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {bonus.minDeposit && (
                              <div className="bg-zinc-800/30 rounded-lg p-3 text-center">
                                <div className="text-zinc-400 text-[10px]">Min Deposit</div>
                                <div className="text-white font-semibold text-sm">${bonus.minDeposit}</div>
                              </div>
                            )}
                            {bonus.maxBonus && (
                              <div className="bg-zinc-800/30 rounded-lg p-3 text-center">
                                <div className="text-zinc-400 text-[10px]">Max Bonus</div>
                                <div className="text-white font-semibold text-sm">{bonus.maxBonus}</div>
                              </div>
                            )}
                            {bonus.brokerLeverage && (
                              <div className="bg-zinc-800/30 rounded-lg p-3 text-center">
                                <div className="text-zinc-400 text-[10px]">Leverage</div>
                                <div className="text-white font-semibold text-sm">{bonus.brokerLeverage}</div>
                              </div>
                            )}
                            {bonus.brokerSpread && bonus.brokerSpread !== 'N/A' && (
                              <div className="bg-zinc-800/30 rounded-lg p-3 text-center">
                                <div className="text-zinc-400 text-[10px]">Spread</div>
                                <div className="text-white font-semibold text-sm">{bonus.brokerSpread}</div>
                              </div>
                            )}
                            {bonus.brokerWithdrawalSpeed && bonus.brokerWithdrawalSpeed !== 'N/A' && (
                              <div className="bg-zinc-800/30 rounded-lg p-3 text-center">
                                <div className="text-zinc-400 text-[10px]">Withdrawal</div>
                                <div className="text-white font-semibold text-sm">{bonus.brokerWithdrawalSpeed}</div>
                              </div>
                            )}
                            {bonus.rollover && (
                              <div className="bg-zinc-800/30 rounded-lg p-3 text-center">
                                <div className="text-zinc-400 text-[10px]">Rollover</div>
                                <div className="text-white font-semibold text-sm">{bonus.rollover}x</div>
                              </div>
                            )}
                            {bonus.validUntil && (
                              <div className="bg-zinc-800/30 rounded-lg p-3 text-center">
                                <div className="text-zinc-400 text-[10px]">Valid Until</div>
                                <div className="text-white font-semibold text-sm">{new Date(bonus.validUntil).toLocaleDateString()}</div>
                              </div>
                            )}
                          </div>

                          {/* Terms & Conditions */}
                          {bonus.conditions && (
                            <div className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700">
                              <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
                                <Info size={10} /> Terms & Conditions
                              </div>
                              <p className="text-xs text-zinc-300">{bonus.conditions}</p>
                            </div>
                          )}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex gap-3 pt-2 border-t border-zinc-800">
                          <button
                            onClick={() => window.open(bonus.affiliateLink, '_blank')}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg flex items-center justify-center gap-2"
                          >
                            Claim Bonus <ArrowRight size={14} />
                          </button>
                          <Link
                            href={`/brokers/${slugify(bonus.brokerName)}`}
                            className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white border border-zinc-700 hover:border-purple-500/50 transition-colors"
                          >
                            Details
                          </Link>
                        </div>

                        {/* Quick Features */}
                        <div className="flex justify-between text-xs text-zinc-500">
                          <div className="flex items-center gap-1">
                            <CheckCircle size={12} className="text-green-500" />
                            <span>Verified Broker</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={12} className="text-blue-500" />
                            <span>Limited Time</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Shield size={12} className="text-purple-500" />
                            <span>Secure</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

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
    </div>
  );
}