import { create } from 'zustand';
import type { SessionInfo } from '../types';

const ACTIVE_SESSION_KEY = 'ally-agent-room-active-session';

interface SessionStoreState {
  sessions: SessionInfo[];
  activeSessionId: string | null;
  setSessions: (sessions: SessionInfo[]) => void;
  setActive: (sessionId: string | null) => void;
  addSession: (session: SessionInfo) => void;
  removeSession: (sessionId: string) => void;
  renameSession: (sessionId: string, name: string) => void;
}

export const useSessionStore = create<SessionStoreState>((set) => ({
  sessions: [],
  activeSessionId: localStorage.getItem(ACTIVE_SESSION_KEY),

  setSessions: (sessions: SessionInfo[]) => {
    set((prev) => {
      // If the stored active session still exists, keep it. Otherwise pick the first.
      const activeStillExists = prev.activeSessionId && sessions.some(s => s.id === prev.activeSessionId);
      const newActive = activeStillExists
        ? prev.activeSessionId
        : (sessions.length > 0 ? sessions[0].id : null);
      if (newActive) {
        localStorage.setItem(ACTIVE_SESSION_KEY, newActive);
      }
      return { sessions, activeSessionId: newActive };
    });
  },

  setActive: (sessionId: string | null) => {
    if (sessionId) {
      localStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
    } else {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
    set({ activeSessionId: sessionId });
  },

  addSession: (session: SessionInfo) => {
    set((prev) => ({
      sessions: [...prev.sessions, session],
    }));
  },

  removeSession: (sessionId: string) => {
    set((prev) => ({
      sessions: prev.sessions.filter((s) => s.id !== sessionId),
    }));
  },

  renameSession: (sessionId: string, name: string) => {
    set((prev) => ({
      sessions: prev.sessions.map((s) =>
        s.id === sessionId ? { ...s, name } : s
      ),
    }));
  },
}));
