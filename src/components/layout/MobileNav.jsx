import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useAlertStore } from "../../store/alertStore";
import {
  Bell,
  Menu,
  X,
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  LogOut,
  CalendarRange,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { getProgramById } from "../../data/programs";
import milieuLogo from "../../assets/milieu-logo.png";

export default function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const { user, logout } = useAuthStore();
  const alerts = useAlertStore((s) => s.alerts);
  const unread = alerts.filter((a) => !a.read).length;
  const navigate = useNavigate();
  const program = user?.programId ? getProgramById(user.programId) : null;
  const isManager = user?.role === "manager";

  const staffLinks = [
    { to: "/staff", icon: LayoutDashboard, label: "My Tasks" },
  ];
  const managerLinks = [
    { to: "/manager", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/programs", icon: ClipboardList, label: "Programs" },
    { to: "/schedules", icon: CalendarRange, label: "Schedules" },
    { to: "/reports", icon: BarChart3, label: "Reports" },
    { to: "/alerts", icon: Bell, label: "Alerts", badge: unread },
  ];
  const links = isManager ? managerLinks : staffLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
    setOpen(false);
  };

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-white/95 border-b border-slate-200 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <img src={milieuLogo} alt="Milieu" className="h-7 object-contain" />
        </div>
        <div className="flex items-center gap-3">
          {isManager && (
            <button 
              onClick={() => navigate("/alerts")}
              className="relative p-1 text-slate-500 hover:text-slate-800 hover:scale-105 transition-all"
              title="View Alerts"
            >
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                  {unread}
                </span>
              )}
            </button>
          )}
          <button onClick={() => setOpen(!open)} className="text-slate-600 p-1">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex flex-col pt-14 bg-white/98 backdrop-blur-md animate-fade-in">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-milieuNavy/10 border-2 border-milieuNavy/20 flex items-center justify-center text-milieuNavy font-bold">
                {user?.initials}
              </div>
              <div>
                <p className="text-slate-800 font-semibold">{user?.name}</p>
                <p className="text-xs text-slate-500 capitalize">
                  {isManager ? "Manager" : program?.name || "Staff"}
                </p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {links.map(({ to, icon: Icon, label, badge }) => (
              <NavLink
                key={to}
                to={to}
                end
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm font-semibold
                   ${isActive 
                     ? "bg-blue-50 text-milieuBlue font-bold border border-blue-100 shadow-sm" 
                     : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`
                }
              >
                <Icon size={18} />
                <span className="flex-1">{label}</span>
                {badge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-2 py-0.5">
                    {badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl w-full text-left font-semibold text-sm text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
