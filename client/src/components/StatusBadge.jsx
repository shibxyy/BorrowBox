import React from 'react';
import { Clock, CheckCircle2, PackageCheck, RotateCcw, Award, XCircle } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const configs = {
    Requested: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Clock,
      label: 'Requested'
    },
    Approved: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: CheckCircle2,
      label: 'Approved'
    },
    Active: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold animate-pulse',
      icon: PackageCheck,
      label: 'Active (Handed Over)'
    },
    Returned: {
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: RotateCcw,
      label: 'Returned'
    },
    Completed: {
      bg: 'bg-teal-50 text-teal-700 border-teal-200',
      icon: Award,
      label: 'Completed'
    },
    Rejected: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle,
      label: 'Rejected'
    },
    Cancelled: {
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      icon: XCircle,
      label: 'Cancelled'
    }
  };

  const config = configs[status] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Clock,
    label: status
  };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

