import type { SpecializationDef } from '../entities'

/**
 * SPECIALIZATIONS — The player's strategic orientation.
 * Unlocked at BALANCE.SPECIALIZATION_UNLOCK_LEVEL (level 6).
 * Each creates real bonuses AND real trade-offs — no "best" choice.
 *
 * Pedagogical intent:
 * - Croissance agressive → cash-flow vs brand damage
 * - Marque premium → reputation as competitive moat
 * - Marketing viral → customer acquisition cost vs retention
 * - Automatisation → capex vs opex trade-off
 * - Innovation → R&D as long-term competitive advantage
 */
export const SPECIALIZATIONS: SpecializationDef[] = [
  {
    id: 'hypergrowth',
    name: 'Croissance agressive',
    description:
      'Tout pour le volume. Tu acceptes de sacrifier ton image pour grossir vite. ' +
      'Idéal pour ceux qui veulent scaler rapidement, mais gare à la réputation.',
    icon: '📈',
    unlockLevel: 6,
    bonuses: [
      '+25% revenus sur toutes les activités',
      'Employés -15% moins chers à recruter',
      '+20% gain de satisfaction',
    ],
    penalties: [
      'Popularité progresse -30% moins vite',
      'Réputation progresse -20% moins vite',
      'Activités +10% plus chères à acheter',
    ],
    effects: {
      allIncomeMultiplier: 1.25,
      consumerIncomeMultiplier: 1.0,
      professionalIncomeMultiplier: 1.0,
      employeeCostMultiplier: 0.85,
      activityCostMultiplier: 1.10,
      xpMultiplier: 1.0,
      popularityGrowthMultiplier: 0.70,
      reputationGrowthMultiplier: 0.80,
      satisfactionGrowthMultiplier: 1.20,
      salaryMultiplier: 1.0,
    },
  },
  {
    id: 'premium_brand',
    name: 'Marque premium',
    description:
      'La qualité avant tout. Tu positionnes tes offres en haut de gamme, ' +
      'ce qui justifie des prix plus élevés. La réputation est ton actif le plus précieux.',
    icon: '💎',
    unlockLevel: 6,
    bonuses: [
      '+50% revenus sur les activités professionnelles',
      'Réputation progresse 2× plus vite',
      'Satisfaction démarre plus haute',
    ],
    penalties: [
      'Activités +20% plus chères à acheter',
      '-15% revenus sur les activités grand public',
      'Salaires +20% plus élevés (équipe qualifiée)',
    ],
    effects: {
      allIncomeMultiplier: 1.0,
      consumerIncomeMultiplier: 0.85,
      professionalIncomeMultiplier: 1.50,
      employeeCostMultiplier: 1.0,
      activityCostMultiplier: 1.20,
      xpMultiplier: 1.0,
      popularityGrowthMultiplier: 1.0,
      reputationGrowthMultiplier: 2.0,
      satisfactionGrowthMultiplier: 1.0,
      salaryMultiplier: 1.20,
    },
  },
  {
    id: 'viral_marketing',
    name: 'Marketing viral',
    description:
      'L\'image de marque est ton moteur. Tu investis dans la visibilité, ' +
      'l\'acquisition client et le bouche-à-oreille. Fort sur le grand public, ' +
      'moins crédible en B2B.',
    icon: '📣',
    unlockLevel: 6,
    bonuses: [
      '+45% revenus sur les activités grand public',
      'Popularité progresse 2.5× plus vite',
      '+30% XP gagné (notoriété = influence)',
    ],
    penalties: [
      '-20% revenus sur les activités professionnelles',
      'Réputation progresse -25% moins vite',
      'Employés +15% plus chers (ils veulent être dans une belle boîte)',
    ],
    effects: {
      allIncomeMultiplier: 1.0,
      consumerIncomeMultiplier: 1.45,
      professionalIncomeMultiplier: 0.80,
      employeeCostMultiplier: 1.15,
      activityCostMultiplier: 1.0,
      xpMultiplier: 1.30,
      popularityGrowthMultiplier: 2.50,
      reputationGrowthMultiplier: 0.75,
      satisfactionGrowthMultiplier: 1.10,
      salaryMultiplier: 1.0,
    },
  },
  {
    id: 'full_automation',
    name: 'Automatisation totale',
    description:
      'Tu construis des systèmes, pas des emplois. Chaque euro investi en machines ' +
      'et processus rapporte plus. L\'empire tourne (presque) sans toi.',
    icon: '🤖',
    unlockLevel: 6,
    bonuses: [
      'Bonus de revenus des employés +50% (chaque employé rapporte plus)',
      'Employés -25% moins chers à recruter',
      'Satisfaction progresse 1.5× plus vite',
    ],
    penalties: [
      '+30% de salaires — les profils tech coûtent cher',
      'Revenus manuels (sans employé) -20%',
      'Popularité progresse -20% moins vite (peu d\'humain dans la boucle)',
    ],
    effects: {
      allIncomeMultiplier: 1.0,
      consumerIncomeMultiplier: 1.0,
      professionalIncomeMultiplier: 1.0,
      employeeCostMultiplier: 0.75,
      activityCostMultiplier: 1.0,
      xpMultiplier: 1.0,
      popularityGrowthMultiplier: 0.80,
      reputationGrowthMultiplier: 1.0,
      satisfactionGrowthMultiplier: 1.50,
      salaryMultiplier: 1.30,
    },
  },
  {
    id: 'innovation',
    name: 'Innovation & R&D',
    description:
      'Tu parles sur les ruptures technologiques. Les upgrades sont plus efficaces, ' +
      'tu montes plus vite en niveau et tu débloques les fonctionnalités plus tôt. ' +
      'Court terme difficile, long terme dominant.',
    icon: '🔬',
    unlockLevel: 6,
    bonuses: [
      '+35% XP sur toutes les activités',
      'Réputation progresse 1.5× plus vite',
      'Upgrades débloqués 1 niveau plus tôt',
    ],
    penalties: [
      'Activités +25% plus chères à acheter (investissement en R&D)',
      'Revenus globaux -10% (tu réinvestis)',
      'Popularité progresse -15% moins vite (profil tech peu grand public)',
    ],
    effects: {
      allIncomeMultiplier: 0.90,
      consumerIncomeMultiplier: 1.0,
      professionalIncomeMultiplier: 1.0,
      employeeCostMultiplier: 1.0,
      activityCostMultiplier: 1.25,
      xpMultiplier: 1.35,
      popularityGrowthMultiplier: 0.85,
      reputationGrowthMultiplier: 1.50,
      satisfactionGrowthMultiplier: 1.0,
      salaryMultiplier: 1.0,
    },
  },
]
