import type { GameState } from '../entities'
import { ACTIVITIES } from '../data/activities'
import { BALANCE } from '../data/balancing'
import {
  isActivityAutomated,
  getActivityIncomePerCycle,
  getActivityDuration,
} from './economySystem'

export interface OfflineResult {
  moneyEarned: number
  xpEarned: number
  secondsAway: number
  cappedAt: number | null
}

export function calculateOfflineProgress(state: GameState, now: number): OfflineResult {
  const rawSeconds   = (now - state.lastTick) / 1000
  const secondsAway  = Math.max(0, rawSeconds)
  const cappedSeconds = Math.min(secondsAway, BALANCE.MAX_OFFLINE_SECONDS)

  let moneyEarned = 0
  let xpEarned    = 0

  for (const def of ACTIVITIES) {
    const actState = state.activities[def.id]
    if (!actState || actState.count === 0) continue
    if (!isActivityAutomated(def.id, state.employees)) continue

    const duration = getActivityDuration(def.id, state.upgrades, state.employees)

    // Pass stats and specialization for V2 multipliers, departments for Phase 3
    const incomePerCycle = getActivityIncomePerCycle(
      def.id,
      actState.count,
      state.upgrades,
      state.employees,
      state.inventory,
      [],                   // no active timed effects offline
      now,
      state.stats,          // V2: business stats
      state.specialization, // V2: specialization
      state.departments,    // Phase 3: department effectiveness
    )
    const xpPerCycle = def.baseXP * actState.count
    const cycles     = cappedSeconds / duration

    moneyEarned += incomePerCycle * cycles
    xpEarned    += xpPerCycle * cycles
  }

  return {
    moneyEarned: Math.floor(moneyEarned),
    xpEarned:    Math.floor(xpEarned),
    secondsAway,
    cappedAt: secondsAway > BALANCE.MAX_OFFLINE_SECONDS ? BALANCE.MAX_OFFLINE_SECONDS : null,
  }
}
