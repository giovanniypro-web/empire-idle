export function formatMoney(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}Md€`
  if (value >= 1_000_000)     return `${(value / 1_000_000).toFixed(2)}M€`
  if (value >= 10_000)        return `${(value / 1_000).toFixed(1)}k€`
  if (value >= 1_000)         return `${(value / 1_000).toFixed(2)}k€`
  return `${value.toFixed(value < 10 ? 2 : 0)}€`
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000)     return `${(value / 1_000).toFixed(1)}k`
  return `${Math.floor(value)}`
}

export function formatDuration(seconds: number): string {
  if (seconds < 60)   return `${seconds.toFixed(1)}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
}

export function formatTime(seconds: number): string {
  if (seconds < 60)   return `${Math.floor(seconds)}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}min`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h${m > 0 ? m + 'm' : ''}`
}
