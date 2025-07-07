"use client"

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  DollarSign, 
  CreditCard, 
  Banknote, 
  Gift, 
  Plus, 
  Search, 
  Filter,
  RefreshCw,
  Printer,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { useOfflineSync } from '../hooks/use-offline-sync';
import { OfflineIndicator } from './offline-indicator';
import { cn } from '../lib/utils';

interface Comanda {
  id: string;
  usuario_id: number;
  evento_id: number;
  total: number;
  nombre_cliente: string;
  productos: Array<{
    id: number;
    nombre: string;
    cantidad: number;
    precio: number;
  }>;
  estado: 'pendiente' | 'pagado' | 'cancelado';
  metodo_pago?: 'efectivo' | 'transferencia' | 'invitacion';
  nota?: string;
  fecha_creacion: string;
}

interface CajaStats {
  totalVentas: number;
  totalComandas: number;
  comandasPendientes: number;
  comandasPagadas: number;
  comandasCanceladas: number;
  efectivo: number;
  transferencia: number;
  invitacion: number;
}

export function CajaSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'pendiente' | 'pagado' | 'cancelado'>('todos');
  const [selectedComanda, setSelectedComanda] = useState<Comanda | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia' | 'invitacion'>('efectivo');
  const [paymentNote, setPaymentNote] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { createOfflineComanda, processOfflinePayment, syncStatus } = useOfflineSync();

  // Query para obtener comandas
  const { data: comandas = [], isLoading: isLoadingComandas, error: comandasError } = useQuery({
    queryKey: ['comandas'],
    queryFn: api.getComandas,
    refetchInterval: 5000,
    retry: 3,
    retryDelay: 1000
  });

  // Query para obtener estadísticas
  const { data: stats, error: statsError } = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
    retry: 3,
    retryDelay: 1000
  });

  // Query para obtener evento activo
  const { data: activeEvent, error: eventError } = useQuery({
    queryKey: ['active-event'],
    queryFn: api.getEventoActivo,
    retry: 3,
    retryDelay: 1000
  });

  // Mostrar errores de queries
  useEffect(() => {
    if (comandasError) {
      toast({
        title: "🔴 Error cargando comandas",
        description: comandasError instanceof Error ? comandasError.message : "Error desconocido",
        duration: 5000
      });
    }
    
    if (statsError) {
      toast({
        title: "🔴 Error cargando estadísticas",
        description: statsError instanceof Error ? statsError.message : "Error desconocido",
        duration: 5000
      });
    }
    
    if (eventError) {
      toast({
        title: "🔴 Error cargando evento",
        description: eventError instanceof Error ? eventError.message : "Error desconocido",
        duration: 5000
      });
    }
  }, [comandasError, statsError, eventError, toast]);

  // Mutación para crear comanda
  const createComanda = useMutation({
    mutationFn: async (comandaData: any) => {
      // Validar datos antes de enviar
      const errors = validateComandaData(comandaData);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      if (syncStatus.isOnline) {
        return api.createComanda(comandaData);
      } else {
        return createOfflineComanda.mutateAsync(comandaData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comandas'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast({
        title: "🟢 Comanda creada",
        description: syncStatus.isOnline ? "Comanda creada exitosamente" : "Comanda guardada offline",
        duration: 3000
      });
    },
    onError: (error) => {
      console.error('Error creando comanda:', error);
      toast({
        title: "🔴 Error",
        description: error instanceof Error ? error.message : "No se pudo crear la comanda",
        duration: 5000
      });
    }
  });

  // Mutación para procesar pago
  const processPayment = useMutation({
    mutationFn: async ({ comandaId, paymentData }: { comandaId: string; paymentData: any }) => {
      // Validar datos de pago
      const errors = validatePaymentData(paymentData);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      if (syncStatus.isOnline) {
        return api.updateComandaStatus(comandaId, paymentData.estado, paymentData.metodo_pago, paymentData.nota);
      } else {
        return processOfflinePayment.mutateAsync({
          comanda_id: comandaId,
          estado: 'pagado',
          metodo_pago: paymentData.metodo_pago,
          monto: paymentData.total,
          nota: paymentData.nota
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comandas'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setIsProcessingPayment(false);
      setSelectedComanda(null);
      setPaymentNote('');
      setValidationErrors([]);
      toast({
        title: "🟢 Pago procesado",
        description: syncStatus.isOnline ? "Pago procesado exitosamente" : "Pago guardado offline",
        duration: 3000
      });
    },
    onError: (error) => {
      console.error('Error procesando pago:', error);
      setIsProcessingPayment(false);
      toast({
        title: "🔴 Error",
        description: error instanceof Error ? error.message : "No se pudo procesar el pago",
        duration: 5000
      });
    }
  });

  // Funciones de validación
  const validateComandaData = (data: any): string[] => {
    const errors: string[] = [];
    
    if (!data.usuario_id || typeof data.usuario_id !== 'number') {
      errors.push('ID de usuario inválido');
    }
    
    if (!data.evento_id || typeof data.evento_id !== 'number') {
      errors.push('ID de evento inválido');
    }
    
    if (!data.total || typeof data.total !== 'number' || data.total <= 0) {
      errors.push('Total inválido');
    }
    
    if (!data.nombre_cliente || typeof data.nombre_cliente !== 'string' || data.nombre_cliente.trim().length === 0) {
      errors.push('Nombre de cliente requerido');
    }
    
    if (!data.productos || !Array.isArray(data.productos) || data.productos.length === 0) {
      errors.push('Debe incluir al menos un producto');
    }
    
    return errors;
  };

  const validatePaymentData = (data: any): string[] => {
    const errors: string[] = [];
    
    if (!data.estado || !['pendiente', 'pagado', 'cancelado'].includes(data.estado)) {
      errors.push('Estado inválido');
    }
    
    if (data.estado === 'pagado' && !data.metodo_pago) {
      errors.push('Método de pago requerido para comandas pagadas');
    }
    
    if (data.metodo_pago && !['efectivo', 'transferencia', 'invitacion'].includes(data.metodo_pago)) {
      errors.push('Método de pago inválido');
    }
    
    return errors;
  };

  // Filtrar comandas
  const filteredComandas = comandas.filter((comanda: Comanda) => {
    const matchesSearch = comanda.nombre_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comanda.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'todos' || comanda.estado === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calcular estadísticas de caja
  const cajaStats: CajaStats = {
    totalVentas: comandas
      .filter((c: Comanda) => c.estado === 'pagado')
      .reduce((sum: number, c: Comanda) => sum + c.total, 0),
    totalComandas: comandas.length,
    comandasPendientes: comandas.filter((c: Comanda) => c.estado === 'pendiente').length,
    comandasPagadas: comandas.filter((c: Comanda) => c.estado === 'pagado').length,
    comandasCanceladas: comandas.filter((c: Comanda) => c.estado === 'cancelado').length,
    efectivo: comandas
      .filter((c: Comanda) => c.estado === 'pagado' && c.metodo_pago === 'efectivo')
      .reduce((sum: number, c: Comanda) => sum + c.total, 0),
    transferencia: comandas
      .filter((c: Comanda) => c.estado === 'pagado' && c.metodo_pago === 'transferencia')
      .reduce((sum: number, c: Comanda) => sum + c.total, 0),
    invitacion: comandas
      .filter((c: Comanda) => c.estado === 'pagado' && c.metodo_pago === 'invitacion')
      .reduce((sum: number, c: Comanda) => sum + c.total, 0)
  };

  const handleProcessPayment = () => {
    if (!selectedComanda) return;

    // Validar datos antes de procesar
    const paymentData = {
      estado: 'pagado',
      metodo_pago: paymentMethod,
      nota: paymentNote,
      total: selectedComanda.total
    };

    const errors = validatePaymentData(paymentData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast({
        title: "🔴 Datos inválidos",
        description: errors.join(', '),
        duration: 5000
      });
      return;
    }

    setIsProcessingPayment(true);
    processPayment.mutate({
      comandaId: selectedComanda.id,
      paymentData
    });
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
      case 'pagado':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Pagado</Badge>;
      case 'cancelado':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  const getPaymentMethodIcon = (metodo?: string) => {
    switch (metodo) {
      case 'efectivo':
        return <Banknote className="w-4 h-4 text-green-600" />;
      case 'transferencia':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 'invitacion':
        return <Gift className="w-4 h-4 text-purple-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  if (isLoadingComandas) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Cargando comandas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Indicador de estado offline */}
      <OfflineIndicator />

      {/* Estadísticas de caja */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${cajaStats.totalVentas.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {cajaStats.comandasPagadas} comandas pagadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comandas Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cajaStats.comandasPendientes}</div>
            <p className="text-xs text-muted-foreground">
              de {cajaStats.totalComandas} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efectivo</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${cajaStats.efectivo.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {cajaStats.comandasPagadas > 0 ? Math.round((cajaStats.efectivo / cajaStats.totalVentas) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transferencias</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${cajaStats.transferencia.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {cajaStats.comandasPagadas > 0 ? Math.round((cajaStats.transferencia / cajaStats.totalVentas) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Comandas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar comandas</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por cliente o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="filter">Filtrar por estado</Label>
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendientes</SelectItem>
                  <SelectItem value="pagado">Pagados</SelectItem>
                  <SelectItem value="cancelado">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de comandas */}
      <Card>
        <CardHeader>
          <CardTitle>Comandas ({filteredComandas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredComandas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay comandas que coincidan con los filtros</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Método Pago</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComandas.map((comanda: Comanda) => (
                  <TableRow key={comanda.id}>
                    <TableCell className="font-mono">#{comanda.id}</TableCell>
                    <TableCell>{comanda.nombre_cliente}</TableCell>
                    <TableCell>${comanda.total.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(comanda.estado)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(comanda.metodo_pago)}
                        <span className="capitalize">{comanda.metodo_pago || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(comanda.fecha_creacion).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedComanda(comanda)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalles de Comanda #{comanda.id}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Cliente</Label>
                                <p className="font-medium">{comanda.nombre_cliente}</p>
                              </div>
                              <div>
                                <Label>Productos</Label>
                                <div className="space-y-2">
                                  {comanda.productos.map((producto, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                                      <span>{producto.nombre}</span>
                                      <span className="text-sm text-muted-foreground">
                                        {producto.cantidad} x ${producto.precio.toLocaleString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex justify-between items-center pt-4 border-t">
                                <span className="font-bold">Total:</span>
                                <span className="font-bold text-lg">${comanda.total.toLocaleString()}</span>
                              </div>
                              {comanda.estado === 'pendiente' && (
                                <div className="space-y-4 pt-4">
                                  <div>
                                    <Label htmlFor="payment-method">Método de Pago</Label>
                                    <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="efectivo">Efectivo</SelectItem>
                                        <SelectItem value="transferencia">Transferencia</SelectItem>
                                        <SelectItem value="invitacion">Invitación</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="payment-note">Nota (opcional)</Label>
                                    <Textarea
                                      id="payment-note"
                                      value={paymentNote}
                                      onChange={(e) => setPaymentNote(e.target.value)}
                                      placeholder="Agregar nota sobre el pago..."
                                    />
                                  </div>
                                  {validationErrors.length > 0 && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                      <div className="flex items-center gap-2 text-red-800">
                                        <AlertTriangle className="w-4 h-4" />
                                        <span className="font-medium">Errores de validación:</span>
                                      </div>
                                      <ul className="mt-2 text-sm text-red-700">
                                        {validationErrors.map((error, index) => (
                                          <li key={index}>• {error}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  <Button
                                    onClick={handleProcessPayment}
                                    disabled={isProcessingPayment}
                                    className="w-full"
                                  >
                                    {isProcessingPayment ? (
                                      <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Procesando...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Procesar Pago
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm">
                          <Printer className="h-4 w-4" />
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
    </div>
  );
}
