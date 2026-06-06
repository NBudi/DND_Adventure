import { useEffect, useRef } from 'react'

export default function RollLog({ entries, myName, hiddenRolls = [], onReveal }) {
  const bottomRef = useRef(null)

  const allEntries = [
    ...entries.map(e => ({ ...e, _hidden: false })),
    ...hiddenRolls.map(r => ({ ...r, _hidden: true })),
  ].sort((a, b) => (a.ts || '').localeCompare(b.ts || ''))

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allEntries.length])

  return (
    <div className="log-body">
      {allEntries.map((entry, i) => {
        if (entry._hidden) {
          return (
            <div key={`h-${entry.id}`} className="log-entry log-hidden">
              <span className="ts">{entry.ts}</span>
              <span className="log-player">{entry.npcName || '[DM]'}</span>
              <span className="log-action"> rolled </span>
              <span className="log-notation">{entry.notation}</span>
              <span className="log-arrow"> &rarr; </span>
              <span className="log-total">{entry.total}</span>
              {entry.breakdown && <span className="log-breakdown"> ({entry.breakdown})</span>}
              <span className="hidden-badge">HIDDEN</span>
              {onReveal && (
                <button className="btn btn-reveal" onClick={() => onReveal(entry.id)}>Reveal</button>
              )}
            </div>
          )
        }

        if (entry.type === 'announce') {
          return (
            <div key={i} className="log-entry announce">
              {entry.ts && <span className="ts">{entry.ts}</span>}
              <span className="announce-icon">⚔</span>
              <span className="announce-msg">{entry.msg}</span>
            </div>
          )
        }

        if (entry.type === 'system') {
          return (
            <div key={i} className="log-entry system">
              {entry.ts && <span className="ts">{entry.ts}</span>}
              <span>{entry.msg}</span>
            </div>
          )
        }

        const isMe     = entry.player === myName
        const isCrit   = entry.sides === 20 && entry.rolls?.includes(20)
        const isFumble = entry.sides === 20 && entry.rolls?.includes(1)

        const classes = ['log-entry', isMe && 'mine', isCrit && 'crit', isFumble && 'fumble', entry.revealed && 'revealed']
          .filter(Boolean).join(' ')

        return (
          <div key={i} className={classes}>
            <span className="ts">{entry.ts}</span>
            <span className="log-player">{entry.player}</span>
            <span className="log-action"> rolled </span>
            <span className="log-notation">{entry.notation}</span>
            <span className="log-arrow"> &rarr; </span>
            <span className="log-total">{entry.total}</span>
            {entry.breakdown && <span className="log-breakdown"> ({entry.breakdown})</span>}
            {entry.revealed && <span className="reveal-badge">REVEALED</span>}
            {isCrit   && <span className="crit-badge">CRITICAL HIT</span>}
            {isFumble && <span className="fumble-badge">FUMBLE</span>}
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
