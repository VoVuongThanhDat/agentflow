import { useEffect, useState } from 'react'
import { SPEECH_BUBBLE_DURATION } from '../../lib/constants'

interface Props {
  content: string
  visible: boolean
  position: { x: number; y: number }
  onDismiss?: () => void
}

export default function SpeechBubble({ content, visible, position, onDismiss }: Props) {
  const [showing, setShowing] = useState(false)

  useEffect(() => {
    if (visible) {
      setShowing(true)
      const timer = setTimeout(() => {
        setShowing(false)
        onDismiss?.()
      }, SPEECH_BUBBLE_DURATION)
      return () => clearTimeout(timer)
    }
  }, [visible, content])

  if (!showing) return null

  // Truncate to 100 chars
  const displayText = content.length > 100 ? content.slice(0, 97) + '...' : content

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y - 80,  // above agent
        transform: 'translate(-50%, -100%)',
        zIndex: 10,
      }}
      className="bg-white text-gray-900 rounded-lg px-3 py-2 text-sm max-w-48 shadow-lg animate-fade-in pointer-events-none"
    >
      <p>{displayText}</p>
      {/* Triangle tail pointing down */}
      <div
        style={{
          position: 'absolute',
          bottom: -8,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid white',
        }}
      />
    </div>
  )
}
