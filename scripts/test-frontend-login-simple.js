const https = require('https');
const http = require('http');

async function testFrontendLogin() {
  console.log('🌐 TESTEANDO LOGIN DESDE FRONTEND');
  console.log('==================================');
  
  const baseUrl = 'http://localhost:3000';
  
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
    // 1. Verificar que el servidor está corriendo
    console.log('\n1️⃣ Verificando servidor...');
    try {
      const response = await makeRequest(baseUrl);
      if (response.status === 200) {
        console.log('✅ Servidor corriendo en http://localhost:3000');
      } else {
        console.log(`❌ Servidor respondió con status: ${response.status}`);
      }
    } catch (error) {
      console.log('❌ No se puede conectar al servidor. ¿Está corriendo npm run dev?');
      console.log('   Error:', error.message);
      return;
    }
    
    // 2. Probar endpoint de login
    console.log('\n2️⃣ Probando endpoint de login...');
    const loginData = {
      email: 'admin@elinsti.com',
      password: 'Admin123!'
    };
    
    try {
      const loginResponse = await makeRequest(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });
      
      console.log(`📋 Status: ${loginResponse.status}`);
      console.log(`📋 Response:`, JSON.stringify(loginResponse.data, null, 2));
      
      if (loginResponse.status === 200 && loginResponse.data.success) {
        console.log('✅ Login exitoso desde frontend');
      } else {
        console.log('❌ Login falló desde frontend');
        console.log(`   Error: ${loginResponse.data.message || 'Error desconocido'}`);
      }
      
    } catch (error) {
      console.log('❌ Error en endpoint de login:', error.message);
    }
    
    // 3. Probar otros endpoints críticos
    console.log('\n3️⃣ Probando otros endpoints...');
    
    const endpoints = [
      { name: 'Productos', url: '/api/productos/list' },
      { name: 'Eventos', url: '/api/eventos' },
      { name: 'Evento Activo', url: '/api/eventos/active' },
      { name: 'Stats', url: '/api/stats' }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await makeRequest(`${baseUrl}${endpoint.url}`);
        
        if (response.status === 200) {
          console.log(`✅ ${endpoint.name}: OK`);
        } else {
          console.log(`❌ ${endpoint.name}: ${response.status} - ${response.data.message || 'Error'}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint.name}: ${error.message}`);
      }
    }
    
    console.log('\n🏁 Test completado');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testFrontendLogin().catch(console.error); 