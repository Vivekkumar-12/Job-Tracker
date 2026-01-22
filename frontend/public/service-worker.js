// Service Worker for handling push notifications

// Handle push notifications from server
self.addEventListener('push', (event) => {
  let data = {};
  
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (err) {
    console.error('Failed to parse push notification:', err);
    data = {
      title: 'JobTracker Notification',
      body: event.data?.text?.() || 'You have a new notification'
    };
  }
  
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icon-2.png',
    badge: '/icon-2.png',
    tag: data.tag || 'notification',
    requireInteraction: data.requireInteraction || true,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icon-2.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-2.png'
      }
    ],
    data: {
      url: data.url || '/',
      reminderId: data.reminderId || null,
      ...data.customData
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'JobTracker', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Get the URL from notification data
  const notificationUrl = event.notification.data?.url || '/';

  // Open the application or navigate to the reminder
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ('focus' in client) {
          client.focus();
          // Post message to client to handle navigation
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            data: event.notification.data
          });
          return client;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(notificationUrl);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
