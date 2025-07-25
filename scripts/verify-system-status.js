const { createClient } = require('@supabase/supabase-js');

// Configuración
const SUPABASE_URL = 'https://joebhvyfcftobrngcqor.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SseWwWd7DpxeVfQVTCbfTg_KEzkN-qv';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifySystemStatus() {
  console.log('🔍 VERIFICACIÓN COMPLETA DEL SISTEMA');
  console.log('====================================\n');

  const status = {
    connection: false,
    auth: false,
    tables: {},
    data: {},
    login: false
  };

  try {
    // 1. Verificar conexión
    console.log('1️⃣ Verificando conexión con Supabase...');
    const { data, error } = await supabase.from('usuarios').select('count').limit(1);
    
    if (error) {
      console.log('❌ Error de conexión:', error.message);
      return;
    }
    status.connection = true;
    console.log('✅ Conexión con Supabase: FUNCIONA');

    // 2. Verificar autenticación
    console.log('\n2️⃣ Verificando autenticación...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@elinsti.com',
      password: 'Admin123!'
    });

    if (authError) {
      console.log('❌ Error de autenticación:', authError.message);
    } else {
      status.auth = true;
      status.login = true;
      console.log('✅ Autenticación: FUNCIONA');
      console.log('✅ Login: FUNCIONA');
      console.log('   Usuario:', authData.user?.email);
      console.log('   ID:', authData.user?.id);
    }

    // 3. Verificar tablas
    console.log('\n3️⃣ Verificando estructura de base de datos...');
    const tables = ['usuarios', 'productos', 'eventos', 'comandas', 'comanda_items'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1);
        if (error) {
          console.log(`❌ Tabla ${table}: ${error.message}`);
          status.tables[table] = false;
        } else {
          console.log(`✅ Tabla ${table}: OK`);
          status.tables[table] = true;
        }
      } catch (err) {
        console.log(`❌ Tabla ${table}: Error de conexión`);
        status.tables[table] = false;
      }
    }

    // 4. Verificar datos
    console.log('\n4️⃣ Verificando datos...');
    
    // Usuarios
    const { data: usuarios } = await supabase.from('usuarios').select('*');
    status.data.usuarios = usuarios?.length || 0;
    console.log(`✅ Usuarios: ${status.data.usuarios} encontrados`);
    
    // Productos
    const { data: productos } = await supabase.from('productos').select('*');
    status.data.productos = productos?.length || 0;
    console.log(`✅ Productos: ${status.data.productos} encontrados`);
    
    // Eventos
    const { data: eventos } = await supabase.from('eventos').select('*');
    status.data.eventos = eventos?.length || 0;
    console.log(`✅ Eventos: ${status.data.eventos} encontrados`);

    // 5. Verificar eventos activos
    const { data: eventosActivos } = await supabase
      .from('eventos')
      .select('*')
      .eq('activo', true);
    
    console.log(`✅ Eventos activos: ${eventosActivos?.length || 0} encontrados`);

    // 6. Verificar productos activos
    const { data: productosActivos } = await supabase
      .from('productos')
      .select('*')
      .eq('activo', true);
    
    console.log(`✅ Productos activos: ${productosActivos?.length || 0} encontrados`);

    // 7. Resumen final
    console.log('\n🎯 RESUMEN DEL ESTADO DEL SISTEMA');
    console.log('==================================');
    console.log(`✅ Conexión: ${status.connection ? 'FUNCIONA' : 'FALLA'}`);
    console.log(`✅ Autenticación: ${status.auth ? 'FUNCIONA' : 'FALLA'}`);
    console.log(`✅ Login: ${status.login ? 'FUNCIONA' : 'FALLA'}`);
    
    const tablesWorking = Object.values(status.tables).filter(Boolean).length;
    const totalTables = Object.keys(status.tables).length;
    console.log(`✅ Tablas: ${tablesWorking}/${totalTables} funcionando`);
    
    console.log(`✅ Datos: ${status.data.usuarios} usuarios, ${status.data.productos} productos, ${status.data.eventos} eventos`);
    
    // 8. Estado general
    const allWorking = status.connection && status.auth && status.login && tablesWorking === totalTables;
    
    if (allWorking) {
      console.log('\n🎉 SISTEMA COMPLETAMENTE FUNCIONAL');
      console.log('==================================');
      console.log('✅ Todos los componentes están funcionando correctamente');
      console.log('✅ El sistema está listo para usar en producción');
      console.log('\n📋 CREDENCIALES DE ACCESO:');
      console.log('Email: admin@elinsti.com');
      console.log('Contraseña: Admin123!');
      console.log('\n🌐 URL del sistema: http://localhost:3000');
    } else {
      console.log('\n⚠️ SISTEMA CON PROBLEMAS');
      console.log('======================');
      console.log('❌ Algunos componentes no están funcionando correctamente');
      console.log('🔧 Revisa los errores anteriores para identificar problemas');
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
  }
}

verifySystemStatus(); 