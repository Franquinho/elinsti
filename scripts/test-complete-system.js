// Script completo para probar todo el sistema EL INSTI
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no configuradas');
  process.exit(1);
}

console.log('🔧 SISTEMA EL INSTI - PRUEBA COMPLETA');
console.log('=====================================\n');

const supabase = createClient(supabaseUrl, supabaseKey);

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testDatabaseConnection() {
  log('🧪 1. PRUEBA DE CONEXIÓN A BASE DE DATOS', 'cyan');
  
  try {
    const { data, error } = await supabase
      .from('eventos')
      .select('count')
      .limit(1);
      
    if (error) throw error;
    
    log('✅ Conexión exitosa a Supabase', 'green');
    return true;
  } catch (error) {
    log(`❌ Error de conexión: ${error.message}`, 'red');
    return false;
  }
}

async function testEventosTable() {
  log('\n🧪 2. PRUEBA DE TABLA EVENTOS', 'cyan');
  
  try {
    // Obtener todos los eventos
    const { data: eventos, error } = await supabase
      .from('eventos')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    log(`✅ Eventos encontrados: ${eventos.length}`, 'green');
    
    // Verificar evento activo
    const eventoActivo = eventos.find(e => e.activo);
    if (eventoActivo) {
      log(`✅ Evento activo: ${eventoActivo.nombre}`, 'green');
    } else {
      log('⚠️  No hay evento activo', 'yellow');
    }
    
    // Mostrar estructura de datos
    if (eventos.length > 0) {
      const evento = eventos[0];
      log('📋 Estructura de evento:', 'blue');
      log(`   - ID: ${evento.id}`, 'blue');
      log(`   - Nombre: ${evento.nombre}`, 'blue');
      log(`   - Activo: ${evento.activo}`, 'blue');
      log(`   - Fecha inicio: ${evento.fecha_inicio}`, 'blue');
      log(`   - Fecha fin: ${evento.fecha_fin}`, 'blue');
    }
    
    return true;
  } catch (error) {
    log(`❌ Error en tabla eventos: ${error.message}`, 'red');
    return false;
  }
}

async function testProductosTable() {
  log('\n🧪 3. PRUEBA DE TABLA PRODUCTOS', 'cyan');
  
  try {
    const { data: productos, error } = await supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    log(`✅ Productos encontrados: ${productos.length}`, 'green');
    
    // Verificar productos activos
    const productosActivos = productos.filter(p => p.activo);
    log(`✅ Productos activos: ${productosActivos.length}`, 'green');
    
    // Mostrar estructura de datos
    if (productos.length > 0) {
      const producto = productos[0];
      log('📋 Estructura de producto:', 'blue');
      log(`   - ID: ${producto.id}`, 'blue');
      log(`   - Nombre: ${producto.nombre}`, 'blue');
      log(`   - Precio: ${producto.precio}`, 'blue');
      log(`   - Emoji: ${producto.emoji}`, 'blue');
      log(`   - Activo: ${producto.activo}`, 'blue');
    }
    
    return true;
  } catch (error) {
    log(`❌ Error en tabla productos: ${error.message}`, 'red');
    return false;
  }
}

async function testUsuariosTable() {
  log('\n🧪 4. PRUEBA DE TABLA USUARIOS', 'cyan');
  
  try {
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    log(`✅ Usuarios encontrados: ${usuarios.length}`, 'green');
    
    // Verificar usuarios activos
    const usuariosActivos = usuarios.filter(u => u.activo);
    log(`✅ Usuarios activos: ${usuariosActivos.length}`, 'green');
    
    // Mostrar roles disponibles
    const roles = [...new Set(usuarios.map(u => u.rol))];
    log(`📋 Roles disponibles: ${roles.join(', ')}`, 'blue');
    
    return true;
  } catch (error) {
    log(`❌ Error en tabla usuarios: ${error.message}`, 'red');
    return false;
  }
}

async function testComandasTable() {
  log('\n🧪 5. PRUEBA DE TABLA COMANDAS', 'cyan');
  
  try {
    const { data: comandas, error } = await supabase
      .from('comandas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (error) throw error;
    
    log(`✅ Comandas encontradas: ${comandas.length}`, 'green');
    
    if (comandas.length > 0) {
      const comanda = comandas[0];
      log('📋 Estructura de comanda:', 'blue');
      log(`   - ID: ${comanda.id}`, 'blue');
      log(`   - Estado: ${comanda.estado}`, 'blue');
      log(`   - Total: ${comanda.total}`, 'blue');
      log(`   - Evento ID: ${comanda.evento_id}`, 'blue');
    }
    
    return true;
  } catch (error) {
    log(`❌ Error en tabla comandas: ${error.message}`, 'red');
    return false;
  }
}

async function testEventCRUD() {
  log('\n🧪 6. PRUEBA CRUD DE EVENTOS', 'cyan');
  
  try {
    // Crear evento de prueba
    const nuevoEvento = {
      nombre: `Test Event ${Date.now()}`,
      descripcion: 'Evento de prueba para validación',
      fecha: new Date().toISOString(), // Campo obligatorio en Supabase
      fecha_inicio: new Date().toISOString(),
      fecha_fin: new Date(Date.now() + 86400000).toISOString(),
      precio_entrada: 0,
      activo: false
    };
    
    log('📝 Creando evento de prueba...', 'blue');
    const { data: created, error: createError } = await supabase
      .from('eventos')
      .insert([nuevoEvento])
      .select()
      .single();
      
    if (createError) throw createError;
    
    log(`✅ Evento creado: ${created.nombre} (ID: ${created.id})`, 'green');
    
    // Actualizar evento
    log('📝 Actualizando evento...', 'blue');
    const { data: updated, error: updateError } = await supabase
      .from('eventos')
      .update({ 
        descripcion: 'Evento actualizado correctamente',
        precio_entrada: 50
      })
      .eq('id', created.id)
      .select()
      .single();
      
    if (updateError) throw updateError;
    
    log(`✅ Evento actualizado: precio=${updated.precio_entrada}`, 'green');
    
    // Eliminar evento de prueba
    log('📝 Eliminando evento de prueba...', 'blue');
    const { error: deleteError } = await supabase
      .from('eventos')
      .delete()
      .eq('id', created.id);
      
    if (deleteError) throw deleteError;
    
    log('✅ Evento eliminado correctamente', 'green');
    
    return true;
  } catch (error) {
    log(`❌ Error en CRUD de eventos: ${error.message}`, 'red');
    return false;
  }
}

async function testProductCRUD() {
  log('\n🧪 7. PRUEBA CRUD DE PRODUCTOS', 'cyan');
  
  try {
    // Crear producto de prueba
    const nuevoProducto = {
      nombre: `Test Product ${Date.now()}`,
      precio: 99.99,
      emoji: '🧪',
      activo: true
    };
    
    log('📝 Creando producto de prueba...', 'blue');
    const { data: created, error: createError } = await supabase
      .from('productos')
      .insert([nuevoProducto])
      .select()
      .single();
      
    if (createError) throw createError;
    
    log(`✅ Producto creado: ${created.nombre} (ID: ${created.id})`, 'green');
    
    // Actualizar producto
    log('📝 Actualizando producto...', 'blue');
    const { data: updated, error: updateError } = await supabase
      .from('productos')
      .update({ 
        precio: 149.99,
        activo: false
      })
      .eq('id', created.id)
      .select()
      .single();
      
    if (updateError) throw updateError;
    
    log(`✅ Producto actualizado: precio=${updated.precio}, activo=${updated.activo}`, 'green');
    
    // Eliminar producto de prueba
    log('📝 Eliminando producto de prueba...', 'blue');
    const { error: deleteError } = await supabase
      .from('productos')
      .delete()
      .eq('id', created.id);
      
    if (deleteError) throw deleteError;
    
    log('✅ Producto eliminado correctamente', 'green');
    
    return true;
  } catch (error) {
    log(`❌ Error en CRUD de productos: ${error.message}`, 'red');
    return false;
  }
}

async function testEventSelector() {
  log('\n🧪 8. PRUEBA DE SELECTOR DE EVENTOS', 'cyan');
  
  try {
    // Obtener eventos
    const { data: eventos, error: eventosError } = await supabase
      .from('eventos')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (eventosError) throw eventosError;
    
    log(`✅ Eventos disponibles: ${eventos.length}`, 'green');
    
    // Obtener evento activo
    const { data: eventoActivo, error: activoError } = await supabase
      .from('eventos')
      .select('*')
      .eq('activo', true)
      .single();
      
    if (activoError && activoError.code !== 'PGRST116') {
      throw activoError;
    }
    
    if (eventoActivo) {
      log(`✅ Evento activo actual: ${eventoActivo.nombre}`, 'green');
      
      // Probar cambio de evento activo
      if (eventos.length > 1) {
        const otroEvento = eventos.find(e => e.id !== eventoActivo.id);
        if (otroEvento) {
          log('📝 Probando cambio de evento activo...', 'blue');
          
          // Desactivar todos
          await supabase
            .from('eventos')
            .update({ activo: false })
            .eq('activo', true);
            
          // Activar el otro
          const { error: updateError } = await supabase
            .from('eventos')
            .update({ activo: true })
            .eq('id', otroEvento.id);
            
          if (updateError) throw updateError;
          
          log(`✅ Evento cambiado a: ${otroEvento.nombre}`, 'green');
          
          // Restaurar el original
          await supabase
            .from('eventos')
            .update({ activo: false })
            .eq('activo', true);
            
          await supabase
            .from('eventos')
            .update({ activo: true })
            .eq('id', eventoActivo.id);
            
          log('✅ Evento original restaurado', 'green');
        }
      }
    } else {
      log('⚠️  No hay evento activo para probar selector', 'yellow');
    }
    
    return true;
  } catch (error) {
    log(`❌ Error en selector de eventos: ${error.message}`, 'red');
    return false;
  }
}

async function runCompleteTest() {
  log('🚀 INICIANDO PRUEBA COMPLETA DEL SISTEMA', 'magenta');
  log('==========================================', 'magenta');
  
  const results = {
    databaseConnection: await testDatabaseConnection(),
    eventosTable: await testEventosTable(),
    productosTable: await testProductosTable(),
    usuariosTable: await testUsuariosTable(),
    comandasTable: await testComandasTable(),
    eventCRUD: await testEventCRUD(),
    productCRUD: await testProductCRUD(),
    eventSelector: await testEventSelector()
  };
  
  log('\n📊 RESUMEN FINAL DE PRUEBAS', 'magenta');
  log('============================', 'magenta');
  
  let passedTests = 0;
  let totalTests = Object.keys(results).length;
  
  for (const [test, passed] of Object.entries(results)) {
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    log(`${testName}: ${passed ? '✅ PASÓ' : '❌ FALLÓ'}`, passed ? 'green' : 'red');
    if (passed) passedTests++;
  }
  
  log(`\n📈 RESULTADO: ${passedTests}/${totalTests} pruebas pasaron`, passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    log('\n🎉 ¡SISTEMA COMPLETAMENTE FUNCIONAL!', 'green');
    log('✅ Todos los componentes críticos están operativos', 'green');
    log('✅ Base de datos conectada y funcionando', 'green');
    log('✅ CRUD de eventos funcionando', 'green');
    log('✅ CRUD de productos funcionando', 'green');
    log('✅ Selector de eventos funcionando', 'green');
    log('✅ Sistema listo para uso en producción', 'green');
  } else {
    log('\n⚠️  HAY PROBLEMAS EN EL SISTEMA', 'yellow');
    log('❌ Algunas funcionalidades no están operativas', 'red');
    log('🔧 Se requiere revisión y corrección', 'yellow');
  }
  
  return passedTests === totalTests;
}

// Ejecutar prueba completa
runCompleteTest().catch(error => {
  log(`\n❌ ERROR FATAL: ${error.message}`, 'red');
  process.exit(1);
}); 