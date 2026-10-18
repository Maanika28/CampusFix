import React from 'react';
import {
  Zap,
  Droplets,
  Wifi,
  Armchair,
  Sparkles,
  FlaskConical,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

const categoryMap = {
  Electrical: { icon: Zap, bg: 'bg-amber-500/10 text-amber-600 border-amber-200' },
  Plumbing: { icon: Droplets, bg: 'bg-sky-500/10 text-sky-600 border-sky-200' },
  'Wi-Fi': { icon: Wifi, bg: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  Furniture: { icon: Armchair, bg: 'bg-indigo-500/10 text-indigo-600 border-indigo-200' },
  Cleanliness: { icon: Sparkles, bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
  Laboratory: { icon: FlaskConical, bg: 'bg-purple-500/10 text-purple-600 border-purple-200' },
  Safety: { icon: ShieldAlert, bg: 'bg-rose-500/10 text-rose-600 border-rose-200' },
  Others: { icon: HelpCircle, bg: 'bg-slate-500/10 text-slate-600 border-slate-200' },
};

export const CategoryIcon = ({ category, size = 'md', className = '' }) => {
  const item = categoryMap[category] || categoryMap.Others;
  const Icon = item.icon;

  const sizeClasses = {
    sm: 'w-7 h-7 p-1.5 text-xs',
    md: 'w-9 h-9 p-2 text-sm',
    lg: 'w-12 h-12 p-2.5 text-base',
  }[size] || 'w-9 h-9 p-2';

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size] || 'w-5 h-5';

  return (
    <div className={`inline-flex items-center justify-center rounded-xl border ${item.bg} ${sizeClasses} ${className}`}>
      <Icon className={iconSizes} />
    </div>
  );
};
export default CategoryIcon;
