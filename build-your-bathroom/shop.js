(() => {
  "use strict";

  const products = Array.isArray(window.DLS_PRODUCTS) ? window.DLS_PRODUCTS : [];
  const categories = Array.isArray(window.DLS_CATEGORIES) ? window.DLS_CATEGORIES : ["All products"];
  const CART_KEY = "dlsBathroomBasketV1";
  const CUSTOMER_KEY = "dlsBathroomCustomerV1";
  const REF_KEY = "dlsBathroomSelectionRefV1";
  const WHATSAPP_NUMBER = "447539037841";
  const EMAIL = "info@dlsbathrooms.co.uk";

  const state = {
    search: "",
    category: "All products",
    finish: "all",
    sort: "recommended",
    cart: loadCart(),
    reference: loadReference()
  };

  const els = {};

  document.addEventListener("DOMContentLoaded", initialise);

  function initialise() {
    cacheElements();
    populateFinishFilter();
    bindEvents();
    restoreCustomerDetails();
    renderAll();
  }

  function cacheElements() {
    [
      "product-search", "clear-search", "finish-filter", "sort-filter", "category-filters",
      "product-grid", "result-count", "empty-state", "reset-filters", "active-filter-row",
      "room-checklist", "progress-percent", "progress-bar", "header-basket-count",
      "mobile-basket-count", "mobile-total", "sidebar-item-count", "sidebar-total",
      "sidebar-category-summary", "open-basket", "hero-open-basket", "sidebar-open-basket",
      "mobile-open-basket", "basket-drawer", "drawer-backdrop", "close-basket", "basket-empty",
      "basket-content", "basket-items", "basket-total", "drawer-footer", "selection-reference",
      "customer-name", "customer-postcode", "project-notes", "send-whatsapp", "copy-list",
      "email-list", "clear-list", "empty-start-shopping", "product-dialog", "dialog-content",
      "close-dialog", "toast"
    ].forEach(id => { els[id] = document.getElementById(id); });
  }

  function bindEvents() {
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

    els["sort-filter"].addEventListener("change", event => {
      state.sort = event.target.value;
      renderCatalogue();
    });

    els["category-filters"].addEventListener("click", event => {
      const button = event.target.closest("button[data-category]");
      if (!button) return;
      state.category = button.dataset.category;
      renderCatalogue();
    });

    els["product-grid"].addEventListener("click", event => {
      const add = event.target.closest("button[data-add]");
      if (add) {
        addToCart(add.dataset.add);
        return;
      }
      const details = event.target.closest("button[data-details]");
      const card = event.target.closest("article[data-product-id]");
      if (details || (card && !event.target.closest("a,button"))) {
        openProductDialog((details && details.dataset.details) || card.dataset.productId);
      }
    });

    els["product-grid"].addEventListener("keydown", event => {
      const card = event.target.closest("article[data-product-id]");
      if (card && (event.key === "Enter" || event.key === " ") && event.target === card) {
        event.preventDefault();
        openProductDialog(card.dataset.productId);
      }
    });

    els["basket-items"].addEventListener("click", event => {
      const quantityButton = event.target.closest("button[data-quantity-action]");
      const removeButton = event.target.closest("button[data-remove]");
      if (quantityButton) {
        changeQuantity(quantityButton.dataset.productId, quantityButton.dataset.quantityAction === "increase" ? 1 : -1);
      } else if (removeButton) {
        removeFromCart(removeButton.dataset.remove);
      }
    });

    ["open-basket", "hero-open-basket", "sidebar-open-basket", "mobile-open-basket"].forEach(id => {
      els[id].addEventListener("click", openBasket);
    });
    els["close-basket"].addEventListener("click", closeBasket);
    els["drawer-backdrop"].addEventListener("click", closeBasket);
    els["empty-start-shopping"].addEventListener("click", () => {
      closeBasket();
      document.getElementById("catalogue").scrollIntoView({ behavior: "smooth" });
    });

    els["reset-filters"].addEventListener("click", resetFilters);
    els["send-whatsapp"].addEventListener("click", sendWhatsApp);
    els["copy-list"].addEventListener("click", copyList);
    els["email-list"].addEventListener("click", emailList);
    els["clear-list"].addEventListener("click", clearList);

    ["customer-name", "customer-postcode", "project-notes"].forEach(id => {
      els[id].addEventListener("input", saveCustomerDetails);
    });

    els["close-dialog"].addEventListener("click", closeProductDialog);
    els["product-dialog"].addEventListener("click", event => {
      if (event.target === els["product-dialog"]) closeProductDialog();
      const add = event.target.closest("button[data-dialog-add]");
      if (add) {
        addToCart(add.dataset.dialogAdd);
        closeProductDialog();
      }
    });

    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      if (els["basket-drawer"].classList.contains("is-open")) closeBasket();
      if (els["product-dialog"].open) closeProductDialog();
    });
  }

  function populateFinishFilter() {
    const finishes = [...new Set(products.map(product => product.finish).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));
    finishes.forEach(finish => {
      const option = document.createElement("option");
      option.value = finish;
      option.textContent = finish;
      els["finish-filter"].appendChild(option);
    });
  }

  function renderAll() {
    renderCatalogue();
    renderBasket();
    renderChecklist();
  }

  function renderCatalogue() {
    renderCategoryFilters();
    const visible = getVisibleProducts();
    els["result-count"].textContent = String(visible.length);
    els["product-grid"].innerHTML = visible.map(productCardMarkup).join("");
    els["empty-state"].hidden = visible.length > 0;
    renderActiveFilters();
    attachImageFallbacks(els["product-grid"]);
  }

  function getVisibleProducts() {
    const result = products.filter(product => {
      const categoryMatch = state.category === "All products" || product.category === state.category;
      const finishMatch = state.finish === "all" || product.finish === state.finish;
      const haystack = [product.name, product.sku, product.category, product.finish, ...(product.tags || [])]
        .join(" ").toLowerCase();
      const searchMatch = !state.search || haystack.includes(state.search);
      return categoryMatch && finishMatch && searchMatch;
    });

    return result.sort((a, b) => {
      if (state.sort === "price-low") return a.price - b.price;
      if (state.sort === "price-high") return b.price - a.price;
      if (state.sort === "name") return a.name.localeCompare(b.name);
      return products.indexOf(a) - products.indexOf(b);
    });
  }

  function renderCategoryFilters() {
    els["category-filters"].innerHTML = categories.map(category => {
      const count = category === "All products" ? products.length : products.filter(item => item.category === category).length;
      const active = state.category === category;
      return `<button type="button" data-category="${escapeHtml(category)}" class="${active ? "is-active" : ""}" aria-pressed="${active}">
        <span>${escapeHtml(category)}</span><b>${count}</b>
      </button>`;
    }).join("");
  }

  function renderActiveFilters() {
    const filters = [];
    if (state.category !== "All products") filters.push(state.category);
    if (state.finish !== "all") filters.push(state.finish);
    if (state.search) filters.push(`Search: “${state.search}”`);

    els["active-filter-row"].innerHTML = filters.length
      ? `<span>Showing:</span>${filters.map(filter => `<b>${escapeHtml(filter)}</b>`).join("")}<button type="button" id="inline-reset">Clear filters</button>`
      : `<span class="all-products-message">Showing the starter catalogue. More supplier products can be added in the same searchable format.</span>`;

    const reset = document.getElementById("inline-reset");
    if (reset) reset.addEventListener("click", resetFilters);
  }

  function productCardMarkup(product) {
    const quantity = state.cart[product.id] || 0;
    const imageMarkup = product.image
      ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" data-fallback-category="${escapeHtml(product.category)}">`
      : placeholderMarkup(product.category, product.name);

    return `<article class="product-card" data-product-id="${product.id}" tabindex="0" aria-label="View ${escapeHtml(product.name)} details">
      <div class="product-image-wrap">
        ${imageMarkup}
        <span class="product-category">${escapeHtml(product.category)}</span>
        ${quantity ? `<span class="in-list-badge">${quantity} in list</span>` : ""}
      </div>
      <div class="product-card-body">
        <div class="product-code-row"><span>Product code</span><strong>${escapeHtml(product.sku)}</strong></div>
        <h3>${escapeHtml(product.name)}</h3>
        <p class="product-finish">${escapeHtml(product.finish)}</p>
        <p class="product-dimensions">${escapeHtml(product.dimensions || "Specification to be confirmed")}</p>
        <div class="product-bottom">
          <div class="product-price"><small>Guide list price</small><strong>${formatMoney(product.price)}</strong><span>inc. VAT</span></div>
          <button class="add-button ${quantity ? "is-added" : ""}" type="button" data-add="${product.id}">
            ${quantity ? "Add another" : "Add to my list"}
          </button>
        </div>
        <button class="details-button" type="button" data-details="${product.id}">View details and source</button>
      </div>
    </article>`;
  }

  function placeholderMarkup(category, name) {
    const symbol = categorySymbol(category);
    return `<div class="product-placeholder" role="img" aria-label="Product image coming soon for ${escapeHtml(name)}">
      <span>${symbol}</span><small>Product image<br>being added</small>
    </div>`;
  }

  function attachImageFallbacks(root) {
    root.querySelectorAll("img[data-fallback-category]").forEach(image => {
      image.addEventListener("error", () => {
        const replacement = document.createElement("div");
        replacement.className = "product-placeholder";
        replacement.setAttribute("role", "img");
        replacement.setAttribute("aria-label", `Product image unavailable for ${image.alt}`);
        replacement.innerHTML = `<span>${categorySymbol(image.dataset.fallbackCategory)}</span><small>Image temporarily<br>unavailable</small>`;
        image.replaceWith(replacement);
      }, { once: true });
    });
  }

  function categorySymbol(category) {
    const symbols = {
      "Toilets & sanitaryware": "WC",
      "Furniture & basins": "◇",
      "Baths": "◡",
      "Showers": "☂",
      "Screens & wetrooms": "▱",
      "Taps & wastes": "⌁",
      "Mirrors & cabinets": "○",
      "Heating": "≋",
      "Accessories": "+"
    };
    return symbols[category] || "DLS";
  }

  function addToCart(productId) {
    const product = findProduct(productId);
    if (!product) return;
    state.cart[productId] = (state.cart[productId] || 0) + 1;
    persistCart();
    renderAll();
    showToast(`${product.name} added to your list`);
  }

  function changeQuantity(productId, difference) {
    const next = (state.cart[productId] || 0) + difference;
    if (next <= 0) delete state.cart[productId];
    else state.cart[productId] = Math.min(next, 99);
    persistCart();
    renderAll();
  }

  function removeFromCart(productId) {
    const product = findProduct(productId);
    delete state.cart[productId];
    persistCart();
    renderAll();
    if (product) showToast(`${product.name} removed`);
  }

  function clearList() {
    if (!Object.keys(state.cart).length) return;
    const confirmed = window.confirm("Clear every product from this bathroom list?");
    if (!confirmed) return;
    state.cart = {};
    persistCart();
    renderAll();
    showToast("Bathroom list cleared");
  }

  function renderBasket() {
    const entries = cartEntries();
    const itemCount = entries.reduce((sum, entry) => sum + entry.quantity, 0);
    const total = entries.reduce((sum, entry) => sum + entry.product.price * entry.quantity, 0);
    const empty = itemCount === 0;

    els["header-basket-count"].textContent = String(itemCount);
    els["header-basket-count"].setAttribute("aria-label", `${itemCount} ${itemCount === 1 ? "product" : "products"}`);
    els["mobile-basket-count"].textContent = String(itemCount);
    els["mobile-total"].textContent = formatMoney(total);
    els["sidebar-item-count"].textContent = String(itemCount);
    els["sidebar-total"].textContent = formatMoney(total);
    els["basket-total"].textContent = formatMoney(total);
    els["selection-reference"].textContent = state.reference;

    els["basket-empty"].hidden = !empty;
    els["basket-content"].hidden = empty;
    els["drawer-footer"].hidden = empty;

    els["basket-items"].innerHTML = entries.map(({ product, quantity }) => `
      <article class="basket-item">
        <div class="basket-thumb">${product.image
          ? `<img src="${escapeHtml(product.image)}" alt="" loading="lazy" data-fallback-category="${escapeHtml(product.category)}">`
          : `<span>${categorySymbol(product.category)}</span>`}
        </div>
        <div class="basket-item-copy">
          <span>${escapeHtml(product.category)}</span>
          <h3>${escapeHtml(product.name)}</h3>
          <p><b>${escapeHtml(product.sku)}</b> · ${escapeHtml(product.finish)}</p>
          <div class="basket-item-controls">
            <div class="quantity-control" aria-label="Quantity for ${escapeHtml(product.name)}">
              <button type="button" data-quantity-action="decrease" data-product-id="${product.id}" aria-label="Reduce quantity">−</button>
              <strong>${quantity}</strong>
              <button type="button" data-quantity-action="increase" data-product-id="${product.id}" aria-label="Increase quantity">+</button>
            </div>
            <button class="remove-item" type="button" data-remove="${product.id}">Remove</button>
          </div>
        </div>
        <strong class="basket-line-price">${formatMoney(product.price * quantity)}</strong>
      </article>`).join("");

    attachImageFallbacks(els["basket-items"]);
    renderSidebarCategorySummary(entries);
  }

  function renderSidebarCategorySummary(entries) {
    const categoryCounts = new Map();
    entries.forEach(({ product, quantity }) => {
      categoryCounts.set(product.category, (categoryCounts.get(product.category) || 0) + quantity);
    });
    els["sidebar-category-summary"].innerHTML = categoryCounts.size
      ? [...categoryCounts.entries()].map(([category, count]) => `<div><span>${escapeHtml(category)}</span><b>${count}</b></div>`).join("")
      : `<p>No products selected yet.</p>`;
  }

  function renderChecklist() {
    const entries = cartEntries();
    const selectedGroups = new Set(entries.map(entry => entry.product.roomGroup));
    const hasBathing = selectedGroups.has("bath") || selectedGroups.has("shower");
    const tasks = [
      { label: "Toilet / sanitaryware", help: "Pan, seat, cistern or frame", done: selectedGroups.has("toilet"), filter: "Toilets & sanitaryware" },
      { label: "Basin / furniture", help: "Basin, vanity unit and required parts", done: selectedGroups.has("basin"), filter: "Furniture & basins" },
      { label: "Bath or shower", help: "Choose the main bathing area", done: hasBathing, filter: selectedGroups.has("bath") ? "Showers" : "Baths" },
      { label: "Screen / wetroom panel", help: "Where the chosen layout needs one", done: selectedGroups.has("screen"), filter: "Screens & wetrooms" },
      { label: "Taps and wastes", help: "Match the finish and correct waste", done: selectedGroups.has("tap"), filter: "Taps & wastes" },
      { label: "Mirror / cabinet", help: "Lighting and electrical features checked", done: selectedGroups.has("mirror"), filter: "Mirrors & cabinets" },
      { label: "Heating", help: "Radiator, towel rail or compatible element", done: selectedGroups.has("heating"), filter: "Heating", optional: true },
      { label: "Accessories", help: "Niches, rails and finishing details", done: selectedGroups.has("accessory"), filter: "Accessories", optional: true }
    ];
    const coreTasks = tasks.filter(task => !task.optional);
    const completed = coreTasks.filter(task => task.done).length;
    const percent = Math.round((completed / coreTasks.length) * 100);
    els["progress-percent"].textContent = `${percent}%`;
    els["progress-bar"].style.width = `${percent}%`;

    els["room-checklist"].innerHTML = tasks.map(task => `
      <button type="button" class="checklist-item ${task.done ? "is-done" : ""}" data-checklist-filter="${escapeHtml(task.filter)}">
        <span class="check-circle">${task.done ? "✓" : "+"}</span>
        <span><strong>${escapeHtml(task.label)}</strong><small>${escapeHtml(task.help)}${task.optional ? " · optional" : ""}</small></span>
      </button>`).join("");

    els["room-checklist"].querySelectorAll("button[data-checklist-filter]").forEach(button => {
      button.addEventListener("click", () => {
        state.category = button.dataset.checklistFilter;
        renderCatalogue();
        document.getElementById("catalogue").scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  function openProductDialog(productId) {
    const product = findProduct(productId);
    if (!product) return;
    const quantity = state.cart[product.id] || 0;
    const image = product.image
      ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" data-fallback-category="${escapeHtml(product.category)}">`
      : placeholderMarkup(product.category, product.name);

    els["dialog-content"].innerHTML = `
      <div class="dialog-grid">
        <div class="dialog-image">${image}</div>
        <div class="dialog-copy">
          <p class="eyebrow">${escapeHtml(product.category)}</p>
          <h2 id="dialog-title">${escapeHtml(product.name)}</h2>
          <div class="dialog-code"><span>Product code</span><strong>${escapeHtml(product.sku)}</strong></div>
          <p class="dialog-finish">${escapeHtml(product.finish)}</p>
          <ul>${product.features.map(feature => `<li>${escapeHtml(feature)}</li>`).join("")}</ul>
          <dl><div><dt>Size / specification</dt><dd>${escapeHtml(product.dimensions)}</dd></div><div><dt>Guide list price</dt><dd>${formatMoney(product.price)} inc. VAT</dd></div></dl>
          <div class="dialog-actions">
            <button class="primary-button" type="button" data-dialog-add="${product.id}">${quantity ? "Add another to list" : "Add to my list"}</button>
            <a class="secondary-button" href="${escapeHtml(product.source)}" target="_blank" rel="noopener noreferrer">View supplier page</a>
          </div>
          <small class="dialog-note">DLS will verify the current product specification, any required matching parts, availability and final price.</small>
        </div>
      </div>`;

    attachImageFallbacks(els["dialog-content"]);
    els["product-dialog"].showModal();
    document.body.classList.add("dialog-open");
  }

  function closeProductDialog() {
    if (els["product-dialog"].open) els["product-dialog"].close();
    document.body.classList.remove("dialog-open");
  }

  function openBasket() {
    els["basket-drawer"].classList.add("is-open");
    els["basket-drawer"].setAttribute("aria-hidden", "false");
    els["open-basket"].setAttribute("aria-expanded", "true");
    els["drawer-backdrop"].hidden = false;
    document.body.classList.add("drawer-open");
    window.setTimeout(() => els["close-basket"].focus(), 50);
  }

  function closeBasket() {
    els["basket-drawer"].classList.remove("is-open");
    els["basket-drawer"].setAttribute("aria-hidden", "true");
    els["open-basket"].setAttribute("aria-expanded", "false");
    els["drawer-backdrop"].hidden = true;
    document.body.classList.remove("drawer-open");
  }

  function resetFilters() {
    state.search = "";
    state.category = "All products";
    state.finish = "all";
    state.sort = "recommended";
    els["product-search"].value = "";
    els["finish-filter"].value = "all";
    els["sort-filter"].value = "recommended";
    els["clear-search"].hidden = true;
    renderCatalogue();
  }

  function sendWhatsApp() {
    const summary = buildSummary();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(summary)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function copyList() {
    const summary = buildSummary();
    try {
      await navigator.clipboard.writeText(summary);
      showToast("Full product list copied");
    } catch (error) {
      const textarea = document.createElement("textarea");
      textarea.value = summary;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
      showToast("Full product list copied");
    }
  }

  function emailList() {
    const subject = `DLS bathroom selection ${state.reference}`;
    const href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildSummary())}`;
    window.location.href = href;
  }

  function buildSummary() {
    const entries = cartEntries();
    const total = entries.reduce((sum, entry) => sum + entry.product.price * entry.quantity, 0);
    const name = els["customer-name"].value.trim();
    const postcode = els["customer-postcode"].value.trim();
    const notes = els["project-notes"].value.trim();

    const lines = [
      "DLS BATHROOM PRODUCT SELECTION",
      `Reference: ${state.reference}`,
      name ? `Name: ${name}` : "Name: Not entered",
      postcode ? `Postcode: ${postcode}` : "Postcode: Not entered",
      "",
      ...entries.map(({ product, quantity }, index) => `${index + 1}. ${product.sku} × ${quantity} — ${product.name} — ${product.finish} — ${formatMoney(product.price * quantity)}`),
      "",
      `Guide catalogue total: ${formatMoney(total)} inc. VAT`,
      notes ? `Project notes: ${notes}` : "Project notes: None entered",
      "",
      "Please check compatibility, required matching parts, current availability and final DLS supply/installation price. This selection is not an order."
    ];
    return lines.join("\n");
  }

  function cartEntries() {
    return Object.entries(state.cart)
      .map(([productId, quantity]) => ({ product: findProduct(productId), quantity: Number(quantity) }))
      .filter(entry => entry.product && Number.isFinite(entry.quantity) && entry.quantity > 0);
  }

  function findProduct(productId) {
    return products.find(product => product.id === productId);
  }

  function loadCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "{}");
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function persistCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
  }

  function loadReference() {
    const existing = localStorage.getItem(REF_KEY);
    if (existing) return existing;
    const date = new Date();
    const compactDate = `${String(date.getFullYear()).slice(-2)}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    const reference = `DLS-${compactDate}-${random}`;
    localStorage.setItem(REF_KEY, reference);
    return reference;
  }

  function saveCustomerDetails() {
    const details = {
      name: els["customer-name"].value,
      postcode: els["customer-postcode"].value,
      notes: els["project-notes"].value
    };
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(details));
  }

  function restoreCustomerDetails() {
    try {
      const details = JSON.parse(localStorage.getItem(CUSTOMER_KEY) || "{}");
      els["customer-name"].value = details.name || "";
      els["customer-postcode"].value = details.postcode || "";
      els["project-notes"].value = details.notes || "";
    } catch (error) {
      // Ignore invalid local storage data.
    }
  }

  function formatMoney(value) {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value || 0);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  let toastTimer;
  function showToast(message) {
    window.clearTimeout(toastTimer);
    els["toast"].textContent = message;
    els["toast"].hidden = false;
    requestAnimationFrame(() => els["toast"].classList.add("is-visible"));
    toastTimer = window.setTimeout(() => {
      els["toast"].classList.remove("is-visible");
      window.setTimeout(() => { els["toast"].hidden = true; }, 200);
    }, 2200);
  }
})();
