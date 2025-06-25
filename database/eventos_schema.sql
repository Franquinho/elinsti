-- Esquema para Sistema de Eventos Múltiples
-- Tabla de eventos
CREATE TABLE IF NOT EXISTS eventos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
    activo BOOLEAN DEFAULT true,
    capacidad_maxima INTEGER,
    precio_entrada DECIMAL(10,2) DEFAULT 0,
    ubicacion VARCHAR(255),
    imagen_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para tracking de evento activo
CREATE TABLE IF NOT EXISTS configuracion_sistema (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuración inicial
INSERT INTO configuracion_sistema (clave, valor, descripcion) 
VALUES ('evento_activo_id', '1', 'ID del evento actualmente activo en el sistema')
ON CONFLICT (clave) DO NOTHING;

-- Modificar tabla comandas para incluir evento_id (si no existe)
-- ALTER TABLE comandas ADD COLUMN IF NOT EXISTS evento_id INTEGER REFERENCES eventos(id);

-- Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_eventos_activo ON eventos(activo);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_comandas_evento ON comandas(evento_id);

-- Políticas RLS para eventos
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

-- Permitir lectura a todos los usuarios autenticados
CREATE POLICY "Usuarios pueden ver eventos" ON eventos
    FOR SELECT USING (auth.role() = 'authenticated');

-- Solo administradores pueden modificar eventos
CREATE POLICY "Solo administradores pueden modificar eventos" ON eventos
    FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'administrador');

-- Políticas para configuración del sistema
ALTER TABLE configuracion_sistema ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solo administradores pueden modificar configuración" ON configuracion_sistema
    FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'administrador');

CREATE POLICY "Usuarios pueden leer configuración" ON configuracion_sistema
    FOR SELECT USING (auth.role() = 'authenticated'); 