import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: comandas, error } = await supabaseAdmin
      .from('comandas')
      .select(`
        *,
        usuario:usuarios(nombre),
        items:comanda_items(
          cantidad,
          precio_unitario,
          subtotal,
          producto:productos(nombre, emoji)
        )
      `)
      .in('estado', ['pendiente', 'pagado'])
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error("Error obteniendo comandas:", error);
      return NextResponse.json({ 
        success: false, 
        message: "Error al obtener comandas" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      comandas: comandas || [] 
    });
  } catch (error) {
    console.error("Error inesperado:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error interno del servidor" 
    }, { status: 500 });
  }
}