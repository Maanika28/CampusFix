import React from 'react';
import { Flame, AlertTriangle, AlertCircle, ArrowDown } from 'lucide-react';

const priorityConfig = {
  Urgent: {
    label: 'Urgent',
    bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
    icon: Flame,
    iconColor: 'text-rose-600',
  },
  High: {
    label: 'High',
    bg: 'bg-orange-50 text-orange-700 border-orange-200/80',
    icon: AlertTriangle,
    iconColor: 'text-orange-600',
  },
  Medium: {
    label: 'Medium',
    bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
    icon: AlertCircle,
    iconColor: 'text-amber-600',
  },
  Low: {
    label: 'Low',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    icon: ArrowDown,
    iconColor: 'text-emerald-600',
  },
};

export const PriorityBadge = ({ priority, score = null, size = 'sm' }) => {
  const config = priorityConfig[priority] || priorityConfig.Medium;
  const Icon = config.icon;

  const sizeClasses = size === 'lg'
    ? 'px-3 py-1.5 text-sm gap-2'
    : 'px-2 py-0.5 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${config.bg} ${sizeClasses}`}
    >
      <Icon className={`w-3.5 h-3.5 ${config.iconColor}`} />
      <span>{config.label}</span>
      {score !== null && (
        <span className="ml-1 opacity-75 font-mono text-[10px]">
          ({score} pts)
        </span>
      )}
    </span>
  );
};
export default PriorityBadge;
