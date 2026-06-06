const STATS = ['str', 'dex', 'con', 'int', 'wis', 'cha']
const STAT_LABELS = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' }

const SKILLS = [
  { key: 'acrobatics',     label: 'Acrobatics',     stat: 'dex' },
  { key: 'animalHandling', label: 'Animal Handling', stat: 'wis' },
  { key: 'arcana',         label: 'Arcana',          stat: 'int' },
  { key: 'athletics',      label: 'Athletics',       stat: 'str' },
  { key: 'deception',      label: 'Deception',       stat: 'cha' },
  { key: 'history',        label: 'History',         stat: 'int' },
  { key: 'insight',        label: 'Insight',         stat: 'wis' },
  { key: 'intimidation',   label: 'Intimidation',    stat: 'cha' },
  { key: 'investigation',  label: 'Investigation',   stat: 'int' },
  { key: 'medicine',       label: 'Medicine',        stat: 'wis' },
  { key: 'nature',         label: 'Nature',          stat: 'int' },
  { key: 'perception',     label: 'Perception',      stat: 'wis' },
  { key: 'performance',    label: 'Performance',     stat: 'cha' },
  { key: 'persuasion',     label: 'Persuasion',      stat: 'cha' },
  { key: 'religion',       label: 'Religion',        stat: 'int' },
  { key: 'sleightOfHand',  label: 'Sleight of Hand', stat: 'dex' },
  { key: 'stealth',        label: 'Stealth',         stat: 'dex' },
  { key: 'survival',       label: 'Survival',        stat: 'wis' },
]

function mod(score) {
  const m = Math.floor((score - 10) / 2)
  return m >= 0 ? `+${m}` : `${m}`
}

function profBonus(level) {
  return Math.ceil(level / 4) + 1
}

export default function CharacterCard({ char, editable = false, onChange }) {
  function field(path, value) {
    onChange?.(path, value)
  }

  const prof = profBonus(char.level || 1)

  function skillBonus(skill) {
    const base = Math.floor(((char.stats?.[skill.stat] || 10) - 10) / 2)
    return char.skills?.[skill.key] ? base + prof : base
  }

  return (
    <div className="char-card">
      {/* Header */}
      <div className="char-header">
        {editable ? (
          <input
            className="input char-name-input"
            placeholder="Character Name"
            value={char.characterName || ''}
            onChange={e => field('characterName', e.target.value)}
          />
        ) : (
          <div className="char-name">{char.characterName || '(unnamed)'}</div>
        )}
        <div className="char-meta">
          {editable ? (
            <>
              <select className="input char-select" value={char.race || 'Human'} onChange={e => field('race', e.target.value)}>
                {['Aasimar','Dragonborn','Dwarf','Elf','Gnome','Half-Elf','Half-Orc','Halfling','Human','Tiefling'].map(r =>
                  <option key={r}>{r}</option>
                )}
              </select>
              <select className="input char-select" value={char.class || 'Fighter'} onChange={e => field('class', e.target.value)}>
                {['Barbarian','Bard','Cleric','Druid','Fighter','Monk','Paladin','Ranger','Rogue','Sorcerer','Warlock','Wizard'].map(c =>
                  <option key={c}>{c}</option>
                )}
              </select>
              <label className="char-level-label">Level
                <input
                  className="input char-level-input"
                  type="number" min={1} max={20}
                  value={char.level || 1}
                  onChange={e => field('level', Number(e.target.value))}
                />
              </label>
            </>
          ) : (
            <span>{char.race} {char.class} · Level {char.level}</span>
          )}
        </div>
      </div>

      {/* HP / AC / Proficiency */}
      <div className="char-vitals">
        <div className="vital-block">
          <div className="vital-label">HP</div>
          {editable ? (
            <div className="hp-row">
              <input className="input vital-input" type="number" min={0}
                value={char.hp?.current ?? 10}
                onChange={e => field('hp.current', Number(e.target.value))} />
              <span>/</span>
              <input className="input vital-input" type="number" min={1}
                value={char.hp?.max ?? 10}
                onChange={e => field('hp.max', Number(e.target.value))} />
            </div>
          ) : (
            <div className="vital-value">{char.hp?.current ?? '—'} / {char.hp?.max ?? '—'}</div>
          )}
        </div>
        <div className="vital-block">
          <div className="vital-label">AC</div>
          {editable ? (
            <input className="input vital-input" type="number" min={1}
              value={char.ac ?? 10}
              onChange={e => field('ac', Number(e.target.value))} />
          ) : (
            <div className="vital-value">{char.ac ?? '—'}</div>
          )}
        </div>
        <div className="vital-block">
          <div className="vital-label">Prof Bonus</div>
          <div className="vital-value">+{prof}</div>
        </div>
      </div>

      {/* Ability Scores */}
      <div className="stats-grid">
        {STATS.map(s => (
          <div key={s} className="stat-block">
            <div className="stat-label">{STAT_LABELS[s]}</div>
            <div className="stat-mod">{mod(char.stats?.[s] || 10)}</div>
            {editable ? (
              <input
                className="input stat-input"
                type="number" min={1} max={30}
                value={char.stats?.[s] || 10}
                onChange={e => field(`stats.${s}`, Number(e.target.value))}
              />
            ) : (
              <div className="stat-score">{char.stats?.[s] || 10}</div>
            )}
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="section-title" style={{ marginTop: '1rem' }}>Skills</div>
      <div className="skills-grid">
        {SKILLS.map(sk => {
          const bonus = skillBonus(sk)
          const bonusStr = bonus >= 0 ? `+${bonus}` : `${bonus}`
          return (
            <label key={sk.key} className="skill-row">
              {editable ? (
                <input
                  type="checkbox"
                  checked={char.skills?.[sk.key] || false}
                  onChange={e => field(`skills.${sk.key}`, e.target.checked)}
                />
              ) : (
                <span className={`skill-dot ${char.skills?.[sk.key] ? 'proficient' : ''}`} />
              )}
              <span className="skill-bonus">{bonusStr}</span>
              <span className="skill-name">{sk.label}</span>
              <span className="skill-stat">({STAT_LABELS[sk.stat].toLowerCase()})</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
