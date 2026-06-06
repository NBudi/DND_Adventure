import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CharacterCard from '../components/CharacterCard'

const DEFAULT = {
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

function setNestedValue(obj, path, value) {
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
  const [char,    setChar]    = useState(DEFAULT)
  const [saved,   setSaved]   = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/character/${username}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data && Object.keys(data).length) setChar(data) })
      .finally(() => setLoading(false))
  }, [username])

  function handleChange(path, value) {
    setChar(prev => setNestedValue(prev, path, value))
    setSaved(false)
  }

  async function handleSave() {
    await fetch(`/api/character/${username}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(char),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <div className="index-body"><p style={{color:'var(--muted)',textAlign:'center'}}>Loading…</p></div>

  return (
    <div className="sheet-body">
      <header className="header">
        <div className="room-info">
          <span className="room-code" style={{ fontSize: '1rem' }}>My Character</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/players" className="btn btn-ghost">All Players</Link>
          <Link to="/"        className="btn btn-ghost">Home</Link>
        </div>
      </header>

      <div className="sheet-content">
        <CharacterCard char={char} editable onChange={handleChange} />

        <button className="btn btn-primary save-btn" onClick={handleSave}>
          {saved ? 'Saved!' : 'Save Character'}
        </button>
      </div>
    </div>
  )
}
