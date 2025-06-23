import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'

interface Comanda {
  id: number
  usuario_id: number
  nombre_cliente?: string
  items: Array<{
    cantidad: number
    precio_unitario: number
    producto: {
      nombre: string
      emoji: string
    }
  }>
  total: number
  estado: "pendiente" | "pagado" | "cancelado"
  metodo_pago?: string
  nota?: string
  fecha_creacion: string
  usuario?: { nombre: string }
}

interface UseComandasSyncReturn {
  comandas: Comanda[]
  loading: boolean
  error: string | null
  refreshComandas: () => Promise<void>
  lastUpdate: Date | null
}

export function useComandasSync(intervalMs: number = 5000): UseComandasSyncReturn {
  const [comandas, setComandas] = useState<Comanda[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchComandas = useCallback(async () => {
    try {
      setError(null)
      const response = await apiClient.getComandas()
      
      if (response.success) {
        setComandas(response.comandas || [])
        setLastUpdate(new Date())
      } else {
        setError('No se pudieron cargar las comandas')
      }
    } catch (err) {
      console.error('Error cargando comandas:', err)
      setError('Error de conexión al cargar comandas')
    }
  }, [])

  const refreshComandas = useCallback(async () => {
    setLoading(true)
    await fetchComandas()
    setLoading(false)
  }, [fetchComandas])

  // Carga inicial
  useEffect(() => {
    refreshComandas()
  }, [refreshComandas])

  // Sincronización automática
  useEffect(() => {
    if (intervalMs <= 0) return

    const interval = setInterval(() => {
      fetchComandas()
    }, intervalMs)

    return () => clearInterval(interval)
  }, [fetchComandas, intervalMs])

  // Sincronización manual con eventos del navegador
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchComandas()
      }
    }

    const handleFocus = () => {
      fetchComandas()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchComandas])

  return {
    comandas,
    loading,
    error,
    refreshComandas,
    lastUpdate
  }
} 