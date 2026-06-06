import { useState, useRef, useEffect } from 'react'
import socket from '../socket'

export default function MapPanel({ map, isDM }) {
  const [mode,      setMode]      = useState('reveal')  // 'paint' | 'reveal'
  const [paintType, setPaintType] = useState('wall')    // 'floor' | 'wall'
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

  function applyCell(index) {
    if (mode === 'paint') {
      socket.emit('map:set-cell', { index, type: paintType })
    } else {
      const target = dragRef.current.revealTarget
      const revealed = target !== null ? target : !map.cells[index].revealed
      socket.emit('map:reveal-cell', { index, revealed })
    }
  }

  function handleMouseDown(index) {
    if (!isDM) return
    if (mode === 'reveal') {
      dragRef.current.revealTarget = !map.cells[index].revealed
    }
    dragRef.current.active = true
    applyCell(index)
  }

  function handleMouseEnter(index) {
    if (!isDM || !dragRef.current.active) return
    applyCell(index)
  }

  return (
    <div className="map-section">
      <div className="map-header">
        <span className="section-title" style={{ marginBottom: 0, borderBottom: 'none' }}>Map</span>
        {isDM && (
          <div className="map-toolbar">
            <button
              className={`btn btn-icon${mode === 'paint' ? ' map-mode-active' : ''}`}
              onClick={() => setMode('paint')}
            >Paint</button>
            {mode === 'paint' && (
              <>
                <button
                  className={`btn btn-icon${paintType === 'floor' ? ' map-mode-active' : ''}`}
                  onClick={() => setPaintType('floor')}
                >Floor</button>
                <button
                  className={`btn btn-icon${paintType === 'wall' ? ' map-mode-active' : ''}`}
                  onClick={() => setPaintType('wall')}
                >Wall</button>
              </>
            )}
            <button
              className={`btn btn-icon${mode === 'reveal' ? ' map-mode-active' : ''}`}
              onClick={() => setMode('reveal')}
            >Reveal</button>
            <button
              className="btn btn-ghost"
              style={{ marginLeft: 'auto', fontSize: '0.8rem' }}
              onClick={() => { if (window.confirm('Reset the entire map?')) socket.emit('map:reset') }}
            >Reset</button>
          </div>
        )}
      </div>

      <div
        className="map-grid"
        style={{ '--cols': map.width }}
        onDragStart={e => e.preventDefault()}
      >
        {map.cells.map((cell, i) => {
          const visible = isDM || cell.revealed
          let cls = 'map-cell'
          if (!visible) {
            cls += ' map-fog'
          } else {
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
            />
          )
        })}
      </div>

      {isDM && (
        <p className="map-hint">
          {mode === 'paint'
            ? `Click or drag to paint ${paintType} cells`
            : 'Click or drag to toggle cell visibility for players'}
        </p>
      )}
    </div>
  )
}
