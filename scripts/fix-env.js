const fs = require('fs');
const path = require('path');

// Configuración correcta para producción
const envContent = `# ========================================
# CONFIGURACIÓN PRODUCCIÓN - EL INSTI POS
# ========================================

# ENTORNO
NODE_ENV=production
NEXT_PUBLIC_ENV=production

# ========================================
# SUPABASE - PRODUCCIÓN
# ========================================
NEXT_PUBLIC_SUPABASE_URL=https://joebhvyfcftobrngcqor.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_SseWwWd7DpxeVfQVTCbfTg_KEzkN-qv

# ========================================
# CONFIGURACIÓN DE SEGURIDAD
# ========================================
JWT_SECRET=production_jwt_secret_key_2025_el_insti
`;

// Escribir el archivo .env.local
const envPath = path.join(__dirname, '..', '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Archivo .env.local actualizado correctamente');
  console.log('📋 Contenido:');
  console.log(envContent);
  console.log('\n🔄 Reinicia tu servidor de desarrollo ahora');
} catch (error) {
  console.error('❌ Error escribiendo archivo:', error.message);
} 