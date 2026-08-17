// components/tools/MobileRiskManager.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function MobileRiskManager() {
  const [accountSize, setAccountSize] = useState(10000);
  const [riskPercentage, setRiskPercentage] = useState(2);
  const [stopLossPips, setStopLossPips] = useState(20);
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [pipValue, setPipValue] = useState(10);

  const calculateRisk = () => {
    const riskAmount = (accountSize * riskPercentage) / 100;
    const positionSize = (riskAmount * 10000) / (stopLossPips * pipValue);
    const marginRequired = positionSize / 30;
    const marginPercentage = (marginRequired / accountSize) * 100;
    
    return {
      riskAmount,
      positionSize: Math.round(positionSize),
      marginRequired: Math.round(marginRequired),
      marginPercentage: marginPercentage.toFixed(1),
      isHighRisk: riskPercentage > 3 || marginPercentage > 20
    };
  };

  const results = calculateRisk();

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-zinc-400 text-sm">Account Size</label>
            <span className="text-green-400 font-bold text-sm">${accountSize.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={1000}
            max={100000}
            step={1000}
            value={accountSize}
            onChange={(e) => setAccountSize(Number(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-zinc-400 text-sm">Risk Percentage</label>
            <span className="text-red-400 font-bold text-sm">{riskPercentage}%</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={10}
            step={0.5}
            value={riskPercentage}
            onChange={(e) => setRiskPercentage(Number(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-zinc-400 text-sm">Stop Loss (Pips)</label>
            <span className="text-blue-400 font-bold text-sm">{stopLossPips}</span>
          </div>
          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={stopLossPips}
            onChange={(e) => setStopLossPips(Number(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <label className="text-zinc-400 text-sm mb-2 block">Currency Pair</label>
          <select
            value={currencyPair}
            onChange={(e) => setCurrencyPair(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="EUR/USD">EUR/USD</option>
            <option value="GBP/USD">GBP/USD</option>
            <option value="USD/JPY">USD/JPY</option>
            <option value="AUD/USD">AUD/USD</option>
          </select>
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-500/10 to-orange-500/20 rounded-xl p-5 border border-red-500/30">
        <div className="text-center">
          <div className="text-red-400 text-xs mb-1">Maximum Risk Amount</div>
          <div className="text-white text-3xl font-bold">${results.riskAmount.toLocaleString()}</div>
        </div>
      </div>

      {results.isHighRisk && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-400" size={16} />
            <div className="text-red-400 text-xs font-medium">High Risk Warning</div>
          </div>
          <div className="text-red-300 text-xs mt-1">Risk exceeds recommended limits. Consider reducing position size.</div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="text-zinc-500 text-[10px] mb-1">Position Size</div>
          <div className="text-green-400 font-bold text-lg">${results.positionSize.toLocaleString()}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="text-zinc-500 text-[10px] mb-1">Margin Required</div>
          <div className="text-blue-400 font-bold text-lg">${results.marginRequired.toLocaleString()}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="text-zinc-500 text-[10px] mb-1">Risk %</div>
          <div className="text-red-400 font-bold text-lg">{riskPercentage}%</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="text-zinc-500 text-[10px] mb-1">Margin Usage</div>
          <div className="text-yellow-400 font-bold text-lg">{results.marginPercentage}%</div>
        </div>
      </div>
    </div>
  );
}