import React from 'react';
import { Clock, UserCheck, RefreshCw, CheckCircle2, Archive } from 'lucide-react';

const statusConfig = {
  Pending: {
    label: 'Pending',
    bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
    dot: 'bg-amber-500',
    icon: Clock,
  },
  Assigned: {
    label: 'Assigned',
    bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
    dot: 'bg-blue-500',
    icon: UserCheck,
  },
  'In Progress': {
    label: 'In Progress',
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    dot: 'bg-indigo-500 animate-pulse',
    icon: RefreshCw,
  },
  Resolved: {
    label: 'Resolved',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  Closed: {
    label: 'Closed',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    icon: Archive,
  },
};

export const StatusBadge = ({ status, size = 'sm', showIcon = true }) => {
  const config = statusConfig[status] || statusConfig.Pending;
  const Icon = config.icon;

  const sizeClasses = size === 'lg' 
    ? 'px-3 py-1.5 text-sm gap-2' 
    : 'px-2.5 py-0.5 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${sizeClasses} transition-colors`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {showIcon && <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />}
      <span>{config.label}</span>
    </span>
  );
};
export default StatusBadge;
