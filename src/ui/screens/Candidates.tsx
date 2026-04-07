/**
 * Candidates Screen — Recruitment interface
 * Browse and hire from the candidate pool
 */

import { useGameStore } from '../../store/gameStore'
import { CANDIDATE_PROFILES } from '../../core/data/employees'
import { DEPARTMENTS } from '../../core/data/departments'
import { useState } from 'react'
import CandidateCard from '../components/CandidateCard'
import { formatMoney } from '../utils/format'

export default function Candidates() {
  const player = useGameStore(s => s.player)
  const office = useGameStore(s => s.office)
  const employees = useGameStore(s => s.employees)
  const hireEmployee = useGameStore(s => s.hireEmployee)
  const expandOffice = useGameStore(s => s.expandOffice)

  const [selectedDept, setSelectedDept] = useState<string>(DEPARTMENTS[0]?.id || 'operations')
  const [showDeptPicker, setShowDeptPicker] = useState(false)
  const [hirePending, setHirePending] = useState<string | null>(null)

  const activeEmployees = Object.values(employees).filter(e => e.status !== 'departed')
  const occupancy = activeEmployees.length
  const isFull = occupancy >= office.maxCapacity
  const nextOfficeLevel = office.level === 'campus' ? null : 'next level'

  const handleHireClick = (profileId: string) => {
    setHirePending(profileId)
    setShowDeptPicker(true)
  }

  const confirmHire = (profileId: string) => {
    hireEmployee(profileId, selectedDept as any)
    setHirePending(null)
    setShowDeptPicker(false)
  }

  return (
    <div>
      <div className="screen-title">👥 Recruiter</div>
      <div className="screen-subtitle">
        Parcourez les candidats et recrutez. {occupancy}/{office.maxCapacity} sièges occupés.
      </div>

      {/* Office capacity + expansion CTA */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontWeight: 700 }}>🏢 {office.level}</div>
          <div style={{ fontSize: 12, color: 'var(--text-sec)' }}>
            Capacité : {occupancy} / {office.maxCapacity}
          </div>
        </div>
        <div style={{ width: '100%', height: 12, background: 'var(--bg-sec)', borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
          <div
            style={{
              height: '100%',
              background: isFull ? 'var(--red)' : 'var(--green)',
              width: `${(occupancy / office.maxCapacity) * 100}%`,
              transition: 'width 0.3s',
            }}
          />
        </div>

        {isFull && nextOfficeLevel && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={expandOffice}
            style={{ width: '100%' }}
          >
            Expand to {nextOfficeLevel} (€{office.expansionCost.toLocaleString()})
          </button>
        )}
      </div>

      {/* Candidate pool */}
      <div className="candidate-grid">
        {CANDIDATE_PROFILES.map(profile => (
          <CandidateCard
            key={profile.id}
            profile={profile}
            onHire={() => handleHireClick(profile.id)}
            disabled={isFull}
            disabledReason={isFull ? 'Office at capacity. Expand first.' : undefined}
          />
        ))}
      </div>

      {/* Department picker modal */}
      {showDeptPicker && (
        <div className="modal-overlay" onClick={() => setShowDeptPicker(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Assign to Department</div>
              <p style={{ fontSize: 12, color: 'var(--text-sec)', marginBottom: 12 }}>
                Which department will this person work in?
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {DEPARTMENTS.map(dept => (
                  <button
                    key={dept.id}
                    className={`btn ${selectedDept === dept.id ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSelectedDept(dept.id)}
                    style={{ fontSize: 12 }}
                  >
                    {dept.icon} {dept.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => setShowDeptPicker(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => hirePending && confirmHire(hirePending)}
                style={{ flex: 1 }}
              >
                Confirm Hire
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
