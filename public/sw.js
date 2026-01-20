// Kur'an App Service Worker
const CACHE_NAME = 'kuran-app-v1';
const STATIC_CACHE = 'kuran-static-v1';
const DYNAMIC_CACHE = 'kuran-dynamic-v1';
const AUDIO_CACHE = 'kuran-audio-v1';

// Assets to cache immediately on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/logo.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => {
                            return name.startsWith('kuran-') &&
                                name !== STATIC_CACHE &&
                                name !== DYNAMIC_CACHE &&
                                name !== AUDIO_CACHE;
                        })
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) return;

    // Handle audio files specially
    if (url.pathname.includes('/audio/') || request.url.includes('everyayah.com')) {
        event.respondWith(handleAudioRequest(request));
        return;
    }

    // Handle Mushaf images
    if (url.pathname.includes('/mushaf/')) {
        event.respondWith(handleMushafRequest(request));
        return;
    }

    // Handle API requests (don't cache)
    if (url.pathname.includes('/api/')) {
        event.respondWith(fetch(request));
        return;
    }

    // For all other requests, use stale-while-revalidate strategy
    event.respondWith(staleWhileRevalidate(request));
});

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request)
        .then((networkResponse) => {
            if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        })
        .catch(() => cachedResponse);

    return cachedResponse || fetchPromise;
}

// Handle audio with cache-first strategy
async function handleAudioRequest(request) {
    const cache = await caches.open(AUDIO_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        console.log('[SW] Serving audio from cache:', request.url);
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // Clone and cache the response
            cache.put(request, networkResponse.clone());
            console.log('[SW] Cached new audio:', request.url);
        }
        return networkResponse;
    } catch (error) {
        console.error('[SW] Audio fetch failed:', error);
        // Return an empty response for failed audio
        return new Response(null, { status: 503, statusText: 'Audio unavailable' });
    }
}

// Handle Mushaf images with cache-first strategy
async function handleMushafRequest(request) {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('[SW] Mushaf fetch failed:', error);
        return new Response(null, { status: 503, statusText: 'Image unavailable' });
    }
}

// Listen for messages from the main app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CACHE_AUDIO') {
        // Pre-cache audio for a specific surah
        const { surahId, reciterId } = event.data;
        cacheAudioForSurah(surahId, reciterId);
    }

    if (event.data && event.data.type === 'CLEAR_AUDIO_CACHE') {
        caches.delete(AUDIO_CACHE);
    }
});

// Pre-cache audio for offline listening
async function cacheAudioForSurah(surahId, reciterId) {
    const cache = await caches.open(AUDIO_CACHE);
    // The app will send specific URLs to cache
    console.log(`[SW] Pre-caching audio for Surah ${surahId} with reciter ${reciterId}`);
}
