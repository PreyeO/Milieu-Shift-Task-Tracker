export const requestNotificationPermission = () => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
};

export const playChime = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    const playTone = (frequency, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, startTime);
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // Two-tone chime: A5 then E6
    playTone(880, ctx.currentTime, 0.6);
    playTone(1320, ctx.currentTime + 0.35, 0.8);
  } catch {
    // Audio unavailable — silent fail
  }
};

export const showTaskNotification = (taskTitle) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  new Notification('⏰ Task Reminder — Milieu', {
    body: `"${taskTitle}" is halfway through its window. Sign off if complete!`,
    icon: '/favicon.png',
  });
};
