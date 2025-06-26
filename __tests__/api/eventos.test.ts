import { GET as getEventos, POST as createEvento } from '@/app/api/eventos/route';
import { GET as getEventoActivo, POST as setEventoActivo } from '@/app/api/eventos/active/route';
import { GET as getEventosStats } from '@/app/api/eventos/stats/route';

describe('API de Eventos', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Pruebas para /api/eventos
  describe('GET /api/eventos', () => {
    it('debería obtener todos los eventos', async () => {
        const eventosMock = [
          { 
            id: 1, 
            nombre: 'Noche de Jazz', 
            descripcion: 'Música en vivo',
            fecha_inicio: '2025-06-25T20:00:00Z',
            fecha_fin: '2025-06-25T23:00:00Z',
            activo: true,
            capacidad_maxima: 100,
            precio_entrada: 25.00,
            ubicacion: 'Sala Principal',
            imagen_url: null,
            created_at: '2025-06-24T10:00:00Z',
            updated_at: '2025-06-24T10:00:00Z'
          },
          { 
            id: 2, 
            nombre: 'Rock Night', 
            descripcion: 'Bandas locales',
            fecha_inicio: '2025-06-26T21:00:00Z',
            fecha_fin: '2025-06-27T02:00:00Z',
            activo: true,
            capacidad_maxima: 150,
            precio_entrada: 30.00,
            ubicacion: 'Patio Trasero',
            imagen_url: null,
            created_at: '2025-06-24T11:00:00Z',
            updated_at: '2025-06-24T11:00:00Z'
          }
        ];
        
        global.mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ 
              data: eventosMock, 
              error: null 
            })
          })
        });
        
        const response = await getEventos();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.eventos).toHaveLength(2);
        expect(data.eventos[0].nombre).toBe('Noche de Jazz');
        expect(data.eventos[1].nombre).toBe('Rock Night');
        expect(global.mockSupabase.from).toHaveBeenCalledWith('eventos');
    });

    it('debería manejar errores al obtener eventos', async () => {
        global.mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { message: 'Error de base de datos' } 
            })
          })
        });
        
        const response = await getEventos();
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.message).toBe('Error al obtener eventos');
    });
  });

  describe('POST /api/eventos', () => {
    it('debería crear un nuevo evento', async () => {
        const nuevoEvento = {
          nombre: 'Noche de Blues',
          descripcion: 'Blues en vivo',
          fecha_inicio: '2025-06-27T20:00:00Z',
          fecha_fin: '2025-06-27T23:00:00Z',
          capacidad_maxima: 80,
          precio_entrada: 20.00,
          ubicacion: 'Sala Intima',
          imagen_url: 'https://ejemplo.com/blues.jpg'
        };
        
        // Mock para verificar evento existente (no existe)
        global.mockSupabase.from.mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                lte: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({ data: null, error: null })
                })
              })
            })
          })
        });

        // Mock para crear evento
        global.mockSupabase.from.mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ 
                data: { id: 3, ...nuevoEvento, activo: true }, 
                error: null 
              })
            })
          })
        });
        
        const request = new Request('http://localhost/api/eventos', {
            method: 'POST',
            body: JSON.stringify(nuevoEvento),
        });

        const response = await createEvento(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.evento.nombre).toBe('Noche de Blues');
        expect(data.evento.activo).toBe(true);
        expect(global.mockSupabase.from).toHaveBeenCalledWith('eventos');
    });

    it('debería validar campos requeridos', async () => {
        const eventoInvalido = {
          descripcion: 'Sin nombre',
          fecha_inicio: '2025-06-27T20:00:00Z'
        };
        
        const request = new Request('http://localhost/api/eventos', {
            method: 'POST',
            body: JSON.stringify(eventoInvalido),
        });

        const response = await createEvento(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.message).toBe('El nombre del evento es requerido');
    });

    it('debería validar fechas', async () => {
        const eventoFechasInvalidas = {
          nombre: 'Evento Test',
          fecha_inicio: '2025-06-27T23:00:00Z',
          fecha_fin: '2025-06-27T20:00:00Z' // Fecha fin antes que inicio
        };
        
        const request = new Request('http://localhost/api/eventos', {
            method: 'POST',
            body: JSON.stringify(eventoFechasInvalidas),
        });

        const response = await createEvento(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.message).toBe('La fecha de fin debe ser posterior a la fecha de inicio');
    });
  });

  // Pruebas para /api/eventos/active
  describe('GET /api/eventos/active', () => {
    it('debería obtener el evento activo', async () => {
        const configMock = { valor: '1' };
        const eventoActivoMock = {
          id: 1,
          nombre: 'Noche de Jazz',
          activo: true,
          fecha_inicio: '2025-06-25T20:00:00Z',
          fecha_fin: '2025-06-25T23:00:00Z'
        };

        // Mock para obtener configuración
        global.mockSupabase.from.mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: configMock, error: null })
            })
          })
        });

        // Mock para obtener evento activo
        global.mockSupabase.from.mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: eventoActivoMock, error: null })
              })
            })
          })
        });
        
        const response = await getEventoActivo();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.evento.nombre).toBe('Noche de Jazz');
        expect(data.evento.id).toBe(1);
    });

    it('debería manejar cuando no hay evento activo', async () => {
        const configMock = { valor: '0' };

        global.mockSupabase.from.mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: configMock, error: null })
            })
          })
        });
        
        const response = await getEventoActivo();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.evento).toBe(null);
    });
  });

  describe('POST /api/eventos/active', () => {
    it('debería cambiar el evento activo', async () => {
        const eventoMock = { id: 2, nombre: 'Rock Night', activo: true };

        // Mock para verificar evento
        global.mockSupabase.from.mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: eventoMock, error: null })
            })
          })
        });

        // Mock para actualizar configuración
        global.mockSupabase.from.mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null })
          })
        });
        
        const request = new Request('http://localhost/api/eventos/active', {
            method: 'POST',
            body: JSON.stringify({ evento_id: 2 }),
        });

        const response = await setEventoActivo(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.evento_id).toBe(2);
        expect(data.message).toContain('Rock Night');
    });

    it('debería validar ID de evento', async () => {
        const request = new Request('http://localhost/api/eventos/active', {
            method: 'POST',
            body: JSON.stringify({ evento_id: 'invalid' }),
        });

        const response = await setEventoActivo(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.message).toBe('ID de evento válido es requerido');
    });
  });

  // Pruebas para /api/eventos/stats
  describe('GET /api/eventos/stats', () => {
    it('debería obtener estadísticas de eventos', async () => {
        const eventosMock = [
          { id: 1, nombre: 'Noche de Jazz', capacidad_maxima: 100, precio_entrada: 25.00 },
          { id: 2, nombre: 'Rock Night', capacidad_maxima: 150, precio_entrada: 30.00 }
        ];

        const comandasMock = [
          { id: 1, estado: 'pagado', total: 50, metodo_pago: 'efectivo' },
          { id: 2, estado: 'pagado', total: 30, metodo_pago: 'transferencia' },
          { id: 3, estado: 'cancelado', total: 25, metodo_pago: 'efectivo' }
        ];

        // Mock para obtener eventos
        global.mockSupabase.from.mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: eventosMock, error: null })
          })
        });

        // Mock para obtener comandas del primer evento
        global.mockSupabase.from.mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: comandasMock, error: null })
          })
        });

        // Mock para obtener comandas del segundo evento
        global.mockSupabase.from.mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: [], error: null })
          })
        });
        
        const response = await getEventosStats();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.stats).toHaveLength(2);
        expect(data.stats[0].nombre_evento).toBe('Noche de Jazz');
        expect(data.stats[0].comandas_totales).toBe(3);
        expect(data.stats[0].comandas_pagadas).toBe(2);
        expect(data.stats[0].comandas_canceladas).toBe(1);
        expect(data.stats[0].total_efectivo).toBe(50);
        expect(data.stats[0].total_transferencia).toBe(30);
    });

    it('debería manejar errores al obtener estadísticas', async () => {
        global.mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { message: 'Error de base de datos' } 
            })
          })
        });
        
        const response = await getEventosStats();
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.message).toBe('Error obteniendo eventos');
    });
  });
}); 