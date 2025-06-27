-- Script simple para configurar Supabase - El INSTI POS
-- Ejecutar en el SQL Editor de Supabase

-- 1. Crear tabla eventos
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

-- 2. Crear tabla productos
CREATE TABLE IF NOT EXISTS productos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    emoji VARCHAR(10) DEFAULT '📦',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Crear tabla comandas
CREATE TABLE IF NOT EXISTS comandas (
    id BIGSERIAL PRIMARY KEY,
    usuario_id UUID,
    evento_id BIGINT REFERENCES eventos(id),
    caja_id BIGINT,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'cancelado')),
    total DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(20) NULL CHECK (metodo_pago IN ('invitacion', 'transferencia', 'efectivo', 'revisar')),
    nota TEXT NULL,
    nombre_cliente VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Crear tabla comanda_items
CREATE TABLE IF NOT EXISTS comanda_items (
    id BIGSERIAL PRIMARY KEY,
    comanda_id BIGINT REFERENCES comandas(id) ON DELETE CASCADE,
    producto_id BIGINT REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- 5. Crear tabla configuracion_sistema
CREATE TABLE IF NOT EXISTS configuracion_sistema (
    id BIGSERIAL PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descripcion TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Crear tabla caja
CREATE TABLE IF NOT EXISTS caja (
    id BIGSERIAL PRIMARY KEY,
    evento_id BIGINT REFERENCES eventos(id),
    usuario_id UUID,
    apertura TIMESTAMPTZ DEFAULT NOW(),
    cierre TIMESTAMPTZ NULL,
    monto_inicial DECIMAL(10,2) DEFAULT 0,
    monto_final DECIMAL(10,2) NULL,
    estado VARCHAR(20) DEFAULT 'abierta' CHECK (estado IN ('abierta', 'cerrada'))
);

-- 7. Crear índices
CREATE INDEX IF NOT EXISTS idx_eventos_activo ON eventos(activo);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);
CREATE INDEX IF NOT EXISTS idx_comandas_estado ON comandas(estado);

-- 8. Habilitar RLS
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comandas ENABLE ROW LEVEL SECURITY;
ALTER TABLE comanda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE caja ENABLE ROW LEVEL SECURITY;

-- 9. Crear políticas RLS básicas
CREATE POLICY "Permitir todo para desarrollo" ON eventos FOR ALL USING (true);
CREATE POLICY "Permitir todo para desarrollo" ON productos FOR ALL USING (true);
CREATE POLICY "Permitir todo para desarrollo" ON comandas FOR ALL USING (true);
CREATE POLICY "Permitir todo para desarrollo" ON comanda_items FOR ALL USING (true);
CREATE POLICY "Permitir todo para desarrollo" ON configuracion_sistema FOR ALL USING (true);
CREATE POLICY "Permitir todo para desarrollo" ON caja FOR ALL USING (true);

-- 10. Insertar datos de prueba
INSERT INTO eventos (nombre, descripcion, fecha_inicio, fecha_fin, activo) 
VALUES ('Evento Inicial', 'Evento de prueba para el sistema', NOW(), NOW() + INTERVAL '1 day', true)
ON CONFLICT DO NOTHING;

INSERT INTO productos (nombre, precio, emoji, activo) 
VALUES 
    ('Cerveza Artesanal', 2500.00, '🍺', true),
    ('Vino Tinto', 3500.00, '🍷', true),
    ('Empanadas', 1200.00, '🥟', true),
    ('Café Especial', 1800.00, '☕', true)
ON CONFLICT DO NOTHING;

INSERT INTO configuracion_sistema (clave, valor, descripcion) 
VALUES ('evento_activo_id', '1', 'ID del evento actualmente activo en el sistema')
ON CONFLICT (clave) DO NOTHING;

-- 11. Actualizar configuración del evento activo
UPDATE configuracion_sistema 
SET valor = (SELECT id::text FROM eventos ORDER BY created_at DESC LIMIT 1)
WHERE clave = 'evento_activo_id'; 