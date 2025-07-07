/**
 * Tests de Integración para Staging
 * Estos tests se ejecutan contra Supabase real (staging)
 * Ejecutar: npm test -- --testPathPattern="integration-staging"
 */

import { createClient } from '@supabase/supabase-js';
import { apiClient } from '@/lib/api';

// Configuración para staging
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_STAGING;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY_STAGING;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('❌ Variables de entorno de staging no configuradas');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

describe('🧪 Tests de Integración - Staging', () => {
  let testUserId: number;
  let testProductoId: number;
  let testEventoId: number;
  let testComandaId: number;

  beforeAll(async () => {
    console.log('🚀 Iniciando tests de integración en staging...');
    
    // Verificar conexión
    const { data, error } = await supabase.from('usuarios').select('count').limit(1);
    if (error) {
      throw new Error(`❌ No se puede conectar a Supabase staging: ${error.message}`);
    }
    console.log('✅ Conexión a staging exitosa');
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    console.log('🧹 Limpiando datos de prueba...');
    if (testComandaId) {
      await supabase.from('comanda_items').delete().eq('comanda_id', testComandaId);
      await supabase.from('comandas').delete().eq('id', testComandaId);
    }
    if (testProductoId) {
      await supabase.from('productos').delete().eq('id', testProductoId);
    }
    if (testEventoId) {
      await supabase.from('eventos').delete().eq('id', testEventoId);
    }
    if (testUserId) {
      await supabase.from('usuarios').delete().eq('id', testUserId);
    }
    console.log('✅ Limpieza completada');
  });

  describe('👤 Autenticación', () => {
    test('✅ Login con credenciales válidas', async () => {
      const loginData = {
        email: 'admin@elinsti.com',
        password: 'Admin123!'
      };

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const result = await response.json();
      
      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(loginData.email);
      expect(result.user.rol).toBe('admin');
    });

    test('❌ Login con credenciales inválidas', async () => {
      const loginData = {
        email: 'admin@elinsti.com',
        password: 'password_incorrecto'
      };

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const result = await response.json();
      
      expect(response.status).toBe(401);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Credenciales incorrectas');
    });

    test('❌ Login con email inexistente', async () => {
      const loginData = {
        email: 'usuario_inexistente@test.com',
        password: 'Admin123!'
      };

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const result = await response.json();
      
      expect(response.status).toBe(401);
      expect(result.success).toBe(false);
    });
  });

  describe('📦 Gestión de Productos', () => {
    test('✅ Crear producto nuevo', async () => {
      const productoData = {
        nombre: 'Test Producto Staging',
        precio: 2500,
        emoji: '🧪',
        activo: true
      };

      const { data, error } = await supabase
        .from('productos')
        .insert(productoData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.nombre).toBe(productoData.nombre);
      expect(data.precio).toBe(productoData.precio);
      expect(data.activo).toBe(true);

      testProductoId = data.id;
    });

    test('✅ Listar productos activos', async () => {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('activo', true);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      
      // Verificar que todos los productos están activos
      data.forEach(producto => {
        expect(producto.activo).toBe(true);
        expect(producto.nombre).toBeDefined();
        expect(producto.precio).toBeGreaterThan(0);
      });
    });

    test('✅ Actualizar producto', async () => {
      const updateData = {
        nombre: 'Test Producto Staging Actualizado',
        precio: 3000
      };

      const { data, error } = await supabase
        .from('productos')
        .update(updateData)
        .eq('id', testProductoId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.nombre).toBe(updateData.nombre);
      expect(data.precio).toBe(updateData.precio);
    });

    test('✅ Desactivar producto', async () => {
      const { data, error } = await supabase
        .from('productos')
        .update({ activo: false })
        .eq('id', testProductoId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.activo).toBe(false);
    });
  });

  describe('🎉 Gestión de Eventos', () => {
    test('✅ Crear evento nuevo', async () => {
      const eventoData = {
        nombre: 'Test Evento Staging',
        descripcion: 'Evento de prueba para tests de integración',
        fecha_inicio: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        fecha_fin: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        capacidad_maxima: 50,
        precio_entrada: 15000,
        ubicacion: 'Sala de Pruebas',
        imagen_url: 'https://test.com/imagen.jpg',
        activo: true
      };

      const { data, error } = await supabase
        .from('eventos')
        .insert(eventoData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.nombre).toBe(eventoData.nombre);
      expect(data.activo).toBe(true);

      testEventoId = data.id;
    });

    test('✅ Listar eventos activos', async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('activo', true);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });
  });

  describe('🛒 Gestión de Comandas', () => {
    test('✅ Crear comanda completa', async () => {
      // Primero reactivar el producto para la comanda
      await supabase
        .from('productos')
        .update({ activo: true })
        .eq('id', testProductoId);

      const comandaData = {
        cliente_nombre: 'Cliente Test Staging',
        total: 5000,
        metodo_pago: 'efectivo',
        estado: 'pendiente',
        evento_id: testEventoId,
        usuario_id: 1 // Asumiendo que existe un usuario con ID 1
      };

      const { data: comanda, error: comandaError } = await supabase
        .from('comandas')
        .insert(comandaData)
        .select()
        .single();

      expect(comandaError).toBeNull();
      expect(comanda).toBeDefined();
      expect(comanda.cliente_nombre).toBe(comandaData.cliente_nombre);
      expect(comanda.numero_comanda).toBeDefined();

      testComandaId = comanda.id;

      // Crear items de la comanda
      const itemData = {
        comanda_id: comanda.id,
        producto_id: testProductoId,
        cantidad: 2,
        precio_unitario: 2500,
        subtotal: 5000
      };

      const { data: item, error: itemError } = await supabase
        .from('comanda_items')
        .insert(itemData)
        .select()
        .single();

      expect(itemError).toBeNull();
      expect(item).toBeDefined();
      expect(item.cantidad).toBe(itemData.cantidad);
      expect(item.subtotal).toBe(itemData.subtotal);
    });

    test('✅ Actualizar estado de comanda', async () => {
      const { data, error } = await supabase
        .from('comandas')
        .update({ estado: 'completada' })
        .eq('id', testComandaId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.estado).toBe('completada');
    });

    test('✅ Listar comandas por evento', async () => {
      const { data, error } = await supabase
        .from('comandas')
        .select(`
          *,
          comanda_items (
            *,
            productos (*)
          )
        `)
        .eq('evento_id', testEventoId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });
  });

  describe('📊 Estadísticas', () => {
    test('✅ Obtener estadísticas de ventas', async () => {
      const { data, error } = await supabase
        .from('estadisticas_ventas')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    test('✅ Obtener productos más vendidos', async () => {
      const { data, error } = await supabase
        .from('productos_mas_vendidos')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('🔒 Seguridad y Validaciones', () => {
    test('✅ Validar constraints de base de datos', async () => {
      // Intentar crear producto con precio negativo
      const { error } = await supabase
        .from('productos')
        .insert({
          nombre: 'Producto Inválido',
          precio: -100,
          emoji: '❌'
        });

      expect(error).toBeDefined();
      expect(error.message).toContain('check constraint');
    });

    test('✅ Validar fechas de eventos', async () => {
      // Intentar crear evento con fecha fin anterior a fecha inicio
      const { error } = await supabase
        .from('eventos')
        .insert({
          nombre: 'Evento Inválido',
          fecha_inicio: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          fecha_fin: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });

      expect(error).toBeDefined();
      expect(error.message).toContain('check constraint');
    });
  });
}); 