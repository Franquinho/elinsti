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

async function quickSetup() {
  console.log('🚀 Configuración rápida de Supabase para El INSTI...\n');
  
  try {
    // 1. Verificar conexión
    console.log('🔍 Verificando conexión a Supabase...');
    const { data, error } = await supabase.from('productos').select('*').limit(1);
    
    if (error && error.message.includes('relation "productos" does not exist')) {
      console.log('❌ Las tablas no existen. Ejecuta el script SQL en Supabase primero.');
      console.log('📝 Ve al SQL Editor de Supabase y ejecuta el contenido de scripts/setup-supabase.sql');
      return;
    }
    
    console.log('✅ Conexión a Supabase exitosa');
    
    // 2. Verificar tablas
    const tables = ['eventos', 'productos', 'comandas', 'comanda_items', 'configuracion_sistema'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ Tabla ${table}: ${error.message}`);
        } else {
          console.log(`✅ Tabla ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ Tabla ${table}: Error de conexión`);
      }
    }
    
    // 3. Verificar datos
    console.log('\n📊 Verificando datos...');
    
    const { data: eventos } = await supabase.from('eventos').select('*');
    console.log(`✅ Eventos: ${eventos?.length || 0} encontrados`);
    
    const { data: productos } = await supabase.from('productos').select('*');
    console.log(`✅ Productos: ${productos?.length || 0} encontrados`);
    
    const { data: config } = await supabase.from('configuracion_sistema').select('*');
    console.log(`✅ Configuración: ${config?.length || 0} registros`);
    
    // 4. Insertar datos si están vacíos
    if (!eventos || eventos.length === 0) {
      console.log('🔄 Insertando evento de prueba...');
      const { error } = await supabase.from('eventos').insert({
        nombre: 'Evento Inicial',
        descripcion: 'Evento de prueba para el sistema',
        fecha_inicio: new Date().toISOString(),
        fecha_fin: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        activo: true
      });
      
      if (error) {
        console.error('❌ Error insertando evento:', error.message);
      } else {
        console.log('✅ Evento insertado correctamente');
      }
    }
    
    if (!productos || productos.length === 0) {
      console.log('🔄 Insertando productos de prueba...');
      const { error } = await supabase.from('productos').insert([
        { nombre: 'Cerveza Artesanal', precio: 2500, emoji: '🍺', activo: true },
        { nombre: 'Vino Tinto', precio: 3500, emoji: '🍷', activo: true },
        { nombre: 'Empanadas', precio: 1200, emoji: '🥟', activo: true },
        { nombre: 'Café Especial', precio: 1800, emoji: '☕', activo: true }
      ]);
      
      if (error) {
        console.error('❌ Error insertando productos:', error.message);
      } else {
        console.log('✅ Productos insertados correctamente');
      }
    }
    
    console.log('\n🎉 Configuración completada exitosamente!');
    console.log('🚀 El sistema está listo para usar');
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
    console.log('\n📝 Si las tablas no existen, ejecuta el script SQL en Supabase:');
    console.log('1. Ve al dashboard de Supabase');
    console.log('2. Abre el SQL Editor');
    console.log('3. Ejecuta el contenido de scripts/setup-supabase.sql');
  }
}

quickSetup(); 