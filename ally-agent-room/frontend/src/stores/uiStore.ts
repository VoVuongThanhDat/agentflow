import { create } from 'zustand';

interface UIStoreState {
  sidebarOpen: boolean;
  activePanel: 'room' | 'dashboard' | 'cost' | 'diff' | 'timeline';
  notificationsEnabled: boolean;
  toggleSidebar: () => void;
  setPanel: (panel: UIStoreState['activePanel']) => void;
  setNotifications: (enabled: boolean) => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  sidebarOpen: true,
  activePanel: 'room',
  notificationsEnabled: true,

  toggleSidebar: () => {
    set((prev) => ({ sidebarOpen: !prev.sidebarOpen }));
  },

  setPanel: (panel: UIStoreState['activePanel']) => {
    set({ activePanel: panel });
  },

  setNotifications: (enabled: boolean) => {
    set({ notificationsEnabled: enabled });
  },
}));
