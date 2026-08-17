'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calculator,
  ShieldCheck,
  BarChart3,
  DollarSign,
  Calendar,
  Star,
  X,
  ChevronLeft,
  ArrowRight,
  Eye,
  Clock,
  TrendingUp,
  Zap,
  Brain,
  Rocket,
  Sparkles,
  Flame,
  Crown,
  Gem,
  PieChart,
  Target,
  Activity
} from "lucide-react";

// Import the tools components
import PremiumEconomicCalendar from "./PremiumEconomicCalendar";
import RealCurrencyConverter from "./RealCurrencyConverter";
import RiskManagerPro from "./RiskManagerPro";
import PipCalculator from "./PipCalculator";

const tools = [
  {
    id: 'risk-manager',
    name: 'Risk Manager Pro',
    shortName: 'Risk',
    icon: ShieldCheck,
    color: 'from-red-500 to-orange-500',
    bgGlow: 'red',
    description: 'Calculate position sizes, stop losses, and portfolio risk',
    component: RiskManagerPro,
    badge: 'Popular',
    badgeColor: 'orange'
  },
  {
    id: 'pip-calculator',
    name: 'Pip Calculator',
    shortName: 'Pips',
    icon: BarChart3,
    color: 'from-purple-500 to-pink-500',
    bgGlow: 'purple',
    description: 'Calculate pip values for any currency pair instantly',
    component: PipCalculator,
    badge: 'Essential',
    badgeColor: 'purple'
  },
  {
    id: 'currency-converter',
    name: 'Currency Converter',
    shortName: 'Convert',
    icon: DollarSign,
    color: 'from-amber-500 to-yellow-500',
    bgGlow: 'amber',
    description: 'Real-time exchange rates for all major currencies',
    component: RealCurrencyConverter,
    badge: 'Live',
    badgeColor: 'green'
  },
  {
    id: 'economic-calendar',
    name: 'Economic Calendar',
    shortName: 'Calendar',
    icon: Calendar,
    color: 'from-blue-500 to-cyan-500',
    bgGlow: 'blue',
    description: 'Track important economic events and news releases',
    component: PremiumEconomicCalendar,
    badge: 'Pro',
    badgeColor: 'cyan'
  }
];

const getGlowClass = (color: string) => {
  switch(color) {
    case 'red': return 'shadow-red-500/20';
    case 'purple': return 'shadow-purple-500/20';
    case 'amber': return 'shadow-amber-500/20';
    case 'blue': return 'shadow-blue-500/20';
    case 'cyan': return 'shadow-cyan-500/20';
    default: return 'shadow-purple-500/20';
  }
};

export default function DesktopToolsTab() {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentTools, setRecentTools] = useState<string[]>([]);
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  // Load saved data
  useEffect(() => {
    const savedFavorites = localStorage.getItem('tools_favorites');
    const savedRecent = localStorage.getItem('tools_recent');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedRecent) setRecentTools(JSON.parse(savedRecent));
  }, []);

  const toggleFavorite = (toolId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = favorites.includes(toolId)
      ? favorites.filter(id => id !== toolId)
      : [...favorites, toolId];
    setFavorites(newFavorites);
    localStorage.setItem('tools_favorites', JSON.stringify(newFavorites));
  };

  const openTool = (toolId: string) => {
    // Update recent tools
    const newRecent = [toolId, ...recentTools.filter(id => id !== toolId)].slice(0, 5);
    setRecentTools(newRecent);
    localStorage.setItem('tools_recent', JSON.stringify(newRecent));
    setActiveToolId(toolId);
  };

  const activeTool = tools.find(t => t.id === activeToolId);
  const ActiveComponent = activeTool?.component;

  if (activeToolId && ActiveComponent) {
    return (
      <div className="space-y-4">
        {/* Back button and header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveToolId(null)}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm">Back to Tools</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => toggleFavorite(activeToolId, e)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Star size={16} className={favorites.includes(activeToolId) ? "text-yellow-400 fill-yellow-400" : "text-zinc-500"} />
            </button>
          </div>
        </div>

        {/* Tool header */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl border border-zinc-800 p-5">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${activeTool.color} flex items-center justify-center shadow-lg`}>
              <activeTool.icon className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{activeTool.name}</h2>
              <p className="text-zinc-400 text-sm">{activeTool.description}</p>
            </div>
          </div>
        </div>

        {/* Tool content */}
        <div className="bg-zinc-900/30 rounded-xl border border-zinc-800 p-5">
          <ActiveComponent />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl p-3 border border-zinc-800 text-center">
          <div className="text-2xl font-bold text-white">{tools.length}</div>
          <div className="text-xs text-zinc-500">Tools</div>
        </div>
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl p-3 border border-zinc-800 text-center">
          <div className="text-2xl font-bold text-purple-400">{favorites.length}</div>
          <div className="text-xs text-zinc-500">Favorites</div>
        </div>
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl p-3 border border-zinc-800 text-center">
          <div className="text-2xl font-bold text-cyan-400">{recentTools.length}</div>
          <div className="text-xs text-zinc-500">Recent</div>
        </div>
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl p-3 border border-zinc-800 text-center">
          <div className="text-2xl font-bold text-yellow-400">24/7</div>
          <div className="text-xs text-zinc-500">Available</div>
        </div>
      </div>

      {/* Welcome Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/20 via-cyan-900/20 to-blue-900/20 rounded-xl p-4 border border-purple-500/20">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl" />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
            <Rocket className="text-white" size={18} />
          </div>
          <div>
            <p className="text-white text-sm font-medium">Professional Trading Toolkit</p>
            <p className="text-zinc-400 text-xs">Select any tool below to get started</p>
          </div>
        </div>
      </div>

      {/* Recent Tools */}
      {recentTools.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-cyan-400" />
            <h3 className="text-white text-sm font-medium">Recently Used</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentTools.map(toolId => {
              const tool = tools.find(t => t.id === toolId);
              if (!tool) return null;
              const Icon = tool.icon;
              return (
                <button
                  key={toolId}
                  onClick={() => openTool(toolId)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all group"
                >
                  <Icon size={14} className="text-purple-400" />
                  {tool.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tools Grid - 2x2 Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isFavorite = favorites.includes(tool.id);
          const isHovered = hoveredTool === tool.id;

          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              onMouseEnter={() => setHoveredTool(tool.id)}
              onMouseLeave={() => setHoveredTool(null)}
              onClick={() => openTool(tool.id)}
              className="relative group cursor-pointer"
            >
              {/* Glow effect */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${tool.color} rounded-xl blur-lg transition-all duration-500 opacity-0 group-hover:opacity-40 ${isHovered ? 'opacity-40' : ''}`} />
              
              {/* Card */}
              <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl border border-zinc-800 hover:border-transparent transition-all p-5 overflow-hidden">
                {/* Badge */}
                <div className={`absolute top-3 right-3 text-[10px] font-medium px-2 py-0.5 rounded-full bg-${tool.badgeColor}-500/20 text-${tool.badgeColor}-400 border border-${tool.badgeColor}-500/30`}>
                  {tool.badge}
                </div>

                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tool.color} flex items-center justify-center mb-4 shadow-md transition-transform group-hover:scale-110 duration-300`}>
                  <Icon className="text-white" size={22} />
                </div>

                {/* Title */}
                <h3 className="text-white font-bold text-lg mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 transition-all duration-300">
                  {tool.name}
                </h3>

                {/* Description */}
                <p className="text-zinc-400 text-sm mb-4">{tool.description}</p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => toggleFavorite(tool.id, e)}
                      className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Star size={14} className={isFavorite ? "text-yellow-400 fill-yellow-400" : "text-zinc-500"} />
                    </button>
                    <div className="flex items-center gap-1">
                      <Eye size={12} className="text-zinc-500" />
                      <span className="text-xs text-zinc-500">Open tool</span>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-zinc-500 group-hover:text-purple-400 transition-colors group-hover:translate-x-0.5 transform" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Tip */}
      <div className="bg-gradient-to-r from-zinc-900/50 to-zinc-800/50 rounded-xl p-3 border border-zinc-800">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-yellow-400" />
          <p className="text-xs text-zinc-400">
            <span className="text-white font-medium">Pro tip:</span> Star your favorite tools for quick access
          </p>
        </div>
      </div>
    </div>
  );
}