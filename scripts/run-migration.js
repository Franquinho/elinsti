const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🔄 Iniciando migración de base de datos...');
    
    // Leer el script de migración
    const migrationPath = path.join(__dirname, 'supabase-migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Ejecutando script de migración...');
    
    // Ejecutar el script de migración
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Error ejecutando migración:', error);
      process.exit(1);
    }
    
    console.log('✅ Migración completada exitosamente');
    
    // Verificar que las tablas existen
    console.log('🔍 Verificando estructura de base de datos...');
    
    const tables = ['eventos', 'productos', 'comandas', 'usuarios', 'configuracion_sistema'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ Error verificando tabla ${table}:`, error);
      } else {
        console.log(`✅ Tabla ${table} verificada correctamente`);
      }
    }
    
    console.log('🎉 Verificación completada');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

runMigration(); 