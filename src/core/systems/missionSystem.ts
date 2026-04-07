import type { MissionDef, GameState, ActivityState, EmployeeState, StockState } from '../entities'
import { MISSIONS } from '../data/missions'

// Returns 0-1 progress for a mission condition
export function getMissionProgress(mission: MissionDef, state: GameState): number {
  const { condition } = mission

  switch (condition.type) {
    case 'earn_total':
      return Math.min(1, state.player.totalEarned / condition.amount)

    case 'reach_level':
      return state.player.level >= condition.level ? 1 : state.player.level / condition.level

    case 'own_activity': {
      const actState: ActivityState | undefined = state.activities[condition.activityId]
      const owned = actState?.count ?? 0
      return Math.min(1, owned / condition.count)
    }

    case 'hire_employee': {
      // V4: Count total hired employees (any type)
      const hiredCount = Object.values(state.employees).filter(e => e.status !== 'departed').length
      return Math.min(1, hiredCount / condition.count)
    }

    case 'buy_upgrade':
      return state.upgrades[condition.upgradeId]?.purchased ? 1 : 0

    case 'own_stock_value': {
      let totalValue = 0
      for (const [, stockState] of Object.entries(state.stocks)) {
        const s = stockState as StockState
        totalValue += s.owned * s.currentPrice
      }
      return Math.min(1, totalValue / condition.amount)
    }

    case 'click_count':
      return Math.min(1, state.player.totalClicks / condition.count)

    case 'income_per_second':
      return 0  // handled separately in checkNewlyCompletedMissions via live IPS value

    case 'reach_stat': {
      const current = state.stats[condition.stat] ?? 0
      return Math.min(1, current / condition.value)
    }

    case 'reach_prestige':
      return Math.min(1, state.stats.prestige / condition.value)

    case 'dept_level': {
      const deptState = state.departments[condition.deptId]
      return deptState && deptState.level >= condition.level ? 1 : 0
    }

    default:
      return 0
  }
}

export function isMissionComplete(mission: MissionDef, state: GameState): boolean {
  return getMissionProgress(mission, state) >= 1
}

export function checkNewlyCompletedMissions(state: GameState, incomePerSecond: number): string[] {
  const newlyCompleted: string[] = []

  for (const mission of MISSIONS) {
    const mState = state.missions[mission.id]
    if (mState?.completed) continue

    let progress: number
    if (mission.condition.type === 'income_per_second') {
      progress = Math.min(1, incomePerSecond / mission.condition.amount)
    } else {
      progress = getMissionProgress(mission, state)
    }

    if (progress >= 1) {
      newlyCompleted.push(mission.id)
    }
  }

  return newlyCompleted
}
