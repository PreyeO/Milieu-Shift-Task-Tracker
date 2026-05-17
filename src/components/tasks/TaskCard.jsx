import React, { useState } from 'react';
import Badge from '../ui/Badge';
import { formatTime, getWindowProgress } from '../../utils/timeUtils';
import { Clock, CheckCircle, ChevronRight, MessageSquare } from 'lucide-react';

const STATUS_DOT = {
  completed: 'bg-emerald-400',
  late: 'bg-amber-400',
  missed: 'bg-red-500',
  pending: 'bg-blue-400 animate-pulse',
  upcoming: 'bg-slate-600',
};

const STATUS_RING = {
  completed: 'border-emerald-500/40 bg-emerald-500/5',
  late: 'border-amber-500/40 bg-amber-500/5',
  missed: 'border-red-500/40 bg-red-500/5',
  pending: 'border-blue-500/50 bg-blue-500/8 shadow-md shadow-blue-500/10',
  upcoming: 'border-white/10 bg-white/3',
};

export default function TaskCard({ task, onClick, showProgram = false }) {
  const progress = task.status === 'pending' ? getWindowProgress(task.startTime, task.endTime) : null;

  return (
    <button
      onClick={onClick}
      disabled={task.status === 'upcoming' || task.status === 'completed'}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 
        ${STATUS_RING[task.status]} 
        ${task.status === 'upcoming' ? 'opacity-50 cursor-default' : 'hover:border-white/25 active:scale-[0.99] cursor-pointer'}
        ${task.status === 'completed' ? 'cursor-default' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Status dot */}
        <div className="relative mt-0.5 flex-shrink-0">
          <div className={`w-3 h-3 rounded-full ${STATUS_DOT[task.status]}`} />
          {task.status === 'pending' && (
            <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-40" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className={`font-semibold text-sm leading-snug ${task.status === 'upcoming' ? 'text-slate-500' : 'text-white'}`}>
              {task.title}
            </p>
            <Badge status={task.status} className="flex-shrink-0 text-[10px]" />
          </div>

          <p className="text-slate-500 text-xs mb-2 flex items-center gap-1">
            <Clock size={10} />
            {task.startTime} – {task.endTime}
          </p>

          {/* Progress bar for active tasks */}
          {task.status === 'pending' && progress !== null && (
            <div className="mb-2">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${progress > 80 ? 'bg-red-500' : progress > 60 ? 'bg-amber-500' : 'bg-blue-400'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">{progress}% of window elapsed</p>
            </div>
          )}

          {/* Completed info */}
          {task.completedAt && (
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle size={11} />
              Signed off at {formatTime(task.completedAt)}
              {task.completedBy && <span className="text-white ml-1 bg-white/10 px-1.5 rounded text-[10px]">{task.completedBy}</span>}
              {task.status === 'late' && <span className="text-amber-400 ml-1">· LATE</span>}
            </p>
          )}

          {task.comment && (
            <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
              <MessageSquare size={10} className="mt-0.5 flex-shrink-0" />
              <span className="truncate">{task.comment}</span>
            </p>
          )}
        </div>

        {(task.status === 'pending' || task.status === 'missed') && (
          <ChevronRight size={16} className="text-slate-500 flex-shrink-0 mt-0.5" />
        )}
      </div>
    </button>
  );
}
