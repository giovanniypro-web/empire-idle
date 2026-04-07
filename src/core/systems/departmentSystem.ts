import type { DepartmentId, DepartmentState, DepartmentEffects, EmployeeState, DepartmentEffectivenessBreakdown } from '../entities'
import { DEPARTMENTS } from '../data/departments'
import { BALANCE } from '../data/balancing'

/**
 * Neutral base — no bonus, no penalty.
 */
const NEUTRAL_EFFECTS: DepartmentEffects = {
  allIncomeMultiplier: 1.0,
  consumerIncomeMultiplier: 1.0,
  automatedIncomeMultiplier: 1.0,
  popularityGrowthMultiplier: 1.0,
  reputationGrowthMultiplier: 1.0,
  satisfactionGrowthMultiplier: 1.0,
  satisfactionDecayMultiplier: 1.0,
  salaryMultiplier: 1.0,
  activitySpeedMultiplier: 1.0,
  operatingCostMultiplier: 1.0,
  upgradeEffectMultiplier: 1.0,
  xpMultiplier: 1.0,
}

/**
 * Returns the active effects for a single department at its current level.
 * Level 0 → neutral effects.
 */
export function getDepartmentEffects(
  deptId: DepartmentId,
  level: number,
): DepartmentEffects {
  if (level <= 0) return NEUTRAL_EFFECTS
  const def = DEPARTMENTS.find(d => d.id === deptId)
  if (!def) return NEUTRAL_EFFECTS
  const levelDef = def.levels.find(l => l.level === level)
  return levelDef ? levelDef.effects : NEUTRAL_EFFECTS
}

/**
 * Aggregates all active department effects by multiplying each field.
 * Used once per tick in the economy system.
 */
export function getAggregatedDepartmentEffects(
  departments: Record<DepartmentId, DepartmentState>,
): DepartmentEffects {
  const result = { ...NEUTRAL_EFFECTS }

  for (const def of DEPARTMENTS) {
    const state = departments[def.id as DepartmentId]
    if (!state || state.level <= 0) continue
    const effects = getDepartmentEffects(def.id as DepartmentId, state.level)

    result.allIncomeMultiplier           *= effects.allIncomeMultiplier
    result.consumerIncomeMultiplier      *= effects.consumerIncomeMultiplier
    result.automatedIncomeMultiplier     *= effects.automatedIncomeMultiplier
    result.popularityGrowthMultiplier    *= effects.popularityGrowthMultiplier
    result.reputationGrowthMultiplier    *= effects.reputationGrowthMultiplier
    result.satisfactionGrowthMultiplier  *= effects.satisfactionGrowthMultiplier
    result.satisfactionDecayMultiplier   *= effects.satisfactionDecayMultiplier
    result.salaryMultiplier              *= effects.salaryMultiplier
    result.activitySpeedMultiplier       *= effects.activitySpeedMultiplier
    result.operatingCostMultiplier       *= effects.operatingCostMultiplier
    result.upgradeEffectMultiplier       *= effects.upgradeEffectMultiplier
    result.xpMultiplier                  *= effects.xpMultiplier
  }

  return result
}

/**
 * Total ongoing cost per second across all active departments.
 */
export function getTotalDepartmentCostPerSecond(
  departments: Record<DepartmentId, DepartmentState>,
): number {
  let total = 0
  for (const def of DEPARTMENTS) {
    const state = departments[def.id as DepartmentId]
    if (!state || state.level <= 0) continue
    const levelDef = def.levels.find(l => l.level === state.level)
    if (levelDef) total += levelDef.ongoingCost
  }
  return total
}

/**
 * Upgrade cost to go from current level to next level.
 * Returns null if already at max or department not found.
 */
export function getDepartmentUpgradeCost(
  deptId: DepartmentId,
  currentLevel: number,
): number | null {
  const def = DEPARTMENTS.find(d => d.id === deptId)
  if (!def) return null
  const nextLevelDef = def.levels.find(l => l.level === currentLevel + 1)
  return nextLevelDef ? nextLevelDef.upgradeCost : null
}

/**
 * Calculate department effectiveness based on employee quality
 * Effectiveness = (avgSkill + avgMotivation) / 2 × leadershipBonus × (1 - underleadershipPenalty)
 * Returns breakdown showing all factors
 */
export function calculateDepartmentEffectiveness(
  deptId: DepartmentId,
  employees: EmployeeState[],
): DepartmentEffectivenessBreakdown | null {
  // Filter employees in this department
  const deptEmployees = employees.filter(e => e.department === deptId && e.status !== 'departed')

  // If no employees, no effectiveness
  if (deptEmployees.length === 0) {
    return null
  }

  // Calculate averages
  const avgSkill = deptEmployees.reduce((sum, e) => sum + e.skill, 0) / deptEmployees.length
  const avgMotivation = deptEmployees.reduce((sum, e) => sum + e.motivation, 0) / deptEmployees.length

  // Check for leadership (lead role = senior+ with seniority 85+)
  const hasLead = deptEmployees.some(e => (e.role === 'lead' || e.role === 'senior') && e.seniority >= 85)

  // Leadership bonus
  const leadershipBonus = hasLead ? BALANCE.DEPT_LEADERSHIP_BONUS : 0

  // Underleadership penalty: if team is large without enough leads
  let underleadershipPenalty = 0
  if (deptEmployees.length > BALANCE.DEPT_MIN_HEADCOUNT_BEFORE_PENALTY && !hasLead) {
    underleadershipPenalty = (deptEmployees.length - BALANCE.DEPT_MIN_HEADCOUNT_BEFORE_PENALTY) * BALANCE.DEPT_UNDERLEADERSHIP_PENALTY_PER_HEADCOUNT
  }

  // Base effectiveness: weighted average of skill and motivation
  const baseEffectiveness =
    (avgSkill * BALANCE.DEPT_EFFECTIVENESS_SKILL_WEIGHT +
     avgMotivation * BALANCE.DEPT_EFFECTIVENESS_MOTIVATION_WEIGHT)

  // Apply bonuses/penalties
  let effectiveness = baseEffectiveness * (1 + leadershipBonus) * (1 - underleadershipPenalty)

  // Clamp to reasonable range
  effectiveness = Math.max(
    BALANCE.DEPT_EFFECTIVENESS_MULTIPLIER_MIN * 100,
    Math.min(BALANCE.DEPT_EFFECTIVENESS_MULTIPLIER_MAX * 100, effectiveness)
  )

  return {
    avgSkill: Math.round(avgSkill),
    avgMotivation: Math.round(avgMotivation),
    headcount: deptEmployees.length,
    hasLead,
    leadershipBonus: Math.round(leadershipBonus * 100),
    underleadershipPenalty: Math.round(underleadershipPenalty * 100),
    effectiveness: Math.round(effectiveness),
  }
}

/**
 * Get effectiveness multiplier for a department to apply to activity income
 * Returns 0.3 to 1.3 scale
 */
export function getDepartmentEffectivenessMultiplier(
  effectiveness: DepartmentEffectivenessBreakdown | null,
): number {
  if (!effectiveness) return 1.0  // No employees = no bonus/penalty
  return effectiveness.effectiveness / 100
}

/**
 * Validate organizational structure across all departments
 * Returns health score (0-100) and structure warnings
 * Used for decision-making and UI feedback
 */
export interface OrganizationalHealth {
  overallScore: number  // 0-100
  deptScores: Record<DepartmentId, number>
  warnings: {
    deptId: DepartmentId
    severity: 'low' | 'medium' | 'high'
    message: string
  }[]
}

export function validateOrganizationalStructure(
  departments: Record<DepartmentId, DepartmentState>,
  employees: EmployeeState[],
): OrganizationalHealth {
  const warnings: OrganizationalHealth['warnings'] = []
  const deptScores: Record<DepartmentId, number> = {} as Record<DepartmentId, number>

  let totalScore = 100
  let deptCount = 0

  for (const def of DEPARTMENTS) {
    const deptId = def.id as DepartmentId
    const deptState = departments[deptId]
    if (!deptState || deptState.level === 0) continue

    deptCount++
    const deptEmployees = employees.filter(e => e.department === deptId && e.status !== 'departed')

    // If department exists but has no employees, flag it
    if (deptEmployees.length === 0) {
      deptScores[deptId] = 0
      warnings.push({
        deptId,
        severity: 'high',
        message: `${def.name}: Department active but staffed with 0 people`,
      })
      totalScore -= 20
      continue
    }

    // Check leadership requirement
    const hasLead = deptEmployees.some(e => (e.role === 'lead' || e.role === 'senior') && e.seniority >= 85)
    const teamSize = deptEmployees.length
    const leadsNeeded = Math.ceil(teamSize / BALANCE.STRUCTURE_LEADERSHIP_RATIO)
    const leadsActual = deptEmployees.filter(e => (e.role === 'lead' || e.role === 'senior') && e.seniority >= 85).length

    let deptScore = 100

    if (!hasLead && teamSize > BALANCE.DEPT_MIN_HEADCOUNT_BEFORE_PENALTY) {
      const severity = teamSize > 10 ? 'high' : 'medium'
      warnings.push({
        deptId,
        severity,
        message: `${def.name}: Team of ${teamSize} without leadership (need ${leadsNeeded} leads)`,
      })
      deptScore -= (teamSize - BALANCE.DEPT_MIN_HEADCOUNT_BEFORE_PENALTY) * 5
    }

    // Skill/motivation feedback
    const effectiveness = calculateDepartmentEffectiveness(deptId, employees)
    if (effectiveness && effectiveness.avgSkill < 40) {
      warnings.push({
        deptId,
        severity: 'low',
        message: `${def.name}: Team skill is low (${effectiveness.avgSkill}/100). Consider training.`,
      })
      deptScore -= 15
    }

    if (effectiveness && effectiveness.avgMotivation < 50) {
      warnings.push({
        deptId,
        severity: 'medium',
        message: `${def.name}: Team motivation declining (${effectiveness.avgMotivation}/100). Consider raises.`,
      })
      deptScore -= 15
    }

    deptScores[deptId] = Math.max(0, deptScore)
    totalScore -= (100 - Math.max(0, deptScore)) / (deptCount || 1)
  }

  return {
    overallScore: Math.max(0, totalScore),
    deptScores,
    warnings,
  }
}
