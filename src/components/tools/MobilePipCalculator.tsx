// components/tools/MobilePipCalculator.tsx
'use client';

import { useState, useEffect } from 'react';

export default function MobilePipCalculator() {
  const [tradeSize, setTradeSize] = useState(10000);
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [pipValue, setPipValue] = useState(10);

  // Pip values for different currency pairs
  const pipValues: { [key: string]: number } = {
    'EUR/USD': 10,
    'GBP/USD': 10,
    'USD/JPY': 9.09,
    'USD/CHF': 10,
    'AUD/USD': 10,
    'USD/CAD': 10,
    'NZD/USD': 10,
  };

  useEffect(() => {
    setPipValue(pipValues[currencyPair] || 10);
  }, [currencyPair]);

  const calculatePipValue = () => {
    const calculatedPipValue = (tradeSize / 10000) * pipValue;
    
    return {
      pipValue: calculatedPipValue.toFixed(2),
      costPerPip: calculatedPipValue.toFixed(2),
      tenPipMove: (calculatedPipValue * 10).toFixed(2),
      fiftyPipMove: (calculatedPipValue * 50).toFixed(2)
    };
  };

  const results = calculatePipValue();

  return (
    <div className="space-y-5">
      {/* Trade Size Input */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-zinc-400 text-sm font-medium">Trade Size</label>
          <span className="text-green-400 font-bold text-sm">{tradeSize.toLocaleString()} units</span>
        </div>
        <input
          type="range"
          min={1000}
          max={100000}
          step={1000}
          value={tradeSize}
          onChange={(e) => setTradeSize(Number(e.target.value))}
          className="w-full h-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-zinc-500">
          <span>1K</span>
          <span>10K</span>
          <span>25K</span>
          <span>50K</span>
          <span>100K</span>
        </div>
      </div>

      {/* Currency Pair Selection */}
      <div className="space-y-2">
        <label className="text-zinc-400 text-sm font-medium block">Currency Pair</label>
        <select
          value={currencyPair}
          onChange={(e) => setCurrencyPair(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
        >
          <option value="EUR/USD">EUR/USD</option>
          <option value="GBP/USD">GBP/USD</option>
          <option value="USD/JPY">USD/JPY</option>
          <option value="USD/CHF">USD/CHF</option>
          <option value="AUD/USD">AUD/USD</option>
          <option value="USD/CAD">USD/CAD</option>
          <option value="NZD/USD">NZD/USD</option>
        </select>
      </div>

      {/* Main Result Card */}
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/20 rounded-xl p-6 border border-purple-500/30 text-center">
        <div className="text-purple-400 text-xs uppercase tracking-wider mb-1">Pip Value</div>
        <div className="text-white text-4xl font-bold mb-1">${results.pipValue}</div>
        <div className="text-zinc-500 text-xs">Per 1 pip movement</div>
      </div>

      {/* Move Calculations */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-zinc-500 text-[10px] uppercase mb-1">10 Pip Move</div>
          <div className="text-green-400 font-bold text-xl">${results.tenPipMove}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-zinc-500 text-[10px] uppercase mb-1">50 Pip Move</div>
          <div className="text-blue-400 font-bold text-xl">${results.fiftyPipMove}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center col-span-2">
          <div className="text-zinc-500 text-[10px] uppercase mb-1">Cost per Pip</div>
          <div className="text-yellow-400 font-bold text-xl">${results.costPerPip}</div>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
        <h4 className="text-white text-sm font-bold mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
          Quick Reference
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center py-1">
            <span className="text-zinc-400">Standard Lot (100,000)</span>
            <span className="text-white font-mono">$10/pip</span>
          </div>
          <div className="flex justify-between items-center py-1 border-t border-zinc-800">
            <span className="text-zinc-400">Mini Lot (10,000)</span>
            <span className="text-white font-mono">$1/pip</span>
          </div>
          <div className="flex justify-between items-center py-1 border-t border-zinc-800">
            <span className="text-zinc-400">Micro Lot (1,000)</span>
            <span className="text-white font-mono">$0.10/pip</span>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="text-center text-zinc-500 text-[10px]">
        Pip values calculated for standard 100K lot size
      </div>
    </div>
  );
}