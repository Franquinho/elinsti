#!/usr/bin/env node

/**
 * Script para ejecutar smoke tests contra endpoints de staging
 * Ejecutar: node scripts/smoke-test-staging.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
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

function logResponse(status, message) {
  const color = status >= 200 && status < 300 ? 'green' : 
                status >= 400 && status < 500 ? 'yellow' : 'red';
  log(`   ${status} - ${message}`, color);
}

async function runSmokeTests() {
  log('🧪 SMOKE TESTS - STAGING', 'bright');
  log('========================', 'bright');

  const baseUrl = 'http://localhost:3002';
  const results = {
    fecha: new Date().toISOString(),
    entorno: 'staging',
    tests: [],
    resumen: {
      total: 0,
      exitosos: 0,
      fallidos: 0
    }
  };

  // Función para ejecutar CURL
  function executeCurl(url, method = 'GET', data = null, headers = {}) {
    try {
      const defaultHeaders = {
        'Content-Type': 'application/json',
        ...headers
      };

      let curlCommand = `curl -s -w "\\nHTTPSTATUS:%{http_code}\\n" -X ${method} "${url}"`;
      
      // Agregar headers
      Object.entries(defaultHeaders).forEach(([key, value]) => {
        curlCommand += ` -H "${key}: ${value}"`;
      });

      // Agregar datos si existen
      if (data) {
        curlCommand += ` -d '${JSON.stringify(data)}'`;
      }

      const output = execSync(curlCommand, { encoding: 'utf8' });
      const lines = output.split('\n');
      const statusLine = lines.find(line => line.startsWith('HTTPSTATUS:'));
      const status = statusLine ? parseInt(statusLine.split(':')[1]) : 0;
      const response = lines.slice(0, -2).join('\n');

      return { status, response, success: true };
    } catch (error) {
      return { 
        status: 0, 
        response: error.message, 
        success: false 
      };
    }
  }

  // Test 1: Verificar que el servidor esté corriendo
  logStep('1️⃣', 'Verificando servidor...');
  
  const serverTest = executeCurl(`${baseUrl}/api/health`);
  results.tests.push({
    nombre: 'Servidor corriendo',
    url: `${baseUrl}/api/health`,
    status: serverTest.status,
    success: serverTest.success && serverTest.status === 200
  });

  if (serverTest.success && serverTest.status === 200) {
    logSuccess('Servidor respondiendo correctamente');
  } else {
    logError('Servidor no responde. Asegúrate de ejecutar: npm run dev');
    logInfo('Iniciando servidor...');
    try {
      execSync('npm run dev', { stdio: 'pipe', timeout: 10000 });
      logInfo('Esperando 5 segundos para que el servidor inicie...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      logWarning('No se pudo iniciar el servidor automáticamente');
    }
  }

  // Test 2: Login válido
  logStep('2️⃣', 'Probando login válido...');
  
  const validLoginData = {
    email: 'admin@elinsti.com',
    password: 'Admin123!'
  };

  const validLoginTest = executeCurl(
    `${baseUrl}/api/auth/login`,
    'POST',
    validLoginData
  );

  results.tests.push({
    nombre: 'Login válido',
    url: `${baseUrl}/api/auth/login`,
    status: validLoginTest.status,
    success: validLoginTest.success && validLoginTest.status === 200
  });

  if (validLoginTest.success && validLoginTest.status === 200) {
    logSuccess('Login válido exitoso');
    try {
      const responseData = JSON.parse(validLoginTest.response);
      if (responseData.user) {
        logInfo(`Usuario autenticado: ${responseData.user.nombre}`);
      }
    } catch (e) {
      logWarning('No se pudo parsear respuesta JSON');
    }
  } else {
    logError(`Login válido falló: ${validLoginTest.status}`);
    logResponse(validLoginTest.status, validLoginTest.response);
  }

  // Test 3: Login inválido
  logStep('3️⃣', 'Probando login inválido...');
  
  const invalidLoginData = {
    email: 'admin@elinsti.com',
    password: 'password_incorrecto'
  };

  const invalidLoginTest = executeCurl(
    `${baseUrl}/api/auth/login`,
    'POST',
    invalidLoginData
  );

  results.tests.push({
    nombre: 'Login inválido',
    url: `${baseUrl}/api/auth/login`,
    status: invalidLoginTest.status,
    success: invalidLoginTest.success && invalidLoginTest.status === 401
  });

  if (invalidLoginTest.success && invalidLoginTest.status === 401) {
    logSuccess('Login inválido rechazado correctamente');
  } else {
    logError(`Login inválido no funcionó como esperado: ${invalidLoginTest.status}`);
    logResponse(invalidLoginTest.status, invalidLoginTest.response);
  }

  // Test 4: Listar productos
  logStep('4️⃣', 'Probando listar productos...');
  
  const productosTest = executeCurl(`${baseUrl}/api/productos/list`);
  
  results.tests.push({
    nombre: 'Listar productos',
    url: `${baseUrl}/api/productos/list`,
    status: productosTest.status,
    success: productosTest.success && productosTest.status === 200
  });

  if (productosTest.success && productosTest.status === 200) {
    logSuccess('Listar productos exitoso');
    try {
      const responseData = JSON.parse(productosTest.response);
      if (responseData.productos) {
        logInfo(`Productos encontrados: ${responseData.productos.length}`);
      }
    } catch (e) {
      logWarning('No se pudo parsear respuesta JSON');
    }
  } else {
    logError(`Listar productos falló: ${productosTest.status}`);
    logResponse(productosTest.status, productosTest.response);
  }

  // Test 5: Listar eventos
  logStep('5️⃣', 'Probando listar eventos...');
  
  const eventosTest = executeCurl(`${baseUrl}/api/eventos`);
  
  results.tests.push({
    nombre: 'Listar eventos',
    url: `${baseUrl}/api/eventos`,
    status: eventosTest.status,
    success: eventosTest.success && eventosTest.status === 200
  });

  if (eventosTest.success && eventosTest.status === 200) {
    logSuccess('Listar eventos exitoso');
    try {
      const responseData = JSON.parse(eventosTest.response);
      if (responseData.eventos) {
        logInfo(`Eventos encontrados: ${responseData.eventos.length}`);
      }
    } catch (e) {
      logWarning('No se pudo parsear respuesta JSON');
    }
  } else {
    logError(`Listar eventos falló: ${eventosTest.status}`);
    logResponse(eventosTest.status, eventosTest.response);
  }

  // Test 6: Crear comanda (sin autenticación debería fallar)
  logStep('6️⃣', 'Probando crear comanda sin autenticación...');
  
  const comandaData = {
    cliente_nombre: 'Cliente Test',
    productos: [
      { id: 1, cantidad: 2, precio_unitario: 1500 }
    ],
    total: 3000,
    metodo_pago: 'efectivo'
  };

  const comandaTest = executeCurl(
    `${baseUrl}/api/comandas/create`,
    'POST',
    comandaData
  );

  results.tests.push({
    nombre: 'Crear comanda sin auth',
    url: `${baseUrl}/api/comandas/create`,
    status: comandaTest.status,
    success: comandaTest.success && (comandaTest.status === 401 || comandaTest.status === 403)
  });

  if (comandaTest.success && (comandaTest.status === 401 || comandaTest.status === 403)) {
    logSuccess('Crear comanda sin autenticación rechazado correctamente');
  } else {
    logError(`Crear comanda sin auth no funcionó como esperado: ${comandaTest.status}`);
    logResponse(comandaTest.status, comandaTest.response);
  }

  // Test 7: Obtener estadísticas
  logStep('7️⃣', 'Probando obtener estadísticas...');
  
  const statsTest = executeCurl(`${baseUrl}/api/stats`);
  
  results.tests.push({
    nombre: 'Obtener estadísticas',
    url: `${baseUrl}/api/stats`,
    status: statsTest.status,
    success: statsTest.success && statsTest.status === 200
  });

  if (statsTest.success && statsTest.status === 200) {
    logSuccess('Obtener estadísticas exitoso');
    try {
      const responseData = JSON.parse(statsTest.response);
      if (responseData.stats) {
        logInfo('Estadísticas obtenidas correctamente');
      }
    } catch (e) {
      logWarning('No se pudo parsear respuesta JSON');
    }
  } else {
    logError(`Obtener estadísticas falló: ${statsTest.status}`);
    logResponse(statsTest.status, statsTest.response);
  }

  // Test 8: Endpoint inexistente (debería devolver 404)
  logStep('8️⃣', 'Probando endpoint inexistente...');
  
  const notFoundTest = executeCurl(`${baseUrl}/api/endpoint-inexistente`);
  
  results.tests.push({
    nombre: 'Endpoint inexistente',
    url: `${baseUrl}/api/endpoint-inexistente`,
    status: notFoundTest.status,
    success: notFoundTest.success && notFoundTest.status === 404
  });

  if (notFoundTest.success && notFoundTest.status === 404) {
    logSuccess('Endpoint inexistente devuelve 404 correctamente');
  } else {
    logError(`Endpoint inexistente no devuelve 404: ${notFoundTest.status}`);
    logResponse(notFoundTest.status, notFoundTest.response);
  }

  // Calcular resumen
  results.resumen.total = results.tests.length;
  results.resumen.exitosos = results.tests.filter(t => t.success).length;
  results.resumen.fallidos = results.tests.filter(t => !t.success).length;

  // Generar reporte
  logStep('📊', 'Generando reporte de smoke tests...');
  
  fs.writeFileSync('smoke-test-report.json', JSON.stringify(results, null, 2));
  logSuccess('Reporte generado: smoke-test-report.json');

  // Mostrar resumen
  logStep('📋', 'Resumen de smoke tests');
  
  log('\n🎯 RESULTADOS DE SMOKE TESTS', 'bright');
  log('============================', 'bright');
  
  results.tests.forEach(test => {
    const status = test.success ? '✅' : '❌';
    log(`${status} ${test.nombre}: ${test.status}`, test.success ? 'green' : 'red');
  });

  log('\n📊 MÉTRICAS:', 'bright');
  log(`   Total: ${results.resumen.total}`, 'blue');
  log(`   Exitosos: ${results.resumen.exitosos}`, 'green');
  log(`   Fallidos: ${results.resumen.fallidos}`, 'red');
  log(`   Tasa de éxito: ${((results.resumen.exitosos / results.resumen.total) * 100).toFixed(1)}%`, 'cyan');

  if (results.resumen.fallidos === 0) {
    log('\n🎉 ¡TODOS LOS TESTS PASARON!', 'bright');
    log('El entorno de staging está listo para QA real.', 'green');
  } else {
    log('\n⚠️ ALGUNOS TESTS FALLARON', 'bright');
    log('Revisa los errores antes de continuar con QA.', 'yellow');
  }

  return results;
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  runSmokeTests().catch(console.error);
}

module.exports = { runSmokeTests }; 