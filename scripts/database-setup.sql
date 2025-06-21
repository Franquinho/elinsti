-- Crear tablas para el sistema POS El INSTI
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    clave_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('administrador', 'caja', 'venta')),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    emoji VARCHAR(10) DEFAULT '📦',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS eventos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    fecha DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'finalizado', 'cancelado')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS caja (
    id SERIAL PRIMARY KEY,
    evento_id INTEGER REFERENCES eventos(id),
    usuario_id INTEGER REFERENCES usuarios(id),
    apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cierre TIMESTAMP NULL,
    monto_inicial DECIMAL(10,2) DEFAULT 0,
    monto_final DECIMAL(10,2) NULL,
    estado VARCHAR(20) DEFAULT 'abierta' CHECK (estado IN ('abierta', 'cerrada'))
);

CREATE TABLE IF NOT EXISTS comandas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    evento_id INTEGER REFERENCES eventos(id),
    caja_id INTEGER REFERENCES caja(id),
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'cancelado')),
    total DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(20) NULL CHECK (metodo_pago IN ('invitacion', 'transferencia', 'efectivo', 'revisar')),
    nota TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nombre_cliente VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS comanda_detalle (
    id SERIAL PRIMARY KEY,
    comanda_id INTEGER REFERENCES comandas(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    accion VARCHAR(100) NOT NULL,
    detalle TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos de prueba
INSERT INTO usuarios (nombre, email, clave_hash, rol) VALUES
('Admin El Insti', 'admin@elinsti.com', '$2b$10$hash', 'administrador'),
('Cajero Principal', 'caja@elinsti.com', '$2b$10$hash', 'caja'),
('Vendedor 1', 'venta1@elinsti.com', '$2b$10$hash', 'venta');

INSERT INTO productos (nombre, precio, emoji, activo) VALUES
('Cerveza Artesanal', 2500.00, '🍺', true),
('Vino Tinto', 3500.00, '🍷', true),
('Empanadas', 1200.00, '🥟', true),
('Tabla de Quesos', 4500.00, '🧀', true),
('Café Especial', 1800.00, '☕', true),
('Agua Mineral', 800.00, '💧', true);

INSERT INTO eventos (nombre, fecha, estado) VALUES
('Noche Bohemia - Enero', '2024-01-15', 'activo'),
('Concierto Acústico', '2024-01-20', 'activo');

-- Actualizar comandas existentes con nombres de ejemplo
UPDATE comandas SET nombre_cliente = 'Mesa 1' WHERE id = 1;
UPDATE comandas SET nombre_cliente = 'Juan' WHERE id = 2;
