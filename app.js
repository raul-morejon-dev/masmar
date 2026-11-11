(function () {
  "use strict";
  const CFG = window.MASMAR_CONFIG;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const eur = (n) => n.toLocaleString("es-ES", { style: "currency", currency: CFG.currency });
  // Las animaciones son parte de la experiencia: se muestran aunque Windows tenga
  // los efectos desactivados. Para ver la web sin animaciones: añade ?sinanim a la URL.
  const reduce = /[?&]sinanim\b/.test(location.search);
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };
  const artFor = (p) => p.img ? `<img src="${p.img}" alt="${p.name}" loading="lazy">` : `<div class="art">${MasmarArt.render(p.art)}</div>`;

  const fine = matchMedia("(pointer: fine)").matches;
  const make = (tag, cls) => { const n = document.createElement(tag); n.className = cls; return n; };
  // Texto que rueda: duplica el contenido del botón en dos capas
  function setRoll(el, html) { el.innerHTML = `<span class="roll"><span>${html}</span><span aria-hidden="true">${html}</span></span>`; }
  const rollAll = () => $$(".btn, .card__add").forEach((b) => { if (!b.querySelector(".roll")) setRoll(b, b.innerHTML.trim()); });

  $("#year").textContent = new Date().getFullYear();
  MasmarArt.hydrate();

  /* ============ TRANSICIÓN ENTRE PÁGINAS ============ */
  const curtain = make("div", "curtain");
  curtain.innerHTML = '<svg viewBox="0 0 120 100"><use href="#butterfly"/></svg>';
  document.body.appendChild(curtain);
  const fromNav = sessionStorage.getItem("masmar_nav") === "1";
  try { sessionStorage.removeItem("masmar_nav"); } catch {}
  // La cortina nunca debe quedarse tapando la página (bloquearía el ratón)
  const openCurtain = () => { curtain.classList.remove("no-tr", "is-on"); curtain.classList.add("is-out"); };
  if (fromNav && !reduce) {
    curtain.classList.add("is-on", "no-tr");
    void curtain.offsetWidth; // aplica el estado inicial sin esperar a un fotograma
    setTimeout(openCurtain, 40);
  }
  addEventListener("pageshow", openCurtain);
  function go(url) {
    if (reduce) { location.href = url; return; }
    try { sessionStorage.setItem("masmar_nav", "1"); } catch {}
    curtain.classList.remove("is-out"); curtain.classList.add("is-on");
    setTimeout(() => (location.href = url), 550);
    setTimeout(openCurtain, 3000); // por si la navegación se cancela
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey) return;
    const href = a.getAttribute("href");
    if (/^(producto\.html|index\.html)/.test(href)) { e.preventDefault(); go(href); }
  });
  const productUrl = (id) => `producto.html?id=${encodeURIComponent(id)}`;

  /* ======================= TIENDA ======================= */
  const isHome = !!$("#grid");
  if (isHome) {
  const grid = $("#grid");
  const favs = new Set(store.get("masmar_favs", []));
  grid.innerHTML = CFG.products.map((p) => `
    <article class="card" data-cat="${p.cat}" data-id="${p.id}">
      <div class="card__media" style="--bg:${p.bg || "var(--lila-50)"}">
        ${p.badge ? `<span class="card__badge ${p.hot ? "card__badge--hot" : ""}">${p.badge}</span>` : ""}
        <button class="card__fav ${favs.has(p.id) ? "is-on" : ""}" aria-label="Favorito"><svg><use href="#i-heart"/></svg></button>
        ${artFor(p)}
        <button class="card__add" data-add="${p.id}">Añadir · ${eur(p.price)}</button>
      </div>
      <div class="card__info"><div><h3><a href="${productUrl(p.id)}">${p.name}</a></h3><p>${p.desc}</p></div><span class="card__price">${eur(p.price)}</span></div>
    </article>`).join("");

  grid.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    const media = !add && e.target.closest(".card__media");
    if (media && !e.target.closest(".card__fav")) { go(productUrl(media.closest(".card").dataset.id)); return; }
    if (add) {
      addToCart(add.dataset.add, 1, add.closest(".card").querySelector(".card__media"));
      add.dataset.label ||= add.querySelector(".roll > span")?.innerHTML || add.innerHTML;
      add.classList.add("is-done"); setRoll(add, "✓ ¡Añadido!");
      clearTimeout(add._t); add._t = setTimeout(() => { add.classList.remove("is-done"); setRoll(add, add.dataset.label); }, 1600);
      return;
    }
    const fav = e.target.closest(".card__fav");
    if (fav) {
      const id = fav.closest(".card").dataset.id;
      favs.has(id) ? favs.delete(id) : favs.add(id);
      fav.classList.toggle("is-on");
      store.set("masmar_favs", [...favs]);
    }
  });

  function setFilter(f) {
    $$("#filters .chip").forEach((c) => c.classList.toggle("is-active", c.dataset.filter === f));
    const cards = $$(".card", grid);
    cards.forEach((c) => c.classList.toggle("is-hidden", f !== "all" && c.dataset.cat !== f));
    if (hasGsap && !reduce) gsap.fromTo(cards.filter((c) => !c.classList.contains("is-hidden")), { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.6, ease: "power3.out" });
    if (hasGsap) ScrollTrigger.refresh();
  }
  $("#filters").addEventListener("click", (e) => { const b = e.target.closest(".chip"); if (b) setFilter(b.dataset.filter); });
  $$("[data-goto]").forEach((a) => a.addEventListener("click", () => setFilter(a.dataset.goto)));

  /* ===================== PERSONALIZA ===================== */
  const BASE = 65;
  const custom = { hair: "#a88660", dress: "#ffffff", extra: "crown", extraPrice: 6, name: "Lucía", hairN: "Castaño claro", dressN: "Blanco comunión" };
  const accentFor = (d) => ({ "#ffffff": "#c9b3f2", "#e6dafc": "#8e6ccf", "#bff0ec": "#3cc6c2", "#ffdbe3": "#ff9fb4" }[d] || "#c9b3f2");
  function drawCustom(pop) {
    $("#customArt").innerHTML = MasmarArt.render({ type: "doll", hair: custom.hair, dress: custom.dress, accent: accentFor(custom.dress), extra: custom.extra });
    $("#customTag").textContent = custom.name || "Su nombre";
    $("#customPrice").textContent = eur(BASE + custom.extraPrice);
    if (pop && hasGsap && !reduce) gsap.fromTo("#customArt svg", { scale: 0.94, rotate: -2 }, { scale: 1, rotate: 0, duration: 0.7, ease: "elastic.out(1,0.5)" });
  }
  $$(".swatches, .pills").forEach((group) => group.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    $$("button", group).forEach((x) => x.classList.toggle("is-active", x === b));
    const k = group.dataset.opt;
    if (k === "extra") { custom.extra = b.dataset.v; custom.extraPrice = +b.dataset.p; }
    else { custom[k] = b.dataset.v; custom[k + "N"] = b.dataset.n; }
    drawCustom(true);
  }));
  $("#customName").addEventListener("input", (e) => { custom.name = e.target.value.trim(); drawCustom(false); });
  $("#customAdd").addEventListener("click", () => {
    const extraN = { crown: "Corona de flores", bow: "Lazo", none: "Sin adorno" }[custom.extra];
    const id = `custom-${custom.hair}-${custom.dress}-${custom.extra}-${custom.name}`;
    addToCart(id, 1, $("#customArt"), {
      id, cat: "munecas", name: `Muñeca personalizada · ${custom.name || "sin nombre"}`,
      desc: `${custom.hairN} · ${custom.dressN} · ${extraN}`, price: BASE + custom.extraPrice,
      art: { type: "doll", hair: custom.hair, dress: custom.dress, accent: accentFor(custom.dress), extra: custom.extra }
    });
  });
  drawCustom(false);
  } // fin isHome

  /* ======================= CARRITO ======================= */
  let cart = store.get("masmar_cart", []); // [{id, qty, item}]
  const byId = (id) => CFG.products.find((p) => p.id === id);
  const subtotal = () => cart.reduce((s, l) => s + l.item.price * l.qty, 0);
  const count = () => cart.reduce((s, l) => s + l.qty, 0);

  function addToCart(id, qty, fromEl, customItem) {
    const clean = (v) => String(v ?? "").replace(/[<>&"]/g, "");
    const raw = customItem || byId(id);
    const item = { ...raw, name: clean(raw.name), desc: clean(raw.desc) };
    const line = cart.find((l) => l.id === id);
    line ? (line.qty += qty) : cart.push({ id, qty, item });
    save();
    flyToCart(fromEl, item);
    toast(`«${item.name}» añadido a tu cesta`);
  }
  function save() { store.set("masmar_cart", cart); renderCart(); }

  function renderCart() {
    const sub = subtotal(), n = count();
    $("#cartCount").textContent = n;
    $("#cartSubtotal").textContent = eur(sub);
    $("#mobileTotal").textContent = eur(sub);
    $("#mobileItems").textContent = `${n} ${n === 1 ? "artículo" : "artículos"}`;
    $("#mobileBar").classList.toggle("is-on", n > 0);
    $$("[data-open-checkout]").forEach((b) => (b.disabled = n === 0));

    const left = CFG.freeShippingFrom - sub;
    $("#shipMsg").innerHTML = left > 0 ? `Te faltan <strong>${eur(left)}</strong> para el envío gratis` : `🎉 ¡Tienes <strong>envío gratis</strong>!`;
    $("#shipBar").style.width = Math.min(100, (sub / CFG.freeShippingFrom) * 100) + "%";

    $("#cartItems").innerHTML = n === 0
      ? `<li class="empty"><svg viewBox="0 0 120 100"><use href="#butterfly"/></svg>Tu cesta está vacía.<br/>¡Hay piezas preciosas esperándote!</li>`
      : cart.map((l) => `
        <li class="citem" data-id="${l.id}">
          <div class="citem__img">${artFor(l.item)}</div>
          <div><h4>${l.item.name}</h4><small>${l.item.desc || ""}</small>
            <div class="qty"><button data-q="-1" aria-label="Menos">−</button><span>${l.qty}</span><button data-q="1" aria-label="Más">+</button></div></div>
          <div class="citem__price">${eur(l.item.price * l.qty)}<button class="citem__rm" data-rm>Quitar</button></div>
        </li>`).join("");

    // Venta cruzada: sugiere algo de otra categoría
    const cats = new Set(cart.map((l) => l.item.cat));
    const sug = n ? CFG.products.find((p) => !cats.has(p.cat) && !cart.some((l) => l.id === p.id)) : null;
    $("#upsell").innerHTML = sug ? `<div class="upsell__box"><div class="art">${MasmarArt.render(sug.art)}</div><div><small>Completa tu regalo</small><b>${sug.name}</b>${eur(sug.price)}</div><button data-up="${sug.id}">+ Añadir</button></div>` : "";
  }
  $("#cartItems").addEventListener("click", (e) => {
    const li = e.target.closest(".citem"); if (!li) return;
    const line = cart.find((l) => l.id === li.dataset.id);
    const q = e.target.closest("[data-q]");
    if (q) { line.qty += +q.dataset.q; if (line.qty < 1) cart = cart.filter((l) => l !== line); save(); }
    if (e.target.closest("[data-rm]")) { cart = cart.filter((l) => l !== line); save(); }
  });
  $("#upsell").addEventListener("click", (e) => { const b = e.target.closest("[data-up]"); if (b) addToCart(b.dataset.up, 1, b.closest(".upsell__box")); });

  function flyToCart(fromEl, item) {
    const btn = $("#cartBtn");
    const bump = () => { btn.classList.remove("bump"); void btn.offsetWidth; btn.classList.add("bump"); };
    if (!fromEl || !hasGsap || reduce) return bump();
    const a = fromEl.getBoundingClientRect(), b = btn.getBoundingClientRect();
    const f = document.createElement("div");
    f.className = "flyer"; f.innerHTML = MasmarArt.render(item.art);
    document.body.appendChild(f);
    gsap.set(f, { left: a.left + a.width / 2 - 35, top: a.top + a.height / 2 - 42 });
    gsap.timeline({ onComplete: () => { f.remove(); bump(); } })
      .to(f, { scale: 1.15, duration: 0.2, ease: "power2.out" })
      .to(f, { left: b.left + b.width / 2 - 35, duration: 0.8, ease: "power2.inOut" }, ">")
      .to(f, { top: b.top + b.height / 2 - 42, duration: 0.8, ease: "back.in(1.4)" }, "<")
      .to(f, { scale: 0.15, opacity: 0.4, rotate: 25, duration: 0.8, ease: "power2.in" }, "<");
  }

  let toastT;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("is-on");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("is-on"), 2400);
  }

  /* ================= DRAWER / CHECKOUT UI ================= */
  const overlay = $("#overlay"), drawer = $("#drawer"), checkout = $("#checkout");
  let lenis;
  const lock = (on) => { document.body.classList.toggle("is-locked", on); lenis && (on ? lenis.stop() : lenis.start()); };
  function openDrawer() { drawer.classList.add("is-on"); overlay.classList.add("is-on"); drawer.setAttribute("aria-hidden", "false"); lock(true); }
  function closeAll() {
    drawer.classList.remove("is-on"); overlay.classList.remove("is-on"); checkout.classList.remove("is-on");
    drawer.setAttribute("aria-hidden", "true"); checkout.setAttribute("aria-hidden", "true"); lock(false);
    if (step === 3) setTimeout(() => goStep(0), 600);
  }
  $("#cartBtn").addEventListener("click", openDrawer);
  overlay.addEventListener("click", closeAll);
  $$("[data-close]").forEach((b) => b.addEventListener("click", closeAll));
  checkout.addEventListener("click", (e) => { if (e.target === checkout) closeAll(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });
  function openCheckout() {
    if (!count()) return;
    drawer.classList.remove("is-on"); overlay.classList.remove("is-on");
    checkout.classList.add("is-on"); checkout.setAttribute("aria-hidden", "false"); lock(true);
    renderSummary();
    setTimeout(() => $("#formDatos input").focus(), 400);
  }
  $$("[data-open-checkout]").forEach((b) => b.addEventListener("click", openCheckout));

  /* ======================== PASOS ======================== */
  let step = 0, shipId = CFG.shipping[0].id;
  const order = store.get("masmar_customer", {});
  function goStep(n) {
    step = n;
    $$(".cstep").forEach((s) => s.classList.toggle("is-active", +s.dataset.step === n));
    $$("#stepper li").forEach((li, i) => { li.classList.toggle("is-active", i === n); li.classList.toggle("is-done", i < n); });
    $("#stepper").style.display = n === 3 ? "none" : "";
    $(".checkout__box").scrollTop = 0;
    if (n === 2) preparePayment();
  }
  $$("[data-back]").forEach((b) => b.addEventListener("click", () => goStep(step - 1)));

  // Recordar datos del cliente
  ["formDatos", "formEnvio"].forEach((fid) => $$(`#${fid} [name]`).forEach((i) => { if (order[i.name] && i.type !== "checkbox") i.value = order[i.name]; }));
  $('[name="regalo"]').addEventListener("change", (e) => $(".gift-msg").classList.toggle("is-on", e.target.checked));

  function validate(form) {
    let ok = true;
    $$("[required]", form).forEach((i) => {
      let v = i.value.trim().length > 1;
      if (i.type === "email") v = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value);
      if (i.name === "cp") v = /^\d{5}$/.test(i.value.trim());
      if (i.type === "tel") v = i.value.replace(/\D/g, "").length >= 9;
      i.classList.toggle("is-error", !v);
      if (!v && ok) { i.focus(); ok = false; }
    });
    if (ok) $$("[name]", form).forEach((i) => (order[i.name] = i.type === "checkbox" ? i.checked : i.value.trim()));
    store.set("masmar_customer", { ...order, regalo: undefined, mensaje: undefined });
    return ok;
  }
  $("#formDatos").addEventListener("submit", (e) => { e.preventDefault(); if (validate(e.target)) goStep(1); });
  $("#formEnvio").addEventListener("submit", (e) => { e.preventDefault(); if (validate(e.target)) goStep(2); });
  $$(".input").forEach((i) => i.addEventListener("input", () => i.classList.remove("is-error")));

  const shipCost = () => {
    const s = CFG.shipping.find((x) => x.id === shipId);
    return s.price === 0 || subtotal() >= CFG.freeShippingFrom && s.id === "std" ? 0 : s.price;
  };
  const total = () => subtotal() + shipCost();
  function renderShip() {
    $("#shipOpts").innerHTML = CFG.shipping.map((s) => {
      const free = s.price === 0 || (s.id === "std" && subtotal() >= CFG.freeShippingFrom);
      return `<label class="ship-opt"><input type="radio" name="ship" value="${s.id}" ${s.id === shipId ? "checked" : ""}/><span>${s.name}<small>${s.eta}</small></span><b>${free ? "Gratis" : eur(s.price)}</b></label>`;
    }).join("");
  }
  $("#shipOpts").addEventListener("change", (e) => { shipId = e.target.value; renderSummary(); });
  function renderSummary() {
    renderShip();
    $("#sumItems").innerHTML = cart.map((l) => `<li><div class="art">${MasmarArt.render(l.item.art)}</div><span>${l.item.name}<br/><small>x${l.qty}</small></span><b>${eur(l.item.price * l.qty)}</b></li>`).join("");
    $("#sumSub").textContent = eur(subtotal());
    $("#sumShip").textContent = shipCost() ? eur(shipCost()) : "Gratis";
    $("#sumTotal").textContent = eur(total());
    $$("[data-total]").forEach((el) => (el.textContent = eur(total())));
  }

  /* ======================== PAGOS ======================== */
  let ref = "";
  const newRef = () => "MSM-" + Date.now().toString(36).toUpperCase().slice(-6);
  const demo = (msg) => console.info("[Masmar · modo demo]", msg);

  $("#paytabs").addEventListener("click", (e) => {
    const t = e.target.closest(".paytab"); if (!t) return;
    $$(".paytab").forEach((x) => x.classList.toggle("is-active", x === t));
    $$(".paypanel").forEach((p) => p.classList.toggle("is-active", p.dataset.panel === t.dataset.pay));
  });

  function preparePayment() {
    ref = ref || newRef();
    renderSummary();
    $("#bizumPhone").textContent = CFG.payments.bizumPhone;
    $("#bizumRef").textContent = ref;
    loadPayPal();
  }

  const payload = () => ({
    ref, customer: order, shipping: shipId,
    items: cart.map((l) => ({ id: l.id, name: l.item.name, desc: l.item.desc, qty: l.qty, price: l.item.price })),
    shippingCost: shipCost(), total: +total().toFixed(2)
  });

  // 1) STRIPE: el servidor crea la sesión y devuelve { url }
  $("#payCard").addEventListener("click", async (e) => {
    const btn = e.currentTarget; btn.disabled = true;
    try {
      if (!CFG.payments.stripeCheckoutEndpoint) { demo("Stripe sin endpoint: simulando pago"); await wait(1200); return success("Tarjeta"); }
      const r = await fetch(CFG.payments.stripeCheckoutEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload()) });
      const { url } = await r.json();
      window.location.href = url;
    } catch (err) { toast("No se pudo conectar con la pasarela. Inténtalo de nuevo."); console.error(err); }
    finally { btn.disabled = false; }
  });

  // 2) PAYPAL: botones oficiales (Smart Buttons)
  let paypalLoaded = false;
  function loadPayPal() {
    const id = CFG.payments.paypalClientId;
    if (!id || paypalLoaded) return;
    paypalLoaded = true;
    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(id)}&currency=${CFG.currency}&locale=es_ES&enable-funding=paylater&disable-funding=card`;
    s.onload = () => paypal.Buttons({
      style: { shape: "pill", color: "gold", label: "pay" },
      createOrder: (d, actions) => actions.order.create({ purchase_units: [{ reference_id: ref, description: "Pedido Masmar " + ref, amount: { value: total().toFixed(2), currency_code: CFG.currency } }] }),
      onApprove: (d, actions) => actions.order.capture().then(() => success("PayPal")),
      onError: () => toast("PayPal no ha podido completar el pago.")
    }).render("#paypalButtons");
    document.head.appendChild(s);
  }
  $("#payPaypalDemo").addEventListener("click", async (e) => { e.currentTarget.disabled = true; demo("PayPal sin Client ID: simulando pago"); await wait(1200); e.currentTarget.disabled = false; success("PayPal"); });

  // 3) BIZUM: el pedido queda pendiente de verificar
  $("#payBizum").addEventListener("click", () => success("Bizum (pendiente de verificación)"));

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  function success(method) {
    const done = { ...payload(), method, date: new Date().toISOString() };
    const hist = store.get("masmar_orders", []); hist.push(done); store.set("masmar_orders", hist);
    $("#doneName").textContent = (order.nombre || "").split(" ")[0];
    $("#doneRef").textContent = ref;
    $("#doneEmail").textContent = order.email || "";
    cart = []; ref = ""; save();
    goStep(3);
    celebrate();
  }
  function celebrate() {
    const box = $(".done__flies");
    box.innerHTML = Array.from({ length: 9 }, () => `<svg viewBox="0 0 120 100"><use href="#butterfly"/></svg>`).join("");
    if (!hasGsap || reduce) return;
    $$("svg", box).forEach((f, i) => gsap.fromTo(f, { x: -25, y: 0, scale: 0.2, opacity: 0 }, {
      x: gsap.utils.random(-220, 220) - 25, y: gsap.utils.random(-80, 40), scale: gsap.utils.random(0.5, 1.1),
      rotate: gsap.utils.random(-40, 40), opacity: 1, duration: 1.4, delay: i * 0.05, ease: "power3.out"
    }));
  }

  /* ===================== NAV inteligente ===================== */
  let lastY = 0;
  addEventListener("scroll", () => {
    const y = scrollY;
    $("#nav").classList.toggle("is-hidden", y > lastY && y > 400);
    lastY = y;
  }, { passive: true });

  // API para la página de producto
  window.Masmar = { addToCart, openCheckout, setRoll, eur, artFor, toast, go, productUrl, get hasGsap() { return hasGsap && !reduce; } };

  /* =================== MICROINTERACCIONES =================== */
  rollAll();
  // Onda al hacer clic
  document.addEventListener("pointerdown", (e) => {
    const b = e.target.closest(".btn, .card__add, .chip, .pills button, .paytab");
    if (!b) return;
    const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height);
    const sp = make("span", "ripple");
    sp.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    b.appendChild(sp); setTimeout(() => sp.remove(), 800);
  });

  /* ===================== ANIMACIONES ===================== */
  function hideLoader() {
    const l = $("#loader");
    if (!l || l.dataset.out) return;
    l.dataset.out = 1;
    if (hasGsap && !reduce) gsap.to(l, { yPercent: -100, duration: 0.9, ease: "power4.inOut", onComplete: () => l.remove() });
    else l.remove();
  }

  if (!hasGsap || reduce) {
    document.documentElement.classList.add("no-anim");
    $$("#statementText").forEach((t) => (t.style.opacity = 1));
    $$("[data-count]").forEach((c) => (c.textContent = c.dataset.count));
    addEventListener("load", hideLoader); setTimeout(hideLoader, 1500);
    renderCart();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Scroll suave (Lenis)
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const id = a.getAttribute("href"); if (id.length < 2) return;
      const t = $(id); if (!t) return;
      e.preventDefault(); lenis.scrollTo(t, { offset: id === "#inicio" ? 0 : -20, duration: 1.4 });
    }));
  }

  if (isHome) {
  // Estados iniciales
  gsap.set(".hero__title .word", { yPercent: 115 });
  gsap.set(".hero__in", { y: 24, opacity: 0 });
  gsap.set(".hero__card, .hero__stamp", { scale: 0.85, opacity: 0 });

  function intro() {
    hideLoader();
    const tl = gsap.timeline({ delay: 0.5, defaults: { ease: "power4.out" } });
    tl.to(".hero__title .word", { yPercent: 0, duration: 1.2, stagger: 0.08 })
      .to(".hero__in", { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 }, "-=0.9")
      .to(".hero__card, .hero__stamp", { scale: 1, opacity: 1, duration: 1.2, stagger: 0.12, ease: "expo.out" }, "-=1.1")
      .add(() => $$("[data-count]").forEach((c) => gsap.to({ v: 0 }, { v: +c.dataset.count, duration: 1.6, ease: "power2.out", onUpdate() { c.textContent = Math.round(this.targets()[0].v); } })), "-=0.8");
  }
  let started = false;
  const start = () => { if (!started) { started = true; intro(); } };
  addEventListener("load", start); setTimeout(start, 1600);

  // Parallax por data-speed en el hero
  $$(".hero [data-speed]").forEach((el) => {
    gsap.to(el, { y: () => +el.dataset.speed * 400, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  });
  // Mariposas que revolotean
  gsap.utils.toArray(".fly").forEach((f, i) => gsap.to(f, { x: "random(-30,30)", y: "random(-24,24)", rotate: "random(-18,18)", duration: 3 + i, repeat: -1, yoyo: true, ease: "sine.inOut", repeatRefresh: true }));

  } // fin hero

  // Títulos: cada palabra sube desde una máscara
  function splitWords(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((n) => {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((p) => {
        if (!p) return;
        if (/^\s+$/.test(p)) return frag.append(" ");
        const w = make("span", "wd"), i = document.createElement("span");
        i.textContent = p; w.append(i); frag.append(w);
      });
      n.replaceWith(frag);
    });
  }
  $$(".h2").forEach((h) => {
    h.classList.remove("reveal"); splitWords(h);
    gsap.from($$(".wd > span", h), { yPercent: 115, rotate: 5, duration: 1.1, stagger: 0.06, ease: "power4.out", scrollTrigger: { trigger: h, start: "top 88%" } });
  });

  // Revelados genéricos
  gsap.set(".reveal", { y: 50, opacity: 0 });
  ScrollTrigger.batch(".reveal", { start: "top 88%", once: true, onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "power3.out" }) });

  // Tarjetas de producto: la foto se descubre como un telón
  gsap.set(".card", { y: 70, opacity: 0, rotate: () => gsap.utils.random(-2, 2) });
  gsap.set(".card__media", { clipPath: "inset(100% 0% 0% 0% round 28px)" });
  ScrollTrigger.batch(".card", { start: "top 92%", once: true, onEnter: (els) => {
    gsap.to(els, { y: 0, opacity: 1, rotate: 0, duration: 1, stagger: 0.09, ease: "power3.out" });
    gsap.to(els.map((c) => c.querySelector(".card__media")), { clipPath: "inset(0% 0% 0% 0% round 28px)", duration: 1.3, stagger: 0.09, ease: "expo.out", clearProps: "clipPath" });
    gsap.from(els.map((c) => c.querySelector(".art, img")), { scale: 1.35, duration: 1.6, stagger: 0.09, ease: "expo.out", clearProps: "transform" });
  } });

  if (isHome) {
  const mm = gsap.matchMedia();
  mm.add("(min-width: 961px)", () => {
    // Colecciones: scroll horizontal fijado
    const track = $("#colTrack");
    const dist = () => track.scrollWidth - (innerWidth - track.getBoundingClientRect().left) + 40;
    const horiz = gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: {
        trigger: ".collections", pin: ".collections__pin", start: "top top", end: () => "+=" + dist(), scrub: 1, invalidateOnRefresh: true,
        onUpdate: (s) => gsap.set("#colProgress", { width: s.progress * 100 + "%" })
      }
    });
    // Cada tarjeta entra girando y subiendo mientras se desliza
    gsap.utils.toArray(".col-card").forEach((c, i) => i && gsap.from(c, {
      y: 90, rotate: 7, opacity: 0.35, ease: "none",
      scrollTrigger: { trigger: c, containerAnimation: horiz, start: "left 100%", end: "left 60%", scrub: true }
    }));
    gsap.utils.toArray(".col-card .art svg").forEach((s) => gsap.fromTo(s, { scale: 1.15 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".collections", start: "top top", end: () => "+=" + dist(), scrub: true } }));
  });

  // Frase que se ilumina palabra a palabra
  const st = $("#statementText");
  st.innerHTML = st.innerHTML.replace(/(<em>.*?<\/em>)|([^\s<]+)/g, (m, em) => em ? `<span class="w">${m}</span>` : `<span class="w">${m}</span>`);
  gsap.to("#statementText .w", { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: "#statement", start: "top 70%", end: "bottom 60%", scrub: true } });

  // Hilo que se cose al hacer scroll
  const thread = $("#thread");
  const len = thread.getTotalLength();
  const mask = thread.cloneNode(); // trazo continuo que "revela" el punteado
  mask.removeAttribute("id"); mask.setAttribute("stroke-dasharray", len); mask.setAttribute("stroke-dashoffset", len);
  mask.setAttribute("stroke", "url(#gThread)"); mask.setAttribute("stroke-width", "3");
  thread.setAttribute("opacity", ".25");
  thread.after(mask);
  gsap.to(mask, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ".process__wrap", start: "top 70%", end: "bottom 70%", scrub: true } });
  gsap.utils.toArray(".step").forEach((s) => gsap.from(s, { x: s.classList.contains("step--r") ? 80 : -80, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: s, start: "top 82%" } }));
  gsap.utils.toArray(".step__n").forEach((n) => gsap.from(n, { scale: 0, rotate: -90, duration: 0.9, ease: "back.out(2)", scrollTrigger: { trigger: n, start: "top 82%" } }));

  // Mariposa que recorre el hilo al hacer scroll
  const wrap = $(".process__wrap"), lineSvg = $(".process__line");
  const tf = make("div", "thread-fly");
  tf.innerHTML = '<svg viewBox="0 0 120 100"><use href="#butterfly"/></svg>';
  wrap.appendChild(tf);
  const toScreen = (p, m) => new DOMPoint(p.x, p.y).matrixTransform(m);
  function placeFly(p) {
    const m = lineSvg.getScreenCTM(), wr = wrap.getBoundingClientRect();
    const a = toScreen(thread.getPointAtLength(p * len), m), b = toScreen(thread.getPointAtLength(Math.min(len, p * len + 8)), m);
    const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI - 90;
    gsap.to(tf, { x: a.x - wr.left - 23, y: a.y - wr.top - 20, rotate: ang * 0.6, duration: 0.35, ease: "power2.out", overwrite: "auto" });
  }
  ScrollTrigger.create({ trigger: ".process__wrap", start: "top 70%", end: "bottom 70%", onUpdate: (s) => placeFly(s.progress), onRefresh: (s) => placeFly(s.progress) });

  } // fin secciones de la portada

  // Barra de progreso de lectura
  const bar = make("div", "progress"); document.body.appendChild(bar);
  gsap.to(bar, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

  // Marquesina: acelera un poco con el scroll y vuelve sola a su ritmo
  const mq = $("#marquee");
  if (mq) {
    mq.style.animation = "none";
    const loop = gsap.to(mq, { xPercent: -50, ease: "none", duration: 32, repeat: -1 });
    let vel = 0, skewNow = 0;
    ScrollTrigger.create({ onUpdate: (st) => { vel = st.getVelocity(); } });
    gsap.ticker.add(() => {
      const k = gsap.ticker.deltaRatio(60); // igual de rápido a 30 o a 120 fps
      vel *= Math.pow(0.88, k); // la velocidad decae aunque ya no haya scroll
      const target = 1 + Math.min(Math.abs(vel) / 1500, 2); // como mucho 3x
      loop.timeScale(loop.timeScale() + (target - loop.timeScale()) * (1 - Math.pow(0.92, k)));
      skewNow += (gsap.utils.clamp(-6, 6, vel / -500) - skewNow) * (1 - Math.pow(0.85, k));
      gsap.set(mq, { skewX: Math.abs(skewNow) < 0.01 ? 0 : skewNow });
    });
  }

  // Destellos que titilan
  const star = '<svg viewBox="0 0 20 20"><path d="M10 0C11 7 13 9 20 10C13 11 11 13 10 20C9 13 7 11 0 10C7 9 9 7 10 0Z" fill="currentColor"/></svg>';
  [[".hero", 12], [".final__card", 8], [".custom__stage", 6]].forEach(([sel, n]) => {
    const host = $(sel);
    if (!host) return;
    for (let i = 0; i < n; i++) {
      const s = make("span", "sparkle"), sz = gsap.utils.random(8, 18);
      s.innerHTML = star;
      Object.assign(s.style, { left: gsap.utils.random(3, 95) + "%", top: gsap.utils.random(5, 92) + "%", width: sz + "px", height: sz + "px", animationDelay: gsap.utils.random(0, 3) + "s" });
      host.appendChild(s);
    }
  });

  if (fine) {
    // Cursor personalizado
    document.documentElement.classList.add("has-cursor");
    const dot = make("div", "cursor-dot"), ring = make("div", "cursor-ring");
    ring.innerHTML = "<span></span>";
    document.body.append(dot, ring);
    const q = (el, p, d) => gsap.quickTo(el, p, { duration: d, ease: "power3" });
    const dX = q(dot, "x", 0.08), dY = q(dot, "y", 0.08), rX = q(ring, "x", 0.45), rY = q(ring, "y", 0.45);
    addEventListener("pointermove", (e) => { dX(e.clientX); dY(e.clientY); rX(e.clientX); rY(e.clientY); dot.classList.remove("is-hidden"); ring.classList.remove("is-hidden"); });
    document.addEventListener("pointerover", (e) => {
      const ctl = e.target.closest("a, button, input, textarea, label, select");
      const view = !ctl && e.target.closest(".card__media, .col-card, .pd__stage");
      ring.classList.toggle("is-hover", !!ctl);
      ring.classList.toggle("is-view", !!view);
      if (view) ring.firstChild.textContent = view.dataset.cursor || "Ver";
    });
    addEventListener("scroll", () => ring.classList.remove("is-view", "is-hover"), { passive: true });
    document.addEventListener("mouseleave", () => { dot.classList.add("is-hidden"); ring.classList.add("is-hidden"); });
    $$(".col-card").forEach((c) => c.addEventListener("click", (e) => { if (!e.target.closest("a")) c.querySelector(".link-arrow").click(); }));

    // Botones magnéticos
    $$(".btn, .cart-btn, .chip").forEach((b) => {
      const xTo = gsap.quickTo(b, "x", { duration: 0.5, ease: "power3" }), yTo = gsap.quickTo(b, "y", { duration: 0.5, ease: "power3" });
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3); yTo((e.clientY - r.top - r.height / 2) * 0.45);
      });
      b.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });

    // Inclinación 3D con brillo
    $$(".card__media, .col-card, .hero__card--main, .review").forEach((c) => {
      c.appendChild(make("span", "glare"));
      c.addEventListener("pointermove", (e) => {
        const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        gsap.to(c, { rotateY: (px - 0.5) * 12, rotateX: (0.5 - py) * 12, transformPerspective: 900, duration: 0.5, ease: "power2.out", overwrite: "auto" });
        c.style.setProperty("--gx", px * 100 + "%"); c.style.setProperty("--gy", py * 100 + "%");
      });
      c.addEventListener("pointerleave", () => gsap.to(c, { rotateX: 0, rotateY: 0, duration: 1, ease: "elastic.out(1,0.5)", overwrite: "auto" }));
    });

    // El escaparate del hero sigue al ratón
    if (isHome) {
    const sX = q(".hero__stage", "x", 1.2), sY = q(".hero__stage", "y", 1.2);
    $(".hero").addEventListener("pointermove", (e) => { sX((e.clientX / innerWidth - 0.5) * -36); sY((e.clientY / innerHeight - 0.5) * -24); });
    }
  }

  // CTA final con zoom suave
  if ($(".final__card")) gsap.fromTo(".final__card", { scale: 0.9, borderRadius: 80 }, { scale: 1, borderRadius: 40, ease: "none", scrollTrigger: { trigger: ".final", start: "top bottom", end: "center center", scrub: true } });

  renderCart();
})();
