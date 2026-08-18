// src/components/Navbar.tsx - CLEAN VERSION WITH REAL FLAGS & CLEANER BUTTONS

'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Menu, X, User, LogOut, ChevronDown, CircleUserRound, Sparkles, Zap, Shield, Crown, Calculator } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useRegion } from "@/contexts/RegionContext";
import { motion, AnimatePresence } from "framer-motion";

// ===================== REAL FLAG MAP =====================
const REGION_DISPLAY: Record<string, { label: string; flag: string }> = {
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

// ===================== REGION SELECTOR =====================
function SimpleRegionSelector({ currentRegion, onRegionChange }: { currentRegion: string; onRegionChange: (region: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const regions = Object.entries(REGION_DISPLAY).map(([code, data]) => ({
    code,
    label: data.label,
    flag: data.flag,
  }));

  const currentRegionData = regions.find(r => r.code === currentRegion) || regions[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800/50 border border-zinc-700 hover:border-purple-500/50 transition-all text-white text-sm"
      >
        <span className="text-base">{currentRegionData.flag}</span>
        <span className="hidden lg:inline">{currentRegionData.label}</span>
        <ChevronDown size={14} className={`text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="max-h-72 overflow-y-auto p-1">
            {regions.map((region) => {
              const isActive = currentRegion === region.code;
              return (
                <button
                  key={region.code}
                  onClick={() => {
                    onRegionChange(region.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'hover:bg-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{region.flag}</span>
                    <span>{region.label}</span>
                  </div>
                  {isActive && <span className="text-purple-400">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ===================== MAIN LINKS =====================
const mainLinks = [
  { label: "Home", href: "/", icon: null },
  { label: "Offers", href: "/offers", icon: Sparkles, badge: "Hot" },
  { label: "Prop Firms", href: "/prop-firms", icon: Zap },
  { label: "Brokers", href: "/brokers", icon: Shield },
  { label: "Compare", href: "/compare", icon: null },
  { label: "Reviews", href: "/reviews", icon: null },
  { label: "Blog", href: "/blog", icon: null },
  { label: "Tools", href: "/tools", icon: Calculator },
];

// ===================== MAIN NAVBAR =====================
export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { user, isLoading, logout } = useUser();
  const { region, setRegion } = useRegion();

  useEffect(() => {
    setIsClient(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    setMenuOpen(false);
    window.location.href = "/";
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const regionInfo = REGION_DISPLAY[region] || REGION_DISPLAY['GLOBAL'];

  if (isLoading) {
    return (
      <header className="sticky top-0 z-50 bg-black/80 border-b border-zinc-800 px-6 py-3">
        <nav className="max-w-7xl mx-auto flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-zinc-800 animate-pulse"></div>
            <div className="w-24 h-6 bg-zinc-800 animate-pulse rounded"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-20 h-9 bg-zinc-800 animate-pulse rounded-lg"></div>
            <div className="w-24 h-9 bg-zinc-800 animate-pulse rounded-lg"></div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ease-in-out px-6 py-3 border-b backdrop-blur-xl ${
          scrolled 
            ? "shadow-lg bg-black/90 border-zinc-700/50" 
            : "bg-black/80 border-zinc-800"
        }`}
      >
        <nav className="max-w-7xl mx-auto flex items-center justify-between text-white">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
              <img 
                src="/images/insightpip-logo.png" 
                alt="Insight Pip" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const fallback = document.createElement('span');
                    fallback.className = 'text-white font-bold text-sm bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 w-8 h-8 rounded-md flex items-center justify-center';
                    fallback.textContent = 'IP';
                    parent.appendChild(fallback);
                  }
                }}
              />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Insight <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:from-purple-400 group-hover:via-pink-400 group-hover:to-orange-400 transition-all duration-300">Pip</span>
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex gap-1 items-center">
            {mainLinks.map((link) => {
              const isActive = isClient && pathname === link.href;
              const Icon = link.icon;
              const hasBadge = link.badge;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
                >
                  {Icon && <Icon size={16} className={isActive ? "text-purple-400" : ""} />}
                  <span>{link.label}</span>
                  {hasBadge && (
                    <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 py-0.5 rounded-full shadow-lg">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg -z-0"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}

            {/* Region Selector */}
            <div className="ml-2">
              <SimpleRegionSelector currentRegion={region} onRegionChange={setRegion} />
            </div>

            {/* User Account Section */}
            {user ? (
              <div className="relative user-menu-container ml-2">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-zinc-800/80 to-zinc-900/80 hover:from-zinc-800 hover:to-zinc-900 border border-zinc-700/50 transition-all group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {getUserInitials()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-sm font-medium text-white truncate max-w-[100px]">
                      {user.name ? user.name.split(" ")[0] : 'User'}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                      <span>{regionInfo.flag}</span>
                      <span>{regionInfo.label}</span>
                    </div>
                  </div>
                  <ChevronDown 
                    size={14} 
                    className={`text-zinc-400 transition-transform duration-300 ${showUserMenu ? "rotate-180" : ""}`} 
                  />
                </button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-xl shadow-2xl overflow-hidden"
                    >
                      <div className="p-4 border-b border-zinc-800 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                            {getUserInitials()}
                          </div>
                          <div>
                            <div className="font-medium text-white truncate">{user.name || 'User'}</div>
                            <div className="text-xs text-zinc-400 truncate">{user.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1 text-purple-400">
                            <Crown size={10} />
                            <span>Verified Member</span>
                          </div>
                          <div className="flex items-center gap-1 text-zinc-400">
                            <span>{regionInfo.flag}</span>
                            <span>{regionInfo.label}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Link
                        href="/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 text-white transition-colors"
                      >
                        <CircleUserRound size={16} className="text-purple-400" />
                        <span>Dashboard</span>
                      </Link>
                      
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 text-white transition-colors"
                      >
                        <User size={16} className="text-purple-400" />
                        <span>Profile Settings</span>
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors border-t border-zinc-800"
                      >
                        <LogOut size={16} />
                        <span>Log Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link
                  href="/login"
                  className="px-4 py-2 font-medium rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-all"
                >
                  Login
                </Link>
                {/* 👇 CLEANER, SLIMMER SIGN UP BUTTON 👇 */}
                <Link
                  href="/signup"
                  className="px-5 py-2 font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 hover:from-blue-500 hover:via-purple-500 hover:to-pink-400 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <div className="md:hidden flex items-center gap-3">
            <span className="text-base">{regionInfo.flag}</span>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-zinc-800 text-white transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-black/95 backdrop-blur-xl border-b border-zinc-800"
          >
            <div className="flex flex-col gap-2 px-6 py-4">
              {mainLinks.map((link) => {
                const isActive = isClient && pathname === link.href;
                const Icon = link.icon;
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 py-3 px-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                    }`}
                  >
                    {Icon && <Icon size={18} />}
                    <span className="font-medium">{link.label}</span>
                    {link.badge && (
                      <span className="text-[10px] font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full ml-auto">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Mobile Region Selector */}
              <div className="mt-2 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm text-zinc-400">Your Region</span>
                  <SimpleRegionSelector currentRegion={region} onRegionChange={(newRegion) => {
                    setRegion(newRegion);
                    setMenuOpen(false);
                  }} />
                </div>
              </div>

              {/* Mobile User Section */}
              {user ? (
                <div className="mt-2 pt-2 border-t border-zinc-800">
                  <div className="flex items-center gap-3 mb-4 px-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {getUserInitials()}
                    </div>
                    <div>
                      <div className="font-medium text-white">{user.name ? user.name.split(" ")[0] : 'User'}</div>
                      <div className="text-sm text-zinc-400 truncate max-w-[200px]">{user.email}</div>
                      <div className="flex items-center gap-2 text-[10px] mt-0.5">
                        <span className="text-purple-400 flex items-center gap-1">
                          <Crown size={10} /> Verified
                        </span>
                        <span className="text-zinc-400 flex items-center gap-1">
                          {regionInfo.flag} {regionInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 py-3 px-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-white mb-2"
                  >
                    <CircleUserRound size={18} />
                    <span>Dashboard</span>
                  </Link>
                  
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-zinc-800/50 text-zinc-300 transition-colors mb-2"
                  >
                    <User size={18} />
                    <span>Profile Settings</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full py-3 px-3 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600/20 transition-colors"
                  >
                    <LogOut size={18} />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <div className="mt-2 pt-2 border-t border-zinc-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between px-3 py-1">
                    <span className="text-sm text-zinc-400">Region</span>
                    <span className="text-sm text-white">{regionInfo.flag} {regionInfo.label}</span>
                  </div>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center py-3 px-4 font-medium text-white bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center py-3 px-4 font-semibold text-white rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 hover:from-blue-500 hover:via-purple-500 hover:to-pink-400 transition-all shadow-lg"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}