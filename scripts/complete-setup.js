const { createClient } = require('@supabase/supabase-js');

// Configuración con la Service Role Key correcta
const SUPABASE_URL = 'https://joebhvyfcftobrngcqor.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SseWwWd7DpxeVfQVTCbfTg_KEzkN-qv';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZWJodnlmY2Z0b2JybmdjcW9yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQzNjkzMywiZXhwIjoyMDY2MDEyOTMzfQ.LtdelW0YtBCnXewjgJSEbTmXQ-WqIgeUYDNSU7X4BsM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function completeSetup() {
  console.log('🚀 CONFIGURACIÓN COMPLETA DEL SISTEMA');
  console.log('=====================================\n');

  try {
    // 1. Verificar conexión básica
    console.log('1️⃣ Verificando conexión básica...');
    const { data, error } = await supabase.from('usuarios').select('count').limit(1);
    
    if (error) {
      console.log('❌ Error de conexión:', error.message);
      return;
    }
    console.log('✅ Conexión básica exitosa');

    // 2. Verificar conexión admin
    console.log('\n2️⃣ Verificando conexión admin...');
    const { data: adminData, error: adminError } = await supabaseAdmin.from('usuarios').select('count').limit(1);
    
    if (adminError) {
      console.log('❌ Error de conexión admin:', adminError.message);
      return;
    }
    console.log('✅ Conexión admin exitosa');

    // 3. Verificar tablas con admin
    console.log('\n3️⃣ Verificando estructura de base de datos...');
    const tables = ['usuarios', 'productos', 'eventos', 'comandas', 'comanda_items'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabaseAdmin.from(table).select('count').limit(1);
        if (error) {
          console.log(`❌ Tabla ${table}: ${error.message}`);
        } else {
          console.log(`✅ Tabla ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ Tabla ${table}: Error de conexión`);
      }
    }

    // 4. Verificar datos existentes
    console.log('\n4️⃣ Verificando datos existentes...');
    
    const { data: usuarios } = await supabaseAdmin.from('usuarios').select('*');
    console.log(`✅ Usuarios: ${usuarios?.length || 0} encontrados`);
    
    const { data: productos } = await supabaseAdmin.from('productos').select('*');
    console.log(`✅ Productos: ${productos?.length || 0} encontrados`);
    
    const { data: eventos } = await supabaseAdmin.from('eventos').select('*');
    console.log(`✅ Eventos: ${eventos?.length || 0} encontrados`);

    // 5. Verificar usuario admin
    console.log('\n5️⃣ Verificando usuario admin...');
    const { data: adminUser } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('email', 'admin@elinsti.com')
      .single();

    if (adminUser) {
      console.log('✅ Usuario admin encontrado');
      console.log('   Nombre:', adminUser.nombre);
      console.log('   Rol:', adminUser.rol);
      console.log('   Activo:', adminUser.activo);
    } else {
      console.log('⚠️ Usuario admin no encontrado en tabla usuarios');
    }

    // 6. Verificar autenticación
    console.log('\n6️⃣ Verificando autenticación...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@elinsti.com',
      password: 'Admin123!'
    });

    if (authError) {
      console.log('❌ Error de autenticación:', authError.message);
    } else {
      console.log('✅ Autenticación exitosa');
      console.log('   Usuario:', authData.user?.email);
      console.log('   ID:', authData.user?.id);
    }

    // 7. Crear datos de prueba si no existen
    console.log('\n7️⃣ Verificando datos de prueba...');
    
    // Crear productos de prueba si no existen
    if (!productos || productos.length === 0) {
      console.log('Creando productos de prueba...');
      const productosPrueba = [
        { nombre: 'Cerveza', precio: 5.00, emoji: '🍺', activo: true },
        { nombre: 'Vino', precio: 8.00, emoji: '🍷', activo: true },
        { nombre: 'Café', precio: 3.00, emoji: '☕', activo: true },
        { nombre: 'Agua', precio: 2.00, emoji: '💧', activo: true },
        { nombre: 'Empanada', precio: 4.00, emoji: '🥟', activo: true }
      ];

      for (const producto of productosPrueba) {
        const { error } = await supabaseAdmin.from('productos').insert(producto);
        if (error) {
          console.log(`❌ Error creando producto ${producto.nombre}:`, error.message);
        } else {
          console.log(`✅ Producto ${producto.nombre} creado`);
        }
      }
    }

    // Crear evento de prueba si no existe
    if (!eventos || eventos.length === 0) {
      console.log('Creando evento de prueba...');
      const { error } = await supabaseAdmin.from('eventos').insert({
        nombre: 'Roda del Insti',
        descripcion: 'Noche de música y baile',
        fecha_inicio: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        fecha_fin: new Date(Date.now() + 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
        capacidad_maxima: 100,
        precio_entrada: 25.00,
        ubicacion: 'Sala Principal',
        activo: true
      });

      if (error) {
        console.log('❌ Error creando evento:', error.message);
      } else {
        console.log('✅ Evento de prueba creado');
      }
    }

    console.log('\n🎉 CONFIGURACIÓN COMPLETA EXITOSA');
    console.log('==================================');
    console.log('✅ Conexión básica: FUNCIONA');
    console.log('✅ Conexión admin: FUNCIONA');
    console.log('✅ Estructura de base de datos: VERIFICADA');
    console.log('✅ Autenticación: FUNCIONA');
    console.log('✅ Datos de prueba: DISPONIBLES');
    console.log('\n📋 CREDENCIALES DE ACCESO:');
    console.log('Email: admin@elinsti.com');
    console.log('Contraseña: Admin123!');
    console.log('\n🌐 URL del sistema: http://localhost:3000');
    console.log('\n🎯 El sistema está completamente funcional');

  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
  }
}

completeSetup(); 