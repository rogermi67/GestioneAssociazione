import { useState, useEffect } from 'react'
import { pushNotificationAPI } from '../services/api'
import { toast } from 'react-toastify'

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [vapidPublicKey] = useState('BBJo1GPOEtP1sHtkv2_Ijna9eP7gC6cDIeDzIdr0ftaCkSknYQB_O06PsZYs2mGoYZqxz7A5GQGmsVoESeGkv0g')

  useEffect(() => {
    // Verifica supporto notifiche
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const subscribe = async () => {
    try {
      const permission = await Notification.requestPermission()
      
      if (permission !== 'granted') {
        toast.error('Permesso notifiche negato')
        return false
      }

      const registration = await navigator.serviceWorker.ready
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      })

      const subscriptionJson = subscription.toJSON()
      
      await pushNotificationAPI.subscribe({
        endpoint: subscriptionJson.endpoint,
        p256dh: subscriptionJson.keys.p256dh,
        auth: subscriptionJson.keys.auth
      })

      setIsSubscribed(true)
      toast.success('Notifiche abilitate!')
      return true
    } catch (error) {
      console.error('Error subscribing:', error)
      toast.error('Errore nell\'abilitazione delle notifiche')
      return false
    }
  }

  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        await subscription.unsubscribe()
        await pushNotificationAPI.unsubscribe()
        setIsSubscribed(false)
        toast.success('Notifiche disabilitate')
        return true
      }
    } catch (error) {
      console.error('Error unsubscribing:', error)
      toast.error('Errore nella disabilitazione')
      return false
    }
  }

  return {
    isSupported,
    isSubscribed,
    subscribe,
    unsubscribe
  }
}