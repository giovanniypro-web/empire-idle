import type { PrestigeUpgradeDef } from '../entities'

export const PRESTIGE_UPGRADES: PrestigeUpgradeDef[] = [
  // ================================================================
  // FINANCE BRANCH (Income, Money Management, Investment)
  // ================================================================
  {
    id: 'fin_starter_capital',
    name: 'Capital de Démarrage',
    description: 'Commence chaque nouvelle carrière avec 500€ supplémentaires',
    icon: '💰',
    branch: 'finance',
    cost: 10,
    maxLevel: 1,
    effects: [
      { type: 'starting_money', magnitude: 500 },
    ],
  },
  {
    id: 'fin_efficiency_i',
    name: 'Rendement Accru I',
    description: '+5% de revenus de toutes les activités',
    icon: '📈',
    branch: 'finance',
    cost: 15,
    maxLevel: 3,
    effects: [
      { type: 'activity_income', magnitude: 1.05 },
    ],
  },
  {
    id: 'fin_efficiency_ii',
    name: 'Rendement Accru II',
    description: '+8% de revenus supplémentaires (cumule avec I)',
    icon: '📈',
    branch: 'finance',
    cost: 25,
    maxLevel: 2,
    prerequisiteUpgradeIds: ['fin_efficiency_i'],
    effects: [
      { type: 'activity_income', magnitude: 1.08 },
    ],
  },
  {
    id: 'fin_cost_control',
    name: 'Maîtrise des Coûts',
    description: '-10% les salaires',
    icon: '💼',
    branch: 'finance',
    cost: 20,
    maxLevel: 2,
    effects: [
      { type: 'salary_reduction', magnitude: 0.10 },
    ],
  },
  {
    id: 'fin_bonus_interest',
    name: 'Intérêt Composé',
    description: '+2% intérêt passif sur la trésorerie (€/s)',
    icon: '🏦',
    branch: 'finance',
    cost: 30,
    maxLevel: 1,
    prerequisiteUpgradeIds: ['fin_starter_capital'],
    effects: [
      { type: 'income_multiplier', magnitude: 1.02 },
    ],
  },
  {
    id: 'fin_passive_empire',
    name: 'Empire Passif',
    description: '+15% revenus passifs des actifs',
    icon: '🏛️',
    branch: 'finance',
    cost: 35,
    maxLevel: 2,
    effects: [
      { type: 'income_multiplier', magnitude: 0.15 },
    ],
  },
  {
    id: 'fin_market_instinct',
    name: 'Instinct Marchand',
    description: '+12% sur les transactions boursières et marchés',
    icon: '📊',
    branch: 'finance',
    cost: 40,
    maxLevel: 1,
    effects: [
      { type: 'income_multiplier', magnitude: 1.12 },
    ],
  },
  {
    id: 'fin_debt_freedom',
    name: 'Liberté de la Dette',
    description: '-15% coûts de département',
    icon: '🔓',
    branch: 'finance',
    cost: 45,
    maxLevel: 1,
    effects: [
      { type: 'salary_reduction', magnitude: 0.15 },
    ],
  },

  // ================================================================
  // HR BRANCH (Hiring, Team Management, Morale)
  // ================================================================
  {
    id: 'hr_recruitment_i',
    name: 'Recrutement Optimisé I',
    description: '+20% capacité d\'embauche initiale',
    icon: '👥',
    branch: 'hr',
    cost: 12,
    maxLevel: 2,
    effects: [
      { type: 'hiring_bonus', magnitude: 1.20 },
    ],
  },
  {
    id: 'hr_morale_boost_i',
    name: 'Morale d\'Équipe I',
    description: '+8% moral des employés',
    icon: '😊',
    branch: 'hr',
    cost: 15,
    maxLevel: 3,
    effects: [
      { type: 'morale_bonus', magnitude: 1.08 },
    ],
  },
  {
    id: 'hr_retention_expert',
    name: 'Expert en Rétention',
    description: '-25% taux de départ des employés',
    icon: '🤝',
    branch: 'hr',
    cost: 25,
    maxLevel: 1,
    prerequisiteUpgradeIds: ['hr_morale_boost_i'],
    effects: [
      { type: 'custom', magnitude: 0.25 },
    ],
  },
  {
    id: 'hr_training_program',
    name: 'Programme de Formation',
    description: '+15% efficacité des entraînements',
    icon: '📚',
    branch: 'hr',
    cost: 22,
    maxLevel: 2,
    effects: [
      { type: 'custom', magnitude: 0.15 },
    ],
  },
  {
    id: 'hr_leadership_culture',
    name: 'Culture du Leadership',
    description: '+20% rendement des employés leaders',
    icon: '👑',
    branch: 'hr',
    cost: 30,
    maxLevel: 1,
    effects: [
      { type: 'morale_bonus', magnitude: 1.20 },
    ],
  },
  {
    id: 'hr_workplace_paradise',
    name: 'Paradis du Travail',
    description: 'Satisfaction augmente 2x plus vite',
    icon: '🌟',
    branch: 'hr',
    cost: 40,
    maxLevel: 1,
    prerequisiteUpgradeIds: ['hr_morale_boost_i', 'hr_retention_expert'],
    effects: [
      { type: 'custom', magnitude: 2.0 },
    ],
  },
  {
    id: 'hr_diversity_bonus',
    name: 'Diversité = Force',
    description: '+10% rendement pour chaque archétype différent embauché',
    icon: '🌈',
    branch: 'hr',
    cost: 35,
    maxLevel: 1,
    effects: [
      { type: 'morale_bonus', magnitude: 1.10 },
    ],
  },
  {
    id: 'hr_executive_core',
    name: 'Noyau Exécutif',
    description: 'Les employés niveau Exec ne peuvent pas partir',
    icon: '💎',
    branch: 'hr',
    cost: 50,
    maxLevel: 1,
    prerequisiteUpgradeIds: ['hr_leadership_culture'],
    effects: [
      { type: 'custom', magnitude: 1.0 },
    ],
  },

  // ================================================================
  // MARKETING BRANCH (Popularity, Brand, Customer Acquisition)
  // ================================================================
  {
    id: 'mkt_brand_i',
    name: 'Marque Établie I',
    description: '+8% popularité de base',
    icon: '🎯',
    branch: 'marketing',
    cost: 14,
    maxLevel: 3,
    effects: [
      { type: 'popularity_gain', magnitude: 1.08 },
    ],
  },
  {
    id: 'mkt_ad_campaign',
    name: 'Campagne Publicitaire',
    description: '+20% gain de popularité par activité',
    icon: '📢',
    branch: 'marketing',
    cost: 20,
    maxLevel: 2,
    effects: [
      { type: 'popularity_gain', magnitude: 1.20 },
    ],
  },
  {
    id: 'mkt_viral_effect',
    name: 'Effet Viral',
    description: '+15% croissance de popularité exponentielle',
    icon: '🚀',
    branch: 'marketing',
    cost: 28,
    maxLevel: 1,
    prerequisiteUpgradeIds: ['mkt_brand_i', 'mkt_ad_campaign'],
    effects: [
      { type: 'popularity_gain', magnitude: 1.15 },
    ],
  },
  {
    id: 'mkt_customer_loyalty',
    name: 'Fidélité Clientèle',
    description: '+25% valeur de chaque client',
    icon: '❤️',
    branch: 'marketing',
    cost: 32,
    maxLevel: 1,
    effects: [
      { type: 'income_multiplier', magnitude: 1.25 },
    ],
  },
  {
    id: 'mkt_influencer_network',
    name: 'Réseau d\'Influenceurs',
    description: '+30% gain de popularité de façon passive',
    icon: '⭐',
    branch: 'marketing',
    cost: 38,
    maxLevel: 1,
    prerequisiteUpgradeIds: ['mkt_customer_loyalty'],
    effects: [
      { type: 'popularity_gain', magnitude: 1.30 },
    ],
  },
  {
    id: 'mkt_reputation_sync',
    name: 'Synchronisation Réputation',
    description: 'Popularité et réputation s\'influencent mutuellement (+10%)',
    icon: '🔗',
    branch: 'marketing',
    cost: 35,
    maxLevel: 1,
    effects: [
      { type: 'reputation_gain', magnitude: 1.10 },
    ],
  },
  {
    id: 'mkt_premium_brand',
    name: 'Marque Premium',
    description: '+5% prix de vente (augmente revenus)',
    icon: '👑',
    branch: 'marketing',
    cost: 42,
    maxLevel: 1,
    prerequisiteUpgradeIds: ['mkt_influencer_network'],
    effects: [
      { type: 'activity_income', magnitude: 1.05 },
    ],
  },

  // ================================================================
  // LEADERSHIP BRANCH (Department Effectiveness, Employee Contribution)
  // ================================================================
  {
    id: 'lead_efficiency_i',
    name: 'Leadership I',
    description: '+10% rendement des départements',
    icon: '⚙️',
    branch: 'leadership',
    cost: 16,
    maxLevel: 3,
    effects: [
      { type: 'custom', magnitude: 1.10 },
    ],
  },
  {
    id: 'lead_team_synergy',
    name: 'Synergie d\'Équipe',
    description: 'Bonus +5% par employé dans le même département',
    icon: '🤲',
    branch: 'leadership',
    cost: 24,
    maxLevel: 2,
    prerequisites: ['lead_efficiency_i'],
    effects: [
      { type: 'custom', magnitude: 1.05 },
    ],
  },
  {
    id: 'lead_delegation_expert',
    name: 'Expert en Délégation',
    description: '+15% efficacité des activités automatisées',
    icon: '✋',
    branch: 'leadership',
    cost: 26,
    maxLevel: 1,
    effects: [
      { type: 'activity_speed', magnitude: 1.15 },
    ],
  },
  {
    id: 'lead_coaching_culture',
    name: 'Culture du Coaching',
    description: '+20% gain de compétence des employés',
    icon: '🏋️',
    branch: 'leadership',
    cost: 32,
    maxLevel: 1,
    prerequisiteUpgradeIds: ['lead_efficiency_i'],
    effects: [
      { type: 'custom', magnitude: 1.20 },
    ],
  },
  {
    id: 'lead_dept_mastery',
    name: 'Maîtrise Départementale',
    description: '+25% bonus si département niveau 5',
    icon: '🏆',
    branch: 'leadership',
    cost: 36,
    maxLevel: 1,
    prerequisiteUpgradeIds: ['lead_coaching_culture'],
    effects: [
      { type: 'custom', magnitude: 1.25 },
    ],
  },
  {
    id: 'lead_cross_dept_flow',
    name: 'Flux Inter-Départemental',
    description: '+8% partage d\'expérience entre départements',
    icon: '🌊',
    branch: 'leadership',
    cost: 34,
    maxLevel: 1,
    effects: [
      { type: 'custom', magnitude: 1.08 },
    ],
  },
  {
    id: 'lead_strategic_vision',
    name: 'Vision Stratégique',
    description: '+40% efficacité de tous les départements',
    icon: '🔮',
    branch: 'leadership',
    cost: 50,
    maxLevel: 1,
    prerequisiteUpgradeIds: ['lead_dept_mastery', 'lead_cross_dept_flow'],
    effects: [
      { type: 'custom', magnitude: 1.40 },
    ],
  },

  // ================================================================
  // INNOVATION BRANCH (Efficiency, Speed, New Mechanics)
  // ================================================================
  {
    id: 'inno_activity_speed_i',
    name: 'Optimisation de Processus I',
    description: '+10% vitesse des activités',
    icon: '⚡',
    branch: 'innovation',
    cost: 18,
    maxLevel: 3,
    effects: [
      { type: 'activity_speed', magnitude: 1.10 },
    ],
  },
  {
    id: 'inno_automation_i',
    name: 'Automatisation I',
    description: 'Les activités s\'automatisent 2 niveaux plus tôt',
    icon: '🤖',
    branch: 'innovation',
    cost: 23,
    maxLevel: 1,
    effects: [
      { type: 'custom', magnitude: 2 },
    ],
  },
  {
    id: 'inno_parallel_processing',
    name: 'Traitement Parallèle',
    description: 'Doublez le nombre d\'activités simultanées possibles',
    icon: '⚙️⚙️',
    branch: 'innovation',
    cost: 31,
    maxLevel: 1,
    prerequisiteUpgradeIds: ['inno_automation_i'],
    effects: [
      { type: 'custom', magnitude: 2.0 },
    ],
  },
  {
    id: 'inno_batch_operations',
    name: 'Opérations par Lots',
    description: '+20% revenus quand 3+ activités tournent ensemble',
    icon: '📦',
    branch: 'innovation',
    cost: 28,
    maxLevel: 1,
    effects: [
      { type: 'income_multiplier', magnitude: 1.20 },
    ],
  },
  {
    id: 'inno_ai_assistant',
    name: 'Assistant IA',
    description: '-30% temps d\'entraînement des employés',
    icon: '🧠',
    branch: 'innovation',
    cost: 37,
    maxLevel: 1,
    prerequisiteUpgradeIds: ['inno_automation_i', 'inno_activity_speed_i'],
    effects: [
      { type: 'custom', magnitude: 0.30 },
    ],
  },
  {
    id: 'inno_predictive_analytics',
    name: 'Analyse Prédictive',
    description: '+18% rendement des décisions métier',
    icon: '🔍',
    branch: 'innovation',
    cost: 33,
    maxLevel: 1,
    effects: [
      { type: 'income_multiplier', magnitude: 1.18 },
    ],
  },
  {
    id: 'inno_quantum_leap',
    name: 'Saut Quantique',
    description: '+50% de toutes les vitesses (activités, formations, etc)',
    icon: '⚛️',
    branch: 'innovation',
    cost: 52,
    maxLevel: 1,
    prerequisiteUpgradeIds: ['inno_parallel_processing', 'inno_predictive_analytics'],
    effects: [
      { type: 'activity_speed', magnitude: 1.50 },
    ],
  },

  // ================================================================
  // LEGACY BRANCH (Historical Unlocks, Narrative, Meta Progression)
  // ================================================================
  {
    id: 'legacy_historian',
    name: 'Historien de l\'Empire',
    description: '+10% prestige gagné par reset',
    icon: '📖',
    branch: 'legacy',
    cost: 20,
    maxLevel: 2,
    effects: [
      { type: 'custom', magnitude: 1.10 },
    ],
  },
  {
    id: 'legacy_dynasty_momentum',
    name: 'Élan Dynastique',
    description: 'Chaque reset passé = +2% permanent à tous les revenus',
    icon: '👑',
    branch: 'legacy',
    cost: 30,
    maxLevel: 1,
    prerequisiteUpgradeIds: ['legacy_historian'],
    effects: [
      { type: 'income_multiplier', magnitude: 0.02 },
    ],
  },
  {
    id: 'legacy_monuments',
    name: 'Monuments d\'Héritage',
    description: 'Débloquez des bâtiments historiques donnant +prestige',
    icon: '🏛️',
    branch: 'legacy',
    cost: 40,
    maxLevel: 1,
    prerequisiteUpgradeIds: ['legacy_dynasty_momentum'],
    effects: [
      { type: 'custom', magnitude: 1 },
    ],
  },
  {
    id: 'legacy_legendary_status',
    name: 'Statut Légendaire',
    description: 'Débloquez le mode "Tycoon" avec 10x prestige gains',
    icon: '💫',
    branch: 'legacy',
    cost: 60,
    maxLevel: 1,
    minimumPrestigeResets: 3,
    prerequisiteUpgradeIds: ['legacy_monuments'],
    effects: [
      { type: 'custom', magnitude: 10 },
    ],
  },
  {
    id: 'legacy_archive_mastery',
    name: 'Maîtrise des Archives',
    description: '+15% accès aux anciennes données de run précédentes',
    icon: '📚',
    branch: 'legacy',
    cost: 35,
    maxLevel: 1,
    effects: [
      { type: 'custom', magnitude: 1.15 },
    ],
  },
  {
    id: 'legacy_eternal_empire',
    name: 'Empire Éternel',
    description: 'Les statuts CEO acquis ne réinitient plus jamais',
    icon: '∞',
    branch: 'legacy',
    cost: 55,
    maxLevel: 1,
    minimumPrestigeResets: 2,
    prerequisiteUpgradeIds: ['legacy_legendary_status'],
    effects: [
      { type: 'custom', magnitude: 1 },
    ],
  },
  {
    id: 'legacy_time_lord',
    name: 'Maître du Temps',
    description: '-5% cooldown des spécialisations (unlock après 5 resets)',
    icon: '⏰',
    branch: 'legacy',
    cost: 45,
    maxLevel: 1,
    minimumPrestigeResets: 5,
    effects: [
      { type: 'custom', magnitude: 0.05 },
    ],
  },

  // ================================================================
  // CEO ARCHETYPE UNLOCKS (Available across all branches)
  // ================================================================
  {
    id: 'ceo_visionary',
    name: 'Déverrouiller Archétype : Visionnaire',
    description: 'Débloquez l\'archétype CEO "Visionnaire" (+40% innovation)',
    icon: '🔮',
    branch: 'innovation',
    cost: 25,
    maxLevel: 1,
    effects: [
      { type: 'unlock_ceo_archetype', magnitude: 1 },
    ],
  },
  {
    id: 'ceo_tycoon',
    name: 'Déverrouiller Archétype : Magnat',
    description: 'Débloquez l\'archétype CEO "Magnat" (+40% revenus)',
    icon: '💼',
    branch: 'finance',
    cost: 25,
    maxLevel: 1,
    effects: [
      { type: 'unlock_ceo_archetype', magnitude: 1 },
    ],
  },
  {
    id: 'ceo_people_person',
    name: 'Déverrouiller Archétype : Humain',
    description: 'Débloquez l\'archétype CEO "Humaniste" (+40% HR)',
    icon: '🤝',
    branch: 'hr',
    cost: 25,
    maxLevel: 1,
    effects: [
      { type: 'unlock_ceo_archetype', magnitude: 1 },
    ],
  },
  {
    id: 'ceo_celebrity',
    name: 'Déverrouiller Archétype : Célébrité',
    description: 'Débloquez l\'archétype CEO "Célébrité" (+40% marketing)',
    icon: '⭐',
    branch: 'marketing',
    cost: 25,
    maxLevel: 1,
    effects: [
      { type: 'unlock_ceo_archetype', magnitude: 1 },
    ],
  },
  {
    id: 'ceo_strategist',
    name: 'Déverrouiller Archétype : Stratège',
    description: 'Débloquez l\'archétype CEO "Stratège" (+40% leadership)',
    icon: '♞',
    branch: 'leadership',
    cost: 25,
    maxLevel: 1,
    effects: [
      { type: 'unlock_ceo_archetype', magnitude: 1 },
    ],
  },
]
