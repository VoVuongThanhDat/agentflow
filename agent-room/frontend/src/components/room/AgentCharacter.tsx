import { useRef } from 'react'
import type { AgentId, AgentState } from '../../types'
import { CHARACTER_MAP } from '../../lib/pixel-art/characters'
import { usePixelAnimation } from '../../lib/pixel-art/animation'

interface Props {
  agentId: AgentId
  state: AgentState
  position: { x: number; y: number }  // screen pixel position
  color: string
  name: string
  onClick?: () => void
}

const STATE_BADGE: Record<AgentState, string> = {
  idle: '●',
  working: '⚙',
  wandering: '🚶',
  delivering: '→',
  waiting: '🕐',
  error: '!',
}

const STATE_BADGE_COLOR: Record<AgentState, string> = {
  idle: '#86efac',
  working: '#fbbf24',
  wandering: '#93c5fd',
  delivering: '#a78bfa',
  waiting: '#94a3b8',
  error: '#f87171',
}

function FallbackCircle({ color, name }: { color: string; name: string }) {
  return (
    <div
      style={{
        backgroundColor: color,
        width: 48,
        height: 64,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        border: '2px solid rgba(255,255,255,0.2)',
      }}
    >
      <span
        style={{
          color: 'white',
          fontWeight: 700,
          fontSize: 20,
          lineHeight: 1,
          textShadow: '0 1px 2px rgba(0,0,0,0.4)',
        }}
      >
        {name[0].toUpperCase()}
      </span>
    </div>
  )
}

function PixelCanvas({ agentId, state }: { agentId: AgentId; state: AgentState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const character = CHARACTER_MAP[agentId]
  usePixelAnimation(canvasRef, character, state, 2)

  return (
    <canvas
      ref={canvasRef}
      width={48}
      height={64}
      style={{ width: 48, height: 64, display: 'block', imageRendering: 'pixelated' }}
    />
  )
}

export default function AgentCharacter({ agentId, state, position, color, name, onClick }: Props) {
  const character = CHARACTER_MAP[agentId]
  const isError = state === 'error'

  const useAbsolute = position.x !== 0 || position.y !== 0
  return (
    <div
      style={{
        ...(useAbsolute ? { position: 'absolute', left: position.x, top: position.y, transform: 'translate(-50%, -100%)' } : {}),
        cursor: 'pointer',
        userSelect: 'none',
        pointerEvents: 'auto',
      }}
      onClick={onClick}
    >
      {/* Canvas or fallback */}
      <div style={{ position: 'relative' }}>
        {character ? (
          <PixelCanvas agentId={agentId} state={state} />
        ) : (
          <FallbackCircle color={color} name={name} />
        )}

        {/* State badge — top-right overlay */}
        <div
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            fontSize: 11,
            lineHeight: 1,
            color: isError ? '#f87171' : STATE_BADGE_COLOR[state],
            textShadow: '0 1px 2px rgba(0,0,0,0.6)',
          }}
        >
          {STATE_BADGE[state]}
        </div>
      </div>

      {/* Name label */}
      <div
        style={{
          textAlign: 'center',
          fontSize: 10,
          color: color,
          marginTop: 2,
          maxWidth: 80,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          background: 'rgba(17,24,39,0.8)',
          borderRadius: 3,
          padding: '1px 4px',
        }}
      >
        {name}
      </div>
    </div>
  )
}
