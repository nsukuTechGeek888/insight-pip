// components/prop-firms/MobileReviewsTab.tsx - COMPLETE FIXED VERSION
'use client';

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import MobileLayout from "@/components/mobile/MobileLayout";
import TrustScoreBadge from "@/components/ui/TrustScoreBadge";
import { formatCurrency } from "@/utils/api-helpers";
import { 
  Star, Search, MessageCircle, ThumbsUp, Flag, 
  CheckCircle2, AlertTriangle, Building2,
  TrendingUp, Shield, Smartphone, Rocket, 
  Flame, Wallet, Headphones, ChevronRight,
  Globe, Clock, BadgeCheck, Layers, Monitor,
  Landmark, Gift, Percent, Users  // <-- Users added
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
  if (!firm || !firm.programs) return [];
  return firm.programs.flatMap((program: any) => program.accountOptions || []);
};

const getMaxPayout = (firm: any) => {
  const accountOptions = getAllAccountOptions(firm);
  if (accountOptions.length === 0) return firm.payoutPercentage || 0;
  return Math.max(...accountOptions.map((acc: any) => {
    const payout = acc.payoutPercentage || acc.payout || 0;
    return typeof payout === 'string' ? parseInt(payout.replace('%', '')) : payout;
  }));
};

const getMinAccountSize = (firm: any) => {
  const accountOptions = getAllAccountOptions(firm);
  if (accountOptions.length === 0) return firm.minDeposit || 0;
  return Math.min(...accountOptions.map((acc: any) => acc.accountSize || 0));
};

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

// Calculate trust stats from reviews
const calculateTrustStatsFromReviews = (reviews: any[]) => {
  if (!reviews || reviews.length === 0) return { 
    avgTrustScore: 0, 
    totalReviews: 0,
    avgTradingConditions: 0,
    avgCustomerCare: 0,
    avgUserFriendliness: 0,
    avgPayoutProcess: 0,
    avgRating: 0
  };
  
  const totalReviews = reviews.length;
  let sumTradingConditions = 0;
  let sumCustomerCare = 0;
  let sumUserFriendliness = 0;
  let sumPayoutProcess = 0;
  let sumRating = 0;
  let sumTrustScore = 0;
  let hasTradingData = false;
  let hasCustomerData = false;
  let hasUsabilityData = false;
  let hasPayoutData = false;
  
  reviews.forEach(review => {
    sumRating += review.rating || 0;
    sumTrustScore += review.trustScore || 0;
    
    const tradingVal = review.tradingConditions || review.executionQuality || 0;
    if (tradingVal > 0) {
      sumTradingConditions += tradingVal;
      hasTradingData = true;
    }
    
    const customerVal = review.customerCare || review.customerSupport || 0;
    if (customerVal > 0) {
      sumCustomerCare += customerVal;
      hasCustomerData = true;
    }
    
    const usabilityVal = review.userFriendliness || review.platformStability || 0;
    if (usabilityVal > 0) {
      sumUserFriendliness += usabilityVal;
      hasUsabilityData = true;
    }
    
    const payoutVal = review.payoutProcess || review.withdrawalExperience || 0;
    if (payoutVal > 0) {
      sumPayoutProcess += payoutVal;
      hasPayoutData = true;
    }
  });
  
  return { 
    avgTrustScore: totalReviews > 0 ? Math.round(sumTrustScore / totalReviews) : 0,
    totalReviews,
    avgTradingConditions: hasTradingData ? Number((sumTradingConditions / totalReviews).toFixed(1)) : 0,
    avgCustomerCare: hasCustomerData ? Number((sumCustomerCare / totalReviews).toFixed(1)) : 0,
    avgUserFriendliness: hasUsabilityData ? Number((sumUserFriendliness / totalReviews).toFixed(1)) : 0,
    avgPayoutProcess: hasPayoutData ? Number((sumPayoutProcess / totalReviews).toFixed(1)) : 0,
    avgRating: Number((sumRating / totalReviews).toFixed(1))
  };
};

// ============ STAR RATING ============
function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizes = { sm: "w-3.5 h-3.5", md: "w-5 h-5" };
  const displayRating = Math.min(5, Math.max(0, rating || 0));
  
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star 
          key={i} 
          className={`${sizes[size]} ${i <= Math.floor(displayRating) ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}`} 
        />
      ))}
    </div>
  );
}

// ============ REVIEW CARD ============
function ReviewCard({ review, onHelpful }: { review: any; onHelpful: (id: number) => void }) {
  const [helpfulClicked, setHelpfulClicked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isLong = review.content?.length > 150;

  return (
    <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${generateGradient(review.userName || 'User')} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
          {review.userName?.charAt(0) || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold text-sm">{review.userName || 'Anonymous Trader'}</span>
            {review.verified && <CheckCircle2 size={12} className="text-blue-400" />}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={review.rating} size="sm" />
            <span className="text-xs text-zinc-500">{review.date}</span>
          </div>
        </div>
        {review.trustScore > 0 && <TrustScoreBadge score={review.trustScore} size="sm" />}
      </div>

      <h4 className="text-white font-semibold text-sm mb-2">{review.title}</h4>
      
      <p className={`text-zinc-300 text-xs leading-relaxed ${!expanded && isLong ? 'line-clamp-3' : ''}`}>
        {review.content}
      </p>
      
      {isLong && (
        <button onClick={() => setExpanded(!expanded)} className="text-purple-400 text-xs mt-1">
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}

      <div className="flex items-center gap-4 mt-3 pt-2 border-t border-zinc-800">
        <button 
          onClick={() => { if (!helpfulClicked) { onHelpful(review.id); setHelpfulClicked(true); } }} 
          className={`flex items-center gap-1 text-xs ${helpfulClicked ? 'text-green-400' : 'text-zinc-500'}`}
        >
          <ThumbsUp size={12} /> Helpful ({review.helpful || 0})
        </button>
        <button className="flex items-center gap-1 text-xs text-zinc-500">
          <Flag size={12} /> Report
        </button>
      </div>
    </div>
  );
}

// ============ MAIN FIRM CARD - WITH LOGO ============
function ReviewsFirmCard({ firm, onPress, onWriteReview }: { 
  firm: any; 
  onPress: () => void; 
  onWriteReview: () => void;
}) {
  const trustScore = firm.trustScore || 0;
  const reviewCount = firm.reviewCount || 0;
  const rating = firm.avgRating || 0;
  const maxPayout = getMaxPayout(firm);
  const minAccount = getMinAccountSize(firm);
  const incidentCount = firm.incidentCount || 0;
  const isRegulated = firm.regulated || (firm.regulatoryBodies && firm.regulatoryBodies.length > 0);
  const yearsInOperation = firm.yearsInOperation || firm.years || 0;
  const country = firm.country || 'International';
  
  const tradingConditions = firm.avgTradingConditions || 0;
  const customerCare = firm.avgCustomerCare || 0;
  const userFriendliness = firm.avgUserFriendliness || 0;
  const payoutProcess = firm.avgPayoutProcess || 0;
  
  const programs = firm.programs || [];
  const programTypes = programs.map((p: any) => p.type || p.name).filter(Boolean);
  const platforms = firm.platforms || firm.platform || [];
  const regulations = firm.regulatoryBodies || [];
  
  const isTopRated = rating >= 4.5 && reviewCount > 10;
  const hasOffer = firm.promotions && firm.promotions.length > 0;

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      <div className="p-4">
        {/* Header - WITH LOGO */}
        <div className="flex items-start gap-3 mb-4">
          <div className="relative">
            <FirmLogo firm={firm} size="md" />
            {isTopRated && (
              <div className="absolute -top-1 -right-1">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-1.5 py-0.5 rounded-full text-[8px] font-bold flex items-center gap-0.5">
                  <Flame size={8} /> TOP
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-base">{firm.name}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <div className="flex items-center gap-1">
                <StarRating rating={rating} size="sm" />
                <span className="text-xs text-zinc-500">({rating.toFixed(1)})</span>
              </div>
              {trustScore > 0 && <TrustScoreBadge score={trustScore} size="sm" />}
              {isRegulated && <BadgeCheck size={14} className="text-green-400" />}
              <span className="text-xs text-zinc-500">{reviewCount} reviews</span>
            </div>
            {/* Quick Info */}
            <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-zinc-400">
              <span className="flex items-center gap-1"><Globe size={10} /> {country}</span>
              {yearsInOperation > 0 && (
                <span className="flex items-center gap-1"><Clock size={10} /> {yearsInOperation}y</span>
              )}
              {incidentCount > 0 && (
                <span className="flex items-center gap-1 text-red-400"><AlertTriangle size={10} /> {incidentCount}</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-500/10 rounded-lg p-2.5 text-center border border-green-500/20">
            <div className="text-zinc-500 text-[10px]">Max Payout</div>
            <div className="text-green-400 font-bold text-base">{maxPayout}%</div>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-2.5 text-center border border-blue-500/20">
            <div className="text-zinc-500 text-[10px]">Min Account</div>
            <div className="text-blue-400 font-bold text-base">
              {minAccount > 0 ? formatCurrency(minAccount) : 'N/A'}
            </div>
          </div>
        </div>

        {/* Community Ratings Progress Bars */}
        <div className="space-y-2 mb-4">
          <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
            <Users size={12} /> Community Ratings
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 w-20"><TrendingUp size={11} className="text-green-400" /><span className="text-[11px] text-zinc-400">Trading</span></div>
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: `${(tradingConditions / 5) * 100}%` }} />
            </div>
            <span className="text-[11px] font-medium text-green-400 w-8 text-right">{tradingConditions > 0 ? tradingConditions.toFixed(1) : 'N/A'}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 w-20"><Headphones size={11} className="text-purple-400" /><span className="text-[11px] text-zinc-400">Support</span></div>
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" style={{ width: `${(customerCare / 5) * 100}%` }} />
            </div>
            <span className="text-[11px] font-medium text-purple-400 w-8 text-right">{customerCare > 0 ? customerCare.toFixed(1) : 'N/A'}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 w-20"><Smartphone size={11} className="text-blue-400" /><span className="text-[11px] text-zinc-400">Platform</span></div>
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: `${(userFriendliness / 5) * 100}%` }} />
            </div>
            <span className="text-[11px] font-medium text-blue-400 w-8 text-right">{userFriendliness > 0 ? userFriendliness.toFixed(1) : 'N/A'}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 w-20"><Rocket size={11} className="text-yellow-400" /><span className="text-[11px] text-zinc-400">Payouts</span></div>
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full" style={{ width: `${(payoutProcess / 5) * 100}%` }} />
            </div>
            <span className="text-[11px] font-medium text-yellow-400 w-8 text-right">{payoutProcess > 0 ? payoutProcess.toFixed(1) : 'N/A'}</span>
          </div>
        </div>

        {/* Programs */}
        {programTypes.length > 0 && (
          <div className="mb-3">
            <div className="text-zinc-500 text-[10px] mb-1.5 flex items-center gap-1">
              <Layers size={12} /> Programs
            </div>
            <div className="flex flex-wrap gap-1.5">
              {programTypes.slice(0, 3).map((type: string, i: number) => (
                <span key={i} className="text-[9px] bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">{type}</span>
              ))}
              {programTypes.length > 3 && (
                <span className="text-[9px] text-zinc-500">+{programTypes.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {/* Platforms */}
        {platforms.length > 0 && (
          <div className="mb-3">
            <div className="text-zinc-500 text-[10px] mb-1.5 flex items-center gap-1">
              <Monitor size={12} /> Platforms
            </div>
            <div className="flex flex-wrap gap-1.5">
              {platforms.slice(0, 3).map((p: string, i: number) => (
                <span key={i} className="text-[9px] bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full">{p}</span>
              ))}
              {platforms.length > 3 && (
                <span className="text-[9px] text-zinc-500">+{platforms.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {/* Regulation */}
        {regulations.length > 0 && (
          <div className="mb-3">
            <div className="text-zinc-500 text-[10px] mb-1.5 flex items-center gap-1">
              <Landmark size={12} /> Regulation
            </div>
            <div className="flex flex-wrap gap-1.5">
              {regulations.slice(0, 2).map((reg: string, i: number) => (
                <span key={i} className="text-[9px] bg-green-900/50 text-green-300 px-2 py-1 rounded-full">{reg}</span>
              ))}
              {regulations.length > 2 && (
                <span className="text-[9px] text-zinc-500">+{regulations.length - 2}</span>
              )}
            </div>
          </div>
        )}

        {/* Offer */}
        {hasOffer && (
          <div className="mb-3 p-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
            <div className="flex items-center gap-1.5">
              <Gift size={10} className="text-amber-400" />
              <span className="text-[8px] font-semibold text-amber-400 uppercase tracking-wider">Offer</span>
              {firm.promotions[0]?.discount && (
                <span className="text-[8px] bg-green-500/20 text-green-400 px-1 py-0.5 rounded-full">
                  {firm.promotions[0].discount}% OFF
                </span>
              )}
            </div>
            <p className="text-white text-xs font-medium mt-0.5">{firm.promotions[0]?.name || "Special Discount"}</p>
          </div>
        )}

        {/* Incident Badge */}
        {incidentCount > 0 && (
          <div className="mb-3 flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded-full w-fit">
            <AlertTriangle size={10} className="text-red-400" />
            <span className="text-[10px] text-red-400">{incidentCount} incidents</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button onClick={onPress} className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
            <MessageCircle size={14} /> Reviews ({reviewCount})
          </button>
          <button onClick={onWriteReview} className="px-3 py-2.5 bg-zinc-800 text-zinc-300 rounded-lg text-sm font-medium flex items-center justify-center gap-1">
            <Star size={14} /> Rate
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MobileReviewsTab() {
  const router = useRouter();
  const [firmsData, setFirmsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [firmIncidents, setFirmIncidents] = useState<Record<number, number>>({});
  const [enrichedFirms, setEnrichedFirms] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "reviews" | "incidents" | "payout">("rating");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFirm, setSelectedFirm] = useState<any>(null);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const CARDS_PER_PAGE = 10;

  // Fetch firms data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.getPropFirms();
        if (response.success) setFirmsData(response.data || []);
      } catch (err) {
        console.error('Error fetching prop firms:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Enrich firms with review stats
  useEffect(() => {
    const enrichFirms = async () => {
      if (firmsData.length === 0) return;
      
      const enriched = await Promise.all(
        firmsData.map(async (firm) => {
          try {
            const response = await fetch(`/api/reviews?propFirmId=${firm.id}&status=APPROVED&limit=100`);
            const data = await response.json();
            
            if (response.ok && data.reviews && data.reviews.length > 0) {
              const stats = calculateTrustStatsFromReviews(data.reviews);
              return { 
                ...firm, 
                trustScore: stats.avgTrustScore, 
                reviewCount: stats.totalReviews,
                avgRating: stats.avgRating,
                avgTradingConditions: stats.avgTradingConditions,
                avgCustomerCare: stats.avgCustomerCare,
                avgUserFriendliness: stats.avgUserFriendliness,
                avgPayoutProcess: stats.avgPayoutProcess
              };
            }
          } catch (err) {
            console.error(`Error fetching reviews for firm ${firm.id}:`, err);
          }
          return { 
            ...firm, 
            trustScore: firm.trustScore || 0, 
            reviewCount: firm.reviewsCount || 0,
            avgRating: firm.rating || 0,
            avgTradingConditions: 0,
            avgCustomerCare: 0,
            avgUserFriendliness: 0,
            avgPayoutProcess: 0
          };
        })
      );
      
      setEnrichedFirms(enriched);
    };
    
    enrichFirms();
  }, [firmsData]);

  // Fetch incidents for each firm
  useEffect(() => {
    const fetchIncidents = async () => {
      if (enrichedFirms.length === 0) return;
      
      const incidentsMap: Record<number, number> = {};
      await Promise.all(
        enrichedFirms.map(async (firm) => {
          try {
            const response = await fetch(`/api/incidents?entityType=propFirm&entityId=${firm.id}&limit=1`);
            const data = await response.json();
            if (response.ok && data.pagination) {
              incidentsMap[firm.id] = data.pagination.total;
            } else {
              incidentsMap[firm.id] = 0;
            }
          } catch (err) {
            incidentsMap[firm.id] = 0;
          }
        })
      );
      setFirmIncidents(incidentsMap);
    };
    
    fetchIncidents();
  }, [enrichedFirms]);

  // Fetch all reviews for the selected firm view
  useEffect(() => {
    const fetchAllReviews = async () => {
      try {
        const response = await fetch('/api/reviews?entityType=propFirm&status=APPROVED&limit=500');
        const data = await response.json();
        if (response.ok && data.reviews) {
          setAllReviews(data.reviews);
        }
      } catch (err) {
        console.error('Failed to fetch all reviews:', err);
      }
    };
    fetchAllReviews();
  }, []);

  // Merge incidents into firms
  const firmsWithIncidents = useMemo(() => {
    return enrichedFirms.map(firm => ({
      ...firm,
      incidentCount: firmIncidents[firm.id] || 0
    }));
  }, [enrichedFirms, firmIncidents]);

  // Filter and sort
  const filteredFirms = useMemo(() => {
    let filtered = [...firmsWithIncidents];
    
    if (search) {
      filtered = filtered.filter(f => f.name?.toLowerCase().includes(search.toLowerCase()));
    }
    
    filtered.sort((a, b) => {
      if (sortBy === "rating") return (b.avgRating || 0) - (a.avgRating || 0);
      if (sortBy === "reviews") return (b.reviewCount || 0) - (a.reviewCount || 0);
      if (sortBy === "incidents") return (b.incidentCount || 0) - (a.incidentCount || 0);
      if (sortBy === "payout") return getMaxPayout(b) - getMaxPayout(a);
      return (b.avgRating || 0) - (a.avgRating || 0);
    });
    
    return filtered;
  }, [firmsWithIncidents, search, sortBy]);

  const totalPages = Math.ceil(filteredFirms.length / CARDS_PER_PAGE);
  const paginatedFirms = filteredFirms.slice((currentPage - 1) * CARDS_PER_PAGE, currentPage * CARDS_PER_PAGE);

  const getFirmReviews = (firmId: number) => {
    return allReviews.filter(r => r.propFirmId === firmId);
  };

  const handleHelpful = (reviewId: number) => {
    setAllReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpful: (r.helpful || 0) + 1 } : r));
  };

  // Selected firm view
  if (selectedFirm) {
    const firmReviews = getFirmReviews(selectedFirm.id);
    const avgRatingValue = firmReviews.length > 0 
      ? (firmReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / firmReviews.length).toFixed(1) 
      : '0';

    return (
      <div>
        <button onClick={() => setSelectedFirm(null)} className="flex items-center gap-1 text-purple-400 text-sm mb-4">← Back to all firms</button>
        
        <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4 mb-4">
          <div className="flex items-center gap-3">
            <FirmLogo firm={selectedFirm} size="md" />
            <div className="flex-1">
              <h3 className="text-white font-bold text-base">{selectedFirm.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={parseFloat(avgRatingValue)} size="sm" />
                <span className="text-xs text-zinc-500">({firmReviews.length} reviews)</span>
                {selectedFirm.trustScore > 0 && <TrustScoreBadge score={selectedFirm.trustScore} size="sm" />}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {firmReviews.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <MessageCircle size={32} className="text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">No reviews yet</p>
              <p className="text-zinc-600 text-xs mt-1">Be the first to share your experience</p>
            </div>
          ) : (
            firmReviews.map((review) => (
              <ReviewCard key={review.id} review={review} onHelpful={handleHelpful} />
            ))
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" /><p className="text-xs text-zinc-500 mt-3">Loading reviews...</p></div>
      </div>
    );
  }

  // Main view
  return (
    <div className="space-y-4">
      
      {/* Search and Sort */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
          <input
            type="text"
            placeholder="Search prop firms..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500"
        >
          <option value="rating">Highest Rated</option>
          <option value="reviews">Most Reviews</option>
          <option value="payout">Highest Payout</option>
          <option value="incidents">Most Incidents</option>
        </select>
      </div>

      {/* Results count */}
      <div className="text-xs text-zinc-500">{filteredFirms.length} firms found</div>

      {/* Firm Cards - WITH LOGOS */}
      <div className="space-y-3">
        {paginatedFirms.map((firm) => (
          <ReviewsFirmCard
            key={firm.id}
            firm={firm}
            onPress={() => setSelectedFirm(firm)}
            onWriteReview={() => console.log('Write review for', firm.name)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 py-2">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-xs disabled:opacity-50">Prev</button>
          <span className="px-3 py-1.5 text-zinc-400 text-xs">{currentPage} / {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-xs disabled:opacity-50">Next</button>
        </div>
      )}

      {/* No Results */}
      {filteredFirms.length === 0 && (
        <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <MessageCircle size={32} className="text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">No prop firms found</p>
          <p className="text-zinc-600 text-xs mt-1">Try adjusting your search</p>
        </div>
      )}
    </div>
  );
}