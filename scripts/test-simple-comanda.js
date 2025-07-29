const https = require('https');

async function testSimpleComanda() {
  console.log('🧪 TEST SIMPLE DE CREACIÓN DE COMANDA');
  console.log('=======================================\n');

  // Datos mínimos para la comanda
  const comandaData = {
    evento_id: 18,
    total: 7000,
    nombre_cliente: "Test Cliente",
    productos: [
      {
        id: 21,
        cantidad: 2,
        precio: 3500
      }
    ]
  };

  console.log('📋 Datos a enviar:');
  console.log(JSON.stringify(comandaData, null, 2));

  const postData = JSON.stringify(comandaData);

  const options = {
    hostname: 'elinsti.vercel.app',
    port: 443,
    path: '/api/comandas/create',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log(`🔔 Status: ${res.statusCode}`);
      console.log(`🔔 Headers:`, res.headers);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`🔔 Response Body: ${data}`);
        
        try {
          const responseData = JSON.parse(data);
          console.log('\n📋 RESULTADO:');
          console.log('Status:', res.statusCode);
          console.log('Success:', responseData.success);
          console.log('Message:', responseData.message);
          console.log('Errors:', responseData.errors);
          console.log('Details:', responseData.details);
          console.log('Debug:', responseData.debug);

          if (res.statusCode === 200 && responseData.success) {
            console.log('✅ Comanda creada exitosamente');
          } else {
            console.log('❌ Error creando comanda');
          }
        } catch (e) {
          console.log('❌ Error parsing response:', e.message);
        }
        
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error('❌ Request error:', e);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

testSimpleComanda().catch(console.error); 