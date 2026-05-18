import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PROGRAMS } from '../data/programs';
import { TASK_TEMPLATES } from '../data/taskTemplates';
import { useTaskStore } from '../store/taskStore';
import { getShiftDateString } from '../utils/timeUtils';
import { calculateCompliance } from '../utils/complianceUtils';
import { 
  ClipboardList, Sun, Sunset, Moon, Clock, Users, 
  MapPin, MessageSquare, Search, Activity, ChevronDown 
} from 'lucide-react';
import Badge from '../components/ui/Badge';
import toast from 'react-hot-toast';

const SHIFT_TABS = [
  { key: 'day', label: 'Day Shift', icon: Sun, time: '7:00 AM – 3:00 PM' },
  { key: 'evening', label: 'Evening Shift', icon: Sunset, time: '3:00 PM – 11:00 PM' },
  { key: 'night', label: 'Night Shift', icon: Moon, time: '11:00 PM – 7:00 AM' },
];

function TaskRow({ task, sessionTask }) {
  const status = sessionTask?.status || 'upcoming';
  const completedAt = sessionTask?.completedAt;
  return (
    <div className={`flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border transition-colors ${
      status === 'completed' ? 'border-emerald-200 bg-emerald-50' :
      status === 'late' ? 'border-amber-200 bg-amber-50' :
      status === 'missed' ? 'border-rose-200 bg-rose-50' :
      status === 'pending' ? 'border-blue-200 bg-blue-50' :
      'border-slate-100 bg-slate-50'
    }`}>
      {/* Top Meta row on mobile (Time + Badge) */}
      <div className="flex items-center justify-between sm:block flex-shrink-0 w-full sm:w-auto">
        <div className="text-slate-500 text-xs font-mono sm:w-24 pt-0.5 flex items-center gap-1.5">
          <Clock size={12} className="sm:hidden text-slate-400" />
          <span>{task.startTime}–{task.endTime}</span>
        </div>
        <Badge status={status} className="sm:hidden text-[10px]" />
      </div>

      {/* Middle Details */}
      <div className="flex-1 min-w-0">
        <p className="text-slate-800 text-sm font-medium">{task.title}</p>
        <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">{task.description}</p>
        {completedAt && (
          <div className="mt-1">
            <p className="text-emerald-600 text-[10px] flex items-center flex-wrap gap-1">
              <span>✓ Signed off at {new Date(completedAt).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })}</span>
              {sessionTask?.completedBy ? ` by ` : ''}
              {sessionTask?.completedBy && <span className="font-semibold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded text-[9px]">{sessionTask.completedBy}</span>}
              {status === 'late' && <span className="text-amber-600 font-semibold">· LATE</span>}
            </p>
            {sessionTask?.comment && (
              <p className="text-slate-500 text-[10px] flex items-start gap-1 mt-1">
                <MessageSquare size={10} className="mt-0.5 flex-shrink-0" />
                <span>{sessionTask.comment}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Badge (Hidden on mobile, visible on tablet/desktop) */}
      <Badge status={status} className="hidden sm:inline-flex flex-shrink-0 text-[10px]" />
    </div>
  );
}

export default function ProgramsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [shift, setShift] = useState('day');
  const { initSession } = useTaskStore();
  const sessions = useTaskStore(state => state.sessions);

  // Initialize demo shifts for preview on mount
  useEffect(() => {
    const hour = new Date().getHours();
    const currentShift = hour >= 7 && hour < 15 ? 'day' : hour >= 15 && hour < 23 ? 'evening' : 'night';
    PROGRAMS.forEach(p => initSession(p.id, currentShift, 'demo-staff'));
  }, []);

  const focusId = searchParams.get('p');
  
  // Determine which program is currently active
  const activeProgramId = focusId && PROGRAMS.some(p => p.id === focusId) 
    ? focusId 
    : PROGRAMS[0]?.id;

  const activeProgram = PROGRAMS.find(p => p.id === activeProgramId);

  // Get active shift calculations for compliance
  const hour = new Date().getHours();
  const currentShift = hour >= 7 && hour < 15 ? 'day' : hour >= 15 && hour < 23 ? 'evening' : 'night';
  const sessionKey = activeProgram ? `${activeProgram.id}-${currentShift}-${getShiftDateString()}` : '';
  const activeSession = sessions[sessionKey];
  const sessionTasks = activeSession?.tasks || [];
  
  const completedTasks = sessionTasks.filter(t => t.status === 'completed' || t.status === 'late').length;
  const totalTasks = sessionTasks.length;
  const pendingTasks = sessionTasks.filter(t => t.status === 'pending').length;
  const compliance = calculateCompliance(sessionTasks.filter(t => t.status !== 'upcoming'));

  // Get selected shift routine tasks (filtered by user search)
  const allTemplates = activeProgram ? (TASK_TEMPLATES[activeProgram.id]?.[shift] || []) : [];
  const filteredTemplates = allTemplates.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  // Dynamic HSL branding for the compliance indicator card
  const colorThemes = {
    teal: { border: 'border-emerald-200', bg: 'bg-emerald-50/20', text: 'text-emerald-700', progress: 'bg-emerald-500' },
    blue: { border: 'border-blue-200', bg: 'bg-blue-50/20', text: 'text-blue-700', progress: 'bg-milieuBlue' },
    purple: { border: 'border-purple-200', bg: 'bg-purple-50/20', text: 'text-purple-700', progress: 'bg-purple-500' },
    orange: { border: 'border-orange-200', bg: 'bg-orange-50/20', text: 'text-orange-700', progress: 'bg-orange-500' },
    amber: { border: 'border-amber-200', bg: 'bg-amber-50/20', text: 'text-amber-700', progress: 'bg-milieuYellow' },
    green: { border: 'border-emerald-200', bg: 'bg-emerald-50/20', text: 'text-emerald-700', progress: 'bg-emerald-500' },
  };
  const theme = activeProgram ? (colorThemes[activeProgram.color] || colorThemes.teal) : colorThemes.teal;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-milieuNavy flex items-center gap-2">
            <ClipboardList size={22} className="text-milieuBlue" />
            Programs
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Task schedules for all residential homes</p>
        </div>
      </div>

      {/* Program Selector & Search Card */}
      <div className="glass-card p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Residential Home Selector */}
        <div className="sm:col-span-2">
          <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Residential Home / Program</label>
          <select 
            className="input-field py-1.5 px-2.5 text-xs text-slate-800"
            value={activeProgramId || ''}
            onChange={(e) => setSearchParams({ p: e.target.value })}
          >
            {PROGRAMS.map(p => (
              <option key={p.id} value={p.id}>{p.name} — {p.type}</option>
            ))}
          </select>
        </div>

        {/* Inline Search Bar */}
        <div className="sm:col-span-1">
          <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Filter Duties</label>
          <div className="relative w-full">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="input-field pl-9 pr-4 py-1.5 w-full text-xs text-slate-800"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {activeProgram ? (
        <div className="space-y-4">
          {/* Premium Compliance Dashboard Card */}
          <div className={`glass-card p-4 sm:p-5 border-l-4 ${theme.border} ${theme.bg} transition-all`}>
            <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
              {/* Left Column: Compliance circle & metadata */}
              <div className="flex items-center gap-4">
                {/* Big percentage indicator */}
                <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-slate-200/50 flex-shrink-0 bg-white shadow-xs">
                  <div className="text-center">
                    <span className={`text-xl sm:text-2xl font-black ${theme.text}`}>
                      {totalTasks > 0 ? `${compliance}%` : '—'}
                    </span>
                    <p className="text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-400 font-bold leading-none">Comp.</p>
                  </div>
                </div>

                {/* Quick Metadata */}
                <div>
                  <h2 className="text-slate-800 text-lg font-black leading-tight">{activeProgram.name}</h2>
                  <p className="text-slate-500 text-xs mt-0.5">{activeProgram.type}</p>
                  <p className="text-slate-400 text-[10px] mt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="flex items-center gap-0.5"><MapPin size={10} />{activeProgram.location}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5"><Users size={10} />Capacity: {activeProgram.capacity}</span>
                  </p>
                  <p className="text-slate-500 text-[9px] mt-1.5 font-semibold flex items-center gap-1 flex-wrap">
                    <span>📞 {activeProgram.phoneNumber}</span>
                    <span className="text-slate-400">|</span>
                    <span>Contact: {activeProgram.staffContact}</span>
                  </p>
                </div>
              </div>

              {/* Middle Stats: Progress bar */}
              <div className="flex-1 min-w-0 max-w-sm sm:px-4">
                <div className="flex items-center justify-between text-xs font-semibold mb-1 text-slate-700">
                  <span>Shift Duties Sign-off</span>
                  <span>{completedTasks} / {totalTasks} Completed</span>
                </div>
                <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${theme.progress} transition-all duration-500`}
                    style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  {pendingTasks > 0 ? `⚠ ${pendingTasks} tasks are pending verification today.` : '✓ All verified duties are signed off and current.'}
                </p>
              </div>

              {/* Right Column: Shift active status indicator */}
              <div className="flex flex-col sm:items-end gap-1 border-t border-slate-200/40 md:border-t-0 pt-3 md:pt-0">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Shift Status</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${activeSession ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <span className="text-slate-800 text-xs font-semibold">
                    {activeSession ? `Active Shift (Sarah)` : 'No active shift today'}
                  </span>
                </div>
                {activeSession ? (
                  <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full mt-0.5">
                    <Activity size={10} className="animate-pulse" />
                    Active session monitored
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[9px] font-bold px-2 py-0.5 rounded-full mt-0.5">
                    Offline
                  </div>
                )}
                {activeProgram.phoneNumber && (
                  <button 
                    onClick={() => {
                      toast.success(
                        `💬 SMS Reminder sent to ${activeProgram.staffContact} (${activeProgram.phoneNumber}): "Hi ${activeProgram.staffContact.split(' ')[0]}, this is a reminder from management to check and sign off on today's active shift checklist for ${activeProgram.name}. — MilieuCare"`,
                        { duration: 6000, icon: '💬' }
                      );
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[9px] font-bold px-2 py-1 rounded-lg transition-all shadow-xs"
                  >
                    💬 Send SMS Reminder
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Routine Checklist Panel */}
          <div className="glass-card p-3 sm:p-5 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <h3 className="text-slate-800 font-extrabold text-sm sm:text-base flex items-center gap-1.5">
                <ClipboardList size={16} className="text-milieuBlue" />
                Routine Task Duties ({filteredTemplates.length})
              </h3>
              
              {/* Shift selector tabs */}
              <div className="flex gap-1.5">
                {SHIFT_TABS.map(({ key, label, icon: Icon }) => {
                  const shiftTasks = TASK_TEMPLATES[activeProgram.id]?.[key] || [];
                  return (
                    <button
                      key={key}
                      onClick={() => setShift(key)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-all ${
                        shift === key 
                          ? 'bg-blue-50 text-milieuBlue border border-blue-200 shadow-xs' 
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <Icon size={11} />
                      <span>{label.replace(' Shift', '')}</span>
                      <span className="text-slate-400">({shiftTasks.length})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time & Shift Description Info Bar */}
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
              <Clock size={12} className="text-slate-400" />
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                <strong>{SHIFT_TABS.find(t => t.key === shift)?.label}:</strong> {SHIFT_TABS.find(t => t.key === shift)?.time}
              </p>
            </div>

            {/* Checklist Tasks list */}
            {filteredTemplates.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-8">
                {search ? `No duties match search query "${search}"` : 'No duties scheduled for this shift.'}
              </p>
            ) : (
              <div className="space-y-2">
                {filteredTemplates.map(task => {
                  const sessionTask = sessionTasks.find(t => t.id === task.id);
                  return <TaskRow key={task.id} task={task} sessionTask={sessionTask} />;
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-card p-10 text-center text-slate-400">
          No active residential programs found.
        </div>
      )}
    </div>
  );
}
