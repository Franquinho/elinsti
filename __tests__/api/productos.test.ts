import { GET } from '@/app/api/productos/list/route'
import { supabaseAdmin } from '@/lib/supabase'

// Mock de Supabase Admin
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}))

const supabaseAdminMock = supabaseAdmin as jest.Mocked<typeof supabaseAdmin>

describe('/api/productos/list', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('debería retornar una lista de productos si la consulta es exitosa', async () => {
    const mockProductos = [
      { id: 1, nombre: 'Cerveza', precio: 2500 },
      { id: 2, nombre: 'Vino', precio: 3500 },
    ]
    ;(supabaseAdminMock.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockProductos, error: null }),
    })

    const request = new Request('http://localhost/api/productos/list', { method: 'GET' })
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.productos).toEqual(mockProductos)
  })

  it('debería retornar un error 500 si Supabase falla', async () => {
    const mockError = { message: 'Internal Server Error' }
    ;(supabaseAdminMock.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: null, error: mockError }),
    })

    const request = new Request('http://localhost/api/productos/list', { method: 'GET' })
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.message).toContain('Error al obtener productos')
  })
}) 