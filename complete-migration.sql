-- MIGRACIÓN COMPLETA PARA EL INSTI POS - STAGING
-- Ejecutar en Supabase SQL Editor

-- ========================================
-- TABLA: usuarios
-- ========================================
create table if not exists usuarios (
  id serial primary key,
  nombre varchar not null,
  email varchar not null unique,
  password varchar not null,
  rol varchar not null default 'usuario',
  activo boolean not null default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ========================================
-- TABLA: eventos (actualizada con fecha_inicio y fecha_fin)
-- ========================================
create table if not exists eventos (
  id serial primary key,
  nombre varchar not null,
  descripcion text,
  fecha_inicio timestamp with time zone not null,
  fecha_fin timestamp with time zone not null,
  capacidad_maxima integer,
  precio_entrada numeric default 0,
  ubicacion varchar,
  imagen_url text,
  activo boolean not null default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ========================================
-- TABLA: productos
-- ========================================
create table if not exists productos (
  id serial primary key,
  nombre varchar not null,
  precio numeric not null,
  emoji varchar default '📦',
  activo boolean not null default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ========================================
-- TABLA: comandas
-- ========================================
create table if not exists comandas (
  id serial primary key,
  usuario_id int references usuarios(id) on delete set null,
  evento_id int references eventos(id) on delete set null,
  nombre_cliente varchar,
  total numeric not null default 0,
  estado varchar not null default 'pendiente',
  metodo_pago varchar,
  nota text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ========================================
-- TABLA: comanda_items
-- ========================================
create table if not exists comanda_items (
  id serial primary key,
  comanda_id int references comandas(id) on delete cascade,
  producto_id int references productos(id) on delete set null,
  cantidad int not null default 1,
  precio_unitario numeric not null,
  subtotal numeric not null,
  created_at timestamp with time zone default now()
);

-- ========================================
-- TABLA: caja (NUEVA)
-- ========================================
create table if not exists caja (
  id serial primary key,
  evento_id int references eventos(id) on delete set null,
  usuario_id int references usuarios(id) on delete set null,
  tipo_operacion varchar not null, -- 'apertura', 'cierre', 'venta', 'cancelacion'
  monto numeric not null,
  metodo_pago varchar,
  descripcion text,
  created_at timestamp with time zone default now()
);

-- ========================================
-- TABLA: logs
-- ========================================
create table if not exists logs (
  id serial primary key,
  usuario_id int references usuarios(id) on delete set null,
  accion varchar not null,
  detalle text,
  created_at timestamp with time zone default now()
);

-- ========================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ========================================
create index if not exists idx_comandas_evento_id on comandas(evento_id);
create index if not exists idx_comandas_usuario_id on comandas(usuario_id);
create index if not exists idx_comandas_estado on comandas(estado);
create index if not exists idx_comanda_items_comanda_id on comanda_items(comanda_id);
create index if not exists idx_comanda_items_producto_id on comanda_items(producto_id);
create index if not exists idx_caja_evento_id on caja(evento_id);
create index if not exists idx_caja_usuario_id on caja(usuario_id);
create index if not exists idx_logs_usuario_id on logs(usuario_id);
create index if not exists idx_eventos_fecha_inicio on eventos(fecha_inicio);
create index if not exists idx_eventos_activo on eventos(activo);

-- ========================================
-- HABILITAR ROW LEVEL SECURITY
-- ========================================
alter table usuarios enable row level security;
alter table eventos enable row level security;
alter table productos enable row level security;
alter table comandas enable row level security;
alter table comanda_items enable row level security;
alter table caja enable row level security;
alter table logs enable row level security;

-- ========================================
-- POLÍTICAS RLS PARA DESARROLLO
-- ========================================
-- Permitir acceso total para desarrollo (ajustar en producción)
create policy if not exists "Allow all for dev" on usuarios for all using (true);
create policy if not exists "Allow all for dev" on eventos for all using (true);
create policy if not exists "Allow all for dev" on productos for all using (true);
create policy if not exists "Allow all for dev" on comandas for all using (true);
create policy if not exists "Allow all for dev" on comanda_items for all using (true);
create policy if not exists "Allow all for dev" on caja for all using (true);
create policy if not exists "Allow all for dev" on logs for all using (true);

-- ========================================
-- DATOS DE PRUEBA
-- ========================================

-- Insertar usuario admin
insert into usuarios (nombre, email, password, rol) 
values ('Admin', 'admin@elinsti.com', 'admin123', 'admin')
on conflict (email) do nothing;

-- Insertar productos de prueba
insert into productos (nombre, precio, emoji, activo) values
('Café Americano', 1500, '☕', true),
('Café con Leche', 1800, '☕', true),
('Cerveza', 2500, '🍺', true),
('Vino Tinto', 3500, '🍷', true),
('Empanada', 1200, '🥟', true),
('Queso y Jamón', 2000, '🧀', true),
('Agua', 800, '💧', true),
('Pizza', 4500, '🍕', true),
('Hamburguesa', 3800, '🍔', true),
('Taco', 2200, '🌮', true)
on conflict do nothing;

-- Insertar evento de prueba
insert into eventos (nombre, descripcion, fecha_inicio, fecha_fin, capacidad_maxima, precio_entrada, ubicacion) 
values (
  'Noche de Jazz',
  'Una noche mágica con los mejores músicos de jazz',
  now() + interval '1 day',
  now() + interval '1 day' + interval '4 hours',
  100,
  25000,
  'Sala Principal'
)
on conflict do nothing;

-- ========================================
-- FUNCIONES ÚTILES
-- ========================================

-- Función para actualizar updated_at automáticamente
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers para updated_at
create trigger update_usuarios_updated_at before update on usuarios for each row execute function update_updated_at_column();
create trigger update_eventos_updated_at before update on eventos for each row execute function update_updated_at_column();
create trigger update_productos_updated_at before update on productos for each row execute function update_updated_at_column();
create trigger update_comandas_updated_at before update on comandas for each row execute function update_updated_at_column();

-- ========================================
-- FIN DE LA MIGRACIÓN
-- ======================================== 