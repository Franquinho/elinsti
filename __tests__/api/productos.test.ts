import { GET as getProductos } from '@/app/api/productos/list/route'

describe('/api/productos/list', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deberia listar los productos del mock global', async () => {
    const response = await getProductos()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.productos).toEqual([
      { id: 1, nombre: 'Café', precio: 25, activo: true },
      { id: 2, nombre: 'Té', precio: 20, activo: true }
    ])
  })
})
