// @refresh reset
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAgentStore } from '../stores/agentStore'
import { useChatStore } from '../stores/chatStore'
import { ROOM_WIDTH, ROOM_HEIGHT, AGENT_POSITIONS } from '../lib/isometric'
import type { AgentId } from '../types'

interface SpeechBubbleState {
  content: string
  visible: boolean
}

interface DeliveryAnimation {
  from: AgentId
  to: AgentId
  onComplete: () => void
}

const ALL_AGENT_IDS: AgentId[] = ['ba', 'dev-lead', 'dev-be', 'dev-fe', 'tester', 'devops']


// Shared room landmarks — explicit tile coordinates for 16x10 room
const LANDMARKS = [
  { x: 8, y: 5 },   // center conference table
  { x: 8.5, y: 4.5 },
  { x: 2, y: 5 },   // water cooler
  { x: 13, y: 2 },  // whiteboard (top-right)
  { x: 2, y: 2 },   // bookshelf (top-left)
  { x: 14, y: 8 },  // plant 1 (bottom-right)
  { x: 2, y: 8 },   // plant 2 (bottom-left)
  { x: 8, y: 0.5 }, // door
  { x: 8, y: 9 },   // window
]

// Build a wander path for an agent: mix of landmarks and visiting other agents
function buildWanderPath(agentId: AgentId): { x: number; y: number }[] {
  const path: { x: number; y: number }[] = []
  const numStops = 2 + Math.floor(Math.random() * 3)

  for (let i = 0; i < numStops; i++) {
    const roll = Math.random()
    if (roll < 0.35) {
      // Visit another agent's desk (go chat with colleague)
      const others = ALL_AGENT_IDS.filter(id => id !== agentId)
      const target = others[Math.floor(Math.random() * others.length)]
      const pos = AGENT_POSITIONS[target]
      // Stand next to their desk, not on top
      path.push({ x: pos.x + (Math.random() - 0.5), y: pos.y + (Math.random() - 0.5) })
    } else if (roll < 0.7) {
      // Go to a landmark
      path.push(LANDMARKS[Math.floor(Math.random() * LANDMARKS.length)])
    } else {
      // Random spot with slight jitter
      path.push({
        x: 1.5 + Math.random() * (ROOM_WIDTH - 3),
        y: 1.5 + Math.random() * (ROOM_HEIGHT - 3),
      })
    }
  }
  return path
}

export function useAgentState() {
  const agents = useAgentStore(s => s.agents)
  const messages = useChatStore(s => s.messages)
  const [speechBubbles, setSpeechBubbles] = useState<Partial<Record<AgentId, SpeechBubbleState>>>({})
  const [activeDelivery, setActiveDelivery] = useState<DeliveryAnimation | null>(null)
  const [openLogs, setOpenLogs] = useState<Set<AgentId>>(new Set())
  const [activityLogs] = useState<Partial<Record<AgentId, any[]>>>({})
  const wanderTimers = useRef<Map<AgentId, ReturnType<typeof setTimeout>>>(new Map())
  // Per-agent wander path timeouts (waypoint moves + return home)
  const wanderPathTimers = useRef<Map<AgentId, ReturnType<typeof setTimeout>[]>>(new Map())
  // Delivery queue: remaining targets after the current animation
  const deliveryQueueRef = useRef<{ from: AgentId; targets: AgentId[] }>({ from: 'dev-lead', targets: [] })
  // Track current wander offset per agent (in tile coords, relative to desk)
  const [wanderPositions, setWanderPositions] = useState<Partial<Record<AgentId, { x: number; y: number }>>>({})

  // Start delivery to next queued target, or clear active delivery if queue is empty
  const advanceDeliveryQueue = useCallback(() => {
    const { from, targets } = deliveryQueueRef.current
    if (targets.length === 0) {
      setActiveDelivery(null)
      return
    }
    const [next, ...rest] = targets
    deliveryQueueRef.current = { from, targets: rest }
    setActiveDelivery({
      from,
      to: next,
      onComplete: advanceDeliveryQueue,
    })
  }, [])

  // Show speech bubble when new message arrives from an agent
  useEffect(() => {
    const lastMsg = messages[messages.length - 1]
    if (lastMsg && lastMsg.from !== 'user') {
      const agentId = lastMsg.from as AgentId
      setSpeechBubbles(prev => ({
        ...prev,
        [agentId]: { content: lastMsg.content, visible: true }
      }))
    }
  }, [messages])

  // Detect delivering state -> parse comma-separated targets -> sequential queue
  useEffect(() => {
    Object.entries(agents).forEach(([agentId, state]) => {
      if (state.state === 'delivering' && state.detail?.startsWith('to:')) {
        const targetStr = state.detail.slice(3) // e.g. 'dev-be' or 'dev-be,dev-fe'
        const targets = targetStr.split(',').map(t => t.trim() as AgentId).filter(Boolean)
        if (targets.length === 0) return
        const from = agentId as AgentId
        const [first, ...rest] = targets
        deliveryQueueRef.current = { from, targets: rest }
        setActiveDelivery({
          from,
          to: first,
          onComplete: advanceDeliveryQueue,
        })
      }
    })
  }, [agents, advanceDeliveryQueue])

  // Track previous agent states to detect actual changes per agent
  const prevStates = useRef<Record<string, string>>({})

  // Idle wandering: only react when a specific agent's state actually changes
  useEffect(() => {
    Object.entries(agents).forEach(([agentId, entry]) => {
      const id = agentId as AgentId
      const prevState = prevStates.current[id]
      const curState = entry.state

      // Skip if this agent's state hasn't changed
      if (prevState === curState) return
      prevStates.current[id] = curState

      if (curState === 'idle') {
        // Start wander timer (if not already running)
        if (!wanderTimers.current.has(id)) {
          const patience = 3000 + Math.random() * 5000
          const timer = setTimeout(() => {
            // Check agent is still idle before wandering
            const current = useAgentStore.getState().agents[id]
            if (current?.state !== 'idle') {
              wanderTimers.current.delete(id)
              return
            }

            const path = buildWanderPath(id)
            useAgentStore.getState().setState(id, 'wandering')

            let elapsed = 0
            const pathTimers: ReturnType<typeof setTimeout>[] = []
            path.forEach((target) => {
              const walkTime = 1500 + Math.random() * 1000
              const pauseTime = Math.random() < 0.3 ? 1000 + Math.random() * 1500 : 200
              elapsed += walkTime

              pathTimers.push(setTimeout(() => {
                setWanderPositions(prev => ({ ...prev, [id]: target }))
              }, elapsed))

              elapsed += pauseTime
            })

            // Return home
            const returnDelay = elapsed + 800 + Math.random() * 1200
            pathTimers.push(setTimeout(() => {
              setWanderPositions(prev => {
                const next = { ...prev }
                delete next[id]
                return next
              })
              useAgentStore.getState().setState(id, 'idle')
              wanderPathTimers.current.delete(id)
            }, returnDelay))

            wanderPathTimers.current.set(id, pathTimers)
            wanderTimers.current.delete(id)
          }, patience)
          wanderTimers.current.set(id, timer)
        }
      } else if (curState === 'wandering') {
        // Don't touch — wandering is managed by the timer above
      } else {
        // Agent is working/waiting/delivering/error — cancel all wander stuff
        const timer = wanderTimers.current.get(id)
        if (timer) { clearTimeout(timer); wanderTimers.current.delete(id) }

        const pathTimers = wanderPathTimers.current.get(id)
        if (pathTimers) {
          pathTimers.forEach(clearTimeout)
          wanderPathTimers.current.delete(id)
        }

        // Clear wander position (return to desk)
        setWanderPositions(prev => {
          if (!prev[id]) return prev
          const next = { ...prev }
          delete next[id]
          return next
        })
      }
    })
  }, [agents])

  const toggleActivityLog = useCallback((agentId: AgentId) => {
    setOpenLogs(prev => {
      const next = new Set(prev)
      if (next.has(agentId)) next.delete(agentId)
      else next.add(agentId)
      return next
    })
  }, [])

  return { agents, speechBubbles, activeDelivery, toggleActivityLog, activityLogs, openLogs, wanderPositions }
}
