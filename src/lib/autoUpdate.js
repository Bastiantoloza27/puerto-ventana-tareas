// Mantiene la app siempre en la última versión publicada, sin caché viejo.
const SRC_RE = /src="([^"]*\/assets\/[^"]+\.js)"/;
const current = () => document.querySelector('script[type="module"][src*="/assets/"]')?.getAttribute("src");
const typing = () => /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || "");

async function latest() {
  const r = await fetch(`/?v=${Date.now()}`, { cache: "no-store" });
  return (await r.text()).match(SRC_RE)?.[1];
}

async function check(force) {
  const cur = current();
  if (!cur) return;
  const nxt = await latest().catch(() => null);
  if (!nxt || nxt === cur || (!force && typing())) return;
  if (sessionStorage.getItem("apr-upd") === nxt) return; // evita recargas en bucle
  sessionStorage.setItem("apr-upd", nxt);
  window.location.reload();
}

export function startAutoUpdate() {
  if (!import.meta.env.PROD) return;
  navigator.serviceWorker?.getRegistrations().then((rs) => rs.forEach((r) => r.unregister())).catch(() => {});
  window.caches?.keys().then((ks) => ks.forEach((k) => window.caches.delete(k))).catch(() => {});
  check(true);
  document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && check(false));
  setInterval(() => check(false), 5 * 60 * 1000);
}