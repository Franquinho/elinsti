import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - Obtener eventos activos
export async function GET() {
  try {
    console.log("🔔 [API] Obteniendo eventos activos...");
    
    const { data: eventos, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('activo', true)
      .order('fecha_inicio', { ascending: false });

    if (error) {
      console.error("🔴 [API] Error obteniendo eventos activos:", error);
      return NextResponse.json({ 
        success: false, 
        message: "Error al obtener eventos activos" 
      }, { status: 500 });
    }

    console.log(`🟢 [API] Eventos activos encontrados: ${eventos?.length || 0}`);
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

// PUT - Establecer un evento como activo
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { eventoId, evento_id } = body;
    const eventId = eventoId || evento_id;
    
    if (!eventId) {
      return NextResponse.json({ 
        success: false, 
        message: "ID del evento es requerido" 
      }, { status: 400 });
    }

    console.log("🔔 [API] Estableciendo evento como activo:", eventId);

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
      .eq('id', eventId)
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