import { useState, useRef, useEffect } from 'react'

const DICE = [4, 6, 8, 10, 12, 20, 100]

export default function DiceRoller({ onRoll, error, onClearError, lastTotal }) {
  const [notation,  setNotation]  = useState('')
  const [rolling,   setRolling]   = useState(false)
  const [cooldown,  setCooldown]  = useState(0)
  const [dispNum,   setDispNum]   = useState(20)
  const [settled,   setSettled]   = useState(false)
  const cycleRef      = useRef(null)
  const cooldownRef   = useRef(null)
  const lastTotalRef  = useRef(null)

  // Keep ref in sync with prop so the settle timeout can read the latest value
  useEffect(() => { lastTotalRef.current = lastTotal }, [lastTotal])

  useEffect(() => () => {
    clearInterval(cycleRef.current)
    clearInterval(cooldownRef.current)
  }, [])

  function triggerRoll(notation) {
    if (rolling) return
    lastTotalRef.current = null   // clear stale result from previous roll
    onRoll(notation)

    // Cycle numbers rapidly for 1.4 s, then snap to actual result and stop
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

    // 3-second cooldown countdown
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

  return (
    <section className="section">
      <div className="section-title">Roll Dice</div>

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
        <button type="submit" className="btn btn-primary" disabled={rolling}>
          {rolling ? `${cooldown}s` : 'Roll'}
        </button>
      </form>

      {error && <div className="error-msg">{error}</div>}
    </section>
  )
}
