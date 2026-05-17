import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PROGRAMS } from '../data/programs';
import { TASK_TEMPLATES } from '../data/taskTemplates';
import { useTaskStore } from '../store/taskStore';
import { getShiftDateString } from '../utils/timeUtils';
import { calculateCompliance } from '../utils/complianceUtils';
import { ClipboardList, Sun, Sunset, Moon, ChevronDown, ChevronUp, Clock, Users, MapPin, MessageSquare } from 'lucide-react';
import Badge from '../components/ui/Badge';

const SHIFT_TABS = [
  { key: 'day', label: 'Day Shift', icon: Sun, time: '7:00 AM – 3:00 PM' },
  { key: 'evening', label: 'Evening Shift', icon: Sunset, time: '3:00 PM – 11:00 PM' },
  { key: 'night', label: 'Night Shift', icon: Moon, time: '11:00 PM – 7:00 AM' },
];

function TaskRow({ task, sessionTask }) {
  const status = sessionTask?.status || 'upcoming';
  const completedAt = sessionTask?.completedAt;
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
      status === 'completed' ? 'border-emerald-500/20 bg-emerald-500/5' :
      status === 'late' ? 'border-amber-500/20 bg-amber-500/5' :
      status === 'missed' ? 'border-red-500/20 bg-red-500/5' :
      status === 'pending' ? 'border-blue-500/30 bg-blue-500/8' :
      'border-white/5 bg-white/2'
    }`}>
      <div className="text-slate-500 text-xs font-mono w-24 flex-shrink-0 pt-0.5">
        {task.startTime}–{task.endTime}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium">{task.title}</p>
        <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{task.description}</p>
        {completedAt && (
          <div className="mt-1">
            <p className="text-emerald-400 text-[10px]">
              ✓ Signed off at {new Date(completedAt).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })}
              {sessionTask?.completedBy ? ` by ${sessionTask.completedBy}` : ''}
              {status === 'late' && ' · LATE'}
            </p>
            {sessionTask?.comment && (
              <p className="text-slate-400 text-[10px] flex items-start gap-1 mt-0.5">
                <MessageSquare size={10} className="mt-0.5 flex-shrink-0" />
                <span>{sessionTask.comment}</span>
              </p>
            )}
          </div>
        )}
      </div>
      <Badge status={status} className="flex-shrink-0 text-[10px]" />
    </div>
  );
}

function ProgramDetail({ program, sessions }) {
  const [shift, setShift] = useState('day');
  const [expanded, setExpanded] = useState(true);
  const hour = new Date().getHours();
  const currentShift = hour >= 7 && hour < 15 ? 'day' : hour >= 15 && hour < 23 ? 'evening' : 'night';
  const sessionKey = `${program.id}-${currentShift}-${getShiftDateString()}`;
  const session = sessions[sessionKey];
  const templates = TASK_TEMPLATES[program.id]?.[shift] || [];
  const sessionTasks = session?.tasks || [];
  const compliance = calculateCompliance(sessionTasks.filter(t => t.status !== 'upcoming'));

  const colorBorder = {
    teal: 'border-teal-500/40', blue: 'border-blue-500/40', purple: 'border-purple-500/40',
    orange: 'border-orange-500/40', amber: 'border-amber-500/40', green: 'border-green-500/40',
  };

  return (
    <div className={`glass-card border-l-4 ${colorBorder[program.color] || colorBorder.teal}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5"
      >
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-white font-bold text-base text-left">{program.name}</h3>
            <p className="text-slate-400 text-xs text-left flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><MapPin size={10} />{program.location}</span>
              <span className="flex items-center gap-1"><Users size={10} />Cap. {program.capacity}</span>
              {session && <span className="text-teal-400">Today: {compliance}% compliance</span>}
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5">
          {/* Shift tabs */}
          <div className="flex gap-2 mb-4 border-b border-white/10 pb-3 overflow-x-auto">
            {SHIFT_TABS.map(({ key, label, icon: Icon, time }) => {
              const shiftTasks = TASK_TEMPLATES[program.id]?.[key] || [];
              return (
                <button
                  key={key}
                  onClick={() => setShift(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    shift === key ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={12} />
                  {label}
                  <span className="text-slate-600">({shiftTasks.length})</span>
                </button>
              );
            })}
          </div>

          {/* Tasks */}
          {templates.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No tasks scheduled for this shift.</p>
          ) : (
            <div className="space-y-2">
              {templates.map(task => {
                const sessionTask = sessionTasks.find(t => t.id === task.id);
                return <TaskRow key={task.id} task={task} sessionTask={sessionTask} />;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProgramsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const { initSession } = useTaskStore();
  const sessions = useTaskStore(state => state.sessions);

  useEffect(() => {
    const hour = new Date().getHours();
    const shift = hour >= 7 && hour < 15 ? 'day' : hour >= 15 && hour < 23 ? 'evening' : 'night';
    PROGRAMS.forEach(p => initSession(p.id, shift, 'demo-staff'));
  }, []);

  const focusId = searchParams.get('p');
  
  // Filter programs based on search
  const filteredPrograms = PROGRAMS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.type.toLowerCase().includes(search.toLowerCase())
  );

  // Determine which program is currently active
  const activeProgramId = focusId && filteredPrograms.some(p => p.id === focusId) 
    ? focusId 
    : filteredPrograms[0]?.id;

  const activeProgram = filteredPrograms.find(p => p.id === activeProgramId);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ClipboardList size={22} className="text-teal-400" />
            Programs
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Task schedules for all residential homes</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-2">
        <input
          className="input-field"
          placeholder="Search programs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Summary cards (Tabs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {filteredPrograms.map(p => {
          const hour = new Date().getHours();
          const shift = hour >= 7 && hour < 15 ? 'day' : hour >= 15 && hour < 23 ? 'evening' : 'night';
          const key = `${p.id}-${shift}-${getShiftDateString()}`;
          const s = sessions[key];
          const tasks = s?.tasks?.filter(t => t.status !== 'upcoming') || [];
          const comp = calculateCompliance(tasks);
          const isFocused = activeProgramId === p.id;
          return (
            <button 
              key={p.id} 
              onClick={() => setSearchParams({ p: p.id })}
              className={`glass-card p-3 text-center w-full transition-all duration-200 ${
                isFocused 
                  ? 'ring-2 ring-teal-400 bg-teal-500/10 scale-105 shadow-lg shadow-teal-500/20' 
                  : 'hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <p className="text-white text-sm font-bold">{p.shortName}</p>
              <p className={`text-lg font-bold mt-1 ${comp >= 90 ? 'text-emerald-400' : comp >= 70 ? 'text-amber-400' : comp > 0 ? 'text-red-400' : 'text-slate-600'}`}>
                {tasks.length > 0 ? `${comp}%` : '—'}
              </p>
              <p className="text-slate-600 text-[10px]">compliance</p>
            </button>
          );
        })}
      </div>

      {/* Program details */}
      <div className="space-y-4">
        {activeProgram ? (
          <ProgramDetail key={activeProgram.id} program={activeProgram} sessions={sessions} />
        ) : (
          <div className="glass-card p-10 text-center text-slate-400">
            No programs found matching "{search}"
          </div>
        )}
      </div>
    </div>
  );
}
