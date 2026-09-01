(() => {
  "use strict";

  const products = Array.isArray(window.DLS_SHOP_PRODUCTS) ? window.DLS_SHOP_PRODUCTS : [];
  const categories = Array.isArray(window.DLS_SHOP_CATEGORIES) ? window.DLS_SHOP_CATEGORIES : ["All products"];
  const steps = Array.isArray(window.DLS_BUILDER_STEPS) ? window.DLS_BUILDER_STEPS : [];

  const STORAGE = {
    cart: "dlsShopFrameworkCartV1",
    answers: "dlsShopFrameworkAnswersV1",
    customer: "dlsShopFrameworkCustomerV1",
    reference: "dlsShopFrameworkReferenceV1"
  };

  const WHATSAPP_NUMBER = "447539037841";
  const EMAIL = "info@dlsbathrooms.co.uk";

  const roomLabels = {
    "shower-room": "Shower room",
    "bathroom-bath": "Bathroom with bath",
    "bath-and-shower": "Bath and separate shower",
    "cloakroom": "Cloakroom"
  };

  const groupDefinitions = {
    toilet: { title: "Toilet", category: "Toilets", copy: "Pan, seat and any required frame or cistern" },
    basin: { title: "Basin and furniture", category: "Furniture & Basins", copy: "Basin, vanity or storage suited to the room" },
    bath: { title: "Bath", category: "Baths", copy: "Bath, panels, waste and filling option" },
    shower: { title: "Shower", category: "Showers", copy: "Controls, head and handset where required" },
    screen: { title: "Screen, enclosure or tray", category: "Screens & Trays", copy: "Glass, support parts and shower base" },
    tap: { title: "Taps and wastes", category: "Taps & Wastes", copy: "Matching brassware and the correct wastes" },
    mirror: { title: "Mirror or cabinet", category: "Mirrors & Cabinets", copy: "Mirror, lighting and useful storage" },
    heating: { title: "Bathroom heating", category: "Heating", copy: "Towel rail, valves or electric element" },
    details: { title: "Finishing details", category: "Finishing Details", copy: "Niches, trims, shelves and accessories" }
  };

  const roomPlans = {
    "shower-room": ["toilet", "basin", "shower", "screen", "tap", "mirror", "heating", "details"],
    "bathroom-bath": ["toilet", "basin", "bath", "shower", "screen", "tap", "mirror", "heating", "details"],
    "bath-and-shower": ["toilet", "basin", "bath", "shower", "screen", "tap", "mirror", "heating", "details"],
    "cloakroom": ["toilet", "basin", "tap", "mirror", "heating", "details"]
  };

  const state = {
    step: 0,
    answers: loadObject(STORAGE.answers),
    cart: loadObject(STORAGE.cart),
    search: "",
    category: "All products",
    finish: "all",
    sort: "guided",
    reference: loadReference()
  };

  const els = {};

  document.addEventListener("DOMContentLoaded", initialise);

  function initialise() {
    cacheElements();
    bindEvents();
    restoreCustomer();
    renderBuilder();
    renderCatalogue();
    renderSelection();
    renderPlan();
  }

  function cacheElements() {
    [
      "question-panel", "step-label", "step-title", "progress-value", "progress-bar",
      "progress-steps", "answer-summary", "summary-status", "builder-back", "builder-next",
      "builder-hint", "restart-builder", "bathroom-plan", "plan-introduction",
      "recommended-checklist", "completion-ring", "completion-percent", "next-category-title",
      "next-category-copy", "shop-next-category", "mobile-progress", "product-search",
      "clear-search", "finish-filter", "sort-products", "category-tabs", "visible-product-count",
      "filter-message", "product-grid", "empty-state", "reset-filters", "mini-selection",
      "compatibility-note", "selection-dialog", "close-selection", "dialog-empty",
      "dialog-content", "dialog-products", "dialog-footer", "selection-reference",
      "missing-categories", "customer-name", "customer-postcode", "customer-notes",
      "send-whatsapp", "copy-selection", "email-selection", "clear-selection", "empty-browse",
      "toast"
    ].forEach(id => { els[id] = document.getElementById(id); });
  }

  function bindEvents() {
    document.querySelectorAll("[data-start-builder]").forEach(button => {
      button.addEventListener("click", startBuilder);
    });

    document.querySelectorAll("[data-open-list]").forEach(button => {
      button.addEventListener("click", openSelection);
    });

    document.querySelectorAll("[data-focus-search]").forEach(link => {
      link.addEventListener("click", () => window.setTimeout(() => els["product-search"].focus(), 450));
    });

    document.querySelectorAll("[data-apply-look]").forEach(button => {
      button.addEventListener("click", () => applyLook(button.dataset.style, button.dataset.finish));
    });

    els["question-panel"].addEventListener("click", event => {
      const choice = event.target.closest("button[data-choice]");
      if (!choice) return;
      const step = steps[state.step];
      state.answers[step.id] = choice.dataset.choice;
      saveObject(STORAGE.answers, state.answers);
      renderBuilder();
    });

    els["builder-back"].addEventListener("click", () => {
      state.step = Math.max(0, state.step - 1);
      renderBuilder();
      focusQuestionHeading();
    });

    els["builder-next"].addEventListener("click", () => {
      const step = steps[state.step];
      if (!state.answers[step.id]) return;
      if (state.step < steps.length - 1) {
        state.step += 1;
        renderBuilder();
        focusQuestionHeading();
        return;
      }
      finishBuilder();
    });

    els["restart-builder"].addEventListener("click", restartBuilder);
    els["shop-next-category"].addEventListener("click", openNextCategory);

    els["recommended-checklist"].addEventListener("click", event => {
      const target = event.target.closest("button[data-plan-group]");
      if (!target) return;
      openGroup(target.dataset.planGroup);
    });

    els["product-search"].addEventListener("input", event => {
      state.search = event.target.value.trim().toLowerCase();
      els["clear-search"].hidden = !state.search;
      renderCatalogue();
    });

    els["clear-search"].addEventListener("click", () => {
      els["product-search"].value = "";
      state.search = "";
      els["clear-search"].hidden = true;
      renderCatalogue();
      els["product-search"].focus();
    });

    els["finish-filter"].addEventListener("change", event => {
      state.finish = event.target.value;
      renderCatalogue();
    });

    els["sort-products"].addEventListener("change", event => {
      state.sort = event.target.value;
      renderCatalogue();
    });

    els["category-tabs"].addEventListener("click", event => {
      const button = event.target.closest("button[data-category]");
      if (!button) return;
      state.category = button.dataset.category;
      renderCatalogue();
    });

    els["product-grid"].addEventListener("click", event => {
      const add = event.target.closest("button[data-add-product]");
      if (!add) return;
      addProduct(add.dataset.addProduct);
    });

    els["reset-filters"].addEventListener("click", resetFilters);

    els["close-selection"].addEventListener("click", closeSelection);
    els["selection-dialog"].addEventListener("click", event => {
      if (event.target === els["selection-dialog"]) closeSelection();
      const remove = event.target.closest("button[data-remove-product]");
      const quantity = event.target.closest("button[data-change-quantity]");
      const missing = event.target.closest("button[data-missing-group]");
      if (remove) removeProduct(remove.dataset.removeProduct);
      if (quantity) changeQuantity(quantity.dataset.productId, Number(quantity.dataset.changeQuantity));
      if (missing) {
        closeSelection();
        openGroup(missing.dataset.missingGroup);
      }
    });

    els["empty-browse"].addEventListener("click", () => {
      closeSelection();
      scrollToCatalogue();
    });

    ["customer-name", "customer-postcode", "customer-notes"].forEach(id => {
      els[id].addEventListener("input", saveCustomer);
    });

    els["send-whatsapp"].addEventListener("click", sendWhatsApp);
    els["copy-selection"].addEventListener("click", copySelection);
    els["email-selection"].addEventListener("click", emailSelection);
    els["clear-selection"].addEventListener("click", clearSelection);
  }

  function startBuilder() {
    document.getElementById("builder").scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(focusQuestionHeading, 500);
  }

  function focusQuestionHeading() {
    const heading = document.getElementById("question-heading");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
  }

  function renderBuilder() {
    if (!steps.length) return;
    const step = steps[state.step];
    const selected = state.answers[step.id];
    const completed = steps.filter(item => state.answers[item.id]).length;
    const percent = Math.round((completed / steps.length) * 100);

    els["step-label"].textContent = `Step ${state.step + 1} of ${steps.length}`;
    els["step-title"].textContent = shortStepTitle(step.id);
    els["progress-value"].textContent = `${Math.max(20, Math.round(((state.step + 1) / steps.length) * 100))}%`;
    els["progress-bar"].style.width = `${Math.max(20, Math.round(((state.step + 1) / steps.length) * 100))}%`;
    els["mobile-progress"].textContent = `${percent}%`;

    [...els["progress-steps"].children].forEach((item, index) => {
      item.classList.toggle("is-active", index === state.step);
      item.classList.toggle("is-complete", Boolean(state.answers[steps[index].id]));
    });

    els["question-panel"].innerHTML = `
      <div class="question-heading">
        <span>${String(state.step + 1).padStart(2, "0")}</span>
        <div>
          <h3 id="question-heading">${escapeHtml(step.title)}</h3>
          <p>${escapeHtml(step.help)}</p>
        </div>
      </div>
      <div class="choice-grid ${step.id === "finish" ? "finish-grid" : ""}">
        ${step.options.map(option => choiceMarkup(step, option, selected)).join("")}
      </div>`;

    els["builder-back"].disabled = state.step === 0;
    els["builder-next"].disabled = !selected;
    els["builder-next"].textContent = state.step === steps.length - 1 ? "Create my bathroom plan" : "Next step";
    els["builder-hint"].textContent = selected ? `${choiceLabel(step, selected)} selected` : "Choose one option to continue";

    renderAnswerSummary();
  }

  function choiceMarkup(step, option, selected) {
    const active = selected === option.value;
    const visual = step.id === "finish"
      ? `<span class="finish-swatch" style="--swatch:${escapeHtml(option.swatch || "#777")}"></span>`
      : `<span class="choice-icon">${escapeHtml(option.icon || "✓")}</span>`;

    return `<button class="choice-card ${active ? "is-selected" : ""}" type="button" data-choice="${escapeHtml(option.value)}" aria-pressed="${active}">
      ${visual}
      <span class="choice-copy"><strong>${escapeHtml(option.label)}</strong><small>${escapeHtml(option.description)}</small></span>
      <span class="choice-check" aria-hidden="true">✓</span>
    </button>`;
  }

  function choiceLabel(step, value) {
    const option = step.options.find(item => item.value === value);
    return option ? option.label : value;
  }

  function renderAnswerSummary() {
    const labels = {
      room: "Room",
      size: "Size",
      style: "Style",
      finish: "Finish",
      budget: "Budget"
    };
    const completed = steps.filter(step => state.answers[step.id]).length;
    els["summary-status"].textContent = completed === steps.length ? "Complete" : `${completed} of ${steps.length} chosen`;
    els["summary-status"].classList.toggle("is-complete", completed === steps.length);
    els["answer-summary"].innerHTML = steps.map(step => {
      const value = state.answers[step.id];
      const display = step.id === "room" && value ? roomLabels[value] : value;
      return `<div class="${value ? "has-answer" : ""}"><dt>${labels[step.id]}</dt><dd>${escapeHtml(display || "Not chosen")}</dd></div>`;
    }).join("");
  }

  function shortStepTitle(id) {
    return { room: "Choose your room", size: "Estimate the size", style: "Choose a style", finish: "Choose a finish", budget: "Set a product budget" }[id] || "Bathroom builder";
  }

  function restartBuilder() {
    if (Object.keys(state.answers).length && !window.confirm("Clear the bathroom brief and start the five questions again?")) return;
    state.answers = {};
    state.step = 0;
    saveObject(STORAGE.answers, state.answers);
    renderBuilder();
    renderPlan();
    showToast("Bathroom brief reset");
  }

  function finishBuilder() {
    saveObject(STORAGE.answers, state.answers);
    const finish = state.answers.finish;
    if (finish && finish !== "Help me decide") {
      state.finish = finish;
      els["finish-filter"].value = finish;
    }
    renderPlan();
    renderCatalogue();
    els["bathroom-plan"].hidden = false;
    els["bathroom-plan"].scrollIntoView({ behavior: "smooth", block: "start" });
    showToast("Your tailored bathroom plan is ready");
  }

  function applyLook(style, finish) {
    state.answers.style = style;
    state.answers.finish = finish;
    state.step = state.answers.room ? 4 : 0;
    saveObject(STORAGE.answers, state.answers);
    renderBuilder();
    startBuilder();
    showToast(`${style} look added to your bathroom brief`);
  }

  function currentPlanGroups() {
    return roomPlans[state.answers.room] || [];
  }

  function renderPlan() {
    const groups = currentPlanGroups();
    const hasRoom = groups.length > 0;
    els["bathroom-plan"].hidden = !hasRoom || Object.keys(state.answers).length < steps.length;
    if (!hasRoom) return;

    const selectedGroups = new Set(cartEntries().map(entry => entry.product.roomGroup));
    const selectedCount = groups.filter(group => selectedGroups.has(group)).length;
    const percent = Math.round((selectedCount / groups.length) * 100);
    const room = roomLabels[state.answers.room] || "bathroom";
    const finish = state.answers.finish && state.answers.finish !== "Help me decide" ? ` in ${state.answers.finish.toLowerCase()}` : "";

    els["plan-introduction"].textContent = `A ${room.toLowerCase()}${finish}, planned around a ${state.answers.size.toLowerCase()} room and a ${state.answers.budget.toLowerCase()} product budget.`;
    els["completion-percent"].textContent = `${percent}%`;
    els["completion-ring"].style.setProperty("--completion", `${percent * 3.6}deg`);
    els["completion-ring"].setAttribute("aria-label", `${percent} percent of recommended product groups selected`);

    els["recommended-checklist"].innerHTML = groups.map((group, index) => {
      const definition = groupDefinitions[group];
      const complete = selectedGroups.has(group);
      const matchingCount = products.filter(product => product.roomGroup === group).length;
      return `<button class="checklist-item ${complete ? "is-complete" : ""}" type="button" data-plan-group="${group}">
        <span class="checklist-state">${complete ? "✓" : String(index + 1).padStart(2, "0")}</span>
        <span class="checklist-copy"><strong>${escapeHtml(definition.title)}</strong><small>${escapeHtml(definition.copy)}</small></span>
        <span class="checklist-action">${complete ? "Selected" : `${matchingCount} options`} <b>→</b></span>
      </button>`;
    }).join("");

    const firstMissing = groups.find(group => !selectedGroups.has(group));
    if (firstMissing) {
      els["next-category-title"].textContent = `Choose ${groupDefinitions[firstMissing].title.toLowerCase()}`;
      els["next-category-copy"].textContent = groupDefinitions[firstMissing].copy;
      els["shop-next-category"].dataset.group = firstMissing;
      els["shop-next-category"].textContent = `View ${groupDefinitions[firstMissing].category}`;
    } else {
      els["next-category-title"].textContent = "Your core product groups are covered";
      els["next-category-copy"].textContent = "Review the selections and send the full list to DLS for compatibility checking.";
      els["shop-next-category"].dataset.group = "";
      els["shop-next-category"].textContent = "Review my bathroom list";
    }
  }

  function openNextCategory() {
    const group = els["shop-next-category"].dataset.group;
    if (!group) {
      openSelection();
      return;
    }
    openGroup(group);
  }

  function openGroup(group) {
    const definition = groupDefinitions[group];
    if (!definition) return;
    state.category = definition.category;
    state.search = "";
    els["product-search"].value = "";
    els["clear-search"].hidden = true;
    renderCatalogue();
    scrollToCatalogue();
  }

  function scrollToCatalogue() {
    document.getElementById("catalogue").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderCatalogue() {
    renderCategoryTabs();
    const visible = visibleProducts();
    els["visible-product-count"].textContent = String(visible.length);
    els["product-grid"].innerHTML = visible.map(productMarkup).join("");
    els["empty-state"].hidden = visible.length > 0;
    renderFilterMessage(visible.length);
  }

  function renderCategoryTabs() {
    els["category-tabs"].innerHTML = categories.map(category => {
      const count = category === "All products" ? products.length : products.filter(product => product.category === category).length;
      const active = state.category === category;
      return `<button type="button" data-category="${escapeHtml(category)}" class="${active ? "is-active" : ""}" aria-pressed="${active}">
        <span>${escapeHtml(category)}</span><b>${count}</b>
      </button>`;
    }).join("");
  }

  function visibleProducts() {
    const room = state.answers.room;
    const filtered = products.filter(product => {
      const categoryMatch = state.category === "All products" || product.category === state.category;
      const finishMatch = state.finish === "all" || product.finishes.includes(state.finish) || product.finishes.some(finish => finish.toLowerCase().includes(state.finish.toLowerCase()));
      const haystack = [product.name, product.sku, product.category, product.description, product.dimensions, ...product.finishes, ...product.tags].join(" ").toLowerCase();
      const searchMatch = !state.search || haystack.includes(state.search);
      return categoryMatch && finishMatch && searchMatch;
    });

    return filtered.sort((a, b) => {
      if (state.sort === "name") return a.name.localeCompare(b.name);
      if (state.sort === "category") return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
      if (room) {
        const aRecommended = a.recommendedFor.includes(room) ? 0 : 1;
        const bRecommended = b.recommendedFor.includes(room) ? 0 : 1;
        if (aRecommended !== bRecommended) return aRecommended - bRecommended;
      }
      return products.indexOf(a) - products.indexOf(b);
    });
  }

  function renderFilterMessage(count) {
    const parts = [];
    if (state.category !== "All products") parts.push(state.category);
    if (state.finish !== "all") parts.push(state.finish);
    if (state.search) parts.push(`“${state.search}”`);
    els["filter-message"].innerHTML = parts.length
      ? `Showing <strong>${count}</strong> framework item${count === 1 ? "" : "s"} matching ${parts.map(escapeHtml).join(" · ")}. <button type="button" id="inline-reset">Clear filters</button>`
      : "Showing demonstration product types while approved supplier data is prepared.";
    const reset = document.getElementById("inline-reset");
    if (reset) reset.addEventListener("click", resetFilters);
  }

  function productMarkup(product) {
    const quantity = state.cart[product.id] || 0;
    const room = state.answers.room;
    const recommended = room && product.recommendedFor.includes(room);
    const finishes = product.finishes.slice(0, 3);
    const extraFinishCount = Math.max(0, product.finishes.length - finishes.length);

    return `<article class="product-card ${quantity ? "is-selected" : ""}">
      <div class="product-visual product-${escapeHtml(product.roomGroup)}">
        <span class="product-symbol" aria-hidden="true">${categorySymbol(product.roomGroup)}</span>
        <small>Approved product image<br>will appear here</small>
        <span class="demo-pill">Framework example</span>
        ${recommended ? `<span class="recommended-product">Recommended for your room</span>` : ""}
      </div>
      <div class="product-body">
        <div class="product-meta"><span>${escapeHtml(product.category)}</span><b>${escapeHtml(product.sku)}</b></div>
        <h3>${escapeHtml(product.name)}</h3>
        <p>${escapeHtml(product.description)}</p>
        <span class="product-size">${escapeHtml(product.dimensions)}</span>
        <div class="finish-chips" aria-label="Available finish examples">
          ${finishes.map(finish => `<span>${escapeHtml(finish)}</span>`).join("")}
          ${extraFinishCount ? `<span>+${extraFinishCount} more</span>` : ""}
        </div>
        <div class="product-actions">
          <div><small>Price</small><strong>Added with supplier data</strong></div>
          <button type="button" data-add-product="${product.id}" class="${quantity ? "is-added" : ""}">${quantity ? `Add another (${quantity})` : "Add to my bathroom"}</button>
        </div>
      </div>
    </article>`;
  }

  function categorySymbol(group) {
    return { toilet: "WC", basin: "◇", bath: "◡", shower: "⌁", screen: "▱", tap: "↯", mirror: "○", heating: "≋", details: "+" }[group] || "DLS";
  }

  function resetFilters() {
    state.search = "";
    state.category = "All products";
    state.finish = "all";
    state.sort = "guided";
    els["product-search"].value = "";
    els["finish-filter"].value = "all";
    els["sort-products"].value = "guided";
    els["clear-search"].hidden = true;
    renderCatalogue();
  }

  function addProduct(id) {
    const product = findProduct(id);
    if (!product) return;
    state.cart[id] = (state.cart[id] || 0) + 1;
    saveObject(STORAGE.cart, state.cart);
    renderCatalogue();
    renderSelection();
    renderPlan();
    showToast(`${product.name} added to your bathroom`);
  }

  function removeProduct(id) {
    const product = findProduct(id);
    delete state.cart[id];
    saveObject(STORAGE.cart, state.cart);
    renderCatalogue();
    renderSelection();
    renderPlan();
    if (product) showToast(`${product.name} removed`);
  }

  function changeQuantity(id, change) {
    const next = (state.cart[id] || 0) + change;
    if (next <= 0) delete state.cart[id];
    else state.cart[id] = Math.min(99, next);
    saveObject(STORAGE.cart, state.cart);
    renderCatalogue();
    renderSelection();
    renderPlan();
  }

  function cartEntries() {
    return Object.entries(state.cart).map(([id, quantity]) => ({ product: findProduct(id), quantity })).filter(entry => entry.product && entry.quantity > 0);
  }

  function renderSelection() {
    const entries = cartEntries();
    const itemCount = entries.reduce((total, entry) => total + entry.quantity, 0);
    document.querySelectorAll("[data-list-count]").forEach(node => { node.textContent = String(itemCount); });

    els["mini-selection"].innerHTML = entries.length
      ? entries.slice(0, 4).map(entry => `<div><span>${categorySymbol(entry.product.roomGroup)}</span><p>${escapeHtml(entry.product.name)}</p><b>×${entry.quantity}</b></div>`).join("") + (entries.length > 4 ? `<small>+${entries.length - 4} more product types saved</small>` : "")
      : `<div class="mini-empty"><span>◇</span><p>Your saved products will appear here.</p></div>`;

    const missing = missingGroups();
    els["compatibility-note"].classList.toggle("is-ready", entries.length > 0 && missing.length === 0);
    els["compatibility-note"].innerHTML = entries.length > 0 && missing.length === 0
      ? `<span aria-hidden="true">✓</span><p>Your core product groups are covered. DLS will still check individual compatibility.</p>`
      : `<span aria-hidden="true">i</span><p>DLS will check the final list for missing and incompatible parts before quotation.</p>`;

    els["dialog-empty"].hidden = entries.length > 0;
    els["dialog-content"].hidden = entries.length === 0;
    els["dialog-footer"].hidden = entries.length === 0;
    els["selection-reference"].textContent = state.reference;
    els["dialog-products"].innerHTML = entries.map(selectionItemMarkup).join("");
    renderMissingCategories(missing);
  }

  function selectionItemMarkup(entry) {
    return `<article class="dialog-product">
      <span class="dialog-product-icon">${categorySymbol(entry.product.roomGroup)}</span>
      <div class="dialog-product-copy">
        <strong>${escapeHtml(entry.product.name)}</strong>
        <span>${escapeHtml(entry.product.sku)}</span>
        <small>${escapeHtml(entry.product.category)}</small>
      </div>
      <div class="quantity-control" aria-label="Quantity for ${escapeHtml(entry.product.name)}">
        <button type="button" data-change-quantity="-1" data-product-id="${entry.product.id}" aria-label="Reduce quantity">−</button>
        <b>${entry.quantity}</b>
        <button type="button" data-change-quantity="1" data-product-id="${entry.product.id}" aria-label="Increase quantity">+</button>
      </div>
      <button class="remove-product" type="button" data-remove-product="${entry.product.id}">Remove</button>
    </article>`;
  }

  function missingGroups() {
    const plan = currentPlanGroups();
    if (!plan.length) return [];
    const selected = new Set(cartEntries().map(entry => entry.product.roomGroup));
    return plan.filter(group => !selected.has(group));
  }

  function renderMissingCategories(missing) {
    if (!currentPlanGroups().length) {
      els["missing-categories"].innerHTML = `<p class="missing-message">Complete the five builder questions to receive a tailored missing-items check.</p>`;
      return;
    }
    if (!missing.length) {
      els["missing-categories"].innerHTML = `<p class="missing-message is-complete"><span>✓</span> Every core product group has at least one selection.</p>`;
      return;
    }
    els["missing-categories"].innerHTML = missing.map(group => `<button type="button" data-missing-group="${group}"><span>+</span>${escapeHtml(groupDefinitions[group].title)}</button>`).join("");
  }

  function openSelection() {
    renderSelection();
    els["selection-dialog"].showModal();
    document.body.classList.add("dialog-open");
  }

  function closeSelection() {
    els["selection-dialog"].close();
    document.body.classList.remove("dialog-open");
  }

  function clearSelection() {
    if (!cartEntries().length) return;
    if (!window.confirm("Clear every product from this bathroom list?")) return;
    state.cart = {};
    saveObject(STORAGE.cart, state.cart);
    renderCatalogue();
    renderSelection();
    renderPlan();
    showToast("Bathroom list cleared");
  }

  function buildSelectionText() {
    const entries = cartEntries();
    const briefLines = [
      `Room: ${roomLabels[state.answers.room] || "Not chosen"}`,
      `Size: ${state.answers.size || "Not chosen"}`,
      `Style: ${state.answers.style || "Not chosen"}`,
      `Finish: ${state.answers.finish || "Not chosen"}`,
      `Product budget: ${state.answers.budget || "Not chosen"}`
    ];
    const productLines = entries.map((entry, index) => `${index + 1}. ${entry.product.name} × ${entry.quantity}\n   Code: ${entry.product.sku}\n   Category: ${entry.product.category}`);
    const missing = missingGroups().map(group => groupDefinitions[group].title);
    const name = els["customer-name"].value.trim();
    const postcode = els["customer-postcode"].value.trim();
    const notes = els["customer-notes"].value.trim();

    return [
      "DLS BATHROOM SHOP — FRAMEWORK SELECTION",
      `Reference: ${state.reference}`,
      "",
      "BATHROOM BRIEF",
      ...briefLines,
      "",
      "DEMONSTRATION PRODUCT TYPES",
      ...productLines,
      "",
      missing.length ? `Possible missing groups: ${missing.join(", ")}` : "Core product groups selected: Yes",
      "",
      `Name: ${name || "Not provided"}`,
      `Postcode: ${postcode || "Not provided"}`,
      `Notes: ${notes || "None"}`,
      "",
      "This is a framework preview, not an order. Supplier products, codes, prices and availability must be confirmed by DLS."
    ].join("\n");
  }

  function sendWhatsApp() {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildSelectionText())}`, "_blank", "noopener");
  }

  async function copySelection() {
    try {
      await navigator.clipboard.writeText(buildSelectionText());
      showToast("Bathroom list copied");
    } catch (_error) {
      const textarea = document.createElement("textarea");
      textarea.value = buildSelectionText();
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
      showToast("Bathroom list copied");
    }
  }

  function emailSelection() {
    const subject = `Bathroom framework selection ${state.reference}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildSelectionText())}`;
  }

  function saveCustomer() {
    saveObject(STORAGE.customer, {
      name: els["customer-name"].value,
      postcode: els["customer-postcode"].value,
      notes: els["customer-notes"].value
    });
  }

  function restoreCustomer() {
    const customer = loadObject(STORAGE.customer);
    els["customer-name"].value = customer.name || "";
    els["customer-postcode"].value = customer.postcode || "";
    els["customer-notes"].value = customer.notes || "";
  }

  function findProduct(id) {
    return products.find(product => product.id === id);
  }

  function loadReference() {
    try {
      const saved = window.localStorage.getItem(STORAGE.reference);
      if (saved) return saved;
      const date = new Date();
      const reference = `DLS-${String(date.getFullYear()).slice(-2)}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      window.localStorage.setItem(STORAGE.reference, reference);
      return reference;
    } catch (_error) {
      return "DLS-PREVIEW";
    }
  }

  function loadObject(key) {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(key) || "{}");
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (_error) {
      return {};
    }
  }

  function saveObject(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (_error) {
      // The framework remains usable if storage is blocked.
    }
  }

  let toastTimer;
  function showToast(message) {
    window.clearTimeout(toastTimer);
    els["toast"].textContent = message;
    els["toast"].hidden = false;
    requestAnimationFrame(() => els["toast"].classList.add("is-visible"));
    toastTimer = window.setTimeout(() => {
      els["toast"].classList.remove("is-visible");
      window.setTimeout(() => { els["toast"].hidden = true; }, 220);
    }, 2600);
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;"
    })[character]);
  }
})();
