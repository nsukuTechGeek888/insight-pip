// src/components/mobile/MobileHeader.tsx
'use client';

import { useState } from "react";
import { Search, Menu, X, Home, Gift, Trophy, TrendingUp, ArrowLeftRight, Star, BookOpen, Calculator, CircleUserRound, User, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

interface MobileHeaderProps {
  title: string;
  showSearch?: boolean;
}

export default function MobileHeader({ title, showSearch = false }: MobileHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useUser();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Gift, label: "Offers", path: "/offers" },
    { icon: Trophy, label: "Prop Firms", path: "/prop-firms" },
    { icon: TrendingUp, label: "Brokers", path: "/brokers" },
    { icon: ArrowLeftRight, label: "Compare", path: "/compare" },
    { icon: Star, label: "Reviews", path: "/reviews" },
    { icon: BookOpen, label: "Blog", path: "/blog" },
    { icon: Calculator, label: "Tools", path: "/tools" },
  ];

  return (
    <>
      <header
        className="sticky top-0 z-50 bg-ip-header border-b border-ip-header-border"
        style={{ paddingTop: 'var(--ip-safe-top)' }}
      >
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-ip-blue flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-[13px]">IP</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-ip-header-text font-semibold text-[17px]">
                Insight<span className="text-ip-blue">Pip</span>
              </span>
              <span className="text-ip-header-text-2 text-[9px] tracking-[0.08em] uppercase mt-0.5">
                Research before you trust
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setMenuOpen(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-ip-header-text-2 active:scale-95"
              aria-label="Open menu"
            >
              <Menu size={19} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-[60] flex flex-col"
          style={{ backgroundColor: '#FFFFFF', paddingTop: 'var(--ip-safe-top)' }}
        >
          <div className="flex items-center justify-between px-4 h-14 border-b border-ip-border">
            <span className="text-ip-text font-semibold text-[17px]">Menu</span>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-ip-text-2"
              aria-label="Close"
            >
              <X size={20} strokeWidth={1.75} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="px-4 py-4 space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                      active ? "bg-ip-blue-soft text-ip-blue" : "text-ip-text"
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.75} />
                    <span className="font-medium text-[15px] flex-1">{item.label}</span>
                    <ChevronRight size={16} />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}