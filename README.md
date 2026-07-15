# DONDOM STUDIO — Sitio web

Página web de **DONDOM STUDIO**, marca mexicana de aromatizantes premium.
Estilo: minimalista/editorial. Colores: azul `#002395`, negro, gris `#F2F2F2`.
Fuentes: Inter (títulos) y Space Grotesk (etiquetas).

> **📌 NOTA DE CONTEXTO (para Claude o cualquier desarrollador futuro):**
> El dueño es **Gerardo** (@bgerrydc-ai), emprendedor **sin conocimientos de
> programación**. Todo se le explica en lenguaje simple, paso a paso, y los
> cambios se hacen de a poco. Claude actúa como desarrollador + maestro.
> Historia del proyecto: la base la generó Google AI Studio; después se
> reconstruyó con Claude Code: se agregaron las 5 páginas, navegación,
> modo oscuro, fotos reales del producto y el plano del backend.

## Cómo correr la página en local

```
npm install        # solo la primera vez
npm run dev        # abre http://localhost:3000
```

## Estructura

| Carpeta / archivo | Qué es |
|---|---|
| `src/pages/` | Las 5 páginas: Home, Tienda, Contacto, QuienesSomos, Mocca |
| `src/components/Header.tsx` | Barra de navegación compartida + botón de modo oscuro |
| `src/constants.ts` | **Los productos y datos de contacto viven aquí** (editar aquí = cambia toda la página) |
| `src/index.css` | Colores de marca y modo oscuro (clase `.dark`) |
| `public/products/` | Fotos de productos |
| `backend/` | **Plano del backend (NO activo)** — ver `backend/README.md` |

## Estado actual (julio 2026)

- ✅ Frontend completo funcionando: catálogo, producto MOCCA (AR/01), compra vía WhatsApp
- ✅ Modo oscuro con memoria (localStorage)
- ✅ Repo en GitHub: https://github.com/bgerrydc-ai/Dondom-Studio
- 🔲 **Deploy** — hay una versión online publicada, probablemente vía Google AI Studio:
  https://ai.studio/apps/8349c893-4aa9-4360-959b-8ddf53b6ddbb
  Esa versión NO se actualiza sola con este repo. Pendiente: conectar a Vercel
  para deploy automático desde GitHub
- ✅ **Teléfono real**: +52 999 552 2572 (en `src/constants.ts`) — sirve sobre todo
  para contacto de proveedores
- ✅ **Idiomas ES/EN** — sistema en `src/i18n.tsx` (diccionario completo, ES por
  defecto, botón en header, se recuerda en localStorage, fade al cambiar)
- ✅ **Carrito de compras** — `src/cart.tsx` (estado global + localStorage) y
  `src/components/CartDrawer.tsx` (ventanita lateral estilo Le Labo). Icono con
  contador en el header
- ✅ **Producto AR/01 MOCCA**: spray 250 ml, **$289 MXN** (en `src/constants.ts`)
- ✅ **BACKEND ACTIVO (Supabase)** — proyecto "Dondom Studio"
  (atfxlrsufenzchkjbiwe.supabase.co). Conexión en `src/supabase.ts` con llave
  publishable (pública, segura). Tablas creadas con `backend/setup-supabase.sql`
  (productos, mensajes_contacto, pedidos, pedido_items + RLS + función crear_pedido)
- ✅ **Formulario de contacto** — guarda en Supabase (`mensajes_contacto`); si la
  base falla, respaldo vía mailto/Gmail/copiar. Ver mensajes en: Supabase →
  Table Editor → mensajes_contacto
- ✅ **Checkout con pedidos reales** — `/checkout`: datos de envío → crea pedido en
  Supabase (función `crear_pedido`) → confirmación con número de pedido → botón de
  pago con link de Mercado Pago (`PAYMENTS.mercadoPagoLink`). Ver pedidos en:
  Supabase → Table Editor → pedidos / pedido_items
- 🔲 **Textos de Quiénes Somos** — ya tienen el texto oficial de Gerardo (estudio
  creativo multi-categoría)
- 🔲 **Pago integrado real** — hoy el pago es un link fijo de Mercado Pago (no sabe
  cantidades ni total). Futuro: integración Checkout Pro con backend para cobrar
  el total exacto del pedido. Futuro: PayPal y Stripe
- 🔲 **Aviso de nueva venta** — notificar a Gerardo (correo/WhatsApp) cuando entre
  un pedido nuevo

## Backend (ACTIVO desde julio 2026)

Supabase en producción. `backend/setup-supabase.sql` es el script ejecutado
(re-ejecutable sin peligro). `backend/schema.sql` fue el plano original (histórico).
Seguridad: RLS activo — el público solo lee productos, inserta mensajes y crea
pedidos vía función. La llave secreta (service_role) NUNCA va en el código.

## Decisiones clave (para no repetir discusiones)

- **MOCCA se escribe con doble C** (no "MOCA")
- La marca se escribe **DONDOM STUDIO** (mayúsculas)
- Foto de ingredientes (menta/café) → portada y tienda; foto frontal → página de producto
- Tarjetas de producto: proporción 4:5 con `object-cover` (ni cuadradas ni con marcos blancos)
- Secciones negras (proveedores, panel DONDOM, cierre de Quiénes Somos) son negras
  SIEMPRE (colores fijos), no se invierten en modo oscuro
- Compra estilo Le Labo: agregar al carrito → ventanita lateral → checkout → pedido
- Sección de proveedores en Home: DONDOM también formula aromas para otras marcas
