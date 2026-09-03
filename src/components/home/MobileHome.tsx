// components/home/MobileHome.tsx - REDESIGNED HOMEPAGE
// Product Experience: UNDERSTAND → DISCOVER → VERIFY → ACT

'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useRegion } from '@/contexts/RegionContext';
import { 
  Star, Shield, Building2, MessageCircle, 
  AlertTriangle, CheckCircle, ArrowRight, Users, 
  Eye, Clock, Award, Info, DollarSign, Wallet, 
  Gauge, Heart, RefreshCw, Flame, Crown, Gem, Gift, 
  Rocket, Tag, ShieldCheck, HelpCircle, XCircle, Activity, 
  Target, Smartphone, AlertCircle, TrendingUp, ChevronRight,
  Menu, Home, BarChart3, FileText, Settings, ChevronDown,
  ThumbsUp, ThumbsDown, ExternalLink, ChevronUp, Layers,
  Briefcase, LineChart, PiggyBank, Globe, Server, Monitor,
  CreditCard, Landmark, BadgeCheck,
  Trophy, Medal, Hash, Sparkles, Zap, Compass, GitCompare
} from 'lucide-react';
import { formatCurrency } from '@/utils/api-helpers';
import TrustScoreBadge from '@/components/ui/TrustScoreBadge';
import MobileLayout from '@/components/mobile/MobileLayout';

// ===================== DESIGN SYSTEM =====================
const COLORS = {
  surface: '#0a0a12',
  surfaceLight: '#12121f',
  surfaceCard: '#1a1a2e',
  border: '#1e1e32',
  borderLight: '#2a2a3e',
  textPrimary: '#ffffff',
  textSecondary: '#8a8aa0',
  textMuted: '#5a5a72',
  accent: '#2563eb',
  accentHover: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  gold: '#fbbf24',
  silver: '#9ca3af',
  bronze: '#d97706',
};

// ===================== REGION =====================
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

// ===================== HELPERS =====================
const calculateTrustStatsFromReviews = (reviews: any[]) => {
  if (!reviews || reviews.length === 0) {
    return { avgTrustScore: 0, totalReviews: 0 };
  }
  const avgTrustScore = reviews.reduce((sum, r) => sum + (r.trustScore || 0), 0) / reviews.length;
  return { avgTrustScore: Math.round(avgTrustScore), totalReviews: reviews.length };
};

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

// ===================== COMPONENTS =====================

// Star Rating - Clean
function StarRating({ rating, count = 0, size = "sm" }: { rating: number; count?: number; size?: "sm" | "md" }) {
  const starSize = size === "md" ? "w-4 h-4" : "w-3 h-3";
  const hasReviews = count > 0;
  const displayRating = hasReviews ? Math.min(5, Math.max(0, rating || 0)) : 0;
  const roundedRating = Math.round(displayRating);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star 
            key={i} 
            className={`${starSize} ${i <= roundedRating && hasReviews ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-700'}`} 
          />
        ))}
      </div>
      {hasReviews && (
        <span className="text-xs text-white font-medium">{displayRating.toFixed(1)}</span>
      )}
      {count > 0 && (
        <span className="text-[10px] text-zinc-500">({count})</span>
      )}
    </div>
  );
}

// Trust Score Display - Clean, prominent
function TrustScoreDisplay({ score, size = "sm" }: { score: number; size?: "sm" | "md" }) {
  const normalizedScore = Math.min(100, Math.max(0, score || 0));
  const getColor = () => {
    if (normalizedScore >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (normalizedScore >= 60) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-red-400 border-red-500/30 bg-red-500/10';
  };
  
  const getLabel = () => {
    if (normalizedScore >= 80) return 'High Trust';
    if (normalizedScore >= 60) return 'Medium Trust';
    return 'Low Trust';
  };

  const textSize = size === "md" ? "text-sm" : "text-[10px]";
  const numberSize = size === "md" ? "text-base" : "text-xs";

  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${getColor()}`}>
      <Shield size={size === "md" ? 14 : 10} />
      <span className={`${textSize} font-medium`}>{getLabel()}</span>
      <span className={`${numberSize} font-bold text-white`}>{normalizedScore}</span>
    </div>
  );
}

// Ranking Entry - Premium financial index style
function RankingEntry({ rank, entity, onClick }: { rank: number; entity: any; onClick: () => void }) {
  const isTop3 = rank <= 3;
  
  const getRankDisplay = () => {
    if (rank === 1) return <Trophy size={12} className="text-amber-400" />;
    if (rank === 2) return <Medal size={12} className="text-zinc-400" />;
    if (rank === 3) return <Medal size={12} className="text-amber-700" />;
    return <span className="text-zinc-500 font-mono text-xs w-4 text-center">{rank}</span>;
  };

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 py-2.5 border-b border-[#1e1e32] last:border-0 cursor-pointer hover:bg-[#1a1a2e] transition-all px-2 -mx-2 rounded-lg ${
        isTop3 ? 'bg-amber-500/5' : ''
      }`}
    >
      <div className="w-6 flex items-center justify-center flex-shrink-0">
        {getRankDisplay()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium text-sm truncate">{entity.name}</span>
          {entity.regulated && (
            <BadgeCheck size={10} className="text-emerald-400 flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
          <StarRating rating={entity.rating || 0} count={entity.reviewCount || 0} />
          <span>•</span>
          <span className="text-zinc-500">{entity.country || 'International'}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        <TrustScoreDisplay score={entity.trustScore || 0} />
        <ArrowRight size={12} className="text-zinc-500" />
      </div>
    </div>
  );
}

// ===================== MAIN COMPONENT =====================
export default function MobileHome() {
  const router = useRouter();
  const { region } = useRegion();
  const [brokers, setBrokers] = useState<any[]>([]);
  const [propFirms, setPropFirms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrichedBrokers, setEnrichedBrokers] = useState<any[]>([]);
  const [enrichedPropFirms, setEnrichedPropFirms] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<any[]>([]);

  const regionInfo = REGION_DISPLAY[region] || REGION_DISPLAY['GLOBAL'];

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [brokersRes, propFirmsRes] = await Promise.all([
          api.getBrokers(region),
          api.getPropFirms(region)
        ]);

        if (brokersRes.success) setBrokers(brokersRes.data || []);
        if (propFirmsRes.success) setPropFirms(propFirmsRes.data || []);

        // Fetch reviews
        try {
          const reviewsRes = await fetch('/api/reviews?limit=5&status=APPROVED');
          const reviewsData = await reviewsRes.json();
          if (reviewsData.reviews) setRecentReviews(reviewsData.reviews);
        } catch (err) {
          console.error('Failed to fetch reviews:', err);
        }

        // Fetch incidents
        try {
          const incidentsRes = await fetch('/api/incidents?limit=5');
          const incidentsData = await incidentsRes.json();
          if (incidentsData.incidents) setRecentIncidents(incidentsData.incidents);
        } catch (err) {
          console.error('Failed to fetch incidents:', err);
        }
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [region]);

  // Enrich brokers with trust scores
  useEffect(() => {
    const enrichFirms = async () => {
      if (brokers.length === 0 && propFirms.length === 0) return;
      
      const enrichedBrokersList = await Promise.all(
        brokers.map(async (broker) => {
          try {
            const response = await fetch(`/api/reviews?brokerId=${broker.id}&status=APPROVED&limit=100`);
            const data = await response.json();
            if (response.ok && data.reviews) {
              const stats = calculateTrustStatsFromReviews(data.reviews);
              return { 
                ...broker, 
                trustScore: stats.avgTrustScore, 
                reviewCount: stats.totalReviews
              };
            }
          } catch (err) {}
          return { ...broker, trustScore: 0, reviewCount: 0 };
        })
      );
      
      const enrichedPropList = await Promise.all(
        propFirms.map(async (propFirm) => {
          try {
            const response = await fetch(`/api/reviews?propFirmId=${propFirm.id}&status=APPROVED&limit=100`);
            const data = await response.json();
            if (response.ok && data.reviews) {
              const stats = calculateTrustStatsFromReviews(data.reviews);
              return { 
                ...propFirm, 
                trustScore: stats.avgTrustScore, 
                reviewCount: stats.totalReviews
              };
            }
          } catch (err) {}
          return { ...propFirm, trustScore: 0, reviewCount: 0 };
        })
      );
      
      setEnrichedBrokers(enrichedBrokersList);
      setEnrichedPropFirms(enrichedPropList);
    };
    enrichFirms();
  }, [brokers, propFirms]);

  // Filter by region and sort by trust score
  const regionFilteredBrokers = useMemo(() => {
    return enrichedBrokers
      .filter(firm => isAvailableInRegion(firm, region))
      .sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0));
  }, [enrichedBrokers, region]);

  const regionFilteredPropFirms = useMemo(() => {
    return enrichedPropFirms
      .filter(firm => isAvailableInRegion(firm, region))
      .sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0));
  }, [enrichedPropFirms, region]);

  // Top 5 for rankings preview
  const topBrokers = regionFilteredBrokers.slice(0, 5);
  const topPropFirms = regionFilteredPropFirms.slice(0, 5);

  // Incident types for display
  const incidentTypeMap: Record<string, { icon: any; color: string; label: string }> = {
    'WITHDRAWAL_DELAY': { icon: Clock, color: 'text-amber-400', label: 'Withdrawal Delay' },
    'WITHDRAWAL_REJECTED': { icon: XCircle, color: 'text-red-400', label: 'Withdrawal Rejected' },
    'SCAM_WARNING': { icon: AlertCircle, color: 'text-red-400', label: 'Scam Warning' },
    'ACCOUNT_SUSPENDED': { icon: AlertTriangle, color: 'text-red-400', label: 'Account Suspended' },
    'WITHDRAWAL_PAID': { icon: CheckCircle, color: 'text-emerald-400', label: 'Withdrawal Paid' },
    'PLATFORM_FREEZE': { icon: Activity, color: 'text-amber-400', label: 'Platform Freeze' },
    'SERVER_DOWN': { icon: Server, color: 'text-red-400', label: 'Server Down' },
    'EXECUTION_DELAY': { icon: Clock, color: 'text-amber-400', label: 'Execution Delay' },
  };

  const totalReviews = [...enrichedBrokers, ...enrichedPropFirms].reduce((sum, f) => sum + (f.reviewCount || 0), 0);

  const handleNavigate = (id: number, name: string, type: 'broker' | 'prop') => {
    router.push(type === 'prop' ? `/prop-firms/${id}` : `/brokers/${id}`);
  };

  if (loading) {
    return (
      <MobileLayout title="InsightPip" showSearch={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p className="text-xs text-zinc-500 mt-3">Loading...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (brokers.length === 0 && propFirms.length === 0) {
    return (
      <MobileLayout title="InsightPip" showSearch={false}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <Globe size={48} className="text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            No trading partners in {regionInfo.flag} {regionInfo.label}
          </h2>
          <p className="text-zinc-400 text-sm mb-4">
            We don't have any brokers or prop firms available in {regionInfo.flag} {regionInfo.label} yet.
          </p>
          <button
            onClick={() => {
              const selector = document.querySelector('[data-region-selector]');
              if (selector) (selector as HTMLElement).click();
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Change Region
          </button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="InsightPip" showSearch={false}>
      <div className="space-y-8 pb-6">
        
        {/* ==================== 1. HERO ==================== */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="pt-4 pb-2"
        >
          <h1 className="text-3xl font-bold text-white leading-tight">
            Know who you're <span className="text-blue-400">trusting</span>.
          </h1>
          <p className="text-zinc-400 text-sm mt-2 leading-relaxed max-w-xs">
            Research brokers and prop firms before you trade with them.
          </p>
          <div className="flex gap-3 mt-4">
            <Link
              href="/rankings"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1.5"
            >
              Explore Rankings <ArrowRight size={14} />
            </Link>
            <Link
              href="/compare"
              className="px-5 py-2.5 bg-[#1a1a2e] border border-[#2a2a3e] text-white rounded-lg text-sm font-medium hover:bg-[#2a2a3e] transition-colors flex items-center gap-1.5"
            >
              <GitCompare size={14} className="text-zinc-400" /> Compare
            </Link>
          </div>
        </motion.div>

        {/* ==================== 2. INSIGHTPIP INTELLIGENCE ==================== */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="border border-[#1e1e32] rounded-lg p-4 bg-[#12121f]"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-white">InsightPip Intelligence</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{brokers.length}</div>
              <div className="text-[10px] text-zinc-500">Brokers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{propFirms.length}</div>
              <div className="text-[10px] text-zinc-500">Prop Firms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{totalReviews}</div>
              <div className="text-[10px] text-zinc-500">Reviews</div>
            </div>
          </div>
        </motion.div>

        {/* ==================== 3. THE TRUST RANKINGS ==================== */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-amber-400" />
              <h2 className="text-base font-semibold text-white">The Trust Rankings</h2>
            </div>
            <Link href="/rankings" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <div className="bg-[#12121f] border border-[#1e1e32] rounded-lg p-3">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-3">Top Brokers</p>
            {topBrokers.length > 0 ? (
              topBrokers.map((broker, index) => (
                <RankingEntry
                  key={broker.id}
                  rank={index + 1}
                  entity={broker}
                  onClick={() => handleNavigate(broker.id, broker.name, 'broker')}
                />
              ))
            ) : (
              <p className="text-zinc-500 text-sm text-center py-4">No brokers available in your region</p>
            )}

            {topPropFirms.length > 0 && (
              <>
                <div className="border-t border-[#1e1e32] my-3" />
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-3">Top Prop Firms</p>
                {topPropFirms.slice(0, 3).map((firm, index) => (
                  <RankingEntry
                    key={firm.id}
                    rank={index + 1}
                    entity={firm}
                    onClick={() => handleNavigate(firm.id, firm.name, 'prop')}
                  />
                ))}
              </>
            )}
          </div>
        </motion.div>

        {/* ==================== 4. TRADER VOICES ==================== */}
        {recentReviews.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageCircle size={16} className="text-blue-400" />
                <h2 className="text-base font-semibold text-white">Trader Voices</h2>
              </div>
              <Link href="/reviews" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                Read all <ArrowRight size={12} />
              </Link>
            </div>

            <div className="space-y-2">
              {recentReviews.slice(0, 3).map((review) => (
                <div key={review.id} className="bg-[#12121f] border border-[#1e1e32] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <StarRating rating={review.rating || 0} size="sm" />
                    <span className="text-xs text-zinc-500">•</span>
                    <span className="text-[10px] text-zinc-500">{review.entityName}</span>
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed line-clamp-2">
                    {review.content}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-zinc-500">
                    <span>{review.user?.name || 'Anonymous'}</span>
                    <span>•</span>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ==================== 5. WHAT'S HAPPENING ==================== */}
        {recentIncidents.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-400" />
                <h2 className="text-base font-semibold text-white">What's Happening</h2>
              </div>
              <Link href="/reviews?tab=incidents" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>

            <div className="space-y-2">
              {recentIncidents.slice(0, 3).map((incident) => {
                const typeInfo = incidentTypeMap[incident.incidentType] || { icon: AlertCircle, color: 'text-zinc-400', label: 'Reported' };
                const Icon = typeInfo.icon;
                return (
                  <div key={incident.id} className="bg-[#12121f] border border-[#1e1e32] rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Icon size={14} className={`${typeInfo.color} mt-0.5 flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm truncate">{incident.entityName || 'Unknown'}</span>
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex-shrink-0">
                            {incident.status || 'PENDING'}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-xs">{incident.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-500">
                          <span>{typeInfo.label}</span>
                          <span>•</span>
                          <span>{new Date(incident.incidentDate || incident.createdAt).toLocaleDateString()}</span>
                          {incident.confirmations > 0 && (
                            <>
                              <span>•</span>
                              <span>{incident.confirmations} confirmations</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ==================== 6. EXPLORE TRADING PARTNERS ==================== */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="border border-[#1e1e32] rounded-lg p-4 bg-[#12121f]"
        >
          <h2 className="text-sm font-semibold text-white mb-3">Explore Trading Partners</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/brokers"
              className="p-3 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg text-center hover:bg-[#2a2a3e] transition-colors"
            >
              <Building2 size={20} className="text-blue-400 mx-auto mb-1" />
              <div className="text-white text-sm font-medium">Brokers</div>
              <div className="text-[10px] text-zinc-500">Research, reviews, incidents</div>
            </Link>
            <Link
              href="/prop-firms"
              className="p-3 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg text-center hover:bg-[#2a2a3e] transition-colors"
            >
              <TrendingUp size={20} className="text-purple-400 mx-auto mb-1" />
              <div className="text-white text-sm font-medium">Prop Firms</div>
              <div className="text-[10px] text-zinc-500">Challenges, rules, offers</div>
            </Link>
          </div>
        </motion.div>

        {/* ==================== 7. FINAL BRAND STATEMENT ==================== */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center py-4 border-t border-[#1e1e32]"
        >
          <p className="text-sm text-zinc-400 italic">
            "Before you trade with them, <span className="text-white">know them</span>."
          </p>
          <Link
            href="/brokers"
            className="inline-flex items-center gap-2 mt-3 text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors"
          >
            Research Brokers <ArrowRight size={14} />
          </Link>
        </motion.div>

        {/* Footer */}
        <div className="text-center text-[10px] text-zinc-600 pb-2">
          Research before you trust.™
        </div>
      </div>
    </MobileLayout>
  );
}