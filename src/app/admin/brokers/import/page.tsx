'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, CheckCircle, XCircle, Loader2, FileJson, AlertCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

export default function ImportBrokersPage() {
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
        const brokers = JSON.parse(content);
        
        const response = await fetch('/api/admin/brokers/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(brokers),
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
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/brokers" className="p-2 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Import Brokers</h1>
            <p className="text-zinc-400 text-sm">Upload a JSON file to bulk import brokers</p>
          </div>
        </div>

        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-8">
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

          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {result && (
            <div className="mt-4 p-4 bg-zinc-800 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Import Results:</h3>
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <CheckCircle size={16} /> Successfully imported: {result.imported} brokers
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
                onClick={() => router.push('/admin/brokers')}
                className="mt-4 px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-500 transition-colors"
              >
                View All Brokers
              </button>
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={!file || importing}
            className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-500 hover:to-pink-500 transition-all flex items-center justify-center gap-2"
          >
            {importing ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
            {importing ? 'Importing...' : 'Import Brokers'}
          </button>
        </div>

        <div className="mt-6 p-4 bg-zinc-800/30 rounded-lg border border-zinc-800">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <FileJson size={16} className="text-purple-400" />
            JSON Format Example:
          </h3>
          <pre className="text-xs text-zinc-400 bg-zinc-900 p-3 rounded-lg overflow-x-auto">
{`[
  {
    "name": "Deriv",
    "website": "https://deriv.com",
    "shortDescription": "Trade CFDs with $5 min deposit, 1:1000 leverage",
    "description": "Full description here...",
    "founded": 1999,
    "headquarters": "Birkirkara, Malta",
    "country": "Malta",
    "contactEmail": "support@deriv.com",
    "contactPhone": "+356 2778 0350",
    "regulated": true,
    "minDeposit": 5,
    "leverage": "1:1000",
    "spreads": {
      "eurusd": "0.5 - 0.6 pips",
      "gbpusd": "0.6 - 0.7 pips"
    },
    "platforms": ["MT5", "cTrader", "Deriv X"],
    "features": ["24/7 trading", "Negative balance protection"],
    "depositMethods": ["Credit Card", "Bank Transfer", "Crypto"],
    "withdrawalMethods": ["Bank Transfer", "Crypto"],
    "supportLanguages": ["English", "Spanish", "Arabic"],
    "supportAvailability": "24/7"
  }
]`}
          </pre>
          <p className="text-xs text-zinc-500 mt-3">
            💡 You can import a single broker or multiple brokers in an array. All fields are optional except "name".
          </p>
        </div>
      </div>
    </div>
  );
}