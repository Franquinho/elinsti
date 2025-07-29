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

async function testCompleteUserFlow() {
  console.log('🧪 PRUEBA COMPLETA DEL FRONTEND - USUARIO REAL');
  console.log('===============================================\n');

  const baseUrl = 'elinsti.vercel.app';
  let testResults = [];
  let createdIds = { productos: [], eventos: [], comandas: [] };

  // ===== FASE 1: VERIFICAR ACCESO A LA APLICACIÓN =====
  console.log('📱 FASE 1: ACCESO A LA APLICACIÓN');
  console.log('===================================');
  
  try {
    const result = await makeRequest(baseUrl, '/', 'GET');
    if (result.status === 200) {
      console.log('✅ Página principal accesible');
      testResults.push({ fase: 'Acceso', test: 'Página Principal', success: true });
    } else {
      console.log('❌ Página principal no accesible');
      testResults.push({ fase: 'Acceso', test: 'Página Principal', success: false });
    }
  } catch (error) {
    console.log(`❌ Error accediendo a la página: ${error.message}`);
    testResults.push({ fase: 'Acceso', test: 'Página Principal', success: false });
  }

  // ===== FASE 2: SECCIÓN VENTAS =====
  console.log('\n🛒 FASE 2: SECCIÓN VENTAS');
  console.log('==========================');

  // 2.1 Verificar que se pueden listar productos
  console.log('2.1 Verificando listado de productos...');
  try {
    const result = await makeRequest(baseUrl, '/api/productos/list', 'GET');
    if (result.success && result.data.productos) {
      console.log(`✅ Productos disponibles: ${result.data.productos.length}`);
      testResults.push({ fase: 'Ventas', test: 'Listar Productos', success: true });
    } else {
      console.log('❌ No se pueden listar productos');
      testResults.push({ fase: 'Ventas', test: 'Listar Productos', success: false });
    }
  } catch (error) {
    console.log(`❌ Error listando productos: ${error.message}`);
    testResults.push({ fase: 'Ventas', test: 'Listar Productos', success: false });
  }

  // 2.2 Verificar que se pueden listar eventos activos
  console.log('2.2 Verificando eventos activos...');
  try {
    const result = await makeRequest(baseUrl, '/api/eventos/active', 'GET');
    if (result.success && result.data.eventos) {
      console.log(`✅ Eventos activos: ${result.data.eventos.length}`);
      testResults.push({ fase: 'Ventas', test: 'Listar Eventos Activos', success: true });
    } else {
      console.log('❌ No se pueden listar eventos activos');
      testResults.push({ fase: 'Ventas', test: 'Listar Eventos Activos', success: false });
    }
  } catch (error) {
    console.log(`❌ Error listando eventos: ${error.message}`);
    testResults.push({ fase: 'Ventas', test: 'Listar Eventos Activos', success: false });
  }

  // 2.3 Crear una comanda de prueba
  console.log('2.3 Creando comanda de prueba...');
  try {
    const comandaData = {
      evento_id: 18, // Usar un evento existente
      total: 5000,
      nombre_cliente: "Cliente Prueba Frontend",
      productos: [
        { id: 21, cantidad: 1, precio: 5000 } // Usar un producto existente
      ]
    };

    const result = await makeRequest(baseUrl, '/api/comandas/create', 'POST', comandaData);
    if (result.success && result.data.comanda_id) {
      console.log(`✅ Comanda creada: ID ${result.data.comanda_id}`);
      createdIds.comandas.push(result.data.comanda_id);
      testResults.push({ fase: 'Ventas', test: 'Crear Comanda', success: true });
    } else {
      console.log(`❌ Error creando comanda: ${result.data.message}`);
      testResults.push({ fase: 'Ventas', test: 'Crear Comanda', success: false });
    }
  } catch (error) {
    console.log(`❌ Error creando comanda: ${error.message}`);
    testResults.push({ fase: 'Ventas', test: 'Crear Comanda', success: false });
  }

  // ===== FASE 3: SECCIÓN CAJA =====
  console.log('\n💰 FASE 3: SECCIÓN CAJA');
  console.log('========================');

  // 3.1 Verificar que se pueden listar comandas
  console.log('3.1 Verificando listado de comandas...');
  try {
    const result = await makeRequest(baseUrl, '/api/comandas/list', 'GET');
    if (result.success && result.data.comandas) {
      console.log(`✅ Comandas disponibles: ${result.data.comandas.length}`);
      testResults.push({ fase: 'Caja', test: 'Listar Comandas', success: true });
    } else {
      console.log('❌ No se pueden listar comandas');
      testResults.push({ fase: 'Caja', test: 'Listar Comandas', success: false });
    }
  } catch (error) {
    console.log(`❌ Error listando comandas: ${error.message}`);
    testResults.push({ fase: 'Caja', test: 'Listar Comandas', success: false });
  }

  // 3.2 Procesar pago de una comanda
  console.log('3.2 Procesando pago de comanda...');
  if (createdIds.comandas.length > 0) {
    try {
      const paymentData = {
        comanda_id: createdIds.comandas[0],
        estado: "pagado",
        metodo_pago: "efectivo",
        nota: "Pago de prueba frontend"
      };

      const result = await makeRequest(baseUrl, '/api/comandas/update-status', 'POST', paymentData);
      if (result.success) {
        console.log('✅ Pago procesado correctamente');
        testResults.push({ fase: 'Caja', test: 'Procesar Pago', success: true });
      } else {
        console.log(`❌ Error procesando pago: ${result.data.message}`);
        testResults.push({ fase: 'Caja', test: 'Procesar Pago', success: false });
      }
    } catch (error) {
      console.log(`❌ Error procesando pago: ${error.message}`);
      testResults.push({ fase: 'Caja', test: 'Procesar Pago', success: false });
    }
  } else {
    console.log('⚠️ No hay comandas para procesar pago');
    testResults.push({ fase: 'Caja', test: 'Procesar Pago', success: false });
  }

  // 3.3 Verificar estadísticas
  console.log('3.3 Verificando estadísticas...');
  try {
    const result = await makeRequest(baseUrl, '/api/stats', 'GET');
    if (result.success && result.data) {
      console.log('✅ Estadísticas disponibles');
      testResults.push({ fase: 'Caja', test: 'Ver Estadísticas', success: true });
    } else {
      console.log('❌ No se pueden obtener estadísticas');
      testResults.push({ fase: 'Caja', test: 'Ver Estadísticas', success: false });
    }
  } catch (error) {
    console.log(`❌ Error obteniendo estadísticas: ${error.message}`);
    testResults.push({ fase: 'Caja', test: 'Ver Estadísticas', success: false });
  }

  // ===== FASE 4: SECCIÓN ADMINISTRACIÓN =====
  console.log('\n⚙️ FASE 4: SECCIÓN ADMINISTRACIÓN');
  console.log('==================================');

  // 4.1 Crear un producto
  console.log('4.1 Creando producto de prueba...');
  try {
    const productoData = {
      nombre: "Producto Prueba Frontend",
      precio: 2500,
      emoji: "🧪",
      activo: true
    };

    const result = await makeRequest(baseUrl, '/api/productos', 'POST', productoData);
    if (result.success && result.data.producto) {
      console.log(`✅ Producto creado: ID ${result.data.producto.id}`);
      createdIds.productos.push(result.data.producto.id);
      testResults.push({ fase: 'Administración', test: 'Crear Producto', success: true });
    } else {
      console.log(`❌ Error creando producto: ${result.data.message}`);
      testResults.push({ fase: 'Administración', test: 'Crear Producto', success: false });
    }
  } catch (error) {
    console.log(`❌ Error creando producto: ${error.message}`);
    testResults.push({ fase: 'Administración', test: 'Crear Producto', success: false });
  }

  // 4.2 Actualizar el producto creado
  console.log('4.2 Actualizando producto...');
  if (createdIds.productos.length > 0) {
    try {
      const updateData = {
        nombre: "Producto Actualizado Frontend",
        precio: 3000,
        activo: false
      };

      const result = await makeRequest(baseUrl, `/api/productos/${createdIds.productos[0]}`, 'PUT', updateData);
      if (result.success) {
        console.log('✅ Producto actualizado correctamente');
        testResults.push({ fase: 'Administración', test: 'Actualizar Producto', success: true });
      } else {
        console.log(`❌ Error actualizando producto: ${result.data.message}`);
        testResults.push({ fase: 'Administración', test: 'Actualizar Producto', success: false });
      }
    } catch (error) {
      console.log(`❌ Error actualizando producto: ${error.message}`);
      testResults.push({ fase: 'Administración', test: 'Actualizar Producto', success: false });
    }
  } else {
    console.log('⚠️ No hay productos para actualizar');
    testResults.push({ fase: 'Administración', test: 'Actualizar Producto', success: false });
  }

  // 4.3 Crear un evento
  console.log('4.3 Creando evento de prueba...');
  try {
    const eventoData = {
      nombre: "Evento Prueba Frontend",
      descripcion: "Evento de prueba para frontend",
      fecha_inicio: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      fecha_fin: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      capacidad_maxima: 100,
      precio_entrada: 8000,
      ubicacion: "Lugar de Prueba",
      imagen_url: null,
      activo: true
    };

    const result = await makeRequest(baseUrl, '/api/eventos', 'POST', eventoData);
    if (result.success && result.data.evento) {
      console.log(`✅ Evento creado: ID ${result.data.evento.id}`);
      createdIds.eventos.push(result.data.evento.id);
      testResults.push({ fase: 'Administración', test: 'Crear Evento', success: true });
    } else {
      console.log(`❌ Error creando evento: ${result.data.message}`);
      testResults.push({ fase: 'Administración', test: 'Crear Evento', success: false });
    }
  } catch (error) {
    console.log(`❌ Error creando evento: ${error.message}`);
    testResults.push({ fase: 'Administración', test: 'Crear Evento', success: false });
  }

  // 4.4 Actualizar el evento creado
  console.log('4.4 Actualizando evento...');
  if (createdIds.eventos.length > 0) {
    try {
      const updateData = {
        id: createdIds.eventos[0],
        nombre: "Evento Actualizado Frontend",
        activo: false
      };

      const result = await makeRequest(baseUrl, '/api/eventos', 'PUT', updateData);
      if (result.success) {
        console.log('✅ Evento actualizado correctamente');
        testResults.push({ fase: 'Administración', test: 'Actualizar Evento', success: true });
      } else {
        console.log(`❌ Error actualizando evento: ${result.data.message}`);
        testResults.push({ fase: 'Administración', test: 'Actualizar Evento', success: false });
      }
    } catch (error) {
      console.log(`❌ Error actualizando evento: ${error.message}`);
      testResults.push({ fase: 'Administración', test: 'Actualizar Evento', success: false });
    }
  } else {
    console.log('⚠️ No hay eventos para actualizar');
    testResults.push({ fase: 'Administración', test: 'Actualizar Evento', success: false });
  }

  // ===== FASE 5: LIMPIEZA =====
  console.log('\n🧹 FASE 5: LIMPIEZA DE DATOS DE PRUEBA');
  console.log('========================================');

  // 5.1 Eliminar productos creados
  console.log('5.1 Eliminando productos de prueba...');
  for (const id of createdIds.productos) {
    try {
      const result = await makeRequest(baseUrl, `/api/productos/${id}`, 'DELETE');
      if (result.success) {
        console.log(`✅ Producto ${id} eliminado`);
      } else {
        console.log(`❌ Error eliminando producto ${id}`);
      }
    } catch (error) {
      console.log(`❌ Error eliminando producto ${id}: ${error.message}`);
    }
  }

  // 5.2 Eliminar eventos creados
  console.log('5.2 Eliminando eventos de prueba...');
  for (const id of createdIds.eventos) {
    try {
      const result = await makeRequest(baseUrl, `/api/eventos?id=${id}`, 'DELETE');
      if (result.success) {
        console.log(`✅ Evento ${id} eliminado`);
      } else {
        console.log(`❌ Error eliminando evento ${id}`);
      }
    } catch (error) {
      console.log(`❌ Error eliminando evento ${id}: ${error.message}`);
    }
  }

  // ===== RESUMEN FINAL =====
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN COMPLETO DE PRUEBAS FRONTEND');
  console.log('='.repeat(60));

  const fases = ['Acceso', 'Ventas', 'Caja', 'Administración'];
  
  for (const fase of fases) {
    const faseTests = testResults.filter(r => r.fase === fase);
    const faseSuccess = faseTests.filter(r => r.success).length;
    const faseTotal = faseTests.length;
    
    console.log(`\n${fase.toUpperCase()}: ${faseSuccess}/${faseTotal} tests exitosos`);
    faseTests.forEach(test => {
      const status = test.success ? '✅' : '❌';
      console.log(`  ${status} ${test.test}`);
    });
  }

  const totalSuccess = testResults.filter(r => r.success).length;
  const totalTests = testResults.length;

  console.log('\n' + '='.repeat(60));
  console.log(`📈 RESULTADO FINAL: ${totalSuccess}/${totalTests} tests exitosos`);
  
  if (totalSuccess === totalTests) {
    console.log('🎉 ¡TODAS LAS FUNCIONALIDADES FUNCIONAN CORRECTAMENTE!');
    console.log('✅ El sistema está 100% listo para uso en producción');
    console.log('✅ El usuario puede navegar por todas las secciones sin problemas');
  } else {
    console.log('⚠️ HAY FUNCIONALIDADES QUE NO FUNCIONAN CORRECTAMENTE');
    console.log('🔧 Se requieren correcciones antes del uso en producción');
  }

  return { testResults, totalSuccess, totalTests };
}

testCompleteUserFlow().catch(console.error); 