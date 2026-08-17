// app/admin/brokers/page.tsx - COMPLETE WITH REGION SUPPORT
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit, Trash2, ArrowLeft, RefreshCw, Search,
  Building2, Globe, Calendar, DollarSign, TrendingUp,
  Shield, X, AlertCircle, CheckCircle, XCircle, Eye,
  CreditCard, Headphones, BookOpen, Award, Users,
  Target, BarChart3, Wallet, Smartphone, Laptop,
  Mail, Phone, MapPin, Flag, Star, Heart, Zap,
  Settings, Save, Upload, PlusCircle, MinusCircle,
  ChevronDown, ChevronUp, Activity, Gauge, Clock,
  ThumbsUp, ThumbsDown, Percent, Gift, Tag, Link as LinkIcon,
  Landmark, Scale, Banknote, BadgeCheck, HelpCircle,
  Info, Image, Video, FileText, Globe2, UploadCloud,
  Trash, Loader2, Twitter, Facebook, Youtube, Instagram,
  Linkedin, Github, Bitcoin, Award as AwardIcon, TrendingUp as TrendUp,
  Timer, AlertOctagon, Coffee, Rocket, ShieldCheck, Database,
  Layers, ListChecks, FileCheck, DollarSign as MoneyDollar,
  Timer as TimerIcon, ChartNoAxesCombined, Network, 
  Cloud, Bot, Code, ChartColumn, Newspaper, Handshake,
  Fingerprint, KeyRound, FileUser, Hourglass, DoorClosed,
  MessageCircle, Send, XCircle as XCircleIcon
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

// ============== HELPER COMPONENTS ==============

function ArrayInput({ label, values, onChange, placeholder }: { label: string; values: string[]; onChange: (values: string[]) => void; placeholder: string }) {
  const [inputValue, setInputValue] = useState('');

  const addItem = () => {
    if (inputValue.trim()) {
      onChange([...values, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeItem = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm text-zinc-400">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addItem()}
          placeholder={placeholder}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
        />
        <button type="button" onClick={addItem} className="px-3 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-500">
          <PlusCircle size={16} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((value, index) => (
          <div key={index} className="flex items-center gap-1 bg-zinc-800 rounded-lg px-2 py-1 border border-zinc-700">
            <span className="text-white text-sm">{value}</span>
            <button type="button" onClick={() => removeItem(index)} className="text-zinc-500 hover:text-red-400">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function KeyValueInput({ label, value, onChange, placeholderKey, placeholderValue, defaultFields = [] }: { 
  label: string; 
  value: Record<string, any>; 
  onChange: (value: Record<string, any>) => void; 
  placeholderKey: string; 
  placeholderValue: string;
  defaultFields?: { key: string; label: string; placeholder: string }[];
}) {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const addField = () => {
    if (newKey && newValue) {
      onChange({ ...value, [newKey]: newValue });
      setNewKey('');
      setNewValue('');
      setShowAdd(false);
    }
  };

  const removeField = (key: string) => {
    const newValue = { ...value };
    delete newValue[key];
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm text-zinc-400">{label}</label>
      
      {defaultFields.map((field) => (
        <div key={field.key} className="flex gap-2 mb-2">
          <span className="w-28 text-sm text-zinc-400">{field.label}</span>
          <input
            type="text"
            value={value[field.key] || ''}
            onChange={(e) => onChange({ ...value, [field.key]: e.target.value })}
            placeholder={field.placeholder}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm"
          />
        </div>
      ))}
      
      {Object.entries(value).map(([key, val]) => {
        if (defaultFields.some(f => f.key === key)) return null;
        return (
          <div key={key} className="flex gap-2 mb-2">
            <input
              type="text"
              value={key}
              onChange={(e) => {
                const newValue = { ...value };
                newValue[e.target.value] = newValue[key];
                delete newValue[key];
                onChange(newValue);
              }}
              className="w-28 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-white text-sm"
            />
            <input
              type="text"
              value={val as string}
              onChange={(e) => onChange({ ...value, [key]: e.target.value })}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-white text-sm"
            />
            <button type="button" onClick={() => removeField(key)} className="text-zinc-500 hover:text-red-400">
              <X size={16} />
            </button>
          </div>
        );
      })}
      
      {showAdd ? (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder={placeholderKey}
            className="w-28 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-white text-sm"
          />
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={placeholderValue}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-white text-sm"
          />
          <button type="button" onClick={addField} className="px-3 py-2 bg-green-600 rounded-lg text-white">Add</button>
          <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-2 bg-zinc-700 rounded-lg text-white">Cancel</button>
        </div>
      ) : (
        <button type="button" onClick={() => setShowAdd(true)} className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 mt-2">
          <PlusCircle size={14} /> Add custom field
        </button>
      )}
    </div>
  );
}

function InstrumentsDetailedInput({ value, onChange }: { value: Record<string, any>; onChange: (value: Record<string, any>) => void }) {
  const categories = [
    { key: 'forex', label: 'Forex Pairs', icon: TrendingUp },
    { key: 'commodities', label: 'Commodities', icon: TrendingUp },
    { key: 'indices', label: 'Stock Indices', icon: TrendingUp },
    { key: 'stocks', label: 'Stocks', icon: TrendingUp },
    { key: 'cryptocurrencies', label: 'Cryptocurrencies', icon: Bitcoin },
    { key: 'etfs', label: 'ETFs', icon: TrendingUp },
    { key: 'futures', label: 'Futures', icon: TrendingUp },
    { key: 'options', label: 'Options', icon: TrendingUp },
    { key: 'bonds', label: 'Bonds', icon: TrendingUp },
    { key: 'synthetic_indices', label: 'Synthetic Indices', icon: TrendingUp },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <div key={cat.key} className="bg-zinc-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className="text-purple-400" />
              <label className="text-sm text-zinc-300">{cat.label}</label>
            </div>
            <input
              type="number"
              value={value?.[cat.key] || ''}
              onChange={(e) => onChange({ ...value, [cat.key]: parseInt(e.target.value) || 0 })}
              placeholder="Number of instruments"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
        );
      })}
    </div>
  );
}

function LeverageOptionsInput({ value, onChange }: { value: Record<string, any>; onChange: (value: Record<string, any>) => void }) {
  const assetTypes = ['forex', 'crypto', 'indices', 'commodities', 'stocks', 'etfs'];

  return (
    <div className="grid grid-cols-2 gap-3">
      {assetTypes.map((asset) => (
        <div key={asset} className="bg-zinc-800/50 rounded-lg p-2">
          <label className="block text-xs text-zinc-400 capitalize mb-1">{asset}</label>
          <input
            type="text"
            value={value?.[asset] || ''}
            onChange={(e) => onChange({ ...value, [asset]: e.target.value })}
            placeholder="e.g., 1:500"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-white text-sm"
          />
        </div>
      ))}
    </div>
  );
}

function PaymentMethodDetail({ method, index, onChange, onRemove }: { method: any; index: number; onChange: (index: number, field: string, value: any) => void; onRemove: (index: number) => void }) {
  return (
    <div className="bg-zinc-800 rounded-lg p-3 mb-2 border border-zinc-700">
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input
          type="text"
          value={method.name || ''}
          onChange={(e) => onChange(index, 'name', e.target.value)}
          placeholder="Method name (e.g., Credit Card, Bank Transfer)"
          className="bg-zinc-700 rounded px-2 py-1.5 text-white text-sm"
        />
        <input
          type="text"
          value={method.processingTime || ''}
          onChange={(e) => onChange(index, 'processingTime', e.target.value)}
          placeholder="Processing time (e.g., Instant, 1-3 days)"
          className="bg-zinc-700 rounded px-2 py-1.5 text-white text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input
          type="number"
          value={method.minAmount || ''}
          onChange={(e) => onChange(index, 'minAmount', parseFloat(e.target.value) || 0)}
          placeholder="Min amount ($)"
          className="bg-zinc-700 rounded px-2 py-1.5 text-white text-sm"
        />
        <input
          type="number"
          value={method.maxAmount || ''}
          onChange={(e) => onChange(index, 'maxAmount', parseFloat(e.target.value) || 0)}
          placeholder="Max amount ($)"
          className="bg-zinc-700 rounded px-2 py-1.5 text-white text-sm"
        />
      </div>
      <input
        type="text"
        value={method.fee || ''}
        onChange={(e) => onChange(index, 'fee', e.target.value)}
        placeholder="Fee (e.g., Free, 2%)"
        className="w-full bg-zinc-700 rounded px-2 py-1.5 text-white text-sm mb-2"
      />
      <button onClick={() => onRemove(index)} className="text-xs text-red-400">Remove</button>
    </div>
  );
}

function SocialMediaInput({ value, onChange }: { value: Record<string, string>; onChange: (value: Record<string, string>) => void }) {
  const platforms = [
    { key: 'twitter', label: 'Twitter/X', icon: Twitter, placeholder: 'https://twitter.com/deriv' },
    { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/deriv' },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/company/deriv' },
    { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/c/deriv' },
    { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/deriv' },
    { key: 'telegram', label: 'Telegram', icon: Send, placeholder: 'https://t.me/deriv' },
  ];

  return (
    <div className="space-y-3">
      {platforms.map((platform) => {
        const Icon = platform.icon;
        return (
          <div key={platform.key} className="flex items-center gap-3">
            <Icon size={18} className="text-zinc-400" />
            <input
              type="url"
              value={value?.[platform.key] || ''}
              onChange={(e) => onChange({ ...value, [platform.key]: e.target.value })}
              placeholder={platform.placeholder}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
        );
      })}
    </div>
  );
}

// Logo Upload Component
function LogoUpload({ currentLogo, onLogoUploaded, onLogoRemoved }: { 
  currentLogo: string; 
  onLogoUploaded: (url: string) => void; 
  onLogoRemoved: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG, WEBP)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'broker');

    try {
      const response = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: formData });
      const data = await response.json();
      if (response.ok && data.url) onLogoUploaded(data.url);
      else alert(data.error || 'Failed to upload logo');
    } catch (error) {
      alert('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm text-zinc-400 flex items-center gap-2">
        <Image size={16} /> Broker Logo
        <div className="group relative">
          <HelpCircle size={14} className="text-zinc-500 cursor-help" />
          <div className="absolute bottom-full left-0 mb-2 w-72 p-2 bg-zinc-800 rounded-lg text-xs text-zinc-400 hidden group-hover:block z-20">
            <p className="font-bold text-white mb-1">Logo Guidelines:</p>
            <p>• Recommended: 200x200 pixels</p>
            <p>• Formats: PNG, JPG, SVG, WEBP</p>
            <p>• Max size: 2MB</p>
            <p>• Transparent background preferred</p>
          </div>
        </div>
      </label>

      <div
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          dragActive ? 'border-purple-500 bg-purple-500/10' : 'border-zinc-700 hover:border-purple-500/50 bg-zinc-800/30'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
      >
        {currentLogo ? (
          <div className="flex flex-col items-center gap-3">
            <div className="relative group/image">
              <img src={currentLogo} alt="Broker logo preview" className="w-24 h-24 rounded-xl object-contain bg-zinc-800 p-2 border border-zinc-700" />
              <button type="button" onClick={onLogoRemoved} className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white">
                <Trash size={12} />
              </button>
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-purple-400 flex items-center gap-1">
              <RefreshCw size={12} /> Replace Logo
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-xl bg-zinc-800 flex items-center justify-center">
              {uploading ? <Loader2 size={24} className="text-purple-400 animate-spin" /> : <UploadCloud size={24} className="text-zinc-500" />}
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="px-4 py-2 bg-purple-600 rounded-lg text-white text-sm">
              {uploading ? 'Uploading...' : 'Upload Logo'}
            </button>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(file); }} className="hidden" />
      </div>
    </div>
  );
}

// Bonus Item Component
function BonusItem({ bonus, index, onChange, onRemove }: { bonus: any; index: number; onChange: (index: number, field: string, value: any) => void; onRemove: (index: number) => void }) {
  const regionOptions = ['GLOBAL', 'SA', 'EU', 'UK', 'UAE', 'KE', 'AU', 'SG', 'US', 'CA'];
  const regionDisplay: Record<string, string> = {
    'GLOBAL': '🌍 Global', 'SA': '🇿🇦 SA', 'EU': '🇪🇺 EU', 'UK': '🇬🇧 UK', 'UAE': '🇦🇪 UAE',
    'KE': '🇰🇪 KE', 'AU': '🇦🇺 AU', 'SG': '🇸🇬 SG', 'US': '🇺🇸 US', 'CA': '🇨🇦 CA'
  };

  return (
    <div className="bg-zinc-800 rounded-lg p-3 mb-2 border border-zinc-700">
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input type="text" value={bonus.type || ''} onChange={(e) => onChange(index, 'type', e.target.value)} placeholder="Type (Deposit Bonus, No Deposit)" className="bg-zinc-700 rounded px-2 py-1.5 text-white text-sm" />
        <input type="text" value={bonus.amount || ''} onChange={(e) => onChange(index, 'amount', e.target.value)} placeholder="Amount (100% up to $500)" className="bg-zinc-700 rounded px-2 py-1.5 text-white text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input type="text" value={bonus.code || ''} onChange={(e) => onChange(index, 'code', e.target.value)} placeholder="Promo Code" className="bg-zinc-700 rounded px-2 py-1.5 text-white text-sm" />
        <input type="text" value={bonus.expiry || ''} onChange={(e) => onChange(index, 'expiry', e.target.value)} placeholder="Expiry (Ongoing)" className="bg-zinc-700 rounded px-2 py-1.5 text-white text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div>
          <label className="text-xs text-zinc-400 block">Regions</label>
          <select 
            multiple 
            value={bonus.regions || ['GLOBAL']} 
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              onChange(index, 'regions', selected);
            }}
            className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-white text-xs"
          >
            {regionOptions.map(r => (
              <option key={r} value={r}>{regionDisplay[r] || r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-zinc-400 block">Restricted</label>
          <select 
            multiple 
            value={bonus.restrictedRegions || []} 
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              onChange(index, 'restrictedRegions', selected);
            }}
            className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-white text-xs"
          >
            {regionOptions.map(r => (
              <option key={r} value={r}>{regionDisplay[r] || r}</option>
            ))}
          </select>
        </div>
      </div>
      <textarea value={bonus.conditions || ''} onChange={(e) => onChange(index, 'conditions', e.target.value)} placeholder="Terms & Conditions" rows={2} className="w-full bg-zinc-700 rounded px-2 py-1.5 text-white text-sm mt-2 resize-none" />
      <button onClick={() => onRemove(index)} className="mt-2 text-xs text-red-400">Remove</button>
    </div>
  );
}

// Promotion Item Component - WITH REGION SUPPORT
function PromotionItem({ promotion, index, onChange, onRemove }: { promotion: any; index: number; onChange: (index: number, field: string, value: any) => void; onRemove: (index: number) => void }) {
  const regionOptions = ['GLOBAL', 'SA', 'EU', 'UK', 'UAE', 'KE', 'AU', 'SG', 'US', 'CA'];
  const regionDisplay: Record<string, string> = {
    'GLOBAL': '🌍 Global', 'SA': '🇿🇦 SA', 'EU': '🇪🇺 EU', 'UK': '🇬🇧 UK', 'UAE': '🇦🇪 UAE',
    'KE': '🇰🇪 KE', 'AU': '🇦🇺 AU', 'SG': '🇸🇬 SG', 'US': '🇺🇸 US', 'CA': '🇨🇦 CA'
  };

  return (
    <div className="bg-zinc-800 rounded-lg p-3 mb-2 border border-zinc-700">
      <div className="grid grid-cols-3 gap-2 mb-2">
        <input 
          type="text" 
          value={promotion.name || ''} 
          onChange={(e) => onChange(index, 'name', e.target.value)} 
          placeholder="Promotion Name" 
          className="bg-zinc-700 rounded px-2 py-1.5 text-white text-sm" 
        />
        <input 
          type="text" 
          value={promotion.discount || ''} 
          onChange={(e) => onChange(index, 'discount', e.target.value)} 
          placeholder="Discount (e.g., 100%)" 
          className="bg-zinc-700 rounded px-2 py-1.5 text-white text-sm" 
        />
        <input 
          type="text" 
          value={promotion.code || ''} 
          onChange={(e) => onChange(index, 'code', e.target.value)} 
          placeholder="Promo Code" 
          className="bg-zinc-700 rounded px-2 py-1.5 text-white text-sm" 
        />
      </div>
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div>
          <label className="text-xs text-zinc-400 block">Regions</label>
          <select 
            multiple 
            value={promotion.regions || ['GLOBAL']} 
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              onChange(index, 'regions', selected);
            }}
            className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-white text-xs"
          >
            {regionOptions.map(r => (
              <option key={r} value={r}>{regionDisplay[r] || r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-zinc-400 block">Restricted</label>
          <select 
            multiple 
            value={promotion.restrictedRegions || []} 
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              onChange(index, 'restrictedRegions', selected);
            }}
            className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-white text-xs"
          >
            {regionOptions.map(r => (
              <option key={r} value={r}>{regionDisplay[r] || r}</option>
            ))}
          </select>
        </div>
        <input 
          type="date" 
          value={promotion.validUntil || ''} 
          onChange={(e) => onChange(index, 'validUntil', e.target.value)} 
          className="bg-zinc-700 rounded px-2 py-1.5 text-white text-sm" 
        />
      </div>
      <input 
        type="text" 
        value={promotion.description || ''} 
        onChange={(e) => onChange(index, 'description', e.target.value)} 
        placeholder="Description" 
        className="w-full bg-zinc-700 rounded px-2 py-1.5 text-white text-sm mb-2" 
      />
      <button onClick={() => onRemove(index)} className="text-xs text-red-400">Remove</button>
    </div>
  );
}

// Account Type Component
function AccountTypeItem({ account, index, onChange, onRemove }: { account: any; index: number; onChange: (index: number, field: string, value: any) => void; onRemove: (index: number) => void }) {
  return (
    <div className="bg-zinc-800 rounded-lg p-3 mb-2 border border-zinc-700">
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input type="text" value={account.name || ''} onChange={(e) => onChange(index, 'name', e.target.value)} placeholder="Account Name" className="bg-zinc-700 rounded px-2 py-1.5 text-white text-sm" />
        <input type="number" value={account.minDeposit || ''} onChange={(e) => onChange(index, 'minDeposit', parseFloat(e.target.value) || 0)} placeholder="Min Deposit" className="bg-zinc-700 rounded px-2 py-1.5 text-white text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input type="text" value={account.commission || ''} onChange={(e) => onChange(index, 'commission', e.target.value)} placeholder="Commission" className="bg-zinc-700 rounded px-2 py-1.5 text-white text-sm" />
        <input type="text" value={account.spreadType || ''} onChange={(e) => onChange(index, 'spreadType', e.target.value)} placeholder="Spread Type" className="bg-zinc-700 rounded px-2 py-1.5 text-white text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input type="text" value={account.leverage || ''} onChange={(e) => onChange(index, 'leverage', e.target.value)} placeholder="Max Leverage" className="bg-zinc-700 rounded px-2 py-1.5 text-white text-sm" />
        <input type="text" value={account.baseCurrencies || ''} onChange={(e) => onChange(index, 'baseCurrencies', e.target.value)} placeholder="Base Currencies (e.g., USD, EUR)" className="bg-zinc-700 rounded px-2 py-1.5 text-white text-sm" />
      </div>
      <label className="flex items-center gap-2 mt-2">
        <input type="checkbox" checked={account.swapFree || false} onChange={(e) => onChange(index, 'swapFree', e.target.checked)} />
        <span className="text-sm text-zinc-400">Swap Free (Islamic Account)</span>
      </label>
      <button onClick={() => onRemove(index)} className="mt-2 text-xs text-red-400">Remove</button>
    </div>
  );
}

export default function AdminBrokersPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBroker, setEditingBroker] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set([
    'basic', 'regions', 'trading', 'ratings', 'trust', 'incidents', 'features', 'instruments', 
    'accountTypes', 'payments', 'support', 'bonuses', 'promotions', 'regulatory', 
    'security', 'social', 'metadata'
  ]));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    // ===== CORE IDENTIFICATION =====
    name: '', status: 'ACTIVE',
    
    // ===== BASIC INFORMATION =====
    description: '', shortDescription: '', logo: '', founded: '', headquarters: '', website: '',
    contactEmail: '', contactPhone: '', corporateAddress: '',
    
    // ===== CLASSIFICATION =====
    type: 'Broker', category: 'Multi-asset', targetAudience: [] as string[],
    accountCurrencies: [] as string[],
    
    // ===== REGION SETTINGS =====
    regions: ['GLOBAL'] as string[],
    restrictedRegions: [] as string[],
    regionNotes: '',
    regionDescriptions: {} as Record<string, string>,
    regionPricing: {} as Record<string, { minDeposit?: number; leverage?: string }>,
    regionPaymentMethods: {} as Record<string, string>,
    
    // ===== REGULATION & SAFETY =====
    regulated: false, regulation: {} as Record<string, any>, safetyScore: '',
    regulatoryWarnings: [] as string[], entityMapping: {} as Record<string, string>,
    
    // ===== RATINGS =====
    rating: '', reviewsCount: '', expertRating: '',
    avgOverallRating: '', avgServiceRating: '', avgPlatformRating: '', avgValueRating: '', avgSupportRating: '',
    avgWithdrawalExperience: '', avgDepositExperience: '', avgCustomerSupport: '', avgTradingExperience: '', avgReliability: '',
    
    // ===== TRUST SCORE =====
    avgTrustScore: '', avgWithdrawalSuccess: '', avgExecutionQuality: '', recommendationRate: '',
    withdrawalStats: {} as Record<string, any>, accountIssueStats: {} as Record<string, any>,
    
    // ===== INCIDENT METRICS =====
    totalIncidents: '', incidentsLast7Days: '', incidentsLast30Days: '',
    withdrawalReports: '', withdrawalDelays: '', withdrawalConfirmed: '', withdrawalRejected: '',
    executionComplaints: '', slippageReports: '', spreadSpikeReports: '',
    platformIssues: '', serverDownReports: '',
    accountBansReported: '', accountSuspensions: '',
    resolvedIncidents: '', disputedIncidents: '', lastIncidentAt: '',
    
    // ===== TRADING CONDITIONS =====
    minDeposit: '', leverage: '', 
    spreads: {} as Record<string, any>, commissions: {} as Record<string, any>, leverageOptions: {} as Record<string, any>,
    minTradeSize: '', maxTradeSize: '', marginCall: '', stopOutLevel: '', orderExecution: 'Market Execution',
    tradingHours: '', swapRates: '', commissionNotes: '',
    
    // ===== FEATURES =====
    features: [] as string[], platforms: [] as string[], instruments: {} as Record<string, any>,
    copyTradingAvailable: false, socialTradingAvailable: false, vpsAvailable: false, apiAvailable: false,
    chartingTools: [] as string[], economicCalendar: false, newsTrading: false,
    mobileAppRating: '', desktopPlatformRating: '',
    
    // ===== ACCOUNT TYPES =====
    demoAccount: false, islamicAccount: false, accountTypes: [] as any[],
    
    // ===== PAYMENT METHODS =====
    depositMethods: [] as string[], withdrawalMethods: [] as string[], 
    depositMethodsDetails: [] as any[], withdrawalMethodsDetails: [] as any[],
    withdrawalFee: '', minWithdrawal: '', withdrawalProcessingTime: '', depositProcessingTime: '',
    inactivityFee: '', accountClosurePolicy: '',
    
    // ===== CUSTOMER SUPPORT =====
    supportLanguages: [] as string[], supportAvailability: '24/5',
    hasEducation: false, educationTypes: [] as string[],
    
    // ===== BONUSES & PROMOTIONS =====
    bonuses: [] as any[], promotions: [] as any[],
    
    // ===== PARTNERSHIP PROGRAMS =====
    partnershipPrograms: [] as string[], ibProgramAvailable: false, affiliateProgramAvailable: false,
    
    // ===== SECURITY =====
    securityFeatures: [] as string[], accountVerification: '', twoFactorAuth: false,
    
    // ===== SOCIAL MEDIA =====
    socialMedia: {} as Record<string, string>,
    
    // ===== AWARDS & RECOGNITION =====
    awards: [] as string[], pressReleases: [] as any[],
    
    // ===== METADATA =====
    trustScore: '', isRecommended: false,
    country: '', yearsInOperation: '', assets: '', promo: '', maxAllocation: '', payout: '',
    bonusOffer: '', bonus: '', highlight: '', signupLink: '', accountSize: '',
  });

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) newExpanded.delete(section);
    else newExpanded.add(section);
    setExpandedSections(newExpanded);
  };

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
      return;
    }
    if (user?.role === 'ADMIN') {
      fetchBrokers();
    }
  }, [user, isLoading]);

  const fetchBrokers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/brokers', { credentials: 'include' });
      const data = await response.json();
      if (data.success) setBrokers(data.brokers);
    } catch (error) {
      console.error('Error fetching brokers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this broker? This cannot be undone.')) return;
    try {
      const response = await fetch(`/api/admin/brokers?id=${id}`, { method: 'DELETE', credentials: 'include' });
      if (response.ok) fetchBrokers();
    } catch (error) {
      console.error('Error deleting broker:', error);
    }
  };

  // Bonus handlers
  const updateBonus = (index: number, field: string, value: any) => {
    const newBonuses = [...formData.bonuses];
    newBonuses[index] = { ...newBonuses[index], [field]: value };
    setFormData({ ...formData, bonuses: newBonuses });
  };
  const addBonus = () => setFormData({ ...formData, bonuses: [...formData.bonuses, { type: '', amount: '', code: '', expiry: '', conditions: '', regions: ['GLOBAL'], restrictedRegions: [] }] });
  const removeBonus = (index: number) => setFormData({ ...formData, bonuses: formData.bonuses.filter((_, i) => i !== index) });

  // Promotion handlers
  const updatePromotion = (index: number, field: string, value: any) => {
    const newPromotions = [...formData.promotions];
    newPromotions[index] = { ...newPromotions[index], [field]: value };
    setFormData({ ...formData, promotions: newPromotions });
  };
  const addPromotion = () => setFormData({ 
    ...formData, 
    promotions: [...formData.promotions, { 
      name: '', 
      description: '', 
      discount: '', 
      code: '', 
      validUntil: '',
      regions: ['GLOBAL'],
      restrictedRegions: []
    }] 
  });
  const removePromotion = (index: number) => setFormData({ ...formData, promotions: formData.promotions.filter((_, i) => i !== index) });

  // Account Type handlers
  const updateAccountType = (index: number, field: string, value: any) => {
    const newAccountTypes = [...formData.accountTypes];
    newAccountTypes[index] = { ...newAccountTypes[index], [field]: value };
    setFormData({ ...formData, accountTypes: newAccountTypes });
  };
  const addAccountType = () => setFormData({ ...formData, accountTypes: [...formData.accountTypes, { name: '', minDeposit: 0, commission: '', spreadType: '', leverage: '', baseCurrencies: '', swapFree: false }] });
  const removeAccountType = (index: number) => setFormData({ ...formData, accountTypes: formData.accountTypes.filter((_, i) => i !== index) });

  // Payment method detail handlers
  const updateDepositMethodDetail = (index: number, field: string, value: any) => {
    const newMethods = [...formData.depositMethodsDetails];
    newMethods[index] = { ...newMethods[index], [field]: value };
    setFormData({ ...formData, depositMethodsDetails: newMethods });
  };
  const addDepositMethodDetail = () => setFormData({ ...formData, depositMethodsDetails: [...formData.depositMethodsDetails, { name: '', processingTime: '', minAmount: '', maxAmount: '', fee: '' }] });
  const removeDepositMethodDetail = (index: number) => setFormData({ ...formData, depositMethodsDetails: formData.depositMethodsDetails.filter((_, i) => i !== index) });

  const updateWithdrawalMethodDetail = (index: number, field: string, value: any) => {
    const newMethods = [...formData.withdrawalMethodsDetails];
    newMethods[index] = { ...newMethods[index], [field]: value };
    setFormData({ ...formData, withdrawalMethodsDetails: newMethods });
  };
  const addWithdrawalMethodDetail = () => setFormData({ ...formData, withdrawalMethodsDetails: [...formData.withdrawalMethodsDetails, { name: '', processingTime: '', minAmount: '', maxAmount: '', fee: '' }] });
  const removeWithdrawalMethodDetail = (index: number) => setFormData({ ...formData, withdrawalMethodsDetails: formData.withdrawalMethodsDetails.filter((_, i) => i !== index) });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload: any = {
        // Core
        name: formData.name, status: formData.status,
        // Basic
        description: formData.description, shortDescription: formData.shortDescription, logo: formData.logo,
        founded: formData.founded ? parseInt(formData.founded) : null,
        headquarters: formData.headquarters, website: formData.website,
        contactEmail: formData.contactEmail, contactPhone: formData.contactPhone, corporateAddress: formData.corporateAddress,
        // Classification
        type: formData.type, category: formData.category, targetAudience: formData.targetAudience,
        accountCurrencies: formData.accountCurrencies,
        // Region Settings
        regions: formData.regions || ['GLOBAL'],
        restrictedRegions: formData.restrictedRegions || [],
        regionNotes: formData.regionNotes || null,
        regionDescriptions: formData.regionDescriptions || null,
        regionPricing: formData.regionPricing || null,
        regionPaymentMethods: formData.regionPaymentMethods || null,
        // Regulation
        regulated: formData.regulated, regulation: formData.regulation, safetyScore: formData.safetyScore ? parseFloat(formData.safetyScore) : null,
        regulatoryWarnings: formData.regulatoryWarnings, entityMapping: formData.entityMapping,
        // Ratings
        rating: formData.rating ? parseFloat(formData.rating) : null, reviewsCount: formData.reviewsCount ? parseInt(formData.reviewsCount) : 0,
        expertRating: formData.expertRating ? parseFloat(formData.expertRating) : null,
        avgOverallRating: formData.avgOverallRating ? parseFloat(formData.avgOverallRating) : null,
        avgServiceRating: formData.avgServiceRating ? parseFloat(formData.avgServiceRating) : null,
        avgPlatformRating: formData.avgPlatformRating ? parseFloat(formData.avgPlatformRating) : null,
        avgValueRating: formData.avgValueRating ? parseFloat(formData.avgValueRating) : null,
        avgSupportRating: formData.avgSupportRating ? parseFloat(formData.avgSupportRating) : null,
        avgWithdrawalExperience: formData.avgWithdrawalExperience ? parseFloat(formData.avgWithdrawalExperience) : null,
        avgDepositExperience: formData.avgDepositExperience ? parseFloat(formData.avgDepositExperience) : null,
        avgCustomerSupport: formData.avgCustomerSupport ? parseFloat(formData.avgCustomerSupport) : null,
        avgTradingExperience: formData.avgTradingExperience ? parseFloat(formData.avgTradingExperience) : null,
        avgReliability: formData.avgReliability ? parseFloat(formData.avgReliability) : null,
        // Trust
        avgTrustScore: formData.avgTrustScore ? parseFloat(formData.avgTrustScore) : null,
        avgWithdrawalSuccess: formData.avgWithdrawalSuccess ? parseFloat(formData.avgWithdrawalSuccess) : null,
        avgExecutionQuality: formData.avgExecutionQuality ? parseFloat(formData.avgExecutionQuality) : null,
        recommendationRate: formData.recommendationRate ? parseFloat(formData.recommendationRate) : null,
        withdrawalStats: formData.withdrawalStats, accountIssueStats: formData.accountIssueStats,
        // Incidents
        totalIncidents: formData.totalIncidents ? parseInt(formData.totalIncidents) : 0,
        incidentsLast7Days: formData.incidentsLast7Days ? parseInt(formData.incidentsLast7Days) : 0,
        incidentsLast30Days: formData.incidentsLast30Days ? parseInt(formData.incidentsLast30Days) : 0,
        withdrawalReports: formData.withdrawalReports ? parseInt(formData.withdrawalReports) : 0,
        withdrawalDelays: formData.withdrawalDelays ? parseInt(formData.withdrawalDelays) : 0,
        withdrawalConfirmed: formData.withdrawalConfirmed ? parseInt(formData.withdrawalConfirmed) : 0,
        withdrawalRejected: formData.withdrawalRejected ? parseInt(formData.withdrawalRejected) : 0,
        executionComplaints: formData.executionComplaints ? parseInt(formData.executionComplaints) : 0,
        slippageReports: formData.slippageReports ? parseInt(formData.slippageReports) : 0,
        spreadSpikeReports: formData.spreadSpikeReports ? parseInt(formData.spreadSpikeReports) : 0,
        platformIssues: formData.platformIssues ? parseInt(formData.platformIssues) : 0,
        serverDownReports: formData.serverDownReports ? parseInt(formData.serverDownReports) : 0,
        accountBansReported: formData.accountBansReported ? parseInt(formData.accountBansReported) : 0,
        accountSuspensions: formData.accountSuspensions ? parseInt(formData.accountSuspensions) : 0,
        resolvedIncidents: formData.resolvedIncidents ? parseInt(formData.resolvedIncidents) : 0,
        disputedIncidents: formData.disputedIncidents ? parseInt(formData.disputedIncidents) : 0,
        lastIncidentAt: formData.lastIncidentAt ? new Date(formData.lastIncidentAt).toISOString() : null,
        // Trading
        minDeposit: formData.minDeposit ? parseFloat(formData.minDeposit) : null,
        leverage: formData.leverage, spreads: formData.spreads, commissions: formData.commissions,
        leverageOptions: formData.leverageOptions, minTradeSize: formData.minTradeSize, maxTradeSize: formData.maxTradeSize,
        marginCall: formData.marginCall, stopOutLevel: formData.stopOutLevel, orderExecution: formData.orderExecution,
        tradingHours: formData.tradingHours, swapRates: formData.swapRates, commissionNotes: formData.commissionNotes,
        // Features
        features: formData.features, platforms: formData.platforms, instruments: formData.instruments,
        copyTradingAvailable: formData.copyTradingAvailable, socialTradingAvailable: formData.socialTradingAvailable,
        vpsAvailable: formData.vpsAvailable, apiAvailable: formData.apiAvailable,
        chartingTools: formData.chartingTools, economicCalendar: formData.economicCalendar, newsTrading: formData.newsTrading,
        mobileAppRating: formData.mobileAppRating, desktopPlatformRating: formData.desktopPlatformRating,
        // Account
        demoAccount: formData.demoAccount, islamicAccount: formData.islamicAccount, accountTypes: formData.accountTypes,
        // Payments
        depositMethods: formData.depositMethods, withdrawalMethods: formData.withdrawalMethods,
        depositMethodsDetails: formData.depositMethodsDetails, withdrawalMethodsDetails: formData.withdrawalMethodsDetails,
        withdrawalFee: formData.withdrawalFee, minWithdrawal: formData.minWithdrawal ? parseFloat(formData.minWithdrawal) : null,
        withdrawalProcessingTime: formData.withdrawalProcessingTime, depositProcessingTime: formData.depositProcessingTime,
        inactivityFee: formData.inactivityFee, accountClosurePolicy: formData.accountClosurePolicy,
        // Support
        supportLanguages: formData.supportLanguages, supportAvailability: formData.supportAvailability,
        hasEducation: formData.hasEducation, educationTypes: formData.educationTypes,
        // Bonuses & Promotions
        bonuses: formData.bonuses, promotions: formData.promotions,
        // Partnerships
        partnershipPrograms: formData.partnershipPrograms, ibProgramAvailable: formData.ibProgramAvailable,
        affiliateProgramAvailable: formData.affiliateProgramAvailable,
        // Security
        securityFeatures: formData.securityFeatures, accountVerification: formData.accountVerification,
        twoFactorAuth: formData.twoFactorAuth,
        // Social
        socialMedia: formData.socialMedia,
        // Awards
        awards: formData.awards, pressReleases: formData.pressReleases,
        // Metadata
        trustScore: formData.trustScore ? parseInt(formData.trustScore) : null,
        isRecommended: formData.isRecommended, country: formData.country,
        yearsInOperation: formData.yearsInOperation ? parseInt(formData.yearsInOperation) : null,
        assets: formData.assets, promo: formData.promo,
        maxAllocation: formData.maxAllocation ? parseFloat(formData.maxAllocation) : null,
        payout: formData.payout ? parseFloat(formData.payout) : null,
        bonusOffer: formData.bonusOffer, bonus: formData.bonus, highlight: formData.highlight,
        signupLink: formData.signupLink, accountSize: formData.accountSize ? parseFloat(formData.accountSize) : null,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      };

      const url = editingBroker ? `/api/admin/brokers/${editingBroker.id}` : '/api/admin/brokers';
      const method = editingBroker ? 'PUT' : 'POST';

      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save');

      setSuccess(editingBroker ? 'Broker updated!' : 'Broker created!');
      setTimeout(() => setSuccess(''), 3000);
      setShowModal(false);
      setEditingBroker(null);
      resetForm();
      fetchBrokers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', status: 'ACTIVE',
      description: '', shortDescription: '', logo: '', founded: '', headquarters: '', website: '',
      contactEmail: '', contactPhone: '', corporateAddress: '',
      type: 'Broker', category: 'Multi-asset', targetAudience: [], accountCurrencies: [],
      regions: ['GLOBAL'], restrictedRegions: [], regionNotes: '', regionDescriptions: {}, regionPricing: {}, regionPaymentMethods: {},
      regulated: false, regulation: {}, safetyScore: '', regulatoryWarnings: [], entityMapping: {},
      rating: '', reviewsCount: '', expertRating: '',
      avgOverallRating: '', avgServiceRating: '', avgPlatformRating: '', avgValueRating: '', avgSupportRating: '',
      avgWithdrawalExperience: '', avgDepositExperience: '', avgCustomerSupport: '', avgTradingExperience: '', avgReliability: '',
      avgTrustScore: '', avgWithdrawalSuccess: '', avgExecutionQuality: '', recommendationRate: '',
      withdrawalStats: {}, accountIssueStats: {},
      totalIncidents: '', incidentsLast7Days: '', incidentsLast30Days: '',
      withdrawalReports: '', withdrawalDelays: '', withdrawalConfirmed: '', withdrawalRejected: '',
      executionComplaints: '', slippageReports: '', spreadSpikeReports: '',
      platformIssues: '', serverDownReports: '',
      accountBansReported: '', accountSuspensions: '',
      resolvedIncidents: '', disputedIncidents: '', lastIncidentAt: '',
      minDeposit: '', leverage: '', spreads: {}, commissions: {}, leverageOptions: {},
      minTradeSize: '', maxTradeSize: '', marginCall: '', stopOutLevel: '', orderExecution: 'Market Execution',
      tradingHours: '', swapRates: '', commissionNotes: '',
      features: [], platforms: [], instruments: {},
      copyTradingAvailable: false, socialTradingAvailable: false, vpsAvailable: false, apiAvailable: false,
      chartingTools: [], economicCalendar: false, newsTrading: false,
      mobileAppRating: '', desktopPlatformRating: '',
      demoAccount: false, islamicAccount: false, accountTypes: [],
      depositMethods: [], withdrawalMethods: [], depositMethodsDetails: [], withdrawalMethodsDetails: [],
      withdrawalFee: '', minWithdrawal: '', withdrawalProcessingTime: '', depositProcessingTime: '',
      inactivityFee: '', accountClosurePolicy: '',
      supportLanguages: [], supportAvailability: '24/5',
      hasEducation: false, educationTypes: [],
      bonuses: [], promotions: [],
      partnershipPrograms: [], ibProgramAvailable: false, affiliateProgramAvailable: false,
      securityFeatures: [], accountVerification: '', twoFactorAuth: false,
      socialMedia: {},
      awards: [], pressReleases: [],
      trustScore: '', isRecommended: false,
      country: '', yearsInOperation: '', assets: '', promo: '', maxAllocation: '', payout: '',
      bonusOffer: '', bonus: '', highlight: '', signupLink: '', accountSize: '',
    });
  };

  const openEditModal = (broker: any) => {
    setEditingBroker(broker);
    setFormData({
      name: broker.name || '', status: broker.status || 'ACTIVE',
      description: broker.description || '', shortDescription: broker.shortDescription || '',
      logo: broker.logo || '', founded: broker.founded?.toString() || '',
      headquarters: broker.headquarters || '', website: broker.website || '',
      contactEmail: broker.contactEmail || '', contactPhone: broker.contactPhone || '',
      corporateAddress: broker.corporateAddress || '',
      type: broker.type || 'Broker', category: broker.category || 'Multi-asset',
      targetAudience: broker.targetAudience || [], accountCurrencies: broker.accountCurrencies || [],
      regions: broker.regions || ['GLOBAL'], restrictedRegions: broker.restrictedRegions || [],
      regionNotes: broker.regionNotes || '', regionDescriptions: broker.regionDescriptions || {},
      regionPricing: broker.regionPricing || {}, regionPaymentMethods: broker.regionPaymentMethods || {},
      regulated: broker.regulated || false, regulation: broker.regulation || {},
      safetyScore: broker.safetyScore?.toString() || '', regulatoryWarnings: broker.regulatoryWarnings || [],
      entityMapping: broker.entityMapping || {},
      rating: broker.rating?.toString() || '', reviewsCount: broker.reviewsCount?.toString() || '',
      expertRating: broker.expertRating?.toString() || '',
      avgOverallRating: broker.avgOverallRating?.toString() || '',
      avgServiceRating: broker.avgServiceRating?.toString() || '',
      avgPlatformRating: broker.avgPlatformRating?.toString() || '',
      avgValueRating: broker.avgValueRating?.toString() || '',
      avgSupportRating: broker.avgSupportRating?.toString() || '',
      avgWithdrawalExperience: broker.avgWithdrawalExperience?.toString() || '',
      avgDepositExperience: broker.avgDepositExperience?.toString() || '',
      avgCustomerSupport: broker.avgCustomerSupport?.toString() || '',
      avgTradingExperience: broker.avgTradingExperience?.toString() || '',
      avgReliability: broker.avgReliability?.toString() || '',
      avgTrustScore: broker.avgTrustScore?.toString() || '',
      avgWithdrawalSuccess: broker.avgWithdrawalSuccess?.toString() || '',
      avgExecutionQuality: broker.avgExecutionQuality?.toString() || '',
      recommendationRate: broker.recommendationRate?.toString() || '',
      withdrawalStats: broker.withdrawalStats || {}, accountIssueStats: broker.accountIssueStats || {},
      totalIncidents: broker.totalIncidents?.toString() || '',
      incidentsLast7Days: broker.incidentsLast7Days?.toString() || '',
      incidentsLast30Days: broker.incidentsLast30Days?.toString() || '',
      withdrawalReports: broker.withdrawalReports?.toString() || '',
      withdrawalDelays: broker.withdrawalDelays?.toString() || '',
      withdrawalConfirmed: broker.withdrawalConfirmed?.toString() || '',
      withdrawalRejected: broker.withdrawalRejected?.toString() || '',
      executionComplaints: broker.executionComplaints?.toString() || '',
      slippageReports: broker.slippageReports?.toString() || '',
      spreadSpikeReports: broker.spreadSpikeReports?.toString() || '',
      platformIssues: broker.platformIssues?.toString() || '',
      serverDownReports: broker.serverDownReports?.toString() || '',
      accountBansReported: broker.accountBansReported?.toString() || '',
      accountSuspensions: broker.accountSuspensions?.toString() || '',
      resolvedIncidents: broker.resolvedIncidents?.toString() || '',
      disputedIncidents: broker.disputedIncidents?.toString() || '',
      lastIncidentAt: broker.lastIncidentAt?.split('T')[0] || '',
      minDeposit: broker.minDeposit?.toString() || '',
      leverage: broker.maxLeverage || '', spreads: broker.averageSpreads || {},
      commissions: broker.commissions || {}, leverageOptions: broker.leverageOptions || {},
      minTradeSize: broker.minTradeSize || '', maxTradeSize: broker.maxTradeSize || '',
      marginCall: broker.marginCall || '', stopOutLevel: broker.stopOutLevel || '',
      orderExecution: broker.orderExecution || 'Market Execution',
      tradingHours: broker.tradingHours || '', swapRates: broker.swapRates || '',
      commissionNotes: broker.commissionNotes || '',
      features: broker.features || [], platforms: broker.platforms || [],
      instruments: broker.instruments || {},
      copyTradingAvailable: broker.copyTradingAvailable || false,
      socialTradingAvailable: broker.socialTradingAvailable || false,
      vpsAvailable: broker.vpsAvailable || false, apiAvailable: broker.apiAvailable || false,
      chartingTools: broker.chartingTools || [],
      economicCalendar: broker.economicCalendar || false, newsTrading: broker.newsTrading || false,
      mobileAppRating: broker.mobileAppRating || '', desktopPlatformRating: broker.desktopPlatformRating || '',
      demoAccount: broker.demoAccount || false, islamicAccount: broker.islamicAccount || false,
      accountTypes: broker.accountTypes || [],
      depositMethods: broker.depositMethods || [], withdrawalMethods: broker.withdrawalMethods || [],
      depositMethodsDetails: broker.depositMethodsDetails || [],
      withdrawalMethodsDetails: broker.withdrawalMethodsDetails || [],
      withdrawalFee: broker.withdrawalFee || '',
      minWithdrawal: broker.minWithdrawal?.toString() || '',
      withdrawalProcessingTime: broker.withdrawalProcessingTime || '',
      depositProcessingTime: broker.depositProcessingTime || '',
      inactivityFee: broker.inactivityFee || '', accountClosurePolicy: broker.accountClosurePolicy || '',
      supportLanguages: broker.supportLanguages || [],
      supportAvailability: broker.supportAvailability || '24/5',
      hasEducation: broker.hasEducation || false, educationTypes: broker.educationTypes || [],
      bonuses: broker.bonuses || [], promotions: broker.promotions || [],
      partnershipPrograms: broker.partnershipPrograms || [],
      ibProgramAvailable: broker.ibProgramAvailable || false,
      affiliateProgramAvailable: broker.affiliateProgramAvailable || false,
      securityFeatures: broker.securityFeatures || [],
      accountVerification: broker.accountVerification || '', twoFactorAuth: broker.twoFactorAuth || false,
      socialMedia: broker.socialMedia || {},
      awards: broker.awards || [], pressReleases: broker.pressReleases || [],
      trustScore: broker.trustScore?.toString() || '', isRecommended: broker.isRecommended || false,
      country: broker.country || '', yearsInOperation: broker.yearsInOperation?.toString() || '',
      assets: broker.assets || '', promo: broker.promo || '',
      maxAllocation: broker.maxAllocation?.toString() || '', payout: broker.payout?.toString() || '',
      bonusOffer: broker.bonusOffer || '', bonus: broker.bonus || '',
      highlight: broker.highlight || '', signupLink: broker.signupLink || '',
      accountSize: broker.accountSize?.toString() || '',
    });
    setShowModal(true);
  };

  const filteredBrokers = brokers.filter(b => b.name?.toLowerCase().includes(searchQuery.toLowerCase()) || b.country?.toLowerCase().includes(searchQuery.toLowerCase()));

  if (isLoading || loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" /></div>;
  }

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Broker Management</h1>
              <p className="text-zinc-400 text-sm">Complete CRUD - 100+ Fields including Region Settings</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/admin/brokers/import" 
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors flex items-center gap-2"
            >
              <Upload size={16} /> Import JSON
            </Link>
            <button 
              onClick={() => { setEditingBroker(null); resetForm(); setShowModal(true); }} 
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 flex items-center gap-2"
            >
              <Plus size={16} /> Add Broker
            </button>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input type="text" placeholder="Search brokers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBrokers.map((broker) => (
            <div key={broker.id} className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-5 hover:border-purple-500/50 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  {broker.logo ? (
                    <img src={broker.logo} alt={broker.name} className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                      {broker.name?.charAt(0) || 'B'}
                    </div>
                  )}
                  <div><h3 className="font-semibold text-white group-hover:text-purple-400">{broker.name}</h3><p className="text-xs text-zinc-500">{broker.country || 'International'}</p></div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEditModal(broker)} className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-400"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(broker.id)} className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-zinc-400"><Globe size={12} /><span className="text-xs truncate">{broker.website}</span></div>
                {broker.minDeposit && <div className="flex items-center gap-2 text-zinc-400"><DollarSign size={12} /><span className="text-xs">Min Deposit ${broker.minDeposit}</span></div>}
                {broker.maxLeverage && <div className="flex items-center gap-2 text-zinc-400"><TrendingUp size={12} /><span className="text-xs">Leverage {broker.maxLeverage}</span></div>}
                <div className="flex gap-2 pt-1">
                  {broker.regulated ? <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Regulated</span> : <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Unregulated</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${broker.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{broker.status}</span>
                  {broker.regions && broker.regions.length > 0 && (
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                      {broker.regions.includes('GLOBAL') ? '🌍 Global' : `${broker.regions.length} regions`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ==================== COMPLETE MODAL WITH ALL SECTIONS ==================== */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowModal(false)} />
              <div className="flex min-h-full items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-6xl bg-gradient-to-b from-zinc-900 to-zinc-800 rounded-2xl border border-zinc-700 shadow-2xl max-h-[90vh] flex flex-col">
                  
                  {/* Header */}
                  <div className="sticky top-0 p-6 border-b border-zinc-800 bg-zinc-900/95 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-white">{editingBroker ? 'Edit Broker' : 'Add New Broker'} - Complete Profile</h2>
                    <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-zinc-800"><X size={20} className="text-zinc-400" /></button>
                  </div>

                  {/* Navigation Tabs */}
                  <div className="flex overflow-x-auto gap-1 p-4 border-b border-zinc-800 bg-zinc-900/50 sticky top-[73px] z-10">
                    {['basic', 'regions', 'trading', 'ratings', 'trust', 'incidents', 'features', 'instruments', 'accountTypes', 'payments', 'support', 'bonuses', 'promotions', 'regulatory', 'security', 'social', 'metadata'].map((section) => (
                      <button key={section} onClick={() => document.getElementById(`section-${section}`)?.scrollIntoView({ behavior: 'smooth' })} className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
                        {section === 'regions' ? '🌍 Regions' : section.charAt(0).toUpperCase() + section.slice(1).replace(/([A-Z])/g, ' $1')}
                      </button>
                    ))}
                  </div>

                  {/* Form Body */}
                  <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
                    {error && <div className="mb-4 bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">{error}</div>}
                    {success && <div className="mb-4 bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm">{success}</div>}

                    {/* ===== SECTION 1: BASIC INFORMATION ===== */}
                    <div id="section-basic" className="mb-8 scroll-mt-24">
                      <button type="button" onClick={() => toggleSection('basic')} className="w-full flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg mb-4">
                        <h3 className="text-lg font-semibold text-white">📋 Basic Information</h3>
                        {expandedSections.has('basic') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      {expandedSections.has('basic') && (
                        <div className="space-y-4 p-4 bg-zinc-800/30 rounded-lg">
                          <LogoUpload currentLogo={formData.logo} onLogoUploaded={(url) => setFormData({ ...formData, logo: url })} onLogoRemoved={() => setFormData({ ...formData, logo: '' })} />

                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm text-zinc-400">Broker Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" required /></div>
                            <div><label className="block text-sm text-zinc-400">Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="REVIEW">Under Review</option></select></div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm text-zinc-400">Website URL</label><input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                            <div><label className="block text-sm text-zinc-400">Country</label><input type="text" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                          </div>

                          <div><label className="block text-sm text-zinc-400">Short Description *</label><input type="text" value={formData.shortDescription} onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} placeholder="Brief tagline (appears on broker cards)" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" required /></div>

                          <div><label className="block text-sm text-zinc-400">Full Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} placeholder="Detailed description of the broker" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white resize-none" /></div>

                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm text-zinc-400">Founded Year</label><input type="number" value={formData.founded} onChange={(e) => setFormData({ ...formData, founded: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                            <div><label className="block text-sm text-zinc-400">Headquarters</label><input type="text" value={formData.headquarters} onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm text-zinc-400">Corporate Address</label><textarea value={formData.corporateAddress} onChange={(e) => setFormData({ ...formData, corporateAddress: e.target.value })} rows={2} placeholder="Full legal address" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm" /></div>
                            <div><label className="block text-sm text-zinc-400">Years in Operation</label><input type="number" value={formData.yearsInOperation} onChange={(e) => setFormData({ ...formData, yearsInOperation: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm text-zinc-400">Contact Email</label><input type="email" value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                            <div><label className="block text-sm text-zinc-400">Contact Phone</label><input type="text" value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm text-zinc-400">Type</label><input type="text" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                            <div><label className="block text-sm text-zinc-400">Category</label><input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                          </div>

                          <div><label className="block text-sm text-zinc-400">Assets</label><input type="text" value={formData.assets} onChange={(e) => setFormData({ ...formData, assets: e.target.value })} placeholder="Forex, Stocks, Crypto, Commodities" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>

                          <ArrayInput label="Target Audience" values={formData.targetAudience} onChange={(val) => setFormData({ ...formData, targetAudience: val })} placeholder="Beginners, Experts, Scalpers" />
                          
                          <ArrayInput label="Account Currencies" values={formData.accountCurrencies} onChange={(val) => setFormData({ ...formData, accountCurrencies: val })} placeholder="USD, EUR, GBP, JPY, AUD" />
                        </div>
                      )}
                    </div>

                    {/* ===== SECTION: REGION SETTINGS ===== */}
                    <div id="section-regions" className="mb-8 scroll-mt-24">
                      <button 
                        type="button" 
                        onClick={() => toggleSection('regions')} 
                        className="w-full flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg mb-4 border border-purple-500/20 hover:border-purple-500/50 transition-all"
                      >
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Globe size={18} className="text-purple-400" />
                          🌍 Region Settings
                          <span className="text-xs text-zinc-500 font-normal">(Control where this broker appears)</span>
                        </h3>
                        {expandedSections.has('regions') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      
                      {expandedSections.has('regions') && (
                        <div className="space-y-4 p-4 bg-zinc-800/30 rounded-lg border border-purple-500/10">
                          
                          {/* Available Regions */}
                          <div>
                            <label className="block text-sm text-zinc-400 mb-2 flex items-center gap-2">
                              <Globe size={14} className="text-green-400" />
                              Available Regions
                              <span className="text-xs text-zinc-500">(Select where this broker operates)</span>
                            </label>
                            <select 
                              multiple 
                              value={formData.regions || ['GLOBAL']} 
                              onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions, option => option.value);
                                setFormData({ ...formData, regions: selected });
                              }}
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm min-h-[120px] focus:outline-none focus:border-purple-500"
                            >
                              <option value="GLOBAL">🌍 Global (All Regions)</option>
                              <option value="SA">🇿🇦 South Africa</option>
                              <option value="EU">🇪🇺 Europe</option>
                              <option value="UK">🇬🇧 United Kingdom</option>
                              <option value="UAE">🇦🇪 UAE</option>
                              <option value="KE">🇰🇪 Kenya</option>
                              <option value="AU">🇦🇺 Australia</option>
                              <option value="SG">🇸🇬 Singapore</option>
                              <option value="US">🇺🇸 United States</option>
                              <option value="CA">🇨🇦 Canada</option>
                              <option value="MU">🇲🇺 Mauritius</option>
                              <option value="SC">🇸🇨 Seychelles</option>
                              <option value="BVI">🇻🇬 BVI</option>
                              <option value="NZ">🇳🇿 New Zealand</option>
                              <option value="HK">🇭🇰 Hong Kong</option>
                              <option value="IN">🇮🇳 India</option>
                              <option value="BR">🇧🇷 Brazil</option>
                              <option value="MX">🇲🇽 Mexico</option>
                              <option value="NG">🇳🇬 Nigeria</option>
                              <option value="GH">🇬🇭 Ghana</option>
                              <option value="TZ">🇹🇿 Tanzania</option>
                              <option value="ZW">🇿🇼 Zimbabwe</option>
                            </select>
                            <p className="text-xs text-zinc-500 mt-1">Hold Ctrl/Cmd to select multiple regions</p>
                          </div>

                          {/* Restricted Regions */}
                          <div>
                            <label className="block text-sm text-zinc-400 mb-2 flex items-center gap-2">
                              <XCircleIcon size={14} className="text-red-400" />
                              Restricted Regions
                              <span className="text-xs text-zinc-500">(Select regions where this broker is NOT available)</span>
                            </label>
                            <select 
                              multiple 
                              value={formData.restrictedRegions || []} 
                              onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions, option => option.value);
                                setFormData({ ...formData, restrictedRegions: selected });
                              }}
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm min-h-[100px] focus:outline-none focus:border-purple-500"
                            >
                              <option value="SA">🇿🇦 South Africa</option>
                              <option value="EU">🇪🇺 Europe</option>
                              <option value="UK">🇬🇧 United Kingdom</option>
                              <option value="UAE">🇦🇪 UAE</option>
                              <option value="KE">🇰🇪 Kenya</option>
                              <option value="AU">🇦🇺 Australia</option>
                              <option value="SG">🇸🇬 Singapore</option>
                              <option value="US">🇺🇸 United States</option>
                              <option value="CA">🇨🇦 Canada</option>
                              <option value="MU">🇲🇺 Mauritius</option>
                              <option value="SC">🇸🇨 Seychelles</option>
                              <option value="BVI">🇻🇬 BVI</option>
                              <option value="NZ">🇳🇿 New Zealand</option>
                              <option value="HK">🇭🇰 Hong Kong</option>
                              <option value="IN">🇮🇳 India</option>
                              <option value="BR">🇧🇷 Brazil</option>
                              <option value="MX">🇲🇽 Mexico</option>
                              <option value="NG">🇳🇬 Nigeria</option>
                              <option value="GH">🇬🇭 Ghana</option>
                              <option value="TZ">🇹🇿 Tanzania</option>
                              <option value="ZW">🇿🇼 Zimbabwe</option>
                            </select>
                            <p className="text-xs text-zinc-500 mt-1">Hold Ctrl/Cmd to select multiple regions. Restricted regions override Available Regions.</p>
                          </div>

                          {/* Region Description */}
                          <div>
                            <label className="block text-sm text-zinc-400 mb-2 flex items-center gap-2">
                              <FileText size={14} className="text-blue-400" />
                              Region-Specific Descriptions
                              <span className="text-xs text-zinc-500">(Custom description per region)</span>
                            </label>
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {['GLOBAL', 'SA', 'EU', 'UK', 'UAE', 'KE', 'AU', 'SG', 'US', 'CA'].map((region) => {
                                  const regionDisplay: Record<string, string> = {
                                    'GLOBAL': '🌍 Global',
                                    'SA': '🇿🇦 South Africa',
                                    'EU': '🇪🇺 Europe',
                                    'UK': '🇬🇧 UK',
                                    'UAE': '🇦🇪 UAE',
                                    'KE': '🇰🇪 Kenya',
                                    'AU': '🇦🇺 Australia',
                                    'SG': '🇸🇬 Singapore',
                                    'US': '🇺🇸 USA',
                                    'CA': '🇨🇦 Canada',
                                  };
                                  return (
                                    <div key={region} className="bg-zinc-800/50 rounded-lg p-2 border border-zinc-700/50">
                                      <label className="text-xs text-zinc-400 block mb-1">{regionDisplay[region] || region}</label>
                                      <input
                                        type="text"
                                        value={formData.regionDescriptions?.[region] || ''}
                                        onChange={(e) => {
                                          const current = formData.regionDescriptions || {};
                                          setFormData({ 
                                            ...formData, 
                                            regionDescriptions: { ...current, [region]: e.target.value }
                                          });
                                        }}
                                        placeholder={`Description for ${region}`}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-white text-sm"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Region Pricing */}
                          <div>
                            <label className="block text-sm text-zinc-400 mb-2 flex items-center gap-2">
                              <DollarSign size={14} className="text-green-400" />
                              Region-Specific Pricing
                              <span className="text-xs text-zinc-500">(Custom pricing per region)</span>
                            </label>
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {['GLOBAL', 'SA', 'EU', 'UK', 'UAE', 'KE', 'AU', 'SG', 'US', 'CA'].map((region) => {
                                  const regionDisplay: Record<string, string> = {
                                    'GLOBAL': '🌍 Global',
                                    'SA': '🇿🇦 South Africa',
                                    'EU': '🇪🇺 Europe',
                                    'UK': '🇬🇧 UK',
                                    'UAE': '🇦🇪 UAE',
                                    'KE': '🇰🇪 Kenya',
                                    'AU': '🇦🇺 Australia',
                                    'SG': '🇸🇬 Singapore',
                                    'US': '🇺🇸 USA',
                                    'CA': '🇨🇦 Canada',
                                  };
                                  return (
                                    <div key={region} className="bg-zinc-800/50 rounded-lg p-2 border border-zinc-700/50">
                                      <label className="text-xs text-zinc-400 block mb-1">{regionDisplay[region] || region}</label>
                                      <div className="grid grid-cols-2 gap-1">
                                        <input
                                          type="number"
                                          value={formData.regionPricing?.[region]?.minDeposit || ''}
                                          onChange={(e) => {
                                            const current = formData.regionPricing || {};
                                            setFormData({ 
                                              ...formData, 
                                              regionPricing: { 
                                                ...current, 
                                                [region]: { 
                                                  ...current[region], 
                                                  minDeposit: parseFloat(e.target.value) || 0 
                                                }
                                              }
                                            });
                                          }}
                                          placeholder="Min Deposit"
                                          className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-white text-sm"
                                        />
                                        <input
                                          type="text"
                                          value={formData.regionPricing?.[region]?.leverage || ''}
                                          onChange={(e) => {
                                            const current = formData.regionPricing || {};
                                            setFormData({ 
                                              ...formData, 
                                              regionPricing: { 
                                                ...current, 
                                                [region]: { 
                                                  ...current[region], 
                                                  leverage: e.target.value 
                                                }
                                              }
                                            });
                                          }}
                                          placeholder="Leverage"
                                          className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-white text-sm"
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Region Payment Methods */}
                          <div>
                            <label className="block text-sm text-zinc-400 mb-2 flex items-center gap-2">
                              <CreditCard size={14} className="text-cyan-400" />
                              Region-Specific Payment Methods
                              <span className="text-xs text-zinc-500">(Custom payment methods per region)</span>
                            </label>
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {['GLOBAL', 'SA', 'EU', 'UK', 'UAE', 'KE', 'AU', 'SG', 'US', 'CA'].map((region) => {
                                  const regionDisplay: Record<string, string> = {
                                    'GLOBAL': '🌍 Global',
                                    'SA': '🇿🇦 South Africa',
                                    'EU': '🇪🇺 Europe',
                                    'UK': '🇬🇧 UK',
                                    'UAE': '🇦🇪 UAE',
                                    'KE': '🇰🇪 Kenya',
                                    'AU': '🇦🇺 Australia',
                                    'SG': '🇸🇬 Singapore',
                                    'US': '🇺🇸 USA',
                                    'CA': '🇨🇦 Canada',
                                  };
                                  return (
                                    <div key={region} className="bg-zinc-800/50 rounded-lg p-2 border border-zinc-700/50">
                                      <label className="text-xs text-zinc-400 block mb-1">{regionDisplay[region] || region}</label>
                                      <input
                                        type="text"
                                        value={formData.regionPaymentMethods?.[region] || ''}
                                        onChange={(e) => {
                                          const current = formData.regionPaymentMethods || {};
                                          setFormData({ 
                                            ...formData, 
                                            regionPaymentMethods: { 
                                              ...current, 
                                              [region]: e.target.value 
                                            }
                                          });
                                        }}
                                        placeholder="e.g., Bank Transfer, Crypto, Cards"
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-white text-sm"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Region Notes */}
                          <div>
                            <label className="block text-sm text-zinc-400 mb-2 flex items-center gap-2">
                              <Info size={14} className="text-yellow-400" />
                              Region Notes
                              <span className="text-xs text-zinc-500">(Internal notes about region availability)</span>
                            </label>
                            <textarea
                              value={formData.regionNotes || ''}
                              onChange={(e) => setFormData({ ...formData, regionNotes: e.target.value })}
                              placeholder="e.g., 'EU clients restricted due to MiFID II', 'SA clients require FSCA license'"
                              rows={3}
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm resize-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ===== SECTION 3: TRADING CONDITIONS ===== */}
                    <div id="section-trading" className="mb-8 scroll-mt-24">
                      <button type="button" onClick={() => toggleSection('trading')} className="w-full flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg mb-4">
                        <h3 className="text-lg font-semibold text-white">💰 Trading Conditions</h3>
                        {expandedSections.has('trading') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      {expandedSections.has('trading') && (
                        <div className="space-y-4 p-4 bg-zinc-800/30 rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm text-zinc-400">Min Deposit ($)</label><input type="number" value={formData.minDeposit} onChange={(e) => setFormData({ ...formData, minDeposit: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                            <div><label className="block text-sm text-zinc-400">Max Leverage</label><input type="text" value={formData.leverage} onChange={(e) => setFormData({ ...formData, leverage: e.target.value })} placeholder="1:1000" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm text-zinc-400">Min Trade Size</label><input type="text" value={formData.minTradeSize} onChange={(e) => setFormData({ ...formData, minTradeSize: e.target.value })} placeholder="0.01 lots" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                            <div><label className="block text-sm text-zinc-400">Max Trade Size</label><input type="text" value={formData.maxTradeSize} onChange={(e) => setFormData({ ...formData, maxTradeSize: e.target.value })} placeholder="100 lots" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm text-zinc-400">Margin Call (%)</label><input type="text" value={formData.marginCall} onChange={(e) => setFormData({ ...formData, marginCall: e.target.value })} placeholder="100%" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                            <div><label className="block text-sm text-zinc-400">Stop Out Level (%)</label><input type="text" value={formData.stopOutLevel} onChange={(e) => setFormData({ ...formData, stopOutLevel: e.target.value })} placeholder="50%" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm text-zinc-400">Order Execution</label><select value={formData.orderExecution} onChange={(e) => setFormData({ ...formData, orderExecution: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"><option value="Market Execution">Market Execution</option><option value="Instant Execution">Instant Execution</option><option value="Request Execution">Request Execution</option></select></div>
                            <div><label className="block text-sm text-zinc-400">Trading Hours</label><input type="text" value={formData.tradingHours} onChange={(e) => setFormData({ ...formData, tradingHours: e.target.value })} placeholder="24/5 (Mon-Fri)" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                          </div>

                          <KeyValueInput label="Spreads (pips)" value={formData.spreads} onChange={(val) => setFormData({ ...formData, spreads: val })} placeholderKey="Pair" placeholderValue="Spread" defaultFields={[
                            { key: 'eurusd', label: 'EUR/USD', placeholder: '0.6 pips' },
                            { key: 'gbpusd', label: 'GBP/USD', placeholder: '0.7 pips' },
                            { key: 'usdjpy', label: 'USD/JPY', placeholder: '0.6 pips' },
                            { key: 'xauusd', label: 'XAU/USD', placeholder: '0.8 pips' },
                            { key: 'us30', label: 'US30', placeholder: '1.0 pips' },
                          ]} />

                          <KeyValueInput label="Commissions" value={formData.commissions} onChange={(val) => setFormData({ ...formData, commissions: val })} placeholderKey="Account Type" placeholderValue="Commission" defaultFields={[
                            { key: 'standard', label: 'Standard', placeholder: 'No commission' },
                            { key: 'raw', label: 'Raw Spread', placeholder: '$3.50 per lot' },
                          ]} />

                          <div><label className="block text-sm text-zinc-400">Commission Notes</label><textarea value={formData.commissionNotes} onChange={(e) => setFormData({ ...formData, commissionNotes: e.target.value })} rows={2} placeholder="Additional commission details" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm" /></div>

                          <div><label className="block text-sm text-zinc-400">Swap Rates (Overnight Fees)</label><input type="text" value={formData.swapRates} onChange={(e) => setFormData({ ...formData, swapRates: e.target.value })} placeholder="Long/Short rates available in platform" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>

                          <div><label className="block text-sm text-zinc-400">Leverage Options by Asset</label><LeverageOptionsInput value={formData.leverageOptions} onChange={(val) => setFormData({ ...formData, leverageOptions: val })} /></div>

                          <div className="flex gap-4">
                            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.demoAccount} onChange={(e) => setFormData({ ...formData, demoAccount: e.target.checked })} className="rounded border-zinc-600" /><span className="text-white">Demo Account Available</span></label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.islamicAccount} onChange={(e) => setFormData({ ...formData, islamicAccount: e.target.checked })} className="rounded border-zinc-600" /><span className="text-white">Islamic Account (Swap-Free)</span></label>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ===== SECTION 4: RATINGS ===== */}
                    <div id="section-ratings" className="mb-8 scroll-mt-24">
                      <button type="button" onClick={() => toggleSection('ratings')} className="w-full flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg mb-4">
                        <h3 className="text-lg font-semibold text-white">⭐ Ratings & Reviews</h3>
                        {expandedSections.has('ratings') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      {expandedSections.has('ratings') && (
                        <div className="space-y-4 p-4 bg-zinc-800/30 rounded-lg">
                          <p className="text-xs text-zinc-500 mb-2">These values will be overwritten by actual user reviews. Set initial estimates only.</p>
                          <div className="grid grid-cols-3 gap-4">
                            <div><label className="block text-sm text-zinc-400">Overall Rating (1-5)</label><input type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                            <div><label className="block text-sm text-zinc-400">Reviews Count</label><input type="number" value={formData.reviewsCount} onChange={(e) => setFormData({ ...formData, reviewsCount: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                            <div><label className="block text-sm text-zinc-400">Expert Rating</label><input type="number" step="0.1" min="0" max="5" value={formData.expertRating} onChange={(e) => setFormData({ ...formData, expertRating: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm text-zinc-400">Mobile App Rating</label><input type="text" value={formData.mobileAppRating} onChange={(e) => setFormData({ ...formData, mobileAppRating: e.target.value })} placeholder="4.7/5 (App Store)" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                            <div><label className="block text-sm text-zinc-400">Desktop Platform Rating</label><input type="text" value={formData.desktopPlatformRating} onChange={(e) => setFormData({ ...formData, desktopPlatformRating: e.target.value })} placeholder="4.5/5 (Trustpilot)" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ===== SECTION 5: TRUST SCORE & METRICS ===== */}
                    <div id="section-trust" className="mb-8 scroll-mt-24">
                      <button type="button" onClick={() => toggleSection('trust')} className="w-full flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg mb-4">
                        <h3 className="text-lg font-semibold text-white">🔒 Trust Score & Metrics</h3>
                        {expandedSections.has('trust') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      {expandedSections.has('trust') && (
                        <div className="space-y-4 p-4 bg-zinc-800/30 rounded-lg">
                          <div className="grid grid-cols-3 gap-4">
                            <div><label className="block text-sm text-zinc-400">Avg Trust Score</label><input type="number" value={formData.avgTrustScore} onChange={(e) => setFormData({ ...formData, avgTrustScore: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                            <div><label className="block text-sm text-zinc-400">Withdrawal Success</label><input type="number" value={formData.avgWithdrawalSuccess} onChange={(e) => setFormData({ ...formData, avgWithdrawalSuccess: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                            <div><label className="block text-sm text-zinc-400">Execution Quality</label><input type="number" value={formData.avgExecutionQuality} onChange={(e) => setFormData({ ...formData, avgExecutionQuality: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                          </div>
                          <div><label className="block text-sm text-zinc-400">Recommendation Rate (%)</label><input type="number" value={formData.recommendationRate} onChange={(e) => setFormData({ ...formData, recommendationRate: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                          <div><label className="block text-sm text-zinc-400">Trust Score (0-100)</label><input type="number" min="0" max="100" value={formData.trustScore} onChange={(e) => setFormData({ ...formData, trustScore: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                        </div>
                      )}
                    </div>

                    {/* ===== SECTION 6: INCIDENT METRICS ===== */}
                    <div id="section-incidents" className="mb-8 scroll-mt-24">
                      <button type="button" onClick={() => toggleSection('incidents')} className="w-full flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg mb-4">
                        <h3 className="text-lg font-semibold text-white">⚠️ Incident Metrics</h3>
                        {expandedSections.has('incidents') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      {expandedSections.has('incidents') && (
                        <div className="space-y-4 p-4 bg-zinc-800/30 rounded-lg">
                          <div className="grid grid-cols-3 gap-4">
                            <div><label className="block text-sm text-zinc-400">Total Incidents</label><input type="number" value={formData.totalIncidents} onChange={(e) => setFormData({ ...formData, totalIncidents: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                            <div><label className="block text-sm text-zinc-400">Last 7 Days</label><input type="number" value={formData.incidentsLast7Days} onChange={(e) => setFormData({ ...formData, incidentsLast7Days: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                            <div><label className="block text-sm text-zinc-400">Last 30 Days</label><input type="number" value={formData.incidentsLast30Days} onChange={(e) => setFormData({ ...formData, incidentsLast30Days: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                          </div>
                          <div><label className="block text-sm text-zinc-400">Last Incident Date</label><input type="date" value={formData.lastIncidentAt} onChange={(e) => setFormData({ ...formData, lastIncidentAt: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                        </div>
                      )}
                    </div>

                    {/* ===== SECTION 7: FEATURES & PLATFORMS ===== */}
                    <div id="section-features" className="mb-8 scroll-mt-24">
                      <button type="button" onClick={() => toggleSection('features')} className="w-full flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg mb-4">
                        <h3 className="text-lg font-semibold text-white">🎯 Features & Platforms</h3>
                        {expandedSections.has('features') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      {expandedSections.has('features') && (
                        <div className="space-y-4 p-4 bg-zinc-800/30 rounded-lg">
                          <ArrayInput label="Trading Platforms" values={formData.platforms} onChange={(val) => setFormData({ ...formData, platforms: val })} placeholder="MT4, MT5, cTrader, TradingView" />
                          <ArrayInput label="Features" values={formData.features} onChange={(val) => setFormData({ ...formData, features: val })} placeholder="Negative balance protection, Copy trading, VPS" />
                          <ArrayInput label="Charting Tools" values={formData.chartingTools} onChange={(val) => setFormData({ ...formData, chartingTools: val })} placeholder="Advanced charts, Technical indicators, Drawing tools" />

                          <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.copyTradingAvailable} onChange={(e) => setFormData({ ...formData, copyTradingAvailable: e.target.checked })} /><span className="text-white">Copy Trading Available</span></label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.socialTradingAvailable} onChange={(e) => setFormData({ ...formData, socialTradingAvailable: e.target.checked })} /><span className="text-white">Social Trading Available</span></label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.vpsAvailable} onChange={(e) => setFormData({ ...formData, vpsAvailable: e.target.checked })} /><span className="text-white">VPS Available</span></label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.apiAvailable} onChange={(e) => setFormData({ ...formData, apiAvailable: e.target.checked })} /><span className="text-white">API Trading Available</span></label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.economicCalendar} onChange={(e) => setFormData({ ...formData, economicCalendar: e.target.checked })} /><span className="text-white">Economic Calendar</span></label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.newsTrading} onChange={(e) => setFormData({ ...formData, newsTrading: e.target.checked })} /><span className="text-white">News Trading Allowed</span></label>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ===== SECTION 8: INSTRUMENTS ===== */}
                    <div id="section-instruments" className="mb-8 scroll-mt-24">
                      <button type="button" onClick={() => toggleSection('instruments')} className="w-full flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg mb-4">
                        <h3 className="text-lg font-semibold text-white">📊 Tradable Instruments</h3>
                        {expandedSections.has('instruments') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      {expandedSections.has('instruments') && (
                        <div className="space-y-4 p-4 bg-zinc-800/30 rounded-lg">
                          <p className="text-xs text-zinc-500 mb-2">Enter the number of instruments available for each asset class</p>
                          <InstrumentsDetailedInput value={formData.instruments} onChange={(val) => setFormData({ ...formData, instruments: val })} />
                        </div>
                      )}
                    </div>

                    {/* ===== SECTION 9: ACCOUNT TYPES ===== */}
                    <div id="section-accountTypes" className="mb-8 scroll-mt-24">
                      <button type="button" onClick={() => toggleSection('accountTypes')} className="w-full flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg mb-4">
                        <h3 className="text-lg font-semibold text-white">🏦 Account Types</h3>
                        {expandedSections.has('accountTypes') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      {expandedSections.has('accountTypes') && (
                        <div className="space-y-4 p-4 bg-zinc-800/30 rounded-lg">
                          {formData.accountTypes.map((account, idx) => (
                            <AccountTypeItem key={idx} account={account} index={idx} onChange={updateAccountType} onRemove={removeAccountType} />
                          ))}
                          <button type="button" onClick={addAccountType} className="text-sm text-purple-400 flex items-center gap-1 mt-2"><PlusCircle size={14} /> Add Account Type</button>
                        </div>
                      )}
                    </div>

                    {/* ===== SECTION 10: PAYMENT METHODS ===== */}
                    <div id="section-payments" className="mb-8 scroll-mt-24">
                      <button type="button" onClick={() => toggleSection('payments')} className="w-full flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg mb-4">
                        <h3 className="text-lg font-semibold text-white">💳 Payment Methods</h3>
                        {expandedSections.has('payments') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      {expandedSections.has('payments') && (
                        <div className="space-y-4 p-4 bg-zinc-800/30 rounded-lg">
                          <ArrayInput label="Deposit Methods (Simple List)" values={formData.depositMethods} onChange={(val) => setFormData({ ...formData, depositMethods: val })} placeholder="Credit Card, Bank Transfer, Crypto" />
                          <ArrayInput label="Withdrawal Methods (Simple List)" values={formData.withdrawalMethods} onChange={(val) => setFormData({ ...formData, withdrawalMethods: val })} placeholder="Bank Transfer, Crypto, Skrill" />

                          <div className="border-t border-zinc-700 pt-4 mt-2">
                            <label className="block text-sm text-zinc-400 mb-2">Deposit Methods (Detailed)</label>
                            {formData.depositMethodsDetails.map((method, idx) => (
                              <PaymentMethodDetail key={idx} method={method} index={idx} onChange={updateDepositMethodDetail} onRemove={removeDepositMethodDetail} />
                            ))}
                            <button type="button" onClick={addDepositMethodDetail} className="text-sm text-purple-400 flex items-center gap-1"><PlusCircle size={14} /> Add Deposit Method Detail</button>
                          </div>

                          <div className="border-t border-zinc-700 pt-4 mt-2">
                            <label className="block text-sm text-zinc-400 mb-2">Withdrawal Methods (Detailed)</label>
                            {formData.withdrawalMethodsDetails.map((method, idx) => (
                              <PaymentMethodDetail key={idx} method={method} index={idx} onChange={updateWithdrawalMethodDetail} onRemove={removeWithdrawalMethodDetail} />
                            ))}
                            <button type="button" onClick={addWithdrawalMethodDetail} className="text-sm text-purple-400 flex items-center gap-1"><PlusCircle size={14} /> Add Withdrawal Method Detail</button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm text-zinc-400">Withdrawal Fee</label><input type="text" value={formData.withdrawalFee} onChange={(e) => setFormData({ ...formData, withdrawalFee: e.target.value })} placeholder="No fee / $5 per withdrawal" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                            <div><label className="block text-sm text-zinc-400">Min Withdrawal ($)</label><input type="number" value={formData.minWithdrawal} onChange={(e) => setFormData({ ...formData, minWithdrawal: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm text-zinc-400">Withdrawal Processing Time</label><input type="text" value={formData.withdrawalProcessingTime} onChange={(e) => setFormData({ ...formData, withdrawalProcessingTime: e.target.value })} placeholder="1-3 business days" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                            <div><label className="block text-sm text-zinc-400">Deposit Processing Time</label><input type="text" value={formData.depositProcessingTime} onChange={(e) => setFormData({ ...formData, depositProcessingTime: e.target.value })} placeholder="Instant" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm text-zinc-400">Inactivity Fee</label><input type="text" value={formData.inactivityFee} onChange={(e) => setFormData({ ...formData, inactivityFee: e.target.value })} placeholder="$5/month after 6 months" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                            <div><label className="block text-sm text-zinc-400">Account Closure Policy</label><input type="text" value={formData.accountClosurePolicy} onChange={(e) => setFormData({ ...formData, accountClosurePolicy: e.target.value })} placeholder="Contact support to close" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ===== SECTION 11: CUSTOMER SUPPORT ===== */}
                    <div id="section-support" className="mb-8 scroll-mt-24">
                      <button type="button" onClick={() => toggleSection('support')} className="w-full flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg mb-4">
                        <h3 className="text-lg font-semibold text-white">🎧 Customer Support</h3>
                        {expandedSections.has('support') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      {expandedSections.has('support') && (
                        <div className="space-y-4 p-4 bg-zinc-800/30 rounded-lg">
                          <ArrayInput label="Support Languages" values={formData.supportLanguages} onChange={(val) => setFormData({ ...formData, supportLanguages: val })} placeholder="English, Spanish, German, Arabic" />
                          <div><label className="block text-sm text-zinc-400">Support Availability</label><select value={formData.supportAvailability} onChange={(e) => setFormData({ ...formData, supportAvailability: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"><option value="24/5">24/5 (Mon-Fri)</option><option value="24/7">24/7</option><option value="Business Hours">Business Hours</option></select></div>
                          <div><label className="flex items-center gap-2"><input type="checkbox" checked={formData.hasEducation} onChange={(e) => setFormData({ ...formData, hasEducation: e.target.checked })} /><span className="text-white">Has Educational Resources</span></label></div>
                          <ArrayInput label="Education Types" values={formData.educationTypes} onChange={(val) => setFormData({ ...formData, educationTypes: val })} placeholder="Webinars, Courses, Video Tutorials, E-books" />
                        </div>
                      )}
                    </div>

                    {/* ===== SECTION 12: BONUSES ===== */}
                    <div id="section-bonuses" className="mb-8 scroll-mt-24">
                      <button type="button" onClick={() => toggleSection('bonuses')} className="w-full flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg mb-4">
                        <h3 className="text-lg font-semibold text-white">🎁 Bonuses</h3>
                        {expandedSections.has('bonuses') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      {expandedSections.has('bonuses') && (
                        <div className="space-y-4 p-4 bg-zinc-800/30 rounded-lg">
                          {formData.bonuses.map((bonus, idx) => (
                            <BonusItem key={idx} bonus={bonus} index={idx} onChange={updateBonus} onRemove={removeBonus} />
                          ))}
                          <button type="button" onClick={addBonus} className="text-sm text-purple-400 flex items-center gap-1 mt-2"><PlusCircle size={14} /> Add Bonus</button>
                        </div>
                      )}
                    </div>

                    {/* ===== SECTION 13: PROMOTIONS ===== */}
                    <div id="section-promotions" className="mb-8 scroll-mt-24">
                      <button type="button" onClick={() => toggleSection('promotions')} className="w-full flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg mb-4">
                        <h3 className="text-lg font-semibold text-white">🏷️ Promotions</h3>
                        {expandedSections.has('promotions') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      {expandedSections.has('promotions') && (
                        <div className="space-y-4 p-4 bg-zinc-800/30 rounded-lg">
                          {formData.promotions.map((promotion, idx) => (
                            <PromotionItem key={idx} promotion={promotion} index={idx} onChange={updatePromotion} onRemove={removePromotion} />
                          ))}
                          <button type="button" onClick={addPromotion} className="text-sm text-purple-400 flex items-center gap-1 mt-2"><PlusCircle size={14} /> Add Promotion</button>
                        </div>
                      )}
                    </div>

                    {/* ===== SECTION 14: REGULATORY DETAILS ===== */}
                    <div id="section-regulatory" className="mb-8 scroll-mt-24">
                      <button type="button" onClick={() => toggleSection('regulatory')} className="w-full flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg mb-4">
                        <h3 className="text-lg font-semibold text-white">🔒 Regulatory Details</h3>
                        {expandedSections.has('regulatory') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      {expandedSections.has('regulatory') && (
                        <div className="space-y-4 p-4 bg-zinc-800/30 rounded-lg">
                          <label className="flex items-center gap-2"><input type="checkbox" checked={formData.regulated} onChange={(e) => setFormData({ ...formData, regulated: e.target.checked })} /><span className="text-white">Regulated Broker</span></label>

                          <div><label className="block text-sm text-zinc-400">Regulatory Authorities (comma separated)</label><input type="text" value={formData.regulation?.authorities?.join(', ') || ''} onChange={(e) => setFormData({ ...formData, regulation: { ...formData.regulation, authorities: e.target.value.split(',').map(s => s.trim()).filter(s => s) } })} placeholder="FCA (UK), CySEC (Cyprus), ASIC (Australia)" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>

                          <div className="grid grid-cols-2 gap-3">
                            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.regulation?.negativeBalanceProtection || false} onChange={(e) => setFormData({ ...formData, regulation: { ...formData.regulation, negativeBalanceProtection: e.target.checked } })} /><span className="text-sm text-zinc-400">Negative Balance Protection</span></label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.regulation?.segregatedAccounts || false} onChange={(e) => setFormData({ ...formData, regulation: { ...formData.regulation, segregatedAccounts: e.target.checked } })} /><span className="text-sm text-zinc-400">Segregated Accounts</span></label>
                          </div>

                          <div><label className="block text-sm text-zinc-400">Compensation Scheme</label><input type="text" value={formData.regulation?.compensationScheme || ''} onChange={(e) => setFormData({ ...formData, regulation: { ...formData.regulation, compensationScheme: e.target.value } })} placeholder="e.g., Up to €20,000, Up to $1,000,000" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>

                          <div><label className="block text-sm text-zinc-400">Regulatory Warnings</label><textarea value={formData.regulatoryWarnings.join('\n')} onChange={(e) => setFormData({ ...formData, regulatoryWarnings: e.target.value.split('\n').filter(l => l.trim()) })} rows={3} placeholder="Any regulatory warnings or flags (one per line)" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm" /></div>

                          <div><label className="block text-sm text-zinc-400">Entity Mapping (Which entity serves which region)</label><textarea value={Object.entries(formData.entityMapping).map(([k, v]) => `${k}: ${v}`).join('\n')} onChange={(e) => { const obj: Record<string, string> = {}; e.target.value.split('\n').forEach(line => { const [key, val] = line.split(':'); if (key && val) obj[key.trim()] = val.trim(); }); setFormData({ ...formData, entityMapping: obj }); }} rows={4} placeholder="EU Clients: Deriv Investments (Europe) Ltd&#10;UAE Clients: Deriv Capital Contracts & Currencies L.L.C&#10;International: Deriv (BVI) Ltd" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm" /></div>
                        </div>
                      )}
                    </div>

                    {/* ===== SECTION 15: SECURITY ===== */}
                    <div id="section-security" className="mb-8 scroll-mt-24">
                      <button type="button" onClick={() => toggleSection('security')} className="w-full flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg mb-4">
                        <h3 className="text-lg font-semibold text-white">🔐 Security Features</h3>
                        {expandedSections.has('security') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      {expandedSections.has('security') && (
                        <div className="space-y-4 p-4 bg-zinc-800/30 rounded-lg">
                          <ArrayInput label="Security Features" values={formData.securityFeatures} onChange={(val) => setFormData({ ...formData, securityFeatures: val })} placeholder="2FA, SSL Encryption, DDoS Protection" />
                          <label className="flex items-center gap-2"><input type="checkbox" checked={formData.twoFactorAuth} onChange={(e) => setFormData({ ...formData, twoFactorAuth: e.target.checked })} /><span className="text-white">Two-Factor Authentication (2FA) Available</span></label>
                          <div><label className="block text-sm text-zinc-400">Account Verification (KYC)</label><input type="text" value={formData.accountVerification} onChange={(e) => setFormData({ ...formData, accountVerification: e.target.value })} placeholder="ID + Proof of Address required" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                        </div>
                      )}
                    </div>

                    {/* ===== SECTION 16: SOCIAL MEDIA ===== */}
                    <div id="section-social" className="mb-8 scroll-mt-24">
                      <button type="button" onClick={() => toggleSection('social')} className="w-full flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg mb-4">
                        <h3 className="text-lg font-semibold text-white">📱 Social Media</h3>
                        {expandedSections.has('social') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      {expandedSections.has('social') && (
                        <div className="space-y-4 p-4 bg-zinc-800/30 rounded-lg">
                          <SocialMediaInput value={formData.socialMedia} onChange={(val) => setFormData({ ...formData, socialMedia: val })} />
                        </div>
                      )}
                    </div>

                    {/* ===== SECTION 17: METADATA & PARTNERSHIPS ===== */}
                    <div id="section-metadata" className="mb-8 scroll-mt-24">
                      <button type="button" onClick={() => toggleSection('metadata')} className="w-full flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg mb-4">
                        <h3 className="text-lg font-semibold text-white">🏷️ Metadata & Partnerships</h3>
                        {expandedSections.has('metadata') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      {expandedSections.has('metadata') && (
                        <div className="space-y-4 p-4 bg-zinc-800/30 rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm text-zinc-400">Signup Link</label><input type="url" value={formData.signupLink} onChange={(e) => setFormData({ ...formData, signupLink: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                            <div><label className="block text-sm text-zinc-400">Highlight / USP</label><input type="text" value={formData.highlight} onChange={(e) => setFormData({ ...formData, highlight: e.target.value })} placeholder="e.g., 24/7 Trading, Lowest Spreads" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm text-zinc-400">Promo Text</label><input type="text" value={formData.promo} onChange={(e) => setFormData({ ...formData, promo: e.target.value })} placeholder="e.g., Start with $5, Free VPS" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                            <div><label className="block text-sm text-zinc-400">Payout (%)</label><input type="number" value={formData.payout} onChange={(e) => setFormData({ ...formData, payout: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm text-zinc-400">Max Allocation</label><input type="number" value={formData.maxAllocation} onChange={(e) => setFormData({ ...formData, maxAllocation: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                            <div><label className="block text-sm text-zinc-400">Account Size</label><input type="number" value={formData.accountSize} onChange={(e) => setFormData({ ...formData, accountSize: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
                          </div>

                          <ArrayInput label="Awards" values={formData.awards} onChange={(val) => setFormData({ ...formData, awards: val })} placeholder="Best Broker 2024, Most Innovative Platform" />

                          <div><label className="block text-sm text-zinc-400">Partnership Programs</label><ArrayInput label="" values={formData.partnershipPrograms} onChange={(val) => setFormData({ ...formData, partnershipPrograms: val })} placeholder="IB Program, Affiliate Program" /></div>

                          <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.ibProgramAvailable} onChange={(e) => setFormData({ ...formData, ibProgramAvailable: e.target.checked })} /><span className="text-white">Introducing Broker (IB) Program</span></label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.affiliateProgramAvailable} onChange={(e) => setFormData({ ...formData, affiliateProgramAvailable: e.target.checked })} /><span className="text-white">Affiliate Program</span></label>
                          </div>

                          <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isRecommended} onChange={(e) => setFormData({ ...formData, isRecommended: e.target.checked })} /><span className="text-white">Recommended Broker (Featured)</span></label>
                        </div>
                      )}
                    </div>

                    {/* SUBMIT BUTTONS */}
                    <div className="flex gap-3 pt-4 sticky bottom-0 bg-zinc-900/95 py-4 border-t border-zinc-800">
                      <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-zinc-800 rounded-lg text-white hover:bg-zinc-700">Cancel</button>
                      <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:from-purple-500 hover:to-pink-500 disabled:opacity-50">
                        {submitting ? 'Saving...' : (editingBroker ? 'Update Broker' : 'Create Broker')}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}