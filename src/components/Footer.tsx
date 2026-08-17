'use client';

import Link from 'next/link';
import { Zap, Twitter, Facebook, Instagram, Linkedin, Sparkles, Shield, Star, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Twitter, href: "#", color: "hover:text-blue-400" },
    { icon: Facebook, href: "#", color: "hover:text-blue-500" },
    { icon: Instagram, href: "#", color: "hover:text-pink-500" },
    { icon: Linkedin, href: "#", color: "hover:text-blue-400" },
  ];

  return (
    <footer className="relative bg-black border-t border-zinc-800/50 overflow-hidden">
      {/* Gradient Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/30 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-600/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Top Section with Newsletter */}
        <div className="mb-12 pb-8 border-b border-zinc-800/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                {/* Logo with transparent image - no gradient background */}
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
                <span className="text-xl font-bold">
                  Insight <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Pip</span>
                </span>
                <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full ml-2">TRUSTED</span>
              </div>
              <p className="text-zinc-400 text-sm max-w-md">
                Your trusted partner in finding the perfect trading environment. 
                Real reviews, verified payouts, and community insights.
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/20">
                <Shield size={14} className="text-green-500" />
                <span className="text-xs text-zinc-300">92% payout success</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20">
                <Star size={14} className="text-yellow-400" />
                <span className="text-xs text-zinc-300">10k+ reviews</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-full border border-red-500/20">
                <AlertTriangle size={14} className="text-red-400" />
                <span className="text-xs text-zinc-300">Live incidents</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">About</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/advertise" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Advertise
                </Link>
              </li>
            </ul>
          </div>

          {/* Prop Firms Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Prop Firms</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/prop-firms" className="text-zinc-400 hover:text-purple-400 transition-colors flex items-center gap-2 group">
                  <Sparkles size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  All Prop Firms
                </Link>
              </li>
              <li>
                <Link href="/prop-firms?filter=top-rated" className="text-zinc-400 hover:text-purple-400 transition-colors flex items-center gap-2 group">
                  <Star size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  Top Rated
                </Link>
              </li>
              <li>
                <Link href="/prop-firms?filter=best-payouts" className="text-zinc-400 hover:text-purple-400 transition-colors flex items-center gap-2 group">
                  <Zap size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  Best Payouts
                </Link>
              </li>
              <li>
                <Link href="/prop-firms?filter=instant-funding" className="text-zinc-400 hover:text-purple-400 transition-colors flex items-center gap-2 group">
                  <Shield size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  Instant Funding
                </Link>
              </li>
            </ul>
          </div>

          {/* Brokers Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Brokers</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/brokers" className="text-zinc-400 hover:text-blue-400 transition-colors flex items-center gap-2 group">
                  <Sparkles size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  All Brokers
                </Link>
              </li>
              <li>
                <Link href="/brokers?filter=regulated" className="text-zinc-400 hover:text-blue-400 transition-colors flex items-center gap-2 group">
                  <Shield size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  Regulated Brokers
                </Link>
              </li>
              <li>
                <Link href="/brokers?filter=low-spreads" className="text-zinc-400 hover:text-blue-400 transition-colors flex items-center gap-2 group">
                  <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  Low Spreads
                </Link>
              </li>
              <li>
                <Link href="/brokers?filter=crypto" className="text-zinc-400 hover:text-blue-400 transition-colors flex items-center gap-2 group">
                  <Zap size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  Crypto Brokers
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Social */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h4>
            <ul className="space-y-3 text-sm mb-6">
              <li>
                <Link href="/blog" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Blog & News
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Comparison Tool
                </Link>
              </li>
              <li>
                <Link href="/incidents" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Incident Reports
                </Link>
              </li>
              <li>
                <Link href="/offers" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Special Offers
                </Link>
              </li>
            </ul>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  className="p-2 bg-zinc-800/50 rounded-lg text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all duration-300 hover:scale-110"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-zinc-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-zinc-500 text-sm">
            © {currentYear} Insight Pip. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="text-zinc-500 hover:text-purple-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-zinc-500 hover:text-purple-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/disclaimer" className="text-zinc-500 hover:text-purple-400 transition-colors">
              Disclaimer
            </Link>
            <Link href="/cookies" className="text-zinc-500 hover:text-purple-400 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
        
        {/* Trust Badge */}
        <div className="mt-6 text-center">
          <p className="text-[10px] text-zinc-600">
            Data is community-reported and verified. Always conduct your own research before making financial decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}