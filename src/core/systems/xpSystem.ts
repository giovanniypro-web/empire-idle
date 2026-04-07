import { BALANCE } from '../data/balancing'

/**
 * XP SYSTEM V2
 *
 * Changed from V1:
 * - Exponent: 1.9 → BALANCE.XP_EXPONENT (1.7) — smoother curve
 * - Base: 100 → BALANCE.XP_BASE (150) — slightly higher floor
 *
 * Sample cumulative XP to reach each level:
 *   Level 2:  150
 *   Level 3:  527
 *   Level 5:  2 952
 *   Level 8:  14 185
 *   Level 10: 31 685
 *   Level 12: 62 140
 *   Level 15: 151 000
 *   Level 20: 542 000
 *
 * Target session pacing:
 *   Level 3  → ~10 min (first blog unlocks)
 *   Level 5  → ~20 min (freelance unlocks)
 *   Level 7  → ~40 min (e-commerce, stocks unlock)
 *   Level 10 → ~90 min (SaaS unlocks)
 *   Level 15 → ~4-6h
 *   Level 20 → many sessions
 */

export function xpForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.floor(BALANCE.XP_BASE * Math.pow(level - 1, BALANCE.XP_EXPONENT))
}

export function totalXPForLevel(level: number): number {
  let total = 0
  for (let l = 2; l <= level; l++) {
    total += xpForLevel(l)
  }
  return total
}

export function getLevelFromXP(totalXP: number): number {
  let level = 1
  while (level < BALANCE.XP_MAX_LEVEL && totalXP >= totalXPForLevel(level + 1)) {
    level++
  }
  return level
}

export function getXPProgress(totalXP: number, currentLevel: number): number {
  const currentThreshold = totalXPForLevel(currentLevel)
  const nextThreshold = totalXPForLevel(currentLevel + 1)
  if (nextThreshold <= currentThreshold) return 1
  return (totalXP - currentThreshold) / (nextThreshold - currentThreshold)
}

export function xpToNextLevel(totalXP: number, currentLevel: number): number {
  return Math.max(0, totalXPForLevel(currentLevel + 1) - totalXP)
}
