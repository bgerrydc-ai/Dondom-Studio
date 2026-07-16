-- ═══════════════════════════════════════════════════════════════════
-- DONDOM STUDIO — Cuentas de cliente (Supabase Auth)
-- ═══════════════════════════════════════════════════════════════════
-- CÓMO USAR (una sola vez):
--   1. Entra a supabase.com → tu proyecto "Dondom Studio"
--   2. Menú izquierdo → SQL Editor → New query
--   3. Copia TODO este archivo, pégalo y presiona "Run"
--
-- Qué hace:
--   • Crea la tabla `perfiles` (datos extra de cada cliente).
--   • Crea el perfil automáticamente cuando alguien se registra.
--   • Conecta los pedidos con la cuenta del cliente (para su historial).
--   • Deja que cada cliente vea SOLO sus propios pedidos.
--
-- Es seguro ejecutarlo más de una vez.
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. TABLA DE PERFILES ────────────────────────────────────────────
-- Guarda los datos del cliente ligados a su cuenta (auth.users).
-- El correo y la contraseña los maneja Supabase Auth aparte; aquí solo
-- van los datos extra (nombre, teléfono, dirección para comprar rápido).
create table if not exists perfiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  nombres    text,
  apellidos  text,
  telefono   text,
  calle      text,
  no_ext     text,
  no_int     text,
  cp         text,
  colonia    text,
  ciudad     text,
  municipio  text,
  estado     text,
  rol        text default 'cliente',   -- 'cliente' | 'admin' (para el futuro)
  creado_en  timestamptz default now()
);

alter table perfiles enable row level security;

-- Cada quien puede ver / crear / editar SOLO su propio perfil
drop policy if exists "perfil ver propio" on perfiles;
create policy "perfil ver propio" on perfiles
  for select to authenticated using (id = auth.uid());

drop policy if exists "perfil crear propio" on perfiles;
create policy "perfil crear propio" on perfiles
  for insert to authenticated with check (id = auth.uid());

drop policy if exists "perfil editar propio" on perfiles;
create policy "perfil editar propio" on perfiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ─── 2. PERFIL AUTOMÁTICO AL REGISTRARSE ─────────────────────────────
-- Cuando alguien crea su cuenta, se crea su fila en `perfiles` sola.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into perfiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── 3. LOS PEDIDOS SE LIGAN A LA CUENTA ─────────────────────────────
-- Agregamos user_id: si el cliente compró con su cuenta, queda ligado
-- (para su historial). Si compró como invitado, queda vacío (null).
alter table pedidos add column if not exists user_id uuid references auth.users(id);

-- Cada cliente puede LEER solo sus propios pedidos (los invitados no
-- tienen cuenta, así que sus pedidos siguen siendo privados).
drop policy if exists "pedidos leer propios" on pedidos;
create policy "pedidos leer propios" on pedidos
  for select to authenticated using (user_id = auth.uid());

-- Y los productos de esos pedidos
drop policy if exists "pedido_items leer propios" on pedido_items;
create policy "pedido_items leer propios" on pedido_items
  for select to authenticated using (
    exists (select 1 from pedidos p where p.id = pedido_id and p.user_id = auth.uid())
  );

-- ─── 4. PERMISOS PARA CLIENTES YA REGISTRADOS ────────────────────────
-- Las reglas originales daban permiso solo a "anon" (visitantes sin
-- cuenta). Ahora también los clientes con sesión iniciada ("authenticated")
-- deben poder ver productos, mandar mensajes y crear pedidos.
drop policy if exists "productos lectura publica" on productos;
create policy "productos lectura publica" on productos
  for select to anon, authenticated using (true);

drop policy if exists "contacto insertar publico" on mensajes_contacto;
create policy "contacto insertar publico" on mensajes_contacto
  for insert to anon, authenticated with check (true);

-- ─── 5. crear_pedido LIGA EL PEDIDO A LA CUENTA ──────────────────────
-- Misma función segura de antes, pero ahora guarda automáticamente el
-- user_id de quien está comprando (o null si es invitado). El total se
-- sigue calculando en el servidor con los precios reales de la tabla.
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
  select coalesce(sum(p.price_mxn * x.cantidad), 0)
    into v_total
  from jsonb_to_recordset(p_items) as x(codigo text, cantidad int)
  join productos p on p.codigo = x.codigo
  where p.disponible = true and x.cantidad > 0;

  if v_total <= 0 then
    raise exception 'El pedido no tiene productos válidos';
  end if;

  insert into pedidos (nombre, correo, telefono, direccion, total_mxn, user_id)
  values (p_nombre, p_correo, p_telefono, p_direccion, v_total, auth.uid())
  returning id into v_id;

  insert into pedido_items (pedido_id, producto_codigo, nombre, size, precio_unitario_mxn, cantidad)
  select v_id, p.codigo, p.nombre, p.size, p.price_mxn, x.cantidad
  from jsonb_to_recordset(p_items) as x(codigo text, cantidad int)
  join productos p on p.codigo = x.codigo
  where p.disponible = true and x.cantidad > 0;

  return v_id;
end;
$$;

-- Ahora pueden crear pedidos tanto invitados (anon) como clientes (authenticated)
grant execute on function crear_pedido to anon, authenticated;
