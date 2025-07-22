'use client';

import React from 'react';
import { useEventContext } from '@/lib/event-context';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, DollarSign, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const EventSelector: React.FC = () => {
  const { eventoActivo, eventos, loading, cambiarEventoActivo, refreshEventos } = useEventContext();

  const handleEventChange = async (eventoId: string) => {
    await cambiarEventoActivo(parseInt(eventoId));
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: es });
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
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selector de Evento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Seleccionar Evento
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshEventos}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={eventoActivo?.id?.toString() || ''}
            onValueChange={handleEventChange}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un evento" />
            </SelectTrigger>
            <SelectContent>
              {eventos
                .filter(evento => evento.activo)
                .map((evento) => (
                  <SelectItem key={evento.id} value={evento.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{evento.nombre}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(evento.fecha_inicio)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Información del Evento Activo */}
      {eventoActivo && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Evento Activo
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                ACTIVO
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-green-800">
                {eventoActivo.nombre}
              </h3>
              {eventoActivo.descripcion && (
                <p className="text-sm text-gray-600 mt-1">
                  {eventoActivo.descripcion}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Inicio:</span>
                <span>{formatDate(eventoActivo.fecha_inicio)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Fin:</span>
                <span>{formatDate(eventoActivo.fecha_fin)}</span>
              </div>

              {eventoActivo.ubicacion && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Ubicación:</span>
                  <span>{eventoActivo.ubicacion}</span>
                </div>
              )}

              {eventoActivo.capacidad_maxima && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Capacidad:</span>
                  <span>{eventoActivo.capacidad_maxima} personas</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Precio:</span>
                <span>${eventoActivo.precio_entrada.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sin Evento Activo */}
      {!eventoActivo && eventos.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-yellow-600" />
              Sin Evento Activo
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                SIN ACTIVAR
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-700">
              No hay ningún evento activo en este momento. 
              Selecciona un evento de la lista para activarlo.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Sin Eventos */}
      {!loading && eventos.length === 0 && (
        <Card className="border-gray-200 bg-gray-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              Sin Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              No hay eventos disponibles. Crea un nuevo evento para comenzar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EventSelector; 