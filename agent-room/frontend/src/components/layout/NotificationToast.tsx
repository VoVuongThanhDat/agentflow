import { useState, useEffect, useRef, useCallback } from 'react'
import { sendNotification } from '../../lib/notifications'
import { TOAST_DURATION } from '../../lib/constants'

export type ToastLevel = 'info' | 'warning' | 'error'

export type Toast = {
  id: string
  title: string
  body: string
  level: ToastLevel
}

const MAX_VISIBLE_TOASTS = 3

// Module-level toast queue via event emitter pattern
type ToastListener = (toast: Omit<Toast, 'id'>) => void
const listeners: Set<ToastListener> = new Set()

export function addToast(toast: Omit<Toast, 'id'>): void {
  listeners.forEach((listener) => listener(toast))
  sendNotification(toast.title, toast.body)
}

const LEVEL_COLORS: Record<ToastLevel, string> = {
  info: 'border-blue-600 text-blue-600',
  warning: 'border-yellow-600 text-yellow-600',
  error: 'border-red-600 text-red-600',
}

const LEVEL_BG: Record<ToastLevel, string> = {
  info: 'bg-blue-50',
  warning: 'bg-yellow-50',
  error: 'bg-red-50',
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast
  onDismiss: (id: string) => void
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const remainingRef = useRef(TOAST_DURATION)
  const startRef = useRef(Date.now())

  const startTimer = useCallback(() => {
    startRef.current = Date.now()
    timerRef.current = setTimeout(() => {
      onDismiss(toast.id)
    }, remainingRef.current)
  }, [toast.id, onDismiss])

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
      remainingRef.current -= Date.now() - startRef.current
    }
  }, [])

  useEffect(() => {
    startTimer()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [startTimer])

  const colorClass = LEVEL_COLORS[toast.level]
  const bgClass = LEVEL_BG[toast.level]

  return (
    <div
      className={`relative flex flex-col gap-1 p-3 rounded border-l-4 shadow-md min-w-72 max-w-sm ${bgClass} ${colorClass}`}
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`font-semibold text-sm ${colorClass.split(' ')[1]}`}>
          {toast.title}
        </span>
        <button
          onClick={() => onDismiss(toast.id)}
          className="text-gray-400 hover:text-gray-600 leading-none flex-shrink-0"
          aria-label="Dismiss notification"
        >
          &times;
        </button>
      </div>
      {toast.body && (
        <p className="text-xs text-gray-700">{toast.body}</p>
      )}
    </div>
  )
}

export function NotificationToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    const listener: ToastListener = (incoming) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
      setToasts((prev) => {
        const next = [...prev, { ...incoming, id }]
        return next.slice(-MAX_VISIBLE_TOASTS)
      })
    }
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  )
}
