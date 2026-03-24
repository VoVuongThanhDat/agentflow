// Module-level WebSocket event emitter for panel hooks.
// useWebSocket publishes events here; panel hooks (useDiffs, useCostTracker, etc.)
// subscribe without needing their own WS connections.

import type { BeadsTask, DiffEntry, TimelineEntry, AgentId, TokenUsage } from '../types';

export type TaskUpdatePayload = { tasks: BeadsTask[] };

export type CostUpdatePayload = {
  agent: AgentId;
  tokens: TokenUsage;
  cost: number;
};

export type DiffEventPayload = DiffEntry;

export type TimelineEventPayload = TimelineEntry;

type Listener<T> = (payload: T) => void;

function createEmitter<T>() {
  const listeners = new Set<Listener<T>>();

  return {
    emit(payload: T) {
      listeners.forEach((fn) => fn(payload));
    },
    subscribe(fn: Listener<T>): () => void {
      listeners.add(fn);
      return () => { listeners.delete(fn); };
    },
  };
}

export const taskUpdateEmitter = createEmitter<TaskUpdatePayload>();
export const costUpdateEmitter = createEmitter<CostUpdatePayload>();
export const diffEventEmitter = createEmitter<DiffEventPayload>();
export const timelineEventEmitter = createEmitter<TimelineEventPayload>();
