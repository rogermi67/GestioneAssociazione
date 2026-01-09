// Gestione notifiche push
self.addEventListener('push', function(event) {
  console.log('📩 Push notification received:', event);
  
  if (!event.data) {
    console.log('❌ No data in push event');
    return;
  }

  try {
    const data = event.data.json();
    console.log('📦 Push data:', data);
    
    const options = {
      body: data.body,
      icon: data.icon || '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/'
      },
      requireInteraction: false,
      tag: 'notification-' + Date.now()
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (err) {
    console.error('❌ Error parsing push data:', err);
  }
});

// Click sulla notifica
self.addEventListener('notificationclick', function(event) {
  console.log('👆 Notification clicked:', event.notification);
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Se c'è già una finestra aperta, focusla
        for (let client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // Altrimenti apri nuova finestra
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log('✅ Service Worker custom loaded with push handlers');