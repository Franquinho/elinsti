require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkEventsTable() {
  console.log('🔍 VERIFICANDO ESTRUCTURA DE TABLA EVENTOS');
  console.log('==========================================');
  
  try {
    // Intentar insertar un evento simple para ver qué columnas faltan
    const testEvent = {
      nombre: 'Evento de Prueba',
      descripcion: 'Descripción de prueba',
      fecha: new Date().toISOString(), // Agregar campo fecha
      fecha_inicio: new Date().toISOString(),
      fecha_fin: new Date(Date.now() + 3600000).toISOString(), // 1 hora después
      activo: true,
      capacidad_maxima: 100,
      precio_entrada: 1000.00,
      ubicacion: 'Sala de Prueba'
    };
    
    console.log('📋 Intentando insertar evento de prueba...');
    console.log('Datos:', JSON.stringify(testEvent, null, 2));
    
    const { data, error } = await supabase
      .from('eventos')
      .insert(testEvent)
      .select();
    
    if (error) {
      console.log(`❌ Error: ${error.message}`);
      console.log(`📋 Detalles: ${JSON.stringify(error, null, 2)}`);
    } else {
      console.log(`✅ Evento insertado correctamente: ${data[0].id}`);
      
      // Limpiar el evento de prueba
      await supabase.from('eventos').delete().eq('id', data[0].id);
      console.log('🧹 Evento de prueba eliminado');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

checkEventsTable().catch(console.error); 