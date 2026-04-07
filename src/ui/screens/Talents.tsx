import { useGameStore } from '../../store/gameStore'
import { TALENTS } from '../../core/data/talents'
import { canPurchaseTalent, getTalentPointsSpent } from '../../core/systems/talentSystem'
import { BALANCE } from '../../core/data/balancing'
import type { TalentBranchId } from '../../core/entities'

const BRANCH_LABELS: Record<TalentBranchId, { name: string; icon: string; description: string }> = {
  leadership: {
    name: 'Leadership',
    icon: '👑',
    description: 'Revenus globaux, satisfaction d\'équipe, XP',
  },
  finance_talent: {
    name: 'Finance',
    icon: '📈',
    description: 'Réduction des coûts, protection événements, revenus passifs',
  },
  marketing_talent: {
    name: 'Marketing',
    icon: '📣',
    description: 'Popularité, visibilité, revenus consommateurs',
  },
  innovation_talent: {
    name: 'Innovation',
    icon: '🔬',
    description: 'XP, efficacité upgrades, vitesse d\'activité',
  },
  negotiation: {
    name: 'Négociation',
    icon: '🤝',
    description: 'Coûts activités & employés, revenus accords',
  },
  resilience: {
    name: 'Résilience',
    icon: '🛡️',
    description: 'Protection événements négatifs, stabilité des stats',
  },
}

const BRANCHES: TalentBranchId[] = [
  'leadership', 'finance_talent', 'marketing_talent',
  'innovation_talent', 'negotiation', 'resilience',
]

export function Talents() {
  const player = useGameStore(s => s.player)
  const talents = useGameStore(s => s.talents)
  const purchaseTalent = useGameStore(s => s.purchaseTalent)

  const pointsSpent = getTalentPointsSpent(talents)
  const totalPointsEarned = player.level // 1 per level
  const availablePoints = player.talentPoints

  return (
    <div className="screen">
      <div className="screen-header">
        <h2>Arbre de talents CEO</h2>
        <p className="screen-subtitle">
          Chaque niveau vous octroie {BALANCE.TALENT_POINTS_PER_LEVEL} point de talent.
          Choisissez vos spécialités de dirigeant.
        </p>
      </div>

      {/* Points header */}
      <div className="talent-points-bar">
        <div className="points-available">
          <span className="points-icon">⭐</span>
          <strong>{availablePoints}</strong>
          <span>points disponibles</span>
        </div>
        <div className="points-spent">
          <span>{pointsSpent} dépensés</span>
          <span>·</span>
          <span>{totalPointsEarned} gagnés (niv. {player.level})</span>
        </div>
      </div>

      {/* Branches */}
      <div className="talent-branches">
        {BRANCHES.map(branchId => {
          const branchTalents = TALENTS.filter(t => t.branch === branchId)
          const branchInfo = BRANCH_LABELS[branchId]

          return (
            <div key={branchId} className="talent-branch">
              <div className="branch-header">
                <span className="branch-icon">{branchInfo.icon}</span>
                <div>
                  <strong>{branchInfo.name}</strong>
                  <p>{branchInfo.description}</p>
                </div>
              </div>

              <div className="branch-talents">
                {branchTalents.map((talent, idx) => {
                  const owned = talents[talent.id] === true
                  const canBuy = canPurchaseTalent(talent.id, talents, availablePoints)
                  const prereqOwned = !talent.requires || talents[talent.requires] === true
                  const notEnoughPoints = availablePoints < talent.cost
                  const tierLabel = `Tier ${idx + 1}`

                  return (
                    <div
                      key={talent.id}
                      className={`talent-node ${owned ? 'owned' : ''} ${canBuy ? 'available' : ''} ${!prereqOwned ? 'locked' : ''}`}
                    >
                      {/* Connector line */}
                      {idx > 0 && (
                        <div className={`branch-connector ${prereqOwned ? 'active' : ''}`} />
                      )}

                      <div className="talent-card">
                        <div className="talent-card-header">
                          <span className="talent-icon">{talent.icon}</span>
                          <div>
                            <strong>{talent.name}</strong>
                            <span className="talent-tier">{tierLabel}</span>
                          </div>
                          <span className={`talent-cost ${notEnoughPoints && !owned ? 'unaffordable' : ''}`}>
                            {owned ? '✅' : `⭐ ${talent.cost}`}
                          </span>
                        </div>

                        <p className="talent-desc">{talent.description}</p>

                        {!owned && !prereqOwned && (
                          <div className="talent-lock">
                            🔒 Débloquez d'abord le talent précédent
                          </div>
                        )}

                        {!owned && prereqOwned && (
                          <button
                            className={`btn-talent ${canBuy ? '' : 'disabled'}`}
                            disabled={!canBuy}
                            onClick={() => purchaseTalent(talent.id)}
                          >
                            {notEnoughPoints
                              ? `Manque ${talent.cost - availablePoints} pt${talent.cost - availablePoints > 1 ? 's' : ''}`
                              : `Débloquer (⭐ ${talent.cost})`}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="pedagogy-box">
        <strong>💡 Les talents d'un CEO</strong>
        <p>
          Un dirigeant efficace développe des compétences clés au fil du temps. En affaires, on
          distingue les compétences techniques (finance, marketing) des compétences transversales
          (leadership, résilience, négociation). Les meilleurs PDG combinent les deux — c'est ce
          que cet arbre de talents modélise.
        </p>
      </div>
    </div>
  )
}
