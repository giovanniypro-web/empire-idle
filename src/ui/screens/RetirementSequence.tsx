import { useGameStore } from '../../store/gameStore'
import { formatMoney } from '../utils/format'
import './RetirementSequence.css'

// Calculate prestige value based on player achievements
function calculatePrestigeValue(gameState: any): number {
  const basePrestige = gameState.player.level * 10
  const moneyBonus = Math.floor(gameState.player.money / 1000)
  const statsBonus = Math.floor(
    (gameState.stats.popularity + gameState.stats.reputation + gameState.stats.satisfaction) / 30
  )
  const missionBonus = Object.values(gameState.missions).filter((m: any) => m.completed).length * 5
  const employeeBonus = Object.keys(gameState.employees).length * 3

  return basePrestige + moneyBonus + statsBonus + missionBonus + employeeBonus
}

export default function RetirementSequence() {
  const gameState = useGameStore()
  const prestigeReset = useGameStore(s => s.prestigeReset)
  const setScreen = useGameStore(s => s.setScreen)

  const prestigeValue = calculatePrestigeValue(gameState)

  const handleRetire = () => {
    prestigeReset(prestigeValue)
    setScreen('dashboard')
  }

  const handleContinue = () => {
    setScreen('dashboard')
  }

  return (
    <div className="retirement-sequence">
      <div className="retirement-container">
        <h1 className="retirement-title">🏛️ Retraite Honorifique</h1>

        <div className="retirement-content">
          <div className="retirement-stats">
            <h2>{gameState.profile.companyName}</h2>
            <p className="company-summary">
              Votre empire a atteint le niveau <strong>{gameState.player.level}</strong>
            </p>

            <div className="achievement-grid">
              <div className="achievement-item">
                <div className="achievement-label">Argent Généré</div>
                <div className="achievement-value">{formatMoney(gameState.player.totalEarned)}</div>
              </div>

              <div className="achievement-item">
                <div className="achievement-label">Popularité</div>
                <div className="achievement-value">{Math.floor(gameState.stats.popularity)}</div>
              </div>

              <div className="achievement-item">
                <div className="achievement-label">Réputation</div>
                <div className="achievement-value">{Math.floor(gameState.stats.reputation)}</div>
              </div>

              <div className="achievement-item">
                <div className="achievement-label">Employés Engagés</div>
                <div className="achievement-value">{Object.keys(gameState.employees).length}</div>
              </div>

              <div className="achievement-item">
                <div className="achievement-label">Missions Complétées</div>
                <div className="achievement-value">
                  {Object.values(gameState.missions).filter((m: any) => m.completed).length}
                </div>
              </div>

              <div className="achievement-item">
                <div className="achievement-label">Durée de Jeu</div>
                <div className="achievement-value">
                  {Math.floor((Date.now() - gameState.gameStarted) / 60000)} min
                </div>
              </div>
            </div>
          </div>

          <div className="retirement-prestige-box">
            <h3>Prestige Acquis</h3>
            <div className="prestige-display">✨ {Math.floor(prestigeValue)} points</div>
            <p className="prestige-description">
              Votre héritage entrepreneurial sera enregistré. Ces points de prestige déverrouillent des bonus permanents pour les futures carrières.
            </p>
          </div>

          <div className="retirement-message">
            <p>
              Vous avez brillamment dirigé <strong>{gameState.profile.companyName}</strong>.
              Êtes-vous prêt à transmettre le flambeau et à commencer une nouvelle carrière avec les bonus acquis?
            </p>
          </div>

          <div className="retirement-actions">
            <button className="btn btn-primary" onClick={handleRetire}>
              🚀 Débuter une Nouvelle Carrière ({Math.floor(prestigeValue)} prestige)
            </button>
            <button className="btn btn-secondary" onClick={handleContinue}>
              ← Continuer l'Aventure Actuelle
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
