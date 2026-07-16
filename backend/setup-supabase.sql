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
--
-- SEGURIDAD: el navegador solo manda el CÓDIGO del producto y la CANTIDAD.
-- El PRECIO y el TOTAL los calcula aquí el servidor, leyendo el precio real
-- de la tabla `productos`. Así nadie puede pagar menos "editando" el precio
-- desde su navegador.

-- Quitamos la versión anterior de la función (que recibía el total desde
-- el navegador) para reemplazarla por la nueva versión segura.
drop function if exists crear_pedido(text, text, text, text, numeric, jsonb);
drop function if exists crear_pedido(text, text, text, text, jsonb);

create or replace function crear_pedido(
  p_nombre    text,
  p_correo    text,
  p_telefono  text,
  p_direccion text,
  p_items     jsonb          -- [{ "codigo": "AR/01", "cantidad": 2 }, ...]
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id    uuid;
  v_total numeric(10,2);
begin
  -- Total REAL: precio de la tabla `productos` × cantidad, solo productos
  -- disponibles y con cantidad positiva.
  select coalesce(sum(p.price_mxn * x.cantidad), 0)
    into v_total
  from jsonb_to_recordset(p_items) as x(codigo text, cantidad int)
  join productos p on p.codigo = x.codigo
  where p.disponible = true and x.cantidad > 0;

  if v_total <= 0 then
    raise exception 'El pedido no tiene productos válidos';
  end if;

  insert into pedidos (nombre, correo, telefono, direccion, total_mxn)
  values (p_nombre, p_correo, p_telefono, p_direccion, v_total)
  returning id into v_id;

  -- Guardamos cada renglón con el precio real de la tabla (no el del navegador)
  insert into pedido_items (pedido_id, producto_codigo, nombre, size, precio_unitario_mxn, cantidad)
  select v_id, p.codigo, p.nombre, p.size, p.price_mxn, x.cantidad
  from jsonb_to_recordset(p_items) as x(codigo text, cantidad int)
  join productos p on p.codigo = x.codigo
  where p.disponible = true and x.cantidad > 0;

  return v_id;
end;
$$;

grant execute on function crear_pedido to anon;

-- ─── 4. DATOS INICIALES ──────────────────────────────────────────────
-- Producto disponible: MOCCA (AR/01)
insert into productos
  (codigo, nombre, slug, descripcion, categoria, serie, size, price_mxn, disponible, imagen_principal, imagen_detalle)
values
  ('AR/01', 'MOCCA', 'mocca',
   'Spray aromático de edición limitada. Notas de café, chocolate y menta fresca.',
   'cafe', 'Serie A', '250 ml', 289, true,
   '/products/ar01-ingredientes.jpg', '/products/ar01-frente.jpg')
on conflict (codigo) do nothing;

-- Espacio "Próximamente" (AR/02): aparece en el catálogo pero no se puede
-- comprar (disponible = false). Cuando el aroma exista, solo edita esta
-- fila en Supabase: ponle nombre, precio, fotos y disponible = true.
insert into productos
  (codigo, nombre, slug, descripcion, categoria, serie, size, price_mxn, disponible)
values
  ('AR/02', 'PRÓXIMAMENTE', 'proximamente',
   'Nuevo aroma en desarrollo.', 'frescos', 'Serie A', '', 0, false)
on conflict (codigo) do nothing;
