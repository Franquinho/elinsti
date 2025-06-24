"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Minus, ShoppingCart, Music2, Disc3, RefreshCw } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { apiClient } from "@/lib/api"
import { useNotifications } from "@/components/notification-system"
import { useComandasSync } from "@/hooks/use-comandas-sync"

interface Producto {
  id: number
  nombre: string
  precio: number
  emoji: string
  activo: boolean
}

interface ProductoComanda {
  id: number
  nombre: string
  precio: number
  emoji: string
  cantidad: number
}

export function VentasSection() {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const { comandas, refreshComandas } = useComandasSync(5000) // Sincronizar cada 5 segundos
  const [productos, setProductos] = useState<Producto[]>([])
  const [comanda, setComanda] = useState<ProductoComanda[]>([])
  const [nombreCliente, setNombreCliente] = useState("")
  const [cajaAbierta, setCajaAbierta] = useState(true)
  const [isCreatingComanda, setIsCreatingComanda] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getProductos()
        if (response.success) {
          // Filtrar solo productos activos en el frontend también
          const productosActivos = response.productos.filter((producto: Producto) => producto.activo === true)
          console.log("🔔 [Frontend] Productos cargados:", response.productos.length, "total,", productosActivos.length, "activos")
          setProductos(productosActivos)
        }
      } catch (error) {
        console.error("Error cargando productos:", error)
        addNotification({
          type: "error",
          title: "Error",
          message: "No se pudieron cargar los productos",
          duration: 3000,
        })
      } finally {
        setLoading(false)
      }
    }

    cargarProductos()
  }, [addNotification])

  const refrescarProductos = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getProductos()
      if (response.success) {
        const productosActivos = response.productos.filter((producto: Producto) => producto.activo === true)
        console.log("🔔 [Frontend] Productos refrescados:", response.productos.length, "total,", productosActivos.length, "activos")
        setProductos(productosActivos)
        addNotification({
          type: "success",
          title: "Productos Actualizados",
          message: "Lista de productos refrescada correctamente",
          duration: 2000,
        })
      }
    } catch (error) {
      console.error("Error refrescando productos:", error)
      addNotification({
        type: "error",
        title: "Error",
        message: "No se pudieron refrescar los productos",
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const agregarProducto = (producto: Producto) => {
    if (!producto.activo) {
      addNotification({
        type: "error",
        title: "Error",
        message: "No se pueden agregar productos inactivos a la comanda",
        duration: 3000,
      });
      return;
    }

    const existente = comanda.find((item) => item.id === producto.id)
    if (existente) {
      setComanda(comanda.map((item) => (item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item)))
    } else {
      setComanda([
        ...comanda,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          emoji: producto.emoji,
          cantidad: 1,
        },
      ])
    }
  }

  const modificarCantidad = (id: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      setComanda(comanda.filter((item) => item.id !== id))
    } else {
      setComanda(comanda.map((item) => (item.id === id ? { ...item, cantidad: nuevaCantidad } : item)))
    }
  }

  const calcularTotal = () => {
    return comanda.reduce((total, item) => total + item.precio * item.cantidad, 0)
  }

  const crearComanda = async () => {
    if (comanda.length === 0) {
      addNotification({
        type: "error",
        title: "Error",
        message: "Debe agregar al menos un producto",
        duration: 3000,
      });
      return;
    }

    if (!nombreCliente.trim()) {
      addNotification({
        type: "error",
        title: "Error",
        message: "Debe ingresar el nombre del cliente",
        duration: 3000,
      });
      return;
    }

    setIsCreatingComanda(true);

    try {
      const comandaData = {
        usuario_id: user!.id,
        evento_id: 1,
        total: calcularTotal(),
        nombre_cliente: nombreCliente.trim(),
        productos: comanda.map(({ id, cantidad, precio }) => ({
          id,
          cantidad,
          precio,
        })),
      };

      const response = await apiClient.createComanda(comandaData);

      if (response.success) {
        // Limpiar formulario
        setComanda([]);
        setNombreCliente("");
        
        // Refrescar comandas para sincronizar con Caja
        await refreshComandas();

        addNotification({
          type: "music",
          title: "¡Comanda Creada!",
          message: `Comanda #${response.comanda_id} para ${nombreCliente} creada exitosamente 🎵`,
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Error creando comanda:", error);
      addNotification({
        type: "error",
        title: "Error",
        message: "No se pudo crear la comanda",
        duration: 3000,
      });
    } finally {
      setIsCreatingComanda(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Disc3 className="w-8 h-8 animate-spin mx-auto mb-4 text-pink-500" />
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    )
  }

  if (!cajaAbierta) {
    return (
      <Card className="max-w-md mx-auto border-0 shadow-xl">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Caja Cerrada</h3>
          <p className="text-gray-600">No se pueden realizar ventas mientras la caja esté cerrada.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Productos disponibles */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Music2 className="w-6 h-6 text-pink-500" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
              Productos Disponibles
            </h2>
          </div>
          <Button
            onClick={refrescarProductos}
            variant="outline"
            size="sm"
            className="border-pink-200 text-pink-600 hover:bg-pink-50"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refrescar
          </Button>
        </div>
        <div className="grid gap-3">
          {productos.map((producto) => (
            <Card
              key={producto.id}
              className="hover:shadow-lg transition-all transform hover:scale-102 border-0 shadow-md"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">{producto.emoji}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{producto.nombre}</h3>
                      <p className="text-pink-600 font-medium">${producto.precio.toLocaleString()}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => agregarProducto(producto)}
                    size="sm"
                    className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Comanda actual */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
            Comanda Actual
          </h2>
        </div>
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-orange-50">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <ShoppingCart className="w-5 h-5" />
              Nueva Comanda
            </CardTitle>
            <div className="space-y-2">
              <Label htmlFor="nombre-cliente" className="text-gray-700 font-medium">
                Nombre del Cliente
              </Label>
              <Input
                id="nombre-cliente"
                value={nombreCliente}
                onChange={(e) => setNombreCliente(e.target.value.slice(0, 30))}
                placeholder="Ej: Mesa 5, Juan, etc."
                maxLength={30}
                className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
              />
              <p className="text-xs text-gray-500">{nombreCliente.length}/30 caracteres</p>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {comanda.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-pink-400" />
                </div>
                <p className="text-gray-500">No hay productos en la comanda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comanda.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-orange-50 rounded-lg border border-pink-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-xl">{item.emoji}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{item.nombre}</h4>
                        <p className="text-sm text-pink-600">${item.precio.toLocaleString()} c/u</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => modificarCantidad(item.id, item.cantidad - 1)}
                          className="border-pink-200 text-pink-600 hover:bg-pink-50"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-bold text-gray-800">{item.cantidad}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => modificarCantidad(item.id, item.cantidad + 1)}
                          className="border-pink-200 text-pink-600 hover:bg-pink-50"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="font-bold text-gray-800">${(item.precio * item.cantidad).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-t border-pink-200 pt-4 mt-6">
                  <div className="flex justify-between items-center text-xl font-bold text-gray-800 mb-4">
                    <span>Total:</span>
                    <span className="text-pink-600">${calcularTotal().toLocaleString()}</span>
                  </div>

                  {nombreCliente && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-gray-600">Cliente:</p>
                      <p className="font-semibold text-gray-800">{nombreCliente}</p>
                    </div>
                  )}

                  <Button
                    onClick={crearComanda}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg relative overflow-hidden"
                    size="lg"
                    disabled={!nombreCliente.trim() || comanda.length === 0 || isCreatingComanda}
                  >
                    {isCreatingComanda ? (
                      <div className="flex items-center gap-2">
                        <Disc3 className="w-5 h-5 animate-spin" />
                        Creando Comanda...
                      </div>
                    ) : (
                      "Crear Comanda"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
