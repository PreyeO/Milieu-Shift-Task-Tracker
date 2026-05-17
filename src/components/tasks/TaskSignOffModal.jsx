import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import { useTaskStore } from '../../store/taskStore';
import { useAuthStore } from '../../store/authStore';
import { formatTime } from '../../utils/timeUtils';
import { CheckCircle, Clock, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TaskSignOffModal({ task, isOpen, onClose }) {
  const [comment, setComment] = useState('');
  const [initials, setInitials] = useState('');
  const [confirming, setConfirming] = useState(false);
  const { completeTask } = useTaskStore();
  const { user } = useAuthStore();

  if (!task) return null;

  const isPast = task.status === 'missed';
  const isActive = task.status === 'pending';

  const handleSubmit = () => {
    if (!initials.trim()) {
      toast.error('Please enter your initials to sign off.', { duration: 3000 });
      return;
    }
    setConfirming(true);
    setTimeout(() => {
      completeTask(task.id, comment, initials.toUpperCase().trim());
      toast.success(`✓ "${task.title}" signed off!`, {
        style: { background: '#0f1f36', color: '#fff', border: '1px solid #0ea5a0' },
        duration: 4000,
      });
      setConfirming(false);
      setComment('');
      setInitials('');
      onClose();
    }, 600);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sign Off Task" size="md">
      <div className="space-y-5">
        {/* Task info */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-white font-semibold text-base leading-snug">{task.title}</h3>
            <Badge status={task.status} />
          </div>
          <p className="text-slate-400 text-sm mb-3 leading-relaxed">{task.description}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock size={12} />
            <span>Scheduled: {task.startTime} – {task.endTime}</span>
          </div>
        </div>

        {/* Late warning */}
        {isPast && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-amber-400 text-sm">
            ⚠️ This task window has passed. Signing off now will be marked as <strong>LATE</strong> with the current timestamp.
          </div>
        )}

        {/* Already completed */}
        {task.completedAt && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-emerald-400 text-sm">
            ✓ Completed at {formatTime(task.completedAt)} by {task.completedBy || user?.name}
            {task.comment && <p className="mt-1 text-slate-400">Note: {task.comment}</p>}
          </div>
        )}

        {/* Comment & Initials */}
        {!task.completedAt && (
          <>
            <div>
              <label className="text-slate-300 text-sm font-medium flex items-center gap-2 mb-2">
                Staff Initials <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                maxLength={3}
                className="input-field uppercase placeholder:normal-case"
                placeholder="e.g. JD"
                value={initials}
                onChange={(e) => setInitials(e.target.value)}
              />
            </div>

            <div>
              <label className="text-slate-300 text-sm font-medium flex items-center gap-2 mb-2">
                <MessageSquare size={14} />
                Add a note (optional)
              </label>
              <textarea
                className="input-field resize-none"
                rows={3}
                placeholder="Any observations, changes, or notes..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            {/* Confirm row */}
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={confirming || !initials.trim()}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {confirming ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle size={16} />
                )}
                {confirming ? 'Saving...' : isPast ? 'Sign Off (Late)' : 'Sign Off Task'}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
