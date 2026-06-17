import { useState, useMemo, useEffect } from "react";
import { useTaskStore } from "../store/taskStore";
import { PROGRAMS } from "../data/programs";
import {
  calculateCompliance,
  calculateOnTimeRate,
} from "../utils/complianceUtils";
import PrintableChart from "../components/tasks/PrintableChart";
import { bulkPrint, bulkDownloadZip, generateDateStrings } from "../utils/bulkExport";
import toast from "react-hot-toast";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BarChart3,
  Download,
  Filter,
  TrendingUp,
  CheckCircle,
  User,
} from "lucide-react";

const COLORS = {
  completed: "#10b981",
  late: "#f59e0b",
  missed: "#ef4444",
  upcoming: "#475569",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-slate-800 font-semibold mb-2">{label}</p>
      {payload.map((p) => (
        <p
          key={p.name}
          style={{ color: p.fill || p.stroke }}
          className="mb-0.5"
        >
          {p.name}:{" "}
          <span className="font-bold">
            {p.value}
            {p.name === "Compliance" ? "%" : ""}
          </span>
        </p>
      ))}
    </div>
  );
};

// Generate mock historical data for charts
const generateWeeklyData = (sessions) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
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
    Hudson: Math.round(68 + Math.random() * 28),
  }));
};

const BULK_SHIFTS = [
  { key: 'day',     label: 'Day' },
  { key: 'evening', label: 'Evening' },
  { key: 'night',   label: 'Graveyard' },
];

function getWeekRange(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay();
  const mon = new Date(d); mon.setDate(d.getDate() - ((day + 6) % 7));
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  return { start: mon, end: sun };
}

function getMonthRange(year, month) {
  return { start: new Date(year, month, 1), end: new Date(year, month + 1, 0) };
}

export default function ReportsPage() {
  const sessions = useTaskStore((state) => state.sessions);
  const fetchActiveSessions = useTaskStore((state) => state.fetchActiveSessions);
  const fetchSessionsForDateRange = useTaskStore((s) => s.fetchSessionsForDateRange);

  const [reportType, setReportType] = useState("weekly");
  const [selectedProgram, setSelectedProgram] = useState("hudson");
  const [activeTab, setActiveTab] = useState("analytics");
  const [chartShift, setChartShift] = useState("day");
  const [chartDate, setChartDate] = useState(new Date().toISOString().split('T')[0]);
  const [chartProgram, setChartProgram] = useState(PROGRAMS[0]?.id || "hudson");

  // Bulk export state
  const [bulkRangeType, setBulkRangeType] = useState('day');
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkMonth, setBulkMonth] = useState(new Date().toISOString().slice(0, 7));
  const [bulkShifts, setBulkShifts] = useState(['day', 'evening', 'night']);
  const [bulkPrinting, setBulkPrinting] = useState(false);
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });

  const toggleBulkShift = (key) =>
    setBulkShifts(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  const getBulkRange = () => {
    if (bulkRangeType === 'day') {
      const d = new Date(bulkDate + 'T12:00:00');
      return { start: d, end: d, label: bulkDate };
    }
    if (bulkRangeType === 'week') {
      const { start, end } = getWeekRange(bulkDate);
      return { start, end, label: `Week of ${start.toDateString()}` };
    }
    const [y, m] = bulkMonth.split('-').map(Number);
    const { start, end } = getMonthRange(y, m - 1);
    return { start, end, label: bulkMonth };
  };

  const fetchBulkFiltered = async () => {
    const { start, end } = getBulkRange();
    const allSessions = await fetchSessionsForDateRange(generateDateStrings(start, end));
    return Object.fromEntries(
      Object.entries(allSessions).filter(([, e]) => bulkShifts.includes(e.session.shift))
    );
  };

  const handleBulkPrint = async () => {
    if (!bulkShifts.length) { toast.error('Select at least one shift.'); return; }
    setBulkPrinting(true);
    try {
      const s = await fetchBulkFiltered();
      if (!Object.keys(s).length) { toast.error('No data found for that range.'); return; }
      await bulkPrint(s);
    } catch (e) {
      console.error(e); toast.error('Bulk print failed.');
    } finally { setBulkPrinting(false); }
  };

  const handleBulkDownload = async () => {
    if (!bulkShifts.length) { toast.error('Select at least one shift.'); return; }
    setBulkDownloading(true);
    setBulkProgress({ done: 0, total: 0 });
    try {
      const s = await fetchBulkFiltered();
      const total = Object.keys(s).length;
      if (!total) { toast.error('No data found for that range.'); return; }
      setBulkProgress({ done: 0, total });
      const { label } = getBulkRange();
      await bulkDownloadZip(s, `ShiftReports_${label}`, (done, t) => setBulkProgress({ done, total: t }));
      toast.success(`ZIP downloaded — ${total} chart${total !== 1 ? 's' : ''}.`);
    } catch (e) {
      console.error(e); toast.error('Download failed.');
    } finally { setBulkDownloading(false); setBulkProgress({ done: 0, total: 0 }); }
  };

  useEffect(() => {
    fetchActiveSessions();
  }, []);

  const allTasks = Object.values(sessions).flatMap((s) => s.tasks || []);
  const filteredTasks =
    selectedProgram === "all"
      ? allTasks
      : allTasks.filter((t) => t.programId === selectedProgram);

  // Paper chart: read directly from the session for the selected program+shift
  const chartSessionKey = Object.keys(sessions).find((key) =>
    key.startsWith(`${chartProgram}-${chartShift}-`)
  );
  const chartTasks = sessions[chartSessionKey]?.tasks || [];

  const weeklyData = useMemo(() => generateWeeklyData(sessions), []);
  const monthlyData = useMemo(() => generateMonthlyData(), []);

  const stats = {
    total: filteredTasks.length,
    completed: filteredTasks.filter((t) => t.status === "completed").length,
    late: filteredTasks.filter((t) => t.status === "late").length,
    missed: filteredTasks.filter((t) => t.status === "missed").length,
    compliance: calculateCompliance(
      filteredTasks.filter((t) => t.status !== "upcoming"),
    ),
    onTime: calculateOnTimeRate(
      filteredTasks.filter((t) => t.status !== "upcoming"),
    ),
  };

  const pieData = [
    { name: "Completed", value: stats.completed, fill: COLORS.completed },
    { name: "Late", value: stats.late, fill: COLORS.late },
    { name: "Missed", value: stats.missed, fill: COLORS.missed },
  ].filter((d) => d.value > 0);

  // Program compliance comparison
  const programComparison = PROGRAMS.map((p) => {
    const pTasks = allTasks.filter(
      (t) => t.programId === p.id && t.status !== "upcoming",
    );
    return {
      name: p.shortName,
      compliance: calculateCompliance(pTasks),
      tasks: pTasks.length,
    };
  });

  // Staff Performance
  const staffStats = useMemo(() => {
    const stats = {};
    filteredTasks.forEach((t) => {
      if (!t.completedBy) return;
      if (!stats[t.completedBy]) {
        stats[t.completedBy] = {
          name: t.completedBy,
          completed: 0,
          late: 0,
          total: 0,
        };
      }
      stats[t.completedBy].total += 1;
      if (t.status === "completed") stats[t.completedBy].completed += 1;
      if (t.status === "late") stats[t.completedBy].late += 1;
    });
    return Object.values(stats)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [filteredTasks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-milieuNavy flex items-center gap-2">
            <BarChart3 size={22} className="text-milieuBlue" />
            Reports
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Compliance analytics & shift history
          </p>
        </div>
        {activeTab === "analytics" && (
          <button
            onClick={() => window.print()}
            className="btn-secondary flex items-center gap-2 text-sm print:hidden"
          >
            <Download size={15} />
            Export PDF
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("analytics")}
          className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 ${activeTab === "analytics" ? "border-milieuBlue text-milieuBlue" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          Compliance Analytics
        </button>
        <button
          onClick={() => setActiveTab("paper")}
          className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 ${activeTab === "paper" ? "border-milieuBlue text-milieuBlue" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          Printable Chart (Paper Form)
        </button>
      </div>

      {activeTab === "analytics" ? (
        <div className="space-y-6">

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-3">
        <Filter size={14} className="text-slate-400" />
        <div className="flex gap-2 flex-wrap">
          {["daily", "weekly", "monthly"].map((t) => (
            <button
              key={t}
              onClick={() => setReportType(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${reportType === t ? "bg-milieuBlue text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="w-px h-5 bg-white/10" />
        <select
          className="input-field w-auto py-1.5 text-sm"
          value={selectedProgram}
          onChange={(e) => setSelectedProgram(e.target.value)}
        >
          <option value="all">All Programs</option>
          {PROGRAMS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            label: "Total 30 Mins Tasks",
            value: stats.total,
            color: "text-slate-800",
          },
          {
            label: "Completed",
            value: stats.completed,
            color: "text-emerald-600",
          },
          { label: "Late", value: stats.late, color: "text-amber-600" },
          { label: "Missed", value: stats.missed, color: "text-rose-600" },
          {
            label: "Compliance",
            value: `${stats.compliance}%`,
            color:
              stats.compliance >= 80 ? "text-emerald-600" : "text-amber-600",
          },
          {
            label: "On-Time Rate",
            value: `${stats.onTime}%`,
            color: stats.onTime >= 80 ? "text-emerald-600" : "text-amber-600",
          },
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
          <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-milieuBlue" />
            {reportType === "monthly"
              ? "Monthly Program Compliance"
              : "Weekly Compliance Trend"}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            {reportType === "monthly" ? (
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="week"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {["Hudson"].map((prog) => (
                  <Line
                    key={prog}
                    type="monotone"
                    dataKey={prog}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            ) : (
              <BarChart data={weeklyData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  unit="%"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="compliance"
                  name="Compliance"
                  fill="#005b8e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="glass-card p-5">
          <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
            <CheckCircle size={16} className="text-milieuBlue" />
            30 Mins Task Status Breakdown
          </h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-5 mt-3 flex-wrap">
                {(() => {
                  const total = pieData.reduce((s, d) => s + d.value, 0);
                  return pieData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.fill }} />
                      <span className="text-slate-600">{d.name}</span>
                      <span className="font-bold text-slate-800">
                        {total > 0 ? Math.round((d.value / total) * 100) : 0}%
                      </span>
                      <span className="text-slate-400">({d.value})</span>
                    </div>
                  ));
                })()}
              </div>
            </>
          ) : (
            <div className="h-[220px] flex items-center justify-center">
              <p className="text-slate-500 text-sm">
                No completed 30 mins tasks to display yet.
              </p>
            </div>
          )}
        </div>

        {/* Program comparison */}
        <div className="glass-card p-5">
          <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-milieuBlue" />
            Program Compliance Comparison
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={programComparison} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                unit="%"
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="compliance" name="Compliance" radius={[4, 4, 0, 0]}>
                {programComparison.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.compliance >= 90
                        ? "#10b981"
                        : entry.compliance >= 70
                          ? "#f59e0b"
                          : "#ef4444"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Staff Performance */}
        <div className="glass-card p-5">
          <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
            <User size={16} className="text-milieuBlue" />
            Staff Sign-Off Activity
          </h3>
          {staffStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={staffStats} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="completed"
                  name="On Time"
                  stackId="a"
                  fill="#10b981"
                />
                <Bar
                  dataKey="late"
                  name="Late"
                  stackId="a"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                />
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
      ) : (
        <div className="space-y-6">
          <div className="glass-card p-4 space-y-4">
            {/* Single chart filters */}
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col">
                <label className="text-xs text-slate-500 mb-1 font-semibold">Program</label>
                <select
                  className="input-field py-1.5 text-sm w-48"
                  value={chartProgram}
                  onChange={(e) => setChartProgram(e.target.value)}
                >
                  {PROGRAMS.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-slate-500 mb-1 font-semibold">Date</label>
                <input
                  type="date"
                  className="input-field py-1.5 text-sm w-40"
                  value={chartDate}
                  onChange={(e) => setChartDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-slate-500 mb-1 font-semibold">Shift</label>
                <select
                  className="input-field py-1.5 text-sm w-44"
                  value={chartShift}
                  onChange={(e) => setChartShift(e.target.value)}
                >
                  <option value="day">Day (7 AM – 3 PM)</option>
                  <option value="evening">Evening (3 PM – 11 PM)</option>
                  <option value="night">Graveyard (11 PM – 7 AM)</option>
                </select>
              </div>
            </div>

            {/* Bulk export filters */}
            <div className="border-t border-slate-100 pt-3 flex flex-wrap items-end gap-4">
              <div className="flex flex-col">
                <label className="text-xs text-slate-500 mb-1 font-semibold">Bulk Range</label>
                <div className="flex gap-1">
                  {['day', 'week', 'month'].map(r => (
                    <button
                      key={r}
                      onClick={() => setBulkRangeType(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors capitalize ${
                        bulkRangeType === r
                          ? 'bg-milieuBlue text-white border-milieuBlue'
                          : 'border-slate-200 text-slate-600 hover:border-milieuBlue'
                      }`}
                    >
                      {r === 'day' ? 'Day' : r === 'week' ? 'Week' : 'Month'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-slate-500 mb-1 font-semibold">
                  {bulkRangeType === 'week' ? 'Any date in week' : bulkRangeType === 'month' ? 'Month' : 'Date'}
                </label>
                {bulkRangeType === 'month' ? (
                  <input
                    type="month"
                    className="input-field py-1.5 text-sm w-40"
                    value={bulkMonth}
                    onChange={e => setBulkMonth(e.target.value)}
                  />
                ) : (
                  <input
                    type="date"
                    className="input-field py-1.5 text-sm w-40"
                    value={bulkDate}
                    onChange={e => setBulkDate(e.target.value)}
                  />
                )}
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-slate-500 mb-1 font-semibold">Shifts to include</label>
                <div className="flex gap-3 flex-wrap h-[34px] items-center">
                  {BULK_SHIFTS.map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={bulkShifts.includes(key)}
                        onChange={() => toggleBulkShift(key)}
                        className="rounded"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              {/* ZIP progress inline */}
              {bulkDownloading && bulkProgress.total > 0 && (
                <div className="flex flex-col justify-end">
                  <span className="text-xs text-slate-500">
                    {bulkProgress.done} / {bulkProgress.total} charts…
                  </span>
                  <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-milieuBlue rounded-full transition-all duration-200"
                      style={{ width: `${Math.round((bulkProgress.done / bulkProgress.total) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <PrintableChart
            tasks={chartTasks}
            program={PROGRAMS.find(p => p.id === chartProgram)}
            shift={chartShift}
            date={new Date(chartDate + 'T12:00:00')}
            monthlyDuties={sessions[chartSessionKey]?.monthlyDuties ?? null}
            onBulkPrint={handleBulkPrint}
            onBulkDownload={handleBulkDownload}
            bulkPrinting={bulkPrinting}
            bulkDownloading={bulkDownloading}
          />
        </div>
      )}
    </div>
  );
}
