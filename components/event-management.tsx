import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings,
  Star
} from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { cn } from '../lib/utils';

interface Evento {
  id: number;
  nombre: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  ubicacion?: string;
  capacidad_maxima?: number;
  precio_entrada?: number;
  estado: 'activo' | 'inactivo' | 'finalizado';
  es_evento_activo: boolean;
  fecha_creacion: string;
}

interface EventStats {
  total_comandas: number;
  total_ventas: number;
  promedio_por_comanda: number;
  productos_mas_vendidos: Array<{
    nombre: string;
    cantidad: number;
    total: number;
  }>;
}

export function EventManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    ubicacion: '',
    capacidad_maxima: '',
    precio_entrada: '',
    estado: 'activo' as const
  });

  // Queries
  const { data: eventos = [], isLoading: isLoadingEventos } = useQuery({
    queryKey: ['eventos'],
    queryFn: api.eventos.list
  });

  const { data: activeEvent } = useQuery({
    queryKey: ['active-event'],
    queryFn: api.eventos.getActive
  });

  const { data: eventStats } = useQuery({
    queryKey: ['event-stats'],
    queryFn: () => api.eventos.getStats(),
    enabled: !!eventos.length
  });

  // Mutations
  const createEvent = useMutation({
    mutationFn: api.eventos.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      queryClient.invalidateQueries({ queryKey: ['event-stats'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "🟢 Evento creado",
        description: "El evento se ha creado exitosamente",
        duration: 3000
      });
    },
    onError: (error) => {
      console.error('Error creando evento:', error);
      toast({
        title: "🔴 Error",
        description: "No se pudo crear el evento",
        duration: 5000
      });
    }
  });

  const updateEvent = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Evento> }) => 
      api.eventos.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      queryClient.invalidateQueries({ queryKey: ['event-stats'] });
      setIsEditDialogOpen(false);
      setSelectedEvent(null);
      resetForm();
      toast({
        title: "🟢 Evento actualizado",
        description: "El evento se ha actualizado exitosamente",
        duration: 3000
      });
    },
    onError: (error) => {
      console.error('Error actualizando evento:', error);
      toast({
        title: "🔴 Error",
        description: "No se pudo actualizar el evento",
        duration: 5000
      });
    }
  });

  const deleteEvent = useMutation({
    mutationFn: api.eventos.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      queryClient.invalidateQueries({ queryKey: ['event-stats'] });
      setIsDeleting(false);
      toast({
        title: "🟢 Evento eliminado",
        description: "El evento se ha eliminado exitosamente",
        duration: 3000
      });
    },
    onError: (error) => {
      console.error('Error eliminando evento:', error);
      setIsDeleting(false);
      toast({
        title: "🔴 Error",
        description: "No se pudo eliminar el evento",
        duration: 5000
      });
    }
  });

  const setActiveEvent = useMutation({
    mutationFn: api.eventos.setActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-event'] });
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast({
        title: "🟢 Evento activo cambiado",
        description: "El evento activo se ha actualizado",
        duration: 3000
      });
    },
    onError: (error) => {
      console.error('Error cambiando evento activo:', error);
      toast({
        title: "🔴 Error",
        description: "No se pudo cambiar el evento activo",
        duration: 5000
      });
    }
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      ubicacion: '',
      capacidad_maxima: '',
      precio_entrada: '',
      estado: 'activo'
    });
  };

  const handleCreateEvent = () => {
    const eventData = {
      ...formData,
      capacidad_maxima: formData.capacidad_maxima ? parseInt(formData.capacidad_maxima) : undefined,
      precio_entrada: formData.precio_entrada ? parseFloat(formData.precio_entrada) : undefined
    };

    createEvent.mutate(eventData);
  };

  const handleUpdateEvent = () => {
    if (!selectedEvent) return;

    const eventData = {
      ...formData,
      capacidad_maxima: formData.capacidad_maxima ? parseInt(formData.capacidad_maxima) : undefined,
      precio_entrada: formData.precio_entrada ? parseFloat(formData.precio_entrada) : undefined
    };

    updateEvent.mutate({ id: selectedEvent.id, data: eventData });
  };

  const handleEditEvent = (evento: Evento) => {
    setSelectedEvent(evento);
    setFormData({
      nombre: evento.nombre,
      descripcion: evento.descripcion || '',
      fecha_inicio: evento.fecha_inicio.split('T')[0],
      fecha_fin: evento.fecha_fin.split('T')[0],
      ubicacion: evento.ubicacion || '',
      capacidad_maxima: evento.capacidad_maxima?.toString() || '',
      precio_entrada: evento.precio_entrada?.toString() || '',
      estado: evento.estado
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteEvent = (evento: Evento) => {
    if (evento.es_evento_activo) {
      toast({
        title: "🔴 Error",
        description: "No se puede eliminar el evento activo",
        duration: 5000
      });
      return;
    }

    setIsDeleting(true);
    deleteEvent.mutate(evento.id);
  };

  const handleSetActiveEvent = (evento: Evento) => {
    setActiveEvent.mutate(evento.id);
  };

  const getStatusBadge = (estado: string, esActivo: boolean) => {
    if (esActivo) {
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Activo</Badge>;
    }
    
    switch (estado) {
      case 'activo':
        return <Badge variant="secondary">Disponible</Badge>;
      case 'inactivo':
        return <Badge variant="outline">Inactivo</Badge>;
      case 'finalizado':
        return <Badge variant="destructive">Finalizado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Eventos</h2>
          <p className="text-muted-foreground">
            Administra y configura los eventos del sistema
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Evento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre del Evento *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Noche de Jazz"
                  />
                </div>
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <select
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción del evento..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fecha_inicio">Fecha de Inicio *</Label>
                  <Input
                    id="fecha_inicio"
                    type="datetime-local"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="fecha_fin">Fecha de Fin *</Label>
                  <Input
                    id="fecha_fin"
                    type="datetime-local"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="ubicacion">Ubicación</Label>
                  <Input
                    id="ubicacion"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                    placeholder="Ej: Salón Principal"
                  />
                </div>
                <div>
                  <Label htmlFor="capacidad_maxima">Capacidad Máxima</Label>
                  <Input
                    id="capacidad_maxima"
                    type="number"
                    value={formData.capacidad_maxima}
                    onChange={(e) => setFormData({ ...formData, capacidad_maxima: e.target.value })}
                    placeholder="Ej: 100"
                  />
                </div>
                <div>
                  <Label htmlFor="precio_entrada">Precio de Entrada</Label>
                  <Input
                    id="precio_entrada"
                    type="number"
                    step="0.01"
                    value={formData.precio_entrada}
                    onChange={(e) => setFormData({ ...formData, precio_entrada: e.target.value })}
                    placeholder="Ej: 25.00"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateEvent}
                  disabled={createEvent.isPending || !formData.nombre || !formData.fecha_inicio || !formData.fecha_fin}
                  className="flex-1"
                >
                  {createEvent.isPending ? 'Creando...' : 'Crear Evento'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={createEvent.isPending}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Evento Activo */}
      {activeEvent && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-green-600" />
              Evento Activo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{activeEvent.nombre}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(activeEvent.fecha_inicio)} - {formatDate(activeEvent.fecha_fin)}
                </p>
                {activeEvent.ubicacion && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {activeEvent.ubicacion}
                  </p>
                )}
              </div>
              <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Activo
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas */}
      {eventStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comandas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eventStats.total_comandas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${eventStats.total_ventas.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio por Comanda</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${eventStats.promedio_por_comanda.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos Más Vendidos</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eventStats.productos_mas_vendidos.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Eventos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingEventos ? (
            <div className="flex items-center justify-center py-8">
              <Clock className="h-6 w-6 animate-spin" />
              <span className="ml-2">Cargando eventos...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Capacidad</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventos.map((evento: Evento) => (
                  <TableRow key={evento.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{evento.nombre}</div>
                        {evento.descripcion && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {evento.descripcion}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(evento.fecha_inicio)}
                        </div>
                        <div className="text-muted-foreground">
                          hasta {formatDate(evento.fecha_fin)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {evento.ubicacion ? (
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {evento.ubicacion}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No especificada</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(evento.estado, evento.es_evento_activo)}</TableCell>
                    <TableCell>
                      {evento.capacidad_maxima ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-3 w-3" />
                          {evento.capacidad_maxima}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Sin límite</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {evento.precio_entrada ? (
                        <div className="flex items-center gap-1 text-sm">
                          <DollarSign className="h-3 w-3" />
                          ${evento.precio_entrada.toFixed(2)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Gratis</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {!evento.es_evento_activo && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetActiveEvent(evento)}
                            disabled={setActiveEvent.isPending}
                          >
                            <Star className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditEvent(evento)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEvent(evento)}
                          disabled={isDeleting || evento.es_evento_activo}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-nombre">Nombre del Evento *</Label>
                <Input
                  id="edit-nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Noche de Jazz"
                />
              </div>
              <div>
                <Label htmlFor="edit-estado">Estado</Label>
                <select
                  id="edit-estado"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-descripcion">Descripción</Label>
              <Textarea
                id="edit-descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción del evento..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-fecha_inicio">Fecha de Inicio *</Label>
                <Input
                  id="edit-fecha_inicio"
                  type="datetime-local"
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-fecha_fin">Fecha de Fin *</Label>
                <Input
                  id="edit-fecha_fin"
                  type="datetime-local"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-ubicacion">Ubicación</Label>
                <Input
                  id="edit-ubicacion"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  placeholder="Ej: Salón Principal"
                />
              </div>
              <div>
                <Label htmlFor="edit-capacidad_maxima">Capacidad Máxima</Label>
                <Input
                  id="edit-capacidad_maxima"
                  type="number"
                  value={formData.capacidad_maxima}
                  onChange={(e) => setFormData({ ...formData, capacidad_maxima: e.target.value })}
                  placeholder="Ej: 100"
                />
              </div>
              <div>
                <Label htmlFor="edit-precio_entrada">Precio de Entrada</Label>
                <Input
                  id="edit-precio_entrada"
                  type="number"
                  step="0.01"
                  value={formData.precio_entrada}
                  onChange={(e) => setFormData({ ...formData, precio_entrada: e.target.value })}
                  placeholder="Ej: 25.00"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleUpdateEvent}
                disabled={updateEvent.isPending || !formData.nombre || !formData.fecha_inicio || !formData.fecha_fin}
                className="flex-1"
              >
                {updateEvent.isPending ? 'Actualizando...' : 'Actualizar Evento'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={updateEvent.isPending}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 