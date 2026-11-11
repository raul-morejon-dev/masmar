// Servidor mínimo para cobrar con Stripe Checkout (tarjeta, Apple Pay, Google Pay).
// 1) npm install express stripe cors
// 2) STRIPE_SECRET_KEY=sk_live_... SITE_URL=https://tu-dominio.com node server/stripe-server.js
// 3) En config.js pon: stripeCheckoutEndpoint: "https://tu-dominio.com/api/checkout"
//
// IMPORTANTE: los precios se recalculan aquí desde el catálogo, nunca se confía
// en el precio que envía el navegador.
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const SITE = process.env.SITE_URL || "http://localhost:5173";

// Carga el mismo catálogo que usa la web
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "config.js"), "utf8"), ctx);
const CFG = ctx.window.MASMAR_CONFIG;
const CUSTOM_BASE = 65, CUSTOM_EXTRAS = { crown: 6, bow: 4, none: 0 };

function priceFor(item) {
  if (item.id.startsWith("custom-")) {
    const extra = item.id.split("-")[3];
    return CUSTOM_BASE + (CUSTOM_EXTRAS[extra] ?? 0);
  }
  const p = CFG.products.find((x) => x.id === item.id.split("::")[0]);
  if (!p) throw new Error("Producto desconocido: " + item.id);
  return p.price;
}

const app = express();
app.use(cors({ origin: SITE }));
app.use(express.json());

app.post("/api/checkout", async (req, res) => {
  try {
    const { items, shipping, customer, ref } = req.body;
    const sub = items.reduce((s, i) => s + priceFor(i) * i.qty, 0);
    const ship = CFG.shipping.find((s) => s.id === shipping) || CFG.shipping[0];
    const shipCost = ship.price === 0 || (ship.id === "std" && sub >= CFG.freeShippingFrom) ? 0 : ship.price;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "es",
      customer_email: customer?.email,
      client_reference_id: ref,
      line_items: items.map((i) => ({
        quantity: i.qty,
        price_data: { currency: "eur", unit_amount: Math.round(priceFor(i) * 100), product_data: { name: i.name, description: i.desc || undefined } }
      })),
      shipping_options: [{ shipping_rate_data: { display_name: ship.name, type: "fixed_amount", fixed_amount: { amount: Math.round(shipCost * 100), currency: "eur" } } }],
      metadata: { ref, nombre: customer?.nombre, tel: customer?.tel, direccion: `${customer?.dir}, ${customer?.cp} ${customer?.ciudad}`, mensaje: customer?.mensaje || "" },
      success_url: `${SITE}/?pedido=ok&ref=${ref}`,
      cancel_url: `${SITE}/?pedido=cancelado`
    });
    res.json({ url: session.url });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 4242, () => console.log("Stripe checkout listo"));
