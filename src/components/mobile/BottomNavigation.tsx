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
  Calculator 
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useNavigation } from '@/contexts/NavigationContext';

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { dynamicItem, updateDynamicItem } = useNavigation();

  // Fixed items (first 5)
  const fixedItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Gift, label: 'Offers', path: '/offers' },
    { icon: TrendingUp, label: 'Prop Firms', path: '/prop-firms' },
    { icon: Building2, label: 'Brokers', path: '/brokers' },
    { icon: GitCompare, label: 'Compare', path: '/compare' },
  ];

  // Dynamic item (6th position) - changes between Blog, Account, Reviews, Tools
  const dynamicItemsMap = {
    'blog': { icon: BookOpen, label: 'Blog', path: '/blog', key: 'blog' },
    'account': { icon: User, label: 'Account', path: '/account', key: 'account' },
    'reviews': { icon: Star, label: 'Reviews', path: '/reviews', key: 'reviews' },
    'tools': { icon: Calculator, label: 'Tools', path: '/tools', key: 'tools' },
  };

  const dynamicItemConfig = dynamicItemsMap[dynamicItem as keyof typeof dynamicItemsMap];

  // Combine fixed and dynamic items
  const navItems = [...fixedItems, dynamicItemConfig];

  const handleNavigation = (item: any) => {
    if (item.key) {
      updateDynamicItem(item.key);
    }
    router.push(item.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-lg border-t border-gray-800">
      <div className="flex justify-around items-center p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item)}
              className={`flex flex-col items-center space-y-1 p-1 rounded-lg transition-all min-w-[40px] ${
                isActive 
                  ? 'text-blue-400 bg-blue-400/10' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}