'use client';

import React from 'react';
import { useEventContext } from '@/lib/event-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, RefreshCw } from 'lucide-react';

const EventSelector: React.FC = () => {
  const { eventoActivo, eventos, loading, cambiarEventoActivo, refreshEventos } = useEventContext();

  const handleEventChange = async (eventoId: string) => {
    await cambiarEventoActivo(parseInt(eventoId));
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Evento Activo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Evento Activo
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshEventos}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {eventoActivo ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{eventoActivo.nombre}</h3>
              <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                Activo
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(eventoActivo.fecha_inicio)} - {formatDate(eventoActivo.fecha_fin)}
              </div>
              {eventoActivo.ubicacion && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {eventoActivo.ubicacion}
                </div>
              )}
            </div>

            {eventos.length > 1 && (
              <div className="pt-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Cambiar evento:
                </label>
                <select
                  value={eventoActivo.id}
                  onChange={(e) => handleEventChange(e.target.value)}
                  className="mt-1 w-full p-2 text-sm border rounded-md bg-background text-foreground"
                >
                  {eventos.map((evento) => (
                    <option key={evento.id} value={evento.id}>
                      {evento.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-3">No hay evento activo</p>
            {eventos.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Seleccionar evento:
                </label>
                <select
                  onChange={(e) => handleEventChange(e.target.value)}
                  className="mt-1 w-full p-2 text-sm border rounded-md bg-background text-foreground"
                >
                  <option value="">Seleccionar...</option>
                  {eventos.map((evento) => (
                    <option key={evento.id} value={evento.id}>
                      {evento.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventSelector; 