import { POST as createComanda } from '@/app/api/comandas/create/route'
import { GET as getComandas } from '@/app/api/comandas/list/route'
import { POST as updateComandaStatus } from '@/app/api/comandas/update-status/route'

describe('API de Comandas', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Pruebas para /api/comandas/create
  describe('POST /api/comandas/create', () => {
    it('debería crear una comanda con datos válidos', async () => {
      const comandaData = {
        usuario_id: 1,
        evento_id: 1,
        nombre_cliente: 'Cliente Test',
        total: 100,
        productos: [{ id: 1, cantidad: 2, precio: 50 }]
      }
      
      // Configurar el mock para devolver la comanda creada
      global.mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: { id: 1 }, 
              error: null 
            })
          })
        })
      })
      
      const request = new Request('http://localhost/api/comandas/create', {
        method: 'POST',
        body: JSON.stringify(comandaData),
      })

      const response = await createComanda(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.comanda_id).toBe(1)
      expect(global.mockSupabase.from).toHaveBeenCalledWith('comandas')
    })

    it('debería rechazar datos incompletos', async () => {
      const comandaDataIncompleta = { usuario_id: 1 }
      
      const request = new Request('http://localhost/api/comandas/create', {
        method: 'POST',
        body: JSON.stringify(comandaDataIncompleta),
      })

      const response = await createComanda(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Datos incompletos')
    })

    it('debería manejar la estructura de datos del frontend correctamente', async () => {
      // Simular exactamente lo que envía el frontend
      const frontendData = {
        usuario_id: 2,
        evento_id: 1,
        total: 150,
        nombre_cliente: 'Mesa 5',
        productos: [
          { id: 1, cantidad: 1, precio: 100 },
          { id: 2, cantidad: 2, precio: 25 }
        ]
      }
      
      global.mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: { id: 2 }, 
              error: null 
            })
          })
        })
      })
      
      const request = new Request('http://localhost/api/comandas/create', {
        method: 'POST',
        body: JSON.stringify(frontendData),
      })

      const response = await createComanda(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.comanda_id).toBe(2)
    })
  })

  // Pruebas para /api/comandas/list
  describe('GET /api/comandas/list', () => {
    it('debería obtener la lista de comandas', async () => {
      const mockComandas = [
        {
          id: 1,
          usuario_id: 1,
          nombre_cliente: 'Cliente 1',
          total: 100,
          estado: 'pendiente',
          fecha_creacion: '2024-01-01T00:00:00Z',
          usuario: { nombre: 'Usuario 1' },
          items: [
            {
              cantidad: 2,
              precio_unitario: 50,
              subtotal: 100,
              producto: { nombre: 'Producto 1', emoji: '🍺' }
            }
          ]
        }
      ]
      
      global.mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockComandas, error: null })
          })
        })
      })

      const response = await getComandas()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.comandas).toEqual(mockComandas)
      expect(global.mockSupabase.from).toHaveBeenCalledWith('comandas')
    })
  })

  // Pruebas para /api/comandas/update-status
  describe('POST /api/comandas/update-status', () => {
    it('debería actualizar el estado de una comanda', async () => {
      const updateData = {
        comanda_id: 1,
        estado: 'pagado',
        metodo_pago: 'efectivo',
        nota: 'Pago en efectivo'
      }
      
      global.mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ 
                data: { id: 1, estado: 'pagado' }, 
                error: null 
              })
            })
          })
        })
      })
      
      const request = new Request('http://localhost/api/comandas/update-status', {
        method: 'POST',
        body: JSON.stringify(updateData),
      })

      const response = await updateComandaStatus(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.comanda.estado).toBe('pagado')
      expect(global.mockSupabase.from).toHaveBeenCalledWith('comandas')
    })

    it('debería rechazar actualización sin comanda_id', async () => {
      const updateDataIncompleta = { estado: 'pagado' }
      
      const request = new Request('http://localhost/api/comandas/update-status', {
        method: 'POST',
        body: JSON.stringify(updateDataIncompleta),
      })

      const response = await updateComandaStatus(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toBe('ID de comanda y estado son requeridos')
    })
  })
}) 