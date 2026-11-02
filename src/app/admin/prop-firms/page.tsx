// app/admin/prop-firms/page.tsx
'use client';

import {notify,confirmAction} from '@/components/ui/Feedback';
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
  MessageCircle, Send, Trophy, Medal, Target as TargetIcon,
  Scale as ScaleIcon, LayoutGrid, List, GitCompare
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
    onChange(values.filter((_: unknown, i: number) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm text-[var(--ip-text-2)]">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addItem()}
          placeholder={placeholder}
          className="flex-1 bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-3 py-2 text-[var(--ip-text)] text-sm focus:outline-none focus:border-blue-500"
        />
        <button type="button" onClick={addItem} className="px-3 py-2 bg-blue-600 rounded-lg text-[var(--ip-text)] hover:bg-blue-500">
          <PlusCircle size={16} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((value, index) => (
          <div key={index} className="flex items-center gap-1 bg-[var(--ip-surface-2)] rounded-lg px-2 py-1 border border-[var(--ip-border)]">
            <span className="text-[var(--ip-text)] text-sm">{value}</span>
            <button type="button" onClick={() => removeItem(index)} className="text-[var(--ip-text-2)] hover:text-red-400">
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
      <label className="block text-sm text-[var(--ip-text-2)]">{label}</label>
      
      {defaultFields.map((field) => (
        <div key={field.key} className="flex gap-2 mb-2">
          <span className="w-28 text-sm text-[var(--ip-text-2)]">{field.label}</span>
          <input
            type="text"
            value={value[field.key] || ''}
            onChange={(e) => onChange({ ...value, [field.key]: e.target.value })}
            placeholder={field.placeholder}
            className="flex-1 bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-3 py-2 text-[var(--ip-text)] text-sm"
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
              className="w-28 bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-2 py-2 text-[var(--ip-text)] text-sm"
            />
            <input
              type="text"
              value={val as string}
              onChange={(e) => onChange({ ...value, [key]: e.target.value })}
              className="flex-1 bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-2 py-2 text-[var(--ip-text)] text-sm"
            />
            <button type="button" onClick={() => removeField(key)} className="text-[var(--ip-text-2)] hover:text-red-400">
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
            className="w-28 bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-2 py-2 text-[var(--ip-text)] text-sm"
          />
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={placeholderValue}
            className="flex-1 bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-2 py-2 text-[var(--ip-text)] text-sm"
          />
          <button type="button" onClick={addField} className="px-3 py-2 bg-green-600 rounded-lg text-[var(--ip-text)]">Add</button>
          <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-2 bg-zinc-700 rounded-lg text-[var(--ip-text)]">Cancel</button>
        </div>
      ) : (
        <button type="button" onClick={() => setShowAdd(true)} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-2">
          <PlusCircle size={14} /> Add custom field
        </button>
      )}
    </div>
  );
}

function AccountOptionsInput({ options, onChange }: { options: any[]; onChange: (options: any[]) => void }) {
  const updateOption = (index: number, field: string, value: any) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    onChange(newOptions);
  };

  const addOption = () => {
    onChange([...options, { accountSize: '', price: '', payoutPercentage: '', maxAllocation: '', profitSplit: '', refundableFee: false, minTradingDays: '', maxTradingDays: '', leverage: '', popular: false, scalingPlan: '' }]);
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_: unknown, i: number) => i !== index));
  };

  return (
    <div className="space-y-3 mt-2">
      <label className="block text-sm text-[var(--ip-text-2)]">Account Options</label>
      {options.map((option, idx) => (
        <div key={idx} className="bg-[var(--ip-surface-2)] rounded-lg p-3 border border-[var(--ip-border)]">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input type="number" value={option.accountSize || ''} onChange={(e) => updateOption(idx, 'accountSize', parseFloat(e.target.value) || 0)} placeholder="Account Size ($)" className="bg-zinc-700 rounded px-2 py-1.5 text-[var(--ip-text)] text-sm" />
            <input type="number" value={option.price || ''} onChange={(e) => updateOption(idx, 'price', parseFloat(e.target.value) || 0)} placeholder="Price ($)" className="bg-zinc-700 rounded px-2 py-1.5 text-[var(--ip-text)] text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input type="number" value={option.payoutPercentage || ''} onChange={(e) => updateOption(idx, 'payoutPercentage', parseFloat(e.target.value) || 0)} placeholder="Payout %" className="bg-zinc-700 rounded px-2 py-1.5 text-[var(--ip-text)] text-sm" />
            <input type="number" value={option.maxAllocation || ''} onChange={(e) => updateOption(idx, 'maxAllocation', parseFloat(e.target.value) || 0)} placeholder="Max Allocation ($)" className="bg-zinc-700 rounded px-2 py-1.5 text-[var(--ip-text)] text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input type="number" value={option.profitSplit || ''} onChange={(e) => updateOption(idx, 'profitSplit', parseFloat(e.target.value) || 0)} placeholder="Profit Split %" className="bg-zinc-700 rounded px-2 py-1.5 text-[var(--ip-text)] text-sm" />
            <input type="text" value={option.leverage || ''} onChange={(e) => updateOption(idx, 'leverage', e.target.value)} placeholder="Leverage (e.g., 1:100)" className="bg-zinc-700 rounded px-2 py-1.5 text-[var(--ip-text)] text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={option.refundableFee || false} onChange={(e) => updateOption(idx, 'refundableFee', e.target.checked)} className="rounded" />
              <span className="text-xs text-[var(--ip-text-2)]">Refundable Fee</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={option.popular || false} onChange={(e) => updateOption(idx, 'popular', e.target.checked)} className="rounded" />
              <span className="text-xs text-[var(--ip-text-2)]">Popular Choice</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" value={option.minTradingDays || ''} onChange={(e) => updateOption(idx, 'minTradingDays', parseInt(e.target.value) || 0)} placeholder="Min Trading Days" className="bg-zinc-700 rounded px-2 py-1.5 text-[var(--ip-text)] text-sm" />
            <input type="number" value={option.maxTradingDays || ''} onChange={(e) => updateOption(idx, 'maxTradingDays', parseInt(e.target.value) || 0)} placeholder="Max Trading Days" className="bg-zinc-700 rounded px-2 py-1.5 text-[var(--ip-text)] text-sm" />
          </div>
          <input type="text" value={option.scalingPlan || ''} onChange={(e) => updateOption(idx, 'scalingPlan', e.target.value)} placeholder="Scaling Plan" className="w-full bg-zinc-700 rounded px-2 py-1.5 text-[var(--ip-text)] text-sm mt-2" />
          <button onClick={() => removeOption(idx)} className="mt-2 text-xs text-red-400">Remove Option</button>
        </div>
      ))}
      <button type="button" onClick={addOption} className="text-sm text-blue-400 flex items-center gap-1">
        <PlusCircle size={14} /> Add Account Option
      </button>
    </div>
  );
}

function ProgramItem({ program, index, onChange, onRemove }: { program: any; index: number; onChange: (index: number, field: string, value: any) => void; onRemove: (index: number) => void }) {
  const [showRules, setShowRules] = useState(true);
  const [showOptions, setShowOptions] = useState(true);

  return (
    <div className="bg-[var(--ip-surface-2)] rounded-lg p-4 mb-4 border border-[var(--ip-border)]">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-[var(--ip-text)] font-medium">Program {index + 1}</h4>
        <button onClick={() => onRemove(index)} className="text-xs text-red-400">Remove Program</button>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        <input type="text" value={program.name || ''} onChange={(e) => onChange(index, 'name', e.target.value)} placeholder="Program Name" className="bg-zinc-700 rounded px-3 py-2 text-[var(--ip-text)] text-sm" />
        <input type="text" value={program.type || ''} onChange={(e) => onChange(index, 'type', e.target.value)} placeholder="Type" className="bg-zinc-700 rounded px-3 py-2 text-[var(--ip-text)] text-sm" />
      </div>
      <textarea value={program.description || ''} onChange={(e) => onChange(index, 'description', e.target.value)} placeholder="Description" rows={2} className="w-full bg-zinc-700 rounded px-3 py-2 text-[var(--ip-text)] text-sm mb-3 resize-none" />
      
      <div className="bg-zinc-700/30 rounded-lg p-3 mb-3">
        <button type="button" onClick={() => setShowRules(!showRules)} className="w-full flex items-center justify-between">
          <label className="text-sm text-[var(--ip-text-2)]">Rules</label>
          {showRules ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showRules && (
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={program.timeLimit?.total || ''} onChange={(e) => onChange(index, 'timeLimit', { ...program.timeLimit, total: e.target.value })} placeholder="Time Limit" className="bg-zinc-700 rounded px-2 py-1.5 text-[var(--ip-text)] text-sm" />
              <input type="text" value={program.timeLimit?.phase1 || ''} onChange={(e) => onChange(index, 'timeLimit', { ...program.timeLimit, phase1: e.target.value })} placeholder="Phase 1" className="bg-zinc-700 rounded px-2 py-1.5 text-[var(--ip-text)] text-sm" />
              <input type="text" value={program.timeLimit?.phase2 || ''} onChange={(e) => onChange(index, 'timeLimit', { ...program.timeLimit, phase2: e.target.value })} placeholder="Phase 2" className="bg-zinc-700 rounded px-2 py-1.5 text-[var(--ip-text)] text-sm" />
              <input type="text" value={program.timeLimit?.unit || ''} onChange={(e) => onChange(index, 'timeLimit', { ...program.timeLimit, unit: e.target.value })} placeholder="Unit" className="bg-zinc-700 rounded px-2 py-1.5 text-[var(--ip-text)] text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={program.rules?.profitTarget || ''} onChange={(e) => onChange(index, 'rules', { ...program.rules, profitTarget: e.target.value })} placeholder="Profit Target" className="bg-zinc-700 rounded px-2 py-1.5 text-[var(--ip-text)] text-sm" />
              <input type="number" value={program.rules?.maxDrawdown || ''} onChange={(e) => onChange(index, 'rules', { ...program.rules, maxDrawdown: parseFloat(e.target.value) || 0 })} placeholder="Max Drawdown" className="bg-zinc-700 rounded px-2 py-1.5 text-[var(--ip-text)] text-sm" />
              <input type="number" value={program.rules?.dailyDrawdown || ''} onChange={(e) => onChange(index, 'rules', { ...program.rules, dailyDrawdown: parseFloat(e.target.value) || 0 })} placeholder="Daily Drawdown" className="bg-zinc-700 rounded px-2 py-1.5 text-[var(--ip-text)] text-sm" />
              <input type="number" value={program.rules?.minTradingDays || ''} onChange={(e) => onChange(index, 'rules', { ...program.rules, minTradingDays: parseInt(e.target.value) || 0 })} placeholder="Min Days" className="bg-zinc-700 rounded px-2 py-1.5 text-[var(--ip-text)] text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={program.rules?.weekendHolding || false} onChange={(e) => onChange(index, 'rules', { ...program.rules, weekendHolding: e.target.checked })} className="rounded" />
                <span className="text-xs text-[var(--ip-text-2)]">Weekend Holding</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={program.rules?.eaTrading || false} onChange={(e) => onChange(index, 'rules', { ...program.rules, eaTrading: e.target.checked })} className="rounded" />
                <span className="text-xs text-[var(--ip-text-2)]">EA Trading</span>
              </label>
            </div>
            <input type="text" value={program.rules?.consistencyRule || ''} onChange={(e) => onChange(index, 'rules', { ...program.rules, consistencyRule: e.target.value })} placeholder="Consistency Rule" className="w-full bg-zinc-700 rounded px-2 py-1.5 text-[var(--ip-text)] text-sm" />
          </div>
        )}
      </div>
      
      <div className="bg-zinc-700/30 rounded-lg p-3">
        <button type="button" onClick={() => setShowOptions(!showOptions)} className="w-full flex items-center justify-between">
          <label className="text-sm text-[var(--ip-text-2)]">Account Options</label>
          {showOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showOptions && (
          <AccountOptionsInput 
            options={program.accountOptions || []} 
            onChange={(options) => onChange(index, 'accountOptions', options)} 
          />
        )}
      </div>
    </div>
  );
}

function PromotionItem({ promotion, index, onChange, onRemove }: { promotion: any; index: number; onChange: (index: number, field: string, value: any) => void; onRemove: (index: number) => void }) {
  return (
    <div className="bg-[var(--ip-surface-2)] rounded-lg p-3 mb-2 border border-[var(--ip-border)]">
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input type="text" value={promotion.name || ''} onChange={(e) => onChange(index, 'name', e.target.value)} placeholder="Promotion Name" className="bg-zinc-700 rounded px-2 py-1.5 text-[var(--ip-text)] text-sm" />
        <input type="text" value={promotion.discount || ''} onChange={(e) => onChange(index, 'discount', e.target.value)} placeholder="Discount %" className="bg-zinc-700 rounded px-2 py-1.5 text-[var(--ip-text)] text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input type="text" value={promotion.code || ''} onChange={(e) => onChange(index, 'code', e.target.value)} placeholder="Promo Code" className="bg-zinc-700 rounded px-2 py-1.5 text-[var(--ip-text)] text-sm" />
        <input type="date" value={promotion.validUntil || ''} onChange={(e) => onChange(index, 'validUntil', e.target.value)} className="bg-zinc-700 rounded px-2 py-1.5 text-[var(--ip-text)] text-sm" />
      </div>
      <textarea value={promotion.description || ''} onChange={(e) => onChange(index, 'description', e.target.value)} placeholder="Description" rows={2} className="w-full bg-zinc-700 rounded px-2 py-1.5 text-[var(--ip-text)] text-sm mt-2 resize-none" />
      <button onClick={() => onRemove(index)} className="mt-2 text-xs text-red-400">Remove Promotion</button>
    </div>
  );
}

function LogoUpload({ currentLogo, onLogoUploaded, onLogoRemoved }: { 
  currentLogo: string; 
  onLogoUploaded: (url: string) => void; 
  onLogoRemoved: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      notify('Please upload an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      notify('File size must be less than 2MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'prop-firm');

    try {
      const response = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: formData });
      const data = await response.json();
      if (response.ok && data.url) onLogoUploaded(data.url);
      else notify(data.error || 'Failed to upload');
    } catch (error) {
      notify('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm text-[var(--ip-text-2)]">Logo</label>
      <div className="border-2 border-dashed border-[var(--ip-border)] rounded-xl p-6 text-center hover:border-blue-500/50 transition-all bg-[var(--ip-surface-2)]">
        {currentLogo ? (
          <div className="flex flex-col items-center gap-3">
            <img src={currentLogo} alt="Logo" className="w-24 h-24 rounded-xl object-contain bg-[var(--ip-surface-2)] p-2 border border-[var(--ip-border)]" />
            <div className="flex gap-3">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-blue-400 flex items-center gap-1">
                <RefreshCw size={12} /> Replace
              </button>
              <button type="button" onClick={onLogoRemoved} className="text-sm text-red-400 flex items-center gap-1">
                <Trash size={12} /> Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <UploadCloud size={32} className="text-[var(--ip-text-2)]" />
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="px-4 py-2 bg-blue-600 rounded-lg text-[var(--ip-text)] text-sm">
              {uploading ? 'Uploading...' : 'Upload Logo'}
            </button>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(file); }} className="hidden" />
      </div>
    </div>
  );
}

export default function AdminPropFirmsPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [firms, setFirms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingFirm, setEditingFirm] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [listPage,setListPage]=useState(1);const [listPages,setListPages]=useState(1);const [listTotal,setListTotal]=useState(0);const [listStatus,setListStatus]=useState('all');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set([
    'basic', 'payout', 'programs', 'promotions'
  ]));
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<any>({
    name: '',
    status: 'ACTIVE',
    description: '',
    shortDescription: '',
    logo: '',
    founded: '',
    foundedMonth: '',
    headquarters: '',
    website: '',
    signupLink: '',
    contactEmail: '',
    contactPhone: '',
    type: 'Prop Firm',
    category: 'Multi-asset',
    regulated: false,
    country: '',
    yearsInOperation: '',
    assets: [],
    platforms: [],
    features: [],
    tradingInstruments: [],
    payoutFrequency: '',
    payoutMethods: [],
    minimumPayout: '',
    payoutProcessingTime: '',
    supportedCountries: [],
    prohibitedCountries: [],
    customerSupport: [],
    hasEducation: false,
    educationResources: [],
    communityFeatures: [],
    chartingTools: [],
    securityFeatures: [],
    positiveReviewThemes: [],
    negativeReviewThemes: [],
    supportAgents: [],
    systemBugs: [],
    riskFactors: [],
    redFlags: [],
    greenFlags: [],
    warnings: [],
    regulatoryWarnings: [],
    regulatoryBodies: [],
    leverageOptions: {},
    averageSpreads: {},
    commissions: {},
    entityMapping: {},
    profitCaps: {},
    scalingPlan: {},
    socialMedia: {},
    minimumAge: '',
    newsTradingRestrictions: '',
    newsTrading: false,
    twoFactorAuth: false,
    goatGuard: false,
    ceo: '',
    ceoBio: '',
    legalName: '',
    corporateAddress: '',
    additionalOffice: '',
    previousHeadquarters: '',
    migrationStatus: '',
    trustpilotRating: '',
    trustpilotReviews: '',
    trustpilotUrl: '',
    totalPayoutsPaid: '',
    totalPayoutsCurrency: '',
    totalPayoutsVerified: false,
    totalTradersServed: '',
    dailyTradeCount: '',
    riskLevel: '',
    riskScore: '',
    recommendation: '',
    maxAccountSize: '',
    maxAccountSizeCurrency: '',
    oneStepAvailable: false,
    oneStepProfitTarget: '',
    oneStepMaxDrawdown: '',
    oneStepMaxLossPerTrade: '',
    oneStepConsistency: '',
    twoStepAvailable: false,
    twoStepProfitTarget1: '',
    twoStepProfitTarget2: '',
    twoStepMaxDrawdown: '',
    twoStepDailyDrawdown: '',
    twoStepMinDays1: '',
    twoStepMinDays2: '',
    instantFundingAvailable: false,
    ifMaxDrawdown: '',
    ifMaxLossPerTrade: '',
    ifConsistencyRule: '',
    ifMinTradingDays: '',
    ifProfitSplit: '',
    ifRewardCycle: '',
    payLaterAvailable: false,
    payLaterInitialFee: '',
    payLaterActivationFee: '',
    payLaterProfitTarget: '',
    payLaterMaxDrawdown: '',
    payLaterMaxLossPerTrade: '',
    payLaterConsistency: '',
    payLaterMaxAccounts: '',
    payLaterCountryCap: '',
    payLaterAccountSizes: [],
    newsTradingWindow: '',
    newsProfitCap: '',
    shortTradeMinDuration: '',
    consistencyRule: '',
    scalingLevel1Months: '',
    scalingLevel1Payouts: '',
    scalingLevel1Boost: '',
    scalingLevel1Split: '',
    scalingLevel1Drawdown: '',
    scalingLevel1Benefits: [],
    scalingLevel2Months: '',
    scalingLevel2Payouts: '',
    scalingLevel2Boost: '',
    scalingLevel2Split: '',
    scalingLevel2Drawdown: '',
    scalingLevel2WeeklyPayouts: false,
    scalingLevel2Benefits: [],
    scalingLevel3Months: '',
    scalingLevel3Payouts: '',
    scalingLevel3Boost: '',
    scalingLevel3Split: '',
    scalingLevel3Drawdown: '',
    scalingLevel3MonthlySalary: '',
    scalingLevel3FreeChallenge: false,
    scalingLevel3Benefits: [],
    scalingLevel4Months: '',
    scalingLevel4Payouts: '',
    scalingLevel4Boost: '',
    scalingLevel4Split: '',
    scalingLevel4Drawdown: '',
    scalingLevel4MonthlySalary: '',
    scalingLevel4FreeChallenge: false,
    scalingLevel4Benefits: [],
    scalingLevelMax: '',
    bogoAvailable: false,
    bogoDiscount: '',
    bogoFreeAccounts: '',
    bogoFreeAccountTiming: '',
    affiliateDiscountCode: '',
    affiliateDiscountPercent: '',
    prohibitedStrategies: [],
    hedgingAllowed: true,
    martingaleAllowed: true,
    copyTradingAllowed: true,
    copyTradingRules: '',
    eaTrading: true,
    hftAllowed: true,
    weekendHolding: true,
    knownIssues: [],
    publicWarnings: [],
    programs: [],
    promotions: [],
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
      const timer=setTimeout(()=>void fetchFirms(),250);return()=>clearTimeout(timer);
    }
  }, [user, isLoading,listPage,searchQuery,listStatus]);

  const fetchFirms = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/prop-firms?${new URLSearchParams({page:String(listPage),limit:'20',search:searchQuery,status:listStatus})}`, { credentials: 'include' });
      const data = await response.json();
      
      if (data.success) {
        setFirms(data.firms || []);setListPages(data.pagination.pages);setListTotal(data.pagination.total);
      } else {
        setError(data.error || 'Failed to fetch prop firms');
      }
    } catch (error) {
      console.error('Error fetching prop firms:', error);
      setError('Network error - failed to fetch prop firms');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!await confirmAction('Unpublish this prop firm? Existing records and trader contributions will be preserved.')) return;
    try {
      const response = await fetch(`/api/admin/prop-firms/${id}`, { method: 'DELETE', credentials: 'include' });
      if (response.ok) {
        setSuccess('Prop firm unpublished. Records preserved.');
        setTimeout(() => setSuccess(''), 3000);
        fetchFirms();
      } else {
        const data = await response.json();
        notify(data.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting prop firm:', error);
      notify('Failed to delete prop firm');
    }
  };

  // Program handlers
  const updateProgram = (index: number, field: string, value: any) => {
    const newPrograms = [...(formData.programs || [])];
    newPrograms[index] = { ...newPrograms[index], [field]: value };
    setFormData({ ...formData, programs: newPrograms });
  };
  const addProgram = () => setFormData({ ...formData, programs: [...(formData.programs || []), { name: '', type: '', description: '', timeLimit: {}, rules: {}, accountOptions: [] }] });
  const removeProgram = (index: number) => setFormData({ ...formData, programs: (formData.programs || []).filter((_: unknown, i: number) => i !== index) });

  // Promotion handlers
  const updatePromotion = (index: number, field: string, value: any) => {
    const newPromotions = [...(formData.promotions || [])];
    newPromotions[index] = { ...newPromotions[index], [field]: value };
    setFormData({ ...formData, promotions: newPromotions });
  };
  const addPromotion = () => setFormData({ ...formData, promotions: [...(formData.promotions || []), { name: '', description: '', discount: '', code: '', validUntil: '' }] });
  const removePromotion = (index: number) => setFormData({ ...formData, promotions: (formData.promotions || []).filter((_: unknown, i: number) => i !== index) });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Build payload
      const payload: any = {};

      // Only include fields that have values
      const fields = [
        'name', 'status', 'description', 'shortDescription', 'logo',
        'founded', 'foundedMonth', 'headquarters', 'website', 'signupLink',
        'contactEmail', 'contactPhone', 'type', 'category', 'regulated',
        'country', 'yearsInOperation', 'assets', 'platforms', 'features',
        'tradingInstruments', 'payoutFrequency', 'payoutMethods',
        'minimumPayout', 'payoutProcessingTime', 'supportedCountries',
        'prohibitedCountries', 'customerSupport', 'hasEducation',
        'educationResources', 'communityFeatures', 'chartingTools',
        'securityFeatures', 'positiveReviewThemes', 'negativeReviewThemes',
        'supportAgents', 'systemBugs', 'riskFactors', 'redFlags',
        'greenFlags', 'warnings', 'regulatoryWarnings', 'regulatoryBodies',
        'leverageOptions', 'averageSpreads', 'commissions', 'entityMapping',
        'profitCaps', 'scalingPlan', 'socialMedia', 'minimumAge',
        'newsTradingRestrictions', 'newsTrading', 'twoFactorAuth',
        'goatGuard', 'ceo', 'ceoBio', 'legalName', 'corporateAddress',
        'additionalOffice', 'previousHeadquarters', 'migrationStatus',
        'trustpilotRating', 'trustpilotReviews', 'trustpilotUrl',
        'totalPayoutsPaid', 'totalPayoutsCurrency', 'totalPayoutsVerified',
        'totalTradersServed', 'dailyTradeCount', 'riskLevel', 'riskScore',
        'recommendation', 'maxAccountSize', 'maxAccountSizeCurrency',
        'maxAllocation', 'rating', 'reviewsCount', 'avgTrustScore',
        'recommendationRate', 'isRecommended', 'regulation', 'safetyScore',
        // Challenge fields
        'oneStepAvailable', 'oneStepProfitTarget', 'oneStepMaxDrawdown',
        'oneStepDailyDrawdown', 'oneStepMinDays', 'oneStepMaxLossPerTrade',
        'oneStepConsistency', 'twoStepAvailable', 'twoStepProfitTarget1',
        'twoStepProfitTarget2', 'twoStepMaxDrawdown', 'twoStepDailyDrawdown',
        'twoStepMinDays1', 'twoStepMinDays2', 'twoStepMaxLossPerTrade',
        'twoStepConsistency', 'instantFundingAvailable', 'ifMaxDrawdown',
        'ifDailyDrawdown', 'ifMinTradingDays', 'ifMaxLossPerTrade',
        'ifConsistencyRule', 'ifProfitSplit', 'ifRewardCycle', 'ifTimeLimit',
        'payLaterAvailable', 'payLaterInitialFee', 'payLaterActivationFee',
        'payLaterProfitTarget', 'payLaterMaxDrawdown', 'payLaterMaxLossPerTrade',
        'payLaterConsistency', 'payLaterMaxAccounts', 'payLaterCountryCap',
        'payLaterAccountSizes', 'newsTradingWindow', 'newsProfitCap',
        'shortTradeMinDuration', 'consistencyRule',
        // Scaling fields
        'scalingLevel1Months', 'scalingLevel1Payouts', 'scalingLevel1Boost',
        'scalingLevel1Split', 'scalingLevel1Drawdown', 'scalingLevel1Benefits',
        'scalingLevel2Months', 'scalingLevel2Payouts', 'scalingLevel2Boost',
        'scalingLevel2Split', 'scalingLevel2Drawdown', 'scalingLevel2WeeklyPayouts',
        'scalingLevel2Benefits', 'scalingLevel3Months', 'scalingLevel3Payouts',
        'scalingLevel3Boost', 'scalingLevel3Split', 'scalingLevel3Drawdown',
        'scalingLevel3MonthlySalary', 'scalingLevel3FreeChallenge',
        'scalingLevel3Benefits', 'scalingLevel4Months', 'scalingLevel4Payouts',
        'scalingLevel4Boost', 'scalingLevel4Split', 'scalingLevel4Drawdown',
        'scalingLevel4MonthlySalary', 'scalingLevel4FreeChallenge',
        'scalingLevel4Benefits', 'scalingLevelMax',
        // Promotion fields
        'bogoAvailable', 'bogoDiscount', 'bogoFreeAccounts',
        'bogoFreeAccountTiming', 'affiliateDiscountCode',
        'affiliateDiscountPercent', 'discountCodes',
        // Prohibited strategies
        'prohibitedStrategies', 'hedgingAllowed', 'martingaleAllowed',
        'copyTradingAllowed', 'copyTradingRules', 'eaTrading', 'hftAllowed',
        'weekendHolding', 'knownIssues', 'publicWarnings',
        // Extra
        'awards', 'highlight', 'promo', 'years', 'tradingConditions',
        'customerCare', 'userFriendliness', 'payoutProcess', 'totalReviews'
      ];

      for (const key of fields) {
        const value = formData[key];
        if (value !== undefined && value !== null && value !== '') {
          // Handle special types
          if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
            // Convert numeric strings to numbers
            if (key.includes('Amount') || key.includes('Price') || key.includes('Fee') || 
                key.includes('Payout') || key.includes('Salary') || key.includes('Count') ||
                key.includes('Months') || key.includes('Days') || key.includes('Score') ||
                key.includes('Rating') || key.includes('Percent') || key.includes('Discount') ||
                key.includes('Boost') || key.includes('Split') || key.includes('Drawdown') ||
                key === 'founded' || key === 'yearsInOperation' || key === 'minimumAge' ||
                key === 'minimumPayout' || key === 'platformFees' || key === 'maxAllocation' ||
                key === 'maxAccountSize' || key === 'riskScore' || key === 'reviewsCount' ||
                key === 'totalReviews' || key === 'totalTradersServed' || key === 'dailyTradeCount' ||
                key === 'monthlySearches' || key === 'monthlyTraffic' || key === 'tradersServed' ||
                key === 'countriesServed' || key === 'safetyScore' || key === 'rating' ||
                key === 'avgTrustScore' || key === 'recommendationRate' ||
                key === 'oneStepProfitTarget' || key === 'oneStepMaxDrawdown' ||
                key === 'oneStepDailyDrawdown' || key === 'oneStepMinDays' ||
                key === 'oneStepMaxLossPerTrade' || key === 'oneStepConsistency' ||
                key === 'twoStepProfitTarget1' || key === 'twoStepProfitTarget2' ||
                key === 'twoStepMaxDrawdown' || key === 'twoStepDailyDrawdown' ||
                key === 'twoStepMinDays1' || key === 'twoStepMinDays2' ||
                key === 'twoStepMaxLossPerTrade' || key === 'twoStepConsistency' ||
                key === 'ifMaxDrawdown' || key === 'ifDailyDrawdown' ||
                key === 'ifMinTradingDays' || key === 'ifMaxLossPerTrade' ||
                key === 'ifConsistencyRule' || key === 'ifProfitSplit' ||
                key === 'payLaterInitialFee' || key === 'payLaterActivationFee' ||
                key === 'payLaterProfitTarget' || key === 'payLaterMaxDrawdown' ||
                key === 'payLaterMaxLossPerTrade' || key === 'payLaterConsistency' ||
                key === 'payLaterMaxAccounts' || key === 'payLaterCountryCap' ||
                key === 'newsProfitCap' || key === 'shortTradeMinDuration' ||
                key === 'scalingLevel1Months' || key === 'scalingLevel1Payouts' ||
                key === 'scalingLevel1Boost' || key === 'scalingLevel1Split' ||
                key === 'scalingLevel1Drawdown' || key === 'scalingLevel2Months' ||
                key === 'scalingLevel2Payouts' || key === 'scalingLevel2Boost' ||
                key === 'scalingLevel2Split' || key === 'scalingLevel2Drawdown' ||
                key === 'scalingLevel3Months' || key === 'scalingLevel3Payouts' ||
                key === 'scalingLevel3Boost' || key === 'scalingLevel3Split' ||
                key === 'scalingLevel3Drawdown' || key === 'scalingLevel3MonthlySalary' ||
                key === 'scalingLevel4Months' || key === 'scalingLevel4Payouts' ||
                key === 'scalingLevel4Boost' || key === 'scalingLevel4Split' ||
                key === 'scalingLevel4Drawdown' || key === 'scalingLevel4MonthlySalary' ||
                key === 'scalingLevelMax' || key === 'bogoDiscount' ||
                key === 'bogoFreeAccounts' || key === 'affiliateDiscountPercent' ||
                key === 'years' || key === 'tradingConditions' || key === 'customerCare' ||
                key === 'userFriendliness' || key === 'payoutProcess' ||
                key === 'safetyScore' || key === 'expertRating' ||
                key === 'avgOverallRating' || key === 'avgTradingConditions' ||
                key === 'avgCustomerCare' || key === 'avgUserFriendliness' ||
                key === 'avgPayoutProcess' || key === 'avgReliability' ||
                key === 'avgExecutionQuality' || key === 'forexPeaceArmyRating' ||
                key === 'minAccountSize' || key === 'minDeposit') {
              const num = parseFloat(value);
              if (!isNaN(num)) {
                payload[key] = num;
              }
            } else {
              payload[key] = value;
            }
          } else if (typeof value === 'boolean') {
            payload[key] = value;
          } else if (Array.isArray(value) && value.length > 0) {
            payload[key] = value;
          } else if (typeof value === 'object' && value !== null && Object.keys(value).length > 0) {
            payload[key] = value;
          } else if (typeof value === 'string' && value.trim() !== '') {
            payload[key] = value;
          }
        }
      }

      // Ensure slug is set
      if (!payload.slug && payload.name) {
        payload.slug = payload.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      }

      // Ensure status is set
      if (!payload.status) {
        payload.status = 'ACTIVE';
      }

      console.log(' Sending payload:', JSON.stringify(payload, null, 2));

      const url = editingFirm ? `/api/admin/prop-firms/${editingFirm.id}` : '/api/admin/prop-firms';
      const method = editingFirm ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      console.log(' Response status:', response.status);
      console.log(' Response data:', data);

      if (!response.ok) {
        const errorMsg = data.details || data.error || 'Failed to save';
        console.error('❌ API Error:', data);
        throw new Error(errorMsg);
      }

      setSuccess(editingFirm ? 'Prop firm updated!' : 'Prop firm created!');
      setTimeout(() => setSuccess(''), 3000);
      setShowModal(false);
      setEditingFirm(null);
      fetchFirms();
    } catch (err: any) {
      console.error('❌ Save error:', err);
      setError(err.message || 'Failed to save prop firm');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (firm: any) => {
    // Populate form data with all fields from the firm
    const populatedData: any = {};
    for (const key in formData) {
      if (firm[key] !== undefined && firm[key] !== null) {
        populatedData[key] = firm[key];
      } else {
        // Keep default values for undefined fields
        populatedData[key] = formData[key];
      }
    }
    setFormData(populatedData);
    setEditingFirm(firm);
    setShowModal(true);
  };

  const filteredFirms = firms;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--ip-bg)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-[var(--ip-bg)] pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg bg-[var(--ip-surface-2)] text-[var(--ip-text-2)] hover:text-[var(--ip-text)]">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[var(--ip-text)]">Prop Firm Management</h1>
              <p className="text-[var(--ip-text-2)] text-sm">{listTotal} matching prop firms</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/prop-firms/import" className="px-4 py-2 bg-green-600 text-[var(--ip-text)] rounded-lg hover:bg-green-500 transition-colors flex items-center gap-2">
              <Upload size={16} /> Import JSON
            </Link>
            <button onClick={() => { setEditingFirm(null); setShowModal(true); }} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-pink-600 text-[var(--ip-text)] rounded-lg hover:from-blue-500 hover:to-pink-500 flex items-center gap-2">
              <Plus size={16} /> Add Prop Firm
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            Error: {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
            {success}
          </div>
        )}

        <div className="v2-community-actions"><select aria-label="Filter publication status" value={listStatus} onChange={e=>{setListStatus(e.target.value);setListPage(1);}}><option value="all">All publication statuses</option><option value="ACTIVE">Published</option><option value="INACTIVE">Unpublished</option></select><span>{listTotal} matching records</span></div>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ip-text-2)]" size={16} />
          <input type="text" placeholder="Search prop firms..." value={searchQuery} onChange={(e) => {setSearchQuery(e.target.value);setListPage(1);}} className="w-full bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg pl-10 pr-4 py-2 text-[var(--ip-text)] text-sm" />
        </div>

        {loading&&<p role="status" className="v2-form-note">Loading provider records…</p>}
        <div aria-busy={loading} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFirms.map((firm) => (
            <div key={firm.id} className="bg-[var(--ip-surface)] rounded-xl border border-[var(--ip-border)] p-5 hover:border-blue-500/50 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  {firm.logo ? (
                    <img src={firm.logo} alt={firm.name} className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-pink-500 flex items-center justify-center text-[var(--ip-text)] font-bold text-lg">
                      {firm.name?.charAt(0) || 'P'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-[var(--ip-text)] group-hover:text-blue-400">{firm.name}</h3>
                    <p className="text-xs text-[var(--ip-text-2)]">{firm.country || 'International'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button aria-label={`Edit ${firm.name}`} onClick={() => openEditModal(firm)} className="p-1.5 rounded-lg text-[var(--ip-text-2)] hover:text-blue-400">
                    <Edit size={14} />
                  </button>
                  <button aria-label={`Unpublish ${firm.name}`} onClick={() => handleDelete(firm.id)} className="p-1.5 rounded-lg text-[var(--ip-text-2)] hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-[var(--ip-text-2)]">
                  <Globe size={12} />
                  <span className="text-xs truncate">{firm.website}</span>
                </div>
                {firm.signupLink && (
                  <div className="flex items-center gap-2 text-[var(--ip-text-2)]">
                    <LinkIcon size={12} />
                    <span className="text-xs truncate text-blue-400">{firm.signupLink}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* MODAL */}
        <div className="v2-pagination"><button disabled={listPage===1} onClick={()=>setListPage(listPage-1)}>Previous</button><span>Page {listPage} of {Math.max(1,listPages)}</span><button disabled={listPage>=listPages} onClick={()=>setListPage(listPage+1)}>Next</button></div>
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowModal(false)} />
              <div className="flex min-h-full items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-4xl bg-gradient-to-b from-zinc-900 to-zinc-800 rounded-2xl border border-[var(--ip-border)] shadow-2xl max-h-[90vh] flex flex-col">
                  <div className="sticky top-0 p-6 border-b border-[var(--ip-border)] bg-[var(--ip-surface)] flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-[var(--ip-text)]">{editingFirm ? 'Edit Prop Firm' : 'Add New Prop Firm'}</h2>
                    <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-[var(--ip-surface-2)]">
                      <X size={20} className="text-[var(--ip-text-2)]" />
                    </button>
                  </div>

                  <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* SECTION 1: BASIC INFORMATION */}
                    <div>
                      <button type="button" onClick={() => toggleSection('basic')} className="w-full flex items-center justify-between p-3 bg-[var(--ip-surface-2)] rounded-lg mb-4">
                        <h3 className="text-lg font-semibold text-[var(--ip-text)]"> Basic Information</h3>
                        {expandedSections.has('basic') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      {expandedSections.has('basic') && (
                        <div className="space-y-4 p-4 bg-[var(--ip-surface-2)] rounded-lg">
                          <LogoUpload 
                            currentLogo={formData.logo || ''} 
                            onLogoUploaded={(url) => setFormData({ ...formData, logo: url })} 
                            onLogoRemoved={() => setFormData({ ...formData, logo: '' })} 
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-[var(--ip-text-2)]">Name *</label>
                              <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-3 py-2 text-[var(--ip-text)]" required />
                            </div>
                            <div>
                              <label className="block text-sm text-[var(--ip-text-2)]">Status</label>
                              <select value={formData.status || 'ACTIVE'} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-3 py-2 text-[var(--ip-text)]">
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="REVIEW">Under Review</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-[var(--ip-text-2)]">Website URL</label>
                              <input type="url" value={formData.website || ''} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="w-full bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-3 py-2 text-[var(--ip-text)]" />
                            </div>
                            <div>
                              <label className="block text-sm text-[var(--ip-text-2)]">Signup / Affiliate Link</label>
                              <input type="url" value={formData.signupLink || ''} onChange={(e) => setFormData({ ...formData, signupLink: e.target.value })} placeholder="https://..." className="w-full bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-3 py-2 text-[var(--ip-text)]" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-[var(--ip-text-2)]">Country</label>
                              <input type="text" value={formData.country || ''} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-3 py-2 text-[var(--ip-text)]" />
                            </div>
                            <div>
                              <label className="block text-sm text-[var(--ip-text-2)]">Headquarters</label>
                              <input type="text" value={formData.headquarters || ''} onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })} className="w-full bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-3 py-2 text-[var(--ip-text)]" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm text-[var(--ip-text-2)]">Short Description</label>
                            <input type="text" value={formData.shortDescription || ''} onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} placeholder="Brief tagline" className="w-full bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-3 py-2 text-[var(--ip-text)]" />
                          </div>

                          <div>
                            <label className="block text-sm text-[var(--ip-text-2)]">Full Description</label>
                            <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-3 py-2 text-[var(--ip-text)] resize-none" />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-[var(--ip-text-2)]">Founded Year</label>
                              <input type="number" value={formData.founded || ''} onChange={(e) => setFormData({ ...formData, founded: e.target.value })} className="w-full bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-3 py-2 text-[var(--ip-text)]" />
                            </div>
                            <div>
                              <label className="block text-sm text-[var(--ip-text-2)]">Founded Month</label>
                              <input type="text" value={formData.foundedMonth || ''} onChange={(e) => setFormData({ ...formData, foundedMonth: e.target.value })} placeholder="May 2023" className="w-full bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-3 py-2 text-[var(--ip-text)]" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-[var(--ip-text-2)]">CEO</label>
                              <input type="text" value={formData.ceo || ''} onChange={(e) => setFormData({ ...formData, ceo: e.target.value })} className="w-full bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-3 py-2 text-[var(--ip-text)]" />
                            </div>
                            <div>
                              <label className="block text-sm text-[var(--ip-text-2)]">Legal Name</label>
                              <input type="text" value={formData.legalName || ''} onChange={(e) => setFormData({ ...formData, legalName: e.target.value })} className="w-full bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-3 py-2 text-[var(--ip-text)]" />
                            </div>
                          </div>

                          <ArrayInput label="Tradable Assets" values={formData.assets || []} onChange={(val) => setFormData({ ...formData, assets: val })} placeholder="Forex, Crypto, Indices" />

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-[var(--ip-text-2)]">Years in Operation</label>
                              <input type="number" value={formData.yearsInOperation || ''} onChange={(e) => setFormData({ ...formData, yearsInOperation: e.target.value })} className="w-full bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-3 py-2 text-[var(--ip-text)]" />
                            </div>
                            <div>
                              <label className="block text-sm text-[var(--ip-text-2)]">Contact Email</label>
                              <input type="email" value={formData.contactEmail || ''} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} className="w-full bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-3 py-2 text-[var(--ip-text)]" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center gap-2">
                              <input type="checkbox" checked={formData.regulated || false} onChange={(e) => setFormData({ ...formData, regulated: e.target.checked })} className="rounded border-zinc-600" />
                              <span className="text-[var(--ip-text)]">Regulated Firm</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input type="checkbox" checked={formData.isRecommended || false} onChange={(e) => setFormData({ ...formData, isRecommended: e.target.checked })} className="rounded border-zinc-600" />
                              <span className="text-[var(--ip-text)]">Recommended / Featured</span>
                            </label>
                          </div>

                          <div>
                            <label className="block text-sm text-[var(--ip-text-2)]">Trustpilot URL</label>
                            <input type="url" value={formData.trustpilotUrl || ''} onChange={(e) => setFormData({ ...formData, trustpilotUrl: e.target.value })} placeholder="https://www.trustpilot.com/review/..." className="w-full bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-3 py-2 text-[var(--ip-text)]" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SECTION 2: PAYOUT */}
                    <div>
                      <button type="button" onClick={() => toggleSection('payout')} className="w-full flex items-center justify-between p-3 bg-[var(--ip-surface-2)] rounded-lg mb-4">
                        <h3 className="text-lg font-semibold text-[var(--ip-text)]"> Payout Settings</h3>
                        {expandedSections.has('payout') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      {expandedSections.has('payout') && (
                        <div className="space-y-4 p-4 bg-[var(--ip-surface-2)] rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-[var(--ip-text-2)]">Payout Frequency</label>
                              <select value={formData.payoutFrequency || ''} onChange={(e) => setFormData({ ...formData, payoutFrequency: e.target.value })} className="w-full bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-3 py-2 text-[var(--ip-text)]">
                                <option value="">Select</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Bi-weekly">Bi-Weekly</option>
                                <option value="Monthly">Monthly</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm text-[var(--ip-text-2)]">Minimum Payout ($)</label>
                              <input type="number" value={formData.minimumPayout || ''} onChange={(e) => setFormData({ ...formData, minimumPayout: e.target.value })} className="w-full bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-3 py-2 text-[var(--ip-text)]" />
                            </div>
                          </div>
                          <ArrayInput label="Payout Methods" values={formData.payoutMethods || []} onChange={(val) => setFormData({ ...formData, payoutMethods: val })} placeholder="Bank Transfer, Crypto, Skrill" />
                        </div>
                      )}
                    </div>

                    {/* SECTION 3: PROGRAMS */}
                    <div>
                      <button type="button" onClick={() => toggleSection('programs')} className="w-full flex items-center justify-between p-3 bg-[var(--ip-surface-2)] rounded-lg mb-4">
                        <h3 className="text-lg font-semibold text-[var(--ip-text)]"> Programs</h3>
                        {expandedSections.has('programs') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      {expandedSections.has('programs') && (
                        <div className="space-y-4 p-4 bg-[var(--ip-surface-2)] rounded-lg">
                          {formData.programs && formData.programs.map((program: any, idx: number) => (
                            <ProgramItem key={idx} program={program} index={idx} onChange={updateProgram} onRemove={removeProgram} />
                          ))}
                          <button type="button" onClick={addProgram} className="text-sm text-blue-400 flex items-center gap-1">
                            <PlusCircle size={14} /> Add Program
                          </button>
                        </div>
                      )}
                    </div>

                    {/* SECTION 4: PROMOTIONS */}
                    <div>
                      <button type="button" onClick={() => toggleSection('promotions')} className="w-full flex items-center justify-between p-3 bg-[var(--ip-surface-2)] rounded-lg mb-4">
                        <h3 className="text-lg font-semibold text-[var(--ip-text)]">️ Promotions</h3>
                        {expandedSections.has('promotions') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      {expandedSections.has('promotions') && (
                        <div className="space-y-4 p-4 bg-[var(--ip-surface-2)] rounded-lg">
                          {formData.promotions && formData.promotions.map((promotion: any, idx: number) => (
                            <PromotionItem key={idx} promotion={promotion} index={idx} onChange={updatePromotion} onRemove={removePromotion} />
                          ))}
                          <button type="button" onClick={addPromotion} className="text-sm text-blue-400 flex items-center gap-1">
                            <PlusCircle size={14} /> Add Promotion
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 p-6 border-t border-[var(--ip-border)]">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-[var(--ip-surface-2)] rounded-lg text-[var(--ip-text)] hover:bg-zinc-700">
                      Cancel
                    </button>
                    <button type="button" onClick={handleSubmit} disabled={submitting} className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-pink-600 rounded-lg text-[var(--ip-text)] font-medium hover:from-blue-500 hover:to-pink-500 disabled:opacity-50">
                      {submitting ? 'Saving...' : (editingFirm ? 'Update Prop Firm' : 'Create Prop Firm')}
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}