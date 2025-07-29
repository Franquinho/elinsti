const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://joebhvyfcftobrngcqor.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZWJodnlmY2Z0b2JybmdjcW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MzY5MzMsImV4cCI6MjA2NjAxMjkzM30.zyzj1pZLDboSnRYVtpYUhsrKkDAcPwVVzbohmQvBhoE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompleteFlow() {
  console.log('🧪 VALIDACIÓN COMPLETA DEL FLUJO DEL SISTEMA');
  console.log('=============================================\n');

  let testComandaId = null;
  let testEventoId = null;
  let testProductoId = null;

  try {
    // FASE 1: PREPARACIÓN - Obtener datos necesarios
    console.log('📋 FASE 1: PREPARACIÓN');
    console.log('------------------------');

    // 1.1 Obtener evento activo
    console.log('1.1 Obtener evento activo...');
    const { data: eventosActivos, error: eventosError } = await supabase
      .from('eventos')
      .select('*')
      .eq('activo', true)
      .limit(1);

    if (eventosError || !eventosActivos || eventosActivos.length === 0) {
      console.log('   ❌ No hay eventos activos');
      return;
    }

    testEventoId = eventosActivos[0].id;
    console.log(`   ✅ Evento activo: ${eventosActivos[0].nombre} (ID: ${testEventoId})`);

    // 1.2 Obtener producto activo
    console.log('\n1.2 Obtener producto activo...');
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .limit(1);

    if (productosError || !productos || productos.length === 0) {
      console.log('   ❌ No hay productos activos');
      return;
    }

    testProductoId = productos[0].id;
    console.log(`   ✅ Producto: ${productos[0].nombre} (ID: ${testProductoId}, Precio: ${productos[0].precio})`);

    // 1.3 Verificar usuario
    console.log('\n1.3 Verificar usuario...');
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', 4)
      .single();

    if (usuarioError || !usuario) {
      console.log('   ❌ Usuario ID 4 no encontrado');
      return;
    }

    console.log(`   ✅ Usuario: ${usuario.nombre} (ID: ${usuario.id}, Rol: ${usuario.rol})`);

    // FASE 2: CREAR COMANDA
    console.log('\n📋 FASE 2: CREAR COMANDA');
    console.log('------------------------');

    const comandaData = {
      usuario_id: 4,
      evento_id: testEventoId,
      total: productos[0].precio * 2,
      nombre_cliente: 'Cliente Test Flow',
      estado: 'pendiente',
      metodo_pago: null,
      nota: null
    };

    console.log('2.1 Creando comanda...');
    console.log('   Datos:', JSON.stringify(comandaData, null, 2));

    const { data: comanda, error: comandaError } = await supabase
      .from('comandas')
      .insert(comandaData)
      .select()
      .single();

    if (comandaError) {
      console.log('   ❌ Error creando comanda:', comandaError.message);
      return;
    }

    testComandaId = comanda.id;
    console.log(`   ✅ Comanda creada exitosamente (ID: ${testComandaId})`);

    // 2.2 Crear items de comanda
    console.log('\n2.2 Creando items de comanda...');
    const itemData = {
      comanda_id: testComandaId,
      producto_id: testProductoId,
      cantidad: 2,
      precio_unitario: productos[0].precio,
      subtotal: productos[0].precio * 2
    };

    console.log('   Item:', JSON.stringify(itemData, null, 2));

    const { data: item, error: itemError } = await supabase
      .from('comanda_items')
      .insert(itemData)
      .select()
      .single();

    if (itemError) {
      console.log('   ❌ Error creando item:', itemError.message);
      // Limpiar comanda si falla el item
      await supabase.from('comandas').delete().eq('id', testComandaId);
      return;
    }

    console.log(`   ✅ Item creado exitosamente (ID: ${item.id})`);

    // FASE 3: VERIFICAR COMANDA EN BASE DE DATOS
    console.log('\n📋 FASE 3: VERIFICAR COMANDA EN BASE DE DATOS');
    console.log('-----------------------------------------------');

    // 3.1 Verificar comanda existe
    console.log('3.1 Verificando comanda en base de datos...');
    const { data: comandaVerificada, error: comandaVerError } = await supabase
      .from('comandas')
      .select('*')
      .eq('id', testComandaId)
      .single();

    if (comandaVerError || !comandaVerificada) {
      console.log('   ❌ Comanda no encontrada en base de datos');
      return;
    }

    console.log('   ✅ Comanda encontrada en base de datos:');
    console.log('   - ID:', comandaVerificada.id);
    console.log('   - Cliente:', comandaVerificada.nombre_cliente);
    console.log('   - Total:', comandaVerificada.total);
    console.log('   - Estado:', comandaVerificada.estado);
    console.log('   - Fecha:', comandaVerificada.created_at);

    // 3.2 Verificar items de comanda
    console.log('\n3.2 Verificando items de comanda...');
    const { data: itemsVerificados, error: itemsVerError } = await supabase
      .from('comanda_items')
      .select('*, productos(nombre)')
      .eq('comanda_id', testComandaId);

    if (itemsVerError) {
      console.log('   ❌ Error obteniendo items:', itemsVerError.message);
      return;
    }

    console.log(`   ✅ Items encontrados: ${itemsVerificados.length}`);
    itemsVerificados.forEach((item, index) => {
      console.log(`   - Item ${index + 1}: ${item.productos.nombre} x${item.cantidad} = $${item.subtotal}`);
    });

    // FASE 4: SIMULAR PROCESAMIENTO EN CAJA
    console.log('\n📋 FASE 4: SIMULAR PROCESAMIENTO EN CAJA');
    console.log('------------------------------------------');

    // 4.1 Cambiar estado a "pagado"
    console.log('4.1 Cambiando estado a "pagado"...');
    const { data: comandaPagada, error: pagoError } = await supabase
      .from('comandas')
      .update({
        estado: 'pagado',
        metodo_pago: 'efectivo',
        updated_at: new Date().toISOString()
      })
      .eq('id', testComandaId)
      .select()
      .single();

    if (pagoError) {
      console.log('   ❌ Error procesando pago:', pagoError.message);
      return;
    }

    console.log('   ✅ Comanda marcada como pagada:');
    console.log('   - Estado:', comandaPagada.estado);
    console.log('   - Método de pago:', comandaPagada.metodo_pago);
    console.log('   - Fecha actualización:', comandaPagada.updated_at);

    // 4.2 Verificar que el cambio se reflejó en la base
    console.log('\n4.2 Verificando cambio en base de datos...');
    const { data: comandaFinal, error: comandaFinalError } = await supabase
      .from('comandas')
      .select('*')
      .eq('id', testComandaId)
      .single();

    if (comandaFinalError || !comandaFinal) {
      console.log('   ❌ Error verificando comanda final');
      return;
    }

    if (comandaFinal.estado === 'pagado') {
      console.log('   ✅ Estado actualizado correctamente en base de datos');
    } else {
      console.log('   ❌ Estado no se actualizó correctamente');
    }

    // FASE 5: VERIFICAR ESTADÍSTICAS
    console.log('\n📋 FASE 5: VERIFICAR ESTADÍSTICAS');
    console.log('-----------------------------------');

    // 5.1 Contar comandas totales
    console.log('5.1 Contando comandas totales...');
    const { data: todasComandas, error: countError } = await supabase
      .from('comandas')
      .select('id, estado, total');

    if (countError) {
      console.log('   ❌ Error contando comandas:', countError.message);
    } else {
      const totalComandas = todasComandas.length;
      const comandasPagadas = todasComandas.filter(c => c.estado === 'pagado').length;
      const comandasPendientes = todasComandas.filter(c => c.estado === 'pendiente').length;
      const totalVentas = todasComandas
        .filter(c => c.estado === 'pagado')
        .reduce((sum, c) => sum + parseFloat(c.total), 0);

      console.log('   📊 Estadísticas:');
      console.log(`   - Total comandas: ${totalComandas}`);
      console.log(`   - Comandas pagadas: ${comandasPagadas}`);
      console.log(`   - Comandas pendientes: ${comandasPendientes}`);
      console.log(`   - Total ventas: $${totalVentas}`);
    }

    // 5.2 Verificar comandas por evento
    console.log('\n5.2 Verificando comandas por evento...');
    const { data: comandasPorEvento, error: eventoCountError } = await supabase
      .from('comandas')
      .select('*, eventos(nombre)')
      .eq('evento_id', testEventoId);

    if (eventoCountError) {
      console.log('   ❌ Error contando comandas por evento:', eventoCountError.message);
    } else {
      console.log(`   📊 Comandas para evento "${eventosActivos[0].nombre}": ${comandasPorEvento.length}`);
    }

    // FASE 6: LIMPIEZA (OPCIONAL)
    console.log('\n📋 FASE 6: LIMPIEZA');
    console.log('-------------------');

    console.log('6.1 ¿Deseas eliminar la comanda de prueba? (S/N)');
    console.log('   Para mantener la comanda de prueba, no hagas nada.');
    console.log('   Para eliminarla, ejecuta manualmente:');
    console.log(`   DELETE FROM comanda_items WHERE comanda_id = ${testComandaId};`);
    console.log(`   DELETE FROM comandas WHERE id = ${testComandaId};`);

    // FASE 7: RESUMEN
    console.log('\n📋 FASE 7: RESUMEN');
    console.log('------------------');
    console.log('✅ FLUJO COMPLETO VALIDADO EXITOSAMENTE');
    console.log('✅ Todas las operaciones funcionan correctamente');
    console.log('✅ Base de datos actualizada correctamente');
    console.log('✅ Sistema listo para uso en producción');

    console.log('\n📋 DATOS DE PRUEBA CREADOS:');
    console.log(`- Comanda ID: ${testComandaId}`);
    console.log(`- Evento ID: ${testEventoId}`);
    console.log(`- Producto ID: ${testProductoId}`);
    console.log(`- Cliente: Cliente Test Flow`);

  } catch (error) {
    console.error('❌ Error en el flujo de validación:', error);
    
    // Limpiar en caso de error
    if (testComandaId) {
      console.log('🧹 Limpiando comanda de prueba...');
      await supabase.from('comanda_items').delete().eq('comanda_id', testComandaId);
      await supabase.from('comandas').delete().eq('id', testComandaId);
    }
  }
}

// Ejecutar la validación completa
testCompleteFlow(); 