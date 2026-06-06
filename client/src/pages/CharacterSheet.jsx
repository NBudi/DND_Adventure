import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CharacterCard from '../components/CharacterCard'

const BLANK = {
  characterName: '',
  race: 'Human',
  class: 'Fighter',
  level: 1,
  hp: { current: 10, max: 10 },
  ac: 10,
  stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  skills: {
    acrobatics: false, animalHandling: false, arcana: false,
    athletics: false, deception: false, history: false,
    insight: false, intimidation: false, investigation: false,
    medicine: false, nature: false, perception: false,
    performance: false, persuasion: false, religion: false,
    sleightOfHand: false, stealth: false, survival: false,
  },
}

function isComplete(c) {
  return (
    c.characterName?.trim().length > 0 &&
    Number(c.hp?.max) >= 1 &&
    Number(c.ac) >= 1 &&
    ['str','dex','con','int','wis','cha'].every(s => Number(c.stats?.[s]) >= 1)
  )
}

function setNested(obj, path, value) {
  const keys = path.split('.')
  const result = { ...obj }
  let cur = result
  for (let i = 0; i < keys.length - 1; i++) {
    cur[keys[i]] = { ...cur[keys[i]] }
    cur = cur[keys[i]]
  }
  cur[keys[keys.length - 1]] = value
  return result
}

export default function CharacterSheet() {
  const username = sessionStorage.getItem('playerUsername')
  const [chars,   setChars]   = useState([])
  const [editing, setEditing] = useState(null)
  const [isNew,   setIsNew]   = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [status,  setStatus]  = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!username) { setLoading(false); return }
    fetch(`/api/characters/${username}`)
      .then(r => r.json())
      .then(data => setChars(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [username])

  function startNew() {
    setEditing({ ...BLANK, id: Date.now() })
    setIsNew(true)
  }

  function startEdit(char) {
    setEditing({ ...char })
    setIsNew(false)
  }

  function handleChange(path, value) {
    setEditing(prev => setNested(prev, path, value))
  }

  async function handleSave() {
    if (!isComplete(editing)) return
    setSaving(true)
    const updated = isNew
      ? [...chars, editing]
      : chars.map(c => c.id === editing.id ? editing : c)
    const res = await fetch(`/api/characters/${username}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    if (res.ok) {
      setChars(updated)
      setEditing(null)
      setStatus('Saved!')
      setTimeout(() => setStatus(''), 2000)
    }
    setSaving(false)
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this character?')) return
    const updated = chars.filter(c => c.id !== id)
    await fetch(`/api/characters/${username}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    setChars(updated)
  }

  if (loading) return (
    <div className="index-body">
      <p style={{ color: 'var(--muted)', textAlign: 'center' }}>Loading…</p>
    </div>
  )

  return (
    <div className="sheet-body">
      <header className="header">
        <div className="room-info">
          <span className="room-code" style={{ fontSize: '1rem' }}>
            {editing ? (isNew ? 'New Character' : 'Edit Character') : 'My Characters'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {status && <span style={{ color: 'var(--gold)', fontSize: '0.9rem' }}>{status}</span>}
          {editing
            ? <button className="btn btn-ghost" onClick={() => setEditing(null)}>← Back</button>
            : <Link to="/" className="btn btn-ghost">Home</Link>
          }
        </div>
      </header>

      <div className="sheet-content">
        {editing ? (
          <>
            <CharacterCard char={editing} editable onChange={handleChange} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                className="btn btn-primary save-btn"
                onClick={handleSave}
                disabled={saving || !isComplete(editing)}
              >
                {saving ? 'Saving…' : 'Save Character'}
              </button>
              {!isComplete(editing) && (
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  Fill in name, HP, AC, and all 6 stats to save
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="char-manager">
            {chars.length === 0 && (
              <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
                You have no characters yet. Create one to enter a room.
              </p>
            )}
            <div className="char-slot-list">
              {chars.map(c => (
                <div key={c.id} className="char-slot">
                  <div className="char-slot-info">
                    <span className="char-slot-name">{c.characterName || '(unnamed)'}</span>
                    <span className="char-slot-meta">{c.race} {c.class} · Lv {c.level}</span>
                    <span className="char-slot-vitals">HP {c.hp?.max} · AC {c.ac}</span>
                  </div>
                  <div className="char-slot-actions">
                    <button className="btn btn-ghost" onClick={() => startEdit(c)}>Edit</button>
                    <button className="btn btn-icon" onClick={() => handleDelete(c.id)}>×</button>
                  </div>
                </div>
              ))}
            </div>
            {chars.length < 3 && (
              <button
                className="btn btn-ghost"
                style={{ width: '100%', marginTop: '0.75rem' }}
                onClick={startNew}
              >
                + Create New Character
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
