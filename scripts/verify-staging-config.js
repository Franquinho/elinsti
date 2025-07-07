#!/usr/bin/env node

/**
 * Script para verificar y configurar credenciales reales de staging
 * Ejecutar: node scripts/verify-staging-config.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.staging' });

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

function logStep(step, message) {
  log(`\n${step} ${message}`, 'cyan');
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

async function verifyStagingConfig() {
  log('🔧 VERIFICACIÓN DE CONFIGURACIÓN STAGING', 'bright');
  log('==========================================', 'bright');

  // Paso 1: Verificar archivo de configuración
  logStep('1️⃣', 'Verificando archivo de configuración...');
  
  const envStagingPath = path.join(process.cwd(), '.env.staging');
  const envStagingTemplatePath = path.join(process.cwd(), 'env-staging.txt');
  
  if (!fs.existsSync(envStagingPath)) {
    if (fs.existsSync(envStagingTemplatePath)) {
      logWarning('Archivo .env.staging no encontrado');
      logInfo('Copiando plantilla...');
      fs.copyFileSync(envStagingTemplatePath, envStagingPath);
      logSuccess('Plantilla copiada a .env.staging');
      logWarning('Por favor, edita .env.staging con tus credenciales reales');
      return;
    } else {
      logError('No se encontró plantilla de configuración');
      return;
    }
  }
  
  logSuccess('Archivo .env.staging encontrado');

  // Paso 2: Verificar variables de entorno
  logStep('2️⃣', 'Verificando variables de entorno...');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL_STAGING',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING',
    'SUPABASE_SERVICE_ROLE_KEY_STAGING'
  ];

  const missingVars = [];
  const configVars = {};

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value.includes('your_') || value.includes('placeholder')) {
      missingVars.push(varName);
      configVars[varName] = '❌ NO CONFIGURADO';
    } else {
      configVars[varName] = '✅ CONFIGURADO';
    }
  }

  if (missingVars.length > 0) {
    logError(`Variables faltantes: ${missingVars.join(', ')}`);
    logInfo('Por favor, configura las siguientes variables en .env.staging:');
    missingVars.forEach(varName => {
      log(`   ${varName}`, 'yellow');
    });
    return;
  }

  logSuccess('Todas las variables de entorno configuradas');

  // Paso 3: Verificar conexión a Supabase
  logStep('3️⃣', 'Verificando conexión a Supabase...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_STAGING;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY_STAGING;

  // Cliente con clave anónima
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    logInfo('Probando conexión con clave anónima...');
    const { data: testData, error: testError } = await supabase
      .from('productos')
      .select('count')
      .limit(1);

    if (testError) {
      logError(`Error de conexión: ${testError.message}`);
      return;
    }
    
    logSuccess('Conexión con clave anónima exitosa');
  } catch (error) {
    logError(`Error inesperado: ${error.message}`);
    return;
  }

  // Cliente con clave de servicio
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    logInfo('Probando conexión con clave de servicio...');
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('usuarios')
      .select('count')
      .limit(1);

    if (adminError) {
      logError(`Error de conexión admin: ${adminError.message}`);
      return;
    }
    
    logSuccess('Conexión con clave de servicio exitosa');
  } catch (error) {
    logError(`Error inesperado admin: ${error.message}`);
    return;
  }

  // Paso 4: Verificar estructura de base de datos
  logStep('4️⃣', 'Verificando estructura de base de datos...');
  
  const requiredTables = ['usuarios', 'productos', 'eventos', 'comandas', 'comanda_items', 'caja'];
  const tableStatus = {};

  for (const tableName of requiredTables) {
    try {
      const { data, error } = await supabaseAdmin
        .from(tableName)
        .select('count')
        .limit(1);

      if (error) {
        tableStatus[tableName] = '❌ NO EXISTE';
      } else {
        tableStatus[tableName] = '✅ EXISTE';
      }
    } catch (error) {
      tableStatus[tableName] = '❌ ERROR';
    }
  }

  logInfo('Estado de tablas:');
  Object.entries(tableStatus).forEach(([table, status]) => {
    log(`   ${table}: ${status}`, status.includes('✅') ? 'green' : 'red');
  });

  // Paso 5: Generar reporte de configuración
  logStep('5️⃣', 'Generando reporte de configuración...');
  
  const report = {
    fecha: new Date().toISOString(),
    entorno: 'staging',
    version: '2.0.0-staging',
    configuracion: configVars,
    tablas: tableStatus,
    conexion: {
      anonima: '✅ Exitosa',
      servicio: '✅ Exitosa'
    },
    supabaseUrl: supabaseUrl,
    recomendaciones: []
  };

  // Verificar si faltan tablas
  const missingTables = Object.entries(tableStatus)
    .filter(([_, status]) => status.includes('❌'))
    .map(([table, _]) => table);

  if (missingTables.length > 0) {
    report.recomendaciones.push(`Ejecutar migraciones SQL para: ${missingTables.join(', ')}`);
  }

  fs.writeFileSync('staging-config-report.json', JSON.stringify(report, null, 2));
  logSuccess('Reporte generado: staging-config-report.json');

  // Paso 6: Mostrar resumen
  logStep('6️⃣', 'Resumen de configuración');
  
  log('\n🎯 CONFIGURACIÓN DE STAGING', 'bright');
  log('============================', 'bright');
  
  logInfo('📊 Estado de configuración:');
  Object.entries(configVars).forEach(([varName, status]) => {
    log(`   ${varName}: ${status}`, status.includes('✅') ? 'green' : 'red');
  });

  logInfo('🗄️ Estado de base de datos:');
  Object.entries(tableStatus).forEach(([table, status]) => {
    log(`   ${table}: ${status}`, status.includes('✅') ? 'green' : 'red');
  });

  if (missingTables.length > 0) {
    logWarning('⚠️ Acciones requeridas:');
    log('   1. Ejecutar migraciones SQL', 'yellow');
    log('   2. Ejecutar: node scripts/setup-staging.js', 'yellow');
  } else {
    logSuccess('✅ Base de datos lista para usar');
  }

  logInfo('🔗 URL de Supabase:');
  log(`   ${supabaseUrl}`, 'yellow');

  return report;
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  verifyStagingConfig().catch(console.error);
}

module.exports = { verifyStagingConfig }; 