import { useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import { startGameLoop, stopGameLoop } from './core/engine/gameLoop'
import Header from './ui/components/Header'
import Navigation from './ui/components/Navigation'
import EventModal from './ui/components/EventModal'
import NotificationToast from './ui/components/NotificationToast'
import Dashboard from './ui/screens/Dashboard'
import Activities from './ui/screens/Activities'
import Upgrades from './ui/screens/Upgrades'
import Employees from './ui/screens/Employees'
import Candidates from './ui/screens/Candidates'
import Market from './ui/screens/Market'
import Stocks from './ui/screens/Stocks'
import Missions from './ui/screens/Missions'
import Profile from './ui/screens/Profile'
import { Departments } from './ui/screens/Departments'
import { Assets } from './ui/screens/Assets'
import { Talents } from './ui/screens/Talents'
import { CompanySetup } from './ui/screens/CompanySetup'
import RetirementSequence from './ui/screens/RetirementSequence'
import CareerHistory from './ui/screens/CareerHistory'
import PrestigeUpgrades from './ui/screens/PrestigeUpgrades'

function ScreenRouter() {
  const screen = useGameStore(s => s.currentScreen)
  switch (screen) {
    case 'dashboard':    return <Dashboard />
    case 'activities':   return <Activities />
    case 'upgrades':     return <Upgrades />
    case 'employees':    return <Employees />
    case 'candidates':   return <Candidates />
    case 'market':       return <Market />
    case 'stocks':       return <Stocks />
    case 'missions':     return <Missions />
    case 'profile':      return <Profile />
    case 'departments':  return <Departments />
    case 'assets':       return <Assets />
    case 'talents':         return <Talents />
    case 'retirement':      return <RetirementSequence />
    case 'careerHistory':   return <CareerHistory />
    case 'prestigeUpgrades': return <PrestigeUpgrades />
    default:                return <Dashboard />
  }
}

export default function App() {
  const loadGame     = useGameStore(s => s.loadGame)
  const tick         = useGameStore(s => s.tick)
  const setupComplete = useGameStore(s => s.setupComplete)

  useEffect(() => {
    loadGame()
    startGameLoop(tick)
    return () => stopGameLoop()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Show setup wizard for new games
  if (!setupComplete) {
    return (
      <div className="app-container">
        <CompanySetup />
        <NotificationToast />
      </div>
    )
  }

  return (
    <div className="app-container">
      <Header />
      <div className="app-body">
        <Navigation />
        <main className="app-main">
          <ScreenRouter />
        </main>
      </div>
      <EventModal />
      <NotificationToast />
    </div>
  )
}
