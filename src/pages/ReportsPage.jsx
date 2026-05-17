import React, { useState, useMemo } from 'react';
import { useTaskStore } from '../store/taskStore';
import { PROGRAMS } from '../data/programs';
import { calculateCompliance, calculateOnTimeRate, groupTasksByShift } from '../utils/complianceUtils';
import { formatTime } from '../utils/timeUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, Download, Calendar, Filter, TrendingUp, Clock, CheckCircle, XCircle, AlertTriangle, User } from 'lucide-react';
import Badge from '../components/ui/Badge';

const COLORS = { completed: '#10b981', late: '#f59e0b', missed: '#ef4444', upcoming: '#475569' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-800 border border-white/10 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-white font-semibold mb-2">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.fill || p.stroke }} className="mb-0.5">
          {p.name}: <span className="font-bold">{p.value}{p.name === 'Compliance' ? '%' : ''}</span>
        </p>
      ))}
    </div>
  );
};

// Generate mock historical data for charts
const generateWeeklyData = (sessions) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, i) => ({
    day,
    compliance: Math.round(70 + Math.random() * 28),
    completed: Math.floor(8 + Math.random() * 8),
    missed: Math.floor(Math.random() * 4),
    late: Math.floor(Math.random() * 3),
  }));
};

const generateMonthlyData = () => {
  return Array.from({ length: 4 }, (_, i) => ({
    week: `Week ${i + 1}`,
    'Parkside E': Math.round(72 + Math.random() * 25),
    'Hudson': Math.round(68 + Math.random() * 28),
    'Orion': Math.round(75 + Math.random() * 22),
    'Parkside B': Math.round(65 + Math.random() * 30),
  }));
};

export default function ReportsPage() {
  const sessions = useTaskStore(state => state.sessions);
  const [reportType, setReportType] = useState('weekly');
  const [selectedProgram, setSelectedProgram] = useState('all');

  const allTasks = Object.values(sessions).flatMap(s => s.tasks || []);
  const filteredTasks = selectedProgram === 'all'
    ? allTasks
    : allTasks.filter(t => t.programId === selectedProgram);

  const weeklyData = useMemo(() => generateWeeklyData(sessions), []);
  const monthlyData = useMemo(() => generateMonthlyData(), []);

  const stats = {
    total: filteredTasks.length,
    completed: filteredTasks.filter(t => t.status === 'completed').length,
    late: filteredTasks.filter(t => t.status === 'late').length,
    missed: filteredTasks.filter(t => t.status === 'missed').length,
    compliance: calculateCompliance(filteredTasks.filter(t => t.status !== 'upcoming')),
    onTime: calculateOnTimeRate(filteredTasks.filter(t => t.status !== 'upcoming')),
  };

  const pieData = [
    { name: 'Completed', value: stats.completed, fill: COLORS.completed },
    { name: 'Late', value: stats.late, fill: COLORS.late },
    { name: 'Missed', value: stats.missed, fill: COLORS.missed },
  ].filter(d => d.value > 0);

  // Program compliance comparison
  const programComparison = PROGRAMS.map(p => {
    const pTasks = allTasks.filter(t => t.programId === p.id && t.status !== 'upcoming');
    return {
      name: p.shortName,
      compliance: calculateCompliance(pTasks),
      tasks: pTasks.length,
    };
  });

  // Staff Performance
  const staffStats = useMemo(() => {
    const stats = {};
    filteredTasks.forEach(t => {
      if (!t.completedBy) return;
      if (!stats[t.completedBy]) {
        stats[t.completedBy] = { name: t.completedBy, completed: 0, late: 0, total: 0 };
      }
      stats[t.completedBy].total += 1;
      if (t.status === 'completed') stats[t.completedBy].completed += 1;
      if (t.status === 'late') stats[t.completedBy].late += 1;
    });
    return Object.values(stats).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [filteredTasks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 size={22} className="text-teal-400" />
            Reports
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Compliance analytics & shift history</p>
        </div>
        <button className="btn-secondary flex items-center gap-2 text-sm">
          <Download size={15} />
          Export PDF
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-3">
        <Filter size={14} className="text-slate-400" />
        <div className="flex gap-2 flex-wrap">
          {['daily', 'weekly', 'monthly'].map(t => (
            <button
              key={t}
              onClick={() => setReportType(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${reportType === t ? 'bg-teal-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="w-px h-5 bg-white/10" />
        <select
          className="input-field w-auto py-1.5 text-sm"
          value={selectedProgram}
          onChange={e => setSelectedProgram(e.target.value)}
        >
          <option value="all" className="bg-navy-800 text-white">All Programs</option>
          {PROGRAMS.map(p => <option key={p.id} value={p.id} className="bg-navy-800 text-white">{p.name}</option>)}
        </select>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Tasks', value: stats.total, color: 'text-white' },
          { label: 'Completed', value: stats.completed, color: 'text-emerald-400' },
          { label: 'Late', value: stats.late, color: 'text-amber-400' },
          { label: 'Missed', value: stats.missed, color: 'text-red-400' },
          { label: 'Compliance', value: `${stats.compliance}%`, color: stats.compliance >= 80 ? 'text-emerald-400' : 'text-amber-400' },
          { label: 'On-Time Rate', value: `${stats.onTime}%`, color: stats.onTime >= 80 ? 'text-emerald-400' : 'text-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card p-3 text-center">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-slate-500 text-[11px] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Weekly bar chart */}
        <div className="glass-card p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-teal-400" />
            {reportType === 'monthly' ? 'Monthly Program Compliance' : 'Weekly Compliance Trend'}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            {reportType === 'monthly' ? (
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {['Parkside E', 'Hudson', 'Orion', 'Parkside B'].map((prog, i) => (
                  <Line key={prog} type="monotone" dataKey={prog} stroke={['#0ea5a0', '#3b82f6', '#8b5cf6', '#f97316'][i]} strokeWidth={2} dot={{ r: 3 }} />
                ))}
              </LineChart>
            ) : (
              <BarChart data={weeklyData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="compliance" name="Compliance" fill="#0ea5a0" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="glass-card p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <CheckCircle size={16} className="text-teal-400" />
            Task Status Breakdown
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center">
              <p className="text-slate-500 text-sm">No completed tasks to display yet.</p>
            </div>
          )}
        </div>

        {/* Program comparison */}
        <div className="glass-card p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-teal-400" />
            Program Compliance Comparison
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={programComparison} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="compliance" name="Compliance" radius={[4, 4, 0, 0]}>
                {programComparison.map((entry, i) => (
                  <Cell key={i} fill={entry.compliance >= 90 ? '#10b981' : entry.compliance >= 70 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>



        {/* Staff Performance */}
        <div className="glass-card p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <User size={16} className="text-teal-400" />
            Staff Sign-Off Activity
          </h3>
          {staffStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={staffStats} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="completed" name="On Time" stackId="a" fill="#10b981" />
                <Bar dataKey="late" name="Late" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center">
              <p className="text-slate-500 text-sm">No staff sign-offs yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
