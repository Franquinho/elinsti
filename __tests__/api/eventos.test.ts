import { GET as getEventos } from '@/app/api/eventos/route'

describe('/api/eventos', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deberia obtener los eventos del mock global', async () => {
    const response = await getEventos()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.eventos).toEqual([
      { id: 1, nombre: 'Noche de Jazz', activo: true, fecha: '2024-01-15' },
      { id: 2, nombre: 'Rock Night', activo: false, fecha: '2024-01-20' }
    ])
  })
}) 