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
const VERSION = "ceff19d44185";
const PRECACHE = ["/sense-app-demo/_expo/static/js/web/+not-found-38963be886716f8d1bbb29f0aa09ac66.js","/sense-app-demo/_expo/static/js/web/[doc]-5e1fe8a06eac9e4966447dfd43a157a0.js","/sense-app-demo/_expo/static/js/web/[id]-10659d5b0337ddaf46313a0d74dee301.js","/sense-app-demo/_expo/static/js/web/[id]-266be4bfb86fe07ef54306a16d6965ca.js","/sense-app-demo/_expo/static/js/web/[id]-337964e41831f0ef255a447a19055a43.js","/sense-app-demo/_expo/static/js/web/[id]-36b0627395e92a807f203ee944aa2a6a.js","/sense-app-demo/_expo/static/js/web/[id]-a6d664474cf820352a108e503bf0abfb.js","/sense-app-demo/_expo/static/js/web/__common-31457eb8f6e91dc168603565bb08a2f4.js","/sense-app-demo/_expo/static/js/web/__expo-metro-runtime-8c088df87a31e4e6accd81c554ec290d.js","/sense-app-demo/_expo/static/js/web/_layout-2105e4b137f4c71d446e2d01a188e14c.js","/sense-app-demo/_expo/static/js/web/_layout-8909291f71540e031e6b20f3bd8e8e00.js","/sense-app-demo/_expo/static/js/web/_layout-9298f2a24982fbe61fe1f980aeb8e0a9.js","/sense-app-demo/_expo/static/js/web/_layout-b116d7367fc46a86cc1cb085e755e201.js","/sense-app-demo/_expo/static/js/web/_layout-e40eb95ac21cabf85d217241c70b7dff.js","/sense-app-demo/_expo/static/js/web/_layout-e466915a5bb686bdcccb980968fb33c9.js","/sense-app-demo/_expo/static/js/web/_layout-ebc871a090871705812bde05f98c21ea.js","/sense-app-demo/_expo/static/js/web/age-gate-76886adfd017a8503d7dadcd332bfcec.js","/sense-app-demo/_expo/static/js/web/butikker-7b4d046963e672298c64b55aec298113.js","/sense-app-demo/_expo/static/js/web/cart-5caa629e7e9357a53ff9570f8d16a065.js","/sense-app-demo/_expo/static/js/web/checkin-7c0e9e50d4fff67c71915e7942ef76f4.js","/sense-app-demo/_expo/static/js/web/collection-7f634cf35a355abbd9edd4f7eccc0e42.js","/sense-app-demo/_expo/static/js/web/coupons-55bccea095c4788a847853920498600e.js","/sense-app-demo/_expo/static/js/web/daily-8a413df3c92f104e476afc545aabd859.js","/sense-app-demo/_expo/static/js/web/deals-344df50f0fdac453e64835e7d501a73a.js","/sense-app-demo/_expo/static/js/web/delete-account-87c1783be2af8b5c9454136ae4a4f0d5.js","/sense-app-demo/_expo/static/js/web/demo-8a37de05017cf8603b86bd82a28df892.js","/sense-app-demo/_expo/static/js/web/entry-44daac745c1d8f10bd245d1ba421b8cc.js","/sense-app-demo/_expo/static/js/web/favorites-f2371f123f7e5804c7b6f260b4a296af.js","/sense-app-demo/_expo/static/js/web/forgot-d428938d4b43f52c857ecdf9004c5678.js","/sense-app-demo/_expo/static/js/web/help-300cd4a5dec1437438f94a8421d633d9.js","/sense-app-demo/_expo/static/js/web/history-064f932efde42bbf43d7c7be7567a3e3.js","/sense-app-demo/_expo/static/js/web/index-060779661b11ff4655d2c934e47fd292.js","/sense-app-demo/_expo/static/js/web/index-9de475e1bf53a571e0c9075859c62220.js","/sense-app-demo/_expo/static/js/web/index-b5993a0882fc5d104b3a1d9f3335eadb.js","/sense-app-demo/_expo/static/js/web/index-d04100905b8686362621ca35eaad7b04.js","/sense-app-demo/_expo/static/js/web/index-d462cd4af1275bf62fc80f999c9d0cc1.js","/sense-app-demo/_expo/static/js/web/index-dfbbbfbd4bb0ed560abf7cde36c3955e.js","/sense-app-demo/_expo/static/js/web/install-2321748c8e4d4dfe175644351922c9ca.js","/sense-app-demo/_expo/static/js/web/login-4e454e1c8ef1b7c277cf62b758671a6c.js","/sense-app-demo/_expo/static/js/web/orders-f96aaaffaf44e80116d921625bba42c8.js","/sense-app-demo/_expo/static/js/web/quiz-19a5214acff35cd0bdfa7fa8562dc017.js","/sense-app-demo/_expo/static/js/web/register-96304261beabccb625cb88e23e0ef492.js","/sense-app-demo/_expo/static/js/web/return-cfe6b0b9b529a030d81becfa84307fbe.js","/sense-app-demo/_expo/static/js/web/rings-2b7c9599d3bb426accb1bbadc4896ace.js","/sense-app-demo/_expo/static/js/web/scratch-a817c70947a16909d1308b15e28f836b.js","/sense-app-demo/_expo/static/js/web/settings-90aa8cbd5bd21c3cff6c2b558feb0b55.js","/sense-app-demo/_expo/static/js/web/terms-bcf00fd02dfa22398f465a892fc06248.js","/sense-app-demo/_expo/static/css/maplibre-gl-251fdbfda84eb147f0a36795135ef43b.css","/sense-app-demo/assets/assets/fonts/Ionicons-sense.a5028e9f6aba4cfd6914d9d533159cf2.woff2","/sense-app-demo/assets/assets/fonts/Manrope_200ExtraLight.9c2d9cdda30048a29c705729a3caac8b.woff2","/sense-app-demo/assets/assets/fonts/Manrope_300Light.d6c2f465e6e5fdc6e79466e290285da1.woff2","/sense-app-demo/assets/assets/fonts/Manrope_400Regular.68cece1777ddfa1e687547f1d426cb08.woff2","/sense-app-demo/assets/assets/fonts/Poppins_600SemiBold.73ab67c348fbe8000b0d6df65ec660f4.woff2","/sense-app-demo/assets/assets/fonts/Poppins_800ExtraBold.000a3fca4f9d2290c1f35b8bf52412f3.woff2","/sense-app-demo/assets/assets/ikoner/kat_alle.2fafc122a1126bfeb9f815867965d73d.png","/sense-app-demo/assets/assets/ikoner/kat_bestsellers.c97047ff7912c9227cb2fac7658f03c0.png","/sense-app-demo/assets/assets/ikoner/kat_ekstrakter.e965e21098d71ea4edfa0d2fdf75d200.png","/sense-app-demo/assets/assets/ikoner/kat_grinders.d8e5150f6b8258b52f319e699ef048ce.png","/sense-app-demo/assets/assets/ikoner/kat_gummies.d73dbbb91e3fd65d062e5e096f7a7c4e.png","/sense-app-demo/assets/assets/ikoner/kat_hash.7d9ddac6072c5b914a9a003a686612d0.png","/sense-app-demo/assets/assets/ikoner/kat_isolat.0f1018829c9c05e51ccc6d75e59e7a3c.png","/sense-app-demo/assets/assets/ikoner/kat_kampagner.791b524831ec190cb55102f99befb58a.png","/sense-app-demo/assets/assets/ikoner/kat_olier.b9b704633c142da58b3b48256d5eab51.png","/sense-app-demo/assets/assets/ikoner/kat_papir_filter.70c14b6b17df5010c00e88f6db2a1e01.png","/sense-app-demo/assets/assets/ikoner/kat_popcorn.39aeddbc54ccf335c7d52c4f41cc0bcb.png","/sense-app-demo/assets/assets/ikoner/kat_pre_rolls.414d60050dba3878a4824d4abb753a11.png","/sense-app-demo/assets/assets/ikoner/kat_rocks.18cc312c27b767498d4668fd264bc019.png","/sense-app-demo/assets/assets/ikoner/kat_stof.6b6154e6808ca7838ca60b21dffcf314.png","/sense-app-demo/assets/assets/ikoner/kat_tilbehoer.8b6b7d5d6cfccde726536abcb1a149cd.png","/sense-app-demo/assets/assets/ikoner/kat_topskud.a3aebf5124051a98dd0969149f9cc803.png","/sense-app-demo/assets/assets/ikoner/kat_trim.ab65ef0265b666e9ece62c8ff93ab987.png","/sense-app-demo/assets/assets/ikoner/kat_vaegte.476ae15a5267975601513443719be6bf.png","/sense-app-demo/assets/assets/ikoner/laast.f5d637740156a9110e15f10067bd56a1.png","/sense-app-demo/assets/assets/ikoner/point_moent.9761367789e0560a5730705e227c3a90.png","/sense-app-demo/assets/assets/ikoner/rabat_maerke.ba504244dde669115d9273b681906e93.png","/sense-app-demo/assets/assets/ikoner/tab_beloenninger.cc89eeefa60f722b33be505ce67b0c2d.png","/sense-app-demo/assets/assets/ikoner/tab_hjem.4e9aeba6ffbd463296268bc83a017e76.png","/sense-app-demo/assets/assets/ikoner/tab_profil.91f1b298ead80881dd50ee32b90a6256.png","/sense-app-demo/assets/assets/ikoner/tab_shop.f502e7170a4eb2244d2330e5968e8da0.png","/sense-app-demo/assets/assets/ikoner/tab_spil.c756466054e335264d020397480f3752.png","/sense-app-demo/assets/assets/ikoner/type_fast_rabat.43202e0090fe858c5b154506ab888d25.png","/sense-app-demo/assets/assets/ikoner/type_gratis_fragt.6213127533a3ed9a81b55f3e88396a4f.png","/sense-app-demo/assets/assets/ikoner/type_gratis_produkt.6625e23efffd6717b7fb8e43aaa1319d.png","/sense-app-demo/assets/assets/ikoner/type_procent.f220c9ee441f7e528c074a542fe2e1b7.png","/sense-app-demo/demo/backend.js"];
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
  // D26-E-001: URL-parseren gør "/\evil" og "/<tab>/evil" til en fremmed vært; kontrollér resultatet, ikke teksten.
  const parsed = new URL(`${BASE}${path}`, self.location.origin);
  const own = parsed.origin === self.location.origin && parsed.pathname.startsWith(`${BASE}/`);
  const target = own ? parsed.href : new URL(`${BASE}/`, self.location.origin).href;
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
