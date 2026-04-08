import type {
  ActivityState,
  UpgradeState,
  EmployeeState,
  ActiveEffect,
  BusinessStats,
  SpecializationId,
  ActivityStatAffinity,
  DepartmentId,
  DepartmentState,
} from '../entities'
import { ACTIVITIES } from '../data/activities'
import { UPGRADES } from '../data/upgrades'
import { ITEMS, MARKET_LISTINGS } from '../data/items'
import { BALANCE } from '../data/balancing'
import {
  getPopularityMultiplier,
  getReputationMultiplier,
  getSatisfactionMultiplier,
  getSpecializationEffects,
  getSpecActivityCostMultiplier,
  getSpecEmployeeCostMultiplier,
  getSpecSalaryMultiplier,
} from './statsSystem'
import { getDepartmentEffectivenessMultiplier } from './departmentSystem'

// ── Cost calculations ──────────────────────────────────────────

export function getActivityCost(
  activityId: string,
  owned: number,
  specialization: SpecializationId | null = null,
): number {
  const def = ACTIVITIES.find(a => a.id === activityId)
  if (!def) return Infinity
  const specMult = getSpecActivityCostMultiplier(specialization)
  return Math.floor(def.baseCost * Math.pow(BALANCE.ACTIVITY_COST_MULTIPLIER, owned) * specMult)
}

// V4: getEmployeeCost is deprecated (hiring now uses CandidateProfile.hiringCost)
// Kept for backward compatibility, returns Infinity
export function getEmployeeCost(
  employeeId: string,
  owned: number,
  specialization: SpecializationId | null = null,
): number {
  // Deprecated in V4 — individual hiring with fixed costs
  return Infinity
}

// ── Duration ──────────────────────────────────────────────────

export function getActivityDuration(
  activityId: string,
  upgrades: Record<string, UpgradeState>,
  employees: Record<string, EmployeeState>,
): number {
  const def = ACTIVITIES.find(a => a.id === activityId)
  if (!def) return 1

  let speedMultiplier = 1

  for (const upg of UPGRADES) {
    if (!upgrades[upg.id]?.purchased) continue
    for (const effect of upg.effects) {
      if (effect.type === 'activity_speed' && effect.activityId === activityId) {
        // Apply UPGRADE_MULTIPLIER_NERF to make speed upgrades slightly less powerful
        const effectiveMult = 1 + (effect.multiplier - 1) * BALANCE.UPGRADE_MULTIPLIER_NERF
        speedMultiplier *= effectiveMult
      }
    }
  }

  // V4: Employee speed bonuses are now calculated per-employee in hrSystem
  // (not via specific employee types assigned to activities)

  return Math.max(0.5, def.baseDuration / speedMultiplier)
}

// ── Income per cycle ───────────────────────────────────────────

export function getActivityIncomePerCycle(
  activityId: string,
  count: number,
  upgrades: Record<string, UpgradeState>,
  employees: Record<string, EmployeeState>,
  inventory: Record<string, number>,
  activeEffects: ActiveEffect[],
  now: number,
  stats?: BusinessStats,
  specialization?: SpecializationId | null,
  departments?: Record<DepartmentId, DepartmentState>,
): number {
  const def = ACTIVITIES.find(a => a.id === activityId)
  if (!def || count === 0) return 0

  let income = def.baseIncome * count

  // ── Upgrade multipliers (with nerf applied) ───────────────
  for (const upg of UPGRADES) {
    if (!upgrades[upg.id]?.purchased) continue
    for (const effect of upg.effects) {
      if (effect.type === 'activity_income' && effect.activityId === activityId) {
        const effectiveMult = 1 + (effect.multiplier - 1) * BALANCE.UPGRADE_MULTIPLIER_NERF
        income *= effectiveMult
      } else if (effect.type === 'global_income') {
        const effectiveMult = 1 + (effect.multiplier - 1) * BALANCE.UPGRADE_MULTIPLIER_NERF
        income *= effectiveMult
      }
    }
  }

  // ── Employee income bonuses (V4) ──────────────────────────
  // V4: Employee bonuses are now handled via calculateTotalEmployeeContribution() in hrSystem
  // (not via specific employee types)

  // ── Inventory item effects ────────────────────────────────
  income *= getItemIncomeMultiplier(activityId, inventory)

  // ── Business stat multipliers (V2) ───────────────────────
  if (stats) {
    const affinity = def.statAffinity
    if (affinity === 'popularity') {
      income *= getPopularityMultiplier(stats.popularity)
    } else if (affinity === 'reputation') {
      income *= getReputationMultiplier(stats.reputation)
    }
    // Satisfaction boost: only for automated activities
    // (applied in store tick, not here, because we check automation state there)
  }

  // ── Specialization income effects (V2) ────────────────────
  if (specialization) {
    const spec = getSpecializationEffects(specialization)
    if (spec) {
      income *= spec.allIncomeMultiplier
      if (def.statAffinity === 'popularity') {
        income *= spec.consumerIncomeMultiplier
      } else if (def.statAffinity === 'reputation') {
        income *= spec.professionalIncomeMultiplier
      }
    }
  }

  // ── Department effectiveness multiplier (Phase 3) ────────
  if (departments && def.departmentAffinity && def.departmentAffinity !== 'general') {
    const dept = departments[def.departmentAffinity as DepartmentId]
    if (dept && dept.effectiveness) {
      const effectivenessMultiplier = getDepartmentEffectivenessMultiplier(dept.effectiveness)
      income *= effectivenessMultiplier
    }
  }

  // ── Skill requirement efficiency (Phase 3) ──────────────
  const skillMult = getActivitySkillMultiplier(activityId, employees)
  income *= skillMult

  // ── Timed active effects ──────────────────────────────────
  for (const effect of activeEffects) {
    if (effect.expiresAt <= now) continue
    if (effect.activityId === undefined || effect.activityId === activityId) {
      income *= effect.multiplier
    }
  }

  return income
}

// ── XP per cycle ──────────────────────────────────────────────

export function getActivityXPPerCycle(
  activityId: string,
  count: number,
  upgrades: Record<string, UpgradeState>,
  activeEffects: ActiveEffect[],
  now: number,
): number {
  const def = ACTIVITIES.find(a => a.id === activityId)
  if (!def || count === 0) return 0

  let xp = def.baseXP * count

  for (const upg of UPGRADES) {
    if (!upgrades[upg.id]?.purchased) continue
    for (const effect of upg.effects) {
      if (effect.type === 'global_xp') {
        const effectiveMult = 1 + (effect.multiplier - 1) * BALANCE.UPGRADE_MULTIPLIER_NERF
        xp *= effectiveMult
      }
    }
  }

  return xp
}

// ── Automation check ──────────────────────────────────────────
// V4: Simplified — activities are automated if there are any employees
// (In future, this could check if specific employees are assigned to the activity)

export function isActivityAutomated(
  activityId: string,
  employees: Record<string, EmployeeState>,
): boolean {
  // For Phase 1: if any employee exists and is active, activities are automatable
  return Object.values(employees).some(emp => emp.status === 'active' || emp.status === 'onboarding')
}

// ── Total income/s ────────────────────────────────────────────

export function getTotalIncomePerSecond(
  activities: Record<string, ActivityState>,
  upgrades: Record<string, UpgradeState>,
  employees: Record<string, EmployeeState>,
  inventory: Record<string, number>,
  activeEffects: ActiveEffect[],
  now: number,
  stats?: BusinessStats,
  specialization?: SpecializationId | null,
  departments?: Record<DepartmentId, DepartmentState>,
): number {
  let total = 0
  for (const def of ACTIVITIES) {
    const state = activities[def.id]
    if (!state || state.count === 0) continue
    if (!isActivityAutomated(def.id, employees)) continue

    const income = getActivityIncomePerCycle(
      def.id, state.count, upgrades, employees, inventory, activeEffects, now, stats, specialization, departments,
    )
    const duration = getActivityDuration(def.id, upgrades, employees)
    total += income / duration
  }
  return total
}

// ── Total salary per second ───────────────────────────────────
// V4: Updated for individual EmployeeState objects

export function calculateTotalSalary(
  employees: Record<string, EmployeeState>,
  specialization: SpecializationId | null = null,
): number {
  let total = 0
  for (const emp of Object.values(employees)) {
    if (emp.status === 'departed') continue  // departed employees don't cost salary
    total += emp.salary
  }
  const specMult = getSpecSalaryMultiplier(specialization)
  return total * specMult * BALANCE.SALARY_GLOBAL_MULTIPLIER
}

/**
 * Calculate payroll breakdown by department (Phase 3)
 * Used for financial transparency and decision-making
 */
export function calculateSalaryByDepartment(
  employees: Record<string, EmployeeState>,
  specialization: SpecializationId | null = null,
): Record<string, number> {
  const breakdown: Record<string, number> = {}
  const specMult = getSpecSalaryMultiplier(specialization)
  const globalMult = BALANCE.SALARY_GLOBAL_MULTIPLIER

  for (const emp of Object.values(employees)) {
    if (emp.status === 'departed') continue
    if (!breakdown[emp.department]) {
      breakdown[emp.department] = 0
    }
    breakdown[emp.department] += emp.salary * specMult * globalMult
  }
  return breakdown
}

/**
 * Calculate skill efficiency multiplier for an activity (Phase 3)
 * Soft requirement: below = 50%, at = 100%, exceeds = 120%
 * Encourages building balanced teams without hard-locking progression
 */
export function getActivitySkillMultiplier(
  activityId: string,
  employees: Record<string, EmployeeState>,
): number {
  const def = ACTIVITIES.find(a => a.id === activityId)
  if (!def || !def.skillRequired) return 1.0  // no skill requirement

  const activeEmployees = Object.values(employees).filter(e => e.status === 'active' || e.status === 'onboarding')
  if (activeEmployees.length === 0) return 0.5  // no employees = lowest efficiency

  const avgSkill = activeEmployees.reduce((sum, e) => sum + e.skill, 0) / activeEmployees.length

  // Below requirement: 50%
  if (avgSkill < def.skillRequired) {
    return 0.5
  }
  // At/above requirement: scale from 100% to 120%
  const skillExcess = Math.min(40, avgSkill - def.skillRequired)  // cap bonus at 40 skill points
  return 1.0 + (skillExcess / 100)  // 100% → 120%
}

// ── Item income multiplier ────────────────────────────────────

export function getItemIncomeMultiplier(
  activityId: string,
  inventory: Record<string, number>,
): number {
  let multiplier = 1
  for (const itemDef of ITEMS) {
    const qty = inventory[itemDef.id] ?? 0
    if (qty === 0) continue
    const effectiveQty = itemDef.stackable ? qty : 1
    for (const effect of itemDef.effects) {
      if (effect.type === 'activity_income' && effect.activityId === activityId) {
        multiplier *= Math.pow(effect.multiplier, effectiveQty)
      } else if (effect.type === 'global_income') {
        multiplier *= Math.pow(effect.multiplier, effectiveQty)
      }
    }
  }
  return multiplier
}

// ── Market price update ───────────────────────────────────────

export function updateMarketPrice(
  currentBuy: number,
  baseBuy: number,
  trend: number,
  volatility: number,
): { currentBuyPrice: number; currentSellPrice: number; trend: number } {
  const listing = MARKET_LISTINGS.find(l => l.baseBuyPrice === baseBuy)
  const sellRatio = listing ? listing.baseSellPrice / listing.baseBuyPrice : 0.5

  const noise = (Math.random() - 0.5) * volatility
  const newTrend = Math.max(-1, Math.min(1, trend * 0.9 + noise))
  const newBuy = Math.max(baseBuy * 0.5, Math.min(baseBuy * 2, currentBuy * (1 + newTrend * 0.05)))

  return {
    currentBuyPrice: Math.round(newBuy),
    currentSellPrice: Math.round(newBuy * sellRatio),
    trend: newTrend,
  }
}

// ── Employee Assignment Bonuses (V4.5) ────────────────────────
/**
 * Calculate income, speed, and skill bonuses from employees assigned to an activity.
 * Each assigned employee contributes: bonusPerEmployee × (skill/100) × (motivation/100) × (productivity/100)
 */
export function getActivityEmployeeBonus(
  activityId: string,
  employees: Record<string, EmployeeState>,
): {
  incomeMultiplier: number
  durationMultiplier: number
  skillBoost: number
} {
  // Find employees assigned to this activity
  const assigned = Object.values(employees).filter(
    e => e.status === 'active' && e.assignedActivityId === activityId
  )

  if (assigned.length === 0) {
    return { incomeMultiplier: 1.0, durationMultiplier: 1.0, skillBoost: 0 }
  }

  // Calculate effectiveness per employee (0-1 scale)
  const bonusPerEmployee = BALANCE.EMPLOYEE_ASSIGNMENT_INCOME_BONUS  // 0.15 = 15%
  let totalBonus = 0

  for (const emp of assigned) {
    const effectiveness = (emp.skill / 100) * (emp.motivation / 100) * (emp.productivity / 100)
    totalBonus += bonusPerEmployee * effectiveness
  }

  return {
    incomeMultiplier: 1 + totalBonus,
    durationMultiplier: Math.max(0.5, 1 - totalBonus * BALANCE.EMPLOYEE_ASSIGNMENT_SPEED_BONUS),
    skillBoost: Math.round(totalBonus * BALANCE.EMPLOYEE_ASSIGNMENT_SKILL_BONUS),
  }
}
