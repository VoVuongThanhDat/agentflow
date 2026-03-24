import { BeadsTask } from '../../types'
import { AGENT_COLORS, AGENT_NAMES, PRIORITY_COLORS } from '../../lib/constants'

interface Props {
  task: BeadsTask
  onClick: () => void
}

export function TaskCard({ task, onClick }: Props) {
  const agentColor = task.agent ? (AGENT_COLORS[task.agent] || '#6B7280') : '#6B7280'
  const agentName = task.agent ? (AGENT_NAMES[task.agent] || task.agent) : null
  const priorityClass = PRIORITY_COLORS[task.priority] || 'bg-gray-500'

  return (
    <div
      className="bg-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-750 hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      {/* Title */}
      <p className="text-sm text-gray-100 font-medium line-clamp-2 mb-2">
        {task.title}
      </p>

      {/* Priority badge + agent */}
      <div className="flex items-center justify-between gap-2">
        <span className={'text-xs text-white font-semibold px-1.5 py-0.5 rounded ' + priorityClass}>
          {task.priority}
        </span>

        {agentName && (
          <div className="flex items-center gap-1 min-w-0">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: agentColor }}
            />
            <span className="text-xs text-gray-400 truncate">{agentName}</span>
          </div>
        )}
      </div>

      {/* Epic */}
      {task.epic && (
        <p className="text-xs text-gray-500 mt-1.5 truncate">{task.epic}</p>
      )}
    </div>
  )
}

export default TaskCard
