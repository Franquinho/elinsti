-- Script de Base de Datos MySQL para El INSTI POS
-- Ejecutar en tu base de datos MySQL

-- Crear tablas principales
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    clave_hash VARCHAR(255) NOT NULL,
    rol ENUM('administrador', 'caja', 'venta') NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    emoji VARCHAR(10) DEFAULT '📦',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    fecha DATE NOT NULL,
    estado ENUM('activo', 'finalizado', 'cancelado') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS caja (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento_id INT,
    usuario_id INT,
    apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cierre TIMESTAMP NULL,
    monto_inicial DECIMAL(10,2) DEFAULT 0,
    monto_final DECIMAL(10,2) NULL,
    estado ENUM('abierta', 'cerrada') DEFAULT 'abierta',
    FOREIGN KEY (evento_id) REFERENCES eventos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS comandas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    evento_id INT,
    caja_id INT NULL,
    estado ENUM('pendiente', 'pagado', 'cancelado') DEFAULT 'pendiente',
    total DECIMAL(10,2) NOT NULL,
    metodo_pago ENUM('invitacion', 'transferencia', 'efectivo', 'revisar') NULL,
    nota TEXT NULL,
    nombre_cliente VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (evento_id) REFERENCES eventos(id),
    FOREIGN KEY (caja_id) REFERENCES caja(id)
);

CREATE TABLE IF NOT EXISTS comanda_detalle (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comanda_id INT,
    producto_id INT,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (comanda_id) REFERENCES comandas(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    accion VARCHAR(100) NOT NULL,
    detalle TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Insertar datos iniciales
INSERT IGNORE INTO usuarios (nombre, email, clave_hash, rol) VALUES
('Admin El Insti', 'admin@elinsti.com', '123456', 'administrador'),
('Cajero Principal', 'caja@elinsti.com', '123456', 'caja'),
('Vendedor 1', 'venta1@elinsti.com', '123456', 'venta');

INSERT IGNORE INTO productos (nombre, precio, emoji, activo) VALUES
('Cerveza Artesanal', 2500.00, '🍺', TRUE),
('Vino Tinto', 3500.00, '🍷', TRUE),
('Empanadas', 1200.00, '🥟', TRUE),
('Tabla de Quesos', 4500.00, '🧀', TRUE),
('Café Especial', 1800.00, '☕', TRUE),
('Agua Mineral', 800.00, '💧', TRUE);

INSERT IGNORE INTO eventos (nombre, fecha, estado) VALUES
('Noche Bohemia - Enero 2024', '2024-01-15', 'activo'),
('Concierto Acústico', '2024-01-20', 'activo');

-- Crear índices para optimización
CREATE INDEX idx_comandas_estado ON comandas(estado);
CREATE INDEX idx_comandas_fecha ON comandas(created_at);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_productos_activo ON productos(activo);
