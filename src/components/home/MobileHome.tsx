// components/home/MobileHome.tsx - CLEAN LIGHT UI
// Dark header + light body system (matches MobileHeader + BottomNavigation)

'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useRegion } from '@/contexts/RegionContext';
import {
  Star, Shield, Building2, MessageCircle,
  AlertTriangle, CheckCircle, ArrowRight,
  Clock, Crown, Gift,
  XCircle, Activity,
  TrendingUp,
  Home, ChevronDown,
  Layers,
  Globe,
  Trophy, Medal,
  GitCompare,
  ChevronLeft, ChevronRight as ChevronRightIcon, User, Percent
} from 'lucide-react';
import MobileLayout from '@/components/mobile/MobileLayout';

// ===================== HARDCODED LIGHT TOKENS =====================
const T = {
  bg: '#FFFFFF',
  surface: '#FFFFFF',
  surface2: '#F7F8FA',
  surface3: '#EEF0F4',
  border: '#E5E7EB',
  borderStrong: '#D1D5DB',
  text: '#0A0E1A',
  text2: '#6B7280',
  text3: '#9CA3AF',
  textInvert: '#FFFFFF',
  blue: '#2563EB',
  blueHover: '#1D4ED8',
  blueSoft: '#EFF6FF',
  green: '#16A34A',
  greenSoft: '#DCFCE7',
  amber: '#F59E0B',
  amberSoft: '#FEF3C7',
  red: '#DC2626',
  redSoft: '#FEE2E2',
  gold: '#D97706',
  goldSoft: '#FEF3C7',
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

function StarRating({ rating, count = 0, size = "sm" }: { rating: number; count?: number; size?: "sm" | "md" }) {
  const starSize = size === "md" ? "w-4 h-4" : "w-3 h-3";
  const hasReviews = count > 0;
  const displayRating = hasReviews ? Math.min(5, Math.max(0, rating || 0)) : 0;
  const roundedRating = Math.round(displayRating);

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`${starSize} ${i <= roundedRating && hasReviews ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-300'}`}
          />
        ))}
      </div>
      {hasReviews && (
        <span className="text-xs font-medium" style={{ color: T.text }}>{displayRating.toFixed(1)}</span>
      )}
      {count > 0 && (
        <span className="text-[10px]" style={{ color: T.text3 }}>({count})</span>
      )}
    </div>
  );
}

function TrustScoreDisplay({ score, size = "sm" }: { score: number; size?: "sm" | "md" }) {
  const normalizedScore = Math.min(100, Math.max(0, score || 0));

  const getStyle = () => {
    if (normalizedScore >= 80) return { bg: T.greenSoft, color: T.green, label: 'High Trust' };
    if (normalizedScore >= 60) return { bg: T.amberSoft, color: T.amber, label: 'Medium Trust' };
    return { bg: T.redSoft, color: T.red, label: 'Low Trust' };
  };

  const s = getStyle();

  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg }}>
      <Shield size={size === "md" ? 14 : 10} style={{ color: s.color }} />
      <span className={`${size === "md" ? "text-sm" : "text-[10px]"} font-medium`} style={{ color: s.color }}>
        {s.label}
      </span>
      <span className={`${size === "md" ? "text-base" : "text-xs"} font-bold`} style={{ color: T.text }}>
        {normalizedScore}
      </span>
    </div>
  );
}

function RankingEntry({ rank, entity, onClick, index }: { rank: number; entity: any; onClick: () => void; index: number }) {
  const isTop3 = rank <= 3;

  const getRankDisplay = () => {
    if (rank === 1) return <Crown size={12} style={{ color: T.gold }} />;
    if (rank === 2) return <Medal size={12} style={{ color: T.text3 }} />;
    if (rank === 3) return <Medal size={12} style={{ color: '#92400E' }} />;
    return <span className="text-xs font-mono w-4 text-center" style={{ color: T.text3 }}>{rank}</span>;
  };

  const logoUrl = entity.logo || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg cursor-pointer transition-all"
      style={{
        borderBottom: `1px solid ${T.border}`,
        backgroundColor: isTop3 ? 'rgba(217,119,6,0.04)' : 'transparent',
      }}
    >
      <div className="w-6 flex items-center justify-center flex-shrink-0">
        {getRankDisplay()}
      </div>

      <div
        className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
        style={{ backgroundColor: T.surface2, border: `1px solid ${T.border}` }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={entity.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const fallback = document.createElement('span');
                fallback.className = 'font-bold text-xs';
                fallback.style.color = T.text;
                fallback.textContent = entity.name.charAt(0);
                parent.appendChild(fallback);
              }
            }}
          />
        ) : (
          <span className="font-bold text-xs" style={{ color: T.text }}>{entity.name.charAt(0)}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate" style={{ color: T.text }}>{entity.name}</span>
          {entity.regulated && (
            <CheckCircle size={10} className="flex-shrink-0" style={{ color: T.green }} />
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <StarRating rating={entity.rating || 0} count={entity.reviewCount || 0} />
          <span style={{ color: T.text3 }}>•</span>
          <span style={{ color: T.text3 }}>{entity.country || 'International'}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <TrustScoreDisplay score={entity.trustScore || 0} />
        <ArrowRight size={12} style={{ color: T.text3 }} />
      </div>
    </motion.div>
  );
}

function OfferCard({ offer, type, index }: { offer: any; type: 'broker' | 'prop'; index: number }) {
  const router = useRouter();

  const handleClick = () => {
    if (type === 'broker') {
      router.push(`/brokers/${offer.slug || offer.name.toLowerCase().replace(/\s+/g, '-')}`);
    } else {
      router.push(`/prop-firms/${offer.slug || offer.name.toLowerCase().replace(/\s+/g, '-')}`);
    }
  };

  const isBroker = type === 'broker';
  const logoUrl = offer.logo || null;

  let offerText = 'Special Offer';
  let discountText = '';
  let expiry = '';

  if (isBroker) {
    if (offer.promotions && offer.promotions.length > 0) {
      offerText = offer.promotions[0].name || offerText;
      discountText = offer.promotions[0].discount || '';
      expiry = offer.promotions[0].validUntil || '';
    }
    if (offer.bonuses && offer.bonuses.length > 0 && !offer.promotions?.length) {
      offerText = offer.bonuses[0].amount || offer.bonuses[0].type || offerText;
      expiry = offer.bonuses[0].expiry || '';
    }
  } else {
    if (offer.promotions && offer.promotions.length > 0) {
      offerText = offer.promotions[0].name || offerText;
      discountText = offer.promotions[0].discount || '';
      expiry = offer.promotions[0].validUntil || '';
    }
  }

  const hasDiscount = discountText && discountText !== '';
  const hasExpiry = expiry && expiry !== '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={handleClick}
      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all"
      style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}
    >
      <div
        className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
        style={{ backgroundColor: T.surface2, border: `1px solid ${T.border}` }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={offer.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const fallback = document.createElement('span');
                fallback.className = 'font-bold text-sm';
                fallback.style.color = T.text;
                fallback.textContent = offer.name.charAt(0);
                parent.appendChild(fallback);
              }
            }}
          />
        ) : (
          <span className="font-bold text-sm" style={{ color: T.text }}>{offer.name.charAt(0)}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate" style={{ color: T.text }}>{offer.name}</span>
          <span
            className="text-[8px] px-1.5 py-0.5 rounded-full"
            style={
              isBroker
                ? { backgroundColor: T.blueSoft, color: T.blue }
                : { backgroundColor: '#F3E8FF', color: '#9333EA' }
            }
          >
            {isBroker ? 'Broker' : 'Prop'}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs font-medium truncate" style={{ color: T.gold }}>{offerText}</span>
          {hasDiscount && (
            <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: T.greenSoft, color: T.green }}>
              {discountText}% OFF
            </span>
          )}
        </div>
        {hasExpiry && (
          <div className="flex items-center gap-1 mt-0.5">
            <Clock size={8} style={{ color: T.text3 }} />
            <span className="text-[8px]" style={{ color: T.text3 }}>
              Expires: {new Date(expiry).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      <ArrowRight size={14} className="flex-shrink-0" style={{ color: T.text3 }} />
    </motion.div>
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

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const [offersTab, setOffersTab] = useState<'all' | 'brokers' | 'propFirms'>('all');

  const regionInfo = REGION_DISPLAY[region] || REGION_DISPLAY['GLOBAL'];

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

        try {
          const reviewsRes = await fetch('/api/reviews?limit=5&status=APPROVED');
          const reviewsData = await reviewsRes.json();
          if (reviewsData.reviews) setRecentReviews(reviewsData.reviews);
        } catch (err) {}

        try {
          const incidentsRes = await fetch('/api/incidents?limit=5');
          const incidentsData = await incidentsRes.json();
          if (incidentsData.incidents) setRecentIncidents(incidentsData.incidents);
        } catch (err) {}
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [region]);

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
              return { ...broker, trustScore: stats.avgTrustScore, reviewCount: stats.totalReviews };
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
              return { ...propFirm, trustScore: stats.avgTrustScore, reviewCount: stats.totalReviews };
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

  const topBrokers = regionFilteredBrokers.slice(0, 5);
  const topPropFirms = regionFilteredPropFirms.slice(0, 5);

  const brokerOffers = useMemo(() => {
    return regionFilteredBrokers
      .filter(b => (b.bonuses && b.bonuses.length > 0) || (b.promotions && b.promotions.length > 0))
      .slice(0, 6);
  }, [regionFilteredBrokers]);

  const propFirmOffers = useMemo(() => {
    return regionFilteredPropFirms
      .filter(p => p.promotions && p.promotions.length > 0)
      .slice(0, 6);
  }, [regionFilteredPropFirms]);

  const filteredOffers = useMemo(() => {
    if (offersTab === 'brokers') {
      return brokerOffers.map(o => ({ ...o, _type: 'broker' as const }));
    }
    if (offersTab === 'propFirms') {
      return propFirmOffers.map(o => ({ ...o, _type: 'prop' as const }));
    }
    const combined: any[] = [];
    const maxLen = Math.max(brokerOffers.length, propFirmOffers.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < brokerOffers.length) {
        combined.push({ ...brokerOffers[i], _type: 'broker' as const });
      }
      if (i < propFirmOffers.length) {
        combined.push({ ...propFirmOffers[i], _type: 'prop' as const });
      }
    }
    return combined.slice(0, 6);
  }, [brokerOffers, propFirmOffers, offersTab]);

  const slides = [
    { id: 'brokers', label: 'Top Brokers', icon: Building2, data: topBrokers, type: 'broker' as const, emptyMessage: 'No brokers available in your region' },
    { id: 'propFirms', label: 'Top Prop Firms', icon: TrendingUp, data: topPropFirms, type: 'prop' as const, emptyMessage: 'No prop firms available in your region' },
  ];

  const totalSlides = slides.length;

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    setOffsetX(startX - currentX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const threshold = 50;
    if (offsetX > threshold && currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    } else if (offsetX < -threshold && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
    setOffsetX(0);
  };

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  const incidentTypeMap: Record<string, { icon: any; color: string; label: string }> = {
    'WITHDRAWAL_DELAY': { icon: Clock, color: T.amber, label: 'Withdrawal Delay' },
    'WITHDRAWAL_REJECTED': { icon: XCircle, color: T.red, label: 'Withdrawal Rejected' },
    'SCAM_WARNING': { icon: AlertTriangle, color: T.red, label: 'Scam Warning' },
    'ACCOUNT_SUSPENDED': { icon: AlertTriangle, color: T.red, label: 'Account Suspended' },
    'WITHDRAWAL_PAID': { icon: CheckCircle, color: T.green, label: 'Withdrawal Paid' },
    'PLATFORM_FREEZE': { icon: Activity, color: T.amber, label: 'Platform Freeze' },
    'SERVER_DOWN': { icon: AlertTriangle, color: T.red, label: 'Server Down' },
    'EXECUTION_DELAY': { icon: Clock, color: T.amber, label: 'Execution Delay' },
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
            <div
              className="animate-spin rounded-full h-8 w-8 mx-auto"
              style={{ border: `2px solid ${T.border}`, borderTopColor: T.blue }}
            />
            <p className="text-xs mt-3" style={{ color: T.text3 }}>Loading...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (brokers.length === 0 && propFirms.length === 0) {
    return (
      <MobileLayout title="InsightPip" showSearch={false}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <Globe size={48} className="mx-auto mb-4" style={{ color: T.text3 }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: T.text }}>
            No trading partners in {regionInfo.flag} {regionInfo.label}
          </h2>
          <p className="text-sm mb-4" style={{ color: T.text2 }}>
            We don't have any brokers or prop firms available in {regionInfo.flag} {regionInfo.label} yet.
          </p>
          <button
            onClick={() => {
              const selector = document.querySelector('[data-region-selector]');
              if (selector) (selector as HTMLElement).click();
            }}
            className="px-6 py-3 rounded-lg transition-colors text-sm text-white"
            style={{ backgroundColor: T.blue }}
          >
            Change Region
          </button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="InsightPip" showSearch={false}>
      <div className="space-y-6 pb-6">

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="pt-4 pb-2"
        >
          <h1 className="text-3xl font-bold leading-tight" style={{ color: T.text }}>
            Know who you're <span style={{ color: T.blue }}>trusting</span>.
          </h1>
          <p className="text-sm mt-2 leading-relaxed max-w-xs" style={{ color: T.text2 }}>
            Research brokers and prop firms before you trade with them.
          </p>
          <div className="flex gap-3 mt-4">
            <Link
              href="/rankings"
              className="px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-1.5 text-white"
              style={{ backgroundColor: T.blue }}
            >
              Explore Rankings <ArrowRight size={14} />
            </Link>
            <Link
              href="/compare"
              className="px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-1.5"
              style={{ backgroundColor: T.surface2, border: `1px solid ${T.border}`, color: T.text }}
            >
              <GitCompare size={14} style={{ color: T.text2 }} /> Compare
            </Link>
          </div>
        </motion.div>

        {/* INTELLIGENCE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-lg p-4"
          style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} style={{ color: T.blue }} />
            <h2 className="text-sm font-semibold" style={{ color: T.text }}>InsightPip Intelligence</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: T.text }}>{brokers.length}</div>
              <div className="text-[10px]" style={{ color: T.text3 }}>Brokers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: T.text }}>{propFirms.length}</div>
              <div className="text-[10px]" style={{ color: T.text3 }}>Prop Firms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: T.text }}>{totalReviews}</div>
              <div className="text-[10px]" style={{ color: T.text3 }}>Reviews</div>
            </div>
          </div>
        </motion.div>

        {/* RANKINGS SLIDER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy size={16} style={{ color: T.gold }} />
              <h2 className="text-base font-semibold" style={{ color: T.text }}>The Trust Rankings</h2>
            </div>
            <Link href="/rankings" className="text-xs flex items-center gap-1" style={{ color: T.blue }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <div className="relative rounded-lg overflow-hidden" style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}>
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <div className="flex gap-1">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(index)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium transition-all"
                    style={
                      currentSlide === index
                        ? { backgroundColor: T.blue, color: T.textInvert }
                        : { color: T.text3, backgroundColor: 'transparent' }
                    }
                  >
                    <slide.icon size={12} />
                    {slide.label}
                  </button>
                ))}
              </div>
              <span className="text-[10px]" style={{ color: T.text3 }}>
                {currentSlide + 1} / {totalSlides}
              </span>
            </div>

            <div className="flex items-center justify-center gap-1 px-4 pb-1">
              <div className="flex gap-1">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className="h-1 rounded-full transition-all"
                    style={{
                      width: currentSlide === index ? '24px' : '8px',
                      backgroundColor: currentSlide === index ? T.blue : T.borderStrong,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="text-center text-[8px] pb-1" style={{ color: T.text3 }}>
              ← Swipe to see more →
            </div>

            <div
              ref={sliderRef}
              className="overflow-hidden touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <motion.div
                className="flex"
                animate={{ x: `-${currentSlide * 100}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ width: `${totalSlides * 100}%` }}
              >
                {slides.map((slide) => (
                  <div key={slide.id} className="w-full px-3 pb-3 flex-shrink-0">
                    <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: T.text3 }}>
                      {slide.label}
                    </p>
                    {slide.data.length > 0 ? (
                      slide.data.map((entity, index) => (
                        <RankingEntry
                          key={entity.id}
                          rank={index + 1}
                          entity={entity}
                          index={index}
                          onClick={() => handleNavigate(entity.id, entity.name, slide.type)}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-center py-4" style={{ color: T.text3 }}>
                        {slide.emptyMessage}
                      </p>
                    )}
                  </div>
                ))}
              </motion.div>
            </div>

            <div className="absolute inset-y-0 left-0 right-0 pointer-events-none flex items-center justify-between px-1">
              {currentSlide > 0 && (
                <button
                  onClick={() => setCurrentSlide(currentSlide - 1)}
                  className="pointer-events-auto w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: T.surface, border: `1px solid ${T.border}`, color: T.text2 }}
                >
                  <ChevronLeft size={14} />
                </button>
              )}
              {currentSlide < totalSlides - 1 && (
                <button
                  onClick={() => setCurrentSlide(currentSlide + 1)}
                  className="pointer-events-auto w-7 h-7 rounded-full flex items-center justify-center ml-auto"
                  style={{ backgroundColor: T.surface, border: `1px solid ${T.border}`, color: T.text2 }}
                >
                  <ChevronRightIcon size={14} />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* OFFERS */}
        {filteredOffers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Percent size={16} style={{ color: T.blue }} />
                <h2 className="text-base font-semibold" style={{ color: T.text }}>Offers</h2>
              </div>
              <Link href="/offers" className="text-xs flex items-center gap-1" style={{ color: T.blue }}>
                View all <ArrowRight size={12} />
              </Link>
            </div>

            <div className="flex gap-1 rounded-lg p-1 mb-3" style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}>
              {(['all', 'brokers', 'propFirms'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setOffersTab(tab)}
                  className="flex-1 py-1.5 rounded-md text-xs font-medium transition-all"
                  style={
                    offersTab === tab
                      ? { backgroundColor: T.blue, color: T.textInvert }
                      : { color: T.text2, backgroundColor: 'transparent' }
                  }
                >
                  {tab === 'all' ? 'All' : tab === 'brokers' ? 'Brokers' : 'Prop Firms'}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {filteredOffers.slice(0, 4).map((offer, index) => (
                <OfferCard
                  key={`${offer._type}-${offer.id}`}
                  offer={offer}
                  type={offer._type}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* TRADER VOICES */}
        {recentReviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageCircle size={16} style={{ color: T.blue }} />
                <h2 className="text-base font-semibold" style={{ color: T.text }}>Trader Voices</h2>
              </div>
              <Link href="/reviews" className="text-xs flex items-center gap-1" style={{ color: T.blue }}>
                Read all <ArrowRight size={12} />
              </Link>
            </div>

            <div className="space-y-2">
              {recentReviews.slice(0, 3).map((review) => {
                const entityLogo = review.entityLogo || null;
                const userAvatar = review.user?.avatar || null;
                const userName = review.user?.name || 'Anonymous';
                const userInitial = userName.charAt(0).toUpperCase();

                return (
                  <div key={review.id} className="rounded-lg p-3" style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-5 h-5 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: T.surface2, border: `1px solid ${T.border}` }}>
                        {entityLogo ? (
                          <img
                            src={entityLogo}
                            alt={review.entityName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                const fallback = document.createElement('span');
                                fallback.className = 'font-bold text-[8px]';
                                fallback.style.color = T.text;
                                fallback.textContent = review.entityName?.charAt(0) || '?';
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        ) : (
                          <span className="font-bold text-[8px]" style={{ color: T.text }}>
                            {review.entityName?.charAt(0) || '?'}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-medium" style={{ color: T.text2 }}>{review.entityName}</span>
                      <span className="text-[8px]" style={{ color: T.text3 }}>•</span>
                      <StarRating rating={review.rating || 0} size="sm" />
                    </div>

                    <p className="text-sm leading-relaxed line-clamp-2" style={{ color: T.text }}>
                      {review.content}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: T.surface2, border: `1px solid ${T.border}` }}>
                        {userAvatar ? (
                          <img
                            src={userAvatar}
                            alt={userName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                const fallback = document.createElement('span');
                                fallback.className = 'font-bold text-[8px]';
                                fallback.style.color = T.text;
                                fallback.textContent = userInitial;
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        ) : (
                          <User size={10} style={{ color: T.text2 }} />
                        )}
                      </div>
                      <span className="text-[10px]" style={{ color: T.text3 }}>{userName}</span>
                      <span className="text-[8px]" style={{ color: T.text3 }}>•</span>
                      <span className="text-[10px]" style={{ color: T.text3 }}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* WHAT'S HAPPENING */}
        {recentIncidents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} style={{ color: T.red }} />
                <h2 className="text-base font-semibold" style={{ color: T.text }}>What's Happening</h2>
              </div>
              <Link href="/reviews?tab=incidents" className="text-xs flex items-center gap-1" style={{ color: T.blue }}>
                View all <ArrowRight size={12} />
              </Link>
            </div>

            <div className="space-y-2">
              {recentIncidents.slice(0, 3).map((incident) => {
                const typeInfo = incidentTypeMap[incident.incidentType] || { icon: AlertTriangle, color: T.text3, label: 'Reported' };
                const Icon = typeInfo.icon;
                return (
                  <div key={incident.id} className="rounded-lg p-3" style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}>
                    <div className="flex items-start gap-2">
                      <Icon size={14} className="mt-0.5 flex-shrink-0" style={{ color: typeInfo.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate" style={{ color: T.text }}>
                            {incident.entityName || 'Unknown'}
                          </span>
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: T.redSoft, color: T.red }}>
                            {incident.status || 'PENDING'}
                          </span>
                        </div>
                        <p className="text-xs" style={{ color: T.text2 }}>{incident.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-[10px]" style={{ color: T.text3 }}>
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

        {/* EXPLORE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="rounded-lg p-4"
          style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}
        >
          <h2 className="text-sm font-semibold mb-3" style={{ color: T.text }}>Explore Trading Partners</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/brokers" className="p-3 rounded-lg text-center transition-colors" style={{ backgroundColor: T.surface2, border: `1px solid ${T.border}` }}>
              <Building2 size={20} className="mx-auto mb-1" style={{ color: T.blue }} />
              <div className="text-sm font-medium" style={{ color: T.text }}>Brokers</div>
              <div className="text-[10px]" style={{ color: T.text3 }}>Research, reviews, incidents</div>
            </Link>
            <Link href="/prop-firms" className="p-3 rounded-lg text-center transition-colors" style={{ backgroundColor: T.surface2, border: `1px solid ${T.border}` }}>
              <TrendingUp size={20} className="mx-auto mb-1" style={{ color: '#9333EA' }} />
              <div className="text-sm font-medium" style={{ color: T.text }}>Prop Firms</div>
              <div className="text-[10px]" style={{ color: T.text3 }}>Challenges, rules, offers</div>
            </Link>
          </div>
        </motion.div>

        {/* BRAND STATEMENT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center py-4"
          style={{ borderTop: `1px solid ${T.border}` }}
        >
          <p className="text-sm italic" style={{ color: T.text2 }}>
            "Before you trade with them, <span style={{ color: T.text, fontStyle: 'normal' }}>know them</span>."
          </p>
          <Link href="/brokers" className="inline-flex items-center gap-2 mt-3 text-sm font-medium" style={{ color: T.blue }}>
            Research Brokers <ArrowRight size={14} />
          </Link>
        </motion.div>

        <div className="text-center text-[10px] pb-2" style={{ color: T.text3 }}>
          Research before you trust.™
        </div>
      </div>
    </MobileLayout>
  );
}