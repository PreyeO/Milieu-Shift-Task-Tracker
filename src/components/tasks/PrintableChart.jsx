import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { formatTimeSlot } from '../../utils/timeUtils';
import { TASK_TEMPLATES } from '../../data/taskTemplates';

export default function PrintableChart({ tasks, program, shift, date }) {
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
    if (task.description) return task.description;
    const shiftTemplates = TASK_TEMPLATES[program?.id]?.[shift] || [];
    return shiftTemplates.find(t => t.id === task.templateId)?.description || '';
  };

  // Sort tasks by time
  const sortedTasks = [...tasks].sort((a, b) => {
    return (a.startTime || '').localeCompare(b.startTime || '');
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
                <td className="border border-black p-2 font-bold w-1/4">
                  {shift === 'day' ? '7:00am-3:00pm' : shift === 'evening' ? '3:00pm-11:00pm' : '11:00pm-7:00am'}
                </td>
                <td className="border border-black p-2 w-1/4">
                  <span className="font-bold">Date:</span> {format(date, 'MMM dd, yyyy')}
                </td>
                <td className="border border-black p-2 font-bold w-1/4">
                  Program: {program?.name || 'N/A'}
                </td>
                <td className="border border-black p-2 w-1/4">
                  <span className="font-bold">Staff 1:</span>
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
                <th className="border border-black p-2 text-left font-bold w-32">Initial of Staff</th>
              </tr>
            </thead>
            <tbody>
              {sortedTasks.map((task) => (
                <tr key={task.id}>
                  <td className="border border-black p-2 align-top font-bold text-xs whitespace-nowrap">
                    {formatTimeSlot(task.startTime)} - {formatTimeSlot(task.endTime)}
                  </td>
                  <td className="border border-black p-2 align-top text-xs whitespace-pre-wrap">
                    <span className="font-bold block mb-1">{task.title}</span>
                    {getDescription(task)}
                  </td>
                  <td className="border border-black p-2 align-top text-gray-600 italic text-xs">
                    {task.comment || ''}
                  </td>
                  <td className="border border-black p-2 align-top text-center font-bold text-milieuBlue">
                    {task.status === 'completed' && task.completedBy ? task.completedBy.substring(0, 2).toUpperCase() : ''}
                    {task.status === 'missed' ? <span className="text-red-500 text-xs">MISSED</span> : ''}
                    {task.status === 'late' ? <span className="text-orange-500 text-xs">LATE</span> : ''}
                  </td>
                </tr>
              ))}
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
