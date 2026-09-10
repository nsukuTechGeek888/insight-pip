// src/components/mobile/MobileHeader.tsx
// PHASE 1 REDESIGN — Dark navy branded header, refined lockup, token-based colors

'use client';

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Menu, X, Home, Trophy, TrendingUp, Scale, BookOpen,
  User, Star, Gift, ArrowRight, Calculator, LogOut, CircleUserRound,
  Settings, HelpCircle, Crown, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { brokersData } from "@/Data/brokersData";
import { challengesData } from "@/Data/challengesData";
import { useNavigation } from "@/contexts/NavigationContext";
import { useUser } from "@/contexts/UserContext";

interface MobileHeaderProps {
  title: string;
  showSearch?: boolean;
}

export default function MobileHeader({ title, showSearch = false }: MobileHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { dynamicItem, updateDynamicItem } = useNavigation();
  const { user, isLoading, logout } = useUser();

  // Lock body scroll while overlay is open
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (searchOpen || menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [searchOpen, menuOpen]);

  // ===================== NAVIGATION ITEMS =====================
  const mainNavItems = [
    { icon: Home,       label: "Home",       path: "/" },
    { icon: Gift,       label: "Offers",     path: "/offers" },
    { icon: Trophy,     label: "Prop Firms", path: "/prop-firms" },
    { icon: TrendingUp, label: "Brokers",    path: "/brokers" },
    { icon: Scale,      label: "Compare",    path: "/compare" },
    { icon: Star,       label: "Reviews",    path: "/reviews", key: "reviews" },
    { icon: BookOpen,   label: "Blog",       path: "/blog",    key: "blog" },
    { icon: Calculator, label: "Tools",      path: "/tools",   key: "tools" },
  ];

  const accountNavItems = [
    { icon: CircleUserRound, label: "Dashboard",        path: "/dashboard" },
    { icon: User,            label: "Profile Settings", path: "/dashboard/profile" },
    { icon: HelpCircle,      label: "Help & Support",   path: "/help" },
  ];

  // ===================== SEARCH DATA =====================
  const allData = useMemo(() => {
    const brokers = brokersData.map((broker: any) => ({
      ...broker,
      type: "broker" as const,
      searchableText: `${broker.name} ${broker.country} ${broker.description || ""} ${broker.regulation || ""}`.toLowerCase(),
    }));

    const propFirms = challengesData.map((firm: any) => ({
      ...firm,
      type: "prop-firm" as const,
      searchableText: `${firm.name} ${firm.country} ${firm.description || ""} ${(firm.programs?.map((p: any) => p.type).join(" ") || "")}`.toLowerCase(),
    }));

    return [...brokers, ...propFirms];
  }, []);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const searchTerm = search.toLowerCase();
    return allData
      .filter((item: any) =>
        item.searchableText.includes(searchTerm) ||
        item.name.toLowerCase().includes(searchTerm)
      )
      .slice(0, 8);
  }, [search, allData]);

  // ===================== HANDLERS =====================
  const handleNavigate = (item: any) => {
    const slug = item.name.toLowerCase().replace(/\s+/g, "-");
    if (item.type === "broker") {
      router.push(`/brokers/${slug}`);
    } else {
      router.push(`/prop-firms/${slug}`);
    }
    setSearchOpen(false);
    setSearch("");
  };

  const handleNavClick = (item: any) => {
    if (item.key) updateDynamicItem(item.key);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    router.push("/");
  };

  const getUserInitials = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  const isActive = (path: string) => pathname === path;

  // ===================== RENDER =====================
  return (
    <>
      {/* ============================================================
          HEADER — Dark navy, safe-area aware, sticky
          ============================================================ */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 bg-ip-header border-b border-ip-header-border"
        style={{ paddingTop: 'var(--ip-safe-top)' }}
      >
        <div className="flex items-center justify-between px-4 h-14">
          {/* ---------- Logo lockup ---------- */}
          <Link href="/" className="flex items-center gap-2.5 min-w-0 group">
            {/* Logo mark */}
            <div className="w-8 h-8 rounded-lg bg-ip-blue flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-[13px] tracking-tight">IP</span>
            </div>

            {/* Wordmark + tagline */}
            <div className="flex flex-col leading-none min-w-0">
              <span className="text-ip-header-text font-semibold text-[17px] tracking-[-0.01em]">
                Insight<span className="text-ip-blue">Pip</span>
              </span>
              <span className="text-ip-header-text-2 text-[9px] font-medium tracking-[0.08em] uppercase mt-0.5">
                Research before you trust
              </span>
            </div>
          </Link>

          {/* ---------- Actions ---------- */}
          <div className="flex items-center gap-0.5">
            {/* User avatar (if logged in) */}
            {!isLoading && user && (
              <button
                onClick={() => setMenuOpen(true)}
                className="w-9 h-9 rounded-full bg-ip-header-2 border border-ip-header-border flex items-center justify-center text-ip-header-text font-semibold text-[13px] active:scale-95 transition-transform duration-150"
                aria-label="Open account menu"
                title={user.name || user.email}
              >
                {getUserInitials()}
              </button>
            )}

            {/* Search */}
            {showSearch && (
              <button
                onClick={() => setSearchOpen(true)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-ip-header-text-2 hover:text-ip-header-text hover:bg-ip-header-2 active:scale-95 transition-all duration-150"
                aria-label="Search"
              >
                <Search size={19} strokeWidth={1.75} />
              </button>
            )}

            {/* Menu */}
            <button
              onClick={() => setMenuOpen(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-ip-header-text-2 hover:text-ip-header-text hover:bg-ip-header-2 active:scale-95 transition-all duration-150"
              aria-label="Open menu"
            >
              <Menu size={19} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* ============================================================
          SEARCH OVERLAY — Solid white, token-driven
          ============================================================ */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[60] flex flex-col"
            style={{
              backgroundColor: '#FFFFFF',
              paddingTop: 'var(--ip-safe-top)',
            }}
          >
            {/* Search bar */}
            <div className="flex items-center gap-2 px-4 h-14 border-b border-ip-border flex-shrink-0" style={{ backgroundColor: '#FFFFFF' }}>
              <button
                onClick={() => { setSearchOpen(false); setSearch(""); }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-ip-text-2 hover:text-ip-text hover:bg-ip-surface-2 active:scale-95 transition-all duration-150"
                aria-label="Close search"
              >
                <X size={20} strokeWidth={1.75} />
              </button>

              <div className="flex-1 relative">
                <Search
                  size={16}
                  strokeWidth={1.75}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ip-text-3 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search brokers, prop firms..."
                  className="w-full bg-ip-surface-2 border border-ip-border rounded-xl pl-9 pr-3 py-2.5 text-[15px] text-ip-text placeholder:text-ip-text-3 focus:outline-none focus:border-ip-blue transition-colors"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto ip-light-scroll" style={{ backgroundColor: '#FFFFFF' }}>
              {/* Results */}
              {search.trim() && (
                <div className="px-4 pt-4 pb-8">
                  <p className="text-[11px] font-medium tracking-wider uppercase text-ip-text-3 mb-3">
                    {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
                  </p>

                  {searchResults.length > 0 ? (
                    <div className="space-y-1">
                      {searchResults.map((item: any) => (
                        <button
                          key={`${item.type}-${item.id}`}
                          onClick={() => handleNavigate(item)}
                          className="w-full text-left p-3 rounded-xl hover:bg-ip-surface-2 transition-colors flex items-center gap-3 active:scale-[0.99]"
                        >
                          <div className="w-10 h-10 rounded-lg bg-ip-surface-3 border border-ip-border flex items-center justify-center text-ip-text font-semibold text-sm flex-shrink-0 overflow-hidden">
                            {item.name.charAt(0)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-ip-text font-semibold text-[15px] truncate">
                                {item.name}
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                                  item.type === "prop-firm"
                                    ? "bg-purple-500/10 text-purple-600"
                                    : "bg-ip-blue-soft text-ip-blue"
                                }`}
                              >
                                {item.type === "prop-firm" ? "Prop" : "Broker"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[12px] text-ip-text-3">
                              <span>{item.rating ? `★ ${item.rating}` : '—'}</span>
                              <span>·</span>
                              <span className="truncate">{item.country || 'International'}</span>
                            </div>
                          </div>

                          <ArrowRight size={16} strokeWidth={1.75} className="text-ip-text-3 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Search size={32} strokeWidth={1.5} className="text-ip-text-3 mx-auto mb-3" />
                      <p className="text-ip-text font-medium text-[15px]">No results found</p>
                      <p className="text-ip-text-3 text-[13px] mt-1">Try a different search term</p>
                    </div>
                  )}
                </div>
              )}

              {/* Suggestions */}
              {!search.trim() && (
                <div className="px-4 pt-4 pb-8">
                  <p className="text-[11px] font-medium tracking-wider uppercase text-ip-text-3 mb-3">
                    Popular searches
                  </p>
                  <div className="space-y-1">
                    {["FTMO", "IC Markets", "The 5%ers", "Instant funding", "High leverage brokers", "Best prop firms"].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setSearch(suggestion)}
                        className="w-full text-left px-3 py-3 rounded-xl hover:bg-ip-surface-2 transition-colors text-ip-text text-[15px] active:scale-[0.99]"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================
          MENU OVERLAY — Solid white, sectioned, token-driven
          ============================================================ */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[60] flex flex-col"
            style={{
              backgroundColor: '#FFFFFF',
              paddingTop: 'var(--ip-safe-top)',
            }}
          >
            {/* Header bar */}
            <div
              className="flex items-center justify-between px-4 h-14 border-b border-ip-border flex-shrink-0"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <Link href="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
                <div className="w-8 h-8 rounded-lg bg-ip-blue flex items-center justify-center">
                  <span className="text-white font-bold text-[13px] tracking-tight">IP</span>
                </div>
                <span className="text-ip-text font-semibold text-[17px] tracking-[-0.01em]">
                  Insight<span className="text-ip-blue">Pip</span>
                </span>
              </Link>

              <button
                onClick={() => setMenuOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-ip-text-2 hover:text-ip-text hover:bg-ip-surface-2 active:scale-95 transition-all duration-150"
                aria-label="Close menu"
              >
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>

            {/* Scrollable content */}
            <div
              className="flex-1 overflow-y-auto ip-light-scroll"
              style={{
                backgroundColor: '#FFFFFF',
                paddingBottom: 'var(--ip-safe-bottom)'
              }}
            >

              {/* ---------- User section ---------- */}
              <div className="px-4 py-4 border-b border-ip-border">
                {!isLoading && user ? (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-ip-blue flex items-center justify-center text-white font-semibold text-[17px] flex-shrink-0">
                        {getUserInitials()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-ip-text font-semibold text-[15px] truncate">
                          {user.name || 'User'}
                        </div>
                        <div className="text-ip-text-3 text-[13px] truncate">{user.email}</div>
                      </div>
                      <Crown size={16} className="text-ip-gold flex-shrink-0" />
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex-1 px-4 py-2.5 bg-ip-blue text-white rounded-xl text-[14px] font-medium text-center active:scale-[0.98] transition-transform"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex-1 px-4 py-2.5 bg-ip-red-soft text-ip-red rounded-xl text-[14px] font-medium active:scale-[0.98] transition-transform"
                      >
                        Log Out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-3">
                      <div className="text-ip-text font-semibold text-[15px]">
                        Welcome to InsightPip
                      </div>
                      <div className="text-ip-text-3 text-[13px] mt-0.5">
                        Sign in to access your account
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/login"
                        onClick={() => setMenuOpen(false)}
                        className="px-4 py-2.5 bg-ip-surface-2 border border-ip-border rounded-xl text-ip-text text-center font-medium text-[14px] active:scale-[0.98] transition-transform"
                      >
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setMenuOpen(false)}
                        className="px-4 py-2.5 bg-ip-blue rounded-xl text-white text-center font-medium text-[14px] active:scale-[0.98] transition-transform"
                      >
                        Sign Up Free
                      </Link>
                    </div>
                  </>
                )}
              </div>

              {/* ---------- Main navigation ---------- */}
              <div className="px-4 py-4">
                <p className="text-[11px] font-medium tracking-wider uppercase text-ip-text-3 mb-2 px-1">
                  Navigation
                </p>
                <div className="space-y-0.5">
                  {mainNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    const isDynamic = !!item.key;

                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => handleNavClick(item)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                          active
                            ? "bg-ip-blue-soft text-ip-blue"
                            : "text-ip-text hover:bg-ip-surface-2"
                        }`}
                      >
                        <Icon
                          size={18}
                          strokeWidth={1.75}
                          className={active ? "text-ip-blue" : "text-ip-text-3"}
                        />
                        <span className="font-medium text-[15px] flex-1">
                          {item.label}
                        </span>
                        {isDynamic && item.key === dynamicItem && (
                          <span className="w-1.5 h-1.5 rounded-full bg-ip-blue flex-shrink-0" />
                        )}
                        <ChevronRight
                          size={16}
                          strokeWidth={1.75}
                          className={active ? "text-ip-blue" : "text-ip-text-3"}
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* ---------- Account section ---------- */}
              {!isLoading && user && (
                <div className="px-4 py-4 border-t border-ip-border">
                  <p className="text-[11px] font-medium tracking-wider uppercase text-ip-text-3 mb-2 px-1">
                    Account
                  </p>
                  <div className="space-y-0.5">
                    {accountNavItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);

                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          onClick={() => setMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                            active
                              ? "bg-ip-blue-soft text-ip-blue"
                              : "text-ip-text hover:bg-ip-surface-2"
                          }`}
                        >
                          <Icon
                            size={18}
                            strokeWidth={1.75}
                            className={active ? "text-ip-blue" : "text-ip-text-3"}
                          />
                          <span className="font-medium text-[15px] flex-1">
                            {item.label}
                          </span>
                          <ChevronRight
                            size={16}
                            strokeWidth={1.75}
                            className={active ? "text-ip-blue" : "text-ip-text-3"}
                          />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ---------- Footer tagline ---------- */}
              <div className="px-4 py-6 text-center">
                <p className="text-[11px] tracking-[0.08em] uppercase text-ip-text-3">
                  Research before you trust
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}