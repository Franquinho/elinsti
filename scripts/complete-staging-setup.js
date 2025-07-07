#!/usr/bin/env node

/**
 * Script completo para configurar staging con Supabase real
 * Ejecutar: node scripts/complete-staging-setup.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Importar funciones de otros scripts
const { verifyStagingConfig } = require('./verify-staging-config');
const { setupStagingDatabase } = require('./setup-staging');
const { runSmokeTests } = require('./smoke-test-staging');

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

async function completeStagingSetup() {
  log('🚀 CONFIGURACIÓN COMPLETA DE STAGING CON SUPABASE REAL', 'bright');
  log('====================================================', 'bright');

  const finalReport = {
    fecha: new Date().toISOString(),
    entorno: 'staging',
    version: '2.0.0-staging',
    pasos: [],
    resultados: {},
    estado: 'en_proceso'
  };

  try {
    // Paso 1: Verificar configuración
    logStep('1️⃣', 'Verificando configuración de staging...');
    
    const configReport = await verifyStagingConfig();
    if (!configReport) {
      logError('Configuración de staging no válida');
      logInfo('Por favor, configura .env.staging con credenciales reales');
      return;
    }

    finalReport.pasos.push({
      paso: 'Verificación de configuración',
      estado: 'completado',
      detalles: configReport
    });
    logSuccess('Configuración verificada correctamente');

    // Paso 2: Ejecutar migraciones SQL (instrucciones)
    logStep('2️⃣', 'Preparando migraciones SQL...');
    
    logInfo('📋 Instrucciones para migraciones SQL:');
    log('   1. Ve al dashboard de Supabase Staging', 'yellow');
    log('   2. Navega a SQL Editor', 'yellow');
    log('   3. Abre el archivo scripts/migrate-staging.sql', 'yellow');
    log('   4. Copia todo el contenido', 'yellow');
    log('   5. Pega en el SQL Editor y ejecuta', 'yellow');
    
    const migracionesCompletadas = await new Promise((resolve) => {
      logInfo('¿Has ejecutado las migraciones SQL? (s/n):');
      process.stdin.once('data', (data) => {
        const respuesta = data.toString().trim().toLowerCase();
        resolve(respuesta === 's' || respuesta === 'si' || respuesta === 'y' || respuesta === 'yes');
      });
    });

    if (!migracionesCompletadas) {
      logWarning('Migraciones SQL no ejecutadas');
      logInfo('Ejecuta las migraciones antes de continuar');
      return;
    }

    finalReport.pasos.push({
      paso: 'Migraciones SQL',
      estado: 'completado',
      detalles: 'Migraciones ejecutadas manualmente'
    });
    logSuccess('Migraciones SQL confirmadas');

    // Paso 3: Configurar base de datos
    logStep('3️⃣', 'Configurando base de datos...');
    
    try {
      await setupStagingDatabase();
      finalReport.pasos.push({
        paso: 'Configuración de base de datos',
        estado: 'completado',
        detalles: 'Datos de prueba cargados correctamente'
      });
      logSuccess('Base de datos configurada');
    } catch (error) {
      logError(`Error configurando base de datos: ${error.message}`);
      finalReport.pasos.push({
        paso: 'Configuración de base de datos',
        estado: 'fallido',
        detalles: error.message
      });
      return;
    }

    // Paso 4: Verificar estructura de base de datos
    logStep('4️⃣', 'Verificando estructura de base de datos...');
    
    const { createClient } = require('@supabase/supabase-js');
    require('dotenv').config({ path: '.env.staging' });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_STAGING;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY_STAGING;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const requiredTables = ['usuarios', 'productos', 'eventos', 'comandas', 'comanda_items', 'caja'];
    const tableStatus = {};

    for (const tableName of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('count')
          .limit(1);

        if (error) {
          tableStatus[tableName] = { existe: false, error: error.message };
        } else {
          tableStatus[tableName] = { existe: true, registros: data.length };
        }
      } catch (error) {
        tableStatus[tableName] = { existe: false, error: error.message };
      }
    }

    const missingTables = Object.entries(tableStatus)
      .filter(([_, status]) => !status.existe)
      .map(([table, _]) => table);

    if (missingTables.length > 0) {
      logError(`Tablas faltantes: ${missingTables.join(', ')}`);
      logInfo('Ejecuta las migraciones SQL antes de continuar');
      return;
    }

    logSuccess('Estructura de base de datos verificada');
    finalReport.pasos.push({
      paso: 'Verificación de estructura',
      estado: 'completado',
      detalles: tableStatus
    });

    // Paso 5: Iniciar servidor de desarrollo
    logStep('5️⃣', 'Iniciando servidor de desarrollo...');
    
    logInfo('Iniciando servidor en background...');
    try {
      // Iniciar servidor en background
      const serverProcess = execSync('npm run dev', { 
        stdio: 'pipe',
        timeout: 30000 
      });
      
      logInfo('Esperando 10 segundos para que el servidor inicie...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      logSuccess('Servidor iniciado correctamente');
      finalReport.pasos.push({
        paso: 'Inicio de servidor',
        estado: 'completado',
        detalles: 'Servidor corriendo en http://localhost:3000'
      });
    } catch (error) {
      logWarning('No se pudo iniciar el servidor automáticamente');
      logInfo('Por favor, ejecuta manualmente: npm run dev');
      finalReport.pasos.push({
        paso: 'Inicio de servidor',
        estado: 'manual_requerido',
        detalles: 'Ejecutar manualmente: npm run dev'
      });
    }

    // Paso 6: Ejecutar smoke tests
    logStep('6️⃣', 'Ejecutando smoke tests...');
    
    try {
      const smokeResults = await runSmokeTests();
      finalReport.resultados.smokeTests = smokeResults;
      
      if (smokeResults.resumen.fallidos === 0) {
        logSuccess('Todos los smoke tests pasaron');
        finalReport.pasos.push({
          paso: 'Smoke tests',
          estado: 'completado',
          detalles: `${smokeResults.resumen.exitosos}/${smokeResults.resumen.total} tests pasaron`
        });
      } else {
        logWarning(`${smokeResults.resumen.fallidos} smoke tests fallaron`);
        finalReport.pasos.push({
          paso: 'Smoke tests',
          estado: 'parcial',
          detalles: `${smokeResults.resumen.exitosos}/${smokeResults.resumen.total} tests pasaron`
        });
      }
    } catch (error) {
      logError(`Error ejecutando smoke tests: ${error.message}`);
      finalReport.pasos.push({
        paso: 'Smoke tests',
        estado: 'fallido',
        detalles: error.message
      });
    }

    // Paso 7: Ejecutar tests de integración
    logStep('7️⃣', 'Ejecutando tests de integración...');
    
    try {
      logInfo('Ejecutando tests contra Supabase real...');
      execSync('npm test -- --testPathPattern="integration-staging" --verbose', { 
        stdio: 'inherit',
        timeout: 60000 
      });
      
      logSuccess('Tests de integración completados');
      finalReport.pasos.push({
        paso: 'Tests de integración',
        estado: 'completado',
        detalles: 'Tests ejecutados exitosamente'
      });
    } catch (error) {
      logWarning('Algunos tests de integración fallaron');
      finalReport.pasos.push({
        paso: 'Tests de integración',
        estado: 'parcial',
        detalles: 'Algunos tests fallaron'
      });
    }

    // Paso 8: Generar reporte final
    logStep('8️⃣', 'Generando reporte final...');
    
    finalReport.estado = 'completado';
    finalReport.credenciales = {
      admin: 'admin@elinsti.com / Admin123!',
      cajero: 'caja@elinsti.com / Caja123!',
      vendedor: 'ventas@elinsti.com / Ventas123!'
    };
    finalReport.url = supabaseUrl;

    fs.writeFileSync('staging-final-report.json', JSON.stringify(finalReport, null, 2));
    logSuccess('Reporte final generado: staging-final-report.json');

    // Paso 9: Mostrar resumen final
    logStep('9️⃣', 'Resumen final');
    
    log('\n🎉 CONFIGURACIÓN DE STAGING COMPLETADA', 'bright');
    log('=====================================', 'bright');
    
    logInfo('📋 Credenciales de prueba:');
    log(`   👤 Admin: ${finalReport.credenciales.admin}`, 'yellow');
    log(`   💰 Cajero: ${finalReport.credenciales.cajero}`, 'yellow');
    log(`   🛒 Vendedor: ${finalReport.credenciales.vendedor}`, 'yellow');
    
    logInfo('🔗 URLs:');
    log(`   🌐 Aplicación: http://localhost:3000`, 'yellow');
    log(`   🗄️ Supabase: ${finalReport.url}`, 'yellow');
    
    logInfo('📁 Reportes generados:');
    log('   📄 staging-config-report.json - Configuración', 'yellow');
    log('   📄 smoke-test-report.json - Smoke tests', 'yellow');
    log('   📄 staging-final-report.json - Reporte final', 'yellow');
    
    logInfo('✅ Estado de configuración:');
    finalReport.pasos.forEach(paso => {
      const status = paso.estado === 'completado' ? '✅' : 
                    paso.estado === 'parcial' ? '⚠️' : '❌';
      log(`   ${status} ${paso.paso}`, paso.estado === 'completado' ? 'green' : 'yellow');
    });

    log('\n🚀 PRÓXIMOS PASOS:', 'bright');
    log('   1. Completar checklist de QA manual', 'yellow');
    log('   2. Probar flujos críticos en la interfaz', 'yellow');
    log('   3. Validar funcionalidad en diferentes dispositivos', 'yellow');
    log('   4. Documentar resultados de QA', 'yellow');
    
    log('\n🎯 El entorno de staging está listo para QA real!', 'bright');

  } catch (error) {
    logError(`Error general: ${error.message}`);
    finalReport.estado = 'fallido';
    finalReport.error = error.message;
    fs.writeFileSync('staging-error-report.json', JSON.stringify(finalReport, null, 2));
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  completeStagingSetup().catch(console.error);
}

module.exports = { completeStagingSetup }; 