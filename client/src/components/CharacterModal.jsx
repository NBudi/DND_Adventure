import CharacterCard from './CharacterCard'

export default function CharacterModal({ char, onClose }) {
  if (!char) return null

  return (
    <div className="char-modal-overlay" onClick={onClose}>
      <div className="char-modal" onClick={e => e.stopPropagation()}>
        <div className="char-modal-header">
          <span className="char-modal-title">
            {char.playerName ? `${char.playerName}'s Character` : 'Character Sheet'}
          </span>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>
        <div className="char-modal-body">
          <CharacterCard char={char} editable={false} />
        </div>
      </div>
    </div>
  )
}
