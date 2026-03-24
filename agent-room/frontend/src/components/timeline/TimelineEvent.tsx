import type { TimelineEntry } from '../../types'
import { AGENT_COLORS, EVENT_TYPE_ICONS } from '../../lib/constants'

interface Props {
  event: TimelineEntry
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const hh = date.getHours().toString().padStart(2, '0')
  const mm = date.getMinutes().toString().padStart(2, '0')
  const ss = date.getSeconds().toString().padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

function truncate(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen) + '...' : text
}

export default function TimelineEvent({ event }: Props) {
  const color = AGENT_COLORS[event.agent] ?? '#6B7280'
  const icon = EVENT_TYPE_ICONS[event.type] ?? event.type

  return (
    <div
      className="flex items-center gap-2 py-1 px-2 text-xs"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      {/* Time column */}
      <span className="text-gray-500 font-mono w-16 flex-shrink-0">
        {formatTime(event.timestamp)}
      </span>

      {/* Agent color dot */}
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />

      {/* Event type icon */}
      <span className="text-gray-400 font-mono w-10 flex-shrink-0 text-center">
        {icon}
      </span>

      {/* Action text */}
      <span className="text-gray-200 flex-1 truncate">
        {truncate(event.action, 80)}
      </span>
    </div>
  )
}
