import { create } from 'zustand';
import type { ChatMessage, PermissionRequest, AgentId } from '../types';

interface ChatStoreState {
  messages: ChatMessage[];
  activeAgent: AgentId | null;
  pendingPermissions: PermissionRequest[];
  addMessage: (msg: ChatMessage) => void;
  setActiveAgent: (agentId: AgentId | null) => void;
  addPermission: (req: PermissionRequest) => void;
  resolvePermission: (requestId: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStoreState>((set) => ({
  messages: [],
  activeAgent: null,
  pendingPermissions: [],

  addMessage: (msg: ChatMessage) => {
    set((prev) => ({
      messages: [...prev.messages, msg],
    }));
  },

  setActiveAgent: (agentId: AgentId | null) => {
    set({ activeAgent: agentId });
  },

  addPermission: (req: PermissionRequest) => {
    set((prev) => ({
      pendingPermissions: [...prev.pendingPermissions, req],
    }));
  },

  resolvePermission: (requestId: string) => {
    set((prev) => ({
      pendingPermissions: prev.pendingPermissions.filter((r) => r.id !== requestId),
    }));
  },

  clearMessages: () => {
    set({ messages: [] });
  },
}));
