import { create } from 'zustand';
import type { AgentId, AgentState } from '../types';

interface AgentEntry {
  state: AgentState;
  detail?: string;
}

interface AgentStoreState {
  agents: Record<AgentId, AgentEntry>;
  setState: (agentId: AgentId, state: AgentState, detail?: string) => void;
  getAgent: (agentId: AgentId) => AgentEntry;
}

const ALL_AGENT_IDS: AgentId[] = ['ba', 'dev-lead', 'dev-be', 'dev-fe', 'tester', 'devops'];

const initialAgents: Record<AgentId, AgentEntry> = ALL_AGENT_IDS.reduce(
  (acc, id) => {
    acc[id] = { state: 'idle' };
    return acc;
  },
  {} as Record<AgentId, AgentEntry>
);

export const useAgentStore = create<AgentStoreState>((set, get) => ({
  agents: initialAgents,

  setState: (agentId: AgentId, state: AgentState, detail?: string) => {
    set((prev) => ({
      agents: {
        ...prev.agents,
        [agentId]: { state, detail },
      },
    }));
  },

  getAgent: (agentId: AgentId): AgentEntry => {
    return get().agents[agentId] ?? { state: 'idle' };
  },
}));
