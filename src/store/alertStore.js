import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';

const mapAlert = (a) => ({
  ...a,
  programId: a.program_id,
  taskId: a.task_id,
  taskTitle: a.task_title,
  createdAt: a.created_at
});

export const useAlertStore = create((set, get) => ({
  alerts: [],
  isLoading: false,

  fetchAlerts: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
      
    if (!error && data) {
      set({ alerts: data.map(mapAlert), isLoading: false });
    } else {
      console.error('Error fetching alerts:', error);
      set({ isLoading: false });
    }
  },

  addAlert: async (alertData) => {
    // Idempotency: check by task_title + type + program within 24h so duplicate
    // sessions (different task IDs, same template) don't generate extra alerts
    const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    let dupCheck = supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('program_id', alertData.programId)
      .eq('type', alertData.type)
      .gte('created_at', windowStart);
    if (alertData.taskTitle) {
      dupCheck = dupCheck.eq('task_title', alertData.taskTitle);
    }
    const { count } = await dupCheck;
    if (count && count > 0) return;

    const newAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      created_at: new Date().toISOString(),
      read: false,
      program_id: alertData.programId,
      task_id: alertData.taskId,
      task_title: alertData.taskTitle,
      type: alertData.type,
      message: alertData.message,
    };

    // Optimistic update - use mapped version
    set((state) => ({ alerts: [mapAlert(newAlert), ...state.alerts].slice(0, 200) }));

    const { error } = await supabase.from('alerts').insert([newAlert]);
    if (error) {
      console.error('Error adding alert to supabase:', error);
    }
  },

  markRead: async (id) => {
    // Optimistic update
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, read: true } : a)),
    }));

    const { error } = await supabase.from('alerts').update({ read: true }).eq('id', id);
    if (error) console.error('Error updating alert read status:', error);
  },

  markAllRead: async () => {
    // Optimistic update
    set((state) => ({ alerts: state.alerts.map((a) => ({ ...a, read: true })) }));

    const { error } = await supabase.from('alerts').update({ read: true }).neq('read', true);
    if (error) console.error('Error marking all alerts as read:', error);
  },

  clearAlerts: async () => {
    set({ alerts: [] });
    // Delete all alerts from the database
    const { error } = await supabase.from('alerts').delete().neq('id', 'dummy');
    if (error) console.error('Error clearing alerts:', error);
  },

  getUnreadCount: () => get().alerts.filter((a) => !a.read).length,

  getAlertsByProgram: (programId) => get().alerts.filter((a) => a.programId === programId),

  setupRealtime: () => {
    const channel = supabase
      .channel('public:alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, (payload) => {
        set((state) => {
          // Avoid duplicates if we optimistically added it
          if (state.alerts.find(a => a.id === payload.new.id)) return state;
          return { alerts: [mapAlert(payload.new), ...state.alerts].slice(0, 200) };
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'alerts' }, (payload) => {
        set((state) => ({
          alerts: state.alerts.map(a => a.id === payload.new.id ? mapAlert(payload.new) : a)
        }));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'alerts' }, (payload) => {
        set((state) => ({
          alerts: state.alerts.filter(a => a.id !== payload.old.id)
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}));
