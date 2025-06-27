// Cargar variables de entorno desde .env.local
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 VERIFICACIÓN DE CONFIGURACIÓN - EL INSTI\n');
console.log('=' .repeat(60));

// 1. Verificar variables de entorno
console.log('🔧 VARIABLES DE ENTORNO:');
console.log('-'.repeat(40));
console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Configurada' : '❌ No configurada'}`);
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Configurada' : '❌ No configurada'}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Configurada' : '❌ No configurada'}`);

if (supabaseUrl) {
  console.log(`URL de Supabase: ${supabaseUrl}`);
}

// 2. Verificar si son valores placeholder
console.log('\n⚠️ VERIFICACIÓN DE VALORES:');
console.log('-'.repeat(40));

if (supabaseUrl && supabaseUrl.includes('placeholder')) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL contiene valor placeholder');
  console.log('   Necesitas configurar la URL real de tu proyecto Supabase');
}

if (supabaseAnonKey && supabaseAnonKey.includes('placeholder')) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY contiene valor placeholder');
  console.log('   Necesitas configurar la clave anónima real de tu proyecto Supabase');
}

if (!supabaseServiceKey) {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY no está configurada');
  console.log('   Esta clave es necesaria para operaciones administrativas');
}

// 3. Intentar conexión si las variables están configuradas correctamente
if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder') && !supabaseAnonKey.includes('placeholder')) {
  console.log('\n📡 INTENTANDO CONEXIÓN A SUPABASE:');
  console.log('-'.repeat(40));
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Verificar conexión básica
  (async () => {
    try {
      // Intentar una consulta simple
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.log('⚠️ Conexión exitosa pero tabla "eventos" no existe');
          console.log('   Necesitas ejecutar el script SQL para crear las tablas');
        } else if (error.message.includes('row-level security policy')) {
          console.log('⚠️ Conexión exitosa pero RLS bloquea el acceso');
          console.log('   Necesitas configurar políticas RLS o usar SERVICE_ROLE_KEY');
        } else {
          console.log(`❌ Error de conexión: ${error.message}`);
        }
      } else {
        console.log('✅ Conexión exitosa a Supabase');
        console.log(`📊 Tabla eventos: ${data?.length || 0} registros`);
      }
    } catch (err) {
      console.log(`❌ Error de conexión: ${err.message}`);
    }
  })();
} else {
  console.log('\n❌ NO SE PUEDE CONECTAR A SUPABASE');
  console.log('   Configura las variables de entorno correctamente');
}

// 4. Instrucciones para configurar
console.log('\n📋 INSTRUCCIONES PARA CONFIGURAR:');
console.log('='.repeat(60));

console.log('1. Ve a tu proyecto Supabase Dashboard');
console.log('2. Copia la URL del proyecto (Settings > API)');
console.log('3. Copia la anon key (Settings > API)');
console.log('4. Copia la service_role key (Settings > API)');
console.log('5. Actualiza el archivo .env.local con los valores reales:');
console.log('');
console.log('   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co');
console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-real');
console.log('   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-real');
console.log('');
console.log('6. Ejecuta el script SQL en Supabase SQL Editor');
console.log('7. Ejecuta este script nuevamente para verificar');

// 5. Verificar archivos de configuración
console.log('\n📁 ARCHIVOS DE CONFIGURACIÓN:');
console.log('-'.repeat(40));

const fs = require('fs');
const path = require('path');

const files = [
  '.env.local',
  'scripts/supabase-migration.sql',
  'lib/supabase.ts'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} existe`);
  } else {
    console.log(`❌ ${file} no existe`);
  }
});

console.log('\n🎯 PRÓXIMOS PASOS:');
console.log('-'.repeat(40));
console.log('1. Configura las variables de entorno reales');
console.log('2. Ejecuta el script SQL en Supabase');
console.log('3. Ejecuta: node scripts/check-database-status.js');
console.log('4. Inicia el servidor: npm run dev'); 