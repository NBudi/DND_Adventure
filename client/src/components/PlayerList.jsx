export default function PlayerList({ players, myName, dmName, characters, onViewChar }) {
  return (
    <section className="section">
      <div className="section-title">Players Online</div>
      <ul className="player-list">
        {players.map(p => (
          <li key={p} className={`player-item${p === myName ? ' me' : ''}`}>
            <span className="online-dot" />
            <span className="player-name">{p}{p === myName ? ' (you)' : ''}</span>
            {p === dmName && <span className="dm-crown"> ⚔</span>}
            {characters?.[p] && (
              <button className="btn btn-icon sheet-btn" onClick={() => onViewChar(characters[p])}>
                Sheet
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
