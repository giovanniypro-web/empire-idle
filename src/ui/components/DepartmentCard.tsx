/**
 * DepartmentCard — Show department effectiveness and composition
 * Displays: name, effectiveness score, breakdown (skill/motivation/leadership), employees
 */

import type { DepartmentState, EmployeeState, DepartmentEffectivenessBreakdown } from '../../core/entities'
import { DEPARTMENTS } from '../../core/data/departments'
import { getMoraleColor } from './HRTooltips'

interface DepartmentCardProps {
  deptId: string
  deptState: DepartmentState
  employees: EmployeeState[]
  onClick?: () => void
}

export default function DepartmentCard({ deptId, deptState, employees, onClick }: DepartmentCardProps) {
  const deptDef = DEPARTMENTS.find(d => d.id === deptId)
  const effectiveness = deptState.effectiveness
  const deptEmployees = employees.filter(e => e.department === deptId && e.status !== 'departed')

  if (!deptDef) return null

  // Determine effectiveness color
  let effectivenessColor = 'var(--text-sec)'
  let effectivenessLabel = 'Unknown'
  if (effectiveness) {
    if (effectiveness.effectiveness >= 80) {
      effectivenessColor = 'var(--green)'
      effectivenessLabel = 'Strong'
    } else if (effectiveness.effectiveness >= 50) {
      effectivenessColor = 'var(--amber)'
      effectivenessLabel = 'Average'
    } else {
      effectivenessColor = 'var(--red)'
      effectivenessLabel = 'Weak'
    }
  }

  return (
    <div
      className="department-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ fontSize: 24 }}>{deptDef.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{deptDef.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {deptState.level > 0 ? `Level ${deptState.level}` : 'Not built'}
          </div>
        </div>
      </div>

      {/* Effectiveness Score */}
      {effectiveness ? (
        <>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: effectivenessColor,
              marginBottom: 8,
            }}
          >
            Effectiveness: {effectiveness.effectiveness}% ({effectivenessLabel})
          </div>

          {/* Breakdown */}
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
            <div>Avg Skill: {effectiveness.avgSkill}</div>
            <div>Avg Motivation: {effectiveness.avgMotivation}</div>
            <div>Headcount: {effectiveness.headcount}</div>
            {effectiveness.hasLead ? (
              <div style={{ color: 'var(--green)' }}>✓ Has Lead</div>
            ) : (
              <div style={{ color: 'var(--amber)' }}>✗ No Lead</div>
            )}
            {effectiveness.underleadershipPenalty > 0 && (
              <div style={{ color: 'var(--red)' }}>Penalty: -{effectiveness.underleadershipPenalty}%</div>
            )}
          </div>

          {/* Impact statement */}
          <div
            style={{
              fontSize: 11,
              padding: '8px',
              background: 'var(--bg-deep)',
              borderRadius: 4,
              color: 'var(--text-sec)',
              marginBottom: 8,
            }}
          >
            <strong>Impact:</strong> Employees in this dept provide{' '}
            <span style={{ color: effectivenessColor, fontWeight: 600 }}>
              {Math.round(effectiveness.effectiveness / 100 * 100)}%
            </span>{' '}
            of normal department-specific output boost.
          </div>

          {/* Employees list */}
          {deptEmployees.length > 0 ? (
            <div style={{ fontSize: 11 }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
                Team ({deptEmployees.length}):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {deptEmployees.map(emp => (
                  <div
                    key={emp.id}
                    style={{
                      padding: '6px 8px',
                      background: 'var(--bg-sec)',
                      borderRadius: 3,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>
                      {emp.name} ({emp.role})
                    </span>
                    <span style={{ color: getMoraleColor(emp.motivation) }}>
                      {emp.motivation.toFixed(0)}% motivation
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>No employees in this department</div>
          )}
        </>
      ) : (
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No employees. Department effectiveness scales with team quality.</div>
      )}
    </div>
  )
}
