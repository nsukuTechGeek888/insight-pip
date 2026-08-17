'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, AlertTriangle, Upload, Check, XCircle, Clock, 
  DollarSign, Banknote, Shield, AlertCircle, Send
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'broker' | 'propFirm';
  entityId: number;
  entityName: string;
  onSuccess?: () => void;
}

interface IncidentType {
  id: string;
  displayName: string;
  category: string;
  severity: number;
  icon: string;
  description: string;
}

export default function ReportIncidentModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityName,
  onSuccess
}: ReportIncidentModalProps) {
  const { user } = useUser();
  const [step, setStep] = useState<'select' | 'details' | 'submit'>('select');
  const [selectedType, setSelectedType] = useState<IncidentType | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    incidentDate: new Date().toISOString().split('T')[0],
    withdrawalAmount: '',
    withdrawalMethod: '',
    proofFiles: [] as File[]
  });
  const [incidentTypes, setIncidentTypes] = useState<Record<string, IncidentType[]>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [remainingReports, setRemainingReports] = useState(3);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchIncidentTypes();
      checkRemainingReports();
    }
  }, [isOpen]);

  const fetchIncidentTypes = async () => {
    try {
      const response = await fetch('/api/incidents/types');
      const data = await response.json();
      setIncidentTypes(data.grouped);
      setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching incident types:', error);
    }
  };

  const checkRemainingReports = async () => {
    try {
      const response = await fetch('/api/incidents?days=1');
      const data = await response.json();
      const count = data.incidents?.length || 0;
      setRemainingReports(3 - count);
    } catch (error) {
      console.error('Error checking reports:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please login to report an incident');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        entityType,
        entityId,
        incidentType: selectedType?.id,
        title: formData.title,
        description: formData.description,
        incidentDate: new Date(formData.incidentDate).toISOString(),
        ...(formData.withdrawalAmount && { withdrawalAmount: parseFloat(formData.withdrawalAmount) }),
        ...(formData.withdrawalMethod && { withdrawalMethod: formData.withdrawalMethod })
      };

      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to report incident');
      }

      // Handle proof uploads if any
      if (formData.proofFiles.length > 0 && data.incident?.id) {
        for (const file of formData.proofFiles) {
          const proofFormData = new FormData();
          proofFormData.append('file', file);
          
          await fetch(`/api/incidents/${data.incident.id}/proof`, {
            method: 'POST',
            credentials: 'include',
            body: proofFormData
          });
        }
      }

      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setStep('select');
        setSelectedType(null);
        setFormData({
          title: '',
          description: '',
          incidentDate: new Date().toISOString().split('T')[0],
          withdrawalAmount: '',
          withdrawalMethod: '',
          proofFiles: []
        });
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        proofFiles: [...prev.proofFiles, ...files]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      proofFiles: prev.proofFiles.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl border border-zinc-700 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Report Incident</h2>
                <p className="text-sm text-zinc-400">
                  Help the community by reporting issues with {entityName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Rate Limit Warning */}
          {remainingReports < 3 && (
            <div className="mx-6 mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                You have {remainingReports} incident report{remainingReports !== 1 ? 's' : ''} remaining today
              </p>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Incident Reported!</h3>
                <p className="text-zinc-400">
                  Thank you for helping the community. Your report will be reviewed shortly.
                </p>
              </div>
            ) : step === 'select' ? (
              <div>
                <p className="text-zinc-300 mb-4">What type of incident are you reporting?</p>
                <div className="space-y-4">
                  {categories.map(category => (
                    <div key={category}>
                      <h3 className="text-sm font-semibold text-zinc-400 mb-2 capitalize">
                        {category} Issues
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {incidentTypes[category]?.map(type => (
                          <button
                            key={type.id}
                            onClick={() => {
                              setSelectedType(type);
                              setStep('details');
                            }}
                            className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600 transition-all text-left group"
                          >
                            <span className="text-xl">{type.icon}</span>
                            <div className="flex-1">
                              <div className="font-medium text-white text-sm">{type.displayName}</div>
                              <div className="text-xs text-zinc-400">{type.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : step === 'details' ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Selected Incident Type */}
                <div className="p-3 bg-zinc-800/50 rounded-xl border border-zinc-700">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedType?.icon}</span>
                    <div>
                      <div className="font-medium text-white">{selectedType?.displayName}</div>
                      <div className="text-xs text-zinc-400">{selectedType?.description}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep('select')}
                      className="ml-auto text-xs text-purple-400 hover:underline"
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Brief summary of the issue"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Please provide as much detail as possible..."
                    rows={4}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
                    required
                  />
                </div>

                {/* Incident Date */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    When did this happen? *
                  </label>
                  <input
                    type="date"
                    value={formData.incidentDate}
                    onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                {/* Withdrawal Specific Fields */}
                {selectedType?.id.includes('WITHDRAWAL') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Amount
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          type="number"
                          value={formData.withdrawalAmount}
                          onChange={(e) => setFormData({ ...formData, withdrawalAmount: e.target.value })}
                          placeholder="0.00"
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Method
                      </label>
                      <select
                        value={formData.withdrawalMethod}
                        onChange={(e) => setFormData({ ...formData, withdrawalMethod: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="">Select method</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Crypto">Crypto</option>
                        <option value="Card">Card</option>
                        <option value="Skrill">Skrill</option>
                        <option value="Neteller">Neteller</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Proof Upload */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Upload Proof (Optional)
                  </label>
                  <div className="border-2 border-dashed border-zinc-700 rounded-xl p-4 text-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      multiple
                      accept="image/*,.pdf"
                      className="hidden"
                    />
                    
                    {formData.proofFiles.length === 0 ? (
                      <div className="space-y-3">
                        <Upload className="w-10 h-10 text-zinc-500 mx-auto" />
                        <p className="text-zinc-400 text-sm">
                          Drag files here or click to upload
                        </p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 text-sm bg-zinc-800 rounded-lg text-white hover:bg-zinc-700 transition-colors"
                        >
                          Select Files
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {formData.proofFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-zinc-800 rounded-lg p-2">
                            <span className="text-sm text-zinc-300 truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-sm text-purple-400 hover:underline"
                        >
                          Add more files
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-zinc-500 mt-2">
                      Screenshots of withdrawals, trade history, or account dashboard
                    </p>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep('select')}
                    className="flex-1 px-4 py-3 bg-zinc-800 rounded-xl text-white font-medium hover:bg-zinc-700 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || remainingReports === 0}
                    className={`flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all ${
                      loading || remainingReports === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:from-purple-500 hover:to-pink-500'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Report
                      </>
                    )}
                  </button>
                </div>

                {remainingReports === 0 && (
                  <p className="text-center text-sm text-yellow-400">
                    Daily limit reached. Please try again tomorrow.
                  </p>
                )}
              </form>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}