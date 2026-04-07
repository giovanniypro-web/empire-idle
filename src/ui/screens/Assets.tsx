import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { ASSETS } from '../../core/data/assets'
import { formatMoney } from '../utils/format'
import type { AssetCategoryId } from '../../core/entities'

const CATEGORY_LABELS: Record<AssetCategoryId, string> = {
  cars: '🚗 Véhicules',
  art: '🎨 Art & Culture',
  watches: '⌚ Montres',
  real_estate: '🏠 Immobilier',
  offices: '🏢 Bureaux',
}

const CATEGORIES: AssetCategoryId[] = ['cars', 'art', 'watches', 'real_estate', 'offices']

export function Assets() {
  const player = useGameStore(s => s.player)
  const stats = useGameStore(s => s.stats)
  const ownedAssets = useGameStore(s => s.ownedAssets)
  const buyAsset = useGameStore(s => s.buyAsset)
  const [activeCategory, setActiveCategory] = useState<AssetCategoryId>('cars')

  const totalPrestige = ASSETS.reduce((sum, a) => {
    const qty = ownedAssets[a.id] ?? 0
    return sum + a.prestigeGain * qty
  }, 0)

  const totalPassive = ASSETS.reduce((sum, a) => {
    const qty = ownedAssets[a.id] ?? 0
    return sum + a.passiveIncome * qty
  }, 0)

  const totalMaintenance = ASSETS.reduce((sum, a) => {
    const qty = ownedAssets[a.id] ?? 0
    return sum + a.maintenanceCost * qty
  }, 0)

  const totalOwned = Object.values(ownedAssets).reduce((s, v) => s + v, 0)

  return (
    <div className="screen">
      <div className="screen-header">
        <h2>Patrimoine</h2>
        <p className="screen-subtitle">
          Construisez votre patrimoine personnel. Chaque actif renforce votre prestige et votre empire.
        </p>
      </div>

      {/* Patrimoine summary */}
      <div className="assets-summary">
        <div className="asset-stat">
          <span>Actifs possédés</span>
          <strong>{totalOwned}</strong>
        </div>
        <div className="asset-stat">
          <span>Prestige total</span>
          <strong>✨ +{totalPrestige.toFixed(1)}</strong>
        </div>
        <div className="asset-stat">
          <span>Revenus passifs</span>
          <strong className="income">+{formatMoney(totalPassive)}/s</strong>
        </div>
        <div className="asset-stat">
          <span>Maintenance</span>
          <strong className="cost">−{formatMoney(totalMaintenance)}/s</strong>
        </div>
      </div>

      {/* Category tabs */}
      <div className="category-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Asset list */}
      <div className="asset-list">
        {ASSETS.filter(a => a.category === activeCategory).map(asset => {
          const qty = ownedAssets[asset.id] ?? 0
          const owned = qty > 0
          const levelLocked = asset.levelUnlockRequired > player.level
          const prestigeLocked = asset.prestigeUnlockRequired > stats.prestige
          const locked = levelLocked || prestigeLocked
          const canAfford = player.money >= asset.price
          const isMaxed = asset.unique && owned

          return (
            <div
              key={asset.id}
              className={`asset-card ${owned ? 'owned' : ''} ${locked ? 'locked' : ''}`}
            >
              <div className="asset-header">
                <span className="asset-icon">{asset.icon}</span>
                <div className="asset-info">
                  <strong>{asset.name}</strong>
                  {owned && !asset.unique && (
                    <span className="asset-qty">×{qty}</span>
                  )}
                  {owned && asset.unique && (
                    <span className="asset-owned-badge">✅ Possédé</span>
                  )}
                </div>
                <div className="asset-price-block">
                  <span className="asset-price">{formatMoney(asset.price)}</span>
                  {asset.maintenanceCost > 0 && (
                    <span className="asset-maint">−{formatMoney(asset.maintenanceCost)}/s</span>
                  )}
                </div>
              </div>

              <p className="asset-desc">{asset.description}</p>

              {/* Effects */}
              <div className="asset-effects">
                {asset.prestigeGain > 0 && (
                  <span className="effect-tag">✨ +{asset.prestigeGain} prestige</span>
                )}
                {asset.reputationGain > 0 && (
                  <span className="effect-tag">🏆 +{asset.reputationGain} réputation</span>
                )}
                {asset.popularityGain > 0 && (
                  <span className="effect-tag">⚡ +{asset.popularityGain} popularité</span>
                )}
                {asset.satisfactionGain > 0 && (
                  <span className="effect-tag">😊 +{asset.satisfactionGain} satisfaction</span>
                )}
                {asset.passiveIncome > 0 && (
                  <span className="effect-tag income">+{formatMoney(asset.passiveIncome)}/s</span>
                )}
                {asset.allIncomeMult > 0 && (
                  <span className="effect-tag">📈 +{(asset.allIncomeMult * 100).toFixed(0)}% revenus</span>
                )}
                {asset.salaryReduction > 0 && (
                  <span className="effect-tag">💼 −{(asset.salaryReduction * 100).toFixed(0)}% salaires</span>
                )}
              </div>

              {/* Lock info */}
              {locked && (
                <div className="asset-lock-reason">
                  {levelLocked && `🔒 Niveau ${asset.levelUnlockRequired} requis`}
                  {prestigeLocked && !levelLocked && `🔒 ${asset.prestigeUnlockRequired} prestige requis`}
                </div>
              )}

              {/* Buy button */}
              {!locked && !isMaxed && (
                <button
                  className={`btn-buy-asset ${canAfford ? '' : 'disabled'}`}
                  disabled={!canAfford}
                  onClick={() => buyAsset(asset.id)}
                >
                  {formatMoney(asset.price)} — Acquérir
                </button>
              )}
              {isMaxed && (
                <div className="asset-maxed">✅ Déjà dans votre patrimoine</div>
              )}
            </div>
          )
        })}
      </div>

      <div className="pedagogy-box">
        <strong>💡 Le patrimoine dans la vraie vie</strong>
        <p>
          Les grands entrepreneurs ne se contentent pas de revenus d'activité — ils construisent un
          patrimoine. L'immobilier génère des revenus passifs, les actifs de prestige renforcent
          votre position, les bureaux améliorent la productivité. Chaque actif est une décision
          d'allocation de capital : est-ce que ce montant travaille mieux ici ou dans mon activité ?
        </p>
      </div>
    </div>
  )
}
