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
const VERSION = "6c262bef153f";
const PRECACHE = ["/sense-app-demo/_expo/static/js/web/+not-found-38963be886716f8d1bbb29f0aa09ac66.js","/sense-app-demo/_expo/static/js/web/[doc]-8b7324721bde1cd92b077ca99d6d5eb9.js","/sense-app-demo/_expo/static/js/web/[id]-826ee567bc04936b2f44c3238b70d522.js","/sense-app-demo/_expo/static/js/web/[id]-c507e9455f1ac6080d52f945f7e3088d.js","/sense-app-demo/_expo/static/js/web/[id]-cdeda15239065f5cafa83910229f4c79.js","/sense-app-demo/_expo/static/js/web/[id]-d1db24b565005efbca3eeb5f410166ff.js","/sense-app-demo/_expo/static/js/web/[id]-e8633612e0d69d8a2d9bd4220a5d1579.js","/sense-app-demo/_expo/static/js/web/__common-7e264aff6a550cf199f490ad6c58f492.js","/sense-app-demo/_expo/static/js/web/__expo-metro-runtime-8c088df87a31e4e6accd81c554ec290d.js","/sense-app-demo/_expo/static/js/web/_layout-2f71069c152971542ee5067fc45e2bcf.js","/sense-app-demo/_expo/static/js/web/_layout-3b787734a0ad5964ac5c7c8497eed7ce.js","/sense-app-demo/_expo/static/js/web/_layout-685ae90b473acd895b05510883db9c3b.js","/sense-app-demo/_expo/static/js/web/_layout-7c5d3c21e1a8159c7bc7db29278f5217.js","/sense-app-demo/_expo/static/js/web/_layout-82bdcd8e8ec7a5119cdf0312d2f02032.js","/sense-app-demo/_expo/static/js/web/_layout-a5eef7f7aaa0868a48505c371bb5528e.js","/sense-app-demo/_expo/static/js/web/_layout-e466915a5bb686bdcccb980968fb33c9.js","/sense-app-demo/_expo/static/js/web/age-gate-91bec5c75116d8f30aeeb7c710cddefd.js","/sense-app-demo/_expo/static/js/web/butikker-c24faa1452718e3d8c09e39496476acd.js","/sense-app-demo/_expo/static/js/web/cart-52bfc4b5d235ee7215c8dfcbc6d4022b.js","/sense-app-demo/_expo/static/js/web/checkin-1adb24c73a3b910956b87d8869064199.js","/sense-app-demo/_expo/static/js/web/collection-fcef5fba13ab4a3a4fe18239b4de3df0.js","/sense-app-demo/_expo/static/js/web/coupons-bcc6bcd8216ab2a3f3158ae61af796d3.js","/sense-app-demo/_expo/static/js/web/daily-574d90449c64d2563d61e32342180b9a.js","/sense-app-demo/_expo/static/js/web/deals-b606e8fc0100836a1a15ae4d5f61c6ed.js","/sense-app-demo/_expo/static/js/web/delete-account-af1ec6a7af434015e7718781f5464a4a.js","/sense-app-demo/_expo/static/js/web/demo-8a37de05017cf8603b86bd82a28df892.js","/sense-app-demo/_expo/static/js/web/entry-945dedd439d7068c62bfe09df96b6ce6.js","/sense-app-demo/_expo/static/js/web/favorites-2a601a594a74cfb15a48a84afb115026.js","/sense-app-demo/_expo/static/js/web/forgot-d428938d4b43f52c857ecdf9004c5678.js","/sense-app-demo/_expo/static/js/web/help-92624779be542ba57df8be86c20d9349.js","/sense-app-demo/_expo/static/js/web/history-65769f78979db678192f3e967a9ec682.js","/sense-app-demo/_expo/static/js/web/index-020c0988569d63d7bb3bba0eab3e63b9.js","/sense-app-demo/_expo/static/js/web/index-2b056519474c26ae4cb76122f131226b.js","/sense-app-demo/_expo/static/js/web/index-d04100905b8686362621ca35eaad7b04.js","/sense-app-demo/_expo/static/js/web/index-dd6a4df9e10026393d06aad65dd503d8.js","/sense-app-demo/_expo/static/js/web/index-e5813248db6558c7dff5027eba3e4605.js","/sense-app-demo/_expo/static/js/web/index-fcbc82b8c82313679aa3e29c30501852.js","/sense-app-demo/_expo/static/js/web/install-c8fe8ca329d7f70f8f212b1e1ffd920a.js","/sense-app-demo/_expo/static/js/web/login-4e454e1c8ef1b7c277cf62b758671a6c.js","/sense-app-demo/_expo/static/js/web/orders-8bbf575d0ab100dbac3b48e8a0663740.js","/sense-app-demo/_expo/static/js/web/quiz-c141581a90c660b0db9dfbd3494b060d.js","/sense-app-demo/_expo/static/js/web/register-148249a1a1e50528d89ef624b73525a6.js","/sense-app-demo/_expo/static/js/web/return-925c82e8a70b1c445d7bead3d88b2d86.js","/sense-app-demo/_expo/static/js/web/rings-db89555aecc7050642493126e6806eba.js","/sense-app-demo/_expo/static/js/web/scratch-9b64f6c4bf2c0a83e20112e009d738e0.js","/sense-app-demo/_expo/static/js/web/settings-4c125706b8318d74b1a72cc95de00a9c.js","/sense-app-demo/_expo/static/js/web/terms-f4743d61a104eecca158e150a6f7ff1d.js","/sense-app-demo/_expo/static/css/maplibre-gl-251fdbfda84eb147f0a36795135ef43b.css","/sense-app-demo/assets/assets/fonts/Ionicons-sense.a5028e9f6aba4cfd6914d9d533159cf2.woff2","/sense-app-demo/assets/assets/fonts/Manrope_200ExtraLight.9c2d9cdda30048a29c705729a3caac8b.woff2","/sense-app-demo/assets/assets/fonts/Manrope_300Light.d6c2f465e6e5fdc6e79466e290285da1.woff2","/sense-app-demo/assets/assets/fonts/Manrope_400Regular.68cece1777ddfa1e687547f1d426cb08.woff2","/sense-app-demo/assets/assets/fonts/Poppins_600SemiBold.73ab67c348fbe8000b0d6df65ec660f4.woff2","/sense-app-demo/assets/assets/fonts/Poppins_800ExtraBold.000a3fca4f9d2290c1f35b8bf52412f3.woff2","/sense-app-demo/assets/assets/ikoner/kat_alle.2fafc122a1126bfeb9f815867965d73d.png","/sense-app-demo/assets/assets/ikoner/kat_bestsellers.c97047ff7912c9227cb2fac7658f03c0.png","/sense-app-demo/assets/assets/ikoner/kat_ekstrakter.e965e21098d71ea4edfa0d2fdf75d200.png","/sense-app-demo/assets/assets/ikoner/kat_grinders.d8e5150f6b8258b52f319e699ef048ce.png","/sense-app-demo/assets/assets/ikoner/kat_gummies.d73dbbb91e3fd65d062e5e096f7a7c4e.png","/sense-app-demo/assets/assets/ikoner/kat_hash.7d9ddac6072c5b914a9a003a686612d0.png","/sense-app-demo/assets/assets/ikoner/kat_isolat.0f1018829c9c05e51ccc6d75e59e7a3c.png","/sense-app-demo/assets/assets/ikoner/kat_kampagner.791b524831ec190cb55102f99befb58a.png","/sense-app-demo/assets/assets/ikoner/kat_olier.b9b704633c142da58b3b48256d5eab51.png","/sense-app-demo/assets/assets/ikoner/kat_papir_filter.70c14b6b17df5010c00e88f6db2a1e01.png","/sense-app-demo/assets/assets/ikoner/kat_popcorn.39aeddbc54ccf335c7d52c4f41cc0bcb.png","/sense-app-demo/assets/assets/ikoner/kat_pre_rolls.414d60050dba3878a4824d4abb753a11.png","/sense-app-demo/assets/assets/ikoner/kat_rocks.18cc312c27b767498d4668fd264bc019.png","/sense-app-demo/assets/assets/ikoner/kat_stof.6b6154e6808ca7838ca60b21dffcf314.png","/sense-app-demo/assets/assets/ikoner/kat_tilbehoer.8b6b7d5d6cfccde726536abcb1a149cd.png","/sense-app-demo/assets/assets/ikoner/kat_topskud.a3aebf5124051a98dd0969149f9cc803.png","/sense-app-demo/assets/assets/ikoner/kat_trim.ab65ef0265b666e9ece62c8ff93ab987.png","/sense-app-demo/assets/assets/ikoner/kat_vaegte.476ae15a5267975601513443719be6bf.png","/sense-app-demo/assets/assets/ikoner/laast.f5d637740156a9110e15f10067bd56a1.png","/sense-app-demo/assets/assets/ikoner/point_moent.9761367789e0560a5730705e227c3a90.png","/sense-app-demo/assets/assets/ikoner/rabat_maerke.ba504244dde669115d9273b681906e93.png","/sense-app-demo/assets/assets/ikoner/tab_beloenninger.cc89eeefa60f722b33be505ce67b0c2d.png","/sense-app-demo/assets/assets/ikoner/tab_hjem.4e9aeba6ffbd463296268bc83a017e76.png","/sense-app-demo/assets/assets/ikoner/tab_profil.91f1b298ead80881dd50ee32b90a6256.png","/sense-app-demo/assets/assets/ikoner/tab_shop.f502e7170a4eb2244d2330e5968e8da0.png","/sense-app-demo/assets/assets/ikoner/tab_spil.c756466054e335264d020397480f3752.png","/sense-app-demo/assets/assets/ikoner/type_fast_rabat.43202e0090fe858c5b154506ab888d25.png","/sense-app-demo/assets/assets/ikoner/type_gratis_fragt.6213127533a3ed9a81b55f3e88396a4f.png","/sense-app-demo/assets/assets/ikoner/type_gratis_produkt.6625e23efffd6717b7fb8e43aaa1319d.png","/sense-app-demo/assets/assets/ikoner/type_procent.f220c9ee441f7e528c074a542fe2e1b7.png"];
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
