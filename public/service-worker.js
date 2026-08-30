/* Kill-switch service worker.
 *
 * An old Create-React-App deploy left a caching service worker registered in
 * visitors' browsers, pinning them to the previous site. This worker ships at
 * the same URL so returning browsers update to it: it clears every cache,
 * unregisters itself, and reloads open tabs onto the live site. New visitors
 * never register it (the current app registers no service worker).
 */
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((client) => client.navigate(client.url));
    })()
  );
});
