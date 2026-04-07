/**
 * CEO ARCHETYPES - Stage 4.6
 *
 * 6 distinct CEO playstyles with unique progression paths and bonuses.
 * Unlocked through prestige upgrades, each with different strength curves.
 */

export interface CEOArchetypeDef {
  id: string
  name: string
  description: string
  icon: string
  color: string

  // Starting bonuses
  startingMoney: number
  startingActivities: Record<string, number>  // activity ID -> count

  // Progression modifiers
  incomeMultiplier: number
  expMultiplier: number
  costMultiplier: number          // lower = cheaper activities

  // Stat affinities
  popularityBonus: number         // % bonus to popularity gain
  reputationBonus: number
  satisfactionBonus: number

  // HR bonuses
  hiringBonus: number             // % discount on hiring
  salaryReduction: number         // % reduction to salaries
  employeeContribution: number    // % bonus to employee effectiveness

  // Special abilities
  specialAbility: string          // name of unique mechanic
  specialAbilityDescription: string

  // Recommended activities (early/mid/late game)
  recommendedActivities: {
    early: string[]
    mid: string[]
    late: string[]
  }

  // Recommended prestige upgrades
  recommendedUpgrades: {
    tier1: string[]
    tier2: string[]
    tier3: string[]
  }

  // Playstyle summary
  playstyle: string
}

export const CEO_ARCHETYPES: CEOArchetypeDef[] = [
  {
    id: 'tycoon',
    name: 'Magnat / Tycoon',
    description: 'Maître de la finance et du profit. Revenu exponentiel. L\'empire bancaire.',
    icon: '💼',
    color: '#FFD700',

    startingMoney: 100,
    startingActivities: { soda: 1 },

    incomeMultiplier: 1.30,        // +30% all income
    expMultiplier: 0.95,           // -5% XP (slower level up)
    costMultiplier: 0.95,          // -5% activity costs

    popularityBonus: 5,
    reputationBonus: 15,
    satisfactionBonus: 0,

    hiringBonus: 20,               // 20% hiring discount
    salaryReduction: 15,
    employeeContribution: 1.10,

    specialAbility: 'Opportuniste Financier',
    specialAbilityDescription: 'Gagnez 2x prestige lors des resets grâce à votre réseau bancaire.',

    recommendedActivities: {
      early: ['dropshipping', 'freelance'],
      mid: ['ecommerce', 'saas'],
      late: ['venture_capital', 'media_empire'],
    },

    recommendedUpgrades: {
      tier1: ['fin_starter_capital', 'fin_efficiency_i', 'fin_cost_control'],
      tier2: ['fin_efficiency_ii', 'fin_bonus_interest', 'fin_passive_empire'],
      tier3: ['fin_market_instinct', 'fin_debt_freedom', 'ceo_tycoon'],
    },

    playstyle: 'Fokus sur maximisation des revenus. Dépensez pour créer de la richesse. Plus tôt vous atteignez le prestige, meilleur est votre avantage.',
  },

  {
    id: 'visionary',
    name: 'Visionnaire / Innovation',
    description: 'Créateur de disruption. Technologie et innovation. L\'empire digital.',
    icon: '🔮',
    color: '#00FF7F',

    startingMoney: 50,
    startingActivities: { soda: 1, blog: 0.5 },

    incomeMultiplier: 1.15,
    expMultiplier: 1.20,           // +20% XP (level faster)
    costMultiplier: 1.05,          // +5% activity costs (innovation premium)

    popularityBonus: 20,
    reputationBonus: 20,
    satisfactionBonus: 10,

    hiringBonus: 10,
    salaryReduction: 5,
    employeeContribution: 1.25,    // +25% employee output

    specialAbility: 'Avance technologique',
    specialAbilityDescription: 'Débloquez activités 3 niveaux avant les autres. Accès à quantum computer + IA lab à niveau 24.',

    recommendedActivities: {
      early: ['blog', 'tutoring'],
      mid: ['app', 'freelance'],
      late: ['saas', 'media_empire'],
    },

    recommendedUpgrades: {
      tier1: ['inno_activity_speed_i', 'inno_automation_i', 'inno_parallel_processing'],
      tier2: ['inno_batch_operations', 'inno_ai_assistant', 'inno_predictive_analytics'],
      tier3: ['inno_quantum_leap', 'ceo_visionary', 'ai_laboratory'],
    },

    playstyle: 'Montez de niveau vite et débloquez features tôt. Investissez dans l\'automatisation et les technos. Votre avantage : temps = argent.',
  },

  {
    id: 'people_person',
    name: 'Humaniste / Ressources Humaines',
    description: 'Bâtisseur d\'empires par les humains. Culture d\'équipe. L\'empire humain.',
    icon: '🤝',
    color: '#FF69B4',

    startingMoney: 60,
    startingActivities: { soda: 1, tutoring: 0.5 },

    incomeMultiplier: 1.10,
    expMultiplier: 1.10,
    costMultiplier: 0.90,          // -10% activity costs (team efficiency)

    popularityBonus: 10,
    reputationBonus: 15,
    satisfactionBonus: 25,         // +25% satisfaction

    hiringBonus: 50,               // 50% hiring discount!
    salaryReduction: 25,
    employeeContribution: 1.40,    // +40% employee effectiveness

    specialAbility: 'Loyauté Absolue',
    specialAbilityDescription: 'Les employés ne peuvent jamais partir. Morale = productivité maximale.',

    recommendedActivities: {
      early: ['soda', 'tutoring'],
      mid: ['ecommerce'],
      late: ['agency', 'philanthropy'],
    },

    recommendedUpgrades: {
      tier1: ['hr_recruitment_i', 'hr_morale_boost_i', 'hr_retention_expert'],
      tier2: ['hr_training_program', 'hr_leadership_culture', 'hr_workplace_paradise'],
      tier3: ['hr_diversity_bonus', 'hr_executive_core', 'ceo_people_person'],
    },

    playstyle: 'Embauchez massivement (vous payez 50% moins). Bâtissez une super-équipe. Les employés = votre avantage compétitif.',
  },

  {
    id: 'celebrity',
    name: 'Célébrité / Marketing',
    description: 'Guru du marketing et de la brand. Prestige et popularité. L\'empire médiatique.',
    icon: '⭐',
    color: '#FF6347',

    startingMoney: 75,
    startingActivities: { soda: 1 },

    incomeMultiplier: 1.20,
    expMultiplier: 1.05,
    costMultiplier: 0.98,

    popularityBonus: 40,           // +40% popularity
    reputationBonus: 10,
    satisfactionBonus: 15,

    hiringBonus: 15,
    salaryReduction: 10,
    employeeContribution: 1.15,

    specialAbility: 'Aura du Succès',
    specialAbilityDescription: 'Chaque employé gagne +20% prestige à chaque reset grâce à votre renommée.',

    recommendedActivities: {
      early: ['blog'],
      mid: ['app', 'ecommerce'],
      late: ['global_brand', 'media_empire'],
    },

    recommendedUpgrades: {
      tier1: ['mkt_brand_i', 'mkt_ad_campaign', 'mkt_viral_effect'],
      tier2: ['mkt_customer_loyalty', 'mkt_reputation_sync', 'mkt_influencer_network'],
      tier3: ['mkt_premium_brand', 'ceo_celebrity', 'global_brand'],
    },

    playstyle: 'Fokus sur popularité et brand building. Chaque statut social = revenus accrus. Votre renommée = votre monnaie.',
  },

  {
    id: 'strategist',
    name: 'Stratège / Leadership',
    description: 'Orchestrateur d\'équipes et de départements. Systèmes et synergies. L\'empire organisé.',
    icon: '♞',
    color: '#4169E1',

    startingMoney: 80,
    startingActivities: { soda: 1 },

    incomeMultiplier: 1.12,
    expMultiplier: 1.10,
    costMultiplier: 0.92,

    popularityBonus: 12,
    reputationBonus: 25,
    satisfactionBonus: 20,

    hiringBonus: 25,
    salaryReduction: 20,
    employeeContribution: 1.35,

    specialAbility: 'Synergies Départementales',
    specialAbilityDescription: 'Les départements se boostent mutuellement. Chaque level dept = +5% revenus de tous les autres.',

    recommendedActivities: {
      early: ['dropshipping'],
      mid: ['freelance', 'ecommerce'],
      late: ['agency', 'startup'],
    },

    recommendedUpgrades: {
      tier1: ['lead_efficiency_i', 'lead_team_synergy', 'lead_delegation_expert'],
      tier2: ['lead_coaching_culture', 'lead_dept_mastery', 'lead_cross_dept_flow'],
      tier3: ['lead_strategic_vision', 'ceo_strategist', 'luxury_hotel_chain'],
    },

    playstyle: 'Gérez les départements comme un orchestre. Équilibre = puissance. Votre contrôle du système = victoire.',
  },

  {
    id: 'legacy_builder',
    name: 'Bâtisseur / Héritage',
    description: 'Constructeur d\'empires permanents. Héritage et impact. Le monde après vous.',
    icon: '🏛️',
    color: '#9370DB',

    startingMoney: 90,
    startingActivities: { soda: 1, tutoring: 1 },

    incomeMultiplier: 1.25,
    expMultiplier: 1.15,
    costMultiplier: 1.02,

    popularityBonus: 15,
    reputationBonus: 30,
    satisfactionBonus: 25,

    hiringBonus: 20,
    salaryReduction: 18,
    employeeContribution: 1.20,

    specialAbility: 'Empire Éternel',
    specialAbilityDescription: 'Chaque reset garde 50% de vos bâtiments et améliorations. Héritage = fondation de puissance.',

    recommendedActivities: {
      early: ['tutoring', 'soda'],
      mid: ['ecommerce', 'saas'],
      late: ['philanthropy', 'civilization'],
    },

    recommendedUpgrades: {
      tier1: ['legacy_historian', 'legacy_dynasty_momentum', 'legacy_monuments'],
      tier2: ['legacy_archive_mastery', 'legacy_legendary_status', 'legacy_eternal_empire'],
      tier3: ['legacy_time_lord', 'ceo_visionary', 'philanthropic_foundation'],
    },

    playstyle: 'Pensez long terme. Chaque reset = fondation plus solide. Votre empire croît exponentiellement à travers les réinitializations.',
  },
]

/**
 * Get archetype bonus for a specific stat/effect
 */
export function getArchetypeBonus(
  archetypeId: string,
  bonusType: keyof Omit<CEOArchetypeDef, 'id' | 'name' | 'description' | 'icon' | 'color' | 'specialAbility' | 'specialAbilityDescription' | 'recommendedActivities' | 'recommendedUpgrades' | 'playstyle'>,
): number {
  const archetype = CEO_ARCHETYPES.find(a => a.id === archetypeId)
  if (!archetype) return 0
  return archetype[bonusType] as number
}

/**
 * Get archetype by ID
 */
export function getArchetype(id: string): CEOArchetypeDef | undefined {
  return CEO_ARCHETYPES.find(a => a.id === id)
}
