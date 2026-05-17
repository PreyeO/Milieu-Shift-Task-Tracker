import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useTaskStore } from "../store/taskStore";
import { findUser } from "../data/mockUsers";
import { PROGRAMS } from "../data/programs";
import {
  Eye,
  EyeOff,
  Shield,
  User,
  ChevronRight,
  Lock,
  MapPin,
} from "lucide-react";
import milieuLogo from "../assets/milieu-logo.png";

export default function LoginPage() {
  const [role, setRole] = useState("staff"); // 'staff' or 'manager'
  const [programId, setProgramId] = useState(PROGRAMS[0].id);
  const [username, setUsername] = useState("staff");
  const [password, setPassword] = useState("demo123");

  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const { initSession } = useTaskStore();
  const navigate = useNavigate();

  // Update default username when role changes
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setUsername(newRole === "manager" ? "manager" : "staff");
    setError("");
  };

  const handleLogin = () => {
    setLoading(true);
    setError("");
    setTimeout(() => {
      const user = findUser(username, password, role);
      if (!user) {
        setError("Invalid username or password.");
        setLoading(false);
        return;
      }

      // If staff, assign the selected program to them dynamically
      const loggedInUser = { ...user };
      if (role === "staff") {
        loggedInUser.programId = programId;
      } else {
        // Manager sees all programs (we pass the list of all program IDs)
        loggedInUser.programIds = PROGRAMS.map((p) => p.id);
      }

      login(loggedInUser);

      if (role === "staff") {
        const hour = new Date().getHours();
        const shift =
          hour >= 7 && hour < 15
            ? "day"
            : hour >= 15 && hour < 23
              ? "evening"
              : "night";
        initSession(loggedInUser.programId, shift, loggedInUser.id);
        navigate("/staff");
      } else {
        navigate("/manager");
      }
      setLoading(false);
    }, 700);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-slate-50">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-milieuCoral/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-milieuBlue/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-milieuYellow/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src={milieuLogo}
            alt="Milieu"
            className="h-16 mx-auto mb-4 object-contain"
          />
        </div>

        {/* Login card */}
        <div className="glass-card p-6 mb-4">
          <h2 className="text-milieuNavy font-semibold text-lg mb-5 text-center">
            Sign In to Your Account
          </h2>

          {/* Role Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => handleRoleChange("staff")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                role === "staff"
                  ? "bg-white text-milieuNavy shadow-sm"
                  : "text-slate-500 hover:text-milieuNavy"
              }`}
            >
              <User size={16} /> Staff
            </button>
            <button
              onClick={() => handleRoleChange("manager")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                role === "manager"
                  ? "bg-white text-milieuNavy shadow-sm"
                  : "text-slate-500 hover:text-milieuNavy"
              }`}
            >
              <Shield size={16} /> Manager
            </button>
          </div>

          {error && (
            <div className="bg-milieuCoral/10 border border-milieuCoral/30 rounded-xl p-3 text-milieuCoral text-sm mb-4 text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Program Selection (Only for Staff) */}
            {role === "staff" && (
              <div className="animate-fade-in">
                <label className="text-slate-700 text-sm font-medium block mb-1.5">
                  Select Program
                </label>
                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <select
                    className="input-field pl-9 appearance-none"
                    value={programId}
                    onChange={(e) => setProgramId(e.target.value)}
                  >
                    {PROGRAMS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="text-slate-700 text-sm font-medium block mb-1.5">
                Username
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  id="username"
                  className="input-field pl-9"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 text-sm font-medium block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  className="input-field pl-9 pr-10"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  autoComplete="current-password"
                />
                <button
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-btn"
              onClick={handleLogin}
              disabled={loading || !username || !password}
              className={`w-full flex items-center justify-center gap-2 h-11 mt-2 text-white font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                role === "manager"
                  ? "bg-milieuNavy hover:bg-milieuNavy/90"
                  : "bg-milieuBlue hover:bg-blue-600"
              }`}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
