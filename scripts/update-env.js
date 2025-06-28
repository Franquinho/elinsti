const fs = require('fs');

console.log('🔧 ACTUALIZADOR DE VARIABLES DE ENTORNO - EL INSTI\n');
console.log('=' .repeat(60));

// Contenido del archivo .env.local con instrucciones
const envContent = `# Variables de entorno para El INSTI - Sistema POS
# Reemplaza los valores placeholder con tus credenciales reales de Supabase

# URL de tu proyecto Supabase (ej: https://abc123.supabase.co)
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co

# Clave anónima pública de Supabase (anon key)
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key

# Clave de servicio privada de Supabase (service_role key)
# Esta clave es necesaria para operaciones administrativas
SUPABASE_SERVICE_ROLE_KEY=placeholder-service-key

# INSTRUCCIONES PARA CONFIGURAR:
# 1. Ve a tu proyecto Supabase Dashboard
# 2. Navega a Settings > API
# 3. Copia la "Project URL" y reemplaza NEXT_PUBLIC_SUPABASE_URL
# 4. Copia la "anon public" key y reemplaza NEXT_PUBLIC_SUPABASE_ANON_KEY
# 5. Copia la "service_role" key y reemplaza SUPABASE_SERVICE_ROLE_KEY
# 6. Guarda el archivo
# 7. Ejecuta: node scripts/check-database-status.js
`;

try {
  // Escribir el archivo .env.local
  fs.writeFileSync('.env.local', envContent);
  
  console.log('✅ Archivo .env.local actualizado con plantilla');
  console.log('\n📋 PRÓXIMOS PASOS:');
  console.log('1. Abre el archivo .env.local en tu editor');
  console.log('2. Reemplaza los valores placeholder con tus credenciales reales');
  console.log('3. Guarda el archivo');
  console.log('4. Ejecuta: node scripts/check-database-status.js');
  console.log('5. Ejecuta el script SQL en Supabase SQL Editor');
  console.log('6. Inicia el servidor: npm run dev');
  
  console.log('\n🔍 PARA OBTENER TUS CREDENCIALES:');
  console.log('• Ve a https://supabase.com/dashboard');
  console.log('• Selecciona tu proyecto (o crea uno nuevo)');
  console.log('• Ve a Settings > API');
  console.log('• Copia los valores que necesitas');
  
  console.log('\n⚠️ IMPORTANTE:');
  console.log('• Nunca compartas tu SUPABASE_SERVICE_ROLE_KEY');
  console.log('• La NEXT_PUBLIC_SUPABASE_ANON_KEY es segura para el cliente');
  console.log('• Asegúrate de que .env.local esté en .gitignore');
  
} catch (error) {
  console.error('❌ Error actualizando .env.local:', error.message);
} 