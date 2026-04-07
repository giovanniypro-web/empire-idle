import { useGameStore } from '../../store/gameStore'
import { DEPARTMENTS } from '../../core/data/departments'
import { getDepartmentUpgradeCost } from '../../core/systems/departmentSystem'
import { BALANCE } from '../../core/data/balancing'
import { formatMoney } from '../utils/format'
import type { DepartmentId } from '../../core/entities'

export function Departments() {
  const player = useGameStore(s => s.player)
  const departments = useGameStore(s => s.departments)
  const upgradeDepartment = useGameStore(s => s.upgradeDepartment)

  const totalCostPerSec = DEPARTMENTS.reduce((sum, def) => {
    const state = departments[def.id as DepartmentId]
    if (!state || state.level <= 0) return sum
    const lvlDef = def.levels.find(l => l.level === state.level)
    return sum + (lvlDef?.ongoingCost ?? 0)
  }, 0)

  return (
    <div className="screen">
      <div className="screen-header">
        <h2>Départements</h2>
        <p className="screen-subtitle">
          Investissez dans vos équipes fonctionnelles pour amplifier chaque aspect de votre empire.
        </p>
      </div>

      {totalCostPerSec > 0 && (
        <div className="dept-cost-banner">
          <span>💸 Charges dép. totales :</span>
          <strong>−{formatMoney(totalCostPerSec)}/s</strong>
        </div>
      )}

      <div className="dept-grid">
        {DEPARTMENTS.map(def => {
          const deptState = departments[def.id as DepartmentId]
          const currentLevel = deptState?.level ?? 0
          const isLocked = def.unlockLevel > player.level
          const isMaxed = currentLevel >= 5
          const upgradeCost = isMaxed ? null : getDepartmentUpgradeCost(def.id as DepartmentId, currentLevel)
          const canAfford = upgradeCost !== null && player.money >= upgradeCost
          const currentLevelDef = def.levels.find(l => l.level === currentLevel)
          const nextLevelDef = def.levels.find(l => l.level === currentLevel + 1)

          return (
            <div
              key={def.id}
              className={`dept-card ${isLocked ? 'locked' : ''} ${currentLevel > 0 ? 'active' : ''}`}
            >
              <div className="dept-header">
                <span className="dept-icon">{def.icon}</span>
                <div>
                  <strong>{def.name}</strong>
                  <p className="dept-desc">{def.description}</p>
                </div>
                <div className="dept-level-badge">
                  {isLocked ? (
                    <span className="locked-badge">🔒 Niv. {def.unlockLevel}</span>
                  ) : (
                    <span className="level-badge">Niv. {currentLevel}/5</span>
                  )}
                </div>
              </div>

              {/* Level progress bar */}
              {!isLocked && (
                <div className="dept-level-bar">
                  {[1, 2, 3, 4, 5].map(l => (
                    <div
                      key={l}
                      className={`level-pip ${l <= currentLevel ? 'filled' : ''}`}
                    />
                  ))}
                </div>
              )}

              {/* Current effects */}
              {!isLocked && currentLevel > 0 && currentLevelDef && (
                <div className="dept-current-effects">
                  <span className="effects-label">Actif :</span>
                  <span>{currentLevelDef.description}</span>
                  <span className="ongoing-cost">
                    −{formatMoney(currentLevelDef.ongoingCost)}/s
                  </span>
                </div>
              )}

              {/* Next level preview */}
              {!isLocked && !isMaxed && nextLevelDef && (
                <div className="dept-next-level">
                  <span className="next-label">Niveau {currentLevel + 1} :</span>
                  <span>{nextLevelDef.description}</span>
                </div>
              )}

              {isMaxed && (
                <div className="dept-maxed">⭐ Département au niveau maximum</div>
              )}

              {/* Action button */}
              {!isLocked && !isMaxed && (
                <button
                  className={`btn-upgrade ${canAfford ? '' : 'disabled'}`}
                  disabled={!canAfford}
                  onClick={() => upgradeDepartment(def.id as DepartmentId)}
                >
                  {currentLevel === 0 ? 'Créer' : 'Améliorer'} →{' '}
                  Niv. {currentLevel + 1}
                  <span className="upgrade-cost">
                    {upgradeCost !== null ? formatMoney(upgradeCost) : '—'}
                  </span>
                </button>
              )}

              {isLocked && (
                <div className="locked-msg">
                  Disponible au niveau {def.unlockLevel}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="pedagogy-box">
        <strong>💡 Les départements dans la vraie vie</strong>
        <p>
          Toute entreprise en croissance développe des fonctions spécialisées : Marketing pour
          acquérir des clients, Opérations pour livrer efficacement, Finance pour optimiser les
          flux. Chaque département a un coût fixe — mais génère un retour sur investissement
          structurel qui dépasse ce coût. C'est le principe du levier organisationnel.
        </p>
      </div>
    </div>
  )
}
