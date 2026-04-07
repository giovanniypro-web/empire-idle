import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { loadMetaGame } from '../../core/engine/saveSystem'
import { PRESTIGE_UPGRADES } from '../../core/data/prestige-upgrades'
import type { PrestigeBranch, PrestigeUpgradeDef } from '../../core/entities'
import './PrestigeUpgrades.css'

const BRANCH_COLORS: Record<PrestigeBranch, string> = {
  finance: '#FFD700',
  hr: '#FF69B4',
  marketing: '#FF6347',
  leadership: '#4169E1',
  innovation: '#00FF7F',
  legacy: '#9370DB',
}

const BRANCH_NAMES: Record<PrestigeBranch, string> = {
  finance: 'Finance',
  hr: 'Ressources Humaines',
  marketing: 'Marketing',
  leadership: 'Leadership',
  innovation: 'Innovation',
  legacy: 'Héritage',
}

export default function PrestigeUpgrades() {
  const [selectedBranch, setSelectedBranch] = useState<PrestigeBranch>('finance')
  const setScreen = useGameStore(s => s.setScreen)

  // Load meta state to get current prestige points and purchased upgrades
  const metaState = loadMetaGame()
  const prestigePoints = metaState?.prestigeBank.totalPoints ?? 0
  const purchasedUpgrades = metaState?.prestigeBank.upgrades ?? {}

  const branchUpgrades = PRESTIGE_UPGRADES.filter(u => u.branch === selectedBranch)

  const canPurchase = (upgrade: PrestigeUpgradeDef): boolean => {
    const purchased = purchasedUpgrades[upgrade.id]
    const level = purchased?.level ?? 0

    // Check if already max level
    if (level >= upgrade.maxLevel) return false

    // Check prestige points
    if (prestigePoints < upgrade.cost) return false

    // Check prerequisites
    if (upgrade.prerequisiteUpgradeIds) {
      for (const prereq of upgrade.prerequisiteUpgradeIds) {
        if (!purchasedUpgrades[prereq]?.purchased) return false
      }
    }

    // Check minimum prestige resets
    if (upgrade.minimumPrestigeResets && metaState) {
      if (metaState.currentPrestigeRun < upgrade.minimumPrestigeResets) return false
    }

    return true
  }

  const getPurchaseButtonText = (upgrade: PrestigeUpgradeDef): string => {
    const purchased = purchasedUpgrades[upgrade.id]
    const level = purchased?.level ?? 0

    if (level >= upgrade.maxLevel) {
      return `Maîtrisé (${level}/${upgrade.maxLevel})`
    }

    if (level > 0) {
      return `Améliorer (${level}/${upgrade.maxLevel}) - ${upgrade.cost}✨`
    }

    return `Acheter - ${upgrade.cost}✨`
  }

  const handlePurchase = (upgrade: PrestigeUpgradeDef) => {
    // This will be handled by the prestige purchase action in gameStore
    console.log('Purchase:', upgrade.id)
    // TODO: Call prestige upgrade purchase action
  }

  return (
    <div className="prestige-upgrades">
      <div className="prestige-container">
        <h1 className="prestige-title">✨ Arbre de Prestige</h1>

        <div className="prestige-header">
          <div className="prestige-points">
            <span className="prestige-label">Points Disponibles :</span>
            <span className="prestige-amount">{Math.floor(prestigePoints)}</span>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setScreen('careerHistory')}
          >
            📊 Voir Carrières
          </button>
        </div>

        {/* Branch Selector */}
        <div className="branch-selector">
          {(Object.entries(BRANCH_NAMES) as [PrestigeBranch, string][]).map(([branch, name]) => (
            <button
              key={branch}
              className={`branch-tab ${selectedBranch === branch ? 'active' : ''}`}
              style={{
                borderColor: selectedBranch === branch ? BRANCH_COLORS[branch] : 'transparent',
              }}
              onClick={() => setSelectedBranch(branch)}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Branch Description */}
        <div className="branch-info">
          <h2 style={{ color: BRANCH_COLORS[selectedBranch], margin: 0 }}>
            Branche : {BRANCH_NAMES[selectedBranch]}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 8 }}>
            {selectedBranch === 'finance' && 'Augmentez vos revenus et maîtrisez vos coûts financiers.'}
            {selectedBranch === 'hr' && 'Renforcez votre équipe et améliorez la rétention.'}
            {selectedBranch === 'marketing' && 'Amplifiez votre marque et votre portée commerciale.'}
            {selectedBranch === 'leadership' && 'Optimisez vos départements et la synergie d\'équipe.'}
            {selectedBranch === 'innovation' && 'Accélérez vos processus et débloquez de nouvelles mécaniques.'}
            {selectedBranch === 'legacy' && 'Construisez un empire durable à travers les reset.'}
          </p>
        </div>

        {/* Upgrades Grid */}
        <div className="upgrades-grid">
          {branchUpgrades.map(upgrade => {
            const purchased = purchasedUpgrades[upgrade.id]
            const level = purchased?.level ?? 0
            const isMaxed = level >= upgrade.maxLevel
            const canAfford = canPurchase(upgrade)

            return (
              <div
                key={upgrade.id}
                className={`upgrade-card ${isMaxed ? 'maxed' : ''} ${!canAfford && level === 0 ? 'locked' : ''}`}
              >
                <div
                  className="upgrade-header"
                  style={{ borderColor: BRANCH_COLORS[selectedBranch] }}
                >
                  <div className="upgrade-icon">{upgrade.icon}</div>
                  <div className="upgrade-info">
                    <h3 className="upgrade-name">{upgrade.name}</h3>
                    {level > 0 && <span className="upgrade-level">Niveau {level}</span>}
                  </div>
                </div>

                <p className="upgrade-description">{upgrade.description}</p>

                {upgrade.prerequisiteUpgradeIds && upgrade.prerequisiteUpgradeIds.length > 0 && (
                  <div className="upgrade-prereqs">
                    <span className="prereq-label">Prérequis :</span>
                    {upgrade.prerequisiteUpgradeIds.map(prereqId => {
                      const prereq = PRESTIGE_UPGRADES.find(u => u.id === prereqId)
                      const isPurchased = purchasedUpgrades[prereqId]?.purchased
                      return (
                        <span key={prereqId} className={`prereq-badge ${isPurchased ? 'satisfied' : ''}`}>
                          {isPurchased ? '✓' : '✗'} {prereq?.name}
                        </span>
                      )
                    })}
                  </div>
                )}

                {upgrade.minimumPrestigeResets && (
                  <div className="upgrade-requirement">
                    Déverrouillé après {upgrade.minimumPrestigeResets} reset{upgrade.minimumPrestigeResets > 1 ? 's' : ''}
                  </div>
                )}

                <button
                  className={`btn btn-primary upgrade-btn ${!canAfford ? 'disabled' : ''} ${isMaxed ? 'disabled' : ''}`}
                  onClick={() => handlePurchase(upgrade)}
                  disabled={!canAfford || isMaxed}
                >
                  {getPurchaseButtonText(upgrade)}
                </button>
              </div>
            )
          })}
        </div>

        {branchUpgrades.length === 0 && (
          <div className="empty-state">
            <p>Aucune amélioration dans cette branche.</p>
          </div>
        )}
      </div>
    </div>
  )
}
