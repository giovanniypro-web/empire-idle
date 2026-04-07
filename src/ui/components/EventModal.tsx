import { useGameStore } from '../../store/gameStore'

export default function EventModal() {
  const activeEvent  = useGameStore(s => s.activeEvent)
  const resolveEvent = useGameStore(s => s.resolveEvent)

  if (!activeEvent) return null

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-icon">{activeEvent.icon}</div>
        <div className="modal-title">{activeEvent.title}</div>
        <div className="modal-desc">{activeEvent.description}</div>

        <div className="modal-choices">
          {activeEvent.choices.map(choice => (
            <button
              key={choice.id}
              className="modal-choice-btn"
              onClick={() => resolveEvent(choice.id)}
            >
              <div>{choice.label}</div>
              {choice.lesson && (
                <div style={{
                  marginTop: 5,
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  borderTop: '1px solid var(--border)',
                  paddingTop: 4,
                }}>
                  💡 {choice.lesson}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
