-- Script de Base de Datos para Producción - El INSTI POS
-- Ejecutar en MySQL de Ferozo

-- Crear tablas principales
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    clave_hash VARCHAR(255) NOT NULL,
    rol ENUM('administrador', 'caja', 'venta') NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_usuarios_email (email),
    INDEX idx_usuarios_activo (activo)
);

CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    emoji VARCHAR(10) DEFAULT '📦',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_productos_activo (activo),
    INDEX idx_productos_nombre (nombre)
);

CREATE TABLE IF NOT EXISTS eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    capacidad_maxima INT CHECK (capacidad_maxima > 0),
    precio_entrada DECIMAL(10,2) DEFAULT 0 CHECK (precio_entrada >= 0),
    ubicacion VARCHAR(255),
    imagen_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_eventos_activo (activo),
    INDEX idx_eventos_fechas (fecha_inicio, fecha_fin),
    CONSTRAINT chk_fechas_evento CHECK (fecha_fin > fecha_inicio)
);

CREATE TABLE IF NOT EXISTS caja (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento_id INT,
    usuario_id INT,
    apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cierre TIMESTAMP NULL,
    monto_inicial DECIMAL(10,2) DEFAULT 0 CHECK (monto_inicial >= 0),
    monto_final DECIMAL(10,2) NULL CHECK (monto_final >= 0),
    estado ENUM('abierta', 'cerrada') DEFAULT 'abierta',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_caja_estado (estado),
    INDEX idx_caja_evento (evento_id)
);

CREATE TABLE IF NOT EXISTS comandas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    evento_id INT NOT NULL,
    caja_id INT,
    estado ENUM('pendiente', 'pagado', 'cancelado') DEFAULT 'pendiente',
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    metodo_pago ENUM('invitacion', 'transferencia', 'efectivo', 'revisar') NULL,
    nota TEXT NULL,
    nombre_cliente VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE RESTRICT,
    FOREIGN KEY (caja_id) REFERENCES caja(id) ON DELETE SET NULL,
    INDEX idx_comandas_estado (estado),
    INDEX idx_comandas_fecha (created_at),
    INDEX idx_comandas_evento (evento_id),
    INDEX idx_comandas_usuario (usuario_id)
);

CREATE TABLE IF NOT EXISTS comanda_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comanda_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comanda_id) REFERENCES comandas(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
    INDEX idx_comanda_items_comanda (comanda_id),
    INDEX idx_comanda_items_producto (producto_id),
    CONSTRAINT chk_subtotal CHECK (subtotal = cantidad * precio_unitario)
);

CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    accion VARCHAR(100) NOT NULL,
    detalle TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_logs_usuario (usuario_id),
    INDEX idx_logs_fecha (created_at)
);

-- Tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS configuracion_sistema (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_config_clave (clave)
);

-- Insertar datos iniciales
INSERT INTO usuarios (nombre, email, clave_hash, rol) VALUES
('Admin El Insti', 'admin@elinsti.com', '$2b$10$hash', 'administrador'),
('Cajero Principal', 'caja@elinsti.com', '$2b$10$hash', 'caja'),
('Vendedor 1', 'venta1@elinsti.com', '$2b$10$hash', 'venta')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO productos (nombre, precio, emoji, activo) VALUES
('Cerveza Artesanal', 2500.00, '🍺', TRUE),
('Vino Tinto', 3500.00, '🍷', TRUE),
('Empanadas', 1200.00, '🥟', TRUE),
('Tabla de Quesos', 4500.00, '🧀', TRUE),
('Café Especial', 1800.00, '☕', TRUE),
('Agua Mineral', 800.00, '💧', TRUE)
ON DUPLICATE KEY UPDATE precio = VALUES(precio), activo = VALUES(activo);

INSERT INTO eventos (nombre, descripcion, fecha_inicio, fecha_fin, activo, capacidad_maxima, precio_entrada, ubicacion) VALUES
('Noche Bohemia - Enero 2024', 'Evento de música en vivo', '2024-01-15 20:00:00', '2024-01-16 02:00:00', TRUE, 150, 5000.00, 'Sala Principal'),
('Concierto Acústico', 'Música acústica y poesía', '2024-01-20 19:00:00', '2024-01-20 23:00:00', TRUE, 80, 3000.00, 'Jardín Trasero')
ON DUPLICATE KEY UPDATE activo = VALUES(activo);

-- Insertar configuración inicial
INSERT INTO configuracion_sistema (clave, valor, descripcion) VALUES
('evento_activo_id', '1', 'ID del evento actualmente activo en el sistema'),
('caja_abierta', 'true', 'Estado de la caja (true/false)'),
('modo_offline', 'false', 'Modo offline activado (true/false)')
ON DUPLICATE KEY UPDATE valor = VALUES(valor);

-- Crear índices adicionales para optimización
CREATE INDEX idx_comandas_metodo_pago ON comandas(metodo_pago);
CREATE INDEX idx_comandas_total ON comandas(total);
CREATE INDEX idx_productos_precio ON productos(precio);
CREATE INDEX idx_eventos_nombre ON eventos(nombre);

-- Triggers para auditoría
DELIMITER //
CREATE TRIGGER log_comanda_creada
AFTER INSERT ON comandas
FOR EACH ROW
BEGIN
    INSERT INTO logs (usuario_id, accion, detalle)
    VALUES (NEW.usuario_id, 'COMANDA_CREADA', 
            CONCAT('Comanda #', NEW.id, ' - Cliente: ', NEW.nombre_cliente, ' - Total: $', NEW.total));
END//

CREATE TRIGGER log_comanda_actualizada
AFTER UPDATE ON comandas
FOR EACH ROW
BEGIN
    IF OLD.estado != NEW.estado THEN
        INSERT INTO logs (usuario_id, accion, detalle)
        VALUES (NEW.usuario_id, 'COMANDA_ESTADO_CAMBIADO', 
                CONCAT('Comanda #', NEW.id, ' - Estado: ', OLD.estado, ' -> ', NEW.estado));
    END IF;
END//
DELIMITER ;

-- Eliminar columna password si existe
ALTER TABLE usuarios DROP COLUMN IF EXISTS password;
