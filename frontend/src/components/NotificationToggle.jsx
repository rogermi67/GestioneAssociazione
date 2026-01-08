import { usePushNotifications } from '../hooks/usePushNotifications'
import { FiBell, FiBellOff } from 'react-icons/fi'

export default function NotificationToggle() {
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications()

  if (!isSupported) {
    return (
      <div className="card">
        <p className="text-gray-500 text-sm">
          Le notifiche push non sono supportate su questo browser
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isSubscribed ? (
            <FiBell className="text-green-600 text-xl mr-3" />
          ) : (
            <FiBellOff className="text-gray-400 text-xl mr-3" />
          )}
          <div>
            <h3 className="font-semibold text-gray-900">Notifiche Push</h3>
            <p className="text-sm text-gray-500">
              {isSubscribed 
                ? 'Riceverai notifiche per eventi importanti' 
                : 'Abilita per ricevere aggiornamenti'}
            </p>
          </div>
        </div>
        <button
          onClick={isSubscribed ? unsubscribe : subscribe}
          className={isSubscribed ? 'btn-secondary' : 'btn-primary'}
        >
          {isSubscribed ? 'Disabilita' : 'Abilita'}
        </button>
      </div>
    </div>
  )
}