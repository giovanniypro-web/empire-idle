import { useGameStore } from '../../store/gameStore'
import { ACTIVITIES } from '../../core/data/activities'
import {
  getActivityCost,
  getActivityDuration,
  getActivityIncomePerCycle,
  isActivityAutomated,
  getActivitySkillMultiplier,
} from '../../core/systems/economySystem'
import { statIcon } from '../../core/systems/statsSystem'
import { formatMoney, formatTime } from '../utils/format'

const BUY_AMOUNTS = [1, 10, 25, 100]

export default function Activities() {
  const player         = useGameStore(s => s.player)
  const stats          = useGameStore(s => s.stats)
  const specialization = useGameStore(s => s.specialization)
  const activities     = useGameStore(s => s.activities)
  const upgrades       = useGameStore(s => s.upgrades)
  const employees      = useGameStore(s => s.employees)
  const inventory      = useGameStore(s => s.inventory)
  const activeEffects  = useGameStore(s => s.activeEffects)
  const departments    = useGameStore(s => s.departments)
  const buyActivity    = useGameStore(s => s.buyActivity)
  const clickActivity  = useGameStore(s => s.clickActivity)

  const now = Date.now()

  return (
    <div>
      <div className="screen-title">⚡ Activités</div>
      <div className="screen-subtitle">
        Lance des activités, automatise-les, multiplie-les. Chaque activité renforce une stat de gestion.
      </div>

      <div className="card-grid">
        {ACTIVITIES.map(def => {
          const act      = activities[def.id]
          const count    = act?.count ?? 0
          const locked   = def.unlockLevel > player.level
          const automated = isActivityAutomated(def.id, employees)
          const duration  = getActivityDuration(def.id, upgrades, employees)
          const income    = getActivityIncomePerCycle(def.id, Math.max(count, 1), upgrades, employees, inventory, activeEffects, now, stats, specialization, departments)
          const progress  = act?.isRunning ? Math.min(1, (act.progress ?? 0) / duration) : 0
          const cost1     = getActivityCost(def.id, count, specialization)

          // Stat affinity badge
          const affinityIcon = def.statAffinity !== 'neutral' ? statIcon(def.statAffinity) : null
          const affinityColor = def.statAffinity === 'popularity'
            ? 'var(--green)' : def.statAffinity === 'reputation'
            ? 'var(--blue)' : 'var(--text-muted)'

          return (
            <div key={def.id} className={`act-card ${locked ? 'locked' : ''}`}>
              <div className="act-card-top">
                <div className="act-icon">{def.icon}</div>
                <div className="act-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="act-name">{def.name}</div>
                    {affinityIcon && (
                      <span
                        title={`Renforce la ${def.statAffinity}`}
                        style={{ fontSize: 13, color: affinityColor, fontWeight: 600 }}
                      >
                        {affinityIcon}
                      </span>
                    )}
                  </div>
                  <div className="act-desc">{def.description}</div>
                </div>
                <div className="act-count">{count > 0 ? `×${count}` : '—'}</div>
              </div>

              {locked ? (
                <div style={{ fontSize: 12, color: 'var(--amber)' }}>
                  🔒 Débloqué au niveau {def.unlockLevel}
                </div>
              ) : (
                <>
                  <div className="act-stats">
                    <span>⏱ {formatTime(duration)}</span>
                    <span className="act-income">💰 {formatMoney(income)}/cycle</span>
                    {count > 0 && (
                      <span className="text-muted">≈ {formatMoney(income / duration)}/s</span>
                    )}
                    {automated
                      ? <span className="badge badge-auto">AUTO</span>
                      : count > 0
                        ? <span className="badge badge-blue">Manuel</span>
                        : null
                    }
                  </div>

                  {/* Phase 3: Skill requirement feedback */}
                  {def.skillRequired && (
                    <div style={{ fontSize: 11, marginTop: 8, padding: '6px 8px', background: 'var(--bg-deep)', borderRadius: 3 }}>
                      {(() => {
                        const activeEmps = Object.values(employees).filter(e => e.status === 'active' || e.status === 'onboarding')
                        const avgSkill = activeEmps.length > 0 ? activeEmps.reduce((s, e) => s + e.skill, 0) / activeEmps.length : 0
                        const skillMult = getActivitySkillMultiplier(def.id, employees)
                        const efficiencyPercent = Math.round(skillMult * 100)
                        const skillGap = def.skillRequired - avgSkill

                        return (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span>Compétence requise: {def.skillRequired}</span>
                              <span style={{ color: avgSkill >= def.skillRequired ? 'var(--green)' : 'var(--amber)' }}>
                                Équipe: {Math.round(avgSkill)}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Efficacité:</span>
                              <strong style={{ color: skillMult >= 1 ? 'var(--green)' : 'var(--amber)' }}>
                                {efficiencyPercent}%
                              </strong>
                            </div>
                            {skillGap > 0 && (
                              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                                💡 +{skillGap.toFixed(0)} compétence = +{(skillGap / 100 * 20).toFixed(0)}% revenus
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  )}

                  {count > 0 && (
                    <div className="prog-bar-outer">
                      <div
                        className={`prog-bar-inner ${automated ? 'prog-green' : 'prog-blue'}`}
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                  )}

                  <div className="act-buttons">
                    {count > 0 && !automated && (
                      <button
                        className="btn btn-blue btn-sm"
                        onClick={() => clickActivity(def.id)}
                        disabled={act?.isRunning}
                      >
                        {act?.isRunning ? '⏳ En cours…' : '▶ Lancer'}
                      </button>
                    )}

                    {BUY_AMOUNTS.map(qty => {
                      let totalCost = 0
                      for (let i = 0; i < qty; i++) {
                        totalCost += getActivityCost(def.id, count + i, specialization)
                      }
                      const canAfford = player.money >= totalCost
                      if (qty > 1 && !canAfford && count === 0) return null
                      return (
                        <button
                          key={qty}
                          className={`btn btn-sm ${qty === 1 ? 'btn-primary' : 'btn-secondary'}`}
                          disabled={!canAfford}
                          onClick={() => buyActivity(def.id, qty)}
                          title={`Coût total : ${formatMoney(totalCost)}`}
                        >
                          {qty === 1 ? (
                            <>Acheter <span className="text-green">{formatMoney(cost1)}</span></>
                          ) : (
                            <>×{qty} <span className={canAfford ? 'text-green' : ''}>{formatMoney(totalCost)}</span></>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
