// Script simple para probar las correcciones
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no configuradas');
  process.exit(1);
}

console.log('🔧 Conectando a Supabase...');
console.log(`URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBasicConnection() {
  console.log('\n🧪 Probando conexión básica...');
  
  try {
    const { data, error } = await supabase
      .from('eventos')
      .select('count')
      .limit(1);
      
    if (error) throw error;
    
    console.log('✅ Conexión exitosa a la base de datos');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    return false;
  }
}

async function testEventos() {
  console.log('\n🧪 Probando tabla de eventos...');
  
  try {
    const { data: eventos, error } = await supabase
      .from('eventos')
      .select('*')
      .limit(5);
      
    if (error) throw error;
    
    console.log(`✅ Eventos encontrados: ${eventos.length}`);
    
    if (eventos.length > 0) {
      console.log('📋 Primer evento:', {
        id: eventos[0].id,
        nombre: eventos[0].nombre,
        activo: eventos[0].activo
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error al obtener eventos:', error.message);
    return false;
  }
}

async function testProductos() {
  console.log('\n🧪 Probando tabla de productos...');
  
  try {
    const { data: productos, error } = await supabase
      .from('productos')
      .select('*')
      .limit(5);
      
    if (error) throw error;
    
    console.log(`✅ Productos encontrados: ${productos.length}`);
    
    if (productos.length > 0) {
      console.log('📋 Primer producto:', {
        id: productos[0].id,
        nombre: productos[0].nombre,
        precio: productos[0].precio,
        activo: productos[0].activo
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error al obtener productos:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Iniciando pruebas del sistema...\n');
  
  const results = {
    conexion: await testBasicConnection(),
    eventos: await testEventos(),
    productos: await testProductos()
  };
  
  console.log('\n📊 Resumen de Pruebas:');
  console.log('====================');
  
  let allPassed = true;
  for (const [test, passed] of Object.entries(results)) {
    console.log(`${test}: ${passed ? '✅ PASÓ' : '❌ FALLÓ'}`);
    if (!passed) allPassed = false;
  }
  
  if (allPassed) {
    console.log('\n🎉 ¡Sistema funcionando correctamente!');
  } else {
    console.log('\n⚠️  Hay problemas en el sistema.');
  }
}

runTests().catch(error => {
  console.error('\n❌ Error fatal:', error.message);
});