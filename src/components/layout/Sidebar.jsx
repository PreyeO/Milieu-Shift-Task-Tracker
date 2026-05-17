import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useAlertStore } from "../../store/alertStore";
import { getProgramById } from "../../data/programs";
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Bell,
  LogOut,
  Shield,
} from "lucide-react";
import milieuLogo from "../../assets/milieu-logo.png";

const Logo = () => (
  <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
    <img src={milieuLogo} alt="Milieu" className="h-9 object-contain" />
  </div>
);

export default function Sidebar() {
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
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-milieuNavy border-r border-white/5 fixed left-0 top-0 z-50">
      <Logo />

      {/* User info */}
      <div className="mx-3 my-4 p-3 rounded-xl bg-white/5 border border-white/5">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full bg-milieuBlue/20 border-2 border-milieuBlue/40 flex items-center justify-center text-white text-sm font-bold`}
          >
            {user?.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {user?.name}
            </p>
            <p className="text-xs text-slate-300 capitalize flex items-center gap-1">
              {isManager && <Shield size={10} className="text-milieuYellow" />}
              {isManager ? "Manager" : program?.shortName || "Staff"}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {links.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/staff" || to === "/manager"}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <Icon size={18} />
            <span className="flex-1">{label}</span>
            {badge > 0 && (
              <span className="bg-milieuCoral text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {badge > 9 ? "9+" : badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/5 space-y-1">
        <button
          onClick={handleLogout}
          className="nav-item w-full text-left text-milieuCoral hover:text-red-300 hover:bg-rose-500/10"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
        <p className="text-[10px] text-slate-600 text-center pt-2">
          Milieu Family Services © 2025
        </p>
      </div>
    </aside>
  );
}
