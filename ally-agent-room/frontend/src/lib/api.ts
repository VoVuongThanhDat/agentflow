import type {
  AgentId,
  AgentInfo,
  AgentState,
  BeadsTask,
  DiffEntry,
  SessionInfo,
  TimelineEntry,
  TokenUsage,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

// Sessions
export const createSession = (name?: string) =>
  request<SessionInfo>('/api/sessions', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });

export const getSessions = () => request<SessionInfo[]>('/api/sessions');

export const deleteSession = (id: string) =>
  request(`/api/sessions/${id}`, { method: 'DELETE' });

export const renameSession = (id: string, name: string) =>
  request(`/api/sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });

export const startAgents = (sessionId: string, agents: AgentId[]) =>
  request(`/api/sessions/${sessionId}/start`, {
    method: 'POST',
    body: JSON.stringify({ agents }),
  });

export type HistoryMessage = {
  role: 'user' | 'assistant' | 'tool' | 'thinking' | 'system' | 'diff';
  content: string;
  tool?: string;
  timestamp?: string;
};

export const getSessionHistory = (sessionId: string) =>
  request<{ messages: HistoryMessage[]; claude_session_id?: string }>(
    `/api/sessions/${sessionId}/history`,
  );

// Chat
export const sendChat = (sessionId: string, message: string) =>
  request<{ status: string; claude_session_id: string }>(
    '/api/chat',
    {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, message }),
    },
  );

export const respondPermission = (requestId: string, approved: boolean, alwaysAllow = false) =>
  request(`/api/chat/permission/${requestId}`, {
    method: 'POST',
    body: JSON.stringify({ approved, always_allow: alwaysAllow }),
  });

// Agents
export const getAgents = () => request<AgentInfo[]>('/api/agents');

export const getAgentStates = (sessionId: string) =>
  request<Record<AgentId, { state: AgentState; detail?: string }>>(
    `/api/agents/${sessionId}/states`,
  );

// Tasks
export const getTasks = (sessionId: string) =>
  request<{ tasks: BeadsTask[]; by_status: Record<string, BeadsTask[]> }>(
    `/api/tasks/${sessionId}`,
  );

export const refreshTasks = (sessionId: string) =>
  request(`/api/tasks/${sessionId}/refresh`, { method: 'POST' });

// Costs
export const getCosts = (sessionId: string) =>
  request<Record<AgentId, { tokens: TokenUsage; cost: number }>>(
    `/api/costs/${sessionId}`,
  );

// Diffs
export const getDiffs = (sessionId: string) =>
  request<{ diffs: DiffEntry[] }>(`/api/diffs/${sessionId}`);

// Timeline
export const getTimeline = (sessionId: string, agents?: AgentId[]) => {
  const params = agents ? `?agents=${agents.join(',')}` : '';
  return request<{ events: TimelineEntry[] }>(`/api/timeline/${sessionId}${params}`);
};
