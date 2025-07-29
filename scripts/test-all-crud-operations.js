const https = require('https');

// Función para hacer requests HTTP
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

async function testAllCrudOperations() {
  console.log('🧪 TEST COMPLETO DE TODAS LAS OPERACIONES CRUD');
  console.log('===============================================\n');

  const baseUrl = 'elinsti.vercel.app';
  let testResults = [];

  // 1. TEST PRODUCTOS - CREAR
  console.log('📋 TEST 1: Crear Producto');
  console.log('-------------------------');
  try {
    const productoData = {
      nombre: "Producto Test CRUD",
      precio: 1500,
      emoji: "🧪",
      activo: true
    };

    const result = await makeRequest(baseUrl, '/api/productos', 'POST', productoData);
    console.log(`Status: ${result.status}`);
    console.log(`Success: ${result.success}`);
    console.log(`Response:`, result.data);
    
    testResults.push({
      operation: 'Crear Producto',
      success: result.success,
      status: result.status,
      message: result.data.message || 'Sin mensaje'
    });

    if (result.success && result.data.producto) {
      global.testProductoId = result.data.producto.id;
      console.log(`✅ Producto creado con ID: ${global.testProductoId}`);
    } else {
      console.log('❌ Falló creación de producto');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    testResults.push({
      operation: 'Crear Producto',
      success: false,
      status: 'ERROR',
      message: error.message
    });
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 2. TEST PRODUCTOS - ACTUALIZAR
  console.log('📋 TEST 2: Actualizar Producto');
  console.log('-------------------------------');
  if (global.testProductoId) {
    try {
      const updateData = {
        nombre: "Producto Test CRUD Actualizado",
        precio: 2000,
        emoji: "🔄",
        activo: true
      };

      const result = await makeRequest(baseUrl, `/api/productos/${global.testProductoId}`, 'PATCH', updateData);
      console.log(`Status: ${result.status}`);
      console.log(`Success: ${result.success}`);
      console.log(`Response:`, result.data);
      
      testResults.push({
        operation: 'Actualizar Producto',
        success: result.success,
        status: result.status,
        message: result.data.message || 'Sin mensaje'
      });

      if (result.success) {
        console.log('✅ Producto actualizado correctamente');
      } else {
        console.log('❌ Falló actualización de producto');
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
      testResults.push({
        operation: 'Actualizar Producto',
        success: false,
        status: 'ERROR',
        message: error.message
      });
    }
  } else {
    console.log('⚠️ No se puede probar actualización - no hay producto creado');
    testResults.push({
      operation: 'Actualizar Producto',
      success: false,
      status: 'SKIP',
      message: 'No hay producto para actualizar'
    });
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 3. TEST EVENTOS - CREAR
  console.log('📋 TEST 3: Crear Evento');
  console.log('------------------------');
  try {
    const eventoData = {
      nombre: "Evento Test CRUD",
      descripcion: "Evento de prueba para test CRUD",
      fecha_inicio: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana
      fecha_fin: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Pasado mañana
      capacidad_maxima: 100,
      precio_entrada: 5000,
      ubicacion: "Sala de Pruebas",
      activo: false
    };

    const result = await makeRequest(baseUrl, '/api/eventos', 'POST', eventoData);
    console.log(`Status: ${result.status}`);
    console.log(`Success: ${result.success}`);
    console.log(`Response:`, result.data);
    
    testResults.push({
      operation: 'Crear Evento',
      success: result.success,
      status: result.status,
      message: result.data.message || 'Sin mensaje'
    });

    if (result.success && result.data.evento) {
      global.testEventoId = result.data.evento.id;
      console.log(`✅ Evento creado con ID: ${global.testEventoId}`);
    } else {
      console.log('❌ Falló creación de evento');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    testResults.push({
      operation: 'Crear Evento',
      success: false,
      status: 'ERROR',
      message: error.message
    });
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 4. TEST EVENTOS - ACTUALIZAR
  console.log('📋 TEST 4: Actualizar Evento');
  console.log('------------------------------');
  if (global.testEventoId) {
    try {
      const updateData = {
        id: global.testEventoId,
        nombre: "Evento Test CRUD Actualizado",
        descripcion: "Evento actualizado para test CRUD",
        activo: true
      };

      const result = await makeRequest(baseUrl, '/api/eventos', 'PUT', updateData);
      console.log(`Status: ${result.status}`);
      console.log(`Success: ${result.success}`);
      console.log(`Response:`, result.data);
      
      testResults.push({
        operation: 'Actualizar Evento',
        success: result.success,
        status: result.status,
        message: result.data.message || 'Sin mensaje'
      });

      if (result.success) {
        console.log('✅ Evento actualizado correctamente');
      } else {
        console.log('❌ Falló actualización de evento');
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
      testResults.push({
        operation: 'Actualizar Evento',
        success: false,
        status: 'ERROR',
        message: error.message
      });
    }
  } else {
    console.log('⚠️ No se puede probar actualización - no hay evento creado');
    testResults.push({
      operation: 'Actualizar Evento',
      success: false,
      status: 'SKIP',
      message: 'No hay evento para actualizar'
    });
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 5. TEST COMANDA - CREAR
  console.log('📋 TEST 5: Crear Comanda');
  console.log('-------------------------');
  try {
    const comandaData = {
      evento_id: 18, // Usar evento existente
      total: 3000,
      nombre_cliente: "Cliente Test CRUD",
      productos: [
        {
          id: 21, // Usar producto existente
          cantidad: 2,
          precio: 1500
        }
      ]
    };

    const result = await makeRequest(baseUrl, '/api/comandas/create', 'POST', comandaData);
    console.log(`Status: ${result.status}`);
    console.log(`Success: ${result.success}`);
    console.log(`Response:`, result.data);
    
    testResults.push({
      operation: 'Crear Comanda',
      success: result.success,
      status: result.status,
      message: result.data.message || 'Sin mensaje'
    });

    if (result.success && result.data.comanda_id) {
      global.testComandaId = result.data.comanda_id;
      console.log(`✅ Comanda creada con ID: ${global.testComandaId}`);
    } else {
      console.log('❌ Falló creación de comanda');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    testResults.push({
      operation: 'Crear Comanda',
      success: false,
      status: 'ERROR',
      message: error.message
    });
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 6. TEST COMANDA - ACTUALIZAR ESTADO
  console.log('📋 TEST 6: Actualizar Estado de Comanda');
  console.log('----------------------------------------');
  if (global.testComandaId) {
    try {
      const updateData = {
        comanda_id: global.testComandaId,
        estado: "pagado",
        metodo_pago: "efectivo",
        nota: "Test CRUD"
      };

      const result = await makeRequest(baseUrl, '/api/comandas/update-status', 'POST', updateData);
      console.log(`Status: ${result.status}`);
      console.log(`Success: ${result.success}`);
      console.log(`Response:`, result.data);
      
      testResults.push({
        operation: 'Actualizar Estado Comanda',
        success: result.success,
        status: result.status,
        message: result.data.message || 'Sin mensaje'
      });

      if (result.success) {
        console.log('✅ Estado de comanda actualizado correctamente');
      } else {
        console.log('❌ Falló actualización de estado de comanda');
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
      testResults.push({
        operation: 'Actualizar Estado Comanda',
        success: false,
        status: 'ERROR',
        message: error.message
      });
    }
  } else {
    console.log('⚠️ No se puede probar actualización - no hay comanda creada');
    testResults.push({
      operation: 'Actualizar Estado Comanda',
      success: false,
      status: 'SKIP',
      message: 'No hay comanda para actualizar'
    });
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 7. TEST PRODUCTOS - ELIMINAR
  console.log('📋 TEST 7: Eliminar Producto');
  console.log('------------------------------');
  if (global.testProductoId) {
    try {
      const result = await makeRequest(baseUrl, `/api/productos/${global.testProductoId}`, 'DELETE');
      console.log(`Status: ${result.status}`);
      console.log(`Success: ${result.success}`);
      console.log(`Response:`, result.data);
      
      testResults.push({
        operation: 'Eliminar Producto',
        success: result.success,
        status: result.status,
        message: result.data.message || 'Sin mensaje'
      });

      if (result.success) {
        console.log('✅ Producto eliminado correctamente');
      } else {
        console.log('❌ Falló eliminación de producto');
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
      testResults.push({
        operation: 'Eliminar Producto',
        success: false,
        status: 'ERROR',
        message: error.message
      });
    }
  } else {
    console.log('⚠️ No se puede probar eliminación - no hay producto creado');
    testResults.push({
      operation: 'Eliminar Producto',
      success: false,
      status: 'SKIP',
      message: 'No hay producto para eliminar'
    });
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 8. TEST EVENTOS - ELIMINAR
  console.log('📋 TEST 8: Eliminar Evento');
  console.log('----------------------------');
  if (global.testEventoId) {
    try {
      const result = await makeRequest(baseUrl, `/api/eventos?id=${global.testEventoId}`, 'DELETE');
      console.log(`Status: ${result.status}`);
      console.log(`Success: ${result.success}`);
      console.log(`Response:`, result.data);
      
      testResults.push({
        operation: 'Eliminar Evento',
        success: result.success,
        status: result.status,
        message: result.data.message || 'Sin mensaje'
      });

      if (result.success) {
        console.log('✅ Evento eliminado correctamente');
      } else {
        console.log('❌ Falló eliminación de evento');
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
      testResults.push({
        operation: 'Eliminar Evento',
        success: false,
        status: 'ERROR',
        message: error.message
      });
    }
  } else {
    console.log('⚠️ No se puede probar eliminación - no hay evento creado');
    testResults.push({
      operation: 'Eliminar Evento',
      success: false,
      status: 'SKIP',
      message: 'No hay evento para eliminar'
    });
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // RESUMEN FINAL
  console.log('📊 RESUMEN FINAL DE TODAS LAS OPERACIONES');
  console.log('==========================================');
  
  const successful = testResults.filter(r => r.success).length;
  const total = testResults.length;
  
  testResults.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    const statusText = result.status === 'SKIP' ? '⏭️' : status;
    console.log(`${index + 1}. ${statusText} ${result.operation}`);
    console.log(`   Status: ${result.status} | ${result.message}`);
  });

  console.log('\n' + '='.repeat(50));
  console.log(`📈 RESULTADO: ${successful}/${total} operaciones exitosas`);
  
  if (successful === total) {
    console.log('🎉 ¡TODAS LAS OPERACIONES CRUD FUNCIONAN CORRECTAMENTE!');
  } else if (successful > total / 2) {
    console.log('⚠️ La mayoría de operaciones funcionan, pero hay algunos problemas');
  } else {
    console.log('🚨 HAY PROBLEMAS SIGNIFICATIVOS EN LAS OPERACIONES CRUD');
  }

  console.log('\n🔍 ANÁLISIS DETALLADO:');
  testResults.forEach((result, index) => {
    if (!result.success && result.status !== 'SKIP') {
      console.log(`❌ ${result.operation}: ${result.message}`);
    }
  });
}

testAllCrudOperations().catch(console.error); 