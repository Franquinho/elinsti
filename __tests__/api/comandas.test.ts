import { GET as getComandas } from '@/app/api/comandas/list/route'

describe('/api/comandas/list', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deberia devolver la lista de comandas del mock global', async () => {
    const response = await getComandas()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.comandas).toEqual([
      { id: 1, evento_id: 1, usuario_id: 1, estado: 'pendiente', total: 100 },
      { id: 2, evento_id: 1, usuario_id: 1, estado: 'pagado', total: 150 }
    ])
  })
}) 