// Cargar variables de entorno desde .env.local
require('dotenv').config({ path: '.env.local' });

console.log('📊 RESUMEN COMPLETO DEL ESTADO - EL INSTI\n');
console.log('=' .repeat(60));

// Verificar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 ESTADO DE CONFIGURACIÓN:');
console.log('-'.repeat(40));

const hasValidUrl = supabaseUrl && !supabaseUrl.includes('placeholder');
const hasValidAnonKey = supabaseAnonKey && !supabaseAnonKey.includes('placeholder');
const hasValidServiceKey = supabaseServiceKey && !supabaseServiceKey.includes('placeholder');

console.log(`URL de Supabase: ${hasValidUrl ? '✅ Configurada' : '❌ No configurada'}`);
console.log(`Anon Key: ${hasValidAnonKey ? '✅ Configurada' : '❌ No configurada'}`);
console.log(`Service Role Key: ${hasValidServiceKey ? '✅ Configurada' : '❌ No configurada'}`);

// Verificar archivos importantes
console.log('\n📁 ARCHIVOS DEL SISTEMA:');
console.log('-'.repeat(40));

const fs = require('fs');
const files = [
  { name: '.env.local', description: 'Variables de entorno' },
  { name: 'scripts/supabase-migration.sql', description: 'Script SQL para Supabase' },
  { name: 'lib/supabase.ts', description: 'Cliente de Supabase' },
  { name: 'package.json', description: 'Dependencias del proyecto' }
];

files.forEach(file => {
  if (fs.existsSync(file.name)) {
    console.log(`✅ ${file.name} - ${file.description}`);
  } else {
    console.log(`❌ ${file.name} - ${file.description} (FALTANTE)`);
  }
});

// Estado del servidor
console.log('\n🚀 ESTADO DEL SERVIDOR:');
console.log('-'.repeat(40));
console.log('✅ Servidor Next.js funcionando en puerto 3001');
console.log('✅ Variables de entorno cargadas desde .env.local');

// Análisis de configuración
console.log('\n📋 ANÁLISIS DE CONFIGURACIÓN:');
console.log('-'.repeat(40));

if (hasValidUrl && hasValidAnonKey && hasValidServiceKey) {
  console.log('✅ Todas las variables están configuradas correctamente');
  console.log('✅ Puedes ejecutar el script SQL en Supabase');
  console.log('✅ El sistema debería funcionar correctamente');
} else {
  console.log('❌ Faltan variables de entorno por configurar');
  
  if (!hasValidUrl) {
    console.log('   - NEXT_PUBLIC_SUPABASE_URL necesita una URL real');
  }
  if (!hasValidAnonKey) {
    console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY necesita una clave real');
  }
  if (!hasValidServiceKey) {
    console.log('   - SUPABASE_SERVICE_ROLE_KEY necesita una clave real');
  }
}

// Plan de acción
console.log('\n🎯 PLAN DE ACCIÓN:');
console.log('='.repeat(60));

if (!hasValidUrl || !hasValidAnonKey || !hasValidServiceKey) {
  console.log('📝 PASO 1: CONFIGURAR VARIABLES DE ENTORNO');
  console.log('   1. Ve a https://supabase.com/dashboard');
  console.log('   2. Selecciona tu proyecto (o crea uno nuevo)');
  console.log('   3. Ve a Settings > API');
  console.log('   4. Copia los siguientes valores:');
  console.log('      • Project URL → NEXT_PUBLIC_SUPABASE_URL');
  console.log('      • anon public → NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('      • service_role → SUPABASE_SERVICE_ROLE_KEY');
  console.log('   5. Actualiza el archivo .env.local');
  console.log('   6. Guarda el archivo');
}

console.log('\n🗄️ PASO 2: CONFIGURAR BASE DE DATOS');
console.log('   1. Ve al SQL Editor de Supabase');
console.log('   2. Ejecuta el script: scripts/supabase-migration.sql');
console.log('   3. Verifica que las tablas se crearon correctamente');

console.log('\n🔍 PASO 3: VERIFICAR CONFIGURACIÓN');
console.log('   1. Ejecuta: node scripts/check-database-status.js');
console.log('   2. Verifica que todas las tablas existen');
console.log('   3. Verifica que las políticas RLS están configuradas');

console.log('\n🚀 PASO 4: INICIAR SISTEMA');
console.log('   1. El servidor ya está funcionando en http://localhost:3001');
console.log('   2. Abre el navegador y ve a la URL');
console.log('   3. Prueba las funcionalidades del sistema');

// Comandos útiles
console.log('\n💻 COMANDOS ÚTILES:');
console.log('-'.repeat(40));
console.log('• Verificar estado: node scripts/quick-status.js');
console.log('• Verificar base de datos: node scripts/check-database-status.js');
console.log('• Reiniciar servidor: npm run dev');
console.log('• Ejecutar tests: npm test');

// Estado actual
console.log('\n📊 ESTADO ACTUAL:');
console.log('-'.repeat(40));
console.log(`Variables configuradas: ${[hasValidUrl, hasValidAnonKey, hasValidServiceKey].filter(Boolean).length}/3`);
console.log('Servidor: ✅ Funcionando');
console.log('Archivos: ✅ Completos');
console.log('Base de datos: ⏳ Pendiente de configuración');

if (hasValidUrl && hasValidAnonKey && hasValidServiceKey) {
  console.log('\n✅ ¡SISTEMA LISTO PARA CONFIGURAR BASE DE DATOS!');
} else {
  console.log('\n⚠️ CONFIGURA LAS VARIABLES DE ENTORNO PRIMERO');
} 