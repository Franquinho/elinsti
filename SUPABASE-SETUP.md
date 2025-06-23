# Configuración de Supabase para El INSTI POS

## Variables de Entorno Requeridas

Agrega estas variables en tu archivo `.env.local` y en Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_de_supabase
```

## Estructura de Base de Datos

### Tabla: `usuarios`
```sql
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  rol VARCHAR(50) NOT NULL CHECK (rol IN ('administrador', 'caja', 'venta')),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `productos`
```sql
CREATE TABLE productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  emoji VARCHAR(10),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `eventos`
```sql
CREATE TABLE eventos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  fecha DATE NOT NULL,
  estado VARCHAR(50) DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `comandas`
```sql
CREATE TABLE comandas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  evento_id INTEGER REFERENCES eventos(id),
  nombre_cliente VARCHAR(255) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  estado VARCHAR(50) DEFAULT 'pendiente',
  metodo_pago VARCHAR(50),
  nota TEXT,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP
);
```

### Tabla: `comanda_items`
```sql
CREATE TABLE comanda_items (
  id SERIAL PRIMARY KEY,
  comanda_id INTEGER REFERENCES comandas(id) ON DELETE CASCADE,
  producto_id INTEGER REFERENCES productos(id),
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Datos de Prueba

### Insertar usuarios de prueba:
```sql
INSERT INTO usuarios (nombre, email, rol) VALUES
('Admin El Insti', 'admin@elinsti.com', 'administrador'),
('Cajero Principal', 'caja@elinsti.com', 'caja'),
('Vendedor 1', 'venta1@elinsti.com', 'venta');
```

### Insertar productos de prueba:
```sql
INSERT INTO productos (nombre, precio, emoji) VALUES
('Cerveza Artesanal', 2500, '🍺'),
('Vino Tinto', 3500, '🍷'),
('Empanadas', 1200, '🥟'),
('Tabla de Quesos', 4500, '🧀'),
('Café Especial', 1800, '☕'),
('Agua Mineral', 800, '💧');
```

### Insertar eventos de prueba:
```sql
INSERT INTO eventos (nombre, fecha) VALUES
('Noche Bohemia - Enero 2024', '2024-01-15'),
('Concierto Acústico', '2024-01-20');
```

## Configuración de Autenticación en Supabase

1. Ve a Authentication → Settings en tu dashboard de Supabase
2. Habilita "Email auth"
3. Desactiva "Confirm email" para desarrollo
4. Configura las políticas RLS (Row Level Security) según necesites

## Políticas RLS (Opcional)

```sql
-- Ejemplo de política para usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus propios datos" ON usuarios
  FOR SELECT USING (auth.email() = email);

-- Política para que el servicio pueda actualizar comandas
CREATE POLICY "Permitir actualizaciones de servicio en comandas" ON comandas
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
```

## Notas Importantes

- **Service Role Key**: Solo usar en API Routes del servidor, nunca en el cliente
- **Anon Key**: Usar en el cliente para autenticación
- **RLS**: Configurar según tus necesidades de seguridad
- **Backup**: Hacer backup regular de la base de datos 