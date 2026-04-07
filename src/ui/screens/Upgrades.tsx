import { useGameStore } from '../../store/gameStore'
import { UPGRADES } from '../../core/data/upgrades'
import { ACTIVITIES } from '../../core/data/activities'
import { formatMoney } from '../utils/format'

export default function Upgrades() {
  const player = useGameStore(s => s.player)
  const upgrades = useGameStore(s => s.upgrades)
  const buyUpgrade = useGameStore(s => s.buyUpgrade)

  const activityMap = Object.fromEntries(ACTIVITIES.map(a => [a.id, a]))

  const getStatus = (id: string) => {
    const def = UPGRADES.find(u => u.id === id)!
    const state = upgrades[id]
    if (state?.purchased) return 'purchased'
    if (def.unlockLevel > player.level) return 'locked'
    if (def.requires?.some(req => !upgrades[req]?.purchased)) return 'requires-missing'
    return 'available'
  }

  // Sort: available first, then requires-missing, then locked, then purchased
  const sorted = [...UPGRADES].sort((a, b) => {
    const order = { available: 0, 'requires-missing': 1, locked: 2, purchased: 3 }
    return order[getStatus(a.id)] - order[getStatus(b.id)]
  })

  return (
    <div>
      <div className="screen-title">🔬 Améliorations</div>
      <div className="screen-subtitle">
        Des investissements permanents qui multiplient tes revenus.
      </div>

      <div className="card-grid">
        {sorted.map(def => {
          const status = getStatus(def.id)
          const canAfford = player.money >= def.cost

          const effectsDesc = def.effects.map(e => {
            if (e.type === 'activity_income') {
              const act = activityMap[e.activityId]
              return `${act?.name ?? e.activityId} revenus ×${e.multiplier}`
            }
            if (e.type === 'activity_speed') {
              const act = activityMap[e.activityId]
              return `${act?.name ?? e.activityId} vitesse ×${e.multiplier}`
            }
            if (e.type === 'global_income') return `Tous revenus ×${e.multiplier}`
            if (e.type === 'global_xp') return `XP ×${e.multiplier}`
            return ''
          }).filter(Boolean).join(' · ')

          return (
            <div key={def.id} className={`upg-card ${status}`}>
              <div className="upg-icon">{def.icon}</div>
              <div className="upg-info">
                <div className="upg-name">{def.name}</div>
                <div className="upg-desc">{def.description}</div>
                <div className="upg-desc" style={{ marginTop: 4, color: 'var(--blue)', fontSize: 11 }}>
                  {effectsDesc}
                </div>
                {status === 'purchased' && (
                  <div className="upg-purchased">✓ Actif</div>
                )}
                {status === 'locked' && (
                  <div style={{ fontSize: 12, color: 'var(--amber)', marginTop: 5 }}>
                    🔒 Niveau {def.unlockLevel} requis
                  </div>
                )}
                {status === 'requires-missing' && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5 }}>
                    Requiert : {def.requires?.map(r => UPGRADES.find(u => u.id === r)?.name).join(', ')}
                  </div>
                )}
                {status === 'available' && (
                  <div className="upg-cost">{formatMoney(def.cost)}</div>
                )}
              </div>
              {status === 'available' && (
                <button
                  className="btn btn-primary btn-sm"
                  disabled={!canAfford}
                  onClick={() => buyUpgrade(def.id)}
                >
                  Acheter
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
