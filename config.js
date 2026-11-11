/* =========================================================
   CONFIGURACIÓN DE LA TIENDA
   Edita este archivo para cambiar productos, envíos y pagos.
   Mientras no pongas claves reales, la web funciona en
   MODO DEMO (simula el pago para que puedas probarla).
   ========================================================= */
window.MASMAR_CONFIG = {
  currency: "EUR",
  freeShippingFrom: 60,

  shipping: [
    { id: "std",  name: "Envío estándar",  eta: "3–5 días laborables", price: 4.95 },
    { id: "exp",  name: "Envío urgente",   eta: "24–48 h",             price: 7.95 },
    { id: "pick", name: "Recogida en taller", eta: "Te avisamos cuando esté lista", price: 0 }
  ],

  payments: {
    // STRIPE (tarjeta, Apple Pay, Google Pay)
    // Opción A — sin servidor: crea un "Payment Link" por producto en Stripe y no hace falta nada más.
    // Opción B — recomendado: un endpoint propio que cree una Checkout Session (ver server/stripe-server.js)
    stripeCheckoutEndpoint: "",          // ej: "https://tu-dominio.com/api/checkout"

    // PAYPAL: pega tu Client ID de https://developer.paypal.com (Apps & Credentials)
    paypalClientId: "",                  // ej: "AbCdEf...". Vacío = modo demo

    // BIZUM: número al que el cliente enviará el pago
    bizumPhone: "600 000 000"
  },

  // Para usar fotos reales, añade "img": "img/archivo.jpg" a cada producto.
  products: [
    { id: "mu-comunion",  cat: "munecas", name: "Muñeca de comunión personalizada", desc: "Con su nombre, peinado y vestido", price: 65, badge: "Más vendida", hot: true,
      art: { type: "doll", hair: "#a88660", dress: "#ffffff", accent: "#c9b3f2", extra: "crown" }, bg: "#f5f0fd" },
    { id: "mu-ritmica",   cat: "munecas", name: "Muñeca deportista con medalla", desc: "Rítmica, fútbol, danza…", price: 58,
      art: { type: "doll", hair: "#3a2a22", dress: "#bff0ec", accent: "#3cc6c2", extra: "bow" }, bg: "#e8f9f8" },
    { id: "mu-trenza",    cat: "munecas", name: "Muñeca trenza de lana", desc: "Pelo de lana natural trenzado", price: 62, badge: "Nuevo",
      art: { type: "doll", hair: "#e2c27a", dress: "#ffdbe3", accent: "#ff9fb4", extra: "crown" }, bg: "#fdecef" },
    { id: "bo-anime",     cat: "bolsos",  name: "Tote bag Anime Ninja", desc: "Lona gruesa 100 % algodón", price: 24, badge: "Edición limitada", hot: true,
      art: { type: "bag", a: "#4fd6cf", b: "#3b2a6b" }, bg: "#e8f9f8" },
    { id: "bo-flores",    cat: "bolsos",  name: "Tote bag Flores y gafas", desc: "Ilustración a todo color", price: 24,
      art: { type: "bag", a: "#ff8fa3", b: "#ffc94d" }, bg: "#fff4e3" },
    { id: "bo-rayas",     cat: "bolsos",  name: "Bolso rayas Bohemia", desc: "Asas reforzadas", price: 27,
      art: { type: "bag", a: "#ffd84d", b: "#b79ce6", stripes: true }, bg: "#fffbe8" },
    { id: "fi-frutas",    cat: "fieltro", name: "Cesta de frutas de fieltro", desc: "8 piezas cosidas a mano", price: 32, badge: "Educativo",
      art: { type: "fruit" }, bg: "#f2fbe9" },
    { id: "ev-llaveros",  cat: "eventos", name: "Llaveros perrito (pack 12)", desc: "Recuerdos para invitados", price: 54,
      art: { type: "charm", a: "#e4a5f0", b: "#7fe0d6" }, bg: "#fde9f0" },
    { id: "ev-corazon",   cat: "eventos", name: "Corazones con iniciales (pack 12)", desc: "Para bodas y bautizos", price: 42,
      art: { type: "charm", a: "#b79ce6", b: "#ffdbe3", heart: true }, bg: "#f5f0fd" }
  ],

  /* FICHA DE PRODUCTO
     Datos por categoría. Si un producto necesita algo distinto, añádele
     "details": { ... } con solo los campos que cambian (p. ej. "long" o "medidas"). */
  details: {
    munecas: {
      long: "Cada muñeca nace de un patrón propio y se cose entera a mano: el cuerpo de algodón, el pelo mechón a mechón con lana suave y la carita pintada con pigmentos textiles. Antes de coserla te pedimos los detalles (nombre, peinado, vestido, accesorios) y te enviamos fotos del proceso para que la veas crecer.",
      medidas: [["Altura total", "45 cm"], ["Ancho con vestido", "22 cm"], ["Diámetro de la cara", "13 cm"], ["Peso aproximado", "350 g"]],
      size: { h: "45 cm", w: "22 cm" },
      materiales: ["Cuerpo de algodón 100 % relleno de fibra hipoalergénica", "Pelo de lana acrílica suave, cosido mechón a mechón", "Vestido de encaje bordado con forro de tul", "Cara pintada a mano con pigmentos textiles", "Accesorios de flores de tela y fieltro"],
      cuidados: ["Limpiar en seco o con un paño húmedo, sin frotar", "No meter en la lavadora", "Mantener alejada del sol directo para que no pierda color", "Peinar el pelo con los dedos si se enreda"],
      incluye: ["Caja regalo con lazo", "Tarjeta escrita a mano", "Bolsita de tela para guardarla"],
      plazo: [14, 21],
      personaliza: { label: "Nombre bordado en el vestido", placeholder: "Ej.: Lucía", extra: "Fecha o dedicatoria (opcional)" },
      highlights: ["Pieza única hecha a mano", "Se personaliza con su nombre", "Fotos del proceso antes del envío"]
    },
    bolsos: {
      long: "Tote bags de lona gruesa con ilustraciones originales a todo color. La impresión se fija con calor para que aguante el uso diario y los lavados, y las asas van cosidas con doble pespunte para cargar sin miedo.",
      medidas: [["Alto", "42 cm"], ["Ancho", "38 cm"], ["Largo de las asas", "60 cm"], ["Carga máxima", "10 kg"]],
      size: { h: "42 cm", w: "38 cm" },
      materiales: ["Lona 100 % algodón de 340 g/m²", "Ilustración original impresa por sublimación", "Asas reforzadas con doble costura"],
      cuidados: ["Lavar del revés a 30 °C", "No usar lejía", "Planchar del revés a temperatura media", "No usar secadora"],
      incluye: ["Bolsa de papel kraft", "Pegatina de regalo"],
      plazo: [3, 5],
      highlights: ["Ilustración original", "Lona gruesa que dura años", "Cabe un portátil de 15″"]
    },
    fieltro: {
      long: "Frutas de fieltro cortadas y cosidas a mano con puntada visible, rellenas para que sean blanditas y seguras. Ideales para el juego simbólico, la cocinita o como material Montessori para aprender colores y formas.",
      medidas: [["Piña", "14 × 8 cm"], ["Manzana", "8 × 8 cm"], ["Plátano", "16 × 4 cm"], ["Cesta completa", "8 piezas"]],
      size: { h: "14 cm", w: "8 cm" },
      materiales: ["Fieltro de lana y viscosa de 1,5 mm", "Relleno de fibra hipoalergénica", "Hilo de algodón"],
      cuidados: ["Lavar a mano con agua fría", "Secar en plano a la sombra"],
      incluye: ["Cesta de tela", "Bolsa de algodón"],
      plazo: [5, 7],
      highlights: ["Sin piezas pequeñas", "Apto desde 3 años", "Aprender jugando"]
    },
    eventos: {
      long: "Detalles para que tus invitados se lleven un recuerdo hecho a mano. Los personalizamos con iniciales, fecha o los colores del evento y se entregan listos para repartir. Pedido mínimo: 12 unidades.",
      medidas: [["Alto de cada pieza", "7 cm"], ["Ancho", "6 cm"], ["Con argolla", "11 cm"], ["Unidades por pack", "12"]],
      size: { h: "7 cm", w: "6 cm" },
      materiales: ["Fieltro de lana y viscosa", "Bordado a mano", "Argolla metálica niquelada"],
      cuidados: ["Limpiar con un paño seco"],
      incluye: ["Bolsita de organza individual", "Tarjetita de agradecimiento personalizable"],
      plazo: [10, 15],
      personaliza: { label: "Iniciales o nombres", placeholder: "Ej.: L & M", extra: "Fecha del evento (opcional)" },
      highlights: ["Personalizados con iniciales", "Listos para regalar", "Desde 12 unidades"]
    }
  }
};
