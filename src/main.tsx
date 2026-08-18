import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

/**
 * Remove the legacy offline service worker that could intercept the root
 * document and return a plain-text "Offline - Page not available" response.
 * The portfolio is deployed as a normal Vite/React web app, so it should not
 * take control of navigations with a stale cache-first/offline fallback.
 */
async function removeLegacyOfflineWorker() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));

    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('ayu-vibee-'))
          .map((cacheName) => caches.delete(cacheName)),
      );
    }
  } catch (error) {
    // Cleanup is best-effort and must never prevent the portfolio from booting.
    console.warn('[PWA] Legacy service-worker cleanup skipped:', error);
  }
}

window.addEventListener('load', () => {
  void removeLegacyOfflineWorker();
});
