import { GET as getStats } from '@/app/api/stats/route';
import { POST as createProducto } from '@/app/api/productos/route';
import { PATCH as updateProducto, DELETE as deleteProducto } from '@/app/api/productos/[id]/route';

describe('API de Administración', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });
    
  // Pruebas para /api/stats
  describe('GET /api/stats', () => {
    it('debería calcular y devolver las estadísticas correctamente', async () => {
        const mockComandas = [
            { fecha_creacion: new Date().toISOString(), total: 100, estado: 'pagado', metodo_pago: 'efectivo', productos: [{ cantidad: 2 }] },
            { fecha_creacion: new Date().toISOString(), total: 50, estado: 'cancelado', metodo_pago: 'efectivo', productos: [{ cantidad: 1 }] },
        ];
        
        // Configurar el mock para devolver los datos esperados
        global.mockSupabase.from.mockReturnValue({
          select: jest.fn().mockResolvedValue({ data: mockComandas, error: null })
        });

        const response = await getStats();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.stats.ventasHoy).toBe(100);
        expect(data.stats.montoCancelado).toBe(50);
        expect(data.stats.comandasTotales).toBe(2);
        expect(data.stats.tasaCancelacion).toBe(50);
        
        expect(global.mockSupabase.from).toHaveBeenCalledWith('comandas');
    });
  });

  // Pruebas para /api/productos
  describe('POST /api/productos', () => {
    it('debería crear un nuevo producto', async () => {
        const nuevoProducto = { nombre: 'Test Producto', precio: 10, emoji: '🧪' };
        
        // Configurar el mock para devolver el producto creado
        global.mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: null }) // No existe producto con ese nombre
            })
          }),
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ 
                data: { id: 1, ...nuevoProducto, activo: true }, 
                error: null 
              })
            })
          })
        });
        
        const request = new Request('http://localhost/api/productos', {
            method: 'POST',
            body: JSON.stringify(nuevoProducto),
        });

        const response = await createProducto(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.producto.nombre).toBe('Test Producto');
        expect(global.mockSupabase.from).toHaveBeenCalledWith('productos');
    });
  });
    
  // Pruebas para /api/productos/[id]
  describe('PATCH /api/productos/[id]', () => {
    it('debería actualizar un producto existente', async () => {
        const productoActualizado = { nombre: 'Producto Actualizado' };

        // Configurar el mock para devolver el producto actualizado
        global.mockSupabase.from.mockReturnValue({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ 
                  data: { id: 1, ...productoActualizado }, 
                  error: null 
                })
              })
            })
          })
        });
        
        const request = new Request('http://localhost/api/productos/1', {
            method: 'PATCH',
            body: JSON.stringify(productoActualizado),
        });

        const response = await updateProducto(request, { params: { id: '1' } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.producto.nombre).toBe('Producto Actualizado');
        expect(global.mockSupabase.from).toHaveBeenCalledWith('productos');
    });
  });

  describe('DELETE /api/productos/[id]', () => {
    it('debería eliminar un producto que no está siendo usado', async () => {
        // Configurar el mock para simular que el producto no está siendo usado
        const mockFrom = jest.fn()
          .mockReturnValueOnce({
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ 
                  data: { id: 1, nombre: 'Test Producto', activo: true }, 
                  error: null 
                })
              })
            })
          })
          .mockReturnValueOnce({
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({ data: [], error: null })
              })
            })
          })
          .mockReturnValueOnce({
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null })
            })
          });

        global.mockSupabase.from = mockFrom;

        const request = new Request('http://localhost/api/productos/1', {
            method: 'DELETE',
        });

        const response = await deleteProducto(request, { params: { id: '1' } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toBe('Producto "Test Producto" eliminado correctamente');
        expect(global.mockSupabase.from).toHaveBeenCalledWith('productos');
    });

    it('debería desactivar un producto que está siendo usado en comandas', async () => {
        // Configurar el mock para simular que el producto está siendo usado
        const mockFrom = jest.fn()
          .mockReturnValueOnce({
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ 
                  data: { id: 1, nombre: 'Producto Usado', activo: true }, 
                  error: null 
                })
              })
            })
          })
          .mockReturnValueOnce({
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({ 
                  data: [{ comanda_id: 1 }], 
                  error: null 
                })
              })
            })
          })
          .mockReturnValueOnce({
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({ 
                    data: { id: 1, nombre: 'Producto Usado', activo: false }, 
                    error: null 
                  })
                })
              })
            })
          });

        global.mockSupabase.from = mockFrom;

        const request = new Request('http://localhost/api/productos/1', {
            method: 'DELETE',
        });

        const response = await deleteProducto(request, { params: { id: '1' } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toBe('Producto "Producto Usado" desactivado (está siendo usado en comandas)');
        expect(data.producto.activo).toBe(false);
    });

    it('debería devolver error si el producto no existe', async () => {
        // Configurar el mock para simular que el producto no existe
        const mockFrom = jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ 
                data: null, 
                error: { message: 'No rows returned' } 
              })
            })
          })
        });

        global.mockSupabase.from = mockFrom;

        const request = new Request('http://localhost/api/productos/999', {
            method: 'DELETE',
        });

        const response = await deleteProducto(request, { params: { id: '999' } });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.success).toBe(false);
        expect(data.message).toBe('Producto no encontrado');
    });
  });
}); 