import type { GameState, DepartmentId, MetaState, CareerStats, PrestigeBank } from '../entities'
import { DEFAULT_STRATEGIES } from '../entities'
import { ACTIVITIES } from '../data/activities'
import { UPGRADES } from '../data/upgrades'
import { MISSIONS } from '../data/missions'
import { MARKET_LISTINGS } from '../data/items'
import { DEPARTMENTS } from '../data/departments'
import { BALANCE } from '../data/balancing'
import { initStockStates } from '../systems/stockSystem'
import { createInitialOffice } from '../data/office'

const SAVE_KEY = 'empire_idle_v4'   // V4 — new HR system, discards V3 saves
const META_SAVE_KEY = 'empire_idle_v4_meta'  // Phase 4 — meta progression
const SAVE_VERSION = 4
const META_VERSION = 1

interface SaveFile {
  version: number
  savedAt: number
  state: GameState
}

interface MetaSaveFile {
  version: number
  savedAt: number
  state: MetaState
}

function createInitialDepartments(): GameState['departments'] {
  const result = {} as GameState['departments']
  for (const def of DEPARTMENTS) {
    result[def.id as DepartmentId] = { id: def.id as DepartmentId, level: 0, effectiveness: null }
  }
  return result
}

export function createInitialGameState(): GameState {
  const now = Date.now()

  const activities: GameState['activities'] = {}
  for (const def of ACTIVITIES) {
    activities[def.id] = { id: def.id, count: 0, progress: 0, isRunning: false, totalEarned: 0 }
  }

  const upgrades: GameState['upgrades'] = {}
  for (const def of UPGRADES) {
    upgrades[def.id] = { id: def.id, purchased: false }
  }

  // V4 — employees now are individual EmployeeState objects, not definitions
  // Start with empty roster
  const employees: GameState['employees'] = {}

  const missions: GameState['missions'] = {}
  for (const def of MISSIONS) {
    missions[def.id] = { id: def.id, completed: false, claimedReward: false }
  }

  const marketListings: GameState['marketListings'] = {}
  for (const listing of MARKET_LISTINGS) {
    marketListings[listing.id] = {
      id: listing.id,
      currentBuyPrice: listing.baseBuyPrice,
      currentSellPrice: listing.baseSellPrice,
      trend: 0,
    }
  }

  return {
    player: {
      money: 50,
      xp: 0,
      level: 1,
      totalEarned: 0,
      totalClicks: 0,
      talentPoints: 0,
    },
    stats: {
      popularity:   BALANCE.STAT_INITIAL_POPULARITY,
      reputation:   BALANCE.STAT_INITIAL_REPUTATION,
      satisfaction: BALANCE.STAT_INITIAL_SATISFACTION,
      prestige:     BALANCE.STAT_INITIAL_PRESTIGE,
    },
    profile: {
      playerName:  'Joueur',
      companyName: 'Ma Startup',
      avatarIndex: 0,
    },

    // V3 — setup wizard
    setupComplete: false,
    companyType: null,
    marketSegment: null,

    // V3 — strategies
    strategies: { ...DEFAULT_STRATEGIES },
    specialization: null,

    // V3 — departments
    departments: createInitialDepartments(),

    // V3 — assets
    ownedAssets: {},

    // V3 — talents
    talents: {},

    // V4 — HR system
    office: createInitialOffice(),

    // Existing systems
    activities,
    upgrades,
    employees,
    inventory: {},
    marketListings,
    stocks: initStockStates(),
    missions,
    activeEvent: null,
    activeEffects: [],
    lastSaved: now,
    lastTick: now,
    lastStockUpdate: now,
    lastMarketUpdate: now,
    lastEventTime: now,
    nextEventDelay:
      BALANCE.EVENT_MIN_DELAY_MS +
      Math.random() * (BALANCE.EVENT_MAX_DELAY_MS - BALANCE.EVENT_MIN_DELAY_MS),
    gameStarted: now,
    offlineEarnings: null,
  }
}

export function saveGame(state: GameState): void {
  try {
    const saveFile: SaveFile = {
      version: SAVE_VERSION,
      savedAt: Date.now(),
      state,
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveFile))
  } catch (e) {
    console.error('Save failed:', e)
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null

    const saveFile = JSON.parse(raw) as SaveFile
    if (saveFile.version !== SAVE_VERSION) return null  // old save → fresh start

    const saved = saveFile.state
    const initial = createInitialGameState()

    const merged: GameState = {
      ...initial,
      ...saved,
      player: { ...initial.player, ...saved.player },
      stats: { ...initial.stats, ...(saved.stats ?? {}) },
      profile: { ...initial.profile, ...(saved.profile ?? {}) },

      // V3 fields
      setupComplete: saved.setupComplete ?? initial.setupComplete,
      companyType: saved.companyType ?? initial.companyType,
      marketSegment: saved.marketSegment ?? initial.marketSegment,
      strategies: { ...initial.strategies, ...(saved.strategies ?? {}) },
      specialization: saved.specialization ?? initial.specialization,
      departments: mergeRecord(initial.departments, saved.departments ?? {}),
      ownedAssets: { ...initial.ownedAssets, ...(saved.ownedAssets ?? {}) },
      talents: { ...initial.talents, ...(saved.talents ?? {}) },

      // V4 — HR system
      office: { ...initial.office, ...(saved.office ?? {}) },

      // Existing records
      activities:     mergeRecord(initial.activities, saved.activities ?? {}),
      upgrades:       mergeRecord(initial.upgrades, saved.upgrades ?? {}),
      employees:      mergeRecord(initial.employees, saved.employees ?? {}),
      marketListings: mergeRecord(initial.marketListings, saved.marketListings ?? {}),
      stocks:         mergeRecord(initial.stocks, saved.stocks ?? {}),
      missions:       mergeRecord(initial.missions, saved.missions ?? {}),

      // Reset transient
      activeEvent: null,
      activeEffects: [],
      offlineEarnings: null,
    }

    return merged
  } catch (e) {
    console.error('Load failed:', e)
    return null
  }
}

export function deleteGame(): void {
  localStorage.removeItem(SAVE_KEY)
}

export function createInitialMetaState(): MetaState {
  return {
    profile: {
      playerName: 'Joueur',
      companyName: 'Ma Startup',
    },
    careerStats: {
      totalRunsCompleted: 0,
      totalPlaytime: 0,
      totalMoneyEarned: 0,
      totalPrestigeEarned: 0,
      bestRunMoney: 0,
      bestRunPrestige: 0,
      bestRunLevel: 0,
      totalEmployeesHired: 0,
      totalEmployeesManaged: 0,
      prestigeResets: [],
    },
    prestigeBank: {
      totalPoints: 0,
      upgrades: {},
      unlockedCEOArchetypes: [],
    },
    currentPrestigeRun: 0,
  }
}

export function saveMetaGame(state: MetaState): void {
  try {
    const saveFile: MetaSaveFile = {
      version: META_VERSION,
      savedAt: Date.now(),
      state,
    }
    localStorage.setItem(META_SAVE_KEY, JSON.stringify(saveFile))
  } catch (e) {
    console.error('Meta save failed:', e)
  }
}

export function loadMetaGame(): MetaState | null {
  try {
    const raw = localStorage.getItem(META_SAVE_KEY)
    if (!raw) return null

    const saveFile = JSON.parse(raw) as MetaSaveFile
    if (saveFile.version !== META_VERSION) return null

    return saveFile.state
  } catch (e) {
    console.error('Meta load failed:', e)
    return null
  }
}

function mergeRecord<T extends object>(
  defaults: Record<string, T>,
  saved: Record<string, T>,
): Record<string, T> {
  const result: Record<string, T> = { ...defaults }
  for (const [key, value] of Object.entries(saved)) {
    if (key in result) {
      result[key] = { ...result[key], ...value }
    }
  }
  return result
}

export function harvestPrestigeFromRun(
  gameState: GameState,
  prestigeValue: number,
  metaState: MetaState,
): MetaState {
  const updated = { ...metaState }
  const now = Date.now()
  const playtime = now - (gameState.gameStarted ?? now)

  // Update career stats
  updated.careerStats = {
    ...updated.careerStats,
    totalRunsCompleted: updated.careerStats.totalRunsCompleted + 1,
    totalPlaytime: updated.careerStats.totalPlaytime + playtime,
    totalMoneyEarned: updated.careerStats.totalMoneyEarned + gameState.player.money,
    totalPrestigeEarned: updated.careerStats.totalPrestigeEarned + prestigeValue,
    bestRunMoney: Math.max(updated.careerStats.bestRunMoney, gameState.player.money),
    bestRunPrestige: Math.max(updated.careerStats.bestRunPrestige, prestigeValue),
    bestRunLevel: Math.max(updated.careerStats.bestRunLevel, gameState.player.level),
    totalEmployeesHired: updated.careerStats.totalEmployeesHired + Object.keys(gameState.employees).length,
    totalEmployeesManaged: updated.careerStats.totalEmployeesManaged + Object.keys(gameState.employees).length, // Simplified: can be refined later
    prestigeResets: [
      ...updated.careerStats.prestigeResets,
      {
        timestamp: now,
        prestigeEarned: prestigeValue,
        finalLevel: gameState.player.level,
        finalMoney: gameState.player.money,
        companyName: gameState.profile.companyName,
      },
    ],
  }

  // Add prestige to bank
  updated.prestigeBank = {
    ...updated.prestigeBank,
    totalPoints: updated.prestigeBank.totalPoints + prestigeValue,
  }

  // Increment run counter for tracking
  updated.currentPrestigeRun = updated.currentPrestigeRun + 1

  return updated
}
