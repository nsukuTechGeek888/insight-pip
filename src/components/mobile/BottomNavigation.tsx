'use client';

import { Home, Trophy, Gift, Activity, MoreHorizontal } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

const items = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Trophy, label: 'Rankings', path: '/rankings' },
  { icon: Gift, label: 'Offers', path: '/offers' },
  { icon: Activity, label: 'Incidents', path: '/incidents' },
  { icon: MoreHorizontal, label: 'More', path: '/more' },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="ip-bottom-nav">
      <div className="ip-bottom-nav-inner">
        {items.map(({ icon: Icon, label, path }) => {
          const active = pathname === path || (path !== '/' && pathname.startsWith(path));

          return (
            <button
              key={path}
              className={`ip-bottom-item ${active ? 'active' : ''}`}
              onClick={() => router.push(path)}
              aria-label={label}
            >
              <Icon size={19} strokeWidth={active ? 2.25 : 1.7} />
              <span>{label}</span>
              <i />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
