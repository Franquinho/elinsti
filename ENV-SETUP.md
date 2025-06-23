# Configuración de Variables de Entorno

## 🔧 Configuración Requerida

Para que el proyecto funcione correctamente, necesitas configurar las variables de entorno de Supabase.

### Paso 1: Crear archivo .env.local

En la raíz del proyecto, crea un archivo llamado `.env.local` con el siguiente contenido:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_de_supabase_aqui
```

### Paso 2: Obtener credenciales de Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto
2. En el dashboard de tu proyecto, ve a **Settings** → **API**
3. Copia los siguientes valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### Paso 3: Configurar la base de datos

Sigue las instrucciones en `SUPABASE-SETUP.md` para crear las tablas y datos de prueba.

### Ejemplo de archivo .env.local

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNjU0NzIwMCwiZXhwIjoxOTUyMTIzMjAwfQ.example
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM2NTQ3MjAwLCJleHAiOjE5NTIxMjMyMDB9.example
```

## 🚨 Solución de Problemas

### Error: "supabaseUrl is required"
- Verifica que el archivo `.env.local` existe en la raíz del proyecto
- Asegúrate de que las variables están escritas correctamente
- Reinicia el servidor de desarrollo después de crear el archivo

### Error: "Invalid API key"
- Verifica que las claves de Supabase son correctas
- Asegúrate de copiar las claves completas sin espacios adicionales

### Error: "Database connection failed"
- Verifica que tu proyecto de Supabase está activo
- Revisa que las tablas están creadas según `SUPABASE-SETUP.md`

## 📝 Notas Importantes

- El archivo `.env.local` está en `.gitignore` y no se subirá al repositorio
- Las variables que empiezan con `NEXT_PUBLIC_` son visibles en el cliente
- `SUPABASE_SERVICE_ROLE_KEY` solo debe usarse en el servidor
- Reinicia el servidor después de cambiar las variables de entorno 