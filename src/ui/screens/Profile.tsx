import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { SPECIALIZATIONS } from '../../core/data/specializations'
import { ACTIVITIES } from '../../core/data/activities'
import { EMPLOYEES } from '../../core/data/employees'
import { AVATAR_LIST } from '../../core/entities'
import { BALANCE } from '../../core/data/balancing'
import StatBar from '../components/StatBar'
import { formatMoney, formatNumber } from '../utils/format'
import {
  getTotalIncomePerSecond,
  calculateTotalSalary,
} from '../../core/systems/economySystem'
import { getPortfolioValue } from '../../core/systems/stockSystem'

export default function Profile() {
  const player         = useGameStore(s => s.player)
  const stats          = useGameStore(s => s.stats)
  const profile        = useGameStore(s => s.profile)
  const specialization = useGameStore(s => s.specialization)
  const activities     = useGameStore(s => s.activities)
  const upgrades       = useGameStore(s => s.upgrades)
  const employees      = useGameStore(s => s.employees)
  const inventory      = useGameStore(s => s.inventory)
  const activeEffects  = useGameStore(s => s.activeEffects)
  const stocks         = useGameStore(s => s.stocks)
  const updateProfile  = useGameStore(s => s.updateProfile)
  const setSpecialization = useGameStore(s => s.setSpecialization)

  const [editingName, setEditingName]    = useState(false)
  const [editingCompany, setEditingCompany] = useState(false)
  const [tmpName, setTmpName]            = useState(profile.playerName)
  const [tmpCompany, setTmpCompany]      = useState(profile.companyName)
  const [showSpecModal, setShowSpecModal] = useState(false)

  const now = Date.now()
  const departments = useGameStore(s => s.departments)
  const grossIPS = getTotalIncomePerSecond(
    activities, upgrades, employees, inventory, activeEffects, now, stats, specialization, departments,
  )
  const salary    = calculateTotalSalary(employees, specialization)
  const netIPS    = grossIPS - salary
  const portfolio = getPortfolioValue(stocks)

  // V4: Count employees (excluding departed)
  const totalEmployees = Object.values(employees).filter(e => e.status !== 'departed').length

  // Best activity by total earned
  const bestActivity = ACTIVITIES
    .map(a => ({ def: a, earned: activities[a.id]?.totalEarned ?? 0 }))
    .filter(a => a.earned > 0)
    .sort((a, b) => b.earned - a.earned)[0]

  const activeSpec = SPECIALIZATIONS.find(s => s.id === specialization)
  const canChooseSpec = player.level >= BALANCE.SPECIALIZATION_UNLOCK_LEVEL

  return (
    <div>
      <div className="screen-title">👤 Profil CEO</div>
      <div className="screen-subtitle">Ton identité entrepreneuriale et la stratégie de ton empire.</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* ── Left column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Identity card */}
          <div className="card">
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              {/* Avatar picker */}
              <div>
                <div style={{
                  fontSize: 52,
                  lineHeight: 1,
                  cursor: 'pointer',
                  background: 'var(--bg-card2)',
                  borderRadius: 'var(--radius)',
                  padding: 12,
                  border: '1px solid var(--border)',
                  textAlign: 'center',
                }}>
                  {AVATAR_LIST[profile.avatarIndex]}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8, maxWidth: 160 }}>
                  {AVATAR_LIST.map((av, i) => (
                    <button
                      key={i}
                      onClick={() => updateProfile({ avatarIndex: i })}
                      style={{
                        fontSize: 20,
                        padding: 4,
                        background: i === profile.avatarIndex ? 'var(--green-glow)' : 'transparent',
                        border: `1px solid ${i === profile.avatarIndex ? 'var(--green)' : 'transparent'}`,
                        borderRadius: 6,
                        cursor: 'pointer',
                      }}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1 }}>
                {/* Player name */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>CEO</div>
                  {editingName ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        className="qty-input"
                        style={{ width: '100%' }}
                        value={tmpName}
                        onChange={e => setTmpName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            updateProfile({ playerName: tmpName })
                            setEditingName(false)
                          }
                          if (e.key === 'Escape') setEditingName(false)
                        }}
                        autoFocus
                      />
                      <button className="btn btn-primary btn-sm" onClick={() => {
                        updateProfile({ playerName: tmpName })
                        setEditingName(false)
                      }}>✓</button>
                    </div>
                  ) : (
                    <div
                      style={{ fontSize: 20, fontWeight: 700, cursor: 'pointer' }}
                      onClick={() => { setTmpName(profile.playerName); setEditingName(true) }}
                      title="Cliquer pour modifier"
                    >
                      {profile.playerName} ✏️
                    </div>
                  )}
                </div>

                {/* Company name */}
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Entreprise</div>
                  {editingCompany ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        className="qty-input"
                        style={{ width: '100%' }}
                        value={tmpCompany}
                        onChange={e => setTmpCompany(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            updateProfile({ companyName: tmpCompany })
                            setEditingCompany(false)
                          }
                          if (e.key === 'Escape') setEditingCompany(false)
                        }}
                        autoFocus
                      />
                      <button className="btn btn-primary btn-sm" onClick={() => {
                        updateProfile({ companyName: tmpCompany })
                        setEditingCompany(false)
                      }}>✓</button>
                    </div>
                  ) : (
                    <div
                      style={{ fontSize: 16, fontWeight: 600, cursor: 'pointer', color: 'var(--green)' }}
                      onClick={() => { setTmpCompany(profile.companyName); setEditingCompany(true) }}
                      title="Cliquer pour modifier"
                    >
                      {profile.companyName} ✏️
                    </div>
                  )}
                </div>

                <div className="level-badge" style={{ display: 'inline-flex', marginTop: 12 }}>
                  Niveau {player.level}
                </div>
              </div>
            </div>
          </div>

          {/* Business stats */}
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 14 }}>
              📊 Indicateurs de gestion
            </div>
            <StatBar stat="popularity"   value={stats.popularity} />
            <StatBar stat="reputation"   value={stats.reputation} />
            <StatBar stat="satisfaction" value={stats.satisfaction} />
          </div>

          {/* Specialization */}
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>
              🎯 Orientation stratégique
            </div>
            {!canChooseSpec ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                🔒 Débloqué au niveau {BALANCE.SPECIALIZATION_UNLOCK_LEVEL}. Continue à progresser !
              </div>
            ) : activeSpec ? (
              <div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 28 }}>{activeSpec.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--blue)' }}>{activeSpec.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{activeSpec.description}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Avantages</div>
                    {activeSpec.bonuses.map((b, i) => (
                      <div key={i} style={{ fontSize: 12, color: 'var(--green)', marginBottom: 2 }}>✓ {b}</div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Contraintes</div>
                    {activeSpec.penalties.map((p, i) => (
                      <div key={i} style={{ fontSize: 12, color: 'var(--amber)', marginBottom: 2 }}>△ {p}</div>
                    ))}
                  </div>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowSpecModal(true)}
                >
                  Changer d'orientation
                </button>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 12 }}>
                  Tu peux choisir une orientation stratégique. Ce choix donne de vrais bonus et contraintes.
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowSpecModal(true)}
                >
                  🎯 Choisir mon orientation
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Key metrics */}
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 14 }}>📈 Métriques clés</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Trésorerie', value: formatMoney(player.money), color: 'var(--green)' },
                { label: 'Total gagné', value: formatMoney(player.totalEarned), color: 'var(--text-pri)' },
                { label: 'Revenus bruts', value: `${formatMoney(grossIPS)}/s`, color: 'var(--green)' },
                { label: 'Charges salariales', value: `-${formatMoney(salary)}/s`, color: 'var(--red)' },
                { label: 'Résultat net', value: `${netIPS >= 0 ? '+' : ''}${formatMoney(netIPS)}/s`, color: netIPS >= 0 ? 'var(--green)' : 'var(--red)' },
                { label: 'Portefeuille', value: formatMoney(portfolio), color: 'var(--blue)' },
                { label: 'Employés', value: `${totalEmployees}`, color: 'var(--text-pri)' },
                { label: 'XP total', value: formatNumber(player.xp), color: 'var(--blue)' },
              ].map(m => (
                <div key={m.label} className="stat-card">
                  <div className="stat-card-label">{m.label}</div>
                  <div className="stat-card-value" style={{ color: m.color, fontSize: 16 }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Best activity */}
          {bestActivity && (
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>🏆 Activité star</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 32 }}>{bestActivity.def.icon}</span>
                <div>
                  <div style={{ fontWeight: 600 }}>{bestActivity.def.name}</div>
                  <div style={{ color: 'var(--green)', fontSize: 15, fontWeight: 700 }}>
                    {formatMoney(bestActivity.earned)} générés
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    ×{activities[bestActivity.def.id]?.count ?? 0} unités
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pedagogical insight panel */}
          <div className="card" style={{ borderColor: 'var(--blue-dim)' }}>
            <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14, color: 'var(--blue)' }}>
              💡 Logique entrepreneuriale
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-sec)', lineHeight: 1.7 }}>
              {salary > 0 && netIPS < 0 && (
                <div style={{ color: 'var(--amber)', marginBottom: 8 }}>
                  ⚠️ Tes charges dépassent tes revenus passifs. Développe plus d'activités
                  automatisées avant d'embaucher davantage.
                </div>
              )}
              {salary > 0 && netIPS > 0 && (
                <div style={{ color: 'var(--green)', marginBottom: 8 }}>
                  ✓ Ton empire est rentable. Résultat net positif = capacité à réinvestir.
                </div>
              )}
              {stats.satisfaction < 40 && (
                <div style={{ color: 'var(--amber)', marginBottom: 8 }}>
                  ⚠️ Satisfaction faible. Tes clients risquent de partir. Priorise les événements
                  qui boostent la fidélisation.
                </div>
              )}
              {stats.reputation < 30 && (
                <div style={{ color: 'var(--amber)', marginBottom: 8 }}>
                  ⚠️ Réputation fragile. Les activités B2B sont moins efficaces. Investis dans
                  des upgrades qualitatifs.
                </div>
              )}
              {player.level < BALANCE.SPECIALIZATION_UNLOCK_LEVEL && (
                <div style={{ marginBottom: 8 }}>
                  📌 À niveau {BALANCE.SPECIALIZATION_UNLOCK_LEVEL}, tu pourras choisir une
                  orientation stratégique qui donnera un avantage distinct à ton empire.
                </div>
              )}
              {!activeSpec && canChooseSpec && (
                <div style={{ color: 'var(--purple)', marginBottom: 8 }}>
                  🎯 Tu peux maintenant choisir ton orientation ! C'est un choix stratégique important.
                </div>
              )}
              <div style={{ color: 'var(--text-muted)' }}>
                Revenus bruts vs net : penser en termes de marge nette, pas seulement de chiffre d'affaires,
                est fondamental pour la pérennité d'une entreprise.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specialization modal */}
      {showSpecModal && (
        <div className="modal-overlay" onClick={() => setShowSpecModal(false)}>
          <div
            className="modal-box"
            style={{ maxWidth: 640 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-title">🎯 Choisir ton orientation stratégique</div>
            <div className="modal-desc">
              Chaque spécialisation donne de vrais avantages ET de vraies contraintes.
              Il n'y a pas de meilleur choix — seulement des stratégies différentes.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SPECIALIZATIONS.filter(s => player.level >= s.unlockLevel).map(spec => (
                <button
                  key={spec.id}
                  className={`modal-choice-btn ${specialization === spec.id ? 'active' : ''}`}
                  style={{
                    borderColor: specialization === spec.id ? 'var(--green)' : undefined,
                    textAlign: 'left',
                  }}
                  onClick={() => {
                    setSpecialization(spec.id)
                    setShowSpecModal(false)
                  }}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 20 }}>{spec.icon}</span>
                    <strong>{spec.name}</strong>
                    {specialization === spec.id && <span style={{ color: 'var(--green)', fontSize: 12 }}>(actuel)</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                    {spec.description}
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div>
                      {spec.bonuses.map((b, i) => (
                        <div key={i} style={{ fontSize: 11, color: 'var(--green)' }}>✓ {b}</div>
                      ))}
                    </div>
                    <div>
                      {spec.penalties.map((p, i) => (
                        <div key={i} style={{ fontSize: 11, color: 'var(--amber)' }}>△ {p}</div>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginTop: 12 }}
              onClick={() => setShowSpecModal(false)}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
