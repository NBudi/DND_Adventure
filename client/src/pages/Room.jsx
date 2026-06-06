import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import socket from '../socket'
import PlayerList from '../components/PlayerList'
import DiceRoller from '../components/DiceRoller'
import RollLog from '../components/RollLog'
import DMPanel from '../components/DMPanel'
import CharacterModal from '../components/CharacterModal'
import MapPanel from '../components/MapPanel'
import NPCPanel from '../components/NPCPanel'
import PartyPanel from '../components/PartyPanel'

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
  const [playerChars, setPlayerChars] = useState({})
  const [viewingChar, setViewingChar] = useState(null)
  const [map,         setMap]         = useState(null)
  const [npcs,        setNpcs]        = useState([])

  const joined    = useRef(false)
  const myNameRef = useRef(requestedName)

  useEffect(() => {
    if (joined.current) return
    joined.current = true

    // Fetch selected character then connect
    const username      = sessionStorage.getItem('playerUsername')
    const selectedCharId = sessionStorage.getItem('selectedCharId')
    async function connect() {
      let character = null
      if (username) {
        try {
          const list = await fetch(`/api/characters/${username}`).then(r => r.json())
          if (Array.isArray(list)) {
            character = list.find(c => String(c.id) === selectedCharId) || list[0] || null
          }
        } catch {}
      }
      socket.connect()
      socket.emit('join', { roomCode, playerName: requestedName, character })
    }
    connect()

    socket.on('init', ({ you, players, log, dm, map, npcs, playerChars }) => {
      setMyName(you)
      myNameRef.current = you
      setPlayers(players)
      setLog(log)
      setDmName(dm)
      setMap(map)
      setNpcs(npcs || [])
      setPlayerChars(playerChars || {})

      localStorage.setItem('dndRoom', roomCode)

      if (dm === you) {
        setIsDM(true)
      } else if (!dm && localStorage.getItem('dndIsDM') === 'true') {
        socket.emit('claim-dm')
        setIsDM(true)
        setDmName(you)
      }
    })

    socket.on('roll:result', entry => {
      setLog(prev => [...prev, entry])
      if (entry.player === myNameRef.current) setLastTotal(entry.total)
    })

    socket.on('system', ({ msg, players, ts, type, playerChars }) => {
      if (players) setPlayers(players)
      if (playerChars) setPlayerChars(playerChars)
      setLog(prev => [...prev, { type: type || 'system', msg, ts }])
    })

    socket.on('dm-update', ({ dm, players }) => {
      setDmName(dm)
      setPlayers(players)
    })

    socket.on('roll:hidden', entry => {
      setHiddenRolls(prev => [...prev, entry])
      setLastTotal(entry.total)
    })

    socket.on('hidden-removed', ({ id }) => {
      setHiddenRolls(prev => prev.filter(r => r.id !== id))
    })

    socket.on('log:cleared', () => setLog([]))
    socket.on('map:state', setMap)
    socket.on('npc:state', setNpcs)
    socket.on('error', ({ msg }) => setError(msg))

    return () => {
      socket.off('init')
      socket.off('roll:result')
      socket.off('system')
      socket.off('dm-update')
      socket.off('roll:hidden')
      socket.off('hidden-removed')
      socket.off('log:cleared')
      socket.off('map:state')
      socket.off('npc:state')
      socket.off('error')
      socket.disconnect()
      joined.current = false
    }
  }, [roomCode, requestedName])

  function sendRoll(notation) {
    setError('')
    setLastTotal(null)
    socket.emit('roll', { notation })
  }

  function sendHiddenRoll(notation, npcName) {
    setError('')
    setLastTotal(null)
    socket.emit('roll-hidden', { notation, npcName })
  }

  function handleReveal(id) {
    socket.emit('reveal-roll', { id })
  }

  function claimDM() {
    socket.emit('claim-dm')
    setIsDM(true)
    setDmName(myName)
    localStorage.setItem('dndIsDM', 'true')
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(roomCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  function leave() {
    localStorage.removeItem('dndIsDM')
    navigate('/')
  }

  function logout() {
    socket.disconnect()
    sessionStorage.removeItem('playerName')
    sessionStorage.removeItem('playerUsername')
    sessionStorage.removeItem('selectedCharId')
    localStorage.removeItem('dndRoom')
    localStorage.removeItem('dndIsDM')
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
        <button className="btn btn-ghost" onClick={leave}>Leave</button>
        <button className="btn btn-ghost" onClick={logout}>Sign Out</button>
      </header>

      <div className="room-layout">
        <aside className="panel-left">
          <PlayerList
            players={players}
            myName={myName}
            dmName={dmName}
            playerChars={playerChars}
            onViewChar={setViewingChar}
          />

          {!dmName && !isDM && (
            <div className="section">
              <button className="btn btn-ghost btn-claim-dm" onClick={claimDM}>
                ⚔ Claim DM Role
              </button>
            </div>
          )}

          {isDM && <NPCPanel npcs={npcs} />}
          {isDM && <DMPanel />}
          <DiceRoller
            onRoll={sendRoll}
            onHiddenRoll={isDM ? sendHiddenRoll : undefined}
            error={error}
            onClearError={() => setError('')}
            lastTotal={lastTotal}
          />
        </aside>

        <PartyPanel players={players} dmName={dmName} playerChars={playerChars} />

        <section className="panel-right">
          <div className="log-header">
            <div className="section-title" style={{ marginBottom: 0, borderBottom: 'none' }}>
              Roll Log
            </div>
          </div>
          <RollLog
            entries={log}
            myName={myName}
            hiddenRolls={isDM ? hiddenRolls : []}
            onReveal={isDM ? handleReveal : undefined}
          />
        </section>
      </div>

      {(isDM || map) && <MapPanel map={map} isDM={isDM} players={players} npcs={npcs} />}
    </div>
  )
}
