// src/components/RegionSelector.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe, Check, RefreshCw } from 'lucide-react';

// Region data - keep it simple
const REGION_LIST = [
  { code: 'GLOBAL', label: 'Global', flag: '🌍' },
  { code: 'SA', label: 'South Africa', flag: '🇿🇦' },
  { code: 'EU', label: 'Europe', flag: '🇪🇺' },
  { code: 'UK', label: 'United Kingdom', flag: '🇬🇧' },
  { code: 'UAE', label: 'UAE', flag: '🇦🇪' },
  { code: 'KE', label: 'Kenya', flag: '🇰🇪' },
  { code: 'AU', label: 'Australia', flag: '🇦🇺' },
  { code: 'SG', label: 'Singapore', flag: '🇸🇬' },
  { code: 'US', label: 'United States', flag: '🇺🇸' },
  { code: 'CA', label: 'Canada', flag: '🇨🇦' },
];

const REGION_INFO: Record<string, { label: string; flag: string }> = {
  GLOBAL: { label: 'Global', flag: '🌍' },
  SA: { label: 'South Africa', flag: '🇿🇦' },
  EU: { label: 'Europe', flag: '🇪🇺' },
  UK: { label: 'United Kingdom', flag: '🇬🇧' },
  UAE: { label: 'UAE', flag: '🇦🇪' },
  KE: { label: 'Kenya', flag: '🇰🇪' },
  AU: { label: 'Australia', flag: '🇦🇺' },
  SG: { label: 'Singapore', flag: '🇸🇬' },
  US: { label: 'United States', flag: '🇺🇸' },
  CA: { label: 'Canada', flag: '🇨🇦' },
};

interface RegionSelectorProps {
  currentRegion: string;
  onRegionChange: (region: string) => void;
  className?: string;
}

export default function RegionSelector({ 
  currentRegion, 
  onRegionChange,
  className = ''
}: RegionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const regionInfo = REGION_INFO[currentRegion] || REGION_INFO['GLOBAL'];
  const currentLabel = regionInfo?.label || 'Global';
  const currentFlag = regionInfo?.flag || '🌍';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRegionSelect = async (regionCode: string) => {
    setIsLoading(true);
    setIsOpen(false);
    await onRegionChange(regionCode);
    setIsLoading(false);
  };

  const handleAutoDetect = async () => {
    setIsLoading(true);
    setIsOpen(false);
    
    try {
      const response = await fetch('/api/region/detect');
      const data = await response.json();
      if (data.success && data.region) {
        await onRegionChange(data.region);
      }
    } catch (error) {
      console.error('Error detecting region:', error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Region Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--ip-surface-2)] border border-[var(--ip-border)] hover:border-blue-500/50 transition-all text-[var(--ip-text)] text-sm font-medium"
      >
        {isLoading ? (
          <RefreshCw size={16} className="animate-spin text-blue-400" />
        ) : (
          <>
            <span className="text-base">{currentFlag}</span>
            <span className="hidden sm:inline">{currentLabel}</span>
            <span className="sm:hidden">{currentRegion}</span>
            <ChevronDown size={14} className={`text-[var(--ip-text-2)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-[var(--ip-surface)] border border-[var(--ip-border)] rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-2 border-b border-[var(--ip-border)]">
            <button
              onClick={handleAutoDetect}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--ip-surface-2)] transition-colors text-sm text-[var(--ip-text-2)]"
            >
              <Globe size={16} className="text-blue-400" />
              <span>Auto-detect my region</span>
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {REGION_LIST.map((region) => {
              const isActive = currentRegion === region.code;
              return (
                <button
                  key={region.code}
                  onClick={() => handleRegionSelect(region.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'hover:bg-[var(--ip-surface-2)] text-[var(--ip-text-2)] hover:text-[var(--ip-text)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{region.flag}</span>
                    <span>{region.label}</span>
                    <span className="text-xs text-[var(--ip-text-2)]">{region.code}</span>
                  </div>
                  {isActive && <Check size={16} className="text-blue-400" />}
                </button>
              );
            })}
          </div>

          <div className="p-2 border-t border-[var(--ip-border)] text-center">
            <span className="text-xs text-[var(--ip-text-2)]">All content is region-filtered</span>
          </div>
        </div>
      )}
    </div>
  );
}