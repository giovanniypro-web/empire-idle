import type { GameState, MetaState } from '../entities'

/**
 * Multi-condition gating system for Phase 4.
 * Unlocks are determined by combinations of:
 * - Player level
 * - Player reputation/popularity/satisfaction
 * - Prestige resets (career progress)
 * - Completed missions
 */

export interface GatingCondition {
  minLevel?: number
  minPrestigeResets?: number
  minReputation?: number
  minPopularity?: number
  minSatisfaction?: number
  minPrestigePoints?: number
  requiredMissions?: string[]  // mission IDs that must be completed
  requiredActivities?: string[] // activity IDs the player must own
  skillThreshold?: number
}

/**
 * Check if a feature/asset/upgrade is accessible to the player
 */
export function isContentAvailable(
  condition: GatingCondition,
  gameState: GameState,
  metaState: MetaState | null,
): boolean {
  // Level check
  if (condition.minLevel && gameState.player.level < condition.minLevel) {
    return false
  }

  // Reputation check
  if (condition.minReputation && gameState.stats.reputation < condition.minReputation) {
    return false
  }

  // Popularity check
  if (condition.minPopularity && gameState.stats.popularity < condition.minPopularity) {
    return false
  }

  // Satisfaction check
  if (condition.minSatisfaction && gameState.stats.satisfaction < condition.minSatisfaction) {
    return false
  }

  // Prestige resets check
  if (condition.minPrestigeResets && metaState) {
    if (metaState.currentPrestigeRun < condition.minPrestigeResets) {
      return false
    }
  }

  // Prestige points check (meta-game)
  if (condition.minPrestigePoints && metaState) {
    if (metaState.prestigeBank.totalPoints < condition.minPrestigePoints) {
      return false
    }
  }

  // Completed missions check
  if (condition.requiredMissions && condition.requiredMissions.length > 0) {
    for (const missionId of condition.requiredMissions) {
      const mission = gameState.missions[missionId]
      if (!mission?.completed) {
        return false
      }
    }
  }

  // Owned activities check
  if (condition.requiredActivities && condition.requiredActivities.length > 0) {
    for (const activityId of condition.requiredActivities) {
      const activity = gameState.activities[activityId]
      if (!activity || activity.count === 0) {
        return false
      }
    }
  }

  return true
}

/**
 * Get gating conditions for specific content IDs
 */
export const GATING_CONFIG: Record<string, GatingCondition> = {
  // ── ACTIVITIES ──────────────────────────────────────────
  'activity:venture_capital': {
    minLevel: 21,
    minReputation: 60,
    minPrestigeResets: 1,
  },
  'activity:global_brand': {
    minLevel: 23,
    minPopularity: 70,
    minPrestigeResets: 1,
  },
  'activity:media_empire': {
    minLevel: 25,
    minPopularity: 80,
    minReputation: 70,
    minPrestigeResets: 2,
  },
  'activity:philanthropy': {
    minLevel: 27,
    minReputation: 85,
    minPrestigeResets: 2,
  },
  'activity:civilization': {
    minLevel: 30,
    minReputation: 95,
    minPrestigeResets: 3,
  },

  // ── PREMIUM ASSETS ──────────────────────────────────────
  'asset:yacht_basic': {
    minLevel: 22,
    minPrestigePoints: 30,
    minPopularity: 50,
  },
  'asset:mega_yacht': {
    minLevel: 26,
    minPrestigePoints: 60,
    minReputation: 70,
    minPrestigeResets: 1,
  },
  'asset:penthouse_manhattan': {
    minLevel: 25,
    minPrestigePoints: 45,
    minReputation: 70,
  },
  'asset:quantum_computer': {
    minLevel: 27,
    minPrestigePoints: 55,
    minReputation: 80,
    minPrestigeResets: 1,
  },
  'asset:ai_laboratory': {
    minLevel: 29,
    minPrestigePoints: 70,
    minReputation: 90,
    minPrestigeResets: 2,
  },
  'asset:private_island': {
    minLevel: 28,
    minPrestigePoints: 70,
    minPrestigeResets: 2,
  },
  'asset:private_airline': {
    minLevel: 29,
    minPrestigePoints: 80,
    minReputation: 85,
    minPrestigeResets: 2,
  },
  'asset:luxury_hotel_chain': {
    minLevel: 30,
    minPrestigePoints: 90,
    minReputation: 95,
    minPrestigeResets: 3,
  },

  // ── PRESTIGE UPGRADES ───────────────────────────────────
  'upgrade:legacy_legendary_status': {
    minPrestigeResets: 3,
    minPrestigePoints: 60,
  },
  'upgrade:legacy_eternal_empire': {
    minPrestigeResets: 2,
    minPrestigePoints: 55,
  },
  'upgrade:legacy_time_lord': {
    minPrestigeResets: 5,
    minPrestigePoints: 45,
  },
  'upgrade:ceo_visionary': {
    minLevel: 15,
    minPrestigePoints: 25,
  },
  'upgrade:ceo_tycoon': {
    minLevel: 15,
    minPrestigePoints: 25,
  },
  'upgrade:ceo_people_person': {
    minLevel: 15,
    minPrestigePoints: 25,
  },
  'upgrade:ceo_celebrity': {
    minLevel: 15,
    minPrestigePoints: 25,
  },
  'upgrade:ceo_strategist': {
    minLevel: 15,
    minPrestigePoints: 25,
  },

  // ── SPECIALIZATIONS ────────────────────────────────────
  'spec:finance': {
    minLevel: 6,
    minReputation: 40,
  },
  'spec:growth': {
    minLevel: 6,
    minPopularity: 40,
  },
  'spec:operations': {
    minLevel: 6,
    minReputation: 35,
    minPopularity: 35,
  },

  // ── DEPARTMENTS ─────────────────────────────────────────
  'dept:level_3': {
    minLevel: 15,
    minReputation: 50,
  },
  'dept:level_5': {
    minLevel: 20,
    minReputation: 70,
    minSatisfaction: 60,
  },
}

/**
 * Get unlock reason description for UI display
 */
export function getUnlockRequirement(
  contentId: string,
  gameState: GameState,
  metaState: MetaState | null,
): string {
  const condition = GATING_CONFIG[contentId]
  if (!condition) return 'Disponible'

  const missing: string[] = []

  if (condition.minLevel && gameState.player.level < condition.minLevel) {
    missing.push(`Atteindre niveau ${condition.minLevel} (actuellement ${gameState.player.level})`)
  }

  if (condition.minReputation && gameState.stats.reputation < condition.minReputation) {
    missing.push(`Réputation ${condition.minReputation} (actuellement ${Math.floor(gameState.stats.reputation)})`)
  }

  if (condition.minPopularity && gameState.stats.popularity < condition.minPopularity) {
    missing.push(`Popularité ${condition.minPopularity} (actuellement ${Math.floor(gameState.stats.popularity)})`)
  }

  if (condition.minSatisfaction && gameState.stats.satisfaction < condition.minSatisfaction) {
    missing.push(`Satisfaction ${condition.minSatisfaction} (actuellement ${Math.floor(gameState.stats.satisfaction)})`)
  }

  if (condition.minPrestigePoints && metaState && metaState.prestigeBank.totalPoints < condition.minPrestigePoints) {
    missing.push(`Prestige ${condition.minPrestigePoints} (actuellement ${Math.floor(metaState.prestigeBank.totalPoints)})`)
  }

  if (condition.minPrestigeResets && metaState && metaState.currentPrestigeRun < condition.minPrestigeResets) {
    missing.push(`${condition.minPrestigeResets} reset(s) (actuellement ${metaState.currentPrestigeRun})`)
  }

  if (condition.requiredMissions && condition.requiredMissions.length > 0) {
    const incompleteMissions = condition.requiredMissions.filter(id => !gameState.missions[id]?.completed)
    if (incompleteMissions.length > 0) {
      missing.push(`${incompleteMissions.length} mission(s) à compléter`)
    }
  }

  return missing.length > 0 ? missing.join(' • ') : 'Disponible'
}

/**
 * Get content categories accessible at this level
 */
export function getAccessibleCategories(
  gameState: GameState,
  metaState: MetaState | null,
): {
  activities: string[]
  assets: string[]
  upgrades: string[]
} {
  const accessible: {
    activities: string[]
    assets: string[]
    upgrades: string[]
  } = {
    activities: [],
    assets: [],
    upgrades: [],
  }

  for (const [contentId, condition] of Object.entries(GATING_CONFIG)) {
    if (isContentAvailable(condition, gameState, metaState)) {
      const parts = contentId.split(':')
      if (parts.length === 2) {
        const category = parts[0]
        const id = parts[1]
        if (category === 'activity') accessible.activities.push(id)
        if (category === 'asset') accessible.assets.push(id)
        if (category === 'upgrade') accessible.upgrades.push(id)
      }
    }
  }

  return accessible
}
