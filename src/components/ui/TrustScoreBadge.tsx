'use client';

import { Shield, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrustScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function TrustScoreBadge({ 
  score, 
  size = 'md', 
  showLabel = true,
  className = '' 
}: TrustScoreBadgeProps) {
  // Determine color and label based on score
  let color = '';
  let bgColor = '';
  let borderColor = '';
  let label = '';
  let Icon = Shield;
  let glowColor = '';

  if (score >= 80) {
    color = 'text-green-400';
    bgColor = 'bg-green-500/20';
    borderColor = 'border-green-500/30';
    label = 'High Trust';
    Icon = ShieldCheck;
    glowColor = 'shadow-green-500/20';
  } else if (score >= 60) {
    color = 'text-yellow-400';
    bgColor = 'bg-yellow-500/20';
    borderColor = 'border-yellow-500/30';
    label = 'Medium Trust';
    Icon = Shield;
    glowColor = 'shadow-yellow-500/20';
  } else if (score >= 40) {
    color = 'text-orange-400';
    bgColor = 'bg-orange-500/20';
    borderColor = 'border-orange-500/30';
    label = 'Low Trust';
    Icon = ShieldAlert;
    glowColor = 'shadow-orange-500/20';
  } else {
    color = 'text-red-400';
    bgColor = 'bg-red-500/20';
    borderColor = 'border-red-500/30';
    label = 'Very Low Trust';
    Icon = ShieldX;
    glowColor = 'shadow-red-500/20';
  }

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 rounded-lg text-xs',
      icon: 'w-3 h-3',
      score: 'text-xs font-bold',
    },
    md: {
      container: 'px-3 py-1.5 rounded-xl text-sm',
      icon: 'w-4 h-4',
      score: 'text-sm font-bold',
    },
    lg: {
      container: 'px-4 py-2 rounded-xl text-base',
      icon: 'w-5 h-5',
      score: 'text-base font-bold',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 ${bgColor} ${borderColor} border ${sizes.container} ${glowColor} shadow-lg transition-all duration-300 hover:scale-105 ${className}`}
    >
      <Icon className={`${sizes.icon} ${color}`} />
      {showLabel && (
        <span className={`${color} font-medium`}>{label}</span>
      )}
      <span className={`${color} ${sizes.score}`}>
        {score}
      </span>
    </motion.div>
  );
}