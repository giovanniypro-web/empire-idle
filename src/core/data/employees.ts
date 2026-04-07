/**
 * EMPLOYEE SYSTEM (V4) — Data-driven HR foundation
 * Defines candidate archetypes with meaningful tradeoffs.
 * Hiring creates individual EmployeeState objects with these profiles as templates.
 */

import type { EmployeeRole, EmployeeDef } from '../entities'

/**
 * EMPLOYEES — Legacy export for backward compatibility
 * The old EmployeeDef system is replaced by CandidateProfile in V4
 * This export is empty to prevent import errors in legacy code
 */
export const EMPLOYEES: EmployeeDef[] = []

// Candidate archetype (template for hiring)
export interface CandidateProfile {
  id: string
  name: string
  role: EmployeeRole
  skill: number           // 0-100
  motivation: number      // 0-100
  loyalty: number         // 0-100
  potential: number       // 0-100
  tags: string[]          // ["loyal", "ambitious", "problem_solver"]
  salary: number          // per second
  hiringCost: number      // one-time
  description: string
}

/**
 * CANDIDATE ARCHETYPES
 * Create distinct tradeoffs so hiring is a strategic choice.
 */
export const CANDIDATE_PROFILES: CandidateProfile[] = [
  {
    id: 'eager_intern',
    name: 'Eager Intern / Fresh Grad',
    role: 'intern',
    skill: 20,
    motivation: 85,
    loyalty: 50,
    potential: 75,
    tags: ['eager', 'low_cost', 'trainable', 'energetic'],
    salary: 0.3,
    hiringCost: 50,
    description: 'Enthusiastic but inexperienced. Very cheap. Needs training and supervision.',
  },
  {
    id: 'reliable_junior',
    name: 'Reliable Junior',
    role: 'junior',
    skill: 50,
    motivation: 70,
    loyalty: 70,
    potential: 70,
    tags: ['stable', 'trainable', 'dependable'],
    salary: 1.0,
    hiringCost: 300,
    description: 'Solid foundational skills. Reasonable cost. Good growth potential.',
  },
  {
    id: 'ambitious_junior',
    name: 'Ambitious Rising Star',
    role: 'junior',
    skill: 55,
    motivation: 95,
    loyalty: 60,
    potential: 90,
    tags: ['ambitious', 'high_potential', 'growth_minded'],
    salary: 1.5,
    hiringCost: 400,
    description: 'Driven and smart. Could become a star. Might leave if not challenged.',
  },
  {
    id: 'specialist_mid',
    name: 'Specialist Mid-level',
    role: 'mid',
    skill: 70,
    motivation: 65,
    loyalty: 75,
    potential: 55,
    tags: ['specialist', 'reliable', 'consistent'],
    salary: 2.5,
    hiringCost: 800,
    description: 'Strong in their area. Consistent performer. Limited upside.',
  },
  {
    id: 'loyal_veteran',
    name: 'Loyal Veteran',
    role: 'mid',
    skill: 65,
    motivation: 70,
    loyalty: 90,
    potential: 45,
    tags: ['loyal', 'stable', 'dependable'],
    salary: 2.2,
    hiringCost: 700,
    description: 'Been around. Stays even in tough times. Low maintenance.',
  },
  {
    id: 'experienced_senior',
    name: 'Experienced Senior',
    role: 'senior',
    skill: 85,
    motivation: 60,
    loyalty: 70,
    potential: 40,
    tags: ['experienced', 'expensive', 'reliable'],
    salary: 5.0,
    hiringCost: 2500,
    description: 'Top-notch skills. Costly. Less room to grow.',
  },
  {
    id: 'rockstar_senior',
    name: 'Rockstar Performer',
    role: 'senior',
    skill: 90,
    motivation: 80,
    loyalty: 60,
    potential: 50,
    tags: ['star', 'problem_solver', 'leadership'],
    salary: 6.5,
    hiringCost: 3500,
    description: 'Best in class. Expensive and confident. Might leave for bigger roles.',
  },
  {
    id: 'visionary_lead',
    name: 'Visionary Lead',
    role: 'lead',
    skill: 95,
    motivation: 85,
    loyalty: 65,
    potential: 60,
    tags: ['visionary', 'leader', 'strategic'],
    salary: 10.0,
    hiringCost: 5000,
    description: 'Ready to lead. Premium cost. Transforms teams.',
  },
]

/**
 * BASE EMPLOYEE STATS — defaults used for onboarding ramps, decay, etc.
 */
export const EMPLOYEE_BASE_STATS = {
  // Onboarding: new hires ramp from this % to 100% productivity over 2 weeks
  ONBOARDING_START_PRODUCTIVITY: 0.50, // starts at 50%
  ONBOARDING_DURATION_SECONDS: 14 * 24 * 60 * 60, // 2 weeks in seconds

  // Motivation decay: per second when stationary
  BASE_MOTIVATION_DECAY_PER_SEC: 0.002,  // 0.2% per second

  // Productivity calculation: skill × motivation × current_status
  PRODUCTIVITY_CALCULATION: {
    // productivity_multiplier = (skill / 100) × (motivation / 100) × status_factor
    // where status_factor: onboarding = onboardingProgress%, active = 100%, notice = 50%, departed = 0%
  },

  // Performance scoring (0-100)
  // Increases with: skill, motivation, productivity uptime
  // Decreases with: low motivation, mistakes (future)
  PERFORMANCE_BASE_MULTIPLIER: 1.0,

  // Risk of leaving (0-100)
  // Increases if: low loyalty + low motivation + low salary_relative_to_skill
  // Decreases if: high loyalty + engaged + promoted recently
  LEAVING_RISK_MULTIPLIER: 1.0,
} as const
