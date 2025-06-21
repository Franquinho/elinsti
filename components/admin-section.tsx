"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Settings, Download, Plus, Edit, Trash2, RefreshCw } from "lucide-react"
import { AdvancedStats } from "./advanced-stats"
import { localDB } from "@/lib/database"
import { DataSeeder } from "@/lib/data-seeder"

interface Producto {
  id: number
  nombre: string
  precio: number
  emoji: string
  activo: boolean
}

interface Estadistica {
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

export function AdminSection() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [estadisticas, setEstadisticas] = useState<Estadistica>({
    ventasHoy: 0,
    ventasSemana: 0,
    ventasMes: 0,
    productosVendidos: 0,
    totalEfectivo: 0,
    totalTransferencia: 0,
    totalInvitacion: 0,
    cancelacionesHoy: 0,
    montoCancelado: 0,
    comandasTotales: 0,
    tasaCancelacion: 0,
  })
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio: 0,
    emoji: "📦",
  })
  const [editandoProducto, setEditandoProducto] = useState<Producto | null>(null)

  const emojisDisponibles = [
    "🍺",
    "🍷",
    "🥟",
    "🧀",
    "☕",
    "💧",
    "🍕",
    "🍔",
    "🌮",
    "🥗",
    "🍰",
    "🧁",
    "🍪",
    "🥤",
    "🧃",
    "🍸",
    "🍹",
    "🥂",
    "🍾",
    "📦",
  ]

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      // Cargar productos
      const productosDB = await localDB.getAll("productos")
      setProductos(productosDB)

      // Calcular estadísticas
      const comandasDB = await localDB.getAll("comandas")
      calcularEstadisticas(comandasDB)
    } catch (error) {
      console.error("Error cargando datos:", error)
    }
  }

  const calcularEstadisticas = (comandas: any[]) => {
    const hoy = new Date().toDateString()
    const comandasHoy = comandas.filter((c) => new Date(c.created_at).toDateString() === hoy)

    const comandasPagadas = comandasHoy.filter((c) => c.estado === "pagado")
    const comandasCanceladas = comandasHoy.filter((c) => c.estado === "cancelado")

    const ventasHoy = comandasPagadas.reduce((total, c) => total + c.total, 0)
    const montoCancelado = comandasCanceladas.reduce((total, c) => total + c.total, 0)

    const totalEfectivo = comandasPagadas
      .filter((c) => c.metodo_pago === "efectivo")
      .reduce((total, c) => total + c.total, 0)
    const totalTransferencia = comandasPagadas
      .filter((c) => c.metodo_pago === "transferencia")
      .reduce((total, c) => total + c.total, 0)
    const totalInvitacion = comandasPagadas
      .filter((c) => c.metodo_pago === "invitacion")
      .reduce((total, c) => total + c.total, 0)

    const productosVendidos = comandasPagadas.reduce((total, c) => {
      return total + (c.productos?.reduce((sum: number, p: any) => sum + p.cantidad, 0) || 0)
    }, 0)

    setEstadisticas({
      ventasHoy,
      ventasSemana: ventasHoy * 7, // Simulado
      ventasMes: ventasHoy * 30, // Simulado
      productosVendidos,
      totalEfectivo,
      totalTransferencia,
      totalInvitacion,
      cancelacionesHoy: comandasCanceladas.length,
      montoCancelado,
      comandasTotales: comandasHoy.length,
      tasaCancelacion: comandasHoy.length > 0 ? (comandasCanceladas.length / comandasHoy.length) * 100 : 0,
    })
  }

  const toggleProductoActivo = async (id: number) => {
    try {
      const producto = productos.find((p) => p.id === id)
      if (producto) {
        const productoActualizado = { ...producto, activo: !producto.activo }
        await localDB.update("productos", productoActualizado)
        setProductos(productos.map((p) => (p.id === id ? productoActualizado : p)))
      }
    } catch (error) {
      console.error("Error actualizando producto:", error)
    }
  }

  const crearProducto = async () => {
    if (!nuevoProducto.nombre || nuevoProducto.precio <= 0) return

    try {
      const id = await localDB.add("productos", {
        ...nuevoProducto,
        activo: true,
      })

      const producto = { ...nuevoProducto, id, activo: true }
      setProductos([...productos, producto])
      setNuevoProducto({ nombre: "", precio: 0, emoji: "📦" })
    } catch (error) {
      console.error("Error creando producto:", error)
    }
  }

  const actualizarProducto = async () => {
    if (!editandoProducto) return

    try {
      await localDB.update("productos", editandoProducto)
      setProductos(productos.map((p) => (p.id === editandoProducto.id ? editandoProducto : p)))
      setEditandoProducto(null)
    } catch (error) {
      console.error("Error actualizando producto:", error)
    }
  }

  const eliminarProducto = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await localDB.delete("productos", id)
        setProductos(productos.filter((p) => p.id !== id))
      } catch (error) {
        console.error("Error eliminando producto:", error)
      }
    }
  }

  const reiniciarBaseDatos = async () => {
    if (confirm("¿Estás seguro de reiniciar toda la base de datos? Se perderán todos los datos.")) {
      try {
        await DataSeeder.resetDatabase()
        await cargarDatos()
        alert("Base de datos reiniciada correctamente")
      } catch (error) {
        console.error("Error reiniciando base de datos:", error)
      }
    }
  }

  const exportarDatos = async (tipo: string) => {
    try {
      const comandas = await localDB.getAll("comandas")
      const productosData = await localDB.getAll("productos")

      const data = {
        comandas,
        productos: productosData,
        estadisticas,
        exportado: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `el-insti-backup-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exportando datos:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="productos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="productos">Productos</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          <TabsTrigger value="configuracion">Configuración</TabsTrigger>
        </TabsList>

        {/* Gestión de Productos */}
        <TabsContent value="productos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-amber-800">Gestión de Productos</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-amber-600 hover:bg-amber-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Producto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Producto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={nuevoProducto.nombre}
                      onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
                      placeholder="Nombre del producto"
                    />
                  </div>
                  <div>
                    <Label htmlFor="precio">Precio</Label>
                    <Input
                      id="precio"
                      type="number"
                      value={nuevoProducto.precio}
                      onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Emoji</Label>
                    <div className="grid grid-cols-10 gap-2 mt-2">
                      {emojisDisponibles.map((emoji) => (
                        <Button
                          key={emoji}
                          variant={nuevoProducto.emoji === emoji ? "default" : "outline"}
                          size="sm"
                          onClick={() => setNuevoProducto({ ...nuevoProducto, emoji })}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={crearProducto} className="w-full">
                    Crear Producto
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {productos.map((producto) => (
              <Card key={producto.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{producto.emoji}</span>
                      <div>
                        <h3 className="font-semibold text-amber-800">{producto.nombre}</h3>
                        <p className="text-amber-600">${producto.precio.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`activo-${producto.id}`} className="text-sm">
                          {producto.activo ? "Activo" : "Inactivo"}
                        </Label>
                        <Switch
                          id={`activo-${producto.id}`}
                          checked={producto.activo}
                          onCheckedChange={() => toggleProductoActivo(producto.id)}
                        />
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setEditandoProducto(producto)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Producto</DialogTitle>
                          </DialogHeader>
                          {editandoProducto && (
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="edit-nombre">Nombre</Label>
                                <Input
                                  id="edit-nombre"
                                  value={editandoProducto.nombre}
                                  onChange={(e) =>
                                    setEditandoProducto({
                                      ...editandoProducto,
                                      nombre: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-precio">Precio</Label>
                                <Input
                                  id="edit-precio"
                                  type="number"
                                  value={editandoProducto.precio}
                                  onChange={(e) =>
                                    setEditandoProducto({
                                      ...editandoProducto,
                                      precio: Number(e.target.value),
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <Label>Emoji</Label>
                                <div className="grid grid-cols-10 gap-2 mt-2">
                                  {emojisDisponibles.map((emoji) => (
                                    <Button
                                      key={emoji}
                                      variant={editandoProducto.emoji === emoji ? "default" : "outline"}
                                      size="sm"
                                      onClick={() =>
                                        setEditandoProducto({
                                          ...editandoProducto,
                                          emoji,
                                        })
                                      }
                                    >
                                      {emoji}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                              <Button onClick={actualizarProducto} className="w-full">
                                Actualizar Producto
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => eliminarProducto(producto.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Estadísticas */}
        <TabsContent value="estadisticas" className="space-y-4">
          <AdvancedStats />

          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
              Resumen de Ventas
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => exportarDatos("JSON")}>
                <Download className="w-4 h-4 mr-2" />
                Exportar Datos
              </Button>
              <Button variant="outline" onClick={cargarDatos}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-700">Ventas Hoy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-800">${estadisticas.ventasHoy.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-700">Ventas Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-800">${estadisticas.ventasSemana.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-700">Ventas Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-800">${estadisticas.ventasMes.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-700">Productos Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-800">{estadisticas.productosVendidos}</div>
              </CardContent>
            </Card>
          </div>

          {/* Sección de cancelaciones */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-700">Cancelaciones Hoy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-800">{estadisticas.cancelacionesHoy}</div>
                <div className="text-xs text-red-600">Comandas canceladas</div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-700">Monto Cancelado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-800">-${estadisticas.montoCancelado.toLocaleString()}</div>
                <div className="text-xs text-red-600">No contabilizado</div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-700">Tasa de Cancelación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-800">{estadisticas.tasaCancelacion.toFixed(1)}%</div>
                <div className="text-xs text-orange-600">
                  {estadisticas.cancelacionesHoy}/{estadisticas.comandasTotales} comandas
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Efectividad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-800">
                  {(100 - estadisticas.tasaCancelacion).toFixed(1)}%
                </div>
                <div className="text-xs text-blue-600">Comandas completadas</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ventas por Método de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span>🟢</span>
                    <span className="font-medium">Efectivo</span>
                  </div>
                  <span className="font-bold text-green-700">${estadisticas.totalEfectivo.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span>🔵</span>
                    <span className="font-medium">Transferencia</span>
                  </div>
                  <span className="font-bold text-blue-700">${estadisticas.totalTransferencia.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span>🟣</span>
                    <span className="font-medium">Invitación</span>
                  </div>
                  <span className="font-bold text-purple-700">${estadisticas.totalInvitacion.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración */}
        <TabsContent value="configuracion" className="space-y-4">
          <h2 className="text-2xl font-bold text-amber-800">Configuración del Sistema</h2>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuración General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="nombre-evento">Nombre del Evento Actual</Label>
                  <Input id="nombre-evento" defaultValue="Noche Bohemia - Enero" placeholder="Nombre del evento" />
                </div>
                <div>
                  <Label htmlFor="fecha-evento">Fecha del Evento</Label>
                  <Input id="fecha-evento" type="date" defaultValue="2024-01-15" />
                </div>
              </div>

              <div>
                <Label htmlFor="limite-productos">Límite de Productos por Comanda</Label>
                <Input id="limite-productos" type="number" defaultValue="6" min="1" max="20" />
              </div>

              <div className="flex gap-2">
                <Button className="bg-amber-600 hover:bg-amber-700">Guardar Configuración</Button>
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={reiniciarBaseDatos}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reiniciar Base de Datos
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Modo de Funcionamiento</p>
                    <p className="text-sm text-gray-600">Base de datos local (IndexedDB)</p>
                  </div>
                  <Badge variant="outline">Offline</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Almacenamiento</p>
                    <p className="text-sm text-gray-600">Navegador local - Sin servidor</p>
                  </div>
                  <Badge variant="outline">Local</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Sincronización</p>
                    <p className="text-sm text-gray-600">No requiere conexión a internet</p>
                  </div>
                  <Badge variant="outline">Autónomo</Badge>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Información Importante</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Los datos se guardan localmente en tu navegador</li>
                  <li>• No se requiere conexión a internet para funcionar</li>
                  <li>• Los datos persisten entre sesiones</li>
                  <li>• Puedes exportar los datos como respaldo</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
