import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      selectedShift: 'day',

      login: (user) => {
        const now = new Date();
        const hour = now.getHours();
        const shift = hour >= 7 && hour < 15 ? 'day' : hour >= 15 && hour < 23 ? 'evening' : 'night';
        set({ user, isAuthenticated: true, selectedShift: shift });
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      setShift: (shift) => set({ selectedShift: shift }),
    }),
    { name: 'milieu-auth' }
  )
);
