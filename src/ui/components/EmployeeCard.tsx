/**
 * EmployeeCard — Display a single employee with detailed stats and HR actions
 * Shows: name, role, department, all stats, productivity, risk, contribution
 * Actions: fire, promote, train, give raise
 */

import type { EmployeeState } from '../../core/entities'
import { useGameStore } from '../../store/gameStore'
import { calculateEmployeeContribution } from '../../core/systems/hrSystem'
import { BALANCE } from '../../core/data/balancing'
import { formatMoney } from '../utils/format'
import {
  getMoraleColor,
  getRiskColor,
  getContributionColor,
  profitabilityLabel
} from './HRTooltips'

interface EmployeeCardProps {
  employee: EmployeeState
}

export default function EmployeeCard({ employee }: EmployeeCardProps) {
  const player = useGameStore(s => s.player)
  const fireEmployee = useGameStore(s => s.fireEmployee)
  const promoteEmployeeAction = useGameStore(s => s.promoteEmployeeAction)
  const trainEmployeeAction = useGameStore(s => s.trainEmployeeAction)
  const giveRaise = useGameStore(s => s.giveRaise)

  // Calculate costs and values
  const promotionCost = employee.salary * BALANCE.PROMOTION_COST_MULTIPLIER
  const severanceCost = employee.salary * BALANCE.SEVERANCE_COST_MULTIPLIER
  const trainingCost = BALANCE.TRAINING_COST_PER_SKILL_POINT * 10  // e.g., 10 skill points
  const raisesCost = BALANCE.GIVE_RAISE_COST

  const contribution = calculateEmployeeContribution(employee)
  const contribValue = contribution * 0.15  // scale to comparable level
  const profitability = profitabilityLabel(employee.salary, contribution)

  // Status badge
  let statusBadge = ''
  let statusColor = 'var(--text-sec)'
  if (employee.status === 'onboarding') {
    statusBadge = `Onboarding (${employee.onboardingProgress.toFixed(0)}%)`
    statusColor = 'var(--amber)'
  } else if (employee.status === 'notice') {
    statusBadge = 'Notice Period'
    statusColor = 'var(--red)'
  } else if (employee.status === 'departed') {
    statusBadge = 'Departed'
    statusColor = 'var(--red)'
  } else {
    statusBadge = 'Active'
    statusColor = 'var(--green)'
  }

  // Check action availability
  const canPromote = employee.role !== 'lead' && player.money >= promotionCost && employee.status === 'active'
  const canFire = employee.status !== 'departed' && player.money >= severanceCost
  const canTrain = employee.skill < 100 && player.money >= trainingCost && employee.status === 'active'
  const canGiveRaise = employee.motivation < 100 && player.money >= raisesCost && employee.status === 'active'

  return (
    <div className="employee-card">
      {/* Header */}
      <div className="employee-header">
        <div style={{ flex: 1 }}>
          <div className="employee-name">{employee.name}</div>
          <div className="employee-role">{employee.role} · {employee.department}</div>
        </div>
        <div className="employee-status" style={{ color: statusColor, fontSize: 11, fontWeight: 600 }}>
          {statusBadge}
        </div>
      </div>

      {/* Salary and productivity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12, fontSize: 12 }}>
        <div>
          <div style={{ color: 'var(--text-sec)' }}>Salary</div>
          <div style={{ fontWeight: 600 }}>{formatMoney(employee.salary)}/s</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-sec)' }}>Productivity</div>
          <div style={{ fontWeight: 600 }}>{employee.productivity.toFixed(0)}%</div>
        </div>
      </div>

      {/* Stats bars */}
      <div className="employee-stats" style={{ marginBottom: 12 }}>
        <StatBar label="Skill" value={employee.skill} />
        <StatBar label="Motivation" value={employee.motivation} />
        <StatBar label="Loyalty" value={employee.loyalty} />
        <StatBar label="Potential" value={employee.potential} />
      </div>

      {/* Risk and Contribution metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-sec)', marginBottom: 4 }}>Turnover Risk</div>
          <div style={{
            height: 6,
            background: 'var(--bg-sec)',
            borderRadius: 3,
            overflow: 'hidden',
            marginBottom: 4,
          }}>
            <div
              style={{
                height: '100%',
                width: `${employee.riskOfLeaving}%`,
                backgroundColor: getRiskColor(employee.riskOfLeaving),
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: getRiskColor(employee.riskOfLeaving), fontWeight: 600 }}>
            {employee.riskOfLeaving.toFixed(0)}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-sec)', marginBottom: 4 }}>Contribution</div>
          <div style={{
            height: 6,
            background: 'var(--bg-sec)',
            borderRadius: 3,
            overflow: 'hidden',
            marginBottom: 4,
          }}>
            <div
              style={{
                height: '100%',
                width: `${(contribution / 1.5) * 100}%`,  // max is 1.5
                backgroundColor: getContributionColor(contribution),
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: getContributionColor(contribution), fontWeight: 600 }}>
            {(contribution * 100).toFixed(0)}% output
          </div>
        </div>
      </div>

      {/* Profitability */}
      <div style={{
        fontSize: 11,
        padding: '8px',
        background: 'var(--bg-sec)',
        borderRadius: 4,
        marginBottom: 12,
        color: 'var(--text-sec)',
      }}>
        {profitability} · {contribValue > employee.salary * 0.2 ? '✓ Pays for themselves' : 'Investment mode'}
      </div>

      {/* Phase 3: Training impact (pedagogy) */}
      {employee.skill < 100 && (
        <div style={{
          fontSize: 10,
          padding: '6px',
          background: 'rgba(100, 150, 255, 0.1)',
          borderRadius: 3,
          marginBottom: 12,
          borderLeft: '2px solid var(--blue)',
          color: 'var(--text-sec)',
        }}>
          <div style={{ marginBottom: 4 }}>💡 <strong>Training Impact:</strong></div>
          <div>Chaque point de compétence augmente le revenu des activités jusqu'à +20%.</div>
          <div style={{ marginTop: 3, fontSize: 9 }}>
            Skill: {employee.skill}/100 → {canTrain && `Coûte ${formatMoney(trainingCost)}`}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
        {/* Promote */}
        <button
          className="btn btn-sm"
          onClick={() => promoteEmployeeAction(employee.id)}
          disabled={!canPromote}
          title={!canPromote
            ? canPromote === false && employee.role === 'lead' ? 'Already at max role'
            : `Need €${promotionCost.toFixed(0)} to promote`
            : `Promote to next level (€${promotionCost.toFixed(0)})`
          }
          style={{
            background: canPromote ? 'var(--green)' : 'var(--bg-sec)',
            color: canPromote ? 'white' : 'var(--text-sec)',
            cursor: canPromote ? 'pointer' : 'not-allowed',
            opacity: canPromote ? 1 : 0.5,
            fontSize: 11,
            padding: '6px 8px',
            border: 'none',
            borderRadius: 4,
          }}
        >
          📈 Promote
        </button>

        {/* Train */}
        <button
          className="btn btn-sm"
          onClick={() => trainEmployeeAction(employee.id, trainingCost)}
          disabled={!canTrain}
          title={!canTrain
            ? employee.skill >= 100 ? 'Skill already maxed'
            : `Need €${trainingCost.toFixed(0)} to train`
            : `Train (+10 skill, €${trainingCost.toFixed(0)})`
          }
          style={{
            background: canTrain ? 'var(--amber)' : 'var(--bg-sec)',
            color: canTrain ? 'white' : 'var(--text-sec)',
            cursor: canTrain ? 'pointer' : 'not-allowed',
            opacity: canTrain ? 1 : 0.5,
            fontSize: 11,
            padding: '6px 8px',
            border: 'none',
            borderRadius: 4,
          }}
        >
          📚 Train
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {/* Give Raise */}
        <button
          className="btn btn-sm"
          onClick={() => giveRaise(employee.id)}
          disabled={!canGiveRaise}
          title={!canGiveRaise
            ? employee.motivation >= 100 ? 'Motivation already maxed'
            : `Need €${raisesCost.toFixed(0)} to boost morale`
            : `Boost morale (+${BALANCE.GIVE_RAISE_MOTIVATION_BOOST}, €${raisesCost.toFixed(0)})`
          }
          style={{
            background: canGiveRaise ? 'var(--blue)' : 'var(--bg-sec)',
            color: canGiveRaise ? 'white' : 'var(--text-sec)',
            cursor: canGiveRaise ? 'pointer' : 'not-allowed',
            opacity: canGiveRaise ? 1 : 0.5,
            fontSize: 11,
            padding: '6px 8px',
            border: 'none',
            borderRadius: 4,
          }}
        >
          💪 Morale
        </button>

        {/* Fire */}
        <button
          className="btn btn-sm"
          onClick={() => fireEmployee(employee.id)}
          disabled={!canFire}
          title={!canFire
            ? `Need €${severanceCost.toFixed(0)} for severance`
            : `Fire with severance (€${severanceCost.toFixed(0)})`
          }
          style={{
            background: canFire ? 'var(--red)' : 'var(--bg-sec)',
            color: canFire ? 'white' : 'var(--text-sec)',
            cursor: canFire ? 'pointer' : 'not-allowed',
            opacity: canFire ? 1 : 0.5,
            fontSize: 11,
            padding: '6px 8px',
            border: 'none',
            borderRadius: 4,
          }}
        >
          ✕ Fire
        </button>
      </div>
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
      <div className="stat-value">{value.toFixed(0)}</div>
    </div>
  )
}
