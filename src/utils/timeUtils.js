import { format, addMinutes, isAfter, isBefore, parseISO } from 'date-fns';

export const formatTime = (date) => format(new Date(date), 'h:mm a');
export const formatDate = (date) => format(new Date(date), 'MMM d, yyyy');
export const formatDateTime = (date) => format(new Date(date), 'MMM d, h:mm a');
export const formatTimeOnly = (date) => format(new Date(date), 'HH:mm');

export const formatTimeSlot = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return format(d, 'h:mm a');
};

export const getShiftForTime = (hour) => {
  if (hour >= 7 && hour < 15) return 'day';
  if (hour >= 15 && hour < 23) return 'evening';
  return 'night';
};

export const getShiftLabel = (shift) => {
  const labels = { day: 'Day Shift (7:00 AM – 3:00 PM)', evening: 'Evening Shift (3:00 PM – 11:00 PM)', night: 'Graveyard Shift (11:00 PM – 7:00 AM)' };
  return labels[shift] || shift;
};

export const getShiftDateString = () => {
  const d = new Date();
  if (d.getHours() < 7) {
    // Night shift after midnight belongs to yesterday's date string
    d.setDate(d.getDate() - 1);
  }
  return d.toDateString();
};

export const getShiftDateISO = () => {
  const d = new Date();
  if (d.getHours() < 7) {
    d.setDate(d.getDate() - 1);
  }
  return d.toISOString().split('T')[0];
};

export const convertISOToShiftDateString = (isoString) => {
  return new Date(isoString + 'T12:00:00').toDateString();
};

export const parseSlotTime = (timeStr, baseDate = new Date()) => {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date(baseDate);
  d.setHours(h, m, 0, 0);
  
  // Handle midnight crossing for shift schedules
  const currentHour = baseDate.getHours();
  const diff = h - currentHour;
  if (diff > 12) {
    d.setDate(d.getDate() - 1); // Slot was actually yesterday (e.g. task at 23:00, current time is 01:00)
  } else if (diff < -12) {
    d.setDate(d.getDate() + 1); // Slot is actually tomorrow (e.g. task at 01:00, current time is 23:00)
  }
  
  return d;
};

export const getTaskStatus = (task, now = new Date()) => {
  if (task.completedAt) {
    const windowEnd = parseSlotTime(task.endTime, new Date(task.completedAt));
    return isAfter(new Date(task.completedAt), windowEnd) ? 'late' : 'completed';
  }
  const windowEnd = parseSlotTime(task.endTime, now);
  if (isAfter(now, windowEnd)) return 'missed';
  const windowStart = parseSlotTime(task.startTime, now);
  if (isAfter(now, windowStart)) return 'pending';
  return 'upcoming';
};

export const getSecondsUntilEnd = (endTime) => {
  const now = new Date();
  const end = parseSlotTime(endTime, now);
  return Math.max(0, Math.floor((end - now) / 1000));
};

export const getWindowProgress = (startTime, endTime) => {
  const now = new Date();
  const start = parseSlotTime(startTime, now).getTime();
  const end = parseSlotTime(endTime, now).getTime();
  const nowTime = now.getTime();
  if (nowTime <= start) return 0;
  if (nowTime >= end) return 100;
  return Math.round(((nowTime - start) / (end - start)) * 100);
};
