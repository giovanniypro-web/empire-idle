import { statColor, statIcon, statLabel, statTooltip } from '../../core/systems/statsSystem'
import type { BusinessStats } from '../../core/entities'

interface StatBarProps {
  stat: keyof BusinessStats
  value: number
  compact?: boolean
}

export default function StatBar({ stat, value, compact = false }: StatBarProps) {
  const color = statColor(value)
  const icon  = statIcon(stat)
  const label = statLabel(stat)
  const tip   = statTooltip(stat)

  if (compact) {
    return (
      <div
        className="stat-bar-compact"
        title={tip}
        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
      >
        <span style={{ fontSize: 13 }}>{icon}</span>
        <div style={{ width: 48, height: 5, background: 'var(--bg-deep)', borderRadius: 3, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${value}%`,
              background: color,
              borderRadius: 3,
              transition: 'width .5s ease',
            }}
          />
        </div>
        <span style={{ fontSize: 11, color, fontWeight: 600, minWidth: 24 }}>
          {Math.floor(value)}
        </span>
      </div>
    )
  }

  return (
    <div style={{ marginBottom: 12 }} title={tip}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: 'var(--text-sec)' }}>
          {icon} {label}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{Math.floor(value)}/100</span>
      </div>
      <div className="prog-bar-outer" style={{ height: 8 }}>
        <div
          className="prog-bar-inner"
          style={{
            width: `${value}%`,
            background: color,
            transition: 'width .5s ease',
          }}
        />
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
        {tip}
      </div>
    </div>
  )
}
