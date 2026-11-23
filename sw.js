/* Sense-appens service worker (web/PWA). Genereres af scripts/pwa-postexport.mjs — ret her, ikke i dist/sw.js.
 *
 * - Hashede statiske filer (_expo/static, assets/): precache ved install (JS, CSS, fonte, ikoner) og cache-first.
 * - HTML/navigation: network-first; cachen bruges kun, når nettet svigter (offline). En ny deploy slår derfor
 *   altid igennem ved næste åbning.
 * - API (/wp-json/…): ALDRIG cachet. Requesten passerer urørt (ingen respondWith). Det gælder også katalogdata:
 *   priser og lager må ikke vises forældede i en shop.
 * - Ikke-GET passerer altid urørt.
 * - Øvrige billeder (produkter, nyheder, forhandlere; i demoen fra samme vært): stale-while-revalidate, højst IMG_MAX poster (ældste ryger først).
 * - Caches er versionsnavngivne; activate sletter alle andre end de aktuelle. skipWaiting + clients.claim:
 *   den nye version tager over med det samme, uden at alle faner skal lukkes.
 */
const BASE = "/sense-app-demo"; // '' eller fx '/sense-app-demo'
const VERSION = "befce1ab8aca";
const PRECACHE = ["/sense-app-demo/_expo/static/js/web/[doc]-0fe966028f7bc1820d57b09d10dada73.js","/sense-app-demo/_expo/static/js/web/[id]-07bce4b2838c5cef491bc378227440bc.js","/sense-app-demo/_expo/static/js/web/[id]-0a92393418d71d0ff67db0837e680b7f.js","/sense-app-demo/_expo/static/js/web/[id]-5d38cdb554325858d4fee49c026014a1.js","/sense-app-demo/_expo/static/js/web/[id]-5df8194d39ab2369cdd59ae68bd12565.js","/sense-app-demo/_expo/static/js/web/[id]-cf426ce8c0d8abf4cba650f928492320.js","/sense-app-demo/_expo/static/js/web/__common-4b464efd77e2ee87c8302caf438983f4.js","/sense-app-demo/_expo/static/js/web/__expo-metro-runtime-8c088df87a31e4e6accd81c554ec290d.js","/sense-app-demo/_expo/static/js/web/_layout-240f284725d914d36c59b87c1440ee88.js","/sense-app-demo/_expo/static/js/web/_layout-6b7330321d7c08ead4f3cc6c86429729.js","/sense-app-demo/_expo/static/js/web/_layout-bac4e70753adb981e361f9513a5033a9.js","/sense-app-demo/_expo/static/js/web/_layout-bdd8d491c71251fe1d16dad75a14171b.js","/sense-app-demo/_expo/static/js/web/_layout-be9a9c929acda33ee3b24b57b349bfbe.js","/sense-app-demo/_expo/static/js/web/_layout-eb657d46b54f1bf8b09a8be7189b1405.js","/sense-app-demo/_expo/static/js/web/_layout-f7a22d3564daeb6ee23e3f967b150bc5.js","/sense-app-demo/_expo/static/js/web/age-gate-2176216a71e415868f2639677798cacb.js","/sense-app-demo/_expo/static/js/web/butikker-a85923dd91652e0729bcf0a4821e3cbf.js","/sense-app-demo/_expo/static/js/web/cart-57ee7099c9ed85955ec164e671f2aae1.js","/sense-app-demo/_expo/static/js/web/checkin-5a376d4c6ef87717df29bd548c1f6883.js","/sense-app-demo/_expo/static/js/web/collection-d064ab043f3c55cbf45d20493d1be1f8.js","/sense-app-demo/_expo/static/js/web/coupons-126d9ab0f08d507d1380f5a0e06f8c2a.js","/sense-app-demo/_expo/static/js/web/daily-500e4a838739953d36c9ac82ebc959a9.js","/sense-app-demo/_expo/static/js/web/deals-a9e8ad93e48cb52ad1b5d87793d21e99.js","/sense-app-demo/_expo/static/js/web/delete-account-1216bb66a5beb5ded9759fee4f7c67fc.js","/sense-app-demo/_expo/static/js/web/demo-6a1068b4140567f6666653eeabdd6672.js","/sense-app-demo/_expo/static/js/web/entry-7886ee03f2952ea7c9508a0cad0c5daf.js","/sense-app-demo/_expo/static/js/web/forgot-61808c90f6a04b0ef2b71f63b02c4762.js","/sense-app-demo/_expo/static/js/web/history-cf2275b8176d64cf73b3b227870e327b.js","/sense-app-demo/_expo/static/js/web/index-0a1682d741e99157c9613e5a930ed0b3.js","/sense-app-demo/_expo/static/js/web/index-12227c6fc03a1396fb6f6b18fb27308b.js","/sense-app-demo/_expo/static/js/web/index-383c96af8bb226ef93920e396d826ca9.js","/sense-app-demo/_expo/static/js/web/index-71d0fa040c4e0fde428798c529f5e777.js","/sense-app-demo/_expo/static/js/web/index-a0c06de4c9c3dda08c5ccc49ff953b51.js","/sense-app-demo/_expo/static/js/web/index-c597641ee80af2bbbcfa42757339aa4c.js","/sense-app-demo/_expo/static/js/web/install-bebfdeef39a481128a61297aa65fc36e.js","/sense-app-demo/_expo/static/js/web/login-42804914ddbd6bc52cf1806bdabdd068.js","/sense-app-demo/_expo/static/js/web/orders-0f15a01b9db29e9279ba0dbf11a99a57.js","/sense-app-demo/_expo/static/js/web/quiz-c369bb6f6c1209ae550a52e4149c0f3f.js","/sense-app-demo/_expo/static/js/web/register-ef8dbdaca27087deb7dee9fb1f399243.js","/sense-app-demo/_expo/static/js/web/return-f56e58f0467525a0d78446c1f8a0ba90.js","/sense-app-demo/_expo/static/js/web/rings-e7896e20c5b689f44a8a6682048f7e97.js","/sense-app-demo/_expo/static/js/web/scratch-6299d0ab7de7d49b95775069baa8ff7a.js","/sense-app-demo/_expo/static/js/web/settings-f2a629d3dae600fbde87dbca9a1dc4ee.js","/sense-app-demo/_expo/static/js/web/terms-738bda13181d663286e3104c6bf80931.js","/sense-app-demo/_expo/static/css/maplibre-gl-251fdbfda84eb147f0a36795135ef43b.css","/sense-app-demo/assets/assets/fonts/Ionicons-sense.e491132dd197af1b53a822805f6fb597.woff2","/sense-app-demo/assets/assets/fonts/Manrope_200ExtraLight.9c2d9cdda30048a29c705729a3caac8b.woff2","/sense-app-demo/assets/assets/fonts/Manrope_300Light.d6c2f465e6e5fdc6e79466e290285da1.woff2","/sense-app-demo/assets/assets/fonts/Manrope_400Regular.68cece1777ddfa1e687547f1d426cb08.woff2","/sense-app-demo/assets/assets/fonts/Poppins_600SemiBold.73ab67c348fbe8000b0d6df65ec660f4.woff2","/sense-app-demo/assets/assets/fonts/Poppins_800ExtraBold.000a3fca4f9d2290c1f35b8bf52412f3.woff2","/sense-app-demo/assets/assets/ikoner/kat_alle.2fafc122a1126bfeb9f815867965d73d.png","/sense-app-demo/assets/assets/ikoner/kat_bestsellers.c97047ff7912c9227cb2fac7658f03c0.png","/sense-app-demo/assets/assets/ikoner/kat_ekstrakter.e965e21098d71ea4edfa0d2fdf75d200.png","/sense-app-demo/assets/assets/ikoner/kat_grinders.d8e5150f6b8258b52f319e699ef048ce.png","/sense-app-demo/assets/assets/ikoner/kat_gummies.d73dbbb91e3fd65d062e5e096f7a7c4e.png","/sense-app-demo/assets/assets/ikoner/kat_hash.7d9ddac6072c5b914a9a003a686612d0.png","/sense-app-demo/assets/assets/ikoner/kat_isolat.0f1018829c9c05e51ccc6d75e59e7a3c.png","/sense-app-demo/assets/assets/ikoner/kat_kampagner.791b524831ec190cb55102f99befb58a.png","/sense-app-demo/assets/assets/ikoner/kat_olier.b9b704633c142da58b3b48256d5eab51.png","/sense-app-demo/assets/assets/ikoner/kat_papir_filter.70c14b6b17df5010c00e88f6db2a1e01.png","/sense-app-demo/assets/assets/ikoner/kat_popcorn.39aeddbc54ccf335c7d52c4f41cc0bcb.png","/sense-app-demo/assets/assets/ikoner/kat_pre_rolls.414d60050dba3878a4824d4abb753a11.png","/sense-app-demo/assets/assets/ikoner/kat_rocks.18cc312c27b767498d4668fd264bc019.png","/sense-app-demo/assets/assets/ikoner/kat_stof.6b6154e6808ca7838ca60b21dffcf314.png","/sense-app-demo/assets/assets/ikoner/kat_tilbehoer.8b6b7d5d6cfccde726536abcb1a149cd.png","/sense-app-demo/assets/assets/ikoner/kat_topskud.a3aebf5124051a98dd0969149f9cc803.png","/sense-app-demo/assets/assets/ikoner/kat_trim.ab65ef0265b666e9ece62c8ff93ab987.png","/sense-app-demo/assets/assets/ikoner/kat_vaegte.476ae15a5267975601513443719be6bf.png","/sense-app-demo/assets/assets/ikoner/laast.f5d637740156a9110e15f10067bd56a1.png","/sense-app-demo/assets/assets/ikoner/point_moent.9761367789e0560a5730705e227c3a90.png","/sense-app-demo/assets/assets/ikoner/rabat_maerke.ba504244dde669115d9273b681906e93.png","/sense-app-demo/assets/assets/ikoner/tab_beloenninger.cc89eeefa60f722b33be505ce67b0c2d.png","/sense-app-demo/assets/assets/ikoner/tab_hjem.4e9aeba6ffbd463296268bc83a017e76.png","/sense-app-demo/assets/assets/ikoner/tab_profil.91f1b298ead80881dd50ee32b90a6256.png","/sense-app-demo/assets/assets/ikoner/tab_shop.f502e7170a4eb2244d2330e5968e8da0.png","/sense-app-demo/assets/assets/ikoner/tab_spil.c756466054e335264d020397480f3752.png","/sense-app-demo/assets/assets/ikoner/type_fast_rabat.43202e0090fe858c5b154506ab888d25.png","/sense-app-demo/assets/assets/ikoner/type_gratis_fragt.6213127533a3ed9a81b55f3e88396a4f.png","/sense-app-demo/assets/assets/ikoner/type_gratis_produkt.6625e23efffd6717b7fb8e43aaa1319d.png","/sense-app-demo/assets/assets/ikoner/type_procent.f220c9ee441f7e528c074a542fe2e1b7.png"];
const STATIC = `sense-static-${VERSION}`;
const PAGES = `sense-pages-${VERSION}`;
const IMG = 'sense-img-v1';
const IMG_MAX = 150;
const KEEP = [STATIC, PAGES, IMG];
const INDEX = `${BASE}/`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const s = await caches.open(STATIC);
      // Enkeltvis, så én fejlende fil ikke vælter hele installationen.
      await Promise.all(PRECACHE.map((u) => s.add(u).catch(() => {})));
      const p = await caches.open(PAGES);
      await p.add(new Request(INDEX, { cache: 'reload' })).catch(() => {});
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n.startsWith('sense-') && !KEEP.includes(n)).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

const isHashedStatic = (url) => url.origin === self.location.origin && (url.pathname.startsWith(`${BASE}/_expo/static/`) || url.pathname.startsWith(`${BASE}/assets/`));

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (url.pathname.includes('/wp-json/')) return; // API: aldrig cache

  if (req.mode === 'navigate') {
    if (url.origin !== self.location.origin) return;
    event.respondWith(networkFirstPage(event));
    return;
  }
  if (isHashedStatic(url)) {
    event.respondWith(cacheFirst(req));
    return;
  }
  if (req.destination === 'image') {
    event.respondWith(staleWhileRevalidateImage(event));
    return;
  }
  if (url.origin === self.location.origin) {
    // Uhashede egne filer (manifest, ikoner, demo-backend): nettet først, cachen kun offline.
    event.respondWith(networkFirst(req, PAGES));
  }
});

async function networkFirstPage(event) {
  try {
    // cache: 'no-cache' = revalidér altid hos serveren (304 er billigt), så HTTP-cachens max-age aldrig holder en
    // gammel index.html fast efter en deploy.
    const res = await fetch(event.request, { cache: 'no-cache' });
    if (res.ok) {
      const copy = res.clone();
      event.waitUntil(caches.open(PAGES).then((c) => c.put(INDEX, copy)).catch(() => {}));
    }
    return res;
  } catch (err) {
    const hit = (await caches.match(INDEX, { cacheName: PAGES })) || (await caches.match(INDEX));
    if (hit) return hit;
    throw err;
  }
}

async function cacheFirst(req) {
  const hit = await caches.match(req, { cacheName: STATIC });
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) {
    const copy = res.clone();
    caches.open(STATIC).then((c) => c.put(req, copy)).catch(() => {});
  }
  return res;
}

async function networkFirst(req, cacheName) {
  try {
    const res = await fetch(req);
    if (res.ok) {
      const copy = res.clone();
      caches.open(cacheName).then((c) => c.put(req, copy)).catch(() => {});
    }
    return res;
  } catch (err) {
    const hit = await caches.match(req, { ignoreSearch: true });
    if (hit) return hit;
    throw err;
  }
}

async function staleWhileRevalidateImage(event) {
  const req = event.request;
  const cache = await caches.open(IMG);
  const hit = await cache.match(req);
  const update = fetch(req)
    .then(async (res) => {
      if (res.ok || res.type === 'opaque') {
        await cache.delete(req); // genindsæt bagerst = senest brugt
        await cache.put(req, res.clone());
        await trim(cache);
      }
      return res;
    })
    .catch(() => undefined);
  if (hit) {
    event.waitUntil(update);
    return hit;
  }
  const res = await update;
  return res || Response.error();
}

async function trim(cache) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - IMG_MAX; i++) await cache.delete(keys[i]);
}

/* ---------------- Web Push (plan v2 §9.13) ----------------
 * Serveren sender endnu intet (afsenderen er udskudt); lytterne er klar, så intet skal ændres i SW'en senere.
 * Payload: { title, body, url } (url relativ til appen). Ingen ændring af cache-reglerne ovenfor. */
self.addEventListener('push', (event) => {
  let d = {};
  try {
    d = event.data ? event.data.json() : {};
  } catch {
    d = { body: event.data ? event.data.text() : '' };
  }
  const title = d.title || 'Sense';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: d.body || '',
      icon: `${BASE}/icons/pwa-192.png`,
      badge: `${BASE}/icons/pwa-192.png`,
      lang: 'da',
      data: { url: d.url || '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const rel = String((event.notification.data && event.notification.data.url) || '/');
  // Kun stier i appen (ingen fremmede domæner).
  const path = rel.startsWith('/') && !rel.startsWith('//') ? rel : '/';
  const target = new URL(`${BASE}${path}`, self.location.origin).href;
  event.waitUntil(
    (async () => {
      const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const w of wins) {
        if (w.url.startsWith(self.location.origin + BASE) && 'focus' in w) {
          await w.focus();
          if ('navigate' in w) await w.navigate(target).catch(() => {});
          return;
        }
      }
      await self.clients.openWindow(target);
    })(),
  );
});
