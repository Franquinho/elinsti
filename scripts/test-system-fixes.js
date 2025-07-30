// Script para probar las correcciones del sistema
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEventSelector() {
  log('\n🧪 Probando Selector de Eventos...', 'cyan');
  
  try {
    // Obtener eventos
    const { data: eventos, error: eventosError } = await supabase
      .from('eventos')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (eventosError) throw eventosError;
    
    log(`✅ Eventos encontrados: ${eventos.length}`, 'green');
    
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
      log(`✅ Evento activo: ${eventoActivo.nombre}`, 'green');
    } else {
      log('⚠️  No hay evento activo', 'yellow');
    }
    
    // Probar cambio de evento activo
    if (eventos.length > 1) {
      const otroEvento = eventos.find(e => e.id !== eventoActivo?.id);
      if (otroEvento) {
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
        
        // Restaurar el original si existía
        if (eventoActivo) {
          await supabase
            .from('eventos')
            .update({ activo: false })
            .eq('activo', true);
            
          await supabase
            .from('eventos')
            .update({ activo: true })
            .eq('id', eventoActivo.id);
        }
      }
    }
    
    return true;
  } catch (error) {
    log(`❌ Error en selector de eventos: ${error.message}`, 'red');
    return false;
  }
}

async function testProductABM() {
  log('\n🧪 Probando ABM de Productos...', 'cyan');
  
  try {
    // Crear producto de prueba
    const nuevoProducto = {
      nombre: `Test Product ${Date.now()}`,
      precio: 99.99,
      emoji: '🧪',
      activo: true
    };
    
    const { data: created, error: createError } = await supabase
      .from('productos')
      .insert([nuevoProducto])
      .select()
      .single();
      
    if (createError) throw createError;
    
    log(`✅ Producto creado: ${created.nombre}`, 'green');
    
    // Actualizar producto
    const { data: updated, error: updateError } = await supabase
      .from('productos')
      .update({ precio: 149.99, activo: false })
      .eq('id', created.id)
      .select()
      .single();
      
    if (updateError) throw updateError;
    
    log(`✅ Producto actualizado: precio=${updated.precio}, activo=${updated.activo}`, 'green');
    
    // Eliminar producto de prueba
    const { error: deleteError } = await supabase
      .from('productos')
      .delete()
      .eq('id', created.id);
      
    if (deleteError) throw deleteError;
    
    log('✅ Producto eliminado correctamente', 'green');
    
    return true;
  } catch (error) {
    log(`❌ Error en ABM de productos: ${error.message}`, 'red');
    return false;
  }
}

async function testEventABM() {
  log('\n🧪 Probando ABM de Eventos...', 'cyan');
  
  try {
    // Crear evento de prueba
    const nuevoEvento = {
      nombre: `Test Event ${Date.now()}`,
      descripcion: 'Evento de prueba',
      fecha_inicio: new Date().toISOString(),
      fecha_fin: new Date(Date.now() + 86400000).toISOString(), // +1 día
      precio_entrada: 0,
      activo: false
    };
    
    const { data: created, error: createError } = await supabase
      .from('eventos')
      .insert([nuevoEvento])
      .select()
      .single();
      
    if (createError) throw createError;
    
    log(`✅ Evento creado: ${created.nombre}`, 'green');
    
    // Actualizar evento
    const { data: updated, error: updateError } = await supabase
      .from('eventos')
      .update({ 
        descripcion: 'Evento actualizado',
        precio_entrada: 50
      })
      .eq('id', created.id)
      .select()
      .single();
      
    if (updateError) throw updateError;
    
    log(`✅ Evento actualizado: descripcion="${updated.descripcion}", precio=${updated.precio_entrada}`, 'green');
    
    // Eliminar evento de prueba
    const { error: deleteError } = await supabase
      .from('eventos')
      .delete()
      .eq('id', created.id);
      
    if (deleteError) throw deleteError;
    
    log('✅ Evento eliminado correctamente', 'green');
    
    return true;
  } catch (error) {
    log(`❌ Error en ABM de eventos: ${error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('🚀 Iniciando pruebas del sistema corregido...', 'blue');
  
  const results = {
    eventSelector: await testEventSelector(),
    productABM: await testProductABM(),
    eventABM: await testEventABM()
  };
  
  log('\n📊 Resumen de Pruebas:', 'blue');
  log('====================', 'blue');
  
  let allPassed = true;
  for (const [test, passed] of Object.entries(results)) {
    log(`${test}: ${passed ? '✅ PASÓ' : '❌ FALLÓ'}`, passed ? 'green' : 'red');
    if (!passed) allPassed = false;
  }
  
  if (allPassed) {
    log('\n🎉 ¡Todas las pruebas pasaron exitosamente!', 'green');
  } else {
    log('\n⚠️  Algunas pruebas fallaron. Revisa los errores arriba.', 'yellow');
  }
}

// Ejecutar pruebas
runTests().catch(error => {
  log(`\n❌ Error fatal: ${error.message}`, 'red');
  process.exit(1);
});