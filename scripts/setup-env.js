const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 CONFIGURADOR DE VARIABLES DE ENTORNO - EL INSTI\n');
console.log('=' .repeat(60));

console.log('📋 INSTRUCCIONES:');
console.log('1. Ve a tu proyecto Supabase Dashboard');
console.log('2. Navega a Settings > API');
console.log('3. Copia los valores que te solicite este script');
console.log('4. Si no tienes un proyecto Supabase, crea uno en https://supabase.com\n');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEnvironment() {
  try {
    // Solicitar URL de Supabase
    const supabaseUrl = await question('🌐 URL de tu proyecto Supabase (ej: https://abc123.supabase.co): ');
    
    if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
      console.log('❌ URL inválida. Debe ser una URL real de Supabase.');
      rl.close();
      return;
    }

    // Solicitar Anon Key
    const anonKey = await question('🔑 Anon Key (clave pública): ');
    
    if (!anonKey || anonKey.includes('placeholder')) {
      console.log('❌ Anon Key inválida. Debe ser una clave real.');
      rl.close();
      return;
    }

    // Solicitar Service Role Key
    const serviceKey = await question('🔐 Service Role Key (clave privada): ');
    
    if (!serviceKey || serviceKey.includes('placeholder')) {
      console.log('❌ Service Role Key inválida. Debe ser una clave real.');
      rl.close();
      return;
    }

    // Crear contenido del archivo .env.local
    const envContent = `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}
SUPABASE_SERVICE_ROLE_KEY=${serviceKey}`;

    // Escribir archivo
    fs.writeFileSync('.env.local', envContent);
    
    console.log('\n✅ Archivo .env.local actualizado correctamente!');
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('1. Ejecuta el script SQL en Supabase SQL Editor');
    console.log('2. Ejecuta: node scripts/check-database-status.js');
    console.log('3. Inicia el servidor: npm run dev');
    
    // Verificar conexión
    console.log('\n🔍 Verificando conexión...');
    
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, anonKey);
    
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.log('⚠️ Conexión exitosa pero tabla "eventos" no existe');
          console.log('   Ejecuta el script SQL en Supabase para crear las tablas');
        } else {
          console.log(`⚠️ Conexión con advertencia: ${error.message}`);
        }
      } else {
        console.log('✅ Conexión exitosa a Supabase!');
      }
    } catch (err) {
      console.log(`❌ Error de conexión: ${err.message}`);
    }

  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
  } finally {
    rl.close();
  }
}

setupEnvironment(); 