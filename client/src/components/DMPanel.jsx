import { useState } from 'react'
import socket from '../socket'

export default function DMPanel() {
  const [announce, setAnnounce] = useState('')

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

      <button className="btn btn-danger" style={{ width: '100%' }} onClick={handleClearLog}>
        Clear Roll Log
      </button>
    </section>
  )
}
