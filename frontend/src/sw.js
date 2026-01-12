import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

// ⚠️ IMPORTANTE: Questo placeholder è richiesto da Vite PWA!
precacheAndRoute(self.__WB_MANIFEST);

// Cache delle API
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
  })
);

// 🔔 GESTIONE NOTIFICHE PUSH
self.addEventListener('push', function(event) {
  console.log('📩 Push ricevuto:', event);
  
  if (!event.data) {
    console.log('❌ Nessun dato');
    return;
  }

  try {
    const data = event.data.json();
    console.log('📦 Dati notifica:', data);
    
    const options = {
      body: data.body,
      icon: data.icon || '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' }
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (err) {
    console.error('❌ Errore:', err);
  }
});

// Click su notifica
self.addEventListener('notificationclick', function(event) {
  console.log('👆 Click notifica');
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        for (let client of clientList) {
          if (client.url.includes(urlToOpen)) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log('✅ SW caricato');