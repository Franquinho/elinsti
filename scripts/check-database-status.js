// Cargar variables de entorno desde .env.local
require('dotenv').config({ path: '.env.local' });

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

async function checkDatabaseStatus() {
  console.log('🔍 ESTADO ACTUAL DE LA BASE DE DATOS - EL INSTI\n');
  console.log('=' .repeat(60));
  
  try {
    // 1. Verificar conexión
    console.log('📡 Verificando conexión a Supabase...');
    console.log(`URL: ${supabaseUrl}`);
    console.log(`Service Key: ${supabaseServiceKey ? '✅ Configurada' : '❌ No configurada'}`);
    
    // 2. Verificar tablas existentes
    console.log('\n📋 TABLAS EN LA BASE DE DATOS:');
    console.log('-'.repeat(40));
    
    const tables = [
      { name: 'eventos', description: 'Eventos del sistema' },
      { name: 'productos', description: 'Productos disponibles' },
      { name: 'comandas', description: 'Comandas de ventas' },
      { name: 'comanda_items', description: 'Items de comandas' },
      { name: 'configuracion_sistema', description: 'Configuración del sistema' },
      { name: 'caja', description: 'Control de caja' }
    ];
    
    const tableStatus = [];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table.name)
          .select('*')
          .limit(1);
        
        if (error) {
          if (error.message.includes('relation') && error.message.includes('does not exist')) {
            tableStatus.push({ name: table.name, status: '❌ NO EXISTE', description: table.description });
          } else {
            tableStatus.push({ name: table.name, status: '⚠️ ERROR', description: table.description, error: error.message });
          }
        } else {
          tableStatus.push({ name: table.name, status: '✅ EXISTE', description: table.description });
        }
      } catch (err) {
        tableStatus.push({ name: table.name, status: '❌ ERROR', description: table.description, error: err.message });
      }
    }
    
    // Mostrar estado de tablas
    tableStatus.forEach(table => {
      console.log(`${table.status} ${table.name} - ${table.description}`);
      if (table.error) {
        console.log(`   Error: ${table.error}`);
      }
    });
    
    // 3. Verificar datos en tablas existentes
    console.log('\n📊 DATOS EN TABLAS EXISTENTES:');
    console.log('-'.repeat(40));
    
    for (const table of tableStatus) {
      if (table.status === '✅ EXISTE') {
        try {
          const { data, error } = await supabase
            .from(table.name)
            .select('*');
          
          if (error) {
            console.log(`❌ Error obteniendo datos de ${table.name}: ${error.message}`);
          } else {
            console.log(`📦 ${table.name}: ${data?.length || 0} registros`);
            
            // Mostrar algunos datos de ejemplo
            if (data && data.length > 0) {
              const sample = data.slice(0, 3);
              sample.forEach((item, index) => {
                if (index === 0) {
                  console.log(`   Ejemplo: ${JSON.stringify(item, null, 2).substring(0, 100)}...`);
                }
              });
            }
          }
        } catch (err) {
          console.log(`❌ Error verificando datos de ${table.name}: ${err.message}`);
        }
      }
    }
    
    // 4. Verificar estructura de tablas específicas
    console.log('\n🔧 ESTRUCTURA DE TABLAS CRÍTICAS:');
    console.log('-'.repeat(40));
    
    // Verificar tabla eventos
    try {
      const { data: eventos, error } = await supabase
        .from('eventos')
        .select('*')
        .limit(1);
      
      if (!error && eventos && eventos.length > 0) {
        const evento = eventos[0];
        console.log('✅ Tabla eventos:');
        console.log(`   - Columnas: ${Object.keys(evento).join(', ')}`);
        console.log(`   - Tiene columna 'activo': ${'activo' in evento ? '✅' : '❌'}`);
        console.log(`   - Tiene columna 'nombre': ${'nombre' in evento ? '✅' : '❌'}`);
      }
    } catch (err) {
      console.log('❌ No se pudo verificar estructura de eventos');
    }
    
    // Verificar tabla productos
    try {
      const { data: productos, error } = await supabase
        .from('productos')
        .select('*')
        .limit(1);
      
      if (!error && productos && productos.length > 0) {
        const producto = productos[0];
        console.log('✅ Tabla productos:');
        console.log(`   - Columnas: ${Object.keys(producto).join(', ')}`);
        console.log(`   - Tiene columna 'activo': ${'activo' in producto ? '✅' : '❌'}`);
        console.log(`   - Tiene columna 'nombre': ${'nombre' in producto ? '✅' : '❌'}`);
      }
    } catch (err) {
      console.log('❌ No se pudo verificar estructura de productos');
    }
    
    // 5. Verificar configuración del sistema
    console.log('\n⚙️ CONFIGURACIÓN DEL SISTEMA:');
    console.log('-'.repeat(40));
    
    try {
      const { data: config, error } = await supabase
        .from('configuracion_sistema')
        .select('*');
      
      if (error) {
        console.log('❌ Error obteniendo configuración:', error.message);
      } else if (config && config.length > 0) {
        console.log('✅ Configuración encontrada:');
        config.forEach(item => {
          console.log(`   - ${item.clave}: ${item.valor} (${item.descripcion})`);
        });
      } else {
        console.log('⚠️ No hay configuración del sistema');
      }
    } catch (err) {
      console.log('❌ Error verificando configuración:', err.message);
    }
    
    // 6. Verificar políticas RLS
    console.log('\n🔐 POLÍTICAS RLS:');
    console.log('-'.repeat(40));
    
    const rlsTables = ['eventos', 'productos', 'comandas', 'comanda_items', 'configuracion_sistema'];
    
    for (const table of rlsTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error && error.message.includes('new row violates row-level security policy')) {
          console.log(`❌ ${table}: RLS activado sin políticas adecuadas`);
        } else if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
          console.log(`⚠️ ${table}: Tabla no existe`);
        } else {
          console.log(`✅ ${table}: Acceso permitido`);
        }
      } catch (err) {
        console.log(`❌ ${table}: Error verificando RLS`);
      }
    }
    
    // 7. Resumen y recomendaciones
    console.log('\n📋 RESUMEN Y RECOMENDACIONES:');
    console.log('='.repeat(60));
    
    const missingTables = tableStatus.filter(t => t.status === '❌ NO EXISTE');
    const existingTables = tableStatus.filter(t => t.status === '✅ EXISTE');
    
    console.log(`📊 Estado general:`);
    console.log(`   - Tablas existentes: ${existingTables.length}/${tables.length}`);
    console.log(`   - Tablas faltantes: ${missingTables.length}`);
    
    if (missingTables.length > 0) {
      console.log('\n🚨 ACCIONES REQUERIDAS:');
      console.log('1. Ejecutar script SQL en Supabase para crear tablas faltantes');
      console.log('2. Verificar que las políticas RLS estén configuradas');
      console.log('3. Insertar datos de prueba');
    } else {
      console.log('\n✅ BASE DE DATOS CONFIGURADA CORRECTAMENTE');
      console.log('El sistema debería funcionar correctamente');
    }
    
    // 8. Información adicional
    console.log('\n🔍 INFORMACIÓN ADICIONAL:');
    console.log('-'.repeat(40));
    console.log('• Para ver logs detallados: Revisa la consola del navegador (F12)');
    console.log('• Para verificar APIs: Revisa la pestaña Network en DevTools');
    console.log('• Para problemas de RLS: Verifica las políticas en Supabase Dashboard');
    console.log('• Para variables de entorno: Verifica archivo .env.local');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    console.log('\n🔧 SOLUCIÓN:');
    console.log('1. Verifica las variables de entorno');
    console.log('2. Asegúrate de que Supabase esté funcionando');
    console.log('3. Revisa la conexión a internet');
  }
}

// Función para mostrar información de variables de entorno
function showEnvironmentInfo() {
  console.log('🔧 INFORMACIÓN DE VARIABLES DE ENTORNO:');
  console.log('-'.repeat(40));
  console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Configurada' : '❌ No configurada'}`);
  console.log(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Configurada' : '❌ No configurada'}`);
  
  if (supabaseUrl) {
    console.log(`URL de Supabase: ${supabaseUrl}`);
  }
  
  console.log('');
}

// Ejecutar verificación
showEnvironmentInfo();
checkDatabaseStatus(); 