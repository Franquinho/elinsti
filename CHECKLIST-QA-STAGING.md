# 🧪 **CHECKLIST QA MANUAL - STAGING**

## 📋 **INFORMACIÓN GENERAL**
- **Fecha:** [Fecha de ejecución]
- **Tester:** [Nombre del tester]
- **Entorno:** Staging
- **URL:** [URL de staging]
- **Versión:** 2.0.0-staging

---

## 🔐 **1. AUTENTICACIÓN Y LOGIN**

### ✅ **Login Exitoso**
- [ ] **Admin:** admin@elinsti.com / Admin123!
  - [ ] Login exitoso
  - [ ] Redirección correcta al dashboard
  - [ ] Menú de admin visible
  - [ ] Acceso a todas las secciones

- [ ] **Cajero:** caja@elinsti.com / Caja123!
  - [ ] Login exitoso
  - [ ] Redirección correcta al dashboard
  - [ ] Menú de caja visible
  - [ ] Acceso limitado según rol

- [ ] **Vendedor:** ventas@elinsti.com / Ventas123!
  - [ ] Login exitoso
  - [ ] Redirección correcta al dashboard
  - [ ] Menú de ventas visible
  - [ ] Acceso limitado según rol

### ❌ **Login Fallido**
- [ ] **Credenciales incorrectas**
  - [ ] Email válido, password incorrecto
  - [ ] Mensaje de error claro
  - [ ] No redirección

- [ ] **Email inexistente**
  - [ ] Email que no existe en la base
  - [ ] Mensaje de error apropiado
  - [ ] No redirección

- [ ] **Campos vacíos**
  - [ ] Email vacío
  - [ ] Password vacío
  - [ ] Ambos campos vacíos
  - [ ] Validación en tiempo real

---

## 🛒 **2. SECCIÓN DE VENTAS**

### ✅ **Creación de Comandas**
- [ ] **Agregar productos**
  - [ ] Lista de productos activos visible
  - [ ] Agregar múltiples productos
  - [ ] Cambiar cantidades
  - [ ] Eliminar productos
  - [ ] Cálculo automático de total

- [ ] **Datos del cliente**
  - [ ] Campo nombre obligatorio
  - [ ] Validación de nombre vacío
  - [ ] Validación de caracteres especiales

- [ ] **Método de pago**
  - [ ] Efectivo
  - [ ] Transferencia
  - [ ] Invitación
  - [ ] Validación obligatoria

- [ ] **Crear comanda**
  - [ ] Validación completa antes de crear
  - [ ] Mensaje de éxito
  - [ ] Redirección a lista de comandas
  - [ ] Número de comanda generado

### ❌ **Validaciones y Errores**
- [ ] **Sin nombre de cliente**
  - [ ] Mensaje: "Debe ingresar el nombre del cliente"
  - [ ] Formulario no se envía

- [ ] **Sin productos**
  - [ ] Mensaje: "Debe agregar al menos un producto"
  - [ ] Formulario no se envía

- [ ] **Cantidades inválidas**
  - [ ] Cantidad 0 o negativa
  - [ ] Mensaje de error específico

- [ ] **Total inválido**
  - [ ] Total 0 o negativo
  - [ ] Mensaje: "El total debe ser mayor a 0"

---

## 📦 **3. GESTIÓN DE PRODUCTOS**

### ✅ **Listar Productos**
- [ ] **Productos activos**
  - [ ] Solo productos activos visibles
  - [ ] Información completa (nombre, precio, emoji)
  - [ ] Ordenamiento correcto

- [ ] **Productos inactivos**
  - [ ] No aparecen en ventas
  - [ ] Aparecen en admin con indicador

### ✅ **Crear Producto (Admin)**
- [ ] **Formulario completo**
  - [ ] Nombre obligatorio
  - [ ] Precio obligatorio y positivo
  - [ ] Selección de emoji
  - [ ] Validación en tiempo real

- [ ] **Creación exitosa**
  - [ ] Producto aparece en lista
  - [ ] Producto disponible en ventas
  - [ ] Mensaje de confirmación

### ✅ **Editar Producto (Admin)**
- [ ] **Modificar datos**
  - [ ] Cambiar nombre
  - [ ] Cambiar precio
  - [ ] Cambiar emoji
  - [ ] Guardar cambios

- [ ] **Activar/Desactivar**
  - [ ] Toggle de activo/inactivo
  - [ ] Cambio inmediato en interfaz
  - [ ] Confirmación visual

### ✅ **Eliminar Producto (Admin)**
- [ ] **Confirmación**
  - [ ] Diálogo de confirmación
  - [ ] Producto eliminado de lista
  - [ ] No aparece en ventas

---

## 🎉 **4. GESTIÓN DE EVENTOS**

### ✅ **Listar Eventos**
- [ ] **Eventos activos**
  - [ ] Lista de eventos disponibles
  - [ ] Información completa
  - [ ] Estado activo/inactivo

### ✅ **Crear Evento (Admin)**
- [ ] **Formulario completo**
  - [ ] Nombre obligatorio
  - [ ] Fechas válidas (fin > inicio)
  - [ ] Capacidad máxima opcional
  - [ ] Precio de entrada opcional
  - [ ] Ubicación opcional
  - [ ] URL de imagen opcional

- [ ] **Validaciones**
  - [ ] Fecha fin posterior a inicio
  - [ ] Capacidad positiva
  - [ ] Precio no negativo

### ✅ **Selector de Evento**
- [ ] **Cambio de evento**
  - [ ] Dropdown de eventos
  - [ ] Cambio inmediato
  - [ ] Filtrado de comandas por evento
  - [ ] Estadísticas por evento

---

## 📊 **5. ESTADÍSTICAS**

### ✅ **Dashboard Principal**
- [ ] **Métricas básicas**
  - [ ] Ventas del día
  - [ ] Ventas de la semana
  - [ ] Ventas del mes
  - [ ] Productos vendidos
  - [ ] Total por método de pago

### ✅ **Estadísticas Avanzadas (Admin)**
- [ ] **Gráficos y métricas**
  - [ ] Gráfico de ventas
  - [ ] Gráfico de métodos de pago
  - [ ] Productos más vendidos
  - [ ] Tasa de cancelación

### ✅ **Filtros por Evento**
- [ ] **Estadísticas por evento**
  - [ ] Cambiar evento activo
  - [ ] Estadísticas se actualizan
  - [ ] Datos correctos por evento

---

## 💰 **6. GESTIÓN DE CAJA**

### ✅ **Apertura de Caja**
- [ ] **Formulario de apertura**
  - [ ] Monto inicial obligatorio
  - [ ] Validación de monto positivo
  - [ ] Confirmación de apertura

### ✅ **Cierre de Caja**
- [ ] **Formulario de cierre**
  - [ ] Monto final obligatorio
  - [ ] Cálculo de diferencia
  - [ ] Observaciones opcionales
  - [ ] Confirmación de cierre

### ✅ **Historial de Caja**
- [ ] **Lista de operaciones**
  - [ ] Aperturas y cierres
  - [ ] Montos y fechas
  - [ ] Usuario responsable

---

## 🔧 **7. CONFIGURACIÓN Y ADMIN**

### ✅ **Panel de Administración**
- [ ] **Acceso restringido**
  - [ ] Solo usuarios admin
  - [ ] Menú completo visible
  - [ ] Funcionalidades disponibles

### ✅ **Gestión de Usuarios**
- [ ] **Lista de usuarios**
  - [ ] Todos los usuarios visibles
  - [ ] Información completa
  - [ ] Estado activo/inactivo

### ✅ **Configuración General**
- [ ] **Ajustes del sistema**
  - [ ] Configuración de eventos
  - [ ] Configuración de productos
  - [ ] Configuración de usuarios

---

## 📱 **8. RESPONSIVIDAD Y UX**

### ✅ **Dispositivos Móviles**
- [ ] **Teléfono (320px-768px)**
  - [ ] Interfaz adaptada
  - [ ] Botones táctiles
  - [ ] Navegación optimizada

- [ ] **Tablet (768px-1024px)**
  - [ ] Layout intermedio
  - [ ] Elementos bien distribuidos
  - [ ] Funcionalidad completa

### ✅ **Desktop (1024px+)**
- [ ] **Pantalla completa**
  - [ ] Layout completo
  - [ ] Todas las funcionalidades
  - [ ] Navegación eficiente

---

## ⚡ **9. RENDIMIENTO**

### ✅ **Tiempos de Respuesta**
- [ ] **Carga inicial**
  - [ ] < 3 segundos
  - [ ] Indicador de carga
  - [ ] Sin errores

- [ ] **Operaciones CRUD**
  - [ ] Crear comanda < 2 segundos
  - [ ] Listar productos < 1 segundo
  - [ ] Actualizar estado < 1 segundo

### ✅ **Estados de Carga**
- [ ] **Indicadores visuales**
  - [ ] Spinners en botones
  - [ ] Estados deshabilitados
  - [ ] Mensajes de progreso

---

## 🔒 **10. SEGURIDAD**

### ✅ **Control de Acceso**
- [ ] **Rutas protegidas**
  - [ ] Admin solo para admins
  - [ ] Caja solo para cajeros
  - [ ] Ventas para todos los roles

### ✅ **Validación de Datos**
- [ ] **Frontend**
  - [ ] Validación en tiempo real
  - [ ] Mensajes de error claros
  - [ ] Prevención de envío inválido

- [ ] **Backend**
  - [ ] Validación de entrada
  - [ ] Sanitización de datos
  - [ ] Respuestas seguras

---

## 🐛 **11. MANEJO DE ERRORES**

### ✅ **Errores de Red**
- [ ] **Sin conexión**
  - [ ] Mensaje claro
  - [ ] Opción de reintentar
  - [ ] Funcionalidad offline si está disponible

### ✅ **Errores del Servidor**
- [ ] **500 Internal Server Error**
  - [ ] Mensaje amigable
  - [ ] Opción de reportar
  - [ ] No crash de la aplicación

### ✅ **Errores de Validación**
- [ ] **400 Bad Request**
  - [ ] Mensaje específico
  - [ ] Campo problemático marcado
  - [ ] Sugerencia de corrección

---

## 📝 **12. DOCUMENTACIÓN**

### ✅ **Ayuda y Guías**
- [ ] **Tooltips**
  - [ ] Información contextual
  - [ ] Explicación de funcionalidades

- [ ] **Mensajes de confirmación**
  - [ ] Acciones importantes confirmadas
  - [ ] Información clara sobre consecuencias

---

## ✅ **RESULTADO FINAL**

### **Métricas de QA**
- **Tests ejecutados:** [X] de [Y]
- **Tests pasados:** [X]
- **Tests fallidos:** [X]
- **Tasa de éxito:** [X]%

### **Problemas Encontrados**
1. **Críticos:** [Lista de problemas críticos]
2. **Mayores:** [Lista de problemas mayores]
3. **Menores:** [Lista de problemas menores]

### **Recomendaciones**
- [ ] **Para producción:** [Recomendaciones]
- [ ] **Mejoras futuras:** [Sugerencias]
- [ ] **Optimizaciones:** [Optimizaciones sugeridas]

---

## 📋 **FIRMAS**

- **Tester:** _________________ Fecha: _______________
- **Revisor:** _________________ Fecha: _______________
- **Aprobación:** _________________ Fecha: _______________

---

*Checklist generado el: [Fecha]*  
*Versión: 1.0*  
*Sistema: POS "El INSTI" - Staging* 