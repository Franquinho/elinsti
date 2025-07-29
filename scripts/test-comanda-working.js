const fetch = require('node-fetch');

async function testWorkingComanda() {
  console.log('🧪 TEST DE COMANDA CON EVENTO FUNCIONAL');
  console.log('=========================================\n');

  // Usar el evento ID 10 que sabemos que funciona
  const comandaData = {
    evento_id: 10,
    total: 5000,
    nombre_cliente: 'Cliente Test',
    usuario_id: 4,
    productos: [
      {
        id: 14,
        cantidad: 2,
        precio: 2500
      }
    ]
  };

  console.log('📋 Datos de prueba (evento ID 10):');
  console.log(JSON.stringify(comandaData, null, 2));

  try {
    console.log('\n📋 Enviando request...');
    
    const response = await fetch('https://elinsti.vercel.app/api/comandas/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(comandaData)
    });

    console.log('🔔 [TEST] Status:', response.status);
    console.log('🔔 [TEST] Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('🔔 [TEST] Body raw:', responseText);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('🔔 [TEST] Body parsed:', responseData);
    } catch (e) {
      console.log('🔔 [TEST] Error parsing JSON:', e.message);
      return;
    }

    console.log('\n📋 RESULTADO FINAL:');
    console.log('Status:', response.status);
    console.log('Success:', responseData.success);
    console.log('Message:', responseData.message);
    console.log('Errors:', responseData.errors);
    console.log('Details:', responseData.details);
    console.log('Debug:', responseData.debug);

    if (response.ok && responseData.success) {
      console.log('✅ Comanda creada exitosamente');
    } else {
      console.log('❌ Error creando comanda');
    }

  } catch (error) {
    console.error('❌ Error en la petición:', error);
  }
}

testWorkingComanda(); 