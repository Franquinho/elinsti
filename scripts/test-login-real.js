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

async function testLoginReal() {
  console.log('🔐 PROBANDO LOGIN REAL DEL SITIO');
  console.log('==================================\n');

  const baseUrl = 'elinsti.vercel.app';

  // Probar login con credenciales de prueba
  console.log('1. PROBANDO LOGIN');
  console.log('==================');
  
  try {
    const loginData = {
      email: "ventas@elinsti.com",
      password: "ventas123"
    };

    const result = await makeRequest(baseUrl, '/api/auth/login', 'POST', loginData);
    console.log(`   Status: ${result.status}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Response:`, result.data);
    
    if (result.success && result.data.user) {
      console.log(`   ✅ Login exitoso: ${result.data.user.nombre} (${result.data.user.rol})`);
    } else {
      console.log(`   ❌ Error en login: ${result.data.message}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Probar acceso a la página principal
  console.log('\n2. PROBANDO ACCESO A PÁGINA PRINCIPAL');
  console.log('======================================');
  
  try {
    const result = await makeRequest(baseUrl, '/', 'GET');
    console.log(`   Status: ${result.status}`);
    console.log(`   Success: ${result.success}`);
    
    if (result.success) {
      console.log('   ✅ Página principal accesible');
      // Verificar si contiene elementos clave
      const content = result.data;
      if (content.includes('Cargando') || content.includes('EI')) {
        console.log('   ✅ Contenido de carga detectado');
      }
    } else {
      console.log('   ❌ Error accediendo a página principal');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n🔍 DIAGNÓSTICO:');
  console.log('Si el login falla, el problema es de autenticación.');
  console.log('Si la página principal falla, el problema es de carga del sitio.');
  console.log('Si ambos funcionan pero el sitio sigue en "Cargando", el problema es del frontend.');
}

testLoginReal().catch(console.error); 