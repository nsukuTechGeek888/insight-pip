// components/offers/MobileOffers.tsx - FULLY UPDATED WITH REGION AWARENESS

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
  ChevronDown, ChevronUp, AlertCircle, Building2, Monitor,
  Globe, BadgeCheck
} from "lucide-react";
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
function StarRating({ rating, reviewCount = 0, size = "sm" }: { rating: number; reviewCount?: number; size?: "sm" | "md" }) {
  const sizes = { sm: "w-3 h-3", md: "w-4 h-4" };
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
          <span className="text-xs text-white ml-0.5">{displayRating.toFixed(1)}</span>
          <span className="text-[10px] text-zinc-500">({reviewCount})</span>
        </>
      ) : (
        <span className="text-[10px] text-zinc-500 ml-0.5">No reviews</span>
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

// Offer Item Component for individual offers inside expanded section
function OfferItem({ offer, type, onCopy, copiedId }: { 
  offer: any; 
  type: 'prop' | 'broker';
  onCopy: (id: string) => void;
  copiedId: string | null;
}) {
  const isProp = type === 'prop';
  const discount = offer?.discount;
  const amount = offer?.amount;
  const code = offer?.code;
  const name = offer?.name;
  const offerId = `${type}-${offer?.code || name || Date.now()}`;
  const isCopied = copiedId === offerId;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (code) {
      navigator.clipboard.writeText(code);
      onCopy(offerId);
      setTimeout(() => onCopy(null), 2000);
    }
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            {isProp ? (
              <Rocket size={10} className="text-orange-400" />
            ) : (
              <Gift size={10} className="text-purple-400" />
            )}
            <span className="text-xs font-semibold text-white">{name || (isProp ? "Challenge Discount" : "Bonus Offer")}</span>
          </div>
          
          {(discount || amount) && (
            <div className="mb-1">
              {discount && (
                <span className="text-xs font-bold text-green-400">{discount}% OFF</span>
              )}
              {amount && (
                <span className="text-xs font-bold text-purple-400 ml-1">{amount}</span>
              )}
            </div>
          )}
          
          {offer?.description && (
            <p className="text-[10px] text-zinc-400">{offer.description}</p>
          )}
        </div>
        
        {code && (
          <button
            onClick={handleCopy}
            className="text-zinc-400 hover:text-orange-400 transition-colors p-1.5 bg-zinc-800 rounded-lg flex-shrink-0"
          >
            {isCopied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
          </button>
        )}
      </div>
      {code && !isCopied && (
        <div className="mt-2">
          <code className="text-[10px] font-mono bg-zinc-900 px-2 py-1 rounded text-orange-400">
            Code: {code}
          </code>
        </div>
      )}
    </div>
  );
}

// Prop Firm Offer Card with Logo
function PropFirmOfferCard({ firm, onNavigate, onCopy, copiedId }: { 
  firm: any; 
  onNavigate: (id: number, name: string) => void;
  onCopy: (id: string) => void;
  copiedId: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  
  const promotions = firm.promotions || [];
  const primaryPromotion = promotions[0];
  const additionalPromotions = promotions.slice(1);
  const hasMultipleOffers = additionalPromotions.length > 0;
  
  const maxPayout = getMaxPayout(firm);
  const minPrice = getMinPrice(firm);
  const minAccount = getMinAccountSize(firm);

  const handleCardClick = () => {
    onNavigate(firm.id, firm.name);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden"
    >
      {/* Main Card Content */}
      <div className="p-4" onClick={handleCardClick}>
        {/* Header with Logo */}
        <div className="flex items-start gap-3 mb-3">
          <FirmLogo firm={firm} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-white font-bold text-base truncate">{firm.name}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <StarRating rating={firm.rating || 0} reviewCount={firm.totalReviews || 0} size="sm" />
                  {firm.regulated && (
                    <BadgeCheck size={12} className="text-green-400" />
                  )}
                  {hasMultipleOffers && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <Tag size={8} /> {promotions.length} Offers
                    </span>
                  )}
                </div>
              </div>
              {primaryPromotion?.discount && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-0.5">
                  <Percent size={8} />
                  {primaryPromotion.discount}% OFF
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
            <div className="text-zinc-500 text-[10px]">Min Account</div>
            <div className="text-white font-semibold text-xs">{formatCurrency(minAccount)}</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
            <div className="text-zinc-500 text-[10px]">Payout</div>
            <div className="text-white font-semibold text-xs">Up to {maxPayout}%</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
            <div className="text-zinc-500 text-[10px]">Starting Price</div>
            <div className="text-white font-semibold text-xs">{formatCurrency(minPrice)}</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
            <div className="text-zinc-500 text-[10px]">Programs</div>
            <div className="text-white font-semibold text-xs">{firm.programs?.length || 0}</div>
          </div>
        </div>

        {/* Programs Summary */}
        {firm.programs && firm.programs.length > 0 && (
          <div className="mb-3">
            <div className="text-zinc-500 text-[10px] mb-1">Available Programs</div>
            <div className="flex flex-wrap gap-1">
              {firm.programs.slice(0, 3).map((program: any, idx: number) => (
                <span key={idx} className="text-[9px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-700">
                  {program.type}
                </span>
              ))}
              {firm.programs.length > 3 && (
                <span className="text-[9px] text-zinc-500">+{firm.programs.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {/* Primary Offer Preview */}
        {primaryPromotion && (
          <div className="mb-3 p-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30">
            <div className="flex items-center gap-1.5 mb-1">
              <Rocket size={10} className="text-orange-400" />
              <span className="text-[10px] font-semibold text-orange-400 uppercase">Limited Offer</span>
            </div>
            <p className="text-white text-xs font-medium">{primaryPromotion.name || "Special Challenge Discount"}</p>
            {primaryPromotion.code && (
              <div className="flex items-center gap-2 mt-1">
                <code className="text-[10px] font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-orange-400">
                  {primaryPromotion.code}
                </code>
              </div>
            )}
          </div>
        )}

        {/* Expand Button for More Offers */}
        {hasMultipleOffers && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            {expanded ? (
              <>Show Less <ChevronUp size={12} /></>
            ) : (
              <>View {additionalPromotions.length} More {additionalPromotions.length === 1 ? 'Offer' : 'Offers'} <ChevronDown size={12} /></>
            )}
          </button>
        )}
      </div>

      {/* Expanded Additional Offers */}
      <AnimatePresence>
        {expanded && hasMultipleOffers && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-zinc-800"
          >
            <div className="p-4 space-y-2 bg-zinc-900/50">
              {additionalPromotions.map((promo: any, idx: number) => (
                <OfferItem
                  key={idx}
                  offer={promo}
                  type="prop"
                  onCopy={onCopy}
                  copiedId={copiedId}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Button */}
      <div className="p-4 pt-0">
        <div className="flex gap-2">
          <button
            onClick={() => {
              window.open(firm.signupLink || firm.affiliateLink || '#', '_blank');
            }}
            className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1"
          >
            Claim Offer <ArrowRight size={12} />
          </button>
          <button
            onClick={handleCardClick}
            className="px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white border border-zinc-700"
          >
            Details
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Broker Offer Card with Logo
function BrokerOfferCard({ broker, onNavigate, onCopy, copiedId }: { 
  broker: any; 
  onNavigate: (id: number, name: string) => void;
  onCopy: (id: string) => void;
  copiedId: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  
  const bonuses = broker.bonuses || [];
  const promotions = broker.promotions || [];
  const allOffers = [...bonuses, ...promotions];
  const primaryOffer = allOffers[0];
  const additionalOffers = allOffers.slice(1);
  const hasMultipleOffers = additionalOffers.length > 0;

  const handleCardClick = () => {
    onNavigate(broker.id, broker.name);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden"
    >
      {/* Main Card Content */}
      <div className="p-4" onClick={handleCardClick}>
        {/* Header with Logo */}
        <div className="flex items-start gap-3 mb-3">
          <FirmLogo firm={broker} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-white font-bold text-base truncate">{broker.name}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <StarRating rating={broker.rating || 0} reviewCount={broker.reviewsCount || broker.reviews || 0} size="sm" />
                  {broker.regulated && (
                    <BadgeCheck size={12} className="text-green-400" />
                  )}
                  {hasMultipleOffers && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <Tag size={8} /> {allOffers.length} Offers
                    </span>
                  )}
                </div>
              </div>
              {primaryOffer?.amount && (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-0.5">
                  <Gift size={8} />
                  {primaryOffer.amount}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
            <div className="text-zinc-500 text-[10px]">Min Deposit</div>
            <div className="text-white font-semibold text-xs">{formatCurrency(broker.minDeposit || 0)}</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
            <div className="text-zinc-500 text-[10px]">Leverage</div>
            <div className="text-white font-semibold text-xs">{broker.leverage || '1:100'}</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
            <div className="text-zinc-500 text-[10px]">Spread</div>
            <div className="text-white font-semibold text-xs">{broker.spreads?.eurusd?.split('-')[0]?.trim() || '0.1'} pips</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
            <div className="text-zinc-500 text-[10px]">Platforms</div>
            <div className="text-white font-semibold text-xs">{broker.platform?.length || 0}</div>
          </div>
        </div>

        {/* Platforms Summary */}
        {broker.platform && broker.platform.length > 0 && (
          <div className="mb-3">
            <div className="text-zinc-500 text-[10px] mb-1">Trading Platforms</div>
            <div className="flex flex-wrap gap-1">
              {broker.platform.slice(0, 3).map((platform: string, idx: number) => (
                <span key={idx} className="text-[9px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-700">
                  {platform}
                </span>
              ))}
              {broker.platform.length > 3 && (
                <span className="text-[9px] text-zinc-500">+{broker.platform.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {/* Primary Offer Preview */}
        {primaryOffer && (
          <div className="mb-3 p-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
            <div className="flex items-center gap-1.5 mb-1">
              <Tag size={10} className="text-purple-400" />
              <span className="text-[10px] font-semibold text-purple-400 uppercase">Welcome Bonus</span>
            </div>
            <p className="text-white text-xs font-medium">{primaryOffer.amount || primaryOffer.name || "Exclusive Bonus"}</p>
            {primaryOffer.code && (
              <div className="flex items-center gap-2 mt-1">
                <code className="text-[10px] font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-purple-400">
                  {primaryOffer.code}
                </code>
              </div>
            )}
          </div>
        )}

        {/* Expand Button for More Offers */}
        {hasMultipleOffers && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            {expanded ? (
              <>Show Less <ChevronUp size={12} /></>
            ) : (
              <>View {additionalOffers.length} More {additionalOffers.length === 1 ? 'Offer' : 'Offers'} <ChevronDown size={12} /></>
            )}
          </button>
        )}
      </div>

      {/* Expanded Additional Offers */}
      <AnimatePresence>
        {expanded && hasMultipleOffers && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-zinc-800"
          >
            <div className="p-4 space-y-2 bg-zinc-900/50">
              {additionalOffers.map((offer: any, idx: number) => (
                <OfferItem
                  key={idx}
                  offer={offer}
                  type="broker"
                  onCopy={onCopy}
                  copiedId={copiedId}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Button */}
      <div className="p-4 pt-0">
        <div className="flex gap-2">
          <button
            onClick={() => {
              window.open(broker.website || broker.affiliateLink || '#', '_blank');
            }}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1"
          >
            Claim Bonus <ArrowRight size={12} />
          </button>
          <button
            onClick={handleCardClick}
            className="px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white border border-zinc-700"
          >
            Details
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function MobileOffers() {
  const router = useRouter();
  const { region } = useRegion(); // ✅ ADDED REGION
  const [activeTab, setActiveTab] = useState<"prop" | "broker">("prop");
  const [search, setSearch] = useState("");
  const [brokersData, setBrokersData] = useState<any[]>([]);
  const [propFirmsData, setPropFirmsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("discount-desc");
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
        console.error('Failed to load offers data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [region]); // ✅ ADDED region dependency

  // Filter firms with active offers - WITH REGION AWARENESS
  const propFirmsWithOffers = propFirmsData.filter(firm => {
    if (!firm.promotions || firm.promotions.length === 0) return false;
    return isAvailableInRegion(firm, region);
  });
  
  const brokersWithOffers = brokersData.filter(broker => {
    const hasOffer = (broker.bonuses && broker.bonuses.length > 0) || 
                     (broker.promotions && broker.promotions.length > 0);
    if (!hasOffer) return false;
    return isAvailableInRegion(broker, region);
  });

  // Filter and sort logic
  const filteredPropFirms = useMemo(() => {
    let filtered = [...propFirmsWithOffers];
    
    if (search) {
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (sortBy === "discount-desc") {
      filtered.sort((a, b) => {
        const discountA = a.promotions?.[0]?.discount || 0;
        const discountB = b.promotions?.[0]?.discount || 0;
        return discountB - discountA;
      });
    } else if (sortBy === "rating-desc") {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    
    return filtered;
  }, [propFirmsWithOffers, search, sortBy]);

  const filteredBrokers = useMemo(() => {
    let filtered = [...brokersWithOffers];
    
    if (search) {
      filtered = filtered.filter(b => 
        b.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (sortBy === "rating-desc") {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    
    return filtered;
  }, [brokersWithOffers, search, sortBy]);

  const handleNavigate = (id: number, name: string) => {
    router.push(`/${activeTab === 'prop' ? 'prop-firms' : 'brokers'}/${id}`);
  };

  const handleCopy = (id: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalActiveOffers = propFirmsWithOffers.reduce((sum, f) => sum + (f.promotions?.length || 0), 0) + 
                           brokersWithOffers.reduce((sum, b) => sum + ((b.bonuses?.length || 0) + (b.promotions?.length || 0)), 0);

  // Show empty state if no offers in region
  if (!loading && propFirmsWithOffers.length === 0 && brokersWithOffers.length === 0) {
    return (
      <MobileLayout title="Exclusive Offers" showSearch={false}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <Globe size={48} className="text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            No offers in {regionInfo.flag} {regionInfo.label}
          </h2>
          <p className="text-zinc-400 text-sm mb-4">
            We don't have any active offers available in {regionInfo.flag} {regionInfo.label} yet.
          </p>
          <button
            onClick={() => {
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
      <MobileLayout title="Exclusive Offers" showSearch={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-3 text-xs text-zinc-500">Loading offers...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Exclusive Offers" showSearch={false}>
      {/* ❌ REGION BANNER REMOVED - Users select region in navbar */}

      <div className="space-y-4 pb-6">
        
        {/* Header Stats */}
        <div className="bg-gradient-to-r from-purple-600/20 to-orange-600/20 rounded-2xl p-4 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-orange-400" />
            <span className="text-xs text-orange-400 font-medium">{totalActiveOffers} Active Offers</span>
          </div>
          <h1 className="text-xl font-bold text-white">
            Exclusive <span className="bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">Trading Offers</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Get the best deals on prop firm challenges and broker bonuses</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
          <input
            type="text"
            placeholder="Search offers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-sm"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveTab("prop");
              setSearch("");
            }}
            className={`flex-1 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-1 text-sm ${
              activeTab === "prop"
                ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                : "bg-zinc-800/50 text-zinc-400"
            }`}
          >
            <Rocket size={14} />
            Prop Firms
            {propFirmsWithOffers.length > 0 && (
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full ml-1">{propFirmsWithOffers.length}</span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab("broker");
              setSearch("");
            }}
            className={`flex-1 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-1 text-sm ${
              activeTab === "broker"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                : "bg-zinc-800/50 text-zinc-400"
            }`}
          >
            <Gift size={14} />
            Brokers
            {brokersWithOffers.length > 0 && (
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full ml-1">{brokersWithOffers.length}</span>
            )}
          </button>
        </div>

        {/* Sort Option */}
        {activeTab === "prop" && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              {filteredPropFirms.length} firms with offers
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-orange-500"
            >
              <option value="discount-desc">Highest Discount</option>
              <option value="rating-desc">Highest Rated</option>
            </select>
          </div>
        )}

        {/* Offers List */}
        <div className="space-y-3">
          {activeTab === "prop" ? (
            filteredPropFirms.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                <Percent size={24} className="text-zinc-500 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-white mb-1">No Prop Firm Offers</h3>
                <p className="text-xs text-zinc-400">No active promotions at the moment. Check back soon!</p>
              </div>
            ) : (
              filteredPropFirms.map((firm) => (
                <PropFirmOfferCard
                  key={firm.id}
                  firm={firm}
                  onNavigate={handleNavigate}
                  onCopy={handleCopy}
                  copiedId={copiedId}
                />
              ))
            )
          ) : (
            filteredBrokers.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                <Gift size={24} className="text-zinc-500 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-white mb-1">No Broker Bonuses</h3>
                <p className="text-xs text-zinc-400">No active bonuses at the moment. Check back soon!</p>
              </div>
            ) : (
              filteredBrokers.map((broker) => (
                <BrokerOfferCard
                  key={broker.id}
                  broker={broker}
                  onNavigate={handleNavigate}
                  onCopy={handleCopy}
                  copiedId={copiedId}
                />
              ))
            )
          )}
        </div>

        {/* Copy Success Toast */}
        <AnimatePresence>
          {copiedId && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-2 rounded-xl shadow-lg z-50"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                <span className="text-xs font-medium">Copied to clipboard!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MobileLayout>
  );
}