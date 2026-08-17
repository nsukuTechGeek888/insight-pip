'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, TrendingUp, TrendingDown, Target, BarChart3 } from 'lucide-react';

const RiskManagerPro = () => {
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
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div>
            <label className="block text-white font-semibold mb-3">
              Account Size: <span className="text-green-400">${accountSize.toLocaleString()}</span>
            </label>
            <input
              type="range"
              min={1000}
              max={100000}
              step={1000}
              value={accountSize}
              onChange={(e) => setAccountSize(Number(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg slider-thumb"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-3">
              Risk Percentage: <span className="text-red-400">{riskPercentage}%</span>
            </label>
            <input
              type="range"
              min={0.5}
              max={10}
              step={0.5}
              value={riskPercentage}
              onChange={(e) => setRiskPercentage(Number(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg slider-thumb"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-3">
              Stop Loss (Pips): <span className="text-blue-400">{stopLossPips}</span>
            </label>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={stopLossPips}
              onChange={(e) => setStopLossPips(Number(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg slider-thumb"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-2 font-semibold">Currency Pair</label>
            <select
              value={currencyPair}
              onChange={(e) => setCurrencyPair(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="EUR/USD">EUR/USD</option>
              <option value="GBP/USD">GBP/USD</option>
              <option value="USD/JPY">USD/JPY</option>
              <option value="AUD/USD">AUD/USD</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-red-500/10 to-orange-500/20 rounded-2xl p-6 border border-red-500/30">
            <div className="text-center">
              <div className="text-red-400 text-sm mb-2">Maximum Risk Amount</div>
              <div className="text-white text-4xl font-bold">
                ${results.riskAmount.toLocaleString()}
              </div>
            </div>
          </div>

          {results.isHighRisk && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-red-400" size={20} />
                <div>
                  <div className="text-red-400 font-bold text-sm">High Risk Warning</div>
                  <div className="text-red-300 text-sm">
                    Risk exceeds recommended limits. Consider reducing position size.
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-zinc-400 text-xs mb-1">Position Size</div>
              <div className="text-green-400 font-bold text-xl">${results.positionSize.toLocaleString()}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-zinc-400 text-xs mb-1">Margin Required</div>
              <div className="text-blue-400 font-bold text-xl">${results.marginRequired.toLocaleString()}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-zinc-400 text-xs mb-1">Risk Percentage</div>
              <div className="text-red-400 font-bold text-xl">{riskPercentage}%</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-zinc-400 text-xs mb-1">Margin Usage</div>
              <div className="text-yellow-400 font-bold text-xl">{results.marginPercentage}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskManagerPro;