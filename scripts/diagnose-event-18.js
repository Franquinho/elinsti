const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://joebhvyfcftobrngcqor.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZWJodnlmY2Z0b2Jybm5nY3FvciIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzMwNzI5NzE5LCJleHAiOjIwNDYzMDU3MTl9.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseEvent18() {
  console.log('🔍 DIAGNÓSTICO DEL EVENTO ID 18');
  console.log('=====================================\n');

  try {
    // 1. Verificar si el evento 18 existe
    console.log('1️⃣ Verificando si el evento ID 18 existe...');
    const { data: evento18, error: eventoError } = await supabase
      .from('eventos')
      .select('*')
      .eq('id', 18)
      .single();

    if (eventoError) {
      console.log('❌ Error obteniendo evento 18:', eventoError);
      return;
    }

    if (!evento18) {
      console.log('❌ El evento ID 18 no existe');
      return;
    }

    console.log('✅ Evento 18 encontrado:');
    console.log(JSON.stringify(evento18, null, 2));

    // 2. Verificar si está activo
    console.log('\n2️⃣ Verificando si el evento está activo...');
    if (evento18.activo) {
      console.log('✅ El evento está activo');
    } else {
      console.log('❌ El evento NO está activo');
      console.log('🔧 Activando el evento...');
      
      const { error: updateError } = await supabase
        .from('eventos')
        .update({ activo: true })
        .eq('id', 18);

      if (updateError) {
        console.log('❌ Error activando evento:', updateError);
      } else {
        console.log('✅ Evento activado correctamente');
      }
    }

    // 3. Verificar el producto 21
    console.log('\n3️⃣ Verificando el producto ID 21...');
    const { data: producto21, error: productoError } = await supabase
      .from('productos')
      .select('*')
      .eq('id', 21)
      .single();

    if (productoError) {
      console.log('❌ Error obteniendo producto 21:', productoError);
      return;
    }

    if (!producto21) {
      console.log('❌ El producto ID 21 no existe');
      return;
    }

    console.log('✅ Producto 21 encontrado:');
    console.log(JSON.stringify(producto21, null, 2));

    // 4. Verificar si está activo
    if (producto21.activo) {
      console.log('✅ El producto está activo');
    } else {
      console.log('❌ El producto NO está activo');
    }

    // 5. Probar la creación de comanda con datos exactos del frontend
    console.log('\n4️⃣ Probando creación de comanda con datos exactos...');
    const comandaData = {
      evento_id: 18,
      total: 7000,
      nombre_cliente: 'Mauri',
      usuario_id: 4,
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

    // Simular la llamada a la API
    const response = await fetch('https://elinsti.vercel.app/api/comandas/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(comandaData)
    });

    const responseData = await response.json();
    
    console.log('\n📋 Respuesta de la API:');
    console.log('Status:', response.status);
    console.log('Body:', JSON.stringify(responseData, null, 2));

    if (response.ok && responseData.success) {
      console.log('✅ Comanda creada exitosamente');
    } else {
      console.log('❌ Error creando comanda');
      console.log('Detalles del error:', responseData);
    }

  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error);
  }
}

diagnoseEvent18(); 