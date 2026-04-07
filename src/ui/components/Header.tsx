import { useGameStore } from '../../store/gameStore'
import { getTotalIncomePerSecond, calculateTotalSalary } from '../../core/systems/economySystem'
import { getXPProgress, xpToNextLevel } from '../../core/systems/xpSystem'
import { getTotalDepartmentCostPerSecond } from '../../core/systems/departmentSystem'
import { ASSETS } from '../../core/data/assets'
import StatBar from './StatBar'
import { formatMoney } from '../utils/format'
import type { DepartmentId } from '../../core/entities'

export default function Header() {
  const player        = useGameStore(s => s.player)
  const stats         = useGameStore(s => s.stats)
  const activities    = useGameStore(s => s.activities)
  const upgrades      = useGameStore(s => s.upgrades)
  const employees     = useGameStore(s => s.employees)
  const inventory     = useGameStore(s => s.inventory)
  const activeEffects = useGameStore(s => s.activeEffects)
  const specialization = useGameStore(s => s.specialization)
  const departments   = useGameStore(s => s.departments)
  const ownedAssets   = useGameStore(s => s.ownedAssets)

  const now = Date.now()
  const grossIPS = getTotalIncomePerSecond(
    activities, upgrades, employees, inventory, activeEffects, now, stats, specialization, departments,
  )
  const salary    = calculateTotalSalary(employees, specialization)
  const deptCost  = getTotalDepartmentCostPerSecond(
    departments as Record<DepartmentId, import('../../core/entities').DepartmentState>,
  )

  // Asset passive income (for display)
  let assetPassive = 0
  for (const [assetId, qty] of Object.entries(ownedAssets)) {
    if (!qty) continue
    const a = ASSETS.find(x => x.id === assetId)
    if (a && a.passiveIncome > 0) assetPassive += a.passiveIncome * (qty as number)
  }

  const totalCharges = salary + deptCost
  const netIPS = grossIPS + assetPassive - totalCharges

  const xpProgress = getXPProgress(player.xp, player.level)
  const xpNeeded   = xpToNextLevel(player.xp, player.level)

  return (
    <header className="header">
      <div className="header-logo">
        🏛️ <span>Empire</span> Idle
      </div>

      <div className="header-stats">
        {/* Money block */}
        <div style={{ minWidth: 140 }}>
          <div className="stat-money">{formatMoney(player.money)}</div>
          <div className="stat-ips">
            <span className="text-green">+{formatMoney(grossIPS)}/s</span>
            {totalCharges > 0 && (
              <span style={{ color: 'var(--red)', marginLeft: 4 }}>
                −{formatMoney(totalCharges)}/s
              </span>
            )}
          </div>
          {totalCharges > 0 && (
            <div style={{ fontSize: 10, color: netIPS >= 0 ? 'var(--green)' : 'var(--red)' }}>
              Net : {netIPS >= 0 ? '+' : ''}{formatMoney(netIPS)}/s
            </div>
          )}
        </div>

        {/* XP block */}
        <div className="xp-block">
          <div className="xp-label">
            <span>XP : {Math.floor(player.xp).toLocaleString()}</span>
            <span>{Math.floor(xpNeeded).toLocaleString()} → niv. {player.level + 1}</span>
          </div>
          <div className="xp-bar-outer">
            <div
              className="xp-bar-inner"
              style={{ width: `${Math.min(100, xpProgress * 100).toFixed(1)}%` }}
            />
          </div>
        </div>

        <div className="level-badge">Niv. {player.level}</div>

        {/* Talent points badge */}
        {player.talentPoints > 0 && (
          <div className="talent-badge" title="Points de talent disponibles">
            ⭐{player.talentPoints}
          </div>
        )}

        {/* Business stats compact */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 4 }}>
          <StatBar stat="popularity"   value={stats.popularity}   compact />
          <StatBar stat="reputation"   value={stats.reputation}   compact />
          <StatBar stat="satisfaction" value={stats.satisfaction} compact />
          {stats.prestige > 0 && (
            <div className="prestige-chip" title={`Prestige : ${stats.prestige.toFixed(1)}`}>
              ✨{stats.prestige.toFixed(0)}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
