import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import { TASK_TEMPLATES } from '../data/taskTemplates';
import { PROGRAMS } from '../data/programs';
import { getTaskStatus, getShiftDateString } from '../utils/timeUtils';

const buildSessionTasks = (sessionId, programId, shift, staffId, templates) => {
  const shiftTemplates = templates[programId]?.[shift] || [];

  return shiftTemplates.map((t) => ({
    id: `${sessionId}-${t.id}`,
    session_id: sessionId,
    program_id: programId,
    shift: shift,
    staff_id: staffId,
    template_id: t.id,
    title: t.title,
    description: t.description,
    start_time: t.startTime,
    end_time: t.endTime,
    status: 'upcoming',
    completed_at: null,
    completed_by: null,
    comment: '',
    alert_sent: false,
  }));
};

export const useTaskStore = create((set, get) => ({
  sessions: {},      
  templates: TASK_TEMPLATES, 
  activeSessionKey: null,
  isLoading: false,

  fetchActiveSessions: async (targetDateStr = null) => {
    set({ isLoading: true });
    const dateStr = targetDateStr || getShiftDateString();
    
    // Fetch all sessions for today
    const { data: existingSessions, error: sessionError } = await supabase
      .from('shift_sessions')
      .select('*')
      .eq('date', dateStr);

    if (existingSessions && !sessionError) {
      // We only auto-initialize if we are fetching today's data to avoid creating future/past garbage
      const isToday = dateStr === getShiftDateString();

      if (isToday && !sessionError) {
        // Find which sessions are missing for today
        const existingKeys = new Set(existingSessions.map(s => `${s.program_id}-${s.shift}`));
        
        const missingSessions = [];
        const newTasks = [];
        
        // Only create sessions for programs that exist in the PROGRAMS registry
        const registeredIds = new Set(PROGRAMS.map(p => p.id));
        for (const programId of Object.keys(TASK_TEMPLATES).filter(id => registeredIds.has(id))) {
          for (const shift of ['day', 'evening', 'night']) {
            if (!existingKeys.has(`${programId}-${shift}`)) {
              // Create missing session
              const newSessionId = `session-${programId}-${shift}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
              missingSessions.push({
                id: newSessionId,
                program_id: programId,
                shift: shift,
                date: dateStr,
                staff_id: 'system', // Indicates auto-created by system
                started_at: new Date().toISOString()
              });
              
              const shiftTasks = buildSessionTasks(newSessionId, programId, shift, 'system', TASK_TEMPLATES);
              newTasks.push(...shiftTasks);
            }
          }
        }

        if (missingSessions.length > 0) {
          await supabase.from('shift_sessions').insert(missingSessions);
          if (newTasks.length > 0) {
            await supabase.from('shift_tasks').insert(newTasks);
          }
          
          // Refetch to get the newly created ones along with the old ones
          const { data: refreshedSessions } = await supabase
            .from('shift_sessions')
            .select('*')
            .eq('date', dateStr);
            
          if (refreshedSessions) {
            existingSessions.length = 0;
            existingSessions.push(...refreshedSessions);
          }
        }
      }

      if (existingSessions && existingSessions.length > 0) {
        const sessionIds = existingSessions.map(s => s.id);
        const { data: tasks, error: tasksError } = await supabase
          .from('shift_tasks')
          .select('*')
          .in('session_id', sessionIds);

        if (!tasksError && tasks) {
          // Self-healing: if a session has 0 tasks, we should regenerate them
          const sessionsToHeal = existingSessions.filter(s => 
            !tasks.some(t => t.session_id === s.id)
          );
          
          if (sessionsToHeal.length > 0) {
            const healedTasks = [];
            for (const s of sessionsToHeal) {
              const shiftTasks = buildSessionTasks(s.id, s.program_id, s.shift, s.staff_id || 'system', TASK_TEMPLATES);
              healedTasks.push(...shiftTasks);
            }
            if (healedTasks.length > 0) {
              await supabase.from('shift_tasks').insert(healedTasks);
              tasks.push(...healedTasks); // Add them locally so we don't need to refetch immediately
            }
          }

          const mappedTasks = tasks.map(t => {
            const mapped = {
              ...t,
              startTime: t.start_time,
              endTime: t.end_time,
              completedAt: t.completed_at,
              completedBy: t.completed_by,
              alertSent: t.alert_sent,
              programId: t.program_id,
              sessionId: t.session_id,
              staffId: t.staff_id,
              templateId: t.template_id,
            };
            mapped.status = getTaskStatus(mapped);
            return mapped;
          });

          const newSessionsState = {};
          existingSessions.forEach(session => {
            const sessionTasks = mappedTasks.filter(t => t.sessionId === session.id);
            const sessionKey = `${session.program_id}-${session.shift}-${dateStr}`;
            // When duplicate sessions exist, keep the one with the most completions
            // so staff sign-offs are never eclipsed by a system-created shadow session
            const existing = newSessionsState[sessionKey];
            const existingDone = existing?.tasks?.filter(t => t.completedAt).length ?? -1;
            const thisDone = sessionTasks.filter(t => t.completedAt).length;
            if (!existing || thisDone >= existingDone) {
              newSessionsState[sessionKey] = {
                tasks: sessionTasks,
                startedAt: session.started_at,
                staffId: session.staff_id,
                programId: session.program_id,
                shift: session.shift
              };
            }
          });

          set((state) => ({
            sessions: { ...state.sessions, ...newSessionsState },
            isLoading: false
          }));
          return;
        }
      }
    }
    set({ isLoading: false });
  },

  initSession: async (programId, shift, staffId) => {
    set({ isLoading: true });
    const dateStr = getShiftDateString();
    const sessionKey = `${programId}-${shift}-${dateStr}`;
    
    // Check if session exists in Supabase — use array query to survive duplicates gracefully
    const { data: sessionRows } = await supabase
      .from('shift_sessions')
      .select('*')
      .eq('program_id', programId)
      .eq('shift', shift)
      .eq('date', dateStr)
      .order('started_at', { ascending: true });

    // Prefer the oldest staff-created session so completions from the real shift are preserved
    const existingSession =
      sessionRows?.find(s => s.staff_id !== 'system') ?? sessionRows?.[0] ?? null;

    if (existingSession) {
      // Fetch existing tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('shift_tasks')
        .select('*')
        .eq('session_id', existingSession.id)
        .order('start_time', { ascending: true });

      if (!tasksError) {
        // Self-healing: if session exists but has 0 tasks, regenerate them
        if (tasks.length === 0) {
          const shiftTasks = buildSessionTasks(existingSession.id, programId, shift, staffId, TASK_TEMPLATES);
          if (shiftTasks.length > 0) {
            await supabase.from('shift_tasks').insert(shiftTasks);
            tasks.push(...shiftTasks);
          }
        }

        // Map db fields back to frontend expected fields (camelCase) + compute real-time status
        const mappedTasks = tasks.map(t => {
          const mapped = {
            ...t,
            startTime: t.start_time,
            endTime: t.end_time,
            completedAt: t.completed_at,
            completedBy: t.completed_by,
            alertSent: t.alert_sent,
            programId: t.program_id,
            sessionId: t.session_id,
            staffId: t.staff_id,
            templateId: t.template_id,
          };
          mapped.status = getTaskStatus(mapped);
          return mapped;
        });

        set((state) => ({
          sessions: { 
            ...state.sessions, 
            [sessionKey]: { tasks: mappedTasks, startedAt: existingSession.started_at, staffId, programId, shift } 
          },
          activeSessionKey: sessionKey,
          isLoading: false
        }));
        return;
      }
    }

    // Otherwise, create new session
    const newSessionId = `session-${programId}-${shift}-${Date.now()}`;
    const newSession = {
      id: newSessionId,
      program_id: programId,
      shift: shift,
      date: dateStr,
      staff_id: staffId,
      started_at: new Date().toISOString()
    };

    await supabase.from('shift_sessions').insert([newSession]);

    // Build and insert tasks
    const newTasks = buildSessionTasks(newSessionId, programId, shift, staffId, TASK_TEMPLATES);
    await supabase.from('shift_tasks').insert(newTasks);

    const mappedTasks = newTasks.map(t => {
      const mapped = {
        ...t,
        startTime: t.start_time,
        endTime: t.end_time,
        completedAt: t.completed_at,
        completedBy: t.completed_by,
        alertSent: t.alert_sent,
        programId: t.program_id,
        sessionId: t.session_id,
        staffId: t.staff_id,
        templateId: t.template_id,
      };
      mapped.status = getTaskStatus(mapped);
      return mapped;
    });

    set((state) => ({
      sessions: { 
        ...state.sessions, 
        [sessionKey]: { tasks: mappedTasks, startedAt: newSession.started_at, staffId, programId, shift } 
      },
      activeSessionKey: sessionKey,
      isLoading: false
    }));
  },

  getActiveTasks: () => {
    const { sessions, activeSessionKey } = get();
    return sessions[activeSessionKey]?.tasks || [];
  },

  completeTask: async (taskId, comment = '', completedBy = null) => {
    const { sessions, activeSessionKey } = get();
    if (!activeSessionKey) return;
    const session = sessions[activeSessionKey];
    
    const now = new Date().toISOString();
    // Optimistic UI update
    const updatedTasks = session.tasks.map((t) =>
      t.id === taskId ? { ...t, completedAt: now, comment, completedBy, status: getTaskStatus({ ...t, completedAt: now }) } : t
    );
    
    set((state) => ({
      sessions: {
        ...state.sessions,
        [activeSessionKey]: { ...session, tasks: updatedTasks },
      },
    }));

    // Update Supabase
    const dbTask = updatedTasks.find(t => t.id === taskId);
    const { error } = await supabase.from('shift_tasks').update({
      completed_at: now,
      comment: comment,
      completed_by: completedBy,
      status: dbTask.status
    }).eq('id', taskId);
    if (error) {
      console.error('[completeTask] Supabase update failed — completion may not persist on reload:', error);
    }
  },

  refreshStatuses: async () => {
    const { sessions, activeSessionKey } = get();
    if (!activeSessionKey) return;
    
    const session = sessions[activeSessionKey];
    
    const updatedTasks = session.tasks.map((t) => {
      if (t.completedAt) return t;
      const newStatus = getTaskStatus(t);
      if (newStatus !== t.status) {
        // Fire and forget update to supabase for status changes
        supabase.from('shift_tasks').update({ status: newStatus }).eq('id', t.id);
        return { ...t, status: newStatus };
      }
      return t;
    });

    set((state) => ({
      sessions: {
        ...state.sessions,
        [activeSessionKey]: { ...session, tasks: updatedTasks }
      }
    }));
  },

  // Refreshes statuses for ALL sessions in the store (used by manager dashboard)
  refreshAllStatuses: async () => {
    const { sessions } = get();
    const sessionKeys = Object.keys(sessions);
    if (sessionKeys.length === 0) return;

    const updatedSessions = { ...sessions };
    let anyChanged = false;

    sessionKeys.forEach(key => {
      const session = sessions[key];
      const updatedTasks = session.tasks.map((t) => {
        if (t.completedAt) return t;
        const newStatus = getTaskStatus(t);
        if (newStatus !== t.status) {
          supabase.from('shift_tasks').update({ status: newStatus }).eq('id', t.id);
          anyChanged = true;
          return { ...t, status: newStatus };
        }
        return t;
      });
      updatedSessions[key] = { ...session, tasks: updatedTasks };
    });

    if (anyChanged) {
      set({ sessions: updatedSessions });
    }
  },

  setupRealtime: () => {
    const channel = supabase
      .channel('public:shift_tasks')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'shift_tasks' }, (payload) => {
        const dbTask = payload.new;
        set((state) => {
          const sessions = { ...state.sessions };
          let updated = false;
          
          Object.keys(sessions).forEach(key => {
            const session = sessions[key];
            const taskIndex = session.tasks.findIndex(t => t.id === dbTask.id);
            if (taskIndex !== -1) {
              const newTasks = [...session.tasks];
              newTasks[taskIndex] = {
                ...newTasks[taskIndex],
                status: dbTask.status,
                completedAt: dbTask.completed_at,
                completedBy: dbTask.completed_by,
                comment: dbTask.comment,
                alertSent: dbTask.alert_sent
              };
              sessions[key] = { ...session, tasks: newTasks };
              updated = true;
            }
          });
          
          return updated ? { sessions } : state;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // Stubbing template CRUD for compatibility
  addTemplateTask: () => {},
  updateTemplateTask: () => {},
  deleteTemplateTask: () => {},
  addActiveTask: () => {},
  updateActiveTask: () => {},
  deleteActiveTask: () => {},
  markAlertSent: async (taskId) => {
    // Update local state across all sessions
    set((state) => {
      const newSessions = { ...state.sessions };
      Object.keys(newSessions).forEach((key) => {
        newSessions[key].tasks = newSessions[key].tasks.map((t) =>
          t.id === taskId ? { ...t, alertSent: true } : t
        );
      });
      return { sessions: newSessions };
    });
    const { error } = await supabase.from('shift_tasks').update({ alert_sent: true }).eq('id', taskId);
    if (error) console.error('[markAlertSent] Supabase update failed:', error);
  },
  getAllSessions: () => get().sessions,
  clearOldSessions: () => {},
  
  resetSystem: async () => {
    // Only delete data from PAST days — today's shift data stays intact
    const todayStr = getShiftDateString();

    // Delete past alerts (older than today)
    await supabase.from('alerts').delete().lt('created_at', new Date(todayStr).toISOString());

    // Delete past tasks via past sessions
    const { data: pastSessions } = await supabase
      .from('shift_sessions')
      .select('id')
      .neq('date', todayStr);

    if (pastSessions && pastSessions.length > 0) {
      const pastIds = pastSessions.map(s => s.id);
      await supabase.from('shift_tasks').delete().in('session_id', pastIds);
      await supabase.from('shift_sessions').delete().neq('date', todayStr);
    }

    // Keep today's sessions in local state, only remove past ones
    set((state) => {
      const keptSessions = {};
      Object.entries(state.sessions).forEach(([key, session]) => {
        if (key.endsWith(todayStr)) {
          keptSessions[key] = session;
        }
      });
      return { sessions: keptSessions };
    });
  }
}));
