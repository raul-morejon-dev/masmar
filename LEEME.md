# Masmar · Web de la tienda

Web de una sola página, sin instalación: `index.html` + `styles.css` + `app.js`.

## Archivos
| Archivo | Para qué sirve |
|---|---|
| `config.js` | **Lo único que hay que editar**: productos, precios, envíos, claves de pago y fichas (medidas, materiales, cuidados) |
| `producto.html` + `product.js` | Página de detalle de cada producto (`producto.html?id=mu-comunion`) |
| `art.js` | Ilustraciones provisionales de los productos (se sustituyen por fotos) |
| `app.js` | Animaciones, carrito, checkout y pagos |
| `server/stripe-server.js` | Servidor pequeño para cobrar con tarjeta vía Stripe |

## Poner fotos reales
Guarda las fotos en `img/` y en `config.js` añade `img` al producto:
```js
{ id: "mu-comunion", ..., img: "img/muneca-comunion.jpg" }
```
Formato recomendado: vertical 4:5, mínimo 1000 px de ancho, fondo claro.

## Activar los pagos
Sin claves, la web funciona en **modo demo** (simula el pago).

- **PayPal**: crea una app en developer.paypal.com y pega el *Client ID* en `paypalClientId`. Salen los botones oficiales de PayPal (incluye pago en 3 plazos).
- **Tarjeta / Apple Pay / Google Pay (Stripe)**: despliega `server/stripe-server.js` (Render, Railway, Vercel…) con `STRIPE_SECRET_KEY` y pon su URL en `stripeCheckoutEndpoint`. El servidor recalcula los precios desde el catálogo, así nadie puede manipularlos.
- **Bizum**: pon el número en `bizumPhone`. El pedido queda “pendiente de verificación” hasta que confirmes que ha llegado.

## Probar en local
Abrir con cualquier servidor estático, por ejemplo:
```
python -m http.server 5173
```
y entrar en http://localhost:5173
