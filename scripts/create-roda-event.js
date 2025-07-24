require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createRodaEvent() {
  console.log('🎉 CREANDO EVENTO "RODA DEL INSTI"');
  console.log('==================================');
  
  const rodaEvent = {
    nombre: 'Roda del Insti',
    descripcion: 'Evento especial de música en vivo con artistas locales y ambiente bohemio',
    fecha: new Date().toISOString(),
    fecha_inicio: new Date().toISOString(),
    fecha_fin: new Date(Date.now() + 4 * 3600000).toISOString(), // 4 horas después
    activo: true,
    capacidad_maxima: 120,
    precio_entrada: 4000.00,
    ubicacion: 'Sala Principal del Insti'
  };
  
  try {
    console.log('📋 Datos del evento:');
    console.log(JSON.stringify(rodaEvent, null, 2));
    
    const { data, error } = await supabase
      .from('eventos')
      .insert(rodaEvent)
      .select();
    
    if (error) {
      console.log(`❌ Error creando evento: ${error.message}`);
    } else {
      console.log(`✅ Evento creado exitosamente: "${data[0].nombre}" (ID: ${data[0].id})`);
      
      // Verificar eventos en la base de datos
      console.log('\n📋 Eventos actuales en la base de datos:');
      const { data: eventos, error: eventosError } = await supabase
        .from('eventos')
        .select('id, nombre, activo, fecha_inicio')
        .order('fecha_inicio', { ascending: true });
      
      if (eventosError) {
        console.log(`❌ Error consultando eventos: ${eventosError.message}`);
      } else {
        eventos.forEach(e => {
          const fecha = new Date(e.fecha_inicio).toLocaleDateString('es-ES');
          console.log(`   - ${e.nombre} (${fecha}) - ${e.activo ? '🟢 Activo' : '🔴 Inactivo'}`);
        });
      }
    }
    
    console.log('\n🏁 Evento "Roda del Insti" creado');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

createRodaEvent().catch(console.error); 