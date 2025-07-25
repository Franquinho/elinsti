const https = require('https');

async function clearRateLimit() {
  console.log('🧹 LIMPIANDO RATE LIMITER');
  console.log('==========================');
  
  const productionUrl = 'https://elinsti.vercel.app';
  
  // Función simple para hacer requests
  function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;
      
      const req = client.request(url, {
        method: options.method || 'GET',
        headers: options.headers || {},
        ...options
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve({ status: res.statusCode, data: jsonData });
          } catch (e) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });
      
      req.on('error', reject);
      
      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  }
  
  try {
    console.log('⏳ Esperando 1 minuto para que se resetee el rate limiter...');
    await new Promise(resolve => setTimeout(resolve, 60000)); // 1 minuto
    
    console.log('\n🔄 Probando login después del reset...');
    const loginData = {
      email: 'admin@elinsti.com',
      password: 'Admin123!'
    };
    
    const loginResponse = await makeRequest(`${productionUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    console.log(`📋 Status: ${loginResponse.status}`);
    console.log(`📋 Response:`, JSON.stringify(loginResponse.data, null, 2));
    
    if (loginResponse.status === 200 && loginResponse.data.success) {
      console.log('✅ Login exitoso después del reset');
      console.log('   Usuario:', loginResponse.data.user?.nombre);
      console.log('   Rol:', loginResponse.data.user?.rol);
    } else {
      console.log('❌ Login sigue fallando');
      console.log(`   Error: ${loginResponse.data.message || 'Error desconocido'}`);
      if (loginResponse.data.error) {
        console.log(`   Detalles: ${loginResponse.data.error}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

clearRateLimit().catch(console.error); 