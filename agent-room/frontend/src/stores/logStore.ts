import { create } from 'zustand';

export interface LogEntry {
  id: string;
  timestamp: string;
  type: string;       // 'tool_use' | 'thinking' | 'state_change' | 'error' | 'cost' | 'chat' | 'system'
  agent?: string;
  content: string;
}

interface LogStoreState {
  logs: LogEntry[];
  addLog: (entry: LogEntry) => void;
  clearLogs: () => void;
}

const MAX_LOGS = 500;

export const useLogStore = create<LogStoreState>((set) => ({
  logs: [],
  addLog: (entry) =>
    set((prev) => ({
      logs: [...prev.logs.slice(-(MAX_LOGS - 1)), entry],
    })),
  clearLogs: () => set({ logs: [] }),
}));
