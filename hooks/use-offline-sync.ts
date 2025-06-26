import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offlineStorage, type OfflineComanda, type OfflinePago } from '../lib/offline-storage';
import { api } from '../lib/api';
import { useToast } from './use-toast';

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  pendingItems: number;
}

export function useOfflineSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSync: null,
    pendingItems: 0
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Detectar cambios en la conectividad
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      toast({
        title: "🟢 Conexión restaurada",
        description: "Sincronizando datos offline...",
        duration: 3000
      });
      syncOfflineData();
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
      toast({
        title: "🔴 Sin conexión",
        description: "Los datos se guardarán localmente",
        duration: 3000
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Inicializar almacenamiento offline
  useEffect(() => {
    const initOfflineStorage = async () => {
      try {
        await offlineStorage.init();
        updatePendingItems();
      } catch (error) {
        console.error('Error inicializando almacenamiento offline:', error);
      }
    };

    initOfflineStorage();
  }, []);

  // Actualizar contador de elementos pendientes
  const updatePendingItems = useCallback(async () => {
    try {
      const stats = await offlineStorage.obtenerEstadisticasOffline();
      setSyncStatus(prev => ({
        ...prev,
        pendingItems: stats.comandasPendientes + stats.pagosPendientes
      }));
    } catch (error) {
      console.error('Error actualizando elementos pendientes:', error);
    }
  }, []);

  // Sincronizar comandas offline
  const syncComandas = useCallback(async () => {
    try {
      const comandasOffline = await offlineStorage.obtenerComandasNoSincronizadas();
      
      for (const comanda of comandasOffline) {
        try {
          // Crear comanda en el servidor
          const comandaData = {
            usuario_id: comanda.usuario_id,
            evento_id: comanda.evento_id,
            total: comanda.total,
            nombre_cliente: comanda.nombre_cliente,
            productos: comanda.productos,
            estado: comanda.estado,
            metodo_pago: comanda.metodo_pago,
            nota: comanda.nota
          };

          await api.createComanda(comandaData);
          
          // Marcar como sincronizada
          await offlineStorage.marcarComandaSincronizada(comanda.id);
          
          console.log('🟢 Comanda sincronizada:', comanda.id);
        } catch (error) {
          console.error('🔴 Error sincronizando comanda:', comanda.id, error);
        }
      }
    } catch (error) {
      console.error('🔴 Error en sincronización de comandas:', error);
      throw error;
    }
  }, []);

  // Sincronizar pagos offline
  const syncPagos = useCallback(async () => {
    try {
      const pagosOffline = await offlineStorage.obtenerPagosNoSincronizados();
      
      for (const pago of pagosOffline) {
        try {
          // Actualizar estado de comanda en el servidor
          await api.updateComandaStatus(pago.comanda_id, pago.estado, pago.metodo_pago, pago.nota);
          
          // Marcar como sincronizado
          await offlineStorage.marcarPagoSincronizado(pago.id);
          
          console.log('🟢 Pago sincronizado:', pago.id);
        } catch (error) {
          console.error('🔴 Error sincronizando pago:', pago.id, error);
        }
      }
    } catch (error) {
      console.error('🔴 Error en sincronización de pagos:', error);
      throw error;
    }
  }, []);

  // Sincronización completa
  const syncOfflineData = useCallback(async () => {
    if (!navigator.onLine || syncStatus.isSyncing) {
      return;
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true }));

    try {
      await Promise.all([
        syncComandas(),
        syncPagos()
      ]);

      // Limpiar datos sincronizados
      await offlineStorage.limpiarDatosSincronizados();
      
      // Actualizar cache de React Query
      queryClient.invalidateQueries({ queryKey: ['comandas'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSync: new Date(),
        pendingItems: 0
      }));

      toast({
        title: "🟢 Sincronización completada",
        description: "Todos los datos offline han sido sincronizados",
        duration: 3000
      });

    } catch (error) {
      console.error('🔴 Error en sincronización completa:', error);
      setSyncStatus(prev => ({ ...prev, isSyncing: false }));
      
      toast({
        title: "🔴 Error de sincronización",
        description: "Algunos datos no pudieron sincronizarse",
        duration: 5000
      });
    }
  }, [syncComandas, syncPagos, queryClient, toast, syncStatus.isSyncing]);

  // Mutación para crear comanda offline
  const createOfflineComanda = useMutation({
    mutationFn: async (comandaData: Omit<OfflineComanda, 'id' | 'sincronizado' | 'fecha_creacion'>) => {
      const comanda = {
        ...comandaData,
        fecha_creacion: new Date().toISOString()
      };

      const id = await offlineStorage.guardarComandaOffline(comanda);
      await updatePendingItems();
      
      return id;
    },
    onSuccess: (id) => {
      toast({
        title: "🟢 Comanda creada offline",
        description: `ID: ${id}`,
        duration: 3000
      });
    },
    onError: (error) => {
      console.error('🔴 Error creando comanda offline:', error);
      toast({
        title: "🔴 Error",
        description: "No se pudo crear la comanda offline",
        duration: 5000
      });
    }
  });

  // Mutación para procesar pago offline
  const processOfflinePayment = useMutation({
    mutationFn: async (pagoData: Omit<OfflinePago, 'id' | 'sincronizado' | 'fecha_creacion'>) => {
      const pago = {
        ...pagoData,
        fecha_creacion: new Date().toISOString()
      };

      const id = await offlineStorage.guardarPagoOffline(pago);
      await updatePendingItems();
      
      return id;
    },
    onSuccess: (id) => {
      toast({
        title: "🟢 Pago procesado offline",
        description: `ID: ${id}`,
        duration: 3000
      });
    },
    onError: (error) => {
      console.error('🔴 Error procesando pago offline:', error);
      toast({
        title: "🔴 Error",
        description: "No se pudo procesar el pago offline",
        duration: 5000
      });
    }
  });

  // Query para estadísticas offline
  const offlineStats = useQuery({
    queryKey: ['offline-stats'],
    queryFn: offlineStorage.obtenerEstadisticasOffline,
    refetchInterval: 5000, // Actualizar cada 5 segundos
    enabled: !navigator.onLine
  });

  // Sincronización automática cuando hay conexión
  useEffect(() => {
    if (navigator.onLine && syncStatus.pendingItems > 0 && !syncStatus.isSyncing) {
      const timer = setTimeout(() => {
        syncOfflineData();
      }, 2000); // Esperar 2 segundos antes de sincronizar

      return () => clearTimeout(timer);
    }
  }, [navigator.onLine, syncStatus.pendingItems, syncStatus.isSyncing, syncOfflineData]);

  return {
    syncStatus,
    syncOfflineData,
    createOfflineComanda,
    processOfflinePayment,
    offlineStats: offlineStats.data,
    isOfflineStatsLoading: offlineStats.isLoading,
    updatePendingItems
  };
} 