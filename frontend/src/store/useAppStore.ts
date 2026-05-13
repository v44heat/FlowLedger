// frontend/src/store/useAppStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface AppState {
  user: User | null;
  token: string | null;
  sidebarOpen: boolean;

  setAuth: (user: User, token: string) => void;
  logout: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      sidebarOpen: true,

      setAuth: (user, token) => {
        localStorage.setItem('fl_token', token);
        localStorage.setItem('fl_user', JSON.stringify(user));
        set({ user, token });
      },

      logout: () => {
        localStorage.removeItem('fl_token');
        localStorage.removeItem('fl_user');
        set({ user: null, token: null });
      },

      toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'fl-store',
      partialize: (s) => ({ user: s.user, token: s.token }),
    }
  )
);