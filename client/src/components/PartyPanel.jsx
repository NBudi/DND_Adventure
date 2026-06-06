const STATS = ['str', 'dex', 'con', 'int', 'wis', 'cha']

function mod(val) {
  const m = Math.floor(((val ?? 10) - 10) / 2)
  return m >= 0 ? `+${m}` : String(m)
}

function skillLabel(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
}

export default function PartyPanel({ players, dmName, characters }) {
  const party = players.filter(p => p !== dmName)
  if (party.length === 0) return null

  return (
    <div className="panel-party">
      <div className="section-title">Party</div>
      {party.map(name => {
        const char = characters[name]
        if (!char) return (
          <div key={name} className="party-card">
            <div className="party-card-name">{name}</div>
            <div className="party-no-sheet">No character sheet</div>
          </div>
        )

        const activeSkills = Object.entries(char.skills || {})
          .filter(([, v]) => v)
          .map(([k]) => skillLabel(k))

        return (
          <div key={name} className="party-card">
            <div className="party-card-name">{char.characterName || name}</div>
            {char.characterName && <div className="party-card-sub">{name}</div>}
            <div className="party-card-meta">{char.race} {char.class} {char.level && `Lv${char.level}`}</div>

            <div className="party-vitals">
              <div className="party-vital">
                <span className="party-vital-val">{char.hp?.current ?? '?'}/{char.hp?.max ?? '?'}</span>
                <span className="party-vital-label">HP</span>
              </div>
              <div className="party-vital">
                <span className="party-vital-val">{char.ac ?? '?'}</span>
                <span className="party-vital-label">AC</span>
              </div>
            </div>

            <div className="party-stats">
              {STATS.map(s => (
                <div key={s} className="party-stat">
                  <div className="party-stat-mod">{mod(char.stats?.[s])}</div>
                  <div className="party-stat-val">{char.stats?.[s] ?? 10}</div>
                  <div className="party-stat-key">{s.toUpperCase()}</div>
                </div>
              ))}
            </div>

            {activeSkills.length > 0 && (
              <div className="party-skills">
                {activeSkills.map(s => (
                  <span key={s} className="party-skill-tag">{s}</span>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
