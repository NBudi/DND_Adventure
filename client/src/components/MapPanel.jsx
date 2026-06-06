import { useState, useRef, useEffect } from 'react'
import socket from '../socket'

const PLAYER_COLORS = ['#4a90d9', '#e05252', '#50c878', '#f0c040', '#c052e0', '#e08040']

function nameColor(name) {
  let h = 5381
  for (const c of name) h = ((h << 5) + h + c.charCodeAt(0)) & 0xffffffff
  return PLAYER_COLORS[Math.abs(h) % PLAYER_COLORS.length]
}

export default function MapPanel({ map, isDM, players = [], npcs = [] }) {
  const [mode,          setMode]          = useState('reveal')
  const [paintType,     setPaintType]     = useState('wall')
  const [selectedToken, setSelectedToken] = useState(null)
  const [collapsed,     setCollapsed]     = useState(false)
  const dragRef = useRef({ active: false, revealTarget: null })

  useEffect(() => {
    const stop = () => { dragRef.current.active = false }
    window.addEventListener('mouseup', stop)
    return () => window.removeEventListener('mouseup', stop)
  }, [])

  if (!map) {
    if (!isDM) return null
    return (
      <div className="map-create-wrap">
        <button className="btn btn-ghost" onClick={() => socket.emit('map:create')}>
          + Create Map
        </button>
      </div>
    )
  }

  if (collapsed) {
    return (
      <div className="map-section">
        <div className="map-header">
          <span className="section-title" style={{ marginBottom: 0, borderBottom: 'none' }}>Map</span>
          <button className="btn btn-icon" style={{ marginLeft: 'auto' }} onClick={() => setCollapsed(false)}>
            Show Map ▼
          </button>
        </div>
      </div>
    )
  }

  function handleMouseDown(index) {
    if (!isDM) return
    if (mode === 'token') {
      const cell = map.cells[index]
      if (selectedToken) {
        const same = cell.token?.type === selectedToken.type && String(cell.token?.id) === String(selectedToken.id)
        socket.emit('map:place-token', { index, token: same ? null : selectedToken })
      } else {
        socket.emit('map:place-token', { index, token: null })
      }
      return
    }
    if (mode === 'reveal') dragRef.current.revealTarget = !map.cells[index].revealed
    dragRef.current.active = true
    applyCell(index, false)
  }

  function handleMouseEnter(index) {
    if (!isDM || !dragRef.current.active || mode === 'token') return
    applyCell(index, true)
  }

  function applyCell(index, isDrag) {
    if (mode === 'paint') {
      socket.emit('map:set-cell', { index, type: paintType })
    } else {
      const revealed = isDrag ? dragRef.current.revealTarget : !map.cells[index].revealed
      socket.emit('map:reveal-cell', { index, revealed })
    }
  }

  const allTokens = [
    ...players.map(p => ({ type: 'player', id: p,    name: p,      color: nameColor(p) })),
    ...npcs.map(n    => ({ type: 'npc',    id: n.id, name: n.name, color: n.color })),
  ]

  return (
    <div className="map-section">
      <div className="map-header">
        <span className="section-title" style={{ marginBottom: 0, borderBottom: 'none' }}>Map</span>
        <button className="btn btn-icon" style={{ marginLeft: isDM ? undefined : 'auto' }} onClick={() => setCollapsed(true)}>
          Hide ▲
        </button>
        {isDM && (
          <div className="map-toolbar">
            <button className={`btn btn-icon${mode === 'paint'  ? ' map-mode-active' : ''}`} onClick={() => setMode('paint')}>Paint</button>
            {mode === 'paint' && (
              <>
                <button className={`btn btn-icon${paintType === 'floor' ? ' map-mode-active' : ''}`} onClick={() => setPaintType('floor')}>Floor</button>
                <button className={`btn btn-icon${paintType === 'wall'  ? ' map-mode-active' : ''}`} onClick={() => setPaintType('wall')}>Wall</button>
              </>
            )}
            <button className={`btn btn-icon${mode === 'reveal' ? ' map-mode-active' : ''}`} onClick={() => setMode('reveal')}>Reveal</button>
            <button className={`btn btn-icon${mode === 'token'  ? ' map-mode-active' : ''}`} onClick={() => setMode('token')}>Token</button>
            <button
              className="btn btn-ghost"
              style={{ marginLeft: 'auto', fontSize: '0.8rem' }}
              onClick={() => { if (window.confirm('Reset the entire map?')) socket.emit('map:reset') }}
            >Reset</button>
          </div>
        )}
      </div>

      {isDM && mode === 'token' && (
        <div className="token-selector">
          {allTokens.length === 0
            ? <span className="token-none">No players or NPCs in room yet</span>
            : allTokens.map(t => {
                const key = `${t.type}-${t.id}`
                const isSel = selectedToken?.type === t.type && String(selectedToken?.id) === String(t.id)
                return (
                  <button
                    key={key}
                    className={`token-chip${isSel ? ' token-chip-selected' : ''}`}
                    onClick={() => setSelectedToken(isSel ? null : t)}
                  >
                    <span className="token-chip-dot" style={{ background: t.color }} />
                    {t.name}
                    {t.type === 'npc' && <span className="token-chip-tag">NPC</span>}
                  </button>
                )
              })
          }
        </div>
      )}

      <div
        className="map-grid"
        style={{ '--cols': map.width }}
        onDragStart={e => e.preventDefault()}
      >
        {map.cells.map((cell, i) => {
          const visible = isDM || cell.revealed
          let cls = 'map-cell'
          if (!visible) cls += ' map-fog'
          else {
            cls += cell.type === 'wall' ? ' map-wall' : ' map-floor'
            if (isDM && !cell.revealed) cls += ' map-unrevealed'
          }
          if (isDM) cls += ' map-interactive'

          return (
            <div
              key={i}
              className={cls}
              onMouseDown={() => handleMouseDown(i)}
              onMouseEnter={() => handleMouseEnter(i)}
            >
              {visible && cell.token && (
                <div
                  className="map-token"
                  style={{ background: cell.token.color }}
                  title={cell.token.name}
                >
                  {cell.token.name[0].toUpperCase()}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {isDM && (
        <p className="map-hint">
          {mode === 'paint'  && `Click or drag to paint ${paintType} cells`}
          {mode === 'reveal' && 'Click or drag to toggle tile visibility for players'}
          {mode === 'token'  && (selectedToken
            ? `Click a tile to place ${selectedToken.name} — click their tile again to remove`
            : 'Select a token above, then click a tile to place it')}
        </p>
      )}
    </div>
  )
}
