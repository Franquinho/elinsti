const fetch = require('node-fetch');

async function testFrontendLogin() {
  console.log('🌐 TESTEANDO LOGIN DESDE FRONTEND');
  console.log('==================================');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // 1. Verificar que el servidor está corriendo
    console.log('\n1️⃣ Verificando servidor...');
    try {
      const response = await fetch(baseUrl);
      if (response.ok) {
        console.log('✅ Servidor corriendo en http://localhost:3000');
      } else {
        console.log(`❌ Servidor respondió con status: ${response.status}`);
      }
    } catch (error) {
      console.log('❌ No se puede conectar al servidor. ¿Está corriendo npm run dev?');
      return;
    }
    
    // 2. Probar endpoint de login
    console.log('\n2️⃣ Probando endpoint de login...');
    const loginData = {
      email: 'admin@elinsti.com',
      password: 'Admin123!'
    };
    
    try {
      const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });
      
      const loginResult = await loginResponse.json();
      
      console.log(`📋 Status: ${loginResponse.status}`);
      console.log(`📋 Response:`, JSON.stringify(loginResult, null, 2));
      
      if (loginResponse.ok && loginResult.success) {
        console.log('✅ Login exitoso desde frontend');
      } else {
        console.log('❌ Login falló desde frontend');
        console.log(`   Error: ${loginResult.message || 'Error desconocido'}`);
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
        const response = await fetch(`${baseUrl}${endpoint.url}`);
        const data = await response.json();
        
        if (response.ok) {
          console.log(`✅ ${endpoint.name}: OK`);
        } else {
          console.log(`❌ ${endpoint.name}: ${response.status} - ${data.message || 'Error'}`);
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