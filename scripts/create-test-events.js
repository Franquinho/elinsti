require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createTestEvents() {
  console.log('🎉 CREANDO EVENTOS DE PRUEBA');
  console.log('============================');
  
  const testEvents = [
    {
      nombre: 'Noche Bohemia - Enero 2024',
      descripcion: 'Evento de música en vivo con artistas locales',
      fecha: '2024-01-15T20:00:00',
      fecha_inicio: '2024-01-15T20:00:00',
      fecha_fin: '2024-01-16T02:00:00',
      activo: true,
      capacidad_maxima: 150,
      precio_entrada: 5000.00,
      ubicacion: 'Sala Principal'
    },
    {
      nombre: 'Concierto Acústico',
      descripcion: 'Música acústica y poesía en ambiente íntimo',
      fecha: '2024-01-20T19:00:00',
      fecha_inicio: '2024-01-20T19:00:00',
      fecha_fin: '2024-01-20T23:00:00',
      activo: true,
      capacidad_maxima: 80,
      precio_entrada: 3000.00,
      ubicacion: 'Jardín Trasero'
    },
    {
      nombre: 'Fiesta de Fin de Año',
      descripcion: 'Celebración especial con DJ y buffet',
      fecha: '2024-12-31T21:00:00',
      fecha_inicio: '2024-12-31T21:00:00',
      fecha_fin: '2025-01-01T03:00:00',
      activo: false,
      capacidad_maxima: 200,
      precio_entrada: 8000.00,
      ubicacion: 'Terraza Principal'
    }
  ];
  
  try {
    for (const event of testEvents) {
      const { data, error } = await supabase
        .from('eventos')
        .insert(event)
        .select();
      
      if (error) {
        console.log(`❌ Error creando evento "${event.nombre}": ${error.message}`);
      } else {
        console.log(`✅ Evento creado: "${event.nombre}" (ID: ${data[0].id})`);
      }
    }
    
    // Verificar eventos creados
    console.log('\n📋 Eventos en la base de datos:');
    const { data: eventos, error } = await supabase
      .from('eventos')
      .select('id, nombre, activo, fecha_inicio')
      .order('fecha_inicio', { ascending: true });
    
    if (error) {
      console.log(`❌ Error consultando eventos: ${error.message}`);
    } else {
      eventos.forEach(e => {
        const fecha = new Date(e.fecha_inicio).toLocaleDateString('es-ES');
        console.log(`   - ${e.nombre} (${fecha}) - ${e.activo ? '🟢 Activo' : '🔴 Inactivo'}`);
      });
    }
    
    console.log('\n🏁 Eventos de prueba creados');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

createTestEvents().catch(console.error); 