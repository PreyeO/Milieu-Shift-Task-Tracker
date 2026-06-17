import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useTaskStore } from '../store/taskStore';
import { useAlertStore } from '../store/alertStore';
import { useAuthStore } from '../store/authStore';
import { parseSlotTime } from '../utils/timeUtils';
import { detectBulkSubmit } from '../utils/complianceUtils';
import { supabase } from '../services/supabaseClient';
import { requestNotificationPermission, playChime, showTaskNotification } from '../utils/notificationUtils';

export const useTaskTimer = () => {
  const { refreshStatuses, refreshAllStatuses, getActiveTasks, markAlertSent, getAllSessions } = useTaskStore();
  const { addAlert } = useAlertStore();
  const { user } = useAuthStore();
  const intervalRef = useRef(null);

  useEffect(() => {
    requestNotificationPermission();

    const tick = () => {
      // refreshStatuses handles the active staff session
      // refreshAllStatuses handles ALL sessions (needed for manager view)
      refreshStatuses();
      refreshAllStatuses();
      const allSessions = getAllSessions();
      const now = new Date();
      const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
      
      Object.values(allSessions).forEach(session => {
        if (new Date(session.startedAt) < cutoff) return;
        
        // 1. Process individual task alerts
        session.tasks.forEach((task) => {
          if (task.completedAt || task.alertSent) return;

          const windowStart = parseSlotTime(task.startTime);
          const windowEnd = parseSlotTime(task.endTime);
          const msIntoWindow = now - windowStart;

          // 15-min halfway reminder (sound + browser notification)
          const fifteenMin = 15 * 60 * 1000;
          if (msIntoWindow >= fifteenMin && msIntoWindow < fifteenMin + 30000 && now < windowEnd && !task.completedAt) {
            if (user?.role === 'manager' || user?.programId === task.programId) {
              playChime();
              showTaskNotification(task.title);
              toast(`⏰ "${task.title}" — halfway through its window!`, {
                duration: 8000,
                style: { background: '#1e3a5f', color: '#fff', border: '1px solid #f59e0b' },
              });
            }
          }

          // Missed alert
          if (now > windowEnd && task.status === 'missed' && !task.alertSent) {
            // Verify with DB first in case local state is stale (e.g. Realtime delayed/disabled)
            supabase.from('shift_tasks').select('completed_at').eq('id', task.id).single().then(({ data: dbTask }) => {
              if (dbTask && dbTask.completed_at) {
                // It was actually completed! Update local state to reflect reality and skip alerting.
                useTaskStore.setState((state) => {
                  const newSessions = { ...state.sessions };
                  Object.keys(newSessions).forEach((key) => {
                    newSessions[key].tasks = newSessions[key].tasks.map((t) =>
                      t.id === task.id ? { ...t, completedAt: dbTask.completed_at, status: 'completed' } : t
                    );
                  });
                  return { sessions: newSessions };
                });
                return;
              }

              // Truly missed, proceed with alert
              markAlertSent(task.id);
              addAlert({
                type: 'missed',
                severity: 'high',
                taskId: task.id,
                taskTitle: task.title,
                programId: task.programId,
                staffId: task.staffId,
                message: `Task "${task.title}" was not completed during the scheduled window (${task.startTime}–${task.endTime}).`,
              });
              
              const msSinceMissed = now - windowEnd;
              if (user?.role === 'manager' && msSinceMissed < 2 * 60 * 1000) {
                toast.error(`🚨 MISSED: "${task.title}" overdue!`, { duration: 8000 });
              }
            });
          }
        });

        // 2. Bulk-submit detection for this session
        if (session.tasks.length > 0 && detectBulkSubmit(session.tasks)) {
          const existing = useAlertStore.getState().alerts.find(
            (a) => a.type === 'bulk-submit' && a.programId === session.programId &&
              new Date(a.createdAt) > new Date(Date.now() - 10 * 60 * 1000)
          );
          if (!existing) {
            addAlert({
              type: 'bulk-submit',
              severity: 'medium',
              programId: session.programId,
              staffId: session.staffId,
              message: 'Multiple tasks completed in a very short time window. Possible end-of-shift bulk documentation detected.',
            });
          }
        }
      });
    };

    intervalRef.current = setInterval(tick, 30000);
    tick();
    return () => clearInterval(intervalRef.current);
  }, []);
};
