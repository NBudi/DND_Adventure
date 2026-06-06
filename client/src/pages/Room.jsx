import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import socket from '../socket'
import PlayerList from '../components/PlayerList'
import DiceRoller from '../components/DiceRoller'
import RollLog from '../components/RollLog'
import DMPanel from '../components/DMPanel'
import CharacterModal from '../components/CharacterModal'

export default function Room() {
  const { code }      = useParams()
  const navigate      = useNavigate()
  const requestedName = sessionStorage.getItem('playerName') || 'Adventurer'
  const roomCode      = code.toUpperCase()

  const [myName,      setMyName]      = useState(requestedName)
  const [players,     setPlayers]     = useState([])
  const [log,         setLog]         = useState([])
  const [error,       setError]       = useState('')
  const [copied,      setCopied]      = useState(false)
  const [dmName,      setDmName]      = useState(null)
  const [isDM,        setIsDM]        = useState(false)
  const [hiddenRolls, setHiddenRolls] = useState([])
  const [lastTotal,   setLastTotal]   = useState(null)
  const [characters,  setCharacters]  = useState({})
  const [viewingChar, setViewingChar] = useState(null)

  const joined    = useRef(false)
  const myNameRef = useRef(requestedName)

  useEffect(() => {
    if (joined.current) return
    joined.current = true

    socket.connect()
    socket.emit('join', { roomCode, playerName: requestedName })

    socket.on('init', ({ you, players, log, dm }) => {
      setMyName(you)
      myNameRef.current = you
      setPlayers(players)
      setLog(log)
      setDmName(dm)
      if (dm === you) setIsDM(true)
    })

    socket.on('roll:result', entry => {
      setLog(prev => [...prev, entry])
      if (entry.player === myNameRef.current) setLastTotal(entry.total)
    })

    socket.on('system', ({ msg, players, ts, type }) => {
      if (players) setPlayers(players)
      setLog(prev => [...prev, { type: type || 'system', msg, ts }])
    })

    socket.on('dm-update', ({ dm, players }) => {
      setDmName(dm)
      setPlayers(players)
      setIsDM(prev => prev)  // isDM only set by own claim
    })

    socket.on('roll:hidden', entry => {
      setHiddenRolls(prev => [...prev, entry])
    })

    socket.on('hidden-removed', ({ id }) => {
      setHiddenRolls(prev => prev.filter(r => r.id !== id))
    })

    socket.on('log:cleared', () => setLog([]))

    socket.on('error', ({ msg }) => setError(msg))

    return () => {
      socket.off('init')
      socket.off('roll:result')
      socket.off('system')
      socket.off('dm-update')
      socket.off('roll:hidden')
      socket.off('hidden-removed')
      socket.off('log:cleared')
      socket.off('error')
      socket.disconnect()
      joined.current = false
    }
  }, [roomCode, requestedName])

  useEffect(() => {
    fetch('/api/characters')
      .then(r => r.json())
      .then(list => {
        const map = {}
        list.forEach(c => { if (c.playerName) map[c.playerName] = c })
        setCharacters(map)
      })
      .catch(() => {})
  }, [])

  function sendRoll(notation) {
    setError('')
    setLastTotal(null)
    socket.emit('roll', { notation })
  }

  function claimDM() {
    socket.emit('claim-dm')
    setIsDM(true)
    setDmName(myName)
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
      <CharacterModal char={viewingChar} onClose={() => setViewingChar(null)} />
      <header className="header">
        <div className="room-info">
          <span className="label">Room</span>
          <span className="room-code">{roomCode}</span>
          <button className="btn btn-icon" onClick={copyCode}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
          {dmName && (
            <span className="dm-badge">
              ⚔ {isDM ? 'You are DM' : `${dmName} is DM`}
            </span>
          )}
        </div>
        <div className="player-badge">Playing as <strong>{myName}</strong></div>
        <Link to="/" className="btn btn-ghost">Leave</Link>
        <button className="btn btn-ghost" onClick={logout}>Sign Out</button>
      </header>

      <div className="room-layout">
        <aside className="panel-left">
          <PlayerList players={players} myName={myName} dmName={dmName} characters={characters} onViewChar={setViewingChar} />

          {!dmName && !isDM && (
            <div className="section">
              <button className="btn btn-ghost btn-claim-dm" onClick={claimDM}>
                ⚔ Claim DM Role
              </button>
            </div>
          )}

          {isDM
            ? <DMPanel hiddenRolls={hiddenRolls} />
            : <DiceRoller onRoll={sendRoll} error={error} onClearError={() => setError('')} lastTotal={lastTotal} />
          }

          {isDM && (
            <div className="section">
              <DiceRoller onRoll={sendRoll} error={error} onClearError={() => setError('')} lastTotal={lastTotal} />
            </div>
          )}
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
