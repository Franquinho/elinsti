"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Users, Clock, Music, DollarSign, X, RefreshCw, BarChart3, Target, Zap } from "lucide-react"
import { apiClient } from "@/lib/api"

interface StatsData {
  ventasHoy: number
  ventasSemana: number
  ventasMes: number
  productosVendidos: number
  totalEfectivo: number
  totalTransferencia: number
  totalInvitacion: number
  cancelacionesHoy: number
  montoCancelado: number
  comandasTotales: number
  tasaCancelacion: number
}

interface AdvancedStatsProps {
  stats: StatsData
  onRefresh: () => void
}

export function AdvancedStats({ stats, onRefresh }: AdvancedStatsProps) {
  const [periodo, setPeriodo] = useState("hoy")
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = async () => {
    setIsLoading(true)
    await onRefresh()
    setIsLoading(false)
  }

  const calcularCrecimiento = () => {
    const crecimiento = ((stats.ventasHoy - stats.ventasSemana) / stats.ventasSemana) * 100
    return {
      porcentaje: Math.abs(crecimiento).toFixed(1),
      positivo: crecimiento > 0,
    }
  }

  const calcularTasaConversion = () => {
    if (stats.comandasTotales === 0) return 0
    return ((stats.comandasTotales - stats.cancelacionesHoy) / stats.comandasTotales * 100).toFixed(1)
  }

  const calcularPromedioTicket = () => {
    const ventasNetas = stats.ventasHoy
    const comandasExitosas = stats.comandasTotales - stats.cancelacionesHoy
    return comandasExitosas > 0 ? (ventasNetas / comandasExitosas).toFixed(0) : 0
  }

  const crecimiento = calcularCrecimiento()
  const tasaConversion = calcularTasaConversion()
  const promedioTicket = calcularPromedioTicket()

  const getVentasByPeriod = () => {
    switch (periodo) {
      case "hoy":
        return stats.ventasHoy
      case "semana":
        return stats.ventasSemana
      case "mes":
        return stats.ventasMes
      default:
        return stats.ventasHoy
    }
  }

  const ventasPeriodo = getVentasByPeriod()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
          Estadísticas Avanzadas
        </h3>
        <div className="flex gap-2">
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
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh} 
            disabled={isLoading}
            className="border-amber-200 text-amber-600 hover:bg-amber-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Ventas principales */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Ventas {periodo}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">${ventasPeriodo.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs mt-1">
              {crecimiento.positivo ? (
                <TrendingUp className="w-3 h-3 text-green-600" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600" />
              )}
              <span className={crecimiento.positivo ? "text-green-600" : "text-red-600"}>
                {crecimiento.porcentaje}% vs semana
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Comandas totales */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Comandas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{stats.comandasTotales}</div>
            <div className="text-xs text-blue-600 mt-1">
              <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                {tasaConversion}% éxito
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Productos vendidos */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
              <Music className="w-4 h-4" />
              Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{stats.productosVendidos}</div>
            <div className="text-xs text-purple-600 mt-1">Unidades vendidas</div>
          </CardContent>
        </Card>

        {/* Promedio por ticket */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Ticket Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">${promedioTicket}</div>
            <div className="text-xs text-orange-600 mt-1">Por comanda</div>
          </CardContent>
        </Card>

        {/* Cancelaciones */}
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

        {/* Métodos de pago */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-700 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Métodos de Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-green-600">Efectivo</span>
                <span className="font-medium">${stats.totalEfectivo.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-blue-600">Transferencia</span>
                <span className="font-medium">${stats.totalTransferencia.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-purple-600">Invitación</span>
                <span className="font-medium">${stats.totalInvitacion.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasa de cancelación */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Tasa Cancelación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800">{stats.tasaCancelacion}%</div>
            <div className="text-xs text-amber-600 mt-1">De comandas totales</div>
          </CardContent>
        </Card>

        {/* Resumen de rendimiento */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Ventas Netas</span>
                <span className="font-medium text-green-600">${stats.ventasHoy.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Conversión</span>
                <span className="font-medium text-blue-600">{tasaConversion}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Promedio</span>
                <span className="font-medium text-purple-600">${promedioTicket}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas adicionales */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Distribución de métodos de pago */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Distribución de Pagos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Efectivo", amount: stats.totalEfectivo, color: "bg-green-500", percentage: ((stats.totalEfectivo / (stats.totalEfectivo + stats.totalTransferencia + stats.totalInvitacion)) * 100).toFixed(1) },
                { label: "Transferencia", amount: stats.totalTransferencia, color: "bg-blue-500", percentage: ((stats.totalTransferencia / (stats.totalEfectivo + stats.totalTransferencia + stats.totalInvitacion)) * 100).toFixed(1) },
                { label: "Invitación", amount: stats.totalInvitacion, color: "bg-purple-500", percentage: ((stats.totalInvitacion / (stats.totalEfectivo + stats.totalTransferencia + stats.totalInvitacion)) * 100).toFixed(1) }
              ].map((method, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{method.label}</span>
                    <span className="text-gray-600">${method.amount.toLocaleString()} ({method.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${method.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${method.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resumen de cancelaciones */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <X className="w-5 h-5 text-red-600" />
              Análisis de Cancelaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Cancelaciones hoy</span>
                <Badge variant="destructive">{stats.cancelacionesHoy}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Monto cancelado</span>
                <span className="text-red-600 font-medium">-${stats.montoCancelado.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tasa de cancelación</span>
                <span className="text-amber-600 font-medium">{stats.tasaCancelacion}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Comandas exitosas</span>
                <span className="text-green-600 font-medium">{stats.comandasTotales - stats.cancelacionesHoy}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
