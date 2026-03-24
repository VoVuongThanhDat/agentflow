import { BeadsTask } from '../../types'
import { AGENT_COLORS, AGENT_NAMES, PRIORITY_COLORS } from '../../lib/constants'

interface Props {
  task: BeadsTask
  onClose: () => void
}

const STATUS_STYLES: Record<BeadsTask['status'], string> = {
  'backlog': 'bg-gray-600 text-gray-200',
  'ready': 'bg-blue-700 text-blue-100',
  'in-progress': 'bg-indigo-600 text-indigo-100',
  'done': 'bg-green-700 text-green-100',
  'blocked': 'bg-red-700 text-red-100',
}

export function TaskDetail({ task, onClose }: Props) {
  const agentColor = task.agent ? (AGENT_COLORS[task.agent] || '#6B7280') : '#6B7280'
  const agentName = task.agent ? (AGENT_NAMES[task.agent] || task.agent) : null
  const priorityClass = PRIORITY_COLORS[task.priority] || 'bg-gray-500'
  const statusClass = STATUS_STYLES[task.status] || 'bg-gray-600 text-gray-200'

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto"
      onClick={handleOverlayClick}
    >
      <div className="bg-gray-800 rounded-xl p-6 max-w-2xl mx-auto mt-20 mb-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-100 leading-snug">{task.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 flex-shrink-0 text-lg leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={'text-xs font-semibold px-2 py-1 rounded ' + statusClass}>
            {task.status}
          </span>
          <span className={'text-xs text-white font-semibold px-2 py-1 rounded ' + priorityClass}>
            {task.priority}
          </span>
          {agentName && (
            <div className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: agentColor }}
              />
              <span className="text-xs text-gray-300">{agentName}</span>
            </div>
          )}
          {task.epic && (
            <span className="text-xs text-gray-500">{task.epic}</span>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Description</h3>
            <p className="whitespace-pre-wrap text-sm text-gray-300">{task.description}</p>
          </div>
        )}

        {/* Dependencies */}
        {task.dependencies && task.dependencies.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Dependencies</h3>
            <div className="flex flex-wrap gap-1">
              {task.dependencies.map((dep) => (
                <span key={dep} className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded">
                  {dep}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Blocked by */}
        {task.blockedBy && task.blockedBy.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Blocked By</h3>
            <div className="flex flex-wrap gap-1">
              {task.blockedBy.map((dep) => (
                <span key={dep} className="text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded">
                  {dep}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskDetail
