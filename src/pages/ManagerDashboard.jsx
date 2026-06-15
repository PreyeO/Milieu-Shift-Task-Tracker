import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useTaskStore } from "../store/taskStore";
import { useAlertStore } from "../store/alertStore";
import { PROGRAMS, getProgramById } from "../data/programs";
import {
  calculateCompliance,
  getComplianceColor,
} from "../utils/complianceUtils";
import { getShiftLabel, getShiftForTime, getShiftDateString } from "../utils/timeUtils";
import { useTaskTimer } from "../hooks/useTaskTimer";
import {
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  ChevronRight,
  Shield,
  Zap,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function ProgramCard({ program, session, alertCount, onClick }) {
  const tasks = session?.tasks || [];
  const completed = tasks.filter(
    (t) => t.status === "completed" || t.status === "late",
  ).length;
  const missed = tasks.filter((t) => t.status === "missed").length;
  const pending = tasks.find((t) => t.status === "pending");
  const compliance = calculateCompliance(
    tasks.filter((t) => t.status !== "upcoming"),
  );
  const compColor = getComplianceColor(compliance);
  const hasActivity = tasks.length > 0;

  const colorMap = {
    teal: "from-emerald-50 to-teal-50 border-emerald-200",
    blue: "from-blue-50 to-indigo-50 border-blue-200",
    purple: "from-purple-50 to-fuchsia-50 border-purple-200",
    orange: "from-orange-50 to-amber-50 border-orange-200",
    amber: "from-amber-50 to-yellow-50 border-amber-200",
    green: "from-green-50 to-emerald-50 border-green-200",
  };

  const dotColor = {
    teal: "bg-emerald-500",
    blue: "bg-milieuBlue",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    amber: "bg-milieuYellow",
    green: "bg-emerald-500",
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-5 rounded-2xl bg-gradient-to-br border transition-all duration-200 hover:scale-[1.01] hover:shadow-lg active:scale-[0.99] ${colorMap[program.color] || colorMap.teal}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${hasActivity ? dotColor[program.color] : "bg-slate-300"} ${hasActivity ? "animate-pulse" : ""}`}
            />
            <h3 className="text-slate-800 font-bold text-base">
              {program.name}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {alertCount > 0 && (
            <span className="bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-2 py-0.5 rounded-lg shadow-sm">
              {alertCount} alert{alertCount > 1 ? "s" : ""}
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
              <span className="text-slate-600">
                {completed}/{tasks.length} 30 mins tasks
              </span>
              <span className={`font-semibold text-${compColor}-600`}>
                {compliance}% compliance
              </span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full rounded-full bg-${compColor}-500 transition-all duration-700`}
                style={{ width: `${compliance}%` }}
              />
            </div>
          </div>

          {/* Current task */}
          {pending && (
            <div className="bg-white rounded-lg p-2.5 mb-3 border border-slate-200 shadow-sm flex items-start gap-2 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-milieuBlue"></div>
              <div className="mt-1 relative flex h-2 w-2 ml-1 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-milieuBlue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-milieuBlue"></span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-milieuBlue uppercase tracking-wider mb-0.5">
                  Currently Active
                </p>
                <p className="text-slate-800 text-xs font-bold truncate">
                  {pending.title}
                </p>
              </div>
            </div>
          )}

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-2 text-center bg-white/40 p-2 rounded-xl">
            <div>
              <p className="text-emerald-600 font-bold text-sm">{completed}</p>
              <p className="text-[10px] text-slate-600">Done</p>
            </div>
            <div>
              <p className="text-amber-600 font-bold text-sm">
                {tasks.filter((t) => t.status === "late").length}
              </p>
              <p className="text-[10px] text-slate-600">Late</p>
            </div>
            <div>
              <p className="text-rose-600 font-bold text-sm">{missed}</p>
              <p className="text-[10px] text-slate-600">Missed</p>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-3">
          <p className="text-slate-500 text-xs">
            No active shift · Tap to view schedule
          </p>
        </div>
      )}
    </button>
  );
}

export default function ManagerDashboard() {
  useTaskTimer();
  const { user } = useAuthStore();
  const { fetchActiveSessions, resetSystem } = useTaskStore();
  const sessions = useTaskStore((state) => state.sessions);
  const { alerts } = useAlertStore();
  const navigate = useNavigate();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    fetchActiveSessions();
    const t = setInterval(() => forceUpdate((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentShift = getShiftForTime(new Date().getHours());

  // Find session for a program
  const getSession = (programId) => {
    const key = `${programId}-${currentShift}-${getShiftDateString()}`;
    return sessions[key] || null;
  };

  // Global stats — scoped to current shift + registered programs only
  const registeredIds = new Set(PROGRAMS.map((p) => p.id));
  const currentShiftTasks = Object.values(sessions)
    .filter((s) => s.shift === currentShift && registeredIds.has(s.programId))
    .flatMap((s) => s.tasks || []);
  const totalCompleted = currentShiftTasks.filter(
    (t) => t.status === "completed" || t.status === "late",
  ).length;
  const totalMissed = currentShiftTasks.filter((t) => t.status === "missed").length;
  const totalTasks = currentShiftTasks.filter((t) => t.status !== "upcoming").length;
  const globalCompliance =
    totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  // Alerts — today's only, so historical missed-task alerts don't inflate the badge
  const dateStr = getShiftDateString();
  const todayAlerts = alerts.filter(
    (a) => new Date(a.createdAt).toDateString() === dateStr,
  );
  const unreadAlerts = todayAlerts.filter((a) => !a.read);
  const recentAlerts = todayAlerts.slice(0, 5);

  const managedPrograms = user?.programIds
    ? PROGRAMS.filter((p) => user.programIds.includes(p.id))
    : PROGRAMS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-milieuNavy flex items-center gap-2">
            <Shield size={22} className="text-milieuBlue flex-shrink-0" />
            <span>Manager Dashboard</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {getShiftLabel(currentShift)} · Real-time Overview
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="text-right">
            <p className="text-slate-500 text-xs">Today</p>
            <p className="text-slate-800 text-sm font-medium">
              {new Date().toLocaleDateString("en-CA", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={async () => {
              if (window.confirm("This will clear all historical data from past days. Today's active shift data will remain. Continue?")) {
                await resetSystem();
                useAlertStore.getState().clearAlerts();
                alert("Past data has been cleared. Today's shifts are intact.");
              }
            }}
            className="text-xs text-rose-500 font-bold px-3 py-1.5 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors whitespace-nowrap"
          >
            Clear History
          </button>
        </div>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Global Compliance",
            value: `${globalCompliance}%`,
            icon: TrendingUp,
            color: globalCompliance >= 80 ? "emerald" : "amber",
            sub: "All programs today",
          },
          {
            label: "30 Mins Tasks Done",
            value: totalCompleted,
            icon: CheckCircle,
            color: "emerald",
            sub: `of ${totalTasks} due`,
          },
          {
            label: "30 Mins Tasks Missed",
            value: totalMissed,
            icon: XCircle,
            color: "rose",
            sub: "Needs attention",
          },
          {
            label: "Active Alerts",
            value: unreadAlerts.length,
            icon: AlertTriangle,
            color: "amber",
            sub: "Unreviewed",
          },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div
            key={label}
            className={`glass-card p-4 border-${color}-200 bg-${color}-50/30`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-600 text-xs font-medium">{label}</p>
              <div
                className={`w-8 h-8 bg-${color}-100 rounded-lg flex items-center justify-center`}
              >
                <Icon size={15} className={`text-${color}-600`} />
              </div>
            </div>
            <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Programs grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">
              Programs ({managedPrograms.length})
            </h2>
            <button
              onClick={() => navigate("/programs")}
              className="text-milieuBlue text-xs hover:text-blue-600 flex items-center gap-1 font-medium"
            >
              View All <ChevronRight size={12} />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {managedPrograms.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                session={getSession(program.id)}
                alertCount={
                  todayAlerts.filter((a) => a.programId === program.id && !a.read)
                    .length
                }
                onClick={() => navigate(`/programs?p=${program.id}`)}
              />
            ))}
          </div>
        </div>

        {/* Alerts feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-slate-500 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {unreadAlerts.length > 0 && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-milieuCoral opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${unreadAlerts.length > 0 ? "bg-milieuCoral" : "bg-slate-300"}`}
                />
              </span>
              Live Alerts
            </h2>
            <button
              onClick={() => navigate("/alerts")}
              className="text-milieuBlue text-xs hover:text-blue-600 font-medium"
            >
              View All
            </button>
          </div>

          {recentAlerts.length === 0 ? (
            <div className="glass-card p-6 text-center bg-emerald-50/50">
              <CheckCircle
                size={28}
                className="text-emerald-500 mx-auto mb-2"
              />
              <p className="text-emerald-700 text-sm font-medium">
                All clear! No alerts.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`glass-card p-3 border-l-4 ${alert.type === "missed" ? "border-l-rose-500 bg-rose-50/30" : alert.type === "bulk-submit" ? "border-l-amber-500 bg-amber-50/30" : "border-l-blue-500 bg-blue-50/30"}`}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      size={14}
                      className={
                        alert.type === "missed"
                          ? "text-rose-500 mt-0.5 flex-shrink-0"
                          : "text-amber-500 mt-0.5 flex-shrink-0"
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span
                          className={`text-[10px] font-bold uppercase ${alert.type === "missed" ? "text-rose-600" : "text-amber-600"}`}
                        >
                          {alert.type === "bulk-submit"
                            ? "Bulk Submit"
                            : alert.type}
                        </span>
                        {!alert.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-milieuBlue flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-slate-800 text-xs font-medium truncate">
                        {alert.taskTitle || "System Alert"}
                      </p>
                      <p className="text-slate-500 text-[10px] mt-0.5">
                        {getProgramById(alert.programId)?.name || "Unknown"} ·{" "}
                        {new Date(alert.createdAt).toLocaleTimeString("en-CA", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
