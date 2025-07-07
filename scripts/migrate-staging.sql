-- ========================================
-- MIGRACIONES PARA STAGING - EL INSTI POS
-- ========================================
-- Ejecutar este script en la base de datos de Supabase Staging

-- ========================================
-- 1. CREAR TABLAS SI NO EXISTEN
-- ========================================

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'caja', 'ventas')),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    precio DECIMAL(10,2) NOT NULL CHECK (precio > 0),
    emoji VARCHAR(10) DEFAULT '📦',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de eventos
CREATE TABLE IF NOT EXISTS eventos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    capacidad_maxima INTEGER,
    precio_entrada DECIMAL(10,2) DEFAULT 0,
    ubicacion VARCHAR(255),
    imagen_url TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fecha_fin_after_inicio CHECK (fecha_fin > fecha_inicio)
);

-- Tabla de comandas
CREATE TABLE IF NOT EXISTS comandas (
    id SERIAL PRIMARY KEY,
    numero_comanda VARCHAR(50) UNIQUE NOT NULL,
    cliente_nombre VARCHAR(255) NOT NULL,
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    metodo_pago VARCHAR(50) NOT NULL CHECK (metodo_pago IN ('efectivo', 'transferencia', 'invitacion')),
    estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completada', 'cancelada')),
    evento_id INTEGER REFERENCES eventos(id),
    usuario_id INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de items de comanda
CREATE TABLE IF NOT EXISTS comanda_items (
    id SERIAL PRIMARY KEY,
    comanda_id INTEGER NOT NULL REFERENCES comandas(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de caja
CREATE TABLE IF NOT EXISTS caja (
    id SERIAL PRIMARY KEY,
    evento_id INTEGER REFERENCES eventos(id),
    monto_inicial DECIMAL(10,2) NOT NULL CHECK (monto_inicial >= 0),
    monto_final DECIMAL(10,2),
    estado VARCHAR(50) DEFAULT 'abierta' CHECK (estado IN ('abierta', 'cerrada')),
    usuario_id INTEGER REFERENCES usuarios(id),
    fecha_apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMP,
    observaciones TEXT
);

-- ========================================
-- 2. CREAR ÍNDICES PARA OPTIMIZACIÓN
-- ========================================

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);

-- Índices para productos
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos(nombre);

-- Índices para eventos
CREATE INDEX IF NOT EXISTS idx_eventos_activo ON eventos(activo);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha_inicio ON eventos(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha_fin ON eventos(fecha_fin);

-- Índices para comandas
CREATE INDEX IF NOT EXISTS idx_comandas_evento_id ON comandas(evento_id);
CREATE INDEX IF NOT EXISTS idx_comandas_usuario_id ON comandas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_comandas_estado ON comandas(estado);
CREATE INDEX IF NOT EXISTS idx_comandas_created_at ON comandas(created_at);

-- Índices para comanda_items
CREATE INDEX IF NOT EXISTS idx_comanda_items_comanda_id ON comanda_items(comanda_id);
CREATE INDEX IF NOT EXISTS idx_comanda_items_producto_id ON comanda_items(producto_id);

-- Índices para caja
CREATE INDEX IF NOT EXISTS idx_caja_evento_id ON caja(evento_id);
CREATE INDEX IF NOT EXISTS idx_caja_estado ON caja(estado);
CREATE INDEX IF NOT EXISTS idx_caja_fecha_apertura ON caja(fecha_apertura);

-- ========================================
-- 3. CREAR FUNCIONES Y TRIGGERS
-- ========================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON eventos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comandas_updated_at BEFORE UPDATE ON comandas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para generar número de comanda automáticamente
CREATE OR REPLACE FUNCTION generate_comanda_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.numero_comanda := 'CMD-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEW.id::TEXT, 4, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para número de comanda
CREATE TRIGGER generate_comanda_number_trigger BEFORE INSERT ON comandas FOR EACH ROW EXECUTE FUNCTION generate_comanda_number();

-- ========================================
-- 4. CONFIGURAR ROW LEVEL SECURITY (RLS)
-- ========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comandas ENABLE ROW LEVEL SECURITY;
ALTER TABLE comanda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE caja ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Usuarios pueden ver todos los usuarios activos" ON usuarios FOR SELECT USING (activo = true);
CREATE POLICY "Solo admins pueden modificar usuarios" ON usuarios FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para productos
CREATE POLICY "Todos pueden ver productos activos" ON productos FOR SELECT USING (activo = true);
CREATE POLICY "Solo admins pueden modificar productos" ON productos FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para eventos
CREATE POLICY "Todos pueden ver eventos" ON eventos FOR SELECT USING (true);
CREATE POLICY "Solo admins pueden modificar eventos" ON eventos FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para comandas
CREATE POLICY "Usuarios pueden ver comandas de su evento" ON comandas FOR SELECT USING (true);
CREATE POLICY "Usuarios pueden crear comandas" ON comandas FOR INSERT WITH CHECK (true);
CREATE POLICY "Usuarios pueden actualizar comandas" ON comandas FOR UPDATE USING (true);

-- Políticas para comanda_items
CREATE POLICY "Usuarios pueden ver items de comandas" ON comanda_items FOR SELECT USING (true);
CREATE POLICY "Usuarios pueden crear items de comandas" ON comanda_items FOR INSERT WITH CHECK (true);

-- Políticas para caja
CREATE POLICY "Usuarios pueden ver caja de su evento" ON caja FOR SELECT USING (true);
CREATE POLICY "Solo cajeros y admins pueden modificar caja" ON caja FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'caja'));

-- ========================================
-- 5. CREAR VISTAS ÚTILES
-- ========================================

-- Vista de estadísticas de ventas
CREATE OR REPLACE VIEW estadisticas_ventas AS
SELECT 
    e.nombre as evento_nombre,
    COUNT(c.id) as total_comandas,
    SUM(c.total) as total_ventas,
    COUNT(CASE WHEN c.estado = 'completada' THEN 1 END) as comandas_completadas,
    COUNT(CASE WHEN c.estado = 'cancelada' THEN 1 END) as comandas_canceladas,
    SUM(CASE WHEN c.metodo_pago = 'efectivo' THEN c.total ELSE 0 END) as total_efectivo,
    SUM(CASE WHEN c.metodo_pago = 'transferencia' THEN c.total ELSE 0 END) as total_transferencia,
    SUM(CASE WHEN c.metodo_pago = 'invitacion' THEN c.total ELSE 0 END) as total_invitacion
FROM eventos e
LEFT JOIN comandas c ON e.id = c.evento_id
GROUP BY e.id, e.nombre;

-- Vista de productos más vendidos
CREATE OR REPLACE VIEW productos_mas_vendidos AS
SELECT 
    p.nombre,
    p.emoji,
    SUM(ci.cantidad) as total_vendido,
    SUM(ci.subtotal) as total_ingresos
FROM productos p
JOIN comanda_items ci ON p.id = ci.producto_id
JOIN comandas c ON ci.comanda_id = c.id
WHERE c.estado = 'completada'
GROUP BY p.id, p.nombre, p.emoji
ORDER BY total_vendido DESC;

-- ========================================
-- 6. CONFIGURACIÓN FINAL
-- ========================================

-- Comentarios para documentación
COMMENT ON TABLE usuarios IS 'Tabla de usuarios del sistema POS';
COMMENT ON TABLE productos IS 'Tabla de productos disponibles para venta';
COMMENT ON TABLE eventos IS 'Tabla de eventos donde se realizan las ventas';
COMMENT ON TABLE comandas IS 'Tabla de comandas/órdenes de venta';
COMMENT ON TABLE comanda_items IS 'Items individuales de cada comanda';
COMMENT ON TABLE caja IS 'Control de apertura y cierre de caja por evento';

-- Verificar que todo se creó correctamente
SELECT '✅ Migración completada exitosamente' as status; 