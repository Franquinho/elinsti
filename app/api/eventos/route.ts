import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { EventoCreate, EventoUpdate } from "@/lib/types";

// GET - Obtener todos los eventos
export async function GET() {
  try {
    console.log("🔔 [API] Obteniendo eventos...");
    
    const { data: eventos, error } = await supabaseAdmin
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
    const body: EventoCreate = await request.json();
    const { nombre, descripcion, fecha_inicio, fecha_fin, capacidad_maxima, precio_entrada, ubicacion, imagen_url } = body;

    // Validaciones
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 1) {
      return NextResponse.json({ 
        success: false, 
        message: "El nombre del evento es requerido" 
      }, { status: 400 });
    }

    if (!fecha_inicio || !fecha_fin) {
      return NextResponse.json({ 
        success: false, 
        message: "Las fechas de inicio y fin son requeridas" 
      }, { status: 400 });
    }

    if (new Date(fecha_inicio) >= new Date(fecha_fin)) {
      return NextResponse.json({ 
        success: false, 
        message: "La fecha de fin debe ser posterior a la fecha de inicio" 
      }, { status: 400 });
    }

    // Verificar que no exista un evento con el mismo nombre en el mismo período
    const { data: eventoExistente } = await supabaseAdmin
      .from('eventos')
      .select('id')
      .eq('nombre', nombre.trim())
      .gte('fecha_inicio', fecha_inicio)
      .lte('fecha_fin', fecha_fin)
      .single();

    if (eventoExistente) {
      return NextResponse.json({ 
        success: false, 
        message: "Ya existe un evento con ese nombre en el período especificado" 
      }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('eventos')
      .insert([{
        nombre: nombre.trim(),
        descripcion: descripcion?.trim(),
        fecha_inicio,
        fecha_fin,
        capacidad_maxima: capacidad_maxima || null,
        precio_entrada: precio_entrada || 0,
        ubicacion: ubicacion?.trim(),
        imagen_url: imagen_url?.trim(),
        activo: true
      }])
      .select()
      .single();

    if (error) throw error;
    
    console.log("🟢 [API] Evento creado:", data.nombre);
    return NextResponse.json({ success: true, evento: data });

  } catch (error: any) {
    console.error("🔴 [API] Error al crear evento:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
} 