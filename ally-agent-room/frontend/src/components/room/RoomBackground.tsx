import { useRef, useEffect } from 'react'
import { cartToIso, TILE_WIDTH, TILE_HEIGHT, ROOM_WIDTH, ROOM_HEIGHT, getRoomOffset, DESK_POSITIONS } from '../../lib/isometric'

interface Props { width: number; height: number }

export default function RoomBackground({ width, height }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, width, height)
    const offset = getRoomOffset(width, height)

    // Draw floor tiles
    for (let x = 0; x < ROOM_WIDTH; x++) {
      for (let y = 0; y < ROOM_HEIGHT; y++) {
        const { isoX, isoY } = cartToIso(x, y)
        const screenX = offset.x + isoX
        const screenY = offset.y + isoY
        // Draw diamond tile shape
        ctx.beginPath()
        ctx.moveTo(screenX, screenY)
        ctx.lineTo(screenX + TILE_WIDTH/2, screenY + TILE_HEIGHT/2)
        ctx.lineTo(screenX, screenY + TILE_HEIGHT)
        ctx.lineTo(screenX - TILE_WIDTH/2, screenY + TILE_HEIGHT/2)
        ctx.closePath()
        // Alternate tile colors for checkerboard effect
        const isEven = (x + y) % 2 === 0
        ctx.fillStyle = isEven ? '#1a1f2e' : '#1e2438'
        ctx.fill()
        ctx.strokeStyle = '#2a3050'
        ctx.lineWidth = 0.5
        ctx.stroke()
      }
    }

    // === CONFERENCE TABLE at tile (8, 5) ===
    {
      const { isoX, isoY } = cartToIso(8, 5)
      const cx = offset.x + isoX
      const cy = offset.y + isoY
      const tw = TILE_WIDTH * 0.65
      const th = TILE_HEIGHT * 0.65
      const tableH = 10
      // Top face (large diamond)
      ctx.beginPath()
      ctx.moveTo(cx, cy - th)
      ctx.lineTo(cx + tw, cy)
      ctx.lineTo(cx, cy + th)
      ctx.lineTo(cx - tw, cy)
      ctx.closePath()
      ctx.fillStyle = '#8B6914'
      ctx.fill()
      ctx.strokeStyle = '#5A420D'
      ctx.lineWidth = 0.8
      ctx.stroke()
      // Left face
      ctx.beginPath()
      ctx.moveTo(cx - tw, cy)
      ctx.lineTo(cx, cy + th)
      ctx.lineTo(cx, cy + th + tableH)
      ctx.lineTo(cx - tw, cy + tableH)
      ctx.closePath()
      ctx.fillStyle = '#6B4F10'
      ctx.fill()
      // Right face
      ctx.beginPath()
      ctx.moveTo(cx, cy + th)
      ctx.lineTo(cx + tw, cy)
      ctx.lineTo(cx + tw, cy + tableH)
      ctx.lineTo(cx, cy + th + tableH)
      ctx.closePath()
      ctx.fillStyle = '#5A420D'
      ctx.fill()
    }

    // === WHITEBOARD at tile (13, 2) ===
    {
      const { isoX, isoY } = cartToIso(13, 2)
      const cx = offset.x + isoX
      const cy = offset.y + isoY
      const bw = 28
      const bh = 20
      const bx = cx - bw / 2
      const by = cy - bh - 4
      // Board surface
      ctx.fillStyle = '#F8F8F8'
      ctx.strokeStyle = '#555'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.rect(bx, by, bw, bh)
      ctx.fill()
      ctx.stroke()
      // Writing lines
      const lineColors = ['#2563EB', '#DC2626', '#16A34A', '#1D1D1D']
      lineColors.forEach((lc, i) => {
        ctx.fillStyle = lc
        ctx.fillRect(bx + 3, by + 4 + i * 4, 4 + Math.floor(Math.random() * 12), 1.2)
      })
      // Frame / border shadow
      ctx.fillStyle = '#888'
      ctx.fillRect(bx - 1.5, by + bh, bw + 3, 3)
    }

    // === WATER COOLER at tile (2, 5) ===
    {
      const { isoX, isoY } = cartToIso(2, 5)
      const cx = offset.x + isoX
      const cy = offset.y + isoY
      const bodyW = 8
      const bodyH = 14
      const jugW = 6
      const jugH = 8
      // Base
      ctx.fillStyle = '#6B7280'
      ctx.beginPath()
      ctx.ellipse(cx, cy + bodyH / 2, bodyW * 0.6, 2.5, 0, 0, Math.PI * 2)
      ctx.fill()
      // Body
      ctx.fillStyle = '#9CA3AF'
      ctx.fillRect(cx - bodyW / 2, cy - bodyH / 2, bodyW, bodyH)
      ctx.fillStyle = '#D1D5DB'
      ctx.fillRect(cx - bodyW / 2, cy - bodyH / 2, 2, bodyH) // highlight
      // Water jug (blue cylinder on top)
      ctx.fillStyle = '#3B82F6'
      ctx.beginPath()
      ctx.ellipse(cx, cy - bodyH / 2 - jugH / 2, jugW / 2, 2.5, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillRect(cx - jugW / 2, cy - bodyH / 2 - jugH, jugW, jugH)
      ctx.fillStyle = '#60A5FA'
      ctx.beginPath()
      ctx.ellipse(cx, cy - bodyH / 2 - jugH, jugW / 2, 2.5, 0, 0, Math.PI * 2)
      ctx.fill()
    }

    // === BOOKSHELF at tile (2, 2) ===
    {
      const { isoX, isoY } = cartToIso(2, 2)
      const cx = offset.x + isoX
      const cy = offset.y + isoY
      const sw = TILE_WIDTH * 0.5
      const sh = TILE_HEIGHT * 0.25
      const shelfH = 16
      // Top face
      ctx.beginPath()
      ctx.moveTo(cx, cy - sh)
      ctx.lineTo(cx + sw, cy)
      ctx.lineTo(cx, cy + sh)
      ctx.lineTo(cx - sw, cy)
      ctx.closePath()
      ctx.fillStyle = '#4A3728'
      ctx.fill()
      ctx.strokeStyle = '#2E2010'
      ctx.lineWidth = 0.5
      ctx.stroke()
      // Front face
      ctx.beginPath()
      ctx.moveTo(cx - sw, cy)
      ctx.lineTo(cx, cy + sh)
      ctx.lineTo(cx, cy + sh + shelfH)
      ctx.lineTo(cx - sw, cy + shelfH)
      ctx.closePath()
      ctx.fillStyle = '#3A2718'
      ctx.fill()
      // Book spines (colored verticals on front face)
      const bookColors = ['#DC2626', '#2563EB', '#16A34A', '#D97706', '#7C3AED', '#DB2777', '#0891B2']
      const spineCount = bookColors.length
      for (let b = 0; b < spineCount; b++) {
        const bx = cx - sw + 3 + b * ((sw - 4) / spineCount)
        ctx.fillStyle = bookColors[b]
        ctx.fillRect(bx, cy + sh + 2, (sw - 6) / spineCount - 1, shelfH - 4)
      }
    }

    // === POTTED PLANTS at tiles (14, 8) and (2, 8) ===
    const plantTiles = [{ x: 14, y: 8 }, { x: 2, y: 8 }]
    plantTiles.forEach(tile => {
      const { isoX, isoY } = cartToIso(tile.x, tile.y)
      const cx = offset.x + isoX
      const cy = offset.y + isoY
      const potW = 8
      const potH = 6
      // Pot
      ctx.fillStyle = '#92400E'
      ctx.beginPath()
      ctx.moveTo(cx - potW / 2, cy - 2)
      ctx.lineTo(cx + potW / 2, cy - 2)
      ctx.lineTo(cx + potW / 2 - 1.5, cy + potH)
      ctx.lineTo(cx - potW / 2 + 1.5, cy + potH)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = '#78340F'
      ctx.lineWidth = 0.5
      ctx.stroke()
      // Foliage (circle of green)
      ctx.fillStyle = '#22C55E'
      ctx.beginPath()
      ctx.arc(cx, cy - 8, 7, 0, Math.PI * 2)
      ctx.fill()
      // Highlight on foliage
      ctx.fillStyle = '#4ADE80'
      ctx.beginPath()
      ctx.arc(cx - 2, cy - 10, 3, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw desktop PC workstations at each agent position
    const DESK_COLORS: Record<string, { accent: string; screen: string; wallpaper: string }> = {
      ba:         { accent: '#3B82F6', screen: '#1a1a2e', wallpaper: '#1E3A5F' },
      'dev-lead': { accent: '#8B5CF6', screen: '#1a1a2e', wallpaper: '#2D1B5E' },
      'dev-be':   { accent: '#10B981', screen: '#1a1a2e', wallpaper: '#0D3D2E' },
      'dev-fe':   { accent: '#06B6D4', screen: '#1a1a2e', wallpaper: '#0A2E3A' },
      tester:     { accent: '#F59E0B', screen: '#1a1a2e', wallpaper: '#3D2A00' },
      devops:     { accent: '#EF4444', screen: '#1a1a2e', wallpaper: '#3D1515' },
    }
    Object.entries(DESK_POSITIONS).forEach(([agentId, pos]) => {
      const { isoX, isoY } = cartToIso(pos.x, pos.y)
      const sx = offset.x + isoX
      const sy = offset.y + isoY
      const c = DESK_COLORS[agentId] ?? { accent: '#666', screen: '#1a1a2e', wallpaper: '#333' }
      const tw = TILE_WIDTH * 0.45
      const th = TILE_HEIGHT * 0.45
      const deskH = 8 // desk depth/height

      // === DESK (table surface + sides) ===
      // Top surface
      ctx.beginPath()
      ctx.moveTo(sx, sy - th)
      ctx.lineTo(sx + tw, sy)
      ctx.lineTo(sx, sy + th)
      ctx.lineTo(sx - tw, sy)
      ctx.closePath()
      ctx.fillStyle = '#5C4033'
      ctx.fill()
      ctx.strokeStyle = '#3A2718'
      ctx.lineWidth = 0.5
      ctx.stroke()
      // Left face
      ctx.beginPath()
      ctx.moveTo(sx - tw, sy)
      ctx.lineTo(sx, sy + th)
      ctx.lineTo(sx, sy + th + deskH)
      ctx.lineTo(sx - tw, sy + deskH)
      ctx.closePath()
      ctx.fillStyle = '#4A3728'
      ctx.fill()
      // Right face
      ctx.beginPath()
      ctx.moveTo(sx, sy + th)
      ctx.lineTo(sx + tw, sy)
      ctx.lineTo(sx + tw, sy + deskH)
      ctx.lineTo(sx, sy + th + deskH)
      ctx.closePath()
      ctx.fillStyle = '#3A2718'
      ctx.fill()

      // === MONITOR ===
      const monW = 18
      const monH = 14
      const monY = sy - th - monH - 4
      // Monitor back/bezel
      ctx.fillStyle = '#2D2D2D'
      ctx.beginPath()
      ctx.roundRect(sx - monW/2, monY, monW, monH, 2)
      ctx.fill()
      // Screen
      ctx.fillStyle = c.wallpaper
      ctx.fillRect(sx - monW/2 + 1.5, monY + 1.5, monW - 3, monH - 3)
      // Screen content lines (code/text)
      ctx.fillStyle = c.accent + '80'
      for (let i = 0; i < 3; i++) {
        const lineW = 4 + Math.random() * 6
        ctx.fillRect(sx - monW/2 + 3, monY + 3.5 + i * 2.5, lineW, 1)
      }
      // Power LED
      ctx.fillStyle = '#4ADE80'
      ctx.fillRect(sx + monW/2 - 3, monY + monH - 2.5, 1, 1)
      // Monitor stand (neck)
      ctx.fillStyle = '#444'
      ctx.fillRect(sx - 1.5, monY + monH, 3, 3)
      // Stand base
      ctx.fillStyle = '#333'
      ctx.beginPath()
      ctx.ellipse(sx, monY + monH + 4, 5, 2, 0, 0, Math.PI * 2)
      ctx.fill()

      // === KEYBOARD ===
      ctx.fillStyle = '#333'
      ctx.fillRect(sx - 6, sy - th + 2, 12, 4)
      ctx.fillStyle = '#444'
      for (let r = 0; r < 2; r++)
        for (let k = 0; k < 5; k++)
          ctx.fillRect(sx - 5 + k * 2.2, sy - th + 2.5 + r * 1.5, 1.5, 0.8)

      // === MOUSE ===
      ctx.fillStyle = '#444'
      ctx.beginPath()
      ctx.ellipse(sx + 9, sy - th + 4, 1.5, 2, 0, 0, Math.PI * 2)
      ctx.fill()

      // === ACCENT GLOW under desk ===
      ctx.strokeStyle = c.accent + '40'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(sx - tw, sy + deskH)
      ctx.lineTo(sx, sy + th + deskH)
      ctx.stroke()
    })
  }, [width, height])

  return <canvas ref={canvasRef} width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} />
}
