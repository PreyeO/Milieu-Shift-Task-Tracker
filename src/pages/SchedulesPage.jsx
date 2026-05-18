import { useState } from "react";
import { useTaskStore } from "../store/taskStore";
import { PROGRAMS, getProgramById } from "../data/programs";
import { TASK_TEMPLATES } from "../data/taskTemplates";
import { formatTimeSlot } from "../utils/timeUtils";
import {
  CalendarRange,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Check,
  X,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

const SHIFTS = [
  { key: "day", label: "Morning Shift (7 AM – 3 PM)" },
  { key: "evening", label: "Day Shift (3 PM – 11 PM)" },
  { key: "night", label: "Grave yard Shift (11 PM – 7 AM)" },
];

export default function SchedulesPage() {
  const { addTemplateTask, updateTemplateTask, deleteTemplateTask } =
    useTaskStore();

  const [selectedProgram, setSelectedProgram] = useState(
    PROGRAMS[0]?.id || "hudson",
  );
  const [selectedShift, setSelectedShift] = useState("day");

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null); // null = Creating, object = Editing
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("07:30");

  // Always use the fresh imported TASK_TEMPLATES for schedules management
  const rawTasks = TASK_TEMPLATES[selectedProgram]?.[selectedShift] || [];

  // Sort tasks chronologically by start time
  const sortedTasks = [...rawTasks].sort((a, b) =>
    a.startTime.localeCompare(b.startTime),
  );

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setStartTime(
      selectedShift === "day"
        ? "07:00"
        : selectedShift === "evening"
          ? "15:00"
          : "23:00",
    );
    setEndTime(
      selectedShift === "day"
        ? "07:30"
        : selectedShift === "evening"
          ? "15:30"
          : "23:30",
    );
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setStartTime(task.startTime);
    setEndTime(task.endTime);
    setIsModalOpen(true);
  };

  const handleSaveTask = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    const taskData = { title, description, startTime, endTime };

    if (editingTask) {
      updateTemplateTask(
        selectedProgram,
        selectedShift,
        editingTask.id,
        taskData,
      );
      toast.success("Routine task updated!");
    } else {
      addTemplateTask(selectedProgram, selectedShift, taskData);
      toast.success("New routine task added!");
    }

    setIsModalOpen(false);
  };

  const handleDeleteTask = (taskId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this task? This action cannot be undone.",
      )
    ) {
      deleteTemplateTask(selectedProgram, selectedShift, taskId);
      toast.success("Routine task deleted.");
    }
  };

  const activeProgram = getProgramById(selectedProgram);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-milieuNavy flex items-center gap-2">
            <CalendarRange size={24} className="text-milieuBlue" />
            Schedules & 30 Mins Tasks
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage recurring routines and customize live shifts
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={16} />
          <span>Add Task</span>
        </button>
      </div>

      {/* Program, Shift, and Mode Selector Panel */}
      <div className="glass-card p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Residential Home Selector */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            Residential Home
          </label>
          <select
            className="input-field py-1.5 px-2.5 text-xs text-slate-800"
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
          >
            {PROGRAMS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.shortName})
              </option>
            ))}
          </select>
        </div>

        {/* Shift Selector */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            Shift Schedule
          </label>
          <select
            className="input-field py-1.5 px-2.5 text-xs text-slate-800"
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
          >
            {SHIFTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label.split(" (")[0]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Checklist Panel */}
      <div className="glass-card p-3 sm:p-6 space-y-3 sm:space-y-4">
        <div className="flex items-center gap-3 justify-between flex-wrap">
          <h2 className="text-slate-800 font-bold text-base sm:text-lg flex items-center gap-2">
            <FileText size={18} className="text-slate-500" />
            30 Mins Tasks ({sortedTasks.length})
          </h2>
        </div>

        {/* Tasks List */}
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <CalendarRange size={36} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-800 font-medium text-sm">
              No tasks scheduled
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Click the "Add Task" button at the top to configure duties.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-4 p-3 sm:p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:shadow-sm transition-all"
              >
                {/* Time Indicator & Mobile Actions Header */}
                <div className="flex items-center justify-between sm:block flex-shrink-0 w-full sm:w-auto">
                  <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-milieuBlue text-xs font-semibold px-2.5 py-1 rounded-lg">
                    <Clock size={12} />
                    <span>
                      {formatTimeSlot(task.startTime)} –{" "}
                      {formatTimeSlot(task.endTime)}
                    </span>
                  </div>
                  {/* Mobile-only CRUD Actions */}
                  <div className="flex items-center gap-1 sm:hidden">
                    <button
                      onClick={() => handleOpenEditModal(task)}
                      className="p-1.5 text-slate-400 hover:text-milieuBlue hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Task"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 text-slate-400 hover:text-milieuCoral hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Task Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-slate-800 font-bold text-sm leading-snug">
                    {task.title}
                  </h3>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    {task.description}
                  </p>
                </div>

                {/* CRUD Controls (Desktop-only) */}
                <div className="hidden sm:flex items-center gap-1 flex-shrink-0 self-center">
                  <button
                    onClick={() => handleOpenEditModal(task)}
                    className="p-1.5 text-slate-400 hover:text-milieuBlue hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Task"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-milieuCoral hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-slate-800 font-bold text-base flex items-center gap-2">
                <CalendarRange size={18} className="text-milieuBlue" />
                {editingTask ? "Edit Schedule Task" : "Add New Task"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1.5">
                  Task Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Med Administration, Dinner Cleanup"
                  className="input-field w-full text-slate-800"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Time Interval */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 text-xs font-semibold mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    className="input-field w-full text-slate-800"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-xs font-semibold mb-1.5">
                    End Time
                  </label>
                  <input
                    type="time"
                    className="input-field w-full text-slate-800"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1.5">
                  Instruction & Duties
                </label>
                <textarea
                  placeholder="Describe clear instructions or compliance criteria for floor staff to complete this duty."
                  className="input-field w-full h-24 text-slate-800 py-2 resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 mt-5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary py-1.5 px-4 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-1.5 px-5 text-sm flex items-center gap-1.5"
                >
                  <Check size={15} />
                  <span>Save Task</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
