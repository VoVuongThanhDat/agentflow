import { useState, useEffect } from 'react';
import type { AgentId, TokenUsage } from '../types';
import { getCosts } from '../lib/api';
import { createWSConnection } from '../lib/ws';
import { useSessionStore } from '../stores/sessionStore';

export type AgentCost = {
  agent: AgentId;
  tokens: TokenUsage;
  cost: number;
};

export type CostTimePoint = {
  timestamp: string;
  totalCost: number;
};

interface CostTrackerState {
  costs: Record<AgentId, AgentCost>;
  totalCost: number;
  timeSeries: CostTimePoint[];
}

const ALL_AGENTS: AgentId[] = ['ba', 'dev-lead', 'dev-be', 'dev-fe', 'tester', 'devops'];

function emptyAgentCosts(): Record<AgentId, AgentCost> {
  const record = {} as Record<AgentId, AgentCost>;
  for (const agent of ALL_AGENTS) {
    record[agent] = { agent, tokens: { input_tokens: 0, output_tokens: 0 }, cost: 0 };
  }
  return record;
}

export function useCostTracker(): CostTrackerState {
  const activeSessionId = useSessionStore((s) => s.activeSessionId);
  const [costs, setCosts] = useState<Record<AgentId, AgentCost>>(emptyAgentCosts());
  const [timeSeries, setTimeSeries] = useState<CostTimePoint[]>([]);

  // Fetch initial costs
  useEffect(() => {
    if (!activeSessionId) {
      setCosts(emptyAgentCosts());
      setTimeSeries([]);
      return;
    }

    getCosts(activeSessionId).then((data) => {
      const updated = emptyAgentCosts();
      for (const [agentId, entry] of Object.entries(data)) {
        const agent = agentId as AgentId;
        updated[agent] = { agent, tokens: entry.tokens, cost: entry.cost };
      }
      setCosts(updated);
    }).catch(() => {
      // Leave as empty state on fetch failure
    });
  }, [activeSessionId]);

  // Subscribe to cost_update WebSocket events
  useEffect(() => {
    if (!activeSessionId) return;

    const conn = createWSConnection(activeSessionId);

    const unsub = conn.onEvent((event) => {
      if (event.type === 'cost_update') {
        const { agent, tokens, cost } = event;

        setCosts((prev) => {
          const prevAgent = prev[agent];
          const updated = {
            ...prev,
            [agent]: {
              agent,
              tokens: {
                input_tokens: prevAgent.tokens.input_tokens + tokens.input_tokens,
                output_tokens: prevAgent.tokens.output_tokens + tokens.output_tokens,
              },
              cost: prevAgent.cost + cost,
            },
          };
          return updated;
        });

        setTimeSeries((prev) => {
          const prevTotal = prev.length > 0 ? prev[prev.length - 1].totalCost : 0;
          return [
            ...prev,
            {
              timestamp: new Date().toISOString(),
              totalCost: prevTotal + cost,
            },
          ];
        });
      }
    });

    return () => {
      unsub();
      conn.close();
    };
  }, [activeSessionId]);

  const totalCost = Object.values(costs).reduce((sum, entry) => sum + entry.cost, 0);

  return { costs, totalCost, timeSeries };
}
