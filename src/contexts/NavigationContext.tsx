// src/contexts/NavigationContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface NavigationContextType {
  dynamicItem: string; // 'blog' | 'account' | 'reviews' | 'tools'
  updateDynamicItem: (item: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [dynamicItem, setDynamicItem] = useState<string>('reviews'); // Default is reviews

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dynamic-navigation');
    if (saved) {
      setDynamicItem(saved);
    }
  }, []);

  // Save to localStorage whenever dynamicItem changes
  useEffect(() => {
    localStorage.setItem('dynamic-navigation', dynamicItem);
  }, [dynamicItem]);

  const updateDynamicItem = (item: string) => {
    if (['blog', 'account', 'reviews', 'tools'].includes(item)) {
      setDynamicItem(item);
    }
  };

  return (
    <NavigationContext.Provider value={{ dynamicItem, updateDynamicItem }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}