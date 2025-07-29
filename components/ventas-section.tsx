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
import { Badge } from "@/components/ui/badge"

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

interface Evento {
  id: number
  nombre: string
  activo: boolean
}

export function VentasSection() {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const { comandas, refreshComandas } = useComandasSync(5000) // Sincronizar cada 5 segundos
  const [productos, setProductos] = useState<Producto[]>([])
  const [eventoActivo, setEventoActivo] = useState<Evento | null>(null)
  const [comanda, setComanda] = useState<ProductoComanda[]>([])
  const [nombreCliente, setNombreCliente] = useState("")
  const [cajaAbierta, setCajaAbierta] = useState(true)
  const [isCreatingComanda, setIsCreatingComanda] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)
        
        // Cargar evento activo
        const eventoResponse = await apiClient.getEventoActivo()
        if (eventoResponse.success && eventoResponse.eventos && eventoResponse.eventos.length > 0) {
          setEventoActivo(eventoResponse.eventos[0]) // Tomar el primer evento activo
        } else {
          addNotification({
            type: "error",
            title: "Error",
            message: "No hay evento activo configurado",
            duration: 5000,
          })
          return
        }

        // Cargar productos
        const productosResponse = await apiClient.getProductos()
        if (productosResponse.success) {
          // Filtrar solo productos activos en el frontend también
          const productosActivos = productosResponse.productos.filter((producto: Producto) => producto.activo === true)
          console.log("🔔 [Frontend] Productos cargados:", productosResponse.productos.length, "total,", productosActivos.length, "activos")
          setProductos(productosActivos)
        }
      } catch (error) {
        console.error("Error cargando datos:", error)
        addNotification({
          type: "error",
          title: "Error",
          message: "No se pudieron cargar los datos necesarios",
          duration: 3000,
        })
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
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
    // Validaciones previas
    const validations = []
    
    if (!eventoActivo) {
      validations.push("No hay evento activo configurado")
    }

    if (comanda.length === 0) {
      validations.push("Debe agregar al menos un producto")
    }

    if (!nombreCliente.trim()) {
      validations.push("Debe ingresar el nombre del cliente")
    } else if (nombreCliente.trim().length < 2) {
      validations.push("El nombre del cliente debe tener al menos 2 caracteres")
    } else if (nombreCliente.trim().length > 100) {
      validations.push("El nombre del cliente es demasiado largo")
    }

    // Validar que todos los productos tengan cantidades válidas
    const productosInvalidos = comanda.filter(item => item.cantidad <= 0 || item.cantidad > 999999)
    if (productosInvalidos.length > 0) {
      validations.push("Algunos productos tienen cantidades inválidas")
    }

    // Validar que el total sea válido
    const total = calcularTotal()
    if (total <= 0) {
      validations.push("El total debe ser mayor a 0")
    } else if (total > 999999.99) {
      validations.push("El total es demasiado alto")
    }

    if (validations.length > 0) {
      addNotification({
        type: "error",
        title: "Datos inválidos",
        message: validations.join(". "),
        duration: 5000,
      });
      return;
    }

    setIsCreatingComanda(true);

    try {
      const comandaData = {
        evento_id: eventoActivo.id,
        total: calcularTotal(),
        nombre_cliente: nombreCliente.trim(),
        usuario_id: 4, // Usuario fijo para ventas
        productos: comanda.map(({ id, cantidad, precio }) => ({
          id,
          cantidad,
          precio,
        })),
      };

      console.log("🔔 [Frontend] Creando comanda con datos:", comandaData);

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
      } else {
        // Manejar respuesta de error del API
        addNotification({
          type: "error",
          title: "Error al crear comanda",
          message: response.message || "No se pudo crear la comanda",
          duration: 5000,
        });
      }
    } catch (error: unknown) {
      console.error("Error creando comanda:", error);
      
      // Determinar el tipo de error y mostrar mensaje apropiado
      let errorMessage = "No se pudo crear la comanda"
      
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status;
        if (status === 400) {
          errorMessage = "Datos incorrectos. Verifica la información ingresada."
        } else if (status === 429) {
          errorMessage = "Demasiadas peticiones. Espera un momento antes de intentar nuevamente."
        } else if (status === 413) {
          errorMessage = "Datos demasiado grandes. Reduce la cantidad de productos."
        } else if (status >= 500) {
          errorMessage = "Error del servidor. Intenta nuevamente en unos minutos."
        }
      } else if (error instanceof Error && error.message?.includes('fetch')) {
        errorMessage = "Error de conexión. Verifica tu conexión a internet."
      }
      
      addNotification({
        type: "error",
        title: "Error",
        message: errorMessage,
        duration: 5000,
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
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (!eventoActivo) {
    return (
      <Card className="max-w-md mx-auto border-0 shadow-xl">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">🎭</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Sin Evento Activo</h3>
          <p className="text-gray-600">No hay un evento activo configurado. Contacte al administrador.</p>
        </CardContent>
      </Card>
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
      {/* Evento activo */}
      <div className="lg:col-span-2 mb-4">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Music2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Evento Activo</h3>
                  <p className="text-purple-600 font-medium">{eventoActivo.nombre}</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Activo
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

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
