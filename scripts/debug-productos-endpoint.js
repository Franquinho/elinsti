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

async function debugProductosEndpoint() {
  console.log('🔍 DEBUG ENDPOINT PRODUCTOS');
  console.log('============================\n');

  const baseUrl = 'elinsti.vercel.app';

  // Test 1: Verificar que el endpoint responde
  console.log('1. Verificando que el endpoint responde...');
  try {
    const result = await makeRequest(baseUrl, '/api/productos', 'GET');
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, result.data);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 2: Probar con datos mínimos
  console.log('\n2. Probando con datos mínimos...');
  try {
    const productoData = {
      nombre: "Test Debug",
      precio: 1000
    };

    const result = await makeRequest(baseUrl, '/api/productos', 'POST', productoData);
    console.log(`   Status: ${result.status}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Response:`, result.data);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 3: Probar con datos completos
  console.log('\n3. Probando con datos completos...');
  try {
    const productoData = {
      nombre: "Test Debug Completo",
      precio: 2000,
      emoji: "🔍",
      activo: true
    };

    const result = await makeRequest(baseUrl, '/api/productos', 'POST', productoData);
    console.log(`   Status: ${result.status}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Response:`, result.data);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 4: Probar con nombre duplicado
  console.log('\n4. Probando con nombre duplicado...');
  try {
    const productoData = {
      nombre: "Cerveza",
      precio: 3000
    };

    const result = await makeRequest(baseUrl, '/api/productos', 'POST', productoData);
    console.log(`   Status: ${result.status}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Response:`, result.data);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n🔍 ANÁLISIS DEL PROBLEMA:');
  console.log('Si el status es 500, el problema está en el servidor.');
  console.log('Si el status es 400, el problema está en la validación.');
  console.log('Si el status es 200, el endpoint funciona correctamente.');
}

debugProductosEndpoint().catch(console.error); 