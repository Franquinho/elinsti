import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log("🔔 [API] Obteniendo lista de comandas...");
    
    const { data: comandas, error } = await supabase
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
      console.error("🔴 [API] Error obteniendo comandas:", error);
      return NextResponse.json({ 
        success: false, 
        message: "Error al obtener comandas" 
      }, { status: 500 });
    }

    console.log("🟢 [API] Comandas obtenidas:", comandas?.length || 0, "comandas");
    return NextResponse.json({ 
      success: true, 
      comandas: comandas || [] 
    });
  } catch (error) {
    console.error("🔴 [API] Error inesperado:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error interno del servidor" 
    }, { status: 500 });
  }
}