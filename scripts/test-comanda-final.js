const https = require('https');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'elinsti.vercel.app',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    console.log(`🔔 [TEST] Haciendo ${method} request a ${path}`);
    if (data) {
      console.log(`🔔 [TEST] Datos enviados:`, JSON.stringify(data, null, 2));
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        console.log(`🔔 [TEST] Status: ${res.statusCode}`);
        console.log(`🔔 [TEST] Headers:`, res.headers);
        console.log(`🔔 [TEST] Body raw:`, body);
        
        try {
          const response = JSON.parse(body);
          console.log(`🔔 [TEST] Body parsed:`, JSON.stringify(response, null, 2));
          resolve({ status: res.statusCode, data: response, rawBody: body });
        } catch (e) {
          console.log(`🔔 [TEST] Error parsing JSON:`, e.message);
          resolve({ status: res.statusCode, data: body, rawBody: body });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`🔔 [TEST] Request error:`, error.message);
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testComandaFinal() {
  console.log('🧪 TEST FINAL DE CREACIÓN DE COMANDA');
  console.log('=====================================\n');

  try {
    // Datos de prueba exactos como los envía el frontend
    const comandaData = {
      evento_id: 18,
      total: 7000,
      nombre_cliente: "Fran",
      usuario_id: 4,
      productos: [
        {
          id: 21,
          cantidad: 2,
          precio: 3500
        }
      ]
    };

    console.log('📋 Datos de prueba (exactos al frontend):');
    console.log(JSON.stringify(comandaData, null, 2));
    console.log('\n📋 Enviando request...\n');

    const response = await makeRequest('/api/comandas/create', 'POST', comandaData);
    
    console.log('\n📋 RESULTADO FINAL:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Message:', response.data.message);
    
    if (response.data.success) {
      console.log('Comanda ID:', response.data.comanda_id);
      console.log('✅ ¡ÉXITO! La comanda se creó correctamente');
    } else {
      console.log('Errors:', response.data.errors);
      console.log('Details:', response.data.details);
      console.log('Debug:', response.data.debug);
      console.log('❌ Error en la creación de comanda');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar el test
testComandaFinal(); 