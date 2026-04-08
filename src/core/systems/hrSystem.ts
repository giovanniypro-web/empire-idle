/**
 * HR SYSTEM (V4) — Employee management logic
 * Handles hiring, firing, promotions, training, and contribution calculations
 */

import type { EmployeeState, DepartmentId } from '../entities'
import { CANDIDATE_PROFILES, EMPLOYEE_BASE_STATS } from '../data/employees'
import { BALANCE } from '../data/balancing'

/**
 * Generate a new EmployeeState from a CandidateProfile
 * Called when player hires an employee
 */
export function generateEmployeeFromProfile(
  profileId: string,
  department: DepartmentId,
  now: number,
): EmployeeState | null {
  const profile = CANDIDATE_PROFILES.find(p => p.id === profileId)
  if (!profile) return null

  // Generate unique ID using timestamp + random
  const id = `emp_${now}_${Math.random().toString(36).substr(2, 9)}`

  return {
    id,
    name: profile.name,
    role: profile.role,
    department,
    salary: profile.salary,
    hiringCost: profile.hiringCost,
    skill: profile.skill,
    motivation: profile.motivation,
    loyalty: profile.loyalty,
    productivity: EMPLOYEE_BASE_STATS.ONBOARDING_START_PRODUCTIVITY * 100, // starts at 50%
    potential: profile.potential,
    seniority: getInitialSeniority(profile.role),
    riskOfLeaving: 20, // starts at baseline risk
    status: 'onboarding',
    performanceScore: profile.skill,
    hiredAt: now,
    onboardingProgress: 0,
    tags: profile.tags,

    // V4.5: Employee assignment & salary tracking
    assignedActivityId: null,  // unassigned by default
    assignmentChangedAt: now,
    monthsUnpaid: 0,
  }
}

/**
 * Get initial seniority level based on role
 */
function getInitialSeniority(role: string): number {
  switch (role) {
    case 'intern':
      return 10
    case 'junior':
      return 35
    case 'mid':
      return 60
    case 'senior':
      return 85
    case 'lead':
      return 95
    default:
      return 50
  }
}

/**
 * Calculate a single employee's contribution to activity output
 * V4: Motivation now directly affects contribution in real-time
 * Formula: skill × motivation × productivity × status_factor
 */
export function calculateEmployeeContribution(employee: EmployeeState): number {
  const skillFactor = employee.skill / 100        // 0-1 based on skill (0-100)
  const motivationFactor = employee.motivation / 100  // 0-1 based on motivation (0-100) — LIVE
  const baseProductivity = employee.productivity / 100  // 0-1 based on productivity %

  // Status multiplier (affects actual on-the-job contribution)
  let statusMultiplier = 1.0
  if (employee.status === 'onboarding') {
    statusMultiplier = employee.onboardingProgress / 100  // ramps from 0 to 100%
  } else if (employee.status === 'notice') {
    statusMultiplier = 0.5  // disengaged, reduced output
  } else if (employee.status === 'departed') {
    statusMultiplier = 0
  }

  // Combined contribution: each factor multiplicatively affects output
  const contribution = skillFactor * motivationFactor * baseProductivity * statusMultiplier

  // Each employee provides at least a baseline contribution (they're still working even at low skill/motivation)
  // and at most 1.5× if fully capable and engaged
  return Math.max(0, Math.min(1.5, contribution * 1.0))
}

/**
 * Calculate total salary cost for all employees
 */
export function calculateTotalSalary(employees: Record<string, EmployeeState>): number {
  return Object.values(employees).reduce((sum, emp) => {
    if (emp.status === 'departed') return sum  // dead employees don't cost salary
    return sum + emp.salary
  }, 0)
}

/**
 * Calculate total employee contribution (sum of all active employees)
 * Returns a multiplier that increases activity output
 */
export function calculateTotalEmployeeContribution(employees: Record<string, EmployeeState>): number {
  return Object.values(employees).reduce((sum, emp) => {
    return sum + calculateEmployeeContribution(emp)
  }, 0)
}

/**
 * Check if player can hire more employees
 */
export function canHireMore(currentOccupancy: number, maxCapacity: number): boolean {
  return currentOccupancy < maxCapacity
}

/**
 * Get number of available office seats
 */
export function getAvailableSeats(currentOccupancy: number, maxCapacity: number): number {
  return Math.max(0, maxCapacity - currentOccupancy)
}

/**
 * Promote employee to next role
 * For now: increases skill + salary + role (basic implementation)
 */
export function promoteEmployee(
  employee: EmployeeState,
): Partial<EmployeeState> | null {
  const roleProgression = ['intern', 'junior', 'mid', 'senior', 'lead']
  const currentIndex = roleProgression.indexOf(employee.role)

  if (currentIndex >= roleProgression.length - 1) {
    return null  // already at max role
  }

  const newRole = roleProgression[currentIndex + 1] as any

  return {
    role: newRole,
    skill: Math.min(100, employee.skill + 15),
    seniority: Math.min(100, employee.seniority + 20),
    salary: employee.salary * 1.5,  // salary increases on promotion
    potential: Math.min(100, employee.potential + 10),
    motivation: Math.min(100, employee.motivation + 10),  // happy about promotion
  }
}

/**
 * Train employee to increase skill
 * Costs money, increases skill and potential slightly
 */
export function trainEmployee(
  employee: EmployeeState,
  skillIncrease: number,
): Partial<EmployeeState> | null {
  if (employee.skill >= 100) return null  // already maxed out

  return {
    skill: Math.min(100, employee.skill + skillIncrease),
    motivation: Math.min(100, employee.motivation + 5),  // motivated by training investment
    performanceScore: Math.min(100, employee.performanceScore + skillIncrease * 0.5),
  }
}

/**
 * Update employee motivation and risk of leaving
 * Called during tick to simulate morale changes
 * V4: Loyalty now reduces motivation decay rate
 */
export function updateEmployeeMorale(
  employee: EmployeeState,
  deltaSeconds: number,
): Partial<EmployeeState> {
  let newMotivation = employee.motivation

  // Motivation naturally decays
  // Loyalty reduces decay (loyal employees stay motivated longer)
  const loyaltyMod = 1 - (employee.loyalty / 100) * 0.5  // ranges from 1.0× to 0.5× decay
  const decayRate = EMPLOYEE_BASE_STATS.BASE_MOTIVATION_DECAY_PER_SEC * loyaltyMod

  if (employee.motivation < 50) {
    newMotivation -= decayRate * deltaSeconds * 100
  }

  // Motivation recovers slowly if well-compensated and senior
  if (employee.skill > 70 && employee.salary > 3.0) {
    newMotivation += 0.001 * deltaSeconds * 100
  }

  newMotivation = Math.max(0, Math.min(100, newMotivation))

  // Calculate risk of leaving
  // High risk if: low loyalty + low motivation + low skill (can find better elsewhere)
  const loyaltyFactor = employee.loyalty / 100
  const motivationFactor = newMotivation / 100  // use new motivation
  const salaryReasonable = employee.salary >= getRecommendedSalary(employee.skill)

  let riskOfLeaving = 50  // base risk
  riskOfLeaving -= loyaltyFactor * 30  // loyalty reduces risk
  riskOfLeaving -= motivationFactor * 20  // happy people stay
  if (!salaryReasonable) riskOfLeaving += 25  // underpaid people leave
  riskOfLeaving += (100 - employee.skill) * 0.1  // low skill = easier to leave

  riskOfLeaving = Math.max(0, Math.min(100, riskOfLeaving))

  return {
    motivation: newMotivation,
    riskOfLeaving,
  }
}

/**
 * Update onboarding progress
 * Rampsproductivity from 50% to 100% over 2 weeks
 */
export function updateOnboarding(
  employee: EmployeeState,
  deltaSeconds: number,
): Partial<EmployeeState> | null {
  if (employee.status !== 'onboarding') return null

  const totalOnboardingTime = EMPLOYEE_BASE_STATS.ONBOARDING_DURATION_SECONDS
  const newProgress = Math.min(
    100,
    employee.onboardingProgress + (deltaSeconds / totalOnboardingTime) * 100
  )

  const newProductivity = EMPLOYEE_BASE_STATS.ONBOARDING_START_PRODUCTIVITY * 100
    + (newProgress / 100) * (100 - EMPLOYEE_BASE_STATS.ONBOARDING_START_PRODUCTIVITY * 100)

  const update: Partial<EmployeeState> = {
    onboardingProgress: newProgress,
    productivity: newProductivity,
  }

  // When onboarding completes, mark as active
  if (newProgress >= 100) {
    update.status = 'active'
    update.onboardingProgress = 100
    update.productivity = 100
  }

  return update
}

/**
 * Get recommended salary for a skill level
 * Used to determine if employee is underpaid
 */
function getRecommendedSalary(skill: number): number {
  // Formula: 0.3 + (skill / 100) * 9.7
  // At skill 0: 0.3/s
  // At skill 100: 10/s
  return 0.3 + (skill / 100) * 9.7
}

/**
 * Get candidate profile by ID
 */
export function getCandidateProfile(profileId: string) {
  return CANDIDATE_PROFILES.find(p => p.id === profileId)
}

/**
 * Check if an employee should depart due to low morale/loyalty
 * V4: When risk exceeds threshold, employee leaves
 */
export function checkEmployeeDeparture(employee: EmployeeState): boolean {
  if (employee.status === 'departed' || employee.status === 'notice') return false

  // Depart if risk is too high (> 85%)
  return employee.riskOfLeaving > 85
}
