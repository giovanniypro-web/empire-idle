import { useState } from 'react'
import type { CompanyTypeId, MarketSegmentId } from '../../core/entities'
import { COMPANY_TYPES } from '../../core/data/companyTypes'
import { MARKET_SEGMENTS } from '../../core/data/marketSegments'
import { useGameStore } from '../../store/gameStore'

type Step = 'type' | 'segment' | 'confirm'

export function CompanySetup() {
  const completeSetup = useGameStore(s => s.completeSetup)
  const updateProfile = useGameStore(s => s.updateProfile)

  const [step, setStep] = useState<Step>('type')
  const [selectedType, setSelectedType] = useState<CompanyTypeId | null>(null)
  const [selectedSegment, setSelectedSegment] = useState<MarketSegmentId | null>(null)
  const [companyName, setCompanyName] = useState('Ma Startup')
  const [playerName, setPlayerName] = useState('Joueur')

  const typeDef = COMPANY_TYPES.find(t => t.id === selectedType)
  const segDef = MARKET_SEGMENTS.find(s => s.id === selectedSegment)

  function handleConfirm() {
    if (!selectedType || !selectedSegment) return
    updateProfile({ playerName, companyName })
    completeSetup(selectedType, selectedSegment)
  }

  return (
    <div className="setup-overlay">
      <div className="setup-modal">
        {/* Progress bar */}
        <div className="setup-steps">
          {(['type', 'segment', 'confirm'] as Step[]).map((s, i) => (
            <div key={s} className={`setup-step ${step === s ? 'active' : ''} ${
              (step === 'segment' && i === 0) || (step === 'confirm' && i < 2) ? 'done' : ''
            }`}>
              <span className="step-num">{i + 1}</span>
              <span className="step-label">
                {s === 'type' ? 'Type d\'entreprise' : s === 'segment' ? 'Marché cible' : 'Lancement'}
              </span>
            </div>
          ))}
        </div>

        {/* ── STEP 1: Company Type ── */}
        {step === 'type' && (
          <div className="setup-content">
            <h2>Quel type d'entreprise allez-vous construire ?</h2>
            <p className="setup-subtitle">
              Ce choix est <strong>permanent</strong> et définit votre identité pour toute la partie.
            </p>
            <div className="type-grid">
              {COMPANY_TYPES.map(t => (
                <button
                  key={t.id}
                  className={`type-card ${selectedType === t.id ? 'selected' : ''}`}
                  onClick={() => setSelectedType(t.id)}
                >
                  <span className="type-icon">{t.icon}</span>
                  <div className="type-info">
                    <strong>{t.name}</strong>
                    <em>{t.tagline}</em>
                    <p>{t.description}</p>
                    <div className="type-tags">
                      {t.bonuses.map(b => (
                        <span key={b} className="tag tag-bonus">✅ {b}</span>
                      ))}
                      {t.penalties.map(p => (
                        <span key={p} className="tag tag-penalty">⚠️ {p}</span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="setup-actions">
              <button
                className="btn-primary"
                disabled={!selectedType}
                onClick={() => setStep('segment')}
              >
                Suivant →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Market Segment ── */}
        {step === 'segment' && (
          <div className="setup-content">
            <h2>Quel est votre marché cible au départ ?</h2>
            <p className="setup-subtitle">
              Vous pourrez changer de segment en cours de partie si vous en remplissez les conditions.
            </p>
            <div className="segment-grid">
              {MARKET_SEGMENTS.map(seg => {
                const locked = false // at start, students & general_public are accessible
                return (
                  <button
                    key={seg.id}
                    className={`segment-card ${selectedSegment === seg.id ? 'selected' : ''}`}
                    onClick={() => setSelectedSegment(seg.id)}
                  >
                    <span className="seg-icon">{seg.icon}</span>
                    <div className="seg-info">
                      <strong>{seg.name}</strong>
                      <p>{seg.description}</p>
                      <div className="seg-mult">
                        Revenus ×{seg.revenueMultiplier.toFixed(2)}
                      </div>
                      <div className="seg-reqs">
                        {seg.popularityRequirement > 0 && (
                          <span>⚡ {seg.popularityRequirement} pop</span>
                        )}
                        {seg.reputationRequirement > 0 && (
                          <span>🏆 {seg.reputationRequirement} rep</span>
                        )}
                        {seg.prestigeRequirement > 0 && (
                          <span>✨ {seg.prestigeRequirement} prestige</span>
                        )}
                      </div>
                      <ul className="seg-highlights">
                        {seg.highlights.map(h => <li key={h}>{h}</li>)}
                      </ul>
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="setup-actions">
              <button className="btn-ghost" onClick={() => setStep('type')}>← Retour</button>
              <button
                className="btn-primary"
                disabled={!selectedSegment}
                onClick={() => setStep('confirm')}
              >
                Suivant →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Confirm & Name ── */}
        {step === 'confirm' && typeDef && segDef && (
          <div className="setup-content">
            <h2>Prêt à lancer votre empire ?</h2>
            <div className="confirm-summary">
              <div className="confirm-card">
                <span>{typeDef.icon}</span>
                <div>
                  <strong>{typeDef.name}</strong>
                  <p>{typeDef.tagline}</p>
                </div>
              </div>
              <div className="confirm-card">
                <span>{segDef.icon}</span>
                <div>
                  <strong>{segDef.name}</strong>
                  <p>Revenus ×{segDef.revenueMultiplier.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="setup-names">
              <label>
                Votre nom (CEO)
                <input
                  type="text"
                  value={playerName}
                  maxLength={30}
                  onChange={e => setPlayerName(e.target.value)}
                />
              </label>
              <label>
                Nom de l'entreprise
                <input
                  type="text"
                  value={companyName}
                  maxLength={40}
                  onChange={e => setCompanyName(e.target.value)}
                />
              </label>
            </div>

            <div className="pedagogy-box">
              <strong>💡 Conseil pédagogique</strong>
              <p>
                Chaque type d'entreprise implique un modèle économique différent. Une <em>Agence
                digitale</em> vit de sa réputation ; une <em>Boutique e-commerce</em> mise sur la
                popularité et le volume. Comprenez votre moteur de revenus avant de dépenser.
              </p>
            </div>

            <div className="setup-actions">
              <button className="btn-ghost" onClick={() => setStep('segment')}>← Retour</button>
              <button
                className="btn-primary btn-launch"
                onClick={handleConfirm}
              >
                🚀 Lancer mon empire
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
