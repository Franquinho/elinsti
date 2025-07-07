# 🚀 **INSTRUCCIONES FASE 2 - BLOQUE INTEGRACIÓN: Staging y QA Real**

## 📋 **RESUMEN EJECUTIVO**

Esta fase implementa un entorno de staging completo con Supabase real para realizar pruebas de integración y QA manual antes de pasar a producción.

---

## 🎯 **OBJETIVOS DE LA FASE 2**

### ✅ **Entorno Staging Funcional**
- Configuración automática de múltiples entornos
- Base de datos Supabase real para staging
- Datos de prueba pre-cargados
- Scripts de configuración automatizados

### ✅ **QA Manual Completo**
- Checklist detallado de pruebas
- Flujos críticos documentados
- Validación de UX y funcionalidad
- Reportes de resultados

### ✅ **Tests de Integración Reales**
- Tests contra Supabase real (sin mocks)
- Validación de endpoints completos
- Pruebas de flujos completos
- Cobertura de casos edge

---

## 🛠️ **ARCHIVOS CREADOS**

### **1. Configuración de Entorno**
- `env-staging.txt` - Plantilla de configuración para staging
- `lib/supabase.ts` - Configuración automática de entornos

### **2. Scripts de Configuración**
- `scripts/setup-staging.js` - Configuración automática de base de datos
- `scripts/migrate-staging.sql` - Migraciones SQL completas
- `scripts/run-staging-setup.js` - Script principal de configuración

### **3. Tests de Integración**
- `__tests__/integration-staging.test.ts` - Tests contra Supabase real

### **4. Documentación QA**
- `CHECKLIST-QA-STAGING.md` - Checklist completo de QA manual

---

## 🚀 **PASOS PARA COMPLETAR FASE 2**

### **Paso 1: Configurar Proyecto Supabase Staging**

1. **Crear proyecto en Supabase:**
   - Ve a [supabase.com](https://supabase.com)
   - Crea un nuevo proyecto llamado "el-insti-staging"
   - Anota las credenciales (URL y claves)

2. **Configurar variables de entorno:**
   ```bash
   # Copiar plantilla
   cp env-staging.txt .env.staging
   
   # Editar con credenciales reales
   nano .env.staging
   ```

3. **Variables requeridas:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL_STAGING=https://tu-proyecto-staging.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING=tu_clave_anonima_staging
   SUPABASE_SERVICE_ROLE_KEY_STAGING=tu_clave_service_role_staging
   ```

### **Paso 2: Ejecutar Migraciones SQL**

1. **Acceder al SQL Editor de Supabase:**
   - Ve al dashboard de tu proyecto staging
   - Navega a SQL Editor
   - Abre el archivo `scripts/migrate-staging.sql`

2. **Ejecutar migraciones:**
   - Copia todo el contenido del archivo
   - Pega en el SQL Editor
   - Ejecuta el script completo

3. **Verificar creación:**
   - Ve a Table Editor
   - Confirma que se crearon todas las tablas:
     - `usuarios`
     - `productos`
     - `eventos`
     - `comandas`
     - `comanda_items`
     - `caja`

### **Paso 3: Configurar Base de Datos**

1. **Ejecutar script de configuración:**
   ```bash
   node scripts/setup-staging.js
   ```

2. **Verificar datos de prueba:**
   - 10 productos pre-cargados
   - 3 usuarios de prueba
   - 2 eventos de prueba
   - Credenciales listadas en consola

### **Paso 4: Ejecutar Tests de Integración**

1. **Configurar entorno para tests:**
   ```bash
   # Asegurar que las variables de staging estén disponibles
   export NODE_ENV=staging
   ```

2. **Ejecutar tests:**
   ```bash
   npm test -- --testPathPattern="integration-staging" --verbose
   ```

3. **Verificar resultados:**
   - Todos los tests deben pasar
   - Revisar logs de conexión
   - Confirmar operaciones CRUD

### **Paso 5: QA Manual Completo**

1. **Preparar checklist:**
   - Abrir `CHECKLIST-QA-STAGING.md`
   - Configurar información del tester
   - Preparar dispositivos de prueba

2. **Ejecutar pruebas por sección:**
   - **Autenticación:** Login con todas las credenciales
   - **Ventas:** Crear comandas completas
   - **Productos:** CRUD completo
   - **Eventos:** Gestión de eventos
   - **Estadísticas:** Verificar métricas
   - **Responsividad:** Probar en móvil/tablet

3. **Documentar resultados:**
   - Marcar cada item del checklist
   - Anotar problemas encontrados
   - Calcular métricas de éxito

### **Paso 6: Ejecutar Script Completo**

1. **Script automatizado:**
   ```bash
   node scripts/run-staging-setup.js
   ```

2. **Verificar reporte:**
   - Revisar `staging-report.json`
   - Confirmar configuración completa
   - Validar credenciales

---

## 📊 **CRITERIOS DE ÉXITO**

### **✅ Configuración Técnica**
- [ ] Variables de entorno configuradas
- [ ] Migraciones SQL ejecutadas
- [ ] Base de datos poblada con datos de prueba
- [ ] Tests de integración pasando
- [ ] Script de configuración ejecutado sin errores

### **✅ QA Manual**
- [ ] Checklist completado al 100%
- [ ] Todos los flujos críticos probados
- [ ] No errores 500 en operaciones normales
- [ ] Mensajes de error claros y útiles
- [ ] UX fluida en todos los dispositivos

### **✅ Tests de Integración**
- [ ] 100% de tests pasando
- [ ] Cobertura de todos los endpoints
- [ ] Validación de constraints de BD
- [ ] Pruebas de seguridad básicas

---

## 🔍 **VERIFICACIÓN DE CALIDAD**

### **Pruebas de Flujos Críticos**

1. **Login y Autenticación:**
   ```bash
   # Credenciales válidas
   admin@elinsti.com / Admin123!
   caja@elinsti.com / Caja123!
   ventas@elinsti.com / Ventas123!
   
   # Credenciales inválidas
   admin@elinsti.com / password_incorrecto
   usuario_inexistente@test.com / Admin123!
   ```

2. **Creación de Comandas:**
   - Agregar múltiples productos
   - Validar cálculos automáticos
   - Probar todos los métodos de pago
   - Verificar generación de número de comanda

3. **Gestión de Productos:**
   - Crear producto nuevo
   - Editar producto existente
   - Activar/desactivar productos
   - Eliminar productos (soft delete)

4. **Gestión de Eventos:**
   - Crear evento nuevo
   - Cambiar evento activo
   - Verificar filtrado por evento

### **Validaciones de Seguridad**

1. **Control de Acceso:**
   - Admin puede acceder a todo
   - Cajero limitado a caja y ventas
   - Vendedor limitado a ventas

2. **Validación de Datos:**
   - Precios positivos
   - Fechas válidas
   - Campos obligatorios
   - Sanitización de entrada

3. **Manejo de Errores:**
   - Mensajes claros
   - No exposición de datos sensibles
   - Logs apropiados

---

## 📈 **MÉTRICAS DE RENDIMIENTO**

### **Tiempos de Respuesta Objetivo**
- **Carga inicial:** < 3 segundos
- **Login:** < 2 segundos
- **Crear comanda:** < 2 segundos
- **Listar productos:** < 1 segundo
- **Actualizar estado:** < 1 segundo

### **Cobertura de Tests**
- **Tests unitarios:** 100% de endpoints
- **Tests de integración:** Flujos completos
- **Tests de validación:** Casos edge
- **Tests de seguridad:** Control de acceso

---

## 🚨 **SOLUCIÓN DE PROBLEMAS**

### **Problemas Comunes**

1. **Error de conexión a Supabase:**
   ```bash
   # Verificar variables de entorno
   echo $NEXT_PUBLIC_SUPABASE_URL_STAGING
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING
   
   # Verificar archivo .env.staging
   cat .env.staging
   ```

2. **Tests fallando:**
   ```bash
   # Verificar configuración
   npm test -- --testPathPattern="integration-staging" --verbose
   
   # Verificar datos de prueba
   node scripts/setup-staging.js
   ```

3. **Migraciones SQL fallando:**
   - Verificar permisos en Supabase
   - Ejecutar migraciones por partes
   - Revisar logs de error

### **Logs de Debug**

1. **Habilitar logs detallados:**
   ```env
   LOG_LEVEL=debug
   ENABLE_DEBUG_LOGS=true
   ```

2. **Verificar logs de aplicación:**
   ```bash
   npm run dev
   # Revisar consola para errores
   ```

---

## 📋 **CHECKLIST DE ENTREGA**

### **✅ Configuración Técnica**
- [ ] Proyecto Supabase staging creado
- [ ] Variables de entorno configuradas
- [ ] Migraciones SQL ejecutadas
- [ ] Base de datos poblada
- [ ] Scripts de configuración funcionando

### **✅ Tests Automatizados**
- [ ] Tests de integración pasando
- [ ] Cobertura completa de endpoints
- [ ] Validaciones de seguridad
- [ ] Casos edge cubiertos

### **✅ QA Manual**
- [ ] Checklist completado
- [ ] Flujos críticos probados
- [ ] UX validada en múltiples dispositivos
- [ ] Problemas documentados y resueltos

### **✅ Documentación**
- [ ] Reporte de configuración generado
- [ ] Resultados de QA documentados
- [ ] Problemas y soluciones registrados
- [ ] Recomendaciones para producción

---

## 🎯 **PRÓXIMOS PASOS**

### **Al Completar FASE 2**

1. **Revisar resultados:**
   - Analizar reporte de configuración
   - Revisar resultados de QA
   - Identificar mejoras necesarias

2. **Decidir siguiente fase:**
   - **FASE 3 - Performance:** Optimizaciones y métricas
   - **FASE 4 - Nuevas Features:** Funcionalidades adicionales
   - **FASE 5 - Producción:** Despliegue final

3. **Preparar documentación:**
   - Actualizar README
   - Documentar configuración de staging
   - Preparar guías de usuario

---

## 📞 **SOPORTE**

### **En caso de problemas:**
1. Revisar logs de error
2. Verificar configuración
3. Ejecutar tests de diagnóstico
4. Consultar documentación
5. Contactar al equipo de desarrollo

---

*Documento generado el: [Fecha]*  
*Versión: 1.0*  
*Sistema: POS "El INSTI" - FASE 2 Staging* 