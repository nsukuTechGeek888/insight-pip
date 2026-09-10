// src/components/mobile/MobileHeader.tsx
// PHASE 1 REDESIGN — Dark navy branded header with hardcoded colors
// (bypasses CSS-variable issues in Tailwind v4)

'use client';

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Menu, X, Home, Trophy, TrendingUp, ArrowLeftRight, BookOpen,
  User, Star, Gift, ArrowRight, Calculator, LogOut, CircleUserRound,
  HelpCircle, Crown, ChevronRight
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

// ===================== HARDCODED TOKENS =====================
const T = {
  headerBg: '#0A0E1A',
  headerBg2: '#111827',
  headerBorder: '#1F2937',
  headerText: '#FFFFFF',
  headerText2: '#9CA3AF',
  blue: '#2563EB',
  blueHover: '#1D4ED8',
  blueSoft: '#EFF6FF',
  surface: '#FFFFFF',
  surface2: '#F7F8FA',
  surface3: '#EEF0F4',
  text: '#0A0E1A',
  text2: '#6B7280',
  text3: '#9CA3AF',
  border: '#E5E7EB',
  red: '#DC2626',
  redSoft: '#FEE2E2',
  gold: '#D97706',
};

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
    { icon: Home,           label: "Home",       path: "/" },
    { icon: Gift,           label: "Offers",     path: "/offers" },
    { icon: Trophy,         label: "Prop Firms", path: "/prop-firms" },
    { icon: TrendingUp,     label: "Brokers",    path: "/brokers" },
    { icon: ArrowLeftRight, label: "Compare",    path: "/compare" },
    { icon: Star,           label: "Reviews",    path: "/reviews", key: "reviews" },
    { icon: BookOpen,       label: "Blog",       path: "/blog",    key: "blog" },
    { icon: Calculator,     label: "Tools",      path: "/tools",   key: "tools" },
  ];

  const accountNavItems = [
    { icon: CircleUserRound, label: "Dashboard",        path: "/dashboard" },
    { icon: User,            label: "Profile Settings", path: "/dashboard/profile" },
    { icon: HelpCircle,      label: "Help & Support",   path: "/help" },
  ];

  // ===================== SEARCH DATA =====================
  const allData = useMemo(() => {
    const brokers = (brokersData || []).map((broker: any) => ({
      ...broker,
      type: "broker" as const,
      searchableText: `${broker.name} ${broker.country} ${broker.description || ""} ${broker.regulation || ""}`.toLowerCase(),
    }));

    const propFirms = (challengesData || []).map((firm: any) => ({
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
        className="sticky top-0 z-50"
        style={{
          backgroundColor: T.headerBg,
          borderBottom: `1px solid ${T.headerBorder}`,
          paddingTop: 'var(--ip-safe-top)',
        }}
      >
        <div className="flex items-center justify-between px-4 h-14">
          {/* Logo lockup */}
          <Link href="/" className="flex items-center gap-2.5 min-w-0 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: T.blue }}
            >
              <span className="text-white font-bold text-[13px] tracking-tight">IP</span>
            </div>

            <div className="flex flex-col leading-none min-w-0">
              <span
                className="font-semibold text-[17px] tracking-[-0.01em]"
                style={{ color: T.headerText }}
              >
                Insight<span style={{ color: T.blue }}>Pip</span>
              </span>
              <span
                className="text-[9px] font-medium tracking-[0.08em] uppercase mt-0.5"
                style={{ color: T.headerText2 }}
              >
                Research before you trust
              </span>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            {!isLoading && user && (
              <button
                onClick={() => setMenuOpen(true)}
                className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-[13px] active:scale-95 transition-transform duration-150"
                style={{
                  backgroundColor: T.headerBg2,
                  border: `1px solid ${T.headerBorder}`,
                  color: T.headerText,
                }}
                aria-label="Open account menu"
                title={user.name || user.email}
              >
                {getUserInitials()}
              </button>
            )}

            {showSearch && (
              <button
                onClick={() => setSearchOpen(true)}
                className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all duration-150"
                style={{ color: T.headerText2 }}
                aria-label="Search"
              >
                <Search size={19} strokeWidth={1.75} />
              </button>
            )}

            <button
              onClick={() => setMenuOpen(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all duration-150"
              style={{ color: T.headerText2 }}
              aria-label="Open menu"
            >
              <Menu size={19} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* ============================================================
          SEARCH OVERLAY
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
              backgroundColor: T.surface,
              paddingTop: 'var(--ip-safe-top)',
            }}
          >
            <div
              className="flex items-center gap-2 px-4 h-14 flex-shrink-0"
              style={{
                backgroundColor: T.surface,
                borderBottom: `1px solid ${T.border}`,
              }}
            >
              <button
                onClick={() => { setSearchOpen(false); setSearch(""); }}
                className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all duration-150"
                style={{ color: T.text2 }}
                aria-label="Close search"
              >
                <X size={20} strokeWidth={1.75} />
              </button>

              <div className="flex-1 relative">
                <Search
                  size={16}
                  strokeWidth={1.75}
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: T.text3 }}
                />
                <input
                  type="text"
                  placeholder="Search brokers, prop firms..."
                  className="w-full rounded-xl pl-9 pr-3 py-2.5 text-[15px] focus:outline-none transition-colors"
                  style={{
                    backgroundColor: T.surface2,
                    border: `1px solid ${T.border}`,
                    color: T.text,
                  }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto ip-light-scroll" style={{ backgroundColor: T.surface }}>
              {search.trim() && (
                <div className="px-4 pt-4 pb-8">
                  <p className="text-[11px] font-medium tracking-wider uppercase mb-3" style={{ color: T.text3 }}>
                    {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
                  </p>

                  {searchResults.length > 0 ? (
                    <div className="space-y-1">
                      {searchResults.map((item: any) => (
                        <button
                          key={`${item.type}-${item.id}`}
                          onClick={() => handleNavigate(item)}
                          className="w-full text-left p-3 rounded-xl transition-colors flex items-center gap-3 active:scale-[0.99]"
                          style={{ backgroundColor: 'transparent' }}
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm flex-shrink-0 overflow-hidden"
                            style={{
                              backgroundColor: T.surface3,
                              border: `1px solid ${T.border}`,
                              color: T.text,
                            }}
                          >
                            {item.name.charAt(0)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-semibold text-[15px] truncate" style={{ color: T.text }}>
                                {item.name}
                              </span>
                              <span
                                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                                style={
                                  item.type === "prop-firm"
                                    ? { backgroundColor: 'rgba(147,51,234,0.1)', color: '#9333EA' }
                                    : { backgroundColor: T.blueSoft, color: T.blue }
                                }
                              >
                                {item.type === "prop-firm" ? "Prop" : "Broker"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[12px]" style={{ color: T.text3 }}>
                              <span>{item.rating ? `★ ${item.rating}` : '—'}</span>
                              <span>·</span>
                              <span className="truncate">{item.country || 'International'}</span>
                            </div>
                          </div>

                          <ArrowRight size={16} strokeWidth={1.75} className="flex-shrink-0" style={{ color: T.text3 }} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Search size={32} strokeWidth={1.5} className="mx-auto mb-3" style={{ color: T.text3 }} />
                      <p className="font-medium text-[15px]" style={{ color: T.text }}>No results found</p>
                      <p className="text-[13px] mt-1" style={{ color: T.text3 }}>Try a different search term</p>
                    </div>
                  )}
                </div>
              )}

              {!search.trim() && (
                <div className="px-4 pt-4 pb-8">
                  <p className="text-[11px] font-medium tracking-wider uppercase mb-3" style={{ color: T.text3 }}>
                    Popular searches
                  </p>
                  <div className="space-y-1">
                    {["FTMO", "IC Markets", "The 5%ers", "Instant funding", "High leverage brokers", "Best prop firms"].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setSearch(suggestion)}
                        className="w-full text-left px-3 py-3 rounded-xl transition-colors text-[15px] active:scale-[0.99]"
                        style={{ color: T.text }}
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
          MENU OVERLAY
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
              backgroundColor: T.surface,
              paddingTop: 'var(--ip-safe-top)',
            }}
          >
            <div
              className="flex items-center justify-between px-4 h-14 flex-shrink-0"
              style={{
                backgroundColor: T.surface,
                borderBottom: `1px solid ${T.border}`,
              }}
            >
              <Link href="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: T.blue }}
                >
                  <span className="text-white font-bold text-[13px] tracking-tight">IP</span>
                </div>
                <span className="font-semibold text-[17px] tracking-[-0.01em]" style={{ color: T.text }}>
                  Insight<span style={{ color: T.blue }}>Pip</span>
                </span>
              </Link>

              <button
                onClick={() => setMenuOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all duration-150"
                style={{ color: T.text2 }}
                aria-label="Close menu"
              >
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>

            <div
              className="flex-1 overflow-y-auto ip-light-scroll"
              style={{
                backgroundColor: T.surface,
                paddingBottom: 'var(--ip-safe-bottom)',
              }}
            >
              {/* User section */}
              <div className="px-4 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
                {!isLoading && user ? (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-[17px] flex-shrink-0"
                        style={{ backgroundColor: T.blue }}
                      >
                        {getUserInitials()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[15px] truncate" style={{ color: T.text }}>
                          {user.name || 'User'}
                        </div>
                        <div className="text-[13px] truncate" style={{ color: T.text3 }}>{user.email}</div>
                      </div>
                      <Crown size={16} className="flex-shrink-0" style={{ color: T.gold }} />
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex-1 px-4 py-2.5 rounded-xl text-[14px] font-medium text-center text-white active:scale-[0.98] transition-transform"
                        style={{ backgroundColor: T.blue }}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex-1 px-4 py-2.5 rounded-xl text-[14px] font-medium active:scale-[0.98] transition-transform"
                        style={{ backgroundColor: T.redSoft, color: T.red }}
                      >
                        Log Out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-3">
                      <div className="font-semibold text-[15px]" style={{ color: T.text }}>
                        Welcome to InsightPip
                      </div>
                      <div className="text-[13px] mt-0.5" style={{ color: T.text3 }}>
                        Sign in to access your account
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/login"
                        onClick={() => setMenuOpen(false)}
                        className="px-4 py-2.5 rounded-xl text-center font-medium text-[14px] active:scale-[0.98] transition-transform"
                        style={{
                          backgroundColor: T.surface2,
                          border: `1px solid ${T.border}`,
                          color: T.text,
                        }}
                      >
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setMenuOpen(false)}
                        className="px-4 py-2.5 rounded-xl text-center font-medium text-[14px] text-white active:scale-[0.98] transition-transform"
                        style={{ backgroundColor: T.blue }}
                      >
                        Sign Up Free
                      </Link>
                    </div>
                  </>
                )}
              </div>

              {/* Main navigation */}
              <div className="px-4 py-4">
                <p className="text-[11px] font-medium tracking-wider uppercase mb-2 px-1" style={{ color: T.text3 }}>
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
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
                        style={
                          active
                            ? { backgroundColor: T.blueSoft, color: T.blue }
                            : { color: T.text, backgroundColor: 'transparent' }
                        }
                      >
                        <Icon
                          size={18}
                          strokeWidth={1.75}
                          style={{ color: active ? T.blue : T.text3 }}
                        />
                        <span className="font-medium text-[15px] flex-1">
                          {item.label}
                        </span>
                        {isDynamic && item.key === dynamicItem && (
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: T.blue }} />
                        )}
                        <ChevronRight
                          size={16}
                          strokeWidth={1.75}
                          style={{ color: active ? T.blue : T.text3 }}
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Account section */}
              {!isLoading && user && (
                <div className="px-4 py-4" style={{ borderTop: `1px solid ${T.border}` }}>
                  <p className="text-[11px] font-medium tracking-wider uppercase mb-2 px-1" style={{ color: T.text3 }}>
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
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
                          style={
                            active
                              ? { backgroundColor: T.blueSoft, color: T.blue }
                              : { color: T.text, backgroundColor: 'transparent' }
                          }
                        >
                          <Icon
                            size={18}
                            strokeWidth={1.75}
                            style={{ color: active ? T.blue : T.text3 }}
                          />
                          <span className="font-medium text-[15px] flex-1">
                            {item.label}
                          </span>
                          <ChevronRight
                            size={16}
                            strokeWidth={1.75}
                            style={{ color: active ? T.blue : T.text3 }}
                          />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="px-4 py-6 text-center">
                <p className="text-[11px] tracking-[0.08em] uppercase" style={{ color: T.text3 }}>
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