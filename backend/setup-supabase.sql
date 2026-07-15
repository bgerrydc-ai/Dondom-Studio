-- ═══════════════════════════════════════════════════════════════════
-- DONDOM STUDIO — Configuración inicial de la base de datos (Supabase)
-- ═══════════════════════════════════════════════════════════════════
-- CÓMO USAR (una sola vez):
--   1. Entra a supabase.com → tu proyecto "Dondom Studio"
--   2. Menú izquierdo → SQL Editor → New query
--   3. Copia TODO este archivo, pégalo y presiona "Run"
-- Esto crea las tablas, las reglas de seguridad y carga el producto MOCCA.
-- Es seguro ejecutarlo más de una vez (usa "if not exists" / "on conflict").
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. TABLAS ───────────────────────────────────────────────────────

-- Productos (los aromas)
create table if not exists productos (
  id               uuid primary key default gen_random_uuid(),
  codigo           text not null unique,      -- "AR/01"
  nombre           text not null,             -- "MOCCA"
  slug             text not null unique,      -- "mocca" (para la URL)
  descripcion      text,
  categoria        text,                      -- "cafe", "flores"... (filtros)
  serie            text default 'Serie A',
  size             text,                      -- "250 ml"
  price_mxn        numeric(10,2) default 0,   -- precio en pesos
  imagen_principal text,
  imagen_detalle   text,
  disponible       boolean default false,     -- false = "Próximamente"
  creado_en        timestamptz default now()
);

-- Mensajes del formulario de contacto
create table if not exists mensajes_contacto (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  telefono   text,
  comentario text not null,
  tipo       text default 'cliente',          -- 'cliente' | 'proveedor'
  atendido   boolean default false,           -- para marcar los ya respondidos
  creado_en  timestamptz default now()
);

-- Pedidos (compras)
create table if not exists pedidos (
  id         uuid primary key default gen_random_uuid(),
  nombre     text,
  correo     text,
  telefono   text,
  direccion  text,
  estado     text default 'pendiente',        -- pendiente → pagado → enviado → entregado
  total_mxn  numeric(10,2),
  creado_en  timestamptz default now()
);

-- Productos dentro de cada pedido
create table if not exists pedido_items (
  id                  uuid primary key default gen_random_uuid(),
  pedido_id           uuid not null references pedidos(id) on delete cascade,
  producto_codigo     text,
  nombre              text,
  size                text,
  precio_unitario_mxn numeric(10,2),
  cantidad            integer not null default 1
);

-- ─── 2. SEGURIDAD (Row Level Security) ───────────────────────────────
-- Activa la protección: por defecto NADIE puede tocar las tablas con la
-- llave pública, y abajo damos permisos exactos y mínimos.

alter table productos          enable row level security;
alter table mensajes_contacto  enable row level security;
alter table pedidos            enable row level security;
alter table pedido_items       enable row level security;

-- Productos: el público SOLO puede LEER (para mostrarlos en la web)
drop policy if exists "productos lectura publica" on productos;
create policy "productos lectura publica" on productos
  for select to anon using (true);

-- Mensajes de contacto: el público SOLO puede ENVIAR (no leer los de otros)
drop policy if exists "contacto insertar publico" on mensajes_contacto;
create policy "contacto insertar publico" on mensajes_contacto
  for insert to anon with check (true);

-- ─── 3. FUNCIÓN SEGURA PARA CREAR PEDIDOS ────────────────────────────
-- El pedido y sus productos se crean juntos con esta función, sin exponer
-- las tablas de pedidos a lectura pública.
create or replace function crear_pedido(
  p_nombre    text,
  p_correo    text,
  p_telefono  text,
  p_direccion text,
  p_total     numeric,
  p_items     jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into pedidos (nombre, correo, telefono, direccion, total_mxn)
  values (p_nombre, p_correo, p_telefono, p_direccion, p_total)
  returning id into v_id;

  insert into pedido_items (pedido_id, producto_codigo, nombre, size, precio_unitario_mxn, cantidad)
  select v_id, x.producto_codigo, x.nombre, x.size, x.precio_unitario_mxn, x.cantidad
  from jsonb_to_recordset(p_items) as x(
    producto_codigo text, nombre text, size text,
    precio_unitario_mxn numeric, cantidad int
  );

  return v_id;
end;
$$;

grant execute on function crear_pedido to anon;

-- ─── 4. DATOS INICIALES ──────────────────────────────────────────────
insert into productos
  (codigo, nombre, slug, descripcion, categoria, serie, size, price_mxn, disponible, imagen_principal, imagen_detalle)
values
  ('AR/01', 'MOCCA', 'mocca',
   'Spray aromático de edición limitada. Notas de café, chocolate y menta fresca.',
   'cafe', 'Serie A', '250 ml', 289, true,
   '/products/ar01-ingredientes.jpg', '/products/ar01-frente.jpg')
on conflict (codigo) do nothing;
