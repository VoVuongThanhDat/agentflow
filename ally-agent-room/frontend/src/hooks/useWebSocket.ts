import { useEffect, useRef } from 'react';
import { useSessionStore } from '../stores/sessionStore';
import { useAgentStore } from '../stores/agentStore';
import { useChatStore } from '../stores/chatStore';
import { useLogStore } from '../stores/logStore';
import { createWSConnection, type WSConnection } from '../lib/ws';
import { addToast } from '../components/layout/NotificationToast';
import { sendNotification } from '../lib/notifications';
import {
  taskUpdateEmitter,
  costUpdateEmitter,
  diffEventEmitter,
  timelineEventEmitter,
} from '../lib/wsEvents';
import type { ChatMessage, AgentId } from '../types';

export function useWebSocket() {
  const activeSessionId = useSessionStore((s) => s.activeSessionId);
  const connRef = useRef<WSConnection | null>(null);

  useEffect(() => {
    if (!activeSessionId) return;

    const conn = createWSConnection(activeSessionId);
    connRef.current = conn;

    const unsub = conn.onEvent((event) => {
      const addLog = useLogStore.getState().addLog;
      const ts = new Date().toISOString();
      const logId = `${Date.now()}-${Math.random()}`;

      switch (event.type) {
        case 'agent_state_change':
          useAgentStore.getState().setState(event.agent, event.state, event.detail);
          addLog({ id: logId, timestamp: ts, type: 'state_change', agent: event.agent, content: `${event.agent} → ${event.state}${event.detail ? ': ' + event.detail : ''}` });
          break;

        case 'chat_message': {
          if (event.from === 'user') break;
          const msg: ChatMessage = {
            id: `${Date.now()}-${Math.random()}`,
            from: event.from,
            to: event.to,
            content: event.content,
            timestamp: new Date().toISOString(),
            streaming: event.streaming,
          };
          useChatStore.getState().addMessage(msg);
          useChatStore.getState().setActiveAgent(event.from as AgentId);
          addLog({ id: logId, timestamp: ts, type: 'chat', agent: event.from, content: event.content?.slice(0, 150) || '' });
          break;
        }

        case 'tool_use':
          addLog({ id: logId, timestamp: ts, type: 'tool_use', agent: event.agent, content: `🔧 ${event.tool} ${JSON.stringify(event.input || {}).slice(0, 100)}` });
          break;

        case 'permission_request':
          useChatStore.getState().addPermission({
            id: event.id,
            agent: event.agent,
            tool: event.tool,
            input: event.input,
          });
          addLog({ id: logId, timestamp: ts, type: 'permission', agent: event.agent, content: `🔐 Permission: ${event.tool}` });
          break;

        case 'task_update':
          taskUpdateEmitter.emit({ tasks: event.tasks });
          break;

        case 'cost_update':
          costUpdateEmitter.emit({
            agent: event.agent,
            tokens: event.tokens,
            cost: event.cost,
          });
          addLog({ id: logId, timestamp: ts, type: 'cost', agent: event.agent, content: `💰 Cost: $${event.cost?.toFixed(4) || '0'}` });
          break;

        case 'diff_event':
          diffEventEmitter.emit({
            id: `${Date.now()}-${Math.random()}`,
            agent: event.agent,
            file: event.file,
            diff: event.diff,
            timestamp: new Date().toISOString(),
          });
          addLog({ id: logId, timestamp: ts, type: 'diff', agent: event.agent, content: `📝 File changed: ${event.file}` });
          break;

        case 'timeline_event':
          timelineEventEmitter.emit({
            id: `${Date.now()}-${Math.random()}`,
            agent: event.agent,
            action: event.action,
            type: 'tool_use',
            detail: event.detail,
            timestamp: event.timestamp,
          });
          addLog({ id: logId, timestamp: ts, type: 'timeline', agent: event.agent, content: event.action || '' });
          break;

        case 'session_update':
          useSessionStore.getState().setSessions(event.sessions);
          break;

        case 'error':
          if (event.agent) {
            useAgentStore.getState().setState(event.agent, 'error', event.message);
          }
          addToast({ title: 'Agent Error', body: event.message, level: 'error' });
          addLog({ id: logId, timestamp: ts, type: 'error', agent: event.agent, content: `❌ ${event.message}` });
          break;

        case 'notification':
          addToast({ title: event.title, body: event.body, level: event.level });
          sendNotification(event.title, event.body);
          break;
      }
    });

    return () => {
      unsub();
      conn.close();
      connRef.current = null;
    };
  }, [activeSessionId]);

  return connRef;
}
