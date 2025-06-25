"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Users, DollarSign, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Evento } from "@/lib/types"

interface EventSelectorProps {
  onEventChange?: (evento: Evento) => void
  showStats?: boolean
}

export function EventSelector({ onEventChange, showStats = false }: EventSelectorProps) {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [eventoActivo, setEventoActivo] = useState<Evento | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isChanging, setIsChanging] = useState(false)
  const { toast } = useToast()

  const cargarEventos = async () => {
    try {
      setIsLoading(true)
      const [eventosRes, activoRes] = await Promise.all([
        apiClient.getEventos(),
        apiClient.getEventoActivo()
      ])

      if (eventosRes.success) {
        setEventos(eventosRes.eventos || [])
      }

      if (activoRes.success) {
        setEventoActivo(activoRes.evento)
        if (onEventChange && activoRes.evento) {
          onEventChange(activoRes.evento)
        }
      }
    } catch (error: any) {
      console.error("Error cargando eventos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los eventos",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    cargarEventos()
  }, [])

  const cambiarEventoActivo = async (eventoId: number) => {
    try {
      setIsChanging(true)
      const res = await apiClient.setEventoActivo(eventoId)
      
      if (res.success) {
        const eventoSeleccionado = eventos.find(e => e.id === eventoId)
        if (eventoSeleccionado) {
          setEventoActivo(eventoSeleccionado)
          if (onEventChange) {
            onEventChange(eventoSeleccionado)
          }
          toast({
            title: "Evento cambiado",
            description: `Evento activo: ${eventoSeleccionado.nombre}`,
          })
        }
      }
    } catch (error: any) {
      console.error("Error cambiando evento:", error)
      toast({
        title: "Error",
        description: "No se pudo cambiar el evento activo",
        variant: "destructive"
      })
    } finally {
      setIsChanging(false)
    }
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const obtenerEstadoEvento = (evento: Evento) => {
    const ahora = new Date()
    const inicio = new Date(evento.fecha_inicio)
    const fin = new Date(evento.fecha_fin)

    if (ahora < inicio) {
      return { estado: 'próximo', color: 'bg-blue-100 text-blue-800', icon: AlertCircle }
    } else if (ahora >= inicio && ahora <= fin) {
      return { estado: 'en curso', color: 'bg-green-100 text-green-800', icon: CheckCircle }
    } else {
      return { estado: 'finalizado', color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
    }
  }

  if (isLoading) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
          <span className="ml-2 text-amber-700">Cargando eventos...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Selector de evento activo */}
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <Calendar className="w-5 h-5" />
            Evento Activo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {eventoActivo ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-amber-900">{eventoActivo.nombre}</h3>
                  {eventoActivo.descripcion && (
                    <p className="text-sm text-amber-700 mt-1">{eventoActivo.descripcion}</p>
                  )}
                </div>
                <Badge className={obtenerEstadoEvento(eventoActivo).color}>
                  {obtenerEstadoEvento(eventoActivo).estado}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-700">
                    {formatearFecha(eventoActivo.fecha_inicio)}
                  </span>
                </div>
                {eventoActivo.ubicacion && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <span className="text-amber-700">{eventoActivo.ubicacion}</span>
                  </div>
                )}
                {eventoActivo.capacidad_maxima && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-600" />
                    <span className="text-amber-700">
                      Capacidad: {eventoActivo.capacidad_maxima}
                    </span>
                  </div>
                )}
                {eventoActivo.precio_entrada > 0 && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-600" />
                    <span className="text-amber-700">
                      ${eventoActivo.precio_entrada}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-amber-700">No hay evento activo</p>
            </div>
          )}

          {/* Selector de eventos */}
          {eventos.length > 0 && (
            <div className="mt-4 pt-4 border-t border-amber-200">
              <label className="block text-sm font-medium text-amber-800 mb-2">
                Cambiar evento activo:
              </label>
              <div className="flex gap-2">
                <Select
                  value={eventoActivo?.id?.toString() || ""}
                  onValueChange={(value) => cambiarEventoActivo(parseInt(value))}
                  disabled={isChanging}
                >
                  <SelectTrigger className="flex-1 border-amber-300">
                    <SelectValue placeholder="Seleccionar evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventos
                      .filter(evento => evento.activo)
                      .map((evento) => (
                        <SelectItem key={evento.id} value={evento.id.toString()}>
                          <div className="flex items-center gap-2">
                            <span>{evento.nombre}</span>
                            <Badge variant="outline" className="text-xs">
                              {obtenerEstadoEvento(evento).estado}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cargarEventos}
                  disabled={isChanging}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  <Loader2 className={`w-4 h-4 ${isChanging ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de todos los eventos */}
      {showStats && eventos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Todos los Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {eventos.map((evento) => (
                <div
                  key={evento.id}
                  className={`p-3 rounded-lg border ${
                    evento.id === eventoActivo?.id
                      ? 'border-amber-300 bg-amber-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{evento.nombre}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>{formatearFecha(evento.fecha_inicio)}</span>
                        {evento.ubicacion && <span>• {evento.ubicacion}</span>}
                        {evento.capacidad_maxima && (
                          <span>• Capacidad: {evento.capacidad_maxima}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={obtenerEstadoEvento(evento).color}>
                        {obtenerEstadoEvento(evento).estado}
                      </Badge>
                      {evento.id === eventoActivo?.id && (
                        <Badge className="bg-green-100 text-green-800">
                          Activo
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 