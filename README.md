# Guesa Hamburguesería

Landing mobile-first para Guesa (Miraflores, Lima). La carta, los combos y las promos se leen sin JavaScript; el carrito permite armar el pedido y enviarlo por WhatsApp.

## Stack

- Astro 7 + TypeScript
- Tailwind CSS v4
- Preact + nanostores para el carrito
- GSAP + Lenis para movimiento
- Content collections en YAML
- `@astrojs/sitemap` para el sitemap

## Comandos

```sh
bun install
bun run dev
bun run build
bun run preview
```

Para regenerar la imagen Open Graph, el QR y el apple-touch-icon:

```sh
node scripts/generate-assets.mjs
```

## Antes de publicar

Reemplaza los datos marcados con `TODO(owner)` en `src/site.config.ts`:

- Número de WhatsApp real (formato internacional, sin `+` ni espacios).
- Dirección exacta, referencia, coordenadas y enlace de Google Maps / Google Business.
- Horarios reales y último horario de pedido.
- Zonas y tarifas de delivery.
- Redes sociales, dominio y correo.
- IDs de GA4 / Meta Pixel si se usará analítica.

Los placeholders actuales usan `51999999999`, `Av. Larco 123` y tarifas referenciales. No publicar así.

## Contenido

Todo el contenido vive en `src/content/`:

| Colección | Ruta | Uso |
| --- | --- | --- |
| `menu` | `src/content/menu/**/*.yaml` | Carta por categoría |
| `combos` | `src/content/combos/*.yaml` | Combos |
| `promos` | `src/content/promos/*.yaml` | Promos por día |
| `opciones` | `src/content/opciones/*.yaml` | Opciones de combo |
| `faq` | `src/content/faq/*.yaml` | Preguntas frecuentes |

Cada archivo YAML se valida con el esquema de `src/content.config.ts`. Para ocultar un producto sin borrarlo, usa `disponible: false`. El orden dentro de cada sección se controla con `orden`.

La promo del martes (`martes-doble`) requiere una burger y excluye `guesa-smash` y `five-guesa`; el carrito bloquea el envío hasta corregirlo.

## Estructura

```text
public/                 favicon, OG, QR, robots
scripts/                generación de assets
src/components/
  art/                  ilustraciones vectoriales
  islands/              carrito Preact
  sections/             secciones de la landing
  ui/                   iconos y banner de consentimiento
src/content/            colecciones YAML
src/layouts/            layout base y SEO
src/lib/                carrito, WhatsApp, analytics, SEO
src/pages/              landing y 404
src/scripts/            filtros de carta y animaciones
src/styles/             tokens y estilos de componentes
```

## Carrito y WhatsApp

- El carrito se guarda en `localStorage` con la clave `guesa:cart:v1`.
- Los botones de producto disparan el evento `guesa:add`; el carrito escucha ese evento.
- El mensaje de WhatsApp incluye productos, variantes, cantidades, total, modalidad y datos del cliente.
- El delivery no se cobra en el carrito: se confirma por WhatsApp.
- La analítica solo se carga después de aceptar el banner de consentimiento.

## Deploy

El sitio es estático. Configura `site` en `astro.config.mjs` y actualiza `public/robots.txt` si cambia el dominio. Después de `bun run build`, publica `dist/` en el hosting elegido (Netlify, Vercel, Cloudflare Pages o similar).

Si se cambia el número de WhatsApp o el dominio, regenera el QR con `node scripts/generate-assets.mjs`.
