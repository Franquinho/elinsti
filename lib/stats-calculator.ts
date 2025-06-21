"use client"

interface ComandaStats {
  id: number
  total: number
  estado: "pendiente" | "pagado" | "cancelado"
  metodo_pago?: string
  created_at: string
}

export class StatsCalculator {
  static calcularVentasReales(comandas: ComandaStats[]): number {
    return comandas
      .filter((comanda) => comanda.estado === "pagado")
      .reduce((total, comanda) => total + comanda.total, 0)
  }

  static calcularCancelaciones(comandas: ComandaStats[]): {
    cantidad: number
    monto: number
    tasa: number
  } {
    const canceladas = comandas.filter((comanda) => comanda.estado === "cancelado")
    const cantidad = canceladas.length
    const monto = canceladas.reduce((total, comanda) => total + comanda.total, 0)
    const tasa = comandas.length > 0 ? (cantidad / comandas.length) * 100 : 0

    return { cantidad, monto, tasa }
  }

  static calcularVentasPorMetodo(comandas: ComandaStats[]): {
    efectivo: number
    transferencia: number
    invitacion: number
  } {
    const comandasPagadas = comandas.filter((comanda) => comanda.estado === "pagado")

    return {
      efectivo: comandasPagadas.filter((c) => c.metodo_pago === "efectivo").reduce((total, c) => total + c.total, 0),
      transferencia: comandasPagadas
        .filter((c) => c.metodo_pago === "transferencia")
        .reduce((total, c) => total + c.total, 0),
      invitacion: comandasPagadas
        .filter((c) => c.metodo_pago === "invitacion")
        .reduce((total, c) => total + c.total, 0),
    }
  }

  static calcularEfectividad(comandas: ComandaStats[]): {
    ventasNetas: number
    ventasBrutas: number
    efectividad: number
    montoPerdido: number
  } {
    const ventasNetas = this.calcularVentasReales(comandas)
    const ventasBrutas = comandas.reduce((total, comanda) => total + comanda.total, 0)
    const cancelaciones = this.calcularCancelaciones(comandas)

    return {
      ventasNetas,
      ventasBrutas,
      efectividad: ventasBrutas > 0 ? (ventasNetas / ventasBrutas) * 100 : 0,
      montoPerdido: cancelaciones.monto,
    }
  }

  static generarReporteCompleto(comandas: ComandaStats[]) {
    const efectividad = this.calcularEfectividad(comandas)
    const cancelaciones = this.calcularCancelaciones(comandas)
    const ventasPorMetodo = this.calcularVentasPorMetodo(comandas)

    return {
      resumen: {
        ventasReales: efectividad.ventasNetas,
        ventasBrutas: efectividad.ventasBrutas,
        montoPerdido: efectividad.montoPerdido,
        efectividad: efectividad.efectividad,
      },
      cancelaciones: {
        cantidad: cancelaciones.cantidad,
        monto: cancelaciones.monto,
        tasa: cancelaciones.tasa,
      },
      metodosPago: ventasPorMetodo,
      alertas: this.generarAlertas(cancelaciones.tasa, efectividad.efectividad),
    }
  }

  private static generarAlertas(tasaCancelacion: number, efectividad: number): string[] {
    const alertas: string[] = []

    if (tasaCancelacion > 10) {
      alertas.push(`⚠️ Tasa de cancelación alta: ${tasaCancelacion.toFixed(1)}%`)
    }

    if (efectividad < 85) {
      alertas.push(`⚠️ Efectividad baja: ${efectividad.toFixed(1)}%`)
    }

    if (tasaCancelacion > 15) {
      alertas.push(`🚨 CRÍTICO: Revisar proceso de ventas`)
    }

    return alertas
  }
}
