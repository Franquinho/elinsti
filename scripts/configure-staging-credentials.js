#!/usr/bin/env node

/**
 * Script interactivo para configurar credenciales de staging
 * Ejecutar: node scripts/configure-staging-credentials.js
 */

const fs = require('fs');
const readline = require('readline');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logStep(step, message) {
  log(`\n${step} ${message}`, 'cyan');
}

async function configureStagingCredentials() {
  log('🔧 CONFIGURACIÓN INTERACTIVA DE CREDENCIALES STAGING', 'bright');
  log('==================================================', 'bright');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  try {
    logStep('1️⃣', 'Configurando credenciales de Supabase Staging');
    
    logInfo('Para obtener las credenciales:');
    log('   1. Ve a https://supabase.com', 'yellow');
    log('   2. Crea un nuevo proyecto llamado "el-insti-staging"', 'yellow');
    log('   3. Ve a Settings > API', 'yellow');
    log('   4. Copia las credenciales', 'yellow');

    const supabaseUrl = await question('\n🌐 Project URL (ej: https://abc123.supabase.co): ');
    const supabaseAnonKey = await question('🔑 anon public key: ');
    const supabaseServiceKey = await question('🔐 service_role key: ');

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      logError('Todas las credenciales son requeridas');
      rl.close();
      return;
    }

    // Validar formato de URL
    if (!supabaseUrl.includes('supabase.co')) {
      logWarning('La URL no parece ser de Supabase. Verifica que sea correcta.');
    }

    // Validar formato de claves
    if (supabaseAnonKey.length < 50) {
      logWarning('La clave anónima parece ser muy corta. Verifica que sea correcta.');
    }

    if (supabaseServiceKey.length < 50) {
      logWarning('La clave de servicio parece ser muy corta. Verifica que sea correcta.');
    }

    logStep('2️⃣', 'Actualizando archivo .env.staging');

    // Leer el archivo actual
    const envPath = '.env.staging';
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Reemplazar las credenciales
    envContent = envContent.replace(
      'NEXT_PUBLIC_SUPABASE_URL_STAGING=https://your-staging-project.supabase.co',
      `NEXT_PUBLIC_SUPABASE_URL_STAGING=${supabaseUrl}`
    );

    envContent = envContent.replace(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING=your_staging_anon_key_here',
      `NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING=${supabaseAnonKey}`
    );

    envContent = envContent.replace(
      'SUPABASE_SERVICE_ROLE_KEY_STAGING=your_staging_service_role_key_here',
      `SUPABASE_SERVICE_ROLE_KEY_STAGING=${supabaseServiceKey}`
    );

    // Escribir el archivo actualizado
    fs.writeFileSync(envPath, envContent);

    logSuccess('Archivo .env.staging actualizado correctamente');

    logStep('3️⃣', 'Verificando configuración');

    // Verificar que las variables se cargaron correctamente
    require('dotenv').config({ path: '.env.staging' });

    const loadedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_STAGING;
    const loadedAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING;
    const loadedServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY_STAGING;

    if (loadedUrl && loadedAnonKey && loadedServiceKey) {
      logSuccess('Variables de entorno cargadas correctamente');
      
      logInfo('📋 Resumen de configuración:');
      log(`   URL: ${loadedUrl}`, 'yellow');
      log(`   Anon Key: ${loadedAnonKey.substring(0, 20)}...`, 'yellow');
      log(`   Service Key: ${loadedServiceKey.substring(0, 20)}...`, 'yellow');
    } else {
      logError('Error cargando variables de entorno');
      rl.close();
      return;
    }

    logStep('4️⃣', 'Próximos pasos');

    logInfo('Ahora puedes ejecutar:');
    log('   node scripts/verify-staging-config.js', 'yellow');
    log('   node scripts/complete-staging-setup.js', 'yellow');

    logSuccess('Configuración de credenciales completada');

  } catch (error) {
    logError(`Error: ${error.message}`);
  } finally {
    rl.close();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  configureStagingCredentials().catch(console.error);
}

module.exports = { configureStagingCredentials }; 