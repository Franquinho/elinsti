const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://joebhvyfcftobrngcqor.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZWJodnlmY2Z0b2JybmdjcW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MzY5MzMsImV4cCI6MjA2NjAxMjkzM30.zyzj1pZLDboSnRYVtpYUhsrKkDAcPwVVzbohmQvBhoE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseStructure() {
  console.log('🔍 VERIFICANDO ESTRUCTURA DE LA BASE DE DATOS');
  console.log('=============================================\n');

  try {
    // 1. Verificar tabla usuarios
    console.log('1️⃣ Verificando tabla usuarios...');
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('*')
      .limit(1);

    if (usuariosError) {
      console.log('   ❌ Error accediendo a usuarios:', usuariosError.message);
    } else {
      console.log('   ✅ Tabla usuarios accesible');
      if (usuarios && usuarios.length > 0) {
        console.log('   📋 Campos disponibles:', Object.keys(usuarios[0]));
      }
    }

    // 2. Verificar tabla eventos
    console.log('\n2️⃣ Verificando tabla eventos...');
    const { data: eventos, error: eventosError } = await supabase
      .from('eventos')
      .select('*')
      .limit(1);

    if (eventosError) {
      console.log('   ❌ Error accediendo a eventos:', eventosError.message);
    } else {
      console.log('   ✅ Tabla eventos accesible');
      if (eventos && eventos.length > 0) {
        console.log('   📋 Campos disponibles:', Object.keys(eventos[0]));
      }
    }

    // 3. Verificar tabla productos
    console.log('\n3️⃣ Verificando tabla productos...');
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('*')
      .limit(1);

    if (productosError) {
      console.log('   ❌ Error accediendo a productos:', productosError.message);
    } else {
      console.log('   ✅ Tabla productos accesible');
      if (productos && productos.length > 0) {
        console.log('   📋 Campos disponibles:', Object.keys(productos[0]));
      }
    }

    // 4. Verificar tabla comandas
    console.log('\n4️⃣ Verificando tabla comandas...');
    const { data: comandas, error: comandasError } = await supabase
      .from('comandas')
      .select('*')
      .limit(1);

    if (comandasError) {
      console.log('   ❌ Error accediendo a comandas:', comandasError.message);
    } else {
      console.log('   ✅ Tabla comandas accesible');
      if (comandas && comandas.length > 0) {
        console.log('   📋 Campos disponibles:', Object.keys(comandas[0]));
      }
    }

    // 5. Verificar tabla comanda_items
    console.log('\n5️⃣ Verificando tabla comanda_items...');
    const { data: comandaItems, error: comandaItemsError } = await supabase
      .from('comanda_items')
      .select('*')
      .limit(1);

    if (comandaItemsError) {
      console.log('   ❌ Error accediendo a comanda_items:', comandaItemsError.message);
    } else {
      console.log('   ✅ Tabla comanda_items accesible');
      if (comandaItems && comandaItems.length > 0) {
        console.log('   📋 Campos disponibles:', Object.keys(comandaItems[0]));
      }
    }

    // 6. Verificar tabla caja
    console.log('\n6️⃣ Verificando tabla caja...');
    const { data: caja, error: cajaError } = await supabase
      .from('caja')
      .select('*')
      .limit(1);

    if (cajaError) {
      console.log('   ❌ Error accediendo a caja:', cajaError.message);
    } else {
      console.log('   ✅ Tabla caja accesible');
      if (caja && caja.length > 0) {
        console.log('   📋 Campos disponibles:', Object.keys(caja[0]));
      }
    }

    // 7. Verificar datos existentes
    console.log('\n7️⃣ Verificando datos existentes...');
    
    const { data: usuariosCount } = await supabase
      .from('usuarios')
      .select('id', { count: 'exact' });
    console.log(`   👥 Usuarios: ${usuariosCount?.length || 0}`);

    const { data: eventosCount } = await supabase
      .from('eventos')
      .select('id', { count: 'exact' });
    console.log(`   🎉 Eventos: ${eventosCount?.length || 0}`);

    const { data: productosCount } = await supabase
      .from('productos')
      .select('id', { count: 'exact' });
    console.log(`   📦 Productos: ${productosCount?.length || 0}`);

    const { data: comandasCount } = await supabase
      .from('comandas')
      .select('id', { count: 'exact' });
    console.log(`   📋 Comandas: ${comandasCount?.length || 0}`);

    // 8. Verificar usuario específico
    console.log('\n8️⃣ Verificando usuario ID 4...');
    const { data: usuario4, error: usuario4Error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', 4)
      .single();

    if (usuario4Error) {
      console.log('   ❌ Usuario ID 4 no encontrado:', usuario4Error.message);
    } else {
      console.log('   ✅ Usuario ID 4 encontrado:', usuario4);
    }

    // 9. Verificar evento activo
    console.log('\n9️⃣ Verificando evento activo...');
    const { data: eventoActivo, error: eventoActivoError } = await supabase
      .from('eventos')
      .select('*')
      .eq('activo', true)
      .single();

    if (eventoActivoError) {
      console.log('   ❌ No hay evento activo:', eventoActivoError.message);
    } else {
      console.log('   ✅ Evento activo encontrado:', eventoActivo);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar la verificación
checkDatabaseStructure(); 