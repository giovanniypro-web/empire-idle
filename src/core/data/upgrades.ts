import type { UpgradeDef } from '../entities'

/**
 * UPGRADES V2 — Rebalanced for deeper investment decisions.
 *
 * Key changes from V1:
 * - Costs scaled to V2 activity costs (30× / 150× / 700× base cost rule)
 * - Multipliers slightly toned down (2× → 1.8×, 5× → 3.5×)
 * - Global upgrades gated later and more expensive
 * - unlockLevel conditions tightened
 *
 * Multiplier nerf note: BALANCE.UPGRADE_MULTIPLIER_NERF applies 0.85×
 * to all upgrade multipliers in economySystem, so stated values are
 * aspirational — actual effect is slightly less. Keeps data readable.
 */
export const UPGRADES: UpgradeDef[] = [
  // ── SODA ──────────────────────────────────────────────────
  {
    id: 'soda_recipe',
    name: 'Recette secrète',
    description: 'Une formule qui fait revenir les clients. Revenus kiosque ×1.8.',
    icon: '🧪',
    cost: 450,
    effects: [{ type: 'activity_income', activityId: 'soda', multiplier: 1.8 }],
    unlockLevel: 1,
  },
  {
    id: 'soda_bulk',
    name: 'Achat en gros',
    description: 'Volume = meilleures marges. Revenus ×2.5.',
    icon: '📦',
    cost: 4_500,
    effects: [{ type: 'activity_income', activityId: 'soda', multiplier: 2.5 }],
    unlockLevel: 1,
    requires: ['soda_recipe'],
  },
  {
    id: 'soda_franchise',
    name: 'Franchise sodas',
    description: 'Ouvre plusieurs kiosques. Revenus ×3.5, vitesse ×1.8.',
    icon: '🏪',
    cost: 22_000,
    effects: [
      { type: 'activity_income', activityId: 'soda', multiplier: 3.5 },
      { type: 'activity_speed', activityId: 'soda', multiplier: 1.8 },
    ],
    unlockLevel: 2,
    requires: ['soda_bulk'],
  },

  // ── TUTORING ──────────────────────────────────────────────
  {
    id: 'tutoring_method',
    name: 'Méthode pédagogique',
    description: 'Une méthode éprouvée, meilleurs résultats. ×1.8.',
    icon: '🎓',
    cost: 3_600,
    effects: [{ type: 'activity_income', activityId: 'tutoring', multiplier: 1.8 }],
    unlockLevel: 1,
  },
  {
    id: 'tutoring_platform',
    name: 'Plateforme en ligne',
    description: 'Cours en ligne = plus d\'élèves. ×2.5, vitesse ×1.8.',
    icon: '🖥️',
    cost: 30_000,
    effects: [
      { type: 'activity_income', activityId: 'tutoring', multiplier: 2.5 },
      { type: 'activity_speed', activityId: 'tutoring', multiplier: 1.8 },
    ],
    unlockLevel: 2,
    requires: ['tutoring_method'],
  },

  // ── BLOG ──────────────────────────────────────────────────
  {
    id: 'blog_seo',
    name: 'Optimisation SEO',
    description: 'Premier résultat Google = trafic multiplié. ×1.8.',
    icon: '🔍',
    cost: 21_000,
    effects: [{ type: 'activity_income', activityId: 'blog', multiplier: 1.8 }],
    unlockLevel: 2,
  },
  {
    id: 'blog_newsletter',
    name: 'Newsletter premium',
    description: 'Une liste d\'abonnés fidèles et monétisables. ×2.5, vitesse ×1.8.',
    icon: '📧',
    cost: 120_000,
    effects: [
      { type: 'activity_income', activityId: 'blog', multiplier: 2.5 },
      { type: 'activity_speed', activityId: 'blog', multiplier: 1.8 },
    ],
    unlockLevel: 3,
    requires: ['blog_seo'],
  },

  // ── DROPSHIPPING ──────────────────────────────────────────
  {
    id: 'drop_niche',
    name: 'Niche profitable',
    description: 'La niche parfaite avec les meilleures marges. ×1.8.',
    icon: '🎯',
    cost: 120_000,
    effects: [{ type: 'activity_income', activityId: 'dropshipping', multiplier: 1.8 }],
    unlockLevel: 3,
  },
  {
    id: 'drop_ads',
    name: 'Publicité ciblée',
    description: 'Facebook Ads optimisées. ×2.5, vitesse ×1.5.',
    icon: '📣',
    cost: 700_000,
    effects: [
      { type: 'activity_income', activityId: 'dropshipping', multiplier: 2.5 },
      { type: 'activity_speed', activityId: 'dropshipping', multiplier: 1.5 },
    ],
    unlockLevel: 4,
    requires: ['drop_niche'],
  },

  // ── FREELANCE ─────────────────────────────────────────────
  {
    id: 'freelance_portfolio',
    name: 'Portfolio professionnel',
    description: 'Attire des clients mieux payeurs. ×1.8.',
    icon: '🎨',
    cost: 750_000,
    effects: [{ type: 'activity_income', activityId: 'freelance', multiplier: 1.8 }],
    unlockLevel: 5,
  },
  {
    id: 'freelance_retainer',
    name: 'Contrats récurrents',
    description: 'Clients fidèles et stables = revenu prévisible. ×2.5, vitesse ×1.8.',
    icon: '🤝',
    cost: 4_000_000,
    effects: [
      { type: 'activity_income', activityId: 'freelance', multiplier: 2.5 },
      { type: 'activity_speed', activityId: 'freelance', multiplier: 1.8 },
    ],
    unlockLevel: 7,
    requires: ['freelance_portfolio'],
  },

  // ── ECOMMERCE ─────────────────────────────────────────────
  {
    id: 'ecommerce_brand',
    name: 'Branding fort',
    description: 'Marque reconnue = prix premium et fidélité. ×1.8.',
    icon: '⭐',
    cost: 6_000_000,
    effects: [{ type: 'activity_income', activityId: 'ecommerce', multiplier: 1.8 }],
    unlockLevel: 7,
  },
  {
    id: 'ecommerce_logistics',
    name: 'Logistique optimisée',
    description: 'Partenariat entrepôt. ×2.5, vitesse ×2.',
    icon: '🚛',
    cost: 35_000_000,
    effects: [
      { type: 'activity_income', activityId: 'ecommerce', multiplier: 2.5 },
      { type: 'activity_speed', activityId: 'ecommerce', multiplier: 2.0 },
    ],
    unlockLevel: 9,
    requires: ['ecommerce_brand'],
  },

  // ── APP ───────────────────────────────────────────────────
  {
    id: 'app_monetization',
    name: 'Monétisation avancée',
    description: 'In-app purchases et premium tier. ×2.',
    icon: '💰',
    cost: 50_000_000,
    effects: [{ type: 'activity_income', activityId: 'app', multiplier: 2.0 }],
    unlockLevel: 9,
  },
  {
    id: 'app_viral',
    name: 'Boucle virale',
    description: 'Partage intégré = croissance organique massive. ×3.5.',
    icon: '🔄',
    cost: 250_000_000,
    effects: [{ type: 'activity_income', activityId: 'app', multiplier: 3.5 }],
    unlockLevel: 11,
    requires: ['app_monetization'],
  },

  // ── SAAS ──────────────────────────────────────────────────
  {
    id: 'saas_enterprise',
    name: 'Offre Enterprise',
    description: 'Contrats annuels à 6 chiffres avec grands comptes. ×2.5.',
    icon: '🏭',
    cost: 650_000_000,
    effects: [{ type: 'activity_income', activityId: 'saas', multiplier: 2.5 }],
    unlockLevel: 12,
  },
  {
    id: 'saas_ai',
    name: 'Fonctionnalités IA',
    description: 'L\'IA justifie la hausse de prix × 2 et réduit le churn. ×3.5.',
    icon: '🤖',
    cost: 3_500_000_000,
    effects: [{ type: 'activity_income', activityId: 'saas', multiplier: 3.5 }],
    unlockLevel: 14,
    requires: ['saas_enterprise'],
  },

  // ── GLOBAL ────────────────────────────────────────────────
  {
    id: 'global_ambition',
    name: 'Ambition sans limites',
    description: 'Ton mindset affûté accélère ta montée en compétences. XP ×1.5.',
    icon: '🌟',
    cost: 8_000,
    effects: [{ type: 'global_xp', multiplier: 1.5 }],
    unlockLevel: 3,
  },
  {
    id: 'global_mentor',
    name: 'Mentor d\'exception',
    description: 'Un réseau d\'élite qui multiplie les opportunités. XP ×1.5, revenus ×1.15.',
    icon: '🧠',
    cost: 80_000,
    effects: [
      { type: 'global_xp', multiplier: 1.5 },
      { type: 'global_income', multiplier: 1.15 },
    ],
    unlockLevel: 6,
    requires: ['global_ambition'],
  },
  {
    id: 'global_holding',
    name: 'Structure Holding',
    description: 'Optimisation fiscale et synergies légales. Tous revenus ×1.25.',
    icon: '⚖️',
    cost: 2_000_000,
    effects: [{ type: 'global_income', multiplier: 1.25 }],
    unlockLevel: 10,
  },
  {
    id: 'global_synergies',
    name: 'Synergies d\'empire',
    description: 'Tes entreprises se nourrissent mutuellement — effet de portefeuille. ×1.5 global.',
    icon: '🕸️',
    cost: 80_000_000,
    effects: [{ type: 'global_income', multiplier: 1.5 }],
    unlockLevel: 15,
    requires: ['global_holding'],
  },
]
