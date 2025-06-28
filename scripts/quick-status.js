// Cargar variables de entorno desde .env.local
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 ESTADO RÁPIDO DE LA BASE DE DATOS - EL INSTI\n');
console.log('=' .repeat(60));

// Verificar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 CONFIGURACIÓN ACTUAL:');
console.log('-'.repeat(40));

if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL: Configurada correctamente');
  console.log(`   URL: ${supabaseUrl}`);
} else {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL: No configurada o es placeholder');
}

if (supabaseAnonKey && !supabaseAnonKey.includes('placeholder')) {
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: Configurada correctamente');
} else {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY: No configurada o es placeholder');
}

if (supabaseServiceKey) {
  console.log('✅ SUPABASE_SERVICE_ROLE_KEY: Configurada correctamente');
} else {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY: No configurada');
}

// Intentar conexión si las variables están configuradas
if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder') && !supabaseAnonKey.includes('placeholder')) {
  console.log('\n📡 VERIFICANDO CONEXIÓN...');
  console.log('-'.repeat(40));
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  (async () => {
    try {
      // Verificar tablas principales
      const tables = ['eventos', 'productos', 'comandas', 'configuracion_sistema'];
      const results = {};
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          if (error) {
            if (error.message.includes('relation') && error.message.includes('does not exist')) {
              results[table] = { status: '❌ NO EXISTE', error: 'Tabla no encontrada' };
            } else if (error.message.includes('row-level security policy')) {
              results[table] = { status: '⚠️ RLS BLOQUEA', error: 'Política RLS activa' };
            } else {
              results[table] = { status: '❌ ERROR', error: error.message };
            }
          } else {
            results[table] = { status: '✅ EXISTE', count: data?.length || 0 };
          }
        } catch (err) {
          results[table] = { status: '❌ ERROR', error: err.message };
        }
      }
      
      // Mostrar resultados
      console.log('📋 ESTADO DE TABLAS:');
      Object.entries(results).forEach(([table, result]) => {
        if (result.status === '✅ EXISTE') {
          console.log(`${result.status} ${table} (${result.count} registros)`);
        } else {
          console.log(`${result.status} ${table} - ${result.error}`);
        }
      });
      
      // Resumen
      const existingTables = Object.values(results).filter(r => r.status === '✅ EXISTE').length;
      const missingTables = Object.values(results).filter(r => r.status === '❌ NO EXISTE').length;
      
      console.log('\n📊 RESUMEN:');
      console.log(`   - Tablas existentes: ${existingTables}/${tables.length}`);
      console.log(`   - Tablas faltantes: ${missingTables}`);
      
      if (missingTables > 0) {
        console.log('\n🚨 ACCIONES REQUERIDAS:');
        console.log('1. Ejecuta el script SQL en Supabase SQL Editor');
        console.log('2. Verifica las políticas RLS');
        console.log('3. Ejecuta este script nuevamente');
      } else {
        console.log('\n✅ BASE DE DATOS CONFIGURADA CORRECTAMENTE');
        console.log('El sistema debería funcionar correctamente');
      }
      
    } catch (err) {
      console.log(`❌ Error de conexión: ${err.message}`);
    }
  })();
  
} else {
  console.log('\n❌ NO SE PUEDE CONECTAR A SUPABASE');
  console.log('   Configura las variables de entorno correctamente');
  console.log('\n📋 PARA CONFIGURAR:');
  console.log('1. Ve a Supabase Dashboard > Settings > API');
  console.log('2. Copia la URL del proyecto');
  console.log('3. Copia la anon key');
  console.log('4. Copia la service_role key');
  console.log('5. Actualiza .env.local con los valores reales');
}

console.log('\n🎯 PRÓXIMOS PASOS:');
console.log('-'.repeat(40));
console.log('• Si las variables están configuradas: Ejecuta el script SQL');
console.log('• Si no están configuradas: Configura .env.local primero');
console.log('• Para verificar después: node scripts/check-database-status.js');
console.log('• Para iniciar el servidor: npm run dev'); 