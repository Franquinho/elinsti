import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("🔔 [API] Obteniendo productos activos...");
    
    const { data: productos, error } = await supabaseAdmin
      .from('productos')
      .select('*')
      .eq('activo', true)
      .order('nombre');

    if (error) {
      console.error("🔴 [API] Error obteniendo productos:", error);
      return NextResponse.json({ 
        success: false, 
        message: "Error al obtener productos" 
      }, { status: 500 });
    }

    console.log("🟢 [API] Productos obtenidos:", productos?.length || 0, "productos");
    if (productos && productos.length > 0) {
      console.log("🔔 [API] Primeros productos:", productos.slice(0, 3).map(p => ({ id: p.id, nombre: p.nombre, activo: p.activo })));
    }

    return NextResponse.json({ 
      success: true, 
      productos: productos || [] 
    });
  } catch (error) {
    console.error("🔴 [API] Error inesperado:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error interno del servidor" 
    }, { status: 500 });
  }
}