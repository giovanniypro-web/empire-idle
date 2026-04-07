import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type {
  FullStoreState,
  Screen,
  AppNotification,
  GameEventDef,
  ActiveEffect,
  SpecializationId,
  BusinessStats,
  DepartmentId,
  CompanyTypeId,
  MarketSegmentId,
  CompanyStrategies,
  MetaState,
} from '../core/entities'
import { ACTIVITIES } from '../core/data/activities'
import { UPGRADES } from '../core/data/upgrades'
import { CANDIDATE_PROFILES } from '../core/data/employees'
import { getNextOfficeLevelDef } from '../core/data/office'
import { MARKET_LISTINGS, ITEMS } from '../core/data/items'
import { STOCKS } from '../core/data/stocks'
import { EVENTS } from '../core/data/events'
import { MISSIONS } from '../core/data/missions'
import { DEPARTMENTS } from '../core/data/departments'
import { ASSETS } from '../core/data/assets'
import { TALENTS } from '../core/data/talents'
import { COMPANY_TYPES } from '../core/data/companyTypes'
import { MARKET_SEGMENTS } from '../core/data/marketSegments'
import { PRESTIGE_UPGRADES } from '../core/data/prestige-upgrades'
import { BALANCE } from '../core/data/balancing'
import {
  getActivityCost,
  getEmployeeCost,
  getActivityDuration,
  getActivityIncomePerCycle,
  getActivityXPPerCycle,
  isActivityAutomated,
  getTotalIncomePerSecond,
  calculateTotalSalary,
  updateMarketPrice,
} from '../core/systems/economySystem'
import {
  computeStatGainFromCycle,
  clampStat,
  getSpecXPMultiplier,
  getSpecActivityCostMultiplier,
} from '../core/systems/statsSystem'
import { getLevelFromXP } from '../core/systems/xpSystem'
import { checkNewlyCompletedMissions } from '../core/systems/missionSystem'
import { updateStockPrice, applyStockShock, calculateDividend } from '../core/systems/stockSystem'
import { calculateOfflineProgress } from '../core/systems/offlineSystem'
import {
  getAggregatedDepartmentEffects,
  getTotalDepartmentCostPerSecond,
  getDepartmentUpgradeCost,
  calculateDepartmentEffectiveness,
} from '../core/systems/departmentSystem'
import {
  getAggregatedTalentEffects,
  canPurchaseTalent,
} from '../core/systems/talentSystem'
import {
  generateEmployeeFromProfile,
  calculateTotalSalary as calculateTotalSalarySysHR,
  calculateTotalEmployeeContribution,
  canHireMore,
  promoteEmployee,
  trainEmployee,
  updateEmployeeMorale,
  updateOnboarding,
  checkEmployeeDeparture,
} from '../core/systems/hrSystem'
import {
  createInitialGameState,
  saveGame,
  loadGame as loadFromStorage,
  createInitialMetaState,
  saveMetaGame,
  loadMetaGame,
  harvestPrestigeFromRun,
} from '../core/engine/saveSystem'

// ── Store actions ──────────────────────────────────────────────

interface StoreActions {
  tick: (now: number) => void
  clickActivity: (id: string) => void
  buyActivity: (id: string, qty?: number) => void
  buyUpgrade: (id: string) => void
  // V4 — HR system actions
  hireEmployee: (candidateProfileId: string, department: import('../core/entities').DepartmentId) => void
  fireEmployee: (employeeId: string) => void
  promoteEmployeeAction: (employeeId: string) => void
  trainEmployeeAction: (employeeId: string, cost: number) => void
  giveRaise: (employeeId: string) => void
  expandOffice: () => void
  buyMarketItem: (listingId: string, qty: number) => void
  sellInventoryItem: (itemId: string, qty: number) => void
  buyStock: (stockId: string, shares: number) => void
  sellStock: (stockId: string, shares: number) => void
  resolveEvent: (choiceId: string) => void
  claimMission: (missionId: string) => void
  setSpecialization: (id: SpecializationId) => void
  updateProfile: (data: Partial<{ playerName: string; companyName: string; avatarIndex: number }>) => void
  // V3 new actions
  completeSetup: (companyType: CompanyTypeId, marketSegment: MarketSegmentId) => void
  setStrategy: (axis: keyof CompanyStrategies, value: string) => void
  upgradeDepartment: (deptId: DepartmentId) => void
  buyAsset: (assetId: string) => void
  purchaseTalent: (talentId: string) => void
  // Existing utility
  saveGame: () => void
  loadGame: () => void
  resetGame: () => void
  prestigeReset: (prestigeValue: number) => void
  buyPrestigeUpgrade: (upgradeId: string) => void
  setScreen: (screen: Screen) => void
  addNotification: (message: string, type: AppNotification['type']) => void
  dismissNotification: (id: string) => void
  dismissOfflineEarnings: () => void
}

export type GameStoreState = FullStoreState & StoreActions

// ── Store ──────────────────────────────────────────────────────

export const useGameStore = create<GameStoreState>()(
  immer((set, get) => ({
    ...createInitialGameState(),
    currentScreen: 'dashboard' as Screen,
    notifications: [],

    // ── TICK ──────────────────────────────────────────────────
    tick: (now: number) => {
      set(state => {
        const deltaTime = (now - state.lastTick) / 1000
        if (deltaTime <= 0 || deltaTime > 60) {
          state.lastTick = now
          return
        }

        // Pre-compute aggregated V3 effect layers
        const deptEffects = getAggregatedDepartmentEffects(
          state.departments as Record<DepartmentId, import('../core/entities').DepartmentState>,
        )
        const talentFx = getAggregatedTalentEffects(state.talents)

        // V4 — Update employees (onboarding, morale, risk, departure)
        for (const emp of Object.values(state.employees)) {
          if (emp.status === 'departed') continue

          // Update onboarding progress
          const onboardingUpdate = updateOnboarding(emp, deltaTime)
          if (onboardingUpdate) Object.assign(emp, onboardingUpdate)

          // Update morale and leaving risk
          const moraleUpdate = updateEmployeeMorale(emp, deltaTime)
          if (moraleUpdate) Object.assign(emp, moraleUpdate)

          // Check for departure (auto-leave if risk too high)
          if (checkEmployeeDeparture(emp)) {
            emp.status = 'departed'
            state.office.currentOccupancy = Math.max(0, state.office.currentOccupancy - 1)
            state.stats.reputation = clampStat(state.stats.reputation - BALANCE.EMPLOYEE_DEPARTURE_NOTIFICATION_MORALE_HIT)
            get().addNotification(`⚠️ ${emp.name} left due to low morale.`, 'warning')
          }
        }

        // V4.1 — Calculate department effectiveness based on employees
        for (const deptId of Object.keys(state.departments) as import('../core/entities').DepartmentId[]) {
          const dept = state.departments[deptId]
          if (!dept) continue
          dept.effectiveness = calculateDepartmentEffectiveness(
            deptId,
            Object.values(state.employees),
          )
        }

        // ── 1. Process activities ─────────────────────────────
        for (const def of ACTIVITIES) {
          const act = state.activities[def.id]
          if (!act || act.count === 0) continue

          const automated = isActivityAutomated(def.id, state.employees)

          // Activity speed: department + talent speed multipliers
          const speedOverride = deptEffects.activitySpeedMultiplier
          const duration = getActivityDuration(def.id, state.upgrades, state.employees) / speedOverride

          if (!act.isRunning && automated) act.isRunning = true

          if (act.isRunning) {
            act.progress += deltaTime

            if (act.progress >= duration) {
              // Income base
              let income = getActivityIncomePerCycle(
                def.id, act.count, state.upgrades, state.employees,
                state.inventory, state.activeEffects, now,
                state.stats, state.specialization, state.departments,
              )

              // V4 — Employee contribution multiplier
              if (automated) {
                const employeeContribution = calculateTotalEmployeeContribution(state.employees)
                // Each point of employee contribution adds directly to output
                // e.g., 3 employees at 0.5 each = 1.5x multiplier
                income *= 1 + (employeeContribution * BALANCE.EMPLOYEE_CONTRIBUTION_BASE)
              }

              // Satisfaction boost for automated activities
              if (automated) {
                const { satisfaction } = state.stats
                income *= 1 + (satisfaction / 100) * BALANCE.SATISFACTION_BOOST_MAX
              }

              // Company-type per-activity multiplier
              if (state.companyType) {
                const typeDef = COMPANY_TYPES.find(t => t.id === state.companyType)
                if (typeDef) {
                  const perActivity = typeDef.effects.incomeMultiplierByActivity[def.id]
                  if (perActivity) income *= perActivity
                  income *= typeDef.effects.allIncomeMultiplier
                }
              }

              // Market segment revenue multiplier
              if (state.marketSegment) {
                const segDef = MARKET_SEGMENTS.find(s => s.id === state.marketSegment)
                if (segDef) income *= segDef.revenueMultiplier
              }

              // Department income multipliers
              income *= deptEffects.allIncomeMultiplier
              if (automated) income *= deptEffects.automatedIncomeMultiplier
              if (def.statAffinity === 'popularity') income *= deptEffects.consumerIncomeMultiplier

              // Talent income multiplier
              income *= talentFx.allIncomeMultiplier

              // Talent employee income bonus add
              if (talentFx.employeeIncomeBonusAdd > 0) {
                income *= 1 + talentFx.employeeIncomeBonusAdd
              }

              // XP — specialization + dept + talent
              const xp = getActivityXPPerCycle(
                def.id, act.count, state.upgrades, state.activeEffects, now,
              )
                * getSpecXPMultiplier(state.specialization)
                * deptEffects.xpMultiplier
                * talentFx.xpMultiplier

              state.player.money += income
              state.player.xp += xp
              state.player.totalEarned += income
              act.totalEarned += income

              // Stat gains
              const statDelta = computeStatGainFromCycle(
                def.statAffinity,
                def.statGainPerCycle,
                act.count,
                automated,
                state.specialization,
              )
              if (statDelta.popularity) {
                state.stats.popularity = clampStat(
                  state.stats.popularity + statDelta.popularity * deptEffects.popularityGrowthMultiplier,
                )
              }
              if (statDelta.reputation) {
                state.stats.reputation = clampStat(
                  state.stats.reputation + statDelta.reputation * deptEffects.reputationGrowthMultiplier,
                )
              }
              if (statDelta.satisfaction) {
                state.stats.satisfaction = clampStat(
                  state.stats.satisfaction + statDelta.satisfaction * deptEffects.satisfactionGrowthMultiplier,
                )
              }

              if (automated) {
                act.progress = act.progress - duration
              } else {
                act.progress = 0
                act.isRunning = false
              }
            }
          }
        }

        // ── 1b. Passive income from assets ────────────────────
        if (talentFx.passiveIncomeAdd > 0) {
          const passiveIncome = talentFx.passiveIncomeAdd * deltaTime
          state.player.money += passiveIncome
          state.player.totalEarned += passiveIncome
        }

        // Asset passive income
        let assetPassive = 0
        for (const [assetId, qty] of Object.entries(state.ownedAssets)) {
          if (!qty) continue
          const assetDef = ASSETS.find(a => a.id === assetId)
          if (assetDef && assetDef.passiveIncome > 0) {
            assetPassive += assetDef.passiveIncome * qty
          }
        }
        if (assetPassive > 0) {
          state.player.money += assetPassive * deltaTime
          state.player.totalEarned += assetPassive * deltaTime
        }

        // ── 2. Deduct operating costs ──────────────────────────
        // 2a. Salaries
        const salaryMult = deptEffects.salaryMultiplier * talentFx.operatingCostMultiplier
        const totalSalary = calculateTotalSalary(state.employees, state.specialization) * salaryMult
        if (totalSalary > 0) {
          state.player.money = Math.max(0, state.player.money - totalSalary * deltaTime)
        }

        // 2b. Department ongoing costs
        const deptCost = getTotalDepartmentCostPerSecond(
          state.departments as Record<DepartmentId, import('../core/entities').DepartmentState>,
        ) * deptEffects.operatingCostMultiplier * BALANCE.DEPT_ONGOING_COST_MULTIPLIER
        if (deptCost > 0) {
          state.player.money = Math.max(0, state.player.money - deptCost * deltaTime)
        }

        // 2c. Asset maintenance costs
        let assetMaintenance = 0
        for (const [assetId, qty] of Object.entries(state.ownedAssets)) {
          if (!qty) continue
          const assetDef = ASSETS.find(a => a.id === assetId)
          if (assetDef && assetDef.maintenanceCost > 0) {
            assetMaintenance += assetDef.maintenanceCost * qty
          }
        }
        if (assetMaintenance > 0) {
          state.player.money = Math.max(0, state.player.money - assetMaintenance * deltaTime * BALANCE.ASSET_MAINTENANCE_MULTIPLIER)
        }

        // 2d. Structural rent (grows with level)
        const baseRent = BALANCE.BASE_RENT_PER_SEC *
          Math.pow(BALANCE.RENT_LEVEL_MULTIPLIER, state.player.level - 1)
        state.player.money = Math.max(0, state.player.money - baseRent * deltaTime)

        // ── 3. Stat passive decay ─────────────────────────────
        const satisfactionDecay = BALANCE.SATISFACTION_DECAY_PER_SEC
          * deptEffects.satisfactionDecayMultiplier
          * talentFx.satisfactionDecayMultiplier

        state.stats.satisfaction = clampStat(
          state.stats.satisfaction - satisfactionDecay * deltaTime,
        )
        state.stats.popularity = clampStat(
          state.stats.popularity - BALANCE.POPULARITY_DECAY_PER_SEC * deltaTime,
        )
        state.stats.reputation = clampStat(
          state.stats.reputation - BALANCE.REPUTATION_DECAY_PER_SEC * deltaTime,
        )

        // ── 4. Level up check ─────────────────────────────────
        const newLevel = getLevelFromXP(state.player.xp)
        if (newLevel > state.player.level) {
          const levelsGained = newLevel - state.player.level
          state.player.level = newLevel
          // Talent points: 1 per level gained
          state.player.talentPoints += levelsGained * BALANCE.TALENT_POINTS_PER_LEVEL
          // Reputation boost on level up
          state.stats.reputation = clampStat(state.stats.reputation + newLevel * 0.8)
        }

        // ── 5. Remove expired active effects ──────────────────
        state.activeEffects = state.activeEffects.filter(e => e.expiresAt > now)

        // ── 6. Update stock prices (every 5 seconds) ──────────
        if (now - state.lastStockUpdate >= 5000) {
          for (const def of STOCKS) {
            const stockState = state.stocks[def.id]
            if (!stockState) continue
            state.stocks[def.id] = updateStockPrice(def, stockState)

            const dividend = calculateDividend(def, stockState)
            if (dividend > 0) {
              state.player.money += dividend
              state.player.totalEarned += dividend
            }
          }
          state.lastStockUpdate = now
        }

        // ── 7. Update market prices (every 45 seconds) ────────
        if (now - state.lastMarketUpdate >= 45000) {
          for (const listing of MARKET_LISTINGS) {
            const mState = state.marketListings[listing.id]
            if (!mState) continue
            const updated = updateMarketPrice(
              mState.currentBuyPrice, listing.baseBuyPrice,
              mState.trend, listing.priceVolatility,
            )
            state.marketListings[listing.id] = { ...mState, ...updated }
          }
          state.lastMarketUpdate = now
        }

        // ── 8. Random event trigger ───────────────────────────
        if (!state.activeEvent && (now - state.lastEventTime) >= state.nextEventDelay) {
          const eligibleEvents = EVENTS.filter(e => e.minLevel <= state.player.level)
          if (eligibleEvents.length > 0) {
            const totalWeight = eligibleEvents.reduce((s, e) => s + e.weight, 0)
            let rand = Math.random() * totalWeight
            for (const event of eligibleEvents) {
              rand -= event.weight
              if (rand <= 0) {
                state.activeEvent = event
                break
              }
            }
          }
          state.lastEventTime = now
          state.nextEventDelay =
            BALANCE.EVENT_MIN_DELAY_MS +
            Math.random() * (BALANCE.EVENT_MAX_DELAY_MS - BALANCE.EVENT_MIN_DELAY_MS)
        }

        // ── 9. Check missions ─────────────────────────────────
        const ips = getTotalIncomePerSecond(
          state.activities, state.upgrades, state.employees,
          state.inventory, state.activeEffects, now,
          state.stats, state.specialization, state.departments,
        )
        const newlyCompleted = checkNewlyCompletedMissions(
          state as unknown as import('../core/entities').GameState, ips,
        )
        for (const mId of newlyCompleted) {
          if (state.missions[mId]) state.missions[mId].completed = true
        }

        // ── 10. Auto-save (every 30 seconds) ─────────────────
        if (now - state.lastSaved >= 30000) {
          saveGame(state as unknown as import('../core/entities').GameState)
          state.lastSaved = now
        }

        state.lastTick = now
      })
    },

    // ── CLICK ACTIVITY ────────────────────────────────────────
    clickActivity: (id: string) => {
      set(state => {
        const act = state.activities[id]
        if (!act || act.count === 0 || act.isRunning) return
        if (isActivityAutomated(id, state.employees)) return
        act.isRunning = true
        act.progress = 0
        state.player.totalClicks += 1
      })
    },

    // ── BUY ACTIVITY ──────────────────────────────────────────
    buyActivity: (id: string, qty = 1) => {
      set(state => {
        const def = ACTIVITIES.find(a => a.id === id)
        if (!def) return
        if (def.unlockLevel > state.player.level) return

        let totalCost = 0
        const currentOwned = state.activities[id]?.count ?? 0
        for (let i = 0; i < qty; i++) {
          totalCost += getActivityCost(id, currentOwned + i, state.specialization)
        }
        if (state.player.money < totalCost) return

        state.player.money -= totalCost
        state.activities[id].count += qty
      })
    },

    // ── BUY UPGRADE ───────────────────────────────────────────
    buyUpgrade: (id: string) => {
      set(state => {
        const def = UPGRADES.find(u => u.id === id)
        if (!def) return
        if (state.upgrades[id]?.purchased) return

        const levelReq = state.specialization === 'innovation'
          ? Math.max(1, def.unlockLevel - 1)
          : def.unlockLevel
        if (levelReq > state.player.level) return

        if (def.requires?.some(req => !state.upgrades[req]?.purchased)) return
        if (state.player.money < def.cost) return

        state.player.money -= def.cost
        state.upgrades[id].purchased = true
        state.stats.reputation = clampStat(state.stats.reputation + 1)
      })
    },

    // ── HIRE EMPLOYEE (V4) ────────────────────────────────────
    hireEmployee: (candidateProfileId: string, department: DepartmentId) => {
      set(state => {
        // Check capacity
        if (!canHireMore(state.office.currentOccupancy, state.office.maxCapacity)) {
          get().addNotification('Office is at capacity. Expand headquarters to hire more.', 'warning')
          return
        }

        // Get candidate profile
        const profile = CANDIDATE_PROFILES.find(p => p.id === candidateProfileId)
        if (!profile) return

        // Check cost
        if (state.player.money < profile.hiringCost) {
          get().addNotification(`Not enough money to hire. Need €${profile.hiringCost}`, 'warning')
          return
        }

        // Generate employee
        const newEmployee = generateEmployeeFromProfile(candidateProfileId, department, Date.now())
        if (!newEmployee) return

        // Deduct cost and hire
        state.player.money -= profile.hiringCost
        state.employees[newEmployee.id] = newEmployee
        state.office.currentOccupancy += 1

        // Reputation boost
        state.stats.reputation = clampStat(state.stats.reputation + 2)

        get().addNotification(`${profile.name} hired for department ${department}!`, 'success')
      })
    },

    // ── FIRE EMPLOYEE (V4) ────────────────────────────────────
    fireEmployee: (employeeId: string) => {
      set(state => {
        const emp = state.employees[employeeId]
        if (!emp || emp.status === 'departed') return

        // Severance cost (3× salary)
        const severanceCost = emp.salary * BALANCE.SEVERANCE_COST_MULTIPLIER
        if (state.player.money < severanceCost) {
          get().addNotification('Not enough money for severance package.', 'warning')
          return
        }

        // Mark for termination
        state.player.money -= severanceCost
        emp.status = 'notice'
        state.office.currentOccupancy -= 1
        state.stats.reputation = clampStat(state.stats.reputation - 5)  // reputation hit

        get().addNotification(`${emp.name} has been terminated.`, 'info')
      })
    },

    // ── PROMOTE EMPLOYEE (V4) ─────────────────────────────────
    promoteEmployeeAction: (employeeId: string) => {
      set(state => {
        const emp = state.employees[employeeId]
        if (!emp || emp.status === 'departed') return
        if (emp.role === 'lead') return  // already at max

        // Promotion cost = 2.5× current salary (one-time)
        const promoCost = emp.salary * BALANCE.PROMOTION_COST_MULTIPLIER
        if (state.player.money < promoCost) {
          get().addNotification('Not enough money for promotion.', 'warning')
          return
        }

        // Promote
        state.player.money -= promoCost
        const promoUpdate = promoteEmployee(emp)
        if (promoUpdate) {
          Object.assign(emp, promoUpdate)
          state.stats.reputation = clampStat(state.stats.reputation + 3)
          get().addNotification(`${emp.name} promoted to ${emp.role}!`, 'success')
        }
      })
    },

    // ── TRAIN EMPLOYEE (V4) ───────────────────────────────────
    trainEmployeeAction: (employeeId: string, cost: number) => {
      set(state => {
        const emp = state.employees[employeeId]
        if (!emp || emp.status === 'departed') return
        if (emp.skill >= 100) return  // already maxed

        if (state.player.money < cost) {
          get().addNotification('Not enough budget for training.', 'warning')
          return
        }

        // Calculate skill increase from cost
        const skillIncrease = Math.min(
          100 - emp.skill,
          cost / BALANCE.TRAINING_COST_PER_SKILL_POINT,
        )

        if (skillIncrease <= 0) return

        state.player.money -= cost
        const trainUpdate = trainEmployee(emp, skillIncrease)
        if (trainUpdate) {
          Object.assign(emp, trainUpdate)
          get().addNotification(`${emp.name} skill improved to ${emp.skill.toFixed(0)}!`, 'success')
        }
      })
    },

    // ── GIVE RAISE / MORALE BOOST (V4) ────────────────────────
    giveRaise: (employeeId: string) => {
      set(state => {
        const emp = state.employees[employeeId]
        if (!emp || emp.status === 'departed') return
        if (emp.motivation >= 100) return  // already maxed

        const cost = BALANCE.GIVE_RAISE_COST
        if (state.player.money < cost) {
          get().addNotification('Not enough budget for morale boost.', 'warning')
          return
        }

        state.player.money -= cost
        emp.motivation = Math.min(100, emp.motivation + BALANCE.GIVE_RAISE_MOTIVATION_BOOST)
        emp.riskOfLeaving = Math.max(0, emp.riskOfLeaving - 10)  // reduce turnover risk
        state.stats.reputation = clampStat(state.stats.reputation + 1)

        get().addNotification(`${emp.name} morale boosted! Risk reduced.`, 'success')
      })
    },

    // ── EXPAND OFFICE (V4) ────────────────────────────────────
    expandOffice: () => {
      set(state => {
        const nextDef = getNextOfficeLevelDef(state.office.level)
        if (!nextDef) {
          get().addNotification('Already at maximum office size.', 'info')
          return
        }

        const cost = state.office.expansionCost
        if (state.player.money < cost) {
          get().addNotification(`Office expansion costs €${cost}. Insufficient funds.`, 'warning')
          return
        }

        state.player.money -= cost
        state.office.level = nextDef.level
        state.office.maxCapacity = nextDef.maxCapacity
        state.office.expansionCost = nextDef.expansionCost
        state.office.totalExpansions += 1
        state.stats.prestige = Math.max(0, state.stats.prestige + 5)  // prestige from expansion

        get().addNotification(`Headquarters expanded to ${nextDef.level}!`, 'success')
      })
    },

    // ── BUY MARKET ITEM ───────────────────────────────────────
    buyMarketItem: (listingId: string, qty: number) => {
      set(state => {
        const listing = MARKET_LISTINGS.find(l => l.id === listingId)
        if (!listing) return
        const mState = state.marketListings[listingId]
        if (!mState) return

        const itemDef = ITEMS.find(i => i.id === listing.itemId)
        if (!itemDef) return

        const currentQty = state.inventory[listing.itemId] ?? 0
        const effectiveQty = itemDef.stackable ? qty : 1
        if (!itemDef.stackable && currentQty >= itemDef.maxStack) return
        const totalBuy = Math.min(effectiveQty, itemDef.maxStack - currentQty)
        if (totalBuy <= 0) return

        const totalCost = mState.currentBuyPrice * totalBuy
        if (state.player.money < totalCost) return

        state.player.money -= totalCost
        state.inventory[listing.itemId] = currentQty + totalBuy
      })
    },

    // ── SELL INVENTORY ITEM ───────────────────────────────────
    sellInventoryItem: (itemId: string, qty: number) => {
      set(state => {
        const listing = MARKET_LISTINGS.find(l => l.itemId === itemId)
        if (!listing) return
        const mState = state.marketListings[listing.id]
        if (!mState) return

        const currentQty = state.inventory[itemId] ?? 0
        const sellQty = Math.min(qty, currentQty)
        if (sellQty <= 0) return

        state.player.money += mState.currentSellPrice * sellQty
        state.inventory[itemId] = currentQty - sellQty
        if (state.inventory[itemId] === 0) delete state.inventory[itemId]
      })
    },

    // ── BUY STOCK ─────────────────────────────────────────────
    buyStock: (stockId: string, shares: number) => {
      set(state => {
        const stockState = state.stocks[stockId]
        if (!stockState || shares <= 0) return
        const cost = stockState.currentPrice * shares
        if (state.player.money < cost) return
        state.player.money -= cost
        state.stocks[stockId].owned += shares
      })
    },

    // ── SELL STOCK ────────────────────────────────────────────
    sellStock: (stockId: string, shares: number) => {
      set(state => {
        const stockState = state.stocks[stockId]
        if (!stockState || shares <= 0) return
        const sellShares = Math.min(shares, stockState.owned)
        if (sellShares <= 0) return
        const proceeds = stockState.currentPrice * sellShares
        state.player.money += proceeds
        state.player.totalEarned += proceeds
        state.stocks[stockId].owned -= sellShares
      })
    },

    // ── RESOLVE EVENT ─────────────────────────────────────────
    resolveEvent: (choiceId: string) => {
      let lesson: string | undefined

      set(state => {
        const event = state.activeEvent
        if (!event) return
        const choice = event.choices.find(c => c.id === choiceId)
        if (!choice) return
        lesson = choice.lesson

        const talentFx = getAggregatedTalentEffects(state.talents)

        for (const effect of choice.effects) {
          switch (effect.type) {
            case 'money':
              if (effect.amount > 0) {
                const boosted = effect.amount * talentFx.eventPositiveMultiplier
                state.player.money += boosted
                state.player.totalEarned += boosted
              } else {
                const damped = effect.amount * talentFx.eventNegativeMultiplier
                state.player.money = Math.max(0, state.player.money + damped)
              }
              break

            case 'money_percent': {
              const raw = Math.floor(state.player.money * (effect.percent / 100))
              const delta = raw > 0
                ? raw * talentFx.eventPositiveMultiplier
                : raw * talentFx.eventNegativeMultiplier
              state.player.money = Math.max(0, state.player.money + delta)
              break
            }

            case 'timed_income_mult': {
              const ae: ActiveEffect = {
                id: `${event.id}_${choiceId}_${Date.now()}`,
                sourceEvent: event.id,
                multiplier: effect.multiplier,
                activityId: effect.activityId,
                expiresAt: Date.now() + effect.duration * 1000,
              }
              state.activeEffects.push(ae)
              break
            }

            case 'stock_change': {
              if (state.stocks[effect.stockId]) {
                state.stocks[effect.stockId] = applyStockShock(
                  state.stocks[effect.stockId],
                  effect.factor,
                )
              }
              break
            }

            case 'xp_bonus':
              state.player.xp += effect.amount
              break

            case 'stat_change': {
              const key = effect.stat as keyof typeof state.stats
              state.stats[key] = clampStat(state.stats[key] + effect.amount)
              break
            }

            case 'prestige_change':
              state.stats.prestige = Math.max(0, state.stats.prestige + effect.amount)
              break
          }
        }

        state.activeEvent = null
      })

      if (lesson) {
        get().addNotification(`💡 ${lesson}`, 'info')
      }
    },

    // ── CLAIM MISSION ─────────────────────────────────────────
    claimMission: (missionId: string) => {
      set(state => {
        const mState = state.missions[missionId]
        if (!mState?.completed || mState.claimedReward) return

        const def = MISSIONS.find(m => m.id === missionId)
        if (!def) return

        state.player.money += def.rewardMoney
        state.player.xp += def.rewardXP
        state.player.totalEarned += def.rewardMoney
        if (def.rewardPrestige) {
          state.stats.prestige += def.rewardPrestige
        }
        state.missions[missionId].claimedReward = true
      })
    },

    // ── SET SPECIALIZATION ────────────────────────────────────
    setSpecialization: (id: SpecializationId) => {
      set(state => {
        state.specialization = id
        state.stats.reputation = clampStat(state.stats.reputation + 5)
      })
      get().addNotification('Spécialisation activée !', 'success')
    },

    // ── UPDATE PROFILE ────────────────────────────────────────
    updateProfile: (data) => {
      set(state => {
        if (data.playerName !== undefined) state.profile.playerName = data.playerName
        if (data.companyName !== undefined) state.profile.companyName = data.companyName
        if (data.avatarIndex !== undefined) state.profile.avatarIndex = data.avatarIndex
      })
    },

    // ── V3: COMPLETE SETUP WIZARD ─────────────────────────────
    completeSetup: (companyType: CompanyTypeId, marketSegment: MarketSegmentId) => {
      set(state => {
        const typeDef = COMPANY_TYPES.find(t => t.id === companyType)
        if (!typeDef) return

        state.companyType = companyType
        state.marketSegment = marketSegment
        state.setupComplete = true

        // Apply starting stats from company type
        state.player.money = typeDef.effects.startingMoney
        state.stats.popularity   = typeDef.effects.startingPopularity
        state.stats.reputation   = typeDef.effects.startingReputation
        state.stats.satisfaction = typeDef.effects.startingSatisfaction
        state.stats.prestige     = typeDef.effects.startingPrestige
      })
    },

    // ── V3: SET STRATEGY ──────────────────────────────────────
    setStrategy: (axis: keyof CompanyStrategies, value: string) => {
      set(state => {
        // Type narrowing: each axis accepts only its specific union
        (state.strategies as Record<string, string>)[axis] = value
      })
      get().addNotification('Stratégie mise à jour', 'success')
    },

    // ── V3: UPGRADE DEPARTMENT ────────────────────────────────
    upgradeDepartment: (deptId: DepartmentId) => {
      set(state => {
        const dept = state.departments[deptId]
        if (!dept) return
        if (dept.level >= 5) return

        const deptDef = DEPARTMENTS.find(d => d.id === deptId)
        if (!deptDef) return
        if (deptDef.unlockLevel > state.player.level) return

        const cost = getDepartmentUpgradeCost(deptId, dept.level)
        if (cost === null || state.player.money < cost) return

        state.player.money -= cost
        dept.level += 1

        // Prestige boost for investing in the company
        state.stats.prestige += dept.level * 2
        state.stats.reputation = clampStat(state.stats.reputation + dept.level * 1.5)
      })
    },

    // ── V3: BUY ASSET ─────────────────────────────────────────
    buyAsset: (assetId: string) => {
      set(state => {
        const assetDef = ASSETS.find(a => a.id === assetId)
        if (!assetDef) return
        if (assetDef.levelUnlockRequired > state.player.level) return
        if (assetDef.prestigeUnlockRequired > state.stats.prestige) return

        const currentQty = state.ownedAssets[assetId] ?? 0
        if (assetDef.unique && currentQty >= 1) return

        if (state.player.money < assetDef.price) return

        state.player.money -= assetDef.price
        state.ownedAssets[assetId] = currentQty + 1

        // Apply stat effects
        if (assetDef.prestigeGain > 0) state.stats.prestige += assetDef.prestigeGain
        if (assetDef.reputationGain > 0) {
          state.stats.reputation = clampStat(state.stats.reputation + assetDef.reputationGain)
        }
        if (assetDef.popularityGain > 0) {
          state.stats.popularity = clampStat(state.stats.popularity + assetDef.popularityGain)
        }
        if (assetDef.satisfactionGain > 0) {
          state.stats.satisfaction = clampStat(state.stats.satisfaction + assetDef.satisfactionGain)
        }
      })
    },

    // ── V3: PURCHASE TALENT ───────────────────────────────────
    purchaseTalent: (talentId: string) => {
      set(state => {
        if (!canPurchaseTalent(talentId, state.talents, state.player.talentPoints)) return

        const def = TALENTS.find(t => t.id === talentId)
        if (!def) return

        state.player.talentPoints -= def.cost
        state.talents[talentId] = true
      })
      get().addNotification('Talent débloqué !', 'success')
    },

    // ── SAVE / LOAD / RESET ───────────────────────────────────
    saveGame: () => {
      const state = get()
      saveGame(state as unknown as import('../core/entities').GameState)
      get().addNotification('💾 Partie sauvegardée', 'success')
    },

    loadGame: () => {
      const saved = loadFromStorage()
      if (!saved) return

      const now = Date.now()
      const offline = calculateOfflineProgress(saved, now)

      set(state => {
        Object.assign(state, saved)
        state.player.money += offline.moneyEarned
        state.player.xp += offline.xpEarned
        state.player.totalEarned += offline.moneyEarned
        state.player.level = getLevelFromXP(state.player.xp)
        state.lastTick = now
        state.activeEffects = []
        state.activeEvent = null
        if (offline.moneyEarned > 0) {
          state.offlineEarnings = offline.moneyEarned
        }
      })
    },

    resetGame: () => {
      set(state => {
        const fresh = createInitialGameState()
        Object.assign(state, fresh)
        state.currentScreen = 'dashboard'
        state.notifications = []
      })
    },

    // ── PRESTIGE RESET (meta-progression) ─────────────────────
    prestigeReset: (prestigeValue: number) => {
      set(state => {
        // Load or create meta state
        let metaState: MetaState = loadMetaGame() ?? createInitialMetaState()

        // Harvest prestige from current run and update meta state
        metaState = harvestPrestigeFromRun(
          state as unknown as import('../core/entities').GameState,
          prestigeValue,
          metaState,
        )

        // Save updated meta state
        saveMetaGame(metaState)

        // Reset game to fresh state
        const fresh = createInitialGameState()
        Object.assign(state, fresh)
        state.currentScreen = 'dashboard'
        state.notifications = []

        get().addNotification(`✨ Nouvelle carrière : +${Math.floor(prestigeValue)} prestige`, 'success')
      })
    },

    // ── PRESTIGE UPGRADES ────────────────────────────────────
    buyPrestigeUpgrade: (upgradeId: string) => {
      // Load meta state
      let metaState: MetaState = loadMetaGame() ?? createInitialMetaState()
      const upgrade = PRESTIGE_UPGRADES.find(u => u.id === upgradeId)

      if (!upgrade) {
        get().addNotification('❌ Amélioration non trouvée', 'error')
        return
      }

      // Check if can afford
      if (metaState.prestigeBank.totalPoints < upgrade.cost) {
        get().addNotification('❌ Pas assez de prestige', 'error')
        return
      }

      // Check prerequisites
      if (upgrade.prerequisiteUpgradeIds) {
        for (const prereqId of upgrade.prerequisiteUpgradeIds) {
          if (!metaState.prestigeBank.upgrades[prereqId]?.purchased) {
            get().addNotification('❌ Prérequis non satisfait', 'error')
            return
          }
        }
      }

      // Check minimum resets
      if (upgrade.minimumPrestigeResets && metaState.currentPrestigeRun < upgrade.minimumPrestigeResets) {
        get().addNotification('❌ Réinitialisation minimale requise', 'error')
        return
      }

      // Deduct prestige
      metaState.prestigeBank.totalPoints -= upgrade.cost

      // Update or create upgrade record
      const existing = metaState.prestigeBank.upgrades[upgradeId]
      metaState.prestigeBank.upgrades[upgradeId] = {
        id: upgradeId,
        purchased: true,
        level: (existing?.level ?? 0) + 1,
      }

      // Handle special effects
      if (upgrade.effects.some(e => e.type === 'unlock_ceo_archetype')) {
        const archetypeId = upgrade.id.replace('ceo_', '')
        if (!metaState.prestigeBank.unlockedCEOArchetypes.includes(archetypeId)) {
          metaState.prestigeBank.unlockedCEOArchetypes.push(archetypeId)
        }
      }

      // Save updated meta state
      saveMetaGame(metaState)

      // Apply upgrade effects to current run (if applicable)
      set(state => {
        // Apply "starting_money" bonus
        const moneyBonus = upgrade.effects.find(e => e.type === 'starting_money')
        if (moneyBonus && state.player.money === 50) { // Only on fresh start
          state.player.money += moneyBonus.magnitude
        }

        // Apply "starting_activity_count" bonus
        const activityBonus = upgrade.effects.find(e => e.type === 'starting_activity_count')
        if (activityBonus) {
          // This would need to be applied at game start via new prestige bonus system
        }
      })

      get().addNotification(`✨ Amélioration achetée : ${upgrade.name}`, 'success')
    },

    // ── UI ACTIONS ────────────────────────────────────────────
    setScreen: (screen: Screen) => {
      set(state => { state.currentScreen = screen })
    },

    addNotification: (message: string, type: AppNotification['type']) => {
      set(state => {
        const notif: AppNotification = {
          id: `${Date.now()}_${Math.random()}`,
          message,
          type,
          createdAt: Date.now(),
        }
        state.notifications.push(notif)
        if (state.notifications.length > 5) state.notifications.shift()
      })
    },

    dismissNotification: (id: string) => {
      set(state => { state.notifications = state.notifications.filter(n => n.id !== id) })
    },

    dismissOfflineEarnings: () => {
      set(state => { state.offlineEarnings = null })
    },
  })),
)
