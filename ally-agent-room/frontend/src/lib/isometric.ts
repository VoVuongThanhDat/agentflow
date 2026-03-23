import type { AgentId } from '../types'

export const TILE_WIDTH = 64
export const TILE_HEIGHT = 32
export const ROOM_WIDTH = 16   // tiles
export const ROOM_HEIGHT = 10  // tiles

// Convert cartesian grid coords to isometric screen pixels
export function cartToIso(x: number, y: number): { isoX: number; isoY: number } {
  return {
    isoX: (x - y) * (TILE_WIDTH / 2),
    isoY: (x + y) * (TILE_HEIGHT / 2),
  }
}

// Convert isometric screen pixels back to cartesian grid coords
export function isoToCart(isoX: number, isoY: number): { x: number; y: number } {
  return {
    x: (isoX / (TILE_WIDTH / 2) + isoY / (TILE_HEIGHT / 2)) / 2,
    y: (isoY / (TILE_HEIGHT / 2) - isoX / (TILE_WIDTH / 2)) / 2,
  }
}

// Offset to center the room in the canvas
export function getRoomOffset(canvasWidth: number, canvasHeight: number): { x: number; y: number } {
  const roomPixelWidth = (ROOM_WIDTH + ROOM_HEIGHT) * (TILE_WIDTH / 2)
  const roomPixelHeight = (ROOM_WIDTH + ROOM_HEIGHT) * (TILE_HEIGHT / 2)
  return {
    x: (canvasWidth - roomPixelWidth) / 2 + roomPixelWidth / 2,
    y: (canvasHeight - roomPixelHeight) / 2 + TILE_HEIGHT,
  }
}

// Agent desk positions arranged in a circle around center (8, 5)
// 6 agents evenly spaced on a circle of radius ~4 tiles
const CENTER_X = 8
const CENTER_Y = 5
const RADIUS = 4
const AGENT_IDS: AgentId[] = ['ba', 'dev-lead', 'dev-be', 'dev-fe', 'tester', 'devops']

// Desk positions (where the computer sits)
export const DESK_POSITIONS: Record<AgentId, { x: number; y: number }> = Object.fromEntries(
  AGENT_IDS.map((id, i) => {
    const angle = (i / AGENT_IDS.length) * 2 * Math.PI - Math.PI / 2
    return [id, {
      x: Math.round(CENTER_X + RADIUS * Math.cos(angle)),
      y: Math.round(CENTER_Y + RADIUS * Math.sin(angle)),
    }]
  })
) as Record<AgentId, { x: number; y: number }>

// Agent positions: sitting BEHIND the desk (offset away from center in isometric view)
// In isometric, "behind" means slightly up-left (lower x, lower y) relative to desk
export const AGENT_POSITIONS: Record<AgentId, { x: number; y: number }> = Object.fromEntries(
  AGENT_IDS.map((id, i) => {
    const angle = (i / AGENT_IDS.length) * 2 * Math.PI - Math.PI / 2
    const deskX = CENTER_X + RADIUS * Math.cos(angle)
    const deskY = CENTER_Y + RADIUS * Math.sin(angle)
    // Agent sits behind desk (further from center)
    const offsetX = Math.cos(angle) * 0.8
    const offsetY = Math.sin(angle) * 0.8
    return [id, {
      x: Math.round(deskX + offsetX),
      y: Math.round(deskY + offsetY),
    }]
  })
) as Record<AgentId, { x: number; y: number }>

// Convert desk tile position to screen pixels
export function deskToScreenPos(agentId: AgentId, canvasWidth: number, canvasHeight: number): { x: number; y: number } {
  const tilePos = DESK_POSITIONS[agentId]
  const { isoX, isoY } = cartToIso(tilePos.x, tilePos.y)
  const offset = getRoomOffset(canvasWidth, canvasHeight)
  return { x: offset.x + isoX, y: offset.y + isoY }
}

// Convert agent tile position to screen pixels (for CSS absolute positioning)
export function agentToScreenPos(agentId: AgentId, canvasWidth: number, canvasHeight: number): { x: number; y: number } {
  const tilePos = AGENT_POSITIONS[agentId]
  const { isoX, isoY } = cartToIso(tilePos.x, tilePos.y)
  const offset = getRoomOffset(canvasWidth, canvasHeight)
  return { x: offset.x + isoX, y: offset.y + isoY }
}
