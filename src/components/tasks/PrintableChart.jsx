import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { formatTimeSlot } from '../../utils/timeUtils';
import { TASK_TEMPLATES } from '../../data/taskTemplates';

export default function PrintableChart({ tasks, program, shift, date, monthlyDuties }) {
  const chartRef = useRef(null);

  const handleDownloadImage = async () => {
    if (!chartRef.current) return;
    
    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: 2, // Better resolution
        backgroundColor: '#ffffff',
      });
      
      const image = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.href = image;
      link.download = `${program?.name || 'Program'}_${shift}_${format(date, 'yyyy-MM-dd')}_Report.jpg`;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    }
  };

  const getDescription = (task) => {
    const shiftTemplates = TASK_TEMPLATES[program?.id]?.[shift] || [];
    const templateDesc = shiftTemplates.find(t => t.id === task.templateId)?.description;
    return templateDesc || task.description || '';
  };

  // Sort tasks by time, handling midnight-crossing for night shift
  const sortedTasks = [...tasks].sort((a, b) => {
    const toKey = (timeStr) => {
      const [h, m] = (timeStr || '00:00').split(':').map(Number);
      const mins = h * 60 + m;
      return shift === 'night' && h < 7 ? mins + 1440 : mins;
    };
    return toKey(a.startTime) - toKey(b.startTime);
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleDownloadImage}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Download size={15} />
          Download as Image
        </button>
      </div>

      <div className="overflow-x-auto bg-white p-6 shadow-sm rounded-lg border border-slate-200">
        <div ref={chartRef} className="min-w-[800px] p-8 bg-white text-black font-sans">
          
          <table className="w-full border-collapse border border-black mb-4">
            <tbody>
              <tr>
                <td className="border border-black p-2 font-bold w-1/5">
                  {shift === 'day' ? 'Day Shift – 7:00am–3:00pm' : shift === 'evening' ? 'Evening Shift – 3:00pm–11:00pm' : 'Graveyard Shift – 11:00pm–7:00am'}
                </td>
                <td className="border border-black p-2 w-1/5">
                  <span className="font-bold">Date:</span> {format(date, 'MMM dd, yyyy')}
                </td>
                <td className="border border-black p-2 font-bold w-1/5">
                  Program: {program?.name || 'N/A'}
                </td>
                <td className="border border-black p-2 w-1/5">
                  <span className="font-bold">Staff 1:</span>
                </td>
                <td className="border border-black p-2 w-1/5">
                  <span className="font-bold">Staff 2:</span>
                </td>
              </tr>
            </tbody>
          </table>

          <table className="w-full border-collapse border border-black text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-left font-bold w-32">Time</th>
                <th className="border border-black p-2 text-left font-bold">Activity</th>
                <th className="border border-black p-2 text-left font-bold w-48">Change and Rationale if changed</th>
                <th className="border border-black p-2 text-left font-bold w-24">Staff 1 Initial</th>
                <th className="border border-black p-2 text-left font-bold w-24">Staff 2 Initial</th>
              </tr>
            </thead>
            <tbody>
              {sortedTasks.map((task) => (
                <tr key={task.id}>
                  <td className="border border-black p-2 align-top font-bold text-xs whitespace-nowrap">
                    {formatTimeSlot(task.startTime)} – {formatTimeSlot(task.endTime)}
                  </td>
                  <td className="border border-black p-2 align-top text-xs whitespace-pre-wrap">
                    <span className="font-bold block mb-1">{task.title}</span>
                    {getDescription(task)}
                  </td>
                  <td className="border border-black p-2 align-top text-gray-600 italic text-xs">
                    {task.comment || ''}
                  </td>
                  {(() => {
                    const [s1, s2] = (task.completedBy || '').split('/');
                    const statusBadge = task.status === 'missed'
                      ? <span className="text-red-500 text-xs">MISSED</span>
                      : task.status === 'late'
                        ? <span className="text-orange-500 text-xs">LATE</span>
                        : null;
                    return (
                      <>
                        <td className="border border-black p-2 align-top text-center font-bold text-milieuBlue text-xs">
                          {s1 || statusBadge}
                        </td>
                        <td className="border border-black p-2 align-top text-center font-bold text-milieuBlue text-xs">
                          {s2 || ''}
                        </td>
                      </>
                    );
                  })()}
                </tr>
              ))}

              {/* End-of-shift section divider */}
              <tr className="bg-gray-100">
                <td colSpan={5} className="border border-black p-2 text-xs font-bold text-center tracking-wide uppercase">
                  End of Shift — Monthly Duties
                </td>
              </tr>

              {/* Monthly duty rows — pre-filled if staff submitted digitally */}
              {[
                { key: 'ofl',        label: 'Complete OFL for the month' },
                { key: 'drills',     label: 'Complete Emergency drills for the month' },
                { key: 'designated', label: 'Complete Designated duties for the month' },
              ].map((duty) => {
                const data = monthlyDuties?.[duty.key];
                const [s1, s2] = (data?.initials || '').split('/');
                return (
                  <tr key={duty.key}>
                    <td className="border border-black p-2 text-xs text-gray-400 italic text-center">—</td>
                    <td className="border border-black p-2 text-xs font-medium">{duty.label}</td>
                    <td className="border border-black p-2 text-xs text-center whitespace-nowrap font-medium">
                      {data
                        ? data.yes
                          ? '☑ Yes   ☐ No'
                          : '☐ Yes   ☑ No'
                        : '☐ Yes   ☐ No'}
                    </td>
                    <td className="border border-black p-2 text-xs text-center font-bold text-milieuBlue">
                      {s1 || <span className="text-gray-400 font-normal italic">Initial:</span>}
                    </td>
                    <td className="border border-black p-2 text-xs text-center font-bold text-milieuBlue">
                      {s2 || <span className="text-gray-400 font-normal italic">Initial:</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-8 text-xs text-center text-gray-500 italic">
            ***To be sent to Manager and Coordinator Prior to leaving for the day Via the Group Chat on the house cell phone
          </div>
        </div>
      </div>
    </div>
  );
}
