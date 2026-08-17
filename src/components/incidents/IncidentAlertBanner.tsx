'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Clock, TrendingUp, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';

interface Alert {
  id: string;
  type: string;
  count: number;
  timeWindow: number;
  triggeredAt: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

interface IncidentAlertBannerProps {
  entityType: 'broker' | 'propFirm';
  entityId: number;
  entityName: string;
}

export default function IncidentAlertBanner({ 
  entityType, 
  entityId, 
  entityName 
}: IncidentAlertBannerProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    fetchAlerts();
  }, [entityType, entityId]);

  const fetchAlerts = async () => {
    try {
      const response = await fetch(
        `/api/incidents?entityType=${entityType}&entityId=${entityId}&days=7`,
        { credentials: 'include' }
      );
      const data = await response.json();
      
      if (data.alerts && data.alerts.length > 0) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = (alertId: string) => {
    setDismissed([...dismissed, alertId]);
  };

  const getAlertStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/30',
          text: 'text-red-400',
          icon: AlertCircle,
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/30',
          text: 'text-yellow-400',
          icon: AlertTriangle,
        };
      default:
        return {
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          icon: Info,
        };
    }
  };

  const activeAlerts = alerts.filter(alert => !dismissed.includes(alert.id));

  if (loading || activeAlerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {activeAlerts.map((alert, index) => {
        const styles = getAlertStyles(alert.severity);
        const IconComponent = styles.icon;
        
        return (
          <AnimatePresence key={alert.id}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`relative p-4 rounded-xl border ${styles.bg} ${styles.border} backdrop-blur-sm`}
            >
              <button
                onClick={() => dismissAlert(alert.id)}
                className="absolute top-3 right-3 text-zinc-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
              
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${styles.bg} border ${styles.border}`}>
                  <IconComponent className={`w-5 h-5 ${styles.text}`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className={`font-semibold ${styles.text}`}>
                      {alert.type.replace(/_/g, ' ')} Alert
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                      <Clock size={12} />
                      <span>{new Date(alert.triggeredAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                      <TrendingUp size={12} />
                      <span>{alert.count} reports in {alert.timeWindow}h</span>
                    </div>
                  </div>
                  
                  <p className="text-zinc-300 text-sm mt-1">{alert.message}</p>
                  
                  <div className="mt-3 flex gap-3">
                    <Link
                      href={`/${entityType === 'broker' ? 'brokers' : 'prop-firms'}/${entityId}/incidents`}
                      className={`text-xs ${styles.text} hover:underline`}
                    >
                      View all incidents →
                    </Link>
                    <button
                      onClick={() => {
                        // Trigger report incident modal
                        window.dispatchEvent(new CustomEvent('openIncidentReport', {
                          detail: { entityType, entityId, entityName }
                        }));
                      }}
                      className={`text-xs ${styles.text} hover:underline`}
                    >
                      Report similar issue →
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        );
      })}
    </div>
  );
}