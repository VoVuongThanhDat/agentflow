// @refresh reset
import React, { useRef, useState, useEffect } from 'react'
import RoomBackground from './RoomBackground'
import AgentCharacter from './AgentCharacter'
import SpeechBubble from './SpeechBubble'
import ActivityLog from './ActivityLog'
import TaskDelivery from './TaskDelivery'
import { useAgentState } from '../../hooks/useAgentState'
import { agentToScreenPos, cartToIso, getRoomOffset } from '../../lib/isometric'
import { AGENT_COLORS, AGENT_NAMES } from '../../lib/constants'
import type { AgentId, AgentState } from '../../types'

// CSS transition duration for agent position animations (ms)
const WALK_TRANSITION_MS = 1800

export default function IsometricRoom() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const { agents, speechBubbles, activeDelivery, toggleActivityLog, activityLogs, openLogs, wanderPositions } = useAgentState()

  // Display state per agent: lags behind actual state when agent is walking back to desk
  // so the "working" label doesn't appear until after the return animation completes.
  const [displayStates, setDisplayStates] = useState<Partial<Record<AgentId, AgentState>>>({})
  const displayStateTimers = useRef<Map<AgentId, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    Object.entries(agents).forEach(([agentId, agentState]) => {
      const id = agentId as AgentId
      const prevDisplay = displayStates[id]
      const actualState = agentState?.state

      // When an agent transitions from wandering to working/waiting,
      // keep displaying "wandering" until the walk-back animation finishes.
      if (prevDisplay === 'wandering' && (actualState === 'working' || actualState === 'waiting')) {
        if (!displayStateTimers.current.has(id)) {
          const timer = setTimeout(() => {
            setDisplayStates(prev => ({ ...prev, [id]: actualState }))
            displayStateTimers.current.delete(id)
          }, WALK_TRANSITION_MS)
          displayStateTimers.current.set(id, timer)
        }
      } else if (actualState !== prevDisplay) {
        // For all other transitions, update display state immediately
        const pending = displayStateTimers.current.get(id)
        if (pending) {
          clearTimeout(pending)
          displayStateTimers.current.delete(id)
        }
        setDisplayStates(prev => ({ ...prev, [id]: actualState }))
      }
    })
  }, [agents]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      displayStateTimers.current.forEach(clearTimeout)
      displayStateTimers.current.clear()
    }
  }, [])

  // Resize observer to fill container
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setDimensions({ width, height })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const agentIds: AgentId[] = ['ba', 'dev-lead', 'dev-be', 'dev-fe', 'tester', 'devops']

  // Compute screen position: desk position or wander target
  function getAgentPos(agentId: AgentId) {
    const wanderTarget = wanderPositions[agentId]
    if (wanderTarget) {
      const { isoX, isoY } = cartToIso(wanderTarget.x, wanderTarget.y)
      const offset = getRoomOffset(dimensions.width, dimensions.height)
      return { x: offset.x + isoX, y: offset.y + isoY }
    }
    return agentToScreenPos(agentId, dimensions.width, dimensions.height)
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#0f1117' }}>
      {/* Layer 1: Canvas background */}
      <RoomBackground width={dimensions.width} height={dimensions.height} />

      {/* Layer 2: Agent characters */}
      {agentIds.map(agentId => {
        const pos = getAgentPos(agentId)
        const agentState = agents[agentId]
        // Use display state so the "working" label only appears after the agent
        // has walked back to desk (delayed by WALK_TRANSITION_MS when coming from wandering).
        const displayState = displayStates[agentId] ?? agentState?.state ?? 'idle'
        return (
          <React.Fragment key={agentId}>
            <div style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              transition: 'left 1.8s cubic-bezier(0.25, 0.1, 0.25, 1), top 1.8s cubic-bezier(0.25, 0.1, 0.25, 1)',
              zIndex: Math.round(pos.y),
              pointerEvents: 'none',
              transform: 'translate(-50%, -100%)',
            }}>
              <AgentCharacter
                agentId={agentId}
                state={displayState}
                position={{ x: 0, y: 0 }}
                color={AGENT_COLORS[agentId]}
                name={AGENT_NAMES[agentId]}
                onClick={() => toggleActivityLog(agentId)}
              />
            </div>

            {/* Floating overlays — stacked above agent using absolute positioning */}
            {/* Layer A: Status/task label (closest to agent) */}
            {agentState?.detail && (displayState === 'working' || displayState === 'waiting') && (
              <div style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y - 115,
                transform: 'translateX(-50%)',
                transition: 'left 1.8s cubic-bezier(0.25, 0.1, 0.25, 1), top 1.8s cubic-bezier(0.25, 0.1, 0.25, 1)',
                pointerEvents: 'none',
                maxWidth: 220,
                zIndex: Math.round(pos.y) + 1,
                animation: 'fadeSlideIn 0.3s ease-out',
              }}>
                <div style={{
                  background: 'rgba(17,24,39,0.95)',
                  border: `1px solid ${AGENT_COLORS[agentId]}50`,
                  borderRadius: 8,
                  padding: '5px 10px',
                  fontSize: 11,
                  color: '#e5e7eb',
                  textAlign: 'center',
                  boxShadow: `0 2px 12px ${AGENT_COLORS[agentId]}25`,
                  backdropFilter: 'blur(4px)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      width: 6, height: 6,
                      borderRadius: '50%',
                      backgroundColor: AGENT_COLORS[agentId],
                      animation: 'pulse 1.5s ease-in-out infinite',
                      boxShadow: `0 0 6px ${AGENT_COLORS[agentId]}`,
                    }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                      {agentState.detail}
                    </span>
                  </div>
                </div>
                <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `5px solid ${AGENT_COLORS[agentId]}50`, margin: '0 auto' }} />
              </div>
            )}

            {/* Layer B: Speech bubble (above status label) */}
            <SpeechBubble
              content={speechBubbles[agentId]?.content ?? ''}
              visible={!!speechBubbles[agentId]?.visible}
              position={{ x: pos.x, y: pos.y - (agentState?.detail && (displayState === 'working' || displayState === 'waiting') ? 150 : 95) }}
            />
            <ActivityLog
              agentId={agentId}
              events={activityLogs[agentId] ?? []}
              visible={openLogs.has(agentId)}
              position={pos}
            />
          </React.Fragment>
        )
      })}

      {/* Layer 3: Active delivery animation */}
      {activeDelivery && (
        <TaskDelivery
          fromAgent={activeDelivery.from}
          toAgent={activeDelivery.to}
          color={AGENT_COLORS[activeDelivery.from]}
          name={AGENT_NAMES[activeDelivery.from]}
          canvasWidth={dimensions.width}
          canvasHeight={dimensions.height}
          onComplete={activeDelivery.onComplete}
        />
      )}
    </div>
  )
}
