import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { MARKET_LISTINGS, ITEMS } from '../../core/data/items'
import { formatMoney } from '../utils/format'

export default function Market() {
  const player = useGameStore(s => s.player)
  const marketListings = useGameStore(s => s.marketListings)
  const inventory = useGameStore(s => s.inventory)
  const buyMarketItem = useGameStore(s => s.buyMarketItem)
  const sellInventoryItem = useGameStore(s => s.sellInventoryItem)
  const [sellQtys, setSellQtys] = useState<Record<string, number>>({})

  const itemMap = Object.fromEntries(ITEMS.map(i => [i.id, i]))

  return (
    <div>
      <div className="screen-title">🛒 Marché</div>
      <div className="screen-subtitle">
        Achète des équipements pour booster tes revenus. Les prix fluctuent.
      </div>

      <div className="card-grid">
        {MARKET_LISTINGS.map(listing => {
          const mState = marketListings[listing.id]
          const itemDef = itemMap[listing.itemId]
          if (!itemDef || !mState) return null

          const owned = inventory[listing.itemId] ?? 0
          const canBuy = player.money >= mState.currentBuyPrice && owned < itemDef.maxStack
          const canSell = owned > 0

          const effectsDesc = itemDef.effects.map(e => {
            if (e.type === 'activity_income') return `${e.activityId} ×${e.multiplier}`
            if (e.type === 'global_income') return `Revenus globaux ×${e.multiplier}`
            if (e.type === 'global_xp') return `XP ×${e.multiplier}`
            return ''
          }).filter(Boolean).join(' · ')

          const trendArrow = mState.trend > 0.1 ? '▲' : mState.trend < -0.1 ? '▼' : '─'
          const trendColor = mState.trend > 0.1 ? 'var(--green)' : mState.trend < -0.1 ? 'var(--red)' : 'var(--text-muted)'

          return (
            <div key={listing.id} className="market-item-card">
              <div className="market-item-top">
                <span className="market-icon">{itemDef.icon}</span>
                <div className="market-info">
                  <div className="market-name">{itemDef.name}</div>
                  <div className="market-desc">{itemDef.description}</div>
                  <div style={{ fontSize: 11, color: 'var(--blue)', marginTop: 3 }}>
                    {effectsDesc}
                  </div>
                </div>
                <div className="market-owned">{owned > 0 ? `×${owned}` : '-'}</div>
              </div>

              <div className="market-prices">
                <span className="price-buy">
                  Achat : {formatMoney(mState.currentBuyPrice)}
                  <span style={{ color: trendColor, marginLeft: 4 }}>{trendArrow}</span>
                </span>
                <span className="price-sell">
                  Vente : {formatMoney(mState.currentSellPrice)}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={!canBuy}
                  onClick={() => buyMarketItem(listing.id, 1)}
                >
                  {owned >= itemDef.maxStack ? 'Stock max' : 'Acheter'}
                </button>

                {canSell && (
                  <button
                    className="btn btn-red btn-sm"
                    onClick={() => sellInventoryItem(listing.itemId, 1)}
                  >
                    Vendre {formatMoney(mState.currentSellPrice)}
                  </button>
                )}

                {itemDef.stackable && owned > 0 && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => sellInventoryItem(listing.itemId, owned)}
                  >
                    Tout vendre
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
