export default function PlayerList({ players, myName, dmName }) {
  return (
    <section className="section">
      <div className="section-title">Players Online</div>
      <ul className="player-list">
        {players.map(p => (
          <li key={p} className={`player-item${p === myName ? ' me' : ''}`}>
            <span className="online-dot" />
            {p}{p === myName ? ' (you)' : ''}
            {p === dmName && <span className="dm-crown"> ⚔</span>}
          </li>
        ))}
      </ul>
    </section>
  )
}
