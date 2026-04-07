import { useGameStore } from '../../store/gameStore'
import { MISSIONS } from '../../core/data/missions'
import { getMissionProgress } from '../../core/systems/missionSystem'
import { getTotalIncomePerSecond } from '../../core/systems/economySystem'
import { formatMoney, formatNumber } from '../utils/format'
import type { GameState } from '../../core/entities'

export default function Missions() {
  const state = useGameStore(s => s)
  const claimMission = useGameStore(s => s.claimMission)
  const missions = useGameStore(s => s.missions)

  const now = Date.now()
  const ips = getTotalIncomePerSecond(
    state.activities, state.upgrades, state.employees, state.inventory, state.activeEffects, now,
    state.stats, state.specialization, state.departments,
  )

  const getProgress = (mission: typeof MISSIONS[0]) => {
    if (mission.condition.type === 'income_per_second') {
      return Math.min(1, ips / mission.condition.amount)
    }
    return getMissionProgress(mission, state as unknown as GameState)
  }

  const sorted = [...MISSIONS].sort((a, b) => {
    const aState = missions[a.id]
    const bState = missions[b.id]
    // Order: uncompleted first, then completed unclaimed, then claimed
    const aOrder = aState?.claimedReward ? 2 : aState?.completed ? 0 : 1
    const bOrder = bState?.claimedReward ? 2 : bState?.completed ? 0 : 1
    if (aOrder !== bOrder) return aOrder - bOrder
    return getProgress(b) - getProgress(a)
  })

  return (
    <div>
      <div className="screen-title">🎯 Missions</div>
      <div className="screen-subtitle">
        Atteins des objectifs pour gagner des récompenses et de l'XP.
      </div>

      <div className="card-grid">
        {sorted.map(mission => {
          const mState = missions[mission.id]
          const progress = getProgress(mission)
          const completed = mState?.completed || progress >= 1
          const claimed = mState?.claimedReward

          return (
            <div
              key={mission.id}
              className={`mission-card ${completed ? 'completed' : ''} ${claimed ? 'claimed' : ''}`}
            >
              <div className="mission-icon">{mission.icon}</div>
              <div className="mission-info">
                <div className="mission-name">{mission.name}</div>
                <div className="mission-desc">{mission.description}</div>
                <div className="mission-reward">
                  🏆 {formatMoney(mission.rewardMoney)} + {formatNumber(mission.rewardXP)} XP
                </div>

                {!claimed && (
                  <div className="mission-prog-wrap">
                    <div className="mission-prog-label">
                      {Math.floor(progress * 100)}%
                    </div>
                    <div className="prog-bar-outer">
                      <div
                        className={`prog-bar-inner ${completed ? 'prog-green' : 'prog-amber'}`}
                        style={{ width: `${Math.min(100, progress * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {completed && !claimed && (
                  <button
                    className="btn btn-amber btn-sm mt-8"
                    onClick={() => claimMission(mission.id)}
                  >
                    🎁 Réclamer la récompense
                  </button>
                )}

                {claimed && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                    ✓ Récompense réclamée
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
