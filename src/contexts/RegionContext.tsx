// src/contexts/RegionContext.tsx
// Region context for managing region state across the app

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DEFAULT_REGION = 'GLOBAL';

interface RegionContextType {
  region: string;
  setRegion: (region: string) => Promise<void>;
  isLoading: boolean;
  detectedRegion: string | null;
  refreshRegion: () => Promise<void>;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [region, setRegionState] = useState<string>(DEFAULT_REGION);
  const [detectedRegion, setDetectedRegion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load region from localStorage and cookie
  const loadRegion = useCallback(async () => {
    try {
      setIsLoading(true);

      // 1. Check localStorage
      const storedRegion = localStorage.getItem('user_region');
      if (storedRegion) {
        setRegionState(storedRegion);
        setDetectedRegion(storedRegion);
        setIsLoading(false);
        return storedRegion;
      }

      // 2. Check cookie (via API)
      try {
        const response = await fetch('/api/region/current');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.region) {
            localStorage.setItem('user_region', data.region);
            setRegionState(data.region);
            setDetectedRegion(data.region);
            setIsLoading(false);
            return data.region;
          }
        }
      } catch (err) {
        console.log('Cookie region check failed, continuing to detect...');
      }

      // 3. Auto-detect via IP
      try {
        const detectResponse = await fetch('/api/region/detect');
        if (detectResponse.ok) {
          const data = await detectResponse.json();
          if (data.success && data.region) {
            localStorage.setItem('user_region', data.region);
            setRegionState(data.region);
            setDetectedRegion(data.region);
            setIsLoading(false);
            return data.region;
          }
        }
      } catch (err) {
        console.log('Region detection failed, using default...');
      }

      // 4. Default
      localStorage.setItem('user_region', DEFAULT_REGION);
      setRegionState(DEFAULT_REGION);
      setDetectedRegion(DEFAULT_REGION);
      setIsLoading(false);
      return DEFAULT_REGION;

    } catch (error) {
      console.error('Error loading region:', error);
      setRegionState(DEFAULT_REGION);
      setIsLoading(false);
      return DEFAULT_REGION;
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadRegion();
  }, [loadRegion]);

  // Set region and persist
  const setRegion = useCallback(async (newRegion: string) => {
    try {
      setIsLoading(true);
      
      // 1. Save to localStorage
      localStorage.setItem('user_region', newRegion);
      
      // 2. Save to cookie via API
      try {
        await fetch('/api/region/current', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ region: newRegion }),
        });
      } catch (err) {
        console.log('Failed to save region to cookie:', err);
      }
      
      // 3. Update state
      setRegionState(newRegion);
      setDetectedRegion(newRegion);
      
      // 4. Reload the page to refresh all content
      window.location.reload();
      
    } catch (error) {
      console.error('Error setting region:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshRegion = useCallback(async () => {
    await loadRegion();
  }, [loadRegion]);

  return (
    <RegionContext.Provider value={{
      region,
      setRegion,
      isLoading,
      detectedRegion,
      refreshRegion,
    }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}