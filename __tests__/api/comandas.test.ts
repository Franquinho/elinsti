import { POST as createComanda } from '@/app/api/comandas/create/route'
import { GET as listComandas } from '@/app/api/comandas/list/route'
import { POST as updateComanda } from '@/app/api/comandas/update-status/route'
import { supabaseAdmin } from '@/lib/supabase'

// Mock de Supabase Admin
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}))

const supabaseAdminMock = supabaseAdmin as jest.Mocked<typeof supabaseAdmin>

describe('API de Comandas', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  // Pruebas para /api/comandas/create
  describe('POST /api/comandas/create', () => {
    it('debería crear una comanda y retornar su ID', async () => {
      // Arrange
      ;(supabaseAdminMock.from as jest.Mock).mockImplementation((tableName: string) => {
        if (tableName === 'comandas') {
          return {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: { id: 101 }, error: null }),
          }
        }
        if (tableName === 'comanda_items') {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
          }
        }
        return {}
      })

      const request = new Request('http://localhost/api/comandas/create', {
        method: 'POST',
        body: JSON.stringify({
          usuario_id: 1,
          evento_id: 1,
          total: 5000,
          nombre_cliente: 'Cliente de Prueba',
          productos: [{ id: 1, cantidad: 2, precio: 2500 }],
        }),
      })

      // Act
      const response = await createComanda(request)
      const body = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.comanda_id).toBe(101)
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
    it('debería retornar una lista de comandas', async () => {
      // Arrange
      const mockComandas = [{ id: 1, total: 5000 }, { id: 2, total: 3000 }]
      ;(supabaseAdminMock.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockComandas, error: null }),
      })

      const request = new Request('http://localhost/api/comandas/list', { method: 'GET' })
      
      // Act
      const response = await listComandas(request)
      const body = await response.json()
      
      // Assert
      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.comandas).toEqual(mockComandas)
    })
  })

  // Pruebas para /api/comandas/update-status
  describe('POST /api/comandas/update-status', () => {
    it('debería actualizar el estado de una comanda', async () => {
      // Arrange
      const updatedComanda = { id: 1, estado: 'pagado' }
      ;(supabaseAdminMock.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: updatedComanda, error: null }),
      })

      const request = new Request('http://localhost/api/comandas/update-status', {
        method: 'POST',
        body: JSON.stringify({ comanda_id: 1, estado: 'pagado' }),
      })

      // Act
      const response = await updateComanda(request)
      const body = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.comanda.estado).toBe('pagado')
    })
  })
}) 