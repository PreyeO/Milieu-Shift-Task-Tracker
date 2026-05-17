import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAlertStore = create(
  persist(
    (set, get) => ({
      alerts: [],

      addAlert: (alert) => {
        const newAlert = {
          id: `alert-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          createdAt: new Date().toISOString(),
          read: false,
          ...alert,
        };
        set((state) => ({ alerts: [newAlert, ...state.alerts].slice(0, 200) }));
      },

      markRead: (id) =>
        set((state) => ({
          alerts: state.alerts.map((a) => (a.id === id ? { ...a, read: true } : a)),
        })),

      markAllRead: () =>
        set((state) => ({ alerts: state.alerts.map((a) => ({ ...a, read: true })) })),

      clearAlerts: () => set({ alerts: [] }),

      getUnreadCount: () => get().alerts.filter((a) => !a.read).length,

      getAlertsByProgram: (programId) =>
        get().alerts.filter((a) => a.programId === programId),
    }),
    { name: 'milieu-alerts' }
  )
);
