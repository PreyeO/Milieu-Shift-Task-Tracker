import JSZip from 'jszip';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { buildChartHTML } from './chartBuilder';
import { PROGRAMS } from '../data/programs';

const SHIFT_ORDER = { day: 0, evening: 1, night: 2 };
const SHIFT_FILE_LABEL = { day: 'DayShift', evening: 'EveningShift', night: 'GraveyardShift' };

function getProgramById(id) {
  return PROGRAMS.find(p => p.id === id) || { id, name: id };
}

function sortedEntries(sessionsMap) {
  return Object.entries(sessionsMap).sort(([, a], [, b]) => {
    const dateA = new Date(a.session.date);
    const dateB = new Date(b.session.date);
    if (dateA - dateB !== 0) return dateA - dateB;
    return (SHIFT_ORDER[a.session.shift] ?? 99) - (SHIFT_ORDER[b.session.shift] ?? 99);
  });
}

async function renderChartToJpeg(tasks, program, shift, date, monthlyDuties) {
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:920px;background:#fff;';
  container.innerHTML = buildChartHTML(tasks, program, shift, date, monthlyDuties);
  document.body.appendChild(container);
  try {
    const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
    return canvas.toDataURL('image/jpeg', 0.9);
  } finally {
    document.body.removeChild(container);
  }
}

export async function bulkPrint(sessionsMap) {
  if (!Object.keys(sessionsMap).length) return;

  const PRINT_CSS = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;font-size:11px;color:#000;background:#fff}
    .chart-page{padding:20px;page-break-after:always}
    .chart-page:last-child{page-break-after:auto}
    table{width:100%;border-collapse:collapse;margin-bottom:12px}
    td,th{border:1px solid #000;padding:5px 7px;vertical-align:top}
    th{background:#f3f4f6;font-weight:bold;text-align:left}
    @media print{@page{margin:10mm;size:A4 landscape}}
  `;

  const pages = sortedEntries(sessionsMap).map(([, entry]) => {
    const { session, tasks, monthlyDuties } = entry;
    const program = getProgramById(session.program_id);
    const date = new Date(session.date);
    return `<div class="chart-page">${buildChartHTML(tasks, program, session.shift, date, monthlyDuties)}</div>`;
  }).join('');

  const win = window.open('', '_blank', 'width=960,height=700');
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Bulk Shift Report</title><style>${PRINT_CSS}</style></head><body>${pages}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

export async function bulkDownloadZip(sessionsMap, zipName = 'ShiftReports', onProgress) {
  const entries = sortedEntries(sessionsMap);
  if (!entries.length) return;

  const zip = new JSZip();
  let completed = 0;

  for (const [, entry] of entries) {
    const { session, tasks, monthlyDuties } = entry;
    const program = getProgramById(session.program_id);
    const date = new Date(session.date);
    const dateLabel = format(date, 'yyyy-MM-dd');
    const shiftLabel = SHIFT_FILE_LABEL[session.shift] || session.shift;
    const fileName = `${program.name}_${shiftLabel}_${dateLabel}.jpg`;

    const jpeg = await renderChartToJpeg(tasks, program, session.shift, date, monthlyDuties);
    zip.file(fileName, jpeg.split(',')[1], { base64: true });

    completed++;
    onProgress?.(completed, entries.length);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${zipName}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

export function generateDateStrings(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);
  current.setHours(12, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(12, 0, 0, 0);
  while (current <= end) {
    dates.push(current.toDateString());
    current.setDate(current.getDate() + 1);
  }
  return dates;
}
