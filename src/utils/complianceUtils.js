export const calculateCompliance = (tasks) => {
  if (!tasks.length) return 0;
  const done = tasks.filter(t => t.status === 'completed' || t.status === 'late');
  return Math.round((done.length / tasks.length) * 100);
};

export const calculateOnTimeRate = (tasks) => {
  if (!tasks.length) return 0;
  const completed = tasks.filter(t => t.status === 'completed');
  return Math.round((completed.length / tasks.length) * 100);
};

export const detectBulkSubmit = (tasks) => {
  const completedTimes = tasks
    .filter(t => t.completedAt)
    .map(t => new Date(t.completedAt).getTime())
    .sort((a, b) => a - b);
  if (completedTimes.length < 3) return false;
  for (let i = 2; i < completedTimes.length; i++) {
    const window = completedTimes[i] - completedTimes[i - 2];
    if (window < 5 * 60 * 1000) return true;
  }
  return false;
};

export const getComplianceColor = (pct) => {
  if (pct >= 90) return 'emerald';
  if (pct >= 70) return 'amber';
  return 'red';
};

export const getComplianceLabel = (pct) => {
  if (pct >= 90) return 'Excellent';
  if (pct >= 70) return 'Needs Attention';
  return 'Critical';
};

export const groupTasksByShift = (tasks) => {
  return {
    day: tasks.filter(t => {
      const h = parseInt(t.startTime.split(':')[0]);
      return h >= 7 && h < 15;
    }),
    evening: tasks.filter(t => {
      const h = parseInt(t.startTime.split(':')[0]);
      return h >= 15 && h < 23;
    }),
    night: tasks.filter(t => {
      const h = parseInt(t.startTime.split(':')[0]);
      return h >= 23 || h < 7;
    }),
  };
};
