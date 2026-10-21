// Patri's service worker: shows push alerts and opens the train when one is tapped. It caches nothing.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('push', event => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch { d = { body: event.data && event.data.text() }; }
  event.waitUntil(self.registration.showNotification(d.title || 'Patri', {
    body: d.body || '', tag: d.tag, renotify: true, icon: '/icon-192.png', dir: 'auto', data: { url: d.url || '/' },
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const win = list.find(w => w.url.startsWith(self.location.origin));
    if (win) return win.navigate(url).then(w => (w || win).focus());
    return self.clients.openWindow(url);
  }));
});
