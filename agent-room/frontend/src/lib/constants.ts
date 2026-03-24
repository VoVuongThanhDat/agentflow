import type { AgentId } from '../types'

export const AGENT_COLORS: Record<AgentId, string> = {
  'ba': '#3B82F6',
  'dev-lead': '#8B5CF6',
  'dev-be': '#10B981',
  'dev-fe': '#06B6D4',
  'tester': '#F59E0B',
  'devops': '#EF4444',
}

export const AGENT_NAMES: Record<AgentId, string> = {
  'ba': 'BA',
  'dev-lead': 'Dev Lead',
  'dev-be': 'Dev BE',
  'dev-fe': 'Dev FE',
  'tester': 'Tester',
  'devops': 'DevOps',
}

export const AGENT_ICONS: Record<AgentId, string> = {
  'ba': 'FileText',
  'dev-lead': 'GitBranch',
  'dev-be': 'Code2',
  'dev-fe': 'Palette',
  'tester': 'TestTube',
  'devops': 'Server',
}

export const PRIORITY_COLORS: Record<string, string> = {
  'P1': 'bg-red-600',
  'P2': 'bg-orange-500',
  'P3': 'bg-yellow-500',
  'P4': 'bg-gray-500',
}

export const EVENT_TYPE_ICONS: Record<string, string> = {
  'chat': 'MSG',
  'tool_use': 'TOOL',
  'task_claim': 'CLAIM',
  'task_complete': 'DONE',
  'error': 'ERR',
  'state_change': 'STATE',
}

export const WS_RECONNECT_MAX_DELAY = 10000
export const TASK_REFRESH_INTERVAL = 30000
export const SPEECH_BUBBLE_DURATION = 5000
export const TOAST_DURATION = 5000
