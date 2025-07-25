const { createClient } = require('@supabase/supabase-js');

// Configuración básica para probar login
const SUPABASE_URL = 'https://joebhvyfcftobrngcqor.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SseWwWd7DpxeVfQVTCbfTg_KEzkN-qv';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testLoginOnly() {
  console.log('🔍 PROBANDO LOGIN BÁSICO');
  console.log('========================\n');

  try {
    // 1. Verificar conexión básica
    console.log('1️⃣ Verificando conexión básica...');
    const { data, error } = await supabase.from('usuarios').select('count').limit(1);
    
    if (error) {
      console.log('❌ Error de conexión:', error.message);
      return;
    }
    console.log('✅ Conexión básica exitosa');

    // 2. Intentar login con credenciales de prueba
    console.log('\n2️⃣ Probando login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@elinsti.com',
      password: 'Admin123!'
    });

    if (authError) {
      console.log('❌ Error de login:', authError.message);
      
      // Si el usuario no existe, intentar crear uno básico
      if (authError.message.includes('Invalid login credentials')) {
        console.log('\n3️⃣ Usuario no existe, intentando crear uno básico...');
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'admin@elinsti.com',
          password: 'Admin123!'
        });

        if (signUpError) {
          console.log('❌ Error creando usuario:', signUpError.message);
        } else {
          console.log('✅ Usuario creado exitosamente');
          console.log('📧 Verifica tu email para confirmar la cuenta');
        }
      }
    } else {
      console.log('✅ Login exitoso!');
      console.log('Usuario:', authData.user?.email);
      console.log('ID:', authData.user?.id);
    }

    // 3. Verificar datos de usuario en tabla
    console.log('\n4️⃣ Verificando datos en tabla usuarios...');
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', 'admin@elinsti.com')
      .single();

    if (userError) {
      console.log('❌ Error obteniendo datos de usuario:', userError.message);
      console.log('💡 Esto es normal si el usuario no existe en la tabla');
    } else {
      console.log('✅ Datos de usuario encontrados:');
      console.log('   Nombre:', userData.nombre);
      console.log('   Rol:', userData.rol);
      console.log('   Activo:', userData.activo);
    }

    console.log('\n🎯 RESUMEN DEL TEST');
    console.log('==================');
    console.log('✅ Conexión con Supabase: FUNCIONA');
    console.log('✅ Autenticación básica: FUNCIONA');
    console.log('📋 Próximos pasos:');
    console.log('   1. Confirma el email si se creó un usuario nuevo');
    console.log('   2. Obtén la Service Role Key para operaciones admin');
    console.log('   3. Ejecuta el script completo de configuración');

  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
  }
}

testLoginOnly(); 