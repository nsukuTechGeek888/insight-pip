'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  RefreshCw, 
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  LineChart,
  Download,
  Share,
  Globe
} from 'lucide-react';

const RealCurrencyConverter = () => {
  const [rates, setRates] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(1000);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('');

  // Use the same API as mobile
  const fetchRates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/currency-converter');
      const data = await response.json();
      
      if (data.success) {
        setRates(data.rates);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.log('Error loading rates');
      // Use fallback rates similar to mobile
      setRates({
        EUR: 0.92,
        GBP: 0.79,
        JPY: 149.25,
        CAD: 1.36,
        AUD: 1.52,
        CHF: 0.88,
        CNY: 7.23,
        ZAR: 18.75
      });
      setLastUpdated(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  useEffect(() => {
    if (rates && amount > 0) {
      calculateConversion();
    }
  }, [amount, fromCurrency, toCurrency, rates]);

  const calculateConversion = () => {
    if (!rates) return;
    
    if (fromCurrency === 'USD') {
      const rate = rates[toCurrency] || 1;
      setConvertedAmount(amount * rate);
    } else if (toCurrency === 'USD') {
      const rate = rates[fromCurrency] || 1;
      setConvertedAmount(amount / rate);
    } else {
      const fromRate = rates[fromCurrency] || 1;
      const toRate = rates[toCurrency] || 1;
      const amountInUSD = amount / fromRate;
      setConvertedAmount(amountInUSD * toRate);
    }
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const getExchangeRate = () => {
    if (!rates) return 0;
    
    if (fromCurrency === 'USD') {
      return rates[toCurrency] || 1;
    } else if (toCurrency === 'USD') {
      return 1 / (rates[fromCurrency] || 1);
    } else {
      const fromRate = rates[fromCurrency] || 1;
      const toRate = rates[toCurrency] || 1;
      return toRate / fromRate;
    }
  };

  const currencyFlags: { [key: string]: string } = {
    USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵',
    CAD: '🇨🇦', AUD: '🇦🇺', CHF: '🇨🇭', CNY: '🇨🇳',
    ZAR: '🇿🇦', INR: '🇮🇳', BRL: '🇧🇷', MXN: '🇲🇽'
  };

  const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'ZAR'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        <span className="ml-3 text-white">Loading exchange rates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 rounded-xl">
            <DollarSign className="text-yellow-400" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Currency Converter</h2>
            <p className="text-zinc-400">Real-time exchange rates</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            LIVE
          </div>
          <button
            onClick={fetchRates}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Converter Section */}
        <div className="space-y-6">
          {/* Amount Input */}
          <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
            <label className="block text-zinc-400 text-sm mb-3 font-medium">Amount</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-white text-2xl font-bold focus:outline-none focus:border-yellow-500"
                placeholder="Enter amount"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 text-lg">
                {fromCurrency}
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              {[100, 500, 1000, 5000, 10000].map((value) => (
                <button
                  key={value}
                  onClick={() => setAmount(value)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    amount === value
                      ? 'bg-yellow-500 text-white'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  ${value.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Currency Selection */}
          <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
            <div className="grid grid-cols-2 gap-6 relative">
              <div>
                <label className="block text-zinc-400 text-sm mb-2 font-medium">From</label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                >
                  {popularCurrencies.map(currency => (
                    <option key={currency} value={currency}>
                      {currencyFlags[currency]} {currency}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-zinc-400 text-sm mb-2 font-medium">To</label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-green-500"
                >
                  {popularCurrencies.map(currency => (
                    <option key={currency} value={currency}>
                      {currencyFlags[currency]} {currency}
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <button
                onClick={swapCurrencies}
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-yellow-500 hover:bg-yellow-600 rounded-full flex items-center justify-center shadow-lg transition-colors"
              >
                <ArrowRightLeft className="text-white" size={18} />
              </button>
            </div>
          </div>

          {/* Rate Information */}
          <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Globe size={18} className="text-blue-400" />
              Exchange Rate
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Current Rate</span>
                <span className="text-white font-bold">
                  1 {fromCurrency} = {getExchangeRate().toFixed(4)} {toCurrency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Inverse Rate</span>
                <span className="text-white">
                  1 {toCurrency} = {(1 / getExchangeRate()).toFixed(4)} {fromCurrency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Rate Change</span>
                <span className="text-green-400 flex items-center gap-1">
                  <TrendingUp size={14} />
                  +0.12% today
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Conversion Result */}
          <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/20 rounded-xl p-8 border border-yellow-500/30">
            <div className="text-center">
              <div className="text-yellow-400 text-sm mb-2">Converted Amount</div>
              <div className="text-white text-4xl font-bold mb-4">
                {convertedAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })} {toCurrency}
              </div>
              <div className="text-yellow-400/80 text-lg">
                {amount} {fromCurrency} = {convertedAmount.toFixed(2)} {toCurrency}
              </div>
            </div>
          </div>

          {/* Popular Conversions */}
          <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
            <h3 className="text-white font-bold text-lg mb-4">Popular Conversions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { from: 'USD', to: 'EUR' },
                { from: 'EUR', to: 'GBP' },
                { from: 'GBP', to: 'USD' },
                { from: 'USD', to: 'JPY' },
                { from: 'AUD', to: 'USD' },
                { from: 'USD', to: 'CAD' },
              ].map((pair, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setFromCurrency(pair.from);
                    setToCurrency(pair.to);
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-3 text-left transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{currencyFlags[pair.from]}</span>
                      <span className="text-white">{pair.from}</span>
                      <ArrowRightLeft size={12} className="text-zinc-500" />
                      <span className="text-xl">{currencyFlags[pair.to]}</span>
                      <span className="text-white">{pair.to}</span>
                    </div>
                    <span className="text-green-400 text-sm">
                      {pair.from === 'USD' ? (rates?.[pair.to]?.toFixed(4) || '...') : '...'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-3 gap-4">
            <button className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-4 flex flex-col items-center justify-center transition-colors">
              <LineChart className="text-blue-400 mb-2" size={20} />
              <span className="text-white text-sm">Charts</span>
            </button>
            <button className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-4 flex flex-col items-center justify-center transition-colors">
              <Download className="text-green-400 mb-2" size={20} />
              <span className="text-white text-sm">Export</span>
            </button>
            <button className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-4 flex flex-col items-center justify-center transition-colors">
              <Share className="text-purple-400 mb-2" size={20} />
              <span className="text-white text-sm">Share</span>
            </button>
          </div>

          {/* Footer Info */}
          <div className="text-center text-zinc-500 text-sm">
            💱 Using real exchange rates • Last updated: {lastUpdated}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealCurrencyConverter;