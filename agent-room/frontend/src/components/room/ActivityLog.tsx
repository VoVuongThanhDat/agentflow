import type { TimelineEntry } from '../../types'

interface Props {
  agentId: string
  events: TimelineEntry[]
  visible: boolean
  position: { x: number; y: number }
}

const EVENT_ICONS: Record<string, string> = {
  chat: 'MSG', tool_use: 'TOOL', task_claim: 'CLAIM', task_complete: 'DONE',
  error: 'ERR', state_change: 'STATE'
}

export default function ActivityLog({ agentId, events, visible, position }: Props) {
  if (!visible) return null

  // Show last 5 events, newest first
  const recentEvents = [...events].reverse().slice(0, 5)

  return (
    <div style={{
      position: 'absolute',
      left: position.x + 30,
      top: position.y - 120,
      zIndex: 20,
      width: 220,
    }}
    className='bg-gray-900 bg-opacity-90 text-white rounded-lg p-2 text-xs border border-gray-600'>
      <div className='font-bold mb-1 text-gray-300'>{agentId.toUpperCase()} Activity</div>
      {recentEvents.length === 0 && <div className='text-gray-500'>No activity yet</div>}
      {recentEvents.map(e => (
        <div key={e.id} className='flex gap-1 py-0.5 border-b border-gray-700'>
          <span className='text-gray-500'>{new Date(e.timestamp).toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          <span className='text-indigo-400'>{EVENT_ICONS[e.type] ?? e.type}</span>
          <span className='flex-1 truncate'>{e.action}</span>
        </div>
      ))}
    </div>
  )
}
