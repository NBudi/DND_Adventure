import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  return Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

export default function Home() {
  const [code, setCode] = useState(randomCode)
  const navigate = useNavigate()
  const playerName = sessionStorage.getItem('playerName') || 'Adventurer'

  function handleSubmit(e) {
    e.preventDefault()
    const c = code.trim().toUpperCase()
    if (!c) return
    navigate(`/room/${c}`)
  }

  function logout() {
    sessionStorage.removeItem('playerName')
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

        <form onSubmit={handleSubmit}>
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
                onChange={e =>
                  setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
                }
              />
              <button type="button" className="btn btn-ghost" onClick={() => setCode(randomCode())}>
                New
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary enter-btn">
            Enter the Room
          </button>
        </form>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          <Link to="/character" className="btn btn-ghost" style={{ flex: 1, textAlign: 'center' }}>
            My Character
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
