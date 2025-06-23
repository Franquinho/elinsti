import { GET } from '@/app/api/productos/list/route'

describe('/api/productos/list', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return a list of active products', async () => {
    const mockProducts = [
      { id: 1, nombre: 'Café', activo: true },
      { id: 2, nombre: 'Té', activo: true },
    ]
    global.mockSupabase.from.mockReturnThis()
    global.mockSupabase.select.mockReturnThis()
    global.mockSupabase.eq.mockReturnThis()
    global.mockSupabase.order.mockResolvedValue({ data: mockProducts, error: null })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.productos.length).toBe(2)
    expect(global.mockSupabase.eq).toHaveBeenCalledWith('activo', true)
  })

  it('should return 500 on database error', async () => {
    global.mockSupabase.from.mockReturnThis()
    global.mockSupabase.select.mockReturnThis()
    global.mockSupabase.eq.mockReturnThis()
    global.mockSupabase.order.mockResolvedValue({ data: null, error: { message: 'Internal Server Error' } })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
  })
}) 