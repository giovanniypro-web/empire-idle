import { useGameStore } from '../../store/gameStore'
import { ACTIVITIES } from '../../core/data/activities'
import { MISSIONS } from '../../core/data/missions'
import { ASSETS } from '../../core/data/assets'
import { BALANCE } from '../../core/data/balancing'
import DepartmentCard from '../components/DepartmentCard'
import { DEPARTMENTS } from '../../core/data/departments'
import {
  getTotalIncomePerSecond,
  getActivityIncomePerCycle,
  getActivityDuration,
  isActivityAutomated,
  calculateTotalSalary,
  calculateSalaryByDepartment,
} from '../../core/systems/economySystem'
import { getPortfolioValue } from '../../core/systems/stockSystem'
import { getTotalDepartmentCostPerSecond } from '../../core/systems/departmentSystem'
import { COMPANY_TYPES } from '../../core/data/companyTypes'
import { MARKET_SEGMENTS } from '../../core/data/marketSegments'
import StatBar from '../components/StatBar'
import { formatMoney, formatTime } from '../utils/format'
import type { DepartmentId } from '../../core/entities'

export default function Dashboard() {
  const player         = useGameStore(s => s.player)
  const stats          = useGameStore(s => s.stats)
  const profile        = useGameStore(s => s.profile)
  const specialization = useGameStore(s => s.specialization)
  const companyType    = useGameStore(s => s.companyType)
  const marketSegment  = useGameStore(s => s.marketSegment)
  const activities     = useGameStore(s => s.activities)
  const upgrades       = useGameStore(s => s.upgrades)
  const employees      = useGameStore(s => s.employees)
  const inventory      = useGameStore(s => s.inventory)
  const activeEffects  = useGameStore(s => s.activeEffects)
  const stocks         = useGameStore(s => s.stocks)
  const missions       = useGameStore(s => s.missions)
  const departments    = useGameStore(s => s.departments)
  const ownedAssets    = useGameStore(s => s.ownedAssets)
  const resetGame      = useGameStore(s => s.resetGame)
  const setScreen      = useGameStore(s => s.setScreen)
  const gameStarted    = useGameStore(s => s.gameStarted)

  const now = Date.now()

  // Revenue
  const grossIPS = getTotalIncomePerSecond(
    activities, upgrades, employees, inventory, activeEffects, now, stats, specialization, departments,
  )

  // Charges
  const salary   = calculateTotalSalary(employees, specialization)
  const salaryByDept = calculateSalaryByDepartment(employees, specialization)
  const deptCost = getTotalDepartmentCostPerSecond(
    departments as Record<DepartmentId, import('../../core/entities').DepartmentState>,
  )
  const baseRent = BALANCE.BASE_RENT_PER_SEC *
    Math.pow(BALANCE.RENT_LEVEL_MULTIPLIER, player.level - 1)

  // Asset passive income
  let assetPassive = 0
  let assetMaint = 0
  for (const [assetId, qty] of Object.entries(ownedAssets)) {
    if (!qty) continue
    const a = ASSETS.find(x => x.id === assetId)
    if (a) {
      assetPassive += a.passiveIncome * (qty as number)
      assetMaint += a.maintenanceCost * (qty as number)
    }
  }

  // Asset value (purchase prices)
  const assetValue = Object.entries(ownedAssets).reduce((sum, [id, qty]) => {
    const a = ASSETS.find(x => x.id === id)
    return sum + (a ? a.price * (qty as number) : 0)
  }, 0)

  const totalCharges = salary + deptCost + baseRent + assetMaint
  const totalRevenues = grossIPS + assetPassive
  const netIPS = totalRevenues - totalCharges
  const portfolio = getPortfolioValue(stocks)

  const ownedActivities = ACTIVITIES.filter(a => (activities[a.id]?.count ?? 0) > 0)
  const pendingMissions = MISSIONS.filter(m => missions[m.id]?.completed && !missions[m.id]?.claimedReward)

  const elapsedMin = Math.floor((now - gameStarted) / 60000)
  const elapsedLabel = elapsedMin < 1
    ? 'Démarrage'
    : elapsedMin < 60
    ? `${elapsedMin} min`
    : `${Math.floor(elapsedMin / 60)}h${elapsedMin % 60 > 0 ? ` ${elapsedMin % 60}min` : ''}`

  const isUnderwater = netIPS < 0
  const typeDef   = COMPANY_TYPES.find(t => t.id === companyType)
  const segDef    = MARKET_SEGMENTS.find(s => s.id === marketSegment)
  const canChooseSpec = player.level >= BALANCE.SPECIALIZATION_UNLOCK_LEVEL && !specialization

  return (
    <div>
      {/* Header identity */}
      <div className="screen-title">
        {typeDef?.icon ?? '🏛️'} {profile.companyName}
      </div>
      <div className="screen-subtitle">
        CEO : {profile.playerName} · Niv. {player.level} · Actif depuis {elapsedLabel}
        {typeDef && <span style={{ marginLeft: 8 }}>· {typeDef.name}</span>}
        {segDef && <span style={{ marginLeft: 8 }}>· {segDef.icon} {segDef.name}</span>}
        {specialization && <span style={{ marginLeft: 8 }}>· 🎯 {specialization}</span>}
      </div>

      {/* Alerts */}
      {isUnderwater && (
        <div className="alert-card alert-red">
          <strong>⚠️ Résultat net négatif — Burn rate actif</strong>
          <p>
            Tes charges totales ({formatMoney(totalCharges)}/s) dépassent tes revenus ({formatMoney(totalRevenues)}/s).
            Développe des activités automatisées ou réduis tes coûts.
            <strong className="amber-text"> Clé : chiffre d'affaires ≠ rentabilité.</strong>
          </p>
        </div>
      )}
      {canChooseSpec && (
        <div className="alert-card alert-purple" style={{ cursor: 'pointer' }} onClick={() => setScreen('profile')}>
          <strong>🎯 Orientation stratégique disponible</strong>
          <p>Choisis ta spécialisation dans ton <strong>Profil CEO</strong>.</p>
        </div>
      )}

      {/* ── P&L Complet ─────────────────────────────────────────── */}
      <div className="pl-block">
        <div className="pl-section revenues">
          <div className="pl-header">📥 Revenus</div>
          <div className="pl-row">
            <span>Activités automatisées</span>
            <span className="green">+{formatMoney(grossIPS)}/s</span>
          </div>
          {assetPassive > 0 && (
            <div className="pl-row">
              <span>Revenus passifs (actifs)</span>
              <span className="green">+{formatMoney(assetPassive)}/s</span>
            </div>
          )}
          <div className="pl-row pl-total">
            <span>Total revenus</span>
            <span className="green">+{formatMoney(totalRevenues)}/s</span>
          </div>
        </div>

        <div className="pl-section charges">
          <div className="pl-header">📤 Charges</div>
          {salary > 0 && (
            <>
              <div className="pl-row">
                <span>Masse salariale</span>
                <span className="red">−{formatMoney(salary)}/s</span>
              </div>
              {Object.entries(salaryByDept).length > 0 && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 16, marginTop: 4 }}>
                  {Object.entries(salaryByDept).map(([deptId, cost]) => (
                    <div key={deptId} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>· {DEPARTMENTS.find(d => d.id === deptId)?.name || deptId}</span>
                      <span>−{formatMoney(cost)}/s</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {deptCost > 0 && (
            <div className="pl-row">
              <span>Coûts départements</span>
              <span className="red">−{formatMoney(deptCost)}/s</span>
            </div>
          )}
          {baseRent > 0 && (
            <div className="pl-row">
              <span>Loyer / structure</span>
              <span className="red">−{formatMoney(baseRent)}/s</span>
            </div>
          )}
          {assetMaint > 0 && (
            <div className="pl-row">
              <span>Maintenance actifs</span>
              <span className="red">−{formatMoney(assetMaint)}/s</span>
            </div>
          )}
          <div className="pl-row pl-total">
            <span>Total charges</span>
            <span className="red">−{formatMoney(totalCharges)}/s</span>
          </div>
        </div>

        <div className="pl-result">
          <span>Résultat net / sec</span>
          <strong className={netIPS >= 0 ? 'green' : 'red'}>
            {netIPS >= 0 ? '+' : ''}{formatMoney(netIPS)}/s
          </strong>
        </div>
      </div>

      {/* Department Effectiveness Overview */}
      {Object.keys(departments).length > 0 && (
        <div style={{ marginTop: 20, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>📊 Department Health</div>
          <div className="department-grid">
            {DEPARTMENTS.map(deptDef => (
              <DepartmentCard
                key={deptDef.id}
                deptId={deptDef.id}
                deptState={departments[deptDef.id as import('../../core/entities').DepartmentId] || { id: deptDef.id, level: 0, effectiveness: null }}
                employees={Object.values(employees)}
                onClick={() => setScreen('departments')}
              />
            ))}
          </div>
        </div>
      )}

      {/* Key KPIs */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-card-label">Trésorerie</div>
          <div className="stat-card-value green">{formatMoney(player.money)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Total généré</div>
          <div className="stat-card-value">{formatMoney(player.totalEarned)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Portefeuille bourse</div>
          <div className="stat-card-value blue">{formatMoney(portfolio)}</div>
        </div>
        {assetValue > 0 && (
          <div className="stat-card">
            <div className="stat-card-label">Valeur patrimoine</div>
            <div className="stat-card-value blue">{formatMoney(assetValue)}</div>
          </div>
        )}
        <div className="stat-card">
          <div className="stat-card-label">Prestige</div>
          <div className="stat-card-value" style={{ color: 'var(--purple)' }}>
            ✨ {stats.prestige.toFixed(1)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Clicks total</div>
          <div className="stat-card-value">{player.totalClicks.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginTop: 16 }}>

        {/* Active activities */}
        <div>
          {ownedActivities.length > 0 ? (
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>
                Activités en cours
              </div>
              {ownedActivities.map(def => {
                const act       = activities[def.id]
                const automated = isActivityAutomated(def.id, employees)
                const duration  = getActivityDuration(def.id, upgrades, employees)
                const progress  = act.isRunning ? Math.min(1, act.progress / duration) : 0
                const income    = getActivityIncomePerCycle(
                  def.id, act.count, upgrades, employees, inventory, activeEffects, now, stats, specialization, departments,
                )
                const ips = income / duration

                return (
                  <div key={def.id} className="mini-activity-row">
                    <span style={{ fontSize: 20 }}>{def.icon}</span>
                    <span style={{ flex: 1, fontWeight: 500 }}>{def.name}</span>
                    <span className="text-muted" style={{ fontSize: 12, marginRight: 8 }}>×{act.count}</span>
                    {automated
                      ? <span className="badge badge-auto" style={{ marginRight: 8 }}>AUTO</span>
                      : <span className="badge badge-blue" style={{ marginRight: 8 }}>MANUEL</span>
                    }
                    <div style={{ width: 80 }}>
                      <div className="prog-bar-outer">
                        <div
                          className={`prog-bar-inner ${automated ? 'prog-green' : 'prog-blue'}`}
                          style={{ width: `${progress * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-green" style={{ fontSize: 12, minWidth: 90, textAlign: 'right' }}>
                      {automated ? `${formatMoney(ips)}/s` : `${formatMoney(income)}/${formatTime(duration)}`}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 15 }}>🚀 Prêt à bâtir ton empire ?</div>
              <div style={{ fontSize: 13, color: 'var(--text-sec)', lineHeight: 1.7 }}>
                Commence dans <strong>Activités</strong> avec un kiosque à sodas.
                Lance des cycles manuellement, puis embauche pour automatiser.
                Chaque activité construit ta <span className="text-green">popularité</span> ou ta <span className="text-blue">réputation</span>.
              </div>
            </div>
          )}
        </div>

        {/* Stats + pending missions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>📊 Santé de l'empire</div>
            <StatBar stat="popularity"   value={stats.popularity} />
            <StatBar stat="reputation"   value={stats.reputation} />
            <StatBar stat="satisfaction" value={stats.satisfaction} />
            {stats.prestige > 0 && (
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span>✨ Prestige</span>
                <strong style={{ color: 'var(--purple)' }}>{stats.prestige.toFixed(1)}</strong>
              </div>
            )}
          </div>

          {pendingMissions.length > 0 && (
            <div
              className="card"
              style={{ borderColor: 'var(--amber)', cursor: 'pointer' }}
              onClick={() => setScreen('missions')}
            >
              <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--amber)' }}>
                🎯 {pendingMissions.length} récompense{pendingMissions.length > 1 ? 's' : ''} à réclamer
              </div>
              {pendingMissions.slice(0, 3).map(m => (
                <div key={m.id} style={{ fontSize: 12, color: 'var(--text-sec)', marginTop: 2 }}>
                  · {m.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Meta-progression actions */}
      <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        {player.level >= 25 && (
          <div style={{ marginBottom: 12 }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setScreen('retirement')}
              style={{ marginRight: 8, background: 'linear-gradient(135deg, #d4af37 0%, #e6c200 100%)', color: '#000' }}
            >
              ✨ Retraite honorifique
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setScreen('careerHistory')}
              style={{ marginRight: 8 }}
            >
              📊 Historique de carrière
            </button>
          </div>
        )}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => { if (confirm('Effacer la partie et recommencer ?')) resetGame() }}
        >
          🗑️ Nouvelle partie
        </button>
      </div>
    </div>
  )
}
