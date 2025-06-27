const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
  try {
    console.log('🔍 Verificando estado de la base de datos...');
    
    // Verificar si existe la tabla eventos
    const { data: eventos, error: eventosError } = await supabase
      .from('eventos')
      .select('*')
      .limit(1);
    
    if (eventosError) {
      console.log('❌ Tabla eventos no existe o hay error:', eventosError.message);
      console.log('🔄 Creando tabla eventos...');
      
      // Crear tabla eventos
      const createEventosSQL = `
        CREATE TABLE IF NOT EXISTS eventos (
          id BIGSERIAL PRIMARY KEY,
          nombre VARCHAR(255) NOT NULL,
          descripcion TEXT,
          fecha_inicio TIMESTAMPTZ NOT NULL,
          fecha_fin TIMESTAMPTZ NOT NULL,
          activo BOOLEAN DEFAULT true,
          capacidad_maxima INTEGER,
          precio_entrada DECIMAL(10,2) DEFAULT 0,
          ubicacion VARCHAR(255),
          imagen_url VARCHAR(500),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;
      
      const { error: createError } = await supabase.rpc('exec_sql', { sql: createEventosSQL });
      
      if (createError) {
        console.error('❌ Error creando tabla eventos:', createError);
      } else {
        console.log('✅ Tabla eventos creada correctamente');
      }
    } else {
      console.log('✅ Tabla eventos existe correctamente');
    }
    
    // Verificar si existe la tabla productos
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('*')
      .limit(1);
    
    if (productosError) {
      console.log('❌ Tabla productos no existe o hay error:', productosError.message);
      console.log('🔄 Creando tabla productos...');
      
      // Crear tabla productos
      const createProductosSQL = `
        CREATE TABLE IF NOT EXISTS productos (
          id BIGSERIAL PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL,
          precio DECIMAL(10,2) NOT NULL,
          emoji VARCHAR(10) DEFAULT '📦',
          activo BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;
      
      const { error: createError } = await supabase.rpc('exec_sql', { sql: createProductosSQL });
      
      if (createError) {
        console.error('❌ Error creando tabla productos:', createError);
      } else {
        console.log('✅ Tabla productos creada correctamente');
      }
    } else {
      console.log('✅ Tabla productos existe correctamente');
    }
    
    // Verificar si existe la tabla comandas
    const { data: comandas, error: comandasError } = await supabase
      .from('comandas')
      .select('*')
      .limit(1);
    
    if (comandasError) {
      console.log('❌ Tabla comandas no existe o hay error:', comandasError.message);
      console.log('🔄 Creando tabla comandas...');
      
      // Crear tabla comandas
      const createComandasSQL = `
        CREATE TABLE IF NOT EXISTS comandas (
          id BIGSERIAL PRIMARY KEY,
          usuario_id BIGINT,
          evento_id BIGINT,
          caja_id BIGINT,
          estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'cancelado')),
          total DECIMAL(10,2) NOT NULL,
          metodo_pago VARCHAR(20) NULL CHECK (metodo_pago IN ('invitacion', 'transferencia', 'efectivo', 'revisar')),
          nota TEXT NULL,
          nombre_cliente VARCHAR(30),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;
      
      const { error: createError } = await supabase.rpc('exec_sql', { sql: createComandasSQL });
      
      if (createError) {
        console.error('❌ Error creando tabla comandas:', createError);
      } else {
        console.log('✅ Tabla comandas creada correctamente');
      }
    } else {
      console.log('✅ Tabla comandas existe correctamente');
    }
    
    // Insertar datos de prueba si las tablas están vacías
    console.log('🔍 Verificando datos de prueba...');
    
    const { data: eventosCount } = await supabase
      .from('eventos')
      .select('*', { count: 'exact' });
    
    if (eventosCount && eventosCount.length === 0) {
      console.log('🔄 Insertando evento de prueba...');
      const { error: insertError } = await supabase
        .from('eventos')
        .insert({
          nombre: 'Evento Inicial',
          descripcion: 'Evento de prueba para el sistema',
          fecha_inicio: new Date().toISOString(),
          fecha_fin: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          activo: true
        });
      
      if (insertError) {
        console.error('❌ Error insertando evento de prueba:', insertError);
      } else {
        console.log('✅ Evento de prueba insertado correctamente');
      }
    }
    
    const { data: productosCount } = await supabase
      .from('productos')
      .select('*', { count: 'exact' });
    
    if (productosCount && productosCount.length === 0) {
      console.log('🔄 Insertando productos de prueba...');
      const { error: insertError } = await supabase
        .from('productos')
        .insert([
          { nombre: 'Cerveza Artesanal', precio: 2500, emoji: '🍺', activo: true },
          { nombre: 'Vino Tinto', precio: 3500, emoji: '🍷', activo: true },
          { nombre: 'Empanadas', precio: 1200, emoji: '🥟', activo: true },
          { nombre: 'Café Especial', precio: 1800, emoji: '☕', activo: true }
        ]);
      
      if (insertError) {
        console.error('❌ Error insertando productos de prueba:', insertError);
      } else {
        console.log('✅ Productos de prueba insertados correctamente');
      }
    }
    
    console.log('🎉 Verificación de base de datos completada');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    process.exit(1);
  }
}

checkDatabase(); 