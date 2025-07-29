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

async function testEventsOperations() {
  console.log('🧪 TEST ESPECÍFICO DE OPERACIONES DE EVENTOS');
  console.log('==============================================\n');

  const baseUrl = 'elinsti.vercel.app';

  // 1. CREAR EVENTO
  console.log('📋 TEST 1: Crear Evento');
  console.log('------------------------');
  try {
    const eventoData = {
      nombre: "Evento Test Corregido",
      descripcion: "Evento de prueba después de la corrección",
      fecha_inicio: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      fecha_fin: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      capacidad_maxima: 150,
      precio_entrada: 8000,
      ubicacion: "Sala Principal",
      activo: false
    };

    const result = await makeRequest(baseUrl, '/api/eventos', 'POST', eventoData);
    console.log(`Status: ${result.status}`);
    console.log(`Success: ${result.success}`);
    console.log(`Response:`, result.data);

    if (result.success && result.data.evento) {
      global.testEventoId = result.data.evento.id;
      console.log(`✅ Evento creado exitosamente con ID: ${global.testEventoId}`);
    } else {
      console.log('❌ Falló creación de evento');
      return;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return;
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 2. ACTUALIZAR EVENTO
  console.log('📋 TEST 2: Actualizar Evento');
  console.log('------------------------------');
  if (global.testEventoId) {
    try {
      const updateData = {
        id: global.testEventoId,
        nombre: "Evento Test Corregido - Actualizado",
        descripcion: "Evento actualizado después de la corrección",
        activo: true
      };

      const result = await makeRequest(baseUrl, '/api/eventos', 'PUT', updateData);
      console.log(`Status: ${result.status}`);
      console.log(`Success: ${result.success}`);
      console.log(`Response:`, result.data);

      if (result.success) {
        console.log('✅ Evento actualizado correctamente');
      } else {
        console.log('❌ Falló actualización de evento');
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 3. ELIMINAR EVENTO
  console.log('📋 TEST 3: Eliminar Evento');
  console.log('----------------------------');
  if (global.testEventoId) {
    try {
      const result = await makeRequest(baseUrl, `/api/eventos?id=${global.testEventoId}`, 'DELETE');
      console.log(`Status: ${result.status}`);
      console.log(`Success: ${result.success}`);
      console.log(`Response:`, result.data);

      if (result.success) {
        console.log('✅ Evento eliminado correctamente');
      } else {
        console.log('❌ Falló eliminación de evento');
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }

  console.log('\n' + '='.repeat(50) + '\n');
  console.log('🎯 RESUMEN DE EVENTOS:');
  console.log('Si todos los tests pasaron, las operaciones de eventos están funcionando correctamente.');
}

testEventsOperations().catch(console.error); 