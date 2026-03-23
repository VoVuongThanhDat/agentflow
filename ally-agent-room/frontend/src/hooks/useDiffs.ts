import { useEffect, useState } from 'react';
import { useSessionStore } from '../stores/sessionStore';
import { getDiffs } from '../lib/api';
import { diffEventEmitter } from '../lib/wsEvents';
import type { DiffEntry } from '../types';

export function useDiffs(): { diffs: DiffEntry[] } {
  const activeSessionId = useSessionStore((s) => s.activeSessionId);
  const [diffs, setDiffs] = useState<DiffEntry[]>([]);

  // Fetch initial diffs on mount / session change
  useEffect(() => {
    if (!activeSessionId) {
      setDiffs([]);
      return;
    }

    getDiffs(activeSessionId)
      .then((res) => setDiffs(res.diffs))
      .catch(() => setDiffs([]));
  }, [activeSessionId]);

  // Subscribe to diff events published by useWebSocket
  useEffect(() => {
    const unsub = diffEventEmitter.subscribe((entry) => {
      setDiffs((prev) => [entry, ...prev]);
    });
    return unsub;
  }, []);

  return { diffs };
}
