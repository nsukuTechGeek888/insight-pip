// src/components/mobile/BottomNavigation.tsx
// PHASE 1 REDESIGN — Clean white bottom nav with hardcoded colors
// (keeps 5 fixed tabs + 1 dynamic — matches original behavior)

'use client';

import { 
  Home, 
  Gift, 
  TrendingUp, 
  Building2, 
  GitCompare,
  Star, 
  BookOpen, 
  User,
  Calculator
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useNavigation } from '@/contexts/NavigationContext';

// ===================== HARDCODED TOKENS =====================
const T = {
  surface: '#FFFFFF',
  border: '#E5E7EB',
  blue: '#2563EB',
  textInactive: '#6B7280',
  textActive: '#2563EB',
};

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { dynamicItem, updateDynamicItem } = useNavigation();

  // Fixed items (5) — same as original
  const fixedItems = [
    { icon: Home,       label: 'Home',       path: '/' },
    { icon: Gift,       label: 'Offers',     path: '/offers' },
    { icon: TrendingUp, label: 'Prop Firms', path: '/prop-firms' },
    { icon: Building2,  label: 'Brokers',    path: '/brokers' },
    { icon: GitCompare, label: 'Compare',    path: '/compare' },
  ];

  // Dynamic item (6th position) — user-switchable
  const dynamicItemsMap: Record<
    string,
    { icon: any; label: string; path: string; key: string }
  > = {
    reviews: { icon: Star,       label: 'Reviews', path: '/reviews', key: 'reviews' },
    blog:    { icon: BookOpen,   label: 'Blog',    path: '/blog',    key: 'blog' },
    tools:   { icon: Calculator, label: 'Tools',   path: '/tools',   key: 'tools' },
    account: { icon: User,       label: 'Account', path: '/account', key: 'account' },
  };

  const defaultItem = dynamicItemsMap['reviews'];
  const dynamicItemConfig = dynamicItemsMap[dynamicItem] || defaultItem;
  const navItems = [...fixedItems, dynamicItemConfig];

  const handleNavigation = (item: any) => {
    if (item.key) updateDynamicItem(item.key);
    router.push(item.path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        backgroundColor: T.surface,
        borderTop: `1px solid ${T.border}`,
        paddingBottom: 'var(--ip-safe-bottom)',
      }}
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item)}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full active:scale-[0.94] transition-transform duration-150"
              aria-label={item.label}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.2 : 1.75}
                style={{ color: isActive ? T.textActive : T.textInactive }}
              />
              <span
                className="text-[9px] leading-none font-medium tracking-tight"
                style={{ color: isActive ? T.textActive : T.textInactive }}
              >
                {item.label}
              </span>
              <span
                className="block w-1 h-1 rounded-full transition-opacity duration-150"
                style={{
                  backgroundColor: T.blue,
                  opacity: isActive ? 1 : 0,
                }}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}