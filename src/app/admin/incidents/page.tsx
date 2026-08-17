'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  AlertTriangle, ArrowLeft, Search, RefreshCw, MoreVertical,
  CheckCircle, XCircle, Clock, Eye, Flag, Trash2,
  User, Building2, Shield, X, Loader2, 
  ChevronDown, ChevronRight, ThumbsUp, MessageCircle,
  Calendar, DollarSign, FileText, Ban, PlusCircle,
  Star
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

interface Incident {
  id: string;
  title: string;
  description: string;
  incidentType: string;
  status: string;
  resolutionStatus: string;
  incidentDate: string;
  createdAt: string;
  withdrawalAmount: number | null;
  withdrawalMethod: string | null;
  confirmations: number;
  disputes: number;
  verifiedBadge: boolean;
  proofUrls: string[];
  moderationNote?: string;
  user: { id: string; name: string; email: string; avatar?: string };
  broker?: { id: number; name: string; slug?: string };
  propFirm?: { id: number; name: string; slug?: string };
  displayStatus?: string;
}

export default function AdminIncidentsPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [flagging, setFlagging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    resolved: 0
  });

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
      return;
    }
    if (user?.role === 'ADMIN') {
      fetchIncidents();
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchIncidents();
    }
  }, [statusFilter, typeFilter, searchQuery]);

  const fetchIncidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      params.append('limit', '50');

      const response = await fetch(`/api/admin/incidents?${params}`, { 
        credentials: 'include' 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch incidents');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch incidents');
      }

      const incidentData = data.incidents || [];
      setIncidents(incidentData);
      
      // Calculate stats
      setStats({
        total: incidentData.length,
        pending: incidentData.filter((i: Incident) => i.status === 'PENDING').length,
        approved: incidentData.filter((i: Incident) => i.status === 'APPROVED').length,
        rejected: incidentData.filter((i: Incident) => i.status === 'REJECTED').length,
        resolved: incidentData.filter((i: Incident) => i.resolutionStatus === 'RESOLVED').length
      });
    } catch (error: any) {
      console.error('Error fetching incidents:', error);
      setError(error.message || 'Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  const moderateIncident = async (incidentId: string, action: string, note?: string) => {
    try {
      const response = await fetch(`/api/admin/incidents/${incidentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action, note })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to moderate incident');
      }
      
      const data = await response.json();
      
      if (data.success) {
        await fetchIncidents();
        alert(`Incident ${action}d successfully`);
      }
    } catch (error: any) {
      console.error('Error moderating incident:', error);
      alert(error.message || 'Failed to moderate incident');
    }
    setActionMenu(null);
  };

  const deleteIncident = async (incidentId: string) => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/incidents/${incidentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete incident');
      }
      
      const data = await response.json();
      
      if (data.success) {
        await fetchIncidents();
        setShowDeleteModal(false);
        setDeleteTarget(null);
        alert('Incident deleted successfully');
      }
    } catch (error: any) {
      console.error('Error deleting incident:', error);
      alert(error.message || 'Failed to delete incident');
    } finally {
      setDeleting(false);
    }
  };

  const flagIncident = async () => {
    if (!selectedIncidentId || !flagReason.trim()) {
      alert('Please enter a reason for flagging');
      return;
    }

    setFlagging(true);
    try {
      const response = await fetch(`/api/admin/incidents/${selectedIncidentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          action: 'flag',
          note: `FLAGGED: ${flagReason} (by ${user?.name || 'Admin'})`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to flag incident');
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchIncidents();
        setShowFlagModal(false);
        setFlagReason('');
        setSelectedIncidentId(null);
        alert('Incident flagged successfully');
      }
    } catch (error: any) {
      console.error('Error flagging incident:', error);
      alert(error.message || 'Failed to flag incident');
    } finally {
      setFlagging(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'APPROVED': return { text: 'Approved', color: 'text-green-400', bg: 'bg-green-500/20', icon: CheckCircle };
      case 'PENDING': return { text: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: Clock };
      case 'REJECTED': return { text: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/20', icon: XCircle };
      case 'FLAGGED': return { text: 'Flagged', color: 'text-orange-400', bg: 'bg-orange-500/20', icon: Flag };
      default: return { text: status, color: 'text-zinc-400', bg: 'bg-zinc-500/20', icon: Eye };
    }
  };

  const getResolutionStatusBadge = (status: string) => {
    switch(status) {
      case 'RESOLVED': return { text: 'Resolved', color: 'text-green-400', bg: 'bg-green-500/20' };
      case 'CONFIRMED': return { text: 'Confirmed', color: 'text-blue-400', bg: 'bg-blue-500/20' };
      case 'DISPUTED': return { text: 'Disputed', color: 'text-red-400', bg: 'bg-red-500/20' };
      default: return { text: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    }
  };

  const getIncidentTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getIncidentTypeColor = (type: string) => {
    if (type.includes('WITHDRAWAL')) return 'text-red-400 bg-red-500/20';
    if (type.includes('ACCOUNT')) return 'text-orange-400 bg-orange-500/20';
    if (type.includes('TRADE') || type.includes('EXECUTION') || type.includes('SLIPPAGE') || type.includes('SPREAD')) {
      return 'text-yellow-400 bg-yellow-500/20';
    }
    if (type.includes('PLATFORM') || type.includes('SERVER') || type.includes('LOGIN') || type.includes('ORDER')) {
      return 'text-blue-400 bg-blue-500/20';
    }
    if (type.includes('SCAM') || type.includes('SUSPICIOUS')) return 'text-purple-400 bg-purple-500/20';
    return 'text-zinc-400 bg-zinc-500/20';
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="p-2 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Incident Moderation</h1>
            <p className="text-zinc-400 text-sm">Manage and moderate user-reported incidents</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-zinc-900/30 rounded-lg p-4 border border-zinc-800">
            <p className="text-zinc-400 text-xs">Total</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-zinc-900/30 rounded-lg p-4 border border-yellow-500/20">
            <p className="text-zinc-400 text-xs">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="bg-zinc-900/30 rounded-lg p-4 border border-green-500/20">
            <p className="text-zinc-400 text-xs">Approved</p>
            <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
          </div>
          <div className="bg-zinc-900/30 rounded-lg p-4 border border-red-500/20">
            <p className="text-zinc-400 text-xs">Rejected</p>
            <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
          </div>
          <div className="bg-zinc-900/30 rounded-lg p-4 border border-blue-500/20">
            <p className="text-zinc-400 text-xs">Resolved</p>
            <p className="text-2xl font-bold text-blue-400">{stats.resolved}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input
              type="text"
              placeholder="Search incidents by title, description, or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="FLAGGED">Flagged</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm"
          >
            <option value="all">All Types</option>
            <option value="WITHDRAWAL_PAID">Withdrawal Paid</option>
            <option value="WITHDRAWAL_DELAY">Withdrawal Delay</option>
            <option value="WITHDRAWAL_REJECTED">Withdrawal Rejected</option>
            <option value="ACCOUNT_SUSPENDED">Account Suspended</option>
            <option value="ACCOUNT_BANNED">Account Banned</option>
            <option value="PLATFORM_FREEZE">Platform Freeze</option>
            <option value="SERVER_DOWN">Server Down</option>
            <option value="SCAM_WARNING">Scam Warning</option>
            <option value="OTHER">Other</option>
          </select>
          <button onClick={fetchIncidents} className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Incidents Table */}
        <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800/50 border-b border-zinc-800">
                <tr className="text-left text-xs text-zinc-400">
                  <th className="px-4 py-3">Incident</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Resolution</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                      {loading ? 'Loading...' : 'No incidents found'}
                    </td>
                  </tr>
                ) : (
                  incidents.map((incident) => {
                    const statusBadge = getStatusBadge(incident.status);
                    const StatusIcon = statusBadge.icon;
                    const resolutionBadge = getResolutionStatusBadge(incident.resolutionStatus);
                    const isExpanded = expandedIncident === incident.id;
                    const entityName = incident.broker?.name || incident.propFirm?.name || 'Unknown';
                    const typeColor = getIncidentTypeColor(incident.incidentType);
                    
                    return (
                      <Fragment key={incident.id}>
                        {/* Main Incident Row */}
                        <tr className="hover:bg-zinc-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-start gap-2">
                              <button
                                onClick={() => setExpandedIncident(isExpanded ? null : incident.id)}
                                className="mt-0.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                              >
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              </button>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium line-clamp-1">{incident.title}</p>
                                <p className="text-zinc-500 text-xs mt-1 line-clamp-2">{incident.description.substring(0, 100)}...</p>
                                <p className="text-xs text-zinc-600 mt-1">{entityName}</p>
                                {incident.withdrawalAmount && (
                                  <span className="text-xs text-green-400 mt-1 flex items-center gap-1">
                                    <DollarSign size={10} /> ${incident.withdrawalAmount}
                                  </span>
                                )}
                                {incident.verifiedBadge && (
                                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400">
                                    <CheckCircle size={10} /> Verified
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-white text-sm">{incident.user?.name || 'Anonymous'}</p>
                            <p className="text-zinc-500 text-xs">{incident.user?.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${typeColor}`}>
                              {getIncidentTypeLabel(incident.incidentType)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusBadge.bg} ${statusBadge.color}`}>
                              <StatusIcon size={10} /> {statusBadge.text}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${resolutionBadge.bg} ${resolutionBadge.color}`}>
                              {resolutionBadge.text}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-zinc-400 text-xs">
                            {new Date(incident.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="relative">
                              <button 
                                onClick={() => setActionMenu(actionMenu === incident.id ? null : incident.id)} 
                                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
                              >
                                <MoreVertical size={14} />
                              </button>
                              {actionMenu === incident.id && (
                                <div className="absolute right-0 mt-1 w-44 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-10">
                                  <button 
                                    onClick={() => {
                                      moderateIncident(incident.id, 'approve');
                                      setActionMenu(null);
                                    }} 
                                    className="w-full px-3 py-2 text-left text-xs text-green-400 hover:bg-zinc-800 flex items-center gap-2"
                                  >
                                    <CheckCircle size={12} /> Approve
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const note = prompt('Enter rejection reason (optional):');
                                      moderateIncident(incident.id, 'reject', note || undefined);
                                      setActionMenu(null);
                                    }} 
                                    className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-zinc-800 flex items-center gap-2"
                                  >
                                    <XCircle size={12} /> Reject
                                  </button>
                                  <button 
                                    onClick={() => {
                                      moderateIncident(incident.id, 'verify');
                                      setActionMenu(null);
                                    }} 
                                    className="w-full px-3 py-2 text-left text-xs text-blue-400 hover:bg-zinc-800 flex items-center gap-2"
                                  >
                                    <Shield size={12} /> Verify
                                  </button>
                                  <button 
                                    onClick={() => {
                                      moderateIncident(incident.id, 'resolve');
                                      setActionMenu(null);
                                    }} 
                                    className="w-full px-3 py-2 text-left text-xs text-purple-400 hover:bg-zinc-800 flex items-center gap-2"
                                  >
                                    <CheckCircle size={12} /> Resolve
                                  </button>
                                  <div className="border-t border-zinc-800 my-1"></div>
                                  <button 
                                    onClick={() => {
                                      setSelectedIncidentId(incident.id);
                                      setShowFlagModal(true);
                                      setActionMenu(null);
                                    }} 
                                    className="w-full px-3 py-2 text-left text-xs text-orange-400 hover:bg-zinc-800 flex items-center gap-2"
                                  >
                                    <Flag size={12} /> Flag Incident
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setDeleteTarget(incident.id);
                                      setShowDeleteModal(true);
                                      setActionMenu(null);
                                    }} 
                                    className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-zinc-800 flex items-center gap-2"
                                  >
                                    <Trash2 size={12} /> Delete Incident
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                        
                        {/* Expanded details section */}
                        {isExpanded && (
                          <tr className="bg-zinc-800/20">
                            <td colSpan={7} className="px-4 py-3">
                              <div className="pl-8 border-l-2 border-zinc-700/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Left Column - Details */}
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-xs text-zinc-500">Full Description</p>
                                      <p className="text-zinc-300 text-sm mt-1">{incident.description}</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <p className="text-xs text-zinc-500">Incident Date</p>
                                        <p className="text-white text-sm">
                                          {new Date(incident.incidentDate).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-zinc-500">Reported</p>
                                        <p className="text-white text-sm">
                                          {new Date(incident.createdAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                      {incident.withdrawalMethod && (
                                        <div>
                                          <p className="text-xs text-zinc-500">Withdrawal Method</p>
                                          <p className="text-white text-sm">{incident.withdrawalMethod}</p>
                                        </div>
                                      )}
                                      <div>
                                        <p className="text-xs text-zinc-500">Confirmations</p>
                                        <p className="text-white text-sm">{incident.confirmations}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-zinc-500">Disputes</p>
                                        <p className="text-white text-sm">{incident.disputes}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-zinc-500">Verified</p>
                                        <p className={incident.verifiedBadge ? 'text-green-400 text-sm' : 'text-zinc-500 text-sm'}>
                                          {incident.verifiedBadge ? 'Yes' : 'No'}
                                        </p>
                                      </div>
                                      {incident.moderationNote && (
                                        <div className="col-span-2">
                                          <p className="text-xs text-zinc-500">Moderation Note</p>
                                          <p className="text-yellow-400 text-sm">{incident.moderationNote}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Right Column - Proofs & Actions */}
                                  <div className="space-y-3">
                                    {incident.proofUrls && incident.proofUrls.length > 0 && (
                                      <div>
                                        <p className="text-xs text-zinc-500 mb-2">Proof Files ({incident.proofUrls.length})</p>
                                        <div className="flex flex-wrap gap-2">
                                          {incident.proofUrls.map((url, index) => (
                                            <a
                                              key={index}
                                              href={url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-800/50 text-xs text-blue-400 hover:bg-zinc-800 transition-colors"
                                            >
                                              <FileText size={12} />
                                              Proof {index + 1}
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div className="flex flex-wrap gap-2 pt-2">
                                      <button
                                        onClick={() => moderateIncident(incident.id, 'approve')}
                                        className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs flex items-center gap-1"
                                      >
                                        <CheckCircle size={12} /> Approve
                                      </button>
                                      <button
                                        onClick={() => {
                                          const note = prompt('Enter rejection reason (optional):');
                                          moderateIncident(incident.id, 'reject', note || undefined);
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs flex items-center gap-1"
                                      >
                                        <XCircle size={12} /> Reject
                                      </button>
                                      <button
                                        onClick={() => moderateIncident(incident.id, 'verify')}
                                        className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-xs flex items-center gap-1"
                                      >
                                        <Shield size={12} /> Verify
                                      </button>
                                      <button
                                        onClick={() => moderateIncident(incident.id, 'resolve')}
                                        className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 text-xs flex items-center gap-1"
                                      >
                                        <CheckCircle size={12} /> Resolve
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedIncidentId(incident.id);
                                          setShowFlagModal(true);
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 text-xs flex items-center gap-1"
                                      >
                                        <Flag size={12} /> Flag
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 max-w-md w-full">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-400" />
                <h3 className="text-lg font-bold text-white">Confirm Delete</h3>
              </div>
              <button onClick={() => setShowDeleteModal(false)} className="text-zinc-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-zinc-400 text-sm mb-4">
                Are you sure you want to delete this incident? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteIncident(deleteTarget)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete Incident
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flag Incident Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 max-w-md w-full">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag size={20} className="text-orange-400" />
                <h3 className="text-lg font-bold text-white">Flag Incident</h3>
              </div>
              <button onClick={() => setShowFlagModal(false)} className="text-zinc-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-zinc-400 text-sm mb-4">
                Please provide a reason for flagging this incident.
              </p>
              <textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="Enter reason for flagging..."
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500 min-h-[100px]"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowFlagModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={flagIncident}
                  disabled={flagging || !flagReason.trim()}
                  className="flex-1 px-4 py-2 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {flagging ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Flagging...
                    </>
                  ) : (
                    <>
                      <Flag size={16} />
                      Flag Incident
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}