/* Ilustraciones vectoriales de los productos (marcadores de posición).
   Cuando tengas fotos reales, añade "img" a cada producto en config.js. */
(function () {
  const SKIN = "#f7dfcf";
  const LINE = "rgba(59,42,107,.14)";
  let uid = 0;
  const svg = (inner) => `<svg viewBox="0 0 300 375" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;
  const shade = (hex, amt) => {
    const n = parseInt(hex.slice(1), 16);
    const c = (v) => Math.max(0, Math.min(255, v + amt));
    return "#" + [c(n >> 16), c((n >> 8) & 255), c(n & 255)].map((v) => v.toString(16).padStart(2, "0")).join("");
  };

  // Muñeca de trapo estilo Masmar: pelo de lana en mechones, cara rosada,
  // pestañas largas, pecas blancas y vestido de encaje con tul.
  function doll({ hair = "#a88660", dress = "#ffffff", accent = "#c9b3f2", extra = "crown" } = {}) {
    const k = ++uid;
    let seed = 11;
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const hd = shade(hair, -38), hl = shade(hair, 26);
    const FABRIC = "#ecd8bb", FABRIC_D = "#d9bf9c";
    const base = dress.toLowerCase() === "#ffffff" ? "#eef1f6" : dress;

    // Un mechón de lana: base gruesa + torsión punteada + brillo
    const yarn = (d, w = 6.5) =>
      `<path d="${d}" stroke="${hair}" stroke-width="${w}" fill="none" stroke-linecap="round"/>` +
      `<path d="${d}" stroke="${hd}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-dasharray="1.6 2.6" opacity=".55"/>` +
      `<path d="${d}" stroke="${hl}" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-dasharray="1.5 2.7" opacity=".7"/>`;
    const hang = (x, y0, y1, flare) => {
      const w1 = (rnd() - 0.5) * 8, w2 = (rnd() - 0.5) * 8;
      return yarn(`M${x} ${y0} C${x + w1} ${y0 + (y1 - y0) * 0.35}, ${x + flare + w2} ${y0 + (y1 - y0) * 0.7}, ${x + flare} ${y1}`);
    };

    // Mechones de detrás (volumen)
    let back = "";
    for (let i = 0; i < 9; i++) back += hang(84 + i * 4.2, 112, 250 + rnd() * 26, -10 + i * 0.6);
    for (let i = 0; i < 9; i++) back += hang(216 - i * 4.2, 112, 250 + rnd() * 26, 10 - i * 0.6);
    // Mechones delanteros que enmarcan la cara
    let front = "";
    for (let i = 0; i < 4; i++) front += hang(85 + i * 3.4, 132, 236 + rnd() * 24, -8 + i);
    for (let i = 0; i < 4; i++) front += hang(215 - i * 3.4, 132, 236 + rnd() * 24, 8 - i);

    // Casquete con raya al medio
    const cap = "M88 164 C82 84, 118 63, 150 65 C182 63, 218 84, 212 164 C204 128, 186 104, 150 100 C114 104, 96 128, 88 164 Z";
    const bez = (t, a, b, c, d) => (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t * t * c + t ** 3 * d;
    let capStrands = "";
    for (const side of [-1, 1]) {
      for (let i = 0; i <= 15; i++) {
        const t = i / 15;
        const px = 150 + side * (150 - bez(t, 88, 96, 114, 150)), py = bez(t, 164, 128, 104, 100);
        const cx = px + side * (4 + Math.abs(px - 150) * 0.05), cy = 64 + (py - 64) * 0.12;
        capStrands += yarn(`M${150 + side * 1.5} 66 Q${cx.toFixed(1)} ${cy.toFixed(1)} ${px.toFixed(1)} ${(py + 4).toFixed(1)}`, 6);
      }
    }

    const defs = `<pattern id="lace${k}" width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(8)">
        <g fill="#fff" stroke="rgba(120,120,140,.25)" stroke-width=".5">
          ${[0, 72, 144, 216, 288].map((r) => `<ellipse cx="17" cy="11" rx="3.4" ry="6" transform="rotate(${r} 17 17)"/>`).join("")}
          <circle cx="17" cy="17" r="2.6"/>
          <path d="M0 34 q6 -8 12 -2 M22 0 q6 8 12 2" fill="none" stroke="#fff" stroke-width="1.6"/>
          <circle cx="3" cy="4" r="1.4"/><circle cx="31" cy="28" r="1.4"/><circle cx="5" cy="24" r="1"/>
        </g></pattern>
      <pattern id="tulle${k}" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0 L4 4 M4 0 L0 4" stroke="#fff" stroke-width=".4" opacity=".7"/></pattern>
      <radialGradient id="face${k}" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="#f9c9bb"/><stop offset=".7" stop-color="#f2aaa0"/><stop offset="1" stop-color="#e5928c"/></radialGradient>
      <linearGradient id="fold${k}" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <clipPath id="cap${k}"><path d="${cap}"/></clipPath>`;

    const skirt = "M112 232 C98 282, 78 332, 56 380 L244 380 C222 332, 202 282, 188 232 Z";
    let hem = "";
    for (let x = 58; x <= 242; x += 12) hem += `<circle cx="${x}" cy="374" r="7" fill="#fff" opacity=".9"/>`;

    // Pestañas largas en abanico (se dibuja la izquierda y se refleja)
    const lashes = (cx) => [0, 1, 2, 3, 4].map((j) => {
      const a = (-165 + j * 22) * Math.PI / 180, len = 8 + (j === 1 || j === 2 ? 5 : j === 0 ? 2 : 0);
      const sx = cx + Math.cos(a) * 7.5, sy = 146 + Math.sin(a) * 6.5;
      const ex = sx + Math.cos(a) * len, ey = sy + Math.sin(a) * len - 2;
      return `M${sx.toFixed(1)} ${sy.toFixed(1)} Q${((sx + ex) / 2 + 1).toFixed(1)} ${((sy + ey) / 2 + 1.5).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
    }).join(" ");

    const flower = (x, y, r, c = "#fffaf0") => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map((a) => `<ellipse cy="${-r * 0.6}" rx="${r * 0.45}" ry="${r * 0.62}" fill="${c}" stroke="rgba(140,130,110,.25)" stroke-width=".6" transform="rotate(${a})"/>`).join("")}<circle r="${r * 0.28}" fill="#f4d98b"/></g>`;
    const band = `<path d="M90 140 C84 78, 120 58, 150 60 C180 58, 216 78, 210 140" stroke="${accent}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M92 128 C88 80, 120 62, 150 63" stroke="#fff" stroke-width="1.5" fill="none" opacity=".5" stroke-dasharray="3 3"/>`;
    let deco = "";
    if (extra === "crown") {
      deco = band + `<g>
        <ellipse cx="96" cy="86" rx="10" ry="4" fill="#9cc49a" transform="rotate(-50 96 86)"/><ellipse cx="134" cy="56" rx="10" ry="4" fill="#9cc49a" transform="rotate(-10 134 56)"/>
        ${flower(104, 80, 11)}${flower(120, 66, 12)}${flower(138, 60, 9)}${flower(95, 98, 8)}${flower(112, 92, 7, "#fdf1ff")}
        <circle cx="127" cy="80" r="2.4" fill="#fff"/><circle cx="90" cy="112" r="2" fill="#fff"/></g>`;
    } else if (extra === "bow") {
      deco = band + `<g transform="translate(92 196)" opacity=".95">
        <path d="M0 0 C-34 -40, -46 6, -6 8 Z" fill="${accent}" fill-opacity=".55" stroke="#fff" stroke-width="1"/>
        <path d="M0 0 C34 -44, 46 4, 6 8 Z" fill="${accent}" fill-opacity=".55" stroke="#fff" stroke-width="1"/>
        <path d="M-2 6 C-14 30, -22 46, -18 64 L-8 60 C-8 44, -2 26, 2 8Z M2 6 C10 30, 16 44, 12 62 L22 58 C20 40, 10 24, 4 8Z" fill="${accent}" fill-opacity=".45" stroke="#fff" stroke-width=".8"/>
        <rect x="-8" y="-4" width="16" height="13" rx="5" fill="${accent}"/>
        <path d="M-30 -12 C-20 -4, -12 0, -4 2 M30 -14 C20 -6, 12 0, 4 2" stroke="#fff" stroke-width="1" opacity=".6" fill="none"/></g>`;
    }

    return svg(`<defs>${defs}</defs>
      <ellipse cx="150" cy="372" rx="110" ry="10" fill="rgba(59,42,107,.10)"/>
      <g class="doll-hair">${back}</g>
      <path d="M100 196 C88 230, 86 262, 92 292 C96 304, 112 302, 112 288 C112 262, 114 232, 118 204Z" fill="${FABRIC}" stroke="${FABRIC_D}"/>
      <path d="M200 196 C212 230, 214 262, 208 292 C204 304, 188 302, 188 288 C188 262, 186 232, 182 204Z" fill="${FABRIC}" stroke="${FABRIC_D}"/>
      <path d="M100 286 q6 6 12 0 M188 286 q6 6 12 0" stroke="${FABRIC_D}" fill="none" stroke-dasharray="2 2"/>
      <rect x="138" y="174" width="24" height="20" rx="6" fill="${FABRIC}"/>
      <path d="${skirt}" fill="${base}"/>
      <path d="${skirt}" fill="url(#lace${k})" opacity=".95"/>
      <path d="${skirt}" fill="url(#tulle${k})"/>
      <path d="M128 240 C120 290, 108 340, 100 380 M172 240 C180 290, 192 340, 200 380 M150 240 L150 380" stroke="url(#fold${k})" stroke-width="14" fill="none" opacity=".8"/>
      ${hem}
      <path d="M112 196 C104 196, 94 210, 92 226 C100 230, 110 228, 116 222Z M188 196 C196 196, 206 210, 208 226 C200 230, 190 228, 184 222Z" fill="#fff" opacity=".85" stroke="rgba(120,120,140,.2)"/>
      <path d="M114 190 Q150 182 186 190 L190 230 L110 230Z" fill="${base}"/>
      <path d="M114 190 Q150 182 186 190 L190 230 L110 230Z" fill="url(#lace${k})"/>
      <path d="M108 224 Q150 234 192 224 L194 240 Q150 250 106 240Z" fill="${accent}"/>
      <path d="M108 226 Q150 236 192 226" stroke="#fff" stroke-width="1" opacity=".5" fill="none" stroke-dasharray="3 3"/>
      <path d="M130 240 C128 262, 126 280, 128 300" stroke="#d8c3a0" stroke-width="1.6" stroke-dasharray=".5 3" stroke-linecap="round" fill="none"/>
      <path d="M128 300 v14 M123 305 h10" stroke="#c9a36e" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="150" cy="130" rx="55" ry="57" fill="url(#face${k})"/>
      <g class="doll-hair">${front}</g>
      <path d="${cap}" fill="${hair}"/>
      <g clip-path="url(#cap${k})">${capStrands}</g>
      ${deco}
      <g class="doll-eyes">
        <g fill="#fff"><ellipse cx="126" cy="147" rx="7.5" ry="7"/><ellipse cx="174" cy="147" rx="7.5" ry="7"/></g>
        <g fill="#6f89a8"><circle cx="126" cy="147.5" r="5.6"/><circle cx="174" cy="147.5" r="5.6"/></g>
        <g fill="#2b3550"><circle cx="126" cy="148" r="2.8"/><circle cx="174" cy="148" r="2.8"/></g>
        <g fill="#fff"><circle cx="128" cy="145" r="1.8"/><circle cx="176" cy="145" r="1.8"/></g>
        <g fill="none" stroke="#1f2233" stroke-width="1.6" stroke-linecap="round">
          <path d="M118.5 146 Q126 139 133.5 146 M166.5 146 Q174 139 181.5 146"/>
          <path d="${lashes(126)}"/><path d="${lashes(126)}" transform="translate(300 0) scale(-1 1)"/>
        </g>
      </g>
      <g fill="#fff">${[[110, 162], [117, 167], [109, 171], [123, 162], [116, 175], [190, 162], [183, 167], [191, 171], [177, 162], [184, 175]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${(1.7 + rnd() * 0.6).toFixed(2)}"/>`).join("")}</g>
      <g fill="#ff9aa2" opacity=".25"><ellipse cx="116" cy="166" rx="14" ry="10"/><ellipse cx="184" cy="166" rx="14" ry="10"/></g>
    `);
  }

  function bag({ a = "#4fd6cf", b = "#3b2a6b", stripes = false } = {}) {
    let body = `<rect x="66" y="118" width="168" height="200" rx="12" fill="#fbf7ef" stroke="${LINE}" stroke-width="2"/>`;
    if (stripes) {
      let s = "";
      for (let x = 66; x < 234; x += 28) s += `<rect x="${x}" y="118" width="14" height="200" fill="${a}"/>`;
      const id = "bc" + (++uid);
      body = `<clipPath id="${id}"><rect x="66" y="118" width="168" height="200" rx="12"/></clipPath><rect x="66" y="118" width="168" height="200" rx="12" fill="#fff"/><g clip-path="url(#${id})">${s}</g><rect x="66" y="118" width="168" height="200" rx="12" fill="none" stroke="${LINE}" stroke-width="2"/>`;
    }
    return svg(`
      <ellipse cx="150" cy="340" rx="90" ry="9" fill="rgba(59,42,107,.08)"/>
      <path d="M108 126 C104 46 196 46 192 126" stroke="${stripes ? shade(b, -20) : a}" stroke-width="10" fill="none" stroke-linecap="round"/>
      ${body}
      <circle cx="150" cy="218" r="62" fill="${stripes ? "#fff" : a}" opacity="${stripes ? 0.9 : 0.35}"/>
      <path d="M104 214 C100 150 200 150 196 214 L202 262 Q178 250 172 226 L128 226 Q122 250 98 262 Z" fill="${b}"/>
      <circle cx="150" cy="214" r="34" fill="${SKIN}"/>
      <path d="M114 210 C118 172 182 172 186 210 C172 192 160 196 150 186 C140 196 128 192 114 210Z" fill="${b}"/>
      <g fill="${shade(a, -40)}"><ellipse cx="138" cy="218" rx="5" ry="7"/><ellipse cx="162" cy="218" rx="5" ry="7"/></g>
      <g fill="#fff"><circle cx="139.5" cy="215" r="2"/><circle cx="163.5" cy="215" r="2"/></g>
      <g fill="#ffb3c1" opacity=".7"><circle cx="130" cy="231" r="5"/><circle cx="170" cy="231" r="5"/></g>
      <path d="M146 236 q4 3 8 0" stroke="#d9867d" stroke-width="2" fill="none" stroke-linecap="round"/>
      <g fill="${a}"><circle cx="96" cy="150" r="4"/><circle cx="208" cy="290" r="5"/><circle cx="210" cy="148" r="3"/></g>
    `);
  }

  function fruit() {
    let grid = ""; const id = "pc" + (++uid);
    for (let i = -3; i <= 3; i++) grid += `<path d="M${118 + i * 14} 150 l40 70 M${158 + i * 14} 150 l-40 70" stroke="#5a4a1a" stroke-width="2" opacity=".35"/>`;
    return svg(`
      <ellipse cx="150" cy="330" rx="120" ry="12" fill="rgba(59,42,107,.08)"/>
      <g fill="#6cc46a"><path d="M150 140 L132 80 L148 110 L150 64 L156 108 L172 78 Z"/></g>
      <clipPath id="${id}"><ellipse cx="150" cy="190" rx="44" ry="56"/></clipPath>
      <ellipse cx="150" cy="190" rx="44" ry="56" fill="#ffd84d"/><g clip-path="url(#${id})">${grid}</g>
      <circle cx="84" cy="270" r="40" fill="#ff5d6c"/><path d="M84 232 q6 -16 18 -18" stroke="#6b4a2a" stroke-width="4" fill="none"/><ellipse cx="98" cy="226" rx="12" ry="6" fill="#6cc46a"/>
      <g fill="#8e6ccf"><circle cx="176" cy="262" r="12"/><circle cx="198" cy="262" r="12"/><circle cx="220" cy="262" r="12"/><circle cx="187" cy="282" r="12"/><circle cx="209" cy="282" r="12"/><circle cx="198" cy="302" r="12"/></g>
      <path d="M118 318 C160 340 230 330 262 290 C250 330 180 352 118 330Z" fill="#ffe066" stroke="#e6c13b" stroke-width="2"/>
      <ellipse cx="236" cy="200" rx="30" ry="36" fill="#8fd96b"/><circle cx="236" cy="208" r="14" fill="#7a5235"/><ellipse cx="236" cy="208" rx="26" ry="30" fill="none" stroke="#fff6c9" stroke-width="5"/>
      <g fill="#fff" opacity=".6"><circle cx="70" cy="258" r="6"/><circle cx="136" cy="168" r="5"/></g>
    `);
  }

  function charm({ a = "#e4a5f0", b = "#7fe0d6", heart = false } = {}) {
    const ring = (x, y) => `<circle cx="${x}" cy="${y}" r="16" fill="none" stroke="#c9c2d9" stroke-width="5"/><path d="M${x} ${y + 16} v22" stroke="#c9c2d9" stroke-width="4" stroke-dasharray="5 3"/>`;
    const dog = (x, y, c1, c2, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
      <ellipse cx="-38" cy="-6" rx="16" ry="30" fill="${c2}" transform="rotate(20 -38 -6)"/>
      <ellipse cx="38" cy="-6" rx="16" ry="30" fill="${c2}" transform="rotate(-20 38 -6)"/>
      <circle r="44" fill="${c1}"/><ellipse cy="16" rx="22" ry="16" fill="#fff" opacity=".85"/>
      <circle cx="-15" cy="-6" r="5" fill="#3b2a6b"/><circle cx="15" cy="-6" r="5" fill="#3b2a6b"/>
      <ellipse cy="10" rx="7" ry="5" fill="#3b2a6b"/>
      <path d="M-30 30 q30 18 60 0" stroke="#ff6b9a" stroke-width="5" fill="none" stroke-dasharray="2 6" stroke-linecap="round"/></g>`;
    const hrt = (x, y, c, t) => `<g transform="translate(${x} ${y})"><path d="M0 40 C-60 0 -40 -50 0 -20 C40 -50 60 0 0 40Z" fill="${c}" stroke="#fff" stroke-width="3" stroke-dasharray="4 4"/><text y="8" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="30" fill="#3b2a6b">${t}</text></g>`;
    const items = heart
      ? ring(100, 110) + hrt(100, 190, a, "L&M") + ring(204, 160) + hrt(204, 240, b, "A")
      : ring(100, 100) + dog(100, 190, a, shade(a, -30)) + ring(206, 150) + dog(206, 240, b, shade(b, -30), 0.9);
    return svg(`<ellipse cx="150" cy="330" rx="110" ry="10" fill="rgba(59,42,107,.08)"/>${items}
      <g fill="#fff" opacity=".7"><circle cx="60" cy="300" r="4"/><circle cx="250" cy="90" r="5"/></g>`);
  }

  const MAP = { doll, bag, fruit, charm };
  window.MasmarArt = {
    render(opts) { return (MAP[opts.type] || doll)(opts); },
    hydrate(root = document) {
      root.querySelectorAll(".art[data-art]").forEach((el) => {
        if (el.dataset.done) return;
        el.innerHTML = MAP[el.dataset.art]({ ...el.dataset });
        el.dataset.done = 1;
      });
    }
  };
})();
