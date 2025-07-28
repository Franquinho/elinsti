const { execSync } = require('child_process');

console.log('🔧 Configurando variables de entorno en Vercel...');

const envVars = {
  'NEXT_PUBLIC_SUPABASE_URL': 'https://joebhvyfcftobrngcqor.supabase.co',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'sb_publishable_SseWwWd7DpxeVfQVTCbfTg_KEzkN-qv',
  'SUPABASE_SERVICE_ROLE_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZWJodnlmY2Z0b2JybmdjcW9yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQzNjkzMywiZXhwIjoyMDY2MDEyOTMzfQ.LtdelW0YtBCnXewjgJSEbTmXQ-WqIgeUYDNSU7X4BsM',
  'JWT_SECRET': 'production_jwt_secret_key_2025_el_insti'
};

try {
  // Eliminar variables existentes
  console.log('🗑️  Eliminando variables existentes...');
  Object.keys(envVars).forEach(key => {
    try {
      execSync(`vercel env rm ${key} --yes`, { stdio: 'pipe' });
      console.log(`✅ Eliminada: ${key}`);
    } catch (error) {
      console.log(`⚠️  No se pudo eliminar ${key}: ${error.message}`);
    }
  });

  // Agregar variables nuevas
  console.log('➕ Agregando variables nuevas...');
  Object.entries(envVars).forEach(([key, value]) => {
    try {
      execSync(`echo "${value}" | vercel env add ${key} production`, { stdio: 'pipe' });
      console.log(`✅ Agregada: ${key}`);
    } catch (error) {
      console.log(`❌ Error agregando ${key}: ${error.message}`);
    }
  });

  console.log('🚀 Haciendo deploy...');
  execSync('vercel --prod', { stdio: 'inherit' });

  console.log('✅ Configuración completada!');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 