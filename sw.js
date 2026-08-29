/* =========================================================
   GUESS THE NUMBER — SERVICE WORKER
   ========================================================= */

"use strict";

const CACHE_NAME = "guess-the-number-neon-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json"
];

/* =========================================================
   INSTALL
   ========================================================= */

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_FILES);
    })
  );

  // Permite que la nueva versión pueda activarse
  // sin esperar a cerrar todas las pestañas.
  self.skipWaiting();
});

/* =========================================================
   ACTIVATE
   ========================================================= */

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return (
              cacheName.startsWith("guess-the-number-neon-") &&
              cacheName !== CACHE_NAME
            );
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
  );

  // Hace que el Service Worker controle inmediatamente
  // las páginas abiertas dentro de su alcance.
  self.clients.claim();
});

/* =========================================================
   FETCH
   ========================================================= */

self.addEventListener("fetch", (event) => {
  // Solo manejamos solicitudes GET.
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. Si existe en caché, usarlo.
      if (cachedResponse) {
        return cachedResponse;
      }

      // 2. Si no existe, intentar obtenerlo de Internet.
      return fetch(event.request).then((networkResponse) => {
        // Solo guardar respuestas válidas.
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === "basic"
        ) {
          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return networkResponse;
      });
    })
  );
});
