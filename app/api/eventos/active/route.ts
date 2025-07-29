import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - Obtener el evento activo actual
export async function GET() {
  try {
    console.log("🔔 [API] Obteniendo evento activo...");
    
    const { data: evento, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('activo', true)
      .order('fecha_inicio', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("🔴 [API] Error obteniendo evento activo:", error);
      return NextResponse.json({ 
        success: false, 
        message: "Error al obtener evento activo" 
      }, { status: 500 });
    }

    if (!evento) {
      console.log("🟡 [API] No hay evento activo en este momento");
      return NextResponse.json({ 
        success: true, 
        evento: null,
        message: "No hay evento activo en este momento" 
      });
    }

    console.log("🟢 [API] Evento activo encontrado:", evento.nombre);
    return NextResponse.json({ 
      success: true, 
      evento 
    });
  } catch (error) {
    console.error("🔴 [API] Error inesperado:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error interno del servidor" 
    }, { status: 500 });
  }
}

// PUT - Establecer un evento como activo
export async function PUT(request: Request) {
  try {
    const { eventoId } = await request.json();
    
    if (!eventoId) {
      return NextResponse.json({ 
        success: false, 
        message: "ID del evento es requerido" 
      }, { status: 400 });
    }

    console.log("🔔 [API] Estableciendo evento como activo:", eventoId);

    // Primero desactivar todos los eventos
    const { error: deactivateError } = await supabase
      .from('eventos')
      .update({ activo: false })
      .eq('activo', true);

    if (deactivateError) {
      console.error("🔴 [API] Error desactivando eventos:", deactivateError);
      return NextResponse.json({ 
        success: false, 
        message: "Error al desactivar eventos" 
      }, { status: 500 });
    }

    // Luego activar el evento seleccionado
    const { data, error } = await supabase
      .from('eventos')
      .update({ activo: true })
      .eq('id', eventoId)
      .select()
      .single();

    if (error) {
      console.error("🔴 [API] Error activando evento:", error);
      return NextResponse.json({ 
        success: false, 
        message: "Error al activar evento" 
      }, { status: 500 });
    }

    console.log("🟢 [API] Evento activado:", data.nombre);
    return NextResponse.json({ 
      success: true, 
      evento: data 
    });

  } catch (error: any) {
    console.error("🔴 [API] Error inesperado:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
} 