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
  Clock
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

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { createOfflineComanda, processOfflinePayment, syncStatus } = useOfflineSync();

  // Query para obtener comandas
  const { data: comandas = [], isLoading: isLoadingComandas } = useQuery({
    queryKey: ['comandas'],
    queryFn: api.getComandas,
    refetchInterval: 5000
  });

  // Query para obtener estadísticas
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats
  });

  // Query para obtener evento activo
  const { data: activeEvent } = useQuery({
    queryKey: ['active-event'],
    queryFn: api.getEventoActivo
  });

  // Mutación para crear comanda
  const createComanda = useMutation({
    mutationFn: async (comandaData: any) => {
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
        description: "No se pudo crear la comanda",
        duration: 5000
      });
    }
  });

  // Mutación para procesar pago
  const processPayment = useMutation({
    mutationFn: async ({ comandaId, paymentData }: { comandaId: string; paymentData: any }) => {
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
        description: "No se pudo procesar el pago",
        duration: 5000
      });
    }
  });

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

    setIsProcessingPayment(true);
    processPayment.mutate({
      comandaId: selectedComanda.id,
      paymentData: {
        estado: 'pagado',
        metodo_pago: paymentMethod,
        nota: paymentNote
      }
    });
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">Pendiente</Badge>;
      case 'pagado':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Pagado</Badge>;
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const getPaymentMethodIcon = (metodo?: string) => {
    switch (metodo) {
      case 'efectivo':
        return <Banknote className="w-4 h-4" />;
      case 'transferencia':
        return <CreditCard className="w-4 h-4" />;
      case 'invitacion':
        return <Gift className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con indicador offline */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Caja</h2>
          <p className="text-muted-foreground">
            Gestiona comandas y pagos {activeEvent && `- ${activeEvent.nombre}`}
          </p>
        </div>
        <OfflineIndicator />
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${cajaStats.totalVentas.toFixed(2)}</div>
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
            <div className="text-2xl font-bold">${cajaStats.efectivo.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Pagos en efectivo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transferencias</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${cajaStats.transferencia.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Pagos por transferencia
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gestión de comandas */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Comandas</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
                <SelectItem value="pagado">Pagados</SelectItem>
                <SelectItem value="cancelado">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingComandas ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Cargando comandas...</span>
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
                    <TableCell className="font-mono text-sm">{comanda.id}</TableCell>
                    <TableCell>{comanda.nombre_cliente}</TableCell>
                    <TableCell className="font-medium">${comanda.total.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(comanda.estado)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getPaymentMethodIcon(comanda.metodo_pago)}
                        <span className="text-sm capitalize">
                          {comanda.metodo_pago || 'Pendiente'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(comanda.fecha_creacion).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalles de Comanda - {comanda.id}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Cliente</Label>
                                  <p className="text-sm font-medium">{comanda.nombre_cliente}</p>
                                </div>
                                <div>
                                  <Label>Total</Label>
                                  <p className="text-sm font-medium">${comanda.total.toFixed(2)}</p>
                                </div>
                              </div>
                              
                              <div>
                                <Label>Productos</Label>
                                <div className="mt-2 space-y-2">
                                  {comanda.productos.map((producto, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                                      <span className="text-sm">{producto.nombre}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                          {producto.cantidad}x
                                        </span>
                                        <span className="text-sm font-medium">
                                          ${producto.precio.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {comanda.nota && (
                                <div>
                                  <Label>Nota</Label>
                                  <p className="text-sm text-muted-foreground">{comanda.nota}</p>
                                </div>
                              )}

                              {comanda.estado === 'pendiente' && (
                                <div className="pt-4 border-t">
                                  <Button 
                                    onClick={() => setSelectedComanda(comanda)}
                                    className="w-full"
                                  >
                                    Procesar Pago
                                  </Button>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        {comanda.estado === 'pagado' && (
                          <Button variant="outline" size="sm">
                            <Printer className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de procesamiento de pago */}
      <Dialog open={!!selectedComanda} onOpenChange={() => setSelectedComanda(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Procesar Pago - {selectedComanda?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cliente</Label>
                <p className="text-sm font-medium">{selectedComanda?.nombre_cliente}</p>
              </div>
              <div>
                <Label>Total</Label>
                <p className="text-sm font-medium">${selectedComanda?.total.toFixed(2)}</p>
              </div>
            </div>

            <div>
              <Label htmlFor="payment-method">Método de Pago</Label>
              <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      Efectivo
                    </div>
                  </SelectItem>
                  <SelectItem value="transferencia">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Transferencia
                    </div>
                  </SelectItem>
                  <SelectItem value="invitacion">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4" />
                      Invitación
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment-note">Nota (opcional)</Label>
              <Textarea
                id="payment-note"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Nota adicional sobre el pago..."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleProcessPayment}
                disabled={isProcessingPayment}
                className="flex-1"
              >
                {isProcessingPayment ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar Pago
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedComanda(null)}
                disabled={isProcessingPayment}
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
