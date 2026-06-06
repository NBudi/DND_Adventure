import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import socket from '../socket'
import PlayerList from '../components/PlayerList'
import DiceRoller from '../components/DiceRoller'
import RollLog from '../components/RollLog'

export default function Room() {
  const { code }      = useParams()
  const navigate      = useNavigate()
  const requestedName = sessionStorage.getItem('playerName') || 'Adventurer'
  const roomCode      = code.toUpperCase()

  const [myName,  setMyName]  = useState(requestedName)
  const [players, setPlayers] = useState([])
  const [log,     setLog]     = useState([])
  const [error,   setError]   = useState('')
  const [copied,  setCopied]  = useState(false)

  const joined = useRef(false)

  useEffect(() => {
    if (joined.current) return
    joined.current = true

    socket.connect()
    socket.emit('join', { roomCode, playerName: requestedName })

    socket.on('init', ({ you, players, log }) => {
      setMyName(you)
      setPlayers(players)
      setLog(log)
    })

    socket.on('roll:result', entry => {
      setLog(prev => [...prev, entry])
    })

    socket.on('system', ({ msg, players, ts }) => {
      if (players) setPlayers(players)
      setLog(prev => [...prev, { type: 'system', msg, ts }])
    })

    socket.on('error', ({ msg }) => setError(msg))

    return () => {
      socket.off('init')
      socket.off('roll:result')
      socket.off('system')
      socket.off('error')
      socket.disconnect()
      joined.current = false
    }
  }, [roomCode, requestedName])

  function sendRoll(notation) {
    setError('')
    socket.emit('roll', { notation })
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(roomCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  function logout() {
    socket.disconnect()
    sessionStorage.removeItem('playerName')
    navigate('/login')
  }

  return (
    <div className="room-body">
      <header className="header">
        <div className="room-info">
          <span className="label">Room</span>
          <span className="room-code">{roomCode}</span>
          <button className="btn btn-icon" onClick={copyCode}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="player-badge">
          Playing as <strong>{myName}</strong>
        </div>
        <Link to="/" className="btn btn-ghost">Leave</Link>
        <button className="btn btn-ghost" onClick={logout}>Sign Out</button>
      </header>

      <div className="room-layout">
        <aside className="panel-left">
          <PlayerList players={players} myName={myName} />
          <DiceRoller onRoll={sendRoll} error={error} onClearError={() => setError('')} />
        </aside>

        <section className="panel-right">
          <div className="log-header">
            <div className="section-title" style={{ marginBottom: 0, borderBottom: 'none' }}>
              Roll Log
            </div>
          </div>
          <RollLog entries={log} myName={myName} />
        </section>
      </div>
    </div>
  )
}
