"use client"

// Configuración para producción en Ferozo
const API_BASE_URL: string =
  (typeof window !== "undefined" && (window as any).API_BASE_URL) ||
  process.env.NEXT_PUBLIC_API_URL ||
  "/api/productos/list" // ✅ URL real de Ferozo

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

      // Si la respuesta no es JSON devolvemos el texto para inspección
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
    return this.request("productos/list.php")
  }

  // Comandas
  async createComanda(comandaData: any) {
    return this.request("comandas/create.php", {
      method: "POST",
      body: JSON.stringify(comandaData),
    })
  }

  async getComandas() {
    return this.request("comandas/list.php")
  }

  async updateComandaStatus(comanda_id: number, estado: string, metodo_pago?: string, nota?: string) {
    return this.request("comandas/update-status.php", {
      method: "POST",
      body: JSON.stringify({ comanda_id, estado, metodo_pago, nota }),
    })
  }

  // Test de conexión
  async testConnection() {
    return this.request("test-connection.php")
  }
}

export const apiClient = new ApiClient()
