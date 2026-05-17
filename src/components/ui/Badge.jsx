import React from 'react';

const STATUS_STYLES = {
  completed: 'status-completed',
  late: 'status-late',
  missed: 'status-missed',
  pending: 'status-pending',
  upcoming: 'status-upcoming',
};

const STATUS_LABELS = {
  completed: '✓ Completed',
  late: '⚠ Late',
  missed: '✕ Missed',
  pending: '● Active',
  upcoming: '○ Upcoming',
};

export default function Badge({ status, label, className = '' }) {
  const style = STATUS_STYLES[status] || 'bg-white/10 text-slate-400 border-white/20';
  const text = label || STATUS_LABELS[status] || status;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${style} ${className}`}>
      {text}
    </span>
  );
}
