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
          {unread > 0 && (
            <div className="relative">
              <Bell size={20} className="text-slate-400" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            </div>
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
                  `nav-item ${isActive ? "active" : ""} text-base py-4`
                }
              >
                <Icon size={20} />
                <span className="flex-1">{label}</span>
                {badge > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                    {badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className="nav-item w-full text-left text-red-400 hover:bg-red-500/10 py-4 text-base"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
