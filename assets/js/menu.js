(function () {
  "use strict";

  let pages = [];
  let currentIndex = 0;
  let modalIndex = 0;
  let zoom = 1;
  let lastFocused = null;

  const $ = (id) => document.getElementById(id);

  function setCurrent(index) {
    currentIndex = Math.max(0, Math.min(index, pages.length - 1));
    const current = $("visualCurrent");
    if (current) current.textContent = String(currentIndex + 1);
    document.querySelectorAll(".gallery-dot").forEach((dot, i) => {
      dot.classList.toggle("active", i === currentIndex);
      dot.setAttribute("aria-current", i === currentIndex ? "true" : "false");
    });
  }

  function scrollToPage(index) {
    const gallery = $("visualGallery");
    const card = gallery?.children[index];
    if (card) card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    setCurrent(index);
  }

  function updateFromScroll() {
    const gallery = $("visualGallery");
    if (!gallery || !gallery.children.length) return;
    const left = gallery.getBoundingClientRect().left;
    let nearest = 0;
    let distance = Infinity;
    Array.from(gallery.children).forEach((card, index) => {
      const d = Math.abs(card.getBoundingClientRect().left - left);
      if (d < distance) { distance = d; nearest = index; }
    });
    setCurrent(nearest);
  }

  function applyZoom() {
    const img = $("modalImage");
    if (img) img.style.transform = `scale(${zoom})`;
  }

  function updateModal(index) {
    if (!pages.length) return;
    modalIndex = (index + pages.length) % pages.length;
    const page = pages[modalIndex];
    const img = $("modalImage");
    if (img) {
      img.src = page.src;
      img.alt = page.alt;
      img.width = 864;
      img.height = page.id === "entradas" ? 470 : 1216;
    }
    $("modalTitle").textContent = page.title;
    $("modalPageNumber").textContent = String(modalIndex + 1);
    $("modalPageTotal").textContent = String(pages.length);
    zoom = 1;
    applyZoom();
    const wrap = $("modalImageWrap");
    if (wrap) { wrap.scrollTop = 0; wrap.scrollLeft = 0; }
  }

  function openModal(index, trigger) {
    const modal = $("menuModal");
    if (!modal) return;
    lastFocused = trigger || document.activeElement;
    updateModal(index);
    document.body.classList.add("modal-open");
    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
    requestAnimationFrame(() => $("modalClose")?.focus());
  }

  function closeModal() {
    const modal = $("menuModal");
    if (!modal) return;
    if (typeof modal.close === "function" && modal.open) modal.close();
    else modal.removeAttribute("open");
    document.body.classList.remove("modal-open");
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  function renderGallery() {
    const gallery = $("visualGallery");
    const dots = $("galleryDots");
    if (!gallery || !dots) return;
    gallery.innerHTML = "";
    dots.innerHTML = "";

    pages.forEach((page, index) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = `visual-card${page.id === "entradas" ? " landscape" : ""}`;
      card.setAttribute("aria-label", `Abrir página ${index + 1}: ${page.title}`);

      const img = document.createElement("img");
      img.src = page.thumb;
      img.alt = page.alt;
      img.width = 360;
      img.height = 500;
      img.loading = index < 2 ? "eager" : "lazy";
      img.decoding = "async";

      const meta = document.createElement("span");
      meta.className = "visual-card-meta";
      meta.innerHTML = `<span><small>Página ${String(index + 1).padStart(2, "0")}</small><strong>${page.title}</strong></span><svg aria-hidden="true"><use href="#i-expand"/></svg>`;

      card.append(img, meta);
      card.addEventListener("click", () => openModal(index, card));
      gallery.appendChild(card);

      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `gallery-dot${index === 0 ? " active" : ""}`;
      dot.setAttribute("aria-label", `Ir para página ${index + 1}`);
      dot.addEventListener("click", () => scrollToPage(index));
      dots.appendChild(dot);
    });
  }

  function init(storeConfig) {
    pages = storeConfig.visualMenu || [];
    $("visualTotal").textContent = String(pages.length);
    $("modalPageTotal").textContent = String(pages.length);
    renderGallery();
    setCurrent(0);

    const gallery = $("visualGallery");
    let scrollTimer;
    gallery?.addEventListener("scroll", () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(updateFromScroll, 80);
    }, { passive: true });

    $("galleryPrev")?.addEventListener("click", () => scrollToPage(Math.max(0, currentIndex - 1)));
    $("galleryNext")?.addEventListener("click", () => scrollToPage(Math.min(pages.length - 1, currentIndex + 1)));
    $("modalPrev")?.addEventListener("click", () => updateModal(modalIndex - 1));
    $("modalNext")?.addEventListener("click", () => updateModal(modalIndex + 1));
    $("modalClose")?.addEventListener("click", closeModal);
    $("zoomIn")?.addEventListener("click", () => { zoom = Math.min(2.5, +(zoom + .25).toFixed(2)); applyZoom(); });
    $("zoomOut")?.addEventListener("click", () => { zoom = Math.max(.75, +(zoom - .25).toFixed(2)); applyZoom(); });

    const modal = $("menuModal");
    modal?.addEventListener("cancel", (event) => { event.preventDefault(); closeModal(); });
    modal?.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });

    document.addEventListener("keydown", (event) => {
      if (!modal?.open) return;
      if (event.key === "ArrowLeft") { event.preventDefault(); updateModal(modalIndex - 1); }
      if (event.key === "ArrowRight") { event.preventDefault(); updateModal(modalIndex + 1); }
      if (event.key === "Escape") { event.preventDefault(); closeModal(); }
    });

    let touchStartX = 0;
    let touchStartY = 0;
    $("modalStage")?.addEventListener("touchstart", (event) => {
      const touch = event.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }, { passive: true });
    $("modalStage")?.addEventListener("touchend", (event) => {
      if (zoom > 1.05) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        updateModal(dx < 0 ? modalIndex + 1 : modalIndex - 1);
      }
    }, { passive: true });
  }

  window.PaiDAguaMenu = { init, openModal };
})();
