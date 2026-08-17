'use client';

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Menu, X, Home, Trophy, TrendingUp, Scale, BookOpen, 
  User, Star, Gift, Mic, ArrowRight, Calculator, LogOut, CircleUserRound,
  Settings, HelpCircle, Shield, Sparkles, Zap, Crown
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
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { dynamicItem, updateDynamicItem } = useNavigation();
  const { user, isLoading, logout } = useUser();

  // Main navigation items - matches desktop navbar
  const mainNavItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Gift, label: "Offers", path: "/offers", badge: "Hot" },
    { icon: Trophy, label: "Prop Firms", path: "/prop-firms" },
    { icon: TrendingUp, label: "Brokers", path: "/brokers" },
    { icon: Scale, label: "Compare", path: "/compare" },
    { icon: Star, label: "Reviews", path: "/reviews" },
    { icon: BookOpen, label: "Blog", path: "/blog" },
    { icon: Calculator, label: "Tools", path: "/tools" },
  ];

  // Secondary navigation items - matches desktop navbar
  const accountNavItems = [
    { icon: CircleUserRound, label: "Dashboard", path: "/dashboard" },
    { icon: User, label: "Profile Settings", path: "/dashboard/profile" },
    { icon: HelpCircle, label: "Help & Support", path: "/help" },
  ];

  // Combine all data for search
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

  // Filter results based on search
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    
    const searchTerm = search.toLowerCase();
    return allData.filter(item => 
      item.searchableText.includes(searchTerm) || 
      item.name.toLowerCase().includes(searchTerm)
    ).slice(0, 8);
  }, [search, allData]);

  // Voice search simulation
  const startVoiceSearch = () => {
    setShowVoiceSearch(true);
    setTimeout(() => {
      setShowVoiceSearch(false);
      setSearch("best prop firms");
    }, 2000);
  };

  // Handle navigation to item
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

  // Handle dropdown navigation click
  const handleNavClick = (item: any) => {
    if (item.key) {
      updateDynamicItem(item.key);
    }
    setMenuOpen(false);
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    router.push("/");
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Generate gradient based on name
  const generateGradient = (name: string) => {
    const gradients = [
      "from-pink-500 to-purple-500",
      "from-blue-500 to-purple-500", 
      "from-green-500 to-blue-500",
      "from-yellow-500 to-orange-500",
    ];
    const index = name.length % gradients.length;
    return gradients[index];
  };

  return (
    <>
      {/* Main Header - Updated with logo image like desktop navbar */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-zinc-800 px-4 py-3"
      >
        <div className="flex items-center justify-between">
          {/* Logo - Uses image like desktop navbar */}
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

          {/* Search & Menu */}
          <div className="flex items-center gap-3">
            {/* User Avatar if logged in */}
            {!isLoading && user && (
              <button 
                onClick={() => setMenuOpen(true)}
                className="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm hover:scale-105 transition-transform shadow-md"
                title={user.name}
              >
                {getUserInitials()}
              </button>
            )}
            
            <button 
              onClick={() => setSearchOpen(true)}
              className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <Search size={20} className="text-white" />
            </button>
            
            <button 
              onClick={() => setMenuOpen(true)}
              className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <Menu size={20} className="text-white" />
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
            className="fixed inset-0 bg-black/95 z-50 p-4"
          >
            <div className="flex items-center gap-3 mb-6">
              <button 
                onClick={() => {
                  setSearchOpen(false);
                  setSearch("");
                }}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X size={24} className="text-white" />
              </button>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
                <input
                  type="text"
                  placeholder="Search brokers, prop firms..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <button 
                onClick={startVoiceSearch}
                className="p-3 bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Mic size={20} className="text-white" />
              </button>
            </div>

            {/* Voice Search Animation */}
            <AnimatePresence>
              {showVoiceSearch && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Mic size={32} className="text-white" />
                  </div>
                  <p className="text-lg text-white">Listening...</p>
                  <p className="text-zinc-400 text-sm">Speak now</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search Results */}
            {!showVoiceSearch && search.trim() && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-zinc-400 text-sm">
                    {searchResults.length} results found
                  </p>
                  <p className="text-zinc-400 text-xs">
                    Brokers & Prop Firms
                  </p>
                </div>
                
                {searchResults.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {searchResults.map((item) => (
                      <button
                        key={`${item.type}-${item.id}`}
                        onClick={() => handleNavigate(item)}
                        className="w-full text-left p-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors text-white flex items-center gap-3"
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${generateGradient(item.name)} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                          {item.name.charAt(0)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-semibold truncate">{item.name}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              item.type === "prop-firm" 
                                ? "bg-purple-500/20 text-purple-400" 
                                : "bg-blue-500/20 text-blue-400"
                            }`}>
                              {item.type === "prop-firm" ? "Prop Firm" : "Broker"}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3 text-xs text-zinc-400">
                            <div className="flex items-center gap-1">
                              <Star size={12} className="text-yellow-400 fill-yellow-400" />
                              <span>{item.rating}</span>
                            </div>
                            <span>•</span>
                            <span>{item.country}</span>
                            {item.type === "prop-firm" && (
                              <>
                                <span>•</span>
                                <span>Up to {Math.max(...item.programs.flatMap((p: any) => p.accountOptions.map((o: any) => o.payoutPercentage || 0)))}% payout</span>
                              </>
                            )}
                            {item.type === "broker" && (
                              <>
                                <span>•</span>
                                <span>${item.minDeposit} min</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <ArrowRight size={16} className="text-zinc-400 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-zinc-400">No results found for "{search}"</p>
                    <p className="text-zinc-500 text-sm mt-2">Try different keywords</p>
                  </div>
                )}
              </div>
            )}

            {/* Quick Suggestions */}
            {!showVoiceSearch && !search.trim() && (
              <div className="space-y-3">
                <p className="text-zinc-400 text-sm">Try searching for:</p>
                {[
                  "FTMO",
                  "IC Markets", 
                  "The 5%ers",
                  "Instant funding",
                  "High leverage brokers",
                  "Best prop firms"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setSearch(suggestion)}
                    className="w-full text-left p-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors text-white"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropdown Menu Overlay - Updated with desktop navbar styling */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 overflow-y-auto"
          >
            {/* Header with Logo */}
            <div className="sticky top-0 bg-black/95 backdrop-blur-lg border-b border-zinc-800 p-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
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
                  <span className="text-lg font-bold tracking-tight">
                    Insight <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Pip</span>
                  </span>
                </Link>
                
                <button 
                  onClick={() => setMenuOpen(false)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X size={24} className="text-white" />
                </button>
              </div>
            </div>

            {/* User Section - Matches desktop navbar style */}
            <div className="p-4 border-b border-zinc-800">
              {!isLoading && user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl border border-blue-500/30">
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {getUserInitials()}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold text-lg truncate">{user.name || 'User'}</div>
                      <div className="text-zinc-400 text-sm truncate mb-2">{user.email}</div>
                      <div className="flex items-center gap-1 text-[10px] text-purple-400">
                        <Crown size={10} />
                        <span>Verified Member</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium text-center transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex-1 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg text-red-400 text-sm font-medium text-center transition-colors"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-center mb-4">
                    <div className="text-white font-semibold">Welcome to Insight Pip</div>
                    <div className="text-zinc-400 text-sm">Sign in to access your account</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="p-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white text-center font-medium transition-colors"
                    >
                      Login
                    </Link>
                    
                    <Link
                      href="/signup"
                      onClick={() => setMenuOpen(false)}
                      className="p-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 hover:from-blue-500 hover:via-purple-500 hover:to-pink-400 rounded-xl text-white text-center font-medium transition-colors shadow-lg"
                    >
                      Sign Up Free
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Items - Main */}
            <div className="p-4">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-3">
                Main Navigation
              </h3>
              <div className="space-y-1">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => handleNavClick(item)}
                      className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                          : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium flex-1">{item.label}</span>
                      
                      {item.badge && (
                        <span className="text-[10px] font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      
                      {item.key && (
                        <div className={`w-2 h-2 rounded-full ${
                          item.key === dynamicItem ? "bg-green-400" : "bg-zinc-600"
                        }`} />
                      )}
                      
                      {!isActive && <ArrowRight size={16} className="text-zinc-600" />}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Account Navigation - Matches desktop navbar */}
            {!isLoading && user && (
              <div className="p-4 border-t border-zinc-800">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-3">
                  Account Settings
                </h3>
                <div className="space-y-1">
                  {accountNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;
                    
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                            : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        <Icon size={20} />
                        <span className="font-medium flex-1">{item.label}</span>
                        {!isActive && <ArrowRight size={16} className="text-zinc-600" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}