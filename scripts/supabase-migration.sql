-- SUPABASE MIGRATION SCRIPT - EL INSTI (actualizado según modelo visual)

-- Tabla: usuarios
create table if not exists usuarios (
  id serial primary key,
  nombre varchar not null,
  email varchar not null unique,
  rol varchar not null,
  activo boolean not null default true,
  created_at timestamp with time zone default now()
);

-- Tabla: eventos
create table if not exists eventos (
  id serial primary key,
  nombre varchar not null,
  fecha date not null,
  estado varchar not null,
  created_at timestamp with time zone default now()
);

-- Tabla: productos
create table if not exists productos (
  id serial primary key,
  nombre varchar not null,
  precio numeric not null,
  emoji varchar,
  activo boolean not null default true,
  created_at timestamp with time zone default now()
);

-- Tabla: comandas
create table if not exists comandas (
  id serial primary key,
  usuario_id int references usuarios(id) on delete set null,
  evento_id int references eventos(id) on delete set null,
  nombre_cliente varchar,
  total numeric not null,
  estado varchar not null,
  metodo_pago varchar,
  nota text,
  fecha_creacion timestamp with time zone default now(),
  fecha_actualizacion timestamp with time zone default now()
);

-- Tabla: comanda_items
create table if not exists comanda_items (
  id serial primary key,
  comanda_id int references comandas(id) on delete cascade,
  producto_id int references productos(id) on delete set null,
  cantidad int not null,
  precio_unitario numeric not null,
  subtotal numeric not null,
  created_at timestamp with time zone default now()
);

-- Tabla: logs
create table if not exists logs (
  id serial primary key,
  usuario_id int references usuarios(id) on delete set null,
  accion varchar not null,
  detalle text,
  created_at timestamp with time zone default now()
);

-- Índices útiles
create index if not exists idx_comandas_evento_id on comandas(evento_id);
create index if not exists idx_comandas_usuario_id on comandas(usuario_id);
create index if not exists idx_comanda_items_comanda_id on comanda_items(comanda_id);
create index if not exists idx_comanda_items_producto_id on comanda_items(producto_id);
create index if not exists idx_logs_usuario_id on logs(usuario_id);

-- Políticas RLS (solo ejemplo, personaliza según tu lógica de acceso)
alter table usuarios enable row level security;
alter table eventos enable row level security;
alter table productos enable row level security;
alter table comandas enable row level security;
alter table comanda_items enable row level security;
alter table logs enable row level security;

-- Permitir acceso total para desarrollo (elimina o ajusta en producción)
create policy if not exists "Allow all for dev" on usuarios for all using (true);
create policy if not exists "Allow all for dev" on eventos for all using (true);
create policy if not exists "Allow all for dev" on productos for all using (true);
create policy if not exists "Allow all for dev" on comandas for all using (true);
create policy if not exists "Allow all for dev" on comanda_items for all using (true);
create policy if not exists "Allow all for dev" on logs for all using (true);

-- Fin del script 