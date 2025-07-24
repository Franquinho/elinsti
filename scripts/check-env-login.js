require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkEnvLogin() {
  console.log('🔍 VERIFICANDO VARIABLES DE ENTORNO');
  console.log('===================================');
  
  // Obtener variables de entorno
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('\n📋 Variables de entorno:');
  console.log('URL:', url || 'NO ENCONTRADA');
  console.log('Anon Key:', anonKey ? `${anonKey.substring(0, 20)}...` : 'NO ENCONTRADA');
  
  if (!url || !anonKey) {
    console.log('\n❌ Faltan variables de entorno!');
    console.log('Asegúrate de tener un archivo .env.local con:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_aqui');
    return;
  }
  
  // Crear cliente con variables de entorno
  const supabase = createClient(url, anonKey);
  
  console.log('\n🔧 Probando conexión con variables de entorno...');
  
  try {
    const { data, error } = await supabase.from('usuarios').select('count').limit(1);
    if (error) {
      console.log('❌ Error de conexión:', error.message);
      return;
    }
    console.log('✅ Conexión exitosa con variables de entorno');
    
    // Intentar login
    console.log('\n🔐 Intentando login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@elinsti.com',
      password: 'Admin123!'
    });
    
    if (authError) {
      console.log('❌ Error de login:', authError.message);
    } else {
      console.log('✅ Login exitoso!');
      console.log('Usuario:', authData.user?.email);
    }
    
  } catch (err) {
    console.log('❌ Error inesperado:', err.message);
  }
}

checkEnvLogin().catch(console.error); 