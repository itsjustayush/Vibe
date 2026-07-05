/**
 * AYU.VIBEE Service Worker
 * Network-first strategy for HTML, cache-first for assets
 * Enables offline access to previously visited pages
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `ayu-vibee-${CACHE_VERSION}`;
const OFFLINE_PAGE = '/';

// Critical assets to cache on install
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/favicon.png',
  '/og-image.png',
  '/manifest.json',
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Network-first: Try network, fallback to cache
  networkFirst: async (request) => {
    try {
      const response = await fetch(request);
      if (response.status === 200) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      const cached = await caches.match(request);
      return cached || new Response('Offline - Page not available', { status: 503 });
    }
  },

  // Cache-first: Use cache, fallback to network
  cacheFirst: async (request) => {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response.status === 200) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      return new Response('Offline - Resource not available', { status: 503 });
    }
  },

  // Stale-while-revalidate: Use cache immediately, update in background
  staleWhileRevalidate: async (request) => {
    const cached = await caches.match(request);

    const fetchPromise = fetch(request).then((response) => {
      if (response.status === 200) {
        const cache = caches.open(CACHE_NAME);
        cache.then((c) => c.put(request, response.clone()));
      }
      return response;
    });

    return cached || fetchPromise;
  },
};

/**
 * Install event: Cache critical assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CRITICAL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/**
 * Activate event: Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('ayu-vibee-') && name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

/**
 * Fetch event: Implement caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip chrome extension and other non-http(s) schemes
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // HTML pages: network-first (always try fresh content)
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(CACHE_STRATEGIES.networkFirst(request));
    return;
  }

  // Images: cache-first (images don't change often)
  if (request.destination === 'image') {
    event.respondWith(CACHE_STRATEGIES.cacheFirst(request));
    return;
  }

  // CSS, JS, Fonts: cache-first with long expiry
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font'
  ) {
    event.respondWith(CACHE_STRATEGIES.cacheFirst(request));
    return;
  }

  // API calls: network-first with fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(CACHE_STRATEGIES.networkFirst(request));
    return;
  }

  // Default: stale-while-revalidate
  event.respondWith(CACHE_STRATEGIES.staleWhileRevalidate(request));
});

/**
 * Message event: Handle requests from clients
 */
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data?.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});
