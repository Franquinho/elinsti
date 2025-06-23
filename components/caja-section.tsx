"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CreditCard, X, Check, RefreshCw, Clock } from "lucide-react"
import { localDB } from "@/lib/database"
import { PrintComanda } from "@/components/print-comanda"
import { useNotifications, NotificationSystem } from "@/components/notification-system"
import { apiClient } from "@/lib/api"
import { useComandasSync } from "@/hooks/use-comandas-sync"

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

export function CajaSection() {
  const { comandas, loading, error, refreshComandas, lastUpdate } = useComandasSync(3000) // Sincronizar cada 3 segundos
  const [cajaAbierta, setCajaAbierta] = useState(true)
  const [montoInicial, setMontoInicial] = useState(0)
  const [selectedComanda, setSelectedComanda] = useState<Comanda | null>(null)
  const [metodoPago, setMetodoPago] = useState("")
  const [nota, setNota] = useState("")

  const { notifications, addNotification, removeNotification } = useNotifications()

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "pagado":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelado":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getMetodoPagoIcon = (metodo: string) => {
    switch (metodo) {
      case "invitacion":
        return "🟣"
      case "transferencia":
        return "🔵"
      case "efectivo":
        return "🟢"
      case "revisar":
        return "🟠"
      default:
        return "💳"
    }
  }

  const procesarPago = async (comanda: Comanda, metodo: string, nota?: string) => {
    try {
      const response = await apiClient.updateComandaStatus(comanda.id, "pagado", metodo, nota)

      if (response.success) {
        setSelectedComanda(null)
        setMetodoPago("")
        setNota("")
        await refreshComandas() // Refrescar comandas después del pago
        addNotification({
          type: "music",
          title: "¡Pago Procesado!",
          message: `Comanda #${comanda.id} pagada exitosamente`,
        })
      } else {
        throw new Error("No se pudo procesar el pago")
      }
    } catch (error) {
      console.error("Error procesando pago:", error)
      addNotification({
        type: "error",
        title: "Error",
        message: "No se pudo procesar el pago",
      })
    }
  }

  const cancelarComanda = async (comanda: Comanda) => {
    if (
      confirm(
        `¿Estás seguro de cancelar la comanda #${comanda.id}? El monto de $${comanda.total.toLocaleString()} NO se contabilizará en las ventas.`,
      )
    ) {
      try {
        const response = await apiClient.updateComandaStatus(comanda.id, "cancelado")

        if (response.success) {
          await refreshComandas() // Refrescar comandas después de cancelar
          addNotification({
            type: "error",
            title: "Comanda Cancelada",
            message: `Comanda #${comanda.id} - ${comanda.nombre_cliente || "Cliente"} cancelada. Monto: $${comanda.total.toLocaleString()}`,
            duration: 5000,
          })
        } else {
          throw new Error("No se pudo cancelar la comanda")
        }
      } catch (error) {
        console.error("Error cancelando comanda:", error)
        addNotification({
          type: "error",
          title: "Error",
          message: "No se pudo cancelar la comanda",
        })
      }
    }
  }

  const abrirCaja = () => {
    setCajaAbierta(true)
  }

  const cerrarCaja = () => {
    setCajaAbierta(false)
  }

  return (
    <div className="space-y-6">
      {/* Control de Caja */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Control de Caja
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Estado de la caja:</p>
              <Badge className={cajaAbierta ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {cajaAbierta ? "Abierta" : "Cerrada"}
              </Badge>
            </div>
            <div className="flex gap-2">
              {!cajaAbierta ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">Abrir Caja</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Abrir Caja</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="monto-inicial">Monto Inicial</Label>
                        <Input
                          id="monto-inicial"
                          type="number"
                          value={montoInicial}
                          onChange={(e) => setMontoInicial(Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                      <Button onClick={abrirCaja} className="w-full">
                        Confirmar Apertura
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button onClick={cerrarCaja} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                  Cerrar Caja
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Comandas */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-amber-800">Comandas</h2>
          <div className="flex items-center gap-3">
            {error && (
              <Badge variant="destructive" className="text-xs">
                Error de sincronización
              </Badge>
            )}
            {lastUpdate && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>
                  Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
                </span>
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={refreshComandas}
              disabled={loading}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Refrescar
            </Button>
          </div>
        </div>
        
        {loading && comandas.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-amber-600" />
              <p className="text-gray-600">Cargando comandas...</p>
            </div>
          </div>
        )}
        
        {error && comandas.length === 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <p className="text-red-800 mb-2">Error al cargar comandas</p>
              <Button size="sm" onClick={refreshComandas}>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        )}
        
        <div className="grid gap-4">
          {comandas.map((comanda) => (
            <Card key={comanda.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={getEstadoColor(comanda.estado)}>{comanda.estado.toUpperCase()}</Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(comanda.fecha_creacion).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                      <span className="text-sm text-gray-600">Comanda #{comanda.id}</span>
                      {comanda.nombre_cliente && (
                        <span className="text-sm font-medium text-pink-600 bg-pink-50 px-2 py-1 rounded">
                          👤 {comanda.nombre_cliente}
                        </span>
                      )}
                      {comanda.metodo_pago && (
                        <span className="text-sm">
                          {getMetodoPagoIcon(comanda.metodo_pago)} {comanda.metodo_pago}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mb-3">
                      {comanda.items?.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <span>{item.producto.emoji}</span>
                          <span>
                            {item.cantidad}x {item.producto.nombre}
                          </span>
                          <span className="text-gray-600">
                            ${(item.precio_unitario * item.cantidad).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className="font-bold text-lg text-amber-800">Total: ${comanda.total.toLocaleString()}</span>
                      
                      <div className="flex items-center gap-2">
                        {/* Botón Pagar: solo para pendientes */}
                        {comanda.estado === 'pendiente' && (
                          <Dialog open={selectedComanda?.id === comanda.id} onOpenChange={(isOpen) => !isOpen && setSelectedComanda(null)}>
                            <DialogTrigger asChild>
                              <Button size="sm" onClick={() => setSelectedComanda(comanda)}>Pagar</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader className="space-y-3">
                                <DialogTitle className="text-xl font-semibold text-gray-900">
                                  Procesar Pago
                                </DialogTitle>
                                <div className="text-sm text-gray-600">
                                  Comanda #{comanda.id} • {comanda.nombre_cliente || "Cliente"}
                                </div>
                              </DialogHeader>
                              
                              <div className="space-y-6">
                                {/* Resumen de la comanda */}
                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                  <h4 className="font-medium text-gray-900">Resumen de la comanda</h4>
                                  <div className="space-y-2">
                                    {comanda.items?.map((item, index) => (
                                      <div key={index} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                          <span>{item.producto.emoji}</span>
                                          <span>{item.cantidad}x {item.producto.nombre}</span>
                                        </div>
                                        <span className="text-gray-600">
                                          ${(item.precio_unitario * item.cantidad).toLocaleString()}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="border-t pt-3">
                                    <div className="flex justify-between items-center">
                                      <span className="font-semibold text-lg">Total a pagar:</span>
                                      <span className="font-bold text-xl text-amber-800">
                                        ${comanda.total.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Método de pago */}
                                <div className="space-y-3">
                                  <Label className="text-sm font-medium text-gray-900">Método de Pago</Label>
                                  <Select value={metodoPago} onValueChange={setMetodoPago}>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Seleccionar método de pago" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="invitacion">🟣 Invitación</SelectItem>
                                      <SelectItem value="transferencia">🔵 Transferencia</SelectItem>
                                      <SelectItem value="efectivo">🟢 Efectivo</SelectItem>
                                      <SelectItem value="revisar">🟠 Revisar</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Nota para método "revisar" */}
                                {metodoPago === "revisar" && (
                                  <div className="space-y-3">
                                    <Label htmlFor="nota" className="text-sm font-medium text-gray-900">
                                      Nota adicional
                                    </Label>
                                    <Textarea
                                      id="nota"
                                      value={nota}
                                      onChange={(e) => setNota(e.target.value)}
                                      placeholder="Agregar nota sobre el pago..."
                                      className="resize-none"
                                      rows={3}
                                    />
                                  </div>
                                )}

                                {/* Botones de acción */}
                                <div className="flex gap-3 pt-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedComanda(null)
                                      setMetodoPago("")
                                      setNota("")
                                    }}
                                    className="flex-1"
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    onClick={() => procesarPago(comanda, metodoPago, nota)}
                                    disabled={!metodoPago}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                  >
                                    <Check className="w-4 h-4 mr-2" />
                                    Confirmar Pago
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        
                        {/* Botón Cancelar: para pendientes y pagadas */}
                        {(comanda.estado === 'pendiente' || comanda.estado === 'pagado') && (
                           <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => cancelarComanda(comanda)}
                            title="Cancelar Comanda"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {comanda.nota && (
                      <div className="mt-2 p-2 bg-orange-50 rounded text-sm">
                        <strong>Nota:</strong> {comanda.nota}
                      </div>
                    )}

                    {comanda.estado === "cancelado" && (
                      <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-sm">
                        <div className="flex items-center gap-2">
                          <X className="w-4 h-4 text-red-600" />
                          <span className="font-medium text-red-800">
                            CANCELADA - Monto no contabilizado: ${comanda.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    {comanda.estado === "pagado" && <PrintComanda comanda={comanda} />}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <NotificationSystem notifications={notifications} onRemove={removeNotification} />
    </div>
  )
}
