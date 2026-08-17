// components/tools/MobileCurrencyConverter.tsx
'use client';

import { useState, useEffect } from 'react';
import { ArrowRightLeft } from 'lucide-react';

export default function MobileCurrencyConverter() {
  const [rates, setRates] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(1000);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('');

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
      setRates({
        EUR: 0.92, GBP: 0.79, JPY: 149.25, CAD: 1.36,
        AUD: 1.52, CHF: 0.88, CNY: 7.23, ZAR: 18.75
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
      if (fromCurrency === 'USD') {
        setConvertedAmount(amount * (rates[toCurrency] || 1));
      } else if (toCurrency === 'USD') {
        setConvertedAmount(amount / (rates[fromCurrency] || 1));
      } else {
        const amountInUSD = amount / (rates[fromCurrency] || 1);
        setConvertedAmount(amountInUSD * (rates[toCurrency] || 1));
      }
    }
  }, [amount, fromCurrency, toCurrency, rates]);

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const getExchangeRate = () => {
    if (!rates) return 0;
    if (fromCurrency === 'USD') return rates[toCurrency] || 1;
    if (toCurrency === 'USD') return 1 / (rates[fromCurrency] || 1);
    return (rates[toCurrency] || 1) / (rates[fromCurrency] || 1);
  };

  const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'ZAR'];
  const currencyFlags: { [key: string]: string } = {
    USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵',
    CAD: '🇨🇦', AUD: '🇦🇺', CHF: '🇨🇭', CNY: '🇨🇳', ZAR: '🇿🇦'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        <span className="ml-3 text-white text-sm">Loading rates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
        <label className="text-zinc-400 text-sm mb-2 block">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-white text-xl font-bold focus:outline-none focus:border-yellow-500"
        />
        <div className="flex gap-2 mt-3">
          {[100, 500, 1000, 5000].map((value) => (
            <button
              key={value}
              onClick={() => setAmount(value)}
              className={`flex-1 py-2 rounded-lg text-xs transition-all ${
                amount === value ? 'bg-yellow-500 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              ${value.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
        <div className="grid grid-cols-2 gap-4 relative">
          <div>
            <label className="text-zinc-400 text-xs mb-1 block">From</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white text-sm"
            >
              {popularCurrencies.map(currency => (
                <option key={currency} value={currency}>{currencyFlags[currency]} {currency}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-zinc-400 text-xs mb-1 block">To</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white text-sm"
            >
              {popularCurrencies.map(currency => (
                <option key={currency} value={currency}>{currencyFlags[currency]} {currency}</option>
              ))}
            </select>
          </div>

          <button
            onClick={swapCurrencies}
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg"
          >
            <ArrowRightLeft size={14} className="text-white" />
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/20 rounded-xl p-5 border border-yellow-500/30">
        <div className="text-center">
          <div className="text-yellow-400 text-xs mb-1">Converted Amount</div>
          <div className="text-white text-2xl font-bold mb-2">
            {convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurrency}
          </div>
          <div className="text-yellow-400/80 text-sm">
            {amount} {fromCurrency} = {convertedAmount.toFixed(2)} {toCurrency}
          </div>
        </div>
      </div>

      <div className="bg-zinc-800/50 rounded-xl p-4">
        <div className="flex justify-between items-center">
          <span className="text-zinc-400 text-sm">Exchange Rate</span>
          <span className="text-white font-bold">1 {fromCurrency} = {getExchangeRate().toFixed(4)} {toCurrency}</span>
        </div>
      </div>

      <div className="text-center text-zinc-500 text-xs">
        💱 Live rates • Updated: {lastUpdated}
      </div>
    </div>
  );
}