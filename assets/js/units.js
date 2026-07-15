(function () {
  "use strict";

  const STORAGE_KEY = "paidegua:selected-unit";
  let config = null;
  let currentUnit = null;

  function safeStoredId() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (_) { return null; }
  }

  function saveUnitId(id) {
    try { localStorage.setItem(STORAGE_KEY, id); } catch (_) { /* storage may be blocked */ }
  }

  function getUnitById(id) {
    return config.units.find((unit) => unit.id === id) || config.units[0] || null;
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "";
  }

  function setLink(id, value) {
    const el = document.getElementById(id);
    if (el && value) el.href = value;
  }

  function updateUI(unit) {
    if (!unit) return;
    currentUnit = unit;

    setText("unitName", unit.name);
    setText("unitAddress", unit.address);
    setText("unitHours", unit.hours || "Consulte o horário no canal oficial.");
    setText("locationHighlightPill", unit.shortName || unit.name);
    setText("locationHighlightTitle", unit.name);
    setText("locationHighlightBody", unit.address);
    setLink("unitOrder", unit.orderUrl || config.links.order);
    setLink("unitMaps", unit.mapsUrl);
    setLink("unitRoute", unit.directionsUrl);

    const mini = document.getElementById("selectedUnitMini");
    if (mini) {
      const strong = mini.querySelector("strong");
      if (strong) strong.textContent = unit.shortName || unit.name;
    }

    document.querySelectorAll("[data-maps-link]").forEach((el) => { if (unit.mapsUrl) el.href = unit.mapsUrl; });
    document.querySelectorAll("[data-route-link]").forEach((el) => { if (unit.directionsUrl) el.href = unit.directionsUrl; });

    document.dispatchEvent(new CustomEvent("paidegua:unit-change", { detail: { unit } }));
  }

  function init(storeConfig) {
    config = storeConfig;
    const select = document.getElementById("unitSelect");
    if (!select || !Array.isArray(config.units) || !config.units.length) return;

    select.innerHTML = "";
    config.units.forEach((unit) => {
      const option = document.createElement("option");
      option.value = unit.id;
      option.textContent = unit.name;
      select.appendChild(option);
    });

    const stored = safeStoredId();
    currentUnit = getUnitById(stored);
    select.value = currentUnit.id;
    updateUI(currentUnit);

    select.addEventListener("change", () => {
      const unit = getUnitById(select.value);
      saveUnitId(unit.id);
      updateUI(unit);
      if (window.PaiDAguaApp?.showToast) {
        window.PaiDAguaApp.showToast(config.messages.unitSaved);
      }
    });
  }

  window.PaiDAguaUnits = {
    init,
    getSelectedUnit: () => currentUnit,
    getWhatsAppNumber: () => String(currentUnit?.whatsapp || "").replace(/\D/g, "")
  };
})();
