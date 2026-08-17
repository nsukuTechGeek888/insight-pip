'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRegion } from "@/contexts/RegionContext";
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

// ===================== REGION DISPLAY INFO =====================
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
  MU: { label: 'Mauritius', flag: '🇲🇺' },
  SC: { label: 'Seychelles', flag: '🇸🇨' },
  BVI: { label: 'BVI', flag: '🇻🇬' },
  NZ: { label: 'New Zealand', flag: '🇳🇿' },
  HK: { label: 'Hong Kong', flag: '🇭🇰' },
  IN: { label: 'India', flag: '🇮🇳' },
  BR: { label: 'Brazil', flag: '🇧🇷' },
  MX: { label: 'Mexico', flag: '🇲🇽' },
  NG: { label: 'Nigeria', flag: '🇳🇬' },
  GH: { label: 'Ghana', flag: '🇬🇭' },
  TZ: { label: 'Tanzania', flag: '🇹🇿' },
  ZW: { label: 'Zimbabwe', flag: '🇿🇼' },
  GLOBAL: { label: 'Global', flag: '🌍' },
};

// ===================== REGULATOR TIER SYSTEM =====================
const REGULATOR_TIERS: Record<string, { tier: 1 | 2 | 3 | 4; label: string; color: string }> = {
  // Tier 1 - Top Tier (Most Strict)
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
  'MAS': { tier: 1, label: 'Tier 1', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  'IIROC': { tier: 1, label: 'Tier 1', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  'HKMA': { tier: 1, label: 'Tier 1', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  'SFC': { tier: 1, label: 'Tier 1', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  
  // Tier 2 - Well-Regarded (Good)
  'MFSA': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'CySEC': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'FSA': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'DFSA': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'SCA': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'JFSA': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'FSCA': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'CMA': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'CIMA': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'LFSA': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'FSC': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'BVIFSC': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'SEC Nigeria': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'SEC Ghana': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'SEBI': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'CVM': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'CNBV': { tier: 2, label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  
  // Tier 3 - Basic Regulation (Offshore with some oversight)
  'VFSC': { tier: 3, label: 'Tier 3', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  'IFSC': { tier: 3, label: 'Tier 3', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  'FSA SVG': { tier: 3, label: 'Tier 3', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  'MISA': { tier: 3, label: 'Tier 3', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  'FSB': { tier: 3, label: 'Tier 3', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  
  // Tier 4 - Unregulated / No oversight
  'Unregulated': { tier: 4, label: 'Unregulated', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

// ===================== REGULATORY REQUIREMENTS BY REGION =====================

// Each region's regulatory requirements for a broker to be fully compliant (100%)
const REGION_REQUIREMENTS: Record<string, { 
  requiredRegulators: string[];
  requiredProtections: string[];
  minimumYears: number;
  requiresLocalRegistration: boolean;
  requiresCompensationScheme: boolean;
  compensationMinAmount?: number;
}> = {
  // South Africa (FSCA)
  'SA': {
    requiredRegulators: ['FSCA'],
    requiredProtections: ['Segregated Accounts', 'Negative Balance Protection'],
    minimumYears: 3,
    requiresLocalRegistration: true,
    requiresCompensationScheme: true,
    compensationMinAmount: 1000000, // ZAR
  },
  // Europe (CySEC/ESMA)
  'EU': {
    requiredRegulators: ['CySEC', 'MFSA', 'BaFin', 'AMF', 'CONSOB', 'ESMA'],
    requiredProtections: ['Segregated Accounts', 'Negative Balance Protection'],
    minimumYears: 5,
    requiresLocalRegistration: true,
    requiresCompensationScheme: true,
    compensationMinAmount: 20000, // EUR
  },
  // UK (FCA)
  'UK': {
    requiredRegulators: ['FCA'],
    requiredProtections: ['Segregated Accounts', 'Negative Balance Protection'],
    minimumYears: 5,
    requiresLocalRegistration: true,
    requiresCompensationScheme: true,
    compensationMinAmount: 85000, // GBP
  },
  // USA (CFTC/NFA)
  'US': {
    requiredRegulators: ['CFTC', 'NFA', 'SEC', 'FINRA'],
    requiredProtections: ['Segregated Accounts', 'Negative Balance Protection'],
    minimumYears: 5,
    requiresLocalRegistration: true,
    requiresCompensationScheme: true,
    compensationMinAmount: 500000, // USD
  },
  // Canada (IIROC/OSC)
  'CA': {
    requiredRegulators: ['IIROC', 'OSC'],
    requiredProtections: ['Segregated Accounts', 'Negative Balance Protection'],
    minimumYears: 5,
    requiresLocalRegistration: true,
    requiresCompensationScheme: true,
    compensationMinAmount: 1000000, // CAD
  },
  // Australia (ASIC)
  'AU': {
    requiredRegulators: ['ASIC'],
    requiredProtections: ['Segregated Accounts', 'Negative Balance Protection'],
    minimumYears: 5,
    requiresLocalRegistration: true,
    requiresCompensationScheme: true,
    compensationMinAmount: 500000, // AUD
  },
  // Singapore (MAS)
  'SG': {
    requiredRegulators: ['MAS'],
    requiredProtections: ['Segregated Accounts', 'Negative Balance Protection'],
    minimumYears: 5,
    requiresLocalRegistration: true,
    requiresCompensationScheme: true,
    compensationMinAmount: 500000, // SGD
  },
  // UAE (DFSA/SCA)
  'UAE': {
    requiredRegulators: ['DFSA', 'SCA'],
    requiredProtections: ['Segregated Accounts'],
    minimumYears: 3,
    requiresLocalRegistration: true,
    requiresCompensationScheme: false,
  },
  // Kenya (CMA)
  'KE': {
    requiredRegulators: ['CMA'],
    requiredProtections: ['Segregated Accounts'],
    minimumYears: 2,
    requiresLocalRegistration: true,
    requiresCompensationScheme: false,
  },
  // Nigeria (SEC)
  'NG': {
    requiredRegulators: ['SEC Nigeria'],
    requiredProtections: ['Segregated Accounts'],
    minimumYears: 2,
    requiresLocalRegistration: true,
    requiresCompensationScheme: false,
  },
  // Mauritius (FSC)
  'MU': {
    requiredRegulators: ['FSC'],
    requiredProtections: ['Segregated Accounts'],
    minimumYears: 2,
    requiresLocalRegistration: true,
    requiresCompensationScheme: false,
  },
  // Seychelles (FSA)
  'SC': {
    requiredRegulators: ['FSA Seychelles'],
    requiredProtections: [],
    minimumYears: 1,
    requiresLocalRegistration: true,
    requiresCompensationScheme: false,
  },
  // BVI (FSC)
  'BVI': {
    requiredRegulators: ['BVIFSC'],
    requiredProtections: [],
    minimumYears: 1,
    requiresLocalRegistration: true,
    requiresCompensationScheme: false,
  },
  // Default (Global)
  'GLOBAL': {
    requiredRegulators: [],
    requiredProtections: [],
    minimumYears: 0,
    requiresLocalRegistration: false,
    requiresCompensationScheme: false,
  },
};

// ===================== GET REGULATOR INFO =====================
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
    'MAS': { short: 'MAS', full: 'Monetary Authority of Singapore', country: 'Singapore' },
    'IIROC': { short: 'IIROC', full: 'Investment Industry Regulatory Organization of Canada', country: 'Canada' },
    'HKMA': { short: 'HKMA', full: 'Hong Kong Monetary Authority', country: 'Hong Kong' },
    'SFC': { short: 'SFC', full: 'Securities and Futures Commission', country: 'Hong Kong' },
    'MFSA': { short: 'MFSA', full: 'Malta Financial Services Authority', country: 'Malta' },
    'CySEC': { short: 'CySEC', full: 'Cyprus Securities and Exchange Commission', country: 'Cyprus' },
    'FSA': { short: 'FSA', full: 'Financial Services Authority', country: 'Japan' },
    'DFSA': { short: 'DFSA', full: 'Dubai Financial Services Authority', country: 'UAE' },
    'SCA': { short: 'SCA', full: 'Securities and Commodities Authority', country: 'UAE' },
    'JFSA': { short: 'JFSA', full: 'Japan Financial Services Agency', country: 'Japan' },
    'FSCA': { short: 'FSCA', full: 'Financial Sector Conduct Authority', country: 'South Africa' },
    'CMA': { short: 'CMA', full: 'Capital Markets Authority', country: 'Kenya' },
    'CIMA': { short: 'CIMA', full: 'Cayman Islands Monetary Authority', country: 'Cayman Islands' },
    'LFSA': { short: 'LFSA', full: 'Labuan Financial Services Authority', country: 'Malaysia' },
    'FSC': { short: 'FSC', full: 'Financial Services Commission', country: 'Mauritius' },
    'BVIFSC': { short: 'BVIFSC', full: 'British Virgin Islands Financial Services Commission', country: 'BVI' },
    'VFSC': { short: 'VFSC', full: 'Vanuatu Financial Services Commission', country: 'Vanuatu' },
    'IFSC': { short: 'IFSC', full: 'International Financial Services Commission', country: 'Belize' },
    'FSA SVG': { short: 'FSA SVG', full: 'St Vincent Financial Services Authority', country: 'St Vincent' },
    'MISA': { short: 'MISA', full: 'Mauritius Investment Services Authority', country: 'Mauritius' },
    'FSB': { short: 'FSB', full: 'Financial Services Board', country: 'South Africa' },
    'SEC Nigeria': { short: 'SEC', full: 'Securities and Exchange Commission Nigeria', country: 'Nigeria' },
    'SEC Ghana': { short: 'SEC', full: 'Securities and Exchange Commission Ghana', country: 'Ghana' },
    'SEBI': { short: 'SEBI', full: 'Securities and Exchange Board of India', country: 'India' },
    'CVM': { short: 'CVM', full: 'Comissão de Valores Mobiliários', country: 'Brazil' },
    'CNBV': { short: 'CNBV', full: 'Comisión Nacional Bancaria y de Valores', country: 'Mexico' },
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

// ===================== REGULATORY COMPLIANCE SCORE (PURELY REGULATORY) =====================

const getComplianceLevel = (broker: any, userRegion: string): { level: string; color: string; icon: React.ReactNode; score: number; details: string[] } => {
  let score = 0;
  const details: string[] = [];
  const requirements = REGION_REQUIREMENTS[userRegion] || REGION_REQUIREMENTS['GLOBAL'];
  
  // === 1. Check if broker has the required regulator for the region ===
  const hasRequiredRegulator = requirements.requiredRegulators.some(reqReg => 
    broker.regulators.some((reg: string) => {
      const info = getRegulatorInfo(reg);
      return info.short === reqReg || info.full.includes(reqReg) || reg.includes(reqReg);
    })
  );
  
  if (requirements.requiredRegulators.length === 0) {
    // No specific regulator required (Global region)
    score += 20;
    details.push('No specific regulator required for this region');
  } else if (hasRequiredRegulator) {
    score += 40;
    details.push(`✓ Has the required regulator for ${REGION_DISPLAY[userRegion]?.label || userRegion}`);
  } else {
    details.push(`✗ Missing required regulator for ${REGION_DISPLAY[userRegion]?.label || userRegion}`);
  }
  
  // === 2. Check if broker has any recognized regulator ===
  const hasAnyRegulator = broker.regulators.some((reg: string) => {
    const info = getRegulatorInfo(reg);
    return info.tier !== 4;
  });
  
  if (hasAnyRegulator) {
    score += 15;
    details.push('✓ Has recognized regulatory oversight');
  } else {
    details.push('✗ No recognized regulatory oversight');
  }
  
  // === 3. Check regulator tier quality ===
  let bestTier = 4;
  broker.regulators.forEach((reg: string) => {
    const info = getRegulatorInfo(reg);
    if (info.tier < bestTier) {
      bestTier = info.tier;
    }
  });
  
  if (bestTier === 1) {
    score += 15;
    details.push('✓ Top-tier regulator (Tier 1)');
  } else if (bestTier === 2) {
    score += 10;
    details.push('✓ Well-regarded regulator (Tier 2)');
  } else if (bestTier === 3) {
    score += 5;
    details.push('✓ Basic regulatory oversight (Tier 3)');
  } else {
    details.push('✗ No regulatory oversight');
  }
  
  // === 4. Check protection features ===
  let protectionScore = 0;
  const requiredProtections = requirements.requiredProtections || [];
  
  if (broker.negativeBalanceProtection) {
    protectionScore += 5;
    details.push('✓ Negative Balance Protection');
  } else if (requiredProtections.includes('Negative Balance Protection')) {
    details.push('✗ Missing Negative Balance Protection (required for this region)');
  }
  
  if (broker.segregatedAccounts) {
    protectionScore += 5;
    details.push('✓ Segregated Accounts');
  } else if (requiredProtections.includes('Segregated Accounts')) {
    details.push('✗ Missing Segregated Accounts (required for this region)');
  }
  
  // Bonus for having both protections
  if (broker.negativeBalanceProtection && broker.segregatedAccounts) {
    protectionScore += 5;
    details.push('✓ Full protection coverage (NBP + Segregated)');
  }
  
  score += protectionScore;
  
  // === 5. Check years in operation ===
  const years = broker.yearsRegulated || 0;
  const minYears = requirements.minimumYears || 0;
  
  if (years >= minYears) {
    score += 10;
    details.push(`✓ ${years}+ years in operation (meets ${minYears}+ year requirement)`);
  } else if (years > 0) {
    score += 5;
    details.push(`⚠ ${years} years in operation (recommended: ${minYears}+ years)`);
  } else {
    details.push('✗ No years in operation data');
  }
  
  // === 6. Check compensation scheme ===
  if (requirements.requiresCompensationScheme && broker.compensationScheme && broker.compensationScheme !== "None") {
    if (requirements.compensationMinAmount) {
      const amount = parseInt(broker.compensationScheme.replace(/[^0-9]/g, ''));
      if (amount >= requirements.compensationMinAmount) {
        score += 10;
        details.push(`✓ Compensation scheme (${broker.compensationScheme})`);
      } else {
        score += 5;
        details.push(`⚠ Compensation scheme (${broker.compensationScheme}) - below recommended minimum`);
      }
    } else {
      score += 10;
      details.push(`✓ Compensation scheme (${broker.compensationScheme})`);
    }
  } else if (requirements.requiresCompensationScheme) {
    details.push('✗ Missing compensation scheme (required for this region)');
  } else if (broker.compensationScheme && broker.compensationScheme !== "None") {
    score += 5;
    details.push(`✓ Compensation scheme (${broker.compensationScheme})`);
  }
  
  // === 7. Check local registration ===
  if (requirements.requiresLocalRegistration) {
    const hasLocalEntity = broker.entityMapping && Object.values(broker.entityMapping).some(
      (entity: any) => typeof entity === 'string' && 
        (entity.includes(REGION_DISPLAY[userRegion]?.label || userRegion) ||
         entity.includes('Local') ||
         entity.includes('(Pty) Ltd') ||
         entity.includes('Limited'))
    );
    
    if (hasLocalEntity) {
      score += 5;
      details.push('✓ Has local registered entity');
    } else {
      details.push('✗ No local registered entity (recommended for this region)');
    }
  }
  
  // === 8. Check multiple regulators (diversification bonus) ===
  if (broker.regulators.length > 1) {
    const validRegulators = broker.regulators.filter((reg: string) => {
      const info = getRegulatorInfo(reg);
      return info.tier !== 4;
    });
    if (validRegulators.length > 1) {
      score += 5;
      details.push(`✓ Multiple regulators (${validRegulators.length}) - diversified oversight`);
    }
  }
  
  // Cap at 100
  const finalScore = Math.min(Math.max(score, 0), 100);
  
  // Determine level based purely on regulatory compliance
  let level, color, icon;
  if (finalScore >= 85) {
    level = 'Fully Compliant';
    color = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    icon = <ShieldCheck size={14} className="text-emerald-400" />;
  } else if (finalScore >= 70) {
    level = 'Highly Compliant';
    color = 'bg-green-500/20 text-green-400 border-green-500/30';
    icon = <ShieldCheck size={14} className="text-green-400" />;
  } else if (finalScore >= 50) {
    level = 'Compliant';
    color = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    icon = <ShieldCheck size={14} className="text-blue-400" />;
  } else if (finalScore >= 30) {
    level = 'Basic Compliance';
    color = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    icon = <AlertTriangle size={14} className="text-yellow-400" />;
  } else {
    level = 'Limited Compliance';
    color = 'bg-red-500/20 text-red-400 border-red-500/30';
    icon = <ShieldOff size={14} className="text-red-400" />;
  }
  
  return { level, color, icon, score: finalScore, details };
};

export default function RegulationsTab() {
  const { region } = useRegion();
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

  // Get region info for display
  const regionInfo = REGION_DISPLAY[region] || REGION_DISPLAY['GLOBAL'];

  // Fetch data with region
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.getBrokers(region);
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
  }, [region]);

  // Process brokers data
  const brokers = brokersData.map((broker) => {
    const detailed = brokerDetails[broker.id];
    
    let regulators: string[] = [];
    let negativeBalanceProtection = false;
    let segregatedAccounts = false;
    let compensationScheme = "None";
    let entityMapping = null;
    
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
      entityMapping = detailed.entityMapping || null;
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
        'Malta': ['MFSA'], 'UK': ['FCA'], 'United Kingdom': ['FCA'],
        'Cyprus': ['CySEC'], 'Australia': ['ASIC'], 'USA': ['CFTC', 'NFA'], 'United States': ['CFTC', 'NFA'],
        'Germany': ['BaFin'], 'South Africa': ['FSCA'], 'UAE': ['DFSA', 'SCA'],
        'Singapore': ['MAS'], 'Hong Kong': ['HKMA'], 'Canada': ['IIROC'],
        'France': ['AMF'], 'Italy': ['CONSOB'], 'Japan': ['FSA'],
        'Cayman Islands': ['CIMA'], 'Mauritius': ['FSC'], 'Malaysia': ['LFSA'],
        'BVI': ['BVIFSC'], 'Vanuatu': ['VFSC'], 'Belize': ['IFSC'],
        'St Vincent': ['FSA SVG'], 'Kenya': ['CMA'], 'Nigeria': ['SEC Nigeria'],
        'Ghana': ['SEC Ghana'], 'India': ['SEBI'], 'Brazil': ['CVM'], 'Mexico': ['CNBV'],
      };
      regulators = regMap[country] || ['Unregulated'];
    }
    
    regulators = [...new Set(regulators.filter(r => r && typeof r === 'string' && r.trim() !== ''))];
    
    if (regulators.length === 0) {
      regulators = ['Unregulated'];
    }

    let regionName = "Global";
    const country = broker.country || '';
    const regionMap: Record<string, string> = {
      'Malta': 'Europe', 'Cyprus': 'Europe', 'Germany': 'Europe', 'France': 'Europe', 'Italy': 'Europe',
      'UK': 'Europe', 'United Kingdom': 'Europe',
      'Australia': 'Asia Pacific', 'Singapore': 'Asia Pacific', 'Hong Kong': 'Asia Pacific', 'Japan': 'Asia Pacific',
      'New Zealand': 'Asia Pacific',
      'USA': 'North America', 'United States': 'North America', 'Canada': 'North America',
      'UAE': 'Middle East',
      'South Africa': 'Africa', 'Kenya': 'Africa', 'Nigeria': 'Africa', 'Ghana': 'Africa',
      'Tanzania': 'Africa', 'Zimbabwe': 'Africa',
      'Cayman Islands': 'Caribbean', 'Mauritius': 'Africa', 'Seychelles': 'Africa',
      'BVI': 'Caribbean', 'Vanuatu': 'Oceania', 'Belize': 'Caribbean', 'St Vincent': 'Caribbean',
    };
    regionName = regionMap[country] || 'Global';

    const isRegulated = regulators.some(r => r !== 'Unregulated' && r !== 'unregulated');
    const hasMultipleRegulators = regulators.length > 1;
    const hasTier1 = regulators.some(reg => getRegulatorInfo(reg).tier === 1);
    const hasTier2 = regulators.some(reg => getRegulatorInfo(reg).tier === 2);

    return {
      id: broker.id,
      name: broker.name,
      logo: broker.logo,
      country: broker.country || 'International',
      region: regionName,
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
      reviewCount: broker.reviewsCount || 0,
      website: broker.website || '#',
      entityMapping: entityMapping,
    };
  });

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

  // Show empty state with region suggestions if no brokers in region
  if (brokers.length === 0) {
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
        <ShieldCheck size={48} className="text-zinc-600 mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-white mb-2">No regulatory data in your region</h3>
        <p className="text-zinc-400 mb-4">We don't have any brokers available in {regionInfo.flag} {regionInfo.label} yet.</p>
        
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
          View All Global Brokers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ❌ REGION BANNER REMOVED - Users select region in navbar */}

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-cyan-900/30 p-6 border border-purple-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={20} className="text-purple-400" />
              <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">Regulatory Intelligence</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Broker Compliance Overview</h2>
            <p className="text-zinc-400 text-sm">Compare regulatory status, protection measures, and compliance levels</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{regulatedBrokers}</div>
              <div className="text-[10px] text-zinc-500">Regulated</div>
            </div>
            <div className="w-px h-8 bg-zinc-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{tier1Regulated}</div>
              <div className="text-[10px] text-zinc-500">Tier 1</div>
            </div>
            <div className="w-px h-8 bg-zinc-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{tier2Regulated}</div>
              <div className="text-[10px] text-zinc-500">Tier 2</div>
            </div>
            <div className="w-px h-8 bg-zinc-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{multiRegulated}</div>
              <div className="text-[10px] text-zinc-500">Multi-Regulated</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              showFilters 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                : 'bg-zinc-800/50 text-zinc-400 hover:text-white border border-zinc-700'
            }`}
          >
            <Filter size={14} /> Filters
            {(searchTerm || selectedRegions.length > 0 || selectedTier !== null) && 
              <span className="w-2 h-2 bg-purple-500 rounded-full" />
            }
          </button>
          <div className="flex bg-zinc-800/50 rounded-xl p-1 border border-zinc-700">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-white"}`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-white"}`}
            >
              <List size={14} />
            </button>
          </div>
        </div>
        <div className="text-sm text-zinc-500">{filteredBrokers.length} brokers</div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }} 
            exit={{ opacity: 0, height: 0 }}
            className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Search</label>
                <input
                  placeholder="Broker, country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Region</label>
                <select
                  value={selectedRegions[0] || ''}
                  onChange={(e) => setSelectedRegions(e.target.value ? [e.target.value] : [])}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
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
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="">All Tiers</option>
                  <option value="1">Tier 1 (Top Regulators)</option>
                  <option value="2">Tier 2 (Good Regulators)</option>
                  <option value="3">Tier 3 (Basic Regulation)</option>
                </select>
              </div>
              <div className="flex items-end">
                <button 
                  onClick={() => { setSearchTerm(""); setSelectedRegions([]); setSelectedTier(null); }} 
                  className="text-xs text-zinc-500 hover:text-white transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBrokers.map((broker) => {
            const isExpanded = expandedBroker === broker.id;
            const compliance = getComplianceLevel(broker, region);
            const tierCount = broker.regulators.length;
            
            return (
              <div
                key={broker.id}
                className="group bg-zinc-900/30 rounded-xl border border-zinc-800 hover:border-purple-500/30 transition-all overflow-hidden"
              >
                {/* Card Header */}
                <div 
                  className="p-5 cursor-pointer hover:bg-zinc-800/20 transition-colors"
                  onClick={() => toggleExpand(broker.id)}
                >
                  <div className="flex items-start gap-3">
                    <FirmLogo firm={broker} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white text-base truncate group-hover:text-purple-400 transition-colors">
                          {broker.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-zinc-400 flex items-center gap-1">
                          <Globe size={10} /> {broker.country}
                        </span>
                        {broker.hasTier1 && (
                          <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                            Tier 1
                          </span>
                        )}
                        {broker.hasTier2 && !broker.hasTier1 && (
                          <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full border border-blue-500/30">
                            Tier 2
                          </span>
                        )}
                        {tierCount > 1 && (
                          <span className="text-[8px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full border border-purple-500/30">
                            {tierCount} Regulators
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="p-1 rounded-lg bg-zinc-800/50 hover:bg-zinc-700 transition-colors flex-shrink-0">
                      {isExpanded ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
                    </button>
                  </div>

                  {/* Compliance Score */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-zinc-500">Compliance Score</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${compliance.score >= 85 ? 'text-emerald-400' : compliance.score >= 70 ? 'text-green-400' : compliance.score >= 50 ? 'text-blue-400' : compliance.score >= 30 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {compliance.score}%
                        </span>
                        <span className={`text-[8px] px-2 py-0.5 rounded-full ${compliance.color}`}>
                          {compliance.level}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          compliance.score >= 85 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                          compliance.score >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                          compliance.score >= 50 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                          compliance.score >= 30 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                          'bg-gradient-to-r from-red-500 to-orange-500'
                        }`}
                        style={{ width: `${compliance.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {broker.regulators.slice(0, 2).map((reg, idx) => {
                      const info = getRegulatorInfo(reg);
                      return (
                        <span key={idx} className={`text-[9px] px-2.5 py-0.5 rounded-full border ${info.tierColor}`}>
                          {info.short}
                        </span>
                      );
                    })}
                    {broker.regulators.length > 2 && (
                      <span className="text-[9px] text-zinc-500">+{broker.regulators.length - 2}</span>
                    )}
                    {broker.regulators.length === 0 && (
                      <span className="text-[9px] text-zinc-500">No regulation</span>
                    )}
                  </div>

                  {/* Protection Icons */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
                    <span className={`flex items-center gap-1 ${broker.negativeBalanceProtection ? 'text-green-400' : 'text-zinc-500'}`}>
                      <Shield size={10} /> NBP
                    </span>
                    <span className={`flex items-center gap-1 ${broker.segregatedAccounts ? 'text-green-400' : 'text-zinc-500'}`}>
                      <Lock size={10} /> Seg
                    </span>
                    <span className="flex items-center gap-1 text-zinc-500">
                      <Banknote size={10} /> {broker.compensationScheme !== "None" ? 'Comp' : '—'}
                    </span>
                    <span className="flex items-center gap-1 text-zinc-500">
                      <Clock size={10} /> {broker.yearsRegulated || '—'}y
                    </span>
                  </div>

                  {/* Region-Specific Status */}
                  <div className="mt-2 text-[10px]">
                    {broker.regulators.some((reg: string) => {
                      const info = getRegulatorInfo(reg);
                      return info.country === REGION_DISPLAY[region]?.label || 
                             info.country === region;
                    }) ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Regulated in your region
                      </span>
                    ) : broker.isRegulated ? (
                      <span className="text-yellow-400 flex items-center gap-1">
                        <AlertTriangle size={10} /> Regulated elsewhere
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1">
                        <X size={10} /> Not regulated
                      </span>
                    )}
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
                      <div className="p-5 bg-zinc-800/20 space-y-4">
                        {/* All Regulators with Tiers */}
                        <div>
                          <div className="text-xs text-zinc-500 mb-2 flex items-center gap-1">
                            <Landmark size={12} /> Regulatory Authorities
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {broker.regulators.map((reg, idx) => {
                              const info = getRegulatorInfo(reg);
                              return (
                                <div key={idx} className="group/reg relative">
                                  <div className={`flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full border ${info.tierColor} cursor-help transition-all hover:scale-105`}>
                                    <span>{info.short}</span>
                                    <span className="text-[8px] opacity-70">{info.tierLabel}</span>
                                  </div>
                                  <div className="hidden group-hover/reg:block absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl text-xs text-zinc-300 min-w-[200px]">
                                    <div className="font-medium text-white mb-1">{info.full}</div>
                                    <div className="text-zinc-400 text-[10px]">Country: {info.country}</div>
                                    <div className="text-zinc-500 text-[10px]">Tier: {info.tierLabel}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Compliance Breakdown */}
                        <div>
                          <div className="text-xs text-zinc-500 mb-2">Compliance Details</div>
                          <div className="space-y-1">
                            {compliance.details.map((detail, i) => (
                              <div key={i} className="text-[10px] text-zinc-300 flex items-start gap-2">
                                <span className="mt-0.5">{detail.startsWith('✓') ? '✅' : detail.startsWith('✗') ? '❌' : '⚠️'}</span>
                                <span>{detail}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Protection Details */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-zinc-800/30 rounded-lg p-2.5">
                            <div className="text-zinc-400 text-[10px]">Negative Balance Protection</div>
                            <div className={`text-sm font-semibold ${broker.negativeBalanceProtection ? 'text-green-400' : 'text-red-400'}`}>
                              {broker.negativeBalanceProtection ? '✅ Protected' : '❌ Not Available'}
                            </div>
                          </div>
                          <div className="bg-zinc-800/30 rounded-lg p-2.5">
                            <div className="text-zinc-400 text-[10px]">Segregated Accounts</div>
                            <div className={`text-sm font-semibold ${broker.segregatedAccounts ? 'text-green-400' : 'text-red-400'}`}>
                              {broker.segregatedAccounts ? '✅ Yes' : '❌ Not Available'}
                            </div>
                          </div>
                          <div className="bg-zinc-800/30 rounded-lg p-2.5">
                            <div className="text-zinc-400 text-[10px]">Compensation Scheme</div>
                            <div className="text-sm font-semibold text-white">
                              {broker.compensationScheme !== "None" ? broker.compensationScheme : '—'}
                            </div>
                          </div>
                          <div className="bg-zinc-800/30 rounded-lg p-2.5">
                            <div className="text-zinc-400 text-[10px]">Years Regulated</div>
                            <div className="text-sm font-semibold text-white">
                              {broker.yearsRegulated || '—'}
                            </div>
                          </div>
                        </div>

                        {/* Action */}
                        <Link
                          href={`/brokers/${slugify(broker.name)}`}
                          className="flex items-center justify-between w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
                        >
                          View Full Profile
                          <ArrowRight size={14} />
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
        /* List View */
        <div className="bg-zinc-900/30 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-zinc-800/30 border-b border-zinc-700/50 text-xs text-zinc-500 font-medium">
            <div className="col-span-3">Broker</div>
            <div className="col-span-2">Regulators</div>
            <div className="col-span-2">Tier</div>
            <div className="col-span-2">Compliance</div>
            <div className="col-span-2">Protection</div>
            <div className="col-span-1 text-right">Status</div>
          </div>
          {filteredBrokers.map((broker) => {
            const isExpanded = expandedBroker === broker.id;
            const compliance = getComplianceLevel(broker, region);
            
            return (
              <div key={broker.id} className="border-b border-zinc-800/50 last:border-0">
                <div 
                  className="grid grid-cols-12 gap-3 px-5 py-3 hover:bg-zinc-800/20 transition-colors items-center cursor-pointer"
                  onClick={() => toggleExpand(broker.id)}
                >
                  <div className="col-span-3 flex items-center gap-3">
                    <FirmLogo firm={broker} size="sm" />
                    <span className="text-white font-medium text-sm">{broker.name}</span>
                  </div>
                  <div className="col-span-2 flex flex-wrap gap-1">
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
                  <div className="col-span-2">
                    {broker.hasTier1 ? (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Tier 1</span>
                    ) : broker.hasTier2 ? (
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Tier 2</span>
                    ) : broker.regulators.length > 0 ? (
                      <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Tier 3</span>
                    ) : (
                      <span className="text-[10px] text-zinc-500">—</span>
                    )}
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-12 bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${compliance.score >= 85 ? 'bg-emerald-500' : compliance.score >= 70 ? 'bg-green-500' : compliance.score >= 50 ? 'bg-blue-500' : compliance.score >= 30 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${compliance.score}%` }} />
                      </div>
                      <span className="text-xs font-medium text-white">{compliance.score}%</span>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 text-xs">
                    <span className={broker.negativeBalanceProtection ? 'text-green-400' : 'text-zinc-500'}>NBP</span>
                    <span className={broker.segregatedAccounts ? 'text-green-400' : 'text-zinc-500'}>Seg</span>
                    <span className="text-zinc-500">{broker.compensationScheme !== "None" ? 'Comp' : '—'}</span>
                  </div>
                  <div className="col-span-1 text-right">
                    {isExpanded ? <ChevronUp size={14} className="text-zinc-400" /> : <ChevronDown size={14} className="text-zinc-400" />}
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
                      <div className="px-5 py-4 bg-zinc-800/10 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {broker.regulators.map((reg, idx) => {
                            const info = getRegulatorInfo(reg);
                            return (
                              <span key={idx} className={`text-[10px] px-3 py-1 rounded-full border ${info.tierColor}`}>
                                {info.short} ({info.tierLabel} · {info.country})
                              </span>
                            );
                          })}
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs">
                          <span className="flex items-center gap-1">
                            <span className="text-zinc-500">NBP:</span>
                            <span className={broker.negativeBalanceProtection ? 'text-green-400' : 'text-red-400'}>
                              {broker.negativeBalanceProtection ? '✅' : '❌'}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-zinc-500">Segregated:</span>
                            <span className={broker.segregatedAccounts ? 'text-green-400' : 'text-red-400'}>
                              {broker.segregatedAccounts ? '✅' : '❌'}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-zinc-500">Compensation:</span>
                            <span className="text-white">{broker.compensationScheme !== "None" ? broker.compensationScheme : '—'}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-zinc-500">Years:</span>
                            <span className="text-white">{broker.yearsRegulated || '—'}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-zinc-500">Status:</span>
                            <span className={broker.isRegulated ? 'text-green-400' : 'text-red-400'}>
                              {broker.isRegulated ? 'Regulated' : 'Unregulated'}
                            </span>
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {compliance.details.map((detail, i) => (
                            <div key={i}>{detail}</div>
                          ))}
                        </div>
                        <Link href={`/brokers/${slugify(broker.name)}`} className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors">
                          View Full Profile <ArrowRight size={10} />
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
          <ShieldCheck size={48} className="text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-500">No brokers found</p>
          <p className="text-zinc-600 text-sm">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}