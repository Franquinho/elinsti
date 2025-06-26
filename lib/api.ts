"use client"

// Base para API Routes de Next.js
const API_BASE_URL = "/api"

class ApiClient {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`

    const cfg: RequestInit = {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    }

    console.log("🔗 LLAMANDO API →", url)

    try {
      const res = await fetch(url, cfg)
      const contentType = res.headers.get("content-type") || ""
      const data = contentType.includes("application/json")
        ? await res.json()
        : { success: false, raw: await res.text() }

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || `HTTP ${res.status} – ${res.statusText}`)
      }

      return data
    } catch (err) {
      console.error("API Error:", err)
      throw err
    }
  }

  // Autenticación
  async login(email: string, password: string) {
    return this.request("auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  // Productos
  async getProductos() {
    return this.request("productos/list")
  }

  async getProductosAdmin() {
    return this.request("productos/admin")
  }

  async createProducto(productoData: any) {
    return this.request("productos", {
      method: "POST",
      body: JSON.stringify(productoData),
    })
  }

  async updateProducto(id: number, productoData: any) {
    return this.request(`productos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(productoData),
    })
  }

  async deleteProducto(id: number) {
    return this.request(`productos/${id}`, {
      method: "DELETE",
    })
  }

  // Eventos
  async getEventos() {
    return this.request("eventos")
  }

  async createEvento(eventoData: any) {
    return this.request("eventos", {
      method: "POST",
      body: JSON.stringify(eventoData),
    })
  }

  async getEventoActivo() {
    return this.request("eventos/active")
  }

  async setEventoActivo(eventoId: number) {
    return this.request("eventos/active", {
      method: "POST",
      body: JSON.stringify({ evento_id: eventoId }),
    })
  }

  async getEventosStats() {
    return this.request("eventos/stats")
  }

  // Comandas
  async createComanda(comandaData: any) {
    return this.request("comandas/create", {
      method: "POST",
      body: JSON.stringify(comandaData),
    })
  }

  async getComandas() {
    return this.request("comandas/list")
  }

  async updateComandaStatus(comanda_id: number, estado: string, metodo_pago?: string, nota?: string) {
    return this.request("comandas/update-status", {
      method: "POST",
      body: JSON.stringify({ comanda_id, estado, metodo_pago, nota }),
    })
  }

  // Estadísticas
  async getStats() {
    return this.request("stats")
  }
}

export const apiClient = new ApiClient()

// Alias para compatibilidad
export const api = apiClient
