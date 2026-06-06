import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CharacterCard from '../components/CharacterCard'

export default function Players() {
  const [characters, setCharacters] = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    fetch('/api/characters')
      .then(r => r.json())
      .then(data => setCharacters(data.filter(c => c.characterName)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="sheet-body">
      <header className="header">
        <div className="room-info">
          <span className="room-code" style={{ fontSize: '1rem' }}>The Party</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/character" className="btn btn-ghost">My Sheet</Link>
          <Link to="/"          className="btn btn-ghost">Home</Link>
        </div>
      </header>

      <div className="sheet-content">
        {loading && <p style={{ color: 'var(--muted)', textAlign: 'center' }}>Loading…</p>}
        {!loading && characters.length === 0 && (
          <p style={{ color: 'var(--muted)', textAlign: 'center' }}>
            No characters yet — fill in your sheet first!
          </p>
        )}
        <div className="players-grid">
          {characters.map(c => (
            <CharacterCard key={c.username} char={c} editable={false} />
          ))}
        </div>
      </div>
    </div>
  )
}
