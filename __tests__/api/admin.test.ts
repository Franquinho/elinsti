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
            { created_at: new Date().toISOString(), total: 100, estado: 'pagado', metodo_pago: 'efectivo', productos: [{ cantidad: 2 }] },
            { created_at: new Date().toISOString(), total: 50, estado: 'cancelado', metodo_pago: 'efectivo', productos: [{ cantidad: 1 }] },
        ];
        
        const fromSpy = jest.spyOn(global.mockSupabase, 'from').mockReturnValue(global.mockSupabase as any);
        const selectSpy = jest.spyOn(global.mockSupabase, 'select').mockResolvedValue({ data: mockComandas, error: null });

        const response = await getStats();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.stats.ventasHoy).toBe(100);
        expect(data.stats.montoCancelado).toBe(50);
        expect(data.stats.comandasTotales).toBe(2);
        expect(data.stats.tasaCancelacion).toBe(50);
        
        expect(fromSpy).toHaveBeenCalledWith('comandas');
    });
  });

  // Pruebas para /api/productos
  describe('POST /api/productos', () => {
    it('debería crear un nuevo producto', async () => {
        const nuevoProducto = { nombre: 'Test Producto', precio: 10, emoji: '🧪' };
        
        global.mockSupabase.from.mockReturnThis();
        global.mockSupabase.insert.mockReturnThis();
        global.mockSupabase.select.mockReturnThis();
        global.mockSupabase.single.mockResolvedValue({ data: { id: 1, ...nuevoProducto, activo: true }, error: null });
        
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

        global.mockSupabase.from.mockReturnThis();
        global.mockSupabase.update.mockReturnThis();
        global.mockSupabase.eq.mockReturnThis();
        global.mockSupabase.select.mockReturnThis();
        global.mockSupabase.single.mockResolvedValue({ data: { id: 1, ...productoActualizado }, error: null });
        
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
        expect(global.mockSupabase.eq).toHaveBeenCalledWith('id', '1');
    });
  });

  describe('DELETE /api/productos/[id]', () => {
    it('debería eliminar un producto', async () => {
        global.mockSupabase.from.mockReturnThis();
        global.mockSupabase.delete.mockReturnThis();
        global.mockSupabase.eq.mockResolvedValue({ error: null });

        const request = new Request('http://localhost/api/productos/1', {
            method: 'DELETE',
        });

        const response = await deleteProducto(request, { params: { id: '1' } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toBe('Producto eliminado correctamente');
        expect(global.mockSupabase.from).toHaveBeenCalledWith('productos');
        expect(global.mockSupabase.eq).toHaveBeenCalledWith('id', '1');
    });
  });
}); 