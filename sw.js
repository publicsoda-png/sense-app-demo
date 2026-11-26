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
const VERSION = "20973054bd93";
const PRECACHE = ["/sense-app-demo/_expo/static/js/web/+not-found-645514cdd9dd7af252d8ecf0c82ed5a3.js","/sense-app-demo/_expo/static/js/web/[doc]-0845a0e4c592ac01d542c269d4712792.js","/sense-app-demo/_expo/static/js/web/[id]-4ad18f88247cfc7d59b5c91afd2d9d3d.js","/sense-app-demo/_expo/static/js/web/[id]-6208aac8793ffdeeff5960e68441cac2.js","/sense-app-demo/_expo/static/js/web/[id]-97504a9af6397355116b1beff86292df.js","/sense-app-demo/_expo/static/js/web/[id]-a5cb3db2fb6753ef4a81200c0b25e867.js","/sense-app-demo/_expo/static/js/web/[id]-db47283b7b5bb186cccee2bd119dea9b.js","/sense-app-demo/_expo/static/js/web/__common-1492b95a55f28672591739409766badb.js","/sense-app-demo/_expo/static/js/web/__expo-metro-runtime-8c088df87a31e4e6accd81c554ec290d.js","/sense-app-demo/_expo/static/js/web/_layout-66d4ce66089f59d254d8f5812dcef15d.js","/sense-app-demo/_expo/static/js/web/_layout-a2b9abd3104500a45d604f839fbe621b.js","/sense-app-demo/_expo/static/js/web/_layout-affe81e13b3c7622b8210594a0205276.js","/sense-app-demo/_expo/static/js/web/_layout-bdf5fa9191fdb46e2f6b048d0b0de0ee.js","/sense-app-demo/_expo/static/js/web/_layout-ca8d2141b318aa325452b7be21b74267.js","/sense-app-demo/_expo/static/js/web/_layout-d5eac3e21b1cbd258d6dfbefe5fcb46a.js","/sense-app-demo/_expo/static/js/web/_layout-e466915a5bb686bdcccb980968fb33c9.js","/sense-app-demo/_expo/static/js/web/age-gate-810bb17e8a3744bd2811dbc3eab5b412.js","/sense-app-demo/_expo/static/js/web/butikker-dbf87bbd26801788f56f58a8741e3659.js","/sense-app-demo/_expo/static/js/web/cart-6fcb5acf0333d783e1e2396fd9b5b0f4.js","/sense-app-demo/_expo/static/js/web/checkin-a66d2361790c0f7c123ed951f4f694be.js","/sense-app-demo/_expo/static/js/web/collection-82dd54f3353b470aa5ce9f8aa62b388c.js","/sense-app-demo/_expo/static/js/web/coupons-577fee6e287e2f5a4863866b379a9ac7.js","/sense-app-demo/_expo/static/js/web/daily-96aa517364920d43dbb43606ab79308e.js","/sense-app-demo/_expo/static/js/web/deals-cab3425e4e0fccea0da7176190b88976.js","/sense-app-demo/_expo/static/js/web/delete-account-5e49840a9a19bdf8d69bb874eda99e4a.js","/sense-app-demo/_expo/static/js/web/demo-6367ff38538594a4397bf76013bfad9f.js","/sense-app-demo/_expo/static/js/web/entry-fe486abc7e2733278b4c500f78b25e7d.js","/sense-app-demo/_expo/static/js/web/favorites-eba648e8e07f12539b9ae8c0576b9058.js","/sense-app-demo/_expo/static/js/web/forgot-e3b91b9792538617b0af8b45abae630f.js","/sense-app-demo/_expo/static/js/web/help-8cbfc70ec78af1e1764382b9675d792a.js","/sense-app-demo/_expo/static/js/web/history-1cc0b34aa25ea8166de705554d7b9ae4.js","/sense-app-demo/_expo/static/js/web/index-473a2d70b623ee9bd5eb699ecbf36cb3.js","/sense-app-demo/_expo/static/js/web/index-665d6b6accd1ff107fe67c251aee3d59.js","/sense-app-demo/_expo/static/js/web/index-8009577a989a398fc54e350493a5b3e0.js","/sense-app-demo/_expo/static/js/web/index-d04100905b8686362621ca35eaad7b04.js","/sense-app-demo/_expo/static/js/web/index-ddd314b97f4cd1e03f517c194d7ef3b2.js","/sense-app-demo/_expo/static/js/web/index-f48ac5e080b0649a1fe0cd6a9db4ad66.js","/sense-app-demo/_expo/static/js/web/install-70cde5722040384bd0f9dec1a018bb13.js","/sense-app-demo/_expo/static/js/web/login-7aeeec339c1dd88ebf449329667f888e.js","/sense-app-demo/_expo/static/js/web/orders-eac0cd0bf2d5d7cc6b6b84e856651249.js","/sense-app-demo/_expo/static/js/web/quiz-cb93d824768874fb9c887986331c9c42.js","/sense-app-demo/_expo/static/js/web/register-8e65843fd9c48969d4368f5b40c75d94.js","/sense-app-demo/_expo/static/js/web/return-dcf1d776573c76d0cf66c1907fa0b938.js","/sense-app-demo/_expo/static/js/web/rings-91f08c967ad225be7df46e5885bc9c15.js","/sense-app-demo/_expo/static/js/web/scratch-0c26fae64ba9aef62a3d9648c7ca9c82.js","/sense-app-demo/_expo/static/js/web/settings-9c7317229221a720e57e66e52c5372be.js","/sense-app-demo/_expo/static/js/web/terms-4ef0349fda9a5b604d7a3c8da55464ff.js","/sense-app-demo/_expo/static/css/maplibre-gl-251fdbfda84eb147f0a36795135ef43b.css","/sense-app-demo/assets/assets/fonts/Ionicons-sense.a5028e9f6aba4cfd6914d9d533159cf2.woff2","/sense-app-demo/assets/assets/fonts/Manrope_200ExtraLight.9c2d9cdda30048a29c705729a3caac8b.woff2","/sense-app-demo/assets/assets/fonts/Manrope_300Light.d6c2f465e6e5fdc6e79466e290285da1.woff2","/sense-app-demo/assets/assets/fonts/Manrope_400Regular.68cece1777ddfa1e687547f1d426cb08.woff2","/sense-app-demo/assets/assets/fonts/Poppins_600SemiBold.73ab67c348fbe8000b0d6df65ec660f4.woff2","/sense-app-demo/assets/assets/fonts/Poppins_800ExtraBold.000a3fca4f9d2290c1f35b8bf52412f3.woff2","/sense-app-demo/assets/assets/ikoner/kat_alle.2fafc122a1126bfeb9f815867965d73d.png","/sense-app-demo/assets/assets/ikoner/kat_bestsellers.c97047ff7912c9227cb2fac7658f03c0.png","/sense-app-demo/assets/assets/ikoner/kat_ekstrakter.e965e21098d71ea4edfa0d2fdf75d200.png","/sense-app-demo/assets/assets/ikoner/kat_grinders.d8e5150f6b8258b52f319e699ef048ce.png","/sense-app-demo/assets/assets/ikoner/kat_gummies.d73dbbb91e3fd65d062e5e096f7a7c4e.png","/sense-app-demo/assets/assets/ikoner/kat_hash.7d9ddac6072c5b914a9a003a686612d0.png","/sense-app-demo/assets/assets/ikoner/kat_isolat.0f1018829c9c05e51ccc6d75e59e7a3c.png","/sense-app-demo/assets/assets/ikoner/kat_kampagner.791b524831ec190cb55102f99befb58a.png","/sense-app-demo/assets/assets/ikoner/kat_olier.b9b704633c142da58b3b48256d5eab51.png","/sense-app-demo/assets/assets/ikoner/kat_papir_filter.70c14b6b17df5010c00e88f6db2a1e01.png","/sense-app-demo/assets/assets/ikoner/kat_popcorn.39aeddbc54ccf335c7d52c4f41cc0bcb.png","/sense-app-demo/assets/assets/ikoner/kat_pre_rolls.414d60050dba3878a4824d4abb753a11.png","/sense-app-demo/assets/assets/ikoner/kat_rocks.18cc312c27b767498d4668fd264bc019.png","/sense-app-demo/assets/assets/ikoner/kat_stof.6b6154e6808ca7838ca60b21dffcf314.png","/sense-app-demo/assets/assets/ikoner/kat_tilbehoer.8b6b7d5d6cfccde726536abcb1a149cd.png","/sense-app-demo/assets/assets/ikoner/kat_topskud.a3aebf5124051a98dd0969149f9cc803.png","/sense-app-demo/assets/assets/ikoner/kat_trim.ab65ef0265b666e9ece62c8ff93ab987.png","/sense-app-demo/assets/assets/ikoner/kat_vaegte.476ae15a5267975601513443719be6bf.png","/sense-app-demo/assets/assets/ikoner/laast.f5d637740156a9110e15f10067bd56a1.png","/sense-app-demo/assets/assets/ikoner/point_moent.9761367789e0560a5730705e227c3a90.png","/sense-app-demo/assets/assets/ikoner/rabat_maerke.ba504244dde669115d9273b681906e93.png","/sense-app-demo/assets/assets/ikoner/tab_beloenninger.cc89eeefa60f722b33be505ce67b0c2d.png","/sense-app-demo/assets/assets/ikoner/tab_hjem.4e9aeba6ffbd463296268bc83a017e76.png","/sense-app-demo/assets/assets/ikoner/tab_profil.91f1b298ead80881dd50ee32b90a6256.png","/sense-app-demo/assets/assets/ikoner/tab_shop.f502e7170a4eb2244d2330e5968e8da0.png","/sense-app-demo/assets/assets/ikoner/tab_spil.c756466054e335264d020397480f3752.png","/sense-app-demo/assets/assets/ikoner/type_fast_rabat.43202e0090fe858c5b154506ab888d25.png","/sense-app-demo/assets/assets/ikoner/type_gratis_fragt.6213127533a3ed9a81b55f3e88396a4f.png","/sense-app-demo/assets/assets/ikoner/type_gratis_produkt.6625e23efffd6717b7fb8e43aaa1319d.png","/sense-app-demo/assets/assets/ikoner/type_procent.f220c9ee441f7e528c074a542fe2e1b7.png"];
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
    // Filer med endelse (manifest, billeder …) åbnet direkte: almindelig hentning.
    if (/\.[a-z0-9]+$/i.test(url.pathname) && !url.pathname.endsWith('.html')) return;
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
    // Live-QC K1: appen er en SPA (alle ruter har samme HTML). Hent altid app-skallen (INDEX = 200) i stedet for den
    // dybe URL, som statisk hosting (GitHub Pages) besvarer med 404.html og status 404 → console-fejl ved hver
    // reload/dybt link. Adressen i browseren er stadig den dybe URL, så routeren viser den rigtige skærm.
    const res = await fetch(INDEX, { cache: 'no-cache', credentials: 'same-origin' });
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
