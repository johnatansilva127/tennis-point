/* Tennis Point — Service Worker v2.0 (pass-through, sem cache)
   Existe só pra habilitar o prompt "Instalar app" no Android Chrome.
   Não guarda nada em cache; toda request vai direto pra rede. */

self.addEventListener('install', (e) => { self.skipWaiting(); });

self.addEventListener('activate', (e) => {
  // Limpa qualquer cache deixado por versões anteriores do SW
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
         .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Pass-through explícito — sem isso, Chrome ignora o SW pro prompt de install
  e.respondWith(fetch(e.request));
});
