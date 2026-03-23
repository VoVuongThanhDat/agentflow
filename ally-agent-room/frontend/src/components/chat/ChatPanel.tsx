import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useChatStore } from '../../stores/chatStore'
import { useSessionStore } from '../../stores/sessionStore'
import { useLogStore } from '../../stores/logStore'
import { useChat } from '../../hooks/useChat'
import { getSessionHistory } from '../../lib/api'
import {
  costUpdateEmitter,
  diffEventEmitter,
  timelineEventEmitter,
} from '../../lib/wsEvents'
import ChatMessage from './ChatMessage'
import PermissionPrompt from './PermissionPrompt'
import { AGENT_NAMES, AGENT_COLORS } from '../../lib/constants'
import type { AgentId, ChatMessage as ChatMessageType } from '../../types'

const AGENTS: { id: AgentId; name: string; color: string }[] = [
  { id: 'ba', name: AGENT_NAMES.ba, color: AGENT_COLORS.ba },
  { id: 'dev-lead', name: AGENT_NAMES['dev-lead'], color: AGENT_COLORS['dev-lead'] },
  { id: 'dev-be', name: AGENT_NAMES['dev-be'], color: AGENT_COLORS['dev-be'] },
  { id: 'dev-fe', name: AGENT_NAMES['dev-fe'], color: AGENT_COLORS['dev-fe'] },
  { id: 'tester', name: AGENT_NAMES.tester, color: AGENT_COLORS.tester },
  { id: 'devops', name: AGENT_NAMES.devops, color: AGENT_COLORS.devops },
]

const TYPE_COLORS: Record<string, string> = {
  tool_use: 'text-blue-400',
  thinking: 'text-purple-400',
  state_change: 'text-yellow-400',
  error: 'text-red-400',
  cost: 'text-green-400',
  chat: 'text-gray-400',
  diff: 'text-cyan-400',
  permission: 'text-orange-400',
  timeline: 'text-gray-500',
}

function LogsPanel() {
  const logs = useLogStore(s => s.logs)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <div className='border-b border-gray-700 max-h-56 overflow-y-auto bg-gray-950 p-2'>
      <div className='flex items-center justify-between mb-1'>
        <span className='text-xs text-gray-500 font-medium'>Session Logs ({logs.length})</span>
        <button
          onClick={() => useLogStore.getState().clearLogs()}
          className='text-xs text-gray-600 hover:text-gray-400'
        >
          Clear
        </button>
      </div>
      {logs.length === 0 ? (
        <div className='text-xs text-gray-600 italic'>No logs yet — send a message to start</div>
      ) : (
        logs.map(log => (
          <div key={log.id} className='text-xs py-1.5 border-b border-gray-800 font-mono'>
            <div className='flex items-center gap-2 mb-0.5'>
              <span className='text-gray-600'>{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className={`px-1 rounded ${TYPE_COLORS[log.type] || 'text-gray-500'} bg-gray-900`}>
                {log.type}
              </span>
              {log.agent && (
                <span
                  className='px-1.5 rounded-full text-white'
                  style={{ backgroundColor: (AGENT_COLORS[log.agent as keyof typeof AGENT_COLORS] || '#888') + '40', color: AGENT_COLORS[log.agent as keyof typeof AGENT_COLORS] || '#888' }}
                >
                  {log.agent}
                </span>
              )}
            </div>
            <div className='text-gray-400 pl-1 whitespace-pre-wrap break-words leading-relaxed'>
              {log.content}
            </div>
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  )
}

export default function ChatPanel() {
  const messages = useChatStore(s => s.messages)
  const activeAgent = useChatStore(s => s.activeAgent)
  const permissions = useChatStore(s => s.pendingPermissions)
  const { addMessage, clearMessages } = useChatStore()
  const activeSessionId = useSessionStore(s => s.activeSessionId)
  const { sendMessage, claudeSessionId } = useChat()
  const [input, setInput] = useState('')
  const [showMention, setShowMention] = useState(false)
  const [mentionFilter, setMentionFilter] = useState('')
  const [mentionIndex, setMentionIndex] = useState(0)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const lastLoadedSession = useRef<string | null>(null)

  // Load conversation history when session changes
  useEffect(() => {
    if (!activeSessionId || activeSessionId === lastLoadedSession.current) return
    lastLoadedSession.current = activeSessionId
    setLoadingHistory(true)
    clearMessages()
    useLogStore.getState().clearLogs()

    getSessionHistory(activeSessionId)
      .then(({ messages: history }) => {
        const addLog = useLogStore.getState().addLog
        history.forEach((msg) => {
          const ts = msg.timestamp || new Date().toISOString()
          const id = crypto.randomUUID()

          // Add to chat messages (user + assistant text)
          if (msg.role === 'user' || msg.role === 'assistant') {
            const chatMsg: ChatMessageType = {
              id,
              from: msg.role === 'user' ? 'user' : 'ba',
              to: msg.role === 'user' ? 'assistant' : 'user',
              content: msg.content,
              timestamp: ts,
              streaming: false,
            }
            addMessage(chatMsg)
          }

          // Add ALL entries to logs + emit to panel stores
          if (msg.role === 'tool') {
            addLog({ id, timestamp: ts, type: 'tool_use', content: msg.content })
            // Emit to timeline
            timelineEventEmitter.emit({
              id, agent: 'ba', action: msg.content, type: 'tool_use', detail: '', timestamp: ts,
            })
          } else if (msg.role === 'thinking') {
            addLog({ id, timestamp: ts, type: 'thinking', content: `💭 ${msg.content.slice(0, 200)}` })
          } else if (msg.role === 'system') {
            addLog({ id, timestamp: ts, type: 'cost', content: msg.content })
            // Parse cost and emit
            const costMatch = msg.content.match(/\$([0-9.]+)/)
            if (costMatch) {
              costUpdateEmitter.emit({
                agent: 'ba', cost: parseFloat(costMatch[1]), tokens: { input_tokens: 0, output_tokens: 0 },
              })
            }
          } else if (msg.role === 'diff') {
            addLog({ id, timestamp: ts, type: 'diff', content: `📝 ${msg.content}` })
            diffEventEmitter.emit({
              id, agent: 'ba', file: msg.content, diff: '', timestamp: ts,
            })
          } else if (msg.role === 'assistant') {
            addLog({ id, timestamp: ts, type: 'chat', content: msg.content.slice(0, 150) })
          } else if (msg.role === 'user') {
            addLog({ id, timestamp: ts, type: 'chat', agent: 'user', content: msg.content.slice(0, 150) })
          }
        })
      })
      .catch(console.error)
      .finally(() => setLoadingHistory(false))
  }, [activeSessionId, addMessage, clearMessages])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Filtered agents for mention popup
  const filteredAgents = AGENTS.filter(a =>
    a.id.includes(mentionFilter.toLowerCase()) || a.name.toLowerCase().includes(mentionFilter.toLowerCase())
  )

  const insertMention = useCallback((agentId: string) => {
    // Find the @ position and replace @query with @agentId
    const atIdx = input.lastIndexOf('@')
    if (atIdx !== -1) {
      setInput(input.slice(0, atIdx) + '@' + agentId + ' ')
    }
    setShowMention(false)
    setMentionFilter('')
    setMentionIndex(0)
    inputRef.current?.focus()
  }, [input])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInput(val)

    // Check if user just typed @ or is typing after @
    const atIdx = val.lastIndexOf('@')
    if (atIdx !== -1) {
      const afterAt = val.slice(atIdx + 1)
      // Only show if @ is at start or preceded by space, and no space after the query
      const beforeAt = atIdx === 0 ? ' ' : val[atIdx - 1]
      if ((beforeAt === ' ' || beforeAt === '\n') && !afterAt.includes(' ')) {
        setShowMention(true)
        setMentionFilter(afterAt)
        setMentionIndex(0)
        return
      }
    }
    setShowMention(false)
    setMentionFilter('')
  }

  const handleSend = async () => {
    if (!input.trim()) return
    setShowMention(false)
    await sendMessage(input.trim())
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMention && filteredAgents.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setMentionIndex(i => (i + 1) % filteredAgents.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setMentionIndex(i => (i - 1 + filteredAgents.length) % filteredAgents.length)
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        insertMention(filteredAgents[mentionIndex].id)
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setShowMention(false)
        return
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className='flex flex-col h-full bg-gray-850 border-l border-gray-700'>
      {/* Header */}
      <div className='p-3 border-b border-gray-700'>
        <div className='flex items-center gap-2'>
          <span className='text-gray-300 text-sm font-medium'>Chat</span>
          {activeAgent && (
            <span style={{ backgroundColor: AGENT_COLORS[activeAgent as keyof typeof AGENT_COLORS] }}
                  className='text-white text-xs px-2 py-0.5 rounded-full'>
              {AGENT_NAMES[activeAgent as keyof typeof AGENT_NAMES]}
            </span>
          )}
          <div className='flex-1' />
          <button
            onClick={() => setShowLogs(!showLogs)}
            className={`text-xs px-2 py-1 rounded transition-colors ${showLogs ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}`}
            title='Toggle session logs'
          >
            Logs
          </button>
        </div>
        {claudeSessionId && (
          <div className='mt-1 flex items-center gap-1'>
            <span className='text-xs text-gray-500'>Session:</span>
            <code
              className='text-xs text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded cursor-pointer hover:text-white'
              title={`claude --resume ${claudeSessionId}`}
              onClick={() => navigator.clipboard.writeText(`claude --resume ${claudeSessionId}`)}
            >
              {claudeSessionId.slice(0, 8)}...
            </code>
            <span className='text-xs text-gray-600'>click to copy</span>
          </div>
        )}
        {loadingHistory && (
          <div className='mt-1 text-xs text-indigo-400'>Loading conversation history...</div>
        )}
      </div>

      {/* Logs panel (collapsible) */}
      {showLogs && <LogsPanel />}

      {/* Message list */}
      <div className='flex-1 overflow-y-auto p-3 space-y-2'>
        {messages.map(msg => (
          msg.permissionRequest
            ? <PermissionPrompt key={msg.id} request={msg.permissionRequest} />
            : <ChatMessage key={msg.id} message={msg} />
        ))}
        {permissions.map(req => <PermissionPrompt key={req.id} request={req} />)}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className='p-3 border-t border-gray-700 relative'>
        {/* Mention popup */}
        {showMention && filteredAgents.length > 0 && (
          <div className='absolute bottom-full left-3 right-3 mb-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl overflow-hidden z-50'>
            {filteredAgents.map((agent, i) => (
              <button
                key={agent.id}
                onClick={() => insertMention(agent.id)}
                onMouseEnter={() => setMentionIndex(i)}
                className={
                  'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ' +
                  (i === mentionIndex ? 'bg-gray-700' : 'hover:bg-gray-750')
                }
              >
                <div
                  className='w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0'
                  style={{ backgroundColor: agent.color }}
                >
                  {agent.name[0]}
                </div>
                <div>
                  <span className='text-white font-medium'>{agent.name}</span>
                  <span className='text-gray-400 ml-1.5 text-xs'>@{agent.id}</span>
                </div>
              </button>
            ))}
            <div className='px-3 py-1.5 text-xs text-gray-500 border-t border-gray-700'>
              ↑↓ navigate · Enter/Tab select · Esc close
            </div>
          </div>
        )}

        <div className='flex gap-2'>
          <input
            ref={inputRef}
            type='text'
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder='Message an agent... (type @ to mention)'
            className='flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500'
          />
          <button onClick={handleSend} className='bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-500'>
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
