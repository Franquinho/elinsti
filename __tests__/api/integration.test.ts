import { POST as createProducto } from '@/app/api/productos/route';
import { DELETE as deleteProducto } from '@/app/api/productos/[id]/route';
import { POST as createComanda } from '@/app/api/comandas/create/route';
import { GET as getProductos } from '@/app/api/productos/list/route';

describe('Flujo de Integración - Productos y Comandas', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería manejar correctamente el ciclo completo de un producto', async () => {
    // 1. Crear un producto
    const nuevoProducto = { 
      nombre: 'Producto Test Integración', 
      precio: 25, 
      emoji: '🧪',
      activo: true 
    };
    
    global.mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null })
        })
      }),
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ 
            data: { id: 999, ...nuevoProducto }, 
            error: null 
          })
        })
      })
    });

    const createRequest = new Request('http://localhost/api/productos', {
      method: 'POST',
      body: JSON.stringify(nuevoProducto),
    });

    const createResponse = await createProducto(createRequest);
    const createData = await createResponse.json();

    expect(createResponse.status).toBe(200);
    expect(createData.success).toBe(true);
    expect(createData.producto.nombre).toBe('Producto Test Integración');

    const productoId = createData.producto.id;

    // 2. Usar el producto en una comanda
    const comandaData = {
      usuario_id: 1,
      evento_id: 1,
      total: 50,
      nombre_cliente: 'Cliente Test',
      productos: [{ id: productoId, cantidad: 2, precio: 25 }]
    };

    global.mockSupabase.from.mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: { id: 888 }, error: null })
        })
      })
    });

    const comandaRequest = new Request('http://localhost/api/comandas/create', {
      method: 'POST',
      body: JSON.stringify(comandaData),
    });

    const comandaResponse = await createComanda(comandaRequest);
    const comandaDataResponse = await comandaResponse.json();

    expect(comandaResponse.status).toBe(200);
    expect(comandaDataResponse.success).toBe(true);

    // 3. Intentar eliminar el producto (debería desactivarlo porque está en uso)
    global.mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ 
            data: { id: productoId, nombre: 'Producto Test Integración', activo: true }, 
            error: null 
          }),
          limit: jest.fn().mockResolvedValue({ 
            data: [{ comanda_id: 888 }], 
            error: null 
          })
        })
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: { id: productoId, nombre: 'Producto Test Integración', activo: false }, 
              error: null 
            })
          })
        })
      })
    });

    const deleteRequest = new Request('http://localhost/api/productos/999', {
      method: 'DELETE',
    });

    const deleteResponse = await deleteProducto(deleteRequest, { params: { id: '999' } });
    const deleteData = await deleteResponse.json();

    expect(deleteResponse.status).toBe(200);
    expect(deleteData.success).toBe(true);
    expect(deleteData.message).toContain('desactivado');
    expect(deleteData.producto.activo).toBe(false);

    // 4. Verificar que el producto no aparece en la lista de productos activos
    global.mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ 
            data: [], // No hay productos activos
            error: null 
          })
        })
      })
    });

    const listResponse = await getProductos();
    const listData = await listResponse.json();

    expect(listResponse.status).toBe(200);
    expect(listData.success).toBe(true);
    expect(listData.productos).toEqual([]);
  });

  it('debería eliminar físicamente un producto que no está siendo usado', async () => {
    // Crear un producto que no se usa en comandas
    const productoNoUsado = { 
      nombre: 'Producto No Usado', 
      precio: 10, 
      emoji: '📦',
      activo: true 
    };

    global.mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ 
            data: { id: 777, ...productoNoUsado }, 
            error: null 
          }),
          limit: jest.fn().mockResolvedValue({ 
            data: [], // No está siendo usado
            error: null 
          })
        })
      }),
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null })
      })
    });

    const deleteRequest = new Request('http://localhost/api/productos/777', {
      method: 'DELETE',
    });

    const deleteResponse = await deleteProducto(deleteRequest, { params: { id: '777' } });
    const deleteData = await deleteResponse.json();

    expect(deleteResponse.status).toBe(200);
    expect(deleteData.success).toBe(true);
    expect(deleteData.message).toContain('eliminado correctamente');
  });
}); 