import { useGameStore } from '../../store/gameStore'
import EmployeeCard from '../components/EmployeeCard'
import TeamSummary from '../components/TeamSummary'

export default function Employees() {
  const employees = useGameStore(s => s.employees)
  const office = useGameStore(s => s.office)

  const activeEmployees = Object.values(employees).filter(e => e.status !== 'departed')

  return (
    <div>
      <div className="screen-title">👥 Équipe</div>
      <div className="screen-subtitle">
        Manage your team and make HR decisions. {activeEmployees.length} employee{activeEmployees.length !== 1 ? 's' : ''} active.
      </div>

      {/* Team summary metrics */}
      <TeamSummary employees={employees} office={office} />

      {/* Employee cards grid */}
      {activeEmployees.length > 0 ? (
        <div className="employee-grid">
          {activeEmployees.map(emp => (
            <EmployeeCard key={emp.id} employee={emp} />
          ))}
        </div>
      ) : (
        <div className="card">
          <div style={{ fontSize: 13, color: 'var(--text-sec)', textAlign: 'center', padding: '20px' }}>
            👤 No employees yet. Go to the Recruiter to hire your first team members.
          </div>
        </div>
      )}
    </div>
  )
}
