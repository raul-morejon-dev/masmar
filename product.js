/* Página de producto: se pinta ANTES de app.js para que reciba
   las mismas animaciones (botones, inclinación 3D, revelados…). */
(function () {
  "use strict";
  const CFG = window.MASMAR_CONFIG;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const eur = (n) => n.toLocaleString("es-ES", { style: "currency", currency: CFG.currency });
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const M = () => window.Masmar; // disponible cuando app.js ha cargado

  const id = new URLSearchParams(location.search).get("id");
  const p = CFG.products.find((x) => x.id === id) || CFG.products[0];
  const d = { ...(CFG.details[p.cat] || {}), ...(p.details || {}) };
  const CAT = { munecas: "Muñecas", bolsos: "Bolsos", fieltro: "Fieltro", eventos: "Eventos" }[p.cat];
  document.title = `${p.name} · Masmar`;
  document.body.classList.add("is-product");

  /* ---------- Vistas de la galería (recortes de la ilustración) ---------- */
  const VIEWS = {
    doll: [["Vista completa"], ["Carita pintada", "88 72 124 124"], ["Pelo de lana y flores", "72 44 130 130"], ["Encaje del vestido", "84 236 132 132"]],
    bag: [["Vista completa"], ["Ilustración", "88 150 124 124"], ["Asas y costuras", "60 40 180 170"]],
    fruit: [["Cesta completa"], ["Piña", "98 58 104 150"], ["Uvas y plátano", "150 236 120 120"]],
    charm: [["Pack completo"], ["Detalle", "44 88 120 150"], ["Bordado", "146 140 120 150"]]
  };
  const views = p.img ? [["Foto"]] : VIEWS[p.art.type] || [["Vista completa"]];
  const viewArt = (vb) => {
    if (p.img) return `<img src="${p.img}" alt="${esc(p.name)}">`;
    const s = MasmarArt.render(p.art);
    return vb ? s.replace(/viewBox="[^"]*"/, `viewBox="${vb}"`) : s;
  };

  /* ---------- Fecha estimada de entrega ---------- */
  const fmt = (days) => {
    const t = new Date(); let n = 0;
    while (n < days) { t.setDate(t.getDate() + 1); if (t.getDay() % 6) n++; } // días laborables
    return t.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  };
  const [pMin, pMax] = d.plazo || [3, 5];

  const per = d.personaliza;
  const check = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  $("#pd").innerHTML = `
    <nav class="crumbs reveal" aria-label="Ruta">
      <a href="index.html">Inicio</a><span>/</span><a href="index.html#tienda">${CAT}</a><span>/</span><b>${esc(p.name)}</b>
    </nav>
    <section class="pd">
      <div class="pd__gallery">
        <div class="pd__stage" id="pdStage" style="--bg:${p.bg || "var(--lila-50)"}" data-cursor="Zoom">
          ${p.badge ? `<span class="card__badge ${p.hot ? "card__badge--hot" : ""}">${p.badge}</span>` : ""}
          <div class="pd__view" id="pdView">${viewArt(views[0][1])}</div>
          <span class="pd__hint">${matchMedia("(pointer: fine)").matches ? "Pasa el ratón" : "Toca"} para ver de cerca</span>
        </div>
        <div class="pd__thumbs" id="pdThumbs">
          ${views.map(([label, vb], i) => `<button class="pd__thumb ${i ? "" : "is-active"}" data-i="${i}" style="--bg:${p.bg || "var(--lila-50)"}" aria-label="${label}"><span class="pd__thumb-art">${viewArt(vb)}</span><small>${label}</small></button>`).join("")}
        </div>
      </div>

      <div class="pd__info">
        <p class="eyebrow pd-in">${CAT} · Hecho a mano</p>
        <h1 class="pd__title pd-in">${esc(p.name)}</h1>
        <p class="pd__price pd-in"><span id="pdPrice">${eur(p.price)}</span> <small>IVA incluido</small></p>
        <p class="pd__lead pd-in">${esc(p.desc)}. ${esc((d.long || "").split(". ")[0])}.</p>
        <ul class="pd__hl pd-in">${(d.highlights || []).map((h) => `<li>${check}${h}</li>`).join("")}</ul>

        ${per ? `
        <div class="pd__opts pd-in">
          <div class="field"><label for="pdName">${per.label} <span class="req">*</span></label>
            <input class="input input--script" id="pdName" maxlength="20" placeholder="${per.placeholder}" autocomplete="off" /></div>
          <div class="field"><label for="pdExtra">${per.extra}</label>
            <input class="input" id="pdExtra" maxlength="60" autocomplete="off" /></div>
        </div>` : ""}

        <div class="pd__buy pd-in">
          <div class="qty qty--lg" id="pdQty"><button data-q="-1" aria-label="Menos">−</button><span>1</span><button data-q="1" aria-label="Más">+</button></div>
          <button class="btn btn--primary pd__add" id="pdAdd">Añadir a la cesta · ${eur(p.price)}</button>
        </div>
        <button class="btn btn--ghost btn--block pd-in" id="pdNow">Comprar ahora</button>

        <div class="pd__eta pd-in">
          <svg viewBox="0 0 24 24"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="7" cy="17.5" r="1.8" fill="currentColor"/><circle cx="17" cy="17.5" r="1.8" fill="currentColor"/></svg>
          <span>${pMax > 7 ? "Se confecciona por encargo. " : ""}Pídelo hoy y llega entre el <b>${fmt(pMin)}</b> y el <b>${fmt(pMax)}</b>.</span>
        </div>
        <ul class="pd__trust pd-in">
          <li><svg><use href="#i-lock"/></svg>Pago seguro</li>
          <li><svg><use href="#i-heart"/></svg>Hecho a mano</li>
          <li><svg><use href="#i-bag"/></svg>Caja regalo</li>
        </ul>
        ${p.cat === "munecas" ? `<a class="pd__custom pd-in" href="index.html#personaliza"><span>¿Otro peinado o color de vestido?</span><b>Diséñala a tu gusto →</b></a>` : ""}
      </div>
    </section>

    <section class="pd-details">
      <div class="pd-tabs reveal" role="tablist" id="pdTabs">
        <button class="is-active" data-tab="desc" role="tab">Descripción</button>
        <button data-tab="medidas" role="tab">Medidas</button>
        <button data-tab="mat" role="tab">Materiales</button>
        <button data-tab="cuid" role="tab">Cuidados</button>
        <button data-tab="envio" role="tab">Envío y devoluciones</button>
        <span class="pd-tabs__ink" id="pdInk"></span>
      </div>
      <div class="pd-panels reveal">
        <div class="pd-panel is-active" data-panel="desc">
          <div class="pd-cols">
            <div><h3>Sobre esta pieza</h3><p>${d.long || p.desc}</p></div>
            <div><h3>Qué incluye</h3><ul class="pd-list">${(d.incluye || []).map((x) => `<li>${check}${x}</li>`).join("")}</ul></div>
          </div>
        </div>
        <div class="pd-panel" data-panel="medidas">
          <div class="pd-cols pd-cols--measure">
            <div class="measure">
              <div class="measure__art" style="--bg:${p.bg || "var(--lila-50)"}">${viewArt()}</div>
              <span class="measure__h"><i>${d.size?.h || ""}</i></span>
              <span class="measure__w"><i>${d.size?.w || ""}</i></span>
            </div>
            <div>
              <h3>Medidas</h3>
              <table class="spec">${(d.medidas || []).map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join("")}</table>
              <p class="note">Al ser piezas hechas a mano, las medidas pueden variar ±1 cm.</p>
            </div>
          </div>
        </div>
        <div class="pd-panel" data-panel="mat">
          <h3>Materiales</h3><ul class="pd-list">${(d.materiales || []).map((x) => `<li>${check}${x}</li>`).join("")}</ul>
        </div>
        <div class="pd-panel" data-panel="cuid">
          <h3>Cómo cuidarla</h3><ul class="pd-list">${(d.cuidados || []).map((x) => `<li>${check}${x}</li>`).join("")}</ul>
        </div>
        <div class="pd-panel" data-panel="envio">
          <div class="pd-cols">
            <div><h3>Envío</h3><table class="spec">${CFG.shipping.map((s) => `<tr><th>${s.name}<small>${s.eta}</small></th><td>${s.price ? eur(s.price) : "Gratis"}</td></tr>`).join("")}</table>
              <p class="note">Envío estándar gratis en pedidos desde ${eur(CFG.freeShippingFrom)}.</p></div>
            <div><h3>Devoluciones</h3><p>${per ? "Las piezas personalizadas se hacen solo para ti, por eso no admiten devolución salvo defecto de fabricación. Antes de coserla te enseñamos el boceto para que todo quede perfecto." : "Tienes 14 días desde que lo recibes para devolverlo sin dar explicaciones. Escríbenos y te indicamos cómo hacerlo."}</p></div>
          </div>
        </div>
      </div>
    </section>

    <section class="pd-related">
      <div class="section-head reveal"><p class="eyebrow">Completa tu regalo</p><h2 class="h2">También te puede <em>gustar</em></h2></div>
      <div class="grid" id="pdRelated">
        ${CFG.products.filter((x) => x.id !== p.id).sort((a, b) => (b.cat === p.cat) - (a.cat === p.cat)).slice(0, 4).map((x) => `
          <article class="card" data-id="${x.id}">
            <div class="card__media" style="--bg:${x.bg || "var(--lila-50)"}" data-cursor="Ver">
              ${x.badge ? `<span class="card__badge ${x.hot ? "card__badge--hot" : ""}">${x.badge}</span>` : ""}
              ${x.img ? `<img src="${x.img}" alt="${esc(x.name)}" loading="lazy">` : `<div class="art">${MasmarArt.render(x.art)}</div>`}
              <button class="card__add" data-add="${x.id}">Añadir · ${eur(x.price)}</button>
            </div>
            <div class="card__info"><div><h3><a href="producto.html?id=${x.id}">${esc(x.name)}</a></h3><p>${esc(x.desc)}</p></div><span class="card__price">${eur(x.price)}</span></div>
          </article>`).join("")}
      </div>
    </section>

    <div class="pd-sticky" id="pdSticky">
      <div class="pd-sticky__art">${viewArt()}</div>
      <div class="pd-sticky__txt"><b>${esc(p.name)}</b><span id="pdStickyPrice">${eur(p.price)}</span></div>
      <button class="btn btn--primary btn--sm" id="pdStickyAdd">Añadir a la cesta</button>
    </div>`;

  /* ---------- Galería: miniaturas y lupa ---------- */
  const stage = $("#pdStage"), view = $("#pdView");
  $("#pdThumbs").addEventListener("click", (e) => {
    const t = e.target.closest(".pd__thumb"); if (!t || t.classList.contains("is-active")) return;
    $$(".pd__thumb").forEach((x) => x.classList.toggle("is-active", x === t));
    view.classList.add("is-swap");
    setTimeout(() => { view.innerHTML = viewArt(views[+t.dataset.i][1]); view.classList.remove("is-swap"); }, 260);
  });
  const zoomAt = (e) => {
    const r = stage.getBoundingClientRect();
    view.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
  };
  if (matchMedia("(pointer: fine)").matches) {
    stage.addEventListener("pointerenter", (e) => { zoomAt(e); stage.classList.add("is-zoom"); });
    stage.addEventListener("pointermove", zoomAt);
    stage.addEventListener("pointerleave", () => stage.classList.remove("is-zoom"));
  } else {
    stage.addEventListener("click", (e) => { zoomAt(e); stage.classList.toggle("is-zoom"); });
  }

  /* ---------- Pestañas con indicador animado ---------- */
  const tabs = $("#pdTabs"), ink = $("#pdInk");
  const moveInk = (b) => { ink.style.width = b.offsetWidth + "px"; ink.style.transform = `translateX(${b.offsetLeft}px)`; };
  tabs.addEventListener("click", (e) => {
    const b = e.target.closest("[data-tab]"); if (!b) return;
    $$("[data-tab]", tabs).forEach((x) => x.classList.toggle("is-active", x === b));
    $$(".pd-panel").forEach((x) => x.classList.toggle("is-active", x.dataset.panel === b.dataset.tab));
    moveInk(b);
    b.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  });
  addEventListener("load", () => moveInk($("[data-tab].is-active", tabs)));
  addEventListener("resize", () => moveInk($("[data-tab].is-active", tabs)));
  setTimeout(() => moveInk($("[data-tab].is-active", tabs)), 300);

  /* ---------- Cantidad, personalización y compra ---------- */
  let qty = 1;
  const addBtn = $("#pdAdd");
  const updatePrice = () => {
    M()?.setRoll(addBtn, `Añadir a la cesta · ${eur(p.price * qty)}`);
    $("#pdStickyPrice").textContent = eur(p.price * qty);
  };
  $("#pdQty").addEventListener("click", (e) => {
    const b = e.target.closest("[data-q]"); if (!b) return;
    qty = Math.max(1, Math.min(99, qty + +b.dataset.q));
    $("#pdQty span").textContent = qty;
    updatePrice();
  });

  function addCurrent(fromEl) {
    let item = p, lineId = p.id;
    if (per) {
      const nameEl = $("#pdName"), name = nameEl.value.trim(), extra = $("#pdExtra").value.trim();
      if (!name) {
        nameEl.classList.add("is-error", "shake");
        setTimeout(() => nameEl.classList.remove("shake"), 600);
        nameEl.scrollIntoView({ block: "center", behavior: "smooth" });
        nameEl.focus({ preventScroll: true });
        M().toast(`Escribe ${per.label.toLowerCase()} para personalizarla`);
        return false;
      }
      lineId = `${p.id}::${name}::${extra}`;
      item = { ...p, id: lineId, name: `${p.name} · ${name}`, desc: [`${per.label}: ${name}`, extra].filter(Boolean).join(" · ") };
    }
    M().addToCart(lineId, qty, fromEl, item);
    addBtn.classList.add("is-done"); M().setRoll(addBtn, "✓ ¡Añadido a tu cesta!");
    clearTimeout(addBtn._t); addBtn._t = setTimeout(() => { addBtn.classList.remove("is-done"); updatePrice(); }, 1800);
    return true;
  }
  addBtn.addEventListener("click", () => addCurrent(stage));
  $("#pdNow").addEventListener("click", () => { if (addCurrent(stage)) setTimeout(() => M().openCheckout(), 900); });
  $("#pdStickyAdd").addEventListener("click", () => addCurrent($(".pd-sticky__art")));

  // Productos relacionados
  $("#pdRelated").addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) { M().addToCart(add.dataset.add, 1, add.closest(".card__media")); return; }
    const media = e.target.closest(".card__media");
    if (media) M().go(M().productUrl(media.closest(".card").dataset.id));
  });

  // Barra fija cuando el botón principal sale de pantalla
  const sticky = $("#pdSticky");
  new IntersectionObserver(([en]) => sticky.classList.toggle("is-on", !en.isIntersecting && en.boundingClientRect.top < 0))
    .observe(addBtn);

  // Entrada de la ficha
  addEventListener("load", () => {
    if (!M()?.hasGsap) return;
    gsap.from(".pd__stage", { clipPath: "inset(12% 12% 12% 12% round 40px)", scale: 0.92, opacity: 0, duration: 1.4, ease: "expo.out", clearProps: "clipPath,transform" });
    gsap.from(".pd__thumb", { y: 30, opacity: 0, stagger: 0.08, duration: 0.9, delay: 0.3, ease: "power3.out" });
    gsap.from(".pd-in", { y: 34, opacity: 0, stagger: 0.07, duration: 0.9, delay: 0.15, ease: "power3.out" });
  });
})();
