# 🚨 INSTRUCCIONES DE CORRECCIÓN - SISTEMA EL INSTI

## 📋 PROBLEMA IDENTIFICADO

El error `column "clave_hash" of relation "usuarios" does not exist` indica que estás intentando ejecutar un script SQL que incluye una tabla de usuarios personalizada, pero en Supabase la autenticación se maneja de manera diferente.

## 🛠️ SOLUCIÓN PASO A PASO

### Paso 1: Configurar Base de Datos Supabase

1. **Ve al dashboard de Supabase**
   - Abre tu proyecto en [supabase.com](https://supabase.com)
   - Ve a la sección "SQL Editor"

2. **Ejecuta el script SQL corregido**
   - Copia y pega el siguiente SQL en el editor:

```sql
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

-- 9. Crear políticas RLS básicas (permitir todo para desarrollo)
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
```

3. **Ejecuta el script**
   - Haz clic en "Run" en el SQL Editor
   - Verifica que no hay errores

### Paso 2: Verificar Variables de Entorno

Asegúrate de que tu archivo `.env.local` tenga las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_de_supabase
```

### Paso 3: Verificar la Configuración

Ejecuta el script de verificación:

```bash
node scripts/quick-setup.js
```

### Paso 4: Probar el Sistema

1. **Reinicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

2. **Abre el navegador** en `http://localhost:3000`

3. **Verifica que no hay errores** en la consola del navegador (F12)

4. **Prueba las funcionalidades**:
   - Crear un evento
   - Gestionar productos
   - Crear una comanda

## 🔍 VERIFICACIÓN DE ÉXITO

Después de aplicar las correcciones, deberías ver:

- ✅ **Sin errores en la consola del navegador**
- ✅ **Productos cargando en administración**
- ✅ **Eventos funcionando correctamente**
- ✅ **Comandas creándose sin errores**
- ✅ **APIs respondiendo correctamente**

## 🚨 SI SIGUES TENIENDO PROBLEMAS

### Error: "relation does not exist"
- Verifica que ejecutaste el script SQL completo
- Revisa que no hay errores en el SQL Editor de Supabase

### Error: "permission denied"
- Verifica que las políticas RLS están configuradas
- Asegúrate de que las variables de entorno son correctas

### Error: "authentication failed"
- Verifica las claves de Supabase en `.env.local`
- Asegúrate de que las claves son válidas

## 📞 SOPORTE ADICIONAL

Si después de seguir estas instrucciones sigues teniendo problemas:

1. **Revisa los logs del servidor** (`npm run dev`)
2. **Revisa la consola del navegador** (F12)
3. **Verifica el estado de las tablas** en Supabase
4. **Contacta al equipo de desarrollo** con los errores específicos

---

**IMPORTANTE**: Este script SQL está diseñado específicamente para Supabase y no incluye la tabla de usuarios personalizada, ya que Supabase maneja la autenticación de manera integrada. 