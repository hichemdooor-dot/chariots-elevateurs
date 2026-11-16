(function () {
  "use strict";
  if (window.__SBI_PWA_BOOTED) return;
  window.__SBI_PWA_BOOTED = true;

  const head = document.head || document.getElementsByTagName("head")[0];
  if (head && !document.querySelector('link[rel="manifest"]')) {
    const manifest = document.createElement("link");
    manifest.rel = "manifest";
    manifest.href = new URL("./manifest.webmanifest", document.baseURI).href;
    head.appendChild(manifest);
  }
  if (head && !document.querySelector('meta[name="theme-color"]')) {
    const theme = document.createElement("meta");
    theme.name = "theme-color";
    theme.content = "#0b2940";
    head.appendChild(theme);
  }

  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register(new URL("./service-worker.js", document.baseURI), { scope: "./" })
        .then(registration => {
          registration.update().catch(() => {});
          console.info("[SBI PWA] Service worker registered:", registration.scope);
        })
        .catch(error => console.warn("[SBI PWA] Service worker registration failed:", error));
    }, { once: true });
  }

  let installPrompt = null;
  let banner = null;
  function removeBanner() {
    if (banner) banner.remove();
    banner = null;
  }
  function makeBanner(message, actionLabel, action) {
    if (banner || window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) return;
    banner = document.createElement("aside");
    banner.className = "sbi-pwa-install";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Installation de l'application SBI");
    banner.innerHTML = '<span class="sbi-pwa-mark">SBI</span><span class="sbi-pwa-copy"><strong>Installer SBI</strong><small></small></span><button type="button" class="sbi-pwa-action"></button><button type="button" class="sbi-pwa-close" aria-label="Fermer">×</button>';
    banner.querySelector("small").textContent = message;
    banner.querySelector(".sbi-pwa-action").textContent = actionLabel;
    banner.querySelector(".sbi-pwa-action").addEventListener("click", action);
    banner.querySelector(".sbi-pwa-close").addEventListener("click", removeBanner);
    document.body.appendChild(banner);
  }
  function addStyles() {
    if (document.getElementById("sbi-pwa-styles")) return;
    const style = document.createElement("style");
    style.id = "sbi-pwa-styles";
    style.textContent = '.sbi-pwa-install{position:fixed;z-index:99999;left:16px;right:16px;bottom:16px;max-width:480px;margin:auto;display:flex;align-items:center;gap:11px;padding:12px 14px;background:#0b2940;color:#fff;border:1px solid #31536b;border-radius:14px;box-shadow:0 12px 36px #06182755;font:13px/1.3 Arial,sans-serif}.sbi-pwa-mark{display:grid;place-items:center;width:42px;height:42px;flex:0 0 42px;border-radius:11px;background:#f5a623;color:#0b2940;font-weight:900}.sbi-pwa-copy{display:grid;gap:3px;flex:1;min-width:0}.sbi-pwa-copy small{color:#c5d4df;font-size:11px}.sbi-pwa-action{border:0;border-radius:9px;padding:10px 12px;background:#f5a623;color:#0b2940;font-weight:800;cursor:pointer}.sbi-pwa-close{border:0;background:transparent;color:#fff;font-size:22px;cursor:pointer;padding:2px 5px}@media(max-width:420px){.sbi-pwa-install{left:8px;right:8px;bottom:8px;gap:8px;padding:10px}.sbi-pwa-action{padding:9px;font-size:12px}}';
    head.appendChild(style);
  }

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    addStyles();
    makeBanner("Accès rapide depuis votre écran d'accueil.", "Installer", async () => {
      if (!installPrompt) return;
      installPrompt.prompt();
      await installPrompt.userChoice.catch(() => null);
      installPrompt = null;
      removeBanner();
    });
  });
  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    removeBanner();
    console.info("[SBI PWA] Application installed.");
  });

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.navigator.standalone;
  if (isIOS) {
    addStyles();
    makeBanner("Safari : Partager puis « Sur l’écran d’accueil ».", "Compris", removeBanner);
  }
})();