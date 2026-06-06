import { useState } from 'react'

const DICE = [4, 6, 8, 10, 12, 20, 100]

export default function DiceRoller({ onRoll, error, onClearError }) {
  const [notation, setNotation] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const val = notation.trim()
    if (val) { onRoll(val); setNotation('') }
  }

  return (
    <section className="section">
      <div className="section-title">Roll Dice</div>

      <div className="dice-grid">
        {DICE.map(sides => (
          <button key={sides} className="btn btn-dice" onClick={() => onRoll(`1d${sides}`)}>
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
          onChange={e => { setNotation(e.target.value); onClearError() }}
        />
        <button type="submit" className="btn btn-primary">Roll</button>
      </form>

      {error && <div className="error-msg">{error}</div>}
    </section>
  )
}
