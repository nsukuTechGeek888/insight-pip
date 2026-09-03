// src/components/mobile/BottomNavigation.tsx
'use client';

import { 
  Home, 
  TrendingUp, 
  Building2, 
  GitCompare, 
  Star, 
  Gift, 
  BookOpen, 
  User,
  Calculator,
  Search
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useNavigation } from '@/contexts/NavigationContext';

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { dynamicItem, updateDynamicItem } = useNavigation();

  // Fixed items
  const fixedItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Gift, label: 'Offers', path: '/offers' },
    { icon: TrendingUp, label: 'Prop Firms', path: '/prop-firms' },
    { icon: Building2, label: 'Brokers', path: '/brokers' },
  ];

  // Dynamic item (5th position)
  const dynamicItemsMap = {
    'blog': { icon: BookOpen, label: 'Blog', path: '/blog', key: 'blog' },
    'account': { icon: User, label: 'Account', path: '/account', key: 'account' },
    'reviews': { icon: Star, label: 'Reviews', path: '/reviews', key: 'reviews' },
    'tools': { icon: Calculator, label: 'Tools', path: '/tools', key: 'tools' },
  };

  const dynamicItemConfig = dynamicItemsMap[dynamicItem as keyof typeof dynamicItemsMap] || dynamicItemsMap['reviews'];
  const navItems = [...fixedItems, dynamicItemConfig];

  const handleNavigation = (item: any) => {
    if (item.key) {
      updateDynamicItem(item.key);
    }
    router.push(item.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a12] border-t border-[#1e1e32] px-2 pb-2 pt-1">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item)}
              className={`flex flex-col items-center py-1.5 px-2 rounded-lg transition-all min-w-[44px] ${
                isActive 
                  ? 'text-blue-400' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className={`w-5 h-5 transition-all ${isActive ? 'scale-105' : ''}`} />
              <span className={`text-[9px] font-medium mt-0.5 transition-all ${isActive ? 'text-blue-400' : 'text-zinc-500'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-blue-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}