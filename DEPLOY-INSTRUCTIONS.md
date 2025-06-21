# 🚀 Instrucciones de Deploy - El INSTI POS

## 📋 Información del Servidor Ferozo
- **Sitio:** elinsti.hanemann.ar
- **Base de datos:** c2840781_elinsti
- **Usuario MySQL:** c2840781_elinsti
- **Contraseña:** wuro31NOne
- **Motor:** c2840781

## 🗂️ Estructura de Archivos para Subir

\`\`\`
public_html/
├── api/                        (Backend PHP)
│   ├── config/
│   │   └── database.php
│   ├── cors.php
│   ├── test-connection.php
│   ├── auth/
│   │   └── login.php
│   ├── productos/
│   │   └── list.php
│   └── comandas/
│       ├── create.php
│       ├── list.php
│       └── update-status.php
├── _next/                      (Frontend compilado)
├── images/
│   └── insti-logo.png
├── index.html
└── 404.html
\`\`\`

## 🔧 Pasos de Deploy

### 1. Compilar el Frontend
\`\`\`bash
npm run build
\`\`\`

### 2. Subir Archivos al Servidor
- Subir contenido de la carpeta `out/` a `public_html/`
- Subir carpeta `api/` completa a `public_html/api/`

### 3. Configurar Base de Datos
- Acceder al panel de MySQL de Ferozo
- Ejecutar el script `scripts/ferozo-database-setup.sql`

### 4. Verificar Funcionamiento
- Visitar: https://elinsti.hanemann.ar/api/test-connection.php
- Debe mostrar: `{"success": true, "message": "Conexión exitosa a MySQL Ferozo"}`

### 5. Probar la Aplicación
- Visitar: https://elinsti.hanemann.ar
- Login con: admin@elinsti.com / 123456

## 🔐 Usuarios de Prueba
- **Admin:** admin@elinsti.com / 123456
- **Caja:** caja@elinsti.com / 123456  
- **Venta:** venta1@elinsti.com / 123456

## 📱 Funcionalidades
- ✅ Sistema de login con roles
- ✅ Gestión de productos
- ✅ Creación de comandas
- ✅ Procesamiento de pagos
- ✅ Estadísticas en tiempo real
- ✅ Diseño responsive
- ✅ Temática musical bohemia

## 🛠️ Troubleshooting
- Si hay errores de conexión, verificar credenciales en `api/config/database.php`
- Si hay errores CORS, verificar que `api/cors.php` esté incluido en todos los endpoints
- Para logs de errores, revisar el panel de Ferozo

## 📞 Soporte
Sistema desarrollado para El INSTI - Espacio de música y eventos
\`\`\`

```htaccess file="api/.htaccess"
# Configuración para API PHP en Ferozo
RewriteEngine On

# Permitir CORS para todas las rutas de la API
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"

# Manejar preflight requests
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

# Configuración de PHP
php_value upload_max_filesize 10M
php_value post_max_size 10M
php_value memory_limit 128M
php_value max_execution_time 300

# Seguridad
<Files "*.php">
    Order allow,deny
    Allow from all
</Files>

# Prevenir acceso directo a archivos de configuración
<Files "database.php">
    Order deny,allow
    Deny from all
</Files>
