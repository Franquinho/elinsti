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

async function testPutEndpoint() {
  console.log('🔧 PROBANDO ENDPOINT PUT /api/eventos/active');
  console.log('===========================================\n');

  const baseUrl = 'elinsti.vercel.app';

  // Probar con evento_id (como envía el frontend)
  console.log('1. PROBANDO CON evento_id');
  console.log('==========================');
  
  try {
    const putData = {
      evento_id: 18
    };

    const result = await makeRequest(baseUrl, '/api/eventos/active', 'PUT', putData);
    console.log(`   Status: ${result.status}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Response:`, result.data);
    
    if (result.success) {
      console.log(`   ✅ PUT exitoso con evento_id`);
    } else {
      console.log(`   ❌ Error: ${result.data.message}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Probar con eventoId (como estaba antes)
  console.log('\n2. PROBANDO CON eventoId');
  console.log('=========================');
  
  try {
    const putData = {
      eventoId: 18
    };

    const result = await makeRequest(baseUrl, '/api/eventos/active', 'PUT', putData);
    console.log(`   Status: ${result.status}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Response:`, result.data);
    
    if (result.success) {
      console.log(`   ✅ PUT exitoso con eventoId`);
    } else {
      console.log(`   ❌ Error: ${result.data.message}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n🔍 DIAGNÓSTICO:');
  console.log('Si ambos tests fallan, el problema es que el deploy no se aplicó.');
  console.log('Si uno funciona, el problema está en el parámetro que envía el frontend.');
}

testPutEndpoint().catch(console.error); 