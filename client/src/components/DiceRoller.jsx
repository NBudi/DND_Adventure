import { useState, useRef, useEffect } from 'react'

const DICE = [4, 6, 8, 10, 12, 20, 100]

export default function DiceRoller({ onRoll, onHiddenRoll, error, onClearError, lastTotal }) {
  const [notation,  setNotation]  = useState('')
  const [rolling,   setRolling]   = useState(false)
  const [cooldown,  setCooldown]  = useState(0)
  const [dispNum,   setDispNum]   = useState(20)
  const [settled,   setSettled]   = useState(false)
  const [isHidden,  setIsHidden]  = useState(false)
  const [npcName,   setNpcName]   = useState('')
  const cycleRef     = useRef(null)
  const cooldownRef  = useRef(null)
  const lastTotalRef = useRef(null)

  const isDM = Boolean(onHiddenRoll)

  useEffect(() => { lastTotalRef.current = lastTotal }, [lastTotal])
  useEffect(() => () => {
    clearInterval(cycleRef.current)
    clearInterval(cooldownRef.current)
  }, [])

  function triggerRoll(n) {
    if (rolling) return
    lastTotalRef.current = null
    if (isHidden && onHiddenRoll) {
      onHiddenRoll(n, npcName.trim() || null)
    } else {
      onRoll(n)
    }

    setSettled(false)
    setDispNum(Math.ceil(Math.random() * 20))
    cycleRef.current = setInterval(() => {
      setDispNum(Math.ceil(Math.random() * 20))
    }, 75)
    setTimeout(() => {
      clearInterval(cycleRef.current)
      if (lastTotalRef.current !== null) setDispNum(lastTotalRef.current)
      setSettled(true)
    }, 1400)

    setRolling(true)
    setCooldown(3)
    let rem = 3
    cooldownRef.current = setInterval(() => {
      rem -= 1
      setCooldown(rem)
      if (rem <= 0) {
        clearInterval(cooldownRef.current)
        setRolling(false)
      }
    }, 1000)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const val = notation.trim()
    if (val && !rolling) { triggerRoll(val); setNotation('') }
  }

  const rollIsHidden = isDM && isHidden

  return (
    <section className="section">
      <div className="section-title">Roll Dice</div>

      {isDM && (
        <div className="dm-toggle" style={{ marginBottom: '8px' }}>
          <button
            className={`btn dm-toggle-btn${!isHidden ? ' active' : ''}`}
            onClick={() => setIsHidden(false)}
          >Public</button>
          <button
            className={`btn dm-toggle-btn${isHidden ? ' active' : ''}`}
            onClick={() => setIsHidden(true)}
          >Hidden</button>
        </div>
      )}

      {rollIsHidden && (
        <input
          className="input"
          style={{ marginBottom: '6px', fontSize: '13px' }}
          placeholder="NPC / Monster name (optional)"
          value={npcName}
          onChange={e => setNpcName(e.target.value)}
        />
      )}

      <div className={`dice-anim-wrap${rolling ? ' rolling' : ''}`}>
        <div className={`dice-face${settled ? ' settled' : ''}`}>{dispNum}</div>
      </div>

      <div className="dice-grid">
        {DICE.map(sides => (
          <button
            key={sides}
            className="btn btn-dice"
            disabled={rolling}
            onClick={() => triggerRoll(`1d${sides}`)}
          >
            d{sides}
          </button>
        ))}
      </div>

      <form className="roll-form" onSubmit={handleSubmit}>
        <input
          className="input"
          type="text"
          placeholder="e.g. 2d6+3"
          autoComplete="off"
          spellCheck="false"
          value={notation}
          disabled={rolling}
          onChange={e => { setNotation(e.target.value); onClearError() }}
        />
        <button type="submit" className={`btn ${rollIsHidden ? 'btn-dm' : 'btn-primary'}`} disabled={rolling}>
          {rolling ? `${cooldown}s` : (rollIsHidden ? 'Hide' : 'Roll')}
        </button>
      </form>

      {error && <div className="error-msg">{error}</div>}
    </section>
  )
}
