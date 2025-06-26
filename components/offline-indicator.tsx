import React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { useOfflineSync } from '../hooks/use-offline-sync';
import { cn } from '../lib/utils';

interface OfflineIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export function OfflineIndicator({ className, showDetails = false }: OfflineIndicatorProps) {
  const { 
    syncStatus, 
    syncOfflineData, 
    offlineStats, 
    isOfflineStatsLoading 
  } = useOfflineSync();

  const isOnline = syncStatus.isOnline;
  const hasPendingItems = syncStatus.pendingItems > 0;

  if (!showDetails) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {isOnline ? (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <Wifi className="w-3 h-3 mr-1" />
            Online
          </Badge>
        ) : (
          <Badge variant="destructive">
            <WifiOff className="w-3 h-3 mr-1" />
            Offline
          </Badge>
        )}
        
        {hasPendingItems && (
          <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">
            {syncStatus.pendingItems} pendiente{syncStatus.pendingItems !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            <span className="font-semibold">
              {isOnline ? 'Conectado' : 'Sin conexión'}
            </span>
          </div>
          
          {hasPendingItems && (
            <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">
              {syncStatus.pendingItems} pendiente{syncStatus.pendingItems !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {!isOnline && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <span>Los datos se guardarán localmente</span>
            </div>

            {isOfflineStatsLoading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Cargando estadísticas...</span>
              </div>
            ) : offlineStats ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Comandas pendientes:
                  </span>
                  <span className="font-medium">{offlineStats.comandasPendientes}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Pagos pendientes:
                  </span>
                  <span className="font-medium">{offlineStats.pagosPendientes}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Total offline:</span>
                  <span className="font-medium">${offlineStats.totalOffline.toFixed(2)}</span>
                </div>

                {offlineStats.cajaAbierta && (
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Caja abierta offline
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {isOnline && hasPendingItems && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="w-4 h-4" />
              <span>Datos pendientes de sincronización</span>
            </div>

            {syncStatus.isSyncing ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Sincronizando...</span>
                </div>
                <Progress value={50} className="h-2" />
              </div>
            ) : (
              <Button 
                onClick={syncOfflineData}
                size="sm"
                className="w-full"
                disabled={syncStatus.isSyncing}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Sincronizar ahora
              </Button>
            )}
          </div>
        )}

        {syncStatus.lastSync && (
          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
            Última sincronización: {syncStatus.lastSync.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 