(function () {
  "use strict";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function updateProgress() {
    const bar = document.getElementById("scrollProgressBar");
    if (!bar) return;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / max));
    bar.style.transform = `scaleX(${progress})`;
  }
  function initReveal() {
    const selector = ".section-heading, .unit-layout, .product-card, .visual-card, .contact-grid";
    const seen = new WeakSet();
    const observer = !reducedMotion && "IntersectionObserver" in window
      ? new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        }, { rootMargin: "0px 0px -8%", threshold: .08 })
      : null;
    const observeNew = (root = document) => {
      root.querySelectorAll?.(selector).forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        element.classList.add("m2-reveal");
        if (observer) observer.observe(element);
        else element.classList.add("is-visible");
      });
    };
    observeNew();
    const productGrid = document.getElementById("productGrid");
    if (productGrid && "MutationObserver" in window) {
      new MutationObserver(() => observeNew(productGrid)).observe(productGrid, { childList: true, subtree: true });
    }
  }
  function initHeroDepth() {
    if (reducedMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const visual = document.querySelector(".hero-visual");
    if (!visual) return;
    visual.addEventListener("pointermove", (event) => {
      const rect = visual.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - .5) * 7;
      const y = ((event.clientY - rect.top) / rect.height - .5) * 7;
      visual.style.setProperty("--hero-x", `${x}px`);
      visual.style.setProperty("--hero-y", `${y}px`);
    }, { passive: true });
    visual.addEventListener("pointerleave", () => {
      visual.style.setProperty("--hero-x", "0px");
      visual.style.setProperty("--hero-y", "0px");
    });
  }
  function init() {
    document.body.classList.add("modelo-2-ready");
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    initReveal();
    initHeroDepth();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
