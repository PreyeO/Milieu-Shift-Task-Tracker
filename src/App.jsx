import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useTaskStore } from './store/taskStore';
import { useAlertStore } from './store/alertStore';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
import LoginPage from './pages/LoginPage';
import StaffDashboard from './pages/StaffDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import ReportsPage from './pages/ReportsPage';
import ProgramsPage from './pages/ProgramsPage';
import AlertsPage from './pages/AlertsPage';
import SchedulesPage from './pages/SchedulesPage';

function ProtectedLayout({ requiredRole }) {
  const { isAuthenticated, user } = useAuthStore();
  
  React.useEffect(() => {
    if (isAuthenticated) {
      const cleanupTasks = useTaskStore.getState().setupRealtime();
      const cleanupAlerts = useAlertStore.getState().setupRealtime();
      useAlertStore.getState().fetchAlerts(); // Load initial alerts
      return () => {
        cleanupTasks();
        cleanupAlerts();
      };
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'manager' ? '/manager' : '/staff'} replace />;
  }
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <MobileNav />
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user?.role === 'manager' ? '/manager' : '/staff'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RootRedirect />} />

        {/* Staff routes */}
        <Route element={<ProtectedLayout requiredRole="staff" />}>
          <Route path="/staff" element={<StaffDashboard />} />
        </Route>

        {/* Manager routes */}
        <Route element={<ProtectedLayout requiredRole="manager" />}>
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/schedules" element={<SchedulesPage />} />
        </Route>

        {/* Shared routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/alerts" element={<AlertsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
