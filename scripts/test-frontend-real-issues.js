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

async function testRealIssues() {
  console.log('🔍 PROBANDO PROBLEMAS REALES DEL FRONTEND');
  console.log('==========================================\n');

  const baseUrl = 'elinsti.vercel.app';

  // 1. Probar selección de evento en ventas
  console.log('1. PROBANDO SELECCIÓN DE EVENTO EN VENTAS');
  console.log('==========================================');
  
  try {
    const result = await makeRequest(baseUrl, '/api/eventos/active', 'GET');
    console.log(`   Status: ${result.status}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Response:`, result.data);
    
    if (result.success && result.data.eventos) {
      console.log(`   ✅ Eventos activos disponibles: ${result.data.eventos.length}`);
      if (result.data.eventos.length > 0) {
        console.log(`   ✅ Primer evento: ${result.data.eventos[0].nombre} (ID: ${result.data.eventos[0].id})`);
      }
    } else {
      console.log('   ❌ No se pueden obtener eventos activos');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // 2. Probar creación de evento
  console.log('\n2. PROBANDO CREACIÓN DE EVENTO');
  console.log('===============================');
  
  try {
    const eventoData = {
      nombre: `Evento Test ${Date.now()}`,
      descripcion: "Evento de prueba para verificar creación",
      fecha_inicio: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      fecha_fin: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      capacidad_maxima: 50,
      precio_entrada: 5000,
      ubicacion: "Lugar de Prueba",
      imagen_url: null,
      activo: true
    };

    const result = await makeRequest(baseUrl, '/api/eventos', 'POST', eventoData);
    console.log(`   Status: ${result.status}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Response:`, result.data);
    
    if (result.success && result.data.evento) {
      console.log(`   ✅ Evento creado: ${result.data.evento.nombre} (ID: ${result.data.evento.id})`);
      
      // Limpiar evento creado
      await makeRequest(baseUrl, `/api/eventos?id=${result.data.evento.id}`, 'DELETE');
      console.log('   🧹 Evento de prueba eliminado');
    } else {
      console.log(`   ❌ Error creando evento: ${result.data.message}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // 3. Probar creación de producto
  console.log('\n3. PROBANDO CREACIÓN DE PRODUCTO');
  console.log('=================================');
  
  try {
    const productoData = {
      nombre: `Producto Test ${Date.now()}`,
      precio: 2500,
      emoji: "🧪",
      activo: true
    };

    const result = await makeRequest(baseUrl, '/api/productos', 'POST', productoData);
    console.log(`   Status: ${result.status}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Response:`, result.data);
    
    if (result.success && result.data.producto) {
      console.log(`   ✅ Producto creado: ${result.data.producto.nombre} (ID: ${result.data.producto.id})`);
      
      // Limpiar producto creado
      await makeRequest(baseUrl, `/api/productos/${result.data.producto.id}`, 'DELETE');
      console.log('   🧹 Producto de prueba eliminado');
    } else {
      console.log(`   ❌ Error creando producto: ${result.data.message}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // 4. Probar actualización de producto
  console.log('\n4. PROBANDO ACTUALIZACIÓN DE PRODUCTO');
  console.log('======================================');
  
  try {
    // Primero crear un producto
    const productoData = {
      nombre: `Producto Update Test ${Date.now()}`,
      precio: 1000,
      emoji: "🧪",
      activo: true
    };

    const createResult = await makeRequest(baseUrl, '/api/productos', 'POST', productoData);
    
    if (createResult.success && createResult.data.producto) {
      const productId = createResult.data.producto.id;
      console.log(`   ✅ Producto creado para actualizar: ID ${productId}`);
      
      // Actualizar el producto
      const updateData = {
        nombre: "Producto Actualizado",
        precio: 2000,
        activo: false
      };

      const updateResult = await makeRequest(baseUrl, `/api/productos/${productId}`, 'PUT', updateData);
      console.log(`   Status: ${updateResult.status}`);
      console.log(`   Success: ${updateResult.success}`);
      console.log(`   Response:`, updateResult.data);
      
      if (updateResult.success) {
        console.log('   ✅ Producto actualizado correctamente');
      } else {
        console.log(`   ❌ Error actualizando producto: ${updateResult.data.message}`);
      }
      
      // Limpiar producto
      await makeRequest(baseUrl, `/api/productos/${productId}`, 'DELETE');
      console.log('   🧹 Producto de prueba eliminado');
    } else {
      console.log('   ❌ No se pudo crear producto para actualizar');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // 5. Probar eliminación de producto
  console.log('\n5. PROBANDO ELIMINACIÓN DE PRODUCTO');
  console.log('=====================================');
  
  try {
    // Primero crear un producto
    const productoData = {
      nombre: `Producto Delete Test ${Date.now()}`,
      precio: 1000,
      emoji: "🧪",
      activo: true
    };

    const createResult = await makeRequest(baseUrl, '/api/productos', 'POST', productoData);
    
    if (createResult.success && createResult.data.producto) {
      const productId = createResult.data.producto.id;
      console.log(`   ✅ Producto creado para eliminar: ID ${productId}`);
      
      // Eliminar el producto
      const deleteResult = await makeRequest(baseUrl, `/api/productos/${productId}`, 'DELETE');
      console.log(`   Status: ${deleteResult.status}`);
      console.log(`   Success: ${deleteResult.success}`);
      console.log(`   Response:`, deleteResult.data);
      
      if (deleteResult.success) {
        console.log('   ✅ Producto eliminado correctamente');
      } else {
        console.log(`   ❌ Error eliminando producto: ${deleteResult.data.message}`);
      }
    } else {
      console.log('   ❌ No se pudo crear producto para eliminar');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n🔍 RESUMEN DE PROBLEMAS REALES:');
  console.log('Si algún test falla, ese es el problema específico que necesitas corregir.');
  console.log('Los errores más comunes son:');
  console.log('- Status 500: Error interno del servidor');
  console.log('- Status 400: Datos inválidos');
  console.log('- Status 404: Endpoint no encontrado');
}

testRealIssues().catch(console.error); 