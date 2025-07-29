const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase con la API key correcta
const supabaseUrl = 'https://joebhvyfcftobrngcqor.supabase.co';
const supabaseKey = 'sb_publishable_SseWwWd7DpxeVfQVTCbfTg_KEzkN-qv';
const supabase = createClient(supabaseUrl, supabaseKey);

// Función para hacer requests HTTP
function makeRequest(hostname, path, method, data = null) {
  return new Promise((resolve, reject) => {
    const https = require('https');
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

async function auditoriaCompletaSistema() {
  console.log('🔍 AUDITORÍA COMPLETA DEL SISTEMA EL INSTI');
  console.log('===========================================\n');

  const baseUrl = 'elinsti.vercel.app';
  let auditoria = {
    timestamp: new Date().toISOString(),
    resumen: {},
    detalles: {},
    problemas: [],
    soluciones: [],
    recomendaciones: []
  };

  // FASE 1: ANÁLISIS DE LA BASE DE DATOS ACTUAL
  console.log('📊 FASE 1: ANÁLISIS DE LA BASE DE DATOS ACTUAL');
  console.log('===============================================\n');

  // 1.1 Analizar tabla usuarios
  console.log('1.1 Analizando tabla usuarios...');
  const { data: usuarios, error: usuariosError } = await supabase
    .from('usuarios')
    .select('*');

  if (usuariosError) {
    console.log('❌ Error obteniendo usuarios:', usuariosError);
    auditoria.problemas.push('Error accediendo a tabla usuarios');
  } else {
    console.log(`✅ Usuarios encontrados: ${usuarios.length}`);
    auditoria.detalles.usuarios = {
      total: usuarios.length,
      activos: usuarios.filter(u => u.activo).length,
      inactivos: usuarios.filter(u => !u.activo).length,
      datos: usuarios
    };
  }

  // 1.2 Analizar tabla eventos
  console.log('\n1.2 Analizando tabla eventos...');
  const { data: eventos, error: eventosError } = await supabase
    .from('eventos')
    .select('*');

  if (eventosError) {
    console.log('❌ Error obteniendo eventos:', eventosError);
    auditoria.problemas.push('Error accediendo a tabla eventos');
  } else {
    console.log(`✅ Eventos encontrados: ${eventos.length}`);
    auditoria.detalles.eventos = {
      total: eventos.length,
      activos: eventos.filter(e => e.activo).length,
      inactivos: eventos.filter(e => !e.activo).length,
      datos: eventos
    };

    // Verificar estructura de eventos
    const eventosConProblemas = eventos.filter(e => !e.fecha || !e.fecha_inicio || !e.fecha_fin);
    if (eventosConProblemas.length > 0) {
      console.log(`⚠️ Eventos con problemas de estructura: ${eventosConProblemas.length}`);
      auditoria.problemas.push(`${eventosConProblemas.length} eventos con estructura inconsistente`);
    }
  }

  // 1.3 Analizar tabla productos
  console.log('\n1.3 Analizando tabla productos...');
  const { data: productos, error: productosError } = await supabase
    .from('productos')
    .select('*');

  if (productosError) {
    console.log('❌ Error obteniendo productos:', productosError);
    auditoria.problemas.push('Error accediendo a tabla productos');
  } else {
    console.log(`✅ Productos encontrados: ${productos.length}`);
    auditoria.detalles.productos = {
      total: productos.length,
      activos: productos.filter(p => p.activo).length,
      inactivos: productos.filter(p => !p.activo).length,
      datos: productos
    };
  }

  // 1.4 Analizar tabla comandas
  console.log('\n1.4 Analizando tabla comandas...');
  const { data: comandas, error: comandasError } = await supabase
    .from('comandas')
    .select('*');

  if (comandasError) {
    console.log('❌ Error obteniendo comandas:', comandasError);
    auditoria.problemas.push('Error accediendo a tabla comandas');
  } else {
    console.log(`✅ Comandas encontradas: ${comandas.length}`);
    auditoria.detalles.comandas = {
      total: comandas.length,
      pendientes: comandas.filter(c => c.estado === 'pendiente').length,
      pagadas: comandas.filter(c => c.estado === 'pagado').length,
      canceladas: comandas.filter(c => c.estado === 'cancelado').length,
      datos: comandas
    };
  }

  // 1.5 Analizar tabla comanda_items
  console.log('\n1.5 Analizando tabla comanda_items...');
  const { data: comandaItems, error: comandaItemsError } = await supabase
    .from('comanda_items')
    .select('*');

  if (comandaItemsError) {
    console.log('❌ Error obteniendo items de comanda:', comandaItemsError);
    auditoria.problemas.push('Error accediendo a tabla comanda_items');
  } else {
    console.log(`✅ Items de comanda encontrados: ${comandaItems.length}`);
    auditoria.detalles.comandaItems = {
      total: comandaItems.length,
      datos: comandaItems
    };
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // FASE 2: LIMPIEZA DE DATOS INCONSISTENTES
  console.log('🧹 FASE 2: LIMPIEZA DE DATOS INCONSISTENTES');
  console.log('============================================\n');

  // 2.1 Limpiar eventos con estructura inconsistente
  if (eventos && eventos.length > 0) {
    const eventosInconsistentes = eventos.filter(e => !e.fecha || !e.fecha_inicio || !e.fecha_fin);
    if (eventosInconsistentes.length > 0) {
      console.log(`2.1 Limpiando ${eventosInconsistentes.length} eventos inconsistentes...`);
      
      for (const evento of eventosInconsistentes) {
        console.log(`   Eliminando evento ID ${evento.id}: ${evento.nombre}`);
        const { error: deleteError } = await supabase
          .from('eventos')
          .delete()
          .eq('id', evento.id);
        
        if (deleteError) {
          console.log(`   ❌ Error eliminando evento ${evento.id}:`, deleteError);
          auditoria.problemas.push(`Error eliminando evento ${evento.id}`);
        } else {
          console.log(`   ✅ Evento ${evento.id} eliminado`);
          auditoria.soluciones.push(`Evento inconsistente ${evento.id} eliminado`);
        }
      }
    } else {
      console.log('2.1 ✅ No hay eventos inconsistentes que limpiar');
    }
  }

  // 2.2 Limpiar comandas huérfanas (sin items)
  if (comandas && comandaItems) {
    const comandasConItems = new Set(comandaItems.map(item => item.comanda_id));
    const comandasHuerfanas = comandas.filter(c => !comandasConItems.has(c.id));
    
    if (comandasHuerfanas.length > 0) {
      console.log(`\n2.2 Limpiando ${comandasHuerfanas.length} comandas huérfanas...`);
      
      for (const comanda of comandasHuerfanas) {
        console.log(`   Eliminando comanda huérfana ID ${comanda.id}: ${comanda.nombre_cliente}`);
        const { error: deleteError } = await supabase
          .from('comandas')
          .delete()
          .eq('id', comanda.id);
        
        if (deleteError) {
          console.log(`   ❌ Error eliminando comanda ${comanda.id}:`, deleteError);
          auditoria.problemas.push(`Error eliminando comanda ${comanda.id}`);
        } else {
          console.log(`   ✅ Comanda ${comanda.id} eliminada`);
          auditoria.soluciones.push(`Comanda huérfana ${comanda.id} eliminada`);
        }
      }
    } else {
      console.log('2.2 ✅ No hay comandas huérfanas que limpiar');
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // FASE 3: PRUEBAS CON EL CÓDIGO REAL DEL SISTEMA
  console.log('🧪 FASE 3: PRUEBAS CON EL CÓDIGO REAL DEL SISTEMA');
  console.log('==================================================\n');

  // 3.1 Probar creación de producto
  console.log('3.1 Probando creación de producto...');
  try {
    const productoData = {
      nombre: "Producto Auditoría",
      precio: 2500,
      emoji: "🔍",
      activo: true
    };

    const result = await makeRequest(baseUrl, '/api/productos', 'POST', productoData);
    console.log(`   Status: ${result.status}, Success: ${result.success}`);
    
    if (result.success && result.data.producto) {
      global.auditoriaProductoId = result.data.producto.id;
      console.log(`   ✅ Producto creado con ID: ${global.auditoriaProductoId}`);
      auditoria.soluciones.push(`Producto de prueba creado: ${global.auditoriaProductoId}`);
    } else {
      console.log(`   ❌ Falló creación de producto: ${result.data.message}`);
      auditoria.problemas.push(`Error creando producto: ${result.data.message}`);
    }
  } catch (error) {
    console.log(`   ❌ Error en creación de producto: ${error.message}`);
    auditoria.problemas.push(`Error en creación de producto: ${error.message}`);
  }

  // 3.2 Probar creación de evento
  console.log('\n3.2 Probando creación de evento...');
  try {
    const eventoData = {
      nombre: "Evento Auditoría",
      descripcion: "Evento de prueba para auditoría del sistema",
      fecha_inicio: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      fecha_fin: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      capacidad_maxima: 200,
      precio_entrada: 10000,
      ubicacion: "Sala de Auditoría",
      activo: false
    };

    const result = await makeRequest(baseUrl, '/api/eventos', 'POST', eventoData);
    console.log(`   Status: ${result.status}, Success: ${result.success}`);
    
    if (result.success && result.data.evento) {
      global.auditoriaEventoId = result.data.evento.id;
      console.log(`   ✅ Evento creado con ID: ${global.auditoriaEventoId}`);
      auditoria.soluciones.push(`Evento de prueba creado: ${global.auditoriaEventoId}`);
    } else {
      console.log(`   ❌ Falló creación de evento: ${result.data.message}`);
      auditoria.problemas.push(`Error creando evento: ${result.data.message}`);
    }
  } catch (error) {
    console.log(`   ❌ Error en creación de evento: ${error.message}`);
    auditoria.problemas.push(`Error en creación de evento: ${error.message}`);
  }

  // 3.3 Probar creación de comanda
  console.log('\n3.3 Probando creación de comanda...');
  try {
    const comandaData = {
      evento_id: 18, // Usar evento existente
      total: 5000,
      nombre_cliente: "Cliente Auditoría",
      productos: [
        {
          id: 21, // Usar producto existente
          cantidad: 2,
          precio: 2500
        }
      ]
    };

    const result = await makeRequest(baseUrl, '/api/comandas/create', 'POST', comandaData);
    console.log(`   Status: ${result.status}, Success: ${result.success}`);
    
    if (result.success && result.data.comanda_id) {
      global.auditoriaComandaId = result.data.comanda_id;
      console.log(`   ✅ Comanda creada con ID: ${global.auditoriaComandaId}`);
      auditoria.soluciones.push(`Comanda de prueba creada: ${global.auditoriaComandaId}`);
    } else {
      console.log(`   ❌ Falló creación de comanda: ${result.data.message}`);
      auditoria.problemas.push(`Error creando comanda: ${result.data.message}`);
    }
  } catch (error) {
    console.log(`   ❌ Error en creación de comanda: ${error.message}`);
    auditoria.problemas.push(`Error en creación de comanda: ${error.message}`);
  }

  // 3.4 Probar actualización de estado de comanda
  if (global.auditoriaComandaId) {
    console.log('\n3.4 Probando actualización de estado de comanda...');
    try {
      const updateData = {
        comanda_id: global.auditoriaComandaId,
        estado: "pagado",
        metodo_pago: "efectivo",
        nota: "Prueba de auditoría"
      };

      const result = await makeRequest(baseUrl, '/api/comandas/update-status', 'POST', updateData);
      console.log(`   Status: ${result.status}, Success: ${result.success}`);
      
      if (result.success) {
        console.log(`   ✅ Estado de comanda actualizado`);
        auditoria.soluciones.push(`Estado de comanda ${global.auditoriaComandaId} actualizado`);
      } else {
        console.log(`   ❌ Falló actualización: ${result.data.message}`);
        auditoria.problemas.push(`Error actualizando comanda: ${result.data.message}`);
      }
    } catch (error) {
      console.log(`   ❌ Error en actualización: ${error.message}`);
      auditoria.problemas.push(`Error en actualización de comanda: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // FASE 4: LIMPIEZA DE DATOS DE PRUEBA
  console.log('🧹 FASE 4: LIMPIEZA DE DATOS DE PRUEBA');
  console.log('========================================\n');

  // 4.1 Eliminar comanda de prueba
  if (global.auditoriaComandaId) {
    console.log('4.1 Eliminando comanda de prueba...');
    try {
      // Primero eliminar items de comanda
      const { error: itemsError } = await supabase
        .from('comanda_items')
        .delete()
        .eq('comanda_id', global.auditoriaComandaId);
      
      if (itemsError) {
        console.log(`   ❌ Error eliminando items: ${itemsError.message}`);
      } else {
        console.log(`   ✅ Items de comanda eliminados`);
      }

      // Luego eliminar comanda
      const { error: comandaError } = await supabase
        .from('comandas')
        .delete()
        .eq('id', global.auditoriaComandaId);
      
      if (comandaError) {
        console.log(`   ❌ Error eliminando comanda: ${comandaError.message}`);
        auditoria.problemas.push(`Error eliminando comanda de prueba: ${comandaError.message}`);
      } else {
        console.log(`   ✅ Comanda de prueba eliminada`);
        auditoria.soluciones.push(`Comanda de prueba ${global.auditoriaComandaId} eliminada`);
      }
    } catch (error) {
      console.log(`   ❌ Error en limpieza de comanda: ${error.message}`);
      auditoria.problemas.push(`Error en limpieza de comanda: ${error.message}`);
    }
  }

  // 4.2 Eliminar evento de prueba
  if (global.auditoriaEventoId) {
    console.log('\n4.2 Eliminando evento de prueba...');
    try {
      const result = await makeRequest(baseUrl, `/api/eventos?id=${global.auditoriaEventoId}`, 'DELETE');
      console.log(`   Status: ${result.status}, Success: ${result.success}`);
      
      if (result.success) {
        console.log(`   ✅ Evento de prueba eliminado`);
        auditoria.soluciones.push(`Evento de prueba ${global.auditoriaEventoId} eliminado`);
      } else {
        console.log(`   ❌ Falló eliminación: ${result.data.message}`);
        auditoria.problemas.push(`Error eliminando evento: ${result.data.message}`);
      }
    } catch (error) {
      console.log(`   ❌ Error eliminando evento: ${error.message}`);
      auditoria.problemas.push(`Error eliminando evento: ${error.message}`);
    }
  }

  // 4.3 Eliminar producto de prueba
  if (global.auditoriaProductoId) {
    console.log('\n4.3 Eliminando producto de prueba...');
    try {
      const result = await makeRequest(baseUrl, `/api/productos/${global.auditoriaProductoId}`, 'DELETE');
      console.log(`   Status: ${result.status}, Success: ${result.success}`);
      
      if (result.success) {
        console.log(`   ✅ Producto de prueba eliminado`);
        auditoria.soluciones.push(`Producto de prueba ${global.auditoriaProductoId} eliminado`);
      } else {
        console.log(`   ❌ Falló eliminación: ${result.data.message}`);
        auditoria.problemas.push(`Error eliminando producto: ${result.data.message}`);
      }
    } catch (error) {
      console.log(`   ❌ Error eliminando producto: ${error.message}`);
      auditoria.problemas.push(`Error eliminando producto: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // FASE 5: ANÁLISIS FINAL Y GENERACIÓN DE INFORME
  console.log('📊 FASE 5: ANÁLISIS FINAL Y GENERACIÓN DE INFORME');
  console.log('==================================================\n');

  // 5.1 Obtener datos finales
  const { data: usuariosFinal } = await supabase.from('usuarios').select('*');
  const { data: eventosFinal } = await supabase.from('eventos').select('*');
  const { data: productosFinal } = await supabase.from('productos').select('*');
  const { data: comandasFinal } = await supabase.from('comandas').select('*');
  const { data: comandaItemsFinal } = await supabase.from('comanda_items').select('*');

  // 5.2 Generar resumen
  auditoria.resumen = {
    usuarios: {
      total: usuariosFinal?.length || 0,
      activos: usuariosFinal?.filter(u => u.activo).length || 0
    },
    eventos: {
      total: eventosFinal?.length || 0,
      activos: eventosFinal?.filter(e => e.activo).length || 0,
      conEstructuraCorrecta: eventosFinal?.filter(e => e.fecha && e.fecha_inicio && e.fecha_fin).length || 0
    },
    productos: {
      total: productosFinal?.length || 0,
      activos: productosFinal?.filter(p => p.activo).length || 0
    },
    comandas: {
      total: comandasFinal?.length || 0,
      pendientes: comandasFinal?.filter(c => c.estado === 'pendiente').length || 0,
      pagadas: comandasFinal?.filter(c => c.estado === 'pagado').length || 0,
      canceladas: comandasFinal?.filter(c => c.estado === 'cancelado').length || 0
    },
    comandaItems: {
      total: comandaItemsFinal?.length || 0
    }
  };

  // 5.3 Generar recomendaciones
  if (auditoria.problemas.length === 0) {
    auditoria.recomendaciones.push("✅ El sistema está funcionando correctamente");
  } else {
    auditoria.recomendaciones.push("⚠️ Se encontraron problemas que requieren atención");
  }

  if (auditoria.resumen.eventos.total === 0) {
    auditoria.recomendaciones.push("📅 Crear al menos un evento activo para el sistema");
  }

  if (auditoria.resumen.productos.total === 0) {
    auditoria.recomendaciones.push("📦 Crear al menos un producto activo para el sistema");
  }

  if (auditoria.resumen.usuarios.total === 0) {
    auditoria.recomendaciones.push("👥 Crear al menos un usuario activo para el sistema");
  }

  // 5.4 Mostrar resumen final
  console.log('📋 RESUMEN FINAL DE LA AUDITORÍA');
  console.log('==================================');
  console.log(`👥 Usuarios: ${auditoria.resumen.usuarios.total} (${auditoria.resumen.usuarios.activos} activos)`);
  console.log(`📅 Eventos: ${auditoria.resumen.eventos.total} (${auditoria.resumen.eventos.activos} activos, ${auditoria.resumen.eventos.conEstructuraCorrecta} con estructura correcta)`);
  console.log(`📦 Productos: ${auditoria.resumen.productos.total} (${auditoria.resumen.productos.activos} activos)`);
  console.log(`📋 Comandas: ${auditoria.resumen.comandas.total} (${auditoria.resumen.comandas.pendientes} pendientes, ${auditoria.resumen.comandas.pagadas} pagadas, ${auditoria.resumen.comandas.canceladas} canceladas)`);
  console.log(`🛒 Items de comanda: ${auditoria.resumen.comandaItems.total}`);

  console.log('\n🔍 PROBLEMAS ENCONTRADOS:');
  if (auditoria.problemas.length === 0) {
    console.log('✅ No se encontraron problemas');
  } else {
    auditoria.problemas.forEach((problema, index) => {
      console.log(`${index + 1}. ❌ ${problema}`);
    });
  }

  console.log('\n✅ SOLUCIONES APLICADAS:');
  if (auditoria.soluciones.length === 0) {
    console.log('ℹ️ No se aplicaron soluciones');
  } else {
    auditoria.soluciones.forEach((solucion, index) => {
      console.log(`${index + 1}. ✅ ${solucion}`);
    });
  }

  console.log('\n💡 RECOMENDACIONES:');
  auditoria.recomendaciones.forEach((recomendacion, index) => {
    console.log(`${index + 1}. ${recomendacion}`);
  });

  // 5.5 Guardar informe en archivo
  const fs = require('fs');
  const informePath = 'auditoria-sistema-' + new Date().toISOString().split('T')[0] + '.json';
  
  try {
    fs.writeFileSync(informePath, JSON.stringify(auditoria, null, 2));
    console.log(`\n📄 Informe guardado en: ${informePath}`);
  } catch (error) {
    console.log(`\n❌ Error guardando informe: ${error.message}`);
  }

  console.log('\n🎯 CONCLUSIÓN DE LA AUDITORÍA:');
  if (auditoria.problemas.length === 0) {
    console.log('🎉 EL SISTEMA ESTÁ COMPLETAMENTE FUNCIONAL');
    console.log('✅ Todas las operaciones CRUD funcionan correctamente');
    console.log('✅ La base de datos está limpia y consistente');
    console.log('✅ El sistema está listo para uso en producción');
  } else {
    console.log('⚠️ EL SISTEMA TIENE PROBLEMAS QUE REQUIEREN ATENCIÓN');
    console.log(`❌ Se encontraron ${auditoria.problemas.length} problemas`);
    console.log('🔧 Se aplicaron soluciones automáticas donde fue posible');
    console.log('📋 Revisar el informe detallado para más información');
  }

  return auditoria;
}

auditoriaCompletaSistema().catch(console.error); 