import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import { useAlertStore } from '../store/alertStore';
import { PROGRAMS, getProgramById } from '../data/programs';
import { getTasksForShift } from '../data/taskTemplates';
import { calculateCompliance, getComplianceColor, getComplianceLabel } from '../utils/complianceUtils';
import { formatTime, getShiftLabel, getShiftDateString } from '../utils/timeUtils';
import { useTaskTimer } from '../hooks/useTaskTimer';
import {
  Activity, AlertTriangle, CheckCircle, Clock, Users,
  TrendingUp, Eye, ChevronRight, Shield, Zap, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ProgramCard({ program, session, alertCount, onClick }) {
  const tasks = session?.tasks || [];
  const completed = tasks.filter(t => t.status === 'completed' || t.status === 'late').length;
  const missed = tasks.filter(t => t.status === 'missed').length;
  const pending = tasks.find(t => t.status === 'pending');
  const compliance = calculateCompliance(tasks.filter(t => t.status !== 'upcoming'));
  const compColor = getComplianceColor(compliance);
  const hasActivity = tasks.length > 0;

  const colorMap = {
    teal: 'from-teal-500/20 to-teal-600/10 border-teal-500/30',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30',
  };

  const dotColor = {
    teal: 'bg-teal-400', blue: 'bg-blue-400', purple: 'bg-purple-400',
    orange: 'bg-orange-400', amber: 'bg-amber-400', green: 'bg-green-400',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-5 rounded-2xl bg-gradient-to-br border transition-all duration-200 hover:scale-[1.01] hover:shadow-lg active:scale-[0.99] ${colorMap[program.color] || colorMap.teal}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`w-2 h-2 rounded-full ${hasActivity ? dotColor[program.color] : 'bg-slate-600'} ${hasActivity ? 'animate-pulse' : ''}`} />
            <h3 className="text-white font-bold text-base">{program.name}</h3>
          </div>
          <p className="text-slate-400 text-xs">{program.type}</p>
        </div>
        <div className="flex items-center gap-2">
          {alertCount > 0 && (
            <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-2 py-0.5 rounded-lg">
              {alertCount} alert{alertCount > 1 ? 's' : ''}
            </span>
          )}
          <ChevronRight size={16} className="text-slate-500" />
        </div>
      </div>

      {hasActivity ? (
        <>
          {/* Progress */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">{completed}/{tasks.length} tasks</span>
              <span className={`font-semibold text-${compColor}-400`}>{compliance}% compliance</span>
            </div>
            <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-${compColor}-400 transition-all duration-700`}
                style={{ width: `${compliance}%` }}
              />
            </div>
          </div>

          {/* Current task */}
          {pending && (
            <div className="bg-black/20 rounded-lg px-3 py-2 mb-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Active Now</p>
              <p className="text-white text-xs font-medium truncate">{pending.title}</p>
            </div>
          )}

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div><p className="text-emerald-400 font-bold text-sm">{completed}</p><p className="text-[10px] text-slate-500">Done</p></div>
            <div><p className="text-amber-400 font-bold text-sm">{tasks.filter(t => t.status === 'late').length}</p><p className="text-[10px] text-slate-500">Late</p></div>
            <div><p className="text-red-400 font-bold text-sm">{missed}</p><p className="text-[10px] text-slate-500">Missed</p></div>
          </div>
        </>
      ) : (
        <div className="text-center py-3">
          <p className="text-slate-500 text-xs">No active shift · Tap to view schedule</p>
        </div>
      )}
    </button>
  );
}

export default function ManagerDashboard() {
  useTaskTimer();
  const { user } = useAuthStore();
  const { initSession } = useTaskStore();
  const sessions = useTaskStore(state => state.sessions);
  const { alerts } = useAlertStore();
  const navigate = useNavigate();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    // Seed demo sessions for all programs so manager can see activity
    const hour = new Date().getHours();
    const shift = hour >= 7 && hour < 15 ? 'day' : hour >= 15 && hour < 23 ? 'evening' : 'night';
    PROGRAMS.forEach(p => initSession(p.id, shift, 'demo-staff'));
    const t = setInterval(() => forceUpdate(n => n + 1), 60000);
    return () => clearInterval(t);
  }, []);


  const hour = new Date().getHours();
  const currentShift = hour >= 7 && hour < 15 ? 'day' : hour >= 15 && hour < 23 ? 'evening' : 'night';

  // Find session for a program
  const getSession = (programId) => {
    const key = `${programId}-${currentShift}-${getShiftDateString()}`;
    return sessions[key] || null;
  };

  // Global stats
  const allTasks = Object.values(sessions).flatMap(s => s.tasks || []);
  const totalCompleted = allTasks.filter(t => t.status === 'completed' || t.status === 'late').length;
  const totalMissed = allTasks.filter(t => t.status === 'missed').length;
  const totalTasks = allTasks.filter(t => t.status !== 'upcoming').length;
  const globalCompliance = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
  const unreadAlerts = alerts.filter(a => !a.read);
  const recentAlerts = alerts.slice(0, 5);

  const managedPrograms = user?.programIds
    ? PROGRAMS.filter(p => user.programIds.includes(p.id))
    : PROGRAMS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield size={22} className="text-teal-400" />
            Manager Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {getShiftLabel(currentShift)} · Real-time Overview
          </p>
        </div>
        <div className="text-right">
          <p className="text-slate-500 text-xs">Today</p>
          <p className="text-white text-sm font-medium">
            {new Date().toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Global Compliance', value: `${globalCompliance}%`, icon: TrendingUp, color: globalCompliance >= 80 ? 'teal' : 'amber', sub: 'All programs today' },
          { label: 'Tasks Completed', value: totalCompleted, icon: CheckCircle, color: 'emerald', sub: `of ${totalTasks} due` },
          { label: 'Tasks Missed', value: totalMissed, icon: XCircle, color: 'red', sub: 'Needs attention' },
          { label: 'Active Alerts', value: unreadAlerts.length, icon: AlertTriangle, color: 'amber', sub: 'Unreviewed' },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className={`glass-card p-4 border-${color}-500/20`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-xs font-medium">{label}</p>
              <div className={`w-8 h-8 bg-${color}-500/15 rounded-lg flex items-center justify-center`}>
                <Icon size={15} className={`text-${color}-400`} />
              </div>
            </div>
            <p className={`text-2xl font-bold text-${color}-400`}>{value}</p>
            <p className="text-slate-600 text-xs mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Programs grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-slate-300 text-sm font-semibold uppercase tracking-wider">
              Programs ({managedPrograms.length})
            </h2>
            <button onClick={() => navigate('/programs')} className="text-teal-400 text-xs hover:text-teal-300 flex items-center gap-1">
              View All <ChevronRight size={12} />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {managedPrograms.map(program => (
              <ProgramCard
                key={program.id}
                program={program}
                session={getSession(program.id)}
                alertCount={alerts.filter(a => a.programId === program.id && !a.read).length}
                onClick={() => navigate(`/programs?p=${program.id}`)}
              />
            ))}
          </div>
        </div>

        {/* Alerts feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-slate-300 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {unreadAlerts.length > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${unreadAlerts.length > 0 ? 'bg-red-500' : 'bg-slate-600'}`} />
              </span>
              Live Alerts
            </h2>
            <button onClick={() => navigate('/alerts')} className="text-teal-400 text-xs hover:text-teal-300">View All</button>
          </div>

          {recentAlerts.length === 0 ? (
            <div className="glass-card p-6 text-center">
              <CheckCircle size={28} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">All clear! No alerts.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentAlerts.map(alert => (
                <div key={alert.id} className={`glass-card p-3 border-l-2 ${alert.type === 'missed' ? 'border-l-red-500' : alert.type === 'bulk-submit' ? 'border-l-amber-500' : 'border-l-blue-500'}`}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={14} className={alert.type === 'missed' ? 'text-red-400 mt-0.5 flex-shrink-0' : 'text-amber-400 mt-0.5 flex-shrink-0'} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-[10px] font-bold uppercase ${alert.type === 'missed' ? 'text-red-400' : 'text-amber-400'}`}>
                          {alert.type === 'bulk-submit' ? 'Bulk Submit' : alert.type}
                        </span>
                        {!alert.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />}
                      </div>
                      <p className="text-white text-xs font-medium truncate">{alert.taskTitle || 'System Alert'}</p>
                      <p className="text-slate-500 text-[10px] mt-0.5">
                        {getProgramById(alert.programId)?.name || 'Unknown'} · {new Date(alert.createdAt).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick tips */}
          <div className="glass-card p-4 mt-4">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Zap size={12} className="text-teal-400" /> Alert Guide
            </p>
            <div className="space-y-2">
              {[
                { color: 'red', label: 'Missed', desc: 'Task window expired, not completed' },
                { color: 'amber', label: 'Bulk Submit', desc: '3+ tasks completed in under 5 min' },
                { color: 'blue', label: 'Late', desc: 'Completed after scheduled window' },
              ].map(({ color, label, desc }) => (
                <div key={label} className="flex items-start gap-2">
                  <span className={`w-2 h-2 rounded-full bg-${color}-400 mt-1 flex-shrink-0`} />
                  <div>
                    <p className="text-white text-xs font-medium">{label}</p>
                    <p className="text-slate-500 text-[10px]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
