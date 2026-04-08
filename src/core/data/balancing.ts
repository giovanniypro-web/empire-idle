/**
 * BALANCING CONSTANTS — Single source of truth for all game balance values.
 * Tweak these to adjust difficulty, pacing, and feel without touching logic.
 */
export const BALANCE = {
  // ── Activity scaling ──────────────────────────────────────
  ACTIVITY_COST_MULTIPLIER: 1.22,   // steeper per-unit cost curve

  // ── XP system ─────────────────────────────────────────────
  XP_BASE: 200,                     // V3: raised from 150 — slower early levels
  XP_EXPONENT: 1.75,                // V3: slightly steeper
  XP_MAX_LEVEL: 50,

  // ── Business stats ────────────────────────────────────────
  STAT_INITIAL_POPULARITY:   20,
  STAT_INITIAL_REPUTATION:   30,
  STAT_INITIAL_SATISFACTION: 60,
  STAT_INITIAL_PRESTIGE:     0,
  STAT_MAX: 100,
  STAT_MIN: 0,

  // Stat → income multiplier (at 100 stat value, max bonus applies)
  POPULARITY_BOOST_MAX:    0.40,    // consumer activities: up to +40%
  REPUTATION_BOOST_MAX:    0.50,    // professional activities: up to +50%
  SATISFACTION_BOOST_MAX:  0.25,    // all automated activities: up to +25%
  PRESTIGE_BOOST_MAX:      0.30,    // luxury/premium activities: up to +30%

  // Stat decay rates (per second)
  SATISFACTION_DECAY_PER_SEC: 0.008,  // V3: slightly higher
  POPULARITY_DECAY_PER_SEC:   0.003,  // V3: slightly higher
  REPUTATION_DECAY_PER_SEC:   0.001,  // V3: very slow decay
  PRESTIGE_DECAY_PER_SEC:     0.0,    // prestige never decays

  // ── Events ────────────────────────────────────────────────
  EVENT_MIN_DELAY_MS: 360_000,    // 6 min
  EVENT_MAX_DELAY_MS: 720_000,    // 12 min

  // ── Progressive feature unlocks ───────────────────────────
  MARKET_UNLOCK_LEVEL:         4,
  STOCKS_UNLOCK_LEVEL:         7,
  SPECIALIZATION_UNLOCK_LEVEL: 6,
  DEPARTMENTS_UNLOCK_LEVEL:    5,   // V3
  ASSETS_UNLOCK_LEVEL:         8,   // V3
  TALENTS_UNLOCK_LEVEL:        3,   // V3 — talent tree available early but costly

  // ── Structural fixed costs (V3/V4) ───────────────────────────
  // Base rent per second before any modifiers
  BASE_RENT_PER_SEC: 0.5,          // starts tiny, scales with level
  RENT_LEVEL_MULTIPLIER: 1.05,     // V4: reduced from 1.08 to 5% per level (for longer progression)
  // e.g. level 10 → 0.5 × 1.05^10 ≈ 0.644€/s (was 1.08/s)

  // ── HR System (V4) ──────────────────────────────────────
  EMPLOYEE_CONTRIBUTION_BASE: 0.15,  // base multiplier each employee adds to activity output
  EMPLOYEE_SKILL_TO_CONTRIBUTION: 0.007,  // skill point → output bonus (0-100 skill → 0-0.7 contrib)
  MOTIVATION_CONTRIBUTION_MIN: 0.5,  // min contribution if motivation = 0 (still worth something)
  PROMOTION_COST_MULTIPLIER: 2.5,  // cost = current_salary * this
  TRAINING_COST_PER_SKILL_POINT: 200,  // cost per skill point training
  SEVERANCE_COST_MULTIPLIER: 3.0,  // cost = current_salary * this (firing cost)

  // ── Phase 2: Morale & Retention ───────────────────────
  GIVE_RAISE_COST: 200,          // cost to boost morale
  GIVE_RAISE_MOTIVATION_BOOST: 15,  // motivation points gained
  TURNOVER_RISK_THRESHOLD: 85,    // if risk > this, employee departs
  EMPLOYEE_DEPARTURE_NOTIFICATION_MORALE_HIT: 5,  // team morale penalty when someone leaves

  // ── Employee salary multiplier (global tuning knob) ───────
  SALARY_GLOBAL_MULTIPLIER: 1.0,

  // ── Department costs tuning (V3) ─────────────────────────
  DEPT_ONGOING_COST_MULTIPLIER: 1.0,  // global knob for department costs/s

  // ── Asset maintenance (V3) ────────────────────────────────
  ASSET_MAINTENANCE_MULTIPLIER: 1.0,

  // ── Offline progress cap ──────────────────────────────────
  MAX_OFFLINE_SECONDS: 14_400,     // 4 hours

  // ── Upgrade effect tuning ─────────────────────────────────
  UPGRADE_MULTIPLIER_NERF: 0.80,   // V3: tighter (was 0.85)

  // ── Talent points ─────────────────────────────────────────
  TALENT_POINTS_PER_LEVEL: 1,      // each level-up grants 1 talent point

  // ── Prestige thresholds (V3) ──────────────────────────────
  PRESTIGE_LUXURY_SEGMENT:   50,   // min prestige to access luxury market segment
  PRESTIGE_PREMIUM_EVENTS:   25,   // min prestige to get premium event weight bonus
  PRESTIGE_NICHE_PREMIUM:    30,   // min prestige for niche_premium segment

  // ── Strategy change cooldown ──────────────────────────────
  STRATEGY_CHANGE_COOLDOWN_MS: 600_000,  // 10 min between strategy changes

  // ── Department Effectiveness (Phase 3) ─────────────────────
  DEPT_EFFECTIVENESS_SKILL_WEIGHT: 0.5,      // skill vs motivation balance
  DEPT_EFFECTIVENESS_MOTIVATION_WEIGHT: 0.5, // motivation vs skill balance
  DEPT_LEADERSHIP_BONUS: 0.15,               // +15% if has lead
  DEPT_UNDERLEADERSHIP_PENALTY_PER_HEADCOUNT: 0.02,  // -2% per person without lead
  DEPT_MIN_HEADCOUNT_BEFORE_PENALTY: 5,      // don't penalize small teams
  DEPT_EFFECTIVENESS_MULTIPLIER_MIN: 0.3,    // floor (disorganized dept)
  DEPT_EFFECTIVENESS_MULTIPLIER_MAX: 1.3,    // ceiling (highly effective)

  // ── Organizational Structure (Phase 3) ───────────────────
  STRUCTURE_LEADERSHIP_RATIO: 5,              // 1 lead per N employees
  STRUCTURE_PENALTY_THRESHOLD: 80,            // apply penalties if < 80% structure health
  STRUCTURE_EFFICIENCY_PENALTY_SMALL: 0.05,   // -5% for teams 6-10
  STRUCTURE_EFFICIENCY_PENALTY_MEDIUM: 0.10,  // -10% for teams 11-15
  STRUCTURE_EFFICIENCY_PENALTY_LARGE: 0.15,   // -15% for teams 16+
  STRUCTURE_GRACE_PERIOD: 5,                  // no penalty for first 5 employees

  // ── Employee Assignment System (V4.5) ──────────────────────
  GAME_MONTH_DURATION_MS: 30 * 60 * 1000,     // 30 minutes = 1 game month
  EMPLOYEE_ASSIGNMENT_INCOME_BONUS: 0.15,     // +15% income per assigned employee
  EMPLOYEE_ASSIGNMENT_SPEED_BONUS: 0.5,       // up to 50% faster with employees
  EMPLOYEE_ASSIGNMENT_SKILL_BONUS: 20,        // up to +20 skill points
  UNPAID_DEPARTURE_THRESHOLD: 3,              // depart after 3 unpaid months
  UNPAID_MOTIVATION_PENALTY: -0.30,           // -30% motivation per unpaid month
} as const

export type Balance = typeof BALANCE
