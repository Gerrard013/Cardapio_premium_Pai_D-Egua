(function () {
  "use strict";

  let deferredPrompt = null;

  function init(config) {
    if (!config.features?.pwa) return;

    if ("serviceWorker" in navigator && location.protocol !== "file:") {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js").catch(() => {
          // Site remains fully functional without service worker.
        });
      });
    }

    const prompt = document.getElementById("installPrompt");
    const install = document.getElementById("installButton");
    const dismiss = document.getElementById("dismissInstall");

    let revealTimer = null;
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredPrompt = event;
      if (sessionStorage.getItem("paidegua:install-dismissed") === "1" || !prompt) return;
      clearTimeout(revealTimer);
      revealTimer = setTimeout(() => {
        if (deferredPrompt && sessionStorage.getItem("paidegua:install-dismissed") !== "1") prompt.hidden = false;
      }, 12000);
    });

    install?.addEventListener("click", async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      if (prompt) prompt.hidden = true;
    });

    dismiss?.addEventListener("click", () => {
      clearTimeout(revealTimer);
      if (prompt) prompt.hidden = true;
      sessionStorage.setItem("paidegua:install-dismissed", "1");
    });

    window.addEventListener("appinstalled", () => {
      deferredPrompt = null;
      if (prompt) prompt.hidden = true;
    });
  }

  window.PaiDAguaPWA = { init };
})();
