// components/tools/MobileToolsPage.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, ShieldCheck, DollarSign, Calendar, 
  BarChart3, Star, Clock, Sparkles, Zap,
  ChevronLeft
} from "lucide-react";
import MobileLayout from '@/components/mobile/MobileLayout';
import MobilePipCalculator from './MobilePipCalculator';
import MobileRiskManager from './MobileRiskManager';
import MobileCurrencyConverter from './MobileCurrencyConverter';
import MobileEconomicCalendar from './MobileEconomicCalendar';

const tools = [
  {
    id: 'risk-manager',
    name: 'Risk Manager Pro',
    icon: ShieldCheck,
    color: 'from-red-500 to-orange-500',
    description: 'Calculate position sizes and risk',
    component: MobileRiskManager,
    badge: 'Popular',
    badgeColor: 'orange'
  },
  {
    id: 'pip-calculator',
    name: 'Pip Calculator',
    icon: BarChart3,
    color: 'from-purple-500 to-pink-500',
    description: 'Calculate pip values instantly',
    component: MobilePipCalculator,
    badge: 'Essential',
    badgeColor: 'purple'
  },
  {
    id: 'currency-converter',
    name: 'Currency Converter',
    icon: DollarSign,
    color: 'from-amber-500 to-yellow-500',
    description: 'Real-time exchange rates',
    component: MobileCurrencyConverter,
    badge: 'Live',
    badgeColor: 'green'
  },
  {
    id: 'economic-calendar',
    name: 'Economic Calendar',
    icon: Calendar,
    color: 'from-blue-500 to-cyan-500',
    description: 'Track economic events',
    component: MobileEconomicCalendar,
    badge: 'Pro',
    badgeColor: 'cyan'
  }
];

export default function MobileToolsPage() {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentTools, setRecentTools] = useState<string[]>([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('mobile_tools_favorites');
    const savedRecent = localStorage.getItem('mobile_tools_recent');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedRecent) setRecentTools(JSON.parse(savedRecent));
  }, []);

  const toggleFavorite = (toolId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = favorites.includes(toolId)
      ? favorites.filter(id => id !== toolId)
      : [...favorites, toolId];
    setFavorites(newFavorites);
    localStorage.setItem('mobile_tools_favorites', JSON.stringify(newFavorites));
  };

  const openTool = (toolId: string) => {
    const newRecent = [toolId, ...recentTools.filter(id => id !== toolId)].slice(0, 5);
    setRecentTools(newRecent);
    localStorage.setItem('mobile_tools_recent', JSON.stringify(newRecent));
    setActiveToolId(toolId);
  };

  const activeTool = tools.find(t => t.id === activeToolId);
  const ActiveComponent = activeTool?.component;

  if (activeToolId && ActiveComponent) {
    return (
      <MobileLayout title={activeTool?.name || 'Tool'} showSearch={false}>
        <div className="px-4 pt-4 pb-20">
          <button
            onClick={() => setActiveToolId(null)}
            className="flex items-center gap-1 text-purple-400 text-sm mb-4"
          >
            <ChevronLeft size={16} /> Back to Tools
          </button>
          
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl border border-zinc-800 p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${activeTool.color} flex items-center justify-center shadow-lg`}>
                <activeTool.icon size={22} className="text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">{activeTool.name}</h2>
                <p className="text-zinc-400 text-xs">{activeTool.description}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
            <ActiveComponent />
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Trading Tools" showSearch={false}>
      <div className="px-4 pt-4 pb-20">
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-3 text-center border border-purple-500/30">
              <div className="text-2xl font-bold text-white">{tools.length}</div>
              <div className="text-xs text-zinc-400">Tools</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-3 text-center border border-blue-500/30">
              <div className="text-2xl font-bold text-blue-400">{favorites.length}</div>
              <div className="text-xs text-zinc-400">Favorites</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-xl p-3 text-center border border-green-500/30">
              <div className="text-2xl font-bold text-green-400">24/7</div>
              <div className="text-xs text-zinc-400">Available</div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-orange-600/20 rounded-2xl p-4 border border-purple-500/30">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl" />
            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Professional Toolkit</p>
                <p className="text-zinc-400 text-xs">Select a tool to get started</p>
              </div>
            </div>
          </div>

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
                      className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all"
                    >
                      <Icon size={12} className="text-purple-400" />
                      {tool.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isFavorite = favorites.includes(tool.id);

              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => openTool(tool.id)}
                  className="relative bg-zinc-900/80 rounded-xl border border-zinc-800 overflow-hidden active:bg-zinc-800/50 transition-all cursor-pointer"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tool.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                        <Icon size={22} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-white font-bold text-base">{tool.name}</h3>
                            <p className="text-zinc-400 text-xs mt-0.5">{tool.description}</p>
                          </div>
                          <button
                            onClick={(e) => toggleFavorite(tool.id, e)}
                            className="p-1.5 rounded-lg bg-zinc-800"
                          >
                            <Star size={14} className={isFavorite ? "text-yellow-400 fill-yellow-400" : "text-zinc-500"} />
                          </button>
                        </div>
                        
                        <div className={`mt-3 inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full bg-${tool.badgeColor}-500/20 text-${tool.badgeColor}-400 border border-${tool.badgeColor}-500/30`}>
                          {tool.badge}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/30">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-yellow-400" />
              <p className="text-xs text-zinc-400">
                <span className="text-white font-medium">Pro tip:</span> Star your favorite tools for quick access
              </p>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}