// components/brokers/MobileBrokersPage.tsx - WITH LOGOS
'use client';

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { slugify } from "@/lib/slugify";
import { formatCurrency } from "@/utils/api-helpers";
import TrustScoreBadge from "@/components/ui/TrustScoreBadge";
import MobileLayout from "@/components/mobile/MobileLayout";
import MobileRegulationsTab from "./MobileRegulationsTab";
import { 
  Star, Building2, Search, ArrowRight, 
  Gift, Percent, DollarSign, TrendingUp, Shield,
  Target, ChevronDown, ChevronUp, CheckCircle2,
  AlertTriangle, Crown, Gem, Flame, Eye, Scale,
  Award, Users, MessageCircle, Sparkles, Wallet, BarChart3,
  Tag, Bell, Info, TrendingDown, Activity, Filter, X,
  Copy, Clock, ChevronRight, Globe, Smartphone, Gauge,
  Headphones, Rocket, ExternalLink, ShieldCheck, Zap,
  Calendar, Flag, ThumbsUp
} from "lucide-react";

// ============ LOGO COMPONENT ============
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

// ============ HELPER FUNCTIONS ============
const getMinDeposit = (broker: any) => {
  if (!broker) return 0;
  if (broker.accountTypes && broker.accountTypes.length > 0) {
    return Math.min(...broker.accountTypes.map((acc: any) => acc.minDeposit || 0));
  }
  return broker.minDeposit || 0;
};

const getMaxLeverage = (broker: any) => {
  return broker.leverage || '1:100';
};

const getSpread = (broker: any) => {
  return broker.spreads?.eurusd?.split('-')[0]?.trim() || '0.1';
};

const getPlatforms = (broker: any) => {
  return broker.platforms || broker.platform || [];
};

const generateGradient = (name: string) => {
  const gradients = [
    "from-blue-500 to-cyan-500", "from-purple-500 to-pink-500",
    "from-green-500 to-teal-500", "from-yellow-500 to-orange-500",
    "from-red-500 to-pink-500", "from-indigo-500 to-purple-500"
  ];
  return gradients[(name?.length || 0) % gradients.length];
};

// ============ STAR RATING ============
function StarRating({ rating, count = 0, size = "sm" }: { rating: number; count?: number; size?: "sm" | "md" }) {
  const sizes = { sm: "w-3.5 h-3.5", md: "w-4 h-4" };
  const hasReviews = count > 0;
  const displayRating = hasReviews ? Math.min(5, Math.max(0, rating || 0)) : 0;
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`${sizes[size]} ${i <= Math.floor(displayRating) && hasReviews ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}`} />
        ))}
      </div>
      {hasReviews && <span className="text-xs text-zinc-500">({count})</span>}
    </div>
  );
}

// ============ SPONSORED CARD ============
function SponsoredCard() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-pink-900/30 rounded-xl border border-purple-500/30 p-4">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10" />
      <div className="relative z-10">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400 text-[10px] font-medium mb-2">
          <Crown size={10} /> SPONSORED
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-white text-sm font-bold mb-1">Trade with <span className="text-blue-400">Zero Commission</span></h3>
            <p className="text-zinc-400 text-[10px]">Get $100 bonus on first deposit. Limited time offer.</p>
          </div>
          <button className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-[10px] font-medium whitespace-nowrap">
            Claim Offer →
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ BROKER CARD - OVERVIEW TAB ============
function BrokerCard({ firm, onPress }: { firm: any; onPress: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const trustScore = firm.trustScore || 0;
  const reviewCount = firm.reviewCount || 0;
  const rating = firm.avgRating || firm.rating || 0;
  const hasBonus = (firm.bonuses && firm.bonuses.length > 0) || (firm.promotions && firm.promotions.length > 0);
  const platforms = getPlatforms(firm);
  const incidentCount = firm.incidentCount || 0;
  const minDeposit = getMinDeposit(firm);
  const leverage = getMaxLeverage(firm);
  const spread = getSpread(firm);

  return (
    <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 overflow-hidden active:bg-zinc-800/50 transition-all">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <FirmLogo firm={firm} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-white font-bold text-base truncate">{firm.name}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <StarRating rating={rating} count={reviewCount} />
                  {trustScore > 0 && <TrustScoreBadge score={trustScore} size="sm" />}
                </div>
              </div>
              <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg bg-zinc-800">
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="bg-zinc-800/50 rounded-lg p-1.5 text-center">
                <div className="text-zinc-500 text-[9px]">Min Deposit</div>
                <div className="text-white font-bold text-xs">{formatCurrency(minDeposit)}</div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-1.5 text-center">
                <div className="text-zinc-500 text-[9px]">Leverage</div>
                <div className="text-white font-bold text-xs">{leverage}</div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-1.5 text-center">
                <div className="text-zinc-500 text-[9px]">Spread</div>
                <div className="text-white font-bold text-xs">{spread} pips</div>
              </div>
            </div>
            {incidentCount > 0 && (
              <div className="mt-2 flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded-full w-fit">
                <AlertTriangle size={10} className="text-red-400" />
                <span className="text-[10px] text-red-400">{incidentCount} incidents</span>
              </div>
            )}
            {hasBonus && (
              <div className="mt-2 p-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
                <div className="flex items-center gap-1"><Gift size={10} className="text-amber-400" /><span className="text-[9px] font-semibold text-amber-400">Special Offer</span></div>
              </div>
            )}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-zinc-800">
            <div className="p-4 space-y-3 bg-zinc-900/50">
              {platforms.length > 0 && (
                <div>
                  <div className="text-zinc-500 text-[10px] mb-1.5">Platforms</div>
                  <div className="flex flex-wrap gap-1.5">
                    {platforms.map((p: string, i: number) => (
                      <span key={i} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full">{p}</span>
                    ))}
                  </div>
                </div>
              )}
              {firm.country && (
                <div className="flex items-center gap-1 text-zinc-500 text-[10px]">
                  <Globe size={10} /> {firm.country}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="p-4 pt-0">
        <button onClick={onPress} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
          View Details <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ============ OFFERS TAB ============
function OffersTab({ brokers }: { brokers: any[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  
  const brokersWithBonuses = brokers.filter(b => (b.bonuses && b.bonuses.length > 0) || (b.promotions && b.promotions.length > 0));
  const filteredBrokers = search ? brokersWithBonuses.filter(b => b.name?.toLowerCase().includes(search.toLowerCase())) : brokersWithBonuses;

  const handleCopy = (code: string) => { navigator.clipboard.writeText(code); setCopiedId(code); setTimeout(() => setCopiedId(null), 2000); };

  if (brokersWithBonuses.length === 0) {
    return (
      <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800">
        <Gift size={32} className="text-zinc-600 mx-auto mb-3" />
        <p className="text-zinc-500 text-sm">No active bonuses</p>
        <p className="text-zinc-600 text-xs mt-1">Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} /><input type="text" placeholder="Search bonuses..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm" /></div>
      <div className="text-xs text-zinc-500">{filteredBrokers.length} brokers with offers</div>
      <div className="space-y-3">
        {filteredBrokers.map((broker) => {
          const bonuses = broker.bonuses || [];
          const promotions = broker.promotions || [];
          const allOffers = [...bonuses, ...promotions];
          const primary = allOffers[0];
          const additional = allOffers.slice(1);
          const isExpanded = expandedId === broker.id;
          const minDeposit = getMinDeposit(broker);
          const leverage = getMaxLeverage(broker);

          return (
            <div key={broker.id} className="bg-zinc-900/80 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FirmLogo firm={broker} size="sm" />
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-sm">{broker.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={broker.rating || 0} count={broker.reviewCount || 0} />
                      {broker.trustScore > 0 && <TrustScoreBadge score={broker.trustScore} size="sm" />}
                    </div>
                  </div>
                  {primary?.amount && (<div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-[10px] font-bold">{primary.amount}</div>)}
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                    <div className="text-zinc-500 text-[10px]">Min Deposit</div>
                    <div className="text-white font-bold text-sm">{formatCurrency(minDeposit)}</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                    <div className="text-zinc-500 text-[10px]">Leverage</div>
                    <div className="text-white font-bold text-sm">{leverage}</div>
                  </div>
                </div>
                {primary && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 mb-3">
                    <p className="text-white text-xs font-medium mb-1">{primary.amount || primary.name || "Welcome Bonus"}</p>
                    {primary.code && (
                      <div className="flex items-center gap-2">
                        <code className="text-[10px] font-mono bg-zinc-800 px-2 py-1 rounded text-purple-400">{primary.code}</code>
                        <button onClick={() => handleCopy(primary.code)} className="text-zinc-400 hover:text-purple-400">
                          {copiedId === primary.code ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {additional.length > 0 && (
                  <button onClick={() => setExpandedId(isExpanded ? null : broker.id)} className="w-full flex items-center justify-center gap-1 py-1 text-xs text-zinc-400">
                    {isExpanded ? <>Show Less <ChevronUp size={12} /></> : <>View {additional.length} More Offers <ChevronDown size={12} /></>}
                  </button>
                )}
              </div>
              <AnimatePresence>
                {isExpanded && additional.length > 0 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-zinc-800">
                    <div className="p-4 space-y-2 bg-zinc-900/50">
                      {additional.map((offer: any, idx: number) => (
                        <div key={idx} className="bg-zinc-800/50 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs font-semibold text-white">{offer.amount || offer.name || "Additional Offer"}</span>
                              {offer.type && <div className="text-green-400 text-xs mt-1">{offer.type}</div>}
                            </div>
                            {offer.code && (
                              <button onClick={() => handleCopy(offer.code)} className="text-zinc-400 hover:text-purple-400">
                                {copiedId === offer.code ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                              </button>
                            )}
                          </div>
                          {offer.code && <code className="text-[10px] font-mono bg-zinc-900 px-2 py-1 rounded text-purple-400 mt-2 block">Code: {offer.code}</code>}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="p-4 pt-0">
                <button onClick={() => window.open(broker.website || broker.affiliateLink, '_blank')} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-xl text-xs font-medium">
                  Claim Bonus →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ CONDITIONS TAB ============
function ConditionsTab({ brokers }: { brokers: any[] }) {
  const [selectedBroker, setSelectedBroker] = useState<any>(null);
  const [search, setSearch] = useState("");
  const filteredBrokers = useMemo(() => {
    if (!search) return brokers;
    return brokers.filter(b => b.name?.toLowerCase().includes(search.toLowerCase()));
  }, [brokers, search]);

  if (selectedBroker) {
    return (
      <div>
        <button onClick={() => setSelectedBroker(null)} className="flex items-center gap-1 text-purple-400 text-sm mb-4">← Back</button>
        <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4 mb-4">
          <div className="flex items-center gap-3">
            <FirmLogo firm={selectedBroker} size="md" />
            <div>
              <h3 className="text-white font-bold text-base">{selectedBroker.name}</h3>
              <div className="text-zinc-400 text-xs">{selectedBroker.country || 'International'}</div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4">
            <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2"><TrendingUp size={14} className="text-blue-400" />Trading Conditions</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                <span className="text-zinc-400 text-xs">Min Deposit</span>
                <span className="text-white text-xs font-medium">{formatCurrency(getMinDeposit(selectedBroker))}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                <span className="text-zinc-400 text-xs">Max Leverage</span>
                <span className="text-white text-xs font-medium">{getMaxLeverage(selectedBroker)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                <span className="text-zinc-400 text-xs">EURUSD Spread</span>
                <span className="text-white text-xs font-medium">{getSpread(selectedBroker)} pips</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                <span className="text-zinc-400 text-xs">Commission</span>
                <span className="text-white text-xs font-medium">{selectedBroker.commission || 'Variable'}</span>
              </div>
            </div>
          </div>
          {selectedBroker.accountTypes && selectedBroker.accountTypes.length > 0 && (
            <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4">
              <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2"><Wallet size={14} className="text-green-400" />Account Types</h4>
              <div className="space-y-2">
                {selectedBroker.accountTypes.map((acc: any, i: number) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-0">
                    <span className="text-white text-xs font-medium">{acc.name}</span>
                    <span className="text-green-400 text-xs">${acc.minDeposit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
        <input type="text" placeholder="Search broker..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm" />
      </div>
      <div className="text-xs text-zinc-500">{filteredBrokers.length} brokers</div>
      <div className="space-y-2">
        {filteredBrokers.map((broker) => (
          <button key={broker.id} onClick={() => setSelectedBroker(broker)} className="w-full bg-zinc-900/80 rounded-xl p-4 border border-zinc-800 text-left active:bg-zinc-800 transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FirmLogo firm={broker} size="sm" />
              <div>
                <div className="text-white font-medium text-sm">{broker.name}</div>
                <div className="text-zinc-500 text-xs">{formatCurrency(getMinDeposit(broker))} min deposit</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-zinc-500" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ============ REVIEWS TAB ============
function ReviewsTab({ brokers }: { brokers: any[] }) {
  const [selectedBroker, setSelectedBroker] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "reviews" | "incidents">("rating");
  const [currentPage, setCurrentPage] = useState(1);
  const [enrichedBrokersWithReviews, setEnrichedBrokersWithReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchBrokersWithReviews = async () => {
      if (brokers.length === 0) return;
      setLoadingReviews(true);
      const enriched = await Promise.all(brokers.map(async (broker) => {
        try {
          const response = await fetch(`/api/reviews?brokerId=${broker.id}&status=APPROVED&limit=100`);
          const data = await response.json();
          if (response.ok && data.reviews && data.reviews.length > 0) {
            const reviews = data.reviews;
            const totalReviews = reviews.length;
            const avgRating = reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / totalReviews;
            const avgTrustScore = Math.round(reviews.reduce((sum: number, r: any) => sum + (r.trustScore || 0), 0) / totalReviews);
            let sumTradingConditions = 0, sumPlatformStability = 0, sumCustomerSupport = 0, sumWithdrawalSpeed = 0;
            let hasTradingData = false, hasPlatformData = false, hasSupportData = false, hasWithdrawalData = false;
            reviews.forEach((review: any) => {
              const tradingVal = review.executionQuality || 0;
              if (tradingVal > 0) { sumTradingConditions += tradingVal; hasTradingData = true; }
              const platformVal = review.platformStability || 0;
              if (platformVal > 0) { sumPlatformStability += platformVal; hasPlatformData = true; }
              const supportVal = review.customerSupport || 0;
              if (supportVal > 0) { sumCustomerSupport += supportVal; hasSupportData = true; }
              const withdrawalVal = review.withdrawalExperience || 0;
              if (withdrawalVal > 0) { sumWithdrawalSpeed += withdrawalVal; hasWithdrawalData = true; }
            });
            return { 
              ...broker, 
              reviewCount: totalReviews, 
              avgRating: Number(avgRating.toFixed(1)), 
              trustScore: avgTrustScore, 
              avgTradingConditions: hasTradingData ? Number((sumTradingConditions / totalReviews).toFixed(1)) : 0, 
              avgPlatformStability: hasPlatformData ? Number((sumPlatformStability / totalReviews).toFixed(1)) : 0, 
              avgCustomerSupport: hasSupportData ? Number((sumCustomerSupport / totalReviews).toFixed(1)) : 0, 
              avgWithdrawalSpeed: hasWithdrawalData ? Number((sumWithdrawalSpeed / totalReviews).toFixed(1)) : 0 
            };
          }
        } catch (err) {}
        return { ...broker, reviewCount: 0, avgRating: 0, trustScore: 0, avgTradingConditions: 0, avgPlatformStability: 0, avgCustomerSupport: 0, avgWithdrawalSpeed: 0 };
      }));
      setEnrichedBrokersWithReviews(enriched);
      setLoadingReviews(false);
    };
    fetchBrokersWithReviews();
  }, [brokers]);

  const filteredBrokers = useMemo(() => {
    let filtered = [...enrichedBrokersWithReviews];
    if (search) filtered = filtered.filter(b => b.name?.toLowerCase().includes(search.toLowerCase()));
    filtered.sort((a, b) => {
      if (sortBy === "rating") return (b.avgRating || 0) - (a.avgRating || 0);
      if (sortBy === "reviews") return (b.reviewCount || 0) - (a.reviewCount || 0);
      if (sortBy === "incidents") return (b.incidentCount || 0) - (a.incidentCount || 0);
      return (b.avgRating || 0) - (a.avgRating || 0);
    });
    return filtered;
  }, [enrichedBrokersWithReviews, search, sortBy]);

  const totalPages = Math.ceil(filteredBrokers.length / itemsPerPage);
  const paginatedBrokers = filteredBrokers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loadingReviews) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" /></div>;
  }

  if (selectedBroker) {
    return (
      <div>
        <button onClick={() => setSelectedBroker(null)} className="flex items-center gap-1 text-purple-400 text-sm mb-4">← Back</button>
        <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4 mb-4">
          <div className="flex items-center gap-3">
            <FirmLogo firm={selectedBroker} size="md" />
            <div className="flex-1">
              <h3 className="text-white font-bold text-base">{selectedBroker.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={selectedBroker.avgRating || 0} count={selectedBroker.reviewCount || 0} />
                {selectedBroker.trustScore > 0 && <TrustScoreBadge score={selectedBroker.trustScore} size="sm" />}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4 mb-4 space-y-3">
          <div className="text-xs text-zinc-500 mb-1">Community Ratings</div>
          <div className="space-y-2">
            <div><div className="flex items-center justify-between text-xs"><div className="flex items-center gap-1.5"><TrendingUp size={12} className="text-green-400" /><span className="text-zinc-400">Trading</span></div><span className="text-white font-medium">{(selectedBroker.avgTradingConditions || 0).toFixed(1)}/5</span></div><div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400" style={{ width: `${((selectedBroker.avgTradingConditions || 0) / 5) * 100}%` }} /></div></div>
            <div><div className="flex items-center justify-between text-xs"><div className="flex items-center gap-1.5"><Gauge size={12} className="text-blue-400" /><span className="text-zinc-400">Platform</span></div><span className="text-white font-medium">{(selectedBroker.avgPlatformStability || 0).toFixed(1)}/5</span></div><div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400" style={{ width: `${((selectedBroker.avgPlatformStability || 0) / 5) * 100}%` }} /></div></div>
            <div><div className="flex items-center justify-between text-xs"><div className="flex items-center gap-1.5"><Headphones size={12} className="text-purple-400" /><span className="text-zinc-400">Support</span></div><span className="text-white font-medium">{(selectedBroker.avgCustomerSupport || 0).toFixed(1)}/5</span></div><div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-400" style={{ width: `${((selectedBroker.avgCustomerSupport || 0) / 5) * 100}%` }} /></div></div>
            <div><div className="flex items-center justify-between text-xs"><div className="flex items-center gap-1.5"><Zap size={12} className="text-yellow-400" /><span className="text-zinc-400">Withdrawal</span></div><span className="text-white font-medium">{(selectedBroker.avgWithdrawalSpeed || 0).toFixed(1)}/5</span></div><div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400" style={{ width: `${((selectedBroker.avgWithdrawalSpeed || 0) / 5) * 100}%` }} /></div></div>
          </div>
        </div>
        {selectedBroker.incidentCount > 0 && (<div className="mb-4 flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded-full w-fit"><AlertTriangle size={10} className="text-red-400" /><span className="text-[10px] text-red-400">{selectedBroker.incidentCount} incidents</span></div>)}
        {getPlatforms(selectedBroker).length > 0 && (<div className="flex flex-wrap gap-1 mb-4">{getPlatforms(selectedBroker).slice(0, 3).map((p: string, i: number) => (<span key={i} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full">{p}</span>))}</div>)}
        <button onClick={() => window.open(selectedBroker.website, '_blank')} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-xl text-sm font-medium">Visit Broker</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} /><input type="text" placeholder="Search brokers..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm" /></div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-3 py-2.5"><option value="rating">Highest Rated</option><option value="reviews">Most Reviews</option><option value="incidents">Most Incidents</option></select>
      </div>
      <div className="text-xs text-zinc-500">{filteredBrokers.length} brokers found</div>
      <div className="space-y-3">
        {paginatedBrokers.map((broker, index) => {
          const minDeposit = getMinDeposit(broker);
          const maxLeverage = getMaxLeverage(broker);
          const platforms = getPlatforms(broker);
          const trustScore = broker.trustScore || 0;
          const incidentCount = broker.incidentCount || 0;
          const rating = broker.avgRating || 0;
          const isTopRated = index === 0 && rating >= 4.5;
          return (
            <div key={broker.id} onClick={() => setSelectedBroker(broker)} className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4 active:bg-zinc-800 transition-all cursor-pointer">
              {isTopRated && (<div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[10px] font-bold mb-2"><Flame size={10} /> Top Rated</div>)}
              <div className="flex items-start gap-3 mb-3">
                <FirmLogo firm={broker} size="sm" />
                <div className="flex-1">
                  <h3 className="text-white font-bold text-base truncate">{broker.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={rating} count={broker.reviewCount || 0} />
                    {trustScore > 0 && <TrustScoreBadge score={trustScore} size="sm" />}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-green-500/10 rounded-lg p-2 text-center">
                  <div className="text-zinc-500 text-[10px]">Min Deposit</div>
                  <div className="text-green-400 font-bold text-sm">{formatCurrency(minDeposit)}</div>
                </div>
                <div className="bg-blue-500/10 rounded-lg p-2 text-center">
                  <div className="text-zinc-500 text-[10px]">Leverage</div>
                  <div className="text-blue-400 font-bold text-sm">{maxLeverage}</div>
                </div>
              </div>
              <div className="space-y-2 mb-3">
                <div className="text-xs text-zinc-500 mb-1">Community Ratings</div>
                <div><div className="flex items-center gap-2"><div className="flex items-center gap-1 w-20"><TrendingUp size={11} className="text-green-400" /><span className="text-[11px] text-zinc-400">Trading</span></div><div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: `${((broker.avgTradingConditions || 0) / 5) * 100}%` }} /></div><span className="text-[11px] font-medium text-green-400 w-8 text-right">{(broker.avgTradingConditions || 0).toFixed(1)}</span></div></div>
                <div><div className="flex items-center gap-2"><div className="flex items-center gap-1 w-20"><Gauge size={11} className="text-blue-400" /><span className="text-[11px] text-zinc-400">Platform</span></div><div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: `${((broker.avgPlatformStability || 0) / 5) * 100}%` }} /></div><span className="text-[11px] font-medium text-blue-400 w-8 text-right">{(broker.avgPlatformStability || 0).toFixed(1)}</span></div></div>
                <div><div className="flex items-center gap-2"><div className="flex items-center gap-1 w-20"><Headphones size={11} className="text-purple-400" /><span className="text-[11px] text-zinc-400">Support</span></div><div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" style={{ width: `${((broker.avgCustomerSupport || 0) / 5) * 100}%` }} /></div><span className="text-[11px] font-medium text-purple-400 w-8 text-right">{(broker.avgCustomerSupport || 0).toFixed(1)}</span></div></div>
                <div><div className="flex items-center gap-2"><div className="flex items-center gap-1 w-20"><Zap size={11} className="text-yellow-400" /><span className="text-[11px] text-zinc-400">Withdrawal</span></div><div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full" style={{ width: `${((broker.avgWithdrawalSpeed || 0) / 5) * 100}%` }} /></div><span className="text-[11px] font-medium text-yellow-400 w-8 text-right">{(broker.avgWithdrawalSpeed || 0).toFixed(1)}</span></div></div>
              </div>
              {incidentCount > 0 && (<div className="mb-3 flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded-full w-fit"><AlertTriangle size={10} className="text-red-400" /><span className="text-[10px] text-red-400">{incidentCount} incidents</span></div>)}
              {platforms.length > 0 && (<div className="flex flex-wrap gap-1 mb-3">{platforms.slice(0, 3).map((p: string, i: number) => (<span key={i} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full">{p}</span>))}</div>)}
              <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium">Reviews ({broker.reviewCount || 0})</button>
            </div>
          );
        })}
      </div>
      {totalPages > 1 && (<div className="flex justify-center gap-2 py-2"><button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-xs disabled:opacity-50">Prev</button><span className="px-3 py-1.5 text-zinc-400 text-xs">{currentPage} / {totalPages}</span><button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-xs disabled:opacity-50">Next</button></div>)}
    </div>
  );
}

// ============ MAIN COMPONENT ============
export default function MobileBrokersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "offers" | "conditions" | "reviews" | "regulations">("overview");
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "regulated" | "bonus">("all");
  const [enrichedBrokers, setEnrichedBrokers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.getBrokers();
        if (response.success) setBrokers(response.data || []);
      } catch (err) {
        console.error('Failed to fetch brokers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const enrichBrokers = async () => {
      if (brokers.length === 0) return;
      const enriched = await Promise.all(brokers.map(async (broker) => {
        try {
          const reviewsRes = await fetch(`/api/reviews?brokerId=${broker.id}&status=APPROVED&limit=100`);
          const reviewsData = await reviewsRes.json();
          let trustScore = 0, reviewCount = 0, avgRating = 0;
          if (reviewsRes.ok && reviewsData.reviews && reviewsData.reviews.length > 0) {
            const reviews = reviewsData.reviews;
            reviewCount = reviews.length;
            avgRating = reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviewCount;
            trustScore = Math.round(reviews.reduce((sum: number, r: any) => sum + (r.trustScore || 0), 0) / reviewCount);
          }
          const incidentsRes = await fetch(`/api/incidents?entityType=broker&entityId=${broker.id}&limit=1`);
          const incidentsData = await incidentsRes.json();
          const incidentCount = incidentsRes.ok ? incidentsData.pagination?.total || 0 : 0;
          return { ...broker, trustScore, reviewCount, avgRating: Number(avgRating.toFixed(1)), incidentCount };
        } catch (err) {
          return { ...broker, trustScore: 0, reviewCount: 0, avgRating: 0, incidentCount: 0 };
        }
      }));
      setEnrichedBrokers(enriched);
    };
    enrichBrokers();
  }, [brokers]);

  const filteredBrokers = useMemo(() => {
    let filtered = [...enrichedBrokers];
    if (search) filtered = filtered.filter(b => b.name?.toLowerCase().includes(search.toLowerCase()));
    if (typeFilter === "regulated") filtered = filtered.filter(b => b.regulated === true);
    if (typeFilter === "bonus") filtered = filtered.filter(b => (b.bonuses && b.bonuses.length > 0) || (b.promotions && b.promotions.length > 0));
    return filtered;
  }, [enrichedBrokers, search, typeFilter]);

  const totalPages = Math.ceil(filteredBrokers.length / itemsPerPage);
  const paginatedBrokers = filteredBrokers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalReviews = enrichedBrokers.reduce((sum, b) => sum + (b.reviewCount || 0), 0);
  const totalIncidents = enrichedBrokers.reduce((sum, b) => sum + (b.incidentCount || 0), 0);
  const regulatedCount = enrichedBrokers.filter(b => b.regulated).length;

  const handleNavigate = (id: number, name: string) => {
    router.push(`/brokers/${id}`);
  };

  if (loading) {
    return (
      <MobileLayout title="Brokers" showSearch={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" />
            <p className="text-xs text-zinc-500 mt-3">Loading brokers...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Brokers" showSearch={false}>
      <div className="space-y-4 pb-6">
        {/* Hero Stats */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-4 border border-blue-500/30">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><div className="text-2xl font-bold text-white">{enrichedBrokers.length}</div><div className="text-xs text-zinc-400">Brokers</div></div>
            <div><div className="text-2xl font-bold text-white">{totalReviews.toLocaleString()}</div><div className="text-xs text-zinc-400">Reviews</div></div>
            <div><div className="text-2xl font-bold text-red-400">{totalIncidents}</div><div className="text-xs text-zinc-400">Reports</div></div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-1 bg-zinc-900/50 rounded-xl p-1 border border-zinc-800">
          <button onClick={() => { setActiveTab("overview"); setCurrentPage(1); setSearch(""); }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "overview" ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" : "text-zinc-400"}`}>📋 Brokers</button>
          <button onClick={() => { setActiveTab("offers"); setCurrentPage(1); setSearch(""); }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "offers" ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" : "text-zinc-400"}`}>🎁 Bonuses</button>
          <button onClick={() => { setActiveTab("conditions"); setCurrentPage(1); setSearch(""); }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "conditions" ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" : "text-zinc-400"}`}>📜 Conditions</button>
          <button onClick={() => { setActiveTab("reviews"); setCurrentPage(1); setSearch(""); }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "reviews" ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" : "text-zinc-400"}`}>⭐ Reviews</button>
          <button onClick={() => { setActiveTab("regulations"); setCurrentPage(1); setSearch(""); }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "regulations" ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" : "text-zinc-400"}`}>🛡️ Regulations</button>
        </div>

        {/* SPONSORED CARD - SHOWS ON ALL TABS */}
        <SponsoredCard />

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            <div className="flex gap-2">
              <button onClick={() => { setTypeFilter("all"); setCurrentPage(1); }} className={`flex-1 px-2 py-2 rounded-xl text-xs font-medium transition-all ${typeFilter === "all" ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" : "bg-zinc-800/50 text-zinc-400 border border-zinc-800"}`}>All Brokers ({enrichedBrokers.length})</button>
              <button onClick={() => { setTypeFilter("regulated"); setCurrentPage(1); }} className={`flex-1 px-2 py-2 rounded-xl text-xs font-medium transition-all ${typeFilter === "regulated" ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" : "bg-zinc-800/50 text-zinc-400 border border-zinc-800"}`}>Regulated ({regulatedCount})</button>
              <button onClick={() => { setTypeFilter("bonus"); setCurrentPage(1); }} className={`flex-1 px-2 py-2 rounded-xl text-xs font-medium transition-all ${typeFilter === "bonus" ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" : "bg-zinc-800/50 text-zinc-400 border border-zinc-800"}`}>Has Bonus ({enrichedBrokers.filter(b => (b.bonuses?.length > 0) || (b.promotions?.length > 0)).length})</button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              <input type="text" placeholder="Search brokers..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm" />
            </div>
            <div className="flex justify-between items-center"><span className="text-xs text-zinc-500">{filteredBrokers.length} brokers found</span></div>
            <div className="space-y-3">{paginatedBrokers.map((broker) => (<BrokerCard key={broker.id} firm={broker} onPress={() => handleNavigate(broker.id, broker.name)} />))}</div>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 py-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-xs disabled:opacity-50">Prev</button>
                <span className="px-3 py-1.5 text-zinc-400 text-xs">{currentPage} / {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-xs disabled:opacity-50">Next</button>
              </div>
            )}
            {filteredBrokers.length === 0 && (<div className="text-center py-12"><Building2 size={32} className="text-zinc-600 mx-auto mb-3" /><p className="text-zinc-500 text-sm">No brokers found</p></div>)}
          </>
        )}

        {/* OFFERS TAB */}
        {activeTab === "offers" && <OffersTab brokers={enrichedBrokers} />}

        {/* CONDITIONS TAB */}
        {activeTab === "conditions" && <ConditionsTab brokers={enrichedBrokers} />}

        {/* REVIEWS TAB */}
        {activeTab === "reviews" && <ReviewsTab brokers={enrichedBrokers} />}

        {/* REGULATIONS TAB - IMPORTED FROM SEPARATE FILE */}
        {activeTab === "regulations" && <MobileRegulationsTab />}

        {/* Footer */}
        <div className="text-center text-[10px] text-zinc-600 py-4">Data is community-reported and verified. Always do your own research.</div>
      </div>
    </MobileLayout>
  );
}