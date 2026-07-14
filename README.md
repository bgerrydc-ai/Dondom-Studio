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
- 🔲 **Teléfono real** — el actual (+52 55 1234 5678) es FICTICIO, reemplazar en
  `src/constants.ts` cuando Gerardo tenga número de negocio
- 🔲 **Tamaño y precio del spray AR/01** — pendientes de definir (en `Mocca.tsx` dice
  "tamaño por definir" y el precio manda a WhatsApp)
- 🔲 **Textos de Quiénes Somos** — misión/visión/valores actuales son PROVISIONALES,
  Gerardo enviará los oficiales
- 🔲 **Formulario de contacto** — funciona en pantalla pero NO guarda datos aún.
  Preparado para Google Sheets (constante `SHEET_URL` en `Contacto.tsx`) o
  conectar a Supabase (mejor opción, ver plan en `backend/README.md`)

## Backend (futuro)

La página funciona 100% con frontend. El diseño completo del backend
(tablas, plan de conexión por fases, decisiones) está en **`backend/`**:
se decidió NO crear el proyecto de Supabase hasta que se vaya a conectar,
porque los proyectos gratis se pausan sin uso. Cuando llegue el momento,
`backend/schema.sql` se ejecuta tal cual y la base nace con el catálogo cargado.

## Decisiones clave (para no repetir discusiones)

- **MOCCA se escribe con doble C** (no "MOCA")
- La marca se escribe **DONDOM STUDIO** (mayúsculas)
- Foto de ingredientes (menta/café) → portada y tienda; foto frontal → página de producto
- Tarjetas de producto: proporción 4:5 con `object-cover` (ni cuadradas ni con marcos blancos)
- Ventas iniciales por WhatsApp; e-commerce completo vendrá con el backend
- Sección de proveedores en Home: DONDOM también formula aromas para otras marcas
