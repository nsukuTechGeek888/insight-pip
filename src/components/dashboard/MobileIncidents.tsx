// components/dashboard/MobileIncidents.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, AlertTriangle, Clock, CheckCircle, 
  XCircle, Eye, DollarSign, CreditCard, Users, Shield
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import MobileLayout from '@/components/mobile/MobileLayout';

const incidentTypes = [
  { value: 'WITHDRAWAL_PAID', label: 'Withdrawal Paid', icon: CheckCircle, color: 'text-green-400' },
  { value: 'WITHDRAWAL_DELAY', label: 'Withdrawal Delay', icon: Clock, color: 'text-orange-400' },
  { value: 'WITHDRAWAL_REJECTED', label: 'Withdrawal Rejected', icon: XCircle, color: 'text-red-400' },
  { value: 'ACCOUNT_SUSPENDED', label: 'Account Suspended', icon: AlertTriangle, color: 'text-orange-400' },
];

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

export default function MobileMyIncidents() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchIncidents();
    }
  }, [user, isLoading, statusFilter]);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/user/incidents?${params}`, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setIncidents(data.incidents || []);
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
      <MobileLayout title="My Incidents" showSearch={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" />
        </div>
      </MobileLayout>
    );
  }

  const resolvedCount = incidents.filter(i => i.resolutionStatus === 'RESOLVED' || i.status === 'APPROVED').length;
  const pendingCount = incidents.filter(i => i.status === 'PENDING' && i.resolutionStatus !== 'RESOLVED').length;

  return (
    <MobileLayout title="My Incidents" showSearch={false}>
      <div className="space-y-4 pb-6">
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-500/10 rounded-xl p-3 border border-green-500/20 text-center">
            <div className="text-green-400 font-bold text-xl">{resolvedCount}</div>
            <div className="text-[10px] text-zinc-500">Resolved</div>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-3 border border-yellow-500/20 text-center">
            <div className="text-yellow-400 font-bold text-xl">{pendingCount}</div>
            <div className="text-[10px] text-zinc-500">Pending</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Incidents</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Incidents List */}
        {incidents.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/30 rounded-xl border border-zinc-800">
            <Shield size={32} className="text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No incidents reported</p>
            <Link href="/reviews?tab=incidents" className="text-orange-400 text-xs mt-2 inline-block">Report an incident →</Link>
          </div>
        ) : (
          <div className="space-y-3">
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
                  className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${generateGradient(entityName || 'Incident')} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {entityName?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-1">
                            <IconComponent size={12} className={iconColor} />
                            <h3 className="text-white font-semibold text-sm truncate">{incident.title}</h3>
                          </div>
                          <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{incident.description}</p>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${statusBadge.bg} flex-shrink-0`}>
                          <StatusIcon size={10} className={statusBadge.color} />
                          <span className={`text-[10px] ${statusBadge.color}`}>{statusBadge.text}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[10px] text-zinc-500 mt-2">
                        <span className="flex items-center gap-1"><Clock size={8} /> {new Date(incident.incidentDate || incident.createdAt).toLocaleDateString()}</span>
                        {incident.withdrawalAmount && <span className="flex items-center gap-1"><DollarSign size={8} /> ${incident.withdrawalAmount.toLocaleString()}</span>}
                        <span className="flex items-center gap-1"><Users size={8} /> {incident.confirmations || 0} confirms</span>
                      </div>
                      <Link href={`/incidents/${incident.id}`} className="text-purple-400 text-[10px] flex items-center gap-1 mt-2">
                        <Eye size={10} /> View details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}