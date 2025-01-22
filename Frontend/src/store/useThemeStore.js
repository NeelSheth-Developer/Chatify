import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: "forest",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "theme",
    }
  )
);