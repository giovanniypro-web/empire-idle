import type { BusinessStats, SpecializationId } from '../entities'
import { SPECIALIZATIONS } from '../data/specializations'
import { BALANCE } from '../data/balancing'

// ── Stat income multipliers ────────────────────────────────────

/** Multiplier for popularity-affinity activities */
export function getPopularityMultiplier(popularity: number): number {
  return 1 + (popularity / 100) * BALANCE.POPULARITY_BOOST_MAX
}

/** Multiplier for reputation-affinity activities */
export function getReputationMultiplier(reputation: number): number {
  return 1 + (reputation / 100) * BALANCE.REPUTATION_BOOST_MAX
}

/** Multiplier for all automated activity income */
export function getSatisfactionMultiplier(satisfaction: number): number {
  return 1 + (satisfaction / 100) * BALANCE.SATISFACTION_BOOST_MAX
}

// ── Specialization helpers ─────────────────────────────────────

export function getSpecializationDef(id: SpecializationId | null) {
  if (!id) return null
  return SPECIALIZATIONS.find(s => s.id === id) ?? null
}

export function getSpecializationEffects(id: SpecializationId | null) {
  const def = getSpecializationDef(id)
  if (!def) return null
  return def.effects
}

/** XP multiplier from specialization */
export function getSpecXPMultiplier(id: SpecializationId | null): number {
  return getSpecializationEffects(id)?.xpMultiplier ?? 1
}

/** Activity buy cost multiplier from specialization */
export function getSpecActivityCostMultiplier(id: SpecializationId | null): number {
  return getSpecializationEffects(id)?.activityCostMultiplier ?? 1
}

/** Employee hire cost multiplier from specialization */
export function getSpecEmployeeCostMultiplier(id: SpecializationId | null): number {
  return getSpecializationEffects(id)?.employeeCostMultiplier ?? 1
}

/** Salary multiplier from specialization */
export function getSpecSalaryMultiplier(id: SpecializationId | null): number {
  return getSpecializationEffects(id)?.salaryMultiplier ?? 1
}

// ── Stat clamp utility ────────────────────────────────────────

export function clampStat(value: number): number {
  return Math.max(BALANCE.STAT_MIN, Math.min(BALANCE.STAT_MAX, value))
}

// ── Stat delta helpers (called from store tick) ───────────────

/**
 * Compute stat deltas for a single activity cycle completion.
 * Returns partial BusinessStats adjustments to add to current stats.
 */
export function computeStatGainFromCycle(
  statAffinity: 'popularity' | 'reputation' | 'satisfaction' | 'neutral',
  statGainPerCycle: { popularity?: number; reputation?: number; satisfaction?: number },
  count: number,
  automated: boolean,
  specialization: SpecializationId | null,
): Partial<BusinessStats> {
  const spec = getSpecializationEffects(specialization)
  const popMult  = spec?.popularityGrowthMultiplier  ?? 1
  const repMult  = spec?.reputationGrowthMultiplier  ?? 1
  const satMult  = spec?.satisfactionGrowthMultiplier ?? 1

  const delta: Partial<BusinessStats> = {}

  if (statAffinity === 'popularity' && statGainPerCycle.popularity) {
    delta.popularity = statGainPerCycle.popularity * count * popMult
  }
  if (statAffinity === 'reputation' && statGainPerCycle.reputation) {
    delta.reputation = statGainPerCycle.reputation * count * repMult
  }
  if (statAffinity === 'satisfaction' && statGainPerCycle.satisfaction) {
    delta.satisfaction = statGainPerCycle.satisfaction * count * satMult
  }
  // Automated cycles also gain satisfaction
  if (automated) {
    delta.satisfaction = (delta.satisfaction ?? 0) + 0.008 * count * satMult
  }

  return delta
}

// ── Stat display helpers ──────────────────────────────────────

export function statColor(value: number): string {
  if (value >= 70) return 'var(--green)'
  if (value >= 40) return 'var(--amber)'
  return 'var(--red)'
}

export function statLabel(key: keyof BusinessStats): string {
  switch (key) {
    case 'popularity':   return 'Popularité'
    case 'reputation':   return 'Réputation'
    case 'satisfaction': return 'Satisfaction'
    case 'prestige':     return 'Prestige'
  }
}

export function statIcon(key: keyof BusinessStats): string {
  switch (key) {
    case 'popularity':   return '⚡'
    case 'reputation':   return '🏆'
    case 'satisfaction': return '😊'
    case 'prestige':     return '✨'
  }
}

export function statTooltip(key: keyof BusinessStats): string {
  switch (key) {
    case 'popularity':
      return 'Visibilité de ta marque. Booste jusqu\'à +40% les revenus des activités grand public (blog, e-commerce, app…).'
    case 'reputation':
      return 'Crédibilité professionnelle. Booste jusqu\'à +50% les revenus des activités B2B (freelance, SaaS, agence…).'
    case 'satisfaction':
      return 'Fidélité client. Booste jusqu\'à +25% tous tes revenus automatisés. Décroît lentement sans action.'
    case 'prestige':
      return 'Prestige de votre empire. Débloque les segments luxe et les événements premium. Ne décroît jamais.'
  }
}
