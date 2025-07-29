const https = require('https');

function makeRequest(hostname, path, method, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    
    const options = {
      hostname,
      port: 443,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsed,
            success: res.statusCode >= 200 && res.statusCode < 300 && parsed.success !== false
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData,
            success: false
          });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(postData);
    }
    req.end();
  });
}

async function testFrontendEndpoints() {
  console.log('🧪 TEST FRONTEND - ENDPOINTS CRÍTICOS');
  console.log('=======================================\n');

  const baseUrl = 'elinsti.vercel.app';
  let testResults = [];

  // 1. Test página principal
  console.log('1. Probando página principal...');
  try {
    const result = await makeRequest(baseUrl, '/', 'GET');
    console.log(`   Status: ${result.status}`);
    if (result.status === 200) {
      console.log('   ✅ Página principal accesible');
      testResults.push({ test: 'Página Principal', success: true });
    } else {
      console.log('   ❌ Página principal no accesible');
      testResults.push({ test: 'Página Principal', success: false });
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    testResults.push({ test: 'Página Principal', success: false });
  }

  // 2. Test API de productos
  console.log('\n2. Probando API de productos...');
  try {
    const result = await makeRequest(baseUrl, '/api/productos/list', 'GET');
    console.log(`   Status: ${result.status}`);
    if (result.success) {
      console.log('   ✅ API de productos funcionando');
      testResults.push({ test: 'API Productos', success: true });
    } else {
      console.log('   ❌ API de productos con error');
      testResults.push({ test: 'API Productos', success: false });
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    testResults.push({ test: 'API Productos', success: false });
  }

  // 3. Test API de eventos
  console.log('\n3. Probando API de eventos...');
  try {
    const result = await makeRequest(baseUrl, '/api/eventos', 'GET');
    console.log(`   Status: ${result.status}`);
    if (result.success) {
      console.log('   ✅ API de eventos funcionando');
      testResults.push({ test: 'API Eventos', success: true });
    } else {
      console.log('   ❌ API de eventos con error');
      testResults.push({ test: 'API Eventos', success: false });
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    testResults.push({ test: 'API Eventos', success: false });
  }

  // 4. Test API de comandas
  console.log('\n4. Probando API de comandas...');
  try {
    const result = await makeRequest(baseUrl, '/api/comandas/list', 'GET');
    console.log(`   Status: ${result.status}`);
    if (result.success) {
      console.log('   ✅ API de comandas funcionando');
      testResults.push({ test: 'API Comandas', success: true });
    } else {
      console.log('   ❌ API de comandas con error');
      testResults.push({ test: 'API Comandas', success: false });
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    testResults.push({ test: 'API Comandas', success: false });
  }

  // 5. Test creación de producto
  console.log('\n5. Probando creación de producto...');
  try {
    const productoData = {
      nombre: "Test Frontend",
      precio: 1000,
      emoji: "🧪",
      activo: true
    };

    const result = await makeRequest(baseUrl, '/api/productos', 'POST', productoData);
    console.log(`   Status: ${result.status}`);
    if (result.success && result.data.producto) {
      console.log(`   ✅ Producto creado: ID ${result.data.producto.id}`);
      testResults.push({ test: 'Crear Producto', success: true });
      
      // Limpiar producto creado
      await makeRequest(baseUrl, `/api/productos/${result.data.producto.id}`, 'DELETE');
      console.log('   🧹 Producto de prueba eliminado');
    } else {
      console.log(`   ❌ Error creando producto: ${result.data.message}`);
      testResults.push({ test: 'Crear Producto', success: false });
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    testResults.push({ test: 'Crear Producto', success: false });
  }

  // 6. Test creación de evento
  console.log('\n6. Probando creación de evento...');
  try {
    const eventoData = {
      nombre: "Test Frontend Evento",
      descripcion: "Evento de prueba frontend",
      fecha_inicio: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      fecha_fin: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      capacidad_maxima: 50,
      precio_entrada: 5000,
      ubicacion: "Test",
      activo: false
    };

    const result = await makeRequest(baseUrl, '/api/eventos', 'POST', eventoData);
    console.log(`   Status: ${result.status}`);
    if (result.success && result.data.evento) {
      console.log(`   ✅ Evento creado: ID ${result.data.evento.id}`);
      testResults.push({ test: 'Crear Evento', success: true });
      
      // Limpiar evento creado
      await makeRequest(baseUrl, `/api/eventos?id=${result.data.evento.id}`, 'DELETE');
      console.log('   🧹 Evento de prueba eliminado');
    } else {
      console.log(`   ❌ Error creando evento: ${result.data.message}`);
      testResults.push({ test: 'Crear Evento', success: false });
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    testResults.push({ test: 'Crear Evento', success: false });
  }

  // Resumen final
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE TESTS FRONTEND');
  console.log('='.repeat(50));
  
  const successful = testResults.filter(r => r.success).length;
  const total = testResults.length;
  
  testResults.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${result.test}`);
  });

  console.log('\n' + '='.repeat(50));
  console.log(`📈 RESULTADO: ${successful}/${total} tests exitosos`);
  
  if (successful === total) {
    console.log('🎉 ¡TODOS LOS ENDPOINTS FUNCIONAN CORRECTAMENTE!');
    console.log('✅ El sistema está listo para uso desde el frontend');
  } else {
    console.log('⚠️ HAY PROBLEMAS EN ALGUNOS ENDPOINTS');
    console.log('🔧 Revisar los endpoints que fallaron');
  }

  return testResults;
}

testFrontendEndpoints().catch(console.error); 