import { useState } from 'react'
import { useBeadsTasks } from '../../hooks/useBeadsTasks'
import TaskCard from './TaskCard'
import TaskDetail from './TaskDetail'
import type { BeadsTask } from '../../types'

const COLUMNS: { key: string; label: string; color: string }[] = [
  { key: 'backlog', label: 'Backlog', color: 'text-gray-400' },
  { key: 'ready', label: 'Ready', color: 'text-blue-400' },
  { key: 'in-progress', label: 'In Progress', color: 'text-yellow-400' },
  { key: 'done', label: 'Done', color: 'text-green-400' },
  { key: 'blocked', label: 'Blocked', color: 'text-red-400' },
]

export function KanbanBoard() {
  const { tasksByStatus, loading, error, refresh } = useBeadsTasks()
  const [selectedTask, setSelectedTask] = useState<BeadsTask | null>(null)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="animate-spin w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full mr-2" />
        Loading tasks...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col h-full">
      {/* Refresh button */}
      <div className="flex justify-end px-4 pt-2 pb-1 flex-shrink-0">
        <button
          onClick={refresh}
          className="text-xs text-gray-400 hover:text-gray-200 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Columns */}
      <div className="flex gap-4 flex-1 px-4 pb-4 overflow-x-auto min-h-0">
        {COLUMNS.map(col => (
          <div key={col.key} className="flex flex-col w-64 flex-shrink-0 min-h-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={col.color + ' font-medium text-sm'}>{col.label}</span>
              <span className="bg-gray-700 text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
                {tasksByStatus[col.key]?.length ?? 0}
              </span>
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto flex-1">
              {(tasksByStatus[col.key] ?? []).map(task => (
                <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedTask && (
        <TaskDetail task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  )
}

export default KanbanBoard
