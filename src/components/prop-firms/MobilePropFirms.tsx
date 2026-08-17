// components/prop-firms/MobilePropFirms.tsx - COMPLETE UPDATE WITHOUT RATINGS
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
import MobileReviewsTab from "./MobileReviewsTab";
import { 
  Star, Building2, Search, ArrowRight, 
  Gift, Percent, DollarSign, TrendingUp, Shield,
  Target, ChevronDown, ChevronUp, CheckCircle2,
  AlertTriangle, Crown, Gem, Flame, Eye, Scale,
  Award, Users, MessageCircle, Sparkles, Wallet, BarChart3,
  Tag, Bell, Info, TrendingDown, Activity, Filter, X,
  Copy, Clock, ChevronRight, Monitor, Layers,
  BadgeCheck, Headphones, Rocket, Smartphone,
  Gauge, Coins, BookOpen, Globe, Landmark, Zap,
  Briefcase, CreditCard, RefreshCw, PieChart
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
const getAllAccountOptions = (firm: any) => {
  if (!firm?.programs) return [];
  return firm.programs.flatMap((program: any) => program.accountOptions || []);
};

const getMaxPayout = (firm: any) => {
  const options = getAllAccountOptions(firm);
  if (options.length === 0) return firm.payoutPercentage || 80;
  return Math.max(...options.map((acc: any) => acc.payoutPercentage || acc.payout || 80));
};

const getMinPrice = (firm: any) => {
  const options = getAllAccountOptions(firm);
  if (options.length === 0) return firm.minPrice || 99;
  return Math.min(...options.map((acc: any) => acc.price || 0));
};

const getMinAccountSize = (firm: any) => {
  const options = getAllAccountOptions(firm);
  if (options.length === 0) return firm.minAccountSize || 5000;
  return Math.min(...options.map((acc: any) => acc.accountSize || 0));
};

const getMaxAccountSize = (firm: any) => {
  const options = getAllAccountOptions(firm);
  if (options.length === 0) return 100000;
  return Math.max(...options.map((acc: any) => acc.accountSize || 0));
};

const generateGradient = (name: string) => {
  const gradients = [
    "from-purple-500 to-pink-500", "from-blue-500 to-purple-500",
    "from-green-500 to-blue-500", "from-yellow-500 to-orange-500",
    "from-red-500 to-pink-500", "from-indigo-500 to-blue-500"
  ];
  return gradients[(name?.length || 0) % gradients.length];
};

const calculateTrustStats = (reviews: any[]) => {
  if (!reviews?.length) return { trustScore: 0, reviewCount: 0, avgRating: 0 };
  const avgTrust = reviews.reduce((sum, r) => sum + (r.trustScore || 0), 0) / reviews.length;
  const avgRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
  return { trustScore: Math.round(avgTrust), reviewCount: reviews.length, avgRating: Number(avgRating.toFixed(1)) };
};

// ============ STAR RATING ============
function StarRating({ rating, count = 0, size = "sm" }: { rating: number; count?: number; size?: "sm" | "md" }) {
  const hasReviews = count > 0;
  const displayRating = hasReviews ? Math.min(5, Math.max(0, rating || 0)) : 0;
  const starSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`${starSize} ${i <= Math.floor(displayRating) && hasReviews ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-700'}`} />
        ))}
      </div>
      {hasReviews && <span className="text-xs text-zinc-500">({count})</span>}
    </div>
  );
}

// ============ SPONSORED CARD ============
function SponsoredCard() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-orange-900/30 rounded-xl border border-purple-500/30 p-4">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-orange-600/10" />
      <div className="relative z-10">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400 text-[10px] font-medium mb-2">
          <Crown size={10} /> SPONSORED
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-white text-sm font-bold mb-1">Get Funded with <span className="text-purple-400">90% Profit Split</span></h3>
            <p className="text-zinc-400 text-[10px]">Pass your challenge with up to 50% discount. No minimum trading days.</p>
          </div>
          <button className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-[10px] font-medium whitespace-nowrap">
            Claim Offer →
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ FIRM CARD - WITHOUT COMMUNITY RATINGS ============
function FirmCard({ firm, onPress }: { firm: any; onPress: () => void }) {
  const trustScore = firm.trustScore || 0;
  const reviewCount = firm.reviewCount || 0;
  const hasOffer = firm.promotions && firm.promotions.length > 0;
  const programs = firm.programs || [];
  const platforms = firm.platforms || firm.platform || [];
  const incidentCount = firm.incidentCount || 0;
  const maxPayout = getMaxPayout(firm);
  const minPrice = getMinPrice(firm);
  const minAccount = getMinAccountSize(firm);
  const maxAccount = getMaxAccountSize(firm);
  
  const programTypes = programs.map((p: any) => p.type).filter(Boolean);
  const uniqueProgramTypes = [...new Set(programTypes)];
  
  const isRegulated = firm.regulated || (firm.regulatoryBodies && firm.regulatoryBodies.length > 0);
  const regulations = firm.regulatoryBodies || [];
  const yearsInOperation = firm.yearsInOperation || firm.years || 0;
  const country = firm.country || 'International';

  return (
    <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all">
      <div className="p-4">
        {/* Header with Logo */}
        <div className="flex items-start gap-4 mb-4">
          <FirmLogo firm={firm} size="md" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-white font-bold text-base">{firm.name}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <StarRating rating={firm.avgRating || 0} count={reviewCount} size="sm" />
                  {trustScore > 0 && <TrustScoreBadge score={trustScore} size="sm" />}
                </div>
              </div>
              {isRegulated && (
                <div className="flex items-center gap-1 text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">
                  <BadgeCheck size={12} /> Regulated
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <Globe size={12} className="text-zinc-500" /> {country}
              </span>
              {yearsInOperation > 0 && (
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-zinc-500" /> {yearsInOperation} yrs
                </span>
              )}
              {incidentCount > 0 && (
                <span className="flex items-center gap-1 text-red-400">
                  <AlertTriangle size={12} /> {incidentCount} incidents
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Key Metrics - 2 columns */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <div className="text-zinc-500 text-[10px] uppercase tracking-wider">Max Payout</div>
            <div className="text-white font-bold text-lg">{maxPayout}%</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <div className="text-zinc-500 text-[10px] uppercase tracking-wider">Min Account</div>
            <div className="text-white font-bold text-lg">{formatCurrency(minAccount)}</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <div className="text-zinc-500 text-[10px] uppercase tracking-wider">Max Account</div>
            <div className="text-white font-bold text-lg">{formatCurrency(maxAccount)}</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <div className="text-zinc-500 text-[10px] uppercase tracking-wider">Starting Price</div>
            <div className="text-white font-bold text-lg">{formatCurrency(minPrice)}</div>
          </div>
        </div>

        {/* Programs & Platforms - chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {uniqueProgramTypes.slice(0, 3).map((type: string, i: number) => (
            <span key={i} className="text-[10px] bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full border border-purple-500/20">
              {type}
            </span>
          ))}
          {uniqueProgramTypes.length > 3 && (
            <span className="text-[10px] text-zinc-500 px-2 py-1">+{uniqueProgramTypes.length - 3}</span>
          )}
          {platforms.slice(0, 2).map((p: string, i: number) => (
            <span key={`platform-${i}`} className="text-[10px] bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full border border-zinc-700">
              {p}
            </span>
          ))}
          {platforms.length > 2 && (
            <span className="text-[10px] text-zinc-500 px-2 py-1">+{platforms.length - 2}</span>
          )}
        </div>

        {/* Offer Banner */}
        {hasOffer && (
          <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift size={14} className="text-amber-400" />
              <div>
                <p className="text-white text-xs font-medium">{firm.promotions[0]?.name || "Limited Time Discount"}</p>
                {firm.promotions[0]?.discount && (
                  <span className="text-[10px] text-green-400">{firm.promotions[0].discount}% OFF</span>
                )}
              </div>
            </div>
            <button className="text-[10px] text-amber-400 font-medium hover:text-amber-300">
              Claim →
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button onClick={onPress} className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:from-purple-500 hover:to-pink-500 transition-all">
            View Details <ArrowRight size={14} />
          </button>
          {hasOffer && (
            <button className="px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-all">
              <Gift size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ OFFERS TAB ============
function OffersTab({ firms }: { firms: any[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  
  const firmsWithOffers = firms.filter(f => f.promotions && f.promotions.length > 0);
  const filteredFirms = search ? firmsWithOffers.filter(f => f.name?.toLowerCase().includes(search.toLowerCase())) : firmsWithOffers;

  const handleCopy = (code: string) => { navigator.clipboard.writeText(code); setCopiedId(code); setTimeout(() => setCopiedId(null), 2000); };

  if (firmsWithOffers.length === 0) {
    return (
      <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800">
        <Gift size={32} className="text-zinc-600 mx-auto mb-3" />
        <p className="text-zinc-500 text-sm">No active offers</p>
        <p className="text-zinc-600 text-xs mt-1">Check back soon for discounts!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
        <input type="text" placeholder="Search offers..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm" />
      </div>
      
      <div className="text-xs text-zinc-500">{filteredFirms.length} firms with offers</div>

      <div className="space-y-3">
        {filteredFirms.map((firm) => {
          const promotions = firm.promotions || [];
          const primary = promotions[0];
          const additional = promotions.slice(1);
          const isExpanded = expandedId === firm.id;
          const maxPayout = getMaxPayout(firm);
          const minAccount = getMinAccountSize(firm);
          const trustScore = firm.trustScore || 0;
          const reviewCount = firm.reviewCount || 0;

          return (
            <div key={firm.id} className="bg-zinc-900/80 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FirmLogo firm={firm} size="sm" />
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-sm">{firm.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={firm.rating || 0} count={reviewCount} />
                      {trustScore > 0 && <TrustScoreBadge score={trustScore} size="sm" />}
                    </div>
                  </div>
                  {primary?.discount && (
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-[10px] font-bold">
                      {primary.discount}% OFF
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                    <div className="text-zinc-500 text-[10px]">Max Payout</div>
                    <div className="text-white font-bold text-sm">{maxPayout}%</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                    <div className="text-zinc-500 text-[10px]">Min Account</div>
                    <div className="text-white font-bold text-sm">{formatCurrency(minAccount)}</div>
                  </div>
                </div>

                {primary && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 mb-3">
                    <p className="text-white text-xs font-medium mb-1">{primary.name || "Special Challenge Discount"}</p>
                    {primary.code && (
                      <div className="flex items-center gap-2">
                        <code className="text-[10px] font-mono bg-zinc-800 px-2 py-1 rounded text-orange-400">{primary.code}</code>
                        <button onClick={() => handleCopy(primary.code)} className="text-zinc-400 hover:text-orange-400">
                          {copiedId === primary.code ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {additional.length > 0 && (
                  <button onClick={() => setExpandedId(isExpanded ? null : firm.id)} className="w-full flex items-center justify-center gap-1 py-1 text-xs text-zinc-400">
                    {isExpanded ? <>Show Less <ChevronUp size={12} /></> : <>View {additional.length} More Offers <ChevronDown size={12} /></>}
                  </button>
                )}
              </div>

              <AnimatePresence>
                {isExpanded && additional.length > 0 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-zinc-800">
                    <div className="p-4 space-y-2 bg-zinc-900/50">
                      {additional.map((promo: any, idx: number) => (
                        <div key={idx} className="bg-zinc-800/50 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs font-semibold text-white">{promo.name || "Additional Offer"}</span>
                              {promo.discount && <div className="text-green-400 text-xs mt-1">{promo.discount}% OFF</div>}
                            </div>
                            {promo.code && (
                              <button onClick={() => handleCopy(promo.code)} className="text-zinc-400 hover:text-orange-400">
                                {copiedId === promo.code ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                              </button>
                            )}
                          </div>
                          {promo.code && <code className="text-[10px] font-mono bg-zinc-900 px-2 py-1 rounded text-orange-400 mt-2 block">Code: {promo.code}</code>}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-4 pt-0">
                <button onClick={() => window.open(firm.signupLink || firm.affiliateLink, '_blank')} className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-2 rounded-xl text-xs font-medium">
                  Claim Offer →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ RULES TAB ============
function RulesTab({ firms }: { firms: any[] }) {
  const [selectedFirmId, setSelectedFirmId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedProgramType, setSelectedProgramType] = useState<string>("all");

  const filteredFirms = useMemo(() => {
    if (!search) return firms;
    return firms.filter(f => f.name?.toLowerCase().includes(search.toLowerCase()));
  }, [firms, search]);

  const formatRuleValue = (key: string, value: any) => {
    if (value === null || value === undefined) return 'Not specified';
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'boolean') return value ? '✅ Allowed' : '❌ Not Allowed';
    if (key.includes('drawdown') || key.includes('target')) return `${value}%`;
    if (key.includes('days')) return `${value} days`;
    if (key.includes('time')) return `${value} min`;
    return String(value);
  };

  const getProgramTypeColor = (type: string) => {
    if (type?.toLowerCase().includes('instant')) return 'from-green-500 to-emerald-500';
    if (type?.toLowerCase().includes('evaluation')) return 'from-blue-500 to-purple-500';
    if (type?.toLowerCase().includes('express')) return 'from-orange-500 to-red-500';
    if (type?.toLowerCase().includes('rapid')) return 'from-pink-500 to-rose-500';
    return 'from-purple-500 to-pink-500';
  };

  const getProgramTypeIcon = (type: string) => {
    if (type?.toLowerCase().includes('instant')) return <Rocket size={14} />;
    if (type?.toLowerCase().includes('evaluation')) return <Target size={14} />;
    if (type?.toLowerCase().includes('express')) return <Zap size={14} />;
    if (type?.toLowerCase().includes('rapid')) return <Flame size={14} />;
    return <Layers size={14} />;
  };

  const allProgramTypes = useMemo(() => {
    const types = new Set<string>();
    firms.forEach(firm => {
      firm.programs?.forEach((program: any) => {
        if (program.type) types.add(program.type);
      });
    });
    return Array.from(types);
  }, [firms]);

  const selectedFirm = firms.find(f => f.id === selectedFirmId);

  if (selectedFirm) {
    const programs = selectedFirm.programs || [];
    const filteredPrograms = selectedProgramType === "all" 
      ? programs 
      : programs.filter((p: any) => p.type === selectedProgramType);

    return (
      <div>
        <button 
          onClick={() => setSelectedFirmId(null)} 
          className="flex items-center gap-1 text-purple-400 text-sm mb-4 hover:text-purple-300 transition-colors"
        >
          ← Back to all firms
        </button>
        
        <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4 mb-4">
          <div className="flex items-center gap-3">
            <FirmLogo firm={selectedFirm} size="md" />
            <div className="flex-1">
              <h3 className="text-white font-bold text-base">{selectedFirm.name}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Globe size={10} /> {selectedFirm.country || 'International'}
                </span>
                {selectedFirm.trustScore > 0 && (
                  <TrustScoreBadge score={selectedFirm.trustScore} size="sm" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedProgramType("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedProgramType === "all" 
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" 
                : "bg-zinc-800/50 text-zinc-400 border border-zinc-700"
            }`}
          >
            All Programs ({programs.length})
          </button>
          {allProgramTypes.map((type) => {
            const count = programs.filter((p: any) => p.type === type).length;
            return (
              <button
                key={type}
                onClick={() => setSelectedProgramType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedProgramType === type 
                    ? `bg-gradient-to-r ${getProgramTypeColor(type)} text-white` 
                    : "bg-zinc-800/50 text-zinc-400 border border-zinc-700"
                }`}
              >
                {getProgramTypeIcon(type)} {type} ({count})
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          {filteredPrograms.map((program: any, idx: number) => {
            const accountOptions = program.accountOptions || [];
            
            return (
              <div key={idx} className="bg-zinc-900/80 rounded-xl border border-zinc-800 overflow-hidden">
                <div className={`bg-gradient-to-r ${getProgramTypeColor(program.type)} p-3`}>
                  <div className="flex items-center gap-2">
                    {getProgramTypeIcon(program.type)}
                    <h4 className="text-white font-bold text-sm">{program.type || 'Program'}</h4>
                    {program.description && (
                      <span className="text-white/80 text-[10px] ml-2">{program.description}</span>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  {program.rules && Object.keys(program.rules).length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs text-zinc-500 mb-2 flex items-center gap-1">
                        <BookOpen size={12} /> Trading Rules
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(program.rules).map(([key, value]) => {
                          if (value === null || value === undefined || value === '') return null;
                          
                          const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                          const isPositive = key.includes('target') || key.includes('profit');
                          const isNegative = key.includes('drawdown') || key.includes('loss');
                          
                          return (
                            <div key={key} className="bg-zinc-800/30 rounded-lg p-2.5">
                              <div className="text-zinc-500 text-[9px] uppercase tracking-wider">{formattedKey}</div>
                              <div className={`text-sm font-bold mt-0.5 ${
                                isPositive ? 'text-green-400' : 
                                isNegative ? 'text-red-400' : 
                                'text-white'
                              }`}>
                                {formatRuleValue(key, value)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {accountOptions.length > 0 && (
                    <div>
                      <div className="text-xs text-zinc-500 mb-2 flex items-center gap-1">
                        <Wallet size={12} /> Account Options
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {accountOptions.map((opt: any, i: number) => (
                          <div key={i} className="bg-zinc-800/30 rounded-lg p-3 text-center border border-zinc-700/50">
                            <div className="text-white font-bold text-sm">${opt.accountSize?.toLocaleString() || '—'}</div>
                            <div className="text-green-400 text-xs font-medium mt-1">${opt.price || '—'}</div>
                            <div className="flex items-center justify-center gap-1 mt-1.5">
                              <div className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                                {opt.payoutPercentage || opt.payout || 80}% payout
                              </div>
                            </div>
                            {opt.leverage && (
                              <div className="text-[9px] text-zinc-500 mt-1">Leverage: {opt.leverage}x</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => {
                      console.log('View full details for', selectedFirm.name);
                    }}
                    className="w-full mt-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    View Full Details <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPrograms.length === 0 && (
          <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <Target size={32} className="text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No programs found</p>
            <p className="text-zinc-600 text-xs mt-1">Try selecting a different program type</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
        <input 
          type="text" 
          placeholder="Search prop firms..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-purple-500" 
        />
      </div>

      <div className="text-xs text-zinc-500">{filteredFirms.length} firms</div>

      <div className="space-y-2">
        {filteredFirms.map((firm) => {
          const programCount = firm.programs?.length || 0;
          const programTypes = firm.programs?.map((p: any) => p.type).filter(Boolean) || [];
          
          return (
            <button 
              key={firm.id} 
              onClick={() => setSelectedFirmId(firm.id)} 
              className="w-full bg-zinc-900/80 rounded-xl p-4 border border-zinc-800 text-left active:bg-zinc-800 transition-all hover:border-zinc-700"
            >
              <div className="flex items-center gap-3">
                <FirmLogo firm={firm} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-white font-medium text-sm truncate">{firm.name}</div>
                    <ChevronRight size={16} className="text-zinc-500 flex-shrink-0 ml-2" />
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-zinc-500 text-[10px]">{programCount} programs</span>
                    {programTypes.length > 0 && (
                      <div className="flex gap-1">
                        {programTypes.slice(0, 2).map((type: string, i: number) => (
                          <span key={i} className={`text-[8px] bg-gradient-to-r ${getProgramTypeColor(type)} px-1.5 py-0.5 rounded-full text-white`}>
                            {type}
                          </span>
                        ))}
                        {programTypes.length > 2 && (
                          <span className="text-[8px] text-zinc-500">+{programTypes.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filteredFirms.length === 0 && (
        <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <Building2 size={32} className="text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">No prop firms found</p>
        </div>
      )}
    </div>
  );
}

// ============ MAIN COMPONENT ============
export default function MobilePropFirms() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"firms" | "offers" | "rules" | "reviews">("firms");
  const [firms, setFirms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "instant" | "evaluation">("all");
  const [enrichedFirms, setEnrichedFirms] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.getPropFirms();
        if (response.success) setFirms(response.data || []);
      } catch (err) {
        console.error('Failed to fetch prop firms:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const enrichFirms = async () => {
      if (firms.length === 0) return;
      
      const enriched = await Promise.all(
        firms.map(async (firm) => {
          try {
            const reviewsRes = await fetch(`/api/reviews?propFirmId=${firm.id}&status=APPROVED&limit=100`);
            const reviewsData = await reviewsRes.json();
            let trustScore = 0, reviewCount = 0, avgRating = 0;
            
            if (reviewsRes.ok && reviewsData.reviews) {
              const stats = calculateTrustStats(reviewsData.reviews);
              trustScore = stats.trustScore;
              reviewCount = stats.reviewCount;
              avgRating = stats.avgRating;
            }
            
            const incidentsRes = await fetch(`/api/incidents?entityType=propFirm&entityId=${firm.id}&limit=1`);
            const incidentsData = await incidentsRes.json();
            const incidentCount = incidentsRes.ok ? incidentsData.pagination?.total || 0 : 0;
            
            return { 
              ...firm, 
              trustScore, 
              reviewCount, 
              avgRating,
              incidentCount 
            };
          } catch (err) {
            return { ...firm, trustScore: 0, reviewCount: 0, avgRating: 0, incidentCount: 0 };
          }
        })
      );
      setEnrichedFirms(enriched);
    };
    enrichFirms();
  }, [firms]);

  const filteredFirms = useMemo(() => {
    let filtered = [...enrichedFirms];
    if (search) filtered = filtered.filter(f => f.name?.toLowerCase().includes(search.toLowerCase()));
    if (typeFilter !== "all") {
      filtered = filtered.filter(f => f.programs?.some((p: any) => 
        typeFilter === "instant" ? p.type === "Instant Funding" : p.type?.includes("Evaluation")
      ));
    }
    return filtered;
  }, [enrichedFirms, search, typeFilter]);

  const totalPages = Math.ceil(filteredFirms.length / itemsPerPage);
  const paginatedFirms = filteredFirms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const totalReviews = enrichedFirms.reduce((sum, f) => sum + (f.reviewCount || 0), 0);
  const totalIncidents = enrichedFirms.reduce((sum, f) => sum + (f.incidentCount || 0), 0);

  const handleNavigate = (id: number, name: string) => {
    router.push(`/prop-firms/${id}`);
  };

  if (loading) {
    return (
      <MobileLayout title="Prop Firms" showSearch={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" /><p className="text-xs text-zinc-500 mt-3">Loading prop firms...</p></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Prop Firms" showSearch={false}>
      <div className="space-y-4 pb-6">
        
        {/* Hero Stats */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-4 border border-purple-500/30">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{enrichedFirms.length}</div>
              <div className="text-xs text-zinc-400">Prop Firms</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{totalReviews.toLocaleString()}</div>
              <div className="text-xs text-zinc-400">Reviews</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">{totalIncidents}</div>
              <div className="text-xs text-zinc-400">Reports</div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-1 bg-zinc-900/50 rounded-xl p-1 border border-zinc-800">
          <button onClick={() => { setActiveTab("firms"); setCurrentPage(1); setSearch(""); }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "firms" ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg" : "text-zinc-400"}`}>
            📋 Firms
          </button>
          <button onClick={() => { setActiveTab("offers"); setCurrentPage(1); setSearch(""); }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "offers" ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg" : "text-zinc-400"}`}>
            🎁 Offers
          </button>
          <button onClick={() => { setActiveTab("rules"); setCurrentPage(1); setSearch(""); }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "rules" ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg" : "text-zinc-400"}`}>
            📜 Rules
          </button>
          <button onClick={() => { setActiveTab("reviews"); setCurrentPage(1); setSearch(""); }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "reviews" ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg" : "text-zinc-400"}`}>
            ⭐ Reviews
          </button>
        </div>

        {/* SPONSORED CARD */}
        <SponsoredCard />

        {/* FIRMS TAB - WITHOUT COMMUNITY RATINGS */}
        {activeTab === "firms" && (
          <>
            <div className="flex gap-2">
              {[
                { id: "all", label: "All Firms", count: enrichedFirms.length },
                { id: "instant", label: "Instant Funding", count: enrichedFirms.filter(f => f.programs?.some((p: any) => p.type === "Instant Funding")).length },
                { id: "evaluation", label: "Evaluation", count: enrichedFirms.filter(f => f.programs?.some((p: any) => p.type?.includes("Evaluation"))).length }
              ].map((filter) => (
                <button key={filter.id} onClick={() => { setTypeFilter(filter.id as any); setCurrentPage(1); }} className={`flex-1 px-2 py-2 rounded-xl text-xs font-medium transition-all ${
                  typeFilter === filter.id ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : "bg-zinc-800/50 text-zinc-400 border border-zinc-800"
                }`}>
                  {filter.label} <span className="ml-1 opacity-70">({filter.count})</span>
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              <input type="text" placeholder="Search prop firms..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-purple-500" />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-500">{filteredFirms.length} firms found</span>
            </div>

            <div className="space-y-3">
              {paginatedFirms.map((firm) => (
                <FirmCard key={firm.id} firm={firm} onPress={() => handleNavigate(firm.id, firm.name)} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 py-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-xs disabled:opacity-50">Prev</button>
                <span className="px-3 py-1.5 text-zinc-400 text-xs">{currentPage} / {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-xs disabled:opacity-50">Next</button>
              </div>
            )}

            {filteredFirms.length === 0 && (
              <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <Building2 size={32} className="text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">No prop firms found</p>
                <p className="text-zinc-600 text-xs mt-1">Try adjusting your search</p>
              </div>
            )}
          </>
        )}

        {/* OFFERS TAB */}
        {activeTab === "offers" && <OffersTab firms={enrichedFirms} />}

        {/* RULES TAB */}
        {activeTab === "rules" && <RulesTab firms={enrichedFirms} />}

        {/* REVIEWS TAB */}
        {activeTab === "reviews" && <MobileReviewsTab />}

        {/* Footer */}
        <div className="text-center text-[10px] text-zinc-600 py-4">Data is community-reported and verified. Always do your own research.</div>
      </div>
    </MobileLayout>
  );
}