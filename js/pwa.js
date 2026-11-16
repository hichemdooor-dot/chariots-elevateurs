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
  let modal = null;
  const SEEN_KEY = "sbi-install-announcement-seen-v1";
  function isStandalone() {
    return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || !!window.navigator.standalone;
  }
  function rememberSeen(frequency) {
    try {
      const value = frequency === "once" ? "once" : new Date().toISOString().slice(0, 10);
      localStorage.setItem(SEEN_KEY, value);
    } catch (_) {}
  }
  function wasSeen(frequency) {
    if (frequency === "always") return false;
    try {
      const value = localStorage.getItem(SEEN_KEY);
      if (!value) return false;
      return frequency === "once" ? value === "once" : value === new Date().toISOString().slice(0, 10);
    } catch (_) { return false; }
  }
  function closeModal(frequency) {
    if (frequency) rememberSeen(frequency);
    if (modal) modal.remove();
    modal = null;
  }
  function installInstructions() {
    const ua = navigator.userAgent || "";
    if (/iphone|ipad|ipod/i.test(ua)) return [
      "Ouvrez SBI dans Safari.",
      "Appuyez sur Partager (□↑).",
      "Choisissez « Sur l’écran d’accueil », puis « Ajouter »."
    ];
    if (/android/i.test(ua)) return [
      "Ouvrez le menu Chrome (⋮).",
      "Appuyez sur « Installer l’application » ou « Ajouter à l’écran d’accueil ».",
      "Confirmez, puis ouvrez SBI depuis votre écran d’accueil."
    ];
    return [
      "Ouvrez le menu de Chrome ou Edge (⋮).",
      "Choisissez « Installer SBI » ou « Installer cette application ».",
      "Confirmez pour ajouter SBI à votre ordinateur."
    ];
  }
  function showAnnouncement(config) {
    if (modal || isStandalone() || wasSeen(config.frequency)) return;
    const overlay = document.createElement("div");
    overlay.className = "sbi-install-overlay";
    overlay.setAttribute("role", "presentation");
    const dialog = document.createElement("section");
    dialog.className = "sbi-install-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "sbi-install-title");
    const close = document.createElement("button");
    close.className = "sbi-install-close";
    close.type = "button";
    close.setAttribute("aria-label", "Fermer");
    close.textContent = "×";
    close.addEventListener("click", () => closeModal(config.frequency));
    const mark = document.createElement("div");
    mark.className = "sbi-install-mark";
    mark.textContent = "SBI";
    const title = document.createElement("h2");
    title.id = "sbi-install-title";
    title.textContent = config.title;
    const message = document.createElement("p");
    message.textContent = config.message;
    const stepsTitle = document.createElement("h3");
    stepsTitle.textContent = "Comment installer ?";
    const steps = document.createElement("ol");
    installInstructions().forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      steps.appendChild(li);
    });
    const note = document.createElement("p");
    note.className = "sbi-install-note";
    note.textContent = "L’installation est gratuite. SBI continuera à utiliser Internet pour accéder au stock et aux données.";
    const action = document.createElement("button");
    action.className = "sbi-install-action";
    action.type = "button";
    action.textContent = installPrompt ? "Installer maintenant" : "Compris";
    action.addEventListener("click", async () => {
      if (installPrompt) {
        const promptEvent = installPrompt;
        installPrompt = null;
        try {
          await promptEvent.prompt();
          await promptEvent.userChoice;
        } catch (error) {
          console.warn("[SBI PWA] Install prompt unavailable:", error);
        }
      }
      closeModal(config.frequency);
    });
    dialog.append(close, mark, title, message, stepsTitle, steps, note, action);
    overlay.appendChild(dialog);
    overlay.addEventListener("click", event => {
      if (event.target === overlay) closeModal(config.frequency);
    });
    const style = document.createElement("style");
    style.textContent = ".sbi-install-overlay{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(4,17,29,.72);box-sizing:border-box}.sbi-install-dialog{position:relative;width:min(100%,440px);max-height:calc(100dvh - 32px);overflow:auto;box-sizing:border-box;padding:25px 22px 20px;border-radius:20px;background:#fff;color:#162b3b;box-shadow:0 24px 70px rgba(0,0,0,.32);font:15px/1.5 Arial,sans-serif}.sbi-install-close{position:absolute;right:13px;top:10px;border:0;background:transparent;color:#5b6a76;font-size:29px;line-height:1;cursor:pointer}.sbi-install-mark{display:grid;place-items:center;width:54px;height:54px;border-radius:15px;background:#0b2940;color:#f5a623;font-weight:900;font-size:20px;letter-spacing:1px}.sbi-install-dialog h2{margin:16px 34px 8px 0;font-size:23px;line-height:1.2;color:#0b2940}.sbi-install-dialog p{margin:8px 0 15px;color:#435565}.sbi-install-dialog h3{margin:17px 0 8px;font-size:16px;color:#0b2940}.sbi-install-dialog ol{margin:0;padding-left:22px}.sbi-install-dialog li{padding:3px 0;color:#263d4e}.sbi-install-note{margin-top:15px!important;padding:10px 12px;border-radius:10px;background:#eef3f6;font-size:12px!important}.sbi-install-action{display:block;width:100%;margin-top:17px;padding:13px 16px;border:0;border-radius:11px;background:#f5a623;color:#0b2940;font-size:15px;font-weight:800;cursor:pointer}@media(max-width:420px){.sbi-install-dialog{padding:22px 18px 17px}.sbi-install-dialog h2{font-size:21px}}";
    if (!document.getElementById("sbi-install-announcement-style")) {
      style.id = "sbi-install-announcement-style";
      head.appendChild(style);
    }
    document.body.appendChild(overlay);
    modal = overlay;
  }
  async function loadAnnouncement(attempt) {
    if (isStandalone()) return;
    if (typeof supabaseClient === "undefined") {
      if (attempt < 20) window.setTimeout(() => loadAnnouncement(attempt + 1), 400);
      return;
    }
    try {
      const { data, error } = await supabaseClient
        .from("sbi_app_install_announcement")
        .select("enabled,title,message,frequency")
        .eq("id", "global")
        .maybeSingle();
      if (error) throw error;
      if (data && data.enabled) showAnnouncement({
        title: String(data.title || "Installez SBI sur votre téléphone !"),
        message: String(data.message || "Accédez à SBI directement depuis votre écran d’accueil."),
        frequency: ["always", "daily", "once"].includes(data.frequency) ? data.frequency : "daily"
      });
    } catch (error) {
      console.warn("[SBI PWA] Announcement settings unavailable:", error);
    }
  }

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    if (modal) {
      const button = modal.querySelector(".sbi-install-action");
      if (button) button.textContent = "Installer maintenant";
    }
  });
  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    closeModal();
    console.info("[SBI PWA] Application installed.");
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => loadAnnouncement(0), { once: true });
  } else {
    loadAnnouncement(0);
  }
})();
