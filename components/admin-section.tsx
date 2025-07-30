"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Settings, Download, Plus, Edit, Trash2, RefreshCw, Loader2, Calendar, MapPin, Users, DollarSign, Star, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { AdvancedStats } from "./advanced-stats"
import EventSelector from "./event-selector"
import { apiClient } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Producto, Evento, EventoCreate } from "@/lib/types"
import { EventManagement } from "./event-management"

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

const initialStats: Estadistica = {
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
};

export function AdminSection() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])
  const [estadisticas, setEstadisticas] = useState<Estadistica>(initialStats)
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio: 0,
    emoji: "📦",
  })
  const [nuevoEvento, setNuevoEvento] = useState<EventoCreate>({
    nombre: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    capacidad_maxima: undefined,
    precio_entrada: 0,
    ubicacion: "",
    imagen_url: ""
  })
  const [editandoProducto, setEditandoProducto] = useState<Producto | null>(null)
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const emojisDisponibles = ["🍺", "🍷", "🥟", "🧀", "☕", "💧", "🍕", "🍔", "🌮", "🥗", "🍰", "🧁", "🍪", "🥤", "🧃", "🍸", "🍹", "🥂", "🍾", "📦"];

  const cargarDatos = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productosRes, eventosRes, statsRes] = await Promise.all([
        apiClient.getProductosAdmin(),
        apiClient.getEventos(),
        apiClient.getStats(),
      ]);

      if (!productosRes.success) {
        console.error("Error al cargar productos:", productosRes.message);
        toast({ 
          title: "Error", 
          description: "No se pudieron cargar los productos. Intenta recargar la página.",
          variant: "destructive" 
        });
        return;
      }
      setProductos(productosRes.productos || []);

      if (eventosRes.success) {
        setEventos(eventosRes.eventos || []);
      }

      if (!statsRes.success) {
        console.error("Error al cargar estadísticas:", statsRes.message);
        toast({ 
          title: "Error", 
          description: "No se pudieron cargar las estadísticas. Las estadísticas mostrarán valores por defecto.",
          variant: "destructive" 
        });
      }
      setEstadisticas(statsRes.stats || initialStats);
    } catch (error: unknown) {
      console.error("Error cargando datos:", error);
      toast({ 
        title: "Error", 
        description: "Ocurrió un error al cargar los datos. Intenta recargar la página.",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const toggleProductoActivo = async (id: number) => {
    const producto = productos.find((p) => p.id === id)
    if (!producto) {
      toast({ 
        title: "❌ Error", 
        description: "Producto no encontrado", 
        variant: "destructive" 
      });
      return;
    }

    try {
      const productoActualizado = { ...producto, activo: !producto.activo }
      const res = await apiClient.updateProducto(id, { activo: productoActualizado.activo });
      if (res?.success) {
        setProductos(productos.map((p) => (p.id === id ? res.producto : p)));
        toast({ 
          title: "✅ Éxito", 
          description: `Producto ${producto.activo ? 'desactivado' : 'activado'} correctamente.` 
        });
      } else {
        throw new Error(res?.message || 'Error al actualizar producto');
      }
    } catch (error: unknown) {
      console.error("Error actualizando producto:", error)
      toast({ 
        title: "❌ Error", 
        description: error instanceof Error ? error.message : 'No se pudo actualizar el producto', 
        variant: "destructive" 
      });
    }
  }

  const handleFormSubmit = async (e: React.FormEvent, action: 'create' | 'update') => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const producto = action === 'create' ? nuevoProducto : editandoProducto;
      if (!producto) throw new Error('Producto no encontrado');

      // Validaciones comunes
      if (!producto.nombre?.trim()) {
        throw new Error('El nombre es requerido');
      }

      if (producto.precio <= 0) {
        throw new Error('El precio debe ser mayor a 0');
      }

      if (!producto.emoji || !emojisDisponibles.includes(producto.emoji)) {
        throw new Error('Emoji no válido');
      }

      let res;
      if (action === 'create') {
        res = await apiClient.createProducto({ 
          ...producto, 
          activo: true,
          nombre: producto.nombre.trim(),
          precio: Number(producto.precio)
        });
        if (res.success) {
          setProductos([...productos, res.producto]);
          setNuevoProducto({ nombre: "", precio: 0, emoji: "📦" });
          toast({ title: "Éxito", description: "Producto creado correctamente." });
        }
      } else {
        if (!editandoProducto) {
          throw new Error('No se puede actualizar un producto sin seleccionar uno');
        }
        res = await apiClient.updateProducto(editandoProducto.id, {
          ...editandoProducto,
          nombre: editandoProducto.nombre.trim(),
          precio: Number(editandoProducto.precio)
        });
        if (res.success) {
          setProductos(productos.map((p) => (p.id === editandoProducto.id ? res.producto : p)));
          setEditandoProducto(null);
          toast({ title: "Éxito", description: "Producto actualizado correctamente." });
        }
      }

      if (!res || !res.success) {
        throw new Error(res?.message || 'Error en la operación');
      }
    } catch (error: unknown) {
      console.error(`Error en ${action} producto:`, error);
      toast({ 
        title: "Error", 
        description: `No se pudo ${action === 'create' ? 'crear' : 'actualizar'} el producto: ${error instanceof Error ? error.message : 'Error desconocido'}`, 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
      // Cierra el diálogo correspondiente
      if (action === 'create') document.getElementById('close-create-dialog')?.click();
      if (action === 'update') document.getElementById('close-update-dialog')?.click();
    }
  };

  const handleEventoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validaciones
      if (!nuevoEvento.nombre?.trim()) {
        throw new Error('El nombre del evento es requerido');
      }

      if (!nuevoEvento.fecha_inicio || !nuevoEvento.fecha_fin) {
        throw new Error('Las fechas de inicio y fin son requeridas');
      }

      if (new Date(nuevoEvento.fecha_inicio) >= new Date(nuevoEvento.fecha_fin)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }

      const res = await apiClient.createEvento({
        ...nuevoEvento,
        nombre: nuevoEvento.nombre.trim(),
        descripcion: nuevoEvento.descripcion?.trim(),
        ubicacion: nuevoEvento.ubicacion?.trim(),
        imagen_url: nuevoEvento.imagen_url?.trim()
      });

      if (res.success) {
        setEventos([...eventos, res.evento]);
        setNuevoEvento({
          nombre: "",
          descripcion: "",
          fecha_inicio: "",
          fecha_fin: "",
          capacidad_maxima: undefined,
          precio_entrada: 0,
          ubicacion: "",
          imagen_url: ""
        });
        toast({ title: "Éxito", description: "Evento creado correctamente." });
        document.getElementById('close-evento-dialog')?.click();
      } else {
        throw new Error(res.message);
      }
    } catch (error: unknown) {
      console.error("Error creando evento:", error);
      toast({ 
        title: "Error", 
        description: `No se pudo crear el evento: ${error instanceof Error ? error.message : 'Error desconocido'}`, 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const eliminarProducto = async (id: number) => {
    try {
      if (!confirm("¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.")) {
        return;
      }

      const res = await apiClient.deleteProducto(id);
      if (res.success) {
        setProductos(productos.filter((p) => p.id !== id));
        toast({ title: "Éxito", description: "Producto eliminado correctamente." });
      } else {
        throw new Error(res.message);
      }
    } catch (error: unknown) {
      console.error("Error eliminando producto:", error);
      toast({ 
        title: "Error", 
        description: `No se pudo eliminar el producto: ${error instanceof Error ? error.message : 'Error desconocido'}`, 
        variant: "destructive" 
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="productos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="productos">Productos</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          <TabsTrigger value="configuracion">Configuración</TabsTrigger>
        </TabsList>
        
        <TabsContent value="productos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-amber-800">Gestión de Productos</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={cargarDatos} 
                disabled={isLoading}
                className="border-amber-200 text-amber-600 hover:bg-amber-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refrescar
              </Button>
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
                  <form onSubmit={(e) => handleFormSubmit(e, 'create')} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input id="nombre" value={nuevoProducto.nombre} onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })} placeholder="Ej: Café con leche" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="precio">Precio</Label>
                      <Input id="precio" type="number" value={nuevoProducto.precio} onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: parseFloat(e.target.value) || 0 })} placeholder="Ej: 1500" />
                    </div>
                    <div className="space-y-2">
                      <Label>Emoji</Label>
                      <div className="grid grid-cols-6 gap-2">
                        {emojisDisponibles.map((emoji) => (
                          <Button key={emoji} type="button" variant={nuevoProducto.emoji === emoji ? "default" : "outline"} className="text-2xl" onClick={() => setNuevoProducto({ ...nuevoProducto, emoji })}>
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild id="close-create-dialog">
                          <Button type="button" variant="ghost">Cancelar</Button>
                      </DialogClose>
                      <Button type="submit" disabled={isSubmitting} className="bg-amber-600 hover:bg-amber-700">
                        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Crear Producto
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {/* Resumen de productos */}
          <div className="flex gap-4 mb-4">
            <Badge variant="outline" className="border-green-200 text-green-700">
              Activos: {productos.filter(p => p.activo).length}
            </Badge>
            <Badge variant="outline" className="border-red-200 text-red-700">
              Inactivos: {productos.filter(p => !p.activo).length}
            </Badge>
            <Badge variant="outline" className="border-blue-200 text-blue-700">
              Total: {productos.length}
            </Badge>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-amber-50">
                    <tr>
                      <th className="p-4 text-left font-semibold text-amber-800">Estado</th>
                      <th className="p-4 text-left font-semibold text-amber-800">Producto</th>
                      <th className="p-4 text-right font-semibold text-amber-800">Precio</th>
                      <th className="p-4 text-center font-semibold text-amber-800">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(productos) && productos.filter(Boolean).map((producto) => (
                      <tr key={producto.id} className={`border-b ${!producto.activo ? 'bg-gray-50' : ''}`}>
                        <td className="p-4">
                          <Switch 
                            checked={producto.activo} 
                            onCheckedChange={() => toggleProductoActivo(producto.id)} 
                          />
                        </td>
                        <td className="p-4 font-medium flex items-center">
                          <span className="text-2xl mr-4">{producto.emoji}</span>
                          <span className={!producto.activo ? 'text-gray-500' : ''}>
                            {producto.nombre}
                          </span>
                          {!producto.activo && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Inactivo
                            </Badge>
                          )}
                        </td>
                        <td className="p-4 text-right font-mono">${producto.precio.toFixed(2)}</td>
                        <td className="p-4 flex justify-center items-center space-x-2">
                          <Dialog onOpenChange={(open) => !open && setEditandoProducto(null)}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon" onClick={() => setEditandoProducto(producto)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                               <DialogHeader>
                                  <DialogTitle>Editar Producto</DialogTitle>
                               </DialogHeader>
                               {editandoProducto && (
                                <form onSubmit={(e) => handleFormSubmit(e, 'update')} className="space-y-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="nombre">Nombre</Label>
                                      <Input 
                                        id="nombre" 
                                        value={editandoProducto.nombre} 
                                        onChange={(e) => setEditandoProducto(prev => prev ? { ...prev, nombre: e.target.value } : null)} 
                                        placeholder="Ej: Café con leche" 
                                        disabled={isSubmitting}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="precio">Precio</Label>
                                      <Input 
                                        id="precio" 
                                        type="number" 
                                        min="0.01" 
                                        step="0.01"
                                        value={editandoProducto.precio} 
                                        onChange={(e) => setEditandoProducto(prev => prev ? { ...prev, precio: parseFloat(e.target.value) || 0 } : null)} 
                                        placeholder="Ej: 1500" 
                                        disabled={isSubmitting}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Emoji</Label>
                                      <div className="grid grid-cols-6 gap-2">
                                        {emojisDisponibles.map((emoji) => (
                                          <Button 
                                            key={emoji} 
                                            type="button" 
                                            variant={editandoProducto.emoji === emoji ? "default" : "outline"} 
                                            className="text-2xl" 
                                            onClick={() => setEditandoProducto(prev => prev ? { ...prev, emoji } : null)}
                                            disabled={isSubmitting}
                                          >
                                            {emoji}
                                          </Button>
                                        ))}
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <DialogClose asChild id="close-update-dialog">
                                          <Button type="button" variant="ghost" disabled={isSubmitting}>Cancelar</Button>
                                      </DialogClose>
                                      <Button 
                                        type="submit" 
                                        disabled={isSubmitting || !editandoProducto} 
                                        className="bg-amber-600 hover:bg-amber-700"
                                      >
                                         {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                         Guardar Cambios
                                      </Button>
                                    </DialogFooter>
                                </form>
                               )}
                            </DialogContent>
                          </Dialog>
                          <Button variant="destructive" size="icon" onClick={() => eliminarProducto(producto.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estadisticas">
           {estadisticas && <AdvancedStats stats={estadisticas} onRefresh={cargarDatos} />}
        </TabsContent>

        <TabsContent value="configuracion">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-amber-800">Configuración General</h2>
            </div>

            {/* Gestión de Eventos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Gestión de Eventos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">
                    Gestiona todos los eventos y configura el evento activo del sistema.
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-amber-600 hover:bg-amber-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Evento
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Crear Nuevo Evento</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleEventoSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="evento-nombre">Nombre del Evento *</Label>
                            <Input 
                              id="evento-nombre" 
                              value={nuevoEvento.nombre} 
                              onChange={(e) => setNuevoEvento({ ...nuevoEvento, nombre: e.target.value })} 
                              placeholder="Ej: Noche de Jazz" 
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="evento-ubicacion">Ubicación</Label>
                            <Input 
                              id="evento-ubicacion" 
                              value={nuevoEvento.ubicacion} 
                              onChange={(e) => setNuevoEvento({ ...nuevoEvento, ubicacion: e.target.value })} 
                              placeholder="Ej: Sala Principal" 
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="evento-descripcion">Descripción</Label>
                          <Input 
                            id="evento-descripcion" 
                            value={nuevoEvento.descripcion} 
                            onChange={(e) => setNuevoEvento({ ...nuevoEvento, descripcion: e.target.value })} 
                            placeholder="Descripción del evento..." 
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="evento-inicio">Fecha y Hora de Inicio *</Label>
                            <Input 
                              id="evento-inicio" 
                              type="datetime-local" 
                              value={nuevoEvento.fecha_inicio} 
                              onChange={(e) => setNuevoEvento({ ...nuevoEvento, fecha_inicio: e.target.value })} 
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="evento-fin">Fecha y Hora de Fin *</Label>
                            <Input 
                              id="evento-fin" 
                              type="datetime-local" 
                              value={nuevoEvento.fecha_fin} 
                              onChange={(e) => setNuevoEvento({ ...nuevoEvento, fecha_fin: e.target.value })} 
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="evento-capacidad">Capacidad Máxima</Label>
                            <Input 
                              id="evento-capacidad" 
                              type="number" 
                              value={nuevoEvento.capacidad_maxima || ''} 
                              onChange={(e) => setNuevoEvento({ ...nuevoEvento, capacidad_maxima: e.target.value ? parseInt(e.target.value) : undefined })} 
                              placeholder="Ej: 100" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="evento-precio">Precio de Entrada</Label>
                            <Input 
                              id="evento-precio" 
                              type="number" 
                              step="0.01"
                              value={nuevoEvento.precio_entrada} 
                              onChange={(e) => setNuevoEvento({ ...nuevoEvento, precio_entrada: parseFloat(e.target.value) || 0 })} 
                              placeholder="Ej: 25.00" 
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="evento-imagen">URL de Imagen</Label>
                          <Input 
                            id="evento-imagen" 
                            value={nuevoEvento.imagen_url} 
                            onChange={(e) => setNuevoEvento({ ...nuevoEvento, imagen_url: e.target.value })} 
                            placeholder="https://ejemplo.com/imagen.jpg" 
                          />
                        </div>

                        <DialogFooter>
                          <DialogClose asChild id="close-evento-dialog">
                            <Button type="button" variant="ghost" disabled={isSubmitting}>
                              Cancelar
                            </Button>
                          </DialogClose>
                          <Button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="bg-amber-600 hover:bg-amber-700"
                          >
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Crear Evento
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Selector de eventos - CON VALIDACIÓN */}
                {eventos && Array.isArray(eventos) && (
                  <EventSelector />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
