// Datore Service Worker — Offline-First Caching Strategy
// ═══════════════════════════════════════════════════════

const CACHE_NAME = 'datore-v1';
const STATIC_CACHE = 'datore-static-v1';
const DYNAMIC_CACHE = 'datore-dynamic-v1';
const IMAGE_CACHE = 'datore-images-v1';

// Static assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/home',
  '/offline',
  '/icon-192.png',
  '/icon-512.png',
  '/logo-128.png',
  '/manifest.json',
];

// ═══ Install: Pre-cache critical assets ═══
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Pre-cache partial failure:', err);
      });
    })
  );
  self.skipWaiting();
});

// ═══ Activate: Clean old caches ═══
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// ═══ Fetch Strategy Router ═══
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip Supabase API calls (always need fresh data)
  if (url.hostname.includes('supabase.co')) return;

  // Skip WebSocket upgrade requests
  if (request.headers.get('upgrade') === 'websocket') return;

  // Skip chrome-extension and non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // Strategy: Images — Cache First (long-lived)
  if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, 30 * 24 * 60 * 60 * 1000)); // 30 days
    return;
  }

  // Strategy: Static assets (JS, CSS, fonts) — Cache First
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/_next/static/')
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE, 7 * 24 * 60 * 60 * 1000)); // 7 days
    return;
  }

  // Strategy: API routes — Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE, 5 * 60 * 1000)); // 5 min cache
    return;
  }

  // Strategy: Page navigations — Network First with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // Default: Stale While Revalidate
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

// ═══ Cache First (for static assets and images) ═══
async function cacheFirst(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    const dateHeader = cached.headers.get('sw-cached-at');
    if (dateHeader && Date.now() - parseInt(dateHeader) > maxAge) {
      // Expired — fetch fresh in background
      fetchAndCache(request, cacheName);
    }
    return cached;
  }

  return fetchAndCache(request, cacheName);
}

// ═══ Network First (for API and dynamic content) ═══
async function networkFirst(request, cacheName, maxAge) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      const cloned = response.clone();
      const headers = new Headers(cloned.headers);
      headers.set('sw-cached-at', String(Date.now()));
      const cachedResponse = new Response(await cloned.blob(), {
        status: cloned.status,
        statusText: cloned.statusText,
        headers,
      });
      cache.put(request, cachedResponse);
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ═══ Network First with Offline Fallback (for page navigations) ═══
async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Serve offline page
    const offlinePage = await caches.match('/offline');
    if (offlinePage) return offlinePage;

    return new Response(
      '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Datore - Offline</title><style>*{margin:0;padding:0;box-sizing:border-box}body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a16;color:#e2e8f0;font-family:system-ui,sans-serif;text-align:center;padding:2rem}.container{max-width:400px}h1{font-size:1.5rem;margin-bottom:0.5rem}p{color:#94a3b8;margin-bottom:1.5rem}button{padding:0.75rem 2rem;background:#6366f1;color:white;border:none;border-radius:12px;font-size:1rem;cursor:pointer}button:hover{background:#4f46e5}</style></head><body><div class="container"><h1>You\'re Offline</h1><p>Check your internet connection and try again.</p><button onclick="location.reload()">Retry</button></div></body></html>',
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  }
}

// ═══ Stale While Revalidate ═══
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

// ═══ Fetch and Cache Helper ═══
async function fetchAndCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      const headers = new Headers(response.headers);
      headers.set('sw-cached-at', String(Date.now()));
      const cachedResponse = new Response(await response.clone().blob(), {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
      cache.put(request, cachedResponse);
    }
    return response;
  } catch {
    return new Response('Network error', { status: 503 });
  }
}

// ═══ Background Sync (for queued actions while offline) ═══
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-posts') {
    event.waitUntil(syncPendingPosts());
  }
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncPendingMessages());
  }
});

async function syncPendingPosts() {
  // Will be implemented when IndexedDB queue is added
  console.log('[SW] Syncing pending posts...');
}

async function syncPendingMessages() {
  console.log('[SW] Syncing pending messages...');
}

// ═══ Push Notifications ═══
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'New notification',
      icon: '/icon-192.png',
      badge: '/logo-128.png',
      vibrate: [100, 50, 100],
      data: { url: data.url || '/home' },
      actions: data.actions || [],
    };

    event.waitUntil(self.registration.showNotification(data.title || 'Datore', options));
  } catch {
    // Ignore malformed push data
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/home';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing tab if open
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new tab
      return self.clients.openWindow(url);
    })
  );
});
