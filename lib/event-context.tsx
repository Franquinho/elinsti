'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Evento {
  id: number;
  nombre: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  capacidad_maxima?: number;
  precio_entrada: number;
  ubicacion?: string;
  imagen_url?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

interface EventContextType {
  eventoActivo: Evento | null;
  eventos: Evento[];
  loading: boolean;
  error: string | null;
  setEventoActivo: (evento: Evento | null) => void;
  cambiarEventoActivo: (eventoId: number) => Promise<void>;
  refreshEventos: () => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};

interface EventProviderProps {
  children: ReactNode;
}

export const EventProvider: React.FC<EventProviderProps> = ({ children }) => {
  const [eventoActivo, setEventoActivo] = useState<Evento | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Cargar eventos al inicializar
  const loadEventos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/eventos');
      const data = await response.json();
      
      if (data.success) {
        setEventos(data.eventos);
      } else {
        setError(data.message || 'Error al cargar eventos');
        toast({
          title: "Error",
          description: data.message || 'Error al cargar eventos',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error cargando eventos:', error);
      setError('Error de conexión al cargar eventos');
      toast({
        title: "Error de conexión",
        description: 'No se pudieron cargar los eventos',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar evento activo
  const loadEventoActivo = async () => {
    try {
      const response = await fetch('/api/eventos/active');
      const data = await response.json();
      
      if (data.success) {
        setEventoActivo(data.evento);
      } else {
        console.error('Error cargando evento activo:', data.message);
      }
    } catch (error) {
      console.error('Error cargando evento activo:', error);
    }
  };

  // Cambiar evento activo
  const cambiarEventoActivo = async (eventoId: number) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/eventos/active', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventoId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEventoActivo(data.evento);
        toast({
          title: "Evento activado",
          description: `Evento "${data.evento.nombre}" activado correctamente`,
        });
      } else {
        setError(data.message || 'Error al cambiar evento activo');
        toast({
          title: "Error",
          description: data.message || 'Error al cambiar evento activo',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error cambiando evento activo:', error);
      setError('Error de conexión al cambiar evento activo');
      toast({
        title: "Error de conexión",
        description: 'No se pudo cambiar el evento activo',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Refrescar eventos
  const refreshEventos = async () => {
    await loadEventos();
    await loadEventoActivo();
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadEventos();
    loadEventoActivo();
  }, []);

  const value: EventContextType = {
    eventoActivo,
    eventos,
    loading,
    error,
    setEventoActivo,
    cambiarEventoActivo,
    refreshEventos,
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
}; 