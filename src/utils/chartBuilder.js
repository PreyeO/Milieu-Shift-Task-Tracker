import { format } from 'date-fns';
import { formatTimeSlot } from './timeUtils';
import { TASK_TEMPLATES } from '../data/taskTemplates';

const SHIFT_LABEL = {
  day:     'Day Shift – 7:00am–3:00pm',
  evening: 'Evening Shift – 3:00pm–11:00pm',
  night:   'Graveyard Shift – 11:00pm–7:00am',
};

const DUTY_KEYS = [
  { key: 'ofl',        label: 'Complete OFL for the month' },
  { key: 'drills',     label: 'Complete Emergency drills for the month' },
  { key: 'designated', label: 'Complete Designated duties for the month' },
];

function sortTasks(tasks, shift) {
  return [...tasks].sort((a, b) => {
    const toKey = (t) => {
      const [h, m] = (t || '00:00').split(':').map(Number);
      const mins = h * 60 + m;
      return shift === 'night' && h < 7 ? mins + 1440 : mins;
    };
    return toKey(a.startTime) - toKey(b.startTime);
  });
}

function getDesc(task, programId, shift) {
  const templates = TASK_TEMPLATES[programId]?.[shift] || [];
  return templates.find(t => t.id === task.templateId)?.description || task.description || '';
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildChartHTML(tasks, program, shift, date, monthlyDuties) {
  const sorted = sortTasks(tasks, shift);
  const dateStr = format(date, 'MMM dd, yyyy');
  const programName = esc(program?.name || 'N/A');
  const shiftLabel = SHIFT_LABEL[shift] || shift;

  const taskRows = sorted.map(task => {
    const [s1, s2] = (task.completedBy || '').split('/');
    const desc = esc(getDesc(task, program?.id, shift));
    const title = esc(task.title);
    const comment = esc(task.comment || '');
    const timeSlot = `${formatTimeSlot(task.startTime)} – ${formatTimeSlot(task.endTime)}`;

    let s1Cell = s1
      ? `<span style="color:#0ea5a0;font-weight:bold">${esc(s1)}</span>`
      : task.status === 'missed'
        ? '<span style="color:#ef4444;font-size:10px;font-weight:bold">MISSED</span>'
        : task.status === 'late'
          ? '<span style="color:#f97316;font-size:10px;font-weight:bold">LATE</span>'
          : '';
    const s2Cell = s2 ? `<span style="color:#0ea5a0;font-weight:bold">${esc(s2)}</span>` : '';

    return `
      <tr>
        <td style="border:1px solid #000;padding:5px 7px;vertical-align:top;white-space:nowrap;font-weight:bold;font-size:10px">${esc(timeSlot)}</td>
        <td style="border:1px solid #000;padding:5px 7px;vertical-align:top;font-size:10px;white-space:pre-wrap">
          <span style="font-weight:bold;display:block;margin-bottom:3px">${title}</span>${desc}
        </td>
        <td style="border:1px solid #000;padding:5px 7px;vertical-align:top;font-size:10px;font-style:italic;color:#555">${comment}</td>
        <td style="border:1px solid #000;padding:5px 7px;vertical-align:top;text-align:center;font-size:10px">${s1Cell}</td>
        <td style="border:1px solid #000;padding:5px 7px;vertical-align:top;text-align:center;font-size:10px">${s2Cell}</td>
      </tr>`;
  }).join('');

  const dutyRows = DUTY_KEYS.map(({ key, label }) => {
    const data = monthlyDuties?.[key];
    const [d1, d2] = (data?.initials || '').split('/');
    const yn = data
      ? data.yes ? '&#9745; Yes &nbsp;&nbsp; &#9744; No' : '&#9744; Yes &nbsp;&nbsp; &#9745; No'
      : '&#9744; Yes &nbsp;&nbsp; &#9744; No';
    const i1 = d1 ? `<span style="color:#0ea5a0;font-weight:bold">${esc(d1)}</span>` : '<span style="color:#aaa;font-style:italic">Initial:</span>';
    const i2 = d2 ? `<span style="color:#0ea5a0;font-weight:bold">${esc(d2)}</span>` : '<span style="color:#aaa;font-style:italic">Initial:</span>';
    return `
      <tr>
        <td style="border:1px solid #000;padding:5px 7px;font-size:10px;text-align:center;color:#aaa;font-style:italic">—</td>
        <td style="border:1px solid #000;padding:5px 7px;font-size:10px;font-weight:500">${esc(label)}</td>
        <td style="border:1px solid #000;padding:5px 7px;font-size:10px;text-align:center;white-space:nowrap;font-weight:500">${yn}</td>
        <td style="border:1px solid #000;padding:5px 7px;font-size:10px;text-align:center">${i1}</td>
        <td style="border:1px solid #000;padding:5px 7px;font-size:10px;text-align:center">${i2}</td>
      </tr>`;
  }).join('');

  return `
    <div style="font-family:Arial,sans-serif;color:#000;background:#fff;padding:32px;min-width:800px">
      <table style="width:100%;border-collapse:collapse;margin-bottom:14px">
        <tbody>
          <tr>
            <td style="border:1px solid #000;padding:6px 8px;font-weight:bold;width:20%">${esc(shiftLabel)}</td>
            <td style="border:1px solid #000;padding:6px 8px;width:20%"><strong>Date:</strong> ${dateStr}</td>
            <td style="border:1px solid #000;padding:6px 8px;font-weight:bold;width:20%">Program: ${programName}</td>
            <td style="border:1px solid #000;padding:6px 8px;width:20%"><strong>Staff 1:</strong></td>
            <td style="border:1px solid #000;padding:6px 8px;width:20%"><strong>Staff 2:</strong></td>
          </tr>
        </tbody>
      </table>

      <table style="width:100%;border-collapse:collapse;font-size:11px">
        <thead>
          <tr style="background:#f3f4f6">
            <th style="border:1px solid #000;padding:5px 7px;text-align:left;font-weight:bold;width:110px">Time</th>
            <th style="border:1px solid #000;padding:5px 7px;text-align:left;font-weight:bold">Activity</th>
            <th style="border:1px solid #000;padding:5px 7px;text-align:left;font-weight:bold;width:160px">Change and Rationale if changed</th>
            <th style="border:1px solid #000;padding:5px 7px;text-align:left;font-weight:bold;width:80px">Staff 1 Initial</th>
            <th style="border:1px solid #000;padding:5px 7px;text-align:left;font-weight:bold;width:80px">Staff 2 Initial</th>
          </tr>
        </thead>
        <tbody>
          ${taskRows}
          <tr style="background:#f3f4f6">
            <td colspan="5" style="border:1px solid #000;padding:5px 7px;font-weight:bold;text-align:center;text-transform:uppercase;letter-spacing:0.05em;font-size:10px">
              End of Shift — Monthly Duties
            </td>
          </tr>
          ${dutyRows}
        </tbody>
      </table>

      <p style="margin-top:24px;font-size:10px;text-align:center;color:#666;font-style:italic">
        ***To be sent to Manager and Coordinator Prior to leaving for the day Via the Group Chat on the house cell phone
      </p>
    </div>`;
}
