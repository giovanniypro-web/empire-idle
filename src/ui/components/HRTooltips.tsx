/**
 * HR Tooltips — Pedagogical explanations for HR concepts
 * Used across recruitment and management screens
 */

interface TooltipProps {
  title?: string
  children?: React.ReactNode
  className?: string
}

export function Tooltip({ title, children, className }: TooltipProps) {
  return (
    <div className={`tooltip ${className || ''}`} title={title}>
      {children}
    </div>
  )
}

// ── Concept explanations ──────────────────────────────────

export const HR_CONCEPTS = {
  salary: {
    title: "Salary (€/s)",
    text: "Cost per second to employ this person. Paid every tick. A 1€/s employee costs ~86k€ per day.",
  },
  hiringCost: {
    title: "Hiring Cost",
    text: "One-time upfront cost to recruit and onboard. Paid immediately upon hire.",
  },
  skill: {
    title: "Skill (0-100)",
    text: "Technical ability. Higher skill = higher contribution to activities. Skill can improve with training.",
  },
  motivation: {
    title: "Motivation (0-100)",
    text: "Current morale. Affects productivity directly. Decays over time if ignored. Loyalty slows decay.",
  },
  loyalty: {
    title: "Loyalty (0-100)",
    text: "Personal bond to company. Higher loyalty = slower motivation decay + lower departure risk. Set at hire, can't change.",
  },
  productivity: {
    title: "Productivity (%)",
    text: "Current output rate. Starts at 50% when hired (onboarding), ramps to 100% over 2 weeks.",
  },
  potential: {
    title: "Potential (0-100)",
    text: "Growth ceiling. Higher potential = can be trained to higher skill. Set at hire.",
  },
  risk: {
    title: "Turnover Risk (0-100)",
    text: "Likelihood to leave. Rises if motivation is low + loyalty is low. If risk > 85, they'll quit.",
  },
  contribution: {
    title: "Contribution",
    text: "Estimated % income boost from this employee. Formula: skill × motivation × productivity × status.",
  },
  costVsValue: {
    title: "Cost vs Value",
    text: "Compare salary to contribution. A 5€/s employee needs to add > 5€/s in value to break even on income.",
  },
  morale: {
    title: "Team Morale",
    text: "Average motivation across all employees. Affects overall team productivity indirectly. Low morale = higher turnover risk.",
  },
}

export function ConceptTooltip({ concept }: { concept: keyof typeof HR_CONCEPTS }) {
  const info = HR_CONCEPTS[concept]
  return (
    <Tooltip title={info.text} className="concept-tooltip">
      💡 {info.title}
    </Tooltip>
  )
}

// ── Action feedback messages ────────────────────────────

export function HireNotification(name: string, dept: string) {
  return `${name} hired for ${dept}. They'll reach full productivity in ~2 weeks (onboarding).`
}

export function FireNotification(name: string, severance: number) {
  return `${name} fired. Paid €${severance.toFixed(0)} severance. Team morale may be affected.`
}

export function PromoteNotification(name: string, newRole: string) {
  return `${name} promoted to ${newRole}. Salary increased. Skill improved.`
}

export function TrainNotification(name: string, skillGain: number) {
  return `${name} trained. Skill +${skillGain.toFixed(0)}. Motivation boosted.`
}

export function GiveRaiseNotification(name: string) {
  return `${name} given morale boost. Motivation improved. Retention risk lowered.`
}

export function DepartureNotification(name: string) {
  return `⚠️ ${name} left the company due to low morale. Team morale affected.`
}

// ── Helper functions ────────────────────────────────────

export function getContributionColor(contrib: number): string {
  if (contrib > 0.15) return 'var(--green)'
  if (contrib > 0.08) return 'var(--amber)'
  return 'var(--red)'
}

export function getRiskColor(risk: number): string {
  if (risk > 75) return 'var(--red)'
  if (risk > 50) return 'var(--amber)'
  return 'var(--green)'
}

export function getMoraleColor(morale: number): string {
  if (morale > 70) return 'var(--green)'
  if (morale > 40) return 'var(--amber)'
  return 'var(--red)'
}

export function profitabilityLabel(salary: number, contribution: number): string {
  // Contribution is ~0-0.2 (max 0.225)
  // If salary is 2€/s and contribution is 0.15, that's 15% income boost
  // Rough break-even: if contribution * avgActivityIncome > salary
  // For now, just compare visually
  const contribValue = contribution * 0.15  // scale to comparable level
  if (contribValue > salary * 0.2) return 'Profitable'
  if (contribValue > salary * 0.1) return 'Questionable'
  return 'At risk'
}
