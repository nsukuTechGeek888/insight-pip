'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Calculator, DollarSign, TrendingUp } from 'lucide-react';

const PipCalculator = () => {
  const [tradeSize, setTradeSize] = useState(10000);
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [pipValue, setPipValue] = useState(10);

  useEffect(() => {
    const pipValues: { [key: string]: number } = {
      'EUR/USD': 10,
      'GBP/USD': 10,
      'USD/JPY': 9.09,
      'USD/CHF': 10,
      'AUD/USD': 10,
      'USD/CAD': 10,
      'NZD/USD': 10,
    };
    setPipValue(pipValues[currencyPair] || 10);
  }, [currencyPair]);

  const calculatePipValue = () => {
    const basePipValue = pipValue;
    const calculatedPipValue = (tradeSize / 10000) * basePipValue;
    
    return {
      pipValue: calculatedPipValue.toFixed(2),
      costPerPip: calculatedPipValue.toFixed(2),
      tenPipMove: (calculatedPipValue * 10).toFixed(2),
      fiftyPipMove: (calculatedPipValue * 50).toFixed(2)
    };
  };

  const results = calculatePipValue();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div>
            <label className="block text-[var(--ip-text)] font-semibold mb-3">
              Trade Size (Units): <span className="text-green-400">{tradeSize.toLocaleString()}</span>
            </label>
            <input
              type="range"
              min={1000}
              max={100000}
              step={1000}
              value={tradeSize}
              onChange={(e) => setTradeSize(Number(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg slider-thumb"
            />
          </div>

          <div>
            <label className="block text-[var(--ip-text-2)] text-sm mb-2 font-semibold">Currency Pair</label>
            <select
              value={currencyPair}
              onChange={(e) => setCurrencyPair(e.target.value)}
              className="w-full bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg p-3 text-[var(--ip-text)] focus:outline-none focus:border-blue-500"
            >
              <option value="EUR/USD">EUR/USD</option>
              <option value="GBP/USD">GBP/USD</option>
              <option value="USD/JPY">USD/JPY</option>
              <option value="USD/CHF">USD/CHF</option>
              <option value="AUD/USD">AUD/USD</option>
              <option value="USD/CAD">USD/CAD</option>
            </select>
          </div>

          <div className="bg-[var(--ip-surface-2)] rounded-xl p-4">
            <h4 className="text-[var(--ip-text)] font-bold text-lg mb-3 flex items-center gap-2">
              <Calculator size={20} className="text-blue-400" />
              How Pip Value Works
            </h4>
            <p className="text-[var(--ip-text-2)] text-sm">
              Pip value varies by currency pair. For most pairs (EUR/USD, GBP/USD), 
              1 pip = 0.0001. For JPY pairs, 1 pip = 0.01.
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-500/10 to-pink-500/20 rounded-2xl p-6 border border-blue-500/30">
            <div className="text-center">
              <div className="text-blue-400 text-sm mb-2">Pip Value</div>
              <div className="text-[var(--ip-text)] text-4xl font-bold">${results.pipValue}</div>
              <div className="text-[var(--ip-text-2)] text-sm mt-2">
                Per 1 pip movement
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-[var(--ip-text-2)] text-xs mb-1">10 Pip Move</div>
              <div className="text-green-400 font-bold text-xl">${results.tenPipMove}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-[var(--ip-text-2)] text-xs mb-1">50 Pip Move</div>
              <div className="text-blue-400 font-bold text-xl">${results.fiftyPipMove}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center col-span-2">
              <div className="text-[var(--ip-text-2)] text-xs mb-1">Cost per Pip</div>
              <div className="text-yellow-400 font-bold text-xl">${results.costPerPip}</div>
            </div>
          </div>

          <div className="bg-[var(--ip-surface-2)] rounded-xl p-4">
            <h4 className="text-[var(--ip-text)] font-bold text-sm mb-2">Quick Reference</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--ip-text-2)]">Standard Lot (100,000)</span>
                <span className="text-[var(--ip-text)]">$10/pip</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ip-text-2)]">Mini Lot (10,000)</span>
                <span className="text-[var(--ip-text)]">$1/pip</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ip-text-2)]">Micro Lot (1,000)</span>
                <span className="text-[var(--ip-text)]">$0.10/pip</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipCalculator;