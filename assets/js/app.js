(function () {
  "use strict";

  const config = window.STORE_CONFIG;
  let activeCategory = "todos";
  let query = "";
  let toastTimer = null;

  const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const categoryLabel = (id) => config.categories.find((item) => item.id === id)?.label || id;

  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
  }

  function setExternalLinks() {
    document.querySelectorAll("[data-order-link]").forEach((el) => { el.href = config.links.order; });
    document.querySelectorAll("[data-instagram-link]").forEach((el) => { el.href = config.links.instagram; });
    document.querySelectorAll("[data-bio-link]").forEach((el) => { el.href = config.links.bio; });
  }

  function buildWhatsAppUrl(productName = "", context = "") {
    const unit = window.PaiDAguaUnits?.getSelectedUnit?.();
    const number = String(unit?.whatsapp || "").replace(/\D/g, "");
    if (!/^55\d{10,11}$/.test(number)) return null;
    const contextText = {
      hero: "Quero conhecer o cardápio e fazer um pedido.",
      unit: "Quero atendimento desta unidade.",
      contact: "Quero falar com a equipe.",
      footer: "Quero fazer um pedido.",
      mobile: "Quero pedir pelo celular.",
      product: productName ? `Tenho interesse em: ${productName}.` : ""
    }[context] || "";
    const details = [
      config.whatsapp.message,
      unit ? `Minha unidade selecionada é ${unit.shortName || unit.name}.` : "",
      contextText,
      productName && context !== "product" ? `Tenho interesse em: ${productName}.` : "",
      `Cardápio: ${config.links.site}`
    ].filter(Boolean).join(" ");
    return `https://wa.me/${number}?text=${encodeURIComponent(details)}`;
  }

  function updateWhatsAppLinks() {
    document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
      const productName = link.dataset.product || "";
      const context = link.dataset.whatsappContext || (productName ? "product" : "");
      const url = buildWhatsAppUrl(productName, context);
      if (url) {
        link.href = url;
        link.hidden = false;
        link.removeAttribute("aria-disabled");
        link.classList.remove("is-disabled");
      } else {
        link.removeAttribute("href");
        link.setAttribute("aria-disabled", "true");
        link.classList.add("is-disabled");
      }
    });
  }

  function handleWhatsApp(productName = "") {
    const url = buildWhatsAppUrl(productName, productName ? "product" : "");
    if (!url) {
      showToast(config.messages.whatsappMissing);
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function renderFilters() {
    const holder = document.getElementById("categoryFilters");
    if (!holder) return;
    holder.innerHTML = "";
    config.categories.forEach((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filter-chip";
      button.textContent = category.label;
      button.dataset.category = category.id;
      button.setAttribute("aria-pressed", String(category.id === activeCategory));
      button.addEventListener("click", () => {
        activeCategory = category.id;
        holder.querySelectorAll(".filter-chip").forEach((chip) => chip.setAttribute("aria-pressed", String(chip === button)));
        renderProducts();
      });
      holder.appendChild(button);
    });
  }

  function productMatches(product) {
    const categoryMatch = activeCategory === "todos"
      || (activeCategory === "destaques" && product.featured)
      || (activeCategory === "mais-pedidos" && product.popular)
      || product.category === activeCategory;

    if (!categoryMatch) return false;
    if (!query) return true;
    const haystack = normalize([product.name, product.description, product.ingredients, categoryLabel(product.category)].join(" "));
    return haystack.includes(normalize(query));
  }

  function createProductCard(product) {
    const article = document.createElement("article");
    article.className = "product-card";
    article.dataset.productId = product.id;

    const media = document.createElement("div");
    media.className = "product-media";
    const img = document.createElement("img");
    img.src = product.image;
    img.alt = product.alt;
    img.width = 1200;
    img.height = 900;
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", () => {
      media.classList.add("image-missing");
      img.remove();
      const fallback = document.createElement("span");
      fallback.textContent = "Imagem indisponível";
      media.appendChild(fallback);
    }, { once: true });
    media.appendChild(img);

    if (product.featured || product.popular) {
      const badges = document.createElement("div");
      badges.className = "product-badges";
      if (product.featured) badges.insertAdjacentHTML("beforeend", '<span class="product-badge gold">Destaque</span>');
      if (product.popular) badges.insertAdjacentHTML("beforeend", '<span class="product-badge">Mais pedido</span>');
      media.appendChild(badges);
    }

    const body = document.createElement("div");
    body.className = "product-body";
    const eyebrow = document.createElement("p");
    eyebrow.className = "product-category";
    eyebrow.textContent = categoryLabel(product.category);
    const title = document.createElement("h3");
    title.textContent = product.name;
    const description = document.createElement("p");
    description.className = "product-description";
    description.textContent = product.description;
    body.append(eyebrow, title, description);

    if (product.sizes) {
      const sizes = document.createElement("p");
      sizes.className = "product-sizes";
      sizes.textContent = product.sizes;
      body.appendChild(sizes);
    }
    if (product.note) {
      const note = document.createElement("p");
      note.className = "product-note";
      note.textContent = product.note;
      body.appendChild(note);
    }

    const footer = document.createElement("div");
    footer.className = "product-footer";
    const price = document.createElement("div");
    price.className = "product-price";
    price.innerHTML = `<small>Preço</small><strong>${product.priceLabel || "Consulte"}</strong>`;
    const actions = document.createElement("div");
    actions.className = "product-actions";

    const order = document.createElement("a");
    order.className = "product-order";
    order.href = product.orderUrl || config.links.order;
    order.target = "_blank";
    order.rel = "noopener noreferrer";
    order.setAttribute("aria-label", `Pedir ${product.name} no canal oficial`);
    order.innerHTML = '<svg aria-hidden="true"><use href="#i-bag"/></svg><span>Pedir</span>';

    const whatsapp = document.createElement("a");
    whatsapp.className = "product-whatsapp";
    whatsapp.dataset.whatsappLink = "";
    whatsapp.dataset.whatsappContext = "product";
    whatsapp.dataset.product = product.name;
    whatsapp.target = "_blank";
    whatsapp.rel = "noopener noreferrer";
    whatsapp.setAttribute("aria-label", `Perguntar sobre ${product.name} no WhatsApp da unidade`);
    whatsapp.innerHTML = '<svg aria-hidden="true"><use href="#i-whatsapp"/></svg><span>WhatsApp</span>';

    actions.append(order, whatsapp);
    footer.append(price, actions);
    body.appendChild(footer);

    article.append(media, body);
    return article;
  }

  function renderProducts() {
    const grid = document.getElementById("productGrid");
    const empty = document.getElementById("emptyState");
    const counter = document.getElementById("resultsCount");
    if (!grid || !empty || !counter) return;

    const products = config.products.filter((product) => product.available !== false && productMatches(product));
    grid.replaceChildren(...products.map(createProductCard));
    empty.hidden = products.length > 0;
    grid.hidden = products.length === 0;
    counter.textContent = `${products.length} ${products.length === 1 ? "item encontrado" : "itens encontrados"}`;
    updateWhatsAppLinks();
  }

  function resetCatalog() {
    activeCategory = "todos";
    query = "";
    const search = document.getElementById("productSearch");
    const clear = document.getElementById("clearSearch");
    if (search) search.value = "";
    if (clear) clear.hidden = true;
    document.querySelectorAll(".filter-chip").forEach((chip) => chip.setAttribute("aria-pressed", String(chip.dataset.category === "todos")));
    renderProducts();
  }

  function initCatalog() {
    renderFilters();
    renderProducts();

    const search = document.getElementById("productSearch");
    const clear = document.getElementById("clearSearch");
    search?.addEventListener("input", () => {
      query = search.value;
      if (clear) clear.hidden = !query;
      renderProducts();
    });
    clear?.addEventListener("click", () => {
      query = "";
      search.value = "";
      clear.hidden = true;
      search.focus();
      renderProducts();
    });
    document.getElementById("resetFilters")?.addEventListener("click", resetCatalog);
    document.getElementById("emptyReset")?.addEventListener("click", resetCatalog);
  }

  function initScrollNavigation() {
    document.querySelectorAll("[data-scroll-target]").forEach((control) => {
      control.addEventListener("click", () => {
        const target = document.getElementById(control.dataset.scrollTarget);
        target?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      });
    });

    const sections = ["inicio", "cardapio", "unidade"].map((id) => document.getElementById(id)).filter(Boolean);
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        document.querySelectorAll("[data-nav-section]").forEach((item) => {
          const active = item.dataset.navSection === visible.target.id;
          if (active) item.setAttribute("aria-current", "page");
          else item.removeAttribute("aria-current");
        });
      }, { rootMargin: "-20% 0px -65% 0px", threshold: [0, .2, .5] });
      sections.forEach((section) => observer.observe(section));
    }
  }

  function initActions() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest("[data-whatsapp-link]");
      if (!link || link.getAttribute("aria-disabled") !== "true") return;
      event.preventDefault();
      showToast(config.messages.whatsappMissing);
    });

    document.querySelectorAll("[data-whatsapp-action]").forEach((button) => {
      button.addEventListener("click", () => handleWhatsApp(button.dataset.product || ""));
    });

    document.addEventListener("paidegua:unit-change", updateWhatsAppLinks);
    updateWhatsAppLinks();

    document.getElementById("shareButton")?.addEventListener("click", async () => {
      const shareData = { title: "Pai D'Égua | Cardápio Digital", text: "Confira o cardápio digital da Pai D'Égua.", url: config.links.site };
      try {
        if (navigator.share) await navigator.share(shareData);
        else {
          await navigator.clipboard.writeText(config.links.site);
          showToast(config.messages.copied);
        }
      } catch (error) {
        if (error?.name !== "AbortError") showToast("Não foi possível compartilhar agora.");
      }
    });
  }

  function init() {
    if (!config) return;
    window.PaiDAguaApp = { showToast, handleWhatsApp };
    document.getElementById("currentYear").textContent = String(new Date().getFullYear());
    setExternalLinks();
    window.PaiDAguaUnits?.init(config);
    window.PaiDAguaMenu?.init(config);
    window.PaiDAguaPWA?.init(config);
    initCatalog();
    initScrollNavigation();
    initActions();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
