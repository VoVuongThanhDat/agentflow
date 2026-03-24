import { useEffect } from 'react'
import { useSessionStore } from '../../stores/sessionStore'
import { getSessions, createSession, deleteSession, renameSession, startAgents } from '../../lib/api'
import type { AgentId } from '../../types'
import { SessionCard } from './SessionCard'

const ALL_AGENTS: AgentId[] = ['ba', 'dev-lead', 'dev-be', 'dev-fe', 'tester', 'devops']

export function SessionList() {
  const { sessions, activeSessionId, setSessions, addSession, setActive, removeSession, renameSession: renameInStore } =
    useSessionStore()

  // Fetch sessions on mount
  useEffect(() => {
    getSessions()
      .then((data) => setSessions(data))
      .catch(console.error)
  }, [setSessions])

  async function handleNewSession() {
    try {
      const session = await createSession()
      addSession(session)
      setActive(session.id)
      await startAgents(session.id, ALL_AGENTS)
    } catch (err) {
      console.error('Failed to create session:', err)
    }
  }

  async function handleDelete(sessionId: string) {
    try {
      await deleteSession(sessionId)
      removeSession(sessionId)
      if (activeSessionId === sessionId) {
        const remaining = sessions.filter((s) => s.id !== sessionId)
        setActive(remaining.length > 0 ? remaining[0].id : null)
      }
    } catch (err) {
      console.error('Failed to delete session:', err)
    }
  }

  async function handleRename(sessionId: string, name: string) {
    try {
      await renameSession(sessionId, name)
      renameInStore(sessionId, name)
    } catch (err) {
      console.error('Failed to rename session:', err)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* New Session button */}
      <div className="p-3 border-b border-gray-700">
        <button
          className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
          onClick={handleNewSession}
        >
          + New Session
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sessions.length === 0 ? (
          <p className="text-xs text-gray-500 text-center mt-4">No sessions yet</p>
        ) : (
          sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isActive={session.id === activeSessionId}
              onSelect={() => setActive(session.id)}
              onRename={(name) => handleRename(session.id, name)}
              onDelete={() => handleDelete(session.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default SessionList
