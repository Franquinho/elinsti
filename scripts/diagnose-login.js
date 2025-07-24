const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const SUPABASE_URL = 'https://joebhvyfcftobrngcqor.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZWJodnlmY2JybmdjcW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MzY5MzMsImV4cCI6MjA2NjAxMjkzM30.zyzj1pZLDboSnRYVtpYUhsrKkDAcPwVVzbohmQvBhoE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function diagnoseLogin() {
  console.log('🔍 DIAGNÓSTICO DE LOGIN');
  console.log('========================');
  
  // 1. Verificar configuración
  console.log('\n1️⃣ Verificando configuración...');
  console.log('URL:', SUPABASE_URL);
  console.log('Anon Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');
  
  // 2. Probar conexión básica
  console.log('\n2️⃣ Probando conexión básica...');
  try {
    const { data, error } = await supabase.from('usuarios').select('count').limit(1);
    if (error) {
      console.log('❌ Error de conexión:', error.message);
      return;
    }
    console.log('✅ Conexión exitosa');
  } catch (err) {
    console.log('❌ Error inesperado:', err.message);
    return;
  }
  
  // 3. Verificar si el usuario existe en la tabla usuarios
  console.log('\n3️⃣ Verificando usuario en tabla usuarios...');
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email, rol, activo')
      .eq('email', 'admin@elinsti.com')
      .single();
    
    if (error) {
      console.log('❌ Error consultando usuarios:', error.message);
    } else if (data) {
      console.log('✅ Usuario encontrado en tabla usuarios:');
      console.log('  - ID:', data.id);
      console.log('  - Nombre:', data.nombre);
      console.log('  - Email:', data.email);
      console.log('  - Rol:', data.rol);
      console.log('  - Activo:', data.activo);
    } else {
      console.log('❌ Usuario NO encontrado en tabla usuarios');
    }
  } catch (err) {
    console.log('❌ Error inesperado:', err.message);
  }
  
  // 4. Intentar login directo con Supabase
  console.log('\n4️⃣ Intentando login directo...');
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@elinsti.com',
      password: 'Admin123!'
    });
    
    if (error) {
      console.log('❌ Error de login:', error.message);
      console.log('  - Código:', error.status);
      console.log('  - Detalles:', error);
    } else {
      console.log('✅ Login exitoso!');
      console.log('  - User ID:', data.user?.id);
      console.log('  - Email:', data.user?.email);
      console.log('  - Session:', !!data.session);
    }
  } catch (err) {
    console.log('❌ Error inesperado en login:', err.message);
  }
  
  // 5. Verificar configuración de auth
  console.log('\n5️⃣ Verificando configuración de auth...');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('❌ Error obteniendo sesión:', error.message);
    } else {
      console.log('✅ Sesión actual:', data.session ? 'Activa' : 'No hay sesión');
    }
  } catch (err) {
    console.log('❌ Error inesperado:', err.message);
  }
  
  console.log('\n🏁 Diagnóstico completado');
}

// Ejecutar diagnóstico
diagnoseLogin().catch(console.error); 