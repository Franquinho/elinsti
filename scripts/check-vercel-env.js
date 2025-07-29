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

async function checkVercelEnvironment() {
  console.log('🔍 VERIFICANDO VARIABLES DE ENTORNO EN VERCEL');
  console.log('==============================================\n');

  const baseUrl = 'elinsti.vercel.app';

  // Test 1: Verificar si las variables de entorno están configuradas
  console.log('1. Verificando configuración de Supabase...');
  try {
    // Intentar crear un producto para ver si las variables están configuradas
    const productoData = {
      nombre: "Test Env Check",
      precio: 1000
    };

    const result = await makeRequest(baseUrl, '/api/productos', 'POST', productoData);
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, result.data);
    
    if (result.data.message && result.data.message.includes('Invalid API key')) {
      console.log('   ❌ PROBLEMA: Invalid API key - Variables de entorno no configuradas en Vercel');
      console.log('   🔧 SOLUCIÓN: Configurar SUPABASE_SERVICE_ROLE_KEY en Vercel');
    } else if (result.data.message && result.data.message.includes('Error de configuración')) {
      console.log('   ❌ PROBLEMA: Error de configuración de base de datos');
    } else if (result.success) {
      console.log('   ✅ Variables de entorno configuradas correctamente');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 2: Verificar otras APIs que usan supabaseAdmin
  console.log('\n2. Verificando otras APIs que usan supabaseAdmin...');
  
  // Test eventos
  try {
    const eventoData = {
      nombre: "Test Env Evento",
      descripcion: "Test",
      fecha_inicio: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      fecha_fin: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      capacidad_maxima: 50,
      precio_entrada: 5000,
      ubicacion: "Test",
      activo: false
    };

    const result = await makeRequest(baseUrl, '/api/eventos', 'POST', eventoData);
    console.log(`   Eventos - Status: ${result.status}, Success: ${result.success}`);
    
    if (result.success && result.data.evento) {
      // Limpiar evento creado
      await makeRequest(baseUrl, `/api/eventos?id=${result.data.evento.id}`, 'DELETE');
    }
  } catch (error) {
    console.log(`   ❌ Error en eventos: ${error.message}`);
  }

  console.log('\n🔍 DIAGNÓSTICO:');
  console.log('Si aparece "Invalid API key", significa que:');
  console.log('1. La variable SUPABASE_SERVICE_ROLE_KEY no está configurada en Vercel');
  console.log('2. O la variable está mal configurada');
  console.log('3. O hay un problema con las credenciales de Supabase');
  
  console.log('\n🔧 SOLUCIÓN:');
  console.log('1. Ir a Vercel Dashboard');
  console.log('2. Seleccionar el proyecto elinsti');
  console.log('3. Ir a Settings > Environment Variables');
  console.log('4. Agregar SUPABASE_SERVICE_ROLE_KEY con el valor correcto');
  console.log('5. Hacer redeploy del proyecto');
}

checkVercelEnvironment().catch(console.error); 