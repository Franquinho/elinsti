require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testCompleteSystem() {
  console.log('🚀 TEST COMPLETO DEL SISTEMA');
  console.log('============================');
  
  try {
    // 1. Login
    console.log('\n1️⃣ Probando login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@elinsti.com',
      password: 'Admin123!'
    });
    
    if (authError) {
      console.log(`❌ Login falló: ${authError.message}`);
      return;
    }
    console.log(`✅ Login exitoso: ${authData.user.email}`);
    
    // 2. Verificar datos básicos
    console.log('\n2️⃣ Verificando datos...');
    
    const checks = [
      { name: 'Usuarios', query: () => supabase.from('usuarios').select('count') },
      { name: 'Productos', query: () => supabase.from('productos').select('count') },
      { name: 'Eventos', query: () => supabase.from('eventos').select('count') },
      { name: 'Evento Activo', query: () => supabase.from('eventos').select('*').eq('activo', true).limit(1) }
    ];
    
    for (const check of checks) {
      const { data, error } = await check.query();
      if (error) {
        console.log(`❌ ${check.name}: ${error.message}`);
      } else {
        console.log(`✅ ${check.name}: ${data?.length || 'OK'}`);
      }
    }
    
    console.log('\n🏁 Sistema listo para usar');
    console.log('\n📋 CREDENCIALES DE LOGIN:');
    console.log('Email: admin@elinsti.com');
    console.log('Contraseña: Admin123!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCompleteSystem().catch(console.error); 