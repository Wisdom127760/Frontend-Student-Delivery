const CACHE_NAME = 'greep-sds-v1.0.0';
const STATIC_CACHE_NAME = 'greep-sds-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'greep-sds-dynamic-v1.0.0';

// Static assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/static/js/bundle.js',
    '/static/css/main.css',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// API endpoints to cache with network-first strategy
const API_ENDPOINTS = [
    '/api/auth/verify',
    '/api/drivers/profile',
    '/api/system/settings'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installing...');

    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('📦 Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('✅ Service Worker: Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Service Worker: Failed to cache static assets', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
                            console.log('🗑️ Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Activated successfully');
                return self.clients.claim();
            })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Skip Hot Module Replacement (HMR) requests in development
    // This prevents service worker from intercepting HMR requests that cause API spam
    if (url.pathname.includes('hot-update') ||
        url.pathname.includes('webpack-hmr') ||
        url.pathname.includes('__webpack_hmr') ||
        url.pathname.includes('sockjs-node') ||
        url.pathname.includes('webpack-dev-server') ||
        url.search.includes('hot=true') ||
        url.search.includes('hmr=true') ||
        url.search.includes('_t=') || // Webpack cache busting
        url.hostname === 'localhost' && url.port === '3000' && url.pathname.includes('static/js/')) {
        console.log('🚫 Service Worker: Skipping HMR/dev server request:', url.pathname);
        return;
    }

    // Handle different types of requests
    if (isStaticAsset(request)) {
        // Static assets: Cache first strategy
        event.respondWith(cacheFirst(request));
    } else if (isAPIRequest(request)) {
        // API requests: Network first strategy
        event.respondWith(networkFirst(request));
    } else if (isPageRequest(request)) {
        // Page requests: Network first with offline fallback
        event.respondWith(networkFirstWithOfflineFallback(request));
    } else {
        // Other requests: Network first
        event.respondWith(networkFirst(request));
    }
});

// Cache first strategy for static assets
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('❌ Service Worker: Cache first failed', error);
        return new Response('Offline - Static asset not available', { status: 503 });
    }
}

// Network first strategy for API requests
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('🌐 Service Worker: Network failed, trying cache', error);

        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline response for API requests
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Offline - Please check your internet connection',
                offline: true
            }),
            {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Network first with offline fallback for page requests
async function networkFirstWithOfflineFallback(request) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('🌐 Service Worker: Network failed, trying cache', error);

        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline page
        const offlinePage = await caches.match('/offline.html');
        if (offlinePage) {
            return offlinePage;
        }

        // Fallback to index.html
        const indexPage = await caches.match('/');
        if (indexPage) {
            return indexPage;
        }

        return new Response('Offline - Please check your internet connection', { status: 503 });
    }
}

// Helper functions
function isStaticAsset(request) {
    const url = new URL(request.url);
    return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

function isAPIRequest(request) {
    const url = new URL(request.url);
    return url.pathname.startsWith('/api/');
}

function isPageRequest(request) {
    const url = new URL(request.url);
    return url.pathname === '/' ||
        url.pathname.startsWith('/driver') ||
        url.pathname.startsWith('/admin') ||
        url.pathname.startsWith('/login');
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('🔄 Service Worker: Background sync triggered', event.tag);

    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    try {
        // Get pending offline actions from IndexedDB
        const pendingActions = await getPendingOfflineActions();

        for (const action of pendingActions) {
            try {
                await syncOfflineAction(action);
                await removePendingOfflineAction(action.id);
            } catch (error) {
                console.error('❌ Service Worker: Failed to sync action', action, error);
            }
        }
    } catch (error) {
        console.error('❌ Service Worker: Background sync failed', error);
    }
}

// Push notification handling
self.addEventListener('push', (event) => {
    console.log('🔔 Service Worker: Push notification received');

    let options = {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };

    if (event.data) {
        const data = event.data.json();

        // Handle different notification types
        if (data.type === 'message') {
            // Message notification with preview
            options = {
                ...options,
                title: data.title || 'New Message',
                body: data.body || data.message || 'You have a new message',
                tag: 'driver-message',
                requireInteraction: false,
                actions: [
                    {
                        action: 'view-message',
                        title: 'View Message',
                        icon: '/icons/icon-96x96.png'
                    },
                    {
                        action: 'close',
                        title: 'Close',
                        icon: '/icons/icon-96x96.png'
                    }
                ]
            };
        } else if (data.type === 'delivery' || data.type === 'delivery_broadcast' || data.type === 'delivery_assigned') {
            // Delivery notification - Enhanced for better visibility
            const deliveryCode = data.deliveryCode || data.code || 'Unknown';
            const pickupLocation = data.pickupLocation || data.pickupLocationDescription || 'Unknown location';
            const deliveryLocation = data.deliveryLocation || data.deliveryLocationDescription || 'Unknown destination';
            const fee = data.fee || data.driverEarning || 0;
            const customerName = data.customerName || 'Customer';

            // Create more detailed notification body
            let notificationBody = '';
            if (data.type === 'delivery_assigned') {
                notificationBody = `📦 Delivery ${deliveryCode} assigned to you!\nFrom: ${pickupLocation}\nTo: ${deliveryLocation}\nEarning: ₺${fee}`;
            } else {
                notificationBody = `🚚 New delivery available!\nCode: ${deliveryCode}\nFrom: ${pickupLocation}\nTo: ${deliveryLocation}\nFee: ₺${fee}\nCustomer: ${customerName}`;
            }

            options = {
                ...options,
                title: data.title || (data.type === 'delivery_assigned' ? `📦 Delivery Assigned - ${deliveryCode}` : `🚚 New Delivery - ${deliveryCode}`),
                body: data.body || notificationBody,
                tag: data.type === 'delivery_assigned' ? 'delivery-assigned' : 'delivery-broadcast',
                requireInteraction: true, // Make delivery notifications require interaction
                vibrate: [200, 100, 200, 100, 200, 100, 200], // More prominent vibration pattern
                silent: false, // Ensure sound plays
                renotify: true, // Allow re-notification with same tag
                actions: [
                    {
                        action: 'view-delivery',
                        title: 'View Details',
                        icon: '/icons/icon-96x96.png'
                    },
                    {
                        action: 'accept-delivery',
                        title: data.type === 'delivery_assigned' ? 'Start Delivery' : 'Accept',
                        icon: '/icons/icon-96x96.png'
                    },
                    {
                        action: 'close',
                        title: 'Close',
                        icon: '/icons/icon-96x96.png'
                    }
                ]
            };
        } else {
            // Default notification
            options = {
                ...options,
                title: data.title || 'Greep SDS',
                body: data.body || 'You have a new notification',
                tag: 'general-notification'
            };
        }

        options.data = { ...options.data, ...data };
    } else {
        // Fallback for notifications without data
        options = {
            ...options,
            title: 'Greep SDS',
            body: 'You have a new notification'
        };
    }

    event.waitUntil(
        self.registration.showNotification(options.title, options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Service Worker: Notification clicked', event.action);

    event.notification.close();

    if (event.action === 'view-message') {
        // Open messaging interface for admins
        event.waitUntil(
            clients.openWindow('/admin')
        );
    } else if (event.action === 'view-delivery' || event.action === 'explore') {
        // Open delivery broadcast for drivers
        event.waitUntil(
            clients.openWindow('/driver/broadcast')
        );
    } else if (event.action === 'accept-delivery') {
        // Open delivery broadcast page for accepting delivery
        event.waitUntil(
            clients.openWindow('/driver/broadcast')
        );
    } else if (event.action === 'close') {
        // Just close the notification
        return;
    } else {
        // Default action - open the app based on notification type
        const notificationData = event.notification.data;
        if (notificationData && notificationData.type === 'message') {
            // Open admin panel for message notifications
            event.waitUntil(
                clients.openWindow('/admin')
            );
        } else {
            // Default - open the app
            event.waitUntil(
                clients.openWindow('/')
            );
        }
    }
});

// Helper functions for offline actions (placeholder implementations)
async function getPendingOfflineActions() {
    // This would typically use IndexedDB to get pending actions
    return [];
}

async function syncOfflineAction(action) {
    // This would sync the offline action with the server
    console.log('🔄 Service Worker: Syncing offline action', action);
}

async function removePendingOfflineAction(actionId) {
    // This would remove the action from IndexedDB after successful sync
    console.log('🗑️ Service Worker: Removing synced action', actionId);
}

// Message handling for communication with the main thread
self.addEventListener('message', (event) => {
    console.log('💬 Service Worker: Message received', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

console.log('🚀 Service Worker: Loaded successfully');
