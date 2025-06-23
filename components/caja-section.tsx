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
import { CreditCard, X, Check } from "lucide-react"
import { localDB } from "@/lib/database"
import { PrintComanda } from "@/components/print-comanda"
import { useNotifications, NotificationSystem } from "@/components/notification-system"
import { apiClient } from "@/lib/api"

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
  const [comandas, setComandas] = useState<Comanda[]>([])
  const [loading, setLoading] = useState(true)
  const [cajaAbierta, setCajaAbierta] = useState(true)
  const [montoInicial, setMontoInicial] = useState(0)
  const [selectedComanda, setSelectedComanda] = useState<Comanda | null>(null)
  const [metodoPago, setMetodoPago] = useState("")
  const [nota, setNota] = useState("")

  const { notifications, addNotification, removeNotification } = useNotifications()

  useEffect(() => {
    const cargarComandas = async () => {
      setLoading(true)
      try {
        const response = await apiClient.getComandas()
        if (response.success) {
          setComandas(response.comandas)
        } else {
          addNotification({ type: 'error', title: 'Error', message: 'No se pudieron cargar las comandas.' })
        }
      } catch (error) {
        console.error("Error cargando comandas:", error)
        addNotification({ type: 'error', title: 'Error de Red', message: 'No se pudieron cargar las comandas.' })
      } finally {
        setLoading(false)
      }
    }

    cargarComandas()
  }, [addNotification])

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
        const comandaActualizada = { ...comanda, ...response.comanda }
        setComandas(comandas.map((c) => (c.id === comanda.id ? comandaActualizada : c)))
        setSelectedComanda(null)
        setMetodoPago("")
        setNota("")
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
        const comandaActualizada = {
          ...comanda,
          estado: "cancelado" as const,
          updated_at: new Date().toISOString(),
        }

        await localDB.update("comandas", comandaActualizada)

        setComandas(comandas.map((c) => (c.id === comanda.id ? comandaActualizada : c)))

        addNotification({
          type: "error",
          title: "Comanda Cancelada",
          message: `Comanda #${comanda.id} - ${comanda.nombre_cliente || "Cliente"} cancelada. Monto: $${comanda.total.toLocaleString()}`,
          duration: 5000,
        })
      } catch (error) {
        console.error("Error cancelando comanda:", error)
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
        <h2 className="text-2xl font-bold text-amber-800 mb-4">Comandas</h2>
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

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg text-amber-800">Total: ${comanda.total.toLocaleString()}</span>
                      <span className="text-sm text-gray-500">{new Date(comanda.fecha_creacion).toLocaleTimeString()}</span>
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
                    {comanda.estado === "pendiente" && (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => setSelectedComanda(comanda)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Procesar Pago - Comanda #{comanda.id}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Método de Pago</Label>
                                <Select value={metodoPago} onValueChange={setMetodoPago}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar método" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="invitacion">🟣 Invitación</SelectItem>
                                    <SelectItem value="transferencia">🔵 Transferencia</SelectItem>
                                    <SelectItem value="efectivo">🟢 Efectivo</SelectItem>
                                    <SelectItem value="revisar">🟠 Revisar</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {metodoPago === "revisar" && (
                                <div>
                                  <Label htmlFor="nota">Nota</Label>
                                  <Textarea
                                    id="nota"
                                    value={nota}
                                    onChange={(e) => setNota(e.target.value)}
                                    placeholder="Agregar nota..."
                                  />
                                </div>
                              )}

                              <div className="flex gap-2">
                                <Button
                                  onClick={() => procesarPago(comanda, metodoPago, nota)}
                                  disabled={!metodoPago}
                                  className="flex-1"
                                >
                                  Confirmar Pago
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => cancelarComanda(comanda)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <PrintComanda comanda={comanda} />
                      </>
                    )}
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
