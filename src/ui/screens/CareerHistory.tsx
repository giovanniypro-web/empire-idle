import { useEffect, useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { loadMetaGame } from '../../core/engine/saveSystem'
import type { MetaState } from '../../core/entities'
import { formatMoney } from '../utils/format'
import './CareerHistory.css'

export default function CareerHistory() {
  const [metaState, setMetaState] = useState<MetaState | null>(null)
  const [loading, setLoading] = useState(true)
  const setScreen = useGameStore(s => s.setScreen)

  useEffect(() => {
    const meta = loadMetaGame()
    setMetaState(meta)
    setLoading(false)
  }, [])

  if (loading) {
    return <div className="career-history-loading">Chargement...</div>
  }

  if (!metaState) {
    return (
      <div className="career-history">
        <div className="career-container">
          <h1 className="career-title">📊 Historique de Carrière</h1>
          <p className="career-empty">Aucune carrière enregistrée. Commencez une nouvelle aventure!</p>
        </div>
      </div>
    )
  }

  const { careerStats, prestigeBank } = metaState
  const totalPlaytimeHours = Math.floor(careerStats.totalPlaytime / 3600000)
  const totalPlaytimeMinutes = Math.floor((careerStats.totalPlaytime % 3600000) / 60000)

  return (
    <div className="career-history">
      <div className="career-container">
        <h1 className="career-title">📊 Historique de Carrière</h1>

        {/* Career Summary Section */}
        <div className="career-section">
          <h2 className="section-title">Statistiques Globales</h2>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-label">Carrières Complétées</div>
              <div className="stat-value">{careerStats.totalRunsCompleted}</div>
            </div>

            <div className="stat-box">
              <div className="stat-label">Temps de Jeu Total</div>
              <div className="stat-value">
                {totalPlaytimeHours}h {totalPlaytimeMinutes}m
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-label">Argent Total Généré</div>
              <div className="stat-value">{formatMoney(careerStats.totalMoneyEarned)}</div>
            </div>

            <div className="stat-box">
              <div className="stat-label">Prestige Total Acquis</div>
              <div className="stat-value prestige-highlight">✨ {Math.floor(careerStats.totalPrestigeEarned)}</div>
            </div>

            <div className="stat-box">
              <div className="stat-label">Meilleur Niveau</div>
              <div className="stat-value">{careerStats.bestRunLevel}</div>
            </div>

            <div className="stat-box">
              <div className="stat-label">Meilleure Somme Générée</div>
              <div className="stat-value">{formatMoney(careerStats.bestRunMoney)}</div>
            </div>

            <div className="stat-box">
              <div className="stat-label">Plus Grand Prestige</div>
              <div className="stat-value prestige-highlight">✨ {Math.floor(careerStats.bestRunPrestige)}</div>
            </div>

            <div className="stat-box">
              <div className="stat-label">Employés Engagés</div>
              <div className="stat-value">{careerStats.totalEmployeesHired}</div>
            </div>
          </div>
        </div>

        {/* Prestige Bank Section */}
        <div className="career-section">
          <h2 className="section-title">Banque de Prestige</h2>
          <div className="prestige-bank-box">
            <div className="prestige-total">
              <span className="prestige-label">Prestige Disponible :</span>
              <span className="prestige-amount">✨ {Math.floor(prestigeBank.totalPoints)}</span>
            </div>
            <p className="prestige-info">
              Utilisez vos points de prestige pour déverrouiller des bonus permanents qui s'appliquent à toutes les futures carrières.
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setScreen('prestigeUpgrades')}
              style={{ marginTop: 12, width: '100%', background: 'linear-gradient(135deg, #d4af37 0%, #e6c200 100%)', color: '#000' }}
            >
              🌳 Accéder à l'Arbre de Prestige
            </button>
          </div>
        </div>

        {/* Prestige Resets History Section */}
        {careerStats.prestigeResets.length > 0 && (
          <div className="career-section">
            <h2 className="section-title">Carrières Antérieures ({careerStats.prestigeResets.length})</h2>
            <div className="resets-list">
              {careerStats.prestigeResets.map((reset, idx) => {
                const date = new Date(reset.timestamp)
                const dateStr = date.toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <div key={idx} className="reset-item">
                    <div className="reset-header">
                      <div className="reset-company">{reset.companyName}</div>
                      <div className="reset-prestige">✨ +{Math.floor(reset.prestigeEarned)}</div>
                    </div>
                    <div className="reset-details">
                      <span className="detail-item">Niveau {reset.finalLevel}</span>
                      <span className="detail-item">{formatMoney(reset.finalMoney)}</span>
                      <span className="detail-item detail-date">{dateStr}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {careerStats.prestigeResets.length === 0 && careerStats.totalRunsCompleted === 0 && (
          <div className="career-section">
            <p className="career-empty-secondary">
              Vos premières carrières apparaîtront ici une fois que vous aurez complété une première aventure avec un prestige reset.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
