// app/admin/prop-firms/import/page.tsx
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, CheckCircle, XCircle, Loader2, FileJson, AlertCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

export default function ImportPropFirmsPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isLoading && (!user || user.role !== 'ADMIN')) {
    router.push('/');
    return null;
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/json') {
      setFile(droppedFile);
      setError(null);
      setResult(null);
    } else {
      setError('Please drop a valid JSON file');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/json') {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    } else {
      setError('Please select a JSON file');
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    setImporting(true);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const firms = JSON.parse(content);
        
        const response = await fetch('/api/admin/prop-firms/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(firms),
        });
        
        const data = await response.json();
        if (response.ok) {
          setResult(data);
          setFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
          setError(data.error || 'Import failed');
        }
      } catch (err) {
        setError('Invalid JSON format. Please check your file structure.');
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/prop-firms" className="p-2 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Import Prop Firms</h1>
            <p className="text-zinc-400 text-sm">Upload a JSON file to bulk import prop firms</p>
          </div>
        </div>

        {/* Main Import Card */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-8">
          {/* Drag & Drop Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              dragActive 
                ? 'border-purple-500 bg-purple-500/10' 
                : 'border-zinc-700 hover:border-purple-500/50 bg-zinc-800/30'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <FileJson size={48} className="mx-auto text-zinc-500 mb-4" />
            <p className="text-zinc-400 mb-2">Drag & drop your JSON file here</p>
            <p className="text-xs text-zinc-500 mb-4">or click to browse</p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleFileChange}
              className="hidden"
              id="json-file"
            />
            <label
              htmlFor="json-file"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg text-white cursor-pointer hover:bg-purple-500 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Upload size={16} /> Select JSON File
            </label>
            
            {file && (
              <div className="mt-4 p-3 bg-zinc-800 rounded-lg">
                <p className="text-white text-sm flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-400" />
                  {file.name}
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Success Results */}
          {result && (
            <div className="mt-4 p-4 bg-zinc-800 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Import Results:</h3>
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <CheckCircle size={16} /> Successfully imported: {result.imported} prop firms
              </div>
              {result.errors?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-700">
                  <p className="text-red-400 flex items-center gap-2 mb-2">
                    <XCircle size={16} /> Errors: {result.errors.length}
                  </p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {result.errors.map((err: any, i: number) => (
                      <p key={i} className="text-xs text-zinc-400">
                        ❌ {err.name}: {err.error}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={() => router.push('/admin/prop-firms')}
                className="mt-4 px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-500 transition-colors"
              >
                View All Prop Firms
              </button>
            </div>
          )}

          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={!file || importing}
            className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-500 hover:to-pink-500 transition-all flex items-center justify-center gap-2"
          >
            {importing ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
            {importing ? 'Importing...' : 'Import Prop Firms'}
          </button>
        </div>

        {/* JSON Format Example */}
        <div className="mt-6 p-4 bg-zinc-800/30 rounded-lg border border-zinc-800">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <FileJson size={16} className="text-purple-400" />
            JSON Format Example:
          </h3>
          <pre className="text-xs text-zinc-400 bg-zinc-900 p-3 rounded-lg overflow-x-auto">
{`[
  {
    "name": "FTMO",
    "website": "https://ftmo.com",
    "shortDescription": "Leading prop firm with 90% profit split",
    "description": "Full description here...",
    "founded": 2015,
    "country": "Czech Republic",
    "regulated": false,
    "yearsInOperation": 9,
    "payoutFrequency": "Weekly",
    "minimumPayout": 100,
    "platforms": ["MT4", "MT5", "cTrader"],
    "features": ["No minimum trading days", "Scaling plan", "Free retry"],
    "programs": [
      {
        "name": "2-Step Challenge",
        "type": "Standard",
        "description": "Two-step evaluation process",
        "rules": {
          "profitTarget": "10% + 5%",
          "maxDrawdown": 10,
          "dailyDrawdown": 5,
          "minTradingDays": 0
        },
        "accountOptions": [
          {
            "accountSize": 10000,
            "price": 155,
            "payoutPercentage": 90,
            "maxAllocation": 10000,
            "profitSplit": 90,
            "minTradingDays": 0
          }
        ]
      }
    ],
    "promotions": [
      {
        "name": "Black Friday Sale",
        "discount": 30,
        "code": "BF30",
        "validUntil": "2025-12-31",
        "description": "30% off all challenges"
      }
    ]
  }
]`}
          </pre>
          <p className="text-xs text-zinc-500 mt-3">
            💡 You can import a single prop firm or multiple prop firms in an array. All fields are optional except "name".
          </p>
        </div>
      </div>
    </div>
  );
}