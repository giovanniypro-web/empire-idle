/**
 * CandidateCard — Display a candidate for recruitment with comparison stats
 */

import type { CandidateProfile } from '../../core/data/employees'
import { formatMoney } from '../utils/format'
import { ConceptTooltip } from './HRTooltips'

interface CandidateCardProps {
  profile: CandidateProfile
  onHire: (profileId: string) => void
  disabled?: boolean
  disabledReason?: string
}

export default function CandidateCard({ profile, onHire, disabled, disabledReason }: CandidateCardProps) {
  return (
    <div className={`candidate-card ${disabled ? 'disabled' : ''}`}>
      {/* Header */}
      <div className="candidate-header">
        <div className="candidate-name">{profile.name}</div>
        <div className="candidate-role">{profile.role}</div>
      </div>

      {/* Description */}
      <div className="candidate-description">{profile.description}</div>

      {/* Cost row */}
      <div className="candidate-row cost-row">
        <div className="cost-item">
          <span className="cost-label">Hiring</span>
          <span className="cost-value">€{profile.hiringCost}</span>
        </div>
        <div className="cost-item">
          <span className="cost-label">Salary</span>
          <span className="cost-value">{formatMoney(profile.salary)}/s</span>
        </div>
      </div>

      {/* Stats bars */}
      <div className="candidate-stats">
        <StatBar label="Skill" value={profile.skill} />
        <StatBar label="Motivation" value={profile.motivation} />
        <StatBar label="Loyalty" value={profile.loyalty} />
        <StatBar label="Potential" value={profile.potential} />
      </div>

      {/* Tags */}
      {profile.tags.length > 0 && (
        <div className="candidate-tags">
          {profile.tags.map(tag => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Hire button */}
      <button
        className="btn btn-primary btn-block"
        onClick={() => onHire(profile.id)}
        disabled={disabled}
        title={disabledReason}
      >
        {disabled ? '🔒 Capacity full' : '✓ Hire'}
      </button>

      {disabledReason && (
        <div className="disabled-reason">{disabledReason}</div>
      )}
    </div>
  )
}

// ── Stat bar component ─────────────────────────────────

interface StatBarProps {
  label: string
  value: number
  max?: number
}

function StatBar({ label, value, max = 100 }: StatBarProps) {
  const percentage = (value / max) * 100
  const color = value >= 70 ? 'var(--green)' : value >= 40 ? 'var(--amber)' : 'var(--red)'

  return (
    <div className="stat-bar">
      <div className="stat-label">{label}</div>
      <div className="stat-bar-outer">
        <div
          className="stat-bar-inner"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <div className="stat-value">{value}</div>
    </div>
  )
}
