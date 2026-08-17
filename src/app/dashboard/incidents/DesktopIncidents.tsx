'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  AlertTriangle, ArrowLeft, Eye, Clock, CheckCircle, 
  XCircle, Search, Filter, ChevronDown, Trash2,
  DollarSign, CreditCard, Users, Shield, Activity
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const generateGradient = (name: string) => {
  const gradients = [
    "from-pink-500 to-purple-500",
    "from-blue-500 to-purple-500",
    "from-green-500 to-blue-500",
    "from-yellow-500 to-orange-500",
    "from-red-500 to-pink-500",
  ];
  const index = (name?.length || 0) % gradients.length;
  return gradients[index];
};

// Incident Types
const incidentTypes = [
  { value: 'WITHDRAWAL_PAID', label: 'Withdrawal Paid', icon: CheckCircle, color: 'text-green-400' },
  { value: 'WITHDRAWAL_DELAY', label: 'Withdrawal Delay', icon: Clock, color: 'text-orange-400' },
  { value: 'WITHDRAWAL_REJECTED', label: 'Withdrawal Rejected', icon: XCircle, color: 'text-red-400' },
  { value: 'SLIPPAGE_ISSUES', label: 'Slippage Issues', icon: Activity, color: 'text-yellow-400' },
  { value: 'SPREAD_SPIKE', label: 'Spread Spike', icon: Activity, color: 'text-orange-400' },
  { value: 'EXECUTION_DELAY', label: 'Execution Delay', icon: Clock, color: 'text-yellow-400' },
  { value: 'PLATFORM_FREEZE', label: 'Platform Freeze', icon: Activity, color: 'text-purple-400' },
  { value: 'ACCOUNT_SUSPENDED', label: 'Account Suspended', icon: AlertTriangle, color: 'text-orange-400' },
  { value: 'ACCOUNT_BANNED', label: 'Account Banned', icon: AlertTriangle, color: 'text-red-400' },
];

export default function MyIncidentsPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchIncidents();
    }
  }, [user, isLoading, pagination.page, statusFilter]);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });
      const response = await fetch(`/api/user/incidents?${params}`, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setIncidents(data.incidents || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (incident: any) => {
    if (incident.resolutionStatus === 'RESOLVED') {
      return { text: 'Resolved', color: 'text-green-400', bg: 'bg-green-500/20', icon: CheckCircle };
    }
    if (incident.resolutionStatus === 'CONFIRMED') {
      return { text: 'Confirmed', color: 'text-blue-400', bg: 'bg-blue-500/20', icon: CheckCircle };
    }
    if (incident.status === 'APPROVED') {
      return { text: 'Approved', color: 'text-green-400', bg: 'bg-green-500/20', icon: CheckCircle };
    }
    if (incident.status === 'REJECTED') {
      return { text: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/20', icon: XCircle };
    }
    return { text: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: Clock };
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="p-2 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">My Incidents</h1>
            <p className="text-zinc-400 text-sm mt-1">Track your reported incidents</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="text-orange-400" />
              <div>
                <div className="text-2xl font-bold text-white">{pagination.total}</div>
                <div className="text-xs text-zinc-500">Total Reports</div>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">{incidents.filter(i => i.status === 'APPROVED' || i.resolutionStatus === 'RESOLVED').length}</div>
                <div className="text-xs text-zinc-500">Resolved</div>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-white">{incidents.filter(i => i.status === 'PENDING' && i.resolutionStatus !== 'RESOLVED').length}</div>
                <div className="text-xs text-zinc-500">Pending Review</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Incidents List */}
        {incidents.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/30 rounded-2xl border border-zinc-800">
            <Shield size={48} className="text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No incidents reported</h3>
            <p className="text-zinc-400 mb-6">Help the community by reporting issues</p>
            <Link href="/reviews?tab=incidents" className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-500 hover:to-red-500 transition-all">Report an Incident</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {incidents.map((incident) => {
              const typeInfo = incidentTypes.find(t => t.value === incident.incidentType);
              const IconComponent = typeInfo?.icon || AlertTriangle;
              const iconColor = typeInfo?.color || 'text-red-400';
              const statusBadge = getStatusBadge(incident);
              const StatusIcon = statusBadge.icon;
              
              let entityName = incident.entityName;
              if (!entityName && incident.entityType === 'broker') {
                entityName = incident.entityName || 'Unknown Broker';
              } else if (!entityName && incident.entityType === 'propFirm') {
                entityName = incident.entityName || 'Unknown Prop Firm';
              }

              return (
                <motion.div
                  key={incident.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-5 hover:border-orange-500/30 transition-all"
                >
                  <div className="flex flex-col md:flex-row gap-5">
                    {/* Left Side */}
                    <div className="md:w-48 flex-shrink-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${generateGradient(entityName || 'Incident')} flex items-center justify-center text-white font-bold text-lg`}>
                          {entityName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{entityName || 'Unknown'}</h3>
                          <p className="text-xs text-zinc-500 capitalize">{incident.entityType || 'Unknown'}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 p-2 rounded-lg ${statusBadge.bg}`}>
                        <StatusIcon size={14} className={statusBadge.color} />
                        <span className={`text-xs ${statusBadge.color}`}>{statusBadge.text}</span>
                      </div>
                    </div>
                    
                    {/* Right Side */}
                    <div className="flex-1">
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <IconComponent size={16} className={iconColor} />
                          <h4 className="text-lg font-semibold text-white">{incident.title}</h4>
                        </div>
                        <Link
                          href={`/incidents/${incident.id}`}
                          className="p-2 rounded-lg text-zinc-500 hover:text-blue-400 transition-colors"
                        >
                          <Eye size={16} />
                        </Link>
                      </div>
                      <p className="text-zinc-300 text-sm leading-relaxed line-clamp-2">{incident.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-zinc-500 mt-3">
                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(incident.incidentDate || incident.createdAt).toLocaleDateString()}</span>
                        {incident.withdrawalAmount && <span className="flex items-center gap-1"><DollarSign size={12} /> ${incident.withdrawalAmount.toLocaleString()}</span>}
                        {incident.withdrawalMethod && <span className="flex items-center gap-1"><CreditCard size={12} /> {incident.withdrawalMethod}</span>}
                        <span className="flex items-center gap-1"><Users size={12} /> {incident.confirmations || 0} confirmations</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button disabled={pagination.page === 1} onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} className="px-3 py-1.5 text-sm text-zinc-400 disabled:opacity-50 hover:text-white border border-zinc-700 rounded-lg">Prev</button>
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => i + Math.max(1, pagination.page - 2)).filter(p => p <= pagination.pages).map(p => (
              <button key={p} onClick={() => setPagination(prev => ({ ...prev, page: p }))} className={`px-3 py-1.5 text-sm rounded-lg ${p === pagination.page ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white border border-zinc-700'}`}>{p}</button>
            ))}
            <button disabled={pagination.page === pagination.pages} onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} className="px-3 py-1.5 text-sm text-zinc-400 disabled:opacity-50 hover:text-white border border-zinc-700 rounded-lg">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}