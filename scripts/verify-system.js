const { createClient } = require('@supabase/supabase-js');

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

async function verifySystem() {
  console.log('🔍 Verificando estado del sistema El INSTI...\n');
  
  const checks = [
    { name: 'Tabla eventos', table: 'eventos' },
    { name: 'Tabla productos', table: 'productos' },
    { name: 'Tabla comandas', table: 'comandas' },
    { name: 'Tabla comanda_items', table: 'comanda_items' },
    { name: 'Tabla configuracion_sistema', table: 'configuracion_sistema' }
  ];
  
  let allChecksPassed = true;
  
  for (const check of checks) {
    try {
      const { data, error } = await supabase
        .from(check.table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${check.name}: ${error.message}`);
        allChecksPassed = false;
      } else {
        console.log(`✅ ${check.name}: OK`);
      }
    } catch (err) {
      console.log(`❌ ${check.name}: Error de conexión`);
      allChecksPassed = false;
    }
  }
  
  console.log('\n📊 Verificando datos...');
  
  // Verificar datos en eventos
  try {
    const { data: eventos, error } = await supabase
      .from('eventos')
      .select('*');
    
    if (error) {
      console.log('❌ Error verificando eventos:', error.message);
    } else {
      console.log(`✅ Eventos: ${eventos?.length || 0} encontrados`);
      if (eventos && eventos.length > 0) {
        const activos = eventos.filter(e => e.activo).length;
        console.log(`   - Activos: ${activos}`);
        console.log(`   - Inactivos: ${eventos.length - activos}`);
      }
    }
  } catch (err) {
    console.log('❌ Error verificando eventos');
  }
  
  // Verificar datos en productos
  try {
    const { data: productos, error } = await supabase
      .from('productos')
      .select('*');
    
    if (error) {
      console.log('❌ Error verificando productos:', error.message);
    } else {
      console.log(`✅ Productos: ${productos?.length || 0} encontrados`);
      if (productos && productos.length > 0) {
        const activos = productos.filter(p => p.activo).length;
        console.log(`   - Activos: ${activos}`);
        console.log(`   - Inactivos: ${productos.length - activos}`);
      }
    }
  } catch (err) {
    console.log('❌ Error verificando productos');
  }
  
  // Verificar configuración
  try {
    const { data: config, error } = await supabase
      .from('configuracion_sistema')
      .select('*')
      .eq('clave', 'evento_activo_id');
    
    if (error) {
      console.log('❌ Error verificando configuración:', error.message);
    } else {
      console.log(`✅ Configuración: ${config?.length || 0} registros`);
      if (config && config.length > 0) {
        console.log(`   - Evento activo ID: ${config[0].valor}`);
      }
    }
  } catch (err) {
    console.log('❌ Error verificando configuración');
  }
  
  console.log('\n🎯 RESULTADO FINAL:');
  if (allChecksPassed) {
    console.log('✅ Sistema verificado correctamente');
    console.log('🚀 El sistema está listo para usar');
  } else {
    console.log('❌ Sistema con problemas detectados');
    console.log('🔧 Ejecuta las correcciones en CORRECCIONES-URGENTES.md');
  }
}

verifySystem(); 