// components/brokers/MobileRegulationsTab.tsx - WITH LOGOS
'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, AlertTriangle, Search, Globe, CheckCircle2, 
  ExternalLink, ArrowRight, Eye, Sparkles, Shield, 
  Building2, Users, Clock, Trophy, Filter, X, 
  Landmark, Scale, Banknote, BadgeCheck, Info,
  ChevronDown, ChevronUp, Star, Award, Lock,
  FileCheck, Building, MapPin, Calendar,
  CreditCard, Wallet, Zap, Award as AwardIcon,
  UserCheck, FileText, Check, ShieldOff,
  LayoutGrid, List, ChevronRight, Crown, Gem,
  Flame, TrendingUp, ThumbsUp, ThumbsDown,
  HelpCircle, Lightbulb, BookOpen
} from "lucide-react";
import { api } from "@/lib/api";
import { slugify } from "@/lib/slugify";
import Link from "next/link";
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

const generateGradient = (name: string) => {
  const gradients = [
    "from-pink-500 to-purple-500", "from-blue-500 to-purple-500", 
    "from-green-500 to-blue-500", "from-yellow-500 to-orange-500",
    "from-red-500 to-pink-500", "from-indigo-500 to-blue-500",
    "from-teal-500 to-green-500", "from-orange-500 to-red-500"
  ];
  return gradients[(name?.length || 0) % gradients.length];
};

// ===================== REGULATOR TIER SYSTEM =====================
const REGULATOR_TIERS: Record<string, { tier: 1 | 2 | 3 | 4; label: string; color: string }> = {
  // Tier 1 - Top Tier
  'FCA': { tier: 1, label: 'Tier 1', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  'ASIC': { tier: 1, label: 'Tier 1', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  'CFTC': { tier: 1, label: 'Tier 1', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  'NFA': { tier: 1, label: 'Tier 1', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  'BaFin': { tier: 1, label: 'Tier 1', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  'AMF': { tier: 1, label: 'Tier 1', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  'CONSOB': { tier: 1, label: 'Tier 1', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  'SEC': { tier: 1, label: 'Tier 1', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  'FINRA': { tier: 1, label: 'Tier 1', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  'OSC': { tier: 1, label: 'Tier 1', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  'ESMA': { tier: 1, label: 'Tier 1', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  
  // Tier 2 - Well-Regarded
  'MFSA': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'CySEC': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'FSA': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'DFSA': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'SCA': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'MAS': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'HKMA': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'IIROC': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'FSCA': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'JFSA': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'CIMA': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'SFC': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'LFSA': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'FSC': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'BVIFSC': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  
  // Tier 3 - Basic Regulation
  'VFSC': { tier: 3, label: 'Tier 3', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  'IFSC': { tier: 3, label: 'Tier 3', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  'FSA SVG': { tier: 3, label: 'Tier 3', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  'MISA': { tier: 3, label: 'Tier 3', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  'FSB': { tier: 3, label: 'Tier 3', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  
  // Tier 4 - Unregulated / Offshore
  'Unregulated': { tier: 4, label: 'Unregulated', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

// Get regulator info with tier
const getRegulatorInfo = (reg: string): { 
  short: string; 
  full: string; 
  country: string; 
  tier: 1 | 2 | 3 | 4;
  tierLabel: string;
  tierColor: string;
} => {
  const cleanReg = reg.trim();
  
  const mapping: Record<string, { short: string; full: string; country: string }> = {
    'FCA': { short: 'FCA', full: 'Financial Conduct Authority', country: 'UK' },
    'ASIC': { short: 'ASIC', full: 'Australian Securities and Investments Commission', country: 'Australia' },
    'CFTC': { short: 'CFTC', full: 'Commodity Futures Trading Commission', country: 'USA' },
    'NFA': { short: 'NFA', full: 'National Futures Association', country: 'USA' },
    'BaFin': { short: 'BaFin', full: 'Federal Financial Supervisory Authority', country: 'Germany' },
    'AMF': { short: 'AMF', full: 'Autorité des Marchés Financiers', country: 'France' },
    'CONSOB': { short: 'CONSOB', full: 'Commissione Nazionale per le Società e la Borsa', country: 'Italy' },
    'SEC': { short: 'SEC', full: 'Securities and Exchange Commission', country: 'USA' },
    'FINRA': { short: 'FINRA', full: 'Financial Industry Regulatory Authority', country: 'USA' },
    'OSC': { short: 'OSC', full: 'Ontario Securities Commission', country: 'Canada' },
    'ESMA': { short: 'ESMA', full: 'European Securities and Markets Authority', country: 'EU' },
    'MFSA': { short: 'MFSA', full: 'Malta Financial Services Authority', country: 'Malta' },
    'CySEC': { short: 'CySEC', full: 'Cyprus Securities and Exchange Commission', country: 'Cyprus' },
    'FSA': { short: 'FSA', full: 'Financial Services Authority', country: 'Japan' },
    'DFSA': { short: 'DFSA', full: 'Dubai Financial Services Authority', country: 'UAE' },
    'SCA': { short: 'SCA', full: 'Securities and Commodities Authority', country: 'UAE' },
    'MAS': { short: 'MAS', full: 'Monetary Authority of Singapore', country: 'Singapore' },
    'HKMA': { short: 'HKMA', full: 'Hong Kong Monetary Authority', country: 'Hong Kong' },
    'IIROC': { short: 'IIROC', full: 'Investment Industry Regulatory Organization of Canada', country: 'Canada' },
    'FSCA': { short: 'FSCA', full: 'Financial Sector Conduct Authority', country: 'South Africa' },
    'JFSA': { short: 'JFSA', full: 'Japan Financial Services Agency', country: 'Japan' },
    'CIMA': { short: 'CIMA', full: 'Cayman Islands Monetary Authority', country: 'Cayman Islands' },
    'SFC': { short: 'SFC', full: 'Securities and Futures Commission', country: 'Hong Kong' },
    'LFSA': { short: 'LFSA', full: 'Labuan Financial Services Authority', country: 'Malaysia' },
    'FSC': { short: 'FSC', full: 'Financial Services Commission', country: 'Mauritius' },
    'BVIFSC': { short: 'BVIFSC', full: 'British Virgin Islands Financial Services Commission', country: 'BVI' },
    'VFSC': { short: 'VFSC', full: 'Vanuatu Financial Services Commission', country: 'Vanuatu' },
    'IFSC': { short: 'IFSC', full: 'International Financial Services Commission', country: 'Belize' },
    'FSA SVG': { short: 'FSA SVG', full: 'St Vincent Financial Services Authority', country: 'St Vincent' },
    'MISA': { short: 'MISA', full: 'Mauritius Investment Services Authority', country: 'Mauritius' },
    'FSB': { short: 'FSB', full: 'Financial Services Board', country: 'South Africa' },
  };
  
  let found = null;
  for (const [key, value] of Object.entries(mapping)) {
    if (cleanReg.includes(key)) {
      found = { key, ...value };
      break;
    }
  }
  
  if (found) {
    const tierInfo = REGULATOR_TIERS[found.key] || REGULATOR_TIERS['FSA'] || { tier: 3, label: 'Tier 3', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    return {
      short: found.key,
      full: found.full,
      country: found.country,
      tier: tierInfo.tier,
      tierLabel: tierInfo.label,
      tierColor: tierInfo.color,
    };
  }
  
  if (cleanReg.length > 0 && !cleanReg.includes('Unregulated')) {
    const shortMatch = cleanReg.match(/^([A-Z]{2,5})/);
    if (shortMatch) {
      const short = shortMatch[1];
      const tierInfo = REGULATOR_TIERS[short] || { tier: 3, label: 'Tier 3', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
      return {
        short: short,
        full: cleanReg,
        country: 'Unknown',
        tier: tierInfo.tier,
        tierLabel: tierInfo.label,
        tierColor: tierInfo.color,
      };
    }
    return {
      short: cleanReg.slice(0, 5),
      full: cleanReg,
      country: 'Unknown',
      tier: 3,
      tierLabel: 'Tier 3',
      tierColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };
  }
  
  return {
    short: cleanReg || 'Unknown',
    full: cleanReg || 'Unknown',
    country: 'Unknown',
    tier: 4,
    tierLabel: 'Unregulated',
    tierColor: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
};

// Calculate compliance level
const getComplianceLevel = (broker: any): { level: string; color: string; icon: React.ReactNode; score: number } => {
  let score = 0;
  let hasValidRegulator = false;
  let bestTier = 4;
  
  const tierWeights: Record<number, number> = { 1: 40, 2: 30, 3: 15, 4: 0 };
  
  broker.regulators.forEach((reg: string) => {
    const info = getRegulatorInfo(reg);
    if (info.tier < bestTier) {
      bestTier = info.tier;
    }
    if (info.tier !== 4) {
      hasValidRegulator = true;
    }
  });
  
  if (hasValidRegulator) {
    score += tierWeights[bestTier] || 0;
  }
  
  if (broker.regulators.length > 1) {
    score += Math.min(broker.regulators.length * 3, 10);
  }
  
  if (broker.yearsRegulated >= 15) score += 20;
  else if (broker.yearsRegulated >= 10) score += 18;
  else if (broker.yearsRegulated >= 5) score += 14;
  else if (broker.yearsRegulated >= 3) score += 10;
  else if (broker.yearsRegulated > 0) score += 5;
  
  if (broker.negativeBalanceProtection) score += 15;
  if (broker.segregatedAccounts) score += 15;
  if (broker.compensationScheme && broker.compensationScheme !== "None") {
    if (broker.compensationScheme.includes('up to') || broker.compensationScheme.includes('€') || broker.compensationScheme.includes('£')) {
      score += 10;
    } else {
      score += 5;
    }
  }
  
  if (broker.trustScore >= 80) score += 10;
  else if (broker.trustScore >= 60) score += 7;
  else if (broker.trustScore >= 40) score += 4;
  else if (broker.trustScore > 0) score += 2;
  
  score = Math.min(score, 100);
  
  if (score >= 80) {
    return { 
      level: 'Highly Compliant', 
      color: 'bg-green-500/20 text-green-400 border-green-500/30',
      icon: <ShieldCheck size={14} className="text-green-400" />,
      score
    };
  } else if (score >= 65) {
    return { 
      level: 'Compliant', 
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      icon: <ShieldCheck size={14} className="text-blue-400" />,
      score
    };
  } else if (score >= 40) {
    return { 
      level: 'Basic Compliance', 
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      icon: <AlertTriangle size={14} className="text-yellow-400" />,
      score
    };
  } else {
    return { 
      level: 'Limited Compliance', 
      color: 'bg-red-500/20 text-red-400 border-red-500/30',
      icon: <ShieldOff size={14} className="text-red-400" />,
      score
    };
  }
};

export default function MobileRegulationsTab() {
  const [brokersData, setBrokersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [brokerDetails, setBrokerDetails] = useState<Record<number, any>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<number, boolean>>({});
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [expandedBroker, setExpandedBroker] = useState<number | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.getBrokers();
        if (response.success) {
          setBrokersData(response.data || []);
          
          for (const broker of (response.data || [])) {
            if (broker.id) {
              setLoadingDetails(prev => ({ ...prev, [broker.id]: true }));
              try {
                const detailResponse = await api.getBrokerById(broker.id);
                if (detailResponse.success && detailResponse.data) {
                  setBrokerDetails(prev => ({ ...prev, [broker.id]: detailResponse.data }));
                }
              } catch (err) {
                console.error(`Failed to fetch details for broker ${broker.id}:`, err);
              } finally {
                setLoadingDetails(prev => ({ ...prev, [broker.id]: false }));
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching brokers:', err);
        setError('Failed to load brokers data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Process brokers data
  const brokers = brokersData.map((broker) => {
    const detailed = brokerDetails[broker.id];
    
    let regulators: string[] = [];
    let negativeBalanceProtection = false;
    let segregatedAccounts = false;
    let compensationScheme = "None";
    
    if (detailed?.regulation) {
      if (Array.isArray(detailed.regulation.authorities)) {
        regulators = detailed.regulation.authorities;
      } else if (typeof detailed.regulation.authorities === 'string') {
        try {
          const parsed = JSON.parse(detailed.regulation.authorities);
          if (Array.isArray(parsed)) {
            regulators = parsed;
          }
        } catch (e) {
          regulators = detailed.regulation.authorities.split(',').map((s: string) => s.trim());
        }
      }
      
      if (detailed.regulation.licenses && Array.isArray(detailed.regulation.licenses)) {
        detailed.regulation.licenses.forEach((license: any) => {
          if (license.authority && !regulators.includes(license.authority)) {
            regulators.push(license.authority);
          }
        });
      }
      
      negativeBalanceProtection = detailed.regulation.negativeBalanceProtection || false;
      segregatedAccounts = detailed.regulation.segregatedAccounts || false;
      compensationScheme = detailed.regulation.compensationScheme || "None";
    }
    
    if (regulators.length === 0 && broker.regulation) {
      if (typeof broker.regulation === 'object' && !Array.isArray(broker.regulation)) {
        if (Array.isArray(broker.regulation.authorities)) {
          regulators = broker.regulation.authorities;
        }
        negativeBalanceProtection = negativeBalanceProtection || broker.regulation.negativeBalanceProtection || false;
        segregatedAccounts = segregatedAccounts || broker.regulation.segregatedAccounts || false;
        compensationScheme = compensationScheme !== "None" ? compensationScheme : (broker.regulation.compensationScheme || "None");
      } else if (typeof broker.regulation === 'string' && broker.regulation !== "Regulated") {
        regulators = [broker.regulation];
      }
    }
    
    if (regulators.length === 0 && broker.regulated) {
      const country = broker.country || '';
      const regMap: Record<string, string[]> = {
        'Malta': ['MFSA'],
        'UK': ['FCA'], 'United Kingdom': ['FCA'],
        'Cyprus': ['CySEC'],
        'Australia': ['ASIC'],
        'USA': ['CFTC', 'NFA'], 'United States': ['CFTC', 'NFA'],
        'Germany': ['BaFin'],
        'South Africa': ['FSCA'],
        'UAE': ['DFSA', 'SCA'],
        'Singapore': ['MAS'],
        'Hong Kong': ['HKMA'],
        'Canada': ['IIROC'],
        'France': ['AMF'],
        'Italy': ['CONSOB'],
        'Japan': ['FSA'],
        'Cayman Islands': ['CIMA'],
        'Mauritius': ['FSC'],
        'Malaysia': ['LFSA'],
        'BVI': ['BVIFSC'],
        'Vanuatu': ['VFSC'],
        'Belize': ['IFSC'],
        'St Vincent': ['FSA SVG'],
      };
      regulators = regMap[country] || ['Unregulated'];
    }
    
    regulators = [...new Set(regulators.filter(r => r && typeof r === 'string' && r.trim() !== ''))];
    
    if (regulators.length === 0) {
      regulators = ['Unregulated'];
    }

    let region = "Global";
    const country = broker.country || '';
    const regionMap: Record<string, string> = {
      'Malta': 'Europe',
      'UK': 'Europe', 'United Kingdom': 'Europe',
      'Cyprus': 'Europe', 'Germany': 'Europe', 'France': 'Europe', 'Italy': 'Europe',
      'Australia': 'Asia Pacific', 'Singapore': 'Asia Pacific', 'Hong Kong': 'Asia Pacific', 'Japan': 'Asia Pacific',
      'USA': 'North America', 'United States': 'North America', 'Canada': 'North America',
      'UAE': 'Middle East',
      'South Africa': 'Africa',
      'Cayman Islands': 'Caribbean',
      'Vanuatu': 'Oceania',
      'Belize': 'Caribbean',
      'Mauritius': 'Africa',
      'Malaysia': 'Asia Pacific',
      'BVI': 'Caribbean',
      'St Vincent': 'Caribbean',
    };
    region = regionMap[country] || 'Global';

    const isRegulated = regulators.some(r => r !== 'Unregulated' && r !== 'unregulated');
    const hasMultipleRegulators = regulators.length > 1;
    const hasTier1 = regulators.some(reg => getRegulatorInfo(reg).tier === 1);
    const hasTier2 = regulators.some(reg => getRegulatorInfo(reg).tier === 2);

    return {
      id: broker.id,
      name: broker.name,
      logo: broker.logo,
      country: broker.country || 'International',
      region,
      regulators,
      isRegulated,
      hasMultipleRegulators,
      hasTier1,
      hasTier2,
      negativeBalanceProtection,
      segregatedAccounts,
      compensationScheme,
      yearsRegulated: broker.years || broker.yearsInOperation || 0,
      rating: broker.rating || 0,
      trustScore: broker.avgTrustScore || broker.trustScore || 0,
      reviewCount: broker.reviewsCount || 0,
      website: broker.website || '#',
    };
  });

  const allRegulators = [...new Set(brokers.flatMap(b => b.regulators).filter(r => r !== 'Unregulated' && r !== 'unregulated' && r))];
  const regions = [...new Set(brokers.map(b => b.region).filter(Boolean))];

  const filteredBrokers = brokers.filter(broker => {
    const matchesSearch = broker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         broker.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         broker.regulators.some(reg => reg.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRegion = selectedRegions.length === 0 || selectedRegions.includes(broker.region);
    const matchesTier = selectedTier === null || broker.regulators.some(reg => getRegulatorInfo(reg).tier === selectedTier);
    return matchesSearch && matchesRegion && matchesTier;
  });

  const totalBrokers = brokers.length;
  const regulatedBrokers = brokers.filter(b => b.isRegulated).length;
  const multiRegulated = brokers.filter(b => b.hasMultipleRegulators).length;
  const tier1Regulated = brokers.filter(b => b.hasTier1).length;
  const tier2Regulated = brokers.filter(b => b.hasTier2).length;

  const toggleExpand = (id: number) => {
    setExpandedBroker(expandedBroker === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          </div>
          <p className="mt-4 text-zinc-500">Loading regulatory data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Hero Header - Mobile Optimized */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-cyan-900/30 p-5 border border-purple-500/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl" />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={16} className="text-purple-400" />
            <span className="text-[10px] font-medium text-purple-400 uppercase tracking-wider">Regulatory Intelligence</span>
          </div>
          <h2 className="text-lg font-bold text-white">Broker Compliance</h2>
          <p className="text-zinc-400 text-xs">Compare regulatory status and protection measures</p>
          
          <div className="flex items-center gap-4 mt-4">
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">{regulatedBrokers}</div>
              <div className="text-[8px] text-zinc-500">Regulated</div>
            </div>
            <div className="w-px h-8 bg-zinc-700" />
            <div className="text-center">
              <div className="text-xl font-bold text-emerald-400">{tier1Regulated}</div>
              <div className="text-[8px] text-zinc-500">Tier 1</div>
            </div>
            <div className="w-px h-8 bg-zinc-700" />
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">{tier2Regulated}</div>
              <div className="text-[8px] text-zinc-500">Tier 2</div>
            </div>
            <div className="w-px h-8 bg-zinc-700" />
            <div className="text-center">
              <div className="text-xl font-bold text-purple-400">{multiRegulated}</div>
              <div className="text-[8px] text-zinc-500">Multi-Reg</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
          <input
            placeholder="Search brokers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2.5 rounded-xl transition-all ${showFilters ? 'bg-purple-600 text-white' : 'bg-zinc-800/50 text-zinc-400 hover:text-white'}`}
        >
          <Filter size={16} />
        </button>
        <div className="flex bg-zinc-800/50 rounded-xl p-1 border border-zinc-700">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-purple-600 text-white" : "text-zinc-400"}`}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-purple-600 text-white" : "text-zinc-400"}`}
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }} 
            exit={{ opacity: 0, height: 0 }}
            className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800 overflow-hidden space-y-3"
          >
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Region</label>
              <select
                value={selectedRegions[0] || ''}
                onChange={(e) => setSelectedRegions(e.target.value ? [e.target.value] : [])}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value="">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Regulator Tier</label>
              <select
                value={selectedTier === null ? '' : selectedTier}
                onChange={(e) => setSelectedTier(e.target.value ? Number(e.target.value) : null)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value="">All Tiers</option>
                <option value="1">Tier 1 (Top Regulators)</option>
                <option value="2">Tier 2 (Good Regulators)</option>
                <option value="3">Tier 3 (Basic Regulation)</option>
              </select>
            </div>
            <button 
              onClick={() => { setSearchTerm(""); setSelectedRegions([]); setSelectedTier(null); }} 
              className="text-xs text-zinc-500 hover:text-white transition-colors"
            >
              Clear All
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      <div className="text-xs text-zinc-500">{filteredBrokers.length} brokers</div>

      {/* Grid View - WITH LOGOS */}
      {viewMode === "grid" ? (
        <div className="space-y-3">
          {filteredBrokers.map((broker) => {
            const isExpanded = expandedBroker === broker.id;
            const compliance = getComplianceLevel(broker);
            const tierCount = broker.regulators.length;
            
            return (
              <div
                key={broker.id}
                className="bg-zinc-900/30 rounded-xl border border-zinc-800 hover:border-purple-500/30 transition-all overflow-hidden"
              >
                {/* Card Header */}
                <div 
                  className="p-4 cursor-pointer hover:bg-zinc-800/20 transition-colors"
                  onClick={() => toggleExpand(broker.id)}
                >
                  <div className="flex items-start gap-3">
                    <FirmLogo firm={broker} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white text-sm truncate hover:text-purple-400 transition-colors">
                          {broker.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                          <Globe size={10} /> {broker.country}
                        </span>
                        {broker.hasTier1 && (
                          <span className="text-[7px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                            Tier 1
                          </span>
                        )}
                        {broker.hasTier2 && !broker.hasTier1 && (
                          <span className="text-[7px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full border border-blue-500/30">
                            Tier 2
                          </span>
                        )}
                        {tierCount > 1 && (
                          <span className="text-[7px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full border border-purple-500/30">
                            {tierCount} Regs
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="p-1 rounded-lg bg-zinc-800/50 hover:bg-zinc-700 transition-colors flex-shrink-0">
                      {isExpanded ? <ChevronUp size={14} className="text-zinc-400" /> : <ChevronDown size={14} className="text-zinc-400" />}
                    </button>
                  </div>

                  {/* Compliance Score */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-zinc-500">Compliance Score</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${compliance.score >= 80 ? 'text-green-400' : compliance.score >= 65 ? 'text-blue-400' : compliance.score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {compliance.score}%
                        </span>
                        <span className={`text-[7px] px-2 py-0.5 rounded-full ${compliance.color}`}>
                          {compliance.level}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          compliance.score >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                          compliance.score >= 65 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                          compliance.score >= 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                          'bg-gradient-to-r from-red-500 to-orange-500'
                        }`}
                        style={{ width: `${compliance.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {broker.regulators.slice(0, 2).map((reg, idx) => {
                      const info = getRegulatorInfo(reg);
                      return (
                        <span key={idx} className={`text-[8px] px-2 py-0.5 rounded-full border ${info.tierColor}`}>
                          {info.short}
                        </span>
                      );
                    })}
                    {broker.regulators.length > 2 && (
                      <span className="text-[8px] text-zinc-500">+{broker.regulators.length - 2}</span>
                    )}
                  </div>

                  {/* Protection Icons */}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-400">
                    <span className={`flex items-center gap-0.5 ${broker.negativeBalanceProtection ? 'text-green-400' : 'text-zinc-500'}`}>
                      <Shield size={10} /> NBP
                    </span>
                    <span className={`flex items-center gap-0.5 ${broker.segregatedAccounts ? 'text-green-400' : 'text-zinc-500'}`}>
                      <Lock size={10} /> Seg
                    </span>
                    <span className="flex items-center gap-0.5 text-zinc-500">
                      <Banknote size={10} /> {broker.compensationScheme !== "None" ? 'Comp' : '—'}
                    </span>
                  </div>
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
                      <div className="p-4 bg-zinc-800/20 space-y-3">
                        {/* All Regulators */}
                        <div>
                          <div className="text-[10px] text-zinc-500 mb-1.5 flex items-center gap-1">
                            <Landmark size={12} /> Regulatory Authorities
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {broker.regulators.map((reg, idx) => {
                              const info = getRegulatorInfo(reg);
                              return (
                                <span key={idx} className={`text-[8px] px-2.5 py-1 rounded-full border ${info.tierColor}`}>
                                  {info.short} ({info.tierLabel})
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Protection Details */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-zinc-800/30 rounded-lg p-2">
                            <div className="text-zinc-400 text-[8px]">NBP</div>
                            <div className={`text-xs font-semibold ${broker.negativeBalanceProtection ? 'text-green-400' : 'text-zinc-500'}`}>
                              {broker.negativeBalanceProtection ? '✅ Protected' : '❌ No'}
                            </div>
                          </div>
                          <div className="bg-zinc-800/30 rounded-lg p-2">
                            <div className="text-zinc-400 text-[8px]">Segregated Accounts</div>
                            <div className={`text-xs font-semibold ${broker.segregatedAccounts ? 'text-green-400' : 'text-zinc-500'}`}>
                              {broker.segregatedAccounts ? '✅ Yes' : '❌ No'}
                            </div>
                          </div>
                          <div className="bg-zinc-800/30 rounded-lg p-2">
                            <div className="text-zinc-400 text-[8px]">Compensation</div>
                            <div className="text-xs font-semibold text-white truncate">
                              {broker.compensationScheme !== "None" ? broker.compensationScheme : '—'}
                            </div>
                          </div>
                          <div className="bg-zinc-800/30 rounded-lg p-2">
                            <div className="text-zinc-400 text-[8px]">Years Regulated</div>
                            <div className="text-xs font-semibold text-white">
                              {broker.yearsRegulated || '—'}
                            </div>
                          </div>
                        </div>

                        {/* Action */}
                        <Link
                          href={`/brokers/${slugify(broker.name)}`}
                          className="flex items-center justify-center w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
                        >
                          View Full Profile <ArrowRight size={12} className="ml-1" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View - WITH LOGOS */
        <div className="bg-zinc-900/30 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-zinc-800/30 border-b border-zinc-700/50 text-[10px] text-zinc-500 font-medium">
            <div className="col-span-4">Broker</div>
            <div className="col-span-3">Regulators</div>
            <div className="col-span-2">Tier</div>
            <div className="col-span-2">Score</div>
            <div className="col-span-1 text-right"></div>
          </div>
          {filteredBrokers.map((broker) => {
            const isExpanded = expandedBroker === broker.id;
            const compliance = getComplianceLevel(broker);
            
            return (
              <div key={broker.id} className="border-b border-zinc-800/50 last:border-0">
                <div 
                  className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-zinc-800/20 transition-colors items-center cursor-pointer"
                  onClick={() => toggleExpand(broker.id)}
                >
                  <div className="col-span-4 flex items-center gap-2 min-w-0">
                    <FirmLogo firm={broker} size="sm" />
                    <span className="text-white font-medium text-xs truncate">{broker.name}</span>
                  </div>
                  <div className="col-span-3 flex flex-wrap gap-0.5">
                    {broker.regulators.slice(0, 2).map((reg, idx) => {
                      const info = getRegulatorInfo(reg);
                      return (
                        <span key={idx} className={`text-[7px] px-1.5 py-0.5 rounded-full border ${info.tierColor}`}>
                          {info.short}
                        </span>
                      );
                    })}
                    {broker.regulators.length > 2 && (
                      <span className="text-[7px] text-zinc-500">+{broker.regulators.length - 2}</span>
                    )}
                  </div>
                  <div className="col-span-2">
                    {broker.hasTier1 ? (
                      <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">Tier 1</span>
                    ) : broker.hasTier2 ? (
                      <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">Tier 2</span>
                    ) : broker.regulators.length > 0 ? (
                      <span className="text-[8px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">Tier 3</span>
                    ) : (
                      <span className="text-[8px] text-zinc-500">—</span>
                    )}
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1 w-8 bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${compliance.score >= 80 ? 'bg-green-500' : compliance.score >= 65 ? 'bg-blue-500' : compliance.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${compliance.score}%` }} />
                      </div>
                      <span className="text-[10px] font-medium text-white">{compliance.score}%</span>
                    </div>
                  </div>
                  <div className="col-span-1 text-right">
                    {isExpanded ? <ChevronUp size={12} className="text-zinc-400" /> : <ChevronDown size={12} className="text-zinc-400" />}
                  </div>
                </div>

                {/* Expanded Row */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-zinc-800"
                    >
                      <div className="px-4 py-3 bg-zinc-800/10 space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {broker.regulators.map((reg, idx) => {
                            const info = getRegulatorInfo(reg);
                            return (
                              <span key={idx} className={`text-[8px] px-2 py-0.5 rounded-full border ${info.tierColor}`}>
                                {info.short} ({info.tierLabel})
                              </span>
                            );
                          })}
                        </div>
                        <div className="flex flex-wrap gap-3 text-[10px]">
                          <span className="flex items-center gap-0.5">
                            <span className="text-zinc-500">NBP:</span>
                            <span className={broker.negativeBalanceProtection ? 'text-green-400' : 'text-zinc-500'}>
                              {broker.negativeBalanceProtection ? '✅' : '❌'}
                            </span>
                          </span>
                          <span className="flex items-center gap-0.5">
                            <span className="text-zinc-500">Seg:</span>
                            <span className={broker.segregatedAccounts ? 'text-green-400' : 'text-zinc-500'}>
                              {broker.segregatedAccounts ? '✅' : '❌'}
                            </span>
                          </span>
                          <span className="flex items-center gap-0.5">
                            <span className="text-zinc-500">Comp:</span>
                            <span className="text-white">{broker.compensationScheme !== "None" ? broker.compensationScheme : '—'}</span>
                          </span>
                        </div>
                        <Link href={`/brokers/${slugify(broker.name)}`} className="inline-flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 transition-colors">
                          View Profile <ArrowRight size={10} />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {filteredBrokers.length === 0 && (
        <div className="text-center py-12 bg-zinc-900/30 rounded-xl border border-zinc-800">
          <ShieldCheck size={40} className="text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">No brokers found</p>
          <p className="text-zinc-600 text-xs">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}