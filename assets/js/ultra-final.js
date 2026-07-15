(function () {
  "use strict";

  const data = window.ULTRA_DATA;
  const store = window.STORE_CONFIG;
  if (!data || !store) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#039;",
      '"': "&quot;"
    })[character]);
  }

  function isSafeOrderUrl(value) {
    try {
      const url = new URL(String(value || ""), window.location.origin);
      if (url.protocol !== "https:") return false;
      return ["pedido.anota.ai", "wa.me", "api.whatsapp.com"].includes(url.hostname);
    } catch {
      return false;
    }
  }

  function icon(id) {
    return `<svg aria-hidden="true"><use href="#${id}"/></svg>`;
  }

  function scrollToId(id) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }

  function getSelectedUnit() {
    return window.PaiDAguaUnits?.getSelectedUnit?.() || store.units?.[0] || null;
  }

  function buildWhatsAppUrl(message) {
    const unit = getSelectedUnit();
    const number = String(unit?.whatsapp || store.whatsapp?.number || "").replace(/\D/g, "");
    if (!number) return "";
    const unitName = unit?.shortName || unit?.name || "unidade selecionada";
    const text = `${message} Unidade escolhida: ${unitName}.`;
    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  }

  function initExperienceTabs() {
    const holder = $("#experienceTabs");
    const panel = $("#experiencePanel");
    if (!holder || !panel) return;

    const render = (experience) => {
      panel.innerHTML = `
        <div class="experience-copy ultra-reveal">
          <small>${experience.kicker}</small>
          <h3>${experience.title}</h3>
          <p>${experience.description}</p>
          <ul class="experience-list">${experience.bullets.map((item) => `<li>${item}</li>`).join("")}</ul>
          <button class="button button-primary touch-feedback" type="button" data-experience-target="${experience.actionTarget}">
            ${icon("i-chevron-right")} ${experience.actionLabel}
          </button>
        </div>
        <div class="experience-visual ultra-reveal">
          <img src="${experience.id === "salao" ? "assets/img/ultra/momento-massa.webp" : experience.id === "express" ? "assets/img/hero/hero-pizza.webp" : "assets/img/ultra/momento-pizza.webp"}" alt="Experiência ${experience.label} da Pai D'Égua" loading="lazy" decoding="async">
          <div class="experience-visual-copy"><strong>${experience.label}</strong><span>${experience.kicker}</span></div>
        </div>`;
      $("[data-experience-target]", panel)?.addEventListener("click", (event) => scrollToId(event.currentTarget.dataset.experienceTarget));
      revealNew(panel);
    };

    data.experiences.forEach((experience, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "experience-tab touch-feedback";
      button.textContent = experience.label;
      button.dataset.experienceId = experience.id;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(index === 0));
      button.addEventListener("click", () => {
        $$(".experience-tab", holder).forEach((tab) => tab.setAttribute("aria-selected", String(tab === button)));
        render(experience);
      });
      holder.appendChild(button);
    });
    render(data.experiences[0]);
  }

  function initPromotions() {
    const holder = $("#promotionScroller");
    if (!holder) return;
    const today = new Date().getDay();
    holder.replaceChildren(...data.promotions.map((promo) => {
      const article = document.createElement("article");
      article.className = `promo-card ultra-reveal${promo.weekday === today ? " is-today" : ""}`;
      article.innerHTML = `
        <span class="promo-day">${promo.day}</span>
        <h3>${promo.name}</h3>
        <h4>${promo.headline}</h4>
        <p>${promo.description}</p>
        <div class="promo-card-footer">
          <span class="promo-tag">${promo.tag}</span>
          <a class="promo-link touch-feedback" href="${store.links.order}" target="_blank" rel="noopener noreferrer" aria-label="Abrir pedido oficial para ${promo.name}">${icon("i-chevron-right")}</a>
        </div>`;
      return article;
    }));
    revealNew(holder);
    const active = $(".promo-card.is-today", holder);
    if (active && window.innerWidth < 760) {
      requestAnimationFrame(() => {
        const left = Math.max(0, active.offsetLeft - holder.offsetLeft - 4);
        holder.scrollTo({ left, behavior: "auto" });
      });
    }
  }

  function initTopTen() {
    const holder = $("#topTenGrid");
    if (!holder) return;
    const popular = store.products.filter((product) => product.available !== false && (product.popular || product.featured));
    const unique = [];
    const ids = new Set();
    popular.concat(store.products).forEach((product) => {
      if (ids.has(product.id) || unique.length >= 10) return;
      ids.add(product.id);
      unique.push(product);
    });

    holder.replaceChildren(...unique.map((product, index) => {
      const article = document.createElement("article");
      article.className = "top-ten-card ultra-reveal";
      const orderUrl = product.orderUrl || store.links.order;
      article.innerHTML = `
        <div class="top-ten-media">
          <img src="${product.image}" alt="${product.alt}" loading="lazy" decoding="async">
          <span class="top-ten-rank">${index + 1}</span>
        </div>
        <div class="top-ten-body">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <div class="top-ten-action">
            <strong>${product.priceLabel || "Consulte"}</strong>
            <a class="touch-feedback" href="${orderUrl}" target="_blank" rel="noopener noreferrer" aria-label="Pedir ${product.name}">${icon("i-bag")}</a>
          </div>
        </div>`;
      return article;
    }));
    revealNew(holder);
  }

  function initAssistant() {
    const root = $("#assistantForm");
    if (!root) return;

    const groups = [data.assistant.occasions, data.assistant.tastes, data.assistant.channels];
    const keys = ["occasion", "taste", "channel"];
    const answers = {};
    let step = 0;

    const steps = $$(".assistant-step", root);
    const progress = $$(".assistant-progress span", root);
    const back = $("#assistantBack", root);
    const next = $("#assistantNext", root);
    const result = $("#assistantResult", root);
    const notesInput = $("#assistantNotes", root);
    const notesCount = $("#assistantNotesCount", root);
    let isLoading = false;

    notesInput?.addEventListener("input", () => {
      if (notesCount) notesCount.textContent = String(notesInput.value.length);
    });

    steps.forEach((stepEl, stepIndex) => {
      const optionsHolder = $(".assistant-options", stepEl);
      groups[stepIndex].forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "assistant-option touch-feedback";
        button.textContent = option.label;
        button.dataset.value = option.id;
        button.setAttribute("aria-pressed", "false");
        button.addEventListener("click", () => {
          answers[keys[stepIndex]] = option.id;
          $$(".assistant-option", optionsHolder).forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
          if (stepIndex === step) next.disabled = false;
        });
        optionsHolder.appendChild(button);
      });
    });

    function updateStep() {
      steps.forEach((stepEl, index) => { stepEl.hidden = index !== step; });
      progress.forEach((bar, index) => bar.classList.toggle("is-complete", index <= step));
      back.disabled = step === 0;
      next.disabled = !answers[keys[step]];
      next.textContent = step === steps.length - 1 ? "Ver minha sugestão" : "Continuar";
    }

    function recommendation() {
      const { occasion, taste, channel } = answers;
      if (occasion === "evento") {
        return {
          label: "Festa ou confraternização",
          title: "Seu rodízio em casa",
          text: "O Kit Festa reúne variedade, quantidade e praticidade para celebrar com o grupo.",
          image: "assets/img/ultra/aniversario-paidegua.webp",
          target: "eventos",
          orderUrl: buildWhatsAppUrl("Olá! Usei a Ajuda Inteligente do cardápio e quero saber mais sobre o Kit Festa / Seu rodízio em casa.")
        };
      }
      if (channel === "express") {
        return {
          label: "Retirada rápida",
          title: "Pizza Express",
          text: "A seleção Express é a rota mais rápida para retirar sabores fixos, conforme disponibilidade da unidade.",
          image: "assets/img/hero/hero-pizza.webp",
          target: "pizza-express",
          orderUrl: buildWhatsAppUrl("Olá! Usei a Ajuda Inteligente do cardápio e quero confirmar os sabores disponíveis da Pizza Express.")
        };
      }
      if (taste === "doce") {
        return {
          label: "Salgado + doce",
          title: "Pizza de Brigadeiro",
          text: "Finalize sua escolha com uma pizza doce e consulte os tamanhos disponíveis no pedido oficial.",
          image: "assets/img/produtos/sobremesas/pizza-brigadeiro.webp",
          target: "cardapio",
          orderUrl: store.links.order
        };
      }
      if (taste === "especial") {
        return {
          label: "Identidade paraense",
          title: "Sabor de Boteco",
          text: "Charque, macaxeira e cebola roxa formam um dos grandes destaques da Pai D'Égua.",
          image: "assets/img/produtos/pizzas-especiais/pizza-sabor-buteco.webp",
          target: "carro-chefe",
          orderUrl: data.directProductUrl
        };
      }
      if (occasion === "casal") {
        return {
          label: "Para compartilhar",
          title: "Combo Casal",
          text: "Uma opção prática para duas pessoas começarem o pedido sem perder tempo.",
          image: "assets/img/produtos/combos/combo-promocional.webp",
          target: "cardapio",
          orderUrl: store.links.order
        };
      }
      return {
        label: "Escolha versátil",
        title: taste === "variado" || occasion === "familia" ? "Mais pedidas da casa" : "Pizza Calabresa",
        text: taste === "variado" || occasion === "familia"
          ? "Comece pelas escolhas que mais despertam interesse e encontre opções para todos."
          : "Um clássico direto, fácil de escolher e perfeito para começar.",
        image: taste === "variado" || occasion === "familia"
          ? "assets/img/produtos/pizzas-especiais/pizza-quatro-queijos.webp"
          : "assets/img/produtos/pizzas-tradicionais/pizza-calabresa.webp",
        target: taste === "variado" || occasion === "familia" ? "mais-pedidas" : "cardapio",
        orderUrl: store.links.order
      };
    }

    async function requestGroqRecommendation(fallback) {
      const unit = getSelectedUnit();
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion: answers.occasion,
          taste: answers.taste,
          channel: answers.channel,
          unit: unit?.id || "coqueiro",
          notes: notesInput?.value?.trim() || ""
        })
      });

      let payload = null;
      try { payload = await response.json(); } catch { payload = null; }
      if (!response.ok || !payload?.ok || !payload?.recommendation) {
        const error = new Error(payload?.code || `AI_HTTP_${response.status}`);
        error.code = payload?.code || "AI_UNAVAILABLE";
        throw error;
      }

      const ai = payload.recommendation;
      const allowedTargets = new Set(["cardapio", "mais-pedidas", "carro-chefe", "pizza-express", "eventos"]);
      const safeImage = /^assets\/img\/[a-zA-Z0-9/_.'-]+\.(webp|png|jpe?g)$/i.test(String(ai.image || ""))
        ? ai.image
        : fallback.image;
      const safeTarget = allowedTargets.has(ai.target) ? ai.target : fallback.target;
      const orderUrl = ai.actionType === "whatsapp"
        ? buildWhatsAppUrl(ai.whatsappMessage || `Olá! Quero saber mais sobre ${ai.title || fallback.title}.`)
        : isSafeOrderUrl(ai.orderUrl)
          ? ai.orderUrl
          : unit?.orderUrl || store.links.order;

      return {
        label: ai.label || fallback.label,
        title: ai.title || fallback.title,
        text: ai.text || fallback.text,
        image: safeImage,
        target: safeTarget,
        orderUrl,
        priceLabel: ai.priceLabel || "Consulte no pedido oficial",
        source: "groq"
      };
    }

    function renderResult(choice, fallbackReason = "") {
      const generatedByGroq = choice.source === "groq";
      const sourceMessage = generatedByGroq
        ? '<span class="ai-source-badge">Recomendação gerada com Groq</span>'
        : `<span class="ai-source-badge is-fallback">Recomendação local${fallbackReason ? ` • ${escapeHtml(fallbackReason)}` : ""}</span>`;

      result.removeAttribute("aria-busy");
      result.innerHTML = `
        ${sourceMessage}
        <span class="assistant-result-label">${escapeHtml(choice.label)}</span>
        <h3>Sua sugestão: ${escapeHtml(choice.title)}</h3>
        <p>${escapeHtml(choice.text)}</p>
        <div class="assistant-result-card">
          <img src="${escapeHtml(choice.image)}" alt="${escapeHtml(choice.title)}" loading="lazy" decoding="async">
          <div><strong>${escapeHtml(choice.title)}</strong><span>${escapeHtml(choice.priceLabel || "Consulte no pedido oficial")} · confirme disponibilidade e regras no canal oficial.</span></div>
        </div>
        <div class="assistant-result-actions">
          <a class="button button-primary touch-feedback" href="${escapeHtml(choice.orderUrl)}" target="_blank" rel="noopener noreferrer">${icon("i-bag")} Abrir pedido</a>
          <button class="button button-secondary touch-feedback" type="button" data-result-target="${escapeHtml(choice.target)}">${icon("i-chevron-right")} Ver recomendação</button>
          <button class="button button-ghost touch-feedback" type="button" id="assistantRestart">Refazer escolhas</button>
        </div>
        <p class="assistant-disclaimer">A IA orienta a escolha usando somente o catálogo configurado. Preços, disponibilidade, regras e conclusão do pedido permanecem no canal oficial.</p>`;
      $("[data-result-target]", result)?.addEventListener("click", (event) => scrollToId(event.currentTarget.dataset.resultTarget));
      $("#assistantRestart", result)?.addEventListener("click", restart);
    }

    async function showResult() {
      if (isLoading) return;
      isLoading = true;
      const fallback = { ...recommendation(), source: "local", priceLabel: "Consulte no pedido oficial" };
      steps.forEach((stepEl) => { stepEl.hidden = true; });
      $(".assistant-nav", root).hidden = true;
      progress.forEach((bar) => bar.classList.add("is-complete"));
      result.hidden = false;
      result.setAttribute("aria-busy", "true");
      result.innerHTML = `
        <div class="assistant-loading" role="status" aria-live="polite">
          <span class="ai-loader" aria-hidden="true"></span>
          <div><strong>A IA está analisando sua escolha…</strong><span>Combinando ocasião, sabor, canal e unidade.</span></div>
        </div>`;

      try {
        const choice = await requestGroqRecommendation(fallback);
        renderResult(choice);
      } catch (error) {
        console.warn("Groq indisponível; usando recomendação local.", error?.code || error?.message || error);
        const reason = error?.code === "AI_NOT_CONFIGURED" ? "IA ainda não configurada" : "Groq temporariamente indisponível";
        renderResult(fallback, reason);
      } finally {
        isLoading = false;
      }
    }

    function restart() {
      Object.keys(answers).forEach((key) => delete answers[key]);
      step = 0;
      $$(".assistant-option", root).forEach((button) => button.setAttribute("aria-pressed", "false"));
      result.hidden = true;
      result.innerHTML = "";
      if (notesInput) notesInput.value = "";
      if (notesCount) notesCount.textContent = "0";
      $(".assistant-nav", root).hidden = false;
      updateStep();
    }

    back.addEventListener("click", () => { if (step > 0) { step -= 1; updateStep(); } });
    next.addEventListener("click", () => {
      if (!answers[keys[step]]) return;
      if (step < steps.length - 1) { step += 1; updateStep(); }
      else void showResult();
    });
    updateStep();
  }

  let revealObserver;
  function revealNew(root = document) {
    const elements = $$(".ultra-reveal", root);
    if (reducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      }, { rootMargin: "0px 0px -8%", threshold: .08 });
    }
    elements.forEach((element) => {
      if (!element.classList.contains("is-visible")) revealObserver.observe(element);
    });
  }

  function initDynamicWhatsApp() {
    const update = () => {
      $$("[data-ultra-whatsapp]").forEach((link) => {
        const message = link.dataset.message || "Olá! Vim pelo Cardápio Premium da Pai D'Égua e gostaria de atendimento.";
        link.href = buildWhatsAppUrl(message);
      });
    };
    update();
    document.addEventListener("paidegua:unit-change", update);
  }

  function initSectionActions() {
    $$('[data-ultra-scroll]').forEach((control) => {
      control.addEventListener("click", () => scrollToId(control.dataset.ultraScroll));
    });
  }

  function init() {
    initExperienceTabs();
    initPromotions();
    initTopTen();
    initAssistant();
    initDynamicWhatsApp();
    initSectionActions();
    revealNew();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
