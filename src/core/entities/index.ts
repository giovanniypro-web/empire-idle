// ================================================================
// NAVIGATION
// ================================================================
export type Screen =
  | 'dashboard'
  | 'activities'
  | 'upgrades'
  | 'employees'
  | 'candidates'
  | 'market'
  | 'stocks'
  | 'missions'
  | 'profile'
  | 'departments'
  | 'assets'
  | 'talents'
  | 'retirement'
  | 'careerHistory'
  | 'prestigeUpgrades'

// ================================================================
// PLAYER
// ================================================================
export interface Player {
  money: number
  xp: number
  level: number
  totalEarned: number
  totalClicks: number
  talentPoints: number          // 1 per level, spent on CEO talent tree
}

// ================================================================
// BUSINESS STATS (V3: + prestige)
// ================================================================
export interface BusinessStats {
  popularity: number     // 0-100 — brand visibility, consumer income bonus
  reputation: number     // 0-100 — credibility, B2B income bonus
  satisfaction: number   // 0-100 — loyalty, automated income bonus
  prestige: number       // 0-∞  — standing, luxury access, premium events
}

// ================================================================
// PLAYER PROFILE
// ================================================================
export interface PlayerProfile {
  playerName: string
  companyName: string
  avatarIndex: number
}

// ================================================================
// COMPANY TYPE  (V3 — chosen at startup, permanent)
// ================================================================
export type CompanyTypeId =
  | 'digital_agency'
  | 'ecommerce_shop'
  | 'saas_startup'
  | 'media_content'
  | 'premium_consulting'
  | 'lifestyle_brand'

export interface CompanyTypeEffects {
  incomeMultiplierByActivity: Partial<Record<string, number>>  // per-activity income boost
  allIncomeMultiplier: number
  activityCostMultiplier: number
  employeeCostMultiplier: number
  popularityGrowthMultiplier: number
  reputationGrowthMultiplier: number
  satisfactionGrowthMultiplier: number
  prestigeGrowthMultiplier: number
  salaryMultiplier: number
  xpMultiplier: number
  startingPopularity: number
  startingReputation: number
  startingSatisfaction: number
  startingPrestige: number
  startingMoney: number
}

export interface CompanyTypeDef {
  id: CompanyTypeId
  name: string
  tagline: string
  description: string
  icon: string
  bonuses: string[]
  penalties: string[]
  effects: CompanyTypeEffects
}

// ================================================================
// MARKET SEGMENT  (V3 — chosen at startup)
// ================================================================
export type MarketSegmentId =
  | 'students'
  | 'general_public'
  | 'sme'
  | 'enterprise'
  | 'luxury'
  | 'niche_premium'

export interface MarketSegmentDef {
  id: MarketSegmentId
  name: string
  description: string
  icon: string
  revenueMultiplier: number          // applied to all activity income
  popularityRequirement: number      // min popularity to access
  reputationRequirement: number      // min reputation to access
  prestigeRequirement: number        // min prestige to access
  satisfactionVolatility: number     // 0-1 — how fast satisfaction drops
  highlights: string[]               // key characteristics shown in UI
}

// ================================================================
// STRATEGIC POLICIES  (V3 — 4 axes, changeable in Profile)
// ================================================================
export type HRStrategyId         = 'aggressive_hr'   | 'balanced_hr'    | 'people_first_hr'
export type MarketingStrategyId  = 'acquisition'     | 'branding'       | 'word_of_mouth'
export type ProductStrategyId    = 'low_cost'        | 'premium_product'| 'innovation_focus'
export type FinanceStrategyId    = 'conservative'    | 'offensive'      | 'speculative'

export interface CompanyStrategies {
  hr:        HRStrategyId
  marketing: MarketingStrategyId
  product:   ProductStrategyId
  finance:   FinanceStrategyId
}

export interface StrategyEffects {
  allIncomeMultiplier: number
  activityCostMultiplier: number
  employeeCostMultiplier: number
  salaryMultiplier: number
  popularityGrowthMultiplier: number
  reputationGrowthMultiplier: number
  satisfactionGrowthMultiplier: number
  prestigeGrowthMultiplier: number
  xpMultiplier: number
  satisfactionDecayMultiplier: number
  operatingCostMultiplier: number
  upgradeEffectivenessMultiplier: number
}

export interface StrategyOptionDef {
  id: string
  axis: 'hr' | 'marketing' | 'product' | 'finance'
  name: string
  description: string
  icon: string
  bonuses: string[]
  penalties: string[]
  effects: StrategyEffects
}

// ================================================================
// DEPARTMENTS  (V3 — invest to unlock & level up, 0-5)
// ================================================================
export type DepartmentId =
  | 'marketing'
  | 'sales'
  | 'operations'
  | 'finance_dept'
  | 'hr_dept'
  | 'innovation'
  | 'customer_service'

export interface DepartmentLevelDef {
  level: number           // 1-5
  upgradeCost: number     // one-time
  ongoingCost: number     // per second
  description: string
  effects: DepartmentEffects
}

export interface DepartmentEffects {
  allIncomeMultiplier: number
  consumerIncomeMultiplier: number
  automatedIncomeMultiplier: number
  popularityGrowthMultiplier: number
  reputationGrowthMultiplier: number
  satisfactionGrowthMultiplier: number
  satisfactionDecayMultiplier: number
  salaryMultiplier: number
  activitySpeedMultiplier: number
  operatingCostMultiplier: number
  upgradeEffectMultiplier: number
  xpMultiplier: number
}

export interface DepartmentDef {
  id: DepartmentId
  name: string
  description: string
  icon: string
  unlockLevel: number
  levels: DepartmentLevelDef[]
}

export interface DepartmentEffectivenessBreakdown {
  avgSkill: number                  // 0-100, average skill of employees
  avgMotivation: number             // 0-100, average motivation
  headcount: number                 // how many employees in this dept
  hasLead: boolean                  // at least 1 lead/manager?
  leadershipBonus: number           // +15% if has lead
  underleadershipPenalty: number    // -X% if team too large without lead
  effectiveness: number             // 0-100 final score
}

export interface DepartmentState {
  id: DepartmentId
  level: number                      // 0 = not built, 1-5
  effectiveness: DepartmentEffectivenessBreakdown | null  // null if no employees
}

// ================================================================
// ASSETS / PATRIMOINE  (V3)
// ================================================================
export type AssetCategoryId = 'cars' | 'art' | 'watches' | 'real_estate' | 'offices'

export interface AssetEffect {
  type:
    | 'prestige'
    | 'reputation'
    | 'popularity'
    | 'satisfaction'
    | 'passive_income'   // €/s
    | 'all_income_mult'
    | 'salary_reduction' // reduces total salary cost
}

export interface AssetDef {
  id: string
  category: AssetCategoryId
  name: string
  description: string
  icon: string
  price: number
  maintenanceCost: number  // €/s ongoing
  unique: boolean          // can only own 1
  prestigeUnlockRequired: number
  levelUnlockRequired: number
  effects: AssetEffect[]
  // Numeric values for each effect type
  prestigeGain: number
  reputationGain: number
  popularityGain: number
  satisfactionGain: number
  passiveIncome: number    // €/s
  allIncomeMult: number    // e.g. 0.02 = +2%
  salaryReduction: number  // e.g. 0.05 = -5%
}

// ================================================================
// CEO TALENT TREE  (V3)
// ================================================================
export type TalentBranchId = 'leadership' | 'finance_talent' | 'marketing_talent' | 'innovation_talent' | 'negotiation' | 'resilience'

export interface TalentDef {
  id: string
  branch: TalentBranchId
  name: string
  description: string
  icon: string
  cost: number           // talent points
  requires?: string      // prerequisite talent id in same branch
  // Effect values (all are bonuses, applied multiplicatively to base)
  employeeIncomeBonusAdd: number   // added to incomeBonus of all employees
  allIncomeMultiplier: number
  activityCostMultiplier: number
  employeeCostMultiplier: number
  upgradeCostMultiplier: number
  upgradeEffectivenessMultiplier: number
  satisfactionDecayMultiplier: number
  xpMultiplier: number
  popularityGrowthMultiplier: number
  operatingCostMultiplier: number
  eventPositiveMultiplier: number  // multiplier on positive event money
  eventNegativeMultiplier: number  // multiplier on negative event damage (< 1 = less damage)
  passiveIncomeAdd: number         // flat €/s from all real estate
}

// ================================================================
// SPECIALIZATION  (V2, preserved)
// ================================================================
export type SpecializationId =
  | 'hypergrowth'
  | 'premium_brand'
  | 'viral_marketing'
  | 'full_automation'
  | 'innovation'

export interface SpecializationEffects {
  allIncomeMultiplier: number
  consumerIncomeMultiplier: number
  professionalIncomeMultiplier: number
  employeeCostMultiplier: number
  activityCostMultiplier: number
  xpMultiplier: number
  popularityGrowthMultiplier: number
  reputationGrowthMultiplier: number
  satisfactionGrowthMultiplier: number
  salaryMultiplier: number
}

export interface SpecializationDef {
  id: SpecializationId
  name: string
  description: string
  icon: string
  bonuses: string[]
  penalties: string[]
  unlockLevel: number
  effects: SpecializationEffects
}

// ================================================================
// ACTIVITIES
// ================================================================
export type ActivityStatAffinity = 'popularity' | 'reputation' | 'satisfaction' | 'neutral'
export type ActivityDepartmentAffinity = 'marketing' | 'sales' | 'operations' | 'finance_dept' | 'hr_dept' | 'innovation' | 'customer_service' | 'general'

export interface ActivityDef {
  id: string
  name: string
  description: string
  icon: string
  baseCost: number
  costMultiplier: number
  baseIncome: number
  baseDuration: number
  baseXP: number
  unlockLevel: number
  skillRequired?: number                              // Phase 3: team avg skill needed (0-100)
  statAffinity: ActivityStatAffinity
  departmentAffinity?: ActivityDepartmentAffinity     // which dept employees help with this? (Phase 3)
  statGainPerCycle: {
    popularity?: number
    reputation?: number
  }
}

export interface ActivityState {
  id: string
  count: number
  progress: number
  isRunning: boolean
  totalEarned: number
}

// ================================================================
// UPGRADES
// ================================================================
export type UpgradeEffect =
  | { type: 'activity_income'; activityId: string; multiplier: number }
  | { type: 'activity_speed'; activityId: string; multiplier: number }
  | { type: 'global_income'; multiplier: number }
  | { type: 'global_xp'; multiplier: number }

export interface UpgradeDef {
  id: string
  name: string
  description: string
  icon: string
  cost: number
  effects: UpgradeEffect[]
  unlockLevel: number
  requires?: string[]
}

export interface UpgradeState {
  id: string
  purchased: boolean
}

// ================================================================
// EMPLOYEES (V4 — Individual HR system)
// ================================================================
export type EmployeeRole = 'intern' | 'junior' | 'mid' | 'senior' | 'lead'
export type EmployeeStatus = 'active' | 'onboarding' | 'notice' | 'departed'
export type EmployeeDepartment = DepartmentId

export interface EmployeeState {
  id: string                    // unique identifier
  name: string                  // "Alice Chen", "Bob Smith"
  role: EmployeeRole            // skill/seniority tier
  department: EmployeeDepartment // which dept they work in
  salary: number                // per second cost (converted to monthly deduction)
  hiringCost: number            // one-time cost to hire
  skill: number                 // 0-100, impacts output quality
  motivation: number            // 0-100, impacts productivity
  loyalty: number               // 0-100, likelihood to stay if unhappy
  productivity: number          // current productivity % (0-150)
  potential: number             // 0-100, growth ceiling
  seniority: number             // 0-100, correlated with role
  riskOfLeaving: number         // 0-100, turnover risk
  status: EmployeeStatus        // active, onboarding (0-100% ramp), notice, departed
  performanceScore: number      // 0-100, tracks recent performance
  hiredAt: number               // timestamp
  onboardingProgress: number    // 0-100 for status=onboarding (ramps to active)
  tags: string[]                // ["loyal", "ambitious", "problem_solver"] for extension

  // V4.5: Employee Assignment System
  assignedActivityId: string | null  // assigned to single activity (null = unassigned)
  assignmentChangedAt: number   // timestamp when assignment last changed
  monthsUnpaid: number          // consecutive unpaid months (auto-depart at 3+)
}

export interface OfficeState {
  level: 'coworking' | 'small_office' | 'medium_office' | 'large_building' | 'campus'
  maxCapacity: number
  currentOccupancy: number      // count of active employees
  expansionCost: number         // cost to next level
  totalExpansions: number       // times expanded (for balance)
}

// Legacy type (preserved for compatibility)
export interface EmployeeDef {
  id: string
  name: string
  description: string
  icon: string
  targetActivityId: string
  baseCost: number
  costMultiplier: number
  incomeBonus: number
  speedBonus: number
  automatesActivity: boolean
  unlockLevel: number
  baseSalary: number
}

// ================================================================
// INVENTORY & MARKET
// ================================================================
export type ItemEffect =
  | { type: 'activity_income'; activityId: string; multiplier: number }
  | { type: 'global_income'; multiplier: number }
  | { type: 'global_xp'; multiplier: number }

export interface ItemDef {
  id: string
  name: string
  description: string
  icon: string
  effects: ItemEffect[]
  stackable: boolean
  maxStack: number
}

export interface MarketListingDef {
  id: string
  itemId: string
  baseBuyPrice: number
  baseSellPrice: number
  priceVolatility: number
}

export interface MarketListingState {
  id: string
  currentBuyPrice: number
  currentSellPrice: number
  trend: number
}

// ================================================================
// STOCKS
// ================================================================
export interface StockDef {
  id: string
  name: string
  ticker: string
  description: string
  icon: string
  basePrice: number
  volatility: number
  dividendRate: number
}

export interface StockState {
  id: string
  currentPrice: number
  owned: number
  priceHistory: number[]
  trend: number
}

// ================================================================
// MISSIONS
// ================================================================
export type MissionCondition =
  | { type: 'earn_total'; amount: number }
  | { type: 'reach_level'; level: number }
  | { type: 'own_activity'; activityId: string; count: number }
  | { type: 'hire_employee'; employeeId: string; count: number }
  | { type: 'buy_upgrade'; upgradeId: string }
  | { type: 'own_stock_value'; amount: number }
  | { type: 'click_count'; count: number }
  | { type: 'income_per_second'; amount: number }
  | { type: 'reach_stat'; stat: keyof BusinessStats; value: number }
  | { type: 'reach_prestige'; value: number }
  | { type: 'dept_level'; deptId: DepartmentId; level: number }

export interface MissionDef {
  id: string
  name: string
  description: string
  icon: string
  condition: MissionCondition
  rewardMoney: number
  rewardXP: number
  rewardPrestige?: number
}

export interface MissionState {
  id: string
  completed: boolean
  claimedReward: boolean
}

// ================================================================
// EVENTS
// ================================================================
export type EventEffect =
  | { type: 'money'; amount: number }
  | { type: 'money_percent'; percent: number }
  | { type: 'timed_income_mult'; multiplier: number; duration: number; activityId?: string }
  | { type: 'stock_change'; stockId: string; factor: number }
  | { type: 'xp_bonus'; amount: number }
  | { type: 'stat_change'; stat: keyof BusinessStats; amount: number }
  | { type: 'prestige_change'; amount: number }

export interface EventChoice {
  id: string
  label: string
  effects: EventEffect[]
  lesson?: string
}

export interface GameEventDef {
  id: string
  title: string
  description: string
  icon: string
  minLevel: number
  weight: number
  choices: EventChoice[]
}

export interface ActiveEffect {
  id: string
  sourceEvent: string
  multiplier: number
  activityId?: string
  expiresAt: number
}

// ================================================================
// NOTIFICATIONS
// ================================================================
export interface AppNotification {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  createdAt: number
}

// ================================================================
// CAREER & META-PROGRESSION (Phase 4)
// ================================================================

export interface CareerStats {
  totalRunsCompleted: number          // Number of completed prestige resets
  totalPlaytime: number               // Lifetime seconds played
  totalMoneyEarned: number            // All-time money across all runs
  totalPrestigeEarned: number         // All prestige accumulated
  bestRunMoney: number                // Highest money in single run
  bestRunPrestige: number             // Most prestige in single run
  bestRunLevel: number                // Highest level reached
  totalEmployeesHired: number         // Across all runs
  totalEmployeesManaged: number       // Peak concurrent
  prestigeResets: Array<{
    timestamp: number
    prestigeEarned: number
    finalLevel: number
    finalMoney: number
    companyName: string
  }>
}

export interface PrestigeUpgradeState {
  id: string
  purchased: boolean
  level: number  // For multi-tier upgrades
}

export type PrestigeBranch = 'finance' | 'hr' | 'marketing' | 'leadership' | 'innovation' | 'legacy'

export interface PrestigeUpgradeDef {
  id: string
  name: string
  description: string
  icon: string
  branch: PrestigeBranch
  cost: number  // Prestige points required to purchase
  maxLevel: number  // 1 = single purchase, >1 = multi-tier
  effects: {
    type: 'income_multiplier' | 'salary_reduction' | 'hiring_bonus' | 'morale_bonus' | 'activity_speed' | 'activity_income' | 'popularity_gain' | 'reputation_gain' | 'starting_money' | 'starting_activity_count' | 'unlock_ceo_archetype' | 'custom'
    magnitude: number  // Depends on type: 1.1 = +10%, 0.2 = +20% cost reduction, etc.
  }[]
  prerequisiteUpgradeIds?: string[]  // Must purchase these first
  minimumPrestigeResets?: number  // Must have reset this many times first
}

export interface PrestigeBank {
  totalPoints: number                 // Accumulated prestige points
  upgrades: Record<string, PrestigeUpgradeState>  // prestigeUpgradeId -> state
  unlockedCEOArchetypes: string[]     // List of unlocked CEO archetype IDs
}

export interface MetaState {
  profile: PlayerProfile              // Shared across runs
  careerStats: CareerStats            // Lifetime progression
  prestigeBank: PrestigeBank          // Meta progression currency & unlocks
  currentPrestigeRun: number          // Which prestige era is the player in (0 = first run, 1 = after first reset, etc)
}

// ================================================================
// ROOT GAME STATE  (V3)
// ================================================================
export interface GameState {
  // Core
  player: Player
  stats: BusinessStats
  profile: PlayerProfile

  // V3 — Company identity (chosen at startup)
  setupComplete: boolean
  companyType: CompanyTypeId | null
  marketSegment: MarketSegmentId | null

  // V3 — Strategic choices (changeable)
  strategies: CompanyStrategies
  specialization: SpecializationId | null

  // V3 — Departments
  departments: Record<DepartmentId, DepartmentState>

  // V3 — Assets
  ownedAssets: Record<string, number>        // assetId -> quantity (0 or 1 for unique)

  // V3 — CEO Talent tree
  talents: Record<string, boolean>           // talentId -> purchased

  // V4 — HR System
  office: OfficeState
  employees: Record<string, EmployeeState>   // V4: changed from simple count to full individual state

  // Existing systems
  activities: Record<string, ActivityState>
  upgrades: Record<string, UpgradeState>
  inventory: Record<string, number>
  marketListings: Record<string, MarketListingState>
  stocks: Record<string, StockState>
  missions: Record<string, MissionState>
  activeEvent: GameEventDef | null
  activeEffects: ActiveEffect[]

  // V4.5: Employee salary tracking
  lastSalaryDeduction: number   // timestamp of last monthly payroll deduction
  monthlyPayroll: number        // cached total monthly salary cost (for UI)
  nextPayrollDate: number       // timestamp when next payroll is due

  // Timestamps
  lastSaved: number
  lastTick: number
  lastStockUpdate: number
  lastMarketUpdate: number
  lastEventTime: number
  nextEventDelay: number
  gameStarted: number
  offlineEarnings: number | null
}

export interface FullStoreState extends GameState {
  currentScreen: Screen
  notifications: AppNotification[]
}

// ================================================================
// CONSTANTS
// ================================================================
export const AVATAR_LIST = [
  '👨‍💼', '👩‍💼', '🧑‍💼', '👨‍🎓', '👩‍🎓',
  '🦁', '🐯', '🦊', '🚀', '💎',
]

export const DEFAULT_STRATEGIES: CompanyStrategies = {
  hr: 'balanced_hr',
  marketing: 'branding',
  product: 'premium_product',
  finance: 'conservative',
}
