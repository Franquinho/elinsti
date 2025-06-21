"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Users, Clock, Music, DollarSign, X } from "lucide-react"

interface StatsData {
  ventasHoy: number
  ventasAyer: number
  clientesUnicos: number
  horasPico: string[]
  productoMasVendido: {
    nombre: string
    emoji: string
    cantidad: number
  }
  tiempoPromedio: number
  satisfaccion: number
  // Nuevos campos
  cancelacionesHoy: number
  montoCancelado: number
  ventasBrutas: number // Ventas antes de cancelaciones
}

export function AdvancedStats() {
  const [periodo, setPeriodo] = useState("hoy")
  const [stats, setStats] = useState<StatsData>({
    ventasHoy: 145600, // Solo ventas REALES (pagadas)
    ventasAyer: 123400,
    clientesUnicos: 47,
    horasPico: ["20:00-22:00", "22:00-00:00"],
    productoMasVendido: {
      nombre: "Cerveza Artesanal",
      emoji: "🍺",
      cantidad: 23,
    },
    tiempoPromedio: 12,
    satisfaccion: 4.7,
    cancelacionesHoy: 3,
    montoCancelado: 8400,
    ventasBrutas: 154000, // Ventas + cancelaciones
  })

  const calcularCrecimiento = () => {
    const crecimiento = ((stats.ventasHoy - stats.ventasAyer) / stats.ventasAyer) * 100
    return {
      porcentaje: Math.abs(crecimiento).toFixed(1),
      positivo: crecimiento > 0,
    }
  }

  const crecimiento = calcularCrecimiento()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
          Estadísticas Avanzadas
        </h3>
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hoy">Hoy</SelectItem>
            <SelectItem value="semana">Semana</SelectItem>
            <SelectItem value="mes">Mes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Ventas con tendencia */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Ventas {periodo}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">${stats.ventasHoy.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs mt-1">
              {crecimiento.positivo ? (
                <TrendingUp className="w-3 h-3 text-green-600" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600" />
              )}
              <span className={crecimiento.positivo ? "text-green-600" : "text-red-600"}>
                {crecimiento.porcentaje}% vs ayer
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Clientes únicos */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Clientes Únicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{stats.clientesUnicos}</div>
            <div className="text-xs text-blue-600 mt-1">Comandas individuales</div>
          </CardContent>
        </Card>

        {/* Producto más vendido */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
              <Music className="w-4 h-4" />
              Más Popular
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-xl">{stats.productoMasVendido.emoji}</span>
              <div>
                <div className="font-bold text-purple-800">{stats.productoMasVendido.cantidad}</div>
                <div className="text-xs text-purple-600">{stats.productoMasVendido.nombre}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tiempo promedio */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Tiempo Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{stats.tiempoPromedio}min</div>
            <div className="text-xs text-orange-600 mt-1">Por comanda</div>
          </CardContent>
        </Card>

        {/* Nueva card de cancelaciones */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
              <X className="w-4 h-4" />
              Cancelaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{stats.cancelacionesHoy}</div>
            <div className="text-xs text-red-600 mt-1">-${stats.montoCancelado.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Horas pico */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-pink-600" />
            Horas Pico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {stats.horasPico.map((hora, index) => (
              <div
                key={index}
                className="px-3 py-2 bg-gradient-to-r from-pink-100 to-orange-100 rounded-lg border border-pink-200"
              >
                <span className="font-medium text-pink-800">{hora}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">Períodos con mayor actividad de ventas</p>
        </CardContent>
      </Card>

      {/* Gráfico de satisfacción */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5 text-pink-600" />
            Satisfacción del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-pink-600">{stats.satisfaccion}/5</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-2xl ${star <= Math.floor(stats.satisfaccion) ? "text-yellow-400" : "text-gray-300"}`}
                >
                  ⭐
                </span>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Basado en feedback de clientes</p>
        </CardContent>
      </Card>

      {/* Nueva sección de análisis de efectividad */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Análisis de Efectividad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-800">${stats.ventasHoy.toLocaleString()}</div>
              <div className="text-sm text-green-600">Ventas Netas</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">${stats.ventasBrutas.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Ventas Brutas</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-800">-${stats.montoCancelado.toLocaleString()}</div>
              <div className="text-sm text-red-600">Cancelaciones</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-blue-700 font-medium">Efectividad de Ventas:</span>
              <span className="text-blue-800 font-bold">
                {((stats.ventasHoy / stats.ventasBrutas) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
