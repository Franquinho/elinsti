"use client"

import type { ProductoCreate, ProductoUpdate, EventoCreate, ComandaCreate } from './types';

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

      if (!res.ok) {
        const errorMessage = data.message || data.error || `HTTP ${res.status} – ${res.statusText}`
        console.error("🔴 API Error:", {
          status: res.status,
          statusText: res.statusText,
          url,
          message: errorMessage,
          details: data.details
        })
        throw new Error(errorMessage)
      }

      if (!data.success) {
        const errorMessage = data.message || data.error || "Operación fallida"
        console.error("🔴 API Error (success: false):", {
          url,
          message: errorMessage,
          details: data.details
        })
        throw new Error(errorMessage)
      }

      return data
    } catch (err) {
      console.error("🔴 API Error:", err)
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

  async createProducto(productoData: ProductoCreate) {
    return this.request("productos", {
      method: "POST",
      body: JSON.stringify(productoData),
    })
  }

  async updateProducto(id: number, productoData: ProductoUpdate) {
    return this.request(`productos/${id}`, {
      method: "PUT",
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

  async createEvento(eventoData: EventoCreate) {
    return this.request("eventos", {
      method: "POST",
      body: JSON.stringify(eventoData),
    })
  }

  async updateEvento(id: number, eventoData: Partial<EventoCreate>) {
    return this.request("eventos", {
      method: "PUT",
      body: JSON.stringify({ id, ...eventoData }),
    })
  }

  async deleteEvento(id: number) {
    return this.request(`eventos?id=${id}`, {
      method: "DELETE",
    })
  }

  async getEventoActivo() {
    return this.request("eventos/active")
  }

  async setEventoActivo(eventoId: number) {
    return this.request("eventos/active", {
      method: "PUT",
      body: JSON.stringify({ eventoId: eventoId }),
    })
  }

  async getEventosStats() {
    return this.request("eventos/stats")
  }

  // Comandas
  async createComanda(comandaData: ComandaCreate) {
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

// API estructurada para mejor organización
export const api = {
  auth: {
    login: (email: string, password: string) => apiClient.login(email, password),
  },
  productos: {
    list: () => apiClient.getProductos(),
    listAdmin: () => apiClient.getProductosAdmin(),
    create: (data: ProductoCreate) => apiClient.createProducto(data),
    update: (id: number, data: ProductoUpdate) => apiClient.updateProducto(id, data),
    delete: (id: number) => apiClient.deleteProducto(id),
  },
  eventos: {
    list: () => apiClient.getEventos(),
    create: (data: EventoCreate) => apiClient.createEvento(data),
    update: (id: number, data: Partial<EventoCreate>) => apiClient.updateEvento(id, data),
    delete: (id: number) => apiClient.deleteEvento(id),
    getActive: () => apiClient.getEventoActivo(),
    setActive: (eventoId: number) => apiClient.setEventoActivo(eventoId),
    stats: () => apiClient.getEventosStats(),
  },
  comandas: {
    create: (data: ComandaCreate) => apiClient.createComanda(data),
    list: () => apiClient.getComandas(),
    updateStatus: (comanda_id: number, estado: string, metodo_pago?: string, nota?: string) => 
      apiClient.updateComandaStatus(comanda_id, estado, metodo_pago, nota),
  },
  stats: {
    general: () => apiClient.getStats(),
  },
}
