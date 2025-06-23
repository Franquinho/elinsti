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
import { Settings, Download, Plus, Edit, Trash2, RefreshCw, Loader2 } from "lucide-react"
import { AdvancedStats } from "./advanced-stats"
import { apiClient } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

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
  const [estadisticas, setEstadisticas] = useState<Estadistica>(initialStats)
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio: 0,
    emoji: "📦",
  })
  const [editandoProducto, setEditandoProducto] = useState<Producto | null>(null)
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const emojisDisponibles = ["🍺", "🍷", "🥟", "🧀", "☕", "💧", "🍕", "🍔", "🌮", "🥗", "🍰", "🧁", "🍪", "🥤", "🧃", "🍸", "🍹", "🥂", "🍾", "📦"];

  const cargarDatos = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productosRes, statsRes] = await Promise.all([
        apiClient.getProductos(),
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

      if (!statsRes.success) {
        console.error("Error al cargar estadísticas:", statsRes.message);
        toast({ 
          title: "Error", 
          description: "No se pudieron cargar las estadísticas. Las estadísticas mostrarán valores por defecto.",
          variant: "destructive" 
        });
      }
      setEstadisticas(statsRes.stats || initialStats);
    } catch (error: any) {
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
    if (!producto) return;

    try {
      const productoActualizado = { ...producto, activo: !producto.activo }
      const res = await apiClient.updateProducto(id, { activo: productoActualizado.activo });
      if (res.success) {
        setProductos(productos.map((p) => (p.id === id ? res.producto : p)));
        toast({ title: "Éxito", description: `Producto ${producto.activo ? 'desactivado' : 'activado'}.` });
      } else {
        throw new Error(res.message);
      }
    } catch (error: any) {
      console.error("Error actualizando producto:", error)
      toast({ title: "Error", description: `No se pudo actualizar el producto: ${error.message}`, variant: "destructive" });
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
        const res: { success: boolean; message?: string; producto?: Producto } = await apiClient.updateProducto(editandoProducto.id, {
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

      if (!res.success) {
        throw new Error(res.message);
      }
    } catch (error: any) {
      console.error(`Error en ${action} producto:`, error);
      toast({ 
        title: "Error", 
        description: `No se pudo ${action === 'create' ? 'crear' : 'actualizar'} el producto: ${error.message}`, 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
      // Cierra el diálogo correspondiente
      if (action === 'create') document.getElementById('close-create-dialog')?.click();
      if (action === 'update') document.getElementById('close-update-dialog')?.click();
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
    } catch (error: any) {
      console.error("Error eliminando producto:", error);
      toast({ 
        title: "Error", 
        description: `No se pudo eliminar el producto: ${error.message}`, 
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
                    {productos.map((producto) => (
                      <tr key={producto.id} className="border-b">
                        <td className="p-4">
                          <Switch checked={producto.activo} onCheckedChange={() => toggleProductoActivo(producto.id)} />
                        </td>
                        <td className="p-4 font-medium flex items-center">
                          <span className="text-2xl mr-4">{producto.emoji}</span>
                          {producto.nombre}
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
           <AdvancedStats stats={estadisticas} onRefresh={cargarDatos} />
        </TabsContent>

        <TabsContent value="configuracion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                    Ajustes futuros de la aplicación se configurarán aquí.
                </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
