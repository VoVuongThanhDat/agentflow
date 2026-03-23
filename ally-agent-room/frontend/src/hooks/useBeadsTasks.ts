import { useState, useEffect, useCallback, useRef } from 'react'
import { useSessionStore } from '../stores/sessionStore'
import { getTasks } from '../lib/api'
import type { BeadsTask } from '../types'

const TASK_REFRESH_INTERVAL = 30000

export function useBeadsTasks() {
  const activeSessionId = useSessionStore(s => s.activeSessionId)
  const [tasks, setTasks] = useState<BeadsTask[]>([])
  const [tasksByStatus, setTasksByStatus] = useState<Record<string, BeadsTask[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastGoodData = useRef<{ tasks: BeadsTask[]; tasksByStatus: Record<string, BeadsTask[]> }>({
    tasks: [],
    tasksByStatus: {},
  })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchTasks = useCallback(async () => {
    if (!activeSessionId) return
    setLoading(true)
    try {
      const data = await getTasks(activeSessionId)
      setTasks(data.tasks)
      setTasksByStatus(data.by_status)
      lastGoodData.current = { tasks: data.tasks, tasksByStatus: data.by_status }
      setError(null)
    } catch (err) {
      // Keep last good data on error
      setTasks(lastGoodData.current.tasks)
      setTasksByStatus(lastGoodData.current.tasksByStatus)
      setError('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [activeSessionId])

  useEffect(() => {
    fetchTasks()
    intervalRef.current = setInterval(fetchTasks, TASK_REFRESH_INTERVAL)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchTasks])

  return { tasks, tasksByStatus, loading, error, refresh: fetchTasks }
}
