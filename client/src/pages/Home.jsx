import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  return Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

export default function Home() {
  const savedRoom = localStorage.getItem('dndRoom')
  const [code,         setCode]         = useState(() => savedRoom || randomCode())
  const [myChars,      setMyChars]      = useState([])
  const [selectedChar, setSelectedChar] = useState(null)
  const [loading,      setLoading]      = useState(true)
  const navigate  = useNavigate()
  const username  = sessionStorage.getItem('playerUsername')
  const playerName = sessionStorage.getItem('playerName') || 'Adventurer'

  useEffect(() => {
    if (!username) { setLoading(false); return }
    fetch(`/api/characters/${username}`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : []
        setMyChars(list)
        const savedId = sessionStorage.getItem('selectedCharId')
        const found = list.find(c => String(c.id) === savedId)
        setSelectedChar(found || list[0] || null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [username])

  function selectChar(c) {
    setSelectedChar(c)
    sessionStorage.setItem('selectedCharId', String(c.id))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!selectedChar) return
    const c = code.trim().toUpperCase()
    if (!c) return
    navigate(`/room/${c}`)
  }

  function logout() {
    sessionStorage.removeItem('playerName')
    sessionStorage.removeItem('playerUsername')
    sessionStorage.removeItem('selectedCharId')
    localStorage.removeItem('dndRoom')
    localStorage.removeItem('dndIsDM')
    navigate('/login')
  }

  return (
    <div className="index-body">
      <div className="index-card">
        <div className="game-title">
          <h1>DND Adventure</h1>
          <p>Roll dice together, live</p>
        </div>

        <p style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          Playing as <strong>{playerName}</strong>
        </p>

        {loading ? (
          <p style={{ color: 'var(--muted)', textAlign: 'center', marginBottom: '1rem' }}>Loading characters…</p>
        ) : myChars.length === 0 ? (
          <div className="no-char-notice">
            <p>You need a character to enter a room.</p>
            <Link to="/character" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: '0.5rem' }}>
              Create a Character
            </Link>
          </div>
        ) : (
          <>
            <div className="char-selector">
              <div className="form-label" style={{ marginBottom: '6px' }}>Play as</div>
              {myChars.map(c => (
                <button
                  key={c.id}
                  className={`char-selector-btn${selectedChar?.id === c.id ? ' selected' : ''}`}
                  onClick={() => selectChar(c)}
                >
                  <span className="char-selector-name">{c.characterName}</span>
                  <span className="char-selector-meta">{c.race} {c.class} · Lv {c.level}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ marginTop: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="code">Room Code</label>
                <div className="code-row">
                  <input
                    className="input"
                    id="code"
                    type="text"
                    placeholder="XXXX"
                    maxLength={6}
                    required
                    autoComplete="off"
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  />
                  <button type="button" className="btn btn-ghost" onClick={() => setCode(randomCode())}>
                    New
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary enter-btn"
                disabled={!selectedChar}
              >
                Enter the Room
              </button>
            </form>
          </>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          <Link to="/character" className="btn btn-ghost" style={{ flex: 1, textAlign: 'center' }}>
            My Characters
          </Link>
          <Link to="/players" className="btn btn-ghost" style={{ flex: 1, textAlign: 'center' }}>
            The Party
          </Link>
        </div>

        <button
          type="button"
          className="btn btn-ghost"
          style={{ width: '100%', marginTop: '0.5rem' }}
          onClick={logout}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
