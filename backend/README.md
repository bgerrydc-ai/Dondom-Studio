# Backend de DONDOM STUDIO — Plano (aún no activo)

Esta carpeta contiene el **diseño del backend** sin conectarlo a nada.
La página funciona hoy con puro frontend; esto es el plan para el futuro.

## ¿Qué hay aquí?

| Archivo | Qué es |
|---|---|
| `schema.sql` | El plano de la base de datos: tablas, campos y datos iniciales |
| `README.md` | Este documento |

## Qué captura cada página del sitio (hoy)

| Página | Datos que maneja | Dónde viven hoy | Tabla futura |
|---|---|---|---|
| `/` (Inicio) | Lista de productos | `src/constants.ts` | `productos` |
| `/tienda` | Productos + filtros por categoría | `src/constants.ts` (categorías en `Tienda.tsx`) | `productos` |
| `/mocca` | Detalle, formato, cantidad → WhatsApp | `src/pages/Mocca.tsx` | `productos` + `variantes` |
| `/contacto` | Nombre, teléfono (opcional), comentario | No se guarda: abre la app de correo del visitante (`mailto:`) | `mensajes_contacto` |
| `/quienes-somos` | Solo texto, no captura datos | — | — |

## Plan de conexión (cuando llegue el momento)

Orden recomendado, de lo más fácil a lo más complejo:

1. **Formulario de contacto** → guarda en `mensajes_contacto`.
   Cambio pequeño en `src/pages/Contacto.tsx` (ya está preparado para esto).
2. **Productos desde la base** → `Home`, `Tienda` y `Mocca` leen de
   `productos`/`variantes` en vez de `constants.ts`. Se podrán editar
   productos y precios sin tocar código.
3. **Cuentas de usuario** → login con Supabase Auth + tabla `perfiles`.
4. **Pedidos dentro de la página** → carrito + `pedidos`/`pedido_items`
   (+ pasarela de pago, ej. Stripe o Mercado Pago).

## Cómo se activará (5 minutos, con Claude)

1. Crear proyecto en [supabase.com](https://supabase.com) (plan gratis)
2. Ejecutar `schema.sql` completo (crea todas las tablas + productos iniciales)
3. Copiar las llaves del proyecto a un archivo `.env` (nunca al código)
4. Conectar pieza por pieza según el plan de arriba

## Decisiones tomadas

- **Motor:** PostgreSQL vía Supabase (auth incluido, plan gratis, escala bien)
- **Por qué no se creó el proyecto ya:** los proyectos gratis de Supabase
  se pausan tras ~7 días sin uso; mejor crear cuando se vaya a conectar
- **Idioma de tablas/campos:** español, para que el dueño las entienda
