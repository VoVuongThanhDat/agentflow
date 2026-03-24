import { useState } from 'react'
import type { PermissionRequest } from '../../types'
import { respondPermission } from '../../lib/api'
import { AGENT_NAMES, AGENT_COLORS } from '../../lib/constants'

interface Props { request: PermissionRequest }

export default function PermissionPrompt({ request }: Props) {
  const [resolved, setResolved] = useState(false)
  const [alwaysAllow, setAlwaysAllow] = useState(false)

  const agentColor = AGENT_COLORS[request.agent] ?? '#6B7280'
  const agentName = AGENT_NAMES[request.agent] ?? request.agent
  const inputSummary = JSON.stringify(request.input, null, 2).slice(0, 200)

  const handleRespond = async (approved: boolean) => {
    try {
      await respondPermission(request.id, approved, alwaysAllow)
      setResolved(true)
    } catch (err) {
      console.error('Failed to respond to permission:', err)
    }
  }

  if (resolved) {
    return (
      <div className='text-xs text-gray-500 italic py-1'>
        Permission request resolved
      </div>
    )
  }

  return (
    <div className='border-2 border-yellow-500 bg-yellow-950 rounded-lg p-3 my-2'>
      <div className='flex items-center gap-2 mb-2'>
        <div style={{ backgroundColor: agentColor }} className='w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold'>
          {agentName[0]}
        </div>
        <span className='text-yellow-300 font-medium text-sm'>{agentName} wants to use: {request.tool}</span>
      </div>
      <pre className='text-xs text-gray-300 bg-gray-800 rounded p-2 mb-2 overflow-x-auto max-h-24'>{inputSummary}</pre>
      <label className='flex items-center gap-2 text-xs text-gray-300 mb-2 cursor-pointer'>
        <input type='checkbox' checked={alwaysAllow} onChange={e => setAlwaysAllow(e.target.checked)} />
        Always allow {request.tool} for {agentName}
      </label>
      <div className='flex gap-2'>
        <button onClick={() => handleRespond(true)} className='flex-1 bg-green-600 hover:bg-green-500 text-white text-sm py-1 rounded'>
          Approve
        </button>
        <button onClick={() => handleRespond(false)} className='flex-1 bg-red-600 hover:bg-red-500 text-white text-sm py-1 rounded'>
          Deny
        </button>
      </div>
    </div>
  )
}
