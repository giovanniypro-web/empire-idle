import type { GameEventDef } from '../entities'

/**
 * EVENTS V2 — Enhanced with stat_change effects and pedagogical lessons.
 *
 * Key changes from V1:
 * - All multiplier durations reduced (timed boosts less swingy)
 * - Multipliers toned down (5× → 2.5×)
 * - All choices now affect business stats (popularity/reputation/satisfaction)
 * - Each choice has a 'lesson' — entrepreneurial insight surfaced to player
 * - More complex multi-effect choices (real trade-offs)
 * - Delay increased: fires every 5-11 min (was 2-5 min)
 */
export const EVENTS: GameEventDef[] = [
  {
    id: 'viral_post',
    title: 'Contenu viral !',
    description:
      'Ton dernier article explose sur les réseaux. Le trafic est au plafond — ' +
      'mais ce pic est éphémère. Comment en tirer le maximum ?',
    icon: '🔥',
    minLevel: 2,
    weight: 8,
    choices: [
      {
        id: 'monetize',
        label: '💰 Monétise le trafic maintenant (+20s blog ×2.5)',
        effects: [
          { type: 'timed_income_mult', multiplier: 2.5, duration: 20, activityId: 'blog' },
          { type: 'stat_change', stat: 'popularity', amount: 3 },
        ],
        lesson: 'Convertir le trafic en revenu immédiat est efficace mais de courte durée.',
      },
      {
        id: 'build_audience',
        label: '📧 Collecte des abonnés (popularité +8, +300 XP)',
        effects: [
          { type: 'stat_change', stat: 'popularity', amount: 8 },
          { type: 'xp_bonus', amount: 300 },
        ],
        lesson: 'Construire une audience fidèle vaut plus qu\'un pic de revenus éphémère.',
      },
      {
        id: 'partenariat',
        label: '🤝 Signe un partenariat marque (+200€, réputation +5)',
        effects: [
          { type: 'money', amount: 200 },
          { type: 'stat_change', stat: 'reputation', amount: 5 },
        ],
        lesson: 'Monétiser sa notoriété via des partenariats crédibilise la marque.',
      },
    ],
  },

  {
    id: 'vip_client',
    title: 'Client VIP',
    description:
      'Un grand compte te contacte directement pour un projet urgent. ' +
      'Il est exigeant mais solvable. Quel deal fais-tu ?',
    icon: '🤵',
    minLevel: 4,
    weight: 6,
    choices: [
      {
        id: 'accept_standard',
        label: '✅ Accepte le projet standard (+3 000€, satisfaction +5)',
        effects: [
          { type: 'money', amount: 3000 },
          { type: 'stat_change', stat: 'satisfaction', amount: 5 },
        ],
        lesson: 'Un client satisfait revient. La satisfaction est un actif long terme.',
      },
      {
        id: 'negotiate_premium',
        label: '💬 Négocie un tarif premium (+6 000€, réputation +8, satisfaction -5)',
        effects: [
          { type: 'money', amount: 6000 },
          { type: 'stat_change', stat: 'reputation', amount: 8 },
          { type: 'stat_change', stat: 'satisfaction', amount: -5 },
        ],
        lesson: 'Facturer plus cher renforce la perception premium mais peut frustrer le client.',
      },
      {
        id: 'decline',
        label: '🚫 Décline — tu manques de capacité (réputation +3, satisfaction +10)',
        effects: [
          { type: 'stat_change', stat: 'reputation', amount: 3 },
          { type: 'stat_change', stat: 'satisfaction', amount: 10 },
        ],
        lesson: 'Savoir dire non préserve la qualité et la satisfaction de tes clients actuels.',
      },
    ],
  },

  {
    id: 'tax_audit',
    title: 'Contrôle fiscal',
    description:
      'Les impôts veulent vérifier ta comptabilité. ' +
      'Comment tu gères ça ?',
    icon: '📋',
    minLevel: 3,
    weight: 4,
    choices: [
      {
        id: 'pay_fine',
        label: '💸 Régularise sans aide (-12% cash, réputation -3)',
        effects: [
          { type: 'money_percent', percent: -12 },
          { type: 'stat_change', stat: 'reputation', amount: -3 },
        ],
        lesson: 'Ne pas anticiper sa fiscalité coûte cher en urgence.',
      },
      {
        id: 'hire_accountant',
        label: '📊 Engage un expert-comptable (-5% cash, +200 XP, réputation +5)',
        effects: [
          { type: 'money_percent', percent: -5 },
          { type: 'xp_bonus', amount: 200 },
          { type: 'stat_change', stat: 'reputation', amount: 5 },
        ],
        lesson: 'Un bon comptable est un investissement, pas une dépense.',
      },
    ],
  },

  {
    id: 'tech_crash',
    title: 'Krach tech',
    description:
      'Les valeurs technologiques s\'effondrent sur les marchés mondiaux. ' +
      'TechNova et VentureX dévissent. Quelle posture adoptes-tu ?',
    icon: '📉',
    minLevel: 5,
    weight: 3,
    choices: [
      {
        id: 'sell_quickly',
        label: '🏃 Coupe les pertes — vends tes tech stocks',
        effects: [
          { type: 'stock_change', stockId: 'technova', factor: -0.25 },
          { type: 'stat_change', stat: 'reputation', amount: -2 },
        ],
        lesson: 'Vendre sous pression limite les pertes mais détruit parfois de la valeur long terme.',
      },
      {
        id: 'hold_position',
        label: '🧘 Garde — tu crois au rebond (-25% TNV, -35% VTX à court terme)',
        effects: [
          { type: 'stock_change', stockId: 'technova', factor: -0.25 },
          { type: 'stock_change', stockId: 'venturex', factor: -0.35 },
          { type: 'xp_bonus', amount: 400 },
        ],
        lesson: 'Tenir ses positions en crise est psychologiquement difficile mais historiquement rentable.',
      },
      {
        id: 'buy_the_dip',
        label: '📈 Achète plus — profite du bas prix (-800€, potentiel de gain)',
        effects: [
          { type: 'money', amount: -800 },
          { type: 'stock_change', stockId: 'technova', factor: -0.10 },
          { type: 'xp_bonus', amount: 600 },
        ],
        lesson: 'Investir dans la panique demande du courage et une vision long terme.',
      },
    ],
  },

  {
    id: 'market_boom',
    title: 'Euphorie des marchés',
    description:
      'Les bourses mondiales sont en pleine euphorie. ' +
      'Tout monte — mais les arbres ne montent pas jusqu\'au ciel.',
    icon: '📈',
    minLevel: 5,
    weight: 5,
    choices: [
      {
        id: 'ride_momentum',
        label: '🚀 Profite du momentum (toutes actions +20%)',
        effects: [
          { type: 'stock_change', stockId: 'technova', factor: 0.20 },
          { type: 'stock_change', stockId: 'retailking', factor: 0.15 },
          { type: 'stock_change', stockId: 'mediastream', factor: 0.18 },
          { type: 'stock_change', stockId: 'fincorp', factor: 0.12 },
          { type: 'stock_change', stockId: 'venturex', factor: 0.35 },
        ],
        lesson: 'Les phases d\'euphorie créent des gains mais aussi des bulles.',
      },
      {
        id: 'take_profits',
        label: '💰 Encaisse tes plus-values (+1 500€, popularité +4)',
        effects: [
          { type: 'money', amount: 1500 },
          { type: 'stat_change', stat: 'popularity', amount: 4 },
        ],
        lesson: 'Savoir encaisser ses gains au bon moment est une compétence rare.',
      },
    ],
  },

  {
    id: 'server_outage',
    title: 'Panne serveur',
    description:
      'Ton hébergeur est en panne. Tes services numériques sont down depuis 2h. ' +
      'Les clients commencent à se plaindre sur les réseaux.',
    icon: '🔴',
    minLevel: 3,
    weight: 4,
    choices: [
      {
        id: 'migrate',
        label: '🔧 Migre vers un hébergeur premium (-2 000€, satisfaction +8)',
        effects: [
          { type: 'money', amount: -2000 },
          { type: 'stat_change', stat: 'satisfaction', amount: 8 },
        ],
        lesson: 'L\'infrastructure technique est un investissement, pas une dépense discrétionnaire.',
      },
      {
        id: 'communicate',
        label: '📢 Communique sur l\'incident (satisfaction -8, réputation +4)',
        effects: [
          { type: 'stat_change', stat: 'satisfaction', amount: -8 },
          { type: 'stat_change', stat: 'reputation', amount: 4 },
        ],
        lesson: 'La transparence en crise préserve la réputation même si elle coûte de la satisfaction.',
      },
      {
        id: 'wait_and_see',
        label: '⏳ Attends que ça revienne (revenus SaaS/app -35% pendant 45s)',
        effects: [
          { type: 'timed_income_mult', multiplier: 0.65, duration: 45, activityId: 'saas' },
          { type: 'timed_income_mult', multiplier: 0.65, duration: 45, activityId: 'app' },
          { type: 'stat_change', stat: 'satisfaction', amount: -12 },
        ],
        lesson: 'Ne pas réagir à une crise aggrave l\'impact sur la satisfaction client.',
      },
    ],
  },

  {
    id: 'aggressive_competitor',
    title: 'Concurrent agressif',
    description:
      'Un concurrent vient de lever 15M€ et attaque frontalement ton marché ' +
      'avec des prix cassés. Comment tu réagis ?',
    icon: '⚔️',
    minLevel: 6,
    weight: 5,
    choices: [
      {
        id: 'innovate',
        label: '🔬 Innove rapidement (+800 XP, réputation +6)',
        effects: [
          { type: 'xp_bonus', amount: 800 },
          { type: 'stat_change', stat: 'reputation', amount: 6 },
        ],
        lesson: 'Face à la concurrence prix, l\'innovation est souvent la meilleure réponse.',
      },
      {
        id: 'price_war',
        label: '💥 Entre dans la guerre des prix (revenus -15% pendant 40s, popularité +6)',
        effects: [
          { type: 'timed_income_mult', multiplier: 0.85, duration: 40 },
          { type: 'stat_change', stat: 'popularity', amount: 6 },
          { type: 'stat_change', stat: 'reputation', amount: -4 },
        ],
        lesson: 'Les guerres de prix gagnent des clients mais détruisent les marges et la réputation premium.',
      },
      {
        id: 'double_down_quality',
        label: '⭐ Mise sur la qualité (satisfaction +12, réputation +8, popularité -3)',
        effects: [
          { type: 'stat_change', stat: 'satisfaction', amount: 12 },
          { type: 'stat_change', stat: 'reputation', amount: 8 },
          { type: 'stat_change', stat: 'popularity', amount: -3 },
        ],
        lesson: 'Monter en gamme face à la concurrence low-cost est une stratégie de différenciation classique.',
      },
    ],
  },

  {
    id: 'press_feature',
    title: 'Article dans un grand média',
    description:
      'Un journaliste de TechCrunch France te contacte. Il veut faire un article ' +
      'sur ton parcours. C\'est une opportunité en or.',
    icon: '📰',
    minLevel: 4,
    weight: 7,
    choices: [
      {
        id: 'full_story',
        label: '🎤 Donne une interview complète (popularité +10, réputation +5)',
        effects: [
          { type: 'stat_change', stat: 'popularity', amount: 10 },
          { type: 'stat_change', stat: 'reputation', amount: 5 },
          { type: 'xp_bonus', amount: 400 },
        ],
        lesson: 'La presse gratuite est l\'un des leviers de croissance les plus puissants.',
      },
      {
        id: 'promote_launch',
        label: '🚀 Profite pour annoncer un lancement (+30s revenus ×1.8, popularité +8)',
        effects: [
          { type: 'timed_income_mult', multiplier: 1.8, duration: 30 },
          { type: 'stat_change', stat: 'popularity', amount: 8 },
        ],
        lesson: 'Synchroniser la presse avec un lancement multiplie l\'impact de chaque.',
      },
    ],
  },

  {
    id: 'angel_investor',
    title: 'Business Angel',
    description:
      'Un investisseur expérimenté propose de t\'accompagner. ' +
      'Il a des fonds, un réseau, et des conseils précieux. Mais il vouloir des garanties.',
    icon: '😇',
    minLevel: 8,
    weight: 3,
    choices: [
      {
        id: 'take_cash',
        label: '💶 Prends le chèque (+12 000€, popularité +4)',
        effects: [
          { type: 'money', amount: 12000 },
          { type: 'stat_change', stat: 'popularity', amount: 4 },
        ],
        lesson: 'Le cash est le nerf de la guerre — mais attention à la dilution.',
      },
      {
        id: 'take_mentoring',
        label: '🧠 Opte pour le mentoring (+3 000€, +2 000 XP, réputation +10)',
        effects: [
          { type: 'xp_bonus', amount: 2000 },
          { type: 'money', amount: 3000 },
          { type: 'stat_change', stat: 'reputation', amount: 10 },
        ],
        lesson: 'Le bon mentor vaut souvent plus que son chèque — accès réseau, légitimité, conseils.',
      },
      {
        id: 'decline_investor',
        label: '🤚 Décline pour garder le contrôle (+500 XP, satisfaction +5)',
        effects: [
          { type: 'xp_bonus', amount: 500 },
          { type: 'stat_change', stat: 'satisfaction', amount: 5 },
        ],
        lesson: 'L\'indépendance a un prix. Parfois, elle vaut plus que le capital.',
      },
    ],
  },

  {
    id: 'team_overload',
    title: 'Surcharge d\'équipe',
    description:
      'Tes équipes signalent un épuisement. La croissance a été trop rapide. ' +
      'Les premières démissions arrivent.',
    icon: '😰',
    minLevel: 5,
    weight: 4,
    choices: [
      {
        id: 'hire_urgency',
        label: '🚑 Recrute en urgence (-3 000€, satisfaction +12, réputation -4)',
        effects: [
          { type: 'money', amount: -3000 },
          { type: 'stat_change', stat: 'satisfaction', amount: 12 },
          { type: 'stat_change', stat: 'reputation', amount: -4 },
        ],
        lesson: 'Recruter sous pression est coûteux et réduit la qualité des embauches.',
      },
      {
        id: 'reorganize',
        label: '🔄 Réorganise les équipes (revenus -15% pendant 30s, satisfaction +15, réputation +5)',
        effects: [
          { type: 'timed_income_mult', multiplier: 0.85, duration: 30 },
          { type: 'stat_change', stat: 'satisfaction', amount: 15 },
          { type: 'stat_change', stat: 'reputation', amount: 5 },
        ],
        lesson: 'Réorganiser coûte à court terme mais crée des équipes plus performantes.',
      },
    ],
  },

  {
    id: 'viral_product',
    title: 'Produit tendance',
    description:
      'Un produit que tu vends devient un phénomène sur les réseaux sociaux. ' +
      'Les demandes affluent — tu as 24h pour surfer sur la vague.',
    icon: '🎵',
    minLevel: 3,
    weight: 6,
    choices: [
      {
        id: 'scale_fast',
        label: '⚡ Scale en urgence (+40s e-commerce ×3, satisfaction -8)',
        effects: [
          { type: 'timed_income_mult', multiplier: 3.0, duration: 40, activityId: 'ecommerce' },
          { type: 'stat_change', stat: 'satisfaction', amount: -8 },
        ],
        lesson: 'Scaler trop vite peut dégrader la qualité et la satisfaction client.',
      },
      {
        id: 'controlled_growth',
        label: '🌱 Croissance maîtrisée (+25s ×1.8, satisfaction +5, réputation +4)',
        effects: [
          { type: 'timed_income_mult', multiplier: 1.8, duration: 25, activityId: 'ecommerce' },
          { type: 'stat_change', stat: 'satisfaction', amount: 5 },
          { type: 'stat_change', stat: 'reputation', amount: 4 },
        ],
        lesson: 'La croissance durable préserve la qualité de l\'expérience client.',
      },
    ],
  },

  {
    id: 'year_end',
    title: 'Bilan de fin d\'année',
    description:
      'Tes entreprises ont surpassé les objectifs. Le moment de décider ' +
      'comment répartir les bénéfices.',
    icon: '🎉',
    minLevel: 5,
    weight: 4,
    choices: [
      {
        id: 'reinvest',
        label: '🔄 Réinvestis tout dans l\'entreprise (+8 000€, XP +1 000)',
        effects: [
          { type: 'money', amount: 8000 },
          { type: 'xp_bonus', amount: 1000 },
          { type: 'stat_change', stat: 'reputation', amount: 5 },
        ],
        lesson: 'Réinvestir les bénéfices accélère la croissance mais retarde la rentabilité perçue.',
      },
      {
        id: 'bonuses',
        label: '🎁 Distribue des primes (+80s revenus ×1.4, satisfaction +15)',
        effects: [
          { type: 'timed_income_mult', multiplier: 1.4, duration: 80 },
          { type: 'stat_change', stat: 'satisfaction', amount: 15 },
          { type: 'stat_change', stat: 'popularity', amount: 4 },
        ],
        lesson: 'Valoriser ses équipes booste la productivité et l\'attractivité de l\'entreprise.',
      },
    ],
  },
]
