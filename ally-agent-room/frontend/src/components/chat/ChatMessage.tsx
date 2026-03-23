import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChatMessage as ChatMessageType } from '../../types'
import { AGENT_COLORS, AGENT_NAMES } from '../../lib/constants'

interface Props {
  message: ChatMessageType
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return hours + ':' + minutes
}

function ContentRenderer({ content }: { content: string }) {
  return (
    <div className="text-sm break-words prose prose-invert prose-sm max-w-none overflow-hidden
      prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1
      prose-li:my-0 prose-pre:my-1 prose-code:text-pink-300
      prose-a:text-blue-400 prose-strong:text-white">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ children }) => (
            <pre className="bg-gray-900 rounded p-2 overflow-x-auto text-xs whitespace-pre-wrap break-all">{children}</pre>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className
            return isInline
              ? <code className="bg-gray-900 px-1 py-0.5 rounded text-xs text-pink-300 break-all" {...props}>{children}</code>
              : <code className={className + ' break-all whitespace-pre-wrap'} {...props}>{children}</code>
          },
          table: ({ children }) => (
            <table className="border-collapse text-xs my-1">{children}</table>
          ),
          th: ({ children }) => (
            <th className="border border-gray-600 px-2 py-1 bg-gray-800 text-left">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-600 px-2 py-1">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function StreamingDots() {
  return (
    <span className="inline-flex items-center gap-1 ml-1">
      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </span>
  )
}

export function ChatMessage({ message }: Props) {
  const isUser = message.from === 'user'

  const avatarLetter = isUser
    ? 'U'
    : (AGENT_NAMES[message.from as keyof typeof AGENT_NAMES] || message.from)[0].toUpperCase()

  const senderName = isUser ? 'You' : (AGENT_NAMES[message.from as keyof typeof AGENT_NAMES] || message.from)

  const avatarColor = isUser ? '#6366F1' : (AGENT_COLORS[message.from as keyof typeof AGENT_COLORS] || '#6B7280')

  return (
    <div className={'flex gap-2 mb-3 ' + (isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
        style={{ backgroundColor: avatarColor }}
      >
        {avatarLetter}
      </div>

      {/* Message content */}
      <div className={'flex flex-col min-w-0 flex-1 ' + (isUser ? 'items-end' : 'items-start')}>
        {/* Sender name + timestamp */}
        <div className={'flex items-center gap-1 mb-1 ' + (isUser ? 'flex-row-reverse' : 'flex-row')}>
          <span className="text-xs font-medium text-gray-300">{senderName}</span>
          <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
        </div>

        {/* Bubble */}
        <div
          className={
            'rounded-lg px-3 py-2 max-w-full overflow-hidden ' +
            (isUser
              ? 'bg-indigo-600 text-white rounded-tr-none'
              : 'bg-gray-700 text-gray-100 rounded-tl-none')
          }
        >
          <ContentRenderer content={message.content} />
          {message.streaming && <StreamingDots />}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
