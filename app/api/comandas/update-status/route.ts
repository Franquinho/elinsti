import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { comanda_id, estado, metodo_pago, nota } = await request.json();

    // Validar datos requeridos
    if (!comanda_id || !estado) {
      return NextResponse.json({ 
        success: false, 
        message: "ID de comanda y estado son requeridos" 
      }, { status: 400 });
    }

    // Actualizar la comanda
    const { data, error } = await supabaseAdmin
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
      console.error("Error actualizando comanda:", error);
      return NextResponse.json({ 
        success: false, 
        message: "Error al actualizar comanda" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      comanda: data,
      message: "Estado actualizado exitosamente" 
    });

  } catch (error) {
    console.error("Error inesperado:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error interno del servidor" 
    }, { status: 500 });
  }
}