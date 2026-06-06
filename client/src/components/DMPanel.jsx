import { useState } from 'react'
import socket from '../socket'

export default function DMPanel({ hiddenRolls, onClearHidden }) {
  const [mode,     setMode]     = useState('hidden')   // 'hidden' | 'public'
  const [npcName,  setNpcName]  = useState('')
  const [notation, setNotation] = useState('')
  const [announce, setAnnounce] = useState('')
  const [error,    setError]    = useState('')

  function handleRoll(e) {
    e.preventDefault()
    const val = notation.trim()
    if (!val) return
    setError('')
    if (mode === 'hidden') {
      socket.emit('roll-hidden', { notation: val, npcName: npcName.trim() || null })
    } else {
      socket.emit('roll', { notation: val, npcName: npcName.trim() || null })
    }
    setNotation('')
  }

  function handleReveal(id) {
    socket.emit('reveal-roll', { id })
  }

  function handleAnnounce(e) {
    e.preventDefault()
    const msg = announce.trim()
    if (!msg) return
    socket.emit('announce', { msg })
    setAnnounce('')
  }

  function handleClearLog() {
    if (window.confirm('Clear the entire roll log for everyone?')) {
      socket.emit('clear-log')
    }
  }

  return (
    <section className="section dm-panel">
      <div className="section-title dm-title">⚔ Dungeon Master</div>

      {/* Roll mode toggle */}
      <div className="dm-toggle">
        <button
          className={`btn dm-toggle-btn ${mode === 'hidden' ? 'active' : ''}`}
          onClick={() => setMode('hidden')}
        >Hidden Roll</button>
        <button
          className={`btn dm-toggle-btn ${mode === 'public' ? 'active' : ''}`}
          onClick={() => setMode('public')}
        >Public Roll</button>
      </div>

      {/* NPC name */}
      <input
        className="input"
        style={{ marginBottom: '6px', fontSize: '13px' }}
        placeholder="NPC / Monster name (optional)"
        value={npcName}
        onChange={e => setNpcName(e.target.value)}
      />

      {/* Roll form */}
      <form className="roll-form" onSubmit={handleRoll}>
        <input
          className="input"
          type="text"
          placeholder="e.g. 2d6+3"
          autoComplete="off"
          spellCheck="false"
          value={notation}
          onChange={e => { setNotation(e.target.value); setError('') }}
        />
        <button type="submit" className={`btn ${mode === 'hidden' ? 'btn-dm' : 'btn-primary'}`}>
          {mode === 'hidden' ? 'Hide' : 'Roll'}
        </button>
      </form>

      {error && <div className="error-msg">{error}</div>}

      {/* Hidden rolls list */}
      {hiddenRolls.length > 0 && (
        <div className="hidden-rolls">
          <div className="dm-sub-label">Hidden Rolls</div>
          {hiddenRolls.map(r => (
            <div key={r.id} className="hidden-roll-row">
              <span className="ts">{r.ts}</span>
              {r.npcName && <span className="hidden-npc">{r.npcName} · </span>}
              <span className="log-notation">{r.notation}</span>
              <span className="log-arrow"> → </span>
              <span className="log-total">{r.total}</span>
              <span className="hidden-breakdown"> ({r.breakdown})</span>
              <button className="btn btn-reveal" onClick={() => handleReveal(r.id)}>Reveal</button>
            </div>
          ))}
        </div>
      )}

      <div className="dm-divider" />

      {/* Announcement */}
      <div className="dm-sub-label">Announcement</div>
      <form onSubmit={handleAnnounce}>
        <textarea
          className="input dm-announce"
          placeholder="Narrate a scene, trigger an event…"
          value={announce}
          onChange={e => setAnnounce(e.target.value)}
          rows={3}
        />
        <button type="submit" className="btn btn-ghost" style={{ width: '100%', marginTop: '4px' }}>
          Send to Room
        </button>
      </form>

      <div className="dm-divider" />

      {/* Clear log */}
      <button className="btn btn-danger" style={{ width: '100%' }} onClick={handleClearLog}>
        Clear Roll Log
      </button>
    </section>
  )
}
