import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  return Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

export default function Home() {
  const [name, setName] = useState('')
  const [code, setCode] = useState(randomCode)
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    const n = name.trim()
    const c = code.trim().toUpperCase()
    if (!n || !c) return
    navigate(`/room/${c}?name=${encodeURIComponent(n)}`)
  }

  return (
    <div className="index-body">
      <div className="index-card">
        <div className="game-title">
          <h1>DND Adventure</h1>
          <p>Roll dice together, live</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Your Name</label>
            <input
              className="input"
              id="name"
              type="text"
              placeholder="Adventurer"
              maxLength={20}
              required
              autoComplete="off"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

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
      </div>
    </div>
  )
}
