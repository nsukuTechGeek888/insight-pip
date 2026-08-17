// components/NotAvailableInRegion.tsx
// Component shown when a broker/prop firm is not available in user's region

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Globe, AlertTriangle, Shield, ArrowRight, 
  Building2, Users, Star, ExternalLink 
} from 'lucide-react';

interface Alternative {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  type: 'broker' | 'prop-firm';
  rating: number;
  country?: string;
}

interface NotAvailableInRegionProps {
  entityName: string;
  entityType: 'broker' | 'prop-firm';
  entitySlug?: string;
  region: string;
  availableRegions: string[];
  availableRegionNames: string[];
  alternatives?: Alternative[];
  onViewAlternatives?: () => void;
}

export default function NotAvailableInRegion({
  entityName,
  entityType,
  entitySlug,
  region,
  availableRegions,
  availableRegionNames,
  alternatives = [],
  onViewAlternatives,
}: NotAvailableInRegionProps) {
  const regionInfo: Record<string, { label: string; flag: string }> = {
    SA: { label: 'South Africa', flag: '🇿🇦' },
    EU: { label: 'Europe', flag: '🇪🇺' },
    UK: { label: 'United Kingdom', flag: '🇬🇧' },
    UAE: { label: 'United Arab Emirates', flag: '🇦🇪' },
    KE: { label: 'Kenya', flag: '🇰🇪' },
    AU: { label: 'Australia', flag: '🇦🇺' },
    SG: { label: 'Singapore', flag: '🇸🇬' },
    US: { label: 'United States', flag: '🇺🇸' },
    CA: { label: 'Canada', flag: '🇨🇦' },
    GLOBAL: { label: 'Global', flag: '🌍' },
  };

  const currentRegionInfo = regionInfo[region] || { label: region, flag: '🌍' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-8"
    >
      <div className="bg-gradient-to-br from-red-900/30 via-zinc-900 to-zinc-950 rounded-2xl border border-red-500/30 p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={32} className="text-red-400" />
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {entityName} is not available in your region
        </h1>

        {/* Current Region */}
        <div className="flex items-center justify-center gap-2 text-zinc-400 mb-6">
          <span>You are viewing from</span>
          <span className="text-xl">{currentRegionInfo.flag}</span>
          <span className="text-white font-medium">{currentRegionInfo.label}</span>
        </div>

        {/* Available Regions */}
        <div className="bg-zinc-800/30 rounded-xl p-4 mb-6 border border-zinc-700">
          <p className="text-sm text-zinc-400 mb-2 flex items-center justify-center gap-2">
            <Globe size={14} />
            Available in:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {availableRegions.map((reg) => {
              const info = regionInfo[reg] || { label: reg, flag: '🌍' };
              return (
                <span
                  key={reg}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-700/50 rounded-full text-xs text-zinc-300"
                >
                  <span>{info.flag}</span>
                  <span>{info.label}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Why? */}
        <div className="bg-yellow-500/10 rounded-xl p-4 mb-6 border border-yellow-500/20 text-left">
          <p className="text-xs text-yellow-400 font-medium mb-1">Why is this?</p>
          <p className="text-xs text-zinc-400">
            {entityType === 'broker' 
              ? 'This broker may not be licensed to operate in your region due to regulatory restrictions, or they may have chosen not to offer services in your country.'
              : 'This prop firm may not accept traders from your region due to regulatory restrictions or business decisions.'
            }
          </p>
        </div>

        {/* Alternatives */}
        {alternatives.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4 justify-center">
              <Shield size={16} className="text-purple-400" />
              <span className="text-sm text-zinc-400 font-medium">Try these alternatives available in your region</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {alternatives.slice(0, 4).map((alt) => (
                <Link
                  key={alt.id}
                  href={`/${alt.type === 'broker' ? 'brokers' : 'prop-firms'}/${alt.slug}`}
                  className="group bg-zinc-800/30 hover:bg-zinc-800/50 rounded-xl p-4 border border-zinc-700 hover:border-purple-500/30 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                      {alt.logo ? (
                        <img src={alt.logo} alt={alt.name} className="w-full h-full object-cover" />
                      ) : (
                        alt.name?.charAt(0) || '?'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-medium text-sm truncate group-hover:text-purple-400 transition-colors">
                          {alt.name}
                        </h4>
                        <ArrowRight size={14} className="text-zinc-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-zinc-500 capitalize">{alt.type}</span>
                        {alt.rating > 0 && (
                          <span className="flex items-center gap-0.5 text-yellow-400">
                            <Star size={10} className="fill-yellow-400" />
                            {alt.rating.toFixed(1)}
                          </span>
                        )}
                        {alt.country && (
                          <span className="text-zinc-500">{alt.country}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {alternatives.length > 4 && onViewAlternatives && (
              <button
                onClick={onViewAlternatives}
                className="mt-3 text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                View all {alternatives.length} alternatives →
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center mt-6 pt-6 border-t border-zinc-800">
          <Link
            href={entityType === 'broker' ? '/brokers' : '/prop-firms'}
            className="px-5 py-2.5 bg-zinc-800/80 text-zinc-300 text-sm rounded-xl hover:bg-zinc-700 transition-colors flex items-center gap-2"
          >
            <Building2 size={16} />
            View all {entityType === 'broker' ? 'brokers' : 'prop firms'}
          </Link>
          
          <Link
            href="/reviews"
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all flex items-center gap-2"
          >
            <Users size={16} />
            Read reviews
          </Link>

          {entitySlug && (
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `${entityName} - Trading ${entityType === 'broker' ? 'Broker' : 'Prop Firm'}`,
                    text: `Check out ${entityName} on InsightPip`,
                    url: window.location.href,
                  });
                }
              }}
              className="px-5 py-2.5 bg-zinc-800/80 text-zinc-300 text-sm rounded-xl hover:bg-zinc-700 transition-colors flex items-center gap-2"
            >
              <ExternalLink size={16} />
              Share
            </button>
          )}
        </div>

        {/* Region Switcher Hint */}
        <p className="text-xs text-zinc-500 mt-4">
          💡 You can change your region using the region selector in the top navigation
        </p>
      </div>
    </motion.div>
  );
}