import { useEffect, useState } from 'react'
import type { AgentId } from '../../types'
import { AGENT_POSITIONS, cartToIso, getRoomOffset } from '../../lib/isometric'

interface Props {
  fromAgent: AgentId
  toAgent: AgentId
  color: string
  name: string
  canvasWidth: number
  canvasHeight: number
  onComplete: () => void
}

export default function TaskDelivery({ fromAgent, toAgent, color, name, canvasWidth, canvasHeight, onComplete }: Props) {
  const [phase, setPhase] = useState<'going' | 'arrived' | 'returning' | 'done'>('going')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('arrived'), 1000)
    const t2 = setTimeout(() => setPhase('returning'), 1500)
    const t3 = setTimeout(() => { setPhase('done'); onComplete() }, 2000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  if (phase === 'done') return null

  const fromTile = AGENT_POSITIONS[fromAgent]
  const toTile = AGENT_POSITIONS[toAgent]
  const fromIso = cartToIso(fromTile.x, fromTile.y)
  const toIso = cartToIso(toTile.x, toTile.y)
  const offset = getRoomOffset(canvasWidth, canvasHeight)

  const fromScreen = { x: offset.x + fromIso.isoX, y: offset.y + fromIso.isoY }
  const toScreen = { x: offset.x + toIso.isoX, y: offset.y + toIso.isoY }

  const currentPos = (phase === 'going' || phase === 'arrived') ? toScreen : fromScreen

  return (
    <div
      style={{
        position: 'absolute',
        left: currentPos.x - 18,
        top: currentPos.y - 18,
        transition: 'left 1s ease-in-out, top 1s ease-in-out',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          backgroundColor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: 14,
          boxShadow: phase === 'arrived' ? `0 0 0 4px ${color}66` : 'none',
          transition: 'box-shadow 0.3s ease-in-out',
        }}
      >
        {name[0]}
      </div>
      {phase === 'arrived' && (
        <div style={{ fontSize: 20, marginTop: 2 }}>📦</div>
      )}
    </div>
  )
}
