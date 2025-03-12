const CACHE_NAME = 'hello-project-cache-v1.1';
const urlsToCache = [
    '/',
    '/index.html',
    '/calendar.html',
    '/style.css',
    '/js/calendar-data.js',
    '/js/calendar-ui.js',
    '/js/calendar-main.js',
    '/manifest.json',
    'https://cdn.jsdelivr.net/npm/fullcalendar@5.10.1/main.min.css',
    'https://cdn.jsdelivr.net/npm/fullcalendar@5.10.1/main.min.js',
    '/img/default_image.jpg',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png',
    '/img/morning_musume_image.jpg',
    '/img/angerme_image.jpg',
    '/img/juice_juice_image.jpg',
    '/img/tsubaki_factory_image.jpg',
    '/img/beyooooonds_image.jpg',
    '/img/ocha_norma_image.jpg',
    '/img/rosy_chronicle_image.jpg',
    '/img/hello_project_trainees_image.jpg',
    '/img/hello_project_image.jpg',
    '/img/bnr_calendar.png'
];

// インストール時にキャッシュ
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('キャッシュを開きました');
            return cache.addAll(urlsToCache);
        })
    );
});

// アクティベーション時に古いキャッシュを削除
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('古いキャッシュを削除:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// フェッチイベントをインターセプト
self.addEventListener('fetch', event => {
    // Google Sheetsからのデータ取得リクエストは常にネットワークから取得
    if (event.request.url.includes('script.google.com')) {
        event.respondWith(
            fetch(event.request)
            .catch(error => {
                console.error('データ取得エラー:', error);
                // オフライン時には以前のレスポンスを提供
                return caches.match(event.request);
            })
        );
        return;
    }

    // その他のリクエストはキャッシュファーストで処理
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            // キャッシュがヒットしたらそのレスポンスを返す
            if (response) {
                return response;
            }

            // キャッシュにない場合はネットワークからフェッチ
            return fetch(event.request)
                .then(response => {
                    // 有効なレスポンスかチェック
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // レスポンスをクローンしてキャッシュに保存（レスポンスは一度しか使えないため）
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                })
                .catch(error => {
                    console.error('フェッチエラー:', error);
                    // オフライン時には標準的なフォールバックを提供
                    if (event.request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }
                    return new Response('オフラインです', { status: 503, statusText: 'Service Unavailable' });
                });
        })
    );
});