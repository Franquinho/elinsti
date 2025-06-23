import { POST as createComanda } from '@/app/api/comandas/create/route'
import { GET as listComandas } from '@/app/api/comandas/list/route'
import { POST as updateStatus } from '@/app/api/comandas/update-status/route'

describe('API de Comandas', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Pruebas para /api/comandas/create
  describe('POST /api/comandas/create', () => {
    it('debería crear una comanda y sus detalles', async () => {
      const comandaData = {
        usuario_id: 1,
        evento_id: 1,
        nombre_cliente: 'Cliente Test',
        total: 100,
        productos: [{ id: 1, cantidad: 2, precio: 50 }]
      }
      global.mockSupabase.from.mockReturnThis()
      global.mockSupabase.insert.mockReturnThis()
      global.mockSupabase.select.mockReturnThis()
      global.mockSupabase.single.mockResolvedValue({ data: { id: 1 }, error: null })
      global.mockSupabase.eq.mockReturnThis()

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
      expect(global.mockSupabase.from).toHaveBeenCalledWith('comanda_items')
    })

    it('debería retornar un error 400 con datos incompletos', async () => {
      const request = new Request('http://localhost/api/comandas/create', {
        method: 'POST',
        body: JSON.stringify({ usuario_id: 1 }), // Faltan datos
      })
      const response = await createComanda(request)
      expect(response.status).toBe(400)
    })
  })

  // Pruebas para /api/comandas/list
  describe('GET /api/comandas/list', () => {
    it('debería retornar una lista de comandas con sus productos', async () => {
      const mockData = [{ id: 1, total: 100, detalles_comanda: [{ id: 1, cantidad: 2 }] }]
      global.mockSupabase.from.mockReturnThis()
      global.mockSupabase.select.mockReturnThis()
      global.mockSupabase.order.mockResolvedValue({ data: mockData, error: null })

      const response = await listComandas()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.comandas.length).toBe(1)
      expect(data.comandas[0].id).toBe(1)
    })
  })

  // Pruebas para /api/comandas/update-status
  describe('POST /api/comandas/update-status', () => {
    it('debería actualizar el estado de una comanda', async () => {
      const updateData = { comanda_id: 1, estado: 'pagado', metodo_pago: 'efectivo' }
      global.mockSupabase.from.mockReturnThis()
      global.mockSupabase.update.mockReturnThis()
      global.mockSupabase.eq.mockReturnThis()
      global.mockSupabase.select.mockReturnThis()
      global.mockSupabase.single.mockResolvedValue({ data: { id: 1, estado: 'pagado' }, error: null })

      const request = new Request('http://localhost/api/comandas/update-status', {
        method: 'POST',
        body: JSON.stringify(updateData),
      })

      const response = await updateStatus(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(global.mockSupabase.from).toHaveBeenCalledWith('comandas')
      expect(global.mockSupabase.update).toHaveBeenCalledWith({ 
        estado: 'pagado', 
        metodo_pago: 'efectivo', 
        fecha_actualizacion: expect.any(String),
        nota: null
      })
    })
  })
}) 