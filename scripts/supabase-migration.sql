-- Script de migración para Supabase - El INSTI POS
-- Ejecutar en el SQL Editor de Supabase

-- 1. Crear tabla eventos si no existe
CREATE TABLE IF NOT EXISTS eventos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ NOT NULL,
    activo BOOLEAN DEFAULT true,
    capacidad_maxima INTEGER,
    precio_entrada DECIMAL(10,2) DEFAULT 0,
    ubicacion VARCHAR(255),
    imagen_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Asegurar que la columna activo existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'eventos' AND column_name = 'activo') THEN
        ALTER TABLE eventos ADD COLUMN activo BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 3. Crear tabla configuracion_sistema si no existe
CREATE TABLE IF NOT EXISTS configuracion_sistema (
    id BIGSERIAL PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descripcion TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Insertar configuración inicial
INSERT INTO configuracion_sistema (clave, valor, descripcion) 
VALUES ('evento_activo_id', '1', 'ID del evento actualmente activo en el sistema')
ON CONFLICT (clave) DO NOTHING;

-- 5. Crear tabla productos si no existe
CREATE TABLE IF NOT EXISTS productos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    emoji VARCHAR(10) DEFAULT '📦',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Crear tabla caja si no existe
CREATE TABLE IF NOT EXISTS caja (
    id BIGSERIAL PRIMARY KEY,
    evento_id BIGINT REFERENCES eventos(id),
    usuario_id UUID REFERENCES auth.users(id),
    apertura TIMESTAMPTZ DEFAULT NOW(),
    cierre TIMESTAMPTZ NULL,
    monto_inicial DECIMAL(10,2) DEFAULT 0,
    monto_final DECIMAL(10,2) NULL,
    estado VARCHAR(20) DEFAULT 'abierta' CHECK (estado IN ('abierta', 'cerrada'))
);

-- 7. Crear tabla comandas si no existe
CREATE TABLE IF NOT EXISTS comandas (
    id BIGSERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id),
    evento_id BIGINT REFERENCES eventos(id),
    caja_id BIGINT REFERENCES caja(id),
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'cancelado')),
    total DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(20) NULL CHECK (metodo_pago IN ('invitacion', 'transferencia', 'efectivo', 'revisar')),
    nota TEXT NULL,
    nombre_cliente VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Asegurar que la columna evento_id existe en comandas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'comandas' AND column_name = 'evento_id') THEN
        ALTER TABLE comandas ADD COLUMN evento_id BIGINT REFERENCES eventos(id);
    END IF;
END $$;

-- 9. Crear tabla comanda_items si no existe
CREATE TABLE IF NOT EXISTS comanda_items (
    id BIGSERIAL PRIMARY KEY,
    comanda_id BIGINT REFERENCES comandas(id) ON DELETE CASCADE,
    producto_id BIGINT REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- 10. Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_eventos_activo ON eventos(activo);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_comandas_evento ON comandas(evento_id);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);
CREATE INDEX IF NOT EXISTS idx_comandas_estado ON comandas(estado);

-- 11. Habilitar RLS en todas las tablas
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE caja ENABLE ROW LEVEL SECURITY;
ALTER TABLE comandas ENABLE ROW LEVEL SECURITY;
ALTER TABLE comanda_items ENABLE ROW LEVEL SECURITY;

-- 12. Crear políticas RLS básicas
-- Eventos
CREATE POLICY "Usuarios pueden ver eventos" ON eventos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Solo administradores pueden modificar eventos" ON eventos
    FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'administrador');

-- Configuración
CREATE POLICY "Solo administradores pueden modificar configuración" ON configuracion_sistema
    FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'administrador');

CREATE POLICY "Usuarios pueden leer configuración" ON configuracion_sistema
    FOR SELECT USING (auth.role() = 'authenticated');

-- Productos
CREATE POLICY "Usuarios pueden ver productos" ON productos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Solo administradores pueden modificar productos" ON productos
    FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'administrador');

-- Comandas
CREATE POLICY "Usuarios pueden ver comandas" ON comandas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios pueden crear comandas" ON comandas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios pueden actualizar comandas" ON comandas
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Comanda items
CREATE POLICY "Usuarios pueden ver comanda_items" ON comanda_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios pueden crear comanda_items" ON comanda_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 13. Insertar datos de prueba si las tablas están vacías
INSERT INTO eventos (nombre, descripcion, fecha_inicio, fecha_fin, activo) 
SELECT 'Evento Inicial', 'Evento de prueba para el sistema', NOW(), NOW() + INTERVAL '1 day', true
WHERE NOT EXISTS (SELECT 1 FROM eventos WHERE nombre = 'Evento Inicial');

INSERT INTO productos (nombre, precio, emoji, activo) 
SELECT 'Cerveza Artesanal', 2500.00, '🍺', true
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Cerveza Artesanal');

-- 14. Actualizar la configuración del evento activo si no hay ninguno
UPDATE configuracion_sistema 
SET valor = (SELECT id::text FROM eventos ORDER BY created_at DESC LIMIT 1)
WHERE clave = 'evento_activo_id' AND valor IS NULL; 