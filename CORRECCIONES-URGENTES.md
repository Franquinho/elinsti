# 🚨 CORRECCIONES URGENTES - SISTEMA EL INSTI

## 📋 RESUMEN DE PROBLEMAS CRÍTICOS

El sistema presenta múltiples errores que impiden su funcionamiento correcto:

1. **Error de IndexedDB**: Parámetro inválido en `obtenerPagosNoSincronizados()`
2. **Error de Base de Datos**: Columna 'activo' no encontrada en tabla 'eventos'
3. **Error de React Query**: QueryClient no configurado
4. **Errores 500**: APIs críticas fallando

## 🛠️ CORRECCIONES INMEDIATAS

### 1. Corregir Error de IndexedDB

El error está en `lib/offline-storage.ts` línea 238. El método `index.getAll(false)` debe cambiarse por `index.getAll()` y filtrar después.

**Solución ya aplicada**: El código ya está corregido en el archivo.

### 2. Configurar Base de Datos Supabase

**PROBLEMA**: La tabla `eventos` no existe o no tiene la columna `activo`.

**SOLUCIÓN**: Ejecutar el siguiente SQL en el SQL Editor de Supabase:

```sql
-- Crear tabla eventos si no existe
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

-- Crear tabla productos si no existe
CREATE TABLE IF NOT EXISTS productos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    emoji VARCHAR(10) DEFAULT '📦',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla comandas si no existe
CREATE TABLE IF NOT EXISTS comandas (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT,
    evento_id BIGINT,
    caja_id BIGINT,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'cancelado')),
    total DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(20) NULL CHECK (metodo_pago IN ('invitacion', 'transferencia', 'efectivo', 'revisar')),
    nota TEXT NULL,
    nombre_cliente VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla comanda_items si no existe
CREATE TABLE IF NOT EXISTS comanda_items (
    id BIGSERIAL PRIMARY KEY,
    comanda_id BIGINT REFERENCES comandas(id) ON DELETE CASCADE,
    producto_id BIGINT REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- Crear tabla configuracion_sistema si no existe
CREATE TABLE IF NOT EXISTS configuracion_sistema (
    id BIGSERIAL PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descripcion TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuración inicial
INSERT INTO configuracion_sistema (clave, valor, descripcion) 
VALUES ('evento_activo_id', '1', 'ID del evento actualmente activo en el sistema')
ON CONFLICT (clave) DO NOTHING;

-- Insertar datos de prueba
INSERT INTO eventos (nombre, descripcion, fecha_inicio, fecha_fin, activo) 
SELECT 'Evento Inicial', 'Evento de prueba para el sistema', NOW(), NOW() + INTERVAL '1 day', true
WHERE NOT EXISTS (SELECT 1 FROM eventos WHERE nombre = 'Evento Inicial');

INSERT INTO productos (nombre, precio, emoji, activo) 
SELECT 'Cerveza Artesanal', 2500.00, '🍺', true
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Cerveza Artesanal');

-- Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_eventos_activo ON eventos(activo);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);
CREATE INDEX IF NOT EXISTS idx_comandas_estado ON comandas(estado);
```

### 3. Configurar React Query

**PROBLEMA**: QueryClient no configurado.

**SOLUCIÓN**: El layout ya tiene el QueryClientProvider configurado correctamente.

### 4. Verificar Variables de Entorno

Asegúrate de que las siguientes variables estén configuradas en tu archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_de_supabase
```

## 🔧 PASOS PARA APLICAR CORRECCIONES

### Paso 1: Configurar Base de Datos
1. Ve al dashboard de Supabase
2. Abre el SQL Editor
3. Ejecuta el script SQL proporcionado arriba
4. Verifica que las tablas se crearon correctamente

### Paso 2: Verificar Variables de Entorno
1. Revisa tu archivo `.env.local`
2. Asegúrate de que todas las variables de Supabase estén configuradas
3. Reinicia el servidor de desarrollo

### Paso 3: Probar el Sistema
1. Ejecuta `npm run dev`
2. Abre el navegador en `http://localhost:3000`
3. Verifica que no hay errores en la consola
4. Prueba crear un evento y un producto

## 🚨 PROBLEMAS ESPERADOS Y SOLUCIONES

### Si sigues viendo errores 500:
1. Verifica que las tablas se crearon correctamente en Supabase
2. Revisa los logs del servidor para errores específicos
3. Asegúrate de que las políticas RLS estén configuradas

### Si los productos no se cargan en administración:
1. Verifica que la tabla `productos` existe y tiene datos
2. Revisa que la columna `activo` existe en la tabla
3. Verifica las políticas RLS para la tabla productos

### Si las comandas no se crean:
1. Verifica que las tablas `comandas` y `comanda_items` existen
2. Revisa que las relaciones entre tablas estén correctas
3. Verifica las políticas RLS para las tablas de comandas

## 📞 SOPORTE

Si después de aplicar estas correcciones sigues teniendo problemas:

1. Revisa los logs del servidor (`npm run dev`)
2. Revisa la consola del navegador (F12)
3. Verifica el estado de las tablas en Supabase
4. Contacta al equipo de desarrollo con los errores específicos

## ✅ VERIFICACIÓN FINAL

Después de aplicar todas las correcciones, el sistema debería:

- ✅ Cargar sin errores en la consola
- ✅ Mostrar productos en la sección de administración
- ✅ Permitir crear eventos
- ✅ Permitir crear comandas
- ✅ Funcionar correctamente en modo offline (rol caja)
- ✅ Mostrar estadísticas correctamente

---

**IMPORTANTE**: Estas correcciones son críticas para el funcionamiento del sistema. Aplica todas las correcciones antes de usar el sistema en producción. 