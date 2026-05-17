import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import { getProgramById } from '../data/programs';
import { getShiftLabel, formatTime, parseSlotTime } from '../utils/timeUtils';
import { calculateCompliance } from '../utils/complianceUtils';
import { useTaskTimer } from '../hooks/useTaskTimer';
import TaskCard from '../components/tasks/TaskCard';
import TaskSignOffModal from '../components/tasks/TaskSignOffModal';
import Badge from '../components/ui/Badge';
import { Clock, CheckCircle, AlertCircle, Calendar, TrendingUp, Sun, Sunset, Moon } from 'lucide-react';

const SHIFT_ICONS = { day: Sun, evening: Sunset, night: Moon };
const SHIFT_COLORS = { day: 'text-amber-400', evening: 'text-orange-400', night: 'text-blue-400' };

function CountdownTimer({ endTime }) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const calc = () => {
      const end = parseSlotTime(endTime);
      setSecs(Math.max(0, Math.floor((end - new Date()) / 1000)));
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endTime]);

  const m = Math.floor(secs / 60);
  const s = secs % 60;
  const urgent = secs < 5 * 60 && secs > 0;

  return (
    <span className={`font-mono font-bold tabular-nums text-sm ${urgent ? 'text-red-400 animate-pulse' : 'text-teal-400'}`}>
      {m}:{String(s).padStart(2, '0')}
    </span>
  );
}

export default function StaffDashboard() {
  useTaskTimer();
  const { user, selectedShift } = useAuthStore();
  const { getActiveTasks } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const tasks = getActiveTasks();
  const program = getProgramById(user?.programId);
  const ShiftIcon = SHIFT_ICONS[selectedShift] || Sun;

  // Stats
  const completed = tasks.filter(t => t.status === 'completed').length;
  const late = tasks.filter(t => t.status === 'late').length;
  const missed = tasks.filter(t => t.status === 'missed').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const compliance = calculateCompliance(tasks.filter(t => t.status !== 'upcoming'));
  const currentTask = tasks.find(t => t.status === 'pending');

  const openTask = (task) => {
    if (task.status === 'upcoming' || task.status === 'completed') return;
    setSelectedTask(task);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Tasks</h1>
          <p className="text-slate-400 text-sm mt-0.5 flex items-center gap-2">
            <ShiftIcon size={14} className={SHIFT_COLORS[selectedShift]} />
            {program?.name} · {getShiftLabel(selectedShift)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-slate-500 text-xs">Today</p>
          <p className="text-white text-sm font-medium">{new Date().toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Current active task banner */}
      {currentTask && (
        <div className="bg-gradient-to-r from-blue-500/15 to-teal-500/10 border border-blue-500/30 rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Currently Active
            </p>
            <CountdownTimer endTime={currentTask.endTime} />
          </div>
          <h3 className="text-white font-bold text-lg leading-tight mb-1">{currentTask.title}</h3>
          <p className="text-slate-400 text-sm mb-3 leading-relaxed">{currentTask.description}</p>
          <button
            onClick={() => openTask(currentTask)}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <CheckCircle size={16} />
            Sign Off Now
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Completed', value: completed, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Late', value: late, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Missed', value: missed, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Compliance', value: `${compliance}%`, color: compliance >= 80 ? 'text-emerald-400' : 'text-amber-400', bg: 'bg-white/5' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} border border-white/10 rounded-xl p-3 text-center`}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Shift progress */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-slate-300 text-sm font-medium">Shift Progress</p>
          <p className="text-teal-400 text-sm font-semibold">{completed + late}/{tasks.length} done</p>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-700"
            style={{ width: `${tasks.length ? ((completed + late) / tasks.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Task list */}
      <div>
        <h2 className="text-slate-300 text-sm font-semibold uppercase tracking-wider mb-3">Today's Schedule</h2>
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Calendar size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500">No tasks scheduled for this shift.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={() => openTask(task)} />
            ))
          )}
        </div>
      </div>

      <TaskSignOffModal
        task={selectedTask}
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedTask(null); }}
      />
    </div>
  );
}
