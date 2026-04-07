import { useGameStore } from '../../store/gameStore'
import type { Screen } from '../../core/entities'
import { MISSIONS } from '../../core/data/missions'
import { BALANCE } from '../../core/data/balancing'

const NAV_ITEMS: { screen: Screen; icon: string; label: string; unlockLevel?: number }[] = [
  { screen: 'dashboard',   icon: '📊', label: 'Dashboard' },
  { screen: 'activities',  icon: '⚡', label: 'Activités' },
  { screen: 'upgrades',    icon: '🔬', label: 'Améliorations' },
  { screen: 'employees',   icon: '👥', label: 'Équipe' },
  { screen: 'candidates',  icon: '💼', label: 'Recrutement' },
  { screen: 'market',      icon: '🛒', label: 'Marché',       unlockLevel: BALANCE.MARKET_UNLOCK_LEVEL },
  { screen: 'stocks',      icon: '📈', label: 'Bourse',       unlockLevel: BALANCE.STOCKS_UNLOCK_LEVEL },
  { screen: 'missions',    icon: '🎯', label: 'Missions' },
  { screen: 'departments', icon: '🏢', label: 'Départements', unlockLevel: BALANCE.DEPARTMENTS_UNLOCK_LEVEL },
  { screen: 'assets',      icon: '💎', label: 'Patrimoine',   unlockLevel: BALANCE.ASSETS_UNLOCK_LEVEL },
  { screen: 'talents',     icon: '🌟', label: 'Talents CEO',  unlockLevel: BALANCE.TALENTS_UNLOCK_LEVEL },
  { screen: 'profile',     icon: '👤', label: 'Profil CEO' },
]

export default function Navigation() {
  const currentScreen  = useGameStore(s => s.currentScreen)
  const setScreen      = useGameStore(s => s.setScreen)
  const saveGame       = useGameStore(s => s.saveGame)
  const missions       = useGameStore(s => s.missions)
  const playerLevel    = useGameStore(s => s.player.level)
  const talentPoints   = useGameStore(s => s.player.talentPoints)
  const specialization = useGameStore(s => s.specialization)

  const pendingRewards = MISSIONS.filter(
    m => missions[m.id]?.completed && !missions[m.id]?.claimedReward,
  ).length

  return (
    <nav className="nav">
      {NAV_ITEMS.map(item => {
        const locked = item.unlockLevel ? playerLevel < item.unlockLevel : false
        return (
          <button
            key={item.screen}
            className={`nav-item ${currentScreen === item.screen ? 'active' : ''} ${locked ? 'nav-locked' : ''}`}
            onClick={() => !locked && setScreen(item.screen)}
            title={locked ? `Débloqué au niveau ${item.unlockLevel}` : undefined}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {locked && (
              <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--amber)' }}>
                🔒{item.unlockLevel}
              </span>
            )}
            {item.screen === 'missions' && pendingRewards > 0 && (
              <span style={{
                marginLeft: 'auto',
                background: 'var(--amber)',
                color: '#000',
                borderRadius: '10px',
                padding: '1px 7px',
                fontSize: '11px',
                fontWeight: '700',
              }}>
                {pendingRewards}
              </span>
            )}
            {item.screen === 'talents' && talentPoints > 0 && !locked && (
              <span style={{
                marginLeft: 'auto',
                background: 'var(--purple)',
                color: '#fff',
                borderRadius: '10px',
                padding: '1px 7px',
                fontSize: '11px',
                fontWeight: '700',
              }}>
                ⭐{talentPoints}
              </span>
            )}
            {item.screen === 'profile' && !specialization && playerLevel >= BALANCE.SPECIALIZATION_UNLOCK_LEVEL && (
              <span style={{
                marginLeft: 'auto',
                background: 'var(--purple)',
                color: '#fff',
                borderRadius: '10px',
                padding: '1px 7px',
                fontSize: '11px',
                fontWeight: '700',
              }}>
                !
              </span>
            )}
          </button>
        )
      })}

      <div className="nav-sep" />
      <button className="nav-save-btn" onClick={saveGame}>💾 Sauvegarder</button>
    </nav>
  )
}
