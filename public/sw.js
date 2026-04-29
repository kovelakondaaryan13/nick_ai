const CACHE_NAME = "nick-ai-v1";
const STATIC_CACHE = "nick-ai-static-v1";
const RECIPE_CACHE = "nick-ai-recipes-v1";
const IMAGE_CACHE = "nick-ai-images-v1";
const TTS_CACHE = "nick-ai-tts-v1";

const STATIC_ASSETS = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![CACHE_NAME, STATIC_CACHE, RECIPE_CACHE, IMAGE_CACHE, TTS_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // NetworkOnly for chat API — never cache LLM responses
  if (url.pathname === "/api/chat") return;

  // NetworkFirst with 3s timeout for other API routes
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(event.request, CACHE_NAME, 3000));
    return;
  }

  // CacheFirst for static assets
  if (
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.match(/\.(woff2?|ttf|eot)$/)
  ) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }

  // CacheFirst for images
  if (
    url.pathname.startsWith("/_next/image") ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|avif)$/)
  ) {
    event.respondWith(cacheFirst(event.request, IMAGE_CACHE));
    return;
  }

  // StaleWhileRevalidate for pages
  event.respondWith(staleWhileRevalidate(event.request, CACHE_NAME));
});

// Listen for messages from the app to cache specific resources
self.addEventListener("message", (event) => {
  if (event.data.type === "CACHE_RECIPE") {
    const { urls } = event.data;
    caches.open(RECIPE_CACHE).then((cache) => {
      urls.forEach((url) => {
        fetch(url).then((res) => {
          if (res.ok) cache.put(url, res);
        }).catch(() => {});
      });
    });
  }

  if (event.data.type === "CACHE_TTS") {
    const { text, url } = event.data;
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }).then((res) => {
      if (res.ok) {
        caches.open(TTS_CACHE).then((cache) => {
          cache.put(`/api/tts?text=${encodeURIComponent(text)}`, res);
        });
      }
    }).catch(() => {});
  }
});

async function networkFirst(request, cacheName, timeout) {
  const cache = await caches.open(cacheName);
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(id);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response('{"error":"offline"}', {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response("", { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}
