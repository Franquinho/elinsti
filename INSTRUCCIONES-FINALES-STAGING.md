# 🎯 **INSTRUCCIONES FINALES - CONFIGURACIÓN STAGING CON SUPABASE REAL**

## 📋 **RESUMEN EJECUTIVO**

Este documento contiene las instrucciones paso a paso para completar la configuración de staging con credenciales reales de Supabase y verificar que todo funcione correctamente.

---

## 🚀 **PASOS PARA COMPLETAR CONFIGURACIÓN**

### **Paso 1: Obtener Credenciales de Supabase Staging**

1. **Crear proyecto en Supabase:**
   - Ve a [supabase.com](https://supabase.com)
   - Crea un nuevo proyecto llamado "el-insti-staging"
   - Anota las siguientes credenciales:
     - **Project URL** (ej: `https://abc123.supabase.co`)
     - **anon public** key
     - **service_role** key

2. **Configurar archivo de entorno:**
   ```bash
   # Copiar plantilla
   cp env-staging.txt .env.staging
   
   # Editar con credenciales reales
   nano .env.staging
   ```

3. **Variables requeridas en .env.staging:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL_STAGING=https://tu-proyecto-staging.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING=tu_clave_anonima_real
   SUPABASE_SERVICE_ROLE_KEY_STAGING=tu_clave_service_role_real
   ```

### **Paso 2: Verificar Configuración**

```bash
# Ejecutar script de verificación
node scripts/verify-staging-config.js
```

**Resultado esperado:**
```
✅ Configuración verificada correctamente
✅ Conexión con clave anónima exitosa
✅ Conexión con clave de servicio exitosa
```

### **Paso 3: Ejecutar Migraciones SQL**

1. **Acceder al SQL Editor de Supabase:**
   - Ve al dashboard de tu proyecto staging
   - Navega a **SQL Editor**
   - Abre el archivo `scripts/migrate-staging.sql`

2. **Ejecutar migraciones:**
   - Copia todo el contenido del archivo
   - Pega en el SQL Editor
   - Haz clic en **Run** para ejecutar

3. **Verificar creación de tablas:**
   - Ve a **Table Editor**
   - Confirma que se crearon las tablas:
     - `usuarios`
     - `productos`
     - `eventos`
     - `comandas`
     - `comanda_items`
     - `caja`

### **Paso 4: Configurar Base de Datos**

```bash
# Ejecutar script de configuración
node scripts/setup-staging.js
```

**Resultado esperado:**
```
✅ 10 productos insertados
✅ 3 usuarios insertados
✅ 2 eventos insertados
```

### **Paso 5: Ejecutar Configuración Completa**

```bash
# Ejecutar script completo automatizado
node scripts/complete-staging-setup.js
```

Este script ejecutará automáticamente:
- ✅ Verificación de configuración
- ✅ Confirmación de migraciones SQL
- ✅ Configuración de base de datos
- ✅ Verificación de estructura
- ✅ Inicio de servidor
- ✅ Smoke tests
- ✅ Tests de integración
- ✅ Generación de reportes

---

## 🧪 **VERIFICACIÓN MANUAL**

### **1. Verificar Conexión Directa**

```bash
# Ejecutar consulta simple
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.staging' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_STAGING,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING
);

supabase.from('productos').select('*').limit(1).then(({data, error}) => {
  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.log('✅ Conexión exitosa');
    console.log('Productos encontrados:', data.length);
  }
});
"
```

### **2. Verificar Endpoints con CURL**

```bash
# Iniciar servidor
npm run dev

# En otra terminal, probar endpoints
curl -X GET http://localhost:3000/api/productos/list
curl -X GET http://localhost:3000/api/eventos
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@elinsti.com","password":"Admin123!"}'
```

### **3. Ejecutar Smoke Tests**

```bash
# Ejecutar smoke tests automatizados
node scripts/smoke-test-staging.js
```

---

## 📊 **REPORTES GENERADOS**

### **1. Reporte de Configuración**
- **Archivo:** `staging-config-report.json`
- **Contenido:** Estado de variables de entorno y conexión

### **2. Reporte de Smoke Tests**
- **Archivo:** `smoke-test-report.json`
- **Contenido:** Resultados de pruebas de endpoints

### **3. Reporte Final**
- **Archivo:** `staging-final-report.json`
- **Contenido:** Resumen completo de configuración

---

## 🔍 **CRITERIOS DE ÉXITO**

### **✅ Configuración Técnica**
- [ ] Variables de entorno configuradas correctamente
- [ ] Conexión a Supabase exitosa (anónima y servicio)
- [ ] Migraciones SQL ejecutadas sin errores
- [ ] Base de datos poblada con datos de prueba
- [ ] Servidor iniciado correctamente

### **✅ Tests Automatizados**
- [ ] Smoke tests pasando al 100%
- [ ] Tests de integración ejecutándose
- [ ] No errores 500 en endpoints
- [ ] Respuestas HTTP correctas (200, 401, 404)

### **✅ Verificación Manual**
- [ ] Login con credenciales válidas funciona
- [ ] Login con credenciales inválidas rechazado
- [ ] Listar productos devuelve datos
- [ ] Listar eventos devuelve datos
- [ ] Crear comanda sin auth rechazado

---

## 🚨 **SOLUCIÓN DE PROBLEMAS**

### **Error: Variables de entorno no configuradas**
```bash
# Verificar archivo .env.staging
cat .env.staging

# Verificar que las variables no contengan placeholders
grep -E "(your_|placeholder)" .env.staging
```

### **Error: Conexión a Supabase fallida**
```bash
# Verificar URL y claves
echo $NEXT_PUBLIC_SUPABASE_URL_STAGING
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING

# Probar conexión manual
node scripts/verify-staging-config.js
```

### **Error: Tablas no existen**
```bash
# Verificar migraciones SQL ejecutadas
# Ir a Supabase Dashboard > SQL Editor
# Ejecutar: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

### **Error: Servidor no inicia**
```bash
# Verificar dependencias
npm install

# Verificar puerto disponible
lsof -i :3000

# Iniciar manualmente
npm run dev
```

---

## 📋 **CHECKLIST DE VERIFICACIÓN**

### **Antes de Ejecutar Scripts**
- [ ] Proyecto Supabase staging creado
- [ ] Credenciales copiadas correctamente
- [ ] Archivo .env.staging configurado
- [ ] Dependencias instaladas (`npm install`)

### **Después de Ejecutar Scripts**
- [ ] Verificación de configuración exitosa
- [ ] Migraciones SQL ejecutadas
- [ ] Base de datos poblada
- [ ] Servidor iniciado
- [ ] Smoke tests pasando
- [ ] Tests de integración ejecutándose

### **Verificación Final**
- [ ] Login funciona con credenciales válidas
- [ ] Login rechaza credenciales inválidas
- [ ] Endpoints devuelven respuestas correctas
- [ ] No errores 500 en operaciones normales
- [ ] Reportes generados correctamente

---

## 🎯 **CREDENCIALES DE PRUEBA**

Una vez configurado, puedes usar estas credenciales:

```bash
# Admin
Email: admin@elinsti.com
Password: Admin123!

# Cajero
Email: caja@elinsti.com
Password: Caja123!

# Vendedor
Email: ventas@elinsti.com
Password: Ventas123!
```

---

## 🚀 **PRÓXIMOS PASOS**

### **Al Completar Configuración**

1. **QA Manual:**
   - Completar `CHECKLIST-QA-STAGING.md`
   - Probar flujos críticos en interfaz
   - Validar en diferentes dispositivos

2. **Documentación:**
   - Revisar reportes generados
   - Documentar problemas encontrados
   - Actualizar documentación del proyecto

3. **Preparación para Producción:**
   - Configurar entorno de producción
   - Preparar despliegue
   - Configurar monitoreo

---

## 📞 **SOPORTE**

### **En caso de problemas:**
1. Revisar logs de error en consola
2. Verificar configuración con `verify-staging-config.js`
3. Ejecutar smoke tests para identificar problemas
4. Revisar reportes generados
5. Consultar documentación de Supabase

---

*Documento generado el: [Fecha]*  
*Versión: 1.0*  
*Sistema: POS "El INSTI" - Configuración Staging* 