import { useState, useRef, useEffect } from 'react'
import type { SessionInfo } from '../../types'

interface Props {
  session: SessionInfo
  isActive: boolean
  onSelect: () => void
  onRename: (name: string) => void
  onDelete: () => void
}

function formatRelativeTime(createdAt: string): string {
  const diffMs = Date.now() - new Date(createdAt).getTime()
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return `${diffSec}s ago`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}h ago`
  const diffDay = Math.floor(diffHour / 24)
  return `${diffDay}d ago`
}

export function SessionCard({ session, isActive, onSelect, onRename, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(session.name)
  const [hovered, setHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  function handleDoubleClick() {
    setEditValue(session.name)
    setEditing(true)
  }

  function commitRename() {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== session.name) {
      onRename(trimmed)
    }
    setEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commitRename()
    else if (e.key === 'Escape') setEditing(false)
  }

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (window.confirm(`Delete session "${session.name}"?`)) {
      onDelete()
    }
  }

  function handleCopyResume(e: React.MouseEvent) {
    e.stopPropagation()
    const claudeId = (session as any).claudeSessionId
    if (claudeId) {
      navigator.clipboard.writeText(`claude --resume ${claudeId}`)
    }
  }

  const claudeSessionId = (session as any).claudeSessionId as string | undefined

  return (
    <div
      className={
        'relative px-3 py-2 rounded-lg cursor-pointer transition-colors ' +
        (isActive
          ? 'bg-gray-700 border border-indigo-500'
          : 'bg-gray-800 border border-transparent hover:bg-gray-750')
      }
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className='flex items-center gap-2'>
        {/* Status indicator */}
        <div className='flex-shrink-0'>
          {isActive ? (
            <span className='w-2 h-2 rounded-full bg-green-400 block' />
          ) : (
            <span className='w-2 h-2 rounded-full bg-gray-500 block' />
          )}
        </div>

        {/* Name / inline edit */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              ref={inputRef}
              className="w-full bg-gray-900 text-white text-sm rounded px-1 py-0.5 outline-none border border-indigo-400"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <span
              className="block text-sm text-white truncate select-none"
              onDoubleClick={handleDoubleClick}
            >
              {session.name}
            </span>
          )}
        </div>

        {/* Actions */}
        {hovered && !editing && (
          <div className='flex items-center gap-1 flex-shrink-0'>
            {claudeSessionId && (
              <button
                className='text-xs px-1.5 py-0.5 rounded bg-gray-600 text-gray-300 hover:bg-indigo-600 hover:text-white transition-colors'
                onClick={handleCopyResume}
                title={`Copy: claude --resume ${claudeSessionId}`}
              >
                📋
              </button>
            )}
            <button
              className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-red-400 hover:bg-gray-600 transition-colors"
              onClick={handleDeleteClick}
              title="Delete session"
            >
              &times;
            </button>
          </div>
        )}
      </div>

      {/* Subtitle: time + claude session */}
      <div className='flex items-center gap-2 mt-1 pl-4'>
        <span className="text-xs text-gray-500">
          {formatRelativeTime(session.createdAt)}
        </span>
        {claudeSessionId && (
          <span className="text-xs text-gray-600 font-mono">
            {claudeSessionId.slice(0, 8)}
          </span>
        )}
      </div>
    </div>
  )
}

export default SessionCard
