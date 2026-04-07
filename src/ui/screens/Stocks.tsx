import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { STOCKS } from '../../core/data/stocks'
import { getPortfolioValue } from '../../core/systems/stockSystem'
import { formatMoney } from '../utils/format'

export default function Stocks() {
  const player = useGameStore(s => s.player)
  const stocks = useGameStore(s => s.stocks)
  const buyStock = useGameStore(s => s.buyStock)
  const sellStock = useGameStore(s => s.sellStock)
  const [qtys, setQtys] = useState<Record<string, string>>({})

  const portfolioValue = getPortfolioValue(stocks)

  const getQty = (id: string) => Math.max(1, parseInt(qtys[id] ?? '1') || 1)

  return (
    <div>
      <div className="screen-title">📈 Bourse</div>
      <div className="screen-subtitle">
        Investis dans des actions fictives. Risque et rendement.
        <span style={{ marginLeft: 12, color: 'var(--green)', fontWeight: 600 }}>
          Portefeuille : {formatMoney(portfolioValue)}
        </span>
      </div>

      <div className="card-grid">
        {STOCKS.map(def => {
          const state = stocks[def.id]
          if (!state) return null

          const history = state.priceHistory
          const prev = history.length > 1 ? history[history.length - 2] : state.currentPrice
          const pctChange = ((state.currentPrice - prev) / prev) * 100
          const maxH = Math.max(...history)
          const minH = Math.min(...history)
          const range = maxH - minH || 1

          const qty = getQty(def.id)
          const buyCost = state.currentPrice * qty
          const sellProceeds = state.currentPrice * Math.min(qty, state.owned)

          return (
            <div key={def.id} className="stock-card">
              <div className="stock-header">
                <span style={{ fontSize: 24 }}>{def.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{def.name}</div>
                  <div className="stock-ticker">{def.ticker}</div>
                </div>
                <div className="stock-price-block">
                  <div className="stock-price">{formatMoney(state.currentPrice)}</div>
                  <div className={pctChange >= 0 ? 'stock-trend-up' : 'stock-trend-down'}>
                    {pctChange >= 0 ? '▲' : '▼'} {Math.abs(pctChange).toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Sparkline */}
              <div className="sparkline">
                {history.slice(-16).map((price, i, arr) => {
                  const isUp = i === 0 || price >= arr[i - 1]
                  const heightPct = ((price - minH) / range) * 80 + 20
                  return (
                    <div
                      key={i}
                      className={`sparkline-bar ${isUp ? 'up' : 'down'}`}
                      style={{ height: `${heightPct}%` }}
                    />
                  )
                })}
              </div>

              <div className="stock-owned">
                Détenus : {state.owned} action{state.owned !== 1 ? 's' : ''}
                {state.owned > 0 && (
                  <span className="text-green" style={{ marginLeft: 8 }}>
                    = {formatMoney(state.owned * state.currentPrice)}
                  </span>
                )}
              </div>

              {def.dividendRate > 0 && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                  Dividende : {(def.dividendRate * 100).toFixed(1)}% / mise à jour (5s)
                </div>
              )}

              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                {def.description}
              </div>

              <div className="stock-controls">
                <input
                  type="number"
                  className="qty-input"
                  min={1}
                  value={qtys[def.id] ?? '1'}
                  onChange={e => setQtys(prev => ({ ...prev, [def.id]: e.target.value }))}
                />
                <button
                  className="btn btn-primary btn-sm"
                  disabled={player.money < buyCost}
                  onClick={() => buyStock(def.id, qty)}
                >
                  Acheter {formatMoney(buyCost)}
                </button>
                <button
                  className="btn btn-red btn-sm"
                  disabled={state.owned === 0}
                  onClick={() => sellStock(def.id, qty)}
                >
                  Vendre {state.owned > 0 ? formatMoney(sellProceeds) : ''}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
