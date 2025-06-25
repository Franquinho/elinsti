import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET - Obtener el evento activo actual
export async function GET() {
  try {
    console.log("🔔 [API] Obteniendo evento activo...");
    
    // Primero obtener el ID del evento activo desde la configuración
    const { data: config, error: configError } = await supabaseAdmin
      .from('configuracion_sistema')
      .select('valor')
      .eq('clave', 'evento_activo_id')
      .single();

    if (configError || !config) {
      console.error("🔴 [API] Error obteniendo configuración de evento activo:", configError);
      return NextResponse.json({ 
        success: false, 
        message: "Error obteniendo configuración del evento activo" 
      }, { status: 500 });
    }

    const eventoActivoId = parseInt(config.valor);
    
    if (!eventoActivoId) {
      console.log("🟡 [API] No hay evento activo configurado");
      return NextResponse.json({ 
        success: true, 
        evento: null 
      });
    }

    // Obtener los datos del evento activo
    const { data: evento, error: eventoError } = await supabaseAdmin
      .from('eventos')
      .select('*')
      .eq('id', eventoActivoId)
      .eq('activo', true)
      .single();

    if (eventoError) {
      console.error("🔴 [API] Error obteniendo evento activo:", eventoError);
      return NextResponse.json({ 
        success: false, 
        message: "Error obteniendo evento activo" 
      }, { status: 500 });
    }

    if (!evento) {
      console.log("🟡 [API] Evento activo no encontrado o inactivo");
      return NextResponse.json({ 
        success: true, 
        evento: null 
      });
    }

    console.log("🟢 [API] Evento activo obtenido:", evento.nombre);
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

// POST - Cambiar el evento activo
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { evento_id } = body;

    if (!evento_id || typeof evento_id !== 'number') {
      return NextResponse.json({ 
        success: false, 
        message: "ID de evento válido es requerido" 
      }, { status: 400 });
    }

    // Verificar que el evento existe y está activo
    const { data: evento, error: eventoError } = await supabaseAdmin
      .from('eventos')
      .select('id, nombre, activo')
      .eq('id', evento_id)
      .single();

    if (eventoError || !evento) {
      return NextResponse.json({ 
        success: false, 
        message: "Evento no encontrado" 
      }, { status: 404 });
    }

    if (!evento.activo) {
      return NextResponse.json({ 
        success: false, 
        message: "El evento debe estar activo para poder seleccionarlo" 
      }, { status: 400 });
    }

    // Actualizar la configuración del evento activo
    const { error: updateError } = await supabaseAdmin
      .from('configuracion_sistema')
      .update({ valor: evento_id.toString() })
      .eq('clave', 'evento_activo_id');

    if (updateError) {
      console.error("🔴 [API] Error actualizando evento activo:", updateError);
      return NextResponse.json({ 
        success: false, 
        message: "Error actualizando evento activo" 
      }, { status: 500 });
    }

    console.log("🟢 [API] Evento activo cambiado a:", evento.nombre);
    return NextResponse.json({ 
      success: true, 
      message: `Evento activo cambiado a: ${evento.nombre}`,
      evento_id: evento.id
    });

  } catch (error: any) {
    console.error("🔴 [API] Error inesperado:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
} 