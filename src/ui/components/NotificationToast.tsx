import { useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import { formatMoney } from '../utils/format'

export default function NotificationToast() {
  const notifications = useGameStore(s => s.notifications)
  const dismissNotification = useGameStore(s => s.dismissNotification)
  const offlineEarnings = useGameStore(s => s.offlineEarnings)
  const dismissOfflineEarnings = useGameStore(s => s.dismissOfflineEarnings)

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (notifications.length === 0) return
    const timer = setTimeout(() => {
      dismissNotification(notifications[0].id)
    }, 4000)
    return () => clearTimeout(timer)
  }, [notifications, dismissNotification])

  return (
    <>
      {/* Offline earnings popup */}
      {offlineEarnings !== null && offlineEarnings > 0 && (
        <div className="modal-overlay">
          <div className="offline-popup">
            <h2>🌙 Revenus hors-ligne</h2>
            <p>Pendant ton absence, tes activités automatisées ont généré :</p>
            <div className="offline-amount">{formatMoney(offlineEarnings)}</div>
            <button className="btn btn-primary btn-lg" onClick={dismissOfflineEarnings}>
              Récupérer
            </button>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <div className="notif-container">
        {notifications.map(notif => (
          <div key={notif.id} className={`notif ${notif.type}`}>
            <div className="notif-dot" />
            <span>{notif.message}</span>
            <button
              className="notif-dismiss"
              onClick={() => dismissNotification(notif.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
