-- ═══════════════════════════════════════════════════════════════════
-- DONDOM STUDIO — Plano de la base de datos (schema)
-- ═══════════════════════════════════════════════════════════════════
-- Este archivo es el "plano arquitectónico" del backend.
-- NO está conectado a nada todavía. El día que activemos Supabase,
-- este archivo se ejecuta tal cual y crea toda la estructura.
--
-- Escrito para PostgreSQL (el motor que usa Supabase).
-- ═══════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────────
-- 1. PRODUCTOS (los aromas: AR/01 MOCCA, AR/02 CYAN, ...)
-- ───────────────────────────────────────────────────────────────────
-- Hoy estos datos viven en src/constants.ts. Cuando se conecte el
-- backend, la página los leerá de aquí y podrás editar productos
-- sin tocar código.
create table productos (
  id          uuid primary key default gen_random_uuid(),
  codigo      text not null unique,     -- "AR/01"
  nombre      text not null,            -- "MOCCA"
  slug        text not null unique,     -- "mocca" (para la URL /mocca)
  descripcion text,                     -- texto de venta
  notas       text[],                   -- {"café tostado","chocolate","menta fresca"}
  categoria   text,                     -- "cafe", "flores", "maderas", "frescos" (para filtros de Tienda)
  serie       text default 'Serie A',
  imagen_principal text,                -- URL de la foto para Tienda/Inicio
  imagen_detalle   text,                -- URL de la foto para la página del producto
  disponible  boolean default false,    -- false = aparece como "Próximamente"
  creado_en   timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────────
-- 2. VARIANTES (formatos de cada aroma: spray 250ml, difusor, etc.)
-- ───────────────────────────────────────────────────────────────────
-- Un mismo aroma puede venderse en varios formatos con precios
-- distintos. Por eso va en tabla aparte.
create table variantes (
  id          uuid primary key default gen_random_uuid(),
  producto_id uuid not null references productos(id) on delete cascade,
  formato     text not null,            -- "Spray"
  tamano      text,                     -- "250 ml" (null mientras no se defina)
  precio_mxn  numeric(10,2),            -- null = "consultar por WhatsApp"
  stock       integer default 0,        -- cuántas unidades hay
  activa      boolean default true
);

-- ───────────────────────────────────────────────────────────────────
-- 3. MENSAJES DE CONTACTO (el formulario de /contacto)
-- ───────────────────────────────────────────────────────────────────
-- Captura lo que hoy tiene el formulario: nombre, correo, teléfono,
-- comentario. El campo "tipo" distingue clientes de proveedores.
create table mensajes_contacto (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  correo     text not null,
  telefono   text,
  comentario text,
  tipo       text default 'cliente',    -- 'cliente' | 'proveedor'
  atendido   boolean default false,     -- para marcar cuáles ya respondiste
  creado_en  timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────────
-- 4. PERFILES DE USUARIO (cuentas de clientes — FUTURO)
-- ───────────────────────────────────────────────────────────────────
-- Supabase trae el sistema de login ya hecho (tabla auth.users:
-- contraseñas, recuperación, etc. — no la creamos nosotros).
-- Esta tabla guarda los datos EXTRA de cada usuario.
create table perfiles (
  id         uuid primary key,          -- mismo id que auth.users
  nombre     text,
  telefono   text,
  direccion  text,                      -- para envíos
  creado_en  timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────────
-- 5. PEDIDOS (compras — FUTURO, para cuando haya carrito y pagos)
-- ───────────────────────────────────────────────────────────────────
create table pedidos (
  id          uuid primary key default gen_random_uuid(),
  usuario_id  uuid references perfiles(id),  -- null si compró sin cuenta
  nombre      text,                     -- datos del comprador
  correo      text,
  telefono    text,
  direccion   text,
  estado      text default 'pendiente', -- 'pendiente' → 'pagado' → 'enviado' → 'entregado'
  total_mxn   numeric(10,2),
  creado_en   timestamptz default now()
);

-- Cada renglón de un pedido (2x MOCCA spray, 1x CYAN difusor...)
create table pedido_items (
  id          uuid primary key default gen_random_uuid(),
  pedido_id   uuid not null references pedidos(id) on delete cascade,
  variante_id uuid not null references variantes(id),
  cantidad    integer not null default 1,
  precio_unitario_mxn numeric(10,2) not null  -- precio al momento de comprar
);

-- ───────────────────────────────────────────────────────────────────
-- DATOS INICIALES (lo que existe hoy en la página)
-- ───────────────────────────────────────────────────────────────────
insert into productos (codigo, nombre, slug, descripcion, notas, categoria, disponible, imagen_principal, imagen_detalle)
values
  ('AR/01', 'MOCCA', 'mocca',
   'Spray aromático de edición limitada. Notas de café, chocolate y menta fresca.',
   array['café tostado','chocolate','menta fresca'],
   'cafe', true,
   '/products/ar01-ingredientes.jpg', '/products/ar01-frente.jpg'),
  ('AR/02', 'CYAN', 'cyan',
   'Próximamente.',
   null, 'frescos', false, null, null);

insert into variantes (producto_id, formato, tamano, precio_mxn)
select id, 'Spray', null, null from productos where codigo = 'AR/01';
