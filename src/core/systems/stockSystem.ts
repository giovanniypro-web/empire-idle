import type { StockState, StockDef } from '../entities'
import { STOCKS } from '../data/stocks'

const HISTORY_MAX = 20

// Random walk with mean reversion toward base price
export function updateStockPrice(
  def: StockDef,
  state: StockState,
): StockState {
  const noise = (Math.random() - 0.48) * def.volatility  // slight upward bias
  const meanReversion = (def.basePrice - state.currentPrice) / def.basePrice * 0.02
  const change = state.currentPrice * (noise + meanReversion)
  const newPrice = Math.max(def.basePrice * 0.1, state.currentPrice + change)
  const newTrend = noise > 0 ? Math.min(1, state.trend + 0.2) : Math.max(-1, state.trend - 0.2)

  const newHistory = [...state.priceHistory, Math.round(newPrice * 100) / 100]
  if (newHistory.length > HISTORY_MAX) newHistory.shift()

  return {
    ...state,
    currentPrice: Math.round(newPrice * 100) / 100,
    priceHistory: newHistory,
    trend: newTrend,
  }
}

// Apply an external shock (event)
export function applyStockShock(state: StockState, factor: number): StockState {
  const newPrice = Math.max(0.01, state.currentPrice * (1 + factor))
  const newHistory = [...state.priceHistory, Math.round(newPrice * 100) / 100]
  if (newHistory.length > HISTORY_MAX) newHistory.shift()
  return {
    ...state,
    currentPrice: Math.round(newPrice * 100) / 100,
    priceHistory: newHistory,
    trend: factor > 0 ? 1 : -1,
  }
}

// Dividend calculation
export function calculateDividend(def: StockDef, state: StockState): number {
  if (state.owned === 0 || def.dividendRate === 0) return 0
  return state.owned * state.currentPrice * def.dividendRate
}

// Total portfolio value
export function getPortfolioValue(stocks: Record<string, StockState>): number {
  return Object.values(stocks).reduce((sum, s) => sum + s.owned * s.currentPrice, 0)
}

// Initialize stock states from definitions
export function initStockStates(): Record<string, StockState> {
  const result: Record<string, StockState> = {}
  for (const def of STOCKS) {
    result[def.id] = {
      id: def.id,
      currentPrice: def.basePrice,
      owned: 0,
      priceHistory: [def.basePrice],
      trend: 0,
    }
  }
  return result
}
