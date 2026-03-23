import { useEffect, useRef, useState } from 'react'
import type { AgentId, TimelineEntry } from '../../types'
import { AGENT_COLORS, AGENT_NAMES } from '../../lib/constants'
import { getTimeline } from '../../lib/api'
import { useSessionStore } from '../../stores/sessionStore'
import { createWSConnection } from '../../lib/ws'
import TimelineEvent from './TimelineEvent'

const ALL_AGENTS: AgentId[] = ['ba', 'dev-lead', 'dev-be', 'dev-fe', 'tester', 'devops']

export default function TimelineView() {
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const [events, setEvents] = useState<TimelineEntry[]>([])
  const [activeAgents, setActiveAgents] = useState<Set<AgentId>>(new Set(ALL_AGENTS))
  const bottomRef = useRef<HTMLDivElement>(null)

  // Fetch initial events on mount / session change
  useEffect(() => {
    if (!activeSessionId) return

    getTimeline(activeSessionId)
      .then((res) => setEvents(res.events))
      .catch(() => {
        // Leave events empty on error; WS will still append new ones
      })
  }, [activeSessionId])

  // Listen for timeline_event WebSocket messages
  useEffect(() => {
    if (!activeSessionId) return

    const conn = createWSConnection(activeSessionId)

    const unsub = conn.onEvent((wsEvent) => {
      if (wsEvent.type === 'timeline_event') {
        const entry: TimelineEntry = {
          id: `${wsEvent.timestamp}-${wsEvent.agent}-${Math.random()}`,
          agent: wsEvent.agent,
          action: wsEvent.action,
          type: 'chat', // default; backend may extend WSEvent to include type
          detail: wsEvent.detail,
          timestamp: wsEvent.timestamp,
        }
        setEvents((prev) => [...prev, entry])
      }
    })

    return () => {
      unsub()
      conn.close()
    }
  }, [activeSessionId])

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events])

  const toggleAgent = (agent: AgentId) => {
    setActiveAgents((prev) => {
      const next = new Set(prev)
      if (next.has(agent)) {
        next.delete(agent)
      } else {
        next.add(agent)
      }
      return next
    })
  }

  const filteredEvents = events.filter((e) => activeAgents.has(e.agent))

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Filter bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700 flex-shrink-0">
        <span className="text-xs text-gray-400 mr-1">Filter:</span>
        {ALL_AGENTS.map((agent) => {
          const active = activeAgents.has(agent)
          const color = AGENT_COLORS[agent]
          return (
            <button
              key={agent}
              onClick={() => toggleAgent(agent)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-opacity"
              style={{
                backgroundColor: active ? color : 'transparent',
                border: `1px solid ${color}`,
                color: active ? '#fff' : color,
                opacity: active ? 1 : 0.5,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: active ? '#fff' : color }}
              />
              {AGENT_NAMES[agent]}
            </button>
          )
        })}
      </div>

      {/* Timeline list */}
      <div className="flex-1 overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No activity yet
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filteredEvents.map((event) => (
              <TimelineEvent key={event.id} event={event} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
