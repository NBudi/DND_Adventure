import { useState } from 'react'
import socket from '../socket'

export default function NPCPanel({ npcs }) {
  const [name, setName] = useState('')

  function handleAdd(e) {
    e.preventDefault()
    const n = name.trim()
    if (!n) return
    socket.emit('npc:add', { name: n })
    setName('')
  }

  return (
    <section className="section">
      <div className="section-title">NPC Characters</div>

      {npcs.length > 0 && (
        <ul className="npc-list">
          {npcs.map(npc => (
            <li key={npc.id} className="npc-item">
              <span className="npc-token" style={{ background: npc.color }}>
                {npc.name[0].toUpperCase()}
              </span>
              <span className="npc-name">{npc.name}</span>
              <button
                className="btn btn-icon npc-remove"
                title="Remove NPC"
                onClick={() => socket.emit('npc:remove', { id: npc.id })}
              >×</button>
            </li>
          ))}
        </ul>
      )}

      <form className="npc-add-form" onSubmit={handleAdd}>
        <input
          className="input"
          placeholder="NPC name…"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ fontSize: '13px' }}
        />
        <button type="submit" className="btn btn-ghost" style={{ whiteSpace: 'nowrap' }}>
          Add NPC
        </button>
      </form>
    </section>
  )
}
