import type { MarketSegmentDef } from '../entities'

export const MARKET_SEGMENTS: MarketSegmentDef[] = [
  {
    id: 'students',
    name: 'Étudiants & Jeunes Actifs',
    description:
      "Clientèle nombreuse, budget limité, très réactive au bouche-à-oreille. Popularité > Réputation.",
    icon: '🎓',
    revenueMultiplier: 0.85,
    popularityRequirement: 0,
    reputationRequirement: 0,
    prestigeRequirement: 0,
    satisfactionVolatility: 0.6,
    highlights: [
      'Revenus réduits (−15%)',
      'Popularité très impactante',
      'Segment de démarrage idéal',
      'Satisfaction volatile',
    ],
  },
  {
    id: 'general_public',
    name: 'Grand Public',
    description:
      "Le segment le plus large. Équilibré entre popularité et satisfaction. Bon point de départ.",
    icon: '🏙️',
    revenueMultiplier: 1.0,
    popularityRequirement: 20,
    reputationRequirement: 10,
    prestigeRequirement: 0,
    satisfactionVolatility: 0.4,
    highlights: [
      'Revenus standards (×1)',
      'Accès facile (pop 20, rep 10)',
      'Segment équilibré',
    ],
  },
  {
    id: 'sme',
    name: 'PME & Artisans',
    description:
      "Petites et moyennes entreprises cherchant des prestataires fiables. Réputation cruciale, fidélité élevée.",
    icon: '🏭',
    revenueMultiplier: 1.25,
    popularityRequirement: 20,
    reputationRequirement: 35,
    prestigeRequirement: 0,
    satisfactionVolatility: 0.25,
    highlights: [
      'Revenus élevés (+25%)',
      'Réputation 35 requise',
      'Clients fidèles',
      'Satisfaction stable',
    ],
  },
  {
    id: 'enterprise',
    name: 'Grandes Entreprises',
    description:
      "Contrats importants, processus longs. Réputation et satisfaction irréprochables requises.",
    icon: '🏢',
    revenueMultiplier: 1.6,
    popularityRequirement: 30,
    reputationRequirement: 60,
    prestigeRequirement: 10,
    satisfactionVolatility: 0.15,
    highlights: [
      'Revenus très élevés (+60%)',
      'Réputation 60 + Prestige 10',
      'Très fidèles si satisfaits',
      'Long à convaincre',
    ],
  },
  {
    id: 'luxury',
    name: 'Luxe & Ultra-Premium',
    description:
      "Clientèle fortunée qui paye pour l'exclusivité. Le prestige est tout. La moindre faille en satisfaction est rédhibitoire.",
    icon: '💎',
    revenueMultiplier: 2.2,
    popularityRequirement: 50,
    reputationRequirement: 70,
    prestigeRequirement: 50,
    satisfactionVolatility: 0.8,
    highlights: [
      'Revenus exceptionnels (+120%)',
      'Prestige 50 requis',
      'Satisfaction ultra-volatile',
      'Accès aux événements premium',
    ],
  },
  {
    id: 'niche_premium',
    name: 'Niche Premium',
    description:
      "Petit marché très spécialisé, marges excellentes. Réputation de spécialiste + prestige requis.",
    icon: '🎯',
    revenueMultiplier: 1.8,
    popularityRequirement: 15,
    reputationRequirement: 55,
    prestigeRequirement: 30,
    satisfactionVolatility: 0.35,
    highlights: [
      'Revenus premium (+80%)',
      'Réputation 55 + Prestige 30',
      'Faible volume, haute marge',
      'Segment stable',
    ],
  },
]
