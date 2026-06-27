import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// ── Global handler for stale-chunk / dynamic-import errors ──
// These can fire *outside* React's ErrorBoundary (e.g. in the router).
// On first occurrence we auto-reload once; sessionStorage prevents loops.
const CHUNK_RELOAD_KEY = 'chunk_error_reload';

window.addEventListener('vite:preloadError', () => {
  const alreadyReloaded = sessionStorage.getItem(CHUNK_RELOAD_KEY);
  if (!alreadyReloaded) {
    sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
    window.location.reload();
  }
});

// Clear the flag on successful page loads so future deployments
// can still benefit from auto-reload.
window.addEventListener('load', () => {
  sessionStorage.removeItem(CHUNK_RELOAD_KEY);
});

// PWA: Guard against service worker in iframes/preview
const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
})();

const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com");

if (isPreviewHost || isInIframe) {
  navigator.serviceWorker?.getRegistrations().then((registrations) => {
    registrations.forEach((r) => r.unregister());
  });
}

createRoot(document.getElementById("root")!).render(<App />);
