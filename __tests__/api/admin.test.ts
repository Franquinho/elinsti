import { GET as getStats } from '@/app/api/stats/route'

describe('/api/stats', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deberia obtener las estadisticas del mock global', async () => {
    const response = await getStats()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.stats).toEqual({
      ventasHoy: 0,
      ventasSemana: 0,
      ventasMes: 0,
      comandasTotales: 0,
      productosVendidos: 0,
      montoCancelado: 0,
      cancelacionesHoy: 0,
      tasaCancelacion: 0,
      totalEfectivo: 0,
      totalTransferencia: 0,
      totalInvitacion: 0
    })
  })
}) 