/**
 * OFFICE SYSTEM (V4) — Headquarters capacity and expansion
 * The office level determines max headcount and scales with progression.
 */

import type { OfficeState } from '../entities'

export type OfficeLevel = 'coworking' | 'small_office' | 'medium_office' | 'large_building' | 'campus'

export interface OfficeLevelDef {
  level: OfficeLevel
  maxCapacity: number
  expansionCost: number          // cost to upgrade to next level
  description: string
  icon: string
}

/**
 * OFFICE LEVELS
 * Progression from coworking space → full campus
 * Enforces capacity constraints and expansion costs
 */
export const OFFICE_LEVELS: OfficeLevelDef[] = [
  {
    level: 'coworking',
    maxCapacity: 3,
    expansionCost: 5_000,
    description: 'Shared coworking space. Very limited headcount.',
    icon: '🏢',
  },
  {
    level: 'small_office',
    maxCapacity: 10,
    expansionCost: 50_000,
    description: 'Small dedicated office. Room for a small team.',
    icon: '🏬',
  },
  {
    level: 'medium_office',
    maxCapacity: 30,
    expansionCost: 250_000,
    description: 'Medium office space. Multiple departments possible.',
    icon: '🏭',
  },
  {
    level: 'large_building',
    maxCapacity: 80,
    expansionCost: 1_500_000,
    description: 'Large dedicated building. Serious organizational structure.',
    icon: '🏛️',
  },
  {
    level: 'campus',
    maxCapacity: 250,
    expansionCost: 0,   // final level, no further expansion
    description: 'Full campus with multiple buildings. Enterprise scale.',
    icon: '🏰',
  },
]

/**
 * Create initial office state
 */
export function createInitialOffice(): OfficeState {
  return {
    level: 'coworking',
    maxCapacity: 3,
    currentOccupancy: 0,
    expansionCost: 5_000,
    totalExpansions: 0,
  }
}

/**
 * Get office definition by level
 */
export function getOfficeLevelDef(level: OfficeLevel): OfficeLevelDef | undefined {
  return OFFICE_LEVELS.find(o => o.level === level)
}

/**
 * Get next office level definition
 */
export function getNextOfficeLevelDef(currentLevel: OfficeLevel): OfficeLevelDef | undefined {
  const currentIndex = OFFICE_LEVELS.findIndex(o => o.level === currentLevel)
  return currentIndex >= 0 && currentIndex < OFFICE_LEVELS.length - 1
    ? OFFICE_LEVELS[currentIndex + 1]
    : undefined
}
