/**
 * TeamSummary — Aggregate team metrics and health overview
 * Shows: payroll, team morale, capacity, average turnover risk
 */

import type { EmployeeState, OfficeState } from '../../core/entities'
import { calculateTotalSalary, calculateTotalEmployeeContribution } from '../../core/systems/hrSystem'
import { formatMoney } from '../utils/format'
import { getMoraleColor, getRiskColor } from './HRTooltips'

interface TeamSummaryProps {
  employees: Record<string, EmployeeState>
  office: OfficeState
}

export default function TeamSummary({ employees, office }: TeamSummaryProps) {
  const activeEmployees = Object.values(employees).filter(e => e.status !== 'departed')
  const occupancy = activeEmployees.length
  const totalPayroll = calculateTotalSalary(employees)
  const totalContribution = calculateTotalEmployeeContribution(employees)

  // Calculate averages
  const avgMotivation = activeEmployees.length > 0
    ? activeEmployees.reduce((sum, e) => sum + e.motivation, 0) / activeEmployees.length
    : 0

  const avgLoyalty = activeEmployees.length > 0
    ? activeEmployees.reduce((sum, e) => sum + e.loyalty, 0) / activeEmployees.length
    : 0

  const avgRisk = activeEmployees.length > 0
    ? activeEmployees.reduce((sum, e) => sum + e.riskOfLeaving, 0) / activeEmployees.length
    : 0

  // Identify at-risk employees
  const atRiskCount = activeEmployees.filter(e => e.riskOfLeaving > 75).length
  const onboardingCount = activeEmployees.filter(e => e.status === 'onboarding').length

  return (
    <div className="team-summary card" style={{ marginBottom: 16 }}>
      {/* Header */}
      <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 13 }}>👥 Team Health</div>

      {/* Top metrics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        {/* Payroll */}
        <div style={{ padding: '8px', background: 'var(--bg-sec)', borderRadius: 4 }}>
          <div style={{ fontSize: 10, color: 'var(--text-sec)', marginBottom: 4 }}>Payroll</div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{formatMoney(totalPayroll)}/s</div>
        </div>

        {/* Capacity */}
        <div style={{ padding: '8px', background: 'var(--bg-sec)', borderRadius: 4 }}>
          <div style={{ fontSize: 10, color: 'var(--text-sec)', marginBottom: 4 }}>Capacity</div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>
            {occupancy}/{office.maxCapacity}
            {occupancy === office.maxCapacity && (
              <span style={{ color: 'var(--red)', marginLeft: 4 }}>🔴</span>
            )}
          </div>
        </div>

        {/* Morale */}
        <div style={{ padding: '8px', background: 'var(--bg-sec)', borderRadius: 4 }}>
          <div style={{ fontSize: 10, color: 'var(--text-sec)', marginBottom: 4 }}>Avg Motivation</div>
          <div
            style={{
              fontWeight: 600,
              fontSize: 13,
              color: getMoraleColor(avgMotivation),
            }}
          >
            {avgMotivation.toFixed(0)}%
          </div>
        </div>

        {/* Turnover Risk */}
        <div style={{ padding: '8px', background: 'var(--bg-sec)', borderRadius: 4 }}>
          <div style={{ fontSize: 10, color: 'var(--text-sec)', marginBottom: 4 }}>Avg Risk</div>
          <div
            style={{
              fontWeight: 600,
              fontSize: 13,
              color: getRiskColor(avgRisk),
            }}
          >
            {avgRisk.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Status indicators */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
        {onboardingCount > 0 && (
          <div style={{ color: 'var(--amber)', fontWeight: 600 }}>
            ⏳ {onboardingCount} onboarding
          </div>
        )}

        {atRiskCount > 0 && (
          <div style={{ color: 'var(--red)', fontWeight: 600 }}>
            ⚠️ {atRiskCount} at risk
          </div>
        )}

        {atRiskCount === 0 && onboardingCount === 0 && occupancy > 0 && (
          <div style={{ color: 'var(--green)', fontWeight: 600, gridColumn: '1 / -1' }}>
            ✓ Team stable
          </div>
        )}

        {occupancy === 0 && (
          <div style={{ color: 'var(--text-sec)', gridColumn: '1 / -1' }}>
            No employees yet. Hire from Recruiter.
          </div>
        )}
      </div>

      {/* Loyalty and Contribution info */}
      <div style={{
        marginTop: 12,
        paddingTop: 12,
        borderTop: '1px solid var(--border)',
        fontSize: 11,
        color: 'var(--text-sec)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
      }}>
        <div>
          <span style={{ fontWeight: 600 }}>Avg Loyalty:</span> {avgLoyalty.toFixed(0)}%
        </div>
        <div>
          <span style={{ fontWeight: 600 }}>Total Contribution:</span> {(totalContribution * 100).toFixed(0)}% output
        </div>
      </div>
    </div>
  )
}
