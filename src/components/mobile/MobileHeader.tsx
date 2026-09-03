'use client';

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Menu, X, Home, Trophy, TrendingUp, Scale, BookOpen, 
  User, Star, Gift, ArrowRight, Calculator, LogOut, CircleUserRound,
  Settings, HelpCircle, Shield, Crown
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

  // Main navigation items - with keys for dynamic items
  const mainNavItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Gift, label: "Offers", path: "/offers" },
    { icon: Trophy, label: "Prop Firms", path: "/prop-firms" },
    { icon: TrendingUp, label: "Brokers", path: "/brokers" },
    { icon: Scale, label: "Compare", path: "/compare" },
    // These items can change the dynamic bottom nav
    { icon: Star, label: "Reviews", path: "/reviews", key: "reviews" },
    { icon: BookOpen, label: "Blog", path: "/blog", key: "blog" },
    { icon: Calculator, label: "Tools", path: "/tools", key: "tools" },
  ];

  // Account navigation
  const accountNavItems = [
    { icon: CircleUserRound, label: "Dashboard", path: "/dashboard" },
    { icon: User, label: "Profile", path: "/dashboard/profile" },
    { icon: HelpCircle, label: "Help", path: "/help" },
  ];

  // Search data
  const allData = useMemo(() => {
    const brokers = brokersData.map(broker => ({
      ...broker,
      type: "broker" as const,
      searchableText: `${broker.name} ${broker.country} ${broker.description || ""} ${broker.regulation || ""}`.toLowerCase()
    }));
    
    const propFirms = challengesData.map(firm => ({
      ...firm,
      type: "prop-firm" as const,
      searchableText: `${firm.name} ${firm.country} ${firm.description || ""} ${firm.programs?.map((p: any) => p.type).join(" ") || ""}`.toLowerCase()
    }));
    
    return [...brokers, ...propFirms];
  }, []);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const searchTerm = search.toLowerCase();
    return allData.filter(item => 
      item.searchableText.includes(searchTerm) || 
      item.name.toLowerCase().includes(searchTerm)
    ).slice(0, 8);
  }, [search, allData]);

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
    // If the item has a key, update the dynamic navigation
    if (item.key) {
      updateDynamicItem(item.key);
    }
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
    return 'U';
  };

  return (
    <>
      {/* Header - Clean, premium */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-[#0a0a12] border-b border-[#1e1e32] px-4 py-3"
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-[#1a1a2e] flex items-center justify-center">
              <span className="text-white font-bold text-sm">IP</span>
            </div>
            <div>
              <span className="text-lg font-semibold tracking-tight text-white">
                Insight<span className="text-blue-500">Pip</span>
              </span>
              <div className="text-[8px] text-zinc-500 tracking-wider uppercase -mt-0.5">
                Research before you trust
              </div>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!isLoading && user && (
              <button 
                onClick={() => setMenuOpen(true)}
                className="w-8 h-8 rounded-full bg-[#1a1a2e] border border-[#2a2a3e] flex items-center justify-center text-white font-medium text-sm hover:border-blue-500/50 transition-colors"
              >
                {getUserInitials()}
              </button>
            )}
            
            <button 
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg hover:bg-[#1a1a2e] transition-colors"
            >
              <Search size={18} className="text-zinc-400" />
            </button>
            
            <button 
              onClick={() => setMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-[#1a1a2e] transition-colors"
            >
              <Menu size={18} className="text-zinc-400" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0a0a12] z-50 p-4"
          >
            <div className="flex items-center gap-3 mb-6">
              <button 
                onClick={() => {
                  setSearchOpen(false);
                  setSearch("");
                }}
                className="p-2 hover:bg-[#1a1a2e] rounded-lg transition-colors"
              >
                <X size={22} className="text-white" />
              </button>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="text"
                  placeholder="Search brokers, prop firms..."
                  className="w-full bg-[#12121f] border border-[#1e1e32] rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {search.trim() && (
              <div className="space-y-3">
                <p className="text-xs text-zinc-500">
                  {searchResults.length} results found
                </p>
                
                {searchResults.length > 0 ? (
                  <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                    {searchResults.map((item) => (
                      <button
                        key={`${item.type}-${item.id}`}
                        onClick={() => handleNavigate(item)}
                        className="w-full text-left p-3 bg-[#12121f] rounded-lg hover:bg-[#1a1a2e] transition-colors text-white flex items-center gap-3 border border-transparent hover:border-[#1e1e32]"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#1a1a2e] flex items-center justify-center text-white font-bold flex-shrink-0">
                          {item.name.charAt(0)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-medium truncate">{item.name}</h3>
                            <span className={`text-[8px] px-2 py-0.5 rounded-full ${
                              item.type === "prop-firm" 
                                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}>
                              {item.type === "prop-firm" ? "Prop" : "Broker"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <span>★ {item.rating}</span>
                            <span>•</span>
                            <span>{item.country}</span>
                          </div>
                        </div>
                        
                        <ArrowRight size={14} className="text-zinc-500" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-zinc-400">No results found</p>
                    <p className="text-zinc-500 text-sm mt-1">Try different keywords</p>
                  </div>
                )}
              </div>
            )}

            {!search.trim() && (
              <div className="space-y-2">
                <p className="text-xs text-zinc-500">Popular searches</p>
                {["FTMO", "IC Markets", "The 5%ers", "Prop firms", "High leverage", "Instant funding"].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setSearch(suggestion)}
                    className="w-full text-left p-3 bg-[#12121f] rounded-lg hover:bg-[#1a1a2e] transition-colors text-white text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0a0a12] z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#0a0a12] border-b border-[#1e1e32] p-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
                  <span className="text-lg font-semibold text-white">
                    Insight<span className="text-blue-500">Pip</span>
                  </span>
                </Link>
                <button 
                  onClick={() => setMenuOpen(false)}
                  className="p-2 hover:bg-[#1a1a2e] rounded-lg transition-colors"
                >
                  <X size={22} className="text-white" />
                </button>
              </div>
            </div>

            {/* User Section */}
            <div className="p-4 border-b border-[#1e1e32]">
              {!isLoading && user ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#1a1a2e] border border-[#2a2a3e] flex items-center justify-center text-white font-bold text-lg">
                    {getUserInitials()}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">{user.name || 'User'}</div>
                    <div className="text-zinc-500 text-sm">{user.email}</div>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-blue-400">
                      <Crown size={10} />
                      <span>Verified Member</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg text-white text-center font-medium hover:bg-[#2a2a3e] transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-blue-600 rounded-lg text-white text-center font-medium hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3 px-2">Main</p>
              <div className="space-y-1">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => handleNavClick(item)}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-blue-500/10 text-blue-400"
                          : "text-zinc-300 hover:bg-[#1a1a2e] hover:text-white"
                      }`}
                    >
                      <Icon size={18} className={isActive ? "text-blue-400" : "text-zinc-500"} />
                      <span className="font-medium">{item.label}</span>
                      {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
                      {item.key && (
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                          item.key === dynamicItem ? "bg-blue-500/20 text-blue-400" : "bg-zinc-800 text-zinc-500"
                        }`}>
                          {item.key === dynamicItem ? "Active" : ""}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Account */}
            {!isLoading && user && (
              <div className="p-4 border-t border-[#1e1e32]">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3 px-2">Account</p>
                <div className="space-y-1">
                  {accountNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;
                    
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                          isActive
                            ? "bg-blue-500/10 text-blue-400"
                            : "text-zinc-300 hover:bg-[#1a1a2e] hover:text-white"
                        }`}
                      >
                        <Icon size={18} className={isActive ? "text-blue-400" : "text-zinc-500"} />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors w-full"
                  >
                    <LogOut size={18} />
                    <span className="font-medium">Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}