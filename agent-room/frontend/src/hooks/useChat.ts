import { useCallback, useState } from 'react'
import { useChatStore } from '../stores/chatStore'
import { useSessionStore } from '../stores/sessionStore'
import { sendChat, respondPermission } from '../lib/api'

export function useChat() {
  const activeSessionId = useSessionStore(s => s.activeSessionId)
  const { addMessage, resolvePermission } = useChatStore()
  const messages = useChatStore(s => s.messages)
  const activeAgent = useChatStore(s => s.activeAgent)
  const permissions = useChatStore(s => s.pendingPermissions)
  const [claudeSessionId, setClaudeSessionId] = useState<string | null>(null)

  const sendMessage = useCallback(async (content: string) => {
    if (!activeSessionId) return

    // Add user message to store immediately (optimistic)
    addMessage({
      id: crypto.randomUUID(),
      from: 'user',
      to: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      streaming: false,
    })

    // Send to single Claude Code session
    const result = await sendChat(activeSessionId, content)
    if (result.claude_session_id) {
      setClaudeSessionId(result.claude_session_id)
    }
  }, [activeSessionId, addMessage])

  const respondToPermission = useCallback(async (requestId: string, approved: boolean, alwaysAllow: boolean) => {
    await respondPermission(requestId, approved, alwaysAllow)
    resolvePermission(requestId)
  }, [resolvePermission])

  return { messages, sendMessage, activeAgent, permissions, respondToPermission, claudeSessionId }
}
