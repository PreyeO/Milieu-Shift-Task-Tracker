import { useState } from "react";
import { useAlertStore } from "../store/alertStore";
import { PROGRAMS, getProgramById } from "../data/programs";
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Trash2,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";

const ALERT_TYPES = {
  all: "All",
  missed: "Missed",
  late: "Late",
  "bulk-submit": "Bulk Submit",
};

const ALERT_COLORS = {
  missed: {
    border: "border-l-rose-500",
    bg: "bg-rose-50/50",
    icon: "text-rose-500",
    badge: "bg-rose-100 text-rose-700 border-rose-200",
  },
  late: {
    border: "border-l-amber-500",
    bg: "bg-amber-50/50",
    icon: "text-amber-500",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
  },
  "bulk-submit": {
    border: "border-l-orange-500",
    bg: "bg-orange-50/50",
    icon: "text-orange-500",
    badge: "bg-orange-100 text-orange-700 border-orange-200",
  },
};

export default function AlertsPage() {
  const { alerts, markRead, markAllRead, clearAlerts } = useAlertStore();
  const [filter, setFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const filtered = alerts.filter((a) => {
    const typeMatch = filter === "all" || a.type === filter;
    const programMatch =
      programFilter === "all" || a.programId === programFilter;
    return typeMatch && programMatch;
  });

  const unread = alerts.filter((a) => !a.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-milieuNavy flex items-center gap-2">
            <Bell size={22} className="text-milieuBlue" />
            Alerts
            {unread > 0 && (
              <span className="bg-milieuCoral text-white text-xs font-bold rounded-full px-2 py-0.5">
                {unread}
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Missed tasks, late sign-offs and bulk submissions
          </p>
        </div>
        <div className="flex gap-2">
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <Eye size={14} /> Mark All Read
            </button>
          )}
          {alerts.length > 0 && (
            <button
              onClick={clearAlerts}
              className="btn-danger text-sm flex items-center gap-2"
            >
              <Trash2 size={14} /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3 items-center">
        <Filter size={14} className="text-slate-400" />
        <div className="flex gap-2 flex-wrap">
          {Object.entries(ALERT_TYPES).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === key ? "bg-milieuBlue text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
            >
              {label}
              {key !== "all" && (
                <span className="ml-1.5 opacity-60">
                  {alerts.filter((a) => a.type === key).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="w-px h-5 bg-white/10 hidden sm:block" />
        <select
          className="input-field w-auto py-1.5 text-sm"
          value={programFilter}
          onChange={(e) => setProgramFilter(e.target.value)}
        >
          <option value="all">All Programs</option>
          {PROGRAMS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            label: "Missed Tasks",
            count: alerts.filter((a) => a.type === "missed").length,
            color: "text-rose-600",
          },
          {
            label: "Late Sign-Offs",
            count: alerts.filter((a) => a.type === "late").length,
            color: "text-amber-600",
          },
          {
            label: "Bulk Submits",
            count: alerts.filter((a) => a.type === "bulk-submit").length,
            color: "text-orange-600",
          },
        ].map(({ label, count, color }) => (
          <div key={label} className="glass-card p-3 text-center">
            <p className={`text-xl font-bold ${color}`}>{count}</p>
            <p className="text-slate-500 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Alert list */}
      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center bg-emerald-50/50">
          <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
          <p className="text-slate-800 font-medium">No alerts found</p>
          <p className="text-slate-500 text-sm mt-1">
            {alerts.length === 0
              ? "All tasks are being completed on time."
              : "Try adjusting the filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((alert) => {
            const style = ALERT_COLORS[alert.type] || ALERT_COLORS.missed;
            const program = getProgramById(alert.programId);
            return (
              <div
                key={alert.id}
                onClick={() => markRead(alert.id)}
                className={`glass-card p-4 border-l-4 ${style.border} ${style.bg} cursor-pointer hover:shadow-md transition-all ${!alert.read ? "ring-1 ring-slate-200 shadow-sm" : "opacity-70"}`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={18}
                    className={`${style.icon} flex-shrink-0 mt-0.5`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${style.badge}`}
                        >
                          {alert.type === "bulk-submit"
                            ? "Bulk Submit"
                            : alert.type}
                        </span>
                        {!alert.read && (
                          <span className="w-2 h-2 rounded-full bg-milieuBlue animate-pulse" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 text-xs">
                        <Clock size={11} />
                        {new Date(alert.createdAt).toLocaleString("en-CA", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <p className="text-slate-800 text-sm font-semibold mb-0.5">
                      {alert.taskTitle || "System Alert"}
                    </p>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      {alert.message}
                    </p>
                    <div className="flex items-center justify-between gap-2 mt-3 flex-wrap border-t border-slate-100/50 pt-2.5">
                      <div className="flex items-center gap-3">
                        {program && (
                          <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                            📍 {program.name}
                          </span>
                        )}
                        {alert.read && (
                          <span className="text-[10px] text-slate-600 flex items-center gap-1">
                            <CheckCircle size={10} /> Reviewed
                          </span>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
