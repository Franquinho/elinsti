"use client"

export interface OfflineComanda {
  id: string
  usuario_id: number
  evento_id: number
  productos: Array<{
    id: number
    nombre: string
    cantidad: number
    precio: number
  }>
  total: number
  timestamp: number
}

export interface OfflinePago {
  id: string
  comanda_id: number
  metodo_pago: "invitacion" | "transferencia" | "efectivo" | "revisar"
  nota?: string
  timestamp: number
}

class OfflineStorage {
  private readonly COMANDAS_KEY = "el-insti-offline-comandas"
  private readonly PAGOS_KEY = "el-insti-offline-pagos"

  // Comandas offline
  saveComanda(comanda: OfflineComanda) {
    const comandas = this.getComandas()
    comandas.push(comanda)
    localStorage.setItem(this.COMANDAS_KEY, JSON.stringify(comandas))
  }

  getComandas(): OfflineComanda[] {
    const data = localStorage.getItem(this.COMANDAS_KEY)
    return data ? JSON.parse(data) : []
  }

  clearComandas() {
    localStorage.removeItem(this.COMANDAS_KEY)
  }

  // Pagos offline
  savePago(pago: OfflinePago) {
    const pagos = this.getPagos()
    pagos.push(pago)
    localStorage.setItem(this.PAGOS_KEY, JSON.stringify(pagos))
  }

  getPagos(): OfflinePago[] {
    const data = localStorage.getItem(this.PAGOS_KEY)
    return data ? JSON.parse(data) : []
  }

  clearPagos() {
    localStorage.removeItem(this.PAGOS_KEY)
  }

  // Sincronización
  async syncWithServer() {
    const comandas = this.getComandas()
    const pagos = this.getPagos()

    try {
      // Aquí iría la lógica para sincronizar con el servidor
      console.log("Sincronizando comandas offline:", comandas)
      console.log("Sincronizando pagos offline:", pagos)

      // Si la sincronización es exitosa, limpiar el storage
      this.clearComandas()
      this.clearPagos()

      return true
    } catch (error) {
      console.error("Error al sincronizar:", error)
      return false
    }
  }

  hasOfflineData(): boolean {
    return this.getComandas().length > 0 || this.getPagos().length > 0
  }
}

export const offlineStorage = new OfflineStorage()
