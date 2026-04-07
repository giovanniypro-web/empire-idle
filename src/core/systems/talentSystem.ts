import type { TalentDef } from '../entities'
import { TALENTS } from '../data/talents'

/**
 * Neutral talent aggregate — no bonuses.
 */
export interface TalentAggregate {
  allIncomeMultiplier: number
  activityCostMultiplier: number
  employeeCostMultiplier: number
  upgradeCostMultiplier: number
  upgradeEffectivenessMultiplier: number
  satisfactionDecayMultiplier: number
  xpMultiplier: number
  popularityGrowthMultiplier: number
  operatingCostMultiplier: number
  eventPositiveMultiplier: number
  eventNegativeMultiplier: number
  passiveIncomeAdd: number       // flat €/s summed
  employeeIncomeBonusAdd: number // additive to all employee incomeBonus
}

export const NEUTRAL_TALENT_AGGREGATE: TalentAggregate = {
  allIncomeMultiplier: 1.0,
  activityCostMultiplier: 1.0,
  employeeCostMultiplier: 1.0,
  upgradeCostMultiplier: 1.0,
  upgradeEffectivenessMultiplier: 1.0,
  satisfactionDecayMultiplier: 1.0,
  xpMultiplier: 1.0,
  popularityGrowthMultiplier: 1.0,
  operatingCostMultiplier: 1.0,
  eventPositiveMultiplier: 1.0,
  eventNegativeMultiplier: 1.0,
  passiveIncomeAdd: 0,
  employeeIncomeBonusAdd: 0,
}

/**
 * Returns purchased TalentDef objects for a given talents record.
 */
export function getPurchasedTalents(talents: Record<string, boolean>): TalentDef[] {
  return TALENTS.filter(t => talents[t.id] === true)
}

/**
 * Aggregates all purchased talent effects (multiplicative for multipliers, additive for flat values).
 */
export function getAggregatedTalentEffects(talents: Record<string, boolean>): TalentAggregate {
  const purchased = getPurchasedTalents(talents)
  const result = { ...NEUTRAL_TALENT_AGGREGATE }

  for (const t of purchased) {
    result.allIncomeMultiplier           *= t.allIncomeMultiplier
    result.activityCostMultiplier        *= t.activityCostMultiplier
    result.employeeCostMultiplier        *= t.employeeCostMultiplier
    result.upgradeCostMultiplier         *= t.upgradeCostMultiplier
    result.upgradeEffectivenessMultiplier *= t.upgradeEffectivenessMultiplier
    result.satisfactionDecayMultiplier   *= t.satisfactionDecayMultiplier
    result.xpMultiplier                  *= t.xpMultiplier
    result.popularityGrowthMultiplier    *= t.popularityGrowthMultiplier
    result.operatingCostMultiplier       *= t.operatingCostMultiplier
    result.eventPositiveMultiplier       *= t.eventPositiveMultiplier
    result.eventNegativeMultiplier       *= t.eventNegativeMultiplier
    result.passiveIncomeAdd              += t.passiveIncomeAdd
    result.employeeIncomeBonusAdd        += t.employeeIncomeBonusAdd
  }

  return result
}

/**
 * Checks if a talent can be purchased given current talent points and purchase state.
 */
export function canPurchaseTalent(
  talentId: string,
  talents: Record<string, boolean>,
  availablePoints: number,
): boolean {
  const def = TALENTS.find(t => t.id === talentId)
  if (!def) return false
  if (talents[talentId]) return false             // already owned
  if (availablePoints < def.cost) return false
  if (def.requires && !talents[def.requires]) return false
  return true
}

/**
 * Total talent points spent (for display).
 */
export function getTalentPointsSpent(talents: Record<string, boolean>): number {
  return getPurchasedTalents(talents).reduce((sum, t) => sum + t.cost, 0)
}
