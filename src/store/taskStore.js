import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getTasksForShift } from '../data/taskTemplates';
import { getTaskStatus, getShiftDateString } from '../utils/timeUtils';

const buildSessionTasks = (programId, shift, staffId) => {
  const templates = getTasksForShift(programId, shift);
  return templates.map((t) => ({
    ...t,
    sessionId: `${programId}-${shift}-${Date.now()}-${t.id}`,
    programId,
    shift,
    staffId,
    status: 'upcoming',
    completedAt: null,
    completedBy: null,
    comment: '',
    alertSent: false,
  }));
};

export const useTaskStore = create(
  persist(
    (set, get) => ({
      sessions: {},      // { [programId-shift]: { tasks, startedAt, staffId } }
      activeSessionKey: null,

      initSession: (programId, shift, staffId) => {
        const key = `${programId}-${shift}-${getShiftDateString()}`;
        const existing = get().sessions[key];
        if (!existing) {
          const tasks = buildSessionTasks(programId, shift, staffId);
          set((state) => ({
            sessions: { ...state.sessions, [key]: { tasks, startedAt: new Date().toISOString(), staffId, programId, shift } },
            activeSessionKey: key,
          }));
        } else {
          set({ activeSessionKey: key });
        }
      },

      getActiveTasks: () => {
        const { sessions, activeSessionKey } = get();
        return sessions[activeSessionKey]?.tasks || [];
      },

      completeTask: (taskId, comment = '', completedBy = null) => {
        const { sessions, activeSessionKey } = get();
        if (!activeSessionKey) return;
        const session = sessions[activeSessionKey];
        const now = new Date().toISOString();
        const updatedTasks = session.tasks.map((t) =>
          t.id === taskId ? { ...t, completedAt: now, comment, completedBy, status: getTaskStatus({ ...t, completedAt: now }) } : t
        );
        set((state) => ({
          sessions: {
            ...state.sessions,
            [activeSessionKey]: { ...session, tasks: updatedTasks },
          },
        }));
      },

      refreshStatuses: () => {
        const { sessions } = get();
        const updatedSessions = { ...sessions };
        const now = new Date();
        const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
        
        Object.keys(updatedSessions).forEach(key => {
          const session = updatedSessions[key];
          if (new Date(session.startedAt) > cutoff) {
            updatedSessions[key] = {
              ...session,
              tasks: session.tasks.map((t) => t.completedAt ? t : { ...t, status: getTaskStatus(t) })
            };
          }
        });
        set({ sessions: updatedSessions });
      },

      markAlertSent: (taskId) => {
        const { sessions } = get();
        const updatedSessions = { ...sessions };
        Object.keys(updatedSessions).forEach(key => {
          const session = updatedSessions[key];
          if (session.tasks.some(t => t.id === taskId)) {
            updatedSessions[key] = {
              ...session,
              tasks: session.tasks.map(t => t.id === taskId ? { ...t, alertSent: true } : t)
            };
          }
        });
        set({ sessions: updatedSessions });
      },

      getAllSessions: () => get().sessions,

      clearOldSessions: () => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        set((state) => {
          const cleaned = Object.fromEntries(
            Object.entries(state.sessions).filter(([, v]) => new Date(v.startedAt) > cutoff)
          );
          return { sessions: cleaned };
        });
      },
    }),
    { name: 'milieu-tasks' }
  )
);
