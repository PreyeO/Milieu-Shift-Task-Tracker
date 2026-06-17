import { useState } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { ClipboardCheck, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const DUTIES = [
  { key: 'ofl',        label: 'Complete OFL for the month' },
  { key: 'drills',     label: 'Complete Emergency drills for the month' },
  { key: 'designated', label: 'Complete Designated duties for the month' },
];

// Unlocks in the last 30 mins of shift and stays open for 1 hour after shift ends
function isCardActive(shift) {
  const now = new Date();
  const h = now.getHours() + now.getMinutes() / 60;
  if (shift === 'day')     return h >= 14.5 && h < 16;          // 2:30 PM – 4:00 PM
  if (shift === 'evening') return h >= 22.5 || h < 0.5;         // 10:30 PM – 12:30 AM
  if (shift === 'night')   return (h >= 6.5 && h < 8);          // 6:30 AM – 8:00 AM
  return false;
}

export default function MonthlyDutiesCard({ sessionKey, shift, monthlyDuties }) {
  const saveMonthlyDuties = useTaskStore((state) => state.saveMonthlyDuties);
  const [answers, setAnswers] = useState({
    ofl:        { yes: null, initials: '' },
    drills:     { yes: null, initials: '' },
    designated: { yes: null, initials: '' },
  });
  const [submitting, setSubmitting] = useState(false);

  const active = isCardActive(shift);
  const submitted = !!monthlyDuties;

  const setAnswer = (key, field, value) =>
    setAnswers(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));

  const allAnswered = DUTIES.every(d => answers[d.key].yes !== null);

  const handleSubmit = async () => {
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    const duties = {};
    DUTIES.forEach(d => {
      duties[d.key] = {
        yes: answers[d.key].yes,
        initials: answers[d.key].initials.toUpperCase().trim(),
      };
    });
    await saveMonthlyDuties(sessionKey, duties);
    toast.success('Monthly duties recorded!', {
      style: { background: '#ffffff', color: '#0f172a', border: '1px solid #10b981' },
      duration: 4000,
    });
    setSubmitting(false);
  };

  // ── Submitted — read-only view ──────────────────────────────────────────
  if (submitted) {
    return (
      <div className="glass-card p-4 border-l-4 border-emerald-400">
        <h3 className="text-slate-800 font-bold text-sm flex items-center gap-2 mb-3">
          <ClipboardCheck size={16} className="text-emerald-500" />
          End of Shift — Monthly Duties
          <span className="ml-auto text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
            Submitted ✓
          </span>
        </h3>
        <div className="space-y-2">
          {DUTIES.map(d => {
            const data = monthlyDuties[d.key];
            return (
              <div key={d.key} className="flex items-center gap-3 text-xs p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-700 flex-1">{d.label}</span>
                <span className={`font-bold px-2 py-0.5 rounded ${data?.yes ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'}`}>
                  {data?.yes ? 'Yes' : 'No'}
                </span>
                {data?.initials && (
                  <span className="text-slate-500 font-mono">{data.initials}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Locked — not yet end of shift ───────────────────────────────────────
  if (!active) {
    return (
      <div className="glass-card p-4 opacity-50">
        <h3 className="text-slate-600 font-bold text-sm flex items-center gap-2">
          <Lock size={14} className="text-slate-400" />
          End of Shift — Monthly Duties
        </h3>
        <p className="text-slate-400 text-xs mt-1.5">
          Available in the last 30 minutes of your shift.
        </p>
      </div>
    );
  }

  // ── Active — interactive form ────────────────────────────────────────────
  return (
    <div className="glass-card p-4 border-l-4 border-milieuYellow animate-fade-in">
      <h3 className="text-slate-800 font-bold text-sm flex items-center gap-2 mb-4">
        <ClipboardCheck size={16} className="text-milieuYellow" />
        End of Shift — Monthly Duties
      </h3>
      <div className="space-y-4">
        {DUTIES.map(d => (
          <div key={d.key} className="space-y-2">
            <p className="text-slate-700 text-xs font-medium">{d.label}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setAnswer(d.key, 'yes', true)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                  answers[d.key].yes === true
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'border-slate-200 text-slate-600 hover:border-emerald-300'
                }`}
              >
                ✓ Yes
              </button>
              <button
                onClick={() => setAnswer(d.key, 'yes', false)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                  answers[d.key].yes === false
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'border-slate-200 text-slate-600 hover:border-rose-300'
                }`}
              >
                ✗ No
              </button>
              <input
                type="text"
                maxLength={7}
                placeholder="Initials (e.g. JD/MK)"
                className="input-field flex-1 min-w-[130px] py-1 px-2 text-xs uppercase"
                value={answers[d.key].initials}
                onChange={e => setAnswer(d.key, 'initials', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        className="btn-primary w-full mt-5 text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <ClipboardCheck size={15} />
        )}
        {submitting ? 'Saving...' : 'Submit Monthly Duties'}
      </button>
    </div>
  );
}
