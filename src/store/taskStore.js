import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TASK_TEMPLATES } from '../data/taskTemplates';
import { getTaskStatus, getShiftDateString } from '../utils/timeUtils';

// Version key — bump this whenever task templates change to clear stale data
const TEMPLATE_VERSION = 2;

const buildSessionTasks = (programId, shift, staffId, templates) => {
  const shiftTemplates = templates[programId]?.[shift] || [];
  return shiftTemplates.map((t) => ({
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
      templates: TASK_TEMPLATES, // Always use fresh imported templates
      templateVersion: TEMPLATE_VERSION,
      activeSessionKey: null,

      initSession: (programId, shift, staffId) => {
        // If template version changed, clear all old sessions
        if (get().templateVersion !== TEMPLATE_VERSION) {
          set({ sessions: {}, templates: TASK_TEMPLATES, templateVersion: TEMPLATE_VERSION });
        }
        const key = `${programId}-${shift}-${getShiftDateString()}`;
        
        // If session already exists, just set it as active without overwriting tasks
        const existingSession = get().sessions[key];
        if (existingSession) {
          set({ activeSessionKey: key });
          return;
        }

        // Always rebuild the session from current templates to ensure fresh data
        const tasks = buildSessionTasks(programId, shift, staffId, TASK_TEMPLATES);
        set((state) => ({
          sessions: { ...state.sessions, [key]: { tasks, startedAt: new Date().toISOString(), staffId, programId, shift } },
          activeSessionKey: key,
          templates: TASK_TEMPLATES,
        }));
      },

      // Template CRUD operations
      addTemplateTask: (programId, shift, task) => set((state) => {
        const updatedTemplates = { ...state.templates };
        if (!updatedTemplates[programId]) updatedTemplates[programId] = {};
        if (!updatedTemplates[programId][shift]) updatedTemplates[programId][shift] = [];
        
        const newTask = {
          id: `${programId.slice(0,3)}-${shift[0]}-${Date.now()}`,
          ...task
        };
        
        updatedTemplates[programId][shift] = [...updatedTemplates[programId][shift], newTask];
        return { templates: updatedTemplates };
      }),

      updateTemplateTask: (programId, shift, taskId, updatedFields) => set((state) => {
        const updatedTemplates = { ...state.templates };
        if (updatedTemplates[programId]?.[shift]) {
          updatedTemplates[programId][shift] = updatedTemplates[programId][shift].map(t =>
            t.id === taskId ? { ...t, ...updatedFields } : t
          );
        }
        return { templates: updatedTemplates };
      }),

      deleteTemplateTask: (programId, shift, taskId) => set((state) => {
        const updatedTemplates = { ...state.templates };
        if (updatedTemplates[programId]?.[shift]) {
          updatedTemplates[programId][shift] = updatedTemplates[programId][shift].filter(t => t.id !== taskId);
        }
        return { templates: updatedTemplates };
      }),

      // Active Shift CRUD operations (Ad-hoc edits for currently running shift)
      addActiveTask: (sessionKey, task) => set((state) => {
        const session = state.sessions[sessionKey];
        if (!session) return {};
        
        const newTask = {
          id: `active-${Date.now()}`,
          sessionId: `${session.programId}-${session.shift}-${Date.now()}-active`,
          programId: session.programId,
          shift: session.shift,
          staffId: session.staffId,
          status: 'upcoming',
          completedAt: null,
          completedBy: null,
          comment: '',
          alertSent: false,
          ...task
        };
        
        return {
          sessions: {
            ...state.sessions,
            [sessionKey]: {
              ...session,
              tasks: [...session.tasks, newTask]
            }
          }
        };
      }),

      updateActiveTask: (sessionKey, taskId, updatedFields) => set((state) => {
        const session = state.sessions[sessionKey];
        if (!session) return {};
        
        const updatedTasks = session.tasks.map(t =>
          t.id === taskId ? { ...t, ...updatedFields, status: t.completedAt ? t.status : getTaskStatus({ ...t, ...updatedFields }) } : t
        );
        
        return {
          sessions: {
            ...state.sessions,
            [sessionKey]: {
              ...session,
              tasks: updatedTasks
            }
          }
        };
      }),

      deleteActiveTask: (sessionKey, taskId) => set((state) => {
        const session = state.sessions[sessionKey];
        if (!session) return {};
        
        return {
          sessions: {
            ...state.sessions,
            [sessionKey]: {
              ...session,
              tasks: session.tasks.filter(t => t.id !== taskId)
            }
          }
        };
      }),

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
