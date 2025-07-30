import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { EventoCreate, EventoUpdate } from "@/lib/types";
import { z } from "zod";

// Esquemas de validación Zod
const EventoCreateSchema = z.object({
  nombre: z.string().min(1, "El nombre del evento es requerido").max(100, "El nombre es demasiado largo"),
  descripcion: z.string().optional(),
  fecha_inicio: z.string().datetime("Formato de fecha inválido"),
  fecha_fin: z.string().datetime("Formato de fecha inválido"),
  capacidad_maxima: z.number().positive("La capacidad debe ser un número positivo").optional(),
  precio_entrada: z.number().min(0, "El precio no puede ser negativo").optional(),
  ubicacion: z.string().optional(),
  imagen_url: z.union([z.string().url("URL de imagen inválida"), z.null()]).optional(),
}).refine((data) => {
  const fechaInicio = new Date(data.fecha_inicio);
  const fechaFin = new Date(data.fecha_fin);
  return fechaInicio < fechaFin;
}, {
  message: "La fecha de fin debe ser posterior a la fecha de inicio",
  path: ["fecha_fin"]
});

const EventoUpdateSchema = z.object({
  id: z.number().positive("ID inválido"),
  nombre: z.string().min(1, "El nombre del evento es requerido").max(100, "El nombre es demasiado largo").optional(),
  descripcion: z.string().optional(),
  fecha_inicio: z.string().datetime("Formato de fecha inválido").optional(),
  fecha_fin: z.string().datetime("Formato de fecha inválido").optional(),
  capacidad_maxima: z.number().positive("La capacidad debe ser un número positivo").optional(),
  precio_entrada: z.number().min(0, "El precio no puede ser negativo").optional(),
  ubicacion: z.string().optional(),
  imagen_url: z.union([z.string().url("URL de imagen inválida"), z.null()]).optional(),
  activo: z.boolean().optional(),
}).refine((data) => {
  if (data.fecha_inicio && data.fecha_fin) {
    const fechaInicio = new Date(data.fecha_inicio);
    const fechaFin = new Date(data.fecha_fin);
    return fechaInicio < fechaFin;
  }
  return true;
}, {
  message: "La fecha de fin debe ser posterior a la fecha de inicio",
  path: ["fecha_fin"]
});

// GET - Obtener todos los eventos
export async function GET() {
  try {
    console.log("🔔 [API] Obteniendo eventos...");
    
    const { data: eventos, error } = await supabase
      .from('eventos')
      .select('*')
      .order('fecha_inicio', { ascending: false });

    if (error) {
      console.error("🔴 [API] Error obteniendo eventos:", error);
      return NextResponse.json({ 
        success: false, 
        message: "Error al obtener eventos" 
      }, { status: 500 });
    }

    console.log("🟢 [API] Eventos obtenidos:", eventos?.length || 0, "eventos");
    return NextResponse.json({ 
      success: true, 
      eventos: eventos || [] 
    });
  } catch (error) {
    console.error("🔴 [API] Error inesperado:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error interno del servidor" 
    }, { status: 500 });
  }
}

// POST - Crear un nuevo evento
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validar datos con Zod
    const validationResult = EventoCreateSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return NextResponse.json({ 
        success: false, 
        message: `Datos inválidos: ${errors}` 
      }, { status: 400 });
    }

    const { nombre, descripcion, fecha_inicio, fecha_fin, capacidad_maxima, precio_entrada, ubicacion, imagen_url } = validationResult.data;

    console.log("🔔 [API] Creando evento:", { nombre, fecha_inicio, fecha_fin });

    // Preparar datos para inserción
    const eventoData = {
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      fecha: fecha_inicio, // Campo obligatorio en Supabase
      fecha_inicio: fecha_inicio,
      fecha_fin: fecha_fin,
      capacidad_maxima: capacidad_maxima || null,
      precio_entrada: precio_entrada || 0,
      ubicacion: ubicacion?.trim() || null,
      imagen_url: imagen_url?.trim() || null,
      activo: false // Por defecto inactivo
    };

    console.log("🔔 [API] Datos del evento a insertar:", eventoData);

    const { data, error } = await supabase
      .from('eventos')
      .insert([eventoData])
      .select()
      .single();

    if (error) {
      console.error("🔴 [API] Error en base de datos:", error);
      return NextResponse.json({ 
        success: false, 
        message: `Error al crear el evento: ${error.message}` 
      }, { status: 500 });
    }
    
    console.log("🟢 [API] Evento creado:", data.nombre);
    return NextResponse.json({ success: true, evento: data });

  } catch (error: unknown) {
    console.error("🔴 [API] Error al crear evento:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error interno del servidor" 
    }, { status: 500 });
  }
}

// PUT - Actualizar un evento
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // Validar datos con Zod
    const validationResult = EventoUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return NextResponse.json({ 
        success: false, 
        message: `Datos inválidos: ${errors}` 
      }, { status: 400 });
    }

    const { id, ...updateData } = validationResult.data;

    console.log("🔔 [API] Actualizando evento:", id);

    const { data, error } = await supabase
      .from('eventos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("🔴 [API] Error actualizando evento:", error);
      return NextResponse.json({ 
        success: false, 
        message: "Error al actualizar evento" 
      }, { status: 500 });
    }

    console.log("🟢 [API] Evento actualizado:", data.nombre);
    return NextResponse.json({ success: true, evento: data });

  } catch (error: unknown) {
    console.error("🔴 [API] Error al actualizar evento:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error interno del servidor" 
    }, { status: 500 });
  }
}

// DELETE - Eliminar un evento
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: "ID del evento es requerido" 
      }, { status: 400 });
    }

    console.log("🔔 [API] Eliminando evento:", id);

    const { error } = await supabase
      .from('eventos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("🔴 [API] Error eliminando evento:", error);
      return NextResponse.json({ 
        success: false, 
        message: "Error al eliminar evento" 
      }, { status: 500 });
    }

    console.log("🟢 [API] Evento eliminado:", id);
    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error("🔴 [API] Error al eliminar evento:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error interno del servidor" 
    }, { status: 500 });
  }
} 