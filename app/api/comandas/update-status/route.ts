import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    console.log("🔔 [API] Recibido POST en /api/comandas/update-status");
    
    const { comanda_id, estado, metodo_pago, nota } = await request.json();

    console.log("🔔 [API] Datos recibidos:", { comanda_id, estado, metodo_pago, nota });

    // Validar datos requeridos
    if (!comanda_id || !estado) {
      return NextResponse.json({ 
        success: false, 
        message: "ID de comanda y estado son requeridos" 
      }, { status: 400 });
    }

    // Validar estado válido
    if (!['pendiente', 'pagado', 'cancelado'].includes(estado)) {
      return NextResponse.json({ 
        success: false, 
        message: "Estado inválido. Debe ser: pendiente, pagado o cancelado" 
      }, { status: 400 });
    }

    // Validar método de pago si el estado es pagado
    if (estado === 'pagado' && !metodo_pago) {
      return NextResponse.json({ 
        success: false, 
        message: "Método de pago es requerido para comandas pagadas" 
      }, { status: 400 });
    }

    if (metodo_pago && !['efectivo', 'transferencia', 'invitacion'].includes(metodo_pago)) {
      return NextResponse.json({ 
        success: false, 
        message: "Método de pago inválido. Debe ser: efectivo, transferencia o invitacion" 
      }, { status: 400 });
    }

    // Actualizar la comanda
    const { data, error } = await supabase
      .from('comandas')
      .update({
        estado,
        metodo_pago: metodo_pago || null,
        nota: nota || null,
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id', comanda_id)
      .select()
      .single();

    if (error) {
      console.error("🔴 [API] Error actualizando comanda:", error);
      return NextResponse.json({ 
        success: false, 
        message: "Error al actualizar comanda" 
      }, { status: 500 });
    }

    console.log("🟢 [API] Comanda actualizada exitosamente, ID:", comanda_id);

    return NextResponse.json({ 
      success: true, 
      comanda: data,
      message: "Estado actualizado exitosamente" 
    });

  } catch (error) {
    console.error("🔴 [API] Error inesperado:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error interno del servidor" 
    }, { status: 500 });
  }
}