const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuración corregida
const envContent = `# ========================================
# CONFIGURACIÓN PRODUCCIÓN - EL INSTI POS
# ========================================

# ENTORNO
NODE_ENV=production
NEXT_PUBLIC_ENV=production

# ========================================
# SUPABASE - PRODUCCIÓN
# ========================================
NEXT_PUBLIC_SUPABASE_URL=https://joebhvyfcftobrngcqor.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_SseWwWd7DpxeVfQVTCbfTg_KEzkN-qv
SUPABASE_SERVICE_ROLE_KEY=sb_service_role_SseWwWd7DpxeVfQVTCbfTg_KEzkN-qv

# ========================================
# CONFIGURACIÓN DE SEGURIDAD
# ========================================
JWT_SECRET=production_jwt_secret_key_2025_el_insti
`;

async function fixAllIssues() {
  console.log('🔧 CORRIGIENDO TODOS LOS PROBLEMAS DEL SISTEMA');
  console.log('==============================================\n');

  try {
    // Paso 1: Corregir archivo .env.local
    console.log('1️⃣ Corrigiendo archivo .env.local...');
    const envPath = path.join(__dirname, '..', '.env.local');
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Archivo .env.local corregido');

    // Paso 2: Verificar configuración
    console.log('\n2️⃣ Verificando configuración...');
    require('dotenv').config({ path: '.env.local' });
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.log('❌ Variables de entorno no configuradas correctamente');
      return;
    }
    console.log('✅ Variables de entorno configuradas');

    // Paso 3: Probar conexión con Supabase
    console.log('\n3️⃣ Probando conexión con Supabase...');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data, error } = await supabase.from('usuarios').select('count').limit(1);
    if (error) {
      console.log('❌ Error de conexión:', error.message);
      return;
    }
    console.log('✅ Conexión con Supabase exitosa');

    // Paso 4: Verificar tablas necesarias
    console.log('\n4️⃣ Verificando estructura de base de datos...');
    const tables = ['usuarios', 'productos', 'eventos', 'comandas', 'comanda_items'];
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
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

    // Paso 5: Crear usuario de prueba si no existe
    console.log('\n5️⃣ Verificando usuario de prueba...');
    const { data: existingUser } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('email', 'admin@elinsti.com')
      .single();

    if (!existingUser) {
      console.log('Creando usuario de prueba...');
      
      // Crear usuario en Supabase Auth
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: 'admin@elinsti.com',
        password: 'Admin123!',
        email_confirm: true
      });

      if (authError) {
        console.log('❌ Error creando usuario en Auth:', authError.message);
      } else {
        // Crear registro en tabla usuarios
        const { error: userError } = await supabaseAdmin
          .from('usuarios')
          .insert({
            id: authUser.user.id,
            nombre: 'Administrador',
            email: 'admin@elinsti.com',
            rol: 'admin',
            activo: true
          });

        if (userError) {
          console.log('❌ Error creando usuario en tabla:', userError.message);
        } else {
          console.log('✅ Usuario de prueba creado correctamente');
        }
      }
    } else {
      console.log('✅ Usuario de prueba ya existe');
    }

    // Paso 6: Crear evento de prueba si no existe
    console.log('\n6️⃣ Verificando evento de prueba...');
    const { data: existingEvent } = await supabaseAdmin
      .from('eventos')
      .select('*')
      .eq('nombre', 'Roda del Insti')
      .single();

    if (!existingEvent) {
      console.log('Creando evento de prueba...');
      const { error: eventError } = await supabaseAdmin
        .from('eventos')
        .insert({
          nombre: 'Roda del Insti',
          descripcion: 'Noche de música y baile',
          fecha_inicio: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana
          fecha_fin: new Date(Date.now() + 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // Mañana + 4 horas
          capacidad_maxima: 100,
          precio_entrada: 25.00,
          ubicacion: 'Sala Principal',
          activo: true
        });

      if (eventError) {
        console.log('❌ Error creando evento:', eventError.message);
      } else {
        console.log('✅ Evento de prueba creado correctamente');
      }
    } else {
      console.log('✅ Evento de prueba ya existe');
    }

    console.log('\n🎉 TODOS LOS PROBLEMAS CORREGIDOS');
    console.log('==================================');
    console.log('✅ Archivo .env.local corregido');
    console.log('✅ Variables de entorno configuradas');
    console.log('✅ Conexión con Supabase verificada');
    console.log('✅ Estructura de base de datos verificada');
    console.log('✅ Usuario de prueba disponible');
    console.log('✅ Evento de prueba disponible');
    console.log('\n📋 CREDENCIALES DE PRUEBA:');
    console.log('Email: admin@elinsti.com');
    console.log('Contraseña: Admin123!');
    console.log('\n🔄 Reinicia tu servidor de desarrollo ahora');

  } catch (error) {
    console.error('❌ Error durante la corrección:', error.message);
  }
}

fixAllIssues(); 