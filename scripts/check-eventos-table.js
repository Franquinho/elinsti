const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://joebhvyfcftobrngcqor.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZWJodnlmY2Z0b2JybmdjcW9yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQzNjkzMywiZXhwIjoyMDY2MDEyOTMzfQ.LtdelW0YtBCnXewjgJSEbTmXQ-WqIgeUYDNSU7X4BsM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEventosTable() {
  try {
    console.log('🔍 Verificando estructura de tabla eventos...');
    
    // Intentar obtener la estructura de la tabla
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error accediendo a tabla eventos:', error);
      return;
    }
    
    console.log('✅ Tabla eventos accesible');
    
    // Intentar insertar un evento de prueba
    const testEvent = {
      nombre: 'Evento de Prueba',
      descripcion: 'Descripción de prueba',
      fecha_inicio: new Date().toISOString(),
      fecha_fin: new Date(Date.now() + 86400000).toISOString(), // +1 día
      activo: true,
      capacidad_maxima: 100,
      precio_entrada: 0,
      ubicacion: 'Ubicación de prueba',
      imagen_url: null
    };
    
    console.log('🧪 Intentando insertar evento de prueba...');
    console.log('📝 Datos:', testEvent);
    
    const { data: insertData, error: insertError } = await supabase
      .from('eventos')
      .insert([testEvent])
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Error insertando evento de prueba:', insertError);
      console.log('🔍 Detalles del error:', insertError.message);
    } else {
      console.log('✅ Evento de prueba insertado correctamente');
      console.log('📊 Evento creado:', insertData);
      
      // Limpiar el evento de prueba
      await supabase
        .from('eventos')
        .delete()
        .eq('id', insertData.id);
      
      console.log('🧹 Evento de prueba eliminado');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkEventosTable(); 