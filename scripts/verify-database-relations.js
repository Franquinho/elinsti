require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function verifyDatabaseRelations() {
  console.log('🔍 VERIFICANDO RELACIONES DE BASE DE DATOS');
  console.log('==========================================');
  
  try {
    // 1. Verificar que las tablas existen
    console.log('\n1️⃣ Verificando existencia de tablas...');
    
    const tables = ['usuarios', 'productos', 'eventos', 'comandas', 'comanda_items', 'logs'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ Tabla ${table}: ${error.message}`);
        } else {
          console.log(`✅ Tabla ${table}: EXISTE`);
        }
      } catch (err) {
        console.log(`❌ Tabla ${table}: ${err.message}`);
      }
    }
    
    // 2. Verificar relaciones
    console.log('\n2️⃣ Verificando relaciones...');
    
    // Verificar relación comandas -> comanda_items
    try {
      const { data, error } = await supabase
        .from('comandas')
        .select('id, comanda_items(id, cantidad)')
        .limit(1);
      
      if (error) {
        console.log(`❌ Relación comandas -> comanda_items: ${error.message}`);
      } else {
        console.log(`✅ Relación comandas -> comanda_items: FUNCIONA`);
      }
    } catch (err) {
      console.log(`❌ Relación comandas -> comanda_items: ${err.message}`);
    }
    
    // Verificar relación comanda_items -> productos
    try {
      const { data, error } = await supabase
        .from('comanda_items')
        .select('id, productos(nombre, precio)')
        .limit(1);
      
      if (error) {
        console.log(`❌ Relación comanda_items -> productos: ${error.message}`);
      } else {
        console.log(`✅ Relación comanda_items -> productos: FUNCIONA`);
      }
    } catch (err) {
      console.log(`❌ Relación comanda_items -> productos: ${err.message}`);
    }
    
    // 3. Verificar datos de prueba
    console.log('\n3️⃣ Verificando datos de prueba...');
    
    // Verificar usuarios
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('id, nombre, email, rol, activo')
      .limit(3);
    
    if (usuariosError) {
      console.log(`❌ Error consultando usuarios: ${usuariosError.message}`);
    } else {
      console.log(`✅ Usuarios encontrados: ${usuarios?.length || 0}`);
      if (usuarios && usuarios.length > 0) {
        usuarios.forEach(u => console.log(`   - ${u.nombre} (${u.email}) - ${u.rol}`));
      }
    }
    
    // Verificar productos
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('id, nombre, precio, activo')
      .limit(3);
    
    if (productosError) {
      console.log(`❌ Error consultando productos: ${productosError.message}`);
    } else {
      console.log(`✅ Productos encontrados: ${productos?.length || 0}`);
      if (productos && productos.length > 0) {
        productos.forEach(p => console.log(`   - ${p.nombre} ($${p.precio}) - ${p.activo ? 'Activo' : 'Inactivo'}`));
      }
    }
    
    // Verificar eventos
    const { data: eventos, error: eventosError } = await supabase
      .from('eventos')
      .select('id, nombre, activo')
      .limit(3);
    
    if (eventosError) {
      console.log(`❌ Error consultando eventos: ${eventosError.message}`);
    } else {
      console.log(`✅ Eventos encontrados: ${eventos?.length || 0}`);
      if (eventos && eventos.length > 0) {
        eventos.forEach(e => console.log(`   - ${e.nombre} - ${e.activo ? 'Activo' : 'Inactivo'}`));
      }
    }
    
    console.log('\n🏁 Verificación completada');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

verifyDatabaseRelations().catch(console.error); 