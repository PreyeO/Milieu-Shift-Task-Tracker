import { useState } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { bulkPrint, bulkDownloadZip, generateDateStrings } from '../../utils/bulkExport';
import { Printer, Download, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const SHIFTS = [
  { key: 'day',     label: 'Day Shift' },
  { key: 'evening', label: 'Evening Shift' },
  { key: 'night',   label: 'Graveyard Shift' },
];

function getWeekRange(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay(); // 0=Sun
  const mon = new Date(d); mon.setDate(d.getDate() - ((day + 6) % 7));
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  return { start: mon, end: sun };
}

function getMonthRange(year, month) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return { start, end };
}

export default function BulkExportPanel() {
  const fetchSessionsForDateRange = useTaskStore(s => s.fetchSessionsForDateRange);

  const [rangeType, setRangeType] = useState('day');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedShifts, setSelectedShifts] = useState(['day', 'evening', 'night']);
  const [printing, setPrinting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const toggleShift = (key) => {
    setSelectedShifts(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const getDateRange = () => {
    if (rangeType === 'day') {
      const d = new Date(selectedDate + 'T12:00:00');
      return { start: d, end: d, label: selectedDate };
    }
    if (rangeType === 'week') {
      const { start, end } = getWeekRange(selectedDate);
      return { start, end, label: `Week of ${start.toDateString()}` };
    }
    const [y, m] = selectedMonth.split('-').map(Number);
    const { start, end } = getMonthRange(y, m - 1);
    return { start, end, label: selectedMonth };
  };

  const fetchFiltered = async () => {
    const { start, end } = getDateRange();
    const allDates = generateDateStrings(start, end);
    const allSessions = await fetchSessionsForDateRange(allDates);
    // Filter by selected shifts
    return Object.fromEntries(
      Object.entries(allSessions).filter(([, entry]) =>
        selectedShifts.includes(entry.session.shift)
      )
    );
  };

  const handlePrint = async () => {
    if (!selectedShifts.length) { toast.error('Select at least one shift.'); return; }
    setPrinting(true);
    try {
      const sessions = await fetchFiltered();
      if (!Object.keys(sessions).length) { toast.error('No data found for the selected range.'); return; }
      await bulkPrint(sessions);
    } catch (e) {
      console.error(e);
      toast.error('Print failed. See console for details.');
    } finally {
      setPrinting(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedShifts.length) { toast.error('Select at least one shift.'); return; }
    setDownloading(true);
    setProgress({ done: 0, total: 0 });
    try {
      const sessions = await fetchFiltered();
      const total = Object.keys(sessions).length;
      if (!total) { toast.error('No data found for the selected range.'); return; }
      setProgress({ done: 0, total });
      const { label } = getDateRange();
      await bulkDownloadZip(sessions, `ShiftReports_${label}`, (done, t) => setProgress({ done, total: t }));
      toast.success(`ZIP downloaded — ${total} chart${total !== 1 ? 's' : ''}.`);
    } catch (e) {
      console.error(e);
      toast.error('Download failed. See console for details.');
    } finally {
      setDownloading(false);
      setProgress({ done: 0, total: 0 });
    }
  };

  return (
    <div className="glass-card p-4 sm:p-5 space-y-4">
      <h3 className="text-slate-800 font-bold text-sm flex items-center gap-2">
        <Download size={15} className="text-milieuBlue" />
        Bulk Export
      </h3>

      {/* Range type */}
      <div className="flex gap-2">
        {['day', 'week', 'month'].map(r => (
          <button
            key={r}
            onClick={() => setRangeType(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors capitalize ${
              rangeType === r
                ? 'bg-milieuBlue text-white border-milieuBlue'
                : 'border-slate-200 text-slate-600 hover:border-milieuBlue'
            }`}
          >
            {r === 'day' ? 'Full Day' : r === 'week' ? 'Full Week' : 'Full Month'}
          </button>
        ))}
      </div>

      {/* Date picker */}
      {rangeType !== 'month' ? (
        <div>
          <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">
            {rangeType === 'week' ? 'Any date in the week' : 'Date'}
          </label>
          <input
            type="date"
            className="input-field py-1.5 text-sm w-48"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          />
        </div>
      ) : (
        <div>
          <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Month</label>
          <input
            type="month"
            className="input-field py-1.5 text-sm w-48"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          />
        </div>
      )}

      {/* Shift checkboxes */}
      <div>
        <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Shifts to include</label>
        <div className="flex gap-3 flex-wrap">
          {SHIFTS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selectedShifts.includes(key)}
                onChange={() => toggleShift(key)}
                className="rounded"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      {downloading && progress.total > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Generating charts…</span>
            <span>{progress.done} / {progress.total}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-milieuBlue rounded-full transition-all duration-200"
              style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handlePrint}
          disabled={printing || downloading}
          className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-40"
        >
          {printing ? <Loader size={14} className="animate-spin" /> : <Printer size={14} />}
          {printing ? 'Opening…' : 'Bulk Print'}
        </button>
        <button
          onClick={handleDownload}
          disabled={printing || downloading}
          className="btn-primary flex items-center gap-2 text-sm disabled:opacity-40"
        >
          {downloading ? <Loader size={14} className="animate-spin" /> : <Download size={14} />}
          {downloading ? 'Building ZIP…' : 'Download ZIP'}
        </button>
      </div>
    </div>
  );
}
